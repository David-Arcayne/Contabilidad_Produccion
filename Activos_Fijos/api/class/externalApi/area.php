<?php

// require_once "../../db/conexion.php";

class Area
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
        $this->db_rh = new DBConnection("rrhh");
        $this->db_em = new DBConnection("empresa"); 
        $this->t_name = "areas"; 
        $this->col_id = "idareas"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getAll(){
        try {
            $consulta = $this->db_rh->query("SELECT * FROM $this->t_name  ORDER BY $this->col_id DESC");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);
            $this->res = [
                "status" => 200,
                "rows" => $this->db_rh->rows($consulta),
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
            $quer_sucursal=$this->db_em->prepare("SELECT idsucursalcontable FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id'");
            $quer_sucursal->execute();
            $result_su =  $quer_sucursal->get_result();
            $array_su_id = array();
            while ($sucursal = $this->db_em->assoc($result_su)) {
                array_push($array_su_id, $sucursal["idsucursalcontable"]);
            }
            $string_su_id = implode(", ", $array_su_id);
       

            $quer_trabajador=$this->db_rh->prepare("SELECT idareas, nombre FROM $this->t_name WHERE sucursal_idsucursal IN ($string_su_id)");
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();
            $data = $this->db_rh->all($result_t, MYSQLI_ASSOC);
           
            $this->res = [
                "status" => 200,
                "rows" => $this->db_rh->rows($result_t),
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

    public function getById($category_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($category_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $consulta->bind_param("s", $category_id);
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

    public function getAllEnabledByBO($bo_id){
        try {
            $quer_trabajador=$this->db_rh->prepare("SELECT idareas, nombre FROM $this->t_name  WHERE sucursal_idsucursal = ?");
            $quer_trabajador->bind_param("i", $bo_id);
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();
            $data = $this->db_rh->all($result_t, MYSQLI_ASSOC);
           
            $this->res = [
                "status" => 200,
                "rows" => $this->db_rh->rows($result_t),
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