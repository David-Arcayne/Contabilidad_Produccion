<?php
require_once "../../db/db.php";
class Asiento extends DB{
    public function registrar_asignacion_asiento_operacion($idoperacion_modulos,$idasientotipo,$bandera,$frecuencia_registro,$idgestion,$empresa){
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];
//ini_set
        if (0 > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO asignacion_asiento_operacion_modulos(idoperacion_modulos,idasientotipo,bandera,frecuencia_registro,idgestion,idempresa) 
            VALUES ('$idoperacion_modulos','$idasientotipo','$bandera','$frecuencia_registro','$idgestion','$idempresa')");
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
    public function listar_operacion_modulo_filtrado($nombre) {
        
        $lista = [];
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
            WHERE aaom.idasignacion_asiento_operacion_modulos IS NULL
            AND o.nombre_modulo = '$nombre';
            ");
    
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
                "idempresa" => $lam['idempresa']
            );
            array_push($lista, $res3);
        }

        }

        // $asom = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos ORDER BY idempresa;");

        // while ($qwe = $this->dbc->fetch($asom)) {
        //     $res = array(
        //         "iddivisa" => $qwe['iddivisa'],
        //         "simbolo" => $qwe['simbolo'],
        //         "nombre" => $qwe['nombre'],
        //         "estado" => $qwe['estado']
        //     );
        //     array_push($lista, $res);
        // }
         echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function vincular_ventas_a_transaccion_antiguo($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        // $idempresa = $this->getidempresa($data['idempresa']);
        // $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $montoRecibos = 0;

        // $ids_vinculados = [];

        // $es_cobro = "";
        $existe_confi_conta = $this->dbc->query("SELECT *
        FROM operacion_modulos om
        INNER JOIN asignacion_asiento_operacion_modulos aso 
            ON aso.idoperacion_modulos = om.idoperacion_modulos
        WHERE om.nombre_operacion = 'venta' AND aso.idempresa ='$data[idempresa]';");

        if($existe_confi_conta->num_rows > 0){ //SI EXISTE LA CONFIGURACION.
            $confi_cuenta = $existe_confi_conta->fetch_assoc();
            //PREGUNTAREMOS SI LA CONFI ES DE DIA, MES, AÑO?
            if($confi_cuenta['frecuencia_registro'] == 'dia'){ // DIA

            }elseif($confi_cuenta['frecuencia_registro'] == 'semana'){ //SEMANA

                $fecha_actual = date("Y-m-d"); // hoy
                $dia_semana = date("N", strtotime($fecha_actual)); // 1 = lunes, 7 = domingo

                // Calcular lunes de esa semana
                $lunes = date("Y-m-d", strtotime($fecha_actual . " -".($dia_semana-1)." days"));

                // Calcular domingo de esa semana (opcional, si quieres todo el rango)
                $domingo = date("Y-m-d", strtotime($lunes . " +6 days"));

                //pregntar ya existe una transacción automática en esta semana?? 
                $existe_trans_auto = $this->dbc->query("SELECT * FROM transacciones 
                WHERE fechatransaccion >= '$lunes' 
                AND fechatransaccion <= '$domingo'
                AND tipo_registro = 'automatico_venta'");

                if($existe_trans_auto->num_rows > 0){ //SI EXISTE TRANS PARA VENTA EN ESTA SEMANA

                    //VINCULAMOS A LA TRANS QUE YA EXISTE
                    $trans_aut = $existe_trans_auto->fetch_assoc();

                    foreach ($data['venta'] as $venta) {
                        $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                        VALUES('$venta[idventa]','$trans_aut[idtransacciones]','0','contado_venta_comercial','$data[idempresa]')");  
                    }

                }else{ // NO EXISTE TRANS, CREAR UNO NUEVO
                    // $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                    // VALUES(NULL,'$nroTransaccion','$fecha','$idtipo_cambio','$ndocumento','$glosa','1','1','$tipotransaccion','$ide','$idsucursal','$idgestion','automatico_venta')");

                    $tipoasiento = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                    $type_as = $tipoasiento->fetch_assoc();

                    $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                    VALUES(NULL,'1000','$fecha_actual','0','0','transaccion automatica de venta','1','1','$type_as[tipo]','$data[idempresa]','0','0','automatico_venta')");

                    $idtransaccion = $this->dbc->insert_id;

                    $debe = 0; 
                    $haber = 0;

                    $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                    $orden = 1;
                    while ($qwe = $this->dbc->fetch($tasiento)) {
                        $pcuenta = $qwe['idcuenta'];
                        if ($qwe['tipo'] == "DEBE") {
                            // $debe = $monto * ($qwe['porciento'] / 100);
                            $haber = 0;
                        } elseif ($qwe['tipo'] == "HABER") {
                            $debe = 0;
                            // $haber = $monto * ($qwe['porciento'] / 100);
                        }
                        //$pcuenta=$_POST['plandecuenta']; 
                        $ppresupuestario = 0; //$_POST['planpresupuestario'];
                        $nota = "-";
                        $estado = 1; //$_POST['estado'];
                        $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                        VALUES ('$debe','$haber','$nota','$idtransaccion','$pcuenta','$ppresupuestario','$estado','2','2','$data[idempresa]','0','$orden')");

                        $orden = $orden + 1;
                    }

                    foreach ($data['venta'] as $venta) {
                        $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                        VALUES('$venta[idventa]','$idtransaccion','0','contado_venta_comercial','$data[idempresa]')");  
                    }

                }
            }elseif($confi_cuenta['frecuencia_registro'] == 'mes'){ // MES

            }
        }else{
            // SE REGISTRARA NORMAL LA VENTA SIN INVOLUCRARSE CON CONTABILIDAD
        }

        // Respuesta
        if (TRUE === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['venta']);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }

    public function vincular_ventas_a_transaccion($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        // $idempresa = $this->getidempresa($data['idempresa']);
        // $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $montoRecibos = 0;

        // $ids_vinculados = [];

        // $es_cobro = "";
        $existe_confi_conta = $this->dbc->query("SELECT *
        FROM operacion_modulos om
        INNER JOIN asignacion_asiento_operacion_modulos aso 
            ON aso.idoperacion_modulos = om.idoperacion_modulos
        WHERE om.nombre_operacion = 'venta' AND aso.idempresa ='$data[idempresa]';");

            $confi_cuenta = $existe_confi_conta->fetch_assoc();

                $fecha_actual = date("Y-m-d"); // hoy
                $dia_semana = date("N", strtotime($fecha_actual)); // 1 = lunes, 7 = domingo

                // Calcular lunes de esa semana
                $lunes = date("Y-m-d", strtotime($fecha_actual . " -".($dia_semana-1)." days"));

                // Calcular domingo de esa semana (opcional, si quieres todo el rango)
                $domingo = date("Y-m-d", strtotime($lunes . " +6 days"));

                //pregntar ya existe una transacción automática en esta semana?? 
                $existe_trans_auto = $this->dbc->query("SELECT * FROM transacciones 
                WHERE fechatransaccion >= '$lunes' 
                AND fechatransaccion <= '$domingo'
                AND tipo_registro = 'automatico_venta'");

                    // $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                    // VALUES(NULL,'$nroTransaccion','$fecha','$idtipo_cambio','$ndocumento','$glosa','1','1','$tipotransaccion','$ide','$idsucursal','$idgestion','automatico_venta')");

                    $tipoasiento = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                    $type_as = $tipoasiento->fetch_assoc();

                    $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                    VALUES(NULL,'1000','$fecha_actual','0','0','transaccion automatica de venta','1','1','$type_as[tipo]','$data[idempresa]','0','0','automatico_venta')");

                    $idtransaccion = $this->dbc->insert_id;

                    $debe = 0; 
                    $haber = 0;

                    $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                    $orden = 1;
                    while ($qwe = $this->dbc->fetch($tasiento)) {
                        $pcuenta = $qwe['idcuenta'];
                        if ($qwe['tipo'] == "DEBE") {
                            // $debe = $monto * ($qwe['porciento'] / 100);
                            $haber = 0;
                        } elseif ($qwe['tipo'] == "HABER") {
                            $debe = 0;
                            // $haber = $monto * ($qwe['porciento'] / 100);
                        }
                        //$pcuenta=$_POST['plandecuenta']; 
                        $ppresupuestario = 0; //$_POST['planpresupuestario'];
                        $nota = "-";
                        $estado = 1; //$_POST['estado'];
                        $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                        VALUES ('$debe','$haber','$nota','$idtransaccion','$pcuenta','$ppresupuestario','$estado','2','2','$data[idempresa]','0','$orden')");

                        $orden = $orden + 1;
                    }

                    foreach ($data['venta'] as $venta) {
                        $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                        VALUES('$venta[idventa]','$idtransaccion','0','contado_venta_comercial','$data[idempresa]')");  
                    }

        // Respuesta
        if (TRUE === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['venta']);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
}
?>
