<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php";

class Divisa extends DB{
    public function registrar_divisa($simbolo,$nombre,$estado,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO divisa(simbolo,nombre,estado,idempresa) VALUES ('$simbolo','$nombre','$estado','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar",$nombre);
            }
        }
        echo json_encode($res);
        
    }
    public function listar_divisa($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM divisa WHERE idempresa = '$idempresa' ORDER BY iddivisa DESC");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "iddivisa" => $qwe['iddivisa'],
                "simbolo" => $qwe['simbolo'],
                "nombre" => $qwe['nombre'],
                "estado" => $qwe['estado']
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
