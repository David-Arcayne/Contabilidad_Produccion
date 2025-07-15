<?php
    require_once "class/inventoryFA.php";
    $object = new InventoryFA();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 2 && $rutas[0] === "menu-notificacion" && $rutas[1] === "bajas"){
            $object->getObservation();
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "menu-notificacion" && $rutas[1] === "situacion"){
            $object->getNotification(3);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "lista-notificaciones" && $rutas[1] === "situacion"){
            $object->getAllNotifications(3);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "lista-notificaciones" && $rutas[1] === "bajas"){
            $object->getAllNotifications(2);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "lista-asignados"){
            $object->getAssignedByFAId($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "lista-notificaciones"){
            $object->getByFAId($rutas[1]);
            return;
        }
        // if(sizeof($rutas) === 1 && $rutas[0] === "activos"){
        //     $object->getAllEnabled();
        //     return;
        // }
        // if(sizeof($rutas) === 1){
        //     $object->getById($rutas[0]);
        //     return;
        // }
        // if(sizeof($rutas) === 0){
        //     $object->getAll();
        //     return;
        // }
    }

    // if($method == "POST" && !isset($_POST["_method"])){
    //     if(sizeof($rutas) === 0){
    //         $object->create();
    //         return;
    //     }
    // }
    
    if($method == "PUT" || (isset($_POST["_method"]) && $_POST["_method"] === "put")){
        if(sizeof($rutas) === 2 && $rutas[0] === "cambiar-accion"){
            $object->editAction($rutas[1]);
            return;
        }
    }

    // if($method == "DELETE"){
    //     if(sizeof($rutas) === 1){
    //         $object->delete($rutas[0]);
    //         return;
    //     }
    // }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>