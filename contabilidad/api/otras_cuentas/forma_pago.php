<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; ini_set

class Forma_pago extends DB{
    public function registrar_forma_pago($nombre,$descripcion,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM forma_pago WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO forma_pago(nombre,descripcion,idempresa) VALUES ('$nombre','$descripcion','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar",$nombre);
            }
        }
        echo json_encode($res);
        
    }
    public function listar_forma_pago($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM forma_pago WHERE idempresa = '$idempresa' ORDER BY idforma_pago DESC");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idforma_pago" => $qwe['idforma_pago'],
                "nombre" => $qwe['nombre'],
                "descripcion" => $qwe['descripcion']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function editar_forma_pago($id,$nombre,$descripcion,$empresa) {
        $idempresa = $this->getidempresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM forma_pago WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND idforma_pago != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE forma_pago
                                    SET nombre = '$nombre',
                                    descripcion = '$descripcion'
                                    WHERE idforma_pago = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar",$id,$nombre,$empresa);
            }
        }
        echo json_encode($res);
    }
 
    public function eliminar_forma_pago($id){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbc->query("DELETE FROM forma_pago WHERE idforma_pago = '$id'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
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