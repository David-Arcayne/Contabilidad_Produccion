<?php
//require_once "db.php";reportecomprobantecontable
require_once "../../db/db.php";
class Reportes extends DB {

  public function getidempresa($md5){
    $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
    $qwe=$this->dbe->fetch($registro);
    return $qwe['idorganizacion'];
}
public function getidsucursal($md5){
    $registro=$this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
    $qwe=$this->dbe->fetch($registro);
    return $qwe['idsucursalcontable'];
}

public function getidgestion($md5){
  $registro=$this->dbc->query("select * from gestion where md5(idempresa)='$md5' and estado='2'");
  $qwe=$this->dbc->fetch($registro);
  return $qwe['idgestion'];

}


    public function encabezado($empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $empresaq=$this->dbe->query("select * from organizacion where idorganizacion='$ide'");
        while($qwe=$this->dbe->fetch($empresaq)){
        $res=array("nombre"=>$qwe['nombreo'],"nit"=>$qwe['nit'],"telefono"=>$qwe['telefono'],"email"=>$qwe['emailo'],"logo"=>$qwe['logo']);
        array_push($lista,$res);
        }
        echo json_encode($lista);

    }
    
    public function firmas($empresa,$modulo){
        $ide=$this->getidempresa($empresa);
        $lista=[];
        $planes=$this->dba->query("select * from planes where orden='$modulo'");
        $pla=$this->dba->fetch($planes);
        $idp=$pla['idplanes'];
        $registro=$this->dbe->query("select nombref,cargof,numeroid from firmas where organizacion_idorganizacion='$ide' and idmodulo='$idp'");
        
        while($qwe=$this->dbe->fetch($registro)){
            
            $res=array("nombre"=>$qwe[0],"cargo"=>$qwe[1],"numero"=>$qwe[2]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    
    public function reporteactivodisponible($fechai,$fechaf,$reporte,$empresa){
        $lista=[];

        $debe=0;
        $haber=0;
        $deudor=0;
        $acreedor=0;
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $reporteA=$this->dbc->query("SELECT
        pc.numero AS codigo,
        pc.nombreplan AS nombre,
        sum(dt.debe) AS debe,
        sum(dt.haber) AS haber
      FROM
        plandecuenta AS pc
        INNER JOIN transacciones AS t ON pc.organizacion_idorganizacion = t.organizacion_idorganizacion
        AND t.fechatransaccion >= '$fechai'
        AND t.fechatransaccion <= '$fechaf'
        AND t.estado != '4'
        INNER JOIN detalletransaccion AS dt ON dt.transacciones_idtransacciones = t.idtransacciones
        AND dt.idplandecuenta = pc.idplandecuenta
      WHERE
        pc.organizacion_idorganizacion = '$ide'
        AND pc.numero < '1.1.2.00.00'
        AND pc.numero > '1.1.1.00.00' 
        AND t.idgestion='$gestion'
      GROUP BY
        pc.nombreplan");
        while($qwe=$this->dbc->fetch($reporteA)){
        $deudor=$qwe[2]-$qwe[3]; 
        $acreedor=$qwe[3]-$qwe[2];
        if($deudor<=0){$deudor=0;}
        if($acreedor<=0){$acreedor=0;}

        $res=array("codigo"=>$qwe[0],"nombre"=>$qwe[1],"deudor"=>$deudor,"acreedor"=>$acreedor);
        array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function reportedetalletransaccion($fechai,$fechaf,$reporte,$empresa){
        $lista=[];
        $total=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $transacciones=$this->dbc->query("SELECT
        t.codigotransaccion,
        t.fechatransaccion,
        t.glosa,
        t.estado,
        t.idtransacciones
      FROM
        transacciones AS t
      WHERE
        t.organizacion_idorganizacion = '$ide'
        AND t.fechatransaccion >= '$fechai'
        AND t.fechatransaccion <= '$fechaf'
        -- AND t.estado != 4
        AND t.idgestion='$gestion'");
        while($qwe=$this->dbc->fetch($transacciones)){
        $productos=array();
        
        $detallet=$this->dbc->query("SELECT p.nombreplan,p.numero,d.debe,d.haber,d.nota FROM detalletransaccion AS d 
        INNER JOIN plandecuenta AS p ON p.idplandecuenta=d.idplandecuenta WHERE d.transacciones_idtransacciones='".$qwe[3]."';");
        while($asd=$this->dbc->fetch($detallet)){
            $produ=array(
                "plan"=>$asd[0],
                "cuenta"=>$asd[1],
                "debe"=>$asd[2],
                "haber"=>$asd[3],
                "nota"=>$asd[4]
            );
            array_push($productos,$produ);
        }
        $lista=array(
            "codigo"=>$qwe[0],
            "fecha"=>$qwe[1],
            "glosa"=>$qwe[2],
            "estado"=>$qwe[3],
            "detalle"=>$productos
        );
        array_push($total,$lista);
        }    
        echo json_encode($total);
    }

    public function reportedetallefpt($fechai,$fechaf,$empresa){
    
        $lista=[];
        //$total=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $transacciones=$this->dbc->query("select
        t.codigotransaccion,
        t.fechatransaccion,
        t.glosa,
        t.idtransacciones,
        t.estado
      from
        transacciones as t
      where
        t.organizacion_idorganizacion = '$ide'
        and t.fechatransaccion >= '$fechai'
        and t.fechatransaccion <= '$fechaf'
        and t.idgestion='$gestion'");
        while($qwe=$this->dbc->fetch($transacciones)){
        $facturas=[];
    
            $factud=$this->dbc->query("select * from factura where transacciones_idtransacciones='".$qwe[3]."' order by fecha asc");
            $sdf=$this->dbc->fetch($factud);
            if($sdf['transacciones_idtransacciones']!=$qwe[3])
            {}else{
              
            $factu=$this->dbc->query("select * from factura where transacciones_idtransacciones='".$qwe[3]."' order by fecha asc");
            while($asd=$this->dbc->fetch($factu)){
                $nit=0;$cliente="";
                if($asd['clasefactura']==1){ // clasefactura 1 proveedor  y 2 cliente 
                  
                $proveedor=$this->dbcm->query("select * from proveedor where id_proveedor='".$asd['proveedorcliente_idproveedorcliente']."'");
                $zxc=$this->dbcm->fetch($proveedor);
                $nit=$zxc['nit'];
                $cliente=$zxc['nombre'];
                }else{
                  $ccliente=$this->dbcm->query("select * from cliente where id_cliente='".$asd['proveedorcliente_idproveedorcliente']."'");
                $zxc=$this->dbcm->fetch($ccliente);
                $nit=$zxc['nit'];
                $cliente=$zxc['nombre'];
                }

                $fac=array("fecha"=>$asd['fecha'],"nfactura"=>$asd['nfactura'],"monto"=>$asd['montofactura'],"clasefactura"=>$asd['clasefactura'],"nit"=>$nit,"proveedor"=>$cliente
                );
                array_push($facturas,$fac);
            }
            
          
            $res=array(
                "transaccion"=>$qwe[0],
                "fechat"=>$qwe[1],
                "estado"=>$qwe[4],
                "facturas"=>$facturas
            );
            array_push($lista,$res);
          }
          
        }    
        
        echo json_encode($lista);
    }


    public function reportedetallefptclasefactura($fechai, $fechaf, $empresa, $clasefactura) {
      $lista = [];
  
      // Obtener datos iniciales
      $ide = $this->getidempresa($empresa);
      $gestion = $this->getidgestion($empresa);
  
      // Obtener todas las transacciones relevantes
      $transacciones = $this->dbc->query("SELECT DISTINCT t.codigotransaccion, t.fechatransaccion, t.glosa, t.estado, t.idtransacciones
          FROM transacciones AS t
          LEFT JOIN factura AS f ON t.idtransacciones = f.transacciones_idtransacciones
          WHERE t.organizacion_idorganizacion = '$ide'
            AND t.fechatransaccion >= '$fechai'
            AND t.fechatransaccion <= '$fechaf'
            AND t.idgestion = '$gestion'
            AND f.clasefactura = '$clasefactura'
      ");
  
      // Obtener las facturas relacionadas (filtrando por clasefactura)
      $facturasPorTransaccion = [];
      $facturas = $this->dbc->query("SELECT 
              f.transacciones_idtransacciones AS transaccion_id,
              f.fecha,
              f.nfactura,
              f.montofactura,
              f.clasefactura,
              f.proveedorcliente_idproveedorcliente,
              CASE 
                  WHEN f.clasefactura = 1 THEN 'proveedor'
                  WHEN f.clasefactura = 2 THEN 'cliente'
              END AS tipo_relacion
          FROM factura AS f
          WHERE f.clasefactura = '$clasefactura'
      ");
  
      // Organizar facturas por transacción
      while ($factura = $this->dbc->fetch($facturas)) {
          $facturasPorTransaccion[$factura['transaccion_id']][] = $factura;
      }
  
      // Obtener todos los datos de proveedor o cliente en una sola consulta
      $datosRelacionados = [];
      if ($clasefactura == 1) {
          $proveedores = $this->dbcm->query("SELECT id_proveedor AS id, nit, nombre FROM proveedor");
          while ($prov = $this->dbcm->fetch($proveedores)) {
              $datosRelacionados[$prov['id']] = ['nit' => $prov['nit'], 'nombre' => $prov['nombre']];
          }
      } elseif ($clasefactura == 2) {
          $clientes = $this->dbcm->query("SELECT id_cliente AS id, nit, nombre FROM cliente");
          while ($cli = $this->dbcm->fetch($clientes)) {
              $datosRelacionados[$cli['id']] = ['nit' => $cli['nit'], 'nombre' => $cli['nombre']];
          }
      }
  
      // Procesar transacciones y asociar facturas
      while ($transaccion = $this->dbc->fetch($transacciones)) {
          $idTransaccion = $transaccion['idtransacciones'];
          $facturas = $facturasPorTransaccion[$idTransaccion] ?? [];
          $facturasProcesadas = [];
  
          foreach ($facturas as $factura) {
              $idRelacion = $factura['proveedorcliente_idproveedorcliente'];
              $relacion = $datosRelacionados[$idRelacion] ?? ['nit' => null, 'nombre' => null];
  
              $facturasProcesadas[] = [
                  'fecha' => $factura['fecha'],
                  'nfactura' => $factura['nfactura'],
                  'monto' => $factura['montofactura'],
                  'clasefactura' => $factura['clasefactura'],
                  'nit' => $relacion['nit'],
                  'proveedor' => $relacion['nombre'],
              ];
          }
  
          // Solo agregar la transacción si tiene facturas procesadas
          if (!empty($facturasProcesadas)) {
              $lista[] = [
                  'transaccion' => $transaccion['codigotransaccion'],
                  'fechat' => $transaccion['fechatransaccion'],
                  'estado' => $transaccion['estado'],
                  'facturas' => $facturasProcesadas,
              ];
          }
      }
  
      // Devolver la lista como JSON
      echo json_encode($lista);
  }
  
  

    public function reportebalancedesumasysaldosB($fechai,$fechaf,$empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $reporte=$this->dbc->query("SELECT p.numero,p.nombreplan,SUM(d.debe) AS debe,SUM(d.haber) AS haber,SUM(debe)-SUM(haber) AS deudor,SUM(haber)-SUM(debe) AS acreedor FROM plandecuenta AS p
        INNER JOIN transacciones AS t ON t.organizacion_idorganizacion='$ide'
        INNER JOIN detalletransaccion AS d ON d.idplandecuenta=p.idplandecuenta AND t.idtransacciones=d.transacciones_idtransacciones
        WHERE p.organizacion_idorganizacion='$ide' AND t.fechatransaccion>='$fechai' AND t.fechatransaccion<='$fechaf' AND 
        t.idgestion='$gestion'  
        GROUP by p.nombreplan 
        ORDER by p.numero ASC;");
        while($qwe=$this->dbc->fetch($reporte)){
            $deudor=0;
            $acreedor=0;
            if($qwe[4]>=0){
                $deudor=$qwe[4];
            }
            if($qwe[5]>=0){
                $acreedor=$qwe[5];
            }
            $res=array("codigo"=>$qwe[0],"plan"=>$qwe[1],"debe"=>$qwe[2],"haber"=>$qwe[3],"deudor"=>$deudor,"acreedor"=>$acreedor);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function reportebalancedesumasysaldos($fechai, $fechaf, $empresa) {
      $lista = [];
      $ide = $this->getidempresa($empresa);
      $gestion = $this->getidgestion($empresa);
      $reporte = $this->dbc->query("SELECT p.numero, p.nombreplan, SUM(d.debe) AS debe, SUM(d.haber) AS haber, SUM(debe) - SUM(haber) AS deudor, SUM(haber) - SUM(debe) AS acreedor FROM plandecuenta AS p
      INNER JOIN transacciones AS t ON t.organizacion_idorganizacion='$ide' AND t.consolidar=2
      INNER JOIN detalletransaccion AS d ON d.idplandecuenta=p.idplandecuenta AND t.idtransacciones=d.transacciones_idtransacciones
      WHERE p.organizacion_idorganizacion='$ide' AND t.fechatransaccion>='$fechai' AND t.fechatransaccion<='$fechaf' AND 
      t.idgestion='$gestion' 
      GROUP by p.nombreplan 
      ORDER by p.numero ASC;");
  
      $totalDebe = 0;
      $totalHaber = 0;
  //and  t.consolidar='2' 
      while($qwe = $this->dbc->fetch($reporte)) {
          $deudor = 0;
          $acreedor = 0;
          if ($qwe[4] >= 0) {
              $deudor = $qwe[4];
          }
          if ($qwe[5] >= 0) {
              $acreedor = $qwe[5];
          }
          $res = array("codigo" => $qwe[0], "plan" => $qwe[1], "debe" => $qwe[2], "haber" => $qwe[3], "deudor" => $deudor, "acreedor" => $acreedor);
          array_push($lista, $res);
  
          $totalDebe += $qwe[2];
          $totalHaber += $qwe[3];
      }
  /*
      if ($totalDebe != $totalHaber) {
          echo json_encode(array("error" => "Hay un error contable: el total del debe y el haber no son iguales en $fechai hasta $fechaf."));
      } else {
          echo json_encode($lista);
      }
          */
      echo json_encode($lista);
  }
  

  public function reportebalancedesumasysaldoshasta($fechaf, $empresa) {


    $lista = [];
    $ide = $this->getidempresa($empresa);
    $gestion = $this->getidgestion($empresa);
    $reporte = $this->dbc->query("SELECT p.numero, p.nombreplan, SUM(d.debe) AS debe, SUM(d.haber) AS haber, SUM(debe) - SUM(haber) AS deudor, SUM(haber) - SUM(debe) AS acreedor FROM plandecuenta AS p
    INNER JOIN transacciones AS t ON t.organizacion_idorganizacion='$ide'
    INNER JOIN detalletransaccion AS d ON d.idplandecuenta=p.idplandecuenta AND t.idtransacciones=d.transacciones_idtransacciones
    WHERE p.organizacion_idorganizacion='$ide' AND t.fechatransaccion<='$fechaf' AND 
    t.idgestion='$gestion' 
    GROUP by p.nombreplan 
    ORDER by p.numero ASC;");

    $totalDebe = 0;
    $totalHaber = 0;
//and  t.consolidar='2' 
    while($qwe = $this->dbc->fetch($reporte)) {
        $deudor = 0;
        $acreedor = 0;
        if ($qwe[4] >= 0) {
            $deudor = $qwe[4];
        }
        if ($qwe[5] >= 0) {
            $acreedor = $qwe[5];
        }
        $res = array("codigo" => $qwe[0], "plan" => $qwe[1], "debe" => $qwe[2], "haber" => $qwe[3], "deudor" => $deudor, "acreedor" => $acreedor);
        array_push($lista, $res);

        $totalDebe += $qwe[2];
        $totalHaber += $qwe[3];
    }
/*
    if ($totalDebe != $totalHaber) {
        echo json_encode(array("error" => "Hay un error contable: el total del debe y el haber no son iguales en $fechai hasta $fechaf."));
    } else {
        echo json_encode($lista);
    }
        */
    echo json_encode($lista);
    // -------------------------------------------------------------------------------------
    // $lista = [];
    // $ide = $this->getidempresa($empresa);
    // $gestion = $this->getidgestion($empresa);

    // $registro = $this->dbc->query("SELECT
    //     p.numero,
    //     p.nombreplan,
    //     p.idplandecuenta
    // FROM
    //     plandecuenta AS p
    // WHERE
    //     p.organizacion_idorganizacion = '$ide'
    // ORDER BY
    //     p.numero ASC;
    // ");

    // $totalDebe = 0;
    // $totalHaber = 0;

    // while ($qwe = $this->dbc->fetch($registro)) {
    //     $detalle = $this->dbc->query("SELECT
    //         SUM(d.debe) AS debe,
    //         SUM(d.haber) AS haber,
    //         SUM(d.debe) - SUM(d.haber) AS deudor,
    //         SUM(d.haber) - SUM(d.debe) AS acreedor,
    //         d.idplandecuenta
    //     FROM
    //         detalletransaccion AS d,
    //         transacciones AS t
    //     WHERE
    //         d.idplandecuenta = '$qwe[2]'
    //         AND t.idgestion = '$gestion'
    //         AND t.fechatransaccion <= '$fechaf'
    //         AND t.idtransacciones = d.transacciones_idtransacciones
    //     ");

    //     $asd = $this->dbc->fetch($detalle);

    //     if ($qwe[2] == $asd['idplandecuenta']) {
    //         $deudor = $asd['deudor'] >= 0 ? $asd['deudor'] : 0;
    //         $acreedor = $asd['acreedor'] >= 0 ? $asd['acreedor'] : 0;

    //         $res = array(
    //             "codigo" => $qwe['numero'],
    //             "plan" => $qwe['nombreplan'],
    //             "debe" => $asd['debe'],
    //             "haber" => $asd['haber'],
    //             "deudor" => $deudor,
    //             "acreedor" => $acreedor
    //         );

    //         array_push($lista, $res);

    //         $totalDebe += $asd['debe'];
    //         $totalHaber += $asd['haber'];
    //     }
    // }

    // /* if ($totalDebe != $totalHaber) {
    //     echo json_encode(array("error" => "Hay un error contable: el total del debe y el haber no son iguales hasta $fechaf."));
    // } else {
    //     echo json_encode($lista);
    // } */
    
    // echo json_encode($lista);
}

    public function reporteactivoypasivo($fechai,$fechaf,$empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $reporte=$this->dbc->query("SELECT p.numero,p.nombreplan,SUM(d.debe) AS debe,SUM(d.haber) AS haber,SUM(debe)-SUM(haber) AS deudor,SUM(haber)-SUM(debe) AS acreedor FROM plandecuenta AS p
        INNER JOIN transacciones AS t ON t.organizacion_idorganizacion='$ide'
        INNER JOIN detalletransaccion AS d ON d.idplandecuenta=p.idplandecuenta AND t.idtransacciones=d.transacciones_idtransacciones
        WHERE p.organizacion_idorganizacion='$ide' AND t.fechatransaccion>='$fechai' AND t.fechatransaccion<='$fechaf' AND p.numero<'4.0.0.00.00' AND t.idgestion='$gestion' 
        GROUP by p.nombreplan 
        ORDER by p.numero ASC;");

$totalDebe = 0;
$totalHaber = 0;
//..and  t.consolidar='2'  
        while($qwe=$this->dbc->fetch($reporte)){
            $deudor=0;
            $acreedor=0;
            if($qwe[4]>=0){
                $deudor=$qwe[4];
            }
            if($qwe[5]>=0){
                $acreedor=$qwe[5];
            }
            $res=array("codigo"=>$qwe[0],"plan"=>$qwe[1],"debe"=>$qwe[2],"haber"=>$qwe[3],"deudor"=>$deudor,"acreedor"=>$acreedor);
            array_push($lista,$res);

            $totalDebe += $qwe[2];
            $totalHaber += $qwe[3];
        }
        echo json_encode($lista);
      /*  if ($totalDebe != $totalHaber) {
          echo json_encode(array("error" => "Hay un error contable: el total del debe y el haber no son iguales desde $fechai hasta $fechaf."));
      } else {
          echo json_encode($lista);
      }*/
    }

    public function reporteactivoypasivohasta($fechaf,$empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $reporte=$this->dbc->query("SELECT p.numero,p.nombreplan,SUM(d.debe) AS debe,SUM(d.haber) as haber,SUM(debe)-SUM(haber) as deudor,SUM(haber)-SUM(debe) as acreedor from plandecuenta as p
        INNER JOIN transacciones AS t ON t.organizacion_idorganizacion='$ide'
        INNER JOIN detalletransaccion AS d ON d.idplandecuenta=p.idplandecuenta AND t.idtransacciones=d.transacciones_idtransacciones
        WHERE p.organizacion_idorganizacion='$ide' AND t.fechatransaccion<='$fechaf' AND p.numero<'4.0.0.00.00' and t.idgestion='$gestion'  
        GROUP by p.nombreplan 
        ORDER by p.numero ASC;");
        $totalDebe = 0;
$totalHaber = 0;
//and  t.consolidar='2' 
        while($qwe=$this->dbc->fetch($reporte)){
            $deudor=0;
            $acreedor=0;
            if($qwe[4]>=0){
                $deudor=$qwe[4];
            }
            if($qwe[5]>=0){
                $acreedor=$qwe[5];
            }
            $res=array("codigo"=>$qwe[0],"plan"=>$qwe[1],"debe"=>$qwe[2],"haber"=>$qwe[3],"deudor"=>$deudor,"acreedor"=>$acreedor);
            array_push($lista,$res);
            $totalDebe += $qwe[2];
            $totalHaber += $qwe[3];
        }
        echo json_encode($lista);
        /*if ($totalDebe != $totalHaber) {
          echo json_encode(array("error" => "Hay un error contable: el total del debe y el haber no son iguales  hasta $fechaf."));
      } else {
          echo json_encode($lista);
      }
          */
    }
    public function reportecuentasderesultado($fechai,$fechaf,$empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $reporte=$this->dbc->query("SELECT p.numero,p.nombreplan,SUM(d.debe) as debe,SUM(d.haber) as haber,SUM(debe)-SUM(haber) as deudor,SUM(haber)-SUM(debe) as acreedor from plandecuenta as p
        INNER JOIN transacciones as t ON t.organizacion_idorganizacion='$ide'
        INNER JOIN detalletransaccion as d ON d.idplandecuenta=p.idplandecuenta and t.idtransacciones=d.transacciones_idtransacciones
        WHERE p.organizacion_idorganizacion='$ide' and t.fechatransaccion>='$fechai' and t.fechatransaccion<='$fechaf' and p.numero>'4.0.0.00.00' and p.numero<'6.0.0.00.05' and t.idgestion='$gestion'  
        GROUP by p.nombreplan 
        ORDER by p.numero ASC;");
        $totalDebe = 0;
$totalHaber = 0;
//and  t.consolidar='2'  
        while($qwe=$this->dbc->fetch($reporte)){
            $deudor=0;
            $acreedor=0;
            if($qwe[4]>=0){
                $deudor=$qwe[4];
            }
            if($qwe[5]>=0){
                $acreedor=$qwe[5];
            }
            $res=array("codigo"=>$qwe[0],"plan"=>$qwe[1],"debe"=>$qwe[2],"haber"=>$qwe[3],"deudor"=>$deudor,"acreedor"=>$acreedor);
            array_push($lista,$res);
            $totalDebe += $qwe[2];
            $totalHaber += $qwe[3];
        }
        echo json_encode($lista);
        /*if ($totalDebe != $totalHaber) {
          echo json_encode(array("error" => "Hay un error contable: el total del debe y el haber no son iguales desde $fechai hasta $fechaf."));
      } else {
          echo json_encode($lista);
      }
          */
    }
    public function reportebalancegeneral($fechai,$fechaf,$numeroa,$numerob,$empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        $registro=$this->dbc->query("SELECT
        p.numero,
        p.nombreplan,
        p.idplandecuenta
      from
        plandecuenta as p
      WHERE
        p.numero >= '$numeroa'
        and p.numero < '$numerob'
        and p.organizacion_idorganizacion = '$ide'
      order by
        p.numero ASC;
      ");


        while($qwe=$this->dbc->fetch($registro)){
            $detalle=$this->dbc->query("select
            SUM(d.debe) - SUM(d.haber) as total,
            d.idplandecuenta
          from
            detalletransaccion as d,
            transacciones as t
          where
            d.idplandecuenta = '$qwe[2]'
            and t.idgestion = '$gestion'
            and t.fechatransaccion>='$fechai'
            and t.fechatransaccion<='$fechaf'
            and t.idtransacciones = d.transacciones_idtransacciones");
            $asd=$this->dbc->fetch($detalle);
            if($qwe[2]==$asd[1]){
            $res=array("numero"=>$qwe[0],"plan"=>$qwe[1],"total"=>$asd[0]);
            array_push($lista,$res);
            }
            
        }
        echo json_encode($lista);
    }

    public function reportebalancegeneralpp($fechai,$fechaf,$numeroa,$numerob,$empresa){
      $lista=[];
      $ide=$this->getidempresa($empresa);
      $gestion=$this->getidgestion($empresa);
      $registro=$this->dbc->query("SELECT
      p.numero,
      p.nombreplan,
      p.idplandecuenta,
      p.saldonormal
    from
      plandecuenta as p
    WHERE
      p.numero >= '$numeroa'
      and p.numero < '$numerob'
      and p.organizacion_idorganizacion = '$ide'
    order by
      p.numero ASC;
    ");
      while($qwe=$this->dbc->fetch($registro)){
        if($qwe[3]=="DEBE"){
          $detalle=$this->dbc->query("select
          SUM(d.debe) - SUM(d.haber) as total,
          d.idplandecuenta
        from
          detalletransaccion as d,
          transacciones as t
        where
          d.idplandecuenta = '$qwe[2]'
          and t.idgestion = '$gestion'
          and t.fechatransaccion>='$fechai'
          and t.fechatransaccion<='$fechaf'
          and t.idtransacciones = d.transacciones_idtransacciones");
          $asd=$this->dbc->fetch($detalle);
          if($qwe[2]==$asd[1]){
          $res=array("numero"=>$qwe[0],"plan"=>$qwe[1],"total"=>$asd[0]);
          array_push($lista,$res);
          }
        }else{
          $detalle=$this->dbc->query("select
          SUM(d.haber) - SUM(d.debe) as total,
          d.idplandecuenta
        from
          detalletransaccion as d,
          transacciones as t
        where
          d.idplandecuenta = '$qwe[2]'
          and t.idgestion = '$gestion'
          and t.fechatransaccion>='$fechai'
          and t.fechatransaccion<='$fechaf'
          and t.idtransacciones = d.transacciones_idtransacciones");
          $asd=$this->dbc->fetch($detalle);
          if($qwe[2]==$asd[1]){
          $res=array("numero"=>$qwe[0],"plan"=>$qwe[1],"total"=>$asd[0]);
          array_push($lista,$res);
          } 
        }
          
      }
      echo json_encode($lista);
  }


    public function reportebalancegeneralhasta($fechai,$fechaf,$numeroa,$numerob,$empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        
        $registro=$this->dbc->query("SELECT
        p.numero,
        p.nombreplan,
        p.idplandecuenta
      from
        plandecuenta as p
      WHERE
        p.numero >= '$numeroa'
        and p.numero < '$numerob'
        and p.organizacion_idorganizacion = '$ide'
      order by
        p.numero ASC;
      ");
        while($qwe=$this->dbc->fetch($registro)){
            
            $detalle=$this->dbc->query("select
            SUM(d.debe) - SUM(d.haber) as total,
            d.idplandecuenta
          from
            detalletransaccion as d,
            transacciones as t
          where
            d.idplandecuenta = '$qwe[2]'
            and t.idgestion = '$gestion'
            and t.fechatransaccion<='$fechaf'
            and t.idtransacciones = d.transacciones_idtransacciones");
            $asd=$this->dbc->fetch($detalle);
            if($qwe[2]==$asd[1]){
            $res=array("numero"=>$qwe[0],"plan"=>$qwe[1],"total"=>$asd[0]);
            array_push($lista,$res);
            }
            
        }
        echo json_encode($lista);
    }

    public function reportebalancegeneralhastapp($fechai,$fechaf,$numeroa,$numerob,$empresa){
      $lista=[];
      $ide=$this->getidempresa($empresa);
      $gestion=$this->getidgestion($empresa);
      $registro=$this->dbc->query("SELECT
      p.numero,
      p.nombreplan,
      p.idplandecuenta,
      p.saldonormal
    from
      plandecuenta as p
    WHERE
      p.numero >= '$numeroa'
      and p.numero < '$numerob'
      and p.organizacion_idorganizacion = '$ide'
    order by
      p.numero ASC;
    ");
      while($qwe=$this->dbc->fetch($registro)){
          if($qwe[3]=="DEBE"){
          $detalle=$this->dbc->query("select
          SUM(d.debe) - SUM(d.haber) as total,
          d.idplandecuenta
        from
          detalletransaccion as d,
          transacciones as t
        where
          d.idplandecuenta = '$qwe[2]'
          and t.idgestion = '$gestion'
          and t.fechatransaccion<='$fechaf'
          and t.idtransacciones = d.transacciones_idtransacciones");
          $asd=$this->dbc->fetch($detalle);
          if($qwe[2]==$asd[1]){
          $res=array("numero"=>$qwe[0],"plan"=>$qwe[1],"total"=>$asd[0]);
          array_push($lista,$res);
          }
          }else{
          $detalle=$this->dbc->query("select
          SUM(d.haber) - SUM(d.debe) as total,
          d.idplandecuenta
        from
          detalletransaccion as d,
          transacciones as t
        where
          d.idplandecuenta = '$qwe[2]'
          and t.idgestion = '$gestion'
          and t.fechatransaccion<='$fechaf'
          and t.idtransacciones = d.transacciones_idtransacciones");
          $asd=$this->dbc->fetch($detalle);
          if($qwe[2]==$asd[1]){
          $res=array("numero"=>$qwe[0],"plan"=>$qwe[1],"total"=>$asd[0]);
          array_push($lista,$res);
          }
        }
        
          
          
      }
      echo json_encode($lista);
  }

  public function reportecomprobantecontable($numeroIni,$numeroFin,$fechaIni,$fechaFin,$empresa,$factura){
//reporteactivodiaponible
// echo json_encode(array($fechaIni,$fechaFin,$numeroIni,$numeroFin,$empresa,$factura));
    $lista=[];
    $ide=$this->getidempresa($empresa);
    $gestion=$this->getidgestion($empresa);
    // if($numeroIni == '0' && $numeroFin == '0'){
      if($fechaIni != "null" && $fechaIni != "null"){
      $registro=$this->dbc->query("SELECT
      t.codigotransaccion,
      t.fechatransaccion,
      t.ndocumento,
      t.glosa,
      t.tipotransaccion_idtipotransaccion,
      t.idtransacciones,
      t.estado
    FROM
      transacciones AS t
    WHERE
      t.fechatransaccion >= '$fechaIni'
      AND t.fechatransaccion <= '$fechaFin'
      AND t.organizacion_idorganizacion = '$ide'
      AND t.idgestion='$gestion'
    ORDER BY
      t.codigotransaccion ASC;
    ");
    }else{
      $registro=$this->dbc->query("SELECT
      t.codigotransaccion,
      t.fechatransaccion,
      t.ndocumento,
      t.glosa,
      t.tipotransaccion_idtipotransaccion,
      t.idtransacciones,
      t.estado
    FROM
      transacciones AS t
    WHERE
      t.codigotransaccion >= '$numeroIni'
      AND t.codigotransaccion <= '$numeroFin'
      AND t.organizacion_idorganizacion = '$ide'
      AND t.idgestion='$gestion'
    ORDER BY
      t.codigotransaccion ASC;
    ");
    }

    while($qwe=$this->dbc->fetch($registro)){

     
       $pcuentas=$this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='".$qwe['idtransacciones']."'");
       $ww=$this->dbc->fetch($pcuentas);
   //CONTROLA Q EL DETALLE_TRANSACCION PERTENEZCA A LA TRANSACCIO Q DICE PERTENECER DEBEN SER LOS IDS IGUALES
   //TRANSACCIONES --> ID = 50,    DETALLE_TRANSACCION -->ID = 50
       if($ww['transacciones_idtransacciones']!=$qwe['idtransacciones']){}else{


       $tipo=$this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$qwe[4]'"); //llamaba a dba 
       $tt=$this->dbc->fetch($tipo);
       $detalle=[];
       $facturas=[];
       $fature=$this->dbc->query("SELECT
       f.idfactura,
       f.fecha,
       f.nfactura,
       f.montofactura,
       f.proveedorcliente_idproveedorcliente,
       f.clasefactura
     FROM
       factura AS f
     WHERE
       f.transacciones_idtransacciones ='$qwe[5]'
       ");
       while($zxc=$this->dbc->fetch($fature)){
           if($zxc[5]==2){
           $cliente=$this->dbcm->query("SELECT c.nombre,c.nit FROM cliente AS c WHERE c.id_cliente='$zxc[4]' ");
           $cc=$this->dbcm->fetch($cliente);
           //ahi arriba and c.idempresa='".$this->emp."'
           $fat=array("fecha"=>$zxc[1],"cliente"=>$cc[0],"nfactura"=>$zxc[2],"nit"=>$cc[1],"monto"=>$zxc[3]);
           array_push($facturas,$fat);
       }else{
           $cliente=$this->dbcm->query("SELECT p.nombre,p.nit FROM proveedor AS p WHERE p.id_proveedor='$zxc[4]' ");
           $cc=$this->dbcm->fetch($cliente);
           //ahi arriba and c.idempresa='".$this->emp."'
           $fat=array("fecha"=>$zxc[1],"cliente"=>$cc[0],"nfactura"=>$zxc[2],"nit"=>$cc[1],"monto"=>$zxc[3]);
           array_push($facturas,$fat);
       }
       }
     


      $dt=$this->dbc->query("SELECT p.numero,p.nombreplan,d.nota,d.debe,d.haber FROM detalletransaccion AS d
       INNER JOIN plandecuenta AS p ON p.idplandecuenta=d.idplandecuenta
       WHERE d.transacciones_idtransacciones='$qwe[5]';");
       while($asd=$this->dbc->fetch($dt)){
           $det=array("numero"=>$asd[0],"plan"=>$asd[1],"nota"=>$asd[2],"debe"=>$asd[3],"haber"=>$asd[4]);
           array_push($detalle,$det);
       }

       if($factura==1){
         $res=array("codigo"=>$qwe[0],"fecha"=>$qwe[1],"documento"=>$qwe[2],"glosa"=>$qwe[3],"idtransaccion"=>$qwe[5],"estado"=>$qwe[6],"tipo"=>$tt['nombre'],"detalle"=>$detalle);
       }else{
         $res=array("codigo"=>$qwe[0],"fecha"=>$qwe[1],"documento"=>$qwe[2],"glosa"=>$qwe[3],"idtransaccion"=>$qwe[5],"estado"=>$qwe[6],"tipo"=>$tt['nombre'],"detalle"=>$detalle,"facturas"=>$facturas);
       }
       
       array_push($lista,$res);
       }
    }  
    echo json_encode($lista); 
   }

   public function reporte_comprobante_ingreso_egreso($fechaIni,$fechaFin,$numeroIni,$numeroFin,$esIngreso,$empresa){
    //reporteactivodiaponible
        $lista=[];
  
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        if($esIngreso == 1){
          if($numeroIni == 0 && $numeroFin == 0){
            $registro=$this->dbc->query("SELECT r.*,
          f.idorganizacion
        FROM
          cuentaspof AS r
          LEFT JOIN factura f ON r.idfactura = f.idfactura
          LEFT JOIN cuentascobrar_grupal ccg ON ccg.idcuentaspof = r.idcuentaspof
        WHERE
          r.fecha >= '$fechaIni'
          AND r.fecha <= '$fechaFin'
          AND f.idorganizacion = '$ide'
        ORDER BY
          r.idcuentaspof ASC;
          ");
          }else{
            $registro=$this->dbc->query("SELECT r.*,
          f.idorganizacion
        FROM
          cuentaspof AS r
          LEFT JOIN factura f ON r.idfactura = f.idfactura
          LEFT JOIN cuentascobrar_grupal ccg ON ccg.idcuentaspof = r.idcuentaspof
        WHERE
          r.nrecibo >= '$numeroIni'
          AND r.nrecibo <= '$numeroFin'
          AND f.idorganizacion = '$ide'
        ORDER BY
          r.idcuentaspof ASC;
          ");
          }
//------------------------------------------------------------------------


          while($qwe=$this->dbc->fetch($registro)){

            $factura = $this->dbc->query("SELECT * FROM factura WHERE idfactura= '$qwe[idfactura]'");
            $fact = $factura->fetch_assoc();
            // '$fact[proveedorcliente_idproveedorcliente]'
            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='$fact[proveedorcliente_idproveedorcliente]'");
            $cl = $proveedor->fetch_assoc();

            $res = array(
             "nrecibo" => $qwe['nrecibo'],
             "fecha_recibo" => $qwe['fecha'],
             "lugar" => $qwe['lugar'],
             "persona" => $qwe['persona'],
             "monto_recibo" => $qwe['monto'],
             "fecha_factura" => $fact['fecha'],
             "nfactura" => $fact['nfactura'],
              "nit" => $cl['nit'],
              "direccion" => $cl['direccion'],
              "nombre_cliente" => $cl['nombre'],
             "detalle"=>[]
         );
 
         $pcuentas=$this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcuentaspof='$qwe[idcuentaspof]'");
            if($pcuentas->num_rows > 0){
             while ($datos_caja = $this->dbc->fetch($pcuentas)) {
               $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
               $datos = $caja->fetch_assoc();
                $det=array("idcaja_bancos"=>$datos['idcaja_bancos'],"codigo"=>$datos['codigo'],"nombre"=>$datos['tipo_cuenta'],"monto"=>$datos_caja['monto']);
                array_push($res['detalle'],$det);
 
           }
 
            }else{
     
             $res = array(
              "nrecibo" => $qwe['nrecibo'],
             "fecha_recibo" => $qwe['fecha'],
             "lugar" => $qwe['lugar'],
             "persona" => $qwe['persona'],
             "monto_recibo" => $qwe['monto'],
             "fecha_factura" => $fact['fecha'],
             "nfactura" => $fact['nfactura'],
              "nit" => $cl['nit'],
              "direccion" => $cl['direccion'],
              "nombre_cliente" => $cl['nombre'],
             "detalle"=>[]
           );
 
            }
            array_push($lista, $res);
         }  

      }else{

        if($numeroIni == 0 && $numeroFin == 0){
          $registro=$this->dbc->query("SELECT r.*,
        -- r.idcuentaspof,
        -- r.nrecibo,
        -- r.fecha,
        -- r.monto,
        f.idorganizacion
      FROM
        cuentaspor AS r
        LEFT JOIN factura f ON r.idfactura = f.idfactura
        LEFT JOIN cuentaspagar_grupal ccg ON ccg.idcuentaspor = r.idcuentaspor
      WHERE
        r.fecha >= '$fechaIni'
        AND r.fecha <= '$fechaFin'
        AND f.idorganizacion = '$ide'
      ORDER BY
        r.idcuentaspor ASC;
        ");
        }else{
          $registro=$this->dbc->query("SELECT r.*,
        -- r.idcuentaspof,
        -- r.nrecibo,
        -- r.fecha,
        -- r.monto,
        f.idorganizacion
      FROM
        cuentaspor AS r
        LEFT JOIN factura f ON r.idfactura = f.idfactura
        LEFT JOIN cuentaspagar_grupal ccg ON ccg.idcuentaspor = r.idcuentaspor
      WHERE
        r.nrecibo >= '$numeroIni'
        AND r.nrecibo <= '$numeroFin'
        AND f.idorganizacion = '$ide'
      ORDER BY
        r.idcuentaspor ASC;
        ");
        }
//------------------------------------------------------------------------

        while($qwe=$this->dbc->fetch($registro)){

          $res = array(
           "nrecibo" => $qwe['nrecibo'],
           "fecha" => $qwe['fecha'],
           "persona" => $qwe['persona'],
           "monto_recibo" => $qwe['monto'],
           "detalle"=>[]
       );

       $pcuentas=$this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcuentaspor='$qwe[idcuentaspor]'");
          if($pcuentas->num_rows > 0){
           while ($datos_caja = $this->dbc->fetch($pcuentas)) {
             $caja= $this->dbc->query("SELECT * FROM caja_bancos WHERE idcaja_bancos = '$datos_caja[idcaja_bancos]'");
             $datos = $caja->fetch_assoc();
              $det=array("idcaja_bancos"=>$datos['idcaja_bancos'],"codigo"=>$datos['codigo'],"nombre"=>$datos['tipo_cuenta'],"monto"=>$datos_caja['monto']);
              array_push($res['detalle'],$det);

         }

          }else{
   
           $res = array(
             "nrecibo" => $qwe['nrecibo'],
             "fecha" => $qwe['fecha'],
             "monto" => $qwe['monto'],
             "persona" => $qwe['persona'],
             "detalle"=>[]
         );

          }
          array_push($lista, $res);
       }  
      }

        echo json_encode($lista); 
       }
    public function reporteactivodiaponibledos($numeroIni,$numeroFin,$fechaIni,$fechaFin,$empresa){
        $lista=[];

        $debe=0;
        $haber=0;
        $deudor=0;
        $acreedor=0;
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        if($numeroIni == 0 && $numeroFin == 0){
          $reporteA=$this->dbc->query("SELECT
          pc.numero AS codigo,
          pc.nombreplan AS nombre,
          sum(dt.debe) AS debe,
          sum(dt.haber) AS haber
        FROM
          plandecuenta AS pc
          INNER JOIN transacciones AS t ON pc.organizacion_idorganizacion = t.organizacion_idorganizacion
          AND t.fechatransaccion >= '$fechaIni'
          AND t.fechatransaccion <= '$fechaFin'
          INNER JOIN detalletransaccion AS dt ON dt.transacciones_idtransacciones = t.idtransacciones
          AND dt.idplandecuenta = pc.idplandecuenta
          AND dt.estado = '1'
        WHERE
          pc.organizacion_idorganizacion = '$ide'
          AND pc.numero < '1.1.2.00.00'
          AND pc.numero > '1.1.1.00.00'
          AND t.idgestion='$gestion'
        GROUP BY
          pc.nombreplan;
        ");
        }else{
          $reporteA=$this->dbc->query("SELECT
          pc.numero AS codigo,
          pc.nombreplan AS nombre,
          sum(dt.debe) AS debe,
          sum(dt.haber) AS haber
        FROM
          plandecuenta AS pc
          INNER JOIN transacciones AS t ON pc.organizacion_idorganizacion = t.organizacion_idorganizacion
          AND t.codigotransaccion >= '$numeroIni'
          AND t.codigotransaccion <= '$numeroFin'
          INNER JOIN detalletransaccion AS dt ON dt.transacciones_idtransacciones = t.idtransacciones
          AND dt.idplandecuenta = pc.idplandecuenta
          AND dt.estado = '1'
        WHERE
          pc.organizacion_idorganizacion = '$ide'
          AND pc.numero < '1.1.2.00.00'
          AND pc.numero > '1.1.1.00.00'
          AND t.idgestion='$gestion'
        GROUP BY
          pc.nombreplan;
        ");
        }
        
        while($qwe=$this->dbc->fetch($reporteA)){
        $deudor=$qwe[2]-$qwe[3]; 
        $acreedor=$qwe[3]-$qwe[2];
        if($deudor<=0){$deudor=0;}
        if($acreedor<=0){$acreedor=0;}

        $res=array("codigo"=>$qwe[0],"nombre"=>$qwe[1],"deudor"=>$deudor,"acreedor"=>$acreedor);
        array_push($lista,$res);
        }
        echo json_encode($lista);
    }

    public function mayorcuentacontable($fechai,$fechaf,$plan,$empresa){
      ini_set('display_errors', 1);
      ini_set('display_startup_errors', 1);
      error_reporting(E_ALL);
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $gestion=$this->getidgestion($empresa);
        //reconfigurar consulta para que solo se muestre solo la gestion.
        $registro=$this->dbc->query("SELECT
        t.codigotransaccion,
        t.fechatransaccion,
        t.tipotransaccion_idtipotransaccion,
        t.idtransacciones
        
      FROM
        transacciones AS t
      WHERE
        t.organizacion_idorganizacion = '$ide'
        AND t.fechatransaccion >= '$fechai'
        AND t.fechatransaccion <= '$fechaf'
        AND t.estado != 4
        AND t.idgestion = '$gestion'
      ORDER BY
        t.codigotransaccion ASC");
        while($qwe=$this->dbc->fetch($registro)){
            $tipotrans=$this->dbc->query("SELECT nombre FROM tipotransaccion WHERE idtipotransaccion='$qwe[2]'"); //antes era dba
            $tipo=$this->dbc->fetch($tipotrans);
            $detalle=[];

            $detallet=$this->dbc->query("SELECT
            d.iddetalletransaccion,
            d.debe,
            d.haber,
            d.transacciones_idtransacciones
          FROM
            detalletransaccion AS d
          WHERE
            d.idplandecuenta = '$plan'
            AND d.transacciones_idtransacciones='$qwe[3]' ");
            while($asd=$this->dbc->fetch($detallet)){
                $res=array("debe"=>$asd[1],"haber"=>$asd[2]);
                array_push($detalle,$res);
            }
            $red=array("codigo"=>$qwe[0],"fecha"=>$qwe[1],"tipo"=>$tipo[0],"detalle"=>$detalle);
            array_push($lista,$red);

        }
        
        /*
        $detalletrans=$this->db->query("SELECT d.iddetalletransaccion,d.debe,d.haber,d.transacciones_idtransacciones from detalletransaccion as d WHERE d.idplandecuenta='$plan';");
        while($qwe=$this->db->fetch($detalletrans)){
            $trans=$this->db->query("select t.codigotransaccion,t.fechatransaccion,t.tipotransaccion_idtipotransaccion from transacciones as t where t.organizacion_idorganizacion='$this->emp' and t.fechatransaccion>='$fechai' and t.fechatransaccion<='$fechaf' and t.idtransacciones='$qwe[3]' and t.idgestion='$gestion'  order by t.codigotransaccion asc");
            $asd=$this->db->fetch($trans);
            $tipotrans=$this->dba->query("select nombre from tipotransaccion where idtipotransaccion='$asd[2]'");
            $tipo=$this->dba->fetch($tipotrans);
            $res=array("codigo"=>$asd[0],"fecha"=>$asd[1],"tipo"=>$tipo[0],"debe"=>$qwe[1],"haber"=>$qwe[2]);

            array_push($lista,$res);
        }
        */
        echo json_encode($lista);   
    }

    public function obtenereportefacturacobrar($ini,$fin,$sucursal){

      $lista=[];
      $cf=2;
      $idsucursal=$this->getidsucursal($sucursal);
      $registro=$this->dbc->query("select f.idfactura,f.fecha,f.nfactura,t.codigotransaccion, f.montofactura,f.proveedorcliente_idproveedorcliente,f.transacciones_idtransacciones,f.cuenta
      from factura f,transacciones t
      where f.clasefactura='$cf' and f.sucursal='$idsucursal' and f.transacciones_idtransacciones=t.idtransacciones and f.fecha>='$ini' and f.fecha<='$fin' order by f.fecha asc");
      while($qwe=$this->dbc->fetch($registro)){
          $pagado=[];
          $cobras=$this->dbc->query("select SUM(monto) from cuentaspof where idfactura='$qwe[0]'");
          $asd=$this->dbc->fetch($cobras);
          $saldo=$qwe[4]-$asd[0];
          $proveedor=$this->dbcm->query("select * from cliente where id_cliente='".$qwe[5]."'");
          $pro=$this->dbcm->fetch($proveedor);
          $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"numero"=>$qwe[2],"codigo"=>$qwe[3],"idproveedor"=>$qwe[5],"nombrep"=>$pro['nombre'],"monto"=>$qwe[4],"pagado"=>$asd[0],"saldo"=>$saldo,"transaccion"=>$qwe[6],"cuenta"=>$qwe[7]);
          array_push($lista,$res);
      }
      echo json_encode($lista);

    }
    public function obtenereportefacturapagar($ini,$fin,$sucursal){
      //pagar
      $lista=[];
      $cf=1;
      $idsucursal=$this->getidsucursal($sucursal);
      
      $registro=$this->dbc->query("select f.idfactura,f.fecha,f.nfactura,t.codigotransaccion, f.montofactura,f.proveedorcliente_idproveedorcliente,f.transacciones_idtransacciones,f.cuenta
      from factura f,transacciones t
      where f.clasefactura='$cf' and f.sucursal='$idsucursal' and f.transacciones_idtransacciones=t.idtransacciones and f.fecha>='$ini' and f.fecha<='$fin' order by f.fecha asc");
      while($qwe=$this->dbc->fetch($registro)){
          $cobrado=[];
          $cobras=$this->dbc->query("select SUM(monto) from cuentaspor where idfactura='$qwe[0]'");
          $asd=$this->dbc->fetch($cobras);
          $saldo=$qwe[4]-$asd[0];
          $proveedor=$this->dbcm->query("select * from proveedor where id_proveedor='".$qwe[5]."'");
          $pro=$this->dbcm->fetch($proveedor);
          $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"numero"=>$qwe[2],"codigo"=>$qwe[3],"idproveedor"=>$qwe[5],"nombre"=>$pro['nombre'],"monto"=>$qwe[4],"cobrado"=>$asd[0],"saldo"=>$saldo,"transaccion"=>$qwe[6],"cuenta"=>$qwe[7]);
          array_push($lista,$res);
      }
      echo json_encode($lista);
  }
  public function vertemplatedatos($codigo, $empresa, $fecha1, $fecha2)
{
    $lista = [];
    $idem = $this->getidempresa($empresa);

    // Preparar y ejecutar consulta para obtener el template
    $stmtTemplate = $this->dbc->prepare("SELECT * FROM templatect WHERE codigo=? AND idempresa=?");
    if (!$stmtTemplate) {
        die("Error en la preparación de la consulta: " . $this->dbc->error);
    }
    $stmtTemplate->bind_param("si", $codigo, $idem);
    $stmtTemplate->execute();
    $resultTemplate = $stmtTemplate->get_result();
    $qw = $resultTemplate->fetch_assoc();

    if ($qw) {
        $grupot = [];
        
        // Preparar y ejecutar consulta para obtener grupos
        $stmtGrupo = $this->dbc->prepare("SELECT idgrupos, nombre, codigo, orden, idp, idfuncion FROM grupos WHERE codigotemp=?");
        if (!$stmtGrupo) {
            die("Error en la preparación de la consulta: " . $this->dbc->error);
        }
        $stmtGrupo->bind_param("s", $qw['codigo']);
        $stmtGrupo->execute();
        $resultGrupo = $stmtGrupo->get_result();

        while ($qwe = $resultGrupo->fetch_assoc()) {
            $detalle = [];

            // Preparar y ejecutar consulta para obtener detalles del grupo
            $stmtDetalleGrupo = $this->dbc->prepare("SELECT idgruposadd, nplancuenta, orden FROM gruposadd WHERE codigogrupos=? AND template=?");
            if (!$stmtDetalleGrupo) {
                die("Error en la preparación de la consulta: " . $this->dbc->error);
            }
            $stmtDetalleGrupo->bind_param("ss", $qwe['codigo'], $qw['codigo']);
            $stmtDetalleGrupo->execute();
            $resultDetalleGrupo = $stmtDetalleGrupo->get_result();

            while ($qwi = $resultDetalleGrupo->fetch_assoc()) {
        
                $plancuenta = $this->dbc->query("SELECT numero, nombreplan, saldonormal FROM plandecuenta WHERE numero='$qwi[nplancuenta]'");
                $qwj = $plancuenta->fetch_assoc();  // Aquí se usa fetch_assoc para asegurar consistencia
                $qwi['nombreplan'] = $qwj['nombreplan'];
                $qwi['numero'] = $qwj['numero'];
                
                // Llamar reportedeplanes
                $plan = $this->reportedeplanes($empresa, $qwi['numero'], $fecha1, $fecha2);
                $qwi['debe'] = $plan['debe'];
                $qwi['haber'] = $plan['haber'];
                if($qwj[2]=="DEBE"){
                  $qwi['total']=$plan['debe']-$plan['haber'];
                }else{
                  $qwi['total']=$plan['haber']-$plan['debe'];
                }
                $detalle[] = $qwi;
            }

            // Añadir detalles al grupo
            $qwe['detallegrupo'] = $detalle;
            $grupot[] = $qwe;
        }

        // Añadir grupos al template
        $qw['grupo'] = $grupot;
        $lista[] = $qw;
    }

    // Cerrar declaraciones y conexiones
    $stmtTemplate->close();
    $stmtGrupo->close();
    $stmtDetalleGrupo->close();

    // Devolver resultado como JSON
    echo json_encode($lista);
}



  public function reportedeplanes($empresa, $numero, $fechai, $fechaf)
  {
    $ide = $this->getidempresa($empresa);
    $gestion = $this->getidgestion($empresa);
    
    // Inicializar array vacío y valores de debe y haber
    $result = [
        'debe' => 0,
        'haber' => 0
    ];
    
    // Obtener plan de cuenta
    $qwe = $this->dbc->query("SELECT p.idplandecuenta, p.numero, p.nombreplan, p.organizacion_idorganizacion FROM plandecuenta AS p WHERE p.numero='$numero' AND p.organizacion_idorganizacion='$ide' Limit 1");
    $asd = $qwe->fetch_assoc();  // Aquí también se usa fetch_assoc para consistencia
    
    // Obtener transacciones dentro del rango de fechas
    $transaccion = $this->dbc->query("SELECT t.idtransacciones FROM transacciones AS t WHERE t.idgestion='$gestion' AND t.organizacion_idorganizacion='$ide' AND t.fechatransaccion>='$fechai' AND t.fechatransaccion<='$fechaf'");
    while ($tr = $transaccion->fetch_assoc()) {
        // Obtener detalle de las transacciones
        $detallet = $this->dbc->query("SELECT d.iddetalletransaccion, d.transacciones_idtransacciones, d.idplandecuenta, d.debe, d.haber FROM detalletransaccion AS d WHERE d.transacciones_idtransacciones='$tr[idtransacciones]' AND d.idplandecuenta='$asd[idplandecuenta]'");
        while ($det = $detallet->fetch_assoc()) {
            $result['debe'] += $det['debe'];
            $result['haber'] += $det['haber'];
        }
    }
    return $result;  // Devolver el array con los valores calculados nota
  }
  //reportedetallefpt reporteactivodiaponibledos reportedetalletransaccion
//reportecomprobantecontable reporteactivodisponible reportedetalletransaccion mayorcuentacontable reportecomprobantecontable

}


?>