<?php

class Inventory
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "inventarios"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getAll(){
        try {
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' ORDER BY $this->col_id DESC");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);

            $userIds = [];
            foreach ($data as $key => $value) {
                array_push($userIds, "'". $value["usu_creador"] ."'");
            }
            $userIds = implode(", ", array_unique($userIds));

            if ($userIds) {
                $db_rh = new DBConnection("rrhh");
                $queryWorker = $db_rh->query(
                    "SELECT MD5(idusuario) AS idusuariomd5, 
                        (SELECT CONCAT(nombre, ' ', apellido) FROM trabajador WHERE idtrabajador = usuario.trabajador_idtrabajador) AS nombretrabajador 
                    FROM usuario WHERE MD5(idusuario) IN ($userIds)");
                $arrayWorker = [];
                while ($worker = $queryWorker->fetch_assoc()) {
                    $arrayWorker[$worker["idusuariomd5"]] = $worker["nombretrabajador"];
                }
    
                foreach ($data as $key => $value) {
                    $data[$key]["nombretrabajador"] = $arrayWorker[$value["usu_creador"]];
                }
    
            }
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
    

    public function create(){

        $valid = new Validations($this->t_name);

        $_POST["empresa_id"] = $this->empresa_id;
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
    
                $quer=$this->db->prepare("INSERT INTO $this->t_name ($insert_columns) VALUES ($prepare_marks)");
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

    public function edit($inventory_id){        
        $valid = new Validations($this->t_name);

        $_POST["editado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_editor"] = $_SESSION["yofinanciero"];
        $valid_id = $valid->isNumber($inventory_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = [];      

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {

                $name_columns = array_keys($v_form);
                $value_columns = array_values($v_form);
                array_push($value_columns, $inventory_id);

                $bind_types = str_repeat("s", count($v_form));
                $prepare_marks = "";
                foreach ($name_columns as $value) {
                    $prepare_marks .= $value." = ?, ";
                }
                $prepare_marks = substr($prepare_marks, 0, -2);

                $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
                $quer->bind_param($bind_types."i", ...$value_columns);
                $quer->execute();

                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $quer->affected_rows,
                    "id" => $inventory_id,
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

    public function delete($inventory_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($inventory_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer->bind_param("i", $inventory_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $inventory_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "Error al eliminar $this->t_name",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function state(){

        // echo '<pre>'. print_r($_POST, true) .'</pre>';
        // return;
        $valid = new Validations("activosinventarios");

        $_POST["creado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_creador"] = $_SESSION["yofinanciero"];
        if (isset($_POST["observacion"]) && !trim($_POST["observacion"])) $_POST["observacion"] = null; 
        if (isset($_POST["enviar_a"]) && trim($_POST["enviar_a"])) $_POST["accion"] = $_POST["enviar_a"]; 

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

                $codigo = $_POST["codigo"];
                $inventarios_id = $_POST["inventarios_id"];
                $query_exist = $this->db->query("SELECT * FROM activosinventarios WHERE codigo = '$codigo' AND inventarios_id = '$inventarios_id'");
                $data_exist = $query_exist->fetch_assoc();

                if ($data_exist) {
                    $obsainv_id = null;
                    if (isset($_POST["accion"])) {
                        $valid_obs = new Validations("observacionesainventarios");
    
                        $arrayObs = [
                            "estado" => 0,
                            "observacion" => $_POST["observacion"],
                            "tipo" => $_POST["accion"],
                            "activosinventarios_id" => $data_exist["id"],
                        ];
    
                        if (isset($_POST["obs_cantidad"]) && trim($_POST["obs_cantidad"])) $arrayObs["cantidad"] = $_POST["obs_cantidad"];
                        if (isset($_POST["obs_sucursal"]) && trim($_POST["obs_sucursal"])) $arrayObs["sucursal_id"] = $_POST["obs_sucursal"];
                        if (isset($_POST["obs_area"]) && trim($_POST["obs_area"])) $arrayObs["departamento_id"] = $_POST["obs_area"];
                        if (isset($_POST["obs_trabajador"]) && trim($_POST["obs_trabajador"])) $arrayObs["trabajador_id"] = $_POST["obs_trabajador"];
    
                        $v_form_obs = $valid_obs->getColumsData($arrayObs);
    
                        $insert_columns_obs = implode(", ", array_keys($v_form_obs));
                        $value_columns_obs = array_values($v_form_obs);
                        $prepare_marks_obs = implode(',', array_fill(0, count($v_form_obs), '?'));
                        $bind_types_obs = str_repeat("s", count($v_form_obs));
    
                        $query_obsainv = $this->db->prepare("INSERT INTO observacionesainventarios ($insert_columns_obs) VALUES ($prepare_marks_obs)");
                        $query_obsainv->bind_param($bind_types_obs, ...$value_columns_obs);
                        $query_obsainv->execute();

                        $obsainv_id = $query_obsainv->insert_id;
                    } 

                    $idInv = $data_exist["id"];
                    if ($obsainv_id) {
                        $query_qtt = $this->db->prepare("INSERT INTO inventarioscantidad (cantidad, observacion, tipoestado_id, activosinventarios_id, observacionesainventarios_id) VALUES (?, ?, ?, ?, ?)");
                        $query_qtt->bind_param("issii", $_POST["cantidad_inv"], $_POST["observacion"], $_POST["tipoestado_id"], $idInv, $obsainv_id);
                        $query_qtt->execute();
                    } else {
                        $query_qtt = $this->db->prepare("INSERT INTO inventarioscantidad (cantidad, observacion, tipoestado_id, activosinventarios_id) VALUES (?, ?, ?, ?)");
                        $query_qtt->bind_param("issi", $_POST["cantidad_inv"], $_POST["observacion"], $_POST["tipoestado_id"], $idInv);
                        $query_qtt->execute();
                    }        
                } else {
                    $insert_columns = implode(", ", array_keys($v_form));
                    $value_columns = array_values($v_form);
                    $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                    $bind_types = str_repeat("s", count($v_form));
        
                    $quer=$this->db->prepare("INSERT INTO activosinventarios ($insert_columns) VALUES ($prepare_marks)");
                    $quer->bind_param($bind_types, ...$value_columns);
                    $quer->execute();

                    $obsainv_id = null;
                    if ($quer->affected_rows > 0 && isset($_POST["accion"])) {
                        $valid_obs = new Validations("observacionesainventarios");
    
                        $arrayObs = [
                            "estado" => 0,
                            "observacion" => $_POST["observacion"],
                            "tipo" => $_POST["accion"],
                            "activosinventarios_id" => $quer->insert_id,
                        ];
    
                        if (isset($_POST["obs_cantidad"]) && trim($_POST["obs_cantidad"])) $arrayObs["cantidad"] = $_POST["obs_cantidad"];
                        if (isset($_POST["obs_sucursal"]) && trim($_POST["obs_sucursal"])) $arrayObs["sucursal_id"] = $_POST["obs_sucursal"];
                        if (isset($_POST["obs_area"]) && trim($_POST["obs_area"])) $arrayObs["departamento_id"] = $_POST["obs_area"];
                        if (isset($_POST["obs_trabajador"]) && trim($_POST["obs_trabajador"])) $arrayObs["trabajador_id"] = $_POST["obs_trabajador"];
    
                        $v_form_obs = $valid_obs->getColumsData($arrayObs);
    
                        $insert_columns_obs = implode(", ", array_keys($v_form_obs));
                        $value_columns_obs = array_values($v_form_obs);
                        $prepare_marks_obs = implode(',', array_fill(0, count($v_form_obs), '?'));
                        $bind_types_obs = str_repeat("s", count($v_form_obs));
    
                        $query_obsainv = $this->db->prepare("INSERT INTO observacionesainventarios ($insert_columns_obs) VALUES ($prepare_marks_obs)");
                        $query_obsainv->bind_param($bind_types_obs, ...$value_columns_obs);
                        $query_obsainv->execute();

                        $obsainv_id = $query_obsainv->insert_id;
                    } 
                    if ($quer->affected_rows > 0) {
                        $idInv = $quer->insert_id;
                        if ($obsainv_id) {
                            $query_qtt = $this->db->prepare("INSERT INTO inventarioscantidad (cantidad, observacion, tipoestado_id, activosinventarios_id, observacionesainventarios_id) VALUES (?, ?, ?, ?, ?)");
                            $query_qtt->bind_param("issii", $_POST["cantidad_inv"], $_POST["observacion"], $_POST["tipoestado_id"], $idInv, $obsainv_id);
                            $query_qtt->execute();
                        } else {
                            $query_qtt = $this->db->prepare("INSERT INTO inventarioscantidad (cantidad, observacion, tipoestado_id, activosinventarios_id) VALUES (?, ?, ?, ?)");
                            $query_qtt->bind_param("issi", $_POST["cantidad_inv"], $_POST["observacion"], $_POST["tipoestado_id"], $idInv);
                            $query_qtt->execute();
                        }
                    }
                }

                // $code_inv = $_POST["codigo"];
                // $tipo_estado_id = $_POST["tipoestado_id"];
                // $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE codigo = '$code_inv' AND inventarios_id IS NULL");
                // $data_fai = $query_fai->fetch_assoc();
                // if ($data_fai) {
                //     $this->db->query("UPDATE activosinventarios SET tipoestado_id = '$tipo_estado_id'  WHERE id = '".$data_fai["id"]."'");   
                // }
                
                $this->res = [
                    "status" => 200, 
                    "affected_rows" => [],
                    "id" => "",
                    "data" => $v_form
                ];
                $this->db->commit();
            } catch (Throwable $th) {
                $this->res = [
                    "status" => 500,
                    "msg_error" => "error al insertar dd",
                ]; 
                $this->db->rollback();
            }
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function getStates($inv_fa){
        try {
            $consulta = $this->db->query(
                "SELECT i_c.*, 
                    (
                        SELECT nombre 
                        FROM tipoestado 
                        WHERE id = i_c.tipoestado_id
                    ) AS nombreestado 
                FROM inventarioscantidad i_c
                LEFT JOIN observacionesainventarios oai ON i_c.observacionesainventarios_id = oai.id
                WHERE i_c.activosinventarios_id = '$inv_fa' 
                    AND (i_c.observacionesainventarios_id IS NULL OR oai.estado < 5)"
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

    public function deleteState($ai_qtt_id){
        $valid = new Validations("inventarioscantidad");

        $valid_id = $valid->isNumber($ai_qtt_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $query_inv_qtt = $this->db->query("SELECT * FROM inventarioscantidad WHERE id = '$ai_qtt_id'");
            $data_inv_qtt = $query_inv_qtt->fetch_assoc();
            $obs_ai_id = $data_inv_qtt["observacionesainventarios_id"];

            $quer=$this->db->prepare("DELETE FROM inventarioscantidad WHERE $this->col_id = ?");
            $quer->bind_param("i", $ai_qtt_id);
            $quer->execute();

            if ($obs_ai_id && $quer->affected_rows > 0) {
                $quer=$this->db->prepare("DELETE FROM observacionesainventarios WHERE id = ?");
                $quer->bind_param("i", $obs_ai_id);
                $quer->execute();
            }

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $ai_qtt_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "Error al eliminar inventarioscantidad",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
}

?>