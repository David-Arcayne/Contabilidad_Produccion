import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { produccion_etapas_produccion } from "./listar_etapas_produccion.js";
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let idorden_produccion;

let Orden_produccion_detalle;
let Lista_empleados;

let aux = [];

let Lista_productos = [];
let Lista_Grupo_productos = [];

export async function produccion_productos(
  code,
  permisos,
  refrescar,
  codigo,
  id
) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  codigo_ = codigo;
  console.log(codigo);
  idorden_produccion = id;
  app = document.querySelector(`#Listar_lista_orden_produccion${codigo}`);
  await listar();
  console.log(Orden_produccion_detalle);
  console.log(Lista_empleados);
  console.log(Lista_productos);
  sitio();
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    const resultados = await Promise.all([
      listarFunctions.mostrar_orden_produccion(idorden_produccion),
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.select_lista_productos(idEmpresa),
      listarFunctions.listar_api_general_verd(
        "listar_productos_porGrupo",
        idEmpresa
      ),
      listarFunctions.listar_api_general_verd(
        "listar_grupo_etapas_porProducto",
        idEmpresa
      ),
      listarFunctions.listar_api_general_verd(
        "listar_productos_porGrupo_y_etapas",
        idEmpresa
      ),
    ]);

    Orden_produccion_detalle = resultados[0];
    Lista_empleados = resultados[1];
    Lista_productos = resultados[2];
    Lista_Grupo_productos = resultados[3];
    console.log(resultados[3], resultados[4], resultados[5]);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
const subcodigo = codigos.codigoproductos_p;

function rand() {
  const indice = Math.floor(Math.random() * 26);
  const subcodigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

  return String.fromCharCode(65 + indice) + subcodigo;
}

function menu(event) {
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "comenzar_produccion":
      produccion_etapas_produccion(code_, permisos_, refrescar_);
      break;

    case "editar_producto_comercial":
      toggleEditSave(event);
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
    default:
      sitio();
      break;
  }
}

function sitio() {
  let view = "",
    ind = 1;

  let Lista_orden_produccion_ordenada_por_grupos = ordenar_productos_por_grupos(
    Orden_produccion_detalle,
    Lista_Grupo_productos
  );

  console.log(Lista_orden_produccion_ordenada_por_grupos);
  Orden_produccion_detalle.detalles.map((lista) => {
    let itemProducto = Lista_productos.find(
      (obj) => Number(obj.id_productos) === Number(lista.producto_idproducto)
    );
    view += `
            <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded shadow-sm border">
                    <!-- Información de la solicitud -->
                    <div class="d-flex flex-column">
                        <span class="fw-bold text-primary">${ind++}. Producto: ${
      itemProducto.nombre
    }</span>
                        <span class="text-muted small">Codigo: ${
                          itemProducto.codigo
                        }</span>
                    </div>
                    
                    <span class="fw-bold text-dark">Cantidad Productos: ${
                      lista.cantidad
                    }</span>
                    
                    

                    <div class="d-flex flex-column">
                        <span class="fw-bold text-primary">Observaciones</span>
                        <span class="text-muted small"> ${
                          lista.observaciones
                        }</span>
                    </div>
                    
                    <div class="d-flex gap-3">
                        <div class="text-center">
                            <a href="#" data-id="comenzar_produccion,${"lista.idorden_produccion"}"
                            class="btn btn-outline-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            id ="registrarEtapas${subcodigo}"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Enviar">
                                <i class="bi bi-skip-start-circle-fill fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Comenzar producción</span>
                        </div>
                        <div class="text-center">
                            <a href="#" data-id="finalizar_produccion,${"lista.idorden_produccion"}"
                            class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                            style="width: 2.5rem; height: 2.5rem;"
                            title="Cancelar">
                                <i class="bi bi-send-x fs-5"></i>
                            </a>
                            <span class="d-block mt-1 small">Maquina</span>
                        </div>
                    </div>
                </div>
        `;
  });

  app.innerHTML = view;

  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menu);
  });
}

function ordenar_productos_por_grupos(ordenProduccion, grupos) {
  const productoGrupoMap = {};

  // Crear mapa de productos a sus grupos
  grupos.forEach((grupo) => {
    grupo.grupo_productos.forEach((producto) => {
      productoGrupoMap[producto.producto_idproducto] = {
        nombre: grupo.grupo_etapas_idgrupo_etapas,
        grupo_etapas_idgrupo_etapas: grupo.grupo_etapas_idgrupo_etapas,
      };
    });
  });

  const productosAgrupados = {};

  ordenProduccion.detalles.forEach((detalle) => {
    const grupoInfo = productoGrupoMap[detalle.producto_idproducto];
    const grupoNombre = grupoInfo ? grupoInfo.nombre : "Sin grupo";

    // Crear el grupo si no existe en productosAgrupados
    if (!productosAgrupados[grupoNombre]) {
      productosAgrupados[grupoNombre] = [];
    }
    detalle["grupo_etapas_idgrupo_etapas"] = grupoInfo
      ? grupoInfo.grupo_etapas_idgrupo_etapas
      : "Sin grupo";
    productosAgrupados[grupoNombre].push(detalle);
  });

  return productosAgrupados;
}

function generarColorAleatorio() {
  // Genera un número aleatorio entre 0 y 16777215 (hexadecimal para 'ffffff')
  const color = Math.floor(Math.random() * 16777215).toString(16);
  // Asegura que el color tenga siempre 6 caracteres
  return `#${color.padStart(6, "0")}`;
}
