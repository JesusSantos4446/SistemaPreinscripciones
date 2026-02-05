document.addEventListener("DOMContentLoaded", () => {
  const payload = leerPreinscripcionLS();

  if (!payload || !payload.datos) {
    window.location.href = "alumno.html";
    return;
  }

  pintarConfirmacion(payload.datos);

  const btnEnviar = document.getElementById("btnEnviarSolicitud");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", async (e) => {
      e.preventDefault();
      await enviarSolicitud(payload);
    });
  }
});

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = (value ?? "").toString().trim() || "—";
}

function pintarConfirmacion(d) {
  setText("txtApellidoPaterno", d.generales.apPaterno);
  setText("txtApellidoMaterno", d.generales.apMaterno);
  setText("txtNombres", d.generales.nombres);
  setText("txtGenero", d.generales.genero);
  setText("txtFechaNacimiento", d.generales.fechaNacimiento);
  setText("txtEstadoCivil", d.generales.estadoCivil);
  setText("txtNacionalidad", d.generales.nacionalidad);
  setText("txtCurp", d.generales.curp);

  setText("txtCalle", d.domicilio.calle);
  setText("txtNumExt", d.domicilio.numExt);
  setText("txtNumInt", d.domicilio.numInt);
  setText("txtCP", d.domicilio.cp);
  setText("txtColonia", d.domicilio.colonia);
  setText("txtEstado", d.domicilio.estado);
  setText("txtMunicipio", d.domicilio.municipio);
  setText("txtEmail", d.domicilio.email);
  setText("txtTelefono", d.domicilio.telefono);

  setText("txtTutorParentesco", d.tutor.parentesco);
  setText("txtTutorApPaterno", d.tutor.apPaterno);
  setText("txtTutorApMaterno", d.tutor.apMaterno);
  setText("txtTutorNombres", d.tutor.nombres);
  setText("txtTutorTelCasa", d.tutor.telCasa);
  setText("txtTutorTelTrabajo", d.tutor.telTrabajo);

  setText("txtEscProcedencia", d.escolares.procedencia);
  setText("txtEscCarrera", d.escolares.carrera);
  setText("txtEscEstado", d.escolares.estado);
  setText("txtEscMunicipio", d.escolares.municipio);
  setText("txtEscPromedio", d.escolares.promedio);
  setText("txtEscFechaInicio", d.escolares.fechaInicio);
  setText("txtEscFechaFin", d.escolares.fechaFin);
  setText("txtEscSistema", d.escolares.sistema);
  setText("txtEscTipoPrepa", d.escolares.tipoPrepa);

  setText("txtBeca", d.otros.beca);
  setText("txtTipoBeca", d.otros.beca === "Sí" ? d.otros.tipoBeca : "—");
  setText("txtOrigenIndigena", d.otros.origenIndigena);
  setText("txtLenguaIndigena", d.otros.lenguaIndigena);
  setText("txtLenguaCual", d.otros.lenguaIndigena === "Sí" ? d.otros.lenguaCual : "—");
  setText("txtDiscapacidad", d.otros.discapacidad);
  setText("txtDiscapEspec", d.otros.discapacidad === "Sí" ? d.otros.discapEspec : "—");
  setText("txtEnfermedad", d.otros.enfermedad);
  setText("txtEnfEspec", d.otros.enfermedad === "Sí" ? d.otros.enfEspec : "—");
}

async function enviarSolicitud(payload) {
  // Evita doble click
  const btn = document.getElementById("btnEnviarSolicitud");
  if (btn) btn.disabled = true;

  try {
    const res = await fetch("/api/preinscripcion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload) 
    });

    if (!res.ok) throw new Error("Error en el servidor");

    limpiarPreinscripcionLS();

    window.location.href = "finalizar.html";
  } catch (err) {
    alert("No se pudo enviar la solicitud. Intenta de nuevo.");
    if (btn) btn.disabled = false;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const payload = leerPreinscripcionLS();

  if (!payload || !payload.datos) {
    window.location.href = "index.html";
    return;
  }

  const d = payload.datos;

  if (d.generales) {
    const g = d.generales;

    setText("txtApellidoPaterno", g.apPaterno);
    setText("txtApellidoMaterno", g.apMaterno);
    setText("txtNombres", g.nombres);
    setText("txtGenero", g.genero);
    setText("txtFechaNacimiento", g.fechaNacimiento);
    setText("txtEstadoCivil", g.estadoCivil);
    setText("txtNacionalidad", g.nacionalidad);
    setText("txtCurp", (g.curp || "").toUpperCase());

    const card = document.getElementById("lugarNacimientoCard");
    if (card) {
      const hayLugar = !!(g.estadoNacimiento || g.municipioNacimiento);
      card.classList.toggle("d-none", !hayLugar);

      if (hayLugar) {
        setText("txtEstadoNacimiento", g.estadoNacimiento);
        setText("txtMunicipioNacimiento", g.municipioNacimiento);
      }
    }
  }


  if (d.domicilio) {
    const dom = d.domicilio;

    setText("txtCalle", dom.calle);
    setText("txtNumExt", dom.numExt);
    setText("txtNumInt", dom.numInt);
    setText("txtCP", dom.cp);
    setText("txtColonia", dom.colonia);
    setText("txtEstado", dom.estado);
    setText("txtMunicipio", dom.municipio);
    setText("txtEmail", dom.email);
    setText("txtTelefono", dom.telefono);
  }


  if (d.tutor) {
    const t = d.tutor;

    setText("txtTutorParentesco", t.parentesco);
    setText("txtTutorApPaterno", t.apPaterno);
    setText("txtTutorApMaterno", t.apMaterno);
    setText("txtTutorNombres", t.nombres);
    setText("txtTutorTelCasa", t.telCasa);
    setText("txtTutorTelTrabajo", t.telTrabajo);
  }


  if (d.escolares) {
    const e = d.escolares;

    setText("txtEscProcedencia", e.procedencia);
    setText("txtEscCarrera", e.carrera);
    setText("txtEscEstado", e.estado);
    setText("txtEscMunicipio", e.municipio);
    setText("txtEscPromedio", e.promedio);
    setText("txtEscFechaInicio", e.fechaInicio);
    setText("txtEscFechaFin", e.fechaFin);
    setText("txtEscSistema", e.sistema);
    setText("txtEscTipoPrepa", e.tipoPrepa);
  }


  if (d.otros) {
    const o = d.otros;

    setText("txtBeca", o.beca);
    setText("txtTipoBeca", o.beca === "Sí" ? o.tipoBeca : "—");

    setText("txtOrigenIndigena", o.origenIndigena);

    setText("txtLenguaIndigena", o.lenguaIndigena);
    setText("txtLenguaCual", o.lenguaIndigena === "Sí" ? o.lenguaCual : "—");

    setText("txtDiscapacidad", o.discapacidad);
    setText("txtDiscapEspec", o.discapacidad === "Sí" ? o.discapEspec : "—");

    setText("txtEnfermedad", o.enfermedad);
    setText("txtEnfEspec", o.enfermedad === "Sí" ? o.enfEspec : "—");
  }
});


function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = (value ?? "").toString().trim();
  el.textContent = v !== "" ? v : "—";
}
