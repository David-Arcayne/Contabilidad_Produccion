<?php

class Depreciation
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "metododepreciacion"; 
        $this->col_id = "id";
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getOne(){
        try {
            $consulta=$this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND estado = 1");
           
            $data =  $consulta->fetch_assoc();

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
        $_POST["estado"] = 1;

        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = [];      

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {
                $queryExists = $this->db->prepare("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id'");
                $queryExists->execute();
                $resultQE = $queryExists->get_result();
                $dataQE = $resultQE->fetch_assoc();

                if ( $resultQE->num_rows == 1 ) {
                    $v_form["editado_en"] = date("Y-m-d H:i:s");
                    $v_form["usu_editor"] = $_SESSION["yofinanciero"];
                    $name_columns = array_keys($v_form);
                    $value_columns = array_values($v_form);
                    array_push($value_columns, $dataQE["id"]);
    
                    $bind_types = str_repeat("s", count($v_form));
                    $prepare_marks = "";
                    foreach ($name_columns as $value) {
                        $prepare_marks .= $value." = ?, ";
                    }
                    $prepare_marks = substr($prepare_marks, 0, -2);
    
                    $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE id = ? AND empresa_id = '$this->empresa_id'");
                    $quer->bind_param($bind_types."s", ...$value_columns);
                    $quer->execute();
    
                } else if ($resultQE->num_rows == 0) {
                    $v_form["creado_en"] = date("Y-m-d H:i:s");
                    $v_form["usu_creador"] = $_SESSION["yofinanciero"];
                    
                    $insert_columns = implode(", ", array_keys($v_form));
                    $value_columns = array_values($v_form);
                    $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                    $bind_types = str_repeat("s", count($v_form));
        
                    $quer=$this->db->prepare("INSERT INTO $this->t_name ($insert_columns) VALUES ($prepare_marks)");
                    $quer->bind_param($bind_types, ...$value_columns);
                    $quer->execute();
                } else {
                    throw new Exception("ocurrio un error");
                }

    
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
}

?>