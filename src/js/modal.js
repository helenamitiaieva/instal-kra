(function bootstrapModalInit() {
  const REQUIRED = [
    "#burgerMenu",
    "#mobileMenu",
    "#priceButton",
    "#popup",
    "#listsPricePopup",
    "#listsPopup",
  ];

  function allReady() {
    return REQUIRED.every((sel) => document.querySelector(sel));
  }

  function start() {
    if (window.__modalInitDone) return;
    window.__modalInitDone = true;
    initModal();
  }

  if (allReady()) {
    start();
    return;
  }

  const obs = new MutationObserver(() => {
    if (allReady()) {
      obs.disconnect();
      start();
    }
  });

  obs.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("load", () => {
    if (allReady()) {
      obs.disconnect();
      start();
    }
  });
})();

function initModal() {
  const listsPriceButton = document.getElementById("listsPriceButton");
  const listsPricePopup = document.getElementById("listsPricePopup");
  const priceButton = document.getElementById("priceButton");
  const popup = document.getElementById("popup");
  const producersLink = document.getElementById("producers");
  const listsPopup = document.getElementById("listsPopup");
  const burgerMenu = document.getElementById("burgerMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobilePriceButton = document.getElementById("mobilePriceButton");
  const backToPopupFromListsPrice = document.getElementById(
    "backToPopupFromListsPrice"
  );
  const backToBurgerMenu = document.querySelector(".menu-price-button-back");

  function lockScroll() {
    document.body.classList.add("body-lock");
  }
  function unlockScroll() {
    document.body.classList.remove("body-lock");
  }

  function closeAllPopups() {
    if (popup) popup.style.display = "none";
    if (listsPricePopup) listsPricePopup.style.display = "none";
    if (listsPopup) listsPopup.style.display = "none";
    if (mobileMenu) mobileMenu.style.display = "none";
    burgerMenu?.classList.remove("active");
    unlockScroll();
  }

  burgerMenu?.addEventListener("click", () => {
    if (burgerMenu.classList.contains("active")) {
      closeAllPopups();
    } else {
      toggleMenu();
      if (mobileMenu) mobileMenu.style.display = "flex";
    }
  });

  priceButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (
      (popup && popup.style.display === "block") ||
      (listsPricePopup && listsPricePopup.style.display === "block") ||
      (listsPopup && listsPopup.style.display === "block")
    ) {
      closeAllPopups();
      return;
    }
    closeAllPopups();
    if (popup) popup.style.display = "block";
    burgerMenu?.classList.add("active");
    lockScroll();
  });

  mobilePriceButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (popup) popup.style.display = "block";
    if (mobileMenu) mobileMenu.style.display = "none";
    burgerMenu?.classList.add("active");
    lockScroll();
  });

  listsPriceButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (listsPricePopup) listsPricePopup.style.display = "block";
    burgerMenu?.classList.add("active");
    lockScroll();
  });

  producersLink?.addEventListener("click", (event) => {
    event.preventDefault();
    if (listsPopup) listsPopup.style.display = "flex";
    burgerMenu?.classList.add("active");
    lockScroll();
  });

  document
    .querySelector(".lists-price-button-back")
    ?.addEventListener("click", () => {
      if (listsPopup) listsPopup.style.display = "none";
      if (popup) popup.style.display = "block";
      burgerMenu?.classList.add("active");
      lockScroll();
    });

  backToPopupFromListsPrice?.addEventListener("click", () => {
    if (listsPricePopup) listsPricePopup.style.display = "none";
    if (popup) popup.style.display = "block";
    burgerMenu?.classList.add("active");
    lockScroll();
  });

  backToBurgerMenu?.addEventListener("click", () => {
    if (popup) popup.style.display = "none";
    if (mobileMenu) mobileMenu.style.display = "block";
    burgerMenu?.classList.add("active");
    unlockScroll();
  });

  document.addEventListener("click", (event) => {
    const t = event.target;
    const outsideBurger = !burgerMenu || !burgerMenu.contains(t);
    const outsideMobile = !mobileMenu || !mobileMenu.contains(t);
    const outsidePopup = !popup || !popup.contains(t);
    const outsideListsPrice = !listsPricePopup || !listsPricePopup.contains(t);
    const outsideLists = !listsPopup || !listsPopup.contains(t);

    if (
      outsideBurger &&
      outsideMobile &&
      outsidePopup &&
      outsideListsPrice &&
      outsideLists
    ) {
      closeAllPopups();
    }
  });

  function toggleMenu() {
    burgerMenu?.classList.toggle("active");
  }
}
