<?php
require_once "../../db/db.php";
class Sub_producto_conf extends DB{
    public function registrar_sub_producto($nombre, $codigo, $detalle, $producto_idproducto, $medida_idmedida, $empresa) {
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe un subproducto con el mismo código para el producto en la misma empresa
        $verificarQuery = "SELECT COUNT(*) AS count FROM sub_producto WHERE   codigo = ? AND idempresa = ?";
        
        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta"));
            return;
        }
        
        // Vincula los parámetros
        $stmt->bind_param("si", $codigo, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        // Si ya existe un subproducto con el mismo código, enviar un mensaje de error
        if ($count > 0) {
            $res = array("Error", "Ya existe un subproducto con el mismo código para esta empresa.", "registrar_sub_producto");
        } else {
            // Insertar un nuevo subproducto
            $query = "INSERT INTO sub_producto (nombre, codigo, detalle, producto_idproducto, medida_idmedida, idempresa) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->dbp->prepare($query);
    
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_sub_producto"));
                return;
            }
    
            // Vincula los parámetros para insertar el subproducto
            $stmt->bind_param("sssiii", $nombre, $codigo, $detalle, $producto_idproducto, $medida_idmedida, $idempresa);
            $registro_sub_producto = $stmt->execute();
    
            // Verifica si se registró correctamente
            if ($registro_sub_producto) {
                $res = array("ok", "El subproducto se registró correctamente", "registrar_sub_producto");
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registrar_sub_producto");
            }
            $stmt->close();
        }
        echo json_encode($res);
    }
    public function editar_sub_producto($idsub_producto, $nombre, $codigo, $detalle, $producto_idproducto, $medida_idmedida, $empresa) {
        $idempresa = $this->getidempresa($empresa);
    
        $verificarQuery = "SELECT COUNT(*) AS count FROM sub_producto WHERE  codigo = ? AND idsub_producto != ? AND idempresa = ?";
        
        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta"));
            return;
        }
    
        $stmt->bind_param("sii", $codigo, $idsub_producto, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe un subproducto con el mismo código", "editar_sub_producto");
        } else {
            $query = "UPDATE sub_producto SET nombre = ?, codigo = ?, detalle = ?, producto_idproducto = ?, medida_idmedida = ?, idempresa = ? WHERE idsub_producto = ?";
            $stmt = $this->dbp->prepare($query);
    
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_sub_producto"));
                return;
            }
    
            $stmt->bind_param("sssiiii", $nombre, $codigo, $detalle, $producto_idproducto, $medida_idmedida, $idempresa, $idsub_producto);
            $editar_sub_producto = $stmt->execute();
    
            if ($editar_sub_producto) {
                $res = array("ok", "Se guardaron los cambios correctamente", "editar_sub_producto");
            } else {
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error, "editar_sub_producto");
            }
            $stmt->close();
        }
    
        echo json_encode($res);
    }
    public function listar_sub_productos($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        $query = "SELECT sp.idsub_producto, sp.nombre, sp.codigo, sp.detalle, sp.producto_idproducto, sp.medida_idmedida 
                  FROM sub_producto AS sp 
                  WHERE sp.idempresa = ? ORDER BY sp.idsub_producto DESC";
        $stmt = $this->dbp->prepare($query);
    
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "listar_sub_productos"));
            return;
        }
    
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result === false) {
            echo json_encode(array("Error", "Error al ejecutar la consulta", "listar_sub_productos"));
            return;
        }
    
        while ($sub_producto = $result->fetch_assoc()) {
            $res = array(
                "idsub_producto" => $sub_producto['idsub_producto'],
                "nombre" => $sub_producto['nombre'],
                "codigo" => $sub_producto['codigo'],
                "detalle" => $sub_producto['detalle'],
                "producto_idproducto" => $sub_producto['producto_idproducto'],
                "medida_idmedida" => $sub_producto['medida_idmedida']
            );
            array_push($lista, $res);
        }
    
        $stmt->close();
        echo json_encode($lista);
    }
    
    public function eliminar_sub_producto($id) {
        $this->dbp->begin_transaction();
        
        try {
            // $relacionadas = [
            //     'otra_tabla_relacionada' => 'No se puede eliminar porque hay registros relacionados con este subproducto',
            // ];
            
            // foreach ($relacionadas as $tabla => $mensaje) {
            //     $query = "SELECT 1 FROM $tabla WHERE sub_producto_idsub_producto = ?";
            //     $stmt = $this->dbp->prepare($query);
            //     if ($stmt === false) {
            //         throw new Exception("No se pudo preparar la consulta para verificar $tabla");
            //     }
            //     $stmt->bind_param("i", $id);
            //     $stmt->execute();
            //     $result = $stmt->get_result();
            //     if ($result->num_rows > 0) {
            //         throw new Exception($mensaje);
            //     }
            //     $stmt->close();
            // }
    
            $query = "DELETE FROM sub_producto WHERE idsub_producto = ?";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el subproducto");
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();
    
            $this->dbp->commit();
            $res = array("ok", "Se eliminó correctamente", "eliminar_sub_producto");
    
        } catch (Exception $e) {
            $this->dbp->rollback();
            $res = array("Error", $e->getMessage(), "eliminar_sub_producto");
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