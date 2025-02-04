<?php
require_once "../../db/db.php";
class Divisa_conf extends DB{
      
    public function registrar_divisa($nombre, $tipo_divisa, $estado, $empresa, $monedasin = null){
        // Obtener el id de la empresa
        $idempresa = $this->getidempresa($empresa);
        
        // Verificar si ya existe una divisa con el mismo nombre para esa empresa
        $verificarQuery = "SELECT COUNT(*) AS count FROM divisas d
            WHERE d.nombre = ? AND d.idempresa = ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
    
        $stmt->bind_param("si", $nombre, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        
        if($count > 0){
            $res = array("danger", "Ya existe una divisa con el mismo nombre", "registrar_divisa");
        } else {
            // Si no existe, registrar la nueva divisa
            $query = "INSERT INTO divisas (nombre, tipo_divisa, estado, idempresa, monedasin) VALUE (?,?,?,?,?)";
            $stmt = $this->dbcm->prepare($query);
            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta"));
                return;
            }
    
            // Usar monedasin si se proporciona, de lo contrario pasar NULL
            $stmt->bind_param("ssisi", $nombre, $tipo_divisa, $estado, $idempresa, $monedasin);
            $registro_divisa = $stmt->execute();
    
            if($registro_divisa){
                $res = array("success", "Se registró correctamente", "registrar_divisa");
            } else {
                $res = array("danger", "No se registró correctamente: " . $stmt->error, "registrar_divisa");
            }
            $stmt->close();
        }
        
        echo json_encode($res);
    }
    
    public function editar_divisa($id_divisas, $nombre, $tipo_divisa,$empresa){
        $idempresa = $this->getidempresa($empresa);
        // Verificar si ya existe una divisa con el mismo nombre pero con un ID diferente
        $verificarQuery = "SELECT COUNT(*) AS count FROM divisas WHERE nombre = ? AND id_divisas != ? AND idempresa = ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("danger", "No se pudo preparar la consulta"));
            return;
        }
    
        $stmt->bind_param("sii", $nombre, $id_divisas,$idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if($count > 0){
            $res = array("danger", "Ya existe una divisa con el mismo nombre", "editar_divisa");
        } else {
            // Si no existe, proceder con la actualización
            $query = "UPDATE divisas SET nombre = ?, tipo_divisa = ? WHERE id_divisas = ?";
            $stmt = $this->dbcm->prepare($query);
    
            if($stmt === false){
                echo json_encode(array("danger", "No se pudo preparar la consulta", "editar_divisa"));
                return;
            }
    
            // Usar monedasin si se proporciona, de lo contrario pasar NULL
            $stmt->bind_param("ssi", $nombre, $tipo_divisa,  $id_divisas);
            $editar_divisa = $stmt->execute();
    
            if($editar_divisa){
                $res = array("success", "Se guardaron los cambios correctamente", "editar_divisa");
            } else {
                $res = array("danger", "No se pudieron guardar los cambios correctamente: " . $stmt->error, "editar_divisa");
            }
            $stmt->close();
        }
    
        echo json_encode($res);
    }
    
    public function activar_divisa($id_divisas){
        $consulta = $this->dbcm->query("SELECT * FROM divisas WHERE id_divisas = '$id_divisas'");
        $resultado = $consulta->fetch_assoc();
        $estadoDivisa = $resultado['estado'];
        $idempresa = $resultado['idempresa'];

        if($estadoDivisa == 2){ // desactivado
            // $edicionDivisa = $this->dbp->query("UPDATE divisas SET estado = '1' WHERE id_divisas = '$id_divisas'");
            $edicionDivisa = $this->dbcm->query("UPDATE divisas
                                                SET estado = CASE
                                                    WHEN id_divisas = '$id_divisas' THEN 1
                                                    ELSE 2
                                                END
                                                WHERE idempresa = '$idempresa';
");

            $res = array("success", "la divisa se activo exitosamente","activar_divisa");
        }        
        echo json_encode($res);
    }
    
    public function listar_divisas($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las divisas asociadas a una empresa
        $query = "SELECT d.id_divisas, d.nombre, d.tipo_divisa, d.estado, d.monedasin FROM `divisas` AS d WHERE d.idempresa = ? ORDER BY d.id_divisas DESC";
        $stmt = $this->dbcm->prepare($query);
    
        if($stmt === false){
            echo json_encode(array("danger", "No se pudo preparar la consulta", "listar_divisas"));
            return;
        }
    
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result === false){
            echo json_encode(array("danger", "Error al ejecutar la consulta", "listar_divisas"));
            return;
        }
    
        // Recorrer los resultados y agregarlos a la lista
        while ($divisa = $result->fetch_assoc()) {
            $res = array(
                "id" => $divisa['id_divisas'],
                "nombre" => $divisa['nombre'],
                "tipo_divisa" => $divisa['tipo_divisa'],
                "estado" => $divisa['estado'],
                "monedasin" => $divisa['monedasin']
            );
            array_push($lista, $res);
        }
    
        $stmt->close();
        echo json_encode($lista);
    }
    
    public function eliminar_divisa($id_divisas) {
        try {
            $this->dbp->begin_transaction();
            $this->dbcm->begin_transaction();
    
            $relacionadas = [
                'tipo_cambio' => 'No se puede eliminar porque hay registros en transacciones'
            ];
    
            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE moneda_idmoneda = ?";
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $id_divisas);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje);
                }
                $stmt->close();
            }
    
            // Eliminar la divisa
            $query = "DELETE FROM divisas WHERE id_divisas = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar la divisa");
            }
            $stmt->bind_param("i", $id_divisas);
            $stmt->execute();
            
            if ($stmt->affected_rows === 0) {
                throw new Exception("No se encontró la divisa para eliminar");
            }
            
            $stmt->close();
    
            // Confirmar transacciones
            $this->dbp->commit();
            $this->dbcm->commit();
    
            $res = ["success", "Se eliminó correctamente", "eliminar_divisa"];
        } catch (Exception $e) {
            $this->dbp->rollback();
            $this->dbcm->rollback();
            $res = ["danger", $e->getMessage(), "eliminar_divisa"];
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