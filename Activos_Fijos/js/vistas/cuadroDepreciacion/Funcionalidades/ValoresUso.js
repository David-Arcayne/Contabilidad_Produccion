import { formularioCuadroDprUso } from "../Formularios.js";
import { alertaDeError, alertaDeExito } from "../../../funciones/Alertas.js";
import { crearFormulario } from "../../../funciones/CrearFormulario.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { cambiarVista, crearElemento, encabezadoVista, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { editarRegistro, eliminarRegistro } from "../../../funciones/OpcionesBasicas.js";

/**
 * Crea el contenido de la vista Componentes.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaActivoFijo - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaValoresUso - Elemento contenedor de la vista Valores de uso.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const ValoresUso = (datosVista) => {
    const {
        vistaActivoFijo,
        vistaValoresUso, 
        permisos
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return ({registro}) => {
        const URL = "./api/uso-activofijo";

        // console.log(registro.duracion);
        
        const regresar = () => { cambiarVista(vistaValoresUso, vistaActivoFijo) }
        const tituloVista = encabezadoVista("Volver", "Valores de Uso", regresar)
        vistaValoresUso.replaceChildren(tituloVista);

        // Creación de Vistas para la navegación en la ventana
        const vistaPrincipalUso = crearElemento("div");
        const vistaEditarUso = crearElemento("div", {class: "d-none"});
        
        vistaValoresUso.append(vistaPrincipalUso, vistaEditarUso);
        
        // Creación de elementos para la vista principal
        const alertasUso = crearElemento("div");
        const vistaRegistrarUso = crearElemento("div", {class: "pb-5"});
        if (permisos.escritura === "1") {
            vistaPrincipalUso.appendChild(vistaRegistrarUso);
        }
        vistaPrincipalUso.appendChild(alertasUso);

        const estiloTd = [
            "date",
            "text-end",
            "text-start",
        ];
        let usarBasicos = {
            editar: editarRegistro({
                vistaPrincipal: vistaPrincipalUso,
                vistaEditar: vistaEditarUso,
                contenedorDeAlertas: alertasUso,
                camposDeFormulario: formularioCuadroDprUso,
                URL,
                URL2: `${URL}/activofijo/${registro.id}`,
                estiloTd,
            }), 
            eliminar: eliminarRegistro({
                vistaPrincipal: vistaValoresUso,
                contenedorDeAlertas: alertasUso,
                URL,
            }, undefined, RecalcularUso(vistaPrincipalUso, registro.duracion ?? 0)),
        };
        if(permisos.editar === "0") {
            delete usarBasicos.editar;
        }
        if(permisos.eliminar === "0") {
            delete usarBasicos.eliminar;
        }
        const encabezadoTabla = [
            "Fecha",
            "Uso",
            "Opciones",
        ];
        const contenidoTabla = [
            "fecha",
            {
                nombre: "uso",
                agregarT: UsoActivo(registro.duracion ?? 0),
            },
            {
                nombre: "Opciones",
                usarBasicos,
            }
        ];
        if (permisos.editar === "0" && permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }

        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalUso.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(`${URL}/activofijo/${registro.id}`, { contenedor: alertasUso, error: "Ocurrio un error al cargar los registros", accion: cargarContenido });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            const realizarRegistro = async () => {
                let listaDeRegistros = obtenerDatos(`${URL}/activofijo/${registro.id}`);
                await contenidoTBody(listaDeRegistros, {contenido: contenidoTabla, estiloTd}, tBody)
                alertaDeExito(alertasUso, "Registro exitoso");
            }
            const errorRegistro = () => {
                alertaDeError(alertasUso, "No se pudo realizar el registro");
            }
            const datosFormulario = {
                myurl: URL,
                datosExtra: {activosfijos_id: registro.id},
                accionEnviar: realizarRegistro,
                error: errorRegistro,
                datosBtn: {
                    btnClass: "btn btn-primary",
                    nombre: "Guardar",
                }
            }
            const nuevoformulario = crearFormulario(formularioCuadroDprUso, datosFormulario);
            vistaRegistrarUso.append(nuevoformulario);
        }
    
        cambiarVista(vistaActivoFijo, vistaValoresUso)
    }   
}

export const UsoActivo = (duracion) =>  ({elemento, registro, arrayT}) => {
    const strUso = parseInt(registro.uso ?? 0);
    const usoActivo = parseInt(strUso);
    if (arrayT.length > 0) {
        arrayT[1] += usoActivo;
    } else {
        const row = (usoAF) => {
            let colorT = "table-secondary";
            let rowInfo;
            if (usoAF > duracion) {
                // Si sobrepasa la duración se crea la fila de información.
                colorT = "table-warning";
                const td = crearElemento("td", { class: "text-center text-danger fw-bold", colspan:"100%" }, [`El valor de uso es mayor a la duración ( ${parseInt(usoAF) - parseInt(duracion)} )`]);
                rowInfo = crearElemento("tr", { class: colorT, id: "tr_depr_info" }, [td]);
            } 
            // Crear la fila de totales
            const td = crearElemento("td", { class: "text-end fw-bold" }, [`[ Duración = ${duracion} ] - Uso total:`]);
            const tdUso = crearElemento("td", { class: "text-end fw-bold", id: "td_depr_total_uso"}, [usoAF]);
            const tdr = crearElemento("td");
            const rowTotal = crearElemento("tr", { class: colorT }, [td,  tdUso, tdr]);

            if (rowInfo) {
                return [rowTotal, rowInfo];
            } else {
                return [rowTotal];
            }
        }
        arrayT.push(row, usoActivo);
    }
    elemento.textContent = usoActivo;
}


export const RecalcularUso = (vista, duracion) => (datos) => {
    const tdUso = vista.querySelector(`#td_depr_total_uso`);
    const tBody = tdUso.closest("tbody");
    const trInfo = tBody.querySelector("#tr_depr_info");

    // Si no hay registros en la tabla
    const countTbody = tBody.childElementCount;
    if ((trInfo && tdUso && countTbody === 2) || (!trInfo && tdUso && countTbody === 1)) {
        const td = crearElemento("td", {colspan: "100%", class: "text-center"}, ["No se encontraron registros"]);
        const tr = crearElemento("tr", undefined, [td]);
        tBody.replaceChildren(tr);
        return;
    }

    // Obteniendo los montos de la transacción.
    const uso = parseInt(datos.uso);
    const totalUso = parseInt(tdUso.textContent);
    const nuevoTotal = (totalUso - uso)
    tdUso.textContent = nuevoTotal;
    if (nuevoTotal <= duracion) {
        // Si el uso es menor o igual a duración se elimina la fila de información.
        if (trInfo) {
            trInfo.remove();
            tdUso.closest("tr").setAttribute("class", "table-secondary");
        }
    } else {
        if (trInfo) {
            // Si el uso es mayor a la duración y ya existe la fila de información se actualizan los montos.
            const tdD = trInfo.querySelector("td");
            tdD.textContent = `El valor de uso es mayor a la duración ( ${parseInt(nuevoTotal) - parseInt(duracion)} )`;
        } else {
            // si el uso es mayor a la duración y no existe la fila de información se crea.
            const td = crearElemento("td", { class: "text-center text-danger fw-bold", colspan:"100%" }, [`El valor de uso es mayor a la duración ( ${parseInt(nuevoTotal) - parseInt(duracion)} )`]);
            const rowInfo = crearElemento("tr", { class: "table-warning", id: "tr_depr_info" }, [td]);
            tBody.append(rowInfo);
            tdUso.closest("tr").setAttribute("class", "table-warning");
        }
    }
}