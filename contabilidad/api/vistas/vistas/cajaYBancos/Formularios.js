import { agregarCamposAsientoModelo, agregarCamposTransaccion, alternarTransaccionYAsiento } from "../../funciones/CrearFormulario.js";
import { CT_URLAPI, getEmpresaId, getSucursalId } from "../../funciones/DatosAuxiliares.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";
const EMPRESA_ID = getEmpresaId();
const SUCURSAL_ID = getSucursalId();
const URL = CT_URLAPI;

export function bloquearSufijoEnInput(input) {
    // Al escribir, mantener siempre el sufijo al final
    input.addEventListener("input", (e) => {
        const sufijo = input.getAttribute("data-suffix") || "";
        if (sufijo === "") return;
        // Si el usuario intenta borrar/modificar el sufijo
        if (!input.value.endsWith(sufijo)) {
            input.value = input.value.replace(sufijo, "") + sufijo;
        }
    });

    // Bloquear el borrar o moverse dentro del sufijo
    input.addEventListener("keydown", e => {
        const sufijo = input.getAttribute("data-suffix") || "";
        if (sufijo === "") return;
        const posSufijo = input.value.length - sufijo.length;
        if (input.selectionStart >= input.value.length - sufijo.length && (e.key === "Delete" || e.key === "ArrowRight")) {
            e.preventDefault();
            input.setSelectionRange(posSufijo, posSufijo);
        }
        // Si presiona flecha izquierda dentro del sufijo, mover antes del sufijo
        if (e.key === "ArrowLeft" && input.selectionStart > input.value.length - sufijo.length) {
            e.preventDefault();
            input.setSelectionRange(posSufijo, posSufijo);
        }
        // Si presiona End, mover al final del texto pero antes del sufijo
        if (e.key === "End") {
            e.preventDefault();
            input.setSelectionRange(posSufijo, posSufijo);
        }
    });

    // Cuando hace click, si el cursor cae dentro del sufijo, mover antes del sufijo
    input.addEventListener("click", () => {
        const sufijo = input.getAttribute("data-suffix") || "";
        if (sufijo === "") return;
        if (input.selectionStart > input.value.length - sufijo.length) {
            const pos = input.value.length - sufijo.length;
            input.setSelectionRange(pos, pos);
        }
    });
}

function rellenarCamposDeContrato(prefijoId) {
    return async (valor, contenedorInput) => {
        const form = contenedorInput.parentNode;
        const monto = form.querySelector(`#${prefijoId}-montofactura`);
        const concepto = form.querySelector(`#${prefijoId}-porconceptode`);
        const clienteProveedor = form.querySelector(`#${prefijoId}-cliente`) || form.querySelector(`#${prefijoId}-proveedor`);

        if (valor) {
            const datosContrato = await obtenerDatos(`${URL}listar_datos_contrataciones_cajas/${valor}/1`);
            if (datosContrato && datosContrato.length > 0) {
                const datoMonto = parseFloat(datosContrato[0].precio_restante || 0).toFixed(2);
                monto.value = datoMonto;
                concepto.value = datosContrato[0].concepto || "";
                clienteProveedor.selectize?.setValue(datosContrato[0].id_cliente_proveedor || "");

                // Establece el data-suffix del concepto para evitar que se modifique
                if (!concepto.hasAttribute("data-suffix")) {
                    concepto.setAttribute("data-suffix", concepto.value);
                    bloquearSufijoEnInput(concepto);
                } else {
                    concepto.setAttribute("data-suffix", concepto.value);
                }
            }
        } else {
            monto.value = "";
            concepto.value = "";
            clienteProveedor.selectize?.clear();

            // Quita el data-suffix del concepto para no restringir con el valor anterior
            concepto.setAttribute("data-suffix", "");
        }
    }
}

function rellenarCamposDeFactura(prefijoId, tipo = 1) {
    return async (valor, contenedorInput) => {
        const form = contenedorInput.parentNode;
        const monto = form.querySelector(`#${prefijoId}-monto`);
        const concepto = form.querySelector(`#${prefijoId}-concepto`);

        if (valor) {
            const datosComtrato = await obtenerDatos(`${URL}/listar_datos_facturas_cajas/${valor}/${tipo}`);
            if (datosComtrato && datosComtrato.length > 0) {
                const datoMonto = parseFloat(datosComtrato[0].precio_restante).toFixed(2);
                monto.value = datoMonto || "";
                monto.setAttribute("max", datoMonto);

                concepto.value = datosComtrato[0].concepto || "";

                // Establece el data-suffix del concepto para evitar que se modifique
                if (!concepto.hasAttribute("data-suffix")) {
                    concepto.setAttribute("data-suffix", concepto.value);
                    bloquearSufijoEnInput(concepto);
                } else {
                    concepto.setAttribute("data-suffix", concepto.value);
                }
            }
        } else {
            monto.value = "";
            monto.removeAttribute("max");

            // Quita el data-suffix del concepto para no restringir con el valor anterior
            concepto.setAttribute("data-suffix", "");
        }
    }
}

function rellenarCamposReciboDeContrato(prefijoId, tipo = 1) {
    return async (valor, contenedorInput) => {
        const form = contenedorInput.parentNode;
        const lugar = form.querySelector(`#${prefijoId}-lugar`);
        const persona = form.querySelector(`#${prefijoId}-persona`);
        const ci = form.querySelector(`#${prefijoId}-ci`);
        const monto = form.querySelector(`#${prefijoId}-monto`);
        const clienteProveedor = form.querySelector(`#${prefijoId}-cliente`) || form.querySelector(`#${prefijoId}-proveedor`);
        const concepto = form.querySelector(`#${prefijoId}-concepto`);

        if (valor) {
            const datosComtrato = await obtenerDatos(`${URL}listar_datos_contrataciones_cajas/${valor}/${tipo}`);
            if (datosComtrato && datosComtrato.length > 0) {
                const datoMonto = parseFloat(datosComtrato[0].precio_restante || 0).toFixed(2);
                lugar.value = datosComtrato[0].lugar || "";
                persona.value = datosComtrato[0].persona || "";
                ci.value = datosComtrato[0].ci || "";
                monto.value = datoMonto;
                clienteProveedor.selectize?.setValue(datosComtrato[0].id_cliente_proveedor || "");
                concepto.value = datosComtrato[0].concepto || "";

                // Establece el data-suffix del concepto para evitar que se modifique
                if (!concepto.hasAttribute("data-suffix")) {
                    concepto.setAttribute("data-suffix", concepto.value);
                    bloquearSufijoEnInput(concepto);
                } else {
                    concepto.setAttribute("data-suffix", concepto.value);
                }
            }
        } else {
            lugar.value = "";
            persona.value = "";
            ci.value = "";
            monto.value = "";
            clienteProveedor.selectize?.clear();
            concepto.value = "";

            // Quita el data-suffix del concepto para no restringir con el valor anterior
            concepto.setAttribute("data-suffix", "");
        }
    }
}

// =========================================================
// FORMULARIOS Y FUNCIONES PARA COBRAR CONTRATOS CON FACTURA
// =========================================================

export const formularioCBFxCNuevaFactura = (permisoTransaccion) => {
    let opcionesTransaccion = [];
    if (permisoTransaccion) {
        opcionesTransaccion = [
            {
                id: "tecobrocontratofactura-asiento",
                label: "Generar nueva Transacción",
                forma: "select",
                urlSolicitud: `${URL}listaasientos/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: "nombre"},
                nombre: "asiento",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tecobrocontratofactura"),
            },
            {
                id: "tecobrocontratofactura-transaccion",
                label: "Vincular a Trans. existente",
                forma: "select",
                urlSolicitud: `${URL}listatransacciones/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
                nombre: "trans",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tecobrocontratofactura"),
            },
        ];
    }
    return [
        {
            id: "tecobrocontratofactura-contrato",
            label: "Contrato",
            forma: "select",
            urlSolicitud: `${URL}listar_otras_cuentas_cobrar_select/${EMPRESA_ID}`,
            llavesOpciones: { valor: "idotras_cuentas", detalle: [{ dato: "fecha", tipo: "fecha" }, "nro_otras_cuentas", "nombrep"] },
            nombre: "idotras_cuentas",
            callbackInput: rellenarCamposDeContrato("tecobrocontratofactura"),
            mensajeOpcionPorDefecto: "Sin contrato",
            mensajeVacio: "Sin contrato",
        },
        {
            id: "tecobrocontratofactura-fecha",
            label: "Fecha",
            forma: "input",
            tipo: "date",
            nombre: "fecha",
            requerido: true,
            valor: "fecha",
            editar: false,
        },
        {
            id: "tecobrocontratofactura-numerofactura",
            label: "# Factura",
            forma: "input",
            tipo: "number",
            nombre: "nfactura",
            requerido: true,
        },
        {
            id: "tecobrocontratofactura-montofactura",
            label: "Monto",
            forma: "input",
            tipo: "number",
            nombre: "montofactura",
            intervalo: "0.01",
            valorMinimo: "0.01",
            requerido: true,
        },
        {
            id: "tecobrocontratofactura-cliente",
            label: "Cliente",
            forma: "select",
            urlSolicitud: `${URL}listaclientes/${EMPRESA_ID}`,
            llavesOpciones: { valor: "id", detalle: ["nit", "nsocial"] },
            nombre: "cliente",
            requerido: true,
            llaveRegistro: "idcliente",
        },
        {
            id: "tecobrocontratofactura-porconceptode",
            label: "Por concepto de",
            divInformacion: true,
            forma: "input",
            tipo: "text",
            nombre: "por_concepto_de",
            requerido: true,
        },
        ...opcionesTransaccion,
        {
            id: "tecobrocontratofactura-archivo",
            label: "Adjuntar (archivo)",
            forma: "input",
            tipo: "file",
            nombre: "archivo",
        },
        {
            id: "tecobrocontratofactura-seccionmasregistros",
            textoBoton: "Más datos ...",
            botonConSeccionModal: [
                {
                    id: "tecobrocontratofactura-nautorizacion",
                    label: "# Autorizacion",
                    forma: "input",
                    tipo: "text",
                    nombre: "nautorizacion",
                    valor: "0",
                    valorPorDefecto: "0",
                    requerido: true,
                },
                {
                    id: "tecobrocontratofactura-tasa0",
                    label: "Tasa 0",
                    forma: "input",
                    tipo: "number",
                    nombre: "tasacero",
                    intervalo: "any",
                    valor: "0",
                    valorPorDefecto: "0",
                },
                {
                    id: "tecobrocontratofactura-export",
                    label: "Export",
                    forma: "input",
                    tipo: "number",
                    nombre: "export",
                    intervalo: "any",
                    valor: "0",
                    valorPorDefecto: "0",
                },
                {
                    id: "tecobrocontratofactura-npoliza",
                    label: "# Poliza",
                    forma: "input",
                    tipo: "text",
                    nombre: "npoliza",
                    valor: "0",
                    valorPorDefecto: "0",
                },
                {
                    id: "tecobrocontratofactura-iceiecdhotros",
                    label: "Iceiecdhotros",
                    forma: "input",
                    tipo: "number",
                    nombre: "iceiecdhotros",
                    intervalo: "any",
                    valor: "0",
                    valorPorDefecto: "0",
                },
                {
                    id: "tecobrocontratofactura-descuentobonificacion",
                    label: "Descuento Bonificacion",
                    forma: "input",
                    tipo: "text",
                    nombre: "descuentobonificacion",
                    valor: "0",
                    valorPorDefecto: "0",
                },
            ]
        }
    ];
}

// FACTURAS POR PAGAR

const RellenarCamposContratosFdP = async (valor, contenedorInput) => {
    const form = contenedorInput.parentNode;
    const monto = form.querySelector("#cbfacxpagar_montofactura");
    const proveedor = form.querySelector("#cbfacxpagar_proveedor");
    const concepto = form.querySelector("#cbfacxpagar_porconceptode");

    if (valor) {
        const datosComtrato = await obtenerDatos(`${URL}listar_datos_contrataciones_cajas/${valor}/1`);
        if (datosComtrato && datosComtrato.length > 0) {
            const datoMonto = parseFloat(datosComtrato[0].precio_restante || 0).toFixed(2);
            monto.value = datoMonto;
            proveedor.selectize?.setValue(datosComtrato[0].id_cliente_proveedor || "");
            concepto.value = datosComtrato[0].concepto || "";
            // if (datoMonto) {
            //     monto.setAttribute("max", datoMonto);
            // } else {
            //     monto.setAttribute("max", 0);
            // }

            // Establece el data-suffix del concepto para evitar que se modifique
            if (!concepto.hasAttribute("data-suffix")) {
                concepto.setAttribute("data-suffix", concepto.value);
                bloquearSufijoEnInput(concepto);
            } else {
                concepto.setAttribute("data-suffix", concepto.value);
            }
        }
    } else {
        monto.value = "";
        // monto.removeAttribute("max");
        proveedor.selectize?.clear();
        concepto.value = "";

        // Quita el data-suffix del concepto para no restringir con el valor anterior
        concepto.setAttribute("data-suffix", "");
    }
}


// =========================================================
// FORMULARIOS Y FUNCIONES PARA PAGAR CONTRATOS CON FACTURA
// =========================================================

export const formularioCBFxPNuevaFactura = (permisoTransaccion) => {
    let opcionesTransaccion = [];
    if (permisoTransaccion) {
        opcionesTransaccion = [
            {
                id: "tepagocontratofactura-asiento",
                label: "Generar nueva Transacción",
                forma: "select",
                urlSolicitud: `${URL}listaasientos/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: "nombre"},
                nombre: "asiento",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tepagocontratofactura"),
            },
            {
                id: "tepagocontratofactura-transaccion",
                label: "Vincular a Trans. existente",
                forma: "select",
                urlSolicitud: `${URL}listatransacciones/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
                nombre: "trans",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tepagocontratofactura"),
            },
        ];
    }

    return [
        {
            id: "tepagocontratofactura-contrato",
            label: "Contrato",
            forma: "select",
            urlSolicitud: `${URL}listar_otras_cuentas_pagar_select/${EMPRESA_ID}`,
            llavesOpciones: { valor: "idotras_cuentas", detalle: [{ dato: "fecha", tipo: "fecha" } , "nro_otras_cuentas", "nombrep"] },
            nombre: "idotras_cuentas",
            callbackInput: rellenarCamposDeContrato("tepagocontratofactura"),
            mensajeOpcionPorDefecto: "Sin contrato",
            mensajeVacio: "Sin contrato",
        },
        {
            id: "tepagocontratofactura-fecha",
            label: "Fecha",
            forma: "input",
            tipo: "date",
            nombre: "fecha",
            requerido: true,
            valor: "fecha",
            editar: false,
        },
        {
            id: "tepagocontratofactura-numerofactura",
            label: "# Factura",
            forma: "input",
            tipo: "number",
            nombre: "nfactura",
            requerido: true,
        },
        {
            id: "tepagocontratofactura-montofactura",
            label: "Monto",
            forma: "input",
            tipo: "number",
            nombre: "montofactura",
            intervalo: "0.01",
            valorMinimo: "0.01",
            requerido: true,
        },
        {
            id: "tepagocontratofactura-proveedor",
            label: "Proveedor",
            forma: "select",
            urlSolicitud: `${URL}listaproveedores/${EMPRESA_ID}`,
            llavesOpciones: { valor: "id", detalle: ["nit", "nombre"] },
            nombre: "cliente",
            requerido: true,
            llaveRegistro: "idproveedor",
        },
        {
            id: "tepagocontratofactura-porconceptode",
            label: "Por concepto de",
            forma: "input",
            tipo: "text",
            nombre: "por_concepto_de",
            requerido: true,
        },
        ...opcionesTransaccion,
        {
            id: "tepagocontratofactura-archivo",
            label: "Adjuntar (archivo)",
            forma: "input",
            tipo: "file",
            nombre: "archivo",
        },
        {
            id: "tepagocontratofactura-seccionmasregistros",
            textoBoton: "Más datos ...",
            botonConSeccionModal: [
                {
                    id: "tepagocontratofactura-nautorizacion",
                    label: "# Autorizacion",
                    forma: "input",
                    tipo: "text",
                    nombre: "nautorizacion",
                    valor: "0",
                    valorPorDefecto: "0",
                    requerido: true,
                },
                {
                    id: "tepagocontratofactura-tasa0",
                    label: "Tasa 0",
                    forma: "input",
                    tipo: "number",
                    nombre: "tasacero",
                    intervalo: "any",
                    valor: "0",
                    valorPorDefecto: "0",
                },
                {
                    id: "tepagocontratofactura-export",
                    label: "Export",
                    forma: "input",
                    tipo: "number",
                    nombre: "export",
                    intervalo: "any",
                    valor: "0",
                    valorPorDefecto: "0",
                },
                {
                    id: "tepagocontratofactura-npoliza",
                    label: "# Poliza",
                    forma: "input",
                    tipo: "text",
                    nombre: "npoliza",
                    valor: "0",
                    valorPorDefecto: "0",
                },
                {
                    id: "tepagocontratofactura-iceiecdhotros",
                    label: "Iceiecdhotros",
                    forma: "input",
                    tipo: "number",
                    nombre: "iceiecdhotros",
                    intervalo: "any",
                    valor: "0",
                    valorPorDefecto: "0",
                    llaveRegistro: "ice",
                },
                {
                    id: "tepagocontratofactura-descuentobonificacion",
                    label: "Descuento Bonificacion",
                    forma: "input",
                    tipo: "text",
                    nombre: "descuentobonificacion",
                    valor: "0",
                    valorPorDefecto: "0",
                },
            ],
        }
    ];
}

// =========================================================
// FORMULARIOS Y FUNCIONES PARA COBRAR FACTURA
// =========================================================

export const formularioCBFxCConFactura = (permisoTransaccion) => {
    let opcionesTransaccion = [];
    if (permisoTransaccion) {
        opcionesTransaccion = [
            {
                id: "tecobrofactura-asiento",
                label: "Generar nueva Transacción",
                forma: "select",
                urlSolicitud: `${URL}listaasientos/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: "nombre"},
                nombre: "asiento",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tecobrofactura"),
            },
            {
                id: "tecobrofactura-transaccion",
                label: "Vincular a Trans. existente",
                forma: "select",
                urlSolicitud: `${URL}listatransacciones/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
                nombre: "trans",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tecobrofactura"),
            },
        ];
    }
    return [
        {
            id: "tecobrofactura-factura",
            label: "Facturas",
            forma: "select",
            urlSolicitud: `${URL}lista_cobrar_cobrado_factura_select/${SUCURSAL_ID}`,
            llavesOpciones: { valor: "id", detalle: [{ dato: "fecha", tipo: "fecha" }, "numero", "nombrep"] },
            nombre: "idfactura",
            callbackInput: rellenarCamposDeFactura("tecobrofactura", 1),
            requerido: true,
        },
        {
            id: "tecobrofactura-lugar",
            label: "Lugar",
            forma: "input",
            tipo: "text",
            nombre: "lugar",
            requerido: true,
        },
        {
            id: "tecobrofactura-fecha",
            label: "Fecha",
            forma: "input",
            tipo: "date",
            nombre: "fecha",
            valor: "fecha",
            requerido: true
        },
        {
            id: "tecobrofactura-persona",
            label: "Persona",
            forma: "input",
            tipo: "text",
            nombre: "persona",
            requerido: true
        },
        {
            id: "tecobrofactura-ci",
            label: "CI",
            forma: "input",
            tipo: "text",
            nombre: "ci",
            requerido: true,
        },
        {
            id: "tecobrofactura-concepto",
            label: "Concepto",
            forma: "input",
            tipo: "text",
            nombre: "concepto",
            requerido: true
        },
        {
            id: "tecobrofactura-monto",
            label: "Monto",
            forma: "input",
            tipo: "number",
            nombre: "monto",
            intervalo: "0.01",
            valorMinimo: "0.01",
            requerido: true
        },
        ...opcionesTransaccion,
        {
            id: "tecobrofactura-archivo",
            label: "Adjuntar (archivo)",
            forma: "input",
            tipo: "file",
            nombre: "archivo",
        },
    ];
}

// =========================================================
// FORMULARIOS Y FUNCIONES PARA PAGAR FACTURA
// =========================================================

export const formularioCBFxPConFactura = (permisoTransaccion) => {
    let opcionesTransaccion = [];
    if (permisoTransaccion) {
        opcionesTransaccion = [
            {
                id: "tepagofactura-asiento",
                label: "Generar nueva Transacción",
                forma: "select",
                urlSolicitud: `${URL}listaasientos/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: "nombre"},
                nombre: "asiento",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tepagofactura"),
            },
            {
                id: "tepagofactura-transaccion",
                label: "Vincular a Trans. existente",
                forma: "select",
                urlSolicitud: `${URL}listatransacciones/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
                nombre: "trans",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tepagofactura"),
            },
        ];
    }

    return [
        {
            id: "tepagofactura-factura",
            label: "Facturas",
            forma: "select",
            urlSolicitud: `${URL}lista_pagar_pagado_factura_select/${SUCURSAL_ID}`,
            llavesOpciones: { valor: "id", detalle: [{ dato: "fecha", tipo: "fecha" }, "numero", "nombrep"] },
            nombre: "idfactura",
            callbackInput: rellenarCamposDeFactura("tepagofactura", 2),
            requerido: true,
        },
        {
            id: "tepagofactura-lugar",
            label: "Lugar",
            forma: "input",
            tipo: "text",
            nombre: "lugar",
            requerido: true,
        },
        {
            id: "tepagofactura-fecha",
            label: "Fecha",
            forma: "input",
            tipo: "date",
            nombre: "fecha",
            valor: "fecha",
            requerido: true
        },
        {
            id: "tepagofactura-persona",
            label: "Persona",
            forma: "input",
            tipo: "text",
            nombre: "persona",
            requerido: true
        },
        {
            id: "tepagofactura-ci",
            label: "CI",
            forma: "input",
            tipo: "text",
            nombre: "ci",
            requerido: true,
        },
        {
            id: "tepagofactura-concepto",
            label: "Concepto",
            forma: "input",
            tipo: "text",
            nombre: "concepto",
            requerido: true
        },
        {
            id: "tepagofactura-monto",
            label: "Monto",
            forma: "input",
            tipo: "number",
            nombre: "monto",
            intervalo: "0.01",
            valorMinimo: "0.01",
            requerido: true
        },
        ...opcionesTransaccion,
        {
            id: "tepagofactura-archivo",
            label: "Adjuntar (archivo)",
            forma: "input",
            tipo: "file",
            nombre: "archivo",
        },
    ];
}


// OTROS COBROS
export const AccionSelectDdC = async (valor, contenedorInput) => {
    const form = contenedorInput.parentNode;
    let transaccion = contenedorInput.querySelector("#cbdoccobro_transaccion");
    const hiddenAT = form.querySelector("#cbdoccobro_asiento_transaccion");
    if (transaccion) {
        const asiento = form.querySelector("#cbdoccobro_asiento");
        const sAsiento = asiento.selectize;
        agregarCamposTransaccion("cbdoccobro")(valor, contenedorInput);
        if (valor) {
            sAsiento ? sAsiento.disable() : asiento.disabled = true;
            hiddenAT.value = "";
            hiddenAT.setAttribute("name", "asiento");
        } else {
            sAsiento ? sAsiento.enable() : asiento.disabled = false;
            hiddenAT.value = "";
            hiddenAT.removeAttribute("name");
        }
    } else {
        transaccion = form.querySelector("#cbdoccobro_transaccion");
        const sTransaccion = transaccion.selectize;
        agregarCamposAsientoModelo("cbdoccobro")(valor, contenedorInput);
        if (valor) {
            sTransaccion ? sTransaccion.disable() : transaccion.disabled = true;
            hiddenAT.value = "";
            hiddenAT.setAttribute("name", "trans");
        } else {
            sTransaccion ? sTransaccion.enable() : transaccion.disabled = false;
            hiddenAT.value = "";
            hiddenAT.removeAttribute("name");
        }
    }
}



export const formularioCBDocumentoDeCobro = (permisoTransaccion) => {
    let opcionesTransaccion = [];
    if (permisoTransaccion) {
        opcionesTransaccion = [
            {
                id: "tecobrorecibo-asiento",
                label: "Generar nueva Transacción",
                forma: "select",
                urlSolicitud: `${URL}listaasientos/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: "nombre"},
                nombre: "asiento",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tecobrorecibo"),
            },
            {
                id: "tecobrorecibo-transaccion",
                label: "Vincular a Trans. existente",
                forma: "select",
                urlSolicitud: `${URL}listatransacciones/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
                nombre: "trans",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tecobrorecibo"),
            },
        ];
    }

    return [
        {
            id: "tecobrorecibo-contrato",
            label: "Contrato",
            forma: "select",
            urlSolicitud: `${URL}listar_otras_cuentas_cobrar_select/${EMPRESA_ID}`,
            llavesOpciones: { valor: "idotras_cuentas", detalle: [{ dato: "fecha", tipo: "fecha" }, "nro_otras_cuentas", "nombrep"] },
            nombre: "idotras_cuentas",
            callbackInput: rellenarCamposReciboDeContrato("tecobrorecibo", 1),
            mensajeOpcionPorDefecto: "Sin contrato",
            mensajeVacio: "Sin contrato",
        },
        {
            id: "tecobrorecibo-lugar",
            label: "Lugar",
            forma: "input",
            tipo: "text",
            nombre: "lugar",
            requerido: true,
        },
        {
            id: "tecobrorecibo-fecha",
            label: "Fecha",
            forma: "input",
            tipo: "date",
            nombre: "fecha",
            valor: "fecha",
            requerido: true
        },
        {
            id: "tecobrorecibo-persona",
            label: "Cobrado por",
            forma: "input",
            tipo: "text",
            nombre: "persona",
            requerido: true
        },
        {
            id: "tecobrorecibo-ci",
            label: "CI",
            forma: "input",
            tipo: "text",
            nombre: "ci",
            requerido: true,
        },
        {
            id: "tecobrorecibo-monto",
            label: "Monto",
            forma: "input",
            tipo: "number",
            nombre: "monto",
            intervalo: "0.01",
            valorMinimo: "0.01",
            requerido: true
        },
        {
            id: "tecobrorecibo-nrodoc",
            label: "Nro. doc.",
            forma: "input",
            tipo: "number",
            nombre: "nro_recibo",
            requerido: true
        },
        {
            id: "tecobrorecibo-concepto",
            label: "Concepto",
            forma: "input",
            tipo: "text",
            nombre: "concepto",
            requerido: true
        },
        {
            id: "tecobrorecibo-cliente",
            label: "Cliente",
            forma: "select",
            urlSolicitud: `${URL}listaclientes/${EMPRESA_ID}`,
            llavesOpciones: { valor: "id", detalle: ["nit", "nsocial"] },
            nombre: "cliente_proveedor",
            requerido: true,
        },
        ...opcionesTransaccion,
        {
            id: "tecobrorecibo-archivo",
            label: "Adjuntar (archivo)",
            forma: "input",
            tipo: "file",
            nombre: "archivo",
        },
    ];
}

// OTROS PAGOS
export const AccionSelectDdP = async (valor, contenedorInput) => {
    const form = contenedorInput.parentNode;
    let transaccion = contenedorInput.querySelector("#cbdocpago_transaccion");
    const hiddenAT = form.querySelector("#cbdocpago_asiento_transaccion");
    if (transaccion) {
        const asiento = form.querySelector("#cbdocpago_asiento");
        const sAsiento = asiento.selectize;
        agregarCamposTransaccion("cbdocpago")(valor, contenedorInput);
        if (valor) {
            sAsiento ? sAsiento.disable() : asiento.disabled = true;
            hiddenAT.value = "";
            hiddenAT.setAttribute("name", "asiento");
        } else {
            sAsiento ? sAsiento.enable() : asiento.disabled = false;
            hiddenAT.value = "";
            hiddenAT.removeAttribute("name");
        }
    } else {
        transaccion = form.querySelector("#cbdocpago_transaccion");
        const sTransaccion = transaccion.selectize;
        agregarCamposAsientoModelo("cbdocpago")(valor, contenedorInput);
        if (valor) {
            // sTransaccion.setValue("0");
            sTransaccion ? sTransaccion.disable() : transaccion.disabled = true;
            hiddenAT.value = "";
            hiddenAT.setAttribute("name", "trans");
        } else {
            sTransaccion ? sTransaccion.enable() : transaccion.disabled = false;
            hiddenAT.value = "";
            hiddenAT.removeAttribute("name");
        }
    }
}

const RellenarCamposDdP = async (valor, contenedorInput) => {
    const form = contenedorInput.parentNode;
    const lugar = form.querySelector("#cbdocpago_lugar");
    const persona = form.querySelector("#cbdocpago_persona");
    const ci = form.querySelector("#cbdocpago_ci");
    const monto = form.querySelector("#cbdocpago_monto");
    const proveedor = form.querySelector("#cbdocpago_proveedor");
    const concepto = form.querySelector("#cbdocpago_concepto");

    if (valor) {
        const datosComtrato = await obtenerDatos(`${URL}listar_datos_contrataciones_cajas/${valor}/2`);
        if (datosComtrato && datosComtrato.length > 0) {
            const datoMonto = parseFloat(datosComtrato[0].precio_restante || 0).toFixed(2);
            lugar.value = datosComtrato[0].lugar || "";
            persona.value = datosComtrato[0].persona || "";
            ci.value = datosComtrato[0].ci || "";
            monto.value = datoMonto;
            proveedor.selectize?.setValue(datosComtrato[0].id_cliente_proveedor || "");
            concepto.value = datosComtrato[0].concepto || "";
            // if (datoMonto) {
            //     monto.setAttribute("max", datoMonto);
            // } else {
            //     monto.setAttribute("max", 0);
            // }

            // Establece el data-suffix del concepto para evitar que se modifique
            if (!concepto.hasAttribute("data-suffix")) {
                concepto.setAttribute("data-suffix", concepto.value);
                bloquearSufijoEnInput(concepto);
            } else {
                concepto.setAttribute("data-suffix", concepto.value);
            }
        }
    } else {
        lugar.value = "";
        persona.value = "";
        ci.value = "";
        monto.value = "";
        // monto.removeAttribute("max");
        proveedor.selectize?.clear();
        concepto.value = "";

        // Quita el data-suffix del concepto para no restringir con el valor anterior
        concepto.setAttribute("data-suffix", "");
    }
}

export const formularioCBDocumentoDePago = (permisoTransaccion) => {
    let opcionesTransaccion = [];
    if (permisoTransaccion) {
        opcionesTransaccion = [
            {
                id: "tepagorecibo-asiento",
                label: "Generar nueva Transacción",
                forma: "select",
                urlSolicitud: `${URL}listaasientos/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: "nombre"},
                nombre: "asiento",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tepagorecibo"),
            },
            {
                id: "tepagorecibo-transaccion",
                label: "Vincular a Trans. existente",
                forma: "select",
                urlSolicitud: `${URL}listatransacciones/${EMPRESA_ID}`,
                llavesOpciones: { valor: "id", detalle: ["ntransaccion", "glosa"] },
                nombre: "trans",
                editar: false,
                callbackInput: alternarTransaccionYAsiento("tepagorecibo"),
            },
        ];
    }

    return [
        {
            id: "tepagorecibo-contrato",
            label: "Contrato",
            forma: "select",
            urlSolicitud: `${URL}listar_otras_cuentas_pagar_select/${EMPRESA_ID}`,
            llavesOpciones: { valor: "idotras_cuentas", detalle: ["fecha", "nro_otras_cuentas", "nombrep"] },
            nombre: "idotras_cuentas",
            callbackInput: rellenarCamposReciboDeContrato("tepagorecibo", 2),
            mensajeOpcionPorDefecto: "Sin contrato",
            mensajeVacio: "Sin contrato",
        },
        {
            id: "tepagorecibo-lugar",
            label: "Lugar",
            forma: "input",
            tipo: "text",
            nombre: "lugar",
            requerido: true,
        },
        {
            id: "tepagorecibo-fecha",
            label: "Fecha",
            forma: "input",
            tipo: "date",
            nombre: "fecha",
            valor: "fecha",
            requerido: true
        },
        {
            id: "tepagorecibo-persona",
            label: "Pagado por",
            forma: "input",
            tipo: "text",
            nombre: "persona",
            requerido: true
        },
        {
            id: "tepagorecibo-ci",
            label: "CI",
            forma: "input",
            tipo: "text",
            nombre: "ci",
            requerido: true,
        },
        {
            id: "tepagorecibo-monto",
            label: "Monto",
            forma: "input",
            tipo: "number",
            nombre: "monto",
            intervalo: "0.01",
            valorMinimo: "0.01",
            requerido: true
        },
        {
            id: "tepagorecibo-nrodoc",
            label: "Nro. doc.",
            forma: "input",
            tipo: "number",
            nombre: "nro_recibo",
            requerido: true
        },
        {
            id: "tepagorecibo-concepto",
            label: "Concepto",
            forma: "input",
            tipo: "text",
            nombre: "concepto",
            requerido: true
        },
        {
            id: "tepagorecibo-proveedor",
            label: "Proveedor",
            forma: "select",
            urlSolicitud: `${URL}listaproveedores/${EMPRESA_ID}`,
            llavesOpciones: { valor: "id", detalle: ["nit", "nombre"] },
            nombre: "cliente_proveedor",
            requerido: true,
        },
        ...opcionesTransaccion,
        {
            id: "tepagorecibo-archivo",
            label: "Adjuntar (archivo)",
            forma: "input",
            tipo: "file",
            nombre: "archivo",
        },
    ];
}
// EDITAR FACTURAS
export const formularioCBFxCEditarFactura = (registro, eliminarImagen) => [
    {
        id: "cbeditarfacxcobrar-contrato",
        label: "Contrato",
        forma: "select",
        urlSolicitud: `${URL}listar_otras_cuentas_cobrar_select/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idotras_cuentas", detalle: [{ dato: "fecha", tipo: "fecha" }, "nro_otras_cuentas", "nombrep"] },
        nombre: "idotras_cuentas",
        mensajeOpcionPorDefecto: "Sin contrato",
        mensajeVacio: "Sin contrato",
    },
    {
        id: "cbeditarfacxcobrar-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true,
    },
    {
        id: "cbeditarfacxcobrar-nfactura",
        label: "N° Factura",
        forma: "input",
        tipo: "text",
        nombre: "nfactura",
        llaveRegistro: "nro_documento",
        requerido: true,
    },
    {
        id: "cbeditarfacxcobrar-monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        valorMinimo: "0.01",
        requerido: true,
    },
    {
        id: "cbeditarfacxcobrar-porconceptode",
        label: "Por concepto de",
        forma: "input",
        tipo: "text",
        nombre: "por_concepto_de",
        llaveRegistro: "descripcion",
        requerido: true,
    },
    {
        id: "cbeditarfacxcobrar-cliente",
        label: "Cliente",
        forma: "select",
        urlSolicitud: `${URL}listaclientes/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nsocial"] },
        nombre: "cliente_prov",
        llaveRegistro: "id_cliente",
        requerido: true,
    },
    {
        id: "cbeditarfacxcobrar-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
        opcionesInput: { callback: eliminarImagen },
    },
]

export const formularioCBFxPEditarFactura = (registro, eliminarImagen) => [
    {
        id: "cbeditarfacxpagar-contrato",
        label: "Contrato",
        forma: "select",
        urlSolicitud: `${URL}listar_otras_cuentas_pagar_select/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idotras_cuentas", detalle: [{ dato: "fecha", tipo: "fecha" } , "nro_otras_cuentas", "nombrep"] },
        nombre: "idotras_cuentas",
        mensajeOpcionPorDefecto: "Sin contrato",
        mensajeVacio: "Sin contrato",
    },
    {
        id: "cbeditarfacxpagar-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true,
    },
    {
        id: "cbeditarfacxpagar-nfactura",
        label: "N° Factura",
        forma: "input",
        tipo: "text",
        nombre: "nfactura",
        llaveRegistro: "nro_documento",
        requerido: true,
    },
    {
        id: "cbeditarfacxpagar-monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        valorMinimo: "0.01",
        requerido: true,
    },
    {
        id: "cbeditarfacxpagar-porconceptode",
        label: "Por concepto de",
        forma: "input",
        tipo: "text",
        nombre: "por_concepto_de",
        llaveRegistro: "descripcion",
        requerido: true,
    },
    {
        id: "cbeditarfacxpagar-proveedor",
        label: "Proveedor",
        forma: "select",
        urlSolicitud: `${URL}listaproveedores/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nombre"] },
        nombre: "cliente_prov",
        llaveRegistro: "id_cliente",
        requerido: true,
    },
    {
        id: "cbeditarfacxpagar-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
        opcionesInput: { callback: eliminarImagen },
    },
]

export const formularioCBFxCEditarConFactura = (registro, eliminarImagen) => [
    {
        id: "cbeditarconfacxcobrar-lugar",
        label: "Lugar",
        forma: "input",
        tipo: "text",
        nombre: "lugar",
        requerido: true,
    },
    {
        id: "cbeditarconfacxcobrar-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true
    },
    {
        id: "cbeditarconfacxcobrar-monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        valorMinimo: "0.01",
        requerido: true,
    },
    {
        id: "cbeditarconfacxcobrar-persona",
        label: "Persona",
        forma: "input",
        tipo: "text",
        nombre: "persona",
        requerido: true
    },
    {
        id: "cbeditarconfacxcobrar-ci",
        label: "CI",
        forma: "input",
        tipo: "text",
        nombre: "ci",
        requerido: true,
    },
    {
        id: "cbeditarconfacxcobrar-concepto",
        label: "Concepto",
        forma: "input",
        tipo: "text",
        nombre: "concepto",
        llaveRegistro: "descripcion",
        requerido: true,
    },
    {
        id: "cbeditarconfacxcobrar-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
        opcionesInput: { callback: eliminarImagen },
    }
]

export const formularioCBFxPEditarConFactura = (registro, eliminarImagen) => [
    {
        id: "cbeditarconfacxpagar-lugar",
        label: "Lugar",
        forma: "input",
        tipo: "text",
        nombre: "lugar",
        requerido: true,
    },
    {
        id: "cbeditarconfacxpagar-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true
    },
    {
        id: "cbeditarconfacxpagar-monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        valorMinimo: "0.01",
        requerido: true,
    },
    {
        id: "cbeditarconfacxpagar-persona",
        label: "Persona",
        forma: "input",
        tipo: "text",
        nombre: "persona",
        requerido: true
    },
    {
        id: "cbeditarconfacxpagar-ci",
        label: "CI",
        forma: "input",
        tipo: "text",
        nombre: "ci",
        requerido: true,
    },
    {
        id: "cbeditarconfacxpagar-concepto",
        label: "Concepto",
        forma: "input",
        tipo: "text",
        nombre: "concepto",
        llaveRegistro: "descripcion",
        requerido: true,
    },
    {
        id: "cbeditarconfacxpagar-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
        opcionesInput: { callback: eliminarImagen },
    }
]

// EDITAR OTROS COBROS
export const formularioCBDdCEditar = (registro, eliminarImagen) => [
    {
        id: "cbeditarddc-contrato",
        label: "Contrato",
        forma: "select",
        urlSolicitud: `${URL}listar_otras_cuentas_cobrar_select/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idotras_cuentas", detalle: [{ dato: "fecha", tipo: "fecha" }, "nro_otras_cuentas", "nombrep"] },
        nombre: "idotras_cuentas",
        mensajeOpcionPorDefecto: "Sin contrato",
        mensajeVacio: "Sin contrato",
    },
    {
        id: "cbeditarddc-lugar",
        label: "Lugar",
        forma: "input",
        tipo: "text",
        nombre: "lugar",
        requerido: true,
    },
    {
        id: "cbeditarddc-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true
    },
    {
        id: "cbeditarddc-nrorecibo",
        label: "N° Recibo",
        forma: "input",
        tipo: "number",
        nombre: "nro_recibo",
        llaveRegistro: "nro_documento",
        requerido: true
    },
    {
        id: "cbeditarddc-persona",
        label: "Persona",
        forma: "input",
        tipo: "text",
        nombre: "persona",
        requerido: true
    },
    {
        id: "cbeditarddc-ci",
        label: "CI",
        forma: "input",
        tipo: "text",
        nombre: "ci",
        requerido: true,
    },
    {
        id: "cbeditarddc-concepto",
        label: "Concepto",
        forma: "input",
        tipo: "text",
        nombre: "por_concepto_de",
        llaveRegistro: "descripcion",
        requerido: true,
    },
    {
        id: "cbeditarddc-cliente",
        label: "Cliente",
        forma: "select",
        urlSolicitud: `${URL}listaclientes/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nsocial"] },
        nombre: "cliente_proveedor",
        llaveRegistro: "id_cliente",
        requerido: true,
    },
    {
        id: "cbeditarddc-monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        requerido: true,
    },
    {
        id: "cbeditarddc-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
        opcionesInput: { callback: eliminarImagen },
    },
];

export const formularioCBDdPEditar = (registro, eliminarImagen) => [
    {
        id: "cbeditarddp-contrato",
        label: "Contrato",
        forma: "select",
        urlSolicitud: `${URL}listar_otras_cuentas_pagar_select/${EMPRESA_ID}`,
        llavesOpciones: { valor: "idotras_cuentas", detalle: ["fecha", "nro_otras_cuentas", "nombrep"] },
        nombre: "idotras_cuentas",
        mensajeOpcionPorDefecto: "Sin contrato",
        mensajeVacio: "Sin contrato",
    },
    {
        id: "cbeditarddp-lugar",
        label: "Lugar",
        forma: "input",
        tipo: "text",
        nombre: "lugar",
        requerido: true,
    },
    {
        id: "cbeditarddp-fecha",
        label: "Fecha",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true
    },
    {
        id: "cbeditarddp-nrorecibo",
        label: "N° Recibo",
        forma: "input",
        tipo: "number",
        nombre: "nro_recibo",
        llaveRegistro: "nro_documento",
        requerido: true
    },
    {
        id: "cbeditarddp-persona",
        label: "Persona",
        forma: "input",
        tipo: "text",
        nombre: "persona",
        requerido: true
    },
    {
        id: "cbeditarddp-ci",
        label: "CI",
        forma: "input",
        tipo: "text",
        nombre: "ci",
        requerido: true,
    },
    {
        id: "cbeditarddp-concepto",
        label: "Concepto",
        forma: "input",
        tipo: "text",
        nombre: "por_concepto_de",
        llaveRegistro: "descripcion",
        requerido: true,
    },
    {
        id: "cbeditarddp-proveedor",
        label: "Proveedor",
        forma: "select",
        urlSolicitud: `${URL}listaproveedores/${EMPRESA_ID}`,
        llavesOpciones: { valor: "id", detalle: ["nit", "nombre"] },
        nombre: "cliente_proveedor",
        llaveRegistro: "id_cliente",
        requerido: true,
    },
    {
        id: "cbeditarddp-monto",
        label: "Monto",
        forma: "input",
        tipo: "number",
        nombre: "monto",
        intervalo: "0.01",
        valorMinimo: "0.01",
        requerido: true,
    },
    {
        id: "cbeditarddp-archivo",
        label: "Archivo",
        forma: "input",
        tipo: "file",
        nombre: "archivo",
        divInformacion: true,
        opcionesInput: { callback: eliminarImagen },
    },
];