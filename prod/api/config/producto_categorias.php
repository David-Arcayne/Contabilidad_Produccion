<?php
require_once "../../db/db.php";
class Producto_categorias extends DB{
     
    public function registroCategoria($nombre, $descripcion, $estado, $empresa, $idp) {
        // Obtener el ID de la empresa basado en el nombre de la empresa
        $idempresa = $this->getidempresa($empresa);
    
        // Consulta para verificar si la categoría ya existe
        $verificarQuery = "SELECT COUNT(*) AS count FROM categorias WHERE id_empresa = ? AND nombre = ?";
    
        // Preparar la consulta
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registroCategoria"));
            return;
        }
    
        // Bind de parámetros
        $stmt->bind_param("is", $idempresa, $nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        // Verificar si la categoría ya existe
        if ($count > 0) {
            $res = array("Error", "Ya existe una categoría con el mismo nombre.", "registroCategoria");
        } else {
            // Consulta para insertar la nueva categoría
            $query = "INSERT INTO categorias (nombre, descripcion, estado, id_empresa, idp) VALUES (?, ?, ?, ?, ?)";
    
            // Preparar la consulta
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registroCategoria"));
                return;
            }
    
            // Bind de parámetros
            $stmt->bind_param("sssii", $nombre, $descripcion, $estado, $idempresa, $idp);
            $registro = $stmt->execute();
    
            // Verificar si la inserción fue exitosa
            if ($registro) {
                $res = array("ok", "Se registró correctamente", "registroCategoria");
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registroCategoria");
            }
    
            $stmt->close();
        }
    
        // Retornar el resultado
        echo json_encode($res);
    }
    public function listarCategorias($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta para seleccionar las categorías de la empresa
        $stmt = $this->dbcm->prepare("SELECT c.id_categorias, c.nombre, c.descripcion, c.estado FROM categorias AS c WHERE c.id_empresa = ? ORDER BY c.id_categorias DESC");
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
            while ($qwe = $result->fetch_assoc()) {
                $res = [
                    "id" => $qwe["id_categorias"],
                    "nombre" => $qwe["nombre"],
                    "descripcion" => $qwe["descripcion"],
                    "estado" => $qwe["estado"]
                ];
                array_push($lista, $res);
            }
        }
    
        // Cerrar la declaración
        $stmt->close();
    
        // Devolver la lista en formato JSON
        echo json_encode($lista);
    }
    public function editar_estado_categoria($idCategoria, $estado, $empresa) {
        
        $idempresa = $this->getidempresa($empresa);
        
        $query = "UPDATE categorias SET estado = ? WHERE id_categorias = ? AND id_empresa = ?";
        $stmt = $this->dbcm->prepare($query);
    
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_estado_categoria"));
            return;
        }
    
        $stmt->bind_param("sii", $estado, $idCategoria, $idempresa); // 's' para el estado que es un varchar, 'i' para los ints
        $editar_categoria = $stmt->execute();
    
        if ($editar_categoria) {
            $res = array("ok", "Se guardaron los cambios correctamente", "editar_estado_categoria");
        } else {
            $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error, "editar_estado_categoria");
        }
    
        $stmt->close();
        echo json_encode($res);
    }
    
    
    public function editar_categoria($id, $empresa, $nombre, $descripcion) {
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si el nombre de la categoría ya existe en la empresa, excluyendo la categoría actual
        $verificarQuery = "SELECT COUNT(*) as count FROM categorias WHERE nombre = ? AND id_empresa = ? AND id_categorias != ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_categoria"));
            return false;
        }
    
        $stmt->bind_param('sii', $nombre, $idempresa, $id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "El nombre de la categoría ya está en uso.", "editar_categoria");
        } else {
            // Consulta para actualizar la categoría, incluyendo la columna idp
            $query = "UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categorias = ? AND id_empresa = ?";
    
            $stmt = $this->dbcm->prepare($query);
    
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_categoria"));
                return;
            }
    
            $stmt->bind_param("ssii", $nombre, $descripcion,  $id, $idempresa);
            if (!$stmt->execute()) {
                echo json_encode(array("Error", "Error al ejecutar la consulta: " . $stmt->error, "editar_categoria"));
                return;
            }
    
            $affected_rows = $stmt->affected_rows;
            if ($affected_rows > 0) {
                $res = array("ok", "Se guardaron los cambios correctamente", "editar_categoria");
            } else {
                $res = array("Error", "No se encontraron filas para actualizar", "editar_categoria",$idempresa);
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    

    public function eliminar_categoria($id, $empresa) {
        $control = 1;
        $query = "SELECT * FROM productos WHERE categorias_id_categorias = ?";
        $stmt = $this->dbcm->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("Error", "No se puede eliminar porque hay productos relacionados con esta categoría", "eliminar_categoria");
            $control = 0;
        }
        $stmt->close();
    
        // Si no hay restricciones, proceder con la eliminación
        if ($control == 1) {
            $idempresa = $this->getidempresa($empresa);
    
            // Consulta para eliminar la categoría
            $query = "DELETE FROM categorias WHERE id_categorias = ? AND id_empresa = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error" => "No se pudo preparar la consulta", "eliminar_categoria"));
                return;
            }
    
            // Vincular los parámetros
            $stmt->bind_param("ii", $id, $idempresa);
            $del = $stmt->execute();
    
            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_categoria");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_categoria");
            }
    
            $stmt->close();
        }
        // Retornar el resultado en formato JSON
        echo json_encode($res);
    }
    
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

}
?>