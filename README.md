# Trepong

Neon-pingis för 2–6 spelare, direkt i webbläsaren. Spela online med kompisar med en rumskod, eller mot datorn.

**Spela:** https://ludvigwx.github.io/PingPing_GAME/

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
- `make_code.py` – gör en ny inlösningskod: `python make_code.py "MIN-KOD"`

## Inlösningskoder
Koderna ligger bara som SHA-256-hashar i `const CODES` i `trepong.html`, så den som läser källkoden ser inte själva koden.
1. Kör `python make_code.py "GHOST-PADDLE"`.
2. Klistra in raden den skriver ut i `CODES`, byt namn och belöningar (och `end:` om koden ska sluta gälla).
3. Kör `python build.py`, committa och pusha.
Länken `https://ludvigwx.github.io/PingPing_GAME/?code=GHOSTPADDLE` öppnar inlösningen med koden ifylld.
