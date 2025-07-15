<?php
    require_once "class/depreciation.php";
    $object = new Depreciation();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 0){
            $object->getOne();
            return;
        }
    }

    if($method == "POST" && !isset($_POST["_method"])){
        if(sizeof($rutas) === 0){
            $object->create();
            return;
        }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>