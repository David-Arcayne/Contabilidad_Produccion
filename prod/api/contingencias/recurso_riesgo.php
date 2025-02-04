<?php
require_once "../../db/db.php";
class Recurso_riesgo extends DB{

    public function registrar_recurso_riesgo($nombre_recurso, $codigo, $ubicacion, $empresa_idempresa){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
          $idempresa = $this->getidempresa($empresa_idempresa);
            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM recurso_riesgo WHERE codigo='$codigo' AND empresa_idempresa = '$idempresa'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
            if ($totalRegistros > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroEstandar = $this->dbp->query("INSERT INTO recurso_riesgo(nombre_recurso,codigo, ubicacion,empresa_idempresa) VALUES ('$nombre_recurso', '$codigo', '$ubicacion', '$idempresa')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_recurso_riesgo");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function listado_recurso_riesgo($empresa){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT * FROM recurso_riesgo WHERE empresa_idempresa='$idempresa';");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbp->fetch($getPedido)){
                 $res=array("idrecurso_riesgo"=>$qwe['idrecurso_riesgo'],
                 "nombre_recurso"=>$qwe['nombre_recurso'],
                 "codigo"=>$qwe['codigo'],
                 "ubicacion"=>$qwe['ubicacion']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }
        public function editar_recurso_riesgo($idrecurso_riesgo,$nombre_recurso,$codigo, $ubicacion, $empresa_idempresa) {
            // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
            $idempresa = $this->getidempresa($empresa_idempresa);
            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM recurso_riesgo WHERE codigo='$codigo' AND idrecurso_riesgo !='$idrecurso_riesgo' AND empresa_idempresa = '$idempresa'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
            if ($totalRegistros > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE recurso_riesgo
                                        SET nombre_recurso = '$nombre_recurso',
                                            codigo = '$codigo',
                                            ubicacion = '$ubicacion'
                                        WHERE idrecurso_riesgo = '$idrecurso_riesgo';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","editar_recurso_riesgo");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }

        public function eliminar_recurso_riesgo($idrecurso_riesgo){
            // echo json_encode(array($idproveedor,$idempresa,"hola"));
    
            // $idempresa = $this->getidempresa($empresa);
                // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                // $resultado = $consulta->fetch_assoc();
                // $totalRegistros = $resultado['total'];
            
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbp->query("DELETE FROM recurso_riesgo WHERE idrecurso_riesgo = '$idrecurso_riesgo'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_recurso_riesgo");
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