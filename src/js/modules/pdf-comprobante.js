(function () {
  "use strict";

  // ===== CONFIG EXACTO =====
  const CONFIG = {
    marginTop: 20,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,

    // Logo PERFECTO: NO TOCAR
    logoX: 25,
    logoY: 20,
    logoW: 40.9,
    logoH: 11.9,

    // Encabezado (solo letras)
    titleY: 26,
  };

  function _txt(id) {
    const el = document.getElementById(id);
    return el ? (el.textContent || "").trim() : "";
  }
  function _ls(key) {
    return (localStorage.getItem(key) || "").trim();
  }
  function _safe(v, fb = "—") {
    v = (v || "").toString().trim();
    return v ? v : fb;
  }
  function _upper(v) {
    return (v || "").toString().trim().toUpperCase();
  }

  function imgToDataURL(imgEl) {
    return new Promise((resolve) => {
      if (!imgEl) return resolve(null);

      const done = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = imgEl.naturalWidth || imgEl.width;
          canvas.height = imgEl.naturalHeight || imgEl.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(imgEl, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          console.warn("No se pudo convertir logo a DataURL:", e);
          resolve(null);
        }
      };

      if (imgEl.complete && imgEl.naturalWidth) return done();
      imgEl.onload = done;
      imgEl.onerror = () => resolve(null);
      setTimeout(() => resolve(null), 1500);
    });
  }

  function safeRect(doc, x, y, w, h, label = "rect") {
    const ok = [x, y, w, h].every((v) => Number.isFinite(v)) && w > 0 && h > 0;
    if (!ok) {
      console.error(`Rect inválido (${label}):`, { x, y, w, h });
      throw new Error(`Rect inválido (${label})`);
    }
    doc.rect(x, y, w, h);
  }

  function wrapText(doc, text, maxWidth) {
    return doc.splitTextToSize(text, maxWidth);
  }

  function justifyLine(doc, line, x, y, maxWidth) {
    const words = line.trim().split(/\s+/);
    if (words.length <= 1) return doc.text(line, x, y);

    const lineNoSpaces = words.join("");
    const wordsWidth = doc.getTextWidth(lineNoSpaces);
    const gaps = words.length - 1;
    const extra = maxWidth - wordsWidth;

    if (extra <= 0) return doc.text(line, x, y);

    const gapW = extra / gaps;
    let cursor = x;

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      doc.text(w, cursor, y);
      cursor += doc.getTextWidth(w);
      if (i < words.length - 1) cursor += gapW;
    }
  }

  function drawJustifiedParagraph(
    doc,
    text,
    x,
    y,
    boxInnerW,
    boxInnerH,
    fontSize,
    lineGap = 1.02
  ) {
    const localLineH = fontSize * 0.3527777778 * lineGap;
    const lines = wrapText(doc, text, boxInnerW);

    const maxLines = Math.floor(boxInnerH / localLineH);
    const clipped = lines.slice(0, Math.max(0, maxLines));

    for (let i = 0; i < clipped.length; i++) {
      const line = clipped[i];
      const isLast = i === clipped.length - 1;
      if (isLast) doc.text(line, x, y + i * localLineH);
      else justifyLine(doc, line, x, y + i * localLineH, boxInnerW);
    }

    return y + clipped.length * localLineH;
  }

  // 🔥 GLOBAL para onclick
  window.convertirPdf = async function convertirPdf() {
    try {
      if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
        alert("jsPDF no está cargado. Revisa el orden de scripts.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const left = CONFIG.marginLeft;
      const right = CONFIG.marginRight;

      // Columna derecha para título
      const gap = 10;
      const rightColumnX = CONFIG.logoX + CONFIG.logoW + gap;
      const titleXRight = pageW - right;
      const titleMaxW = titleXRight - rightColumnX;

      // Datos principales
      const folio = _upper(
        _safe(_txt("cpFolio") || _txt("folioGenerado") || _ls("itc_folio_actual"))
      );
      const nombre = _upper(_safe(_txt("cpNombre")));
      const carrera = _upper(_safe(_txt("cpEspecialidad")));

      // Logo
      const logoEl = document.getElementById("pdfLogo");
      const logoDataUrl = await imgToDataURL(logoEl);
      if (logoDataUrl) {
        doc.addImage(
          logoDataUrl,
          "PNG",
          CONFIG.logoX,
          CONFIG.logoY,
          CONFIG.logoW,
          CONFIG.logoH
        );
      }

      // Título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const title = "FICHA DE PREINSCRIPCION ITACE";
      const titleLines = doc.splitTextToSize(title, titleMaxW);
      doc.text(titleLines, titleXRight, CONFIG.titleY, { align: "right" });

      const titleLineH = 18 * 0.3527777778 * 1.2;
      const afterTitleY = CONFIG.titleY + (titleLines.length - 1) * titleLineH;

      doc.setFontSize(12);
      doc.text("GENERACIÓN 2025-2028", titleXRight, afterTitleY + 10, {
        align: "right",
      });

      // Bloque superior
      doc.setFontSize(12);
      const lineH = 12 * 0.3527777778 * 1.5;

      const logoBottom = CONFIG.logoY + CONFIG.logoH;
      let y = logoBottom + 20;

      doc.setFont("helvetica", "bold");
      doc.text("NÚMERO DE FOLIO:", left, y);
      doc.setFont("helvetica", "normal");
      doc.text(folio, left + 48, y);

      y += lineH;
      doc.setFont("helvetica", "bold");
      doc.text("NOMBRE DEL ASPIRANTE:", left, y);
      doc.setFont("helvetica", "normal");
      doc.text(nombre, left + 62, y);

      y += lineH;
      doc.setFont("helvetica", "bold");
      doc.text("CARRERA:", left, y);
      doc.setFont("helvetica", "normal");
      doc.text(carrera, left + 22, y);

      // Línea punteada
      y += lineH * 1.2;
      doc.setLineWidth(0.6);
      doc.setLineDashPattern([4, 3], 0);
      doc.line(left, y, pageW - right, y);
      doc.setLineDashPattern([], 0);

      // DATOS DEL ASPIRANTE
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("DATOS DEL ASPIRANTE", pageW / 2, y, { align: "center" });

      y += 18;
      doc.setFontSize(11);

      const col1X = left;
      const col2X = left + 62;
      const col3X = left + 120;
      const colEdadX = pageW - right - 27;

      const valueOffsetWide = 60;
      const valueOffsetShort = 38;

      function field(x, yy, label, value = "", offset = 52) {
        doc.setFont("helvetica", "bold");
        doc.text(label, x, yy);
        doc.setFont("helvetica", "normal");
        if (value) doc.text(String(value), x + offset, yy);
      }

      field(col1X, y, "Nombre:");
      y += 10;

      field(col1X, y, "Género:");
      field(col2X, y, "Fecha de Nacimiento:", "", valueOffsetWide);
      field(colEdadX, y, "Edad:", "", valueOffsetShort);
      y += 10;

      field(col1X, y, "CURP:");
      field(col3X, y, "Tipo de sangre:", "", valueOffsetShort);
      y += 10;

      field(col1X, y, "Secundaria de procedencia:");
      y += 10;

      field(col1X, y, "Año en el que concluyo la secundaria:");
      field(col3X, y, "Promedio:", "", valueOffsetShort);
      y += 10;

      field(col1X, y, "Domicilio del alumno:");
      y += 10;

      field(col1X, y, "Ciudad:");
      field(col2X, y, "Estado:");
      y += 14;

      // Línea punteada inferior
      doc.setLineWidth(0.6);
      doc.setLineDashPattern([4, 3], 0);
      doc.line(left, y, pageW - right, y);
      doc.setLineDashPattern([], 0);

      // ===== DOCUMENTOS + CUADROS =====
      y += 9;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("DOCUMENTOS ENTREGADOS:", left, y);

      // Lista (compacta)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);

      let ly = y + 10;
      const bulletX = left;
      const textX = left + 6;
      const listStep = 7.0;

      const docs = [
        "Acta de nacimiento actualizada",
        "CURP actualizado",
        "Certificado de secundaria",
        "Comprobante de domicilio (3 meses)",
        "6 fotografías tamaño infantil papel mate.",
        "Carta de buena conducta",
        "PAGO COLEGIATURA.",
      ];

      docs.forEach((t) => {
        doc.text("•", bulletX, ly);
        doc.text(t, textX, ly);
        ly += listStep;
      });

      const leftBottom2 = ly + 1;

      // Cuadro derecho
      const boxW = 85;
      const boxH = 58;
      const boxX = pageW - right - boxW;
      const boxY = y + 2;

      doc.setLineWidth(0.4);
      safeRect(doc, boxX, boxY, boxW, boxH, "certificado");

      const pad = 5;
      const innerX = boxX + pad;
      const innerY = boxY + pad;
      const innerW = boxW - pad * 2;
      const innerH = boxH - pad * 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);

      const header = "SOLO EN CASO DE FALTA DE CERTIFICADO DE SECUNDARIA";
      doc.text(doc.splitTextToSize(header, innerW), boxX + boxW / 2, innerY + 2.2, {
        align: "center",
      });

      doc.text("Razón por la que no la tiene:", innerX, innerY + 11);

      doc.setLineWidth(0.3);
      doc.line(innerX, innerY + 18.5, innerX + innerW, innerY + 18.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      const p1 =
        "por el motivo anterior me comprometo a entregar el certificado de mi hijo(a) el 12 septiembre 2025, por lo cual " +
        "me doy por enterado (a) de que en caso de no cumplir con dicho compromiso será dado de baja de manera automática " +
        "quedando mi lugar o espacio a disposición del plantel.";

      const paraTop = innerY + 22;
      const paraH = 16;
      drawJustifiedParagraph(doc, p1, innerX, paraTop, innerW, paraH, 8, 1.01);

      doc.setLineWidth(0.3);
      doc.line(innerX, innerY + 42.5, innerX + innerW, innerY + 42.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(
        "NOMBRE Y FIRMA COMPROMISO PADRE Y/O TUTOR",
        boxX + boxW / 2,
        innerY + innerH - 1.3,
        { align: "center" }
      );

      // ===== Cuadro inferior (misma hoja) =====
      // (IMPORTANTE: variables con nombres únicos para NO redeclarar)
      const bigW2 = pageW - left - right;
      const bigX2 = left;

      const leftBlockBottom2 = ly;
      const rightBlockBottom2 = boxY + boxH;

      const GAP_BELOW = 6;
      const EXTRA_DOWN = 1.5; // ~4 puntos
      let bigY2 = Math.max(leftBlockBottom2, rightBlockBottom2) + GAP_BELOW + EXTRA_DOWN;

      const t1b =
        "En caso de tener tramite de corrección, no coincidir tu CURP con acta de nacimiento y/o certificado de secundaria; " +
        "háganos saber su situación para brindarle la atención necesaria.";

      const t2b =
        "COMPROMISOS DEL ASPIRANTE Y PADRE DE FAMILIA: Ser estudiante regular de secundaria (No deber materias de secundaria), " +
        "respetar el grupo y turno que le sea asignado y mantener buena conducta. El ingreso sólo depende de aprobar el examen de admision.";

      const bigFontSize = 8;
      const bigLineGap = 1.00;
      const boxLineH = bigFontSize * 0.3527777778 * bigLineGap;

      const bigPad2 = 6;
      const bigInnerX2 = bigX2 + bigPad2;
      const bigInnerW2 = bigW2 - bigPad2 * 2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(bigFontSize);

      const lines1 = doc.splitTextToSize(t1b, bigInnerW2);
      const lines2 = doc.splitTextToSize(t2b, bigInnerW2);

      const linesTotal = lines1.length + 1 + lines2.length;
      const neededInnerH = linesTotal * boxLineH + 2;

      let bigH2 = neededInnerH + 9;

      // No te manda a otra hoja: lo máximo es (pageH - 2mm)
      const maxHInPage = (pageH - 2) - bigY2;
      if (bigH2 > maxHInPage) bigH2 = maxHInPage;

      doc.setLineWidth(0.4);
      safeRect(doc, bigX2, bigY2, bigW2, bigH2, "cuadro-inferior");

      const bigInnerY2 = bigY2 + 7.5;
      const bigInnerH2 = bigH2 - 9;

      let yy2 = drawJustifiedParagraph(
        doc,
        t1b,
        bigInnerX2,
        bigInnerY2,
        bigInnerW2,
        bigInnerH2,
        bigFontSize,
        bigLineGap
      );

      yy2 += 2.0;

      drawJustifiedParagraph(
        doc,
        t2b,
        bigInnerX2,
        yy2,
        bigInnerW2,
        (bigInnerY2 + bigInnerH2 - yy2),
        bigFontSize,
        bigLineGap
      );

      y = bigY2 + bigH2;

      const filename = `Ficha_ITACE_${folio}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("PDF: error al generar", err);
      alert("Error al generar PDF. Comuniquese con soporte para mayor detalles.");
    }
  };

  console.log("COMPROBANTE PDF Generado con éxito", typeof window.convertirPdf);
})();
