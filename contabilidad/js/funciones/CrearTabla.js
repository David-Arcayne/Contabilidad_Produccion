import { crearElemento, FormatoDate, FormatoDateTime, FormatoEnUs, SpinnerRow } from "./Funciones.js";

/**
 * Crear una tabla con el encabezado deseado
 * @param {string[]} encabezado - Nombre de columnas para la tabla
 * @param {boolean} [t_registro] - Indica si la tabla tendra un elmento "tbody" adicional para los registros
 * @returns [ table, tbody ]
 */
export const crearTabla = (encabezado, t_registro = false) => {
    const thead = crearElemento("thead", { class: "table-dark z-3" }, [contenidoTHead(encabezado)]);
    const tbody = crearElemento("tbody");
    let table;
    let tbodyRegistro = null;
    if (t_registro) {
        tbodyRegistro = crearElemento("tbody");
        table = crearElemento("table", { class: "table table-bordered table-hover align-middle mb-0" }, [thead, tbodyRegistro, tbody]);
    } else {
        table = crearElemento("table", { class: "table table-bordered table-hover align-middle mb-0" }, [thead, tbody]);
    }

    const div = crearElemento("div", {class: "table-responsive"}, [table]);
    SpinnerRow(tbody);

    // Ajustar el tamaño de la tabla
    let iteraciones = 0;
    let intervalo = setInterval(async function() {
        const body = div.closest(".card-body");
        iteraciones++;
        if (body) {
            const altura = body.offsetHeight  - (div.offsetTop);
            if (altura > 230) {
                div.setAttribute("style", `max-height: ${altura + 30}px; min-height: 290px`);
            }else {
                div.setAttribute("style", `max-height: 290px; min-height: 290px`);
            }
            clearInterval(intervalo);
        } else {
            if (iteraciones >= 20) {
                clearInterval(intervalo);
            }
        }
    }, 200); 

    return [div, tbody, tbodyRegistro];
}

/**
 * Crea el encabezado de la tabla con los nombres respectivos
 * @param {string[]} encabezado - Array de nombres de encabezado
 * @returns {HTMLElement}
 */
const contenidoTHead = (encabezado) => {
    const tr = crearElemento("tr");
    encabezado.forEach(nombre => {
        tr.append(crearElemento("th", { class: "text-nowrap" }, [nombre]));
    })
    return tr;
}

/**
 * Modifica el contenido "tbody" de una tabla con los registros proporcionados.
 * @param {Object} listaDeRegistros - Objeto con registros de una tabla.
 * @param {Object} contenidoTabla - Objeto con los registros y estilos a usar.
 * @param {(string | Object)[]} contenidoTabla.contenido - Array de claves de los registros a usar.
 * @param {string[]} contenidoTabla.estiloTd - Array de estilos para las columnas.
 * @param {HTMLElement} tbody - Elemento "tbody" donde se almacenaran los registros.
 * @param {Object.<string, {clave:string, valor:string}[]>} [registrosPropios] - Objeto con registros para mostrar en la tabla segun la clave del registro.
 */
export const contenidoTBody = (listaDeRegistros, contenidoTabla, tbody, registrosPropios) => {
    const listaRegistros = listaDeRegistros;

    if (!listaRegistros || listaRegistros.length == 0) {
        const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
        const tr = crearElemento("tr", undefined, [td]);
        tbody.replaceChildren(tr);
        return;
    }
    
    const fragment = document.createDocumentFragment();

    let contador = 0;
    const mantenerDatos = [];
    const grupoRegistros = {};
    for (const registro of listaRegistros) {
        const tr = crearElemento("tr");
        contador++;

        for (const [index, columna] of contenidoTabla.contenido.entries()) {
            const td = crearElemento("td");
            
            // Agregar una enumeracón consecutiva a la columna
            if (contenidoTabla.estiloTd[index] == "contador") {
                td.classList.add("text-center");
                td.innerHTML = contador;
                tr.appendChild(td);
                continue;
            }
            // if (contenidoTabla.estiloTd[index] == "checkbox") {
            //     td.classList.add("text-center");
            //     const input = crearElemento("input", {type: "checkbox", class: "form-check-input border-primary"});
            //     td.appendChild(input);
            //     tr.appendChild(td);

            //     input.addEventListener("change", (e) => {
            //         const divT = tbody.closest(".table-responsive");
            //         const divContenedor = divT.parentElement;
            //         const btnAsientoM = crearElemento("button", {class: "btn btn-primary btn-sm"}, ["Asiento Modelo"]);
            //         const btnCuenta = crearElemento("button", {class: "btn btn-primary btn-sm ms-2"}, ["Cuenta"]);
            //         const divOpciones = crearElemento("div", {class: "d-flex justify-content-end mb-2", id: "opciondes_agrupar"}, [btnAsientoM, btnCuenta]);

            //         if (input.checked) {
            //             grupoRegistros[registro.id] = registro;
            //             if (divContenedor.querySelector("#opciondes_agrupar")) {
            //                 return;
            //             }
            //             divContenedor.insertBefore(divOpciones, divT);
            //         } else {
            //             delete grupoRegistros[registro.id];
            //             if (Object.keys(grupoRegistros).length === 0) {
            //                 divContenedor.removeChild(divContenedor.querySelector("#opciondes_agrupar"));
            //                 return;
            //             }
            //         }
                    
            //         btnAsientoM.addEventListener("click", async (e) => {
            //             const form = await import("../vistas/asientoModelo/index.js");
            //             form.AsientoModelo(grupoRegistros, {lectura: "1", escritura: "1", editar: "1", eliminar: "1"});
            //         });
            //         btnCuenta.addEventListener("click", async (e) => {
            //             const form = await import("../vistas/planDeCuentas/index.js");
            //             form.PlanDeCuentas(grupoRegistros, {lectura: "1", escritura: "1", editar: "1", eliminar: "1"});
            //         });
            //     });
            //     continue;
            // }

            if (contenidoTabla.estiloTd[index] == "decimal" || contenidoTabla.estiloTd[index] == "date" || contenidoTabla.estiloTd[index] == "datetime") {
                td.classList.add("text-end");
            } else {
                td.classList.add(contenidoTabla.estiloTd[index]);
            }
            tr.appendChild(td);
            if (typeof (columna) === "object") {
                // Ejecuta las respectivas funciones de las columnas si este es un objeto
                if (columna.miEstilo) {
                    columna.miEstilo({
                        elemento: td,
                        contenidoTabla: contenidoTabla.contenido,
                        registro: registro,
                        tbody: tbody
                    });
                } else if(columna.agregarT) {
                    columna.agregarT({
                        elemento: td,
                        contenidoTabla: contenidoTabla.contenido,
                        registro: registro,
                        tbody: tbody,
                        arrayT: mantenerDatos,
                    });
                } else if(columna.colInput) { // Agregar un input en la columna
                    columna.colInput({
                        elemento: td,
                        contenidoTabla: contenidoTabla.contenido,
                        registro: registro,
                        tbody: tbody,
                        objectT: grupoRegistros
                    });
                } else {
                    const elementosDeOpcion = opciones(registro, columna, { contenidoTabla: contenidoTabla.contenido, tbody, td });
                    td.classList.add("text-nowrap");
                    td.appendChild(elementosDeOpcion);
                }
            } else if (registrosPropios && registrosPropios[columna]){
                // Obtiene el texto de la clave del registro segun la columna
                for (const opcion of registrosPropios[columna]) {
                    if (opcion.clave == registro[columna]){
                        td.innerHTML = opcion.valor
                    }
                }
                if (td.childNodes.length === 0) {
                    td.innerHTML = "-";
                }
            }  else {
                // Agregar el contenido de la columna (con su respectivo formato)
                if (registro[columna] && contenidoTabla.estiloTd[index] == "decimal") {
                    const numero = registro[columna];
                    const numeroFormateado = FormatoEnUs(numero);
                    td.innerHTML = numeroFormateado;
                } else if (registro[columna] && contenidoTabla.estiloTd[index] == "date") {
                    const fecha = FormatoDate(registro[columna]);
                    td.innerHTML = fecha || "-";
                } else if (registro[columna] && contenidoTabla.estiloTd[index] == "datetime") {
                    const fecha = FormatoDateTime(registro[columna]);
                    td.innerHTML = fecha || "-";
                } else {
                    td.innerHTML = registro[columna] || registro[columna] === 0 ? registro[columna] : "-";
                }
            }
        }
        fragment.appendChild(tr);
    }

    // Agregar filas en base a las funciones de las columnas según la función de "contenidoTabla.contenido[].agregarT()"
    if (mantenerDatos.length > 0) {
        const accion = mantenerDatos.shift();
        if (typeof(accion) === "function") {
            const filas = accion(...mantenerDatos);
            fragment.append(...filas);
        } else {
            accion(...mantenerDatos);
        }
    }

    tbody.replaceChildren(fragment);
}

/**
 * Crear botones de las opciones requeridas con sus funcionalidades respectivas
 * @param {Object.<string, (string|number)>} datoRegistro - Objeto con datos de un registro
 * @param {Object} funcionalidades - Objeto con funconalidades y opciones para crear el boton
 * @param {Object} [funcionalidades.accion] - Objeto para crear un boton con una determinada accion
 * @param {Object} [funcionalidades.acciones] - Objeto de opciones con sus respectivos datos y acciones
 * @param {Object} [funcionalidades.usarBasicos] - Objeto para crear los botones de eliminar y editar
 * @param {Object} elementos - Objeto con las claves de registro a usar y el elemento "tbody"
 * @param {(string | Object)[]} elementos.contenidoTabla - Array de claves de los registros
 * @param {HTMLTableSectionElement} elementos.tbody - Elemento "tbody" 
 * @returns {DocumentFragment}
 */
const opciones = (datoRegistro, funcionalidades, elementos) => {
    const fragment = document.createDocumentFragment();

    // Crear botones de las opciones requeridas segun el objeto "funcionalidades.acciones"
    const acciones = funcionalidades.acciones;
    if (acciones && Object.keys(acciones).length > 0) {
        for (const data in acciones) {
            const a = botonDeAccion(acciones[data], datoRegistro, elementos);
            if (a === "-") {
                continue;
            }
            fragment.append(a, " ");
        }
    }

    // Crear un boton con una accion determinada segun el objeto "funcionalidades.accion"
    if (funcionalidades.accion && Object.keys(funcionalidades.accion).length > 0) {
        const boton = botonDeAccion(funcionalidades.accion, datoRegistro, elementos);
        if (boton != "-"){
            fragment.append(boton, " ");
        }
    }

    // Crear botones basicos de editar y eliminar segun el objeto "funcionalidades.usarBasicos"
    const btnsBasicos = funcionalidades["usarBasicos"];
    if (btnsBasicos && Object.keys(btnsBasicos).length > 0) {
        if (btnsBasicos.editar) {
            const editar = {
                accion: btnsBasicos.editar,
                icono: "bi bi-pencil-square m-0 p-0",
                classElemento: "btn btn-warning btn-sm ",
                titulo: "Editar",
                condicional: btnsBasicos.condicional,
            };
            const a = botonDeAccion(editar, datoRegistro, elementos)
            if (a != "-") {
                fragment.append(a, " ");
            }
        }
        if (btnsBasicos.eliminar) {
            const eliminar = {
                accion: btnsBasicos.eliminar,
                icono: "bi bi-trash-fill",
                classElemento: "btn btn-danger btn-sm ",
                titulo: "Eliminar",
                condicional: btnsBasicos.condicional,
            };
            const a = botonDeAccion(eliminar, datoRegistro, elementos);
            if (a != "-") {
                fragment.append(a, " ");
            }
        }
    }

    // Crear un dropdown con sus respectivas funcionalidades segun el objeto "funcionalidades.dropdown"
    const dropdown = funcionalidades.dropdown;
    if (dropdown && dropdown.length > 0) {
        const icono = crearElemento("i", {class: "bi bi-caret-up"});
        const btnDropdown = crearElemento("button", {type: "button", class: "btn btn-info btn-sm rounded", "data-bs-toggle": "dropdown", "aria-expanded": "false", title: "Más opciones"}, [icono]);
        const divMenu = crearElemento("div", {class: "dropdown-menu text-wrap px-2 pb-0 text-center border-2 border-info"});
        const div = crearElemento("div", {class: "btn-group dropup "}, [btnDropdown, divMenu]);

        for (const data of dropdown) {
            const a = botonDeAccion(data, datoRegistro, elementos);
            if (a === "-") {
                continue;
            }
            a.classList.add("mb-2");
            divMenu.append(a, " ");
        }
        if (divMenu.childNodes.length > 0) {
            fragment.append(div, " ");
        }
    }

    if (fragment.childNodes.length === 0) {
        fragment.append("-");
    } 

    return fragment;
}

/**
 * Crear un boton con su respectiva funcionalidad.
 * @param {Object} opcionesBoton - Objeto con los opciones necesarios para crear un elemento boton.
 * @param {Function} [opcionesBoton.estilo] - Funcion para agregar estilos y funconalidad al boton.
 * @param {Function} [opcionesBoton.accion] - Funcion que se ejecutara en el evento "click" del boton.
 * @param {string} [opcionesBoton.icono] - clases de iconos.
 * @param {string} [opcionesBoton.classElemento] - clases para el boton .
 * @param {string} [opcionesBoton.href] - La URL a la que apunta el boton.
 * @param {string} [opcionesBoton.texto] - Texto del boton.
 * @param {string} [opcionesBoton.titulo] - Atributo "title" del boton.
 * @param {Object} [opcionesBoton.condicional] - Objeto para deshabilitar el boton segun la clave del registro.
 * @param {string} opcionesBoton.condicional.llave - Clave del registro.
 * @param {(string|number)[]} [opcionesBoton.condicional.verdaderos] - Array de datos validos para deshabilitar el boton.
 * @param {(string|number)[]} [opcionesBoton.condicional.falsos] - Array de datos no validos para deshabilitar el boton.
 * @param {Object} datoRegistro - Objeto con los datos de un registro.
 * @param {Object} elementos - Objeto con las claves de registro a usar y el elemento "tbody".
 * @param {(string | Object)[]} elementos.contenidoTabla - Array de claves del registro.
 * @param {HTMLTableSectionElement} elementos.tbody - Elemento "tbody" .
 * @returns {HTMLAnchorElement}
 */
export const botonDeAccion = (opcionesBoton, datoRegistro, elementos) => {
    const a = crearElemento("a");

    const condicional = opcionesBoton.condicional;
    if (condicional && datoRegistro.hasOwnProperty(condicional.llave)) {
        if (condicional.verdaderos) {
            if (condicional.verdaderos.includes(datoRegistro[condicional.llave])) {
                return "-";
            }
        } 
        if (condicional.falsos) {
            if (!condicional.falsos.includes(datoRegistro[condicional.llave])) {
                return "-";
            }
        }
    }

    if (opcionesBoton.estilo) {
        opcionesBoton.estilo({
            elemento: a,
            contenidoTabla: elementos.contenidoTabla,
            registro: datoRegistro,
            tbody: elementos.tbody,
            td: elementos.td
        })
    } else {
        const i = crearElemento("i", {class: opcionesBoton.icono});
        a.setAttribute("class", opcionesBoton.classElemento);
        a.appendChild(i);

        if (opcionesBoton.titulo) {
            a.setAttribute("title", opcionesBoton.titulo)
        }

        if (opcionesBoton.href) {
            a.setAttribute("href", opcionesBoton.href(datoRegistro.id));
            a.setAttribute("target", "_blank");
        } else {
            a.addEventListener("click", (e) => {
                opcionesBoton.accion({
                    elemento: a,
                    contenidoTabla: elementos.contenidoTabla,
                    registro: datoRegistro,
                    tbody: elementos.tbody,
                    td: elementos.td
                })
            })
        }

        if (opcionesBoton.texto) a.append(" ", opcionesBoton.texto);
    }

    return a;

}
