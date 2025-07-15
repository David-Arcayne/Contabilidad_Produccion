<?php

// require_once "../../db/conexion.php";

class BranchOffice
{
    private $db;
    private $db_em;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->db_em = new DBConnection("empresa"); 
        $this->t_name = "sucursalcontable"; 
        $this->col_id = "idsucursalcontable"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getAll(){
        try {
            $consulta = $this->db_em->query("SELECT * FROM $this->t_name  ORDER BY $this->col_id DESC");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);
            $this->res = [
                "status" => 200,
                "rows" => $this->db_em->rows($consulta),
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
            $consulta = $this->db_em->query("SELECT * FROM $this->t_name WHERE MD5(idorganizacion) = '$this->empresa_id'");
            $data = $consulta->fetch_all(MYSQLI_ASSOC);
            $this->res = [
                "status" => 200,
                "rows" => $this->db_em->rows($consulta),
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
}

?>