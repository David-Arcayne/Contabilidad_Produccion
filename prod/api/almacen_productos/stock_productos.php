<?php
require_once "../../db/db.php";
class Stock_productos extends DB{
public function registrarStockProductos($cantidad,$costo_unitario,$empresa,$idlote,$idcontrolCalidad,$idproducto) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    //cantidad_envases,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase.......    
        // echo json_encode(array($cantidad,$costo_unitario, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$seccion_idseccion,$compra_idcompra));
        $idempresa = $this->getidempresa($empresa);
        // $idusuario = $this->getidTrabajador($empleado_idempleado);

        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El numero_documento ya existe");
        }else{
           $registroCompra = $this->dbp->query("INSERT INTO almacen_producto(cantidad,costo_unitario,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,producto_idproducto) VALUES ('$cantidad','$costo_unitario','$idempresa', '$idlote','$idcontrolCalidad','$idproducto')");
   
            if ($registroCompra === TRUE) {
                $id = $this->dbp->insert_id;  

                 $this->dbp->query("UPDATE control_calidad SET estado = '1' WHERE idcontrol_calidad = '$idcontrolCalidad'");
                $res = array("success", "Registro exitoso","registrarStockProductos",$id);
            } else {
                $res = array("danger", "No se pudo registrar",$cantidad,$costo_unitario,$empresa,$idlote,$idcontrolCalidad,$idproducto);
            }
        }
        echo json_encode($res);
    }
    public function listadoAlmacenProducto($empresa){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // echo json_encode(array($empresa,$idRegistro));
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
        $getLista = $this->dbp->query("SELECT *
                    FROM almacen_producto al
                    WHERE al.empresa_idempresa = '$idempresa' ORDER BY al.idalmacen_producto DESC;");
        
        while($qwe=$this->dbp->fetch($getLista)){

             $productoProduccion = $this->dbp->query("SELECT * FROM producto WHERE idproduct_comercial='$qwe[producto_idproducto]';");
             $resultado333 = $productoProduccion->fetch_assoc();
             $idrubro = $resultado333['rubro_idrubro'];

             $productoComercial = $this->dbcm->query("SELECT *
             FROM productos
             WHERE id_productos = '$qwe[producto_idproducto]';");
            $resultado33 = $productoComercial->fetch_assoc();
            $nombre = $resultado33['nombre'];
            $codigo = $resultado33['codigo'];
            $idmedida = $resultado33['unidad_id_unidad'];

            $nombremedida = $this->dbcm->query("SELECT nombre
            FROM unidad
            WHERE id_unidad = '$idmedida';");
            $resultado44 = $nombremedida->fetch_assoc();
            $nombreMed = $resultado44['nombre'];

            $nombrerubro = $this->dbp->query("SELECT nombre_rubro
            FROM rubro
            WHERE idrubro = '$idrubro';");
            $resultado55 = $nombrerubro->fetch_assoc();
            $nombreRubro = $resultado55['nombre_rubro'];
            
             $res=array("idalmacen_producto"=>$qwe['idalmacen_producto'],
             "cantidad"=>$qwe['cantidad'],
             "costo_unitario"=>$qwe['costo_unitario'],
             "empresa_idempresa"=>$qwe['empresa_idempresa'],
             "lote_idlote"=>$qwe['lote_idlote'],
             "control_calidad_idcontrol_calidad"=>$qwe['control_calidad_idcontrol_calidad'],
             "producto_idproducto"=>$qwe['producto_idproducto'],
             "producto"=>$nombre,
             "codigo"=>$codigo,
             "unidad_id_unidad"=>$idmedida,
             "medida" => $nombreMed,
             "rubro_idrubro" =>$idrubro,
             "rubro" =>$nombreRubro
            );
            array_push($lista,$res);
         }
         echo json_encode($lista,JSON_NUMERIC_CHECK);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }  
}

?>