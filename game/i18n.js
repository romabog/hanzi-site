/* ==========================================================================
   Маг Иероглифов — локализация интерфейса (русский / английский / китайский).

   Как пользоваться:
     t("log.hit")                    — простая строка
     t("log.damage", {n:12, acc:88}) — строка с подстановками {n}, {acc}

   Язык определяется в таком порядке:
     1. параметр ?lang= в адресе          (удобно для ссылок на конкретный язык)
     2. сохранённый выбор в localStorage
     3. язык браузера
     4. русский — запасной

   Выбор языка кнопками сохраняется и переживает перезагрузку.
   ========================================================================== */
(function () {
  "use strict";

  var LANGS = ["ru", "en", "zh"];
  var STORE = "hanzi.lang";

  /* ------------------------------------------------------------------ *
   *  Русский — исходный язык игры, он же запасной.
   * ------------------------------------------------------------------ */
  var RU = {
    "app.title": "Маг Иероглифов",
    "app.subtitle": "Тренажёр китайских иероглифов в виде игры",

    /* шапка и показатели */
    "hud.score": "Счёт",
    "hud.round": "Раунд",
    "hud.level": "Уровень",
    "hud.streak": "Серия",
    "hud.mage": "Маг",
    "hud.health": "Здоровье",
    "hud.mana": "Мана",

    /* панель врага */
    "enemy.boss": "БОСС",
    "enemy.foe": "Противник",
    "enemy.boss_prefix": "Босс",
    "enemy.stage": "ступень {n}/4",
    "enemy.stage_of": "ступень {n}",
    "enemy.stage_short": "ступень",
    "enemy.attack": "Атака врага",

    /* поле рисования */
    "board.hint.rune": "Нарисуй иероглиф — он станет руной заклинания",
    "board.hint.chain": "Напиши руны — они соберутся в цепочку",
    "board.runes": "✨ руна",
    "board.attacks": "⚔ Обычная атака — руна {n}",
    "board.combo_runes": "🔗 Комбо «{word}» — руна {n} из {total}",
    "board.hint_contour": "Подсказка: контур",
    "board.hint_off": "Подсказка: выкл (+бонус)",
    "board.order": "▶ Порядок",
    "board.contour": "👁 Контур",
    "board.undo": "↩ Отменить",
    "board.clear": "🗑 Очистить",
    "board.undo_done": "Штрих отменён",
    "board.clear_done": "Доска очищена",
    "board.tap_not_stroke": "Это был тап, а не штрих — веди линию.",
    "board.stroke": "Штрих {n}",
    "board.write_prompt": "Пиши «{ch}» — {mean}!",
    "board.runes_named": "✨ руна · {mean}",
    "char.title": "{ch} ({py}) — {mean}",

    /* атаки */
    "atk.normal": "Обычная атака",
    "atk.normal_note": "1 руна · обычный урон",
    "atk.combo": "Комбо: «{word}»",
    "atk.combo_note": "{n} руны · ×{mult} урона",
    "atk.combo_locked": "Комбо открываются с ростом сложности и всегда доступны на боссах",
    "atk.choose_again": "Выбирай атаку снова",
    "atk.choose_again_combo": "Комбо! Выбирай атаку снова",

    /* сообщения боя */
    "log.spell": "{word} — урон {dmg} (точность {acc}%)",
    "log.combo_ready": "Комбо собрано — выпускаю!",
    "log.spell_ready": "Заклинание готово!",
    "log.rune_ok": "Руна «{word}» принята ({acc}%). Дальше: «{next}»",
    "log.enemy_down": "{name} повержен! +{score} очков",
    "log.enemy_hit_you": "{name} атакует! -{hp}",

    /* оценка точности */
    "grade.perfect": "Великолепно!",
    "grade.great": "Отлично!",
    "grade.ok": "Неплохо",
    "grade.poor": "Слабо...",

    /* инвентарь */
    "inv.title": "📜 Инвентарь рун",
    "inv.empty": "Здесь появятся иероглифы, которые ты написал. Кликай на руну, чтобы вызвать её и написать снова.",
    "inv.tip": "(кликни, чтобы вызвать и написать снова)",
    "inv.rune": "✨ руна",

    /* подсказки про игру */
    "tip.write": "🖊 Напиши иероглиф — он станет",
    "tip.rune_word": "руной",
    "tip.spell_word": "заклинания.",
    "tip.normal_attack": "Обычная атака",
    "tip.normal_attack_desc": "— 1 руна, проще, но урон обычный.",
    "tip.combo": "Комбо",
    "tip.combo_desc": "— 2–3 руны одним словом, труднее, но урон в разы больше.",
    "tip.accuracy": "Точнее",
    "tip.and": "и",
    "tip.faster": "быстрее",
    "tip.accuracy_desc": "пишешь — тем сильнее удар.",
    "tip.boss": "👹 Каждый 10-й враг —",
    "tip.boss_desc": ": у него броня, и без комбо его не одолеть.",
    "tip.material": "📚 Материал игры —",
    "tip.material_link": "500 самых частых иероглифов",
    "tip.material_desc": "; выученные руны копятся в инвентаре.",
    "tip.keys": "⏸ Пауза — ⏸ или Esc. Музыка и звук — кнопки в шапке.",

    /* кнопки и клавиши */
    "btn.start": "▶ Начать бой",
    "btn.again": "🔄 Играть снова",
    "btn.resume": "▶ Продолжить",
    "keys.hint": "Клавиши: 1 — обычная атака, 2 — комбо, D — порядок, H — контур, Z — отменить, C — очистить, Esc — пауза",

    /* пауза и конец игры */
    "pause.title": "Пауза",
    "pause.text": "Игра остановлена. Твой прогресс сохранён.",
    "pause.resume_hint": "Esc или P — продолжить",
    "over.title": "Ты пал в бою...",
    "over.text": "Маг побеждён. Но магия ждёт новой попытки!",
    "over.score": "Твой счёт: {score}",

    /* кнопки шапки */
    "top.pause": "Пауза (Esc)",
    "top.music": "8-битная музыка",
    "top.sound": "Звук",
    "top.order_hint": "Показать порядок штрихов (D)",
    "top.contour_hint": "Показать/скрыть контур (H)",
    "top.undo_hint": "Отменить штрих (Z)",
    "top.clear_hint": "Очистить (C)",

    /* ошибки */
    "err.no_data": "⚠️ Не найден файл данных hanzi-data.js. Положи его рядом с index.html.",

    /* названия противников (классическая версия) */
    "enemy.ghost": "Призрак",
    "enemy.bat": "Лет. мышь",
    "enemy.ogre": "Огр",
    "enemy.demon": "Демон",
    "enemy.dragon": "Дракон",
    "enemy.darklord": "Владыка",

    /* язык */
    "lang.label": "Язык",
    "lang.ru": "Рус",
    "lang.en": "Eng",
    "lang.zh": "中文",
    "lang.switch": "Сменить язык"
  };

  /* ------------------------------------------------------------------ *
   *  English
   * ------------------------------------------------------------------ */
  var EN = {
    "app.title": "Character Mage",
    "app.subtitle": "A Chinese character trainer shaped like a game",

    "hud.score": "Score",
    "hud.round": "Round",
    "hud.level": "Level",
    "hud.streak": "Streak",
    "hud.mage": "Mage",
    "hud.health": "Health",
    "hud.mana": "Mana",

    "enemy.boss": "BOSS",
    "enemy.foe": "Enemy",
    "enemy.boss_prefix": "Boss",
    "enemy.stage": "stage {n}/4",
    "enemy.stage_of": "stage {n}",
    "enemy.stage_short": "stage",
    "enemy.attack": "Enemy attack",

    "board.hint.rune": "Draw the character — it becomes a spell rune",
    "board.hint.chain": "Write runes — they line up into a chain",
    "board.runes": "✨ rune",
    "board.attacks": "⚔ Normal attack — rune {n}",
    "board.combo_runes": "🔗 Combo “{word}” — rune {n} of {total}",
    "board.hint_contour": "Hint: outline",
    "board.hint_off": "Hint: off (+bonus)",
    "board.order": "▶ Order",
    "board.contour": "👁 Outline",
    "board.undo": "↩ Undo",
    "board.clear": "🗑 Clear",
    "board.undo_done": "Stroke undone",
    "board.clear_done": "Board cleared",
    "board.tap_not_stroke": "That was a tap, not a stroke — draw a line.",
    "board.stroke": "Stroke {n}",
    "board.write_prompt": "Write “{ch}” — {mean}!",
    "board.runes_named": "✨ rune · {mean}",
    "char.title": "{ch} ({py}) — {mean}",

    "atk.normal": "Normal attack",
    "atk.normal_note": "1 rune · normal damage",
    "atk.combo": "Combo: “{word}”",
    "atk.combo_note": "{n} runes · ×{mult} damage",
    "atk.combo_locked": "Combos unlock as difficulty grows and are always available against bosses",
    "atk.choose_again": "Choose your attack again",
    "atk.choose_again_combo": "Combo! Choose your attack again",

    "log.spell": "{word} — damage {dmg} (accuracy {acc}%)",
    "log.combo_ready": "Combo assembled — casting!",
    "log.spell_ready": "Spell ready!",
    "log.rune_ok": "Rune “{word}” accepted ({acc}%). Next: “{next}”",
    "log.enemy_down": "{name} is defeated! +{score} points",
    "log.enemy_hit_you": "{name} attacks! -{hp}",

    "grade.perfect": "Perfect!",
    "grade.great": "Great!",
    "grade.ok": "Not bad",
    "grade.poor": "Weak...",

    "inv.title": "📜 Rune inventory",
    "inv.empty": "Characters you write will appear here. Click a rune to summon it and write it again.",
    "inv.tip": "(click to summon and write again)",
    "inv.rune": "✨ rune",

    "tip.write": "🖊 Draw a character — it becomes a",
    "tip.rune_word": "rune",
    "tip.spell_word": "of the spell.",
    "tip.normal_attack": "Normal attack",
    "tip.normal_attack_desc": "— 1 rune, easier, but ordinary damage.",
    "tip.combo": "Combo",
    "tip.combo_desc": "— 2–3 runes as one word, harder, but far more damage.",
    "tip.accuracy": "The more accurately",
    "tip.and": "and",
    "tip.faster": "faster",
    "tip.accuracy_desc": "you write, the harder you hit.",
    "tip.boss": "👹 Every 10th enemy is a",
    "tip.boss_desc": ": it has armor, and without combos you will not beat it.",
    "tip.material": "📚 The game material is",
    "tip.material_link": "the 500 most common characters",
    "tip.material_desc": "; learned runes pile up in your inventory.",
    "tip.keys": "⏸ Pause — ⏸ or Esc. Music and sound — buttons in the header.",

    "btn.start": "▶ Start battle",
    "btn.again": "🔄 Play again",
    "btn.resume": "▶ Resume",
    "keys.hint": "Keys: 1 — normal attack, 2 — combo, D — order, H — outline, Z — undo, C — clear, Esc — pause",

    "pause.title": "Paused",
    "pause.text": "The game is stopped. Your progress is saved.",
    "pause.resume_hint": "Esc or P — resume",
    "over.title": "You have fallen in battle...",
    "over.text": "The mage is defeated. But magic awaits another try!",
    "over.score": "Your score: {score}",

    "top.pause": "Pause (Esc)",
    "top.music": "8-bit music",
    "top.sound": "Sound",
    "top.order_hint": "Show stroke order (D)",
    "top.contour_hint": "Show/hide outline (H)",
    "top.undo_hint": "Undo stroke (Z)",
    "top.clear_hint": "Clear (C)",

    "err.no_data": "⚠️ Data file hanzi-data.js not found. Put it next to index.html.",

    "enemy.ghost": "Ghost",
    "enemy.bat": "Bat",
    "enemy.ogre": "Ogre",
    "enemy.demon": "Demon",
    "enemy.dragon": "Dragon",
    "enemy.darklord": "Dark Lord",

    "lang.label": "Language",
    "lang.ru": "Рус",
    "lang.en": "Eng",
    "lang.zh": "中文",
    "lang.switch": "Change language"
  };

  /* ------------------------------------------------------------------ *
   *  中文 — интерфейс на китайском
   * ------------------------------------------------------------------ */
  var ZH = {
    "app.title": "汉字法师",
    "app.subtitle": "以游戏方式练习汉字",

    "hud.score": "得分",
    "hud.round": "回合",
    "hud.level": "等级",
    "hud.streak": "连击",
    "hud.mage": "法师",
    "hud.health": "生命",
    "hud.mana": "法力",

    "enemy.boss": "首领",
    "enemy.foe": "敌人",
    "enemy.boss_prefix": "首领",
    "enemy.stage": "第 {n} 阶 / 共 4 阶",
    "enemy.stage_of": "第 {n} 阶",
    "enemy.stage_short": "阶",
    "enemy.attack": "敌人攻击",

    "board.hint.rune": "写出汉字，它就会变成法术符文",
    "board.hint.chain": "写出符文，它们会连成一串",
    "board.runes": "✨ 符文",
    "board.attacks": "⚔ 普通攻击 — 第 {n} 个符文",
    "board.combo_runes": "🔗 组合「{word}」— 第 {n} 个符文，共 {total} 个",
    "board.hint_contour": "提示：轮廓",
    "board.hint_off": "提示：关闭（有奖励）",
    "board.order": "▶ 笔顺",
    "board.contour": "👁 轮廓",
    "board.undo": "↩ 撤销",
    "board.clear": "🗑 清空",
    "board.undo_done": "已撤销一笔",
    "board.clear_done": "画板已清空",
    "board.tap_not_stroke": "这是点击，不是笔画——请画出一条线。",
    "board.stroke": "第 {n} 笔",
    "board.write_prompt": "请写「{ch}」——{mean}！",
    "board.runes_named": "✨ 符文 · {mean}",
    "char.title": "{ch}（{py}）——{mean}",

    "atk.normal": "普通攻击",
    "atk.normal_note": "1 个符文 · 普通伤害",
    "atk.combo": "组合：「{word}」",
    "atk.combo_note": "{n} 个符文 · 伤害 ×{mult}",
    "atk.combo_locked": "难度提高后解锁组合，对首领始终可用",
    "atk.choose_again": "请重新选择攻击方式",
    "atk.choose_again_combo": "组合成功！请重新选择攻击方式",

    "log.spell": "{word} — 伤害 {dmg}（准确度 {acc}%）",
    "log.combo_ready": "组合完成——出击！",
    "log.spell_ready": "法术已就绪！",
    "log.rune_ok": "符文「{word}」已接受（{acc}%）。下一个：「{next}」",
    "log.enemy_down": "{name} 被击败！+{score} 分",
    "log.enemy_hit_you": "{name} 发动攻击！-{hp}",

    "grade.perfect": "太棒了！",
    "grade.great": "很好！",
    "grade.ok": "不错",
    "grade.poor": "太弱了……",

    "inv.title": "📜 符文背包",
    "inv.empty": "你写过的汉字会出现在这里。点击符文可以再次召唤并书写。",
    "inv.tip": "（点击可再次召唤并书写）",
    "inv.rune": "✨ 符文",

    "tip.write": "🖊 写出汉字，它就会变成",
    "tip.rune_word": "符文",
    "tip.spell_word": "的一部分。",
    "tip.normal_attack": "普通攻击",
    "tip.normal_attack_desc": "——1 个符文，比较简单，伤害普通。",
    "tip.combo": "组合",
    "tip.combo_desc": "——用同一个词写出 2–3 个符文，更难，但伤害高得多。",
    "tip.accuracy": "写得越准",
    "tip.and": "、",
    "tip.faster": "越快",
    "tip.accuracy_desc": "，攻击力就越强。",
    "tip.boss": "👹 每第 10 个敌人是",
    "tip.boss_desc": "：它有护甲，不用组合就打不过。",
    "tip.material": "📚 游戏内容来自",
    "tip.material_link": "最常用的 500 个汉字",
    "tip.material_desc": "；学会的符文会累积在背包里。",
    "tip.keys": "⏸ 暂停——⏸ 键或 Esc。音乐与音效——顶栏按钮。",

    "btn.start": "▶ 开始战斗",
    "btn.again": "🔄 再玩一次",
    "btn.resume": "▶ 继续",
    "keys.hint": "按键：1——普通攻击，2——组合，D——笔顺，H——轮廓，Z——撤销，C——清空，Esc——暂停",

    "pause.title": "已暂停",
    "pause.text": "游戏已停止，你的进度已保留。",
    "pause.resume_hint": "按 Esc 或 P 继续",
    "over.title": "你在战斗中倒下了……",
    "over.text": "法师被击败了，但魔法还在等待下一次尝试！",
    "over.score": "你的得分：{score}",

    "top.pause": "暂停（Esc）",
    "top.music": "8 位音乐",
    "top.sound": "音效",
    "top.order_hint": "显示笔顺（D）",
    "top.contour_hint": "显示/隐藏轮廓（H）",
    "top.undo_hint": "撤销一笔（Z）",
    "top.clear_hint": "清空（C）",

    "err.no_data": "⚠️ 未找到数据文件 hanzi-data.js，请把它放在 index.html 旁边。",

    "enemy.ghost": "幽灵",
    "enemy.bat": "蝙蝠",
    "enemy.ogre": "食人魔",
    "enemy.demon": "恶魔",
    "enemy.dragon": "巨龙",
    "enemy.darklord": "魔王",

    "lang.label": "语言",
    "lang.ru": "Рус",
    "lang.en": "Eng",
    "lang.zh": "中文",
    "lang.switch": "切换语言"
  };

  var DICT = { ru: RU, en: EN, zh: ZH };

  /* ------------------------------------------------------------------ *
   *  Определение языка
   * ------------------------------------------------------------------ */
  function valid(l) { return LANGS.indexOf(l) > -1 ? l : null; }

  function fromQuery() {
    try {
      var m = /[?&]lang=([a-z]{2})/i.exec(location.search || "");
      return m ? valid(m[1].toLowerCase()) : null;
    } catch (e) { return null; }
  }
  function fromStore() {
    try { return valid(localStorage.getItem(STORE)); } catch (e) { return null; }
  }
  function fromBrowser() {
    /* Берём все языки браузера по порядку предпочтения и выбираем первый
       поддерживаемый. «zh-CN», «zh-TW», «zh-Hans» — всё китайский. */
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || navigator.userLanguage || ""];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i] || "").toLowerCase();
      if (!tag) continue;
      var base = tag.split("-")[0];
      if (base === "zh") return "zh";
      if (base === "ru") return "ru";
      if (base === "en") return "en";
    }
    return null;
  }

  var lang = fromQuery() || fromStore() || fromBrowser() || "ru";
  var listeners = [];

  /* Подстановки: "урон {dmg}" + {dmg:5} -> "урон 5".
     Если ключа нет в словаре — берём русский, чтобы интерфейс не пустел,
     а в консоль пишем предупреждение: это помогает ловить опечатки. */
  function t(key, vars) {
    var s = DICT[lang] && DICT[lang][key];
    if (s === undefined) {
      if (window.console && console.warn) console.warn("[i18n] нет строки:", key, "для языка", lang);
      s = RU[key];
    }
    if (s === undefined) return key;
    if (vars) {
      s = String(s).replace(/\{(\w+)\}/g, function (all, name) {
        return (vars[name] === undefined || vars[name] === null) ? all : String(vars[name]);
      });
    }
    return s;
  }

  function setLang(l) {
    l = valid(l);
    if (!l || l === lang) return lang;
    lang = l;
    try { localStorage.setItem(STORE, l); } catch (e) {}
    try { document.documentElement.lang = l; } catch (e) {}
    listeners.forEach(function (fn) { try { fn(l); } catch (e) {} });
    return lang;
  }

  window.I18N = {
    t: t,
    setLang: setLang,
    getLang: function () { return lang; },
    langs: LANGS.slice(),
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    has: function (key, l) { return !!(DICT[l || lang] && DICT[l || lang][key] !== undefined); },
    dict: DICT
  };
  window.t = t;

  try { document.documentElement.lang = lang; } catch (e) {}
})();
