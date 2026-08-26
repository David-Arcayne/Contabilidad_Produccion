<?php
require_once "../../db/db.php";
class Asiento extends DB{
    public function registrar_asignacion_asiento_operacion($fecha_registro,$idoperacion_modulos,$idasientotipo,$bandera,$frecuencia_registro,$idgestion,$empresa){
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];
//ini_set
        if (0 > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO asignacion_asiento_operacion_modulos(fecha_registro,idoperacion_modulos,idasientotipo,bandera,frecuencia_registro,idgestion,idempresa) 
            VALUES ('$fecha_registro','$idoperacion_modulos','$idasientotipo','$bandera','$frecuencia_registro','$idgestion','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }

    public function editar_asignacion_asiento_operacion($id,$idoperacion_modulos,$idasientotipo,$bandera) {
        // $idempresa = $this->getidempresa($empresa);

        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND iddivisa != '$id'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE asignacion_asiento_operacion_modulos
                                    SET idoperacion_modulos = '$idoperacion_modulos',
                                    idasientotipo = '$idasientotipo',
                                    bandera = '$bandera'
                                    WHERE idasignacion_asiento_operacion_modulos = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }

    public function listar_asignacion_asiento_operacion($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos WHERE idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion = ' $qwe[idgestion]'");
            $gst = $gestion->fetch_assoc();

            $getPedido2 = $this->dbc->query("SELECT * FROM operacion_modulos WHERE idoperacion_modulos = ' $qwe[idoperacion_modulos]'");
            $operacionModulo = $getPedido2->fetch_assoc();

            $getPedido3 = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo = ' $qwe[idasientotipo]'");
            $asiento = $getPedido3->fetch_assoc();

            $res = array(
                "idasignacion_asiento_operacion_modulos" => $qwe['idasignacion_asiento_operacion_modulos'],
                "idoperacion_modulos" => $qwe['idoperacion_modulos'],
                "nombre_modulo" => $operacionModulo['nombre_modulo'],
                "nombre_operacion" => $operacionModulo['nombre_operacion'],   
                "descripcion_operacion" => $operacionModulo['descripcion'], 
                "idasientotipo" => $qwe['idasientotipo'],
                "nombre_asiento" => $asiento['nombre'],
                "bandera" => $qwe['bandera'],
                "frecuencia_registro" => $qwe['frecuencia_registro'],
                "idgestion" => $qwe['idgestion'],
                "nombre_gestion" => $gst['nombre']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_operacion_modulo($nombre) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM operacion_modulos WHERE nombre_modulo = '$nombre'");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idoperacion_modulos" => $qwe['idoperacion_modulos'],
                "nombre_modulo" => $qwe['nombre_modulo'],
                "nombre_operacion" => $qwe['nombre_operacion'],
                "descripcion" => $qwe['descripcion']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_operacion_modulo_filtrado($nombre,$empresa) {
        
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        // $idempresa = $this->getidempresa($empresa);
        // SELECT o.* 
        //  FROM operacion_modulos o
        //  LEFT JOIN asignacion_asiento_operacion_modulos aaom ON o.idoperacion_modulos = aaom.idoperacion_modulos
        //  WHERE aaom.idasignacion_asiento_operacion_modulos IS NULL;
        
        
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT o.*
        FROM operacion_modulos o
        LEFT JOIN asignacion_asiento_operacion_modulos aaom 
            ON o.idoperacion_modulos = aaom.idoperacion_modulos
            AND aaom.idempresa = '$idempresa'
        WHERE o.nombre_modulo = '$nombre'
        AND aaom.idoperacion_modulos IS NULL");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idoperacion_modulos" => $qwe['idoperacion_modulos'],
                "nombre_modulo" => $qwe['nombre_modulo'],
                "nombre_operacion" => $qwe['nombre_operacion'],
                "descripcion" => $qwe['descripcion']
            );
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
    public function listar_asiento_por_modulo($nombre, $empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM asientotipo WHERE tipo_modulo = '$nombre' AND idorganizacion = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idasientotipo" => $qwe['idasientotipo'],
                "nombre" => $qwe['nombre'],
                "tipo" => $qwe['tipo'],
                "tipo_modulo" => $qwe['tipo_modulo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function obtener_operacion_despacho_diario($fecha_actual) {

        $lista = [];

        $lista_asignacion_dia = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos 
            WHERE frecuencia_registro='dia'
            ORDER BY idempresa;");

            while ($lad = $this->dbc->fetch($lista_asignacion_dia)) {
                $operacion_modu_dia = $this->dbc->query("SELECT * FROM operacion_modulos 
                WHERE idoperacion_modulos='$lad[idoperacion_modulos]'");

                $oml = $operacion_modu_dia->fetch_assoc();

            $res1 = array(
                // "iddivisa" => $qwe['iddivisa'],
                "idasignacion_asiento_operacion_modulos" => $lad['idasignacion_asiento_operacion_modulos'],
                "nombre_operacion" => $oml['nombre_operacion'],
                "frecuencia_registro" => $lad['frecuencia_registro'],
                "fecha_registro" => $lad['fecha_registro'],
                "bandera" => $lad['bandera'],
                "idempresa" => $lad['idempresa']
            );
            array_push($lista, $res1);
        }

        $timestamp = strtotime($fecha_actual);


        // Verificar si es domingo (N=7)
        $esDomingo = (date("N", $timestamp) == 7);

        if($esDomingo){
            $lista_asignacion_semana = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos 
            WHERE frecuencia_registro='semana'
            ORDER BY idempresa;");

            while ($las = $this->dbc->fetch($lista_asignacion_semana)) {
                $operacion_modu_sema = $this->dbc->query("SELECT * FROM operacion_modulos 
                WHERE idoperacion_modulos='$las[idoperacion_modulos]'");

                $oms = $operacion_modu_sema->fetch_assoc();

            $res2 = array(
                // "iddivisa" => $qwe['iddivisa'],
                // "simbolo" => $qwe['simbolo'],
                "idasignacion_asiento_operacion_modulos" => $las['idasignacion_asiento_operacion_modulos'],
                "nombre_operacion" => $oms['nombre_operacion'],
                "frecuencia_registro" => $las['frecuencia_registro'],
                "fecha_registro" => $las['fecha_registro'],
                "bandera" => $las['bandera'],
                "idempresa" => $las['idempresa']
            );
            array_push($lista, $res2);
        }
        }
        // Verificar si es último día del mes
        $ultimoDiaMes = date("t", $timestamp); // total de días del mes
        $diaActual = date("j", $timestamp);    // día actual
        $esUltimoDiaMes = ($diaActual == $ultimoDiaMes);

        if($esUltimoDiaMes){
            $lista_asignacion_mes = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos 
            WHERE frecuencia_registro='mes'
            ORDER BY idempresa;");

            while ($lam = $this->dbc->fetch($lista_asignacion_mes)) {
                $operacion_modu = $this->dbc->query("SELECT * FROM operacion_modulos 
                WHERE idoperacion_modulos='$lam[idoperacion_modulos]'");

                $om = $operacion_modu->fetch_assoc();

            $res3 = array(
                // "iddivisa" => $qwe['iddivisa'],
                // "simbolo" => $qwe['simbolo'],
                "idasignacion_asiento_operacion_modulos" => $lam['idasignacion_asiento_operacion_modulos'],
                "nombre_operacion" => $om['nombre_operacion'],
                "frecuencia_registro" => $lam['frecuencia_registro'],
                "fecha_registro" => $lam['fecha_registro'],
                "bandera" => $lam['bandera'],
                "idempresa" => $lam['idempresa']
            );
            array_push($lista, $res3);
        }

        }

         echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function aceptar_transaccion_comercial_en_revision($idtransaccion,$idgestion, $fecha) {
        // $lista = [];
    
        $existe_trans_post = $this->dbc->query("SELECT *
        FROM transacciones
        WHERE fechatransaccion > '$fecha' and idgestion ='$idgestion' order by codigotransaccion desc;");

        if($existe_trans_post->num_rows > 0){ // SE DEBE INSERTAR Y RECORRER NUMERACION

            $nro_transaccion = $this->dbc->query("SELECT COUNT(*) + 1 AS posicion
            FROM transacciones
            WHERE fechatransaccion <= '$fecha' and idgestion ='$idgestion';");

            $nt = $nro_transaccion->fetch_assoc();

            $mover_numeracion = $this->dbc->query("SELECT *
            FROM transacciones
            WHERE fechatransaccion > '$fecha' and idgestion ='$idgestion' order by codigotransaccion asc;");

            while ($m_n = $this->dbc->fetch($mover_numeracion)) {
                $codigo_trns = $m_n['codigotransaccion'] + 1;
                $update_trans = $this->dbc->query("UPDATE transacciones
                SET codigotransaccion = '$codigo_trns'
                WHERE idtransacciones ='$m_n[idtransacciones]'");
            }

            $update_trans_original = $this->dbc->query("UPDATE transacciones
                SET codigotransaccion = '$nt[posicion]'
                WHERE idtransacciones ='$idtransaccion'");
        }else{ // ESTARA EN ESPERA CON -3 PARA ESPERAR EL MOMENTO QUE LE TOQUE INGRESAR A LA LISTA DE TRANSACCIONES
            $update_trans_original = $this->dbc->query("UPDATE transacciones
                SET codigotransaccion = '-3'
                WHERE idtransacciones ='$idtransaccion'");
        }

        if ($update_trans_original === TRUE) {                                                                                                                                                                
                $res = array("success", "Se Acepto Correctamente","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
    
        echo json_encode($res, JSON_NUMERIC_CHECK);
    }
}
?>
