<?php
require_once "../../db/db.php";
class Envase_conf extends DB{
    public function registroEnvases($nombre,$detalle,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM tipo_envase WHERE empresa_idempresa = ?  AND (nombre = ?)";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("danger","No se pudo preparar la consulta","registroEnvases"));
            return;
        }
        $stmt->bind_param("is",$idempresa,$nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if($count > 0){
            $res = array("danger","Ya existe una entrada con el mismo nombre","registroEnvases");
        }else{
            $query="INSERT INTO tipo_envase(nombre,detalle,empresa_idempresa) VALUES (?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta","registroEnvases"));
                return;
            }
            $stmt->bind_param("ssi",$nombre,$detalle,$idempresa);
            $registro = $stmt->execute();
            if($registro){
                $res = array("success","Se registro correctamente","registroEnvases");
            }else{
                $res = array("danger", "No se registro correctamente: " . $stmt->error,"registroEnvases");
            }
            $stmt->close();
        }
        echo json_encode($res);

        
    }
    
    public function listarEnvases($empresa){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $stmt = $this->dbp->prepare("SELECT e.idtipo_envase,e.nombre,e.detalle FROM tipo_envase AS e WHERE e.empresa_idempresa = ? ORDER BY e.idtipo_envase DESC");
        if ($stmt === false) {
            die("danger en la preparación de la consulta: " . $this->dbp->error);
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
                    "id" => $qwe["idtipo_envase"],
                    "nombre" => $qwe["nombre"],
                    "detalle" => $qwe["detalle"]
                ];
                array_push($lista, $res);
            }
        } else {
            echo "No se encontraron divisas.";
        }
    
        // Cerrar la declaración
        $stmt->close();
    
        // Devolver la lista en formato JSON
        echo json_encode($lista);
    }
    
    public function eliminar_envase($id, $empresa){
        // Iniciar transacción
        $this->dbp->begin_transaction();
            
        try {
            // Verificar si el producto está relacionado en alguna tabla
            $relacionadas = [
                'detalle_compra' => 'No se puede eliminar porque hay registros en detalle_compra',
            ];
            
            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE tipo_envase_idtipo_envase = ?";
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
    
                $query = "DELETE FROM tipo_envase WHERE idtipo_envase = ?";
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
    
   
    public function editar_envase($id, $nombre,$detalle, $empresa) {
        $idempresa = $this->getidempresa($empresa);

        $verificarQuery = "SELECT COUNT(*) as count FROM tipo_envase WHERE nombre = ? AND empresa_idempresa = ? AND idtipo_envase != ?";

        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("danger", "No se pudo preparar la consulta","editar_envase"));
            return false;
        }
        $stmt->bind_param('sii' ,$nombre,$idempresa,$id );
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $res = array("danger", "El nombre o código ingresado ya está en uso.","editar_envase");
        }else{
            $query = "UPDATE tipo_envase SET nombre=?, detalle = ? WHERE idtipo_envase=? AND empresa_idempresa = ?";
        
            $stmt = $this->dbp->prepare($query);
        
            if ($stmt === false) {
                echo json_encode(array("danger", "No se pudo preparar la consulta","editar_envase"));
                return;
            }
        
            $stmt->bind_param("ssii",$nombre,$detalle, $id, $idempresa);
            $editar = $stmt->execute(); 

            if ($editar) {
                $res = array("success", "Se guardaron los cambios correctamente", "editar_envase");
            } else {
                $error = $this->dbp->error;
                $res = array("danger", "No se guardaron los cambios correctamente: $error","editar_envase");
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
