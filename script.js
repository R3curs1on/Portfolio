const roleLines = Array.from(document.querySelectorAll(".role-line"));
let activeRoleIndex = 0;

function rotateRoles() {
  roleLines.forEach((line, index) => {
    line.classList.toggle("is-active", index === activeRoleIndex);
  });
  activeRoleIndex = (activeRoleIndex + 1) % roleLines.length;
}

if (roleLines.length > 0) {
  rotateRoles();
  setInterval(rotateRoles, 2200);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const animatedCounters = new WeakSet();

function animateCounter(counter) {
  if (animatedCounters.has(counter)) {
    return;
  }

  animatedCounters.add(counter);
  const target = Number(counter.dataset.target || 0);
  const suffix = counter.dataset.suffix || "";
  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * eased);
    counter.textContent = `${currentValue}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.55 }
);

document.querySelectorAll(".counter").forEach((counter) => {
  counterObserver.observe(counter);
});

const nav = document.querySelector(".site-nav");

function syncNavState() {
  nav.classList.toggle("is-condensed", window.scrollY > 24);
}

window.addEventListener("scroll", syncNavState, { passive: true });
syncNavState();

const resumeModal = document.getElementById("resume-modal");
const resumeFrame = document.getElementById("resume-frame");
const resumeOpeners = [
  document.getElementById("resume-trigger"),
  document.getElementById("resume-btn-hero"),
];
const resumeCloser = document.getElementById("resume-close");
const resumeUrl = "https://drive.google.com/file/d/1QJ4c0infaUUM0z5TrzqFDT2mMS3Vjoch/preview";

function openResume() {
  resumeFrame.src = resumeUrl;
  resumeModal.classList.add("is-open");
  resumeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeResume() {
  resumeFrame.src = "";
  resumeModal.classList.remove("is-open");
  resumeModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

resumeOpeners.forEach((button) => {
  if (!button) {
    return;
  }
  button.addEventListener("click", openResume);
});

if (resumeCloser) {
  resumeCloser.addEventListener("click", closeResume);
}

if (resumeModal) {
  resumeModal.addEventListener("click", (event) => {
    if (event.target === resumeModal) {
      closeResume();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && resumeModal.classList.contains("is-open")) {
    closeResume();
  }
});

const heroCanvas = document.getElementById("heroCanvas");
const heroSection = document.getElementById("hero");
const heroContext = heroCanvas.getContext("2d");
let particles = [];
let heroWidth = 0;
let heroHeight = 0;
const pointer = { x: null, y: null };

function buildParticles() {
  const count = Math.max(28, Math.floor(heroWidth / 58));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * heroWidth,
    y: Math.random() * heroHeight,
    velocityX: (Math.random() - 0.5) * 0.34,
    velocityY: (Math.random() - 0.5) * 0.34,
  }));
}

function resizeHeroCanvas() {
  const bounds = heroSection.getBoundingClientRect();
  heroWidth = bounds.width;
  heroHeight = bounds.height;
  heroCanvas.width = heroWidth * window.devicePixelRatio;
  heroCanvas.height = heroHeight * window.devicePixelRatio;
  heroCanvas.style.width = `${heroWidth}px`;
  heroCanvas.style.height = `${heroHeight}px`;
  heroContext.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  buildParticles();
}

function drawHeroBackground() {
  heroContext.clearRect(0, 0, heroWidth, heroHeight);

  particles.forEach((particle) => {
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;

    if (particle.x <= 0 || particle.x >= heroWidth) {
      particle.velocityX *= -1;
    }

    if (particle.y <= 0 || particle.y >= heroHeight) {
      particle.velocityY *= -1;
    }
  });

  for (let index = 0; index < particles.length; index += 1) {
    const current = particles[index];

    for (let inner = index + 1; inner < particles.length; inner += 1) {
      const target = particles[inner];
      const dx = current.x - target.x;
      const dy = current.y - target.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 140) {
        continue;
      }

      const opacity = 1 - distance / 140;
      heroContext.strokeStyle = `rgba(245, 245, 245, ${opacity * 0.08})`;
      heroContext.lineWidth = 1;
      heroContext.beginPath();
      heroContext.moveTo(current.x, current.y);
      heroContext.lineTo(target.x, target.y);
      heroContext.stroke();
    }

    if (pointer.x !== null) {
      const pointerDistance = Math.hypot(current.x - pointer.x, current.y - pointer.y);
      if (pointerDistance < 170) {
        const pointerOpacity = 1 - pointerDistance / 170;
        heroContext.strokeStyle = `rgba(0, 255, 136, ${pointerOpacity * 0.28})`;
        heroContext.beginPath();
        heroContext.moveTo(current.x, current.y);
        heroContext.lineTo(pointer.x, pointer.y);
        heroContext.stroke();
      }
    }

    heroContext.fillStyle = "rgba(245, 245, 245, 0.55)";
    heroContext.beginPath();
    heroContext.arc(current.x, current.y, 1.6, 0, Math.PI * 2);
    heroContext.fill();
  }

  requestAnimationFrame(drawHeroBackground);
}

heroSection.addEventListener("pointermove", (event) => {
  const rect = heroSection.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
});

heroSection.addEventListener("pointerleave", () => {
  pointer.x = null;
  pointer.y = null;
});

window.addEventListener("resize", resizeHeroCanvas);
resizeHeroCanvas();
drawHeroBackground();
