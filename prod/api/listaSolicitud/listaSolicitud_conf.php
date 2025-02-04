<?php
require_once "../../db/db.php";
class ListaSolicitud_conf extends DB{
    // $_POST['lote'],$_POST['fechaVenci'],$_POST['proveedor'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['empresa']
    public function comprarPorProveedor($fechaVenci,$idpedido,$material,$tipoEnvase,$contenido,$medida,$cantidad,$precioUni,$empresa){
        //   $res = array($lote,$fechaVenci,$idpedido,$material,$tipoEnvase,$contenido,$medida,$cantidad,$empresa);
        $total_precio = $cantidad * $precioUni;
         $idempresa = $this->getidempresa($empresa);

            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
                $comprarPorProveedor = $this->dbp->query("INSERT INTO detalle_compra(cantidad, contenido, precio_unitario, total_precio, fecha_venci,pedido_idpedido,compra_idcompra, material_idmaterial, tipo_envase_idtipo_envase, medida_idmedida) VALUES ('$cantidad','$contenido','$precioUni','$total_precio','$fechaVenci','$idpedido',null,'$material','$tipoEnvase','$medida')");
                if ($comprarPorProveedor === TRUE) {                                                                                                                                                                                                      
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar",$fechaVenci,$idpedido,$material,$tipoEnvase,$contenido,$medida,$cantidad,$precioUni,$empresa);
                }
            }
              echo json_encode($res);
        }
        public function registrarCompra($lote,$fechaReg, $hora,$totalSuma,$idpedido,$proveedor,$usuario, $empresa) {
            // echo json_encode(array($fecha,$hora,$empresa));
                // echo json_encode(array($lote,$fechaReg, $hora,$totalSuma,$idpedido,$proveedor, $empresa));

            $idempresa = $this->getidempresa($empresa);
            $idusuario = $this->getidTrabajador($usuario);
             $haynulos = $this->dbp->query("SELECT EXISTS (SELECT 1 FROM detalle_compra WHERE compra_idcompra IS NULL AND pedido_idpedido = '$idpedido') AS hay_nulos;");
             $fila = $haynulos->fetch_assoc();

             if ($fila['hay_nulos'] == 1) {
            // Insertar el nuevo registro en la tabla "pedido"

            $registroCompra = $this->dbp->query("INSERT INTO compra (lote,fecha, hora, num_registro, total, estado, pedido_idpedido, empleado_idempleado, proveedor_idproveedor, empresa_idempresa) VALUES ('$lote','$fechaReg', '$hora', '001', '$totalSuma', 0, '$idpedido', '$idusuario', '$proveedor', '$idempresa')");

        
                if ($registroCompra === TRUE) {
                    // Obtener el ID del último pedido registrado
                    $idPedidoResult = $this->dbp->query("SELECT idcompra FROM compra ORDER BY idcompra DESC LIMIT 1");
                    $idPedidoRow = $idPedidoResult->fetch_assoc();
                    $idcompra = $idPedidoRow['idcompra'];
            
                    // Actualizar la tabla "detalle_pedido" con el ID del pedido
                    $this->dbp->query("UPDATE detalle_compra SET compra_idcompra = $idcompra WHERE compra_idcompra IS NULL AND pedido_idpedido = '$idpedido'");
            
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar",$lote,$fechaReg, $hora,$totalSuma,$idpedido,$proveedor,$usuario, $idempresa);
                }
            }else{
                $res = array("danger", "la lista esta vacia");
            }
           
        
            echo json_encode($res);
        }
    public function listar_compraPorProveedor($empresa,$idpedido){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);  
      // Material	Cantidad	Envase	Contenido	Precio unitario	Fecha vencimiento
         $getListaa = $this->dbp->query("SELECT  e.iddetalle_compra,e.material_idmaterial,e.cantidad,e.tipo_envase_idtipo_envase,e.contenido,e.precio_unitario,e.total_precio,e.fecha_venci,e.medida_idmedida FROM detalle_compra as e WHERE pedido_idpedido = '$idpedido' AND compra_idcompra IS NULL");
        // $getLista = $this->dbp->query("SELECT  e.iddetalle_pedido,e.cantidad,e.contenido_envase,e.total_material,e.material_idmaterial,e.tipo_envase_idtipo_envase,e.medida_idmedida FROM detalle_pedido as e WHERE pedido_idpedido IS NULL"); 
        while($qwe=$this->dbp->fetch($getListaa)){ //SELECT  e.iddetalle_compra,e.material_idmaterial,e.cantidad,e.tipo_envase_idtipo_envase,e.contenido,e.precio_unitario,e.total_precio,e.fecha_venci,e.medida_idmedida FROM detalle_compra as e WHERE pedido_idpedido = '$idpedido' AND compra_idcompra IS NULL
             $res=array("id"=>$qwe[0],"material"=>$qwe[1],"cantidad"=>$qwe[2],"tipoEnvase"=>$qwe[3],"contenido"=>$qwe[4],"precioUni"=>$qwe[5],"precio_total"=>$qwe[6],"fechaVenci"=>$qwe[7],"medida"=>$qwe[8]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
         echo json_encode($lista);
    }
    public function listaCompraEnEspera($empresa,$idpedido){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getCompra = $this->dbp->query("SELECT e.idcompra,e.fecha,e.hora,e.empleado_idempleado,e.proveedor_idproveedor,e.lote FROM compra as e WHERE empresa_idempresa = $idempresa AND pedido_idpedido='$idpedido'");

        while($qwe=$this->dbp->fetch($getCompra)){
             $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"empleado"=>$qwe[3],"proveedor"=>$qwe[4], "lote"=>$qwe[5]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }

        // $getPedido = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = 7"); 
        //  while($qwe=$this->dbcm->fetch($getPedido)){
        //      $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
        //     array_push($lista,$res);
        //  }
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
    public function eliminar_detalle_pedido($iddetalle_pedido){
        // echo json_encode(array($iddetalle_pedido,"hola"));
        // $idempresa = $this->getidempresa($empresa);
        $delete = $this->dbp->query("DELETE FROM detalle_pedido WHERE iddetalle_pedido = '$iddetalle_pedido'");
        if($delete===TRUE){
            $res=array("success","Se elimino correctamente");
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
    
    
    public function listarProveedorDeMateriales($empresa,$idpedido){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getLista = $this->dbp->query("
       SELECT phm.idproveedor_has_material,phm.proveedor_idproveedor, phm.material_idmaterial 
        FROM proveedor_has_material AS phm 
        JOIN material AS m 
        ON phm.material_idmaterial = m.idmaterial 
        WHERE phm.material_idmaterial 
        IN (SELECT e.material_idmaterial 
            FROM detalle_pedido AS e 
            WHERE e.pedido_idpedido = '$idpedido');      
");
         while($qwe=$this->dbp->fetch($getLista)){
             $res=array("id"=>$qwe[0],"nombre_proveedor"=>$qwe[1],"nombre_material"=>$qwe[2]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
         echo json_encode($lista);
    } 
    public function finalizarCompra($idpedido, $empresa) {
        // echo json_encode(array($idpedido,$empresa));
        $idempresa = $this->getidempresa($empresa); 
        
                // Actualizar la tabla "detalle_pedido" con el ID del pedido
                $finalizarCompra =  $this->dbp->query("UPDATE pedido p 
                INNER JOIN compra o ON p.idpedido = o.pedido_idpedido
                SET p.estado = 1
                WHERE p.estado = 0 AND (p.idpedido='$idpedido' AND p.empresa_idempresa = '$idempresa');");
               
                if ($finalizarCompra === TRUE) {                                                                                                                                                                                                      
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
                echo json_encode($res);
    }
    public function listaCompraRealizada($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        // $idusuario = $this->getidempresa($usuario);
        $getCompra = $this->dbp->query("SELECT e.idcompra,e.fecha,e.hora,e.lote,e.estado,e.empleado_idempleado,e.proveedor_idproveedor FROM compra as e WHERE empresa_idempresa = '$idempresa'");

        while($qwe=$this->dbp->fetch($getCompra)){
             $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"lote"=>$qwe[3],"estado"=>$qwe[4],"empleado"=>$qwe[5],"proveedor"=>$qwe[6]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }

        // $getPedido = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = 7"); 
        //  while($qwe=$this->dbcm->fetch($getPedido)){
        //      $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
        //     array_push($lista,$res);
        //  }
          echo json_encode($lista);
    }
    
    public function cancelarListaCompraForm($idPedido){
        // $idempresa = $this->getidempresa($empresa);
        $delete = $this->dbp->query("DELETE FROM detalle_compra WHERE compra_idcompra IS NULL AND pedido_idpedido = '$idPedido'");
        if($delete === TRUE){
            $res = array("ok", "Se eliminaron correctamente los registros con idcompra nulo");
        } else {
            $res = array("Error", "No se pudieron eliminar los registros");
        }
        echo json_encode($res);
    }
    public function listadoDetalleCompraRealizada($empresa, $idRegistro){
        // echo json_encode(array($empresa,$idRegistro));
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getLista = $this->dbp->query("SELECT  e.iddetalle_compra,e.cantidad,e.contenido,e.precio_unitario,e.material_idmaterial,e.total_precio,e.fecha_venci,e.medida_idmedida FROM detalle_compra as e WHERE compra_idcompra = '$idRegistro'");
         while($qwe=$this->dbp->fetch($getLista)){
             $res=array("id"=>$qwe[0],"cantidadEnvase"=>$qwe[1],"contenidoEnvase"=>$qwe[2],"precio_unitario"=>$qwe[3],"material"=>$qwe[4],"total_precio"=>$qwe[5],"fecha_venci"=>$qwe[6],"medida"=>$qwe[7],); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);                                                       //envase, idcompra, idpedido
         }
         echo json_encode($lista);
    }
    public function listaDetalleCompleto($empresa, $idRegistro){
        // echo json_encode(array($empresa,$idRegistro));
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getLista = $this->dbp->query("SELECT * FROM detalle_compra WHERE compra_idcompra = '$idRegistro'");
         while($qwe=$this->dbp->fetch($getLista)){
             $res=array("id"=>$qwe[0],"cantidadEnvase"=>$qwe[1],"contenidoEnvase"=>$qwe[2],"precio_unitario"=>$qwe[3],"material"=>$qwe[4],"total_precio"=>$qwe[5],"fecha_venci"=>$qwe[6],"medida"=>$qwe[7],"envase"=>$qwe[8],"idcompra"=>$qwe[9],"idpedidp"=>$qwe[10]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);                                                       //envase, idcompra, idpedido
         }
         echo json_encode($lista);
    }
    public function listarCompraEsperaEdit($empresa, $idcompra){
        // echo json_encode(array($idcompra,$empresa));
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getLista = $this->dbp->query("SELECT  e.iddetalle_compra,e.material_idmaterial,e.cantidad,e.tipo_envase_idtipo_envase,e.contenido,e.precio_unitario,e.total_precio,e.fecha_venci,e.medida_idmedida FROM detalle_compra as e WHERE compra_idcompra = '$idcompra'");
         while($qwe=$this->dbp->fetch($getLista)){
             $res=array("id"=>$qwe[0],"materialEd"=>$qwe[1],"cantidadEd"=>$qwe[2],"tipoEnvaseEd"=>$qwe[3],"contenidoEd"=>$qwe[4],"precioUniEd"=>$qwe[5],"precio_total"=>$qwe[6],"fechaVenciEd"=>$qwe[7],"medidaEd"=>$qwe[8]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
         echo json_encode($lista);
    }

    public function registrar_ListaCompraSoli_Editar($fechaVenci,$idpedido,$idcompra,$material,$tipoEnvase,$contenido,$medida,$cantidad,$precioUni,$empresa){
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
                 $totalSuma = $cantidad * $precioUni;
                $registroListaCompra = $this->dbp->query("INSERT INTO detalle_compra(cantidad, contenido, precio_unitario, total_precio, fecha_venci,pedido_idpedido,compra_idcompra, material_idmaterial, tipo_envase_idtipo_envase, medida_idmedida) VALUES ('$cantidad','$contenido','$precioUni','$totalSuma','$fechaVenci','$idpedido','$idcompra','$material','$tipoEnvase','$medida')");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            //   echo ($material);
            //   echo ($tipoEnvase);
            //   echo ($contenidoEnvase);
            //   echo ($medida);
            echo json_encode($res);
        }
        public function eliminar_listaCompraSoli_edit($iddetalle_compra,$empresa){
            // echo json_encode(array($iddetalle_pedido,"hola"));
            $idempresa = $this->getidempresa($empresa);
            $delete = $this->dbp->query("DELETE FROM detalle_compra WHERE iddetalle_compra = '$iddetalle_compra'");
            if($delete===TRUE){
                $res=array("success","Se elimino correctamente");
            }else{
                $res=array("Error","No se pudo eliminar");
            }
            echo json_encode($res);
        }
        public function eliminar_compraEspera($idcompra,$empresa){
            //  echo json_encode(array($idpedido,$empresa));
            $idempresa = $this->getidempresa($empresa);
            $deleteDetallePedido = $this->dbp->query("DELETE FROM detalle_compra WHERE compra_idcompra = '$idcompra'");
          
            $delete = $this->dbp->query("DELETE FROM compra WHERE idcompra = '$idcompra'");
            if($delete===TRUE || $deleteDetallePedido===TRUE){
                $res=array("ok","Se elimino correctamente");
            }else{
                $res=array("Error","No se pudo eliminar");
            }
            // echo($idpedido);
            echo json_encode($res);
        }
        public function eliminar_listaCompraSoli($iddetalle_compra,$empresa){
            // echo json_encode(array($iddetalle_pedido,"hola"));
            $idempresa = $this->getidempresa($empresa);
            $delete = $this->dbp->query("DELETE FROM detalle_compra WHERE iddetalle_compra = '$iddetalle_compra'");
            if($delete===TRUE){
                $res=array("success","Se elimino correctamente");
            }else{
                $res=array("Error","No se pudo eliminar");
            }
            echo json_encode($res);
        }


        public function registro_lista_pedidos($fecha,$hora,$estado,$rubro,$empresa,$empleado,$pedidos) {
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL); 
            $idempresa = $this->getidempresa($empresa); 
            $idempleado = $this->getidTrabajador($empleado);
            
            // echo json_encode(array($fecha,$hora,$estado,$rubro,$empresa,$empleado,$pedidos));
            $registrarPed = $this->dbp->query("INSERT INTO pedido(fecha_p, hora,estado,rubro_idrubro,empresa_idempresa,empleado_idempleado) VALUES ('$fecha','$hora','$estado','$rubro','$idempresa','$idempleado')");
            $idpedido = $this->dbp->insert_id; 
            if ($registrarPed === TRUE) { 
            foreach($pedidos as $pedido){
                    // $consulta = $this->dbp->query("SELECT COUNT(*) AS count FROM etapa_maquina WHERE maquina_idmaquina = '$maquina[maquina_idmaquina]'");
                    // $resultado = $consulta->fetch_assoc();
                    // $totalRegistros = $resultado['count'];
                    // // Si ya existe una etapa con el mismo nombre para la empresa, se envía un mensaje de error
                             
                            $registrar = $this->dbp->query("INSERT INTO detalle_pedido(cantidad_envases,tipo_envase_idtipo_envase, pedido_idpedido,material_idmaterial,peso_neto) VALUES ('$pedido[cantidad_envases]','$pedido[tipo_envase_idtipo_envase]','$idpedido','$pedido[material_idmaterial]','$pedido[peso_neto]')");
             }
            }
              if($registrar){
                $res = array("success", "Operaciones exitosas","registro_lista_pedidos");
              }
              else{
                 $res = array("danger", "no se pudo Registrar");
              }
            echo json_encode($res);
        } 
        public function registrar_detalle_pedido($cantidad_envases, $idtipo,$idpedido,$idmaterial,$pesoNeto){
            //   $res = array($lote,$fechaVenci,$idpedido,$material,$tipoEnvase,$contenido,$medida,$cantidad,$empresa);
            // $total_precio = $cantidad * $precioUni;
            //  $idempresa = $this->getidempresa($empresa);
    
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
                    $comprarPorProveedor = $this->dbp->query("INSERT INTO detalle_pedido(cantidad_envases, tipo_envase_idtipo_envase,pedido_idpedido,material_idmaterial,peso_neto) VALUES ('$cantidad_envases', '$idtipo','$idpedido','$idmaterial','$pesoNeto')");
                    if ($comprarPorProveedor === TRUE) {                                                                                                                                                                                                      
                        $res = array("success", "Registro exitoso","registrar_detalle_pedido");
                    } else {
                        $res = array("danger", "No se pudo registrar","registrar_detalle_pedido");
                    }
                }
                  echo json_encode($res);
            }
        public function Listar_pedidos_material($empresa) {
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            
            // Consulta para listar las etapas de producción asociadas a una empresa
            $getLista = $this->dbp->query("SELECT * FROM pedido WHERE empresa_idempresa = '$idempresa' ORDER BY idpedido DESC;");
        
            // Recorrer los resultados y agregarlos a la lista
            while ($etapa=$this->dbp->fetch($getLista)) {
                $res = array(
                    "idpedido" => $etapa['idpedido'],
                    "fecha_p" => $etapa['fecha_p'],
                    "hora" => $etapa['hora'],
                    "estado" => $etapa['estado'],
                    "rubro_idrubro" => $etapa['rubro_idrubro'],
                    "empresa_idempresa" => $etapa['empresa_idempresa'],
                    "empleado_idempleado" => $etapa['empleado_idempleado'],
                    "detalles" => []
                );
                $getLista2 = $this->dbp->query("SELECT * 
                            FROM detalle_pedido 
                            WHERE pedido_idpedido = '$etapa[idpedido]';
                            ");
                while ($qwe=$this->dbp->fetch($getLista2)) {
                $detalle = array(
                    "iddetalle_pedido" => $qwe['iddetalle_pedido'],
                    "cantidad_envases" => $qwe['cantidad_envases'],
                    "pedido_idpedido" => $qwe['pedido_idpedido'],
                    "material_idmaterial" => $qwe['material_idmaterial'],
                    "peso_neto" => $qwe['peso_neto'],
                    "tipo_envase_idtipo_envase" => $qwe['tipo_envase_idtipo_envase']
                );
                array_push($res['detalles'], $detalle);
            }
                array_push($lista, $res);
            }
            echo json_encode($lista);
        }
        
        public function anularPedido($idpedido){
            $consulta = $this->dbp->query("SELECT * FROM pedido WHERE idpedido = '$idpedido'");
            $resultado = $consulta->fetch_assoc();
            $estadoCompra = $resultado['estado'];
            if($estadoCompra == 0){
                $edicionCompra = $this->dbp->query("UPDATE pedido SET estado = '-1' WHERE idpedido = '$idpedido'");
                $res = array("success", "el pedido se anulo exitosamente","anularPedido");
            }elseif($estadoCompra == -1){
                $edicionCompra = $this->dbp->query("UPDATE pedido SET estado = '0' WHERE idpedido = '$idpedido'");
                $res = array("success", "el pedido se activo exitosamente","anularPedido");
            }else{
                // $edicionCompra = $this->dbp->query("UPDATE compra SET estado = '-1' WHERE idcompra = '$idcompra'");
                // mostrar un mensaje indicando q no se puede editar esa compra
                $res = array("danger", "el pedido no puede ser anulado","anularPedido");
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