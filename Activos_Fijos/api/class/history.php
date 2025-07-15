<?php

class History
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
        $this->t_name = "historial"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
        $this->tipo_inv_id = isset($_SESSION["af_tipoinventario"]) ? $_SESSION["af_tipoinventario"]->tipo_inventario : null;
    }

    private function mySubQuery ($sq) {
        $nhs="SELECT nombre FROM tiposituacion WHERE id = $this->t_name.tiposituacion_id";
        
        $idhs="SELECT id FROM tiposituacion WHERE id = $this->t_name.tiposituacion_id AND empresa_id = '$this->empresa_id'";

        $nfa="SELECT nombre FROM activosfijos WHERE id = $this->t_name.activosfijos_id";
    
        $cfa="SELECT codigo FROM activosfijos WHERE id = $this->t_name.activosfijos_id";

        $nc="SELECT nombre FROM componentes WHERE id = $this->t_name.componentes_id";

        $dt="";
        if ($sq == "tiempo_salida") {
            $date = date("Y-m-d H:i:s");
            $queryHour = $this->db->query("SELECT tiempo FROM tiempoalerta WHERE empresa_id = '$this->empresa_id' AND nombre = 'alertasituacion'");
            $dataHour = $queryHour->fetch_assoc();
            $hour = isset($dataHour["tiempo"]) ? $dataHour["tiempo"] : 24;

            $dt = "SELECT IF(fechafin <= DATE_ADD('$date', INTERVAL $hour HOUR) AND fechasalida IS NULL, 1, 0)";
        }

        $list = [
            "nombre_tiposituacion" => "($nhs) as 'nombretiposituacion'", 
            "id_tiposituacion" => "($idhs)", 
            "nombre_activofijo" => "($nfa) as 'nombreactivofijo'", 
            "codigo_activofijo" => "($cfa) as 'codigoactivofijo'",
            "nombre_componente" => "($nc) as 'nombrecomponente'", 
            "tiempo_salida" => "($dt) as 'tiemposalida'", 
        ];

        return $list[$sq];
    }

    public function getAll(){
        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND (SELECT tipoinventario_id FROM activosfijos WHERE id = $this->t_name.activosfijos_id) = $this->tipo_inv_id";
            }
            $situationtype_name = $this->mySubQuery("nombre_tiposituacion");
            $situationtype_id = $this->mySubQuery("id_tiposituacion");
            $fixedasset_name = $this->mySubQuery("nombre_activofijo");
            $fixedasset_code = $this->mySubQuery("codigo_activofijo");
            $component_name = $this->mySubQuery("nombre_componente");
            $departure_time = $this->mySubQuery("tiempo_salida");

            $consulta = $this->db->query(
                "SELECT *, $situationtype_name, $fixedasset_name, $fixedasset_code, $component_name, $departure_time
                FROM $this->t_name
                WHERE tiposituacion_id = $situationtype_id $eti_query ORDER BY $this->col_id DESC"
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
            $situationtype_id = $this->mySubQuery("id_tiposituacion");

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE $this->col_id = ? AND tiposituacion_id = $situationtype_id");
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

    public function create(){

        $valid = new Validations($this->t_name);

        $_POST["estado"] = 1;
        $_POST["estadoactivo"] = 2;
        if (isset($_POST["componentes_id"]) && !trim($_POST["componentes_id"])) $_POST["componentes_id"] = null; 

        $code = uniqid($_POST["activosfijos_id"].rand(0,99)."-");
        $_POST["codigo"] = $code;
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
                $insert_columns = implode(", ", array_keys($v_form));
                $value_columns = array_values($v_form);
                $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                $bind_types = str_repeat("s", count($v_form));

                $extra_query = "";
    
                $fa_id = $v_form["activosfijos_id"];
                if (isset($v_form["componentes_id"])) {
                    $comp_id = $v_form["componentes_id"];
                    $extra_query = "AND componentes_id = $comp_id";
                } else {
                    $extra_query = "AND componentes_id IS NULL";
                }
                    # code...
                // $last_id = $this->db->query("SELECT MAX($this->col_id) as last_id FROM $this->t_name WHERE activosfijos_id = $fa_id")->fetch_assoc()["last_id"];
                $this->db->query("UPDATE $this->t_name SET estado = 0 WHERE estado = 1 AND activosfijos_id = $fa_id $extra_query");

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

    public function edit($history_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($history_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        $_POST["estadoactivo"] = 1;
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
                $this->db->begin_transaction();
                $situationtype_id = $this->mySubQuery("id_tiposituacion");
                
                $queryHV = $this->db->query("SELECT (COALESCE(MAX(cod_comprobante), 0 ) + 1) AS codigocomprobante FROM historial WHERE tiposituacion_id = $situationtype_id");
                $dataMV = $queryHV->fetch_assoc();
                $cod_comprobante = $dataMV["codigocomprobante"];
                $v_form["cod_comprobante"] = $cod_comprobante;

                $name_columns = array_keys($v_form);
                $value_columns = array_values($v_form);
                array_push($value_columns, $history_id);

                $bind_types = str_repeat("s", count($v_form));
                $prepare_marks = "";
                foreach ($name_columns as $value) {
                    $prepare_marks .= $value." = ?, ";
                }
                $prepare_marks = substr($prepare_marks, 0, -2);

                $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND tiposituacion_id = $situationtype_id");
                $quer->bind_param($bind_types."i", ...$value_columns);
                $quer->execute();

                if (isset($_POST["enviarcontabilidad"]) && trim($_POST["enviarcontabilidad"]) == 1) {
                    $fa_id = $this->db->query("SELECT activosfijos_id FROM $this->t_name WHERE $this->col_id = $history_id")->fetch_assoc()["activosfijos_id"];
                    $date = $_POST["c_fecha"];
                    $amount = $_POST["c_monto"];
                    $detail = $_POST["c_detalle"];
                    $type = $_POST["c_tipo"];
                    $querCA=$this->db->prepare("INSERT INTO montoscontabilidad (detalle, fecha, monto, activosfijos_id, empresa_id, tipo, creado_en, usu_creador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    $querCA->bind_param("sssisiss", $detail, $date, $amount, $fa_id, $this->empresa_id, $type, $_POST["editado_en"], $_SESSION["yofinanciero"]);
                    $querCA->execute();
                }

                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $quer->affected_rows,
                    "id" => $history_id,
                    "data" => $v_form
                ];
                $this->db->commit();
            } catch (Throwable $th) {
                $this->res = [
                    "status" => 500,
                    "msg_error" => "error al actualizar $this->t_name",
                ];
                $this->db->rollback();
            }
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));

    }

    public function delete($category_id){
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
            $situationtype_id = $this->mySubQuery("id_tiposituacion");

            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND tiposituacion_id = $situationtype_id");
            $quer->bind_param("i", $category_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $category_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al eliminar $this->t_name",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function search($code){
        try {
            $situationtype_id = $this->mySubQuery("id_tiposituacion");

            // $code = "{$code}%";
            $fa_id = $code;

            $situationtype_name = $this->mySubQuery("nombre_tiposituacion");
            $fixedasset_name = $this->mySubQuery("nombre_activofijo");
            $fixedasset_code = $this->mySubQuery("codigo_activofijo");
            $component_name = $this->mySubQuery("nombre_componente");
            $departure_time = $this->mySubQuery("tiempo_salida");

            // $consulta=$this->db->prepare("SELECT *, $situationtype_name, $fixedasset_name, $component_name FROM $this->t_name WHERE codigo LIKE ? AND tiposituacion_id = $situationtype_id");
            $consulta=$this->db->prepare(
                "SELECT *, $situationtype_name, $fixedasset_name, $fixedasset_code, $component_name, $departure_time
                FROM $this->t_name 
                WHERE activosfijos_id = ? 
                    AND tiposituacion_id = $situationtype_id ORDER BY $this->col_id DESC"
            );
            // $consulta->bind_param("s", $code);
            $consulta->bind_param("s", $fa_id);
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

    public function getAvailabilityNotification(){
        try {
            $date = date("Y-m-d H:i:s");
            $queryHour = $this->db->query("SELECT tiempo FROM tiempoalerta WHERE empresa_id = '$this->empresa_id' AND nombre = 'alertasituacion'");
            $dataHour = $queryHour->fetch_assoc();
            $hour = isset($dataHour["tiempo"]) ? $dataHour["tiempo"] : 24;

            $date = date("Y-m-d H:i:s");
            $situationtype_id = $this->mySubQuery("id_tiposituacion");
            $consulta = $this->db->query("SELECT COUNT(id) AS cantidad FROM $this->t_name WHERE tiposituacion_id = $situationtype_id AND fechasalida IS NULL AND fechafin <= DATE_ADD('$date', INTERVAL $hour HOUR)");
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

    public function ProofSituation($history_id, $js = null){
        try {
            $situationtype_id = $this->mySubQuery("id_tiposituacion");
            $situationtype_name = $this->mySubQuery("nombre_tiposituacion");
            $fixedasset_name = $this->mySubQuery("nombre_activofijo");
            $fixedasset_code = $this->mySubQuery("codigo_activofijo");
            $component_name = $this->mySubQuery("nombre_componente");

            $consulta=$this->db->prepare("SELECT *, $situationtype_name, $fixedasset_name, $fixedasset_code, $component_name FROM $this->t_name WHERE $this->col_id = ? AND tiposituacion_id = $situationtype_id");
            $consulta->bind_param("s", $history_id);
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->assoc($req);

            if ($data["usu_creador"] || $data["usu_editor"]) {
                $idusuarios = $data["usu_creador"] ? ($data["usu_editor"] ? "'".$data["usu_creador"]."', '".$data["usu_editor"]."'" : "'".$data["usu_creador"]."'") : "'".$data["usu_editor"]."'";

                $db_rh = new DBConnection("rrhh");
                $quer_trabajador=$db_rh->prepare(
                    "SELECT CONCAT(t.nombre, ' ', t.apellido) AS nombretrabajador,
                        MD5(u.idusuario) AS md5idusuario
                    FROM usuario u
                    INNER JOIN trabajador t ON u.trabajador_idtrabajador = t.idtrabajador
                    WHERE MD5(u.idusuario) IN ($idusuarios) AND MD5(u.idempresa) = '$this->empresa_id'");
                $quer_trabajador->execute();
                $result_t =  $quer_trabajador->get_result();
                while ($dataT = $result_t->fetch_assoc()) {
                    if ($data["usu_creador"] == $dataT["md5idusuario"]) {
                        $data["nombrecreador"] = $dataT["nombretrabajador"];
                    }
                    if ($data["usu_editor"] == $dataT["md5idusuario"]) {
                        $data["nombreeditor"] = $dataT["nombretrabajador"];
                    }
                }
            }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
            ];
            if (!$js) {
                require_once "pdf/filesVoucher.php";
                $object = new FilesVoucher();
                $object->ProofHistory($this->res, [...$_POST]);
                return;
            }
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "Se requiren valores de UFVs hasta la fecha ". date('d/m/Y', strtotime('-1 year', strtotime($_POST["fechadepreciacion"]))),
            ];
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
}

?>