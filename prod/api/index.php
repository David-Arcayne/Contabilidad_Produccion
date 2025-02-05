<?php

header('Access-Control-Allow-Origin:*');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method,usar-listado-david,usar-registro-david");
// Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, usar-listado-david

header("Content-Type: application/json; charset=UTF-8");


$method = $_SERVER['REQUEST_METHOD'];


if($method=="GET"){ 
    // Obtener el valor del encabezado 'Usar-Listado-David'
    $usarListadoDavid = filter_var($_SERVER['HTTP_USAR_LISTADO_DAVID'] ?? 'false', FILTER_VALIDATE_BOOLEAN);
    if ($usarListadoDavid) {
       require_once "consultaDavid.php";
   }else{
    require_once "consulta.php";
}
}elseif ($method == "POST") {
    // Obtener el valor del encabezado 'Usar-Registro-David'
    $usarRegistroDavid = filter_var($_SERVER['HTTP_USAR_REGISTRO_DAVID'] ?? 'false', FILTER_VALIDATE_BOOLEAN);
     if ($usarRegistroDavid) {
        require_once "registroDavid.php";
    }else{
    require_once "registro.php";
}
}


?>
