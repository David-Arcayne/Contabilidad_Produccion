<?php
require_once "../../db/db.php";
class UsoMaquina extends DB{

    public function registrar_uso_maquina_produccion($fecha_ini, $hora_ini,$observaciones,$fecha_fin,$hora_fin,$idmaquina, $idproduccionEtapa){
        // $idempleado = $this->getidTrabajador($empleado);
        // Verificar si ya existe una etapa de producción con el mismo nombre para la misma empresa
  
        $consulta = $this->dbp->query("SELECT COUNT(*) AS count FROM uso_maquina 
        WHERE maquina_idmaquina = '$idmaquina' AND produccion_etapa_idproduccion_etapa = '$idproduccionEtapa';");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['count'];
        // Si ya existe una etapa con el mismo nombre para la empresa, se envía un mensaje de error
           
        if($totalRegistros > 0){
                $res = array("danger", "Ya existe un produccion etapa en esa maquina","registrar_uso_maquina_produccion");
            }else{

                    $operacionesEtapas = $this->dbp->query("INSERT INTO uso_maquina(fecha_ini,hora_ini,observaciones,fecha_fin,hora_fin,estado,maquina_idmaquina,produccion_etapa_idproduccion_etapa) 
                            VALUES ('$fecha_ini','$hora_ini','$observaciones','$fecha_fin','$hora_fin','0','$idmaquina','$idproduccionEtapa')");

                    if($operacionesEtapas){
                        $res = array("success", "Registrp exitoso","registrar_uso_maquina_produccion");
                    }else{
                        $res = array("danger", "No se pudo registrar","registrar_uso_maquina_produccion");
                    }
                }

        echo json_encode($res);
    } 
    public function Editar_uso_maquina_produccion($idusoMaq,$fecha_fin,$hora_fin,$observaciones) {

                    $operacionesEtapas = $this->dbp->query("UPDATE 	uso_maquina SET fecha_fin='$fecha_fin',hora_fin='$hora_fin',observaciones='$observaciones',estado='1'
                                                            WHERE iduso_maquina='$idusoMaq';");

                    if($operacionesEtapas){
                        $res = array("success", "Edicion Exitosa","Editar_uso_maquina_produccion");
                    }else{
                        $res = array("danger", "No se pudo registrar","Editar_uso_maquina_produccion");
                    }   

        echo json_encode($res);
    } 
    public function listar_uso_maquina_produccion ($idproduccion){
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
        $getCompra = $this->dbp->query("SELECT * FROM uso_maquina 
        WHERE produccion_etapa_idproduccion_etapa = '$idproduccion' ORDER BY iduso_maquina DESC;");

        while($qwe=$this->dbp->fetch($getCompra)){
             $res=array("iduso_maquina"=>$qwe['iduso_maquina'],
             "fecha_ini"=>$qwe['fecha_ini'],
             "hora_ini"=>$qwe['hora_ini'],
             "observaciones"=>$qwe['observaciones'],
             "fecha_fin"=>$qwe['fecha_fin'],
             "hora_fin"=>$qwe['hora_fin'],
             "maquina_idmaquina"=>$qwe['maquina_idmaquina'],
             "produccion_etapa_idproduccion_etapa"=>$qwe['produccion_etapa_idproduccion_etapa']); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function eliminar_uso_maquina_produccion ($idprodEt) {

        $operacionesEtapas = $this->dbp->query("DELETE FROM uso_maquina WHERE iduso_maquina='$idprodEt';");

        if($operacionesEtapas){
            $res = array("success", "Eliminacion Exitosa","eliminar_uso_maquina_produccion ");
        }else{
            $res = array("danger", "No se pudo registrar","eliminar_uso_maquina_produccion ");
        }   

        echo json_encode($res);
} 
    public function getidTrabajador($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['trabajador_idtrabajador'];
    }  
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
}
?>