export function crearModal2({ code, id, header, body, footerButtons = [] }) {

    // Seleccionar el contenedor principal donde se mostrará el modal
    const app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    app.style.position = 'relative';

    // Crear una superposición de fondo oscurecido
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer';
    app.appendChild(overlay);

    // Crear el contenedor principal del modal
    const variable = document.createElement('div');
    variable.style.width = '1000px';
    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    overlay.appendChild(variable);

    // Asegurar que no haya duplicados
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    // Crear la estructura HTML del modal
    variable.innerHTML = `
        <div class="modal-header">
            <h5 class="modal-title">${header}</h5>
            <button type="button" class="btn-close cerrar" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            ${body}
        </div>
        <div class="modal-footer">
            ${footerButtons.map(button => `
                <button type="button" class="btn ${button.class}" id="${button.id}">
                    ${button.text}
                </button>
            `).join("")}
        </div>
    `;

    // Asignar los manejadores de eventos a los botones del pie de página
    footerButtons.forEach(button => {
        const btnElement = document.getElementById(button.id);
        if (btnElement && button.onClick) {
            btnElement.addEventListener("click", button.onClick);
        }
    });

    // Agregar función para cerrar el modal
    overlay.addEventListener('click', (event) => {
        if (event.target.classList.contains('cerrar') || event.target === overlay) {
            cerrarModal();
        }
    });

    function cerrarModal() {
        overlay.remove(); 
        app.style.removeProperty('position');
    }

    // Retornar directamente el overlay que contiene el modal
    return overlay;
}






















export function crearModal({code, id, header, body, footerButtons = [] }) {
    console.log(code);
    const app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    app.style.position = 'relative';
    // Crear el overlay (fondo oscuro)
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer'; // Para cerrar al hacer clic en el fondo
    app.appendChild(overlay);
    // Crear el contenedor del modal
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    modalContent.style.maxWidth = '800px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.position = 'relative';

    // Estructura del modal
    modalContent.innerHTML = `
        <div class="modal-header">
            <h5 class="modal-title">${header}</h5>
            <button type="button" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-footer">
            ${footerButtons.map(button => `
                <button type="button" class="btn ${button.class}" id="${button.id}">
                    ${button.text}
                </button>
            `).join('')}
        </div>
    `;

    // Insertar el modal en el overlay
    overlay.appendChild(modalContent);
    

    // Cerrar el modal al hacer clic en el fondo o en el botón de cerrar
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.classList.contains('btn-close')) {
            cerrarModal();
        }
    });

    // Asignar eventos a los botones
    footerButtons.forEach(button => {
        const btnElement = document.getElementById(button.id);
        if (btnElement && button.onClick) {
            btnElement.addEventListener('click', button.onClick);
        }
    });

    // Función para cerrar el modal
    function cerrarModal() {
        overlay.remove();
        app.style.removeProperty('position');
    }

    return overlay; // Devolver el overlay para tener acceso a él si es necesario
}
