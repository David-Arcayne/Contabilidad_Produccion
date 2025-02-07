import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let Listas_Control_calidad;
let Lista_Detalle_Control_calidad;
let overlayy;
let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let id_orden_produccion;
let listas;
let id_Detalle;
let id;
let Orden_produccion_detalle;
let Lista_empleados;
let intervaloId;
let isEditing = false;
let aux=[];
let Lista_Orde_produccion_lote = [];
let Lista_Orden_Produccion =[];
let Lista_productos =[];
let obt_ordenProd_aux = {
    "iddetalle_produccion": 0,
    "cantidad": 0,
    "observaciones": "detalle",
    "orden_produccion_idorden_produccion": 0,
    "producto_idproducto": 0
};
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.mostrar_orden_produccion(id_orden_produccion),
            listarFunctions.select_lista_productos(idEmpresa),
            listarFunctions.listadoProduccionLote(idEmpresa),

        ]);//nombre_lote

        Lista_empleados = resultados[0];
        Orden_produccion_detalle = resultados[1];
        Lista_productos = resultados[2];
        Lista_Orde_produccion_lote = resultados[3];

        aux = {...resultados[2]}
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}

const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "modal";
function rand(){
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}

export async function verORdenProduccion(code, permisos, refrescar, codigo, id) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    id_orden_produccion = id;
    //Orden_produccion_detalle = await listarFunctions.mostrar_orden_produccion(id);
    await listar();
    console.log(Orden_produccion_detalle);
    console.log(Lista_empleados);
    sitio();    
}


async function sitio() {
    
    app.style.position = 'relative';
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer';
    app.appendChild(overlay);
    const variable = document.createElement('div');
    variable.style.width = '1000px';
    variable.style.height = '580px';

    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.cursor = 'auto';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    variable.style.display = 'block';
    overlay.appendChild(variable);

    let itemempleado = Lista_empleados.find(obj => Number(obj.id) === Number(Orden_produccion_detalle.empleado_idempleado));
    let orden_p = Lista_Orde_produccion_lote.find(obj => Number(obj.orden_produccion_idorden_produccion)===Number(id_orden_produccion));
    console.log(orden_p);
    let view = `
         <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>
    <div class="container">
        
        <h5 class="text-center mb-4 fw-bold fs-6">Lista Orden Producción</h5>
        
        <span class="fw-bold text-dark">Lote produccion: ${orden_p.lote}</span>
        <div id="alerta${subcodigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${subcodigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${subcodigo}">
              
            </tbody>
        </table>
        
    </div>
    `;
    variable.innerHTML = view;
    overlayy = overlay;
    Listar_detalle_orden_produccion(Orden_produccion_detalle.detalles);
    
   
   
    variable.addEventListener('click', function(event) {
        //console.log(event.target);
        let aTag = event.target.closest('a.cerrar');

        if (aTag) {
            event.preventDefault();
            cerrarModal();

        }
       
    });
    function cerrarModal() {
        overlay.remove(); 
        Lista_Orden_Produccion = [];
        app.style.removeProperty('position');  
    }
}

let Lista_produccion = [
    {},
    {}
]

let Object_detalle = {
    "iddetalle_produccion": 1,
    "cantidad": 50,
    "observaciones": "detalle",
    "orden_produccion_idorden_produccion": 1,
    "producto_idproducto": 16
}

function Listar_detalle_orden_produccion(detalle){
    detalle.map(lista => {
        Agregar_a_lista_Array(lista);
    })
}
function Agregar_a_lista_Array(Object_detalle){
    
    const nuevoObjeto = {};

    for (const [key, value] of Object.entries(Object_detalle)) {
        // Convert specific fields to numbers
        if (["cantidad", "orden_produccion_idorden_produccion", "producto_idproducto", "iddetalle_produccion"].includes(key)) {
            nuevoObjeto[key] = Number(value);
        } else {
            nuevoObjeto[key] = value;
        }
    }
    console.log(nuevoObjeto);
    if(agregarOrdenProduccion(nuevoObjeto)){
        console.log(Lista_Orden_Produccion);
        Listar_OrdenProduccion();
        return true;
    }
    
    return false; 
 }
function agregarOrdenProduccion(nuevaOrden) {
    let existeProducto = Lista_Orden_Produccion.some(orden => orden.producto_idproducto === nuevaOrden.producto_idproducto);
    if (!existeProducto) {
        Lista_Orden_Produccion.push(nuevaOrden);
        console.log("Producto agregado correctamente.");
        return true;
    } else {
        alert("Este producto ya existe en la lista.");
        return false;
    }
}
function Listar_OrdenProduccion(){
    const tablaListar = document.getElementById(`ListarOrdenProduccion${subcodigo}`);
    let view = "", ind = 1;
    console.log(Lista_Orden_Produccion);
    console.log(Lista_Orde_produccion_lote);
    Lista_Orden_Produccion.map(lista=>{

        let itemproducto = Lista_productos.find(obj => obj.id_productos === lista.producto_idproducto) || {
            "id_productos": 0,
            "nombre": "-",
            "codigo": "-",
        };
        view +=`
            <tr>
                <td>${ind++}</td>                
                <td data-type="${lista.producto_idproducto},producto_idproducto">${itemproducto.nombre} ${itemproducto.codigo}</td>
                <td data-type="${lista.producto_idproducto},cantidad">${lista.cantidad}</td>
                <td data-type="${lista.producto_idproducto},observaciones">${lista.observaciones}</td>
                
            </tr>
        
        `;
    });
    tablaListar.innerHTML = view;
    
 }
