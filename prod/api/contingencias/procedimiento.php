<?php
require_once "../../db/db.php";
class Procedimiento extends DB{

    public function registrar_procedimiento($procedimientos) {
        //  echo json_encode(array($grupo_productos));
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
         foreach($procedimientos as $procedimiento){
            if($procedimiento['idprocedimiento'] < 0){
              $auxIdGrupo = abs($procedimiento['idprocedimiento']); 
              $eliminar = $this->dbp->query("DELETE FROM procedimiento WHERE idprocedimiento='$auxIdGrupo'");
            
            }elseif($procedimiento['idprocedimiento'] == 0){
        
                    $registrar = $this->dbp->query("INSERT INTO procedimiento(npaso, efectividad, instruccion, recurso_riesgo_idrecurso_riesgo, riesgo_idriesgo) VALUES ('$procedimiento[npaso]', '$procedimiento[efectividad]', '$procedimiento[instruccion]', '$procedimiento[recurso_riesgo_idrecurso_riesgo]', '$procedimiento[riesgo_idriesgo]')");

               
            }else{
                $editar = $this->dbp->query("UPDATE procedimiento 
                                        SET npaso='$procedimiento[npaso]',
                                            efectividad='$procedimiento[efectividad]',
                                            instruccion='$procedimiento[instruccion]'
                                         WHERE idprocedimiento='$procedimiento[idprocedimiento]'");
            }
            // else{
            //     $eliminar = $this->dbp->query("UPDATE grupo_productos SET  WHERE ");
            // }
         }
        //  if($registrar){
            $res = array("success", "Operaciones exitosas","registrar_procedimiento");
        //  }
        //  else{
        //     $res = array("success", "Elim exitoso","registrar_grupo_etapas_ordenados");
        //  }
        echo json_encode($res);
    } 

    public function listar_procedimiento($empresa) { //listado_maquina_etapas
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM riesgo 
             WHERE empresa_idempresa='$idempresa';");
    
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "idriesgo" => $etapa['idriesgo'],
                "codigo"=>$etapa['codigo'],
                 "descripcion"=>$etapa['descripcion'],
                 "probabilidad"=>$etapa['probabilidad'],
                 "impacto"=>$etapa['impacto'],
                 "tipo_variable"=>$etapa['tipo_variable'],
                 "idtipo_variable"=>$etapa['idtipo_variable'],
                 "procedimiento" => []
            );
            $getLista2 = $this->dbp->query("SELECT * FROM procedimiento WHERE riesgo_idriesgo ='$etapa[idriesgo]';
                        ");
            while ($qwe=$this->dbp->fetch($getLista2)) {
            $detalle = array(
                "idprocedimiento" => $qwe['idprocedimiento'],
                "npaso" => $qwe['npaso'],
                "efectividad" => $qwe['efectividad'],
                "instruccion" => $qwe['instruccion'],
                "recurso_riesgo_idrecurso_riesgo" => $qwe['recurso_riesgo_idrecurso_riesgo'],
                "riesgo_idriesgo" => $qwe['riesgo_idriesgo']
            );
            array_push($res['procedimiento'], $detalle);
        }
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
        public function listado_procedimiento($empresa){
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            $getPedido = $this->dbp->query("SELECT * FROM procedimiento p
            INNER JOIN riesgo r ON r.idriesgo = p.riesgo_idriesgo WHERE r.empresa_idempresa='$idempresa';");
            // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
            while($qwe=$this->dbp->fetch($getPedido)){
                 $res=array("idprocedimiento"=>$qwe['idprocedimiento'],
                 "efectividad"=>$qwe['efectividad'],
                 "recurso_riesgo_idrecurso_riesgo"=>$qwe['recurso_riesgo_idrecurso_riesgo'],
                 "riesgo_idriesgo"=>$qwe['riesgo_idriesgo']
                ); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
              echo json_encode($lista);
        }
        public function editar_procedimiento($idprocedimiento,$efectividad) {
            // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
            // $idempresa = $this->getidempresa($empresa);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroListaCompra = $this->dbp->query("UPDATE procedimiento
                                        SET efectividad = '$efectividad'
                                        WHERE idprocedimiento = '$idprocedimiento';");
                if ($registroListaCompra === TRUE) {                                                                                                                                                                
                    $res = array("success", "Edición exitosa","editar_procedimiento");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }

        public function eliminar_procedimiento($idprocedimiento){
            // echo json_encode(array($idproveedor,$idempresa,"hola"));
    
            // $idempresa = $this->getidempresa($empresa);
                // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
                // $resultado = $consulta->fetch_assoc();
                // $totalRegistros = $resultado['total'];
    
                if (0 > 0) {
                    $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
                } else {
                    // Insertar el nuevo registro
                    $eliminarL = $this->dbp->query("DELETE FROM procedimiento WHERE idprocedimiento = '$idprocedimiento'");
                    if ($eliminarL === TRUE) {                                                                                                                                                    
                        $res = array("success", "se elimino exitosamente","eliminar_procedimiento");
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