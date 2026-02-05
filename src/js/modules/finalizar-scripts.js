(() => {
  "use strict";

  function initWizardSteps() {
    const stepByPage = {
      "index.html": 0,
      "alumno.html": 1,
      "finalizar.html": 2,
    };

    const path = window.location.pathname;
    const page = (path.split("/").pop() || "index.html").toLowerCase();

    if (!(page in stepByPage)) return;

    const current = stepByPage[page];
    const steps = document.querySelectorAll("#wizardSteps .step-vertical");

    steps.forEach((el) => {
      const i = Number(el.dataset.step);
      el.classList.remove("active", "complete");
      if (i < current) el.classList.add("complete");
      if (i === current) el.classList.add("active");
    });
  }

  // 2) Fecha de envío
  function initFechaEnvio() {
    const el = document.getElementById("fechaEnvio");
    if (!el) return;

    const now = new Date();

    const fecha = now.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const hora = now.toLocaleTimeString("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    el.textContent = `${fecha} - ${hora}`;
  }

  function initFolioITC() {
    const el = document.getElementById("folioGenerado");
    if (!el) return;

    const PREFIX = "ITC";
    const WIDTH = 4; // ITC0001
    const KEY = "itc_folio_counter";

    let counter = parseInt(localStorage.getItem(KEY), 10);
    if (!Number.isFinite(counter) || counter < 1) counter = 1;

    const folio = PREFIX + String(counter).padStart(WIDTH, "0");
    el.textContent = folio;

    localStorage.setItem(KEY, String(counter + 1));
  }

  function initBtnEnviar() {
    const btn = document.getElementById("btnEnviar");
    if (!btn) return;

    btn.addEventListener("click", () => {
      localStorage.setItem("preinscripcion_enviada", "1");
      alert("Solicitud enviada correctamente");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initWizardSteps();
    initFechaEnvio();
    initFolioITC();
    initBtnEnviar();
  });
})();
