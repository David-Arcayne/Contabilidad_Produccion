 import { codigos } from "../constantes.js";


 let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);


 const codigo = codigos.codigoEstandar;

 const form_producto_cantidad = `
    
 `;
 const body = `
        <div class=" row ">
                <form id="${codigo}">
                    <div class="col-lg-12 col-md-12 border p-3 rounded">
                        <div class="row">
                            <div class="col-md-6">
                                <label for="nombre_producto" class="form-label">Producto seleccionado:</label>
                                <input type="text" class="form-control" id="nombre_producto${codigo}" name="nombre_producto" style="border: none; background-color: transparent; font-weight: bold; font-size: 16px; cursor: default; outline: none;" readonly>
                            </div>
                            <div class="col-md-6">
                                <label for="cantidad_producto" class="form-label">Cantidad:</label>
                                <input type="text" class="form-control" id="cantidad_producto${codigo}" name="cantidad_producto" style="border: none; background-color: transparent; font-weight: bold; font-size: 16px; cursor: default; outline: none;" readonly>
                            </div>
                        </div>
                        
                    </div>
                </form>
                <form id="r_estandarP${codigo}">
                    <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
                    <input type="hidden" name="verDavid" value="registrar_detalle_estandar_producto2">
                    <input type="hidden" name="producto_idproducto" id="producto_idproducto${codigo}">
                    <div class="col-lg-12 col-md-12 border p-3 rounded mt-4" >
                        <div class="row">
                            <div style="position: relative;" class="col-md-4">
                                  <input type="hidden" name="material_idmaterial" id="material_idmaterial${codigo}" required >

                                  <label for="material" class="form-label">Material-Insumo:</label>
                                  <input type="text" id="searchInput${codigo}" placeholder="Buscar..." class="form-control" name="material" required>
                                  <ul id="dropdownList${codigo}" style="position: absolute;top: 100%;left: 0;right: 0;overflow-y: auto;background-color: white;border: 1px solid #ccc;display: none;z-index: 1000;list-style: none; margin: 0;padding: 0; border-radius: 8px;"></ul>
                            </div>
                            <div class="col-md-4">
                                <label for="cantidad" class="form-label">Cantidad:</label>
                                <input type="number" class="form-control" id="cantidad" name="cantidad" step="0.01"  placeholder="Introduce la cantidad">
                            </div>
                            <div class="col-md-4">
                                <label for="medida" class="form-label">Medida:</label>
                                <input type="text" class="form-control" id="medida${codigo}" name="medida" readonly >
                            </div>
                        </div>
                        <div class="d-flex justify-content-end mt-4" id="">
                            <button type="submit" class="btn btn-outline-success me-2" id="registrar_estandar${codigo}" aria-label="Registrar" >Registrar</button>
                        
                        </div>
                    </div>
                </form>
                
            
        </div>
    
`;

 const title = `
    <h5 class="text-center mb-4 fw-bold fs-6">Proceso de estandarización de productos</h5>
`;

 const table = `
    <div id="alerta${codigo}" class="mt-4"></div>
    <div style = "max-height: 180px; overflow-y: auto; display: block;">
        <table class="table table-bordered table-hover table-striped" id = "editableTable${codigo}" >
            <thead >
                <tr class="table-dark">
                    <th>Código</th>
                    <th>Material</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Medida</th>
                    <th>Funciones</th>
                </tr>
            </thead>
            <tbody id="listar_estandar_productos_material${codigo}">
                
            </tbody>
        </table>
    </div>
`;

export function getbodyEstP(){
    return body;
}
export function getTitleEstP(){
    return title;
}
export function gettableEstP(){
    return table;
}
export function getform_cantP(){
    return form_producto_cantidad;
}