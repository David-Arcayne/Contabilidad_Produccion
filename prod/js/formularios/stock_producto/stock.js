let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
let app="";

const codigo = Array.from({ length: 5 }, () => rand()).join("") + "stock_producto";

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}
export function stock_productos_stock(code, permisos, refrescar) {
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener('click', function() {
        sitio();
    });
    sitio();    
    
}





function sitio(){
    let view=`
        <div class="container mt-5">
        <div class="row">
            <div class="col-md-4">
                <div class="row">
                    <div class="col-md-6">
                        <label for="Item" class="form-label">Items:</label>
                        <select class="form-select" id="item${codigo}" name="item">
                            <option value="" disabled selected>Seleccione un item</option>
                            <option value="Producto">Producto</option>
                            <option value="Rubro">Rubro</option>
                            <option value="Seccion">Sección</option>
                            <option value="Medida">Medida</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="Opciones" class="form-label">Opciones:</label>
                        
                        <select class="form-select" id="Opciones${codigo}" name="Opciones">
                            
                        </select>
                    </div>
                </div>
                
            </div>
            
            <div class="col-md-4"> 
                <div class="row">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="checkbox1${codigo}">
                        <label class="form-check-label" for="checkbox1${codigo}">
                            Buscar por Lote
                        </label>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <input type="text" class="form-control" id=""/>
                    </div>
                </div>
                
            </div>
            <div class="col-md-4"> 
                <div class="row">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="checkbox2${codigo}">
                        <label class="form-check-label" for="checkbox2${codigo}">
                            Buscar por fecha de caducidad
                        </label>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <label class="form-label">Fecha Desde</label>
                        <input type="date" class="form-control" id="creationDateFromCampaign"/>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Fecha Hasta</label>
                        <input type="date" class="form-control" id="creationDateToCampaign"/>
                    </div>
                </div>
                
            </div>
            
           
            
            
           
            
        </div>
        <div class="col-12">
            <br> <br>
            <button type="button" class="btn btn-primary col-md-2" id="filtrarBusqueda${codigo}"><i class="bi bi-search"></i></button>
            <button type="button" class="btn btn-primary col-md-2" id="cancelarfiltro${codigo}"><i class="bi bi-x-circle"></i></button>
            <br> <br>
        </div>
      
        
        <table class="table table-striped table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>N°</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Medida</th>
                    <th>Costo Unitario</th>
                    <th>Fecha de Caducidad</th>
                    <th>Lote</th>
                    <th>Sección</th>
                    <th>Caducados</th>
                    <th>Por caducar</th>
                </tr>
            </thead>
            <tbody id="Listar_stock_material${codigo}">
                
            </tbody>
        </table>
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