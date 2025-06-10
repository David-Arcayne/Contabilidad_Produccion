<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php";

class Reporte_confi extends DB{
    public function registrar_configuracion_reporte($idplandecuenta,$reporte,$nombre_cuenta_superior,$nivel,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if ($idplandecuenta != "" && $reporte != "" && $nivel != "") {
            
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO configuracion_reporte(idplandecuenta,reporte,nombre_cuenta_superior,nivel_registrado,idempresa) VALUES ('$idplandecuenta','$reporte','$nombre_cuenta_superior','$nivel','$idempresa')");
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
    public function filtro_por_nivel($reporte,$nivel,$empresa) {
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
    public function activar_divisa($iddivisa){
        $consulta = $this->dbc->query("SELECT * FROM divisa WHERE iddivisa = '$iddivisa'");
        $resultado = $consulta->fetch_assoc();
        $estadoDivisa = $resultado['estado'];
        $idempresa = $resultado['idempresa'];

        if($estadoDivisa == 2){ // desactivado
            // $edicionDivisa = $this->dbp->query("UPDATE divisas SET estado = '1' WHERE id_divisas = '$id_divisas'");
            $edicionDivisa = $this->dbc->query("UPDATE divisa
                                                SET estado = CASE
                                                    WHEN iddivisa = '$iddivisa' THEN 1
                                                    ELSE 2
                                                END
                                                WHERE idempresa = '$idempresa';
");

            $res = array("success", "la divisa se activo exitosamente","activar_divisa");
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
}
?>
