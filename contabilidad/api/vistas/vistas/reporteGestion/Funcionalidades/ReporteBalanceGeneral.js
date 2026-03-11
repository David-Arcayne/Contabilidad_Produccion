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


async function obtenerDatosEditado(urlSolicitud) {
    try {
        const respuestaFetch = await fetch(urlSolicitud);
        if (!respuestaFetch.ok) {
            return false;
        }
        const copia = respuestaFetch.clone();
        const datosTexto = await copia.text();
        const caracteresInvalidos = datosTexto.slice(-3);

        if (caracteresInvalidos === ']""') {
            let a = datosTexto.slice(0, -2);

            const datos = JSON.parse(a);
            return datos;
        } else {
            const datos = await respuestaFetch.json();
            return datos;
        }
    } catch (error) {
        return false;
    }
}


/**
 * Función: Prepara y maneja el reporte de balance general.
 * Descripción: Esta función obtiene los datos necesarios para el reporte de balance general.
 *             Crea el contenedor del reporte, y genera el contenido del reporte que se muestra en la vista.
 *            También proporciona opciones para descargar el reporte en diferentes formatos.
 * Fecha: 06 de febrero de 2026
 * Autor: Joel Choque
 */
export async function manejarReporteBalanceGeneral(datos) {
    const {
        urlSolicitud,
        datosFormulario,
        vistaReporte,
        contenedorPrincipal,
        nombreReporte,
        tipoReporte
    } = datos;

    // Obtener datos del reporte y verificar si hay error o no hay datos
    const datosReporte = await obtenerDatosEditado(urlSolicitud);
    const estado = verificarDatosReporte(datosReporte);
    if (estado.error) {
        vistaReporte.innerHTML = estado.mensaje;
        return;
    }

    let fechaReporte;
    if (tipoReporte === "rango") {
        fechaReporte = `Entre: ${formatoFecha(datosFormulario.fechaini)} y ${formatoFecha(datosFormulario.fechafin)}`;
    } else {
        fechaReporte = `Al: ${formatoFecha(datosFormulario.fechafin)}`;
    }

    // Crear el contenido del reporte
    const [contenedorReporte, cuerpoReporte, contenedorBotones, divReporte] = crearContenedorReporte();
    // Opciones de descarga del reporte
    const opcionesReporte = opcionesDescargaDeReporte({
        contenedorModal: contenedorPrincipal,
        // cuerpoReporte,
        // nombreArchivo: `balance_general`,
        callbackPDF: async (numeroPieDePagina) => {
            const docDefinition = await reporteBalanceGeneralPdfMake({ datosReporte, fechaReporte, nombreReporte });
            await defDocumentoPdfMake({ contenido: docDefinition, numeroPieDePagina });
        },
        callbackExcel: (conEncabezado) => {
            exportarExcelBalanceGeneral({
                datos: datosReporte,
                encabezado: { conEncabezado, fechaReporte, divisa: `(Expresado en ${getDivisaNombre()})`, titulo: nombreReporte }
            });
        },
    });
    vistaReporte.replaceChildren(contenedorReporte);
    contenedorBotones.appendChild(opcionesReporte);

    // Generar el reporte y agregarlo a la vista
    const reporte = await reporteBalanceGeneral({ datosReporte, fechaReporte, nombreReporte });
    const estructura = estructuraReporteConEncabezado();
    cuerpoReporte.innerHTML = estructura;
    const principal = cuerpoReporte.querySelector("main");
    principal.innerHTML = reporte;

    ajustarAlturaTabla(divReporte);
}

async function reporteBalanceGeneral({ datosReporte, fechaReporte, nombreReporte }) {
    const niveles = agregarNivelYObtenerProfundidad(datosReporte);

    // const firmas = await FirmasContabilidad(5);
    const firmas = null;
    const htmlFirmas = firmas ? `<div class="afr-signatures"> ${firmas} </div>` : "";

    const subtitulo = `
        <div><h4>${nombreReporte}</h4></div>
        <span>${fechaReporte}</span>
        <div><span>(Expresado en ${getDivisaNombre()})</span></div>`;

    let contador = 1;
    let filasHTML = "";
    let contadorP1 = 0;
    let pasivoPatrimonio = 0;
    let finPP = false;
    let tipoActivo = false;
    let valorActivo = 0;

    const recorrerNiveles = (arrObj) => {
        for (const item of arrObj) {
            const subnivelKey = Object.keys(item).find(k => k.startsWith("nivel_") && Array.isArray(item[k]));
            if (item.profundidad === 1) {
                if (item.total_pasi_pati !== undefined) {
                    pasivoPatrimonio =  item.total_pasi_pati ?? 0;
                    finPP = true;
                }
                if (item.total_pasi_pati === undefined && finPP) {
                    filasHTML += `<tr class="afr-tr-spacer"><td colspan="100%"></td></tr><tr><td></td><td>TOTAL PASIVO Y PATRIMONIO </td>`;
                    for (let i = niveles; i >= 1; i--) {
                        if (i === 1) {
                            filasHTML += `<td class="afr-te afr-fwb">${formatoDecimal(pasivoPatrimonio)}</td>`;
                        } else {
                            filasHTML += `<td></td>`;
                        }
                    }
                    filasHTML += `</tr>`;
                    finPP = false;
                    pasivoPatrimonio = 0;
                }
                if (contadorP1 > 0) {
                    filasHTML += `<tr class="afr-tr-spacer"><td colspan="100%"></td></tr>`;
                }
                contadorP1++;
            }

            if (item.grupo === 1 && tipoActivo === false) {
                tipoActivo = true;
                valorActivo = item.suma_nivel_2 ?? 0;
            }
            if (item.grupo !== 1 && tipoActivo) {
                filasHTML += `<tr><td></td><td class="afr-fwb">TOTAL ACTIVO </td>`;
                for (let i = niveles; i >= 1; i--) {
                    if (i === 1) {
                        filasHTML += `<td class="afr-te afr-fwb">${formatoDecimal(valorActivo)}</td>`;
                    } else {
                        filasHTML += `<td></td>`;
                    }
                }
                filasHTML += `</tr> <tr class="afr-tr-spacer"><td colspan="100%"></td></tr>`;
                contador = 0;
                tipoActivo = null;
            }

            const negrillaCursiva = `${item.negrilla_cursiva?.includes("negrilla") ? "afr-fwb" : ""} ${item.negrilla_cursiva?.includes("cursiva") ? "afr-fsi" : ""}`;
            // Crear fila con los datos del objeto actual
            let fila = `<tr>
                <td class="${negrillaCursiva}">${item.codigo}</td>
                <td class="${negrillaCursiva}">${item[`nombre_nivel_${item.profundidad}`]}</td>`;

            // Agregar celdas para cada nivel de profundidad
            for (let i = niveles; i >= 1; i--) {
                if (i === item.profundidad) {
                    fila += `<td class="afr-te ${negrillaCursiva}"> ${item.valor !== undefined ? formatoDecimal(item.valor ?? "0") : formatoDecimal(item[`suma_nivel_${i + 1}`])} </td>`;
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

    if (pasivoPatrimonio) {
        filasHTML += `<tr class="afr-tr-spacer"><td colspan="100%"></td></tr><tr><td></td><td class="afr-fwb">TOTAL PASIVO Y PATRIMONIO </td>`;
        for (let i = niveles; i >= 1; i--) {
            if (i === 1) {
                filasHTML += `<td class="afr-te afr-fwb">${formatoDecimal(pasivoPatrimonio)}</td>`;
            } else {
                filasHTML += `<td></td>`;
            }
        }
        filasHTML += `</tr>`;
    }
    if (tipoActivo === true) {
        filasHTML += `<tr><td></td><td class="afr-fwb">TOTAL ACTIVO </td>`;
        for (let i = niveles; i >= 1; i--) {
            if (i === 1) {
                filasHTML += `<td class="afr-te afr-fwb">${formatoDecimal(valorActivo)}</td>`;
            } else {
                filasHTML += `<td></td>`;
            }
        }
    }

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

async function reporteBalanceGeneralPdfMake({ datosReporte, fechaReporte, nombreReporte }) {
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

    let contadorP1 = 0;
    let pasivoPatrimonio = 0;
    let finPP = false;
    let tipoActivo = false;
    let valorActivo = 0;

    // Recorrido de datos
    const recorrerNiveles = (arrObj) => {
        for (const item of arrObj) {
            const subnivelKey = Object.keys(item).find(k => k.startsWith("nivel_") && Array.isArray(item[k]));

            // Lógica de totales
            if (item.profundidad === 1) {
                if (item.total_pasi_pati !== undefined) {
                    pasivoPatrimonio = item.total_pasi_pati ?? 0;
                    finPP = true;
                }
                if (item.total_pasi_pati === undefined && finPP) {
                    // Spacer
                    // bodyTabla.push([{ text: '', colSpan: widths.length }, ...Array(widths.length - 1).fill('')]);

                    const rowTotal = [
                        { text: '' },
                        { text: 'TOTAL PASIVO Y PATRIMONIO', bold: true }
                    ];
                    for (let i = niveles; i >= 1; i--) {
                        rowTotal.push({ text: i === 1 ? formatoDecimal(pasivoPatrimonio) : '', bold: true, alignment: 'right' });
                    }
                    bodyTabla.push(rowTotal);

                    finPP = false;
                    pasivoPatrimonio = 0;
                }
                if (contadorP1 > 0) {
                     // Spacer
                    //  bodyTabla.push([{ text: '', colSpan: widths.length }, ...Array(widths.length - 1).fill('')]);
                }
                contadorP1++;
            }

            if (item.grupo === 1 && tipoActivo === false) {
                tipoActivo = true;
                valorActivo = item.suma_nivel_2 ?? 0;
            }
            if (item.grupo !== 1 && tipoActivo) {
                 const rowTotal = [
                        { text: '' },
                        { text: 'TOTAL ACTIVO', bold: true }
                    ];
                    for (let i = niveles; i >= 1; i--) {
                        rowTotal.push({ text: i === 1 ? formatoDecimal(valorActivo) : '', bold: true, alignment: 'right' });
                    }
                    bodyTabla.push(rowTotal);

                    // Spacer
                    // bodyTabla.push([{ text: '', colSpan: widths.length }, ...Array(widths.length - 1).fill('')]);

                tipoActivo = null;
            }

            const isBold = item.negrilla_cursiva?.includes("negrilla");
            const isItalic = item.negrilla_cursiva?.includes("cursiva");
            const style = {};
            if (isBold) style.bold = true;
            if (isItalic) style.italics = true;

            // Crear fila
            const row = [
                { text: item.codigo || "", ...style },
                { text: item[`nombre_nivel_${item.profundidad}`], ...style }
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

            // Recursión
            if (subnivelKey && item[subnivelKey].length > 0) {
                recorrerNiveles(item[subnivelKey]);
            }
        }
    };

    recorrerNiveles(datosReporte);

    // Totales finales
    if (pasivoPatrimonio) {
         // Spacer
        // bodyTabla.push([{ text: '', colSpan: widths.length }, ...Array(widths.length - 1).fill('')]);

        const rowTotal = [
            { text: '' },
            { text: 'TOTAL PASIVO Y PATRIMONIO', bold: true }
        ];
        for (let i = niveles; i >= 1; i--) {
            rowTotal.push({ text: i === 1 ? formatoDecimal(pasivoPatrimonio) : '', bold: true, alignment: 'right' });
        }
        bodyTabla.push(rowTotal);
    }
    if (tipoActivo === true) {
         const rowTotal = [
            { text: '' },
            { text: 'TOTAL ACTIVO', bold: true }
        ];
        for (let i = niveles; i >= 1; i--) {
            rowTotal.push({ text: i === 1 ? formatoDecimal(valorActivo) : '', bold: true, alignment: 'right' });
        }
        bodyTabla.push(rowTotal);
    }


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



export function exportarExcelBalanceGeneral({ datos, encabezado = {titulo: "Balance General", conEncabezado: false, fechaReporte: "", divisa: ""}} = {}
) {
    const wb = XLSX.utils.book_new();

    // Estilos
    const styleTitulo = { font: { bold: true, sz: 14 } };
    const styleBold = { font: { bold: true } };
    const styleItalic = { font: { italic: true } };
    const styleNumber = { alignment: { horizontal: "right" } };
    const styleTotal = { font: { bold: true }, alignment: { horizontal: "right" } };

    const filas = [];
    const merges = [];
    let filaActual = 0;

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

    // Niveles de encabezado
    filas.push([
        { v: "Código", s: styleBold },
        { v: "Cuenta", s: styleBold },
        ...Array.from({ length: niveles }, (_, i) => ({ v: `Nivel ${i + 1}`, s: styleBold }))
    ]);
    filaActual++;

    let pasivoPatrimonio = 0;
    let tipoActivo = false;
    let valorActivo = 0;
    let finPP = false;

    const recorrer = (arr) => {
        for (const item of arr) {
            const subnivelKey = Object.keys(item).find(k => k.startsWith("nivel_"));

            // Control totales
            if (item.profundidad === 1) {
                if (item.total_pasi_pati !== undefined) {
                    pasivoPatrimonio = item.total_pasi_pati ?? 0;
                    finPP = true;
                }
                if (item.total_pasi_pati === undefined && finPP) {
                    filas.push([]);
                    filas.push(crearFilaTotal("TOTAL PASIVO Y PATRIMONIO", pasivoPatrimonio, niveles));
                    filaActual += 2;
                    finPP = false;
                    pasivoPatrimonio = 0;
                }
            }

            if (item.grupo === 1 && tipoActivo === false) {
                tipoActivo = true;
                valorActivo = item.suma_nivel_2 ?? 0;
            }

            if (item.grupo !== 1 && tipoActivo) {
                filas.push(crearFilaTotal("TOTAL ACTIVO", valorActivo, niveles));
                filas.push([]);
                filaActual += 2;
                tipoActivo = false;
            }

            // Estilos
            const estilo = {};
            if (item.negrilla_cursiva?.includes("negrilla")) estilo.font = { bold: true };
            if (item.negrilla_cursiva?.includes("cursiva")) estilo.font = { ...estilo.font, italic: true };

            // Fila principal
            const fila = [
                { v: item.codigo, s: estilo },
                { v: item[`nombre_nivel_${item.profundidad}`], s: estilo }
            ];

            for (let i = niveles; i >= 1; i--) {
                if (i === item.profundidad) {
                    fila.push({ v: item.valor ?? item[`suma_nivel_${i + 1}`] ?? 0, t: "n", s: styleNumber });
                } else if (i + 1 === item.profundidad && item.valor_restado !== undefined) {
                    fila.push({ v: item.valor_restado, t: "n", s: styleNumber });
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

    if (pasivoPatrimonio) {
        filas.push([]);
        filas.push(crearFilaTotal("TOTAL PASIVO Y PATRIMONIO", pasivoPatrimonio, niveles));
    }

    if (tipoActivo) {
        filas.push(crearFilaTotal("TOTAL ACTIVO", valorActivo, niveles));
    }

    // Crear hoja de Excel
    const ws = XLSX.utils.aoa_to_sheet(filas);
    ws["!merges"] = merges;

    // Ajustar ancho de columnas
    ws["!cols"] = [
        { wch: 12 },
        { wch: 40 },
        ...Array.from({ length: niveles }, () => ({ wch: 15 }))
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Balance General");
    XLSX.writeFile(wb, `balance_general.xlsx`);
}

function crearFilaTotal(texto, valor, niveles) {
    const fila = [
        { v: "" },
        { v: texto, s: { font: { bold: true } } }
    ];

    for (let i = niveles; i >= 1; i--) {
        if (i === 1) {
            fila.push({ v: valor, t: "n", s: { font: { bold: true }, alignment: { horizontal: "right" } } });
        } else {
            fila.push({ v: "" });
        }
    }
    return fila;
}