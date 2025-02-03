import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, FormatoDate, FormatoEnUs } from "../../../funciones/Funciones.js";
import { modalDeInformacion } from "../../../funciones/Modals.js";
import { editarRegistro, eliminarRegistro, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { obtenerDatos, obtenerDatosAlr } from "../../../funciones/Solicitudes.js";
import { formularioPagarFactura } from "../Formularios.js";

/**
 * Crea el contenido de la vista Crear Asiento.
 * @param {Object} datosVista - Opciones requeridas para crear el contenido.
 * @param {HTMLElement} datosVista.vistaPrincipal - Elemento contenedor de la vista principal.
 * @param {HTMLElement} datosVista.vistaPagar - Elemento contenedor de la vista revaluo.
 * @param {Object} datosVista.permisos - Permisos del usuario sobre la vista {lectura, escritura, editar, eliminar}.
 * @returns {function} Funcion para crear el contenido de la vista.
 */
export const PagarFactura = (datosVista) => {
    const {
        vistaPrincipal,
        vistaPagar, 
        permisos,
        estiloFxP,
        URL_LT_FXP,
    } = datosVista;

    /**
     * @param {Object} referencias - Objeto con datos obtenidos al crear la tabla
     * @param {Object.<string,string>} referencias.registro - Objeto con los datos de un registro de Activos Fijos.
     */
    return async ({registro, contenidoTabla: ctFxC, tbody: tbFxC}) => {
        const URL = `${URL_APIC}api/`;
        const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
        const sucursal_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idsucursal;
        const URL_LT = `${URL}listapagoscobros/${registro.id}`;

        const moneda = crearElemento("p", { class: "text-center" }, ["(Expresado en Bolivianos)"]);
        const regresar = async () => {
            const listaDeRegistros = await obtenerDatos(URL_LT_FXP);
            if (listaDeRegistros) {
                const nuevoRegistro = listaDeRegistros.filter(registro => Number(registro.saldo.toFixed(2)) !== 0);
                contenidoTBody(nuevoRegistro, {contenido: ctFxC, estiloTd: estiloFxP}, tbFxC)
                cambiarVista(vistaPagar, vistaPrincipal)
            }
        }
        const divNombre = crearElemento("div", undefined, [`${registro.nombre}`]);
        const divSaldo = crearElemento("div", undefined, [`Saldo: ${FormatoEnUs(registro.saldo)}`]);
        const divInformacion = crearElemento("div", { class: "text" }, [moneda, divNombre, divSaldo]);
        const tituloVista = encabezadoVista("Volver", "Pagar Factura", regresar, undefined, divInformacion)
        vistaPagar.replaceChildren(tituloVista);

        const datoGA = await obtenerDatos(`${URL}getgestionactual/${empresa_id}`);
        if (datoGA && datoGA.nombre) {
            const spanGA = crearElemento("span", { class: "ft-italic text-secondary" }, [`${datoGA.nombre} (${FormatoDate(datoGA.fechaini)} a ${FormatoDate(datoGA.fechafin)})`]);
            const textGA = crearElemento("p", { class: "fs-6" }, ["Gestión Activa: ", spanGA]);
            const gestionActiva = crearElemento("div", { class: "text-end" }, [textGA])
            vistaPagar.appendChild(gestionActiva);
        } else {
            const h1 = crearElemento("h1", { class: "h3 text-center text-secondary fst-italic mt-5" }, ["Ninguna Gestión activa"]);
            vistaPagar.appendChild(h1);
            return;
        }

        // Creación de Vistas para la navegación en la ventana
        const vistaRegistrarPF = crearElemento("div", {class: "mb-4"});
        const vistaPrincipalPF = crearElemento("div", undefined, [vistaRegistrarPF]);
        const vistaEditarPF = crearElemento("div", {class: "d-none"});

        vistaPagar.append(vistaPrincipalPF, vistaEditarPF);
        
        // Creación de elementos para la vista principal
        const alertasPF = crearElemento("div");
        vistaPrincipalPF.appendChild(alertasPF);
        // if (permisos.escritura === "1") {
        //     const nuevoRegistro = () => cambiarVista(vistaPrincipalPF, vistaRegistrarPF);
        //     const opciones = btnNuevoRegistro(nuevoRegistro);
        //     opciones.classList.add("mb-2");
        //     vistaPrincipalPF.appendChild(opciones);
        // }
        const encabezadoTabla = [
            "Fecha",
            "Persona",
            "CI",
            "Recibo",
            "Monto",
            "Opciones",
        ];
        const estiloTd = [
            "date",
            "text-start",
            "text-start",
            "text-start",
            "decimal",
            "text-start",
        ];
        const contenidoTabla = [
            "fecha",
            // {
            //     nombre: "fecha",
            //     agregarT: FechaCobro,
            // },
            "persona",
            "ci",
            "recibo",
            "monto",
            {
                nombre: "Opciones",
                usarBasicos: {
                    // editar: editarRegistro({
                    //     vistaPrincipal: vistaPrincipalPF,
                    //     vistaEditar: vistaEditarPF,
                    //     contenedorDeAlertas: alertasPF,
                    //     camposDeFormulario: formularioPagarFactura,
                    //     URL_FORM: `${URL}`,
                    //     URL_LISTAR: URL_LT,
                    //     estiloTd,
                    //     accionPrevia: ValidarFecha(vistaPagar, datoGA),
                    // }, {
                    //     datosExtra: [
                    //         { key: "ver", value: "registrocobrarfacturaf5" },
                    //         { key: "idcobro", value_r: "id" },
                    //         { key: "idfactura", value: registro.id },
                    //         { key: "idtransaccion", value: registro.transaccion },
                    //         { key: "idcuenta", value: registro.cuenta },
                    //         { key: "idcliente", value: registro.idproveedor },
                    //         { key: "sucursal", value: sucursal_id },
                    //         { key: "empresa", value: empresa_id },
                    //     ]
                    // }),
                    eliminar: eliminarRegistro({
                        vistaPrincipal: vistaPrincipalPF,
                        contenedorDeAlertas: alertasPF,
                        URL: (id) => `${URL}eliminarpagar/${id}`,
                    }),
                }
            }
        ];
        if (permisos.eliminar === "0") {
            encabezadoTabla.pop();
            contenidoTabla.pop();
        }
        const [tabla, tBody] = crearTabla(encabezadoTabla);
        vistaPrincipalPF.append(tabla);
        // Listar los registros en la tabla.
        const cargarContenido = (registros) => { contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody); }
        obtenerDatosAlr(URL_LT, { contenedor: alertasPF, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
        // Creación de formulario para la vista Registrar
        if (permisos.escritura === "1") {
            nuevoRegistro({
                // vistaPrincipal: vistaPrincipalPF,
                vistaRegistrar: vistaRegistrarPF,
                contenedorDeAlertas: alertasPF,
                contenidoTabla,
                tBody,
                URL_FORM: `${URL}`,
                URL_LISTAR: URL_LT,
                camposDeFormulario: formularioPagarFactura,
                estiloTd,
                accionPrevia: ValidarFecha(vistaPagar, datoGA),
            }, undefined, {
                datosExtra: [
                    { key: "ver", value: "registropagarfactura" },
                    { key: "idfactura", value: registro.id },
                    { key: "idtransaccion", value: registro.transaccion },
                    { key: "idcuenta", value: registro.cuenta },
                    { key: "idcliente", value: registro.idproveedor },
                    { key: "sucursal", value: sucursal_id },
                    { key: "empresa", value: empresa_id },
                ]
            });
        }
    
        cambiarVista(vistaPrincipal, vistaPagar)
    }   
}

const ValidarFecha = (vista, gestion) =>  (enviarFormulario, form) => {
    const fecha = form.querySelector("#fxppagarfactura_fecha");
    if (fecha.value < gestion.fechaini || fecha.value > gestion.fechafin) {
        const modal = modalDeInformacion("La fecha no corresponde a la gestion actual");
        vista.appendChild(modal);
        return;
    }
    enviarFormulario();
};

// const FechaCobro = (div, saldo, trPadre) => ({elemento, registro, arrayT}) => {
//     const monto = parseFloat(registro.monto);
//     if (arrayT.length > 0) {
//         arrayT[2] += monto;
//     } else {
//         const accion = (montoTotal) => {
//             div.textContent = montoTotal;
//         }
//         arrayT.push("ver", accion, monto);
//     }
//     elemento.textContent = registro.fecha;
// }
