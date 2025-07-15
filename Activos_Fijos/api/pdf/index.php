<?php
    array_shift($rutas);

    if($method){
        if(sizeof($rutas) >= 1 && $rutas[0] === "activo-fijo"){
            require_once "class/fixedAsset.php";
            $object = new FixedAsset();

            if (sizeof($rutas) === 2 && $rutas[1] === "generar-cd") {
                $object->selectDepreciation();
                return;
            }
            
            if (sizeof($rutas) === 3 && $rutas[1] === "historial-js") {
                $object->history($rutas[2], null, true);
                return;
            }
            if (sizeof($rutas) === 3 && $rutas[1] === "historial") {
                $object->history($rutas[2]);
                return;
            }
            if (sizeof($rutas) === 3 && $rutas[1] === "historial-baja-js") {
                $object->history($rutas[2], "baja", true);
                return;
            }
            if (sizeof($rutas) === 3 && $rutas[1] === "historial-baja") {
                $object->history($rutas[2], "baja");
                return;
            }

            if (sizeof($rutas) === 2 && $rutas[1] === "depreciacion") {
                $object->selectDepreciation();
                return;
            }
        }
        if(sizeof($rutas) >= 1 && $rutas[0] === "tipo-cambio"){
            if (sizeof($rutas) === 2 && $rutas[1] === "reporte-pdf") {
                $empresa_id = $_SESSION["organizacion"];
                require_once "../db/af_env.php";
                // $url = "https://yofinanciero.com/app/ct/api/listatipodecambio/$empresa_id";
                $url = $AF_ENV["apiUrl"] . "/app/ct/api/listatipodecambio/$empresa_id";
                // Obtenemos los datos de la API
                $data = file_get_contents($url);
                $dataUfv = json_decode($data, true);
                require_once "pdf/filesConfiguration.php";
                $object = new FilesConfiguration();
                $object->reportExchangeRate($dataUfv);
                return;
            }
        }
        
        // if(sizeof($rutas) >= 1 && $rutas[0] === "activo-fijo"){
        //     require_once "pdf/filesFixedAsset.php";
        //     $object = new FixedAsset();

        //     if (sizeof($rutas) === 3 && $rutas[1] === "historial") {
        //         $object->history($rutas[2]);
        //         return;
        //     }
        // }
    }

    $response = [
        "status" => 404,
        "message" => "la ruta '$uri' es incorrecta",
    ];
    echo json_encode($response, http_response_code($response["status"]));
?>