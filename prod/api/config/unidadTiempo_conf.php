<?php
require_once "../../db/db.php";
class UnidadTiempo_conf extends DB{
    public function registroUnidadTiempoControl($unidad,$detalle,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_unidad_tiempo WHERE unidad = '$unidad' AND empresa_idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("Error", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbp->query("INSERT INTO control_unidad_tiempo(unidad,detalle,empresa_idempresa) VALUES ('$unidad','$detalle','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("ok", "Registro exitoso","registroUnidadTiempoControl");
            } else {
                $res = array("Error", "No se pudo registrar");
            }
        }
        //   echo ($medida);
        echo json_encode($res);
        // echo json_encode($res);
        
    }
    
    public function listaUnidadTiempoControl($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbp->query("SELECT t.idcontrol_unidad_tiempo, t.unidad, t.detalle FROM control_unidad_tiempo AS t WHERE t.empresa_idempresa = '$idempresa' ORDER BY t.idcontrol_unidad_tiempo DESC");
    
        while ($qwe = $this->dbp->fetch($getPedido)) {
            $res = array(
                "idcontrol_unidad_tiempo" => $qwe['idcontrol_unidad_tiempo'],
                "unidad" => $qwe['unidad'],
                "detalle" => $qwe['detalle']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    } 
    public function editarUnidadTiempoControl($id,$unidad,$detalle,$empresa) {
        // echo json_encode(array($id,$unidad,$detalle,$idempresa));
        //        $verificarQuery = "SELECT COUNT(*) as count FROM tipo_envase WHERE nombre = ? AND empresa_idempresa = ? AND idtipo_envase != ?";

        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_unidad_tiempo WHERE unidad = '$unidad' AND empresa_idempresa = '$idempresa' AND idcontrol_unidad_tiempo != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("Error", "El registro ya existe","editarUnidadTiempoControl");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE control_unidad_tiempo
                                    SET unidad = '$unidad',
                                    detalle = '$detalle'
                                    WHERE idcontrol_unidad_tiempo = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarUnidadTiempoControl");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }
    public function eliminarUnidadTiempoControl($id){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbp->query("DELETE FROM control_unidad_tiempo WHERE idcontrol_unidad_tiempo = '$id'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("ok", "se elimino exitosamente","eliminarUnidadTiempoControl");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }
}
?>
