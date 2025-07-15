<?php
    require_once "class/fixedAsset.php";
    require_once "class/image.php";
    $object = new FixedAsset();
    $image = new Images();

    array_shift($rutas);

    if($method == "GET"){
        if(sizeof($rutas) === 2 && $rutas[0] === "bajas"){
            $object->report(null, $rutas[1]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "habilitados"){
            $object->getAllEnabled($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "depreciacion"){
            $object->getAllNotInDpr();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activos-inv-dpr"){
            $object->getAllByStatus(null, true);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activos-inv"){
            $object->getAllByStatus(true);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activos-inv-unitarios"){
            $object->getAllByStatus(true, null, true);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "activos"){
            $object->getAllByStatus();
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "af-bajas"){
            $object->getUnsubscribe($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "imagenes"){
            $image->getImagesById($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "buscar"){
            $object->search($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "ver-estado"){
            $object->getStatesInv($rutas[1]);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "reporte"){
            $object->report();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "export-excel"){
            $object->exportExcel();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "formato-excel"){
            $object->excelFormat();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "reporte-pdf"){
            $object->report(TRUE);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "vista-reporte"){
            $object->getAllFAs();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "bajas"){
            $object->report();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "habilitados"){
            $object->getAllEnabled();
            return;
        }
        if(sizeof($rutas) === 1){
            $object->getById($rutas[0]);
            return;
        }
        if(sizeof($rutas) === 4 && $rutas[0] === "por-usuario" && $rutas[2] === "trabajador"){
            $object->getById($rutas[1], $rutas[3], TRUE);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "por-usuario"){
            $object->getById($rutas[1], $rutas[2]);
            return;
        }
        if(sizeof($rutas) === 0){
            $object->getAll();
            return;
        }
    }

    if($method == "POST" && !isset($_POST["_method"])){
        if(sizeof($rutas) === 3 && $rutas[0] === "altas" && $rutas[1] === "reporte"){
            $object->report(null, $rutas[2], "altas");
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "altas" && $rutas[1] === "reporte-pdf"){
            $object->report(TRUE, $rutas[2], "altas");
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "bajas" && $rutas[1] === "reporte"){
            $object->report(null, $rutas[2]);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "bajas" && $rutas[1] === "reporte-pdf"){
            $object->report(TRUE, $rutas[2]);
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "altas" && $rutas[1] === "reporte"){
            $object->report(null, null, "altas");
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "altas" && $rutas[1] === "reporte-pdf"){
            $object->report(TRUE, null, "altas");
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "bajas" && $rutas[1] === "reporte"){
            $object->report();
            return;
        }
        if(sizeof($rutas) === 2 && $rutas[0] === "bajas" && $rutas[1] === "reporte-pdf"){
            $object->report(TRUE);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "filtros"){
            $object->filters(null, null, TRUE);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "filtros-pdf"){
            $object->filters(TRUE, null, TRUE);
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "import-excel"){
            $object->importExcel();
            return;
        }
        if(sizeof($rutas) === 0){
            $object->create();
            return;
        }
        if(sizeof($rutas) === 1 && $rutas[0] === "imagenes"){
            $image->createImage();
            return;
        }
    }
    
    if($method == "PUT" || (isset($_POST["_method"]) && $_POST["_method"] === "put")){
        if(sizeof($rutas) === 3 && $rutas[0] === "bajas" && $rutas[1] === "activar-baja"){
            $object->stateUnsubscribe($rutas[2]);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "bajas" && $rutas[1] === "activar"){
            $object->state($rutas[2], true);
            return;
        }
        if(sizeof($rutas) === 3 && $rutas[0] === "bajas" && $rutas[1] === "desactivar"){
            $object->state($rutas[2]);
            return;
        }
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

        if(sizeof($rutas) === 2 && $rutas[0] === "imagen"){
            $image->deleteImagen($rutas[1]);
            return;
        }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>