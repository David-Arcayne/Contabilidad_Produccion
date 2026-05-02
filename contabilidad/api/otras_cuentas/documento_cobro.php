<?php
require_once "../../db/db.php";
class Documento_cobro extends DB{ //          idtransaccion, asiento,fecha, id_cliente_proveedor, concepto, precio, idtipo
    public function registrar_otras_cuentas($fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$fecha_venci,$empresa,$sucursal,$archivo){
           
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // echo json_encode(array($fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$condiciones,$observaciones,$precio,$forma_pago,$empresa)); 
        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $gestion = $this->getgestionactualid($idempresa);
        
    
        // $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM otras_cuentas WHERE idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $nro_otras_cuentas = $resultado['total'] + 1;


        // $cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$id_cliente_proveedor'");
        // $clientSelect = $cl->fetch_assoc();

            // se crea factura sin transaccion asignada
            //$trans = 0
            $registro = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,concepto,condiciones,observaciones,precio,forma_pago,fecha_venci,idempresa) 
            VALUES ('$fecha','$nro_otras_cuentas','$lugar','$id_cliente_proveedor','$coc','$pagado','$cobrado','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$fecha_venci','$idempresa')");
        
        $idotras_cuentas = $this->dbc->insert_id;
        // ----------------------------------------------------------------------------------------------------

        if(empty($archivo['name'])){
            // $registropago = $this->dbc->query("INSERT INTO cuentaspof(idcuentaspof,nrecibo,fecha,lugar,cliente,persona,ci,monto,idfactura,idotras_cuentas,transaccion,cuenta,archivo)
            // VALUES(NULL,'$nrecibo','$fecha','$lugar','$idcliente','$persona','$ci','$monto','$idfactura','0','$trans','$idcuenta',NULL)");
// NO PASA NADA YA Q NO EXISTE ARCHIVO

        }else{
         // Manejar la carga del archivo
        $archivo_nombre = "";
        if ($archivo['error'] == UPLOAD_ERR_OK) {
            $archivo_tmp = $archivo['tmp_name'];
            $archivo_nombre = basename($archivo['name']);
            // ----------------------------------
            $unique_name = uniqid("img_", true) . '.' . $archivo_nombre;
            // $target_file = $target_dir . $unique_name;

            // $ruta_destino = __DIR__ . "/archivos/" . $archivo_nombre;
            $ruta_destino = "../archivos/" . $unique_name;
            // $ruta_destino = "../archivos/" . $archivo_nombre;
            // move_uploaded_file($archivo_tmp, $ruta_destino); grupal
        }
        if(move_uploaded_file($archivo_tmp, $ruta_destino)){
             //registrar pago, preguntar guardar la anterior transaccion o la nueva   
        $edicion_otras_cuentas = $this->dbc->query("UPDATE otras_cuentas SET archivo = '$unique_name' WHERE idotras_cuentas = '$idotras_cuentas'");

        }else{
            $res = array("danger", "No se movio el archivo a la carpeta");
        }
    }

        // --------------------------------------------------------------------------------------------------------
    
        // $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura");
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function listar_recibo_por_id_otras_cuentas_reemplazo($idrecibo,$idotras_cuentas)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");

while ($qwe = $this->dbc->fetch($registro)) {

    $otrasCuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = $qwe[idotras_cuentas]");
    $cl = $otrasCuentas->fetch_assoc();

    $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $cl['id_cliente_proveedor'] . "'");
    $cli = $cliente->fetch_assoc();

    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$qwe[idcuentaspof]' AND idotras_cuentas = '$idotras_cuentas'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "nrecibo" => $qwe['nrecibo'],
                "fecha" => $qwe['fecha'],
                "persona" => $qwe['persona'],
                "nit" => $cli['nit'],
                "direccion" => $cli['direccion'],
                "monto_recibo" => $qwe[6],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto']
            );
            array_push($lista, $res);
        }
    } else {
        $res = array(
            "nrecibo" => $qwe['nrecibo'],
            "fecha" => $qwe['fecha'],
            "monto" => $qwe['monto'],
            "persona" => $qwe['persona'],
            // "idcaja_bancos" => $qwe['idcaja_bancos'],
            // "codigo" => NULL,
            // "nombre" => NULL
        );
        array_push($lista, $res);
    }
}

        echo json_encode($lista);
    }

    public function listar_comprobantes_de_recibo_cobro($idrecibo)
    {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $lista = [];
        // $detalle_facturas = [];

        $consulta = $this->dbc->query("SELECT SUM(monto) AS suma_monto FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$idrecibo'");

        $mont = $consulta->fetch_assoc();

        $res = array(
            "monto_total" => $mont['suma_monto'],
            "facturas" => [],
            "caja_bancos" => []
        );

        $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");
        $comprob = $registro->fetch_assoc();

        $factura_lista = $this->dbc->query("SELECT DISTINCT idotras_cuentas 
        FROM detalle_caja_bancos_cobrar 
        WHERE idcuentaspof = '$idrecibo';");

    if ($factura_lista->num_rows > 0) {
            // $factura= $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$factu[idotras_cuentas]'");
            // $ft = $factura->fetch_assoc();

        $recibo= $this->dbc->query("SELECT * FROM recibo WHERE idrecibo = '$comprob[idrecibo]'");
        $rec = $recibo->fetch_assoc();

        if($comprob['concepto'] == null){
            $concepto_comprobante = "Recibo N°: ".$rec['nro_recibo']. " Fecha: ". $rec['fecha'].", ".$rec['concepto'];
        }else{
            $concepto_comprobante = $comprob['concepto'];
        }

                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $rec['cliente_proveedor'] . "'");
                $cl = $cliente->fetch_assoc();

            if($comprob['estado'] == '1'){ //ACTIVO
                $estado_documento = "activo";
            }elseif($comprob['estado'] == '2'){ // PENDIENTE DE ANULACION
                $estado_documento = "pendiente anulacion";
            }elseif($comprob['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                $estado_documento = "pendiente eliminacion";
            }elseif($comprob['estado'] == '4'){ // ANULADO
                $estado_documento = "anulado";
            }elseif($comprob['estado'] == '5'){// PENDIENTE DE ACTIVACION
                $estado_documento = "pendiente activacion";
            }

            $detalle_facturas = array(

                "nrecibo" => $comprob['nrecibo'],
                "lugar" => $comprob['lugar'],
                "fecha" => $comprob['fecha'],
                "persona" => $comprob['persona'],
                "idotras_cuentas" => $rec['idotras_cuentas'],
                "fecha_oc" => $rec['fecha'], // recibo
                "nro_recibo" => $rec['nro_recibo'], // nro recibo
                "estado_documento" => $estado_documento,
                "nombre" => $cl['nombre'], // rec
                "direccion" => $cl['direccion'], // rec
                "nit" => $cl['nit'], // rec
                //nombre del q registra
                "concepto" => $concepto_comprobante // concepto del Comprobante
            
            );

            array_push($res['facturas'], $detalle_facturas);
        

                $caja_banco = $this->dbc->query("SELECT idcaja_bancos, SUM(monto) AS total_monto
                FROM detalle_caja_bancos_cobrar
                WHERE idcuentaspof = '$idrecibo'
                GROUP BY idcaja_bancos");

        while ($datos_caja = $this->dbc->fetch($caja_banco)) {

            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();

            $caja_usuarios= $this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idcaja_bancos = '$datos[idcaja_bancos]' AND funcion = 'responsable'");

            // Array para almacenar los datos completos de cada responsable
            $responsables = array();
            while ($usuario = $this->dbc->fetch($caja_usuarios)) {

                $trabajador= $this->dbrh->query("SELECT * FROM trabajador WHERE idtrabajador = '$usuario[idtrabajador]'");
                $trb = $trabajador->fetch_assoc();  

                $responsables[] = array(
                    "nombre" => $trb['nombre'],
                    "apellido" => $trb['apellido'],
                    "ci" => $trb['ci']
                );
            }

            $detalle_caja_bancos = array(
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['total_monto'],
                "responsables" => $responsables
                
            );
            array_push($res['caja_bancos'], $detalle_caja_bancos);
        }
    }else{
        //   $factura= $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$recib[idotras_cuentas]'");
        // $ft = $factura->fetch_assoc();

        $recibo_n= $this->dbc->query("SELECT * FROM recibo WHERE idrecibo = '$comprob[idrecibo]'");
        $rec = $recibo_n->fetch_assoc();

        if($comprob['concepto'] == null){
            $concepto_comprobante = "Recibo N°: ".$rec['nro_recibo']. " ". $rec['fecha'];
        }else{
            $concepto_comprobante = $comprob['concepto'];
        }

        $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $rec['id_cliente_proveedor'] . "'");
        $cl = $cliente->fetch_assoc();
        
            if($comprob['estado'] == '1'){ //ACTIVO
                $estado_documento = "activo";
            }elseif($comprob['estado'] == '2'){ // PENDIENTE DE ANULACION
                $estado_documento = "pendiente anulacion";
            }elseif($comprob['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                $estado_documento = "pendiente eliminacion";
            }elseif($comprob['estado'] == '4'){ // ANULADO
                $estado_documento = "anulado";
            }elseif($comprob['estado'] == '5'){// PENDIENTE DE ACTIVACION
                $estado_documento = "pendiente activacion";
            }

        $detalle_facturas = array(

            //lugar,    nombre_cliente_proveedor, nit, direccion row
            "nrecibo" => $comprob['nrecibo'],
            "lugar" => $comprob['lugar'],
            "fecha" => $comprob['fecha'],
            "persona" => $comprob['persona'],
            "idfactura" => $rec['idrecibo'],
            "fecha_factura" => $rec['fecha'],
            "nro_factura" => $rec['nro_recibo'],
            "estado_documento" => $estado_documento,
            "nombre" => $cl['nombre'],
            "direccion" => $cl['direccion'],
            "nit" => $cl['nit'],
            "por_concepto_de" => $concepto_comprobante
        
        );

        array_push($res['facturas'], $detalle_facturas);
    }
        // ------------------------------------------------------------------------------------------------------------------------
      
        // }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
        echo json_encode($res);
    }
    public function listar_otras_cuentas_cobrar($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='2' AND oc.idempresa='$idempresa'AND CURDATE() <= fecha_venci ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            //{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

            $listado_union_aux = $this->dbc->query("SELECT monto AS monto
                FROM recibo
                WHERE idotras_cuentas = '$qwe[0]'
                UNION ALL
                SELECT montofactura AS monto
                FROM factura
                WHERE idotras_cuentas = '$qwe[0]'
            ");


            $monto_cobrado = 0;
            // if($listado_recibo_aux->num_rows > 0){ //RECIBOS
                while ($zxc = $this->dbc->fetch($listado_union_aux)) {

                    $monto_cobrado = $monto_cobrado + $zxc['monto'];
                    
                }
             
            //{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();

            $forma_pago = $this->dbc->query("SELECT nombre FROM forma_pago WHERE idforma_pago = '$qwe[forma_pago]'");
            $fp = $forma_pago->fetch_assoc();

            $aux_concepto = "s/g Contrato: ". $qwe['concepto'].", N° ".$qwe['nro_otras_cuentas'].", ".$qwe['fecha'];

            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "fecha_venci" => $qwe['fecha_venci'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "concepto_con_formato" => "(".$aux_concepto.")",
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $monto_cobrado,
                // "saldo" => $saldo,
                "idforma_pago" => $qwe['forma_pago'],
                "forma_pago" => $fp['nombre'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_cobro_sin_transaccion($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                FROM otras_cuentas
                WHERE transacciones_idtransacciones = '0' AND clase_otras_cuentas = '2' AND idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_pago_sin_transaccion($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                FROM otras_cuentas
                WHERE transacciones_idtransacciones = '0' AND clase_otras_cuentas = '1' AND idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function editar_otras_cuentas($idotras_cuentas,$fecha,$lugar,$id_cliente_proveedor,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$fecha_venci,$archivo) {
   
        if(empty($archivo['name'])){

                $editar_otras_cuentas = $this->dbc->query("UPDATE otras_cuentas
                                    SET fecha = '$fecha',
                                    lugar = '$lugar',
                                    id_cliente_proveedor = '$id_cliente_proveedor',
                                    nro_tributario = '$nro_tributario',
                                    contacto = '$contacto',
                                    nro_doc_identidad = '$nro_doc_identidad',
                                    idtipo = '$idtipo',
                                    concepto = '$concepto',
                                    condiciones = '$condiciones',
                                    observaciones = '$observaciones',
                                    precio = '$precio',
                                    forma_pago = '$forma_pago',
                                    fecha_venci = '$fecha_venci'
                                    WHERE idotras_cuentas = '$idotras_cuentas';");
            if ($editar_otras_cuentas === TRUE) {
                $res = array("success", "Registro Realizado", "registrocobrarfactura",$archivo);
            } else {
                $res = array("danger", "No se pudo realizar el registro");
            }
        }else{
         // Manejar la carga del archivo
            $archivo_nombre = "";
            if ($archivo['error'] == UPLOAD_ERR_OK) {
                $archivo_tmp = $archivo['tmp_name'];
                $archivo_nombre = basename($archivo['name']);
                // ----------------------------------
                $unique_name = uniqid("img_", true) . '.' . $archivo_nombre;
                // $target_file = $target_dir . $unique_name;

                // $ruta_destino = __DIR__ . "/archivos/" . $archivo_nombre;
                $ruta_destino = "../archivos/" . $unique_name;
                // $ruta_destino = "../archivos/" . $archivo_nombre;
                // move_uploaded_file($archivo_tmp, $ruta_destino);
            }
            if(move_uploaded_file($archivo_tmp, $ruta_destino)){
                //registrar pago, preguntar guardar la anterior transaccion o la nueva
                $editar_otras_cuentas = $this->dbc->query("UPDATE otras_cuentas
                                    SET fecha = '$fecha',
                                    lugar = '$lugar',
                                    id_cliente_proveedor = '$id_cliente_proveedor',
                                    nro_tributario = '$nro_tributario',
                                    contacto = '$contacto',
                                    nro_doc_identidad = '$nro_doc_identidad',
                                    idtipo = '$idtipo',
                                    concepto = '$concepto',
                                    condiciones = '$condiciones',
                                    observaciones = '$observaciones',
                                    precio = '$precio',
                                    forma_pago = '$forma_pago',
                                    fecha_venci = '$fecha_venci',
                                    archivo = '$unique_name'
                                    WHERE idotras_cuentas = '$idotras_cuentas';");

            if ($editar_otras_cuentas === TRUE) {
                $res = array("success", "Edicion Realizada", "editar_otras_cuentas");
            } else {
                $res = array("danger", "No se pudo realizar el registro");
            }
            }else{
                $res = array("danger", "No se movio el archivo a la carpeta");
            }
        }
            echo json_encode($res);
        }
        
    public function eliminar_otras_cuentas($id){
    
        $existe_enFacturas = $this->dbc->query("SELECT * FROM factura WHERE idotras_cuentas = '$id'");

        $existe_enRecibos = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas = '$id'");

            if ($existe_enFacturas->num_rows > 0 || $existe_enRecibos->num_rows > 0) {
                $res = array("danger", "No se puede eliminar porque existen recibos o facturas en el contrato","eliminar_otras_cuentas");
            }else{
                // eliminar contratacion
                $eliminar_contratacion = $this->dbc->query("DELETE FROM otras_cuentas WHERE idotras_cuentas = '$id'");
                if ($eliminar_contratacion === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminar_otras_cuentas");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }

// ------------------------------------------------------------------------------------------------------


    public function listar_recibo_por_id_otras_cuentas_pagar_reemplazo($idrecibo,$idotras_cuentas)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        $registro = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idrecibo'");

while ($qwe = $this->dbc->fetch($registro)) {
    $otrasCuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = $qwe[idotras_cuentas]");
    $cl = $otrasCuentas->fetch_assoc();

    $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $cl['id_cliente_proveedor'] . "'");
    $prov = $proveedor->fetch_assoc();
    // $otrasCuentas = $this->dbc->query("SELECT * FROM cli WHERE idotras_cuentas = $qwe[id_cliente_proveedor]");

    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$qwe[idcuentaspor]' AND idotras_cuentas = '$idotras_cuentas'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "nrecibo" => $qwe['nrecibo'],
                "fecha" => $qwe['fecha'],
                "persona" => $qwe['persona'],
                "nit" => $prov['nit'],
                "direccion" => $prov['direccion'],
                "monto_recibo" => $qwe[6],
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['monto']
            );
            array_push($lista, $res);
        }
    } else {
        $res = array(
            "nrecibo" => $qwe['nrecibo'],
            "fecha" => $qwe['fecha'],
            "monto" => $qwe['monto'],
            "persona" => $qwe['persona'],
            // "idcaja_bancos" => $qwe['idcaja_bancos'],
            // "codigo" => NULL,
            // "nombre" => NULL
        );
        array_push($lista, $res);
    }
}

        echo json_encode($lista);
    }

    public function listar_comprobantes_de_recibo_pago($idcomprobante)
    {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $lista = [];
        // $detalle_facturas = [];

        $consulta = $this->dbc->query("SELECT SUM(monto) AS suma_monto FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$idcomprobante'");

        $mont = $consulta->fetch_assoc();

        $res = array(
            "monto_total" => $mont['suma_monto'],
            "facturas" => [],
            "caja_bancos" => []
        );

        // $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");
        // $recib = $registro->fetch_assoc();

        $registro = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idcomprobante'");
        $comprobante = $registro->fetch_assoc();

        $factura_lista = $this->dbc->query("SELECT DISTINCT idotras_cuentas 
        FROM detalle_caja_bancos_pagar
        WHERE idcuentaspor = '$idcomprobante';");

    if ($factura_lista->num_rows > 0) {
        // while ($factu = $this->dbc->fetch($factura_lista)) {
            // $recibo= $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas = '$factu[idotras_cuentas]'");
            // $rec = $recibo->fetch_assoc();

            $recibo= $this->dbc->query("SELECT * FROM recibo WHERE idrecibo = '$comprobante[idrecibo]'");
            $rec = $recibo->fetch_assoc();

            if($comprobante['estado'] == '1'){ //ACTIVO
                $estado_documento = "activo";
            }elseif($comprobante['estado'] == '2'){ // PENDIENTE DE ANULACION
                $estado_documento = "pendiente anulacion";
            }elseif($comprobante['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                $estado_documento = "pendiente eliminacion";
            }elseif($comprobante['estado'] == '4'){ // ANULADO
                $estado_documento = "anulado";
            }elseif($comprobante['estado'] == '5'){// PENDIENTE DE ACTIVACION
                $estado_documento = "pendiente activacion";
            }

            if($comprobante['concepto'] == null){
                $concepto_comprobante = "Recibo N°: ".$rec['nro_recibo']. " Fecha: ". $rec['fecha'].", ".$rec['concepto'];
            }else{
                $concepto_comprobante = $comprobante['concepto'];
            }

                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $rec['cliente_proveedor'] . "'");
                $cl = $proveedor->fetch_assoc();
            

            $detalle_facturas = array(

                "nrecibo" => $comprobante['nrecibo'],
                "lugar" => $comprobante['lugar'],
                "fecha" => $comprobante['fecha'],
                "persona" => $comprobante['persona'],
                "idotras_cuentas" => $rec['idrecibo'],
                "fecha_oc" => $rec['fecha'],
                "nro_otras_cuentas" => $rec['nro_recibo'],
                "estado_documento" => $estado_documento,
                "nombre" => $cl['nombre'],
                "direccion" => $cl['direccion'],
                "nit" => $cl['nit'],
                "concepto" => $concepto_comprobante
            
            );

            array_push($res['facturas'], $detalle_facturas);
        // }

                $caja_banco = $this->dbc->query("SELECT idcaja_bancos, SUM(monto) AS total_monto
                FROM detalle_caja_bancos_pagar
                WHERE idcuentaspor = '$idcomprobante'
                GROUP BY idcaja_bancos");

        while ($datos_caja = $this->dbc->fetch($caja_banco)) {

            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
    
            $caja_usuarios= $this->dbc->query("SELECT * FROM caja_banco_usuarios WHERE idcaja_bancos = '$datos[idcaja_bancos]' AND funcion = 'responsable'");

            // Array para almacenar los datos completos de cada responsable
            $responsables = array();
            while ($usuario = $this->dbc->fetch($caja_usuarios)) {

                $trabajador= $this->dbrh->query("SELECT * FROM trabajador WHERE idtrabajador = '$usuario[idtrabajador]'");
                $trb = $trabajador->fetch_assoc();  

                $responsables[] = array(
                    "nombre" => $trb['nombre'],
                    "apellido" => $trb['apellido'],
                    "ci" => $trb['ci']
                );
            }

            $detalle_caja_bancos = array(
                "idcaja_bancos" => $datos['idcaja_bancos'],
                "codigo" => $datos['codigo'],
                "nombre" => $datos['tipo_cuenta'],
                "monto" => $datos_caja['total_monto'],
                "responsables" => $responsables
                
            );
            array_push($res['caja_bancos'], $detalle_caja_bancos);
        }
    }else{

        $recibo= $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas = '$comprobante[idotras_cuentas]'");
        $rec = $recibo->fetch_assoc();

        if($comprobante['estado'] == '1'){ //ACTIVO
                $estado_documento = "activo";
            }elseif($comprobante['estado'] == '2'){ // PENDIENTE DE ANULACION
                $estado_documento = "pendiente anulacion";
            }elseif($comprobante['estado'] == '3'){ // PENDIENTE DE ELIMINACION
                $estado_documento = "pendiente eliminacion";
            }elseif($comprobante['estado'] == '4'){ // ANULADO
                $estado_documento = "anulado";
            }elseif($comprobante['estado'] == '5'){// PENDIENTE DE ACTIVACION
                $estado_documento = "pendiente activacion";
            }

        if($comprobante['concepto'] == null){
            $concepto_comprobante = "Recibo N°: ".$rec['nro_recibo']. " ". $rec['fecha'];
        }else{
            $concepto_comprobante = $comprobante['concepto'];
        }

        $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $rec['cliente_proveedor'] . "'");
        $cl = $proveedor->fetch_assoc();
        
        $detalle_facturas = array(

            //lugar,    nombre_cliente_proveedor, nit, direccion row
            "nrecibo" => $comprobante['nrecibo'],
            "lugar" => $comprobante['lugar'],
            "fecha" => $comprobante['fecha'],
            "persona" => $comprobante['persona'],
            "idfactura" => $rec['idrecibo'],
            "fecha_factura" => $rec['fecha'],
            "nro_factura" => $rec['nro_recibo'],
            "estado_documento" => $estado_documento,
            "nombre" => $cl['nombre'],
            "direccion" => $cl['direccion'],
            "nit" => $cl['nit'],
            "por_concepto_de" => $concepto_comprobante
        
        );

        array_push($res['facturas'], $detalle_facturas);
    }

    echo json_encode($res);
    }

    public function listar_otras_cuentas_pagar($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='1' AND oc.idempresa='$idempresa' AND CURDATE() <= fecha_venci ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            //{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

            $listado_union_aux = $this->dbc->query("SELECT monto AS monto
                FROM recibo
                WHERE idotras_cuentas = '$qwe[0]'
                UNION ALL
                SELECT montofactura AS monto
                FROM factura
                WHERE idotras_cuentas = '$qwe[0]'
            ");


            $monto_pagado = 0;
            // if($listado_recibo_aux->num_rows > 0){ //RECIBOS
                while ($zxc = $this->dbc->fetch($listado_union_aux)) {

                    $monto_pagado = $monto_pagado + $zxc['monto'];
                    
                }
             
            //{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();

            $forma_pago = $this->dbc->query("SELECT nombre FROM forma_pago WHERE idforma_pago = '$qwe[forma_pago]'");
            $fp = $forma_pago->fetch_assoc();

            $aux_concepto = "s/g Contrato: ". $qwe['concepto'].", N° ".$qwe['nro_otras_cuentas'].", ".$qwe['fecha'];

            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "fecha_venci" => $qwe['fecha_venci'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto_con_formato" => "(".$aux_concepto.")",
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $monto_pagado,
                // "saldo" => $saldo,
                "idforma_pago" => $qwe['forma_pago'],
                "forma_pago" => $fp['nombre'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_pagar_vencidas($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='1' AND oc.idempresa='$idempresa' AND CURDATE() >= fecha_venci ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspor WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();

            $forma_pago = $this->dbc->query("SELECT nombre FROM forma_pago WHERE idforma_pago = '$qwe[forma_pago]'");
            $fp = $forma_pago->fetch_assoc();

            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "fecha_venci" => $qwe['fecha_venci'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "idforma_pago" => $qwe['forma_pago'],
                "forma_pago" => $fp['nombre'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_cobrar_vencidas($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='2' AND oc.idempresa='$idempresa' AND CURDATE() >= fecha_venci ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspor WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();

            $forma_pago = $this->dbc->query("SELECT nombre FROM forma_pago WHERE idforma_pago = '$qwe[forma_pago]'");
            $fp = $forma_pago->fetch_assoc();

            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "fecha_venci" => $qwe['fecha_venci'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "idforma_pago" => $qwe['forma_pago'],
                "forma_pago" => $fp['nombre'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

     public function asignar_asiento_A_recibos($data) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $gestion = $this->getgestionactualid($idempresa);
    
        if($data['idasientotipo'] != ""){
                
            // Construir rango dinámico (primer y último día del mes)
            $fecha_inicio = date("Y-m-01", strtotime($data['fecha'])); // "2025-03-01"
            $fecha_fin    = date("Y-m-t", strtotime($data['fecha']));  // "2025-03-31"

            $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$data[idasientotipo]'");
            $at = $asiento_tipo->fetch_assoc();

            $tipo_trans = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$at[tipo]'");
            $tt = $tipo_trans->fetch_assoc();

            $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$gestion'");
            $gc = $gestion_sel->fetch_assoc();

            if($gc['formato_transaccion'] == 'por_tipo_mes') {
                $nroTransa = $this->dbc->query("
                    SELECT 
                        COALESCE(t.codigotransaccion, 0) + 1 AS siguiente,
                        t.*
                    FROM transacciones t
                    WHERE t.codigotransaccion = (
                        SELECT MAX(codigotransaccion)
                        FROM transacciones
                        WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                        AND fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                        AND idgestion = '$gestion'
                        AND organizacion_idorganizacion = '$idempresa'
                    )
                    AND t.tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]'
                    AND t.fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                    AND t.idgestion = '$gestion'
                    AND t.organizacion_idorganizacion = '$idempresa';
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("
                    SELECT COALESCE(t.codigotransaccion, 0) + 1 AS siguiente, t.* 
                    FROM transacciones t 
                    WHERE t.codigotransaccion = ( 
                    SELECT MAX(codigotransaccion) 
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]' AND idgestion = '$gestion' AND organizacion_idorganizacion = '$idempresa') 
                    AND t.tipotransaccion_idtipotransaccion = '$tt[idtipotransaccion]' AND t.idgestion = '$gestion' AND t.organizacion_idorganizacion = '$idempresa';
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("
                      SELECT 
                        COALESCE(t.codigotransaccion, 0) + 1 AS siguiente,
                        t.*
                    FROM transacciones t
                    WHERE t.codigotransaccion = (
                        SELECT MAX(codigotransaccion)
                        FROM transacciones
                        WHERE organizacion_idorganizacion = '$idempresa'
                        AND idgestion = '$gestion'
                    )
                    AND t.organizacion_idorganizacion = '$idempresa'
                    AND t.idgestion = '$gestion';
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['siguiente'];

        if($data['fecha'] >= $resultado122['fechatransaccion']){
        // Insertar en transacciones
        $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar,estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
        VALUES ('$nroTransaccion', '{$data['fecha']}', '1', '0', '{$data['glosa']}', '1','1', '$tt[idtipotransaccion]', '$idempresa', '$idsucursal', '$gestion')");
    
        // Obtener el ID del registro recién insertado
        $idtransaccion = $this->dbc->insert_id;
    
        // Editar las facturas seleccionadas
        $montoFacturas = 0;
        foreach ($data['recibos'] as $recibo) {
            // $selectFact = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas='{$otra_cuenta['idotras_cuentas']}' AND idempresa='$idempresa';");
            // $fact = $selectFact->fetch_assoc();

    //------------------------------------------------------------------------------------------------
            $montoFacturas += $recibo['monto'];
            $updatetranscodigo = $this->dbc->query("UPDATE recibo SET transaccion = '$idtransaccion' WHERE idrecibo = '{$recibo['idrecibo']}'");

     //-----------------------------------------------------------------------------------------------------
        }
    
        // Obtener los asientos relacionados y calcular debe y haber
        $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='{$data['idasientotipo']}'");
        $orden = 1;
        while ($qwe = $tasiento->fetch_assoc()) {
            $pcuenta = $qwe['idcuenta'];
            if ($qwe['tipo'] == "DEBE") {
                $debe = $montoFacturas * ($qwe['porciento'] / 100);
                $haber = 0;
            } elseif ($qwe['tipo'] == "HABER") {
                $debe = 0;
                $haber = $montoFacturas * ($qwe['porciento'] / 100);
            }
            $ppresupuestario = 0;
            $nota = "-";
            $estado = 1;
    
            // Insertar en detalletransaccion Ocurrio un error al asignar la factura
            $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal, orden) VALUES ('$debe', '$haber', '$nota', '$idtransaccion', '$pcuenta', '$ppresupuestario', '$estado', '2', '2', '$idempresa', '$idsucursal', '$orden')");
            
            $orden = $orden + 1;
        }
    }else{// LA FECHA NO ESTA DENTRO DEL RANGO PERMITIDO
        $writetrans = FALSE;
    }

    // Respuesta 
        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "La fecha debe ser posterior al último registro realizado: ".$resultado122['fechatransaccion']);
        }

    }else{ // NO SE CREA UN NUEVO ASIENTO MODELO...  AQUI FALTA IMPLEMENTAR VINCULAR CUENTA CON RECIBO Y CON COBRS O PAGOS

            foreach ($data['recibos'] as $recibo) {

                $updatetranscodigo = $this->dbc->query("UPDATE recibo SET transaccion = '$data[idtrans]' WHERE idrecibo = '{$recibo['idrecibo']}'");

            }

        // Respuesta 
        if ($updatetranscodigo === TRUE) {
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo",$data['idtrans'],$data['cuenta'],$data['idasientotipo']);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    }
    
        echo json_encode($res);
    }

    public function listar_otras_cuentas_cobrar_select($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='2' AND oc.idempresa='$idempresa'AND CURDATE() <= fecha_venci ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$qwe[id_cliente_proveedor]'");
            $cl = $this->dbcm->fetch($cliente);

           
                $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                // "saldo" => $saldo,
                "nombrep" => $cl['nombre']
                );
                array_push($lista, $res);
          
            // array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_pagar_select($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc
                    WHERE oc.clase_otras_cuentas='1' AND oc.idempresa='$idempresa'AND CURDATE() <= fecha_venci ORDER BY oc.idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='$qwe[id_cliente_proveedor]'");
            $prov = $this->dbcm->fetch($proveedor);

          
                $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "nombrep" => $prov['nombre']
                );
                array_push($lista, $res);
           
            // array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
     public function listar_nro_tributario_cliente($id_prov_client, $cobro_pago) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

        if($cobro_pago == '1'){ // CLIENTE
        $cliente_proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente = '$id_prov_client'");
        }else{
        $cliente_proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = '$id_prov_client'");
        }
    
        while ($qwe = $this->dbc->fetch($cliente_proveedor)) {

                $res = array(
                "nro_tributario" => $qwe['nit']
                );
                array_push($lista, $res);
          
            // array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_otras_cuentas_reporte($fecha_ini,$fecha_fin,$vigentes_vencidas,$cobros_pagos,$empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        if($fecha_ini == 0){ // tambien la fecha_fin debe ser cero
            $fecha_rango = "";
        }else{
            $fecha_rango = "AND fecha BETWEEN '$fecha_ini' AND '$fecha_fin'";
        }

        if($vigentes_vencidas == 'vigentes'){// LISTAR SOLO VIGENTES 

        
            if($cobros_pagos == 'cobros'){// LISTAR SOLO VIGENTES COBROS

                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE clase_otras_cuentas='2' AND idempresa='$idempresa'AND CURDATE() <= fecha_venci 
                    $fecha_rango ORDER BY idotras_cuentas DESC");

            }elseif($cobros_pagos == 'pagos'){//LISTAR SOLO VIGENTES PAGOS
                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas
                    WHERE clase_otras_cuentas='1' AND idempresa='$idempresa'AND CURDATE() <= fecha_venci 
                    $fecha_rango ORDER BY idotras_cuentas DESC");
            }elseif($cobros_pagos == 'todos'){//LISTAR SOLO VIGENTES COBROS Y PAGOS
                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE idempresa='$idempresa'AND CURDATE() <= fecha_venci
                    $fecha_rango ORDER BY idotras_cuentas DESC");
            }

        }elseif($vigentes_vencidas == 'vencidas'){//LISTAR SOLO VENCIDAS 

            if($cobros_pagos == 'cobros'){// LISTAR SOLO VENCIDAS COBROS

                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE clase_otras_cuentas='2' AND idempresa='$idempresa'AND CURDATE() > fecha_venci 
                    $fecha_rango ORDER BY idotras_cuentas DESC");

            }elseif($cobros_pagos == 'pagos'){//LISTAR SOLO VENCIDAS PAGOS

                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE clase_otras_cuentas='1' AND idempresa='$idempresa'AND CURDATE() > fecha_venci 
                    $fecha_rango ORDER BY idotras_cuentas DESC");

            }elseif($cobros_pagos == 'todos'){//LISTAR SOLO VENCIDAS COBROS Y PAGOS

            $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE idempresa='$idempresa'AND CURDATE() > fecha_venci 
                    $fecha_rango ORDER BY idotras_cuentas DESC");

            }

        }elseif($vigentes_vencidas == 'todos'){//LISTAR VIGENTES Y VENCIDAS

            if($cobros_pagos == 'cobros'){// LISTAR VIGENTES Y VENCIDAS COBROS

                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE clase_otras_cuentas='2' AND idempresa='$idempresa'
                    $fecha_rango ORDER BY idotras_cuentas DESC");

            }elseif($cobros_pagos == 'pagos'){//LISTAR VIGENTES Y VENCIDAS PAGOS

                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE clase_otras_cuentas='1' AND idempresa='$idempresa'
                    $fecha_rango ORDER BY idotras_cuentas DESC");

            }elseif($cobros_pagos == 'todos'){//LISTAR VIGENTES Y VENCIDAS COBROS Y PAGOS

                $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas 
                    WHERE idempresa='$idempresa'
                    $fecha_rango ORDER BY idotras_cuentas DESC");
            }
        }

        while ($qwe = $this->dbc->fetch($getPedido)) {

            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe['id_cliente_proveedor'] . "'");
            $pro = $this->dbcm->fetch($proveedor);

            // $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $qwe['id_cliente_proveedor'] . "'");
            // $pro = $this->dbcm->fetch($proveedor);

            $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idotras_cuentas='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe['precio'] - $asd[0];

            // $cobras2 = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idfactura='$qwe[0]'"); //173
            // $asd2 = $this->dbc->fetch($cobras2);

            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();

            $forma_pago = $this->dbc->query("SELECT nombre FROM forma_pago WHERE idforma_pago = '$qwe[forma_pago]'");
            $fp = $forma_pago->fetch_assoc();

            $aux_concepto = "s/g Contrato: ". $qwe['concepto'].", N° ".$qwe['nro_otras_cuentas'].", ".$qwe['fecha'];

            if($qwe['clase_otras_cuentas'] == '1'){
                $cobro_pago = "pago";
            }else{

                $cobro_pago = "cobro";
            }
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "fecha_venci" => $qwe['fecha_venci'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "concepto_con_formato" => "(".$aux_concepto.")",
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "cobro_pago" => $cobro_pago,
                "pagado" => $asd[0],
                "saldo" => $saldo,
                "idforma_pago" => $qwe['forma_pago'],
                "forma_pago" => $fp['nombre'],
                "archivo" => $qwe['archivo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$empresa' AND estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listapagarfactura
        return $qwe['idgestion'];
    }
    public function getidsucursal($md5)
    {
        $registro = $this->dbe->query("SELECT * FROM sucursalcontable WHERE md5(idsucursalcontable)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }
    //listar_recibo_por_id_otras_cuentas_pagar precio_restante editar monto_total listar_otras_cuentas_reporte
}