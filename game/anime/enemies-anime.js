/* ============================================================================
   enemies-anime.js — 30 врагов и 7 боссов в стиле китайского аниме (сянься/уся)
   ----------------------------------------------------------------------------
   Подключается ПОСЛЕ hanzi-data.js и ДО игрового скрипта:
       <script src="hanzi-data.js"></script>
       <script src="enemies-anime.js"></script>
       <script> …игра… </script>

   Файл самодостаточен: он не правит игру, а предоставляет ей данные и арт.
   Игра берёт отсюда:
     window.ANIME_ENEMIES  — 30 обычных врагов (art, name, hp, atk, atkTime, color)
     window.ANIME_BOSSES   — 7 боссов (то же + титул и своя тема)
     window.ANIME_ART      — id арта -> функция(стадия) -> строка SVG
     window.animeArtSVG(id, stage)  — получить SVG нужной стадии
     window.animeStageFor(round)    — стадия (1..4) по номеру хода
     window.animeMood(id, stage)    — палитра стадии (для рамки/свечения)

   ВИЗУАЛЬНЫЕ СТАДИИ
   С ростом уровня враг не просто «толстеет»: у него появляются новые детали.
     1 — обычный вид
     2 — загораются глаза, появляется малый ореол ци
     3 — доспех/шипы/второй слой ауры, в руках оружие
     4 — большое кольцо ци, парящие руны, усиленная палитра
   Стадия считается от номера круга: каждые 10 ходов +1 стадия, максимум 4.
============================================================================ */
(function(){
"use strict";

/* ---------------------------------------------------------------------------
   СТАДИИ
   --------------------------------------------------------------------------- */
function animeStageFor(round){
  const st = 1 + Math.floor((round|0) / 10);
  return Math.max(1, Math.min(4, st));
}

/* Палитра стадии: чем выше стадия, тем плотнее аура и ярче свечение.
   Значения — готовые цвета, чтобы не считать их в SVG на каждый кадр. */
const STAGE_GLOW = [
  { glow:"rgba(255,255,255,0)",  ring:"rgba(255,255,255,0)",   eye:"#fff6c9", aura:0,   orbit:0 },
  { glow:"rgba(255,230,150,.55)", ring:"rgba(255,209,102,.35)", eye:"#fff0a8", aura:1,   orbit:0 },
  { glow:"rgba(255,190,90,.75)",  ring:"rgba(255,150,80,.45)",  eye:"#ffd166", aura:2,   orbit:3 },
  { glow:"rgba(255,120,220,.85)", ring:"rgba(180,120,255,.55)", eye:"#ff7bd5", aura:3,   orbit:5 },
];

/* ---------------------------------------------------------------------------
   ОБЩИЕ ФРАГМЕНТЫ АРТА
   Рисуем в системе 200x232 (как в исходном файле), чтобы CSS-анимации
   персонажа (c-body, c-head, c-wing-l и т. д.) работали без правок.
   --------------------------------------------------------------------------- */

/* Сияющие глаза в аниме-стиле: крупные, с бликом и цветной радужкой. */
function eyes(cx1, cx2, cy, r, col, stage){
  const g = STAGE_GLOW[stage-1];
  const glow = stage>=2 ? ` filter="url(#anGlow)"` : "";
  return `
    <g${glow}>
      <ellipse cx="${cx1}" cy="${cy}" rx="${r}" ry="${r*1.15}" fill="#141a33"/>
      <ellipse cx="${cx2}" cy="${cy}" rx="${r}" ry="${r*1.15}" fill="#141a33"/>
      <ellipse cx="${cx1}" cy="${cy}" rx="${r*0.72}" ry="${r*0.86}" fill="${col}"/>
      <ellipse cx="${cx2}" cy="${cy}" rx="${r*0.72}" ry="${r*0.86}" fill="${col}"/>
      <circle cx="${cx1-r*0.25}" cy="${cy-r*0.35}" r="${r*0.30}" fill="#ffffff" opacity=".95"/>
      <circle cx="${cx2-r*0.25}" cy="${cy-r*0.35}" r="${r*0.30}" fill="#ffffff" opacity=".95"/>
      <circle cx="${cx1+r*0.30}" cy="${cy+r*0.40}" r="${r*0.16}" fill="#ffffff" opacity=".6"/>
      <circle cx="${cx2+r*0.30}" cy="${cy+r*0.40}" r="${r*0.16}" fill="#ffffff" opacity=".6"/>
    </g>`;
}

/* Брови «решительные» — характерная аниме-черта. */
function brows(cx1, cx2, cy, col, w){
  w = w || 3.4;
  return `
    <path d="M${cx1-13} ${cy} q13 -8 26 -2" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="M${cx2+13} ${cy} q-13 -8 -26 -2" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
}

/* Аура ци: кольца за телом. Появляется со 2-й стадии. */
function aura(stage, col, cx, cy, r){
  const n = STAGE_GLOW[stage-1].aura;
  if(!n) return "";
  let out = "";
  for(let i=0;i<n;i++){
    const rr = r + i*16;
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${rr}" ry="${rr*1.08}" fill="none" ` +
           `stroke="${col}" stroke-width="${(3-i*0.6).toFixed(1)}" opacity="${(0.30-i*0.07).toFixed(2)}"/>`;
  }
  return `<g class="c-aura">${out}</g>`;
}

/* Парящие руны: на 3-й стадии 3 штуки, на 4-й — 5. */
function orbitRunes(stage, col, cx, cy, r){
  const n = STAGE_GLOW[stage-1].orbit;
  if(!n) return "";
  const glyphs = ["气","力","火","水","风","雷","光"];
  let out = "";
  for(let i=0;i<n;i++){
    const a = (Math.PI*2*i/n) - Math.PI/2;
    const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r*0.62;
    out += `<g class="c-rune"><rect x="${(x-11).toFixed(1)}" y="${(y-11).toFixed(1)}" width="22" height="22" rx="5" ` +
           `fill="rgba(12,16,36,.72)" stroke="${col}" stroke-width="2"/>` +
           `<text x="${x.toFixed(1)}" y="${(y+6).toFixed(1)}" font-size="14" fill="${col}" ` +
           `text-anchor="middle" font-family="serif">${glyphs[i % glyphs.length]}</text></g>`;
  }
  return out;
}

/* Общая «шапка» SVG: градиенты и фильтр свечения.
   ВАЖНО: svgOpen только ОТКРЫВАЕТ <svg>, а закрывает его обёртка art()
   в конце файла. Так каждая фигура не обязана помнить про </svg>. */
function svgOpen(w, h, uid){
  return `<svg viewBox="0 0 ${w} ${h}" class="charSvg" aria-hidden="true">
  <defs>
    <filter id="anGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="anSoft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <radialGradient id="anAura${uid}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,.28)"/>
      <stop offset="70%" stop-color="rgba(255,255,255,.06)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>`;
}
/* Обёртка: рисует фигуру и гарантированно закрывает <svg>.
   Используется как def(id, stage => svgOpen(...) + ...тело...). */
function def(id, fn){
  ART[id] = function(stage){
    let body = fn(stage);
    /* если фигура сама закрыла svg — не дублируем */
    if(!/<\/svg>\s*$/.test(body)) body += "\n</svg>";
    return body;
  };
}
function shadow(cx, cy, rx, ry){
  return `<ellipse class="c-shadow" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(0,0,0,.30)"/>`;
}

/* ---------------------------------------------------------------------------
   30 ВРАГОВ
   Разбиты на 6 «семейств» по 5 — по мере роста круга семейства идут по кругу,
   поэтому сложность растёт и от статов, и от смены облика.
   --------------------------------------------------------------------------- */
const ANIME_ENEMIES = [
  /* --- 1. ЛЕСНАЯ НЕЧИСТЬ ------------------------------------------------ */
  {art:"an-foxling",  name:"Лисёнок-оборотень", hp:68,  atk:13, atkTime:11.0, color:"#ffb86b", fam:"fox"},
  {art:"an-spore",    name:"Спорочник",         hp:74,  atk:14, atkTime:10.7, color:"#9be8b0", fam:"fox"},
  {art:"an-bamboob",  name:"Бамбуковый дух",    hp:80,  atk:15, atkTime:10.4, color:"#a8e06a", fam:"fox"},
  {art:"an-mushroom", name:"Гриб-прилипала",    hp:86,  atk:16, atkTime:10.1, color:"#ff9bd0", fam:"fox"},
  {art:"an-raccoon",  name:"Енот-вор",          hp:92,  atk:17, atkTime:9.8,  color:"#c9a06a", fam:"fox"},

  /* --- 2. ВОДНЫЕ ТВАРИ -------------------------------------------------- */
  {art:"an-koi",      name:"Карп-дракон",       hp:100, atk:18, atkTime:9.6,  color:"#6bd5ff", fam:"water"},
  {art:"an-jelly",    name:"Медуза-фонарь",     hp:106, atk:19, atkTime:9.4,  color:"#b48bff", fam:"water"},
  {art:"an-crab",     name:"Краб-панцирник",    hp:114, atk:20, atkTime:9.2,  color:"#ff8b6b", fam:"water"},
  {art:"an-eel",      name:"Угорь-разрядник",   hp:120, atk:21, atkTime:9.0,  color:"#8bf0ff", fam:"water"},
  {art:"an-turtle",   name:"Черепаха-остров",   hp:132, atk:22, atkTime:8.8,  color:"#7dffb0", fam:"water"},

  /* --- 3. ГОРНЫЕ ДУХИ --------------------------------------------------- */
  {art:"an-stone",    name:"Каменный страж",    hp:140, atk:23, atkTime:8.6,  color:"#c2c9d8", fam:"stone"},
  {art:"an-goat",     name:"Горный козёл",      hp:146, atk:24, atkTime:8.5,  color:"#e0c07a", fam:"stone"},
  {art:"an-crane",    name:"Журавль-клирик",    hp:152, atk:25, atkTime:8.4,  color:"#f0f4ff", fam:"stone"},
  {art:"an-monkey",   name:"Обезьяна-воин",     hp:160, atk:26, atkTime:8.2,  color:"#ffb36b", fam:"stone"},
  {art:"an-tiger",    name:"Тигр-полководец",   hp:172, atk:27, atkTime:8.0,  color:"#ffd166", fam:"stone"},

  /* --- 4. ОГНЕННЫЕ И ГРОЗОВЫЕ ------------------------------------------- */
  {art:"an-ember",    name:"Искра-дух",         hp:180, atk:28, atkTime:7.9,  color:"#ff9a4d", fam:"fire"},
  {art:"an-lantern",  name:"Фонарь-людоед",     hp:188, atk:29, atkTime:7.8,  color:"#ffcf5c", fam:"fire"},
  {art:"an-thunder",  name:"Гром-вестник",      hp:196, atk:30, atkTime:7.7,  color:"#ffe066", fam:"fire"},
  {art:"an-censer",   name:"Курильница-демон",  hp:206, atk:31, atkTime:7.6,  color:"#c48bff", fam:"fire"},
  {art:"an-phoenix",  name:"Феникс-страж",      hp:220, atk:33, atkTime:7.5,  color:"#ff7b5c", fam:"fire"},

  /* --- 5. ЛЕДЯНЫЕ И ЛУННЫЕ ---------------------------------------------- */
  {art:"an-frost",    name:"Морозный дух",      hp:230, atk:34, atkTime:7.4,  color:"#a8e6ff", fam:"ice"},
  {art:"an-snowfox",  name:"Снежная лиса",      hp:240, atk:35, atkTime:7.3,  color:"#dff2ff", fam:"ice"},
  {art:"an-moonrab",  name:"Лунный кролик",     hp:250, atk:36, atkTime:7.2,  color:"#e6d6ff", fam:"ice"},
  {art:"an-yuki",     name:"Ледяная дева",      hp:262, atk:38, atkTime:7.1,  color:"#bde8ff", fam:"ice"},
  {art:"an-mirror",   name:"Зеркальный дух",    hp:274, atk:39, atkTime:7.0,  color:"#c9d8ff", fam:"ice"},

  /* --- 6. ТЁМНЫЕ КУЛЬТИВАторы (сильнейшие) ------------------------------ */
  {art:"an-jiangshi", name:"Цзянши",            hp:288, atk:41, atkTime:6.9,  color:"#8fd6c0", fam:"dark"},
  {art:"an-ghoul",    name:"Гуль-монах",        hp:300, atk:43, atkTime:6.8,  color:"#a0a8c0", fam:"dark"},
  {art:"an-wraith",   name:"Призрак-мечник",    hp:314, atk:45, atkTime:6.7,  color:"#9bb8ff", fam:"dark"},
  {art:"an-oni",      name:"Демон-они",         hp:330, atk:47, atkTime:6.6,  color:"#ff7b7b", fam:"dark"},
  {art:"an-assassin", name:"Тень-убийца",       hp:346, atk:50, atkTime:6.5,  color:"#b48bff", fam:"dark"},
];

/* ---------------------------------------------------------------------------
   7 БОССОВ
   Каждый — со своим титулом и своей музыкальной темой (game читает title/track).
   --------------------------------------------------------------------------- */
const ANIME_BOSSES = [
  {art:"bos-lord",    name:"Багровый генерал",   title:"Страж Восточных врат",
   hp:1500, atk:46, atkTime:6.0, color:"#ff6b6b", track:"boss"},
  {art:"bos-serpent", name:"Нефритовая змея",    title:"Хозяйка Тихой реки",
   hp:1900, atk:52, atkTime:5.7, color:"#5cffc2", track:"boss"},
  {art:"bos-monk",    name:"Монах-отступник",    title:"Тот, кто сжёг сутры",
   hp:2300, atk:58, atkTime:5.4, color:"#ffb86b", track:"boss"},
  {art:"bos-warlord", name:"Генерал Тысячи Копий", title:"Держава без трона",
   hp:2800, atk:64, atkTime:5.1, color:"#ffd166", track:"boss"},
  {art:"bos-empress", name:"Ледяная императрица", title:"Зима, что не кончается",
   hp:3300, atk:71, atkTime:4.8, color:"#8fe3ff", track:"boss"},
  {art:"bos-dragon",  name:"Небесный дракон",    title:"Пожиратель облаков",
   hp:3900, atk:78, atkTime:4.5, color:"#7dffb0", track:"boss"},
  {art:"bos-immortal",name:"Бессмертный патриарх", title:"Последний из сянь",
   hp:4600, atk:86, atkTime:4.2, color:"#ff6bd5", track:"boss"},
];

/* ---------------------------------------------------------------------------
   ПАЛИТРА СТАДИИ ДЛЯ UI
   --------------------------------------------------------------------------- */
function animeMood(id, stage){
  stage = Math.max(1, Math.min(4, stage|0 || 1));
  const all = ANIME_ENEMIES.concat(ANIME_BOSSES);
  const e = all.find(function(x){ return x.art === id; }) || ANIME_ENEMIES[0];
  const g = STAGE_GLOW[stage-1];
  return { base: e.color, glow: g.glow, ring: g.ring, stage: stage };
}

/* ---------------------------------------------------------------------------
   РЕЕСТР АРТА (заполняется ниже: ART["an-foxling"] = function(stage){...})
   --------------------------------------------------------------------------- */
const ART = Object.create(null);
function animeArtSVG(id, stage){
  stage = Math.max(1, Math.min(4, stage|0 || 1));
  const f = ART[id];
  if(!f) return "";
  return f(stage);
}

/* Экспорт */
window.ANIME_ENEMIES = ANIME_ENEMIES;
window.ANIME_BOSSES  = ANIME_BOSSES;
window.ANIME_ART     = ART;
window.animeArtSVG   = animeArtSVG;
window.animeStageFor = animeStageFor;
window.animeMood     = animeMood;
window.ANIME_STAGE_GLOW = STAGE_GLOW;

/* Внутренние помощники — для файла арта ниже */
window.__animeHelpers = { svgOpen, shadow, eyes, brows, aura, orbitRunes, STAGE_GLOW, ART, def };

})();

/* ===========================================================================
   ЧАСТЬ 2. АРТ 30 ВРАГОВ
   Каждая функция принимает стадию (1..4) и возвращает SVG.
   При росте стадии добавляются детали: свечение глаз, аура, оружие, руны.
   =========================================================================== */
(function(){
"use strict";
const H = window.__animeHelpers;
const { svgOpen, shadow, eyes, brows, aura, orbitRunes, def } = H;
const ART = H.ART;

/* --- 1. ЛЕСНАЯ НЕЧИСТЬ --------------------------------------------------- */

def("an-foxling", function(st){
  return svgOpen(210,236,"fox") + shadow(105,224,42,10) + `
  ${aura(st,"#ffb86b",105,120,72)}
  <g class="c-body">
    <g class="c-tail">
      <path d="M148 168 q42 -6 44 -42 q-20 20 -46 22 z" fill="#ff9d4d" stroke="#7a3d10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M186 130 q-14 12 -34 16" fill="none" stroke="#fff3d6" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g class="c-leg-l"><rect x="76" y="176" width="18" height="34" rx="8" fill="#ff9d4d" stroke="#7a3d10" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="116" y="176" width="18" height="34" rx="8" fill="#ff9d4d" stroke="#7a3d10" stroke-width="4"/></g>
    <ellipse cx="105" cy="150" rx="34" ry="38" fill="#ffb86b" stroke="#7a3d10" stroke-width="4"/>
    <path d="M79 140 q-6 22 6 34 q10 -8 8 -30 z" fill="#ffe9c9" stroke="#7a3d10" stroke-width="3"/>
    <g class="c-head">
      <path d="M74 62 l-10 -34 30 18 z" fill="#ff9d4d" stroke="#7a3d10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M136 62 l10 -34 -30 18 z" fill="#ff9d4d" stroke="#7a3d10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M70 56 l-4 -20 18 12 z" fill="#ffd9b0"/>
      <path d="M140 56 l4 -20 -18 12 z" fill="#ffd9b0"/>
      <ellipse cx="105" cy="92" rx="38" ry="34" fill="#ffc98a" stroke="#7a3d10" stroke-width="4"/>
      <ellipse cx="105" cy="108" rx="18" ry="13" fill="#fff3d6" stroke="#7a3d10" stroke-width="3"/>
      <path d="M99 104 l6 7 6 -7 z" fill="#4a2a10"/>
      ${eyes(90,120,88,9,"#ff8a2b",st)}
      ${brows(90,120,72,"#7a3d10")}
      <path d="M97 116 q8 7 16 0" fill="none" stroke="#4a2a10" stroke-width="2.6" stroke-linecap="round"/>
      <g class="c-whisk"><path d="M60 104 l-24 -7 M60 112 l-24 3" stroke="#7a3d10" stroke-width="3" stroke-linecap="round"/>
      <path d="M150 104 l24 -7 M150 112 l24 3" stroke="#7a3d10" stroke-width="3" stroke-linecap="round"/></g>
    </g>
    ${st>=3?`<g class="c-claw"><path d="M150 176 q18 -4 26 -18" fill="none" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>
      <path d="M176 158 l7 -8 M172 164 l9 -4 M167 169 l10 1" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/></g>`:""}
    ${orbitRunes(st,"#ffb86b",105,120,78)}
  </g>`;
});

def("an-spore", function(st){
  return svgOpen(200,232,"spore") + shadow(100,220,40,10) + `
  ${aura(st,"#9be8b0",100,116,70)}
  <g class="c-body">
    <g class="c-leg-l"><path d="M88 178 q-8 20 0 32" fill="none" stroke="#3f7a4d" stroke-width="7" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M112 178 q8 20 0 32" fill="none" stroke="#3f7a4d" stroke-width="7" stroke-linecap="round"/></g>
    <ellipse cx="100" cy="156" rx="30" ry="34" fill="#d9f5e0" stroke="#3f7a4d" stroke-width="4"/>
    <g class="c-cap">
      <path d="M100 40 q56 6 58 54 q-58 14 -116 0 q2 -48 58 -54 z" fill="#7ddba0" stroke="#2f5e3c" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="72" cy="66" r="8" fill="#fff" opacity=".85"/><circle cx="126" cy="60" r="6" fill="#fff" opacity=".8"/>
      <circle cx="100" cy="82" r="5" fill="#fff" opacity=".7"/><circle cx="88" cy="54" r="5" fill="#fff" opacity=".75"/>
      <path d="M56 92 q44 12 88 0" fill="none" stroke="#2f5e3c" stroke-width="3"/>
    </g>
    <g class="c-head">${eyes(88,112,140,8,"#57e0a0",st)}${brows(88,112,126,"#2f5e3c")}
      <path d="M92 164 q8 8 16 0" fill="none" stroke="#2f5e3c" stroke-width="2.6" stroke-linecap="round"/></g>
    ${st>=2?`<g class="c-spores"><circle cx="52" cy="52" r="5" fill="#c8ffd8" opacity=".9"/>
      <circle cx="150" cy="44" r="4" fill="#c8ffd8" opacity=".85"/><circle cx="164" cy="86" r="6" fill="#c8ffd8" opacity=".8"/>
      <circle cx="40" cy="104" r="4" fill="#c8ffd8" opacity=".8"/></g>`:""}
    ${st>=4?`<circle cx="100" cy="70" r="82" fill="none" stroke="#9be8b0" stroke-width="3" opacity=".5"/>`:""}
    ${orbitRunes(st,"#9be8b0",100,116,76)}
  </g>`;
});

def("an-bamboob", function(st){
  return svgOpen(196,240,"bamboo") + shadow(98,226,42,10) + `
  ${aura(st,"#a8e06a",98,118,70)}
  <g class="c-body">
    <g class="c-leg-l"><rect x="76" y="176" width="16" height="38" rx="7" fill="#8cc44e" stroke="#3d5c1c" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="106" y="176" width="16" height="38" rx="7" fill="#8cc44e" stroke="#3d5c1c" stroke-width="4"/></g>
    <rect x="72" y="96" width="52" height="92" rx="14" fill="#a8e06a" stroke="#3d5c1c" stroke-width="4"/>
    <path d="M72 124 h52 M72 152 h52" stroke="#6f9e34" stroke-width="4"/>
    <path d="M92 100 v84" stroke="#8cc44e" stroke-width="3" opacity=".7"/>
    <g class="c-arm-l"><path d="M74 112 q-30 6 -34 34" fill="none" stroke="#8cc44e" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M122 112 q30 6 34 34" fill="none" stroke="#8cc44e" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-head">
      <rect x="74" y="42" width="48" height="58" rx="16" fill="#b6e87a" stroke="#3d5c1c" stroke-width="4"/>
      <path d="M74 66 h48" stroke="#6f9e34" stroke-width="4"/>
      <path d="M86 30 q12 -18 26 -6" fill="none" stroke="#4e7a24" stroke-width="5" stroke-linecap="round"/>
      <path d="M112 26 q10 8 6 22" fill="none" stroke="#4e7a24" stroke-width="5" stroke-linecap="round"/>
      ${eyes(88,108,74,8,"#7fe04a",st)}
      <path d="M92 90 q8 7 16 0" fill="none" stroke="#3d5c1c" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    ${st>=3?`<g class="c-staff"><path d="M158 44 v168" stroke="#8a5a2a" stroke-width="9" stroke-linecap="round"/>
      <path d="M158 44 q22 -6 24 16 q-22 4 -24 -16 z" fill="#c8ff9a" stroke="#5a8a2a" stroke-width="3"/></g>`:""}
    ${orbitRunes(st,"#a8e06a",98,118,76)}
  </g>`;
});

def("an-mushroom", function(st){
  return svgOpen(206,228,"mush") + shadow(103,216,44,10) + `
  ${aura(st,"#ff9bd0",103,116,68)}
  <g class="c-body">
    <g class="c-leg-l"><rect x="80" y="172" width="18" height="34" rx="8" fill="#f5e0ff" stroke="#6a3a6a" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="110" y="172" width="18" height="34" rx="8" fill="#f5e0ff" stroke="#6a3a6a" stroke-width="4"/></g>
    <ellipse cx="103" cy="150" rx="32" ry="34" fill="#fbeaff" stroke="#6a3a6a" stroke-width="4"/>
    <g class="c-cap">
      <path d="M103 32 q64 8 66 58 q-66 16 -132 0 q2 -50 66 -58 z" fill="#ff9bd0" stroke="#7a2a5a" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="70" cy="62" r="10" fill="#fff" opacity=".9"/><circle cx="132" cy="56" r="7" fill="#fff" opacity=".85"/>
      <circle cx="103" cy="80" r="7" fill="#fff" opacity=".8"/><circle cx="86" cy="48" r="6" fill="#fff" opacity=".8"/>
      <circle cx="146" cy="82" r="5" fill="#fff" opacity=".75"/>
    </g>
    <g class="c-head">${eyes(90,116,138,8,"#ff6bb5",st)}${brows(90,116,124,"#7a2a5a")}
      <path d="M94 160 q9 9 18 0" fill="none" stroke="#7a2a5a" stroke-width="2.6" stroke-linecap="round"/></g>
    <g class="c-arm-l"><path d="M72 146 q-26 10 -28 36" fill="none" stroke="#f5d0ff" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M134 146 q26 10 28 36" fill="none" stroke="#f5d0ff" stroke-width="11" stroke-linecap="round"/></g>
    ${st>=3?`<g class="c-tendril"><path d="M46 186 q-14 14 2 26 M160 186 q14 14 -2 26" fill="none" stroke="#ffb8e0" stroke-width="4" stroke-linecap="round"/></g>`:""}
    ${orbitRunes(st,"#ff9bd0",103,116,74)}
  </g>`;
});

def("an-raccoon", function(st){
  return svgOpen(214,234,"racc") + shadow(107,222,44,10) + `
  ${aura(st,"#c9a06a",107,118,72)}
  <g class="c-body">
    <g class="c-tail"><path d="M150 160 q46 4 46 -46 q-16 26 -46 30 z" fill="#b98a58" stroke="#5a3a1c" stroke-width="4" stroke-linejoin="round"/>
      <path d="M170 130 q12 -12 14 -24" stroke="#5a3a1c" stroke-width="9" stroke-linecap="round"/>
      <path d="M178 152 q14 -16 16 -32" stroke="#5a3a1c" stroke-width="9" stroke-linecap="round"/></g>
    <g class="c-leg-l"><rect x="78" y="174" width="18" height="36" rx="8" fill="#b98a58" stroke="#5a3a1c" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="118" y="174" width="18" height="36" rx="8" fill="#b98a58" stroke="#5a3a1c" stroke-width="4"/></g>
    <ellipse cx="107" cy="148" rx="34" ry="36" fill="#c9a06a" stroke="#5a3a1c" stroke-width="4"/>
    <ellipse cx="107" cy="156" rx="20" ry="22" fill="#e8d0a8" stroke="#5a3a1c" stroke-width="3"/>
    <g class="c-head">
      <circle cx="76" cy="62" r="16" fill="#b98a58" stroke="#5a3a1c" stroke-width="4"/>
      <circle cx="138" cy="62" r="16" fill="#b98a58" stroke="#5a3a1c" stroke-width="4"/>
      <circle cx="76" cy="62" r="8" fill="#e8d0a8"/><circle cx="138" cy="62" r="8" fill="#e8d0a8"/>
      <ellipse cx="107" cy="92" rx="40" ry="34" fill="#c9a06a" stroke="#5a3a1c" stroke-width="4"/>
      <path d="M67 84 q40 -14 80 0 q-40 24 -80 0 z" fill="#4a3120"/>
      ${eyes(90,124,86,9,"#ffd166",st)}
      <ellipse cx="107" cy="110" rx="13" ry="10" fill="#f0dcc0" stroke="#5a3a1c" stroke-width="3"/>
      <circle cx="107" cy="106" r="4" fill="#3a2414"/>
      ${st>=2?`<g class="c-mask"><path d="M62 74 q45 -18 90 0 l-6 10 q-39 -14 -78 0 z" fill="#3a6ea8" opacity=".85"/></g>`:""}
    </g>
    ${st>=3?`<g class="c-loot"><circle cx="168" cy="150" r="14" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>
      <text x="168" y="156" font-size="15" fill="#8a5a00" text-anchor="middle" font-family="serif">宝</text></g>`:""}
    ${orbitRunes(st,"#c9a06a",107,118,80)}
  </g>`;
});

/* --- 2. ВОДНЫЕ ТВАРИ ----------------------------------------------------- */

def("an-koi", function(st){
  return svgOpen(226,206,"koi") + shadow(113,192,46,10) + `
  ${aura(st,"#6bd5ff",113,100,74)}
  <g class="c-body">
    <g class="c-tail"><path d="M188 100 q30 -24 32 -46 q-24 10 -40 30 q-14 -18 -18 -38 q-8 26 4 54 z" fill="#ffe0e8" stroke="#2a5a8a" stroke-width="4" stroke-linejoin="round"/></g>
    <ellipse cx="106" cy="104" rx="62" ry="34" fill="#ffd0d8" stroke="#2a5a8a" stroke-width="4"/>
    <path d="M60 92 q46 -22 92 0" fill="none" stroke="#ff8fa8" stroke-width="9" opacity=".8"/>
    <path d="M56 112 q50 -20 100 2" fill="none" stroke="#ff8fa8" stroke-width="7" opacity=".6"/>
    <g class="c-fin-t"><path d="M86 74 q18 -30 42 -14 q-22 6 -30 22 z" fill="#a8e6ff" stroke="#2a5a8a" stroke-width="3"/></g>
    <g class="c-fin-b"><path d="M84 134 q20 28 44 14 q-24 -6 -32 -22 z" fill="#a8e6ff" stroke="#2a5a8a" stroke-width="3"/></g>
    <g class="c-head">
      <path d="M52 104 q-26 -4 -34 -18 q22 -6 34 4 z" fill="#ffe0e8" stroke="#2a5a8a" stroke-width="3"/>
      ${eyes(74,94,96,8,"#2a8ac8",st)}
      <path d="M60 116 q10 8 22 2" fill="none" stroke="#2a5a8a" stroke-width="3" stroke-linecap="round"/>
      <g class="c-whisk"><path d="M44 108 q-18 6 -26 16 M46 116 q-16 12 -20 24" stroke="#2a5a8a" stroke-width="3" stroke-linecap="round" fill="none"/></g>
      ${st>=2?`<g class="c-horn"><path d="M70 72 l-6 -26 16 16 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/></g>`:""}
      ${st>=4?`<g class="c-horn"><path d="M96 68 l2 -28 12 20 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/></g>`:""}
    </g>
    ${st>=3?`<g class="c-pearl"><circle cx="118" cy="60" r="12" fill="#fff" stroke="#ffd166" stroke-width="3" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#6bd5ff",113,100,84)}
  </g>`;
});

def("an-jelly", function(st){
  return svgOpen(196,238,"jelly") + shadow(98,224,38,9) + `
  ${aura(st,"#b48bff",98,110,72)}
  <g class="c-body">
    <g class="c-tentacles">
      <path d="M70 150 q-10 34 4 62 M88 154 q-6 38 6 60 M108 154 q6 38 -6 60 M126 150 q10 34 -4 62" fill="none" stroke="#c9a8ff" stroke-width="6" stroke-linecap="round" opacity=".9"/>
      <path d="M78 158 q-14 30 -2 54 M118 158 q14 30 2 54" fill="none" stroke="#e0c8ff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    </g>
    <g class="c-bell">
      <path d="M98 30 q52 0 52 56 q0 40 -10 54 q-42 14 -84 0 q-10 -14 -10 -54 q0 -56 52 -56 z" fill="#c9a8ff" stroke="#4a2a8a" stroke-width="4" stroke-linejoin="round" opacity=".92"/>
      <path d="M52 118 q46 16 92 0" fill="none" stroke="#4a2a8a" stroke-width="4"/>
      <ellipse cx="78" cy="70" rx="14" ry="18" fill="#fff" opacity=".45"/>
      <ellipse cx="118" cy="82" rx="9" ry="12" fill="#fff" opacity=".35"/>
    </g>
    <g class="c-head">${eyes(84,112,92,9,"#a86bff",st)}${brows(84,112,76,"#4a2a8a")}
      <path d="M90 118 q8 10 16 0" fill="none" stroke="#4a2a8a" stroke-width="2.6" stroke-linecap="round"/></g>
    ${st>=3?`<g class="c-core"><circle cx="98" cy="104" r="14" fill="#fff" opacity=".8" filter="url(#anGlow)"/>
      <text x="98" y="110" font-size="15" fill="#4a2a8a" text-anchor="middle" font-family="serif">水</text></g>`:""}
    ${orbitRunes(st,"#b48bff",98,110,84)}
  </g>`;
});

def("an-crab", function(st){
  return svgOpen(228,208,"crab") + shadow(114,192,52,11) + `
  ${aura(st,"#ff8b6b",114,104,72)}
  <g class="c-body">
    <g class="c-leg-l"><path d="M72 120 q-30 4 -42 22 M70 134 q-28 8 -36 26 M74 148 q-26 12 -30 28" fill="none" stroke="#c85a3a" stroke-width="7" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M156 120 q30 4 42 22 M158 134 q28 8 36 26 M154 148 q26 12 30 28" fill="none" stroke="#c85a3a" stroke-width="7" stroke-linecap="round"/></g>
    <g class="c-claw-l"><path d="M60 108 q-34 -12 -40 -36 q20 -4 30 8 q-6 -22 12 -30 q14 16 10 38 z" fill="#ff8b6b" stroke="#8a2a1a" stroke-width="4" stroke-linejoin="round"/></g>
    <g class="c-claw-r"><path d="M168 108 q34 -12 40 -36 q-20 -4 -30 8 q6 -22 -12 -30 q-14 16 -10 38 z" fill="#ff8b6b" stroke="#8a2a1a" stroke-width="4" stroke-linejoin="round"/></g>
    <ellipse cx="114" cy="132" rx="56" ry="42" fill="#ff8b6b" stroke="#8a2a1a" stroke-width="4"/>
    <path d="M66 118 q48 -18 96 0" fill="none" stroke="#ffb8a0" stroke-width="6" opacity=".7"/>
    <g class="c-head">
      <ellipse cx="114" cy="90" rx="42" ry="30" fill="#ffa88b" stroke="#8a2a1a" stroke-width="4"/>
      ${eyes(98,132,84,9,"#ff3b1a",st)}${brows(98,132,68,"#8a2a1a")}
      <path d="M100 104 q14 12 28 0" fill="none" stroke="#8a2a1a" stroke-width="3" stroke-linecap="round"/>
      ${st>=2?`<path d="M92 62 l-8 -22 16 12 z M136 62 l8 -22 -16 12 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>`:""}
    </g>
    ${st>=3?`<g class="c-armor"><path d="M66 108 q48 -16 96 0 v22 q-48 -14 -96 0 z" fill="#ffd166" opacity=".55" stroke="#8a5a00" stroke-width="2"/></g>`:""}
    ${orbitRunes(st,"#ff8b6b",114,104,88)}
  </g>`;
});

def("an-eel", function(st){
  return svgOpen(232,206,"eel") + shadow(116,192,48,10) + `
  ${aura(st,"#8bf0ff",116,100,74)}
  <g class="c-body">
    <path d="M36 128 q34 -44 74 -30 q40 14 62 -6 q24 -22 44 -4 q-24 6 -28 28 q-6 34 -46 32 q-40 -2 -60 20 q-22 24 -46 4 q24 -10 26 -30 z"
      fill="#8bf0ff" stroke="#1a5a7a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M52 118 q26 -22 54 -12 M118 106 q22 8 40 -4" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>
    <g class="c-fin"><path d="M84 92 q16 -26 38 -14 q-22 8 -26 24 z" fill="#c8f8ff" stroke="#1a5a7a" stroke-width="3"/></g>
    <g class="c-head">
      <ellipse cx="64" cy="118" rx="34" ry="26" fill="#a8f0ff" stroke="#1a5a7a" stroke-width="4"/>
      ${eyes(52,80,112,8,"#ffe066",st)}
      ${brows(52,80,98,"#1a5a7a")}
      <path d="M56 132 q12 10 24 0" fill="none" stroke="#1a5a7a" stroke-width="3" stroke-linecap="round"/>
      ${st>=2?`<g class="c-spark"><path d="M40 96 l-4 -18 4 6 4 -6 z M74 92 l-4 -18 4 6 4 -6 z" fill="#ffe066"/></g>`:""}
      ${st>=4?`<g class="c-spark"><path d="M58 90 l-6 -22 6 8 6 -8 z" fill="#fff" filter="url(#anGlow)"/></g>`:""}
    </g>
    ${st>=3?`<g class="c-coil"><circle cx="176" cy="112" r="16" fill="none" stroke="#ffe066" stroke-width="4" filter="url(#anGlow)"/>
      <circle cx="176" cy="112" r="6" fill="#fff"/></g>`:""}
    ${orbitRunes(st,"#8bf0ff",116,100,86)}
  </g>`;
});

def("an-turtle", function(st){
  return svgOpen(232,206,"turtle") + shadow(116,190,58,12) + `
  ${aura(st,"#7dffb0",116,106,74)}
  <g class="c-body">
    <g class="c-leg-l"><ellipse cx="70" cy="166" rx="20" ry="13" fill="#4e9a6a" stroke="#1e4a2c" stroke-width="4"/></g>
    <g class="c-leg-r"><ellipse cx="162" cy="166" rx="20" ry="13" fill="#4e9a6a" stroke="#1e4a2c" stroke-width="4"/></g>
    <g class="c-shell">
      <path d="M116 34 q62 10 64 68 q-64 26 -128 0 q2 -58 64 -68 z" fill="#5abe86" stroke="#1e4a2c" stroke-width="5" stroke-linejoin="round"/>
      <path d="M116 40 v88 M80 48 q-8 40 0 76 M152 48 q8 40 0 76" fill="none" stroke="#2f6e46" stroke-width="4"/>
      <path d="M54 78 q62 16 124 0" fill="none" stroke="#2f6e46" stroke-width="4"/>
      ${st>=2?`<g class="c-moss"><circle cx="76" cy="52" r="7" fill="#9be8b0"/><circle cx="158" cy="62" r="6" fill="#9be8b0"/>
        <circle cx="98" cy="40" r="5" fill="#9be8b0"/></g>`:""}
      ${st>=3?`<path d="M116 34 q-8 -24 8 -30 q12 8 4 26 z" fill="#7dffb0" stroke="#1e4a2c" stroke-width="3"/>`:""}
    </g>
    <g class="c-head">
      <ellipse cx="116" cy="132" rx="30" ry="24" fill="#6ecf96" stroke="#1e4a2c" stroke-width="4"/>
      ${eyes(104,128,128,8,"#2f8a56",st)}
      <path d="M108 144 q8 8 16 0" fill="none" stroke="#1e4a2c" stroke-width="2.6" stroke-linecap="round"/>
      ${st>=2?`<path d="M96 108 l-6 -20 14 12 z M136 108 l6 -20 -14 12 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>`:""}
    </g>
    ${st>=4?`<g class="c-island"><path d="M150 44 q18 -12 30 2 q-16 8 -30 -2 z" fill="#3f7a4d"/>
      <path d="M164 38 v-14" stroke="#5a3a1c" stroke-width="3"/><circle cx="164" cy="22" r="8" fill="#2f6e46"/></g>`:""}
    ${orbitRunes(st,"#7dffb0",116,106,88)}
  </g>`;
});

/* --- 3. ГОРНЫЕ ДУХИ ------------------------------------------------------ */

def("an-stone", function(st){
  return svgOpen(210,232,"stone") + shadow(105,220,50,11) + `
  ${aura(st,"#c2c9d8",105,120,72)}
  <g class="c-body">
    <g class="c-leg-l"><rect x="74" y="176" width="24" height="38" rx="6" fill="#8b93a6" stroke="#3a4054" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="112" y="176" width="24" height="38" rx="6" fill="#8b93a6" stroke="#3a4054" stroke-width="4"/></g>
    <path d="M62 106 l14 -18 20 8 14 -14 16 12 16 -10 14 16 -6 70 q-42 12 -84 0 z" fill="#a8b0c4" stroke="#3a4054" stroke-width="4" stroke-linejoin="round"/>
    <path d="M84 120 l16 20 -10 24 M130 116 l-10 24 14 20" stroke="#6a7288" stroke-width="4" fill="none"/>
    <g class="c-arm-l"><path d="M64 120 q-30 12 -34 44" fill="none" stroke="#8b93a6" stroke-width="14" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M146 120 q30 12 34 44" fill="none" stroke="#8b93a6" stroke-width="14" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M66 50 l20 -16 18 10 20 -10 18 16 v40 q-38 14 -76 0 z" fill="#b8c0d4" stroke="#3a4054" stroke-width="4" stroke-linejoin="round"/>
      ${eyes(88,122,74,9,"#7fd8ff",st)}${brows(88,122,58,"#3a4054",4)}
      <path d="M92 92 h26" stroke="#3a4054" stroke-width="4" stroke-linecap="round"/>
      ${st>=2?`<g class="c-cracks"><path d="M74 60 l10 12 -6 10 M140 62 l-10 12 6 10" fill="none" stroke="#ffd166" stroke-width="3"/></g>`:""}
    </g>
    ${st>=3?`<g class="c-gem"><path d="M105 40 l12 14 -12 16 -12 -16 z" fill="#7fd8ff" stroke="#1a5a7a" stroke-width="3" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#c2c9d8",105,120,78)}
  </g>`;
});

def("an-goat", function(st){
  return svgOpen(214,236,"goat") + shadow(107,222,44,10) + `
  ${aura(st,"#e0c07a",107,118,72)}
  <g class="c-body">
    <g class="c-leg-l"><rect x="78" y="176" width="16" height="38" rx="7" fill="#c8a860" stroke="#5a4418" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="118" y="176" width="16" height="38" rx="7" fill="#c8a860" stroke="#5a4418" stroke-width="4"/></g>
    <ellipse cx="107" cy="150" rx="34" ry="36" fill="#e0c07a" stroke="#5a4418" stroke-width="4"/>
    <path d="M74 156 q34 12 66 0" fill="none" stroke="#f0dcb0" stroke-width="6" opacity=".8"/>
    <g class="c-head">
      <ellipse cx="107" cy="94" rx="36" ry="32" fill="#ecd39a" stroke="#5a4418" stroke-width="4"/>
      <g class="c-horn-l"><path d="M84 66 q-16 -22 -4 -40 q14 12 14 34 z" fill="#c9b079" stroke="#5a4418" stroke-width="4" stroke-linejoin="round"/></g>
      <g class="c-horn-r"><path d="M130 66 q16 -22 4 -40 q-14 12 -14 34 z" fill="#c9b079" stroke="#5a4418" stroke-width="4" stroke-linejoin="round"/></g>
      ${eyes(93,121,90,8,"#e0a020",st)}${brows(93,121,74,"#5a4418")}
      <path d="M98 112 q9 9 18 0" fill="none" stroke="#5a4418" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M100 118 q7 12 14 0 z" fill="#f5e6c8" stroke="#5a4418" stroke-width="2"/>
      ${st>=2?`<g class="c-beard"><path d="M107 124 q-6 22 0 34 q6 -12 0 -34 z" fill="#f5e6c8" stroke="#5a4418" stroke-width="2"/></g>`:""}
    </g>
    ${st>=3?`<g class="c-bell"><circle cx="107" cy="168" r="12" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>
      <path d="M107 156 v6" stroke="#8a5a00" stroke-width="3"/></g>`:""}
    ${orbitRunes(st,"#e0c07a",107,118,78)}
  </g>`;
});

def("an-crane", function(st){
  return svgOpen(210,240,"crane") + shadow(105,226,40,9) + `
  ${aura(st,"#f0f4ff",105,118,72)}
  <g class="c-body">
    <g class="c-leg-l"><path d="M96 186 v34 M96 220 l-8 8 M96 220 l8 8" fill="none" stroke="#d08a3a" stroke-width="5" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M116 186 v34 M116 220 l-8 8 M116 220 l8 8" fill="none" stroke="#d08a3a" stroke-width="5" stroke-linecap="round"/></g>
    <g class="c-wing-l"><path d="M84 112 q-44 8 -52 48 q30 -6 48 -24 q-6 26 4 40 q10 -30 12 -52 z" fill="#f4f8ff" stroke="#8a94b8" stroke-width="4" stroke-linejoin="round"/></g>
    <g class="c-wing-r"><path d="M126 112 q44 8 52 48 q-30 -6 -48 -24 q6 26 -4 40 q-10 -30 -12 -52 z" fill="#f4f8ff" stroke="#8a94b8" stroke-width="4" stroke-linejoin="round"/></g>
    <ellipse cx="105" cy="146" rx="30" ry="40" fill="#fbfdff" stroke="#8a94b8" stroke-width="4"/>
    <path d="M105 112 q-6 36 0 68" fill="none" stroke="#d8e2f4" stroke-width="4"/>
    <g class="c-head">
      <path d="M105 74 q-4 -34 22 -44 q4 18 -8 30 q16 -4 24 4 q-18 10 -30 14 z" fill="#fbfdff" stroke="#8a94b8" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="105" cy="78" rx="22" ry="18" fill="#fbfdff" stroke="#8a94b8" stroke-width="4"/>
      <path d="M114 66 h22 l-22 8 z" fill="#d08a3a" stroke="#8a5a1a" stroke-width="3"/>
      ${eyes(100,116,74,7,"#3a72c8",st)}
      <path d="M96 50 q10 -12 22 -8" fill="none" stroke="#c83a3a" stroke-width="4" stroke-linecap="round"/>
      ${st>=3?`<g class="c-crown"><path d="M92 52 l5 -14 6 9 6 -13 6 13 6 -9 5 14 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/></g>`:""}
    </g>
    ${st>=2?`<g class="c-halo"><ellipse cx="105" cy="66" rx="30" ry="9" fill="none" stroke="#ffd166" stroke-width="3" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#f0f4ff",105,118,80)}
  </g>`;
});

def("an-monkey", function(st){
  return svgOpen(212,236,"monkey") + shadow(106,222,44,10) + `
  ${aura(st,"#ffb36b",106,118,72)}
  <g class="c-body">
    <g class="c-tail"><path d="M148 168 q40 6 42 -30 q-2 -22 -18 -22 q-12 2 -10 14 q2 8 10 8" fill="none" stroke="#c8823a" stroke-width="7" stroke-linecap="round"/></g>
    <g class="c-leg-l"><rect x="78" y="176" width="18" height="36" rx="8" fill="#c8823a" stroke="#5a3a10" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="116" y="176" width="18" height="36" rx="8" fill="#c8823a" stroke="#5a3a10" stroke-width="4"/></g>
    <ellipse cx="106" cy="150" rx="32" ry="36" fill="#e0a060" stroke="#5a3a10" stroke-width="4"/>
    <ellipse cx="106" cy="158" rx="18" ry="22" fill="#f0d0a8" stroke="#5a3a10" stroke-width="3"/>
    <g class="c-arm-l"><path d="M76 128 q-28 14 -30 44" fill="none" stroke="#c8823a" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M136 128 q28 14 30 44" fill="none" stroke="#c8823a" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-head">
      <circle cx="72" cy="88" r="13" fill="#e0a060" stroke="#5a3a10" stroke-width="4"/>
      <circle cx="140" cy="88" r="13" fill="#e0a060" stroke="#5a3a10" stroke-width="4"/>
      <ellipse cx="106" cy="90" rx="34" ry="32" fill="#e8ad6a" stroke="#5a3a10" stroke-width="4"/>
      <ellipse cx="106" cy="100" rx="28" ry="24" fill="#f5dcc0" stroke="#5a3a10" stroke-width="3"/>
      ${eyes(94,118,88,8,"#ff8a2b",st)}${brows(94,118,72,"#5a3a10")}
      <circle cx="106" cy="104" r="3.5" fill="#5a3a10"/>
      <path d="M98 112 q8 8 16 0" fill="none" stroke="#5a3a10" stroke-width="2.6" stroke-linecap="round"/>
      ${st>=3?`<path d="M74 62 q32 -14 64 0 q-32 8 -64 0 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>`:""}
    </g>
    ${st>=4?`<g class="c-staff"><path d="M166 34 v168" stroke="#c83a3a" stroke-width="8" stroke-linecap="round"/>
      <path d="M154 34 h24" stroke="#ffd166" stroke-width="8" stroke-linecap="round"/></g>`:""}
    ${orbitRunes(st,"#ffb36b",106,118,78)}
  </g>`;
});

def("an-tiger", function(st){
  return svgOpen(220,232,"tiger") + shadow(110,220,50,11) + `
  ${aura(st,"#ffd166",110,116,74)}
  <g class="c-body">
    <g class="c-tail"><path d="M152 158 q44 -2 42 -44 q-14 22 -42 26 z" fill="#e8a83a" stroke="#5a3a10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M180 128 q10 -10 14 -22" stroke="#3a2410" stroke-width="7" stroke-linecap="round"/></g>
    <g class="c-leg-l"><rect x="78" y="172" width="22" height="40" rx="9" fill="#e8a83a" stroke="#5a3a10" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="120" y="172" width="22" height="40" rx="9" fill="#e8a83a" stroke="#5a3a10" stroke-width="4"/></g>
    <ellipse cx="110" cy="146" rx="38" ry="40" fill="#f5c451" stroke="#5a3a10" stroke-width="4"/>
    <path d="M76 128 l14 -10 M144 128 l-14 -10 M78 156 l16 -6 M142 156 l-16 -6" stroke="#3a2410" stroke-width="6" stroke-linecap="round"/>
    <g class="c-arm-l"><path d="M76 132 q-28 12 -32 44" fill="none" stroke="#e8a83a" stroke-width="14" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M144 132 q28 12 32 44" fill="none" stroke="#e8a83a" stroke-width="14" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M74 74 l-8 -28 24 14 z" fill="#f5c451" stroke="#5a3a10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M146 74 l8 -28 -24 14 z" fill="#f5c451" stroke="#5a3a10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M70 62 l4 -14 12 8 z" fill="#ff8a8a"/><path d="M150 62 l-4 -14 -12 8 z" fill="#ff8a8a"/>
      <ellipse cx="110" cy="92" rx="44" ry="36" fill="#f5c451" stroke="#5a3a10" stroke-width="4"/>
      <path d="M84 62 l6 12 M136 62 l-6 12 M92 70 l6 10 M128 70 l-6 10" stroke="#3a2410" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="110" cy="108" rx="20" ry="14" fill="#fff3d6" stroke="#5a3a10" stroke-width="3"/>
      ${eyes(96,124,88,9,"#ffb020",st)}${brows(96,124,72,"#5a3a10",4)}
      <path d="M104 100 l6 6 6 -6 z" fill="#5a3a10"/>
      <path d="M101 112 q9 10 18 0" fill="none" stroke="#5a3a10" stroke-width="2.8" stroke-linecap="round"/>
      <g class="c-whisk"><path d="M64 104 l-22 -6 M64 112 l-22 4 M156 104 l22 -6 M156 112 l22 4" stroke="#5a3a10" stroke-width="3" stroke-linecap="round"/></g>
      ${st>=3?`<g class="c-armor"><path d="M70 74 q40 -16 80 0 l-6 14 q-34 -12 -68 0 z" fill="#c83a3a" stroke="#7a1a1a" stroke-width="3"/></g>`:""}
    </g>
    ${st>=4?`<g class="c-flag"><path d="M182 40 v150" stroke="#8a5a2a" stroke-width="7" stroke-linecap="round"/>
      <path d="M182 42 q28 4 30 26 q-28 6 -30 -26 z" fill="#c83a3a" stroke="#7a1a1a" stroke-width="3"/>
      <text x="196" y="62" font-size="17" fill="#ffd166" text-anchor="middle" font-family="serif">王</text></g>`:""}
    ${orbitRunes(st,"#ffd166",110,116,88)}
  </g>`;
});

/* --- 4. ОГНЕННЫЕ И ГРОЗОВЫЕ ---------------------------------------------- */

def("an-ember", function(st){
  return svgOpen(196,232,"ember") + shadow(98,218,38,9) + `
  ${aura(st,"#ff9a4d",98,112,74)}
  <g class="c-body">
    <g class="c-flame">
      <path d="M98 34 q22 30 14 54 q-6 20 -14 20 q-8 0 -14 -20 q-8 -24 14 -54 z" fill="#ffb86b" stroke="#a03a10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M98 56 q12 22 6 38 q-6 10 -6 10 q0 0 -6 -10 q-6 -16 6 -38 z" fill="#ffe066"/>
      <path d="M98 78 q6 14 2 24 q-2 6 -2 6 q0 0 -2 -6 q-4 -10 2 -24 z" fill="#fff"/>
    </g>
    <g class="c-leg-l"><path d="M86 176 q-6 20 2 30" fill="none" stroke="#a03a10" stroke-width="6" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M110 176 q6 20 -2 30" fill="none" stroke="#a03a10" stroke-width="6" stroke-linecap="round"/></g>
    <ellipse cx="98" cy="156" rx="28" ry="32" fill="#ffc98a" stroke="#a03a10" stroke-width="4"/>
    <g class="c-head">${eyes(86,110,148,8,"#ff3b1a",st)}${brows(86,110,134,"#a03a10")}
      <path d="M90 170 q8 8 16 0" fill="none" stroke="#a03a10" stroke-width="2.6" stroke-linecap="round"/></g>
    <g class="c-arm-l"><path d="M72 150 q-24 10 -26 34" fill="none" stroke="#ffb86b" stroke-width="10" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M124 150 q24 10 26 34" fill="none" stroke="#ffb86b" stroke-width="10" stroke-linecap="round"/></g>
    ${st>=2?`<g class="c-sparks"><circle cx="52" cy="60" r="5" fill="#ffe066" filter="url(#anGlow)"/>
      <circle cx="150" cy="72" r="4" fill="#ffe066"/><circle cx="64" cy="30" r="4" fill="#ffb86b"/></g>`:""}
    ${st>=4?`<g class="c-halo"><circle cx="98" cy="112" r="84" fill="none" stroke="#ff9a4d" stroke-width="4" opacity=".6" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#ff9a4d",98,112,80)}
  </g>`;
});

def("an-lantern", function(st){
  return svgOpen(200,238,"lant") + shadow(100,224,42,10) + `
  ${aura(st,"#ffcf5c",100,116,72)}
  <g class="c-body">
    <path d="M100 18 v18" stroke="#8a5a2a" stroke-width="6" stroke-linecap="round"/>
    <g class="c-paper">
      <ellipse cx="100" cy="96" rx="52" ry="58" fill="#ffcf5c" stroke="#a03a10" stroke-width="4" opacity=".95"/>
      <path d="M54 74 q46 -14 92 0 M52 118 q48 14 96 0 M100 40 v112" fill="none" stroke="#d08a20" stroke-width="4"/>
      <path d="M58 62 h84 M58 130 h84" stroke="#a03a10" stroke-width="4"/>
      <rect x="76" y="32" width="48" height="14" rx="5" fill="#8a5a2a" stroke="#4a2a10" stroke-width="3"/>
      <rect x="76" y="146" width="48" height="14" rx="5" fill="#8a5a2a" stroke="#4a2a10" stroke-width="3"/>
      <path d="M84 160 v20 M100 160 v26 M116 160 v20" stroke="#c83a3a" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g class="c-head">
      ${eyes(84,116,90,10,"#ff2b1a",st)}${brows(84,116,74,"#7a1a1a",4)}
      <path d="M84 108 q16 18 32 0 q-16 8 -32 0 z" fill="#7a1a1a"/>
      ${st>=2?`<path d="M90 108 l3 9 3 -9 z M104 108 l3 9 3 -9 z" fill="#fff"/>`:""}
    </g>
    ${st>=4?`<g class="c-fire"><path d="M64 26 q10 14 4 24 q-8 -8 -12 -2 q-4 -14 8 -22 z" fill="#ff6b1a" opacity=".9"/>
      <path d="M136 26 q10 14 4 24 q-8 -8 -12 -2 q-4 -14 8 -22 z" fill="#ff6b1a" opacity=".9"/></g>`:""}
    ${orbitRunes(st,"#ffcf5c",100,116,84)}
  </g>`;
});

def("an-thunder", function(st){
  return svgOpen(204,236,"thun") + shadow(102,222,42,10) + `
  ${aura(st,"#ffe066",102,116,74)}
  <g class="c-body">
    <g class="c-cloud"><path d="M50 66 q-4 -26 22 -28 q8 -18 30 -14 q16 -12 34 2 q26 -2 26 26 q14 4 12 22 q-62 16 -124 0 q-2 -6 0 -8 z"
      fill="#c8d0e8" stroke="#3a4260" stroke-width="4" stroke-linejoin="round"/></g>
    <g class="c-leg-l"><path d="M86 178 q-6 20 2 30" fill="none" stroke="#6a7288" stroke-width="6" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M114 178 q6 20 -2 30" fill="none" stroke="#6a7288" stroke-width="6" stroke-linecap="round"/></g>
    <ellipse cx="102" cy="156" rx="28" ry="32" fill="#e0e6f4" stroke="#3a4260" stroke-width="4"/>
    <g class="c-head">${eyes(90,114,148,8,"#ffe066",st)}${brows(90,114,134,"#3a4260")}
      <path d="M94 170 q8 8 16 0" fill="none" stroke="#3a4260" stroke-width="2.6" stroke-linecap="round"/></g>
    <g class="c-bolt"><path d="M102 40 l-14 30 12 2 -18 34 8 0 -14 30 30 -38 -10 -2 16 -32 -10 -2 12 -22 z"
      fill="#ffe066" stroke="#a08a00" stroke-width="3" stroke-linejoin="round" filter="url(#anGlow)"/></g>
    ${st>=2?`<g class="c-arc"><path d="M62 96 l-8 12 12 2 -10 14 M142 96 l8 12 -12 2 10 14" fill="none" stroke="#ffe066" stroke-width="3" filter="url(#anGlow)"/></g>`:""}
    ${st>=3?`<g class="c-drum"><circle cx="102" cy="128" r="0" fill="none"/>
      <ellipse cx="102" cy="196" rx="30" ry="10" fill="#c83a3a" stroke="#7a1a1a" stroke-width="3"/></g>`:""}
    ${orbitRunes(st,"#ffe066",102,116,86)}
  </g>`;
});

def("an-censer", function(st){
  return svgOpen(206,238,"cens") + shadow(103,224,44,10) + `
  ${aura(st,"#c48bff",103,120,72)}
  <g class="c-body">
    <g class="c-leg-l"><path d="M86 186 l-10 30 M86 186 l10 30" fill="none" stroke="#6a4a20" stroke-width="6" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M120 186 l-10 30 M120 186 l10 30" fill="none" stroke="#6a4a20" stroke-width="6" stroke-linecap="round"/></g>
    <path d="M62 122 q41 -14 82 0 l-10 62 q-31 12 -62 0 z" fill="#a87b3a" stroke="#4a3010" stroke-width="4" stroke-linejoin="round"/>
    <path d="M70 142 h66 M72 160 h62" stroke="#7a5a20" stroke-width="4"/>
    <g class="c-arm-l"><path d="M64 128 q-26 6 -34 24" fill="none" stroke="#8a6a2a" stroke-width="9" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M142 128 q26 6 34 24" fill="none" stroke="#8a6a2a" stroke-width="9" stroke-linecap="round"/></g>
    <g class="c-smoke">
      <path d="M84 116 q-10 -20 4 -34 q12 -12 4 -28" fill="none" stroke="#c48bff" stroke-width="7" stroke-linecap="round" opacity=".75"/>
      <path d="M104 112 q10 -22 -2 -36 q-10 -14 2 -28" fill="none" stroke="#d8b0ff" stroke-width="6" stroke-linecap="round" opacity=".7"/>
      <path d="M124 116 q-8 -18 4 -32 q10 -12 2 -26" fill="none" stroke="#c48bff" stroke-width="6" stroke-linecap="round" opacity=".6"/>
    </g>
    <g class="c-head">
      <path d="M103 42 q16 18 12 40 q-6 18 -12 18 q-6 0 -12 -18 q-4 -22 12 -40 z" fill="#d8b0ff" stroke="#5a2a8a" stroke-width="4" stroke-linejoin="round"/>
      ${eyes(94,112,80,7,"#a86bff",st)}
      <path d="M97 96 q6 10 12 0" fill="none" stroke="#5a2a8a" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    ${st>=3?`<g class="c-arms-extra"><path d="M52 150 q-16 14 -10 34 M154 150 q16 14 10 34" fill="none" stroke="#8a6a2a" stroke-width="8" stroke-linecap="round"/></g>`:""}
    ${st>=4?`<g class="c-talisman"><rect x="158" y="60" width="24" height="46" rx="4" fill="#ffe066" stroke="#a03a10" stroke-width="3"/>
      <text x="170" y="90" font-size="20" fill="#a03a10" text-anchor="middle" font-family="serif">符</text></g>`:""}
    ${orbitRunes(st,"#c48bff",103,120,84)}
  </g>`;
});

def("an-phoenix", function(st){
  return svgOpen(234,236,"phoe") + shadow(117,222,46,10) + `
  ${aura(st,"#ff7b5c",117,116,78)}
  <g class="c-body">
    <g class="c-tail"><path d="M112 168 q-6 34 4 56 q10 -22 6 -54 z M126 168 q14 30 8 54 q16 -20 6 -52 z"
      fill="#ffb86b" stroke="#a03a10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M108 180 q-10 26 0 44" fill="none" stroke="#ffe066" stroke-width="5" stroke-linecap="round"/></g>
    <g class="c-leg-l"><path d="M104 176 v26 M104 202 l-8 8 M104 202 l8 8" fill="none" stroke="#c85a1a" stroke-width="5" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M126 176 v26 M126 202 l-8 8 M126 202 l8 8" fill="none" stroke="#c85a1a" stroke-width="5" stroke-linecap="round"/></g>
    <g class="c-wing-l"><path d="M104 110 q-56 -22 -84 12 q34 -2 54 12 q-40 4 -52 34 q40 -14 66 4 q-24 10 -30 32 q36 -22 60 -28 z"
      fill="#ff9a5c" stroke="#a03a10" stroke-width="4" stroke-linejoin="round"/></g>
    <g class="c-wing-r"><path d="M130 110 q56 -22 84 12 q-34 -2 -54 12 q40 4 52 34 q-40 -14 -66 4 q24 10 30 32 q-36 -22 -60 -28 z"
      fill="#ff9a5c" stroke="#a03a10" stroke-width="4" stroke-linejoin="round"/></g>
    <ellipse cx="117" cy="146" rx="30" ry="38" fill="#ffc98a" stroke="#a03a10" stroke-width="4"/>
    <path d="M117 112 q-6 34 0 64" fill="none" stroke="#ffe066" stroke-width="4" opacity=".8"/>
    <g class="c-head">
      <path d="M117 60 q-6 -20 4 -30 q10 10 6 30 z" fill="#ffe066" stroke="#a03a10" stroke-width="4" stroke-linejoin="round"/>
      <path d="M79 60 q-10 -20 4 -28 q10 10 6 28 z" fill="#ff9a5c" stroke="#a03a10" stroke-width="3"/>
      <path d="M155 60 q10 -20 -4 -28 q-10 10 -6 28 z" fill="#ff9a5c" stroke="#a03a10" stroke-width="3"/>
      <ellipse cx="117" cy="88" rx="32" ry="30" fill="#ffc98a" stroke="#a03a10" stroke-width="4"/>
      <path d="M117 96 q-14 8 -22 4 q10 4 22 4 q12 0 22 -4 q-8 4 -22 -4 z" fill="#ffe066" stroke="#a03a10" stroke-width="3"/>
      ${eyes(105,129,84,8,"#ff3b1a",st)}${brows(105,129,68,"#a03a10")}
      <path d="M117 104 l-8 8 h16 z" fill="#ffd166" stroke="#a03a10" stroke-width="2"/>
    </g>
    ${st>=3?`<g class="c-fire"><path d="M44 148 q12 18 4 34 q-10 -12 -16 -4 q-4 -18 12 -30 z" fill="#ff6b1a" opacity=".8"/>
      <path d="M190 148 q-12 18 -4 34 q10 -12 16 -4 q4 -18 -12 -30 z" fill="#ff6b1a" opacity=".8"/></g>`:""}
    ${orbitRunes(st,"#ff7b5c",117,116,92)}
  </g>`;
});

/* --- 5. ЛЕДЯНЫЕ И ЛУННЫЕ ------------------------------------------------- */

def("an-frost", function(st){
  return svgOpen(204,234,"frost") + shadow(102,220,42,10) + `
  ${aura(st,"#a8e6ff",102,114,74)}
  <g class="c-body">
    <g class="c-shards">
      <path d="M102 40 l-16 34 16 12 16 -12 z" fill="#d8f4ff" stroke="#3a7a9a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M56 76 l-14 26 12 10 12 -10 z" fill="#c8ecff" stroke="#3a7a9a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M148 76 l14 26 -12 10 -12 -10 z" fill="#c8ecff" stroke="#3a7a9a" stroke-width="3" stroke-linejoin="round"/>
    </g>
    <g class="c-leg-l"><path d="M88 182 q-6 18 2 26" fill="none" stroke="#5a9aba" stroke-width="6" stroke-linecap="round"/></g>
    <g class="c-leg-r"><path d="M116 182 q6 18 -2 26" fill="none" stroke="#5a9aba" stroke-width="6" stroke-linecap="round"/></g>
    <path d="M102 96 l22 22 v54 l-22 20 -22 -20 v-54 z" fill="#c8ecff" stroke="#3a7a9a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M80 140 h44 M80 160 h44" stroke="#7ab8d8" stroke-width="3"/>
    <g class="c-head">
      ${eyes(92,112,116,8,"#2a9ad8",st)}${brows(92,112,102,"#3a7a9a")}
      <path d="M96 132 q6 8 12 0" fill="none" stroke="#3a7a9a" stroke-width="2.6" stroke-linecap="round"/>
      ${st>=2?`<g class="c-crown-ice"><path d="M80 92 l8 -22 8 14 6 -20 6 20 8 -14 8 22 z" fill="#e8f8ff" stroke="#3a7a9a" stroke-width="3"/></g>`:""}
    </g>
    ${st>=3?`<g class="c-blades"><path d="M56 152 l-18 40 M148 152 l18 40" stroke="#a8e6ff" stroke-width="6" stroke-linecap="round"/></g>`:""}
    ${st>=4?`<g class="c-storm"><path d="M30 60 l10 14 -8 2 12 16 M174 60 l-10 14 8 2 -12 16" fill="none" stroke="#e8f8ff" stroke-width="3" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#a8e6ff",102,114,84)}
  </g>`;
});

def("an-snowfox", function(st){
  return svgOpen(224,234,"snowfox") + shadow(112,220,48,11) + `
  ${aura(st,"#dff2ff",112,116,76)}
  <g class="c-body">
    <g class="c-tail"><path d="M154 156 q50 -4 48 -52 q-16 26 -48 30 q-14 2 -20 -4 z" fill="#eaf6ff" stroke="#5a8aa8" stroke-width="4" stroke-linejoin="round"/>
      <path d="M186 118 q14 -14 16 -28" stroke="#a8d8f0" stroke-width="6" stroke-linecap="round"/></g>
    <g class="c-leg-l"><rect x="82" y="176" width="18" height="36" rx="8" fill="#eaf6ff" stroke="#5a8aa8" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="122" y="176" width="18" height="36" rx="8" fill="#eaf6ff" stroke="#5a8aa8" stroke-width="4"/></g>
    <ellipse cx="112" cy="150" rx="36" ry="38" fill="#f4faff" stroke="#5a8aa8" stroke-width="4"/>
    <g class="c-head">
      <path d="M82 64 l-8 -30 28 16 z" fill="#f4faff" stroke="#5a8aa8" stroke-width="4" stroke-linejoin="round"/>
      <path d="M142 64 l8 -30 -28 16 z" fill="#f4faff" stroke="#5a8aa8" stroke-width="4" stroke-linejoin="round"/>
      <path d="M78 58 l-4 -18 16 10 z" fill="#a8d8f0"/><path d="M146 58 l4 -18 -16 10 z" fill="#a8d8f0"/>
      <ellipse cx="112" cy="94" rx="38" ry="34" fill="#fbfeff" stroke="#5a8aa8" stroke-width="4"/>
      <ellipse cx="112" cy="110" rx="17" ry="12" fill="#e0f0ff" stroke="#5a8aa8" stroke-width="3"/>
      <path d="M106 106 l6 7 6 -7 z" fill="#3a5a78"/>
      ${eyes(97,127,90,9,"#4ab8e8",st)}${brows(97,127,74,"#5a8aa8")}
      <path d="M104 118 q8 7 16 0" fill="none" stroke="#5a8aa8" stroke-width="2.6" stroke-linecap="round"/>
      <g class="c-whisk"><path d="M66 106 l-24 -8 M66 114 l-24 4 M158 106 l24 -8 M158 114 l24 4" stroke="#a8d8f0" stroke-width="3" stroke-linecap="round"/></g>
      ${st>=3?`<circle cx="112" cy="66" r="8" fill="#a8e6ff" stroke="#3a7a9a" stroke-width="3" filter="url(#anGlow)"/>`:""}
    </g>
    ${st>=4?`<g class="c-nine"><path d="M158 140 q30 6 34 30 q-26 -8 -34 -30 z" fill="#dff2ff" stroke="#5a8aa8" stroke-width="3" opacity=".8"/>
      <path d="M166 158 q30 8 32 32 q-26 -10 -32 -32 z" fill="#dff2ff" stroke="#5a8aa8" stroke-width="3" opacity=".6"/></g>`:""}
    ${orbitRunes(st,"#dff2ff",112,116,90)}
  </g>`;
});

def("an-moonrab", function(st){
  return svgOpen(200,238,"moonrab") + shadow(100,224,40,10) + `
  ${aura(st,"#e6d6ff",100,118,74)}
  <g class="c-body">
    <g class="c-ear-l"><path d="M78 74 q-16 -50 -4 -62 q16 8 22 58 z" fill="#f0e8ff" stroke="#6a4a9a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M80 68 q-8 -34 -2 -42 q8 8 12 40 z" fill="#ffc8e0"/></g>
    <g class="c-ear-r"><path d="M122 74 q16 -50 4 -62 q-16 8 -22 58 z" fill="#f0e8ff" stroke="#6a4a9a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M120 68 q8 -34 2 -42 q-8 8 -12 40 z" fill="#ffc8e0"/></g>
    <g class="c-leg-l"><ellipse cx="84" cy="186" rx="18" ry="12" fill="#e8dcff" stroke="#6a4a9a" stroke-width="4"/></g>
    <g class="c-leg-r"><ellipse cx="116" cy="186" rx="18" ry="12" fill="#e8dcff" stroke="#6a4a9a" stroke-width="4"/></g>
    <ellipse cx="100" cy="152" rx="34" ry="36" fill="#f4eeff" stroke="#6a4a9a" stroke-width="4"/>
    <g class="c-arm-l"><path d="M70 146 q-22 8 -26 28" fill="none" stroke="#e8dcff" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M130 146 q22 8 26 28" fill="none" stroke="#e8dcff" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-head">
      <ellipse cx="100" cy="100" rx="36" ry="32" fill="#fbf8ff" stroke="#6a4a9a" stroke-width="4"/>
      ${eyes(88,112,98,9,"#c84ab8",st)}${brows(88,112,82,"#6a4a9a")}
      <ellipse cx="100" cy="114" rx="10" ry="8" fill="#ffc8e0" stroke="#6a4a9a" stroke-width="2.6"/>
      <path d="M92 122 q8 8 16 0" fill="none" stroke="#6a4a9a" stroke-width="2.6" stroke-linecap="round"/>
      <g class="c-whisk"><path d="M62 110 l-20 -6 M62 118 l-20 4 M138 110 l20 -6 M138 118 l20 4" stroke="#b8a0d8" stroke-width="3" stroke-linecap="round"/></g>
    </g>
    <g class="c-moon"><circle cx="100" cy="52" r="20" fill="#fff8d8" stroke="#c8a840" stroke-width="3" opacity=".9"/>
      <circle cx="94" cy="46" r="4" fill="#e8d8a0"/><circle cx="108" cy="56" r="3" fill="#e8d8a0"/></g>
    ${st>=3?`<g class="c-pestle"><path d="M156 92 l-8 76" stroke="#8a6a3a" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="154" cy="88" rx="14" ry="20" fill="#d8c8a8" stroke="#8a6a3a" stroke-width="3"/></g>`:""}
    ${orbitRunes(st,"#e6d6ff",100,118,86)}
  </g>`;
});

def("an-yuki", function(st){
  return svgOpen(208,240,"yuki") + shadow(104,226,44,10) + `
  ${aura(st,"#bde8ff",104,118,76)}
  <g class="c-body">
    <g class="c-robe">
      <path d="M104 96 q34 6 42 42 l14 76 q-56 16 -112 0 l14 -76 q8 -36 42 -42 z" fill="#dff2ff" stroke="#4a8ab0" stroke-width="4" stroke-linejoin="round"/>
      <path d="M104 100 v108" stroke="#a8d8f0" stroke-width="4"/>
      <path d="M62 158 h84" stroke="#a8d8f0" stroke-width="4"/>
      <path d="M76 138 q28 -14 56 0" fill="none" stroke="#ff9bd0" stroke-width="5"/>
      <path d="M58 200 q46 14 92 0" fill="none" stroke="#ff9bd0" stroke-width="5"/>
    </g>
    <g class="c-sleeve-l"><path d="M70 112 q-38 22 -40 62 q22 -6 34 -22 z" fill="#eaf8ff" stroke="#4a8ab0" stroke-width="4" stroke-linejoin="round"/></g>
    <g class="c-sleeve-r"><path d="M138 112 q38 22 40 62 q-22 -6 -34 -22 z" fill="#eaf8ff" stroke="#4a8ab0" stroke-width="4" stroke-linejoin="round"/></g>
    <g class="c-head">
      <path d="M104 30 q40 4 40 42 q-40 12 -80 0 q0 -38 40 -42 z" fill="#1a2440" stroke="#0a1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M104 34 q22 2 30 22 q-30 8 -60 0 q8 -20 30 -22 z" fill="#2a3a60"/>
      <ellipse cx="104" cy="94" rx="34" ry="32" fill="#fdf4ee" stroke="#4a8ab0" stroke-width="4"/>
      ${eyes(92,116,92,9,"#4ab8e8",st)}${brows(92,116,76,"#3a6a88")}
      <path d="M100 108 q4 6 8 0" fill="none" stroke="#c88a9a" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M96 116 q8 7 16 0" fill="none" stroke="#c88a9a" stroke-width="2.6" stroke-linecap="round"/>
      ${st>=2?`<g class="c-frostpin"><path d="M136 46 l10 -14 10 14 -10 14 z" fill="#a8e6ff" stroke="#3a7a9a" stroke-width="3"/></g>`:""}
    </g>
    ${st>=3?`<g class="c-fan"><path d="M156 150 q30 -10 38 8 q-20 12 -38 -8 z" fill="#eaf8ff" stroke="#4a8ab0" stroke-width="3"/>
      <path d="M162 152 l28 6 M164 158 l24 2 M168 146 l22 10" stroke="#a8d8f0" stroke-width="2"/></g>`:""}
    ${st>=4?`<g class="c-snow"><circle cx="40" cy="60" r="4" fill="#fff" opacity=".9"/><circle cx="176" cy="46" r="5" fill="#fff" opacity=".85"/>
      <circle cx="30" cy="120" r="3" fill="#fff" opacity=".8"/><circle cx="186" cy="110" r="4" fill="#fff" opacity=".8"/></g>`:""}
    ${orbitRunes(st,"#bde8ff",104,118,88)}
  </g>`;
});

def("an-mirror", function(st){
  return svgOpen(208,236,"mirror") + shadow(104,222,44,10) + `
  ${aura(st,"#c9d8ff",104,116,74)}
  <g class="c-body">
    <ellipse cx="104" cy="188" rx="34" ry="12" fill="#8a94b8" stroke="#3a4260" stroke-width="4"/>
    <g class="c-frame">
      <ellipse cx="104" cy="106" rx="52" ry="66" fill="#e8eeff" stroke="#5a6a9a" stroke-width="5"/>
      <ellipse cx="104" cy="106" rx="42" ry="56" fill="#c9d8ff" opacity=".55"/>
      <path d="M104 50 q30 26 0 112" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>
      <path d="M76 62 q-14 44 0 88" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>
      ${st>=2?`<g class="c-crack"><path d="M78 74 l22 26 -14 22 M132 84 l-16 22 12 20" fill="none" stroke="#5a6a9a" stroke-width="3"/></g>`:""}
    </g>
    <g class="c-head">
      <ellipse cx="104" cy="106" rx="30" ry="34" fill="rgba(20,26,52,.55)"/>
      ${eyes(94,114,100,8,"#c9d8ff",st)}
      <path d="M96 120 q8 8 16 0" fill="none" stroke="#c9d8ff" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    <g class="c-arm-l"><path d="M58 128 q-22 14 -24 40" fill="none" stroke="#a8b4d8" stroke-width="10" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M150 128 q22 14 24 40" fill="none" stroke="#a8b4d8" stroke-width="10" stroke-linecap="round"/></g>
    ${st>=3?`<g class="c-shard"><path d="M162 66 l14 18 -14 20 -14 -20 z" fill="#e8eeff" stroke="#5a6a9a" stroke-width="3" opacity=".9"/>
      <path d="M46 66 l-14 18 14 20 14 -20 z" fill="#e8eeff" stroke="#5a6a9a" stroke-width="3" opacity=".9"/></g>`:""}
    ${st>=4?`<g class="c-double"><ellipse cx="104" cy="106" rx="62" ry="76" fill="none" stroke="#c9d8ff" stroke-width="3" opacity=".5" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#c9d8ff",104,116,88)}
  </g>`;
});

/* --- 6. ТЁМНЫЕ КУЛЬТИВАТОРЫ ---------------------------------------------- */

def("an-jiangshi", function(st){
  return svgOpen(204,240,"jiang") + shadow(102,226,42,10) + `
  ${aura(st,"#8fd6c0",102,118,74)}
  <g class="c-body">
    <g class="c-robe">
      <path d="M102 92 q36 4 46 40 l10 84 q-56 14 -112 0 l10 -84 q10 -36 46 -40 z" fill="#2a4a5a" stroke="#0a1a24" stroke-width="4" stroke-linejoin="round"/>
      <path d="M102 96 v116" stroke="#1a3a4a" stroke-width="4"/>
      <path d="M66 150 q36 -14 72 0" fill="none" stroke="#ffd166" stroke-width="5"/>
      <circle cx="82" cy="168" r="5" fill="#ffd166"/><circle cx="102" cy="176" r="5" fill="#ffd166"/><circle cx="122" cy="168" r="5" fill="#ffd166"/>
    </g>
    <g class="c-arm-l"><path d="M64 120 q-28 6 -38 34" fill="none" stroke="#3a5a6a" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M140 120 q28 6 38 34" fill="none" stroke="#3a5a6a" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M102 26 q34 4 34 38 q-34 12 -68 0 q0 -34 34 -38 z" fill="#1a2a34" stroke="#0a1a24" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="102" cy="88" rx="34" ry="32" fill="#a8d6c0" stroke="#1a4a3a" stroke-width="4"/>
      <path d="M78 62 h48" stroke="#ffd166" stroke-width="7" stroke-linecap="round"/>
      <text x="102" y="60" font-size="14" fill="#ffd166" text-anchor="middle" font-family="serif">敕</text>
      ${eyes(90,114,86,8,"#7fff7f",st)}
      <path d="M92 106 h20" stroke="#1a4a3a" stroke-width="3" stroke-linecap="round"/>
      ${st>=2?`<path d="M92 108 h6 v14 h-6 z M106 108 h6 v14 h-6 z" fill="#fff" stroke="#1a4a3a" stroke-width="2"/>`:""}
    </g>
    ${st>=3?`<g class="c-arms-out"><path d="M50 120 q-26 4 -34 6 M154 120 q26 4 34 6" stroke="#a8d6c0" stroke-width="10" stroke-linecap="round"/></g>`:""}
    ${st>=4?`<g class="c-talismans"><rect x="30" y="60" width="18" height="34" rx="3" fill="#ffe066" stroke="#a03a10" stroke-width="2"/>
      <rect x="156" y="60" width="18" height="34" rx="3" fill="#ffe066" stroke="#a03a10" stroke-width="2"/></g>`:""}
    ${orbitRunes(st,"#8fd6c0",102,118,86)}
  </g>`;
});

def("an-ghoul", function(st){
  return svgOpen(206,238,"ghoul") + shadow(103,224,44,10) + `
  ${aura(st,"#a0a8c0",103,118,74)}
  <g class="c-body">
    <g class="c-robe">
      <path d="M103 96 q36 4 44 40 l12 82 q-56 14 -112 0 l12 -82 q8 -36 44 -40 z" fill="#6a7288" stroke="#2a3040" stroke-width="4" stroke-linejoin="round"/>
      <path d="M103 100 v114" stroke="#4a5268" stroke-width="4"/>
      <path d="M68 156 q35 -12 70 0" fill="none" stroke="#8a5a2a" stroke-width="8"/>
      <circle cx="103" cy="156" r="8" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>
    </g>
    <g class="c-arm-l"><path d="M70 122 q-30 6 -40 36" fill="none" stroke="#7a8298" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M136 122 q30 6 40 36" fill="none" stroke="#7a8298" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-head">
      <ellipse cx="103" cy="88" rx="38" ry="34" fill="#98a0b8" stroke="#2a3040" stroke-width="4"/>
      <path d="M72 62 q31 -14 62 0 q-31 10 -62 0 z" fill="#4a5268" stroke="#2a3040" stroke-width="3"/>
      ${eyes(90,116,86,9,"#c88aff",st)}
      <path d="M88 108 q15 14 30 0 q-15 -4 -30 0 z" fill="#1a1f2e"/>
      ${st>=2?`<path d="M92 108 l4 10 4 -10 z M106 108 l4 10 4 -10 z" fill="#fff"/>`:""}
      ${st>=3?`<g class="c-beads"><circle cx="60" cy="140" r="7" fill="#a86b3a" stroke="#5a3a10" stroke-width="2"/>
        <circle cx="60" cy="160" r="7" fill="#a86b3a" stroke="#5a3a10" stroke-width="2"/>
        <circle cx="60" cy="180" r="7" fill="#a86b3a" stroke="#5a3a10" stroke-width="2"/></g>`:""}
    </g>
    ${st>=4?`<g class="c-halo-dark"><circle cx="103" cy="88" r="62" fill="none" stroke="#4a3040" stroke-width="6" opacity=".6"/>
      <circle cx="103" cy="88" r="70" fill="none" stroke="#c88aff" stroke-width="3" opacity=".5" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#a0a8c0",103,118,86)}
  </g>`;
});

def("an-wraith", function(st){
  return svgOpen(210,238,"wraith") + shadow(105,224,42,10) + `
  ${aura(st,"#9bb8ff",105,116,76)}
  <g class="c-body">
    <g class="c-cloak">
      <path d="M105 40 q46 10 48 56 q2 44 -10 74 q-38 16 -76 0 q-12 -30 -10 -74 q2 -46 48 -56 z" fill="#3a4a7a" stroke="#1a2244" stroke-width="4" stroke-linejoin="round"/>
      <path d="M105 44 q26 6 30 40 q-30 10 -60 0 q4 -34 30 -40 z" fill="#4a5a8a"/>
      <path d="M105 96 v78" stroke="#2a3a6a" stroke-width="4"/>
      <path d="M62 148 q43 14 86 0" fill="none" stroke="#8a9ad8" stroke-width="4"/>
    </g>
    <g class="c-arm-l"><path d="M64 116 q-30 8 -40 34" fill="none" stroke="#4a5a8a" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M146 116 q30 8 40 34" fill="none" stroke="#4a5a8a" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-head">
      <ellipse cx="105" cy="86" rx="32" ry="30" fill="rgba(24,32,64,.92)" stroke="#8a9ad8" stroke-width="3"/>
      ${eyes(93,117,84,8,"#8fd8ff",st)}
      <path d="M96 100 q9 9 18 0" fill="none" stroke="#8a9ad8" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    <g class="c-sword">
      <path d="M170 44 l8 96" stroke="#dfe8ff" stroke-width="8" stroke-linecap="round"/>
      <path d="M162 140 h30" stroke="#c8a840" stroke-width="6" stroke-linecap="round"/>
      <path d="M176 146 v20" stroke="#8a5a2a" stroke-width="7" stroke-linecap="round"/>
    </g>
    ${st>=2?`<g class="c-flame-soul"><path d="M70 174 q10 14 4 24 q-8 -8 -12 -2 q-4 -12 8 -22 z" fill="#8fd8ff" opacity=".8"/>
      <path d="M140 174 q10 14 4 24 q-8 -8 -12 -2 q-4 -12 8 -22 z" fill="#8fd8ff" opacity=".8"/></g>`:""}
    ${st>=4?`<g class="c-swords"><path d="M34 120 l14 40 M176 120 l-14 40" stroke="#dfe8ff" stroke-width="5" stroke-linecap="round" opacity=".8"/></g>`:""}
    ${orbitRunes(st,"#9bb8ff",105,116,86)}
  </g>`;
});

def("an-oni", function(st){
  return svgOpen(216,238,"oni") + shadow(108,224,50,11) + `
  ${aura(st,"#ff7b7b",108,116,76)}
  <g class="c-body">
    <g class="c-leg-l"><rect x="76" y="170" width="26" height="44" rx="10" fill="#c8483a" stroke="#5a1408" stroke-width="4"/>
      <ellipse cx="89" cy="216" rx="20" ry="11" fill="#3a2a1a" stroke="#5a1408" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="114" y="170" width="26" height="44" rx="10" fill="#c8483a" stroke="#5a1408" stroke-width="4"/>
      <ellipse cx="127" cy="216" rx="20" ry="11" fill="#3a2a1a" stroke="#5a1408" stroke-width="4"/></g>
    <path d="M108 96 q42 6 50 44 l8 42 q-58 16 -116 0 l8 -42 q8 -38 50 -44 z" fill="#e05a48" stroke="#5a1408" stroke-width="4" stroke-linejoin="round"/>
    <path d="M74 140 q34 -12 68 0" fill="none" stroke="#ffd166" stroke-width="7"/>
    <g class="c-arm-l"><path d="M66 118 q-32 10 -40 42" fill="none" stroke="#d04a38" stroke-width="15" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M150 118 q32 10 40 42" fill="none" stroke="#d04a38" stroke-width="15" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M78 62 l-12 -32 30 16 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/>
      <path d="M138 62 l12 -32 -30 16 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="108" cy="88" rx="44" ry="38" fill="#e8705a" stroke="#5a1408" stroke-width="4"/>
      <path d="M72 60 q36 -14 72 0 q-36 10 -72 0 z" fill="#7a1a0a"/>
      ${eyes(92,124,84,10,"#ffe066",st)}${brows(92,124,64,"#5a1408",5)}
      <path d="M86 106 q22 18 44 0 q-22 -6 -44 0 z" fill="#3a0a04"/>
      ${st>=2?`<path d="M92 106 l4 12 4 -12 z M108 108 l4 12 4 -12 z M124 106 l4 10 4 -10 z" fill="#fff"/>`:""}
    </g>
    ${st>=3?`<g class="c-club"><path d="M176 60 l14 96" stroke="#8a6a3a" stroke-width="13" stroke-linecap="round"/>
      <path d="M170 48 q16 -8 26 4 q-14 12 -26 -4 z" fill="#a88a5a" stroke="#5a3a10" stroke-width="3"/>
      <path d="M174 60 l4 10 M182 58 l4 10" stroke="#5a3a10" stroke-width="3"/></g>`:""}
    ${st>=4?`<g class="c-fire"><path d="M40 96 q14 20 4 38 q-10 -14 -18 -4 q-4 -20 14 -34 z" fill="#ff6b1a" opacity=".85"/></g>`:""}
    ${orbitRunes(st,"#ff7b7b",108,116,92)}
  </g>`;
});

def("an-assassin", function(st){
  return svgOpen(212,236,"assin") + shadow(106,222,44,10) + `
  ${aura(st,"#b48bff",106,114,76)}
  <g class="c-body">
    <g class="c-cloak">
      <path d="M106 44 q44 8 46 52 q2 42 -12 72 q-34 14 -68 0 q-14 -30 -12 -72 q2 -44 46 -52 z" fill="#2a2444" stroke="#120e24" stroke-width="4" stroke-linejoin="round"/>
      <path d="M106 48 q26 6 28 38 q-28 10 -56 0 q2 -32 28 -38 z" fill="#3a3258"/>
      <path d="M64 150 q42 14 84 0" fill="none" stroke="#b48bff" stroke-width="4"/>
      <path d="M106 100 v72" stroke="#3a3258" stroke-width="4"/>
    </g>
    <g class="c-arm-l"><path d="M66 118 q-30 8 -40 36" fill="none" stroke="#3a3258" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M146 118 q30 8 40 36" fill="none" stroke="#3a3258" stroke-width="11" stroke-linecap="round"/></g>
    <g class="c-head">
      <ellipse cx="106" cy="86" rx="30" ry="28" fill="rgba(16,12,30,.95)" stroke="#b48bff" stroke-width="3"/>
      ${eyes(95,117,84,8,"#e08aff",st)}
      <path d="M88 74 q18 -8 36 0" fill="none" stroke="#b48bff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    </g>
    <g class="c-daggers">
      <path d="M52 148 l-16 30 M160 148 l16 30" stroke="#dfe8ff" stroke-width="6" stroke-linecap="round"/>
      <path d="M36 178 l-6 12 M176 178 l6 12" stroke="#8a9ad8" stroke-width="5" stroke-linecap="round"/>
    </g>
    ${st>=2?`<g class="c-mist"><ellipse cx="106" cy="196" rx="54" ry="16" fill="#b48bff" opacity=".22" filter="url(#anSoft)"/></g>`:""}
    ${st>=3?`<g class="c-daggers2"><path d="M40 108 l-12 26 M172 108 l12 26" stroke="#dfe8ff" stroke-width="5" stroke-linecap="round"/></g>`:""}
    ${st>=4?`<g class="c-shadow2"><ellipse cx="150" cy="150" rx="22" ry="46" fill="#120e24" opacity=".5"/></g>`:""}
    ${orbitRunes(st,"#b48bff",106,114,88)}
  </g>`;
});

/* Экспорт арта врагов готов */
})();

/* ===========================================================================
   ЧАСТЬ 3. АРТ 7 БОССОВ
   Боссы крупнее (viewBox выше), с титулом на табличке и усиленными стадиями:
   со 2-й стадии — свечение и вторая аура, с 3-й — оружие и свита,
   с 4-й — большое кольцо ци и парящие руны по кругу.
   =========================================================================== */
(function(){
"use strict";
const H = window.__animeHelpers;
const { svgOpen, shadow, eyes, brows, aura, orbitRunes, def } = H;
const ART = H.ART;

/* Табличка с титулом босса — рисуется над головой. */
function titlePlate(txt, col, x, y){
  const w = Math.max(96, [...txt].length * 11 + 22);
  return `<g class="c-title">
    <rect x="${x-w/2}" y="${y}" width="${w}" height="28" rx="6" fill="rgba(10,12,26,.82)" stroke="${col}" stroke-width="2.5"/>
    <text x="${x}" y="${y+19}" font-size="15" fill="${col}" text-anchor="middle" font-family="serif">${txt}</text>
  </g>`;
}

/* Большое кольцо ци для 4-й стадии боссов. */
function qiRing(st, col, cx, cy, r){
  if(st < 4) return "";
  return `<g class="c-qiring">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="4" opacity=".55" filter="url(#anGlow)"/>
    <circle cx="${cx}" cy="${cy}" r="${r+14}" fill="none" stroke="${col}" stroke-width="2" opacity=".35"/>
    <circle cx="${cx}" cy="${cy}" r="${r-14}" fill="none" stroke="${col}" stroke-width="2" opacity=".3"/>
  </g>`;
}

/* --- БОСС 1: Багровый генерал ------------------------------------------- */
def("bos-lord", function(st){
  return svgOpen(240,266,"blord") + shadow(120,250,62,13) + `
  ${aura(st,"#ff6b6b",120,140,86)}
  ${qiRing(st,"#ff6b6b",120,140,104)}
  <g class="c-body">
    <g class="c-leg-l"><rect x="84" y="188" width="28" height="52" rx="11" fill="#8a2a2a" stroke="#3a0a0a" stroke-width="4"/>
      <ellipse cx="98" cy="244" rx="24" ry="12" fill="#2a1a1a" stroke="#3a0a0a" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="128" y="188" width="28" height="52" rx="11" fill="#8a2a2a" stroke="#3a0a0a" stroke-width="4"/>
      <ellipse cx="142" cy="244" rx="24" ry="12" fill="#2a1a1a" stroke="#3a0a0a" stroke-width="4"/></g>
    <path d="M120 104 q48 8 56 50 l8 40 q-64 18 -128 0 l8 -40 q8 -42 56 -50 z" fill="#c03a3a" stroke="#3a0a0a" stroke-width="5" stroke-linejoin="round"/>
    <path d="M80 122 q40 -16 80 0 l-6 16 q-34 -12 -68 0 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>
    <path d="M82 156 q38 -14 76 0" fill="none" stroke="#ffd166" stroke-width="7"/>
    <path d="M120 100 v96" stroke="#8a2a2a" stroke-width="5"/>
    <g class="c-arm-l"><path d="M74 128 q-36 12 -44 48" fill="none" stroke="#a83030" stroke-width="17" stroke-linecap="round"/>
      <path d="M30 176 q-10 6 -12 16" fill="none" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M166 128 q36 12 44 48" fill="none" stroke="#a83030" stroke-width="17" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M120 34 q40 4 40 44 q-40 14 -80 0 q0 -40 40 -44 z" fill="#2a1a2a" stroke="#0a0508" stroke-width="4" stroke-linejoin="round"/>
      <path d="M88 56 l-14 -28 30 14 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/>
      <path d="M152 56 l14 -28 -30 14 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="120" cy="104" rx="42" ry="36" fill="#d05a4a" stroke="#3a0a0a" stroke-width="5"/>
      <path d="M84 78 q36 -14 72 0 q-36 10 -72 0 z" fill="#5a1010"/>
      ${eyes(104,136,100,10,"#ffcf2b",st)}
      ${brows(104,136,80,"#3a0a0a",5)}
      <path d="M100 122 q20 16 40 0 q-20 -6 -40 0 z" fill="#2a0505"/>
      ${st>=2?`<path d="M106 122 l4 12 4 -12 z M118 124 l4 12 4 -12 z M132 122 l4 10 4 -10 z" fill="#fff"/>`:""}
      ${st>=3?`<path d="M92 140 q28 16 56 0" fill="none" stroke="#ffd166" stroke-width="5"/>`:""}
    </g>
    <g class="c-blade">
      <path d="M196 44 l16 132" stroke="#e8eeff" stroke-width="11" stroke-linecap="round"/>
      <path d="M188 168 h34" stroke="#c8a840" stroke-width="7" stroke-linecap="round"/>
      <path d="M204 176 v26" stroke="#8a5a2a" stroke-width="9" stroke-linecap="round"/>
      ${st>=3?`<path d="M186 60 l20 12 M184 80 l20 12" stroke="#ffcf2b" stroke-width="3" opacity=".8"/>`:""}
    </g>
    ${st>=3?`<g class="c-banner"><path d="M40 40 v180" stroke="#5a3a10" stroke-width="8" stroke-linecap="round"/>
      <path d="M40 44 q34 6 36 32 q-34 8 -36 -32 z" fill="#c03a3a" stroke="#5a0a0a" stroke-width="3"/>
      <text x="58" y="72" font-size="19" fill="#ffd166" text-anchor="middle" font-family="serif">将</text></g>`:""}
    ${st>=4?`<g class="c-guards"><path d="M18 200 q-6 -60 20 -86 q-8 44 4 86 z" fill="#8a2a2a" opacity=".7"/>
      <path d="M222 200 q6 -60 -20 -86 q8 44 -4 86 z" fill="#8a2a2a" opacity=".7"/></g>`:""}
    ${orbitRunes(st,"#ff6b6b",120,140,108)}
  </g>`;
});

/* --- БОСС 2: Нефритовая змея -------------------------------------------- */
def("bos-serpent", function(st){
  return svgOpen(250,262,"bserp") + shadow(125,246,66,13) + `
  ${aura(st,"#5cffc2",125,136,90)}
  ${qiRing(st,"#5cffc2",125,136,108)}
  <g class="c-body">
    <g class="c-coil">
      <path d="M60 232 q-24 -40 20 -58 q50 -20 90 0 q44 18 20 58 q-64 20 -130 0 z" fill="#2f8a68" stroke="#0e3a2a" stroke-width="5" stroke-linejoin="round"/>
      <path d="M74 210 q52 -18 102 0" fill="none" stroke="#5cffc2" stroke-width="6" opacity=".7"/>
      <ellipse cx="125" cy="196" rx="56" ry="34" fill="#3aa87c" stroke="#0e3a2a" stroke-width="5"/>
      <path d="M92 186 q33 -12 66 0 M96 206 q29 10 58 0" fill="none" stroke="#2f8a68" stroke-width="5"/>
    </g>
    <g class="c-neck"><path d="M125 186 q-30 -40 -6 -78 q22 -36 -8 -62" fill="none" stroke="#3aa87c" stroke-width="26" stroke-linecap="round"/>
      <path d="M125 186 q-30 -40 -6 -78 q22 -36 -8 -62" fill="none" stroke="#5cffc2" stroke-width="7" stroke-linecap="round" opacity=".55"/></g>
    <g class="c-head">
      <path d="M104 58 q-34 -14 -44 -40 q30 2 44 22 z" fill="#4ac890" stroke="#0e3a2a" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="118" cy="56" rx="44" ry="30" fill="#4ac890" stroke="#0e3a2a" stroke-width="5"/>
      <path d="M118 66 q-16 10 -26 6 q12 6 26 6 q14 0 26 -6 q-10 4 -26 -6 z" fill="#ff6b9d" stroke="#0e3a2a" stroke-width="3"/>
      ${eyes(104,132,50,10,"#ffd166",st)}
      ${brows(104,132,32,"#0e3a2a",5)}
      <path d="M124 70 l-8 10 h16 z" fill="#fff" stroke="#0e3a2a" stroke-width="2"/>
      ${st>=2?`<g class="c-horns"><path d="M92 34 l-10 -26 20 14 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4"/>
        <path d="M144 34 l10 -26 -20 14 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4"/></g>`:""}
      ${st>=3?`<g class="c-jade"><circle cx="118" cy="12" r="13" fill="#5cffc2" stroke="#0e3a2a" stroke-width="3" filter="url(#anGlow)"/>
        <text x="118" y="18" font-size="15" fill="#0e3a2a" text-anchor="middle" font-family="serif">玉</text></g>`:""}
    </g>
    ${st>=3?`<g class="c-rain"><path d="M32 60 q-6 26 4 44 M218 60 q6 26 -4 44 M46 110 q-6 26 4 44 M194 110 q6 26 -4 44"
      fill="none" stroke="#5cffc2" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>`:""}
    ${st>=4?`<g class="c-flood"><path d="M24 226 q24 -12 48 0 t48 0 t48 0 t48 0" fill="none" stroke="#5cffc2" stroke-width="6" opacity=".8" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#5cffc2",125,136,114)}
  </g>`;
});

/* --- БОСС 3: Монах-отступник -------------------------------------------- */
def("bos-monk", function(st){
  return svgOpen(238,264,"bmonk") + shadow(119,248,58,12) + `
  ${aura(st,"#ffb86b",119,138,88)}
  ${qiRing(st,"#ffb86b",119,138,106)}
  <g class="c-body">
    <g class="c-robe">
      <path d="M119 100 q50 8 58 52 l10 82 q-68 18 -136 0 l10 -82 q8 -44 58 -52 z" fill="#c88a3a" stroke="#5a3a10" stroke-width="5" stroke-linejoin="round"/>
      <path d="M119 104 v128" stroke="#a06a20" stroke-width="5"/>
      <path d="M62 168 q57 -18 114 0" fill="none" stroke="#8a5a10" stroke-width="8"/>
      <path d="M78 140 q41 -20 82 0" fill="none" stroke="#ffd166" stroke-width="6"/>
      <circle cx="100" cy="196" r="7" fill="#ffd166"/><circle cx="119" cy="204" r="7" fill="#ffd166"/><circle cx="138" cy="196" r="7" fill="#ffd166"/>
    </g>
    <g class="c-arm-l"><path d="M70 128 q-34 12 -42 46" fill="none" stroke="#b87a2a" stroke-width="16" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M168 128 q34 12 42 46" fill="none" stroke="#b87a2a" stroke-width="16" stroke-linecap="round"/></g>
    <g class="c-beads"><circle cx="56" cy="184" r="9" fill="#a86b3a" stroke="#3a1a05" stroke-width="3"/>
      <circle cx="56" cy="208" r="9" fill="#a86b3a" stroke="#3a1a05" stroke-width="3"/>
      <circle cx="56" cy="232" r="9" fill="#a86b3a" stroke="#3a1a05" stroke-width="3"/></g>
    <g class="c-head">
      <ellipse cx="119" cy="92" rx="44" ry="40" fill="#e8b06a" stroke="#5a3a10" stroke-width="5"/>
      <path d="M75 78 q44 -18 88 0 q-44 12 -88 0 z" fill="#3a2408" opacity=".25"/>
      ${eyes(103,135,90,11,"#ff7b1a",st)}
      ${brows(103,135,68,"#5a3a10",5)}
      <path d="M108 112 q11 12 22 0" fill="none" stroke="#5a3a10" stroke-width="3.4" stroke-linecap="round"/>
      ${st>=2?`<g class="c-scar"><path d="M84 74 l16 14 M144 74 l-16 14" stroke="#c83a3a" stroke-width="5" stroke-linecap="round"/></g>`:""}
      ${st>=3?`<g class="c-halo-monk"><circle cx="119" cy="52" r="30" fill="none" stroke="#ffd166" stroke-width="5" filter="url(#anGlow)"/>
        <circle cx="119" cy="52" r="22" fill="none" stroke="#ffb86b" stroke-width="3"/></g>`:""}
    </g>
    <g class="c-staff">
      <path d="M196 36 v168" stroke="#8a5a2a" stroke-width="11" stroke-linecap="round"/>
      <path d="M182 36 q14 -18 28 0 q-14 12 -28 0 z" fill="#ffd166" stroke="#8a5a00" stroke-width="3"/>
      ${st>=3?`<g class="c-flame-staff"><path d="M196 20 q12 16 4 28 q-10 -10 -14 -2 q-4 -16 10 -26 z" fill="#ff6b1a" opacity=".9"/></g>`:""}
    </g>
    ${st>=4?`<g class="c-sutra"><rect x="24" y="60" width="34" height="90" rx="5" fill="#ffe066" stroke="#a03a10" stroke-width="3"/>
      <path d="M32 78 h18 M32 96 h18 M32 114 h18 M32 132 h18" stroke="#a03a10" stroke-width="3"/>
      <rect x="180" y="60" width="34" height="90" rx="5" fill="#ffe066" stroke="#a03a10" stroke-width="3"/>
      <path d="M188 78 h18 M188 96 h18 M188 114 h18 M188 132 h18" stroke="#a03a10" stroke-width="3"/></g>`:""}
    ${orbitRunes(st,"#ffb86b",119,138,110)}
  </g>`;
});

/* --- БОСС 4: Генерал Тысячи Копий --------------------------------------- */
def("bos-warlord", function(st){
  return svgOpen(256,264,"bwarl") + shadow(128,248,66,13) + `
  ${aura(st,"#ffd166",128,138,92)}
  ${qiRing(st,"#ffd166",128,138,112)}
  <g class="c-body">
    <g class="c-leg-l"><rect x="88" y="188" width="30" height="52" rx="12" fill="#6a5a2a" stroke="#2a2008" stroke-width="4"/>
      <ellipse cx="103" cy="244" rx="25" ry="13" fill="#2a2418" stroke="#2a2008" stroke-width="4"/></g>
    <g class="c-leg-r"><rect x="138" y="188" width="30" height="52" rx="12" fill="#6a5a2a" stroke="#2a2008" stroke-width="4"/>
      <ellipse cx="153" cy="244" rx="25" ry="13" fill="#2a2418" stroke="#2a2008" stroke-width="4"/></g>
    <path d="M128 100 q52 8 60 52 l10 42 q-70 20 -140 0 l10 -42 q8 -44 60 -52 z" fill="#c8a840" stroke="#3a2a08" stroke-width="5" stroke-linejoin="round"/>
    <path d="M84 120 q44 -18 88 0 l-8 20 q-36 -14 -72 0 z" fill="#e8c860" stroke="#8a6a10" stroke-width="3"/>
    <path d="M86 164 q42 -16 84 0" fill="none" stroke="#ffd166" stroke-width="8"/>
    <path d="M128 98 v98" stroke="#a88a20" stroke-width="5"/>
    <g class="c-arm-l"><path d="M78 128 q-38 12 -46 48" fill="none" stroke="#b89830" stroke-width="18" stroke-linecap="round"/></g>
    <g class="c-arm-r"><path d="M178 128 q38 12 46 48" fill="none" stroke="#b89830" stroke-width="18" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M128 30 q44 4 44 46 q-44 16 -88 0 q0 -42 44 -46 z" fill="#2a2418" stroke="#0a0805" stroke-width="5" stroke-linejoin="round"/>
      <path d="M128 24 q-6 -24 8 -32 q12 10 4 32 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="128" cy="102" rx="46" ry="38" fill="#d8b050" stroke="#3a2a08" stroke-width="5"/>
      <path d="M88 74 q40 -16 80 0 q-40 12 -80 0 z" fill="#4a3a10"/>
      ${eyes(110,146,98,11,"#ff6b1a",st)}
      ${brows(110,146,74,"#3a2a08",6)}
      <path d="M106 122 q22 16 44 0 q-22 -8 -44 0 z" fill="#2a2008"/>
      ${st>=2?`<path d="M114 122 l5 13 5 -13 z M130 124 l5 13 5 -13 z" fill="#fff"/>`:""}
      ${st>=3?`<path d="M92 138 q36 20 72 0" fill="none" stroke="#8a6a10" stroke-width="6"/>`:""}
    </g>
    ${st>=2?`<g class="c-spears"><path d="M22 216 l12 -140" stroke="#8a5a2a" stroke-width="7" stroke-linecap="round"/>
      <path d="M28 76 l6 -24 6 24 z" fill="#dfe8ff" stroke="#5a6a9a" stroke-width="3"/>
      <path d="M234 216 l-12 -140" stroke="#8a5a2a" stroke-width="7" stroke-linecap="round"/>
      <path d="M228 76 l-6 -24 -6 24 z" fill="#dfe8ff" stroke="#5a6a9a" stroke-width="3"/></g>`:""}
    ${st>=3?`<g class="c-spears-more"><path d="M6 220 l10 -120 M250 220 l-10 -120" stroke="#8a5a2a" stroke-width="6" stroke-linecap="round"/>
      <path d="M11 100 l5 -20 5 20 z M245 100 l-5 -20 -5 20 z" fill="#ffd166"/></g>`:""}
    ${st>=4?`<g class="c-forest"><path d="M40 224 l-4 -70 M64 224 l0 -84 M192 224 l0 -84 M216 224 l4 -70"
      stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/>
      <path d="M36 154 l4 -22 4 22 z M64 140 l0 -24 0 24 z M192 140 l0 -24 0 24 z M220 154 l-4 -22 -4 22 z" fill="#dfe8ff"/></g>`:""}
    ${orbitRunes(st,"#ffd166",128,138,116)}
  </g>`;
});

/* --- БОСС 5: Ледяная императрица ---------------------------------------- */
def("bos-empress", function(st){
  return svgOpen(244,268,"bemp") + shadow(122,252,60,13) + `
  ${aura(st,"#8fe3ff",122,140,92)}
  ${qiRing(st,"#8fe3ff",122,140,112)}
  <g class="c-body">
    <g class="c-robe">
      <path d="M122 98 q54 8 64 54 l14 84 q-78 20 -156 0 l14 -84 q10 -46 64 -54 z" fill="#cdeeff" stroke="#2a6a90" stroke-width="5" stroke-linejoin="round"/>
      <path d="M122 102 v134" stroke="#8fd0ee" stroke-width="5"/>
      <path d="M56 176 q66 -20 132 0" fill="none" stroke="#8fd0ee" stroke-width="7"/>
      <path d="M74 146 q48 -22 96 0" fill="none" stroke="#5cffc2" stroke-width="6"/>
      <path d="M60 206 q62 18 124 0" fill="none" stroke="#5cffc2" stroke-width="6"/>
      <g class="c-ice-trim"><path d="M50 234 l10 -18 8 14 8 -20 8 20 8 -14 10 18 z" fill="#e8f8ff" stroke="#2a6a90" stroke-width="3"/></g>
    </g>
    <g class="c-sleeve-l"><path d="M74 116 q-42 24 -46 68 q26 -8 40 -26 z" fill="#e4f6ff" stroke="#2a6a90" stroke-width="5" stroke-linejoin="round"/></g>
    <g class="c-sleeve-r"><path d="M170 116 q42 24 46 68 q-26 -8 -40 -26 z" fill="#e4f6ff" stroke="#2a6a90" stroke-width="5" stroke-linejoin="round"/></g>
    <g class="c-head">
      <path d="M122 24 q50 6 50 52 q-50 14 -100 0 q0 -46 50 -52 z" fill="#0e2a44" stroke="#04101c" stroke-width="5" stroke-linejoin="round"/>
      <path d="M122 28 q28 4 38 28 q-38 10 -76 0 q10 -24 38 -28 z" fill="#1a4a70"/>
      <path d="M122 20 q-10 -26 6 -34 q14 12 6 34 z" fill="#e8f8ff" stroke="#2a6a90" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="122" cy="96" rx="44" ry="38" fill="#fdf6f0" stroke="#2a6a90" stroke-width="5"/>
      ${eyes(104,140,92,11,"#2ab8e8",st)}
      ${brows(104,140,68,"#3a7a9a",5)}
      <path d="M118 112 q6 8 10 0" fill="none" stroke="#c88a9a" stroke-width="3" stroke-linecap="round"/>
      <path d="M112 122 q10 9 20 0" fill="none" stroke="#c88a9a" stroke-width="3" stroke-linecap="round"/>
      ${st>=2?`<g class="c-frostpin"><path d="M170 40 l14 -20 14 20 -14 20 z" fill="#a8e6ff" stroke="#2a6a90" stroke-width="4"/>
        <path d="M74 40 l-14 -20 -14 20 14 20 z" fill="#a8e6ff" stroke="#2a6a90" stroke-width="4"/></g>`:""}
      ${st>=3?`<g class="c-crown-ice2"><path d="M88 24 l10 -26 10 18 8 -24 8 24 10 -18 10 26 z" fill="#e8f8ff" stroke="#2a6a90" stroke-width="4" stroke-linejoin="round"/></g>`:""}
    </g>
    <g class="c-fan">
      <path d="M186 140 q42 -14 52 10 q-28 16 -52 -10 z" fill="#e4f6ff" stroke="#2a6a90" stroke-width="4"/>
      <path d="M194 142 l40 8 M198 150 l34 2 M204 134 l30 14" stroke="#8fd0ee" stroke-width="3"/>
    </g>
    ${st>=3?`<g class="c-ice-spikes"><path d="M28 244 l10 -60 8 14 M216 244 l-10 -60 -8 14" fill="#cdeeff" stroke="#2a6a90" stroke-width="4"/></g>`:""}
    ${st>=4?`<g class="c-blizzard"><path d="M16 70 q14 20 4 38 M228 70 q-14 20 -4 38 M20 130 q12 18 2 34 M224 130 q-12 18 -2 34"
      fill="none" stroke="#e8f8ff" stroke-width="4" stroke-linecap="round" opacity=".75" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#8fe3ff",122,140,116)}
  </g>`;
});

/* --- БОСС 6: Небесный дракон -------------------------------------------- */
def("bos-dragon", function(st){
  return svgOpen(268,262,"bdrag") + shadow(134,246,70,14) + `
  ${aura(st,"#7dffb0",134,132,96)}
  ${qiRing(st,"#7dffb0",134,132,118)}
  <g class="c-body">
    <g class="c-tail"><path d="M196 190 q50 -20 46 -76 q-18 30 -44 40 q-20 8 -32 2 z" fill="#3aa86a" stroke="#0e3a24" stroke-width="5" stroke-linejoin="round"/>
      <path d="M228 138 q14 -16 14 -34" stroke="#7dffb0" stroke-width="7" stroke-linecap="round"/></g>
    <g class="c-wing-l"><path d="M104 118 q-64 -34 -100 6 q40 -8 64 8 q-46 8 -60 44 q46 -20 78 0 q-26 14 -30 40 q40 -26 74 -34 z"
      fill="#4ac888" stroke="#0e3a24" stroke-width="5" stroke-linejoin="round"/></g>
    <g class="c-wing-r"><path d="M164 118 q64 -34 100 6 q-40 -8 -64 8 q46 8 60 44 q-46 -20 -78 0 q26 14 30 40 q-40 -26 -74 -34 z"
      fill="#4ac888" stroke="#0e3a24" stroke-width="5" stroke-linejoin="round"/></g>
    <ellipse cx="134" cy="156" rx="52" ry="48" fill="#5ad898" stroke="#0e3a24" stroke-width="5"/>
    <path d="M86 142 q48 -18 96 0 M88 172 q46 16 92 0" fill="none" stroke="#3aa86a" stroke-width="6"/>
    <ellipse cx="134" cy="176" rx="30" ry="22" fill="#a8f0c8" stroke="#0e3a24" stroke-width="4"/>
    <g class="c-neck"><path d="M134 118 q-8 -46 6 -70" fill="none" stroke="#5ad898" stroke-width="30" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M140 34 q-46 -14 -58 -30 q34 -4 58 16 z" fill="#4ac888" stroke="#0e3a24" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="152" cy="56" rx="46" ry="32" fill="#5ad898" stroke="#0e3a24" stroke-width="5"/>
      <path d="M152 68 q-18 10 -30 6 q14 8 30 8 q16 0 30 -8 q-12 4 -30 -6 z" fill="#ff9b6b" stroke="#0e3a24" stroke-width="3"/>
      ${eyes(136,170,50,11,"#ffd166",st)}
      ${brows(136,170,28,"#0e3a24",5)}
      <path d="M158 70 l-10 12 h20 z" fill="#fff" stroke="#0e3a24" stroke-width="2"/>
      <g class="c-whisk"><path d="M104 54 q-30 -12 -40 -6 M104 64 q-30 0 -42 10" stroke="#7dffb0" stroke-width="5" stroke-linecap="round" fill="none"/></g>
      ${st>=2?`<g class="c-horns"><path d="M124 28 l-14 -30 24 16 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/>
        <path d="M176 28 l14 -30 -24 16 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/></g>`:""}
      ${st>=3?`<g class="c-pearl-d"><circle cx="200" cy="44" r="15" fill="#fff" stroke="#ffd166" stroke-width="4" filter="url(#anGlow)"/>
        <text x="200" y="50" font-size="16" fill="#0e3a24" text-anchor="middle" font-family="serif">珠</text></g>`:""}
    </g>
    ${st>=3?`<g class="c-clouds-d"><ellipse cx="40" cy="60" rx="34" ry="14" fill="#c8f0e0" opacity=".45"/>
      <ellipse cx="232" cy="106" rx="30" ry="12" fill="#c8f0e0" opacity=".4"/>
      <ellipse cx="34" cy="200" rx="28" ry="12" fill="#c8f0e0" opacity=".35"/></g>`:""}
    ${st>=4?`<g class="c-rain-d"><path d="M52 236 q20 -8 40 0 t40 0 t40 0 t40 0" fill="none" stroke="#7dffb0" stroke-width="5" opacity=".8" filter="url(#anGlow)"/></g>`:""}
    ${orbitRunes(st,"#7dffb0",134,132,122)}
  </g>`;
});

/* --- БОСС 7: Бессмертный патриарх --------------------------------------- */
def("bos-immortal", function(st){
  return svgOpen(250,272,"bimm") + shadow(125,256,58,13) + `
  ${aura(st,"#ff6bd5",125,142,94)}
  ${qiRing(st,"#ff6bd5",125,142,116)}
  <g class="c-body">
    <g class="c-robe">
      <path d="M125 96 q54 8 64 54 l16 86 q-80 22 -160 0 l16 -86 q10 -46 64 -54 z" fill="#e8dcff" stroke="#4a2a7a" stroke-width="5" stroke-linejoin="round"/>
      <path d="M125 100 v138" stroke="#c0a8e8" stroke-width="5"/>
      <path d="M56 174 q69 -20 138 0" fill="none" stroke="#ffd166" stroke-width="8"/>
      <path d="M76 142 q49 -22 98 0" fill="none" stroke="#ff6bd5" stroke-width="6"/>
      <path d="M58 214 q67 20 134 0" fill="none" stroke="#ff6bd5" stroke-width="6"/>
      <circle cx="104" cy="188" r="7" fill="#ffd166"/><circle cx="125" cy="196" r="7" fill="#ffd166"/><circle cx="146" cy="188" r="7" fill="#ffd166"/>
    </g>
    <g class="c-sleeve-l"><path d="M76 114 q-46 26 -50 74 q28 -10 44 -30 z" fill="#f0e8ff" stroke="#4a2a7a" stroke-width="5" stroke-linejoin="round"/></g>
    <g class="c-sleeve-r"><path d="M174 114 q46 26 50 74 q-28 -10 -44 -30 z" fill="#f0e8ff" stroke="#4a2a7a" stroke-width="5" stroke-linejoin="round"/></g>
    <g class="c-arm-extra-l"><path d="M52 150 q-30 22 -24 56" fill="none" stroke="#d8c8f0" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-arm-extra-r"><path d="M198 150 q30 22 24 56" fill="none" stroke="#d8c8f0" stroke-width="12" stroke-linecap="round"/></g>
    <g class="c-head">
      <path d="M125 26 q52 6 52 54 q-52 16 -104 0 q0 -48 52 -54 z" fill="#f0ecff" stroke="#4a2a7a" stroke-width="5" stroke-linejoin="round"/>
      <path d="M125 30 q30 4 40 30 q-40 10 -80 0 q10 -26 40 -30 z" fill="#e0d8f8"/>
      <path d="M125 18 q-6 -28 8 -36 q14 12 6 38 z" fill="#ffd166" stroke="#8a5a00" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="125" cy="98" rx="44" ry="38" fill="#fdf8f2" stroke="#4a2a7a" stroke-width="5"/>
      ${eyes(107,143,94,11,"#ff6bd5",st)}
      ${brows(107,143,68,"#6a4a9a",6)}
      <path d="M120 114 q6 8 10 0" fill="none" stroke="#c88a9a" stroke-width="3" stroke-linecap="round"/>
      <path d="M114 124 q11 9 22 0" fill="none" stroke="#c88a9a" stroke-width="3" stroke-linecap="round"/>
      ${st>=2?`<g class="c-beard-long"><path d="M125 130 q-10 44 0 62 q10 -18 0 -62 z" fill="#f0ecff" stroke="#4a2a7a" stroke-width="3"/></g>`:""}
      ${st>=3?`<g class="c-halo-imm"><ellipse cx="125" cy="40" rx="46" ry="14" fill="none" stroke="#ffd166" stroke-width="5" filter="url(#anGlow)"/>
        <ellipse cx="125" cy="40" rx="34" ry="9" fill="none" stroke="#ff6bd5" stroke-width="3"/></g>`:""}
    </g>
    <g class="c-flysword">
      <path d="M28 60 l10 96" stroke="#e8eeff" stroke-width="8" stroke-linecap="round"/>
      <path d="M22 152 h26" stroke="#c8a840" stroke-width="6" stroke-linecap="round"/>
      <path d="M222 60 l-10 96" stroke="#e8eeff" stroke-width="8" stroke-linecap="round"/>
      <path d="M216 152 h26" stroke="#c8a840" stroke-width="6" stroke-linecap="round"/>
    </g>
    ${st>=3?`<g class="c-swords-more"><path d="M42 40 l8 70 M208 40 l-8 70" stroke="#dfe8ff" stroke-width="6" stroke-linecap="round"/>
      <path d="M18 40 l8 70 M232 40 l-8 70" stroke="#dfe8ff" stroke-width="5" stroke-linecap="round" opacity=".8"/></g>`:""}
    ${st>=4?`<g class="c-gates"><path d="M24 246 q0 -60 26 -84 q26 24 26 84" fill="none" stroke="#ffd166" stroke-width="5" opacity=".8"/>
      <path d="M174 246 q0 -60 26 -84 q26 24 26 84" fill="none" stroke="#ffd166" stroke-width="5" opacity=".8"/>
      <text x="50" y="216" font-size="20" fill="#ffd166" text-anchor="middle" font-family="serif" opacity=".9">仙</text>
      <text x="200" y="216" font-size="20" fill="#ffd166" text-anchor="middle" font-family="serif" opacity=".9">道</text></g>`:""}
    ${orbitRunes(st,"#ff6bd5",125,142,122)}
  </g>`;
});

/* Экспорт арта боссов готов */
})();

