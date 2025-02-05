<?php
require_once "../../db/db.php";
class Producto_estado extends DB{
     
    
    public function registro_estado_producto($tipos_estado, $descripcion, $estado, $empresa) {
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe un estado de producto con el mismo nombre en la misma empresa
        $verificarQuery = "SELECT COUNT(*) AS count FROM estados_productos WHERE tipos_estado = ? AND id_empresa = ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registro_estado_producto"));
            return;
        }
    
        $stmt->bind_param("si", $tipos_estado, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if($count > 0){
            $res = array("Error", "Ya existe un estado de producto con el mismo nombre en esta empresa.", "registro_estado_producto");
        } else {
            // Insertar el nuevo estado de producto
            $query = "INSERT INTO estados_productos (tipos_estado, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            
            $stmt = $this->dbcm->prepare($query);
            if($stmt === false){
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registro_estado_producto"));
                return;
            }
            
            $stmt->bind_param("ssii", $tipos_estado, $descripcion, $estado, $idempresa);
            $registro = $stmt->execute();
            
            if($registro){
                $res = array("ok", "Se registró correctamente el estado de producto", "registro_estado_producto");
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registro_estado_producto");
            }
            
            $stmt->close();
        }
        
        echo json_encode($res);
    }
    public function editar_estado_producto_comercial($id, $empresa, $tipos_estado, $descripcion) {
        $idempresa = $this->getidempresa($empresa);
    
        
        $verificarQuery = "SELECT COUNT(*) as count FROM estados_productos WHERE tipos_estado = ? AND id_empresa = ? AND id_estados_productos != ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_estado_producto_comercial"));
            return false;
        }
    
        $stmt->bind_param('sii', $tipos_estado, $idempresa, $id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "El nombre del estado de producto ya está en uso.", "editar_estado_producto_comercial");
        } else {
            // Actualizar el registro en la tabla estados_productos
            $query = "UPDATE estados_productos SET tipos_estado = ?, descripcion = ?  WHERE id_estados_productos = ? AND id_empresa = ?";
            
            $stmt = $this->dbcm->prepare($query);
        
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_estado_producto_comercial"));
                return;
            }
        
            $stmt->bind_param("ssii", $tipos_estado, $descripcion, $id, $idempresa);
            if (!$stmt->execute()) {
                echo json_encode(array("Error", "Error al ejecutar la consulta: " . $stmt->error, "editar_estado_producto_comercial"));
                return;
            }
            $affected_rows = $stmt->affected_rows;
            if ($affected_rows > 0) {
                $res = array("ok", "Se guardaron los cambios correctamente", "editar_estado_producto_comercial",$id, $empresa, $tipos_estado, $descripcion);
            } else {
                $res = array("Error", "No se encontraron filas para actualizar", "editar_estado_producto_comercial",$idempresa);
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    public function cambiar_estado_producto($idEstadoProducto, $nuevoEstado, $empresa) {
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta SQL para actualizar el estado
        $query = "UPDATE estados_productos SET estado = ? WHERE id_estados_productos = ? AND id_empresa = ?";
        $stmt = $this->dbcm->prepare($query);
    
        // Verificar si la preparación de la consulta fue exitosa
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "cambiar_estado_producto"));
            return;
        }
    
        // Bind de parámetros
        $stmt->bind_param("iii", $nuevoEstado, $idEstadoProducto, $idempresa);
    
        // Ejecutar la consulta
        $actualizar_estado = $stmt->execute();
    
        // Verificar si la actualización fue exitosa
        if ($actualizar_estado) {
            $res = array("ok", "Se guardaron los cambios correctamente", "cambiar_estado_producto");
        } else {
            $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error, "cambiar_estado_producto");
        }
    
        // Cerrar la declaración
        $stmt->close();
    
        // Enviar la respuesta en formato JSON
        echo json_encode($res);
    }
    
    public function listar_estados_productos($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $stmt = $this->dbcm->prepare("SELECT id_estados_productos, tipos_estado, descripcion, estado FROM estados_productos WHERE id_empresa = ? ORDER BY id_estados_productos DESC");
        if ($stmt === false) {
            die("Error en la preparación de la consulta: " . $this->dbcm->error);
        }
    
        // Vincular el parámetro
        $stmt->bind_param("i", $idempresa);
        
        // Ejecutar la consulta
        $stmt->execute();
        
        // Obtener los resultados
        $result = $stmt->get_result();
        
        // Verificar si hay resultados
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $res = [
                    "id" => $row["id_estados_productos"],
                    "tipos_estado" => $row["tipos_estado"],
                    "descripcion" => $row["descripcion"],
                    "estado" => $row["estado"]
                ];
                array_push($lista, $res);
            }
        } else {
            echo "No se encontraron estados de productos.";
        }
    
        // Cerrar la declaración
        $stmt->close();
    
        // Devolver la lista en formato JSON
        echo json_encode($lista);
    }
    public function eliminar_estado_producto($id, $empresa) {
        $control = 1;
    
        // Verificar si el estado de producto está relacionado con otras tablas antes de eliminarlo.
        // Por ejemplo, supongamos que existe una tabla 'productos' que hace referencia a 'estados_productos'.
        $query = "SELECT * FROM productos WHERE estados_productos_id_estados_productos = ?";
        $stmt = $this->dbcm->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("Error", 'No se puede eliminar porque este estado de producto está relacionado con otros productos', "eliminar_estado_producto");
            $control = 0;
        }
        $stmt->close();
    
        if ($control == 1) {
            $idempresa = $this->getidempresa($empresa);
    
            // Eliminar el estado de producto si no tiene relaciones bloqueantes
            $query = "DELETE FROM estados_productos WHERE id_estados_productos = ? AND id_empresa = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "eliminar_estado_producto"));
                return;
            }
    
            $stmt->bind_param("ii", $id, $idempresa);
            $del = $stmt->execute();
    
            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_estado_producto");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_estado_producto");
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

}
?>