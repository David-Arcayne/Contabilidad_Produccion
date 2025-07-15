<?php

class DepreciationBox
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    private $tipo_inv_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "cuadrodepreciacion"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
        $this->tipo_inv_id = isset($_SESSION["af_tipoinventario"]) ? $_SESSION["af_tipoinventario"]->tipo_inventario : null;
    }

    public function getAll(){

        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND tipoinventario_id = '$this->tipo_inv_id'";
            }

            $consulta = $this->db->query("SELECT fechadepreciacion AS id, depreciacion_mixto, metododepreciacion_id, tipoinventario_id, (SELECT nombre FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id) AS nombreinventario FROM $this->t_name WHERE empresa_id = '$this->empresa_id' $eti_query GROUP BY fechadepreciacion, tipoinventario_id, metododepreciacion_id, depreciacion_mixto  ORDER BY metododepreciacion_id, fechadepreciacion DESC");
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

    public function getByDate($dpr_date){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isDate($dpr_date, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $consulta->bind_param("s", $dpr_date);
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

    public function delete($dpr_date, $m_dpr_id, $dpr_mix, $invtype_id = null){
        $valid = new Validations($this->t_name);

        $valid_date = $valid->isNumber($dpr_date, "fecha depreciación");
        $valid_id = $valid->isNumber($m_dpr_id, "id depreciación");
        $dmix = $dpr_mix === "si" ? 1 : 0;
        $valid_mix = ($dmix === 1 || $dmix === 0) ? false : true;
        if($valid_date && $valid_id && $valid_mix) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $vars = [$dpr_date, $m_dpr_id, $dmix];
            $eti_query = "AND tipoinventario_id IS NULL";
            $etypes = "";
            if ($invtype_id) {
                $eti_query = "AND tipoinventario_id = ?";
                $etypes = "i";
                array_push($vars, $invtype_id);
            }
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND fechadepreciacion = ? AND metododepreciacion_id = ? AND depreciacion_mixto = ? $eti_query");
            $quer->bind_param("sii".$etypes, ...$vars);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $dpr_date,
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
}

?>