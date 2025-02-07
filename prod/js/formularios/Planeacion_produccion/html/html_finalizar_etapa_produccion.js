import { codigos } from "../constantes.js";
let ukS=localStorage.getItem("yofinanciero");
let uk=JSON.parse(ukS);
const codigo = codigos.codigoFinalizar_etapa_produccion;

const title = `

`;

const body = `
    <div id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div >
            <div class = "row" >
                <!-- Modal Body -->
                <div  style="text-align: center;">
                    <div class="icon-warning" style="font-size: 60px; color: #f5c06b;">⚠️</div>
                    <h5 style="font-size: 24px; font-weight: bold; margin-top: 10px;">Esta seguro ?</h5>
                    <p style="color: #6c757d;">Finalizar etapa de produccion!</p>
                </div>
            </div>
        </div>
    </div>

`;
export function getTitle(){
    return title;
}
export function getBody(){
    return body;
}