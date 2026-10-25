// ----- raid boon vote (UI + host tally) -----
let myVote = null, voteBuilt = '', voteAnnounced = '';
function voteHumans() { return st ? alivePlayers(st).filter(i => i === mySeat || (mode === 'host' && hostSeats[i])) : []; }
function voteCounts(V) { const c = [0, 0, 0]; for (const k in V.v) if (V.v[k] >= 0 && V.v[k] < 3) c[V.v[k]]++; return c; }
function hostVote() {
  const V = st.vote; if (!V || V.done >= 0) return;
  const hum = voteHumans(), all = hum.length > 0 && hum.every(i => V.v[i] != null);
  if (!all && st.t > 3 && st.ph === 'cd') return;
  const c = voteCounts(V), mx = Math.max(...c.slice(0, V.o.length));
  const top = V.o.map((_, k) => k).filter(k => c[k] === mx); // a tie (or no votes) is settled at random
  V.done = top[Math.floor(Math.random()*top.length)];
  applyBoon(st, V.o[V.done]); st.t = Math.min(st.t, 3);
}
function castVote(k) {
  const V = st && st.vote; if (!V || V.done >= 0 || k >= V.o.length || !st.alive[mySeat]) return;
  myVote = [V.r, k]; tone(520 + k*120, 0.07, 'sine', 0.05); buzz([15]);
  if (mode === 'guest') { if (net) net.presence({ vote: myVote }).catch(() => {}); }
  else V.v[mySeat] = k;
  voteBuilt = ''; voteUI();
}
function voteUI() {
  const box = $('#voteBox'), V = st && st.raid && st.vote;
  const show = !!(V && V.done < 0 && st.ph === 'cd' && mySeat >= 0 && !replay && mode !== 'menu');
  if (!show) { if (!box.hidden) box.hidden = true; }
  else {
    const c = mode === 'guest' ? (V.c || [0, 0, 0]) : voteCounts(V), mine = myVote && myVote[0] === V.r ? myVote[1] : -1;
    const key = st.mid + ':' + V.r + ':' + c.join(',') + ':' + mine + ':' + V.o.join(',');
    if (key !== voteBuilt) {
      voteBuilt = key; const opts = $('#voteOpts'); opts.textContent = '';
      V.o.forEach((id, k) => {
        const B = BOONS[id], b = document.createElement('button'); b.type = 'button'; b.className = 'vopt' + (mine === k ? ' mine' : '');
        b.append(Object.assign(document.createElement('i'), { textContent: B[2] }), Object.assign(document.createElement('b'), { textContent: B[0] }),
          Object.assign(document.createElement('small'), { textContent: B[1] }), Object.assign(document.createElement('span'), { className: 'vdots', textContent: c[k] ? '●'.repeat(c[k]) : '·' }));
        b.addEventListener('click', () => castVote(k)); opts.append(b);
      });
      const hum = mode === 'guest' ? null : voteHumans();
      $('#voteNote').textContent = (mode === 'guest' || (hum && hum.length > 1)) ? 'One vote each. Most votes wins; a tie is settled at random.' : 'Your call! (Bots don\'t vote.)';
    }
    box.hidden = false;
    $('#voteTime').textContent = Math.max(0, Math.ceil(st.t - 3)) + 's';
  }
  if (V && V.done >= 0 && voteAnnounced !== st.mid + ':' + V.r) {
    voteAnnounced = st.mid + ':' + V.r; const B = BOONS[V.o[V.done]];
    if (B) { banner = { text: B[2] + ' ' + B[0].toUpperCase(), sub: B[1], col: '#7CFFB2', t: 0 }; tone(660, 0.12, 'triangle', 0.05); tone(990, 0.2, 'triangle', 0.05, 1, 0.1); }
  }
}
