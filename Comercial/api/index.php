<?php
header('Access-Control-Allow-Origin:*');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header("Content-Type: application/json; charset=UTF-8");
$method = $_SERVER['REQUEST_METHOD'];   
if($method=="GET")
{  
require_once "controladorGet.php"; 
}
if($method=="POST")
{
require_once "controladorPost.php";
}
// Ejecutar limpieza solo si han pasado 24 horas desde la última
$archivoControl = __DIR__ . '/ultima_limpieza.txt';
$ahora = time();

if (!file_exists($archivoControl) || ($ahora - filemtime($archivoControl)) > 86400) {
    file_put_contents($archivoControl, date("Y-m-d H:i:s"), LOCK_EX); // escribe fecha legible
    include_once(__DIR__ . '/limpiar_pdfs.php'); // ejecuta limpieza
}
