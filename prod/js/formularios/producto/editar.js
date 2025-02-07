import * as listarFunctions from "../funciones/listar.js";
import { URL_APIP } from "../../../../lib/services.js";
import { codigos } from "./constantes.js";
import { actualizarSelectProduccion_condicion } from "../funciones/listar_select.js";
import { alertas } from "./productos.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let List_Producto = [];
let list_rubro = [];
let list_unidadTiempo = [];

let list_categoria = [];
let list_medida = [];
let list_estados = [];
let list_unidad = [];

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
      listarFunctions.listar_api_general(
        "listar_productos_comercial",
        idEmpresa
      ),

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
let overlayy;
let app = "";
let code;
let privilegios;

let listas;
let id_Detalle;
let id;
const codigo = codigos.codigoEditar;
export function modal_editar_producto(code_, permisos, refrescar, id_) {
  app = document.querySelector(`.p-2[data-value="${code_}"] .card-body`);

  code = code_;

  id = id_;

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

async function sitio() {
  await listar();
  app.style.position = "relative";
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.cursor = "pointer";
  app.appendChild(overlay);
  const variable = document.createElement("div");
  variable.style.width = "1000px";
  variable.style.height = "580px";

  variable.style.backgroundColor = "white";
  variable.style.padding = "20px";
  variable.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.3)";
  variable.style.zIndex = "1001";
  variable.style.position = "relative";
  variable.style.cursor = "auto";
  variable.style.maxHeight = "680px";
  variable.style.overflowY = "auto";
  variable.style.display = "block";
  overlay.appendChild(variable);
  let item_producto = List_Producto.find(
    (Obj) => Number(Obj.idproduct_comercial) === Number(id)
  );
  let view = `
        <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>
         <div class="container" id="principal${codigo}">
            <h5 class="text-center mb-4 fw-bold fs-6" >Actualizar productos</h5>
            <div id="alerta${codigo}" class="mt-4"></div>
            <form class="" id="formulario${codigo}" >
                <input type="hidden" name="ver" value="editar_producto_comercial">
                <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
                <input type="hidden" name="id_productos" value="${item_producto.id_productos}">
                <div class="row">
                    <label for="seccion" class="form-label fw-bold fs-6">Datos producto</label>

                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="nombre">Nombre del Producto</label>
                            <input type="text" class="form-control" id="nombre" name="nombre" value ="${item_producto.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label for="codigo">Código</label>
                            <input type="text" class="form-control" id="codigo" name="codigo" value="${item_producto.codigo}" required>
                        </div>
                        <div class="form-group">
                            <label for="cod_barras">Código de Barras</label>
                            <input type="text" class="form-control" id="cod_barras" name="cod_barras" value="${item_producto.cod_barras}" required>
                        </div>
                        
                    </div>
                    <div class="col-md-3">
                       
                        <div class="form-group">
                            <label for="categorias_id_categorias">Categoría</label>
                            <select class="form-select" id="idcategorias_p${codigo}" name="categorias_id_categorias" required>
                                
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="medida_id_medida">Caracteristicas</label>
                            <select class="form-select" id="idmedida_p${codigo}" name="medida_id_medida" required>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="rubro_idrubro" class="form-label">Linea de produccion:</label>
                            <select class="form-select" id="rubro${codigo}" name="rubro_idrubro">
                                <option value="" disabled selected>Seleccione un rubro</option>
                                
                            </select>
                        </div>
                        
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="estados_productos_id_estados_productos">Estado del Producto</label>
                            <select class="form-select" id="idestadosproductos_p${codigo}" name="estados_productos_id_estados_productos" required>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="unidad_id_unidad">Medida</label>
                            <select class="form-select" id="idunidad_p${codigo}" name="unidad_id_unidad" required>
                            </select>
                        </div>
                        <div class="form-group">
                            
                                <label for="imagen" class="form-label">Imagen</label>
                                <input type="file" class="form-control" id="imagen" name="imagen">
                            
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="descripcion">Descripción</label>
                            <textarea  class="form-control" id="descripcion" name="descripcion" row="3"  required>${item_producto.descripcion}</textarea>
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
                            <input type="number" class="form-control" id="cantidad"  name="cantidad"  step="0.01" value="${item_producto.cantidad}" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="tiempo_produccion" class="form-label">Tiempo producción:</label>
                            <input type="number" class="form-control" id="tiempo" name="tiempo_produccion" step="0.01" value="${item_producto.tiempo_produccion}" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="form-group">
                            <label for="Unidad_tiempo_idUnidad_tiempo" class="form-label">Unidad de Tiempo:</label>
                            <select class="form-select" id="unidadtiempo${codigo}" name="Unidad_tiempo_idUnidad_tiempo">
                                
                            </select>
                        </div>
                    </div>
                </div>

                
                <button type="submit" class="btn btn-outline-success mr-1 mt-4" id="guardarBtn${codigo}" aria-label="Registrar">Guardar</button>
                <button type="button" class="btn btn-outline-primary mr-1 mt-4 cancelar" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>

            </form>
            
            
        </div>
        <div id="alerta${codigo}" class="mt-4"></div>
    `;
  variable.innerHTML = view;
  overlayy = overlay;
  llenar_select_sbMenu_actual([0]);
  const selectrubro = document.querySelector(`#rubro${codigo}`);
  selectrubro.value = item_producto.rubro_idrubro;
  llenar_select_sbMenu_actual([1, 2, 3, 4, 5]);
  selectrubro.addEventListener("change", function () {
    setTimeout(() => llenar_select_sbMenu_actual([4, 5]), 50);
  });
  document.querySelector(`#idcategorias_p${codigo}`).value =
    item_producto.categorias_id_categorias;
  document.querySelector(`#idmedida_p${codigo}`).value =
    item_producto.medida_id_medida;
  document.querySelector(`#idestadosproductos_p${codigo}`).value =
    item_producto.estados_productos_id_estados_productos;
  document.querySelector(`#idunidad_p${codigo}`).value =
    item_producto.unidad_id_unidad;
  document.querySelector(`#unidadtiempo${codigo}`).value =
    item_producto.Unidad_tiempo_idUnidad_tiempo;

  const forme = document.querySelector(`#formulario${codigo}`);

  forme.addEventListener("submit", (e) => sendform(e, forme));

  variable.addEventListener("click", function (event) {
    //console.log(event.target);
    let aTag = event.target.closest("a.cerrar") || event.target.closest("button.cancelar");

    if (aTag) {
      event.preventDefault();
      cerrarModal();
    }
  });
  function cerrarModal() {
    overlay.remove();
    app.style.removeProperty("position");
  }
  function sendform(e, form) {
    e.preventDefault();
    const dato = new FormData(form);
    console.log(dato);
    for (let [key, value] of dato.entries()) {
      console.log(key, value);
    }
    fetch(`${URL_APIP}api/`, {
      method: "POST",
      body: dato,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alertas_modal(data);
      });
  }
  
  function alertas_modal(data){
    console.log(data);
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "ok") {
      cerrarModal();
      alertas(data);
    } else {
      
        alertClass = "alert-danger";
        alertMessage = data[1];
        timeoutDuration = 3000;
      
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
}
