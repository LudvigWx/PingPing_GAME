// PeerRoom: a drop-in replacement for the Claude `room` capability, built on PeerJS (WebRTC).
// Star topology: the first device to claim a room code becomes the hub and relays presence to everyone else.
(function () {
  'use strict';
  const PREFIX = 'trepong-v1-';
  const SEND_MS = 33;                       // coalesce presence patches to ~30 messages a second
  function rid() { return PREFIX + 'p-' + Math.random().toString(36).slice(2, 10); }
  function merge(obj, patch) {
    const out = Object.assign({}, obj);
    for (const k in patch) { if (patch[k] === null) delete out[k]; else out[k] = patch[k]; }
    return out;
  }
  function makeRoom(name) {
    const hubId = PREFIX + String(name).replace(/[^a-z0-9-]/gi, '').toLowerCase();
    let peer = null, isHub = false, myId = null, hubConn = null, open = false, closed = false;
    const conns = new Map();               // hub only: peerId -> DataConnection
    let table = new Map();                 // peerId -> presence object
    let pending = null, sendTimer = null, snapshot = Object.freeze([]), listeners = new Set(), notifyQueued = false;
    function rebuild() {
      snapshot = Object.freeze(Array.from(table.entries()).map(([id, pr]) => Object.freeze({ peer: id, sameTab: id === myId, isMe: id === myId, kind: 'viewer', guest: false, by: null, presence: pr, updatedAt: Date.now() })));
    }
    function notify() {
      rebuild();
      if (notifyQueued) return; notifyQueued = true;
      (window.requestAnimationFrame || setTimeout)(() => { notifyQueued = false; const ch = { peers: snapshot, joined: [], left: [], updated: [] }; listeners.forEach(fn => { try { fn(ch); } catch (e) { console.error(e); } }); });
    }
    function setPresence(id, patch) { table.set(id, merge(table.get(id) || {}, patch)); notify(); }
    function broadcast(msg, except) { for (const [id, c] of conns) if (id !== except && c.open) { try { c.send(msg); } catch (e) {} } }
    // ----- hub side -----
    function hubAccept(conn) {
      conn.on('open', () => {
        conns.set(conn.peer, conn);
        const all = {}; for (const [id, pr] of table) all[id] = pr;
        conn.send({ t: 'all', you: conn.peer, map: all });
        if (!table.has(conn.peer)) setPresence(conn.peer, {});
      });
      conn.on('data', msg => {
        if (!msg || typeof msg !== 'object') return;
        if (msg.t === 'p' && msg.patch && typeof msg.patch === 'object') {
          setPresence(conn.peer, msg.patch);
          broadcast({ t: 'p', id: conn.peer, patch: msg.patch }, conn.peer);
        }
      });
      const drop = () => { if (!conns.has(conn.peer)) return; conns.delete(conn.peer); table.delete(conn.peer); notify(); broadcast({ t: 'left', id: conn.peer }); };
      conn.on('close', drop); conn.on('error', drop);
    }
    // ----- spoke side -----
    function spokeConnect() {
      hubConn = peer.connect(hubId, { reliable: true, serialization: 'json' });
      hubConn.on('open', () => { open = true; if (pending) flush(true); });
      hubConn.on('data', msg => {
        if (!msg || typeof msg !== 'object') return;
        if (msg.t === 'all' && msg.map) { const mine = table.get(myId) || {}; table = new Map(Object.entries(msg.map)); table.set(myId, mine); notify(); }
        else if (msg.t === 'p') setPresence(msg.id, msg.patch || {});
        else if (msg.t === 'left') { table.delete(msg.id); notify(); }
      });
      const lost = () => { open = false; const mine = table.get(myId) || {}; table = new Map([[myId, mine]]); notify(); };
      hubConn.on('close', lost); hubConn.on('error', lost);
    }
    function flush(force) {
      sendTimer = null;
      if (!pending || closed) return;
      const patch = pending; pending = null;
      if (isHub) broadcast({ t: 'p', id: myId, patch });
      else if (hubConn && hubConn.open) { try { hubConn.send({ t: 'p', patch }); } catch (e) {} }
      else if (!force) pending = merge(patch, pending || {});
    }
    function start(resolve, reject) {
      // Try to become the hub; if the id is taken, someone else hosts this code, so connect to them.
      peer = new Peer(hubId, { debug: 0 });
      let settled = false;
      peer.on('open', id => { isHub = true; myId = id; open = true; table.set(myId, table.get(myId) || {}); notify(); settled = true; resolve(api); });
      peer.on('connection', c => { if (isHub) hubAccept(c); else c.close(); });
      peer.on('error', err => {
        if (!settled && err && err.type === 'unavailable-id') {
          try { peer.destroy(); } catch (e) {}
          peer = new Peer(rid(), { debug: 0 });
          peer.on('open', id => { isHub = false; myId = id; table.set(myId, {}); notify(); spokeConnect(); settled = true; resolve(api); });
          peer.on('error', e2 => { if (!settled) { settled = true; reject(e2); } else if (e2 && e2.type === 'peer-unavailable') { open = false; } });
          peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });
        } else if (!settled) { settled = true; reject(err); }
      });
      peer.on('disconnected', () => { if (!closed) { try { peer.reconnect(); } catch (e) {} } });
      setTimeout(() => { if (!settled) { settled = true; reject(new Error('timeout')); } }, 12000);
    }
    const api = {
      name,
      isHub() { return isHub; },
      presence(patch) {
        if (closed) return Promise.resolve();
        if (!patch || typeof patch !== 'object') return Promise.resolve();
        if (myId) setPresence(myId, patch);
        pending = merge(pending || {}, patch);
        // keep explicit nulls so removals reach the others
        for (const k in patch) if (patch[k] === null) pending[k] = null;
        if (!sendTimer) sendTimer = setTimeout(() => flush(false), SEND_MS);
        return Promise.resolve();
      },
      peers() { return snapshot; },
      onPeers(fn, onError) { listeners.add(fn); setTimeout(() => { try { fn({ peers: snapshot, joined: snapshot, left: [], updated: [] }); } catch (e) {} }, 0); return () => listeners.delete(fn); },
      connected() { return !closed && open && (isHub || (hubConn && hubConn.open)); },
      onConnection(fn) { const t = setInterval(() => fn(api.connected()), 1000); return () => clearInterval(t); },
      emit() { return Promise.resolve(); },
      on() { return () => {}; },
      leave() {
        closed = true; listeners.clear();
        try { for (const c of conns.values()) c.close(); if (hubConn) hubConn.close(); } catch (e) {}
        try { peer && peer.destroy(); } catch (e) {}
        return Promise.resolve();
      }
    };
    return new Promise(start);
  }
  window.PeerRoom = {
    available() { return typeof window.Peer === 'function'; },
    join(name) { return makeRoom(name); }
  };
})();
