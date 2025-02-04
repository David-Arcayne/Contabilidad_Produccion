import { ListaCompra_Soli, codigo, idcompra, proveedorGeneral, loteGeneral, idRegistro,compras,mostrarCompras} from "../listaSolicitudess/listaSolicitudes.js";
import { ListaCompra_Soli_Editable, SumaTotalCompraEdit, listar_compraPorProveedorEdit, listarEdicionCompraEspera, formularioEditarSoli} from "../listaSolicitudess/editarRegistros.js";
import { medidaArray } from "./selectsFormulario.js";
import { listarTipo_envase,listarmedida,listarProveedorSelect, listarMaterial,listarProveedor,listarMaterial2, listarmedida2 } from "./selectsFormulario.js";
import { listaCompraEnEspera, formularioCompra, comprarListaSolicitud, listar_compraPorProveedor, SumaTotalCompra, comprarPorProveedor} from "../listaSolicitudess/listaSolicitudes.js";
import { URL_APIP } from "../../../../lib/services.js";
import { mostrar_ordenproduccion } from "../funciones/listar.js";
let obt_material_aux = {
    seccion: -1,
    codigo: "",
    estado: -1,
    fecha: "",
    hora: "",
    id: -1,
    medida: -1,
    nombre: "",
    tipo: -1
};
export function editarListaCompraSoli(event,idRegEdit) {
    console.log(ListaCompra_Soli);
    console.log(compras);
    const permisos = [1, 2, 3, 4, 5, 7];
    // contenidoEnvase  cantEnvase  tipoEnvase  material
const names = ["material", "cantidad", "tipoEnvase", "medida", "contenido", "precioUni", "fechaVenci"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
console.log(celdas);
const dataid = boton.getAttribute('data-id');
console.log(dataid);
console.log(fila);
const [funcion, id1, id2] = dataid.split(',');
const objmaterial = compras.find(obj => obj.id == Number(id1));
console.log(objmaterial);
console.log(compras);
const objmaterialc = { ...objmaterial };
let originalValues = {};

console.log(funcion, id1, id2);

if (boton.innerHTML.includes('bi-pencil-square')) {
    // Modo Editar
    let firstInput;
    celdas.forEach((celda, index) => {
        if (permisos.includes(index)) {
            const valorOriginal = celda.textContent.trim();
            console.log(valorOriginal);
            originalValues[index] = valorOriginal;
    
            let input;
            let select;
            console.log("soy el index numero: "+ index);
            if (index === 1 || index === 3 || index === 4) {

                if (index === 4) {
                    // Crear el primer input solo con valores numéricos (editable)
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
                input.className = "form-control";
                input.type = "number";  // Solo valores numéricos
                input.value = valorOriginal.match(/\d+/)[0];  // Extraer el valor numérico

                // Crear el segundo input (no editable)
                const secondInput = document.createElement('input');
                secondInput.id = `ediinp${codigo}_second`;
                secondInput.className = "form-control";
                secondInput.type = "text";
                secondInput.value = valorOriginal.match(/[a-zA-Z]+/g);
                secondInput.readOnly = true;  // Hacer el segundo input no editable

                // Limpiar la celda y añadir ambos elementos
                celda.innerHTML = '';
                celda.appendChild(input);
                celda.appendChild(secondInput);
                } else {
                    // Crear y añadir solo el select
                    select = createSelectElement(names[permisos.indexOf(index)]);
                    console.log(select);
                    if (select) {
                        celda.innerHTML = '';
                        select.value = objmaterial[names[permisos.indexOf(index)]];
                        celda.appendChild(select);
                    } else {
                        console.error(`No se encontró el elemento con id #${names[index]}`);
                        return;
                    }
                }
            }else if(index === 7){
                // Crear y añadir solo el input
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
                input.className = "form-control";
                input.type = "date";
                input.value = valorOriginal;
                celda.innerHTML = '';
                celda.appendChild(input);
            }else {
                // Crear y añadir solo el input
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
                input.className = "form-control";
                input.type = "text";
                input.value = valorOriginal;
                celda.innerHTML = '';
                celda.appendChild(input);
            }
                 // Añadir evento de teclado
                 console.log(input);
                 console.log(select);
                 if(input){
                    input.addEventListener("keydown", handleKeyDown);
                 }else{
                    select.addEventListener("keydown", handleKeyDown);
                 }

            // Establecer el primer input para enfocar
            if (!firstInput) {
                firstInput = input;
            }
        }
    });
    


    // Enfocar el primer input
    if (firstInput) {
        firstInput.focus();
    }
    boton.innerHTML = '<i class="bi bi-floppy"></i>';
} else {
    guardarCambios();
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        console.log("estoy en el enterrrr");
        guardarCambios();
    } else if (event.key === "Escape") {
        cancelarCambios();
    }
}

    function guardarCambios() {
        const datosnuevos = [];
        let linea = true;
        let nuevoValor = "";
        console.log(celdas);
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector(`input`);

                const select = celda.querySelector('select');
                if(input && select){
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }

                    nuevoValor = select.value;
                    let aux = medidaArray.find(obj => obj.id === Number(nuevoValor));
                    console.log(nuevoValor);
                    celda.textContent += " "+aux.sigla;//select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);
                }else if (input) {
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            console.log(datosnuevos);
            console.log(objmaterial);
            // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
            objmaterial['material'] = datosnuevos[0];
            objmaterial['cantidad'] = datosnuevos[1];
            objmaterial['tipoEnvase'] =Number(datosnuevos[2]);
            objmaterial['contenido'] = Number(datosnuevos[3]);
            objmaterial['precioUni'] = Number(datosnuevos[4]);
            objmaterial['fechaVenci'] = datosnuevos[5];
            // objmaterial['fechaVenci'] = datosnuevos[6];
            if (objmaterial) {
                Object.assign(compras, objmaterial);
            }
            console.log(compras);
            console.log(objmaterial);
            console.log(objmaterialc);
            console.log(areObjectsEqual(objmaterial, objmaterialc));
            if (!areObjectsEqual(objmaterial, objmaterialc)) {
                const formData = new FormData();
                formData.append('verDavid', "editarListaCompraSoli");
                formData.append('empresa', id2);
                Object.entries(objmaterial).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_material_aux = { ...obt_material_aux, ...objmaterialc };
                sendformData(event, formData, idRegEdit);
            }

            console.log(ListaCompra_Soli);

            boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            console.log(celdas);
            celdas.forEach(celda => {
                const input = celda.querySelector(`#ediinp${codigo}`);
                console.log(input);
                if (input) {
                    input.removeEventListener("keydown", handleKeyDown);
                }
            });
        }else{
            cancelarCambios();
        }
    }
   
    function cancelarCambios() {
        
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector('input');
                const select = celda.querySelector('select');
                
                if (input) {
                    celda.innerHTML = originalValues[index];
                } else if (select) {
                    celda.innerHTML = originalValues[index];
                }
            }
        });

        boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
        celdas.forEach(celda => {
            const input = celda.querySelector(`#ediinp${codigo}`);
            console.log(input);
            if (input) {
                input.removeEventListener("keydown", handleKeyDown);
            }
        });
    }

    boton.removeEventListener("click", editarListaCompraSoli);
    boton.addEventListener("click", editarListaCompraSoli);
}
function createSelectElement(inpKey) {
    console.log(inpKey); 
    const elementId = `${inpKey}${codigo}`;
    console.log(elementId);
    const innerHTMLContent = document.querySelector(`#${elementId}`).innerHTML;
    console.log(innerHTMLContent);
    if (!innerHTMLContent) return null;
    
    const select = document.createElement('select');
    select.className = 'form-select';
    select.name = inpKey;
    select.innerHTML = innerHTMLContent;
    return select;
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
function sendformData(event, formData, idRegEdit) {
    event.preventDefault();
    fetch(`${URL_APIP}/api/`, { // Reemplaza esto con la URL de tu servidor
        method: 'POST',
        body: formData,
        headers: {
            'Usar-Registro-David': 'true'
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        // alertas(data);
        console.log(data);
        if(data[0]=="success"){
            formData.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
            
            setTimeout(() => {
                
                // form.reset();
                formularioCompra(idRegEdit);
                listarProveedorSelect("proveedor", proveedorGeneral)
                .then(() =>listarMaterial(`material${codigo}`))
                .then(() =>  listarTipo_envase(`tipoEnvase${codigo}`))
                .then(() =>   listarmedida(`medida${codigo}`))
                .then(() => {
                    // comprarListaSolicitud(id1); 
                    // listar_compraPorProveedor(idRegEdit);
                    mostrarCompras();
                    listaCompraEnEspera(idRegEdit);
                    comprarListaSolicitud(idRegEdit);
                     SumaTotalCompra(idRegEdit);
                    const forme = document.querySelector(`#formularioCompraProveedor${codigo}`);
                    console.log(forme);
                    forme.addEventListener("submit", (e) => comprarPorProveedor(e, forme,idRegEdit));
                    forme.reset();
                }).catch(error => {
                    console.error('Error en la cadena de promesas:', error);
                });
            }, 2000);
            return;
        }else{
            formData.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
        setTimeout(() => {
            formData.remove();
            sitio(false);
        }, 3000);
        return;
    }
        
    })
    .catch(error => {
        console.error('Error al enviar los datos:', error);
    });
}

export function edit_Celda_table(e,idRegEdit){
    const target = e.target;
    //   let input = null;
        let select = null;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');            
            let listaCompra_obj = ListaCompra_Soli.find(obj => obj.id == Number(inpId));
            const confirm = { ...listaCompra_obj };
            let input = null;
            console.log(inpKey);
            if (inpKey === "contenido") {
                        target.classList.add("editing");
                        target.innerHTML = '';
            console.log(listaCompra_obj);
                        // Crear el input
                        input = document.createElement("input");
                        input.type = "text";
                        input.value = listaCompra_obj["contenido"];
                        input.className = "form-control";
                        // Crear el select
                        target.classList.add("editing");
                        target.innerHTML = '';
                        select = createSelectElement("medida");
                        select.value = listaCompra_obj["medida"];
                        // Añadir ambos elementos a la celda
                        target.appendChild(input);
                        target.appendChild(select);
                        input.focus();
                        // target.focus();
        }else if(inpKey === "material" || inpKey === "tipoEnvase"){
                input = createSelectElement(inpKey);
                if (input) {
                    target.classList.add("editing");
                    target.innerHTML = '';
                    target.appendChild(input);
                    input.focus();
                    console.log(input);
                    console.log(listaCompra_obj);
                    input.value = listaCompra_obj[inpKey];
                    
                    
                } else {
                    console.error(`No se encontró el elemento con id #${inpKey}${codigo}`);
                }
            }else if(inpKey === "fechaVenci"){
                // Convierte el valor original a un objeto Date
                let dateValue = new Date(originalValue);
                
                // Formatea la fecha en el formato adecuado para el input de tipo date (YYYY-MM-DD)
                let formattedDate = dateValue.toISOString().split('T')[0];
                
                console.log(formattedDate);
                target.classList.add("editing");
                target.innerHTML = `<input type="date" value="${formattedDate}" class="form-control" />`;

                input = target.querySelector("input");
                input.focus();
            }else if(inpKey === "precioUni" || inpKey === "cantidad"){
                target.classList.add("editing");
                target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

                input = target.querySelector("input");
                input.focus();
            }
            
            console.log(input);
            console.log(select);
            if(input){
                console.log(input);
                
                input.addEventListener("keydown", function(event) {
                    if (event.key === "Enter") {
                        
                        target.classList.remove("editing");
                        console.log(confirm);
                        let aux ;
                        let aux2;
                        if(select != null  && input.tagName.toLowerCase() != "select"){
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                            target.textContent = select.options[select.selectedIndex].text || originalValue;
                            aux2 = Number(select.value) || confirm[inpKey];
                        }else if (input.tagName.toLowerCase() === "select") {
                            target.textContent = input.options[input.selectedIndex].text || originalValue;
                            aux = Number(input.value) || confirm[inpKey];

                        } else {
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                        }
                        
                        console.log(listaCompra_obj);
                        console.log(inpKey);
                        Object.entries(listaCompra_obj).forEach(([key, value]) => {
                            console.log(key);
                            if(key === inpKey){
                                if(inpKey === "contenido"){
                                    listaCompra_obj[key] = aux ;
                                    listaCompra_obj["medida"] = aux2;
                                }else{
                                listaCompra_obj[key] = aux ; //key=contenidoEnvase
                            }
                        }
                        });
                        console.log(listaCompra_obj);
                        if (listaCompra_obj) {
                            Object.assign(ListaCompra_Soli, listaCompra_obj);
                        }
                        console.log(ListaCompra_Soli);
                        console.log(areObjectsEqual(listaCompra_obj,confirm));
                        if(!areObjectsEqual(listaCompra_obj,confirm)){
                            const formData = new FormData();
                            formData.append('verDavid', "editarListaCompraSoli");
                            formData.append('id', inpId);
                            formData.append('empresa', id2);
                            Object.entries(listaCompra_obj).forEach(([key, value]) => {
                                formData.append(key,value);
                            });
                            obt_material_aux = { ...obt_material_aux, ...confirm };
    
                            sendformData(e,formData, idRegEdit);
                        }
                        
                       
                    } else if (event.key === "Escape") {
                        target.classList.remove("editing");
                        target.textContent = originalValue;
                    }
                });
    
                target.addEventListener("blur", function() {
                    target.classList.remove("editing");
                    target.textContent = originalValue;
                });
            }
            
            
        }
}

export function editarListaCompraSoli_Edicion(event,idcompra) {
    console.log(ListaCompra_Soli_Editable);
    const permisos = [1, 2, 3, 4, 5, 7];
    // contenidoEnvase  cantEnvase  tipoEnvase  material
const names = ["materialEd", "cantidadEd", "tipoEnvaseEd", "medidaEd", "contenidoEd", "precioUniEd", "fechaVenciEd"];
const boton = event.currentTarget;
const fila = boton.closest("tr");
const celdas = fila.querySelectorAll("td");
console.log(celdas);
const dataid = boton.getAttribute('data-id');
console.log(dataid);
console.log(fila);
const [funcion, id1, id2] = dataid.split(',');
const objmaterial = ListaCompra_Soli_Editable.find(obj => obj.id == Number(id1));
console.log(objmaterial);
console.log(ListaCompra_Soli_Editable);
const objmaterialc = { ...objmaterial };
let originalValues = {};

console.log(funcion, id1, id2);

if (boton.innerHTML.includes('bi-pencil-square')) {
    // Modo Editar
    let firstInput;
    celdas.forEach((celda, index) => {
        if (permisos.includes(index)) {
            const valorOriginal = celda.textContent.trim();
            console.log(valorOriginal);
            originalValues[index] = valorOriginal;
    
            let input;
            let select;
            console.log("soy el index numero: "+ index);
            if (index === 1 || index === 3 || index === 4) {

                if (index === 4) {
                    // Crear y añadir el input solo con valores numéricos
                    input = document.createElement('input');
                    input.id = `ediinp${codigo}`;
                    input.className = "form-control";
                    input.type = "number";  // Solo valores numéricos
                    input.value = valorOriginal.match(/\d+/)[0];  // Extraer el valor numérico
    
                    // Crear y añadir el select
                    select = createSelectElement(names[permisos.indexOf(index)]);
                    select.value = objmaterial[names[permisos.indexOf(index)]];
    
                    // Limpiar la celda y añadir ambos elementos
                    celda.innerHTML = '';
                    celda.appendChild(input);
                    celda.appendChild(select);
                } else {
                    // Crear y añadir solo el select
                    select = createSelectElement(names[permisos.indexOf(index)]);
                    console.log(select);
                    if (select) {
                        celda.innerHTML = '';
                        select.value = objmaterial[names[permisos.indexOf(index)]];
                        celda.appendChild(select);
                    } else {
                        console.error(`No se encontró el elemento con id #${names[index]}`);
                        return;
                    }
                }
            }else if(index === 7){
                // Crear y añadir solo el input
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
                input.className = "form-control";
                input.type = "date";
                input.value = valorOriginal;
                celda.innerHTML = '';
                celda.appendChild(input);
            }else {
                // Crear y añadir solo el input
                input = document.createElement('input');
                input.id = `ediinp${codigo}`;
                input.className = "form-control";
                input.type = "text";
                input.value = valorOriginal;
                celda.innerHTML = '';
                celda.appendChild(input);
            }
                 // Añadir evento de teclado
                 console.log(input);
                 console.log(select);
                 if(input){
                    input.addEventListener("keydown", handleKeyDown);
                 }else{
                    select.addEventListener("keydown", handleKeyDown);
                 }

            // Establecer el primer input para enfocar
            if (!firstInput) {
                firstInput = input;
            }
        }
    });
    


    // Enfocar el primer input
    if (firstInput) {
        firstInput.focus();
    }
    boton.innerHTML = '<i class="bi bi-floppy"></i>';
} else {
    guardarCambios();
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        console.log("estoy en el enterrrr");
        guardarCambios();
    } else if (event.key === "Escape") {
        cancelarCambios();
    }
}

    function guardarCambios() {
        const datosnuevos = [];
        let linea = true;
        let nuevoValor = "";
        console.log(celdas);
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector(`input`);

                const select = celda.querySelector('select');
                if(input && select){
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }

                    nuevoValor = select.value;
                    let aux = medidaArray.find(obj => obj.id === Number(nuevoValor));
                    console.log(nuevoValor);
                    celda.textContent += " "+aux.sigla;//select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);
                }else if (input) {
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        console.log(nuevoValor);
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            console.log(datosnuevos);

            // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
            objmaterial['materialEd'] = datosnuevos[0];
            objmaterial['cantidadEd'] = datosnuevos[1];
            objmaterial['tipoEnvaseEd'] =Number(datosnuevos[2]);
            objmaterial['contenidoEd'] = Number(datosnuevos[3]);
            objmaterial['medidaEd'] = Number(datosnuevos[4]);
            objmaterial['precioUniEd'] = Number(datosnuevos[5]);
            objmaterial['fechaVenciEd'] = datosnuevos[6];
            if (objmaterial) {
                Object.assign(ListaCompra_Soli_Editable, objmaterial);
            }
            console.log(ListaCompra_Soli);
            console.log(objmaterial);
            console.log(objmaterialc);
            console.log(areObjectsEqual(objmaterial, objmaterialc));
            if (!areObjectsEqual(objmaterial, objmaterialc)) {
                const formData = new FormData();
                formData.append('verDavid', "editarListaCompraSoli_Edicion");
                formData.append('empresa', id2);
                Object.entries(objmaterial).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                obt_material_aux = { ...obt_material_aux, ...objmaterialc };
                formularioEditarSoli2(event, formData, idcompra);
            }

            console.log(ListaCompra_Soli_Editable);

            boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            console.log(celdas);
            celdas.forEach(celda => {
                const input = celda.querySelector(`#ediinp${codigo}`);
                console.log(input);
                if (input) {
                    input.removeEventListener("keydown", handleKeyDown);
                }
            });
        }else{
            cancelarCambios();
        }
    }
   
    function cancelarCambios() {
        
        celdas.forEach((celda, index) => {
            if (permisos.includes(index)) {
                const input = celda.querySelector('input');
                const select = celda.querySelector('select');
                
                if (input) {
                    celda.innerHTML = originalValues[index];
                } else if (select) {
                    celda.innerHTML = originalValues[index];
                }
            }
        });

        boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
        celdas.forEach(celda => {
            const input = celda.querySelector(`#ediinp${codigo}`);
            console.log(input);
            if (input) {
                input.removeEventListener("keydown", handleKeyDown);
            }
        });
    }

    boton.removeEventListener("click", editarListaCompraSoli_Edicion);
    boton.addEventListener("click", editarListaCompraSoli_Edicion);
}

function formularioEditarSoli2(e, form,idcompra) {
    e.preventDefault();
    console.log(form);
    console.log(idcompra);
    // const dato = new FormData(form);
    // console.log(dato);
        fetch(`${URL_APIP}/api/`,{
            method:"POST",
            body:form,
            headers: {
                'Usar-Registro-David': 'true'
                }
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data[0]=="success"){
                form.innerHTML=`<div class="alert alert-success" id="alerta">${data[1]}</div>`;
                
                setTimeout(() => {
                    
                    //  form.reset();
                    // sitio(false);idRegistro, idpedido, proveedorGeneral, loteGeneral
                    listarEdicionCompraEspera(idcompra,idRegistro,proveedorGeneral,loteGeneral)
                    // listarMaterial(`material${codigo}`)
                    listarProveedorSelect("proveedorEd", proveedorGeneral)
                    listarMaterial(`materialEd${codigo}`)
                    .then(() =>  listarTipo_envase(`tipoEnvaseEd${codigo}`))
                    .then(() =>   listarmedida(`medidaEd${codigo}`))
                    .then(() => {
                        // listar_ListaCompra_Editable(idcompra);
                        listar_compraPorProveedorEdit(idcompra);
                        SumaTotalCompraEdit(idcompra);
                        const formEdit = document.querySelector(`#formularioCompraEditar${codigo}`);
                        console.log(formEdit);
                        formEdit.addEventListener("submit", (e) => formularioEditarSoli(e, formEdit,idcompra));
                        formEdit.reset();
                    });
                }, 2000);
                return;
            }else{
            form.innerHTML=`<div class="alert alert-danger" id="alerta">${data[1]}</div>`;
            setTimeout(() => {
                form.remove();
                sitio(false);
            }, 3000);
            return;
        }
        })       
}

export function edit_Celda_table_edicion(e,idRegEdit){
    const target = e.target;
    console.log(idRegEdit);
    //   let input = null;
        let select = null;
        if (target.tagName.toLowerCase() === "td" && !target.classList.contains("editing")) {
            const originalValue = target.textContent;
            const dataType = target.getAttribute("data-type");
            const [inpId,inpKey,id2] = dataType.split(',');            
            let listaCompra_obj = ListaCompra_Soli_Editable.find(obj => obj.id == Number(inpId));
            const confirm = { ...listaCompra_obj };
            let input = null;
            console.log(inpKey);
            if (inpKey === "contenidoEd") {
                        target.classList.add("editing");
                        target.innerHTML = '';
            console.log(listaCompra_obj);
                        // Crear el input
                        input = document.createElement("input");
                        input.type = "text";
                        input.value = listaCompra_obj["contenidoEd"];
                        input.className = "form-control";
                        // Crear el select
                        target.classList.add("editing");
                        target.innerHTML = '';
                        select = createSelectElement("medidaEd");
                        select.value = listaCompra_obj["medidaEd"];
                        // Añadir ambos elementos a la celda
                        target.appendChild(input);
                        target.appendChild(select);
                        input.focus();
                        // target.focus();
        }else if(inpKey === "materialEd" || inpKey === "tipoEnvaseEd"){
                input = createSelectElement(inpKey);
                if (input) {
                    target.classList.add("editing");
                    target.innerHTML = '';
                    target.appendChild(input);
                    input.focus();
                    console.log(input);
                    console.log(listaCompra_obj);
                    input.value = listaCompra_obj[inpKey];
                    
                    
                } else {
                    console.error(`No se encontró el elemento con id #${inpKey}${codigo}`);
                }
            }else if(inpKey === "fechaVenciEd"){
                // Convierte el valor original a un objeto Date
                let dateValue = new Date(originalValue);
                
                // Formatea la fecha en el formato adecuado para el input de tipo date (YYYY-MM-DD)
                let formattedDate = dateValue.toISOString().split('T')[0];
                
                console.log(formattedDate);
                target.classList.add("editing");
                target.innerHTML = `<input type="date" value="${formattedDate}" class="form-control" />`;

                input = target.querySelector("input");
                input.focus();
            }else if(inpKey === "precioUniEd" || inpKey === "cantidadEd"){
                target.classList.add("editing");
                target.innerHTML =`<input type="text" value="${originalValue}" class ="form-control" />`;

                input = target.querySelector("input");
                input.focus();
            }
            
            console.log(input);
            console.log(select);
            if(input){
                console.log(input);
                
                input.addEventListener("keydown", function(event) {
                    if (event.key === "Enter") {
                        
                        target.classList.remove("editing");
                        console.log(confirm);
                        let aux ;
                        let aux2;
                        if(select != null  && input.tagName.toLowerCase() != "select"){
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                            target.textContent = select.options[select.selectedIndex].text || originalValue;
                            aux2 = Number(select.value) || confirm[inpKey];
                        }else if (input.tagName.toLowerCase() === "select") {
                            target.textContent = input.options[input.selectedIndex].text || originalValue;
                            aux = Number(input.value) || confirm[inpKey];

                        } else {
                            target.textContent = input.value || originalValue;
                            aux = input.value || confirm[inpKey];

                        }
                        
                        console.log(listaCompra_obj);
                        console.log(inpKey);
                        Object.entries(listaCompra_obj).forEach(([key, value]) => {
                            console.log(key);
                            if(key === inpKey){
                                if(inpKey === "contenidoEd"){
                                    listaCompra_obj[key] = aux ;
                                    listaCompra_obj["medidaEd"] = aux2;
                                }else{
                                listaCompra_obj[key] = aux ; //key=contenidoEnvase
                            }
                        }
                        });
                        console.log(listaCompra_obj);
                        if (listaCompra_obj) {
                            Object.assign(ListaCompra_Soli_Editable, listaCompra_obj);
                        }
                        console.log(ListaCompra_Soli_Editable);
                        console.log(areObjectsEqual(listaCompra_obj,confirm));
                        if(!areObjectsEqual(listaCompra_obj,confirm)){
                            const formData = new FormData();
                            formData.append('verDavid', "editarListaCompraSoli_Edicion");
                            formData.append('id', inpId);
                            formData.append('empresa', id2);
                            Object.entries(listaCompra_obj).forEach(([key, value]) => {
                                formData.append(key,value);
                            });
                            obt_material_aux = { ...obt_material_aux, ...confirm };
    
                            formularioEditarSoli2(e,formData, idRegEdit);
                        }
                        
                       
                    } else if (event.key === "Escape") {
                        target.classList.remove("editing");
                        target.textContent = originalValue;
                    }
                });
    
                target.addEventListener("blur", function() {
                    target.classList.remove("editing");
                    target.textContent = originalValue;
                });
            }
            
            
        }
}