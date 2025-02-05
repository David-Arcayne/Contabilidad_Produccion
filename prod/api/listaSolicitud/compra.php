<?php
require_once "../../db/db.php";
class Compra extends DB{
    public function registrar_compras($idpedido,$lote,$fecha,$hora,$numReg,$total,$empleado,$proveedor_idproveedor,$empresa,$rubro,$detalles) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
    $idempresa = $this->getidempresa($empresa);
    $idusuario = $this->getidTrabajador($empleado);
        // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
        // $registrarEstandar = $this->dbp->query("INSERT INTO estandar_producto(cantidad_producto, producto_idproducto, empresa_idempresa) VALUES ('$cantidad_producto','$producto_idproducto','$idempresa')");
       
        $registroSoli = $this->dbp->query("INSERT INTO compra(lote,fecha,hora,num_registro,total,estado,empleado_idempleado,proveedor_idproveedor,empresa_idempresa,rubro_idrubro) VALUES ('$lote','$fecha','$hora','$numReg','$total','0','$idusuario','$proveedor_idproveedor','$idempresa','$rubro')");
        if ($registroSoli === TRUE) {
        $id_soli = $this->dbp->insert_id; 
        foreach($detalles as $detalle){
        $cantidad = $detalle['cantidad'];
        $cantidad_envase = $detalle['cantidad_envases'];
        $peso_neto = $detalle['peso_neto'];
        $total_precio = $detalle['total_precio'];
        $fecha_venci = $detalle['fecha_venci'];
        $material = $detalle['material_idmaterial'];
        $tipoEnvase = $detalle['tipo_envase_idtipo_envase'];
        // $id_estandar = $this->dbp->insert_id;  
        $registrarDetalleSoli = $this->dbp->query("INSERT INTO detalle_compra(cantidad, cantidad_envases, peso_neto,total_precio,fecha_venci,compra_idcompra, material_idmaterial,tipo_envase_idtipo_envase) VALUES ('$cantidad','$cantidad_envase','$peso_neto','$total_precio','$fecha_venci','$id_soli','$material','$tipoEnvase')");

        // $registrarDetalleSoli = $this->dbp->query("INSERT INTO detalle_estandar_producto(cantidad,estandar_producto_idestandar_producto,material_idmaterial) 
            // VALUES ('$cantidad','$observaciones','$id_soli','$material_idmaterial')");                                                                                                                                                                
        }
        if($idpedido > 0){
            $registroCompraPedido = $this->dbp->query("INSERT INTO compra_pedido(compra_idcompra,pedido_idpedido) VALUES ('$id_soli','$idpedido')");
            $editarPedido = $this->dbp->query("UPDATE pedido SET estado='1' WHERE idpedido='$idpedido'");
        }
        $res = array("success", "Registro exitoso","registrar_compras");
    } else {
        // $registroSoli = $this->dbp->query("INSERT INTO compra_pedido(compra_idcompra,pedido_idpedido) VALUES ('$id_soli','$idpedido')");
        $res = array("danger", "No se pudo registrar");
    }
    echo json_encode($res);
    }

    public function listar_compras($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM compra WHERE empresa_idempresa = '$idempresa' ORDER BY idcompra DESC;");
    
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "idcompra" => $etapa['idcompra'],
                "lote" => $etapa['lote'],
                "fecha" => $etapa['fecha'],
                "hora" => $etapa['hora'],
                "num_registro" => $etapa['num_registro'],
                "total" => $etapa['total'],
                "estado" => $etapa['estado'],
                "empleado_idempleado" => $etapa['empleado_idempleado'],
                "proveedor_idproveedor" => $etapa['proveedor_idproveedor'],
                "empresa_idempresa" => $etapa['empresa_idempresa'],
                "rubro_idrubro" => $etapa['rubro_idrubro'],
                "detalle" => []
            );
            $getLista2 = $this->dbp->query("SELECT * 
                        FROM detalle_compra 
                        WHERE compra_idcompra = '$etapa[idcompra]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "iddetalle_compra" => $qwe['iddetalle_compra'],
                "cantidad" => $qwe['cantidad'],
                "cantidad_envases" => $qwe['cantidad_envases'],
                "peso_neto" => $qwe['peso_neto'],
                "total_precio" => $qwe['total_precio'],
                "fecha_venci" => $qwe['fecha_venci'],
                "compra_idcompra" => $qwe['compra_idcompra'],
                "material_idmaterial" => $qwe['material_idmaterial'],
                "tipo_envase_idtipo_envase" => $qwe['tipo_envase_idtipo_envase']
            );
            array_push($res['detalle'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function eliminar_detalle_compra_material($iddetalle_compra){
        // echo json_encode(array($iddetalle_pedido,"hola"));
        // $idempresa = $this->getidempresa($empresa);
        $delete = $this->dbp->query("DELETE FROM detalle_compra WHERE iddetalle_compra = '$iddetalle_compra'");
        if($delete===TRUE){
            $res=array("success","Se elimino correctamente","eliminar_detalle_compra_material");
        }else{
            $res=array("danger","No se pudo eliminar","eliminar_detalle_compra_material");
        }
        echo json_encode($res);
    }

    public function registrar_detalle_compra_material($cantidad, $cantidad_envases, $peso_neto,$total_precio,$fecha_venci,$compra_idcompra,$material_idmaterial,$tipo_envase_idtipo_envase){
        //   $res = array($lote,$fechaVenci,$idpedido,$material,$tipoEnvase,$contenido,$medida,$cantidad,$empresa);
        // $total_precio = $cantidad * $precioUni;
        //  $idempresa = $this->getidempresa($empresa);

            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
                $comprarPorProveedor = $this->dbp->query("INSERT INTO detalle_compra(cantidad, cantidad_envases, peso_neto,total_precio,fecha_venci,compra_idcompra, material_idmaterial,tipo_envase_idtipo_envase) VALUES ('$cantidad', '$cantidad_envases', '$peso_neto','$total_precio','$fecha_venci','$compra_idcompra','$material_idmaterial','$tipo_envase_idtipo_envase')");
                if ($comprarPorProveedor === TRUE) {                                                                                                                                                                                                      
                    $res = array("success", "Registro exitoso","registrar_detalle_compra_material");
                } else {
                    $res = array("danger", "No se pudo registrar","registrar_detalle_compra_material");
                }
            }
              echo json_encode($res);
        }
    public function anularCompra($idcompra){
        $consulta = $this->dbp->query("SELECT * FROM compra WHERE idcompra = '$idcompra'");
        $resultado = $consulta->fetch_assoc();
        $estadoCompra = $resultado['estado'];
        if($estadoCompra == 0){
            $edicionCompra = $this->dbp->query("UPDATE compra SET estado = '-1' WHERE idcompra = '$idcompra'");
            $res = array("success", "la compra se anulo exitosamente","anularCompra");
        }elseif($estadoCompra == -1){
            $edicionCompra = $this->dbp->query("UPDATE compra SET estado = '0' WHERE idcompra = '$idcompra'");
            $res = array("success", "la compra se activo exitosamente","anularCompra");
        }else{
            // $edicionCompra = $this->dbp->query("UPDATE compra SET estado = '-1' WHERE idcompra = '$idcompra'");
            // mostrar un mensaje indicando q no se puede editar esa compra
            $res = array("danger", "la compra no puede ser anulada","anularCompra");
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