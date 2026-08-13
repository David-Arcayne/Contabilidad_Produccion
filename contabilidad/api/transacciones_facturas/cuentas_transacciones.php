<?php
// session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Cuentas_transacciones extends DB{
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

    public function getgestionactualC($empresa)
    {
        $orga = $this->getidempresa($empresa); // recibe md5 de la id insert
        $res = "";
        $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
        $qwe = $this->dbc->fetch($registro);

        // Retorna un array asociativo con la información
        return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
    }
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']);
        return $qwe['idgestion'];
    }

    public function listar_facturas_asignado_cuentas($idcuenta)
    {
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM factura WHERE cuenta = '$idcuenta'");
        while ($qwe = $this->dbc->fetch($registro)) {
               if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            } else {
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe['idfactura'], "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            }
                    array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listar_recibos_asignado_cuentas($idcuenta)
    {
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM recibo WHERE cuenta = '$idcuenta'");
        while ($qwe = $this->dbc->fetch($registro)) {
               if ($qwe['cobrado'] != 0) {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe['idrecibo'], "fecha" => $qwe['fecha'], "nro_recibo" => $qwe['nro_recibo'], "monto" => $qwe['monto'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"concepto" => $qwe['concepto'],"cliente_proveedor" => $asd['nombre']);
            } else {
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe['idrecibo'], "fecha" => $qwe['fecha'], "nro_recibo" => $qwe['nro_recibo'], "monto" => $qwe['monto'], "cobrado" => $qwe['cobrado'], "pagado" => $qwe['pagado'],"concepto" => $qwe['concepto'],"cliente_proveedor" => $asd['nombre']);
            }
                    array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listar_facturas_cobro_pago($idcuenta,$empresa)
    {
        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM factura WHERE cuenta = '$idcuenta' LIMIT 1");
        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion ='$idcuenta'");
        $dt = $this->dbc->fetch($detalle_trans);

        if($registro->num_rows > 0){ // YA EXISTEN FACTURAS  DENTRO DE LA CUENTA SELECCCIONADA
            $factu = $this->dbc->fetch($registro);
            //preguntar si factura es de pago y cobro
            if($factu['clasefactura'] == 2){
                // es cobro
                $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND clasefactura='2' AND cuenta ='0' AND transacciones_idtransacciones IN(0,$dt[transacciones_idtransacciones]) ORDER BY fecha DESC");

            }else{
                // es pago
                $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND clasefactura='1' AND cuenta ='0' AND transacciones_idtransacciones IN(0,$dt[transacciones_idtransacciones]) ORDER BY fecha DESC");
            }
        }else{ // NO EXISTEN FACTURAS DENTRO DE LA CUENTA SELECCIONADA

            //listara todas las facturas de cobro y pago porque no tiene ninguna factura todavia dentro
            $factu_clase = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion ='$idempresa' AND cuenta ='0' AND transacciones_idtransacciones IN(0,$dt[transacciones_idtransacciones]) ORDER BY fecha DESC");
        }
        while ($qwe = $this->dbc->fetch($factu_clase)) {
               if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe['idfactura'],"tipo_factura" => $qwe['tipo_factura'],"documento_cobro_pago" => 'factura_cobro', "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "tipo" => "venta","por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            } else {
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe['idfactura'],"tipo_factura" => $qwe['tipo_factura'],"documento_cobro_pago" => 'factura_pago', "fecha" => $qwe['fecha'], "nfactura" => $qwe['nfactura'], "montofactura" => $qwe['montofactura'], "clasefactura" => $qwe['clasefactura'], "tipo" => "compra","por_concepto_de" => $qwe['por_concepto_de'],"cliente_proveedor" => $asd['nombre']);
            }
                array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listar_recibos_cobro_pago($idcuenta,$empresa)
    {
        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM recibo WHERE cuenta = '$idcuenta' LIMIT 1");
        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion ='$idcuenta'");
        $dt = $this->dbc->fetch($detalle_trans);
        if($registro->num_rows > 0){
            $reci = $this->dbc->fetch($registro);
            //preguntar si recibo es de pago y cobro
            if($reci['cobrado'] != 0){
                // es cobro
                $recibo_clase = $this->dbc->query("SELECT * FROM recibo WHERE idempresa ='$idempresa' AND cobrado != '0' AND cuenta ='0' AND transaccion IN(0,$dt[transacciones_idtransacciones]) ORDER BY fecha DESC");

            }else{
                // es pago
                $recibo_clase = $this->dbc->query("SELECT * FROM recibo WHERE idempresa ='$idempresa' AND pagado != '0' AND cuenta ='0' AND transaccion IN(0,$dt[transacciones_idtransacciones]) ORDER BY fecha DESC");
            }
        }else{
            //listara todas las facturas de cobro y pago porque no tiene ninguna factura todavia dentro
            $recibo_clase = $this->dbc->query("SELECT * FROM recibo WHERE idempresa ='$idempresa' AND cuenta ='0' AND transaccion IN(0,$dt[transacciones_idtransacciones]) ORDER BY fecha DESC");
        }
        while ($qwe = $this->dbc->fetch($recibo_clase)) {
               if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe['idrecibo'], "fecha" => $qwe['fecha'], "nro_recibo" => $qwe['nro_recibo'], "monto" => $qwe['monto'], "tipo" => "venta","concepto" => $qwe['concepto'],"cliente_proveedor" => $asd['nombre']);
            } else {
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe['idrecibo'], "fecha" => $qwe['fecha'], "nro_recibo" => $qwe['nro_recibo'], "monto" => $qwe['monto'], "tipo" => "compra","concepto" => $qwe['concepto'],"cliente_proveedor" => $asd['nombre']);
            }
                    array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listar_comprobantes_cobro_pago($idcuenta,$empresa)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $comprobante_cobro = $this->dbc->query("SELECT * FROM cuentaspof WHERE cuenta = '$idcuenta'");
        $comprobante_pago = $this->dbc->query("SELECT * FROM cuentaspor WHERE cuenta = '$idcuenta'");

        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion ='$idcuenta'");
        if($detalle_trans->num_rows > 0){
            $dt = $this->dbc->fetch($detalle_trans); $array = [0, (int)$dt['transacciones_idtransacciones']]; 
        } else { 
            $array = [0]; 
        } 
        $array_buscar = implode(',', $array);

        if($comprobante_cobro->num_rows > 0){ // SOLO MOSTRAR COMPROBANTES DE COBRO
        
        //COBROS DE FACTURAS
        $cobros = $this->dbc->query("SELECT c.*,f.idorganizacion FROM cuentaspof c INNER JOIN factura f ON f.idfactura = c.idfactura
        WHERE c.cuenta ='0' AND c.idfactura != '0' AND f.idorganizacion ='$idempresa' AND c.transaccion IN($array_buscar) ORDER BY c.fecha DESC");
            while ($qwe = $this->dbc->fetch($cobros)) {
               
                $res = array("idcomprobante" => $qwe['idcuentaspof'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto'],"persona" => $qwe['persona'],"tipo" => "venta");   

                array_push($lista, $res);
            }
        
        
        }elseif($comprobante_pago->num_rows > 0){ // SOLO MOSTRAR COMPROBANTES DE PAGO

            //PAGOS DE FACTURAS
            $pagos = $this->dbc->query("SELECT c.*,f.idorganizacion FROM cuentaspor c INNER JOIN factura f ON f.idfactura = c.idfactura
            WHERE c.cuenta ='0' AND c.idfactura != '0' AND f.idorganizacion ='$idempresa' AND c.transaccion IN($array_buscar) ORDER BY c.fecha DESC");
            while ($qwe = $this->dbc->fetch($pagos)) {
               
                $res = array("idcomprobante" => $qwe['idcuentaspor'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto'],"persona" => $qwe['persona'],"tipo" => "compra");   

                array_push($lista, $res);
            }

        }else{ // NO TIENE NINGUN COBRO NI PAGO ESTA CUENTA, MOSTRAR TANTO COBROS Y PAGOS

            $cobros_pagos = $this->dbc->query("SELECT c.idcuentaspof AS idcomprobante, c.fecha, c.nrecibo, c.monto, c.persona, 'venta' AS tipo
            FROM cuentaspof c 
            INNER JOIN factura f ON f.idfactura = c.idfactura
            WHERE c.cuenta ='0' AND c.idfactura != '0' AND f.idorganizacion ='$idempresa' AND c.transaccion IN($array_buscar)

            UNION ALL
            
            SELECT c.idcuentaspor AS idcomprobante, c.fecha, c.nrecibo, c.monto, c.persona, 'compra' AS tipo
            FROM cuentaspor c 
            INNER JOIN factura f ON f.idfactura = c.idfactura
            WHERE c.cuenta ='0' AND c.idfactura != '0' AND f.idorganizacion ='$idempresa' AND c.transaccion IN($array_buscar)
            ORDER BY fecha DESC
        ");

        while ($cp = $this->dbc->fetch($cobros_pagos)) { 
               
                $res = array("idcomprobante" => $cp['idcomprobante'], "fecha" => $cp['fecha'], "nrecibo" => $cp['nrecibo'], "monto" => $cp['monto'],"persona" => $cp['persona'],"tipo" => $cp[5]);   
                         
                array_push($lista, $res);
            }
        }

        // if(){
        //     //COBROS DE FACTURAS
        //     $cobros = $this->dbc->query("SELECT c.*,f.idorganizacion FROM cuentaspof c INNER JOIN factura f ON f.idfactura = c.idfactura
        //     WHERE c.cuenta ='0' AND c.idfactura != '0' AND f.idorganizacion ='$idempresa' AND c.transaccion IN($array_buscar) ORDER BY c.fecha DESC");
        //     while ($qwe = $this->dbc->fetch($cobros)) {
               
        //         $res = array("idcomprobante" => $qwe['idcuentaspof'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto'],"persona" => $qwe['persona'],"tipo" => "venta");   

        //         array_push($lista, $res);
        //     }
        // }else{

        // }
        echo json_encode($lista);
    }

    public function listar_comprobantes_asignado_cuentas($idcuenta)
    {
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $comprobante_cobro = $this->dbc->query("SELECT * FROM cuentaspof WHERE cuenta = '$idcuenta'");
        $comprobante_pago = $this->dbc->query("SELECT * FROM cuentaspor WHERE cuenta = '$idcuenta'");
        // $comprobante_cobro_pago = $this->dbc->query("SELECT * FROM cuentaspof AS idcuenta WHERE cuenta = '$idcuenta'
        //                                             UNION
        //                                             SELECT * FROM cuentaspor AS idcuenta WHERE cuenta = '$idcuenta'
        //                                         ");

        if($comprobante_cobro->num_rows > 0){
            while ($qwe = $this->dbc->fetch($comprobante_cobro)) {
               
                $res = array("id" => $qwe['idcuentaspof'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto'],"lugar" => $qwe['lugar'],"persona" => $qwe['persona'],"ci" => $qwe['ci'],"tipo" => "cobro");   

                array_push($lista, $res);
            }
        }elseif($comprobante_pago->num_rows > 0){
            while ($qwe = $this->dbc->fetch($comprobante_pago)) {
               
                $res = array("id" => $qwe['idcuentaspor'], "fecha" => $qwe['fecha'], "nrecibo" => $qwe['nrecibo'], "monto" => $qwe['monto'],"lugar" => $qwe['lugar'],"persona" => $qwe['persona'],"ci" => $qwe['ci'],"tipo" => "pago");   
                         
                array_push($lista, $res);
            }
        }else{ // NO TIENE NINGUN COBRO NI PAGO ESTA CUENTA
            // NO LISTARA NADAAAA
        }
    
        echo json_encode($lista);
    }

    public function mejorar_data_factura_comercial($empresa, $viv_mister_soft)
{
    // ==========================================
// URL API
// ==========================================

if ($viv_mister_soft == "vivasoft") {

    $url = "https://vivasoft.link/app/cmv1/api/listaVentas/" . $empresa;

} else {

    $url = "https://mistersofts.com/app/cmv1/api/listaVentas/" . $empresa;
}


// ==========================================
// CONSUMIR API CON CURL
// ==========================================

$ch = curl_init();

curl_setopt_array($ch, array(
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_HTTPHEADER => array(
        "Accept: application/json"
    )
));

$respuesta = curl_exec($ch);

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$curlError = curl_error($ch);

curl_close($ch);


// ==========================================
// VALIDAR CURL
// ==========================================

if ($respuesta === false) {

    echo json_encode(array(
        "success" => false,
        "mensaje" => "Error al consumir la API",
        "error" => $curlError
    ));

    return;
}


// ==========================================
// VALIDAR HTTP
// ==========================================

if ($httpCode < 200 || $httpCode >= 300) {

    echo json_encode(array(
        "success" => false,
        "mensaje" => "La API respondió con un error HTTP",
        "http_code" => $httpCode,
        "respuesta" => $respuesta
    ));

    return;
}


// ==========================================
// LIMPIAR RESPUESTA
// ==========================================

// Encontrar el inicio del JSON
$inicio = strpos($respuesta, '[');

// Encontrar el final del JSON
$fin = strrpos($respuesta, ']');


if ($inicio === false || $fin === false) {

    echo json_encode(array(
        "success" => false,
        "mensaje" => "No se encontró un arreglo JSON en la respuesta",
        "respuesta" => $respuesta
    ));

    return;
}


// Quedarnos únicamente con el JSON
$respuesta = substr(
    $respuesta,
    $inicio,
    $fin - $inicio + 1
);


// ==========================================
// CORREGIR ESCAPES INVÁLIDOS
// ==========================================

$respuesta = preg_replace(
    '/\\\\(?!["\\\\\/bfnrtu])/',
    '',
    $respuesta
);


// ==========================================
// DECODIFICAR JSON
// ==========================================

$data = json_decode($respuesta, true);


// ==========================================
// VALIDAR JSON
// ==========================================

if ($data === null && json_last_error() !== JSON_ERROR_NONE) {

    echo json_encode(array(
        "success" => false,
        "mensaje" => "La respuesta de la API no es un JSON válido",
        "error_json" => json_last_error_msg(),
        "respuesta_limpia" => $respuesta
    ));

    return;
}


// ==========================================
// YA TENEMOS EL ARRAY
// ==========================================

// echo json_encode($data);
    return $data;
}

    public function listar_facturas_comercial_cobro($idcuenta,$empresa,$viv_mister_soft)
    {
        $idempresa = $this->getidempresa($empresa); 
        // $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT * FROM factura WHERE cuenta = '$idcuenta' LIMIT 1");
        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion ='$idcuenta'");
        $dt = $this->dbc->fetch($detalle_trans);

        $factu_clase = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE idempresa ='$idempresa' AND cuenta ='0' AND idtransaccion IN(0,$dt[transacciones_idtransacciones]) AND registro_desde ='contado_venta_comercial'");

        while ($qwe = $this->dbc->fetch($factu_clase)) {
    
                $venta = $this->dbcm->query("SELECT * FROM venta WHERE id_venta='" . $qwe['id_documento'] . "'");
                $asd = $this->dbcm->fetch($venta);
                $res = array("id_venta" => $asd['id_venta'], "fecha" => $asd['fecha_venta'], "nfactura" => $asd['nfactura'], "montofactura" => $asd['monto_total']);
     
                array_push($lista, $res);
        }
//´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´
        // $url = "https://vivasoft.link/app/cmv1/api/listaVentas/".$empresa;
        // if($viv_mister_soft == "vivasoft"){
        //     $url = "https://vivasoft.link/app/cmv1/api/listaVentas/".$empresa;
        // }else{ // mistersofts
        //     $url = "https://mistersofts.com/app/cmv1/api/listaVentas/".$empresa;
        // }

        $data = $this->mejorar_data_factura_comercial($empresa, $viv_mister_soft);
        // $url = "https://mistersofts.com/app/cmv1/api/listaVentas/".$empresa;
        // $data = json_decode(file_get_contents($url), true);
        $lista_factura_venta = [];
//en el data me devuelve null, entonces talves la decodificacion esta mal
        foreach($data as $plantilla){
            $trans_fact = $this->dbc->query("SELECT id_documento
                                            FROM transaccion_documentos_comercial 
                                            WHERE id_documento = '{$plantilla['id']}'");
            if($trans_fact->num_rows > 0){
                // Ya existe, no lo agregamos
            } else {
                // Guardamos todo el registro, no solo el id
                $lista_factura_venta[] = $plantilla;
            }
        }

        $lista_final = array_merge($lista, $lista_factura_venta);
        
        echo json_encode($lista_final);
    }
    
    public function listar_todos_documentos_asignado_cuenta($idcuenta)
{
    $lista = [];

    // FACTURAS COMERCIALES
    $registro = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE cuenta = '$idcuenta' AND registro_desde ='contado_venta_comercial'");
    while ($qwe = $this->dbc->fetch($registro)) {
        $venta = $this->dbcm->query("SELECT * FROM venta WHERE id_venta= '$qwe[id_documento]'");
        $asd = $this->dbcm->fetch($venta);

        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$asd[cliente_id_cliente1]'");
        $cl = $this->dbcm->fetch($cliente);

        $res = array(
            "tipo" => "factura_comercial",
            "id" => $asd['id_venta'],
            "fecha" => $asd['fecha_venta'],
            "nro_documento" => $asd['nfactura'],
            "monto" => $asd['monto_total'],
            "cobrado" => "cobro",
            "pagado" => "",
            "concepto" => "",
            "cobro_pago" => "cobro",
            "cliente_proveedor" => $cl['nombre']
        );
        $lista[] = $res;
    }

    // COBROS DE FACTURAS COMERCIAL
    $registro = $this->dbc->query("SELECT * FROM transaccion_documentos_comercial WHERE cuenta = '$idcuenta' AND registro_desde ='cobro_venta_comercial'");
    while ($qwe = $this->dbc->fetch($registro)) {
        $cobro = $this->dbcm->query("SELECT * FROM detalle_cobro WHERE iddetalle_cobro= '$qwe[id_documento]'");
        $cb = $this->dbcm->fetch($cobro);

        $est_cobro = $this->dbcm->query("SELECT * FROM estado_cobro WHERE id_estado_cobro= '$cb[estado_cobro_id_estado_cobro]'");
        $ec = $this->dbcm->fetch($est_cobro);

        $venta2 = $this->dbcm->query("SELECT * FROM venta WHERE id_venta= '$ec[venta_id_venta]'");
        $asd2 = $this->dbcm->fetch($venta2);

        $cliente2 = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente= '$asd2[cliente_id_cliente1]'");
        $cl2 = $this->dbcm->fetch($cliente2);

        $res = array(
            "tipo" => "cobro_venta_comercial",
            "id" => $cb['iddetalle_cobro'],
            "fecha" => $cb['fecha_actual'],
            "nro_documento" => $cb['num_documento'],
            "monto" => $cb['monto'],
            "cobrado" => "cobro",
            "pagado" => "",
            "concepto" => "",
            "cobro_pago" => "cobro",
            "cliente_proveedor" => $cl2['nombre']
        );
        $lista[] = $res;
    }

    // FACTURAS
    $registro = $this->dbc->query("SELECT * FROM factura WHERE cuenta = '$idcuenta'");
    while ($qwe = $this->dbc->fetch($registro)) {
        if ($qwe['clasefactura'] == 2) {
            $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
            $asd = $this->dbcm->fetch($cliente);
            $nombre = $asd['nombre'];
            $factura_cobro = "factura_cobro";

            if($qwe['tipo_factura'] == 'contado'){
                $comprob = $this->dbc->query("SELECT * FROM cuentaspof WHERE idfactura='$qwe[idfactura]'");
                $cp = $this->dbc->fetch($comprob);
                $idcomprobante = $cp['idcuentaspof'];
            }else{
                $idcomprobante = null;
            }

            $cobro_pago = "cobro";
        } else {
            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
            $asd = $this->dbcm->fetch($proveedor);
            $nombre = $asd['nombre'];
            $factura_cobro = "factura_pago";
            if($qwe['tipo_factura'] == 'contado'){
                $comprob = $this->dbc->query("SELECT * FROM cuentaspor WHERE idfactura='$qwe[idfactura]'");
                $cp = $this->dbc->fetch($comprob);
                $idcomprobante = $cp['idcuentaspor'];
            }else{
                $idcomprobante = null;
            }
            $cobro_pago = "pago";
        }

        $res = array(
            "tipo" => "factura_contabilidad",
            "id" => $qwe['idfactura'],
            "fecha" => $qwe['fecha'],
            "nro_documento" => $qwe['nfactura'],
            "monto" => $qwe['montofactura'],
            "clasefactura" => $qwe['clasefactura'],
            "cobrado" => $qwe['cobrado'],
            "pagado" => $qwe['pagado'],
            "concepto" => $qwe['por_concepto_de'],
            "tipo_documento" => $qwe['tipo_factura'],
            "documento_cobro_pago" => $factura_cobro,
            "idcomprobante" => $idcomprobante,
            "cobro_pago" => $cobro_pago,
            "cliente_proveedor" => $nombre
        );
        $lista[] = $res;
    }

    // RECIBOS
    $registro = $this->dbc->query("SELECT * FROM recibo WHERE cuenta = '$idcuenta'");
    while ($qwe = $this->dbc->fetch($registro)) {
        if ($qwe['cobrado'] != 0) {
            $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
            $asd = $this->dbcm->fetch($cliente);
            $nombre = $asd['nombre'];
            $recibo_cobro = "recibo_cobro";

            $comprob = $this->dbc->query("SELECT * FROM cuentaspof WHERE idrecibo='$qwe[idrecibo]'");
            $cp = $this->dbc->fetch($comprob);
            $idcomprobante = $cp['idcuentaspof'];
            $cobro_pago = "cobro";
        } else {
            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
            $asd = $this->dbcm->fetch($proveedor);
            $nombre = $asd['nombre'];
            $recibo_cobro = "recibo_pago";

            $comprob = $this->dbc->query("SELECT * FROM cuentaspor WHERE idrecibo='$qwe[idrecibo]'");
            $cp = $this->dbc->fetch($comprob);
            $idcomprobante = $cp['idcuentaspor'];
            $cobro_pago = "pago";
        }

        $res = array(
            "tipo" => "recibo",
            "id" => $qwe['idrecibo'],
            "fecha" => $qwe['fecha'],
            "nro_documento" => $qwe['nro_recibo'],
            "monto" => $qwe['monto'],
            "cobrado" => $qwe['cobrado'],
            "pagado" => $qwe['pagado'],
            "concepto" => $qwe['concepto'],
            "tipo_documento" => 'contado',
            "documento_cobro_pago" => $recibo_cobro,
            "idcomprobante" => $idcomprobante,
            "cobro_pago" => $cobro_pago,
            "cliente_proveedor" => $nombre
        );
        $lista[] = $res;
    }

    // COMPROBANTES
    $registro = $this->dbc->query("SELECT idcuentaspof AS idcomprobante ,fecha, nrecibo,idfactura,idrecibo, monto,persona, concepto,'comprobante de cobro' AS tipo FROM cuentaspof WHERE cuenta = '$idcuenta'
        UNION
        SELECT idcuentaspor AS idcomprobante ,fecha, nrecibo,idfactura,idrecibo, monto,persona, concepto,'comprobante de pago' AS tipo FROM cuentaspor WHERE cuenta = '$idcuenta';
        ");
    while ($qwe = $this->dbc->fetch($registro)) {
        if($qwe['idfactura'] == null || $qwe['idfactura'] == '0'){ // ENTONCES EL COMPROBANTE PERTENECE A RECIBO
            // $documento = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo='$qwe[idrecibo]'");
            // $rec = $this->dbc->fetch($documento);

            // if($rec['cuenta'] == $idcuenta){ // EL RECIBO y el comprobante de ESE RECIBO pertenecen a la MISMA cuenta
            //     // if($rec['tipo_factura'] == 'contado'){
            //     //     // NO MOSTRARA EL COMPROBANTE PORQUE SINO SE VERA DUPLICADO 
            //     // }else{
            //     //     $res = array(
            //     //     "tipo" => $qwe['tipo'],
            //     //     "id" => $qwe['idcomprobante'],
            //     //     "fecha" => $qwe['fecha'],
            //     //     "nro_documento" => $qwe['nrecibo'],
            //     //     "monto" => $qwe['monto'],
            //     //     // "cobrado" => $qwe['cobrado'],
            //     //     // "pagado" => $qwe['pagado'],
            //     //     "concepto" => $qwe['concepto'],
            //     //     "cliente_proveedor" => $qwe['persona']
            //     // );
            //     // $lista[] = $res;
            //     // }
            // }
            // else{ //LA FACTURA Y EL COMPRANTE NO PERTENECEN A LA MISMA CUENTA 
            //     $res = array(
            //         "tipo" => $qwe['tipo'],
            //         "id" => $qwe['idcomprobante'],
            //         "fecha" => $qwe['fecha'],
            //         "nro_documento" => $qwe['nrecibo'],
            //         "monto" => $qwe['monto'],
            //         // "cobrado" => $qwe['cobrado'],
            //         // "pagado" => $qwe['pagado'],
            //         "concepto" => $qwe['concepto'],
            //         "cliente_proveedor" => $qwe['persona']
            //     );
            //     $lista[] = $res;
            // }
        }else{
            $documento = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$qwe[idfactura]'");
            $ft = $this->dbc->fetch($documento);

            if($ft['cuenta'] == $idcuenta){ // la factura y el comprobante de esa factura pertenecen a la cuenta
                if($ft['tipo_factura'] == 'contado'){
                    // NO MOSTRARA EL COMPROBANTE PORQUE SINO SE VERA DUPLICADO 
                }else{
                    $res = array(
                    "tipo" => $qwe['tipo'],
                    "id" => $qwe['idcomprobante'],
                    "fecha" => $qwe['fecha'],
                    "nro_documento" => $qwe['nrecibo'],
                    "monto" => $qwe['monto'],
                    // "cobrado" => $qwe['cobrado'],
                    // "pagado" => $qwe['pagado'],
                    "concepto" => $qwe['concepto'],
                    "cliente_proveedor" => $qwe['persona']
                );
                $lista[] = $res;
                }
            }else{ //LA FACTURA Y EL COMPRANTE NO PERTENECEN A LA MISMA CUENTA 
                $res = array(
                    "tipo" => $qwe['tipo'],
                    "id" => $qwe['idcomprobante'],
                    "fecha" => $qwe['fecha'],
                    "nro_documento" => $qwe['nrecibo'],
                    "monto" => $qwe['monto'],
                    // "cobrado" => $qwe['cobrado'],
                    // "pagado" => $qwe['pagado'],
                    "concepto" => $qwe['concepto'],
                    "cliente_proveedor" => $qwe['persona']
                );
                $lista[] = $res;
            }
        }
    
        // $proveedor = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$qwe[idfactura]'");

        // if ($qwe['cobrado'] != 0) {
        //     $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
        //     $asd = $this->dbcm->fetch($cliente);
        //     $nombre = $asd['nombre'];
        // } else {
        //     $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
        //     $asd = $this->dbcm->fetch($proveedor);
        //     $nombre = $asd['nombre'];
        // }
        
    }

    // ORDENAR POR FECHA
    usort($lista, function($a, $b) {
        return strtotime($a['fecha']) - strtotime($b['fecha']);
    });

    echo json_encode($lista);
}

}