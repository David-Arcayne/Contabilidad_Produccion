import { URL_APIP } from "../../../../../lib/services.js";
import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let privilegios;

let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_etapas_produccion = [];
let Lista_maquinas = [];
let Lista_etapas_maquinas = [];
let Lista_etps_maq_reg = [];
let list_seccion = [];
let list_tipo_Maquina = [];
let list_rubro = [];
let Lista_maquinas_de_etapa = [];
const codigo = codigos.codigo_etapa_maquina;

function vaciar_listas() {
  Lista_etapas_produccion = [];
  Lista_maquinas = [];
  Lista_etapas_maquinas = [];
  Lista_etps_maq_reg = [];
  list_seccion = [];
  list_tipo_Maquina = [];
  list_rubro = [];
}

export async function registro_etapa_maquina(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));

  refrescar_ = refrescar;
  codigo_ = codigo;
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
    sitio();
  });
  sitio();
}

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_api_general("listar_etapas_produccion", idEmpresa),
      listarFunctions.listar_api_general("listar_maquina", idEmpresa),
      listarFunctions.listar_api_general("listar_tipomaquina", idEmpresa),
      listarFunctions.listar_api_general("listarseccion", idEmpresa),
      listarFunctions.listar_api_general("listar_rubro", idEmpresa),
      listarFunctions.listar_api_general_verd("listado_maquina_etapas", idEmpresa),
    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_etapas_produccion = resultados[0];
    Lista_maquinas = resultados[1];
    list_tipo_Maquina = resultados[2];
    list_seccion = resultados[3];
    list_rubro = resultados[4];
    Lista_maquinas_de_etapa = resultados[5];
    console.log(resultados[5]);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
function llenar_select_etapa() {
  console.log("listo");
  const rubros_select = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );

  const select_ = document.querySelector(`#etapas_produccion${codigo}`);
  if (!select_ || !rubros_select) {
    console.error("No se encontraron los elementos del DOM.");
    return;
  }
  let idrubro = rubros_select.value;
  let view = `<option value="" disabled selected>Seleccione un grupo</option>`;
  Lista_etapas_produccion.map((lista) => {
    if (Number(lista.rubro_idrubro) === Number(idrubro)) {
      view += `
        <option value="${lista.idetapas_produccion}">
            Etapa producción: ${lista.nombre_etapa} 
        </option>
    `;
    }
  });
  select_.innerHTML = view;
}
async function sitio() {
  let view = "",
    ind = 1;
  view += `
        <div class="container">
            <div class="row">
                <div class="select-container" id="select2" style="width: 600px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; margin: 5px auto;">
                    <div class="col-md-12 mb-3 " id="div_etapas${codigo}">
                        <div class="row">
                            <label for="etapas_produccion" class="form-label">Etapas producción:</label>
                            <select class="form-select" id="etapas_produccion${codigo}" name="etapas_produccion">
                                <option value="" disabled selected>Seleccione una etapa</option>
                                
                            </select>
                        </div>
                    </div>
                </div>
                <div class="select-container" id="select2" style="width: 600px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; margin: 5px auto;">
                    <label for="seccion2" class="form-label fw-bold fs-6">Seleccionar Maquinas</label>
                    
                    <div class="select-box" id="selectBox" style="border: 1px solid #ccc; padding: 10px; cursor: pointer; background-color: #fff; display: flex; justify-content: space-between; align-items: center;">
                        Maquinas <span>▼</span>
                    </div>
                    
                    <div class="select-options" id="maquina_idmaquina${codigo}" style="display: none; border: 1px solid #ccc; border-top: none; max-height: 200px; overflow-y: auto; background-color: #fff;">
                        
                    </div>

                    <div id="selection-info" style="padding-top: 10px;">0 maquinas seleccionados</div>
                    
                    <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="agregar_select_multiple${codigo}" aria-label="generar">Añadir maquinas</button>
                </div>
                
            </div>
            <div id="alerta${codigo}" class="mt-4"></div>

            <div style = "max-height: 400px; overflow-y: auto; display: block;">
                    
                <table class="table table-hover" id = "editableTable${codigo}">
                    <thead>
                        <tr class="table-dark">
                            <th>N°</th>
                            <th>Maquina</th>
                            <th>Tipo</th>
                            <th>Seccion</th>
                            <th>Rubro</th>
                            <th>Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_maquina${codigo}"></tbody>
                </table>
            </div>
            <div class="col-md-12 mt-3 d-flex justify-content-between">
                <button type="button" class="btn btn-primary btn-sm" id="cancelar_${codigo}">Cancelar</button>
                <button type="button" class="btn btn-success btn-lg" id="registrar_etapas_maquina${codigo}">Guardar</button>
            </div>
        </div>
            
        `;
  await listar();
  app.innerHTML = view;
  llenar_select_etapa();
  console.log(Lista_maquinas);
  llenar_materiales_select_multiple();
  let selectedOptions = configurarSelect(
    "selectBox",
    `maquina_idmaquina${codigo}`,
    "selection-info"
  );
  console.log(selectedOptions);

  const select_rubro = document.getElementById(
    `rubro_idrubro${codigos.codigoPrincipal}`
  );
  select_rubro.addEventListener("change", function () {
    llenar_select_etapa();
    llenar_materiales_select_multiple();
  });

  document
    .getElementById(`agregar_select_multiple${codigo}`)
    .addEventListener("click", function () {
      if (selectedOptions.length > 0) {
        console.log(selectedOptions);
        let Lista_seleccionada =
          listar_elementos_seleccionados(selectedOptions);
        let lista_rgs = [];
        const etapa = document.getElementById(`etapas_produccion${codigo}`);
        if (!etapa.value) {
          alert("selecciones una etapa de producción");
          return;
        }
        selectedOptions.map((lista) => {
          let aux = {
            idetapa_maquina: 0,
            etapas_produccion_idetapas_produccion: Number(etapa.value),
            maquina_idmaquina: lista["maquina_idmaquina"],
          };
          lista_rgs.push(aux);
        });
        antes_listar_maquinas(Lista_seleccionada, lista_rgs);
      } else {
        console.error("No hay opciones seleccionadas en el primer select.");
      }
    });

  const btnregistrar_api = document.getElementById(
    `registrar_etapas_maquina${codigo}`
  );
  btnregistrar_api.addEventListener("click", function () {
    const Maquinas = [];
    const rows = document.querySelectorAll(`#listar_maquina${codigo} tr`);
    const Etapas = document.querySelector(`#etapas_produccion${codigo}`);

    rows.forEach((row, index) => {
      // data-id="${lista.idetapa_maquina}"
      // data-idetp="${lista.etapas_produccion_idetapas_produccion}"
      // data-idmaq="${lista.maquina_idmaquina}"
      const data_id = row.querySelector("td[data-id]");
      const data_idetp = row.querySelector("td[data-idetp]");
      const data_idmaq = row.querySelector("td[data-idmaq]");

      const id = data_id ? data_id.getAttribute("data-id") : null;
      const idetp = data_idetp ? data_idetp.getAttribute("data-idetp") : null;
      const idmaq = data_idmaq ? data_idmaq.getAttribute("data-idmaq") : null;

      const maquina = {
        idetapa_maquina: Number(id),
        maquina_idmaquina: Number(idmaq),
        etapas_produccion_idetapas_produccion: Number(Etapas.value),
      };
      Maquinas.push(maquina);
    });

    prepararLista_enviar(Maquinas);
  });

  const select_etapa_pro = document.querySelector(
    `#etapas_produccion${codigo}`
  );
  select_etapa_pro.addEventListener("change", function () {
    Lista_etapas_maquinas = [];

    console.log(Lista_maquinas_de_etapa,select_etapa_pro.value);
    let maquinas_seleccionados = Lista_maquinas_de_etapa.find(
      (obj) => Number(obj.idetapas_produccion) === Number(select_etapa_pro.value)
    );
    console.log(maquinas_seleccionados);

    let Lista_maquinas_seleccionados = listar_elementos_seleccionados(
      maquinas_seleccionados.detalles
    );
    Lista_maquinas_seleccionados = Array.isArray(Lista_maquinas_seleccionados)
      ? Lista_maquinas_seleccionados
      : [];
    antes_listar_maquinas(
      Lista_maquinas_seleccionados,
      maquinas_seleccionados.detalles
    );
  });
}
function prepararLista_enviar(list) {
  let proveedor_material = {
    verDavid: "registro_maquina_etapas",
    detalle: [...list],
  };

  console.log(proveedor_material);
  if (proveedor_material.detalle && proveedor_material.detalle.length > 0) {
    fetch(`${URL_APIP}api/`, {
      method: "POST", // Método HTTP
      headers: {
        "Usar-Registro-David": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proveedor_material), // Convertir el objeto JS a JSON antes de enviarlo
    })
      .then((response) => response.json()) // Procesar la respuesta en formato JSON
      .then((data) => {
        console.log(data);
        alertas(data);
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Lista vacia");
  }
}
function antes_listar_maquinas(Lista_seleccionados, seleccionados) {
  console.log(seleccionados);
  console.log(Lista_seleccionados);

  if (Array.isArray(Lista_seleccionados) && Lista_seleccionados.length > 0) {
    Lista_seleccionados.map((lista) => {
      let existeEtapa = Lista_etapas_maquinas.some(
        (orden) =>
          Number(orden.maquina_idmaquina) === Number(lista.maquina_idmaquina)
      );
      if (!existeEtapa) {
        let item_seleccionado = seleccionados.find(
          (obj) => Number(obj.maquina_idmaquina) === Number(lista.id)
        );
        lista["idetapa_maquina"] = item_seleccionado["idetapa_maquina"];
        lista["etapas_produccion_idetapas_produccion"] =
          item_seleccionado["etapas_produccion_idetapas_produccion"];
        lista["maquina_idmaquina"] = item_seleccionado["maquina_idmaquina"];

        Lista_etapas_maquinas.push(lista);
        Listar_Elementos();
      } else {
        alert("Ya existe producto");
      }
    });
  } else {
    Listar_Elementos();
  }
}
function Listar_Elementos() {
  const listar = document.getElementById(`listar_maquina${codigo}`);
  let view = "",
    ind = 1;
  console.log(Lista_etapas_maquinas);
  Lista_etapas_maquinas.map((lista) => {
    let itemseccion = list_seccion.find(
      (obj) => Number(obj.id) === Number(lista.seccion)
    ) || {
      id: 0,
      nombre_seccion: "Nulo",
      ubicacion: "Nulo",
      codigo_seccion: "Nulo",
    };
    let itemTipo = list_tipo_Maquina.find(
      (item) => Number(item.id) === Number(lista.tipo)
    );

    let itemrubro = list_rubro.find(
      (obj) => Number(obj.id) === Number(lista.rubro_idrubro)
    ) || {
      id: 0,
      rubro: "-",
      detalle: "-",
    };
    view += `
             <tr>
                <td>${ind++}</td>                
                <td 
                data-id="${lista.idetapa_maquina}" 
                data-idetp="${lista.etapas_produccion_idetapas_produccion}" 
                data-idmaq="${lista.maquina_idmaquina}">${lista.nombre}</td>
                <td>${itemTipo.tipo}</td>
                <td>${itemseccion.nombre_seccion}</td>
                <td >${itemrubro.rubro}</td>
                <td>
                    
                    <div class="d-flex gap-3">
                       
                        <div class="text-center">
                            <a  
                            data-id="eliminar_maquina,
                            ${lista.id},
                            ${uk[0].empresa.idempresa}"
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center  btn-delete"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Eliminar maquina">
                                <i class="bi bi-trash fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small"></span>
                        </div>
                        
                    </div>                             
                </td>
            </tr>
            `;
  });
  listar.innerHTML = view;

  listar.querySelectorAll(".btn-delete").forEach((button) => {
    console.log("===");
    button.addEventListener("click", () => eliminar_maquina(button));
  });
}
function eliminar_maquina(button) {
  console.log("===");
  const row = button.closest("tr"); // Obtener la fila actual
  const cellWithType = row.querySelector("td[data-id]"); // Selecciona la celda con el atributo data-type
  const data_idmaq = row.querySelector("td[data-idmaq]"); // Selecciona la celda con el atributo data-type

  if (cellWithType) {
    const currentType = Number(cellWithType.getAttribute("data-id")); // Obtén el valor actual
    const idmaq = Number(data_idmaq.getAttribute("data-idmaq"));
    if (currentType !== 0) {
      cellWithType.setAttribute("data-id", -Math.abs(currentType)); // Cambia el valor a negativo
      // Opcional: Ocultar la fila si deseas que desaparezca visualmente después de marcarla
      row.style.display = "none";
    } else {
      //eliminar totalmente de la tabla
      Lista_etapas_maquinas = Lista_etapas_maquinas.filter(
        (orden) => Number(orden.maquina_idmaquina) !== Number(idmaq)
      );
      row.remove();
    }
  }
}

function listar_elementos_seleccionados(List_select) {
  if (!Array.isArray(List_select) || List_select.length === 0) {
    console.warn("List_select está vacío o no es un arreglo válido.");
    return;
  }
  List_select.forEach((seleccionado, index) => {
    console.log(`Elemento en List_select [${index}]:`, seleccionado);
    console.log(
      `idproduct_comercial en seleccionado:`,
      seleccionado.maquina_idmaquina
    );
  });
  // Crear el Set para la comparación
  const IdsmaquinasSeleccionadas = new Set(
    List_select.map((seleccionado) =>
      String(seleccionado.maquina_idmaquina).trim()
    )
  );

  console.log(
    "ID maquinas seleccionados en Set:",
    Array.from(IdsmaquinasSeleccionadas)
  );

  //Inspección detallada de cada ID en ambas listas
  Lista_maquinas.forEach((maquina) => {
    const maquinaid = String(maquina.id).trim();
    const encontrado = IdsmaquinasSeleccionadas.has(maquinaid);
    console.log(
      `ID producto: ${maquinaid} - ¿Encontrado en seleccionados?: ${encontrado}`
    );
  });

  //Filtrado de productos usando el Set
  let maquinas_filtrados = Lista_maquinas.filter((maquina) =>
    IdsmaquinasSeleccionadas.has(String(maquina.id).trim())
  );

  console.log("Maquinas filtrados:", maquinas_filtrados);

  if (maquinas_filtrados.length === 0) {
    console.warn("No se encontraron productos coincidentes.");
  }
  return maquinas_filtrados;
}

function configurarSelect(idSelectBox, idSelectOptions, idSelectionInfo) {
  const selectBox = document.getElementById(idSelectBox);
  const selectOptions = document.getElementById(idSelectOptions);
  const selectionInfo = document.getElementById(idSelectionInfo);
  let selectedOptions = [];

  selectBox.addEventListener("click", function () {
    selectOptions.style.display =
      selectOptions.style.display === "block" ? "none" : "block";
  });

  selectOptions.addEventListener("click", function (event) {
    const clickedOption = event.target;

    if (clickedOption.tagName === "DIV") {
      const optionValue = clickedOption.getAttribute("data-value");
      const optionText = clickedOption.textContent;

      const optionIndex = selectedOptions.findIndex(
        (option) => option.maquina_idmaquina === Number(optionValue)
      );

      if (optionIndex === -1) {
        selectedOptions.push({
          maquina_idmaquina: Number(optionValue),
          text: optionText,
        });
        clickedOption.classList.add("selected");
      } else {
        selectedOptions.splice(optionIndex, 1);
        clickedOption.classList.remove("selected");
      }

      updateSelectionInfo();
      console.log("Opciones seleccionadas actualizadas:", selectedOptions);
    }
  });

  function updateSelectionInfo() {
    const totalOptions = document.querySelectorAll(
      `#${idSelectOptions} div`
    ).length;
    selectionInfo.textContent = `${selectedOptions.length} de ${totalOptions} productos seleccionados`;
  }

  document.addEventListener("click", function (event) {
    if (
      !selectBox.contains(event.target) &&
      !selectOptions.contains(event.target)
    ) {
      selectOptions.style.display = "none";
    }
  });

  // Solo retornamos el array de opciones seleccionadas sin verificar su contenido

  return selectedOptions;
}
function llenar_materiales_select_multiple() {
  const select_div = document.querySelector(`#maquina_idmaquina${codigo}`);
  const rubro = document.getElementById(
    `rubro_idrubro${codigos.codigoPrincipal}`
  );

  let view = "",
    ind = 1;

  let list = Lista_maquinas.filter(
    (obj) =>
      Number(obj.rubro_idrubro) === Number(rubro.value) &&
      Number(obj.estado) === 0
  );
  list.map((lista) => {
    view += `
            <div data-value="${lista.id}"> <span class="fw-bold text-primary">Nombre maquina:</span> ${lista.nombre} <span class="fw-bold text-primary"></div>
        `;
  });
  select_div.innerHTML = view;
}
function alertas(data) {
  console.log(data);
  // Definir las variables al principio
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;
    sitio();
    vaciar_listas();
  } else {
    if (data[0] == "danger") {
      alertClass = "alert-danger";
      alertMessage = data[1];
      timeoutDuration = 3000;
    } else {
      alertClass = "alert-primary";
      alertMessage = data[1];
      timeoutDuration = 3000;
    }
  }

  // Obtener el div de alerta
  let divalert = document.querySelector(`#alerta${codigo}`);
  if (divalert) {
    // Crear el nuevo contenido de la alerta
    let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
    divalert.innerHTML = nuevoContenido;

    // Eliminar la alerta después del tiempo especificado
    setTimeout(() => {
      divalert.innerHTML = ``;
    }, timeoutDuration);
  }
}
