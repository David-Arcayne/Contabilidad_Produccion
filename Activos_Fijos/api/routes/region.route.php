<?php
    require_once "class/externalApi/region.php";
    $object = new Region();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 1 && $rutas[0] === "activos"){
            $object->getAllEnabled();
            return;
        }
        if(sizeof($rutas) === 0){
            $object->getAll();
            return;
        }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>