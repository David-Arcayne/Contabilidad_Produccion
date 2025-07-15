import { menuPrincipal } from "./menu/menu.js";

document.addEventListener('DOMContentLoaded', async () => {
    const iframe = document.getElementById('iframetemeplate');
    var iframeWindow = iframe.contentWindow;

    if (iframeWindow.document.readyState === "complete") {
        let elemento = iframe.contentDocument.getElementById('nombre-opcion');
        if (elemento) {
            verificarLocalStorageYNavegar();
        } else {
            iframeWindow.addEventListener("load", function () {
                verificarLocalStorageYNavegar();
            });
        }
    } else {
        iframeWindow.addEventListener("load", function () {
            verificarLocalStorageYNavegar();
        });
    }
});

function verificarLocalStorageYNavegar() {
    const yofinancieromenu = localStorage.getItem('yofinancieromenu');
    const yofinanciero = localStorage.getItem('yofinanciero');

    if (yofinancieromenu !== null && yofinanciero !== null) {
        menuPrincipal();
    } else if (yofinanciero === null) {
        localStorage.clear();
        redirigirA('../../app/');
    } else {
        redirigirA('../dashboard');
    }
}

function redirigirA(url) {
    window.location.assign(url);
}
