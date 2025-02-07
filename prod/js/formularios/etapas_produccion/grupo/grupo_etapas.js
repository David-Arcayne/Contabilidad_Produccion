import { URL_APIP } from "../../../../../lib/services.js";
import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;

let Lista_empleados = [];
let Lista_etapas_produccion = [];
let Lista_seccion = [];
let Lista_etapa_orden = [];
let Objeto_etapa_orden = {};
let Lista_grupo_etapas = [];
let grupo_detalle = [];
let Lista_rubro = [];
const codigo = codigos.codigoGrupo_crear;


function manejarClick(event) {
  sitio();
  // Eliminar el evento click después de ejecutarlo
  event.target.removeEventListener("click", manejarClick);
}
export async function registro_grupo_agregar_etapa(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  codigo_ = codigo;
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);
  document.querySelector(`button[id^="refrescar"][id$="${code_}"]`).addEventListener("click", registro_grupo_agregar_etapa.bind(code, permisos, refrescar));

  sitio();
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_api_general('getempleado',idEmpresa),
      listarFunctions.listar_api_general('listar_etapas_produccion',idEmpresa),
      listarFunctions.listar_api_general('listar_api_general',idEmpresa),
      listarFunctions.listar_api_general_verd('listar_grupo_etapas',idEmpresa),
      listarFunctions.listar_api_general('listar_rubro',idEmpresa),

    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_empleados = resultados[0];
    Lista_etapas_produccion = resultados[1];
    Lista_seccion = resultados[2];
    Lista_grupo_etapas = resultados[3];
    Lista_rubro = resultados[4];
    console.log(Lista_grupo_etapas);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    default:
      sitio();
      break;
  }
}

function select_etapas_produccion_insertar_grupo() {
  console.log("listo");
  const rubros_select = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );

  const select_ = document.querySelector(`#agregar_etapas${codigo}`);
  if (!select_ || !rubros_select) {
    console.error("No se encontraron los elementos del DOM.");
    return;
  }
  let idrubro = rubros_select.value;
  let view = "";
  Lista_etapas_produccion.map((lista) => {
    if (Number(lista.rubro_idrubro) === Number(idrubro)) {
      let itemseccion = Lista_seccion.find(
        (obj) => Number(obj.id) === Number(lista.seccion_idseccion)
      ) || {
        id: 0,
        nombre_seccion: "Nulo",
        ubicacion: "Nulo",
        codigo_seccion: "Nulo",
      };
      view += `
                    <option value="${lista.idetapas_produccion}">
                        Etapa producción: ${lista.nombre_etapa} | Sección:  ${itemseccion.codigo_seccion} ${itemseccion.nombre_seccion}
                    </option>
                `;
    }
  });
  select_.innerHTML = view;
  console.log("lista rubro completa");
}

function Agregar_a_lista() {
  let nuevoObjeto;
  Objeto_etapa_orden = {};
  const elemento = document.getElementById(
    `grupo_etapas_idgrupo_etapas${codigo}`
  );
  let idgroup = 0;
  let nombre_grupo = "";

  if (elemento.tagName === "INPUT") {
    nombre_grupo = elemento.value;
  } else if (elemento.tagName === "SELECT") {
    idgroup = elemento.value;
  }
  if (nombre_grupo.length === 0 && idgroup === 0) {
    alert("Ingrese el nuevo nombre del grupo o selecione un grupo existente");
    return;
  }
  elemento.disabled = true;

  nuevoObjeto = {
    idetapa_orden: 0,
    orden: 0,
    etapas_produccion_idetapas_produccion: document.getElementById(
      `agregar_etapas${codigo}`
    ).value,
    grupo_etapas_idgrupo_etapas: idgroup,
  };

  Objeto_etapa_orden = {
    idgrupo_etapas: idgroup,
    nombre: nombre_grupo,
    empresa: uk[0].empresa.idempresa,
  };
  console.log(Objeto_etapa_orden);
  if (agregarOrdenProduccion(nuevoObjeto)) {
    Listar_orden_Etapas();
  }
}
function Listar_orden_Etapas() {
  const tablaListar = document.getElementById(`tabla_etapas_orden${codigo}`);
  let view = "",
    ind = 1;
  Lista_etapa_orden.map((lista) => {
    let itemEtapa = Lista_etapas_produccion.find(
      (obj) =>
        Number(obj.idetapas_produccion) ===
        Number(lista.etapas_produccion_idetapas_produccion)
    );
    console.log(Lista_etapa_orden);
    console.log(itemEtapa);
    console.log(lista);
    console.log(Lista_etapas_produccion);
    view += `
            <tr>
                <td>${ind++}</td>                
                <td data-type="${
                  lista.etapas_produccion_idetapas_produccion
                }" data-group="${lista.grupo_etapas_idgrupo_etapas}" data-id="${lista.idetapa_orden}">${itemEtapa.nombre_etapa}</td>
                <td>${itemEtapa.detalle}</td>
                <td>
                    <button class="btn btn-up"><i class="bi bi-arrow-up"></i></button>
                    <button class="btn btn-down"><i class="bi bi-arrow-down"></i></button>
                </td>
                <td>
                    <a data-id="eliminar,${
                      lista.etapas_produccion_idetapas_produccion
                    }" class="btn btn-danger btn-delete">
                        <i class="bi bi-trash"></i>
                    </a>                           
                </td>
            </tr>
        `;
  });
  tablaListar.innerHTML = view;

  // Agregar eventos a los botones de subir y bajar
  tablaListar.querySelectorAll(".btn-up").forEach((button) => {
    button.addEventListener("click", () => moverFila(button, "arriba"));
  });

  tablaListar.querySelectorAll(".btn-down").forEach((button) => {
    button.addEventListener("click", () => moverFila(button, "abajo"));
  });
  tablaListar.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", () => eliminar_producto(button));
  });
}
function eliminar_producto(button) {
  const row = button.closest("tr"); // Obtener la fila actual
  const cellWithType = row.querySelector("td[data-id]"); // Selecciona la celda con el atributo data-id
  const datatype = row.querySelector("td[data-type]"); // Selecciona la celda con el atributo data-type
  if (cellWithType) {
    const currentType = Number(cellWithType.getAttribute("data-id")); // Obtén el valor actual
    const etapa_idetapa = Number(datatype.getAttribute("data-type"));
    if (currentType !== 0) {
      cellWithType.setAttribute("data-id", -Math.abs(currentType)); // Cambia el valor a negativo
      // Opcional: Ocultar la fila si deseas que desaparezca visualmente después de marcarla
      row.style.display = "none";
    } else {
      //eliminar totalmente de la tabla
      row.remove();
      console.log(Lista_etapa_orden);
      console.log(currentType);
      Lista_etapa_orden = Lista_etapa_orden.filter(
        (item) =>
          Number(item.etapas_produccion_idetapas_produccion) !==
          Number(etapa_idetapa)
      );
      console.log(Lista_etapa_orden);
    }
  }
}
function moverFila(button, direction) {
  const row = button.closest("tr"); // Obtener la fila actual
  const tableBody = row.parentNode; // Cuerpo de la tabla es el padre de la fila

  if (direction === "arriba") {
    const previousRow = row.previousElementSibling;
    if (previousRow) {
      tableBody.insertBefore(row, previousRow); // Mover la fila hacia arriba
    }
  } else if (direction === "abajo") {
    const nextRow = row.nextElementSibling;
    if (nextRow) {
      tableBody.insertBefore(nextRow, row); // Mover la fila hacia abajo
    }
  }

  // Actualizar los números de fila (Nº) después de mover
  actualizarNumerosFila();
}

function actualizarNumerosFila() {
  const rows = document.querySelectorAll(`#tabla_etapas_orden${codigo} tr`);
  rows.forEach((row, index) => {
    row.querySelector("td:first-child").textContent = index + 1; // Actualizar el número de fila
  });
}

function agregarOrdenProduccion(nuevaOrden) {
  let existeEtapa = Lista_etapa_orden.some(
    (orden) =>
      orden.etapas_produccion_idetapas_produccion ===
      nuevaOrden.etapas_produccion_idetapas_produccion
  );
  if (!existeEtapa) {
    Lista_etapa_orden.push(nuevaOrden);
    Objeto_etapa_orden["etapas_ordenes"] = Lista_etapa_orden;
    console.log(Objeto_etapa_orden);
    return true;
  } else {
    alert("Etapa de produccion ya existe en la lista.");
    return false;
  }
}

function EditarGrupo() {
  const alv = document.getElementById(`registro_editar${codigo}`);
  let view = "";
  view = `
        <div class="row">
            <label for="registrar" class="form-label">Seleccionar Grupo</label>
            <select class="form-select" id="grupo_etapas_idgrupo_etapas${codigo}" name="registrar">
                
            </select>
        </div>
    `;
  alv.innerHTML = view;
  select_grupo_etapas_idgrupo_etapas();
}
function select_grupo_etapas_idgrupo_etapas() {
  const grupos = document.getElementById(
    `grupo_etapas_idgrupo_etapas${codigo}`
  );
  const rubros_select = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );

  if (!grupos || !rubros_select) {
    console.error("No se encontraron los elementos del DOM.");
    return;
  }
  let idrubro = rubros_select.value;
  let view = "";
  Lista_grupo_etapas.map((lista) => {
    //console.log(lista);
    //console.log(idrubro);
    if (Number(lista.rubro_idrubro) === Number(idrubro)) {
      view += `
                <option value="${lista.idgrupo_etapas}">${lista.nombre}</option>
            `;
    }
  });
  grupos.innerHTML = view;
}
function nuevogrupo() {
  const alv = document.getElementById(`registro_editar${codigo}`);
  let view = "";
  view = `
        <div class="row">
            <div class="col-md-12">
                <label for="nombre" class="form-label">Nombre Grupo etapas producción</label>
                <input type="text" class="form-control" id="grupo_etapas_idgrupo_etapas${codigo}" name="nombre" maxlength="60" placeholder="Ingresa el nombre del grupo" required>
            </div>
        </div>
    `;
  alv.innerHTML = view;
}

function listar_rubro() {
  console.log("listo");

  const listar2 = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  let view = "";
  Lista_rubro.map((lista) => {
    view += `
                <option value="${lista.id}">${lista.rubro}</option>
            `;
  });
  listar2.innerHTML = view;
}
async function sitio() {
  let view = "",
    ind = 1;
  view += `
            <div class="container mt-4" id="datos${codigo}">
                <div class="row">
                  <div class="col-md-3 mb-3 " >
                      <div class="row">
                          <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                          <select class="form-select" id="rubro_idrubro${codigos.codigoPrincipal}" name="rubro_idrubro">
                              <option value="" disabled selected>Seleccione un rubro</option>
                              
                          </select>
                      </div>
                  </div>
                  <div class="col-md-3 mb-3 ">
                      <div class="row">
                          <label for="registrar" class="form-label">Generar o actualizar grupo:</label>
                          <select class="form-select" id="seleccionar_opcion${codigo}" name="registrar">
                              <option value="0">Nuevo grupo</option>
                              <option value="1">Añadir a grupo existente</option>
                          </select>
                      </div>
                  </div>
                 
                </div>
                <div class="col-md-6 mb-3 " id="registro_editar${codigo}">
                        
                </div>
                <div class="col-md-12 mb-3 " id="div_etapas${codigo}">
                    <div class="row">
                        <label for="registrar" class="form-label">Agregar etapas producción:</label>
                        <select class="form-select" id="agregar_etapas${codigo}" name="registrar">
                            <option value="" disabled selected>Seleccione una etapa</option>
                            
                        </select>
                    </div>
                </div>

                <button type="button" class="btn btn-outline-success mr-1 mt-4" id="llenar_lista${codigo}" aria-label="Agregar">Agregar Etapa</button>
                <div id="alerta${codigo}" class="mt-4"></div>

                

                <div class="container mt-5">
                    <table class="table table-bordered table-striped">
                        <thead >
                            <tr class="table-dark">
                                <th scope="col">Nº</th>
                                <th scope="col">Etapas producción</th>
                                <th scope="col">Detalle</th>
                                <th scope="col">Orden</th>
                                <th scope="col">Funciones</th>
                            </tr>
                        </thead>
                        <tbody  id="tabla_etapas_orden${codigo}">
                            
                        </tbody>
                    </table>
                </div>
                <div class="col-md-12 mt-3 d-flex justify-content-between">

                    <button type="button" class="btn btn-primary btn-sm" id="cancelar_etapa${codigo}">Cancelar</button>
                    <button type="button" class="btn btn-success btn-lg" id="registrara_lista_etapas${codigo}">Guardar</button>
                </div>
            </div>
        `;
  await listar();
  
  console.log(Lista_grupo_etapas);
  app.innerHTML = view;
  listar_rubro();
  select_etapas_produccion_insertar_grupo();
  nuevogrupo();

  const selectrubro = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );

  selectrubro.addEventListener("change", eventHandler);

  // Agrega el evento con el manejador

  const select_nuevo_editar = document.querySelector(
    `#seleccionar_opcion${codigo}`
  );

  // Evento para crear un input o un select según el valor de select_nuevo_editar
  select_nuevo_editar.addEventListener("change", function () {
    // Limpia el contenedor o el elemento padre donde está el input/select
    const contenedor = document.getElementById(`registro_editar${codigo}`); // Asegúrate de que este contenedor exista
    contenedor.innerHTML = ""; // Limpia cualquier elemento anterior

    if (select_nuevo_editar.value === "1") {
      // Crea el select y lo añade al contenedor
      EditarGrupo();
    } else {
      // Crea el input y lo añade al contenedor
      nuevogrupo();
    }

    Lista_etapa_orden = [];
    Listar_orden_Etapas();
    selectrubro.disabled = false;

    // Vuelve a seleccionar el elemento actualizado
    const select_grupo = document.querySelector(
      `#grupo_etapas_idgrupo_etapas${codigo}`
    );

    // Asegura que sea un SELECT y le agrega el listener
    if (select_grupo && select_grupo.tagName === "SELECT") {
      select_grupo.addEventListener("change", function () {
        grupo_detalle = Lista_grupo_etapas.find(
          (obj) => Number(obj.idgrupo_etapas) === Number(select_grupo.value)
        );
        console.log(grupo_detalle);
        listar_etapas_en_orden_existente(grupo_detalle);
      });
    } else {
      console.log("El elemento no es un select.");
    }
  });

  const btn_agregar_etp = document.getElementById(`llenar_lista${codigo}`);
  btn_agregar_etp.addEventListener("click", function () {
    const opcion_selec = document.getElementById(`seleccionar_opcion${codigo}`);
    let idvalue = opcion_selec.value;
    if (idvalue === "1" || idvalue === "0") {
      Agregar_a_lista();
      selectrubro.disabled = true;
    } else {
      alert("debe seleccionar una opcion");
    }
  });
  const btn_cancelar = document.getElementById(`cancelar_etapa${codigo}`);
  btn_cancelar.addEventListener("click", function () {
    Lista_etapa_orden = [];
    Listar_orden_Etapas();
    selectrubro.disabled = false;
    const elemento = document.getElementById(
      `grupo_etapas_idgrupo_etapas${codigo}`
    );
    elemento.disabled = false;
  });
  const btnregistrar_api = document.getElementById(
    `registrara_lista_etapas${codigo}`
  );
  btnregistrar_api.addEventListener("click", function () {
    const etapas = [];
    const rows = document.querySelectorAll(`#tabla_etapas_orden${codigo} tr`);

    rows.forEach((row, index) => {
      const dataTypeCell = row.querySelector("td[data-type]");
      const datagroup = row.querySelector("td[data-group]");
      const dataid = row.querySelector("td[data-id]");

      const dataType = dataTypeCell
        ? dataTypeCell.getAttribute("data-type")
        : null;
      const idgroup = datagroup ? datagroup.getAttribute("data-group") : null;
      const id = dataid ? dataid.getAttribute("data-id") : null;

      const etapa = {
        idetapa_orden: Number(id),
        grupo_etapas_idgrupo_etapas: Number(idgroup),
        etapas_produccion_idetapas_produccion: Number(dataType),
        orden: index + 1,
      };
      etapas.push(etapa);
    });

    prepararLista_enviar(etapas);

    console.log(Objeto_etapa_orden);
  });

  const navButtons = document.querySelectorAll("#menu .nav-link");

  navButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      navButtons.forEach((btn) => {
        btn.style.backgroundColor = "white";
        btn.style.color = "black";
      });

      this.style.backgroundColor = "blue";
      this.style.color = "white";
      const section = this.getAttribute("data-section");
      mostrarSeccion(section);
    });
  });
  async function eventHandler() {
    
      Lista_etapa_orden = [];
      select_etapas_produccion_insertar_grupo();
      nuevogrupo();
      //selectrubro.removeEventListener('change', eventHandler);
    
  }
}
function listar_etapas_en_orden_existente(grupo_etapas) {
  Lista_etapa_orden = [];
  grupo_etapas.detalles.map((lista) => {
    if (!agregarOrdenProduccion(lista)) {
      alert("Error al mostrar etapas en orden");
    }
  });
  Listar_orden_Etapas();
}

function prepararLista_enviar(etapas_ordenadas) {
  Lista_etapa_orden = [];

  Objeto_etapa_orden = {};
  const elemento = document.getElementById(
    `grupo_etapas_idgrupo_etapas${codigo}`
  );
  const rubro = document.getElementById(
    `rubro_idrubro${codigos.codigoPrincipal}`
  );

  let idgroup = 0;
  let nombre_grupo = "";
  if (elemento.tagName === "INPUT") {
    nombre_grupo = elemento.value;
  } else if (elemento.tagName === "SELECT") {
    idgroup = elemento.value;
  }

  Objeto_etapa_orden = {
    idgrupo_etapas: Number(idgroup),
    nombre: nombre_grupo,
    empresa: uk[0].empresa.idempresa,
    etapas_ordenes: [...etapas_ordenadas],
    rubro_idrubro: Number(rubro.value),
    verDavid: "registrar_grupo_etapas_ordenados",
  };
  if (nombre_grupo.length === 0 && idgroup === 0) {
    alert("Ingrese el nuevo nombre del grupo");
    return;
  }
  console.log(Objeto_etapa_orden);
  if (
    Objeto_etapa_orden.etapas_ordenes &&
    Objeto_etapa_orden.etapas_ordenes.length > 0
  ) {
    fetch(`${URL_APIP}api/`, {
      method: "POST", // Método HTTP
      headers: {
        "Usar-Registro-David": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Objeto_etapa_orden), // Convertir el objeto JS a JSON antes de enviarlo
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
function mostrarSeccion(section) {
  //const contentArea = document.getElementById(`filtrar${subcodigo}`);
  // contentArea.innerHTML = '';
  switch (section) {
    case "pendientes":
      //mostrar_pendientes();
      break;
    case "encurso":
      // mostrar_encurso();
      break;
    case "finalizados":
      //mostrar_finalizados();
      break;
    case "negativos":
      //mostrar_negativos();
      break;

    default:
      // contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
      break;
  }
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

    if (data[2] == "registrar_grupo_etapas_ordenados") {
      const elemento = document.getElementById(
        `rubro_idrubro${codigos.codigoPrincipal}`
      );
      elemento.disabled = false;
      sitio();
    }
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
