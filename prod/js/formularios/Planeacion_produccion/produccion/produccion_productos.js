import * as listarFunctions from "../../funciones/listar.js";
import * as fuG from "../../funciones/generales.js";
import { codigos } from "../constantes.js";
import { produccion_etapas_produccion } from "./listar_etapas_produccion.js";
import { Editar_fila_ } from "../../funciones/editar_fila_.js";
import { crearModal } from "../../funciones/modales/modal_registrar.js";
import { detalle_produccion } from "./detalle_produccion.js";
import { crearModalPasos } from "../../funciones/modales/modal_registrar.js";
import * as html_solicitar_material from "../html/html_solicitud_material.js";
import { URL_APIP } from "../../../../../lib/services.js";
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
let Lista_Material=[];
let Lista_Medida = [];
let Lista_productos_comercial = [];
let Lista_solicitud_material = [];
let produccion_idproduccion;
let Lista_grupo_etapas;
let solicitudes_material = [];
export async function produccion_productos(code,permisos,refrescar,codigo,idorden_produccion_,produccion_idproduccion_) {
  code_ = code;
  permisos_ = permisos;
  refrescar_ = refrescar;
  codigo_ = codigo;
  
  idorden_produccion = idorden_produccion_;
  produccion_idproduccion = produccion_idproduccion_;
  app = document.querySelector(`#Listar_lista_orden_produccion${codigo}`);
  
 
  
  sitio();
}
function limpiar_app(){
  app.innerHTML = '';
}
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    const resultados = await Promise.all([
      listarFunctions.mostrar_orden_produccion(idorden_produccion),
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.select_lista_productos(idEmpresa),
      listarFunctions.listar_api_general_verd("listar_productos_porGrupo",idEmpresa),
      listarFunctions.listar_api_general_verd("listar_grupo_etapas_porProducto",idEmpresa),
      listarFunctions.listar_api_general_verd("listar_productos_porGrupo_y_etapas",idEmpresa),
      listarFunctions.listar_api_general("listar_material",idEmpresa),
      listarFunctions.listar_api_general("listar_unidad_producto",idEmpresa),
      listarFunctions.listar_api_general("listar_productos_comercial",idEmpresa),
      listarFunctions.listar_api_general_verd("Listar_solicitud_material_produccion",idEmpresa),
      listarFunctions.listar_api_general_verd("listar_grupo_etapas",idEmpresa),
    ]);

    Orden_produccion_detalle = resultados[0];
    Lista_empleados = resultados[1];
    Lista_productos = resultados[2];
    Lista_Grupo_productos = resultados[3];
    Lista_Material = resultados[6];
    Lista_Medida = resultados[7];
    Lista_productos_comercial = resultados[8];
    solicitudes_material = resultados[9];
    Lista_grupo_etapas = resultados[10];
    console.log(resultados[2], resultados[4], resultados[7],resultados[9],solicitudes_material);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
const codigo = codigos.codigoproductos_p;
function menu(event) {
  
  const dataid = event.currentTarget.getAttribute("data-id");
  const [funcion, id1, id2] = dataid.split(",");
  switch (funcion) {
    case "comenzar_produccion":
      produccion_etapas_produccion(code_, permisos_, refrescar_,[id1,id2]);
      detalle_produccion(code_, permisos_, refrescar_,[id1,id2]);
      break;
    case "solicitar_material":
      
      modal_solicitar_material(id1);
      break;
    case "eliminar_materials":
      eliminar_materials(id1);
      break;
    case "configuracion":
      addModal(id1);
      break;

    case "etapas_produccion":
      modaletapasproduccion(id1);
      break;
    case "editar_estandar_producto_material":
      editar_estandar_producto_material(event);
      break;
    default:
      sitio();
      break;
  }
}

async function editar_estandar_producto_material(event){
  //codigoSolicitud_material
  const columnas = [
      {
          index: 3,
          editable: true,
          type: 'number',
          field: 'cantidad',
          validations: { required: true }
      },
      {
          index: 5,
          editable: true,
          type: 'text',
          field: 'Detalle',
          validations: { required: true }
      },
    
  ];

      
      const resultado = await Editar_fila_(event, codigos.codigoSolicitud_material, Lista_solicitud_material, columnas, 'material_idmaterial');
        
        
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
      
      }

      const formData = new FormData();
      

      Object.entries(resultado).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log("FormData prepared for submission:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // try {
      //   const data = await registrarFuntions.sendformData2(formData);
      //   console.log("Server response:", data);
      //   fuG.alertas(data,codigo);
      //   if(data[0] == "danger" || data[0] == "Error" ){
      //     sitio();
      //   }
      // } catch (error) {
      //   console.error("Error submitting data to the server:", error);
      // }
}
function eliminar_materials(id1){
  if (confirm("Desea eliminar...?")) {
      Lista_solicitud_material = Lista_solicitud_material.filter(orden => Number(orden.material_idmaterial) !== Number(id1));
      preparar_registro(Lista_solicitud_material);
  }
}
function modal_solicitar_material(id_orden_produccion){
    
    const modal = crearModal({
        code: code_,
        id: `modal_solicitar_material${codigo}`,
        header: html_solicitar_material.getTitle(),
        body: html_solicitar_material.getBody(),
        footerButtons: [
            {
                id: "btnConfirmar",
                text: "Confirmar",
                class: "btn-primary",
                onClick: () => f_mdl_solicitar_material(Lista_solicitud_material),
                dismiss: true // Esto cierra el modal cuando se hace clic
            },
            {
                id: "btnCancelar",
                text: "Cancelar",
                class: "btn-secondary",
                onClick: function(){console.log('cancelar')},
                dismiss: true // Cierra el modal sin ejecutar ninguna acción
            }
        ]
    });
    f_solicitar_material_m(id_orden_produccion);

}
async function fecha_and_hora() {
  const hoy = new Date();
  hoy.setHours(hoy.getHours() + (-4));
  const anio = hoy.getFullYear();
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); 
  const dia = hoy.getDate().toString().padStart(2, '0'); 
  const hours = String(hoy.getUTCHours()).padStart(2, '0');
  const minutes = String(hoy.getUTCMinutes()).padStart(2, '0');
  const seconds = String(hoy.getUTCSeconds()).padStart(2, '0');
  return [`${anio}-${mes}-${dia}`,`${hours}:${minutes}`,`${hours}:${minutes}:${seconds}`] 
}
async function f_solicitar_material_m(id_orden_produccion){
  const [fecha, hora, horaCompleta] = await fecha_and_hora();
  document.getElementById(`fecha${codigos.codigoSolicitud_material}`).value = fecha;
  document.getElementById(`hora${codigos.codigoSolicitud_material}`).value = hora;
  document.getElementById(`produccion_idproduccion${codigos.codigoSolicitud_material}`).value = id_orden_produccion;
  console.log(Lista_Material);
  const select_material_m = document.getElementById(`material_idmaterial${codigos.codigoSolicitud_material}`);
  const inp_medida = document.getElementById(`medida${codigos.codigoSolicitud_material}`);
  const idrubro = document.getElementById(`rubro_idrubro${codigos.codigoPrincipal}`).value;
  let view ="";

  Lista_Material.map(lista=> {
    if(Number(lista.rubro_idrubro) === Number(idrubro)){
      view += `
          <option value="${lista.id}">${lista.nombre}</option>
        `;
    }
    
  })
  
  select_material_m.innerHTML = view;
  select_material_m.addEventListener('change',()=>{
    const idmaterial = select_material_m.value;
    const itemmateril = Lista_Material.find(obj => Number(obj.id)  === Number(idmaterial));
    const itemMedida = Lista_Medida.find(obj => Number(obj.id) === Number(itemmateril.medida));
    inp_medida.value = itemMedida.nombre;
  })

  let Lista_orden_produccion_ordenada_por_grupos = ordenar_productos_por_grupos(
    Orden_produccion_detalle,
    Lista_Grupo_productos
  );
  

  const contenido = Orden_produccion_detalle.detalles;
  
  let materialsolicitado = await procesarContenido(contenido);
  const materialesUnicos = Object.values(
    materialsolicitado.reduce((acc, item) => {
        // Verificar si el material ya existe en el acumulador
        if (!acc[item.material_idmaterial]) {
            // Si no existe, inicializar con los datos actuales
            acc[item.material_idmaterial] = { 
                material_idmaterial: item.material_idmaterial, 
                cantidad: item.cantidad 
            };
        } else {
            // Si existe, sumar las cantidades
            acc[item.material_idmaterial].cantidad = (Number(acc[item.material_idmaterial].cantidad) + Number(item.cantidad)).toFixed(2);

        }
        return acc;
    }, {}) // Inicializamos con un objeto vacío
  );

  Lista_solicitud_material = materialesUnicos;
  preparar_registro(Lista_solicitud_material);
  const forme = document.getElementById(`formulario${codigos.codigoSolicitud_material}`);
  forme.addEventListener('submit',(e)=>Agregar_a_lista(e,forme));
}
function Agregar_a_lista(e,forme){
  e.preventDefault();
  
  let nuevoObjeto = {};
  const dato=new FormData(forme);
  for (let [key, value] of dato.entries()) {
      if(key === "cantidad" || key === "material_idmaterial" ){
          nuevoObjeto[key] = Number(value);  
      }else{
          nuevoObjeto[key] = value;
      }
  }
  if(agregarOrdenProduccion(nuevoObjeto)){
      forme.reset();
  }
  
      
}//produccion_etapas_produccion

function agregarOrdenProduccion(nuevaOrden) {
  let existe = Lista_solicitud_material.some(orden => Number(orden.material_idmaterial) === Number(nuevaOrden.material_idmaterial));
  if (!existe) {
      Lista_solicitud_material.push(nuevaOrden);
      preparar_registro(Lista_solicitud_material);

      return true;
  } else {
      alert("Este producto ya existe en la lista.");
      return false;
  }
}
async function preparar_registro(materialsolicitado) {
  const [fecha, hora, horaCompleta] = await fecha_and_hora();

  let detalle = await cDetallesolicitudMaterial(materialsolicitado);
  
  
  listar_material_recalculado(detalle);
}
async function cDetallesolicitudMaterial(material_solicitado){
  let detalles =[];
  material_solicitado.map(lista => {
    let detalle = {
      iddetalle_solicitud_material : 0,
      cantidad: lista.cantidad,
      observaciones: lista.observaciones ? lista.observaciones:"ninguna",
      solicitud_material_idsolicitud_material:0,
      material_idmaterial: lista.material_idmaterial

    }
    detalles.push(detalle);
  })

  return detalles;
}//nombre_lote
async function listar_material_recalculado(materialsolicitado) {
  const table = document.getElementById(`Lista_solicitud_material${codigos.codigoSolicitud_material}`);
  let view = "",
    ind = 1;
    materialsolicitado.map((lista) => {
    let itemMaterial = Lista_Material.find((obj) => Number(obj.id) === Number(lista.material_idmaterial));
    const medida = Lista_Medida.find((obj) => Number(obj.id) ===Number(itemMaterial.medida));    
    view += `
            <tr>
                <td>${ind++}</td>
                <td data-type="${lista.material_idmaterial},codigo">${itemMaterial.codigo}</td>              
                <td data-type="${lista.material_idmaterial},nombre">${itemMaterial.nombre}</td>
                <td data-type="${lista.material_idmaterial},cantidad">${Number(lista.cantidad).toFixed(2)}</td>
                <td data-type="${lista.material_idmaterial},medida">${medida.nombre}</td>
                <td data-type="${lista.material_idmaterial},Detalle">${lista.observaciones}</td>
                <td>
                    <a data-id="editar_estandar_producto_material,${lista.material_idmaterial}" class="btn btn-primary btn-sm btn${codigos.codigoSolicitud_material}">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                    <a data-id="eliminar_materials,${lista.material_idmaterial}" class="btn btn-danger btn${codigos.codigoSolicitud_material}">
                        <i class="bi bi-trash"></i>
                    </a>                          
                </td>
            </tr>
            `;
  });
  table.innerHTML = view;
  const enlaces = document.querySelectorAll(`.btn${codigos.codigoSolicitud_material}`);
  enlaces.forEach(enlace => {
      enlace.addEventListener("click", menu);
  });
}
async function procesarContenido(contenido) {
  let material_solicitado = [];
  for (const listar of contenido){
      // Buscar producto comercial
      const itemproducto = Lista_productos_comercial.find((obj) => 
          Number(obj.idproduct_comercial) === Number(listar.producto_idproducto)
      );

      // Obtener lista estándar de productos
      const Lista_estandar_productos = await listarFunctions.listar_api_general_verd(
          "listar_detalle_estandar",
          listar.producto_idproducto
      );

      // Si se obtiene la lista
      if (Lista_estandar_productos && Array.isArray(Lista_estandar_productos)) {
          Lista_estandar_productos.forEach((lista) => {
              let cant = (Number(lista.cantidad) * Number(listar.cantidad)) / Number(itemproducto.cantidad);
              lista['cantidad'] = Number(cant).toFixed(2);
              material_solicitado.push(lista);
          });
      }

  }
  return material_solicitado;
}

async function f_mdl_solicitar_material(){
  const [fecha, hora, horaCompleta] = await fecha_and_hora();
  let detalle = await cDetallesolicitudMaterial(Lista_solicitud_material);
  let registro = {
    verDavid : "registrarSolicitudMaterial",
    idsolicitud_material : "0",
    fecha:fecha,
    hora: hora,
    estado : "0",
    empresa_idempresa : uk[0].empresa.idempresa,
    empleado_idempleado : uk[0].idusuario,
    produccion_idproduccion: produccion_idproduccion,
    detalles : detalle
  }

  console.log(registro);
  if (registro.detalles &&registro.detalles.length > 0) {
    fetch(`${URL_APIP}api/`, {
      method: "POST", // Método HTTP 
      headers: {
        "Usar-Registro-David": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registro), // Convertir el objeto JS a JSON antes de enviarlo
    })
      .then((response) => response.json()) // Procesar la respuesta en formato JSON
      .then((data) => {
        if(data[0]=== 'success'){
          fuG.alerta_success(code_,'Operación Exitosa','Se Envio la Solicitud a Almacen');
          limpiar_app();
          sitio();
        }
        
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Lista vacia");
  }
}
function alertas(data) {
  console.log(data);
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;
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
  let divalert = document.querySelector(`#alerta${codigos.codigoPrincipal}`);
  if (divalert) {
    // Crear el nuevo contenido de la alerta
    let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
    divalert.innerHTML = nuevoContenido;

    // Eliminar la alerta después del tiempo especificado
    setTimeout(() => {
     
      app.innerHTML = ``;
      divalert.innerHTML = ``;
      sitio();
      
    }, timeoutDuration);
  }
}
function existe_solicitud(produccion_idproduccion){

  return solicitudes_material.some((obj)=> Number(obj.produccion_idproduccion) === Number(produccion_idproduccion));
}
function verificar_solicitudcompletada(produccion_idproduccion){
  let a =  solicitudes_material.some((obj)=> Number(obj.produccion_idproduccion) === Number(produccion_idproduccion));
  if(a){
    const solicitud = solicitudes_material.find((obj)=> Number(obj.produccion_idproduccion) === Number(produccion_idproduccion));
    console.log(solicitudes_material);
    if(Number(solicitud.estado) === 1){ 
      return true;
    }else{
      return false;
    }
  }else{
    return false;
  }
  
}
async function sitio() {
  await listar();
  let view = "",
    ind = 1;

  let Lista_orden_produccion_ordenada_por_grupos = ordenar_productos_por_grupos(
    Orden_produccion_detalle,
    Lista_Grupo_productos
  );
  
  console.log(Lista_orden_produccion_ordenada_por_grupos);
  const btn_solicitar_material = document.createElement('div');
  btn_solicitar_material.classList.add('p-3', 'mb-4', 'rounded');
  console.log();
  if(existe_solicitud(produccion_idproduccion)){
    btn_solicitar_material.innerHTML = ``;
  }else{
    btn_solicitar_material.innerHTML = `
      <div class="d-flex gap-3 ms-auto">
            <div class="text-center">
                <a data-id="solicitar_material,${idorden_produccion}"
                    class="btn btn-warning rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                    id="solicitar_material${codigo}"
                    style="width: 2.5rem; height: 2.5rem;"
                    title="solicitar_material">
                    <i class="bi bi-minecart-loaded fs-5"></i>
                </a>
                <span class="d-block mt-1 small">Solicitar material</span>
            </div>
      </div>
    `;
  }
  
  const color = 'rgba(70, 130, 180, 0.5)'; // Azul acero con 50% de opacidad

  btn_solicitar_material.style.backgroundColor = color;

  app.appendChild(btn_solicitar_material);


  Object.keys(Lista_orden_produccion_ordenada_por_grupos).forEach(key => {
    let grupoNombre;
    let claseGrupo;

    // Determina el nombre y clase CSS del grupo
    const grupo = Lista_Grupo_productos.find(grupo => grupo.grupo_etapas_idgrupo_etapas === key);
    if (grupo) {
        grupoNombre = grupo.nombre;
        claseGrupo = `grupo-${key}`;
    } else {
        grupoNombre = "Productos sin etapas de producción";
        claseGrupo = 'sin-grupo';
    }

    // Crea el contenedor del grupo en una fila completa
    const divGrupo = document.createElement('div');
    divGrupo.classList.add('p-3', 'mb-4', claseGrupo, 'rounded');
    
    divGrupo.innerHTML = `<h5 class="text-center mb-4 fw-bold fs-6" >${grupoNombre}</h5>`;
    const color = 'rgba(108, 117, 125, 0.5)';
    divGrupo.style.backgroundColor = color;
    let ind = 1;
    // Agrega una fila interna para cada detalle de producción del grupo
    
    Lista_orden_produccion_ordenada_por_grupos[key].forEach(detalle => {
      
        const divDetalle = document.createElement('div');
        divDetalle.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-3', 'p-3', 'rounded', 'shadow-sm', 'border');
        let itemProducto = Lista_productos.find(
          (obj) => Number(obj.id_productos) === Number(detalle.producto_idproducto)
        );
        
        divDetalle.innerHTML = `
          <div class="d-flex flex-column">
              <span class="fw-bold text-black">${ind++}. Producto: ${itemProducto.nombre}</span>
              <span class="text-muted small">Codigo: ${itemProducto.codigo}</span>
          </div>
          <span class="fw-bold text-dark">Cantidad Productos: ${detalle.cantidad}</span>
          <div class="d-flex flex-column">
              <span class="fw-bold text-black ">Observaciones</span>
              <span class="text-muted small"> ${detalle.observaciones}</span>
          </div>
            
        `;
        divGrupo.appendChild(divDetalle);
    });
    const botones = document.createElement('div');
    if(verificar_solicitudcompletada(produccion_idproduccion)){
      botones.innerHTML = `
          <div class="d-flex gap-3 ms-auto">
            <div class="text-center">
                <a data-id="comenzar_produccion,${key},${produccion_idproduccion}"
                  class="btn btn-success rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  id="registrarEtapas${codigo}"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Enviar">
                    <i class="bi bi-play fs-5"></i>
                </a>
                <span class="d-block mt-1 small">Comenzar producción</span>
            </div>
          </div>

          
      `;
    }else{
      botones.innerHTML = ``;
    }
    
    if(grupoNombre !== "Productos sin etapas de producción"){
      divGrupo.appendChild(botones);
      
    }else{
      divGrupo.style.backgroundColor = 'rgba(130, 67, 67, 0.82)';
    }
        
   // ordenar_productos_por_grupos
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
    const grupoNombre = grupoInfo ? grupoInfo.nombre : "-1";

    // Crear el grupo si no existe en productosAgrupados
    if (!productosAgrupados[grupoNombre]) {
      productosAgrupados[grupoNombre] = [];
    }
    detalle["grupo_etapas_idgrupo_etapas"] = grupoInfo
      ? grupoInfo.grupo_etapas_idgrupo_etapas
      : "-1";
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

