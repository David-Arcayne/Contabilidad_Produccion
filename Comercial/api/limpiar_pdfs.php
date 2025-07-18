<?php
// Ruta de la carpeta "pdfs"
$directorio = __DIR__ . '/pdfs';
$limiteSegundos = 48 * 60 * 60; // 48 horas en segundos
$ahora = time();
$archivos = scandir($directorio);

foreach ($archivos as $archivo) {
    $rutaArchivo = $directorio . '/' . $archivo;

    // Ignorar "." y ".." y asegurarse que es archivo
    if ($archivo === '.' || $archivo === '..' || !is_file($rutaArchivo)) {
        continue;
    }

    // Verificar fecha de modificación
    $modificado = filemtime($rutaArchivo);

    if (($ahora - $modificado) > $limiteSegundos) {
        unlink($rutaArchivo);
        echo "Eliminado: $archivo<br>";
    }
}
?>
