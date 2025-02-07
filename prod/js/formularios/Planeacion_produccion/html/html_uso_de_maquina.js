import { codigos } from "../constantes.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
const codigo = codigos.codigoRegistrar_usuMaquina;

const title = `
<h5 class="text-center mb-4 fw-bold fs-6">Uso de máquina</h5>
`;

const body = `
    <form id="formulario${codigo}">
        <div class="mb-3">
            <label for="maquina_idmaquina" class="form-label">Máquina</label>
            <select class="form-select" id="maquina_idmaquina${codigo}" name="maquina_idmaquina" required>
                <option value="" disabled selected>Seleccione una máquina</option>
                <!-- Opciones dinámicas para las máquinas -->
                <option value="1">Máquina 1</option>
                <option value="2">Máquina 2</option>
            </select>
        </div>
        <button type="submit" class="btn btn-success" ><i class="bi bi-play fs-5"></i></button>
    </form>

`;

const table = `
    <div class="container">

        <div id="alerta${codigo}" class="mt-4"></div>

        <table class="table table-hover mt-3" id="editableTable${codigo}">
            <thead class="table-dark">
                <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Maquina</th>
                    <th scope="col">Fecha Inicio</th>
                    <th scope="col">Hora Inicio</th>
                    <th scope="col">Observaciones</th>
                    <th scope="col">Funciones</th>
                </tr>
            </thead>
            <tbody id="listar_uso_maquina_produccion${codigo}">
              
            </tbody>
        </table>
    </div>
`
export function getTitle(){
    return title;
}
export function getBody(){
    return body;
}
export function getBody_2(){
    return table;
}