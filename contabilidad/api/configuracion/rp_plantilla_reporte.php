<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php";

class PlantillaReporte extends DB{

    private function get_id_empresa($md5)
    {
        $registro = $this->dbe->query("SELECT * FROM organizacion WHERE md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

    private function get_id_gestion($empresa_md5){
        $registro=$this->dbc->query("SELECT * FROM gestion WHERE md5(idempresa)='$empresa_md5' and estado='2'");
        $qwe=$this->dbc->fetch($registro);
        return $qwe['idgestion'];
    }


    // FUNCONES PARA TIPOS DE REPORTES
    // ----------------------------------------------------------------
    public function listar_reporte($id_empresa) {
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM pr_plantilla_reporte WHERE md5(idempresa)='$id_empresa'");
    
        while ($row = $this->dbc->fetch($registro)) {
            $lista[] = [
                "idplantilla_reporte" => $row['idplantilla_reporte'],
                "nombre"=>$row['nombre'],
                "descripcion" => $row['descripcion'],
                "tipo_reporte" => $row['tipo_reporte'],
            ];
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }

    public function registrar_reporte($nombre, $descripcion, $tipo_reporte, $empresa) {
        $idempresa = $this->get_id_empresa($empresa);

        // Insertar el nuevo registro
        $registro = $this->dbc->query("INSERT INTO pr_plantilla_reporte(nombre, descripcion, tipo_reporte, idempresa) VALUES ('$nombre', '$descripcion', '$tipo_reporte', '$idempresa')");
        if ($registro === TRUE) {                                                                                                                                                                
            $res = array("success", "Registro exitoso","rp_registrar_reporte");
        } else {
            $res = array("danger", "No se pudo registrar", $nombre);
        }
        echo json_encode($res);
    }
    
    public function editar_reporte($idplantilla_reporte, $nombre, $descripcion, $tipo_reporte) {
        $editar = $this->dbc->query(
            "UPDATE pr_plantilla_reporte 
                SET nombre='$nombre', descripcion='$descripcion', tipo_reporte='$tipo_reporte' 
            WHERE idplantilla_reporte = '$idplantilla_reporte'"
        );
        if ($editar === TRUE) {
            $res = array("success", "se edito exitosamente","rp_editar_reporte");
        } else {
            $res = array("danger", "No se pudo editar");
        }
        echo json_encode($res);
    }

    public function eliminar_reporte($idplantilla_reporte) {

        $eliminar = $this->dbc->query("DELETE FROM pr_plantilla_reporte WHERE idplantilla_reporte = '$idplantilla_reporte'");
        if ($eliminar === TRUE) {                                                                                                                                                    
            $res = array("success", "se elimino exitosamente","rp_eliminar_reporte");
        } else {
            $res = array("danger", "No se pudo eliminar");
        }
        echo json_encode($res);
    }
    


    // FUNCIONES PARA PLANTILLAS
    // ----------------------------------------------------------------
    private function obtener_nodos($idpadre, $idreporte, $idempresa)
    {
        $filtro_padre = is_null($idpadre) ? "p.idplantilla_padre IS NULL" : "p.idplantilla_padre = $idpadre";

        $sql = "SELECT p.idplantilla, p.idplantilla_padre, p.idplandecuenta, p.nombre_personalizado, p.tipo_operacion, p.nivel, p.orden, p.disponible_para_otro_reporte, pc.nombreplan,pc.numero
            FROM pr_plantilla p
            LEFT JOIN plandecuenta pc ON pc.idplandecuenta = p.idplandecuenta
            WHERE p.idplantilla_reporte = $idreporte
                AND $filtro_padre
                AND p.idempresa = $idempresa
                ORDER BY p.orden ASC";

        $res = $this->dbc->query($sql);
        $nodos = [];

        while ($row = $this->dbc->fetch($res)) {
            $nodo = [
                "idplantilla" => $row['idplantilla'],
                "tipo_operacion" => $row['tipo_operacion'],
                "idplantilla_padre" => $row['idplantilla_padre'],
                "nivel" => $row['nivel'],
                "orden" => $row['orden'],
                "disponible_para_otro_reporte" => $row['disponible_para_otro_reporte'],
                "hijos" => $this->obtener_nodos($row['idplantilla'], $idreporte, $idempresa)
            ];
            if ($row['idplandecuenta'] !== null) {
                $nodo['idplandecuenta'] = $row['idplandecuenta'];
                $nodo['nombreplan'] = $row['nombreplan'];
                $nodo['codigo'] = $row['numero'];
            } else {
                $nodo['nombre_personalizado'] =  $row['nombre_personalizado'];
            }

            $nodos[] = $nodo;
        }

        return $nodos;
    }

    public function listar_plantilla($idplantilla_reporte, $idempresa)
    {
        $idempresa = $this->get_id_empresa($idempresa);
        $idreporte = (int) $idplantilla_reporte;

        $estructura = $this->obtener_nodos(null, $idreporte, $idempresa);
        echo json_encode($estructura, JSON_NUMERIC_CHECK);
    }

    public function listar_plantilla_normal($idplantilla_reporte, $idempresa)
    {
        $idempresa = $this->get_id_empresa($idempresa);
        $idreporte = (int) $idplantilla_reporte;

        $sql = "SELECT p.idplantilla, p.idplandecuenta, p.nombre_personalizado, pc.nombreplan
            FROM pr_plantilla p
            LEFT JOIN plandecuenta pc ON pc.idplandecuenta = p.idplandecuenta
            WHERE p.idplantilla_reporte = $idreporte
                AND p.idempresa = $idempresa
            ORDER BY p.nivel ASC, p.orden ASC";

        $res = $this->dbc->query($sql);
        $lista = [];

        while ($row = $this->dbc->fetch($res)) {
            $lista[] = [
                "idplantilla" => $row['idplantilla'],
                "idplandecuenta" => $row['idplandecuenta'],
                "nombre" => $row['nombre_personalizado'] ? $row['nombre_personalizado'] : $row['nombreplan'],
            ];
        }

        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_plantilla($idplantilla_reporte, $idplantilla_padre, $idplandecuenta, $nombre_personalizado, $tipo_operacion, $nivel, $orden, $disponible_para_otro_reporte, $idempresa)
    {
        $id_empresa = $this->get_id_empresa($idempresa);

        $v1 = (int) $idplantilla_reporte;
        $v2 = $idplantilla_padre !== '' ? (int) $idplantilla_padre : null;
        $v3 = $idplandecuenta ? (int) $idplandecuenta : null;
        $v4 = trim($nombre_personalizado) !== '' ? trim($nombre_personalizado) : null;
        $v5 = $tipo_operacion;
        $v6 = (int) $nivel;
        $v7 = $orden ? (int) $orden : NULL;
        $v8 = $disponible_para_otro_reporte ? 'si' : 'no';
        $v9 = (int) $id_empresa;

        // Insertar nuevo registro
        $stmt_insert = $this->dbc->prepare("INSERT INTO pr_plantilla (idplantilla_reporte, idplantilla_padre, idplandecuenta, nombre_personalizado, tipo_operacion, nivel, orden, disponible_para_otro_reporte, idempresa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt_insert->bind_param("iiissiisi", $v1, $v2, $v3, $v4, $v5, $v6, $v7, $v8, $v9);
        if (!$stmt_insert->execute()) {
            echo json_encode(["danger", "Error al registrar"]);
            return;
        }
        $stmt_insert->close();

        // Reordenar eliminando huecos
        $this->dbc->query("SET @rownum := 0");
        $filtro_padre = $v2 === null ? "idplantilla_padre IS NULL" : "idplantilla_padre = $v2";
        $query_reordenar = "UPDATE pr_plantilla p
            JOIN (
                SELECT idplantilla, (@rownum := @rownum + 1) AS nuevo_orden
                FROM pr_plantilla
                WHERE idplantilla_reporte = $v1
                AND $filtro_padre
                AND nivel = $v6
                AND idempresa = $v9
                ORDER BY ISNULL(orden), orden ASC, idplantilla DESC
            ) AS ordenado
            ON p.idplantilla = ordenado.idplantilla
            SET p.orden = ordenado.nuevo_orden";

        if (!$this->dbc->query($query_reordenar)) {
            echo json_encode(["danger", "Error al reordenar"]);
            return;
        }

        echo json_encode(["success", "Registro y reordenamiento exitoso", "rp_registrar_plantilla"]);
    }

    public function editar_plantilla($idplantilla, $idplandecuenta, $nombre_personalizado, $tipo_operacion, $orden, $idplantilla_padre, $nivel, $disponible_para_otro_reporte, $idempresa)
    {
        $id_empresa = $this->get_id_empresa($idempresa);

        $disponible =  $disponible_para_otro_reporte ? 'si' : 'no';

        // Actualizar el registro
        $stmt_update = $this->dbc->prepare("UPDATE pr_plantilla SET idplandecuenta = ?, nombre_personalizado = ?, tipo_operacion = ?, orden = ?, disponible_para_otro_reporte = ? WHERE idplantilla = ? AND idempresa = ?");
        $stmt_update->bind_param("issisii", $idplandecuenta, $nombre_personalizado, $tipo_operacion, $orden, $disponible, $idplantilla, $id_empresa);
        if (!$stmt_update->execute()) {
            echo json_encode(["danger", "Error al editar"]);
            return;
        }
        $stmt_update->close();

        // Reordenar eliminando huecos
        $this->dbc->query("SET @rownum := 0");
        $filtro_padre = $idplantilla_padre ? "idplantilla_padre = $idplantilla_padre": "idplantilla_padre IS NULL";
        $stmt_reordenar = $this->dbc->prepare(
            "UPDATE pr_plantilla p
            JOIN (
                SELECT idplantilla, (@rownum := @rownum + 1) AS nuevo_orden
                FROM pr_plantilla
                WHERE idplantilla_reporte = (SELECT idplantilla_reporte FROM pr_plantilla WHERE idplantilla = ?)
                AND $filtro_padre
                AND nivel = ?
                AND idempresa = ?
                ORDER BY orden ASC, idplantilla DESC
            ) AS ordenado
            ON p.idplantilla = ordenado.idplantilla
            SET p.orden = ordenado.nuevo_orden"
        );
        $stmt_reordenar->bind_param("iii", $idplantilla, $nivel, $id_empresa);
        if (!$stmt_reordenar->execute()) {
            echo json_encode(["warning", "Error al reordenar"]);
            return;
        }

        echo json_encode(["success", "Edición y reordenamiento exitoso", "rp_editar_plantilla"]);
    }

    public function editar_plantilla_completo($idplantilla, $idplandecuenta, $nombre_personalizado, $tipo_operacion, $orden, $idplantilla_padre, $nivel, $disponible_para_otro_reporte, $empresa) {
        $idempresa = $this->get_id_empresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM pr_plantilla WHERE idplantilla_padre = '$idplantilla'");
        $resultado = $consulta->fetch_assoc();
        $existe_plantilla = $resultado['total'];


        $consulta2 = $this->dbc->query("SELECT COUNT(*) AS total FROM agrupacion_plantilla WHERE idplantilla_padre = '$idplantilla'");
        $resultado2 = $consulta2->fetch_assoc();
        $existe_agrupacion = $resultado2['total'];

        if()//tipo operacion es diferente de lo q ya existe en la base de datos  entonces ir abajo
        if ($existe_plantilla > 0 || $existe_agrupacion > 0) { // EL REGISTRO TIENE DEPENDENCIAS
            $res = array("danger", "El registro no puede editarse","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE divisa
                                    SET simbolo = '$simbolo',
                                    nombre = '$nombre'
                                    WHERE iddivisa = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar",$id,$nombre,$empresa);
            }
        }
        echo json_encode($res);
    }
    public function eliminar_plantilla($idplantilla, $idplantilla_padre, $nivel, $idplantilla_reporte, $idempresa)
    {
        $id_empresa = $this->get_id_empresa($idempresa);

        // Eliminar el registro
        $stmt_delete = $this->dbc->prepare("DELETE FROM pr_plantilla WHERE idplantilla = ? AND idempresa = ?");
        $stmt_delete->bind_param("ii", $idplantilla, $id_empresa);
        if (!$stmt_delete->execute()) {
            echo json_encode(["danger", "Error al eliminar"]);
            return;
        }
        $stmt_delete->close();

        // Reordenar eliminando huecos
        $this->dbc->query("SET @rownum := 0");
        $filtro_padre = (int)$idplantilla_padre > 0 ? "idplantilla_padre = $idplantilla_padre": "idplantilla_padre IS NULL";
        $stmt_reordenar = $this->dbc->prepare(
            "UPDATE pr_plantilla p
            JOIN (
                SELECT idplantilla, (@rownum := @rownum + 1) AS nuevo_orden
                FROM pr_plantilla
                WHERE idplantilla_reporte = ?
                AND $filtro_padre
                AND nivel = ?
                AND idempresa = ?
                ORDER BY ISNULL(orden), orden ASC, idplantilla DESC
            ) AS ordenado
            ON p.idplantilla = ordenado.idplantilla
            SET p.orden = ordenado.nuevo_orden"
        );
        $stmt_reordenar->bind_param("iii", $idplantilla_reporte, $nivel, $id_empresa);
        if (!$stmt_reordenar->execute()) {
            echo json_encode(["warning", "Error al reordenar"]);
            return;
        }

        echo json_encode(["success", "Eliminación y reordenamiento exitoso", "rp_eliminar_plantilla"]);
    }

    public function filtro_plantilla_por_nivel($idplantilla_reporte, $nivel, $idempresa)
    {
        $id_empresa = $this->get_id_empresa($idempresa);
        $lista = [];

        if ($nivel > 0) {
            $sql = "SELECT p.idplantilla , COALESCE(pc.nombreplan, p.nombre_personalizado) AS nombre
                FROM pr_plantilla p
                LEFT JOIN plandecuenta pc ON pc.idplandecuenta = p.idplandecuenta
                WHERE p.idplantilla_reporte = '$idplantilla_reporte'
                    AND p.nivel = '$nivel'
                    AND p.idempresa = '$id_empresa'
                    ORDER BY p.nivel, p.orden ";

            $getPedido = $this->dbc->query($sql);
            while ($row = $this->dbc->fetch($getPedido)) {
                $lista[] = [
                    "idplantilla" => $row['idplantilla'],
                    "nombre" => $row['nombre']
                ];
            }
        }

        echo json_encode($lista);
    }

    // FUNCIONES PARA GENERAR REPORTES
    // ----------------------------------------------------------------
    private function obtenerSaldoCuenta($idcuenta, $idempresa, $idgestion, $fecha_ini, $fecha_fin)
    {
        $stmt = $this->dbc->prepare(
            "SELECT 
                SUM(dt.debe) AS deb,
                SUM(dt.haber) AS hab,
                SUM(dt.debe) - SUM(dt.haber) AS total
            FROM transacciones t
            INNER JOIN detalletransaccion dt ON dt.transacciones_idtransacciones = t.idtransacciones
            INNER JOIN plandecuenta p ON p.idplandecuenta = dt.idplandecuenta
            WHERE 
                t.organizacion_idorganizacion = ? AND 
                t.idgestion = ? AND 
                p.idplandecuenta = ? AND 
                t.estado NOT IN (4, 5, 6) AND 
                t.fechatransaccion BETWEEN ? AND ?"
        );
        $stmt->bind_param("iiiss", $idempresa, $idgestion, $idcuenta, $fecha_ini, $fecha_fin);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['total'] ?? 0;
    }

    private function construirSubarbol(&$porPadre, $idpadre, $idempresa, $idgestion, $fecha_ini, $fecha_fin)
    {
        $resultado = [];

        if (!isset($porPadre[$idpadre])) {
            return [];
        }

        foreach ($porPadre[$idpadre] as $nodo) {
            $id = $nodo['idplantilla'];
            $tipo = $nodo['tipo_operacion'];
            $idcuenta = $nodo['idplandecuenta'];

            $children = $this->construirSubarbol($porPadre, $id, $idempresa, $idgestion, $fecha_ini, $fecha_fin);

            // Calcular valor base
            $valor = 0;
            $detalle_operacion = null;

            switch ($tipo) {
                case 'calculable':
                    $valor = $this->obtenerSaldoCuenta($idcuenta, $idempresa, $idgestion, $fecha_ini, $fecha_fin);
                    break;

                case 'calculable_y_operacion':
                    $valor_base = $this->obtenerSaldoCuenta($idcuenta, $idempresa, $idgestion, $fecha_ini, $fecha_fin);
                    $valor_operacion = $this->procesarCuentasAsociadas($id, $idempresa, $idgestion, $fecha_ini, $fecha_fin);
                    $valor = $valor_base;
                    $detalle_operacion = $valor_operacion;
                    break;

                case 'otra_operacion':
                    $valor_operacion = $this->procesarCuentasAsociadas($id, $idempresa, $idgestion, $fecha_ini, $fecha_fin);
                    $valor = $valor_operacion;
                    break;

                case 'total_suma':
                    foreach ($children as $child) {
                        $valor += $child['valor'];
                    }
                    break;

                case 'total_resta':
                    foreach ($children as $child) {
                        $valor -= $child['valor'];
                    }
                    break;

                case 'sin_operacion':
                    $valor = 0;
                    break;
            }

            $resultado[] = [
                'idplantilla' => $id,
                'nombre' => $nodo['nombre_personalizado'],
                'nivel' => $nodo['nivel'],
                'tipo_operacion' => $tipo,
                'valor' => $valor,
                'detalle_operacion' => $detalle_operacion,
                'children' => $children
            ];
        }

        return $resultado;
    }

    private function procesarCuentasAsociadas($idplantilla, $idempresa, $idgestion, $fecha_ini, $fecha_fin)
    {
        $stmt = $this->dbc->prepare("
            SELECT * FROM pr_cuenta_asociada
            WHERE idplantilla = ?
        ");
        $stmt->bind_param("i", $idplantilla);
        $stmt->execute();
        $asociadas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        $total = 0;

        foreach ($asociadas as $a) {
            $parcial = 0;

            if ($a['idplantilla']) {
                $valor_plantilla = $this->obtenerValorPlantilla($a['idplantilla'], $idempresa, $idgestion, $fecha_ini, $fecha_fin);
                $parcial = $valor_plantilla;
            } elseif ($a['idplandecuenta']) {
                $parcial = $this->obtenerSaldoCuenta($a['idplandecuenta'], $idempresa, $idgestion, $fecha_ini, $fecha_fin);
            }

            switch ($a['tipo_operacion']) {
                case 'suma':
                    $total += $parcial;
                    break;
                case 'resta':
                    $total -= $parcial;
                    break;
                case 'porcentaje':
                    $total += ($parcial * ($a['monto'] / 100));
                    break;
            }
        }

        return $total;
    }

    private function obtenerValorPlantilla($idplantilla, $idempresa, $idgestion, $fecha_ini, $fecha_fin)
    {
        // Puedes cachear si quieres optimizar
        $stmt = $this->dbc->prepare("SELECT tipo_operacion, idplandecuenta FROM pr_plantilla WHERE idplantilla = ?");
        $stmt->bind_param("i", $idplantilla);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) return 0;

        switch ($row['tipo_operacion']) {
            case 'calculable':
            case 'calculable_y_operacion':
                return $this->obtenerSaldoCuenta($row['idplandecuenta'], $idempresa, $idgestion, $fecha_ini, $fecha_fin);
            case 'sin_operacion':
                return 0;
            default:
                // Opcional: podrías procesar hijos también si quieres profundidad
                return 0;
        }
    }

    public function obtener_datos_reporte($fecha_ini, $fecha_fin, $idplantilla_reporte, $idempresa)
    {
        $id_empresa = $this->get_id_empresa($idempresa);
        $id_gestion = $this->get_id_gestion($idempresa);
        // Paso 1: obtener todos los registros de pr_plantilla en una sola consulta
        $stmt = $this->dbc->prepare(
            "SELECT * FROM pr_plantilla 
            WHERE idplantilla_reporte = ? AND idempresa = ?
            ORDER BY nivel, orden"
        );
        $stmt->bind_param("ii", $idplantilla_reporte, $id_empresa);
        $stmt->execute();
        $plantillas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // Paso 2: indexar por idplantilla_padre para construir el árbol
        $porPadre = [];
        foreach ($plantillas as $p) {
            $padre = $p['idplantilla_padre'] ?? 0;
            $porPadre[$padre][] = $p;
        }

        // Paso 3: construir árbol recursivamente
        $arbol = $this->construirSubarbol($porPadre, 0, $id_empresa, $id_gestion, $fecha_ini, $fecha_fin);
        // return $arbol;
        echo json_encode($arbol, JSON_NUMERIC_CHECK);
    }
    public function registrar_agrupacion_plantilla($idplantilla_padre, $idplantilla_hijo, $tipo_operacion,$monto,$empresa) {
        $idempresa = $this->get_id_empresa($empresa);

        // Insertar el nuevo registro
        $registro = $this->dbc->query("INSERT INTO agrupacion_plantilla(idplantilla_padre, idplantilla_hijo, tipo_operacion,monto, idempresa) VALUES ('$idplantilla_padre', '$idplantilla_hijo', '$tipo_operacion','$monto', '$idempresa')");
        if ($registro === TRUE) {                                                                                                                                                                
            $res = array("success", "Registro exitoso","rp_registrar_reporte");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }
    public function listar_agrupacion_plantilla($id_plantilla_padre) {
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM agrupacion_plantilla WHERE idplantilla_padre='$id_plantilla_padre'");
    
        while ($row = $this->dbc->fetch($registro)) {

        $consul = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla='$row[idplantilla_hijo]'");
        $pr_plant = $consul->fetch_assoc();
        if(empty($pr_plant['idplandecuenta'])){//plan de cuenta esta vacio
            $nombre_hijo = $pr_plant['nombre_personalizado'];
        }else{//plan de cuenta NO esta vacio
            $plan_cuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta='$pr_plant[idplandecuenta]'");
            $pl_c = $plan_cuenta->fetch_assoc();
            $nombre_hijo = $pl_c['nombreplan'];
        }

            $lista[] = [
                "idagrupacion_plantilla" => $row['idagrupacion_plantilla'],
                "idplantilla_padre"=>$row['idplantilla_padre'],
                "idplantilla_hijo" => $row['idplantilla_hijo'],
                "tipo_operacion" => $row['tipo_operacion'],
                "nombre" => $nombre_hijo,
                "monto" => $row['monto']
            ];
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }

    public function reporte_estado_resultados($fecha_ini,$fecha_fin,$empresa) {
           ini_set('display_errors', 1); //$fecha_ini,$fecha_fin,
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $lista = [];
        $idempresa = $this->get_id_empresa($empresa);
        // $gestion = $this->getidgestion($empresa);
$gestion = $this->get_id_gestion($empresa);
        $lista =[];
        // $plantilla_lista = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '1' 
        // AND idempresa = '$idempresa' AND tipo_operacion != 'calculable' ORDER BY orden ASC");// PLANTILLAS PRINCIPALES

        $get_nivel_2 = $this->dbc->query("SELECT DISTINCT(idplantilla_padre) FROM agrupacion_plantilla WHERE idempresa = '$idempresa'");// PLANTILLAS AGRUPADORAS
        $total_pasivo_patrimonio = 0;
        while ($pl1 = $this->dbc->fetch($get_nivel_2)) {

            $pl_padre = $this->dbc->query("SELECT * from agrupacion_plantilla where idplantilla_padre = '$pl1[idplantilla_padre]'");// HIJOS DE LAS PLANTILLAS AGRUPADORAS
        while ($pl2 = $this->dbc->fetch($pl_padre)) {
        
            $pr_consu2 = $this->dbc->query("SELECT * from pr_plantilla where idplantilla = '$pl2[idplantilla_hijo]' AND idempresa = '$idempresa'");// VENTAS->NOMBRE
            $pr_indi2 = $pr_consu2->fetch_assoc();

            $pla_cuen = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$pr_indi2[idplandecuenta]'");// VENTAS->NOMBRE
            $nombre_cuen = $pla_cuen->fetch_assoc();
            if($pr_indi2['nombre_personalizado'] == NULL){
                $nombre_cuenta = $nombre_cuen['nombreplan'];
            }else{
                $nombre_cuenta = $pr_indi2['nombre_personalizado'];
            }
            $res = array(
                    // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                    "idplantilla_hijo" => $pl2['idplantilla_hijo'],
                    "nombre_personalizado" => $nombre_cuenta,
                    // "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
             $pr_consu = $this->dbc->query("SELECT * from pr_plantilla where idplantilla_padre = '$pl2[idplantilla_hijo]' AND idempresa = '$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
            // $pr_indi = $pr_consu->fetch_assoc();
            $suma_nivel_2 = 0;
            if($pl2['monto'] == 0){
                while ($pl3 = $this->dbc->fetch($pr_consu)) { //CALCULABLES

                $plan_cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$pl3[idplandecuenta]'");// caja_general, banco
                $nombre_cuenta = $plan_cuenta->fetch_assoc();

                $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$pl3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                $valor2 = $suma_cuentas2->fetch_assoc();
                $suma_nivel_2 = $suma_nivel_2 + $valor2['total'];
                
            $res2 = array(
                    // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "nombre_cuenta" => $nombre_cuenta['nombreplan'],
                    // "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "valor" => $valor2['total'],
                    // "nivel_3" => [] //activo
                    );
               array_push($res['nivel_2'], $res2);     
            }
            $res['suma_nivel_2'] = $suma_nivel_2;
            }else{
                $suma_nivel_2 = $pl2['monto'];
                $res['suma_nivel_2'] = $suma_nivel_2;
            }
            if($pl2['tipo_operacion'] == 'sumar'){
                //SE SUMARA
            }else{
                //SE RESTARA
            }
            
            array_push($lista, $res);
        }

          
        //    array_push($lista, $res2); 
        }     
        // array_push($lista, $res2);
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function reporte_estado_resultados_actualizado($fecha_ini,$fecha_fin,$empresa) {
           ini_set('display_errors', 1); //$fecha_ini,$fecha_fin,
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $lista = [];
        $idempresa = $this->get_id_empresa($empresa);
        // $gestion = $this->getidgestion($empresa);
$gestion = $this->get_id_gestion($empresa);
        $lista_aux_buscador = [];
        $lista =[];
        $tipo_report = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idempresa = '$idempresa' AND tipo_reporte = 'estado_resultado'");
        $id_pl_reporte = $tipo_report->fetch_assoc();

        $plantilla_lista = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$id_pl_reporte[idtipo_reportes]' 
        AND idempresa = '$idempresa' AND tipo_operacion != 'calculable' ORDER BY orden ASC");// PLANTILLAS PRINCIPALES
       
       while ($pl_list = $this->dbc->fetch($plantilla_lista)) {
            if($pl_list['nombre_personalizado'] == NULL){
                $pla_cuen = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$pl_list[idplandecuenta]'");// VENTAS->NOMBRE
                $nombre_cuen = $pla_cuen->fetch_assoc();
                $nombre_cuenta = $nombre_cuen['nombreplan'];
            }else{
                $nombre_cuenta = $pl_list['nombre_personalizado'];
            }
            $res = array(
                    // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                    "idplantilla" => $pl_list['idplantilla'],
                    "nombre_personalizado" => $nombre_cuenta,
                    "tipo_operacion" => $pl_list['tipo_operacion'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );

            $pl_padre = $this->dbc->query("SELECT * from agrupacion_plantilla where idplantilla_padre = '$pl_list[idplantilla]'");// VENTAS->NOMBRE
            // $es_plant_agrup = $pl_padre->num_rows > 0;
            $pl_padre_calcu = $this->dbc->query("SELECT * from pr_plantilla where idplantilla_padre = '$pl_list[idplantilla]'");// VENTAS->NOMBRE
            // $es_plant_calc = $pl_padre_calcu->num_rows > 0;
            if($pl_padre->num_rows > 0){ //SI ES UNA PLANTILLA AGRUPADORA  (utilidad bruta en ventas)
                $sum_rest = 0;
                // $lista_aux_buscador[] = $res;
                // array_push($lista_aux_buscador,$res);
                while ($buscarId = $this->dbc->fetch($pl_padre)) { // 2agrupados
                    foreach ($lista as $item) {
                        if ($item['idplantilla'] === $buscarId['idplantilla_hijo']) {
                            //agarro si es suma o resta y agarro su valor 
                            if($buscarId['tipo_operacion'] == 'sumar'){
                                $sum_rest = $sum_rest + $item['suma_nivel_2'];
                            }elseif($buscarId['tipo_operacion'] == 'restar'){
                                $sum_rest = $sum_rest - $item['suma_nivel_2'];
                            }
                            // $item['suma_nivel_2'];
                            // $encontrado = true;
                            break;
                        }else{
                            //seguir buscando
                        }
                    }
                }
                $res['suma_nivel_2'] = $sum_rest;
            }elseif($pl_padre_calcu->num_rows > 0){ //ES UNA PLANTILLA CON HIJOS CALCULABLES  (VENTAS)

                $suma_nivel_2 = 0;
                while ($aux_calculable = $this->dbc->fetch($pl_padre_calcu)) { //CALCULABLES

                $plan_cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$aux_calculable[idplandecuenta]'");// caja_general, banco
                $nombre_cuenta = $plan_cuenta->fetch_assoc();

                $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$aux_calculable[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                $valor2 = $suma_cuentas2->fetch_assoc();
                $suma_nivel_2 = $suma_nivel_2 + $valor2['total'];
                
                $res2 = array(
                        // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                        "codigo" => $nombre_cuenta['numero'],
                        "nombre_cuenta" => $nombre_cuenta['nombreplan'],
                        // "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                        "valor" => $valor2['total'],
                        // "nivel_3" => [] //activo
                        );
                array_push($res['nivel_2'], $res2);     
                }
                $res['suma_nivel_2'] = $suma_nivel_2;
            }else{ //ES UNA PLANTILLA SIN OPERACION (COSTO_PRODUCCION)
                
                $agru = $this->dbc->query("SELECT * from agrupacion_plantilla where idplantilla_hijo = '$pl_list[idplantilla]'");// HIJOS DE LAS PLANTILLAS AGRUPADORAS
                $agru_aux = $agru->fetch_assoc();
                $res['suma_nivel_2'] = $agru_aux['monto']; //esto en caso de que el monto siempre sea mayor a cero
            }
            array_push($lista, $res);  
            $lista_aux_buscador = [];        
        }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function editar_otras_operaciones($idagrupacion_plantilla, $idplantilla_hijo, $operacion, $monto)
    {
        // $id_empresa = $this->get_id_empresa($idempresa);

        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM agrupacion_plantilla WHERE idplantilla_hijo = '$idplantilla_hijo' AND idempresa = '$idempresa' AND iddivisa != '$id'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        // Actualizar el registro
        $stmt_update = $this->dbc->query("UPDATE agrupacion_plantilla SET idplantilla_hijo = '$idplantilla_hijo', tipo_operacion = '$operacion', monto = '$monto' WHERE idagrupacion_plantilla = '$idagrupacion_plantilla'");

        if ($stmt_update === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar");
            }

        echo json_encode($res);    
    }
    public function eliminar_otras_operaciones($idagrupacion_plantilla){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro 
                $delete = $this->dbc->query("DELETE FROM agrupacion_plantilla WHERE idagrupacion_plantilla = '$idagrupacion_plantilla'");
                if ($delete === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }
}
?>
