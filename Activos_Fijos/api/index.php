<?php
    // session_start();
    
    header('Access-Control-Allow-Origin:*');
    header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");

    header("Content-Type: application/json; charset=UTF-8");

    date_default_timezone_set("America/La_Paz");
    
    


    function existSession($name , $error = "Necesita iniciar sesión") {
        // if (!isset($_SESSION[$name]) || !$_SESSION[$name]) {
        //     $response = [
        //         "status" => 401,
        //         "message" => $error,
        //     ];
        //     die (json_encode($response, http_response_code($response["status"]) | JSON_UNESCAPED_UNICODE));
        // }
    }

    if ($_GET["ver"] == "cerrar-sesion") {
        session_unset();
        session_destroy();
        $host  = $_SERVER['HTTP_HOST'];
        header("Location: http://$host/app/af");
        return;
    }

    existSession("organizacion");
    
    // $uri = strtok($_SERVER['REQUEST_URI'], '?');    
    $uri=isset($_GET["ver"]) ? $_GET["ver"] : "";
    if($uri) {
        $uri = strtok($uri, '?');
    } else {
        $response = [
            "message" => "La ruta no existe",
            "route" => ""
        ];
        echo json_encode($response,  http_response_code(404));
        return;
    }

    $rutas = array_filter(explode("/",$uri));
    
    $my_route = implode(",", $rutas); // string

    $method = $_SERVER['REQUEST_METHOD'];
    if (isset($method)) {
        if ($rutas[0] == "iniciar-sesion") {
            $_SESSION["organizacion"] = $_POST["af_idempresa"];
            $_SESSION["yofinanciero"] = $_POST["af_idusuario"];
            $response = [
                "idempresa" => $_SESSION["organizacion"],
                "idusuario" => $_SESSION["yofinanciero"]
            ];
            
            $_SESSION["af_datosempresa"] = json_decode($_POST["af_datosempresa"]);
            $_SESSION["af_datosyofinanciero"] = json_decode($_POST["af_datosyofinanciero"]);
            // echo '<pre>'.print_r($_POST, true).'</pre>';
            // echo '<pre>'.print_r($_SESSION["af_datosyofinanciero"]->area, true).'</pre>';
            
                        
            echo json_encode($response,  http_response_code(200));

            return;
        }
        if ($rutas[0] == "iniciar-tipoinventario") {
            $_SESSION["af_tipoinventario"] = json_decode($_POST["af_tipoinventario"]);
            $response = [
                "usuario" => $_SESSION["af_tipoinventario"]->usuario,
                "tipoinventario" => $_SESSION["af_tipoinventario"]->tipo_inventario,
            ];
                        
            echo json_encode($response,  http_response_code(200));
            return;
        }

        require_once "../db/connection.php";
        require_once "./class/validations.php";
        require_once ('./pdf/pdfFile.php');

        if ($rutas[0] == "categoria") {
            require_once "routes/category.route.php";
            return;
        }
        if ($rutas[0] == "tipo-bien") {
            require_once "routes/assetType.route.php";
            return;
        }
        if ($rutas[0] == "tipo-situacion") {
            require_once "routes/situationType.route.php";
            return;
        }
        if ($rutas[0] == "tipo-baja") {
            require_once "routes/unsubscribeType.route.php";
            return;
        }
        if ($rutas[0] == "tipo-estado") {
            require_once "routes/stateType.route.php";
            return;
        }
        if ($rutas[0] == "tipo-inventario") {
            require_once "routes/inventoryType.route.php";
            return;
        }
        if ($rutas[0] == "tiempo-alertas") {
            require_once "routes/alertTime.route.php";
            return;
        }
        if ($rutas[0] == "tipo-seguro") {
            require_once "routes/insuranceType.route.php";
            return;
        }
        // if ($rutas[0] == "valores-ufv") {
        //     require_once "routes/ufvValues.route.php";
        //     return;
        // }
        // if ($rutas[0] == "departamento") {
        //     require_once "routes/department.route.php";
        //     return;
        // }
        // if ($rutas[0] == "personal") {
        //     require_once "routes/staff.route.php";
        //     return;
        // }
        if ($rutas[0] == "seguros") {
            require_once "routes/insurance.route.php";
            return;
        }
        if ($rutas[0] == "activo-fijo") {
            require_once "routes/fixedAsset.route.php";
            return;
        }
        if ($rutas[0] == "revaluo") {
            require_once "routes/revaluation.route.php";
            return;
        }
        if ($rutas[0] == "depreciacion-activo-fijo") {
            require_once "routes/depreciationAsset.route.php";
            return;
        }
        if ($rutas[0] == "cuadro-depreciacion") {
            require_once "routes/depreciationBox.route.php";
            return;
        }
        if ($rutas[0] == "uso-activofijo") {
            require_once "routes/usageTimeFA.route.php";
            return;
        }
        if ($rutas[0] == "componentes") {
            require_once "routes/component.route.php";
            return;
        }
        if ($rutas[0] == "solicitud-activo") {
            require_once "routes/requestFA.route.php";
            return;
        }
        if ($rutas[0] == "movimientos") {
            require_once "routes/movement.route.php";
            return;
        }
        if ($rutas[0] == "movimientos-admin") {
            require_once "routes/movementAdmin.route.php";
            return;
        }
        if ($rutas[0] == "movimientos-reasignacion") {
            require_once "routes/movementReassignment.route.php";
            return;
        }
        if ($rutas[0] == "solicitud-af-pendiente") {
            require_once "routes/pendingRequestFA.route.php";
            return;
        }
        if ($rutas[0] == "inventarios") {
            require_once "routes/inventory.route.php";
            return;
        }
        if ($rutas[0] == "inventarios-activofijo") {
            require_once "routes/inventoryFA.route.php";
            return;
        }
        if ($rutas[0] == "historial") {
            require_once "routes/history.route.php";
            return;
        }
        if ($rutas[0] == "metodo-depreciacion") {
            require_once "routes/depreciationMethod.route.php";
            return;
        }
        if ($rutas[0] == "pdf") {
            require_once "pdf/index.php";
            return;
        }
        if ($rutas[0] == "dashboard") {
            require_once "routes/dashboard.route.php";
            return;
        }

        if ($rutas[0] == "externo-area") {
            require_once "routes/area.route.php";
            return;
        }
        if ($rutas[0] == "externo-region") {
            require_once "routes/region.route.php";
            return;
        }
        if ($rutas[0] == "externo-sucursal") {
            require_once "routes/branchOffice.route.php";
            return;
        }
        if ($rutas[0] == "externo-encargado") {
            require_once "routes/worker.route.php";
            return;
        }
        if ($rutas[0] == "sugerencias-contabilidad") {
            require_once "routes/shareData.route.php";
            return;
        }

        $response = [
            "message" => "La ruta no existe",
            "route" => $rutas[0]
        ];
        echo json_encode($response, http_response_code(404));
    } else {
        $response = [
            "status" => 400,
            "message" => "No se pudo reconer el método de la petición"
        ];
        echo json_encode($response, http_response_code($response["status"]) | JSON_UNESCAPED_UNICODE);
    }
?>