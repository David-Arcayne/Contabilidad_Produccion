<?php
require_once "../../db/db.php";
class EdicionCC extends DB{
     //  fecha_cc	hora_cc	num_doc	Entidad_tipo	Entidad_id	empresa_idempresa	empleado_idempleado	
    //  public function eliminar_criterio($idcriterio){
    //     //  echo json_encode(array($idpedido,$empresa));
    //     // $idempresa = $this->getidempresa($empresa);
    //     $consulta3 = $this->dbp->query("SELECT cantidad FROM criterio_control_calidad WHERE idcriterio_control_calidad = '$idcriterio';
    //     ");
    //      $resultado3 = $consulta3->fetch_assoc();
    //      $cantidadCriterio = $resultado3['cantidad'];

    //     $consulta = $this->dbp->query("SELECT detalle_control_calidad_iddetalle_control_calidad FROM criterio_control_calidad
    //     where idcriterio_control_calidad = '$idcriterio';");
    //     $resultado = $consulta->fetch_assoc();
    //     $idDetalleCC = $resultado['detalle_control_calidad_iddetalle_control_calidad'];

    //     $deleteEvaluaciones = $this->dbp->query("DELETE FROM evaluacion_caracteristica WHERE criterio_control_calidad_idcriterio_control_calidad = '$idcriterio'");
      
    //     $delete = $this->dbp->query("DELETE FROM criterio_control_calidad WHERE idcriterio_control_calidad = '$idcriterio'");
    //     if($delete===TRUE && $deleteEvaluaciones===TRUE){

    //         $consulta2 = $this->dbp->query("SELECT DISTINCT dt.cantidad 
    //         FROM detalle_control_calidad dt 
    //         INNER JOIN criterio_control_calidad cr 
    //         ON cr.detalle_control_calidad_iddetalle_control_calidad = dt.iddetalle_control_calidad
    //         WHERE dt.iddetalle_control_calidad = '$idDetalleCC';
    //         ");
    //         $resultado2 = $consulta2->fetch_assoc();
    //         $cantidadDetalleCC = $resultado2['cantidad'];
    //         $nuevaCantidad = $cantidadDetalleCC + $cantidadCriterio;

    //         $edicionDetalleCC = $this->dbp->query("UPDATE detalle_control_calidad SET cantidad = $nuevaCantidad WHERE iddetalle_control_calidad = '$idDetalleCC'");
    //         if($edicionDetalleCC === TRUE){
    //             $res=array("ok","Se elimino correctamente", $nuevaCantidad,$cantidadDetalleCC,$cantidadCriterio);
    //         }else{
    //             $res=array("Error","No se esta Actualizando la Cantidad", $nuevaCantidad,$cantidadDetalleCC,$cantidadCriterio);
    //         }
    //     }else{
    //         $res=array("Error","No se pudo eliminar");
    //     }
    //     // echo($idpedido);
    //     echo json_encode($res);
    // }

    public function eliminar_criterio($idcriterio){
        $consulta = $this->dbp->query("SELECT detalle_control_calidad_iddetalle_control_calidad FROM criterio_control_calidad WHERE idcriterio_control_calidad = '$idcriterio';");
        $resultado = $consulta->fetch_assoc();
        $idDetalleCC = $resultado['detalle_control_calidad_iddetalle_control_calidad'];
    
        $consulta3 = $this->dbp->query("SELECT cantidad FROM criterio_control_calidad WHERE idcriterio_control_calidad = '$idcriterio';");
        $resultado3 = $consulta3->fetch_assoc();
        $cantidadCriterio = $resultado3['cantidad'];
    
        $consulta2 = $this->dbp->query("SELECT DISTINCT dt.cantidad 
        FROM detalle_control_calidad dt 
        INNER JOIN criterio_control_calidad cr 
        ON cr.detalle_control_calidad_iddetalle_control_calidad = dt.iddetalle_control_calidad
        WHERE dt.iddetalle_control_calidad = '$idDetalleCC';
        ");
        $resultado2 = $consulta2->fetch_assoc();
        $cantidadDetalleCC = $resultado2['cantidad'];
    
        $deleteEvaluaciones = $this->dbp->query("DELETE FROM evaluacion_caracteristica WHERE criterio_control_calidad_idcriterio_control_calidad = '$idcriterio'");
        $delete = $this->dbp->query("DELETE FROM criterio_control_calidad WHERE idcriterio_control_calidad = '$idcriterio'");
    
        if($delete === TRUE && $deleteEvaluaciones === TRUE){
            $nuevaCantidad = $cantidadDetalleCC + $cantidadCriterio;
            $edicionDetalleCC = $this->dbp->query("UPDATE detalle_control_calidad SET cantidad = $nuevaCantidad WHERE iddetalle_control_calidad = '$idDetalleCC'");
            if($edicionDetalleCC === TRUE){
                            $res=array("success","Se elimino correctamente", $nuevaCantidad,$cantidadDetalleCC,$cantidadCriterio);
                        }else{
                            $res=array("danger","No se esta Actualizando la Cantidad", $nuevaCantidad,$cantidadDetalleCC,$cantidadCriterio);
                        }
        }
        echo json_encode($res);
    }
    
        public function getidempresa($md5){
            $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
            $qwe=$this->dbe->fetch($registro);
            return $qwe['idorganizacion'];
        }  
        public function getidTrabajador($md5){
            $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
            $qwe=$this->dbrh->fetch($registro);
            return $qwe['trabajador_idtrabajador'];
        }  
    }

?>