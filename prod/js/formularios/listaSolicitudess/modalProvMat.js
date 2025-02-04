export function modalVistaProveedorMaterial(){
    console.log("soy vista de proveedor  Material");
    let listar = document.querySelector("#modalVistaProveedorMaterial");
    let view = `  
    <button id="btnRetrocederMod" class="btn btn-primary" style="float: left;">
            <i class="bi bi-arrow-left"></i> VOLVER
    </button>  
    <br>
    <h1 class="text-center" id = "tituloLista">Lista de Proveedores</h1>
   
        <table class="table mt-4 table-hover" id = "tablaCuerpo">
            <thead id=lcompra>
                <tr class="table-dark">
                    <th scope="col">N°</th>
                    <th scope="col">Proveedor</th>
                    <th scope="col">Material</th>
                    <th scope="col">Telefono</th>
                    <th scope="col">Direccion</th>
                </tr>
            </thead>
            <tbody id="contenidoListaProveedor">  
                <!-- Filas de datos aquí -->
            </tbody>
        </table>

                `;
                
    listar.innerHTML = view;
    const btnRetroceder = document.querySelector('#btnRetrocederMod');
    const vistaFormularioCompra = document.querySelector('#vent');
    const vistaProveedoresMat = document.querySelector("#modalVistaProveedorMaterial");
    // const vistapedido = document.querySelector("#verLista");
    // console.log(vistaListaPedido);
    // const vistaProveedorMaterial = document.querySelector('#vistaProveedorMaterial')
    btnRetroceder.addEventListener('click', () => {
        
        vistaProveedoresMat.style.display = 'none'; 
        vistaFormularioCompra.style.display = 'block'; 
         
    });
}