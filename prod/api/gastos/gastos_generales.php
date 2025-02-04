<?php
require_once "../../db/db.php";
class Gastos_generales extends DB{
    public function registrar_gastos_generales($codigo, $nombre, $descripcion,$tipo_variable, $empresa_idempresa){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
         $idempresa = $this->getidempresa($empresa_idempresa);
            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM gastos_generales WHERE codigo = '$codigo' AND empresa_idempresa='$idempresa'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
            if ($totalRegistros > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroEstandar = $this->dbp->query("INSERT INTO gastos_generales(codigo, nombre, descripcion,tipo_variable, empresa_idempresa) VALUES ('$codigo', '$nombre', '$descripcion','$tipo_variable', '$idempresa')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_gastos_generales");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function listar_gastos_generales($empresa){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT * FROM gastos_generales
                        WHERE empresa_idempresa='$idempresa';");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbp->fetch($getPedido)){
                 $res=array("idgastos_generales"=>$qwe['idgastos_generales'],
                 "codigo"=>$qwe['codigo'],
                 "nombre"=>$qwe['nombre'],
                 "descripcion"=>$qwe['descripcion'],
                 "tipo_variable"=>$qwe['tipo_variable']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }
        public function editar_gastos_generales($idgastos_generales,$codigo, $nombre, $descripcion,$tipo_variable,$empresa_idempresa) {
            // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
            // $idempresa = $this->getidempresa($empresa);
            $idempresa = $this->getidempresa($empresa_idempresa);
            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM gastos_generales WHERE codigo = '$codigo' AND idgastos_generales != '$idgastos_generales' AND empresa_idempresa='$idempresa'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
            if ($totalRegistros > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE gastos_generales
                                        SET codigo = '$codigo',
                                            nombre = '$nombre',
                                            descripcion = '$descripcion',
                                            tipo_variable = '$tipo_variable'
                                        WHERE idgastos_generales = '$idgastos_generales';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","editar_gastos_generales");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }

        public function eliminar_gastos_generales($idgastos_generales){
            // echo json_encode(array($idproveedor,$idempresa,"hola"));
    
            // $idempresa = $this->getidempresa($empresa);
                // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                // $resultado = $consulta->fetch_assoc();
                // $totalRegistros = $resultado['total'];
    
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbp->query("DELETE FROM gastos_generales WHERE idgastos_generales = '$idgastos_generales'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_gastos_generales");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
        }
        
        public function registrar_detalle_gastos($monto, $tiempo, $gastos_generales_idgastos_generales){
            // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
            // echo json_encode($res);
            //  $idempresa = $this->getidempresa($empresa_idempresa);
            //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM gastos_generales WHERE codigo = '$codigo' AND empresa_idempresa='$idempresa'");
            //     $resultado = $consulta->fetch_assoc();
            //     $totalRegistros = $resultado['total'];
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroEstandar = $this->dbp->query("INSERT INTO detalle_gastos(monto, tiempo, gastos_generales_idgastos_generales) VALUES ('$monto', '$tiempo', '$gastos_generales_idgastos_generales')");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Registro exitoso","registrar_detalle_gastos");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
            public function listar_detalle_gastos($idgastos_generales){
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                $lista = [];
                $getPedido = $this->dbp->query("SELECT * FROM detalle_gastos 
                            WHERE gastos_generales_idgastos_generales='$idgastos_generales';");
                // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
                while($qwe=$this->dbp->fetch($getPedido)){
                     $res=array("iddetalle_gastos"=>$qwe['iddetalle_gastos'],
                     "monto"=>$qwe['monto'],
                     "tiempo"=>$qwe['tiempo'],
                     "gastos_generales_idgastos_generales"=>$qwe['gastos_generales_idgastos_generales']
                    ); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);
                 }
                  echo json_encode($lista);
            }
            public function editar_detalle_gastos($iddetalle_gastos,$monto, $tiempo) {
                // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
                // $idempresa = $this->getidempresa($empresa);
                // $idempresa = $this->getidempresa($empresa_idempresa);
                // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM gastos_generales WHERE codigo = '$codigo' AND idgastos_generales != '$idgastos_generales' AND empresa_idempresa='$idempresa'");
                // $resultado = $consulta->fetch_assoc();
                // $totalRegistros = $resultado['total'];
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroListaCompra = $this->dbp->query("UPDATE detalle_gastos
                                            SET monto = '$monto',
                                                tiempo = '$tiempo'
                                            WHERE iddetalle_gastos = '$iddetalle_gastos';");
                    if ($registroListaCompra === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edición exitosa","editar_detalle_gastos");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
    
            public function eliminar_detalle_gastos($idgastos_generales){
                // echo json_encode(array($idproveedor,$idempresa,"hola"));
        
                // $idempresa = $this->getidempresa($empresa);
                    // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                    // $resultado = $consulta->fetch_assoc();
                    // $totalRegistros = $resultado['total'];
        
                    if (0 > 0) {
                        $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                    } else {
                        // Insertar el nuevo registro
                        $eliminarL = $this->dbp->query("DELETE FROM gastos_generales WHERE idgastos_generales = '$idgastos_generales'");
                        if ($eliminarL === TRUE) {                                                                                                                                                    
                            $res = array("success", "se elimino exitosamente","eliminar_gastos_generales");
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