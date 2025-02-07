import { codigos } from "../constantes.js";

const codigo = codigos.codigodetalleEtapa;
const body = `

    <div class="" >
              <label for="" class="form-label" id="detalle${codigo}"></label>
    </div>
`;

export function getBody(){
    return body;
}