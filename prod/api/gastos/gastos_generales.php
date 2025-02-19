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
          
    public function registrar_otros_gastos($nombre, $detalle, $monto,$produccion_idproduccion){
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
                        $registroEstandar = $this->dbp->query("INSERT INTO otros_gastos(nombre, detalle, monto, produccion_idproduccion) VALUES ('$nombre', '$detalle', '$monto','$produccion_idproduccion')");
                        if ($registroEstandar === TRUE) {                                                                                                                                                                
                            $res = array("success", "Registro exitoso","registrar_otros_gastos");
                        } else {
                            $res = array("danger", "No se pudo registrar");
                        }
                    }
                    echo json_encode($res);
                }
                public function listar_otros_gastos($id_produccion){
                    ini_set('display_errors', 1);
                    ini_set('display_startup_errors', 1);
                    error_reporting(E_ALL);
                    $lista = [];
                    $getPedido = $this->dbp->query("SELECT * FROM otros_gastos 
                                WHERE produccion_idproduccion='$id_produccion';");
                    // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
                    while($qwe=$this->dbp->fetch($getPedido)){
                         $res=array("idotros_gastos"=>$qwe['idotros_gastos'],
                         "nombre"=>$qwe['nombre'],
                         "detalle"=>$qwe['detalle'],
                         "monto"=>$qwe['monto'],
                         "produccion_idproduccion"=>$qwe['produccion_idproduccion']
                        ); //'nombre' sale del formulario de input hidden
                        array_push($lista,$res);
                     }
                      echo json_encode($lista);
                }
                public function editar_otros_gastos($idotros_gastos,$nombre, $detalle,$idproduccion) {
                    // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
                    // $idempresa = $this->getidempresa($empresa);
                    // $idempresa = $this->getidempresa($empresa_idempresa);
                    $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM otros_gastos WHERE nombre = '$nombre' AND produccion_idproduccion = '$idproduccion' AND idotros_gastos!='$idotros_gastos'");
                    $resultado = $consulta->fetch_assoc();
                    $totalRegistros = $resultado['total'];
                    if ($totalRegistros > 0) {
                        $res = array("danger", "El registro ya existe");
                    } else {
                        // Insertar el nuevo registro
                        $registroListaCompra = $this->dbp->query("UPDATE otros_gastos
                                                SET nombre = '$nombre',
                                                    detalle = '$detalle'
                                                WHERE idotros_gastos = '$idotros_gastos';");
                        if ($registroListaCompra === TRUE) {                                                                                                                                                                
                            $res = array("success", "Edición exitosa","editar_otros_gastos");
                        } else {
                            $res = array("danger", "No se pudo registrar");
                        }
                    }
                    echo json_encode($res);
                }
        
                public function eliminar_otros_gastos($id){
                    // echo json_encode(array($idproveedor,$idempresa,"hola"));
            
                    // $idempresa = $this->getidempresa($empresa);
                        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                        // $resultado = $consulta->fetch_assoc();
                        // $totalRegistros = $resultado['total'];
            
                        if (0 > 0) {
                            $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                        } else {
                            // Insertar el nuevo registro
                            $eliminarL = $this->dbp->query("DELETE FROM otros_gastos WHERE idotros_gastos = '$id'");
                            if ($eliminarL === TRUE) {                                                                                                                                                    
                                $res = array("success", "se elimino exitosamente","eliminar_otros_gastos");
                            } else {
                                $res = array("danger", "No se pudo registrar");
                            }
                        }
                        echo json_encode($res);
                }

                public function registrar_detalle_gasto_general($monto, $tipo,$id_gg){

                    ini_set('display_errors', 1);
                    ini_set('display_startup_errors', 1);
                    error_reporting(E_ALL);
                        if (0 > 0) {
                            $res = array("danger", "El registro ya existe");
                        } else {
                            // Insertar el nuevo registro
                            $registroEstandar = $this->dbp->query("INSERT INTO detalle_gasto_general(monto,tipo,gastos_generales_idgastos_generales) VALUES ('$monto', '$tipo','$id_gg')");
                            if ($registroEstandar === TRUE) {                                                                                                                                                                
                                $res = array("success", "Registro exitoso","registrar_detalle_gasto_general");
                            } else {
                                $res = array("danger", "No se pudo registrar");
                            }
                        }
                        echo json_encode($res);
                    }
                    public function listar_detalle_gasto_general($id_gg){
                        ini_set('display_errors', 1);
                        ini_set('display_startup_errors', 1);
                        error_reporting(E_ALL);
                        $lista = [];
                        $getPedido = $this->dbp->query("SELECT * FROM detalle_gasto_general 
                                    WHERE gastos_generales_idgastos_generales='$id_gg';");
                        // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
                        while($qwe=$this->dbp->fetch($getPedido)){
                             $res=array("iddetalle_gasto_general"=>$qwe['iddetalle_gasto_general'],
                             "monto"=>$qwe['monto'],
                             "tipo"=>$qwe['tipo'],
                             "gastos_generales_idgastos_generales"=>$qwe['gastos_generales_idgastos_generales']
                            ); //'nombre' sale del formulario de input hidden
                            array_push($lista,$res);
                         }
                          echo json_encode($lista);
                    }
                    public function editar_detalle_gasto_general($id_dtgg,$monto, $tipo) {
            
                        if (0 > 0) {
                            $res = array("danger", "El registro ya existe");
                        } else {
                            // Insertar el nuevo registro
                            $registroListaCompra = $this->dbp->query("UPDATE detalle_gasto_general
                                                    SET monto = '$monto',
                                                        tipo = '$tipo'
                                                    WHERE iddetalle_gasto_general = '$id_dtgg';");
                            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                                $res = array("success", "Edición exitosa","editar_detalle_gasto_general");
                            } else {
                                $res = array("danger", "No se pudo registrar");
                            }
                        }
                        echo json_encode($res);
                    }
            
                    public function eliminar_detalle_gasto_general($id){
                        // echo json_encode(array($idproveedor,$idempresa,"hola"));
                
                        // $idempresa = $this->getidempresa($empresa);
                            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                            // $resultado = $consulta->fetch_assoc();
                            // $totalRegistros = $resultado['total'];
                
                            if (0 > 0) {
                                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                            } else {
                                // Insertar el nuevo registro
                                $eliminarL = $this->dbp->query("DELETE FROM detalle_gasto_general WHERE iddetalle_gasto_general = '$id'");
                                if ($eliminarL === TRUE) {                                                                                                                                                    
                                    $res = array("success", "se elimino exitosamente","eliminar_detalle_gasto_general");
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