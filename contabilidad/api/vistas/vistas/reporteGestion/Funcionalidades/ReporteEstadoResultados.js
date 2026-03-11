import { ajustarAlturaTabla } from "../../../funciones/CrearTabla.js";
import { getDivisaNombre } from "../../../funciones/DatosAuxiliares.js";
import { formatoDecimal, formatoFecha } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import {
    contenidoConEncabezadoPdfMake,
    crearContenedorReporte,
    defDocumentoPdfMake,
    estructuraReporteConEncabezado,
    opcionesDescargaDeReporte,
    seccionTablaPdfMake,
    verificarDatosReporte
} from "../../../funciones/VistaPDF.js";

/**
 * Función: Prepara y maneja el reporte de estado de resultados.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de estado de resultados.
 *              Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *              También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 06 de febrero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteEstadoDeResultados(datos) {
    const {
        urlSolicitud,
        datosFormulario,
        vistaReporte,
        contenedorPrincipal,
        nombreReporte
    } = datos;

    // Obtener datos del reporte y verificar si hay error o no hay datos
    const datosReporte = await obtenerDatos(urlSolicitud);
    const estado = verificarDatosReporte(datosReporte);
    if (estado.error) {
        vistaReporte.innerHTML = estado.mensaje;
        return;
    }

    const fechaReporte = `Entre: ${formatoFecha(datosFormulario.fechaini)} y ${formatoFecha(datosFormulario.fechafin)}`;

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `estado_resultado`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteEstadoResultadosPdfMake({ datosReporte, fechaReporte, nombreReporte });
            await defDocumentoPdfMake({contenido: docDefinition, numeroPieDePagina});
        },
        callbackExcel: (conEncabezado) => {
            exportarExcelEstadoResultados({
                datos: datosReporte,
                encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})`, titulo: nombreReporte }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteEstadoResultados({ datosReporte, fechaReporte, nombreReporte });
    const estructura = estructuraReporteConEncabezado();
    cuerpoReporte.innerHTML = estructura;
    const principal = cuerpoReporte.querySelector("main");
    principal.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

// Genera el contenido HTML del reporte de Estado de Resultados
async function reporteEstadoResultados({ datosReporte, fechaReporte, nombreReporte }) {
    const niveles = agregarNivelYObtenerProfundidad(datosReporte);

    // const firmas = await FirmasContabilidad(5);
    const firmas = null;
    const htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";

    const subtitulo = `
        <div><h4>${nombreReporte}</h4></div>
        <span>${fechaReporte}</span>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

    let filasHTML = "";

    const recorrerNiveles = (arrObj) => {
        for (const item of arrObj) {
            const subnivelKey = Object.keys(item).find(k => k.startsWith("nivel_") && Array.isArray(item[k]));

            const negrillaCursiva = `${item.negrilla_cursiva?.includes("negrilla") ? "afr-fwb" : ""} ${item.negrilla_cursiva?.includes("cursiva") ? "afr-fsi" : ""}`;
            // Crear fila con los datos del objeto actual
            let fila = `<tr>
                <td class="${negrillaCursiva}">${item.codigo || ""}</td>
                <td class="${negrillaCursiva}">${(item.nombre_personalizado || item.nombre_cuenta) || "-"}</td>`;

            // Agregar celdas para cada nivel de profundidad
            for (let i = niveles; i >= 1; i--) {
                if (i === item.profundidad) {
                    fila += `<td class="afr-te ${negrillaCursiva}">${item.valor !== undefined ? formatoDecimal(item.valor ?? "0") : formatoDecimal(item[`suma_nivel_${i + 1}`])}</td>`;
                } else if (i + 1 === item.profundidad && item.valor_restado !== undefined) {
                    fila += `<td class="afr-te ${negrillaCursiva}">${formatoDecimal(item.valor_restado ?? "0")}</td>`;
                } else {
                    fila += `<td></td>`;
                }
            }

            fila += `</tr>`;
            filasHTML += fila;

            // Si hay subniveles, recorrerlos recursivamente
            if (subnivelKey && item[subnivelKey].length > 0) {
                recorrerNiveles(item[subnivelKey]);
            }
        }

    };

    // Recorrer el reporte anidado
    recorrerNiveles(datosReporte);

    const thValores = Array.from({ length: niveles }, (_, i) => `<th>Nivel ${i + 1}</th>`).join("");

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table afr-table-sm afr-table-noborder">

            <tbody>
                ${filasHTML}
            </tbody>
        </table>
        ${htmlFirmas}
    `;

    return html;
};

// Genera el contenido para PDFMake del reporte de Estado de Resultados para descarga en PDF
async function reporteEstadoResultadosPdfMake({ datosReporte, fechaReporte, nombreReporte }) {
    const niveles = agregarNivelYObtenerProfundidad(datosReporte);
    const bodyTabla = [];

    // // Encabezado de la tabla
    // const cabecera = [
    //     { text: 'Código', style: 'tableHeader', bold: true },
    //     { text: 'Cuenta', style: 'tableHeader', bold: true }
    // ];
    // for (let i = 1; i <= niveles; i++) {
    //     cabecera.push({ text: `Nivel ${i}`, style: 'tableHeader', bold: true, alignment: 'center' });
    // }
    // bodyTabla.push(cabecera);

    const widths = ['auto', '*', ...Array(niveles).fill('auto')];

    // Recorrido de datos
    const recorrerNiveles = (arrObj) => {
        for (const item of arrObj) {
            const subnivelKey = Object.keys(item).find(k => k.startsWith("nivel_") && Array.isArray(item[k]));

            const isBold = item.negrilla_cursiva?.includes("negrilla");
            const isItalic = item.negrilla_cursiva?.includes("cursiva");
            const style = {};
            if (isBold) style.bold = true;
            if (isItalic) style.italics = true;

            // Crear fila
            const row = [
                { text: item.codigo || "", ...style },
                { text: (item.nombre_personalizado || item.nombre_cuenta) || "-", ...style }
            ];

            // Columnas de niveles
            for (let i = niveles; i >= 1; i--) {
                let valor = "";
                if (i === item.profundidad) {
                    valor = item.valor !== undefined ? formatoDecimal(item.valor ?? "0") : formatoDecimal(item[`suma_nivel_${i + 1}`]);
                } else if (i + 1 === item.profundidad && item.valor_restado !== undefined) {
                    valor = formatoDecimal(item.valor_restado ?? "0");
                }

                row.push({ text: valor, alignment: 'right', ...style });
            }

            bodyTabla.push(row);

            // Recursión para subniveles
            if (subnivelKey && item[subnivelKey].length > 0) {
                recorrerNiveles(item[subnivelKey]);
            }
        }
    };

    recorrerNiveles(datosReporte);

    const contenido = [
        ...contenidoConEncabezadoPdfMake(),
        { text: nombreReporte, style: "textoTitulo" },
        {
            stack: [
                { text: fechaReporte, marginBottom: 1 },
                { text: `(Expresado en ${getDivisaNombre()})` }
            ],
            style: "textoInformacion"
        },
        seccionTablaPdfMake({
            widths: widths,
            body: bodyTabla
        }, { layout: "sinBordes" }),
        // firmasContabilidadPdfMake(5)
    ];

    return contenido;
}

// Función para exportar los datos del reporte de Estado de Resultados a Excel
export function exportarExcelEstadoResultados({ datos, encabezado = {titulo: "Balance General", conEncabezado: false, fechaReporte: "", divisa: ""}} = {}
) {
    const wb = XLSX.utils.book_new();

    // Estilos
    const styleTitulo = { font: { bold: true, sz: 14 } };
    const styleBold = { font: { bold: true } };
    const styleRight = { alignment: { horizontal: "right" } };

    const filas = [];
    const merges = [];
    let filaActual = 0;

    // Encabezado
    const niveles = agregarNivelYObtenerProfundidad(datos);
    const colDebeIndex = 2;

    const cantidadColumnas = niveles + 2;
    if (encabezado.conEncabezado) {
        const rowLM = new Array(cantidadColumnas).fill({ v: "" });
        rowLM[0] = { v: encabezado.titulo, s: styleBold };
        filas.push(rowLM);
        merges.push({ s: { r: filaActual, c: 0 }, e: { r: filaActual, c: colDebeIndex - 1 } });
        filaActual++;

        const rowFecha = new Array(cantidadColumnas).fill({ v: "" });
        rowFecha[0] = { v: encabezado.fechaReporte, s: styleBold };
        filas.push(rowFecha);
        merges.push({ s: { r: filaActual, c: 0 }, e: { r: filaActual, c: colDebeIndex - 1 } });
        filaActual++;

        const rowDivisa = new Array(cantidadColumnas).fill({ v: "" });
        rowDivisa[0] = { v: encabezado.divisa, s: styleBold };
        filas.push(rowDivisa);
        merges.push({ s: { r: filaActual, c: 0 }, e: { r: filaActual, c: colDebeIndex - 1 } });
        filaActual++;

        const rowVacio = new Array(cantidadColumnas).fill({ v: "" });
        filas.push(rowVacio);
        filaActual++;
    }

    filas.push([
        { v: "Código", s: styleBold },
        { v: "Cuenta", s: styleBold },
        ...Array.from({ length: niveles }, (_, i) => ({ v: `Nivel ${i + 1}`, s: styleBold }))
    ]);
    filaActual++;

    // Recorrido de datos
    const recorrer = (arr) => {
        for (const item of arr) {
            const subnivelKey = Object.keys(item).find(k => k.startsWith("nivel_"));

            // estilos por fila
            const estilo = {};
            if (item.negrilla_cursiva?.includes("negrilla")) estilo.font = { bold: true };
            if (item.negrilla_cursiva?.includes("cursiva")) estilo.font = { ...estilo.font, italic: true };

            const fila = [
                { v: item.codigo ?? "", s: estilo },
                { v: item.nombre_personalizado || item.nombre_cuenta, s: estilo }
            ];

            for (let i = niveles; i >= 1; i--) {
                if (i === item.profundidad) {
                    fila.push({
                        v: item.valor !== undefined
                            ? item.valor
                            : item[`suma_nivel_${i + 1}`] ?? 0,
                        t: "n",
                        s: { ...styleRight, ...estilo }
                    });
                } else if (i + 1 === item.profundidad && item.valor_restado !== undefined) {
                    fila.push({
                        v: item.valor_restado,
                        t: "n",
                        s: { ...styleRight, ...estilo }
                    });
                } else {
                    fila.push({ v: "" });
                }
            }

            filas.push(fila);
            filaActual++;

            if (subnivelKey && item[subnivelKey]?.length) {
                recorrer(item[subnivelKey]);
            }
        }
    };

    recorrer(datos);

    // Crear Hoja
    const ws = XLSX.utils.aoa_to_sheet(filas);
    ws["!merges"] = merges;

    // Anchos de columnas
    ws["!cols"] = [
        { wch: 12 },
        { wch: 45 },
        ...Array.from({ length: niveles }, () => ({ wch: 18 }))
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Estado de Resultados");
    XLSX.writeFile(wb, `estado_resultados.xlsx`);
}

/**
 * Función: Agrega la propiedad 'profundidad' a cada objeto en la estructura de datos anidada y devuelve la profundidad máxima.
 * Descripción: Función recursiva que recorre una estructura de datos anidada y agrega la propiedad 'profundidad' a cada objeto, indicando su nivel en la jerarquía.
 *              Además, calcula y devuelve la profundidad máxima encontrada en la estructura.
 * Fecha: 06 de febrero de 2026
 * Autor: Joel Choque
 */
/**
 * Agrega la propiedad 'profundidad' a cada objeto en la estructura de datos anidada y devuelve la profundidad máxima.
 * @param {Array} data - Arreglo de objetos que representan la estructura anidada.
 * @param {number} nivelActual - Nivel actual de profundidad (inicia en 1).
 * @returns {number} Profundidad máxima encontrada en la estructura.
 */
function agregarNivelYObtenerProfundidad(data, nivelActual = 1) {
    let maxNivel = nivelActual;
    for (const item of data) {
        item.profundidad = nivelActual;
        const subnivelKey = Object.keys(item).find(k => k.startsWith("nivel_") && Array.isArray(item[k]));
        if (subnivelKey && item[subnivelKey].length > 0) {
            const profundidadHijos = agregarNivelYObtenerProfundidad(item[subnivelKey], nivelActual + 1);
            maxNivel = Math.max(maxNivel, profundidadHijos);
        }
    }

    return maxNivel;
}