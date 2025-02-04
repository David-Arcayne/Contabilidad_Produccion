import { generarCabeceraHTML } from "../funciones/funcionesGenerales.js";

// Función para crear el formulario
export function crearFormulario(codigo, tipoAlmacenF, codregistro) {
    const idformulario = "form" + codigo;
    const idformulario2 = "form2" + codigo;
    const atras = "atras" + idformulario2;
    const contenidoTabla = "listar" + codigo;
    const contenidoTablaForm = "listarForm" + codigo;
    const collapseform = "collap" + codigo;
    const mostrar = "mostrar" + codigo;
    const filtros = "filtros" + codigo;
    const nrocol = `row-cols-md-${tipoAlmacenF.nroColumns}`;
    let selectPersonalizado = {};
    console.log(codregistro)
    console.log(tipoAlmacenF)
    //try {
    const iframe = document.querySelector('#iframetemeplate');
    if (!iframe) {
        throw new Error("No se encontró el iframe");
    }

    const fragment = document.createDocumentFragment();

    // Clonar y modificar el template de la cabecera
    const clonTemplate = iframe.contentDocument.getElementById('cabecera-targeta').content.cloneNode(true);
    clonTemplate.querySelector('.confiltro').id = filtros;
    if (codregistro == 1) {
        clonTemplate.querySelector('.btn.btn-primary.new').textContent = "Nuevo Registro";
        clonTemplate.querySelector('.btn.btn-primary.new').dataset.bsTarget = "#" + collapseform;
        clonTemplate.querySelector('.btn.btn-primary.new').id = mostrar;
    }
    else {
        clonTemplate.querySelector('.btn.btn-primary.new').remove();
    }
    /*clonTemplate.querySelector('.new').addEventListener('click', () => {
        cambiarVista('contenedor-cabecera', 'contenedor-formulario');
    });*/
    fragment.appendChild(clonTemplate);

    // Clonar y modificar el template de la tabla
    const clonTabla = iframe.contentDocument.getElementById('tabla-formulario').content.cloneNode(true);
    clonTabla.querySelector('.table-responsive .thead-dark').innerHTML = generarCabeceraHTML(tipoAlmacenF.tableHeader.columns);
    clonTabla.querySelector('tbody').id = contenidoTabla;
    fragment.appendChild(clonTabla);

    // Agregar la fragmento al contenedor de cabecera
    const cabecera = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-cabecera`);

    if (!cabecera) {
        throw new Error("No se encontró el contenedor de cabecera");
    }
    cabecera.appendChild(fragment);

    // Clonar templates del formulario y botones
    const clonFormulario = iframe.contentDocument.getElementById('formulario').content.cloneNode(true);
    const clonBotonesForm = iframe.contentDocument.getElementById('botones-form').content.cloneNode(true);
    const rowContainer = clonFormulario.querySelector('.row');

    clonFormulario.querySelector('form').id = idformulario;
    clonFormulario.querySelector('.collapse.dataform').id = collapseform;
    clonFormulario.querySelector('.nrocol').classList.replace("row-cols-md-1", nrocol);

    // Iterar sobre los campos del formulario y clonar elementos correspondientes
    tipoAlmacenF.fields.forEach(elemento => {
        let clonElemento;

        if (elemento.modelo === "select") {
            clonElemento = clonarElementoSelect(elemento, iframe);
        } else if (elemento.modelo === "select2") {
            const respuesta = clonarElementoSelect2(elemento, iframe);
            clonElemento = respuesta.clonSelect;
            selectPersonalizado[respuesta.titulo] = respuesta.id;
        } else if (elemento.modelo === "text") {
            clonElemento = clonarElementoInput(elemento, iframe);
        } else if (elemento.modelo === "hidden") {
            clonElemento = clonarElementoHidden(elemento, iframe);
        }

        rowContainer.appendChild(clonElemento);
    });

    // Agregar botones clonados al contenedor de formulario
    rowContainer.appendChild(clonBotonesForm);

    if (tipoAlmacenF.tableHeaderForm) {
        // Clonar templates del formulario y botones
        const clonFormulario = iframe.contentDocument.getElementById('formulariosegundario').content.cloneNode(true);
        const clonBotonesForm = iframe.contentDocument.getElementById('botones-form').content.cloneNode(true);
        const rowContainer = clonFormulario.querySelector('.row');

        clonFormulario.querySelector('form').id = idformulario2;
        //clonFormulario.querySelector('.collapse.dataform').id = collapseform;
        //clonFormulario.querySelector('.nrocol').classList.replace("row-cols-md-1", nrocol);

        // Iterar sobre los campos del formulario y clonar elementos correspondientes
        tipoAlmacenF.fields2.forEach(elemento => {
            let clonElemento;

            if (elemento.modelo === "select") {
                clonElemento = clonarElementoSelect(elemento, iframe);
            } else if (elemento.modelo === "select2") {
                const respuesta = clonarElementoSelect2(elemento, iframe);
                clonElemento = respuesta.clonSelect;
                selectPersonalizado[respuesta.titulo] = respuesta.id;
            } else if (elemento.modelo === "text") {
                clonElemento = clonarElementoInput(elemento, iframe);
            } else if (elemento.modelo === "hidden") {
                clonElemento = clonarElementoHidden(elemento, iframe);
            }

            rowContainer.appendChild(clonElemento);
        });
        clonBotonesForm.querySelector('.btn.btn-danger.reset').id = atras;
        rowContainer.appendChild(clonBotonesForm);
        fragment.appendChild(clonFormulario);

        const segundoForm = document.querySelector(`.p-2[data-value="${codigo}"] .card-body .segundario`)
        const clonTablaForm = iframe.contentDocument.getElementById('tabla-formulario').content.cloneNode(true);
        clonTablaForm.querySelector('.table-responsive').classList.add('mt-3');
        clonTablaForm.querySelector('.table-responsive .thead-dark').innerHTML = generarCabeceraHTML(tipoAlmacenF.tableHeaderForm.columns);
        clonTablaForm.querySelector('tbody').id = contenidoTablaForm;
        fragment.appendChild(clonTablaForm);
        segundoForm.appendChild(fragment);
    }

    fragment.appendChild(clonFormulario);
    // Agregar fragmento al contenedor de formulario
    const formulario = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario`);
    //const claveformulario = document.querySelector(`.p-2[data-value="${codigo}"] .card-body #contenedor-formulario form #ver`).value;
    if (!formulario) {
        throw new Error("No se encontró el formulario");
    }
    formulario.appendChild(fragment);
    const respuesta = {
        estado: "exito",
        formulario: idformulario,
        formulario2: idformulario2,
        atras: atras,
        tablacontenido: contenidoTabla,
        tablacontenido2: contenidoTablaForm,
        collap: collapseform,
        mostrar: mostrar,
        filtros: filtros,
        selectPer: selectPersonalizado
        //clave: claveformulario
    };
    // Devolver mensaje de éxito
    return respuesta;
    //} catch (error) {
    //  console.error("Error al cargar el formulario:", error.message);
    //throw error;  // Puedes omitir esto si no deseas lanzar la excepción
    //}
}

function clonarElementoInput(elemento, iframe) {
    const clonInput = iframe.contentDocument.getElementById('input').content.cloneNode(true);
    const input = clonInput.querySelector('.form-control');

    clonInput.querySelector('.ncol').classList.replace("col-md-12", `col-md-${elemento.tamaño}`);
    input.setAttribute('type', elemento.type);
    input.setAttribute('name', elemento.name);
    input.setAttribute('id', elemento.id);
    input.setAttribute('placeholder', elemento.placeholder);

    if (elemento.disabled === true) {
        input.setAttribute('disabled', 'disabled');
    } else {
        input.removeAttribute('disabled');
    }

    if (elemento.required === true) {
        input.setAttribute('required', 'required');
    } else {
        input.removeAttribute('required');
    }



    const label = clonInput.querySelector('.form-label');
    label.setAttribute('for', elemento.label);
    label.textContent = elemento.titulo;

    return clonInput;
}

function clonarElementoHidden(elemento, iframe) {
    const clonInput = iframe.contentDocument.getElementById('input').content.cloneNode(true);
    const input = clonInput.querySelector('.form-control');

    input.setAttribute('type', elemento.type);
    input.setAttribute('name', elemento.name);
    input.setAttribute('id', elemento.id);
    input.setAttribute('value', elemento.value);

    if (elemento.required === true) {
        input.setAttribute('required', 'required');
    } else {
        input.removeAttribute('required');
    }
    clonInput.querySelector('.form-label').remove();
    clonInput.querySelector('.text-start').style.display = "none";
    return clonInput;
}

function clonarElementoSelect(elemento, iframe) {
    const clonSelect = iframe.contentDocument.getElementById('select').content.cloneNode(true);
    const select = clonSelect.querySelector('.form-select');

    clonSelect.querySelector('.ncol').classList.replace("col-md-12", `col-md-${elemento.tamaño}`);
    select.setAttribute('name', elemento.name);
    select.setAttribute('id', elemento.id);

    if (elemento.required === true) {
        select.setAttribute('required', 'required');
    } else {
        select.removeAttribute('required');
    }

    const label = clonSelect.querySelector('.form-label');
    label.setAttribute('for', elemento.label);
    label.textContent = elemento.titulo;
    console.log(clonSelect)
    return clonSelect;
}

function clonarElementoSelect2(elemento, iframe) {
    const clonSelect = iframe.contentDocument.getElementById('buscador-select').content.cloneNode(true);
    const select = clonSelect.querySelector('.form-control');

    clonSelect.querySelector('.ncol').classList.replace("col-md-12", `col-md-${elemento.tamaño}`);
    select.setAttribute('name', elemento.name);
    select.setAttribute('id', elemento.id);

    if (elemento.required === true) {
        select.setAttribute('required', 'required');
    } else {
        select.removeAttribute('required');
    }

    const label = clonSelect.querySelector('.form-label');
    label.setAttribute('for', elemento.label);
    label.textContent = elemento.titulo;
    clonSelect.querySelector('.opciones').id = elemento.id + elemento.name;
    const id = elemento.id + elemento.name;
    const titulo = elemento.id;

    return { clonSelect, titulo, id };
}

function cambiarVista(contenidoO, contenidoM) {
    const elementoOcultar = document.getElementById(contenidoO);
    const elementoMostrar = document.getElementById(contenidoM);

    elementoOcultar.classList.add('ocultar-animacion');
    elementoOcultar.classList.remove('d-block');
    elementoOcultar.classList.add('d-none');

    elementoMostrar.classList.remove('d-none');
    elementoMostrar.classList.add('d-block');
    elementoMostrar.classList.add('mostrar-animacion');

    setTimeout(() => {
        elementoOcultar.classList.remove('ocultar-animacion');
        elementoMostrar.classList.remove('mostrar-animacion');
    }, 1000);
}