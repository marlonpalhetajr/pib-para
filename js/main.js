document.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();
  const yearEl = document.querySelector("[data-current-year]");
  if (yearEl) {
    yearEl.textContent = currentYear;
  }

  document.querySelectorAll("[data-pdf-select]").forEach((select) => {
    const viewerSelector = select.dataset.pdfViewer;
    const linkSelector = select.dataset.pdfLink;
    const pdfBase = select.dataset.pdfBase || "";
    const viewer = viewerSelector ? document.querySelector(viewerSelector) : null;
    const link = linkSelector ? document.querySelector(linkSelector) : null;

    if (!viewer) {
      return;
    }

    const updateViewer = () => {
      const value = select.value;
      const container = viewer.closest("#pdfViewerContainer") || viewer.parentElement;
      
      if (value) {
        const pdfPath = `${pdfBase}${encodeURI(value)}`;
        viewer.setAttribute("src", pdfPath);
        if (link) {
          link.setAttribute("href", pdfPath);
        }
        // Mostrar o container do visualizador se houver
        if (container && container.id === "pdfViewerContainer") {
          container.style.display = "block";
        }
      } else {
        // Esconder o container se a opção vazia for selecionada
        if (container && container.id === "pdfViewerContainer") {
          container.style.display = "none";
        }
        viewer.setAttribute("src", "");
      }
    };

    select.addEventListener("change", updateViewer);

    if (select.options.length > 0) {
      updateViewer();
    }
  });

  initAccessibility();
});

function toggleAccessibilityMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("acessibilidadeMenu");
  const button = document.getElementById("acess-open-btn");
  if (!menu) {
    return;
  }
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  if (button) {
    button.setAttribute("aria-expanded", String(!isOpen));
  }
  menu.setAttribute("aria-hidden", String(isOpen));
}

document.addEventListener("click", (event) => {
  const menu = document.getElementById("acessibilidadeMenu");
  const button = document.getElementById("acess-open-btn");
  if (!menu || !button) {
    return;
  }
  if (!menu.contains(event.target) && !button.contains(event.target)) {
    menu.style.display = "none";
    button.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  }
});

function initAccessibility() {
  const menu = document.getElementById("acessibilidadeMenu");
  const button = document.getElementById("acess-open-btn");
  if (menu) {
    menu.setAttribute("aria-hidden", "true");
  }
  if (button) {
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "acessibilidadeMenu");
  }

  const storageKey = "pib_accessibility";
  const defaultState = {
    contrast: false,
    night: false,
    grayscale: false,
    fontScale: 0,
    dalton: "none",
    dyslexia: false,
    reading: false,
    links: false,
    reduceMotion: false,
  };

  let state = { ...defaultState };
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      state = { ...state, ...JSON.parse(saved) };
    }
  } catch (error) {
    state = { ...defaultState };
  }

  const clampFontScale = (value) => Math.max(-2, Math.min(4, value));

  const applyAccessibility = () => {
    const body = document.body;
    if (!body) {
      return;
    }

    body.classList.toggle("acess-night", state.night);
    body.classList.toggle("acess-dyslexia", state.dyslexia);
    body.classList.toggle("acess-reading", state.reading);
    body.classList.toggle("acess-links", state.links);
    body.classList.toggle("acess-reduce-motion", state.reduceMotion);

    const filters = [];
    if (state.contrast) {
      filters.push("contrast(1.35)");
    }
    if (state.grayscale) {
      filters.push("grayscale(1)");
    }
    if (state.dalton === "prot") {
      filters.push("hue-rotate(25deg) saturate(1.2)");
    } else if (state.dalton === "deut") {
      filters.push("hue-rotate(320deg) saturate(1.1)");
    } else if (state.dalton === "trit") {
      filters.push("hue-rotate(180deg) saturate(1.1)");
    }

    body.style.filter = filters.length ? filters.join(" ") : "none";

    const fontScale = clampFontScale(state.fontScale || 0);
    document.documentElement.style.fontSize = `${100 + fontScale * 10}%`;
  };

  const saveState = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      return;
    }
  };

  const setState = (patch) => {
    state = { ...state, ...patch };
    saveState();
    applyAccessibility();
    updateControls();
  };

  const controls = {
    contrast: document.getElementById("acess-contrast"),
    night: document.getElementById("acess-night"),
    grayscale: document.getElementById("acess-grayscale"),
    fontDec: document.getElementById("font-dec"),
    fontReset: document.getElementById("font-reset"),
    fontInc: document.getElementById("font-inc"),
    prot: document.getElementById("dalton-prot"),
    deut: document.getElementById("dalton-deut"),
    trit: document.getElementById("dalton-trit"),
    daltonOff: document.getElementById("dalton-off"),
    dyslexia: document.getElementById("acess-dislexia"),
    reading: document.getElementById("acess-reading"),
    links: document.getElementById("acess-links"),
    reduceMotion: document.getElementById("reduce-motion"),
    reset: document.getElementById("acess-reset"),
  };

  const setButtonState = (button, enabled) => {
    if (!button) {
      return;
    }
    button.classList.toggle("is-active", enabled);
    button.setAttribute("aria-pressed", String(enabled));
  };

  const updateControls = () => {
    setButtonState(controls.contrast, state.contrast);
    setButtonState(controls.night, state.night);
    setButtonState(controls.grayscale, state.grayscale);
    setButtonState(controls.dyslexia, state.dyslexia);
    setButtonState(controls.reading, state.reading);
    setButtonState(controls.links, state.links);
    setButtonState(controls.reduceMotion, state.reduceMotion);

    setButtonState(controls.prot, state.dalton === "prot");
    setButtonState(controls.deut, state.dalton === "deut");
    setButtonState(controls.trit, state.dalton === "trit");
    setButtonState(controls.daltonOff, state.dalton === "none");
  };

  if (controls.contrast) {
    controls.contrast.addEventListener("click", () => setState({ contrast: !state.contrast }));
  }
  if (controls.night) {
    controls.night.addEventListener("click", () => setState({ night: !state.night }));
  }
  if (controls.grayscale) {
    controls.grayscale.addEventListener("click", () => setState({ grayscale: !state.grayscale }));
  }
  if (controls.fontDec) {
    controls.fontDec.addEventListener("click", () => setState({ fontScale: clampFontScale((state.fontScale || 0) - 1) }));
  }
  if (controls.fontReset) {
    controls.fontReset.addEventListener("click", () => setState({ fontScale: 0 }));
  }
  if (controls.fontInc) {
    controls.fontInc.addEventListener("click", () => setState({ fontScale: clampFontScale((state.fontScale || 0) + 1) }));
  }

  if (controls.prot) {
    controls.prot.addEventListener("click", () => setState({ dalton: "prot" }));
  }
  if (controls.deut) {
    controls.deut.addEventListener("click", () => setState({ dalton: "deut" }));
  }
  if (controls.trit) {
    controls.trit.addEventListener("click", () => setState({ dalton: "trit" }));
  }
  if (controls.daltonOff) {
    controls.daltonOff.addEventListener("click", () => setState({ dalton: "none" }));
  }

  if (controls.dyslexia) {
    controls.dyslexia.addEventListener("click", () => setState({ dyslexia: !state.dyslexia }));
  }
  if (controls.reading) {
    controls.reading.addEventListener("click", () => setState({ reading: !state.reading }));
  }
  if (controls.links) {
    controls.links.addEventListener("click", () => setState({ links: !state.links }));
  }
  if (controls.reduceMotion) {
    controls.reduceMotion.addEventListener("click", () => setState({ reduceMotion: !state.reduceMotion }));
  }

  if (controls.reset) {
    controls.reset.addEventListener("click", () => setState({ ...defaultState }));
  }

  applyAccessibility();
  updateControls();
}
