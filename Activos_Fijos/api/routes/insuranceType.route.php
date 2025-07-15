<?php
    require_once "class/insuranceType.php";
    $object = new InsuranceType();
    
    array_shift($rutas);

    if($method == "GET"){
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