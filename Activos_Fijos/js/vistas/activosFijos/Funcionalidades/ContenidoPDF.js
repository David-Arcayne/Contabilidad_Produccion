import { FormatoDate, FormatoDateTime, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { FiltrosPDF } from "../../../funciones/VistaPDF.js";

export const ContenidoPDF = (formulario, extra) => {

    return async () => {
        const cuerpo = new FormData(formulario);
        const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
        const datosExtra = extra(cuerpo, formulario);
        cuerpo.append("informacion", datosExtra);
        const data = await fetch(`./api/activo-fijo/altas/reporte/${objAFTI.tipo_inventario}`, {
            method:"POST",
            body: cuerpo
        })
        .then(res => res.json())
        .then(res => { return res; })
        .catch(error => {return false;});

        if (!data || !data.hasOwnProperty("data")) {
            return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
        }
        
        const subtitulo = FiltrosPDF(data.info);

        let htmlTable = "";
        for (const value of data.data) {
            htmlTable += `
                <tr>
                    <td>${value.codigo}</td>
                    <td class="afr-te">${value.cantidad}</td>
                    <td class="afr-te">${value.cantidaddisponible}</td>
                    <td>${value.nombre}</td>
                    <td>${value.detalle}</td>
                    <td class="afr-te">${FormatoEnUs(value.precio)}</td>
                    <td class="afr-te">${FormatoDate(value.fechacompra)}</td>
                    <td>${value.nombrecategoria}</td>
                    <td>${value.nombretipobien}</td>
                    <td>${value.nombretiposeguro || "-"}</td>
                    <td>${value.observacion}</td>
                    <td>${value.nombretipoinventario}</td>
                </tr>`;
        };

        let html = `
            <div>
                <h1>Reporte de Activos Fijos</h1>
            </div>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Disponibles</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Precio</th>
                        <th>Fecha de ingreso</th>
                        <th>Categoría</th>
                        <th>Tipo de Bien</th>
                        <th>Tipo seguro</th>
                        <th>Observación</th>
                        <th>Inventario</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>`;

        return html;
    }
}

export const HistorialPDF = (url) =>  async () => {
    const data = await obtenerDatos(`${url}`);
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    let dataFA = data.data;
    let dataLocation = data.dataLocation;
    let dataTrajectory = data.dataTrajectory;
    let uniqueUser = data.uniqueUser;

    let htmlTrajectory = "";
    if (dataTrajectory && dataTrajectory.length > 0) {
        let total = 0;
        htmlTrajectory = `
        <table class="afr-table" data-tname="trayectoria">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Responsable</th>
                    <th>Sucursal</th>
                    <th>Área de trabajo</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>`;

        dataTrajectory.forEach(value => {
            htmlTrajectory += `<tr>
                <td>${FormatoDateTime(value.fecha)}</td>
                <td>${value.tipo == 2 ? "Asignación" : "Devolución"}</td>
                <td>${value.trabajador}</td>
                <td>${value.sucursal}</td>
                <td>${value.area}</td>
                <td class="afr-te">${value.cantidad}</td>
            </tr>`;
        });

        htmlTrajectory += `
            </tbody>
        </table>`;
    } else {
        htmlTrajectory = '<p class="afr-center">Sin trayectoria</p>';
    }

    let htmlLocation = "";
    console.log({dataLocation});
    
    let stateMultiple = false;
    if (dataLocation && dataFA.cantidad > 1) {
        if (dataLocation.length == 1 && !dataLocation[0].sucursal && !dataLocation[0].area && !dataLocation[0].trabajador) {
            htmlLocation = '<p class="afr-center">Todos los activos disponibles están sin asignar.</p>';
        } else {
            stateMultiple = true;
            htmlLocation = `
            <table class="afr-table" data-tname="ubicacion">
                <thead>
                    <tr>
                        <th>Cantidad</th>
                        <th>Estado</th>
                        <th>Responsable</th>
                        <th>Sucursal</th>
                        <th>Área de trabajo</th>
                    </tr>
                </thead>
                <tbody>`;

            dataLocation.forEach(value => {
                if (!value.sucursal && !value.area && !value.trabajador) {
                    if (value.array_cantidad && value.array_cantidad.length > 0) {
                        let sumCantidad = 0;
                        value.array_cantidad.forEach(valueC => {
                            sumCantidad += parseInt(valueC.cantidad);
                            htmlLocation += `<tr>
                                <td class="afr-te">${valueC.cantidad}</td>
                                <td>${valueC.nombretipoestado}</td>
                                <td colspan="3" class="afr-tsi">Activos sin asignar.</td>
                            </tr>`;
                        });

                        if (sumCantidad < value.cantidad) {
                            htmlLocation += `<tr>
                                <td class="afr-te">${value.cantidad - sumCantidad}</td>
                                <td>-</td>
                                <td colspan="3" class="afr-tsi">Activos sin asignar.</td>
                            </tr>`;
                        }
                    } else {
                        htmlLocation += `<tr>
                            <td class="afr-te">${value.cantidad}</td>
                            <td>${value.nombretipoestado ?? "-"}</td>
                            <td colspan="3" class="afr-tsi">Activos sin asignar.</td>
                        </tr>`;
                    }
                    // htmlLocation += `<tr>
                    //     <td class="afr-te">${value.cantidad ?? value.ai_cantidad}</td>
                    //     <td>${value.nombretipoestado}</td>
                    //     <td colspan="3" class="afr-tsi">Activos sin asignar.</td>
                    // </tr>`;
                } else {
                    // htmlLocation += `<tr>
                    //     <td class="afr-te">${value.cantidad ?? value.ai_cantidad}</td>
                    //     <td>${value.nombretipoestado ? value.nombretipoestado : dataFA.nombretipoestado}</td>
                    //     <td>${value.trabajador}</td>
                    //     <td>${value.sucursal}</td>
                    //     <td>${value.area}</td>
                    // </tr>`;
                    if (value.array_cantidad && value.array_cantidad.length > 0) {
                        let sumCantidad = 0;
                        value.array_cantidad.forEach(valueC => {
                            sumCantidad += parseInt(valueC.cantidad);
                            htmlLocation += `<tr>
                                <td class="afr-te">${valueC.cantidad}</td>
                                <td>${valueC.nombretipoestado}</td>
                                <td>${value.trabajador}</td>
                                <td>${value.sucursal}</td>
                                <td>${value.area}</td>
                            </tr>`;
                        });

                        if (sumCantidad < value.cantidad) {
                            htmlLocation += `<tr>
                                <td class="afr-te">${value.cantidad - sumCantidad}</td>
                                <td>-</td>
                                <td>${value.trabajador}</td>
                                <td>${value.sucursal}</td>
                                <td>${value.area}</td>
                            </tr>`;
                        }
                    } else {
                        htmlLocation += `<tr>
                            <td class="afr-te">${value.cantidad}</td>
                            <td>${value.nombretipoestado ?? "-"}</td>
                            <td>${value.trabajador}</td>
                            <td>${value.sucursal}</td>
                            <td>${value.area}</td>
                        </tr>`;
                    }

                }
            });

            htmlLocation += `
                </tbody>
            </table>`;
        }
    }

    let htmlMaintenance = "";
    let stateFA = 1;
    if (data.dataHistory && data.dataHistory.length > 0) {
        let total = 0;
        htmlMaintenance = `
        <table class="afr-table" data-tname="mantenimientos">
            <thead>
                <tr>
                    <th>Componente</th>
                    <th>Detalle</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Precio</th>
                </tr>
            </thead>
            <tbody>`;

        data.dataHistory.forEach(value => {
            htmlMaintenance += `<tr>
                <td>${value.componentes_id ? value.nombrecomponente : "-"}</td>
                <td>${value.detalle}</td>
                <td class="afr-te">${FormatoDateTime(value.fechaingreso)}</td>
                <td class="afr-te">${FormatoDateTime(value.fechasalida)}</td>
                <td class="afr-te">${value.costo ? FormatoEnUs(value.costo) : "-"}</td>
            </tr>`;
            stateFA = value.estadoactivo;
            total += parseFloat(value.costo) || 0;
        });

        htmlMaintenance += `
            <tr>
                <td colspan="4" class="afr-te">TOTAL</td>
                <td class="afr-te">${FormatoEnUs(total)}</td>
            </tr>
            </tbody>
        </table>`;
    } else {
        htmlMaintenance = '<p class="afr-center">Sin mantenimientos o reparaciones</p>';
    }

    let htmlComponents = "";
    if (data.dataComponents && data.dataComponents.length > 0) {
        htmlComponents = `
        <table class="afr-table" data-tname="componentes">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>`;

        data.dataComponents.forEach(value => {
            htmlComponents += `<tr>
                <td>${value.codigo}</td>
                <td>${value.nombre}</td>
                <td>${value.descripcion}</td>
                <td class="afr-te">${value.cantidad}</td>
            </tr>`;
        });

        htmlComponents += `
            </tbody>
        </table>`;
    } else {
        htmlComponents = '<p class="afr-center">Sin componentes</p>';
    }

    // ($uniqueUser && $dataLocation[0] && isset($dataLocation[0]["array_cantidad"]) ? $dataLocation[0]["array_cantidad"]["nombretipoestado"] : $dataFA["nombretipoestado"])
    let html = `
        <div>
            <h1>Historial: ${dataFA.nombre}</h1>
        </div>
        <div class="afr-filter-void"></div>
        <div class="afr-info">
            <div class="${uniqueUser || dataFA.cantidad > 1 ? "afr-info-left" : ""}">
                <div><span>Nombre:</span> ${dataFA.nombre}</div>
                <div><span>Código:</span> ${dataFA.codigo}</div>
                <div><span>Cantidad:</span> ${dataFA.cantidad}</div>
                <div><span>Detalle:</span> ${dataFA.detalle}</div>
                <div><span>Estado:</span> ${stateMultiple && dataFA.cantidad > 1 ? "Varios" : (uniqueUser && dataLocation[0] && dataLocation[0].array_cantidad ? dataLocation[0].array_cantidad.nombretipoestado :(dataFA.nombretipoestado ?? ""))}</div>
                <div><span>Fecha de ingreso:</span> ${FormatoDate(dataFA.fechacompra)}</div>
            </div>
            ${uniqueUser ? `
                <div class="afr-info-right">
                    <div><span>Región:</span> ${uniqueUser.region ?? ""}</div>
                    <div><span>Sucursal:</span> ${uniqueUser.sucursal}</div>
                    <div><span>Área de trabajo:</span> ${uniqueUser.area}</div>
                    <div><span>Personal:</span> ${uniqueUser.trabajador}</div>
                    <div><span>Cargo:</span> ${uniqueUser.cargo_trabajador}</div>
                </div>` : (dataFA.cantidad > 1 ? '<div class="afr-info-right"><div>Asignación múltiple</div></div>' : "")}
        </div>
        <div>
            <p><b>Componentes:</b></p>
            ${htmlComponents}
            <p style="${dataFA.cantidad <= 1 ? "display: none" : ""}"><b>Ubicación actual:</b></p>
            ${htmlLocation}
            <p><b>Mantenimientos:</b></p>
            ${htmlMaintenance}
            <p><b>Trayectoria del activo:</b></p>
            ${htmlTrajectory}
            
        </div>`;

    return html;
}