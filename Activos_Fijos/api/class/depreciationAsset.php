<?php

class DepreciationAsset
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
        $this->t_name = "depreciacionactivo"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
        $this->tipo_inv_id = isset($_SESSION["af_tipoinventario"]) ? $_SESSION["af_tipoinventario"]->tipo_inventario : null;
    }

    public function getAll(){

        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND (SELECT tipoinventario_id FROM activosfijos WHERE id = $this->t_name.activosfijos_id) = $this->tipo_inv_id";
            }
            $consulta = $this->db->query(
                "SELECT *, 
                    (SELECT nombre FROM activosfijos WHERE id = $this->t_name.activosfijos_id) AS nombreactivofijo, 
                    (SELECT detalle FROM activosfijos WHERE id = $this->t_name.activosfijos_id) AS detalleactivofijo, 
                    (SELECT codigo FROM activosfijos WHERE id = $this->t_name.activosfijos_id) AS codigoactivofijo 
                FROM $this->t_name 
                WHERE empresa_id = '$this->empresa_id' 
                    $eti_query
                    ORDER BY metododepreciacion_id");
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

    public function create(){

        $arrFA = (isset($_POST["activosfijos_id"])) ? $_POST["activosfijos_id"] : [];
        unset($_POST["activosfijos_id"]);

        $valid = new Validations($this->t_name);

        $_POST["empresa_id"] = $this->empresa_id;

        $isAll = (isset($_POST["seleccionar_todo"])) ? 1 : null;

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
    
                $queryId= "";
                $queryRow= 0;
                if ($isAll) {
                    $eti_query = "";
                    if ($this->tipo_inv_id) {
                        $eti_query = "AND tipoinventario_id = $this->tipo_inv_id";
                    }
                    $queryFA = $this->db->query(
                        "SELECT id 
                        FROM activosfijos 
                        WHERE eliminado_en is NULL 
                            AND tipoinventario_id  = (SELECT id FROM tipoinventario WHERE id = activosfijos.tipoinventario_id AND tipo = 1)  
                            $eti_query
                            AND categorias_id = (SELECT id FROM categorias WHERE empresa_id = '$this->empresa_id' AND id = activosfijos.categorias_id) 
                            AND id NOT IN (SELECT activosfijos_id FROM $this->t_name WHERE empresa_id = '$this->empresa_id')"
                    );

                    $dprId = $_POST["metododepreciacion_id"];
                    while ($rowFA = $queryFA->fetch_assoc()) {
                        $idFA = $rowFA["id"];

                        $queryMFA = $this->db->query("INSERT INTO $this->t_name (empresa_id, activosfijos_id, metododepreciacion_id) VALUES ('$this->empresa_id', '$idFA', '$dprId')");
                    }
                } else {
                    $insert_columns = implode(", ", array_keys($v_form));
                    $value_columns = array_values($v_form);
                    $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                    $bind_types = str_repeat("s", count($v_form));

                    foreach ($arrFA as $value) {
                        $quer=$this->db->prepare("INSERT INTO $this->t_name (activosfijos_id, $insert_columns) VALUES ($prepare_marks, ?)");
                        $quer->bind_param($bind_types."s", $value, ...$value_columns);
                        $quer->execute();
                        $queryRow ++;
                    }
                    // $queryId = $quer->insert_id;
                }
    
                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $queryRow, 
                    "id" => $queryId, 
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

    public function edit($state_t_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($state_t_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        if (isset($_POST["activosfijos_id"]) && !trim($_POST["activosfijos_id"])) unset($_POST["activosfijos_id"]);
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
                array_push($value_columns, $state_t_id);

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
                    "id" => $state_t_id,
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

    public function delete($state_t_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($state_t_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer->bind_param("i", $state_t_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $state_t_id,
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

    public function deleteAll(){

        try {
            $this->db->begin_transaction();

            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND (SELECT tipoinventario_id FROM activosfijos WHERE id = $this->t_name.activosfijos_id) = $this->tipo_inv_id";
            }
            $queryDprFAId = $this->db->query("SELECT id FROM $this->t_name WHERE empresa_id = '$this->empresa_id' $eti_query");

            while ($rowDprFAId = $queryDprFAId->fetch_assoc()) {
                $idDprFA = $rowDprFAId["id"];
                $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE id = ? AND empresa_id = '$this->empresa_id'");
                $quer->bind_param("i", $idDprFA);
                $quer->execute();
            }

            $this->res = [
                "status" => 200, 
                "affected_rows" => $this->db->rows($queryDprFAId),
                "id" => "",
                "data" => "",
            ];
            $this->db->commit();
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "Error al eliminar $this->t_name",
            ];
            $this->db->rollback();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function report($pdf=FALSE){

        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND af.tipoinventario_id = $this->tipo_inv_id";
            }

            $quer = "";
            $types = "";
            $bp_value = [];
            $notInDA = "";
            if (isset($_POST["metodo_dep_id"]) && trim($_POST["metodo_dep_id"])) {
                if (in_array($_POST["metodo_dep_id"], [1,2,3]) ) {
                    $types.="s";
                    array_push($bp_value, $_POST["metodo_dep_id"]);
                    $quer .= " AND da.metododepreciacion_id = ?";
                } else if ($_POST["metodo_dep_id"] == 11) {
                    $notInDA = "SELECT 
                        af.nombre AS nombreactivofijo, af.detalle detalleactivofijo, af.codigo AS codigoactivofijo 
                        FROM activosfijos af
                        LEFT JOIN $this->t_name da ON af.id = da.activosfijos_id
                        INNER JOIN categorias c ON c.id = af.categorias_id
                        INNER JOIN tipoinventario ti ON ti.id = af.tipoinventario_id
                        WHERE c.empresa_id = '$this->empresa_id' 
                            AND da.activosfijos_id IS NULL
                            AND ti.tipo = 1
                            $eti_query
                            ORDER BY af.codigo";
                }
            }
            $consulta = null;
            if ($notInDA) {
                $consulta = $this->db->prepare($notInDA);
            } else {
                $consulta = $this->db->prepare(
                    "SELECT da.*, 
                        af.nombre AS nombreactivofijo, af.detalle detalleactivofijo, af.codigo AS codigoactivofijo 
                    FROM $this->t_name da
                    INNER JOIN activosfijos af ON af.id = da.activosfijos_id
                    WHERE da.empresa_id = '$this->empresa_id' $quer $eti_query ORDER BY da.metododepreciacion_id"
                );
                if ($types) {
                    $consulta->bind_param($types, ...$bp_value);
                }
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
            if ($pdf) {
                require_once "pdf/filesFixedAsset.php";
                $object = new FilesFixedAsset();
                $object->reportFADep($this->res);
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