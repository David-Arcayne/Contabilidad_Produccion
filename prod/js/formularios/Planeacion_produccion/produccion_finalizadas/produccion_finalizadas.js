import * as listarFunctions from "../../funciones/listar.js";



let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

let app="";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Orden_Producciones =[];
let Lista_detalle_orden_produccion = [];
let Lista_empleados = [];
let Lista_productos =[];
export async function orden_produccion_finalizadas(code, permisos, refrescar, codigo) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    app=document.querySelector(`#content-area${codigo}`);
    await listar();
    console.log(Lista_empleados);
    sitio();    
    
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.listar_Empleados(idEmpresa),
            listarFunctions.select_lista_productos(idEmpresa),
            listarFunctions.mostrar_ordenproduccion(idEmpresa),
            listarFunctions.listar_detalle_produccion(idEmpresa),
        ]);
        // Asignamos los resultados a las variables correspondientes
        Lista_empleados = resultados[0];
        Lista_productos =resultados[1];
        Lista_Orden_Producciones = resultados[2];
        Lista_detalle_orden_produccion = resultados[3];
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "solicitud_pendientes";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const subcodigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + subcodigo;
}


function menu(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1,id2] = dataid.split(',');
    switch (funcion) {
        case "modal_crear_lote_produccion":
            crear_lote(id1);
            break;
        case "pendiente_editar":
            pendiente_editar(id1);
            break;
        case "mostrar_progreso_de_solicitud":
            mostrar_progreso_de_solicitud();
            break;
        case "mostrar_finalizados_desarrollo":
            mostrar_finalizados_desarrollo();
            break;
        case "negativos_mostrar":
            negativos_mostrar();
            break;
        default:
            sitio();
            break;
    }

}

function sitio(){
    
    
    let view="",ind=1;
    

        view +=`
            <h1>Produccion Finalizadas</h1>
        `;
     app.innerHTML=view;
     const enlaces = document.querySelectorAll(".btn");
     enlaces.forEach(enlace => {
         enlace.addEventListener("click", menu);
     });
   
 }
 
function mostrarSeccion(section) {
    //const contentArea = document.getElementById(`filtrar${subcodigo}`);
   // contentArea.innerHTML = ''; 
    switch(section) {

        case 'pendientes':
            //mostrar_pendientes();
            break;
        case 'encurso':
           // mostrar_encurso();
            break;
        case 'finalizados':
            //mostrar_finalizados();
            break;
        case 'negativos':
            //mostrar_negativos();
            break;
        
        default:
           // contentArea.innerHTML = `<div>Selecciona una sección del menú</div>`;
            break;
    }
}
