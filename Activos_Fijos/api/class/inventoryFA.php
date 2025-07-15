<?php

class InventoryFA
{
    private $db;
    private $res;
    private $t_name;
    private $col_id;
    private $empresa_id;
    public function __construct()
    {
        $this->db = new DBConnection();
        $this->t_name = "activosinventarios"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    public function getByFAId($fa_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fa_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }
        try {
            // $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND observacion IS NOT NULL AND activosfijos_id = '$fa_id' AND accion = 2 ORDER BY $this->col_id DESC");
            $consulta = $this->db->query(
                "SELECT ai.*,
                oai.id AS obs_id, oai.cantidad AS obs_cantidad, oai.observacion AS obs_observacion
                FROM $this->t_name ai
                INNER JOIN observacionesainventarios oai ON ai.id = oai.activosinventarios_id
                WHERE ai.empresa_id = '$this->empresa_id' AND ai.activosfijos_id = '$fa_id' AND oai.estado = 0 AND oai.tipo = 2 ORDER BY $this->col_id DESC"
            );
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
    public function getAllNotifications($action){
        $valid = new Validations($this->t_name);

        try {
            // $consulta = $this->db->query(
            //     "SELECT ai.*,
            //     af.codigo AS codigoaf, af.nombre AS nombreaf, af.detalle AS detalleaf,
            //     (select nombre from tipoinventario where id = af.tipoinventario_id) as nombretipoinventario
            //     FROM $this->t_name ai
            //     INNER JOIN activosfijos af ON ai.activosfijos_id = af.id
            //     WHERE ai.empresa_id = '$this->empresa_id' AND ai.observacion IS NOT NULL AND ai.accion = $action ORDER BY $this->col_id ASC"
            // );
            // $consulta = $this->db->query(
            //     "SELECT ai.*,
            //     oai.id AS obs_id, oai.cantidad AS obs_cantidad,
            //     af.codigo AS codigoaf, af.nombre AS nombreaf, af.detalle AS detalleaf, af.id AS idaf, af.eliminado_en AS eliminado_en_af,
            //     (select nombre from tipoinventario where id = af.tipoinventario_id) as nombretipoinventario
            //     FROM $this->t_name ai
            //     INNER JOIN activosfijos af ON ai.activosfijos_id = af.id
            //     INNER JOIN observacionesainventarios oai ON ai.id = oai.activosinventarios_id
            //     WHERE ai.empresa_id = '$this->empresa_id' AND ai.observacion IS NOT NULL AND oai.estado = 0 AND oai.tipo = $action ORDER BY $this->col_id ASC"
            // );
            $consulta = $this->db->query(
                "SELECT ai.*,
                oai.id AS obs_id, oai.cantidad AS obs_cantidad, oai.observacion AS obs_observacion,
                af.codigo AS codigoaf, af.nombre AS nombreaf, af.detalle AS detalleaf, af.id AS idaf, af.eliminado_en AS eliminado_en_af,
                (select nombre from tipoinventario where id = af.tipoinventario_id) as nombretipoinventario
                FROM $this->t_name ai
                INNER JOIN activosfijos af ON ai.activosfijos_id = af.id
                INNER JOIN observacionesainventarios oai ON ai.id = oai.activosinventarios_id
                WHERE ai.empresa_id = '$this->empresa_id' AND oai.estado = 0 AND oai.tipo = $action ORDER BY $this->col_id ASC"
            );
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
    
    public function getAssignedByFAId($fa_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fa_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }
        try {
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND activosfijos_id = '$fa_id' AND inventarios_id IS NULL AND cantidad > 0 ORDER BY $this->col_id ASC");
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

    public function editAction($inventory_a_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($inventory_a_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {            
            // $quer=$this->db->prepare("UPDATE $this->t_name SET accion = 1 WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer=$this->db->prepare("UPDATE observacionesainventarios SET estado = 1 WHERE id = ? AND activosinventarios_id = (SELECT id FROM $this->t_name WHERE id = observacionesainventarios.activosinventarios_id AND empresa_id = '$this->empresa_id')");
            $quer->bind_param("s", $inventory_a_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $inventory_a_id,
                "data" => ""
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al actualizar $this->t_name",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));

    }

    public function getObservation(){
        try {
            // $consulta = $this->db->query("SELECT codigo FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND observacion IS NOT NULL AND accion = 2");
            $consulta = $this->db->query(
                "SELECT ai.codigo 
                FROM $this->t_name ai
                INNER JOIN observacionesainventarios oai ON ai.id = oai.activosinventarios_id
                WHERE ai.empresa_id = '$this->empresa_id' AND oai.estado = 0 AND oai.tipo = 2"
            );
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

    public function getNotification($type){
        try {
            // $consulta = $this->db->query("SELECT COUNT(id) AS cantidad FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND observacion IS NOT NULL AND accion = '$type'");
            $consulta = $this->db->query(
                "SELECT COUNT(oai.id) AS cantidad 
                FROM $this->t_name ai
                INNER JOIN observacionesainventarios oai ON ai.id = oai.activosinventarios_id
                WHERE ai.empresa_id = '$this->empresa_id' AND oai.estado = 0 AND oai.tipo = '$type'"
            );
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
}

?>