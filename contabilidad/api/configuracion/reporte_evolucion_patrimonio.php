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

    public function select_patrimonio_gestion_anterior($aux_parametro,$idplantilla_reporte_vinculado_BG,$idcuenta_padre) {

        $lista = [];
        // $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        // $selct_patrimonio = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idgestion ='$gestion_ant' and grupo='3' and nivel ='2'");
        $selct_patrimonio = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplantilla_reporte = '$idplantilla_reporte_vinculado_BG' 
        AND grupo='3' AND  es_calculable ='si'");
    
        if($aux_parametro == "actualizacion_patrimonio"){ // SELECT FUERA DEL ICONO AZUL
            while ($qwe = $this->dbc->fetch($selct_patrimonio)) {
                $existe_act_patrimonio = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idcuenta_patrimonio ='$qwe[idconfiguracion_reporte]'");

                if($existe_act_patrimonio->num_rows > 0){
                    // SALTAR EL REGISTRO QUE YA TENEMOS REGISTRADO EN LA TABLA
                }else{
                    // ANTES DE IR ALMORZAR ME QUEDE AQUI MODIFICAR LO DE ABAJOOO
                    $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                    WHERE idplandecuenta ='$qwe[idplandecuenta]'");
                    $pl_c = $get_pl_cuenta->fetch_assoc();

                    $res = array(
                        "idconfiguracion_reporte" => $qwe['idconfiguracion_reporte'],
                        "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                        "nombre_actual" => $pl_c['nombreplan'],
                        // "valor" => $qwe['valor'],//TALVEZ SE QUITE
                        // "idgestion" => $qwe['idgestion'],//TALVEZ SE BORRE
                        "idempresa" => $qwe['idempresa']
                    );
                    array_push($lista, $res);
                }

            }
        }else{ // SELECT DENTRO DEL ICONO AZUL
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

                $listar_balance_limitado = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplantilla_reporte = '$idplantilla_reporte_vinculado_BG' 
                AND grupo='3' AND  es_calculable ='si' and idconfiguracion_reporte not in($ids_string)");
// WHERE idplantilla_reporte = '3' AND grupo='3' AND  es_calculable ='si';
                while ($lbl = $this->dbc->fetch($listar_balance_limitado)) {

                $get_pl_cuenta = $this->dbc->query("SELECT * FROM plandecuenta 
                WHERE idplandecuenta ='$lbl[idplandecuenta]'");
                $pl_c = $get_pl_cuenta->fetch_assoc();
                
                    $res = array(
                    "idconfiguracion_reporte" => $lbl['idconfiguracion_reporte'],
                    "idplantilla_reporte" => $lbl['idplantilla_reporte'],
                    "nombre_actual" => $pl_c['nombreplan'],
                    // "valor" => $lbl['valor'],
                    // "idgestion" => $lbl['idgestion'],
                    "idempresa" => $lbl['idempresa']
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

    public function reporte_actualizacion_patrimonio($fecha_tc_1,$fecha_tc_2,$empresa,$idgestion_actual) {
        $lista = [];
        $lista2 = [];
        $idempresa = $this->getidempresa($empresa);
    
        $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        // Preparar la consulta
        $get_act_patr = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idempresa = '$idempresa' ORDER BY orden ASC");
    
        $fech_tipo_cambio_1 = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa' AND fecha = '$fecha_tc_1'");
        $ftc_1 = $this->dbc->fetch($fech_tipo_cambio_1);

        $fech_tipo_cambio_2 = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion = '$idempresa' AND fecha = '$fecha_tc_2'");
        $ftc_2 = $this->dbc->fetch($fech_tipo_cambio_2);

        while ($qwe = $this->dbc->fetch($get_act_patr)) {

            $bg_pg = $this->dbc->query("SELECT * FROM balance_general_por_gestion 
            WHERE idconfiguracion_reporte = '$qwe[idcuenta_patrimonio]' AND idgestion='$gestion_ant'");
            $bg_aux = $this->dbc->fetch($bg_pg);
            
            // $bg_pg = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idbalance_general_por_gestion = '$qwe[idcuenta_patrimonio]'");
            // $bg_aux = $this->dbc->fetch($bg_pg);

            if($qwe['calculo_actualizacion'] == 'no'){
                $res = array(
                    "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
                    "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'],
                    "nombre" => $bg_aux['nombre_actual'],
                    "valor" => $bg_aux['valor'],
                    "actualizacion" => 0
                    // "total" => $qwe['estado']
                );
            }else{
                $div_tc = $ftc_2['ufv']/$ftc_1['ufv'];
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

            }
            
            array_push($lista, $res);
        }

        foreach ($lista as $item) {
            $agru_act_patr = $this->dbc->query("SELECT * FROM agrupacion_actualizacion_patrimonio WHERE idcuenta_padre = '$item[idactualizacion_patrimonio]'");
            // $acp = $this->dbc->fetch($agru_act_patr);

            $suma = 0;
            while ($acp = $this->dbc->fetch($agru_act_patr)) {
                // $bal_gen_gest = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idbalance_general_por_gestion = '$acp[idcuenta_patrimonio]'");
                // $bgg = $this->dbc->fetch($bal_gen_gest);
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

    public function registrar_estado_evolucion_patrimonio($idplantilla_reporte,$nombre_personalizado,$orden,$idgestion,$empresa){//ESTA API SERA PARA EL REGISTRO DE LA PLANTILLA DE ACTUALIZACION PATRIMONIO
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
            $registro_actualizacion = $this->dbc->query("INSERT INTO estado_ev_patrimonio(idplantilla_reporte,nombre_personalizado,orden,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$nombre_personalizado','$orden_nuevo','$idgestion','$idempresa')");

        }else{
            //EL CAMPO idcuenta_patrimonio SE OBTIENE DE LA TABLA balance_genereal_por_gestion del campo idbalance_general_por_gestion
            $registro_actualizacion = $this->dbc->query("INSERT INTO estado_ev_patrimonio(idplantilla_reporte,nombre_personalizado,orden,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$nombre_personalizado','$orden','$idgestion','$idempresa')");
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

    public function guardar_actualizacion_patrimonio_por_gestion($jsonData) {
        // Decodificar el JSON a un array asociativo
        $registros = json_decode($jsonData, true);

        // Validar que se haya decodificado correctamente
        if (!is_array($registros)) {
            throw new Exception("El parámetro no es un JSON válido");
        }

        // Recorrer cada registro e insertar en la base de datos
        foreach ($registros as $registro) {
            $id = $registro['idactualizacion_patrimonio'];
            $nombre = $registro['nombre'];
            $valor = $registro['valor'];
            $actualizacion = $registro['actualizacion'];
            $total = $registro['total'];

            // Preparar la consulta SQL
            $sql = "INSERT INTO actualizacion_patrimonio_por_gestion 
                    (idplantilla_reporte,idactualizacion_patrimonio, nombre, valor, actualizacion, total,orden, idgestion, idempresa) 
                    VALUES (?, ?, ?, ?, ?)";

            // Usar prepared statements para mayor seguridad
            $stmt = $this->dbc->prepare($sql);
            $stmt->bind_param("isdid", $id, $nombre, $valor, $actualizacion, $total);

            // Ejecutar la inserción
            if (!$stmt->execute()) {
                throw new Exception("Error al insertar registro con ID $id: " . $stmt->error);
            }
        }

        echo "Todos los registros fueron insertados correctamente.";
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

    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }


//     public function listar_divisa($empresa) {
//     $lista = [];
//     $idempresa = $this->getidempresa($empresa);

//     // 1. Obtener los campos configurados en otra tabla
//     // Supongamos que tienes una tabla llamada "campos_divisa" con los nombres de columnas que quieres mostrar
//     $getCampos = $this->dbc->query("SELECT nombre_campo FROM campos_divisa WHERE idempresa = '$idempresa'");
//     $campos = [];
//     while ($campo = $this->dbc->fetch($getCampos)) {
//         $campos[] = $campo['nombre_campo'];
//     }

//     // 2. Consultar la tabla principal
//     $getPedido = $this->dbc->query("SELECT * FROM divisa WHERE idempresa = '$idempresa' ORDER BY iddivisa DESC");

//     // 3. Construir dinámicamente el array según los campos seleccionados
//     while ($qwe = $this->dbc->fetch($getPedido)) {
//         $res = [];
//         foreach ($campos as $c) {
//             if (isset($qwe[$c])) {
//                 $res[$c] = $qwe[$c];
//             }
//         }
//         $lista[] = $res;
//     }

//     // 4. Devolver en JSON
//     echo json_encode($lista, JSON_NUMERIC_CHECK);
// }

}



?>