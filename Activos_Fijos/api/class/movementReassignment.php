<?php

class MovementReassignment
{
    private $db;
    private $db_rh;
    private $db_em;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "movimientoactivos"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    private function connectionDB ($type = NULL) {
        if ($type == "rh") {
            $this->db_rh = new DBConnection("rrhh");
        } else if ($type == "em") {
            $this->db_em = new DBConnection("empresa"); 
        } else {
            $this->db_rh = new DBConnection("rrhh");
            $this->db_em = new DBConnection("empresa"); 
        }
    }

    private function mySubQuery ($sq) {

        $idm = "SELECT id FROM movimientos WHERE empresa_id = '$this->empresa_id' AND id = $this->t_name.movimientos_id";
        $nfa = "SELECT nombre FROM activosfijos WHERE id = $this->t_name.activosfijos_id";
        $dfa = "SELECT detalle FROM activosfijos WHERE id = $this->t_name.activosfijos_id";
        $sm = "SELECT estado FROM movimientos WHERE id = $this->t_name.movimientos_id";

        $list = [
            "id_movimientos" => "($idm)", 
            "nombre_activofijo" => "($nfa) as nombreactivofijo", 
            "detalle_activofijo" => "($dfa) as detalleactivofijo", 
            "estado_movimiento" => "($sm) as estadomovimiento", 
        ];

        return $list[$sq];
    }

    public function getAllFA($mov_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($mov_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }
        
        try {
            
            $movement_id = $this->mySubQuery("id_movimientos");
            $fa_name = $this->mySubQuery("nombre_activofijo");
            $fa_detail = $this->mySubQuery("detalle_activofijo");
            $movement_state = $this->mySubQuery("estado_movimiento");
                        
            $query_movaf = $this->db->prepare("SELECT *, $fa_name, $fa_detail, $movement_state FROM $this->t_name WHERE movimientos_id = $mov_id AND movimientos_id = $movement_id ORDER BY $this->col_id DESC");
            $query_movaf->execute();
            $dataMov =  $query_movaf->get_result();

            $data = $this->db->all($dataMov, MYSQLI_ASSOC);

            if ($this->db->rows($dataMov) > 0) {
                $array_idbo = array();
                $array_idarea = array();
                $array_idworker = array();
                foreach ($data as $key => $mov) {
                    if (!empty($mov["sucursal_id"])) {
                        $array_idbo[$mov["sucursal_id"]] = true;
                    }
                    if (!empty($mov["sucursal_destino"])) {
                        $array_idbo[$mov["sucursal_destino"]] = true;
                    }
                    if (!empty($mov["area_id"])) {
                        $array_idarea[$mov["area_id"]] = true;
                    }
                    if (!empty($mov["area_destino"])) {
                        $array_idarea[$mov["area_destino"]] = true;
                    }
                    if (!empty($mov["trabajador_id"])) {
                        $array_idworker[$mov["trabajador_id"]] = true;
                    }
                    if (!empty($mov["trabajador_destino"])) {
                        $array_idworker[$mov["trabajador_destino"]] = true;
                    }
                }
                $array_idbo = array_keys($array_idbo);
                $array_idarea = array_keys($array_idarea);
                $array_idworker = array_keys($array_idworker);
                $string_idbo = implode(", ", $array_idbo);
                $string_idarea = implode(", ", $array_idarea);
                $string_idworker = implode(", ", $array_idworker);
    
                $this->connectionDB();
    
                $query_area=$this->db_rh->prepare("SELECT idareas, nombre FROM areas WHERE idareas IN ($string_idarea)");
                $query_area->execute();
                $result_a =  $query_area->get_result();
                $array_area = array();
                while ($area = $this->db_rh->assoc($result_a)) {
                    $array_area[$area["idareas"]] = $area["nombre"];
                }

                $query_bo=$this->db_em->prepare("SELECT idsucursalcontable, nombre FROM sucursalcontable WHERE idsucursalcontable IN ($string_idbo)");
                $query_bo->execute();
                $result_bo =  $query_bo->get_result();
                $array_bo = array();
                while ($bo = $this->db_rh->assoc($result_bo)) {
                    $array_bo[$bo["idsucursalcontable"]] = $bo["nombre"];
                }

                $quer_trabajador=$this->db_rh->prepare("SELECT nombre, apellido, idtrabajador FROM trabajador WHERE idtrabajador IN ($string_idworker)");
                $quer_trabajador->execute();
                $result_t =  $quer_trabajador->get_result();
                $array_tr = array();
                while ($trabajador = $this->db_rh->assoc($result_t)) {
                    $array_tr[$trabajador["idtrabajador"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                }
    
                foreach ($data as $key => $mov) {
                    if (!empty($mov["trabajador_id"])) {
                        $data[$key]["nombresucursal"] = $array_bo[$mov["sucursal_id"]];
                        $data[$key]["nombrearea"] = $array_area[$mov["area_id"]];
                        $data[$key]["nombretrabajador"] = $array_tr[$mov["trabajador_id"]]; 
                    }

                    if (!empty($mov["trabajador_destino"])) {
                        $data[$key]["nombresucursaldestino"] = $array_bo[$mov["sucursal_destino"]];
                        $data[$key]["nombreareadestino"] = $array_area[$mov["area_destino"]];
                        $data[$key]["nombretrabajadordestino"] = $array_tr[$mov["trabajador_destino"]]; 
                    }
                }
            }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($dataMov),
                "data" => $data,
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al listar $this->t_name",
            ];
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
    public function getMovement(){
        try {
            
            $responsible_id = $_SESSION["yofinanciero"];

            $queryMov=$this->db->prepare("SELECT * FROM movimientos WHERE encargado_id = ? AND empresa_id = '$this->empresa_id' AND estado IN (11, 12) ORDER BY id DESC");
            $queryMov->bind_param("s", $responsible_id);
            $queryMov->execute();
            $dataMov =  $queryMov->get_result();

            $data = $this->db->all($dataMov, MYSQLI_ASSOC);

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($dataMov),
                "data" => $data,
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al listar $this->t_name",
            ];
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function createMovement(){

        $valid = new Validations("movimientos");

        $_POST["empresa_id"] = $this->empresa_id;
        $_POST["encargado_id"] = $_SESSION["yofinanciero"];
        $_POST["estado"] = 11;
        // $_POST["fechasolicitud"] = date("Y-m-d H:i:s");

        $_POST["creado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_creador"] = $_SESSION["yofinanciero"];
        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = [];      

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {
                $insert_columns = implode(", ", array_keys($v_form));
                $value_columns = array_values($v_form);
                $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                $bind_types = str_repeat("s", count($v_form));
    
                $quer=$this->db->prepare("INSERT INTO movimientos ($insert_columns) VALUES ($prepare_marks)");
                $quer->bind_param($bind_types, ...$value_columns);
                $quer->execute();
    
                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $quer->affected_rows, 
                    "id" => $quer->insert_id, 
                    "data" => $v_form
                ];
            } catch (Throwable $th) {
                $this->res = [
                    "status" => 500,
                    "msg_error" => "error al insertar $this->t_name",
                ]; 
            }
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function createMFA(){

        $valid = new Validations($this->t_name);

        if (isset($_POST["trabajador_id"]) && !trim($_POST["trabajador_id"])) {
            unset($_POST["sucursal_id"]);
            unset($_POST["area_id"]);
            unset($_POST["trabajador_id"]);
        } 
        if (isset($_POST["trabajador_destino"]) && !trim($_POST["trabajador_destino"])) {
            unset($_POST["sucursal_destino"]);
            unset($_POST["area_destino"]);
            unset($_POST["trabajador_destino"]);
        }

        $_POST["estado"] = 2;

        $v_form = $valid->getColumsData($_POST);

        
        $error_arr = [];      

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {
                // validar que un activo fijo tenga la cantidad suficiente para solicitar
                if ( isset($_POST["activosfijos_id"]) && trim($_POST["activosfijos_id"]) && isset($_POST["cantidad"]) && trim($_POST["cantidad"]) ){
                    require_once "class/fixedAsset.php";
                    $oFA = new FixedAsset();
                    $qAF;
                    if (isset($_POST["trabajador_id"]) && trim($_POST["sucursal_id"]) && trim($_POST["area_id"])) {
                        $qAF = $oFA->getFAQtt($_POST["activosfijos_id"], $_POST["trabajador_id"]);
                    } else if (isset($_POST["trabajador_destino"]) && trim($_POST["sucursal_destino"]) && trim($_POST["area_destino"])) {
                        $qAF = $oFA->getFAQtt($_POST["activosfijos_id"]);
                    } else {
                        throw new Exception("Error envio de formulario");
                    }
                    if($qAF === FALSE) {
                        throw new Exception("Error al solicitar el activo");
                    } else {
                        $quantity = intval($qAF["cantidadactual"]);
                        if( $quantity < 0 || $quantity < intval($_POST["cantidad"]) ) {
                            throw new Exception("No hay suficientes activos disponibles");
                        }

                    }
                } else {
                    throw new Exception("Error al solicitar el activo:");
                }

                $mov_id = $_POST["movimientos_id"];
                $consulta = $this->db->query("SELECT * FROM movimientos WHERE id = $mov_id AND empresa_id = '$this->empresa_id'");
                $data = $consulta->fetch_assoc();
                if($data && $data["estado"] == 11) {
                    $insert_columns = implode(", ", array_keys($v_form));
                    $value_columns = array_values($v_form);
                    $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                    $bind_types = str_repeat("s", count($v_form));
        
                    $quer=$this->db->prepare("INSERT INTO $this->t_name ($insert_columns) VALUES ($prepare_marks)");
                    $quer->bind_param($bind_types, ...$value_columns);
                    $quer->execute();
        
                    $this->res = [
                        "status" => 200, 
                        "affected_rows" => $quer->affected_rows, 
                        "id" => $quer->insert_id, 
                        "data" => $v_form
                    ];
                } else {
                    $this->res = [
                        "status" => 200, 
                        "affected_rows" => 0, 
                        "id" => null, 
                        "data" => null
                    ];
                }

            } catch (Throwable $th) {
                $this->res = [
                    "status" => 500,
                    "msg_error" => "error al insertar $this->t_name",
                ]; 
            }
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
    
    public function state($movfa_id, $stateRequest){
        $valid = new Validations($this->t_name);

        $_POST["fechaentrega"] = date("Y-m-d H:i:s");
        $valid_id = $valid->isNumber($movfa_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $this->db->begin_transaction();
            
            $state = 1;
            $movement_id = $this->mySubQuery("id_movimientos");

            $quer = "";
            $mov_id = $movfa_id;
            
            // actualiza registrsos de la tabla movimientoactivos
            $quer=$this->db->prepare("UPDATE $this->t_name SET estado = $state WHERE movimientos_id = ? AND estado = 2 AND movimientos_id = $movement_id");
            $quer->bind_param("i", $mov_id);
            $quer->execute();
  
            // actualiza registros de la tabla movimientos
            $queryMV = $this->db->query("SELECT (COALESCE(MAX(cod_comprobante), 0 ) + 1) AS codigocomprobante FROM movimientos WHERE empresa_id = '$this->empresa_id'");
            $dataMV = $queryMV->fetch_assoc();
            $cod_comprobante = $dataMV["codigocomprobante"];
            $deliveryDate = $_POST["fechaentrega"];
            $responseDate = date("Y-m-d H:i:s");
            $this->db->query("UPDATE movimientos SET fecharespuesta = '$responseDate', fechaentrega = '$deliveryDate', estado = $stateRequest, cod_comprobante = $cod_comprobante WHERE id = $mov_id AND empresa_id = '$this->empresa_id'");

            $fecha = date("Y-m-d H:i:s");
            $quer_mov_af=$this->db->prepare(
                "SELECT *, 
                    (SELECT fechaentrega FROM movimientos WHERE id = '$mov_id' ) AS fechaentrega, 
                    (SELECT personal_id FROM movimientos WHERE id = '$mov_id' ) AS personal_id, 
                    (SELECT estado FROM movimientos WHERE id = '$mov_id' ) AS tipo,
                    (SELECT codigo FROM activosfijos WHERE id = $this->t_name.activosfijos_id ) AS codigo
                FROM $this->t_name 
                WHERE movimientos_id = '$mov_id' AND movimientos_id = $movement_id AND estado = 1 AND activosfijos_id IS NOT NULL");
            $quer_mov_af->execute();
            $result_mov_af =  $quer_mov_af->get_result();
            while ($mov_af = $this->db->assoc($result_mov_af)) {
                $af_id =  $mov_af["activosfijos_id"];
                $delivery_date = $mov_af["fechaentrega"];
                $quantity = $mov_af["cantidad"];

                $su_id = $mov_af["sucursal_id"];
                $ar_id = $mov_af["area_id"];
                $tr_id = $mov_af["trabajador_id"];
                $su_id_d = $mov_af["sucursal_destino"];
                $ar_id_d = $mov_af["area_destino"];
                $tr_id_d = $mov_af["trabajador_destino"];

                // realiza el traspaso de activos fijos de una trabajador a otro
                if ($tr_id && $tr_id_d) {
                    $type_mov = 2;
                    $code_af = $mov_af["codigo"] ."-". str_pad($su_id, 3, '0', STR_PAD_LEFT) . str_pad($ar_id, 3, '0', STR_PAD_LEFT) . str_pad($tr_id, 4, '0', STR_PAD_LEFT);
                    
                    $quer_ub_af_dev = $this->db->prepare(
                        "INSERT INTO ubicacionactivo 
                            (creado_en, fecha, activosfijos_id, cantidad, codigo, tipo, sucursal_id, departamento_id, trabajador_id, empresa_id) 
                        VALUES ('$fecha', '$delivery_date', '$af_id', '$quantity', '$code_af', '$type_mov', '$su_id', '$ar_id', '$tr_id', '$this->empresa_id')");
                    $quer_ub_af_dev->execute();

                    $this->db->query(
                        "UPDATE activosinventarios 
                        SET cantidad = cantidad - $quantity 
                        WHERE activosfijos_id = '$af_id' AND cantidad > 0 AND codigo = '$code_af' AND inventarios_id IS NULL
                    ");

                    $type_mov = 1;
                    $code_af = $mov_af["codigo"] ."-". str_pad($su_id_d, 3, '0', STR_PAD_LEFT) . str_pad($ar_id_d, 3, '0', STR_PAD_LEFT) . str_pad($tr_id_d, 4, '0', STR_PAD_LEFT);

                    $quer_ub_af_asig = $this->db->prepare(
                        "INSERT INTO ubicacionactivo
                            (creado_en, fecha, activosfijos_id, cantidad, codigo, tipo, sucursal_id, departamento_id, trabajador_id, empresa_id)
                        VALUES ('$fecha', '$delivery_date', '$af_id', '$quantity', '$code_af', '$type_mov', '$su_id_d', '$ar_id_d', '$tr_id_d', '$this->empresa_id')");
                    $quer_ub_af_asig->execute();

                    $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE activosfijos_id = '$af_id' AND codigo = '$code_af' AND inventarios_id IS NULL");
                    $data_fai = $query_fai->fetch_assoc();
                    if ($data_fai) {
                        $this->db->query(
                            "UPDATE activosinventarios 
                            SET cantidad = cantidad + $quantity 
                            WHERE id = '".$data_fai["id"]."'
                        ");
                    } else {
                        $currentDate = date("Y-m-d H:i:s");
                        $this->db->query("INSERT INTO activosinventarios (creado_en, codigo, cantidad, activosfijos_id, empresa_id, sucursal_id, departamento_id, trabajador_id) VALUES ('$currentDate', '$code_af', '$quantity', '$af_id', '$this->empresa_id', '$su_id_d', '$ar_id_d', '$tr_id_d')");
                    }
                    
                // realiza la devolución de activos fijos de un trabajador
                } else if ($tr_id) {
                    $type_mov = 2;
                    $code_af = $mov_af["codigo"] ."-". str_pad($su_id, 3, '0', STR_PAD_LEFT) . str_pad($ar_id, 3, '0', STR_PAD_LEFT) . str_pad($tr_id, 4, '0', STR_PAD_LEFT);
                    
                    $quer_ub_af_dev = $this->db->prepare(
                        "INSERT INTO ubicacionactivo 
                            (creado_en, fecha, activosfijos_id, cantidad, codigo, tipo, sucursal_id, departamento_id, trabajador_id, empresa_id) 
                        VALUES ('$fecha', '$delivery_date', '$af_id', '$quantity', '$code_af', '$type_mov', '$su_id', '$ar_id', '$tr_id', '$this->empresa_id')");
                    $quer_ub_af_dev->execute();

                    $this->db->query(
                        "UPDATE activosinventarios AS a 
                        INNER JOIN ( 
                            SELECT MIN(id) AS min_id 
                            FROM activosinventarios 
                            WHERE activosfijos_id = '$af_id' AND cantidad >= 0 ) AS sub 
                        ON a.id = sub.min_id SET a.cantidad = a.cantidad + $quantity;");

                    $this->db->query(
                        "UPDATE activosinventarios 
                        SET cantidad = cantidad - $quantity 
                        WHERE activosfijos_id = '$af_id' AND cantidad > 0 AND codigo = '$code_af' AND inventarios_id IS NULL
                    ");
                // realiza la asignación de activos fijos a un trabajador
                } else if ($tr_id_d) {
                    $type_mov = 1;
                    $code_af = $mov_af["codigo"] ."-". str_pad($su_id_d, 3, '0', STR_PAD_LEFT) . str_pad($ar_id_d, 3, '0', STR_PAD_LEFT) . str_pad($tr_id_d, 4, '0', STR_PAD_LEFT);

                    $quer_ub_af_asig = $this->db->prepare(
                        "INSERT INTO ubicacionactivo
                            (creado_en, fecha, activosfijos_id, cantidad, codigo, tipo, sucursal_id, departamento_id, trabajador_id, empresa_id)
                        VALUES ('$fecha', '$delivery_date', '$af_id', '$quantity', '$code_af', '$type_mov', '$su_id_d', '$ar_id_d', '$tr_id_d', '$this->empresa_id')");
                    $quer_ub_af_asig->execute();

                    $this->db->query(
                        "UPDATE activosinventarios AS a 
                        INNER JOIN ( 
                            SELECT MIN(id) AS min_id 
                            FROM activosinventarios 
                            WHERE activosfijos_id = '$af_id' AND cantidad > 0 ) AS sub 
                        ON a.id = sub.min_id SET a.cantidad = a.cantidad - $quantity;");
                    
                    $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE activosfijos_id = '$af_id' AND codigo = '$code_af' AND inventarios_id IS NULL");
                    $data_fai = $query_fai->fetch_assoc();
                    if ($data_fai) {
                        $this->db->query(
                            "UPDATE activosinventarios 
                            SET cantidad = cantidad + $quantity 
                            WHERE id = '".$data_fai["id"]."'
                        ");
                    } else {
                        $currentDate = date("Y-m-d H:i:s");
                        $this->db->query("INSERT INTO activosinventarios (creado_en, codigo, cantidad, activosfijos_id, empresa_id, sucursal_id, departamento_id, trabajador_id) VALUES ('$currentDate', '$code_af', '$quantity', '$af_id', '$this->empresa_id', '$su_id_d', '$ar_id_d', '$tr_id_d')");
                    }
                } else {
                    throw new Exception("Error al realizar el movimiento de activos fijos");
                }
            }

            $this->res = [
                "status" => 200, 
                "affected_rows" => "",
                "id" => $movfa_id,
                "data" => "",
            ];
            $this->db->commit();
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "Error $this->t_name",
            ];
            $this->db->rollback();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function createMovementAuto(){

        $valid = new Validations("movimientos");

        $_POST["empresa_id"] = $this->empresa_id;
        $_POST["encargado_id"] = $_SESSION["yofinanciero"];
        $_POST["estado"] = 11;
        $_POST["creado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_creador"] = $_SESSION["yofinanciero"];

        $v_form = $valid->getColumsData($_POST);
        $error_arr = [];      

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {
                $this->db->begin_transaction();
                $insert_columns = implode(", ", array_keys($v_form));
                $value_columns = array_values($v_form);
                $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                $bind_types = str_repeat("s", count($v_form));
    
                $quer=$this->db->prepare("INSERT INTO movimientos ($insert_columns) VALUES ($prepare_marks)");
                $quer->bind_param($bind_types, ...$value_columns);
                $quer->execute();

                if ($quer->affected_rows > 0) {
                    $POST = [
                        "movimientos_id" => $quer->insert_id,
                        "activosfijos_id" => $_POST["id_af"],
                        "cantidad" => $_POST["obs_cantidad"],
                        "sucursal_id" => $_POST["o_sucursal"],
                        "area_id" => $_POST["o_area"],
                        "trabajador_id" => $_POST["o_trabajador"],
                        "sucursal_destino" => $_POST["d_sucursal"],
                        "area_destino" => $_POST["d_area"],
                        "trabajador_destino" => $_POST["d_trabajador"],
                    ];
                    $resultadoFA = $this->createMFAAuto($POST);
                    if ($resultadoFA === false) {
                        throw new Exception("Error al solicitar el activo");
                    }
                    $obs_id = $_POST["obs_id"];
                    $this->db->query("UPDATE observacionesainventarios SET estado = 8 WHERE id = $obs_id");
                }
    
                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $quer->affected_rows, 
                    "id" => $quer->insert_id, 
                    "data" => $v_form
                ];
                $this->db->commit();
            } catch (Throwable $th) {
                $this->res = [
                    "status" => 500,
                    "msg_error" => "error al insertar $this->t_name",
                ]; 
                $this->db->rollback();
            }
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function createMFAAuto($POST){

        $valid = new Validations($this->t_name);

        if (isset($POST["trabajador_id"]) && !trim($POST["trabajador_id"])) {
            unset($POST["sucursal_id"]);
            unset($POST["area_id"]);
            unset($POST["trabajador_id"]);
        } 
        if (isset($POST["trabajador_destino"]) && !trim($POST["trabajador_destino"])) {
            unset($POST["sucursal_destino"]);
            unset($POST["area_destino"]);
            unset($POST["trabajador_destino"]);
        }

        $POST["estado"] = 2;

        $v_form = $valid->getColumsData($POST);
        $error_arr = [];      

        if($error_arr) {
            return false;
        } else {
            try {
                // validar que un activo fijo tenga la cantidad suficiente para solicitar
                if ( isset($POST["activosfijos_id"]) && trim($POST["activosfijos_id"]) && isset($POST["cantidad"]) && trim($POST["cantidad"]) ){
                    require_once "class/fixedAsset.php";
                    $oFA = new FixedAsset();
                    $qAF;
                    if (isset($POST["trabajador_id"]) && trim($POST["sucursal_id"]) && trim($POST["area_id"])) {
                        $qAF = $oFA->getFAQtt($POST["activosfijos_id"], $POST["trabajador_id"]);
                    } else if (isset($POST["trabajador_destino"]) && trim($POST["sucursal_destino"]) && trim($POST["area_destino"])) {
                        $qAF = $oFA->getFAQtt($POST["activosfijos_id"]);
                    } else {
                        throw new Exception("Error envio de formulario");
                    }
                    if($qAF === FALSE) {
                        throw new Exception("Error al solicitar el activo");
                    } else {
                        $quantity = intval($qAF["cantidadactual"]);
                        if( $quantity < 0 || $quantity < intval($POST["cantidad"]) ) {
                            throw new Exception("No hay suficientes activos disponibles");
                        }
                    }
                } else {
                    throw new Exception("Error al solicitar el activo:");
                }

                $mov_id = $POST["movimientos_id"];
                $consulta = $this->db->query("SELECT * FROM movimientos WHERE id = $mov_id AND empresa_id = '$this->empresa_id'");
                $data = $consulta->fetch_assoc();
                if($data && $data["estado"] == 11) {
                    $insert_columns = implode(", ", array_keys($v_form));
                    $value_columns = array_values($v_form);
                    $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                    $bind_types = str_repeat("s", count($v_form));
        
                    $quer=$this->db->prepare("INSERT INTO $this->t_name ($insert_columns) VALUES ($prepare_marks)");
                    $quer->bind_param($bind_types, ...$value_columns);
                    $quer->execute();
                }
                return true;
            } catch (Throwable $th) {
                return false;
            }
        }
    }
}
?>