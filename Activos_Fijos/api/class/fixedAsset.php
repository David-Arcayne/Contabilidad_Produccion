<?php
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class FixedAsset
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
        $this->t_name = "activosfijos"; 
        $this->col_id = "id";
        $this->empresa_id = $_SESSION["organizacion"];
        $this->tipo_inv_id = isset($_SESSION["af_tipoinventario"]) ? $_SESSION["af_tipoinventario"]->tipo_inventario : null;
    }

    private function mySubQuery ($sq) {
        $tst="SELECT tipo FROM tiposituacion WHERE id = (
            SELECT tiposituacion_id FROM historial WHERE activosfijos_id = $this->t_name.id AND componentes_id IS NULL ORDER BY id DESC LIMIT 0, 1
        )";

        $idc="SELECT id FROM categorias WHERE empresa_id = '$this->empresa_id' AND id = $this->t_name.categorias_id";
        
        $nc="SELECT nombre FROM categorias WHERE id = $this->t_name.categorias_id";
        $cc="SELECT codificacion FROM categorias WHERE id = $this->t_name.categorias_id";

        $nte="SELECT nombre FROM tipobien WHERE id = $this->t_name.tipobien_id";
        $cte="SELECT codificacion FROM tipobien WHERE id = $this->t_name.tipobien_id";

        $ch="SELECT codigo FROM historial WHERE activosfijos_id = $this->t_name.id ORDER BY id DESC LIMIT 0, 1";

        $pi="SELECT poliza FROM seguros WHERE id = $this->t_name.seguros_id";

        $nti="SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = $this->t_name.seguros_id)";

        // $nts="SELECT nombre FROM tipoestado WHERE id = (
        //     SELECT tipoestado_id FROM activosinventarios WHERE activosfijos_id = $this->t_name.id AND codigo = CONCAT($this->t_name.codigo, '-0000000000') ORDER BY id DESC LIMIT 0, 1
        // )";
        $nts="SELECT nombre FROM tipoestado WHERE id = (
            SELECT tipoestado_id 
            FROM inventarioscantidad 
            WHERE activosinventarios_id = (
                SELECT MAX(id) 
                FROM activosinventarios 
                WHERE activosfijos_id = $this->t_name.id
            )
            AND cantidad = 1   
            ORDER BY id DESC LIMIT 0, 1
        )";
        
        $its="SELECT tipoestado_id FROM activosinventarios WHERE activosfijos_id = $this->t_name.id ORDER BY id ASC LIMIT 0, 1";
        
        // $qfa="SELECT ($this->t_name.cantidad - SUM(cantidad)) FROM cantidadactivos WHERE activosfijos_id = $this->t_name.id GROUP BY activosfijos_id";
        $qfa="SELECT cantidad FROM activosinventarios WHERE activosfijos_id = $this->t_name.id ORDER BY id LIMIT 0, 1";
        
        $qun="SELECT cantidad - (SELECT COALESCE(SUM(cantidad), 0) FROM bajas WHERE activosfijos_id = $this->t_name.id)";

        // $fai="SELECT COUNT(*) FROM activosinventarios WHERE activosfijos_id = $this->t_name.id AND observacion IS NOT NULL AND accion = 2";
        // $fai="SELECT COUNT(*) FROM activosinventarios WHERE activosfijos_id = $this->t_name.id AND observacion IS NOT NULL AND id = (SELECT activosinventarios_id FROM observacionesainventarios WHERE activosinventarios_id = activosinventarios.id AND tipo = 2 AND estado = 0)";
        $fai="SELECT COUNT(*) FROM activosinventarios WHERE activosfijos_id = $this->t_name.id AND id IN (SELECT activosinventarios_id FROM observacionesainventarios WHERE activosinventarios_id = activosinventarios.id AND tipo = 2 AND estado = 0)";

        $ntinv="SELECT nombre FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id AND empresa_id = '$this->empresa_id'";

        $list = [
            "tipo_tiposituacion" => "($tst) as 'tiposituacion'",
            "id_categoria" => "($idc)",
            "nombre_categoria" => "($nc) as 'nombrecategoria'",
            "codigo_categoria" => "($cc) as 'codigocategoria'",
            "nombre_tipobien" => "($nte) as 'nombretipobien'",
            "codigo_tipobien" => "($cte) as 'codigotipobien'",
            "codigo_historial" => "($ch) as 'codigohistorial'",
            "poliza_tiposeguro" => "($pi) as 'polizaseguro'",
            "nombre_tiposeguro" => "($nti) as 'nombretiposeguro'",
            "nombre_tipoestado" => "($nts) as 'nombretipoestado'",
            "id_tipoestado" => "($its) as 'idtipoestado'",
            "cantidad_disponible" => "($qfa) as 'cantidaddisponible'",
            "cantidad_altas" => "($qun) as 'cantidadaltas'",
            "notificaciones" => "($fai) as 'notificaciones'",
            "nombre_tipoinventario" => "($ntinv) as 'nombretipoinventario'",
        ];

        return $list[$sq];
    }

    public function getAllEnabled($inventario = FALSE){

        try {
            $e_query = "";
            if ($inventario) {
                $e_query = " AND tipoinventario_id = ?";
            }

            $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $category_id = $this->mySubQuery("id_categoria");
            $category_name = $this->mySubQuery("nombre_categoria");
            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $history_code = $this->mySubQuery("codigo_historial");
            $insurance_policy = $this->mySubQuery("poliza_tiposeguro");
            // $typestate_name = $this->mySubQuery("nombre_tipoestado");
            $typeinsurance_name = $this->mySubQuery("nombre_tiposeguro");
            $quantity = $this->mySubQuery("cantidad_disponible");
            $notification = $this->mySubQuery("notificaciones");
            $inventorytype_name = $this->mySubQuery("nombre_tipoinventario");


            $consulta = $this->db->prepare("SELECT *, $situationtype_type, $category_name, $typeestate_name, $history_code, $insurance_policy, $typeinsurance_name, $quantity, $notification, $inventorytype_name FROM $this->t_name  WHERE categorias_id = $category_id AND eliminado_en IS NULL $e_query ORDER BY codigo");
            if ($e_query) {
                $consulta->bind_param("s", $inventario);
            }
            $consulta->execute();
            $req = $consulta->get_result();
            $data = $req->fetch_all(MYSQLI_ASSOC);
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
    
    public function getAll($inventoryType_id = FALSE){

        try {
            $e_query = "";
            if ($inventoryType_id) {
                $e_query = " AND tipoinventario_id = ?";
            }

            $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $category_id = $this->mySubQuery("id_categoria");
            $category_name = $this->mySubQuery("nombre_categoria");
            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $history_code = $this->mySubQuery("codigo_historial");
            $insurance_policy = $this->mySubQuery("poliza_tiposeguro");
            $typestate_name = $this->mySubQuery("nombre_tipoestado");
            $typeinsurance_name = $this->mySubQuery("nombre_tiposeguro");
            $quantity = $this->mySubQuery("cantidad_disponible");
            $quantityA = $this->mySubQuery("cantidad_altas");
            $notification = $this->mySubQuery("notificaciones");
            $inventorytype_name = $this->mySubQuery("nombre_tipoinventario");


            $consulta = $this->db->query("SELECT *, $situationtype_type, $category_name, $typeestate_name, $history_code, $insurance_policy, $typestate_name, $typeinsurance_name, $quantity, $notification, $quantityA, $inventorytype_name FROM $this->t_name  WHERE categorias_id = $category_id $e_query ORDER BY codigo");
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

    public function getAllOBName($mix = FALSE){

        try {
            $queryExtra = "";
            if ($mix) {
                $queryExtra = "AND $this->col_id IN (SELECT activosfijos_id FROM depreciacionactivo WHERE metododepreciacion_id = 3)";
            }
            $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $category_id = $this->mySubQuery("id_categoria");
            $category_name = $this->mySubQuery("nombre_categoria");
            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $history_code = $this->mySubQuery("codigo_historial");
            $insurance_policy = $this->mySubQuery("poliza_tiposeguro");
            $typestate_name = $this->mySubQuery("nombre_tipoestado");
            $typeinsurance_name = $this->mySubQuery("nombre_tiposeguro");


            $consulta = $this->db->query(
                "SELECT *, $situationtype_type, $category_name, $typeestate_name, $history_code, $insurance_policy, $typestate_name, $typeinsurance_name, 
                    (
                        SELECT SUM(ua.uso) 
                        FROM usoactivofijo ua 
                        WHERE ua.fecha >= (
                                SELECT CASE WHEN MAX(r.fecharevaluo) IS NULL THEN $this->t_name.fechacompra ELSE MAX(r.fecharevaluo) END 
                                FROM revaluo r 
                                WHERE r.duracionrevaluo IS NOT NULL 
                                    AND r.activosfijos_id = $this->t_name.id
                            ) 
                            AND ua.activosfijos_id = $this->t_name.id GROUP BY ua.activosfijos_id
                    ) AS sumauso 
                FROM $this->t_name  
                WHERE categorias_id = $category_id $queryExtra ORDER BY nombre"
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

    public function getOneInvtID($inventory_id, $fa_code){

        try {
            // $currentDate = date("Y-m-d H:i:s");
            // $consulta = $this->db->query(
            //     "SELECT ai.*, 
            //         af.nombre, af.detalle, af.precio, af.fechacompra,
            //         c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
            //         (SELECT '$currentDate') AS fechaactual,
            //         (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
            //         (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro,
            //         (SELECT nombre FROM tipoestado WHERE id = (
            //             SELECT tipoestado_id FROM activosinventarios WHERE inventarios_id = $inventory_id AND activosfijos_id = af.id AND  codigo = ai.codigo)
            //         ) AS nombreestado,
            //         (SELECT observacion FROM activosinventarios WHERE inventarios_id = $inventory_id AND activosfijos_id = af.id AND  codigo = ai.codigo) AS observacioninv
            //     FROM activosinventarios ai 
            //     INNER JOIN $this->t_name af ON activosfijos_id = af.id 
            //     INNER JOIN categorias c ON af.categorias_id = c.id
            //     INNER JOIN tipobien tb ON af.tipobien_id = tb.id
            //     WHERE ai.codigo = '$fa_code' AND inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' ORDER BY ai.codigo");

            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND af.tipoinventario_id = $this->tipo_inv_id";
            }
            $currentDate = date("Y-m-d H:i:s");

            $consulta = $this->db->query(
                "SELECT ai.*, 
                    af.nombre, af.detalle, af.precio, af.fechacompra,
                    c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
                    (SELECT '$currentDate') AS fechaactual,
                    (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
                    (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro,
                    (
                        SELECT SUM(ic.cantidad)
                        FROM inventarioscantidad ic
                        INNER JOIN activosinventarios ai_inv ON ic.activosinventarios_id = ai_inv.id
                        LEFT JOIN observacionesainventarios oai ON oai.id = ic.observacionesainventarios_id
                        WHERE ai_inv.inventarios_id = $inventory_id
                            AND ai_inv.activosfijos_id = af.id 
                            AND ai_inv.codigo = ai.codigo
                            AND (oai.estado < 5 OR ic.observacionesainventarios_id IS NULL)
                    ) AS cantidad_verificada,
                    (
                        SELECT count(*) 
                        FROM tipoestado ts
                        INNER JOIN inventarioscantidad ic ON ts.id = ic.tipoestado_id
                        INNER JOIN activosinventarios ai_inv ON ic.activosinventarios_id = ai_inv.id
                        WHERE ai_inv.inventarios_id = $inventory_id AND ai_inv.activosfijos_id = af.id AND ai_inv.codigo = ai.codigo
                    ) AS nombre_estado_prueba,
                    (SELECT id FROM activosinventarios WHERE inventarios_id = $inventory_id AND activosfijos_id = af.id AND  codigo = ai.codigo LIMIT 1) AS id_af_inventario
                FROM activosinventarios ai 
                INNER JOIN $this->t_name af ON ai.activosfijos_id = af.id 
                INNER JOIN categorias c ON af.categorias_id = c.id
                INNER JOIN tipobien tb ON af.tipobien_id = tb.id

                WHERE ai.codigo = '$fa_code' AND ai.inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' $eti_query ORDER BY ai.codigo"    
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
    
    public function getByFAId($fa_code){

        try {
            $currentDate = date("Y-m-d H:i:s");
            $consulta = $this->db->query(
                "SELECT ai.*, 
                    af.nombre, af.detalle, af.precio, af.fechacompra,
                    c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
                    (SELECT '$currentDate') AS fechaactual,
                    (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
                    (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro
                FROM activosinventarios ai 
                INNER JOIN $this->t_name af ON activosfijos_id = af.id 
                INNER JOIN categorias c ON af.categorias_id = c.id
                INNER JOIN tipobien tb ON af.tipobien_id = tb.id
                WHERE ai.codigo = '$fa_code' AND inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' ORDER BY ai.codigo");
            $data = $consulta->fetch_assoc();

            if ($data) {
                $worker_id = $data["trabajador_id"];
                $area_id = $data["departamento_id"];
    
                if ($worker_id || $area_id) {
                    $db_rh = new DBConnection("rrhh");
                    $queryWorker = $db_rh->query("SELECT idtrabajador, nombre, apellido FROM trabajador WHERE idtrabajador = '$worker_id'");
                    $dataWorker = $queryWorker->fetch_assoc();
                    $data["nombretrabajador"] = $dataWorker["nombre"] ." ". $dataWorker["apellido"];
    
                    $queryArea = $db_rh->query("SELECT idareas, nombre FROM areas WHERE idareas = '$area_id'");
                    $dataArea = $queryArea->fetch_assoc();
                    $data["nombrearea"] = $dataArea["nombre"];
                }
            }

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

    public function getAllInvtID($inventory_id){
        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND af.tipoinventario_id = $this->tipo_inv_id";
            }

            $currentDate = date("Y-m-d H:i:s");
            // $consulta = $this->db->query(
            //     "SELECT ai.*, 
            //         af.nombre, af.detalle, af.precio, af.fechacompra,
            //         c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
            //         (SELECT '$currentDate') AS fechaactual,
            //         (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
            //         (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro,
            //         (SELECT nombre FROM tipoestado WHERE id = (
            //             SELECT tipoestado_id FROM activosinventarios WHERE inventarios_id = $inventory_id AND activosfijos_id = af.id AND  codigo = ai.codigo)
            //         ) AS nombreestado,
            //         (SELECT observacion FROM activosinventarios WHERE inventarios_id = $inventory_id AND activosfijos_id = af.id AND  codigo = ai.codigo) AS observacioninv
            //     FROM activosinventarios ai 
            //     INNER JOIN $this->t_name af ON activosfijos_id = af.id 
            //     INNER JOIN categorias c ON af.categorias_id = c.id
            //     INNER JOIN tipobien tb ON af.tipobien_id = tb.id
            //     WHERE inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' $eti_query ORDER BY ai.codigo");

            // $consulta = $this->db->query(
            //     "SELECT ai.*, 
            //         af.nombre, af.detalle, af.precio, af.fechacompra,
            //         c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
            //         '$currentDate' AS fechaactual,
            //         ts.nombre AS nombretiposeguro,
            //         s.poliza AS polizaseguro,
            //         te.nombre AS nombreestado,
            //         ic.observacion AS observacioninv
            //     FROM activosinventarios ai 
            //     INNER JOIN $this->t_name af ON ai.activosfijos_id = af.id 
            //     INNER JOIN categorias c ON af.categorias_id = c.id
            //     INNER JOIN tipobien tb ON af.tipobien_id = tb.id
            //     LEFT JOIN seguros s ON af.seguros_id = s.id
            //     LEFT JOIN tiposeguro ts ON s.tiposeguro_id = ts.id
            //     LEFT JOIN activosinventarios ai_inv ON ai_inv.inventarios_id = $inventory_id 
            //         AND ai_inv.activosfijos_id = af.id 
            //         AND ai_inv.codigo = ai.codigo
            //     LEFT JOIN inventarioscantidad ic ON ic.activosinventarios_id = ai_inv.id
            //     LEFT JOIN tipoestado te ON te.id = ic.tipoestado_id
            //     WHERE ai.inventarios_id IS NULL AND ai.cantidad > 0  AND ai.empresa_id = '$this->empresa_id' $eti_query ORDER BY ai.codigo"
            // );

            $consulta = $this->db->query(
                "SELECT ai.*, 
                    af.nombre, af.detalle, af.precio, af.fechacompra,
                    c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
                    (SELECT '$currentDate') AS fechaactual,
                    (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
                    (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro,
                    (
                        SELECT SUM(ic.cantidad)
                        FROM inventarioscantidad ic
                        INNER JOIN activosinventarios ai_inv ON ic.activosinventarios_id = ai_inv.id
                        LEFT JOIN observacionesainventarios oai ON ic.observacionesainventarios_id = oai.id
                        WHERE ai_inv.inventarios_id = $inventory_id 
                            AND ai_inv.activosfijos_id = af.id 
                            AND ai_inv.codigo = ai.codigo 
                            AND (oai.estado < 5 OR ic.observacionesainventarios_id IS NULL)
                    ) AS cantidad_verificada,
                    (
                        SELECT COUNT(*)
                        FROM inventarioscantidad ic
                        INNER JOIN activosinventarios ai_inv ON ic.activosinventarios_id = ai_inv.id
                        INNER JOIN tipoestado te ON ic.tipoestado_id = te.id
                        WHERE ai_inv.inventarios_id = $inventory_id AND ai_inv.activosfijos_id = af.id AND ai_inv.codigo = ai.codigo
                    ) AS estado_unico_prueba,
                    (
                        SELECT count(*) 
                        FROM tipoestado ts
                        INNER JOIN inventarioscantidad ic ON ts.id = ic.tipoestado_id
                        INNER JOIN activosinventarios ai_inv ON ic.activosinventarios_id = ai_inv.id
                        WHERE ai_inv.inventarios_id = $inventory_id AND ai_inv.activosfijos_id = af.id AND ai_inv.codigo = ai.codigo
                    ) AS nombre_estado_prueba,
                    (SELECT id FROM activosinventarios WHERE inventarios_id = $inventory_id AND activosfijos_id = af.id AND  codigo = ai.codigo LIMIT 1) AS id_af_inventario
                FROM activosinventarios ai 
                INNER JOIN $this->t_name af ON ai.activosfijos_id = af.id 
                INNER JOIN categorias c ON af.categorias_id = c.id
                INNER JOIN tipobien tb ON af.tipobien_id = tb.id
                WHERE ai.inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' $eti_query ORDER BY ai.codigo"    
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

    public function getAllByStatus($with_inv = null, $depreciation = null, $unitary = null){
        try {
            $removed_in = "AND eliminado_en is NULL";
            $eti_query = "";
            if ($this->tipo_inv_id && $with_inv) {
                $eti_query = "AND tipoinventario_id = $this->tipo_inv_id";
            } else if ($this->tipo_inv_id && $depreciation) {
                $eti_query = "AND tipoinventario_id = $this->tipo_inv_id AND (SELECT tipo FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id) = 1";
            } else if ($depreciation) {
                $eti_query = "AND (SELECT tipo FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id) = 1";
                $removed_in = "";
            }

            $qUnitary = "";
            if ($unitary) {
                $qUnitary = "AND cantidad = 1";
            }

            $category_id = $this->mySubQuery("id_categoria");
            
            $consulta = $this->db->query("SELECT * FROM $this->t_name WHERE categorias_id = $category_id $removed_in $eti_query $qUnitary");
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

    public function getAllByStatusRequest($quantity = 0){
        try {
            $category_id = $this->mySubQuery("id_categoria");
            $queryQ = $quantity > 0 ? ">= $quantity" : "> 0";

            $consulta = $this->db->query(
                "SELECT *
                FROM $this->t_name 
                WHERE eliminado_en is NULL 
                    AND categorias_id = $category_id 
                    AND $this->col_id IN (
                        SELECT activosfijos_id FROM activosinventarios WHERE cantidad > 0 AND inventarios_id IS NULL GROUP BY activosfijos_id
                    ) 
                    AND IFNULL(
                        (
                            SELECT cantidad FROM activosinventarios 
                            WHERE (activosfijos_id, id) = (
                                SELECT activosfijos_id, MIN(id) 
                                FROM activosinventarios 
                                WHERE activosfijos_id = $this->t_name.id GROUP BY activosfijos_id
                            )
                        ), cantidad
                    ) - 
                    (
                        SELECT IFNULL(SUM(cantidad), 0) 
                        FROM movimientoactivos 
                        WHERE estado = 2 
                            AND activosfijos_id = $this->t_name.id
                            AND trabajador_id IS NULL
                            AND movimientos_id IN (
                                SELECT id FROM movimientos WHERE estado IS NULL OR estado = 2 OR estado = 11
                            )
                    ) - 
                    (
                        SELECT IFNULL(SUM(cantidad), 0) 
                        FROM movimientoactivos 
                        WHERE estado = 1 
                            AND activosfijos_id = $this->t_name.id
                            AND nombre IS NOT NULL
                            AND trabajador_id IS NULL
                            AND movimientos_id IN (
                                SELECT id FROM movimientos WHERE estado = 2
                            )
                    ) $queryQ");
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

    public function getAllByStatusDev($tr_id, $worker = FALSE){
        try {
            $category_id = $this->mySubQuery("id_categoria");

            $consulta = $this->db->query(
                "SELECT * 
                FROM $this->t_name 
                WHERE eliminado_en is NULL 
                    AND categorias_id = $category_id 
                    AND $this->col_id IN (
                        SELECT activosfijos_id 
                        FROM activosinventarios 
                        WHERE cantidad > 0 AND inventarios_id IS NULL AND trabajador_id = '$tr_id' GROUP BY activosfijos_id
                    ) 
                    AND IFNULL
                    ((
                        SELECT cantidad 
                        FROM activosinventarios 
                        WHERE activosfijos_id = $this->t_name.id AND trabajador_id = '$tr_id'
                    ), cantidad) - (
                        SELECT IFNULL(SUM(cantidad), 0) 
                        FROM movimientoactivos 
                        WHERE estado = 2 
                            AND activosfijos_id = $this->t_name.id 
                            AND (
                                movimientos_id IN (
                                    SELECT id 
                                    FROM movimientos 
                                    WHERE trabajador_id = '$tr_id' AND (estado = 5 OR estado = 8)
                                ) OR trabajador_id = '$tr_id'
                            )
                    ) > 0");
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

    public function getAllNotInDpr(){
        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND $this->t_name.tipoinventario_id = $this->tipo_inv_id";
            }
            $category_id = $this->mySubQuery("id_categoria");
            
            $consulta = $this->db->query(
                "SELECT * 
                FROM $this->t_name 
                WHERE eliminado_en is NULL 
                    AND categorias_id = $category_id 
                    AND $this->col_id NOT IN (SELECT activosfijos_id FROM depreciacionactivo WHERE empresa_id = '$this->empresa_id') 
                    AND tipoinventario_id  = (SELECT id FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id AND tipo = 1)
                    $eti_query"
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

    public function getById($fixedAsset, $worker_id = FALSE, $worker = FALSE){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fixedAsset, "id");
        if($valid_id) {
            echo json_encode(
                ["status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $category_id = $this->mySubQuery("id_categoria");

            $queryQuantity = "";
            if ($worker_id === FALSE) {
                $queryQuantity = 
                "SELECT cantidad - 
                    (
                        SELECT IFNULL(SUM(cantidad), 0) 
                        FROM movimientoactivos 
                        WHERE estado = 2 
                            AND activosfijos_id = $this->t_name.id 
                            AND trabajador_id IS NULL 
                            AND movimientos_id IN (SELECT id FROM movimientos WHERE estado IS NULL OR estado = 2 OR estado = 11)
                    ) - (
                        SELECT IFNULL(SUM(cantidad), 0) 
                        FROM movimientoactivos 
                        WHERE estado = 1 
                            AND activosfijos_id = $this->t_name.id 
                            AND nombre IS NOT NULL 
                            AND trabajador_id IS NULL 
                            AND movimientos_id IN (SELECT id FROM movimientos WHERE estado = 2)
                    ) 
                FROM activosinventarios 
                WHERE (activosfijos_id, id) = (
                    SELECT activosfijos_id, MIN(id) 
                    FROM activosinventarios 
                    WHERE activosfijos_id = $this->t_name.id 
                    GROUP BY activosfijos_id
                )";
            } else {
                $queryQuantity = 
                "SELECT IFNULL
                ((
                    SELECT cantidad 
                    FROM activosinventarios
                    WHERE activosfijos_id = $this->t_name.id AND trabajador_id = '$worker_id'
                ), cantidad) - (
                    SELECT IFNULL(SUM(cantidad), 0) 
                    FROM movimientoactivos 
                    WHERE estado = 2 
                        AND activosfijos_id = $this->t_name.id 
                        AND (
                            movimientos_id IN (
                                SELECT id 
                                FROM movimientos 
                                WHERE trabajador_id = '$worker_id' AND (estado = 5 OR estado = 8)
                            ) OR trabajador_id = '$worker_id'
                        )
                )";
            }

            $consulta=$this->db->prepare(
                "SELECT *, 
                    ($queryQuantity) AS cantidadactual 
                FROM $this->t_name WHERE $this->col_id = ? AND categorias_id = $category_id");
            $consulta->bind_param("s", $fixedAsset);
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

        $category_id = $this->mySubQuery("id_categoria");
        $coding = $this->db->query("SELECT codificacion FROM $this->t_name WHERE categorias_id = $category_id ORDER BY $this->col_id DESC LIMIT 1");
        $coding = $coding->fetch_array(MYSQLI_NUM);
        $code = $coding ? (int)$coding[0] + 1 : 1;
        $code = str_pad($code, 4, '0', STR_PAD_LEFT);


        $category_f_id = $_POST["categorias_id"];
        $typeEstate_f_id = $_POST["tipobien_id"];
        $cod_te = $this->db->query("SELECT codificacion FROM tipobien WHERE empresa_id = '$this->empresa_id' AND id = $typeEstate_f_id")->fetch_array(MYSQLI_NUM);
        $cod_c = $this->db->query("SELECT codificacion FROM categorias WHERE empresa_id = '$this->empresa_id' AND id = $category_f_id")->fetch_array(MYSQLI_NUM);
        // $fa_code = $cod_c[0].$cod_te[0].$code."-0000000";
        $fa_code = $cod_c[0].$cod_te[0].$code;

        $_POST["codificacion"] = $code;
        $_POST["codigo"] = $fa_code;
        $_POST["creado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_creador"] = $_SESSION["yofinanciero"];

        if (isset($_POST["seguros_id"]) && !trim($_POST["seguros_id"])) unset($_POST["seguros_id"]); 
        if (isset($_POST["salvamento"]) && !trim($_POST["salvamento"])) unset($_POST["salvamento"]);
        if (isset($_POST["duracion"]) && !trim($_POST["duracion"])) unset($_POST["duracion"]);
        if (isset($_POST["unidadmedida"]) && !trim($_POST["unidadmedida"])) unset($_POST["unidadmedida"]);
        $v_form = $valid->getColumsData($_POST);
        
        $error_arr = [];      

        if($error_arr) {
            $this->res = [
                "status" => 400,
                "errors" => $error_arr
            ];
        } else if((int)$code > 9999) {
            $this->res = [
                "status" => 400,
                "message" => "Solo se permiten 999 registros",
            ];
        } else {
            try {
                $this->db->begin_transaction();
                $insert_columns = implode(", ", array_keys($v_form));
                $value_columns = array_values($v_form);
                $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                $bind_types = str_repeat("s", count($v_form));
    
                $quer=$this->db->prepare("INSERT INTO $this->t_name ($insert_columns) VALUES ($prepare_marks)");
                $quer->bind_param($bind_types, ...$value_columns);
                $quer->execute();

                if ($quer->affected_rows === 1) {
                    $creado_en = "'".date("Y-m-d H:i:s")."'";
                    $tipoestado_id = $_POST["tipoestado_id"];
                    $af_id = $quer->insert_id;
                    $all_code = $fa_code."-0000000000";
                    $quantity = $_POST["cantidad"];
                    $querAI=$this->db->prepare("INSERT INTO activosinventarios (creado_en, activosfijos_id, codigo, cantidad, empresa_id) VALUES ($creado_en, $af_id, '$all_code', $quantity, '$this->empresa_id' )");
                    $querAI->execute();

                    if ($querAI->affected_rows === 1) {
                        $ai_id = $querAI->insert_id;
                        // id, cantidad, observacion, tipoestado_id, activosinventarios_id
                        $queryIC = $this->db->prepare("INSERT INTO inventarioscantidad (cantidad, tipoestado_id, activosinventarios_id) VALUES ($quantity, $tipoestado_id, $ai_id)");
                        $queryIC->execute();
                    }

                    if (isset($_POST["enviarcontabilidad"]) && trim($_POST["enviarcontabilidad"]) == 1) {
                        $date = $_POST["c_fecha"];
                        $amount = $_POST["c_monto"];
                        $detail = $_POST["c_detalle"];
                        $type = $_POST["c_tipo"];
                        $querCA=$this->db->prepare("INSERT INTO montoscontabilidad (detalle, fecha, monto, activosfijos_id, empresa_id, tipo, creado_en, usu_creador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        $querCA->bind_param("sssisiss", $detail, $date, $amount, $af_id, $this->empresa_id, $type, $_POST["creado_en"], $_SESSION["yofinanciero"]);
                        $querCA->execute();
                    }
                }
    
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

    public function edit($fixedAsset){        
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fixedAsset, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400, 
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        $_POST["editado_en"] = date("Y-m-d H:i:s");
        $_POST["usu_editor"] = $_SESSION["yofinanciero"];
        if (isset($_POST["seguros_id"]) && !trim($_POST["seguros_id"])) $_POST["seguros_id"] = null; 
        if (isset($_POST["salvamento"]) && trim($_POST["salvamento"]) === "") unset($_POST["salvamento"]);
        if (isset($_POST["duracion"]) && !trim($_POST["duracion"])) unset($_POST["duracion"]);
        if (isset($_POST["unidadmedida"]) && !trim($_POST["unidadmedida"])) unset($_POST["unidadmedida"]);
        $quantityE = NULL;
        if (isset($_POST["cantidad"]) && (trim($_POST["cantidad"]) || $_POST["cantidad"] == 0)) $quantityE = $_POST["cantidad"];
        if (isset($_POST["categorias_id"])) unset($_POST["categorias_id"]);
        if (isset($_POST["tipobien_id"])) unset($_POST["tipobien_id"]);
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
                array_push($value_columns, $fixedAsset);

                $bind_types = str_repeat("s", count($v_form));
                $prepare_marks = "";
                foreach ($name_columns as $value) {
                    $prepare_marks .= $value." = ?, ";
                }
                $prepare_marks = substr($prepare_marks, 0, -2);

                $category_id = $this->mySubQuery("id_categoria");

                // $queryFA = $this->db->query("SELECT * FROM $this->t_name WHERE $this->col_id = $fixedAsset AND categorias_id = $category_id");

                // $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                // $quer->bind_param($bind_types."i", ...$value_columns);
                // $quer->execute();
                $quer = [];

                if ($quantityE || $quantityE == 0) {
                    $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE id = (SELECT MIN(id) FROM activosinventarios WHERE activosfijos_id = '$fixedAsset' AND inventarios_id IS NULL)");
                    $data_fai = $query_fai->fetch_assoc();

                    $query_fa = $this->db->query("SELECT cantidad FROM $this->t_name WHERE id = '$fixedAsset'");
                    $data_fa = $query_fa->fetch_assoc();

                    $query_sum = $this->db->query("SELECT IFNULL(SUM(cantidad), 0) AS cantidadtotal FROM movimientoactivos WHERE estado = 2 AND activosfijos_id = '$fixedAsset' AND movimientos_id IN (SELECT id FROM movimientos WHERE estado IS NULL OR estado = 2)");
                    $data_sum = $query_sum->fetch_assoc();

                    $quantityI = $data_fai["cantidad"];
                    $quantityFA = $data_fa["cantidad"];
                    $quantityM = $data_sum["cantidadtotal"];

                    if ($quantityE == $quantityFA) {
                        $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                        $quer->bind_param($bind_types."i", ...$value_columns);
                        $quer->execute();
                    } else if ($quantityE > $quantityFA) {
                        $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                        $quer->bind_param($bind_types."i", ...$value_columns);
                        $quer->execute();
                        
                        $quantity = ($quantityE - $quantityFA) + $quantityI;
                        $this->db->query("UPDATE activosinventarios SET cantidad = $quantity WHERE id = '".$data_fai["id"]."'");   
                    } else if ($quantityE < $quantityFA && ($quantityI - $quantityM) >= ($quantityFA - $quantityE)) {
                        $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                        $quer->bind_param($bind_types."i", ...$value_columns);
                        $quer->execute();
                        
                        $quantity = $quantityI - ($quantityFA - $quantityE);
                        $this->db->query("UPDATE activosinventarios SET cantidad = $quantity WHERE id = '".$data_fai["id"]."'");   
                    } else {
                        throw new Exception("No se puede actualizar la cantidad del activo fijo");
                    }
                } else {
                    $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                    $quer->bind_param($bind_types."i", ...$value_columns);
                    $quer->execute();
                }

                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $quer->affected_rows,
                    "id" => $fixedAsset,
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

    public function delete($fixedAsset){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fixedAsset, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400, 
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        try {
            $this->db->begin_transaction();
            $category_id = $this->mySubQuery("id_categoria");
            
            $quer_ai_id = $this->db->prepare("SELECT id FROM activosinventarios WHERE activosfijos_id = ? AND inventarios_id IS NULL");
            $quer_ai_id->bind_param("i", $fixedAsset);
            $quer_ai_id->execute();
            $ai_id = $quer_ai_id->get_result()->fetch_assoc()["id"];

            $quer_ic = $this->db->prepare("DELETE FROM inventarioscantidad WHERE activosinventarios_id = ?");
            $quer_ic->bind_param("i", $ai_id);
            $quer_ic->execute();
            $quer_ai=$this->db->prepare("DELETE FROM activosinventarios WHERE activosfijos_id = ? AND inventarios_id IS NULL");
            $quer_ai->bind_param("i", $fixedAsset);
            $quer_ai->execute();
            $quer=$this->db->prepare("DELETE FROM $this->t_name WHERE $this->col_id = ? AND categorias_id = $category_id");
            $quer->bind_param("i", $fixedAsset);
            $quer->execute();
            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id" => $fixedAsset,
                "data" => "",
            ];
            $this->db->commit();
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error $this->t_name",
            ]; 
            $this->db->rollback();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
    
    public function state($fixedAsset, $state = false){
        $valid = new Validations($this->t_name);

        $valid_id = $valid->isNumber($fixedAsset, "id");
        if($valid_id) {
            echo json_encode([
                "status" => 400,
                "error" => $valid_id
            ], http_response_code(400));
            return;
        }

        $date = "NULL";
        $quantity = 0;
        $code_inv = "";
        $v_form = [];
        if (!$state) {
            $valid_state = new Validations("bajas");
            $_POST["empresa_id"] = $this->empresa_id;
            $_POST["creado_en"] = date("Y-m-d H:i:s");
            $_POST["usu_creador"] = $_SESSION["yofinanciero"];
            $v_form = $valid_state->getColumsData($_POST);
            $v_tbaja = $valid->isRequired($_POST["tipobaja_id"],"tipobaja_id");
            if($v_tbaja) die(json_encode(["tipobaja" => $v_tbaja], http_response_code(400)));

            $date = "'".date("Y-m-d H:i:s")."'";
            $quantity = (int)$_POST["cantidad"];
            $code_inv = $_POST["codigo"];
        }

        try {
            $this->db->begin_transaction();
            $category_id = $this->mySubQuery("id_categoria");
            
            // agregar "eliminado_en" cuando se da de baja todos los activos
            $quer=$this->db->prepare(
                "UPDATE $this->t_name SET eliminado_en = $date 
                WHERE $this->col_id = ? AND categorias_id = $category_id 
                    AND cantidad = (SELECT (COALESCE(SUM(cantidad), 0) + $quantity) FROM bajas WHERE activosfijos_id = ?)"
            );
            $quer->bind_param("ii", $fixedAsset, $fixedAsset);
            $quer->execute();

            $query = "";
            if (!$state) {
                $insert_columns = implode(", ", array_keys($v_form));
                $value_columns = array_values($v_form);
                $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                $bind_types = str_repeat("s", count($v_form));

                $query=$this->db->prepare("INSERT INTO bajas ($insert_columns) VALUES ($prepare_marks)");
                $query->bind_param($bind_types, ...$value_columns);
                $query->execute();

                if (isset($_POST["obs_id"]) && trim($_POST["obs_id"])) {
                    $obs_id = $_POST["obs_id"];
                    $this->db->query("UPDATE observacionesainventarios SET estado = 6 WHERE id = $obs_id");
                }

                if (isset($_POST["enviarcontabilidad"]) && trim($_POST["enviarcontabilidad"]) == 1) {
                    $date = $_POST["c_fecha"];
                    $amount = $_POST["c_monto"];
                    $detail = $_POST["c_detalle"];
                    $type = $_POST["c_tipo"];
                    $querCA=$this->db->prepare("INSERT INTO montoscontabilidad (detalle, fecha, monto, activosfijos_id, empresa_id, tipo, creado_en, usu_creador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    $querCA->bind_param("sssisiss", $detail, $date, $amount, $fixedAsset, $this->empresa_id, $type, $_POST["creado_en"], $_SESSION["yofinanciero"]);
                    $querCA->execute();
                }
            } else if ($quer->affected_rows === 1 && $state) {
                $queryU = $this->db->query("SELECT * FROM bajas WHERE activosfijos_id = $fixedAsset AND empresa_id = '$this->empresa_id'");
                while ($data = $queryU->fetch_assoc()) {
                    // actualizar la cantidad de activosinventarios sumando la cantidad de bajas
                    $quantity = $data["cantidad"];
                    $code_inv = $data["codigo"];
                    $fa_id = $data["activosfijos_id"];
                    $this->db->query("UPDATE activosinventarios SET cantidad = (cantidad + $quantity) WHERE codigo = '$code_inv' AND activosfijos_id = '$fa_id' AND inventarios_id IS NULL");   
                }
                $consulta = $this->db->query("DELETE FROM bajas WHERE activosfijos_id = $fixedAsset AND empresa_id = '$this->empresa_id'");
            }

            if (!$state) {

                $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE codigo = '$code_inv' AND inventarios_id IS NULL");
                $data_fai = $query_fai->fetch_assoc();
                if ($data_fai) {
                    $quantityI = $data_fai["cantidad"] - $quantity;
                    $this->db->query("UPDATE activosinventarios SET cantidad = $quantityI WHERE id = '".$data_fai["id"]."'");   
                }
            }

            $this->res = [
                "status" => 200, 
                "affected_rows" => $quer->affected_rows,
                "id category" => $fixedAsset,
                "id state" => $state ? null : $query->insert_id, 
                "data" => "",
            ];
            $this->db->commit();
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "Error $this->t_name",
            ];
            $this->db->rollback();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function getUnsubscribe($fa_id){

        try {
            $unsubscribeFA = $this->db->query("SELECT *, (SELECT nombre FROM tipobaja WHERE id = bajas.tipobaja_id) as nombretipobaja FROM bajas WHERE activosfijos_id = $fa_id");
            $dataUFA = $unsubscribeFA->fetch_all(MYSQLI_ASSOC);
   
            if ($dataUFA) {
                $userIds = [];
                foreach ($dataUFA as $key => $value) {
                    array_push($userIds, "'". $value["usu_creador"] ."'");
                }
                $userIds = implode(", ", array_unique($userIds));

                if ($userIds) {
                    $db_rh = new DBConnection("rrhh");
                    $queryWorker = $db_rh->query(
                        "SELECT MD5(idusuario) AS idusuariomd5, 
                            (SELECT CONCAT(nombre, ' ', apellido) FROM trabajador WHERE idtrabajador = usuario.trabajador_idtrabajador) AS nombretrabajador 
                        FROM usuario WHERE MD5(idusuario) IN ($userIds)");
                    $arrayWorker = [];
                    while ($worker = $queryWorker->fetch_assoc()) {
                        $arrayWorker[$worker["idusuariomd5"]] = $worker["nombretrabajador"];
                    }
                    foreach ($dataUFA as $key => $value) {
                        $dataUFA[$key]["nombretrabajador"] = $arrayWorker[$value["usu_creador"]];
                    }
                }
            }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($unsubscribeFA),
                "data" => $dataUFA,
            ];
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al listar $this->t_name",
            ];
        }

        echo json_encode($this->res, http_response_code($this->res["status"]));
    }
    
    public function stateUnsubscribe($u_id){

        try {
            $this->db->begin_transaction();
            $queryU = $this->db->query("SELECT * FROM bajas WHERE id = '$u_id' AND empresa_id = '$this->empresa_id'");
            $data = $queryU->fetch_assoc();
            $quantity = $data["cantidad"];
            $code_inv = $data["codigo"];
            $fa_id = $data["activosfijos_id"];

            $this->db->query("UPDATE activosinventarios SET cantidad = (cantidad + $quantity) WHERE codigo = '$code_inv' AND activosfijos_id = '$fa_id' AND inventarios_id IS NULL");

            $this->db->query("UPDATE $this->t_name SET eliminado_en = NULL WHERE $this->col_id = '$fa_id'");
            
            $query = $this->db->prepare("DELETE FROM bajas WHERE id = '$u_id' AND empresa_id = '$this->empresa_id'");
            $query->execute();

            $this->res = [
                "status" => 200,
                "rows" => $query->affected_rows,
                "data" => "",
            ];
            $this->db->commit();
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "error al listar $this->t_name",
            ];
            $this->db->rollback();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function importExcel() {
        require_once ('../vendor/autoload.php');

        $allowedFileType = [
            'application/vnd.ms-excel',
            'text/xls',
            'text/xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        try {
            if (in_array($_FILES["file"]["type"], $allowedFileType)) {
                $valid = new Validations($this->t_name);
    
                // $targetPath = 'uploads/' . $_FILES['file']['name'];
                // move_uploaded_file($_FILES['file']['tmp_name'], $targetPath);
                $tmp_file = $_FILES['file']['tmp_name'];
    
                $Reader = new Xlsx();
    
                $spreadSheet = $Reader->load($tmp_file);
                $excelSheet = $spreadSheet->getActiveSheet();
                $spreadSheetArr = $excelSheet->toArray();
                $sheetCount = count($spreadSheetArr);

                // $sheet->setCellValue('A1', 'ID'); // 0
                // $sheet->setCellValue('B1', 'Código'); // 1
                // $sheet->setCellValue('C1', 'Cantidad'); // 2
                // $sheet->setCellValue('D1', 'Nombre'); // 3
                // $sheet->setCellValue('E1', 'Detalle'); // 4
                // $sheet->setCellValue('F1', 'Precio'); // 5
                // $sheet->setCellValue('G1', 'Fecha de ingreso'); // 6 -----------------------------------
                // $sheet->setCellValue('H1', 'Observación'); // 7
                // $sheet->setCellValue('I1', 'Categoría'); // 8
                // $sheet->setCellValue('J1', 'Código categoría'); // 9
                // $sheet->setCellValue('K1', 'Tipo de bien'); // 10
                // $sheet->setCellValue('L1', 'Código T.B.'); // 11
                // $sheet->setCellValue('M1', 'Seguro'); // 12
                // $sheet->setCellValue('N1', 'Estado'); // 13
                // $sheet->setCellValue('O1', 'Tipo de inventario'); // 14
                // $sheet->setCellValue('P1', 'Valor de Salvamento'); // 15
                // $sheet->setCellValue('Q1', 'Duración'); // 16
                // $sheet->setCellValue('R1', 'Unidad de medida'); // 17

                $this->db->begin_transaction();
                $date = date("Y-m-d H:i:s");
                $userId = $_SESSION["yofinanciero"];
                $count = 0;                
                if ($_POST["tipo"] == 1){
                    $category_id = $this->mySubQuery("id_categoria");
                    $coding = $this->db->query("SELECT codificacion FROM $this->t_name WHERE categorias_id = $category_id ORDER BY $this->col_id DESC LIMIT 1");
                    $coding = $coding->fetch_array(MYSQLI_NUM);
                    $code = $coding ? (int)$coding[0] + 1 : 1;
                    $code = str_pad($code, 4, '0', STR_PAD_LEFT);

                    $insert_code = $code;
                    for ($col = 1; $col < $sheetCount; $col ++) {
                        $count ++;
                        $ss_data = [
                            // "codigo" => $spreadSheetArr[$col][1],
                            "codificacion" => $insert_code,
                            "cantidad" => $spreadSheetArr[$col][2],
                            "nombre" => $spreadSheetArr[$col][3],
                            "detalle" => $spreadSheetArr[$col][4],
                            "precio" => $spreadSheetArr[$col][5],
                            "fechacompra" => date_format(date_create($spreadSheetArr[$col][6]), "Y-m-d"),
                            "observacion" => $spreadSheetArr[$col][7],
                            "creado_en" => $date,
                            "usu_creador" => $userId,
                        ];
                        $cat_code = trim($spreadSheetArr[$col][9]);
                        $at_code = trim($spreadSheetArr[$col][11]);
                        $ss_data["codigo"] = $cat_code . $at_code . $insert_code;

                        $q_category = $this->db->prepare("SELECT id FROM categorias WHERE empresa_id = '$this->empresa_id' AND codificacion = '$cat_code'");
                        $q_category->execute();
                        $category = $q_category->get_result();
                        $category = $category->fetch_assoc();
                        if ($category) {
                            $ss_data["categorias_id"] = $category["id"];
                        } else {
                            throw new Exception("No se encontró la categoría con codificación: $cat_code");
                        }

                        $q_at = $this->db->prepare("SELECT id FROM tipobien WHERE empresa_id = '$this->empresa_id' AND codificacion = '$at_code'");
                        $q_at->execute();
                        $assetType = $q_at->get_result();
                        $assetType = $assetType->fetch_assoc();
                        if ($assetType) {
                            $ss_data["tipobien_id"] = $assetType["id"];
                        } else {
                            throw new Exception("No se encontró el tipo de bien con codificación: $at_code");
                        }

                        $insurance =  trim($spreadSheetArr[$col][12]);
                        if ($insurance) {
                            $q_insurance = $this->db->prepare("SELECT id FROM seguros WHERE empresa_id = '$this->empresa_id' AND TRIM(poliza) = ?");
                            $q_insurance->bind_param("s", $insurance);
                            $q_insurance->execute();
                            $data_insurance = $q_insurance->get_result();
                            if ($data_insurance->num_rows === 1) {
                                $data_insurance = $data_insurance->fetch_assoc();
                                if ($data_insurance) $ss_data["seguros_id"] = $data_insurance["id"];
                            } else {
                                throw new Exception("No se encontró el seguro con poliza: $insurance");
                            }
                        }

                        $inventoryType = trim($spreadSheetArr[$col][14]);
                        if ($inventoryType) {
                            $q_inventoryType = $this->db->prepare("SELECT id FROM tipoinventario WHERE empresa_id = '$this->empresa_id' AND TRIM(nombre) = ?");
                            $q_inventoryType->bind_param("s", $inventoryType);
                            $q_inventoryType->execute();
                            $data_inventoryType = $q_inventoryType->get_result();
                            // echo '<pre>'. print_r($data_inventoryType->num_rows, true) .'</pre>';
                            // echo '<pre>'. print_r($data_inventoryType, true) .'</pre>';
                            // echo '<pre>'. print_r($data_inventoryType->fetch_assoc(), true) .'</pre>';
                            if ($data_inventoryType->num_rows === 1) {
                                $data_inventoryType = $data_inventoryType->fetch_assoc();
                                if ($data_inventoryType) $ss_data["tipoinventario_id"] = $data_inventoryType["id"];
                            } else {
                                throw new Exception("No se encontró el tipo de inventario con nombre: $inventoryType");
                            }
                        } else {
                            throw new Exception("El tipo de inventario es requerido");
                        }

                        // if (isset($spreadSheetArr[$col][9]) && trim($spreadSheetArr[$col][9])) $ss_data["seguros_id"] = $spreadSheetArr[$col][9];
                        if (isset($spreadSheetArr[$col][15]) && trim($spreadSheetArr[$col][15])) $ss_data["salvamento"] = $spreadSheetArr[$col][15]; 
                        if (isset($spreadSheetArr[$col][16]) && trim($spreadSheetArr[$col][16])) $ss_data["duracion"] = $spreadSheetArr[$col][16]; 
                        if (isset($spreadSheetArr[$col][17]) && trim($spreadSheetArr[$col][17])) $ss_data["unidadmedida"] = $spreadSheetArr[$col][17]; 
        
                        $v_form = $valid->getColumsData($ss_data);
        
                        $insert_columns = implode(", ", array_keys($v_form));
                        $value_columns = array_values($v_form);
                        $prepare_marks = implode(',', array_fill(0, count($v_form), '?'));
                        $bind_types = str_repeat("s", count($v_form));
            
                        $quer=$this->db->prepare("INSERT INTO $this->t_name ($insert_columns) VALUES ($prepare_marks)");
                        $quer->bind_param($bind_types, ...$value_columns);
                        $quer->execute();

                        if ($quer->affected_rows === 1) {
                            $creado_en = $date;
                            $tipoestado_id = null;
                            $state = trim($spreadSheetArr[$col][13]); 
                            if ($state) {
                                $q_state = $this->db->prepare("SELECT id FROM tipoestado WHERE empresa_id = '$this->empresa_id' AND TRIM(nombre) = ?");
                                $q_state->bind_param("s", $state);
                                $q_state->execute();
                                $state = $q_state->get_result();
                                if ($state->num_rows === 1) {
                                    $state = $state->fetch_assoc();
                                    if ($state) $tipoestado_id = $state["id"];
                                } else {
                                    throw new Exception("No se encontró el estado con nombre: $state");
                                }
                            } else {
                                throw new Exception("El estado es requerido");
                            }
                            $af_id = $quer->insert_id;
                            $all_code = $cat_code . $at_code . $insert_code ."-0000000000";
                            $quantity = $spreadSheetArr[$col][2];
                            // $querAI=$this->db->prepare("INSERT INTO activosinventarios (creado_en, activosfijos_id, codigo, cantidad, tipoestado_id, empresa_id) VALUES ('$creado_en', $af_id, '$all_code', $quantity, ?, '$this->empresa_id' )");
                            // $querAI->bind_param("s", $tipoestado_id);
                            $querAI=$this->db->prepare("INSERT INTO activosinventarios (creado_en, activosfijos_id, codigo, cantidad, empresa_id) VALUES ('$creado_en', $af_id, '$all_code', $quantity, '$this->empresa_id' )");
                            $querAI->execute();

                            if ($querAI->affected_rows === 1) {
                                $ai_id = $querAI->insert_id;
                                // id, cantidad, observacion, tipoestado_id, activosinventarios_id
                                $queryIC = $this->db->prepare("INSERT INTO inventarioscantidad (cantidad, tipoestado_id, activosinventarios_id) VALUES ($quantity, $tipoestado_id, $ai_id)");
                                $queryIC->execute();
                            }
                        }

                        $insert_code = intval($insert_code) + 1;
                        $insert_code = str_pad($insert_code, 4, '0', STR_PAD_LEFT);
                    }
                } else {
                    for ($col = 1; $col < $sheetCount; $col ++) {
                        $fa_code = $spreadSheetArr[$col][1];
                        $category_id = $this->mySubQuery("id_categoria");
                        $query_fa = $this->db->query("SELECT id, cantidad FROM $this->t_name WHERE codigo = '$fa_code' AND categorias_id = $category_id");
                        $data_fa = $query_fa->fetch_assoc();
                        if (!$data_fa){
                            continue;
                        }
                        $fixedAsset = $data_fa["id"];
                        $count ++;

                        $ss_data = [
                            "nombre" => $spreadSheetArr[$col][3],
                            "detalle" => $spreadSheetArr[$col][4],
                            "precio" => $spreadSheetArr[$col][5],
                            "fechacompra" => date_format(date_create($spreadSheetArr[$col][6]), "Y-m-d"),
                            "observacion" => $spreadSheetArr[$col][7],
                            "editado_en" => $date,
                            "usu_editor" => $userId,
                        ];

                        $insurance =  trim($spreadSheetArr[$col][12]);
                        if ($insurance) {
                            $q_insurance = $this->db->prepare("SELECT id FROM seguros WHERE empresa_id = '$this->empresa_id' AND TRIM(poliza) = ?");
                            $q_insurance->bind_param("s", $insurance);
                            $q_insurance->execute();
                            $data_insurance = $q_insurance->get_result();
                            if ($data_insurance->num_rows === 1) {
                                $data_insurance = $data_insurance->fetch_assoc();
                                if ($data_insurance) $ss_data["seguros_id"] = $data_insurance["id"];
                            }
                        }

                        $inventoryType = trim($spreadSheetArr[$col][14]);
                        if ($inventoryType) {
                            $q_inventoryType = $this->db->prepare("SELECT id FROM tipoinventario WHERE empresa_id = '$this->empresa_id' AND TRIM(nombre) = ?");
                            $q_inventoryType->bind_param("s", $inventoryType);
                            $q_inventoryType->execute();
                            $data_inventoryType = $q_inventoryType->get_result();
                            if ($data_inventoryType->num_rows === 1) {
                                $data_inventoryType = $data_inventoryType->fetch_assoc();
                                if ($data_inventoryType) $ss_data["tipoinventario_id"] = $data_inventoryType["id"];
                            }
                        }

                        $quantityE = trim($spreadSheetArr[$col][2]) || trim($spreadSheetArr[$col][2]) === "0" ? intval($spreadSheetArr[$col][2]) : null;
                        if ($quantityE || $quantityE === 0) $ss_data["cantidad"] = $spreadSheetArr[$col][2];
                        // if (isset($spreadSheetArr[$col][9]) && trim($spreadSheetArr[$col][9])) $ss_data["seguros_id"] = $spreadSheetArr[$col][9];
                        if (isset($spreadSheetArr[$col][15]) && trim($spreadSheetArr[$col][15])) $ss_data["salvamento"] = $spreadSheetArr[$col][15]; 
                        if (isset($spreadSheetArr[$col][16]) && trim($spreadSheetArr[$col][16])) $ss_data["duracion"] = $spreadSheetArr[$col][16]; 
                        if (isset($spreadSheetArr[$col][17]) && trim($spreadSheetArr[$col][17])) $ss_data["unidadmedida"] = $spreadSheetArr[$col][17];

                        $name_columns = array_keys($ss_data);
                        $value_columns = array_values($ss_data);
                        array_push($value_columns, $fixedAsset);

                        $bind_types = str_repeat("s", count($ss_data));
                        $prepare_marks = "";
                        foreach ($name_columns as $value) {
                            $prepare_marks .= $value." = ?, ";
                        }
                        $prepare_marks = substr($prepare_marks, 0, -2);

                        $state = trim($spreadSheetArr[$col][13]);
                        if ($state) {
                            $q_state = $this->db->prepare("SELECT id FROM tipoestado WHERE empresa_id = '$this->empresa_id' AND TRIM(nombre) = ?");
                            $q_state->bind_param("s", $state);
                            $q_state->execute();
                            $state = $q_state->get_result();
                            if ($state->num_rows === 1) {
                                $state = $state->fetch_assoc();
                                if ($state) {
                                    $st_id = $state["id"];
                                    $q_fai = $this->db->query("SELECT * FROM activosinventarios WHERE id = (SELECT MIN(id) FROM activosinventarios WHERE activosfijos_id = '$fixedAsset' AND inventarios_id IS NULL)");
                                    $d_fai = $q_fai->fetch_assoc();

                                    // actualizar el estado de los activosinventarios si se encuentra solo un registro relacionado con activosinventarios
                                    $q_ic = $this->db->query("SELECT * FROM inventarioscantidad WHERE activosinventarios_id = '".$d_fai["id"]."'");
                                    $d_ic = $q_ic->fetch_all();
                                    if (count($d_ic) === 1) {
                                        $this->db->query("UPDATE inventarioscantidad SET tipoestado_id = $st_id WHERE activosinventarios_id = '".$d_fai["id"]."'");
                                    }
                                }
                            }
                        }
                        
                        if ($quantityE || $quantityE === 0) {
                            $query_fai = $this->db->query("SELECT * FROM activosinventarios WHERE id = (SELECT MIN(id) FROM activosinventarios WHERE activosfijos_id = '$fixedAsset' AND inventarios_id IS NULL)");
                            $data_fai = $query_fai->fetch_assoc();
        
                            $query_sum = $this->db->query("SELECT IFNULL(SUM(cantidad), 0) AS cantidadtotal FROM movimientoactivos WHERE estado = 2 AND activosfijos_id = '$fixedAsset' AND movimientos_id IN (SELECT id FROM movimientos WHERE estado IS NULL OR estado = 2)");
                            $data_sum = $query_sum->fetch_assoc();
        
                            $quantityI = $data_fai["cantidad"];
                            $quantityFA = $data_fa["cantidad"];
                            $quantityM = $data_sum["cantidadtotal"];
        
                            if ($quantityE == $quantityFA) {
                                $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                                $quer->bind_param($bind_types."i", ...$value_columns);
                                $quer->execute();
                            } else if ($quantityE > $quantityFA) {
                                $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                                $quer->bind_param($bind_types."i", ...$value_columns);
                                $quer->execute();
                                
                                $quantity = ($quantityE - $quantityFA) + $quantityI;
                                $this->db->query("UPDATE activosinventarios SET cantidad = $quantity WHERE id = '".$data_fai["id"]."'");   
                            } else if ($quantityE < $quantityFA && ($quantityI - $quantityM) >= ($quantityFA - $quantityE)) {
                                $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                                $quer->bind_param($bind_types."i", ...$value_columns);
                                $quer->execute();
                                
                                $quantity = $quantityI - ($quantityFA - $quantityE);
                                $this->db->query("UPDATE activosinventarios SET cantidad = $quantity WHERE id = '".$data_fai["id"]."'");   
                            } else {
                                throw new Exception("No se puede actualizar la cantidad del activo fijo");
                            }
                        } else {
                            $quer=$this->db->prepare("UPDATE $this->t_name SET $prepare_marks WHERE $this->col_id = ? AND categorias_id = $category_id");
                            $quer->bind_param($bind_types."i", ...$value_columns);
                            $quer->execute();
                        }
                    }
                }

                $this->res = [
                    "status" => 200, 
                    "affected_rows" => $count, 
                    "data" => "Datos de Excel importados a la base de datos"
                ];
                $this->db->commit();
            } else {
                $this->res = [
                    "status" => 400,
                    "errors" => ["file" => "Tipo de archivo invalido. Cargar archivo de Excel."]
                ];
            }
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "msg_error" => "Problema al importar datos de Excel",
            ];
            $this->db->rollback();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function exportExcel() {
        require '../vendor/autoload.php';

        $spreadsheet = new PhpOffice\PhpSpreadsheet\Spreadsheet();

        $category_id = $this->mySubQuery("id_categoria");
        $typestate_id = $this->mySubQuery("id_tipoestado");

        $category_name = $this->mySubQuery("nombre_categoria");
        $category_code = $this->mySubQuery("codigo_categoria");
        $typeestate_name = $this->mySubQuery("nombre_tipobien");
        $typeestate_code = $this->mySubQuery("codigo_tipobien");
        $insurance_policy = $this->mySubQuery("poliza_tiposeguro");
        $typeinsurance_name = $this->mySubQuery("nombre_tiposeguro");
        // $typestate_name = $this->mySubQuery("nombre_tipoestado");
        $quantity = $this->mySubQuery("cantidad_disponible");
        $inventorytype_name = $this->mySubQuery("nombre_tipoinventario");


        $sql = "SELECT *, $category_name, $category_code, $typeestate_name, $typeestate_code, $insurance_policy, $typeinsurance_name, $inventorytype_name FROM $this->t_name WHERE categorias_id = $category_id ORDER BY id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $clientes = $stmt->get_result();
        $clientes = $this->db->all($clientes, MYSQLI_ASSOC);

        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Activos Fijos');

        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', 'Código');
        $sheet->setCellValue('C1', 'Cantidad');
        $sheet->setCellValue('D1', 'Nombre');
        $sheet->setCellValue('E1', 'Detalle');
        $sheet->setCellValue('F1', 'Precio');
        $sheet->setCellValue('G1', 'Fecha de ingreso');
        $sheet->setCellValue('H1', 'Observación');
        $sheet->setCellValue('I1', 'Categoría');
        $sheet->setCellValue('J1', 'Código categoría');
        $sheet->setCellValue('K1', 'Tipo de bien');
        $sheet->setCellValue('L1', 'Código T.B.');
        $sheet->setCellValue('M1', 'Poliza de seguro');
        $sheet->setCellValue('N1', 'Estado');
        $sheet->setCellValue('O1', 'Tipo de inventario');
        // $sheet->setCellValue('P1', 'Proveedor');
        $sheet->setCellValue('P1', 'Valor de Salvamento');
        $sheet->setCellValue('Q1', 'Duración');
        $sheet->setCellValue('R1', 'Unidad de medida');

        // Ajustar el ancho de las columnas
        $sheet->getColumnDimension('A')->setWidth(5);
        $sheet->getColumnDimension('B')->setWidth(10);
        $sheet->getColumnDimension('C')->setWidth(10);
        $sheet->getColumnDimension('D')->setWidth(25);
        $sheet->getColumnDimension('E')->setWidth(30);
        $sheet->getColumnDimension('F')->setWidth(10);
        $sheet->getColumnDimension('G')->setWidth(15);
        $sheet->getColumnDimension('H')->setWidth(20);
        $sheet->getColumnDimension('I')->setWidth(25);
        $sheet->getColumnDimension('J')->setWidth(10);
        $sheet->getColumnDimension('K')->setWidth(20);
        $sheet->getColumnDimension('L')->setWidth(10);
        $sheet->getColumnDimension('M')->setWidth(15);
        $sheet->getColumnDimension('N')->setWidth(15);
        $sheet->getColumnDimension('O')->setWidth(25);
        $sheet->getColumnDimension('P')->setWidth(10);
        $sheet->getColumnDimension('Q')->setWidth(10);
        $sheet->getColumnDimension('R')->setWidth(10);

        $row = 2;
        foreach ($clientes as $cliente) {
            $sheet->setCellValue('A' . $row, $cliente['id']);
            $sheet->setCellValue('B' . $row, $cliente['codigo']);
            $sheet->setCellValue('C' . $row, $cliente['cantidad']);
            $sheet->setCellValue('D' . $row, $cliente['nombre']);
            $sheet->setCellValue('E' . $row, $cliente['detalle']);
            $sheet->setCellValue('F' . $row, $cliente['precio']);
            $sheet->setCellValue('G' . $row, $cliente['fechacompra']);
            $sheet->setCellValue('H' . $row, $cliente['observacion']);
            $sheet->setCellValue('I' . $row, $cliente['nombrecategoria']);
            $sheet->setCellValue('J' . $row, $cliente['codigocategoria']);
            $sheet->setCellValue('K' . $row, $cliente['nombretipobien']);
            $sheet->setCellValue('L' . $row, $cliente['codigotipobien']);
            $sheet->setCellValue('M' . $row, ($cliente['polizaseguro'] ? $cliente['polizaseguro'] : ""));
            // $sheet->setCellValue('N' . $row, $cliente['nombretipoestado']);
            $sheet->setCellValue('N' . $row, "");
            $sheet->setCellValue('O' . $row, $cliente['nombretipoinventario']);
            // $sheet->setCellValue('P' . $row, $cliente['proveedor_id']);
            $sheet->setCellValue('P' . $row, $cliente['salvamento']);
            $sheet->setCellValue('Q' . $row, $cliente['duracion']);
            $sheet->setCellValue('R' . $row, $cliente['unidadmedida']);
            $row++;
        }

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="activos_fijos.xlsx"');

        $writer = PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
    }
    
    public function excelFormat() {
        require '../vendor/autoload.php';

        $spreadsheet = new PhpOffice\PhpSpreadsheet\Spreadsheet();

        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Activos Fijos');

        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', 'Código');
        $sheet->setCellValue('C1', 'Cantidad');
        $sheet->setCellValue('D1', 'Nombre');
        $sheet->setCellValue('E1', 'Detalle');
        $sheet->setCellValue('F1', 'Precio');
        $sheet->setCellValue('G1', 'Fecha de ingreso');
        $sheet->setCellValue('H1', 'Observación');
        $sheet->setCellValue('I1', 'Categoría');
        $sheet->setCellValue('J1', 'Código categoría');
        $sheet->setCellValue('K1', 'Tipo de bien');
        $sheet->setCellValue('L1', 'Código T.B.');
        $sheet->setCellValue('M1', 'Poliza de seguro');
        $sheet->setCellValue('N1', 'Estado');
        $sheet->setCellValue('O1', 'Tipo de inventario');
        // $sheet->setCellValue('P1', 'Proveedor');
        $sheet->setCellValue('P1', 'Valor de Salvamento');
        $sheet->setCellValue('Q1', 'Duración');
        $sheet->setCellValue('R1', 'Unidad de medida');

        // Ajustar el ancho de las columnas
        $sheet->getColumnDimension('A')->setWidth(5);
        $sheet->getColumnDimension('B')->setWidth(10);
        $sheet->getColumnDimension('C')->setWidth(10);
        $sheet->getColumnDimension('D')->setWidth(20);
        $sheet->getColumnDimension('E')->setWidth(20);
        $sheet->getColumnDimension('F')->setWidth(10);
        $sheet->getColumnDimension('G')->setWidth(20);
        $sheet->getColumnDimension('H')->setWidth(25);
        $sheet->getColumnDimension('I')->setWidth(10);
        $sheet->getColumnDimension('J')->setWidth(18);
        $sheet->getColumnDimension('K')->setWidth(15);
        $sheet->getColumnDimension('L')->setWidth(15);
        $sheet->getColumnDimension('M')->setWidth(17);
        $sheet->getColumnDimension('N')->setWidth(20);
        $sheet->getColumnDimension('O')->setWidth(30);
        $sheet->getColumnDimension('P')->setWidth(20);
        $sheet->getColumnDimension('Q')->setWidth(10);
        $sheet->getColumnDimension('R')->setWidth(20);

        $sheet->setCellValue('A2', "-");
        $sheet->setCellValue('B2', "00000000");
        $sheet->setCellValue('C2', "1");
        $sheet->setCellValue('D2', "Nombre del activo");
        $sheet->setCellValue('E2', "Detalle del activo");
        $sheet->setCellValue('F2', "10,5");
        $sheet->setCellValue('G2', "2000-12-31");
        $sheet->setCellValue('H2', "Observación del activo");
        $sheet->setCellValue('I2', "-");
        $sheet->setCellValue('J2', "00");
        $sheet->setCellValue('K2', "-");
        $sheet->setCellValue('L2', "00");
        $sheet->setCellValue('M2', "111111");
        $sheet->setCellValue('N2', "Nombre del Tipo de stado");
        $sheet->setCellValue('O2', "Nombre del Tipo de inventario");
        // $sheet->setCellValue('P2', "");
        $sheet->setCellValue('P2', "0");
        $sheet->setCellValue('Q2', "1");
        $sheet->setCellValue('R2', "Año");

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="formato_activos_fijos.xlsx"');

        $writer = PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save('php://output');
    }

    public function search($value){
        try {
            $value = "%{$value}%";

            $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $category_id = $this->mySubQuery("id_categoria");
            $category_name = $this->mySubQuery("nombre_categoria");
            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $history_code = $this->mySubQuery("codigo_historial");
            $insurance_policy = $this->mySubQuery("poliza_tiposeguro");
            $typeinsurance_name = $this->mySubQuery("nombre_tiposeguro");
            $typestate_name = $this->mySubQuery("nombre_tipoestado");
            $quantity = $this->mySubQuery("cantidad_disponible");
            $notification = $this->mySubQuery("notificaciones");

            $quer = "";
            if(isset($_GET["altas"]) && $_GET["altas"] == 1){
                $quer .= " AND eliminado_en IS NULL";
            } 

            $consulta = $this->db->prepare("SELECT *, $situationtype_type, $category_name, $typeestate_name, $history_code, $insurance_policy, $typeinsurance_name, $typestate_name, $quantity, $notification  FROM $this->t_name  WHERE categorias_id = $category_id AND (nombre LIKE ? OR codigo LIKE ? OR detalle LIKE ? OR precio LIKE ?) $quer ORDER BY codigo");
            $consulta->bind_param("ssss", $value, $value, $value, $value);
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

    public function report($pdf = FALSE, $inventoryType_id = FALSE, $available = FALSE){
        try {
            $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $category_id = $this->mySubQuery("id_categoria");
            $category_name = $this->mySubQuery("nombre_categoria");
            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $history_code = $this->mySubQuery("codigo_historial");
            $insurance_policy = $this->mySubQuery("poliza_tiposeguro");
            $typeinsurance_name = $this->mySubQuery("nombre_tiposeguro");
            // $typestate_name = $this->mySubQuery("nombre_tipoestado");
            $quantity = $this->mySubQuery("cantidad_disponible");
            $quantityA = $this->mySubQuery("cantidad_altas");
            $notification = $this->mySubQuery("notificaciones");
            $inventorytype_name = $this->mySubQuery("nombre_tipoinventario");

            $quer = "";
            $types = "";
            $bp_value = [];

            if ($inventoryType_id) {
                $types.="s";
                array_push($bp_value, $inventoryType_id);
                $quer .= " AND tipoinventario_id = ?";
            }
            if (isset($_POST["categoria_id"]) && trim($_POST["categoria_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["categoria_id"]);
                $quer .= " AND categorias_id = ?";
            }
            if(isset($_POST["altasbajas"]) && trim($_POST["altasbajas"])){
                $types.="s";
                array_push($bp_value, "1");
                $ab = $_POST["altasbajas"];
                if($ab == "1") {
                    $quer .= " AND eliminado_en IS NULL AND 1 = ?";
                } else if($ab == "2") {
                    $quer .= " AND eliminado_en IS NOT NULL AND 1 = ?";
                }
            } 
            if(isset($_POST["tiposeguro_id"]) && trim($_POST["tiposeguro_id"])){
                // $bp_value = $_GET["tiposeguro_id"];
                $types.="s";
                array_push($bp_value, $_POST["tiposeguro_id"]);
                $quer .= "AND seguros_id IN (SELECT id FROM seguros WHERE tiposeguro_id = ?)";
            } 
            if(isset($_POST["af_seguro"]) && trim($_POST["af_seguro"])){
                $i_data = $_POST["af_seguro"];
                if($i_data == "1") {
                    $quer .= "AND seguros_id IS NOT NULL";
                }
                if($i_data == "2") {
                    $quer .= "AND seguros_id IS NULL";
                }
            }
            if (isset($_POST["con_alertas"]) && trim($_POST["con_alertas"])) {
                $quer .= " AND (SELECT COUNT(*) FROM activosinventarios WHERE activosfijos_id = $this->t_name.id AND observacion IS NOT NULL AND id IN (SELECT activosinventarios_id FROM observacionesainventarios WHERE activosinventarios_id = activosinventarios.id AND tipo = 2 AND estado = 0)) > 0";
            }
            if(isset($_GET["altas"]) && $_GET["altas"] == 1){
                $types.="s";
                array_push($bp_value, 1);
                $quer .= " AND eliminado_en IS NULL AND 1 = ?";
            }
            
            $q_ee = "";
            if ($available == "altas" || $available == "seguros") {
                $q_ee = " AND eliminado_en IS NULL";
            }

            $consulta = $this->db->prepare("SELECT *, $situationtype_type, $category_name, $typeestate_name, $history_code, $insurance_policy, $typeinsurance_name, $quantity, $notification, $quantityA, $inventorytype_name FROM $this->t_name  WHERE categorias_id = $category_id $quer $q_ee ORDER BY codigo");
            // if ($quer && $bp_value) {
            //     $consulta->bind_param("s", $bp_value);
            // }
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

            if ($pdf) {
                // $info = json_decode($_POST["informacion"]);
                // $this->res["info"] = $info;
                require_once "pdf/filesFixedAsset.php";
                $object = new FilesFixedAsset();
                if ($available == "altas") {
                    $object->report($this->res);
                } else if ($available == "seguros") {
                    $object->reportFAInsurance($this->res);
                } else {
                    $object->reportFAUnsubscribe($this->res);
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

    public function reportInventory($inventory_id, $pdf = FALSE){
        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND af.tipoinventario_id = $this->tipo_inv_id";
            }

            $quer = "";
            $types = "";
            $bp_value = [];
            if (isset($_POST["region_id"]) && trim($_POST["region_id"])) {
                $id_region = $_POST["region_id"];
                $db_em = new DBConnection("empresa"); 
                $queryBO = $db_em->prepare("SELECT idsucursalcontable FROM sucursalcontable WHERE MD5(idorganizacion) = '$this->empresa_id' AND idregion = ?");
                $queryBO->bind_param("s", $id_region);
                $queryBO->execute();
                $resultBO = $queryBO->get_result();
                $boIds = [];
                while ($row = $resultBO->fetch_assoc()) {
                    array_push($boIds, $row["idsucursalcontable"]);
                }
                if ($boIds) {
                    $boIds = implode(", ", $boIds);
                    $types.="s";
                    array_push($bp_value, 1);
                    $quer .= " AND ai.sucursal_id IN ($boIds) AND 1 = ?";
                }
            }
            if (isset($_POST["areatrabajo_id"]) && trim($_POST["areatrabajo_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["areatrabajo_id"]);
                $quer .= " AND ai.departamento_id = ?";
            }
            if (isset($_POST["categoria_id"]) && trim($_POST["categoria_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["categoria_id"]);
                $quer .= " AND af.categorias_id = ?";
            }
            if (isset($_POST["estado_id"]) && trim($_POST["estado_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["estado_id"]);
                $quer .= " AND ai.codigo IN (
                    SELECT codigo FROM activosinventarios 
                    WHERE inventarios_id = $inventory_id 
                        AND (   
                            SELECT COUNT(*) FROM inventarioscantidad 
                            WHERE activosinventarios_id = activosinventarios.id 
                                AND tipoestado_id = ? 
                                AND (
                                    observacionesainventarios_id IS NULL 
                                    OR (SELECT COUNT(*) FROM observacionesainventarios where inventarioscantidad.observacionesainventarios_id = id AND estado < 5) > 0
                                )
                        ) > 0 
                        GROUP BY codigo
                )";
            }
            
            $currentDate = date("Y-m-d H:i:s");
            
            $consulta = $this->db->prepare(
                "SELECT ai.*, 
                    af.nombre, af.detalle, af.precio, af.fechacompra,
                    c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
                    (SELECT '$currentDate') AS fechaactual,
                    (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
                    (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro,
                    (
                        SELECT SUM(ic.cantidad)
                        FROM inventarioscantidad ic
                        INNER JOIN activosinventarios ai_inv ON ic.activosinventarios_id = ai_inv.id
                        LEFT JOIN observacionesainventarios oai ON ic.observacionesainventarios_id = oai.id
                        WHERE ai_inv.inventarios_id = $inventory_id 
                            AND ai_inv.activosfijos_id = af.id 
                            AND ai_inv.codigo = ai.codigo 
                            AND (oai.estado < 5 OR ic.observacionesainventarios_id IS NULL)
                    ) AS cantidad_verificada,
                    (SELECT id FROM activosinventarios WHERE inventarios_id = $inventory_id AND activosfijos_id = af.id AND  codigo = ai.codigo LIMIT 1) AS id_af_inventario
                FROM activosinventarios ai 
                INNER JOIN $this->t_name af ON activosfijos_id = af.id 
                INNER JOIN categorias c ON af.categorias_id = c.id
                INNER JOIN tipobien tb ON af.tipobien_id = tb.id
                WHERE inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' $quer $eti_query ORDER BY ai.codigo");

            if ($quer) {
                $consulta->bind_param($types, ...$bp_value);
            }
            $consulta->execute();
            $req =  $consulta->get_result();

            $consultaI = $this->db->prepare("SELECT * FROM inventarios  WHERE id = $inventory_id");
            $consultaI->execute();
            $reqI =  $consultaI->get_result();
            $dataI = $this->db->assoc($reqI);

            $idusuario = $dataI["usu_creador"];
            $db_rh = new DBConnection("rrhh");
            $quer_trabajador=$db_rh->prepare("SELECT idtrabajador, CONCAT(nombre, ' ', apellido) AS nombrecompleto FROM trabajador WHERE idtrabajador IN (SELECT trabajador_idtrabajador FROM usuario WHERE MD5(idusuario) = '$idusuario')");
            $quer_trabajador->execute();
            $result_t =  $quer_trabajador->get_result();
            $dataT = $db_rh->assoc($result_t);

            $dataI["nombrecompleto"] = $dataT["nombrecompleto"];

            $data = $this->db->all($req, MYSQLI_ASSOC);
            // $dataI = $this->db->assoc($reqI);
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
                "dataInventarios" => $dataI,
            ];
            if (isset($_POST["informacion"])) {
                $info = json_decode($_POST["informacion"]);
                $this->res["info"] = $info;
            }
            if ($pdf) {
                require_once "pdf/filesInventory.php";
                $object = new FilesInventory();
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

    public function history($fa_id, $baja = FALSE, $js = FALSE){
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
            // $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $category_id = $this->mySubQuery("id_categoria");
            $category_name = $this->mySubQuery("nombre_categoria");
            // $history_code = $this->mySubQuery("codigo_historial");
            $insurance_policy = $this->mySubQuery("poliza_tiposeguro");
            $typestate_name = $this->mySubQuery("nombre_tipoestado");


            $consulta=$this->db->query("SELECT *, $category_name, $insurance_policy, $typestate_name FROM $this->t_name WHERE $this->col_id = $fa_id AND categorias_id = $category_id");
            $data =  $consulta->fetch_assoc();
            
            $consultaHistory = $this->db->query("SELECT *, (SELECT nombre FROM componentes WHERE id = historial.componentes_id) as nombrecomponente FROM historial WHERE activosfijos_id = $fa_id AND tiposituacion_id = (SELECT id FROM tiposituacion WHERE id = historial.tiposituacion_id AND empresa_id = '$this->empresa_id')");
            $dataHistory = $consultaHistory->fetch_all(MYSQLI_ASSOC);

            $unsubscribeFA = $this->db->query("SELECT *, (SELECT nombre FROM tipobaja WHERE id = bajas.tipobaja_id) as nombretipobaja FROM bajas WHERE activosfijos_id = $fa_id");
            $dataUFA = $unsubscribeFA->fetch_all(MYSQLI_ASSOC);
            
            $componentsFA = $this->db->query("SELECT * FROM componentes WHERE activosfijos_id = $fa_id");
            $dataCompts = $componentsFA->fetch_all(MYSQLI_ASSOC);
            
            $queryTrajectory = $this->db->query("SELECT * FROM ubicacionactivo WHERE activosfijos_id = '$fa_id' ORDER BY id ASC");
            $dataTrajectory = $queryTrajectory->fetch_all(MYSQLI_ASSOC);

            /*$queryLocation = $this->db->query(
                "SELECT *, 
                    (SELECT nombre FROM tipoestado WHERE id = (SELECT a_i.tipoestado_id FROM activosinventarios a_i WHERE a_i.id = (SELECT MAX(ai.id) FROM activosinventarios ai WHERE ai.codigo = activosinventarios.codigo))) AS nombretipoestado
                FROM activosinventarios 
                WHERE activosfijos_id = '$fa_id' 
                    AND cantidad > 0 ORDER BY cantidad DESC
            ");*/
            // $queryLocation = $this->db->query(
            //     "SELECT ai.*, 
            //         (SELECT MAX(ai2.id) 
            //         FROM activosinventarios ai2 
            //         WHERE ai2.codigo = ai.codigo) AS id_ai,
            //         ic.*,
            //         te.nombre AS nombretipoestado,
            //         (SELECT cantidad FROM activosinventarios WHERE id = (SELECT MIN(id) FROM activosinventarios WHERE activosfijos_id = '$fa_id' AND codigo = ai.codigo)) AS ai_cantidad
            //     FROM activosinventarios ai
            //     LEFT JOIN inventarioscantidad ic ON ic.activosinventarios_id = (
            //         SELECT MAX(ai2.id) 
            //         FROM activosinventarios ai2 
            //         WHERE ai2.codigo = ai.codigo
            //     )
            //     LEFT JOIN observacionesainventarios oa_i ON oa_i.id = ic.observacionesainventarios_id
            //     LEFT JOIN tipoestado te ON te.id = ic.tipoestado_id
            //     WHERE ai.activosfijos_id = '$fa_id' 
            //     AND ai.cantidad > 0 AND (oa_i.estado < 5 OR ic.observacionesainventarios_id IS NULL)
            //     ORDER BY ai.cantidad DESC"
            // );

            // // LEFT JOIN observacionesainventarios oa_i ON oa_i.id = i_c.observacionesainventarios_id
            // //             WHERE i_c.activosinventarios_id = '$ai_id' AND (oa_i.estado < 5 OR i_c.observacionesainventarios_id IS NULL)"
        
            // $dataLocation = $queryLocation->fetch_all(MYSQLI_ASSOC);

            $queryLocation = $this->db->query(
                "SELECT *, 
                    (
                        SELECT a_i.id 
                        FROM activosinventarios a_i 
                        WHERE a_i.id = (
                                SELECT MAX(ai.id) 
                                FROM activosinventarios ai 
                                WHERE ai.codigo = activosinventarios.codigo)
                            ) AS id_ai,
                    (
                        SELECT a_i.cantidad 
                        FROM activosinventarios a_i 
                        WHERE a_i.id = (
                                SELECT MIN(ai.id) 
                                FROM activosinventarios ai 
                                WHERE ai.activosfijos_id = '$fa_id' 
                                    AND ai.codigo = activosinventarios.codigo
                            )
                    ) AS ai_cantidad
                FROM activosinventarios 
                WHERE activosfijos_id = '$fa_id' 
                    AND cantidad > 0 ORDER BY cantidad DESC"
            );
            $dataLocation = $queryLocation->fetch_all(MYSQLI_ASSOC);

            foreach ($dataLocation as $key => $value) {
                $ai_id = $value["id_ai"];
                // echo '<pre>'. print_r($ai_id, true) .'</pre>';
                $query_ic = $this->db->query(
                        "SELECT i_c.*, 
                            (SELECT nombre FROM tipoestado WHERE id = i_c.tipoestado_id) AS nombretipoestado
                        FROM inventarioscantidad i_c
                        LEFT JOIN observacionesainventarios oa_i ON oa_i.id = i_c.observacionesainventarios_id
                        WHERE i_c.activosinventarios_id = '$ai_id' AND (oa_i.estado < 5 OR i_c.observacionesainventarios_id IS NULL)"
                );

                $dataIc = $query_ic->fetch_all(MYSQLI_ASSOC);
                if ($dataIc) {
                    $dataLocation[$key]["array_cantidad"] = $dataIc;
                }
                // echo '<pre>'. print_r($dataIc, true) .'</pre>';

            }

            // echo '<pre>'. json_encode($dataLocation, JSON_PRETTY_PRINT) .'</pre>';
            // return;

            $queryUniqueUser = $this->db->query(
                "SELECT ai.* 
                FROM activosinventarios ai
                INNER JOIN activosfijos af ON ai.activosfijos_id = af.id 
                WHERE af.id = '$fa_id' AND af.cantidad = 1 AND ai.cantidad=1 AND trabajador_id IS NOT NULL ORDER BY af.id DESC");
            $dataUniqueUser = $queryUniqueUser->fetch_assoc();
            
            if ($dataTrajectory && !$baja) {                
                $bOId = [];
                $areaId = [];
                $workerId = [];
                foreach ($dataTrajectory as $key => $value) {
                    array_push($bOId, $value["sucursal_id"]) ;
                    array_push($areaId, $value["departamento_id"]);
                    array_push($workerId, $value["trabajador_id"]);
                }
                foreach($dataLocation as $value){
                    if(!in_array($value, $bOId)) {
                        array_push($bOId, $value["sucursal_id"]);
                        array_push($areaId, $value["departamento_id"]);
                        array_push($workerId, $value["trabajador_id"]);
                    }
                }

                $bOId = implode(", ", array_filter($bOId));
                $areaId = implode(", ", array_filter($areaId));
                $workerId = implode(", ", array_filter($workerId));
                
                $db_rh = new DBConnection("rrhh");
                $db_em = new DBConnection("empresa"); 
                
                $queryBO = $db_em->query("SELECT idsucursalcontable, nombre, (SELECT nombre FROM region WHERE idregion = sucursalcontable.idregion) AS nombreregion FROM sucursalcontable WHERE idsucursalcontable IN ($bOId)");
                $queryArea = $db_rh->query("SELECT idareas, nombre FROM areas WHERE idareas IN ($areaId)");
                $queryWorker = $db_rh->query("SELECT idtrabajador, CONCAT(nombre, ' ', apellido) AS nombrecompleto, (SELECT cargo FROM cargos WHERE idcargos = trabajador.cargos_idcargos) AS cargo FROM trabajador WHERE idtrabajador IN ($workerId)");
                $dataBO = [];
                $dataArea = [];
                $dataWorker = [];
                while ($row = $queryBO->fetch_assoc()) {
                    $dataBO[$row["idsucursalcontable"]] = $row["nombre"];
                    $dataBO["region". $row["idsucursalcontable"]] = $row["nombreregion"];
                }
                while ($row = $queryArea->fetch_assoc()) {
                    $dataArea[$row["idareas"]] = $row["nombre"];
                }
                while ($row = $queryWorker->fetch_assoc()) {
                    $dataWorker[$row["idtrabajador"]] = $row["nombrecompleto"];
                    $dataWorker["cargo". $row["idtrabajador"]] = $row["cargo"];
                }

                if ($dataUniqueUser) {
                    $dataUniqueUser["sucursal"] = $dataBO[$dataUniqueUser["sucursal_id"]];
                    $dataUniqueUser["region"] = $dataBO["region". $dataUniqueUser["sucursal_id"]];
                    $dataUniqueUser["area"] = $dataArea[$dataUniqueUser["departamento_id"]];
                    $dataUniqueUser["trabajador"] = $dataWorker[$dataUniqueUser["trabajador_id"]];
                    $dataUniqueUser["cargo_trabajador"] = $dataWorker["cargo". $dataUniqueUser["trabajador_id"]];
                }

                foreach ($dataTrajectory as $key => $value) {
                    if ($value["sucursal_id"]) {
                        $dataTrajectory[$key]["sucursal"] = $dataBO[$value["sucursal_id"]];
                        $dataTrajectory[$key]["area"] = $dataArea[$value["departamento_id"]];
                        $dataTrajectory[$key]["trabajador"] = $dataWorker[$value["trabajador_id"]];
                        $dataTrajectory[$key]["cargo_trabajador"] = $dataWorker["cargo". $value["trabajador_id"]];
                    }
                }
                foreach ($dataLocation as $key => $value) {
                    if ($value["sucursal_id"]) {
                        $dataLocation[$key]["sucursal"] = $dataBO[$value["sucursal_id"]];
                        $dataLocation[$key]["area"] = $dataArea[$value["departamento_id"]];
                        $dataLocation[$key]["trabajador"] = $dataWorker[$value["trabajador_id"]];
                        $dataLocation[$key]["cargo_trabajador"] = $dataWorker["cargo". $value["trabajador_id"]];
                    }
                }
            }

            if ($baja && $dataUFA) {
                $userIds = [];
                foreach ($dataUFA as $key => $value) {
                    array_push($userIds, "'". $value["usu_creador"] ."'");
                }
                $userIds = implode(", ", array_unique($userIds));

                if ($userIds) {
                    $db_rh = new DBConnection("rrhh");
                    $queryWorker = $db_rh->query(
                        "SELECT MD5(idusuario) AS idusuariomd5, 
                            (SELECT CONCAT(nombre, ' ', apellido) FROM trabajador WHERE idtrabajador = usuario.trabajador_idtrabajador) AS nombretrabajador 
                        FROM usuario WHERE MD5(idusuario) IN ($userIds)");
                    $arrayWorker = [];
                    while ($worker = $queryWorker->fetch_assoc()) {
                        $arrayWorker[$worker["idusuariomd5"]] = $worker["nombretrabajador"];
                    }
        
                    foreach ($dataUFA as $key => $value) {
                        $dataUFA[$key]["nombretrabajador"] = $arrayWorker[$value["usu_creador"]];
                    }
        
                }
            }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($consulta),
                "data" => $data,
                "dataHistory" => $dataHistory,
                "dataUFA" => $dataUFA,
                "dataComponents" => $dataCompts,
                "dataTrajectory" => $dataTrajectory,
                "uniqueUser" => $dataUniqueUser,
                "dataLocation" => $dataLocation,
            ];

            if (!$js) {
                require_once "pdf/filesFixedAsset.php";
                $object = new FilesFixedAsset();
                if ($baja) {
                    $object->historyU($this->res);
                } else {
                    $object->history($this->res, [...$_POST]);
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

    public function selectDepreciation() {
        try {
            $gtDate = (isset($_POST["mayorque"]) && trim($_POST["mayorque"])) ? $_POST["mayorque"] : null;
            $stDate = (isset($_POST["menorque"]) && trim($_POST["menorque"])) ? $_POST["menorque"] : null;
            $faId = (isset($_POST["activosfijos_id"]) && trim($_POST["activosfijos_id"])) ? $_POST["activosfijos_id"] : null;


            $querDpr=$this->db->query("SELECT * FROM metododepreciacion WHERE empresa_id = '$this->empresa_id' AND estado = 1");
            $dataDpr =  $querDpr->fetch_assoc();
            if (!$dataDpr) {
                $this->res = [
                    "status" => 500,
                    "message" => "No se eligió un Método de depreciación.",
                ];
                echo json_encode($this->res, http_response_code($this->res["status"]));
                return;
            }

            $deprDate = "";
            $dprId = 0;
            $isMix = 0;
            $isGet = FALSE;
            if (isset($_GET["fechadepreciacion"]) && isset($_GET["depreciacion_mixto"])  && isset($_GET["metododepreciacion"]) ) {
                $deprDate = $_GET["fechadepreciacion"];
                $dprId = $_GET["metododepreciacion"];
                $isMix = $_GET["depreciacion_mixto"];
                $isGet = TRUE;
            } else if ($dataDpr["metododepreciacion_id"] == 4 && isset($_POST["metododepreciacion_id"]) && trim($_POST["metododepreciacion_id"])) {
                $deprDate = $_POST["fechadepreciacion"];
                $dprId = $_POST["metododepreciacion_id"];
                $isMix = 1;
            } else {
                $deprDate = $_POST["fechadepreciacion"];
                $dprId = $dataDpr["metododepreciacion_id"];
                $isMix = 0;
            }

            $eti_query = "";
            if ($isGet && !($_GET["tipoinventario_id"] === "null")) {
                $eti_query = "AND tipoinventario_id = '".$_GET["tipoinventario_id"]."'";
            } else if ($isGet && $_GET["tipoinventario_id"] === "null") {
                $eti_query = "AND tipoinventario_id IS NULL";
            } else if ($this->tipo_inv_id === "") {
                $eti_query = "AND tipoinventario_id IS NULL";
            } else if ($this->tipo_inv_id) {
                $eti_query = "AND tipoinventario_id = '$this->tipo_inv_id'";
            }

            $querDpr = "";
            if ($faId) {
                $querDpr=$this->db->query("SELECT * FROM cuadrodepreciacion WHERE empresa_id = '$this->empresa_id' AND fechadepreciacion <= '$deprDate' AND depreciacion_mixto = '$isMix' AND metododepreciacion_id = '$dprId' AND activosfijos_id = '$faId' $eti_query ORDER BY fechadepreciacion ASC");
            } else {
                $querDpr=$this->db->query("SELECT * FROM cuadrodepreciacion WHERE empresa_id = '$this->empresa_id' AND fechadepreciacion = (SELECT fechadepreciacion FROM cuadrodepreciacion WHERE fechadepreciacion <= '$deprDate' AND depreciacion_mixto = '$isMix' AND metododepreciacion_id = '$dprId' ORDER BY fechadepreciacion DESC LIMIT 0, 1) AND depreciacion_mixto = '$isMix' AND metododepreciacion_id = '$dprId' $eti_query");
            }

            $previousData =  $querDpr->fetch_all(MYSQLI_ASSOC);

            $dataArray = [
                "fechadepreciacion" => $deprDate,
                "iddepreciacion" => $dprId,
                "depreciacionmixto" => $isMix,
                "activofijo_id" => $faId,
            ];

            if ($faId) {
                if ($previousData) {
                        $this->depreciationChart($dataArray, $previousData);
                } else {
                    // $this->depreciationChart($dataArray);
                    $this->res = [
                        "status" => 500,
                        "message" => "No se encontraron datos de depreciación para el activo fijo seleccionado.",
                    ];
                    echo json_encode($this->res, http_response_code($this->res["status"]));
                }
                return;
            }

            if ($previousData) {
                $dateRecovered = $previousData[0]["fechadepreciacion"];

                $prevData = [];
                $afIds = [];
                foreach ($previousData as $value) {
                    $prevData[$value["activosfijos_id"]] = $value;
                    array_push($afIds, $value["activosfijos_id"]);
                }
                $afIds = implode(", ", $afIds);

                if ($dateRecovered == $deprDate && !($gtDate || $stDate || $faId)) {
                    $dataArray["activosfijosids"] =  $afIds;
                    $this->showDepreciation($prevData, $dataArray);
                } else {
                    $this->depreciationChart($dataArray, $prevData);
                }
            } else {
                $this->depreciationChart($dataArray);
            }
        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "No se pudo realizar la depreciación",
            ];
            echo json_encode($this->res, http_response_code($this->res["status"]));
        }
    }

    public function depreciationChart($dataArray, $previousData = []) {
        $valid = new Validations($this->t_name);

        set_error_handler(function ($err_severity, $err_msg, $err_file, $err_line, array $err_context)
        {
            throw new ErrorException( $err_msg, 0, $err_severity, $err_file, $err_line );
        }, E_WARNING);
        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND tipoinventario_id = '$this->tipo_inv_id'";
            }

            [
                "fechadepreciacion" => $deprDate,
                "iddepreciacion" => $deprId,
                "depreciacionmixto" => $isMix,
                "activofijo_id" => $faId,
            ] = $dataArray; 

            $queryFAExtra = "AND eliminado_en IS NULL";
            $queryCExtra = "";
            if ($isMix == 1) {
                $queryFAExtra = "AND eliminado_en IS NULL AND $this->col_id IN (SELECT activosfijos_id FROM depreciacionactivo WHERE empresa_id = '$this->empresa_id' AND metododepreciacion_id = '$deprId')";
                $queryCExtra = "AND eliminado_en IS NULL AND $this->col_id IN (SELECT activosfijos_id FROM depreciacionactivo WHERE empresa_id = '$this->empresa_id' AND metododepreciacion_id = '$deprId')";
            }
            if ($faId) {
                $queryFAExtra = "AND $this->col_id = '$faId'";
                $queryCExtra = "AND $this->col_id = '$faId'";
            }

            $queryRev = $deprId == 3 ? "AND duracionrevaluo IS NOT NULL" : "AND vidautilrevaluo IS NOT NULL";

            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $category_id = $this->mySubQuery("id_categoria");
            $querFA=$this->db->query(
                "SELECT *, 
                    (SELECT fecharevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS fecharevaluo,
                    (SELECT vidautilrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS vidautilrevaluo, 
                    (SELECT valorrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS valorrevaluo,
                    (SELECT duracionrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS duracionrevaluo,
                    $typeestate_name 
                FROM $this->t_name 
                WHERE categorias_id = $category_id 
                    AND fechacompra <= '$deprDate' 
                    AND tipoinventario_id = (SELECT id FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id AND tipo = 1)
                    $eti_query
                    $queryFAExtra ORDER BY categorias_id ASC"
            );
            $dataFA = $faId ? $querFA->fetch_assoc() : $querFA->fetch_all(MYSQLI_ASSOC);

            $querCategory = $this->db->query(
                "SELECT * 
                FROM categorias 
                WHERE empresa_id = '$this->empresa_id' 
                    AND id IN (
                        SELECT categorias_id 
                        FROM $this->t_name
                        WHERE tipoinventario_id = (SELECT id FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id AND tipo = 1)
                            $queryCExtra $eti_query GROUP BY categorias_id
                    ) ORDER BY id ASC"
            );
            $dataCategory = $faId ? $querCategory->fetch_assoc() : $querCategory->fetch_all(MYSQLI_ASSOC);

            require_once "../db/af_env.php";
            $url = $AF_ENV["apiUrl"] . "/app/ct/api/listatipodecambio/$this->empresa_id";

            // $url = "https://yofinanciero.com/app/ct/api/listatipodecambio/$this->empresa_id";
            // Obtenemos los datos de la API
            $data = file_get_contents($url);
            $dataUfv = json_decode($data, true);
          
            $arrUfv = [];
            foreach ($dataUfv as $key => $value) {
                $arrUfv[$value["fecha"]] = $value["ufv"];
            }


                                    // $querUfv=$this->db->query("SELECT * FROM valoresufv WHERE fecha <= '$deprDate'");
                                    // $dataUfv =  $querUfv->fetch_all(MYSQLI_ASSOC);

                                    // $arrUfv = [];
                                    // foreach ($dataUfv as $key => $value) {
                                    //     $arrUfv[$value["fecha"]] = $value["valor"];
                                    // }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($querFA),
                "date" => $deprDate,
                "data" => $dataFA,
                "dataCategory" => $dataCategory,
                "dataUfv" => $arrUfv,
            ];
            
            require_once "pdf/depreciationSchedule.php";
            $object = new DepreciationSchedule();

            if ($faId) {
                $ventaBaja = $_POST["venta_o_baja"];
                $cantidadVB = empty($_POST["cantidad_vb"]) ? null : $_POST["cantidad_vb"];
                if (empty($ventaBaja)) {
                    $query_baja = $this->db->query("SELECT SUM(precio) AS ganancia_baja FROM bajas WHERE activosfijos_id = '$faId'");
                    $dataBaja = $query_baja->fetch_assoc();
                    $ventaBaja = $dataBaja["ganancia_baja"];

                    $query_baja_c = $this->db->query("SELECT SUM(cantidad) AS cantidad_baja FROM bajas WHERE activosfijos_id = '$faId'");
                    $dataBaja_c = $query_baja_c->fetch_assoc();
                    $cantidadVB = $dataBaja_c["cantidad_baja"];
                }
                $vb_extra = [
                    "venta_baja" => $ventaBaja,
                    "cantidad" => $cantidadVB,
                ];
                if ($deprId == 1) {
                    $object->StraightLineFA($this->res, $previousData, $vb_extra);
                } else if ($deprId == 2) {
                    $object->SumOfDigitsFA($this->res, $previousData, $vb_extra);
                } else if ($deprId == 3) {
                    $querUsage=$this->db->query("SELECT * FROM usoactivofijo WHERE activosfijos_id = '$faId' ORDER BY activosfijos_id ASC");
                    
                    $arrayData = [];
                    while ($usoAF = $this->db->assoc($querUsage)) {
                        $arrayData[$usoAF["fecha"]] = $usoAF["uso"];
                    }
                    $this->res["dataUsage"] = $arrayData;
                    $object->ProductionUnitsFA($this->res, $previousData, $vb_extra);
                }
                return;
            }

            if ($deprId == 1) {
                $object->StraightLine($this->res, $previousData, $isMix);
            } else if ($deprId == 2) {
                $object->SumOfDigits($this->res, $previousData, $isMix);
            } else if ($deprId == 3) {
                $fa_ids = "SELECT id FROM $this->t_name WHERE categorias_id = $category_id AND tipoinventario_id = (SELECT id FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id AND tipo = 1) AND fechacompra <= '$deprDate' $queryFAExtra $eti_query";
                $querUsage=$this->db->query("SELECT * FROM usoactivofijo WHERE activosfijos_id IN ($fa_ids) ORDER BY activosfijos_id ASC");
                
                $arrayData = [];
                $positionName = "";
                while ($usoAF = $this->db->assoc($querUsage)) {
                    if (!($positionName == $usoAF["activosfijos_id"])) {
                        $positionName = $usoAF["activosfijos_id"];
                        $arrayData[$positionName] = [];
                    }
                    $arrayData[$positionName][$usoAF["fecha"]] = $usoAF["uso"];
                }
                
                $this->res["dataUsage"] = $arrayData;
                $object->ProductionUnits($this->res, $previousData, $isMix);
            }
            return;

        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                // "message" => "Se requiren valores de UFVs, Valores de Uso, hasta la fecha ". date('d/m/Y', strtotime('-1 year', strtotime($_POST["fechadepreciacion"]))),
                "message" => "Se requiren valores de UFVs, Valores de Uso",
            ];
            restore_error_handler();
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function showDepreciation($previousData, $dataArray) {
        try {

            [
                "fechadepreciacion" => $deprDate,
                "iddepreciacion" => $deprId,
                "depreciacionmixto" => $isMix,
                "activosfijosids" => $afIds,
            ] = $dataArray; 

            $queryFAExtra = "";
            $queryCExtra = "";

            $queryRev = $deprId == 3 ? "AND duracionrevaluo IS NOT NULL" : "AND vidautilrevaluo IS NOT NULL";

            $category_id = $this->mySubQuery("id_categoria");
            $querFA=$this->db->query(
                "SELECT *, 
                    (SELECT fecharevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS fecharevaluo, 
                    (SELECT vidautilrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS vidautilrevaluo, 
                    (SELECT valorrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS valorrevaluo, 
                    (SELECT duracionrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id $queryRev AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS duracionrevaluo 
                FROM $this->t_name 
                WHERE categorias_id = $category_id 
                AND $this->col_id IN ($afIds) ORDER BY categorias_id ASC");
            $dataFA = $querFA->fetch_all(MYSQLI_ASSOC);

            $querCategory = $this->db->query("SELECT * FROM categorias WHERE empresa_id = '$this->empresa_id' AND id IN (SELECT categorias_id FROM $this->t_name WHERE $this->col_id IN ($afIds) GROUP BY categorias_id) ORDER BY id ASC");
            $dataCategory = $querCategory->fetch_all(MYSQLI_ASSOC);

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($querFA),
                "date" => $deprDate,
                "data" => $dataFA,
                "dataCategory" => $dataCategory,
            ];
            
            require_once "pdf/depreciationSchedule.php";
            $object = new DepreciationSchedule();

            if ($deprId == 1) {
                $object->ShowStraightLine($this->res, $previousData);
            } else if ($deprId == 2) {
                $object->ShowStraightLine($this->res, $previousData);
            } else if ($deprId == 3) {
                $object->ShowProductionUnits($this->res, $previousData);
            }
            return;

        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "Se requiren valores de UFVs hasta la fecha ". date('d/m/Y', strtotime('-1 year', strtotime($_POST["fechadepreciacion"]))),
            ];
        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function dashboardCategory($last = FALSE) {
        $valid = new Validations($this->t_name);

        $deprDate = date("Y-m-d");
        // $deprDate = date("2024-05-30");
        // $deprDate = date("2024-11-30");

        set_error_handler(function ($err_severity, $err_msg, $err_file, $err_line, array $err_context)
        {
            throw new ErrorException( $err_msg, 0, $err_severity, $err_file, $err_line );
        }, E_WARNING);
        try {

            $queryFAExtra = "AND eliminado_en IS NULL";

            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $category_id = $this->mySubQuery("id_categoria");
            $querFA=$this->db->query(
                "SELECT *, 
                    (SELECT fecharevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS fecharevaluo,
                    (SELECT vidautilrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS vidautilrevaluo, 
                    (SELECT valorrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS valorrevaluo,
                    (SELECT duracionrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id AND fecharevaluo <= '$deprDate' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS duracionrevaluo,
                    $typeestate_name 
                FROM $this->t_name 
                WHERE categorias_id = $category_id 
                    AND fechacompra <= '$deprDate' 
                    AND tipoinventario_id = (SELECT id FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id AND tipo = 1)
                    $queryFAExtra ORDER BY categorias_id ASC"
            );
            $dataFA = $querFA->fetch_all(MYSQLI_ASSOC);

            $querCategory = $this->db->query(
                "SELECT * 
                FROM categorias 
                WHERE empresa_id = '$this->empresa_id' 
                    AND id IN (
                        SELECT categorias_id 
                        FROM $this->t_name
                        WHERE tipoinventario_id = (SELECT id FROM tipoinventario WHERE id = $this->t_name.tipoinventario_id AND tipo = 1)
                            $queryFAExtra GROUP BY categorias_id
                    ) ORDER BY id ASC"
            );
            $dataCategory = $querCategory->fetch_all(MYSQLI_ASSOC);

            // $querUfv=$this->db->query("SELECT * FROM valoresufv WHERE fecha <= '$deprDate'");
            // $dataUfv =  $querUfv->fetch_all(MYSQLI_ASSOC);
            // $arrUfv = [];
            // foreach ($dataUfv as $key => $value) {
            //     $arrUfv[$value["fecha"]] = $value["valor"];
            // }

            require_once "../db/af_env.php";
            $url = $AF_ENV["apiUrl"] ."/app/ct/api/listatipodecambio/$this->empresa_id";
            // $url = "https://yofinanciero.com/app/ct/api/listatipodecambio/$this->empresa_id";
            // Obtenemos los datos de la API
            $data = file_get_contents($url);
            $dataUfv = json_decode($data, true);

            $arrUfv = [];
            foreach ($dataUfv as $key => $value) {
                $arrUfv[$value["fecha"]] = $value["ufv"];
            }

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($querFA),
                "date" => $deprDate,
                "data" => $dataFA,
                "dataCategory" => $dataCategory,
                "dataUfv" => $arrUfv,
            ];
            
            require_once "pdf/depreciationSchedule.php";
            $object = new DepreciationSchedule();

            $result = $object->StraightLineChart($this->res);
            echo json_encode($result, http_response_code(200));
            return;

        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "Se requiren valores de UFVs hasta la fecha ". date('d/m/Y', strtotime('-1 year', strtotime($_POST["fechadepreciacion"]))),
            ];
            restore_error_handler();

        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function dashboardPrice() {

        $year = date("Y");

        set_error_handler(function ($err_severity, $err_msg, $err_file, $err_line, array $err_context)
        {
            throw new ErrorException( $err_msg, 0, $err_severity, $err_file, $err_line );
        }, E_WARNING);
        try {
            $category_id = $this->mySubQuery("id_categoria");

            $querFA=$this->db->query("SELECT categorias_id, precio, (SELECT valorrevaluo FROM revaluo WHERE activosfijos_id = $this->t_name.id AND YEAR(fecharevaluo) = '$year' ORDER BY fecharevaluo DESC LIMIT 0, 1) AS valorrevaluo FROM $this->t_name WHERE categorias_id = $category_id AND YEAR(fechacompra) = '$year' ORDER BY categorias_id ASC");
            
            $dataFA = $querFA->fetch_all(MYSQLI_ASSOC);

            $querCategory = $this->db->query("SELECT * FROM categorias WHERE empresa_id = '$this->empresa_id' AND id IN (SELECT categorias_id FROM $this->t_name GROUP BY categorias_id) ORDER BY id ASC");
            $dataCategory = $querCategory->fetch_all(MYSQLI_ASSOC);

            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($querFA),
                "data" => $dataFA,
                "dataCategory" => $dataCategory,
            ];
            
            require_once "pdf/depreciationSchedule.php";
            $object = new DepreciationSchedule();

            $result = $object->BarChart($this->res);
            echo json_encode($result, http_response_code(200));
            return;

        } catch (Throwable $th) {
            $this->res = [
                "status" => 500,
                "message" => "Se requiren valores de UFVs hasta la fecha ". date('d/m/Y', strtotime('-1 year', strtotime($_POST["fechadepreciacion"]))),
            ];
            restore_error_handler();

        }
        echo json_encode($this->res, http_response_code($this->res["status"]));
    }

    public function getAllInsuranceID($insurance_id){

        try {
            $situationtype_type = $this->mySubQuery("tipo_tiposituacion");
            $category_id = $this->mySubQuery("id_categoria");
            $category_name = $this->mySubQuery("nombre_categoria");
            $typeestate_name = $this->mySubQuery("nombre_tipobien");
            $history_code = $this->mySubQuery("codigo_historial");
            $insurance_policy = $this->mySubQuery("poliza_tiposeguro");

            $consulta = $this->db->query("SELECT *, $situationtype_type, $category_name, $typeestate_name, $history_code, $insurance_policy FROM $this->t_name  WHERE categorias_id = $category_id AND seguros_id = $insurance_id ORDER BY nombre");
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
    
    public function filters($pdf=FALSE, $movements=FALSE, $with_inv = FALSE) {

        try {
            $eti_query = "";
            if ($this->tipo_inv_id AND $with_inv) {
                $eti_query = "AND af.tipoinventario_id = $this->tipo_inv_id";
            }

            $quer = "";
            $types = "";
            $bp_value = [];
            if (isset($_POST["fecha_inicio"]) && trim($_POST["fecha_inicio"])) {
                $types.="s";
                array_push($bp_value, $_POST["fecha_inicio"]);
                $quer .= " AND af.fechacompra >= ?";
            }
            if (isset($_POST["fecha_fin"]) && trim($_POST["fecha_fin"])) {
                $types.="s";
                array_push($bp_value, $_POST["fecha_fin"]);
                $quer .= " AND af.fechacompra <= ?";
            }
            if (isset($_POST["categoria_id"]) && trim($_POST["categoria_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["categoria_id"]);
                $quer .= " AND af.categorias_id = ?";
            }
            if (isset($_POST["tipobien_id"]) && trim($_POST["tipobien_id"])) {
                $types.="s";
                array_push($bp_value, $_POST["tipobien_id"]);
                $quer .= " AND af.tipobien_id = ?";
            }
            if(isset($_POST["sucursal_id"]) && trim($_POST["sucursal_id"])){
                $types.="s";
                array_push($bp_value, $_POST["sucursal_id"]);
                $quer .= " AND ai.sucursal_id = ?";;
            }
            if(isset($_POST["areatrabajo_id"]) && trim($_POST["areatrabajo_id"])){
                $types.="s";
                array_push($bp_value, $_POST["areatrabajo_id"]);
                $quer .= " AND ai.departamento_id = ?";
            }
            if(isset($_POST["responsable_id"]) && trim($_POST["responsable_id"])){
                $types.="s";
                array_push($bp_value, $_POST["responsable_id"]);
                $quer .= " AND ai.trabajador_id = ?";
            }
            if(isset($_POST["estado_id"]) && trim($_POST["estado_id"])){
                if ($_POST["estado_id"] == 2) {
                    $quer .= " AND ai.activosfijos_id NOT IN (SELECT activosfijos_id FROM movimientoactivos GROUP BY activosfijos_id)";
                } else if ($_POST["estado_id"] == 1) {
                    $quer .= " AND ai.activosfijos_id IN (SELECT activosfijos_id FROM movimientoactivos GROUP BY activosfijos_id)";
                }
            }
            if(isset($_POST["estado_movimiento"]) && trim($_POST["estado_movimiento"])){
                if ($_POST["estado_movimiento"] == 2) {
                    $quer .= " AND ai.trabajador_id IS NULL AND ai.sucursal_id IS NULL AND ai.departamento_id IS NULL";
                } else if ($_POST["estado_movimiento"] == 1) {
                    $quer .= " AND ai.trabajador_id IS NOT NULL AND ai.sucursal_id IS NOT NULL AND ai.departamento_id IS NOT NULL";
                }
            }

            $e_orderby = "ORDER BY ai.codigo, c.nombre";
            if ($movements) {
                $e_orderby = "ORDER BY ai.codigo";
            }

            // $consulta = $this->db->prepare("SELECT *, $situationtype_type, $category_name, $typeestate_name, $history_code, $insurance_policy, $typeinsurance_name, $typestate_name FROM $this->t_name  WHERE categorias_id = $category_id $quer  ORDER BY codigo");
            // AND ai.codigo IN (SELECT codigo FROM activosinventarios WHERE inventarios_id = $inventory_id AND tipoestado_id = ? GROUP BY codigo)
            $consulta = $this->db->prepare(
                "SELECT ai.*, 
                    af.nombre, af.detalle, af.precio, af.fechacompra, af.observacion AS afobservacion,
                    c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
                    (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
                    (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro,
                    (
                        SELECT nombre FROM tipoestado WHERE id = (
                        SELECT tipoestado_id 
                        FROM inventarioscantidad 
                        WHERE activosinventarios_id = (
                            SELECT MAX(id) 
                            FROM activosinventarios 
                            WHERE activosfijos_id = af.id
                                AND codigo = ai.codigo
                        )
                        AND cantidad = 1   
                        ORDER BY id DESC LIMIT 0, 1)
                    ) as nombreestado
                FROM activosinventarios ai 
                INNER JOIN $this->t_name af ON activosfijos_id = af.id 
                INNER JOIN categorias c ON af.categorias_id = c.id
                INNER JOIN tipobien tb ON af.tipobien_id = tb.id
                WHERE inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' $quer $eti_query $e_orderby");
            if ($types) {
                $consulta->bind_param($types, ...$bp_value);
            }
            $consulta->execute();
            $req =  $consulta->get_result();

            $query_bo_id = $this->db->query("SELECT sucursal_id FROM activosinventarios WHERE sucursal_id IS NOT NULL AND empresa_id = '$this->empresa_id' GROUP BY sucursal_id");
            $dataBOIds = $query_bo_id->fetch_all(MYSQLI_NUM);
            $query_area_id = $this->db->query("SELECT departamento_id FROM activosinventarios WHERE departamento_id IS NOT NULL AND empresa_id = '$this->empresa_id' GROUP BY departamento_id");
            $dataAreaIds = $query_area_id->fetch_all(MYSQLI_NUM);
            $query_worker_id = $this->db->query("SELECT trabajador_id FROM activosinventarios WHERE trabajador_id IS NOT NULL AND empresa_id = '$this->empresa_id' GROUP BY trabajador_id");
            $dataWorkerIds = $query_worker_id->fetch_all(MYSQLI_NUM);
            

            $bo_ids = implode(", ", array_map(function($item) {
                return $item[0];
            }, $dataBOIds));
            $area_ids = implode(", ", array_map(function($item) {
                return $item[0];
            }, $dataAreaIds));
            $worker_ids = implode(", ", array_map(function($item) {
                return $item[0];
            }, $dataWorkerIds));

            $dataBO = [];
            $dataArea = [];
            $dataWorker = [];
            $data = $this->db->all($req, MYSQLI_ASSOC);
            if ($area_ids || $worker_ids || $bo_ids) {
                $db_rh = new DBConnection("rrhh");
                if ($bo_ids) {
                    $db_em = new DBConnection("empresa");
                    $queryBO = $db_em->query("SELECT idsucursalcontable, nombre FROM sucursalcontable WHERE idsucursalcontable IN ($bo_ids)");
                    while ($row = $queryBO->fetch_assoc()) {
                        $dataBO[$row["idsucursalcontable"]] = $row["nombre"];
                    }
                }
                if ($area_ids) {
                    $queryArea = $db_rh->query("SELECT idareas, nombre FROM areas WHERE idareas IN ($area_ids)");
                    while ($row = $queryArea->fetch_assoc()) {
                        $dataArea[$row["idareas"]] = $row["nombre"];
                    }
                }
                if ($worker_ids) {
                    $queryWorker = $db_rh->query("SELECT idtrabajador, CONCAT(nombre, ' ', apellido) AS nombre FROM trabajador WHERE idtrabajador IN ($worker_ids)");
                    while ($row = $queryWorker->fetch_assoc()) {
                        $dataWorker[$row["idtrabajador"]] = $row["nombre"];
                    }
                }
    
                foreach ($data as $key => $value) {
                    if (isset($dataBO[$value["sucursal_id"]])) {
                        $data[$key]["nombresucursal"] = $dataBO[$value["sucursal_id"]];
                    }
                    if (isset($dataArea[$value["departamento_id"]])) {
                        $data[$key]["nombrearea"] = $dataArea[$value["departamento_id"]];
                    }
                    if (isset($dataWorker[$value["trabajador_id"]])) {
                        $data[$key]["nombretrabajador"] = $dataWorker[$value["trabajador_id"]];
                    }
                }
            }
            
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($req),
                "data" => $data,
            ];
            if (isset($_POST["informacion"]) ) {
                $info = json_decode($_POST["informacion"]);
                $this->res["info"] = $info;
            }
            if ($pdf) {
                require_once "pdf/filesFixedAsset.php";
                $object = new FilesFixedAsset();
                if ($movements) {
                    $object->reportsMovement($this->res);
                } else {
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

    public function getAllFAs(){

        try {
            $eti_query = "";
            if ($this->tipo_inv_id) {
                $eti_query = "AND af.tipoinventario_id = $this->tipo_inv_id";
            }
            $consulta = $this->db->query(
                "SELECT ai.*,
                    af.nombre, af.detalle, af.precio, af.fechacompra, af.observacion AS afobservacion,
                    c.nombre AS nombrecategoria, tb.nombre AS nombretipobien,
                    (SELECT nombre FROM tiposeguro WHERE id = (SELECT tiposeguro_id FROM seguros WHERE id = af.seguros_id )) AS nombretiposeguro,
                    (SELECT poliza FROM seguros WHERE id = af.seguros_id) AS polizaseguro,
                    (
                        SELECT nombre FROM tipoestado WHERE id = (
                        SELECT tipoestado_id 
                        FROM inventarioscantidad 
                        WHERE activosinventarios_id = (
                            SELECT MAX(id) 
                            FROM activosinventarios 
                            WHERE activosfijos_id = af.id
                                AND codigo = ai.codigo
                        )
                        AND cantidad = 1   
                        ORDER BY id DESC LIMIT 0, 1)
                    ) as nombreestado
                FROM activosinventarios ai 
                INNER JOIN $this->t_name af ON activosfijos_id = af.id 
                INNER JOIN categorias c ON af.categorias_id = c.id
                INNER JOIN tipobien tb ON af.tipobien_id = tb.id
                WHERE inventarios_id IS NULL AND ai.cantidad > 0 AND ai.empresa_id = '$this->empresa_id' $eti_query ORDER BY ai.codigo, c.nombre");
             
            $query_area_id = $this->db->query("SELECT departamento_id FROM activosinventarios WHERE departamento_id IS NOT NULL AND empresa_id = '$this->empresa_id' GROUP BY departamento_id");
            $dataAreaIds = $query_area_id->fetch_all(MYSQLI_NUM);
            $query_worker_id = $this->db->query("SELECT trabajador_id FROM activosinventarios WHERE trabajador_id IS NOT NULL AND empresa_id = '$this->empresa_id' GROUP BY trabajador_id");
            $dataWorkerIds = $query_worker_id->fetch_all(MYSQLI_NUM);

            $area_ids = implode(", ", array_map(function($item) {
                return $item[0];
            }, $dataAreaIds));
            $worker_ids = implode(", ", array_map(function($item) {
                return $item[0];
            }, $dataWorkerIds));

            $dataArea = [];
            $dataWorker = [];
            $data = $consulta->fetch_all(MYSQLI_ASSOC);
            if ($area_ids || $worker_ids) {
                $db_rh = new DBConnection("rrhh");
                if ($area_ids) {
                    $queryArea = $db_rh->query("SELECT idareas, nombre FROM areas WHERE idareas IN ($area_ids)");
                    while ($row = $queryArea->fetch_assoc()) {
                        $dataArea[$row["idareas"]] = $row["nombre"];
                    }
                }
                if ($worker_ids) {
                    $queryWorker = $db_rh->query("SELECT idtrabajador, CONCAT(nombre, ' ', apellido) AS nombre FROM trabajador WHERE idtrabajador IN ($worker_ids)");
                    while ($row = $queryWorker->fetch_assoc()) {
                        $dataWorker[$row["idtrabajador"]] = $row["nombre"];
                    }
                }
    
                foreach ($data as $key => $value) {
                    if (isset($dataArea[$value["departamento_id"]])) {
                        $data[$key]["nombrearea"] = $dataArea[$value["departamento_id"]];
                    }
                    if (isset($dataWorker[$value["trabajador_id"]])) {
                        $data[$key]["nombretrabajador"] = $dataWorker[$value["trabajador_id"]];
                    }
                }
            }

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

    public function getFAQtt($fixedAsset, $worker_id = FALSE){

        try {
            $category_id = $this->mySubQuery("id_categoria");

            $queryQuantity = "";
            if ($worker_id === FALSE) {
                $queryQuantity = 
                "SELECT cantidad - 
                    (
                        SELECT IFNULL(SUM(cantidad), 0) 
                        FROM movimientoactivos 
                        WHERE estado = 2 
                            AND activosfijos_id = $this->t_name.id 
                            AND trabajador_id IS NULL 
                            AND movimientos_id IN (SELECT id FROM movimientos WHERE estado IS NULL OR estado = 2 OR estado = 11)
                    ) - (
                        SELECT IFNULL(SUM(cantidad), 0) 
                        FROM movimientoactivos 
                        WHERE estado = 1 
                            AND activosfijos_id = $this->t_name.id 
                            AND nombre IS NOT NULL 
                            AND trabajador_id IS NULL 
                            AND movimientos_id IN (SELECT id FROM movimientos WHERE estado = 2)
                    ) 
                FROM activosinventarios 
                WHERE (activosfijos_id, id) = (
                    SELECT activosfijos_id, MIN(id) 
                    FROM activosinventarios 
                    WHERE activosfijos_id = $this->t_name.id 
                    GROUP BY activosfijos_id
                )";
            } else {
                $queryQuantity = 
                "SELECT IFNULL
                ((
                    SELECT cantidad 
                    FROM activosinventarios
                    WHERE activosfijos_id = $this->t_name.id AND trabajador_id = '$worker_id'
                ), cantidad) - (
                    SELECT IFNULL(SUM(cantidad), 0) 
                    FROM movimientoactivos 
                    WHERE estado = 2 
                        AND activosfijos_id = $this->t_name.id 
                        AND (
                            movimientos_id IN (
                                SELECT id 
                                FROM movimientos 
                                WHERE trabajador_id = '$worker_id' AND (estado = 5 OR estado = 8)
                            ) OR trabajador_id = '$worker_id'
                        )
                )";
            }

            $consulta=$this->db->prepare(
                "SELECT *, 
                    ($queryQuantity) AS cantidadactual 
                FROM $this->t_name WHERE $this->col_id = ? AND categorias_id = $category_id");
            $consulta->bind_param("s", $fixedAsset);
            $consulta->execute();
            $req =  $consulta->get_result();

            $data = $this->db->assoc($req);
            return $data;
        } catch (Throwable $th) {
            return FALSE;
        }
    }

    public function getStatesInv($fa_id){    
        try {
            $query_ai_id = $this->db->query(
                "SELECT *, 
                    (
                        SELECT a_i.id 
                        FROM activosinventarios a_i 
                        WHERE a_i.id = (
                                SELECT MAX(ai.id) 
                                FROM activosinventarios ai 
                                WHERE ai.codigo = activosinventarios.codigo)
                            ) AS id_ai
                FROM activosinventarios 
                WHERE activosfijos_id = '$fa_id' 
                    AND cantidad > 0 ORDER BY cantidad DESC"
            );
            $data = $query_ai_id->fetch_all(MYSQLI_ASSOC);

            foreach ($data as $key => $value) {
                $ai_id = $value["id_ai"];
                // echo '<pre>'. print_r($ai_id, true) .'</pre>';
                $query_ic = $this->db->query(
                        "SELECT i_c.*, 
                            (SELECT nombre FROM tipoestado WHERE id = i_c.tipoestado_id) AS nombreestado
                        FROM inventarioscantidad i_c
                        LEFT JOIN observacionesainventarios oa_i ON oa_i.id = i_c.observacionesainventarios_id
                        WHERE i_c.activosinventarios_id = '$ai_id' AND (oa_i.estado < 5 OR i_c.observacionesainventarios_id IS NULL)"
                );

                $dataIc = $query_ic->fetch_all(MYSQLI_ASSOC);
                if ($dataIc) {
                    $data[$key]["array_cantidad"] = $dataIc;
                }
                // echo '<pre>'. print_r($dataIc, true) .'</pre>';

            }
            
            $this->res = [
                "status" => 200,
                "rows" => $this->db->rows($query_ai_id),
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