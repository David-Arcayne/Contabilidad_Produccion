<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; editar

class Reporte_evolucion_patrimonio extends DB{

    private function obtenerGestionAnterior($idgestion_actual) {
            // $idempresa = $this->getidempresa($empresa);
            $lista = [];
        

        $gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion ='$idgestion_actual'");
                $gst = $gestion->fetch_assoc();

        $fechaInicio = new DateTime($gst['fechaini']);
        $fechaAnteriorEsperada = (clone $fechaInicio)->modify('-1 day')->format('Y-m-d');

        $todas_gestiones = $this->dbc->query("SELECT * FROM gestion WHERE idempresa ='$gst[idempresa]'");
        // Buscar la gestión cuya fechafin coincida con la fecha anterior esperada
        $idgestion_anterior = 0;
        while ($qwe = $this->dbc->fetch($todas_gestiones)) {
            if ($qwe['fechafin'] == $fechaAnteriorEsperada) {
                $idgestion_anterior = $qwe['idgestion'];
                // $res = array(
                //     "idgestion_anterior" => $qwe['idgestion'],
                // );
                // array_push($lista, $res);
            }
            
        }
        return $idgestion_anterior;
        // echo json_encode(array()$lista, JSON_NUMERIC_CHECK);
        // echo json_encode(array($idgestion_anterior));
    }

    public function select_patrimonio_gestion_anterior($aux_parametro,$idplantilla_reporte_vinculado_BG,$idcuenta_padre,$idplantilla_reporte) {

    ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        // $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        // $selct_patrimonio = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idgestion ='$gestion_ant' and grupo='3' and nivel ='2'");
    
        if($aux_parametro == "actualizacion_patrimonio"){ // SELECT FUERA DEL ICONO AZUL

            $selct_patrimonio = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplantilla_reporte = '$idplantilla_reporte_vinculado_BG' 
            AND grupo='3' AND  es_calculable ='si'");
            while ($qwe = $this->dbc->fetch($selct_patrimonio)) {
                $existe_act_patrimonio = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idcuenta_patrimonio ='$qwe[idconfiguracion_reporte]'");

                if($existe_act_patrimonio->num_rows > 0){
                    // SALTAR EL REGISTRO QUE YA TENEMOS REGISTRADO EN LA TABLA
                    $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                    WHERE idplandecuenta ='$qwe[idplandecuenta]'");
                    $pl_c = $get_pl_cuenta->fetch_assoc();

                    $res = array(
                        "idconfiguracion_reporte" => $qwe['idconfiguracion_reporte'],
                        "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                        "nombre_actual" => $pl_c['nombreplan'],
                        "en_uso" => "si",
                        // "idgestion" => $qwe['idgestion'],//TALVEZ SE BORRE
                        "idempresa" => $qwe['idempresa']
                    );
                    array_push($lista, $res);
                }else{
                    // ANTES DE IR ALMORZAR ME QUEDE AQUI MODIFICAR LO DE ABAJOOO
                    $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                    WHERE idplandecuenta ='$qwe[idplandecuenta]'");
                    $pl_c = $get_pl_cuenta->fetch_assoc();

                    $res = array(
                        "idconfiguracion_reporte" => $qwe['idconfiguracion_reporte'],
                        "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                        "nombre_actual" => $pl_c['nombreplan'],
                        "en_uso" => "no",
                        // "valor" => $qwe['valor'],//TALVEZ SE QUITE
                        // "idgestion" => $qwe['idgestion'],//TALVEZ SE BORRE
                        "idempresa" => $qwe['idempresa']
                    );
                    array_push($lista, $res);
                }

            }
        }elseif($aux_parametro == "agrupacion_actualizacion_patrimonio"){ // SELECT DENTRO DEL ICONO AZUL
                $ids_excluir = []; // array para guardar los IDs
                $agr_act = $this->dbc->query("SELECT * FROM agrupacion_actualizacion_patrimonio WHERE idcuenta_padre ='$idcuenta_padre'");
                while ($ac = $this->dbc->fetch($agr_act)) {
                    $ids_excluir[] = $ac['idcuenta_patrimonio'];
                }

                // Convertir el array en una cadena separada por comas
                $ids_string = implode(",", $ids_excluir);

                // Si no hay IDs, puedes poner un valor dummy para que no falle el NOT IN
                if (empty($ids_string)) {
                    $ids_string = "0"; 
                }

                // $listar_balance_limitado = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idgestion ='$gestion_ant' and grupo='3' 
                // and nivel ='2' and idbalance_general_por_gestion not in($ids_string)");

                $listar_balance_limitado = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idplantilla_reporte = '$idplantilla_reporte'
                AND idcuenta_patrimonio NOT IN($ids_string)");

// WHERE idplantilla_reporte = '3' AND grupo='3' AND  es_calculable ='si';
                while ($lbl = $this->dbc->fetch($listar_balance_limitado)) {

                $get_confi_reporte = $this->dbc->query("SELECT * FROM configuracion_reporte 
                WHERE idconfiguracion_reporte ='$lbl[idcuenta_patrimonio]'");
                $gcr = $get_confi_reporte->fetch_assoc();

                $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                WHERE idplandecuenta ='$gcr[idplandecuenta]'");
                $pl_c = $get_pl_cuenta->fetch_assoc();
                
                    $res = array(
                    "idactualizacion_patrimonio" => $lbl['idactualizacion_patrimonio'],
                    "idplantilla_reporte" => $lbl['idplantilla_reporte'],
                    "idcuenta_patrimonio" => $lbl['idcuenta_patrimonio'],
                    "nombre_actual" => $pl_c['nombreplan'],
                    // "valor" => $lbl['valor'],
                    // "idgestion" => $lbl['idgestion'],
                    "idempresa" => $lbl['idempresa']
                    );
                    array_push($lista, $res);
                }
            
        }else{ // MOSTRARA TODOS LOS DATOS SIEMPRE

            // $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$idplantilla_reporte_vinculado_BG'");
            // $tpr = $tipo_reporte->fetch_assoc();

            $listar_actuali_patri = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idplantilla_reporte = '$idplantilla_reporte'");

            // $selct_patrimonio = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplantilla_reporte = '$tpr[id_plantilla_reporte]' 
            // AND grupo='3' AND  es_calculable ='si'");
            while ($qwe = $this->dbc->fetch($listar_actuali_patri)) {
                
                $get_confi_reporte = $this->dbc->query("SELECT * FROM configuracion_reporte 
                WHERE idconfiguracion_reporte ='$qwe[idcuenta_patrimonio]'");
                $gcr = $get_confi_reporte->fetch_assoc();

                $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                WHERE idplandecuenta ='$gcr[idplandecuenta]'");
                $pl_c = $get_pl_cuenta->fetch_assoc();

                    // $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                    // WHERE idplandecuenta ='$qwe[idplandecuenta]'");
                    // $pl_c = $get_pl_cuenta->fetch_assoc();

                    $res = array(
                        "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
                        "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                        "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'],
                        "nombre_actual" => $pl_c['nombreplan'],
                        // "valor" => $qwe['valor'],//TALVEZ SE QUITE
                        // "idgestion" => $qwe['idgestion'],//TALVEZ SE BORRE
                        "idempresa" => $qwe['idempresa']
                    );
                    array_push($lista, $res);
                

            }
        }
        
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_actualizacion_patrimonio($idplantilla_reporte,$idcuenta_patrimonio,$calculo_actualizacion,$orden,$idgestion,$empresa){//ESTA API SERA PARA EL REGISTRO DE LA PLANTILLA DE ACTUALIZACION PATRIMONIO
        // $idempresa = Empresa::getidempresa($empresa);
         ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $idempresa = $this->getidempresa($empresa);
       
        if($orden == ""){
            $get_act_patr = $this->dbc->query("SELECT COUNT(*) AS total FROM actualizacion_patrimonio WHERE idempresa = '$idempresa'");
            $total_registro = $get_act_patr->fetch_assoc();
            $orden_nuevo = $total_registro['total'] + 1;

            //EL CAMPO idcuenta_patrimonio SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_general_por_gestion
            $registro_actualizacion = $this->dbc->query("INSERT INTO actualizacion_patrimonio(idplantilla_reporte,idcuenta_patrimonio,calculo_actualizacion,orden,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$idcuenta_patrimonio','$calculo_actualizacion','$orden_nuevo','$idgestion','$idempresa')");

        }else{
            //EL CAMPO idcuenta_patrimonio SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_general_por_gestion
            $registro_actualizacion = $this->dbc->query("INSERT INTO actualizacion_patrimonio(idplantilla_reporte,idcuenta_patrimonio,calculo_actualizacion,orden,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$idcuenta_patrimonio','$calculo_actualizacion','$orden','$idgestion','$idempresa')");
        }   
        

        if ($registro_actualizacion === TRUE){                                                                                                                                                                
            // $res = array("success", "Registro exitoso","registroCaracteristicas");
            $res = array(
                "success" => true,
                "message" => "Registro exitoso",
                "message_code"   => "registro_exitoso"
            );
        }else {
                // $res = array("danger", "No se pudo registrar");
            $res = array(
                "success" => false,
                "message" => "Ocurrio un error",
                "message_code"   => "error_registro"
            );
        }
        
        echo json_encode($res);
        
    }

    public function listar_planilla_actualizacion_patrimonio($idplantilla_reporte,$empresa) {

    $idempresa = $this->getidempresa($empresa);
        $lista = [];
        // $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        $list_act_patr = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idplantilla_reporte ='$idplantilla_reporte' AND idempresa ='$idempresa'");
    
        while ($qwe = $this->dbc->fetch($list_act_patr)) {

            $get_balance = $this->dbc->query("SELECT * FROM configuracion_reporte 
            WHERE idconfiguracion_reporte ='$qwe[idcuenta_patrimonio]'");
            $gb = $get_balance->fetch_assoc();

            $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
            WHERE idplandecuenta ='$gb[idplandecuenta]'");
            $pl_c = $get_pl_cuenta->fetch_assoc();

            $res = array(
                "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
                "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'], //ESTE CAMPO SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_genereal_por_gestion
                "orden" => $qwe['orden'],
                "nombre" => $pl_c['nombreplan']
            );
            array_push($lista, $res);
        }

        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_operacion_actualizacion_patrimonio($idplantilla_reporte,$idactualizacion_patrimonio,$idcuenta_patrimonio,$columna_obtenido,$operacion,$idcuenta_padre,$idgestion,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa);
        
            // Insertar el nuevo registro
            //EL idcuenta_patrimonio es EL idactualizacion_patrimonio 
            $registroProveedor = $this->dbc->query("INSERT INTO agrupacion_actualizacion_patrimonio(idplantilla_reporte,idact_patrimonio_referencia,idcuenta_patrimonio,columna_obtenido,operacion,idcuenta_padre,registro_desde,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$idactualizacion_patrimonio','$idcuenta_patrimonio','$columna_obtenido','$operacion','$idcuenta_padre','actualizacion_patrimonio','$idgestion','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                // $res = array("success", "Registro exitoso","registroCaracteristicas");

                $res = array(
                        "success" => true,
                        "message" => "Registro exitoso",
                        "message_code"   => "registro_exitoso"
                    );
                
            } else {
                // $res = array("danger", "No se pudo registrar");
                $res = array(
                        "success" => false,
                        "message" => "Ocurrio un error",
                        "message_code"   => "error_registro"
                    );
            }
        
        echo json_encode($res);
        
    }

    public function listar_operacion_actualizacion_patrimonio($idactualizacion_patri) {

    // $idempresa = $this->getidempresa($empresa);
        $lista = [];
        // $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        $list_agr_act = $this->dbc->query("SELECT * FROM agrupacion_actualizacion_patrimonio WHERE idcuenta_padre ='$idactualizacion_patri'");
    
        while ($qwe = $this->dbc->fetch($list_agr_act)) {

            $get_balance = $this->dbc->query("SELECT * FROM configuracion_reporte 
            WHERE idconfiguracion_reporte ='$qwe[idcuenta_patrimonio]'");
            $gb = $get_balance->fetch_assoc();

            $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
            WHERE idplandecuenta ='$gb[idplandecuenta]'");
            $pl_c = $get_pl_cuenta->fetch_assoc();

            $gb = $get_balance->fetch_assoc();
            $res = array(
                "idagrupacion_actualizacion_patrimonio" => $qwe['idagrupacion_actualizacion_patrimonio'],
                "operacion" => $qwe['operacion'],
                "columna_obtenido" => $qwe['columna_obtenido'], //ESTE CAMPO SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_genereal_por_gestion
                "nombre" => $pl_c['nombreplan']
            );
            array_push($lista, $res);
        }

        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function eliminar_operacion_actualizacion_patrimonio($id_agru_patr){

                // Insertar el nuevo registro
                $eliminar_agru_patr = $this->dbc->query("DELETE FROM agrupacion_actualizacion_patrimonio WHERE idagrupacion_actualizacion_patrimonio = '$id_agru_patr'");
                if ($eliminar_agru_patr === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            
            echo json_encode($res);
    }

    // public function reporte_actualizacion_patrimonio($fecha_tc_1,$fecha_tc_2,$empresa,$idgestion_actual) {

    //     $lista = [];
    //     $lista2 = [];
    //     $idempresa = $this->getidempresa($empresa);
    
    //     $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
    //     // Preparar la consulta
    //     $get_act_patr = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idempresa = '$idempresa' ORDER BY orden ASC");
    
    //     $fech_tipo_cambio_1 = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa' AND fecha = '$fecha_tc_1'");
    //     $ftc_1 = $this->dbc->fetch($fech_tipo_cambio_1);

    //     $fech_tipo_cambio_2 = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa' AND fecha = '$fecha_tc_2'");
    //     $ftc_2 = $this->dbc->fetch($fech_tipo_cambio_2);

    //     if($fech_tipo_cambio_1->num_rows > 0 && $fech_tipo_cambio_2->num_rows > 0){
    //         while ($qwe = $this->dbc->fetch($get_act_patr)) {

    //             $bg_pg = $this->dbc->query("SELECT * FROM balance_general_por_gestion 
    //             WHERE idconfiguracion_reporte = '$qwe[idcuenta_patrimonio]' AND idgestion='$gestion_ant'");
    //             $bg_aux = $this->dbc->fetch($bg_pg);
                
    //             // $bg_pg = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idbalance_general_por_gestion = '$qwe[idcuenta_patrimonio]'");
    //             // $bg_aux = $this->dbc->fetch($bg_pg);

    //             if($qwe['calculo_actualizacion'] == 'no'){
    //                 $res = array(
    //                     "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
    //                     "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'],
    //                     "nombre" => $bg_aux['nombre_actual'],
    //                     "valor" => $bg_aux['valor'],
    //                     "actualizacion" => 0
    //                     // "total" => $qwe['estado']
    //                 );
    //             }else{

    //                     $div_tc = $ftc_2['ufv']/$ftc_1['ufv'];
    //                     $multipli_tc = $div_tc - 1;
    //                     $actualizacion = $bg_aux['valor'] * $multipli_tc;

    //                     $res = array(
    //                         "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
    //                         "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'],
    //                         "nombre" => $bg_aux['nombre_actual'],
    //                         "valor" => $bg_aux['valor'],
    //                         "actualizacion" => $actualizacion
    //                         // "total" => $qwe['estado']
    //                     );
                    
    //                     // $res = array("danger", "No existen esas fechas en el tipo de cambio");
                
    //             }
                
    //             array_push($lista, $res);
    //         }

    //     foreach ($lista as $item) {
    //         $agru_act_patr = $this->dbc->query("SELECT * FROM agrupacion_actualizacion_patrimonio WHERE idcuenta_padre = '$item[idactualizacion_patrimonio]'");
    //         // $acp = $this->dbc->fetch($agru_act_patr);

    //         $suma = 0;
    //         while ($acp = $this->dbc->fetch($agru_act_patr)) {
    //             // $bal_gen_gest = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idbalance_general_por_gestion = '$acp[idcuenta_patrimonio]'");
    //             // $bgg = $this->dbc->fetch($bal_gen_gest);
    //             if($acp['columna_obtenido'] == "valor"){
    //                 foreach ($lista as $item_aux) {
    //                     if ($item_aux['idcuenta_patrimonio'] == $acp['idcuenta_patrimonio']) {
                            
    //                         $suma = $suma + $item_aux['valor'];
    //                         break; // detener el bucle al encontrarlo
    //                     }
    //                 }

    //                 // $suma = $suma + $bgg['valor'];
    //             }elseif($acp['columna_obtenido'] == "actualizacion"){
    //                 foreach ($lista as $item_aux) {
    //                     if ($item_aux['idcuenta_patrimonio'] == $acp['idcuenta_patrimonio']) {
                            
    //                         $suma = $suma + $item_aux['actualizacion'];
    //                         break; // detener el bucle al encontrarlo
    //                     }
    //                 }
                    
    //             }else{ // VALOR_ACTUALIZACION
    //                 foreach ($lista as $item_aux) {
    //                     if ($item_aux['idcuenta_patrimonio'] == $acp['idcuenta_patrimonio']) {
                            
    //                         $suma = $suma + $item_aux['actualizacion'] + $item_aux['valor'];
    //                         break; // detener el bucle al encontrarlo
    //                     }
    //                 }
    //             }
            
    //         }
    //         // $id = $item['idactualizacion_patrimonio'];
    //         $res2 = array(
    //             "idactualizacion_patrimonio" => $item['idactualizacion_patrimonio'],
    //             "nombre" => $item['nombre'],
    //             "valor" => $item['valor'],
    //             "actualizacion" => $item['actualizacion'],
    //             "total" => $suma
    //         );
    //         array_push($lista2, $res2);
    //     }
    // }else{
    //         $lista2 = array("danger", "No existen esas fechas en el tipo de cambio");
    //         // array_push($lista2, $res2);
            
    // }

    //     echo json_encode($lista2, JSON_NUMERIC_CHECK);
    // }

    public function reporte_actualizacion_patrimonio($data) {
        // ini_set('display_errors', 1); 
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

        $lista = [];
        $lista2 = [];
        $idempresa = $this->getidempresa($data['empresa']);
    
        // $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        // Preparar la consulta
        // $get_act_patr = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idempresa = '$idempresa' ORDER BY orden ASC");
    
        foreach($data['actualizacion_patrimonios'] as $act_patr){

            $calcular_valor = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' 
#                                 and t.idgestion = '76' 
                                and p.idplandecuenta = '$act_patr[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = '2' AND t.fechatransaccion>='$act_patr[fecha_ini]' 
                                AND t.fechatransaccion<='$act_patr[fecha_fin]'");
            
            $valor = $calcular_valor->fetch_assoc();

            if($act_patr['visualizar'] == "si"){
                if($act_patr['calculo_actualizacion'] == 'no'){
                    $res = array(
                        "idactualizacion_patrimonio" => $act_patr['idactualizacion_patrimonio'],
                        "idcuenta_patrimonio" => $act_patr['idconfiguracion_reporte'],
                        "nombre" => $act_patr['nombre'],
                        "valor" => $valor['total'],
                        "actualizacion" => 0,
                        "orden" => $act_patr['orden'],
                        "idplantilla_reporte" => $act_patr['idplantilla_reporte'],
                        "detalle" => $act_patr['detalle']
                        // "total" => $qwe['estado']
                    );
                }else{

                        $fech_tipo_cambio_1 = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa' AND fecha = '$act_patr[fecha_ini]'");
                        $ftc_1 = $this->dbc->fetch($fech_tipo_cambio_1);

                        $fech_tipo_cambio_2 = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa' AND fecha = '$act_patr[fecha_fin]'");
                        $ftc_2 = $this->dbc->fetch($fech_tipo_cambio_2);

                        // if($fech_tipo_cambio_1->num_rows > 0 && $fech_tipo_cambio_2->num_rows > 0){

                        // }
                        $div_tc = $ftc_2['ufv'] / $ftc_1['ufv'];
                        $multipli_tc = $div_tc - 1;
                        $actualizacion = $valor['total'] * $multipli_tc;

                        $res = array(
                            "idactualizacion_patrimonio" => $act_patr['idactualizacion_patrimonio'],
                            "idcuenta_patrimonio" => $act_patr['idconfiguracion_reporte'],
                            "nombre" => $act_patr['nombre'],
                            "valor" => $valor['total'],
                            "actualizacion" => $actualizacion,
                            "orden" => $act_patr['orden'],
                            "idplantilla_reporte" => $act_patr['idplantilla_reporte'],
                            "detalle" => $act_patr['detalle']
                                // "total" => $qwe['estado']
                        );
                        
                            // $res = array("danger", "No existen esas fechas en el tipo de cambio");
                    
                }
                array_push($lista, $res);
            }
                
        }

        foreach ($lista as $item) {
            
            $suma = 0;
            foreach ($item['detalle'] as $detalle) {
                if($detalle['columna_obtenido'] == "valor"){
                    if($detalle['visualizar'] == "si"){
                        foreach ($lista as $item_aux) {
                            if ($item_aux['idcuenta_patrimonio'] == $detalle['idcuenta_patrimonio'] && $item_aux['idactualizacion_patrimonio'] == $detalle['idact_patrimonio_referencia']) { // TAMBIEN IGUALAR item_aux[idactualizacion_patrimonio] == acp[idcuenta_padre]
                                
                                $suma = $suma + $item_aux['valor'];
                                break; // detener el bucle al encontrarlo
                            }
                        }
                    }else{

                    }

                    // $suma = $suma + $bgg['valor'];
                }elseif($detalle['columna_obtenido'] == "actualizacion"){
                    // foreach ($lista as $item_aux) {
                    //     if ($item_aux['idcuenta_patrimonio'] == $detalle['idcuenta_patrimonio'] && $item_aux['idactualizacion_patrimonio'] == $detalle['idact_patrimonio_referencia']) {
                            
                    //         $suma = $suma + $item_aux['actualizacion'];
                    //         break; // detener el bucle al encontrarlo
                    //     }
                    // }
                    if($detalle['visualizar'] == "si"){
                        foreach ($lista as $item_aux) {
                        if ($item_aux['idcuenta_patrimonio'] == $detalle['idcuenta_patrimonio'] && $item_aux['idactualizacion_patrimonio'] == $detalle['idact_patrimonio_referencia']) {
                            
                            $suma = $suma + $item_aux['actualizacion'];
                            break; // detener el bucle al encontrarlo
                        }
                    }
                    }else{

                    }
                    
                }else{ // VALOR_ACTUALIZACION
                    // foreach ($lista as $item_aux) {
                    //     if ($item_aux['idcuenta_patrimonio'] == $detalle['idcuenta_patrimonio'] && $item_aux['idactualizacion_patrimonio'] == $detalle['idact_patrimonio_referencia']) {
                            
                    //         $suma = $suma + $item_aux['actualizacion'] + $item_aux['valor'];
                    //         break; // detener el bucle al encontrarlo
                    //     }
                    // }
                    if($detalle['visualizar'] == "si"){
                        foreach ($lista as $item_aux) {
                        if ($item_aux['idcuenta_patrimonio'] == $detalle['idcuenta_patrimonio'] && $item_aux['idactualizacion_patrimonio'] == $detalle['idact_patrimonio_referencia']) {
                            
                            $suma = $suma + $item_aux['actualizacion'] + $item_aux['valor'];
                            break; // detener el bucle al encontrarlo
                        }
                    }
                    }else{

                    }
                }
            }
           
            $res2 = array(
                "idactualizacion_patrimonio" => $item['idactualizacion_patrimonio'],
                "nombre" => $item['nombre'],
                "valor" => $item['valor'],
                "actualizacion" => $item['actualizacion'],
                "total" => $suma,
                "orden" => $item['orden'],
                "idplantilla_reporte" => $item['idplantilla_reporte']
            );
            array_push($lista2, $res2);
        }

        echo json_encode($lista2, JSON_NUMERIC_CHECK);
    }

    public function guardar_actualizacion_patrimonio_por_gestion($data) {
         ini_set('display_errors', 1); 
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);

        // Decodificar el JSON a un array asociativo
        $idempresa = $this->getidempresa($data['empresa']);
        $idgestion = $data['idgestion'];

        $existe_act_por_gesti = $this->dbc->query("SELECT * FROM actualizacion_patrimonio_por_gestion WHERE idgestion = '$data[idgestion]'");


        if($existe_act_por_gesti->num_rows > 0){
            $res = array("danger", "ya existen registros en esta gestion", "registroCaracteristicas");
        }else{

            foreach ($data['contenido'] as $item) {
                $guardar_patrimonio = $this->dbc->query("INSERT INTO actualizacion_patrimonio_por_gestion(idplantilla_reporte,idactualizacion_patrimonio,nombre,valor,actualizacion,total,orden,idgestion,idempresa) 
                VALUES ('$item[idplantilla_reporte]','$item[idactualizacion_patrimonio]','$item[nombre]','$item[valor]','$item[actualizacion]','$item[total]','$item[orden]','$idgestion','$idempresa')");
            }
             $res = array(
                "success",
                "Registro exitoso",
                "registroCaracteristicas"
            );
        }
        echo json_encode($res);
    }

    public function eliminar_actualizacion_patrimonio($id){

        $consulta = $this->dbc->query("SELECT * FROM agrupacion_actualizacion_patrimonio WHERE idcuenta_padre = '$id'");

            if ($consulta->num_rows > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros dentro","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbc->query("DELETE FROM actualizacion_patrimonio WHERE idactualizacion_patrimonio = '$id'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }

        public function registrar_estado_evolucion_patrimonio($idplantilla_reporte,$nombre_personalizado,$orden,$empresa){//ESTA API SERA PARA EL REGISTRO DE LA PLANTILLA DE ACTUALIZACION PATRIMONIO
        // $idempresa = Empresa::getidempresa($empresa);
         ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $idempresa = $this->getidempresa($empresa);
       
        if($orden == ""){
            $get_act_patr = $this->dbc->query("SELECT COUNT(*) AS total FROM estado_ev_patrimonio WHERE idempresa = '$idempresa'");
            $total_registro = $get_act_patr->fetch_assoc();
            $orden_nuevo = $total_registro['total'] + 1;

            //EL CAMPO idcuenta_patrimonio SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_general_por_gestion
            $registro_actualizacion = $this->dbc->query("INSERT INTO estado_ev_patrimonio(idplantilla_reporte,nombre_personalizado,orden,idempresa) 
            VALUES ('$idplantilla_reporte','$nombre_personalizado','$orden_nuevo','$idempresa')");

        }else{
            //EL CAMPO idcuenta_patrimonio SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_general_por_gestion
            $registro_actualizacion = $this->dbc->query("INSERT INTO estado_ev_patrimonio(idplantilla_reporte,nombre_personalizado,orden,idempresa) 
            VALUES ('$idplantilla_reporte','$nombre_personalizado','$orden','$idempresa')");
        }   
        

        if ($registro_actualizacion === TRUE){                                                                                                                                                                
            // $res = array("success", "Registro exitoso","registroCaracteristicas");
            $res = array(
                "success" => true,
                "message" => "Registro exitoso",
                "message_code"   => "registro_exitoso"
            );
        }else {
                // $res = array("danger", "No se pudo registrar");
            $res = array(
                "success" => false,
                "message" => "Ocurrio un error",
                "message_code"   => "error_registro"
            );
        }
        
        echo json_encode($res);
        
    }

    
    public function registrar_operacion_estado_ev_patrimonio($idplantilla,$idestado_ev_patr,$columna_registro,$obtiene_desde_planti,$idplantilla_cuenta,$columna_obtiene,$empresa){
        ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
       
            // Insertar el nuevo registro
            //EL idcuenta_patrimonio es EL idactualizacion_patrimonio 
            $registroProveedor = $this->dbc->query("INSERT INTO agrupacion_estado_ev_patrimonio(idplantilla_reporte,idestado_ev_patrimonio,columna_registro,obtiene_desde_plantilla,idplantilla_cuenta,columna_obtiene,idempresa) 
            VALUES ('$idplantilla','$idestado_ev_patr','$columna_registro','$obtiene_desde_planti','$idplantilla_cuenta','$columna_obtiene','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                // $res = array("success", "Registro exitoso","registroCaracteristicas");

                $res = array(
                        "success" => true,
                        "message" => "Registro exitoso",
                        "message_code"   => "registro_exitoso"
                    );
                
            } else {
                // $res = array("danger", "No se pudo registrar");
                $res = array(
                        "success" => false,
                        "message" => "Ocurrio un error",
                        "message_code"   => "error_registro"
                    );
            }
        
        echo json_encode($res);
        
    }

    public function listar_cuadro_auxiliar_para_editar($idplantilla_reporte) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_act_patrim = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idplantilla_reporte = '$idplantilla_reporte'");
    
        while ($qwe = $this->dbc->fetch($get_act_patrim)) {

            $detalle = [];

            $transdeta = $this->dbc->query("SELECT * FROM agrupacion_actualizacion_patrimonio where idcuenta_padre='$qwe[idactualizacion_patrimonio]'");

            while ($qq = $this->dbc->fetch($transdeta)) {
                $get_confi_reporte_dt = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$qq[idcuenta_patrimonio]'");
                $cr_dt = $get_confi_reporte_dt->fetch_assoc();

                $get_plan_cuenta_dt = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$cr_dt[idplandecuenta]'");
                $pc_dt = $get_plan_cuenta_dt->fetch_assoc();

                $ress = array("idagrupacion_actualizacion_patrimonio" => $qq['idagrupacion_actualizacion_patrimonio'], 
                "idplantilla_reporte" => $qq['idplantilla_reporte'], "idcuenta_patrimonio" => $qq['idcuenta_patrimonio'],
                 "columna_obtenido" => $qq['columna_obtenido'], "operacion" => $qq['operacion'],
                  "idcuenta_padre" => $qq['idcuenta_padre'],"nombre" => $pc_dt['nombreplan'],"idact_patrimonio_referencia" => $qq['idact_patrimonio_referencia'],
                  "registro_desde" => $qq['registro_desde']);
                array_push($detalle, $ress);
            }

            $get_confi_reporte = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$qwe[idcuenta_patrimonio]'");
            $cr = $get_confi_reporte->fetch_assoc();

            $get_plan_cuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$cr[idplandecuenta]'");
            $pc = $get_plan_cuenta->fetch_assoc();

            $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$qwe[idplantilla_reporte]'");
            $t_r = $tipo_reporte->fetch_assoc();

            $res = array(
                "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
                "calculo_actualizacion" => $qwe['calculo_actualizacion'],
                "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                "orden" => $qwe['orden'],
                "idconfiguracion_reporte" => $cr['idconfiguracion_reporte'],
                "idplandecuenta" => $pc['idplandecuenta'],
                "nombre" => $pc['nombreplan'],
                "idplantilla_referencia" => $t_r['id_plantilla_reporte'],
                "detalle" => $detalle
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function select_patrimonio_columnas_mostrar($idpl_repor_est_ev_patr) {

        ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        // $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        // $selct_patrimonio = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idgestion ='$gestion_ant' and grupo='3' and nivel ='2'");

            $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$idpl_repor_est_ev_patr'");
            $tip_rp = $tipo_reporte->fetch_assoc();

            $act_patr = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$tip_rp[id_plantilla_reporte]'");
            $ap = $act_patr->fetch_assoc();

            $selct_patrimonio = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplantilla_reporte = '$ap[id_plantilla_reporte]' 
            AND grupo='3' AND  es_calculable ='si'");
            while ($qwe = $this->dbc->fetch($selct_patrimonio)) {
                $existe_act_patrimonio = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idcuenta_patrimonio ='$qwe[idconfiguracion_reporte]'");

                $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                    WHERE idplandecuenta ='$qwe[idplandecuenta]'");
                    $pl_c = $get_pl_cuenta->fetch_assoc();

                    $res = array(
                        "idconfiguracion_reporte" => $qwe['idconfiguracion_reporte'],
                        "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                        "nombre_actual" => $pl_c['nombreplan'],
                        // "en_uso" => "no",
                        // "valor" => $qwe['valor'],//TALVEZ SE QUITE
                        // "idgestion" => $qwe['idgestion'],//TALVEZ SE BORRE
                        "idempresa" => $qwe['idempresa']
                    );
                    array_push($lista, $res);

            }
        
        
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_tipo_reporte_actualizacion_patrimonio($id_estado_evol) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        $estado_ev = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$id_estado_evol'");
        $ev = $this->dbe->fetch($estado_ev);
        // Preparar la consulta
        $act_patr = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$ev[id_plantilla_reporte]'");
        $ap = $this->dbe->fetch($act_patr);

            $res = array(
                "idtipo_reportes" => $ap['idtipo_reportes'],
                "nombre" => $ap['nombre'],
                "descripcion" => $ap['descripcion'],
                "tipo_reporte" => $ap['tipo_reporte'],
                "id_plantilla_reporte" => $ap['id_plantilla_reporte'],
                "nombre_tipo_reporte_referencia" => $ap['nombre_tipo_reporte_referencia'],
                "estado" => $ap['estado']
            );
            array_push($lista, $res);
        
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_actualizacion_patrimonio_guardados($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_act_patr = $this->dbc->query("SELECT DISTINCT(idgestion) FROM actualizacion_patrimonio_por_gestion WHERE idempresa ='$idempresa'");
    
        while ($qwe = $this->dbc->fetch($get_act_patr)) {

            $gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion ='$qwe[idgestion]'");
            $gst = $gestion->fetch_assoc();

            $bl_gest = $this->dbc->query("SELECT * FROM actualizacion_patrimonio_por_gestion WHERE idgestion ='$qwe[idgestion]' LIMIT 1");
            $bl_g = $bl_gest->fetch_assoc();
            
            $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes ='$bl_g[idplantilla_reporte]'");
            $tp_rep = $tipo_reporte->fetch_assoc();

            $res = array(
                // "idconfi_reporte_flujo_efectivo" => $qwe['idconfi_reporte_flujo_efectivo'],
                "idgestion" => $gst['idgestion'],
                "nombre_gestion" => $gst['nombre'],
                "fecha_ini" => $gst['fechaini'],
                "fecha_fin" => $gst['fechafin'],
                "nombre_plantilla" => $tp_rep['nombre'],
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_actualizacion_patrimonio_completo_icono($idgestion) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_act_patr_guardado = $this->dbc->query("SELECT * FROM actualizacion_patrimonio_por_gestion WHERE idgestion = '$idgestion'");
    
        while ($qwe = $this->dbc->fetch($get_act_patr_guardado)) {
            $res = array(
                "idactualizacion_patrimonio_por_gestion" => $qwe['idactualizacion_patrimonio_por_gestion'],
                "nombre" => $qwe['nombre'],
                "valor" => $qwe['valor'],
                "actualizacion" => $qwe['actualizacion'],
                "total" => $qwe['total'],
                "orden" => $qwe['orden']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_actualizacion_patrimonio_por_plantilla($idplantilla_reporte) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_act_patr_guardado = $this->dbc->query("SELECT * FROM actualizacion_patrimonio_por_gestion WHERE idplantilla_reporte = '$idplantilla_reporte'");
    
        while ($qwe = $this->dbc->fetch($get_act_patr_guardado)) {
            $res = array(
                "idactualizacion_patrimonio_por_gestion" => $qwe['idactualizacion_patrimonio_por_gestion'],
                "nombre" => $qwe['nombre'],
                "valor" => $qwe['valor'],
                "actualizacion" => $qwe['actualizacion'],
                "total" => $qwe['total'],
                "orden" => $qwe['orden']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_evolucion_patrimonio($idplantilla_reporte) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_evo_patr = $this->dbc->query("SELECT * FROM estado_ev_patrimonio WHERE idplantilla_reporte = '$idplantilla_reporte'");
    
        if($get_evo_patr->num_rows > 0){
            while ($qwe = $this->dbc->fetch($get_evo_patr)) {
                $res = array(
                    "idestado_ev_patrimonio" => $qwe['idestado_ev_patrimonio'],
                    "nombre_personalizado" => $qwe['nombre_personalizado'],
                    "orden" => $qwe['orden']
                );
                array_push($lista, $res);
            }
        }else{
            //SALTAR PORQUE LA LISTA ESTARA VACIA
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

    // public function reporte_evaluacion_patrimonio($idgestion,$idplantilla_reporte) {
    //         $lista = [];
        
    //         // Preparar la consulta
    //         $reporte_ev_patrimonio = $this->dbc->query("SELECT * FROM estado_ev_patrimonio WHERE idplantilla_reporte = '$idplantilla_reporte'");
        
    //         $columnas_mostrar = $this->dbc->query("SELECT * FROM actualizacion_patrimonio_por_gestion WHERE idgestion = '$idgestion'");

    //         $campos = [];
    //         while ($col = $this->dbc->fetch($columnas_mostrar)) {
    //             $campos[] = $col['nombre']; // aquí guardas los nombres de columnas
    //         }

    //         while ($qwe = $this->dbc->fetch($reporte_ev_patrimonio)) {

    //             $res = [];
    //             foreach ($campos as $c) {
    //                 // if (isset($qwe[$c])) {
    //                 //     $res[$c] = $qwe[$c];
    //                 // }
    //                 $res[$c] = $qwe[$c];
    //                 // $res['nombre'] = "";
    //             }
    //             $res['nombre'] = $qwe['nombre_personalizado']; // AQUI VA EL NOMBRE PERSONALIZADO

                
    //             $agr_ev_patri = $this->dbc->query("SELECT * FROM agrupacion_estado_ev_patrimonio WHERE idestado_ev_patrimonio = '$qwe[idestado_ev_patrimonio]'");
    //             while ($agr = $this->dbc->fetch($agr_ev_patri)) {
    //                 $columna = $agr['columna_registro']; // ej: "ajuste capital"
    //                 $valor   = $agr['valor'];            // ej: 100
    //                 $res[$columna] = $valor;             // lo insertas en el array con esa clave
    //             }
    //             $lista[] = $res;
    //         }
        
    //         echo json_encode($lista, JSON_NUMERIC_CHECK);
    // }
    public function reporte_evaluacion_patrimonio($idgestion,$idplantilla_reporte) {
    $lista = [];

    // Consulta principal
    $reporte_ev_patrimonio = $this->dbc->query("SELECT * FROM estado_ev_patrimonio WHERE idplantilla_reporte = '$idplantilla_reporte'");

    // Consulta de columnas a mostrar
    $columnas_mostrar = $this->dbc->query("SELECT * FROM actualizacion_patrimonio_por_gestion WHERE idgestion = '$idgestion'");
    $campos = [];
    while ($col = $this->dbc->fetch($columnas_mostrar)) {
        $campos[] = trim($col['nombre']); // nombres de columnas a mostrar
    }

    while ($qwe = $this->dbc->fetch($reporte_ev_patrimonio)) {
        $res = [];

        // Nombre personalizado
        $res['nombre'] = $qwe['nombre_personalizado'];

        // Inicializar columnas en null para que aparezcan aunque no tengan valor
        foreach ($campos as $c) {
            $res[$c] = null;
        }

        // Insertar valores reales desde agrupacion_estado_ev_patrimonio
        $agr_ev_patri = $this->dbc->query("SELECT * FROM agrupacion_estado_ev_patrimonio WHERE idestado_ev_patrimonio = '$qwe[idestado_ev_patrimonio]'");
        while ($agr = $this->dbc->fetch($agr_ev_patri)) {
            $columna = trim($agr['columna_registro']); // ej: "Capital Social"
            $valor   = $agr['valor'];                  // ej: 100
            $res[$columna] = $valor;                   // sobreescribe el null con el valor real
        }

        $lista[] = $res;
    }
    $this->dbc->close();
    echo json_encode($lista, JSON_NUMERIC_CHECK);
}

public function listar_tipo_reportes_select_ev_patrimonio($empresa) {
        $idempresa = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idempresa='$idempresa'");
    
        while ($row = $this->dbc->fetch($registro)) {

                $get_tipo_report = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes='$row[id_plantilla_reporte]'");
                $tr = $get_tipo_report->fetch_assoc();

                if($row['tipo_reporte'] == 'estado_evolucion_patrimonio'){
                    $act_patr = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes='$tr[id_plantilla_reporte]'");
                    $ap = $act_patr->fetch_assoc();

                    $lista[] = [
                        "idtipo_reportes" => $row['idtipo_reportes'],
                        "nombre"=>$row['nombre'],
                        "descripcion" => $row['descripcion'],
                        "tipo_reporte" => $row['tipo_reporte'],
                        "id_plantilla_reporte" => $row['id_plantilla_reporte'],
                        "nombre_tipo_reporte_referencia" => $ap['nombre'],
                        "estado" => $row['estado']
                    ];
                }else{
                    $lista[] = [
                        "idtipo_reportes" => $row['idtipo_reportes'],
                        "nombre"=>$row['nombre'],
                        "descripcion" => $row['descripcion'],
                        "tipo_reporte" => $row['tipo_reporte'],
                        "id_plantilla_reporte" => $row['id_plantilla_reporte'],
                        "nombre_tipo_reporte_referencia" => $tr['nombre'],
                        "estado" => $row['estado']
                    ];
                }
            
        
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }


}



?>