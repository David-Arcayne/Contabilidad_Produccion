<?php


class Images
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "fotosactivos"; 
        $this->col_id = "id";
        $this->empresa_id = $_SESSION["organizacion"];
    }

    private function mySubQuery ($sq) {
        $idaf="SELECT id FROM activosfijos 
            WHERE categorias_id = (
                SELECT id FROM categorias WHERE id = activosfijos.categorias_id AND empresa_id = '$this->empresa_id'
            )
            AND id = $this->t_name.activosfijos_id";

        $list = [
            "id_activosfijos" => "($idaf)", 
        ];

        return $list[$sq];
    }

    public function getImagesById($fixedAsset){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fixedAsset, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $fa_id = $this->mySubQuery("id_activosfijos");

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE activosfijos_id = ? AND activosfijos_id = $fa_id ORDER BY $this->col_id DESC");
            $consulta->bind_param("s", $fixedAsset);
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
                "msg_error" => "error al listar imagenes de activos fijos",
            ];
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function createImage(){
        
        $valid = new Validations($this->t_name);
        $v_form = $valid->getColumsData($_POST);

        $is_image = $valid->handleImage("foto");
        if (!$is_image) {
            $this->res = [
                "status" => 400,
                "errors" => ["foto" => "El archivo no es correcto"]
            ];
        } else {
            try {
                $v_form["foto"] = $is_image["name"];
                $v_form["creado_en"] = date("Y-m-d H:i:s");
                $v_form["usu_creador"] = $_SESSION["yofinanciero"];

                $file_path = '../imagenes/activos_fijos/';
                if (!file_exists($file_path)) mkdir($file_path, 0777, true);
				move_uploaded_file($is_image["image"], $file_path . $is_image["name"]);
                
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
                    "msg_error" => "error al insertar imagen",
                ]; 
            }
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function deleteImagen($image_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($image_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $fa_id = $this->mySubQuery("id_activosfijos");

            $data = $this->db->query("SELECT * FROM $this->t_name WHERE $this->col_id = $image_id AND activosfijos_id = $fa_id")->fetch_assoc();

            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND activosfijos_id = $fa_id");
            $quer->bind_param("i", $image_id);
            $quer->execute();
            $req =  $quer->get_result();

            $file_path = "../imagenes/activos_fijos/". $data["foto"];
            if (file_exists($file_path)) unlink($file_path);

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $image_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
           
            $this->res = [
                "status" => 500,
                "msg_error" => "error al eliminar imagen",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
}

?>