<?php
require_once "../../db/db.php";
class Mantenimiento extends DB{

    public function registrar_mantenimiento($fecha_inicio, $horas, $observaciones,$hora_inicio, $tareas_mantenimiento_idtareas_mantenimiento,$empleado_idempleado){
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
                $registroEstandar = $this->dbp->query("INSERT INTO mantenimiento(fecha_inicio, horas, observaciones,hora_inicio, tareas_mantenimiento_idtareas_mantenimiento,empleado_idempleado) VALUES ('$fecha_inicio', '$horas', '$observaciones','$hora_inicio', '$tareas_mantenimiento_idtareas_mantenimiento','$empleado_idempleado')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_mantenimiento");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function listar_mantenimiento($empresa){
            // ini_set('display_errors', 1);
            // ini_set('display_startup_errors', 1);
            // error_reporting(E_ALL);
            $lista = [];
    
            $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT m.* FROM mantenimiento m 
            INNER JOIN tareas_mantenimiento tm ON tm.idtareas_mantenimiento=m.tareas_mantenimiento_idtareas_mantenimiento
INNER JOIN maquina mq ON mq.idmaquina=tm.maquina_idmaquina
INNER JOIN seccion s ON s.idseccion=mq.seccion_idseccion
WHERE s.empresa_idempresa='$idempresa';");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbp->fetch($getPedido)){
                 $res=array("idmantenimiento"=>$qwe['idmantenimiento'],
                 "fecha_inicio"=>$qwe['fecha_inicio'],
                 "horas"=>$qwe['horas'],
                 "observaciones"=>$qwe['observaciones'],
                 "hora_inicio"=>$qwe['hora_inicio'],
                 "tareas_mantenimiento_idtareas_mantenimiento"=>$qwe['tareas_mantenimiento_idtareas_mantenimiento'],
                 "empleado_idempleado"=>$qwe['empleado_idempleado']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }
        public function editar_mantenimiento($idmantenimiento,$fecha_inicio, $horas, $observaciones,$hora_inicio, $tareas_mantenimiento_idtareas_mantenimiento,$empleado_idempleado) {
            // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
            // $idempresa = $this->getidempresa($empresa);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE mantenimiento
                                        SET fecha_inicio = '$fecha_inicio',
                                            horas = '$horas',
                                            observaciones = '$observaciones',
                                            hora_inicio = '$hora_inicio',
                                            tareas_mantenimiento_idtareas_mantenimiento = '$tareas_mantenimiento_idtareas_mantenimiento',
                                            empleado_idempleado = '$empleado_idempleado'
    
                                        WHERE idmantenimiento = '$idmantenimiento';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","editar_mantenimiento");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }

        public function eliminar_mantenimiento($idmantenimiento){
            // echo json_encode(array($idproveedor,$idempresa,"hola"));
    
            // $idempresa = $this->getidempresa($empresa);
                // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                // $resultado = $consulta->fetch_assoc();
                // $totalRegistros = $resultado['total'];
    
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbp->query("DELETE FROM mantenimiento WHERE idmantenimiento = '$idmantenimiento'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_mantenimiento");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
        }

        // ------------------------------------------------------------------------------------

        public function registrar_tareas_mantenimiento($mantenimiento, $descripcion, $frecuencia, $costo,$maquina_idmaquina,$idcontrol_unidad_tiempo){
            // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
            // echo json_encode($r
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
                    $registroEstandar = $this->dbp->query("INSERT INTO tareas_mantenimiento(mantenimiento, descripcion, frecuencia, costo,maquina_idmaquina,idcontrol_unidad_tiempo) VALUES ('$mantenimiento', '$descripcion', '$frecuencia', '$costo','$maquina_idmaquina','$idcontrol_unidad_tiempo')");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Registro exitoso","registrar_tareas_mantenimiento");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
            public function listar_tareas_mantenimiento($empresa){
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                $lista = [];
                $idempresa = $this->getidempresa($empresa);
                $getPedido = $this->dbp->query("SELECT tm.* FROM tareas_mantenimiento tm 
                            INNER JOIN maquina m ON m.idmaquina = tm.maquina_idmaquina
                             INNER JOIN seccion s ON s.idseccion = m.seccion_idseccion
                            WHERE s.empresa_idempresa='$idempresa';");
                // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
                while($qwe=$this->dbp->fetch($getPedido)){
                     $res=array("idtareas_mantenimiento"=>$qwe['idtareas_mantenimiento'],
                     "mantenimiento"=>$qwe['mantenimiento'],
                     "descripcion"=>$qwe['descripcion'],
                     "frecuencia"=>$qwe['frecuencia'],
                     "costo"=>$qwe['costo'],
                     "maquina_idmaquina"=>$qwe['maquina_idmaquina'],
                     "idcontrol_unidad_tiempo"=>$qwe['idcontrol_unidad_tiempo']
                    ); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);
                 }
                  echo json_encode($lista);
            }
            public function editar_tareas_mantenimiento($idtareas_mantenimiento,$mantenimiento,$descripcion,$frecuencia,$costo,$maquina_idmaquina,$idcontrol_unidad_tiempo) {
                // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
                // $idempresa = $this->getidempresa($empresa);
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroListaCompra = $this->dbp->query("UPDATE tareas_mantenimiento
                                            SET mantenimiento = '$mantenimiento',
                                                descripcion = '$descripcion',
                                                frecuencia = '$frecuencia',
                                                costo = '$costo',
                                                maquina_idmaquina = '$maquina_idmaquina',
                                                idcontrol_unidad_tiempo = '$idcontrol_unidad_tiempo'
                                            WHERE idtareas_mantenimiento = '$idtareas_mantenimiento';");
                    if ($registroListaCompra === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edición exitosa","editar_tareas_mantenimiento");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
    
            public function eliminar_tareas_mantenimiento($idmantenimiento){
                // echo json_encode(array($idproveedor,$idempresa,"hola"));
        
                // $idempresa = $this->getidempresa($empresa);
                    // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                    // $resultado = $consulta->fetch_assoc();
                    // $totalRegistros = $resultado['total'];
        
                    if (0 > 0) {
                        $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_tareas_mantenimiento");
                    } else {
                        // Insertar el nuevo registro
                        $eliminarL = $this->dbp->query("DELETE FROM tareas_mantenimiento WHERE idtareas_mantenimiento = '$idmantenimiento'");
                        if ($eliminarL === TRUE) {                                                                                                                                                    
                            $res = array("success", "se elimino exitosamente","eliminar_tareas_mantenimiento");
                        } else {
                            $res = array("danger", "No se pudo registrar");
                        }
                    }
                    echo json_encode($res);
            }

            public function listar_mantenimiento_fecha_reciente($empresa){
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                $lista = [];
                $idempresa = $this->getidempresa($empresa);
                $getPedido = $this->dbp->query("SELECT m1.* 
                FROM mantenimiento m1 
                INNER JOIN ( SELECT tareas_mantenimiento_idtareas_mantenimiento, MAX(CONCAT(fecha_inicio, ' ', hora_inicio)) AS max_datetime 
                FROM mantenimiento 
                GROUP BY tareas_mantenimiento_idtareas_mantenimiento ) m2 
                ON m1.tareas_mantenimiento_idtareas_mantenimiento = m2.tareas_mantenimiento_idtareas_mantenimiento 
                AND CONCAT(m1.fecha_inicio, ' ', m1.hora_inicio) = m2.max_datetime 
                INNER JOIN tareas_mantenimiento tm ON tm.idtareas_mantenimiento = m1.tareas_mantenimiento_idtareas_mantenimiento 
                INNER JOIN maquina mq ON mq.idmaquina = tm.maquina_idmaquina 
                INNER JOIN seccion s ON s.idseccion = mq.seccion_idseccion WHERE s.empresa_idempresa = '$idempresa';");
                // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
                while($qwe=$this->dbp->fetch($getPedido)){
                     $res=array("idmantenimiento"=>$qwe['idmantenimiento'],
                     "fecha_inicio"=>$qwe['fecha_inicio'],
                     "horas"=>$qwe['horas'],
                     "observaciones"=>$qwe['observaciones'],
                     "hora_inicio"=>$qwe['hora_inicio'],
                     "tareas_mantenimiento_idtareas_mantenimiento"=>$qwe['tareas_mantenimiento_idtareas_mantenimiento'],
                     "empleado_idempleado"=>$qwe['empleado_idempleado']
                    ); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);
                 }
                  echo json_encode($lista);
            }
        public function getidempresa($md5){
            $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
            $qwe=$this->dbe->fetch($registro);
            return $qwe['idorganizacion'];
        }
}
?>