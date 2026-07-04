/**
 * Birthday Website — Main Script
 * GSAP · Lenis · Confetti · Typed.js · Microphone API
 */

(function () {
  "use strict";

  const cfg = BIRTHDAY_CONFIG;

  // Replace {name} / {yourName} placeholders in text fields
  function personalize(text) {
    if (!text) return "";
    return text
      .replace(/\{name\}/g, cfg.name)
      .replace(/\{yourName\}/g, cfg.yourName);
  }

  if (cfg.letter) cfg.letter = personalize(cfg.letter);
  if (cfg.gift?.message) cfg.gift.message = personalize(cfg.gift.message);

  // ── Apply theme colors from config ──
  function applyTheme() {
    const root = document.documentElement;
    root.style.setProperty("--primary", cfg.colors.primary);
    root.style.setProperty("--secondary", cfg.colors.secondary);
    root.style.setProperty("--accent", cfg.colors.accent);
    root.style.setProperty("--bg", cfg.colors.background);
    root.style.setProperty("--text", cfg.colors.text);
    root.style.setProperty("--glow", cfg.colors.glow);
    document.querySelector('meta[name="theme-color"]').content = cfg.colors.background;
  }

  // ── State ──
  let lenis = null;
  let typedInstance = null;
  let wishIndex = 0;
  let audioContext = null;
  let analyser = null;
  let micStream = null;
  let blowInterval = null;
  let fireworksAnimId = null;
  let musicPlaying = false;
  let siteStarted = false;

  const hasGsap = () => typeof gsap !== "undefined";
  const hasScrollTrigger = () => typeof ScrollTrigger !== "undefined";
  const hasLenis = () => typeof Lenis !== "undefined";
  const hasTyped = () => typeof Typed !== "undefined";
  const hasConfetti = () => typeof confetti === "function";

  function finishLoader(resolve) {
    const loader = document.getElementById("loader");
    const main = document.getElementById("main-content");
    if (loader) loader.classList.add("fade-out");
    if (main) main.classList.remove("hidden");
    resolve();
  }

  function revealWelcome() {
    [
      ".welcome-name",
      ".welcome-subtitle",
      ".welcome-photo-wrap",
      "#start-btn",
      ".scroll-hint",
    ].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }

  // ═══════════════════════════════════════
  //  LOADER
  // ═══════════════════════════════════════
  function initLoader() {
    return new Promise((resolve) => {
      const loader = document.getElementById("loader");
      if (!loader) {
        finishLoader(resolve);
        return;
      }

      const loaderText = loader.querySelector(".loader-text");
      const messages = cfg.loadingMessages || ["Preparing your surprise..."];
      let msgIndex = 0;

      if (loaderText) loaderText.textContent = messages[0];

      const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        if (!loaderText) return;
        if (hasGsap()) {
          gsap.to(loaderText, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              loaderText.textContent = messages[msgIndex];
              gsap.to(loaderText, { opacity: 1, duration: 0.3 });
            },
          });
        } else {
          loaderText.textContent = messages[msgIndex];
        }
      }, 600);

      const complete = () => {
        clearInterval(msgInterval);
        if (loaderText) loaderText.textContent = messages[messages.length - 1];
        if (hasGsap()) {
          gsap.to(loader, {
            opacity: 0,
            duration: 0.8,
            delay: 0.3,
            onComplete: () => finishLoader(resolve),
          });
        } else {
          setTimeout(() => finishLoader(resolve), 400);
        }
      };

      if (hasGsap()) {
        const progress = loader.querySelector(".loader-progress");
        gsap.to(progress, {
          width: "100%",
          duration: 2.5,
          ease: "power2.inOut",
          onComplete: complete,
        });
      } else {
        setTimeout(complete, 2800);
      }
    });
  }

  // ═══════════════════════════════════════
  //  LENIS SMOOTH SCROLL
  // ═══════════════════════════════════════
  function initLenis() {
    if (!hasLenis()) return;

    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    if (hasGsap() && hasScrollTrigger()) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // ═══════════════════════════════════════
  //  BALLOONS
  // ═══════════════════════════════════════
  function initBalloons() {
    const container = document.getElementById("balloons");
    const colors = [cfg.colors.primary, cfg.colors.secondary, cfg.colors.accent, "#6bcbff", "#ff8fab"];

    for (let i = 0; i < 12; i++) {
      const balloon = document.createElement("div");
      balloon.className = "balloon";
      const size = 30 + Math.random() * 30;
      balloon.style.cssText = `
        width: ${size}px;
        height: ${size * 1.2}px;
        left: ${Math.random() * 100}%;
        background: ${colors[i % colors.length]};
        animation-duration: ${12 + Math.random() * 10}s;
        animation-delay: ${Math.random() * 15}s;
      `;
      container.appendChild(balloon);
    }
  }

  // ═══════════════════════════════════════
  //  LOTTIE ANIMATION
  // ═══════════════════════════════════════
  function initLottie() {
    if (typeof lottie === "undefined") return;

    lottie.loadAnimation({
      container: document.getElementById("lottie-welcome"),
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "https://assets2.lottiefiles.com/packages/lf20_aZTdD5.json",
    });

    gsap.to(".lottie-welcome", { opacity: 1, duration: 1, delay: 0.8 });
  }

  // ═══════════════════════════════════════
  //  WELCOME SCREEN
  // ═══════════════════════════════════════
  function initWelcome() {
    const title = cfg.welcomeTitle || `Happy Birthday, ${cfg.name}!`;
    const welcomeName = document.getElementById("welcome-name");
    welcomeName.textContent = title;
    if (cfg.welcomeTitle) welcomeName.classList.add("full-title");
    document.getElementById("welcome-subtitle").textContent =
      cfg.welcomeSubtitle || cfg.welcome?.subtitle || "";
    document.querySelector("#start-btn span").textContent =
      cfg.welcome?.buttonText || "Open Your Surprise ✨";
    document.getElementById("finale-title").textContent =
      cfg.finale?.title || `Happy Birthday, ${cfg.name}!`;

    const finaleMsg = document.getElementById("finale-message");
    if (finaleMsg && cfg.finale?.message) {
      finaleMsg.textContent = cfg.finale.message;
    }

    if (cfg.galleryTitle) {
      const galleryTitle = document.getElementById("gallery-title");
      if (galleryTitle) galleryTitle.textContent = cfg.galleryTitle;
    }

    if (cfg.cake?.message) {
      const cakeSubtitle = document.getElementById("cake-subtitle");
      if (cakeSubtitle) cakeSubtitle.textContent = cfg.cake.message;
    }

    if (cfg.gift?.buttonText) {
      const giftSubtitle = document.getElementById("gift-subtitle");
      if (giftSubtitle) giftSubtitle.textContent = cfg.gift.buttonText;
    }

    if (cfg.letterButton) {
      const letterBtnText = document.getElementById("letter-btn-text");
      if (letterBtnText) letterBtnText.textContent = cfg.letterButton;
    }

    if (cfg.welcomePhoto) {
      const wrap = document.getElementById("welcome-photo-wrap");
      const img = document.getElementById("welcome-photo");
      if (wrap && img) {
        img.src = cfg.welcomePhoto;
        img.alt = cfg.name;
        wrap.classList.add("visible");
      }
      document.getElementById("lottie-welcome")?.classList.add("hidden");
    } else {
      document.getElementById("welcome-photo-wrap")?.classList.add("hidden");
    }

    // Sparkles
    const sparklesContainer = document.querySelector(".welcome-sparkles");
    for (let i = 0; i < 20; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      s.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 3}s;
      `;
      sparklesContainer.appendChild(s);
    }

    const tl = hasGsap()
      ? gsap.timeline({ defaults: { ease: "power3.out" } })
      : null;

    if (tl) {
      gsap.set(
        [".welcome-eyebrow", ".welcome-name", ".welcome-subtitle", "#start-btn"],
        { y: 30 }
      );
      gsap.set(".welcome-photo-wrap", { scale: 0.85, opacity: 0 });

      tl.to(".welcome-eyebrow", { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
        .to(".welcome-name", { opacity: 1, y: 0, duration: 1 }, "-=0.4")
        .to(".welcome-subtitle", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(".welcome-photo-wrap", { opacity: 1, scale: 1, duration: 0.9 }, "-=0.5")
        .to("#start-btn", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(".scroll-hint", { opacity: 1, duration: 0.8 }, "-=0.3");
    } else {
      revealWelcome();
    }

    document.getElementById("start-btn").addEventListener("click", startExperience);
  }

  function startExperience() {
    if (siteStarted) return;
    siteStarted = true;

    confettiBurst();
    playMusic();

    if (hasGsap()) {
      gsap.to("#welcome .section-content", {
        scale: 0.95,
        opacity: 0.5,
        duration: 0.6,
      });
    }

    scrollToSection("#countdown");
  }

  function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(selector, { duration: 2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  // ═══════════════════════════════════════
  //  COUNTDOWN
  // ═══════════════════════════════════════
  function initCountdown() {
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minutesEl = document.getElementById("cd-minutes");
    const secondsEl = document.getElementById("cd-seconds");
    const messageEl = document.getElementById("countdown-message");

    function update() {
      const now = new Date();
      const target = new Date(cfg.birthdayDate + "T00:00:00");
      const diff = target - now;

      if (diff <= 0) {
        daysEl.textContent = "🎉";
        hoursEl.textContent = "🎂";
        minutesEl.textContent = "🎈";
        secondsEl.textContent = "🎁";
        messageEl.textContent = `It's ${cfg.name}'s Birthday! Let's celebrate! 🥳`;
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      daysEl.textContent = String(days).padStart(2, "0");
      hoursEl.textContent = String(hours).padStart(2, "0");
      minutesEl.textContent = String(minutes).padStart(2, "0");
      secondsEl.textContent = String(seconds).padStart(2, "0");
      messageEl.textContent = `${days} days until ${cfg.name} turns ${cfg.age}!`;
    }

    update();
    setInterval(update, 1000);
  }

  // ═══════════════════════════════════════
  //  BIRTHDAY CAKE
  // ═══════════════════════════════════════
  function initCake() {
    const candlesContainer = document.getElementById("cake-candles");
    const count = cfg.cake.candleCount;

    for (let i = 0; i < count; i++) {
      const candle = document.createElement("div");
      candle.className = "candle";
      candle.innerHTML = `
        <div class="candle-flame" data-index="${i}"></div>
        <div class="candle-stick"></div>
      `;
      candle.addEventListener("click", () => blowCandle(i));
      candlesContainer.appendChild(candle);
    }

    document.getElementById("blow-btn").addEventListener("click", toggleMicrophone);

    if (hasGsap() && hasScrollTrigger()) {
      gsap.from("#birthday-cake", {
        scrollTrigger: {
          trigger: "#cake",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
      });
    }
  }

  function blowCandle(index) {
    const flame = document.querySelector(`.candle-flame[data-index="${index}"]`);
    if (!flame || flame.classList.contains("out")) return;

    flame.classList.add("out");

    if (hasConfetti()) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: [cfg.colors.primary, cfg.colors.accent, cfg.colors.secondary],
      });
    }

    checkAllCandlesOut();
  }

  function checkAllCandlesOut() {
    const flames = document.querySelectorAll(".candle-flame");
    const allOut = [...flames].every((f) => f.classList.contains("out"));

    if (allOut) {
      const wishEl = document.getElementById("wish-made");
      wishEl.classList.remove("hidden");
      wishEl.querySelector("p").textContent = "✨ Your wish has been made! ✨";
      confettiBurst();

      if (hasGsap()) {
        gsap.from("#wish-made", {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: "back.out(2)",
        });
      }
    }
  }

  async function toggleMicrophone() {
    const btn = document.getElementById("blow-btn");
    const hint = document.getElementById("cake-hint");

    if (blowInterval) {
      stopMicrophone();
      btn.classList.remove("active");
      hint.textContent = "Tap candles or use your microphone";
      return;
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(micStream);
      source.connect(analyser);
      analyser.fftSize = 256;

      btn.classList.add("active");
      hint.textContent = "Blow into your microphone! 🎤";

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      blowInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = avg / 255;

        if (normalized > cfg.cake.blowSensitivity) {
          const flames = document.querySelectorAll(".candle-flame:not(.out)");
          flames.forEach((flame) => {
            const idx = parseInt(flame.dataset.index, 10);
            blowCandle(idx);
          });
        }
      }, 100);
    } catch {
      hint.textContent = "Microphone access denied — tap candles instead!";
      btn.classList.remove("active");
    }
  }

  function stopMicrophone() {
    if (blowInterval) {
      clearInterval(blowInterval);
      blowInterval = null;
    }
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  // ═══════════════════════════════════════
  //  TYPED WISHES
  // ═══════════════════════════════════════
  function initWishes() {
    const dotsContainer = document.getElementById("wishes-dots");

    cfg.wishes.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "wish-dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => goToWish(i));
      dotsContainer.appendChild(dot);
    });

    startTyped(cfg.wishes[0]);

    if (hasGsap() && hasScrollTrigger()) {
      ScrollTrigger.create({
        trigger: "#wishes",
        start: "top 60%",
        onEnter: () => {
          if (typedInstance && typedInstance.reset) typedInstance.reset();
        },
      });
    }
  }

  function startTyped(text) {
    const el = document.getElementById("typed-text");
    if (!el) return;

    if (typedInstance && typedInstance.destroy) typedInstance.destroy();

    if (hasTyped()) {
      typedInstance = new Typed("#typed-text", {
        strings: [text],
        typeSpeed: 40,
        backSpeed: 20,
        showCursor: true,
        cursorChar: "|",
      });
    } else {
      el.textContent = text;
    }
  }

  function goToWish(index) {
    wishIndex = index;
    document.querySelectorAll(".wish-dot").forEach((d, i) => {
      d.classList.toggle("active", i === index);
    });
    startTyped(cfg.wishes[index]);
  }

  // Auto-cycle wishes
  setInterval(() => {
    const wishesEl = document.getElementById("wishes");
    const rect = wishesEl.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      wishIndex = (wishIndex + 1) % cfg.wishes.length;
      goToWish(wishIndex);
    }
  }, 6000);

  // ═══════════════════════════════════════
  //  QUOTES
  // ═══════════════════════════════════════
  let quoteIndex = 0;

  function initQuotes() {
    if (!cfg.quotes || !cfg.quotes.length) {
      document.getElementById("quotes")?.classList.add("hidden");
      return;
    }

    const dotsContainer = document.getElementById("quotes-dots");
    const quoteText = document.getElementById("quote-text");

    cfg.quotes.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "quote-dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => goToQuote(i));
      dotsContainer.appendChild(dot);
    });

    quoteText.textContent = cfg.quotes[0];

    if (hasGsap() && hasScrollTrigger()) {
      gsap.from(".quote-card", {
        scrollTrigger: { trigger: "#quotes", start: "top 70%" },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }

    setInterval(() => {
      const rect = document.getElementById("quotes").getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        quoteIndex = (quoteIndex + 1) % cfg.quotes.length;
        goToQuote(quoteIndex);
      }
    }, 5000);
  }

  function goToQuote(index) {
    quoteIndex = index;
    const quoteText = document.getElementById("quote-text");

    if (hasGsap()) {
      gsap.to(quoteText, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          quoteText.textContent = cfg.quotes[index];
          gsap.to(quoteText, { opacity: 1, y: 0, duration: 0.3 });
        },
      });
    } else {
      quoteText.textContent = cfg.quotes[index];
    }

    document.querySelectorAll(".quote-dot").forEach((d, i) => {
      d.classList.toggle("active", i === index);
    });
  }

  // ═══════════════════════════════════════
  //  PHOTO GALLERY
  // ═══════════════════════════════════════
  function initGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;

    const existingItems = grid.querySelectorAll(".gallery-item");

    if (existingItems.length === 0 && cfg.photos) {
      cfg.photos.forEach((photo, i) => {
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.dataset.src = photo.src;
        item.dataset.caption = photo.caption;

        const img = document.createElement("img");
        img.src = photo.src;
        img.alt = photo.caption;
        img.loading = "lazy";

        const caption = document.createElement("div");
        caption.className = "gallery-caption";
        caption.textContent = photo.caption;

        item.appendChild(img);
        item.appendChild(caption);
        grid.appendChild(item);
      });
    }

    grid.querySelectorAll(".gallery-item").forEach((item) => {
      const src = item.dataset.src || item.querySelector("img")?.src || "";
      const caption =
        item.dataset.caption ||
        item.querySelector(".gallery-caption")?.textContent ||
        "";
      item.addEventListener("click", () => openLightbox(src, caption));
    });

    document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);
    document.getElementById("lightbox")?.addEventListener("click", (e) => {
      if (e.target.id === "lightbox") closeLightbox();
    });

    if (hasGsap() && hasScrollTrigger()) {
      gsap.from(".gallery-item", {
        scrollTrigger: {
          trigger: "#gallery",
          start: "top 70%",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }
  }

  function openLightbox(src, caption) {
    const lightbox = document.getElementById("lightbox");
    document.getElementById("lightbox-img").src = src;
    document.getElementById("lightbox-img").alt = caption;
    document.getElementById("lightbox-caption").textContent = caption;
    lightbox.classList.remove("hidden");
    if (lenis) lenis.stop();
  }

  function closeLightbox() {
    document.getElementById("lightbox").classList.add("hidden");
    if (lenis) lenis.start();
  }

  // ═══════════════════════════════════════
  //  MEMORY TIMELINE
  // ═══════════════════════════════════════
  function initTimeline() {
    const container = document.getElementById("timeline-container");
    const items = cfg.timeline || cfg.memories || [];

    items.forEach((mem, i) => {
      const item = document.createElement("div");
      item.className = "timeline-item";
      const step = String(i + 1).padStart(2, "0");
      const desc = mem.message || mem.description || "";
      item.innerHTML = `
        <div class="timeline-year">${mem.year || step}</div>
        <div class="timeline-title">${mem.title}</div>
        <div class="timeline-desc">${desc}</div>
      `;
      container.appendChild(item);
    });

    if (hasGsap() && hasScrollTrigger()) {
      gsap.to(".timeline-item", {
        scrollTrigger: {
          trigger: "#timeline",
          start: "top 70%",
        },
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    } else {
      document.querySelectorAll(".timeline-item").forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
    }
  }

  // ═══════════════════════════════════════
  //  LETTER
  // ═══════════════════════════════════════
  function initLetter() {
    const modal = document.getElementById("letter-modal");
    const letterBtn = document.getElementById("letter-btn");

    if (!cfg.letter || !letterBtn) return;

    letterBtn.addEventListener("click", () => {
      document.getElementById("letter-modal-title").textContent = `Dear ${cfg.name} 💌`;
      document.getElementById("letter-modal-body").textContent = cfg.letter;
      modal.classList.remove("hidden");

      if (hasConfetti()) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
          colors: [cfg.colors.primary, cfg.colors.accent],
        });
      }

      if (lenis) lenis.stop();
    });

    document.getElementById("letter-close").addEventListener("click", closeLetter);
    modal.querySelector(".letter-modal-backdrop").addEventListener("click", closeLetter);

    if (hasGsap() && hasScrollTrigger()) {
      gsap.from("#letter-btn", {
        scrollTrigger: { trigger: "#letters", start: "top 70%" },
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      });
    }
  }

  function closeLetter() {
    document.getElementById("letter-modal").classList.add("hidden");
    if (lenis) lenis.start();
  }

  // ═══════════════════════════════════════
  //  GIFT BOX
  // ═══════════════════════════════════════
  function initGift() {
    const box = document.getElementById("gift-box");
    document.getElementById("gift-emoji").textContent = cfg.gift.emoji;
    document.getElementById("gift-message").textContent = cfg.gift.message;

    let opened = false;
    box.addEventListener("click", () => {
      if (opened) return;
      opened = true;

      box.classList.add("opened");
      const surprise = document.getElementById("gift-surprise");
      surprise.classList.remove("hidden");
      surprise.classList.add("visible");

      confettiBurst();
      setTimeout(confettiBurst, 500);
    });

    if (hasGsap() && hasScrollTrigger()) {
      gsap.from(".gift-box", {
        scrollTrigger: {
          trigger: "#gift",
          start: "top 70%",
        },
        scale: 0,
        rotation: -10,
        duration: 1,
        ease: "back.out(2)",
      });
    }
  }

  // ═══════════════════════════════════════
  //  FIREWORKS FINALE
  // ═══════════════════════════════════════
  function initFireworks() {
    const canvas = document.getElementById("fireworks-canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let fireworksStarted = false;

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = 0.008 + Math.random() * 0.012;
        this.size = 2 + Math.random() * 3;
      }

      update() {
        this.x += this.vx;
        this.vy += 0.05;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function createFirework() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const x = Math.random() * w;
      const y = Math.random() * h * 0.6;
      const colors = [cfg.colors.primary, cfg.colors.secondary, cfg.colors.accent, "#fff", "#6bcbff"];

      for (let i = 0; i < 60; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
      }
    }

    function animate() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      particles = particles.filter((p) => p.alpha > 0);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      fireworksAnimId = requestAnimationFrame(animate);
    }

    if (hasGsap() && hasScrollTrigger()) {
      ScrollTrigger.create({
        trigger: "#finale",
        start: "top 60%",
        onEnter: () => {
          if (fireworksStarted) return;
          fireworksStarted = true;
          animate();

          const fireworkInterval = setInterval(createFirework, 800);
          setTimeout(() => clearInterval(fireworkInterval), 15000);

          confettiBurst();
          setTimeout(confettiBurst, 1000);
          setTimeout(confettiBurst, 2000);

          gsap.from(".finale-title", {
            scale: 0.5,
            opacity: 0,
            duration: 1,
            ease: "back.out(1.7)",
          });
          gsap.from("#finale-message, #replay-btn", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            delay: 0.5,
          });
        },
      });
    } else {
      const finale = document.getElementById("finale");
      if (finale && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !fireworksStarted) {
                fireworksStarted = true;
                animate();
                confettiBurst();
                observer.disconnect();
              }
            });
          },
          { threshold: 0.3 }
        );
        observer.observe(finale);
      }
    }

    document.getElementById("replay-btn").addEventListener("click", () => {
      scrollToSection("#welcome");
      siteStarted = false;
      if (hasGsap()) {
        gsap.to("#welcome .section-content", { scale: 1, opacity: 1, duration: 0.6 });
      }

      document.querySelectorAll(".candle-flame").forEach((f) => f.classList.remove("out"));
      document.getElementById("wish-made").classList.add("hidden");

      const giftBox = document.getElementById("gift-box");
      giftBox.classList.remove("opened");
      const surprise = document.getElementById("gift-surprise");
      surprise.classList.add("hidden");
      surprise.classList.remove("visible");
    });
  }

  // ═══════════════════════════════════════
  //  CONFETTI
  // ═══════════════════════════════════════
  function confettiBurst() {
    if (!hasConfetti()) return;

    const colors = [cfg.colors.primary, cfg.colors.secondary, cfg.colors.accent, "#fff"];

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.2, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.8, y: 0.5 },
        colors,
      });
    }, 200);
  }

  // ═══════════════════════════════════════
  //  MUSIC
  // ═══════════════════════════════════════
  function initMusic() {
    if (!cfg.music.enabled) return;

    const audio = document.getElementById("bg-music");
    audio.src = cfg.music.src;
    audio.volume = cfg.music.volume;

    audio.onerror = () => {
      document.getElementById("music-toggle").style.display = "none";
    };

    const toggle = document.getElementById("music-toggle");
    toggle.addEventListener("click", () => {
      if (musicPlaying) {
        audio.pause();
        toggle.classList.remove("playing");
        musicPlaying = false;
      } else {
        audio.play().catch(() => {});
        toggle.classList.add("playing");
        musicPlaying = true;
      }
    });
  }

  function playMusic() {
    if (!cfg.music.enabled) return;

    const audio = document.getElementById("bg-music");
    const toggle = document.getElementById("music-toggle");

    toggle.classList.add("visible");

    if (cfg.music.message) {
      toggle.title = cfg.music.message;
    }

    audio.play()
      .then(() => {
        musicPlaying = true;
        toggle.classList.add("playing");
        showToast(cfg.music.message);
      })
      .catch(() => {
        toggle.classList.add("visible");
      });
  }

  function showToast(message) {
    if (!message) return;
    const toast = document.createElement("div");
    toast.className = "music-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    gsap.fromTo(
      toast,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, onComplete: () => {
        setTimeout(() => {
          gsap.to(toast, {
            opacity: 0,
            y: -10,
            duration: 0.5,
            onComplete: () => toast.remove(),
          });
        }, 3000);
      }}
    );
  }

  // ═══════════════════════════════════════
  //  SCROLL ANIMATIONS
  // ═══════════════════════════════════════
  function initScrollAnimations() {
    if (!hasGsap() || !hasScrollTrigger()) return;

    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    gsap.utils.toArray(".section-subtitle").forEach((sub) => {
      gsap.from(sub, {
        scrollTrigger: {
          trigger: sub,
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: "power3.out",
      });
    });
  }

  // ═══════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════
  async function init() {
    try {
      applyTheme();

      if (hasGsap() && hasScrollTrigger()) {
        gsap.registerPlugin(ScrollTrigger);
      }

      await initLoader();

      initLenis();
      initBalloons();
      initLottie();
      initWelcome();
      initCountdown();
      initCake();
      initWishes();
      initQuotes();
      initGallery();
      initTimeline();
      initLetter();
      initGift();
      initFireworks();
      initMusic();
      initScrollAnimations();
    } catch (err) {
      console.error("Birthday site init error:", err);
      document.getElementById("loader")?.classList.add("fade-out");
      document.getElementById("main-content")?.classList.remove("hidden");
      revealWelcome();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
