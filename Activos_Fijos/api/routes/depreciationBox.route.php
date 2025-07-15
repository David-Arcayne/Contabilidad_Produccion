<?php
    require_once "class/depreciationBox.php";
    require_once "class/fixedAsset.php";
    $object = new DepreciationBox();
    $objectFA = new FixedAsset();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo" && $rutas[1] === "mixto"){
            $objectFA->getAllOBName(TRUE);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activo-fijo"){
            $objectFA->getAllOBName();
            return;
        }

        if(sizeof($rutas) === 1){
            $object->getByDate($rutas[0]);
            return;
        }
        if(sizeof($rutas) === 0){
            $object->getAll();
            return;
        }
    }

    if($method == "DELETE"){
        if(sizeof($rutas) === 4){
            $object->delete($rutas[0], $rutas[1], $rutas[2], $rutas[3]);
            return;
        }
        if(sizeof($rutas) === 3){
            $object->delete($rutas[0], $rutas[1], $rutas[2]);
            return;
        }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>