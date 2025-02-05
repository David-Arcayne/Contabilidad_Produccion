<?php
require_once "../../db/db.php";
class Conservacion_conf extends DB{
   
    public function Listar_conservacionProductos_one($id, $entidad) {
        $res = array();

        // Preparar la consulta SELECT para listar todos los registros
        $query = "SELECT idconservacion, duracion, temperatura, 
                         humedad, exp_luz, Unidad_tiempo_idUnidad_tiempo 
                  FROM conservacion WHERE entidad_id = ? AND tipo_entidad = ?";
        
        if ($stmt = $this->dbp->prepare($query)) {
            // Ejecutar la consulta
            $stmt->bind_param("is", $id, $entidad);
            $stmt->execute();
            
            // Obtener los resultados
            $result = $stmt->get_result();
            
            // Verificar si hay resultados
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $res[] = $row;
                }
            } else {
                $res = array("ok", "No se encontraron registros.");
            }
            
            // Cerrar la declaración
            $stmt->close();
        } else {
            $res = array("Error", "No se pudo preparar la consulta para listar los productos: " . $this->dbp->error);
        }
        
        // Retornar los resultados en formato JSON
        echo json_encode($res);
    }
    public function Listar_conservacionProductos_two($id, $entidad) {
        $results = array();
    
        // Preparar la consulta SELECT para listar todos los registros
        $query = "SELECT idconservacion, duracion, temperatura,  
                         humedad, exp_luz, Unidad_tiempo_idUnidad_tiempo AS unidadtiempo
                  FROM conservacion WHERE entidad_id = ? AND tipo_entidad = ?";
    
        if ($stmt = $this->dbp->prepare($query)) {
            // Bind de parámetros
            $stmt->bind_param("is", $id, $entidad);
            $stmt->execute();
            
            // Obtener los resultados
            $result = $stmt->get_result();
    
            // Verificar si hay resultados
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $results[] = $row;
                }
            }
    
            // Cerrar la declaración
            $stmt->close();
            
            if (empty($results)) {
                // No se encontraron registros
                echo json_encode($result);
            } else {
                // Retornar los resultados en formato JSON
                echo json_encode($results);
            }
        } else {
            // Error al preparar la consulta
            echo json_encode(array("status" => "error", "message" => "No se pudo preparar la consulta para listar los productos: " . $this->dbp->error));
        }
    }
    public function Registrar_conservacionProducto($entidad_id, $tipo_entidad, $duracion, $temperatura, $humedad, $exp_luz, $Unidad_tiempo_idUnidad_tiempo) {
        $res = array();
        
        // Preparar la consulta de inserción
        $query = "INSERT INTO conservacion 
            (entidad_id, tipo_entidad, duracion, temperatura, humedad,  exp_luz, Unidad_tiempo_idUnidad_tiempo)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        if ($stmt = $this->dbp->prepare($query)) {
            // Vincular los parámetros
            $stmt->bind_param("isdsssi", 
                $entidad_id, $tipo_entidad, $duracion, $temperatura, 
                $humedad, $exp_luz, 
                $Unidad_tiempo_idUnidad_tiempo
            );
            
            // Ejecutar la consulta
            if ($stmt->execute()) {
                $id_registro = $stmt->insert_id;
                $res = array("ok", "Registro de conservación creado correctamente.", "Registrar_conservacionProducto", $id_registro);
            } else {
                $res = array("Error", "No se pudo registrar el producto: " . $stmt->error, "Registrar_conservacionProducto");
            }
            
            // Cerrar la declaración
            $stmt->close();
        } else {
            $res = array("Error", "No se pudo preparar la consulta de inserción: " . $this->dbp->error, "Registrar_conservacionProducto");
        }
        
        // Retornar la respuesta en formato JSON
        echo json_encode($res);
    }
    public function Editar_conservacionProducto($idconservacion, $entidad_id, $tipo_entidad, $duracion, $temperatura, $humedad, $exp_luz, $Unidad_tiempo_idUnidad_tiempo) {
        $res = array();
        
        // Preparar la consulta de actualización
        $query = "UPDATE conservacion SET 
            entidad_id = ?, 
            tipo_entidad = ?, 
            duracion = ?, 
            temperatura = ?, 
            humedad = ?, 
            exp_luz = ?, 
            Unidad_tiempo_idUnidad_tiempo = ? 
            WHERE idconservacion = ?";
        
        if ($stmt = $this->dbp->prepare($query)) {
            // Vincular los parámetros
            $stmt->bind_param("isdsssii", 
                $entidad_id, $tipo_entidad, $duracion, $temperatura, 
                $humedad, $exp_luz, 
                $Unidad_tiempo_idUnidad_tiempo, $idconservacion
            );
            
            // Ejecutar la consulta
            if ($stmt->execute()) {
                $res = array("ok", "Registro de conservación actualizado correctamente.", "Editar_conservacionProducto");
            } else {
                $res = array("Error", "No se pudo actualizar el producto: " . $stmt->error, "Editar_conservacionProducto");
            }
            
            // Cerrar la declaración
            $stmt->close();
        } else {
            $res = array("Error", "No se pudo preparar la consulta de actualización: " . $this->dbp->error, "Editar_conservacionProducto");
        }
        
        // Retornar la respuesta en formato JSON
        echo json_encode($res);
    }
    public function Registrar_caracteristicaConservacion_one($usuario, $caracteristica, $descripcion, $prioridad, $observaciones, $conservacion_idconservacion) {
        $res = array();
    
        // Preparar la consulta INSERT
        $query = "INSERT INTO caracteristicas_conservacion (usuario, caracteristica, descripcion, prioridad, observaciones, conservacion_idconservacion) 
                  VALUES (?, ?, ?, ?, ?, ?)";
    
        // Preparar la declaración SQL
        $stmt = $this->dbp->prepare($query);
    
        if ($stmt) {
            // Vincular parámetros a la consulta preparada
            $stmt->bind_param("issssi", $usuario, $caracteristica, $descripcion, $prioridad, $observaciones, $conservacion_idconservacion);
            
            // Ejecutar la consulta
            $registro = $stmt->execute();
            
            if ($registro) {
                $id_registro = $stmt->insert_id; // Obtener el ID del registro insertado
                
                // Registro exitoso
                $res = array("status" => "ok", "message" => "Registro insertado correctamente", "id" => $id_registro);
            } else {
                // Error al insertar
                $res = array("status" => "error", "message" => "No se pudo insertar el registro: " . $stmt->error);
            }
            
            // Cerrar la declaración
            $stmt->close();
        } else {
            // Error al preparar la consulta
            $res = array("status" => "error", "message" => "No se pudo preparar la consulta de inserción: " . $this->dbp->error);
        }
        
        // Retornar la respuesta en formato JSON
        echo json_encode($res);
    }
    public function Registrar_caracteristicasConservacion_two($usuario, $caracteristica, $descripcion, $prioridad, $observaciones, $conservacion_idconservacion) {
        $res = array();
    
        // Preparar la consulta INSERT para registrar la característica de conservación
        $query = "INSERT INTO caracteristicas_conservacion (usuario, caracteristica, descripcion, prioridad, observaciones, conservacion_idconservacion)
                  VALUES (?, ?, ?, ?, ?, ?)";
    
        // Preparar la sentencia SQL
        if ($stmt = $this->dbp->prepare($query)) {
            // Enlazar parámetros
            $stmt->bind_param("issssi", $usuario, $caracteristica, $descripcion, $prioridad, $observaciones, $conservacion_idconservacion);
    
            // Ejecutar la consulta
            $registro = $stmt->execute();
    
            // Verificar si se realizó el registro exitosamente
            if ($registro) {
                // Obtener el ID del registro insertado
                $id_registro = $stmt->insert_id;
                $res = array("status" => "ok", "message" => "Registro insertado correctamente", "id" => $id_registro);
            } else {
                // Manejar error en la inserción
                $res = array("status" => "error", "message" => "Error al insertar el registro: " . $stmt->error);
            }
    
            // Cerrar la sentencia
            $stmt->close();
        } else {
            // Manejar error al preparar la consulta
            $res = array("status" => "error", "message" => "No se pudo preparar la consulta: " . $this->dbp->error);
        }
    
        // Retornar la respuesta en formato JSON
        echo json_encode($res);
    }
    public function Eliminar_caracteristicaConservacion($idcaracteristicas_conservacion) {
        $res = array();
    
        // Preparar la consulta DELETE
        $query = "DELETE FROM caracteristicas_conservacion WHERE idcaracteristicas_conservacion = ?";
    
        // Preparar la declaración SQL
        $stmt = $this->dbp->prepare($query);
    
        if ($stmt) {
            // Vincular el parámetro a la consulta preparada
            $stmt->bind_param("i", $idcaracteristicas_conservacion);
    
            // Ejecutar la consulta
            $eliminado = $stmt->execute();
    
            if ($eliminado) {
                // Comprobar si se eliminó alguna fila
                if ($stmt->affected_rows > 0) {
                    $res = array("status" => "ok", "message" => "Registro eliminado correctamente");
                } else {
                    $res = array("status" => "error", "message" => "No se encontró el registro con el ID especificado");
                }
            } else {
                // Error al eliminar
                $res = array("status" => "error", "message" => "No se pudo eliminar el registro: " . $stmt->error);
            }
    
            // Cerrar la declaración
            $stmt->close();
        } else {
            // Error al preparar la consulta
            $res = array("status" => "error", "message" => "No se pudo preparar la consulta de eliminación: " . $this->dbp->error);
        }
    
        // Retornar la respuesta en formato JSON
        echo json_encode($res);
    }
    public function Editar_caracteristicaConservacion($idcaracteristicas_conservacion, $usuario, $caracteristica, $descripcion, $prioridad, $observaciones) {
        $res = array();
    
        // Preparar la consulta UPDATE
        $query = "UPDATE caracteristicas_conservacion 
                  SET usuario = ?, caracteristica = ?, descripcion = ?, prioridad = ?, observaciones = ?
                  WHERE idcaracteristicas_conservacion = ?";
    
        // Preparar la declaración SQL
        $stmt = $this->dbp->prepare($query);
    
        if ($stmt) {
            // Vincular los parámetros a la consulta preparada
            $stmt->bind_param("issssi", $usuario, $caracteristica, $descripcion, $prioridad, $observaciones, $idcaracteristicas_conservacion);
    
            // Ejecutar la consulta
            $actualizado = $stmt->execute();
    
            if ($actualizado) {
                // Verificar si se actualizó alguna fila
                if ($stmt->affected_rows > 0) {
                    $res = array("status" => "ok", "message" => "Registro actualizado correctamente");
                } else {
                    $res = array("status" => "error", "message" => "No se encontró ningún cambio para el ID especificado");
                }
            } else {
                // Error al actualizar
                $res = array("status" => "error", "message" => "No se pudo actualizar el registro: " . $stmt->error);
            }
    
            // Cerrar la declaración
            $stmt->close();
        } else {
            // Error al preparar la consulta
            $res = array("status" => "error", "message" => "No se pudo preparar la consulta de actualización: " . $this->dbp->error);
        }
    
        // Retornar la respuesta en formato JSON
        echo json_encode($res);
    }
    public function Listar_caracteristicasConservacion($conservacion_idconservacion) {
        $res = array();
    
        // Preparar la consulta SELECT para listar todos los registros
        $query = "SELECT idcaracteristicas_conservacion, usuario, caracteristica, descripcion, prioridad, observaciones, conservacion_idconservacion 
                  FROM caracteristicas_conservacion 
                  WHERE conservacion_idconservacion = ?";
    
        // Preparar la declaración SQL
        if ($stmt = $this->dbp->prepare($query)) {
            // Vincular los parámetros a la consulta preparada
            $stmt->bind_param("i", $conservacion_idconservacion);
    
            // Ejecutar la consulta
            $stmt->execute();
    
            // Obtener los resultados
            $result = $stmt->get_result();
    
            // Verificar si hay resultados
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $res[] = $row;
                }
            } else {
                $res = array("status" => "ok", "message" => "No se encontraron registros.");
            }
    
            // Cerrar la declaración
            $stmt->close();
        } else {
            $res = array("status" => "error", "message" => "No se pudo preparar la consulta para listar los registros: " . $this->dbp->error);
        }
    
        // Retornar los resultados en formato JSON
        echo json_encode($res);
    }



    public function Listar_conservacion($idgrupo) {
   
        $respuesta = array();
  
        $query = "SELECT * FROM conservacion WHERE idgrupo = ?";
        $stmt = $this->dbp->prepare($query);
 
        if ($stmt === false) {
            echo json_encode(array("Error" , "No se pudo preparar la consulta", "listar_conservacion"));
            return;
        }

        $stmt->bind_param("i", $idgrupo);
    
        $stmt->execute();
        
        $result = $stmt->get_result();
        if ($result === false) {
            echo json_encode(array("Error", "Error al ejecutar la consulta", "listar_conservacion"));
            return;
        }
    
        if ($result->num_rows > 0) {
           
            while ($conservacion = $result->fetch_assoc()) {
                $respuesta = array(
                    "idconservacion" => $conservacion['idconservacion'],
                    "duracion" => $conservacion['duracion'],
                    "temperatura" => $conservacion['temperatura'],
                    "humedad" => $conservacion['humedad'],
                    "exp_luz" => $conservacion['exp_luz'],
                    "idgrupo" => $conservacion['idgrupo'],
                    "Unidad_tiempo_idUnidad_tiempo" => $conservacion['Unidad_tiempo_idUnidad_tiempo']
                );
            }
        } else {
            
            $respuesta = array(
                "idconservacion" => 0,  
                "duracion" => "",       
                "temperatura" => "",    
                "humedad" => "",        
                "exp_luz" => "",        
                "idgrupo" => $idgrupo,  
                "Unidad_tiempo_idUnidad_tiempo" => 0
            );
        }
        $stmt->close();
    
        echo json_encode($respuesta);
    }
    

    public function editar_conservacion($idconservacion, $duracion, $temperatura, $humedad, $exp_luz, $idgrupo, $Unidad_tiempo_idUnidad_tiempo) {
        // Primero, verificar si el registro de conservación existe
        $queryVerificar = "SELECT COUNT(*) AS count FROM conservacion WHERE idconservacion = ?";
        $stmt = $this->dbp->prepare($queryVerificar);
    
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta de verificación", "editar_conservacion"));
            return;
        }
    
        $stmt->bind_param("i", $idconservacion);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        // Si no existe el registro de conservación, retornar un error
        if ($count == 0) {
            echo json_encode(array("Error", "No se encontró el registro de conservación especificado", "editar_conservacion"));
            return;
        }
    
        // Consulta para actualizar los datos de conservación
        $query = "UPDATE conservacion SET duracion = ?, temperatura = ?, humedad = ?, exp_luz = ?, idgrupo = ?, Unidad_tiempo_idUnidad_tiempo = ? WHERE idconservacion = ?";
        $stmt = $this->dbp->prepare($query);
    
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_conservacion"));
            return;
        }
    
        // Asignar los parámetros a la consulta
        $stmt->bind_param("dsssiii", $duracion, $temperatura, $humedad, $exp_luz, $idgrupo, $Unidad_tiempo_idUnidad_tiempo, $idconservacion);
    
        // Ejecutar la consulta
        $resultado = $stmt->execute();
    
        if ($resultado) {
            echo json_encode(array("ok", "Conservación actualizada correctamente", "editar_conservacion"));
        } else {
            echo json_encode(array("Error", "No se pudo actualizar la conservación: " . $stmt->error, "editar_conservacion"));
        }
    
        // Cerrar la consulta
        $stmt->close();
    }





    public function registrar_conservacion($duracion, $temperatura, $humedad, $exp_luz, $idgrupo, $unidad_tiempo) {
       
        
            $query = "INSERT INTO conservacion (duracion, temperatura, humedad, exp_luz, idgrupo, Unidad_tiempo_idUnidad_tiempo) VALUES(?, ?, ?, ?, ?, ?)";
            $stmt = $this->dbp->prepare($query);
            
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_conservacion"));
                return;
            }
    
            $stmt->bind_param("dsssii", $duracion, $temperatura, $humedad, $exp_luz, $idgrupo, $unidad_tiempo);
    
            $registro = $stmt->execute();
    
            if ($registro) {
                $res = array("ok", "Se registró correctamente", "registrar_conservacion");
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registrar_conservacion");
            }
    
            $stmt->close();
        
    
        echo json_encode($res);
    }
    








    public function register_hasconnservacion($entidad_id, $tipo_entidad, $idgrupo) {
        $query = "INSERT INTO has_conservacion (entidad_id, tipo_entidad, idgrupo) VALUES (?, ?, ?)";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("isi", $entidad_id, $tipo_entidad, $idgrupo);
        
        if ($stmt->execute()) {
            //return $stmt->insert_id;
            $res = array("ok","El material se registro correctamente","register_hasconnservacion");
        
        
        } else {
            return false;
            $res = array("Error", "No se registro correctamente: " . $stmt->error,"register_hasconnservacion");

        }
        echo json_encode($res);
    }

    public function listar_agrupados_conservacion($tipo_entidad,$empresa,$id_grupo) {
        $Lista = array();

        $id_empresa = $this->getidempresa($empresa);
        $query = "SELECT * FROM has_conservacion  hc
                    inner join grupo g on g.idgrupo = hc.idgrupo
                    where  hc.tipo_entidad = ? and g.idempresa = ? and hc.idgrupo=? ";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("sii", $tipo_entidad,$id_empresa,$id_grupo);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $Lista[] = $row;
        }
        echo json_encode($Lista);
    }

    public function delete_hasconservacion($idhas_conservacion) {
        $query = "DELETE FROM has_conservacion WHERE idhas_conservacion = ?";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("i", $idhas_conservacion);
        
        if ($stmt->execute()) {

            echo json_encode(array("ok","Se elimino correctamente","delete_hasconservacion"));
        } else {
            echo json_encode(array("Error","No se pudo eliminar ","delete_hasconservacion"));
        }
    }

    public function Listar_no_agrupados($tipo_entidad,$empresa){
        $id_empresa = $this->getidempresa($empresa);
        $res = array();

        
        $query = "SELECT p.*
                    FROM producto p
                    LEFT JOIN has_conservacion hc 
                    ON p.idproduct_comercial = hc.entidad_id 
                    AND hc.tipo_entidad = ?
                    LEFT JOIN rubro r 
                    ON p.rubro_idrubro = r.idrubro
                    WHERE hc.idgrupo IS NULL
                    AND r.empresa_idempresa = ?";
        
        if ($stmt = $this->dbp->prepare($query)) {
            // Ejecutar la consulta
            $stmt->bind_param("si", $tipo_entidad,$id_empresa);
            $stmt->execute();
            
            // Obtener los resultados
            $result = $stmt->get_result();
            
            // Verificar si hay resultados
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $res[] = $row;
                }
            } else {
                $res = array("ok", "No se encontraron registros.");
            }
            
            // Cerrar la declaración
            $stmt->close();
        } else {
            $res = array("Error", "No se pudo preparar la consulta para listar los productos: " . $this->dbp->error);
        }
        
        // Retornar los resultados en formato JSON
        echo json_encode($res);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
}



?>