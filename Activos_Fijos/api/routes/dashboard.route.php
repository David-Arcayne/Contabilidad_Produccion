<?php
    require_once "class/fixedAsset.php";
    $object = new FixedAsset();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 1 && $rutas[0] === "categorias"){
            $object->dashboardCategory();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "adquirido-gestion"){
            $object->dashboardPrice();
            return;
        }
        // if(sizeof($rutas) === 1){
        //     $object->getById($rutas[0]);
        //     return;
        // }
        // if(sizeof($rutas) === 0){
        //     $object->getAll();
        //     return;
        // }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>