import { URL_APIP } from "../../../../lib/services.js";

export async function sendformData2(formData) {
    try {
        const response = await fetch(`${URL_APIP}/api/`, { 
            method: "POST",
            body: formData,
            headers: {
                'Usar-Registro-David': 'true'
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        return data;  
    } catch (error) {
        console.error('Error al enviar los datos de sendform 2:', error);
        throw error;  
    }
}

export async function sendformData(formData) {
    try {
        const response = await fetch(`${URL_APIP}/api/`, { 
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error('Error al enviar los datos de sendform:', error);
        throw error;  
    }
}
