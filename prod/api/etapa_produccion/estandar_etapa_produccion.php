<?php
require_once "../../db/db.php";
class Estandar_etapa_produccion extends DB{

    public function registrar_estandar_etapa_produccion($horas_prod, $porcentaje_evolucion, $fecha, $idetapa_prod){
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
                $registroEstandar = $this->dbp->query("INSERT INTO estandar_etapa_produccion(horas_produccion, porcentaje_evolucion, fecha, etapas_produccion_idetapas_produccion) VALUES ('$horas_prod', '$porcentaje_evolucion', '$fecha', '$idetapa_prod')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_estandar_etapa_produccion");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function listar_estandar_etapa_produccion($idetapa_prod){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            // $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT * FROM estandar_etapa_produccion WHERE etapas_produccion_idetapas_produccion = '$idetapa_prod' ORDER BY idestandar_etapa_produccion DESC");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbcm->fetch($getPedido)){
                 $res=array("idestandar_etapa_produccion"=>$qwe['idestandar_etapa_produccion'],
                 "horas_produccion"=>$qwe['horas_produccion'],
                 "porcentaje_evolucion"=>$qwe['porcentaje_evolucion'],
                 "fecha"=>$qwe['fecha'],
                 "etapas_produccion_idetapas_produccion"=>$qwe['etapas_produccion_idetapas_produccion']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }

        public function editar_estandar_etapa_produccion($idestandarEt,$horas_produccion,$porcentaje_evolucion,$fecha,$idetapaProd) {
            // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
            // $idempresa = $this->getidempresa($empresa);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE estandar_etapa_produccion
                                        SET horas_produccion = '$horas_produccion',
                                            porcentaje_evolucion = '$porcentaje_evolucion',
                                            fecha = '$fecha',
                                            etapas_produccion_idetapas_produccion = '$idetapaProd'
    
                                        WHERE idestandar_etapa_produccion = '$idestandarEt';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","editar_estandar_etapa_produccion");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }

        public function eliminar_estandar_etapa_produccion($idestandarEt){
            // echo json_encode(array($idproveedor,$idempresa,"hola"));
    
            // $idempresa = $this->getidempresa($empresa);
                // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                // $resultado = $consulta->fetch_assoc();
                // $totalRegistros = $resultado['total'];
    
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $registroProveedor = $this->dbp->query("DELETE FROM estandar_etapa_produccion WHERE idestandar_etapa_produccion = '$idestandarEt'");
                    if ($registroProveedor === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_estandar_etapa_produccion");
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