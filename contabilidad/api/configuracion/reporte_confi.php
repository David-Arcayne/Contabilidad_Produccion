<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; editar

class Reporte_confi extends DB{

    public function activar_desactivar_tipo_reportes($idtipo_reportes, $tipo_reporte, $empresa){
         ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa);

            $tipo_reporte_lista = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$idtipo_reportes'");
            $esta_activo = $tipo_reporte_lista->fetch_assoc();

            if($esta_activo['estado'] == '1'){ // ESTA ACTIVO
                // DEBO DESACTIVARLO Y NO ACTIVAR NINGUNO 
                $desactivar = $this->dbc->query("UPDATE tipo_reportes SET estado = '0' WHERE idtipo_reportes = '$idtipo_reportes'");

                if ($desactivar === TRUE){   
                                                                                                                                                                    
                    $res = array("success", "Registro exitoso","rp_registrar_reporte");
                }else {
                    $res = array("danger", "No se pudo registrar");
                }
            }else{ // NO ESTA ACTIVO
                //ACTIVAR DE FORMA NORMAL Y DESACTIVAR LOS DEMAS
                $activar = $this->dbc->query("UPDATE tipo_reportes SET estado = '1' WHERE idtipo_reportes = '$idtipo_reportes'");

                if ($activar === TRUE){   
                    // $desactivado = $this->dbc->query("UPDATE tipo_reportes SET estado = '0' WHERE tipo_reporte = '$tipo_reporte' AND idtipo_reportes != '$idtipo_reportes' AND idempresa = '$idempresa'");
                                                                                                                                                                    
                    $res = array("success", "Registro exitoso","rp_registrar_reporte");
                }else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
    
        echo json_encode($res);
    }

    public function registrar_tipo_reportes($nombre, $descripcion, $tipo_reporte, $empresa) {
        $idempresa = $this->getidempresa($empresa);

        // Insertar el nuevo registro
        $registro = $this->dbc->query("INSERT INTO tipo_reportes(nombre, descripcion, tipo_reporte, idempresa) VALUES ('$nombre', '$descripcion', '$tipo_reporte', '$idempresa')");
        if ($registro === TRUE) {                                                                                                                                                                
            $res = array("success", "Registro exitoso","rp_registrar_reporte");
        } else {
            $res = array("danger", "No se pudo registrar", $nombre);
        }
        echo json_encode($res);
    }

 public function listar_tipo_reportes($empresa) {
    $idempresa = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idempresa='$idempresa'");
    
        while ($row = $this->dbc->fetch($registro)) {
            $lista[] = [
                "idtipo_reportes" => $row['idtipo_reportes'],
                "nombre"=>$row['nombre'],
                "descripcion" => $row['descripcion'],
                "tipo_reporte" => $row['tipo_reporte'],
                "estado" => $row['estado']
            ];
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }
    public function listar_tipo_reportes_activos($es_activo,$empresa) {
    $idempresa = $this->getidempresa($empresa);
        $lista = [];
        $tipo_reportes = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idempresa='$idempresa'");
    
        if($es_activo == '1'){
            while ($row = $this->dbc->fetch($tipo_reportes)) {
                if($row['estado'] == '1'){ // DEDO ARRIBA, MOSTRAR
                    $lista[] = [
                    "idtipo_reportes" => $row['idtipo_reportes'],
                    "nombre"=>$row['nombre'],
                    "descripcion" => $row['descripcion'],
                    "tipo_reporte" => $row['tipo_reporte'],
                    "estado" => $row['estado']
                    ];
                }else{
                    //NO MOSTRAR 
                }
    
            }
        }else{
            while ($row = $this->dbc->fetch($tipo_reportes)) {
                if($row['estado'] == '0'){ // DEDO ABAJO, MOSTRAR
                    $lista[] = [
                    "idtipo_reportes" => $row['idtipo_reportes'],
                    "nombre"=>$row['nombre'],
                    "descripcion" => $row['descripcion'],
                    "tipo_reporte" => $row['tipo_reporte'],
                    "estado" => $row['estado']
                    ];
                }else{
                    //NO MOSTRAR 
                }
    
            }
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }
    
    public function editar_tipo_reportes($idtipo_reportes, $nombre, $descripcion, $tipo_reporte) {
        $editar = $this->dbc->query(
            "UPDATE tipo_reportes 
                SET nombre='$nombre', descripcion='$descripcion', tipo_reporte='$tipo_reporte' 
            WHERE idtipo_reportes = '$idtipo_reportes'"
        );
        if ($editar === TRUE) {
            $res = array("success", "se edito exitosamente","rp_editar_reporte");
        } else {
            $res = array("danger", "No se pudo editar");
        }
        echo json_encode($res);
    }

    // public function eliminar_tipo_reportes($idtipo_reportes) {

    //     $eliminar = $this->dbc->query("DELETE FROM tipo_reportes WHERE idtipo_reportes = '$idtipo_reportes'");
    //     if ($eliminar === TRUE) {                                                                                                                                                    
    //         $res = array("success", "se elimino exitosamente","rp_eliminar_reporte");
    //     } else {
    //         $res = array("danger", "No se pudo eliminar");
    //     }
    //     echo json_encode($res);
    // }

public function eliminar_tipo_reportes($idtipo_reportes) {

        $eliminar_reporte = $this->dbc->query("DELETE FROM tipo_reportes WHERE idtipo_reportes = '$idtipo_reportes'");
        
        if ($eliminar_reporte === TRUE) {     
            $existe_confi_reporte = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplantilla_reporte = '$idtipo_reportes'");
            $existe_pr_plantilla = $this->dbc->query("SELECT * FROM pr_plantilla WHERE idplantilla_reporte = '$idtipo_reportes'");
            if($existe_pr_plantilla->num_rows > 0){
                $eliminar_plantillas = $this->dbc->query("DELETE FROM pr_plantilla WHERE idplantilla_reporte = '$idtipo_reportes'");
            }elseif($existe_confi_reporte->num_rows > 0){
                $eliminar_plantillas = $this->dbc->query("DELETE FROM configuracion_reporte WHERE idplantilla_reporte = '$idtipo_reportes'");
            } 

            $existe_vincu_confi = $this->dbc->query("SELECT * FROM vinculacion_cuenta_depreciacion WHERE idtipo_reportes = '$idtipo_reportes'");

            $existe_agru_plant = $this->dbc->query("SELECT * FROM agrupacion_plantilla WHERE idtipo_reportes = '$idtipo_reportes'");

            if($existe_vincu_confi->num_rows > 0){
                $eliminar_vincu = $this->dbc->query("DELETE FROM vinculacion_cuenta_depreciacion WHERE idtipo_reportes = '$idtipo_reportes'");

            }elseif($existe_agru_plant->num_rows > 0){
                $eliminar_vincu = $this->dbc->query("DELETE FROM agrupacion_plantilla WHERE idtipo_reportes = '$idtipo_reportes'");
            }   
                                                                                                                                    
            $res = array("success", "se elimino exitosamente","rp_eliminar_reporte");
        } else {
            $res = array("danger", "No se pudo eliminar");
        }
        echo json_encode($res);
    }

    //-----------------------------------------------------------------------------
    public function registrar_configuracion_reporte($idplandecuenta,$idplantilla_reporte,$reporte,$nombre_cuenta_superior,$nivel,$grupo,$es_calculable,$es_activo_fijo,$negrilla_cursiva,$empresa){
      
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

            if ($idplandecuenta != "" && $reporte != "" && $nivel != "") {
            $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM configuracion_reporte WHERE nombre_cuenta_superior ='$nombre_cuenta_superior'
            AND nivel_registrado = '$nivel' AND idempresa ='$idempresa'");
            $resultado = $consulta->fetch_assoc();             
            $orden_ulti = $resultado['total'] + 1;

                // Insertar el nuevo registro
                $registroProveedor = $this->dbc->query("INSERT INTO configuracion_reporte(idplandecuenta,idplantilla_reporte,reporte,nombre_cuenta_superior,nivel_registrado,orden,grupo,es_calculable,es_activo_fijo,negrilla_cursiva,idempresa) 
                VALUES ('$idplandecuenta','$idplantilla_reporte','$reporte','$nombre_cuenta_superior','$nivel','$orden_ulti','$grupo','$es_calculable','$es_activo_fijo','$negrilla_cursiva','$idempresa')");
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
    public function filtro_por_nivel($reporte,$nivel,$grupo,$idtipo_reporte,$empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        if($reporte != "" && $nivel > 0){
            // LISTARA EL FILTRO
            $getPedido = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE reporte = '$reporte' AND nivel_registrado = '$nivel' AND grupo = '$grupo' 
            AND idplantilla_reporte = '$idtipo_reporte' AND idempresa = '$idempresa'");

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
    
//     public function reporte_balance_general($fecha_ini,$fecha_fin,$empresa) {
//         ini_set('display_errors', 1); 
//         ini_set('display_startup_errors', 1);
//         error_reporting(E_ALL);
        
//         $lista = [];
//         $idempresa = $this->getidempresa($empresa);
//         $gestion = $this->getidgestion($empresa);

//         $lista =[];
//         $get_nivel_2 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '' AND reporte ='balance_general' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//         $total_pasivo_patrimonio = 0;
//         while ($qwe2 = $this->dbc->fetch($get_nivel_2)) {
//             $cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe2[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
//             $nombre_cuenta = $cuenta->fetch_assoc();
//             if($qwe2['grupo'] == '1'){
//         // preguntar si la cuenta en la q estamos es activo fijo
//                 $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
//                 $nivel_reg = $nivel_reporte->fetch_assoc();

//             //    if($nivel_reg['nivel_registrado'] == '4'){

//                     $res2 = array(
//                     "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
//                     "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
//                     "codigo" => $nombre_cuenta['numero'],
//                     "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
//                     "suma_nivel_2" => 0,
//                     "nivel_2" => [] //activo
//                     );
//                 $suma_nivel_2 = 0;
//                 $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                 while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
//                     // ACTIVO_CIRCULANTE, ACTIVO_FIJO
//                     // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

//                     // }else{

//                     // }
                    
//                     $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
//                     $nombre_cuenta2 = $cuenta2->fetch_assoc();
//                     $res3 = array(
//                     "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
//                     "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
//                     "codigo" => $nombre_cuenta2['numero'],
//                     "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
//                     "suma_nivel_3" => 0,
//                     "nivel_3" => [] //activo
//                     );
//                     $suma_nivel_3 = 0;
//                     $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                     while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
//                         // Activo_disponible, exigible, Acciones telefonicas
//                         $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
//                         $nombre_cuenta3 = $cuenta3->fetch_assoc();

//                          if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE
//                             //ESTO ES NIVEL 3
//                             if($qwe4['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
//                               $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe4[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
//                               if($get_fijo->num_rows > 0){
//                                 $fijo = $get_fijo->fetch_assoc();

//                                 $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_A = $suma_cuentas_A->fetch_assoc();

//                                 $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

//                                 $diferencia = $valor_A['total'] - $valor_B['total'];

//                                 $suma_nivel_3 = $suma_nivel_3 + $diferencia;
//                                 if($valor_A['total'] == null || $valor_A['total'] == '0'){
//                                     //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
//                                 }else{
//                                     $res4 = array(
//                                 "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
//                                 "codigo" => $nombre_cuenta3['numero'], 
//                                 "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                 "valor" => $valor_A['total'],
//                                 "valor_restado" => $diferencia,
//                                 "nivel_4" => [] //activo   
//                                 );

//                                 array_push($res3['nivel_3'], $res4);
//                                 }
                                
//                               }else{
//                                 $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

//                             if($valor_B['total'] == null || $valor_B['total'] == '0'){
//                                 //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
//                             }else{
//                                 $res4 = array(
//                                 "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
//                                 "codigo" => $nombre_cuenta3['numero'],  
//                                 "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                 "valor" => $valor_B['total'],
//                                 // "valor_restado" => $diferencia,
//                                 "nivel_4" => [] //activo   
//                                 );
//                                 array_push($res3['nivel_3'], $res4);
//                             }
                    
//                               } 

//                             }else{
//                                 $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor = $suma_cuentas->fetch_assoc();
//                                 $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
//                                 if($valor['total'] == null || $valor['total'] == '0'){
//                                     //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
//                                 }else{
//                                     $res4 = array(
//                                     "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                     "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
//                                     "codigo" => $nombre_cuenta3['numero'],   
//                                     "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                     "valor" => $valor['total'],
//                                     "nivel_4" => [] //activo   
//                                     );
//                                     array_push($res3['nivel_3'], $res4); 
//                                 }
                                
//                             }

//                          }else{ //NO ES CALCULABLE
//                             //ESTO ES NIVEL 3
//                              $res4 = array(
//                         "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                         "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
//                         "codigo" => $nombre_cuenta3['numero'], 
//                         "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                         "suma_nivel_4" => 0,
//                         "nivel_4" => [] //activo
//                         );
//                         $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                         $suma_nivel_4 = 0;
//                         // $suma_nivel_5 = 0;
//                         $aux_sum_5 = 0;
//                         while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
//                             $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
//                             $nombre_cuenta4 = $cuenta4->fetch_assoc();

//                             // $suma_nivel_5 = 0;

//                             if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
                                
//                             //ESTO ES NIVEL 4
//                             if($qwe5['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
//                               $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe5[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
//                               if($get_fijo->num_rows > 0){
//                                 $fijo = $get_fijo->fetch_assoc();

//                                 $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe5[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_A = $suma_cuentas_A->fetch_assoc();

//                                 $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

//                                 $diferencia = $valor_A['total'] - $valor_B['total'];

//                                 $suma_nivel_4 = $suma_nivel_4 + $diferencia;
//                                 if($valor_A['total'] == null || $valor_A['total'] == '0'){
//                                     // -------------------------------------------
//                                 }else{
//                                     $res5 = array(
//                                     "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
//                                     "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],   
//                                     "codigo" => $nombre_cuenta4['numero'], 
//                                     "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
//                                     "valor" => $valor_A['total'],
//                                     "valor_restado" => $diferencia,
//                                     "nivel_5" => [] //activo   
//                                     );
//                                 array_push($res4['nivel_4'], $res5);
//                                 }
                                
//                               }else{
//                                 $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe5[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_B = $suma_cuentas_depreciacion->fetch_assoc();
//                                 if($valor_B['total'] == null || $valor_B['total'] == '0'){
//                                     //---------------------------------
//                                 }else{
//                                     $res5 = array(
//                                     "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
//                                     "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
//                                     "codigo" => $nombre_cuenta4['numero'],  
//                                     "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
//                                     "valor" => $valor_B['total'],
//                                     // "valor_restado" => $diferencia,
//                                     "nivel_5" => [] //activo   
//                                     );
//                                     array_push($res4['nivel_4'], $res5);
//                                 }
                                
//                               } 

//                             }else{ //NO ES ACTIVO FIJO
//                                 $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor = $suma_cuentas->fetch_assoc();
//                                 $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
//                                 if($valor['total'] == null || $valor['total'] == '0'){
//                                     //--------------------------------------------
//                                 }else{
//                                     // $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
//                                     $res5 = array(
//                                     "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
//                                     "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
//                                     "codigo" => $nombre_cuenta4['numero'],   
//                                     "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
//                                     "valor" => $valor['total'],
//                                     "suma_nivel_5" => 0,
//                                     "nivel_5" => [] //activo   
//                                     );
//                                     array_push($res4['nivel_4'], $res5); 
//                                 }
                                
//                             }

//                             }else{ // NO ES CALCULABLE
//                          $res5 = array(
//                         "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
//                         "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
//                         "codigo" => $nombre_cuenta4['numero'], 
//                         "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
//                         "valor" => 0,
//                         "suma_nivel_5" => 0,
//                         "nivel_5" => [] //activo
//                         );
//                         $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                         $suma_nivel_5 = 0;
//                         while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
//                             $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
//                             $nombre_cuenta5 = $cuenta5->fetch_assoc();
//                             $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor2 = $suma_cuentas2->fetch_assoc();
//                                 $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
//                                     // $aux_sum_5 = $suma_nivel_5;

//                                 if($valor2['total'] == null || $valor2['total'] == '0'){
//         //------------------------------------------------------------------------------
//                                 }else{
//                                     $res6 = array(
//                                 "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
//                                 "codigo" => $nombre_cuenta5['numero'],   
//                                 "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
//                                 "valor" => $valor2['total'],
//                                 "nivel_6" => [] //activo   
//                                 );
//                                 array_push($res5['nivel_5'], $res6); 
//                                 }
                                
//                                 // $res4['suma_nivel_5'] = $suma_nivel_5;
//                         }
//                         // $aux_sum_5 = $suma_nivel_5;

//                         $res5['suma_nivel_5'] = $suma_nivel_5;
//                         $res5['valor'] = $suma_nivel_5;
//                         $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];

//                             array_push($res4['nivel_4'], $res5); 

//                         } // AQUI TERMINA EL NO ES CALCULABLE
//                         // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
//                         // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
//                         // array_push($res3['nivel_3'], $res4); 
//                          }
//                          $res4['suma_nivel_4'] = $suma_nivel_4;
//                         $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
//                 array_push($res3['nivel_3'], $res4); 
                        
//                     }
//                         // $res3['suma_nivel_3'] = $suma_nivel_3;
//                         // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

//                         // array_push($res2['nivel_2'], $res3); 
//                     }
//                      $res3['suma_nivel_3'] = $suma_nivel_3;
//                         $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
//         array_push($res2['nivel_2'], $res3); 
//                     // $res2['suma_nivel_2'] = $suma_nivel_2;
//                 }
//     $res2['suma_nivel_2'] = $suma_nivel_2; 

//             }elseif($qwe2['grupo'] == '2'){ //PASIVO

//                 $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
//                 $nivel_reg = $nivel_reporte->fetch_assoc();
//                 if($nivel_reg['nivel_registrado'] == '3'){
//                     $res2 = array(
//                     "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
//                     "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
//                     "codigo" => $nombre_cuenta['numero'],
//                     "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
//                     "suma_nivel_2" => 0,
//                     "total_pasi_pati" => 0,
//                     "nivel_2" => [] //activo
//                     );
//                 $suma_nivel_2 = 0;
//                 $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                 while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
//                     $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO
//                     $nombre_cuenta2 = $cuenta2->fetch_assoc();
//                     $res3 = array(
//                     "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
//                     "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
//                     "codigo" => $nombre_cuenta2['numero'],
//                     "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
//                     "suma_nivel_3" => 0,
//                     "nivel_3" => [] //activo
//                     );
//                     $suma_nivel_3 = 0;
//                     $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                     while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
//                         $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
//                         $nombre_cuenta3 = $cuenta3->fetch_assoc();

//                         if($qwe4['es_calculable'] == 'si'){
//                             $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
//                             INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                             INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                             where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
//                             AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                             $valor = $suma_cuentas->fetch_assoc();
//                             $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
//                             if($valor['total'] == null || $valor['total'] == '0'){
// //-----------------------------------
//                             }else{
//                                 $res4 = array(
//                                 "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
//                                 "codigo" => $nombre_cuenta3['numero'], 
//                                 "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                 "valor" => $valor['total'],
//                                 "nivel_4" => [] //activo
//                                 );
                            
//                                 array_push($res3['nivel_3'], $res4); 
//                             }
//                         }else{ // NO ES CALCULABLE
//                             $res4 = array(
//                                 "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
//                                 "codigo" => $nombre_cuenta3['numero'], 
//                                 "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                 "valor" => $valor['total'],
//                                 "nivel_4" => [] //activo
//                                 );

//                             $suma_nivel_4 = 0;
//                             $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                             while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {

//                             }// fin del nivel 5 55555555555555555555555555555555555555555555555555555555555
//                         }
                            
//                     } //fin del  get nivel 4 4444444444444444444444444444444444444444444444444444444444444444444444444444444444444
//                     $res3['suma_nivel_3'] = $suma_nivel_3;
//                     // $suma_nivel_3 = $suma_nivel_3 + $res3['suma_nivel_3'];
//                     $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
//                     array_push($res2['nivel_2'], $res3); 

//                     } // fin del nivel 3 33333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
//                     $res2['suma_nivel_2'] = $suma_nivel_2;
//                 }
//                 $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
//                 $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
                
//             }elseif($qwe2['grupo'] == '3'){ //PATRIMONIO
//                 $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
//                 $nivel_reg = $nivel_reporte->fetch_assoc();
//                 if($nivel_reg['nivel_registrado'] == '2'){
//                     $res2 = array(
//                     "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
//                     "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
//                     "codigo" => $nombre_cuenta['numero'],
//                     "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
//                     "suma_nivel_2" => 0,
//                     "total_pasi_pati" => 0,
//                     "nivel_2" => [] //activo
//                     );
//                 $suma_nivel_2 = 0;
//                 $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
//                 while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
//                     $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO
//                     $nombre_cuenta2 = $cuenta2->fetch_assoc();

//                     $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
//                             INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                             INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                             where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta2[idplandecuenta]'
//                             AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                             $valor = $suma_cuentas->fetch_assoc();
//                             $suma_nivel_2 = $suma_nivel_2 + $valor['total'];

//                             if($valor['total'] == null || $valor['total'] == '0'){
//                                 //-----------------------------------------------
//                             }else{
//                                 $res3 = array(
//                                 "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
//                                 "codigo" => $nombre_cuenta2['numero'],
//                                 "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
//                                 "valor" => $valor['total'],
//                                 "nivel_3" => [] //activo
//                                 );

//                                 array_push($res2['nivel_2'], $res3); 
//                             }
//                     }
//                     $res2['suma_nivel_2'] = $suma_nivel_2;
//                 }
//                 $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
//                 $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
//             }
//            array_push($lista, $res2); 
//         }     
        
//         // array_push($lista, $res2);
//         echo json_encode($lista, JSON_NUMERIC_CHECK);  
//     }

 public function reporte_balance_general($idplantilla_reporte,$fecha_ini,$fecha_fin,$empresa) {
        ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getidgestion($empresa);

        $lista =[];
        $get_nivel_2 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '' AND reporte ='balance_general' AND idempresa='$idempresa' 
        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
        $total_pasivo_patrimonio = 0;
        while ($qwe2 = $this->dbc->fetch($get_nivel_2)) {
            $cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe2[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
            $nombre_cuenta = $cuenta->fetch_assoc();
            if($qwe2['grupo'] == '1'){
        // preguntar si la cuenta en la q estamos es activo fijo
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();

            //    if($nivel_reg['nivel_registrado'] == '4'){

                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "grupo" => $qwe2['grupo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "es_calculable" => $qwe2['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe2[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND reporte ='balance_general' AND idempresa='$idempresa'
                AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    // ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

                    // }else{

                    // }
                    
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();
                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "grupo" => $qwe3['grupo'],
                    "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                    "es_calculable" => $qwe3['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "codigo" => $nombre_cuenta2['numero'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe3[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' 
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        // Activo_disponible, exigible, Acciones telefonicas
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                         if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE
                            //ESTO ES NIVEL 3
                            if($qwe4['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
                              $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe4[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                              if($get_fijo->num_rows > 0){
                                $fijo = $get_fijo->fetch_assoc();

                                $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_A = $suma_cuentas_A->fetch_assoc();

                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $diferencia = $valor_A['total'] - $valor_B['total'];

                                $suma_nivel_3 = $suma_nivel_3 + $diferencia;
                                if($valor_A['total'] == null || $valor_A['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "grupo" => $qwe4['grupo'],
                                "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                "es_calculable" => $qwe4['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                                "codigo" => $nombre_cuenta3['numero'], 
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_A['total'],
                                "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );

                                array_push($res3['nivel_3'], $res4);
                                }
                                
                              }else{
                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                            if($valor_B['total'] == null || $valor_B['total'] == '0'){
                                //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                            }else{
                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "grupo" => $qwe4['grupo'],
                                "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                "es_calculable" => $qwe4['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                                "codigo" => $nombre_cuenta3['numero'],  
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_B['total'],
                                // "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4);
                            }
                    
                              } 

                            }else{
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                    "grupo" => $qwe4['grupo'],
                                    "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                    "es_calculable" => $qwe4['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta3['numero'],   
                                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                    "valor" => $valor['total'],
                                    "nivel_4" => [] //activo   
                                    );
                                    array_push($res3['nivel_3'], $res4); 
                                }
                                
                            }

                         }else{ //NO ES CALCULABLE
                            //ESTO ES NIVEL 3
                             $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "grupo" => $qwe4['grupo'],
                        "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                        "es_calculable" => $qwe4['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                        "codigo" => $nombre_cuenta3['numero'], 
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe4[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        // $suma_nivel_5 = 0;
                        $aux_sum_5 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();

                            // $suma_nivel_5 = 0;

                            if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
                                
                            //ESTO ES NIVEL 4
                            if($qwe5['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
                              $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe5[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                              if($get_fijo->num_rows > 0){
                                $fijo = $get_fijo->fetch_assoc();

                                $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_A = $suma_cuentas_A->fetch_assoc();

                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $diferencia = $valor_A['total'] - $valor_B['total'];

                                $suma_nivel_4 = $suma_nivel_4 + $diferencia;
                                if($valor_A['total'] == null || $valor_A['total'] == '0'){
                                    // -------------------------------------------
                                }else{
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],   
                                    "codigo" => $nombre_cuenta4['numero'], 
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor_A['total'],
                                    "valor_restado" => $diferencia,
                                    "nivel_5" => [] //activo   
                                    );
                                array_push($res4['nivel_4'], $res5);
                                }
                                
                              }else{
                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();
                                if($valor_B['total'] == null || $valor_B['total'] == '0'){
                                    //---------------------------------
                                }else{
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                                    "codigo" => $nombre_cuenta4['numero'],  
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor_B['total'],
                                    // "valor_restado" => $diferencia,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5);
                                }
                                
                              } 

                            }else{ //NO ES ACTIVO FIJO
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //--------------------------------------------
                                }else{
                                    // $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta4['numero'],   
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor['total'],
                                    "suma_nivel_5" => 0,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5); 
                                }
                                
                            }

                            }else{ // NO ES CALCULABLE
                         $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "grupo" => $qwe5['grupo'],
                        "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                        "es_calculable" => $qwe5['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                        "codigo" => $nombre_cuenta4['numero'], 
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "valor" => 0,
                        "suma_nivel_5" => 0,
                        "nivel_5" => [] //activo
                        );
                        $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe5[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_5 = 0;
                        while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
                            $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta5 = $cuenta5->fetch_assoc();
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor2 = $suma_cuentas2->fetch_assoc();
                                $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
                                    // $aux_sum_5 = $suma_nivel_5;

                                if($valor2['total'] == null || $valor2['total'] == '0'){
        //------------------------------------------------------------------------------
                                }else{
                                    $res6 = array(
                                "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                                "grupo" => $qwe6['grupo'],
                                "negrilla_cursiva" => $qwe6['negrilla_cursiva'],
                                "es_calculable" => $qwe6['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                                "codigo" => $nombre_cuenta5['numero'],   
                                "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                                "valor" => $valor2['total'],
                                "nivel_6" => [] //activo   
                                );
                                array_push($res5['nivel_5'], $res6); 
                                }
                                
                                // $res4['suma_nivel_5'] = $suma_nivel_5;
                        }
                        // $aux_sum_5 = $suma_nivel_5;

                        $res5['suma_nivel_5'] = $suma_nivel_5;
                        $res5['valor'] = $suma_nivel_5;
                        $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];

                            array_push($res4['nivel_4'], $res5); 

                        } // AQUI TERMINA EL NO ES CALCULABLE
                        // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        // array_push($res3['nivel_3'], $res4); 
                         }
                         $res4['suma_nivel_4'] = $suma_nivel_4;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                array_push($res3['nivel_3'], $res4); 
                        
                    }
                        // $res3['suma_nivel_3'] = $suma_nivel_3;
                        // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

                        // array_push($res2['nivel_2'], $res3); 
                    }
                     $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
        array_push($res2['nivel_2'], $res3); 
                    // $res2['suma_nivel_2'] = $suma_nivel_2;
                }
    $res2['suma_nivel_2'] = $suma_nivel_2; 

            }elseif($qwe2['grupo'] == '2'){ //PASIVO

                // preguntar si la cuenta en la q estamos es activo fijo
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();

            //    if($nivel_reg['nivel_registrado'] == '4'){

                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "grupo" => $qwe2['grupo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "es_calculable" => $qwe2['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe2[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' 
                AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    // ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

                    // }else{

                    // }
                    
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();
                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "grupo" => $qwe3['grupo'],
                    "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                    "es_calculable" => $qwe3['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "codigo" => $nombre_cuenta2['numero'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe3[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' 
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        // Activo_disponible, exigible, Acciones telefonicas
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                         if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE
                            //ESTO ES NIVEL 3
                
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                    "grupo" => $qwe4['grupo'],
                                    "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                    "es_calculable" => $qwe4['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta3['numero'],   
                                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                    "valor" => $valor['total'],
                                    "nivel_4" => [] //activo   
                                    );
                                    array_push($res3['nivel_3'], $res4); 
                                }

                         }else{ //NO ES CALCULABLE
                            //ESTO ES NIVEL 3
                             $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "grupo" => $qwe4['grupo'],
                        "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                        "es_calculable" => $qwe4['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                        "codigo" => $nombre_cuenta3['numero'], 
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe4[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        // $suma_nivel_5 = 0;
                        $aux_sum_5 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();

                            // $suma_nivel_5 = 0;

                            if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
                                
                            //ESTO ES NIVEL 4
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //--------------------------------------------
                                }else{
                                    // $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta4['numero'],   
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor['total'],
                                    "suma_nivel_5" => 0,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5); 
                                }

                            }else{ // NO ES CALCULABLE
                         $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "grupo" => $qwe5['grupo'],
                        "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                        "es_calculable" => $qwe5['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                        "codigo" => $nombre_cuenta4['numero'], 
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "valor" => 0,
                        "suma_nivel_5" => 0,
                        "nivel_5" => [] //activo
                        );
                        $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe5[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_5 = 0;
                        while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
                            $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta5 = $cuenta5->fetch_assoc();
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor2 = $suma_cuentas2->fetch_assoc();
                                $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
                                    // $aux_sum_5 = $suma_nivel_5;

                                if($valor2['total'] == null || $valor2['total'] == '0'){
        //------------------------------------------------------------------------------
                                }else{
                                    $res6 = array(
                                "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                                "grupo" => $qwe6['grupo'],
                                "negrilla_cursiva" => $qwe6['negrilla_cursiva'],
                                "es_calculable" => $qwe6['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                                "codigo" => $nombre_cuenta5['numero'],   
                                "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                                "valor" => $valor2['total'],
                                "nivel_6" => [] //activo   
                                );
                                array_push($res5['nivel_5'], $res6); 
                                }
                                
                                // $res4['suma_nivel_5'] = $suma_nivel_5;
                        }
                        // $aux_sum_5 = $suma_nivel_5;

                        $res5['suma_nivel_5'] = $suma_nivel_5;
                        $res5['valor'] = $suma_nivel_5;
                        $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];

                            array_push($res4['nivel_4'], $res5); 

                        } // AQUI TERMINA EL NO ES CALCULABLE
                        // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        // array_push($res3['nivel_3'], $res4); 
                         }
                         $res4['suma_nivel_4'] = $suma_nivel_4;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                array_push($res3['nivel_3'], $res4); 
                        
                    }
                        // $res3['suma_nivel_3'] = $suma_nivel_3;
                        // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

                        // array_push($res2['nivel_2'], $res3); 
                    }
                     $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
                    array_push($res2['nivel_2'], $res3); 
                                // $res2['suma_nivel_2'] = $suma_nivel_2;
                            }
                $res2['suma_nivel_2'] = $suma_nivel_2; 

                $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
                $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
                
            }elseif($qwe2['grupo'] == '3'){ //PATRIMONIO
                // preguntar si la cuenta en la q estamos es activo fijo
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();

            //    if($nivel_reg['nivel_registrado'] == '4'){

                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "grupo" => $qwe2['grupo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "es_calculable" => $qwe2['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe2[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' 
                AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    // ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

                    // }else{

                    // }
                    
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();

                    if($qwe3['es_calculable'] == 'si'){ // ES CALCULABLE
                        //ESTO ES NIVEL 2
                        $suma_cuentas0 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta2[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor0 = $suma_cuentas0->fetch_assoc();
                                $suma_nivel_2 = $suma_nivel_2 + $valor0['total'];
                                if($valor0['total'] == null || $valor0['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res3 = array(
                                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                                    "grupo" => $qwe3['grupo'],
                                    "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                                    "es_calculable" => $qwe3['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta2['numero'],   
                                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                                    "valor" => $valor0['total'],
                                    "nivel_3" => [] //activo   
                                    );
                                    array_push($res2['nivel_2'], $res3); 
                                }
                    }else{
                        //NO ES CALCULABLE
                        $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "grupo" => $qwe3['grupo'],
                    "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                    "es_calculable" => $qwe3['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "codigo" => $nombre_cuenta2['numero'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe3[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' 
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        // Activo_disponible, exigible, Acciones telefonicas
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                         if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE
                            //ESTO ES NIVEL 3
                
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                    "grupo" => $qwe4['grupo'],
                                    "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                    "es_calculable" => $qwe4['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta3['numero'],   
                                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                    "valor" => $valor['total'],
                                    "nivel_4" => [] //activo   
                                    );
                                    array_push($res3['nivel_3'], $res4); 
                                }

                         }else{ //NO ES CALCULABLE
                            //ESTO ES NIVEL 3
                             $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "grupo" => $qwe4['grupo'],
                        "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                        "es_calculable" => $qwe4['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                        "codigo" => $nombre_cuenta3['numero'], 
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe4[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        // $suma_nivel_5 = 0;
                        $aux_sum_5 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();

                            // $suma_nivel_5 = 0;

                            if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
                                
                            //ESTO ES NIVEL 4
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //--------------------------------------------
                                }else{
                                    // $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta4['numero'],   
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor['total'],
                                    "suma_nivel_5" => 0,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5); 
                                }

                            }else{ // NO ES CALCULABLE
                         $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "grupo" => $qwe5['grupo'],
                        "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                        "es_calculable" => $qwe5['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                        "codigo" => $nombre_cuenta4['numero'], 
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "valor" => 0,
                        "suma_nivel_5" => 0,
                        "nivel_5" => [] //activo
                        );
                        $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe5[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_5 = 0;
                        while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
                            $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta5 = $cuenta5->fetch_assoc();
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor2 = $suma_cuentas2->fetch_assoc();
                                $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
                                    // $aux_sum_5 = $suma_nivel_5;

                                if($valor2['total'] == null || $valor2['total'] == '0'){
        //------------------------------------------------------------------------------
                                }else{
                                    $res6 = array(
                                "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                                "grupo" => $qwe6['grupo'],
                                "negrilla_cursiva" => $qwe6['negrilla_cursiva'],
                                "es_calculable" => $qwe6['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                                "codigo" => $nombre_cuenta5['numero'],   
                                "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                                "valor" => $valor2['total'],
                                "nivel_6" => [] //activo   
                                );
                                array_push($res5['nivel_5'], $res6); 
                                }
                                
                                // $res4['suma_nivel_5'] = $suma_nivel_5;
                        }
                        // $aux_sum_5 = $suma_nivel_5;

                        $res5['suma_nivel_5'] = $suma_nivel_5;
                        $res5['valor'] = $suma_nivel_5;
                        $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];

                            array_push($res4['nivel_4'], $res5); 

                        } // AQUI TERMINA EL NO ES CALCULABLE
                        // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        // array_push($res3['nivel_3'], $res4); 
                         }
                         $res4['suma_nivel_4'] = $suma_nivel_4;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                array_push($res3['nivel_3'], $res4); 
                        
                    }
                        // $res3['suma_nivel_3'] = $suma_nivel_3;
                        // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

                        // array_push($res2['nivel_2'], $res3); 
                    }
                     $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
                    array_push($res2['nivel_2'], $res3); 
                    }
    
                                // $res2['suma_nivel_2'] = $suma_nivel_2;
                            }
                $res2['suma_nivel_2'] = $suma_nivel_2; 

                $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
                $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
            }
           array_push($lista, $res2); 
        }     
        
        // array_push($lista, $res2);
        echo json_encode($lista, JSON_NUMERIC_CHECK);  
    }
    public function reporte_balance_general_consolidado($idplantilla_reporte,$fecha_ini,$fecha_fin,$empresa) {
        ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getidgestion($empresa);

        $lista =[];
        
        $get_nivel_2 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '' AND reporte ='balance_general' AND idempresa='$idempresa' 
        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
        $total_pasivo_patrimonio = 0;
        while ($qwe2 = $this->dbc->fetch($get_nivel_2)) {
            $cuenta = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe2[idplandecuenta]'");// ACTIVO, PASIVO, PATRIMONIO
            $nombre_cuenta = $cuenta->fetch_assoc();
            if($qwe2['grupo'] == '1'){
        // preguntar si la cuenta en la q estamos es activo fijo
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();

            //    if($nivel_reg['nivel_registrado'] == '4'){

                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "grupo" => $qwe2['grupo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "es_calculable" => $qwe2['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' 
                AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    // ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

                    // }else{

                    // }
                    
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();
                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "grupo" => $qwe3['grupo'],
                    "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                    "es_calculable" => $qwe3['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "codigo" => $nombre_cuenta2['numero'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' 
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        // Activo_disponible, exigible, Acciones telefonicas
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                         if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE
                            //ESTO ES NIVEL 3
                            if($qwe4['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
                              $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe4[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                              if($get_fijo->num_rows > 0){
                                $fijo = $get_fijo->fetch_assoc();

                                $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_A = $suma_cuentas_A->fetch_assoc();

                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $diferencia = $valor_A['total'] - $valor_B['total'];

                                $suma_nivel_3 = $suma_nivel_3 + $diferencia;
                                if($valor_A['total'] == null || $valor_A['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "grupo" => $qwe4['grupo'],
                                "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                "es_calculable" => $qwe4['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                                "codigo" => $nombre_cuenta3['numero'], 
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_A['total'],
                                "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );

                                array_push($res3['nivel_3'], $res4);
                                }
                                
                              }else{
                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                            if($valor_B['total'] == null || $valor_B['total'] == '0'){
                                //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                            }else{
                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "grupo" => $qwe4['grupo'],
                                "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                "es_calculable" => $qwe4['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                                "codigo" => $nombre_cuenta3['numero'],  
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_B['total'],
                                // "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4);
                            }
                    
                              } 

                            }else{
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                    "grupo" => $qwe4['grupo'],
                                    "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                    "es_calculable" => $qwe4['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta3['numero'],   
                                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                    "valor" => $valor['total'],
                                    "nivel_4" => [] //activo   
                                    );
                                    array_push($res3['nivel_3'], $res4); 
                                }
                                
                            }

                         }else{ //NO ES CALCULABLE
                            //ESTO ES NIVEL 3
                             $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "grupo" => $qwe4['grupo'],
                        "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                        "es_calculable" => $qwe4['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                        "codigo" => $nombre_cuenta3['numero'], 
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        // $suma_nivel_5 = 0;
                        $aux_sum_5 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();

                            // $suma_nivel_5 = 0;

                            if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
                                
                            //ESTO ES NIVEL 4
                            if($qwe5['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
                              $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe5[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                              if($get_fijo->num_rows > 0){
                                $fijo = $get_fijo->fetch_assoc();

                                $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_A = $suma_cuentas_A->fetch_assoc();

                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $diferencia = $valor_A['total'] - $valor_B['total'];

                                $suma_nivel_4 = $suma_nivel_4 + $diferencia;
                                if($valor_A['total'] == null || $valor_A['total'] == '0'){
                                    // -------------------------------------------
                                }else{
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],   
                                    "codigo" => $nombre_cuenta4['numero'], 
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor_A['total'],
                                    "valor_restado" => $diferencia,
                                    "nivel_5" => [] //activo   
                                    );
                                array_push($res4['nivel_4'], $res5);
                                }
                                
                              }else{
                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();
                                if($valor_B['total'] == null || $valor_B['total'] == '0'){
                                    //---------------------------------
                                }else{
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                                    "codigo" => $nombre_cuenta4['numero'],  
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor_B['total'],
                                    // "valor_restado" => $diferencia,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5);
                                }
                                
                              } 

                            }else{ //NO ES ACTIVO FIJO
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //--------------------------------------------
                                }else{
                                    // $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta4['numero'],   
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor['total'],
                                    "suma_nivel_5" => 0,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5); 
                                }
                                
                            }

                            }else{ // NO ES CALCULABLE
                         $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "grupo" => $qwe5['grupo'],
                        "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                        "es_calculable" => $qwe5['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                        "codigo" => $nombre_cuenta4['numero'], 
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "valor" => 0,
                        "suma_nivel_5" => 0,
                        "nivel_5" => [] //activo
                        );
                        $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_5 = 0;
                        while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
                            $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta5 = $cuenta5->fetch_assoc();
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor2 = $suma_cuentas2->fetch_assoc();
                                $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
                                    // $aux_sum_5 = $suma_nivel_5;

                                if($valor2['total'] == null || $valor2['total'] == '0'){
        //------------------------------------------------------------------------------
                                }else{
                                    $res6 = array(
                                "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                                "grupo" => $qwe5['grupo'],
                                "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                "es_calculable" => $qwe5['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                                "codigo" => $nombre_cuenta5['numero'],   
                                "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                                "valor" => $valor2['total'],
                                "nivel_6" => [] //activo   
                                );
                                array_push($res5['nivel_5'], $res6); 
                                }
                                
                                // $res4['suma_nivel_5'] = $suma_nivel_5;
                        }
                        // $aux_sum_5 = $suma_nivel_5;

                        $res5['suma_nivel_5'] = $suma_nivel_5;
                        $res5['valor'] = $suma_nivel_5;
                        $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];

                            array_push($res4['nivel_4'], $res5); 

                        } // AQUI TERMINA EL NO ES CALCULABLE
                        // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        // array_push($res3['nivel_3'], $res4); 
                         }
                         $res4['suma_nivel_4'] = $suma_nivel_4;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                array_push($res3['nivel_3'], $res4); 
                        
                    }
                        // $res3['suma_nivel_3'] = $suma_nivel_3;
                        // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

                        // array_push($res2['nivel_2'], $res3); 
                    }
                     $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
        array_push($res2['nivel_2'], $res3); 
                    // $res2['suma_nivel_2'] = $suma_nivel_2;
                }
    $res2['suma_nivel_2'] = $suma_nivel_2; 

            }elseif($qwe2['grupo'] == '2'){ //PASIVO

                // preguntar si la cuenta en la q estamos es activo fijo
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();

            //    if($nivel_reg['nivel_registrado'] == '4'){

                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "grupo" => $qwe2['grupo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "es_calculable" => $qwe2['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' 
                AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO

                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    // ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

                    // }else{

                    // }
                    
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();
                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "grupo" => $qwe3['grupo'],
                    "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                    "es_calculable" => $qwe3['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "codigo" => $nombre_cuenta2['numero'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' 
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        // Activo_disponible, exigible, Acciones telefonicas
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                         if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE
                            //ESTO ES NIVEL 3
                
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                    "grupo" => $qwe4['grupo'],
                                    "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                    "es_calculable" => $qwe4['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta3['numero'],   
                                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                    "valor" => $valor['total'],
                                    "nivel_4" => [] //activo   
                                    );
                                    array_push($res3['nivel_3'], $res4); 
                                }

                         }else{ //NO ES CALCULABLE
                            //ESTO ES NIVEL 3
                             $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "grupo" => $qwe4['grupo'],
                        "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                        "es_calculable" => $qwe4['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                        "codigo" => $nombre_cuenta3['numero'], 
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        // $suma_nivel_5 = 0;
                        $aux_sum_5 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();

                            // $suma_nivel_5 = 0;

                            if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
                                
                            //ESTO ES NIVEL 4
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //--------------------------------------------
                                }else{
                                    // $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta4['numero'],   
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor['total'],
                                    "suma_nivel_5" => 0,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5); 
                                }

                            }else{ // NO ES CALCULABLE
                         $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "grupo" => $qwe5['grupo'],
                        "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                        "es_calculable" => $qwe5['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                        "codigo" => $nombre_cuenta4['numero'], 
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "valor" => 0,
                        "suma_nivel_5" => 0,
                        "nivel_5" => [] //activo
                        );
                        $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_5 = 0;
                        while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
                            $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta5 = $cuenta5->fetch_assoc();
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.consolidar = 2 AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor2 = $suma_cuentas2->fetch_assoc();
                                $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
                                    // $aux_sum_5 = $suma_nivel_5;

                                if($valor2['total'] == null || $valor2['total'] == '0'){
        //------------------------------------------------------------------------------
                                }else{
                                    $res6 = array(
                                "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                                "grupo" => $qwe6['grupo'],
                                "negrilla_cursiva" => $qwe6['negrilla_cursiva'],
                                "es_calculable" => $qwe6['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                                "codigo" => $nombre_cuenta5['numero'],   
                                "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                                "valor" => $valor2['total'],
                                "nivel_6" => [] //activo   
                                );
                                array_push($res5['nivel_5'], $res6); 
                                }
                                
                                // $res4['suma_nivel_5'] = $suma_nivel_5;
                        }
                        // $aux_sum_5 = $suma_nivel_5;

                        $res5['suma_nivel_5'] = $suma_nivel_5;
                        $res5['valor'] = $suma_nivel_5;
                        $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];

                            array_push($res4['nivel_4'], $res5); 

                        } // AQUI TERMINA EL NO ES CALCULABLE
                        // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        // array_push($res3['nivel_3'], $res4); 
                         }
                         $res4['suma_nivel_4'] = $suma_nivel_4;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                array_push($res3['nivel_3'], $res4); 
                        
                    }
                        // $res3['suma_nivel_3'] = $suma_nivel_3;
                        // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

                        // array_push($res2['nivel_2'], $res3); 
                    }
                     $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
                    array_push($res2['nivel_2'], $res3); 
                                // $res2['suma_nivel_2'] = $suma_nivel_2;
                            }
                $res2['suma_nivel_2'] = $suma_nivel_2; 

                $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
                $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
                
            }elseif($qwe2['grupo'] == '3'){ //PATRIMONIO
                // preguntar si la cuenta en la q estamos es activo fijo
                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();

            //    if($nivel_reg['nivel_registrado'] == '4'){

                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "grupo" => $qwe2['grupo'],
                    "negrilla_cursiva" => $qwe2['negrilla_cursiva'],
                    "es_calculable" => $qwe2['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
                    "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
                    "suma_nivel_2" => 0,
                    "nivel_2" => [] //activo
                    );
                $suma_nivel_2 = 0;
                $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe2[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa' 
                AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
                    // ACTIVO_CIRCULANTE, ACTIVO_FIJO
                    // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

                    // }else{

                    // }
                    
                    $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
                    $nombre_cuenta2 = $cuenta2->fetch_assoc();
                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "grupo" => $qwe3['grupo'],
                    "negrilla_cursiva" => $qwe3['negrilla_cursiva'],
                    "es_calculable" => $qwe3['es_calculable'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "codigo" => $nombre_cuenta2['numero'],
                    "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
                    "suma_nivel_3" => 0,
                    "nivel_3" => [] //activo
                    );
                    $suma_nivel_3 = 0;
                    $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe3[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa' 
                    AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                    while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
                        // Activo_disponible, exigible, Acciones telefonicas
                        $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
                        $nombre_cuenta3 = $cuenta3->fetch_assoc();

                         if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE
                            //ESTO ES NIVEL 3
                
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //NO MOSTRARIA NADA PORQ EL VALOR ES CERO
                                }else{
                                    $res4 = array(
                                    "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                    "grupo" => $qwe4['grupo'],
                                    "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                                    "es_calculable" => $qwe4['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta3['numero'],   
                                    "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                    "valor" => $valor['total'],
                                    "nivel_4" => [] //activo   
                                    );
                                    array_push($res3['nivel_3'], $res4); 
                                }

                         }else{ //NO ES CALCULABLE
                            //ESTO ES NIVEL 3
                             $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "grupo" => $qwe4['grupo'],
                        "negrilla_cursiva" => $qwe4['negrilla_cursiva'],
                        "es_calculable" => $qwe4['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                        "codigo" => $nombre_cuenta3['numero'], 
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe4[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        // $suma_nivel_5 = 0;
                        $aux_sum_5 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();

                            // $suma_nivel_5 = 0;

                            if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
                                
                            //ESTO ES NIVEL 4
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                if($valor['total'] == null || $valor['total'] == '0'){
                                    //--------------------------------------------
                                }else{
                                    // $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                                    $res5 = array(
                                    "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                                    "grupo" => $qwe5['grupo'],
                                    "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                                    "es_calculable" => $qwe5['es_calculable'],
                                    "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
                                    "codigo" => $nombre_cuenta4['numero'],   
                                    "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                                    "valor" => $valor['total'],
                                    "suma_nivel_5" => 0,
                                    "nivel_5" => [] //activo   
                                    );
                                    array_push($res4['nivel_4'], $res5); 
                                }

                            }else{ // NO ES CALCULABLE
                         $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "grupo" => $qwe5['grupo'],
                        "negrilla_cursiva" => $qwe5['negrilla_cursiva'],
                        "es_calculable" => $qwe5['es_calculable'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                        "codigo" => $nombre_cuenta4['numero'], 
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "valor" => 0,
                        "suma_nivel_5" => 0,
                        "nivel_5" => [] //activo
                        );
                        $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where grupo = '$qwe5[grupo]' AND nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa' 
                        AND idplantilla_reporte ='$idplantilla_reporte' ORDER BY orden ASC");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_5 = 0;
                        while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
                            $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta5 = $cuenta5->fetch_assoc();
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(haber) - SUM(debe) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor2 = $suma_cuentas2->fetch_assoc();
                                $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
                                    // $aux_sum_5 = $suma_nivel_5;

                                if($valor2['total'] == null || $valor2['total'] == '0'){
        //------------------------------------------------------------------------------
                                }else{
                                    $res6 = array(
                                "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                                "grupo" => $qwe6['grupo'],
                                "negrilla_cursiva" => $qwe6['negrilla_cursiva'],
                                "es_calculable" => $qwe6['es_calculable'],
                                "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                                "codigo" => $nombre_cuenta5['numero'],   
                                "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                                "valor" => $valor2['total'],
                                "nivel_6" => [] //activo   
                                );
                                array_push($res5['nivel_5'], $res6); 
                                }
                                
                                // $res4['suma_nivel_5'] = $suma_nivel_5;
                        }
                        // $aux_sum_5 = $suma_nivel_5;

                        $res5['suma_nivel_5'] = $suma_nivel_5;
                        $res5['valor'] = $suma_nivel_5;
                        $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];

                            array_push($res4['nivel_4'], $res5); 

                        } // AQUI TERMINA EL NO ES CALCULABLE
                        // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        // array_push($res3['nivel_3'], $res4); 
                         }
                         $res4['suma_nivel_4'] = $suma_nivel_4;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                array_push($res3['nivel_3'], $res4); 
                        
                    }
                        // $res3['suma_nivel_3'] = $suma_nivel_3;
                        // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

                        // array_push($res2['nivel_2'], $res3); 
                    }
                     $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
                    array_push($res2['nivel_2'], $res3); 
                                // $res2['suma_nivel_2'] = $suma_nivel_2;
                            }
                $res2['suma_nivel_2'] = $suma_nivel_2; 

                $total_pasivo_patrimonio = $total_pasivo_patrimonio + $suma_nivel_2;
                $res2['total_pasi_pati'] = $total_pasivo_patrimonio;
            }
           array_push($lista, $res2); 
        }     
        
        // array_push($lista, $res2);
        echo json_encode($lista, JSON_NUMERIC_CHECK);  
    }
    // public function editar_configuracion_reporte($id,$idplandecuenta,$es_activo_fijo,$es_calculable,$orden,$negrilla_cursiva,$empresa) {
    //     $idempresa = $this->getidempresa($empresa);
        
    //     $confi = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
    //     $res_confi = $confi->fetch_assoc();
    //     $existe_en_vinculacion = $this->dbc->query("SELECT *,
    //                 CASE 
    //                     WHEN idcuenta = '$res_confi[idplandecuenta]' THEN 'idcuenta'
    //                     WHEN idcuenta_depreciacion = '$res_confi[idplandecuenta]' THEN 'idcuenta_depreciacion'
    //                 END AS columna_encontrada
    //             FROM vinculacion_cuenta_depreciacion
    //             WHERE idcuenta = '$res_confi[idplandecuenta]' 
    //             OR idcuenta_depreciacion = '$res_confi[idplandecuenta]'
    //             ");

    //     $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM configuracion_reporte 
    //     WHERE idplandecuenta = '$idplandecuenta' AND idempresa = '$idempresa' AND idconfiguracion_reporte != '$id' AND idplantilla_reporte ='$res_confi[idplantilla_reporte]'");
    //     $resultado = $consulta->fetch_assoc();
    //     $totalRegistros = $resultado['total'];

    //     if ($totalRegistros > 0) {
    //         $res = array("danger", "El registro ya existe","editarCaracteristicassss");
    //     }else {
    //         if($existe_en_vinculacion->num_rows > 0){
    //             $res_existe_vincu = $existe_en_vinculacion->fetch_assoc();
    //             //EDITAR EN AMBAS TABLAS LA CUENTA 
    //             $update_confi = $this->dbc->query("UPDATE configuracion_reporte
    //                                 SET idplandecuenta = '$idplandecuenta'
    //                                 WHERE idconfiguracion_reporte = '$id';");
    //             if($res_existe_vincu['columna_encontrada'] == "idcuenta"){
    //                 $update_vincu = $this->dbc->query("UPDATE vinculacion_cuenta_depreciacion
    //                                 SET idcuenta = '$idplandecuenta'
    //                                 WHERE idvinculacion_cuenta_depreciacion = '$res_existe_vincu[idvinculacion_cuenta_depreciacion]';");
    //             }else{
    //                 $update_vincu = $this->dbc->query("UPDATE vinculacion_cuenta_depreciacion
    //                                 SET idcuenta_depreciacion = '$idplandecuenta'
    //                                 WHERE idvinculacion_cuenta_depreciacion = '$res_existe_vincu[idvinculacion_cuenta_depreciacion]';");
    //             }
            
    //         }else{
    //             //EDITAR SOLO EN LA TABLA CONFI_REPORT
    //             $update_confi = $this->dbc->query("UPDATE configuracion_reporte
    //                                 SET idplandecuenta = '$idplandecuenta',
    //                                 es_activo_fijo = '$es_activo_fijo',
    //                                 es_calculable = '$es_calculable',
    //                                 negrilla_cursiva = '$negrilla_cursiva'
    //                                 WHERE idconfiguracion_reporte = '$id';");
    //         }
    //         // Insertar el nuevo registro
            
    //         if ($update_confi === TRUE) {                                                                                                                                                                
    //             $res = array("success", "Edición exitosa","editarCaracteristicas");
    //         } else {
    //             $res = array("danger", "No se pudo editar");
    //         }
    //     }
    //     echo json_encode($res);
    // }
    public function editar_configuracion_reporte($id,$idplandecuenta,$es_activo_fijo,$es_calculable,$orden,$negrilla_cursiva,$empresa) {
        $idempresa = $this->getidempresa($empresa);
        
        $confi = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
        $res_confi = $confi->fetch_assoc();

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM configuracion_reporte 
        WHERE idplandecuenta = '$idplandecuenta' AND idempresa = '$idempresa' AND idconfiguracion_reporte != '$id' AND idplantilla_reporte ='$res_confi[idplantilla_reporte]'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicassss");
        }else {
            
            if($res_confi['orden'] === $orden){ //NO SE ESTA EDITANDO EL ORDEN EN ESTE REGISTRO

            }elseif($orden < $res_confi['orden']){ // SI QUIEREN CAMBIAR EL ORDEN

                    $recorrido_conf_menor = $this->dbc->query("SELECT * FROM configuracion_reporte 
                    WHERE nombre_cuenta_superior ='$res_confi[nombre_cuenta_superior]' 
                    AND nivel_registrado = '$res_confi[nivel_registrado]' AND idempresa = '$idempresa'
                    AND orden >= '$orden' AND orden < '$res_confi[orden]'
                    ORDER BY orden ASC
                    ");
                //EL NUEVO ORDEN ES MENOR QUE EL ORDEN Q YA ESTA REGISTRADO
                    while ($reco = $this->dbc->fetch($recorrido_conf_menor)) {
                        $orden_actualizado = $reco['orden'] + 1;

                        $update_confi_reco = $this->dbc->query("UPDATE configuracion_reporte
                                        SET orden = '$orden_actualizado'
                                        WHERE idconfiguracion_reporte = '$reco[idconfiguracion_reporte]';");
                    }
            }elseif($orden > $res_confi['orden']){
                    $recorrido_conf_mayor = $this->dbc->query("SELECT * FROM configuracion_reporte 
                    WHERE nombre_cuenta_superior ='$res_confi[nombre_cuenta_superior]' 
                    AND nivel_registrado = '$res_confi[nivel_registrado]' AND idempresa = '$idempresa'
                    AND orden > '$res_confi[orden]' AND orden <= '$orden'
                    ORDER BY orden ASC
                    ");
                //EL NUEVO ORDEN ES MAYOR QUE EL ORDEN Q YA ESTA REGISTRADO
                    while ($reco = $this->dbc->fetch($recorrido_conf_mayor)) {
                        $orden_actualizado = $reco['orden'] - 1;

                        $update_confi_reco = $this->dbc->query("UPDATE configuracion_reporte
                                        SET orden = '$orden_actualizado'
                                        WHERE idconfiguracion_reporte = '$reco[idconfiguracion_reporte]';");
                    }
                }

                $update_confi = $this->dbc->query("UPDATE configuracion_reporte
                                    SET idplandecuenta = '$idplandecuenta',
                                    es_activo_fijo = '$es_activo_fijo',
                                    es_calculable = '$es_calculable',
                                    negrilla_cursiva = '$negrilla_cursiva',
                                    orden = '$orden'
                                    WHERE idconfiguracion_reporte = '$id';");
            }
            
            // Insertar el nuevo registro
            
            if ($update_confi === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        
        echo json_encode($res);
        }
    
    // public function eliminar_configuracion_reporte($id){
        
    //         // $consulta3 = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
    //         // $resultado3 = $consulta3->fetch_assoc();

    //         // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM configuracion_reporte WHERE idplandecuenta = '$resultado3[idcuenta]' AND idempresa = '$resultado3[idempresa]'");
    //         // $resultado33 = $consulta->fetch_assoc(); 

    //         if (0 > 0) {
    //                 $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
    //         } else {
    //                 // Insertar el nuevo registro
    //                 $registroProveedor = $this->dbc->query("DELETE FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
    //                 if ($registroProveedor === TRUE) {                                                                                                                                                    
    //                     $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
    //                 } else {
    //                     $res = array("danger", "No se pudo registrar");
    //                 }
    //             }
    //             echo json_encode($res);
    // }
    public function eliminar_configuracion_reporte($id){
        
            $consulta3 = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
            $resultado3 = $consulta3->fetch_assoc();

            // $consulta_vinculacion = $this->dbc->query("SELECT * FROM vinculacion_cuenta_depreciacion WHERE idcuenta = '$resultado3[idplandecuenta]' OR idcuenta_depreciacion = '$resultado3[idplandecuenta]' AND idempresa = '$resultado3[idempresa]'");
           
           $existe_en_vinculacion = $this->dbc->query("SELECT *,
                    CASE 
                        WHEN idcuenta = '$resultado3[idplandecuenta]' THEN 'idcuenta'
                        WHEN idcuenta_depreciacion = '$resultado3[idplandecuenta]' THEN 'idcuenta_depreciacion'
                    END AS columna_encontrada
                FROM vinculacion_cuenta_depreciacion
                WHERE idcuenta = '$resultado3[idplandecuenta]' 
                OR idcuenta_depreciacion = '$resultado3[idplandecuenta]'
                ");
           
            if($existe_en_vinculacion->num_rows > 0){
                $resultado33 = $existe_en_vinculacion->fetch_assoc(); 
                if($resultado33['columna_encontrada'] == 'idcuenta'){
                    //SE ELIMINARA LA CUENTA PRINCIPAL Y SU VINCULACION 
//(elimina la cuenta principal, entonces se eliminara ambas cuetas de la tabla confi_reporte y la vinculacion en la tabla vincu)
                    
                    $confi_elim = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
                    $resu_aux = $confi_elim->fetch_assoc();             
                    $orden_aux = $resu_aux['orden'] + 1;
                    $consulta_aux = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nombre_cuenta_superior ='$resu_aux[nombre_cuenta_superior]'
                        AND nivel_registrado = '$resu_aux[nivel_registrado]' AND idempresa ='$resu_aux[idempresa]' AND orden > '$orden_aux'");
                        // $resultado = $consulta->fetch_assoc();             
                        // $orden_ulti = $resultado['total'] + 1;

                        while ($qwe = $this->dbc->fetch($consulta_aux)) {
                            $nuevo_orden = $qwe['orden'] - 2;
                            $edicion_orden = $this->dbc->query("UPDATE configuracion_reporte 
                                                                    SET orden = '$nuevo_orden' 
                                                                    WHERE idconfiguracion_reporte = '$qwe[idconfiguracion_reporte]'");
                        }

                    $delete_confi = $this->dbc->query("DELETE FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
                    $delete_confi2 = $this->dbc->query("DELETE FROM configuracion_reporte WHERE idplandecuenta = '$resultado33[idcuenta_depreciacion]'");
   
                    $delete_vincu = $this->dbc->query("DELETE FROM vinculacion_cuenta_depreciacion WHERE idvinculacion_cuenta_depreciacion = '$resultado33[idvinculacion_cuenta_depreciacion]'");
                }else{
                    // SOLO SE ELIMINARA 2 REGISTROS, OSEA EL REGISTRO DE CONFIGURACION_REPORTE Y DE LA TABLA VINCULACION
                    //(aqui elimina la depreciacion de una cuenta, entonces se eliminara de la tabla vinculacion y de la tabla configuracion reporte porque estaba el registro en ambas tablas)

                    $confi_elim = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
                    $resu_aux = $confi_elim->fetch_assoc();             

                    $consulta_aux = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nombre_cuenta_superior ='$resu_aux[nombre_cuenta_superior]'
                        AND nivel_registrado = '$resu_aux[nivel_registrado]' AND idempresa ='$resu_aux[idempresa]' AND orden > '$resu_aux[orden]'");
                        // $resultado = $consulta->fetch_assoc();             
                        // $orden_ulti = $resultado['total'] + 1;

                        while ($qwe = $this->dbc->fetch($consulta_aux)) {
                            $nuevo_orden = $qwe['orden'] - 1;
                            $edicion_orden = $this->dbc->query("UPDATE configuracion_reporte 
                                                                    SET orden = '$nuevo_orden' 
                                                                    WHERE idconfiguracion_reporte = '$qwe[idconfiguracion_reporte]'");
                        }
                    $delete_confi = $this->dbc->query("DELETE FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
                    $delete_vincu = $this->dbc->query("DELETE FROM vinculacion_cuenta_depreciacion WHERE idvinculacion_cuenta_depreciacion = '$resultado33[idvinculacion_cuenta_depreciacion]'");
                }   
            }else{ // ESTE REGISTRO NO ES UN ACTIVO FIJO POR ESO LA ELIMINACION ES SIMPLE
                $confi_elim = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
                    $resu_aux = $confi_elim->fetch_assoc();             

                    $consulta_aux = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nombre_cuenta_superior ='$resu_aux[nombre_cuenta_superior]'
                        AND nivel_registrado = '$resu_aux[nivel_registrado]' AND idempresa ='$resu_aux[idempresa]' AND orden > '$resu_aux[orden]'");
                        // $resultado = $consulta->fetch_assoc();             
                        // $orden_ulti = $resultado['total'] + 1;

                        while ($qwe = $this->dbc->fetch($consulta_aux)) {
                            $nuevo_orden = $qwe['orden'] - 1;
                            $edicion_orden = $this->dbc->query("UPDATE configuracion_reporte 
                                                                    SET orden = '$nuevo_orden' 
                                                                    WHERE idconfiguracion_reporte = '$qwe[idconfiguracion_reporte]'");
                        }
                        
                $delete_confi = $this->dbc->query("DELETE FROM configuracion_reporte WHERE idconfiguracion_reporte = '$id'");
            }

            if ($delete_confi === TRUE) {                                                                                                                                                    
                $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
            } else {
                $res = array("danger", "No se pudo registrar");
            }

                echo json_encode($res);
    }
    public function registrar_vinculacion_depreciacion($idcuenta,$iddepreciacion,$idtipo_reportes,$empresa){
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
            $registroProveedor = $this->dbc->query("INSERT INTO vinculacion_cuenta_depreciacion(idcuenta,idcuenta_depreciacion,idgestion,idtipo_reportes,idempresa) VALUES ('$idcuenta','$iddepreciacion','$idgestion','$idtipo_reportes','$idempresa')");
            if ($registroProveedor === TRUE) {            
                $get_confi = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplandecuenta = '$idcuenta' AND idempresa = '$idempresa'");
                $confi_aux = $get_confi->fetch_assoc();

            // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM configuracion_reporte WHERE nombre_cuenta_superior ='$nombre_cuenta_superior'
            // AND nivel_registrado = '$nivel' AND idempresa ='$idempresa'");
            // $resultado = $consulta->fetch_assoc();             
            // $orden_ulti = $resultado['total'] + 1;

            $orden = $confi_aux['orden'] + 1;

            $consulta = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE nombre_cuenta_superior ='$confi_aux[nombre_cuenta_superior]'
            AND nivel_registrado = '$confi_aux[nivel_registrado]' AND idempresa ='$idempresa' AND orden >= '$orden'");
            // $resultado = $consulta->fetch_assoc();             
            // $orden_ulti = $resultado['total'] + 1;

            while ($qwe = $this->dbc->fetch($consulta)) {
                $nuevo_orden = $qwe['orden'] + 1;
                $edicion_orden = $this->dbc->query("UPDATE configuracion_reporte 
                                                        SET orden = '$nuevo_orden' 
                                                        WHERE idconfiguracion_reporte = '$qwe[idconfiguracion_reporte]'");
            }

                $registro_confi = $this->dbc->query("INSERT INTO configuracion_reporte(idplandecuenta,idplantilla_reporte,reporte,nombre_cuenta_superior,nivel_registrado,orden,grupo,es_calculable,es_activo_fijo,idempresa) 
                VALUES ('$iddepreciacion','$confi_aux[idplantilla_reporte]','$confi_aux[reporte]','$confi_aux[nombre_cuenta_superior]','$confi_aux[nivel_registrado]','$orden','$confi_aux[grupo]','$confi_aux[es_calculable]','$confi_aux[es_activo_fijo]','$idempresa')");
                                                                                                                                                                   
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
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

    public function reporte_balance_general_hasta($fecha_fin,$empresa) {
           ini_set('display_errors', 1); 
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
                    "codigo" => $nombre_cuenta['numero'],
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
                    "codigo" => $nombre_cuenta2['numero'],
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

                            if($qwe4['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
                              $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe4[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                              if($get_fijo->num_rows > 0){
                                $fijo = $get_fijo->fetch_assoc();

                                $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion<='$fecha_fin'");

                                $valor_A = $suma_cuentas_A->fetch_assoc();

                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $diferencia = $valor_A['total'] - $valor_B['total'];

                                $suma_nivel_3 = $suma_nivel_3 + $diferencia;
                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                                "codigo" => $nombre_cuenta3['numero'], 
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_A['total'],
                                "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4);
                              }else{
                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                                "codigo" => $nombre_cuenta3['numero'],  
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_B['total'],
                                // "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4);
                              } 

                            }else{
                                $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion<='$fecha_fin'");

                                $valor = $suma_cuentas->fetch_assoc();
                                $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
                                "codigo" => $nombre_cuenta3['numero'],   
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
                        "codigo" => $nombre_cuenta3['numero'], 
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
                            AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion<='$fecha_fin'");

                            $valor = $suma_cuentas->fetch_assoc();
                            $suma_nivel_4 = $suma_nivel_4 + $valor['total'];
                            $res5 = array(
                            "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                            "idplandecuenta" => $nombre_cuenta4['idplandecuenta'], 
                            "codigo" => $nombre_cuenta4['numero'],   
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
                    "codigo" => $nombre_cuenta['numero'],
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
                    "codigo" => $nombre_cuenta2['numero'],
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
                            AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion<='$fecha_fin'");

                            $valor = $suma_cuentas->fetch_assoc();
                            $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
                        $res4 = array(
                        "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                        "codigo" => $nombre_cuenta3['numero'], 
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
                    "codigo" => $nombre_cuenta['numero'],
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
                            AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion<='$fecha_fin'");

                            $valor = $suma_cuentas->fetch_assoc();
                            $suma_nivel_2 = $suma_nivel_2 + $valor['total'];

                    $res3 = array(
                    "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
                    "codigo" => $nombre_cuenta2['numero'],
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


        public function reporte_balance_general_prueba($fecha_ini,$fecha_fin,$empresa) {
           ini_set('display_errors', 1); 
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

            //    if($nivel_reg['nivel_registrado'] == '4'){

                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
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
                    "codigo" => $nombre_cuenta2['numero'],
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
                            //ESTO ES NIVEL 3
                            if($qwe4['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
                              $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe4[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                              if($get_fijo->num_rows > 0){
                                $fijo = $get_fijo->fetch_assoc();

                                $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_A = $suma_cuentas_A->fetch_assoc();

                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $diferencia = $valor_A['total'] - $valor_B['total'];

                                $suma_nivel_3 = $suma_nivel_3 + $diferencia;
                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
                                "codigo" => $nombre_cuenta3['numero'], 
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_A['total'],
                                "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4);
                              }else{
                                $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

                                $res4 = array(
                                "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
                                "codigo" => $nombre_cuenta3['numero'],  
                                "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                                "valor" => $valor_B['total'],
                                // "valor_restado" => $diferencia,
                                "nivel_4" => [] //activo   
                                );
                                array_push($res3['nivel_3'], $res4);
                              } 

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
                                "codigo" => $nombre_cuenta3['numero'],   
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
                        "codigo" => $nombre_cuenta3['numero'], 
                        "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
                        "suma_nivel_4" => 0,
                        "nivel_4" => [] //activo
                        );
                        $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                        $suma_nivel_4 = 0;
                        $suma_nivel_5 = 0;
                        while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {
                            $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta4 = $cuenta4->fetch_assoc();

                            // $suma_nivel_5 = 0;

                            if($qwe5['es_calculable'] == 'si'){ // ES CALCULABLE
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
                            "codigo" => $nombre_cuenta4['numero'],   
                            "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                            "valor" => $valor['total'],
                            "suma_nivel_5" => 0,
                            "nivel_5" => [] //activo   
                            );
                            array_push($res4['nivel_4'], $res5); 

                            }else{ // NO ES CALCULABLE
                         $res5 = array(
                        "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
                        "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
                        "codigo" => $nombre_cuenta4['numero'], 
                        "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
                        "valor" => 0,
                        "suma_nivel_5" => 0,
                        "nivel_5" => [] //activo
                        );
                        $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
                        // $suma_nivel_5 = 0;
                        while ($qwe6 = $this->dbc->fetch($get_nivel_6)) { //esto ya es nivel 5 = CALCULABLE
                            $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
                            $nombre_cuenta5 = $cuenta5->fetch_assoc();
                            $suma_cuentas2 = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
                                INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
                                INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
                                where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
                                AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

                                $valor2 = $suma_cuentas2->fetch_assoc();
                                $suma_nivel_5 = $suma_nivel_5 + $valor2['total'];
                                $res6 = array(
                                "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
                                "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
                                "codigo" => $nombre_cuenta5['numero'],   
                                "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
                                "valor" => $valor2['total'],
                                "nivel_6" => [] //activo   
                                );
                                array_push($res5['nivel_5'], $res6); 
                                // $res4['suma_nivel_5'] = $suma_nivel_5;
                        }
            $res5['suma_nivel_5'] = $suma_nivel_5;
            $res5['valor'] = $suma_nivel_5;
                            array_push($res4['nivel_4'], $res5); 

                        } // AQUI TERMINA EL NO ES CALCULABLE
                        // $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        // $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                        // array_push($res3['nivel_3'], $res4); 
                         }
                         $res4['suma_nivel_4'] = $suma_nivel_4 + $suma_nivel_5;
                        $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
                array_push($res3['nivel_3'], $res4); 
                        
                    }
                        // $res3['suma_nivel_3'] = $suma_nivel_3;
                        // $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];

                        // array_push($res2['nivel_2'], $res3); 
                    }
                     $res3['suma_nivel_3'] = $suma_nivel_3;
                        $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
        array_push($res2['nivel_2'], $res3); 
                    // $res2['suma_nivel_2'] = $suma_nivel_2;
                }
    $res2['suma_nivel_2'] = $suma_nivel_2;
                // }
//                 elseif($nivel_reg['nivel_registrado'] == '5'){//--------------------------------------------------------------------------------------
// //-.---------------------------------------------------------------------------------------------------------------
//                     $res2 = array(
//                     "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
//                     "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
//                     "codigo" => $nombre_cuenta['numero'],
//                     "nombre_nivel_1" => $nombre_cuenta['nombreplan'],
//                     "suma_nivel_2" => 0,
//                     "nivel_2" => [] //activo
//                     );
//                 $suma_nivel_2 = 0;
//                 $get_nivel_3 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
//                 while ($qwe3 = $this->dbc->fetch($get_nivel_3)) {
//                     // ACTIVO_CIRCULANTE, ACTIVO_FIJO
//                     // if($qwe3['es_activo_fijo'] == '1'){ // TRUE

//                     // }else{

//                     // }
                    
//                     $cuenta2 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe3[idplandecuenta]'");// ACTIVO_CIRCULANTE, ACTIVO_FIJO, OTROS ACTIVOS
//                     $nombre_cuenta2 = $cuenta2->fetch_assoc();
//                     $res3 = array(
//                     "idconfiguracion_reporte" => $qwe3['idconfiguracion_reporte'],
//                     "idplandecuenta" => $nombre_cuenta2['idplandecuenta'],
//                     "codigo" => $nombre_cuenta2['numero'],
//                     "nombre_nivel_2" => $nombre_cuenta2['nombreplan'],
//                     "suma_nivel_3" => 0,
//                     "nivel_3" => [] //activo
//                     );
//                     $suma_nivel_3 = 0;
//                     $get_nivel_4 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta2[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
//                     while ($qwe4 = $this->dbc->fetch($get_nivel_4)) {
//                         // Activo_disponible, exigible, Acciones telefonicas
//                         $cuenta3 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe4[idplandecuenta]'");// Activo_disponible, exigible
//                         $nombre_cuenta3 = $cuenta3->fetch_assoc();

//                          if($qwe4['es_calculable'] == 'si'){ // ES CALCULABLE

//                             if($qwe4['es_activo_fijo'] == 'si'){ //ES ACTIVO FIJO
//                               $get_fijo = $this->dbc->query("SELECT * from vinculacion_cuenta_depreciacion where idcuenta = '$qwe4[idplandecuenta]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
//                               if($get_fijo->num_rows > 0){
//                                 $fijo = $get_fijo->fetch_assoc();

//                                 $suma_cuentas_A = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_A = $suma_cuentas_A->fetch_assoc();

//                                 $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$fijo[idcuenta_depreciacion]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

//                                 $diferencia = $valor_A['total'] - $valor_B['total'];

//                                 $suma_nivel_3 = $suma_nivel_3 + $diferencia;
//                                 $res4 = array(
//                                 "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],   
//                                 "codigo" => $nombre_cuenta3['numero'], 
//                                 "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                 "valor" => $valor_A['total'],
//                                 "valor_restado" => $diferencia,
//                                 "nivel_4" => [] //activo   
//                                 );
//                                 array_push($res3['nivel_3'], $res4);
//                               }else{
//                                 $suma_cuentas_depreciacion = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$qwe4[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor_B = $suma_cuentas_depreciacion->fetch_assoc();

//                                 $res4 = array(
//                                 "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
//                                 "codigo" => $nombre_cuenta3['numero'],  
//                                 "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                 "valor" => $valor_B['total'],
//                                 // "valor_restado" => $diferencia,
//                                 "nivel_4" => [] //activo   
//                                 );
//                                 array_push($res3['nivel_3'], $res4);
//                               } 

//                             }else{ // ES CALCULABLE PERO NO ES ACTIVO FIJO
//                                 $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                                 INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                                 INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                                 where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta3[idplandecuenta]'
//                                 AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                                 $valor = $suma_cuentas->fetch_assoc();
//                                 $suma_nivel_3 = $suma_nivel_3 + $valor['total'];
//                                 $res4 = array(
//                                 "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                                 "idplandecuenta" => $nombre_cuenta3['idplandecuenta'], 
//                                 "codigo" => $nombre_cuenta3['numero'],   
//                                 "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                                 "valor" => $valor['total'],
//                                 "nivel_4" => [] //activo   
//                                 );
//                                 array_push($res3['nivel_3'], $res4); 
//                             }

//                          }else{ //NO ES CALCULABLE

//                              $res4 = array(
//                         "idconfiguracion_reporte" => $qwe4['idconfiguracion_reporte'],
//                         "idplandecuenta" => $nombre_cuenta3['idplandecuenta'],  
//                         "codigo" => $nombre_cuenta3['numero'], 
//                         "nombre_nivel_3" => $nombre_cuenta3['nombreplan'],
//                         "suma_nivel_4" => 0,
//                         "nivel_4" => [] //activo
//                         );
//                         $get_nivel_5 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta3[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
//                         $suma_nivel_4 = 0;
//                         while ($qwe5 = $this->dbc->fetch($get_nivel_5)) {// ULTIMO TITULO
//                             $cuenta4 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe5[idplandecuenta]'");// caja_general, banco
//                             $nombre_cuenta4 = $cuenta4->fetch_assoc();
                            
//                             $res5 = array(
//                             "idconfiguracion_reporte" => $qwe5['idconfiguracion_reporte'],
//                             "idplandecuenta" => $nombre_cuenta4['idplandecuenta'],  
//                             "codigo" => $nombre_cuenta4['numero'], 
//                             "nombre_nivel_4" => $nombre_cuenta4['nombreplan'],
//                             "suma_nivel_5" => 0,
//                             "nivel_5" => [] //activo
//                             );
//                             $suma_nivel_5 = 0;
//                             $get_nivel_6 = $this->dbc->query("SELECT * from configuracion_reporte where nombre_cuenta_superior = '$nombre_cuenta4[nombreplan]' AND idempresa='$idempresa'");// ACTIVO, PASIVO, PATRIMONIO
//                             while ($qwe6 = $this->dbc->fetch($get_nivel_6)) {
//                             $cuenta5 = $this->dbc->query("SELECT * from plandecuenta where idplandecuenta = '$qwe6[idplandecuenta]'");// caja_general, banco
//                             $nombre_cuenta5 = $cuenta5->fetch_assoc();
//                             // if(es_calculable){

//                             // }else{

//                             // }
//                             $suma_cuentas = $this->dbc->query("SELECT sum(dt.debe) AS deb,sum(dt.haber) AS hab,SUM(debe) - SUM(haber) AS total FROM transacciones t
//                             INNER JOIN detalletransaccion dt on dt.transacciones_idtransacciones = t.idtransacciones
//                             INNER JOIN plandecuenta p on p.idplandecuenta=dt.idplandecuenta
//                             where t.organizacion_idorganizacion='$idempresa' and t.idgestion = '$gestion' and p.idplandecuenta = '$nombre_cuenta5[idplandecuenta]'
//                             AND t.estado NOT IN (4, 5, 6) AND t.fechatransaccion>='$fecha_ini' AND t.fechatransaccion<='$fecha_fin'");

//                             $valor = $suma_cuentas->fetch_assoc();
//                             $suma_nivel_5 = $suma_nivel_5 + $valor['total'];
//                             $res6 = array(
//                             "idconfiguracion_reporte" => $qwe6['idconfiguracion_reporte'],
//                             "idplandecuenta" => $nombre_cuenta5['idplandecuenta'], 
//                             "codigo" => $nombre_cuenta5['numero'],   
//                             "nombre_nivel_5" => $nombre_cuenta5['nombreplan'],
//                             "valor" => $valor['total'],
//                             "nivel_6" => [] //activo   
//                             );
//                             array_push($res5['nivel_5'], $res6); 
//                         }
//                         $res5['suma_nivel_5'] = $suma_nivel_5;
//                         $suma_nivel_4 = $suma_nivel_4 + $res5['suma_nivel_5'];
//                         array_push($res4['nivel_4'], $res5); 
//                         }
                    
//                         $res4['suma_nivel_4'] = $suma_nivel_4;
//                         $suma_nivel_3 = $suma_nivel_3 + $res4['suma_nivel_4'];
//                         array_push($res3['nivel_3'], $res4); 
//                          }
                        
//                     }
//                         $res3['suma_nivel_3'] = $suma_nivel_3;
//                         $suma_nivel_2 = $suma_nivel_2 + $res3['suma_nivel_3'];
//                         array_push($res2['nivel_2'], $res3); 
//                     }
//                     $res2['suma_nivel_2'] = $suma_nivel_2;
// //----------------------------------------------------------------------------------------------------------------
//                 }
                

            }elseif($qwe2['grupo'] == '2'){ //PASIVO

                $nivel_reporte = $this->dbc->query("SELECT nivel_registrado FROM configuracion_reporte WHERE grupo = '$qwe2[grupo]' AND idempresa='$idempresa' ORDER BY nivel_registrado DESC LIMIT 1");//
                $nivel_reg = $nivel_reporte->fetch_assoc();
                if($nivel_reg['nivel_registrado'] == '3'){
                    $res2 = array(
                    "idconfiguracion_reporte" => $qwe2['idconfiguracion_reporte'],
                    "idplandecuenta" => $nombre_cuenta['idplandecuenta'],
                    "codigo" => $nombre_cuenta['numero'],
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
                    "codigo" => $nombre_cuenta2['numero'],
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
                        "codigo" => $nombre_cuenta3['numero'], 
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
                    "codigo" => $nombre_cuenta['numero'],
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
                    "codigo" => $nombre_cuenta2['numero'],
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
public function select_plantilla_balance_general($idtipo_reporte,$empresa)
    {
        ini_set('display_errors', 1); 
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,organizacion_idorganizacion,idp FROM plandecuenta WHERE organizacion_idorganizacion='$ide' ORDER BY numero ASC");
        while ($qwe = $this->dbc->fetch($registro)) {
            
            $existe_plantilla = $this->dbc->query("SELECT * FROM configuracion_reporte WHERE idplandecuenta = '$qwe[idplandecuenta]' AND idempresa='$ide'
            AND idplantilla_reporte = '$idtipo_reporte'");
            if($existe_plantilla->num_rows > 0){
                $res = array("idplandecuenta" => $qwe['idplandecuenta'], "numero" => $qwe['numero'], "nombre" => $qwe['nombreplan'], "estado" => 'usado');

            }else{
                $res = array("idplandecuenta" => $qwe['idplandecuenta'], "numero" => $qwe['numero'], "nombre" => $qwe['nombreplan'], "estado" => 'no_usado');
            }
            array_push($lista, $res);
        }
        echo json_encode($lista);
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
//activo--1    pasivo --2  patrimonio---3    ingresos---4   egresos_gastos --5  orden ---6  eliminar    editar
}
?>
