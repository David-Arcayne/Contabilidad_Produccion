<?php
require_once "../../db/db.php";
class ControlCalidad extends DB{
     //  fecha_cc	hora_cc	num_doc	Entidad_tipo	Entidad_id	empresa_idempresa	empleado_idempleado	
 
        public function registrarControlCalidad($fecha_cc,$hora_cc, $num_doc,$Entidad_tipo,$Entidad_id,$empresa_idempresa,$empleado_idempleado) {

            $idempresa = $this->getidempresa($empresa_idempresa);
            $idusuario = $this->getidTrabajador($empleado_idempleado);

            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc' AND empresa_idempresa='$idempresa'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];

            if ($totalRegistros > 0) {
                $res = array("danger", "El numero_documento ya existe");
            }else{
               $registroCompra = $this->dbp->query("INSERT INTO control_calidad(fecha_cc,hora_cc, num_doc,Entidad_tipo,Entidad_id,estado,empresa_idempresa,empleado_idempleado) VALUES ('$fecha_cc','$hora_cc', '$num_doc','$Entidad_tipo','$Entidad_id',0,'$idempresa','$idusuario')");

        
                if ($registroCompra === TRUE) {
                    $id = $this->dbp->insert_id;  
                    if($Entidad_tipo == "L_Prod"){
                        $this->dbp->query("UPDATE lote SET estado = '2' WHERE idlote = '$Entidad_id'");
                    }else{
                        $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    }
                    // $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso","registrarControlCalidad",$id);
                } else {
                    $res = array("danger", "No se pudo registrar",$fecha_cc,$hora_cc, $num_doc,$Entidad_tipo,$Entidad_id,$empresa_idempresa,$empleado_idempleado);
                }
            }
            echo json_encode($res);
        }
        public function registrarDetalleControlCalidad($cantidad, $entidad_tipo,$entidad_id,$control_calidad_idcontrol_calidad) {

            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];

            if (0 > 0) {
                $res = array("danger", "El numero_documento ya existe");
            }else{
               $registroControl = $this->dbp->query("INSERT INTO detalle_control_calidad(cantidad, entidad_tipo,entidad_id,control_calidad_idcontrol_calidad) VALUES ('$cantidad', '$entidad_tipo','$entidad_id','$control_calidad_idcontrol_calidad')");

        
                if ($registroControl === TRUE) {
                    // $id = $this->dbp->insert_id;  

                    // $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar",$cantidad, $entidad_tipo,$entidad_id,$control_calidad_idcontrol_calidad);
                }
            }
            echo json_encode($res);
        }
        public function listadoDetalleControlCalidad($empresa, $idcontrolCalidad){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT *
            FROM detalle_control_calidad AS d
            INNER JOIN control_calidad AS c ON d.control_calidad_idcontrol_calidad = c.idcontrol_calidad
              WHERE c.empresa_idempresa = '$idempresa' ORDER BY iddetalle_control_calidad DESC");
            while($qwe=$this->dbp->fetch($getLista)){
                 $res=array(
                    "iddetalle_control_calidad"=>$qwe['iddetalle_control_calidad'],
                    "cantidad"=>$qwe['cantidad'],
                    "entidad_tipo"=>$qwe['entidad_tipo'],
                    "entidad_id"=>$qwe['entidad_id'],
                    "estado"=>$qwe['estado'],
                    "control_calidad_idcontrol_calidad"=>$qwe['control_calidad_idcontrol_calidad']); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
             echo json_encode($lista,JSON_NUMERIC_CHECK);
        }
        public function listadoControlCalidad($empresa){
            // echo json_encode(array($empresa,$idRegistro));
            // $lista = [];
            // $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT e.idcontrol_calidad,e.fecha_cc,e.hora_cc,e.num_doc,e.Entidad_tipo,e.Entidad_id,e.estado,e.empleado_idempleado FROM control_calidad e WHERE empresa_idempresa = '$idempresa' ORDER BY e.idcontrol_calidad DESC");
            //  while($qwe=$this->dbp->fetch($getLista)){
            //      $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"num_docu"=>$qwe[3],"entidadTipo"=>$qwe[4],"entidadId"=>$qwe[5],"estado"=>$qwe[6],"empleado"=>$qwe[7]); //'nombre' sale del formulario de input hidden
            //     array_push($lista,$res);
            //  }
            //  echo json_encode($lista);

            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            
            // Consulta para listar las etapas de producción asociadas a una empresa
            $getLista = $this->dbp->query("SELECT * FROM control_calidad WHERE empresa_idempresa = '$idempresa' ORDER BY idcontrol_calidad DESC;");
        
            // Recorrer los resultados y agregarlos a la lista
            while ($etapa=$this->dbp->fetch($getLista)) {
                $res = array(
                    "idcontrol_calidad" => $etapa['idcontrol_calidad'],
                    "fecha_cc" => $etapa['fecha_cc'],
                    "hora_cc" => $etapa['hora_cc'],
                    "num_doc" => $etapa['num_doc'],
                    "Entidad_tipo" => $etapa['Entidad_tipo'],
                    "Entidad_id" => $etapa['Entidad_id'],
                    "estado" => $etapa['estado'],
                    "empresa_idempresa" => $etapa['empresa_idempresa'],
                    "empleado_idempleado" => $etapa['empleado_idempleado'],
                    "detalle" => []
                );
                $getLista2 = $this->dbp->query("SELECT * 
                            FROM detalle_control_calidad
                            WHERE control_calidad_idcontrol_calidad = '$etapa[idcontrol_calidad]';
                            ");
                while ($qwe=$this->dbp->fetch($getLista2)) {
                $detalle = array(
                    "iddetalle_control_calidad" => $qwe['iddetalle_control_calidad'],
                    "cantidad" => $qwe['cantidad'],
                    "entidad_tipo" => $qwe['entidad_tipo'],
                    "entidad_id" => $qwe['entidad_id'],
                    "estado" => $qwe['estado'],
                    "control_calidad_idcontrol_calidad" => $qwe['control_calidad_idcontrol_calidad']
                );
                array_push($res['detalle'], $detalle);
            }
                array_push($lista, $res);
            }
            echo json_encode($lista);
        }
        public function registrar_evaluacion_caracteristicas($evaluacion,$detalle, $idcaracteristicas,$idcriterio_cc) {

            // $idempresa = $this->getidempresa($empresa_idempresa);
            // $idusuario = $this->getidTrabajador($empleado_idempleado);

            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];

            if (0 > 0) {
                $res = array("danger", "El numero_documento ya existe");
            }else{
               $registroCompra = $this->dbp->query("INSERT INTO evaluacion_caracteristica(evaluacion,detalle,caracteristicas_idcaracteristicas,criterio_control_calidad_idcriterio_control_calidad) VALUES ('$evaluacion','$detalle','$idcaracteristicas','$idcriterio_cc')");

        
                if ($registroCompra === TRUE) {
                    $id = $this->dbp->insert_id;  

                    // $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso");
                } else {
                    $res = array("danger", "No se pudo registrar",$evaluacion,$detalle, $idcaracteristicas,$idcriterio_cc);
                }
            }
            echo json_encode($res);
        }
        public function registrar_criterio_controlCalidad($calificacion,$observaciones, $peso_bruto,$peso_envase,$peso_neto, $cantidad,$destino,$idDetalle_controlCalidad) {

            // $idempresa = $this->getidempresa($empresa_idempresa);
            // $idusuario = $this->getidTrabajador($empleado_idempleado);

            // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
            // $resultado = $consulta->fetch_assoc();
            // $totalRegistros = $resultado['total'];
            $consulta = $this->dbp->query("SELECT  dt.cantidad 
                                            FROM detalle_control_calidad dt 
                                            WHERE dt.iddetalle_control_calidad = '$idDetalle_controlCalidad';
                                            ");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['cantidad'];
            $nuevaCantidad = $totalRegistros - $cantidad;
            if ($cantidad > $totalRegistros) {
                $res = array("danger", "La Cantidad ingresada sobre pasa el limite");
            }else{
               $registroCompra = $this->dbp->query("INSERT INTO criterio_control_calidad(calificacion,observaciones, peso_bruto,peso_envase,peso_neto, cantidad,destino,detalle_control_calidad_iddetalle_control_calidad) VALUES ('$calificacion','$observaciones', '$peso_bruto','$peso_envase','$peso_neto', '$cantidad','$destino','$idDetalle_controlCalidad')");

                if ($registroCompra === TRUE) {
                    $id = $this->dbp->insert_id;  
                    // Actualizar la tabla "detalle_pedido" con el ID del pedido
                    $this->dbp->query("UPDATE detalle_control_calidad SET cantidad = $nuevaCantidad WHERE iddetalle_control_calidad = '$idDetalle_controlCalidad'");

                    // $this->dbp->query("UPDATE compra SET estado = '1' WHERE idcompra = '$Entidad_id'");
                    $res = array("success", "Registro exitoso","registrar_criterio_controlCalidad",$id);
                } else {
                    $res = array("danger", "No se pudo registrar",$calificacion,$observaciones, $peso_bruto,$peso_envase,$peso_neto, $cantidad,$idDetalle_controlCalidad);
                }
            }
            echo json_encode($res);
        }

        public function listadoEvaluacionCaracteristicas($empresa){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT e.* FROM evaluacion_caracteristica AS e
                INNER JOIN caracteristicas AS c ON c.idcaracteristicas = e.caracteristicas_idcaracteristicas
                WHERE empresa_idempresa = '$idempresa' ORDER BY e.idevaluacion_caracteristica DESC;");
            while($qwe=$this->dbp->fetch($getLista)){
                 $res=array("idevaluacion_caracteristica"=>$qwe['idevaluacion_caracteristica'],"evaluacion"=>$qwe['evaluacion'],"detalle"=>$qwe['detalle'],"caracteristicas_idcaracteristicas"=>$qwe['caracteristicas_idcaracteristicas'],"criterio_control_calidad_idcriterio_control_calidad"=>$qwe['criterio_control_calidad_idcriterio_control_calidad']); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
             echo json_encode($lista,JSON_NUMERIC_CHECK);
        }

        public function listadoCriterio($empresa){
            // echo json_encode(array($empresa,$idRegistro));
            $lista = [];
            $idempresa = $this->getidempresa($empresa);
            // $getLista = $this->dbp->query("SELECT  e.iddetalle_control_calidad,e.cantidad,e.entidad_tipo,e.entidad_id,e.control_calidad_idcontrol_calidad FROM detalle_control_calidad as e WHERE compra_idcompra = '$idcontrolCalidad'");
            $getLista = $this->dbp->query("SELECT DISTINCT cr.*
                    FROM criterio_control_calidad AS cr
                    INNER JOIN evaluacion_caracteristica AS e ON e.criterio_control_calidad_idcriterio_control_calidad = cr.idcriterio_control_calidad
                    INNER JOIN caracteristicas AS c ON c.idcaracteristicas = e.caracteristicas_idcaracteristicas
                    WHERE empresa_idempresa = '$idempresa' ORDER BY cr.idcriterio_control_calidad DESC;");
            while($qwe=$this->dbp->fetch($getLista)){
                 $res=array("idcriterio_control_calidad"=>$qwe['idcriterio_control_calidad'],"calificacion"=>$qwe['calificacion'],"observaciones"=>$qwe['observaciones'],"peso_bruto"=>$qwe['peso_bruto'],"peso_envase"=>$qwe['peso_envase'],"peso_neto"=>$qwe['peso_neto'],"cantidad"=>$qwe['cantidad'],"destino"=>$qwe['destino'],"detalle_control_calidad_iddetalle_control_calidad"=>$qwe['detalle_control_calidad_iddetalle_control_calidad']); //'nombre' sale del formulario de input hidden
                array_push($lista,$res);
             }
             echo json_encode($lista, JSON_NUMERIC_CHECK);
        }
        public function listadoOjitoControlCalidad($idControlCalidad) {
            $lista2 = [];
        
            // Consulta inicial para obtener los detalles de control de calidad
            $getLista = $this->dbp->query("SELECT * FROM detalle_control_calidad WHERE control_calidad_idcontrol_calidad = '$idControlCalidad';");
            $idsDetalleCC = []; //24,25,26
        
            if ($getLista->num_rows > 0) {
                while ($row = $getLista->fetch_assoc()) {
                    $idsDetalleCC[] = $row["iddetalle_control_calidad"];
                }
            } else {
                echo json_encode(["error" => "No se encontraron resultados en detalle_control_calidad"]);
                return; // Termina la función si no hay resultados
            }
        
            $hayResultados = false; // Flag para verificar si se obtuvieron resultados válidos
            $dtCompra = $this->dbp->query("SELECT * FROM detalle_compra dt
            INNER JOIN compra co ON co.idcompra = dt.compra_idcompra
            INNER JOIN control_calidad cc ON cc.Entidad_id = co.idcompra 
            WHERE cc.idcontrol_calidad = '$idControlCalidad';");

        $idsDetalleCompra = []; //197,198,199
        $i = 0;

        if ($dtCompra->num_rows > 0) {
            while ($row = $dtCompra->fetch_assoc()) {
                $idsDetalleCompra[] = $row["iddetalle_compra"];
            }
        } 
        
            foreach ($idsDetalleCC as $idDetalle) {//24
               
                    $idDetalleCompra = $idsDetalleCompra[$i]; //197
                $lista = [];
                $getLista2 = $this->dbp->query("SELECT * FROM criterio_control_calidad WHERE detalle_control_calidad_iddetalle_control_calidad = '$idDetalle';");
                $idsCriterio = []; //65,72  --> idDetalleCC 24
        
                if ($getLista2->num_rows > 0) {
                    while ($row = $getLista2->fetch_assoc()) {
                        $idsCriterio[] = $row["idcriterio_control_calidad"];
                    }
                } 
        
                foreach ($idsCriterio as $idCriterio) { //idCriterio = 65  , idDetalleCompra =197
                    $lista0 = [];
                    $getLista3 = $this->dbp->query("SELECT e.*, c.tipo,m.nombre_mat, dt.iddetalle_control_calidad, m.idmaterial, dtc.iddetalle_compra FROM evaluacion_caracteristica e 
                        INNER JOIN caracteristicas c ON e.caracteristicas_idcaracteristicas = c.idcaracteristicas 
                        INNER JOIN criterio_control_calidad cr ON cr.idcriterio_control_calidad = e.criterio_control_calidad_idcriterio_control_calidad
                        INNER JOIN detalle_control_calidad dt ON dt.iddetalle_control_calidad = cr.detalle_control_calidad_iddetalle_control_calidad 
                        INNER JOIN material m ON m.idmaterial = dt.entidad_id
                        INNER JOIN control_calidad cc ON cc.idcontrol_calidad = dt.control_calidad_idcontrol_calidad
                        INNER JOIN compra cp ON cp.idcompra = cc.Entidad_id
                        INNER JOIN detalle_compra dtc ON dtc.compra_idcompra= cp.idcompra
                        WHERE e.criterio_control_calidad_idcriterio_control_calidad ='$idCriterio' AND dtc.iddetalle_compra = '$idDetalleCompra'");
        
                    if ($getLista3->num_rows > 0) {
                        while ($qwe = $getLista3->fetch_assoc()) {
                            $res = [
                                "idevaluacion_caracteristica" => $qwe['idevaluacion_caracteristica'],
                                "evaluacion" => $qwe['evaluacion'],
                                "detalle" => $qwe['detalle'],
                                "caracteristicas_idcaracteristicas" => $qwe['caracteristicas_idcaracteristicas'],
                                "criterio_control_calidad_idcriterio_control_calidad" => $qwe['criterio_control_calidad_idcriterio_control_calidad'],
                                "tipo" => $qwe['tipo'],
                                "nombre_mat" => $qwe['nombre_mat'],
                                "idmaterial" => $qwe['idmaterial'],
                                "iddetalle_compra" => $qwe['iddetalle_compra'],
                                "iddetalle_control_calidad" => $qwe['iddetalle_control_calidad']
                            ];
                            $lista0[] = $res; // Usar el operador [] para añadir elementos
                        }
                    }
                
                    if (!empty($lista0)) {
                        $hayResultados = true; // Hay resultados válidos
                        $lista[] = $lista0; // Añadir lista0 solo si no está vacía
                    }
                    // $i++;
                }
                
                
                if (!empty($lista)) {
                    $lista2[] = $lista; // Añadir lista solo si no está vacía
                }
                $i++;
            }
        
            if ($hayResultados) {
                echo json_encode($lista2, JSON_NUMERIC_CHECK);
            } else {
                echo json_encode(["error" => "No se encontraron resultados válidos en evaluacion_caracteristica"]);
            }
        }
        
        public function listadoOjitoControlCalidadProduccion($idControlCalidad) {
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
            $lista2 = [];
        
            // Consulta inicial para obtener los detalles de control de calidad
            $getLista = $this->dbp->query("SELECT * FROM detalle_control_calidad WHERE control_calidad_idcontrol_calidad = '$idControlCalidad';");
            $idsDetalleCC = []; //24,25,26  5,6   ..11,12,13
        
            if ($getLista->num_rows > 0) {
                while ($row = $getLista->fetch_assoc()) {
                    $idsDetalleCC[] = $row["iddetalle_control_calidad"];
                }
            } else {
                echo json_encode(["error" => "No se encontraron resultados en detalle_control_calidad"]);
                return; // Termina la función si no hay resultados
            }
        
            $hayResultados = false; // Flag para verificar si se obtuvieron resultados válidos
            // $dtCompra = $this->dbp->query("SELECT * FROM detalle_produccion dt
            // INNER JOIN orden_produccion op ON op.idorden_produccion = dt.orden_produccion_idorden_produccion
            // INNER JOIN produccion p ON p.orden_produccion_idorden_produccion = op.idorden_produccion
            // inner join control_calidad cc on cc.Entidad_id = p.idproduccion
            // WHERE cc.idcontrol_calidad = '$idControlCalidad';");
            $dtCompra = $this->dbp->query("SELECT * FROM salida_produccion sp
            inner join produccion p on p.idproduccion = sp.produccion_idproduccion
            inner join control_calidad cc on cc.Entidad_id = p.lote_idlote
            WHERE cc.idcontrol_calidad = '$idControlCalidad';");

        $idsDetalleCompra = []; //197,198,199
        $i = 0;

        if ($dtCompra->num_rows > 0) {
            while ($row = $dtCompra->fetch_assoc()) {
                $idsDetalleCompra[] = $row["idsalida_produccion"];
            }
        } 
        
            foreach ($idsDetalleCC as $idDetalle) {//24
               
                    $idDetalleCompra = $idsDetalleCompra[$i]; //197
                $lista = [];
                $getLista2 = $this->dbp->query("SELECT * FROM criterio_control_calidad WHERE detalle_control_calidad_iddetalle_control_calidad = '$idDetalle';");
                $idsCriterio = []; //65,72  --> idDetalleCC 24
        
                if ($getLista2->num_rows > 0) {
                    while ($row = $getLista2->fetch_assoc()) {
                        $idsCriterio[] = $row["idcriterio_control_calidad"];
                    }
                } 
        
                foreach ($idsCriterio as $idCriterio) { //idCriterio = 65  , idDetalleCompra =197
                    $lista0 = [];
                   
                    // $getLista = $this->dbp->query("SELECT * FROM detalle_control_calidad WHERE control_calidad_idcontrol_calidad = '$idControlCalidad';");
                    // $idsDetalleCC = [];
                
                    // if ($getLista->num_rows > 0) {
                    //     while ($row = $getLista->fetch_assoc()) {
                    //         $idsDetalleCC[] = $row["iddetalle_control_calidad"];
                    //     }
                    // } 
                   
        
                    // if(){}
                    // Consulta para obtener evaluaciones de características
                    $getLista3 = $this->dbp->query("SELECT e.*, c.tipo, dt.iddetalle_control_calidad, pp.idproduct_comercial, dtc.idsalida_produccion FROM evaluacion_caracteristica e 
                        INNER JOIN caracteristicas c ON e.caracteristicas_idcaracteristicas = c.idcaracteristicas 
                        INNER JOIN criterio_control_calidad cr ON cr.idcriterio_control_calidad = e.criterio_control_calidad_idcriterio_control_calidad
                        INNER JOIN detalle_control_calidad dt ON dt.iddetalle_control_calidad = cr.detalle_control_calidad_iddetalle_control_calidad 
                        INNER JOIN producto pp ON pp.idproduct_comercial = dt.entidad_id
                        INNER JOIN control_calidad cc ON cc.idcontrol_calidad = dt.control_calidad_idcontrol_calidad
                        INNER JOIN produccion pd ON pd.idproduccion = cc.Entidad_id
                        INNER JOIN salida_produccion dtc ON dtc.produccion_idproduccion= pd.idproduccion
                        WHERE e.criterio_control_calidad_idcriterio_control_calidad ='$idCriterio' AND dtc.idsalida_produccion = '$idDetalleCompra'");
        
                    if ($getLista3->num_rows > 0) {
                        while ($qwe = $getLista3->fetch_assoc()) {
                            $res = [
                                "idevaluacion_caracteristica" => $qwe['idevaluacion_caracteristica'],
                                "evaluacion" => $qwe['evaluacion'],
                                "detalle" => $qwe['detalle'],
                                "caracteristicas_idcaracteristicas" => $qwe['caracteristicas_idcaracteristicas'],
                                "criterio_control_calidad_idcriterio_control_calidad" => $qwe['criterio_control_calidad_idcriterio_control_calidad'],
                                "tipo" => $qwe['tipo'],
         
                                "idproduct_comercial" => $qwe['idproduct_comercial'],
                                "idsalida_produccion" => $qwe['idsalida_produccion'],
                                "iddetalle_control_calidad" => $qwe['iddetalle_control_calidad']
                            ];
                            $lista0[] = $res; // Usar el operador [] para añadir elementos
                        }
                    }
                
                    if (!empty($lista0)) {
                        $hayResultados = true; // Hay resultados válidos
                        $lista[] = $lista0; // Añadir lista0 solo si no está vacía
                    }
                    // $i++;
                }
                
                
                if (!empty($lista)) {
                    $lista2[] = $lista; // Añadir lista solo si no está vacía
                }
                $i++;
            }
        
            if ($hayResultados) {
                echo json_encode($lista2, JSON_NUMERIC_CHECK);
            } else {
                echo json_encode(["error" => "No se encontraron resultados válidos en evaluacion_caracteristica"]);
            }
        }
    // $_POST['cantidad'],$_POST['costo_unitario'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['seccion_idseccion'],$_POST['compra_idcompra']
    public function registrarStockMateriaPrima($cantidad_envase,$peso_neto,$idtipo_envase,$cantidad,$costo_unitario,$costo_envase, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$compra_idcompra) {
    //cantidad_envases,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase.......    
        // echo json_encode(array($cantidad,$costo_unitario, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$seccion_idseccion,$compra_idcompra));
        $idempresa = $this->getidempresa($empresa_idempresa);
        // $idusuario = $this->getidTrabajador($empleado_idempleado);

        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM control_calidad WHERE num_doc = '$num_doc'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El numero_documento ya existe");
        }else{
           $registroCompra = $this->dbp->query("INSERT INTO almacen_material(cantidad_envases,peso_neto,tipo_envase_idtipo_envase,cantidad,costo_unitario,costo_envase, fecha_caducidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,proveedor_idproveedor,compra_idcompra) VALUES ('$cantidad_envase','$peso_neto','$idtipo_envase','$cantidad','$costo_unitario','$costo_envase', '$fecha_caducidad','$material_idmaterial','$idempresa','$control_calidad_idcontrol_calidad','$proveedor_idproveedor','$compra_idcompra')");
   
            if ($registroCompra === TRUE) {
                $id = $this->dbp->insert_id;  

                 $this->dbp->query("UPDATE control_calidad SET estado = '1' WHERE idcontrol_calidad = '$control_calidad_idcontrol_calidad'");
                $res = array("success", "Registro exitoso","registrarStockMateriaPrima",$id);
            } else {
                $res = array("danger", "No se pudo registrar",$cantidad,$costo_unitario, $fecha_caducidad,$material_idmaterial,$empresa_idempresa,$control_calidad_idcontrol_calidad,$proveedor_idproveedor,$seccion_idseccion,$compra_idcompra);
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