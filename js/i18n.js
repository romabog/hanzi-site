/* ==========================================================================
   Сайт «Маг Иероглифов» — локализация (русский / английский / китайский).

   Разметка помечается атрибутами:
     data-i18n="ключ"        текст элемента
     data-i18n-title="ключ"  подсказка (title)
     data-i18n-html="ключ"   текст с разметкой внутри (осторожно)

   Язык выбирается так же, как в игре: ?lang= -> сохранённый -> язык браузера -> ru.
   Выбор сохраняется в localStorage под тем же ключом, что и в игре,
   поэтому язык интерфейса един на всём сайте и внутри игры.
   ========================================================================== */
(function () {
  "use strict";

  var LANGS = ["ru", "en", "zh"];
  var STORE = "hanzi.lang";

  var RU = {
    "site.title": "Маг Иероглифов — тренажёр китайских иероглифов с боевой системой",
    "site.desc": "Онлайн-тренажёр китайских иероглифов: 500 знаков с пиньинь, рисование по памяти, оценка точности и боевая система с 30 врагами и 7 боссами.",

    "nav.play": "Играть",
    "nav.features": "Возможности",
    "nav.how": "Как играть",
    "nav.chars": "Иероглифы",
    "nav.enemies": "Противники",
    "nav.playBtn": "Играть",

    "hero.title": "Маг Иероглифов",
    "hero.lead": "Тренажёр китайских иероглифов, где точность письма превращается в силу удара.",
    "hero.sub": "Обведи знак — и игра оценит форму и расположение штрихов, а от точности зависит урон. 500 иероглифов с пиньинь и переводом, 30 врагов, 7 боссов и пентатоническая музыка.",
    "hero.cta": "▶ Начать играть",
    "hero.cta2": "Как это работает",
    "hero.badge1": "иероглифов",
    "hero.badge2": "врагов",
    "hero.badge3": "боссов",
    "hero.badge4": "ступени сложности",

    "play.kicker": "Игра",
    "play.title": "Играть прямо здесь",
    "play.text": "Ничего устанавливать не нужно — игра работает в браузере, на компьютере и на телефоне. Она загрузится, когда вы прокрутите до этого места.",
    "play.classic": "Классическая",
    "play.anime": "Аниме-версия",
    "play.versionLabel": "Версия:",
    "play.fullscreen": "Полный экран",
    "play.exitFullscreen": "Выйти из полного экрана",
    "play.loading": "Загрузка игры…",
    "play.frameTitle": "Игра «Маг Иероглифов»",
    "play.hint": "Звук включается после первого клика по игре. Чем точнее обведёшь знак, тем сильнее удар. Прогресс не сохраняется — каждая партия начинается заново.",
    "play.noscript": "Для встроенной игры нужен JavaScript. Можно открыть версию напрямую:",

    "feat.kicker": "Возможности",
    "feat.title": "Учи руки, а не учебник",
    "feat.text": "Тренажёр построен вокруг главного в китайском письме — начертания. Знак мало узнать, его надо уметь написать.",
    "feat.f1.t": "500 иероглифов",
    "feat.f1.d": "От простых 一 и 人 до многосоставных знаков. У каждого — пиньинь, перевод и число штрихов.",
    "feat.f2.t": "Оценка письма",
    "feat.f2.d": "Алгоритм сравнивает форму и положение ваших штрихов с образцом и выставляет точность от 0 до 100%.",
    "feat.f3.t": "Боевая система",
    "feat.f3.d": "Враги атакуют по таймеру. Не успел начертить верный знак или промахнулся — теряешь здоровье.",
    "feat.f4.t": "Комбо и мана",
    "feat.f4.d": "Серия точных знаков усиливает удар. Мана ограничивает самые мощные приёмы — думай, когда бить.",
    "feat.f5.t": "Музыка и звук",
    "feat.f5.d": "Мелодии на пентатонике, отдельные темы для боя, боссов и поражения. Включается по клику.",
    "feat.f6.t": "Работает офлайн",
    "feat.f6.d": "Вся игра — статические файлы без серверной части. После загрузки страницы интернет не нужен.",

    "how.kicker": "Как играть",
    "how.title": "Пять секунд до первого боя",
    "how.s1.t": "Выбери знак",
    "how.s1.d": "На панели справа показаны иероглифы прошлых раундов. Выбирай тот, что по силам.",
    "how.s2.t": "Обведи по памяти",
    "how.s2.d": "Рисуй мышью или пальцем в поле. Подсказку можно включить, но она снизит награду.",
    "how.s3.t": "Проверь точность",
    "how.s3.d": "Игра покажет, насколько ты попал в образец по форме и по месту, и начислит урон.",
    "how.s4.t": "Побеждай",
    "how.s4.d": "Каждые 10 ходов выходит босс. С уровнем противники становятся крупнее, злее и точнее бьют.",

    "chars.kicker": "Словарь",
    "chars.title": "От простого к сложному",
    "chars.text": "Тренажёр ведёт от одноштриховых знаков к многосоставным. Вот выборка: от лёгких к трудным (наведи курсор на знак — появится пиньинь и перевод).",
    "chars.note": "↑ Несколько десятков из 500 доступных в игре.",

    "enemies.kicker": "Противники",
    "enemies.title": "30 врагов и 7 боссов",
    "enemies.text": "В аниме-версии облики нарисованы в стиле сянься. По мере прохождения враг «растёт»: появляются светящиеся глаза, доспехи, оружие и парящие руны ци.",
    "enemies.boss": "Босс",
    "enemies.stage": "ступень",

    "foot.about": "— тренажёр китайских иероглифов.",
    "foot.line": "500 знаков · оценка точности · боевая система · пентатоническая музыка.",
    "foot.tech": "Полностью на клиенте: HTML · CSS · JS без серверной части.",
    "foot.offline": "Работает офлайн после загрузки страницы.",

    "lang.label": "Язык",
    "lang.ru": "Рус",
    "lang.en": "Eng",
    "lang.zh": "中文",
    "lang.switch": "Сменить язык"
  };

  var EN = {
    "site.title": "Character Mage — a Chinese character trainer with combat",
    "site.desc": "An online Chinese character trainer: 500 characters with pinyin, drawing from memory, accuracy scoring, and combat with 30 enemies and 7 bosses.",

    "nav.play": "Play",
    "nav.features": "Features",
    "nav.how": "How to play",
    "nav.chars": "Characters",
    "nav.enemies": "Enemies",
    "nav.playBtn": "Play",

    "hero.title": "Character Mage",
    "hero.lead": "A Chinese character trainer where the accuracy of your writing becomes the force of your strike.",
    "hero.sub": "Trace a character and the game scores the shape and placement of your strokes — accuracy decides your damage. 500 characters with pinyin and meaning, 30 enemies, 7 bosses, and pentatonic music.",
    "hero.cta": "▶ Start playing",
    "hero.cta2": "How it works",
    "hero.badge1": "characters",
    "hero.badge2": "enemies",
    "hero.badge3": "bosses",
    "hero.badge4": "difficulty stages",

    "play.kicker": "The game",
    "play.title": "Play right here",
    "play.text": "Nothing to install — the game runs in your browser, on desktop and on mobile. It loads as soon as you scroll here.",
    "play.classic": "Classic",
    "play.anime": "Anime version",
    "play.versionLabel": "Version:",
    "play.fullscreen": "Fullscreen",
    "play.exitFullscreen": "Exit fullscreen",
    "play.loading": "Loading the game…",
    "play.frameTitle": "Game “Character Mage”",
    "play.hint": "Sound starts after your first click on the game. The more accurately you trace a character, the harder you hit. Progress is not saved — every run starts fresh.",
    "play.noscript": "The embedded game needs JavaScript. You can open a version directly:",

    "feat.kicker": "Features",
    "feat.title": "Train your hand, not the textbook",
    "feat.text": "The trainer is built around what matters most in Chinese writing — the strokes themselves. Knowing a character is not enough; you have to be able to write it.",
    "feat.f1.t": "500 characters",
    "feat.f1.d": "From simple 一 and 人 to complex multi-part characters. Each with pinyin, meaning and stroke count.",
    "feat.f2.t": "Writing score",
    "feat.f2.d": "The algorithm compares the shape and position of your strokes with the model and gives an accuracy from 0 to 100%.",
    "feat.f3.t": "Combat system",
    "feat.f3.d": "Enemies attack on a timer. Miss the right character or draw it badly and you lose health.",
    "feat.f4.t": "Combos and mana",
    "feat.f4.d": "A streak of accurate characters strengthens your strike. Mana limits the strongest moves — think about when to hit.",
    "feat.f5.t": "Music and sound",
    "feat.f5.d": "Pentatonic melodies with separate themes for battle, bosses and defeat. Starts on click.",
    "feat.f6.t": "Works offline",
    "feat.f6.d": "The whole game is static files with no server. Once the page has loaded, you need no internet.",

    "how.kicker": "How to play",
    "how.title": "Five seconds to your first battle",
    "how.s1.t": "Pick a character",
    "how.s1.d": "The right panel shows characters from earlier rounds. Choose one you can handle.",
    "how.s2.t": "Trace it from memory",
    "how.s2.d": "Draw with your mouse or finger. You can turn on a hint, but it lowers your reward.",
    "how.s3.t": "Check your accuracy",
    "how.s3.d": "The game shows how closely you matched the model in shape and position, and deals damage.",
    "how.s4.t": "Win",
    "how.s4.d": "A boss appears every 10 rounds. As levels rise, enemies grow bigger, fiercer and more accurate.",

    "chars.kicker": "Vocabulary",
    "chars.title": "From simple to complex",
    "chars.text": "The trainer moves from single-stroke characters to complex ones. Here is a sample, from easy to hard (hover over a character to see pinyin and meaning).",
    "chars.note": "↑ A few dozen of the 500 available in the game.",

    "enemies.kicker": "Enemies",
    "enemies.title": "30 enemies and 7 bosses",
    "enemies.text": "In the anime version the characters are drawn in xianxia style. As you progress, an enemy “grows”: glowing eyes, armor, weapons and floating qi runes appear.",
    "enemies.boss": "Boss",
    "enemies.stage": "stage",

    "foot.about": "— a Chinese character trainer.",
    "foot.line": "500 characters · accuracy scoring · combat · pentatonic music.",
    "foot.tech": "Fully client-side: HTML · CSS · JS with no server.",
    "foot.offline": "Works offline once the page has loaded.",

    "lang.label": "Language",
    "lang.ru": "Рус",
    "lang.en": "Eng",
    "lang.zh": "中文",
    "lang.switch": "Change language"
  };

  var ZH = {
    "site.title": "汉字法师——带战斗系统的汉字练习",
    "site.desc": "在线汉字练习：500 个汉字带拼音，凭记忆书写，自动评分，并有 30 个敌人和 7 个首领的战斗系统。",

    "nav.play": "开始游戏",
    "nav.features": "功能",
    "nav.how": "玩法",
    "nav.chars": "汉字",
    "nav.enemies": "敌人",
    "nav.playBtn": "开始游戏",

    "hero.title": "汉字法师",
    "hero.lead": "一个把书写准确度变成攻击力的汉字练习游戏。",
    "hero.sub": "描出汉字，游戏会评判笔画的形状与位置，准确度决定伤害。500 个汉字带拼音与释义，30 个敌人、7 个首领，配五声音阶音乐。",
    "hero.cta": "▶ 开始游戏",
    "hero.cta2": "了解玩法",
    "hero.badge1": "个汉字",
    "hero.badge2": "个敌人",
    "hero.badge3": "个首领",
    "hero.badge4": "个难度阶段",

    "play.kicker": "游戏",
    "play.title": "就在这里玩",
    "play.text": "无需安装——游戏在浏览器中运行，电脑和手机都可以。滚动到此处即会自动加载。",
    "play.classic": "经典版",
    "play.anime": "动漫版",
    "play.versionLabel": "版本：",
    "play.fullscreen": "全屏",
    "play.exitFullscreen": "退出全屏",
    "play.loading": "正在加载游戏……",
    "play.frameTitle": "游戏「汉字法师」",
    "play.hint": "首次点击游戏后才会开启声音。描得越准，攻击越强。进度不会保存——每局都从头开始。",
    "play.noscript": "内嵌游戏需要 JavaScript。你也可以直接打开某个版本：",

    "feat.kicker": "功能",
    "feat.title": "练手，而不是背课本",
    "feat.text": "这个练习围绕中文书写最关键的部分——笔画。认识一个字还不够，还要写得出。",
    "feat.f1.t": "500 个汉字",
    "feat.f1.d": "从简单的 一 和 人，到笔画繁多的合体字。每个都有拼音、释义和笔画数。",
    "feat.f2.t": "书写评分",
    "feat.f2.d": "算法会把你笔画的形状和位置与范字比较，给出 0 到 100% 的准确度。",
    "feat.f3.t": "战斗系统",
    "feat.f3.d": "敌人会按计时器攻击。写错字或写不准，就会掉血。",
    "feat.f4.t": "连击与法力",
    "feat.f4.d": "连续写准会增强攻击。法力限制最强的招式——要想好什么时候出手。",
    "feat.f5.t": "音乐与音效",
    "feat.f5.d": "五声音阶的旋律，战斗、首领和失败各有主题曲。点击后开启。",
    "feat.f6.t": "离线可用",
    "feat.f6.d": "整个游戏都是静态文件，没有服务器。页面加载后就不需要网络。",

    "how.kicker": "玩法",
    "how.title": "五秒进入第一场战斗",
    "how.s1.t": "选择汉字",
    "how.s1.d": "右侧面板会显示前几回合写过的汉字。选一个你有把握的。",
    "how.s2.t": "凭记忆描出来",
    "how.s2.d": "用鼠标或手指在画板上书写。可以打开提示，但奖励会减少。",
    "how.s3.t": "查看准确度",
    "how.s3.d": "游戏会显示你在形状和位置上与范字有多接近，并计算伤害。",
    "how.s4.t": "取得胜利",
    "how.s4.d": "每 10 回合出现一个首领。等级越高，敌人越大、越凶、出手越准。",

    "chars.kicker": "字表",
    "chars.title": "从简单到复杂",
    "chars.text": "练习从一笔字过渡到合体字。下面是抽样，由易到难（把鼠标停在汉字上可看拼音与释义）。",
    "chars.note": "↑ 游戏内共 500 个汉字，这里只是其中几十个。",

    "enemies.kicker": "敌人",
    "enemies.title": "30 个敌人与 7 个首领",
    "enemies.text": "动漫版的外形采用仙侠画风。随着关卡推进，敌人会「成长」：出现发光的眼睛、护甲、武器和悬浮的灵气符文。",
    "enemies.boss": "首领",
    "enemies.stage": "第 … 阶",

    "foot.about": "——汉字练习游戏。",
    "foot.line": "500 个汉字 · 书写评分 · 战斗系统 · 五声音阶音乐。",
    "foot.tech": "完全在客户端运行：HTML · CSS · JS，无需服务器。",
    "foot.offline": "页面加载后可离线使用。",

    "lang.label": "语言",
    "lang.ru": "Рус",
    "lang.en": "Eng",
    "lang.zh": "中文",
    "lang.switch": "切换语言"
  };

  var DICT = { ru: RU, en: EN, zh: ZH };

  function valid(l) { return LANGS.indexOf(l) > -1 ? l : null; }
  function fromQuery() {
    try {
      var q = (typeof location !== "undefined" && location.search) || "";
      var m = /[?&]lang=([a-z]{2})/i.exec(q);
      return m ? valid(m[1].toLowerCase()) : null;
    } catch (e) { return null; }
  }
  function fromStore() {
    try { return valid(localStorage.getItem(STORE)); } catch (e) { return null; }
  }
  function fromBrowser() {
    var nav = (typeof navigator !== "undefined") ? navigator : null;
    if (!nav) return null;
    var list = (nav.languages && nav.languages.length) ? nav.languages : [nav.language || ""];
    for (var i = 0; i < list.length; i++) {
      var base = String(list[i] || "").toLowerCase().split("-")[0];
      if (base === "zh" || base === "ru" || base === "en") return base;
    }
    return null;
  }

  var lang = fromQuery() || fromStore() || fromBrowser() || "ru";

  function t(key, vars) {
    var s = DICT[lang] && DICT[lang][key];
    if (s === undefined) {
      if (window.console && console.warn) console.warn("[i18n] нет строки:", key, "для языка", lang);
      s = RU[key];
    }
    if (s === undefined) return key;
    if (vars) s = String(s).replace(/\{(\w+)\}/g, function (all, n) {
      return (vars[n] === undefined || vars[n] === null) ? all : String(vars[n]);
    });
    return s;
  }

  var listeners = [];
  function setLang(l) {
    l = valid(l);
    if (!l || l === lang) return lang;
    lang = l;
    try { localStorage.setItem(STORE, l); } catch (e) {}
    listeners.forEach(function (fn) { try { fn(l); } catch (e) {} });
    return lang;
  }

  function apply(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    root.querySelectorAll("[data-i18n-title]").forEach(function (el) { el.title = t(el.getAttribute("data-i18n-title")); });
    root.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    /* язык страницы для браузера и поисковых систем */
    try { document.documentElement.lang = lang; } catch (e) {}
    /* выбранная кнопка языка */
    root.querySelectorAll(".langbtn, .vbtn-lang").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.classList.toggle("on", on);
    });
    /* игра внутри страницы должна говорить на том же языке */
    var frame = document.getElementById("gameFrame");
    if (frame && frame.getAttribute("src")) {
      var base = frame.getAttribute("src").split("#")[0].split("?")[0];
      frame.setAttribute("src", base + "?lang=" + lang);
    }
  }

  window.I18N = {
    t: t, setLang: setLang, getLang: function () { return lang; },
    langs: LANGS.slice(), apply: apply,
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    dict: DICT
  };
  window.t = t;
})();
