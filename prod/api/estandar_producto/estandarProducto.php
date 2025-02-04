<?php
require_once "../../db/db.php";
class EstandarProducto extends DB{ 

public function registrar_detalle_estandar_producto2($cantidad,$idproducto,$material){
    // $idempresa = $this->getidempresa($empresa);
    $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_estandar_producto WHERE material_idmaterial = '$material' AND producto_idproducto ='$idproducto'");
    $resultado = $consulta->fetch_assoc();
    $totalRegistros = $resultado['total'];
    
    if ($totalRegistros > 0) {
        $res = array("danger", "El registro ya existe","registrar_detalle_estandar_producto2");
    } 
    else {
        // Insertar el nuevo registro
        $registroProveedor = $this->dbp->query("INSERT INTO detalle_estandar_producto(cantidad,producto_idproducto,material_idmaterial) VALUES ('$cantidad','$idproducto','$material')");
        if ($registroProveedor === TRUE) {     
            // $id = $this->dbp->insert_id;                                                                                                                                                             
            $res = array("success", "Registro exitoso","registrar_detalle_estandar_producto2");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
    }

    echo json_encode($res);
    // echo json_encode($res);
    
}
public function editar_detalle_estandar_producto2($iddetalleEstandar,$cantidad,$material){

        $registroProveedor = $this->dbp->query("UPDATE detalle_estandar_producto SET cantidad = '$cantidad',
									material_idmaterial = '$material'
                    WHERE iddetalle_estandar_producto = '$iddetalleEstandar';");
        if ($registroProveedor === TRUE) {     
            // $id = $this->dbp->insert_id;                                                                                                                                                             
            $res = array("success", "Edicion exitosa","editar_detalle_estandar_producto2");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
    // }

    echo json_encode($res);
    // echo json_encode($res);
    
}
    
    public function editar_etapa_produccion($idetapas_produccion, $nombre_etapa, $detalle, $rubro_idrubro, $seccion_idseccion, $empresa) {
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe una etapa de producción con el mismo nombre pero con un ID diferente
        $consulta = $this->dbp->query("SELECT COUNT(*) AS count FROM etapas_produccion WHERE nombre_etapa = '$nombre_etapa' AND idetapas_produccion != '$idetapas_produccion' AND empresa_idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['count'];
        // Si ya existe una etapa de producción con el mismo nombre para la empresa, se envía un mensaje de error
        if ($totalRegistros > 0) {
            $res = array("danger", "Ya existe una etapa de producción con el mismo nombre", "editar_etapa_produccion");
        } else {
            // Si no existe, proceder con la actualización
            $editar = $this->dbp->query("UPDATE etapas_produccion SET nombre_etapa = '$nombre_etapa', detalle = '$detalle', rubro_idrubro = '$rubro_idrubro', seccion_idseccion = '$seccion_idseccion', empresa_idempresa = '$idempresa' WHERE idetapas_produccion = '$idetapas_produccion'");
    
            if ($editar) {
                $res = array("success", "Se guardaron los cambios correctamente", "editar_etapa_produccion");
            } else {
                $res = array("danger", "No se pudieron guardar los cambios correctamente: ", "editar_etapa_produccion");
            }
        }
    
        echo json_encode($res);
    } 
    
    public function listar_estandares_producto_material($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM estandar_producto WHERE empresa_idempresa = '$idempresa';");
        
        // Recorrer los resultados y agregarlos a la lista
        while ($dtEstandar=$this->dbp->fetch($getLista)) {
            $res = array(
                "idestandar_producto" => $dtEstandar['idestandar_producto'],
                "cantidad_producto" => $dtEstandar['cantidad_producto'],
                "producto_idproducto" => $dtEstandar['producto_idproducto'],
                "detalle" => []
            );
            $getLista2 = $this->dbp->query("SELECT * FROM detalle_estandar_producto WHERE estandar_producto_idestandar_producto='$dtEstandar[idestandar_producto]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "iddetalle_estandar_producto" => $qwe['iddetalle_estandar_producto'],
                "cantidad" => $qwe['cantidad'],
                "estandar_producto_idestandar_producto" => $qwe['estandar_producto_idestandar_producto'],
                "material_idmaterial" => $qwe['material_idmaterial']
            );
            array_push($res['detalle'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listar_detalle_estandar($idproducto){
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
         $getPedido = $this->dbp->query("SELECT iddetalle_estandar_producto,cantidad,producto_idproducto,material_idmaterial FROM detalle_estandar_producto WHERE producto_idproducto = '$idproducto'");

        while($qwe=$this->dbp->fetch($getPedido)){
             $res=array("iddetalle_estandar_producto"=>$qwe['iddetalle_estandar_producto'],"cantidad"=>$qwe['cantidad'],"producto_idproducto"=>$qwe['producto_idproducto'],"material_idmaterial"=>$qwe['material_idmaterial']); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function eliminar_detalleEstandar($iddetalle_estandar){
        // echo json_encode(array($iddetalle_pedido,"hola"));
        $delete = $this->dbp->query("DELETE FROM detalle_estandar_producto WHERE iddetalle_estandar_producto = '$iddetalle_estandar'");
        if($delete===TRUE){
            $res=array("success","Se elimino correctamente");
        }else{
            $res=array("danger","No se pudo eliminar");
        }
        echo json_encode($res);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
}
?>