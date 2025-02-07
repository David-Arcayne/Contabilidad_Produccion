import { codigos } from "../constantes.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
const codigo = codigos.codigoComenzar_etapa_produccion;

const title = `
    <h5 class="text-center mb-4 fw-bold fs-6">Iniciar etapa producción</h5>
`;

const body = `
    <form class = "mb-4" id="formulario${codigo}">
        <input type="hidden" class="form-control" id="produccion_idproduccion${codigo}" name="produccion_idproduccion" required>
        <input type="hidden" class="form-control" id="etapas_produccion_idetapas_produccion${codigo}" name="etapas_produccion_idetapas_produccion" required>
        <input type="hidden" class="form-control" id="empleado_idempleado" name="empleado_idempleado" value="${uk[0].idusuario}" required>
        <div class="row g-3">
            <div class="col-md-4">
                <label for="empleado" class="form-label">Usuario:</label>
                <input type="text" class="form-control" id="empleado" name="empleado" value = "${uk[0].nombre}" readonly>
            </div>
            <div class="col-md-4" >
                <label for="fecha_pe" class="form-label">Fecha de Producción</label>
                <input type="date" class="form-control" id="fecha_pe${codigo}" name="fecha_pe" required>
            </div>
            <div class="col-md-4">
                <label for="hora_pe" class="form-label">Hora de Producción</label>
                <input type="time" class="form-control" id="hora_pe${codigo}" name="hora_pe" required>
            </div>
        </div>
    </form>

`;
export function getTitle(){
    return title;
}
export function getBody(){
    return body;
}