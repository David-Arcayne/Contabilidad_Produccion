<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php";

class Reporte_confi extends DB{
    public function registrar_configuracion_reporte($idplandecuenta,$reporte,$nombre_cuenta_superior,$nivel,$grupo,$es_calculable,$es_activo_fijo,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

            if ($idplandecuenta != "" && $reporte != "" && $nivel != "") {
                
                // Insertar el nuevo registro
                $registroProveedor = $this->dbc->query("INSERT INTO configuracion_reporte(idplandecuenta,reporte,nombre_cuenta_superior,nivel_registrado,grupo,es_calculable,es_activo_fijo,idempresa) VALUES ('$idplandecuenta','$reporte','$nombre_cuenta_superior','$nivel','$grupo','$es_calculable','$es_activo_fijo','$idempresa')");
                if ($registroProveedor === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registroCaracteristicas");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            } else {
                $res = array("danger", "No se pudo realizar el registro","Error");
            }
        
        echo json_encode($res);
        
    }
    public function filtro_por_nivel($reporte,$nivel,$grupo,$empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        if($reporte != "" && $nivel > 0){
            // LISTARA EL FILTRO
            $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE reporte = '$reporte' AND nivel_registrado = '$nivel' AND grupo = '$grupo' AND idempresa = '$idempresa'");

        }else{
            // NO LISTARA NADA
            // $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE reporte = '$reporte' AND nivel_registrado = '$nivel' AND idempresa = '$idempresa' ORDER BY iddivisa DESC");
           
        }
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idempresa = '$idempresa' AND nivel_registrado = '$nivel' ORDER BY iddivisa DESC");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $get = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$qwe[idplandecuenta]'");
            $plan = $get->fetch_assoc();
            $res = array(
                "idplandecuenta" => $qwe['idplandecuenta'],
                "nombreplan" => $plan['nombreplan']
                // "nombre" => $qwe['nombre'],
                // "estado" => $qwe['estado']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
     public function filtro_por_nivel_antiguo($reporte,$nivel,$empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        if($reporte != "" && $nivel > 0){
            // LISTARA EL FILTRO
            $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE reporte = '$reporte' AND nivel_registrado = '$nivel' AND idempresa = '$idempresa'");

        }else{
            // NO LISTARA NADA
            // $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE reporte = '$reporte' AND nivel_registrado = '$nivel' AND idempresa = '$idempresa' ORDER BY iddivisa DESC");
           
        }
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idempresa = '$idempresa' AND nivel_registrado = '$nivel' ORDER BY iddivisa DESC");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $get = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$qwe[idplandecuenta]'");
            $plan = $get->fetch_assoc();
            $res = array(
                "idplandecuenta" => $qwe['idplandecuenta'],
                "nombreplan" => $plan['nombreplan']
                // "nombre" => $qwe['nombre'],
                // "estado" => $qwe['estado']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_configuracion_reporte($empresa) {
           ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nivel_registrado = '1' AND idempresa = '$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
        $getPedido = $this->dbc->query("SELECT DISTINCT(reporte) FROM configuracion_reporte WHERE idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO

        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "reporte" => $qwe['reporte'],
                "nivel_1" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
            );
        
        // $get_nivel_2 = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nivel_registrado = '2' AND idempresa = '$idempresa'");// ACTIVO, PASIVO, PATRIMONIO

        $get_nivel_2 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
        while ($qwe2 = $this->dbc->fetch($get_nivel_2)) {
        $cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe2[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
        $nombre_cuenta = $cuenta->fetch_assoc();
            $res2 = array(
                "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                "nivel_2" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
                
            );
            $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
            while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
                $nombre_cuenta2 = $cuenta2->fetch_assoc();
                $res3 = array(
                "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                "nivel_3" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
                );
                 $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                    $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
                    $nombre_cuenta3 = $cuenta3->fetch_assoc();

                    $res4 = array(
                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                    "nivel_4" => [] //activo
                    );
                    $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                        $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
                        $nombre_cuenta4 = $cuenta4->fetch_assoc();

                        $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],    
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "nivel_5" => [] //activo
                        );
                        array_push($res4['nivel_4'], $res5); 
                    }
                    array_push($res3['nivel_3'], $res4); 
                }
               array_push($res2['nivel_2'], $res3); 
            }
            array_push($res['nivel_1'], $res2);
        }
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function reporte_balance_general($fecha_ini,$fecha_fin,$empresa) {
           ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getidgestion($empresa);

        $lista =[];
        $get_nivel_2 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '' AND reporte ='balance_general' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
        $total_pasivo_patrimonio = 0;
        while ($qwe2 = $this->dbc->fetch($get_nivel_2)) {
            $cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe2[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
            $nombre_cuenta = $cuenta->fetch_assoc();
            if($qwe2['grupo'] == '1'){
        // preguntar si la cuenta en la q estamos es activo fijo
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();
                if($nivel_reg['nivel_registrado'] == '3'){

                }elseif($nivel_reg['nivel_registrado'] == '4'){
                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    // ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

                    // }else{

                    // }
                    
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();
                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        // Activo_disponible, exigible, Acciones telefonicas
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                         if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE

                            if($qwe4['es_activo_fijo'] == 'si'){
                              $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe4[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                              $fijo = $get_fijo->fetch_assoc();

                                $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_A = $suma_cuentas_A->fetch_assoc();

                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $diferencia = $valor_A - $valor_B;

                                $suma_nivel_3 = $suma_nivel_3 + $diferencia;
                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],    
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_A['total'],
                                "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4); 

                            }else{
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],    
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor['total'],
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4); 
                            }

                         }else{ //NO ES CALCULABLE

                             $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();
                            // if(es_calculable){

                            // }else{

                            // }
                            $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                            INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                            INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                            where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
                            AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                            $valor = $suma_cuentas->fetch_assoc();
                            $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                            $res5 = array(
                            "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                            "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],    
                            "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                            "valor" => $valor['total'],
                            "nivel_5" => [] //activo   
                            );
                            array_push($res4['nivel_4'], $res5); 
                        }
                        $res4['suma_nivel_4'] = $suma_nivel_4;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        array_push($res3['nivel_3'], $res4); 
                         }
                        
                    }
                        $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
                        array_push($res2['nivel_2'], $res3); 
                    }
                    $res2['suma_nivel_2'] = $suma_nivel_2;
                }
                

            }elseif($qwe2['grupo'] == '2'){ //PASIVO

                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();
                if($nivel_reg['nivel_registrado'] == '3'){
                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "total_pasi_pati" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();
                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                            $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                            INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                            INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                            where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                            AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                            $valor = $suma_cuentas->fetch_assoc();
                            $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                        $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "valor" => $valor['total'],
                        "nivel_4" => [] //activo
                        );
                     
                        array_push($res3['nivel_3'], $res4); 
                    }
                    $res3['suma_nivel_3'] = $suma_nivel_3;
                    // $suma_nivel_3 = $suma_nivel_3 + $res3['suma_nivel_3'];
                    $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
                    array_push($res2['nivel_2'], $res3); 

                    }
                    $res2['suma_nivel_2'] = $suma_nivel_2;
                }
                $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
                $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
                
            }elseif($qwe2['grupo'] == '3'){ //PATRIMONIO
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();
                if($nivel_reg['nivel_registrado'] == '2'){
                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "total_pasi_pati" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();

                    $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                            INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                            INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                            where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta2[idplandecuenta]'
                            AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                            $valor = $suma_cuentas->fetch_assoc();
                            $suma_nivel_2 = $suma_nivel_2 + $valor['total'];

                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "valor" => $valor['total'],
                    "nivel_3" => [] //activo
                    );

                    array_push($res2['nivel_2'], $res3); 
                    }
                    $res2['suma_nivel_2'] = $suma_nivel_2;
                }
                $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
                $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
            }
           array_push($lista, $res2); 
        }     
        // array_push($lista, $res2);
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function editar_divisa($id,$simbolo,$nombre,$empresa) {
        $idempresa = $this->getidempresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND iddivisa != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
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

    public function registrar_vinculacion_depreciacion($idcuenta,$iddepreciacion,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        $idgestion = $this->getidgestion($empresa);

        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO vinculacion_cuenta_depreciacion(idcuenta,idcuenta_depreciacion,idgestion,idempresa) VALUES ('$idcuenta','$iddepreciacion','$idgestion','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }
    public function listar_vinculacion_depreciacion($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM vinculacion_cuenta_depreciacion WHERE idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $vincu = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$qwe[idcuenta]'");
            $res_vincu = $vincu->fetch_assoc();

            $depre = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$qwe[idcuenta_depreciacion]'");
            $res_depre = $depre->fetch_assoc();

            $res = array(
                "id" => $qwe['idvinculacion_cuenta_depreciacion'],
                "idcuenta" => $qwe['idcuenta'],
                "nombre_cuenta" => $res_vincu['nombreplan'],
                "idcuenta_depreciacion" => $qwe['idcuenta_depreciacion'],
                "nombre_depreciacion" => $res_depre['nombreplan']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function editar_vinculacion_depreciacion($id,$simbolo,$nombre,$empresa) {
        $idempresa = $this->getidempresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND iddivisa != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
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

    public function eliminar_vinculacion_depreciacion($id){
        $consulta3 = $this->dbc->query("SELECT * FROM vinculacion_cuenta_depreciacion WHERE idvinculacion_cuenta_depreciacion = '$id'");
        $resultado3 = $consulta3->fetch_assoc();

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM configuracion_reporte WHERE idplandecuenta = '$resultado3[idcuenta]' AND idempresa = '$resultado3[idempresa]'");
        $resultado33 = $consulta->fetch_assoc(); 

        if ($resultado33['total'] > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
        } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbc->query("DELETE FROM vinculacion_cuenta_depreciacion WHERE idvinculacion_cuenta_depreciacion = '$id'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
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
    public function getidgestion($md5){
        $registro=$this->dbc->query("select * from gestion where md5(idempresa)='$md5' and estado='2'");
        $qwe=$this->dbc->fetch($registro);
        return $qwe['idgestion'];
    }

    // public function getgestionactualid($empresa)
    // {

    //     $res = "";
    //     $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
    //     $qwe = $this->dbc->fetch($registro);
    //     //$res=array("id"=>,"nombre"=>$qwe['nombre']); listapagarfactura
    //     return $qwe['idgestion'];
    // }
}
?>
