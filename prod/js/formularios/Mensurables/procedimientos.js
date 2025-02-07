import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js"; 
import * as registrarFuntions from "../funciones/registrar.js"; 
import * as fuG from "../funciones/generales.js"; 
import { codigos } from "./constantes.js";
import { Editar_fila_ } from "../funciones/editar_fila_.js";

let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let opcion = 1;
let privilegios;
let code;
let permisos;
let refrescar;
const codigo = codigos.codigoProcedimiento;
let Lista_riesgo = [];
let Lista_empleados = [];
let Lista_emergencia = [];
let Lista_recursos = [];
let Lista_procedimientos = [];
let Lista_procedimientos_registrados = [];
export function contigencia_procedimiento(code_, permisos_, refrescar_) {
    code = code_;
    permisos =  permisos_;
    refrescar = refrescar_;
    app=document.querySelector(`#principal${codigos.codigoPrincipal}`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
        sitio();
      });
    sitio();    
    
}




async function listar() {
    try {
      const idEmpresa = uk[0].empresa.idempresa;
      const idsucursal = uk[0].empresa.idsucursal;

      // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
      const resultados = await Promise.all([
        //listarFunctions.listar_api_general('get_trabajador_sucursal',idsucursal),
        listarFunctions.listar_api_general_verd("listado_riesgo",idEmpresa),
        //listarFunctions.listar_api_general_verd("listado_emergencia",idEmpresa),
        listarFunctions.listar_api_general_verd("listado_recurso_riesgo",idEmpresa),
        listarFunctions.listar_api_general_verd("listar_procedimiento",idEmpresa),
        
                    
      ]);
      // Asignamos los resultados a las variables correspondientes
      Lista_riesgo = resultados[0];
      
      Lista_recursos = resultados[1];
      Lista_procedimientos_registrados = resultados[2];
    } catch (error) {
      console.error("Error al listar datos: ", error);
      throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
  }
  function initializeDropdownSearch_(codigo, Lista_Material,clave, valor, condicion,entidad) {
    const searchInput = document.getElementById(`searchInput${codigo}`);
    const dropdownList = document.getElementById(`dropdownList${codigo}`);
  
    // Crear la lista inicial
    function populateDropdown(filteredItems) {
        dropdownList.innerHTML = ''; // Limpia la lista
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent =item [clave] + " : "+item[valor];
            li.style.padding = "5px 10px";
            li.style.cursor = "pointer";
            li.style.borderBottom = "1px solid #ddd"; // Línea de separación
            li.style.borderRadius = '8px';
            li.style.transition = "background-color 0.3s"; // Efecto suave al cambiar el color
  
            // Efecto hover
            li.addEventListener("mouseenter", () => {
                li.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
                li.style.color = "white";
            });
  
            li.addEventListener("mouseleave", () => {
                li.style.backgroundColor = "";
                li.style.color = "";
            });
  
            // Seleccionar el item
            li.addEventListener('click', () => {
                
                searchInput.value = item [clave] +" : "+ item[valor] ;
                
                
                dropdownList.style.display = 'none'; // Oculta la lista
                item['entidad']=entidad;
                parametros_extras(item);
            });
  
            dropdownList.appendChild(li);
        });
    }
  
    // Filtrar la lista según el texto ingresado
    function filterItems(searchText) {
        if(condicion){
            const filterLista = Lista_recursos.filter((obj) => !Lista_procedimientos.some(list_mp => Number(list_mp.recurso_riesgo_idrecurso_riesgo) === Number(obj.idrecurso_riesgo)) );

            const filtered = filterLista.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
                item[clave].toLowerCase().includes(searchText.toLowerCase()) 
  
            );
            
            populateDropdown(filtered);
        }else{
            const filtered = Lista_Material.filter(item =>
                item[valor].toLowerCase().includes(searchText.toLowerCase()) ||
                item[clave].toLowerCase().includes(searchText.toLowerCase()) 
            );
            populateDropdown(filtered);
        }
        
    }
  
    // Mostrar y manejar eventos del input
    searchInput.addEventListener('focus', () => {
        dropdownList.style.display = 'block';
        if(condicion){
            const filterLista = Lista_recursos.filter((obj) => !Lista_procedimientos.some(list_mp => Number(list_mp.recurso_riesgo_idrecurso_riesgo) === Number(obj.idrecurso_riesgo)) );
            populateDropdown(filterLista); // Muestra todos los elementos inicialmente
        }else{
            
            populateDropdown(Lista_Material); // Muestra todos los elementos inicialmente
        }
       
    });
  
    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value;
        filterItems(searchText); // Filtra la lista
    });
  
    // Ocultar el dropdown si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest(`#searchInput${codigo}`) && !e.target.closest(`#dropdownList${codigo}`)) {
            dropdownList.style.display = 'none';
        }
    });
  }

  function parametros_extras(item){
    console.log(item);
    if(item['entidad'] === 'riesgo'){
        document.getElementById(`riesgo_idriesgo${codigos.codigoRiesgos}`).value = item.idriesgo;
        Lista_procedimientos =  [];
      
        console.log(Lista_procedimientos_registrados);
        let procedimientoSELECT = Lista_procedimientos_registrados.find((obj) =>Number(obj.idriesgo) === Number(item.idriesgo));
        console.log(procedimientoSELECT);
        let procedimiento = procedimientoSELECT.procedimiento || [];
        const resultado = {
            riesgo_idriesgo: procedimientoSELECT.idriesgo,
            procedimiento: procedimiento.map((proceso) => ({
                idprocedimiento: proceso.idprocedimiento,
                npaso: proceso.npaso,
                efectividad: proceso.efectividad,
                instruccion: proceso.instruccion,
                recurso_riesgo_idrecurso_riesgo : proceso.recurso_riesgo_idrecurso_riesgo ,
                riesgo_idriesgo: procedimientoSELECT.idriesgo
            })),
        };

        console.log(resultado);
        let Lista_Elementos = listar_elementos_seleccionados(resultado.procedimiento);

        Lista_Elementos = Array.isArray(Lista_Elementos) ? Lista_Elementos : [];
        antes_Listar_Elementos(Lista_Elementos, resultado.procedimiento);
        
  
    }else if (item['entidad'] === 'recurso'){
        document.getElementById(`recurso_riesgo_idrecurso_riesgo${codigos.codigoRecursos}`).value = item.idrecurso_riesgo;
    }
               
  }
  

async function sitio(){
    
     let view = `
    <div class="container">
        <form id="formulario${codigo}">
            <div class="row">
                <div class=" col-md-6 border p-3 m-0 rounded">
                        <div class="row">
                                        
                            <div style="position: relative;" class="col-md-12">
                                <input type="hidden" name="riesgo_idriesgo" id="riesgo_idriesgo${codigos.codigoRiesgos}" required>

                                <label for="riesgo" class="form-label">Riesgo:</label>
                                <input type="text" id="searchInput${codigos.codigoRiesgos}" placeholder="Buscar..." class="form-control" name="riesgo" required>
                                <ul id="dropdownList${codigos.codigoRiesgos}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                            </div>
                            
                        </div>
                        
                </div>
                <div class=" col-md-6 border p-3 m-0 rounded" >
                    <div class="row">
                        <div style="position: relative;" class="col-md-6">
                            <input type="hidden" name="recurso_riesgo_idrecurso_riesgo" id="recurso_riesgo_idrecurso_riesgo${codigos.codigoRecursos}" required >

                            <label for="recurso" class="form-label">Recurso:</label>
                            <input type="text" id="searchInput${codigos.codigoRecursos}" placeholder="Buscar..." class="form-control" name="recurso" required>
                            <ul id="dropdownList${codigos.codigoRecursos}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                        </div>
                        <div class="col-md-6">
                            <label for="efectividad" class="form-label"> Efectividad:</label>
                            <input type="text" class="form-control" id="efectividad" name="efectividad"  required>
                        </div>
                    </div>
                    
                </div>

                <div class=" col-md-12 border p-3 m-0 rounded">
                    <div class="row">
                        <div class="col-md-2">
                            <label for="npaso" class="form-label">N° paso:</label>
                            <input type="number" id="npaso${codigo}"  class="form-control" name="npaso" required>
                        </div>
                            <div class="col-md-10">

                            <label for="instruccion" class="form-label">instruccion</label>
                            <textarea class="form-control" id="instruccion" name="instruccion" rows="3" required></textarea>
                        </div>
                    </div>
                    
                </div>
            </div>
             <div class="col-md-12 mt-3 d-flex justify-content-between">
                <button type="button" class="btn btn-primary btn-sm" id = "limpiar${codigo}">Limpiar</button>
                <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
            </div>
            
        </form>
        
        <div id="alerta${codigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Codigo</th>
                    <th scope="col">Recurso</th>
                    <th scope="col">N° paso</th>
                    <th scope="col">Efectividad</th>
                    <th scope="col">Instrucción</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="listar_procedimiento${codigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
            <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
            <button type="button" class="btn btn-success btn-lg" id="registrar${codigo}">Registrar</button>
        </div>
    </div>`;
    await listar();
    app.innerHTML=view;
   
    initializeDropdownSearch_(codigos.codigoRiesgos, Lista_riesgo,'codigo','descripcion',false,'riesgo');
    initializeDropdownSearch_(codigos.codigoRecursos, Lista_recursos,'codigo','nombre_recurso',true,'recurso');
    
    const forme = document.getElementById(`formulario${codigo}`);
    forme.addEventListener("submit", (e)=>{
     
        e.preventDefault();
        const formData = new FormData(forme);
        let a = {
            "riesgo_idriesgo": "5",
            "riesgo": "651243ccw : Si una máquina no cuenta con las protecciones adecuadas, como resguardos físicos o interruptores de seguridad, existe el riesgo de que el operador sufra lesiones graves al interactuar accidentalmente con estas partes móviles.",
            "recurso_riesgo_idrecurso_riesgo": "4",
            "recurso": "papaya4 : prueba232",
            "efectividad": "34",
            "npaso": "23",
            "instruccion": "ere"
        }
        let datos_enviados = {};
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
            datos_enviados[key] = value;
        }
        console.log(datos_enviados);
        console.log(Lista_procedimientos)
        const recurso = datos_enviados['recurso_riesgo_idrecurso_riesgo'];
        if (recurso) {
            let Lista_Elementos = listar_elementos_seleccionados([{'recurso_riesgo_idrecurso_riesgo':recurso}]);
            let lista_rgs = [];
            const riesgo = datos_enviados['riesgo_idriesgo'];
            if (!riesgo) {
                alert("selecciones una riesgo de producción");
                return;
            }
            
            let aux = {
                idprocedimiento: 0,
                recurso_riesgo_idrecurso_riesgo: Number(recurso),
                riesgo_idriesgo: Number(riesgo),
                npaso: datos_enviados['npaso'],
                efectividad: datos_enviados['efectividad'],
                instruccion: datos_enviados['instruccion'],
            };
            lista_rgs.push(aux);
        
            antes_Listar_Elementos(Lista_Elementos, lista_rgs);
        } else {
            alert("No ha seleccionado");
        }
    });
      
    
    const btnregistrar_api = document.getElementById(`registrar${codigo}`);
    btnregistrar_api.addEventListener("click", function () {
        const recursos = [];
        const rows = document.querySelectorAll(`#listar_procedimiento${codigo} tr`);
        const etapa = document.getElementById(`riesgo_idriesgo${codigos.codigoRiesgos}`);
        
    
        rows.forEach((row, index) => {
            const data_id= row.querySelector("td[data-id]");
            const data_idriesgo=row.querySelector("td[data-idriesgo]");
            const data_idrecurso=row.querySelector("td[data-idrecurso]");
            const data_npaso=row.querySelector("td[data-npaso]");
            const data_efectividad=row.querySelector("td[data-efectividad]");
            const data_instruccion=row.querySelector("td[data-instruccion]");

            const id = data_id ? data_id.getAttribute("data-id") : null;
            const idriesgo= data_idriesgo ? data_idriesgo.getAttribute("data-idriesgo") : null;
            const idrecurso = data_idrecurso ? data_idrecurso.getAttribute("data-idrecurso") : null;
            const npaso = data_npaso ? data_npaso.getAttribute("data-npaso") : null;
            const efectividad  = data_efectividad ? data_efectividad.getAttribute("data-efectividad") : null;
            const instruccion = data_instruccion ? data_instruccion.getAttribute("data-instruccion") : null;
            let item_recurso = Lista_procedimientos.find(obj => Number(obj.idprocedimiento) === Math.abs(Number(id)))
            const recurso = {
                idprocedimiento: Number(id),
                npaso : item_recurso['npaso'],
                efectividad : item_recurso['efectividad'],
                instruccion : item_recurso['instruccion'],
                recurso_riesgo_idrecurso_riesgo : Number(idrecurso),
                riesgo_idriesgo : Number(idriesgo),
            };
           
            recursos.push(recurso);
        });
    
        prepararLista_enviar(recursos);
    });
    
    
    
    const btn_cancelar = document.getElementById(`cancelar_${codigo}`);
    btn_cancelar.addEventListener("click", function () {
        sitio();
        vaciar_listas();
    });
        
 }

 function prepararLista_enviar(list) {
   let lista_preparada = {
     verDavid: "registrar_procedimiento",
     procedimiento: [...list],
   };
 
   console.log(lista_preparada);
   if (lista_preparada.procedimiento && lista_preparada.procedimiento.length > 0) {
     fetch(`${URL_APIP}api/`, {
       method: "POST", // Método HTTP
       headers: {
         "Usar-Registro-David": "true",
         "Content-Type": "application/json",
       },
       body: JSON.stringify(lista_preparada), // Convertir el objeto JS a JSON antes de enviarlo
     })
       .then((response) => response.json()) // Procesar la respuesta en formato JSON
       .then((data) => {
         console.log(data);
         
       })
       .catch((error) => console.error("Error:", error));
   } else {
     alert("Lista vacia");
   }
 }
 function listar_elementos_seleccionados(List_select) {
        console.log("Lista_maquina:", Lista_recursos);
        console.log("List_select:", List_select);
    
        if (!Array.isArray(List_select) || List_select.length === 0) {
        console.warn("List_select está vacío o no es un arreglo válido.");
        return;
        }
        List_select.forEach((seleccionado, index) => {
        console.log(`Elemento en List_select [${index}]:`, seleccionado);
        console.log(
            `recurso_riesgo_idrecurso_riesgo en seleccionado:`,
            seleccionado.recurso_riesgo_idrecurso_riesgo
        );
        });
        // Crear el Set para la comparación
        const idmaquinaSeleccionado = new Set(
        List_select.map((seleccionado) =>
            String(seleccionado.recurso_riesgo_idrecurso_riesgo).trim()
        )
        );
    
        console.log(
        "ID recurso seleccionados en Set:",
        Array.from(idmaquinaSeleccionado)
        );
    
        //Inspección detallada de cada ID en ambas listas
        Lista_recursos.forEach((recurso) => {
        const maquinaId = String(recurso.idrecurso_riesgo).trim();
        const encontrado = idmaquinaSeleccionado.has(maquinaId);
        console.log(
            `ID emp: ${maquinaId} - ¿Encontrado en seleccionados?: ${encontrado}`
        );
        });
    
        //Filtrado de productos usando el Set
        let recursos_filtrados = Lista_recursos.filter((recurso) =>
        idmaquinaSeleccionado.has(String(recurso.idrecurso_riesgo).trim())
        );
    
        console.log("emp filtrados:", recursos_filtrados);
    
        if (recursos_filtrados.length === 0) {
        console.warn("No se encontraron emp coincidentes.");
        }
        return recursos_filtrados;
    }

function antes_Listar_Elementos(listar_elementos_seleccionados, seleccionados) {
    console.log(seleccionados);
    console.log(listar_elementos_seleccionados);
    console.log(Lista_procedimientos);
    if (Array.isArray(listar_elementos_seleccionados) && listar_elementos_seleccionados.length > 0 ) {
        listar_elementos_seleccionados.map((lista) => {
            let existe = Lista_procedimientos.some((orden) => Number(orden.recurso_riesgo_idrecurso_riesgo) === Number(lista.idrecurso_riesgo));
            if (!existe) {
                let item_seleccionado = seleccionados.find(
                    (obj) => Number(obj.recurso_riesgo_idrecurso_riesgo) === Number(lista.idrecurso_riesgo)
                );
                lista["idprocedimiento"] = item_seleccionado["idprocedimiento"];
                lista["npaso"] = item_seleccionado["npaso"];
                lista["efectividad"] = item_seleccionado["efectividad"];
                lista["instruccion"] = item_seleccionado["instruccion"];
                lista["recurso_riesgo_idrecurso_riesgo"] = item_seleccionado["recurso_riesgo_idrecurso_riesgo"];
                lista["riesgo_idriesgo"] = item_seleccionado["riesgo_idriesgo"];
                
        
                Lista_procedimientos.push(lista);
                
            } else {
                alert("El recurso ya se agrego");
                return;
            }
        });
    }
    listar_procedimiento();
}

function listar_procedimiento() {
    const listar = document.getElementById(`listar_procedimiento${codigo}`);
    let view = "", ind = 1;
    console.log(Lista_procedimientos);
    Lista_procedimientos.map((lista) => {
        let recurso = Lista_recursos.find(obj => Number(obj.idrecurso_riesgo) === Number(lista.recurso_riesgo_idrecurso_riesgo));
  
      view += `
      <tr>
         <td>${ind++}</td>             
         <td
            data-id="${lista.idprocedimiento}" 
            data-idriesgo="${lista.riesgo_idriesgo}" 
            data-idrecurso="${lista.recurso_riesgo_idrecurso_riesgo}"
            data-npaso="${lista.npaso}"
            data-efectividad="${lista.efectividad}"
            data-instruccion="${lista.instruccion}"
         
         >${recurso.codigo}</td>
        
         <td >${recurso.nombre_recurso}</td>
         <td >${lista.npaso}</td>
         <td >${lista.efectividad}</td>
         <td >${lista.instruccion}</td>
         <td>
             <div class="d-flex gap-3">
                 <div class="text-center">
                     <a 
                     data-id="Editar,
                     ${lista.recurso_riesgo_idrecurso_riesgo}"
                     class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn-edit"
                     style="width: 2.5rem; height: 2.5rem;"
                     title="Editar">
                         <i class="bi bi-pencil-square fs-5"></i>
                     </a>
                 </div>
                 <div class="text-center">
                     <a 
                     data-id="Anular,
                     ${lista.recurso_riesgo_idrecurso_riesgo}"
                     class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center btn-delete"
                     style="width: 2.5rem; height: 2.5rem;"
                     title="Eliminar">
                         <i class="bi bi-trash fs-5"></i>
                     </a>
                 </div>
                 
                 
                 
             </div>
                                        
         </td>
     </tr>
     `;//alert
    });
    listar.innerHTML = view;
  
    listar.querySelectorAll(".btn-delete").forEach((button) => {
      button.addEventListener("click", () => Anular(button));
    });
    const enlaces = document.querySelectorAll(".btn-edit");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", menuTabla);
        });
    // const input = document.getElementById(`filtro${codigo}`);
    // input.addEventListener("keyup", (e) => filtrar_table(e, input));
  }
  function menuTabla(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    switch (funcion) {
        
        case "Editar":
            toggleEditSave(event);
            break;
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            sitio();
            break;
    }

}
  async function toggleEditSave(event){
      
      const columnas = [
              {
                  index: 3,
                  editable: true,
                  type: 'number',
                  field: 'npaso',
                  validations: { required: true }
              },
              {
                  index: 4,
                  editable: true,
                  type: 'text',
                  field: 'efectividad',
                  validations: { required: true }
              },
             
              {
                  index: 5,
                  editable: true,
                  type: 'text',
                  field: 'instruccion',
                  validations: { required: true }
          
              }
          
          ];
      
      
        const resultado = await Editar_fila_(event, codigo, Lista_procedimientos, columnas, 'recurso_riesgo_idrecurso_riesgo');
      
        if (!resultado) {
          console.warn("No changes to save or operation cancelled.");
         
        }
        console.log(Lista_procedimientos);
        
      
       
  }
  
  function Anular(button) {
    console.log("===");
    const row = button.closest("tr"); // Obtener la fila actual
    const cellWithType = row.querySelector("td[data-id]"); // Selecciona la celda con el atributo data-type
    alert(cellWithType);
    if (cellWithType) {
      const currentType = Number(cellWithType.getAttribute("data-id")); 
      alert(currentType);// Obtén el valor actual
      if (currentType !== 0) {
        cellWithType.setAttribute("data-id", -Math.abs(currentType)); // Cambia el valor a negativo
        // Opcional: Ocultar la fila si deseas que desaparezca visualmente después de marcarla
        row.style.display = "none";
      } else {
        //eliminar totalmente de la tabla
        row.remove();
        Lista_procedimientos = Lista_procedimientos.filter(objeto => Number(objeto.idprocedimiento) !== Number(currentType));

      }
    }
  }
 function cancelar_todo(salir){
    //forme.reset();
    
    Lista_pedido_detalle = [];
    Listar_pedidoAlmacen();
    establecerFechaHoy();
    if(salir){
        lista_pedidos_material(code,permisos,refrescar);
    }
    
}





