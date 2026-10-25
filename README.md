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
Koden ligger uppdelad i `src/`. Ändra där och kör sedan `python build.py`, som bygger ihop allt.

- `src/page.html` – sidans HTML (menyer, skärmar). `/*@CSS@*/` och `/*@JS@*/` fylls i av build.py
- `src/style.css` – all CSS
- `src/order.json` – i vilken ordning JS-modulerna sätts ihop (ordningen spelar roll)
- `src/js/core/` – start, huvudloopen och kopplingen av alla knappar
- `src/js/sim/` – själva spelfysiken (ren simulering, delas av värd och gäster)
- `src/js/game/` – rendering, ljud, input, matchstart, online, replay
- `src/js/ui/` – lobby, butik, achievements, hjältar, profilkort, kistor
- `src/js/modes/` – Adventure, battle pass, raids, Arena Builder, Daily Arena, Raid Forge, weekly boss och cup
- `src/js/meta/` – redeem-koder, progression (level-väg, prestige, samlingsbok), stickers m.m.
- `src/js/art/` – all ritad kosmetika (hattar, trails, ramar, raid-bossar, prestige-märken …)
- `trepong.html` – hela spelet i en fil (byggs, används också som Claude-versionen)
- `index.html` – webbversionen för GitHub Pages (byggs)
- `peerroom.js`, `voice.js` – nätverk och röstchatt för webben
- `sw.js`, `manifest.webmanifest`, `icons/` – installera som app
- `build.py` – bygger `trepong.html` och `index.html`: `python build.py`
- `make_code.py` – gör en ny inlösningskod: `python make_code.py "MIN-KOD"`

## Inlösningskoder
Koderna ligger bara som SHA-256-hashar i `const CODES` i `src/js/meta/33-redeem.js`, så den som läser källkoden ser inte själva koden.
1. Kör `python make_code.py "GHOST-PADDLE"`.
2. Klistra in raden den skriver ut i `CODES`, byt namn och belöningar (och `end:` om koden ska sluta gälla).
3. Kör `python build.py`, committa och pusha.
Länken `https://ludvigwx.github.io/PingPing_GAME/?code=GHOSTPADDLE` öppnar inlösningen med koden ifylld.

## Live (spelare online + topplistor)
Webbversionen pratar med Firebase-projektet `trepong-c44d8` (koden ligger i `src/js/meta/36-live.js`).
- `presence/` – vem som är online och vad de gör just nu (försvinner automatiskt när någon stänger spelet)
- `boards/` – topplistorna (Daily Arena, rally per antal spelare, Tower, weekly boss, raids, level)
- Säkerhetsreglerna ligger i `database.rules.json`. Ändrar du dem: klistra in i Firebase → Realtime Database → Rules → Publish.
