function initHeaderScroll(header) {
  let lastScroll = window.pageYOffset || 0;
  const threshold = 8;

  const onScroll = () => {
    const current = window.pageYOffset || 0;

    if (current <= 0) {
      header.classList.remove(
        "header-container--hidden",
        "header-container--visible"
      );
      lastScroll = current;
      return;
    }

    const diff = Math.abs(current - lastScroll);
    if (diff < threshold) return;

    if (current > lastScroll) {
      header.classList.add("header-container--hidden");
      header.classList.remove("header-container--visible");
    } else {
      header.classList.remove("header-container--hidden");
      header.classList.add("header-container--visible");
    }

    lastScroll = current;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  console.log("[header-scroll] initialized");
}

function waitFor(selector, cb) {
  const el = document.querySelector(selector);
  if (el) return cb(el);

  const obs = new MutationObserver(() => {
    const found = document.querySelector(selector);
    if (found) {
      obs.disconnect();
      cb(found);
    }
  });

  obs.observe(document.documentElement, { childList: true, subtree: true });
}

waitFor(".header-container", initHeaderScroll);
