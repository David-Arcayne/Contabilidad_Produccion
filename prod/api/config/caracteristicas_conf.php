<?php
require_once "../../db/db.php";
class Caracteristica_conf extends DB{
    public function registroCaracteristicas($nombre,$tipo,$minimo,$maximo,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("Error", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbp->query("INSERT INTO caracteristicas(caracteristica,tipo,minimo,maximo,empresa_idempresa) VALUES ('$nombre','$tipo','$minimo','$maximo','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar",$nombre);
            }
        }
        echo json_encode($res);
        
    }
    public function listaCaracteristicas($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbp->query("SELECT e.idcaracteristicas, e.caracteristica, e.tipo, e.minimo, e.maximo FROM caracteristicas AS e WHERE e.empresa_idempresa = '$idempresa' ORDER BY e.idcaracteristicas DESC");
    
        while ($qwe = $this->dbp->fetch($getPedido)) {
            $res = array(
                "idcaracteristicas" => $qwe['idcaracteristicas'],
                "caracteristica" => $qwe['caracteristica'],
                "tipo" => $qwe['tipo'],
                "minimo" => $qwe['minimo'],
                "maximo" => $qwe['maximo']
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
    public function editarCaracteristicas($id,$nombre,$tipo,$minimo,$maximo,$empresa) {
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE caracteristicas
                                    SET caracteristica = '$nombre',
                                    tipo = '$tipo',
                                    minimo = '$minimo',
                                    maximo = '$maximo'
                                    WHERE idcaracteristicas = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar",$id,$nombre,$empresa);
            }
        }
        echo json_encode($res);
    }
    public function eliminarCaracteristica($idcaracteristica,$idempresa){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbp->query("DELETE FROM caracteristicas WHERE idcaracteristicas = '$idcaracteristica'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("ok", "se elimino exitosamente","eliminarCaracteristica");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }
}
?>
