<?php

class MovementFA
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

        $cfa = "SELECT codigo FROM activosfijos WHERE id = $this->t_name.activosfijos_id";
        $nc = "SELECT nombre FROM categorias WHERE id  = (SELECT categorias_id FROM activosfijos WHERE id = $this->t_name.activosfijos_id)";

        $list = [
            "id_movimientos" => "($idm)", 
            "nombre_activofijo" => "($nfa) as nombreactivofijo", 
            "detalle_activofijo" => "($dfa) as detalleactivofijo", 
            "estado_movimiento" => "($sm) as estadomovimiento",
            "codigo_activofijo" => "($cfa) as codigoactivofijo",
            "nombre_categoria" => "($nc) as nombrecategoria",
        ];

        return $list[$sq];
    }

    public function getAll($mov_id, $individual = false){
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
            $stateMov = $this->db->query("SELECT estado FROM movimientos WHERE id = $mov_id");
            $dataSM = $stateMov->fetch_assoc();
            $stateMov = $dataSM["estado"];

            $e_query = "ORDER BY nombrecategoria, codigoactivofijo";
            if($individual && $stateMov == 12) {
                $this->connectionDB("rh");
                $usuario = $_SESSION["yofinanciero"];
                $worker_id = $this->db_rh->query("SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$usuario'");
                $data_w = $worker_id->fetch_assoc();
                $wid = $data_w["trabajador_idtrabajador"];
                $e_query = "AND (trabajador_destino = $wid OR trabajador_id = $wid) ORDER BY nombrecategoria, codigoactivofijo";
            }
            if ($stateMov == NULL || $stateMov == 5 || $stateMov == 11) {
                $e_query = "ORDER BY $this->col_id DESC";
            }

            $movement_id = $this->mySubQuery("id_movimientos");
            $fa_name = $this->mySubQuery("nombre_activofijo");
            $fa_detail = $this->mySubQuery("detalle_activofijo");
            $movement_state = $this->mySubQuery("estado_movimiento");
            $fa_code = $this->mySubQuery("codigo_activofijo");
            $c_name = $this->mySubQuery("nombre_categoria");
                        
            $consulta = $this->db->query("SELECT *, $fa_name, $fa_detail, $movement_state, $fa_code, $c_name FROM $this->t_name WHERE movimientos_id = $mov_id AND movimientos_id = $movement_id $e_query");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);

            
            if ($dataSM && $stateMov == 12 && !$individual) {
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
                "rows" => $this->db->rows($consulta),
                "data" => $data,
                "stateMov" => $stateMov,
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al listar $this->t_name",
            ];
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function create(){

        $valid = new Validations($this->t_name);

        if (isset($_POST["nombre"]) && !trim($_POST["nombre"])) unset($_POST["nombre"]); 
        if (isset($_POST["descripcion"]) && !trim($_POST["descripcion"])) unset($_POST["descripcion"]); 
        if (isset($_POST["activosfijos_id"]) && trim($_POST["activosfijos_id"])) {
            unset($_POST["nombre"]);
            unset($_POST["descripcion"]);
        } else {
            unset($_POST["activosfijos_id"]); 
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
                if ( isset($_POST["activosfijos_id"]) && trim($_POST["cantidad"]) ){
                    require_once "class/fixedAsset.php";
                    $oFA = new FixedAsset();
                    $qAF = $oFA->getFAQtt($_POST["activosfijos_id"], (isset($_POST["origen_id"]) ? $_POST["origen_id"] : FALSE));
                    if($qAF === FALSE) {
                        throw new Exception("Error al solicitar el activo");
                    } else {
                        $quantity = intval($qAF["cantidadactual"]);
                        if( $quantity < 0 || $quantity < intval($_POST["cantidad"]) ) {
                            throw new Exception("No hay suficientes activos disponibles");
                        }
    
                    }
                } else if (!isset($_POST["nombre"]) || !trim($_POST["cantidad"])){
                    throw new Exception("Error al solicitar el activo:");
                }
                
                $mov_id = $_POST["movimientos_id"];
                $consulta = $this->db->query("SELECT * FROM movimientos WHERE id = $mov_id AND empresa_id = '$this->empresa_id'");
                $data = $consulta->fetch_assoc();
                if($data && $data["estado"] != 2) {
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

    public function delete($movfa_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($movfa_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $movement_id = $this->mySubQuery("id_movimientos");

            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND movimientos_id = $movement_id");
            $quer->bind_param("i", $movfa_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $movfa_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "Error $this->t_name",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
    
    public function state($movfa_id, $stateRequest, $all = false){
        $valid = new Validations($this->t_name);

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

            $state = ($stateRequest == 1 || $stateRequest == 6) ? 1 : 3;
            $movement_id = $this->mySubQuery("id_movimientos");

            $quer = "";
            if($all) {
                $mov_id = $movfa_id;
                if($all == "confirmar"){ // Confirmar todos los activos que no se han confirmado
                    $quer=$this->db->prepare("UPDATE $this->t_name SET estado = $state WHERE movimientos_id = ? AND estado = 2 AND movimientos_id = $movement_id");
                    $quer->bind_param("i", $mov_id);
                    $quer->execute();
                } else { // Aceptar o denegar todos los activos solicitados
                    $quer=$this->db->prepare("UPDATE $this->t_name SET estado = $state WHERE movimientos_id = ? AND movimientos_id = $movement_id");
                    $quer->bind_param("i", $mov_id);
                    $quer->execute();
                }

                // require_once "class/movement.php";
                // $obj = new Movement();
                // $obj->editState($mov_id, $stateRequest);
                $queryMV = $this->db->query("SELECT (COALESCE(MAX(cod_comprobante), 0 ) + 1) AS codigocomprobante FROM movimientos WHERE empresa_id = '$this->empresa_id'");
                $dataMV = $queryMV->fetch_assoc();
                $cod_comprobante = $dataMV["codigocomprobante"];
                $deliveryDate = $_POST["fechaentrega"];
                $responseDate = date("Y-m-d H:i:s");
                $user = $_SESSION["yofinanciero"];
                $this->db->query("UPDATE movimientos SET fecharespuesta = '$responseDate', fechaentrega = '$deliveryDate', estado = $stateRequest, encargado_id = '$user', cod_comprobante = $cod_comprobante WHERE id = $mov_id AND empresa_id = '$this->empresa_id'");

                $tr_id = $_POST["idtrabajador"];
                $dep_id = $_POST["iddepartamento"];
                $su_id = $_POST["idsucursal"];
                $fecha = date("Y-m-d H:i:s");
                $quer_mov_af=$this->db->prepare(
                    "SELECT *, 
                        (SELECT fechaentrega FROM movimientos WHERE id = '$mov_id' ) AS fechaentrega, 
                        (SELECT estado FROM movimientos WHERE id = '$mov_id' ) AS estado_mov, 
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
                    $user_id = $mov_af["personal_id"];
                    $type_mov = $mov_af["tipo"] == 6 ? 1 : 2;
                    $quantity = $mov_af["cantidad"];
                    $code_af = $mov_af["codigo"] ."-". str_pad($su_id, 3, '0', STR_PAD_LEFT) . str_pad($dep_id, 3, '0', STR_PAD_LEFT) . str_pad($tr_id, 4, '0', STR_PAD_LEFT);

                    $quer_ub_af=$this->db->prepare("INSERT INTO ubicacionactivo (creado_en, fecha, activosfijos_id, cantidad, codigo, tipo, sucursal_id, departamento_id, trabajador_id, usuario_id, empresa_id) VALUES ('$fecha', '$delivery_date', '$af_id', '$quantity', '$code_af', '$type_mov', '$su_id', '$dep_id', '$tr_id', '$user_id', '$this->empresa_id')");
                    $quer_ub_af->execute();
                    
                    $query_qaf = $this->db->query("SELECT * FROM cantidadactivos WHERE activosfijos_id = '$af_id' AND trabajador_id = '$tr_id'");
                    $data_qaf = $query_qaf->fetch_assoc();
                    if ($data_qaf) {
                        $quantityFA = 0;
                        if ($type_mov == 1) {
                            $quantityFA = $data_qaf["cantidad"] - $quantity;
                        } else {
                            $quantityFA = $data_qaf["cantidad"] + $quantity;
                        }
                        $this->db->query("UPDATE cantidadactivos SET cantidad = '$quantityFA' WHERE activosfijos_id = '$af_id' AND trabajador_id = '$tr_id'");

                    } else {
                        $this->db->query("INSERT INTO cantidadactivos (activosfijos_id, cantidad, trabajador_id) VALUES ('$af_id', '$quantity', '$tr_id')");
                    }

                    $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE activosfijos_id = '$af_id' AND codigo = '$code_af' AND inventarios_id IS NULL");
                    $data_fai = $query_fai->fetch_assoc();
                    if ($data_fai) {
                        $quantityI = 0;
                        if ($type_mov == 1) {
                            $quantityI = $data_fai["cantidad"] - $quantity;

                            $this->db->query("UPDATE activosinventarios AS a INNER JOIN ( SELECT MIN(id) AS min_id FROM activosinventarios WHERE activosfijos_id = '$af_id' AND cantidad >= 0 ) AS sub ON a.id = sub.min_id SET a.cantidad = a.cantidad + $quantity;");
                        } else {
                            $quantityI = $data_fai["cantidad"] + $quantity;

                            $this->db->query("UPDATE activosinventarios AS a INNER JOIN ( SELECT MIN(id) AS min_id FROM activosinventarios WHERE activosfijos_id = '$af_id' AND cantidad > 0 ) AS sub ON a.id = sub.min_id SET a.cantidad = a.cantidad - $quantity;");
                        }
                        $this->db->query("UPDATE activosinventarios SET cantidad = '$quantityI' WHERE id = '".$data_fai["id"]."'");
                        
                    } else {
                        $currentDate = date("Y-m-d H:i:s");
                        $this->db->query("INSERT INTO activosinventarios (creado_en, codigo, cantidad, activosfijos_id, empresa_id, sucursal_id, departamento_id, trabajador_id) VALUES ('$currentDate', '$code_af', '$quantity', '$af_id', '$this->empresa_id', '$su_id', '$dep_id', '$tr_id')");
                        $this->db->query("UPDATE activosinventarios AS a
                            INNER JOIN (
                                SELECT MIN(id) AS min_id FROM activosinventarios WHERE activosfijos_id = '$af_id' AND cantidad > 0
                            ) AS sub
                            ON a.id = sub.min_id
                            SET a.cantidad = a.cantidad - $quantity;"
                        );
                    }
                }
            } else {
                $quer=$this->db->prepare("UPDATE $this->t_name SET estado = $state WHERE $this->col_id = ? AND movimientos_id = $movement_id");
                $quer->bind_param("i", $movfa_id);
                $quer->execute();
            }
            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
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

    public function addFA($fa_id, $mov_fa_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fa_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        $v_form = [];
        $error_arr = [];      

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {
                
                $quer=$this->db->prepare("UPDATE $this->t_name SET estado = 1, activosfijos_id = ? WHERE $this->col_id = ?");
                $quer->bind_param("ii", $fa_id, $mov_fa_id);
                $quer->execute();

                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $quer->affected_rows,
                    "id" => $mov_fa_id,
                    "data" => $v_form
                ];
            } catch (Throwable $th) {
                $this->res = [
                    "status" => 500,
                    "msg_error" => "error al actualizar $this->t_name",
                ]; 
            }
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));

    }

    public function ProofRequest($mov_id, $mov_type, $js = null){
        $valid = new Validations($this->t_name);

        set_error_handler(function ($err_severity, $err_msg, $err_file, $err_line, array $err_context)
        {
            throw new ErrorException( $err_msg, 0, $err_severity, $err_file, $err_line );
        }, E_WARNING);
        try {
            
            $queryMov = $this->db->prepare("SELECT * FROM movimientos WHERE id = $mov_id AND empresa_id = '$this->empresa_id'");
            $queryMov->execute();
            $dataMov = $queryMov->get_result()->fetch_assoc();
            $stateMov = $dataMov["estado"];

            if ($stateMov) {
                $this->connectionDB();
                if ($dataMov["trabajador_id"]) {
                    $queryWorkerMov = $this->db_rh->prepare("SELECT CONCAT(nombre, ' ', apellido) AS nombreapellido FROM trabajador WHERE idtrabajador = ?");
                    $queryWorkerMov->bind_param("i", $dataMov["trabajador_id"]);
                    $queryWorkerMov->execute();
                    $resultWorkerMov =  $queryWorkerMov->get_result();
                    $dataWorkerMov = $resultWorkerMov->fetch_assoc();
                    $dataMov["nombretrabajador"] = $dataWorkerMov["nombreapellido"];
                }

                if ($dataMov["encargado_id"]) {
                    $queryManagerMov = $this->db_rh->prepare(
                        "SELECT CONCAT(t.nombre, ' ', t.apellido) AS nombreapellido
                        FROM usuario u
                        INNER JOIN trabajador t ON u.trabajador_idtrabajador = t.idtrabajador
                        WHERE MD5(u.idusuario) = '". $dataMov["encargado_id"] ."'"
                    );
                    // $queryManagerMov->bind_param("s", $dataMov["encargado_id"]);
                    $queryManagerMov->execute();
                    $resultManagerMov =  $queryManagerMov->get_result();
                    $dataManagerMov = $resultManagerMov->fetch_assoc();
                    $dataMov["nombreencargado"] = $dataManagerMov["nombreapellido"];
                }
            } else {
                throw new Exception("No se encontraron datos del movimiento");
            }

            $fa_name = $this->mySubQuery("nombre_activofijo");
            $fa_detail = $this->mySubQuery("detalle_activofijo");
            $fa_code = $this->mySubQuery("codigo_activofijo");
            $c_name = $this->mySubQuery("nombre_categoria");
                        
            $consulta = $this->db->query(
                "SELECT *, $fa_name, $fa_detail, $fa_code, $c_name
                FROM $this->t_name 
                WHERE movimientos_id = (SELECT id FROM movimientos WHERE empresa_id = '$this->empresa_id' AND id = $mov_id) ORDER BY codigoactivofijo "
            );
            $data = $consulta->fetch_all(MYSQLI_ASSOC);

            
            if ($stateMov == 12) {
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
                "rowsAI" => $this->db->rows($consulta),
                "dataMov" => $dataMov,
                "data" => $data,
                "movType" => $mov_type,
            ];

            if (!$js) {
                require_once "pdf/filesVoucher.php";
                $object = new FilesVoucher();
                if($mov_type == "solicitud") {
                    $object->ProofRequest($this->res);
                } else if($mov_type == "admin") {
                    $object->ProofAdmin($this->res);
                } else if ($mov_type == "reasignacion") {
                    $object->ProofMovementReassignment($this->res);
                } else {
                    throw new Exception("Error al generar el comprobante");
                }
                return;
            }
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "Se requiren valores de UFVs hasta la fecha ". date('d/m/Y', strtotime('-1 year', strtotime($_POST["fechadepreciacion"]))),
            ];
            restore_error_handler();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
}

?>