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
  Object.keys(Lista_orden_produccion_ordenada_por_grupos).forEach(key => {
    let grupoNombre;
    let claseGrupo;

    // Determina el nombre y clase CSS del grupo
    const grupo = Lista_Grupo_productos.find(grupo => grupo.grupo_etapas_idgrupo_etapas === key);
    if (grupo) {
        grupoNombre = grupo.nombre;
        claseGrupo = `grupo-${key}`;
    } else {
        grupoNombre = "Sin grupo";
        claseGrupo = 'sin-grupo';
    }

    // Crea el contenedor del grupo en una fila completa
    const divGrupo = document.createElement('div');
    divGrupo.classList.add('p-3', 'mb-4', claseGrupo, 'rounded');
    divGrupo.innerHTML = `<h4 class="text-center">${grupoNombre}</h4>`;
    divGrupo.style.backgroundColor = generarColorOpaco();

    // Agrega una fila interna para cada detalle de producción del grupo
    Lista_orden_produccion_ordenada_por_grupos[key].forEach(detalle => {
        const divDetalle = document.createElement('div');
        divDetalle.classList.add('row', 'border', 'border-dark', 'p-2', 'rounded', 'mb-2');
        divDetalle.innerHTML = `
            <div class="col-md-3"><p><strong>ID:</strong> ${detalle.iddetalle_produccion}</p></div>
            <div class="col-md-3"><p><strong>Cantidad:</strong> ${detalle.cantidad}</p></div>
            <div class="col-md-3"><p><strong>Observaciones:</strong> ${detalle.observaciones}</p></div>
            <div class="col-md-3"><p><strong>Producto ID:</strong> ${detalle.producto_idproducto}</p></div>
        `;
        divGrupo.appendChild(divDetalle);
    });

    app.appendChild(divGrupo);
});


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

function generarColorOpaco() {
  // Genera valores bajos en el rango para lograr tonos opacos.
  const red = Math.floor(Math.random() * 156) + 50; // Rango de 50 a 205 para evitar colores muy intensos
  const green = Math.floor(Math.random() * 156) + 50;
  const blue = Math.floor(Math.random() * 156) + 50;

  // Convierte los valores a hexadecimal y asegura que tengan siempre 2 caracteres
  const redHex = red.toString(16).padStart(2, "0");
  const greenHex = green.toString(16).padStart(2, "0");
  const blueHex = blue.toString(16).padStart(2, "0");

  // Combina y retorna el color hexadecimal
  return `#${redHex}${greenHex}${blueHex}`;
}

