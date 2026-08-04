<?php
require_once "../../db/db.php";
class FuncionesReportes extends DB{

  public function getidempresa($md5){
    $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
    $qwe=$this->dbe->fetch($registro);
    return $qwe['idorganizacion'];
}

  public function getgestionactualC($empresa){
    $orga = $this->getidempresa($empresa); // recibe md5 de la id
    $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
    $qwe = $this->dbc->fetch($registro);
    
    // Retorna un array asociativo con la información
    return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
}

  public function grupo($idg){
    $lista=[];
    $cuentas=$this->dbc->query("select g.idgruposadd, g.nplancuenta, g.orden, g.idp from gruposadd as g where g.idgrupos='$idg'");
    while($qwe=$this->dbc->fetch($cuentas)){
      $res=array("id"=>$qwe["idgruposadd"], "cuenta"=>$qwe["nplancuenta"], "orden"=>$qwe["orden"], "idp"=>$qwe["idp"]);
      array_push($lista,$res);
    }
    return $lista;
  }

  public function sumatoria($listagrupo,$empresa){
    // aqui quiero hacer un foreach de $listagrupo
    $lista=[];
    $gestion=$this->getgestionactualC($empresa);
    $idgestion=$gestion["id"];
    foreach ($listagrupo as $key => $value) {
      $ncuenta=$value["cuenta"];
      $suma=$this->dbc->query("select p.numero, p.nombreplan, sum( d.debe ) as debe, sum( d.haber ) as haber from detalletransaccion as d
      inner join plandecuenta as p on p.idplandecuenta= d.idplandecuenta
      inner join transacciones as t on t.idtransacciones= d.transacciones_idtransacciones
      where p.numero='$ncuenta' and md5(d.idorganizacion)='$empresa' and t.idgestion='$idgestion'");
      $suma=$this->dbc->fetch($suma);

      $res=array("numero"=>$suma[0], "cuenta"=>$suma[1], "debe"=>$suma[2], "haber"=>$suma[3]);
      array_push($lista,$res);
    
    }

    return $lista;

  }


  public function obtenerreportegrupo($grupo,$empresa){
    //$res=array($grupo,$empresa);
    $lista="";
    $grupo=$this->obetenergrupo($grupo,$empresa);
    $id=$grupo["id"];
    $nombre=$grupo["nombre"];
    $idp=$grupo["idp"];
    $idfuncion=$grupo["idfuncion"];
    $ga=$this->grupo($id);
    if($idfuncion==1){
      $lista=$this->sumatoria($ga,$empresa);
    }elseif($idfuncion==2){
      $lista=$this->sumatoriagrupo($ga,$empresa);
    }
    
    echo json_encode($lista);

    
  }

  public function obetenergrupo($grupo,$empresa){
    $grupo=$this->dbc->query("select g.idgrupos, g.nombre, g.idp, g.idfuncion  from grupos as g where g.idgrupos='$grupo' and md5(g.empresa)='$empresa'
    ");
    $qwe=$this->dbc->fetch($grupo);
    return array("id"=>$qwe[0],"nombre"=>$qwe[1],"idp"=>$qwe[2],"idfuncion"=>$qwe[3]);

  }

  public function sumatoriagrupo($listagrupo,$empresa){
    $lista=[];
    $gestion=$this->getgestionactualC($empresa);
    $idgestion=$gestion["id"];
    foreach ($listagrupo as $key => $value) {
      $ncuenta=$value["cuenta"];

      $suma=$this->dbc->query("select p.numero, p.nombreplan, sum( d.debe ) as debe, sum( d.haber ) as haber from detalletransaccion as d
      inner join plandecuenta as p on p.idplandecuenta= d.idplandecuenta
      inner join transacciones as t on t.idtransacciones= d.transacciones_idtransacciones
      where p.numero='$ncuenta' and md5(d.idorganizacion)='$empresa' and t.idgestion='$idgestion'");
      $suma=$this->dbc->fetch($suma);

      $res=array("numero"=>$suma[0], "cuenta"=>$suma[1], "debe"=>$suma[2], "haber"=>$suma[3]);
      array_push($lista,$res);
    
    }

    return $lista;

  }



}
?>