
export function convertirPdf(div){
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();
    const elemento = document.getElementById(div);

    doc.html(elemento,{
        callback: function(pdf){
            pdf.save(`${generarNombreArchivo()}.pdf`);
        },
        x: 15,
        y:15,
        html2canvas: {scale: 0.17}
    })
}
function generarNombreArchivo() {
    const prefijo = 'Control_Calidad';
    const now = new Date();
    const offset = -4; // Bolivia es UTC-4
    now.setHours(now.getHours() + offset);
    
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    const controCalidad = `${prefijo}-${currentDate}-${currentTime}`;

    return controCalidad;
}