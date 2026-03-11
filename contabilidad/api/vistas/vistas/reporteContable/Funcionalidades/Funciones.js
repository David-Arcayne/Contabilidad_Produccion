import { crearElemento } from "../../../funciones/Funciones.js";

export function OpcionesReporteContable(formOpciones, vistaPrincipal) {
    // Definimos las opciones disponibles
    const opciones = [
        {
            nombre: "Generales",
            form: formOpciones.periodico,
            id: "__periodico",
        },
        {
            nombre: "Comprobante",
            form: formOpciones.comprobante,
            id: "__comprobante",
        },
        {
            nombre: "Libro Mayor",
            form: formOpciones.libroMayor,
            id: "__libroMayor",
        },
        {
            nombre: "Buscar",
            form: formOpciones.busqueda,
            id: "__busqueda",
        }
        // agregar más opciones aquí
    ];

    const div = crearElemento("div", { class: "text-start" });

    const botones = [];

    opciones.forEach((opcion, index) => {
        const btn = crearElemento("button", {
            class: index === 0 ? "btn btn-dark btn-sm mb-1" : "btn btn-outline-dark btn-sm mb-1",
            style: "min-width: 100px",
            "data-id": opcion.id
        }, [opcion.nombre]);

        btn.addEventListener("click", () => {
            // Cambiar estilos a todos los botones
            botones.forEach((b, i) => {
                b.setAttribute("class", "btn " + (i === index ? "btn-dark" : "btn-outline-dark") + " btn-sm mb-1");
            });

            // Mostrar la info y ocultar PDF
            vistaPrincipal.replaceChildren(crearElemento("p", { class: "text-center fs-5 mt-4" }, ["Contenido."]));

            // Cambiar el formulario visible
            Object.values(formOpciones).forEach(f => f.classList.add("d-none"));
            opcion.form.classList.remove("d-none");
        });

        botones.push(btn);
        div.appendChild(btn);
        div.appendChild(document.createTextNode(" "));
    });

    return div;
}

/**
 * Función: Obtiene el texto de estado de una transacción contable.
 * Descripción: Esta función toma el código de estado de una transacción contable y devuelve
 *              una cadena legible que describe el estado de la transacción. También puede
 *              verificar si los totales de debe y haber son iguales si se proporciona el detalle.
 * Fecha: 28 de enero de 2026
 * Autor: Joel Choque
 */
/**
 * Obtiene el texto de estado de una transacción contable.
 * @param {string | number} estado - Código de estado de la transacción.
 * @param {number} [debe] - Monto total del debe.
 * @param {number} [haber] - Monto total del haber.
 * @param {Array} [detalle] - Arreglo para calcular obtener los totales de debe y haber (no se toma en cuenta si se proporcionan los montos totales).
 * @returns
 */
export function obtenerEstadoTransaccion(estado, debe = null, haber = null, detalle = []) {
    let esIgual = false;
    if (detalle.length > 0) {
        let debe = 0;
        let haber = 0;
        detalle.forEach(d => {
            debe += Math.round(parseFloat(d.debe || 0) * 100);
            haber += Math.round(parseFloat(d.haber || 0) * 100);
        });
        if (debe === haber && debe !== 0) esIgual = true;
    }

    switch (estado) {
        case "1":
            if (esIgual || (debe === haber && debe !== 0)) {
                return "Válido";
            } else {
                return "Inválido";
            }
        case "2":
            return "Pendiente Anulación";
        case "3":
            return "Pendiente Eliminación";
        case "4":
            return "Anulado";
        case "5":
            return "Pendiente Activación";
        case "7":
            return "Pendiente Desconsolidación";
        default:
            return "";
    }
}