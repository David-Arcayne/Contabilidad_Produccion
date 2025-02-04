<?php
require_once "../../db/db.php";
class Devoluciones extends DB{
public function registrar_devolucion_compra($cantidad_envase,$peso_neto,$idtipo_envase,$cantidad,$costo_unitario,$costo_envase, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$compra_idcompra) {
    //cantidad_envases,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase.......    
        // echo json_encode(array($cantidad,$costo_unitario, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$seccion_idseccion,$compra_idcompra));
        $idempresa = $this->getidempresa($empresa_idempresa);
        // $idusuario = $this->getidTrabajador($empleado_idempleado);

        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El numero_documento ya existe");
        }else{
           $registroCompra = $this->dbp->query("INSERT INTO devolucion_compra(cantidad_envases,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase, fecha_caducidad,proveedor_idproveedor,empresa_idempresa,control_calidad_idcontrol_calidad,compra_idcompra,material_idmaterial) VALUES ('$cantidad_envase','$peso_neto','$idtipo_envase','$cantidad','$costo_unitario','$costo_envase', '$fecha_caducidad','$proveedor_idproveedor','$idempresa','$control_calidad_idcontrol_calidad','$compra_idcompra','$material_idmaterial')");
   
            if ($registroCompra === TRUE) {
                $id = $this->dbp->insert_id;  

                 $this->dbp->query("UPDATE control_calidad SET estado = '1' WHERE idcontrol_calidad = '$control_calidad_idcontrol_calidad'");
                $res = array("success", "Registro exitoso","registrar_devolucion_compra",$id);
            } else {
                $res = array("danger", "No se pudo registrar",$cantidad,$costo_unitario, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$seccion_idseccion,$compra_idcompra);
            }
        }
        echo json_encode($res);
    }

    public function registrar_devolucion_produccion($cantidad,$costo_unitario, $control_calidad_idcontrol_calidad,$idlote,$idproducto,$empresa_idempresa) {
        //cantidad_envases,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase.......    
            // echo json_encode(array($cantidad,$costo_unitario, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$seccion_idseccion,$compra_idcompra));
            $idempresa = $this->getidempresa($empresa_idempresa);
            // $idusuario = $this->getidTrabajador($empleado_idempleado);
    
            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];
    
            if (0 > 0) {
                $res = array("danger", "El numero_documento ya existe");
            }else{
                //                                         $cantidad,$costo_unitario, $control_calidad_idcontrol_calidad,$idlote,$idproducto,$empresa_idempresa
               $registroCompra = $this->dbp->query("INSERT INTO devolucion_produccion(cantidad,costo_unitario,control_calidad_idcontrol_calidad, lote_idlote,producto_idproducto,empresa_idempresa) VALUES ('$cantidad','$costo_unitario', '$control_calidad_idcontrol_calidad','$idlote','$idproducto','$idempresa')");
       
                if ($registroCompra === TRUE) {
                    $id = $this->dbp->insert_id;  
    
                     $this->dbp->query("UPDATE control_calidad SET estado = '1' WHERE idcontrol_calidad = '$control_calidad_idcontrol_calidad'");
                    $res = array("success", "Registro exitoso","registrar_devolucion_compra",$id);
                } else {
                    $res = array("danger", "No se pudo registrar",$cantidad,$costo_unitario, $control_calidad_idcontrol_calidad,$idlote,$idproducto,$empresa_idempresa);
                }
            }
            echo json_encode($res);
        }

        public function listado_devolucion_produccion($empresa){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT *
                        FROM devolucion_produccion dp
                        WHERE dp.empresa_idempresa = '$idempresa' ORDER BY dp.iddevolucion_produccion DESC;");
            
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
                
                 $res=array("iddevolucion_produccion"=>$qwe['iddevolucion_produccion'],
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

        public function listado_devolucion_compra($empresa){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT dc.*,m.medida_idmedida,m.nombre_mat,m.codigo_mat,s.nombre_seccion 
                        FROM devolucion_compra dc
                        INNER JOIN material m ON m.idmaterial = dc.material_idmaterial
                        INNER JOIN compra co ON co.idcompra = dc.compra_idcompra
                        INNER JOIN seccion s ON s.idseccion = m.seccion_idseccion
                        WHERE dc.empresa_idempresa = '$idempresa' ORDER BY dc.iddevolucion_compra DESC;");
            
            while($qwe=$this->dbp->fetch($getLista)){
                 $res=array("iddevolucion_compra"=>$qwe['iddevolucion_compra'],
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
        public function getidempresa($md5){
            $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
            $qwe=$this->dbe->fetch($registro);
            return $qwe['idorganizacion'];
        }  
    }
    ?>