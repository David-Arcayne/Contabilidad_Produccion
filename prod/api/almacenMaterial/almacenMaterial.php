<?php
require_once "../../db/db.php";
class AlmacenMaterial extends DB{

public function listadoAlmacenMaterial($empresa){
    // echo json_encode(array($empresa,$idRegistro));
    $lista = [];
    $idempresa = $this->getidempresa($empresa);
    // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
    $getLista = $this->dbp->query("SELECT al.*,m.medida_idmedida,m.nombre_mat,m.codigo_mat,s.nombre_seccion 
                FROM almacen_material al
                INNER JOIN material m ON m.idmaterial = al.material_idmaterial
                INNER JOIN compra co ON co.idcompra = al.compra_idcompra
                INNER JOIN seccion s ON s.idseccion = m.seccion_idseccion
                WHERE al.empresa_idempresa = '$idempresa' ORDER BY al.idalmacen_material DESC;");
    
    while($qwe=$this->dbp->fetch($getLista)){
         $res=array("idalmacen_material"=>$qwe['idalmacen_material'],
         "cantidad"=>$qwe['cantidad'],
         "costo_unitario"=>$qwe['costo_unitario'],
         "peso_neto"=>$qwe['peso_neto'],
         "costo_envase"=>$qwe['costo_envase'],
         "cantidad_envases"=>$qwe['cantidad_envases'],
         "tipo_envase_idtipo_envase"=>$qwe['tipo_envase_idtipo_envase'],
         "fecha_caducidad"=>$qwe['fecha_caducidad'],
         "material_idmaterial"=>$qwe['material_idmaterial'],
         "codigo_mat"=>$qwe['codigo_mat'],
         "medida_idmedida"=>$qwe['medida_idmedida'],
         "proveedor_idproveedor"=>$qwe['proveedor_idproveedor'],
         "nombre_mat"=>$qwe['nombre_mat'],
         "compra_idcompra"=>$qwe['compra_idcompra'],
         "nombre_seccion"=>$qwe['nombre_seccion'],
         "empresa_idempresa"=>$qwe['empresa_idempresa'],
         "control_calidad_idcontrol_calidad"=>$qwe['control_calidad_idcontrol_calidad']); //'nombre' sale del formulario de input hidden
        array_push($lista,$res);
     }
     echo json_encode($lista,JSON_NUMERIC_CHECK);
}
public function listadoConfirmacionAlmacenMaterial($empresa){
    // echo json_encode(array($empresa,$idRegistro));
    $lista = [];
    $idempresa = $this->getidempresa($empresa);
    // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
    $getLista = $this->dbp->query("SELECT dtc.iddetalle_compra, dtc.precio_unitario, dtc.medida_idmedida, c.proveedor_idproveedor,dtc.fecha_venci,
 m.seccion_idseccion, s.nombre_seccion, dtcc.iddetalle_control_calidad
 FROM detalle_compra dtc
INNER JOIN compra c ON c.idcompra = dtc.compra_idcompra
INNER JOIN material m ON m.idmaterial = dtc.material_idmaterial
INNER JOIN seccion s ON s.idseccion = m.seccion_idseccion
INNER JOIN control_calidad cc ON cc.Entidad_id = c.idcompra
INNER JOIN detalle_control_calidad dtcc ON dtcc.control_calidad_idcontrol_calidad = cc.idcontrol_calidad
WHERE c.empresa_idempresa = '$idempresa'");
    
    while($qwe=$this->dbp->fetch($getLista)){
         $res=array("iddetalle_compra"=>$qwe['iddetalle_compra'],
         "precio_unitario"=>$qwe['precio_unitario'],
         "fecha_venci"=>$qwe['fecha_venci'],
         "medida_idmedida"=>$qwe['medida_idmedida'],
         "proveedor_idproveedor"=>$qwe['proveedor_idproveedor'],
         "seccion_idseccion"=>$qwe['seccion_idseccion'],
         "nombre_seccion"=>$qwe['nombre_seccion'],
         "iddetalle_control_calidad"=>$qwe['iddetalle_control_calidad']); //'nombre' sale del formulario de input hidden
        array_push($lista,$res);
     }
     echo json_encode($lista,JSON_NUMERIC_CHECK);
}
public function registrarSolicitudMaterial($idsolicitud_material,$fecha,$hora, $estado,$empresa_idempresa,$empleado_idempleado,$produccion_idproduccion,$detalles) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
$idempresa = $this->getidempresa($empresa_idempresa);
$idusuario = $this->getidTrabajador($empleado_idempleado);
// echo json_encode(array($idsolicitud_material,$fecha,$hora, $estado,$empresa_idempresa,$empleado_idempleado,$produccion_idproduccion,$detalles));
// ----------------------------------------------------------------------------------

if ($idsolicitud_material > 0) { // se puede editar
    // if($idgrupo == 0){
    //     $res = array("danger", "Ya existe un grupo con el mismo nombre","registrar_grupo_etapas_ordenados");
    // }else{
    // el grupo ya existe entonces solo añadimos las etapas
        foreach($detalles as $dt){
            $idDetalleSoli = $dt['iddetalle_solicitud_material'];
            // $idEstandarProduct = $dt['estandar_producto_idestandar_producto'];
            $cantidad = $dt['cantidad'];
            $observaciones = $dt['observaciones'];
            $material_idmaterial = $dt['material_idmaterial'];
        if($idDetalleSoli == 0){ //se añadio recien esa etapa
            $operacionesEtapas = $this->dbp->query("INSERT INTO detalle_solicitud_material(cantidad, observaciones, solicitud_material_idsolicitud_material, material_idmaterial) VALUES ('$cantidad','$observaciones','$idsolicitud_material','$material_idmaterial')");
        }else if($idDetalleSoli < 0){ // se elimina
            $auxIdEtapa = abs($idDetalleSoli); 
            $operacionesEtapas = $this->dbp->query("DELETE FROM detalle_solicitud_material WHERE iddetalle_solicitud_material='$auxIdEtapa'");
        }else{ //se actualiza
            $operacionesEtapas =  $this->dbp->query("UPDATE detalle_solicitud_material 
            SET cantidad = '$cantidad', observaciones = '$observaciones'
            WHERE iddetalle_solicitud_material='$idDetalleSoli'");
        }
        // }
        $res = array("success", "Operacion Exitosa","registrarSolicitudMaterial");
}
} elseif($idsolicitud_material == 0) { // se añadira nuevo registro
    // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
    // $registrarEstandar = $this->dbp->query("INSERT INTO estandar_producto(cantidad_producto, producto_idproducto, empresa_idempresa) VALUES ('$cantidad_producto','$producto_idproducto','$idempresa')");
    $registroSoli = $this->dbp->query("INSERT INTO solicitud_material(fecha,hora, estado,empresa_idempresa,empleado_idempleado,produccion_idproduccion) VALUES ('$fecha','$hora', '$estado','$idempresa','$idusuario','$produccion_idproduccion')");
    if ($registroSoli === TRUE) {
        $id_soli = $this->dbp->insert_id; 
    // $actualizarProduccion = $this->dbp->query("UPDATE produccion SET estado = '1' WHERE idproduccion='$produccion_idproduccion'");
    
    // $consultaProd = $this->dbp->query("SELECT lote_idlote FROM produccion WHERE idproduccion='$produccion_idproduccion'");
    //  $resultado = $consultaProd->fetch_assoc();
    // $idlote = $resultado['lote_idlote'];
    // $actualizarProduccion = $this->dbp->query("UPDATE lote SET estado = '1' WHERE idlote='$idlote'");
    // $id_soli = $this->dbp->insert_id; 
    foreach($detalles as $detalle){
    $cantidad = $detalle['cantidad'];
    $observaciones = $detalle['observaciones'];
    $material_idmaterial = $detalle['material_idmaterial'];
    // $id_estandar = $this->dbp->insert_id;  
    $registrarDetalleSoli = $this->dbp->query("INSERT INTO detalle_solicitud_material(cantidad, observaciones, solicitud_material_idsolicitud_material, material_idmaterial) VALUES ('$cantidad','$observaciones','$id_soli','$material_idmaterial')");
    }
    $res = array("success", "Registro exitoso","registrarSolicitudMaterial");
} else {
    $res = array("danger", "No se pudo registrar");
}
}
echo json_encode($res);

}
public function Listar_solicitud_material_produccion($empresa) {
    $lista = [];
    $idempresa = $this->getidempresa($empresa);
    
    // Consulta para listar las etapas de producción asociadas a una empresa
    $getLista = $this->dbp->query("SELECT s.*, l.rubro_idrubro 
FROM solicitud_material s
LEFT JOIN produccion p ON p.idproduccion = s.produccion_idproduccion
LEFT JOIN lote l ON l.idlote = p.lote_idlote WHERE s.empresa_idempresa='$idempresa' ORDER BY s.idsolicitud_material DESC;
");


    // Recorrer los resultados y agregarlos a la lista
    while ($etapa=$this->dbp->fetch($getLista)) {
        $res = array(
            "idsolicitud_material" => $etapa['idsolicitud_material'],
            "fecha" => $etapa['fecha'],
            "hora" => $etapa['hora'],
            "estado" => $etapa['estado'],
            "rubro_idrubro" => $etapa['rubro_idrubro'],
            "empleado_idempleado" => $etapa['empleado_idempleado'],
            "produccion_idproduccion" => $etapa['produccion_idproduccion'],
            "detalles" => []
        );
        $getLista2 = $this->dbp->query("SELECT * FROM detalle_solicitud_material WHERE solicitud_material_idsolicitud_material ='$etapa[idsolicitud_material]';
                    ");
        while ($qwe=$this->dbp->fetch($getLista2)) {
        $detalle = array(
            "iddetalle_solicitud_material" => $qwe['iddetalle_solicitud_material'],
            "cantidad" => $qwe['cantidad'],
            "observaciones" => $qwe['observaciones'],
            "solicitud_material_idsolicitud_material" => $qwe['solicitud_material_idsolicitud_material'],
            "material_idmaterial" => $qwe['material_idmaterial']
        );
        array_push($res['detalles'], $detalle);
    }
        array_push($lista, $res);
    }
    echo json_encode($lista);
}
public function editar_detalle_solicitud_material($id,$cantidad,$observaciones) {
                // Iniciar transacción
                $this->dbp->begin_transaction();
        
                try {
                    // Verificar si el producto está relacionado en alguna tabla
                    $relacionadas = [
                        'material_produccion' => 'No se puede editar porque hay registros en material_produccion',
                        // 'detalle_produccion' => 'No se puede eliminar porque hay registros en detalle_produccion',
                        // 'reproceso' => 'No se puede eliminar porque hay registros en reprocesamiento',
                    ];
                    
                    foreach ($relacionadas as $tabla => $mensaje) {
                        $query = "SELECT 1 FROM $tabla WHERE detalle_solicitud_material_iddetalle_solicitud_material = ?";
                        $stmt = $this->dbp->prepare($query);
                        if ($stmt === false) {
                            throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                        }
                        $stmt->bind_param("i", $id);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows > 0) {
                            throw new Exception($mensaje);
                        }
                        $stmt->close();
                    }
            
                        // Editar el detalle_solicitud_material
        
                        $query = "UPDATE detalle_solicitud_material
                                 SET cantidad = ?, observaciones=?
                                WHERE iddetalle_solicitud_material = ?";
                        $stmt = $this->dbp->prepare($query);
                        if ($stmt === false) {
                            throw new Exception("No se pudo preparar la consulta para eliminar el producto");
                        }
                        $stmt->bind_param("dsi", $cantidad,$observaciones,$id);
                        $stmt->execute();
                        $stmt->close();
            
                    // Confirmar transacción
                    $this->dbp->commit();
                    $res = array("success", "Se edito correctamente", "editar_detalle_solicitud_material");
            
                } catch (Exception $e) {
                    // Revertir transacción
                    $this->dbp->rollback();
                    $res = array("danger", $e->getMessage(), "editar_detalle_solicitud_material");
                }
// }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
        // $edicion = $this->dbp->query("UPDATE detalle_solicitud_material
        //                         SET cantidad = '$cantidad', observaciones='$observaciones'
        //                         WHERE iddetalle_solicitud_material = '$id';");
        // if ($edicion === TRUE) {                                                                                                                                                                
        //     $res = array("success", "Edición exitosa","editar_detalle_solicitud_material");
        // } else {
        //     $res = array("danger", "No se pudo editar");
        // }
    // }
    echo json_encode($res);
}
public function eliminar_detalle_solicitud_material($id){

            // Iniciar transacción
            $this->dbp->begin_transaction();
        
            try {
                // Verificar si el producto está relacionado en alguna tabla
                $relacionadas = [
                    'material_produccion' => 'No se puede eliminar porque hay registros en material_produccion',
                    // 'detalle_produccion' => 'No se puede eliminar porque hay registros en detalle_produccion',
                    // 'reproceso' => 'No se puede eliminar porque hay registros en reprocesamiento',
                ];
                
                foreach ($relacionadas as $tabla => $mensaje) {
                    $query = "SELECT 1 FROM $tabla WHERE detalle_solicitud_material_iddetalle_solicitud_material = ?";
                    $stmt = $this->dbp->prepare($query);
                    if ($stmt === false) {
                        throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                    }
                    $stmt->bind_param("i", $id);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    if ($result->num_rows > 0) {
                        throw new Exception($mensaje);
                    }
                    $stmt->close();
                }
        
                    // Eliminar el producto_produccion
    
                    $query = "DELETE FROM detalle_solicitud_material WHERE iddetalle_solicitud_material = ?";
                    $stmt = $this->dbp->prepare($query);
                    if ($stmt === false) {
                        throw new Exception("No se pudo preparar la consulta para eliminar el producto");
                    }
                    $stmt->bind_param("i", $id);
                    $stmt->execute();
                    $stmt->close();
        
                // Confirmar transacción
                $this->dbp->commit();
                $res = array("success", "Se eliminó correctamente", "eliminar_detalle_solicitud_material");
        
            } catch (Exception $e) {
                // Revertir transacción
                $this->dbp->rollback();
                $res = array("danger", $e->getMessage(), "eliminar_detalle_solicitud_material");
            }
        echo json_encode($res);
}
public function salida_material_produccion($id_dt_solMat,$cantidad,$idalmacen,$empresa){
    $idempresa = $this->getidempresa($empresa);
    // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa'");
    // $resultado = $consulta->fetch_assoc();
    // $totalRegistros = $resultado['total'];

    // if ($totalRegistros > 0) {
    //     $res = array("Error", "El registro ya existe","Error");
    // } else {
        // Insertar el nuevo registro
        $registroMatProd = $this->dbp->query("INSERT INTO material_produccion(cantidad,detalle_solicitud_material_iddetalle_solicitud_material,almacen_material_idalmacen_material, empresa_idempresa) VALUES ('$cantidad','$id_dt_solMat','$idalmacen',$idempresa)");
        if ($registroMatProd === TRUE) {  
             $consulta = $this->dbp->query("SELECT cantidad FROM almacen_material WHERE idalmacen_material = '$idalmacen'");
    $resultado = $consulta->fetch_assoc();
    $cantidadAlmacen = $resultado['cantidad'];
    $resta = $cantidadAlmacen - $cantidad;
            $registroMatProd = $this->dbp->query("UPDATE almacen_material SET cantidad = '$resta' WHERE idalmacen_material ='$idalmacen'");                                                                                                                                                                 
            $res = array("success", "Registro exitosooo","salida_material_produccion");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
    // }

    //   echo ($medida);
    echo json_encode($res);
    // echo json_encode($res);
    
}
public function lista_material_produccion($empresa) {
    $lista = [];
    $idempresa = $this->getidempresa($empresa);

    // Preparar la consulta
    $getPedido = $this->dbp->query("SELECT * FROM material_produccion WHERE empresa_idempresa ='$idempresa' ORDER BY idmaterial_produccion DESC;");

    while ($qwe = $this->dbp->fetch($getPedido)) {
        $res = array(
            "idmaterial_produccion" => $qwe['idmaterial_produccion'],
            "cantidad" => $qwe['cantidad'],
            "detalle_solicitud_material_iddetalle_solicitud_material" => $qwe['detalle_solicitud_material_iddetalle_solicitud_material'],
            "almacen_material_idalmacen_material" => $qwe['almacen_material_idalmacen_material'],
        );
        array_push($lista, $res);
    }

    echo json_encode($lista, JSON_NUMERIC_CHECK);
}
public function actualizar_estado_solicitud_material($idsolicitud,$estado){
    // echo json_encode(array($idproveedor,$idempresa,"hola"));

    // $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
        } else {
            // Insertar el nuevo registro
            $eliminadoOfinalizado = $this->dbp->query("UPDATE solicitud_material SET estado ='$estado' WHERE idsolicitud_material = '$idsolicitud'");
            // $registroProveedor = $this->dbp->query("DELETE FROM solicitud_material WHERE idsolicitud_material = '$idsolicitud'");
            if ($eliminadoOfinalizado === TRUE) {                                                                                                                                                    
                $res = array("success", "se guardaron los cambios exitosamente","actualizar_estado_solicitud_material");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
}

public function getidTrabajador($md5){
    $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
    $qwe=$this->dbrh->fetch($registro);
    return $qwe['trabajador_idtrabajador'];
}  
public function getidempresa($md5){
    $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
    $qwe=$this->dbe->fetch($registro);
    return $qwe['idorganizacion'];
} 
}

?>