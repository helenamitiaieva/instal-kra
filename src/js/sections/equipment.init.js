import { equipmentData } from "../backend/equipment.data.js";
import Splide from "@splidejs/splide";
import "@splidejs/splide/css";
import { Grid } from "@splidejs/splide-extension-grid";

function waitForElement(selector, cb) {
  const found = document.querySelector(selector);
  if (found) return cb(found);

  const obs = new MutationObserver(() => {
    const el = document.querySelector(selector);
    if (el) {
      obs.disconnect();
      cb(el);
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  setTimeout(() => {
    if (!document.querySelector(selector)) {
      console.warn("[equipment] still waiting for", selector);
    }
  }, 5000);
}

function createCard(card) {
  const li = document.createElement("li");
  li.className = "equipment-slide splide__slide";

  const art = document.createElement("article");
  art.className = "equipment-card";

  const logosWrap = document.createElement("div");
  logosWrap.className = "equipment-container-card-img";

  card.brands.forEach((b) => {
    const a = document.createElement("a");
    a.href = b.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "equipment-link-logo";

    const img = document.createElement("img");
    img.src = b.img;
    img.alt = b.alt || b.name || "";
    img.className = b.class || "equipment-logo";
    img.loading = "lazy";

    a.appendChild(img);
    logosWrap.appendChild(a);
  });

  const textWrap = document.createElement("div");
  textWrap.className = "equipment-container-carusel-text";

  const h3 = document.createElement("h3");
  h3.className = "equipment-card-title";
  h3.textContent = card.title;

  textWrap.appendChild(h3);
  art.appendChild(logosWrap);
  art.appendChild(textWrap);
  li.appendChild(art);
  return li;
}

function renderEquipment(track, data = equipmentData) {
  console.log("[equipment] rendering", data.length, "cards");

  const list = [...data];

  if (list.length % 2 !== 0) {
    list.push(list[0]);
  }

  const frag = document.createDocumentFragment();
  list.forEach((card) => frag.appendChild(createCard(card)));

  track.innerHTML = "";
  track.appendChild(frag);
}

function pickCols(n) {
  if (n <= 2) return 2;
  if (n === 3) return 2;
  if (n === 4) return 2;
  if (n === 5 || n === 6) return 3;
  if (n <= 9) return 3;
  if (n <= 12) return 4;
  return 5;
}

function fitLogosContainer(wrap) {
  const items = wrap.querySelectorAll(".equipment-link-logo");
  const n = items.length;
  if (!n) return;

  const cols = pickCols(n);
  wrap.style.setProperty("--cols", cols);

  const cs = getComputedStyle(wrap);
  const gapFromCss = parseFloat(cs.getPropertyValue("--gap")) || 8;
  let gap = gapFromCss;

  wrap.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  const rows = Math.ceil(n / cols);

  let H = wrap.clientHeight || wrap.getBoundingClientRect().height;

  if (!H || H < 40) {
    const card = wrap.closest(".equipment-card");
    const title = card?.querySelector(".equipment-container-carusel-text");
    const cardH = card?.getBoundingClientRect().height || 0;
    const titleH = title?.getBoundingClientRect().height || 0;
    H = Math.max(120, cardH - titleH - 6);
  }

  wrap.style.setProperty("--gap", "8px");

  let cellH = (H - (rows - 1) * gap) / rows;
  if (!isFinite(cellH) || cellH < 20) cellH = 20;

  cellH *= 0.85;

  wrap.style.setProperty("--cell-h", Math.round(cellH) + "px");

  const w = window.innerWidth;
  if (w >= 1024 && w <= 1439) {
    cellH = 85;
  }
  if (w >= 1440 && w <= 1919) {
    cellH = 80;
  }
  if (w >= 1920) {
    cellH = 70;
  }

  wrap.style.setProperty("--cell-h", Math.round(cellH) + "px");
}

function centerTail(wrap, cols, n) {
  wrap.querySelectorAll(".equipment-link-logo").forEach((el) => {
    el.style.gridColumn = "";
    el.style.justifySelf = "";
  });

  const rows = Math.ceil(n / cols);
  const lastRowCount = n - (rows - 1) * cols || cols;
  wrap.dataset.lastRow = String(lastRowCount);

  if (lastRowCount === cols) return;

  if (lastRowCount === 1) {
    const middleCol = Math.ceil(cols / 2);
    const last = wrap.querySelector(".equipment-link-logo:last-child");
    if (last) {
      last.style.gridColumn = String(middleCol);
      last.style.justifySelf = "center";
    }
    return;
  }

  if (lastRowCount === 2) {
    const start = Math.ceil((cols - 2) / 2) + 1;
    const secondLast = wrap.querySelector(
      ".equipment-link-logo:nth-last-child(2)"
    );
    const last = wrap.querySelector(".equipment-link-logo:last-child");
    if (secondLast) secondLast.style.gridColumn = String(start);
    if (last) last.style.gridColumn = String(start + 1);
  }
}

function fitAll() {
  document
    .querySelectorAll(".equipment-container-card-img")
    .forEach(fitLogosContainer);
}

function debounce(fn, ms = 80) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function watchImagesAndResize() {
  const imgs = document.querySelectorAll(".equipment-link-logo img");
  if (!imgs.length) return;

  const done = debounce(fitAll, 40);
  let pending = 0;

  imgs.forEach((img) => {
    if (img.complete) return;
    pending++;
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });

  if (pending === 0) fitAll();
}

window.addEventListener("load", fitAll);
window.addEventListener("resize", debounce(fitAll, 80));
document.addEventListener("splide:moved", fitAll);

document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#equipment-track", (track) => {
    console.log("[equipment] track found → rendering");
    renderEquipment(track);

    watchImagesAndResize();
    fitAll();

    const ro = new ResizeObserver(debounce(fitAll, 60));
    document
      .querySelectorAll(".equipment-container-card-img")
      .forEach((w) => ro.observe(w));

    const root = document.getElementById("equipment-splide");
    if (!root) return;

    const splide = new Splide("#equipment-splide", {
      type: "loop",
      perMove: 1,
      direction: "ltr",
      arrows: false,
      pagination: true,
      drag: true,
      speed: 400,
      trimSpace: false,
      clones: 6,
      rewind: false,
      autoWidth: false,
      grid: { rows: 1, cols: 2, gap: { row: "30px", col: "30px" } },
      breakpoints: {
        9999: {
          gap: "30px",
          grid: { rows: 1, cols: 2, gap: { row: "30px", col: "30px" } },
        },
        1919: {
          gap: "15px",
          grid: { rows: 1, cols: 2, gap: { row: "15px", col: "15px" } },
        },
        1439: {
          gap: "15px",
          grid: { rows: 2, cols: 1, gap: { row: "15px", col: "15px" } },
        },
        1023: {
          gap: "15px",
          grid: { rows: 2, cols: 1, gap: { row: "15px", col: "15px" } },
        },
        767: {
          gap: "10px",
          grid: { rows: 2, cols: 1, gap: { row: "10px", col: "10px" } },
        },
      },
    });

    splide.mount({ Grid });

    setTimeout(fitAll, 0);

    const prevBtn = document.getElementById("equipment-button-left");
    const nextBtn = document.getElementById("equipment-button-right");
    prevBtn?.addEventListener("click", () => splide.go("<"));
    nextBtn?.addEventListener("click", () => splide.go(">"));
  });
});
