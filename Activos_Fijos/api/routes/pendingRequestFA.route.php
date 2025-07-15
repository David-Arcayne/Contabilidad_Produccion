<?php
    require_once "class/movementFA.php";
    require_once "class/movement.php";
    require_once "class/fixedAsset.php";
    $object = new MovementFA();

    $objectM = new Movement();
    $oFA = new FixedAsset();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "activos"){
            $oFA->getAllByStatusRequest($rutas[2]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo"){
            $object->getAll($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "menu-notificacion" && $rutas[1] === "datos"){
            $objectM->getDataPendingRequest();
            return;
        }
        if(sizeof($rutas) === 0){
            $objectM->getPendingRequest();
            return;
        }
    }

    if($method == "POST" && !isset($_POST["_method"])){
        if(sizeof($rutas) === 0){
            $object->create();
            return;
        }
    }
    
    if($method == "PUT" || (isset($_POST["_method"]) && $_POST["_method"] === "put")){
        if(sizeof($rutas) === 3 && $rutas[0] === "aceptar-todo"){
            $object->state($rutas[1], $rutas[2], TRUE);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "denegar-todo"){
            $object->state($rutas[1], $rutas[2], TRUE);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "confirmar"){
            $object->state($rutas[1], $rutas[2], "confirmar");
            return;
        }

        if(sizeof($rutas) === 3 && $rutas[0] === "aceptar"){
            $object->state($rutas[1], $rutas[2]);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "denegar"){
            $object->state($rutas[1], $rutas[2]);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "asignar"){
            $object->addFA($rutas[1], $rutas[2]);
            return;
        }
        // if(sizeof($rutas) === 2 && $rutas[0] === "aceptar-todo"){
        //     $object->state($rutas[1], TRUE, TRUE);
        //     return;
        // }
        // if(sizeof($rutas) === 2 && $rutas[0] === "denegar-todo"){
        //     $object->state($rutas[1], FALSE, TRUE);
        //     return;
        // }
        // if(sizeof($rutas) === 2 && $rutas[0] === "confirmar"){
        //     $object->state($rutas[1], TRUE, "confirmar");
        //     return;
        // }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>