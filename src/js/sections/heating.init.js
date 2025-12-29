import { heatingData } from "../backend/heating.data.js";
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
      console.warn("[heating] still waiting for", selector);
    }
  }, 5000);
}

function createCard(card) {
  const li = document.createElement("li");
  li.className = "heating-slide splide__slide";

  const art = document.createElement("article");
  art.className = "heating-card";

  const logosWrap = document.createElement("div");
  logosWrap.className = "heating-container-card-img";

  card.brands.forEach((b) => {
    const a = document.createElement("a");
    a.href = b.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "heating-link-logo";

    const img = document.createElement("img");
    img.src = b.img;
    img.alt = b.alt || b.name || "";
    img.className = b.class || "heating-logo";
    img.loading = "lazy";

    a.appendChild(img);
    logosWrap.appendChild(a);
  });

  const textWrap = document.createElement("div");
  textWrap.className = "heating-container-carusel-text";

  const h3 = document.createElement("h3");
  h3.className = "heating-card-title";
  h3.textContent = card.title;

  textWrap.appendChild(h3);
  art.appendChild(logosWrap);
  art.appendChild(textWrap);
  li.appendChild(art);
  return li;
}

function padToMultiple(data, perPage) {
  const list = [...data];
  if (!perPage || perPage < 2) return list;

  const rest = list.length % perPage;
  if (rest === 0) return list;

  const need = perPage - rest;

  for (let i = 0; i < need; i++) {
    list.push(list[i % list.length]);
  }

  return list;
}

function renderHeating(track, data = heatingData) {
  const list = padToMultiple(data, 4);

  const frag = document.createDocumentFragment();
  list.forEach((card) => frag.appendChild(createCard(card)));

  track.innerHTML = "";
  track.appendChild(frag);
}

function pickCols(n) {
  if (n <= 2) return 1;
  if (n === 3 || n === 4) return 2;
  if (n <= 6) return 3;
  if (n <= 9) return 3;
  if (n <= 12) return 4;
  return 5;
}

function fitLogosContainer(wrap) {
  const items = wrap.querySelectorAll(".heating-link-logo");
  const n = items.length;
  if (!n) return;

  const cols = pickCols(n);
  wrap.style.setProperty("--cols", cols);

  if (window.innerWidth < 768) {
    wrap.style.setProperty("--gap", "0px");
  } else if (window.innerWidth < 1440) {
    wrap.style.setProperty("--gap", "8px");
  } else {
    wrap.style.setProperty("--gap", "10px");
  }

  wrap.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  const rows = Math.ceil(n / cols);

  let H = wrap.clientHeight || wrap.getBoundingClientRect().height;
  if (!H || H < 40) {
    const card = wrap.closest(".heating-card");
    const title = card?.querySelector(".heating-container-carusel-text");
    const cardH = card?.getBoundingClientRect().height || 0;
    const titleH = title?.getBoundingClientRect().height || 0;
    H = Math.max(120, cardH - titleH - 6);
  }

  const gap = parseFloat(getComputedStyle(wrap).getPropertyValue("--gap")) || 8;

  let cellH = (H - (rows - 1) * gap) / rows;
  if (!isFinite(cellH) || cellH < 20) cellH = 20;

  cellH *= 0.85;

  const w = window.innerWidth;
  if (w <= 767) cellH = 35;
  else if (w <= 1023) cellH = 60;
  else if (w <= 1439) cellH = 80;
  else if (w <= 1919) cellH = 80;
  else cellH = 70;

  if (window.innerWidth < 768) {
    wrap.style.setProperty("--gap", "0px");
  } else if (window.innerWidth < 1440) {
    wrap.style.setProperty("--gap", "0px");
  } else {
    wrap.style.setProperty("--gap", "0px");
  }

  wrap.style.setProperty("--cell-h", Math.round(cellH) + "px");
}

function fitAll() {
  document
    .querySelectorAll(".heating-container-card-img")
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
  const imgs = document.querySelectorAll(".heating-link-logo img");
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

function setupTailAutoHeight(root, splide, section = "heating") {
  const track = root.querySelector(".splide__track");
  const list = root.querySelector(".splide__list");
  const cardSel = `.${section}-card`;

  track.style.transition = "height .28s ease";

  const getGrid = () => {
    const g = splide.options.grid || { rows: 1, cols: 1 };
    return { rows: g.rows || 1, cols: g.cols || 1 };
  };

  const clearInline = () => {
    track.style.height = "";
    list.style.alignContent = "";
    list.style.justifyItems = "";
    list.style.placeItems = "";
    list.style.justifyContent = "";
    list.style.columnGap = "";
  };

  const getRealSlidesCount = () => {
    const el = splide?.Components?.Elements;
    if (el?.slides?.length) return el.slides.length;
    return root.querySelectorAll(
      `li.${section}-slide.splide__slide:not(.is-clone)`
    ).length;
  };

  let baseHeight = 0;
  let halfHeight = 0;

  function measureHeights() {
    const card = root.querySelector(cardSel);
    if (!card) return;

    const cardH = Math.round(card.getBoundingClientRect().height);
    const { rows, cols } = getGrid();

    if (rows === 2 && cols === 1) {
      const csList = getComputedStyle(list);
      const rowGap = parseFloat(csList.rowGap || csList.gap || "15") || 15;
      baseHeight = cardH * 2 + rowGap;
      halfHeight = cardH;
    } else {
      baseHeight = cardH;
      halfHeight = cardH;
    }

    if (!track.style.height && rows === 2 && cols === 1) {
      track.style.height = baseHeight + "px";
    }
  }

  function isTailView() {
    const total = getRealSlidesCount();
    const { rows, cols } = getGrid();
    const perPage = rows * cols;

    if (perPage <= 1) return false;
    if (total % perPage !== 1) return false;

    return splide.index === total - 1;
  }

  function applyTailMode(on) {
    const { rows, cols } = getGrid();

    if (!(rows === 2 && cols === 1)) {
      clearInline();
      return;
    }

    if (on) {
      track.style.height = halfHeight + "px";
      list.style.alignContent = "center";
      list.style.justifyItems = "center";
      list.style.placeItems = "center";
    } else {
      track.style.height = baseHeight + "px";
      list.style.alignContent = "";
      list.style.justifyItems = "";
      list.style.placeItems = "";
    }
  }

  measureHeights();

  splide.off("mounted moved resized");
  splide.on("mounted moved resized", () => {
    measureHeights();
    applyTailMode(isTailView());
  });

  setTimeout(() => {
    measureHeights();
    applyTailMode(isTailView());
  }, 0);
}

window.addEventListener("load", fitAll);
window.addEventListener("resize", debounce(fitAll, 80));
document.addEventListener("splide:moved", fitAll);

document.addEventListener("DOMContentLoaded", () => {
  waitForElement("#heating-track", (track) => {
    renderHeating(track);

    watchImagesAndResize();
    fitAll();

    const ro = new ResizeObserver(debounce(fitAll, 60));
    document
      .querySelectorAll(".heating-container-card-img")
      .forEach((w) => ro.observe(w));

    const root = document.getElementById("heating-splide");
    if (!root) return;

    const splide = new Splide("#heating-splide", {
      type: "loop",
      rewind: false,
      perMove: 1,
      direction: "ltr",
      arrows: false,
      pagination: true,
      drag: true,
      speed: 400,

      height: 622,
      fixedWidth: 790,
      grid: { rows: 2, cols: 2, gap: { row: "30px", col: "30px" } },
      breakpoints: {
        9999: {
          gap: "30px",
          grid: { rows: 2, cols: 2, gap: { row: "30px", col: "30px" } },
        },
        1919: {
          height: "auto",
          fixedWidth: "100%",
          gap: "0px",
          grid: { rows: 2, cols: 2, gap: { row: "2px", col: "2px" } },
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

    setupTailAutoHeight(root, splide, "heating");

    setTimeout(fitAll, 0);

    const prevBtn = document.getElementById("heating-button-left");
    const nextBtn = document.getElementById("heating-button-right");
    prevBtn?.addEventListener("click", () => splide.go("<"));
    nextBtn?.addEventListener("click", () => splide.go(">"));
  });
});
