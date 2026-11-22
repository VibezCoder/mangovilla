/**
 * THE MANGO VILLA — RATNAGIRI
 * Motion & interface engine
 *
 * Stack (vendored, self-hosted): Lenis 1.3 · GSAP 3.15 · ScrollTrigger
 * Booking handoff: IPMS247 live engine + WhatsApp concierge.
 * Everything degrades to a working static page if motion libraries fail.
 */
(() => {
  'use strict';

  const BOOKING_URL = 'https://live.ipms247.com/booking/book-rooms-themangovilla';
  const WHATSAPP_NUMBER = '918422926232';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const fromISO = (value) => {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  };
  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };
  const startOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  };
  const fmtDock = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  class MangoVillaExperience {
    constructor() {
      this.lenis = null;
      this.mm = null;
      this.header = $('.site-header');
      this.inkSections = $$('[data-section-theme]');
      this.menuToggle = null;
      this.menuPanel = null;
      this.updateHeaderInk = null;
      this.closeMenu = null;
      this.init();
    }

    init() {
      // Interface pieces work with or without GSAP.
      this.initBooking();
      this.initNavigation();
      this.initMobileMenu();
      this.initHeaderInking();

      if (!window.gsap || !window.ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });

      if (REDUCED) {
        document.documentElement.classList.add('reduced-motion');
        return;
      }

      this.initSmoothScroll();

      this.mm = gsap.matchMedia();
      this.mm.add(
        { isDesktop: '(min-width: 860px)', isMobile: '(max-width: 859px)' },
        (context) => {
          // The badge trigger must be created before the hero pin so its
          // start position is measured at the top of the document.
          this.initEphemeralChrome();
          this.initHeroCanopy(context.conditions.isDesktop);
          this.initParallaxDrift();
          this.initEditorialMasks();
          this.initStaggeredSuites();
          this.initAtmosphereScales();
        }
      );

      const refresh = () => {
        ScrollTrigger.refresh();
        if (this.updateHeaderInk) this.updateHeaderInk();
      };

      window.addEventListener('load', refresh);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh).catch(() => {});
      const heroImage = $('.hero-media');
      if (heroImage && heroImage.decode) {
        heroImage.decode().then(refresh).catch(() => {});
      }
    }

    /* ----------------------------------------------------------------
       Smooth scroll
       ---------------------------------------------------------------- */
    initSmoothScroll() {
      if (!window.Lenis || !window.matchMedia('(pointer: fine)').matches) return;

      this.lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        infinite: false,
      });

      this.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => this.lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* ----------------------------------------------------------------
       Signature hero: walking through the mango canopy, pinned scrub
       ---------------------------------------------------------------- */
    initHeroCanopy(isDesktop) {
      const heroWrapper = $('.hero-pinned-wrapper');
      const heroMedia = $('.hero-media');
      const heroGlow = $('.hero-glow');
      const titleLines = $$('.hero-title-line');
      const heroSubtitle = $('.hero-subtitle');
      const heroActions = $('.hero-actions');
      const branches = $$('.hero-branch');
      const heroFoot = $('.hero-foot');
      const heroRail = $('.hero-rail');
      if (!heroWrapper || !heroMedia) return;

      const heroTl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: heroWrapper,
          start: 'top top',
          end: isDesktop ? '+=100%' : '+=80%',
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
        },
      });

      // Step into the photograph: the grove pushes forward, slightly upward.
      heroTl.to(heroMedia, { scale: 1.16, yPercent: -3, ease: 'none' }, 0);

      // A warm saffron bloom rises behind the villa.
      if (heroGlow) {
        heroTl.fromTo(
          heroGlow,
          { scale: 0.72, opacity: 0.22 },
          { scale: 1.35, opacity: 0.5, ease: 'power1.out' },
          0
        );
      }

      // The headline parts like foliage opening: one line lifts, one settles,
      // then both clear early so the villa is revealed.
      if (titleLines.length) {
        heroTl.to(
          titleLines[0],
          { y: -110, opacity: 0, filter: 'blur(5px)', duration: 0.42, ease: 'power2.in' },
          0
        );
        heroTl.to(
          titleLines[1],
          { y: 110, opacity: 0, filter: 'blur(5px)', duration: 0.42, ease: 'power2.in' },
          0
        );
      }

      if (heroSubtitle) {
        heroTl.to(heroSubtitle, { y: 30, opacity: 0, duration: 0.28, ease: 'power1.in' }, 0);
      }
      if (heroActions) {
        heroTl.to(heroActions, { y: 30, opacity: 0, duration: 0.32, ease: 'power1.in' }, 0.04);
      }

      // Drawn mango branches drift out towards their corners and dissolve.
      if (branches.length) {
        heroTl.to(
          branches,
          {
            y: (index) => (index === 0 ? -72 : 72),
            scale: 1.06,
            opacity: 0,
            duration: 0.75,
            stagger: 0.04,
            ease: 'none',
          },
          0
        );
      }

      if (heroFoot) heroTl.to(heroFoot, { opacity: 0, y: 20, ease: 'none' }, 0);
      if (heroRail) heroTl.to(heroRail, { opacity: 0, ease: 'none' }, 0);
    }

    /* ----------------------------------------------------------------
       Ephemeral announcement dissolve
       ---------------------------------------------------------------- */
    initEphemeralChrome() {
      const badge = $('.ephemeral-badge');
      if (!badge) return;

      gsap.to(badge, {
        scrollTrigger: {
          trigger: '.hero-pinned-wrapper',
          start: 'top top',
          end: '+=220',
          scrub: true,
        },
        opacity: 0,
        y: -24,
        letterSpacing: '0.14em',
        filter: 'blur(8px)',
        ease: 'power1.out',
      });
    }

    /* ----------------------------------------------------------------
       Live header inking — measured against the header's midline
       ---------------------------------------------------------------- */
    initHeaderInking() {
      if (!this.header) return;

      let ticking = false;

      const update = () => {
        ticking = false;
        const headerBox = this.header.getBoundingClientRect();
        const testLine = headerBox.top + headerBox.height / 2;
        let activeTheme = 'dark';

        this.inkSections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= testLine && rect.bottom >= testLine) {
            activeTheme = section.getAttribute('data-section-theme') || 'light';
          }
        });

        document.documentElement.setAttribute('data-ink', activeTheme);
      };

      const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate, { passive: true });
      this.updateHeaderInk = requestUpdate;
      update();
    }

    /* ----------------------------------------------------------------
       Parallax drift inside masked frames
       ---------------------------------------------------------------- */
    initParallaxDrift() {
      $$('.parallax-media').forEach((image) => {
        gsap.fromTo(
          image,
          { yPercent: -15 },
          {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: image.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }

    /* ----------------------------------------------------------------
       Masked line-by-line editorial reveals
       ---------------------------------------------------------------- */
    initEditorialMasks() {
      $$('.masked-heading').forEach((group) => {
        const lines = $$('.masked-line-inner', group);
        if (!lines.length) return;

        gsap.set(lines, { yPercent: 110 });
        gsap.to(lines, {
          yPercent: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.075,
          scrollTrigger: {
            trigger: group,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }

    /* ----------------------------------------------------------------
       Suite card cascade — outer wrapper only (hover stays on inner)
       ---------------------------------------------------------------- */
    initStaggeredSuites() {
      const cards = $$('.suite-card');
      if (!cards.length) return;

      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.14,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.suites-deck',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    /* ----------------------------------------------------------------
       Slow atmospheric scales for the estate + dining interludes
       ---------------------------------------------------------------- */
    initAtmosphereScales() {
      const estate = $('.estate-media');
      if (estate) {
        gsap.fromTo(
          estate,
          { scale: 1.12 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.estate-band',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      const interlude = $('.interlude-bg');
      if (interlude) {
        gsap.fromTo(
          interlude,
          { scale: 1.05 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.interlude-section',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }

    /* ----------------------------------------------------------------
       Anchor navigation
       ---------------------------------------------------------------- */
    initNavigation() {
      $$('[data-scroll-to]').forEach((link) => {
        link.addEventListener('click', (event) => {
          const selector = link.getAttribute('data-scroll-to');
          if (!selector) return;
          event.preventDefault();
          if (this.closeMenu) this.closeMenu({ restoreFocus: false });

          if (selector === '#top') {
            this.scrollToTarget(0);
            return;
          }

          const target = document.querySelector(selector);
          if (target) this.scrollToTarget(target);
        });
      });
    }

    scrollToTarget(target) {
      const headerHeight = this.header ? this.header.offsetHeight : 76;

      if (this.lenis) {
        // Lenis already subtracts the target's CSS scroll-margin-top, which is
        // set to the header height plus breathing room in the stylesheet.
        this.lenis.scrollTo(target, { duration: 1.25 });
        return;
      }

      const top =
        typeof target === 'number'
          ? target
          : target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

      window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
    }

    /* ----------------------------------------------------------------
       Mobile menu
       ---------------------------------------------------------------- */
    initMobileMenu() {
      const toggle = $('[data-menu-toggle]');
      const panel = $('#mobile-menu');
      if (!toggle || !panel) return;

      this.menuToggle = toggle;
      this.menuPanel = panel;
      const label = $('.sr-only', toggle);

      const setOpen = (open, options = {}) => {
        const { restoreFocus = true } = options;
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        if (label) label.textContent = open ? 'Close menu' : 'Open menu';
        document.documentElement.classList.toggle('menu-open', open);

        if (open) {
          if (this.lenis) this.lenis.stop();
          const firstLink = panel.querySelector('a, button');
          if (firstLink) firstLink.focus();
        } else {
          if (this.lenis && !document.documentElement.classList.contains('drawer-open')) {
            this.lenis.start();
          }
          if (restoreFocus) toggle.focus();
        }
      };

      this.closeMenu = (options) => {
        if (!panel.hidden) setOpen(false, options);
      };

      toggle.addEventListener('click', () => setOpen(panel.hidden));

      $$('[data-menu-link]', panel).forEach((link) => {
        link.addEventListener('click', () => setOpen(false, { restoreFocus: false }));
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false);
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 960 && !panel.hidden) setOpen(false, { restoreFocus: false });
      });
    }

    /* ----------------------------------------------------------------
       Booking: dock state + drawer + handoff
       ---------------------------------------------------------------- */
    initBooking() {
      const drawer = $('[data-booking-drawer]');
      const panel = drawer ? $('.booking-panel', drawer) : null;
      const form = $('[data-booking-form]');
      if (!drawer || !panel || !form) return;

      const checkinInput = $('[data-checkin]', form);
      const checkoutInput = $('[data-checkout]', form);
      const adultsSelect = $('[data-adults]', form);
      const childrenSelect = $('[data-children]', form);
      const roomSelect = $('[data-room-select]', form);
      const nightsLabel = $('[data-nights]', form);
      const summaryLabel = $('[data-date-summary]', form);
      const whatsappLink = $('[data-whatsapp]', form);
      const status = $('[data-drawer-status]', form);
      const dockCheckin = $('[data-dock-checkin]');
      const dockCheckout = $('[data-dock-checkout]');
      const dockGuests = $('[data-dock-guests]');

      const state = {
        checkin: addDays(startOfToday(), 7),
        checkout: addDays(startOfToday(), 9),
        adults: 2,
        children: 0,
        room: '',
      };

      const today = startOfToday();
      const todayISO = toISO(today);
      const lastFocused = { element: null };

      checkinInput.min = todayISO;
      checkoutInput.min = toISO(addDays(today, 1));

      const guestText = () => {
        const adultLabel = state.adults === 1 ? '1 adult' : `${state.adults} adults`;
        if (!state.children) return adultLabel;
        const childLabel = state.children === 1 ? '1 child' : `${state.children} children`;
        return `${adultLabel} + ${childLabel}`;
      };

      const nights = () =>
        Math.max(1, Math.round((state.checkout - state.checkin) / 86400000));

      const buildWhatsAppMessage = () => {
        const lines = [
          'Hello The Mango Villa, I would like to check availability.',
          '',
          `Check-in: ${fmtLong.format(state.checkin)}`,
          `Check-out: ${fmtLong.format(state.checkout)}`,
          `Nights: ${nights()}`,
          `Guests: ${guestText()}`,
          `Room: ${state.room || 'Any room — best available'}`,
          '',
          'Please confirm availability and rates. Thank you.',
        ];
        return lines.join('\n');
      };

      const sync = () => {
        // Keep at least one night between dates.
        if (state.checkout <= state.checkin) {
          state.checkout = addDays(state.checkin, 1);
        }

        checkinInput.value = toISO(state.checkin);
        checkoutInput.value = toISO(state.checkout);
        checkoutInput.min = toISO(addDays(state.checkin, 1));
        adultsSelect.value = String(state.adults);
        childrenSelect.value = String(state.children);

        if (state.room && roomSelect.value !== state.room) {
          roomSelect.value = state.room;
        }

        const count = nights();
        nightsLabel.textContent = count === 1 ? '1 night' : `${count} nights`;
        summaryLabel.textContent = `${fmtDock.format(state.checkin)} → ${fmtDock.format(state.checkout)}`;

        if (dockCheckin) dockCheckin.textContent = fmtDock.format(state.checkin);
        if (dockCheckout) dockCheckout.textContent = fmtDock.format(state.checkout);
        if (dockGuests) dockGuests.textContent = guestText();

        whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
      };

      const openDrawer = (room = '') => {
        if (room) state.room = room;
        if (this.closeMenu) this.closeMenu({ restoreFocus: false });
        lastFocused.element = document.activeElement;
        sync();
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('drawer-open');
        if (this.lenis) this.lenis.stop();
        if (status) status.textContent = '';
        const focusTarget = checkinInput;
        window.setTimeout(() => focusTarget.focus({ preventScroll: true }), REDUCED ? 0 : 90);
      };

      const closeDrawer = () => {
        if (!drawer.classList.contains('is-open')) return;
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('drawer-open');
        if (this.lenis && !document.documentElement.classList.contains('menu-open')) {
          this.lenis.start();
        }
        if (lastFocused.element && typeof lastFocused.element.focus === 'function' && lastFocused.element.offsetParent !== null) {
          lastFocused.element.focus({ preventScroll: true });
        } else {
          const fallback = $('.header-book');
          if (fallback) fallback.focus({ preventScroll: true });
        }
      };

      const trapFocus = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeDrawer();
          return;
        }
        if (event.key !== 'Tab') return;

        const focusables = $$(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
          panel
        ).filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      document.addEventListener('keydown', (event) => {
        if (drawer.classList.contains('is-open')) trapFocus(event);
      });

      $$('[data-book-open]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          openDrawer(trigger.getAttribute('data-book-room') || '');
        });
      });

      $$('[data-book-close]', drawer).forEach((trigger) => {
        trigger.addEventListener('click', closeDrawer);
      });

      checkinInput.addEventListener('change', () => {
        if (!checkinInput.value) return;
        state.checkin = fromISO(checkinInput.value);
        if (state.checkin < today) state.checkin = today;
        sync();
      });

      checkoutInput.addEventListener('change', () => {
        if (!checkoutInput.value) return;
        state.checkout = fromISO(checkoutInput.value);
        sync();
      });

      adultsSelect.addEventListener('change', () => {
        state.adults = Number(adultsSelect.value) || 1;
        sync();
      });

      childrenSelect.addEventListener('change', () => {
        state.children = Number(childrenSelect.value) || 0;
        sync();
      });

      roomSelect.addEventListener('change', () => {
        state.room = roomSelect.value;
        sync();
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        sync();
        if (status) {
          status.textContent = 'Opening the villa’s secure booking engine in a new tab…';
        }
        window.open(BOOKING_URL, '_blank', 'noopener');
      });

      // Dock labels should be live from first paint.
      sync();
    }
  }

  const start = () => new MangoVillaExperience();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
