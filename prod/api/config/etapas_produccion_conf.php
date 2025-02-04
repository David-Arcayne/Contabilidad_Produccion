<?php
require_once "../../db/db.php";
class Etapas_produccion_conf extends DB{
      
    public function registrar_etapa_produccion($nombre_etapa, $detalle, $rubro_idrubro, $seccion_idseccion, $empresa) {
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);
        // Verificar si ya existe una etapa de producción con el mismo nombre para la misma empresa
        $consulta = $this->dbp->query("SELECT COUNT(*) AS count FROM etapas_produccion WHERE empresa_idempresa = '$idempresa' AND nombre_etapa = '$nombre_etapa' AND rubro_idrubro='$rubro_idrubro'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['count'];
        // Si ya existe una etapa con el mismo nombre para la empresa, se envía un mensaje de error
        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe");
        } else {
            // Insertar el nuevo registro                                                                                                                                                                                                                   ('$lote','$cantidad','$contenido','$precioUni','$fechaVenci','$compraIdcompraaaaaa','$material','$proveedor','$tipoenvase','$medida')
            $registrarEtapa = $this->dbp->query("INSERT INTO etapas_produccion(nombre_etapa, detalle, rubro_idrubro, seccion_idseccion, empresa_idempresa) VALUES ('$nombre_etapa','$detalle','$rubro_idrubro','$seccion_idseccion','$idempresa')");
            if ($registrarEtapa === TRUE) {                                                                                                                                                                                                      
                $res = array("success", "Registro exitoso", "registrar_etapa_produccion");
            } else {
                $res = array("danger", "No se pudo registrar",$nombre_etapa, $detalle, $rubro_idrubro, $seccion_idseccion, $empresa);
            }
        }
        echo json_encode($res);
    }

    public function editar_etapa_produccion($idetapas_produccion, $nombre_etapa, $detalle, $seccion_idseccion, $empresa) {
    // Verificar si ya existe una etapa de producción con el mismo nombre pero con un ID diferente
    
    try {
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);

        // Verificar si ya existe una etapa de producción con el mismo nombre pero con un ID diferente
       
        $consulta = $this->dbp->query("SELECT COUNT(*) AS count FROM etapas_produccion WHERE nombre_etapa = '$nombre_etapa' AND idetapas_produccion != '$idetapas_produccion' AND empresa_idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['count'];

        // Verificar si hay registros relacionados en etapa_orden
        // $relacionadas = [
        //     'etapa_orden' => 'No se puede editar porque hay registros en etapa_orden',
        //     // 'detalle_produccion' => 'No se puede editar porque hay registros en detalle_produccion',
        //     // 'reproceso' => 'No se puede editar porque hay registros en reprocesamiento',
        // ];

        // foreach ($relacionadas as $tabla => $mensaje) {
        //     $query = "SELECT 1 FROM $tabla WHERE etapas_produccion_idetapas_produccion = ? LIMIT 1";
        //     $stmt = $this->dbp->prepare($query);
        //     if ($stmt === false) {
        //         throw new Exception("No se pudo preparar la consulta para verificar $tabla");
        //     }
        //     $stmt->bind_param("i", $idetapas_produccion);
        //     $stmt->execute();
        //     $result = $stmt->get_result();
        //     $etapaOrdenExiste = $result->num_rows > 0;
        //     $stmt->close();

        //     if ($etapaOrdenExiste) {

        //         $getLista = $this->dbp->query("SELECT * FROM etapas_produccion WHERE idetapas_produccion='$idetapas_produccion';");
        //             $etapa=$this->dbp->fetch($getLista);
        //             if($etapa['nombre_etapa'] != $nombre_etapa || $etapa['detalle'] != $detalle || $etapa['seccion_idseccion'] != $seccion_idseccion){
        //                 $editar = $this->dbp->query("UPDATE etapas_produccion SET nombre_etapa = '$nombre_etapa', detalle = '$detalle', seccion_idseccion = '$seccion_idseccion' WHERE idetapas_produccion = '$idetapas_produccion'");
        //                 $res = array("success", "Se guardaron los cambios correctamente", "editar_etapa_produccion");
        //             }else{
        //                 // $res = $mensaje;
        //                 throw new Exception($mensaje);
        //             }
        //     }
        // }
        
        // Si ya existe una etapa de producción con el mismo nombre para la empresa, se envía un mensaje de error
        if ($totalRegistros > 0) {
            $res = array("danger", "Ya existe una etapa de producción con el mismo nombre", "editar_etapa_produccion");
        } else {
            // Si no existe, proceder con la actualización
            $editar = $this->dbp->query("UPDATE etapas_produccion SET nombre_etapa = '$nombre_etapa', detalle = '$detalle', seccion_idseccion = '$seccion_idseccion' WHERE idetapas_produccion = '$idetapas_produccion'");

            if ($editar) {
                $res = array("success", "Se guardaron los cambios correctamente", "editar_etapa_produccion");
            } else {
                $res = array("danger", "No se pudieron guardar los cambios correctamente", "editar_etapa_produccion");
            }
        }
    } catch (Exception $e) {
        $res = array("danger", $e->getMessage(), "editar_etapa_produccion");
    }

    echo json_encode($res);
}

    public function listar_etapas_produccion($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        
        // Consulta para listar las etapas de producción asociadas a una empresa
        $getLista = $this->dbp->query("SELECT * FROM etapas_produccion WHERE empresa_idempresa = '$idempresa' ORDER BY idetapas_produccion DESC");
    
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa=$this->dbp->fetch($getLista)) {
            $res = array(
                "idetapas_produccion" => $etapa['idetapas_produccion'],
                "nombre_etapa" => $etapa['nombre_etapa'],
                "detalle" => $etapa['detalle'],
                "rubro_idrubro" => $etapa['rubro_idrubro'],
                "seccion_idseccion" => $etapa['seccion_idseccion'],
                "empresa_idempresa" => $etapa['empresa_idempresa']
            );
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    
    public function eliminar_etapa_produccion($id) {
        $this->dbp->begin_transaction();
        
        try {
            $relacionadas = [
                'produccion_etapa' => 'No se puede eliminar porque hay registros en producción',
            ];
            
            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE etapas_produccion_idetapas_produccion = ?";
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje);
                }
                $stmt->close();
            }
    
            $query = "DELETE FROM etapas_produccion WHERE idetapas_produccion = ?";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar la etapa de producción");
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();
            
            $this->dbp->commit();
            $res = array("success", "Se eliminó correctamente", "eliminar_etapa_produccion");
            
        } catch (Exception $e) {
            $this->dbp->rollback();
            $res = array("danger", $e->getMessage(), "eliminar_etapa_produccion");
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