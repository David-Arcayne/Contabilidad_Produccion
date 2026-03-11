import { crearElemento, formatoDecimal, seccionEncabezado } from "../../funciones/Funciones.js";
import { CobrarContratos } from "./cobrarContratos.js";
import { CobrarFacturas } from "./cobrarFacturas.js";
import { PagarContratos } from "./pagarContratos.js";
import { PagarFacturas } from "./pagarFacturas.js";

/**
 * Función: Crea el contenido principal del menú
 * Descripción: Esta función genera el contenido principal del menú para la gestión de cobros y pagos de facturas y contratos
 *              Permite visualizar y administrar créditos mediante formularios y tablas dinámicas.
 * Fecha: 01 de marzo de 2026
 * Autor: Joel Choque
 */
/**
 * Contenido de la ventana.
 * @param {PermisosVista} permisos - Permisos del usuario sobre la vista.
 * @param {HTMLElement} vistaCajaYBancos - Contenedor principal donde se renderiza la vista de cobros y pagos.
 * @param {DatosMenuBotones} datosVistaPrincipal - Información de la vista: código, permisos, título.
 */
export async function CobrarOPagar(permisos, vistaCajaYBancos, datosVistaPrincipal) {
    const vistaPrincipal = vistaCajaYBancos;
    const lsDivisa = JSON.parse(localStorage.getItem("divisa"));
    const divisaEnUso = lsDivisa?.nombre || "Bolivianos";
    const encabezadoVista = seccionEncabezado({titulo: "Administración de Créditos", textoInformacion: `(Expresado en ${divisaEnUso})`});
    vistaPrincipal.appendChild(encabezadoVista);

    // Datos para múltiples selects
    const gruposSelects = [
        {
            id: "facturas",
            label: "Facturas",
            opciones: [
                { id: "cobrar", label: "Cobrar", vista: "", selected: true },
                { id: "pagar", label: "Pagar", vista: "d-none" },
            ],
        },
        {
            id: "contratos",
            label: "Contratos",
            opciones: [
                { id: "cobrar_c", label: "Cobrar", vista: "d-none" },
                { id: "pagar_c", label: "Pagar", vista: "d-none" },
            ],
        },
    ];

    const contenedorSelects = crearElemento("div", { class: "row g-3" });
    const contenedorVistas = crearElemento("div");

    let primeraOpcion = "";
    let primeraVentana = [];
    if (gruposSelects.length > 1) {
        primeraOpcion = crearElemento("option", { value: "",}, [""]);
    }

    const vistas = {};
    const grupos = {vistas , opciones: []};

    gruposSelects.forEach((grupo, index) => {
        const { id, label, opciones } = grupo;

        const selectId = `select_${id}`;
        const labelElem = crearElemento("label", { class: "input-group-text pe-none fw-bold", for: selectId }, [label]);
        const select = crearElemento("select", { class: "form-select w-auto", id: selectId, style: "font-size: 1.2em;" });
        const inputGrupo = crearElemento("div", { class: "input-group" }, [labelElem, select]);
        const col = crearElemento("div", { class: "col-auto" }, [inputGrupo]);
        contenedorSelects.appendChild(col);

        select.appendChild(primeraOpcion?.cloneNode(true)); // Agregar la opción vacía si hay más de un grupo

        grupos.opciones = [...grupos.opciones, ...opciones];

        opciones.forEach(({ id, label, vista, selected }) => {
            if (primeraVentana.length === 0) primeraVentana = [grupos, id];
            const option = crearElemento("option", (selected ? { value: id, selected: "" } : { value: id }), [label]);
            select.appendChild(option);

            const divVista = crearElemento("div", { class: vista, "data-id": `${grupo.id}_${id}` });
            vistas[id] = divVista;
            contenedorVistas.appendChild(divVista);
        });

        // Evento para cada select
        select.addEventListener("change", (e) => {
            contenedorSelects.querySelectorAll("select").forEach((s) => s !== e.target && (s.value = ""));
            cambiarVista(grupos, e.target.value);
        });

    });

    const separador = crearElemento("hr", { class: "mt-1" });
    vistaPrincipal.append(contenedorSelects, separador, contenedorVistas);

    // Controla la visibilidad de las vistas por grupo
    function cambiarVista(grupo, idActivo) {
        const { opciones, vistas, id } = grupo;

        opciones.forEach(({ id: opcionId }) => {
            const vista = vistas[opcionId];

            if (opcionId === idActivo) {
                vista.classList.remove("d-none");

                if (vista.children.length === 0) {
                    // Carga dinámica de contenido según grupo y opción
                    if (opcionId === "cobrar") CobrarFacturas(permisos, vista, datosVistaPrincipal);
                    if (opcionId === "pagar") PagarFacturas(permisos, vista, datosVistaPrincipal);
                    if (opcionId === "cobrar_c") CobrarContratos?.(permisos, vista, datosVistaPrincipal);
                    if (opcionId === "pagar_c") PagarContratos?.(permisos, vista, datosVistaPrincipal);
                }
            } else {
                vista.classList.add("d-none");
            }
        });
    }

    // Inicializar primera vista de cada grupo
    cambiarVista(primeraVentana[0], primeraVentana[1]);
}

/**
 * Función: Maneja el saldo inicial y su actualización.
 * Descripción: Esta función crea un objeto para gestionar el saldo inicial, permitiendo obtener el saldo actual y actualizarlo al restar montos.
 * Fecha: 01 de marzo de 2026
 * Autor: Joel Choque
 */
/**
 * Maneja el saldo inicial y su actualización.
 * @param {number} saldoInicial - El saldo inicial a manejar.
 * @param {HTMLElement} elementoSaldo - El elemento HTML donde se mostrará el saldo actualizado.
 */
export function manejarSaldoInicial(saldoInicial, elementoSaldo) {
    let saldo = Math.round((parseFloat(saldoInicial) || 0) * 100) / 100;

    return {
         /**
         * Función para obtener el saldo actual.
         * @returns {number} El saldo actual.
         */
        getSaldo() {
            return saldo;
        },
        /**
         * Función para actualizar el saldo restando un monto.
         * @param {number} montoARestar - El monto a restar del saldo actual.
         */
        actualizarSaldo(montoARestar) {
            const monto = Math.round((parseFloat(montoARestar) || 0) * 100) / 100;
            saldo = Math.round((saldo - monto) * 100) / 100;
            elementoSaldo.textContent = formatoDecimal(saldo);
        }
    }
}