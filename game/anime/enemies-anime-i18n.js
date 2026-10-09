/* ==========================================================================
   Названия противников и титулы боссов на английском и китайском.
   Подключается ПОСЛЕ enemies-anime.js: скрипт дописывает каждому противнику
   поля nameEn/nameZh, а боссам — titleEn/titleZh.

   Если перевода нет, интерфейс покажет русское название.
   ========================================================================== */
(function () {
  "use strict";

  /* названия обычных врагов */
  var NAMES = {
    "an-foxling":  ["Fox Spirit Cub",    "狐妖幼崽"],
    "an-spore":    ["Sporeling",          "孢子精"],
    "an-bamboob":  ["Bamboo Spirit",      "竹灵"],
    "an-mushroom": ["Clinging Mushroom",  "黏人菇"],
    "an-raccoon":  ["Thieving Raccoon",   "盗宝浣熊"],
    "an-koi":      ["Dragon Koi",         "锦鲤化龙"],
    "an-jelly":    ["Lantern Jellyfish",  "灯笼水母"],
    "an-crab":     ["Shellback Crab",     "铁甲蟹"],
    "an-eel":      ["Spark Eel",          "放电鳗"],
    "an-turtle":   ["Island Turtle",      "岛屿巨龟"],
    "an-stone":    ["Stone Warden",       "石守卫"],
    "an-goat":     ["Mountain Goat",      "山羊精"],
    "an-crane":    ["Cleric Crane",       "仙鹤修士"],
    "an-monkey":   ["Warrior Monkey",     "战猴"],
    "an-tiger":    ["Tiger General",      "虎将军"],
    "an-ember":    ["Ember Sprite",       "火星精"],
    "an-lantern":  ["Man-Eating Lantern", "食人灯"],
    "an-thunder":  ["Thunder Herald",     "雷使者"],
    "an-censer":   ["Censer Demon",       "香炉魔"],
    "an-phoenix":  ["Phoenix Guardian",   "凤凰守卫"],
    "an-frost":    ["Frost Spirit",       "霜灵"],
    "an-snowfox":  ["Snow Fox",           "雪狐"],
    "an-moonrab":  ["Moon Rabbit",        "月兔"],
    "an-yuki":     ["Ice Maiden",         "雪女"],
    "an-mirror":   ["Mirror Spirit",      "镜灵"],
    "an-jiangshi": ["Jiangshi",           "僵尸"],
    "an-ghoul":    ["Ghoul Monk",         "食尸僧"],
    "an-wraith":   ["Wraith Swordsman",   "幽魂剑客"],
    "an-oni":      ["Oni Demon",          "鬼武士"],
    "an-assassin": ["Shadow Assassin",    "暗影刺客"]
  };

  /* боссы: [английское имя, китайское имя, английский титул, китайский титул] */
  var BOSSES = {
    "bos-lord":     ["Crimson General",   "赤红将军",   "Warden of the Eastern Gate", "东门守卫"],
    "bos-serpent":  ["Jade Serpent",      "碧玉蛇",     "Mistress of the Quiet River", "静河之主"],
    "bos-monk":     ["Fallen Monk",       "叛僧",       "He Who Burned the Sutras",    "焚经者"],
    "bos-warlord":  ["Warlord of a Thousand Spears", "千枪将军", "A Realm Without a Throne", "无座之国"],
    "bos-empress":  ["Ice Empress",       "冰帝",       "The Winter That Never Ends",  "无尽的冬天"],
    "bos-dragon":   ["Heavenly Dragon",   "天龙",       "Devourer of Clouds",          "吞云者"],
    "bos-immortal": ["Immortal Patriarch","仙祖",       "The Last of the Xian",        "最后的仙"]
  };

  var list = (typeof window !== "undefined") && window.ANIME_ENEMIES;
  var bosses = (typeof window !== "undefined") && window.ANIME_BOSSES;

  function fill(arr, table, withTitle) {
    if (!arr) return 0;
    var n = 0;
    arr.forEach(function (e) {
      var row = table[e.art];
      if (!row) return;
      e.nameEn = row[0];
      e.nameZh = row[1];
      if (withTitle) { e.titleEn = row[2]; e.titleZh = row[3]; }
      n++;
    });
    return n;
  }

  var a = fill(list, NAMES, false);
  var b = fill(bosses, BOSSES, true);
  window.ANIME_NAMES_I18N = { enemies: a, bosses: b };
})();
