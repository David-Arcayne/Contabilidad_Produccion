<?php
// session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Anulacion_transaccion extends DB{

    public function listar_anular_eliminar_transaccion($empresa,$todos,$idgestion) {
        $lista = [];
         $ide = $this->getidempresa($empresa);
        // $gestion = $this->getgestionactualC($empresa);
        // $idgestion = $gestion["id"];
        // Consulta SQL
        if($todos == '0'){ // solo de la gestion activa
            $sql =$this->dbc->query("SELECT * FROM solicitud_anular_eliminar s
            -- INNER JOIN transacciones t ON t.idtransacciones = s.transacciones_idtransacciones
            WHERE s.idempresa = '$ide' 
            AND s.idgestion = '$idgestion'
            ORDER BY 
                (s.estado_solicitud = '1') DESC,
                s.fecha DESC,
                s.hora DESC;
            ");   
        }else{ // de todos
            $sql =$this->dbc->query("SELECT * FROM solicitud_anular_eliminar s
            -- INNER JOIN transacciones t ON t.idtransacciones = s.transacciones_idtransacciones
            WHERE s.idempresa = '$ide'
            ORDER BY 
                (s.estado_solicitud = '1') DESC,
                s.fecha DESC,
                s.hora DESC;
        ");
        }
    
            // Procesar los resultados
            while ($qwe = $this->dbc->fetch($sql)) {
               $usuario = $this->getusuario($qwe['idusuario']); // Asegúrate de que esta función retorne los campos esperados
               $usuario_admin = $this->getusuario($qwe['idusuario_admin']);
                // $usuariob = isset($qwe['idusuariob']) ? $this->getusuario($qwe['idusuariob']) : null;
                /*" 
                    */
                    $transaccion =$this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
                    $resu = $transaccion->fetch_assoc();
                $lista[] = [
                    "idsolicitud_anular_eliminar" => $qwe['idsolicitud_anular_eliminar'],
                    "codigotransaccion" => $resu['codigotransaccion'],
                    "hora" => $qwe['hora'],
                    "fecha" => $qwe['fecha'],
                    "hora_proceso" => $qwe['hora_proceso'],
                    "fecha_proceso" => $qwe['fecha_proceso'],
                    "estado_opcion" => $qwe['estado_opcion'],
                    "estado_solicitud" => $qwe['estado_solicitud'],
                    "idusuario" => $qwe['idusuario'],
                    "nombre" => $usuario['nombre'] ?? null,
                    "apellido" => $usuario['apellido'] ?? null,
                    "nombre_admin" => $usuario_admin['nombre'] ?? null,
                    "apellido_admin" => $usuario_admin['apellido'] ?? null,
                    "motivo" => $qwe['motivo']
                ];
            } 
    
        // Retornar la lista en formato JSON
        echo json_encode($lista);
}      
// ----------------------------------------------------------------------

public function registrar_anular_eliminar_activar_transaccion($idtransaccion,$motivo,$estado_opci,$estado_soli,$hora,$fecha,$usuario,$empresa,$idgestion)
    {
        //estado_opci --> 1--> anular, 2--> eliminar, 3--> activar
        // estado_soli --> 1 = pendiente, 2= aceptado, 3=denegado
        //transaccion estados --> 1=activo, 2=proceso_anulac , 3=proceso_elimina, 4= anulado, 5=proceso_activacion


        // EN CUALQUIERA DE LOS CASOS SE PODRA SOLICITAR LA ANULACION
        //CASO I --> vacio SI,  consolidado NO 
        $idusuario=$this->getidusuario($usuario);
        $idempresa=$this->getidempresa($empresa);
        // $gestion = $this->getgestionactualC($empresa);
        // $idgestion = $gestion["id"];
        $res = "";
        $registro=$this->dbc->query("INSERT INTO solicitud_anular_eliminar(transacciones_idtransacciones,motivo,estado_opcion,estado_solicitud,hora,fecha,idusuario,idempresa,idgestion)
        VALUES('$idtransaccion','$motivo','$estado_opci','$estado_soli','$hora','$fecha','$idusuario','$idempresa','$idgestion')");

        // $detallet = $this->dbc->query("SELECT COUNT(*) AS total FROM factura WHERE cuenta='$dato'");
        // $resultado = $detallet->fetch_assoc();
        // $totalRegistros = $resultado['total'];
        if($registro===TRUE){
            if($estado_opci == 1){ //estado_opcion= 1 anular
                // estado_trans = 2--> proceso de anulacion 
                $editar=$this->dbc->query("UPDATE transacciones SET estado = '2' WHERE idtransacciones = '$idtransaccion'");    
            }elseif($estado_opci == 2){ //estado_opcion= 2 eliminar
                // estado_trans = 3--> proceso de eliminacion 
                $editar=$this->dbc->query("UPDATE transacciones SET estado = '3' WHERE idtransacciones = '$idtransaccion'");    

            }elseif($estado_opci == 3){//estado_opcion= 3 activar
             // estado_trans = 5--> proceso de activacion 
             $editar=$this->dbc->query("UPDATE transacciones SET estado = '5' WHERE idtransacciones = '$idtransaccion'");       
            }else{ // estado_opci = 4 revertir
                // estado_trans = 8--> proceso de revertir 
                $editar=$this->dbc->query("UPDATE transacciones SET estado = '8' WHERE idtransacciones = '$idtransaccion'"); 
            }
            
            $res = array("success", "Operacion exitosa","anular_transaccion");
        }else{
            $res = array("danger", "No se pudo anular");
        }
        
        echo json_encode($res);
    }

    public function cambiarEstado_anular_eliminar_activar_transaccion($idsoli,$estado_opcion,$estado_solicitud,$fecha_proceso,$hora_proceso,$idusuario_admin){
        //actualizar esto:
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // echo json_encode(array($idtran_espera,$estado,$fecha,$hora));
        $usuario=$this->getidusuario($idusuario_admin);
                $res="";
                $soli_consu=$this->dbc->query("SELECT * FROM solicitud_anular_eliminar WHERE idsolicitud_anular_eliminar='$idsoli'");
                $solicitud = $soli_consu->fetch_assoc();
                $idtransaccion = $solicitud['transacciones_idtransacciones'];
            // si --> estado_opcion = 1 -->anular
            // si --> estado_solicitud = 2 --> aceptado
            if($estado_opcion == 1){ //ANULAR
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar 
                    SET estado_solicitud = '$estado_solicitud',
                    hora_proceso = '$hora_proceso',
                    fecha_proceso = '$fecha_proceso',
                    idusuario_admin = '$usuario'
                        WHERE idsolicitud_anular_eliminar = '$idsoli'");   

                if($estado_solicitud == 2){ //ACEPTADO
                    $consulta_detalle=$this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion'");

                    $update_trans=$this->dbc->query("UPDATE transacciones SET estado = '4' 
                        WHERE idtransacciones = '$idtransaccion'");  

                    if ($consulta_detalle->num_rows > 0) {  

                        // ANULAR EL DETALLE DE LA TRANSACCION
                        $update_det=$this->dbc->query("UPDATE detalletransaccion SET estado = '2' 
                        WHERE transacciones_idtransacciones = '$idtransaccion'");        
                    }else{
                    

                    }

                    $res = array("success", "Se Acepto la anulacion de la transaccion", "cambiarEstado_anular_eliminar_transaccion");

                }else{ //DENEGADO --> estado_solicitud == 3
                    //NO SE ANULARA PERO SI CAMBIARA ESTADO DE TRANSACCION  
                    $update_trans=$this->dbc->query("UPDATE transacciones SET estado = '1' 
                        WHERE idtransacciones = '$idtransaccion'");  
                    $res = array("success", "Se Denego el permiso para anular", "cambiarEstado_anular_eliminar_transaccion");

                }
            }elseif($estado_opcion == 2){ //ELIMINAR estado_opcion = 2
                // 
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar 
                    SET estado_solicitud = '$estado_solicitud',
                    hora_proceso = '$hora_proceso',
                    fecha_proceso = '$fecha_proceso',
                    idusuario_admin = '$usuario'
                        WHERE idsolicitud_anular_eliminar = '$idsoli'");   

                if($estado_solicitud == 2){ //ACEPTADO
                $consulta_detalle=$this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion'");

                if ($consulta_detalle->num_rows > 0) {  

                    while ($cd = $this->dbc->fetch($consulta_detalle)) {

                        $update_recibo_c=$this->dbc->query("UPDATE recibo SET cuenta = '0' 
                        WHERE cuenta = '$cd[iddetalletransaccion]'");  

                        $update_factura_c=$this->dbc->query("UPDATE factura SET cuenta = '0' 
                        WHERE cuenta = '$cd[iddetalletransaccion]'");   

                        $update_compr_c=$this->dbc->query("UPDATE cuentaspof SET cuenta = '0' 
                                WHERE cuenta = '$cd[iddetalletransaccion]'");  

                        $update_comprob_c=$this->dbc->query("UPDATE cuentaspor SET cuenta = '0' 
                                WHERE cuenta = '$cd[iddetalletransaccion]'");  
                    }

                    // ELIMINAR DETALLES_TRANSACCION
                    $update_det=$this->dbc->query("DELETE FROM detalletransaccion 
                    WHERE transacciones_idtransacciones = '$idtransaccion'");        
                }else{
                

                }

                $trans_cierres=$this->dbc->query("SELECT * FROM cierre_transacciones WHERE idtransacciones='$idtransaccion'");

                if ($trans_cierres->num_rows > 0) {  
                    $delete_trans_cierres=$this->dbc->query("DELETE FROM cierre_transacciones
                    WHERE idtransacciones = '$idtransaccion'");  
                }else{

                }

                $update_recibo=$this->dbc->query("UPDATE recibo SET transaccion = '0' 
                        WHERE transaccion = '$idtransaccion'"); 

                $update_factura=$this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '0' 
                        WHERE transacciones_idtransacciones = '$idtransaccion'");   

                $update_comprobante=$this->dbc->query("UPDATE cuentaspof SET transaccion = '0' 
                        WHERE transaccion = '$idtransaccion'");  

                $update_comprobante=$this->dbc->query("UPDATE cuentaspor SET transaccion = '0' 
                        WHERE transaccion = '$idtransaccion'");  
                
                $delete_trans_fact=$this->dbc->query("DELETE FROM transaccion_documentos_comercial
                WHERE idtransaccion = '$idtransaccion'");  

                $eliminado=$this->dbc->query("SELECT codigotransaccion,fechatransaccion,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,idgestion FROM transacciones 
                WHERE idtransacciones = '$idtransaccion'");
    
                 $resElimi = $eliminado->fetch_assoc();
                 $codig = $resElimi['codigotransaccion'];
                 $tipo_trans = $resElimi['tipotransaccion_idtipotransaccion'];
                 $fecha_trans = $resElimi['fechatransaccion'];
                 $idempresa = $resElimi['organizacion_idorganizacion'];
                 $idgestion = $resElimi['idgestion'];

                $delete_transaccion=$this->dbc->query("DELETE FROM transacciones
                    WHERE idtransacciones = '$idtransaccion'");  
                // -----------------------------------------------------------------------------
                $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$idgestion'");
                $gc = $gestion_sel->fetch_assoc();

                if($gc['formato_transaccion'] == 'por_tipo_mes'){

                    // Construir rango dinámico (primer y último día del mes)
                    $fecha_inicio = date("Y-m-01", strtotime($fecha_trans)); // "2025-03-01"
                    $fecha_fin    = date("Y-m-t", strtotime($fecha_trans));  // "2025-03-31"

                    $transs=$this->dbc->query("SELECT * FROM transacciones 
                    WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa' 
                    AND idgestion = '$idgestion' AND tipotransaccion_idtipotransaccion ='$tipo_trans'
                    AND fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'");
                    $aux=0;
                    if ($transs->num_rows === 0){
                        // $res = array("success", "Se Elimino correctamente");
                    }else{
                        while($qwe2=$this->dbc->fetch($transs)){
                            $codigo =  $qwe2['codigotransaccion'];
                            $codigo = $codigo - 1;
                            
                                $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo' 
                                WHERE idtransacciones = '$qwe2[idtransacciones]'");
                            $aux++;
                            }  
                    }
                }elseif($gc['formato_transaccion'] == 'por_tipo_gestion'){
                    $transs=$this->dbc->query(" SELECT * FROM transacciones 
                    WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa' 
                    AND idgestion = '$idgestion' AND tipotransaccion_idtipotransaccion ='$tipo_trans'");
                    $aux=0;
                    if ($transs->num_rows === 0){
                        // $res = array("success", "Se Elimino correctamente");
                    }else{
                        while($qwe2=$this->dbc->fetch($transs)){
                            $codigo =  $qwe2['codigotransaccion'];
                            $codigo = $codigo - 1;
                            
                                $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo' 
                                WHERE idtransacciones = '$qwe2[idtransacciones]'");
                            $aux++;
                            }  
                    }
                }else{// POR GESTION
                    $transs=$this->dbc->query("SELECT * FROM transacciones 
                    WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa' AND idgestion = '$idgestion'");
                    $aux=0;
                    if ($transs->num_rows === 0){
                        // $res = array("success", "Se Elimino correctamente");
                    }else{
                        while($qwe2=$this->dbc->fetch($transs)){
                            $codigo =  $qwe2['codigotransaccion'];
                            $codigo = $codigo - 1;
                            
                                $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo' 
                                WHERE idtransacciones = '$qwe2[idtransacciones]'");
                            $aux++;
                            }  
                    }
                }

                // -------------------------------------------------------------------------------------

                $res = array("success", "Se Acepto la eliminacion de transaccion", "cambiarEstado_anular_eliminar_transaccion", $idgestion, $codig, $tipo_trans, $fecha_inicio, $fecha_fin,$fecha_trans);

                }else{ //DENEGADO
                      //NO SE ANULARA NI CAMBIARA ESTADO DE TRANSACCION NI DETALLE TRANSACCION  
                      $update_trans=$this->dbc->query("UPDATE transacciones SET estado = '1' 
                        WHERE idtransacciones = '$idtransaccion'");  
                        
                      $res = array("success", "Se Denego el permiso para eliminar transaccion", "cambiarEstado_anular_eliminar_transaccion");
                }
            }elseif($estado_opcion == 3){// ACTIVAR --> estado_opcion = 3
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar 
                SET estado_solicitud = '$estado_solicitud',
                hora_proceso = '$hora_proceso',
                fecha_proceso = '$fecha_proceso',
                idusuario_admin = '$usuario'
                WHERE idsolicitud_anular_eliminar = '$idsoli'");   

            if($estado_solicitud == 2){ //ACEPTADO
                $consulta_detalle=$this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion'");

                $update_trans=$this->dbc->query("UPDATE transacciones SET estado = '1' 
                    WHERE idtransacciones = '$idtransaccion'");  

                if ($consulta_detalle->num_rows > 0) {  

                    $update_det=$this->dbc->query("UPDATE detalletransaccion SET estado = '1' 
                    WHERE transacciones_idtransacciones = '$idtransaccion'");        
                }else{
                

                }

                $res = array("success", "Se Acepto la anulacion de la transaccion", "cambiarEstado_anular_eliminar_transaccion");

            }else{ //DENEGADO --> estado_solicitud == 3
                //NO SE ANULARA NI CAMBIARA ESTADO DE TRANSACCION NI DETALLE TRANSACCION  
                $res = array("success", "Se Denego el permiso para anular", "cambiarEstado_anular_eliminar_transaccion");

            }
            }else{ // REVERTIR --> estado_opcion = 4
                $update_soli=$this->dbc->query("UPDATE solicitud_anular_eliminar 
                    SET estado_solicitud = '$estado_solicitud',
                    hora_proceso = '$hora_proceso',
                    fecha_proceso = '$fecha_proceso',
                    idusuario_admin = '$usuario'
                        WHERE idsolicitud_anular_eliminar = '$idsoli'");   

                if($estado_solicitud == 2){ //ACEPTADO

                    $transaccion=$this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones='$idtransaccion'");
                    $tr = $transaccion->fetch_assoc();

                    $data = [
                    "idempresa" => $tr['organizacion_idorganizacion'],
                    "idsucursal" => $tr['sucursal'],
                    "fecha" => $tr['fechatransaccion'],
                    "idgestion" => $tr['idgestion'],
                    "tipodecambio" => $tr['tipodecambio'],
                    // "ttransaccion" => "VENTA", // o el tipo que corresponda
                    "idtipotransaccion" => $tr['tipotransaccion_idtipotransaccion'],
                    "codigotransaccion" => $tr['codigotransaccion'],
                    "consolidar" => $tr['consolidar'],
                    "estado" => $tr['estado'],
                    "vinculado_otra_empresa" => $tr['vinculado_otra_empresa'],
                    "detalle" => [] // aquí llenaremos con foreach
                    ];
                    

                    $consulta_detalle=$this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion'");

                    // Recorres todos los registros de detalle y los agregas al array
                    foreach ($consulta_detalle as $row) {
                        $data['detalle'][] = [
                            "numero" => $row['numero'], // si existe en tu tabla
                            "haber" => $row['haber'],
                            "debe" => $row['debe'],
                            "nota" => $row['nota'],
                            "idplandecuenta" => $row['idplandecuenta'],
                            "idcuentapresupuestaria" => $row['idcuentapresupuestaria'],
                            "estado" => $row['estado'],
                            "cobrar" => $row['cobrar'],
                            "pagar" => $row['pagar'],
                            "idorganizacion" => $row['idorganizacion'],
                            "idsucursal" => $row['idsucursal'],
                            "orden" => $row['orden']
                        ];
                    }

                    // Finalmente llamas a tu función de reversión
                    $resultado_revertir = $this->revertir_transaccion($data);

                    // Vuelve a estar Activo la transaccion
                    $update_trans=$this->dbc->query("UPDATE transacciones SET estado = '1' 
                        WHERE idtransacciones = '$idtransaccion'");  


                    // $lista_report_flujo = $this->revertir_transaccion($data);

                    // if ($consulta_detalle->num_rows > 0) {  

                    //     // ANULAR EL DETALLE DE LA TRANSACCION
                    //     $update_det=$this->dbc->query("UPDATE detalletransaccion SET estado = '2' 
                    //     WHERE transacciones_idtransacciones = '$idtransaccion'");        
                    // }else{
                    

                    // }

                    $res = array("success", "Se Acepto la Operacion de la transaccion", "cambiarEstado_anular_eliminar_transaccion");

                }else{ //DENEGADO --> estado_solicitud == 3
                    //NO SE ANULARA PERO SI CAMBIARA ESTADO DE TRANSACCION  
                    $update_trans=$this->dbc->query("UPDATE transacciones SET estado = '1' 
                        WHERE idtransacciones = '$idtransaccion'");  
                    $res = array("success", "Se Denego el permiso para anular", "cambiarEstado_anular_eliminar_transaccion");

                }
            }       

            echo json_encode($res);
        
        }
    // -----------------------------------------------------------------------------

    private function revertir_transaccion($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        // $idempresa = $this->getidempresa($data['empresa']);
        // $idsucursal = $this->getidsucursal($data['sucursal']); 
        // $gestion = $this->getgestionactualid($idempresa);
        $montoRecibos = 0;

        // Construir rango dinámico (primer y último día del mes)
        $fecha_inicio = date("Y-m-01", strtotime($data['fecha'])); // "2025-03-01"
        $fecha_fin    = date("Y-m-t", strtotime($data['fecha']));  // "2025-03-31"

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$data[idgestion]'");
        $gc = $gestion_sel->fetch_assoc();

            $tipocambio_id = $this->dbc->query("SELECT * FROM tipodecambio WHERE idtipodecambio = '$data[tipodecambio]'");
            $fech_tc = $tipocambio_id->fetch_assoc();

            // $tipocambio = $this->dbc->query("SELECT * FROM tipodecambio WHERE fecha = '$fech_tc[fecha]' AND idorganizacion ='$ev[idempresa_vinculada]'");
            // $tc = $tipocambio->fetch_assoc();

            // $tipotransaccion = $this->dbc->query("SELECT * FROM tipotransaccion WHERE nombre = '$data[ttransaccion]' AND idempresa ='$ev[idempresa_vinculada]'");
            // $tt = $tipotransaccion->fetch_assoc();

            $nroTransaccion = 0;

            // if($gc['formato_transaccion'] == 'por_tipo_mes') {

             if($gc['formato_transaccion'] == 'por_tipo_mes') {
            $nroTransa = $this->dbc->query("SELECT * 
                FROM transacciones
                WHERE tipotransaccion_idtipotransaccion = '$data[idtipotransaccion]'
                and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                AND idgestion = '$data[idgestion]'
                AND organizacion_idorganizacion = '$data[idempresa]'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
            }elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $nroTransa = $this->dbc->query("SELECT * 
                    -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$data[idtipotransaccion]'
                    AND idgestion = '$data[idgestion]'
                    AND organizacion_idorganizacion = '$data[idempresa]'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            } else { // POR_GESTION
                $nroTransa = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$data[idempresa]'
                    AND idgestion = '$data[idgestion]'
                    ORDER BY codigotransaccion DESC
                    LIMIT 1
                ");
            }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;
        $glosa_nueva = "transaccion revertida de trans Nro: ".$data['codigotransaccion'];

            $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,vinculado_otra_empresa,organizacion_idorganizacion,sucursal,idgestion)
            VALUE('$nroTransaccion','$resultado122[fechatransaccion]','$data[tipodecambio]','0','$glosa_nueva','$data[consolidar]','1','$data[idtipotransaccion]','$data[vinculado_otra_empresa]','$data[idempresa]','$data[idsucursal]','$data[idgestion]')");

            $idtransaccion = $this->dbc->insert_id;

            foreach ($data['detalle'] as $dt_trans) {

                $plandecuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$dt_trans[numero]' AND organizacion_idorganizacion ='$data[idempresa]'");
                $pl = $plandecuenta->fetch_assoc();

                $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$dt_trans[haber]','$dt_trans[debe]','$dt_trans[nota]','$idtransaccion','$dt_trans[idplandecuenta]','$dt_trans[idcuentapresupuestaria]','$dt_trans[estado]','$dt_trans[cobrar]','$dt_trans[pagar]','$dt_trans[idorganizacion]','$dt_trans[idsucursal]','$dt_trans[orden]')");
                
            }

            // Respuesta
            if ($writetrans === TRUE) {
                // $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['detalle']);
                $res = TRUE;
            } else {
                $res = FALSE;
                // $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde",$data['detalle']);
            }

        return $res;

        // echo json_encode($res);
        // echo json_encode(array());
    }

public function getidempresa($md5)
{
    $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
    $qwe = $this->dbe->fetch($registro);
    return $qwe['idorganizacion'];
}
public function getidsucursal($md5)
{
    $registro = $this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
    $qwe = $this->dbe->fetch($registro);
    return $qwe['idsucursalcontable'];
}

public function getgestionactualC($empresa)
{
    $orga = $this->getidempresa($empresa); // recibe md5 de la id insert
    $res = "";
    $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
    $qwe = $this->dbc->fetch($registro);

    // Retorna un array asociativo con la información
    return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
}
public function getgestionactualid($empresa)
{

    $res = "";
    $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
    $qwe = $this->dbc->fetch($registro);
    //$res=array("id"=>,"nombre"=>$qwe['nombre']);
    return $qwe['idgestion'];
}
public function getidusuario($md5){
    $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
    $qwe=$this->dbrh->fetch($registro);
    return $qwe['idusuario'];

} 
public function getusuario($id) {
    $registro = $this->dbrh->query("
        SELECT u.nombre AS usuario_nombre, t.nombre AS trabajador_nombre, t.apellido, t.ci 
        FROM usuario AS u 
        INNER JOIN trabajador AS t ON t.idtrabajador = u.trabajador_idtrabajador
        WHERE u.idusuario = '$id'
    ");
    $qwe = $this->dbrh->fetch($registro);

    return [
        "usuario" => $qwe['usuario_nombre'],
        "nombre" => $qwe['trabajador_nombre'],
        "apellido" => $qwe['apellido'],
        "ci" => $qwe['ci']
    ];
}
}