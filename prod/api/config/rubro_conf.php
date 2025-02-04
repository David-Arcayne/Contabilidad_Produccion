<?php
require_once "../../db/db.php";
class Rubro_conf extends DB{
      
    public function registrar_rubro($nombre,$detalle,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM rubro WHERE empresa_idempresa = ?  AND (nombre_rubro = ? )";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("danger","No se pudo preparar la consulta","registrar_rubro"));
            return;
        }
        $stmt->bind_param("is",$idempresa,$nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if($count > 0){
            $res = array("Info","Ya existe una entrada con el mismo nombre","registrar_rubro");
        }else{
            $query="INSERT INTO rubro (nombre_rubro,detalle,empresa_idempresa) VALUES (?,?,?);";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("danger","No se pudo preparar la consulta","registrar_rubro"));
                return;
            }
            $stmt->bind_param("ssi",$nombre,$detalle,$idempresa);
            $registro = $stmt->execute();
            if($registro){
                $res = array("success","Se registro correctamente","registrar_rubro");
            }else{
                $res = array("danger", "No se registro correctamente: " . $stmt->error,"registrar_rubro");
            }
            $stmt->close();
        }
        echo json_encode($res);

        
    }
    public function editar_rubro($id,$nombre,$detalle,$empresa) {
        $idempresa = $this->getidempresa($empresa);

        $verificarQuery = "SELECT COUNT(*) as count FROM rubro WHERE ( nombre_rubro = ?) AND empresa_idempresa = ? AND idrubro != ?";

        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("danger", "No se pudo preparar la consulta","editar_rubro"));
            return false;
        }
        $stmt->bind_param('sii' ,$nombre,$idempresa,$id );
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $res = array("danger", "El nombre ingresado ya está en uso.","editar_rubro");
        }else{
            $query = "UPDATE rubro SET detalle = ?, nombre_rubro = ? WHERE idrubro = ? AND empresa_idempresa = ?";
        
            $stmt = $this->dbp->prepare($query);
        
            if ($stmt === false) {
                echo json_encode(array("danger", "No se pudo preparar la consulta","editar_rubro"));
                return;
            }
        
            $stmt->bind_param("ssii", $detalle, $nombre, $id, $idempresa);
            $editar = $stmt->execute(); 

            if ($editar) {
                $res = array("success", "Se guardaron los cambios correctamente", "editar_rubro");
            } else {
                $error = $this->dbp->error;
                $res = array("danger", "No se guardaron los cambios correctamente: $error","editar_rubro");
            }

            $stmt->close();
       
        }
    
        
    
        // Enviar la respuesta como JSON
        echo json_encode($res);
    }
    
    public function listar_rubro($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $stmt = $this->dbp->prepare("SELECT r.idrubro , r.nombre_rubro , r.detalle FROM rubro AS r WHERE r.empresa_idempresa = ?");
        if ($stmt === false) {
            die("Error en la preparación de la consulta: " . $this->dbp->error);
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
                    "id" => $qwe["idrubro"],
                    "rubro" => $qwe["nombre_rubro"],
                    "detalle" => $qwe["detalle"]
                ];
                array_push($lista, $res);
            }
        } else {
            $res=array("Info","No se encontro registros de rubros","listar_rubro");
        }
    
        // Cerrar la declaración
        $stmt->close();
    
        // Devolver la lista en formato JSON
        echo json_encode($lista);
    }
    
    
    public function eliminar_rubro($id,$empresa){
        
// --------------------------------

    // Iniciar transacción
    $this->dbp->begin_transaction();
    
    try {
        // Verificar si el producto está relacionado en alguna tabla
        $relacionadas = [
            'pedido' => 'No se puede eliminar porque hay registros en pedido',
            'producto' => 'No se puede eliminar porque hay registros en producto',
            'maquina' => 'No se puede eliminar porque hay registros en maquina',
            'material' => 'No se puede eliminar porque hay registros en material',
            'categoria' => 'No se puede eliminar porque hay registros en categoria',
            'orden_produccion' => 'No se puede eliminar porque hay registros en orden_produccion',
            'etapas_produccion' => 'No se puede eliminar porque hay registros en etapas_produccion',
            'grupo_etapas' => 'No se puede eliminar porque hay registros en grupo_etapas',
            'lote' => 'No se puede eliminar porque hay registros en lote',
            'caracteristica_comercial' => 'No se puede eliminar porque hay registros en caracteristica_comercial',
            'grupo' => 'No se puede eliminar porque hay registros en grupo',
            'seccion' => 'No se puede eliminar porque hay registros en seccion',
            'compra' => 'No se puede eliminar porque hay registros en compra',
            'distribucion' => 'No se puede eliminar porque hay registros en distribucion'
        ];
        
        foreach ($relacionadas as $tabla => $mensaje) {
            $query = "SELECT 1 FROM $tabla WHERE rubro_idrubro = ?";
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

            // Eliminar el rubro

            $query = "DELETE FROM rubro WHERE idrubro = ?";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el producto");
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();

        // Confirmar transacción
        $this->dbp->commit();
        $res = array("success", "Se eliminó correctamente", "eliminar_rubro");

    } catch (Exception $e) {
        // Revertir transacción
        $this->dbp->rollback();
        $res = array("danger", $e->getMessage(), "eliminar_rubro");
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