<?php
// session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Factura_comercial extends DB{
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listapagarfactura
        return $qwe['idgestion'];
    }
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    public function getidsucursal($md5)
    {
        $registro = $this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }
    
    public function listar_factura_comercial($idmd5,$viv_mister_soft){ // FACTURAS VENTA DE COMERCIAL QUE NO TIENEN TRANSACCION       
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
   
        if($viv_mister_soft == "vivasoft"){
            $url = "https://vivasoft.link/app/cmv1/api/listaVentas/".$idmd5;
        }else{ // mistersofts
            $url = "https://mistersofts.com/app/cmv1/api/listaVentas/".$idmd5;
        }
        
        $data = json_decode(file_get_contents($url), true);
        $lista_factura_venta = [];

        foreach($data as $plantilla){
// PREGUNTAMOS SI ESA FACTURA TIENE CAJA BANCOS -- SOLO TOMA EN CUENTA FACT AL CONTADO, LAS DE CREDITO NUNCA TENDRAN CAJA BANCOS, SOLO SUS COBROS

            $fact_caja_banco = $this->dbc->query("SELECT * 
                                            FROM comprobantes_comercial_caja_bancos 
                                            WHERE id_documento = '{$plantilla['id']}' AND registro_desde ='contado_venta_comercial'");
            
            if($fact_caja_banco->num_rows > 0){
                $cb_comprob = $fact_caja_banco->fetch_assoc();

                $caja_banco = $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$cb_comprob[idcaja_bancos]'");
                $cb = $caja_banco->fetch_assoc();

                $nombre_caja_banco = $cb['tipo_cuenta'];
            } else {
                // no tiene caja banco
                $nombre_caja_banco = "";
            }            

            //PREGUNTAMOS SI ESA FACTURA TIENE TRANSACCION
            $trans_fact = $this->dbc->query("SELECT id_documento 
                                            FROM transaccion_documentos_comercial 
                                            WHERE id_documento = '{$plantilla['id']}' AND registro_desde ='contado_venta_comercial'");
            if($trans_fact->num_rows > 0){
                // Ya existe, no lo agregamos
            }else {
                // Guardamos todo el registro, no solo el id
                $plantilla['nombre_caja_banco'] = $nombre_caja_banco; 
                $lista_factura_venta[] = $plantilla;
            }
        }
        echo json_encode($lista_factura_venta);
    }
    
    public function listar_factura_comercial_sin_cajaBancos($idmd5,$viv_mister_soft){ // FACTURAS VENTA DE COMERCIAL QUE NO TIENE CAJA BANCOS    
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
   
        if($viv_mister_soft == "vivasoft"){
            $url = "https://vivasoft.link/app/cmv1/api/listaVentas/".$idmd5;
        }else{ // mistersofts
            $url = "https://mistersofts.com/app/cmv1/api/listaVentas/".$idmd5;
        }
        
        $data = json_decode(file_get_contents($url), true);
        $lista_factura_venta = [];

        foreach($data as $plantilla){

        //PREGUNTAMOS SI ESA FACTURA TIENE TRANSACCION
            $trans_fact = $this->dbc->query("SELECT idtransaccion 
                                            FROM transaccion_documentos_comercial 
                                            WHERE id_documento = '{$plantilla['id']}' AND registro_desde ='contado_venta_comercial'");
            if($trans_fact->num_rows > 0){
                // AGREGAMOS EL CODIGO DE LA TRANSACCION
                $trans_codig = $trans_fact->fetch_assoc();

                $transaccion = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$trans_codig[idtransaccion]'");
                $codigo = $transaccion->fetch_assoc();

                $codigo_trans = $codigo['codigotransaccion'];
            }else {
                // Guardamos todo el registro, no solo el id
                $codigo_trans = "";
            }

// PREGUNTAMOS SI ESA FACTURA TIENE CAJA BANCOS -- SOLO TOMA EN CUENTA FACT AL CONTADO, LAS DE CREDITO NUNCA TENDRAN CAJA BANCOS, SOLO SUS COBROS

            $fact_caja_banco = $this->dbc->query("SELECT * 
                                            FROM comprobantes_comercial_caja_bancos 
                                            WHERE id_documento = '{$plantilla['id']}' AND registro_desde ='contado_venta_comercial'");
            
            if($fact_caja_banco->num_rows > 0){
                //YA EXISTE, NO LO AGREGAMOS
            } else {
                // Guardamos todo el registro, no solo el id
                $plantilla['codigotransaccion'] = $codigo_trans; 
                $lista_factura_venta[] = $plantilla;
            }            
        }
        echo json_encode($lista_factura_venta);
    }

    public function listar_factura_comercial_por_id($idventa)
    {
        //  ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        // $idempresa = $this->getidempresa($idmd5);
        $lista = [];

        $listaFactura = [];
        $estado_cobro = $this->dbcm->query("SELECT * FROM estado_cobro WHERE venta_id_venta = '$idventa'");
        $ec = $estado_cobro->fetch_assoc();

        $detalle_cobro = $this->dbcm->query("SELECT * FROM detalle_cobro WHERE estado_cobro_id_estado_cobro = '$ec[id_estado_cobro]'");
        // $dc = $detalle_cobro->fetch_assoc();

        while ($zxc = $this->dbcm->fetch($detalle_cobro)) {
            $res = array(
                "iddetalle_cobro" => $zxc['iddetalle_cobro'],
                "fecha_actual" => $zxc['fecha_actual'],
                "ncuotas" => $zxc['ncuotas'],
                "valor_cuotas" => $zxc['valor_cuotas'],
                "monto" => $zxc['monto']
            );
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }

    public function listar_factura_comercial_comprobante($idmd5)
    {
        // $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $idempresa = $this->getidempresa($idmd5);
        $lista = [];

        $listaFactura = [];
        $trans_fact = $this->dbc->query("SELECT id_documento FROM transaccion_documentos_comercial WHERE idempresa = '$idempresa' AND registro_desde ='contado_venta_comercial'");
        while ($zxc = $this->dbc->fetch($trans_fact)) {
            // $listaFactura = $zxc['idfactura_comercial'];
            array_push($listaFactura,$zxc['id_documento']);
        }

        $facturas = implode(", ", $listaFactura);
        
        if (!empty($facturas)) {
        $condicion_facturas = "AND v.id_venta NOT IN ($facturas)";
        } else {
        $condicion_facturas = ""; // no agregues esa condición
        }

        $clien = $this->dbcm->query("SELECT v.id_venta, a.nombre, v.fecha_venta, c.nombre , c.nombrecomercial, c.ciudad, v.tipo_venta, v.tipo_pago, v.monto_total, v.nfactura, v.descuento, pa.almacen_id_almacen, v.cliente_id_cliente1, s.nombre, v.estado, ca.canal, vf.cuf, vf.fechaEmission, vf.shortLink, vf.urlSin,ec.estado as estado_cobro,ec.saldo FROM venta v 
        LEFT JOIN cliente c ON v.cliente_id_cliente1=c.id_cliente
        LEFT JOIN detalle_venta dv ON v.id_venta=dv.venta_id_venta
        LEFT JOIN sucursal s ON v.idsucursal=s.id_sucursal
        LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN almacen a ON pa.almacen_id_almacen=a.id_almacen
        LEFT JOIN canalventa ca ON v.idcanal=ca.idcanalventa
        LEFT JOIN ventas_facturadas vf ON v.id_venta=vf.venta_id_venta
        LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta
        WHERE c.idempresa = '$idempresa' 
        $condicion_facturas
        AND v.tipo_venta ='0' AND ec.estado !='4'
        GROUP BY v.id_venta
        ORDER BY v.fecha_venta DESC, v.id_venta DESC");
        while ($qwe = $this->dbcm->fetch($clien)) {
            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5], "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11], "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17], "shortlink" => $qwe[18], "urlsin" => $qwe[19],"estado_cobro" => $qwe[20],"saldo" => $qwe[21]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listar_factura_comercial_anuladas($idmd5)
    {
        // $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $idempresa = $this->getidempresa($idmd5);
        $lista = [];

        $listaFactura = [];
        $trans_fact = $this->dbc->query("SELECT id_documento FROM transaccion_documentos_comercial WHERE idempresa = '$idempresa' AND registro_desde ='contado_venta_comercial'");
        while ($zxc = $this->dbc->fetch($trans_fact)) {
            // $listaFactura = $zxc['idfactura_comercial'];
            array_push($listaFactura,$zxc['id_documento']);
        }

        $facturas = implode(", ", $listaFactura);
            if (!empty($facturas)) {
            $condicion_facturas = "AND v.id_venta NOT IN ($facturas)";
            } else {
            $condicion_facturas = ""; // no agregues esa condición
            }
        $clien = $this->dbcm->query("SELECT v.id_venta, a.nombre, v.fecha_venta, c.nombre , c.nombrecomercial, c.ciudad, v.tipo_venta, v.tipo_pago, v.monto_total, v.nfactura, v.descuento, pa.almacen_id_almacen, v.cliente_id_cliente1, s.nombre, v.estado, ca.canal, vf.cuf, vf.fechaEmission, vf.shortLink, vf.urlSin,ec.estado as estado_cobro,ec.saldo FROM venta v 
        LEFT JOIN cliente c ON v.cliente_id_cliente1=c.id_cliente
        LEFT JOIN detalle_venta dv ON v.id_venta=dv.venta_id_venta
        LEFT JOIN sucursal s ON v.idsucursal=s.id_sucursal
        LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN almacen a ON pa.almacen_id_almacen=a.id_almacen
        LEFT JOIN canalventa ca ON v.idcanal=ca.idcanalventa
        LEFT JOIN ventas_facturadas vf ON v.id_venta=vf.venta_id_venta
        LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta
        WHERE c.idempresa = '$idempresa' 
        $condicion_facturas 
        AND ec.estado ='4'
        GROUP BY v.id_venta
        ORDER BY v.fecha_venta DESC, v.id_venta DESC");
        while ($qwe = $this->dbcm->fetch($clien)) {
            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5], "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11], "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17], "shortlink" => $qwe[18], "urlsin" => $qwe[19],"estado_cobro" => $qwe[20],"saldo" => $qwe[21]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
      public function cobro_asignacion_factura_comercial($registro_desde,$fecha_transaccion,$monto_total,$idtransaccion,$idcaja_bancos,$idasientotipo,$idempresa,$idsucursal,$data,$zn,$tipo_cuenta,$cuenta,$gestion)
    {  
        // $caja_bancos = json_decode($idcaja_bancos, true);
        $facturas = json_decode($data, true);

        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        // Establecer la zona horaria recibida
        date_default_timezone_set($zn);
                
        $bandera = TRUE;
        // Obtener la hora actual del Pais en el que se registra
        $hora_actual = date('H:i:s');

        // Combinar la fecha recibida con la hora actual
        $fecha_completa = $fecha_transaccion . ' ' . $hora_actual; // Resultado tipo DATETIME

        $ide = $this->getidempresa($idempresa);
        $sucursal = $this->getidsucursal($idsucursal); 
        // $gestion = $this->getgestionactualid($ide);

        $res = "";
        $glosa = "Registro cobro comercial";
        // $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1; //ingreso
        $trans = "";
        
        if ($idasientotipo != "") {

            $glosa2 = $this->dbc->real_escape_string($glosa);
            $fecha2 = $this->dbc->real_escape_string($fecha_transaccion);
            // $nroTransaccion2 = $this->dbc->real_escape_string($nroTransaccion);

        // Construir rango dinámico (primer y último día del mes)
            $fecha_inicio = date("Y-m-01", strtotime($fecha2)); // "2025-03-01"
            $fecha_fin    = date("Y-m-t", strtotime($fecha2));  // "2025-03-31"

            $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$idasientotipo'");
            $at = $asiento_tipo->fetch_assoc();

            $tipo_trans = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$at[tipo]'");
            $tt = $tipo_trans->fetch_assoc();

            $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$gestion'");
            $gc = $gestion_sel->fetch_assoc();

            if($gc['formato_transaccion'] == 'por_tipo_mes') {
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones
                WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                AND idgestion = '$gestion'
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND idgestion = '$gestion'
                    AND organizacion_idorganizacion = '$ide'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$ide'
                    AND idgestion = '$gestion'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            }
        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

         if($fecha2 >= $resultado122['fechatransaccion']){// REGISTRO CON UN NUEVO ASIENTO (TRANSACCION) {{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}

        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '$fecha_transaccion', '1', '0', '$glosa2', '1','1', '$tipotransaccion', '$ide', '$sucursal', '$gestion')");
    
        // Obtener el ID del registro recién insertado
        $idtrans = $this->dbc->insert_id;
            //$detallepago

            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$idasientotipo'");
            $orden = 1;
            $id_cuenta = '0';
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $monto_total * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $monto_total * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta'];
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                // $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal) VALUES ('$debe', '$haber', '$nota', '$idtrans', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal')");
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)VALUES('$debe','$haber','$nota','$idtrans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");
                
                if($cuenta == $pcuenta){ // se igualan los ids de plan de cuentas
                    $id_cuenta = $this->dbc->insert_id;
                }else{
                    // $id_cuenta = '0';
                }

                $orden = $orden + 1;
            }
        }else{
            $bandera = FALSE;
        }
        }else {
            $idtrans = $idtransaccion;
            $id_cuenta = $cuenta;
        }

        //-----------------------------------------------------------------------------------------------------------

       
        $aux_cont = 0;
        if($idtrans == ""){
            // NO PASARA NADA 
        }else{
            foreach($facturas as $factura){

                if($id_cuenta == ""){
                $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)VALUES('$factura[idfactura]','$idtrans','0','contado_venta_comercial','$ide')");

                }else{ // SE ASIGNARA CUENTA MAS

                $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)VALUES('$factura[idfactura]','$idtrans','$id_cuenta','contado_venta_comercial','$ide')");
                
                $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$id_cuenta'");
                        $dt = $detalle_trans->fetch_assoc(); 

                if($tipo_cuenta == 'suma'){ // SUMAR
                            
                            if($dt['debe'] > 0){
                                $nuevo_monto_dt = $dt['debe'] + $monto_total;
                                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$id_cuenta'");
                            }else{
                                $nuevo_monto_dt = $dt['haber'] + $monto_total;
                                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$id_cuenta'");
                            }
                    }elseif($tipo_cuenta == 'reemplazo'){ // REEMPLAZAR
                            if($dt['debe'] > 0){
                                $nuevo_monto_dt = $monto_total;
                                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$id_cuenta'");
                            }else{
                                $nuevo_monto_dt = $monto_total;
                                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$id_cuenta'");
                            }
                    }else{ // SOLO VINCULA NO PASA NADA

                    }
                }

            }
        }

        if($idcaja_bancos != ''){
            foreach ($facturas as $factura) {

                // Obtener el último correlativo para esa empresa y registro_desde
                $sql = "SELECT COUNT(*) as total 
                        FROM comprobantes_comercial_caja_bancos 
                        WHERE idempresa = '$ide' 
                        AND registro_desde = '$registro_desde'";
                        
                $result = $this->dbc->query($sql);
                $row = $result->fetch_assoc();

                $nuevo_correlativo = $row['total'] + 1;
                // $nuevo_correlativo = ($row['ultimo'] !== null) ? $row['ultimo'] + 1 : 1;

                // Insertar el nuevo registro con el correlativo calculado
                $registroComprobante_comercial = $this->dbc->query("INSERT INTO comprobantes_comercial_caja_bancos(
                    vinculado_desde, fecha, lugar, cliente_proveedor, id_documento, nro_documento, nro_comprobante, registro_desde, concepto, idcaja_bancos, monto, ingreso_egreso, estado, idempresa
                ) VALUES (
                    'CONTABILIDAD',
                    '{$factura['fecha']}',
                    '{$factura['almacen']}',
                    '{$factura['cliente_proveedor']}',
                    '{$factura['idfactura']}',
                    '{$factura['nro_documento']}',
                    '$nuevo_correlativo',
                    '$registro_desde',
                    '$registro_desde',
                    '$idcaja_bancos',
                    '{$factura['monto']}',
                    'ingreso',
                    '{$factura['estado']}',
                    '$ide'
                )");
            }
        }else{
            // NO SE VINCULARA A CAJA BANCOS
        }

        // if(empty($caja_bancos)){
        //     //EL ARREGLO CAJA_BANCOS ESTA VACIO
        // }else{

        //     foreach($caja_bancos as $cajaBanco){

        //     $registropago3 = $this->dbc->query("INSERT INTO detalle_caja_bancos_cobrar(idcaja_bancos,monto,idcuentaspof,idfactura)
        //     VALUES('$cajaBanco[id]','$cajaBanco[monto]','$idcuentaspof','$cajaBanco[idfactura]')");
             
        //     }
        // }
       
        if ($bandera === TRUE) {
            $res = array("success", "Registro Realizado", "registrocobrarfacturaGrupal",$fecha_transaccion,$fecha2,$resultado122['fechatransaccion']);
        } else {
            $res = array("danger", "La fecha de registro es menor al ultimo registro de la transaccion que existe: ".date("d/m/Y", strtotime($resultado122['fechatransaccion'])));

        }

        echo json_encode($res);
    }

      public function listar_factura_comercial_con_transaccion($idmd5) // ESTA API TAMBIEN SERA PARA LISTAR DENTRO DE TRANSACCIONES LA 3ERA OPCION DE FACTURAS COMERCIAL
    {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $idempresa = $this->getidempresa($idmd5);
        $lista = [];

        $listaFactura = [];
        $trans_fact = $this->dbc->query("SELECT id_documento FROM transaccion_documentos_comercial WHERE idempresa = '$idempresa' AND registro_desde ='contado_venta_comercial'");
        while ($zxc = $this->dbc->fetch($trans_fact)) {
            // $listaFactura = $zxc['idfactura_comercial'];
            array_push($listaFactura,$zxc['id_documento']);
        }

        $facturas = implode(", ", $listaFactura);

        if (!empty($facturas)) {
            $clien = $this->dbcm->query("SELECT 
    v.id_venta, 
    MAX(a.nombre) AS nombre_almacen, 
    v.fecha_venta, 
    MAX(c.nombre) AS nombre_cliente, 
    MAX(c.nombrecomercial) AS nombre_comercial, 
    MAX(c.ciudad) AS ciudad, 
    v.tipo_venta, 
    v.tipo_pago, 
    v.monto_total, 
    v.nfactura, 
    v.descuento, 
    MAX(pa.almacen_id_almacen) AS almacen_id, 
    v.cliente_id_cliente1, 
    MAX(s.nombre) AS nombre_sucursal, 
    v.estado, 
    MAX(ca.canal) AS canal_venta, 
    MAX(vf.cuf) AS cuf, 
    MAX(vf.fechaEmission) AS fecha_emision, 
    MAX(vf.shortLink) AS enlace_corto, 
    MAX(vf.urlSin) AS url_sin, 
    MAX(ec.estado) AS estado_cobro, 
    MAX(ec.saldo) AS saldo
FROM venta v  
    LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
    LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta 
    LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal 
    LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
    LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen 
    LEFT JOIN canalventa ca ON v.idcanal = ca.idcanalventa 
    LEFT JOIN ventas_facturadas vf ON v.id_venta = vf.venta_id_venta 
    LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta 
WHERE v.id_venta IN ($facturas) 
GROUP BY v.id_venta 
ORDER BY v.fecha_venta DESC, v.id_venta DESC;
");
        }else{
            $clien = $this->dbcm->query("SELECT 
    v.id_venta, 
    MAX(a.nombre) AS nombre_almacen, 
    v.fecha_venta, 
    MAX(c.nombre) AS nombre_cliente, 
    MAX(c.nombrecomercial) AS nombre_comercial, 
    MAX(c.ciudad) AS ciudad, 
    v.tipo_venta, 
    v.tipo_pago, 
    v.monto_total, 
    v.nfactura, 
    v.descuento, 
    MAX(pa.almacen_id_almacen) AS almacen_id, 
    v.cliente_id_cliente1, 
    MAX(s.nombre) AS nombre_sucursal, 
    v.estado, 
    MAX(ca.canal) AS canal_venta, 
    MAX(vf.cuf) AS cuf, 
    MAX(vf.fechaEmission) AS fecha_emision, 
    MAX(vf.shortLink) AS enlace_corto, 
    MAX(vf.urlSin) AS url_sin, 
    MAX(ec.estado) AS estado_cobro, 
    MAX(ec.saldo) AS saldo
FROM venta v  
    LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
    LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta 
    LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal 
    LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
    LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen 
    LEFT JOIN canalventa ca ON v.idcanal = ca.idcanalventa 
    LEFT JOIN ventas_facturadas vf ON v.id_venta = vf.venta_id_venta 
    LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta 
 WHERE v.id_venta IN (NULL)
GROUP BY v.id_venta 
ORDER BY v.fecha_venta DESC, v.id_venta DESC;
");
        }

 $i = 0;
        while ($qwe = $this->dbcm->fetch($clien)) {
 
            $trans_fact_aux = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE id_documento = '$qwe[0]' AND registro_desde ='contado_venta_comercial'");

            $trans_id = $trans_fact_aux->fetch_assoc();

            $transaccion = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$trans_id[idtransaccion]'");
            $trans_codigo = $transaccion->fetch_assoc();

            $get_caja_bancos_comprobante = $this->dbc->query("SELECT * FROM comprobantes_comercial_caja_bancos WHERE id_documento = '$qwe[0]' 
            AND registro_desde ='contado_venta_comercial'");

            if($get_caja_bancos_comprobante->num_rows > 0){ // SI TIENE CAJA BANCO ESTA FACTURA
                $cb_comprob = $get_caja_bancos_comprobante->fetch_assoc();

                $caja_banco = $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$cb_comprob[idcaja_bancos]'");
                $cb = $caja_banco->fetch_assoc();

                $nombre_caja_banco = $cb['tipo_cuenta'];
            }else{ // NO TIENE CAJA BANCO ESTA FACTURA
                $nombre_caja_banco = "";
            }
            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5],
             "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11],
              "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17],
               "shortlink" => $qwe[18], "urlsin" => $qwe[19],"estado_cobro" => $qwe[20],"saldo" => $qwe[21],"idtransaccion" => $trans_codigo['idtransacciones'],
               "codigotransaccion" => $trans_codigo['codigotransaccion'],"caja_banco" => $nombre_caja_banco);
            array_push($lista, $res);
            $i++;
        }
        echo json_encode($lista);
    }

     public function listar_factura_comercial_con_caja_bancos($idmd5) 
    {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $idempresa = $this->getidempresa($idmd5);
        $lista = [];

        $listaFactura = [];
        $fact_cajas = $this->dbc->query("SELECT id_documento FROM comprobantes_comercial_caja_bancos WHERE idempresa = '$idempresa' 
        AND registro_desde = 'contado_venta_comercial' AND vinculado_desde ='CONTABILIDAD'");
        while ($zxc = $this->dbc->fetch($fact_cajas)) {
            // $listaFactura = $zxc['idfactura_comercial'];
            array_push($listaFactura,$zxc['id_documento']);
        }

        $facturas = implode(", ", $listaFactura);

        if (!empty($facturas)) {
            $clien = $this->dbcm->query("SELECT 
            v.id_venta, 
            MAX(a.nombre) AS nombre_almacen, 
            v.fecha_venta, 
            MAX(c.nombre) AS nombre_cliente, 
            MAX(c.nombrecomercial) AS nombre_comercial, 
            MAX(c.ciudad) AS ciudad, 
            v.tipo_venta, 
            v.tipo_pago, 
            v.monto_total, 
            v.nfactura, 
            v.descuento, 
            MAX(pa.almacen_id_almacen) AS almacen_id, 
            v.cliente_id_cliente1, 
            MAX(s.nombre) AS nombre_sucursal, 
            v.estado, 
            MAX(ca.canal) AS canal_venta, 
            MAX(vf.cuf) AS cuf, 
            MAX(vf.fechaEmission) AS fecha_emision, 
            MAX(vf.shortLink) AS enlace_corto, 
            MAX(vf.urlSin) AS url_sin, 
            MAX(ec.estado) AS estado_cobro, 
            MAX(ec.saldo) AS saldo
        FROM venta v  
            LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta 
            LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal 
            LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
            LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen 
            LEFT JOIN canalventa ca ON v.idcanal = ca.idcanalventa 
            LEFT JOIN ventas_facturadas vf ON v.id_venta = vf.venta_id_venta 
            LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta 
        WHERE v.id_venta IN ($facturas) 
        GROUP BY v.id_venta 
        ORDER BY v.fecha_venta DESC, v.id_venta DESC;
        ");
                }else{
                    $clien = $this->dbcm->query("SELECT 
            v.id_venta, 
            MAX(a.nombre) AS nombre_almacen, 
            v.fecha_venta, 
            MAX(c.nombre) AS nombre_cliente, 
            MAX(c.nombrecomercial) AS nombre_comercial, 
            MAX(c.ciudad) AS ciudad, 
            v.tipo_venta, 
            v.tipo_pago, 
            v.monto_total, 
            v.nfactura, 
            v.descuento, 
            MAX(pa.almacen_id_almacen) AS almacen_id, 
            v.cliente_id_cliente1, 
            MAX(s.nombre) AS nombre_sucursal, 
            v.estado, 
            MAX(ca.canal) AS canal_venta, 
            MAX(vf.cuf) AS cuf, 
            MAX(vf.fechaEmission) AS fecha_emision, 
            MAX(vf.shortLink) AS enlace_corto, 
            MAX(vf.urlSin) AS url_sin, 
            MAX(ec.estado) AS estado_cobro, 
            MAX(ec.saldo) AS saldo
        FROM venta v  
            LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta 
            LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal 
            LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
            LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen 
            LEFT JOIN canalventa ca ON v.idcanal = ca.idcanalventa 
            LEFT JOIN ventas_facturadas vf ON v.id_venta = vf.venta_id_venta 
            LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta 
        WHERE v.id_venta IN (NULL)
        GROUP BY v.id_venta 
        ORDER BY v.fecha_venta DESC, v.id_venta DESC;
        ");
                }

        $i = 0;
        while ($qwe = $this->dbcm->fetch($clien)) {
                
            $trans_fact_aux = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE id_documento = '$qwe[0]' AND registro_desde ='contado_venta_comercial'");

            $get_caja_bancos_comprobante = $this->dbc->query("SELECT * FROM comprobantes_comercial_caja_bancos WHERE id_documento = '$qwe[0]' AND registro_desde ='contado_venta_comercial'");
            $cb_comprob = $get_caja_bancos_comprobante->fetch_assoc();
            
            $caja_banco = $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$cb_comprob[idcaja_bancos]'");
            $cb = $caja_banco->fetch_assoc();

            if($trans_fact_aux->num_rows > 0){ // SI TIENE TRANSACCION ESTA FACTURA
                $trans_id = $trans_fact_aux->fetch_assoc();
                $transaccion = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$trans_id[idtransaccion]'");
                $trans_codigo = $transaccion->fetch_assoc();

                $nombre_codigo = $trans_codigo['codigotransaccion'];

            }else{ // NO TIENE TRANSACCION ESTA FACTURA
                $nombre_codigo = "";
            }
            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5], 
            "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11],
             "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17],
              "shortlink" => $qwe[18], "urlsin" => $qwe[19],"estado_cobro" => $qwe[20],"saldo" => $qwe[21],
              "codigotransaccion" => $nombre_codigo,"idcaja_bancos" => $cb['idcaja_bancos'],"caja_banco" => $cb['tipo_cuenta'],
              "idcomprobantes_comercial_caja_bancos" => $cb_comprob['idcomprobantes_comercial_caja_bancos']);
            array_push($lista, $res);
            $i++;
        }
        echo json_encode($lista);
    }

    public function listafactura_cobro_trans_comercial($idtransaccion) // VENTAS
    {
        $lista = [];
        $res = "";
        $listaFactura = [];
        // lista pagados y pagar clientes proveedor
        $facture = $this->dbc->query("SELECT *
        FROM transaccion_documentos_comercial WHERE idtransaccion='$idtransaccion' AND registro_desde ='contado_venta_comercial'");
        // while ($qwe = $this->dbc->fetch($facture)) {
            // if ($qwe['clasefactura'] == 2) {
            //     $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe[18] . "'");
            //     $asd = $this->dbcm->fetch($cliente);
            //     $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit'],"por_concepto_de" => $qwe['por_concepto_de'],"registro_desde" => $qwe['registro_desde']);
            // } else {
            //     $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
            //     $asd = $this->dbcm->fetch($proveedor);
            //     $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit'],"por_concepto_de" => $qwe['por_concepto_de'],"registro_desde" => $qwe['registro_desde']);
            // }
            if($facture->num_rows > 0){
                while ($zxc = $this->dbc->fetch($facture)) {
            // $listaFactura = $zxc['idfactura_comercial'];
            array_push($listaFactura,$zxc['id_documento']);
        }

        $facturas = implode(", ", $listaFactura);

            $clien = $this->dbcm->query("SELECT 
                v.id_venta, 
                MAX(a.nombre) AS nombre_almacen, 
                v.fecha_venta, 
                MAX(c.nombre) AS nombre_cliente, 
                MAX(c.nombrecomercial) AS nombre_comercial, 
                MAX(c.ciudad) AS ciudad, 
                v.tipo_venta, 
                v.tipo_pago, 
                v.monto_total, 
                v.nfactura, 
                v.descuento, 
                MAX(pa.almacen_id_almacen) AS almacen_id, 
                v.cliente_id_cliente1, 
                MAX(s.nombre) AS nombre_sucursal, 
                v.estado, 
                MAX(ca.canal) AS canal_venta, 
                MAX(vf.cuf) AS cuf, 
                MAX(vf.fechaEmission) AS fecha_emision, 
                MAX(vf.shortLink) AS enlace_corto, 
                MAX(vf.urlSin) AS url_sin, 
                MAX(ec.estado) AS estado_cobro, 
                MAX(ec.saldo) AS saldo
            FROM venta v  
                LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta 
                LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal 
                LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
                LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen 
                LEFT JOIN canalventa ca ON v.idcanal = ca.idcanalventa 
                LEFT JOIN ventas_facturadas vf ON v.id_venta = vf.venta_id_venta 
                LEFT JOIN estado_cobro ec ON ec.venta_id_venta = v.id_venta 
            WHERE v.id_venta IN ($facturas) 
            GROUP BY v.id_venta 
            ORDER BY v.fecha_venta DESC, v.id_venta DESC;
            ");
            
            $i = 0;
        while ($qwe = $this->dbcm->fetch($clien)) {
                    
            
            $trans_fact_aux = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE id_documento = '$qwe[0]' AND registro_desde ='contado_venta_comercial'");

            $trans_id = $trans_fact_aux->fetch_assoc();

            $transaccion = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$trans_id[idtransaccion]'");
            $trans_codigo = $transaccion->fetch_assoc();

            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5], "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11], "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17], "shortlink" => $qwe[18], "urlsin" => $qwe[19],"estado_cobro" => $qwe[20],"saldo" => $qwe[21],"codigotransaccion" => $trans_codigo['codigotransaccion']);
            array_push($lista, $res);
            $i++;
        }
        
            }else{
                // RETORNARA VACIO
            }
            

        echo json_encode($lista);
    }
    public function asignar_facturas_comercial_A_cuentas($data) {
    
        $idempresa = $this->getidempresa($data['empresa']);
        // Decodificar el JSON a array asociativo 
        $facturas = json_decode($data['facturas_comercial'], true);
        // $gestion = $this->getgestionactualid($idempresa);
        $montoFacturas = 0;

        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
        $dt = $detalle_trans->fetch_assoc();
        $array_ids = [];
        
        foreach ($facturas as $factura) {

                $montoFacturas += $factura['monto'];
                
            }
                    
        if($data['sumar_reemplazar'] == 'suma'){ // SUMAR
            if($dt['debe'] > 0){
                $nuevo_monto_dt = $dt['debe'] + $montoFacturas;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $dt['haber'] + $montoFacturas;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }elseif($data['sumar_reemplazar'] == 'reemplazo'){ // REEMPLAZAR

        // desvincular todos los documentos de esta cuenta
            $desv_recibo = $this->dbc->query("UPDATE recibo SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_factura = $this->dbc->query("UPDATE factura SET cuenta = '0',transacciones_idtransacciones = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_cobr = $this->dbc->query("UPDATE cuentaspof SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_pag = $this->dbc->query("UPDATE cuentaspor SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comer = $this->dbc->query("DELETE FROM transaccion_documentos_comercial WHERE cuenta = '$data[cuenta]'");

        // Convertimos el array en una lista separada por comas 

            if($dt['debe'] > 0){
                $nuevo_monto_dt = $montoFacturas;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $montoFacturas;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }else{ // SOLO VINCULARA NADA MAS
            $editar_dt = TRUE;
        }
   
        foreach ($facturas as $factura) {

                // $montoFacturas += $factura['monto'];
                $existe_fact_comercial = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE id_documento = '$factura[idfactura_comercial]' AND registro_desde ='contado_venta_comercial'");
                if($existe_fact_comercial->num_rows > 0){
                    $updatetranscodigo = $this->dbc->query("UPDATE transaccion_documentos_comercial SET cuenta = '$data[cuenta]',idtransaccion = '$dt[transacciones_idtransacciones]'  
                    WHERE id_documento = '{$factura['idfactura_comercial']}' AND registro_desde ='contado_venta_comercial'");

                }else{ // NO EXISTE EN LA TABLA ESA FACTURA
                    $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                    VALUES('$factura[idfactura_comercial]','$dt[transacciones_idtransacciones]','$data[cuenta]','contado_venta_comercial','$idempresa')");

                }   
                // Guardamos el idfactura_comercial en el array 
                // $array_ids[] = $factura['idfactura_comercial'];
                
        }

        // Respuesta
        if ($editar_dt === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['cuenta'],$dt['transacciones_idtransacciones'],$nuevo_monto_dt,$montoFacturas,$idempresa,$data['idempresa'],gethostname());
        } else {
            $res = array("danger", "Lo sient00o hubo un problema, por favor vuelva a intentar más tarde",$data['facturas_comercial'],$data['cuenta'],$nuevo_monto_dt);
        }
    
        echo json_encode($res);
    }

    // public function registrar_comprobantes_caja_bancos_comercial($data){
    //     // $idempresa = Empresa::getidempresa($empresa);
    //     $idempresa = $this->getidempresa($data['empresa']);

    //     // nro comprobante y nro de documento yo lo pongo por defecto
    //         // Insertar el nuevo registro
    //         $registroProveedor = $this->dbc->query("INSERT INTO comprobantes_comercial_caja_bancos(lugar,cliente_proveedor,id_documento,nro_documento,nro_comprobante,registro_desde,concepto,idcaja_bancos,monto,estado,idempresa) 
    //         VALUES ('$data[lugar]','$data[cliente_proveedor]','$data[id_documento]','$data[nro_documento]','correlativo','$data[registro_desde]','$data[concepto]','$data[idcaja_bancos]','$data[monto]','$data[estado]','$idempresa')");
    //         if ($registroProveedor === TRUE) {                                                                                                                                                                
    //             $res = array("success", "Registro exitoso","registroCaracteristicas");
    //         } else {
    //             $res = array("danger", "No se pudo registrar");
    //         }
        
    //     echo json_encode($res);
        
    // }

    public function vincular_cobros_comercial_caja_bancos($data){

        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($data['empresa']);

        foreach ($data['cobros'] as $cobro) {

            // Obtener el último correlativo para esa empresa y registro_desde
            $sql = "SELECT COUNT(*) as total 
            FROM comprobantes_comercial_caja_bancos 
            WHERE idempresa = '$idempresa' 
            AND registro_desde = '$data[registro_desde]'";
            
            $result = $this->dbc->query($sql);
            $row = $result->fetch_assoc();

            $nuevo_correlativo = $row['total'] + 1;
            // $nuevo_correlativo = ($row['ultimo'] !== null) ? $row['ultimo'] + 1 : 1;

            // Insertar el nuevo registro con el correlativo calculado
            $registroComprobante_comercial = $this->dbc->query("INSERT INTO comprobantes_comercial_caja_bancos(
                vinculado_desde, fecha, lugar, cliente_proveedor, id_documento, nro_documento, nro_comprobante, registro_desde, concepto, idcaja_bancos, monto, ingreso_egreso, estado, idempresa
            ) VALUES (
                'CONTABILIDAD',
                '{$cobro['fecha']}',
                '{$cobro['almacen']}',
                '{$cobro['cliente_proveedor']}',
                '{$cobro['id_documento']}',
                '{$cobro['nro_documento']}',
                '$nuevo_correlativo',
                '{$data['registro_desde']}',
                '{$data['concepto']}',
                '{$data['idcaja_bancos']}',
                '{$cobro['monto']}',
                'ingreso',
                '{$cobro['estado']}',
                '$idempresa'
            )");
        }

        if ($registroComprobante_comercial === TRUE) {
            $res = array("success", "Registro exitoso", "registar_vinculacion");
        } else {
            $res = array("danger", "No se pudo registrar");
        }

        echo json_encode($res);
    }

    public function registrar_comprobantes_caja_bancos_comercial($data){ // ESTA API SE USARA PARA MERMAS,COMPRAS,VENTAS EN COMERCIAL ETC
        $idempresa = $this->getidempresa($data['empresa']);

        // Obtener el último correlativo para esa empresa y registro_desde
        $sql = "SELECT MAX(nro_comprobante) as ultimo 
                FROM comprobantes_comercial_caja_bancos 
                WHERE idempresa = '$idempresa' 
                AND registro_desde = '$data[registro_desde]'";
        $result = $this->dbc->query($sql);
        $row = $result->fetch_assoc();

        $nuevo_correlativo = ($row['ultimo'] !== null) ? $row['ultimo'] + 1 : 1;

        // $fechaConHora = date("Y-m-d", strtotime($data['fecha'])) . " " . date("H:i:s");

        // Insertar el nuevo registro con el correlativo calculado
        $registroComprobante_comercial = $this->dbc->query("INSERT INTO comprobantes_comercial_caja_bancos(
            vinculado_desde,fecha, lugar, cliente_proveedor, id_documento, nro_documento, nro_comprobante, registro_desde, concepto, idcaja_bancos, monto, ingreso_egreso, estado, idempresa
        ) VALUES (
            'COMERCIAL',
            '{$data['fecha']}',
            '{$data['lugar']}',
            '{$data['cliente_proveedor']}',
            '{$data['id_documento']}',
            '{$data['nro_documento']}',
            '$nuevo_correlativo',
            '{$data['registro_desde']}',
            '{$data['concepto']}',
            '{$data['idcaja_bancos']}',
            '{$data['monto']}',
            '{$data['ingreso_egreso']}',
            '{$data['estado']}',
            '$idempresa'
        )");

        if ($registroComprobante_comercial === TRUE) {
            $res = array("success", "Registro exitoso", "registroCaracteristicas");
        } else {
            $res = array("danger", "No se pudo registrar");
        }

        echo json_encode($res);
        // echo json_encode(array($data));
        //  return "hola richard";
    }
    
    public function autorizacion_caja_bancos_comercial($data){
        // $idempresa = Empresa::getidempresa($empresa);

            // Insertar el nuevo registro
            $autorizar = $this->dbc->query("UPDATE comprobantes_comercial_caja_bancos SET estado = '$data[estado]', monto = '$data[monto]' WHERE id_documento = '$data[id_documento]' AND registro_desde ='$data[registro_desde]'");

            if ($autorizar === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
        
    }

    public function listar_cobros_comercial($empresa,$viv_mister_soft)
    {
         ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
       
//´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´
    if($viv_mister_soft == "vivasoft"){
        $url = "https://vivasoft.link/app/cmv1/api/listaCobrosContabilidad/".$empresa;
    }else{ // mistersofts
        $url = "https://mistersofts.com/app/cmv1/api/listaCobrosContabilidad/".$empresa;
    }
        
        $data = json_decode(file_get_contents($url), true);
        $lista_factura_venta = [];

        foreach($data as $plantilla){
            $comp_com = $this->dbc->query("SELECT * 
                                            FROM comprobantes_comercial_caja_bancos 
                                            WHERE id_documento = '{$plantilla['idDetalleCobro']}' AND registro_desde = 'cobro_comercial'");
            if($comp_com->num_rows > 0){
                // Ya existe, no lo agregamos
            } else {
                // Guardamos todo el registro, no solo el id
                $lista_factura_venta[] = $plantilla;
            }
        }

        $lista_final = array_merge($lista, $lista_factura_venta);
        
        echo json_encode($lista_final);
    }

    public function vincular_cajaBanco_de_facturas_comercial_desde_conta($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL); INSERT
        $idempresa = $this->getidempresa($data['empresa']);

            foreach ($data['facturas_comercial'] as $factura) {

                // $montoFacturas += $factura['monto']; idcomprobantes_comercial_caja_bancos
                // $update_cajaBanco = $this->dbc->query("UPDATE comprobantes_comercial_caja_bancos SET idcaja_bancos ='$factura[idcaja_bancos]' 
                // WHERE idcomprobantes_comercial_caja_bancos = '{$factura['idcomprobantes_comercial_caja_bancos']}'");
        
                // Obtener el último correlativo para esa empresa y registro_desde
                $sql = "SELECT MAX(nro_comprobante) as ultimo 
                        FROM comprobantes_comercial_caja_bancos 
                        WHERE idempresa = '$idempresa' 
                        AND registro_desde = '$factura[registro_desde]'";
                $result = $this->dbc->query($sql);
                $row = $result->fetch_assoc();

                $nuevo_correlativo = ($row['ultimo'] !== null) ? $row['ultimo'] + 1 : 1;

            $registroComprobante_comercial = $this->dbc->query("INSERT INTO comprobantes_comercial_caja_bancos(
            vinculado_desde,fecha, lugar, cliente_proveedor, id_documento, nro_documento, nro_comprobante, registro_desde, concepto, idcaja_bancos, monto, ingreso_egreso, estado, idempresa
        ) VALUES (
            'CONTABILIDAD',
            '{$factura['fecha']}',
            '{$factura['lugar']}',
            '{$factura['cliente_proveedor']}',
            '{$factura['id_documento']}',
            '{$factura['nro_documento']}',
            '$nuevo_correlativo',
            '{$data['registro_desde']}', 
            '{$data['concepto']}',    
            '{$data['idcaja_bancos']}', 
            '{$factura['monto']}',
            '{$data['ingreso_egreso']}', 
            '{$factura['estado']}',
            '$idempresa'
        )");
            }
   
        // Respuesta
        if ($registroComprobante_comercial === TRUE) {
            $res = array("success", "Edicion exitosa", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }

    public function cambiar_cajaBanco_de_facturas_comercial_desde_conta($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

            foreach ($data['facturas_comercial'] as $factura) {

                // $montoFacturas += $factura['monto']; idcomprobantes_comercial_caja_bancos
                $update_cajaBanco = $this->dbc->query("UPDATE comprobantes_comercial_caja_bancos SET idcaja_bancos ='$factura[idcaja_bancos]' 
                WHERE idcomprobantes_comercial_caja_bancos = '{$factura['idcomprobantes_comercial_caja_bancos']}'");
        
            }
   
        // Respuesta
        if ($update_cajaBanco === TRUE) {
            $res = array("success", "Edicion exitosa", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
    public function anular_caja_bancos_comercial($data){
        // $idempresa = Empresa::getidempresa($empresa);

            // Insertar el nuevo registro
            $autorizar = $this->dbc->query("UPDATE comprobantes_comercial_caja_bancos SET estado = '$data[estado]'
            WHERE id_documento = '$data[id_documento]' AND registro_desde ='$data[registro_desde]'");

            if ($autorizar === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
        
    }

    public function listar_cobros_comercial_sin_cuenta($viv_mister_soft,$idcuenta,$empresa)
    {
        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        // $registro = $this->dbc->query("SELECT * FROM factura WHERE cuenta = '$idcuenta' LIMIT 1");
        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion ='$idcuenta'");
        $dt = $this->dbc->fetch($detalle_trans);

        // COBROS DE COMERCIAL SIN CUENTA Y QUE ESE COBRO NO ESTE VINCULADO A NINGUNA TRANSACCION 
        // O SISQUE ESTA VINCULADO A LA TRANSACCION DONDE QUEREMOS LISTAR, MOSTRARLOOOO
        $cobros_comercial_sin_cuenta = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial 
        WHERE idempresa ='$idempresa' AND cuenta ='0' AND registro_desde ='cobro_venta_comercial'
        AND idtransaccion IN(0,$dt[transacciones_idtransacciones])");

        if($cobros_comercial_sin_cuenta->num_rows > 0){
            // INCLUIRA ESE COBRO EN EL LISTADO PORQUE ESE COBRO PERTENECE A LA TRANSACCION PERO NO PERTENECE A NINGUNA CUENTA
            while ($qwe = $this->dbc->fetch($cobros_comercial_sin_cuenta)) {
        
                    $dt_cobro = $this->dbcm->query("SELECT * FROM detalle_cobro WHERE iddetalle_cobro='" . $qwe['id_documento'] . "'");
                    $dtc = $this->dbcm->fetch($dt_cobro);

                    $estado_cobro = $this->dbcm->query("SELECT * FROM estado_cobro WHERE id_estado_cobro='" . $dtc['estado_cobro_id_estado_cobro'] . "'");
                    $ec = $this->dbcm->fetch($estado_cobro);

                    $venta = $this->dbcm->query("SELECT * FROM venta WHERE id_venta='" . $ec['venta_id_venta'] . "'");
                    $vt = $this->dbcm->fetch($venta);

                    $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $vt['cliente_id_cliente1'] . "'");
                    $cl = $this->dbcm->fetch($cliente);

                    $res = array("idDetalleCobro" => $dtc['iddetalle_cobro'], "fechaCobro" => $dtc['fecha_actual'], "num_documento" => $dtc['num_documento'], "monto" => $dtc['monto'],
                    "nfactura" => $vt['nfactura'],"fechaVenta" => $vt['fecha_venta'],"cliente" => $cl['nombre']);
        
                    array_push($lista, $res);
            }
        }
    
//´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´

    if($viv_mister_soft == "vivasoft"){
        $url = "https://vivasoft.link/app/cmv1/api/listaCobrosContabilidad/".$empresa;
    }else{ // mistersofts
        $url = "https://mistersofts.com/app/cmv1/api/listaCobrosContabilidad/".$empresa;
    }
        

        // $url = "https://mistersofts.com/app/cmv1/api/listaVentas/".$empresa;
        $data = json_decode(file_get_contents($url), true);
        $lista_cobro_venta = [];

        foreach($data as $plantilla){
            $trans_fact = $this->dbc->query("SELECT id_documento 
                                            FROM transaccion_documentos_comercial 
                                            WHERE id_documento = '{$plantilla['idDetalleCobro']}' AND registro_desde ='cobro_venta_comercial'");
            if($trans_fact->num_rows > 0){
                // Ya existe, no lo agregamos
            } else {
                // Guardamos todo el registro, no solo el id
                $lista_cobro_venta[] = $plantilla;
            }
        }

        $lista_final = array_merge($lista, $lista_cobro_venta);
        
        echo json_encode($lista_final);
    }

     public function asignar_cobros_comercial_A_cuentas($data) {
    
        $idempresa = $this->getidempresa($data['empresa']);
        // Decodificar el JSON a array asociativo 
        $cobros = json_decode($data['cobros_comercial'], true);
        // $gestion = $this->getgestionactualid($idempresa);
        $montoCobros = 0;

        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
        $dt = $detalle_trans->fetch_assoc();
        $array_ids = [];
        
        foreach ($cobros as $cobro) {
                $montoCobros += $cobro['monto'];
            }
                    
        if($data['sumar_reemplazar'] == 'suma'){ // SUMAR
            if($dt['debe'] > 0){
                $nuevo_monto_dt = $dt['debe'] + $montoCobros;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $dt['haber'] + $montoCobros;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }elseif($data['sumar_reemplazar'] == 'reemplazo'){ // REEMPLAZAR

        // desvincular todos los documentos de esta cuenta
            $desv_recibo = $this->dbc->query("UPDATE recibo SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_factura = $this->dbc->query("UPDATE factura SET cuenta = '0',transacciones_idtransacciones = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_cobr = $this->dbc->query("UPDATE cuentaspof SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_pag = $this->dbc->query("UPDATE cuentaspor SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comer = $this->dbc->query("DELETE FROM transaccion_documentos_comercial WHERE cuenta = '$data[cuenta]'");

        // Convertimos el array en una lista separada por comas 

            if($dt['debe'] > 0){
                $nuevo_monto_dt = $montoCobros;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $montoCobros;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }else{ // SOLO VINCULARA NADA MAS
            $editar_dt = TRUE;
        }
   
        foreach ($cobros as $cobro) {

                // $montoFacturas += $factura['monto'];
                $existe_fact_comercial = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE id_documento = '$cobro[id_documento]'");
                if($existe_fact_comercial->num_rows > 0){
                    $updatetranscodigo = $this->dbc->query("UPDATE transaccion_documentos_comercial SET cuenta = '$data[cuenta]',idtransaccion = '$dt[transacciones_idtransacciones]'  
                    WHERE id_documento = '{$cobro['id_documento']}'");

                }else{ // NO EXISTE EN LA TABLA ESA FACTURA
                    $registrar_fact_trans = $this->dbc->query("INSERT INTO transaccion_documentos_comercial(id_documento,idtransaccion,cuenta,registro_desde,idempresa)
                    VALUES('$cobro[id_documento]','$dt[transacciones_idtransacciones]','$data[cuenta]','cobro_venta_comercial','$idempresa')");

                }   
                // Guardamos el idfactura_comercial en el array 
                // $array_ids[] = $factura['idfactura_comercial']; 
                
        }

        // Respuesta
        if ($editar_dt === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['cuenta'],$dt['transacciones_idtransacciones'],$nuevo_monto_dt,$montoCobros,$idempresa,$data['idempresa'],gethostname());
        } else {
            $res = array("danger", "Lo sient00o hubo un problema, por favor vuelva a intentar más tarde",$data['facturas_comercial'],$data['cuenta'],$nuevo_monto_dt);
        }
    
        echo json_encode($res);
    }
}
