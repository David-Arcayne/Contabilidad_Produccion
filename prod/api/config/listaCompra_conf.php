<?php
require_once "../../db/db.php";
class ListaCompra_conf extends DB{

    public function registrar_listaCompra($cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa){
        $idempresa = $this->getidempresa($empresa);
         $consulta2 = $this->dbcm->query("SELECT * FROM unidad WHERE nombre = '$medida' AND id_empresa ='$idempresa'");
         $resultado = $consulta2->fetch_assoc();
            $id_medida = $resultado['id_unidad'];

            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $totalSuma = $cantEnvase * $contenidoEnvase;
                $registroListaCompra = $this->dbp->query("INSERT INTO detalle_pedido(cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida,empresaId) VALUES ('$cantEnvase',null,'$material','$tipoEnvase','$contenidoEnvase',' $totalSuma','$id_medida','$idempresa')");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso", $idempresa);
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }

        public function registrar_pedidoCompra($fecha, $hora,$usuario, $empresa) {
            $idempresa = $this->getidempresa($empresa);
            $idusuario = $this->getidTrabajador($usuario);
            // echo json_encode(array($fecha, $hora,$idusuario, $idempresa));

             $haynulos = $this->dbp->query("SELECT EXISTS (SELECT 1 FROM detalle_pedido WHERE pedido_idpedido IS NULL) AS hay_nulos;");
             $fila = $haynulos->fetch_assoc();

             if ($fila['hay_nulos'] == 1) {
            // Insertar el nuevo registro en la tabla "pedido"

                $registroListaCompra = $this->dbp->query("INSERT INTO pedido (fecha_p, hora, estado, empresa_idempresa, empleado_idempleado) VALUES ('$fecha', '$hora', '0', '$idempresa', '$idusuario')");
        
                if ($registroListaCompra === TRUE) {
                    // Obtener el ID del último pedido registrado
                    $idPedidoResult = $this->dbp->query("SELECT idpedido FROM pedido ORDER BY idpedido DESC LIMIT 1");
                    $idPedidoRow = $idPedidoResult->fetch_assoc();
                    $idPedido = $idPedidoRow['idpedido'];
            
                    // Actualizar la tabla "detalle_pedido" con el ID del pedido
                    $this->dbp->query("UPDATE detalle_pedido SET pedido_idpedido = '$idPedido' WHERE pedido_idpedido IS NULL AND empresaId = '$idempresa'");
            
                    $res = array("success", "Registro exitoso", $idusuario);
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }else{
                $res = array("danger", "la lista esta vacia");
            }
           
        
            echo json_encode($res);
        }
    public function listar_listaCompra($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getLista = $this->dbp->query("SELECT  e.iddetalle_pedido,e.cantidad,e.contenido_envase,e.total_material,e.material_idmaterial,e.tipo_envase_idtipo_envase,e.medida_idmedida FROM detalle_pedido as e WHERE pedido_idpedido IS NULL AND e.empresaId = '$idempresa'");
         while($qwe=$this->dbp->fetch($getLista)){ 
             $res=array("id"=>$qwe[0],"cantidadEnvase"=>$qwe[1],"contenidoEnvase"=>$qwe[2],"total_material"=>$qwe[3],"material"=>$qwe[4],"tipoEnvase"=>$qwe[5],"medida"=>$qwe[6]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
         echo json_encode($lista);
    }

    public function listar_PedidoCompra($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
         $getPedido = $this->dbp->query("SELECT e.idpedido,e.fecha_p,e.hora,e.estado,e.empleado_idempleado FROM pedido as e WHERE empresa_idempresa = '$idempresa'");

        while($qwe=$this->dbp->fetch($getPedido)){
             $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }

          echo json_encode($lista);
    }
    public function eliminar_listaCompra($iddetalle_pedido,$empresa){
        // echo json_encode(array($iddetalle_pedido,"hola"));
        $idempresa = $this->getidempresa($empresa);
        $delete = $this->dbp->query("DELETE FROM detalle_pedido WHERE iddetalle_pedido = '$iddetalle_pedido'");
        if($delete===TRUE){
            $res=array("ok","Se elimino correctamente");
        }else{
            $res=array("Error","No se pudo eliminar");
        }
        echo json_encode($res);
    }
    public function eliminar_pedidoCompra($idpedido,$empresa){
        //  echo json_encode(array($idpedido,$empresa));
        $idempresa = $this->getidempresa($empresa);
        $deleteDetallePedido = $this->dbp->query("DELETE FROM detalle_pedido WHERE pedido_idpedido = '$idpedido'");
      
        $delete = $this->dbp->query("DELETE FROM pedido WHERE idpedido = '$idpedido'");
        if($delete===TRUE || $deleteDetallePedido===TRUE){
            $res=array("ok","Se elimino correctamente");
        }else{
            $res=array("Error","No se pudo eliminar");
        }
        // echo($idpedido);
        echo json_encode($res);
    }

    public function cancelar_listaCompra(){
        // $idempresa = $this->getidempresa($empresa);
        $delete = $this->dbp->query("DELETE FROM detalle_pedido WHERE pedido_idpedido IS NULL");
        if($delete === TRUE){
            $res = array("ok", "Se eliminaron correctamente los registros con idpedido nulo");
        } else {
            $res = array("Error", "No se pudieron eliminar los registros");
        }
        echo json_encode($res);
    }
    public function listar_PorFechas($empresa,$fechaIni,$fechaFin,$estado){
        $lista = [];
        //   echo json_encode(array($empresa,$fechaIni,$fechaFin,$estado)); 

        $idempresa = $this->getidempresa($empresa);
        if($fechaIni == "soyVacio" && $fechaFin == "soyVacio"){ // fecha esta VACIA --> buscar por estado
            if($estado == 0){ // Pendientes
                // $hola = "hola";
                $getPedido = $this->dbp->query("SELECT e.idpedido,e.fecha_p,e.hora,e.estado,e.empleado_idempleado FROM pedido as e  WHERE estado = 0");
                while($qwe=$this->dbp->fetch($getPedido)){
                $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
            }
            echo json_encode($lista); 
            }else if($estado == 1){ // Finalizado
                $getPedido = $this->dbp->query("SELECT e.idpedido,e.fecha_p,e.hora,e.estado,e.empleado_idempleado FROM pedido as e  WHERE estado = 1");
                while($qwe=$this->dbp->fetch($getPedido)){
                $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
            }
            echo json_encode($lista); 
            }else{ //todos
                $getPedido = $this->dbp->query("SELECT e.idpedido,e.fecha_p,e.hora,e.estado,e.empleado_idempleado FROM pedido as e");
                while($qwe=$this->dbp->fetch($getPedido)){
                $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
            }
            echo json_encode($lista); 
            } 
        }else{
               //---------------------------------------------------
               if($estado != 2){
                    $getPedido = $this->dbp->query("SELECT e.idpedido,e.fecha_p,e.hora,e.estado,e.empleado_idempleado FROM pedido as e  WHERE (fecha_p BETWEEN '$fechaIni' AND '$fechaFin') AND estado = '$estado'");
                    while($qwe=$this->dbp->fetch($getPedido)){
                    $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);
                    }
                    //  echo json_encode(array($empresa,$estado,$fechaIni,$fechaFin));
                    echo json_encode($lista);
               }else{
                $getPedido = $this->dbp->query("SELECT e.idpedido,e.fecha_p,e.hora,e.estado,e.empleado_idempleado FROM pedido as e  WHERE fecha_p BETWEEN '$fechaIni' AND '$fechaFin'");
                while($qwe=$this->dbp->fetch($getPedido)){
                $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
                }
                //  echo json_encode(array($empresa,$estado,$fechaIni,$fechaFin));
                echo json_encode($lista);
               }
        }
    }
    public function ver_listaCompra($empresa, $idRegistro){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getLista = $this->dbp->query("SELECT  e.iddetalle_pedido,e.cantidad,e.contenido_envase,e.total_material,e.material_idmaterial,e.tipo_envase_idtipo_envase,e.medida_idmedida FROM detalle_pedido as e WHERE pedido_idpedido = '$idRegistro'");
         while($qwe=$this->dbp->fetch($getLista)){
             $res=array("id"=>$qwe[0],"cantidadEnvase"=>$qwe[1],"contenidoEnvase"=>$qwe[2],"total_material"=>$qwe[3],"material"=>$qwe[4],"tipoEnvase"=>$qwe[5],"medida"=>$qwe[6]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
         echo json_encode($lista);
    }

    public function listar_ListaCompraEditable($idpedido,$empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getLista = $this->dbp->query("SELECT  e.iddetalle_pedido,e.cantidad,e.contenido_envase,e.total_material,e.material_idmaterial,e.tipo_envase_idtipo_envase,e.medida_idmedida FROM detalle_pedido as e WHERE pedido_idpedido = '$idpedido'");
         while($qwe=$this->dbp->fetch($getLista)){
             $res=array("id"=>$qwe[0],"cantidadEnvase"=>$qwe[1],"contenidoEnvase"=>$qwe[2],"total_material"=>$qwe[3],"material2"=>$qwe[4],"tipoEnvase2"=>$qwe[5],"medida2"=>$qwe[6]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
         echo json_encode($lista);
    }
    public function registrar_ListaCompra_Editar($cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$idpedido,$empresa){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
        // $idempresa = $this->getidempresa($empresa);
        //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_pedido WHERE material_idmaterial = '$material'");
        //     $resultado = $consulta->fetch_assoc();
        //     $totalRegistros = $resultado['total'];

            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $totalSuma = $cantEnvase * $contenidoEnvase;
                $registroListaCompra = $this->dbp->query("INSERT INTO detalle_pedido(cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida) VALUES ('$cantEnvase','$idpedido','$material','$tipoEnvase','$contenidoEnvase',' $totalSuma','$medida')");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
 
            echo json_encode($res);
        }

        public function eliminar_listaCompra_edit($iddetalle_pedido,$empresa){
            // echo json_encode(array($iddetalle_pedido,"hola"));
            $idempresa = $this->getidempresa($empresa);
            $delete = $this->dbp->query("DELETE FROM detalle_pedido WHERE iddetalle_pedido = '$iddetalle_pedido'");
            if($delete===TRUE){
                $res=array("success","Se elimino correctamenteeee");
            }else{
                $res=array("Error","No se pudo eliminar");
            }
            echo json_encode($res);
        }
        public function editarCaracteristicas($id,$nombre,$empresa) {
            // echo json_encode(array($id,$nombre,$empresa));
            $idempresa = $this->getidempresa($empresa);
            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
    
            if ($totalRegistros > 0) {
                $res = array("Error", "El registro ya existe","edicionCaracteristica");
            }else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE caracteristicas
                                        SET caracteristica = '$nombre'
                                        WHERE idcaracteristicas = '$id';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","edicionCaracteristica");
                } else {
                    $res = array("danger", "No se pudo editar",$id,$nombre,$empresa);
                }
            }
            echo json_encode($res);
        }
        public function IconoEditarPedido($id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa){

             $idempresa = $this->getidempresa($empresa);
    
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                     $totalSuma = $cantEnvase * $contenidoEnvase;
        
                    $registroListaCompra = $this->dbp->query("UPDATE detalle_pedido
                    SET cantidad = '$cantEnvase',
                    material_idmaterial = '$material',
                    tipo_envase_idtipo_envase = '$tipoEnvase',
                    contenido_envase = '$contenidoEnvase',
                    total_material = '$totalSuma',
                    medida_idmedida = '$medida'
                    WHERE iddetalle_pedido = '$id';");
                    if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","edicionCaracteristica");
                    } else {
                    $res = array("danger", "No se pudo editar",$id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa);
                    }
                } //cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida
                echo json_encode($res);
            }

            public function iconoEditarPedidoEdicion($id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa){
                 $idempresa = $this->getidempresa($empresa);
        
                    if (0 > 0) {
                        $res = array("danger", "El registro ya existe");
                    } else {
                        // Insertar el nuevo registro
                         $totalSuma = $cantEnvase * $contenidoEnvase;

                        $registroListaCompra = $this->dbp->query("UPDATE detalle_pedido
                        SET cantidad = '$cantEnvase',
                        material_idmaterial = '$material',
                        tipo_envase_idtipo_envase = '$tipoEnvase',
                        contenido_envase = '$contenidoEnvase',
                        total_material = '$totalSuma',
                        medida_idmedida = '$medida'
                        WHERE iddetalle_pedido = '$id';");
                        if ($registroListaCompra === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edición exitosa","edicionListaCompra");
                        } else {
                        $res = array("danger", "No se pudo editar",$id,$cantEnvase,$material,$tipoEnvase,$contenidoEnvase,$medida,$empresa);
                        }
                    } //cantidad,pedido_idpedido, material_idmaterial,tipo_envase_idtipo_envase,contenido_envase,total_material,medida_idmedida
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