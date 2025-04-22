<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Transacciones extends DB{
    
    
    public function registrotransaccion($codigo, $fecha, $tipocambio, $tipotransaccion, $glosa, $empresa, $sucursal,$ufv,$dolar)
    {
        $ndocumento = "0";
        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        $gestion = $this->getgestionactualC($empresa);
        $idgestion = $gestion["id"];
        $res = "";
        // aqui la condicional si hay una nueva gestion

        if($tipocambio != ""){
            // EXISTE TIPO DE CAMBIO PARA LA FECHA DE HOY O SE SELECCIONARA UNA Q YA EXISTE
            $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
        VALUE(NULL,'$codigo','$fecha','$tipocambio','$ndocumento','$glosa','1','1','$tipotransaccion','$ide','$idsucursal','$idgestion')");

        }else{
            //HAY Q CREAR TIPO DE CAMBIO 
            $registro_tipoCambio = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)
            VALUES('$dolar','$ufv','$fecha','$ide')");

            $idtipo_cambio = $this->dbc->insert_id;   
        
        $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
        VALUE(NULL,'$codigo','$fecha','$idtipo_cambio','$ndocumento','$glosa','1','1','$tipotransaccion','$ide','$idsucursal','$idgestion')");

        }
       
        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "registrotransaccion");
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }
    public function registrotransaccionf5($idt, $fecha, $tipocambio, $tipotransaccion, $glosa, $gestion)
    {

        $res = "";
        $writetrans = $this->dbc->query("UPDATE transacciones SET fechatransaccion='$fecha',tipodecambio='$tipocambio',glosa='$glosa',tipotransaccion_idtipotransaccion='$tipotransaccion',idgestion='$gestion' where idtransacciones='$idt'");
        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "registrotransaccionf5");
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }

    public function listatransacciones($empresa)
    {
        $lista = [];
        // 
        $ide = $this->getidempresa($empresa);
        $getG = $this->getgestionactualC($empresa);
        $gestion = $getG['id'];
        $registro = $this->dbc->query("SELECT
        t.idtransacciones,
        t.codigotransaccion,
        t.fechatransaccion,
        t.glosa,
        t.consolidar,
        t.tipotransaccion_idtipotransaccion,
        t.idgestion,
        t.estado,
        t.tipodecambio
      FROM
        transacciones AS t
      WHERE
        t.organizacion_idorganizacion = '$ide'
        AND idgestion = '$gestion'
        AND t.estado != 6 
      order by
        t.codigotransaccion desc;");
        while ($qwe = $this->dbc->fetch($registro)) {
            $tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='" . $qwe[5] . "'");
            $asd = $this->dbc->fetch($tt);
            $detalle = [];

            $transdeta = $this->dbc->query("select d.iddetalletransaccion,p.nombreplan,d.debe,d.haber,d.nota,d.estado,d.idorganizacion,d.idplandecuenta from detalletransaccion as d,plandecuenta as p where p.idplandecuenta=d.idplandecuenta and d.transacciones_idtransacciones='$qwe[0]'");
            while ($qq = $this->dbc->fetch($transdeta)) {
                $ress = array("id" => $qq[0], "plan" => $qq[1], "debe" => $qq[2], "haber" => $qq[3], "nota" => $qq[4], "estado" => $qq[5], "idempresa" => $qq[6], "idplan" => $qq[7]);
                array_push($detalle, $ress);
            }

            $res = array("id" => $qwe[0], "ntransaccion" => $qwe[1], "fecha" => $qwe[2], "glosa" => $qwe[3], "consolidar" => $qwe[4], "ttransaccion" => $asd['nombre'],"idtipotransaccion"=>$qwe[5], "gestion" => $qwe[6],"estado" => $qwe[7], "detalle" => $detalle, "tipocambio" => $qwe[8]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function eliminartransaccion($idt)
    {
        $res = "";
        // $orga = $this->getidempresa($empresa);
        $detallet = $this->dbc->query("SELECT COUNT(*) AS total FROM detalletransaccion WHERE transacciones_idtransacciones='$idt'");
        $resultado = $detallet->fetch_assoc();
        $totalRegistros = $resultado['total'];
        if($totalRegistros > 0){
            $res = array("danger", "No se Puede Eliminar, tiene datos almacenados");
        }else{

            $eliminado=$this->dbc->query("SELECT codigotransaccion,organizacion_idorganizacion FROM transacciones 
            WHERE idtransacciones = '$idt'");

             $resElimi = $eliminado->fetch_assoc();
             $codig = $resElimi['codigotransaccion'];
             $idempresa = $resElimi['organizacion_idorganizacion'];

             $transa = $this->dbc->query("DELETE FROM transacciones WHERE idtransacciones='$idt'");
           
            $transs=$this->dbc->query("SELECT * FROM transacciones 
            WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa'");
            $aux=0;
            if ($transs->num_rows === 0){
                $res = array("success", "Se Elimino correctamente");
            }else{
            while($qwe2=$this->dbc->fetch($transs)){
           $codigo =  $qwe2['codigotransaccion'];
           $codigo = $codigo - 1;
            
                $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo' 
                WHERE idtransacciones = '$qwe2[idtransacciones]'");
               $aux++;
            }
            
            if ($descTRan ==TRUE){
                $res = array("success", "Se Elimino correctamente");

            }else{
                $res = array("danger", "Se elimino pero no se actualiza");

            }
        }
        }
        
        echo  json_encode($res);
    }

    //DETALLE TRANSACCION
    
    public function detalletransaccionnormal($idtransaccion, $plandecuenta, $debe, $haber, $nota, $empresa, $sucursal, $iddetalletransaccion)
    { //iddetalletransaccion,planCuenta, debe, haber.... , (iddetalleTrans o Nro_orden)
        $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);

        $estado = 1;
        $ppresupuestario = 0;
        $res = "";
        $listaUltimoDetalle = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' ORDER BY orden DESC LIMIT 1;");
        $ulti_registro = $listaUltimoDetalle->fetch_assoc();
        $nuevaOrden = $ulti_registro['orden'] + 1;

         if($iddetalletransaccion == 0){
            $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
            VALUES ('$debe','$haber','$nota','$idtransaccion','$plandecuenta','$ppresupuestario','$estado','2','2','$ide','$idsucursal','$nuevaOrden')");
         }else{

        // Obtener el orden del detalle transacaccion q se insertara
        $listaDetalleOrden = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE iddetalletransaccion='$iddetalletransaccion'");
        $orden = $listaDetalleOrden->fetch_assoc();
        $nro_orden = $orden['orden'];
        // nro_orden --> 2
        
       
         $listaDetalleOrden = $this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' AND orden >'$nro_orden';");
        
         //Actualizar las ordenes de los detalles transaccion

        while ($lorden = $this->dbc->fetch($listaDetalleOrden)) {
            $ordenAux = $lorden['orden'] + 1;
            $editarOrden = $this->dbc->query("UPDATE detalletransaccion SET orden = '$ordenAux'
             WHERE iddetalletransaccion='$lorden[iddetalletransaccion]'");
        }

        // Insertar el nuevo detalle debajo del detalle q se selecciono

        $auxiOrdenInsert = $nro_orden + 1;
        $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
        VALUES ('$debe','$haber','$nota','$idtransaccion','$plandecuenta','$ppresupuestario','$estado','2','2','$ide','$idsucursal','$auxiOrdenInsert')");
    }
       if ($crearDet_trans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal", $idtransaccion);
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }
    public function detalletransaccionnormalf5($iddetalle, $trans, $plandecuenta, $debe, $haber, $nota)
    {

        $res = "";
        $crear = $this->dbc->query("update detalletransaccion set debe='$debe',haber='$haber',nota='$nota',idplandecuenta='$plandecuenta' where iddetalletransaccion='$iddetalle'");
        if ($crear === TRUE) {
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormalf5", $trans);
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }

    public function eliminardetalle($dato)
    {
        $res = "";
        $detallet = $this->dbc->query("SELECT COUNT(*) AS total FROM factura WHERE cuenta='$dato'");
        $resultado = $detallet->fetch_assoc();
        $totalRegistros = $resultado['total'];
        if($totalRegistros > 0){
            $res = array("danger", "No se pudo eliminar");
        }else{
            $registro = $this->dbc->query("DELETE FROM detalletransaccion WHERE iddetalletransaccion='$dato'");
            if ($registro === TRUE) {
                $res = array("success", "Se Elimino");
            } else {
                $res = array("danger", "No se pudo eliminar");
            }
        }
        
        echo json_encode($res);
    }

    public function listadetalletransaccion($trans)
    {
        $lista = [];
    
        // Consulta optimizada
        $sql = " SELECT d.iddetalletransaccion, p.nombreplan,p.numero, d.debe, d.haber, d.nota, d.estado, d.idorganizacion, d.idplandecuenta, d.orden
            FROM detalletransaccion AS d
            INNER JOIN plandecuenta AS p ON p.idplandecuenta = d.idplandecuenta
            WHERE d.transacciones_idtransacciones = '$trans' ORDER BY d.orden ASC
        ";
    //WHERE d.transacciones_idtransacciones = '$trans' ORDER BY d.orden ASC
        // Ejecuta la consulta
        $transdeta = $this->dbc->query($sql);
        
        // Procesa los resultados
        while ($qwe = $this->dbc->fetch($transdeta)) {
            $facturas=$this->dbc->query("SELECT COUNT(*) as listafactura
                    FROM factura AS f 
                    WHERE f.cuenta = $qwe[7]");
            $fa=$this->dbc->fetch($facturas);
            $res = array(
                "id" => $qwe['iddetalletransaccion'],
                "numero"=>$qwe['numero'],
                "plan" => $qwe['nombreplan'],
                "debe" => $qwe['debe'],
                "haber" => $qwe['haber'],
                "nota" => $qwe['nota'],
                "estado" => $qwe['estado'],
                "idempresa" => $qwe['idorganizacion'],
                "idplan" => $qwe['idplandecuenta'],
                "factura" => $fa['listafactura'],
                "orden"=>$qwe['orden']
            );
    
            array_push($lista, $res);
        }
    
        echo json_encode($lista);
    }

    public function anular_factura($idfactura,$estado) {
        // $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","anular_factura");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE factura
                                    SET estado = '$estado'
                                    WHERE idfactura = '$idfactura';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Anulacion exitosa","anular_factura");
            } else {
                $res = array("danger", "No se pudo editar");
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
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); detalletransaccion
        return $qwe['idgestion'];
    }
    public function existe_empresa_modulo($empresa)
    {

        $ide = $this->getidempresa($empresa);
        $res = "";
        // aqui la condicional si hay una nueva gestion

        $existe = $this->dbc->query("SELECT COUNT(*) AS total FROM plandecuenta WHERE organizacion_idorganizacion = '$ide'");
        $resultado12 = $existe->fetch_assoc();

            return $resultado12['total'] > 0;

    }
    public function registro_transaccion_comercial($fecha, $idasignacion_asiento,$monto, $empresa, $sucursal)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        $gestion = $this->getgestionactualid($ide);
        // echo json_encode(array($ide,$idsucursal,$gestion,$fecha, $idasignacion_asiento, $empresa, $sucursal));
        $res = "";
        // aqui la condicional si hay una nueva gestion
        $asignacion = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos WHERE idasignacion_asiento_operacion_modulos='$idasignacion_asiento'");
        $aux_asignacion = $asignacion->fetch_assoc();

        $asient = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$aux_asignacion[idasientotipo]'");//-----------
        $tipotransaccion = $asient->fetch_assoc();
        
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        $res = "";
        $glosa = "Registro glosa comercial";

        if($aux_asignacion['bandera'] == 1){ //-------------------------
            //REVISION
            $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,idasignacion_asiento,organizacion_idorganizacion,sucursal,idgestion)
        VALUE('-1','$fecha','0','0','$glosa','1','6','$tipotransaccion[tipo]','$idasignacion_asiento','$ide','$idsucursal','$gestion')");
        }else{
            // REGISTRA TRANSACCION DIRECTO
            $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,idasignacion_asiento,organizacion_idorganizacion,sucursal,idgestion)
        VALUE('$nroTransaccion','$fecha','0','0','$glosa','1','1','$tipotransaccion[tipo]','$idasignacion_asiento','$ide','$idsucursal','$gestion')");
        }

        $idtrans = $this->dbc->insert_id;
    
        // $aux_asignacion['idasientotipo']
        
        $debe = 0; 
        $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$aux_asignacion[idasientotipo]'");
            $orden = 1;
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $monto * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $monto * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta'];
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe','$haber','$nota','$idtrans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");

                $orden = $orden + 1;
            }

        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "registrotransaccion",$monto,$fecha);
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde",$monto,$fecha);
        }
        echo json_encode($res);
    }

    public function listatransacciones_comercial($empresa)
    {
        $lista = [];
        // 
        $ide = $this->getidempresa($empresa);
        $getG = $this->getgestionactualC($empresa);
        $gestion = $getG['id'];
        $registro = $this->dbc->query("SELECT
        t.idtransacciones,
        t.codigotransaccion,
        t.fechatransaccion,
        t.glosa,
        t.consolidar,
        t.tipotransaccion_idtipotransaccion,
        t.idgestion,
        t.estado,
        t.tipodecambio,
        t.idasignacion_asiento
      FROM
        transacciones as t
      WHERE
        t.organizacion_idorganizacion = '$ide'
        AND idgestion = '$gestion'
        AND t.estado = 6
      ORDER BY
        t.codigotransaccion DESC;");
        while ($qwe = $this->dbc->fetch($registro)) {
            $asiento_asignacion = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos WHERE idasignacion_asiento_operacion_modulos='" . $qwe[9] . "'");
            $asig = $this->dbc->fetch($asiento_asignacion);

            $operacion_modulo = $this->dbc->query("SELECT * FROM operacion_modulos WHERE idoperacion_modulos='$asig[idoperacion_modulos]'");
            $om = $this->dbc->fetch($operacion_modulo);

            $asientotipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asig[idasientotipo]'");
            $at = $this->dbc->fetch($asientotipo);

            $tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='" . $qwe[5] . "'");
            $asd = $this->dbc->fetch($tt);
            // $detalle = [];

            // $transdeta = $this->dbc->query("select d.iddetalletransaccion,p.nombreplan,d.debe,d.haber,d.nota,d.estado,d.idorganizacion,d.idplandecuenta from detalletransaccion as d,plandecuenta as p where p.idplandecuenta=d.idplandecuenta and d.transacciones_idtransacciones='$qwe[0]'");
            // while ($qq = $this->dbc->fetch($transdeta)) {
            //     $ress = array("id" => $qq[0], "plan" => $qq[1], "debe" => $qq[2], "haber" => $qq[3], "nota" => $qq[4], "estado" => $qq[5], "idempresa" => $qq[6], "idplan" => $qq[7]);
            //     array_push($detalle, $ress);
            // }

            $res = array("id" => $qwe[0], "ntransaccion" => $qwe[1], "fecha" => $qwe[2], "glosa" => $qwe[3], "consolidar" => $qwe[4], "ttransaccion" => $asd['nombre'],"idtipotransaccion"=>$qwe[5], "gestion" => $qwe[6],"estado" => $qwe[7], "detalle" => $detalle, "tipocambio" => $qwe[8],"idasignacion_asiento" => $qwe[9],"nombre_modulo" => $om['nombre_modulo'],"nombre_operacion" => $om['nombre_operacion'],"nombre" => $at['nombre']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

                                                 // monto, idplandecuenta
    public function listar_detalle_trans_monto($monto, $idplandecuenta, $empresa)
    { //iddetalletransaccion,planCuenta, debe, haber.... , (iddetalleTrans o Nro_orden) 
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);

        $estado = 1;
        $ppresupuestario = 0;
        $res = "";

        $rel_ip = $this->dbc->query("SELECT * FROM relacionip WHERE idplandecuenta='$idplandecuenta' AND idempresa = '$ide'");

        $plan = $this->dbc->query("SELECT saldonormal FROM plandecuenta WHERE idplandecuenta='$idplandecuenta' AND organizacion_idorganizacion = '$ide'");
        $pdc = $plan->fetch_assoc();

        if ($rel_ip->num_rows > 0){ //EXISTE EL PLANDECUENTA EN LA VINCULACION
            $vinculacion = $rel_ip->fetch_assoc();
            $impuesto = $this->dbc->query("SELECT * FROM impuesto WHERE idimpuesto='$vinculacion[idimpuesto]'");
            $im = $impuesto->fetch_assoc();
            
            if($pdc['saldonormal'] == "DEBE"){
                $debe = $monto * ($im['tasa'] / 100);
                $haber = 0;
            }else{
                $haber = $monto * ($im['tasa'] / 100);
                $debe = 0;
            }
            
        }else{ // NO HAY CUENTAS VINCULADAS CON IMMPUESTOS
            $debe = 0;
            $haber = 0;
        }
        $res = array("debe" => $debe, "haber" => $haber);
        // array_push($lista, $res);
   
        echo json_encode($res);
    }
}