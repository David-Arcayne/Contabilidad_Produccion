import { mostrarNotificacion } from "../funciones/generales.js";
import * as listarFunctions from "../funciones/listar.js"
let ukS = localStorage.getItem("yofinanciero");
let uk = JSON.parse(ukS);

let Lista_tareas_Limpieza = [];
let Lista_limpieza = [];
let Lista_seccion = [];
let listar_tareas_mantenimiento = [];
let Lista_maquinas = [];
let Lista_mantenimiento = [];
async function listar() {
  try {
    const idEmpresa = uk[0].empresa.idempresa;
    const idsucursal = uk[0].empresa.idsucursal;
    // Usamos Promise.all() para ejecutar todas las solicitudes en paralelo
    const resultados = await Promise.all([
        listarFunctions.listar_api_general_verd('listar_tarea_limpieza',idEmpresa),
        listarFunctions.listar_api_general_verd('listar_limpieza_fecha_reciente',idEmpresa),
        listarFunctions.listarseccion(idEmpresa),
        listarFunctions.listar_api_general_verd('listar_tareas_mantenimiento',idEmpresa),
        listarFunctions.listar_api_general('listar_maquina',idEmpresa),
        listarFunctions.listar_api_general_verd('listar_mantenimiento',idEmpresa),
        
      
    ]);
    // Asignamos los resultados a las variables correspondientes

    Lista_tareas_Limpieza = resultados[0];
    Lista_limpieza = resultados[1];
    Lista_seccion = resultados[2];
    listar_tareas_mantenimiento = resultados[3];
    Lista_maquinas = resultados[4];
    Lista_mantenimiento = resultados[5];
    console.log(Lista_tareas_Limpieza, Lista_limpieza, Lista_seccion);
    
  } catch (error) {
    console.error("Error al listar datos: ", error);
    throw error; // Propaga el error para que pueda ser capturado por el .catch() si se usa .then()
  }
}
export async function preparaNotificaciones() {
    await listar();
    let notificaciones = [];
    Lista_limpieza.map(lista => {
        let tarea =  Lista_tareas_Limpieza.find(obj => Number(obj.idtarea_limpieza) === Number(lista.tarea_limpieza_idtarea_limpieza));
        
        let seccion =  Lista_seccion.find(obj => Number(obj.id) === Number(tarea.seccion_idseccion));
        const mensaje = calcularProximoMantenimiento(lista.fecha_inicio,lista.hora_inicio,tarea.frecuencia,tarea.idcontrol_unidad_tiempo);
        const tiempo = 100000;
        let notificacion = 'La tarea ' + tarea.limpieza + ' en seccion '+''+seccion.nombre_seccion + '  la proxima limpieza es en la fecha  ' +mensaje;
            
        notificaciones.push(notificacion);
    })
    Lista_mantenimiento.map(lista => {
        
        let tarea =  listar_tareas_mantenimiento.find(obj => Number(obj.idtareas_mantenimiento) === Number(lista.tareas_mantenimiento_idtareas_mantenimiento));
        let maquina =  Lista_maquinas.find(obj => Number(obj.id) === Number(tarea.maquina_idmaquina));
        const mensaje = calcularProximoMantenimiento(lista.fecha_inicio,lista.hora_inicio,tarea.frecuencia,tarea.idcontrol_unidad_tiempo);
        const tiempo = 100000;
        let notificacion = 'La tarea ' +tarea.mantenimiento + ' en maquina ' +maquina.nombre + ' el proximo mantenimiento es  ' +mensaje;
            
        notificaciones.push(notificacion);
    })
    console.log(notificaciones);
    notificaciones_prueba(notificaciones);
} 
async function verpaginaPRincipal(notificaciones) {
    notificaciones.map(lista => {
        mostrarNotificacion( lista.mensaje,lista.tiempo);
    })
}
export function calcularProximoMantenimiento_2(fechaInicio, horaInicio, frecuencia, unidadTiempo) {
    // Convertir la fecha inicial a objeto Date
    const [anioInicio, mesInicio, diaInicio] = fechaInicio.split('-').map(Number);
    const [horaIn, minutosIn] = horaInicio.split(':').map(Number);
    
    // Crear la fecha con los componentes
    const fecha = new Date(anioInicio, mesInicio - 1, diaInicio, horaIn, minutosIn, 0);
    
    switch (Number(unidadTiempo)) {
        case 1: // Días
            fecha.setDate(fecha.getDate() + frecuencia);
            break;
        case 2: // Semanas
            fecha.setDate(fecha.getDate() + (frecuencia * 7));
            break;
        case 3: // Meses
            // Calcular el nuevo mes y año
            let nuevoMes = fecha.getMonth() + frecuencia;
            let nuevoAnio = fecha.getFullYear();
            
            // Ajustar el año si el nuevo mes excede 11 (diciembre)
            if (nuevoMes > 11) {
                nuevoAnio += Math.floor(nuevoMes / 12);
                nuevoMes = nuevoMes % 12;
            }
            
            // Establecer la nueva fecha
            fecha.setFullYear(nuevoAnio);
            fecha.setMonth(nuevoMes);
            break;
        case 4: // Años
            fecha.setFullYear(fecha.getFullYear() + frecuencia);
            break;
        default:
            throw new Error('Unidad de tiempo no válida. Usa 1 (días), 2 (semanas), 3 (meses) o 4 (años).');
    }
    
    // Formatear la fecha de salida
    const anioSalida = fecha.getFullYear();
    const mesSalida = String(fecha.getMonth() + 1).padStart(2, '0');
    const diaSalida = String(fecha.getDate()).padStart(2, '0');
    const horaSalida = String(fecha.getHours()).padStart(2, '0');
    const minutosSalida = String(fecha.getMinutes()).padStart(2, '0');
    
    return `${anioSalida}-${mesSalida}-${diaSalida} ${horaSalida}:${minutosSalida}`;
}
export function calcularProximoMantenimiento(fechaInicio, horaInicio, frecuencia, unidadTiempo) {
    // Convertir la fecha inicial a objeto Date
    const [anioInicio, mesInicio, diaInicio] = fechaInicio.split('-').map(Number);
    const [horaIn, minutosIn] = horaInicio.split(':').map(Number);
    
    // Crear la fecha con los componentes
    const fecha = new Date(anioInicio, mesInicio - 1, diaInicio, horaIn, minutosIn, 0);
    
    switch (Number(unidadTiempo)) {
        case 1: // Días
            // Para días, multiplicamos la frecuencia por 24 horas
            const horasAgregar = frecuencia * 24;
            fecha.setHours(fecha.getHours() + horasAgregar);
            break;
        case 2: // Semanas
            // Para semanas, convertimos a días (7 * frecuencia) y luego a horas
            const diasAgregar = frecuencia * 7;
            fecha.setHours(fecha.getHours() + (diasAgregar * 24));
            break;
        case 3: // Meses
            // Para meses, calculamos los días aproximados (30.44 días por mes)
            const diasPorMes = 30.44; // Promedio de días en un mes
            const diasTotales = Math.round(frecuencia * diasPorMes);
            fecha.setHours(fecha.getHours() + (diasTotales * 24));
            break;
        case 4: // Años
            // Para años, usamos 365.25 días por año para considerar años bisiestos
            const diasPorAnio = 365.25;
            const diasAnio = Math.round(frecuencia * diasPorAnio);
            fecha.setHours(fecha.getHours() + (diasAnio * 24));
            break;
        default:
            throw new Error('Unidad de tiempo no válida. Usa 1 (días), 2 (semanas), 3 (meses) o 4 (años).');
    }
    
    // Formatear la fecha de salida
    const anioSalida = fecha.getFullYear();
    const mesSalida = String(fecha.getMonth() + 1).padStart(2, '0');
    const diaSalida = String(fecha.getDate()).padStart(2, '0');
    const horaSalida = String(fecha.getHours()).padStart(2, '0');
    const minutosSalida = String(fecha.getMinutes()).padStart(2, '0');
    
    return `${anioSalida}-${mesSalida}-${diaSalida} ${horaSalida}:${minutosSalida}`;
}
function notificaciones_prueba(notifications){
    const bell = document.getElementById('notification-bell');
    const notificationList = document.getElementById('notification-list');
    const notificationCount = document.getElementById('notification-count');

    // Sample notifications
    // const notifications = [
    //     'You have a new message.',
    //     'System update completed.',
    //     'Task deadline approaching.',
    //     'New comment on your post.',
    //     'Reminder: Meeting at 3 PM.'
    // ];

    // Update notification count
    function updateNotificationCount() {
        const count = notifications.length;
        notificationCount.textContent = count;

        // Hide the badge if there are no notifications
        notificationCount.style.display = count > 0 ? 'inline-block' : 'none';
    }

    // Populate notifications
    function loadNotifications() {
        notificationList.innerHTML = ''; // Clear existing notifications

        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.textContent = notification;
            notificationList.appendChild(item);
        });
    }

    // Toggle notification list visibility
    bell.addEventListener('click', () => {
        notificationList.style.display = notificationList.style.display === 'none' ? 'block' : 'none';
    });

    // Close notifications on outside click
    document.addEventListener('click', (event) => {
        if (!bell.contains(event.target) && !notificationList.contains(event.target)) {
            notificationList.style.display = 'none';
        }
    });

    // Initialize
    loadNotifications();
    updateNotificationCount();
}