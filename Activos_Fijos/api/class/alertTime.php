<?php

class AlertTime
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "tiempoalerta"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getAlertTime(){

        try {
            $name = $_GET["nombre"] ?? null;
            if (!$name) {
                throw new Exception("ocurrio un error");
            }
            
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND nombre = '$name'");
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

    public function create(){

        $validNames = ["alertaseguros", "alertasituacion"];
        if (isset($_POST["nombre"]) && !in_array($_POST["nombre"], $validNames)) {
            $this->res = [
                "status" => 400,
                "error" => "ocurrio un error"
            ];
            echo json_encode($this->res, http_response_code($this->res["status"]));
            return;
        }

        $valid = new Validations($this->t_name);
        $_POST["empresa_id"] = $this->empresa_id;
        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = [];

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {

                $queryExists = $this->db->prepare("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND nombre = ?");
                $queryExists->bind_param("s", $_POST["nombre"]);
                $queryExists->execute();
                $queryExists->store_result();

                if ( $queryExists->num_rows == 1 ) {
                    $v_form["editado_en"] = date("Y-m-d H:i:s");
                    $v_form["usu_editor"] = $_SESSION["yofinanciero"];
                    $name_columns = array_keys($v_form);
                    $value_columns = array_values($v_form);
                    array_push($value_columns, $v_form["nombre"]);
    
                    $bind_types = str_repeat("s", count($v_form));
                    $prepare_marks = "";
                    foreach ($name_columns as $value) {
                        $prepare_marks .= $value." = ?, ";
                    }
                    $prepare_marks = substr($prepare_marks, 0, -2);
    
                    $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE nombre = ? AND empresa_id = '$this->empresa_id'");
                    $quer->bind_param($bind_types."s", ...$value_columns);
                    $quer->execute();
    
                    $quer->get_result();
                } else if ($queryExists->num_rows == 0) {
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