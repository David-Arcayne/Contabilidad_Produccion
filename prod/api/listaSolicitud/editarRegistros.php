<?php
require_once "../../db/db.php";
class EditarRegistros extends DB{
    // editarListaCompraSoli
    public function editarListaCompraSoli($id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$precio_unitario,$fecha_venci,$empresa){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
        //  echo json_encode(array($id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$precio_unitario,$fecha_venci,$empresa));

         $idempresa = $this->getidempresa($empresa);
        //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_pedido WHERE material_idmaterial = '$material'");
        //     $resultado = $consulta->fetch_assoc();
        //     $totalRegistros = $resultado['total'];

            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                 $totalSuma = $cantEnvase * $precio_unitario;
                // $registroListaCompra = $this->dbp->query("INSERT INTO detalle_pedido(cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida,empresaId) VALUES ('$cantEnvase',null,'$material','$tipoEnvase','$contenidoEnvase',' $totalSuma','$medida','$idempresa')");
                // if ($registroListaCompra === TRUE) {                                                                                                                                                                
                //     $res = array("success", "Registro exitosooo", $idempresa);
                // } else {
                //     $res = array("danger", "No se pudo registrar");
                // }
                $registroListaCompra = $this->dbp->query("UPDATE detalle_compra
                SET cantidad = '$cantEnvase',
                contenido = '$contenidoEnvase',
                precio_unitario = '$precio_unitario',
                total_precio = '$totalSuma',
                fecha_venci = '$fecha_venci',
                material_idmaterial = '$material',
                tipo_envase_idtipo_envase = '$tipoEnvase',
                medida_idmedida = '$medida'
                WHERE iddetalle_compra = '$id';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","edicionCaracteristica");
                } else {
                $res = array("danger", "No se pudo editar",$id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa);
                }
            } //cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida
            echo json_encode($res);
        }
        public function editarListaCompraSoli_Edicion($id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$precio_unitario,$fecha_venci,$empresa){
             $idempresa = $this->getidempresa($empresa);
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                     $totalSuma = $cantEnvase * $precio_unitario;
                    $registroListaCompra = $this->dbp->query("UPDATE detalle_compra
                    SET cantidad = '$cantEnvase',
                    contenido = '$contenidoEnvase',
                    precio_unitario = '$precio_unitario',
                    total_precio = '$totalSuma',
                    fecha_venci = '$fecha_venci',
                    material_idmaterial = '$material',
                    tipo_envase_idtipo_envase = '$tipoEnvase',
                    medida_idmedida = '$medida'
                    WHERE iddetalle_compra = '$id';");
                    if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","edicionCaracteristica");
                    } else {
                    $res = array("danger", "No se pudo editar",$id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa);
                    }
                } //cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida
                echo json_encode($res);
            }
    
            public function editarRegistroCompra($id,$lote,$proveedor, $idcompra, $empresa) {
                // echo json_encode(array($fecha,$hora,$empresa));
                    // echo json_encode(array($lote,$fechaReg, $hora,$totalSuma,$idpedido,$proveedor, $empresa));
    
                $idempresa = $this->getidempresa($empresa);
                // $idusuario = $this->getidTrabajador($usuario);
                 $haynulos = $this->dbp->query("SELECT EXISTS (SELECT 1 FROM detalle_compra WHERE compra_idcompra = '$idcompra') AS hay_materiales;");
                 $fila = $haynulos->fetch_assoc();
    
                 if ($fila['hay_materiales'] == 1) {
                // Insertar el nuevo registro en la tabla "pedido"
                    if($proveedor === null){
                        $editarRegistroCompra = $this->dbp->query("UPDATE compra SET lote = '$lote'
                  WHERE idcompra = '$id'");
                    }else{
                        $editarRegistroCompra = $this->dbp->query("UPDATE compra SET lote = '$lote',
                        proveedor_idproveedor = '$proveedor' 
                  WHERE idcompra = '$id'");
                    }
            
                    if ($editarRegistroCompra === TRUE) {

                        $res = array("success", "Registro exitoso");
                    } else {
                        $res = array("danger", "No se pudo registrar",$id,$lote,$proveedor, $idcompra, $empresa);
                    }
                }else{
                    $res = array("danger", "la lista esta vacia");
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