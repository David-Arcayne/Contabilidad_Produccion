function cerrarModal(overlay, app) {
    overlay.remove();
    app.style.removeProperty('position');
}

export function crearModal({ code, id, header, body, footerButtons = [] }) {
    const app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    app.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '150%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer';
    app.appendChild(overlay);
    const variable = document.createElement('div');
    variable.classList.add('modal-content');
    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.maxHeight = '500px';
    variable.style.maxWidth = '800px';
    variable.style.overflowY = 'auto';
    variable.style.borderRadius = '8px';
    overlay.appendChild(variable);

    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

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

    footerButtons.forEach(button => {
        const btnElement = document.getElementById(button.id);
        if (btnElement && button.onClick) {
            btnElement.addEventListener("click", () => {
                button.onClick();
                if (button.dismiss) {
                    cerrarModal(overlay, app); // Llamar a cerrarModal después
                }
            });
        }
    });

    overlay.addEventListener('click', (event) => {
        if (event.target.classList.contains('cerrar') || event.target === overlay) {
            cerrarModal(overlay, app);
        }
    });

    return overlay;
}

export function crearModalSoS({ code,type,x,y, id, header, body, footerButtons = [] }) {
    const app = document.querySelector(`.p-2[data-value="${code}"] .card-body`);
    app.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '150%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.cursor = 'pointer';
    app.appendChild(overlay);
    const variable = document.createElement('div');
    variable.classList.add('modal-content');
    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.maxHeight = y;
    variable.style.maxWidth = x;
    variable.style.overflowY = 'auto';
    variable.style.borderRadius = '8px';
    overlay.appendChild(variable);

    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    variable.innerHTML = `
        <div class="modal-header">
            ${header}
            
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

    footerButtons.forEach(button => {
        const btnElement = document.getElementById(button.id);
        if (btnElement && button.onClick) {
            btnElement.addEventListener("click", () => {
                button.onClick();
                if (button.dismiss) {
                    cerrarModal(overlay, app); // Llamar a cerrarModal después
                }
            });
        }
    });

    overlay.addEventListener('click', (event) => {
        if(type){
            if (event.target.classList.contains('cerrar') || event.target === overlay) {
                cerrarModal(overlay, app);
            }
        }
        
    });

    return overlay;
}

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
    variable.classList.add('modal-content');
    
    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    variable.style.borderRadius = '8px';
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


export function crearModalPasos({ code, id, header, steps, footerButtons = [] }) {

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
    variable.classList.add('modal-content');
    
    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    variable.style.borderRadius = '8px';
    overlay.appendChild(variable);

    // Asegurar que no haya duplicados
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    // Inicializar el índice de pasos
    let currentStep = 0;

    // Crear la estructura HTML del modal
    const renderStepContent = () => {
        const stepContent = steps[currentStep];
        variable.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">${header}</h5>
                <button type="button" class="btn-close cerrar" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ${stepContent}
            </div>
            <div class="modal-footer">
                ${footerButtons.map(button => `
                    <button type="button" class="btn ${button.class}" id="${button.id}">
                        ${button.text}
                    </button>
                `).join("")}
                <button type="button" class="btn btn-secondary" id="prevBtn" ${currentStep === 0 ? 'disabled' : ''}>Anterior</button>
                <button type="button" class="btn btn-primary" id="nextBtn">${currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
            </div>
        `;

        // Agregar funcionalidad a los botones de navegación entre pasos
        document.getElementById('prevBtn').addEventListener('click', () => changeStep(-1));
        document.getElementById('nextBtn').addEventListener('click', () => changeStep(1));

        // Asignar los manejadores de eventos a los botones personalizados en footerButtons
        footerButtons.forEach(button => {
            const btnElement = document.getElementById(button.id);
            if (btnElement && button.onClick) {
                btnElement.addEventListener("click", button.onClick);
            }
        });
    };

    // Función para cambiar de paso
    const changeStep = (step) => {
        currentStep += step;
        if (currentStep < 0) currentStep = 0;
        if (currentStep >= steps.length) {
            cerrarModal();
        } else {
            renderStepContent();
        }
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        overlay.remove();
        app.style.removeProperty('position');
    };

    // Asignar evento para cerrar el modal al hacer clic en el fondo o en el botón de cierre
    overlay.addEventListener('click', (event) => {
        if (event.target.classList.contains('cerrar') || event.target === overlay) {
            cerrarModal();
        }
    });

    // Renderizar el primer paso
    renderStepContent();

    // Retornar directamente el overlay que contiene el modal
    return overlay;
}



export function crearModalPasos_({ code, id, header, steps, footerButtons = [] }) {
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
    variable.classList.add('modal-content');
    
    variable.style.backgroundColor = 'white';
    variable.style.padding = '20px';
    variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    variable.style.zIndex = '1001';
    variable.style.position = 'relative';
    variable.style.maxHeight = '680px';
    variable.style.overflowY = 'auto';
    variable.style.borderRadius = '8px';
    overlay.appendChild(variable);

    // Asegurar que no haya duplicados
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    // Inicializar el índice de pasos y estado de validación
    let currentStep = 0;
    let stepsValidation = new Array(steps.length).fill(false);

    // Crear la estructura HTML del modal
    const renderStepContent = () => {
        const stepContent = steps[currentStep];
        
        // Verificar si el paso actual tiene contenido y validación
        const { content, validation } = typeof stepContent === 'object' ? 
            stepContent : { content: stepContent, validation: null };

        variable.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">${header}</h5>
                <button type="button" class="btn-close cerrar" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ${content}
                ${!stepsValidation[currentStep] ? 
                    '<div class="text-danger mt-2">* Completa la acción requerida para continuar</div>' : 
                    '<div class="text-success mt-2">✓ Acción completada</div>'
                }
            </div>
            <div class="modal-footer">
                ${footerButtons.map(button => `
                    <button type="button" class="btn ${button.class}" id="${button.id}">
                        ${button.text}
                    </button>
                `).join("")}
                <button type="button" class="btn btn-secondary" id="prevBtn" ${currentStep === 0 ? 'disabled' : ''}>Anterior</button>
                <button type="button" class="btn btn-primary" id="nextBtn" ${!stepsValidation[currentStep] ? 'disabled' : ''}>
                    ${currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
        `;

        // Agregar funcionalidad a los botones de navegación entre pasos
        document.getElementById('prevBtn').addEventListener('click', () => changeStep(-1));
        document.getElementById('nextBtn').addEventListener('click', () => changeStep(1));

        // Asignar los manejadores de eventos a los botones personalizados en footerButtons
        footerButtons.forEach(button => {
            const btnElement = document.getElementById(button.id);
            if (btnElement && button.onClick) {
                btnElement.addEventListener("click", button.onClick);
            }
        });

        // Si hay una función de validación para este paso, ejecutarla
        if (validation) {
            validation(variable, (isValid) => {
                stepsValidation[currentStep] = isValid;
                const nextBtn = document.getElementById('nextBtn');
                if (nextBtn) {
                    nextBtn.disabled = !isValid;
                }
                renderStepContent(); // Re-renderizar para mostrar el estado actualizado
            });
        } else {
            // Si no hay validación, marcar el paso como completado automáticamente
            stepsValidation[currentStep] = true;
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        }
    };

    // Función para cambiar de paso
    const changeStep = (step) => {
        currentStep += step;
        if (currentStep < 0) currentStep = 0;
        if (currentStep >= steps.length) {
            cerrarModal();
        } else {
            renderStepContent();
        }
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        overlay.remove();
        app.style.removeProperty('position');
    };

    // Asignar evento para cerrar el modal al hacer clic en el fondo o en el botón de cierre
    overlay.addEventListener('click', (event) => {
        if (event.target.classList.contains('cerrar') || event.target === overlay) {
            cerrarModal();
        }
    });

    // Renderizar el primer paso
    renderStepContent();

    // Retornar directamente el overlay que contiene el modal
    return overlay;
}