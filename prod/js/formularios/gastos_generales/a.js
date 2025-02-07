async function modal_gstos(idgastos_generales,codigo) {
  function menumodal(event) {
    const dataid = event.currentTarget.getAttribute("data-id");
    const [funcion, id1, id2] = dataid.split(",");
    switch (funcion) {
      case "editar_detalle_gastos":
        toggleEditSave(event);
        break;
      case "eliminar_detalle_gastos":
        eliminar_detalle_gastos(id1);//
        break;
     
      default:
        sitio();
        break;
    }
  }
    const Lista_detalle = await listarFunctions.listar_api_general_verd('listar_detalle_gastos',idgastos_generales);

    const modal = crearModal({
        code: code_,
        id: `confirmacion${codigo}`,
        header: `
            <h5 class="text-center mb-4 fw-bold fs-6" >Detalle Gastos generales</h5>

        `,
        body: `

                <form style="display: none; opacity: 0; height: 0; overflow: hidden; transition: height 0.5s ease, opacity 0.5s ease;" id="formulario${codigo}">
                    <div class="row">
                      <div class="col-md-6">
                        <label for="tiempo" class="form-label">Tiempo</label>
                        <select class="form-select" id="tiempo" name="tiempo">
                          <option value="Enero">Enero</option>
                          <option value="Febrero">Febrero</option>
                          <option value="Marzo">Marzo</option>
                          <option value="Abril">Abril</option>
                          <option value="Mayo">Mayo</option>
                          <option value="Junio">Junio</option>
                          <option value="Julio">Julio</option>
                          <option value="Agosto">Agosto</option>
                          <option value="Septiembre">Septiembre</option>
                          <option value="Octubre">Octubre</option>
                          <option value="Noviembre">Noviembre</option>
                          <option value="Diciembre">Diciembre</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                          <label for="monto" class="form-label">Monto</label>
                          <input type="number" step="0.0001" class="form-control" id="monto" name="monto" placeholder="Ingrese el monto">
                      </div>
                      
                    </div>
                    
                
                    <div class="d-flex justify-content-end mt-4">
                        <button type="submit" class="btn btn-outline-success me-2" id="guardarBtn${codigo}" aria-label="Registrar">Registrar</button>
                        <button type="reset" class="btn btn-outline-primary" id="cancelarBtn2${codigo}" aria-label="Cancelar">Cancelar</button>
                    </div>
                </form>
                <button id="toggleButton${codigo}" class="btn btn-outline-success mr-1 mt-4" ><i class="bi bi-plus"></i></button>
                <div id="alerta${codigo}" class="mt-4"></div>
                <div >
                    
                    <table class="table table-striped table-hover" id = "editableTable${codigo}">
                    <thead class="table-dark">
                        <tr>
                        <th scope="col">N°</th>
                        <th scope="col">Tiempo</th>
                        <th scope="col">Monto</th>
                        
                        
                        <th scope="col">Funciones</th>
                        </tr>
                    </thead>
                    <tbody id="listar_gastos_generales${codigo}">
                    
                    </tbody>
                    </table>
                </div>
        
        `,
        footerButtons: [
            {
                id: `btnCancelar${codigo}`,
                text: "Cancelar",
                class: "btn-primary",
                onClick: () => {
                        
                },
                dismiss: true // Esto NO cierra el modal cuando se hace clic
            }
        ]
    });

    const table = document.getElementById(`editableTable${codigo}`);
    table.addEventListener("dblclick",(e) => edit_Celda_table(e));
    const forme = document.querySelector(`#formulario${codigo}`);
    forme.addEventListener("submit",async  (e) => {
    e.preventDefault();
    const formData = new FormData(forme);
    formData.append('verDavid','registrar_detalle_gastos');
    formData.append('gastos_generales_idgastos_generales',idgastos_generales);
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
      
    const data = await registrarFuntions.sendformData2(formData);
     
          if(data[0] == "success" ){
            document.getElementById(`btnCancelar${codigo}`).click();
              modal_gstos(idgastos_generales,codigo);
              fuG.alertas(data,codigo);
          }else{
              fuG.alertas(data,codigo);
          }
              
      
      
    });
    const toggleButton = document.getElementById(`toggleButton${codigo}`);
    toggleButton.addEventListener("click", (e) =>mostrarFormulario(e, toggleButton, forme));

    

function listar_gastos_generales() {
  const table_body = document.getElementById(`listar_gastos_generales${codigo}`);
  let view = "",ind = 1;

  Lista_detalle.map((lista) => {

        
  
      let actualizar = {
        0: ``,
        1: `
              <div class="text-center">
                  <a  data-id="editar_detalle_gastos,${lista.iddetalle_gastos}"
                  class="btn btn-outline-primary rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                  style="width: 2.5rem; height: 2.5rem;"
                  title="Editar sección">
                      <i class="bi bi-pencil-square fs-5"></i>
                  </a>
                  <span class="d-block mt-1 small"></span>
              </div>
              `,
      };
      
      let eliminar = {
        0: ``,
        1: `
            <div class="text-center">
                <a  data-id="eliminar_detalle_gastos,${lista.iddetalle_gastos}"
                class="btn btn-outline-danger rounded-circle p-1 d-inline-flex justify-content-center align-items-center"
                style="width: 2.5rem; height: 2.5rem;"
                title="Eliminar sección">
                    <i class="bi bi-trash fs-5"></i>
                </a>
                <span class="d-block mt-1 small"></span>
            </div>
            `,
      };

     
      view += `
              <tr>
                  <td>${ind++}</td>                
                  <td data-type="${lista.iddetalle_gastos},tiempo,tiempo">${lista.tiempo}</td>
                  <td data-type="${lista.iddetalle_gastos},monto,monto">${lista.monto}</td>             
                               
                  <td>
                      <div class="d-flex gap-3">
                          
                          ${actualizar[privilegios[2]]}
                          ${eliminar[privilegios[3]]}
                      </div>                           
                  </td>
              </tr>
          `;
  });
  table_body.innerHTML = view;

  const enlaces = document.querySelectorAll(".btn");
  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", menumodal);
  });
}
async function eliminar_detalle_gastos(iddetalle_gastos ){
  if (confirm("Desea Eliminar..?")) {
    const data = await listarFunctions.listar_api_general_verd('eliminar_detalle_gastos',iddetalle_gastos);
      
      
    if(data[0] == "success" || data[0] == "ok" ){
        sitio();
    }
  }
}
async function toggleEditSave(event){
    const columnas = [
            {
                index: 1,
                editable: true,
                type: 'number',
                field: 'monto',
                validations: { required: true }
            },
            {
                index: 2,
                editable: true,
                type: 'select',
                field: 'tiempo',
                validations: { required: true },
                
                options: [                   // Solo para type: 'select'
                           { value: 'Enero', label: 'Enero' },
                           { value: 'Febrero', label: 'Febrero' },
                           { value: 'Marzo', label: 'Marzo' },
                           { value: 'Abril', label: 'Abril' },
                           { value: 'Mayo', label: 'Mayo' },
                           { value: 'Junio', label: 'Junio' },
                           { value: 'Julio', label: 'Julio' },
                           { value: 'Agosto', label: 'Agosto' },
                           { value: 'Septiembre', label: 'Septiembre' },
                           { value: 'Octubre', label: 'Octubre' },
                           { value: 'Noviembre', label: 'Noviembre' },
                           { value: 'Diciembre', label: 'Diciembre' },
                          
                         ]
            }
        ];
    
    
    
      const resultado = await Editar_fila_(event, codigo, Lista_detalle, columnas, 'iddetalle_gastos');
    
    
      if (!resultado) {
        console.warn("No changes to save or operation cancelled.");
       
      }
      const formData = new FormData();
      formData.append("verDavid", "editar_detalle_gastos");
      formData.append("empresa_idempresa",uk[0].empresa.idempresa);

      Object.entries(resultado).forEach(([key, value]) => {
        formData.append(key, value);
      });
    
      console.log("FormData prepared for submission:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
    
      try {
        const data = await registrarFuntions.sendformData2(formData);
        console.log("Server response:", data);
        fuG.alertas(data,codigo);
        if(data[0] == "danger" || data[0] == "Error" ){
          sitio();
        }
      } catch (error) {
        console.error("Error submitting data to the server:", error);
      }
}
}