<?php
require_once "../../db/db.php";
class Grupo_etapas extends DB{
      
    public function registrar_grupo_etapas_ordenados($idgrupo, $nombre, $empresa,$rubro, $etapas_ordenes) {
        //  echo json_encode(array($idgrupo, $nombre, $empresa,$rubro, $etapas_ordenes));

        // Obtener el ID de la empresa listar_grupo_etapas registrar_produccion salida
        // ---------------------------------------------------------
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe una etapa de producción con el mismo nombre para la misma empresa
        $consulta = $this->dbp->query("SELECT COUNT(*) AS count FROM grupo_etapas WHERE empresa_idempresa = '$idempresa' AND (idgrupo_etapas = '$idgrupo' OR nombre ='$nombre')");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['count'];
        // Si ya existe una etapa con el mismo nombre para la empresa, se envía un mensaje de error
        if ($totalRegistros > 0) {
            if($idgrupo == 0){
                $res = array("danger", "Ya existe un grupo con el mismo nombre","registrar_grupo_etapas_ordenados");
            }else{
            // el grupo ya existe entonces solo añadimos las etapas
                foreach($etapas_ordenes as $etapa){
                    $idgrupo = $etapa['grupo_etapas_idgrupo_etapas'];
                    $idEtapa_orden = $etapa['idetapa_orden'];
                    $orden = $etapa['orden'];
                    $idetapas_produccion = $etapa['etapas_produccion_idetapas_produccion'];

                if($idEtapa_orden == 0){ //se añadio recien esa etapa
                    $operacionesEtapas = $this->dbp->query("INSERT INTO etapa_orden(orden,etapas_produccion_idetapas_produccion,grupo_etapas_idgrupo_etapas) 
                            VALUES ('$orden','$idetapas_produccion','$idgrupo')");
                }else if($idEtapa_orden < 0){ // se elimina
                    $auxIdEtapa = abs($idEtapa_orden); 
                    $operacionesEtapas = $this->dbp->query("DELETE FROM etapa_orden WHERE idetapa_orden='$auxIdEtapa'");
                }else{ //se actualiza
                    $operacionesEtapas =  $this->dbp->query("UPDATE etapa_orden SET orden = '$orden' WHERE idetapa_orden='$idEtapa_orden'");
                }
                }
                $res = array("success", "Operacion Exitosa","registrar_grupo_etapas_ordenados");
        }
        } else {
            // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
            $registrarGrupoEtapa = $this->dbp->query("INSERT INTO grupo_etapas(nombre, empresa_idempresa, rubro_idrubro) VALUES ('$nombre','$idempresa','$rubro')");
            $id_grpo = $this->dbp->insert_id;
            if ($registrarGrupoEtapa === TRUE) {
            if(empty($etapas_ordenes)){
                // No va REgistrar etapas_ordenes

            }else{
            foreach($etapas_ordenes as $etapa){
            $orden = $etapa['orden'];
            $idetapas_produccion = $etapa['etapas_produccion_idetapas_produccion'];
            // $id_grpo = $this->dbp->insert_id;  
                $registrarEtapaOrden = $this->dbp->query("INSERT INTO etapa_orden(orden,etapas_produccion_idetapas_produccion,grupo_etapas_idgrupo_etapas) 
                VALUES ('$orden','$idetapas_produccion','$id_grpo')");
            }
        }
            $res = array("success", "Registro exitoso","registrar_grupo_etapas_ordenados");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        }
        echo json_encode($res);
    } 
    
    public function listar_grupo_etapas($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM grupo_etapas WHERE empresa_idempresa = '$idempresa' ORDER BY idgrupo_etapas DESC;");
    
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "idgrupo_etapas" => $etapa['idgrupo_etapas'],
                "nombre" => $etapa['nombre'],
                "empresa_idempresa" => $etapa['empresa_idempresa'],
                "rubro_idrubro" => $etapa['rubro_idrubro'],
                "detalles" => []
            );
            $getLista2 = $this->dbp->query("SELECT * 
                        FROM etapa_orden e
                        INNER JOIN etapas_produccion ep ON ep.idetapas_produccion = e.etapas_produccion_idetapas_produccion
                        WHERE e.grupo_etapas_idgrupo_etapas = '$etapa[idgrupo_etapas]' AND ep.empresa_idempresa='$idempresa'
                        ORDER BY e.orden ASC;
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "idetapa_orden" => $qwe['idetapa_orden'],
                "orden" => $qwe['orden'],
                "etapas_produccion_idetapas_produccion" => $qwe['etapas_produccion_idetapas_produccion'],
                "grupo_etapas_idgrupo_etapas" => $qwe['grupo_etapas_idgrupo_etapas']
            );
            array_push($res['detalles'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function eliminar_grupo_etapas($idgrupo_etapas){

        if (0 > 0) {
            $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_grupo_etapas");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbp->query("DELETE FROM grupo_etapas WHERE idgrupo_etapas = '$idgrupo_etapas'");
            if ($registroProveedor === TRUE) {                                                                                                                                                    
                $res = array("success", "se elimino exitosamente","eliminar_grupo_etapas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
}
    public function listar_grupo_etapas_porProducto($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM grupo_etapas WHERE empresa_idempresa = '$idempresa' ORDER BY idgrupo_etapas DESC;");
        $arrayDistintos = $this->dbp->query("SELECT DISTINCT grupo_etapas_idgrupo_etapas
                                        FROM grupo_productos;");
          $resultado = $arrayDistintos->fetch_assoc();
        //   $totalRegistros = $resultado['count'];
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            
            $res = array(
                "idgrupo_etapas" => $etapa['idgrupo_etapas'],
                "nombre" => $etapa['nombre'],
                "grupo_productos" => []
            );
            $getLista2 = $this->dbp->query("SELECT * 
                        FROM grupo_productos 
                        WHERE grupo_etapas_idgrupo_etapas = '$etapa[idgrupo_etapas]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "idgrupo_productos" => $qwe['idgrupo_productos'],
                "producto_idproducto" => $qwe['producto_idproducto'],
                "grupo_etapas_idgrupo_etapas" => $qwe['grupo_etapas_idgrupo_etapas']
            );
            array_push($res['grupo_productos'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function listar_productos_porGrupo($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT DISTINCT ge.nombre, gp.grupo_etapas_idgrupo_etapas
            FROM grupo_productos gp
            INNER JOIN grupo_etapas ge ON ge.idgrupo_etapas = gp.grupo_etapas_idgrupo_etapas
            WHERE ge.empresa_idempresa = '$idempresa';");
    

        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "grupo_etapas_idgrupo_etapas" => $etapa['grupo_etapas_idgrupo_etapas'],
                "nombre" => $etapa['nombre'],
                "grupo_productos" => []
            );
            $getLista2 = $this->dbp->query("SELECT * 
                        FROM grupo_productos 
                        WHERE grupo_etapas_idgrupo_etapas = '$etapa[grupo_etapas_idgrupo_etapas]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "idgrupo_productos" => $qwe['idgrupo_productos'],
                "producto_idproducto" => $qwe['producto_idproducto'],
                "grupo_etapas_idgrupo_etapas" => $qwe['grupo_etapas_idgrupo_etapas']
            );
            array_push($res['grupo_productos'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function eliminar_etapa_produccion($id) {
        $this->dbp->begin_transaction();
        
        try {
            $relacionadas = [
                'produccion_etapa' => 'No se puede eliminar porque hay registros en producción',
            ];
            
            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE etapas_produccion_idetapas_produccion = ?";
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
    
            $query = "DELETE FROM etapas_produccion WHERE idetapas_produccion = ?";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar la etapa de producción");
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();
    
            $this->dbp->commit();
            $res = array("ok", "Se eliminó correctamente", "eliminar_etapa_produccion");
    
        } catch (Exception $e) {
            $this->dbp->rollback();
            $res = array("Error", $e->getMessage(), "eliminar_etapa_produccion");
        }
    
        echo json_encode($res);
    } 
    public function registro_productos_grupo($grupo_productos) {
        //  echo json_encode(array($grupo_productos));

         foreach($grupo_productos as $grp_product){
            if($grp_product['idgrupo_productos'] < 0){
              $auxIdGrupo = abs($grp_product['idgrupo_productos']); 
              $eliminar = $this->dbp->query("DELETE FROM grupo_productos WHERE idgrupo_productos='$auxIdGrupo'");
            
            }elseif($grp_product['idgrupo_productos'] == 0){
                $registrar = $this->dbp->query("INSERT INTO grupo_productos(producto_idproducto, grupo_etapas_idgrupo_etapas) VALUES ('$grp_product[producto_idproducto]','$grp_product[grupo_etapas_idgrupo_etapas]')");
            }
            // else{
            //     $eliminar = $this->dbp->query("UPDATE grupo_productos SET  WHERE ");
            // }
         }
        //  if($registrar){
            $res = array("success", "Operaciones exitosas","registro_producto_grupos");
        //  }
        //  else{
        //     $res = array("success", "Elim exitoso","registrar_grupo_etapas_ordenados");
        //  }
        echo json_encode($res);
    } 
    public function listar_productos_porGrupo_y_etapas($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT *
            FROM grupo_productos gp
            INNER JOIN grupo_etapas ge ON ge.idgrupo_etapas = gp.grupo_etapas_idgrupo_etapas
            WHERE ge.empresa_idempresa = '$idempresa';");
    

        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "producto_idproducto" => $etapa['producto_idproducto'],
                "grupo_etapas_idgrupo_etapas" => $etapa['grupo_etapas_idgrupo_etapas'],
                "nombre" => $etapa['nombre'],
                "etapas" => []
            );
            $getLista2 = $this->dbp->query("SELECT eo.*,ep.nombre_etapa FROM etapa_orden eo
                INNER JOIN etapas_produccion ep ON ep.idetapas_produccion=eo.etapas_produccion_idetapas_produccion
                WHERE grupo_etapas_idgrupo_etapas='$etapa[grupo_etapas_idgrupo_etapas]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "nombre_etapa" => $qwe['nombre_etapa'],
                "idetapa_orden" => $qwe['idetapa_orden'],
                "orden" => $qwe['orden']
            );
            array_push($res['etapas'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registro_maquina_etapas($maquinas) {
        //  echo json_encode(array($grupo_productos));

         foreach($maquinas as $maquina){
            if($maquina['idetapa_maquina'] < 0){
              $auxIdGrupo = abs($maquina['idetapa_maquina']); 
              $eliminar = $this->dbp->query("DELETE FROM etapa_maquina WHERE idetapa_maquina='$auxIdGrupo'");
            
            }elseif($maquina['idetapa_maquina'] == 0){
        
                    $registrar = $this->dbp->query("INSERT INTO etapa_maquina(etapas_produccion_idetapas_produccion, maquina_idmaquina) VALUES ('$maquina[etapas_produccion_idetapas_produccion]','$maquina[maquina_idmaquina]')");

               
            }
            // else{
            //     $eliminar = $this->dbp->query("UPDATE grupo_productos SET  WHERE ");
            // }
         }
        //  if($registrar){
            $res = array("success", "Operaciones exitosas","registro_maquina_etapas");
        //  }
        //  else{
        //     $res = array("success", "Elim exitoso","registrar_grupo_etapas_ordenados");
        //  }
        echo json_encode($res);
    } 
    public function listado_maquina_etapas($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM etapas_produccion 
             WHERE empresa_idempresa='$idempresa';");
    
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "idetapas_produccion" => $etapa['idetapas_produccion'],
                "nombre_etapa" => $etapa['nombre_etapa'],
                "detalles" => []
            );
            $getLista2 = $this->dbp->query("SELECT * FROM etapa_maquina WHERE etapas_produccion_idetapas_produccion ='$etapa[idetapas_produccion]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "idetapa_maquina" => $qwe['idetapa_maquina'],
                "etapas_produccion_idetapas_produccion" => $qwe['etapas_produccion_idetapas_produccion'],
                "maquina_idmaquina" => $qwe['maquina_idmaquina']
            );
            array_push($res['detalles'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

      public function registrar_produccion_etapa($fecha_pe, $hora_pe,$fecha_fin,$hora_fin,$idproduccion, $idetapaProduccion,$empleado, $idgrupoEtapas) {

        $idempleado = $this->getidTrabajador($empleado);
        // Verificar si ya existe una etapa de producción con el mismo nombre para la misma empresa
  
        $consulta = $this->dbp->query("SELECT COUNT(*) AS count FROM produccion_etapa 
        WHERE etapas_produccion_idetapas_produccion = '$idetapaProduccion' AND grupo_etapas_idgrupo_etapas = '$idgrupoEtapas' AND produccion_idproduccion ='$idproduccion';");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['count'];
        // Si ya existe una etapa con el mismo nombre para la empresa, se envía un mensaje de error
           
        if($totalRegistros > 0){
                $res = array("danger", "Ya existe un grupo en esa etapa","registrar_produccion_etapa");
            }else{

                    $operacionesEtapas = $this->dbp->query("INSERT INTO produccion_etapa(fecha_pe,hora_pe,fecha_fin,hora_fin,estado,produccion_idproduccion,etapas_produccion_idetapas_produccion,empleado_idempleado,grupo_etapas_idgrupo_etapas) 
                            VALUES ('$fecha_pe','$hora_pe','$fecha_fin','$hora_fin','0','$idproduccion','$idetapaProduccion','$idempleado','$idgrupoEtapas')");

                    if($operacionesEtapas){
                        $idProd_etap = $this->dbp->insert_id;
                        $res = array("success", "Registrp Exitoso","registrar_produccion_etapa",$idProd_etap);
                    }else{
                        $res = array("danger", "No se pudo registrar","registrar_produccion_etapa");
                    }
                }

        echo json_encode($res);
    } 
    public function finalizar_produccion_etapa($idprodEt,$fecha_fin,$hora_fin) {

                    $operacionesEtapas = $this->dbp->query("UPDATE 	produccion_etapa SET fecha_fin='$fecha_fin',hora_fin='$hora_fin',estado='1'
                                                            WHERE idproduccion_etapa='$idprodEt';");

                    if($operacionesEtapas){
                        $res = array("success", "finalizado con exito","finalizar_produccion_etapa");
                    }else{
                        $res = array("danger", "No se pudo registrar","finalizar_produccion_etapa");
                    }   

        echo json_encode($res);
    } 
    public function finalizar_produccion($idproduccion) {
        $consulta = $this->dbp->query("SELECT lote_idlote FROM produccion WHERE idproduccion = '$idproduccion'");
        $resultado = $consulta->fetch_assoc();
        $idlote = $resultado['lote_idlote'];
        $operacionesEtapas = $this->dbp->query("UPDATE 	produccion SET estado='2'
                                                WHERE idproduccion='$idproduccion';");

        if($operacionesEtapas){
            $cambiarLoteEstado = $this->dbp->query("UPDATE 	lote SET estado='1'
                                                WHERE idlote='$idlote';");
            $res = array("success", "produccion finalizado","finalizar_produccion");
        }else{
            $res = array("danger", "No se pudo registrar","finalizar_produccion");
        }   

echo json_encode($res);
} 
    public function listar_produccion_etapa_porProduccion($idproduccion){
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
        $getCompra = $this->dbp->query("SELECT * FROM produccion_etapa 
        WHERE produccion_idproduccion = '$idproduccion'");

        while($qwe=$this->dbp->fetch($getCompra)){
             $res=array("idproduccion_etapa"=>$qwe['idproduccion_etapa'],
             "fecha_pe"=>$qwe['fecha_pe'],
             "hora_pe"=>$qwe['hora_pe'],
             "fecha_fin"=>$qwe['fecha_fin'],
             "hora_fin"=>$qwe['hora_fin'],
             "estado"=>$qwe['estado'],
             "produccion_idproduccion"=>$qwe['produccion_idproduccion'],
             "etapas_produccion_idetapas_produccion"=>$qwe['etapas_produccion_idetapas_produccion'],
             "empleado_idempleado"=>$qwe['empleado_idempleado'],
             "grupo_etapas_idgrupo_etapas"=>$qwe['grupo_etapas_idgrupo_etapas']); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function listar_produccion_etapa($idproduccion,$idgrupo){
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
        $getCompra = $this->dbp->query("SELECT * FROM produccion_etapa 
        WHERE produccion_idproduccion = '$idproduccion' AND grupo_etapas_idgrupo_etapas='$idgrupo';");

        while($qwe=$this->dbp->fetch($getCompra)){
             $res=array("idproduccion_etapa"=>$qwe['idproduccion_etapa'],
             "fecha_pe"=>$qwe['fecha_pe'],
             "hora_pe"=>$qwe['hora_pe'],
             "fecha_fin"=>$qwe['fecha_fin'],
             "hora_fin"=>$qwe['hora_fin'],
             "estado"=>$qwe['estado'],
             "produccion_idproduccion"=>$qwe['produccion_idproduccion'],
             "etapas_produccion_idetapas_produccion"=>$qwe['etapas_produccion_idetapas_produccion'],
             "empleado_idempleado"=>$qwe['empleado_idempleado'],
             "grupo_etapas_idgrupo_etapas"=>$qwe['grupo_etapas_idgrupo_etapas']); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function eliminar_produccion_etapa($idprodEt) {
        $this->dbp->begin_transaction();
        try {
            // Verificar si el producto está relacionado en alguna tabla
            $relacionadas = [
                'uso_maquina' => 'No se puede eliminar porque hay registros en uso_maquina',
            ];
            
            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE produccion_etapa_idproduccion_etapa = ?";
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $idprodEt);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje);
                }
                $stmt->close();
            }

                $query = "DELETE FROM uso_maquina WHERE iduso_maquina = ?";
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para eliminar el producto");
                }
                $stmt->bind_param("i", $idprodEt);
                $stmt->execute();
                $stmt->close();
    
            // Confirmar transacción
            $this->dbp->commit();
            $res = array("success", "Se eliminó correctamente", "eliminar_produccion_etapa");
    
        } catch (Exception $e) {
            // Revertir transacción
            $this->dbp->rollback();
            $res = array("danger", $e->getMessage(), "eliminar_produccion_etapa");
        }
        // -----------------------------------------------------------------------------------------------
        // $operacionesEtapas = $this->dbp->query("DELETE FROM produccion_etapa WHERE idproduccion_etapa='$idprodEt';");

        // if($operacionesEtapas){
        //     $res = array("success", "Eliminacion Exitosa","eliminar_produccion_etapa");
        // }else{
        //     $res = array("danger", "No se pudo registrar","eliminar_produccion_etapa");
        // }   

        echo json_encode($res);
} 

public function registro_salida_produccion($cantidad,$idproduccion,$idproducto,$empresa){
    $idempresa = $this->getidempresa($empresa);
    // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa'");
    // $resultado = $consulta->fetch_assoc();
    // $totalRegistros = $resultado['total'];

    // if ($totalRegistros > 0) {
    //     $res = array("Error", "El registro ya existe","Error");
    // } else {
        // Insertar el nuevo registro
        $registroProveedor = $this->dbp->query("INSERT INTO salida_produccion(cantidad,produccion_idproduccion,producto_idproducto,empresa_idempresa) VALUES ('$cantidad','$idproduccion','$idproducto','$idempresa')");
        if ($registroProveedor === TRUE) {  
            $this->dbp->query("UPDATE produccion SET estado='1' WHERE idproduccion='$idproduccion'");                                                                                                                                                              
            $res = array("success", "Registro exitoso","registro_salida_produccion");
        } else {
            $res = array("danger", "No se pudo registrar",$cantidad);
        }
    // }
    //   echo ($medida);
    echo json_encode($res);
    // echo json_encode($res);
    
}
public function editar_salida_produccion($idsalida,$cantidad){
    // $idempresa = $this->getidempresa($empresa);
    // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa'");
    // $resultado = $consulta->fetch_assoc();
    // $totalRegistros = $resultado['total'];

    // if ($totalRegistros > 0) {
    //     $res = array("danger", "El registro ya existe","danger");
    // } else {
        // Insertar el nuevo registro
        $registroProveedor = $this->dbp->query("UPDATE salida_produccion SET cantidad='$cantidad' WHERE idsalida_produccion='$idsalida'");
        if($registroProveedor === TRUE) {                                                                                                                                                                
            $res = array("success", "Edicion exitosa","editar_salida_produccion");
        } else {
            $res = array("danger", "No se pudo registrar",$cantidad);
        }
        // }
    //   echo ($medida);
    echo json_encode($res);

}
public function listaSalidaProduccion($empresa) {
    $lista = [];
    $idempresa = $this->getidempresa($empresa);

    // Preparar la consulta
    $getPedido = $this->dbp->query("SELECT * FROM salida_produccion WHERE empresa_idempresa='$idempresa' ORDER BY idsalida_produccion DESC");

    while ($qwe = $this->dbp->fetch($getPedido)) {
        $res = array(
            "idsalida_produccion" => $qwe['idsalida_produccion'],
            "cantidad" => $qwe['cantidad'],
            "produccion_idproduccion" => $qwe['produccion_idproduccion'],
            "producto_idproducto" => $qwe['producto_idproducto']
        );
        array_push($lista, $res);
    }

    echo json_encode($lista, JSON_NUMERIC_CHECK);
}
public function listar_salida_produccion($idproduccion) {
    $lista = [];
    // $idempresa = $this->getidempresa($empresa); listar_produccion_etapa_porProduccion

    // Preparar la consulta
    $getPedido = $this->dbp->query("SELECT * FROM salida_produccion WHERE produccion_idproduccion='$idproduccion'");

    while ($qwe = $this->dbp->fetch($getPedido)) {
        $res = array(
            "idsalida_produccion" => $qwe['idsalida_produccion'],
            "cantidad" => $qwe['cantidad'],
            "produccion_idproduccion" => $qwe['produccion_idproduccion'],
            "producto_idproducto" => $qwe['producto_idproducto']
        );
        array_push($lista, $res);
    }

    echo json_encode($lista, JSON_NUMERIC_CHECK);
}
public function eliminar_salidaProduccion($idsalida){

        if (0 > 0) {
            $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbp->query("DELETE FROM salida_produccion WHERE idsalida_produccion = '$idsalida'");
            if ($registroProveedor === TRUE) {                                                                                                                                                    
                $res = array("success", "se elimino exitosamente","eliminar_salidaProduccion");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
}

public function listado_produccion_grupo_etapas($empresa) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $lista = [];
    $idempresa = $this->getidempresa($empresa);
    
    // Consulta para listar las etapas de producción asociadas a una empresa
    $getLista = $this->dbp->query("SELECT idproduccion FROM produccion");

    // Recorrer los resultados y agregarlos a la lista
    while ($etapa = $this->dbp->fetch($getLista)) {
        $res = array(
            "idproduccion" => $etapa['idproduccion'],
            "grupo_etapas" => []
        );

        $aux1 = $this->dbp->query("SELECT p.idproduccion, dtp.producto_idproducto 
                                   FROM produccion p 
                                   INNER JOIN detalle_produccion dtp 
                                   ON dtp.orden_produccion_idorden_produccion = p.orden_produccion_idorden_produccion 
                                   INNER JOIN orden_produccion op 
                                   ON op.idorden_produccion = dtp.orden_produccion_idorden_produccion
                                   WHERE p.idproduccion = '{$etapa['idproduccion']}' AND op.empresa_idempresa ='$idempresa'");

        $listagrp = [];
        while ($idMat = $this->dbp->fetch($aux1)) {
            $listagrp[] = $idMat['producto_idproducto'];
        }

        if (!empty($listagrp)) {
            $idsproducto = implode(",", $listagrp);

            $getPedido = $this->dbp->query("SELECT * 
                                            FROM grupo_productos 
                                            WHERE producto_idproducto IN ($idsproducto)");

            $arrEP = [];
            while ($etp2 = $this->dbp->fetch($getPedido)) {
                $arrEP[] = $etp2['grupo_etapas_idgrupo_etapas'];
                $res2 = array(
                    "grupo_etapas_idgrupo_etapas" => $etp2['grupo_etapas_idgrupo_etapas'],
                    "etapas_produccion" => []
                );
                array_push($res['grupo_etapas'], $res2);
            }

            if (!empty($arrEP)) {
                $idsetPro = implode(",", $arrEP);

                foreach ($res['grupo_etapas'] as &$grupo_etapa) {
                    $getPedido22 = $this->dbp->query("SELECT * 
                                                      FROM etapa_orden 
                                                      WHERE grupo_etapas_idgrupo_etapas = '{$grupo_etapa['grupo_etapas_idgrupo_etapas']}'");

                    while ($aux2 = $this->dbp->fetch($getPedido22)) {
                        $res3 = array(
                            "etapas_produccion_idetapas_produccion" => $aux2['etapas_produccion_idetapas_produccion'],
                        );
                        array_push($grupo_etapa['etapas_produccion'], $res3);
                    }
                }
            }
        }

        array_push($lista, $res);
    }

    echo json_encode($lista);
}

public function registrar_grupo_etapa($nombre,$empresa,$rubro){
    $idempresa = $this->getidempresa($empresa);
    $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM grupo_etapas WHERE nombre = '$nombre' AND empresa_idempresa = '$idempresa'");
    $resultado = $consulta->fetch_assoc();
    $totalRegistros = $resultado['total'];

    if ($totalRegistros > 0) {
        $res = array("danger", "Ya existe un registro con ese nombre","registrar_grupo_etapa");
    } else {
        // Insertar el nuevo registro
        $registroProveedor = $this->dbp->query("INSERT INTO grupo_etapas(nombre,empresa_idempresa,rubro_idrubro) VALUES ('$nombre','$idempresa','$rubro')");
        if ($registroProveedor === TRUE) {                                                                                                                                                                
            $res = array("success", "Registro exitoso","registroCaracteristicas");
        } else {
            $res = array("danger", "No se pudo registrar",$nombre);
        }
    }
    echo json_encode($res);
    
}
public function editar_grupo_etapas($id,$nombre,$empresa) {
    // ini_set('display_errors', 1);
    // ini_set('display_startup_errors', 1);
    // error_reporting(E_ALL);
    // echo json_encode(array($id,$nombre,$empresa));
    $idempresa = $this->getidempresa($empresa);
    $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM grupo_etapas WHERE nombre = '$nombre' AND empresa_idempresa='$idempresa'");
    $resultado = $consulta->fetch_assoc();
    $totalRegistros = $resultado['total'];

    if ($totalRegistros > 0) {
        $res = array("danger", "El registro ya existe","editar_grupo_etapas");
    }else {
        // Insertar el nuevo registro
        $registroListaCompra = $this->dbp->query("UPDATE grupo_etapas
                                SET nombre = '$nombre'
                                WHERE idgrupo_etapas = '$id';");
        if ($registroListaCompra === TRUE) {                                                                                                                                                                
            $res = array("success", "Edición exitosa","editar_grupo_etapas");
        } else {
            $res = array("danger", "No se pudo editar",$id,$nombre,$empresa);
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