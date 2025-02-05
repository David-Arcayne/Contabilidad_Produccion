<?php
require_once "../../db/db.php";
class Categoria_conf extends DB{

    function sincronizar_con_comercial_categoria($empresa) {
        $idempresa = $this->getidempresa($empresa);
        $sql = "SELECT id_categorias, nombre, descripcion, estado, id_empresa, idp FROM categorias WHERE id_empresa = ?";
    
        // Preparar la consulta
        $stmt = $this->dbcm->prepare($sql);
        if (!$stmt) {
            echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta en comercial", "function" => "sincronizar_con_comercial_categoria"));
            return;
        }
    
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $check_sql = "SELECT idcategoria FROM categoria WHERE idcategoria_comercial = ?";
                $stmt_check = $this->dbp->prepare($check_sql);
                if (!$stmt_check) {
                    echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta SELECT", "function" => "sincronizar_con_comercial_categoria"));
                    return;
                }
        
                $stmt_check->bind_param("i", $row['id_categorias']);
                $stmt_check->execute();
                $check_result = $stmt_check->get_result();
                $stmt_check->close(); 
        
                if ($check_result && $check_result->num_rows == 0) { 
                    $insert_sql = "INSERT INTO categoria (idcategoria_comercial, rubro_idrubro) VALUES (?, ?);";
                    $stmt_insert = $this->dbp->prepare($insert_sql);
                    if (!$stmt_insert) {
                        echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta INSERT", "function" => "sincronizar_con_comercial_categoria"));
                        return;
                    }
                    $getLista = $this->dbp->query("SELECT idrubro FROM rubro WHERE empresa_idempresa ='$idempresa' LIMIT 1;");
                    $resultado = $getLista->fetch_assoc();
                    $rubro_idrubro = $resultado['idrubro'];
                    $stmt_insert->bind_param("ii", $row['id_categorias'], $rubro_idrubro);
                    $stmt_insert->execute();
                    $stmt_insert->close(); 
                }
            }
            return;
        } else {
            $res = array("status" => "error", "message" => "No se encontraron productos en la base de datos comercial", "function" => "sincronizar_con_comercial_categoria");
        }
        
        $stmt->close(); // Cerrar stmt después de usarlo
        echo json_encode($res);
    }
  
    public function registro_categoria_comercial($nombre, $descripcion, $estado, $empresa,$rubro_idrubro, $idp) {
        $idempresa = $this->getidempresa($empresa);
    
        $verificarQuery = "SELECT COUNT(*) AS count FROM categorias WHERE nombre = ?  AND id_empresa = ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registro_categoria_comercial"));
            return;
        }
    
        $stmt->bind_param("si", $nombre, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe un producto con el mismo código.", "registro_categoria_comercial");
        } else {
            $query = "INSERT INTO categorias (nombre, descripcion, estado, id_empresa, idp) VALUES (?, ?, ?, ?, ?)";
    
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registro_categoria_comercial"));
                return;
            }    
            $stmt->bind_param("ssiii", $nombre, $descripcion, $estado, $idempresa, $idp);
            $registro = $stmt->execute();
            if ($registro) {
                $idcategoria_comercial = $this->dbcm->insert_id;  
                $stmt->close();
                $this->registrar_categoria($idcategoria_comercial, $rubro_idrubro);
                return;
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registro_categoria_comercial");
                $stmt->close();
            }
   
        }

        echo json_encode($res);
    }

    public function registrar_categoria( $idcategoria_comercial, $rubro_idrubro) {

        $verificarQuery = "SELECT COUNT(*) AS count FROM categoria WHERE rubro_idrubro = ? AND idcategoria_comercial = ?";
        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_categoria"));
            return;
        }
        $stmt->bind_param("ii", $rubro_idrubro, $idcategoria_comercial);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe una entrada con el mismo tipo.", "registrar_categoria");
        } else {
            $query = "INSERT INTO categoria (idcategoria_comercial, rubro_idrubro) VALUES (?, ?);";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta"));
                return;
            }
          
            $stmt->bind_param("ii", $idcategoria_comercial, $rubro_idrubro);

            $registro = $stmt->execute();
    
            if ($registro) {
                
                $res = array("ok", "Se registraron correctamente ambos registros", "registrar_categoria");
                
    
            } else {
                $res = array("Error", "No se registró correctamente el registro del producto: " . $stmt->error, "registrar_categoria");
            }
            $stmt->close();
        }
    
        echo json_encode($res);
    }
    
    public function editar_categoria_comercial($id_categorias,$nombre, $descripcion, $rubro,$idp,$empresa){

        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM categorias WHERE nombre = ?  AND id_empresa = ? AND id_categorias != ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_categoria_comercial"));
            return;
        }
    
        $stmt->bind_param("ssi", $nombre, $idempresa,$id_categorias);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        
        if ($count > 0) {
            $res = array("Error", "Ya existe un producto con el mismo nombre.", "editar_categoria_comercial");
        }else{
            $sql = "UPDATE categorias
                    SET nombre = ?, descripcion = ?, idp = ?
                    WHERE id_categorias  = ?";
            $stmt = $this->dbcm->prepare($sql);
            $stmt->bind_param("ssii", 
                $nombre, $descripcion, $idp, $id_categorias);
            $editar = $stmt->execute();
            if ($editar) {
                
                $stmt->close();
                $query_produccion = "UPDATE categoria SET rubro_idrubro = ? WHERE idcategoria_comercial = ? " ;
                $stmt = $this->dbp->prepare($query_produccion);
                if ($stmt === false) {
                    echo json_encode(array("Error", "No se pudo preparar la consulta editar producto","editar_categoria_comercial"));
                }
                $stmt->bind_param("ii",$rubro,$id_categorias);
                $editar = $stmt->execute();


                if($editar){
                    $res = array("ok","Se guardaron los cambios correctamente","editar_categoria_comercial");
                }else{
                    $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_categoria_comercial");

                }
                

            } else {
                echo json_encode(array("Error", "Error al actualizar el registro: " . $stmt->error, "editar_categoria_comercial"));
            }
            $stmt->close();

        }
        echo json_encode($res);
    }
    function listar_categorias_comercial($empresa) {
        
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $this->sincronizar_con_comercial_categoria($empresa);
    
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);
    
        // Consulta en la primera base de datos
        $query1 = "SELECT id_categorias,nombre,descripcion,estado,id_empresa,idp 
                   FROM categorias WHERE id_empresa = ? ORDER BY id_categorias DESC";
        $stmt = $this->dbcm->prepare($query1);
        if ($stmt === false) {
            die("Error al preparar la consulta en base_de_datos_1: " . $this->dbcm->error);
        }
    
        // Ejecutar la consulta y obtener los resultados
        $stmt->bind_param("s", $idempresa); 
        $stmt->execute();
        $result1 = $stmt->get_result();
    
        $productos = [];
    
        while ($producto1 = $result1->fetch_assoc()) {
            $id_productos = $producto1['id_categorias'];
    
            // Consulta en la segunda base de datos
            $query2 = "SELECT * FROM categoria AS c 
                       WHERE c.idcategoria_comercial = ?";
            $stmt2 = $this->dbp->prepare($query2);
            if ($stmt2 === false) {
                die("Error al preparar la consulta en base_de_datos_2: " . $this->dbp->error);
            }
    
            $stmt2->bind_param("i", $id_productos);
            $stmt2->execute();
            $result2 = $stmt2->get_result();
    
            $producto2 = $result2->fetch_assoc();
    
            // Combinar los resultados de ambas bases de datos
            $producto_combinado = array_merge($producto1, $producto2);
            $productos[] = $producto_combinado;
    
            $stmt2->close();
        }
    
        // Cerrar la primera consulta
        $stmt->close();
    
        // Devolver los resultados en formato JSON
        echo json_encode($productos);
    }
    
    public function editar_estado_producto($id,$estado){    
        $query = "UPDATE producto SET estado = ? WHERE idproduct_comercial = ?";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta","editar_estado_producto"));
            return;
        }

        $stmt->bind_param("ii",$estado,$id);
        $editar_estado = $stmt->execute();

        if($editar_estado){
            $res = array("ok","Se guardaron los cambios correctamente","editar_estado_producto");
        }else{
            $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_estado_producto");
        }
        $stmt->close();
        
        echo json_encode($res);
        
    }
    
    public function eliminar_categoriaComercial($id) {
        // Iniciar transacción
        $this->dbp->begin_transaction();
        
        try {
            // Verificar si el producto está relacionado en alguna tabla
            $relacionadas = [
                'productos' => 'No se puede eliminar porque hay registros en productos',
            ];
            
            foreach ($relacionadas as $tabla => $mensaje) {
                // $query = "SELECT 1 FROM $tabla WHERE producto_idproducto = ?";
                $query = "SELECT 1 FROM $tabla WHERE categorias_id_categorias = ?";
                $stmt = $this->dbcm->prepare($query);
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
    
               // Eliminar la categoria de comercial
               $query = "DELETE FROM categorias WHERE id_categorias = ?";
               $stmt = $this->dbcm->prepare($query);
               if ($stmt === false) {
                   throw new Exception("No se pudo preparar la consulta para eliminar el producto");
               }
               $stmt->bind_param("i", $id);
               $stmt->execute();
               $stmt->close();
           
               // Eliminar la categoria de produccion

               $consulta = $this->dbp->query("SELECT idcategoria FROM categoria WHERE idcategoria_comercial='$id';");
               $result = $consulta->fetch_assoc();
               $idCategoria = $result['idcategoria'];

               $query = "DELETE FROM categoria WHERE idcategoria = ?";
               $stmt = $this->dbp->prepare($query);
               if ($stmt === false) {
                   throw new Exception("No se pudo preparar la consulta para eliminar el producto");
               }
               $stmt->bind_param("i", $idCategoria);
               $stmt->execute();
               $stmt->close();
       
    
            // Confirmar transacción
            $this->dbp->commit();
            $res = array("ok", "Se eliminó correctamente", "eliminar_categoriaComercial");
    
        } catch (Exception $e) {
            // Revertir transacción
            $this->dbp->rollback();
            $res = array("Error", $e->getMessage(), "eliminar_categoriaComercial");
        }
        echo json_encode($res);
    }
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }   
    
    public function listar_Productos_OP($empresa){
        $lista =[];
        $idempresa = $this->getidempresa($empresa);
        $consulta = 'select p.id_productos, p.nombre, p.codigo from productos p where p.idempresa = ? ';

        $stmt = $this->dbcm->prepare($consulta);
        if ($stmt === false) {
            die("Error en la preparacion de la consulta: ".
            $this->dbcm->error);
        }
        $stmt -> bind_param("i",$idempresa);
        $stmt-> execute();

        $result = $stmt->get_result();
        if($result->num_rows > 0){
            while($row = $result->fetch_assoc()){
                $res = [
                    "id_productos" => $row['id_productos'],
                    "nombre" => $row['nombre'],
                    "codigo" => $row['codigo']
                ];
                array_push($lista,$res);
            }
        }
        $stmt -> close();
        echo json_encode($lista);

    }
}
?>