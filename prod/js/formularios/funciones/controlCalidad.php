<?php
require_once "../../db/db.php";
class ControlCalidad extends DB{
     //  fecha_cc	hora_cc	num_doc	Entidad_tipo	Entidad_id	empresa_idempresa	empleado_idempleado	
 
        public function registrarControlCalidad($fecha_cc,$hora_cc, $num_doc,$Entidad_tipo,$Entidad_id,$empresa_idempresa,$empleado_idempleado) {

            $idempresa = $this->getidempresa($empresa_idempresa);
            $idusuario = $this->getidTrabajador($empleado_idempleado);

            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];

            if ($totalRegistros > 0) {
                $res = array("danger", "El numero_documento ya existe");
            }else{
               $registroCompra = $this->dbp->query("INSERT INTO control_calidad(fecha_cc,hora_cc, num_doc,Entidad_tipo,Entidad_id,empresa_idempresa,empleado_idempleado) VALUES ('$fecha_cc','$hora_cc', '$num_doc','$Entidad_tipo','$Entidad_id','$idempresa','$idusuario')");

        
                if ($registroCompra === TRUE) {
                    $id = $this->dbp->insert_id;  

                    $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso","registrarControlCalidad",$id);
                } else {
                    $res = array("danger", "No se pudo registrar",$fecha_cc,$hora_cc, $num_doc,$Entidad_tipo,$Entidad_id,$empresa_idempresa,$empleado_idempleado);
                }
            }
            echo json_encode($res);
        }
        public function registrarDetalleControlCalidad($cantidad, $entidad_tipo,$entidad_id,$control_calidad_idcontrol_calidad) {

            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];

            if (0 > 0) {
                $res = array("danger", "El numero_documento ya existe");
            }else{
               $registroControl = $this->dbp->query("INSERT INTO detalle_control_calidad(cantidad, entidad_tipo,entidad_id,control_calidad_idcontrol_calidad) VALUES ('$cantidad', '$entidad_tipo','$entidad_id','$control_calidad_idcontrol_calidad')");

        
                if ($registroControl === TRUE) {
                    // $id = $this->dbp->insert_id;  

                    // $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar",$cantidad, $entidad_tipo,$entidad_id,$control_calidad_idcontrol_calidad);
                }
            }
            echo json_encode($res);
        }
        public function listadoDetalleControlCalidad($empresa, $idcontrolCalidad){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT *
            FROM detalle_control_calidad AS d
            INNER JOIN control_calidad AS c ON d.control_calidad_idcontrol_calidad = c.idcontrol_calidad
              WHERE c.empresa_idempresa = '$idempresa'");
            while($qwe=$this->dbp->fetch($getLista)){
                 $res=array(
                    "iddetalle_control_calidad"=>$qwe['iddetalle_control_calidad'],
                    "cantidad"=>$qwe['cantidad'],
                    "entidad_tipo"=>$qwe['entidad_tipo'],
                    "entidad_id"=>$qwe['entidad_id'],
                    "estado"=>$qwe['estado'],
                    "control_calidad_idcontrol_calidad"=>$qwe['control_calidad_idcontrol_calidad']); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
             echo json_encode($lista);
        }
        public function listadoControlCalidad($empresa){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            $getLista = $this->dbp->query("SELECT e.idcontrol_calidad,e.fecha_cc,e.hora_cc,e.num_doc,e.Entidad_tipo,e.Entidad_id,e.estado,e.empleado_idempleado FROM control_calidad e WHERE empresa_idempresa = '$idempresa'");
             while($qwe=$this->dbp->fetch($getLista)){
                 $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"num_docu"=>$qwe[3],"entidadTipo"=>$qwe[4],"entidadId"=>$qwe[5],"estado"=>$qwe[6],"empleado"=>$qwe[7]); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
             echo json_encode($lista);
        }
        public function registrar_evaluacion_caracteristicas($evaluacion,$detalle, $idcaracteristicas,$idcriterio_cc) {

            // $idempresa = $this->getidempresa($empresa_idempresa);
            // $idusuario = $this->getidTrabajador($empleado_idempleado);

            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];

            if (0 > 0) {
                $res = array("danger", "El numero_documento ya existe");
            }else{
               $registroCompra = $this->dbp->query("INSERT INTO evaluacion_caracteristica(evaluacion,detalle,caracteristicas_idcaracteristicas,criterio_control_calidad_idcriterio_control_calidad) VALUES ('$evaluacion','$detalle','$idcaracteristicas','$idcriterio_cc')");

        
                if ($registroCompra === TRUE) {
                    $id = $this->dbp->insert_id;  

                    // $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar",$evaluacion,$detalle, $idcaracteristicas,$idcriterio_cc);
                }
            }
            echo json_encode($res);
        }
        public function registrar_criterio_controlCalidad($calificacion,$observaciones, $peso_bruto,$peso_envase,$peso_neto, $cantidad,$idDetalle_controlCalidad) {

            // $idempresa = $this->getidempresa($empresa_idempresa);
            // $idusuario = $this->getidTrabajador($empleado_idempleado);

            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];
            $consulta = $this->dbp->query("SELECT DISTINCT dt.cantidad 
                                            FROM detalle_control_calidad dt 
                                            INNER JOIN criterio_control_calidad cr 
                                            ON cr.detalle_control_calidad_iddetalle_control_calidad = dt.iddetalle_control_calidad
                                            WHERE dt.iddetalle_control_calidad = '$idDetalle_controlCalidad';
                                            ");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['cantidad'];
            $nuevaCantidad = $totalRegistros - $cantidad;
            if ($cantidad > $totalRegistros) {
                $res = array("danger", "La Cantidad ingresada sobre pasa el limite");
            }else{
               $registroCompra = $this->dbp->query("INSERT INTO criterio_control_calidad(calificacion,observaciones, peso_bruto,peso_envase,peso_neto, cantidad,detalle_control_calidad_iddetalle_control_calidad) VALUES ('$calificacion','$observaciones', '$peso_bruto','$peso_envase','$peso_neto', '$cantidad','$idDetalle_controlCalidad')");

        
                if ($registroCompra === TRUE) {
                    $id = $this->dbp->insert_id;  
                    // Actualizar la tabla "detalle_pedido" con el ID del pedido
                    $this->dbp->query("UPDATE detalle_control_calidad SET cantidad = $nuevaCantidad WHERE iddetalle_control_calidad = '$idDetalle_controlCalidad'");

                    // $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso","registrar_criterio_controlCalidad",$id);
                } else {
                    $res = array("danger", "No se pudo registrar",$calificacion,$observaciones, $peso_bruto,$peso_envase,$peso_neto, $cantidad,$idDetalle_controlCalidad);
                }
            }
            echo json_encode($res);
        }

        public function listadoEvaluacionCaracteristicas($empresa){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT e.* FROM evaluacion_caracteristica AS e
                INNER JOIN caracteristicas AS c ON c.idcaracteristicas = e.caracteristicas_idcaracteristicas
                WHERE empresa_idempresa = '$idempresa';");
            while($qwe=$this->dbp->fetch($getLista)){
                 $res=array("idevaluacion_caracteristica"=>$qwe[0],"evaluacion"=>$qwe[1],"detalle"=>$qwe[2],"caracteristicas_idcaracteristicas"=>$qwe[3],"criterio_control_calidad_idcriterio_control_calidad"=>$qwe[4]); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
             echo json_encode($lista);
        }

        public function listadoCriterio($empresa){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT DISTINCT cr.*
                    FROM criterio_control_calidad AS cr
                    INNER JOIN evaluacion_caracteristica AS e ON e.criterio_control_calidad_idcriterio_control_calidad = cr.idcriterio_control_calidad
                    INNER JOIN caracteristicas AS c ON c.idcaracteristicas = e.caracteristicas_idcaracteristicas
                    WHERE empresa_idempresa = '$idempresa';");
            while($qwe=$this->dbp->fetch($getLista)){
                 $res=array("idcriterio_control_calidad"=>$qwe[0],"calificacion"=>$qwe[1],"observaciones"=>$qwe[2],"peso_bruto"=>$qwe[3],"peso_envase"=>$qwe[4],"peso_neto"=>$qwe[5],"cantidad"=>$qwe[6],"detalle_control_calidad_iddetalle_control_calidad"=>$qwe[7]); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
             echo json_encode($lista);
        }

        // public function editarListaCompraSoli($id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$precio_unitario,$fecha_venci,$empresa){
        //     // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        //     // echo json_encode($res);
        //     //  echo json_encode(array($id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$precio_unitario,$fecha_venci,$empresa));
    
        //      $idempresa = $this->getidempresa($empresa);
        //     //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_pedido WHERE material_idmaterial = '$material'");
        //     //     $resultado = $consulta->fetch_assoc();
        //     //     $totalRegistros = $resultado['total'];
    
        //         if (0 > 0) {
        //             $res = array("danger", "El registro ya existe");
        //         } else {
        //             // Insertar el nuevo registro
        //              $totalSuma = $cantEnvase * $precio_unitario;
        //             // $registroListaCompra = $this->dbp->query("INSERT INTO detalle_pedido(cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida,empresaId) VALUES ('$cantEnvase',null,'$material','$tipoEnvase','$contenidoEnvase',' $totalSuma','$medida','$idempresa')");
        //             // if ($registroListaCompra === TRUE) {                                                                                                                                                                
        //             //     $res = array("success", "Registro exitosooo", $idempresa);
        //             // } else {
        //             //     $res = array("danger", "No se pudo registrar");
        //             // }
        //             $registroListaCompra = $this->dbp->query("UPDATE detalle_control_calidad
        //             SET cantidad = '$cantEnvase',
        //             medida_idmedida = '$medida'
        //             WHERE iddetalle_compra = '$id';");
        //             if ($registroListaCompra === TRUE) {                                                                                                                                                                
        //             $res = array("success", "Edición exitosa","edicionCaracteristica");
        //             } else {
        //             $res = array("danger", "No se pudo editar",$id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa);
        //             }
        //         } //cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida
        //         echo json_encode($res);
        //     }
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