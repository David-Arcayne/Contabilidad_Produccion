import { URL_APIC } from "../../../../lib/services.js";
import { alertaDeError, alertaDeExito } from "../../funciones/Alertas.js";
import { contenidoTBody, crearTabla } from "../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, InputBusqueda, opciones } from "../../funciones/Funciones.js";
import { editarRegistro, editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../funciones/OpcionesBasicas.js";
import { obtenerDatos, obtenerDatosAlr, rellenarSelect } from "../../funciones/Solicitudes.js";
import { formularioCuentaImpuesto } from "./Formularios.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 */
export async function CuentasImpuestos(codigo, permisos) {
    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    // const URL_LT = `${URL}listarelacionip/${empresa_id}`;
    const URL_LT = `${URL}listaimpuestoentreplan/${empresa_id}`;
    const datosCuenta = await obtenerDatos(`${URL}milistaplanes/${empresa_id}`);

    // Creación de Vistas para la navegación en la ventana
    const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    vistaRegistrar.setAttribute("class", "d-none");
    const vistaEditar = crearElemento("div", { class: "d-none" });
   
    const contenedorPrincipal = vistaPrincipal.parentNode;
    contenedorPrincipal.append(vistaEditar);

    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);
    // if (permisos.escritura === "1") {
    //     const opcionesBtns = opciones([
    //         btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
    //     ]); 
    //     vistaPrincipal.appendChild(opcionesBtns);
    // }
    const encabezadoTabla = [
        "Cod. impuesto",
        "Impuesto",
        "Tasa",
        "",
        "Cod. cuenta",
        "Cuenta",
        "Tipo",
        "Opciones",
    ];
    const estiloTd = [
        "text-start",
        "text-start",
        "text-start",
        "text-center",
        "text-start",
        "text-start",
        "text-start",
        "text-start",
    ];
    const contenidoTabla = [
        "codigo",
        "nombre",
        "tasa",
        {
            nombre: "arrow",
            miEstilo: ({elemento}) => {
                const icono = crearElemento("i", { class: "bi bi-arrow-right text-primary fs-6" });
                elemento.append(icono);
            }
        },
        "plannumero",
        "plancuenta",
        "plantipo",
        {
            nombre: "_opcion",
            colInput: InputCuentas(vistaPrincipal, contenedorDeAlertas, datosCuenta, estiloTd, URL_LT),
        },
        // {
        //     nombre: "Opciones",
        //     usarBasicos: {
        //         editar: editarRegistroModal({
        //             vistaPrincipal,
        //             vistaEditar,
        //             contenedorDeAlertas,
        //             camposDeFormulario: formularioCuentaImpuesto,
        //             URL_FORM: URL,
        //             URL_LISTAR: URL_LT,
        //             estiloTd,
        //         }, {
        //             datosExtra: [
        //                 { key: "id", value_r: "idrelacionip" },
        //                 { key: "idplandecuenta", value_r: "idplandecuenta" },
        //                 { key: "idimpuesto", value_r: "idimpuesto" },
        //                 { key: "idempresa", value: empresa_id },
        //                 { key: "ver", value: "registrorelacionipf5" },
        //                 // { key: "ver", value: "registrorelacionip" },
        //             ]
        //         }),
        //         // eliminar: eliminarRegistro({
        //         //     vistaPrincipal,
        //         //     contenedorDeAlertas,
        //         //     URL: (id) => `${URL}/deleterelacionip/${id}`,
        //         // }),
        //     },
        // },
    ];
    const l_ct = contenidoTabla.length -1;
    if (permisos.editar === "0" && permisos.eliminar === "0") {
        encabezadoTabla.pop();
        contenidoTabla.pop();
    } else if (permisos.editar === "0") {
        delete contenidoTabla[l_ct].usarBasicos.editar;
    } else if (permisos.eliminar === "0"){
        delete contenidoTabla[l_ct].usarBasicos.eliminar;
    }
    const [tabla, tBody] = crearTabla(encabezadoTabla);
    const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(divBuscar, tabla);
    // Listar los registros en la tabla.
    const cargarContenido = (registros) => { 
        contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    };
    obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    
    // const test = [
    //     {id: 1, numero: "1.0.0.0.0", cuenta: "Cuenta 1", tipo: "DEBE", codigoimpuesto: "Imp 1", nombreimpuesto: "Impuesto 1", tasa: "1"},
    //     {id: 2, numero: "1.2.0.0.0", cuenta: "Cuenta 2", tipo: "DEBE", codigoimpuesto: "Imp 2", nombreimpuesto: "Impuesto 2", tasa: "2"},
    //     {id: 3, numero: "2.0.0.0.0", cuenta: "Cuenta 3", tipo: "HABER", codigoimpuesto: "Imp 3", nombreimpuesto: "Impuesto 3", tasa: "3"},
    // ]
    // contenidoTBody(test, {contenido: contenidoTabla, estiloTd}, tBody);

    // Creación de formulario para la vista Registrar
    if (permisos.escritura === "1") {
        nuevoRegistro({
            vistaPrincipal,
            vistaRegistrar,
            contenedorDeAlertas,
            contenidoTabla,
            tBody,
            URL_FORM: `${URL}`,
            URL_LISTAR: URL_LT,
            camposDeFormulario: formularioCuentaImpuesto,
            estiloTd,
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "registrorelacionip" },
                { key: "idempresa", value: empresa_id },
            ]
        });
    }
}

const InputCuentas = (vistaPrincipal, contenedorDeAlertas, listaCuentas, estiloTd, URL_LT) => ({elemento, contenidoTabla, registro, tbody, objectT}) => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL = `${URL_APIC}api/`;
    
    const input = crearElemento("select", {class: "form-select" , id: "ci_plandecuentas" });
    elemento.appendChild(input);
    // elemento.setAttribute("style", "max-width: 200px; min-width:200px; width: 100%");

    const nuevaCuenta = (value) => {
        const cuerpo = new FormData();

        if (value.trim() !== ""){
            if(registro.idrelacionip){
                cuerpo.append("ver", "registrorelacionipf5" );
                cuerpo.append("id", registro.idrelacionip );
                cuerpo.append("idplandecuenta", value );
                cuerpo.append("idimpuesto", registro.idimpuesto );
                cuerpo.append("idempresa", empresa_id );
            } else {
                cuerpo.append("ver", "registrorelacionip" );
                cuerpo.append("idempresa", empresa_id );
                cuerpo.append("idplandecuenta", value );
                cuerpo.append("idimpuesto", registro.idimpuesto );
            }
        } else {
            return;
        }

        fetch(`${URL}`, {
            method:"POST",
            body: cuerpo
        })
        .then(res => res.json())
        .then(async res => {
            const listado = await obtenerDatos(URL_LT);
            
            contenidoTBody(listado, {contenido: contenidoTabla, estiloTd}, tbody)
            alertaDeExito(contenedorDeAlertas, "Cuenta vinculada con exito")
        })
        .catch(error => {
            alertaDeError(contenedorDeAlertas, "Ocurrio un error")
        })
    }
    rellenarSelect(input, { datos: listaCuentas, llaves: { id: "id", detalle: ["numero", "plan"] }}, undefined, {accion: nuevaCuenta})

    
}