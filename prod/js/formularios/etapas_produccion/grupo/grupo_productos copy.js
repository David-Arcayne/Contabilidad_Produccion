import { URL_APIP } from "../../../../../lib/services.js";
import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { etapas_produccion } from "../principal.js";
import { grupo_etapas_produccion } from "./grupo.js";

let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);
let privilegios;

let app = "";
let code_;
let permisos_;
let refrescar_;
let codigo_;
let Lista_Productos = [];
let Lista_empleados = [];
let Lista_etapas_produccion = [];
let Lista_seccion = [];
let Lista_grupo_etapas = [];
let list_unidadTiempo = [];
let list_rubro = [];
let list_categoria = [];
let list_medida = [];
let list_estados = [];
let list_unidad = [];
let Lista_productos_grupo = [];
let List_productos_agrupados = [];
let Lista_productos_de_un_grupo = [];
const codigo = codigos.codigoGrupo_producto;

export async function registro_grupo_productos(code, permisos, refrescar) {
  code_ = code;
  permisos_ = permisos;
  privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
  document.querySelector(`button[id^="refrescar"][id$="${code}"]`).addEventListener("click", function () {
    sitio();
  });
  refrescar_ = refrescar;
  codigo_ = codigo;
  app = document.querySelector(`#content-area${codigos.codigoPrincipal}`);

  sitio();
}

async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;

    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
      listarFunctions.listar_Empleados(idEmpresa),
      listarFunctions.listar_etapas_produccion(idEmpresa),
      listarFunctions.listarseccion(idEmpresa),


      listarFunctions.listar_productos_comercial(idEmpresa),
      listarFunctions.listar_grupo_etapas(idEmpresa),
      listarFunctions.listar_unidad_tiempo(),
      listarFunctions.listar_estados_productos(idEmpresa),
      listarFunctions.listar_unidad_producto(idEmpresa),
      listarFunctions.listar_categorias_comercial(idEmpresa),
      listarFunctions.listar_caracteristica_comercial(idEmpresa),
      listarFunctions.listar_rubro(idEmpresa),
      listarFunctions.listar_productos_porGrupo(idEmpresa),
    ]);

    // Asignamos los resultados a las variables correspondientes
    Lista_empleados = resultados[0];
    Lista_etapas_produccion = resultados[1];
    Lista_seccion = resultados[2];

    
    Lista_Productos = resultados[3];
    Lista_grupo_etapas = resultados[4];
    list_unidadTiempo = resultados[5];
    list_estados = resultados[6];
    list_unidad = resultados[7];
    list_categoria = resultados[8];
    list_medida = resultados[9];
    list_rubro = resultados[10];
    List_productos_agrupados = resultados[11];
    console.log(resultados[11], resultados[12]);
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}

async function sitio() {
  let view = "",
    ind = 1;
  view += `
        <div class="container">
            <div class="row">
                <div class="select-container" id="select2" style="width: 300px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; margin: 5px auto;">
                    <div class="row">
                        <label for="grupos" class="form-label fw-bold fs-6">Seleccionar grupo</label>
                        <select class="form-select" id="grupo_etapas_idgrupo_etapas${codigo}" name="grupos">
                            <option value="1">grupo 1</option>
                            <option value="2">grupo 2</option>
                        </select>
                    </div>
                </div>
                <div class="select-container" id="select2" style="width: 600px; background-color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; margin: 5px auto;">
                    <label for="seccion2" class="form-label fw-bold fs-6">Seleccionar Productos</label>
                    
                    <div class="select-box" id="selectBox" style="border: 1px solid #ccc; padding: 10px; cursor: pointer; background-color: #fff; display: flex; justify-content: space-between; align-items: center;">
                        Productos <span>▼</span>
                    </div>
                    
                    <div class="select-options" id="productos_idproductos${codigo}" style="display: none; border: 1px solid #ccc; border-top: none; max-height: 200px; overflow-y: auto; background-color: #fff;">
                        <div data-value="${1}">${"lista.caracteristica"}</div>
                        <div data-value="${2}">${"lista.caracteristica"}</div>
                        <div data-value="${3}">${"lista.caracteristica"}</div>
                    </div>

                    <div id="selection-info" style="padding-top: 10px;">0 productos seleccionados</div>
                    
                    <button type="button" class="btn btn-outline-primary mr-1 mt-4" id="agregar_productos${codigo}" aria-label="generar">Añadir Productos a grupo</button>
                </div>
                
            </div>
            <div id="alerta${codigo}" class="mt-4"></div>

            <div style = "max-height: 400px; overflow-y: auto; display: block;">
                    
                <table class="table table-bordered table-hover table-striped">
                    <thead >
                        <tr class="table-dark">
                            <th>N°</th>
                            <th>Nombre</th>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Caracteristica</th>
                            <th>Estado Producto</th>
                            <th>Unidad medida</th>
                            <th>Rubro</th>   
                            <th>Funciones</th>       
                    
                        </tr>
                    </thead>
                    <tbody id="Listar_productos${codigo}">
                        
                    </tbody>
                </table>
            </div>
            <div class="col-md-12 mt-3 d-flex justify-content-between">
                <button type="button" class="btn btn-primary btn-sm" id="cancelar_${codigo}">Cancelar</button>
                <button type="button" class="btn btn-success btn-lg" id="registrara_productos_grupo${codigo}">Guardar</button>
            </div>
        </div>
            
        `;
  await listar();
  app.innerHTML = view;
  console.log(List_productos_agrupados);
  console.log(Lista_Productos);
  llenar_select_caracteristicas();
  let selectedOptions = configurarSelect(
    "selectBox",
    `productos_idproductos${codigo}`,
    "selection-info"
  );

  console.log(selectedOptions);
  const selectrubro = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );

  selectrubro.addEventListener("change", eventHandler);
  async function eventHandler() {
    sitio();
    // Remueve el evento después de ejecutarse una vez
    selectrubro.removeEventListener("change", eventHandler);
  }
  select_grupo_etapas_idgrupo_etapas();
  document
    .getElementById(`agregar_productos${codigo}`)
    .addEventListener("click", function () {
      if (selectedOptions.length > 0) {
        console.log(selectedOptions);
        let Lista_productos_seleccionados =
          listar_productos_seleccionados(selectedOptions);
        let lista_rgs = [];
        const idgrupo = document.getElementById(
          `grupo_etapas_idgrupo_etapas${codigo}`
        );
        selectedOptions.map((lista) => {
          let aux = {
            idgrupo_productos: 0,
            producto_idproducto: lista["producto_idproducto"],
            grupo_etapas_idgrupo_etapas: Number(idgrupo.value),
          };
          lista_rgs.push(aux);
        });
        antes_Listar_productos(Lista_productos_seleccionados, lista_rgs);
      } else {
        console.error("No hay opciones seleccionadas en el primer select.");
      }
    });
  const btnregistrar_api = document.getElementById(
    `registrara_productos_grupo${codigo}`
  );
  btnregistrar_api.addEventListener("click", function () {
    const productos = [];
    const rows = document.querySelectorAll(`#Listar_productos${codigo} tr`);
    const grupo = document.querySelector(
      `#grupo_etapas_idgrupo_etapas${codigo}`
    );

    rows.forEach((row, index) => {
      const dataTypeCell = row.querySelector("td[data-idp]");
      const data_idg = row.querySelector("td[data-idgp]");

      const dataType = dataTypeCell
        ? dataTypeCell.getAttribute("data-idp")
        : null;
      const idgrupo_p = data_idg ? data_idg.getAttribute("data-idgp") : null;

      const producto = {
        idgrupo_productos: Number(idgrupo_p),
        producto_idproducto: Number(dataType),
        grupo_etapas_idgrupo_etapas: Number(grupo.value),
      };
      productos.push(producto);
    });

    prepararLista_enviar(productos);
  });

  const select_grupo = document.querySelector(
    `#grupo_etapas_idgrupo_etapas${codigo}`
  );
  select_grupo.addEventListener("change", function () {
    Lista_productos_grupo = [];
    console.log(select_grupo.value);
    console.log(List_productos_agrupados);
    let productos_seleccionados = List_productos_agrupados.find(
      (obj) => Number(obj.grupo_etapas_idgrupo_etapas) === Number(select_grupo.value)
    );
    console.log(productos_seleccionados);

    let Lista_productos_seleccionados = listar_productos_seleccionados(
      productos_seleccionados.grupo_productos
    );
    Lista_productos_seleccionados = Array.isArray(Lista_productos_seleccionados)
      ? Lista_productos_seleccionados
      : [];
    antes_Listar_productos(
      Lista_productos_seleccionados,
      productos_seleccionados.grupo_productos
    );
  });

  const btn_cancelar = document.getElementById(`cancelar_${codigo}`);
  btn_cancelar.addEventListener("click", function () {
    sitio();
    vaciar_listas();
  });
}
function prepararLista_enviar(grupo_producto) {
  let grupo_productos = {
    verDavid: "registro_productos_grupo",
    detalle: [...grupo_producto],
  };

  console.log(grupo_productos);
  if (grupo_productos.detalle && grupo_productos.detalle.length > 0) {
    fetch(`${URL_APIP}api/`, {
      method: "POST", // Método HTTP
      headers: {
        "Usar-Registro-David": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(grupo_productos), // Convertir el objeto JS a JSON antes de enviarlo
    })
      .then((response) => response.json()) // Procesar la respuesta en formato JSON
      .then((data) => {
        console.log(data);
        alertas(data);
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Lista vacia");
  }
}
function antes_Listar_productos(Lista_productos_seleccionados, seleccionados) {
  console.log(seleccionados);
  console.log(Lista_productos_seleccionados);

  if (
    Array.isArray(Lista_productos_seleccionados) &&
    Lista_productos_seleccionados.length > 0
  ) {
    Lista_productos_seleccionados.map((lista) => {
      let existeEtapa = Lista_productos_grupo.some(
        (orden) =>
          Number(orden.idproduct_comercial) ===
          Number(lista.idproduct_comercial)
      );
      if (!existeEtapa) {
        let item_seleccionado = seleccionados.find(
          (obj) =>
            Number(obj.producto_idproducto) ===
            Number(lista.idproduct_comercial)
        );
        lista["idgrupo_productos"] = item_seleccionado["idgrupo_productos"];
        lista["producto_idproducto"] = item_seleccionado["producto_idproducto"];
        lista["grupo_etapas_idgrupo_etapas"] =
          item_seleccionado["grupo_etapas_idgrupo_etapas"];

        Lista_productos_grupo.push(lista);
        listar_productos();
      } else {
        alert("Ya existe producto");
      }
    });
  } else {
    listar_productos();
  }
}

function listar_productos() {
  const listar = document.getElementById(`Listar_productos${codigo}`);
  let view = "",
    ind = 1;
  console.log(Lista_productos_grupo);
  Lista_productos_grupo.map((lista) => {
    let eliminar;
    let est = lista.estado;
    let itemrubro = list_rubro.find(
      (obj) => obj.id === lista.rubro_idrubro
    ) || {
      id: 0,
      rubro: "-",
      detalle: "-",
    };

    let itemunidadTiempo = list_unidadTiempo.find(
      (obj) => obj.id === lista.Unidad_tiempo_idUnidad_tiempo
    ) || {
      id: 0,
      unidad: "-",
    };
    let itemcategoria = list_categoria.find(
      (obj) =>
        Number(obj.id_categorias) === Number(lista.categorias_id_categorias)
    ) || {
      id: -1,
      nombre: "-",
      descripcion: "-",
      estado: "-",
    };
    let item_medida_cm = list_medida.find(
      (obj) => Number(obj.id_medida) === Number(lista.medida_id_medida)
    ) || {
      id: -1,
      nombre_medida: "-",
      descripcion: "-",
      estado: -1,
    };

    let item_estado_cm = list_estados.find(
      (obj) => obj.id === lista.estados_productos_id_estados_productos
    ) || {
      id: -1,
      tipos_estado: "-",
      descripcion: "-",
      estado: "",
    };
    let item_unidad_cm = list_unidad.find(
      (obj) => obj.id === lista.unidad_id_unidad
    ) || {
      id: -1,
      nombre: "-",
      descripcion: "-",
      estado: -1,
    };

    view += `
                <tr style = "style=width: 50px; height: 50px;" >
                    <td>${ind++}</td>                

                    <td data-idp="${lista.producto_idproducto}" data-idgp="${
      lista.idgrupo_productos
    }" data-idge="${lista.grupo_etapas_idgrupo_etapas}">${lista.nombre}</td>
                    <td >${lista.codigo}</td>
                    <td >${lista.descripcion}</td>                    
                    <td >${itemcategoria.nombre}</td>
                    <td >${item_medida_cm.nombre_medida}</td>
                    <td>${item_estado_cm.tipos_estado}</td>
                    <td >${item_unidad_cm.nombre}</td>
                    <td >${itemrubro.rubro}</td>
                    <td>
                        <a class="btn btn-danger btn-delete">
                            <i class="bi bi-trash"></i>
                        </a>                          
                    </td>

                    
                </tr>        
            `;
  });
  listar.innerHTML = view;

  listar.querySelectorAll(".btn-delete").forEach((button) => {
    console.log("===");
    button.addEventListener("click", () => eliminar_producto(button));
  });
}
function eliminar_producto(button) {
  console.log("===");
  const row = button.closest("tr"); // Obtener la fila actual
  const cellWithType = row.querySelector("td[data-idgp]"); // Selecciona la celda con el atributo data-type

  if (cellWithType) {
    const currentType = Number(cellWithType.getAttribute("data-idgp")); // Obtén el valor actual
    if (currentType !== 0) {
      cellWithType.setAttribute("data-idgp", -Math.abs(currentType)); // Cambia el valor a negativo
      // Opcional: Ocultar la fila si deseas que desaparezca visualmente después de marcarla
      row.style.display = "none";
    } else {
      //eliminar totalmente de la tabla
      row.remove();
    }
  }
}
function listar_productos_seleccionados(List_product_select) {
  console.log("Lista_Productos:", Lista_Productos);
  console.log("List_product_select:", List_product_select);

  if (!Array.isArray(List_product_select) || List_product_select.length === 0) {
    console.warn("List_product_select está vacío o no es un arreglo válido.");
    return;
  }
  List_product_select.forEach((seleccionado, index) => {
    console.log(`Elemento en List_product_select [${index}]:`, seleccionado);
    console.log(
      `idproduct_comercial en seleccionado:`,
      seleccionado.producto_idproducto
    );
  });
  // Crear el Set para la comparación
  const idProductosSeleccionados = new Set(
    List_product_select.map((seleccionado) =>
      String(seleccionado.producto_idproducto).trim()
    )
  );

  console.log(
    "ID productos seleccionados en Set:",
    Array.from(idProductosSeleccionados)
  );

  //Inspección detallada de cada ID en ambas listas
  Lista_Productos.forEach((producto) => {
    const productoId = String(producto.idproduct_comercial).trim();
    const encontrado = idProductosSeleccionados.has(productoId);
    console.log(
      `ID producto: ${productoId} - ¿Encontrado en seleccionados?: ${encontrado}`
    );
  });

  //Filtrado de productos usando el Set
  let productos_filtrados = Lista_Productos.filter((producto) =>
    idProductosSeleccionados.has(String(producto.idproduct_comercial).trim())
  );

  console.log("Productos filtrados:", productos_filtrados);

  if (productos_filtrados.length === 0) {
    console.warn("No se encontraron productos coincidentes.");
  }
  return productos_filtrados;
}

function select_grupo_etapas_idgrupo_etapas() {
  const grupos = document.getElementById(
    `grupo_etapas_idgrupo_etapas${codigo}`
  );
  const rubros_select = document.querySelector(
    `#rubro_idrubro${codigos.codigoPrincipal}`
  );
  if (!grupos || !rubros_select) {
    console.error("No se encontraron los elementos del DOM.");
    return;
  }
  let idrubro = rubros_select.value;
  let view = `<option value="" disabled selected>Seleccione un grupo</option>`;
  Lista_grupo_etapas.map((lista) => {
    //console.log(lista);
    //console.log(idrubro);
    if (Number(lista.rubro_idrubro) === Number(idrubro)) {
      view += `
                <option value="${lista.idgrupo_etapas}">${lista.nombre}</option>
            `;
    }
  });
  grupos.innerHTML = view;
}

function configurarSelect(idSelectBox, idSelectOptions, idSelectionInfo) {
  const selectBox = document.getElementById(idSelectBox);
  const selectOptions = document.getElementById(idSelectOptions);
  const selectionInfo = document.getElementById(idSelectionInfo);
  let selectedOptions = [];

  selectBox.addEventListener("click", function () {
    selectOptions.style.display =
      selectOptions.style.display === "block" ? "none" : "block";
  });

  selectOptions.addEventListener("click", function (event) {
    const clickedOption = event.target;

    if (clickedOption.tagName === "DIV") {
      const optionValue = clickedOption.getAttribute("data-value");
      const optionText = clickedOption.textContent;

      const optionIndex = selectedOptions.findIndex(
        (option) => option.producto_idproducto === Number(optionValue)
      );

      if (optionIndex === -1) {
        selectedOptions.push({
          producto_idproducto: Number(optionValue),
          text: optionText,
        });
        clickedOption.classList.add("selected");
      } else {
        selectedOptions.splice(optionIndex, 1);
        clickedOption.classList.remove("selected");
      }

      updateSelectionInfo();
      console.log("Opciones seleccionadas actualizadas:", selectedOptions);
    }
  });

  function updateSelectionInfo() {
    const totalOptions = document.querySelectorAll(
      `#${idSelectOptions} div`
    ).length;
    selectionInfo.textContent = `${selectedOptions.length} de ${totalOptions} productos seleccionados`;
  }

  document.addEventListener("click", function (event) {
    if (
      !selectBox.contains(event.target) &&
      !selectOptions.contains(event.target)
    ) {
      selectOptions.style.display = "none";
    }
  });

  // Solo retornamos el array de opciones seleccionadas sin verificar su contenido

  return selectedOptions;
}

function llenar_select_caracteristicas() {
  const select_div = document.querySelector(`#productos_idproductos${codigo}`);
  const rubro = document.getElementById(
    `rubro_idrubro${codigos.codigoPrincipal}`
  );

  let view = "",
    ind = 1;
  const obtenerProductosNoAgrupados = (productos, productos_agrupados) => {
    // Obtener todos los `producto_idproducto` de `productos_agrupados`
    const productosAgrupadosIds = new Set(
      productos_agrupados.flatMap((grupo) =>
        grupo.grupo_productos.map((producto) =>
          Number(producto.producto_idproducto)
        )
      )
    );

    // Filtrar productos que no están en `productosAgrupadosIds`
    const productosNoAgrupados = productos.filter(
      (producto) => !productosAgrupadosIds.has(producto.idproduct_comercial)
    );

    return productosNoAgrupados;
  };

  // Ejecutar la función y mostrar los productos no agrupados
  const productosNoAgrupados = obtenerProductosNoAgrupados(
    Lista_Productos,
    List_productos_agrupados
  );
  console.log("Productos no agrupados:", productosNoAgrupados);

  let list = productosNoAgrupados.filter(
    (obj) => Number(obj.rubro_idrubro) === Number(rubro.value)
  );
  list.map((lista) => {
    view += `
            <div data-value="${lista.idproduct_comercial}"> <span class="fw-bold text-primary">Nombre Producto:</span> ${lista.nombre} <span class="fw-bold text-primary">Codigo producto:</span> ${lista.codigo}</div>
        `;
  });
  select_div.innerHTML = view;
}
function vaciar_listas() {
  Lista_Productos = [];
  Lista_empleados = [];
  Lista_etapas_produccion = [];
  Lista_seccion = [];
  Lista_grupo_etapas = [];
  list_unidadTiempo = [];
  list_rubro = [];
  list_categoria = [];
  list_medida = [];
  list_estados = [];
  list_unidad = [];
  Lista_productos_grupo = [];
  List_productos_agrupados = [];
  Lista_productos_de_un_grupo = [];
}
function alertas(data) {
  console.log(data);
  // Definir las variables al principio
  let alertClass, alertMessage, timeoutDuration;
  // Determinar el tipo de alerta y su mensaje
  if (data[0] == "success") {
    alertClass = "alert-success";
    alertMessage = data[1];
    timeoutDuration = 1500;
    sitio();
    vaciar_listas();
  } else {
    if (data[0] == "danger") {
      alertClass = "alert-danger";
      alertMessage = data[1];
      timeoutDuration = 3000;
    } else {
      alertClass = "alert-primary";
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
