<?php

class AssetType
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "tipobien"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    private function mySubQuery ($sq) {
        $nc="SELECT nombre FROM categorias WHERE id = $this->t_name.categorias_id";

        $list = [
            "nombre_categoria" => "($nc) as 'nombrecategoria'", 
        ];

        return $list[$sq];
    }

    public function getAll(){

        try {
            $category_name = $this->mySubQuery("nombre_categoria");

            $consulta = $this->db->query("SELECT *, $category_name FROM $this->t_name WHERE empresa_id = '$this->empresa_id' ORDER BY codificacion");
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

    public function getAllEnabled(){

        try {
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id'");
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
    public function getAllEnabledById($category_id){

        try {
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND categorias_id = $category_id");
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

    public function getById($t_e_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($t_e_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $consulta->bind_param("s", $t_e_id);
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
                "msg_error" => "error al listar $this->t_name",
            ];
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function create(){

        $valid = new Validations($this->t_name);
        
        $coding = $this->db->query("SELECT codificacion FROM $this->t_name WHERE empresa_id = '$this->empresa_id' ORDER BY $this->col_id DESC LIMIT 1");
        $coding = $coding->fetch_array(MYSQLI_NUM);
        $code = $coding ? (int)$coding[0] + 1 : 1;
        $code = str_pad($code, 2, '0', STR_PAD_LEFT);

        $_POST["empresa_id"] = $this->empresa_id;
        $_POST["codificacion"] = $code;
        $_POST["creado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_creador"] = $_SESSION["yofinanciero"];

        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = [];

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else if((int)$code > 99) {
            $this->res = [
                "status" => 400,
                "error" => "Solo se permiten 99 registros",
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

    public function edit($t_e_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($t_e_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        $_POST["editado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_editor"] = $_SESSION["yofinanciero"];
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
                array_push($value_columns, $t_e_id);

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
                    "id" => $t_e_id,
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

    public function delete($t_e_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($t_e_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer->bind_param("i", $t_e_id);
            $quer->execute();

            
            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $t_e_id,
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

    public function report($js = null){

        try {
            $category_name = $this->mySubQuery("nombre_categoria");

            $consulta = $this->db->query("SELECT *, $category_name FROM $this->t_name WHERE empresa_id = '$this->empresa_id' ORDER BY codificacion");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($consulta),
                "data" => $data,
            ];
            if(!$js){
                require_once "pdf/filesConfiguration.php";
                $object = new FilesConfiguration();
                $object->reportAssetType($this->res);
                return;
            }
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