let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "solicitar_material_produccion";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function solicitar_material_produccion(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}

function sitio(){
    let view=`
        <div class="container">
        
        <h5 class="text-center mb-4 fw-bold fs-6">Solicitar material a almacen</h5>

        <form id="formulario${codigo}">
            <input type="hidden" name="estado" value="0">
            <input type="hidden" name="empresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" name="idempleado" value="${uk[0].idusuario}">

            <div class="row g-3">
                 <div class="row g-3">
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Usuario:</label>
                    <input type="text" class="form-control" id="empleado" name="empleado" value = "${uk[0].nombre}" readonly>
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha:</label>
                    <input type="date" class="form-control" id="fecha" name="fecha">
                </div>

                <div class="col-md-4">
                    
                    <div class="row">
                        <div class = "col">
                            <label for="hora" class="form-label">Hora de Control de Calidad</label>
                            <input type="text" class="form-control" id="hora" name="hora" >
                        </div>
                        <div class="col mt-4">
                            <button type="button" id="editarHora" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Editar</button>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <label for="material_idmaterial" class="form-label">Material:</label>
                    <select id="material_idmaterial${codigo}" name="material_idmaterial" class="form-select">
                        <option value="1">Material A</option>
                        <option value="2">Material B</option>
                    </select>
                </div>

                <div class="col-md-4">
                    <label for="cantidad" class="form-label">Cantidad:</label>
                    <input type="number" class="form-control" id="cantidad" name="cantidad" required>
                </div>
                <div class="col-md-4">
                    <label for="material_idmaterial" class="form-label">Medida:</label>
                    <select id="medida_idmedida${codigo}" name="material_idmaterial" class="form-select">
                        <option value="1">L</option>
                        <option value="2">Kg</option>
                    </select>
                </div>

                <div class="col-md-12">
                    <label for="observaciones" class="form-label">Observaciones:</label>
                    <textarea class="form-control" id="observaciones" name="observaciones" required></textarea>
                </div>

                <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id = "limpiar${codigo}">Limpiar</button>
                    <button type="submit" class="btn btn-success btn-lg"><i class="bi bi-plus-lg"></i></button>
                    
                </div>

            </div>
        </form>
        <div id="alerta${codigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Material</th>
                    <th scope="col">Codigo</th>
                    <th scope="col">Medida</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="ListarOrdenProduccion${codigo}">
              
            </tbody>
        </table>
        <div class="col-md-12 mt-3 d-flex justify-content-between">
                    <button type="button" class="btn btn-primary btn-sm" id="cancelar${codigo}">Cancelar</button>
                    <button type="button" class="btn btn-success btn-lg" id="registrar${codigo}">Registrar</button>
                    
        </div>
    </div>
    `;
    app.innerHTML=view;

  
}

function sendformData(event, formData) {
    event.preventDefault();

    fetch(`./api/`, { // Reemplaza esto con la URL de tu servidor
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alertas(data);
    })
    .catch(error => {
        console.error('Error al enviar los datos:', error);
    });
}



function sendform(e,form){
        console.log(form);
        e.preventDefault();
        const dato=new FormData(form);
        console.log(dato);

        fetch(`./api/`,{
            method:"POST",
            body:dato
        })
        .then(res=>res.json())
        .then(data=>{

            alertas(data);
        })
    
}
function alertas(data) {
    console.log(data);
    // Definir las variables al principio
    let alertClass, alertMessage, timeoutDuration;
    // Determinar el tipo de alerta y su mensaje
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 1500;
        if(data[2]=="editar_estado_divisa"){
            return;
        }
        // Resetear el formulario si existe
        let formulario = document.querySelector(`#formulario${codigo}`);
        if (formulario) {
            formulario.reset();
        }
        if(data[2]==="registrar_divisa"){
            listar_divisas();

        }
        if(data[2]==="eliminar_divisa"){
            console.log(List_Divisa);

            console.log(obt_divisa_aux);
            List_Divisa = List_Divisa.filter(obj => obj.id !== Number(obt_divisa_aux['id']));
            console.log(List_Divisa);
            listar_divisasArray();
            obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        if(data[2]==="editar_divisa"){
            obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

        }
        
    } else {
        if(data[0] == "Error"){

            if(data[2]==="editar_divisa"){
                const obj = List_Divisa.find(ob => ob.id === obt_divisa_aux['id']);

                console.log(obt_divisa_aux);

                console.log(obj);
                if (obt_divisa_aux) {
                    Object.assign(obj, obt_divisa_aux);
                }
                console.log(obt_divisa_aux);

                console.log(obj);
                console.log(List_Divisa);
                listar_divisasArray();
                obt_divisa_aux = { ...{ id: 0, nombre: "", sigla: "" } };

            }
            alertClass = 'alert-danger';
            alertMessage = data[1];
            timeoutDuration = 3000;
        }else{
            alertClass = 'alert-primary';
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