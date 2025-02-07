import { conservacion_config } from "../conservacion/conservacion.js";
import { Editar_table_fila } from "../funciones/editar_fila_table.js";
import { Editar_tabla_celda } from "../funciones/dbc_editar_celda_table.js";
import * as listarFunctions from "../funciones/listar.js";
import { actualizarSelectProduccion_condicion } from "../funciones/listar_select.js";
import { URL_APIP } from "../../../../lib/services.js";
import { etapas_produccion_config } from "../etapas_produccion/etapas_produccion.js";
import { codigos } from "./constantes.js";
import { modal_editar_producto } from "./editar.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let app = "";

let List_Producto = [];
let list_rubro = [];
let list_unidadTiempo = [];

let list_categoria = [];
let list_medida = [];
let list_estados = [];
let list_unidad = [];

let obt_producto_aux = {
  id: 0,
  nombre: "",
  codigo: "",
  estado: 0,
  medida: 0,
  rubro: 0,
  seccion: 0,
  idestandar: 0,
  cantidad: 0,
  tiempo: 0,
  unidadtiempo: 0,
};
let privilegios;

const codigo = codigos.codigoPrincipal;
let code_;
let permisos_;
let refrescar_;
function rand() {
  const indice = Math.floor(Math.random() * 26);
  const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  return String.fromCharCode(65 + indice) + codigo;
}

export function productoConfig(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  console.log(privilegios);
  app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);

  document
    .querySelector(`button[id^="refrescar"][id$="${code}"]`)
    .addEventListener("click", function () {
      sitio();
    });

  sitio();
}

export function llenar_select_sbMenu_actual(arrayp) {
  const configuracionesSelects = [
    {
      lista: list_rubro,
      id_html: "rubro",
      campos: ["id", "rubro"],
      condicion: "",
      variable: "",
    },
    {
      lista: list_unidadTiempo,
      id_html: "unidadtiempo",
      campos: ["id", "unidad"],
      condicion: "",
      variable: "",
    },
    {
      lista: list_estados,
      id_html: "idestadosproductos_p",
      campos: ["id", "tipos_estado"],
      condicion: "",
      variable: "",
    },
    {
      lista: list_unidad,
      id_html: "idunidad_p",
      campos: ["id", "nombre"],
      condicion: "",
      variable: "",
    },
    {
      lista: list_categoria,
      id_html: "idcategorias_p",
      campos: ["id_categorias", "nombre"],
      condicion: document.getElementById(`rubro${codigo}`).value
        ? document.getElementById(`rubro${codigo}`).value
        : list_rubro[0].id,
      variable: "rubro_idrubro",
    },
    {
      lista: list_medida,
      id_html: "idmedida_p",
      campos: ["id_medida", "nombre_medida"],
      condicion: document.getElementById(`rubro${codigo}`).value
        ? document.getElementById(`rubro${codigo}`).value
        : list_rubro[0].id,
      variable: "rubro_idrubro",
    },
  ];

  configuracionesSelects.forEach((config, index) => {
    // Ahora tienes acceso al índice con `index`
    if (arrayp.includes(index)) {
      actualizarSelectProduccion_condicion(
        codigo,
        config.lista,
        config.id_html,
        config.campos,
        config.condicion,
        config.variable
      );
    }
  });
}

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_api_general(
        "listar_caracteristica_comercial",
        idEmpresa
      ),
      listarFunctions.listar_api_general(
        "listar_categorias_comercial",
        idEmpresa
      ),
      listarFunctions.listar_api_general("listar_rubro", idEmpresa),
      listarFunctions.listar_api_general("listar_estados_productos", idEmpresa),
      listarFunctions.listar_api_general("listar_unidad_producto", idEmpresa),
      listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),
      listarFunctions.listar_api_general("listar_unidad_tiempo", ""),
    ]);

    // Asignamos los resultados a las variables correspondientes
    list_medida = resultados[0];
    list_categoria = resultados[1];
    list_rubro = resultados[2];
    list_estados = resultados[3];
    list_unidad = resultados[4];
    List_Producto = resultados[5];
    list_unidadTiempo = resultados[6];
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1] = dataid.split(",");
  switch (funcion) {
    case "eliminar_producto":
      eliminar_producto(id1);
      break;

    case "editar_producto_comercial":
      toggleEditSave(id1);
      break;

    case "editar_estado_producto":
      editar_estado_producto(event);
      break;
    case "configuracion":
      addModal(id1);
      break;

    case "etapas_produccion":
      modaletapasproduccion(id1);
      break;
    // Agrega otros casos según sea necesario
    default:
      sitio();
      break;
  }
}
function modaletapasproduccion() {
  let containerOpen = document.getElementById(`content-area${codigo}`);
  containerOpen.style.display = "block";
  let containerClosed = document.getElementById(`principal${codigo}`);
  containerClosed.style.display = "none";
  console.log("Listo ----------------");
  etapas_produccion_config(codigo, List_Producto);
}
function producto_conservacion() {
  let containerOpen = document.getElementById(`content-area${codigo}`);
  containerOpen.style.display = "block";
  let containerClosed = document.getElementById(`principal${codigo}`);
  containerClosed.style.display = "none";
  conservacion_config(codigo, List_Producto);
}

function toggleEditSave(id) {
  modal_editar_producto(code_, permisos_, refrescar_, id);
  // const permisos = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  // const opciones_select = [6, 7, 8, 9, 10, 13];
  // const opciones_number = [11, 12];
  // const names = [
  //   "nombre",
  //   "codigo",
  //   "descripcion",
  //   "cod_barras",
  //   "idcategorias_p",
  //   "idmedida_p",
  //   "idestadosproductos_p",
  //   "idunidad_p",
  //   "rubro",
  //   "cantidad",
  //   "tiempo",
  //   "unidadtiempo",
  // ];
  // const names2 = [
  //   "nombre",
  //   "codigo",
  //   "descripcion",
  //   "cod_barras",
  //   "categorias_id_categorias",
  //   "medida_id_medida",
  //   "estados_productos_id_estados_productos",
  //   "unidad_id_unidad",
  //   "rubro_idrubro",
  //   "cantidad",
  //   "tiempo_produccion",
  //   "Unidad_tiempo_idUnidad_tiempo",
  // ];
  // const url_api = "editar_producto_comercial";
  // const ver = "ver";
  // const nom_v_Emp = "empresa";
  // const md5 = uk[0].empresa.idempresa;
  // const id = "idproduct_comercial";
  // Editar_table_fila(
  //   event,
  //   codigo,
  //   List_Producto,
  //   permisos,
  //   names,
  //   names2,
  //   opciones_select,
  //   opciones_number,
  //   url_api,
  //   ver,
  //   nom_v_Emp,
  //   md5,
  //   id
  // );
}
function edit_Celda_table(e) {
  const elementos_select = [
    "rubro",
    "subproducto",
    "seccion",
    "unidadtiempo",
    "idcategorias_p",
    "idmedida_p",
    "idestadosproductos_p",
    "idunidad_p",
  ];
  const elementos_number = ["cantidad", "tiempo"];
  const url_api = "editar_producto_comercial";
  const ver = "ver";
  const nom_v_Emp = "empresa";
  const md5 = uk[0].empresa.idempresa;
  const id = "idproduct_comercial";

  Editar_tabla_celda(
    e,
    List_Producto,
    codigo,
    elementos_select,
    elementos_number,
    url_api,
    ver,
    nom_v_Emp,
    md5,
    id
  );
}
function eliminar_producto(id) {
  if (confirm("Desea Eliminar..?")) {
    fetch(`${URL_APIP}/api/eliminar_producto/${id}`)
      .then((res) => res.json())
      .then((data) => {
        obt_producto_aux = {
          ...List_Producto.find(
            (obj) => obj.idproduct_comercial === Number(id)
          ),
        };
        alertas(data);
      });
  }
}

function editar_estado_producto(event) {
  const boton = event.currentTarget;
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1] = dataid.split(",");
  let objeto = List_Producto.find(
    (obj) => obj.idproduct_comercial === Number(id1)
  );
  console.log(List_Producto);
  console.log(objeto);
  let est =
    objeto.estado == 0
      ? `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`
      : `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>`;

  const formData = new FormData();
  formData.append("ver", funcion);
  formData.append("id", id1);

  formData.append("estado", objeto.estado === 0 ? 1 : 0);
  objeto.estado = objeto.estado === 0 ? 1 : 0;
  sendformData(event, formData);
  console.log("Cambio de estado confirmado");
  boton.innerHTML = est;
}

async function sitio() {
  let view = `
         <div class="row">
            <div class="col-md-4 mb-3 " id="menu">
            
                <nav class="nav nav-pills nav-fill">
                    <li class="nav-item">
                        <button class="nav-link active" data-section="INICIO_HOME" style="background-color:blue; color:white;">Producto</button>
                    </li>
                
                    <li class="nav-item">
                        <button class="nav-link" data-section="producto_conservacion" style="background-color:white; color:black;">Conservacion producto</button>
                    </li>
                    
                    <li class="nav-item">
                        <button class="nav-link" data-section="estndar_producto" style="background-color:white; color:black;">Estandar producto</button>
                    </li>
                    
                </nav>
            
            </div>
            <div class="col-md-2 mb-3 " >
                <div class="row">
                    <label for="rubro" class="form-label">Linea de produccion:</label>
                    <select class="form-select" id="rubro${codigo}" name="rubro">
                        <option value="" disabled selected>Seleccione un rubro</option>
                        
                    </select>
                </div>
            </div>
            
        </div>
        
        <div class="container" id="principal${codigo}">
            <h5 class="text-center mb-4 fw-bold fs-6" >Productos</h5>
            
            <form class="" id="formulario${codigo}" style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <input type="hidden" name="ver" value="registro_producto_comercial">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
               
                <div class="row">
                    <label for="seccion" class="form-label fw-bold fs-6">Datos producto</label>

                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="nombre">Nombre del Producto</label>
                            <input type="text" class="form-control" id="nombre" name="nombre" required>
                        </div>
                        <div class="form-group">
                            <label for="codigo">Código</label>
                            <input type="text" class="form-control" id="codigo" name="codigo" required>
                        </div>
                        <div class="form-group">
                            <label for="cod_barras">Código de Barras</label>
                            <input type="text" class="form-control" id="cod_barras" name="cod_barras" required>
                        </div>
                        
                    </div>
                    <div class="col-md-3">
                       
                        <div class="form-group">
                            <label for="idcategorias_p">Categoría</label>
                            <select class="form-select" id="idcategorias_p${codigo}" name="idcategorias_p" required>
                                
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="idmedida_p">Caracteristicas</label>
                            <select class="form-select" id="idmedida_p${codigo}" name="idmedida_p" required>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="imagen">Imagen</label>
                            <input type="file" class="form-control" id="imagen" name="imagen">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="idestadosproductos_p">Estado del Producto</label>
                            <select class="form-select" id="idestadosproductos_p${codigo}" name="idestadosproductos_p" required>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="idunidad_p">Medida</label>
                            <select class="form-select" id="idunidad_p${codigo}" name="idunidad_p" required>
                            </select>
                        </div>
                        
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="descripcion">Descripción</label>
                            <textarea class="form-control" id="descripcion" name="descripcion" rows="3" required></textarea>
                        </div>                       
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="form-group">
                            <label for="estado" class="form-label">Seleccione condición</label>
                            <select class="form-select" id="estado${codigo}" name="estado">
                                <option value="0">Activo</option>
                                <option value="1">Inactivo</option>
                            </select>
                        </div>
                    </div>
                   
                    <div class="col-md-6 mb-3" >
                        <div class="form-group">
                            <label for="subproducto" class="form-label">Tipo producto</label>
                            <select class="form-select" id="subproducto${codigo}" name="subproducto">
                                <option value="0">Producto</option>
                                <option value="1">SubProducto</option>
                            </select>
                            
                        </div>
                    </div>
                    
                </div>
                <label for="" class="form-label fw-bold fs-6">Estandar produccion</label>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="cantidad" class="form-label">Cantidad producción:</label>
                            <input type="number" class="form-control" id="cantidad" value="" name="cantidad"  step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="tiempo" class="form-label">Tiempo producción:</label>
                            <input type="number" class="form-control" id="tiempo" name="tiempo" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="unidadtiempo" class="form-label">Unidad de Tiempo:</label>
                            <select class="form-select" id="unidadtiempo${codigo}" name="unidadtiempo">
                                
                            </select>
                        </div>
                    </div>
                </div>

                
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>

            </form>
            <div id="alerta${codigo}" class="mt-4"></div>
            
            
            <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1" ><i class="bi bi-plus"></i></button>
            <div class="mt-4" id="tableProducto${codigo}" style="display: block; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <label for="filtro" class="form-label">Buscar:</label>

                        <input type="text" id="filtro${codigo}" placeholder="Buscar en la tabla..." class="form-control form-control-sm">
                        
                    </div>
                    <div class="col-md-2">
                        <label for="Item" class="form-label">Items:</label>
                        <select class="form-select" id="item${codigo}" name="item">
                            <option value="" disabled selected>Seleccione un item</option>
                            <option value="idcategorias_p">Categoria</option>
                            <option value="idunidad_p">Medida</option>
                            <option value="idmedida_p">Caracteristicas</option>
                            <option value="idestadosproductos_p">Estados</option>

                        </select>
                    </div>
                    <div class="col-md-2">
                        <label for="Opciones" class="form-label">Opciones:</label>
                        
                        <select class="form-select" id="Opciones${codigo}" name="Opciones">
                            <option value=""></option>

                        </select>
                    </div>
                     <div class="col-md-2 mt-4">
                        
                        <button type="button" class="btn btn-primary" id="cancelarfiltro${codigo}"><i class="bi bi-x-circle"></i></button>

                    </div>
                   
                    
                </div>
                <div style = "max-height: 400px; overflow-y: auto; display: block;">
                
                    <table class="table table-bordered table-hover table-striped" id = "editableTable${codigo}">
                        <thead >
                            <tr class="table-dark">
                                <th>N°</th>
                                <th>Fecha Registro</th>
                                <th>Nombre</th>
                                <th>Código</th>
                                <th>Descripción</th>
                                <th>Código de Barras</th>
                                <th>Categoría</th>
                                <th>Caracteristica</th>
                                <th>Estado Producto</th>
                                <th>Unidad medida</th>
                                <th>Rubro</th>
                                <th>Tipo Producto</th>
                                <th>Cantidad</th>
                                <th>Tiempo Producción</th>
                                <th>Unidad Tiempo</th>                               
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="listar_productos_comercial${codigo}">
                           
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
        
        <div id="content-area${codigo}"></div>
    `;
  await listar();
  app.innerHTML = view;

  llenar_select_sbMenu_actual([0, 1, 2, 3, 4, 5]);

  listar_productos_comercial_Array();
  const selectrubro = document.querySelector(`#rubro${codigo}`);
  filtrar_por_rubros();

  selectrubro.addEventListener("change", function () {
    filtrar_por_rubros();
    setTimeout(() => llenar_select_sbMenu_actual([4, 5]), 50);
  });

  const forme = document.querySelector(`#formulario${codigo}`);
  forme.addEventListener("submit", (e) => sendform(e, forme));
  const selectItems = document.querySelector(`#item${codigo}`);

  selectItems.addEventListener("change", function () {
    obtenerDatosfiltracion(selectItems);
  });

  const btncancelarFiltro = document.querySelector(`#cancelarfiltro${codigo}`);
  btncancelarFiltro.addEventListener("click", function () {
    CancelarFiltracion();
  });
  const input = document.getElementById(`filtro${codigo}`);
  input.addEventListener("keyup", function () {
    filtrar_table(input);
  });

  const selectopciones = document.querySelector(`#Opciones${codigo}`);
  selectopciones.addEventListener("change", function () {
    filtrar_table(input);
  });
  const table = document.getElementById(`editableTable${codigo}`);
  table.addEventListener("dblclick", (e) => edit_Celda_table(e));

  const tableprod = document.querySelector(`#tableProducto${codigo}`);

  const toggleButton = document.getElementById(`toggleButton${codigo}`);
  toggleButton.addEventListener("click", (e) =>
    toggleFormTable(e, toggleButton, forme, tableprod)
  );
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
}
function filtrar_por_rubros() {
  // const selectItems = document.querySelector(`#rubro${codigo}`);
  // const selectedValue = selectItems.value;
  const selectrubro = document.querySelector(`#rubro${codigo}`);
  const selectedOpcText = selectrubro.options[selectrubro.selectedIndex].text;

  let selectedColumnIndex = 10;
  const tabla = document.querySelector(`#editableTable${codigo}`);
  const filas = tabla.getElementsByTagName("tr");

  for (let i = 1; i < filas.length; i++) {
    const celdas = filas[i].getElementsByTagName("td");

    if (celdas[selectedColumnIndex]) {
      const valorCelda =
        celdas[selectedColumnIndex].textContent ||
        celdas[selectedColumnIndex].innerText;

      if (valorCelda.trim() !== selectedOpcText.trim()) {
        filas[i].style.display = "none";
      } else {
        filas[i].style.display = "";
      }
    } else {
      filas[i].style.display = "none";
    }
  }
}

function filtrarBusqueda() {
  let selectedColumnIndex;
  const selectItems = document.querySelector(`#item${codigo}`);
  const selectedValue = selectItems.value;

  const selectopciones = document.querySelector(`#Opciones${codigo}`);
  const selectedOpcValue = selectopciones.value;
  const selectedOpcText =
    selectopciones.options[selectopciones.selectedIndex].text;

  console.log(selectedValue);
  console.log(selectedOpcValue);
  console.log(selectedOpcText);

  // Asignar el índice de columna basado en el valor seleccionado
  switch (selectedValue) {
    case "rubro":
      selectedColumnIndex = 10;
      break;
    case "idcategorias_p":
      selectedColumnIndex = 6;
      break;
    case "idunidad_p":
      selectedColumnIndex = 9;
      break;
    case "idmedida_p":
      selectedColumnIndex = 7;
      break;
    case "idestadosproductos_p":
      selectedColumnIndex = 8;
      break;
    default:
      console.error("Columna no válida seleccionada.");
      return; // Si no se selecciona una columna válida, salir de la función
  }

  filtrarColumna(selectedColumnIndex, selectedOpcText);
}

function filtrarColumna(selectedColumnIndex, selectedOpcText) {
  const tabla = document.querySelector(`#editableTable${codigo}`);
  const filas = tabla.getElementsByTagName("tr");

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];

    if (fila.style.display === "none") {
      continue;
    }

    const celdas = fila.getElementsByTagName("td");

    if (celdas[selectedColumnIndex]) {
      const valorCelda =
        celdas[selectedColumnIndex].textContent ||
        celdas[selectedColumnIndex].innerText;

      if (valorCelda.trim() !== selectedOpcText.trim()) {
        fila.style.display = "none";
      } else {
        fila.style.display = ""; // Mostrar la fila si coincide
      }
    } else {
      // Si no hay celda en esa columna, ocultar la fila
      fila.style.display = "none";
    }
  }
}

function CancelarFiltracion() {
  const tabla = document.querySelector(`#editableTable${codigo}`);
  const filas = tabla.getElementsByTagName("tr");

  for (let i = 1; i < filas.length; i++) {
    filas[i].style.display = "";
  }
  const selectopciones = document.querySelector(`#Opciones${codigo}`);
  selectopciones.innerHTML = '<option value=""></option>';
  filtrar_por_rubros();
}

function obtenerDatosfiltracion(selectItems) {
  const selectopciones = document.querySelector(`#Opciones${codigo}`);

  const selectedValue = selectItems.value;
  const htmlopciones = document.querySelector(
    `#${selectedValue}${codigo}`
  ).innerHTML;

  selectopciones.innerHTML =
    `<option value="" disabled selected>Seleccione un opción</option>` +
    htmlopciones;
  console.log(htmlopciones);
}
function mostrarSeccion(section) {
  const contentArea = document.getElementById(`content-area${codigo}`);
  contentArea.innerHTML = "";
  switch (section) {
    case "etapasproduccion":
      modaletapasproduccion();
      break;

    case "producto_conservacion":
      producto_conservacion();
      break;

    case "INICIO_HOME":
      let containerClosed = document.getElementById(`content-area${codigo}`);
      containerClosed.style.display = "none";
      let containerOpen = document.getElementById(`principal${codigo}`);
      containerOpen.style.display = "block";
      break;
    default:
      contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
      break;
  }
}

function toggleFormTable(e, toggleButton, forme, tableprod) {
  if (forme.style.display === "none") {
    forme.style.display = "block";
    setTimeout(() => {
      forme.style.height = forme.scrollHeight + "px";
      forme.style.opacity = 1;
    }, 10);

    tableprod.style.height = "0";
    tableprod.style.opacity = 0;
    setTimeout(() => {
      tableprod.style.display = "none";
    }, 500);
    toggleButton.classList.remove("btn-outline-success");
    toggleButton.classList.add("btn-outline-danger");
    toggleButton.innerHTML = `<i class="bi bi-dash-lg danger"></i>`;
  } else {
    tableprod.style.display = "block";
    setTimeout(() => {
      tableprod.style.height = tableprod.scrollHeight + "px";
      tableprod.style.opacity = 1;
    }, 10);

    forme.style.height = "0";
    forme.style.opacity = 0;
    setTimeout(() => {
      forme.style.display = "none";
    }, 500);

    toggleButton.classList.remove("btn-outline-danger");
    toggleButton.classList.add("btn-outline-success");
    toggleButton.innerHTML = `<i class="bi bi-plus"></i>`;
  }
}
function filtrar_table(input) {
  filtrar_por_rubros();
  filtrarBusqueda();
  const selectrubro = document.querySelector(`#rubro${codigo}`);
  const selectedOpcText =
    selectrubro.options[selectrubro.selectedIndex].text.toLowerCase();

  const selectopciones = document.querySelector(`#Opciones${codigo}`);
  const selectedOpcText2 =
    selectopciones.options[selectopciones.selectedIndex].text.toLowerCase();

  const table = document.getElementById(`editableTable${codigo}`);
  const tbody = table.getElementsByTagName("tbody")[0];
  const rows = tbody.getElementsByTagName("tr");

  const filter = input.value.toLowerCase(); // Capturar el valor del input filtrado

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let cells = row.getElementsByTagName("td");
    let rowText = "";
    if (row.style.display !== "none") {
      for (let j = 0; j < cells.length; j++) {
        rowText += cells[j].textContent.toLowerCase() + " ";
      }

      if (rowText.includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }
  }
}

function areObjectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}
function createSelectElement(inpKey) {
  const elementId = `${inpKey}${codigo}`;
  console.log(elementId);
  const innerHTMLContent = document.querySelector(`#${elementId}`).innerHTML;
  if (!innerHTMLContent) return null;

  const select = document.createElement("select");
  select.className = "form-select";
  select.name = inpKey;
  select.innerHTML = innerHTMLContent;
  return select;
}

function listar_productos_comercial() {
  return fetch(
    `${URL_APIP}/api/listar_productos_comercial/${uk[0].empresa.idempresa}`
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      List_Producto.length = 0;
      List_Producto = data;
      console.log(List_Producto);
      listar_productos_comercial_Array();
    });
}

function listar_productos_comercial_Array() {
  const listar = document.querySelector(`#listar_productos_comercial${codigo}`);
  let view = "",
    ind = 1;
  console.log(List_Producto);
  console.log(list_categoria);
  console.log(list_medida);
  List_Producto.map((lista) => {
    let estados;
    let actualizar;
    let eliminar;
    let tipo = lista.subproducto === 0 ? "Producto" : "SubProducto";
    let est =
      lista.estado === 0
        ? `<i class="bi bi-hand-thumbs-up-fill" style = "color : blue"></i>`
        : `<i class="bi bi-hand-thumbs-down-fill" style = "color : red"></i>`;

    let itemrubro = list_rubro.find(
      (obj) => Number(obj.id) === Number(lista.rubro_idrubro)
    ) || {
      id: 0,
      rubro: "-",
      detalle: "-",
    };

    let itemunidadTiempo = list_unidadTiempo.find(
      (obj) => Number(obj.id) === Number(lista.Unidad_tiempo_idUnidad_tiempo)
    ) || {
      id: 0,
      unidad: "-",
    };
    let itemcategoria = list_categoria.find(
      (obj) =>
        Number(obj.id_categorias) === Number(lista.categorias_id_categorias)
    ) || {
      id: -1,
      nombre: "-",
      descripcion: "-",
      estado: "-",
    };
    let item_medida_cm = list_medida.find(
      (obj) => Number(obj.id_medida) === Number(lista.medida_id_medida)
    ) || {
      id: -1,
      nombre_medida: "-",
      descripcion: "-",
      estado: -1,
    };

    let item_estado_cm = list_estados.find(
      (obj) =>
        Number(obj.id) === Number(lista.estados_productos_id_estados_productos)
    ) || {
      id: -1,
      tipos_estado: "-",
      descripcion: "-",
      estado: "",
    };
    let item_unidad_cm = list_unidad.find(
      (obj) => Number(obj.id) === Number(lista.unidad_id_unidad)
    ) || {
      id: -1,
      nombre: "-",
      descripcion: "-",
      estado: -1,
    };
    estados = {
      0: ``,
      1: `<a data-id="editar_estado_producto,${lista.idproduct_comercial}"  class="btn">
                        ${est}
                    </a>
                    
                    `,
    };
    actualizar = {
      0: ``,
      1: `
                     
                    <div class="text-center">
                        <a data-id="editar_producto_comercial,${lista.idproduct_comercial}"
                        class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Editar producto">
                            <i class="bi bi-pencil-square fs-5"></i>
                        </a>
                        <span class="d-block mt-1 small"></span>
                    </div>
                    `,
    };
    eliminar = {
      0: ``,
      1: `
                    <div class="text-center">
                        <a  data-id="eliminar_producto,${lista.idproduct_comercial}"
                        class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                        style="width: 2.5rem; height: 2.5rem;"
                        title="Eliminar producto">
                            <i class="bi bi-trash fs-5"></i>
                        </a>
                        <span class="d-block mt-1 small"></span>
                    </div>
                    `,
    };
    view += `
                <tr style = "style=width: 50px; height: 50px;" >
                    <td>${ind++}</td>                
                    <td >${lista.fecha_registro}</td>

                    <td data-type="${lista.idproduct_comercial},nombre">${
      lista.nombre
    }</td>
                    <td data-type="${lista.idproduct_comercial},codigo">${
      lista.codigo
    }</td>
                    <td data-type="${lista.idproduct_comercial},descripcion">${
      lista.descripcion
    }</td>
                    <td data-type="${lista.idproduct_comercial},cod_barras">${
      lista.cod_barras
    }</td>
                    
                    <td data-type="${
                      lista.idproduct_comercial
                    },idcategorias_p,categorias_id_categorias">${
      itemcategoria.nombre
    }</td>
                    <td data-type="${
                      lista.idproduct_comercial
                    },idmedida_p,medida_id_medida">${
      item_medida_cm.nombre_medida
    }</td>
                    <td data-type="${
                      lista.idproduct_comercial
                    },idestadosproductos_p,estados_productos_id_estados_productos">${
      item_estado_cm.tipos_estado
    }</td>
                    <td data-type="${
                      lista.idproduct_comercial
                    },idunidad_p,unidad_id_unidad">${item_unidad_cm.nombre}</td>

                    <td data-type="${
                      lista.idproduct_comercial
                    },rubro,rubro_idrubro">${itemrubro.rubro}</td>
                    <td data-type="${
                      lista.idproduct_comercial
                    },subproducto,subproducto">${tipo}</td>
                    <td data-type="${
                      lista.idproduct_comercial
                    },cantidad,cantidad">${
      lista.cantidad !== null ? lista.cantidad : "-"
    }</td>
                    <td data-type="${
                      lista.idproduct_comercial
                    },tiempo,tiempo">${
      lista.tiempo_produccion !== null ? lista.tiempo_produccion : "-"
    }</td>
                    <td data-type="${
                      lista.idproduct_comercial
                    },unidadtiempo,Unidad_tiempo_idUnidad_tiempo">${
      itemunidadTiempo.unidad
    }</td>

                    <td>
                      <img 
                      src="${URL_APIP + lista.imagen}" 
                      alt="${lista.nombre}" 
                      style="width: 50px; height: 50px;" 
                      >
                    </td>
                    <td  style="text-align: center; vertical-align: middle;">
                         ${estados[privilegios[2]]}
                    </td>

                    <td>
                        <div class="d-flex gap-3">
                            ${actualizar[privilegios[2]]}
                            ${eliminar[privilegios[3]]} 
                        </div>
                    </td>
                </tr>        
            `;
  });
  listar.innerHTML = view;

  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menu);
  });
}

function sendform(e, form) {
  e.preventDefault();

  const dato = new FormData(form);
  const now = new Date();
  const offset = -4; // Bolivia es UTC-4
  now.setHours(now.getHours() + offset);

  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}:${seconds}`;

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const currentDate = `${year}-${month}-${day}`;
  const selectItems = document.querySelector(`#rubro${codigo}`);
  const selectedValue = selectItems.value;
  dato.append("rubro", selectedValue);
  dato.append("fecha_registro", currentDate);

  for (let [key, value] of dato.entries()) {
    console.log(key, value);
  }
  fetch(`${URL_APIP}/api/`, {
    method: "POST",
    body: dato,
  })
    .then((res) => res.json())
    .then((data) => {
      alertas(data);
    });
}

function sendformData(event, formData) {
  event.preventDefault();

  fetch(`${URL_APIP}/api/`, {
    // Reemplaza esto con la URL de tu servidor
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alertas(data);
    })
    .catch((error) => {
      console.error("Error al enviar los datos:", error);
    });
}

function alertas(data) {
  console.log(data);
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "ok") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;
    if (data[2] == "editar_estado_producto") {
      return;
    }
    // Resetear el formulario si existe
    let formulario = document.querySelector(`#formulario${codigo}`);
    if (formulario) {
      formulario.reset();
    }

    if (data[2] === "registrar_producto") {
      listar_productos_comercial();
      const forme = document.querySelector(`#formulario${codigo}`);
      const tableprod = document.querySelector(`#tableProducto${codigo}`);
      let e;
      const toggleButton = document.getElementById(`toggleButton${codigo}`);
      toggleFormTable(e, toggleButton, forme, tableprod);
    }

    if (data[2] === "eliminar_producto") {
      List_Producto = List_Producto.filter(
        (obj) => obj.id !== Number(obt_producto_aux["id"])
      );
      listar_productos_comercial_Array();
      obt_producto_aux = {
        ...{
          id: 0,
          nombre: "",
          codigo: "",
          estado: 0,
          medida: 0,
          rubro: 0,
          seccion: 0,
          idestandar: 0,
          cantidad: 0,
          tiempo: 0,
          unidadtiempo: 0,
        },
      };
    }
    if (data[2] === "editar_producto_comercial") {
      obt_producto_aux = {
        ...{
          id: 0,
          nombre: "",
          codigo: "",
          estado: 0,
          medida: 0,
          rubro: 0,
          seccion: 0,
          idestandar: 0,
          cantidad: 0,
          tiempo: 0,
          unidadtiempo: 0,
        },
      };
    }
  } else {
    if (data[0] == "Error") {
      if (data[2] === "editar_producto_comercial") {
        const obj = List_Producto.find(
          (ob) => ob.id === obt_producto_aux["id"]
        );

        console.log(obt_producto_aux);

        console.log(obj);
        if (obt_producto_aux) {
          Object.assign(obj, obt_producto_aux);
        }
        console.log(obt_producto_aux);

        console.log(obj);
        console.log(List_Producto);

        listar_productos_comercial_Array();

        obt_producto_aux = {
          ...{
            id: 0,
            nombre: "",
            codigo: "",
            estado: 0,
            medida: 0,
            rubro: 0,
            seccion: 0,
            idestandar: 0,
            cantidad: 0,
            tiempo: 0,
            unidadtiempo: 0,
          },
        };
      }
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
