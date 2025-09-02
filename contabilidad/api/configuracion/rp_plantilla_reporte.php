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
            
            if ($row['idplandecuenta'] == null || $row['idplandecuenta'] == '0') {
               
                $nodo['nombre_personalizado'] =  $row['nombre_personalizado'];
            } else {
                 $nodo['idplandecuenta'] = $row['idplandecuenta'];
                $nodo['nombreplan'] = $row['nombreplan'];
                $nodo['codigo'] = $row['numero'];
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

    public function editar_plantilla_incompleto($idplantilla, $idplandecuenta, $nombre_personalizado, $tipo_operacion, $orden, $idplantilla_padre, $nivel, $disponible_para_otro_reporte, $idempresa)
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

    public function rp_editar_plantilla($idplantilla, $idplandecuenta, $nombre_personalizado, $tipo_operacion, $orden, $idplantilla_padre, $empresa) {
        $idempresa = $this->get_id_empresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM pr_plantilla WHERE idplantilla_padre = '$idplantilla'");
        $resultado = $consulta->fetch_assoc();
        $existe_plantilla = $resultado['total'];


        $consulta2 = $this->dbc->query("SELECT COUNT(*) AS total FROM agrupacion_plantilla WHERE idplantilla_padre = '$idplantilla'");
        $resultado2 = $consulta2->fetch_assoc();
        $existe_agrupacion = $resultado2['total'];

        // if()//tipo operacion es diferente de lo q ya existe en la base de datos  entonces ir abajo
        if ($existe_plantilla > 0 || $existe_agrupacion > 0) { // EL REGISTRO TIENE DEPENDENCIAS
            //NO SE PODRA EDITAR EL TIPO_OPERACION PERO SI EL ORDEN (EN DUDA)

            $res = array("danger", "El registro no puede editarse","editarCaracteristicas");
        }else {
            // se editara
            $pregunta = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla = '$idplantilla'");
            $res_pregunta = $pregunta->fetch_assoc();
            if($orden == $res_pregunta['orden']){ //NO QUIEREN CAMBIAR EL ORDEN
                $editar = $this->dbc->query("UPDATE pr_plantilla
                                    SET idplandecuenta = '$idplandecuenta',
                                    nombre_personalizado = '$nombre_personalizado',
                                    tipo_operacion = '$tipo_operacion'
                                    WHERE idplantilla = '$idplantilla';");

            }elseif($orden > $res_pregunta['orden']){ // SI QUIEREN CAMBIAR EL ORDEN
                //EL NUEVO ORDEN ES MAYOR QUE EL ORDEN Q YA ESTA REGISTRADO

                if($idplantilla_padre == ""){ //ESTE REGISTRO ES DE NIVEL 1
                $orden_inicio = $res_pregunta['orden'] + 1;

                $consulta_nivel_1 = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                AND idempresa = '$idempresa' AND nivel = '$res_pregunta[nivel]' AND orden BETWEEN '$orden_inicio' AND '$orden' ORDER BY orden ASC");

                while ($rg = $this->dbc->fetch($consulta_nivel_1)) {
                        $nuevo_orden = $rg['orden'] - 1;
                        $editar_orden_demas = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$nuevo_orden'
                                    WHERE idplantilla = '$rg[idplantilla]';");
                    }
                    $editar = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$orden',
                                    idplandecuenta = '$idplandecuenta',
                                    nombre_personalizado = '$nombre_personalizado',
                                    tipo_operacion = '$tipo_operacion'
                                    WHERE idplantilla = '$idplantilla';");

                }else{
                    // $consulta_nivel_2 = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                    // AND idempresa = '$idempresa' AND nivel = '$res_pregunta[nivel]' AND idplantilla_padre ='$res_pregunta[idplantilla_padre]' ORDER BY orden ASC");

                    $orden_inicio = $res_pregunta['orden'] + 1;

                    $recorrer_registro = $this->dbc->query("SELECT * FROM pr_plantilla where idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                    AND idempresa = '$idempresa' AND nivel = '$res_pregunta[nivel]' AND idplantilla_padre ='$res_pregunta[idplantilla_padre]' AND orden BETWEEN '$orden_inicio' AND '$orden' ORDER BY orden ASC");

                    while ($rg = $this->dbc->fetch($recorrer_registro)) {
                        $nuevo_orden = $rg['orden'] - 1;
                        $editar_orden_demas = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$nuevo_orden'
                                    WHERE idplantilla = '$rg[idplantilla]';");
                    }
                    $editar = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$orden',
                                    idplandecuenta = '$idplandecuenta',
                                    nombre_personalizado = '$nombre_personalizado',
                                    tipo_operacion = '$tipo_operacion'
                                    WHERE idplantilla = '$idplantilla';");

                }
            }elseif($orden < $res_pregunta['orden']){ //EL ORDEN INGRESADO ES MENOR QUE EL ORDEN DEL REGISTRO Q SE EDITARA

                if($idplantilla_padre == ""){ //ESTE REGISTRO ES DE NIVEL 1
                $orden_final = $res_pregunta['orden'] - 1; //4

                $consulta_nivel_1 = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                AND idempresa = '$idempresa' AND nivel = '$res_pregunta[nivel]' AND orden BETWEEN '$orden' AND '$orden_final' ORDER BY orden ASC");

                while ($rg = $this->dbc->fetch($consulta_nivel_1)) {
                        $nuevo_orden = $rg['orden'] + 1;
                        $editar_orden_demas = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$nuevo_orden'
                                    WHERE idplantilla = '$rg[idplantilla]';");
                    }
                    $editar = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$orden',
                                    idplandecuenta = '$idplandecuenta',
                                    nombre_personalizado = '$nombre_personalizado',
                                    tipo_operacion = '$tipo_operacion'
                                    WHERE idplantilla = '$idplantilla';");

                }else{
                    // $consulta_nivel_2 = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                    // AND idempresa = '$idempresa' AND nivel = '$res_pregunta[nivel]' AND idplantilla_padre ='$res_pregunta[idplantilla_padre]' ORDER BY orden ASC");

                    $orden_final = $res_pregunta['orden'] - 1;

                    $recorrer_registro = $this->dbc->query("SELECT * FROM pr_plantilla where idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                    AND idempresa = '$idempresa' AND nivel = '$res_pregunta[nivel]' AND idplantilla_padre ='$res_pregunta[idplantilla_padre]' AND orden BETWEEN '$orden' AND '$orden_final' ORDER BY orden ASC");

                    while ($rg = $this->dbc->fetch($recorrer_registro)) {
                        $nuevo_orden = $rg['orden'] + 1;
                        $editar_orden_demas = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$nuevo_orden'
                                    WHERE idplantilla = '$rg[idplantilla]';");
                    }
                    $editar = $this->dbc->query("UPDATE pr_plantilla
                                    SET orden = '$orden',
                                    idplandecuenta = '$idplandecuenta',
                                    nombre_personalizado = '$nombre_personalizado',
                                    tipo_operacion = '$tipo_operacion'
                                    WHERE idplantilla = '$idplantilla';");

                }

            }
            // $es_diferente_orden = $res_pregunta['orden'];

            if ($editar === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas",$idplantilla, $idplandecuenta, $nombre_personalizado, $tipo_operacion, $orden, $idplantilla_padre, $empresa);
            } else {
                $res = array("danger", "No se pudo editar");
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

    public function reporte_estado_resultados_hasta_nivel_2($fecha_ini,$fecha_fin,$empresa) {
        //    ini_set('display_errors', 1); 
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        // $lista = [];
        $idempresa = $this->get_id_empresa($empresa);
        // $gestion = $this->getidgestion($empresa);
    $gestion = $this->get_id_gestion($empresa);
        $lista_aux_buscador = [];
        $lista =[];
        $tipo_report = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idempresa = '$idempresa' AND tipo_reporte = 'estado_resultado'");
        $id_pl_reporte = $tipo_report->fetch_assoc();

        $plantilla_lista = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$id_pl_reporte[idtipo_reportes]' 
        AND idempresa = '$idempresa' AND idplantilla_padre IS NULL ORDER BY orden ASC");// PLANTILLAS PRINCIPALES
       
       while ($pl_list = $this->dbc->fetch($plantilla_lista)) {
            if($pl_list['nombre_personalizado'] == NULL){
                $pla_cuen = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$pl_list[idplandecuenta]'");// VENTAS->NOMBRE
                $nombre_cuen = $pla_cuen->fetch_assoc();
                $nombre_cuenta = $nombre_cuen['nombreplan'];
            }else{
                $nombre_cuenta = $pl_list['nombre_personalizado'];
            }
            if($pl_list['tipo_operacion'] == 'calculable'){ // ES CALCULABLE REGISTRO PADREEE
                $cuenta_plan = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$pl_list[idplandecuenta]'");// VENTAS->NOMBRE
                $pc = $cuenta_plan->fetch_assoc();

                if($pc['numero'] >= '4.0.0.00.00' && '5.0.0.00.00' > $pc['numero']){ // INGRESOS
                            $calcu = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$pl_list[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }elseif($pc['numero'] >= '5.0.0.00.00' && '6.0.0.00.00' > $pc['numero']){ // EGRESOS_GASTOS
                        $calcu = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$pl_list[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }else{ // las cuentas de 6.0.0.00.00 ORDEN
                        $calcu = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$pl_list[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }

                    $valor_auxi = $calcu->fetch_assoc();
                // $suma_nivel_2 = $valor_auxi + $valor2['total'];
                if($valor_auxi['total'] == null || $valor_auxi['total'] == '0'){
                    //-----------------------------------
                }else{
                    $res = array(
                    // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                    "idplantilla" => $pl_list['idplantilla'],
                    "codigo" => $nombre_cuen['numero'],
                    "nombre_personalizado" => $nombre_cuenta,
                    "tipo_operacion" => $pl_list['tipo_operacion'],
                    "suma_nivel_2" => $valor_auxi['total'],
                    "nivel_2" => [] //activo
                    );  
                    // array_push($res['nivel_2'], $res2);  
                }  

            }else{ //{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
                // NO ES CALCULABLE

                $res = array(
                    // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                    "idplantilla" => $pl_list['idplantilla'],
                    "codigo" => $nombre_cuen['numero'],
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

                // $ingreso_egreso = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero >= '5.0.0.00.00' AND numero < '6.0.0.00.00'");// EGRESO_GASTOS
                // $nombre_cuenta = $ingreso_egreso->fetch_assoc();
                    //select * from plandecuenta where numero >= '5.0.0.00.00' and numero < '6.0.0.00.00' order by numero desc
                    if($nombre_cuenta['numero'] >= '4.0.0.00.00' && '5.0.0.00.00' > $nombre_cuenta['numero']){ // INGRESOS
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$aux_calculable[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }elseif($nombre_cuenta['numero'] >= '5.0.0.00.00' && '6.0.0.00.00' > $nombre_cuenta['numero']){ // EGRESOS_GASTOS
                        $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$aux_calculable[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }else{ // las cuentas de 6.0.0.00.00 ORDEN
                        $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$aux_calculable[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }

                $valor2 = $suma_cuentas2->fetch_assoc();
                $suma_nivel_2 = $suma_nivel_2 + $valor2['total'];
                // if($valor2['total'] == null || $valor2['total'] == '0'){
                //     //-----------------------------------
                // }else{
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

                // }  

                }
                $res['suma_nivel_2'] = $suma_nivel_2;
            }else{ //ES UNA PLANTILLA SIN OPERACION (COSTO_PRODUCCION)
                
                $agru = $this->dbc->query("SELECT * from agrupacion_plantilla where idplantilla_hijo = '$pl_list[idplantilla]'");// HIJOS DE LAS PLANTILLAS AGRUPADORAS
                $agru_aux = $agru->fetch_assoc();
                $res['suma_nivel_2'] = $agru_aux['monto']; //esto en caso de que el monto siempre sea mayor a cero
            }
            }//}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}} AQUI TERMINA EL NO ES CALCULABLE
            // $res = array(
            //         // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
            //         "idplantilla" => $pl_list['idplantilla'],
            //         "nombre_personalizado" => $nombre_cuenta,
            //         "tipo_operacion" => $pl_list['tipo_operacion'],
            //         "suma_nivel_2" => 0,
            //         "nivel_2" => [] //activo
            //         );

    

            // if($res['suma_nivel_2'] == '0' || $res['suma_nivel_2'] == null){
            //     //nada
            // }else{
                array_push($lista, $res);
            // }
            // array_push($lista, $res);  
            $lista_aux_buscador = [];        
        }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function reporte_estado_resultados_actualizado($fecha_ini,$fecha_fin,$empresa) {
        //    ini_set('display_errors', 1); 
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        // $lista = [];
        $idempresa = $this->get_id_empresa($empresa);
        // $gestion = $this->getidgestion($empresa);
    $gestion = $this->get_id_gestion($empresa);
        $lista_aux_buscador = [];
        $lista =[];
        $tipo_report = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idempresa = '$idempresa' AND tipo_reporte = 'estado_resultado'");
        $id_pl_reporte = $tipo_report->fetch_assoc();

        $plantilla_lista = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$id_pl_reporte[idtipo_reportes]' 
        AND idempresa = '$idempresa' AND idplantilla_padre IS NULL ORDER BY orden ASC");// PLANTILLAS PRINCIPALES
       
       while ($pl_list = $this->dbc->fetch($plantilla_lista)) {
            if($pl_list['nombre_personalizado'] == NULL){
                $pla_cuen = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$pl_list[idplandecuenta]'");// VENTAS->NOMBRE
                $nombre_cuen = $pla_cuen->fetch_assoc();
                $nombre_cuenta = $nombre_cuen['nombreplan'];
            }else{
                $nombre_cuenta = $pl_list['nombre_personalizado'];
            }
            if($pl_list['tipo_operacion'] == 'calculable'){ // ES CALCULABLE REGISTRO PADREEE
                $cuenta_plan = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$pl_list[idplandecuenta]'");// VENTAS->NOMBRE
                $pc = $cuenta_plan->fetch_assoc();

                if($pc['numero'] >= '4.0.0.00.00' && '5.0.0.00.00' > $pc['numero']){ // INGRESOS
                            $calcu = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$pl_list[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }elseif($pc['numero'] >= '5.0.0.00.00' && '6.0.0.00.00' > $pc['numero']){ // EGRESOS_GASTOS
                        $calcu = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$pl_list[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }else{ // las cuentas de 6.0.0.00.00 ORDEN
                        $calcu = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$pl_list[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }

                    $valor_auxi = $calcu->fetch_assoc();
                // $suma_nivel_2 = $valor_auxi + $valor2['total'];
                if($valor_auxi['total'] == null || $valor_auxi['total'] == '0'){
                    //-----------------------------------
                }else{
                    $res = array(
                    // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                    "idplantilla" => $pl_list['idplantilla'],
                    "codigo" => $nombre_cuen['numero'],
                    "nombre_personalizado" => $nombre_cuenta,
                    "tipo_operacion" => $pl_list['tipo_operacion'],
                    "suma_nivel_2" => $valor_auxi['total'],
                    "nivel_2" => [] //activo
                    );  
                    // array_push($res['nivel_2'], $res2);  
                }  

            }else{ //{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
                // NO ES CALCULABLE

                $res = array(
                    // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                    "idplantilla" => $pl_list['idplantilla'],
                    "codigo" => $nombre_cuen['numero'],
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

            // NIVEL 2 2222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
            $suma_nivel_2 = 0;
            while ($aux_nivel_2 = $this->dbc->fetch($pl_padre_calcu)) { //CALCULABLES o TALVES TAMBIEN NO CALCULABLES

                if($aux_nivel_2['tipo_operacion'] == 'calculable'){ //SI ES CALCULABLE
                    // recargo, descuento
                    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
                    $plan_cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$aux_nivel_2[idplandecuenta]'");// caja_general, banco
                $nombre_cuenta = $plan_cuenta->fetch_assoc();

                if($nombre_cuenta['numero'] >= '4.0.0.00.00' && '5.0.0.00.00' > $nombre_cuenta['numero']){ // INGRESOS
                        $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$aux_nivel_2[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }elseif($nombre_cuenta['numero'] >= '5.0.0.00.00' && '6.0.0.00.00' > $nombre_cuenta['numero']){ // EGRESOS_GASTOS
                        $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$aux_nivel_2[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }else{ // las cuentas de 6.0.0.00.00 ORDEN
                        $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$aux_nivel_2[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                    }

                $valor2 = $suma_cuentas2->fetch_assoc();
                $suma_nivel_2 = $suma_nivel_2 + $valor2['total'];
                // if($valor2['total'] == null || $valor2['total'] == '0'){
                //     //-----------------------------------
                // }else{
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

                // } 
                    //----------------------------------------------------------------------------------------------------------------------------------------------------------------
                }else{ // NO ES CALCULABLE
                    // NIVEL 3 333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
                    $res2 = array(
                        // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                        "codigo" => $nombre_cuenta['numero'],
                        "nombre_cuenta" => $nombre_cuenta['nombreplan'],
                        // "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                        "valor" => 0,
                        // "nivel_3" => [] //activo
                        );

                    $nivel_3 = $this->dbc->query("SELECT * from pr_plantilla WHERE idplantilla_padre = '$aux_nivel_2[idplantilla]'");// vents_cafe_yungs, vnts cafe_nueva esperanza
                    
                    while ($aux_nivel_3 = $this->dbc->fetch($nivel_3)) {
                        if($aux_nivel_3['tipo_operacion'] == 'calculable'){ //SI ES CALCULABLE   
                            // venta cafe yungas y venta cafe nueva esperanza
                            
                        }else{ // NO ES CALCULABLE
                            // NIVEL 4 4444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444
                            $nivel_4 = $this->dbc->query("SELECT * from pr_plantilla WHERE idplantilla_padre = '$aux_nivel_3[idplantilla]'");// vents_cafe_yungs, vnts cafe_nueva esperanza

                            while ($aux_nivel_4 = $this->dbc->fetch($nivel_4)) {
                                if($aux_nivel_4['tipo_operacion'] == 'calculable'){ //SI ES CALCULABLE   

                                }else{ // NO ES CALCULABLE
                                    
                                }     
                            }
                            // FIN DEL NIVEL 4 4444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444        
                        }     
                    }
                    // FIN DEL NIVEL 3 333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
                }
            }
            $res['suma_nivel_2'] = $suma_nivel_2;
            // FIN DEL NIVEL 2 2222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222 
            }else{ //ES UNA PLANTILLA SIN OPERACION (COSTO_PRODUCCION)
                
                $agru = $this->dbc->query("SELECT * from agrupacion_plantilla where idplantilla_hijo = '$pl_list[idplantilla]'");// HIJOS DE LAS PLANTILLAS AGRUPADORAS
                $agru_aux = $agru->fetch_assoc();
                $res['suma_nivel_2'] = $agru_aux['monto']; //esto en caso de que el monto siempre sea mayor a cero
            }
            }// AQUI TERMINA EL NO ES CALCULABLE }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
            
            // $res = array(
            //         // "idconfiguracion_reporte" => $pl2['idconfiguracion_reporte'],
            //         "idplantilla" => $pl_list['idplantilla'],
            //         "nombre_personalizado" => $nombre_cuenta,
            //         "tipo_operacion" => $pl_list['tipo_operacion'],
            //         "suma_nivel_2" => 0,
            //         "nivel_2" => [] //activo
            //         );

    

            // if($res['suma_nivel_2'] == '0' || $res['suma_nivel_2'] == null){
            //     //nada
            // }else{
                array_push($lista, $res);
            // }
            // array_push($lista, $res);  
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
    public function listar_tipo_reportes_gestion($empresa){
          ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
         $lista = [];
        $idempresa = $this->get_id_empresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idempresa = '$idempresa' AND tipo_reporte != 'personalizado'");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idtipo_reportes" => $qwe['idtipo_reportes'],
                "nombre" => $qwe['nombre'],
                "tipo_reporte" => $qwe['tipo_reporte']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function select_plantilla_estado_resultados($empresa)
    {
        ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $ide = $this->get_id_empresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,organizacion_idorganizacion,idp FROM plandecuenta WHERE organizacion_idorganizacion='$ide' ORDER BY numero ASC");
        while ($qwe = $this->dbc->fetch($registro)) {
            
            $existe_plantilla = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplandecuenta = '$qwe[idplandecuenta]' AND idempresa='$ide'");
            if($existe_plantilla->num_rows > 0){
                $res = array("idplandecuenta" => $qwe['idplandecuenta'], "numero" => $qwe['numero'], "nombre" => $qwe['nombreplan'], "estado" => 'usado');

            }else{
                $res = array("idplandecuenta" => $qwe['idplandecuenta'], "numero" => $qwe['numero'], "nombre" => $qwe['nombreplan'], "estado" => 'no_usado');
            }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
}
?>
