
import { URL_APIE } from "../../../../lib/services.js"; 
import { URL_APIP } from "../../../../lib/services.js";
import * as listarFunctions from "../funciones/listar.js";
import * as registrarFuntions from "../funciones/registrar.js";
import { preparar_listas_vista_previa,listas_enviadas } from "../funciones/obtener.js";
let overlayy;
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";
let privilegios;
let listas ;
let id;
let id_compra;
let codigo;
let lista_carac_eval;
let Listas_Compras;
let Lista_Detalle_Compra;
let Lista_Material;
let Lista_Medidas;
let Lista_proveedor;
let Listas_Control_calidad;

const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "preparar_para_almacen";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}
async function listar() {
    try {
        const idEmpresa = uk[0].empresa.idempresa;
        // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
        const resultados = await Promise.all([
            listarFunctions.Listarcompras(idEmpresa),
            listarFunctions.Listarcompras_detalle(idEmpresa),
            listarFunctions.listar_material(idEmpresa),
            listarFunctions.listar_medidas(idEmpresa),
            listarFunctions.listarProveedor(idEmpresa),
            listarFunctions.Listar_detalle_control_calidad_Api(idEmpresa)
        ]);

        // Asignamos los resultados a las variables correspondientes
        Listas_Compras = resultados[0];
        Lista_Detalle_Compra = resultados[1];
        Lista_Material = resultados[2];
        Lista_Medidas = resultados[3];
        Lista_proveedor = resultados[4];
        Listas_Control_calidad = resultados[5];
    } catch (error) {
        console.error("Error al listar datos: ", error);
        throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
    }
}

export async function preparar_para_almacen(codigo_,code_,previlegios_,id_,id_compra_) {
    id = id_;
    codigo = codigo_;
    id_compra = id_compra_;
    app=document.querySelector(`.p-2[data-value="${code_}"] .card-body`);
    privilegios = previlegios_;
    lista_carac_eval = await listarFunctions.listadoOjitoControlCalidad(id);

    const modalCargando = document.getElementById('modalCargando');
    const spinner = document.getElementById('spinner');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const contenido = document.getElementById('contenido');

    modalCargando.style.display = 'flex';
    spinner.style.display = 'block';
    mensajeCargando.style.display = 'block';
    contenido.style.display = 'none';

    

    function tareaQueTarda() {
        return new Promise((resolve) => {
            setTimeout(() => {
                
                sitio();    
                resolve();
            }, 5000);
        });
    }

    try {
        await listar();
        await obtenerListas();
        await tareaQueTarda();
        spinner.style.display = 'none';
        mensajeCargando.style.display = 'none';
        contenido.style.display = 'block';
        modalCargando.style.display = 'none';
    } catch (error) {
        mensajeCargando.textContent = 'Ocurrió un error al cargar los datos';
        spinner.style.display = 'none';
        console.error(error);
    }
   
    
}
async function obtenerListas() {
    try {
        await preparar_listas_vista_previa(); 
        console.log(listas_enviadas);
        listas = listas_enviadas;
    } catch (error) {
        console.error('Error al obtener las listas:', error);
    }
}








const empresa = {
    nombre: uk[0].empresa.nombre,
    direccion: uk[0].empresa.direccion,
    ciudad: uk[0].empresa.ociudad || '',
    estado: uk[0].empresa.oestado || '',
    pais: uk[0].empresa.opais || '',
    logo: `${URL_APIE}${uk[0].empresa.logo}`,
    nit: uk[0].empresa.nit ? `NIT.: ${uk[0].empresa.nit}` : '',
    telefono: uk[0].empresa.telefono ? `Tel.: ${uk[0].empresa.telefono}` : '',
    celular : uk[0].empresa.ocelular ? `Cel.: ${uk[0].empresa.ocelular}` : '',
    email: uk[0].empresa.email || '',
    sitioWeb: uk[0].empresa.ositioweb || ''
}; 

async function sitio(){
    let listaAlmacen = await litar_caracteristicas();

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
    overlayy = overlay;
    const variable = document.createElement('div');
    variable.style.width = '1200px';
    variable.style.height = '500px';
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
    let view=`
        <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>
            <div id="Registro_almacen${codigo}">
            </div>
            <button type="button" class="btn btn-outline-success mr-1 mt-4 enviar" id="agre" >Enviar a almacén</button>
        <div id="modalCargando" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 1000; justify-content: center; align-items: center;">
            <div id="modalContent" style="background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); width: 300px; text-align: center;">
                <div id="spinner" style="border: 4px solid lightgray; border-top: 4px solid black; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
                    <p id="mensajeCargando" style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">Cargando, por favor espere...</p>
                <div id="contenido" style="display: none; font-family: Arial, sans-serif; font-size: 16px; color: #333;">Los datos se han cargado correctamente.</div>
            </div>
        </div>
            
    `;
    variable.innerHTML=view;
    console.log(listaAlmacen);
    llenardatos(listaAlmacen);
    variable.addEventListener('click', function(event) {
        //console.log(event.target);
        let aTag = event.target.closest('a.cerrar');
        let send = event.target.closest('button.enviar');
        if (aTag) {
            event.preventDefault();
            cerrarModal();

        }
        if(send){
            event.preventDefault();
            let datos_recolectados = recolectar_datos();
            registrar_Almacen(datos_recolectados);
        }
       
    });
    function cerrarModal() {
        overlay.remove(); 
        app.style.removeProperty('position');  
    }

}

async function registrar_Almacen(lista) {
    let linea = true;

    for (const item of lista) {
        const formData = new FormData();
       
        formData.append('verDavid', 'registrarStockMateriaPrima');

        formData.append('cantidad', item.cantidad);
        formData.append('costo_unitario', item.costo_unitario);
        formData.append('fecha_caducidad', item.fecha_caducidad);
        formData.append('material_idmaterial', item.material_idmaterial);
        formData.append('empresa_idempresa', item.empresa_idempresa);
        formData.append('control_calidad_idcontrol_calidad', item.control_calidad_idcontrol_calidad);
        formData.append('proveedor_idproveedor', item.proveedor_idproveedor);
        formData.append('seccion_idseccion', item.seccion_idseccion);
        formData.append('compra_idcompra', item.compra_idcompra);


        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        fetch(`${URL_APIP}/api/`, {
            method: "POST",
            body: formData,
            headers: {
                'Usar-Registro-David': 'true'
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if(data[0] === "success"){
                
            }else{
                return;
            }
        });
    }
    console.log(linea);

    if(linea){
        overlayy.remove(); 
        app.style.removeProperty('position'); 
        
    }
   
}
function llenardatos(listaAlmacen){
    const area = document.querySelector(`#Registro_almacen${codigo}`);
    console.log(listaAlmacen);
    console.log(Listas_Control_calidad);

    // console.log(Lista_Detalle_Compra);
    // console.log(Lista_Material);
    // console.log(Lista_Medidas);
    // console.log(Lista_proveedor);
    // console.log(id_compra);
    //console.log(compra);

    let compra = Listas_Compras.find(obj => obj.id === Number(id_compra));
    console.log(compra);
    let Proveedor = Lista_proveedor.find(obj => Number(obj.id) === compra.proveedor_id);
    let view = "", ind =1;
    listaAlmacen.map(lista => {
        let control_calidad = Listas_Control_calidad.find(obj => obj.iddetalle_control_calidad === lista[4]);
        console.log(control_calidad);
        let material = Lista_Material.find(obj => obj.id === lista[2]);
        console.log(material);
        let medida = Lista_Medidas.find(obj => obj.id === material.medida);
        console.log(medida);
        let detalle = Lista_Detalle_Compra.find(obj => obj.id === lista[3]);
        console.log(detalle);
        view += `
                <div class="row align-items-center mb-3 p-2 border rounded bg-light shadow-sm mt-4" id="datos_almacen${subcodigo}">
                    <input type="hidden" class="form-control" id="" name="material_idmaterial${ind}" value="${material.id}">
                    <input type="hidden" class="form-control" id="" name="seccion_idseccion${ind}" value="${material.seccion}">
                    <input type="hidden" class="form-control" id="" name="proveedor_idproveedor${ind}" value="${Proveedor.id}">
                    <input type="hidden" class="form-control" id="" name="compra_idcompra${ind}" value="${id_compra}">
                    <input type="hidden" class="form-control" id="" name="control_calidad_idcontrol_calidad${ind}" value="${control_calidad.control_calidad_idcontrol_calidad}">

                    <div class="col-1 text-center">
                        <label class="form-label fw-bold text-primary">${ind}</label>
                    </div>

                    <div class="col-2">
                        <label for="insumo" class="form-label">Insumo:</label>
                        <input type="text" class="form-control" id="insumo" name="insumo" value="${lista[1]}" required readonly>
                      
                    </div>

                    <!-- Cantidad (input number) -->
                    <div class="col-2">
                        <label for="cantidad" class="form-label">Cantidad:</label>
                        <input type="number" class="form-control" id="cantidad" name="cantidad${ind}" value="${lista[0]}" min="0" required readonly>
                    </div>

                    <!-- Medida (input text o select) -->
                    <div class="col-1">
                        <label for="medida" class="form-label">Medida:</label>
                        <input type="text" class="form-control" id="medida" name="medida" value="${medida.nombre}" required readonly>
                    </div>

                    <!-- Proveedor (input text o select) -->
                    <div class="col-2">
                        <label for="proveedor" class="form-label">Proveedor:</label>
                        <input type="text" class="form-control" id="proveedor" name="proveedor" value="${Proveedor.nombre}" required readonly>
                    </div>

                    <!-- Fecha de caducidad (input date) -->
                    <div class="col-2">
                        <label for="fechaCaducidad" class="form-label">Fecha caducidad:</label>
                        <input type="date" class="form-control" id="fecha_caducidad" name="fecha_caducidad${ind}" value="${detalle.fecha_vencimiento}" required readonly> 
                    </div>

                    <!-- Precio unitario (input number) -->
                    <div class="col-1">
                        <label for="costo_unitario" class="form-label">Costo unitario:</label>
                        <input type="number" step="0.01" class="form-control text-success" id="costo_unitario" name="costo_unitario${ind}" value="${detalle.precio_unitario}" required readonly>
                    </div>
                </div>
        `;
        ind++;
    })
    area.innerHTML = view;
}


function recolectar_datos() {
    const areaform = document.getElementById(`Registro_almacen${codigo}`);
    console.log(areaform);
    const rows = areaform.querySelectorAll(`.row`); // Seleccionar todas las filas generadas

    let evaluaciones = []; // Array donde guardaremos los objetos

    rows.forEach((row, index) => {

        let cantidad = row.querySelector(`input[name="cantidad${index + 1}"]`).value;
        let costo_unitario = row.querySelector(`input[name="costo_unitario${index + 1}"]`).value;
        let fecha_caducidad = row.querySelector(`input[name="fecha_caducidad${index + 1}"]`).value;
        let material_idmaterial = row.querySelector(`input[name="material_idmaterial${index + 1}"]`).value;
        let empresa_idempresa = uk[0].empresa.idempresa;
        let control_calidad_idcontrol_calidad = row.querySelector(`input[name="control_calidad_idcontrol_calidad${index + 1}"]`).value;
        let proveedor_idproveedor = row.querySelector(`input[name="proveedor_idproveedor${index + 1}"]`).value;
        let seccion_idseccion = row.querySelector(`input[name="seccion_idseccion${index + 1}"]`).value;
        let compra_idcompra = row.querySelector(`input[name="compra_idcompra${index + 1}"]`).value;
        

        evaluaciones.push({
            cantidad : cantidad,
            costo_unitario : costo_unitario,
            fecha_caducidad : fecha_caducidad,
            material_idmaterial : material_idmaterial,
            empresa_idempresa : empresa_idempresa,
            control_calidad_idcontrol_calidad : control_calidad_idcontrol_calidad,
            proveedor_idproveedor : proveedor_idproveedor,
            seccion_idseccion : seccion_idseccion,
            compra_idcompra : compra_idcompra
        });
    });

   

    return evaluaciones;
   
}
async function litar_caracteristicas(){
    let listaAlmacen=[];
    console.log(lista_carac_eval);
    lista_carac_eval.forEach((firstLevel) => {
        listaAlmacen.push(listarMateriales(firstLevel));
        if (Array.isArray(firstLevel)) {
            firstLevel.forEach((secondLevel) => {
                if (Array.isArray(secondLevel)){
                    secondLevel.forEach((item) => {
                       // console.log(item);
                    });
                }
            });
        } else {
            console.error("firstLevel no es un array:", firstLevel);
        }
    });
    return listaAlmacen;
    
}
function listarMateriales(datos) {
    let cantidad =0;
    let material =0;
    let idmaterial = 0;
    let iddetallecompra =0;
    let iddetalle_controlcalidad = 0;
    datos.forEach((lista) => {
        console.log(lista);
        
        let itemcriterio = listas.Criterio.find(obj => obj.idcriterio_control_calidad === lista[0].criterio_control_calidad_idcriterio_control_calidad);
        console.log(itemcriterio);
        if(itemcriterio.destino === "Almacén"){
            cantidad += itemcriterio.cantidad;
            material = lista[0].nombre_mat;
            idmaterial = lista[0].idmaterial;
            iddetallecompra = lista[0].iddetalle_compra;
            iddetalle_controlcalidad = lista[0].iddetalle_control_calidad;
        }
    });
    console.log(cantidad);
    console.log(material);
    console.log(idmaterial);
    return [cantidad,material ,idmaterial,iddetallecompra,iddetalle_controlcalidad];
}

