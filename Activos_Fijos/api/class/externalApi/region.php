<?php

// require_once "../../db/conexion.php";

class Region
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
        $this->t_name = "region"; 
        $this->col_id = "idregion"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getAll(){
        try {
            $consulta = $this->db_em->query("SELECT * FROM $this->t_name WHERE MD5(idempresa) = '$this->empresa_id' ORDER BY $this->col_id DESC");
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
            $consulta = $this->db_em->query("SELECT * FROM $this->t_name WHERE MD5(idempresa) = '$this->empresa_id'");
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
}

?>