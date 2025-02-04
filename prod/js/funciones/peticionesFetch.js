//Envio de formularios por POST
export function peticionPOST(formulario) {
    return new Promise(async (resolve, reject) => {
        const datos = new FormData(formulario);
        try {
            const response = await fetch(`./api/`, {
                method: "POST",
                body: datos,
            });
            console.log(response.ok)
            if (!response.ok) {
                throw new Error("Error al enviar el formulario");
            }
            const data = await response.json();
            resolve(data); // Resuelve la promesa con los datos de la API
        } catch (error) {
            console.error("Error en la solicitud:", error);
            reject(error); // Rechaza la promesa en caso de error
        }
    });
}

//Maneja todas las consultas GET
export async function peticionGET(apiURL) {
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error('Error en la solicitud de la API');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al recibir datos de la API:', error);
    }
}

//Carga los datos las tablas requeridas
export function llenarDatos(datos, tabla) {
    const idtabla = document.getElementById(tabla);
    idtabla.innerHTML = datos;
}