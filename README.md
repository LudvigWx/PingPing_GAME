# Trepong

Neon-pingis för 2–6 spelare, direkt i webbläsaren. Spela online med kompisar med en rumskod, eller mot datorn.

**Spela:** https://ludvigwx.github.io/trepong/

## Lägen
- **Serie** – fyra matcher med buff-kort mellan varje match
- **Snabbmatch** – en match med 5 liv
- **Boss** – alla mot en boss
- **Champion Tower** – klättra våning för våning mot allt svårare bossar
- **Cup** – turnering mot datorn i ett utslagsträd

## Kontroller
- **Mobil:** dra med fingret. Två fingrar = supersmash.
- **Dator:** mus eller piltangenter. Mellanslag = supersmash, Q = hjältekraft.

## Online
Onlineläget använder [PeerJS](https://peerjs.com/) (WebRTC), så telefonerna pratar direkt med varandra.
Den som skapar ett rum är värd. Mynt, kosmetika och framsteg sparas på varje enhet.

## Filer
- `index.html` – spelet (byggs från `trepong.html`)
- `trepong.html` – källan, samma som Claude-versionen
- `peerroom.js` – nätverkslagret för webben
- `build.py` – bygger `index.html`: `python3 build.py`
