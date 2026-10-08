#!/usr/bin/env python3
"""Builds the standalone web version (index.html) from the Claude artifact source (trepong.html).
The only real difference: online play goes through PeerJS (peerroom.js) instead of the Claude room."""
import sys, pathlib
here = pathlib.Path(__file__).resolve().parent
src = (here / 'trepong.html').read_text(encoding='utf-8')
src = src.replace('<meta charset="utf-8">\n', '', 1)
adapter = (here / 'peerroom.js').read_text(encoding='utf-8') + '\n' + (here / 'voice.js').read_text(encoding='utf-8')

def rep(a, b):
    global src
    if src.count(a) != 1: sys.exit('build: anchor not found exactly once:\n' + a[:120])
    src = src.replace(a, b)

# 1) online layer -> PeerJS
rep("  try { roomNS = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; }",
    "  try { roomNS = window.PeerRoom && window.PeerRoom.available() ? window.PeerRoom : null; }")
rep("""async function joinNet(code) {
  try { const r = await roomNS.join('trepong-' + code); joinedNamed = true; return r; }
  catch (e) { joinedNamed = false; return roomNS; }
}""", """async function joinNet(code) {
  try { const r = await roomNS.join('trepong-' + code); joinedNamed = true; return r; }
  catch (e) { joinedNamed = false; return null; }
}""")
rep("""  roomCode = String(Math.floor(1000 + Math.random()*9000));
  net = await joinNet(roomCode);""", """  net = null;
  for (let tries = 0; tries < 5 && !net; tries++) {
    roomCode = String(Math.floor(1000 + Math.random()*9000));
    net = await joinNet(roomCode);
    if (net && !net.isHub()) { await net.leave(); net = null; }   // code already in use somewhere: pick another
  }
  if (!net) { btn.disabled = false; btn.textContent = 'Create room'; toast('Could not create a room. Check your internet and try again.'); return; }""")
rep("""  roomCode = code; net = await joinNet(code);""", """  roomCode = code; net = await joinNet(code);
  if (net && net.isHub()) { await net.leave(); net = null; btn.disabled = false; btn.textContent = 'Join'; toast('No room found with code ' + code + '.'); return; }
  if (!net) { btn.disabled = false; btn.textContent = 'Join'; toast('Could not connect. Check your internet and try again.'); return; }""")
# 2) texts that mention Claude
rep("note.textContent = 'Online play only works when the page is open while signed in to Claude. Practice still works.';",
    "note.textContent = 'Could not load online play. Check your internet and reload the page. Practice still works.';")
rep("p.textContent = 'The leaderboard shows when the page is open while signed in to Claude.';",
    "p.textContent = 'The shared leaderboard lives in the Claude version. Your best time is saved on this device.';")

head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Trepong – neon ping pong for 2–6 players. Play online with friends or against bots, right in your browser.">
<meta name="theme-color" content="#0C0A1C">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230C0A1C'/%3E%3Cpath d='M32 12 54 50H10Z' fill='none' stroke='%233EE6FF' stroke-width='5' stroke-linejoin='round'/%3E%3Ccircle cx='32' cy='38' r='5' fill='%23FF4F8B'/%3E%3C/svg%3E">
<style>html,body{margin:0}body{-webkit-text-size-adjust:100%}</style>
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<script>
""" + adapter + """
</script>
</head>
<body>
"""
out = head + src + "\n</body>\n</html>\n"
(here / 'index.html').write_text(out, encoding='utf-8')
print('built index.html', len(out)//1024, 'KB')
