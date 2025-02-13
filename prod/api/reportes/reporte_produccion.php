<?php
require_once "../../db/db.php";
class Reporte_produccion extends DB{
    // function sumar() { 
    //     // Sumar los dos números 
    //     $resultado = 22; 
    //     // Devolver el resultado como un entero 
    //     return (int)$resultado; 
    // }
    public function reporte_produccion($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa);  
        $lista = [];
        $lista_error =[];
        // $idempresa = $this->getidempresa($empresa); sumaHorasEtapa

         // Consulta para listar los gastos generales
         $gastosGen = $this->dbp->query("SELECT * FROM gastos_generales");
        $montoPromedio =0;
         while ($gastos_generales = $this->dbp->fetch($gastosGen)) {
            $monto =0;
            // $sumaHorasEtapa=0;
            $detalle_gastos = $this->dbp->query("SELECT monto FROM detalle_gastos 
            WHERE gastos_generales_idgastos_generales ='$gastos_generales[idgastos_generales]';"); 
             while ($dtgastos = $this->dbp->fetch($detalle_gastos)) {
                $monto = $monto + $dtgastos['monto'];
             }
             $montoPromedio = $montoPromedio + ($monto/12);
            //  $montoPromedio =
        //    $resultado2 = $detalle_gastos->fetch_assoc();
            
            // $resRegla3= (($costo['cantidad'] * $dt_produccion['cantidad'])/$cantProducto)*$aaa;
            // array_push($arrRegla3, $resRegla3);

            // $aiu =0;
            // foreach($arrRegla3 as $i){
            //     $aiu= $aiu+$i;
            // }
            // $res4['costo'] = $aiu;
            }
            $montoTotal = $montoPromedio / (24*30);
            // $montoTotal = $montoTotal * $sumaHorasEtapa;
        // Consulta para listar las etapas de producción asociadas a una empresa
        $lote = $this->dbp->query("SELECT * FROM lote WHERE empresa_idempresa = '$idempresa'");
    
        // Verificar que la consulta fue exitosa
        if (!$lote) {
            die("Error en la consulta: " . $this->dbp->error);
        }
    
        // Recorrer los resultados y agregarlos a la lista
        while ($etapa = $this->dbp->fetch($lote)) {
            $res = array(
                "idlote" => $etapa['idlote'],
                "fecha_lote" => $etapa['fecha_lote'],
                "hora_lote" => $etapa['hora_lote'],
                "lote" => $etapa['lote'],
                "estado" => $etapa['estado'],
                "fecha_entrega" => $etapa['fecha_entrega'],
                "hora_entrega" => $etapa['hora_entrega'],
                "rubro_idrubro" => $etapa['rubro_idrubro'],
                "empleado_idempleado" => $etapa['empleado_idempleado'],
                "gastos_generales" => 0,
                "produccion" => []
            );
    
            $aux1 = $this->dbp->query("SELECT * 
                                       FROM produccion                    
                                       WHERE lote_idlote = '{$etapa['idlote']}'");
    
            // Verificar que la consulta fue exitosa
            if (!$aux1) {
                die("Error en la consulta: " . $this->dbp->error);
            }
           
            while ($produccion = $this->dbp->fetch($aux1)) {
                $res2 = array(
                    "idproduccion" => $produccion['idproduccion'],
                    "estado" => $produccion['estado'],
                    "lote_idlote" => $produccion['lote_idlote'],
                    "orden_produccion" => [],
                    "produccion_etapa" => [],
                    "salida_produccion" => [],
                    "solicitud_material" => []
                );
    
                $aux2 = $this->dbp->query("SELECT * 
                                            FROM orden_produccion                    
                                            WHERE idorden_produccion = '{$produccion['orden_produccion_idorden_produccion']}'");
    
                // Verificar que la consulta fue exitosa
                if (!$aux2) {
                    die("Error en la consulta: " . $this->dbp->error);
                }
    
                while ($ordenProd = $this->dbp->fetch($aux2)) {
                    $res3 = array(
                        "idorden_produccion" => $ordenProd['idorden_produccion'],
                        "fecha_orp" => $ordenProd['fecha_orp'],
                        "hora_orp" => $ordenProd['hora_orp'],
                        "estado" => $ordenProd['estado'],
                        "empleado_idempleado" => $ordenProd['empleado_idempleado'],
                        "detalle_produccion" => []
                    );
                    // array_push($res2['orden_produccion'], $res3);
                    $aux3 = $this->dbp->query("SELECT * FROM detalle_produccion 
                            WHERE orden_produccion_idorden_produccion='{$ordenProd['idorden_produccion']}'"); 

                 // Verificar que la consulta fue exitosa
                 if (!$aux3) {
                    die("Error en la consulta: " . $this->dbp->error);
                }
                while ($dt_produccion = $this->dbp->fetch($aux3)) {
                    // $sumaaa = sumar();
                    $res4 = array(
                        "iddetalle_produccion" => $dt_produccion['iddetalle_produccion'],
                        "cantidad" => $dt_produccion['cantidad'],
                        "observaciones" => $dt_produccion['observaciones'],
                        "orden_produccion_idorden_produccion" => $dt_produccion['orden_produccion_idorden_produccion'],
                        "producto_idproducto" => $dt_produccion['producto_idproducto'],
                        "costo" => 0
                    );
                        $aux4 = $this->dbp->query("SELECT * FROM detalle_estandar_producto 
                                WHERE producto_idproducto='{$dt_produccion['producto_idproducto']}'"); 
                                // Verificar que la consulta fue exitosa
                        if (!$aux4) {
                            die("Error en la consulta: " . $this->dbp->error);
                        }
                        $arrRegla3 = [];

                        // while ($cantidad_material = $this->dbp->fetch($aux4)) {
                        //      $arrMat[] = $cantidad_material['material_idmaterial'];
                        // }
                        $aux5 = $this->dbp->query("SELECT cantidad FROM producto 
                                WHERE idproduct_comercial = '{$dt_produccion['producto_idproducto']}'"); 
                        
                        $resultado = $aux5->fetch_assoc();
                        $cantProducto = $resultado['cantidad'];
                        if ($cantProducto != 0) {

                            while ($costo = $this->dbp->fetch($aux4)) {

                                $aux6 = $this->dbp->query("SELECT precio FROM material 
                                WHERE idmaterial ='$costo[material_idmaterial]';"); 
                                $resultado2 = $aux6->fetch_assoc();
                                $aaa = (int)$resultado2['precio'];
                                $resRegla3= (($costo['cantidad'] * $dt_produccion['cantidad'])/$cantProducto)*$aaa;
                                array_push($arrRegla3, $resRegla3);

                                $aiu =0;
                                foreach($arrRegla3 as $i){
                                    $aiu= $aiu+$i;
                                }
                                $res4['costo'] = $aiu;
                                }
                        }else{
                            $lista_error = array("danger", "la cantidad del producto '{$dt_produccion['producto_idproducto']}' es cero","reprte_produccion");
                            // echo json_encode($res222);
                            // break;
                        }
                                
                    array_push($res3['detalle_produccion'], $res4);
                }
                array_push($res2['orden_produccion'], $res3);
                }
                //  }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
                $prodEtapa = $this->dbp->query("SELECT * FROM produccion_etapa pe 
                INNER JOIN etapas_produccion ep ON ep.idetapas_produccion = pe.etapas_produccion_idetapas_produccion
                WHERE pe.produccion_idproduccion = '{$produccion['idproduccion']}' AND ep.empresa_idempresa = '$idempresa'"); 
                $sumaHorasEtapas=0; 
                $listaAuxi=[];
                while ($prodEt = $this->dbp->fetch($prodEtapa)) {
                $res7 = array(
                "idproduccion_etapa" => $prodEt['idproduccion_etapa'],
                "fecha_pe" => $prodEt['fecha_pe'],
                "hora_pe" => $prodEt['hora_pe'],
                "fecha_fin" => $prodEt['fecha_fin'],
                "hora_fin" => $prodEt['hora_fin'],
                "estado" => $prodEt['estado'],
                "produccion_idproduccion" => $prodEt['produccion_idproduccion'],
                "etapas_produccion_idetapas_produccion" => $prodEt['etapas_produccion_idetapas_produccion'],
                "empleado_idempleado" => $prodEt['empleado_idempleado'],
                "grupo_etapas_idgrupo_etapas" => $prodEt['grupo_etapas_idgrupo_etapas'],
                "costo_mano_obra"=>0
                );
   
                // $empleados = $this->dbp->query("SELECT * FROM etapa_producccion_has_empleado WHERE etapas_produccion_idetapas_produccion='$prodEt[etapas_produccion_idetapas_produccion]';");  
                $empleados = $this->dbp->query("SELECT * 
                        FROM etapa_producccion_has_empleado 
                        WHERE etapas_produccion_idetapas_produccion='$prodEt[etapas_produccion_idetapas_produccion]'
                        AND ('$etapa[fecha_lote]' > fecha_inicio AND fecha_fin IS NULL) 
                        OR ('$etapa[fecha_lote]' BETWEEN fecha_inicio AND fecha_fin)");

                $listaEmpleados=[];
                while($ayuda = $this->dbp->fetch($empleados)){
                    $listaEmpleados[] = $ayuda['empleado_idempleado'];
                }//listaEmpleados = 91,42
                $sumaSalario =0;
                if(empty($listaEmpleados)){
                    $empleados2 =null;
                }else{
                    // Convertir array a string para la consulta SQL 
                $listaEmpleadosStr = implode(',', $listaEmpleados);
                $empleados2 = $this->dbrh->query("SELECT c.*
                    FROM contrataciones c
                    INNER JOIN (
                        SELECT trabajador_idtrabajador, MAX(fechai) AS max_fecha
                        FROM contrataciones
                        WHERE trabajador_idtrabajador IN ($listaEmpleadosStr)
                        GROUP BY trabajador_idtrabajador
                    ) m ON c.trabajador_idtrabajador = m.trabajador_idtrabajador AND c.fechai = m.max_fecha
                    WHERE c.trabajador_idtrabajador IN ($listaEmpleadosStr);");  
                // }
                
                $listaSalario =[];
                 while($ayuda2 = $this->dbp->fetch($empleados2)){
                    $listaSalario[] = $ayuda2['salario'];
                }//listaSalario = 3421,57,2500    
                // $sumaSalario =0;

                $horasProd = $this->dbp->query("SELECT horas_produccion FROM estandar_etapa_produccion WHERE etapas_produccion_idetapas_produccion='$prodEt[etapas_produccion_idetapas_produccion]' ORDER BY fecha DESC LIMIT 1;");  
                $resultado12 = $horasProd->fetch_assoc();
                $horasProduccion = $resultado12['horas_produccion']; //12
                
                $sumaHorasEtapas = $sumaHorasEtapas + $horasProduccion;

                foreach($listaSalario as $lsalario){
                    $auxsalario = ($lsalario / 160) * $horasProduccion; // el 12 reemplazar
                    $sumaSalario = $sumaSalario + $auxsalario; //444,05775
                }
            }
                $res7['costo_mano_obra'] = $sumaSalario; // res 7
   
                array_push($res2['produccion_etapa'], $res7);
                }
                // }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
                $salProd = $this->dbp->query("SELECT * FROM salida_produccion 
                WHERE produccion_idproduccion = '{$produccion['idproduccion']}'");  
                // $listaAuxi=[];
                while ($saliprod = $this->dbp->fetch($salProd)) {
                $res10 = array(
                "idsalida_produccion" => $saliprod['idsalida_produccion'],
                "cantidad" => $saliprod['cantidad'],
                "produccion_idproduccion" => $saliprod['produccion_idproduccion'],
                "producto_idproducto" => $saliprod['producto_idproducto'],
                "costo" => 0
                );
                $aux11 = $this->dbp->query("SELECT * FROM detalle_estandar_producto 
                                WHERE producto_idproducto='{$saliprod['producto_idproducto']}'"); 
                                // Verificar que la consulta fue exitosa
                        if (!$aux11) {
                            die("Error en la consulta: " . $this->dbp->error);
                        }
                        $arrRegla33 = [];

                        // while ($cantidad_material = $this->dbp->fetch($aux4)) {
                        //      $arrMat[] = $cantidad_material['material_idmaterial'];
                        // }
                        $aux12 = $this->dbp->query("SELECT cantidad FROM producto 
                                WHERE idproduct_comercial = '{$saliprod['producto_idproducto']}'"); 
                        
                        $resultado33 = $aux12->fetch_assoc();
                        $cantProducto2 = $resultado33['cantidad'];

                while ($costo2 = $this->dbp->fetch($aux11)) {

                    $aux66 = $this->dbp->query("SELECT precio FROM material 
                    WHERE idmaterial ='$costo2[material_idmaterial]';"); 
                    $resultado22 = $aux66->fetch_assoc();
                    $aaa2 = (int)$resultado22['precio'];
                    $resRegla32= (($costo2['cantidad'] * $saliprod['cantidad'])/$cantProducto2)*$aaa2;
                    array_push($arrRegla33, $resRegla32);

                    $aiu2 =0;
                    foreach($arrRegla33 as $i){
                        $aiu2= $aiu2+$i;
                    }
                    $res10['costo'] = $aiu2;
                    }
                array_push($res2['salida_produccion'], $res10);
                
            }
                // }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
                $solMat = $this->dbp->query("SELECT * FROM solicitud_material 
                WHERE produccion_idproduccion = '{$produccion['idproduccion']}'");  

                while ($soliMate = $this->dbp->fetch($solMat)) {
                $res8 = array(
                "idsolicitud_material" => $soliMate['idsolicitud_material'],
                "fecha" => $soliMate['fecha'],
                "hora" => $soliMate['hora'],
                "estado" => $soliMate['estado'],
                "empresa_idempresa" => $soliMate['empresa_idempresa'],
                "empleado_idempleado" => $soliMate['empleado_idempleado'],
                "produccion_idproduccion" => $soliMate['produccion_idproduccion'],
                 "detalle_solicitud_material" => [],
                 "material_produccion" => []
                );
                $dtsol= $this->dbp->query("SELECT * FROM detalle_solicitud_material 
                WHERE solicitud_material_idsolicitud_material = '{$soliMate['idsolicitud_material']}'");  
                 $array_detalle =[];
                 while ($dtsolimate = $this->dbp->fetch($dtsol)) {

                    $precioMat = $this->dbp->query("SELECT precio FROM material WHERE idmaterial = '$dtsolimate[material_idmaterial]'");
                    $resultado11 = $precioMat->fetch_assoc();
                    $precioMaterial = $resultado11['precio'];
                    $costoDt = $precioMaterial * $dtsolimate['cantidad'];

                    $res44 = array(
                    "iddetalle_solicitud_material" => $dtsolimate['iddetalle_solicitud_material'],
                    "cantidad" => $dtsolimate['cantidad'],
                    "observaciones" => $dtsolimate['observaciones'],
                    "solicitud_material_idsolicitud_material" => $dtsolimate['solicitud_material_idsolicitud_material'],
                    "material_idmaterial" => $dtsolimate['material_idmaterial'],
                    "costo" => $costoDt
                    );

                    $mat_prod = $this->dbp->query("SELECT * FROM material_produccion 
                    WHERE detalle_solicitud_material_iddetalle_solicitud_material = '$dtsolimate[iddetalle_solicitud_material]'");
                    // if ($mat_prod->num_rows == 0) 
                    if($mat_prod->num_rows == 0){

                    }else{
                    $mat_prod2 = $mat_prod->fetch_assoc();
                    // $cod = $resultado['codigotransaccion'];
                    $res55 = array(
                        "idmaterial_produccion" => $mat_prod2['idmaterial_produccion'],
                        "cantidad" => $mat_prod2['cantidad'],
                        "detalle_solicitud_material_iddetalle_solicitud_material" => $mat_prod2['detalle_solicitud_material_iddetalle_solicitud_material'],
                        "almacen_material_idalmacen_material" => $mat_prod2['almacen_material_idalmacen_material'],
                        "costo" => 0
                        );
                    // array_push($array_detalle,$dtsolimate['iddetalle_solicitud_material']); 
                    array_push($res8['material_produccion'], $res55);
                    }
                    array_push($res8['detalle_solicitud_material'], $res44);
                }
                array_push($res2['solicitud_material'], $res8);
                }
                array_push($res['produccion'], $res2);

    
        // array_push($res2['produccion_etapa'], $res7);
        }   
        $gastoGeneral = $montoTotal * $sumaHorasEtapas;
        $res['gastos_generales'] = $gastoGeneral;
            array_push($lista, $res);
        }
    
        if(empty($lista_error)){
            echo json_encode($lista);
        }else{
            echo json_encode($lista_error);
        }

    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
}
?>