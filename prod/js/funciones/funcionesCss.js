export function ocultarElemento(elemento) {
    elemento.classList.add('ocultar-animacion');
    elemento.classList.remove('d-block');
    elemento.classList.add('d-none');
    
    // Eliminar las clases de animación después de un tiempo
    setTimeout(() => {
        elemento.classList.remove('ocultar-animacion');
    }, 500); // Ajusta el tiempo según la duración de tu animación en CSS
}

export function mostrarElemento(elemento) {
    elemento.classList.remove('d-none');
    elemento.classList.add('d-block');
    elemento.classList.add('mostrar-animacion');

    // Eliminar las clases de animación después de un tiempo
    setTimeout(() => {
        elemento.classList.remove('mostrar-animacion');
    }, 500); // Ajusta el tiempo según la duración de tu animación en CSS
}

export function cambiarVista(ocultarId, mostrarId) {
    const elementoOcultar = ocultarId;
    const elementoMostrar = mostrarId;

    // Agregar clases de animación para ocultar el elemento actual
    elementoOcultar.classList.add('ocultar-animacion');
    elementoOcultar.classList.remove('d-block');
    elementoOcultar.classList.add('d-none');

    // Agregar clases de animación para mostrar el nuevo elemento
    elementoMostrar.classList.remove('d-none');
    elementoMostrar.classList.add('d-block');
    elementoMostrar.classList.add('mostrar-animacion');

    // Eliminar las clases de animación después de un tiempo (ajusta según la duración de tu animación)
    setTimeout(() => {
        elementoOcultar.classList.remove('ocultar-animacion');
        elementoMostrar.classList.remove('mostrar-animacion');
    }, 500); // Ajusta el tiempo según la duración de tu animación en CSS
}

export function mostrarCollapse(idcollapse){
    let collapseExample = new bootstrap.Collapse(idcollapse);
    collapseExample.toggle();
}