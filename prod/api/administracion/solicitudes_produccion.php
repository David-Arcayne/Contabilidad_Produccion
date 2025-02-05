<?php
require_once "../../db/db.php";
class Solicitudes_produccion extends DB{
     //  fecha_cc	hora_cc	num_doc	Entidad_tipo	Entidad_id	empresa_idempresa	empleado_idempleado	
 
        public function listar_detalle_produccion($empresa){
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
        
            // Modificamos la consulta para que funcione con la tabla 'detalle_produccion'
            $query = "SELECT dp.iddetalle_produccion, dp.cantidad, dp.observaciones, dp.orden_produccion_idorden_produccion, dp.producto_idproducto
                      FROM detalle_produccion AS dp
                      INNER JOIN orden_produccion AS op ON dp.orden_produccion_idorden_produccion = op.idorden_produccion
                      WHERE op.empresa_idempresa = ?";
        
            $stmt = $this->dbp->prepare($query);
        
            if($stmt === false){
                echo json_encode(array("Error" , "No se pudo preparar la consulta", "listar_detalle_produccion"));
                return;
            }
        
            $stmt->bind_param("i", $idempresa);
            $stmt->execute();
            $result = $stmt->get_result();
        
            if($result === false){
                echo json_encode(array("Error", "Error al ejecutar la consulta", "listar_detalle_produccion"));
                return;
            }
        
            // Iterar sobre los resultados y agregarlos a la lista
            while ($detalle = $result->fetch_assoc()) {
                $res = array(
                    "iddetalle_produccion" => $detalle['iddetalle_produccion'],
                    "cantidad" => $detalle['cantidad'],
                    "observaciones" => $detalle['observaciones'],
                    "orden_produccion_idorden_produccion" => $detalle['orden_produccion_idorden_produccion'],
                    "producto_idproducto" => $detalle['producto_idproducto']
                );
                array_push($lista, $res);
            }
        
            $stmt->close();
            echo json_encode($lista);
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