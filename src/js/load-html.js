(async () => {
  const loads = [...document.querySelectorAll("load[src]")];

  for (const node of loads) {
    const src = node.getAttribute("src");
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const html = await res.text();
      node.insertAdjacentHTML("afterend", html);
      node.remove();
    } catch (e) {
      console.error("FAILED TO LOAD:", src, e);
    }
  }
  window.dispatchEvent(new CustomEvent("partials:loaded"));
})();
