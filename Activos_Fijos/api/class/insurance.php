<?php

class Insurance
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    private $hour;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "seguros"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    private function mySubQuery ($sq) {
        $date = "'".date("Y-m-d H:i:s")."'";
        $ds="SELECT IF(periodob < $date, 1, 0)";

        $dsp = "";
        if ($sq == "fecha_porvencer") {
            // $dsp="SELECT IF(periodob <= DATE_ADD($date, INTERVAL 168 HOUR) AND estadoseguro IS NULL, 1, 0)";
            $queryHour = $this->db->query("SELECT tiempo FROM tiempoalerta WHERE empresa_id = '$this->empresa_id' AND nombre = 'alertaseguros'");
            $dataHour = $queryHour->fetch_assoc();
            $hour = isset($dataHour["tiempo"]) ? $dataHour["tiempo"] : 168;
            $this->hour = $hour;
            $half = (int)($hour / 2);
            $dsp="SELECT IF(periodob <= DATE_ADD($date, INTERVAL $half HOUR) AND estadoseguro IS NULL, 2, IF(periodob <= DATE_ADD($date, INTERVAL $hour HOUR) AND estadoseguro IS NULL, 1, 0))";
        }
        
        $nts="SELECT nombre FROM tiposeguro WHERE id = $this->t_name.tiposeguro_id";

        $list = [
            "estado_fecha" => "($ds) as estadofecha", 
            "fecha_porvencer" => "($dsp) as fechaporvencer", 
            "nombre_tiposeguro" => "($nts) as nombretiposeguro", 
        ];

        return $list[$sq];
    }

    public function getAll(){
        try {
            $date_status = $this->mySubQuery("estado_fecha");
            $date_expired = $this->mySubQuery("fecha_porvencer");
            $insurancetype_name = $this->mySubQuery("nombre_tiposeguro");

            $consulta = $this->db->query("SELECT *, $date_status, $date_expired, $insurancetype_name FROM $this->t_name WHERE empresa_id = '$this->empresa_id' ORDER BY codigo");
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
            $insurancetype_name = $this->mySubQuery("nombre_tiposeguro");
            $date = "'".date("Y-m-d H:i:s")."'";
            $consulta = $this->db->query("SELECT *, $insurancetype_name FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND periodob >= $date");
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

    public function getById($insurance_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($insurance_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $consulta->bind_param("s", $insurance_id);
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

        $expired_id = isset($_POST["segurocaducado_id"]) ? $_POST["segurocaducado_id"] : null;
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
                $this->db->begin_transaction();
                
                if($expired_id) {
                    $quer=$this->db->prepare("UPDATE $this->t_name SET estadoseguro = 1 WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
                    $quer->bind_param("i", $expired_id);
                    $quer->execute();
                }

                $is_file = $valid->handlePDF("contrato_pdf");
                if ($is_file != 3) {
                    if($is_file != 2) {
                        $file_path = '../archivos/seguros/';
                        if (!file_exists($file_path)) mkdir($file_path, 0777, true);
                        move_uploaded_file($is_file["file"], $file_path . $is_file["name"]);

                        $v_form["contratopdf"] = $is_file["name"];

                    } else {
                        $this->res = [
                            "status" => 400,
                            "errors" => ["foto" => "El archivo no es correcto"]
                        ];
                        echo json_encode($this->res, http_response_code($this->res["status"]));
                    }
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

    public function edit($insurance_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($insurance_id, "id");
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
                array_push($value_columns, $insurance_id);

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
                    "id" => $insurance_id,
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

    public function delete($insurance_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($insurance_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer->bind_param("i", $insurance_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $insurance_id,
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

    public function getAvailable($pdf=FALSE){
        try {
            $date = "'".date("Y-m-d H:i:s")."'";

            $quer = "";
            $types = "";
            $bp_value = [];
            if (isset($_POST["estado_seguro"]) && trim($_POST["estado_seguro"])) {
                array_push($bp_value, $_POST["estado_seguro"]);
                if ($_POST["estado_seguro"] == 1) {
                    $quer .= " AND periodob > $date";
                } else {
                    $quer .= " AND periodob <= $date";
                }
            }
            
            $date_status = $this->mySubQuery("estado_fecha");
            $date_expired = $this->mySubQuery("fecha_porvencer");
            $insurancetype_name = $this->mySubQuery("nombre_tiposeguro");

            $consulta = $this->db->prepare("SELECT *, $date_status, $date_expired, $insurancetype_name FROM $this->t_name WHERE empresa_id = '$this->empresa_id' $quer ORDER BY codigo");
            if ($types) {
                $consulta->bind_param($types, ...$bp_value);
            }
            $consulta->execute();
            $req =  $consulta->get_result();
            $data = $this->db->all($req, MYSQLI_ASSOC);
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
            ];

            if (isset($_POST["informacion"])) {
                $info = json_decode($_POST["informacion"]);
                $this->res["info"] = $info;
            }
            if (isset($_POST["informacion"]) && !$pdf) {
                require_once "../db/af_env.php";
                $url = $AF_ENV["apiUrl"] . "/app/cm/api/listaProveedor/$this->empresa_id";
                $getData = file_get_contents($url);
                $dataCompany = json_decode($getData, true);
                $id_name = [];
                foreach ($dataCompany as $key => $value) {
                    $id_name[$value["id"]] = $value["nombre"];
                }
                $this->res["company"] = $id_name;
            }
            if ($pdf) {
                require_once "../db/af_env.php";
                $url = $AF_ENV["apiUrl"] . "/app/cm/api/listaProveedor/$this->empresa_id";
                $getData = file_get_contents($url);
                $dataCompany = json_decode($getData, true);
                $id_name = [];
                foreach ($dataCompany as $key => $value) {
                    $id_name[$value["id"]] = $value["nombre"];
                }
                $this->res["company"] = $id_name;
                require_once "pdf/filesInsurance.php";
                $object = new FilesInsurance();
                $object->reports($this->res);
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

    // obtener los seguros vencidos y los que estan por vencer 168 horas antes
    public function getExpired(){
        try {
            $date = "'".date("Y-m-d H:i:s")."'";
            
            $date_status = $this->mySubQuery("estado_fecha");
            $date_expired = $this->mySubQuery("fecha_porvencer");
            // $insurancetype_name = $this->mySubQuery("nombre_tiposeguro");
            $hour = $this->hour;

            $consulta = $this->db->query("SELECT $date_status, $date_expired FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND estadoseguro IS NULL AND periodob <= DATE_ADD($date, INTERVAL $hour HOUR)");
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