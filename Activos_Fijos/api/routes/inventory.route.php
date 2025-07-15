<?php
    require_once "class/inventory.php";
    require_once "class/fixedAsset.php";
    $object = new Inventory();
    $objectFA = new FixedAsset();

    array_shift($rutas);

    if($method == "GET"){
        // if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "reporte"){
        //     $objectFA->reportInventory($rutas[2]);
        //     return;
        // }
        // if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "reporte-pdf"){
        //     $objectFA->reportInventory($rutas[2], TRUE);
        //     return;
        // }
        if(sizeof($rutas) === 4 && $rutas[0] === "activo-fijo" && $rutas[1] === "qr"){
            $objectFA->getOneInvtID($rutas[2], $rutas[3]);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "qr"){
            $objectFA->getByFAId($rutas[2]);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "estados"){
            $object->getStates($rutas[2]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo"){
            $objectFA->getAllInvtID($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 0){
            $object->getAll();
            return;
        }
    }

    if($method == "POST" && !isset($_POST["_method"])){
        if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "reporte"){
            $objectFA->reportInventory($rutas[2]);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "reporte-pdf"){
            $objectFA->reportInventory($rutas[2], TRUE);
            return;
        }

        if(sizeof($rutas) === 1 && $rutas[0] === "activo-fijo"){
            $object->state();
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
        if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "estados"){
            $object->deleteState($rutas[2]);
            return;
        }
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