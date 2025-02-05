<?php
require_once "../../db/db.php";
class Producto_unidad extends DB{
    public function registrar_unidad_producto($nombre, $descripcion, $estado, $empresa) {
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe una unidad con el mismo nombre para la empresa
        $verificarQuery = "SELECT COUNT(*) AS count FROM unidad WHERE nombre = ? AND id_empresa = ?";
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_unidad_producto"));
            return;
        }
        $stmt->bind_param("si", $nombre, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe una unidad con el mismo nombre para esta empresa", "registrar_unidad_producto");
        } else {
            // Insertar la nueva unidad
            $query = "INSERT INTO unidad (nombre, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_unidad_producto"));
                return;
            }
    
            $stmt->bind_param("ssii", $nombre, $descripcion, $estado, $idempresa);
            $registro = $stmt->execute();
    
            if ($registro) {
                $res = array("ok", "Se registró correctamente", "registrar_unidad_producto");
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registrar_unidad_producto");
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    
    public function editar_unidad_producto($id, $nombre, $descripcion, $empresa) {
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM unidad WHERE nombre = ? AND id_empresa = ? AND id_unidad != ?";
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_unidad_producto"));
            return;
        }
        $stmt->bind_param("sii", $nombre, $idempresa, $id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "El nombre ingresado ya está en uso para esta empresa", "editar_unidad_producto");
        } else {
            // Actualizar la unidad
            $query = "UPDATE unidad SET nombre = ?, descripcion = ? WHERE id_unidad = ? AND id_empresa = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_unidad_producto"));
                return;
            }
    
            $stmt->bind_param("ssii", $nombre, $descripcion, $id, $idempresa);
            $editar = $stmt->execute();
    
            if ($editar) {
                $res = array("ok", "Se actualizaron los cambios correctamente", "editar_unidad_producto");
            } else {
                $res = array("Error", "No se actualizaron los cambios correctamente: " . $stmt->error, "editar_unidad_producto");
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    public function listar_unidad_producto($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $stmt = $this->dbcm->prepare("SELECT id_unidad, nombre, descripcion, estado FROM unidad WHERE id_empresa = ? ORDER BY id_unidad DESC");
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
                    "id" => $row["id_unidad"],
                    "nombre" => $row["nombre"],
                    "descripcion" => $row["descripcion"],
                    "estado" => $row["estado"]
                ];
                array_push($lista, $res);
            }
        }
    
        // Cerrar la declaración
        $stmt->close();
    
        // Devolver la lista en formato JSON
        echo json_encode($lista);
    }
    public function eliminar_unidad_producto($id, $empresa) {
        $control = 1;
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si la unidad está asociada a otros registros
        $verificarQuery = "SELECT * FROM productos WHERE unidad_id_unidad = ?"; // Reemplaza 'otros_registros' con la tabla que se relaciona
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "eliminar_unidad_producto"));
            return;
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $res = array("Error", "No se puede eliminar porque la unidad está asociada a otros registros", "eliminar_unidad_producto");
            $control = 0;
        }
        $stmt->close();
    
        // Si la unidad no está asociada a otros registros, eliminarla
        if ($control == 1) {
            $query = "DELETE FROM unidad WHERE id_unidad = ? AND id_empresa = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "eliminar_unidad_producto"));
                return;
            }
    
            $stmt->bind_param("ii", $id, $idempresa);
            $eliminar = $stmt->execute();
    
            if ($eliminar) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_unidad_producto");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_unidad_producto");
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    public function editar_estado_unidad_producto($idUnidad, $estado, $empresa) {
        
        $idempresa = $this->getidempresa($empresa);
        $query = "UPDATE unidad SET estado = ? WHERE id_unidad = ? AND id_empresa = ?";
        $stmt = $this->dbcm->prepare($query);
    
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_estado_unidad_producto"));
            return;
        }
    
        $stmt->bind_param("iii", $estado, $idUnidad, $idempresa);
    
        $editar_unidad = $stmt->execute();
    
        if ($editar_unidad) {
            $res = array("ok", "Se guardaron los cambios correctamente", "editar_estado_unidad_producto");
        } else {
            $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error, "editar_estado_unidad_producto");
        }
    
        $stmt->close();
        echo json_encode($res);
    }
    
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

}
?>