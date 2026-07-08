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

    public function select_patrimonio_gestion_anterior($idgestion_actual) {

        $lista = [];
        $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        $selct_patrimonio = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idgestion ='$gestion_ant' and grupo='3' and nivel ='2'");
    
        while ($qwe = $this->dbc->fetch($selct_patrimonio)) {
            $existe_act_patrimonio = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idcuenta_patrimonio ='$qwe[idbalance_general_por_gestion]'");

            if($existe_act_patrimonio->num_rows > 0){
                // SALTAR EL REGISTRO QUE YA TENEMOS REGISTRADO EN LA TABLA
            }else{
                $res = array(
                "idbalance_general_por_gestion" => $qwe['idbalance_general_por_gestion'],
                "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                "nombre_actual" => $qwe['nombre_actual'],
                "valor" => $qwe['valor'],
                "idgestion" => $qwe['idgestion'],
                "idempresa" => $qwe['idempresa']
                );
                array_push($lista, $res);
            }

        }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_actualizacion_patrimonio($idplantilla_reporte,$idcuenta_patrimonio,$orden,$idgestion,$empresa){//ESTA API SERA PARA EL REGISTRO DE LA PLANTILLA DE ACTUALIZACION PATRIMONIO
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
            $registro_actualizacion = $this->dbc->query("INSERT INTO actualizacion_patrimonio(idplantilla_reporte,idcuenta_patrimonio,orden,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$idcuenta_patrimonio','$orden_nuevo','$idgestion','$idempresa')");

        }else{
            //EL CAMPO idcuenta_patrimonio SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_general_por_gestion
            $registro_actualizacion = $this->dbc->query("INSERT INTO actualizacion_patrimonio(idplantilla_reporte,idcuenta_patrimonio,orden,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$idcuenta_patrimonio','$orden','$idgestion','$idempresa')");
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

            $get_balance = $this->dbc->query("SELECT * FROM balance_general_por_gestion 
            WHERE idbalance_general_por_gestion ='$qwe[idcuenta_patrimonio]'");
            $gb = $get_balance->fetch_assoc();
            $res = array(
                "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
                "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'], //ESTE CAMPO SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_genereal_por_gestion
                "orden" => $qwe['orden'],
                "nombre" => $gb['nombre_actual']
            );
            array_push($lista, $res);
        }

        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_operacion_actualizacion_patrimonio($idcuenta_patrimonio,$columna_obtenido,$operacion,$idcuenta_padre,$idgestion,$idempresa){
        // $idempresa = Empresa::getidempresa($empresa);
        // $idempresa = $this->getidempresa($empresa);
       
            // Insertar el nuevo registro
            //EL idcuenta_patrimonio es EL idactualizacion_patrimonio 
            $registroProveedor = $this->dbc->query("INSERT INTO agrupacion_actualizacion_patrimonio(idcuenta_patrimonio,columna_obtenido,operacion,idcuenta_padre,registro_desde,idgestion,idempresa) 
            VALUES ('$idcuenta_patrimonio','$columna_obtenido','$operacion','$idcuenta_padre','actualizacion_patrimonio','$idgestion','$idempresa')");
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

            $get_balance = $this->dbc->query("SELECT * FROM balance_general_por_gestion 
            WHERE idbalance_general_por_gestion ='$qwe[idcuenta_patrimonio]'");

            $gb = $get_balance->fetch_assoc();
            $res = array(
                "idagrupacion_actualizacion_patrimonio" => $qwe['idagrupacion_actualizacion_patrimonio'],
                "operacion" => $qwe['operacion'],
                "columna_obtenido" => $qwe['columna_obtenido'], //ESTE CAMPO SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_genereal_por_gestion
                "nombre" => $gb['nombre_actual']
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

    public function reporte_actualizacion_patrimonio($tc_1,$tc_2,$empresa) {
        $lista = [];
        $lista2 = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_act_patr = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idempresa = '$idempresa' ORDER BY orden ASC");
    
        while ($qwe = $this->dbc->fetch($get_act_patr)) {

            $bg_pg = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idbalance_general_por_gestion = '$qwe[idcuenta_patrimonio]'");
            $bg_aux = $this->dbc->fetch($bg_pg);

            $div_tc = $tc_2/$tc_1;
            $multipli_tc = $div_tc - 1;
            $actualizacion = $bg_aux['valor'] * $multipli_tc;

            $res = array(
                "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
                "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'],
                "nombre" => $bg_aux['nombre_actual'],
                "valor" => $bg_aux['valor'],
                "actualizacion" => $actualizacion
                // "total" => $qwe['estado']
            );
            array_push($lista, $res);
        }

        foreach ($lista as $item) {
            $agru_act_patr = $this->dbc->query("SELECT * FROM agrupacion_actualizacion_patrimonio WHERE idcuenta_padre = '$item[idactualizacion_patrimonio]'");
            // $acp = $this->dbc->fetch($agru_act_patr);

            $suma = 0;
            while ($acp = $this->dbc->fetch($agru_act_patr)) {
                $bal_gen_gest = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idbalance_general_por_gestion = '$acp[idcuenta_patrimonio]'");
                $bgg = $this->dbc->fetch($bal_gen_gest);
                if($acp['columna_obtenido'] == "valor"){
                    foreach ($lista as $item_aux) {
                        if ($item_aux['idcuenta_patrimonio'] == $acp['idcuenta_patrimonio']) {
                            
                            $suma = $suma + $item_aux['valor'];
                            break; // detener el bucle al encontrarlo
                        }
                    }

                    // $suma = $suma + $bgg['valor'];
                }elseif($acp['columna_obtenido'] == "actualizacion"){
                    foreach ($lista as $item_aux) {
                        if ($item_aux['idcuenta_patrimonio'] == $acp['idcuenta_patrimonio']) {
                            
                            $suma = $suma + $item_aux['actualizacion'];
                            break; // detener el bucle al encontrarlo
                        }
                    }
                    
                }else{ // VALOR_ACTUALIZACION
                    foreach ($lista as $item_aux) {
                        if ($item_aux['idcuenta_patrimonio'] == $acp['idcuenta_patrimonio']) {
                            
                            $suma = $suma + $item_aux['actualizacion'] + $item_aux['valor'];
                            break; // detener el bucle al encontrarlo
                        }
                    }
                }
            
            }
            // $id = $item['idactualizacion_patrimonio'];
            $res2 = array(
                "idactualizacion_patrimonio" => $item['idactualizacion_patrimonio'],
                "nombre" => $item['nombre'],
                "valor" => $item['valor'],
                "actualizacion" => $item['actualizacion'],
                "total" => $suma
            );
            array_push($lista2, $res2);
        }
    

        echo json_encode($lista2, JSON_NUMERIC_CHECK);
    }

    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
}



?>