<?php
    require_once "class/movement.php";
    require_once "class/movementFA.php";
    require_once "class/movementReassignment.php";
    $object = new MovementReassignment();
    $oM = new Movement();
    $oMFA = new MovementFA();

    array_shift($rutas);

    if($method == "GET"){   
        if(sizeof($rutas) === 3 && $rutas[0] === "comprobante-js"){
            $oMFA->ProofRequest($rutas[1], $rutas[2], true);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "comprobante"){
            $oMFA->ProofRequest($rutas[1], $rutas[2]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo"){
            $object->getAllFA($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 0){
            $object->getMovement();
            return;
        }
    }
    if ($method == "POST" && !isset($_POST["_method"])) {
        if(sizeof($rutas) === 1 && $rutas[0] === "registro-automatico"){
            $object->createMovementAuto();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activo-fijo"){
            $object->createMFA();
            return;
        }
        if(sizeof($rutas) === 0){
            $object->createMovement();
            return;
        }
    }
    if($method == "PUT" || (isset($_POST["_method"]) && $_POST["_method"] === "put")){
        if(sizeof($rutas) === 3 && $rutas[0] === "aceptar-todo"){
            $object->state($rutas[1], $rutas[2]);
            return;
        }
        if(sizeof($rutas) === 1){
            $oM->edit($rutas[0]);
            return;
        }
    }
    if($method == "DELETE"){
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo"){
            $oMFA->delete($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 1){
            $oM->delete($rutas[0]);
            return;
        }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>