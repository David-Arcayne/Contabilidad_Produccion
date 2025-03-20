<?php
require_once "../../db/db.php";
class Asiento extends DB{
    public function registrar_asignacion_asiento_operacion($idoperacion_modulos,$idasientotipo,$empresa){
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO asignacion_asiento_operacion_modulos(idoperacion_modulos,idasientotipo,idempresa) VALUES ('$idoperacion_modulos','$idasientotipo','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }

    public function listar_asignacion_asiento_operacion($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos WHERE idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idasignacion_asiento_operacion" => $qwe['idasignacion_asiento_operacion'],
                "idoperacion_modulos" => $qwe['idoperacion_modulos'],
                "idasientotipo" => $qwe['idasientotipo']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_operacion_modulo($nombre) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM operacion_modulos WHERE nombre_modulo = '$nombre'");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idoperacion_modulos" => $qwe['idoperacion_modulos'],
                "nombre_modulo" => $qwe['nombre_modulo'],
                "nombre_operacion" => $qwe['nombre_operacion'],
                "descripcion" => $qwe['descripcion']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function editar_divisa($id,$simbolo,$nombre,$empresa) {
        $idempresa = $this->getidempresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND iddivisa != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE divisa
                                    SET simbolo = '$simbolo',
                                    nombre = '$nombre'
                                    WHERE iddivisa = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar",$id,$nombre,$empresa);
            }
        }
        echo json_encode($res);
    }
    public function activar_divisa($iddivisa){
        $consulta = $this->dbc->query("SELECT * FROM divisa WHERE iddivisa = '$iddivisa'");
        $resultado = $consulta->fetch_assoc();
        $estadoDivisa = $resultado['estado'];
        $idempresa = $resultado['idempresa'];

        if($estadoDivisa == 2){ // desactivado
            // $edicionDivisa = $this->dbp->query("UPDATE divisas SET estado = '1' WHERE id_divisas = '$id_divisas'");
            $edicionDivisa = $this->dbc->query("UPDATE divisa
                                                SET estado = CASE
                                                    WHEN iddivisa = '$iddivisa' THEN 1
                                                    ELSE 2
                                                END
                                                WHERE idempresa = '$idempresa';
");

            $res = array("success", "la divisa se activo exitosamente","activar_divisa");
        }        
        echo json_encode($res);
    }
    public function eliminar_divisa($idcaracteristica,$idempresa){

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
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
}
?>
