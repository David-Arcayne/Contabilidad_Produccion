<?php

class UFVValues
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "valoresufv"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getAll(){

        try {
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' ORDER BY fecha DESC");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($consulta),
                "data" => $data,
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "error al listar $this->t_name",
                "info" => $this->db->error,
            ];
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function getById($ufvv_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($ufvv_id, "id");
        if($valid_id) {
            echo json_encode(["status" => 400, "error" => $valid_id], http_response_code(400));
            return;
        }

        try {

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $consulta->bind_param("s", $ufvv_id);
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->assoc($req);
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "error al listar $this->t_name",
                "info" => $this->db->error,
            ];
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function create(){

        $valid = new Validations($this->t_name);

        $_POST["empresa_id"] = $this->empresa_id;

        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = [];      
        // $v_fecha = $valid->isUnique($_POST["fecha"],"fecha", "AND empresa_id = '$this->empresa_id'");
        // if($v_fecha) $error_arr["fecha"] = $v_fecha;

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
                    "message" => "error al insertar $this->t_name",
                    "info" => $this->db->error,
                ]; 
            }
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function edit($ufvv_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($ufvv_id, "id");
        if($valid_id) {
            echo json_encode(["status" => 400, "error" => $valid_id], http_response_code(400));
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
                array_push($value_columns, $ufvv_id);

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
                    "id" => $ufvv_id,
                    "data" => $v_form
                ];
            } catch (Throwable $th) {
                $this->res = [
                    "status" => 500,
                    "message" => "error al actualizar $this->t_name",
                    "info" => $this->db->error,
                ]; 
            }
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));

    }

    public function delete($ufvv_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($ufvv_id, "id");
        if($valid_id) {
            echo json_encode(["status" => 400, "error" => $valid_id], http_response_code(400));
            return;
        }

        try {
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer->bind_param("i", $ufvv_id);
            $quer->execute();

            $msg = [
                "msg" => "Registro eliminado con éxito", 
                "icon" => "success"
            ];
            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $ufvv_id,
                "data" => $msg,
            ];
        } catch (Throwable $th) {
            $msg = [
                "msg" => "Error al eliminar registro",
                "icon" => "error"
            ];
            $this->res = [
                "status" => 500,
                "data" => $msg,
                "info" => $this->db->error,
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
}

?>