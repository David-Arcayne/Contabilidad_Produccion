<?php
    require_once "class/history.php";
    $object = new History();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 2 && $rutas[0] === "comprobante-js"){
            $object->ProofSituation($rutas[1], true);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "menu-notificacion" && $rutas[1] === "concluidos"){
            $object->getAvailabilityNotification();
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "buscar-codigo"){
            $object->search($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 1){
            existSession("yofinanciero");
            $object->getById($rutas[0]);
            return;
        }
        if(sizeof($rutas) === 0){
            existSession("yofinanciero");
            $object->getAll();
            return;
        }
    }

    if($method == "POST" && !isset($_POST["_method"])){
        if(sizeof($rutas) === 2 && $rutas[0] === "comprobante"){
            $object->ProofSituation($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 0){
            existSession("yofinanciero");
            $object->create();
            return;
        }
    }

    
    if($method == "PUT" || (isset($_POST["_method"]) && $_POST["_method"] === "put")){
        if(sizeof($rutas) === 1){
            existSession("yofinanciero");
            $object->edit($rutas[0]);
            return;
        }
    }

    if($method == "DELETE"){
        if(sizeof($rutas) === 1){
            existSession("yofinanciero");
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