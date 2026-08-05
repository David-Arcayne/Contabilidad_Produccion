<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; editar

class Reporte_flujo_efectivo extends DB{
    
public function listar_plantilla_flujo_efectivo($idplantilla_reporte,$empresa) {
        //    ini_set('display_errors', 1); 
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_flujo_efectivo = $this->dbc->query("SELECT * from confi_reporte_flujo_efectivo where id_plantilla_superior = '0'
        and idplantilla_reporte = '$idplantilla_reporte'
        order by orden asc
        ");// NIVEL 1

        while ($qwe = $this->dbc->fetch($get_flujo_efectivo)) {

        $nombre_aux2 = "";
            if($qwe['idconfiguracion_reporte'] != '0'){
                $conf_report2 = $this->dbc->query("SELECT * from configuracion_reporte 
                where idconfiguracion_reporte = '$qwe[idconfiguracion_reporte]'");

                $cr2 = $conf_report2->fetch_assoc();

                $plancuenta2 = $this->dbc->query("SELECT * from plandecuenta 
                where idplandecuenta = '$cr2[idplandecuenta]'");

                $pl2 = $plancuenta2->fetch_assoc();
                $nombre_aux2 = $pl2['nombreplan'];
            }else{

            }

            if($qwe['tipo_operacion'] == 'operaciones_vinculacion' && $nombre_aux2 != ''){
                $nombre_perso = "";
            }else{
                if($qwe['idconfiguracion_reporte'] != 0 || $qwe['idconfiguracion_reporte'] != null){
                // $nombre_perso = "";
                    $nombre_perso = $qwe['nombre_registro'];
                }else{
                    // $nombre_perso = $qwe['nombre_registro'];
                    $nombre_perso = "";
                }
            }
            
            $res = array(
                // "reporte" => $qwe['reporte'],
                "idconfi_reporte_flujo_efectivo" => $qwe['idconfi_reporte_flujo_efectivo'],
                "nombre_registro_general" => $qwe['nombre_registro'],
                "nombre_personalizado" => $nombre_perso,
                "nivel_registro" => $qwe['nivel_registro'],
                "tipo_operacion" => $qwe['tipo_operacion'],
                "negrilla_cursiva" => $qwe['negrilla_cursiva'],
                "orden" => $qwe['orden'],
                "obtiene_desde" => $qwe['obtiene_desde'],
                "nombre_confi_reporte" => $nombre_aux2,
                "id_plantilla_superior" => $qwe['id_plantilla_superior'],
                "idconfiguracion_reporte" => $qwe['idconfiguracion_reporte'],
                "nivel_2" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
            );
        
        // $get_nivel_2 = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nivel_registrado = '2' AND idempresa = '$idempresa'");// ACTIVO, PASIVO, PATRIMONIO

        $get_flujo_efectivo_nivel_2 = $this->dbc->query("SELECT * from confi_reporte_flujo_efectivo where id_plantilla_superior = '$qwe[idconfi_reporte_flujo_efectivo]' AND idplantilla_reporte = '$idplantilla_reporte' 
        ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
        while ($qwe2 = $this->dbc->fetch($get_flujo_efectivo_nivel_2)) {

            if($qwe2['idconfiguracion_reporte'] == 0 || $qwe2['idconfiguracion_reporte'] == null){
                // $nombre_perso2 = "";
                $nombre_perso2 = $qwe2['nombre_registro'];
            }else{
                // $nombre_perso2 = $qwe2['nombre_registro'];
                $nombre_perso2 = "";
            }

            $nombre_aux = "";
            if($qwe2['idconfiguracion_reporte'] != '0'){
                $conf_report = $this->dbc->query("SELECT * from configuracion_reporte 
                where idconfiguracion_reporte = '$qwe2[idconfiguracion_reporte]'");

                $cr = $conf_report->fetch_assoc();

                $plancuenta = $this->dbc->query("SELECT * from plandecuenta 
                where idplandecuenta = '$cr[idplandecuenta]'");

                $pl = $plancuenta->fetch_assoc();
                $nombre_aux = $pl['nombreplan'];
            }else{

            }
            $res2 = array(
                // "reporte" => $qwe['reporte'],
                "idconfi_reporte_flujo_efectivo" => $qwe2['idconfi_reporte_flujo_efectivo'],
                "nombre_registro_general" => $qwe2['nombre_registro'],
                "nombre_personalizado" => $nombre_perso2,
                "nivel_registro" => $qwe2['nivel_registro'],
                "tipo_operacion" => $qwe2['tipo_operacion'],
                "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                "orden" => $qwe2['orden'],
                "obtiene_desde" => $qwe2['obtiene_desde'],
                "nombre_confi_reporte" => $nombre_aux,
                "id_plantilla_superior" => $qwe2['id_plantilla_superior'],
                "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                "nivel_3" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
            );

            array_push($res['nivel_2'], $res2); 
        }
        array_push($lista, $res);
        }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function reporte_estado_origen_aplicacion($gestion_act){
        // ini_set('display_errors', 1); 
        //     ini_set('display_startup_errors', 1);
        //     error_reporting(E_ALL);

         $gestion_ant =$this->obtenerGestionAnterior($gestion_act);

         if($gestion_ant == '0'){ // NO EXISTE GESTION ANTERIOR
            $lista_report_flujo = array("danger", "No existe Gestion anterior","reporte_estado_origen_aplicacion");;
         }else{
            $lista_report_flujo = $this->reporte_estado_ori_apli_privado($gestion_ant, $gestion_act);
         }

        echo json_encode($lista_report_flujo, JSON_NUMERIC_CHECK); 
        // echo json_encode(array($gestion_ant, $gestion_act,"hola","como"));
    }

    private function reporte_estado_ori_apli_privado($gestion_ant, $gestion_act){
    // ini_set('display_errors', 1); 
    //     ini_set('display_startup_errors', 1);
    //     error_reporting(E_ALL);
    $lista = [];

    $get_balance = $this->dbc->query("SELECT * 
        FROM balance_general_por_gestion 
        WHERE (es_calculable = 'si' 
          AND idgestion IN ('$gestion_ant', '$gestion_act')) 
          OR
          (tipo_operacion = 'calculo_otro_reporte' 
      AND idgestion IN ('$gestion_ant', '$gestion_act')
    )
        ORDER BY grupo, idconfiguracion_reporte, idgestion
    ");

    $agrupados = [];

    while ($row = $this->dbc->fetch($get_balance)) {
        $idconf = $row['idconfiguracion_reporte'];

        if (!isset($agrupados[$idconf])) {
            $agrupados[$idconf] = [
                "idconfiguracion_reporte" => $idconf,
                "grupo" => $row['grupo'],
                "nombre" => $row['nombre_actual'],
                "id_plantilla_superior" => $row['id_plantilla_superior'],
                "valor_anterior" => null,
                "valor_actual" => null,
            ];
        }

        if ($row['idgestion'] == $gestion_ant) {
            $agrupados[$idconf]["valor_anterior"] = $row['valor'];
        } else {
            $agrupados[$idconf]["valor_actual"] = $row['valor'];
        }
    }

    // Totales
    $suma_activo_anterior = 0;
    $suma_activo_actual = 0;
    $suma_activo_origen = 0;
    $suma_activo_aplicacion = 0;

    $suma_pasi_patri_anterior = 0;
    $suma_pasi_patri_actual = 0;
    $suma_pasi_patri_origen = 0;
    $suma_pasi_patri_aplicacion = 0;

    foreach ($agrupados as $item) {
    $valor_ant = $item["valor_anterior"] ?? 0;
    $valor_act = $item["valor_actual"] ?? 0;

    if ($item['grupo'] == '1') {
        // Invertir la lógica para grupo 1
        $resultado = $valor_ant - $valor_act;
        $origen = $resultado > 0 ? $resultado : 0;
        // Aplicación siempre positivo
        $aplicacion = $resultado < 0 ? abs($resultado) : 0;

        $suma_activo_anterior += $valor_ant;
        $suma_activo_actual += $valor_act;
        $suma_activo_origen += $origen;
        $suma_activo_aplicacion += $aplicacion;
    } else {
        // Mantener la lógica original para grupo 2 y 3
        $resultado = $valor_act - $valor_ant;
        $origen = $resultado > 0 ? $resultado : 0;
        $aplicacion = $resultado < 0 ? abs($resultado) : 0; // también positivo

        $suma_pasi_patri_anterior += $valor_ant;
        $suma_pasi_patri_actual += $valor_act;
        $suma_pasi_patri_origen += $origen;
        $suma_pasi_patri_aplicacion += $aplicacion;
    }

    $confi = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte='$item[idconfiguracion_reporte]'");
    $cr = $this->dbc->fetch($confi);

    $lista[] = [
        "idconfiguracion_reporte" => $item['idconfiguracion_reporte'],
        "grupo" => $item['grupo'],
        "nombre" => $item['nombre'],
        "valor_anterior" => $valor_ant,
        "valor_actual" => $valor_act,
        "origen" => $origen,
        "aplicacion" => $aplicacion,
        "id_plantilla_superior" => $item['id_plantilla_superior'],
        "nombre_cuenta_superior" => $cr['nombre_cuenta_superior'],
    ];
}



    // Totales por grupo
    $lista[] = [
        "grupo" => "1",
        "nombre" => "TOTAL ACTIVOS",
        "valor_anterior" => $suma_activo_anterior,
        "valor_actual" => $suma_activo_actual,
        "origen" => $suma_activo_origen,
        "aplicacion" => $suma_activo_aplicacion,
        "id_plantilla_superior" => null,
    ];

    $lista[] = [
        "grupo" => "2",
        "nombre" => "TOTAL PASIVO Y PATRIMONIO",
        "valor_anterior" => $suma_pasi_patri_anterior,
        "valor_actual" => $suma_pasi_patri_actual,
        "origen" => $suma_pasi_patri_origen,
        "aplicacion" => $suma_pasi_patri_aplicacion,
        "id_plantilla_superior" => null,
    ];

    // echo json_encode($lista, JSON_NUMERIC_CHECK);
    return $lista;
}

//     private function reporte_estado_ori_apli_privado($gestion_ant, $gestion_act){
//     // ini_set('display_errors', 1); 
//     //     ini_set('display_startup_errors', 1);
//     //     error_reporting(E_ALL);
//     $lista = [];

//     $get_balance = $this->dbc->query("
//         SELECT * 
//         FROM balance_general_por_gestion 
//         WHERE es_calculable = 'si' 
//           AND idgestion IN ('$gestion_ant', '$gestion_act')
//         ORDER BY grupo, idconfiguracion_reporte, idgestion
//     ");

//     $agrupados = [];

//     while ($row = $this->dbc->fetch($get_balance)) {
//         $idconf = $row['idconfiguracion_reporte'];

//         if (!isset($agrupados[$idconf])) {
//             $agrupados[$idconf] = [
//                 "idconfiguracion_reporte" => $idconf,
//                 "grupo" => $row['grupo'],
//                 "nombre" => $row['nombre_actual'],
//                 "id_plantilla_superior" => $row['id_plantilla_superior'],
//                 "valor_anterior" => null,
//                 "valor_actual" => null,
//             ];
//         }

//         if ($row['idgestion'] == $gestion_ant) {
//             $agrupados[$idconf]["valor_anterior"] = $row['valor'];
//         } else {
//             $agrupados[$idconf]["valor_actual"] = $row['valor'];
//         }
//     }

//     // Totales
//     $suma_activo_anterior = 0;
//     $suma_activo_actual = 0;
//     $suma_activo_origen = 0;
//     $suma_activo_aplicacion = 0;

//     $suma_pasi_patri_anterior = 0;
//     $suma_pasi_patri_actual = 0;
//     $suma_pasi_patri_origen = 0;
//     $suma_pasi_patri_aplicacion = 0;

//     foreach ($agrupados as $item) {
//         $valor_ant = $item["valor_anterior"] ?? 0;
//         $valor_act = $item["valor_actual"] ?? 0;

//         $resultado = $valor_act - $valor_ant;
//         $origen = $resultado > 0 ? $resultado : 0;
//         $aplicacion = $resultado < 0 ? $resultado : 0;

//         if ($item['grupo'] == '1') {
//             $suma_activo_anterior += $valor_ant;
//             $suma_activo_actual += $valor_act;
//             $suma_activo_origen += $origen;
//             $suma_activo_aplicacion += $aplicacion;
//         } else {
//             $suma_pasi_patri_anterior += $valor_ant;
//             $suma_pasi_patri_actual += $valor_act;
//             $suma_pasi_patri_origen += $origen;
//             $suma_pasi_patri_aplicacion += $aplicacion;
//         }
//         $confi = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte='$item[idconfiguracion_reporte]'");
//         $cr = $this->dbc->fetch($confi);

//         $lista[] = [
//             "idconfiguracion_reporte" => $item['idconfiguracion_reporte'],
//             "grupo" => $item['grupo'],
//             "nombre" => $item['nombre'],
//             "valor_anterior" => $valor_ant,
//             "valor_actual" => $valor_act,
//             "origen" => $origen,
//             "aplicacion" => $aplicacion,
//             "id_plantilla_superior" => $item['id_plantilla_superior'],
//             "nombre_cuenta_superior" => $cr['nombre_cuenta_superior'],
//         ];
//     }

//     // Totales por grupo
//     $lista[] = [
//         "grupo" => "1",
//         "nombre" => "TOTAL ACTIVOS",
//         "valor_anterior" => $suma_activo_anterior,
//         "valor_actual" => $suma_activo_actual,
//         "origen" => $suma_activo_origen,
//         "aplicacion" => $suma_activo_aplicacion,
//         "id_plantilla_superior" => null,
//     ];

//     $lista[] = [
//         "grupo" => "2",
//         "nombre" => "TOTAL PASIVO Y PATRIMONIO",
//         "valor_anterior" => $suma_pasi_patri_anterior,
//         "valor_actual" => $suma_pasi_patri_actual,
//         "origen" => $suma_pasi_patri_origen,
//         "aplicacion" => $suma_pasi_patri_aplicacion,
//         "id_plantilla_superior" => null,
//     ];

//     // echo json_encode($lista, JSON_NUMERIC_CHECK);
//     return $lista;
// }


    // public function reporte_flujo_efectivo_actual($gestion_ant,$gestion_act) {
    //     $lista = [];
    //     // $idempresa = $this->getidempresa($empresa);
    
    //     // Preparar la consulta
    //     $get_balance = $this->dbc->query("SELECT * from balance_general_por_gestion where es_calculable ='si' and idgestion ='$gestion_act'");
    
    //     $suma_activo_anterior = 0;
    //     $suma_activo_actual = 0;
    //     $suma_pasi_patri_anterior = 0;
    //     $suma_pasi_patri_actual = 0;
    //     while ($qwe = $this->dbc->fetch($get_balance)) {

    //     $balance_ante = $this->dbc->query("SELECT * from balance_general_por_gestion where idconfiguracion_reporte = '$qwe[idconfiguracion_reporte]' and idgestion ='$gestion_ant'");
    //     $val_ante = $balance_ante->fetch_assoc();

    //     $resultado = $qwe['valor'] - $val_ante['valor'];
    //     if($resultado > 0){
    //         $origen = $resultado; // el resultado de la resta es positivo
    //         $aplicacion = 0;
    //     }else{
    //         $aplicacion = $resultado; // el resultado de la resta es negativo
    //         $origen = 0;
    //     }
    
    //     if($qwe['grupo'] == '1'){
    //         $suma_activo_anterior = $suma_activo_anterior + $val_ante['valor'];
    //         $suma_activo_actual = $suma_activo_actual + $qwe['valor'];
    //     }else{
    //         $suma_pasi_patri_anterior = $suma_pasi_patri_anterior + $val_ante['valor'];
    //         $suma_pasi_patri_actual = $suma_pasi_patri_actual + $qwe['valor'];
    //     }
    //         $res = array(
    //             "idconfiguracion_reporte" => $qwe['idconfiguracion_reporte'],
    //             "grupo" => $qwe['grupo'],
    //             "nombre" => $qwe['nombre_actual'],
    //             "valor_anterior" => $val_ante['valor'],
    //             "valor_actual" => $qwe['valor'],
    //             "origen" => $origen,
    //             "aplicacion" => $aplicacion,
    //             "nombre_cuenta_superior" => $qwe['nombre_cuenta_superior'],
                
    //         );
    //         array_push($lista, $res);
    //     }
    
    //     echo json_encode($lista, JSON_NUMERIC_CHECK);
    // }
    //-----------------------------------------------------------------------------
    public function getgestionactualC($empresa)
{
    $orga = $this->getidempresa($empresa); // recibe md5 de la id insert
    $res = "";
    $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
    $qwe = $this->dbc->fetch($registro);

    // Retorna un array asociativo con la información
    return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
}
public function registrar_plantilla_flujo_efectivo(
    $idplantilla_reporte,
    $obtiene_desde,
    $idconfiguracion_reporte,
    $nombre_registro,
    $tipo_operacion,
    $nivel_registro,
    $id_plantilla_superior,
    $orden,
    $negrilla_cursiva,
    $empresa
){
    $idempresa = $this->getidempresa($empresa);
    $gestion = $this->getgestionactualC($empresa);
    $idgestion = $gestion["id"];

    // Obtener el máximo orden actual en ese nivel y plantilla
    $sqlMax = "SELECT COALESCE(MAX(orden),0) as max_orden 
               FROM confi_reporte_flujo_efectivo 
               WHERE nivel_registro='$nivel_registro' 
               AND idplantilla_reporte='$idplantilla_reporte'
               AND idgestion='$idgestion' 
               AND idempresa='$idempresa'";
    $resMax = $this->dbc->query($sqlMax)->fetch_assoc();
    $maxOrden = $resMax["max_orden"];

    // Lógica para calcular el orden correcto
    if ($orden === "" || $orden == 0) {
        // Caso 1: orden vacío o 0 → insertar al final
        $orden = $maxOrden + 1;
    } else {
        if ($orden > $maxOrden + 1) {
            // Caso 2: orden mayor al máximo → insertar al final
            $orden = $maxOrden + 1;
        } else {
            // Caso 3: orden dentro del rango → recorrer los demás
            $sqlUpdate = "UPDATE confi_reporte_flujo_efectivo 
                          SET orden = orden + 1 
                          WHERE nivel_registro='$nivel_registro' 
                          AND idplantilla_reporte='$idplantilla_reporte'
                          AND idgestion='$idgestion' 
                          AND idempresa='$idempresa' 
                          AND orden >= '$orden'";
            $this->dbc->query($sqlUpdate);
        }
    }

    if($tipo_operacion == 'titulo'){ // solo deberia tener nombre personalizado para escoger

        // nombre_registro SE MANTIENE COMO NOMBRE PERSONALIZADO
        $nombre_aux = $nombre_registro;
    }elseif($tipo_operacion == 'total_suma'){ // solo deberia tener nombre personalizado para escoger

        // nombre_registro SE MANTIENE COMO NOMBRE PERSONALIZADO
        $nombre_aux = $nombre_registro;
    }elseif($tipo_operacion == 'calculable'){

        // obtenemos el nombre_registro del idconfiguracion_reporte
        $conf_report = $this->dbc->query("SELECT * from configuracion_reporte 
                where idconfiguracion_reporte = '$idconfiguracion_reporte'");

                $cr = $conf_report->fetch_assoc();

                $plancuenta = $this->dbc->query("SELECT * from plandecuenta 
                where idplandecuenta = '$cr[idplandecuenta]'");

                $pl = $plancuenta->fetch_assoc();
                $nombre_aux = $pl['nombreplan'];
    }elseif($tipo_operacion == 'otras_operaciones'){ // solo deberia tener nombre personalizado para escoger
    
        // nombre_registro SE MANTIENE COMO NOMBRE PERSONALIZADO
        $nombre_aux = $nombre_registro;
    }elseif($tipo_operacion == 'operaciones_vinculacion'){ 

        if($idconfiguracion_reporte == '0' || $idconfiguracion_reporte == ''){ // el nombre_Registro  es nombre personalizado
            $nombre_aux = $nombre_registro;
        }else{// obtenemos el nombre_registro del idconfiguracion_reporte
            $conf_report = $this->dbc->query("SELECT * from configuracion_reporte 
                where idconfiguracion_reporte = '$idconfiguracion_reporte'");

                $cr = $conf_report->fetch_assoc();

                $plancuenta = $this->dbc->query("SELECT * from plandecuenta 
                where idplandecuenta = '$cr[idplandecuenta]'");

                $pl = $plancuenta->fetch_assoc();
                $nombre_aux = $pl['nombreplan'];
        }
    }elseif($tipo_operacion == 'vinculacion'){
        if($nombre_registro == ""){ // obtenemos el nombre_registro del idconfiguracion_reporte
            $conf_report = $this->dbc->query("SELECT * from configuracion_reporte 
                where idconfiguracion_reporte = '$idconfiguracion_reporte'");

                $cr = $conf_report->fetch_assoc();

                $plancuenta = $this->dbc->query("SELECT * from plandecuenta 
                where idplandecuenta = '$cr[idplandecuenta]'");

                $pl = $plancuenta->fetch_assoc();
                $nombre_aux = $pl['nombreplan'];
        }else{ // el nombre_Registro  es nombre personalizado
            $nombre_aux = $nombre_registro;
        }
    }
    // Insertar el nuevo registro con el orden calculado
    $sqlInsert = "INSERT INTO confi_reporte_flujo_efectivo(
        idplantilla_reporte,
        obtiene_desde,
        idconfiguracion_reporte,
        nombre_registro,
        tipo_operacion,
        nivel_registro,
        id_plantilla_superior,
        orden,
        negrilla_cursiva,
        idgestion,
        idempresa
    ) VALUES (
        '$idplantilla_reporte',
        '$obtiene_desde',
        '$idconfiguracion_reporte',
        '$nombre_aux',
        '$tipo_operacion',
        '$nivel_registro',
        '$id_plantilla_superior',
        '$orden',
        '$negrilla_cursiva',
        '$idgestion',
        '$idempresa'
    )";

    $registroProveedor = $this->dbc->query($sqlInsert);

    if ($registroProveedor === TRUE) {                                                                                                                                                                
        $res = array("success", "Registro exitoso","registroCaracteristicas");
    } else {
        $res = array("danger", "No se pudo registrar");
    }

    echo json_encode($res);
}

    // public function registrar_plantilla_flujo_efectivo($idplantilla_reporte,$obtiene_desde,$idconfiguracion_reporte,$nombre_registro,$tipo_operacion,$nivel_registro,$id_plantilla_superior,$orden,$negrilla_cursiva,$empresa){
      
    //     // $idempresa = Empresa::getidempresa($empresa);
    //     $idempresa = $this->getidempresa($empresa);

    //     $gestion = $this->getgestionactualC($empresa);
    //     $idgestion = $gestion["id"];

    //     // Insertar el nuevo registro
    //             $registroProveedor = $this->dbc->query("INSERT INTO confi_reporte_flujo_efectivo(idplantilla_reporte,obtiene_desde,idconfiguracion_reporte,nombre_registro,tipo_operacion,nivel_registro,id_plantilla_superior,orden,negrilla_cursiva,idgestion,idempresa) 
    //             VALUES ('$idplantilla_reporte','$obtiene_desde','$idconfiguracion_reporte','$nombre_registro','$tipo_operacion','$nivel_registro','$id_plantilla_superior','$orden','$negrilla_cursiva','$idgestion','$idempresa')");
    //             if ($registroProveedor === TRUE) {                                                                                                                                                                
    //                 $res = array("success", "Registro exitoso","registroCaracteristicas");
    //             } else {
    //                 $res = array("danger", "No se pudo registrar");
    //             }
        
    //     echo json_encode($res);
        
    // }
    public function filtro_plantilla_flujo_por_nivel($idplantilla_reporte, $nivel, $idempresa)
    {
        $id_empresa = $this->getidempresa($idempresa);
        $lista = [];

        if ($nivel > 0) {
            $sql = "SELECT * FROM confi_reporte_flujo_efectivo WHERE nivel_registro = '$nivel'
            AND idempresa = '$id_empresa' AND idplantilla_reporte = '$idplantilla_reporte'";

            $getPedido = $this->dbc->query($sql);
            while ($row = $this->dbc->fetch($getPedido)) {
                $lista[] = [
                    "idconfi_reporte_flujo_efectivo" => $row['idconfi_reporte_flujo_efectivo'],
                    "nombre_registro" => $row['nombre_registro']
                ];
            }
        }

        echo json_encode($lista);
    }
    public function listar_select_cuentas_balance_general($id_plantilla_referencia) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $tipo_reporte = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplantilla_reporte ='$id_plantilla_referencia'");
        // $bg = $tipo_reporte->fetch_assoc();
        while ($qwe = $this->dbc->fetch($tipo_reporte)) {
            $plan_cuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta ='$qwe[idplandecuenta]'");
            $nombre_cuenta = $plan_cuenta->fetch_assoc();
            $res = array(
                "id" => $qwe['idconfiguracion_reporte'],
                "nombre_plan" => $nombre_cuenta['nombreplan']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
     
    public function listar_configuracion_reporte($idplantilla_reporte,$empresa) {
        //    ini_set('display_errors', 1); 
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nivel_registrado = '1' AND idempresa = '$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
        $getPedido = $this->dbc->query("SELECT DISTINCT(reporte) FROM configuracion_reporte WHERE idempresa='$idempresa' AND reporte = 'balance_general' AND idplantilla_reporte ='$idplantilla_reporte'");// ACTIVO, PASIVO, PATRIMONIO

        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "reporte" => $qwe['reporte'],
                "nivel_1" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
            );
        
        // $get_nivel_2 = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nivel_registrado = '2' AND idempresa = '$idempresa'");// ACTIVO, PASIVO, PATRIMONIO

        $get_nivel_2 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa' 
        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
        while ($qwe2 = $this->dbc->fetch($get_nivel_2)) {
        $cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe2[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
        $nombre_cuenta = $cuenta->fetch_assoc();
        
        $depre_consulta = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta_depreciacion = '$qwe2[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO

        if($depre_consulta->num_rows > 0){
            $es_depreciacion = 'si';
        }else{
            $es_depreciacion = 'no';
        }
            $res2 = array(
                "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                "codigo" => $nombre_cuenta['numero'],
                "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                "es_activo_fijo" => $qwe2['es_activo_fijo'],
                "es_calculable" => $qwe2['es_calculable'],
                "orden" => $qwe2['orden'],
                "es_depreciacion" => $es_depreciacion,
                "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                "nivel_2" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
                
            );
            $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa' 
            AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
            while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
                $nombre_cuenta2 = $cuenta2->fetch_assoc();

                $depre_consulta = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta_depreciacion = '$qwe3[idplandecuenta]'
                AND idtipo_reportes ='$idplantilla_reporte'");// ACTIVO, PASIVO, PATRIMONIO

                if($depre_consulta->num_rows > 0){
                    $es_depreciacion = 'si';
                }else{
                    $es_depreciacion = 'no';
                }

                $res3 = array(
                "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                "codigo" => $nombre_cuenta2['numero'],
                "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                "es_activo_fijo" => $qwe3['es_activo_fijo'],
                "es_calculable" => $qwe3['es_calculable'],
                "orden" => $qwe3['orden'],
                "es_depreciacion" => $es_depreciacion,
                "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                "nivel_3" => [] //activo
                // "nivel_3" => $qwe['nombre'],// 
                // "estado" => $qwe['estado']
                );
                 $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe3[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa' 
                 AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                    $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
                    $nombre_cuenta3 = $cuenta3->fetch_assoc();

                    $depre_consulta = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta_depreciacion = '$qwe4[idplandecuenta]'
                    AND idtipo_reportes ='$idplantilla_reporte'");// ACTIVO, PASIVO, PATRIMONIO

                    if($depre_consulta->num_rows > 0){
                        $es_depreciacion = 'si';
                    }else{
                        $es_depreciacion = 'no';
                    }

                    $res4 = array(
                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                    "codigo" => $nombre_cuenta3['numero'],
                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                    "es_activo_fijo" => $qwe4['es_activo_fijo'],
                    "es_calculable" => $qwe4['es_calculable'],
                    "orden" => $qwe4['orden'],
                    "es_depreciacion" => $es_depreciacion,
                    "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                    "nivel_4" => [] //activo
                    );
                    $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe4[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa'
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                        $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
                        $nombre_cuenta4 = $cuenta4->fetch_assoc();

                        $depre_consulta = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta_depreciacion = '$qwe5[idplandecuenta]'
                        AND idtipo_reportes ='$idplantilla_reporte'");// ACTIVO, PASIVO, PATRIMONIO

                        if($depre_consulta->num_rows > 0){
                            $es_depreciacion = 'si';
                        }else{
                            $es_depreciacion = 'no';
                        }

                        $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],    
                        "codigo" => $nombre_cuenta4['numero'],
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "es_activo_fijo" => $qwe5['es_activo_fijo'],
                        "es_calculable" => $qwe5['es_calculable'],
                        "orden" => $qwe5['orden'],
                        "es_depreciacion" => $es_depreciacion,
                        "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                        "nivel_5" => [] //activo
                        );
                //----------------------------------------------------------------------------
                    $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe5[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND reporte = '$qwe[reporte]' AND idempresa='$idempresa' 
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe6 = $this->dbc->fetch($get_nivel_6)) {
                        $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
                        $nombre_cuenta5 = $cuenta5->fetch_assoc();

                        $res6 = array(
                        "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                        "codigo" => $nombre_cuenta5['numero'],   
                        "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                        "es_activo_fijo" => $qwe6['es_activo_fijo'],
                        "es_calculable" => $qwe6['es_calculable'],
                        "orden" => $qwe6['orden'],
                        "es_depreciacion" => $es_depreciacion,
                        "negrilla_cursiva" => $qwe6['negrilla_cursiva'],
                        "nivel_5" => [] //activo
                        );
                        
                        array_push($res5['nivel_5'], $res6); 
                    }
                //-------------------------------------------------------------------------------------
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

 public function reporte_flujo_efectivo($idplantilla_reporte,$gestion_act,$empresa) {
        // ini_set('display_errors', 1); 
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL); 
$aux_string ="";        
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getidgestion($empresa);
        $gestion_ant =$this->obtenerGestionAnterior($gestion_act);

        $res2 = "";
        $lista_flujo_gestiones = $this->reporte_estado_ori_apli_privado($gestion_ant, $gestion_act);

        $get_nivel_2 = $this->dbc->query("SELECT * from confi_reporte_flujo_efectivo where id_plantilla_superior = '' AND idempresa='$idempresa' 
        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");//
        $total_pasivo_patrimonio = 0;
        while ($qwe2 = $this->dbc->fetch($get_nivel_2)) {

        if($qwe2['tipo_operacion'] == 'titulo'){
            $res2 = array(
                    "idconfi_reporte_flujo_efectivo" => $qwe2['idconfi_reporte_flujo_efectivo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "tipo_operacion" => $qwe2['tipo_operacion'],
                    "nombre_registro" => $qwe2['nombre_registro'],
                    "suma_nivel_2" => 0,
                    "profundidad" => '1',
                    "nivel_2" => [] //activo
                    );
        }elseif($qwe2['tipo_operacion'] == 'otras_operaciones'){

            // $otrs_oper = $this->dbc->query("SELECT * FROM agrupacion_plantilla 
            // WHERE idplantilla_padre = '$qwe2[idconfi_reporte_flujo_efectivo]' AND idtipo_reportes = '$idplantilla_reporte'");//

            // $sum_rest = 0;
            //     // $lista_aux_buscador[] = $res; monto
            //     // array_push($lista_aux_buscador,$res);
            //     while ($buscarId = $this->dbc->fetch($otrs_oper)) { // 2agrupados
            //         foreach ($lista as $item) {
            //             foreach ($item['nivel_2'] as $nivel2) {

            //                 if ($nivel2['idconfi_reporte_flujo_efectivo'] === $buscarId['idplantilla_hijo']) {
            //                     //agarro si es suma o resta y agarro su valor 
            //                     if($buscarId['tipo_operacion'] == 'sumar'){
            //                         $sum_rest = $sum_rest + $nivel2['valor'];
            //                     }elseif($buscarId['tipo_operacion'] == 'restar'){
            //                         $sum_rest = $sum_rest - $nivel2['suma_nivel_2'];
            //                     }
            //                     // $item['suma_nivel_2'];
            //                     // $encontrado = true;
            //                     break;
            //                 }else{
            //                     //seguir buscando
            //                 }

            //             }
            //         }
            //     }

            //     $res2 = array(
            //         "idconfi_reporte_flujo_efectivo" => $qwe2['idconfi_reporte_flujo_efectivo'],
            //         "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
            //         "tipo_operacion" => $qwe2['tipo_operacion'],
            //         "nombre_registro" => $qwe2['nombre_registro'],
            //         "suma_nivel_2" => $sum_rest,
            //         "profundidad" => '1',
            //         "nivel_2" => [] //activo
            //         );

            $otrs_oper = $this->dbc->query("SELECT * FROM agrupacion_plantilla 
    WHERE idplantilla_padre = '$qwe2[idconfi_reporte_flujo_efectivo]' 
      AND idtipo_reportes = '$idplantilla_reporte'");

$sum_rest = 0;

while ($buscarId = $this->dbc->fetch($otrs_oper)) {
    foreach ($lista as $item) {

        // 1. Buscar en el propio item (nivel 1)
        if ($item['idconfi_reporte_flujo_efectivo'] === $buscarId['idplantilla_hijo']) {
            if ($buscarId['tipo_operacion'] == 'sumar') {
                $sum_rest += $item['suma_nivel_2'];
            } elseif ($buscarId['tipo_operacion'] == 'restar') {
                $sum_rest -= $item['suma_nivel_2'];
            }
            continue; // ya encontrado en nivel 1, no hace falta seguir
        }

        // 2. Buscar en nivel_2
        foreach ($item['nivel_2'] as $nivel2) {
            if ($nivel2['idconfi_reporte_flujo_efectivo'] === $buscarId['idplantilla_hijo']) {
                if ($buscarId['tipo_operacion'] == 'sumar') {
                    $sum_rest += $nivel2['valor'];
                } elseif ($buscarId['tipo_operacion'] == 'restar') {
                    $sum_rest -= $nivel2['suma_nivel_2'];
                }
                break; // encontrado en nivel_2
            }
        }
    }
}

$res2 = array(
    "idconfi_reporte_flujo_efectivo" => $qwe2['idconfi_reporte_flujo_efectivo'],
    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
    "tipo_operacion" => $qwe2['tipo_operacion'],
    "nombre_registro" => $qwe2['nombre_registro'],
    "suma_nivel_2" => $sum_rest,
    "profundidad" => '1',
    "nivel_2" => []
);

        }elseif($qwe2['tipo_operacion'] == 'vinculacion'){

                    if($qwe2['obtiene_desde'] == 'gestion_anterior'){

                        $balance_gestion = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idconfiguracion_reporte = '$qwe2[idconfiguracion_reporte]'
                        AND idgestion ='$gestion_ant'");//

                    }else{ // gestion_actual
                        $balance_gestion = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idconfiguracion_reporte = '$qwe2[idconfiguracion_reporte]'
                        AND idgestion ='$gestion_act'");//
                    }
                    $bl_gest = $balance_gestion->fetch_assoc();

                    $res2 = array(
                    "idconfi_reporte_flujo_efectivo" => $qwe2['idconfi_reporte_flujo_efectivo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "tipo_operacion" => $qwe2['tipo_operacion'],
                    "nombre_registro" => $qwe2['nombre_registro'],
                    "suma_nivel_2" => $bl_gest['valor'],
                    "profundidad" => '1',
                    "nivel_2" => [] //activo
                    );
        }

            $hijs_flujo = $this->dbc->query("SELECT * from confi_reporte_flujo_efectivo where id_plantilla_superior = '$qwe2[idconfi_reporte_flujo_efectivo]'
             AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");//
            // $nombre_cuenta = $hijs_flujo->fetch_assoc();

            $total_suma = 0;
            while ($qwe3 = $this->dbc->fetch($hijs_flujo)) {

                if($qwe3['tipo_operacion'] == 'calculable'){
                    $idBuscado = $qwe3['idconfiguracion_reporte'];
                    $resultado = array_filter($lista_flujo_gestiones, function($item) use ($idBuscado) {
                        return $item['idconfiguracion_reporte'] == $idBuscado;
                    });
                    $resultado = reset($resultado);

                    if($qwe3['obtiene_desde'] == 'gestion_anterior'){
                        $valor_obtenido = $resultado['valor_anterior'];
                    }elseif($qwe3['obtiene_desde'] == 'gestion_actual'){
                        $valor_obtenido = $resultado['valor_actual'];
                    }elseif($qwe3['obtiene_desde'] == 'origen'){
                        $valor_obtenido = $resultado['origen'];
                    }else{ // APLICACION
                        $valor_obtenido = $resultado['aplicacion'] * -1;
                    }

                    $total_suma = $total_suma + $valor_obtenido;
                }elseif($qwe3['tipo_operacion'] == 'operaciones_vinculacion'){

                    $oper_vinc = $this->dbc->query("SELECT * FROM agrupacion_plantilla 
                    WHERE idplantilla_padre = '$qwe3[idconfi_reporte_flujo_efectivo]' AND idtipo_reportes = '$idplantilla_reporte'");//

                        $aux_sum_rest = 0;
                        while ($busc_Agru = $this->dbc->fetch($oper_vinc)) { // 2agrupados
                            $idBusc = $busc_Agru['idplantilla_hijo'];
                            $resu = array_filter($lista_flujo_gestiones, function($item2) use ($idBusc) {
                                return $item2['idconfiguracion_reporte'] == $idBusc;
                            });
                            $resu = reset($resu);

                            if($busc_Agru['tipo_operacion'] == 'sumar'){
                                
                                if($busc_Agru['obtiene_desde'] == 'gestion_anterior'){
                                    $aux_sum_rest = $aux_sum_rest + $resu['valor_anterior'];
                                 
                                }elseif($busc_Agru['obtiene_desde'] == 'gestion_actual'){
                                    $aux_sum_rest = $aux_sum_rest + $resu['valor_actual'];
                                    
                                }elseif($busc_Agru['obtiene_desde'] == 'origen'){
                                    $aux_sum_rest = $aux_sum_rest + $resu['origen'];
                                    
                                }else{ // APLICACION
                                    $aux_sum_rest = $aux_sum_rest + $resu['aplicacion'];
                                    
                                }

                            }elseif($busc_Agru['tipo_operacion'] == 'restar'){
                   
                                if($busc_Agru['obtiene_desde'] == 'gestion_anterior'){
                                    $aux_sum_rest = $aux_sum_rest - $resu['valor_anterior'];
                                    
                                }elseif($busc_Agru['obtiene_desde'] == 'gestion_actual'){

                                    $aux_sum_rest = $aux_sum_rest - $resu['valor_actual'];
                                }elseif($busc_Agru['obtiene_desde'] == 'origen'){

                                    $aux_sum_rest = $aux_sum_rest - $resu['origen'];
                                }else{ // APLICACION

                                    $aux_sum_rest = $aux_sum_rest - $resu['aplicacion'];
                                }
                            }

                            $aux_string =$aux_string.",".$resu['valor_anterior'].$resu['origen'];
                        }
                        $valor_obtenido = $aux_sum_rest;
                        $total_suma = $total_suma + $valor_obtenido;

                }else{ // TOTAL_SUMA   nivel 2
                    $valor_obtenido = $total_suma;
                }

                    $res3 = array(
                            "idconfi_reporte_flujo_efectivo" => $qwe3['idconfi_reporte_flujo_efectivo'],
                            "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                            "tipo_operacion" => $qwe3['tipo_operacion'],
                            "nombre_registro" => $qwe3['nombre_registro'],
                            "valor" => $valor_obtenido,
                            "valor_Aux" => $aux_string,
                            "suma_nivel_2" => 0,
                            "profundidad" => '2',
                            "nivel_2" => [] //activo
                            );
                    array_push($res2['nivel_2'], $res3); 
            }
        // array_push($lista, $res2);
         array_push($lista, $res2); 
        // return $lista;
    }
    echo json_encode($lista, JSON_NUMERIC_CHECK); 
 }

    //-----------------------------------------------------------------------------
    public function insertar_debajo_de($idplandecuenta,$idplantilla_reporte,$reporte,$nombre_cuenta_superior,$nivel,$orden,$grupo,$es_calculable,$es_activo_fijo,$negrilla_cursiva,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        //ME PASARA EL ORDEN ACTUAL Q QUIERE INSERTAR

            if ($idplandecuenta != "" && $reporte != "" && $nivel != "") {
            $consulta = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nombre_cuenta_superior ='$nombre_cuenta_superior'
            AND idplantilla_reporte = '$idplantilla_reporte' AND nivel_registrado = '$nivel' AND idempresa ='$idempresa' AND orden >= '$orden'");
            // $resultado = $consulta->fetch_assoc();             
            // $orden_ulti = $resultado['total'] + 1;

            while ($qwe = $this->dbc->fetch($consulta)) {
                $nuevo_orden = $qwe['orden'] + 1;
                $edicion_orden = $this->dbc->query("UPDATE configuracion_reporte 
                                                        SET orden = '$nuevo_orden' 
                                                        WHERE idconfiguracion_reporte = '$qwe[idconfiguracion_reporte]'");
            }
                // Insertar el nuevo registro
                $registro_confi = $this->dbc->query("INSERT INTO configuracion_reporte(idplandecuenta,idplantilla_reporte,reporte,nombre_cuenta_superior,nivel_registrado,orden,grupo,es_calculable,es_activo_fijo,negrilla_cursiva,idempresa) 
                VALUES ('$idplandecuenta','$idplantilla_reporte','$reporte','$nombre_cuenta_superior','$nivel','$orden','$grupo','$es_calculable','$es_activo_fijo','$negrilla_cursiva','$idempresa')");
                if ($registro_confi === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registroCaracteristicas");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            } else {
                $res = array("danger", "No se pudo realizar el registro","Error");
            }
        
        echo json_encode($res);
        
    }
    public function listar_plantilla_por_registro($id) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $consulta = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
        // $resultado = $consulta->fetch_assoc();             
        
        while ($qwe = $this->dbc->fetch($consulta)) {

            $nuevo_orden = $qwe['orden'] + 1;

            $res = array(
                "idconfiguracion_reporte" => $qwe['idconfiguracion_reporte'],
                "idplandecuenta" => $qwe['idplandecuenta'],
                "reporte" => $qwe['reporte'],
                "nombre_cuenta_superior" => $qwe['nombre_cuenta_superior'],
                "nivel_registrado" => $qwe['nivel_registrado'],
                "orden" => $nuevo_orden,
                "grupo" => $qwe['grupo'],
                "es_calculable" => $qwe['es_calculable'],
                "es_activo_fijo" => $qwe['es_activo_fijo'],
                "idempresa" => $qwe['idempresa']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function editar_registros_padres_BG($id, $negrilla_cursiva) {
        $editar = $this->dbc->query(
            "UPDATE configuracion_reporte 
                SET negrilla_cursiva='$negrilla_cursiva' 
            WHERE idconfiguracion_reporte = '$id'"
        );
        if ($editar === TRUE) {
            $res = array("success", "se edito exitosamente","rp_editar_reporte");
        } else {
            $res = array("danger", "No se pudo editar");
        }
        echo json_encode($res);
    }

    // public function eliminar_registro_flujo_efectivo($id){

    //         if (0 > 0) {
    //             $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
    //         } else {
    //             // Insertar el nuevo registro
    //             $registroProveedor = $this->dbp->query("DELETE FROM confi_reporte_flujo_efectivo WHERE idconfi_reporte_flujo_efectivo = '$id'");
    //             if ($registroProveedor === TRUE) {                                                                                                                                                    
    //                 $res = array("ok", "se elimino exitosamente","eliminarCaracteristica");
    //             } else {
    //                 $res = array("danger", "No se pudo registrar");
    //             }
    //         }
    //         echo json_encode($res);
    // }
    public function eliminar_registro_flujo_efectivo($idplantilla, $idplantilla_padre, $nivel, $idplantilla_reporte, $empresa)
    {
        $id_empresa = $this->getidempresa($empresa);
        // $id_empresa = $this->get_id_empresa($idempresa);

        $get_plantilla = $this->dbc->query("SELECT * FROM confi_reporte_flujo_efectivo WHERE idconfi_reporte_flujo_efectivo = '$idplantilla'");
        $get_plant = $get_plantilla->fetch_assoc();
        if($get_plant['tipo_operacion'] == 'otras_operaciones' || $get_plant['tipo_operacion'] == 'operaciones_vinculacion'){

            //eliminar lo que tiene dentro tambien
            $eliminar_hijs = $this->dbc->query("DELETE FROM agrupacion_plantilla WHERE idplantilla_padre = '$idplantilla' AND idtipo_reportes ='$idplantilla_reporte'");
            $eliminar_hijs2 = $this->dbc->query("DELETE FROM agrupacion_plantilla WHERE idplantilla_hijo = '$idplantilla' AND idtipo_reportes ='$idplantilla_reporte'");
        }

        // Eliminar el registro
        $stmt_delete = $this->dbc->query("DELETE FROM confi_reporte_flujo_efectivo WHERE idconfi_reporte_flujo_efectivo = '$idplantilla'");

        // Reordenar eliminando huecos
        $this->dbc->query("SET @rownum := 0");
        // $filtro_padre = (int)$idplantilla_padre > 0 ? "id_plantilla_superior = $idplantilla_padre": "id_plantilla_superior IS NULL";
        $filtro_padre = (int)$idplantilla_padre > 0 
        ? "id_plantilla_superior = $idplantilla_padre" 
        : "id_plantilla_superior = 0";

        $stmt_reordenar = $this->dbc->query(
            "UPDATE confi_reporte_flujo_efectivo p
            JOIN (
                SELECT idconfi_reporte_flujo_efectivo, (@rownum := @rownum + 1) AS nuevo_orden
                FROM confi_reporte_flujo_efectivo
                WHERE idplantilla_reporte = '$idplantilla_reporte'
                AND $filtro_padre
                AND nivel_registro = '$nivel'
                AND idempresa = '$id_empresa'
                ORDER BY ISNULL(orden), orden ASC, idconfi_reporte_flujo_efectivo DESC
            ) AS ordenado
            ON p.idconfi_reporte_flujo_efectivo = ordenado.idconfi_reporte_flujo_efectivo
            SET p.orden = ordenado.nuevo_orden"
        );
        if ($stmt_reordenar === TRUE) {                                                                                                                                                    
            $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
        } else {
            $res = array("danger", "No se pudo registrar");
        }

        echo json_encode($res);
    }

    public function listar_agrupacion_plantilla_flujo_efectivo($id_plantilla_padre,$idplantilla_reporte,$tipo_operacion){
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        // $registro = $this->dbc->query("SELECT * FROM agrupacion_plantilla WHERE idplantilla_padre='$id_plantilla_padre'"); 
        $suma_resta = $this->dbc->query("SELECT * FROM agrupacion_plantilla WHERE idplantilla_padre='$id_plantilla_padre' 
        AND (tipo_operacion = 'sumar' || tipo_operacion = 'restar') AND idtipo_reportes = '$idplantilla_reporte'");

        if($suma_resta->num_rows > 0){
        
            while ($row = $this->dbc->fetch($suma_resta)) { // ESTO ES DE SUMAS O RESTAS DE CUENTAS

                if($tipo_operacion == 'otras_operaciones'){

                    $consul = $this->dbc->query("SELECT * FROM confi_reporte_flujo_efectivo WHERE idconfi_reporte_flujo_efectivo='$row[idplantilla_hijo]'");
                    $nom_hij = $consul->fetch_assoc();
                    $nombre_hijo = $nom_hij['nombre_registro'];
                }elseif($tipo_operacion == 'operaciones_vinculacion'){

                    // $consul = $this->dbc->query("SELECT DISTINCT(nombre_actual) FROM balance_general_por_gestion WHERE idconfiguracion_reporte = '$row[idplantilla_hijo]' 
                    // AND idplantilla_reporte ='$idplantilla_reporte'");
                    $consul = $this->dbc->query("SELECT DISTINCT(nombre_actual) FROM balance_general_por_gestion WHERE idconfiguracion_reporte = '$row[idplantilla_hijo]'");
                    $nom_hij = $consul->fetch_assoc();
                    $nombre_hijo = $nom_hij['nombre_actual'];
                }


                    $lista[] = [
                        "idagrupacion_plantilla" => $row['idagrupacion_plantilla'],
                        "idplantilla_padre"=>$row['idplantilla_padre'],
                        "idplantilla_hijo" => $row['idplantilla_hijo'],
                        "tipo_operacion" => $row['tipo_operacion'],
                        "nombre" => $nombre_hijo,
                        "obtiene_desde" => $row['obtiene_desde'],
                        "monto" => $row['monto']
                    ];
            }
        }else{
            //NADA 
        }
            echo json_encode($lista, JSON_PRETTY_PRINT);
        }

        public function listar_flujo_efectivo_select_otras_operaciones($idplantilla_reporte) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_confi_report = $this->dbc->query("SELECT * FROM confi_reporte_flujo_efectivo WHERE idplantilla_reporte = '$idplantilla_reporte'");
    
        while ($qwe = $this->dbc->fetch($get_confi_report)) {
            $res = array(
                "idconfi_reporte_flujo_efectivo" => $qwe['idconfi_reporte_flujo_efectivo'],
                "nombre_registro" => $qwe['nombre_registro']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_balance_general_guardados($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_bal_gener = $this->dbc->query("SELECT DISTINCT(idgestion) FROM balance_general_por_gestion WHERE idempresa ='$idempresa'");
    
        while ($qwe = $this->dbc->fetch($get_bal_gener)) {

            $gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion ='$qwe[idgestion]'");
            $gst = $gestion->fetch_assoc();

            $bl_gest = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idgestion ='$qwe[idgestion]' LIMIT 1");
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

    public function editar_flujo_efectivo($idplantilla, $idconfi_reporte, $obtiene_desde, $nombre_registro, $tipo_operacion, $orden, $idplantilla_padre,$negrilla_cursiva, $empresa) {
        $idempresa = $this->getidempresa($empresa);

        $pregunta = $this->dbc->query("SELECT * FROM confi_reporte_flujo_efectivo WHERE idconfi_reporte_flujo_efectivo = '$idplantilla'");
        $res_pregunta = $pregunta->fetch_assoc();

        if($orden == $res_pregunta['orden']){ // NO QUIERE EDITAR EL ORDEN
            
        }elseif($orden > $res_pregunta['orden']){// SI QUIEREN CAMBIAR EL ORDEN
            //EL NUEVO ORDEN ES MAYOR QUE EL ORDEN Q YA ESTA REGISTRADO   EL ORDEN TIENE Q DECENDER  5,4,3...

            $orden_inicio = $res_pregunta['orden'] + 1;

                $consulta_nivel_1 = $this->dbc->query("SELECT * FROM confi_reporte_flujo_efectivo where idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                AND idempresa = '$idempresa' AND nivel_registro = '$res_pregunta[nivel_registro]' AND id_plantilla_superior ='$res_pregunta[id_plantilla_superior]' 
                AND orden BETWEEN '$orden_inicio' AND '$orden' ORDER BY orden ASC");

                while ($rg = $this->dbc->fetch($consulta_nivel_1)) {
                        $nuevo_orden = $rg['orden'] - 1;
                        $editar_orden_demas = $this->dbc->query("UPDATE confi_reporte_flujo_efectivo
                                    SET orden = '$nuevo_orden'
                                    WHERE idconfi_reporte_flujo_efectivo = '$rg[idconfi_reporte_flujo_efectivo]';");
                    }
                    

        }elseif($orden < $res_pregunta['orden']){// SI QUIEREN CAMBIAR EL ORDEN
            //EL NUEVO ORDEN ES MAYOR QUE EL ORDEN Q YA ESTA REGISTRADO   EL ORDEN TIENE Q DECENDER  5,4,3...

            $orden_final = $res_pregunta['orden'] - 1;

                $consulta_nivel_1 = $this->dbc->query("SELECT * FROM confi_reporte_flujo_efectivo where idplantilla_reporte = '$res_pregunta[idplantilla_reporte]' 
                AND idempresa = '$idempresa' AND nivel_registro = '$res_pregunta[nivel_registro]' AND id_plantilla_superior ='$res_pregunta[id_plantilla_superior]' 
                AND orden BETWEEN '$orden' AND '$orden_final' ORDER BY orden ASC");

                while ($rg = $this->dbc->fetch($consulta_nivel_1)) {
                        $nuevo_orden = $rg['orden'] + 1;
                        $editar_orden_demas = $this->dbc->query("UPDATE confi_reporte_flujo_efectivo
                                    SET orden = '$nuevo_orden'
                                    WHERE idconfi_reporte_flujo_efectivo = '$rg[idconfi_reporte_flujo_efectivo]';");
                    }
                   
        }

        if($tipo_operacion == 'titulo' || $tipo_operacion == 'total_suma' || $tipo_operacion == 'otras_operaciones'){ //TITULO, TOTAL_SUMA, OTRAS_OPERACIONES

            $editar = $this->dbc->query("UPDATE confi_reporte_flujo_efectivo
                                    SET 
                                    nombre_registro = '$nombre_registro',
                                    negrilla_cursiva = '$negrilla_cursiva',
                                    orden = '$orden'
                                    WHERE idconfi_reporte_flujo_efectivo = '$idplantilla';");

        }elseif($tipo_operacion == 'vinculacion'){ //VINCULACION, OPERACIONES_VINCULACION

            $editar = $this->dbc->query("UPDATE confi_reporte_flujo_efectivo
                                    SET 
                                    nombre_registro = '$nombre_registro',
                                    idconfiguracion_reporte = '$idconfi_reporte',
                                    obtiene_desde = '$obtiene_desde',
                                    negrilla_cursiva = '$negrilla_cursiva',
                                    orden = '$orden'
                                    WHERE idconfi_reporte_flujo_efectivo = '$idplantilla';");

        }elseif($tipo_operacion == 'operaciones_vinculacion'){ //VINCULACION, OPERACIONES_VINCULACION

        if($nombre_registro == ""){
            // obtenemos el nombre_registro del idconfiguracion_reporte
            $conf_report = $this->dbc->query("SELECT * from configuracion_reporte 
                where idconfiguracion_reporte = '$idconfi_reporte'");

                $cr = $conf_report->fetch_assoc();

                $plancuenta = $this->dbc->query("SELECT * from plandecuenta 
                where idplandecuenta = '$cr[idplandecuenta]'");

                $pl = $plancuenta->fetch_assoc();
                $nombre_aux = $pl['nombreplan'];
        }else{
            $nombre_aux = $nombre_registro;
        }

            $editar = $this->dbc->query("UPDATE confi_reporte_flujo_efectivo
                                    SET 
                                    nombre_registro = '$nombre_aux',
                                    idconfiguracion_reporte = '$idconfi_reporte',
                                    obtiene_desde = '$obtiene_desde',
                                    negrilla_cursiva = '$negrilla_cursiva',
                                    orden = '$orden'
                                    WHERE idconfi_reporte_flujo_efectivo = '$idplantilla';");

        }elseif($tipo_operacion == 'calculable'){ //

        // obtenemos el nombre_registro del idconfiguracion_reporte
        $conf_report = $this->dbc->query("SELECT * from configuracion_reporte 
                where idconfiguracion_reporte = '$idconfi_reporte'");

                $cr = $conf_report->fetch_assoc();

                $plancuenta = $this->dbc->query("SELECT * from plandecuenta 
                where idplandecuenta = '$cr[idplandecuenta]'");

                $pl = $plancuenta->fetch_assoc();
                $nombre_aux = $pl['nombreplan'];

            $editar = $this->dbc->query("UPDATE confi_reporte_flujo_efectivo
                                    SET 
                                    nombre_registro = '$nombre_aux',
                                    idconfiguracion_reporte = '$idconfi_reporte',
                                    obtiene_desde = '$obtiene_desde',
                                    negrilla_cursiva = '$negrilla_cursiva',
                                    orden = '$orden'
                                    WHERE idconfi_reporte_flujo_efectivo = '$idplantilla';");
        }

            if ($editar === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas",$idplantilla, $idconfi_reporte, $nombre_registro, $tipo_operacion, $orden, $idplantilla_padre, $empresa);
            } else {
                $res = array("danger", "No se pudo editar");
            }
        // }
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
    // } editar_registros_padres_BG
//activo--1    pasivo --2  patrimonio---3    ingresos---4   egresos_gastos --5  orden ---6  eliminar    editar  reporte_balance_general_consolidado listar_plantilla_flujo_efectivo
}
?>
