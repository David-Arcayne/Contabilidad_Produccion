<?php

use LDAP\Result;

class Movement
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
        
        $this->t_name = "movimientos"; 
        $this->col_id = "id"; 
        $this->empresa_id = $_SESSION["organizacion"];
    }

    private function connectionDB ($type = NULL) {
        if ($type == "rh") {
            $this->db_rh = new DBConnection("rrhh");
        } else if ($type == "em") {
            $this->db_em = new DBConnection("empresa"); 
        } else {
            $this->db_rh = new DBConnection("rrhh");
            $this->db_em = new DBConnection("empresa"); 
        }
    }

    private function mySubQuery ($sq) {
        $nd = "SELECT nombre FROM departamentos WHERE id = (
                SELECT departamentos_id FROM personal WHERE id = $this->t_name.personal_id
            )";

        $idd = "SELECT departamentos_id FROM personal WHERE id = $this->t_name.personal_id";

        $np = "SELECT nombre FROM personal WHERE id = $this->t_name.personal_id";
        $nfa = "SELECT nombre FROM activosfijos WHERE id = $this->t_name.activosfijos_id";

        $list = [
            "nombre_departamento" => "($nd) as 'nombredepartamento'", 
            "id_departamento" => "($idd) as 'iddepartamento'", 
            "nombre_personal" => "($np) as 'nombrepersonal'", 
            "nombre_activofijo" => "($nfa) as 'nombreactivofijo'", 
        ];

        return $list[$sq];
    }

    public function getAll(){

        try {
            $this->connectionDB();
            $quer_sucursal=$this->db_em->prepare("SELECT idsucursalcontable, MD5(idsucursalcontable) AS md5idsucursal, nombre FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id'");
            $quer_sucursal->execute();
            $result_su =  $quer_sucursal->get_result();
            $array_su = array();
            $array_su_id = array();
            while ($sucursal = $this->db_em->assoc($result_su)) {
                $array_su[$sucursal["md5idsucursal"]] = $sucursal["nombre"];
                $array_su[$sucursal["md5idsucursal"]."id"] = $sucursal["idsucursalcontable"];
                array_push($array_su_id, $sucursal["idsucursalcontable"]);
            }
            
            $string_su_id = implode(", ", $array_su_id);
            $quer_area=$this->db_rh->prepare("SELECT idareas, MD5(idareas) AS md5idarea, nombre FROM areas WHERE sucursal_idsucursal IN ($string_su_id)");
            $quer_area->execute();
            $result_a =  $quer_area->get_result();
            $array_area = array();
            while ($area = $this->db_rh->assoc($result_a)) {
                $array_area[$area["md5idarea"]] = $area["nombre"];
                $array_area[$area["md5idarea"]."id"] = $area["idareas"];
            }

            $quer_trabajador=$this->db_rh->prepare("SELECT 
                    t.idtrabajador, t.nombre, t.apellido,
                    MD5(u.idusuario) AS md5idusuario
                FROM trabajador t
                LEFT JOIN usuario u ON t.idtrabajador = u.trabajador_idtrabajador
                INNER JOIN cargos c ON t.cargos_idcargos = c.idcargos
                INNER JOIN areas a ON c.areas_idareas = a.idareas
                WHERE a.sucursal_idsucursal IN ($string_su_id);");
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();

            

            $array_tr = array();
            while ($trabajador = $this->db_rh->assoc($result_t)) {
                $array_tr[$trabajador["idtrabajador"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                $array_tr[$trabajador["idtrabajador"]."id"] = $trabajador["idtrabajador"];
                if (!empty($trabajador["md5idusuario"])) {
                    $array_tr[$trabajador["md5idusuario"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                }
            }
            /**
             *  Obtener los datos de movimientos
             * 
             * -   NULL = Solicitud ASIGNACIÓN (NUEVO),         Administrador ASINACIÓN (PENDIENTE)
             * -      1 = Solicitud ASIGNACIÓN (APROBADA AT-C), Administrador ASINACIÓN (APROBADA)
             * -      2 = Solicitud ASIGNACIÓN (PENDIENTE)
             * -      3 = Solicitud ASIGNACIÓN (RECHAZADO RT)
             * -      5 = Solicitud DEVOLUCIÓN (NUEVO),         Administrador DEVOLUCIÓN (PENDIENTE)
             * -      6 = Solicitud DEVOLUCIÓN (APROBADA AT-C), Administrador DEVOLUCIÓN (APROBADA)
             * -      7 = Solicitud DEVOLUCIÓN (RECHAZADO RT)
             * -      8 = Solicitud DEVOLUCIÓN (PENDIENTE)
             * -     11 = Reasignación (PENDIENTE)
             * -     12 = Reasignación (APROBADA)
             * */ 

            $consulta=$this->db->prepare(
                "SELECT *, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 3 AND movimientos_id = $this->t_name.id) AS estado_r, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 1 AND movimientos_id = $this->t_name.id) AS estado_a, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE movimientos_id = $this->t_name.id) AS estado_t  
                FROM $this->t_name 
                WHERE empresa_id = '$this->empresa_id' AND estado IN (1,3, 6, 7, 12) ORDER BY fecharespuesta DESC");
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->all($req, MYSQLI_ASSOC);
            foreach ($data as $key => $mov) {
                if (!empty($array_tr[$mov["trabajador_id"]])) {
                    $data[$key]["nombresucursal"] = $array_su[$mov["sucursal_id"]];
                    $data[$key]["nombredepartamento"] = $array_area[$mov["departamentos_id"]];
                    $data[$key]["nombrepersonal"] = $array_tr[$mov["trabajador_id"]]; // idpersonal = idusuario
                }
                if (!empty($array_tr[$mov["encargado_id"]])) {
                    $data[$key]["nombreencargado"] = $array_tr[$mov["encargado_id"]];
                }
            }

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
    
    public function getAllByUser(){
        $personal_id = $_SESSION["yofinanciero"];

        try {
            $this->connectionDB();

            $query_manager=$this->db_rh->prepare("SELECT 
                    CONCAT(t.nombre, ' ', t.apellido) AS nombretrabajador,
                    MD5(u.idusuario) AS md5idusuario
                FROM usuario u
                INNER JOIN trabajador t ON u.trabajador_idtrabajador = t.idtrabajador
                WHERE MD5(u.idempresa) = '$this->empresa_id'");
            $query_manager->execute();
            $result_m =  $query_manager->get_result();

            $array_mg = array();
            while ($manager = $this->db_rh->assoc($result_m)) {
                $array_mg[$manager["md5idusuario"]] = $manager["nombretrabajador"];
            }

            $query_worker = $this->db_rh->query("SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$personal_id'");
            $worker_id = $query_worker->fetch_assoc()["trabajador_idtrabajador"];

            $quer_trabajador=$this->db_rh->prepare("SELECT 
                    t.idtrabajador, t.nombre, t.apellido, 
                    c.areas_idareas
                FROM trabajador t
                INNER JOIN cargos c ON t.cargos_idcargos = c.idcargos
                INNER JOIN areas a ON c.areas_idareas = a.idareas
                WHERE idtrabajador = '$worker_id'");
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();
            $trabajador = $this->db_rh->assoc($result_t);
            $area_id = $trabajador["areas_idareas"];

            $quer_area=$this->db_rh->prepare("SELECT idareas, sucursal_idsucursal, MD5(idareas) AS md5idarea, nombre FROM areas WHERE idareas = '$area_id'");
            $quer_area->execute();
            $result_a =  $quer_area->get_result();
            $area = $this->db_rh->assoc($result_a);
            $sucursal_id = $area["sucursal_idsucursal"];

            $quer_sucursal=$this->db_em->prepare("SELECT idsucursalcontable, MD5(idsucursalcontable) AS md5idsucursal, nombre FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id' AND idsucursalcontable = '$sucursal_id'");
            $quer_sucursal->execute();
            $result_su =  $quer_sucursal->get_result();
            $sucursal =  $this->db_em->assoc($result_su);

            $nombre_sucursal = $sucursal["nombre"];
            $nombre_area = $area["nombre"];
            $nombre_trabajador= $trabajador["nombre"] ." ". $trabajador["apellido"];

            $consulta=$this->db->prepare(
                "SELECT *, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 3 AND movimientos_id = $this->t_name.id) AS estado_r, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 1 AND movimientos_id = $this->t_name.id) AS estado_a, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE movimientos_id = $this->t_name.id) AS estado_t 
                FROM $this->t_name 
                WHERE empresa_id = '$this->empresa_id' AND
                    (
                        (estado IN (1,3,6,7) AND trabajador_id = '$worker_id') 
                        OR (
                            estado = 12 
                            AND 1 <= (
                                SELECT COUNT(*) 
                                FROM movimientoactivos
                                WHERE movimientos_id = $this->t_name.id 
                                AND (trabajador_destino = '$worker_id' OR trabajador_id = '$worker_id')
                            )
                        )
                    ) ORDER BY fecharespuesta DESC");
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->all($req, MYSQLI_ASSOC);
            foreach ($data as $key => $mov) {
                $data[$key]["nombresucursal"] = $nombre_sucursal;
                $data[$key]["nombredepartamento"] = $nombre_area;
                $data[$key]["nombrepersonal"] = $nombre_trabajador; // idpersonal = idusuario

                if (isset($array_mg[$mov["encargado_id"]])) {
                    $data[$key]["nombreencargado"] = $array_mg[$mov["encargado_id"]];
                }
            }

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

    public function getAllEnabled(){

        try {
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id'");
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

    public function getById($movement_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($movement_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {

            $department_id = $this->mySubQuery("id_departamento");

            $consulta=$this->db->prepare("SELECT *, $department_id FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $consulta->bind_param("s", $movement_id);
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

    public function getAllByPersonalId(){
        $valid = new Validations($this->t_name);

        $personal_id = $_SESSION["yofinanciero"];

        $valid_id = $valid->isString($personal_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $this->connectionDB("rh");
            $query_worker = $this->db_rh->query("SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$personal_id'");
            $worker_id = $query_worker->fetch_assoc()["trabajador_idtrabajador"];

            $consulta=$this->db->prepare(
                "SELECT *, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 3 AND movimientos_id = $this->t_name.id) AS estado_r, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 1 AND movimientos_id = $this->t_name.id) AS estado_a, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE movimientos_id = $this->t_name.id) AS estado_t 
                FROM $this->t_name 
                WHERE trabajador_id = ? AND empresa_id = '$this->empresa_id' AND personal_id IS NOT NULL ORDER BY $this->col_id DESC");
            $consulta->bind_param("s", $worker_id);
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

    public function getPendingRequest(){
        try {
            $state = 2;
            
            $this->connectionDB();
            $quer_sucursal=$this->db_em->prepare("SELECT idsucursalcontable, MD5(idsucursalcontable) AS md5idsucursal, nombre FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id'");
            $quer_sucursal->execute();
            $result_su =  $quer_sucursal->get_result();
            $array_su = array();
            $array_su_id = array();
            while ($sucursal = $this->db_em->assoc($result_su)) {
                $array_su[$sucursal["md5idsucursal"]] = $sucursal["nombre"];
                $array_su[$sucursal["md5idsucursal"]."id"] = $sucursal["idsucursalcontable"];
                array_push($array_su_id, $sucursal["idsucursalcontable"]);
            }
            $string_su_id = implode(", ", $array_su_id);
            $quer_area=$this->db_rh->prepare("SELECT idareas, MD5(idareas) AS md5idarea, nombre FROM areas WHERE sucursal_idsucursal IN ($string_su_id)");
            $quer_area->execute();
            $result_a =  $quer_area->get_result();
            $array_area = array();
            while ($area = $this->db_rh->assoc($result_a)) {
                $array_area[$area["md5idarea"]] = $area["nombre"];
                $array_area[$area["md5idarea"]."id"] = $area["idareas"];
            }

            $quer_trabajador=$this->db_rh->prepare("SELECT 
                    t.idtrabajador, t.nombre, t.apellido, 
                    MD5(u.idusuario) AS md5idusuario 
                FROM trabajador t
                INNER JOIN usuario u ON t.idtrabajador = u.trabajador_idtrabajador
                INNER JOIN cargos c ON t.cargos_idcargos = c.idcargos
                INNER JOIN areas a ON c.areas_idareas = a.idareas
                WHERE a.sucursal_idsucursal IN ($string_su_id);");
            // $quer_trabajador=$this->db_rh->prepare("SELECT idtrabajador, nombre, apellido, (SELECT MD5(idusuario) FROM usuario WHERE trabajador_idtrabajador = trabajador.idtrabajador) AS md5idusuario FROM trabajador WHERE cargos_idcargos IN (SELECT idcargos FROM cargos WHERE areas_idareas IN (SELECT idareas FROM areas WHERE sucursal_idsucursal IN ($string_su_id)))");
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();
            $array_tr = array();
            while ($trabajador = $this->db_rh->assoc($result_t)) {
                $array_tr[$trabajador["md5idusuario"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                $array_tr[$trabajador["md5idusuario"]."id"] = $trabajador["idtrabajador"];
            }

            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE estado IN ('2', '8') AND empresa_id = '$this->empresa_id'");
            // $consulta->bind_param("i", $state);
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->all($req, MYSQLI_ASSOC);
            foreach ($data as $key => $mov) {
                $data[$key]["nombresucursal"] = $array_su[$mov["sucursal_id"]];
                $data[$key]["nombredepartamento"] = $array_area[$mov["departamentos_id"]];
                $data[$key]["nombrepersonal"] = $array_tr[$mov["personal_id"]]; // idpersonal = idusuario

                $data[$key]["idsucursal"] = $array_su[$mov["sucursal_id"]."id"];
                $data[$key]["iddepartamento"] = $array_area[$mov["departamentos_id"]."id"];
                $data[$key]["idtrabajador"] = $array_tr[$mov["personal_id"]."id"];
            }
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

    public function getDataPendingRequest(){
        try {
            $state = 2;
            $consulta=$this->db->prepare("SELECT * FROM $this->t_name WHERE estado IN (2, 8) AND empresa_id = '$this->empresa_id'");
            // $consulta->bind_param("i", $state);
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

    public function create(){

        $valid = new Validations($this->t_name);

        $_POST["empresa_id"] = $this->empresa_id;
        $_POST["sucursal_id"] = $_SESSION["af_datosyofinanciero"]->empresa->idsucursal;
        $staffId = $_SESSION["yofinanciero"];
        $_POST["departamentos_id"] = $_SESSION["af_datosyofinanciero"]->idarea;
        $user_id = $_SESSION["yofinanciero"];
        $_POST["personal_id"] = $user_id;
        // $_POST["fechasolicitud"] = date("Y-m-d H:i:s");
        $_POST["estado"] = (isset($_POST["tiposolicitud"]) && trim($_POST["tiposolicitud"]) && trim($_POST["tiposolicitud"]) == 2) ? 5 : null;

        $this->connectionDB("rh");
        $queryWorker = $this->db_rh->prepare("SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$user_id'");
        $queryWorker->execute();
        $result_t =  $queryWorker->get_result();
        $worker_id = $this->db_rh->assoc($result_t)["trabajador_idtrabajador"];
        $_POST["trabajador_id"] = $worker_id;
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

    public function edit($movement_id){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($movement_id, "id");
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
                array_push($value_columns, $movement_id);

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
                    "id" => $movement_id,
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

    public function delete($movement_id){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($movement_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer->bind_param("i", $movement_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $movement_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error $this->t_name",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function state($movement_id, $state){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($movement_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $requestDate = date("Y-m-d H:i:s");

            $quer=$this->db->prepare("UPDATE $this->t_name SET estado = '$state', fechasolicitud = '$requestDate' WHERE $this->col_id = ? AND empresa_id = '$this->empresa_id'");
            $quer->bind_param("i", $movement_id);
            $quer->execute();

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $movement_id,
                "data" => "",
            ];
        } catch (Throwable $th) {
            $msg = [
                "msg" => "Error al enviar solicitud",
                "icon" => "error"
            ];
            $this->res = [
                "status" => 500,
                "msg_error" => "error $this->t_name",
            ]; 
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function filters($pdf=FALSE, $pdfW=FALSE){

        try {
            
            $this->connectionDB();
            $quer_sucursal=$this->db_em->prepare("SELECT idsucursalcontable, MD5(idsucursalcontable) AS md5idsucursal, nombre FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id'");
            $quer_sucursal->execute();
            $result_su =  $quer_sucursal->get_result();
            $array_su = array();
            $array_su_id = array();
            while ($sucursal = $this->db_em->assoc($result_su)) {
                $array_su[$sucursal["md5idsucursal"]] = $sucursal["nombre"];
                $array_su[$sucursal["md5idsucursal"]."id"] = $sucursal["idsucursalcontable"];
                array_push($array_su_id, $sucursal["idsucursalcontable"]);
            }
            
            $string_su_id = implode(", ", $array_su_id);
            $quer_area=$this->db_rh->prepare("SELECT idareas, MD5(idareas) AS md5idarea, nombre FROM areas WHERE sucursal_idsucursal IN ($string_su_id)");
            $quer_area->execute();
            $result_a =  $quer_area->get_result();
            $array_area = array();
            while ($area = $this->db_rh->assoc($result_a)) {
                $array_area[$area["md5idarea"]] = $area["nombre"];
                $array_area[$area["md5idarea"]."id"] = $area["idareas"];
            }

            $quer_trabajador=$this->db_rh->prepare("SELECT 
                    t.idtrabajador, t.nombre, t.apellido,
                    MD5(u.idusuario) AS md5idusuario
                FROM trabajador t
                LEFT JOIN usuario u ON t.idtrabajador = u.trabajador_idtrabajador
                INNER JOIN cargos c ON t.cargos_idcargos = c.idcargos
                INNER JOIN areas a ON c.areas_idareas = a.idareas
                WHERE a.sucursal_idsucursal IN ($string_su_id);");
            // $quer_trabajador=$this->db_rh->prepare("SELECT 
            //         t.idtrabajador, t.nombre, t.apellido, 
            //         MD5(u.idusuario) AS md5idusuario 
            //     FROM trabajador t
            //     INNER JOIN usuario u ON t.idtrabajador = u.trabajador_idtrabajador
            //     INNER JOIN cargos c ON t.cargos_idcargos = c.idcargos
            //     INNER JOIN areas a ON c.areas_idareas = a.idareas
            //     WHERE a.sucursal_idsucursal IN ($string_su_id);");
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();

            $workerId = NULL;
            $workerArr = [];
            if(isset($_POST["responsable_id"]) && trim($_POST["responsable_id"])){
                $workerId = $_POST["responsable_id"];
            }
            $array_tr = array();
            while ($trabajador = $this->db_rh->assoc($result_t)) {
                $array_tr[$trabajador["idtrabajador"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                $array_tr[$trabajador["idtrabajador"]."id"] = $trabajador["idtrabajador"];
                if (!empty($trabajador["md5idusuario"])) {
                    $array_tr[$trabajador["md5idusuario"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                }
                if ($workerId && $trabajador["idtrabajador"] == $workerId) {
                    array_push($workerArr, "'". $trabajador["idtrabajador"] ."'");
                }
            }

            $quer = "";
            $types = "";
            $bp_value = [];
            if (isset($_POST["region_id"]) && trim($_POST["region_id"])) {

            }
            if(isset($_POST["sucursal_id"]) && trim($_POST["sucursal_id"])){
                $types.="s";
                array_push($bp_value, $_POST["sucursal_id"]);
                $quer .= " AND sucursal_id = MD5(?)";
            }
            if (isset($_POST["areatrabajo_id"]) && trim($_POST["areatrabajo_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["areatrabajo_id"]);
                $quer .= " AND departamentos_id = MD5(?)";
            }
            if(isset($_POST["responsable_id"]) && trim($_POST["responsable_id"])){
                $workerIn = $workerArr ? implode(", ", $workerArr) : NULL;
                $quer .= $workerIn ? " AND trabajador_id IN ($workerIn)": " AND 1 = 2";
            }
            if (isset($_POST["estado_id"]) && trim($_POST["estado_id"]) && $_POST["estado_id"] != 5) {
                $types.="s";
                array_push($bp_value, $_POST["estado_id"]);
                $quer .= " AND (SELECT IF((SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 1 AND movimientos_id = $this->t_name.id) > 0, 1, 3)) = ?";
            }
            

            $consulta=$this->db->prepare(
                "SELECT *, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 3 AND movimientos_id = $this->t_name.id) AS estado_r, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 1 AND movimientos_id = $this->t_name.id) AS estado_a, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE movimientos_id = $this->t_name.id) AS estado_t 
                FROM $this->t_name 
                WHERE empresa_id = '$this->empresa_id' AND estado IN (1, 3, 6, 7, 12) $quer ORDER BY fecharespuesta DESC");
            if ($quer && $types) {
                $consulta->bind_param($types, ...$bp_value);
            }
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->all($req, MYSQLI_ASSOC);
            foreach ($data as $key => $mov) {
                if (!empty($array_tr[$mov["trabajador_id"]])) {
                    $data[$key]["nombresucursal"] = $array_su[$mov["sucursal_id"]];
                    $data[$key]["nombredepartamento"] = $array_area[$mov["departamentos_id"]];
                    $data[$key]["nombrepersonal"] = $array_tr[$mov["trabajador_id"]]; // idpersonal = idusuario
                }
                if (isset($array_tr[$mov["encargado_id"]])) {
                    $data[$key]["nombreencargado"] = $array_tr[$mov["encargado_id"]];
                }
            }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
            ];
            if ($pdf) {
                $info = json_decode($_POST["informacion"]);
                $this->res["info"] = $info;
                require_once "pdf/filesMovement.php";
                $object = new FilesMovement();
                if ($pdfW) {
                    $object->reportsWorker($this->res, $workerId);
                }else {
                    $object->reports($this->res);
                }
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

    public function filterByUser($pdf=FALSE){

        $personal_id = $_SESSION["yofinanciero"];

        try {
            $this->connectionDB();

            $query_worker = $this->db_rh->query("SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$personal_id'");
            $worker_id = $query_worker->fetch_assoc()["trabajador_idtrabajador"];


            $quer_trabajador=$this->db_rh->prepare("SELECT 
                    t.idtrabajador, t.nombre, t.apellido, 
                    c.areas_idareas
                FROM trabajador t
                INNER JOIN cargos c ON t.cargos_idcargos = c.idcargos
                INNER JOIN areas a ON c.areas_idareas = a.idareas
                WHERE t.idtrabajador = '$worker_id'");
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();
            $trabajador = $this->db_rh->assoc($result_t);
            $area_id = $trabajador["areas_idareas"];

            $quer_area=$this->db_rh->prepare("SELECT idareas, sucursal_idsucursal, MD5(idareas) AS md5idarea, nombre FROM areas WHERE idareas = '$area_id'");
            $quer_area->execute();
            $result_a =  $quer_area->get_result();
            $area = $this->db_rh->assoc($result_a);
            $sucursal_id = $area["sucursal_idsucursal"];

            $quer_sucursal=$this->db_em->prepare("SELECT idsucursalcontable, MD5(idsucursalcontable) AS md5idsucursal, nombre FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id' AND idsucursalcontable = '$sucursal_id'");
            $quer_sucursal->execute();
            $result_su =  $quer_sucursal->get_result();
            $sucursal =  $this->db_em->assoc($result_su);

            $nombre_sucursal = $sucursal["nombre"];
            $nombre_area = $area["nombre"];
            $nombre_trabajador= $trabajador["nombre"] ." ". $trabajador["apellido"];
            
            $quer = "";
            $types = "";
            $bp_value = [];
            if (isset($_POST["estado_id"]) && trim($_POST["estado_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["estado_id"]);
                $quer .= " AND (SELECT IF((SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 1 AND movimientos_id = $this->t_name.id) > 0, 1, 3)) = ?";
            }

            $consulta=$this->db->prepare(
                "SELECT *, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 3 AND movimientos_id = $this->t_name.id) AS estado_r, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE estado = 1 AND movimientos_id = $this->t_name.id) AS estado_a, 
                    (SELECT COUNT(estado) FROM movimientoactivos WHERE movimientos_id = $this->t_name.id) AS estado_t  
                FROM $this->t_name 
                WHERE empresa_id = '$this->empresa_id' AND estado IN (1,3) AND trabajador_id = '$worker_id' $quer ORDER BY $this->col_id DESC");
            if ($quer && $types) {
                $consulta->bind_param($types, ...$bp_value);
            }
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->all($req, MYSQLI_ASSOC);
            foreach ($data as $key => $mov) {
                $data[$key]["nombresucursal"] = $nombre_sucursal;
                $data[$key]["nombredepartamento"] = $nombre_area;
                $data[$key]["nombrepersonal"] = $nombre_trabajador; // idpersonal = idusuario
            }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
            ];
            
            if ($pdf) {
                $info = json_decode($_POST["informacion"]);
                $this->res["info"] = $info;
                require_once "pdf/filesMovement.php";
                $object = new FilesMovement();
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
    
    public function reportMovement($movement_id, $individual = FALSE, $js = FALSE){
        $valid = new Validations($this->t_name);
        $valid_id = $valid->isNumber($movement_id, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $queryMovement=$this->db->prepare("SELECT * FROM $this->t_name WHERE empresa_id = '$this->empresa_id' AND $this->col_id = '$movement_id'");
            $queryMovement->execute();
            $reqM =  $queryMovement->get_result();
            $dataM = $this->db->assoc($reqM);

            if (!$dataM){
                throw new Exception("No se encontraron datos");
            }

            $stateMov = $dataM["estado"];
            $e_query = "";
            if($individual && $stateMov == 12) {
                $this->connectionDB("rh");
                $usuario = $_SESSION["yofinanciero"];
                $worker_id = $this->db_rh->query("SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$usuario'");
                $data_w = $worker_id->fetch_assoc();
                $wid = $data_w["trabajador_idtrabajador"];
                $e_query = "AND (ma.trabajador_destino = $wid OR ma.trabajador_id = $wid)";
            }
            
            // $queryMovFA=$this->db->prepare(
            //     "SELECT *, 
            //         (SELECT estado FROM movimientoactivos WHERE movimientos_id = '$movement_id' AND activosfijos_id = activosfijos.id ) AS estado_ma, 
            //         (SELECT cantidad FROM movimientoactivos WHERE movimientos_id = '$movement_id' AND activosfijos_id = activosfijos.id ) AS cantidad_ma 
            //     FROM activosfijos WHERE id IN (SELECT activosfijos_id FROM movimientoactivos WHERE movimientos_id = '$movement_id')");
            $queryMovFA=$this->db->prepare(
                "SELECT af.*,
                    ma.sucursal_id, ma.sucursal_destino, ma.area_id, ma.area_destino, ma.trabajador_id, ma.trabajador_destino,
                    ma.estado AS estado_ma, ma.cantidad AS cantidad_ma,
                    c.nombre AS nombrecategoria
                FROM movimientoactivos ma
                INNER JOIN activosfijos af ON ma.activosfijos_id = af.id
                INNER JOIN categorias c ON af.categorias_id = c.id
                WHERE ma.movimientos_id = '$movement_id' $e_query ORDER BY c.nombre, af.codigo");
            $queryMovFA->execute();
            $reqMFA =  $queryMovFA->get_result();
            $dataMFA = $this->db->all($reqMFA, MYSQLI_ASSOC);

            $notFixedAssets = $this->db->query("SELECT * FROM movimientoactivos WHERE movimientos_id = '$movement_id' AND activosfijos_id IS NULL");
            $dataNotFA = $notFixedAssets->fetch_all(MYSQLI_ASSOC);
            
            $info = json_decode($_POST["informacion"]);

            if ($stateMov == 12 && !$individual) {
                $array_idbo = array();
                $array_idarea = array();
                $array_idworker = array();
                foreach ($dataMFA as $key => $mov) {
                    if (!empty($mov["sucursal_id"])) {
                        $array_idbo[$mov["sucursal_id"]] = true;
                    }
                    if (!empty($mov["sucursal_destino"])) {
                        $array_idbo[$mov["sucursal_destino"]] = true;
                    }
                    if (!empty($mov["area_id"])) {
                        $array_idarea[$mov["area_id"]] = true;
                    }
                    if (!empty($mov["area_destino"])) {
                        $array_idarea[$mov["area_destino"]] = true;
                    }
                    if (!empty($mov["trabajador_id"])) {
                        $array_idworker[$mov["trabajador_id"]] = true;
                    }
                    if (!empty($mov["trabajador_destino"])) {
                        $array_idworker[$mov["trabajador_destino"]] = true;
                    }
                }
                $array_idbo = array_keys($array_idbo);
                $array_idarea = array_keys($array_idarea);
                $array_idworker = array_keys($array_idworker);
                $string_idbo = implode(", ", $array_idbo);
                $string_idarea = implode(", ", $array_idarea);
                $string_idworker = implode(", ", $array_idworker);
    
                $this->connectionDB();
    
                $query_area=$this->db_rh->prepare("SELECT idareas, nombre FROM areas WHERE idareas IN ($string_idarea)");
                $query_area->execute();
                $result_a =  $query_area->get_result();
                $array_area = array();
                while ($area = $this->db_rh->assoc($result_a)) {
                    $array_area[$area["idareas"]] = $area["nombre"];
                }

                $query_bo=$this->db_em->prepare("SELECT idsucursalcontable, nombre FROM sucursalcontable WHERE idsucursalcontable IN ($string_idbo)");
                $query_bo->execute();
                $result_bo =  $query_bo->get_result();
                $array_bo = array();
                while ($bo = $this->db_rh->assoc($result_bo)) {
                    $array_bo[$bo["idsucursalcontable"]] = $bo["nombre"];
                }

                $quer_trabajador=$this->db_rh->prepare("SELECT nombre, apellido, idtrabajador FROM trabajador WHERE idtrabajador IN ($string_idworker)");
                $quer_trabajador->execute();
                $result_t =  $quer_trabajador->get_result();
                $array_tr = array();
                while ($trabajador = $this->db_rh->assoc($result_t)) {
                    $array_tr[$trabajador["idtrabajador"]] = $trabajador["nombre"] ." ". $trabajador["apellido"];
                }
    
                foreach ($dataMFA as $key => $mov) {
                    if (!empty($mov["trabajador_id"])) {
                        $dataMFA[$key]["nombresucursal"] = $array_bo[$mov["sucursal_id"]];
                        $dataMFA[$key]["nombrearea"] = $array_area[$mov["area_id"]];
                        $dataMFA[$key]["nombretrabajador"] = $array_tr[$mov["trabajador_id"]]; 
                    }

                    if (!empty($mov["trabajador_destino"])) {
                        $dataMFA[$key]["nombresucursaldestino"] = $array_bo[$mov["sucursal_destino"]];
                        $dataMFA[$key]["nombreareadestino"] = $array_area[$mov["area_destino"]];
                        $dataMFA[$key]["nombretrabajadordestino"] = $array_tr[$mov["trabajador_destino"]]; 
                    }
                }
            }
            
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($reqM),
                "data" => $dataM,
                "dataMFA" => $dataMFA,
                "dataMNFA" => $dataNotFA,
                "info" => $info,
                "individual" => $individual,
            ];

            if (!$js) {
                require_once "pdf/filesMovement.php";
                $object = new FilesMovement();
                $object->report($this->res);
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
    
    public function reportFA(){

        try {
            $queryFA=$this->db->prepare(
                "SELECT af.* 
                FROM activosfijos af
                INNER JOIN categorias c ON af.categorias_id = c.id
                WHERE c.empresa_id = '$this->empresa_id' AND af.id NOT IN (SELECT activosfijos_id FROM activosinventarios WHERE empresa_id = '$this->empresa_id' AND trabajador_id IS NOT NULL)");
            $queryFA->execute();
            $reqFA =  $queryFA->get_result();
            $dataFA = $this->db->all($reqFA, MYSQLI_ASSOC);
            
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($reqFA),
                "data" => $dataFA,
            ];

            require_once "pdf/filesFixedAsset.php";
            $object = new FilesFixedAsset();
            $object->reportUnsolicited($this->res);
            return;
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al listar $this->t_name",
            ];
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function editState($movement_id, $state){
        $state = $state;
        $deliveryDate = $_POST["fechaentrega"];
        $responseDate = date("Y-m-d H:i:s");

        $this->db->query("UPDATE $this->t_name SET fecharespuesta = '$responseDate', fechaentrega = '$deliveryDate', estado = $state WHERE id = $movement_id AND empresa_id = '$this->empresa_id'");
    }

    public function myAssets($js = null){
        try {
            $this->connectionDB("rh");
            $personal_id = $_SESSION["yofinanciero"];
            $query_worker = $this->db_rh->query("SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$personal_id'");
            $worker_id = $query_worker->fetch_assoc()["trabajador_idtrabajador"];

            $queryFA=$this->db->prepare(
                "SELECT af.*, ai.cantidad AS micantidad
                FROM activosinventarios ai
                INNER JOIN activosfijos af ON ai.activosfijos_id = af.id
                WHERE ai.empresa_id = '$this->empresa_id' AND ai.cantidad > 0 AND ai.trabajador_id = '$worker_id'"
            );
            $queryFA->execute();
            $reqFA =  $queryFA->get_result();
            $dataFA = $this->db->all($reqFA, MYSQLI_ASSOC);
            
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($reqFA),
                "data" => $dataFA,
            ];
            if (!$js) {
                require_once "pdf/filesMovement.php";
                $object = new FilesMovement();
                $object->reportMyAssets($this->res);
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