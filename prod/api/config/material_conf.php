<?php
require_once "../../db/db.php";
class Material_config extends DB{
    
    public function registrar_tipo_material($nombre,$detalle,$empresa){
        $seccion = "";

        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM tipo WHERE empresa_idempresa = ?  AND (nombre_tipo = ? )";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("danger","No se pudo preparar la consulta","registrar_tipo_material"));
            return;
        }
        $stmt->bind_param("is",$idempresa,$nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if($count > 0){
            $res = array("danger","Ya existe una entrada con el mismo nombre","registrar_tipo_material");
        }else{
            $query = "INSERT INTO tipo (nombre_tipo,detalle,empresa_idempresa) VALUE (?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta","registrar_tipo_material"));
                return;
            }
            $stmt->bind_param("ssi",$nombre,$detalle,$idempresa);
            $registro = $stmt->execute();

            if($registro){
                $res = array("success","Se registro correctamente","registrar_tipo_material");
            }else{
                $res = array("danger", "No se registro correctamente: " . $stmt->error,"registrar_tipo_material");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    public function registrar_material($fecha_rm,$hora_rm,$nombre_mat,$estado,$codigo_mat,$precio,$divisa,$empresa,$tipo_idtipo,$medida_idmedida,$seccion_idseccion,$rubro_idrubro){

        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM material WHERE empresa_idempresa = ?  AND (nombre_mat = ? OR codigo_mat = ? )";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("danger","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("iss",$idempresa,$nombre_mat,$codigo_mat);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if($count > 0){
            $res = array("danger","Ya existe una entrada con el mismo nombre o código.","registromaterial");
        }else{
            $query = "INSERT INTO material (fecha_rm,hora_rm,nombre_mat,estado,codigo_mat,precio,divisa_iddivisa,empresa_idempresa,tipo_idtipo,medida_idmedida,seccion_idseccion,rubro_idrubro) VALUE (?,?,?,?,?,?,?,?,?,?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta"));
                return;
            }
            $stmt->bind_param("sssisdiiiiii",$fecha_rm,$hora_rm,$nombre_mat,$estado,$codigo_mat,$precio,$divisa,$idempresa,$tipo_idtipo,$medida_idmedida,$seccion_idseccion,$rubro_idrubro);
            $registro_material = $stmt->execute();

            if($registro_material){
                $res = array("success","El material se registro correctamente","registromaterial");
            }else{
                $res = array("danger", "No se registro correctamente: " . $stmt->error,"registromaterial");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    public function editar_material($idmaterial,$nombre_mat,$estado,$codigo_mat,$precio,$divisa,$empresa,$tipo_idtipo,$medida_idmedida,$seccion_idseccion,$rubro_idrubro){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM material WHERE (nombre_mat = ? OR codigo_mat = ? ) AND empresa_idempresa = ?  AND idmaterial != ?";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("danger","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("ssii",$nombre_mat,$codigo_mat,$idempresa,$idmaterial);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res = array("danger","Ya existe una entrada con el mismo nombre o código.","editar_material");
        }else{
            $query = "UPDATE material SET nombre_mat = ? , estado = ?,codigo_mat = ?,precio = ?,divisa_iddivisa = ?,tipo_idtipo = ?, medida_idmedida = ?, seccion_idseccion = ?, rubro_idrubro = ? WHERE idmaterial = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);

            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta","editar_material"));
                return;
            }

            $stmt->bind_param("sisdiiiiiii",$nombre_mat,$estado,$codigo_mat,$precio,$divisa,$tipo_idtipo,$medida_idmedida,$seccion_idseccion,$rubro_idrubro,$idmaterial,$idempresa);
            $editar_material = $stmt->execute();

            if($editar_material){
                $res = array("success","Se guardaron los cambios correctamente","editar_material");
            }else{
                $res = array("danger", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_material");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    public function editar_tipo_material($id,$nombre,$detalle,$empresa){

        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM tipo WHERE (nombre_tipo = ? ) AND empresa_idempresa = ?  AND idtipo != ?";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("danger","No se pudo preparar la consulta","editar_tipo_material"));
            return;
        }
        $stmt->bind_param("sii",$nombre,$idempresa,$id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res = array("danger","Ya existe una entrada con el mismo nombre","editar_tipo_material");
        }else{
            $query = "UPDATE tipo SET nombre_tipo = ? , detalle = ? WHERE idtipo = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);

            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta","editar_tipo_material"));
                return;
            }

            $stmt->bind_param("ssii",$nombre,$detalle,$id,$idempresa);
            $editar_material = $stmt->execute();

            if($editar_material){
                $res = array("success","Se guardaron los cambios correctamente","editar_tipo_material");
            }else{
                $res = array("danger", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_tipo_material");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    public function editar_estado($idmaterial,$estado,$empresa){

        $idempresa = $this->getidempresa($empresa);
       
            $query = "UPDATE material SET estado = ? WHERE idmaterial = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);

            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta","editar_estado"));
                return;
            }

            $stmt->bind_param("iii",$estado,$idmaterial,$idempresa);
            $editar_material = $stmt->execute();

            if($editar_material){
                $res = array("success","Se guardaron los cambios correctamente","editar_estado");
            }else{
                $res = array("danger", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_estado");
            }
            $stmt->close();
        
        echo json_encode($res);


    }

   
    public function listar_material($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $query = "SELECT m.idmaterial,m.fecha_rm, m.hora_rm,m.nombre_mat,m.estado,m.codigo_mat,m.precio,m.divisa_iddivisa,m.tipo_idtipo,m.medida_idmedida,m.seccion_idseccion,m.rubro_idrubro FROM material AS m WHERE m.empresa_idempresa =? ORDER BY m.idmaterial DESC";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("danger" , "No se pudo preparar la consulta","listar_material"));
            return;
        }
        $stmt->bind_param("i",$idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result === false){
            echo json_encode(array("danger","Error al ejecutar la consulta","listar_material"));
            return;
        }
        while ($material = $result->fetch_assoc()) {
            $res = array(
                "id" => $material['idmaterial'],
                "fecha" => $material['fecha_rm'],
                "hora" => $material['hora_rm'],
                "nombre" => $material['nombre_mat'],
                "estado" => $material['estado'],
                "codigo" => $material['codigo_mat'],
                "precio" => $material['precio'],
                "divisa_iddivisa" => $material['divisa_iddivisa'],
                "tipo" => $material['tipo_idtipo'],
                "medida" => $material['medida_idmedida'],
                "seccion" => $material['seccion_idseccion'],
                "rubro_idrubro" => $material['rubro_idrubro']

            );
            array_push($lista,$res);
        }
        $stmt->close();
        echo json_encode($lista);

    }
    public function listar_tipo_material($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $query = "SELECT t.idtipo, t.nombre_tipo, t.detalle FROM tipo AS t WHERE t.empresa_idempresa =? ORDER BY t.idtipo DESC";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("danger" , "No se pudo preparar la consulta","listar_tipo_material"));
            return;
        }
        $stmt->bind_param("i",$idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result === false){
            echo json_encode(array("danger","Error al ejecutar la consulta","listar_tipo_material"));
            return;
        }
        while ($tipo_material = $result->fetch_assoc()) {
            $res = array(
                "id" => $tipo_material['idtipo'],
                "nombre" => $tipo_material['nombre_tipo'],
                "detalle" => $tipo_material['detalle']
            );
            array_push($lista,$res);
        }
        $stmt->close();
        echo json_encode($lista);

    }
    
    public function listar_evaluacion_caracteristicas_de_ctc($id){
        $lista = [];
     
        $query = "SELECT evc.idevaluacion_caracteristica,
                    evc.evaluacion,
                    evc.detalle,
                    c.caracteristica,
                    evc.criterio_control_calidad_idcriterio_control_calidad,
                    c.tipo
                    FROM control_calidad cc
                    INNER JOIN detalle_control_calidad dcc ON dcc.control_calidad_idcontrol_calidad = cc.idcontrol_calidad
                    INNER JOIN criterio_control_calidad ctc ON ctc.detalle_control_calidad_iddetalle_control_calidad = dcc.iddetalle_control_calidad
                    INNER JOIN evaluacion_caracteristica evc ON evc.criterio_control_calidad_idcriterio_control_calidad = ctc.idcriterio_control_calidad 
                    INNER JOIN caracteristicas c ON c.idcaracteristicas = evc.caracteristicas_idcaracteristicas
                    WHERE cc.idcontrol_calidad = ? ORDER BY evc.idevaluacion_caracteristica DESC";
        $stmt = $this->dbp->prepare($query);
    
        if($stmt === false){
            echo json_encode(array("danger", "No se pudo preparar la consulta", "listar_evaluacion_caracteristicas_de_ctc"));
            return;
        }
        
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if($result === false){
            echo json_encode(array("danger", "Error al ejecutar la consulta", "listar_evaluacion_caracteristicas_de_ctc"));
            return;
        }
        
        while ($compra = $result->fetch_assoc()) {
            $res = array(
                "idevaluacion_caracteristica" => $compra['idevaluacion_caracteristica'],
                "evaluacion" => $compra['evaluacion'],
                "detalle" => $compra['detalle'],
                "caracteristica" => $compra['caracteristica'],
                "criterio_control_calidad_idcriterio_control_calidad" => $compra['criterio_control_calidad_idcriterio_control_calidad'],
                "tipo" => $compra['tipo'],
                
            );
            array_push($lista, $res);
        }
    
        $stmt->close();
        echo json_encode($lista);
    }
    public function eliminar_tipo_material($id, $empresa){
    // Iniciar transacción
    $this->dbp->begin_transaction();
        
    try {
        // Verificar si el producto está relacionado en alguna tabla
        $relacionadas = [
            'material' => 'No se puede eliminar porque hay registros en material',
        ];
        
        foreach ($relacionadas as $tabla => $mensaje) {
            $query = "SELECT 1 FROM $tabla WHERE tipo_idtipo = ?";
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
            // $consulta = $this->dbp->query("SELECT idproducto FROM producto WHERE idproduct_comercial='$id';");
            // $result = $consulta->fetch_assoc();
            // $idProducto = $result['idproducto'];

            $query = "DELETE FROM tipo WHERE idtipo = ?";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el producto");
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();

        // Confirmar transacción
        $this->dbp->commit();
        $res = array("success", "Se eliminó correctamente", "eliminar_tipo_material");

    } catch (Exception $e) {
        // Revertir transacción
        $this->dbp->rollback();
        $res = array("danger", $e->getMessage(), "eliminar_tipo_material");
    }
    echo json_encode($res);
}

    public function eliminar_material($id) {
        // Iniciar transacción
        $this->dbp->begin_transaction();
        
        try {
            // Verificar si el producto está relacionado en alguna tabla
            $relacionadas = [
                'detalle_compra' => 'No se puede eliminar porque hay registros en detalle_compra',
                'proveedor_has_material' => 'No se puede eliminar porque hay registros en proveedor_has_material',
                'detalle_pedido' => 'No se puede eliminar porque hay registros en detalle_pedido',
                'detalle_control_calidad' => 'No se puede eliminar porque hay registros en detalle_control_calidad',
                'almacen_material' => 'No se puede eliminar porque hay registros en almacen_material',
                'etapas_produccion_has_material' => 'No se puede eliminar porque hay registros en etapas_produccion_has_material',
                'detalle_solicitud_material' => 'No se puede eliminar porque hay registros en detalle_solicitud_material',
                'detalle_estandar_producto' => 'No se puede eliminar porque hay registros en detalle_estandar_producto',
                
            ];
            
            foreach ($relacionadas as $tabla => $mensaje) {
                if($tabla == "detalle_control_calidad"){
                    $query = "SELECT 1 FROM $tabla WHERE entidad_id = ? AND '$tabla[entidad_tipo]' == 'Material'";
                }else{
                    $query = "SELECT 1 FROM $tabla WHERE material_idmaterial = ?";
                }
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

            //ELIMINAR MATERIAL
                $query = "DELETE FROM material WHERE idmaterial = ?";
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para eliminar el producto");
                }
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();
    
            // Confirmar transacción
            $this->dbp->commit();
            $res = array("success", "Se eliminó correctamente", "eliminar_material");
                
        } catch (Exception $e) {
            // Revertir transacción
            $this->dbp->rollback();
            $res = array("danger", $e->getMessage(), "eliminar_material");
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