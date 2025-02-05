<?php
require_once "../../db/db.php";
class Medidas_conf extends DB{
    public function registroMedidas($nombre,$sigla,$empresa){
 
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM medida WHERE empresa_idempresa = ?  AND (nombre_med = ? OR sigla = ? )";

        $stmt = $this->dbp->prepare($verificarQuery);
        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta"));
            return;
        }
        $stmt->bind_param("iss",$idempresa,$nombre,$sigla);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if($count > 0){
            $res = array("Error","Ya existe una entrada con el mismo nombre o código.","registroMedidas");
        }else{
            $query = "INSERT INTO medida(sigla,nombre_med,empresa_idempresa) VALUES  (?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if($stmt === false){
                echo json_encode(array("Error","No se pudo preparar la consulta","registroMedidas"));
                return;
            }
            $stmt->bind_param("ssi",$sigla,$nombre,$idempresa);
            $registro_medida = $stmt->execute();

            if($registro_medida){
                $res = array("ok","Se registro correctamente","registroMedidas");
            }else{
                $res = array("Error", "No se registro correctamente: " . $stmt->error,"registroMedidas");
            }
            $stmt->close();
        }
        echo json_encode($res);


    }
    public function editar_Medida($id,$nombre,$sigla,$empresa) {
        $idempresa = $this->getidempresa($empresa);
        

        $verificarQuery = "SELECT COUNT(*) as count FROM medida WHERE (sigla = ? or nombre_med = ?) AND empresa_idempresa = ? AND idmedida != ?";


        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta"));
            return false;
        }
        $stmt->bind_param('ssii',$sigla ,$nombre,$idempresa,$id );
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if ($count > 0) {
            
                $res = array("Error", "El nombre o código ingresado ya está en uso.","editar_Medida");
            
        }else{
            $query = "UPDATE medida SET nombre_med = ?, sigla = ? WHERE idmedida = ? AND empresa_idempresa = ?";
            $stmt = $this->dbp->prepare($query);
        
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta"));
                return;
            }
        
            $stmt->bind_param("ssii", $nombre, $sigla, $id, $idempresa);
            $editar_area = $stmt->execute();
        
            if ($editar_area) {
                $res = array("ok", "Se guardaron los cambios correctamente", "editar_Medida");
            } else {
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_Medida");
            }
        
            $stmt->close();
        
        }
        echo json_encode($res);

    }
    public function listarMedidas($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $query = "SELECT m.idmedida,m.nombre_med,m.sigla FROM medida AS m WHERE m.empresa_idempresa = ? ORDER BY m.idmedida DESC";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("Error" , "No se pudo preparar la consulta","listar_material"));
            return;
        }
        $stmt->bind_param("i",$idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result === false){
            echo json_encode(array("Error","Error al ejecutar la consulta","listar_material"));
            return;
        }
        while ($medida = $result->fetch_assoc()) {
            $res = array(
                "id"=>$medida['idmedida'],
                "nombre"=>$medida['nombre_med'],
                "sigla"=>$medida['sigla']
                

            );
            array_push($lista,$res);
        }
        $stmt->close();
        echo json_encode($lista);

    }
    public function eliminar_medida2($idmedida,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $delete = $this->dbp->query("DELETE FROM medida WHERE idmedida = '$idmedida'AND empresa_idempresa='$idempresa'");
        if($delete===TRUE){
            $res=array("ok","Se elimino correctamente","eliminarmedida");
        }else{
            $res=array("Error","No se pudo eliminar");
        }
        echo json_encode($res);
    }
    public function eliminar_medida($id,$empresa) {
        
    
        
        $control = 1;
        $query = "SELECT * FROM medida m INNER JOIN producto p ON p.medida_idmedida = m.idmedida WHERE m.idmedida = ?"; 
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $res = array("Error",'No se puede eliminar porque hay registros en producto',"eliminarmedida");
            $control = 0;

        }
        $stmt->close();
    
        if ($control == 1) {
            $query = "SELECT * FROM medida m INNER JOIN material mt ON m.idmedida = mt.medida_idmedida WHERE m.idmedida = ?";
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("Error",'No se puede eliminar porque hay registros en material',"eliminarmedida");
                $control = 0;
            }
            $stmt->close();
        }
        if ($control == 1) {
            $query = "SELECT * FROM medida m INNER JOIN material_salida mt ON m.idmedida = mt.idmaterial_salida WHERE m.idmedida = ?";
            $stmt = $this->dbp->prepare($query);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $res = array("Error",'No se puede eliminar porque hay registros en salida material',"eliminarmedida");
                $control = 0;
            }
            $stmt->close();
        }
    
        if ($control == 1) {
            $idempresa = $this->getidempresa($empresa);

            $query = "DELETE FROM medida WHERE idmedida = ? AND empresa_idempresa= ?";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error" => "No se pudo preparar la consulta","eliminarmedida"));
                return;
            }
        
            $stmt->bind_param("ii", $id,$idempresa);
            $del = $stmt->execute();
    
            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminarmedida");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error,"eliminarmedida");
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