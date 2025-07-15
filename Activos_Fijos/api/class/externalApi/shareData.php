<?php

class ShareData
{
    private $db;
    private $res;
    public function __construct()
    {
        $this->db = new DBConnection();
    }

    public function getStoA($empresa_id){

        try {
            $consulta = $this->db->prepare("SELECT id, detalle AS glosa, fecha, monto, tipo AS asientomodelo_id FROM montoscontabilidad WHERE empresa_id = ? ORDER BY fecha ASC");
            $consulta->bind_param("s", $empresa_id);
            $consulta->execute();

            $req = $consulta->get_result();
            $data = $this->db->all($req, MYSQLI_ASSOC);
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "error al listar los datos",
            ];
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }    
}

?>