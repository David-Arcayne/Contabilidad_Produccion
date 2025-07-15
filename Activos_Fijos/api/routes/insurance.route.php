<?php
    require_once "class/insurance.php";
    require_once "class/fixedAsset.php";
    $object = new Insurance();
    $objectFA = new FixedAsset();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 2 && $rutas[0] === "menu-notificacion" && $rutas[1] === "expirados"){
            $object->getExpired();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activo-fijo"){
            $objectFA->report(null, null, "seguros");
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activos"){
            $object->getAllEnabled();
            return;
        }
        if(sizeof($rutas) === 1){
            $object->getById($rutas[0]);
            return;
        }
        if(sizeof($rutas) === 0){
            $object->getAll();
            return;
        }
    }

    if($method == "POST" && !isset($_POST["_method"])){
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo" && $rutas[1] === "reporte"){
            $objectFA->report(null, null, "seguros");
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo" && $rutas[1] === "reporte-pdf"){
            $objectFA->report(TRUE, null, "seguros");
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "reporte"){
            $object->getAvailable();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "reporte-pdf"){
            $object->getAvailable(TRUE);
            return;
        }
        if(sizeof($rutas) === 0){
            $object->create();
            return;
        }
    }
    
    if($method == "PUT" || (isset($_POST["_method"]) && $_POST["_method"] === "put")){
        if(sizeof($rutas) === 1){
            $object->edit($rutas[0]);
            return;
        }
    }

    if($method == "DELETE"){
        if(sizeof($rutas) === 1){
            $object->delete($rutas[0]);
            return;
        }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>
