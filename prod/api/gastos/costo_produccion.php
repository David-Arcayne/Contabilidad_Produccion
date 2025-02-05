<?php
require_once "../../db/db.php";
class Costo_produccion extends DB{

    public function registrar_costo_produccion($costo_materia_prima, $costo_mano_obra, $costo_gastos_generales,$total, $produccion_idproduccion){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
        //  $idempresa = $this->getidempresa($empresa);
        //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_pedido WHERE material_idmaterial = '$material'");
        //     $resultado = $consulta->fetch_assoc();
        //     $totalRegistros = $resultado['total'];
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroEstandar = $this->dbp->query("INSERT INTO costo_produccion(costo_materia_prima, costo_mano_obra, costo_gastos_generales,total, produccion_idproduccion) VALUES ('$costo_materia_prima', '$costo_mano_obra', '$costo_gastos_generales','$total', '$produccion_idproduccion')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_costo_produccion");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function listar_costo_produccion($empresa){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT * FROM costo_produccion cp INNER JOIN produccion p ON p.idproduccion=cp.produccion_idproduccion
                        INNER JOIN lote l ON l.idlote = p.lote_idlote
                        WHERE l.empresa_idempresa='$idempresa';");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbp->fetch($getPedido)){
                 $res=array("idcosto_produccion"=>$qwe['idcosto_produccion'],
                 "costo_materia_prima"=>$qwe['costo_materia_prima'],
                 "costo_mano_obra"=>$qwe['costo_mano_obra'],
                 "costo_gastos_generales"=>$qwe['costo_gastos_generales'],
                 "total"=>$qwe['total'],
                 "produccion_idproduccion"=>$qwe['produccion_idproduccion']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }
        public function editar_limpieza($idcosto_produccion,$costo_materia_prima, $costo_mano_obra, $costo_gastos_generales,$total, $produccion_idproduccion) {
            // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
            // $idempresa = $this->getidempresa($empresa);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE costo_produccion
                                        SET fecha_inicio = '$fecha_inicio',
                                            horas = '$horas',
                                            observaciones = '$observaciones',
                                            hora_inicio = '$hora_inicio',
                                            tarea_limpieza_idtarea_limpieza = '$tarea_limpieza_idtarea_limpieza',
                                            empleado_idempleado = '$empleado_idempleado'
    
                                        WHERE idlimpieza = '$idlimpieza';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","editar_limpieza");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }

        public function eliminar_limpieza($idlimpieza){
            // echo json_encode(array($idproveedor,$idempresa,"hola"));
    
            // $idempresa = $this->getidempresa($empresa);
                // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                // $resultado = $consulta->fetch_assoc();
                // $totalRegistros = $resultado['total'];
    
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbp->query("DELETE FROM limpieza WHERE idlimpieza = '$idlimpieza'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_limpieza");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
        }
        
        // ------------------------------------------------------------------------------------

        public function getidempresa($md5){
            $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
            $qwe=$this->dbe->fetch($registro);
            return $qwe['idorganizacion'];
        }
}
?>