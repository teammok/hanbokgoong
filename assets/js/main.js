/* ==========================================================================
   한복궁(宮) HANBOK GOONG — 공통 스크립트
   외부 라이브러리 없음 (Vanilla JS)
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     1. 헤더 스크롤 상태
     ------------------------------------------------------------------ */
  var header = $('.header');
  var fabTop = $('.fab--top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (fabTop) fabTop.classList.toggle('is-on', y > 640);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (fabTop) {
    fabTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     2. 모바일 드로어
     ------------------------------------------------------------------ */
  var burger = $('.burger');
  var drawer = $('.drawer');

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.classList.toggle('is-open', open);
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('is-locked', open);
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });
  }
  if (drawer) {
    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }

  /* ------------------------------------------------------------------
     3. 스크롤 리빌
     ------------------------------------------------------------------ */
  var revealables = $$('.rv');
  if ('IntersectionObserver' in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------------
     4. 숫자 카운트업
     ------------------------------------------------------------------ */
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var dur = 1500;
        var t0 = null;
        function tick(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('ko-KR');
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ------------------------------------------------------------------
     5. FAQ 아코디언
     ------------------------------------------------------------------ */
  $$('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var open = item.classList.contains('is-open');
      var group = btn.closest('.faq');
      if (group) {
        $$('.faq__item.is-open', group).forEach(function (i) {
          if (i !== item) {
            i.classList.remove('is-open');
            var q = $('.faq__q', i);
            if (q) q.setAttribute('aria-expanded', 'false');
          }
        });
      }
      item.classList.toggle('is-open', !open);
      btn.setAttribute('aria-expanded', !open ? 'true' : 'false');
    });
  });

  /* ------------------------------------------------------------------
     6. 갤러리 필터
     ------------------------------------------------------------------ */
  $$('[data-filter-group]').forEach(function (group) {
    var targetSel = group.getAttribute('data-filter-group');
    var gallery = $(targetSel);
    if (!gallery) return;

    group.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.filter');
      if (!btn) return;
      var key = btn.getAttribute('data-filter');

      $$('.filter', group).forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      $$('.gal__item', gallery).forEach(function (item) {
        var cats = (item.getAttribute('data-cat') || '').split(' ');
        var show = key === 'all' || cats.indexOf(key) !== -1;
        item.classList.toggle('is-hidden', !show);
      });

      buildLightboxList();
    });
  });

  /* ------------------------------------------------------------------
     7. 라이트박스
     ------------------------------------------------------------------ */
  var lb     = $('.lb');
  var lbImg  = $('.lb__img');
  var lbCap  = $('.lb__cap');
  var lbList = [];
  var lbIdx  = 0;

  function buildLightboxList() {
    lbList = $$('.gal__item').filter(function (el) {
      return !el.classList.contains('is-hidden');
    });
  }

  function showAt(i) {
    if (!lbList.length) return;
    lbIdx = (i + lbList.length) % lbList.length;
    var el  = lbList[lbIdx];
    var img = $('img', el);
    var cap = $('.gal__cap', el);
    if (!img) return;
    lbImg.src = el.getAttribute('data-full') || img.getAttribute('src');
    lbImg.alt = img.getAttribute('alt') || '';
    lbCap.textContent = cap ? cap.textContent.trim() : (img.getAttribute('alt') || '');
  }

  function openLb(el) {
    if (!lb) return;
    buildLightboxList();
    var i = lbList.indexOf(el);
    showAt(i < 0 ? 0 : i);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  }

  function closeLb() {
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  if (lb) {
    buildLightboxList();

    document.addEventListener('click', function (ev) {
      var item = ev.target.closest('.gal__item');
      if (item) { openLb(item); return; }

      if (ev.target.closest('.lb__x')) { closeLb(); return; }
      if (ev.target.closest('.lb__nav--prev')) { showAt(lbIdx - 1); return; }
      if (ev.target.closest('.lb__nav--next')) { showAt(lbIdx + 1); return; }
      if (ev.target === lb) closeLb();
    });

    document.addEventListener('keydown', function (ev) {
      if (!lb.classList.contains('is-open')) return;
      if (ev.key === 'Escape')     closeLb();
      if (ev.key === 'ArrowLeft')  showAt(lbIdx - 1);
      if (ev.key === 'ArrowRight') showAt(lbIdx + 1);
    });

    /* 모바일 스와이프 */
    var tx = 0;
    lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 55) showAt(lbIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     7-B. 히어로 배경 영상 — 화면에 보일 때만 로드·재생
     ------------------------------------------------------------------ */
  var heroVideo = $('.hero__video');
  if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var startHero = function () {
      heroVideo.preload = 'auto';
      heroVideo.load();
      var p = heroVideo.play();
      if (p && p.catch) p.catch(function () { /* 자동재생 차단 시 배경 이미지 유지 */ });
    };
    heroVideo.addEventListener('playing', function () {
      heroVideo.classList.add('is-ready');
    });
    // 모바일 데이터 절약 모드/저속 회선에서는 영상 생략
    var conn = navigator.connection;
    var lowData = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
    if (!lowData) {
      if ('requestIdleCallback' in window) requestIdleCallback(startHero, { timeout: 2500 });
      else setTimeout(startHero, 900);
    }
    // 화면 밖으로 벗어나면 일시정지 (배터리 절약)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (heroVideo.readyState > 2) heroVideo.play().catch(function () {}); }
          else heroVideo.pause();
        });
      }, { threshold: 0.05 }).observe(heroVideo);
    }
  }

  /* ------------------------------------------------------------------
     7-C. 영상 카드 재생 버튼
     ------------------------------------------------------------------ */
  $$('.film__play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.film');
      var video = $('video', card);
      if (!video) return;
      card.classList.add('is-playing');
      video.preload = 'auto';
      video.controls = true;
      video.play().catch(function () {});
    });
  });
  $$('.film video').forEach(function (v) {
    v.addEventListener('ended', function () {
      v.controls = false;
      v.currentTime = 0;
      v.closest('.film').classList.remove('is-playing');
    });
  });
  // 한 번에 하나만 재생
  $$('.film video').forEach(function (v) {
    v.addEventListener('play', function () {
      $$('.film video').forEach(function (o) { if (o !== v) o.pause(); });
    });
  });

  /* ------------------------------------------------------------------
     8. 마퀴 콘텐츠 복제 (무한 루프용)
     ------------------------------------------------------------------ */
  $$('.marquee__track').forEach(function (track) {
    if (track.getAttribute('data-cloned')) return;
    track.innerHTML += track.innerHTML;
    track.setAttribute('data-cloned', '1');
  });

  /* ------------------------------------------------------------------
     9. 현재 연도
     ------------------------------------------------------------------ */
  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
