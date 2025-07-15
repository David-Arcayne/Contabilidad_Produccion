<?php

class MovementAdmin
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

    public function getAll($mov_id){
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
                        
            $consulta = $this->db->query("SELECT *, $fa_name, $fa_detail, $movement_state FROM $this->t_name WHERE movimientos_id = $mov_id AND movimientos_id = $movement_id ORDER BY $this->col_id DESC");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);

            $stateMov = $this->db->query("SELECT estado FROM movimientos WHERE id = $mov_id");
            $dataSM = $stateMov->fetch_assoc();


            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($consulta),
                "data" => $data,
                "stateMov" => $dataSM["estado"],
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

            $queryMov=$this->db->prepare("SELECT * FROM movimientos WHERE encargado_id = ? AND empresa_id = '$this->empresa_id' AND personal_id IS NULL AND (estado NOT IN (11, 12) OR estado IS NULL) ORDER BY id DESC");
            $queryMov->bind_param("s", $responsible_id);
            $queryMov->execute();
            $dataMov =  $queryMov->get_result();

            $data = $this->db->all($dataMov, MYSQLI_ASSOC);

            if ($this->db->rows($dataMov) > 0) {
                $array_idarea = array();
                $array_idworker = array();
                foreach ($data as $key => $mov) {
                    if (!empty($mov["departamentos_id"])) {
                        array_push($array_idarea, "'". $mov["departamentos_id"] ."'");
                    }
                    if (!empty($mov["trabajador_id"])) {
                        array_push($array_idworker, "'". $mov["trabajador_id"] ."'");
                    }
                }
                $string_idarea = implode(", ", $array_idarea);
                $string_idworker = implode(", ", $array_idworker);
    
                $this->connectionDB();
    
                $quer_area=$this->db_rh->prepare("SELECT idareas, MD5(idareas) AS md5idarea, nombre, sucursal_idsucursal FROM areas WHERE MD5(idareas) IN ($string_idarea)");
                $quer_area->execute();
                $result_a =  $quer_area->get_result();
                $array_area = array();
                $array_idbo = array();
                while ($area = $this->db_rh->assoc($result_a)) {
                    $array_area[$area["md5idarea"]] = $area["nombre"];
                    $array_area[$area["md5idarea"]."id"] = $area["idareas"];
                    $array_area[$area["md5idarea"]."sucursal"] = $area["sucursal_idsucursal"];
                    array_push($array_idbo, $area["sucursal_idsucursal"]);
                }
                $string_idbo = implode(", ", $array_idbo);


                // $quer_sucursal=$this->db_em->prepare("SELECT idsucursalcontable, MD5(idsucursalcontable) AS md5idsucursal, nombre FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id' AND idsucursalcontable IN ($string_idbo)");
                // $quer_sucursal->execute();
                // $result_su =  $quer_sucursal->get_result();
                // $array_su = array();
                // while ($sucursal = $this->db_em->assoc($result_su)) {
                //     // $array_su[$sucursal["md5idsucursal"]] = $sucursal["nombre"];
                //     $array_su[$sucursal["idsucursalcontable"]] = $sucursal["idsucursalcontable"];
                // }

                $quer_trabajador=$this->db_rh->prepare("SELECT nombre, apellido, idtrabajador FROM trabajador WHERE idtrabajador IN ($string_idworker)");
                $quer_trabajador->execute();
                $result_t =  $quer_trabajador->get_result();
    
                $array_tr = array();
                while ($trabajador = $this->db_rh->assoc($result_t)) {
                    $array_tr[$trabajador["idtrabajador"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                    $array_tr[$trabajador["idtrabajador"]."id"] = $trabajador["idtrabajador"];
                }
    
                foreach ($data as $key => $mov) {
                    if (isset($array_area[$mov["departamentos_id"]])) {
                        $data[$key]["nombrearea"] = $array_area[$mov["departamentos_id"]];
                        $data[$key]["idsucursal"] = $array_area[$mov["departamentos_id"]."sucursal"];
                    }

                    if (isset($array_tr[$mov["trabajador_id"]])) {
                        $data[$key]["nombrepersonal"] = $array_tr[$mov["trabajador_id"]]; // idpersonal = idusuario
                        $data[$key]["iddepartamento"] = $array_area[$mov["departamentos_id"]."id"];
                        $data[$key]["idtrabajador"] = $array_tr[$mov["trabajador_id"]."id"];
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

    public function createMovement(){

        $valid = new Validations("movimientos");

        $area_id = $_POST["area_id"];
        $_POST["empresa_id"] = $this->empresa_id;
        $_POST["departamentos_id"] = md5($area_id);
        $_POST["encargado_id"] = $_SESSION["yofinanciero"];
        $_POST["estado"] = (isset($_POST["tiposolicitud"]) && trim($_POST["tiposolicitud"]) && trim($_POST["tiposolicitud"]) == 2) ? 5 : null;
        $_POST["trabajador_id"] = $_POST["trabajador_id"];
        // $_POST["fechasolicitud"] = date("Y-m-d H:i:s");

        $this->connectionDB("rh");
        $queryBO = $this->db_rh->prepare("SELECT MD5(sucursal_idsucursal) AS sucursal_id FROM areas WHERE idareas = '$area_id'");
        $queryBO->execute();
        $result_bo =  $queryBO->get_result();
        $bo_id = $this->db_rh->assoc($result_bo)["sucursal_id"];
        $_POST["sucursal_id"] = $bo_id;
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
            
            $state = ($stateRequest == 1 || $stateRequest == 6) ? 1 : 3;
            $movement_id = $this->mySubQuery("id_movimientos");

            $quer = "";
            $mov_id = $movfa_id;
            
            $quer=$this->db->prepare("UPDATE $this->t_name SET estado = $state WHERE movimientos_id = ? AND estado = 2 AND movimientos_id = $movement_id");
            $quer->bind_param("i", $mov_id);
            $quer->execute();
            

            // require_once "class/movement.php";
            // $obj = new Movement();
            // $obj->editState($mov_id, $stateRequest);
            $queryMV = $this->db->query("SELECT (COALESCE(MAX(cod_comprobante), 0 ) + 1) AS codigocomprobante FROM movimientos WHERE empresa_id = '$this->empresa_id'");
            $dataMV = $queryMV->fetch_assoc();
            $cod_comprobante = $dataMV["codigocomprobante"];
            $deliveryDate = $_POST["fechaentrega"];
            $responseDate = date("Y-m-d H:i:s");
            $this->db->query("UPDATE movimientos SET fecharespuesta = '$responseDate', fechaentrega = '$deliveryDate', estado = $stateRequest, cod_comprobante = $cod_comprobante WHERE id = $mov_id AND empresa_id = '$this->empresa_id'");

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

                $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE activosfijos_id = '$af_id' AND codigo = '$code_af' AND inventarios_id IS NULL");
                $data_fai = $query_fai->fetch_assoc();
                if ($data_fai) {
                    $quantityI = 0;
                    if ($type_mov == 1) {
                        $quantityI = $data_fai["cantidad"] - $quantity;

                        $this->db->query(
                            "UPDATE activosinventarios AS a 
                            INNER JOIN ( 
                                SELECT MIN(id) AS min_id 
                                FROM activosinventarios 
                                WHERE activosfijos_id = '$af_id' AND cantidad >= 0 ) AS sub 
                            ON a.id = sub.min_id SET a.cantidad = a.cantidad + $quantity;");
                    } else {
                        $quantityI = $data_fai["cantidad"] + $quantity;

                        $this->db->query(
                            "UPDATE activosinventarios AS a 
                            INNER JOIN ( 
                                SELECT MIN(id) AS min_id 
                                FROM activosinventarios 
                                WHERE activosfijos_id = '$af_id' AND cantidad > 0 ) AS sub 
                            ON a.id = sub.min_id SET a.cantidad = a.cantidad - $quantity;");
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

    public function getSuggestionAlerts(){
        try {

            // $consulta = $this->db->query("SELECT COUNT(id) AS cantidad FROM activosinventarios WHERE accion = 4 AND empresa_id = '$this->empresa_id'");
            $consulta = $this->db->query(
                "SELECT COUNT(ai.id) AS cantidad 
                FROM activosinventarios ai 
                INNER JOIN observacionesainventarios oai ON ai.id = oai.activosinventarios_id
                WHERE oai.tipo = 4 AND oai.estado = 0 AND ai.empresa_id = '$this->empresa_id'"
            );
            $data = $consulta->fetch_assoc();
            
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($consulta),
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

    public function getSuggestions(){
        try {

            // $consulta = $this->db->query(
            //     "SELECT id, codigo, observacion,
            //         (SELECT nombre FROM activosfijos WHERE id = activosinventarios.activosfijos_id) AS nombreactivofijo,
            //         (SELECT detalle FROM activosfijos WHERE id = activosinventarios.activosfijos_id) AS detalleactivofijo
            //     FROM activosinventarios 
            //     WHERE accion = 4 AND empresa_id = '$this->empresa_id'");
            $consulta = $this->db->query(
                "SELECT ai.id, ai.codigo,
                    af.nombre AS nombreactivofijo, af.detalle AS detalleactivofijo, af.id AS id_af,
                    oai.id AS obs_id, oai.cantidad AS obs_cantidad, oai.sucursal_id AS obs_sucursal, oai.departamento_id AS obs_area, oai.trabajador_id AS obs_trabajador, oai.observacion AS obs_observacion
                FROM activosinventarios ai
                INNER JOIN activosfijos af ON ai.activosfijos_id = af.id
                INNER JOIN observacionesainventarios oai ON ai.id = oai.activosinventarios_id
                WHERE oai.tipo = 4 AND oai.estado = 0 AND ai.empresa_id = '$this->empresa_id'"
            );
            $data = $consulta->fetch_all(MYSQLI_ASSOC);
            
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($consulta),
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
}

?>