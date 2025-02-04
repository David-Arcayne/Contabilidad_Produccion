<?php
require_once "../../db/db.php";
class Orden_produccion extends DB{

    public function registrar_OrdenProduccion($fecha_orp, $hora_orp, $estado,$rubro, $empresa, $empleado) {
        $idempresa = $this->getidempresa($empresa);
        
        $idempleado = $this->getidTrabajador($empleado);
      
            $query = "INSERT INTO orden_produccion (fecha_orp, hora_orp, estado, rubro_idrubro, empresa_idempresa,empleado_idempleado) VALUES (?, ?, ?, ?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_OrdenProduccion"));
                return;
            }
    
            $stmt->bind_param("ssiiii", $fecha_orp, $hora_orp, $estado, $rubro, $idempresa,$idempleado);
            $registro = $stmt->execute();
    
            if ($registro) {
                $idOrdenProduccion = $this->dbp->insert_id;  
                $res = array("ok", "Se registró correctamente", "registrar_OrdenProduccion" , $idOrdenProduccion);
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registrar_OrdenProduccion");
            }
    
            $stmt->close();
        
        echo json_encode($res);
    }

    public function registrar_detalleOrdenProduccion($cantidad, $observaciones, $orden_produccion_idorden_produccion, $producto_idproducto) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        // Verifica si la conexión es exitosa
        if ($this->dbp->connect_error) {
            die("Error de conexión: " . $this->dbp->connect_error);
        }
    
        $query = "INSERT INTO detalle_produccion (cantidad, observaciones, orden_produccion_idorden_produccion, producto_idproducto) VALUES (?, ?, ?, ?)";
        
        $stmt = $this->dbp->prepare($query);
        
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "Error" => $this->dbp->error, "debug" => debug_backtrace()));
            return;
        }
    
        if (!$stmt->bind_param("dsii", $cantidad, $observaciones, $orden_produccion_idorden_produccion, $producto_idproducto)) {
            echo json_encode(array("Error", "Error al vincular parámetros", "Error" => $stmt->error));
            return;
        }
    
        $registro = $stmt->execute();
        
        if ($registro) {
            $res = array("status" => "ok", "message" => "Se registró correctamente", "funcion" => "registrar_detalleOrdenProduccion");
        } else {
            $res = array("status" => "Error", "message" => "No se registró correctamente.", "detalle" => $stmt->error, "funcion" => "registrar_detalleOrdenProduccion");
        }
    
        $stmt->close();
        echo json_encode($res);
    } 
    
    public function mostrar_orden_produccion($idordenproduccion) {
        $lista = [];
        $detalles = [];
    
        // Consulta para obtener los detalles y las órdenes de producción
        $getLista = $this->dbp->query("SELECT 
            op.*,
            d.iddetalle_produccion,
            d.cantidad,
            d.observaciones,
            d.orden_produccion_idorden_produccion,
            d.producto_idproducto
        FROM 
            orden_produccion op
        LEFT JOIN 
            detalle_produccion d ON d.orden_produccion_idorden_produccion = op.idorden_produccion
        WHERE 
            op.idorden_produccion = '$idordenproduccion'");
    
        // Procesar resultados
        while($qwe = $this->dbp->fetch($getLista)) {
            if (!isset($res)) {
                $res = array(
                    "idorden_produccion" => $qwe['idorden_produccion'],
                    "fecha_orp" => $qwe['fecha_orp'],
                    "hora_orp" => $qwe['hora_orp'],
                    "estado" => $qwe['estado'],
                    "rubro_idrubro" => $qwe['rubro_idrubro'],
                    "empresa_idempresa" => $qwe['empresa_idempresa'],
                    "empleado_idempleado" => $qwe['empleado_idempleado'],
                    "detalles" => []
                );
            }
    
            $detalle = array(
                "iddetalle_produccion" => $qwe['iddetalle_produccion'],
                "cantidad" => $qwe['cantidad'],
                "observaciones" => $qwe['observaciones'],
                "orden_produccion_idorden_produccion" => $qwe['orden_produccion_idorden_produccion'],
                "producto_idproducto" => $qwe['producto_idproducto']
            );
            array_push($res['detalles'], $detalle);
        }
    
        echo json_encode($res, JSON_NUMERIC_CHECK);
    }
    public function mostrar_orden_produccionPor_empresa($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        // Consulta para obtener los detalles y las órdenes de producción
        $getLista = $this->dbp->query("SELECT op.* FROM  orden_produccion op WHERE op.empresa_idempresa = '$idempresa'");
    
        // Procesar resultados
        while($qwe = $this->dbp->fetch($getLista)) {
                $res = array(
                    "idorden_produccion" => $qwe['idorden_produccion'],
                    "fecha_orp" => $qwe['fecha_orp'],
                    "hora_orp" => $qwe['hora_orp'],
                    "estado" => $qwe['estado'],
                    "rubro_idrubro" => $qwe['rubro_idrubro'],
                    "empresa_idempresa" => $qwe['empresa_idempresa'],
                    "empleado_idempleado" => $qwe['empleado_idempleado']
                );
                array_push($lista,$res);
        }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function Editar_orden_produccion_lista_completa($cantidad, $observaciones, $producto_idproducto,$hola,$yelow) {
        // echo json_encode(array($cantidad, $observaciones, $producto_idproducto,$hola,$yelow));
        echo json_encode(array("hola", "como"));
        // $idempresa = $this->getidempresa($empresa);
        // if (0 > 0) {
        //     $res = array("danger", "El registro ya existe");
        // } else {
        //     // Insertar el nuevo registro
        //     $registroListaCompra = $this->dbcm->query("UPDATE proveedor
        //                             SET nombre = '$nombre',
        //                                 codigo = '$codigo',
        //                                 nit = '$nit',
        //                                 detalle = '$detalle',
        //                                 direccion = '$direccion',
        //                                 telefono = '$telefono',
        //                                 mobil = '$mobil',
        //                                 email = '$email',
        //                                 web = '$web',
        //                                 pais = '$pais',
        //                                 ciudad = '$ciudad',
        //                                 zona = '$zona',
        //                                 contacto = '$contacto'

        //                             WHERE id_proveedor = '$id';");
        //     if ($registroListaCompra === TRUE) {                                                                                                                                                                
        //         $res = array("success", "Edición exitosa");
        //     } else {
        //         $res = array("danger", "No se pudo registrar");
        //     }
        // }
        // echo json_encode($res);
    }

    public function Editar_detalle_produccion($detalles) {
        // echo json_encode(array($cantidad, $observaciones, $producto_idproducto,$hola));
        // echo json_encode(array($detalles));
        $lastIndex = count($detalles) - 1;
        // Iterar sobre cada detalle y realizar la operación necesaria

        foreach($detalles as $index => $detalle){
            // if ($index === $lastIndex) {
                // $aux = $detalle['orden_produccion_idorden_produccion'];
                // echo json_encode(array($detalle['orden_produccion_idorden_produccion']));
            // }else{
                $iddetalle_produccion = $detalle['iddetalle_produccion'];
                $cantidad = $detalle['cantidad'];
                $observaciones = $detalle['observaciones'];
                $orden_produccion_idorden_produccion = $detalle['orden_produccion_idorden_produccion'];
                $producto_idproducto = $detalle['producto_idproducto'];

                if($iddetalle_produccion == 0){
                    $insertarNuevoDetalle = $this->dbp->query("INSERT INTO detalle_produccion(cantidad, observaciones, orden_produccion_idorden_produccion, producto_idproducto) VALUES ('$cantidad','$observaciones','$orden_produccion_idorden_produccion','$producto_idproducto')");
    
                }else{
                    //solo edito los registros q ya existen
                    $editarDetallesExistentes = $this->dbp->query("UPDATE detalle_produccion
                    SET cantidad = '$cantidad',
                        observaciones = '$observaciones',
                        orden_produccion_idorden_produccion = '$orden_produccion_idorden_produccion',
                        producto_idproducto = '$producto_idproducto'

                    WHERE iddetalle_produccion = '$iddetalle_produccion';");
                }
            // }
            // echo json_encode(array($detalle['orden_produccion_idorden_produccion']));
        }
        if ($insertarNuevoDetalle === TRUE || $editarDetallesExistentes === TRUE) {                                                                                                                                                                                                      
            $res = array("success", "Edicion Exitosa...","Editar_orden_produccion_lista_completa");
        } else {
            $res = array("danger", "No se pudo Editar","Editar_orden_produccion_lista_completa");
        }
        echo json_encode($res);
    }
    public function cambiaEstadoOrdenProduccion($idordenProduccion,$estado){
        $cambiarEstado = $this->dbp->query("UPDATE orden_produccion 
                               SET estado = $estado WHERE idorden_produccion = '$idordenProduccion'");
        if($cambiarEstado === TRUE){
            $res = array("success","Edicion Exitosa","cambiaEstadoOrdenProduccion");
        } else {
            $res = array("danger", "No se pudo Editar","cambiaEstadoOrdenProduccion");
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