<?php
require_once "../../db/db.php";
class Modopago extends DB{
  
    public function registrar_modopago($nombre, $descripcion, $estado, $empresa_idempresa){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
          $idempresa = $this->getidempresa($empresa_idempresa);
            $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM modopago WHERE nombre = '$nombre' AND idempresa='$idempresa'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
            if ($totalRegistros > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroEstandar = $this->dbrh->query("INSERT INTO modopago(nombre, descripcion, estado, idempresa) VALUES ('$nombre', '$descripcion', '$estado', '$idempresa')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_modopago");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function editar_modopago($idmodopago,$nombre, $descripcion, $empresa_idempresa){
            // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
            // echo json_encode($res);
               $idempresa = $this->getidempresa($empresa_idempresa);
                $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM modopago WHERE nombre='$nombre' AND idmodopago != '$idmodopago' AND idempresa = '$idempresa'");
                $resultado = $consulta->fetch_assoc();
                $totalRegistros = $resultado['total'];
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
                if ($totalRegistros > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroEstandar = $this->dbrh->query("UPDATE modopago
                    SET nombre = '$nombre', 
                    descripcion = '$descripcion'
                    WHERE idmodopago = '$idmodopago'");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Edicion exitosa","editar_modopago");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
            
            public function editar_estado_modopago($idmodopago,$estado){
                ini_set('display_errors', 1);
                ini_set('display_startup_errors', 1);
                error_reporting(E_ALL);
                    if (0 > 0) {
                        $res = array("danger", "El registro ya existe");
                    } else {
                        // Insertar el nuevo registro
                        $registroEstandar = $this->dbrh->query("UPDATE modopago
                        SET estado = '$estado'
                        WHERE idmodopago = '$idmodopago'");
                        if ($registroEstandar === TRUE) {                                                                                                                                                                
                            $res = array("success", "Edicion exitosa","editar_estado_modopago");
                        } else {
                            $res = array("danger", "No se pudo registrar");
                        }
                    }
                    echo json_encode($res);
                }
            public function listar_modopago($empresa){
                $lista = [];
                $idempresa = $this->getidempresa($empresa);
                $getPedido = $this->dbrh->query("SELECT * FROM modopago
                WHERE idempresa='$idempresa';
                ");
             
                while($qwe=$this->dbrh->fetch($getPedido)){
                     $res=array("idmodopago"=>$qwe[0],"nombre"=>$qwe[1],"descripcion"=>$qwe[2],"fecha"=>$qwe[3]); //'nombre' sale del formulario de input hidden
                    array_push($lista,$res);                                      
                 }
                  echo json_encode($lista);
            }
            public function eliminar_modopago($idmodopago){
  
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_modopago");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbrh->query("DELETE FROM modopago WHERE idmodopago = '$idmodopago'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_modopago");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
        }

    public function getUsuario($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getPedido = $this->dbrh->query("SELECT u.idusuario,u.nombre ,u.trabajador_idtrabajador FROM usuario u");
       
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"idtrabajador"=>$qwe[2]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }  
    public function getidsucursal($md5){
        $registro=$this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }  
    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];
    }  
}


?>