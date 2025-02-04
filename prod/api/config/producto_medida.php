<?php
require_once "../../db/db.php";
class Producto_medida extends DB{
    public function registrar_medida_producto($nombre_medida, $descripcion, $estado, $empresa) {
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe una medida con el mismo nombre para la misma empresa
        $verificarQuery = "SELECT COUNT(*) AS count FROM medida WHERE nombre_medida = ? AND id_empresa = ?";
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_medida_producto"));
            return;
        }
        $stmt->bind_param("si", $nombre_medida, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe una medida con el mismo nombre para esta empresa", "registrar_medida_producto");
        } else {
            // Insertar la nueva medida
            $query = "INSERT INTO medida (nombre_medida, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_medida_producto"));
                return;
            }
    
            $stmt->bind_param("ssii", $nombre_medida, $descripcion, $estado, $idempresa);
            $registro = $stmt->execute();
    
            if ($registro) {
                $res = array("ok", "Se registró correctamente", "registrar_medida_producto");
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registrar_medida_producto");
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    
    
    public function editar_medida_producto($id, $nombre_medida, $descripcion,  $empresa) {
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe una medida con el mismo nombre (excluyendo el registro actual) para la misma empresa
        $verificarQuery = "SELECT COUNT(*) AS count FROM medida WHERE nombre_medida = ? AND id_empresa = ? AND id_medida != ?";
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_medida_producto"));
            return;
        }
        $stmt->bind_param("sii", $nombre_medida, $idempresa, $id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe una medida con el mismo nombre para esta empresa", "editar_medida_producto");
        } else {
            // Actualizar la medida
            $query = "UPDATE medida SET nombre_medida = ?, descripcion = ? WHERE id_medida = ? AND id_empresa = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_medida_producto"));
                return;
            }
    
            $stmt->bind_param("ssii", $nombre_medida, $descripcion, $id, $idempresa);
            $editar = $stmt->execute();
    
            if ($editar) {
                $res = array("ok", "Se actualizaron los cambios correctamente", "editar_medida_producto");
            } else {
                $res = array("Error", "No se pudieron actualizar los cambios: " . $stmt->error, "editar_medida_producto");
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    public function listar_medidas_producto($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta para obtener todas las medidas para una empresa específica
        $query = "SELECT id_medida, nombre_medida, descripcion, estado FROM medida WHERE id_empresa = ? ORDER BY id_medida DESC";
        $stmt = $this->dbcm->prepare($query);
        if ($stmt === false) {
            die(json_encode(array("Error", "No se pudo preparar la consulta", "listar_medidas_producto")));
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
                    "id" => $row["id_medida"],
                    "nombre_medida" => $row["nombre_medida"],
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
    public function eliminar_medida_producto($id, $empresa) {
        $control = 1;
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si la medida está asociada a otros registros (por ejemplo, en otra tabla)
        $verificarQuery = "SELECT * FROM productos WHERE medida_id_medida = ?";
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "eliminar_medida_producto"));
            return;
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            // Si hay registros asociados, no se puede eliminar
            $res = array("Error", "No se puede eliminar porque la medida está asociada a otros registros", "eliminar_medida_producto");
            $control = 0;
        }
        $stmt->close();
    
        // Si no hay registros asociados, proceder con la eliminación
        if ($control == 1) {
            $query = "DELETE FROM medida WHERE id_medida = ? AND id_empresa = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "eliminar_medida_producto"));
                return;
            }
    
            $stmt->bind_param("ii", $id, $idempresa);
            $eliminar = $stmt->execute();
    
            if ($eliminar) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_medida_producto");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_medida_producto");
            }
    
            $stmt->close();
        }
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    public function cambiar_estado_medida_producto($idMedida, $nuevoEstado, $empresa) {
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta SQL para actualizar el estado
        $query = "UPDATE medida SET estado = ? WHERE id_medida = ? AND id_empresa = ?";
        $stmt = $this->dbcm->prepare($query);
    
        // Verificar si la preparación de la consulta fue exitosa
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "cambiar_estado_medida_producto"));
            return;
        }
    
        // Bind de parámetros
        $stmt->bind_param("iii", $nuevoEstado, $idMedida, $idempresa);
    
        // Ejecutar la consulta
        $actualizar_estado = $stmt->execute();
    
        // Verificar si la actualización fue exitosa
        if ($actualizar_estado) {
            $res = array("ok", "Se guardaron los cambios correctamente", "cambiar_estado_medida_producto");
        } else {
            $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error, "cambiar_estado_medida_producto");
        }
    
        // Cerrar la declaración
        $stmt->close();
    
        // Enviar la respuesta en formato JSON
        echo json_encode($res);
    }
    
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

}
?>