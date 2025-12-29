function debounce(fn, ms = 120) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

let io = null;

function shouldSkip(el) {
  if (el.closest(".splide")) return true;

  const tag = el.tagName;
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return true;

  return false;
}

function markRevealElements(root = document) {
  const selectors = [
    "h1",
    "h2",
    "h3",
    "h4",
    "svg",
    "p",
    "a",
    "button",
    "img",
    "li",
    "article",
    ".card",
    ".service-card",
    ".contact-block",
    ".about-item",
    ".heating-viewport",
  ];

  root.querySelectorAll(selectors.join(",")).forEach((el) => {
    if (shouldSkip(el)) return;

    if (!el.textContent.trim() && !el.querySelector("img,svg")) return;

    el.classList.add("reveal");
  });

  root.querySelectorAll(".splide, .splide *").forEach((el) => {
    el.classList.remove("reveal");
    el.classList.add("is-visible");
    el.style.transitionDelay = "";
  });
}

function initRevealOnScroll(root = document) {
  const items = root.querySelectorAll(".reveal");
  if (!items.length) return;

  if (io) io.disconnect();

  io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = Number(el.dataset.delay || 0);
        if (delay) el.style.transitionDelay = `${delay}ms`;

        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((el) => io.observe(el));
}

function boot() {
  markRevealElements(document);
  initRevealOnScroll(document);
}

document.addEventListener("DOMContentLoaded", () => {
  boot();

  const main = document.querySelector("main");
  if (!main) return;

  const mo = new MutationObserver(debounce(boot, 150));
  mo.observe(main, { childList: true, subtree: true });
});
