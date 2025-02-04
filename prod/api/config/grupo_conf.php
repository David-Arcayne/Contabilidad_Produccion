<?php
require_once "../../db/db.php";
class Grupo_conf extends DB{
     
    public function registrar_grupo($nombre, $detalle, $rubro_idrubro, $empresa) {
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM grupo WHERE idempresa = ? AND nombre = ?";
        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("is", $idempresa, $nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        
        if ($count > 0) {
            $res = array("Error", "Ya existe un grupo con el mismo nombre.", "registrar_grupo");
        } else {
            // Insertar un nuevo grupo en la tabla
            $query = "INSERT INTO grupo (nombre, detalle, rubro_idrubro, idempresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->dbp->prepare($query);
            
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta"));
                return;
            }
            
            $stmt->bind_param("ssi", $nombre, $detalle, $rubro_idrubro, $idempresa);
            $registro_grupo = $stmt->execute();
            
            if ($registro_grupo) {
                $res = array("ok", "Se registró el grupo correctamente", "registrar_grupo");
            } else {
                $res = array("Error", "No se registró el grupo correctamente: " . $stmt->error, "registrar_grupo");
            }
            
            $stmt->close();
        }
        
        echo json_encode($res);
    }
    public function editar_grupo($id, $nombre, $detalle, $empresa) {
        $idempresa = $this->getidempresa($empresa);
    
        // Verificar si ya existe un grupo con el mismo nombre en la misma empresa, excluyendo el grupo actual
        $verificarQuery = "SELECT COUNT(*) AS count FROM grupo WHERE nombre = ? AND idempresa = ? AND idgrupo != ?";
    
        $stmt = $this->dbp->prepare($verificarQuery);
        
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta"));
            return;
        }
        
        $stmt->bind_param("sii", $nombre, $idempresa, $id);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe un grupo con el mismo nombre", "editar_grupo");
        } else {
            // Actualizar el registro del grupo en la tabla
            $query = "UPDATE grupo SET nombre = ?, detalle = ? WHERE idgrupo = ? AND idempresa = ?";
            $stmt = $this->dbp->prepare($query);
    
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_grupo"));
                return;
            }
    
            $stmt->bind_param("ssii", $nombre, $detalle, $id, $idempresa);
            $editar_grupo = $stmt->execute();
    
            if ($editar_grupo) {
                $res = array("ok", "Se guardaron los cambios correctamente", "editar_grupo");
            } else {
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error, "editar_grupo");
            }
    
            $stmt->close();
        }
    
        echo json_encode($res);
    }
    public function listar_grupo($empresa) {
        $lista = [];
        // Obtener el ID de la empresa a partir del nombre de la empresa
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para obtener los grupos de la empresa
        $query = "SELECT g.idgrupo, g.nombre, g.detalle, g.rubro_idrubro FROM grupo AS g WHERE g.idempresa = ? ORDER BY g.idgrupo DESC";
        $stmt = $this->dbp->prepare($query);
    
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "listar_grupo"));
            return;
        }
    
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result === false) {
            echo json_encode(array("Error", "Error al ejecutar la consulta", "listar_grupo"));
            return;
        }
    
        // Recorrer el resultado y agregar los grupos a la lista
        while ($grupo = $result->fetch_assoc()) {
            $res = array(
                "id" => $grupo['idgrupo'],
                "nombre" => $grupo['nombre'],
                "detalle" => $grupo['detalle'],
                "rubro_idrubro" => $grupo['rubro_idrubro'],
            );
            array_push($lista, $res);
        }
    
        $stmt->close();
        echo json_encode($lista);
    }
    public function eliminar_grupo($id, $empresa) {
        $control = 1;
        $query = "SELECT * FROM grupo g INNER JOIN conservacion c ON c.grupo_id = g.idgrupo WHERE g.idgrupo = ?";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("Error", "No se puede eliminar porque hay dependencias asociadas a este grupo", "eliminar_grupo");
            $control = 0;
        }
        $stmt->close();
    
        if ($control == 1) {
            $idempresa = $this->getidempresa($empresa);
    
            $query = "DELETE FROM grupo WHERE idgrupo = ? AND idempresa = ?";
            $stmt = $this->dbp->prepare($query);
    
            if ($stmt === false) {
                echo json_encode(array("Error" => "No se pudo preparar la consulta", "eliminar_grupo"));
                return;
            }
    
            $stmt->bind_param("ii", $id, $idempresa);
            $del = $stmt->execute();
    
            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_grupo");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_grupo");
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

}
?>