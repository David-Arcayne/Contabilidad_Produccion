import { crearElemento, FormatoDate, FormatoDateTime, FormatoEnUs, SpinnerRow } from "./Funciones.js";

/**
 * Crear una tabla con el encabezado deseado
 * @param {string[]} encabezado - Nombre de columnas para la tabla
 * @returns [ table, tbody ]
 */
export const crearTabla = (encabezado) => {
    const thead = crearElemento("thead", { class: "table-dark" }, [contenidoTHead(encabezado)]);
    const tbody = crearElemento("tbody");
    const table = crearElemento("table", { class: "table table-bordered table-hover align-middle mb-0" }, [thead, tbody]);

    const div = crearElemento("div", {class: "table-responsive"}, [table]);
    SpinnerRow(tbody);

    let iteraciones = 0;
    let intervalo = setInterval(async function() {
        const body = div.closest(".card-body");
        iteraciones++;
        if (body) {
            const altura = body.offsetHeight  - (div.offsetTop);
            if (altura > 230) {
                div.setAttribute("style", `max-height: ${altura + 30}px`);
            }else {
                div.setAttribute("style", `max-height: 260px`);
            }
            clearInterval(intervalo);
        } else {
            if (iteraciones >= 20) {
                clearInterval(intervalo);
            }
        }
    }, 200); 

    return [div, tbody];
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
 * @param {Object.<string, {clave:string, valor:string}[]>} [registrosPropios] - Objeto con registros propios para mostrar en la tabla
 */
export const contenidoTBody = async (listaDeRegistros, contenidoTabla, tbody, registrosPropios) => {
    const { data: listaRegistros } = await listaDeRegistros;

    if (!listaRegistros || listaRegistros.length == 0) {
        const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
        const tr = crearElemento("tr", undefined, [td]);
        tbody.replaceChildren(tr);
        return;
    }
    
    const fragment = document.createDocumentFragment();

    let contador = 0;
    const mantenerDatos = [];
    for (const registro of listaRegistros) {
        const tr = crearElemento("tr");
        contador++;

        for (const [index, columna] of contenidoTabla.contenido.entries()) {
            const td = crearElemento("td");
            
            if (contenidoTabla.estiloTd[index] == "contador") {
                td.classList.add("text-center");
                td.innerHTML = contador;
                tr.appendChild(td);
                continue;
            }

            if (contenidoTabla.estiloTd[index] == "decimal" || contenidoTabla.estiloTd[index] == "date" || contenidoTabla.estiloTd[index] == "datetime") {
                td.classList.add("text-end");
            } else {
                td.classList.add(contenidoTabla.estiloTd[index]);
            }
            tr.appendChild(td);
            if (typeof (columna) === "object") {
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
                } else {
                    const elementosDeOpcion = opciones(registro, columna, { contenidoTabla: contenidoTabla.contenido, tbody });
                    td.classList.add("text-nowrap");
                    td.appendChild(elementosDeOpcion);
                }
            } else if (registrosPropios && registrosPropios[columna]){
                for (const opcion of registrosPropios[columna]) {
                    if (opcion.clave == registro[columna]){
                        td.innerHTML = opcion.valor
                    }
                }
                if (td.childNodes.length === 0) {
                    td.innerHTML = "-";
                }
            }  else {

                if (registro[columna] && contenidoTabla.estiloTd[index] == "decimal") {
                    const numero = registro[columna];
                    const numeroRedondeado = FormatoEnUs(numero);
                    td.innerHTML = numeroRedondeado;
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
    if (funcionalidades.accion && Object.keys(funcionalidades.accion).length > 0) {
        const boton = botonDeAccion(funcionalidades.accion, datoRegistro, elementos);
        if (boton != "-"){
            fragment.append(boton, " ");
        }
    }

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
            tbody: elementos.tbody
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
                    tbody: elementos.tbody
                })
            })
        }

        if (opcionesBoton.texto) a.append(" ", opcionesBoton.texto);
    }

    return a;

}
