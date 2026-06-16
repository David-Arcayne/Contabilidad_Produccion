<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; ini_set

class Vinculacion_empresas extends DB{
    public function vincular_empresas_reemplazando_plandecuentas($empresa_act,$idempresa_vincula,$idgestion_vincula){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa_act = $this->getidempresa($empresa_act);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO vinculacion_empresas(idempresa_actual,idempresa_vinculada,idgestion_vinculada) VALUES ('$idempresa_act','$idempresa_vincula','$idgestion_vincula')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
        
    }
    public function vincular_empresas_version_2($empresa_act,$idempresa_vincula,$idgestion_vincula){
       
        $resp_a_usuario = FALSE;
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa_act = $this->getidempresa($empresa_act);
        $get_plandecuenta_empresa_act = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_act'");
        $get_plandecuenta_empresa_vinculada = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_vincula'");

        $get_rubro_pl = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_act'");

        $get_tipo_trans_act = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idempresa = '$idempresa_act'");

        //DEBE EXISTIR PLAN D CUENTAS,RUBRO AGRUPACION, TIPO ASIENTO Y TIPO D CAMBIO
        if($get_plandecuenta_empresa_act->num_rows > 0 && $get_rubro_pl->num_rows > 0 && $get_tipo_trans_act->num_rows > 0){ //SI EXISTE PLAN DE CUENTAS y RUBRO AGRUPACION EN LA EMPRESA ACTUAL QUE ESTAMOS
            
            // if($get_rubro_pl->num_rows > 0){ // SI EXISTE RUBRO PLAN DE CUENTAS EN LA EMPRESA ACTUAL QUE ESTAMOS 
                if($get_plandecuenta_empresa_vinculada->num_rows > 0){ // SI EXISTE PLANES DE CUENTAS EN LA EMPRESA QUE VAMOS A VINCULAR
                    // REEMPLAZAMOS PLANES DE CUENTAS --> SE ESPERA QUE LOS PLANES DE CUENTAS AUN NO ESTEN SIENDO USADOS

                    $det_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE idorganizacion = '$idempresa_vincula'");

                    if($det_trans->num_rows > 0){
                        // NO SE PODRA BORRAR PLANES DE CUENTAS DE LA EMPRESA A LA QUE QUEREMOS VINCULAR
                        $resp_a_usuario = FALSE;
                    }else{
                        // ELIMINAMOS PLAN DE CUENTAS Y AGRUPACCION_RUBRO
                        $eliminar_rubro = $this->dbc->query("DELETE FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_vincula'");
                        $eliminar_pl = $this->dbc->query("DELETE FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_vincula'");

                        // DUPLICAR AGRUPACION_RUBRO Y PLANES DE CUENTAS

                        while($rubr = $this->dbc->fetch($get_rubro_pl)){
                            $registro_rubro = $this->dbc->query("INSERT INTO agrupacion_rubro_plandecuenta(tipo_plandecuenta,numero,idempresa)
                            VALUES ('$rubr[tipo_plandecuenta]','$rubr[numero]','$idempresa_vincula')");
                        }
                        while($qwe = $this->dbc->fetch($get_plandecuenta_empresa_act)){
                            $registro_pl = $this->dbc->query("INSERT INTO plandecuenta(numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
                            VALUES ('$qwe[numero]','$qwe[nombreplan]','$qwe[descripcion]','$qwe[saldonormal]','$qwe[consolidar]','$qwe[idp]','$idempresa_vincula')");
                        }

                        $resp_a_usuario = TRUE;
                    }

                }else{ // NO EXISTEN PLANES DE CUENTAS EN LA EMPRESA QUE VAMOS A VINCULAR
                    // DUPLICAR AGRUPACION_RUBRO Y PLANES DE CUENTAS
                    while($rubr = $this->dbc->fetch($get_rubro_pl)){
                        $registro_rubro = $this->dbc->query("INSERT INTO agrupacion_rubro_plandecuenta(tipo_plandecuenta,numero,idempresa)
                        VALUES ('$rubr[tipo_plandecuenta]','$rubr[numero]','$idempresa_vincula')");
                    }
                    while($qwe = $this->dbc->fetch($get_plandecuenta_empresa_act)){
                        $registro_pl = $this->dbc->query("INSERT INTO plandecuenta(numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
                        VALUES ('$qwe[numero]','$qwe[nombreplan]','$qwe[descripcion]','$qwe[saldonormal]','$qwe[consolidar]','$qwe[idp]','$idempresa_vincula')");
                    }

                    $resp_a_usuario = TRUE;
                }


        }else{ 
            // NO EXISTE PLAN DE CUENTAS EN LA EMPRESA ACTUAL DONDE NOS ENCONTRAMOS MOSTRAR MENSAJE DE ERROR
            $resp_a_usuario = FALSE;
        }
    
            if ($resp_a_usuario === TRUE) {        
                
                $registrar_vinculacion = $this->dbc->query("INSERT INTO vinculacion_empresas(idempresa_actual,idempresa_vinculada,idgestion_vinculada) VALUES ('$idempresa_act','$idempresa_vincula','$idgestion_vincula')");
                                                                                                                                                        
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
        
    }

    // public function vincular_empresas($empresa_act,$idempresa_vincula,$idgestion_vincula){
       
    //     $resp_a_usuario = FALSE;
    //     // $idempresa = Empresa::getidempresa($empresa);
    //     $idempresa_act = $this->getidempresa($empresa_act);
    //     $get_plandecuenta_empresa_act = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_act'");

    //     $get_rubro_pl = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_act'");

    //     $get_tipo_trans_act = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idempresa = '$idempresa_act'");

    //     $get_tipo_cambio_act = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa_act'");

    //     //DEBE EXISTIR PLAN D CUENTAS,RUBRO AGRUPACION, TIPO ASIENTO Y TIPO D CAMBIO
    //     if($get_plandecuenta_empresa_act->num_rows > 0 && $get_rubro_pl->num_rows > 0 && $get_tipo_trans_act->num_rows > 0 && $get_tipo_cambio_act->num_rows > 0){ //SI EXISTE PLAN DE CUENTAS y RUBRO AGRUPACION EN LA EMPRESA ACTUAL QUE ESTAMOS
            
    //         $get_plandecuenta_empresa_vincu = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_vincula'");

    //         $get_rubro_pl_vincu = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_vincula'");

    //         $get_tipo_trans_vincu = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idempresa = '$idempresa_vincula'");

    //         $get_tipo_cambio_vincu = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa_vincula'");

    //         // if($get_rubro_pl->num_rows > 0){ // SI EXISTE RUBRO PLAN DE CUENTAS EN LA EMPRESA ACTUAL QUE ESTAMOS 
    //             if($get_plandecuenta_empresa_vincu->num_rows == 0 && $get_rubro_pl_vincu->num_rows == 0 && $get_tipo_trans_vincu->num_rows == 0 && $get_tipo_cambio_vincu->num_rows == 0){ // SI EXISTE PLANES DE CUENTAS EN LA EMPRESA QUE VAMOS A VINCULAR

    //                 // DUPLICAR AGRUPACION_RUBRO Y PLANES DE CUENTAS

    //                     while($rubr = $this->dbc->fetch($get_rubro_pl)){
    //                         $registro_rubro = $this->dbc->query("INSERT INTO agrupacion_rubro_plandecuenta(tipo_plandecuenta,numero,idempresa)
    //                         VALUES ('$rubr[tipo_plandecuenta]','$rubr[numero]','$idempresa_vincula')");
    //                     }

    //                     while($pl = $this->dbc->fetch($get_plandecuenta_empresa_act)){

    //                         $plan_ant = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta= '$pl[idp]'");
    //                         $pl_ant = $this->dbc->fetch($plan_ant);

    //                         $plan_act = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$pl_ant[numero]' AND organizacion_idorganizacion ='$idempresa_vincula'");
    //                         $pl_act = $this->dbc->fetch($plan_act);

    //                         $registro_pl = $this->dbc->query("INSERT INTO plandecuenta(numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
    //                         VALUES ('$pl[numero]','$pl[nombreplan]','$pl[descripcion]','$pl[saldonormal]','$pl[consolidar]','$pl_act[idplandecuenta]','$idempresa_vincula')");
    //                     }

    //                     while($tip_trans = $this->dbc->fetch($get_tipo_trans_act)){
    //                         $registro_tipo = $this->dbc->query("INSERT INTO tipotransaccion(nombre,detalle,idempresa)
    //                         VALUES ('$tip_trans[nombre]','$tip_trans[detalle]','$idempresa_vincula')");
    //                     }
    //                     while($tc = $this->dbc->fetch($get_tipo_cambio_act)){
    //                         $registro_tcambio = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)
    //                         VALUES ('$tc[dolar]','$tc[ufv]','$tc[fecha]','$idempresa_vincula')");
    //                     }

    //                     $get_agru = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa ='$idempresa_vincula' ORDER BY numero ASC");

    //                     while($agr = $this->dbc->fetch($get_agru)){
    //                         $aux_num = $agr['numero'] + 1;
    //                         // $get_agru = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion ='$idempresa_vincula' 
    //                         // AND numero BETWEEN '$agr[numero]' AND '$aux_num'");
    //                         $update_agru = $this->dbc->query("UPDATE plandecuenta SET idagrupacion_rubro_plandecuenta = '$agr[idagrupacion_rubro_plandecuenta]' 
    //                         WHERE organizacion_idorganizacion ='$idempresa_vincula' 
    //                         AND numero BETWEEN '$agr[numero]' AND '$aux_num'");
    //                     }

    //                     $resp_a_usuario = TRUE;

    //             }else{ // NO EXISTEN PLANES DE CUENTAS EN LA EMPRESA QUE VAMOS A VINCULAR

    //                 $resp_a_usuario = FALSE;
    //             }


    //     }else{ 
    //         // NO EXISTE PLAN DE CUENTAS EN LA EMPRESA ACTUAL DONDE NOS ENCONTRAMOS MOSTRAR MENSAJE DE ERROR
    //         $resp_a_usuario = FALSE;
    //     }
    
    //         if ($resp_a_usuario === TRUE) {        
                
    //             $registrar_vinculacion = $this->dbc->query("INSERT INTO vinculacion_empresas(idempresa_actual,idempresa_vinculada,idgestion_vinculada) VALUES ('$idempresa_act','$idempresa_vincula','$idgestion_vincula')");
                                                                                                                                                        
    //             $res = array("success", "Registro exitoso","registroCaracteristicas");
    //         } else {
    //             $res = array("danger", "No se pudo registrar");
    //         }
        
    //     echo json_encode($res);
        
    // }

    public function vincular_empresas($empresa_act,$idempresa_vincula,$idgestion_vincula){
    $resp_a_usuario = FALSE;
    $idempresa_act = $this->getidempresa($empresa_act);

    try {
        // Iniciar transacción
        $this->dbc->begin_transaction();

        $get_plandecuenta_empresa_act = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_act'");
        $get_rubro_pl = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_act'");
        $get_tipo_trans_act = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idempresa = '$idempresa_act'");
        $get_tipo_cambio_act = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa_act'");

        if($get_plandecuenta_empresa_act->num_rows > 0 && $get_rubro_pl->num_rows > 0 && $get_tipo_trans_act->num_rows > 0 && $get_tipo_cambio_act->num_rows > 0){
            
            $get_plandecuenta_empresa_vincu = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_vincula'");
            $get_rubro_pl_vincu = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_vincula'");
            $get_tipo_trans_vincu = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idempresa = '$idempresa_vincula'");
            $get_tipo_cambio_vincu = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa_vincula'");

            if($get_plandecuenta_empresa_vincu->num_rows == 0 && $get_rubro_pl_vincu->num_rows == 0 && $get_tipo_trans_vincu->num_rows == 0 && $get_tipo_cambio_vincu->num_rows == 0){

                // DUPLICAR AGRUPACION_RUBRO Y PLANES DE CUENTAS
                while($rubr = $this->dbc->fetch($get_rubro_pl)){
                    $this->dbc->query("INSERT INTO agrupacion_rubro_plandecuenta(tipo_plandecuenta,numero,idempresa)
                    VALUES ('$rubr[tipo_plandecuenta]','$rubr[numero]','$idempresa_vincula')");
                }

                while($pl = $this->dbc->fetch($get_plandecuenta_empresa_act)){
                    $plan_ant = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta= '$pl[idp]'");
                    $pl_ant = $this->dbc->fetch($plan_ant);

                    $plan_act = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$pl_ant[numero]' AND organizacion_idorganizacion ='$idempresa_vincula'");
                    $pl_act = $this->dbc->fetch($plan_act);

                    $this->dbc->query("INSERT INTO plandecuenta(numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
                    VALUES ('$pl[numero]','$pl[nombreplan]','$pl[descripcion]','$pl[saldonormal]','$pl[consolidar]','$pl_act[idplandecuenta]','$idempresa_vincula')");
                }

                while($tip_trans = $this->dbc->fetch($get_tipo_trans_act)){
                    $this->dbc->query("INSERT INTO tipotransaccion(nombre,detalle,idempresa)
                    VALUES ('$tip_trans[nombre]','$tip_trans[detalle]','$idempresa_vincula')");
                }

                while($tc = $this->dbc->fetch($get_tipo_cambio_act)){
                    $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)
                    VALUES ('$tc[dolar]','$tc[ufv]','$tc[fecha]','$idempresa_vincula')");
                }

                $get_agru = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa ='$idempresa_vincula' ORDER BY numero ASC");

                while($agr = $this->dbc->fetch($get_agru)){
                    $aux_num = $agr['numero'] + 1;
                    $this->dbc->query("UPDATE plandecuenta SET idagrupacion_rubro_plandecuenta = '$agr[idagrupacion_rubro_plandecuenta]' 
                    WHERE organizacion_idorganizacion ='$idempresa_vincula' 
                    AND numero BETWEEN '$agr[numero]' AND '$aux_num'");
                }

                $resp_a_usuario = TRUE;
            } else {
                $resp_a_usuario = FALSE;
            }
        } else {
            $resp_a_usuario = FALSE;
        }

        if ($resp_a_usuario === TRUE) {
            $this->dbc->query("INSERT INTO vinculacion_empresas(idempresa_actual,idempresa_vinculada,idgestion_vinculada) 
            VALUES ('$idempresa_act','$idempresa_vincula','$idgestion_vincula')");

            // Confirmar transacción
            $this->dbc->commit();
            $res = array("success", "Registro exitoso","registroCaracteristicas");
        } else {
            throw new Exception("No se pudo registrar");
        }

    } catch (Exception $e) {
        // Revertir todo si falla
        $this->dbc->rollback();
        $res = array("danger", "Error: ".$e->getMessage());
    }

    echo json_encode($res);
}

    public function listar_gestiones_por_idempresa($idempresa) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_gestion = $this->dbc->query("SELECT * FROM gestion WHERE idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($get_gestion)) {
            $res = array(
                "idgestion" => $qwe['idgestion'],
                "nombre" => $qwe['nombre']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_vinculacion_empresas($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_vincu_empresa = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$idempresa'");
    
        if($get_vincu_empresa->num_rows > 0){
            while ($qwe = $this->dbc->fetch($get_vincu_empresa)) {

                $get_gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion = '$qwe[idgestion_vinculada]'");
                $gg = $get_gestion->fetch_assoc();

                $nombre_empresa = $this->dbe->query("SELECT nombreo FROM organizacion WHERE idorganizacion='$qwe[idempresa_vinculada]'");
                $name_em = $nombre_empresa->fetch_assoc();
                $res = array(
                    // "iddivisa" => $qwe['iddivisa'],
                    // "simbolo" => $qwe['simbolo'],
                    "idvinculacion" => $qwe['idvinculacion_empresas'],
                    "idempresa_vinculada" => $qwe['idempresa_vinculada'],
                    "nombre_empresa_vinculada" => $name_em['nombreo'],
                    "idgestion_vinculada" => $qwe['idgestion_vinculada'],
                    "nombre_gestion" => $gg['nombre']
                );
                array_push($lista, $res);
            }
        }else{

        }

        
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
        // echo json_encode(array($idempresa));
    }
    public function duplicar_transaccion_otra_empresa($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['empresa']);
        $idsucursal = $this->getidsucursal($data['sucursal']); 
        // $gestion = $this->getgestionactualid($idempresa);
        $montoRecibos = 0;

        // Construir rango dinámico (primer y último día del mes)
        $fecha_inicio = date("Y-m-01", strtotime($data['fecha'])); // "2025-03-01"
        $fecha_fin    = date("Y-m-t", strtotime($data['fecha']));  // "2025-03-31"

        $existe_vincu_empresa = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$idempresa'");
        $ev = $existe_vincu_empresa->fetch_assoc();

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$ev[idgestion_vinculada]'");
        $gc = $gestion_sel->fetch_assoc();

        if($data['fecha'] >= $gc['fechaini'] && $data['fecha'] <= $gc['fechafin']){

            $tipocambio_id = $this->dbc->query("SELECT * FROM tipodecambio WHERE idtipodecambio = '$data[tipodecambio]'");
            $fech_tc = $tipocambio_id->fetch_assoc();

            $tipocambio = $this->dbc->query("SELECT * FROM tipodecambio WHERE fecha = '$fech_tc[fecha]' AND idorganizacion ='$ev[idempresa_vinculada]'");
            $tc = $tipocambio->fetch_assoc();

            $tipotransaccion = $this->dbc->query("SELECT * FROM tipotransaccion WHERE nombre = '$data[ttransaccion]' AND idempresa ='$ev[idempresa_vinculada]'");
            $tt = $tipotransaccion->fetch_assoc();

            $nroTransaccion = 0;

            if($gc['formato_transaccion'] == 'por_tipo_mes') {
            
                // Buscar todas las transacciones en el rango de fechas
                $list_trans = $this->dbc->query("SELECT *
                    FROM transacciones
                    WHERE tipotransaccion_idtipotransaccion = '{$tt['idtipotransaccion']}'
                    AND fechatransaccion BETWEEN '{$fecha_inicio}' AND '{$fecha_fin}'
                    AND idgestion = '{$ev['idgestion_vinculada']}'
                    AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                    ORDER BY fechatransaccion ASC, codigotransaccion ASC
                ");

                $nroTransaccion = 0;

                if ($list_trans && $list_trans->num_rows > 0) {
                    while ($lt = $this->dbc->fetch($list_trans)) {
                        // Si la fecha que insertas es menor que la actual, significa que debe ir antes
                        if ($data['fecha'] < $lt['fechatransaccion']) {
                            $nroTransaccion = $lt['codigotransaccion'];

                            // Desplazar todos los posteriores (+1)
                            $trans_recorre = $this->dbc->query("SELECT *
                                FROM transacciones
                                WHERE tipotransaccion_idtipotransaccion = '{$tt['idtipotransaccion']}'
                                AND fechatransaccion BETWEEN '{$fecha_inicio}' AND '{$fecha_fin}'
                                AND idgestion = '{$ev['idgestion_vinculada']}'
                                AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                                AND codigotransaccion >= '{$nroTransaccion}'
                                ORDER BY codigotransaccion DESC
                            ");

                            if ($trans_recorre && $trans_recorre->num_rows > 0) {
                                while ($tr = $this->dbc->fetch($trans_recorre)) {
                                    $new_codig = $tr['codigotransaccion'] + 1;
                                    $this->dbc->query("
                                        UPDATE transacciones 
                                        SET codigotransaccion = '{$new_codig}' 
                                        WHERE idtransacciones = '{$tr['idtransacciones']}'
                                    ");
                                }
                            }
                            break; // ya encontraste el lugar, no sigas recorriendo
                        }
                    }
                }

                // Si no encontró un lugar intermedio, va al final
                if ($nroTransaccion == 0) {
                    $ultimo = $this->dbc->query("SELECT MAX(codigotransaccion) AS max_codig 
                        FROM transacciones
                        WHERE tipotransaccion_idtipotransaccion = '{$tt['idtipotransaccion']}'
                        AND fechatransaccion BETWEEN '{$fecha_inicio}' AND '{$fecha_fin}'
                        AND idgestion = '{$ev['idgestion_vinculada']}'
                        AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                    ");
                    $row = $this->dbc->fetch($ultimo);
                    $nroTransaccion = $row ? $row['max_codig'] + 1 : 1;
                }
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
            
                // Buscar todas las transacciones de la gestión y tipo
                $list_trans = $this->dbc->query("SELECT *
                    FROM transacciones
                    WHERE tipotransaccion_idtipotransaccion = '{$tt['idtipotransaccion']}'
                    AND idgestion = '{$ev['idgestion_vinculada']}'
                    AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                    ORDER BY fechatransaccion ASC, codigotransaccion ASC
                ");

                $nroTransaccion = 0;

                if ($list_trans && $list_trans->num_rows > 0) {
                    while ($lt = $this->dbc->fetch($list_trans)) {
                        // Si la fecha que insertas es menor que la actual, significa que debe ir antes
                        if ($data['fecha'] < $lt['fechatransaccion']) {
                            $nroTransaccion = $lt['codigotransaccion'];

                            // Desplazar todos los posteriores (+1)
                            $trans_recorre = $this->dbc->query("SELECT *
                                FROM transacciones
                                WHERE tipotransaccion_idtipotransaccion = '{$tt['idtipotransaccion']}'
                                AND idgestion = '{$ev['idgestion_vinculada']}'
                                AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                                AND codigotransaccion >= '{$nroTransaccion}'
                                ORDER BY codigotransaccion DESC
                            ");

                            if ($trans_recorre && $trans_recorre->num_rows > 0) {
                                while ($tr = $this->dbc->fetch($trans_recorre)) {
                                    $new_codig = $tr['codigotransaccion'] + 1;
                                    $this->dbc->query("
                                        UPDATE transacciones 
                                        SET codigotransaccion = '{$new_codig}' 
                                        WHERE idtransacciones = '{$tr['idtransacciones']}'
                                    ");
                                }
                            }
                            break; // ya encontraste el lugar, no sigas recorriendo
                        }
                    }
                }

                // Si no encontró un lugar intermedio, va al final
                if ($nroTransaccion == 0) {
                    $ultimo = $this->dbc->query("SELECT MAX(codigotransaccion) AS max_codig 
                        FROM transacciones
                        WHERE tipotransaccion_idtipotransaccion = '{$tt['idtipotransaccion']}'
                        AND idgestion = '{$ev['idgestion_vinculada']}'
                        AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                    ");
                    $row = $this->dbc->fetch($ultimo);
                    $nroTransaccion = $row ? $row['max_codig'] + 1 : 1;
                }

            } else { // POR_GESTION
            
                // Buscar todas las transacciones de la gestión
                $list_trans = $this->dbc->query("SELECT *
                    FROM transacciones
                    WHERE idgestion = '{$ev['idgestion_vinculada']}'
                    AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                    ORDER BY fechatransaccion ASC, codigotransaccion ASC
                ");

                $nroTransaccion = 0;

                if ($list_trans && $list_trans->num_rows > 0) {
                    while ($lt = $this->dbc->fetch($list_trans)) {
                        // Si la fecha que insertas es menor que la actual, significa que debe ir antes
                        if ($data['fecha'] < $lt['fechatransaccion']) {
                            $nroTransaccion = $lt['codigotransaccion'];

                            // Desplazar todos los posteriores (+1)
                            $trans_recorre = $this->dbc->query("SELECT *
                                FROM transacciones
                                WHERE idgestion = '{$ev['idgestion_vinculada']}'
                                AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                                AND codigotransaccion >= '{$nroTransaccion}'
                                ORDER BY codigotransaccion DESC
                            ");

                            if ($trans_recorre && $trans_recorre->num_rows > 0) {
                                while ($tr = $this->dbc->fetch($trans_recorre)) {
                                    $new_codig = $tr['codigotransaccion'] + 1;
                                    $this->dbc->query("
                                        UPDATE transacciones 
                                        SET codigotransaccion = '{$new_codig}' 
                                        WHERE idtransacciones = '{$tr['idtransacciones']}'
                                    ");
                                }
                            }
                            break; // ya encontraste el lugar, no sigas recorriendo
                        }
                    }
                }

                // Si no encontró un lugar intermedio, va al final
                if ($nroTransaccion == 0) {
                    $ultimo = $this->dbc->query("SELECT MAX(codigotransaccion) AS max_codig 
                        FROM transacciones
                        WHERE idgestion = '{$ev['idgestion_vinculada']}'
                        AND organizacion_idorganizacion = '{$ev['idempresa_vinculada']}'
                    ");
                    $row = $this->dbc->fetch($ultimo);
                    $nroTransaccion = $row ? $row['max_codig'] + 1 : 1;
                }

            }

            $ediciontrans = $this->dbc->query("UPDATE transacciones
                                                    SET vinculado_otra_empresa = 'principal' 
                                                    WHERE idtransacciones = '$data[idtransaccion]';");

            $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,vinculado_otra_empresa,organizacion_idorganizacion,sucursal,idgestion)
            VALUE('$nroTransaccion','$data[fecha]','$tc[idtipodecambio]','0','$data[glosa]','$data[consolidar]','$data[estado]','$tt[idtipotransaccion]','respaldo','$ev[idempresa_vinculada]','$idsucursal','$ev[idgestion_vinculada]')");

            $idtransaccion = $this->dbc->insert_id;

            foreach ($data['detalle'] as $dt_trans) {

                $plandecuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$dt_trans[numero]' AND organizacion_idorganizacion ='$ev[idempresa_vinculada]'");
                $pl = $plandecuenta->fetch_assoc();

                $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$dt_trans[debe]','$dt_trans[haber]','$dt_trans[nota]','$idtransaccion','$pl[idplandecuenta]','0','$dt_trans[estado]','$dt_trans[cobrar]','$dt_trans[pagar]','$ev[idempresa_vinculada]','$idsucursal','$dt_trans[orden]')");
            }

            // Respuesta
            if ($writetrans === TRUE) {
                $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['detalle'],$idtransaccion,$ev['idempresa_vinculada']);
            } else {
                $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde",$data['detalle'],$idtransaccion,$ev['idempresa_vinculada']);
            }

        }else{
            $res = array("danger", "La Fecha de la transaccion no corresponde a la gestion de la empresa que se duplicara");
        
        }

        echo json_encode($res);
        // echo json_encode(array());
    }
    public function editar_gestion_empresa_vinculada($idvinculacion,$idgestion){
        
        $editar_gestion = $this->dbc->query("UPDATE vinculacion_empresas
                                                SET idgestion_vinculada = '$idgestion'
                                                WHERE idvinculacion_empresas = '$idvinculacion';");

        if ($editar_gestion === TRUE) {
            $res = array("success", "Se Registro Correctamente", "editar_gestion_empresa_vinculada");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
        echo json_encode($res);
    }
    
    public function eliminar_divisa($idcaracteristica,$idempresa){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbp->query("DELETE FROM caracteristicas WHERE idcaracteristicas = '$idcaracteristica'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("ok", "se elimino exitosamente","eliminarCaracteristica");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    public function getidsucursal($md5)
    {
        $registro = $this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }
}
?>
