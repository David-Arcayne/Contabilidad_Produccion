<?php
    require_once "class/movement.php";
    require_once "class/movementFA.php";
    $oMFA = new MovementFA();
    $object = new Movement();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 3 && $rutas[0] === "activo-fijo" && $rutas[1] === "individual"){
            $oMFA->getAll($rutas[2], TRUE);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "individual" && $rutas[1] === "mis-activos-js"){
            $object->myAssets(TRUE);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "individual" && $rutas[1] === "mis-activos-pdf"){
            $object->myAssets();
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "reporte" && $rutas[1] === "activo-fijo"){
            require_once "class/fixedAsset.php";
            $oFA = new FixedAsset();
            $oFA->filters(null, true);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "activo-fijo"){
            $oMFA->getAll($rutas[1]);
            return;
        }
        
        if(sizeof($rutas) === 1 && $rutas[0] === "individual"){
            $object->getAllByUser();
            return;
        }
        if(sizeof($rutas) === 0){
            $object->getAll();
            return;
        }
    }
    if ($method == "POST" && !isset($_POST["_method"])) {
        if(sizeof($rutas) === 3 && $rutas[0] === "reporte" && $rutas[1] === "activo-fijo" && $rutas[2] === "reporte"){
            require_once "class/fixedAsset.php";
            $oFA = new FixedAsset();
            $oFA->filters(null, true);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "reporte" && $rutas[1] === "activo-fijo" && $rutas[2] === "reporte-pdf"){
            require_once "class/fixedAsset.php";
            $oFA = new FixedAsset();
            $oFA->filters(true, true);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "reporte-js" && $rutas[1] === "individual"){
            $object->reportMovement($rutas[2], TRUE, TRUE);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "reporte" && $rutas[1] === "individual"){
            $object->reportMovement($rutas[2], TRUE);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "reporte-js"){
            $object->reportMovement($rutas[1], null, TRUE);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "reporte"){
            $object->reportMovement($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "filtro-pdfp"){
            $object->filters(TRUE, TRUE);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "individual" && $rutas[1] === "filtro"){
            $object->filterByUser();
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "individual" && $rutas[1] === "filtro-pdf"){
            $object->filterByUser(TRUE);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "no-solicitados"){
            $object->reportFA();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "filtro-pdf"){
            $object->filters(TRUE);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "filtro"){
            $object->filters();
            return;
        }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>