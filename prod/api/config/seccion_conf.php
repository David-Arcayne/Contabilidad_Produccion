<?php
require_once "../../db/db.php";
class Seccion_conf extends DB{
    public function existe_seccion($nombre_seccion,$codigo_seccion, $empresa) {
        $idempresa = $this->getidempresa($empresa);
    
        // Prepara la consulta SQL para verificar existencia
        $query = "SELECT COUNT(*) FROM seccion WHERE empresa_idempresa = ? AND (nombre_seccion = ?  OR codigo_seccion = ?)";
        $stmt = $this->dbp->prepare($query);
    
        // Verificar si la sentencia se preparó correctamente
        if ($stmt === false) {
            echo json_encode(array("danger", "No se pudo preparar la consulta"));
            return false;
        }
    
        // Vincular parámetros y ejecutar la consulta
        $stmt->bind_param("iss", $idempresa,$nombre_seccion,$codigo_seccion);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        // Devolver true si existe, false si no existe
        return $count > 0;
    }
    public function registro_seccion($nombre_seccion, $ubicacion, $codigo_seccion,$rubro, $empresa) {
        if(!($this->existe_seccion($nombre_seccion,$codigo_seccion,$empresa))){
            $idempresa = $this->getidempresa($empresa);
    
            $query = "INSERT INTO seccion (nombre_seccion, ubicacion, codigo_seccion, rubro_idrubro, empresa_idempresa) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->dbp->prepare($query);
        
            // Verificar si la sentencia se preparó correctamente
            if ($stmt === false) {
                echo json_encode(array("danger", "No se pudo preparar la consulta"));
                return;
            }
        
            // Vincular parámetros y ejecutar la consulta
            $stmt->bind_param("sssii", $nombre_seccion, $ubicacion, $codigo_seccion,$rubro, $idempresa);
            $registro_seccion = $stmt->execute();
        
            // Verificar el resultado de la ejecución
            if ($registro_seccion) {
                $res = array("success", "El área se registró correctamente", "registro_seccion");
            } else {
                $res = array("danger", "No se registro correctamente: " . $stmt->error,"registro_seccion");
            }
            $stmt->close();    
        }else{
            $res = array("danger", "Existe registro con el mismo nombre o codigo");
        }
        echo json_encode($res);

    }
    
    public function editar_seccion($id, $nombre_seccion, $ubicacion, $codigo_seccion,$rubro, $empresa) {
        $idempresa = $this->getidempresa($empresa);

        $verificarQuery = "SELECT COUNT(*) as count FROM seccion WHERE (nombre_seccion = ? or codigo_seccion = ?) AND empresa_idempresa = ? AND idseccion != ?";


        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("danger", "No se pudo preparar la consulta"));
            return false;
        }
        $stmt->bind_param('ssii',$nombre_seccion ,$codigo_seccion,$idempresa,$id );
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if ($count > 0) {
            
                $res = array("danger", "El nombre o código ingresado ya está en uso.","editar_seccion");
            
        }else{
            $query = "UPDATE seccion SET nombre_seccion = ?, ubicacion = ?, codigo_seccion = ?, rubro_idrubro = ? WHERE idseccion = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);
        
            if ($stmt === false) {
                echo json_encode(array("danger", "No se pudo preparar la consulta"));
                return;
            }
        
            $stmt->bind_param("sssiii", $nombre_seccion, $ubicacion, $codigo_seccion,$rubro, $id, $idempresa);
            $editar_seccion = $stmt->execute();
        
            if ($editar_seccion) {
                $res = array("success", "Se guardaron los cambios correctamente", "editar_seccion");
            } else {
                $res = array("danger", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_seccion");
            }
        
            $stmt->close();
        
        }
        echo json_encode($res);

    }
    



    
    public function listarseccion($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        $query = "SELECT a.idseccion, a.nombre_seccion, a.ubicacion, a.codigo_seccion, a.rubro_idrubro FROM seccion AS a WHERE a.empresa_idempresa = ? ORDER BY a.idseccion DESC";
        $stmt = $this->dbp->prepare($query);
    
        if ($stmt === false) {
            echo json_encode(array("danger" , "No se pudo preparar la consulta"));
            return;
        }
    
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result === false) {
            echo json_encode(array("danger" => "Error al ejecutar la consulta"));
            return;
        }
    
        while ($seccion = $result->fetch_assoc()) {
            $res = array(
                "id" => $seccion['idseccion'],
                "nombre_seccion" => $seccion['nombre_seccion'],
                "ubicacion" => $seccion['ubicacion'],
                "codigo_seccion" => $seccion['codigo_seccion'],
                "rubro_idrubro" => $seccion['rubro_idrubro']
            );
            array_push($lista, $res);
        }
    
        $stmt->close();
    
        echo json_encode($lista);
    }
    public function eliminar_seccion_r($id, $empresa) {
        $control = 1;
        $query = "SELECT * FROM seccion a INNER JOIN etapas_produccion ep ON ep.seccion_idseccion = a.idseccion WHERE a.idseccion = ?"; 
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("danger",'No se puede eliminar porque hay registros en etapas de produccion',"eliminarseccion");
            $control = 0;

        }
        $stmt->close();
        if ($control == 1) {
            $query = "SELECT * FROM seccion a INNER JOIN limpieza l ON l.seccion_idseccion = a.idseccion WHERE a.idseccion = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("danger",'No se puede eliminar porque hay registros en Limpieza',"eliminar_seccion");
                $control = 0;
            }
            $stmt->close();
        }
        
        if ($control == 1) {
            $query = "SELECT * FROM seccion a INNER JOIN tseccion t ON t.seccion_idseccion = a.idseccion WHERE a.idseccion = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("danger",'No se puede eliminar porque hay registros en tseccion',"eliminar_seccion");
                $control = 0;
            }
            $stmt->close();
        }
        if ($control == 1) {
            $query = "SELECT * FROM seccion a INNER JOIN material mt ON mt.seccion_idseccion = a.idseccion WHERE a.idseccion = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("danger",'No se puede eliminar porque hay registros en material',"eliminar_seccion");
                $control = 0;
            }
            $stmt->close();
        }
        if ($control == 1) {
            $query = "SELECT * FROM seccion a INNER JOIN maquina mq ON mq.seccion_idseccion = a.idseccion WHERE a.idseccion = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("danger",'No se puede eliminar porque hay registros en maquina',"eliminar_seccion");
                $control = 0;
            }
            $stmt->close();
        }
        if ($control == 1) {
            $query = "SELECT * FROM seccion a INNER JOIN calendario c ON c.seccion_idseccion = a.idseccion WHERE a.idseccion = ?"; 
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("danger",'No se puede eliminar porque hay registros en maquina',"eliminar_seccion");
                $control = 0;
            }
            $stmt->close();
        }

        if ($control == 1) {
            $idempresa = $this->getidempresa($empresa);
    
            $query = "DELETE FROM seccion WHERE idseccion = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);
        
            if ($stmt === false) {
                echo json_encode(array("danger" => "No se pudo preparar la consulta","eliminar_seccion"));
                return;
            }
        
            $stmt->bind_param("ii", $id, $idempresa);
            $del = $stmt->execute();
        
            if ($del) {
                $res = array("success", "Se eliminó correctamente", "eliminar_seccion");
            } else {
                $res = array("danger", "No se pudo eliminar: " . $stmt->error,"eliminar_seccion");
            }
        
            $stmt->close();
        }
       
    
        echo json_encode($res);
    }
    public function eliminar_seccion($id, $empresa) {
        $control = 1;
    
        // Lista de tablas relacionadas a verificar
        $tablas = [
            // maquina  material   etapas_produccion   tarea_limpieza
            ['tabla' => 'maquina', 'columna' => 'seccion_idseccion', 'mensaje' => 'No se puede eliminar porque hay registros en maquina'],
            ['tabla' => 'material', 'columna' => 'seccion_idseccion', 'mensaje' => 'No se puede eliminar porque hay registros en material'],
            ['tabla' => 'etapas_produccion', 'columna' => 'seccion_idseccion', 'mensaje' => 'No se puede eliminar porque hay registros en etapas_produccion'],
            ['tabla' => 'tarea_limpieza', 'columna' => 'seccion_idseccion', 'mensaje' => 'No se puede eliminar porque hay registros en tarea_limpieza']
        ];
    
        // Verificar cada tabla relacionada
        foreach ($tablas as $tabla) {
            $query = "SELECT * FROM seccion a INNER JOIN {$tabla['tabla']} t ON t.{$tabla['columna']} = a.idseccion WHERE a.idseccion = ?";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("danger" => "No se pudo preparar la consulta", "eliminar_seccion"));
                return;
            }
    
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("danger", $tabla['mensaje'], "eliminar_seccion");
                $control = 0;
                $stmt->close();
                break; // Salir del bucle si se encuentra un registro relacionado
            }
    
            $stmt->close();
        }
    
        // Eliminar si no se encontraron registros relacionados
        if ($control == 1) {
            $idempresa = $this->getidempresa($empresa);
    
            $query = "DELETE FROM seccion WHERE idseccion = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);
            
            if ($stmt === false) {
                echo json_encode(array("danger" => "No se pudo preparar la consulta de eliminación", "eliminar_seccion"));
                return;
            }
    
            $stmt->bind_param("ii", $id, $idempresa);
            $del = $stmt->execute();
    
            if ($del) {
                $res = array("success", "Se eliminó correctamente", "eliminar_seccion");
            } else {
                $res = array("danger", "No se pudo eliminar: " . $stmt->error, "eliminar_seccion");
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