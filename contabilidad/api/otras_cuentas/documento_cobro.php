<?php
require_once "../../db/db.php";
class Documento_cobro extends DB{
    public function registrar_otras_cuentas($idtransaccion,$asiento,$fecha,$lugar,$id_cliente_proveedor,$coc,$pagado,$cobrado,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa,$sucursal){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // echo json_encode(array($fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$condiciones,$observaciones,$precio,$forma_pago,$empresa));
        $sucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        $count = $this->dbc->query("SELECT COUNT(*) AS canti_total FROM cuentaspof cp
        INNER JOIN transacciones t ON t.idtransacciones = cp.transaccion WHERE t.organizacion_idorganizacion='$ide'");
        $hh = $this->dbc->fetch($count);
        $nrecibo = $hh['canti_total'];
        // $empresa = $this->emp; registropagarfactura nrecibo
        $transi = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion='$ide' and sucursal='$sucursal' order by codigotransaccion desc Limit 1");
        $qq = $this->dbc->fetch($transi);
        $codigo = $qq['codigotransaccion'] + 1;
        $glosa = "Registro cobro $nrecibo";
        $gestion = $this->getgestionactualid($ide);
        $tipotransaccion = 1;

        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM otras_cuentas WHERE idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $nro_otras_cuentas = $resultado['total'] + 1;

        if ($asiento != 0) {
            $insertrans = $this->dbc->query("INSERT INTO `transacciones` (`idtransacciones`, `codigotransaccion`, `fechatransaccion`, `tipodecambio`, `ndocumento`, `glosa`, `consolidar`, `tipotransaccion_idtipotransaccion`, `organizacion_idorganizacion`, `sucursal`, `idgestion`) VALUES (NULL, '$codigo', '$fecha', '1', '0', '$glosa', '1', '$tipotransaccion', '$idempresa', '$sucursal', '$gestion');");
            //nuevat transaccion
            $transis = $this->dbc->query("SELECT * FROM transacciones WHERE codigotransaccion='$codigo' AND  organizacion_idorganizacion='$idempresa' ORDER BY idtransacciones DESC LIMIT 1");
            $ww = $this->dbc->fetch($transis);
            $trans = $ww['idtransacciones'];
            //$detallepago
            
            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$asiento'");
            $orden = 1;
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $precio * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $precio * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta'];
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe','$haber','$nota','$trans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");

                $orden = $orden + 1;
            }
        } else {
            $trans = $idtransaccion;
        }
      
            // Insertar el nuevo registro
        
            $registroProveedor = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,id_cliente_proveedor,clase_otras_cuentas,pagado,cobrado,nro_tributario,contacto,nro_doc_identidad,idtipo,transacciones_idtransacciones,concepto,condiciones,observaciones,precio,forma_pago,idempresa) 
            VALUES ('$fecha','$nro_otras_cuentas','$lugar','$id_cliente_proveedor','$coc','$pagado','$cobrado','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$trans','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }

        echo json_encode($res);
        
    }
    public function listar_recibo_por_id_otras_cuentas($idrecibo,$idotras_cuentas)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        $registro = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$idrecibo'");

while ($qwe = $this->dbc->fetch($registro)) {
    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof = '$qwe[idcuentaspof]' AND idotras_cuentas = '$idotras_cuentas'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "nrecibo" => $qwe['nrecibo'],
                "fecha" => $qwe['fecha'],
                "persona" => $qwe['persona'],
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
    public function listar_otras_cuentas_cobrar($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

               $getPedido = $this->dbc->query("SELECT *
                    FROM otras_cuentas oc,transacciones t
                    WHERE oc.clase_otras_cuentas='2' AND oc.idempresa='$idempresa' AND oc.transacciones_idtransacciones=t.idtransacciones ORDER BY oc.idotras_cuentas DESC");

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
                "forma_pago" => $qwe['forma_pago']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function editar_otras_cuentas($idotras_cuentas,$fecha,$lugar,$id_cliente_proveedor,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago) {
        // $idempresa = $this->getidempresa($empresa);

        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa' AND idcaracteristicas != '$id'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE otras_cuentas
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
                                    forma_pago = '$forma_pago'
                                    WHERE idotras_cuentas = '$idotras_cuentas';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }
    public function listar_recibo_por_id_otras_cuentas_pagar($idrecibo,$idotras_cuentas)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        
        $registro = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$idrecibo'");

while ($qwe = $this->dbc->fetch($registro)) {
    $caja_banco = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor = '$qwe[idcuentaspor]' AND idotras_cuentas = '$idotras_cuentas'");
    
    if ($caja_banco->num_rows > 0) {
        while ($datos_caja = $this->dbc->fetch($caja_banco)) {
            $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
            $datos = $caja->fetch_assoc();
            $res = array(
                "nrecibo" => $qwe['nrecibo'],
                "fecha" => $qwe['fecha'],
                "persona" => $qwe['persona'],
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
}