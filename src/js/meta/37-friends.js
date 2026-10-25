// ---------- friends: friend codes, requests, profiles and match invites (Firebase, web version only) ----------
// users/<uid> = { n, code, card (JSON), t }   codes/<CODE> = uid
// requests/<to>/<from> = { n, t }             friends/<uid>/<friendUid> = true
// invites/<to>/<from> = { n, room, t }
const Friends = { code: '', list: {}, users: {}, reqs: {}, invites: {}, pubT: 0, viewing: null, inviteShown: {} };
const FCODE_CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function fRef(p) { return Live.db.ref(p); }
function fNow() { return firebase.database.ServerValue.TIMESTAMP; }
async function friendsInit() {
  if (!Live.ok || Friends.started) return; Friends.started = true;
  const me = Live.uid;
  // my friend code: reuse the saved one, otherwise claim a fresh one
  try {
    const u = (await fRef('users/' + me).once('value')).val();
    Friends.code = (u && u.code) || '';
    for (let tries = 0; !Friends.code && tries < 6; tries++) {
      const c = Array.from({ length: 6 }, () => FCODE_CH[Math.floor(Math.random()*FCODE_CH.length)]).join('');
      try { await fRef('codes/' + c).set(me); Friends.code = c; } catch (e) {}
    }
  } catch (e) {}
  friendsPublish(true);
  fRef('friends/' + me).on('value', s => { Friends.list = s.val() || {}; for (const f in Friends.list) friendsWatchUser(f); syncFriendsUI(); });
  fRef('requests/' + me).on('value', s => { Friends.reqs = s.val() || {}; syncFriendsUI(); });
  fRef('invites/' + me).on('value', s => { Friends.invites = s.val() || {}; syncFriendsUI(); friendsShowInvite(); });
  try { const q = new URLSearchParams(location.search).get('friend'); if (q) { history.replaceState(null, '', location.pathname); setTimeout(() => { openFriends(); $('#friendIn').value = q.toUpperCase(); }, 600); } } catch (e) {}
}
function friendsWatchUser(f) { if (Friends.users[f] !== undefined) return; Friends.users[f] = null; fRef('users/' + f).on('value', s => { Friends.users[f] = s.val(); syncFriendsUI(); }); }
function friendsPublish(force) { // what friends see of you: name, friend code and your profile card
  if (!Live.ok || !Friends.code) return;
  const now = Date.now(); if (!force && now - Friends.pubT < 20000) return; Friends.pubT = now;
  fRef('users/' + Live.uid).set({ n: myName().slice(0, 16), code: Friends.code, card: JSON.stringify(myCardData()).slice(0, 6000), t: fNow() }).catch(() => {});
}
function friendOnline(f) { const p = Live.online.find(x => x.id === f); return p || null; }
function fmtAgo(t) { const m = Math.max(0, Math.round((liveNow() - (t || 0))/60000)); return m < 2 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m/60) + ' h ago' : Math.round(m/1440) + ' days ago'; }
async function sendFriendRequest() {
  const code = $('#friendIn').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const msg = t => { $('#friendMsg').textContent = t; };
  if (!Live.ok) return msg('Not connected yet. Try again in a moment.');
  if (code.length !== 6) return msg('A friend code has 6 letters and digits.');
  if (code === Friends.code) return msg('That is your own code 😄');
  const uid = (await fRef('codes/' + code).once('value').catch(() => null))?.val();
  if (!uid) return msg('No player with that code.');
  if (Friends.list[uid]) return msg('You are already friends!');
  if (Friends.reqs[uid]) return acceptFriend(uid); // they already asked you
  try { await fRef('requests/' + uid + '/' + Live.uid).set({ n: myName().slice(0, 16), t: fNow() }); msg('Friend request sent! ✉️'); $('#friendIn').value = ''; tone(880, 0.08, 'triangle', 0.05); }
  catch (e) { msg('Could not send the request.'); }
}
async function acceptFriend(f) {
  try { await fRef('friends/' + Live.uid + '/' + f).set(true); await fRef('friends/' + f + '/' + Live.uid).set(true); await fRef('requests/' + Live.uid + '/' + f).remove(); toast('You are now friends! 🤝'); sfx.coin(); track('friends'); }
  catch (e) { toast('Could not accept the request.'); }
}
function declineFriend(f) { fRef('requests/' + Live.uid + '/' + f).remove().catch(() => {}); }
async function removeFriend(f) {
  try { await fRef('friends/' + Live.uid + '/' + f).remove(); await fRef('friends/' + f + '/' + Live.uid).remove(); } catch (e) {}
  closeFriendCard(); toast('Friend removed.');
}
async function inviteFriend(f) {
  if (!Live.ok) return;
  if (mode !== 'host') { if (mode === 'guest') { toast('Only the host of a room can invite.'); return; } await hostCreate(); }
  if (mode !== 'host' || !roomCode) { toast('Could not create a room.'); return; }
  try { await fRef('invites/' + f + '/' + Live.uid).set({ n: myName().slice(0, 16), room: roomCode, t: fNow() }); toast('Invite sent to ' + ((Friends.users[f] || {}).n || 'your friend') + '! 📨'); }
  catch (e) { toast('Could not send the invite.'); }
}
function friendsShowInvite() {
  const now = liveNow(), box = $('#inviteBox');
  const entry = Object.entries(Friends.invites).find(([f, v]) => v && now - (v.t || 0) < 180000 && !Friends.inviteShown[f + ':' + v.t]);
  if (!entry || !box.hidden || mode === 'host' || mode === 'guest') return;
  const [f, v] = entry; Friends.inviteShown[f + ':' + v.t] = 1;
  box.dataset.f = f; box.dataset.room = v.room; $('#inviteTxt').textContent = (cleanName(v.n) || 'A friend') + ' invites you to play!';
  box.hidden = false; tone(784, 0.12, 'triangle', 0.06); tone(1046, 0.2, 'triangle', 0.06, 1, 0.12); buzz([40, 40, 80]);
}
async function answerInvite(join) {
  const box = $('#inviteBox'), f = box.dataset.f, room = box.dataset.room; box.hidden = true;
  fRef('invites/' + Live.uid + '/' + f).remove().catch(() => {});
  if (join && room) { if (st && mode === 'practice') await leave(); showScreen('menu'); $('#code').value = room; guestJoin(); }
  setTimeout(friendsShowInvite, 500);
}
// ----- UI -----
function syncFriendsUI() {
  const nReq = Object.keys(Friends.reqs).length, b = $('#friendsBadge');
  $('#btnFriends').hidden = !Live.ok; b.hidden = !nReq; b.textContent = nReq;
  if (curScreen === 'friends') renderFriends();
  if (curScreen === 'lobby') $('#btnLobbyInvite').hidden = !(Live.ok && mode === 'host' && Object.keys(Friends.list).length);
}
let friendsBack = 'menu';
function openFriends() { friendsBack = mode === 'host' || mode === 'guest' ? 'lobby' : 'menu'; showScreen('friends'); $('#friendMsg').textContent = ''; renderFriends(); }
function renderFriends() {
  $('#myFriendCode').textContent = Friends.code || '······';
  const rq = $('#friendReqs'); rq.textContent = '';
  const reqs = Object.entries(Friends.reqs);
  $('#friendReqHead').hidden = !reqs.length;
  for (const [f, v] of reqs) {
    const row = document.createElement('div'); row.className = 'frow req';
    row.append(Object.assign(document.createElement('b'), { textContent: cleanName(v && v.n) || 'Player' }), Object.assign(document.createElement('small'), { textContent: 'wants to be friends' }));
    const a = document.createElement('button'); a.type = 'button'; a.className = 'primary'; a.textContent = 'Accept'; a.addEventListener('click', () => acceptFriend(f));
    const d = document.createElement('button'); d.type = 'button'; d.textContent = 'Decline'; d.addEventListener('click', () => declineFriend(f));
    row.append(a, d); rq.append(row);
  }
  const box = $('#friendList'); box.textContent = '';
  const ids = Object.keys(Friends.list).sort((a, b) => (!!friendOnline(b) - !!friendOnline(a)) || String((Friends.users[a] || {}).n).localeCompare(String((Friends.users[b] || {}).n)));
  if (!ids.length) box.append(Object.assign(document.createElement('p'), { className: 'note', textContent: 'No friends yet. Share your code, or type a friend\'s code above.' }));
  for (const f of ids) {
    const u = Friends.users[f] || {}, on = friendOnline(f), row = document.createElement('div'); row.className = 'frow' + (on ? ' on' : '');
    let lvTxt = ''; try { const c = JSON.parse(u.card || '{}'); lvTxt = (c.pr ? 'P' + ROMAN[c.pr] + ' · ' : '') + 'Lv ' + (c.lv || 1); } catch (e) {}
    const info = document.createElement('div'); info.className = 'finfo';
    info.append(Object.assign(document.createElement('b'), { textContent: (cleanName(u.n) || 'Player') }), Object.assign(document.createElement('small'), { textContent: lvTxt + ' · ' + (on ? '🟢 ' + (LIVE_MODES[on.m] || 'Online') : 'last seen ' + fmtAgo(u.t)) }));
    const pb = document.createElement('button'); pb.type = 'button'; pb.textContent = 'Profile'; pb.addEventListener('click', () => openFriendCard(f));
    const ib = document.createElement('button'); ib.type = 'button'; ib.className = 'primary'; ib.textContent = 'Invite'; ib.disabled = !on || mode === 'guest'; ib.addEventListener('click', () => inviteFriend(f));
    row.append(Object.assign(document.createElement('i'), { className: 'fdot' }), info, pb, ib); box.append(row);
  }
}
function openFriendCard(f) {
  const u = Friends.users[f] || {}; let d = null; try { d = validCard(JSON.parse(u.card || '{}')); } catch (e) { d = validCard({}); }
  Friends.viewing = { f, d }; $('#friendCard').hidden = false;
  const on = friendOnline(f);
  $('#fcStatus').textContent = on ? '🟢 Online · ' + (LIVE_MODES[on.m] || '') : 'Last seen ' + fmtAgo(u.t);
  $('#btnFcInvite').disabled = !on || mode === 'guest';
}
function closeFriendCard() { Friends.viewing = null; $('#friendCard').hidden = true; }
function drawFriendCard() { if (!Friends.viewing) return; const cv = $('#fcCv'); drawCard(cv.getContext('2d'), Friends.viewing.d, clock); }
