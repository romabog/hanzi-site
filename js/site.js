/* ==========================================================================
   «Маг Иероглифов» — логика сайта: ленивая загрузка игры, переключатель
   версий, подстройка высоты встроенного окна и полноэкранный режим.
   Без зависимостей: обычный скрипт, работает и через file://, и в сети.
   ========================================================================== */
(function () {
  "use strict";

  var GAME_FRAME = document.getElementById("gameFrame");
  var FRAME_BOX  = document.getElementById("frameBox");
  var VERSIONS   = Array.prototype.slice.call(document.querySelectorAll(".vbtn"));
  if (!GAME_FRAME || !FRAME_BOX) return;

  /* Две версии игры: разные файлы, разные списки противников. */
  var SOURCES = {
    classic: GAME_FRAME.getAttribute("data-src-classic"),
    anime:   GAME_FRAME.getAttribute("data-src-anime")
  };
  var LABELS = { classic: "Классическая", anime: "Аниме-версия" };

  /* Язык интерфейса: ключи версии берём из словаря сайта, чтобы подпись
     «Версия:» менялась вместе с языком. */
  function versionLabel(kind) {
    var key = kind === "classic" ? "play.classic" : "play.anime";
    return (window.I18N && window.I18N.t(key)) || LABELS[kind];
  }

  /* Выбранная версия хранится в адресе (#anime), чтобы ссылку можно было
     передать другому — и чтобы браузер запомнил выбор при возврате. */
  function versionFromUrl() {
    var h = (location.hash || "").toLowerCase();
    if (h.indexOf("classic") > -1) return "classic";
    if (h.indexOf("anime") > -1) return "anime";
    return "anime";
  }
  var current = versionFromUrl();

  function paint() {
    VERSIONS.forEach(function (b) {
      b.setAttribute("aria-selected", b.dataset.version === current ? "true" : "false");
    });
    var pill = document.getElementById("versionPill");
    if (pill) pill.textContent = versionLabel(current);
  }

  /* --- Ленивая загрузка: файлы игры (~500 КБ с данными) тянем только
         когда блок с игрой подходит к экрану или по явному клику. --- */
  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    GAME_FRAME.src = SOURCES[current];
    FRAME_BOX.classList.add("is-ready");
  }

  /* Если IntersectionObserver не поддержан — грузим сразу, это безопасно. */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { load(); io.disconnect(); } });
    }, { rootMargin: "400px 0px" });
    io.observe(FRAME_BOX);
  } else {
    load();
  }

  /* --- Переключение версий: подменяем src внутри уже загруженного
         фрейма, страница целиком при этом не перезагружается. --- */
  function switchTo(v) {
    if (!v || v === current) return;
    current = v;
    paint();
    if (loaded) GAME_FRAME.src = SOURCES[current];
    if (history.replaceState) history.replaceState(null, "", "#" + v);
    else location.hash = v;
  }

  VERSIONS.forEach(function (b) {
    b.addEventListener("click", function () { switchTo(b.dataset.version); });
  });

  /* Кнопка «Играть» в шапке и в герое: прокрутить к игре и загрузить её. */
  document.querySelectorAll("[data-jump-play]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var t = document.getElementById("play");
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      load();
      setTimeout(function () { try { GAME_FRAME.focus(); } catch (err) {} }, 500);
    });
  });

  /* --- Высота фрейма: игра сообщает свой размер, окно подстраивается
         и внутренняя прокрутка не появляется. Плюс защита от «дёрганья»:
         пишем новое значение только если оно отличается на 8px и больше. --- */
  var lastH = 0;
  function setFrameHeight(h) {
    h = Math.round(h);
    if (!isFinite(h) || h < 300) return;
    if (Math.abs(h - lastH) < 8) return;
    lastH = h;
    GAME_FRAME.style.height = h + "px";
    FRAME_BOX.style.minHeight = h + "px";
  }
  window.addEventListener("message", function (ev) {
    var d = ev && ev.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "hanzi-height" && typeof d.height === "number") setFrameHeight(d.height);
    if (d.type === "hanzi-ready") FRAME_BOX.classList.add("is-ready");
  });

  /* Резерв: если игра почему-то не пришлёт размер, поставим разумный. */
  setTimeout(function () {
    if (!lastH) {
      var h = window.innerWidth < 820 ? 640 : 900;
      setFrameHeight(h);
    }
  }, 2500);

  /* --- Полноэкранный режим кнопками и клавишей F (когда в фокусе игра). --- */
  var fsBtn = document.getElementById("fsBtn");
  function inFrame() { return document.activeElement === GAME_FRAME; }
  function toggleFs() {
    var el = FRAME_BOX;
    var isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFs) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
    else {
      var req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el);
    }
  }
  if (fsBtn) fsBtn.addEventListener("click", toggleFs);
  document.addEventListener("fullscreenchange", function () {
    if (fsBtn) {
      var k = document.fullscreenElement ? "play.exitFullscreen" : "play.fullscreen";
      fsBtn.textContent = (window.I18N && window.I18N.t(k)) || (document.fullscreenElement ? "Выйти из полного экрана" : "Полный экран");
    }
    setTimeout(function () { setFrameHeight(lastH || 900); }, 120);
  });

  document.addEventListener("keydown", function (e) {
    if ((e.key === "f" || e.key === "F" || e.key === "а" || e.key === "А") && inFrame() && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleFs();
    }
  });

  /* Хэш может измениться кнопкой «назад» браузера. */
  window.addEventListener("hashchange", function () {
    var v = versionFromUrl();
    if (v !== current) { current = v; paint(); if (loaded) GAME_FRAME.src = SOURCES[current]; }
  });

  /* --- Тонкий параллакс для декоративного иероглифа в герое. --- */
  var gc = document.querySelector(".hero .glowchar");
  if (gc && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var raf = 0;
    window.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var y = window.scrollY || 0;
        if (y < 900) gc.style.transform = "translateX(-50%) translateY(" + (y * 0.16) + "px)";
      });
    }, { passive: true });
  }

  paint();

  /* ================= ЯЗЫК ИНТЕРФЕЙСА САЙТА ================= */

  /* Стена иероглифов и витрина противников собираются при сборке сайта:
     у каждого элемента лежат подписи на трёх языках в data-атрибутах.
     Здесь показываем нужные — иначе этот блок остался бы русским. */
  function applyGenerated() {
    var l = window.I18N ? window.I18N.getLang() : "ru";
    Array.prototype.slice.call(document.querySelectorAll(".char")).forEach(function (el) {
      var v = el.getAttribute("data-t-" + l);
      if (v) el.title = v;
    });
    Array.prototype.slice.call(document.querySelectorAll(".show-item")).forEach(function (el) {
      var name = el.getAttribute("data-" + l);
      var note = el.getAttribute("data-note-" + l);
      var stage = el.getAttribute("data-stage-" + l);
      var b = el.querySelector("b"), s = el.querySelector("span"), e = el.querySelector("em");
      if (b && name) b.textContent = name;
      if (s && note) s.textContent = note;
      if (e && stage) e.textContent = stage;
    });
  }

  /* Кнопки языка меняют словарь, перерисовывают разметку и перезагружают
     игру внутри страницы с нужным ?lang=, чтобы интерфейс совпадал. */
  function applyLang() {
    if (window.I18N) {
      window.I18N.apply(document);
      applyGenerated();
      paint();                       /* подпись выбранной версии игры */
      var f = document.getElementById("fsBtn");
      if (f) f.textContent = window.I18N.t(document.fullscreenElement ? "play.exitFullscreen" : "play.fullscreen");
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute("content", window.I18N.t("site.desc"));
      try { document.title = window.I18N.t("site.title"); } catch (e) {}
    }
  }
  Array.prototype.slice.call(document.querySelectorAll(".langbtn")).forEach(function (b) {
    b.addEventListener("click", function () {
      if (!window.I18N) return;
      window.I18N.setLang(b.getAttribute("data-lang"));
      applyLang();
      /* игра внутри страницы переезжает на тот же язык */
      if (loaded) {
        var base = SOURCES[current].split("?")[0];
        GAME_FRAME.src = base + "?lang=" + window.I18N.getLang();
      }
    });
  });
  if (window.I18N) { window.I18N.apply(document); applyLang(); }
})();