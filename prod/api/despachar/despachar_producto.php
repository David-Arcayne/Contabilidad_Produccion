<?php
require_once "../../db/db.php";
class Despachar_producto extends DB{

    public function registrar_distribucion($numerodoc,$fecha,$hora,$estado,$usuario_idusuario,$empresa_idempresa,$rubro_idrubro,$detalles) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
    $idempresa = $this->getidempresa($empresa_idempresa);
    $idusuario = $this->getidTrabajador($usuario_idusuario);
        // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
        // $registrarEstandar = $this->dbp->query("INSERT INTO estandar_producto(cantidad_producto, producto_idproducto, empresa_idempresa) VALUES ('$cantidad_producto','$producto_idproducto','$idempresa')");
       
        $registroSoli = $this->dbp->query("INSERT INTO distribucion(numerodoc,fecha,hora,estado,usuario_idusuario,empresa_idempresa,rubro_idrubro) VALUES ('$numerodoc','$fecha','$hora','$estado','$idusuario','$idempresa','$rubro_idrubro')");
        if ($registroSoli === TRUE) {
        $iddistribucion = $this->dbp->insert_id; 
        foreach($detalles as $detalle){
            // cantidad : 120
			// distribucion_iddistribuciona : 0
			// producto_idproducto: 46
		
        $cantidad = $detalle['cantidad'];
        // $distribucion_iddistribuciona = $detalle['distribucion_iddistribuciona'];
        $producto_idproducto = $detalle['producto_idproducto'];

        // $id_estandar = $this->dbp->insert_id;  
        $registrarDetalleSoli = $this->dbp->query("INSERT INTO detalle_distribucion(cantidad, distribucion_iddistribucion, producto_idproducto) VALUES ('$cantidad','$iddistribucion','$producto_idproducto')");

        // $registrarDetalleSoli = $this->dbp->query("INSERT INTO detalle_estandar_producto(cantidad,estandar_producto_idestandar_producto,material_idmaterial) 
            // VALUES ('$cantidad','$observaciones','$id_soli','$material_idmaterial')");                                                                                                                                                                
        }
        // if($idpedido > 0){
        //     $registroCompraPedido = $this->dbp->query("INSERT INTO compra_pedido(compra_idcompra,pedido_idpedido) VALUES ('$id_soli','$idpedido')");
        //     $editarPedido = $this->dbp->query("UPDATE pedido SET estado='1' WHERE idpedido='$idpedido'");
        // }
        $res = array("success", "Registro exitoso","registrar_distribucion");
    } else {
        // $registroSoli = $this->dbp->query("INSERT INTO compra_pedido(compra_idcompra,pedido_idpedido) VALUES ('$id_soli','$idpedido')");
        $res = array("danger", "No se pudo registrar");
    }
    echo json_encode($res);
    }

    public function listar_distribucion($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM distribucion WHERE empresa_idempresa = '$idempresa' ORDER BY iddistribucion DESC;");
    
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "iddistribucion" => $etapa['iddistribucion'],
                "numerodoc" => $etapa['numerodoc'],
                "fecha" => $etapa['fecha'],
                "hora" => $etapa['hora'],
                "estado" => $etapa['estado'],
                "usuario_idusuario" => $etapa['usuario_idusuario'],
                "empresa_idempresa" => $etapa['empresa_idempresa'],
                "rubro_idrubro" => $etapa['rubro_idrubro'],
                "detalle" => []
            );
            $getLista2 = $this->dbp->query("SELECT * 
                        FROM detalle_distribucion 
                        WHERE distribucion_iddistribucion = '$etapa[iddistribucion]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "iddetalle_distribucion" => $qwe['iddetalle_distribucion'],
                "cantidad" => $qwe['cantidad'],
                "distribucion_iddistribucion" => $qwe['distribucion_iddistribucion'],
                "producto_idproducto" => $qwe['producto_idproducto']
            );
            array_push($res['detalle'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function eliminar_detalle_distribucion($iddetalle_distribucion){
        // echo json_encode(array($iddetalle_pedido,"hola"));
        // $idempresa = $this->getidempresa($empresa);
        $delete = $this->dbp->query("DELETE FROM detalle_distribucion WHERE iddetalle_distribucion = '$iddetalle_distribucion'");
        if($delete===TRUE){
            $res=array("success","Se elimino correctamente","eliminar_detalle_distribucion");
        }else{
            $res=array("danger","No se pudo eliminar","eliminar_detalle_distribucion");
        }
        echo json_encode($res);
    }

    public function registrar_detalle_distribucion($cantidad, $distribucion_iddistribucion, $producto_idproducto){
        //   $res = array($lote,$fechaVenci,$idpedido,$material,$tipoEnvase,$contenido,$medida,$cantidad,$empresa);
        // $total_precio = $cantidad * $precioUni;
        //  $idempresa = $this->getidempresa($empresa);

            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
                $comprarPorProveedor = $this->dbp->query("INSERT INTO detalle_distribucion(cantidad, distribucion_iddistribucion, producto_idproducto) VALUES ('$cantidad', '$distribucion_iddistribucion', '$producto_idproducto')");
                if ($comprarPorProveedor === TRUE) {                                                                                                                                                                                                      
                    $res = array("success", "Registro exitoso","registrar_detalle_distribucion");
                } else {
                    $res = array("danger", "No se pudo registrar","registrar_detalle_distribucion");
                }
            }
              echo json_encode($res);
        }
    
        public function registro_despacho_producto($cantidad,$detalle_distribucion_iddetalle_distribucion,$almacen_producto_idalmacen_producto,$empresa_idempresa){
            $idempresa = $this->getidempresa($empresa_idempresa);
               
            $registroMatProd = $this->dbp->query("INSERT INTO despacho_producto(cantidad,detalle_distribucion_iddetalle_distribucion,almacen_producto_idalmacen_producto, empresa_idempresa) VALUES ('$cantidad','$detalle_distribucion_iddetalle_distribucion','$almacen_producto_idalmacen_producto',$idempresa)");
                if ($registroMatProd === TRUE) {  
                     $consulta = $this->dbp->query("SELECT cantidad FROM almacen_producto WHERE idalmacen_producto = '$almacen_producto_idalmacen_producto'");
            $resultado = $consulta->fetch_assoc();
            $cantidadAlmacen = $resultado['cantidad'];
            $resta = $cantidadAlmacen - $cantidad;
                    $registroMatProd = $this->dbp->query("UPDATE almacen_producto SET cantidad = '$resta' WHERE idalmacen_producto ='$almacen_producto_idalmacen_producto'");                                                                                                                                                                 
                    $res = array("success", "Registro exitoso","registro_despacho_producto");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            // }
            //   echo ($medida);
            echo json_encode($res);
            // echo json_encode($res);
            
        }
        
        public function despacho_producto($empresa) {
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
        
            // Preparar la consulta
            $getPedido = $this->dbp->query("SELECT * FROM despacho_producto WHERE empresa_idempresa ='$idempresa' ORDER BY iddespacho_producto DESC;");

            while ($qwe = $this->dbp->fetch($getPedido)) {
                $res = array(
                    "iddespacho_producto" => $qwe['iddespacho_producto'],
                    "cantidad" => $qwe['cantidad'],
                    "detalle_distribucion_iddetalle_distribucion" => $qwe['detalle_distribucion_iddetalle_distribucion'],
                    "almacen_producto_idalmacen_producto" => $qwe['almacen_producto_idalmacen_producto'],
                    "empresa_idempresa" => $qwe['empresa_idempresa']
                );
                array_push($lista, $res);
            }
        
            echo json_encode($lista, JSON_NUMERIC_CHECK);
        }
        
    public function anularDistribucion($iddistribucion){
        $consulta = $this->dbp->query("SELECT * FROM distribucion WHERE iddistribucion = '$iddistribucion'");
        $resultado = $consulta->fetch_assoc();
        $estadoCompra = $resultado['estado'];
        if($estadoCompra == 0){
            $edicionCompra = $this->dbp->query("UPDATE distribucion SET estado = '-1' WHERE iddistribucion = '$iddistribucion'");
            $res = array("success", "la  se anulo exitosamente","anularCompra");
        }elseif($estadoCompra == -1){
            $edicionCompra = $this->dbp->query("UPDATE distribucion SET estado = '0' WHERE iddistribucion = '$iddistribucion'");
            $res = array("success", "la  se activo exitosamente","anularCompra");
        }else{
            // $edicionCompra = $this->dbp->query("UPDATE compra SET estado = '-1' WHERE idcompra = '$idcompra'");
            // mostrar un mensaje indicando q no se puede editar esa compra
            $res = array("danger", "la compra no puede ser anulada","anularCompra");
        }
        echo json_encode($res);
    }


    public function actualizar_estado_distribucion($iddistribucion,$estado){
        // echo json_encode(array($idproveedor,$idempresa,"hola"));
    
        // $idempresa = $this->getidempresa($empresa);
            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];
    
            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $eliminadoOfinalizado = $this->dbp->query("UPDATE distribucion SET estado ='$estado' WHERE iddistribucion = '$iddistribucion'");
                // $registroProveedor = $this->dbp->query("DELETE FROM solicitud_material WHERE idsolicitud_material = '$idsolicitud'");
                if ($eliminadoOfinalizado === TRUE) {                                                                                                                                                    
                    $res = array("success", "se guardaron los cambios exitosamente","actualizar_estado_solicitud_material");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    public function getidTrabajador($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['trabajador_idtrabajador'];
    }  
}
?>