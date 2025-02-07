function generarOpcionesSelect(Lista_elementos, comp_mostrar) {
  let view = "";

  Lista_elementos.forEach((lista) => {
    view += `<option value="${lista[comp_mostrar[0]]}">${
      lista[comp_mostrar[1]]
    }</option>`;
  });
  return view;
}

function generarOpcionesSelectConCondicion(
  Lista_elementos,
  comp_mostrar,
  id_condicion,
  variable
) {
  let view = "";
  Lista_elementos.forEach((lista) => {
    if (Number(lista[variable]) === Number(id_condicion)) {
      view += `<option value="${lista[comp_mostrar[0]]}">${
        lista[comp_mostrar[1]]
      }</option>`;
    }
  });
  return view;
}

export function actualizarSelectProduccion_condicion(
  codigo,
  Lista_elementos,
  id_html,
  comp_mostrar,
  id_condicion,
  variable,
  value
) {
  const listar2 = document.querySelector(`#${id_html}${codigo}`);
  if (listar2) {
    listar2.innerHTML =
      variable && id_condicion
        ? generarOpcionesSelectConCondicion(
            Lista_elementos,
            comp_mostrar,
            id_condicion,
            variable
          )
        : generarOpcionesSelect(Lista_elementos, comp_mostrar);
  } else {
    console.error(`Elemento #${id_html}${codigo} no encontrado`);
  }
}
