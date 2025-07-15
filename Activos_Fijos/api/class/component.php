<?php

class Component
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "componentes"; 
        $this->col_id = "id";
        $this->empresa_id = $_SESSION["organizacion"];
    }

    private function mySubQuery ($sq) {
        $idaf="SELECT id FROM activosfijos 
            WHERE categorias_id = (
                SELECT id FROM categorias WHERE id = activosfijos.categorias_id AND empresa_id = '$this->empresa_id'
            )
            AND id = $this->t_name.activosfijos_id";

        $tst="SELECT tipo FROM tiposituacion WHERE id = (
            SELECT tiposituacion_id FROM historial WHERE componentes_id = $this->t_name.id ORDER BY id DESC LIMIT 0, 1
        )";

        $ch="SELECT codigo FROM historial WHERE componentes_id = $this->t_name.id ORDER BY id DESC LIMIT 0, 1";

        $list = [
            "id_activosfijos" => "($idaf)", 
            "tipo_tiposituacion" => "($tst) as 'tiposituacion'", 
            "codigo_historial" => "($ch) as 'codigohistorial'", 
        ];

        return $list[$sq];
    }

    public function getById($component_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($component_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $fa_id = $this->mySubQuery("id_activosfijos");

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE $this->col_id = ? AND activosfijos_id = $fa_id");
            $consulta->bind_param("s", $component_id);
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

    public function getAllById($fixedasset_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fixedasset_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $fa_id = $this->mySubQuery("id_activosfijos");
            $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $history_code = $this->mySubQuery("codigo_historial");

            $consulta=$this->db->prepare("SELECT *, $situationtype_type, $history_code FROM $this->t_name WHERE activosfijos_id = ? AND activosfijos_id = $fa_id ORDER BY $this->col_id DESC");
            $consulta->bind_param("s", $fixedasset_id);
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->all($req, MYSQLI_ASSOC);
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

        // $_POST["empresa_id"] = $this->empresa_id; // valid create component and othres that insert values from other company

        $fa_id = $_POST["activosfijos_id"];

        $coding = $this->db->query("SELECT codificacion FROM $this->t_name WHERE activosfijos_id = $fa_id ORDER BY $this->col_id DESC LIMIT 1");
        $coding = $coding->fetch_array(MYSQLI_NUM);
        $code = $coding ? (int)$coding[0] + 1 : 1;
        $code = str_pad($code, 3, '0', STR_PAD_LEFT);
        $_POST["codificacion"] = $code;
        $comp_code = $_POST["codigo_af"] ."-". $code;
        $_POST["codigo"] =$comp_code;
        $_POST["creado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_creador"] = $_SESSION["yofinanciero"];

        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = []; 
        $is_image = $valid->handleImage("imagen");
        if ($is_image === 0) {
            $this->res = [
                "status" => 400,
                "errors" => ["imagen" => "El archivo no es correcto"]
            ];
        } else if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else {
            try {
                if ($is_image) {
                    $v_form["imagen"] = $is_image["name"];
                    // $v_form["creado_en"] = date("Y-m-d H:i:s");
    
                    $file_path = '../imagenes/componentes/';
                    if (!file_exists($file_path)) mkdir($file_path, 0777, true);
                    move_uploaded_file($is_image["image"], $file_path . $is_image["name"]);
                }

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
    
    public function edit($component_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($component_id, "id");
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
                $is_image = $valid->handleImage("imagen");
                if ($is_image === 0) {
                    $this->res = [
                        "status" => 400,
                        "errors" => ["imagen" => "El archivo no es correcto"]
                    ];
                    echo json_encode($this->res, http_response_code($this->res["status"]));
                    return;
                } 
                if (!($is_image === false)) {
                                       
                    $data = $this->db->query("SELECT * FROM $this->t_name WHERE $this->col_id = $component_id")->fetch_assoc();
                    $file_path = "../imagenes/componentes/". $data["imagen"];
                    if ($data["imagen"] && file_exists($file_path)) unlink($file_path);

                    $v_form["imagen"] = $is_image["name"];
                    $file_path = '../imagenes/componentes/';
                    if (!file_exists($file_path)) mkdir($file_path, 0777, true);
                    move_uploaded_file($is_image["image"], $file_path . $is_image["name"]);
                }

                $name_columns = array_keys($v_form);
                $value_columns = array_values($v_form);
                array_push($value_columns, $component_id);

                $bind_types = str_repeat("s", count($v_form));
                $prepare_marks = "";
                foreach ($name_columns as $value) {
                    $prepare_marks .= $value." = ?, ";
                }
                $prepare_marks = substr($prepare_marks, 0, -2);

                $fa_id = $this->mySubQuery("id_activosfijos");

                $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND activosfijos_id = $fa_id");
                $quer->bind_param($bind_types."i", ...$value_columns);
                $quer->execute();

                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $quer->affected_rows,
                    "id" => $component_id,
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

    public function delete($component_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($component_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $data = $this->db->query("SELECT * FROM $this->t_name WHERE $this->col_id = $component_id")->fetch_assoc();
            
            $fa_id = $this->mySubQuery("id_activosfijos");
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND activosfijos_id = $fa_id");
            $quer->bind_param("i", $component_id);
            $quer->execute();

            $file_path = "../imagenes/componentes/". $data["imagen"];
            if (file_exists($file_path)) unlink($file_path);

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $component_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error $this->t_name",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
}

?>