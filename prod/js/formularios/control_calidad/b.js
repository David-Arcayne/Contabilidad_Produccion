function configurarSelect(idSelectBox, idSelectOptions, idSelectionInfo) {
    const selectBox = document.getElementById(idSelectBox);
    const selectOptions = document.getElementById(idSelectOptions);
    const selectionInfo = document.getElementById(idSelectionInfo);
    let selectedOptions = [];

    selectBox.addEventListener('click', function() {
        selectOptions.style.display = selectOptions.style.display === 'block' ? 'none' : 'block';
    });

    selectOptions.addEventListener('click', function(event) {
        const clickedOption = event.target;

        if (clickedOption.tagName === 'DIV') {
            const optionValue = clickedOption.getAttribute('data-value');
            const optionText = clickedOption.textContent;

            const optionIndex = selectedOptions.findIndex(option => option.value === optionValue);

            if (optionIndex === -1) {
                selectedOptions.push({
                    value: optionValue,
                    text: optionText
                });
                clickedOption.classList.add('selected');
            } else {
                selectedOptions.splice(optionIndex, 1);
                clickedOption.classList.remove('selected');
            }

            updateSelectionInfo();
        }
    });

    function updateSelectionInfo() {
        const totalOptions = document.querySelectorAll(`#${idSelectOptions} div`).length;
        selectionInfo.textContent = `${selectedOptions.length} de ${totalOptions} características seleccionadas`;
    }

    document.addEventListener('click', function(event) {
        if (!selectBox.contains(event.target) && !selectOptions.contains(event.target)) {
            selectOptions.style.display = 'none';
        }
    });

    return selectedOptions; // Devolver la lista de opciones seleccionadas para usar después
}

// Configurar ambos selects
let selectedOptions1 = configurarSelect('selectBox1', 'caracteristicas_idcaracteristicas1', 'selection-info1');
let selectedOptions2 = configurarSelect('selectBox2', 'caracteristicas_idcaracteristicas2', 'selection-info2');

// Ejemplo para el botón de generar formulario
document.getElementById('generar_formulario1').addEventListener('click', function() {
    if (selectedOptions1.length > 0) {
        generarFormulario(selectedOptions1, 'caracteristicas1'); // Generar el formulario para el primer select
    }
});

document.getElementById('generar_formulario2').addEventListener('click', function() {
    if (selectedOptions2.length > 0) {
        generarFormulario(selectedOptions2, 'caracteristicas2'); // Generar el formulario para el segundo select
    }
});

function generarFormulario(selectedOptions, idFormulario) {
    const areaform = document.getElementById(idFormulario);
    let view = "", ind = 1;

    selectedOptions.forEach(option => {
        view += `
            <div class="row">
                <input type="hidden" class="form-control" name="id${ind}" value="${option.value}" required>
                <div class="col-md-3">
                    <label for="caracteristica${ind}" class="form-label fw-bold fs-6 mt-3">${option.text}</label>
                </div>
                <div class="col-md-3 mt-2">
                    <input type="number" class="form-control" name="evaluacion${ind}" placeholder="Evaluación" required>
                </div>
                <div class="col-md-6 mt-2">
                    <input type="text" class="form-control" name="detalle${ind}" placeholder="Ingrese detalles" required>
                </div>
            </div>
        `;
        ind++;
    });

    areaform.innerHTML = view;
}



const modalCargando = document.getElementById('modalCargando');
    const spinner = document.getElementById('spinner');
    const mensajeCargando = document.getElementById('mensajeCargando');
    const contenido = document.getElementById('contenido');
    function tareaQueTarda() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('Operación completada');
            }, 3000); // 3 segundos de espera
        });
    }
    modalCargando.style.display = 'flex';
    spinner.style.display = 'block';
    mensajeCargando.style.display = 'block';
    contenido.style.display = 'none'; // Ocultar el contenido hasta que cargue

    try {
        // Simular la tarea que tarda
        await tareaQueTarda();

        // Ocultar el spinner y mensaje de cargando
        spinner.style.display = 'none';
        mensajeCargando.style.display = 'none';

        // Mostrar el contenido cargado
        contenido.style.display = 'block';
    } catch (error) {
        mensajeCargando.textContent = 'Ocurrió un error al cargar los datos';
        spinner.style.display = 'none';
        console.error(error);
    }