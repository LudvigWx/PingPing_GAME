// TrepongVoice: lobby-style voice chat that opens between rounds. Audio goes peer to peer over WebRTC (PeerJS calls).
window.TrepongVoice = (function () {
  'use strict';
  const ls = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const ss = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const S = {
    enabled: ls('trepong-vc', '1') === '1', micId: ls('trepong-mic', ''), spkId: ls('trepong-spk', ''), pttMuted: false,
    stream: null, silent: null, net: null, offCall: null, calls: new Map(), audios: new Map(), meters: new Map(),
    open: false, ctx: null, permission: 'unknown', lastSync: 0
  };
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection);
  const sinkSupported = typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;
  function actx() { if (!S.ctx) { try { S.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (S.ctx && S.ctx.state === 'suspended') S.ctx.resume().catch(() => {}); return S.ctx; }
  function constraints() {
    const base = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
    return { audio: S.micId ? Object.assign({ deviceId: { exact: S.micId } }, base) : base, video: false };
  }
  async function getStream() {
    if (S.stream && S.stream.getAudioTracks().some(t => t.readyState === 'live')) return S.stream;
    try {
      S.stream = await navigator.mediaDevices.getUserMedia(constraints());
    } catch (e) {
      if (S.micId) { S.micId = ''; S.stream = await navigator.mediaDevices.getUserMedia(constraints()); } else throw e;
    }
    S.permission = 'granted'; applyTrack(); meter('me', S.stream);
    return S.stream;
  }
  function silentStream() {
    if (S.silent) return S.silent;
    const c = actx(); if (!c) return null;
    const d = c.createMediaStreamDestination(); S.silent = d.stream; return S.silent;
  }
  function applyTrack() { if (S.stream) S.stream.getAudioTracks().forEach(t => { t.enabled = (S.open && !S.pttMuted) || testing; }); }
  function meter(id, stream) {
    const c = actx(); if (!c || !stream || !stream.getAudioTracks().length) return;
    try {
      const old = S.meters.get(id); if (old) { try { old.src.disconnect(); } catch (e) {} }
      const src = c.createMediaStreamSource(stream), an = c.createAnalyser(); an.fftSize = 512; src.connect(an);
      S.meters.set(id, { src, an, buf: new Uint8Array(an.fftSize), lvl: 0 });
    } catch (e) {}
  }
  function level(id) {
    const m = S.meters.get(id); if (!m) return 0;
    m.an.getByteTimeDomainData(m.buf); let peak = 0;
    for (let i = 0; i < m.buf.length; i += 4) peak = Math.max(peak, Math.abs(m.buf[i] - 128));
    m.lvl = Math.max(peak/60, m.lvl*0.85); return Math.min(1, m.lvl);
  }
  function attach(id, remote) {
    let a = S.audios.get(id);
    if (!a) { a = document.createElement('audio'); a.autoplay = true; a.setAttribute('playsinline', ''); a.style.display = 'none'; document.body.appendChild(a); S.audios.set(id, a); }
    a.srcObject = remote; a.muted = !S.open;
    if (S.spkId && sinkSupported) a.setSinkId(S.spkId).catch(() => {});
    a.play().catch(() => {});
    meter(id, remote);
  }
  function hook(id, call) {
    S.calls.set(id, call);
    call.on('stream', remote => attach(id, remote));
    const end = () => { if (S.calls.get(id) === call) S.calls.delete(id); const a = S.audios.get(id); if (a) { a.srcObject = null; a.remove(); S.audios.delete(id); } S.meters.delete(id); };
    call.on('close', end); call.on('error', end);
  }
  function teardown() {
    for (const c of S.calls.values()) { try { c.close(); } catch (e) {} }
    S.calls.clear(); for (const a of S.audios.values()) { a.srcObject = null; a.remove(); } S.audios.clear();
    for (const [id] of S.meters) if (id !== 'me') S.meters.delete(id);
    if (S.offCall) { S.offCall(); S.offCall = null; }
    S.net = null; S.open = false; applyTrack();
  }
  function stopMic() { if (S.stream) { S.stream.getTracks().forEach(t => t.stop()); S.stream = null; S.meters.delete('me'); } }
  async function outStream() { try { return await getStream(); } catch (e) { S.permission = 'denied'; return silentStream(); } }
  // Called by the game every frame: net = room (or null), between = true while in lobby/card pick/after a match, ids = peer ids in the room
  async function update(net, between, ids) {
    if (!supported || !S.enabled || !net || !net.media) { if (S.net) teardown(); if (!net && !testing) stopMic(); return; }
    if (net !== S.net) {
      teardown(); S.net = net;
      S.offCall = net.media.onCall(async call => {
        if (!S.enabled) { try { call.close(); } catch (e) {} return; }
        const st = await outStream(); call.answer(st || undefined); hook(call.peer, call);
      });
    }
    const now = performance.now();
    if (now - S.lastSync > 700) {
      S.lastSync = now;
      const me = net.myId && net.myId();
      if (me) {
        for (const id of ids) if (id !== me && !S.calls.has(id) && me < id) {
          const st = await outStream(); if (!st || S.net !== net || S.calls.has(id)) continue;
          const call = net.media.call(id, st); if (call) hook(id, call);
        }
        for (const id of [...S.calls.keys()]) if (!ids.includes(id)) { try { S.calls.get(id).close(); } catch (e) {} }
      }
    }
    if (between !== S.open) {
      S.open = between; applyTrack();
      S.audios.forEach(a => { a.muted = !S.open; if (S.open) a.play().catch(() => {}); });
    }
  }
  async function devices() {
    if (!supported || !navigator.mediaDevices.enumerateDevices) return { mics: [], spks: [] };
    const list = await navigator.mediaDevices.enumerateDevices();
    return { mics: list.filter(d => d.kind === 'audioinput'), spks: list.filter(d => d.kind === 'audiooutput') };
  }
  async function requestMic() { try { await getStream(); return true; } catch (e) { S.permission = 'denied'; return false; } }
  function setMic(id) { S.micId = id || ''; ss('trepong-mic', S.micId); stopMic(); if (S.net || testing) getStream().then(st => { for (const c of S.calls.values()) { try { const snd = c.peerConnection.getSenders().find(x => x.track && x.track.kind === 'audio'); if (snd) snd.replaceTrack(st.getAudioTracks()[0]); } catch (e) {} } }).catch(() => {}); }
  function setSpk(id) { S.spkId = id || ''; ss('trepong-spk', S.spkId); if (sinkSupported) S.audios.forEach(a => a.setSinkId(S.spkId).catch(() => {})); }
  function setEnabled(on) { S.enabled = !!on; ss('trepong-vc', on ? '1' : '0'); if (!on) { teardown(); stopMic(); } }
  function setMuted(m) { S.pttMuted = !!m; applyTrack(); }
  let testing = false;
  async function startTest() { testing = true; try { const c0 = actx(); if (c0 && c0.state === 'suspended') await c0.resume().catch(()=>{}); await getStream(); if (!S.meters.has('me')) meter('me', S.stream); S.stream.getAudioTracks().forEach(t => t.enabled = true); return true; } catch (e) { return false; } }
  function stopTest() { testing = false; if (!S.net) stopMic(); else applyTrack(); }
  function testSpeaker() {
    const c = actx(); if (!c) return;
    const dst = c.createMediaStreamDestination(), o = c.createOscillator(), g = c.createGain();
    o.frequency.value = 660; g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
    o.connect(g).connect(dst); o.start(); o.stop(c.currentTime + 0.65);
    const a = document.createElement('audio'); a.srcObject = dst.stream; if (S.spkId && sinkSupported) a.setSinkId(S.spkId).catch(() => {}); a.play().catch(() => {}); setTimeout(() => a.remove(), 1200);
  }
  return {
    supported, sinkSupported, update, devices, requestMic, setMic, setSpk, setEnabled, setMuted, startTest, stopTest, testSpeaker, level,
    get enabled() { return S.enabled; }, get micId() { return S.micId; }, get spkId() { return S.spkId; }, get open() { return S.open; },
    get muted() { return S.pttMuted; }, get permission() { return S.permission; }, connectedIds() { return [...S.calls.keys()]; }
  };
})();
