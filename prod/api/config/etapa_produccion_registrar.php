<?php
require_once "../../db/db.php";
class Etapas_produccion_registrar extends DB{

    public function registrar_etapas_has_Maquinas($etapa_id, $maquina_id) {
        $query = "INSERT INTO etapas_produccion_has_maquina (etapas_produccion_idetapas_produccion, maquina_idmaquina) VALUES (?, ?)";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("ii", $etapa_id, $maquina_id);
        
        if ($stmt->execute()) {
            $res = array("ok", "El registro se realizó correctamente", "registrar_etapas_has_maquina");
        } else {
            $res = array("Error", "No se pudo registrar: " . $stmt->error, "registrar_etapas_has_maquina");
        }
        
        echo json_encode($res);
    }
    public function eliminar_etapas_has_Maquinas($id){
        
            $query = "DELETE FROM etapas_produccion_has_maquina WHERE id = ?;";
            $stmt = $this->dbp->prepare($query);

            if ($stmt === false) {
                echo json_encode(array("Error" => "No se pudo preparar la consulta"));
                return;
            }

            $stmt->bind_param("i",$id);
            $del = $stmt->execute();

            if ($del) {
                $res = array("ok", "Se eliminó correctamente", "eliminar_etapas_has_maquina");
            } else {
                $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_etapas_has_maquina");
            }
            $stmt->close();
        
        
        echo json_encode($res);

    }
    public function listar_etapas_has_maquina($etapa_id){
        $lista = [];
        
        $stmt = $this->dbp->prepare("SELECT * FROM etapas_produccion_has_maquina  WHERE etapas_produccion_idetapas_produccion = ?");
        if ($stmt === false) {
            die("Error en la preparación de la consulta: " . $this->dbp->error);
        }
    
        $stmt->bind_param("i", $etapa_id);
        
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            while ($qwe = $result->fetch_assoc()) {
                $res = [
                    "id" => $qwe["id"],
                    "etapas_produccion_idetapas_produccion" => $qwe["etapas_produccion_idetapas_produccion"],
                    "maquina_idmaquina" => $qwe["maquina_idmaquina"]
                ];
                array_push($lista, $res);
            }
        } else {
            $res=array("Info","No se encontro registros de rubros","listar_rubro");
        }
    
        $stmt->close();
    
        echo json_encode($lista);
    }

    public function registrar_etapas_has_Materiales($etapa_id, $material_id) {
        $query = "INSERT INTO etapas_produccion_has_material (etapas_produccion_idetapas_produccion, material_idmaterial) VALUES (?, ?)";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("ii", $etapa_id, $material_id);
        
        if ($stmt->execute()) {
            $res = array("ok", "El registro se realizó correctamente", "registrar_etapas_has_material");
        } else {
            $res = array("Error", "No se pudo registrar: " . $stmt->error, "registrar_etapas_has_material");
        }
        
        echo json_encode($res);
    }
    public function eliminar_etapas_has_Materiales($id){
        
        $query = "DELETE FROM etapas_produccion_has_material WHERE id = ?;";
        $stmt = $this->dbp->prepare($query);

        if ($stmt === false) {
            echo json_encode(array("Error" => "No se pudo preparar la consulta"));
            return;
        }

        $stmt->bind_param("i",$id);
        $del = $stmt->execute();

        if ($del) {
            $res = array("ok", "Se eliminó correctamente", "eliminar_etapas_has_material");
        } else {
            $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_etapas_has_material");
        }
        $stmt->close();
    
        
        echo json_encode($res);

    }
    public function listar_etapas_has_material($etapa_id){
        $lista = [];
        
        $stmt = $this->dbp->prepare("SELECT * FROM etapas_produccion_has_material  WHERE etapas_produccion_idetapas_produccion = ?");
        if ($stmt === false) {
            die("Error en la preparación de la consulta: " . $this->dbp->error);
        }
    
        $stmt->bind_param("i", $etapa_id);
        
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            while ($qwe = $result->fetch_assoc()) {
                $res = [
                    "id" => $qwe["id"],
                    "etapas_produccion_idetapas_produccion" => $qwe["etapas_produccion_idetapas_produccion"],
                    "material_idmaterial" => $qwe["material_idmaterial"]
                ];
                array_push($lista, $res);
            }
        } else {
            $res=array("Info","No se encontro registros de rubros","listar_rubro");
        }
    
        $stmt->close();
    
        echo json_encode($lista);
    }

    public function registrar_etapas_has_Productos($etapa_id, $producto_id) {
        $query = "INSERT INTO etapas_produccion_has_producto (etapas_produccion_idetapas_produccion, producto_idproducto) VALUES (?, ?)";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("ii", $etapa_id, $producto_id);
        
        if ($stmt->execute()) {
            $res = array("ok", "El registro se realizó correctamente", "registrar_etapas_has_producto");
        } else {
            $res = array("Error", "No se pudo registrar: " . $stmt->error, "registrar_etapas_has_producto");
        }
        
        echo json_encode($res);
    }
    public function eliminar_etapas_has_Productos($id){
        
        $query = "DELETE FROM etapas_produccion_has_producto WHERE id = ?;";
        $stmt = $this->dbp->prepare($query);

        if ($stmt === false) {
            echo json_encode(array("Error" => "No se pudo preparar la consulta"));
            return;
        }

        $stmt->bind_param("i",$id);
        $del = $stmt->execute();

        if ($del) {
            $res = array("ok", "Se eliminó correctamente", "eliminar_etapas_has_producto");
        } else {
            $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_etapas_has_producto");
        }
        $stmt->close();
    
        
        echo json_encode($res);

    }
    public function listar_etapas_has_producto($etapa_id){
        $lista = [];
        
        $stmt = $this->dbp->prepare("SELECT * FROM etapas_produccion_has_producto  WHERE etapas_produccion_idetapas_produccion = ?");
        if ($stmt === false) {
            die("Error en la preparación de la consulta: " . $this->dbp->error);
        }
    
        $stmt->bind_param("i", $etapa_id);
        
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            while ($qwe = $result->fetch_assoc()) {
                $res = [
                    "id" => $qwe["id"],
                    "etapas_produccion_idetapas_produccion" => $qwe["etapas_produccion_idetapas_produccion"],
                    "producto_idproducto" => $qwe["producto_idproducto"]
                ];
                array_push($lista, $res);
            }
        } else {
            $res=array("Info","No se encontro registros de rubros","listar_rubro");
        }
    
        $stmt->close();
    
        echo json_encode($lista);
    }
    

    public function registrar_etapas_has_Subproductos($etapa_id, $sub_producto_id) {
        $query = "INSERT INTO etapas_produccion_has_sub_producto (etapas_produccion_idetapas_produccion, sub_producto_idsub_producto) VALUES (?, ?)";
        $stmt = $this->dbp->prepare($query);
        $stmt->bind_param("ii", $etapa_id, $sub_producto_id);
        
        if ($stmt->execute()) {
            $res = array("ok", "El registro se realizó correctamente", "registrar_etapas_has_sub_producto");
        } else {
            $res = array("Error", "No se pudo registrar: " . $stmt->error, "registrar_etapas_has_sub_producto");
        }
        
        echo json_encode($res);
    }
    public function eliminar_etapas_has_Subproductos($id){
        
        $query = "DELETE FROM etapas_produccion_has_sub_producto WHERE id = ?;";
        $stmt = $this->dbp->prepare($query);

        if ($stmt === false) {
            echo json_encode(array("Error" => "No se pudo preparar la consulta"));
            return;
        }

        $stmt->bind_param("i",$id);
        $del = $stmt->execute();

        if ($del) {
            $res = array("ok", "Se eliminó correctamente", "eliminar_etapas_has_subproducto");
        } else {
            $res = array("Error", "No se pudo eliminar: " . $stmt->error, "eliminar_etapas_has_subproducto");
        }
        $stmt->close();
    
        
        echo json_encode($res);

    }
    public function listar_etapas_has_subproducto($etapa_id){
        $lista = [];
        
        $stmt = $this->dbp->prepare("SELECT * FROM etapas_produccion_has_sub_producto  WHERE etapas_produccion_idetapas_produccion = ?");
        if ($stmt === false) {
            die("Error en la preparación de la consulta: " . $this->dbp->error);
        }
    
        $stmt->bind_param("i", $etapa_id);
        
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            while ($qwe = $result->fetch_assoc()) {
                $res = [
                    "id" => $qwe["id"],
                    "etapas_produccion_idetapas_produccion" => $qwe["etapas_produccion_idetapas_produccion"],
                    "sub_producto_idsub_producto" => $qwe["sub_producto_idsub_producto"]
                ];
                array_push($lista, $res);
            }
        } else {
            $res=array("Info","No se encontro registros de rubros","listar_rubro");
        }
    
        $stmt->close();
    
        echo json_encode($lista);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
}



?>