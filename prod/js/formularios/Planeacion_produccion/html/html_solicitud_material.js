import { codigos } from "../constantes.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);

const codigo = codigos.codigoSolicitud_material;
const title = `
<h5 class="text-center mb-4 fw-bold fs-6">Solicitud material</h5>
`;

const body_1 = ` 
 <form id="formulario${codigo}">
    <input type="hidden" name="estado" value="0">
    <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
    <input type="hidden" name="empleado_idempleado" value="${uk[0].idusuario}">
    <input type="hidden" id="produccion_idproduccion${codigo}" name="produccion_idproduccion" value="${uk[0].idusuario}">
    <div class="row g-3">
            
        <div class="col-md-4">
            <label for="empleado" class="form-label">Usuario solicitante:</label>
            <input type="text" class="form-control" id="empleado" name="empleado" value = "${uk[0].nombre}" readonly>
        </div>

        <div class="col-md-4">
            <label for="fecha" class="form-label">Fecha solicitud:</label>
            <input type="date" class="form-control" id="fecha" name="fecha" value = "">
        </div>

        <div class="col-md-4">
            <div class="row">
                <div class = "col">
                    <label for="hora" class="form-label">Hora solicitud:</label>
                    <input type="time" class="form-control" id="hora" name="hora" value="">
                </div>
            </div>
        </div>


        <div class="col-md-12 mt-3 d-flex justify-content-between">
           
            <button type="submit" class="btn btn-success btn-lg"> Registrar</button>
            
        </div>

    </div>
</form>

`;
const body = `
     <form id="formulario${codigo}">
            <input type="hidden" name="ver" name="solicitud_material_idsolicitud_material" value="0">
            <input type="hidden" name="estado" value="0">
            <input type="hidden" name="empresa_idempresa" value="${uk[0].empresa.idempresa}">
            <input type="hidden" name="empleado_idempleado" value="${uk[0].idusuario}">
            <input type="hidden" id="produccion_idproduccion${codigo}" name="produccion_idproduccion" value="">
            <div class="row g-3">
            
                <div class="col-md-4">
                    <label for="empleado" class="form-label">Usuario solicitante:</label>
                    <input type="text" class="form-control" id="empleado" name="empleado" value = "${uk[0].nombre}" readonly>
                </div>

                <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha solicitud:</label>
                    <input type="date" class="form-control" id="fecha${codigo}" name="fecha" value = "">
                </div>

                <div class="col-md-4">
                    <div class="row">
                        <div class = "col">
                            <label for="hora" class="form-label">Hora solicitud:</label>
                            <input type="time" class="form-control" id="hora${codigo}" name="hora" value="">
                        </div>
                    </div>
                </div>
            </div>
       
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="material_idmaterial" class="form-label">Material:</label>
                    <select id="material_idmaterial${codigo}" name="material_idmaterial" class="form-select">
                        <option value="1">Material A</option>
                        <option value="2">Material B</option>
                    </select>
                </div>

                <div class="col-md-4">
                    <label for="cantidad" class="form-label">Cantidad:</label>
                    <input type="number" class="form-control" id="cantidad${codigo}" name="cantidad" required>
                </div>
                <div class="col-md-4">
                    <label for="medida" class="form-label">Medida:</label>
                    <input type="text" class="form-control" id="medida${codigo}" name="medida" value = "Kg" required readonly>
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
        <div id="alerta${codigos.codigoPrincipal}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th>Código</th>
                    <th scope="col">Material</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Medida</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="Lista_solicitud_material${codigo}">
              
            </tbody>
        </table>
`;


export function getTitle(){
    return title;
}
export function getBody(){
    return body;
}
export function getBody_1(){
    return body_1;
}