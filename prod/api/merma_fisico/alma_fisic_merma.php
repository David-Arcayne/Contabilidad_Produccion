<?php
require_once "../../db/db.php";
class Alma_fisic_merma extends DB{
    public function registrar_almacen_fisico($idmaterial,$idtipo_envase,$cantidad,$empresa){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa);
        if (0 > 0) {
            $res = array("Error", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbp->query("INSERT INTO almacen_fisico(material_idmaterial,tipo_envase_idtipo_envase,cantidad,empresa_idempresa) VALUES ('$idmaterial','$idtipo_envase','$cantidad','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registrar_almacen_fisico");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }
    public function listar_almacen_fisico($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbp->query("SELECT * FROM almacen_fisico 
         WHERE empresa_idempresa = '$idempresa' ORDER BY idalmacen_fisico DESC");
    
        while ($qwe = $this->dbp->fetch($getPedido)) {
            $res = array(
                "idalmacen_fisico" => $qwe['idalmacen_fisico'],
                "material_idmaterial" => $qwe['material_idmaterial'],
                "tipo_envase_idtipo_envase" => $qwe['tipo_envase_idtipo_envase'],
                "cantidad" => $qwe['cantidad'],
                "empresa_idempresa" => $qwe['empresa_idempresa']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function editar_almacen_fisico($id,$cantidad) {    

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE almacen_fisico
                                    SET cantidad = '$cantidad'
                                    WHERE idalmacen_fisico = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editar_almacen_fisico");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }
    public function eliminar_almacen_fisico($id){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbp->query("DELETE FROM almacen_fisico WHERE idalmacen_fisico = '$id'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminar_almacen_fisico");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }
    //----------------------------------------------------------------------------------------------------------
    public function registrar_merma($cantidad_envase,$peso_neto,$tipo_envase_idtipo_envase,$cantidad,$costo_unitario,$costo_envase,$justificacion,$material_idmaterial,$empresa,$idproveedor,$idcompra,$idalmacen){
        
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];
        // idmerma,cantidad_envase,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase,material_idmaterial,empresa_idempresa,proveedor_idproveedor,compra_idcompra
        // echo json_encode(array($cantidad_envase,$peso_neto,$tipo_envase_idtipo_envase,$cantidad,$costo_unitario,$costo_envase,$material_idmaterial,$empresa,$idproveedor,$idcompra,$idalmacen));
        
        if (0 > 0) {
            $res = array("Error", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbp->query("INSERT INTO merma(cantidad_envase,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase,justificacion,material_idmaterial,empresa_idempresa,proveedor_idproveedor,compra_idcompra,almacen_material_idalmacen_material) VALUES ('$cantidad_envase','$peso_neto','$tipo_envase_idtipo_envase','$cantidad','$costo_unitario','$costo_envase','$justificacion','$material_idmaterial','$idempresa','$idproveedor','$idcompra','$idalmacen')");
            if ($registroProveedor === TRUE) { 
            $consulta = $this->dbp->query("SELECT cantidad FROM almacen_material WHERE idalmacen_material = '$idalmacen'");
            $resultado = $consulta->fetch_assoc();
            $cantidadAlmacen = $resultado['cantidad'];
            $resCant = $cantidadAlmacen - $cantidad;
            $editarAlmacen = $this->dbp->query("UPDATE almacen_material SET cantidad = '$resCant' WHERE idalmacen_material = '$idalmacen'");
                                                                                                                                                        
                $res = array("success", "Registro exitoso","registrar_merma");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }
    public function listar_merma($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbp->query("SELECT * FROM merma
         WHERE empresa_idempresa = '$idempresa' ORDER BY idmerma DESC");
    
        while ($qwe = $this->dbp->fetch($getPedido)) {
            $res = array(
                "idmerma" => $qwe['idmerma'],
                "cantidad_envase" => $qwe['cantidad_envase'],
                "peso_neto" => $qwe['peso_neto'],
                "tipo_envase_idtipo_envase" => $qwe['tipo_envase_idtipo_envase'],
                "cantidad" => $qwe['cantidad'],
                "costo_unitario" => $qwe['costo_unitario'],
                "costo_envase" => $qwe['costo_envase'],
                "justificacion" => $qwe['justificacion'],
                "material_idmaterial" => $qwe['material_idmaterial'],
                "empresa_idempresa" => $qwe['empresa_idempresa'],
                "proveedor_idproveedor" => $qwe['proveedor_idproveedor'],
                "compra_idcompra" => $qwe['compra_idcompra']
            );
//idmerma,cantidad_envase,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase,material_idmaterial,empresa_idempresa,proveedor_idproveedor,compra_idcompra

            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    
    public function editar_merma($id,$cantidad_envase,$peso_neto,$cantidad,$costo_unitario,$costo_envase,$justificacion) {    

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE merma
                                    SET cantidad_envase = '$cantidad_envase',
                                    peso_neto = '$peso_neto',
                                    cantidad = '$cantidad',
                                    costo_unitario = '$costo_unitario',
                                    costo_envase = '$costo_envase',
                                    justificacion = '$justificacion'
                                    WHERE idmerma = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editar_merma");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
    }
    public function eliminar_merma($id){

        $consulta = $this->dbp->query("SELECT cantidad, almacen_material_idalmacen_material FROM merma WHERE idmerma = '$id'");
        $resultado = $consulta->fetch_assoc();
        $cantidadMerma = $resultado['cantidad'];
        $idalmacen = $resultado['almacen_material_idalmacen_material'];

        $consulta2 = $this->dbp->query("SELECT cantidad FROM almacen_material WHERE idalmacen_material = '$idalmacen'");
        $resultado2 = $consulta2->fetch_assoc();
        $cantidadAlmacen = $resultado2['cantidad'];

        $resCant = $cantidadAlmacen + $cantidadMerma;
            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbp->query("DELETE FROM merma WHERE idmerma = '$id'");
                if ($registroProveedor === TRUE) {   
                    $editarAlmacen = $this->dbp->query("UPDATE almacen_material SET cantidad = '$resCant' WHERE idalmacen_material = '$idalmacen'");                                                                                                                                                 
                    $res = array("success", "se elimino exitosamente","eliminar_merma");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
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
