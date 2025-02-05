<?php

require_once "../../db/db.php";
class Lote extends DB{
// $_POST['fecha_lote'],$_POST['hora_lote'],$_POST['nombre_lote'],$_POST['estado'],$_POST['fecha_entrega'],$_POST['hora_entrega'],$_POST['empleado_idempleado'],$_POST['empresa_idempresa']
    public function registrarLote($fecha_lote, $hora_lote, $nombre_lote, $estado, $fecha_entrega,$hora_entrega,$rubro,$empleado_idempleado,$orden_produccion_idorden_produccion,$empresa_idempresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa_idempresa);
        
        $idempleado = $this->getidTrabajador($empleado_idempleado);
      
            // $query = "INSERT INTO lote (fecha_lote, hora_lote, nombre_lote, estado,fecha_entrega,hora_entrega,empleado_idempleado,empresa_idempresa) VALUES (?, ?, ?, ?,?)";
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
                $registroLote = $this->dbp->query("INSERT INTO lote (fecha_lote, hora_lote, lote, estado,fecha_entrega,hora_entrega,rubro_idrubro,empleado_idempleado,empresa_idempresa) VALUES ('$fecha_lote','$hora_lote','$nombre_lote','$estado','$fecha_entrega','$hora_entrega','$rubro','$idempleado','$idempresa')");
                if ($registroLote === TRUE) {  
                    $idlote = $this->dbp->insert_id;  
                    $this->dbp->query("INSERT INTO produccion (estado, lote_idlote, orden_produccion_idorden_produccion) VALUES (0,'$idlote','$orden_produccion_idorden_produccion')");          
                    $this->dbp->query("UPDATE orden_produccion SET estado = 1 WHERE idorden_produccion = '$orden_produccion_idorden_produccion'");                                                                                                                                                                                          
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar",$fecha_lote, $hora_lote, $nombre_lote, $estado, $fecha_entrega,$hora_entrega,$empleado_idempleado,$empresa_idempresa);
                }

            }
        
        echo json_encode($res);
    }
    public function listadoProduccionLote($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);  
      // Material	Cantidad	Envase	Contenido	Precio unitario	Fecha vencimiento
      $getListaa = $this->dbp->query("SELECT p.idproduccion, p.estado AS produccion_estado, p.lote_idlote, p.orden_produccion_idorden_produccion, l.estado AS lote_estado, l.* FROM produccion p
    INNER JOIN lote l ON l.idlote = p.lote_idlote WHERE l.empresa_idempresa = '$idempresa' ORDER BY p.idproduccion DESC;");
        //  $getListaa = $this->dbp->query("SELECT  p.idproduccion,p.estado,p.lote_idlote,p.orden_produccion_idorden_produccion,l.estado AS lote_estado, l.* from produccion p
        // INNER JOIN lote l ON l.idlote = p.lote_idlote WHERE l.empresa_idempresa='$idempresa';");
        // $getLista = $this->dbp->query("SELECT  e.iddetalle_pedido,e.cantidad,e.contenido_envase,e.total_material,e.material_idmaterial,e.tipo_envase_idtipo_envase,e.medida_idmedida FROM detalle_pedido as e WHERE pedido_idpedido IS NULL"); 
        while($qwe=$this->dbp->fetch($getListaa)){ //SELECT  e.iddetalle_compra,e.material_idmaterial,e.cantidad,e.tipo_envase_idtipo_envase,e.contenido,e.precio_unitario,e.total_precio,e.fecha_venci,e.medida_idmedida FROM detalle_compra as e WHERE pedido_idpedido = '$idpedido' AND compra_idcompra IS NULL
             $res=array(
            "idproduccion" => $qwe['idproduccion'],
            "produccion_estado" => $qwe['produccion_estado'], // Estado de la tabla produccion
            "lote_idlote" => $qwe['lote_idlote'],
            "orden_produccion_idorden_produccion" => $qwe['orden_produccion_idorden_produccion'],
            "empresa_idempresa" => $qwe['empresa_idempresa'],
            "idlote" => $qwe['idlote'],
            "fecha_lote" => $qwe['fecha_lote'],
            "hora_lote" => $qwe['hora_lote'],
            "lote" => $qwe['lote'],
            "lote_estado" => $qwe['lote_estado'], // Estado de la tabla lote
            "fecha_entrega" => $qwe['fecha_entrega'],
            "hora_entrega" => $qwe['hora_entrega'],
            "rubro_idrubro" => $qwe['rubro_idrubro'],
            "empleado_idempleado" => $qwe['empleado_idempleado']
            ); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
         echo json_encode($lista);
    }      
    // public function listadoLote($empresa){
    //     $lista = [];
    //     $idempresa = $this->getidempresa($empresa);  
    //   // Material	Cantidad	Envase	Contenido	Precio unitario	Fecha vencimiento
    //      $getListaa = $this->dbp->query("SELECT  l.idlote,l.fecha_lote,l.hora_lote,l.nombre_lote,l.estado,l.fecha_entrega,l.hora_entrega,l.empleado_idempleado,l.empresa_idempresa FROM lote as l WHERE l.empresa_idempresa = '$idempresa'");
    //     // $getLista = $this->dbp->query("SELECT  e.iddetalle_pedido,e.cantidad,e.contenido_envase,e.total_material,e.material_idmaterial,e.tipo_envase_idtipo_envase,e.medida_idmedida FROM detalle_pedido as e WHERE pedido_idpedido IS NULL"); 
    //     while($qwe=$this->dbp->fetch($getListaa)){ //SELECT  e.iddetalle_compra,e.material_idmaterial,e.cantidad,e.tipo_envase_idtipo_envase,e.contenido,e.precio_unitario,e.total_precio,e.fecha_venci,e.medida_idmedida FROM detalle_compra as e WHERE pedido_idpedido = '$idpedido' AND compra_idcompra IS NULL
    //          $res=array("
    //          idlote"=>$qwe['idlote'],
    //          "fecha_lote"=>$qwe['fecha_lote'],
    //          "hora_lote"=>$qwe['hora_lote'],
    //          "nombre_lote"=>$qwe['nombre_lote'],
    //          "estado"=>$qwe['estado'],
    //          "fecha_entrega"=>$qwe['fecha_entrega'],
    //          "hora_entrega"=>$qwe['hora_entrega'],
    //          "empleado_idempleado"=>$qwe['empleado_idempleado'],
    //          "empresa_idempresa"=>$qwe['empresa_idempresa']); //'nombre' sale del formulario de input hidden
    //         array_push($lista,$res);
    //      }
    //      echo json_encode($lista);
    // }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    // public function getidusuario($md5){
    //     $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
    //     $qwe=$this->dbrh->fetch($registro);
    //     return $qwe['idusuario'];
    // }
    public function getidTrabajador($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['trabajador_idtrabajador'];
    }  
    
}
?>