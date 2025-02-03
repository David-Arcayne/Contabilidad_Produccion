import { URL_APIC } from "../../../../../lib/services.js";
import { contenidoTBody, crearTabla } from "../../../funciones/CrearTabla.js";
import { btnNuevoRegistro, cambiarVista, crearElemento, encabezadoVista, InputBusqueda, opciones } from "../../../funciones/Funciones.js";
import { editarRegistroModal, eliminarRegistro, nuevoRegistro } from "../../../funciones/OpcionesBasicas.js";
import { rellenarSelect } from "../../../funciones/Solicitudes.js";
import { formularioRecibo } from "../Formularios.js";

/**
 * Contenido de la ventana.
 * @param {string} codigo - Codigo de la ventana.
 * @param {Object} permisos - Permisos del usuario sobre la vista.
 * @param {string} permisos.lectura - Permiso de lectura.
 * @param {string} permisos.escritura - Permiso de escritura.
 * @param {string} permisos.editar - Permiso de edición.
 * @param {string} permisos.eliminar - Permiso de eliminación.
 * @param {Object} elementosFxC - Elementos de la viata Facturas por Cobrar
 */
export function NuevoRecibo(codigo, permisos, elementosFxC) {

    const {
        vistaFxC,
        vistaNuevoRecibo
    } = elementosFxC;


    const URL = `${URL_APIC}api/`;
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL_LT = `${URL}mi_ulr_para_listar/${empresa_id}`;

    // Creación de Vistas para la navegación en la ventana
    // const vistaPrincipal = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);
    // const vistaRegistrar = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    // vistaRegistrar.setAttribute("class", "d-none");

    const vistaPrincipal = crearElemento("div");
    const vistaRegistrar = crearElemento("div", { class: "d-none" });

    vistaNuevoRecibo.append(vistaPrincipal, vistaRegistrar);

    const regresar = () => { cambiarVista(vistaNuevoRecibo, vistaFxC) }
    const tituloVista = encabezadoVista("Volver", "Recibos", regresar)
    vistaPrincipal.replaceChildren(tituloVista);


    // Creación de elementos para la vista Principal
    const contenedorDeAlertas = crearElemento("div");
    vistaPrincipal.appendChild(contenedorDeAlertas);

    if (permisos.escritura === "1") {
        const opcionesBtns = opciones([
            btnNuevoRegistro(() => cambiarVista(vistaPrincipal, vistaRegistrar)),
        ]); 
        vistaPrincipal.appendChild(opcionesBtns);
    }
    const encabezadoTabla = [
        "Opción",
        "Recibido de",
        "La suma de",
        "Moneda",
        "Por concepto de",
        "A cuenta",
        "Saldo",
        "Total",
        "Fecha",
        "Usuario que recibe",
        "Opciones",
    ];
    const estiloTd = [
        "text-center",
        "text-start",
        "text-end",
        "text-start",
        "text-start",
        "text-end",
        "text-end",
        "text-end",
        "date",
        "text-start",
        "text-start",
    ];
    
    const contenidoTabla = [
        {
            nombre: "_opcion",
            colInput: columnaCheckbox(vistaPrincipal),
        },
        "recibido_de",
        "la_suma_de",
        "moneda",
        "por_concepto_de",
        "a_cuenta",
        "saldo",
        "total",
        "fecha",
        "usuario_recibe",
        {
            nombre: "Opciones",
            // accion: {
            //     accion: AsignarTransaccion(() => {return {vistaPrincipal, contenedorDeAlertas, estiloTd, contenidoTabla, tBody, URL_LT} }),
            //     icono: "bi bi-journal-arrow-up",
            //     classElemento: "btn btn-primary btn-sm",
            //     titulo: "Asignar a una transacción",
            // },
            usarBasicos: {
                editar: editarRegistroModal({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    camposDeFormulario: formularioRecibo,
                    URL_FORM: URL,
                    URL_LISTAR: URL_LT,
                    estiloTd,
                }, {
                    datosExtra: [
                        { key: "idimpuesto", value_r: "id" },
                        { key: "ver", value: "valor_ver_para_actualizar" },
                    ]
                }),
                eliminar: eliminarRegistro({
                    vistaPrincipal,
                    contenedorDeAlertas,
                    URL: (id) => `${URL}mi_url_para_eliminar/${id}`,
                }),
            },
        },
    ];
    // Eliminar las opciones de editar y eliminar si el usuario no tiene los permisos respectivos.
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
    // const divBuscar = InputBusqueda(tabla.querySelector("table"), { fila: true, alineado: "fin" });
    vistaPrincipal.append(tabla);
    // Listar los registros en la tabla.
    // const cargarContenido = (registros) => { 
    //     contenidoTBody(registros, {contenido: contenidoTabla, estiloTd}, tBody);
    // };
    // obtenerDatosAlr(URL_LT, { contenedor: contenedorDeAlertas, error: "Ocurrio un error al cargar los registros", accion: cargarContenido, tBody });
    const test = [
        // {
        //     "fechatfactura": "2021-09-01",
        //     "nfactura": "F-0001",
        //     "nautorizacion": "1234567890",
        //     "codigocontrol": "ABC123",
        //     "montofactura": 1000.00,
        //     "tasacero": 1,
        //     "export": 1,
        //     "npoliza": "1234567890",
        //     "iceiecdhotros": 1,
        //     "descuentobonificacion": 0,
        //     "especificacion": "Especificación",
        //     "cliente": "Cliente 1",
        //     "cobrar": "Cobrar",
        //     "cuenta": "ACTIVO",
        // },
        {
            "recibido_de": "Cliente 1",
            "la_suma_de": 1000.00,
            "moneda": "Bolivianos",
            "por_concepto_de": "Venta de productos",
            "a_cuenta": 0,
            "saldo": 1000.00,
            "total": 1000.00,
            "fecha": "2021-09-01",
            "usuario_recibe": "Usuario 1",
        }
    ]
    contenidoTBody(test, {contenido: contenidoTabla, estiloTd}, tBody);


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
            camposDeFormulario: formularioRecibo,
            estiloTd,
        }, undefined, {
            datosExtra: [
                { key: "ver", value: "valor_ver_para_crear" },
                { key: "idempresa", value: empresa_id },
            ]
        });
    }
}

const AsignarTransaccion = (funcVariables) => ({ elemento, registro }) => {
    const datosVista = funcVariables();
    const {
        vistaPrincipal, 
        contenedorDeAlertas,
        estiloTd,
        contenidoTabla,
        tBody,
        URL_LT,
    } = datosVista;

    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL = `${URL_APIC}api/`;

    const innerDiv = crearElemento("div", {class: "inner-div"});
    const floatingDiv = crearElemento("div", {class: "floating-message p-md-4", style: "width: 100%; max-width: 400px; min-width: 240px"});
    
    const inputSelect = crearElemento("select", {class: "form-select", id: "factura-transaccion", name: "transaccion__"});
    rellenarSelect(inputSelect, { origen: `${URL}listatransacciones/${empresa_id}`, llaves: { id: "id", detalle: ["ntransaccion", "glosa"] } })
    const form = crearElemento("form", undefined, [inputSelect]);

    const btnAsignar = crearElemento("button", {class: "btn btn-primary"}, "Asignar");
    const btnCancelar = crearElemento("button", {class: "btn btn-secondary"}, "Cancelar");
    const divBtns = crearElemento("div", {class: "text-center"}, [btnAsignar, " ", btnCancelar]);

    const h4 = crearElemento("h5", {class: "text-center"}, "Asignar a una transacción");
    const divForm = crearElemento("div", { class:"my-3" }, [form]);
    const divContenedor = crearElemento("div", undefined, [h4, divForm, divBtns]);

    floatingDiv.appendChild(divContenedor);
    innerDiv.appendChild(floatingDiv);

    // Elimina el modal si se hace click fuera del contendor de mensaje
    innerDiv.addEventListener('click', function(event) {
        if ((floatingDiv && !floatingDiv.contains(event.target)) ||(btnCancelar && btnCancelar.contains(event.target))) {
            innerDiv.remove();
        }
    });
        
    
    vistaPrincipal.appendChild(innerDiv);

}


const columnaCheckbox = (vistaPrincipal) => ({elemento, contenidoTabla, registro, tbody, objectT}) => {
    const empresa_id = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa.idempresa;
    const URL = `${URL_APIC}api/`;
    
    elemento.classList.add("text-center");
    const input = crearElemento("input", {type: "checkbox", class: "form-check-input border-primary"});
    elemento.appendChild(input);

    input.addEventListener("change", (e) => {
        const divT = tbody.closest(".table-responsive");
        const btnAsientoM = crearElemento("button", {class: "btn btn-info btn-sm"}, ["Asiento Modelo"]);
        const btnCuenta = crearElemento("button", {class: "btn btn-info btn-sm ms-2"}, ["Cuenta"]);
        const divOpciones = crearElemento("div", {class: "d-flex justify-content-start mb-2", id: "opciondes_agrupar"}, [btnAsientoM, btnCuenta]);

        if (input.checked) {
            objectT[registro.id] = registro;
            if (vistaPrincipal.querySelector("#opciondes_agrupar")) {
                return;
            }
            vistaPrincipal.insertBefore(divOpciones, divT);
        } else {
            delete objectT[registro.id];
            if (Object.keys(objectT).length === 0) {
                vistaPrincipal.removeChild(vistaPrincipal.querySelector("#opciondes_agrupar"));
                return;
            }
        }
        
        btnAsientoM.addEventListener("click", async (e) => {
            const innerDiv = crearElemento("div", {class: "inner-div"});
            const floatingDiv = crearElemento("div", { class: "floating-message p-md-4", style: "width: 100%; max-width: 400px; min-width: 240px" });
            

            const inputSelect = crearElemento("select", {class: "form-select", id: "factura-transaccion", name: "transaccion__"});
            const divISelect = crearElemento("div", {class: "col-12"}, [inputSelect]);
            // const selectFactura = crearElemento("select", {class: "form-select", id: "factura-transaccion", name: "transaccion__"});
            // const divSFactura = crearElemento("div", {class: "col col-md-6"}, [selectFactura]);
            // const selectAsiento = crearElemento("select", {class: "form-select", id: "factura-transaccion", name: "transaccion__"});
            // const divSAsiento = crearElemento("div", {class: "col col-md-6"}, [selectAsiento]);
            // const hr = crearElemento("hr", {class: "my-3"});
            // const h6 = crearElemento("h6", {class: ""}, "Asignar la factura a una cuenta");
            const form = crearElemento("form", {class: "row g-2"}, [divISelect]);

            const datosSFactura = [];
            for (const key in objectT) {
                datosSFactura.push(objectT[key]);
            }
            // const sFactura = { datos: datosSFactura, llaves: { id: "id", detalle: ["nfactura", "codigocontrol"] } };
            // rellenarSelect(selectFactura, sFactura)
            // rellenarSelect(selectAsiento, { datos: [], textNF: "Selecciones un asiento" })
            // const accionInputSelect = (id) => {
            //     rellenarSelect(selectAsiento, { origen: `${URL}listaasientosc/${id}`, llaves: { id: "id", detalle: ["plan", "tipo"] }, text: "cuentas" })
            // }
            rellenarSelect(inputSelect, { origen: `${URL}listaasientos/${empresa_id}`, llaves: { id: "id", detalle: "nombre" } })


            const btnAsignar = crearElemento("button", {class: "btn btn-primary"}, "Asignar");
            const btnCancelar = crearElemento("button", {class: "btn btn-secondary"}, "Cancelar");
            const divBtns = crearElemento("div", {class: "text-center mt-4"}, [btnAsignar, " ", btnCancelar]);

            const h4 = crearElemento("h5", {class: "text-center"}, "Asignar a un asiento Modelo");
            const divForm = crearElemento("div", { class:"my-3" }, [form]);
            const divContenedor = crearElemento("div", undefined, [h4, divForm, divBtns]);

            floatingDiv.appendChild(divContenedor);
            innerDiv.appendChild(floatingDiv);

            // Elimina el modal si se hace click fuera del contendor de mensaje
            innerDiv.addEventListener('click', function(event) {
                if ((floatingDiv && !floatingDiv.contains(event.target)) ||(btnCancelar && btnCancelar.contains(event.target))) {
                    innerDiv.remove();
                }
            });
                
            
            vistaPrincipal.appendChild(innerDiv);
        });
        btnCuenta.addEventListener("click", async (e) => {

            const innerDiv = crearElemento("div", {class: "inner-div"});
            const floatingDiv = crearElemento("div", {class: "floating-message p-md-4", style: "width: 100%; max-width: 400px; min-width: 240px"});
            
            const inputSelect = crearElemento("select", {class: "form-select", id: "factura-transaccion", name: "transaccion__"});
            rellenarSelect(inputSelect, { origen: `${URL}milistaplanes/${empresa_id}`, llaves: { id: "id", detalle: ["numero", "plan"] } })
            const form = crearElemento("form", undefined, [inputSelect]);

            const btnAsignar = crearElemento("button", {class: "btn btn-primary"}, "Asignar");
            const btnCancelar = crearElemento("button", {class: "btn btn-secondary"}, "Cancelar");
            const divBtns = crearElemento("div", {class: "text-center"}, [btnAsignar, " ", btnCancelar]);

            const h4 = crearElemento("h5", {class: "text-center"}, "Asignar a una cuenta");
            const divForm = crearElemento("div", { class:"my-3" }, [form]);
            const divContenedor = crearElemento("div", undefined, [h4, divForm, divBtns]);

            floatingDiv.appendChild(divContenedor);
            innerDiv.appendChild(floatingDiv);

            // Elimina el modal si se hace click fuera del contendor de mensaje
            innerDiv.addEventListener('click', function(event) {
                if ((floatingDiv && !floatingDiv.contains(event.target)) ||(btnCancelar && btnCancelar.contains(event.target))) {
                    innerDiv.remove();
                }
            });
                
            
            vistaPrincipal.appendChild(innerDiv);
        });
    });
}