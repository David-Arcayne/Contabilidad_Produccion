import { formatoFecha, obtenerFechaActual } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { seccionTablaPdfMake } from "../../../funciones/VistaPDF.js";

// Funcionalidad que genera el contenido para el reporte PDF del plan de cuentas
export function pdfMakePlanDeCuentas(urlSolicitud) {
    return async () => {
        const registros = await obtenerDatos(urlSolicitud);

        if (!registros) throw new Error("Error al obtener los datos");
        if (registros.length === 0) return [];

        const fecha = obtenerFechaActual();

        const bodyTabla = [
            [
                { text: "Código", style: "tablaEncabezado" },
                { text: "Cuenta", style: "tablaEncabezado" },
                { text: "Tipo", style: "tablaEncabezado" },
                { text: "Descripción", style: "tablaEncabezado" },
            ]
        ];

        for (const value of registros) {
            bodyTabla.push([
                { text: value.numero || "-" },
                { text: value.plan || "-" },
                { text: value.tipo || "-" },
                { text: value.descripcion || "-" },
            ]);
        };

        const tablaContenido = seccionTablaPdfMake({
            widths: ["auto", "auto", "auto", "*",],
            body: bodyTabla,
        });

        const content = [
            { text: "Plan de Cuentas", style: "textoTitulo" },
            { text: `Al: ${formatoFecha(fecha)}`, style: "textoInformacion" },
            // { text: `(Expresado en ${divisaEnUso})`, style: "textoInformacion" },
            tablaContenido,
        ];

        return content;
    }
}
