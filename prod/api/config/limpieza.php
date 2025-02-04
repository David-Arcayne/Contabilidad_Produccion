<?php
require_once "../../db/db.php";
class Limpieza extends DB{
    public function registrar_limpieza($fecha_inicio, $horas, $observaciones,$hora_inicio, $tarea_limpieza_idtarea_limpieza,$empleado_idempleado){
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
                $registroEstandar = $this->dbp->query("INSERT INTO limpieza(fecha_inicio, horas, observaciones,hora_inicio, tarea_limpieza_idtarea_limpieza,empleado_idempleado) VALUES ('$fecha_inicio', '$horas', '$observaciones','$hora_inicio', '$tarea_limpieza_idtarea_limpieza','$empleado_idempleado')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_limpieza");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function listar_limpieza($empresa){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT * FROM limpieza l INNER JOIN tarea_limpieza tl ON tl.idtarea_limpieza=l.tarea_limpieza_idtarea_limpieza
                        INNER JOIN seccion s ON s.idseccion = tl.seccion_idseccion
                        WHERE s.empresa_idempresa='$idempresa';");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbp->fetch($getPedido)){
                 $res=array("idlimpieza"=>$qwe['idlimpieza'],
                 "fecha_inicio"=>$qwe['fecha_inicio'],
                 "horas"=>$qwe['horas'],
                 "observaciones"=>$qwe['observaciones'],
                 "hora_inicio"=>$qwe['hora_inicio'],
                 "empleado_idempleado"=>$qwe['empleado_idempleado'],
                 "tarea_limpieza_idtarea_limpieza"=>$qwe['tarea_limpieza_idtarea_limpieza']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }
        public function editar_limpieza($idlimpieza,$fecha_inicio, $horas, $observaciones, $hora_inicio, $tarea_limpieza_idtarea_limpieza,$empleado_idempleado) {
            // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
            // $idempresa = $this->getidempresa($empresa);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE limpieza
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
        public function listar_limpieza_fecha_reciente($empresa){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT l1.idlimpieza, l1.fecha_inicio, l1.horas, l1.observaciones, l1.hora_inicio, l1.empleado_idempleado, l1.tarea_limpieza_idtarea_limpieza 
FROM limpieza l1 
INNER JOIN ( SELECT tarea_limpieza_idtarea_limpieza, MAX(CONCAT(fecha_inicio, ' ', hora_inicio)) AS max_datetime 
FROM limpieza 
GROUP BY tarea_limpieza_idtarea_limpieza ) l2 
ON l1.tarea_limpieza_idtarea_limpieza = l2.tarea_limpieza_idtarea_limpieza 
AND CONCAT(l1.fecha_inicio, ' ', l1.hora_inicio) = l2.max_datetime 
INNER JOIN tarea_limpieza tl ON tl.idtarea_limpieza = l1.tarea_limpieza_idtarea_limpieza 
INNER JOIN seccion s ON s.idseccion = tl.seccion_idseccion WHERE s.empresa_idempresa = '$idempresa';");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbp->fetch($getPedido)){
                 $res=array("idlimpieza"=>$qwe['idlimpieza'],
                 "fecha_inicio"=>$qwe['fecha_inicio'],
                 "horas"=>$qwe['horas'],
                 "observaciones"=>$qwe['observaciones'],
                 "hora_inicio"=>$qwe['hora_inicio'],
                 "empleado_idempleado"=>$qwe['empleado_idempleado'],
                 "tarea_limpieza_idtarea_limpieza"=>$qwe['tarea_limpieza_idtarea_limpieza']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }
        
        // ------------------------------------------------------------------------------------

        public function registrar_tarea_limpieza($limpieza, $descripcion, $frecuencia, $costo,$idseccion,$idcontrol_unidad_tiempo){
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
                    $registroEstandar = $this->dbp->query("INSERT INTO tarea_limpieza(limpieza, descripcion, frecuencia, costo,seccion_idseccion,idcontrol_unidad_tiempo) VALUES ('$limpieza', '$descripcion', '$frecuencia', '$costo','$idseccion','$idcontrol_unidad_tiempo')");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Registro exitoso","registrar_tarea_limpieza");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
            public function listar_tarea_limpieza($empresa){
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                $lista = [];
                $idempresa = $this->getidempresa($empresa);
                $getPedido = $this->dbp->query("SELECT * FROM tarea_limpieza tl 
                            INNER JOIN seccion s ON s.idseccion = tl.seccion_idseccion
                            WHERE s.empresa_idempresa='$idempresa';");
                // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
                while($qwe=$this->dbp->fetch($getPedido)){
                     $res=array("idtarea_limpieza"=>$qwe['idtarea_limpieza'],
                     "limpieza"=>$qwe['limpieza'],
                     "descripcion"=>$qwe['descripcion'],
                     "frecuencia"=>$qwe['frecuencia'],
                     "costo"=>$qwe['costo'],
                     "seccion_idseccion"=>$qwe['seccion_idseccion'],
                     "idcontrol_unidad_tiempo"=>$qwe['idcontrol_unidad_tiempo']
                    ); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);
                 }
                  echo json_encode($lista);
            }
            public function editar_tarea_limpieza($idtarea_limpieza,$limpieza,$descripcion,$frecuencia,$costo,$seccion_idseccion,$idcontrol_unidad_tiempo) {
                // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
                // $idempresa = $this->getidempresa($empresa);
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroListaCompra = $this->dbp->query("UPDATE tarea_limpieza
                                            SET limpieza = '$limpieza',
                                                descripcion = '$descripcion',
                                                frecuencia = '$frecuencia',
                                                costo = '$costo',
                                                seccion_idseccion = '$seccion_idseccion',
                                                idcontrol_unidad_tiempo = '$idcontrol_unidad_tiempo'
                                            WHERE idtarea_limpieza = '$idtarea_limpieza';");
                    if ($registroListaCompra === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edición exitosa","editar_tarea_limpieza");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
    
            public function eliminar_tarea_limpieza($idlimpieza){
                // echo json_encode(array($idproveedor,$idempresa,"hola"));
        
                // $idempresa = $this->getidempresa($empresa);
                    // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                    // $resultado = $consulta->fetch_assoc();
                    // $totalRegistros = $resultado['total'];
        
                    if (0 > 0) {
                        $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_tarea_limpieza");
                    } else {
                        // Insertar el nuevo registro
                        $eliminarL = $this->dbp->query("DELETE FROM tarea_limpieza WHERE idtarea_limpieza = '$idlimpieza'");
                        if ($eliminarL === TRUE) {                                                                                                                                                    
                            $res = array("success", "se elimino exitosamente","eliminar_tarea_limpieza");
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