<?php
require_once __DIR__."/../db/conexion.php";

register_shutdown_function(function() {
    Conexion::getInstance()->closeAll();
});

class Vinculacion_comercial {

    private $dbc;
    private $conexion;
    
    public function __construct(){
        $this->conexion = Conexion::getInstance();
        $this->dbc = $this->conexion->dbc;
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

        // $es_cobro = "";
        $existe_confi_conta = $this->dbc->query("SELECT *
        FROM operacion_modulos om
        INNER JOIN asignacion_asiento_operacion_modulos aso 
            ON aso.idoperacion_modulos = om.idoperacion_modulos
        WHERE om.nombre_operacion = 'venta' AND aso.idempresa ='$data[idempresa]';");

            $confi_cuenta = $existe_confi_conta->fetch_assoc();

              //  $fecha_actual = date("Y-m-d"); // hoy

                    $tipoasiento = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                    $type_as = $tipoasiento->fetch_assoc();

                    $tipoCambio = $this->dbc->query("SELECT * FROM tipodecambio WHERE fecha = '$data[fecha]' AND idorganizacion = '$data[idempresa]'");
                        if($tipoCambio->num_rows > 0){
                            $tc = $tipoCambio->fetch_assoc();
                            $id_tc = $tc['idtipodecambio'];
                        }else{
                            $trans_tc = $this->dbc->query("SELECT * FROM transacciones WHERE idgestion = '$confi_cuenta[idgestion]' ORDER BY codigotransaccion DESC LIMIT 1");
                            $ttc = $trans_tc->fetch_assoc();
                            $id_tc = $ttc['tipodecambio'];
                        }

                    if($data['bandera'] == '1'){ // REVISION
                        $nro_trans = -1;
                        $estado_trans = 6;
                    }else{ // bandera = 2 DIRECTO
                        $nro_trans = -3;
                        $estado_trans = 1;
                    }
                    if($data['frecuencia_registro'] == 'por_operacion'){ // es de frecuencia "POR OPERACION" ???

                        foreach ($data['documentos'] as $venta) {


                            $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                            VALUES(NULL,'$nro_trans','$data[fecha]','$id_tc','0','transaccion automatica de venta','2','$estado_trans','$type_as[tipo]','$data[idempresa]','0','$confi_cuenta[idgestion]','automatico_venta')");

                            $idtransaccion = $this->dbc->insert_id;

                            $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                            VALUES('$venta[id]','$idtransaccion','0','contado_venta_comercial','$data[idempresa]')"); 

                            $monto_documentos = 0;
                            $monto_documentos = $monto_documentos + $venta['monto'];

                            $debe = 0; 
                            $haber = 0;

                            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                            $orden = 1;
                            while ($qwe = $this->dbc->fetch($tasiento)) {
                                $pcuenta = $qwe['idcuenta'];
                                if ($qwe['tipo'] == "DEBE") {
                                    $debe = $monto_documentos * ($qwe['porciento'] / 100);
                                    $haber = 0;
                                } elseif ($qwe['tipo'] == "HABER") {
                                    $debe = 0;
                                    $haber = $monto_documentos * ($qwe['porciento'] / 100);
                                }
                                //$pcuenta=$_POST['plandecuenta']; 
                                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                                $nota = "-";
                                $estado = 1; //$_POST['estado'];
                                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                                VALUES ('$debe','$haber','$nota','$idtransaccion','$pcuenta','$ppresupuestario','$estado','2','2','$data[idempresa]','0','$orden')");

                                $orden = $orden + 1;
                            }
                        }

                        

                    }else{ // es de frecuencia "POR DIA, SEMANA, MES"
                         $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                        VALUES(NULL,'$nro_trans','$data[fecha]','$id_tc','0','transaccion automatica de venta','2','$estado_trans','$type_as[tipo]','$data[idempresa]','0','$confi_cuenta[idgestion]','automatico_venta')");

                        $idtransaccion = $this->dbc->insert_id;

                        $monto_documentos = 0;
                        foreach ($data['documentos'] as $venta) {
                            $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                            VALUES('$venta[id]','$idtransaccion','0','contado_venta_comercial','$data[idempresa]')"); 

                            $monto_documentos = $monto_documentos + $venta['monto'];
                        }

                        $debe = 0; 
                        $haber = 0;

                        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                        $orden = 1;
                        while ($qwe = $this->dbc->fetch($tasiento)) {
                            $pcuenta = $qwe['idcuenta'];
                            if ($qwe['tipo'] == "DEBE") {
                                $debe = $monto_documentos * ($qwe['porciento'] / 100);
                                $haber = 0;
                            } elseif ($qwe['tipo'] == "HABER") {
                                $debe = 0;
                                $haber = $monto_documentos * ($qwe['porciento'] / 100);
                            }
                            //$pcuenta=$_POST['plandecuenta']; 
                            $ppresupuestario = 0; //$_POST['planpresupuestario'];
                            $nota = "-";
                            $estado = 1; //$_POST['estado'];
                            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                            VALUES ('$debe','$haber','$nota','$idtransaccion','$pcuenta','$ppresupuestario','$estado','2','2','$data[idempresa]','0','$orden')");

                            $orden = $orden + 1;
                        }
                    }

        // Respuesta
        if (TRUE === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }

    public function vincular_cotizaciones_a_transaccion($data) {
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

              //  $fecha_actual = date("Y-m-d"); // hoy

                    $tipoasiento = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                    $type_as = $tipoasiento->fetch_assoc();

                    $tipoCambio = $this->dbc->query("SELECT * FROM tipodecambio WHERE fecha = '$data[fecha]' AND idorganizacion = '$data[idempresa]'");
                        if($tipoCambio->num_rows > 0){
                            $tc = $tipoCambio->fetch_assoc();
                            $id_tc = $tc['idtipodecambio'];
                        }else{
                            $trans_tc = $this->dbc->query("SELECT * FROM transacciones WHERE idgestion = '$confi_cuenta[idgestion]' ORDER BY codigotransaccion DESC LIMIT 1");
                            $ttc = $trans_tc->fetch_assoc();
                            $id_tc = $ttc['tipodecambio'];
                        }

                    if($data['bandera'] == '1'){ // REVISION
                        $nro_trans = -1;
                        $estado_trans = 6;
                    }else{ // bandera = 2 DIRECTO
                        $nro_trans = -3;
                        $estado_trans = 1;
                    }

                    if($data['frecuencia_registro'] == 'por_operacion'){ // es de frecuencia "POR OPERACION" ???

                        
                        foreach ($data['documentos'] as $venta) {

                            $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                            VALUES(NULL,'$nro_trans','$data[fecha]','$id_tc','0','transaccion automatica de cotizacion','2','$estado_trans','$type_as[tipo]','$data[idempresa]','0','$confi_cuenta[idgestion]','automatico_venta')");

                            $idtransaccion = $this->dbc->insert_id;

                            $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                            VALUES('$venta[id]','$idtransaccion','0','contado_cotizacion_comercial','$data[idempresa]')"); 

                            $monto_documentos = 0;
                            $monto_documentos = $monto_documentos + $venta['monto'];

                            $debe = 0; 
                            $haber = 0;

                            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                            $orden = 1;
                            while ($qwe = $this->dbc->fetch($tasiento)) {
                                $pcuenta = $qwe['idcuenta'];
                                if ($qwe['tipo'] == "DEBE") {
                                    $debe = $monto_documentos * ($qwe['porciento'] / 100);
                                    $haber = 0;
                                } elseif ($qwe['tipo'] == "HABER") {
                                    $debe = 0;
                                    $haber = $monto_documentos * ($qwe['porciento'] / 100);
                                }
                                //$pcuenta=$_POST['plandecuenta']; 
                                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                                $nota = "-";
                                $estado = 1; //$_POST['estado'];
                                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                                VALUES ('$debe','$haber','$nota','$idtransaccion','$pcuenta','$ppresupuestario','$estado','2','2','$data[idempresa]','0','$orden')");

                                $orden = $orden + 1;
                            }
                        }

                        

                    }else{ // es de frecuencia "POR DIA, SEMANA, MES"
                         $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion,tipo_registro)
                        VALUES(NULL,'$nro_trans','$data[fecha]','$id_tc','0','transaccion automatica de cotizacion','2','$estado_trans','$type_as[tipo]','$data[idempresa]','0','$confi_cuenta[idgestion]','automatico_venta')");

                        $idtransaccion = $this->dbc->insert_id;

                        $monto_documentos = 0;
                        foreach ($data['documentos'] as $venta) {
                            $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                            VALUES('$venta[id]','$idtransaccion','0','contado_cotizacion_comercial','$data[idempresa]')"); 

                            $monto_documentos = $monto_documentos + $venta['monto'];
                        }

                        $debe = 0; 
                        $haber = 0;

                        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$confi_cuenta[idasientotipo]'");
                        $orden = 1;
                        while ($qwe = $this->dbc->fetch($tasiento)) {
                            $pcuenta = $qwe['idcuenta'];
                            if ($qwe['tipo'] == "DEBE") {
                                $debe = $monto_documentos * ($qwe['porciento'] / 100);
                                $haber = 0;
                            } elseif ($qwe['tipo'] == "HABER") {
                                $debe = 0;
                                $haber = $monto_documentos * ($qwe['porciento'] / 100);
                            }
                            //$pcuenta=$_POST['plandecuenta']; 
                            $ppresupuestario = 0; //$_POST['planpresupuestario'];
                            $nota = "-";
                            $estado = 1; //$_POST['estado'];
                            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                            VALUES ('$debe','$haber','$nota','$idtransaccion','$pcuenta','$ppresupuestario','$estado','2','2','$data[idempresa]','0','$orden')");

                            $orden = $orden + 1;
                        }
                    }

        // Respuesta
        if (TRUE === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
}