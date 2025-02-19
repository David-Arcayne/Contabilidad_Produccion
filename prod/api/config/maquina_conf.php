<?php
require_once "../../db/db.php";
class Maquina_conf extends DB{

    
    public function registrar_tipomaquina($tipo,$detalle,$empresa){
        

        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM tipo_maquina WHERE empresa_idempresa = ?  AND tipo = ? ";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("is",$idempresa,$tipo);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if($count > 0){
            $res = array("Error","Ya existe una entrada con el mismo tipo.","registrar_tipomaquina");
        }else{
            $query = "INSERT INTO tipo_maquina (tipo,detalle,empresa_idempresa) VALUE (?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta"));
                return;
            }
            $stmt->bind_param("ssi",$tipo,$detalle,$idempresa);
            $registro_tipomaquina = $stmt->execute();

            if($registro_tipomaquina){
                $res = array("ok","Se registro correctamente","registrar_tipomaquina");
            }else{
                $res = array("Error", "No se registro correctamente: " . $stmt->error,"registrar_tipomaquina");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
 
    public function editar_tipomaquina($id,$tipo,$detalle,$empresa){

        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM tipo_maquina WHERE tipo = ?  AND empresa_idempresa = ?  AND idtipo_maquina != ?";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("sii",$tipo,$idempresa,$id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res = array("Error","Ya existe una entrada con el mismo tipo","editar_tipomaquina");
        }else{
            $query = "UPDATE tipo_maquina SET tipo = ? , detalle = ? WHERE idtipo_maquina = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);

            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta","editar_tipomaquina"));
                return;
            }

            $stmt->bind_param("ssii", $tipo, $detalle, $id, $idempresa);
            $editar_tipomaquina = $stmt->execute();

            if($editar_tipomaquina){
                $res = array("ok","Se guardaron los cambios correctamente","editar_tipomaquina");
            }else{
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_tipomaquina");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    
    
    

     
    public function listar_tipomaquina($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $query = "SELECT tm.idtipo_maquina, tm.tipo, tm.detalle  FROM tipo_maquina AS tm WHERE tm.empresa_idempresa =?";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("Error" , "No se pudo preparar la consulta","listar_tipomaquina"));
            return;
        }
        $stmt->bind_param("i",$idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result === false){
            echo json_encode(array("Error","Error al ejecutar la consulta","listar_tipomaquina"));
            return;
        }
        while ($tipo_maquina = $result->fetch_assoc()) {
            $res = array(
                "id" => $tipo_maquina['idtipo_maquina'],
                "tipo" => $tipo_maquina['tipo'],
                "detalle" => $tipo_maquina['detalle'],
                

            );
            array_push($lista,$res);
        }
        $stmt->close();
        echo json_encode($lista);

    }
    public function eliminar_tipomaquina($id,$empresa){

        $control = 1;
        $query = "SELECT * FROM tipo_maquina tm INNER JOIN maquina m ON m.tipo_maquina_idtipo_maquina = tm.idtipo_maquina WHERE tm.idtipo_maquina = ?"; 
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("Error",'No se puede eliminar porque hay registros en maquina',"eliminar_tipomaquina");
            $control = 0;

        }
        $stmt->close();
        


        if ($control == 1) {
            $idempresa = $this->getidempresa($empresa);
            $query = "DELETE FROM tipo_maquina WHERE idtipo_maquina = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);

            if ($stmt === false) {
                echo json_encode(array("Error" => "No se pudo preparar la consulta"));
                return;
            }

            $stmt->bind_param("ii",$id,$idempresa);
            $del = $stmt->execute();

            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_tipomaquina");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_tipomaquina");
            }
            $stmt->close();
        }
        echo json_encode($res);

        
    }
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }   
    public function registrar_maquina($nombre_maq,$estado,$idtipo_maquina,$seccion_idseccion,$rubro,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM maquina m
            inner join tipo_maquina tm on m.tipo_maquina_idtipo_maquina = tm.idtipo_maquina
        WHERE  m.nombre_maq = ?  AND tm.empresa_idempresa = ?";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("si",$nombre_maq,$idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        
        if($count > 0){
            $res = array("Error","Ya existe una entrada con el mismo nombre","registrar_maquina");
        }else{
            $query = "INSERT INTO maquina (nombre_maq,estado,tipo_maquina_idtipo_maquina,seccion_idseccion,rubro_idrubro) VALUE (?,?,?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta"));
                return;
            }
            $stmt->bind_param("siiii",$nombre_maq,$estado,$idtipo_maquina,$seccion_idseccion,$rubro);
            $registro_maquina = $stmt->execute();

            if($registro_maquina){
                $res = array("ok","Se registro correctamente","registrar_maquina");
            }else{
                $res = array("Error", "No se registro correctamente: " . $stmt->error,"registrar_maquina");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    
    public function editar_maquina($idmaquina,$nombre_maq,$tipo_maquina_idtipo_maquina,$seccion_idseccion,$rubro,$empresa){
        $idempresa = $this->getidempresa($empresa);

        $verificarQuery = "SELECT COUNT(*) AS count FROM maquina m 
            INNER JOIN tipo_maquina tp on tp.idtipo_maquina = m.tipo_maquina_idtipo_maquina 
            WHERE m.nombre_maq = ?  AND m.idmaquina != ? And tp.empresa_idempresa = ? ";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("sii",$nombre_maq,$idmaquina,$idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res = array("Error","Ya existe una entrada con el mismo nombre","editar_maquina");
        }else{
            $query = "UPDATE maquina SET nombre_maq = ? , estado = ?,tipo_maquina_idtipo_maquina = ?, seccion_idseccion = ?, rubro_idrubro = ? WHERE idmaquina = ? ";
            $stmt = $this->dbp->prepare($query);

            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta","editar_maquina"));
                return;
            }

            $stmt->bind_param("siiiii",$nombre_maq,$estado,$tipo_maquina_idtipo_maquina,$seccion_idseccion,$rubro,$idmaquina);
            $editar_maquina = $stmt->execute();

            if($editar_maquina){
                $res = array("ok","Se guardaron los cambios correctamente","editar_maquina");
            }else{
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_maquina");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    
    public function editar_estado_maquina($idmaquina,$estado){
       
            $query = "UPDATE maquina SET estado = ? WHERE idmaquina = ? ";
            $stmt = $this->dbp->prepare($query);

            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta","editar_estado"));
                return;
            }

            $stmt->bind_param("ii",$estado,$idmaquina);
            $editar_maquina = $stmt->execute();

            if($editar_maquina){
                $res = array("ok","Se guardaron los cambios correctamente Estado","editar_estado");
            }else{
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_estado");
            }
            $stmt->close();
        
        echo json_encode($res);


    }
   
    public function listar_maquina($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $query = "SELECT m.idmaquina,m.nombre_maq,m.estado,m.tipo_maquina_idtipo_maquina,seccion_idseccion,rubro_idrubro FROM `maquina` AS m INNER JOIN tipo_maquina AS tm ON m.tipo_maquina_idtipo_maquina = tm.idtipo_maquina WHERE tm.empresa_idempresa = ? ORDER BY m.idmaquina DESC;";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("Error" , "No se pudo preparar la consulta","listar_maquina"));
            return;
        }
        $stmt->bind_param("i",$idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result === false){
            echo json_encode(array("Error","Error al ejecutar la consulta","listar_maquina"));
            return;
        }
        while ($maquina = $result->fetch_assoc()) {
            $res = array(
                "id" => $maquina['idmaquina'],
                "nombre" => $maquina['nombre_maq'],
                "estado" => $maquina['estado'],
                "tipo" => $maquina['tipo_maquina_idtipo_maquina'],
                "seccion" => $maquina['seccion_idseccion'],
                "rubro_idrubro" => $maquina['rubro_idrubro']

            );
            array_push($lista,$res);
        }
        $stmt->close();
        echo json_encode($lista);

    }
    public function eliminar_maquina($idmaquina){
        $control = 1;
        $query = "SELECT * FROM maquina m INNER JOIN etapas_produccion_has_maquina x ON x.maquina_idmaquina = m.idmaquina WHERE m.idmaquina = ?"; 
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("Error",'No se puede eliminar porque hay registros en produccion',"eliminar_maquina");
            $control = 0;

        }
        $stmt->close();
        if ($control == 1) {
            $query = "SELECT * FROM maquina m INNER JOIN variables_proceso x ON x.maquina_idmaquina = m.idmaquina WHERE m.idmaquina = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("Error",'No se puede eliminar porque hay registros en variable proceso maquina',"eliminar_maquina");
                $control = 0;
            }
            $stmt->close();
        }
        if ($control == 1) {
            $query = "SELECT * FROM maquina m INNER JOIN calendario x ON x.maquina_idmaquina = m.idmaquina WHERE m.idmaquina = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("Error",'No se puede eliminar porque hay registros en calendario',"eliminar_maquina");
                $control = 0;
            }
            $stmt->close();
        }
        if ($control == 1) {
            $query = "SELECT * FROM maquina m INNER JOIN mantenimiento x ON x.maquina_idmaquina = m.idmaquina WHERE m.idmaquina = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("Error",'No se puede eliminar porque hay registros en maquinas-mantenimiento',"eliminar_maquina");
                $control = 0;
            }
            $stmt->close();
        }
        
        if ($control == 1) {
            $query = "SELECT * FROM maquina m INNER JOIN registro_usu x ON x.maquina_idmaquina = m.idmaquina WHERE m.idmaquina = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("Error",'No se puede eliminar porque hay registros en uso de maquina',"eliminar_maquina");
                $control = 0;
            }
            $stmt->close();
        }
       
        if ($control == 1) {
            $query = "DELETE FROM maquina WHERE idmaquina = ?";
            $stmt = $this->dbp->prepare($query);

            if ($stmt === false) {
                echo json_encode(array("Error" => "No se pudo preparar la consulta"));
                return;
            }

            $stmt->bind_param("i",$idmaquina);
            $del = $stmt->execute();

            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_maquina");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_maquina");
            }
            $stmt->close();
        }
        echo json_encode($res);

    }
    function registrar_variable_proceso($variable,$detalle,$idmaquina){
        
        $verificarQuery = "SELECT COUNT(*) AS count FROM variables_proceso WHERE  (variable = ? ) AND maquina_idmaquina = ?";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("si",$variable,$idmaquina);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        
        if($count > 0){
            $res = array("Error","Ya existe una entrada con el mismo nombre","registrar_variable_proceso");
        }else{
            $query = "INSERT INTO variables_proceso (variable,detalle,maquina_idmaquina) VALUE (?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta","registrar_variable_proceso"));
                return;
            }
            $stmt->bind_param("ssi",$variable,$detalle,$idmaquina);
            $registro_maquina = $stmt->execute();

            if($registro_maquina){
                $res = array("ok","Se registro correctamente","registrar_variable_proceso");
            }else{
                $res = array("Error", "No se registro correctamente: " . $stmt->error,"registrar_variable_proceso");
            }
            $stmt->close();
        }
        echo json_encode($res);

    }
    public function listar_variables_proceso($idmaquina){
        $lista = [];
        $query = "SELECT vp.idvariables_proceso,vp.variable,vp.detalle,vp.maquina_idmaquina FROM variables_proceso AS vp WHERE vp.maquina_idmaquina = ? ORDER BY vp.idvariables_proceso DESC";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("Error" , "No se pudo preparar la consulta","listar_variables_proceso"));
            return;
        }
        $stmt->bind_param("i",$idmaquina);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result === false){
            echo json_encode(array("Error","Error al ejecutar la consulta","listar_variables_proceso"));
            return;
        }
        while ($maquina = $result->fetch_assoc()) {
            $res = array(
                "id" => $maquina['idvariables_proceso'],
                "variable" => $maquina['variable'],
                "detalle" => $maquina['detalle'],
                "idmaquina"=>$maquina['maquina_idmaquina']

            );
            array_push($lista,$res);
        }
        $stmt->close();
        echo json_encode($lista);

    }
    public function editar_variable_proceso($id,$variable,$detalle,$idmaquina){
        $verificarQuery = "SELECT COUNT(*) AS count FROM variables_proceso WHERE  (variable = ? ) AND maquina_idmaquina = ? AND idvariables_proceso != ?";
        

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("sii",$variable,$idmaquina,$id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res = array("Error","Ya existe una entrada con el mismo tipo","editar_variable_proceso");
        }else{
            $query = "UPDATE variables_proceso SET variable = ? , detalle = ? WHERE idvariables_proceso = ? AND  maquina_idmaquina= ?";
            $stmt = $this->dbp->prepare($query);

            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta","editar_variable_proceso"));
                return;
            }

            $stmt->bind_param("ssii", $variable, $detalle, $id, $idmaquina);
            $editar = $stmt->execute();

            if($editar){
                $res = array("ok","Se guardaron los cambios correctamente","editar_variable_proceso");
            }else{
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_variable_proceso");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    public function eliminar_variable_proceso_maquina($id,$idmaquina){

        $control = 1;
        $query = "SELECT * FROM variables_proceso vp INNER JOIN detalle_uso x ON x.variables_proceso_idvariables_proceso = vp.idvariables_proceso WHERE vp.idvariables_proceso = ?"; 
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("Error",'No se puede eliminar porque hay registros en informe de uso de maquina',"eliminar_variable_proceso_maquina");
            $control = 0;

        }
        $stmt->close();
        


        if ($control == 1) {
            $query = "DELETE FROM variables_proceso WHERE idvariables_proceso = ? AND maquina_idmaquina = ?";
            $stmt = $this->dbp->prepare($query);

            if ($stmt === false) {
                echo json_encode(array("Error" => "No se pudo preparar la consulta"));
                return;
            }

            $stmt->bind_param("ii",$id,$idmaquina);
            $del = $stmt->execute();

            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_variable_proceso_maquina");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_variable_proceso_maquina");
            }
            $stmt->close();
        }
        echo json_encode($res);

        
    }
    public function registrar_detalle_uso_maquina($dato_variable,$tiempo,$variables_proceso_idvariables_proceso,$control_unidad_tiempo_idcontrol_unidad_tiempo,$uso_maquina_iduso_maquina){
        // $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registro = $this->dbp->query("INSERT INTO detalle_uso_maquina(dato_variable,tiempo,variables_proceso_idvariables_proceso,control_unidad_tiempo_idcontrol_unidad_tiempo,uso_maquina_iduso_maquina) VALUES ('$dato_variable','$tiempo','$variables_proceso_idvariables_proceso','$control_unidad_tiempo_idcontrol_unidad_tiempo','$uso_maquina_iduso_maquina')");
            if ($registro === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registrar_detalle_uso_maquina");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }
    public function listar_detalle_uso_maquina($iduso_maq) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbp->query("SELECT * FROM detalle_uso_maquina WHERE uso_maquina_iduso_maquina = '$iduso_maq' ORDER BY iddetalle_uso_maquina DESC");
    
        while ($qwe = $this->dbp->fetch($getPedido)) {
            $res = array(
                "iddetalle_uso_maquina" => $qwe['iddetalle_uso_maquina'],
                "dato_variable" => $qwe['dato_variable'],
                "tiempo" => $qwe['tiempo'],
                "variables_proceso_idvariables_proceso" => $qwe['variables_proceso_idvariables_proceso'],
                "control_unidad_tiempo_idcontrol_unidad_tiempo" => $qwe['control_unidad_tiempo_idcontrol_unidad_tiempo'],
                "uso_maquina_iduso_maquina" => $qwe['uso_maquina_iduso_maquina']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function editar_detalle_uso_maquina($id,$variable,$tiempo,$id_var_proceso,$id_unidad_tiempo) {
        // $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE detalle_uso_maquina
                                    SET dato_variable = '$variable',
                                    tiempo = '$tiempo',
                                    variables_proceso_idvariables_proceso = '$id_var_proceso',
                                    control_unidad_tiempo_idcontrol_unidad_tiempo = '$id_unidad_tiempo'
                                    WHERE iddetalle_uso_maquina = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editar_detalle_uso_maquina");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }
    public function eliminar_detalle_uso_maquina($id){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $eliminar = $this->dbp->query("DELETE FROM detalle_uso_maquina WHERE iddetalle_uso_maquina = '$id'");
                if ($eliminar === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminar_detalle_uso_maquina");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }

}

?>