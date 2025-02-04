
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);



let overlayy;
let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let id_;
const subcodigo = Array.from({ length: 5 }, () => rand()).join("") + "modal";
function rand(){
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);

    return String.fromCharCode(65 + indice) + codigo;
}

export function modal_stock_filtrado(code, permisos, refrescar,codigo,id) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    codigo_ = codigo;
    id_ = id;
    app=document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    
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


    let view = `
        <a style="float: right;" class ="cerrar"><i class="bi bi-x-lg fs-5"></i></a>

         <table class="table table-striped table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>N°</th>
                    <th>Material</th>
                    <th>Cantidad</th>
                    <th>Medida</th>
                    <th>Costo Unitario</th>
                    <th>Fecha de Caducidad</th>
                    <th>Lote</th>
                    <th>Proveedor</th>
                    <th>Sección</th>
                    <th>Caducados</th>
                    <th>Por caducar</th>
                    <th>Funciones</th>

                </tr>
            </thead>
            <tbody id="Listar_stock_material${subcodigo}">
                
            </tbody>
        </table>
    `;
    variable.innerHTML = view;
    overlayy = overlay;
    llenarTabla();
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
        app.style.removeProperty('position');  
    }
}
const materiales = [
    {
        numero: 1,
        material: 'Harina',
        cantidad: 50,
        medida: 'kg',
        costoUnitario: 20.00,
        fechaCaducidad: '2025-01-01',
        lote: 'L001',
        proveedor: 'Proveedor A',
        seccion: 'Almacén 1',
        caducados: 'No',
        porCaducar: '30 días',
        funciones: 'Reordenar | Ver detalles'
    },
    {
        numero: 2,
        material: 'Harina',
        cantidad: 100,
        medida: 'kg',
        costoUnitario: 5.50,
        fechaCaducidad: '2024-11-15',
        lote: 'L002',
        proveedor: 'Proveedor B',
        seccion: 'Almacén 2',
        caducados: 'No',
        porCaducar: '45 días',
        funciones: 'Reordenar | Ver detalles'
    },
    {
        numero: 3,
        material: 'Harina',
        cantidad: 200,
        medida: 'kg',
        costoUnitario: 15.75,
        fechaCaducidad: '2024-10-05',
        lote: 'L003',
        proveedor: 'Proveedor C',
        seccion: 'Almacén 3',
        caducados: 'Sí',
        porCaducar: 'Caducado',
        funciones: 'Descartar | Ver detalles'
    }
];

function llenarTabla() {
    const tbody = document.getElementById(`Listar_stock_material${subcodigo}`);
    let html = '';

    materiales.forEach(material => {
        html += `
            <tr>
                <td>${material.numero}</td>
                <td>${material.material}</td>
                <td>${material.cantidad}</td>
                <td>${material.medida}</td>
                <td>${material.costoUnitario.toFixed(2)}</td>
                <td>${material.fechaCaducidad}</td>
                <td>${material.lote}</td>
                <td>${material.proveedor}</td>
                <td>${material.seccion}</td>
                <td>${material.caducados}</td>
                <td>${material.porCaducar}</td>
                <td>${material.funciones}</td>
            </tr>
        `;
    });

    // Insertar las filas en el cuerpo de la tabla
    tbody.innerHTML = html;
}



   




function alertas(data) {
    console.log(data);
    let alertClass, alertMessage, timeoutDuration;
    if (data[0] == "ok") {
        alertClass = 'alert-success';
        alertMessage = data[1];
        timeoutDuration = 500;
        
    } else {
        if(data[0] == "danger"){
            alertClass = 'alert-danger';
            alertMessage = data[1];
            timeoutDuration = 2000;
            
        }else{
            alertClass = 'alert-primary';
            alertMessage = data[1];
            timeoutDuration = 3000;

        }
    }
    
    let divalert = document.querySelector(`#alerta${subcodigo}`);
    if (divalert) {
        let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`;
        divalert.innerHTML = nuevoContenido;
        
        setTimeout(() => {
            divalert.innerHTML = ``;
            
        }, timeoutDuration);
    }
}
