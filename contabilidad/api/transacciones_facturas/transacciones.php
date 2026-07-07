<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Transacciones extends DB{
    
    public function registrotransaccion($fecha, $tipocambio, $tipotransaccion, $glosa, $empresa, $sucursal,$ufv,$dolar,$idgestion)
    {
        $ndocumento = "0";
        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        // $gestion = $this->getgestionactualC($empresa);
        // $idgestion = $gestion["id"];
        $res = "";

        // Construir rango dinámico (primer y último día del mes)
        $fecha_inicio = date("Y-m-01", strtotime($fecha)); // "2025-03-01"
        $fecha_fin    = date("Y-m-t", strtotime($fecha));  // "2025-03-31"

        // aqui la condicional si hay una nueva gestion

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$idgestion'");
        $gc = $gestion_sel->fetch_assoc();

        if($gc['formato_transaccion'] == 'por_tipo_mes') {
            $nroTransa = $this->dbc->query("SELECT *
            --  COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
            FROM transacciones
            WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
            and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
            AND idgestion = '$idgestion'
            AND organizacion_idorganizacion = '$ide'
            ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
            $nroTransa = $this->dbc->query("SELECT *
            -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones 
                WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
                AND idgestion = '$idgestion'
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } else { // POR_GESTION
        
            $nroTransa = $this->dbc->query("SELECT *
                FROM transacciones 
                WHERE organizacion_idorganizacion = '$ide'
                AND idgestion = '$idgestion'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        }

$resultado122 = $nroTransa->fetch_assoc();
$nroTransaccion = $resultado122['codigotransaccion'] + 1;


        // echo json_encode(array($fecha, $tipocambio, $tipotransaccion, $glosa, $empresa,$ide, $sucursal,$ufv,$dolar,$idgestion,$nroTransaccion,$resultado122['codigotransaccion']));
    if($fecha >= $resultado122['fechatransaccion']){    
        if($tipocambio != ""){
            // EXISTE TIPO DE CAMBIO PARA LA FECHA DE HOY O SE SELECCIONARA UNA Q YA EXISTE
            $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
            VALUE(NULL,'$nroTransaccion','$fecha','$tipocambio','$ndocumento','$glosa','1','1','$tipotransaccion','$ide','$idsucursal','$idgestion')");

        $idtransaccion = $this->dbc->insert_id;

        }else{
            //HAY Q CREAR TIPO DE CAMBIO 
            $registro_tipoCambio = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)
            VALUES('$dolar','$ufv','$fecha','$ide')");

            $idtipo_cambio = $this->dbc->insert_id;   
        
        $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
        VALUE(NULL,'$nroTransaccion','$fecha','$idtipo_cambio','$ndocumento','$glosa','1','1','$tipotransaccion','$ide','$idsucursal','$idgestion')");

        $idtransaccion = $this->dbc->insert_id;
        }
    }else{
        $writetrans = FALSE;
    }
        if ($writetrans === TRUE) {
            $tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='" . $tipotransaccion . "'");
            $asd = $this->dbc->fetch($tt);

            $res = array("success", "Se Registro Correctamente", "registrotransaccion",$idtransaccion,$nroTransaccion,$fecha,$glosa,'1',$asd['nombre'],$tipotransaccion,$fecha_inicio,$fecha_fin);
        } else {
            $res = array("danger", "La fecha debe ser posterior al último registro realizado: ".$resultado122['fechatransaccion']);
        }
        echo json_encode($res);
    }
    public function registrotransaccionf5($idt, $fecha, $tipocambio, $tipotransaccion, $glosa)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $res = "";
        $writetrans = $this->dbc->query("UPDATE transacciones SET fechatransaccion='$fecha',tipodecambio='$tipocambio',glosa='$glosa',tipotransaccion_idtipotransaccion='$tipotransaccion' where idtransacciones='$idt'");
        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "registrotransaccionf5");
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
            //  echo json_encode(array($idt, $fecha, $tipocambio, $tipotransaccion, $glosa, $gestion));

    }

//     public function listatransacciones($empresa, $gestion)
// {
//     $lista = [];
//     $ide = $this->getidempresa($empresa);

//     // Obtener formato de gestión
//     $gestion_sel = $this->dbc->query("SELECT formato_transaccion FROM gestion WHERE idgestion='$gestion'");
//     $gc = $gestion_sel->fetch_assoc();

//     // Consulta principal con JOINs
//     $registro = $this->dbc->query("
//         SELECT 
//             t.idtransacciones,
//             t.codigotransaccion,
//             t.fechatransaccion,
//             t.glosa,
//             t.consolidar,
//             t.tipotransaccion_idtipotransaccion,
//             t.idgestion,
//             t.estado,
//             t.tipodecambio,
//             tt.nombre AS tipo_nombre,
//             d.iddetalletransaccion,
//             p.nombreplan,
//             d.debe, d.haber, d.nota, d.estado AS estado_detalle,
//             d.idorganizacion, d.idplandecuenta, d.cobrar, d.pagar, d.orden, p.numero,
//             LAG(t.fechatransaccion) OVER (ORDER BY t.codigotransaccion DESC) AS fecha_anterior,
//             LEAD(t.fechatransaccion) OVER (ORDER BY t.codigotransaccion DESC) AS fecha_siguiente,
//             t.vinculado_otra_empresa
//         FROM transacciones t
//         LEFT JOIN tipotransaccion tt ON tt.idtipotransaccion = t.tipotransaccion_idtipotransaccion
//         LEFT JOIN detalletransaccion d ON d.transacciones_idtransacciones = t.idtransacciones
//         LEFT JOIN plandecuenta p ON p.idplandecuenta = d.idplandecuenta
//         WHERE t.organizacion_idorganizacion = '$ide'
//           AND t.idgestion = '$gestion'
//           AND t.estado != 6
//         ORDER BY t.codigotransaccion DESC
//     ");

//     // Verificar cierre
//     $existe = $this->dbc->query("
//         SELECT 1 FROM cierre_transacciones 
//         WHERE (nombre_operacion = 'precierre' OR nombre_operacion = 'cierre') 
//           AND idempresa = '$ide' 
//           AND idgestion ='$gestion'
//     ");

//     $cerrado = $existe->num_rows > 0 ? 1 : 0;

//     // Procesar resultados agrupando detalle por transacción
//     $transacciones = [];
//     while ($row = $registro->fetch_assoc()) {
//         $id = $row['idtransacciones'];

//         if (!isset($transacciones[$id])) {
//             $transacciones[$id] = [
//                 "id" => $row['idtransacciones'],
//                 "ntransaccion" => $row['codigotransaccion'],
//                 "fecha" => $row['fechatransaccion'],
//                 "fecha_anterior" => $row['fecha_anterior'],
//                 "fecha_siguiente" => $row['fecha_siguiente'],
//                 "glosa" => $row['glosa'],
//                 "consolidar" => $row['consolidar'],
//                 "ttransaccion" => $row['tipo_nombre'],
//                 "idtipotransaccion" => $row['tipotransaccion_idtipotransaccion'],
//                 "gestion" => $row['idgestion'],
//                 "estado" => $row['estado'],
//                 "tipocambio" => $row['tipodecambio'],
//                 "existe" => $cerrado,
//                 "formato_transaccion" => $gc['formato_transaccion'],
//                 "vinculado_otra_empresa" => $row['vinculado_otra_empresa'],
//                 "detalle" => []
//             ];
//         }

//         // Agregar detalle si existe
//         if (!empty($row['iddetalletransaccion'])) {
//             $transacciones[$id]['detalle'][] = [
//                 "id" => $row['iddetalletransaccion'],
//                 "plan" => $row['nombreplan'],
//                 "debe" => $row['debe'],
//                 "haber" => $row['haber'],
//                 "nota" => $row['nota'],
//                 "estado" => $row['estado_detalle'],
//                 "idempresa" => $row['idorganizacion'],
//                 "idplan" => $row['idplandecuenta'],
//                 "cobrar" => $row['cobrar'],
//                 "pagar" => $row['pagar'],
//                 "orden" => $row['orden'],
//                 "idcuentapresupuestaria" => $row['idcuentapresupuestaria'],
//                 "idsucursal" => $row['idsucursal'],
//                 "idorganizacion" => $row['idorganizacion'],
//                 "numero" => $row['numero']
//             ];
//         }
//     }

//     // Convertir a lista
//     $lista = array_values($transacciones);

//     echo json_encode($lista, JSON_UNESCAPED_UNICODE);
// }

    public function listatransacciones($empresa,$gestion)
    {
        $lista = [];
        // row
        $ide = $this->getidempresa($empresa);
        // $getG = $this->getgestionactualC($empresa);
        // $gestion = $getG['id'];

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$gestion'");
        $gc = $gestion_sel->fetch_assoc();

        if($gc['formato_transaccion'] == 'por_tipo_mes') { //FORMATO TIPO_MES
        $registro = $this->dbc->query("SELECT 
    t.idtransacciones,
    t.codigotransaccion,
    t.fechatransaccion,
    t.glosa,
    t.consolidar,
    t.tipotransaccion_idtipotransaccion,
    t.idgestion,
    t.estado,
    t.tipodecambio,
    LAG(t.fechatransaccion) OVER (
        ORDER BY 
            YEAR(t.fechatransaccion) ASC,
            MONTH(t.fechatransaccion) ASC,
            t.tipotransaccion_idtipotransaccion ASC,
            t.codigotransaccion DESC
    ) AS fecha_anterior,
    LEAD(t.fechatransaccion) OVER (
        ORDER BY 
            YEAR(t.fechatransaccion) ASC,
            MONTH(t.fechatransaccion) ASC,
            t.tipotransaccion_idtipotransaccion ASC,
            t.codigotransaccion DESC
    ) AS fecha_siguiente,
    t.vinculado_otra_empresa
FROM transacciones AS t
WHERE t.idgestion = '$gestion'
  AND t.organizacion_idorganizacion = '$ide'
ORDER BY 
    YEAR(t.fechatransaccion) ASC,
    MONTH(t.fechatransaccion) ASC,
    t.tipotransaccion_idtipotransaccion ASC,
    t.codigotransaccion DESC;");

        }elseif($gc['formato_transaccion'] == 'por_tipo_gestion'){ //FORMATO TIPO_GESTION
              $registro = $this->dbc->query("SELECT 
                t.idtransacciones,
                t.codigotransaccion,
                t.fechatransaccion,
                t.glosa,
                t.consolidar,
                t.tipotransaccion_idtipotransaccion,
                t.idgestion,
                t.estado,
                t.tipodecambio,
                        -- g.gestion AS gestion_anio,
                tt.nombre AS tipo_nombre,
                LAG(t.fechatransaccion) OVER 
                (ORDER BY t.idgestion ASC,t.tipotransaccion_idtipotransaccion ASC, 
                t.codigotransaccion DESC) AS fecha_anterior,
                LEAD(t.fechatransaccion) OVER 
                (ORDER BY t.idgestion ASC,t.tipotransaccion_idtipotransaccion ASC, 
                t.codigotransaccion DESC) AS fecha_siguiente,
                t.vinculado_otra_empresa

            FROM transacciones t
            LEFT JOIN gestion g ON g.idgestion = t.idgestion
            LEFT JOIN tipotransaccion tt ON tt.idtipotransaccion = t.tipotransaccion_idtipotransaccion
            WHERE 
                t.organizacion_idorganizacion = '$ide'
                AND t.idgestion = '$gestion'
            ORDER BY 
                t.idgestion ASC,           -- Agrupar por gestión
                t.tipotransaccion_idtipotransaccion ASC,  -- Agrupar y ordenar por tipo
                -- t.fechatransaccion ASC,       
                 -- Orden cronológico dentro del tipo
                t.codigotransaccion DESC;    -- Correlativo correcto
            ");

        }else{ //POR GESTION
            $registro = $this->dbc->query("SELECT
        t.idtransacciones,
        t.codigotransaccion,
        t.fechatransaccion,
        t.glosa,
        t.consolidar,
        t.tipotransaccion_idtipotransaccion,
        t.idgestion,
        t.estado,
        t.tipodecambio,
        LAG(t.fechatransaccion) OVER (ORDER BY t.codigotransaccion DESC) AS fecha_anterior,
        LEAD(t.fechatransaccion) OVER (ORDER BY t.codigotransaccion DESC) AS fecha_siguiente,
        t.vinculado_otra_empresa
      FROM
        transacciones AS t
      WHERE
        t.organizacion_idorganizacion = '$ide'
        AND idgestion = '$gestion'
        AND t.estado != 6 
      order by
        t.codigotransaccion desc;");
        }

        $existe = $this->dbc->query("SELECT * FROM cierre_transacciones WHERE (nombre_operacion = 'precierre' OR nombre_operacion = 'cierre') AND idempresa = '$ide' AND idgestion ='$gestion'");

        if($existe->num_rows > 0){
            while ($qwe = $this->dbc->fetch($registro)) {
            $tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='" . $qwe[5] . "'");
            $asd = $this->dbc->fetch($tt);
            $detalle = [];

            $transdeta = $this->dbc->query("SELECT d.iddetalletransaccion,p.nombreplan,d.debe,d.haber,d.nota,d.estado,d.idorganizacion,d.idplandecuenta,d.cobrar,d.pagar,d.orden,p.numero FROM detalletransaccion as d,plandecuenta as p where p.idplandecuenta=d.idplandecuenta and d.transacciones_idtransacciones='$qwe[0]'");
            while ($qq = $this->dbc->fetch($transdeta)) {
                $ress = array("id" => $qq[0], "plan" => $qq[1], "debe" => $qq[2], "haber" => $qq[3], "nota" => $qq[4], "estado" => $qq[5], "idempresa" => $qq[6], "idplan" => $qq[7],"cobrar" => $qq[8],"pagar" => $qq[9],"orden" => $qq[10],"numero" => $qq[11]);
                array_push($detalle, $ress);
            }

            $res = array("id" => $qwe[0], "ntransaccion" => $qwe[1], "fecha" => $qwe[2],"fecha_anterior" => $qwe['fecha_anterior'],"fecha_siguiente" => $qwe['fecha_siguiente'], "glosa" => $qwe[3], "consolidar" => $qwe[4], "ttransaccion" => $asd['nombre'],"idtipotransaccion"=>$qwe[5], "gestion" => $qwe[6],"estado" => $qwe[7], "detalle" => $detalle, "tipocambio" => $qwe[8],"existe" => 1,"formato_transaccion" => $gc['formato_transaccion'],"vinculado_otra_empresa" => $qwe['vinculado_otra_empresa']);
            array_push($lista, $res);
        }
        }else{
            while ($qwe = $this->dbc->fetch($registro)) {
            $tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='" . $qwe[5] . "'");
            $asd = $this->dbc->fetch($tt);
            $detalle = [];

            $transdeta = $this->dbc->query("SELECT d.iddetalletransaccion,p.nombreplan,d.debe,d.haber,d.nota,d.estado,d.idorganizacion,d.idplandecuenta,d.cobrar,d.pagar,d.orden,p.numero from detalletransaccion as d,plandecuenta as p where p.idplandecuenta=d.idplandecuenta and d.transacciones_idtransacciones='$qwe[0]'");
            while ($qq = $this->dbc->fetch($transdeta)) {
                $ress = array("id" => $qq[0], "plan" => $qq[1], "debe" => $qq[2], "haber" => $qq[3], "nota" => $qq[4], "estado" => $qq[5], "idempresa" => $qq[6], "idplan" => $qq[7],"cobrar" => $qq[8],"pagar" => $qq[9],"orden" => $qq[10],"numero" => $qq[11]);
                array_push($detalle, $ress);
            }

            $res = array("id" => $qwe[0], "ntransaccion" => $qwe[1], "fecha" => $qwe[2],"fecha_anterior" => $qwe['fecha_anterior'],"fecha_siguiente" => $qwe['fecha_siguiente'], "glosa" => $qwe[3], "consolidar" => $qwe[4], "ttransaccion" => $asd['nombre'],"idtipotransaccion"=>$qwe[5], "gestion" => $qwe[6],"estado" => $qwe[7], "detalle" => $detalle, "tipocambio" => $qwe[8],"existe" => 0,"formato_transaccion" => $gc['formato_transaccion'],"vinculado_otra_empresa" => $qwe['vinculado_otra_empresa']);
            array_push($lista, $res);
        }
        }
        
        echo json_encode($lista);
    }

    public function eliminartransaccion($idt)
    {
        $res = "";
        // $orga = $this->getidempresa($empresa);
        $detallet = $this->dbc->query("SELECT COUNT(*) AS total FROM detalletransaccion WHERE transacciones_idtransacciones='$idt'");
        $resultado = $detallet->fetch_assoc();
        $totalRegistros = $resultado['total'];
        if($totalRegistros > 0){
            $res = array("danger", "No se Puede Eliminar, tiene datos almacenados");
        }else{

            $eliminado=$this->dbc->query("SELECT codigotransaccion,organizacion_idorganizacion FROM transacciones 
            WHERE idtransacciones = '$idt'");

             $resElimi = $eliminado->fetch_assoc();
             $codig = $resElimi['codigotransaccion'];
             $idempresa = $resElimi['organizacion_idorganizacion'];

             $transa = $this->dbc->query("DELETE FROM transacciones WHERE idtransacciones='$idt'");
           
            $transs=$this->dbc->query("SELECT * FROM transacciones 
            WHERE codigotransaccion > '$codig' AND organizacion_idorganizacion = '$idempresa'");
            $aux=0;
            if ($transs->num_rows === 0){
                $res = array("success", "Se Elimino correctamente");
            }else{
            while($qwe2=$this->dbc->fetch($transs)){
           $codigo =  $qwe2['codigotransaccion'];
           $codigo = $codigo - 1;
            
                $descTRan=$this->dbc->query("UPDATE transacciones SET codigotransaccion = '$codigo' 
                WHERE idtransacciones = '$qwe2[idtransacciones]'");
               $aux++;
            }
            
            if ($descTRan ==TRUE){
                $res = array("success", "Se Elimino correctamente");

            }else{
                $res = array("danger", "Se elimino pero no se actualiza");

            }
        }
        }
        
        echo  json_encode($res);
    }

    //DETALLE TRANSACCION
    
    public function detalletransaccionnormal($idtransaccion, $plandecuenta, $debe, $haber, $nota, $empresa, $sucursal, $iddetalletransaccion)
    { //iddetalletransaccion,planCuenta, debe, haber.... , (iddetalleTrans o Nro_orden)
        $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);

        $estado = 1;
        $ppresupuestario = 0;
        $res = "";
        $listaUltimoDetalle = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' ORDER BY orden DESC LIMIT 1;");
        $ulti_registro = $listaUltimoDetalle->fetch_assoc();
        $nuevaOrden = $ulti_registro['orden'] + 1;

         if($iddetalletransaccion == 0){
            $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
            VALUES ('$debe','$haber','$nota','$idtransaccion','$plandecuenta','$ppresupuestario','$estado','2','2','$ide','$idsucursal','$nuevaOrden')");
         }else{

        // Obtener el orden del detalle transacaccion q se insertara
        $listaDetalleOrden = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE iddetalletransaccion='$iddetalletransaccion'");
        $orden = $listaDetalleOrden->fetch_assoc();
        $nro_orden = $orden['orden'];
        // nro_orden --> 2
        
       
         $listaDetalleOrden = $this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' AND orden >'$nro_orden';");
        
         //Actualizar las ordenes de los detalles transaccion

        while ($lorden = $this->dbc->fetch($listaDetalleOrden)) {
            $ordenAux = $lorden['orden'] + 1;
            $editarOrden = $this->dbc->query("UPDATE detalletransaccion SET orden = '$ordenAux'
             WHERE iddetalletransaccion='$lorden[iddetalletransaccion]'");
        }

        // Insertar el nuevo detalle debajo del detalle q se selecciono

        $auxiOrdenInsert = $nro_orden + 1;
        $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
        VALUES ('$debe','$haber','$nota','$idtransaccion','$plandecuenta','$ppresupuestario','$estado','2','2','$ide','$idsucursal','$auxiOrdenInsert')");
    }
       if ($crearDet_trans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal", $idtransaccion);
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }
    public function detalletransaccionnormalf5($iddetalle, $trans, $plandecuenta, $debe, $haber, $nota)
    {

        $res = "";
        $crear = $this->dbc->query("update detalletransaccion set debe='$debe',haber='$haber',nota='$nota',idplandecuenta='$plandecuenta' where iddetalletransaccion='$iddetalle'");
        if ($crear === TRUE) {
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormalf5", $trans);
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }

    public function eliminardetalle($dato)
    {
        $res = "";
        // $detallet = $this->dbc->query("SELECT COUNT(*) AS total FROM factura WHERE cuenta='$dato'");
        // $resultado = $detallet->fetch_assoc();
        // $totalRegistros = $resultado['total'];
      
            // $update_recibo_c=$this->dbc->query("UPDATE recibo SET cuenta = '0' 
            //             WHERE cuenta = '$dato'");  

            //             $update_factura_c=$this->dbc->query("UPDATE factura SET cuenta = '0' 
            //             WHERE cuenta = '$dato'");   

            //             $update_compr_c=$this->dbc->query("UPDATE cuentaspof SET cuenta = '0' 
            //                     WHERE cuenta = '$dato'");  

            //             $update_comprob_c=$this->dbc->query("UPDATE cuentaspor SET cuenta = '0' 
            //                     WHERE cuenta = '$dato'"); 

            $registro = $this->dbc->query("DELETE FROM detalletransaccion WHERE iddetalletransaccion='$dato'");
            if ($registro === TRUE) {
                $res = array("success", "Se Elimino");
            } else {
                $res = array("danger", "No se pudo eliminar");
            }
        
        
        echo json_encode($res);
    }
    public function listadetalletransaccion_reemplazo($trans)
    {
        $lista = [];

        // Consulta optimizada
        $sql = "SELECT d.iddetalletransaccion, p.nombreplan,p.numero, d.debe, d.haber, d.nota, d.estado, d.idorganizacion, d.idplandecuenta, d.orden
            FROM detalletransaccion AS d
            INNER JOIN plandecuenta AS p ON p.idplandecuenta = d.idplandecuenta
            WHERE d.transacciones_idtransacciones = '$trans' ORDER BY d.orden ASC
        ";
    //WHERE d.transacciones_idtransacciones = '$trans' ORDER BY d.orden ASC
        // Ejecuta la consulta
        $transdeta = $this->dbc->query($sql);
        
        // Procesa los resultados
        while ($qwe = $this->dbc->fetch($transdeta)) {
            $facturas=$this->dbc->query("SELECT COUNT(*) as listafactura
                    FROM factura AS f 
                    WHERE f.cuenta = $qwe[7]");
            $fa=$this->dbc->fetch($facturas);
            $res = array(
                "id" => $qwe['iddetalletransaccion'],
                "numero"=>$qwe['numero'],
                "plan" => $qwe['nombreplan'],
                "debe" => $qwe['debe'],
                "haber" => $qwe['haber'],
                "nota" => $qwe['nota'],
                "estado" => $qwe['estado'],
                "idempresa" => $qwe['idorganizacion'],
                "idplan" => $qwe['idplandecuenta'],
                "factura" => $fa['listafactura'],
                "orden"=>$qwe['orden']
            );
    
            array_push($lista, $res);
        }
    
        echo json_encode($lista);
    }

    public function listadetalletransaccion($trans)
    {
        //   ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $array_plancuenta = [];

        $plancuenta=$this->dbc->query("SELECT *
        FROM detalletransaccion
        WHERE transacciones_idtransacciones = '$trans' ORDER BY orden ASC");

        // $plancuenta = "SELECT idplandecuenta
        // FROM detalletransaccion
        // WHERE transacciones_idtransacciones = '$trans' ORDER BY orden ASC";

        if($plancuenta->num_rows > 0){

        // $result = $this->dbc->query($plancuenta);
        while ($pc = $this->dbc->fetch($plancuenta)) {

            // array_push($array_plancuenta, $pc['idplandecuenta']);
            $array_plancuenta[] = $pc['idplandecuenta'];
            $auxi = $pc['idplandecuenta'];
            $debe_aux = $pc['debe'];
            $haber_aux = $pc['haber'];
        }
        $tamaño_arreglo = count($array_plancuenta);
        // echo json_encode(array($array_plancuenta,$tamaño_arreglo,$auxi,$auxi2,$auxi3));

        // Convertir valores de array a números
        $array_plancuenta_numerico = array_map('intval', $array_plancuenta);

        // Convertir a cadena separada por comas para la consulta SQL
        $array_plancuenta_str = implode(',', $array_plancuenta_numerico);

        $filtrado = $this->dbc->query("SELECT *
        FROM asiento
        WHERE idcuenta IN ($array_plancuenta_str)
        GROUP BY idasientotipo
        HAVING COUNT(DISTINCT idcuenta) = $tamaño_arreglo;");
if($filtrado->num_rows > 0){
    $resultado = $filtrado->fetch_assoc();

    // if($debe_aux == 0 && $haber_aux > 0){
    //     $resp = (100 * $haber_aux)/$resultado['porciento'];
    // }elseif($debe_aux > 0 && $haber_aux == 0){
    //     $resp = (100 * $debe_aux)/$resultado['porciento'];

    // }else{
    //     $resp = 0;
    // }
    if (!empty($resultado['porciento']) && $resultado['porciento'] != 0) {
        if ($debe_aux == 0 && $haber_aux > 0) {
            $resp = (100 * $haber_aux) / $resultado['porciento'];
        } elseif ($debe_aux > 0 && $haber_aux == 0) {
            $resp = (100 * $debe_aux) / $resultado['porciento'];
        } else {
            $resp = 0;
        }
    } else {
        // Puedes manejar la situación de manera segura
        $resp = 0;
        // Incluso podrías registrar un mensaje de error si lo necesitas
        // error_log("Porciento no definido o igual a cero en transacción ID: $trans");
    }

}else{
    $resp = 0;
}
    }else{
        
    }

    // $resultado['porciento']/100

//10195,10177,10170,10128
    //     // Consulta optimizada
        $sql = "SELECT d.iddetalletransaccion, p.nombreplan,p.numero, d.debe, d.haber, d.nota, d.estado, d.idorganizacion, d.idplandecuenta, d.orden
            FROM detalletransaccion AS d
            INNER JOIN plandecuenta AS p ON p.idplandecuenta = d.idplandecuenta
            WHERE d.transacciones_idtransacciones = '$trans' ORDER BY d.orden ASC
        ";
    // //WHERE d.transacciones_idtransacciones = '$trans' ORDER BY d.orden ASC
    //     // Ejecuta la consulta
        $transdeta = $this->dbc->query($sql);
        
    //     // Procesa los resultados
        while ($qwe = $this->dbc->fetch($transdeta)) {
            $array_codigo = explode(".", $qwe[2]); 
            if($array_codigo[4] == '00'){
                //no pasa nada 
                $cuenta_padre = "";
            }else{
                $aux = $array_codigo[0].".".$array_codigo[1].".".$array_codigo[2].".".$array_codigo[3].".00";
                $cuenta=$this->dbc->query("SELECT * FROM plandecuenta WHERE numero ='$aux' AND organizacion_idorganizacion ='$qwe[idorganizacion]'");
                $resu = $this->dbc->fetch($cuenta);
                $cuenta_padre = $resu['nombreplan'];

            }
            $facturas=$this->dbc->query("SELECT COUNT(*) as listafactura
                    FROM factura AS f 
                    WHERE f.cuenta = $qwe[0]");
            $fa=$this->dbc->fetch($facturas);
            $res = array(
                "id" => $qwe['iddetalletransaccion'],
                "numero"=>$qwe['numero'],
                "plan" => $qwe['nombreplan'],
                "debe" => $qwe['debe'],
                "haber" => $qwe['haber'],
                "nota" => $qwe['nota'],
                "estado" => $qwe['estado'],
                "idempresa" => $qwe['idorganizacion'],
                "idplan" => $qwe['idplandecuenta'],
                "factura" => $fa['listafactura'],
                "orden"=>$qwe['orden'],
                "cuenta_padre"=>$cuenta_padre,
                "monto_ini"=>$resp
            );
            
            // $aux = $qwe['debe'];
            // $aux2 = $qwe['haber'];
            array_push($lista, $res);
        }
    
         echo json_encode($lista);
       
    }

    public function anular_factura($idfactura,$estado) {
        // $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","anular_factura");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE factura
                                    SET estado = '$estado'
                                    WHERE idfactura = '$idfactura';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Anulacion exitosa","anular_factura");
            } else {
                $res = array("danger", "No se pudo editar");
            }
        }
        echo json_encode($res);
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
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); detalletransaccion
        return $qwe['idgestion'];
    }
    public function _modulos_modulo($empresa)
    {

        $ide = $this->getidempresa($empresa);
        $res = "";
        // aqui la condicional si hay una nueva gestion

        $existe = $this->dbc->query("SELECT COUNT(*) AS total FROM plandecuenta WHERE organizacion_idorganizacion = '$ide'");
        $resultado12 = $existe->fetch_assoc();

            return $resultado12['total'] > 0;

    }
    public function registro_transaccion_comercial($fecha, $idasignacion_asiento,$monto, $empresa, $sucursal,$gestion)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        // $gestion = $this->getgestionactualid($ide);
        // echo json_encode(array($ide,$idsucursal,$gestion,$fecha, $idasignacion_asiento, $empresa, $sucursal));
        $res = "";
        // aqui la condicional si hay una nueva gestion
        $asignacion = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos WHERE idasignacion_asiento_operacion_modulos='$idasignacion_asiento'");
        $aux_asignacion = $asignacion->fetch_assoc();

        $asient = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$aux_asignacion[idasientotipo]'");//-----------
        $tipotransaccion = $asient->fetch_assoc();
        
        $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$gestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado12 = $nroTrans->fetch_assoc();
        $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        $res = "";
        $glosa = "Registro glosa comercial";

        if($aux_asignacion['bandera'] == 1){ //-------------------------
            //REVISION
            $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,idasignacion_asiento,organizacion_idorganizacion,sucursal,idgestion)
        VALUE('-1','$fecha','0','0','$glosa','1','6','$tipotransaccion[tipo]','$idasignacion_asiento','$ide','$idsucursal','$gestion')");
        }else{
            // REGISTRA TRANSACCION DIRECTO
            $writetrans = $this->dbc->query("INSERT INTO transacciones(codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,idasignacion_asiento,organizacion_idorganizacion,sucursal,idgestion)
        VALUE('$nroTransaccion','$fecha','0','0','$glosa','1','1','$tipotransaccion[tipo]','$idasignacion_asiento','$ide','$idsucursal','$gestion')");
        }

        $idtrans = $this->dbc->insert_id;
    
        // $aux_asignacion['idasientotipo']
        
        $debe = 0; 
        $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo= '$aux_asignacion[idasientotipo]'");
            $orden = 1;
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $monto * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $monto * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta']; 
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe','$haber','$nota','$idtrans','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$sucursal','$orden')");

                $orden = $orden + 1;
            }

        if ($writetrans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "registrotransaccion",$monto,$fecha);
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde",$monto,$fecha);
        }
        echo json_encode($res);
    }

    public function listatransacciones_comercial($empresa,$todos)
    {
        $lista = [];
        // 
        $ide = $this->getidempresa($empresa);
        $getG = $this->getgestionactualC($empresa);
        $gestion = $getG['id'];
        if($todos == '0'){
            //LISTAR SOLO LOS QUE PERTENECEN A LA GESTION
              $registro = $this->dbc->query("SELECT
            t.idtransacciones,
            t.codigotransaccion,
            t.fechatransaccion,
            t.glosa,
            t.consolidar,
            t.tipotransaccion_idtipotransaccion,
            t.idgestion,
            t.estado,
            t.tipodecambio,
            t.idasignacion_asiento
        FROM
            transacciones as t
        WHERE
            t.organizacion_idorganizacion = '$ide'
            AND idgestion = '$gestion'
            AND t.estado = 6
        ORDER BY
            t.codigotransaccion DESC;");
        }else{
            // LISTAR TODOS SIN ECSEPCION
              $registro = $this->dbc->query("SELECT
            t.idtransacciones,
            t.codigotransaccion,
            t.fechatransaccion,
            t.glosa,
            t.consolidar,
            t.tipotransaccion_idtipotransaccion,
            t.idgestion,
            t.estado,
            t.tipodecambio,
            t.idasignacion_asiento
        FROM
            transacciones as t
        WHERE
            t.organizacion_idorganizacion = '$ide'
            AND t.estado = 6
        ORDER BY
            t.codigotransaccion DESC;");
        }
      
        while ($qwe = $this->dbc->fetch($registro)) {
            $asiento_asignacion = $this->dbc->query("SELECT * FROM asignacion_asiento_operacion_modulos WHERE idasignacion_asiento_operacion_modulos='" . $qwe[9] . "'");
            $asig = $this->dbc->fetch($asiento_asignacion);

            $operacion_modulo = $this->dbc->query("SELECT * FROM operacion_modulos WHERE idoperacion_modulos='$asig[idoperacion_modulos]'");
            $om = $this->dbc->fetch($operacion_modulo);

            $asientotipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$asig[idasientotipo]'");
            $at = $this->dbc->fetch($asientotipo);

            $tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='" . $qwe[5] . "'");
            $asd = $this->dbc->fetch($tt);
            // $detalle = [];

            // $transdeta = $this->dbc->query("select d.iddetalletransaccion,p.nombreplan,d.debe,d.haber,d.nota,d.estado,d.idorganizacion,d.idplandecuenta from detalletransaccion as d,plandecuenta as p where p.idplandecuenta=d.idplandecuenta and d.transacciones_idtransacciones='$qwe[0]'");
            // while ($qq = $this->dbc->fetch($transdeta)) {
            //     $ress = array("id" => $qq[0], "plan" => $qq[1], "debe" => $qq[2], "haber" => $qq[3], "nota" => $qq[4], "estado" => $qq[5], "idempresa" => $qq[6], "idplan" => $qq[7]);
            //     array_push($detalle, $ress);
            // }

            $res = array("id" => $qwe[0], "ntransaccion" => $qwe[1], "fecha" => $qwe[2], "glosa" => $qwe[3], "consolidar" => $qwe[4], "ttransaccion" => $asd['nombre'],"idtipotransaccion"=>$qwe[5], "gestion" => $qwe[6],"estado" => $qwe[7], "detalle" => $detalle, "tipocambio" => $qwe[8],"idasignacion_asiento" => $qwe[9],"nombre_modulo" => $om['nombre_modulo'],"nombre_operacion" => $om['nombre_operacion'],"nombre" => $at['nombre']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function insertar_detalle_transaccion_automatico($idplandecuenta,$ide){//10279, 50
        $lista=[];
        $registro=$this->dbc->query("SELECT i.idimpuesto, i.codigoimpuesto, i.nombreimpuesto, i.tasa, i.descripcion FROM impuesto AS i WHERE md5(i.idempresa)='$ide'");
        while($qwe=$this->dbc->fetch($registro)){
            $relacion=$this->dbc->query("SELECT * FROM relacionip WHERE idimpuesto='$qwe[0]'");
            $rel=$this->dbc->fetch($relacion);
            $plan = $this->getplandecuenta($rel['idplandecuenta']);

            $lista[]=[
                "idimpuesto"=>$qwe['idimpuesto'],
                "codigo"=>$qwe['codigoimpuesto'],
                "nombre"=>$qwe['nombreimpuesto'],
                "tasa"=>$qwe['tasa'],
                "descripcion"=>$qwe['descripcion'],
                "idrelacionip"=>$rel['idrelacionip'],
                "idplancuenta"=>$rel['idplandecuenta'],
                "plannumero" => $plan['numero'],
                "plancuenta" => $plan['nombreplan'],
                "plantipo" => $plan['saldonormal'],
                "fecha"=>$rel['fecha'],

            ];

        }

        echo json_encode($lista);

    }

                                                 // monto, idplandecuenta
    public function listar_detalle_trans_monto($monto, $idplandecuenta, $empresa)
    { //iddetalletransaccion,planCuenta, debe, haber.... , (iddetalleTrans o Nro_orden) 
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);

        $estado = 1;
        $ppresupuestario = 0;
        $res = "";

        $rel_ip = $this->dbc->query("SELECT * FROM relacionip WHERE idplandecuenta='$idplandecuenta' AND idempresa = '$ide'");

        $plan = $this->dbc->query("SELECT saldonormal FROM plandecuenta WHERE idplandecuenta='$idplandecuenta' AND organizacion_idorganizacion = '$ide'");
        $pdc = $plan->fetch_assoc();

        if ($rel_ip->num_rows > 0){ //EXISTE EL PLANDECUENTA EN LA VINCULACION row
            $vinculacion = $rel_ip->fetch_assoc();
            $impuesto = $this->dbc->query("SELECT * FROM impuesto WHERE idimpuesto='$vinculacion[idimpuesto]'");
            $im = $impuesto->fetch_assoc();
            
            if($pdc['saldonormal'] == "DEBE"){
                $debe = $monto * ($im['tasa'] / 100);
                $haber = 0;
            }else{
                $haber = $monto * ($im['tasa'] / 100);
                $debe = 0;
            }
            
        }else{ // NO HAY CUENTAS VINCULADAS CON IMMPUESTOS
            $debe = 0;
            $haber = 0;
        }
        $res = array("debe" => $debe, "haber" => $haber);
        // array_push($lista, $res);
   
        echo json_encode($res);
    }
    public function listar_registros_pendientes($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM divisa WHERE idempresa = '$idempresa' ORDER BY iddivisa DESC");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "iddivisa" => $qwe['iddivisa'],
                "simbolo" => $qwe['simbolo'],
                "nombre" => $qwe['nombre'],
                "estado" => $qwe['estado']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    } 

    public function registrar_detalle_transaccion_json($idtransaccion,$cuentas_json,$empresa,$sucursal) {

        $cuentas_array = json_decode($cuentas_json, true);

        // $lista = [];
        $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        // $idempresa = $this->getidempresa($empresa);
    
        foreach($cuentas_array as $cuenta){
        $listaUltimoDetalle = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' ORDER BY orden DESC LIMIT 1;");
        $ulti_registro = $listaUltimoDetalle->fetch_assoc();
        $nuevaOrden = $ulti_registro['orden'] + 1;

               $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
            VALUES ('$cuenta[debe]','$cuenta[haber]','-','$idtransaccion','$cuenta[idplan]','0','1','2','2','$ide','$idsucursal','$nuevaOrden')");
         
        }

        if ($crearDet_trans === TRUE) {
            $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal", $idtransaccion);
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
        // echo json_encode(array($idtransaccion,$cuentas_json,$cuentas_array)); existe_empresa_modulo existe_empresa_modulo

    } 

     public function registrar_cuenta_pre_cierre($fecha,$tipotransaccion,$empresa,$sucursal,$idgestion) {

        $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        // $gestion=$this->getidgestion($empresa);
        // $idempresa = $this->getidempresa($empresa);
        $existe_cuenta = $this->dbc->query("SELECT * FROM vinculacion_cuenta_xcxp WHERE cobrar_pagar ='3' AND idempresa = '$ide'");

        if($existe_cuenta->num_rows > 0){


        $control_consolidado = 0;
        $arre = [];
        //ANTES DE REGISTRAR TRANSACCION CONSOLIDAR TODAS LAS TRANSACCIONES-->SOLO CONSOLIDAR LOS Q ESTAN CUADRANDO SUS NUMEROS
        $transaccion = $this->dbc->query("SELECT * FROM transacciones WHERE idgestion ='$idgestion' AND consolidar = '1' AND codigotransaccion > '0' AND estado ='1'");

        if($transaccion->num_rows > 0){
            while($trans=$this->dbc->fetch($transaccion)){

            $detalle_transaccion = $this->dbc->query("SELECT SUM(debe) as debe_a,SUM(haber) as haber_a FROM detalletransaccion WHERE transacciones_idtransacciones ='$trans[idtransacciones]'");
            $sumas = $detalle_transaccion->fetch_assoc(); 

            $esVacio_detalle = $this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones ='$trans[idtransacciones]'");

            if($sumas['debe_a'] != $sumas['haber_a'] || $esVacio_detalle->num_rows == 0){
                   // Si alguna transacción no cuadra, cambiamos a 1 y salimos del bucle

                 $control_consolidado = 1; 
                //  $arre[] = $control_consolidado;
                break; //salida a la fuerza

            }
            
            }

        }else{
          //POSIBLEMENTE YA NO HAYA TRANSACCIONES QUE FALTEN CONSOLIDAR O ESTEN ANULADAS POR LO TANTO NO LOS TOMAMOS EN CUENTA
        }

         if($control_consolidado == 0){ //todas las transacciones si estan sus sumas iguales CUADRANDO


            $transaccion_2 = $this->dbc->query("SELECT * FROM transacciones WHERE idgestion ='$idgestion' AND consolidar = '1' AND codigotransaccion > '0' AND estado ='1'");
            while($trans_2=$this->dbc->fetch($transaccion_2)){
                $editar = $this->dbc->query("UPDATE transacciones SET consolidar = '2' WHERE idtransacciones ='$trans_2[idtransacciones]'");
            }

        // $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$idgestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        // $resultado12 = $nroTrans->fetch_assoc();
        // $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        // Construir rango dinámico (primer y último día del mes)
        $fecha_inicio = date("Y-m-01", strtotime($fecha)); // "2025-03-01"
        $fecha_fin    = date("Y-m-t", strtotime($fecha));  // "2025-03-31"

        // aqui la condicional si hay una nueva gestion

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$idgestion'");
        $gc = $gestion_sel->fetch_assoc();

        if($gc['formato_transaccion'] == 'por_tipo_mes') {
            $nroTransa = $this->dbc->query("SELECT *
            --  COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
            FROM transacciones
            WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
            and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
            AND idgestion = '$idgestion'
            AND organizacion_idorganizacion = '$ide'
            ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
            $nroTransa = $this->dbc->query("SELECT *
            -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones 
                WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
                AND idgestion = '$idgestion'
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } else { // POR_GESTION
        
            $nroTransa = $this->dbc->query("SELECT *
                FROM transacciones 
                WHERE organizacion_idorganizacion = '$ide'
                AND idgestion = '$idgestion'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

        if($fecha >= $resultado122['fechatransaccion']){ 
            //REGISTRAR TRANSACCION
            $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
            VALUE(NULL,'$nroTransaccion','$fecha', '1', '0', 'Registro de Precierre', '2','10', '$tipotransaccion', '$ide', '$idsucursal', '$idgestion')");

            $idtransaccion = $this->dbc->insert_id;

            $cuenta_vinculada = $this->dbc->query("SELECT * FROM vinculacion_cuenta_xcxp WHERE cobrar_pagar='3' AND idempresa ='$ide'");
            $vinculacion = $cuenta_vinculada->fetch_assoc();


                $cuenta_resultados = $this->dbc->query("SELECT p.idplandecuenta,p.numero,p.nombreplan,SUM(d.debe) as debe,SUM(d.haber) as haber,SUM(debe)-SUM(haber) as deudor,SUM(haber)-SUM(debe) as acreedor 
                FROM plandecuenta as p
                    INNER JOIN transacciones as t ON t.organizacion_idorganizacion='$ide'
                    INNER JOIN detalletransaccion as d ON d.idplandecuenta=p.idplandecuenta AND t.idtransacciones=d.transacciones_idtransacciones
                    WHERE p.organizacion_idorganizacion='$ide' AND p.numero>'4.0.0.00.00' AND p.numero<'7.0.0.00.00' AND t.idgestion='$idgestion'  
                    GROUP by p.nombreplan 
                    ORDER by p.numero ASC;");

                $orden_ultimo = 0;
            while($cr=$this->dbc->fetch($cuenta_resultados)){
            
            $listaUltimoDetalle = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' ORDER BY orden DESC LIMIT 1;");
            $ulti_registro = $listaUltimoDetalle->fetch_assoc();
            $nuevaOrden = $ulti_registro['orden'] + 1;
                // REGISTRAR DETALLE_TRANSACCION CON LA NUEVA CUENTA DE PRE_CIERRE
                $deudor = 0;
                $acreedor = 0;
                if($cr['deudor'] > 0){
                    $deudor = $cr['deudor'];
                }else{
                    $acreedor = $cr['acreedor'];
                }

                $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$acreedor','$deudor','-','$idtransaccion','$cr[idplandecuenta]','0','1','2','2','$ide','$idsucursal','$nuevaOrden')");

                $orden_ultimo = $nuevaOrden + 1;
            }

            $lista_ulti_transaccion = $this->dbc->query("SELECT SUM(debe) as debe,SUM(haber) as haber FROM detalletransaccion WHERE transacciones_idtransacciones ='$idtransaccion'");
            $sumas_nuevas = $lista_ulti_transaccion->fetch_assoc(); 

            $debe_nuevo =0;
            $haber_nuevo =0;

            if($sumas_nuevas['debe'] > $sumas_nuevas['haber']){
                $diferencia_sumas = $sumas_nuevas['debe'] - $sumas_nuevas['haber'];
                $haber_nuevo = $diferencia_sumas;
            }else{
                $diferencia_sumas = $sumas_nuevas['haber'] - $sumas_nuevas['debe'];
                $debe_nuevo = $diferencia_sumas;
            }
            $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe_nuevo','$haber_nuevo','-','$idtransaccion','$vinculacion[idplandecuenta]','0','1','2','2','$ide','$idsucursal','$orden_ultimo')");

            if ($crearDet_trans === TRUE) {

                $crear_cierre = $this->dbc->query("INSERT INTO cierre_transacciones(nombre_operacion,estado,idtransacciones,idgestion,idempresa)
                VALUES ('precierre','1','$idtransaccion','$idgestion','$ide')");

                $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
            } else {
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde","aa si entre a crear trans precierre pero falle a medio camino");
            }
        }else{
            $res = array("danger", "La fecha debe ser posterior al último registro realizado: ".$resultado122['fechatransaccion']);
        }
    }else{
            // NO SE PODRA HACER LA CONSOLIDACION MULTIPLE NI EL CIERRE
           
        $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde","mi numero aux es.$control_consolidado");

        }
    }else{
        $res = array("warning", "Usted previamente debe seleccionar la cuenta de Cierre de gestion");
    }
        echo json_encode($res);
    // echo json_encode(array($control_consolidado,$fecha,$empresa,$sucursal,$arre));
    } 

       public function registrar_cuenta_cierre($fecha,$tipotransaccion,$empresa,$sucursal,$idgestion) {

        $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        // $gestion=$this->getidgestion($empresa);
        // $idempresa = $this->getidempresa($empresa);

        $existe_cuenta = $this->dbc->query("SELECT * FROM vinculacion_cuenta_xcxp WHERE cobrar_pagar ='3' AND idempresa = '$ide'");

        if($existe_cuenta->num_rows > 0){

        $existe = $this->dbc->query("SELECT * FROM cierre_transacciones WHERE nombre_operacion = 'precierre' AND idempresa = '$ide' AND idgestion ='$idgestion'");

        if($existe->num_rows > 0){
            //se creara transaccion de cierre nada mas

            // $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$idgestion' ORDER BY codigotransaccion DESC LIMIT 1;");
            // $resultado12 = $nroTrans->fetch_assoc();
            // $nroTransaccion = $resultado12['codigotransaccion'] + 1;

            // Construir rango dinámico (primer y último día del mes)
        $fecha_inicio = date("Y-m-01", strtotime($fecha)); // "2025-03-01"
        $fecha_fin    = date("Y-m-t", strtotime($fecha));  // "2025-03-31"

        // aqui la condicional si hay una nueva gestion

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$idgestion'");
        $gc = $gestion_sel->fetch_assoc();

        if($gc['formato_transaccion'] == 'por_tipo_mes') {
            $nroTransa = $this->dbc->query("SELECT *
            --  COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
            FROM transacciones
            WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
            and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
            AND idgestion = '$idgestion'
            AND organizacion_idorganizacion = '$ide'
            ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
            $nroTransa = $this->dbc->query("SELECT *
            -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones 
                WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
                AND idgestion = '$idgestion'
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } else { // POR_GESTION
        
            $nroTransa = $this->dbc->query("SELECT *
                FROM transacciones 
                WHERE organizacion_idorganizacion = '$ide'
                AND idgestion = '$idgestion'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

        if($fecha >= $resultado122['fechatransaccion']){ 
            //REGISTRAR TRANSACCION
            $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
            VALUE(NULL,'$nroTransaccion','$fecha', '1', '0', 'Registro de Cierre', '2','10', '$tipotransaccion', '$ide', '$idsucursal', '$idgestion')");

            $idtransaccion = $this->dbc->insert_id;

            $cuenta_vinculada = $this->dbc->query("SELECT * FROM vinculacion_cuenta_xcxp WHERE cobrar_pagar='3' AND idempresa ='$ide'");
            $vinculacion = $cuenta_vinculada->fetch_assoc();


                $cuenta_resultados = $this->dbc->query("SELECT p.idplandecuenta,p.numero,p.nombreplan,SUM(d.debe) AS debe,SUM(d.haber) AS haber,SUM(debe)-SUM(haber) AS deudor,SUM(haber)-SUM(debe) AS acreedor FROM plandecuenta AS p
        INNER JOIN transacciones AS t ON t.organizacion_idorganizacion='$ide'
        INNER JOIN detalletransaccion AS d ON d.idplandecuenta=p.idplandecuenta AND t.idtransacciones=d.transacciones_idtransacciones
        WHERE p.organizacion_idorganizacion='$ide' AND p.numero<'4.0.0.00.00' AND t.idgestion='$idgestion' 
        GROUP by p.nombreplan 
        ORDER by p.numero ASC;");

                $orden_ultimo = 0;
            while($cr=$this->dbc->fetch($cuenta_resultados)){
            
            $listaUltimoDetalle = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' ORDER BY orden DESC LIMIT 1;");
            $ulti_registro = $listaUltimoDetalle->fetch_assoc();
            $nuevaOrden = $ulti_registro['orden'] + 1;
                // REGISTRAR DETALLE_TRANSACCION CON LA NUEVA CUENTA DE PRE_CIERRE
                $deudor = 0;
                $acreedor = 0;
                if($cr['deudor'] > 0){
                    $deudor = $cr['deudor'];
                }else{
                    $acreedor = $cr['acreedor'];
                }

                $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$acreedor','$deudor','-','$idtransaccion','$cr[idplandecuenta]','0','1','2','2','$ide','$idsucursal','$nuevaOrden')");

                $orden_ultimo = $nuevaOrden + 1;
            }

            $lista_ulti_transaccion = $this->dbc->query("SELECT SUM(debe) as debe,SUM(haber) as haber FROM detalletransaccion WHERE transacciones_idtransacciones ='$idtransaccion'");
            $sumas_nuevas = $lista_ulti_transaccion->fetch_assoc(); 

            $debe_nuevo =0;
            $haber_nuevo =0;

            if($sumas_nuevas['debe'] > $sumas_nuevas['haber']){
                $diferencia_sumas = $sumas_nuevas['debe'] - $sumas_nuevas['haber'];
                $haber_nuevo = $diferencia_sumas;
            }else{
                $diferencia_sumas = $sumas_nuevas['haber'] - $sumas_nuevas['debe'];
                $debe_nuevo = $diferencia_sumas;
            }
            $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe_nuevo','$haber_nuevo','-','$idtransaccion','$vinculacion[idplandecuenta]','0','1','2','2','$ide','$idsucursal','$orden_ultimo')");

            if ($crearDet_trans === TRUE) {

                $crear_cierre = $this->dbc->query("INSERT INTO cierre_transacciones(nombre_operacion,estado,idtransacciones,idgestion,idempresa)
                VALUES ('cierre','1','$idtransaccion','$idgestion','$ide')");

                $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
            } else {
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
            }
        }else{

            $res = array("danger", "La fecha debe ser posterior al último registro realizado: ".$resultado122['fechatransaccion']);
        }

        }else{
            // no se creara transaccion de cierre porque todavia no existe transaccion de precierre 
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");

        }
    }else{
        $res = array("warning", "Usted previamente debe seleccionar la cuenta de Cierre de gestion");

    }
        echo json_encode($res);
    } 

    public function registrar_cuenta_apertura($fecha,$tipotransaccion,$idgestion_anterior,$empresa,$sucursal,$idgestion) {

        $idsucursal = $this->getidsucursal($sucursal);
        $ide = $this->getidempresa($empresa);
        // $gestion=$this->getidgestion($empresa);
        // $idempresa = $this->getidempresa($empresa);

            //se creara transaccion de cierre nada mas

            // $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion=$ide AND idgestion='$idgestion' ORDER BY codigotransaccion DESC LIMIT 1;");
            // $resultado12 = $nroTrans->fetch_assoc();
            // $nroTransaccion = $resultado12['codigotransaccion'] + 1;

             // Construir rango dinámico (primer y último día del mes)
        $fecha_inicio = date("Y-m-01", strtotime($fecha)); // "2025-03-01"
        $fecha_fin    = date("Y-m-t", strtotime($fecha));  // "2025-03-31"

        // aqui la condicional si hay una nueva gestion

        $gestion_sel = $this->dbc->query("SELECT * FROM gestion WHERE idgestion='$idgestion'");
        $gc = $gestion_sel->fetch_assoc();

        if($gc['formato_transaccion'] == 'por_tipo_mes') {
            $nroTransa = $this->dbc->query("SELECT *
            --  COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
            FROM transacciones
            WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
            and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
            AND idgestion = '$idgestion'
            AND organizacion_idorganizacion = '$ide'
            ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        }elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
            $nroTransa = $this->dbc->query("SELECT *
            -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones 
                WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
                AND idgestion = '$idgestion'
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        } else { // POR_GESTION
        
            $nroTransa = $this->dbc->query("SELECT *
                FROM transacciones 
                WHERE organizacion_idorganizacion = '$ide'
                AND idgestion = '$idgestion'
                ORDER BY codigotransaccion DESC
                LIMIT 1
            ");
        }

        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

        // if($fecha >= $resultado122['fechatransaccion']){ 
            //REGISTRAR TRANSACCION
            if($nroTransaccion == 1){
                $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
            VALUE(NULL,'$nroTransaccion','$fecha', '1', '0', 'Registro de Apertura', '2','10', '$tipotransaccion', '$ide', '$idsucursal', '$idgestion')");

            }else{

                if($gc['formato_transaccion'] == 'por_tipo_mes') {
                $trans_recorrer = $this->dbc->query("SELECT *
                --  COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                FROM transacciones
                WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
                and fechatransaccion BETWEEN '$fecha_inicio' AND '$fecha_fin'
                AND idgestion = '$idgestion'
                AND organizacion_idorganizacion = '$ide'
                ORDER BY codigotransaccion ASC
                ");
            } elseif($gc['formato_transaccion'] == 'por_tipo_gestion') {
                $trans_recorrer = $this->dbc->query("SELECT *
                -- COALESCE(MAX(codigotransaccion), 0) + 1 AS siguiente
                    FROM transacciones 
                    WHERE tipotransaccion_idtipotransaccion = '$tipotransaccion'
                    AND idgestion = '$idgestion'
                    AND organizacion_idorganizacion = '$ide'
                    ORDER BY codigotransaccion ASC
                ");
            } else { // POR_GESTION
            
                $trans_recorrer = $this->dbc->query("SELECT *
                    FROM transacciones 
                    WHERE organizacion_idorganizacion = '$ide'
                    AND idgestion = '$idgestion'
                    ORDER BY codigotransaccion ASC
                ");
            }
                // $trans_recorrer = $this->dbc->query("SELECT * FROM transacciones WHERE organizacion_idorganizacion = '$ide' AND idgestion ='$idgestion'");
           
                while($mover=$this->dbc->fetch($trans_recorrer)){
                    $select_trans = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$mover[idtransacciones]'");
                    // $resultado15 = $select_trans->fetch_assoc();
                    $nroTransaccion_nuevo = $mover['codigotransaccion'] + 1;

                    $editar_trans = $this->dbc->query("UPDATE transacciones SET codigotransaccion = '$nroTransaccion_nuevo' WHERE idtransacciones = '$mover[idtransacciones]'");
                }     

                $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
                VALUE(NULL,'1','$fecha', '1', '0', 'Registro de Apertura', '2','10','$tipotransaccion', '$ide', '$idsucursal', '$idgestion')");

            }
            
            $idtransaccion = $this->dbc->insert_id;

            $trans_gest_ante = $this->dbc->query("SELECT * FROM cierre_transacciones WHERE nombre_operacion = 'cierre' AND idempresa = '$ide' AND idgestion ='$idgestion_anterior'");
            $trans_anterior = $trans_gest_ante->fetch_assoc();

            $detalle_trans_select = $this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$trans_anterior[idtransacciones]' AND idorganizacion ='$ide'");

            while($dts=$this->dbc->fetch($detalle_trans_select)){

                    $listaUltimoDetalle = $this->dbc->query("SELECT orden FROM detalletransaccion WHERE transacciones_idtransacciones='$idtransaccion' ORDER BY orden DESC LIMIT 1;");
                    $ulti_registro = $listaUltimoDetalle->fetch_assoc();
                    $nuevaOrden = $ulti_registro['orden'] + 1;

                    $crearDet_trans = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                    VALUES ('$dts[haber]','$dts[debe]','-','$idtransaccion','$dts[idplandecuenta]','0','1','2','2','$ide','$idsucursal','$nuevaOrden')");

            }

             if ($writetrans === TRUE) {

                $crear_cierre = $this->dbc->query("INSERT INTO cierre_transacciones(nombre_operacion,estado,idtransacciones,idgestion,idempresa)
                VALUES ('apertura','1','$idtransaccion','$idgestion','$ide')");

                $res = array("success", "Se Registro Correctamente", "detalletransaccionnormal");
            } else {
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
            }
        // }else{
        //     $res = array("danger", "La fecha debe ser posterior al último registro realizado: ".$resultado122['fechatransaccion']);
        // }

        echo json_encode($res);
    } 

    public function existe_apertura_pre_cierre($nombre_operacion,$empresa,$idgestion) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        // $gestion=$this->getidgestion($empresa);
        // Preparar la consulta
        $existe = $this->dbc->query("SELECT * FROM cierre_transacciones WHERE nombre_operacion = '$nombre_operacion' AND idempresa = '$idempresa' AND idgestion ='$idgestion'");
    
         // Verificar si hay resultados
        $respu = ($existe->num_rows > 0) ? "true" : "false";

        // Agregar la respuesta al array
        $lista[] = ["respuesta" => $respu];
    
        echo json_encode($lista);
    } 

      public function existe_cierre_de_gestion_anterior($empresa,$gestion) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        // $gestion=$this->getidgestion($empresa);
        // Preparar la consulta
        $gestion_actual = $this->dbc->query("SELECT * FROM gestion WHERE idgestion = '$gestion' AND idempresa = '$idempresa'");
        $ga = $gestion_actual->fetch_assoc();

        $existe_gest_ante = $this->dbc->query("SELECT * FROM gestion 
        WHERE idempresa = '$idempresa' AND YEAR(fechaini) = YEAR('$ga[fechaini]') - 1;");
        
        if($existe_gest_ante->num_rows > 0){

             $ega = $existe_gest_ante->fetch_assoc();

            $cierre_trans = $this->dbc->query("SELECT * FROM cierre_transacciones WHERE nombre_operacion = 'cierre'AND idgestion = '$ega[idgestion]' AND idempresa = '$idempresa'");

            // Verificar si hay resultados
            $respu = ($cierre_trans->num_rows > 0) ? "true" : "false";

            // Agregar la respuesta al array
            $lista[] = ["respuesta" => $respu,"idgestion" => $ega['idgestion']];
        }else{
            // Verificar si hay resultados
            $respu = "false";

            // Agregar la respuesta al array 
            $lista[] = ["respuesta" => $respu,"idgestion" => '0'];
        }
       
    
        echo json_encode($lista);
    } 

    public function getidgestion($md5){
        $registro=$this->dbc->query("select * from gestion where md5(idempresa)='$md5' and estado='2'");
        $qwe=$this->dbc->fetch($registro);
        return $qwe['idgestion'];

    }

    public function existe_empresa_modulo($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion='$idempresa'");
        
        // Verificar si hay resultados
        $respu = ($getPedido->num_rows > 0) ? "true" : "false";

        // Agregar la respuesta al array
        $lista[] = ["respuesta" => $respu];

        echo json_encode($lista);
    }
    public function consolidacion_multiple($transacciones) {

        $transaccion_array = json_decode($transacciones, true);

        foreach($transaccion_array as $trans){
            if($trans['estado'] == 1 && $trans['consolidar'] == 1){
                //consolidar
                $editar_trans = $this->dbc->query("UPDATE transacciones SET consolidar = '2' WHERE idtransacciones = '$trans[idtransacciones]'");

            }else{
                //saltar
            }
        }

        $res = array("success", "Se realizo las Consolidaciones Correctamente", "detalletransaccionnormal");

        echo json_encode($res);
        // echo json_encode(array($transacciones,$transaccion_array));
    }  
    public function lista_plande_subcuentas($empresa)
    {
        $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,organizacion_idorganizacion,idp,idagrupacion_rubro_plandecuenta FROM plandecuenta WHERE organizacion_idorganizacion='$ide' ORDER BY numero ASC");
        while ($qwe = $this->dbc->fetch($registro)) {

            $array_codigo = explode(".", $qwe[1]); 
            $aux = $this->dbc->query("SELECT nombreplan FROM plandecuenta WHERE numero >= $array_codigo[0] LIMIT 1");
            $name_plan = $aux->fetch_assoc();

            if($array_codigo[4] == '00' && $array_codigo[3] != '00'){ // 1.1.1.01.00
                $pl_cuenta_padre = $this->dbc->query("SELECT * FROM plandecuenta WHERE idp = $qwe[0]");

                if($pl_cuenta_padre->num_rows > 0){
                    //no muestras la cuenta porque tiene una subcuenta mas
                }else{
                    $res = array("id" => $qwe[0], "numero" => $qwe[1], "plan" => $qwe[2], "descripcion" => $qwe[3], "rubro" => $name_plan['nombreplan'], "tipo" => $qwe[4], "consolidar" => $qwe[5], "empresa" => $qwe[6], "idp" => $qwe[7],"idagrupacion_rubro_plandecuenta" => $qwe[8]);
                    array_push($lista, $res);
                }


            }elseif($array_codigo[4] != '00' && $array_codigo[3] != '00'){ // 1.1.1.01.01
                $res = array("id" => $qwe[0], "numero" => $qwe[1], "plan" => $qwe[2], "descripcion" => $qwe[3], "rubro" => $name_plan['nombreplan'], "tipo" => $qwe[4], "consolidar" => $qwe[5], "empresa" => $qwe[6], "idp" => $qwe[7],"idagrupacion_rubro_plandecuenta" => $qwe[8]);
                array_push($lista, $res);
            }else{
                //no listara la cuenta porque solo tiene hasta el 3er nivel 1.1.1.00.00
            }
            
            // array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function lista_plande_subcuentas_final($codigo_ini,$empresa)
    {
        $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("SELECT idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,organizacion_idorganizacion,idp,idagrupacion_rubro_plandecuenta FROM plandecuenta WHERE numero >= '$codigo_ini' AND organizacion_idorganizacion='$ide' ORDER BY numero ASC");
        while ($qwe = $this->dbc->fetch($registro)) {

            $array_codigo = explode(".", $qwe[1]); 
            $aux = $this->dbc->query("SELECT nombreplan FROM plandecuenta WHERE numero >= $array_codigo[0] LIMIT 1");
            $name_plan = $aux->fetch_assoc();

            if($array_codigo[4] == '00' && $array_codigo[3] != '00'){ // 1.1.1.01.00
                $pl_cuenta_padre = $this->dbc->query("SELECT * FROM plandecuenta WHERE idp = $qwe[0]");

                if($pl_cuenta_padre->num_rows > 0){
                    //no muestras la cuenta porque tiene una subcuenta mas
                }else{
                    $res = array("id" => $qwe[0], "numero" => $qwe[1], "plan" => $qwe[2], "descripcion" => $qwe[3], "rubro" => $name_plan['nombreplan'], "tipo" => $qwe[4], "consolidar" => $qwe[5], "empresa" => $qwe[6], "idp" => $qwe[7],"idagrupacion_rubro_plandecuenta" => $qwe[8]);
                    array_push($lista, $res);
                }


            }elseif($array_codigo[4] != '00' && $array_codigo[3] != '00'){ // 1.1.1.01.01
                $res = array("id" => $qwe[0], "numero" => $qwe[1], "plan" => $qwe[2], "descripcion" => $qwe[3], "rubro" => $name_plan['nombreplan'], "tipo" => $qwe[4], "consolidar" => $qwe[5], "empresa" => $qwe[6], "idp" => $qwe[7],"idagrupacion_rubro_plandecuenta" => $qwe[8]);
                array_push($lista, $res);
            }else{
                //no listara la cuenta porque solo tiene hasta el 3er nivel 1.1.1.00.00
            }
            
            // array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function lista_padres_plandecuentas($idplandecuenta)
{
    $lista = [];
    $plancuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta='$idplandecuenta'");
    $pl_cuenta = $plancuenta->fetch_assoc();

    $array_codigo = explode(".", $pl_cuenta['numero']); // Ej: [1,1,1,02,01]
    $cantidad = count($array_codigo);

    // Generar padres hasta el penúltimo nivel
    for ($i = 0; $i < $cantidad - 1; $i++) {
        $nuevo_codigo = [];

        // Mantener los valores hasta el índice actual
        for ($j = 0; $j <= $i; $j++) {
            $nuevo_codigo[] = $array_codigo[$j];
        }

        // Reemplazar los siguientes con ceros
        for ($j = $i + 1; $j < $cantidad; $j++) {
            $nuevo_codigo[] = ($j >= 3) ? "00" : "0";
        }

        // Verificar que el número generado sea diferente al original
        $codigo_generado = implode(".", $nuevo_codigo);
        if ($codigo_generado !== $pl_cuenta['numero']) {
            $consu_pl = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero ='$codigo_generado' 
            AND organizacion_idorganizacion ='$pl_cuenta[organizacion_idorganizacion]'");
            $aux_pl_c = $consu_pl->fetch_assoc();

            $lista[] = ["numero" => $codigo_generado, "nombre" => $aux_pl_c['nombreplan']];
        }
    }

    echo json_encode($lista);
}

public function asignar_facturas_A_cuentas($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        // $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $gestion = $this->getgestionactualid($idempresa);
        $montoFacturas = 0;

        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
        $dt = $detalle_trans->fetch_assoc();

            foreach ($data['facturas'] as $factura) {
                $montoFacturas += $factura['monto'];
            }
                        
        // $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
        // $dt = $detalle_trans->fetch_assoc(); cobrofacturasaasientomodelo

        if($data['sumar_reemplazar'] == 'suma'){ // SUMAR
            if($dt['debe'] > 0){
                $nuevo_monto_dt = $dt['debe'] + $montoFacturas;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $dt['haber'] + $montoFacturas;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }
    elseif ($data['sumar_reemplazar'] === 'reemplazo') { // REEMPLAZAR

        // desvincular todos los documentos de esta cuenta
            $desv_recibo = $this->dbc->query("UPDATE recibo SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_factura = $this->dbc->query("UPDATE factura SET cuenta = '0',transacciones_idtransacciones = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_cobr = $this->dbc->query("UPDATE cuentaspof SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_pag = $this->dbc->query("UPDATE cuentaspor SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comer = $this->dbc->query("DELETE FROM transaccion_documentos_comercial WHERE cuenta = '$data[cuenta]'");

        // Actualizar detalletransaccion según debe/haber
        $nuevo_monto_dt = $montoFacturas;
        if ($dt['debe'] > 0) {
            $editar_dt = $this->dbc->query("
                UPDATE detalletransaccion 
                SET debe = '$nuevo_monto_dt' 
                WHERE iddetalletransaccion = '{$data['cuenta']}'");
        } else {
            $editar_dt = $this->dbc->query("
                UPDATE detalletransaccion 
                SET haber = '$nuevo_monto_dt' 
                WHERE iddetalletransaccion = '{$data['cuenta']}'
            ");
        }
    }else{ // SOLO VINCULARA NADA MAS

        }
   
        //VINCULAR FACTURAS
        foreach ($data['facturas'] as $factura) {

                // $montoFacturas += $factura['monto'];
                $updatetranscodigo = $this->dbc->query("UPDATE factura SET cuenta = '$data[cuenta]',transacciones_idtransacciones = '$dt[transacciones_idtransacciones]'  
                WHERE idfactura = '{$factura['idfactura']}'");

                if($factura['tipo_factura'] == 'contado'){ // ES AL CONTADO
                    // VINCULAMOS EL COMPROBANTE MAS

                    if($factura['documento_cobro_pago'] == 'factura_cobro'){ // FACTURA COBRO
                        $editar_comprobnte = $this->dbc->query("UPDATE cuentaspof SET cuenta = '$data[cuenta]',transaccion = '$dt[transacciones_idtransacciones]'  
                        WHERE idfactura = '{$factura['idfactura']}'");
                    }else{ // FACTURA PAGO 
                        $editar_comprobnte = $this->dbc->query("UPDATE cuentaspor SET cuenta = '$data[cuenta]',transaccion = '$dt[transacciones_idtransacciones]'  
                        WHERE idfactura = '{$factura['idfactura']}'");
                    }
                }else{ // ES A CREDITO
                    // No vincularemos comprobante
                }
        }
        
        // Respuesta
        if ($updatetranscodigo === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['sumar_reemplazar'],$data['cuenta'],$dt['transacciones_idtransacciones'],$nuevo_monto_dt,$dt['debe'],$dt['haber'],$data['facturas']);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
        
        // echo json_encode(array($data['sumar_reemplazar'],$data['cuenta'],$montoFacturas));
    }

    public function asignar_recibos_A_cuentas($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        // $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $gestion = $this->getgestionactualid($idempresa);
        $montoRecibos = 0;

        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
        $dt = $detalle_trans->fetch_assoc();

        // $ids_vinculados = [];

        // $es_cobro = "";
        foreach ($data['recibos'] as $recibo) {
            $montoRecibos += $recibo['monto'];
        }

        if ($data['sumar_reemplazar'] == 'suma') {
            if ($dt['debe'] > 0) {
                $nuevo_monto_dt = $dt['debe'] + $montoRecibos;
                $editar_dt = $this->dbc->query("
                    UPDATE detalletransaccion 
                    SET debe = '$nuevo_monto_dt' 
                    WHERE iddetalletransaccion = '$data[cuenta]'
                ");
            } else {
                $nuevo_monto_dt = $dt['haber'] + $montoRecibos;
                $editar_dt = $this->dbc->query("
                    UPDATE detalletransaccion 
                    SET haber = '$nuevo_monto_dt' 
                    WHERE iddetalletransaccion = '$data[cuenta]'
                ");
            }
        }elseif($data['sumar_reemplazar'] == 'reemplazo'){ // REEMPLAZAR

        // desvincular todos los documentos de esta cuenta
            $desv_recibo = $this->dbc->query("UPDATE recibo SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_factura = $this->dbc->query("UPDATE factura SET cuenta = '0',transacciones_idtransacciones = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_cobr = $this->dbc->query("UPDATE cuentaspof SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_pag = $this->dbc->query("UPDATE cuentaspor SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comer = $this->dbc->query("DELETE FROM transaccion_documentos_comercial WHERE cuenta = '$data[cuenta]'");
            
            if($dt['debe'] > 0){
                $nuevo_monto_dt = $montoRecibos;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $montoRecibos;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }else{
            // SOLO VINCULARA
        }

        
        foreach ($data['recibos'] as $recibo) {

            $updatetranscodigo = $this->dbc->query("UPDATE recibo 
                SET cuenta = '$data[cuenta]', transaccion = '$dt[transacciones_idtransacciones]'  
                WHERE idrecibo = '{$recibo['idrecibo']}'
            ");

            $recib_dats = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo = '$recibo[idrecibo]'");
            $rec = $recib_dats->fetch_assoc();

            if($rec['cobrado'] != 0){
                $vincular_comprobante = $this->dbc->query("UPDATE cuentaspof 
                SET cuenta = '$data[cuenta]', transaccion = '$dt[transacciones_idtransacciones]'  
                WHERE idrecibo = '{$recibo['idrecibo']}'
            ");
        
            }else{
                $vincular_comprobante = $this->dbc->query("UPDATE cuentaspor 
                SET cuenta = '$data[cuenta]', transaccion = '$dt[transacciones_idtransacciones]'  
                WHERE idrecibo = '{$recibo['idrecibo']}'
            ");
            
            }
        }

        // Respuesta
        if ($updatetranscodigo === TRUE) {
            $res = array("success", "Se Registro Correctamente", "asignar_facturas_A_cuentas",$data['cuenta'],$dt['transacciones_idtransacciones'],$nuevo_monto_dt,$dt['debe'],$dt['haber']);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
    public function registrotransaccion_por_asiento($fecha,$idasiento,$monto,$glosa,$empresa,$sucursal,$idgestion)
    {
        // echo json_encode(array("hola",$fecha,$idasiento,$monto,$empresa,$sucursal));
        $ndocumento = "0";
        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        // $gestion = $this->getgestionactualC($empresa);
        // $idgestion = $gestion["id"];
        $res = "";
        // aqui la condicional si hay una nueva gestion

        $nroTransa = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion='$ide' AND idgestion='$idgestion' ORDER BY codigotransaccion DESC LIMIT 1;");
        $resultado122 = $nroTransa->fetch_assoc();
        $nroTransaccion = $resultado122['codigotransaccion'] + 1;

        // echo json_encode(array($fecha, $tipocambio, $tipotransaccion, $glosa, $empresa,$ide, $sucursal,$ufv,$dolar,$idgestion,$nroTransaccion,$resultado122['codigotransaccion']));

        $asiento_tipo = $this->dbc->query("SELECT * FROM asientotipo WHERE idasientotipo='$idasiento'");
        $at = $asiento_tipo->fetch_assoc();

        $tipo_trans = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion='$at[tipo]'");
        $tt = $tipo_trans->fetch_assoc();

        $tipo_cambio = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion='$ide' AND fecha='$fecha'");

        if($tipo_cambio->num_rows > 0){
            $tc = $tipo_cambio->fetch_assoc();
    
            // EXISTE TIPO DE CAMBIO PARA LA FECHA DE HOY O SE SELECCIONARA UNA Q YA EXISTE
            $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
        VALUE(NULL,'$nroTransaccion','$fecha','$tc[idtipodecambio]','$ndocumento','$glosa','1','1','$tt[idtipotransaccion]','$ide','$idsucursal','$idgestion')");

        $idtransaccion = $this->dbc->insert_id;

        }else{ //PONER EL ULTIMO TIPO DE CAMBIO REGISTRADO

            $tipo_cambio_ult = $this->dbc->query("SELECT * FROM tipodecambio WHERE idorganizacion='$ide' ORDER BY idtipodecambio DESC LIMIT 1");
            $tcu = $tipo_cambio_ult->fetch_assoc();

            $idtipo_cambio = $this->dbc->insert_id;   
        
        $writetrans = $this->dbc->query("INSERT INTO transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,estado,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)
        VALUE(NULL,'$nroTransaccion','$fecha','$tcu[idtipodecambio]','$ndocumento','$glosa','1','1','$tt[idtipotransaccion]','$ide','$idsucursal','$idgestion')");

        $idtransaccion = $this->dbc->insert_id;
        }
        

        if ($writetrans === TRUE) {
            //CREAMOS EL ASIENTO DE LA TRANSACCION
            $debe = 0;
            $haber = 0;
            $tasiento = $this->dbc->query("SELECT * FROM asiento WHERE idasientotipo='$idasiento'");
            $orden = 1;
            while ($qwe = $this->dbc->fetch($tasiento)) {
                $pcuenta = $qwe['idcuenta'];
                if ($qwe['tipo'] == "DEBE") {
                    $debe = $monto * ($qwe['porciento'] / 100);
                    $haber = 0;
                } elseif ($qwe['tipo'] == "HABER") {
                    $debe = 0;
                    $haber = $monto * ($qwe['porciento'] / 100);
                }
                //$pcuenta=$_POST['plandecuenta'];
                $ppresupuestario = 0; //$_POST['planpresupuestario'];
                $nota = "-";
                $estado = 1; //$_POST['estado'];
                $crear = $this->dbc->query("INSERT INTO detalletransaccion(debe,haber,nota,transacciones_idtransacciones,idplandecuenta,idcuentapresupuestaria,estado,cobrar,pagar,idorganizacion,idsucursal,orden)
                VALUES ('$debe','$haber','$nota','$idtransaccion','$pcuenta','$ppresupuestario','$estado','2','2','$ide','$idsucursal','$orden')");
                $orden = $orden + 1;
            }

            $res = array("success", "Se Registro Correctamente", "registrotransaccion");
        } else {
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($res);
    }

    public function asignar_comprobantes_A_cuentas($data) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        // $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
        $dt = $detalle_trans->fetch_assoc();

        $gestion = $this->getgestionactualid($idempresa);
        $montoComprobantes = 0;
        $ids_vinculados = [];
        
            foreach ($data['comprobantes'] as $comprobante) {
                $montoComprobantes += $comprobante['monto'];
            }

        if($data['sumar_reemplazar'] == 'suma'){ // SUMAR
            if($dt['debe'] > 0){
                $nuevo_monto_dt = $dt['debe'] + $montoComprobantes;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $dt['haber'] + $montoComprobantes;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }elseif($data['sumar_reemplazar'] == 'reemplazo'){ // REEMPLAZAR

        // desvincular todos los documentos de esta cuenta
            $desv_recibo = $this->dbc->query("UPDATE recibo SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_factura = $this->dbc->query("UPDATE factura SET cuenta = '0',transacciones_idtransacciones = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_cobr = $this->dbc->query("UPDATE cuentaspof SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comprob_pag = $this->dbc->query("UPDATE cuentaspor SET cuenta = '0',transaccion = '0' WHERE cuenta = '$data[cuenta]'");
            $desv_comer = $this->dbc->query("DELETE FROM transaccion_documentos_comercial WHERE cuenta = '$data[cuenta]'");
            
            if($dt['debe'] > 0){
                $nuevo_monto_dt = $montoComprobantes;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }else{
                $nuevo_monto_dt = $montoComprobantes;
                $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
            }
        }else{
            // SOLO VINCULARA
        }

        foreach ($data['comprobantes'] as $comprobante) {

            if($comprobante['tipo_comprobante'] == 'venta'){ // COMPROBANTE COBROOO

                $compr_list = $this->dbc->query("SELECT * FROM cuentaspof WHERE idcuentaspof = '$comprobante[idcomprobante]'");
                $lc = $compr_list->fetch_assoc();

                $fac_list = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$lc[idfactura]'");
                $fac = $fac_list->fetch_assoc();

                if($fac['tipo_factura'] == 'contado'){
                    $updatetranscodigo = $this->dbc->query("UPDATE factura SET cuenta = '$data[cuenta]', transacciones_idtransacciones = '$dt[transacciones_idtransacciones]' 
                    WHERE idfactura = '{$fac['idfactura']}'");
                }else{
                    // NO SE VINCULARA LA FACTURA
                }
                $updatetranscodigo = $this->dbc->query("UPDATE cuentaspof SET cuenta = '$data[cuenta]', transaccion = '$dt[transacciones_idtransacciones]' 
                WHERE idcuentaspof = '{$comprobante['idcomprobante']}'");
                    
            }else{ // COMPROBANTE PAGOOOO
                $compr_list = $this->dbc->query("SELECT * FROM cuentaspor WHERE idcuentaspor = '$comprobante[idcomprobante]'");
                $lc = $compr_list->fetch_assoc();

                $fac_list = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$lc[idfactura]'");
                $fac = $fac_list->fetch_assoc();

                if($fac['tipo_factura'] == 'contado'){
                    $updatetranscodigo = $this->dbc->query("UPDATE factura SET cuenta = '$data[cuenta]', transacciones_idtransacciones = '$dt[transacciones_idtransacciones]' 
                    WHERE idfactura = '{$fac['idfactura']}'");
                }else{
                    // NO SE VINCULARA LA FACTURA
                }

                $updatetranscodigo = $this->dbc->query("UPDATE cuentaspor SET cuenta = '$data[cuenta]', transaccion = '$dt[transacciones_idtransacciones]' 
                WHERE idcuentaspor = '{$comprobante['idcomprobante']}'");
                                  
            }
        }

        // Respuesta
        if ($updatetranscodigo === TRUE) {
            $res = array("success", "Se Registro Correctamente", "cobrofacturasaasientomodelo","hola",$data['cuenta'],$data['comprobantes'],$data);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
    
    public function desvincular_facturas_comercial_de_transaccion($data) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
            foreach ($data['facturas_comercial'] as $factura) {

                // $montoFacturas += $factura['monto'];
                $updatetranscodigo = $this->dbc->query("DELETE FROM transaccion_documentos_comercial WHERE id_documento = '{$factura['idfactura_comercial']}' AND registro_desde ='contado_venta_comercial'");

            }
   
        // Respuesta
        if ($updatetranscodigo === TRUE) {
            $res = array("success", "Desvinculacion exitosa", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde",$factura['idfactura_comercial']);
        }
    
        echo json_encode($res);
    }
    public function desvincular_documentos_de_cuenta($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
    
        $idempresa = $this->getidempresa($data['idempresa']);
        // $idsucursal = $this->getidsucursal($data['idsucursal']); 
        $gestion = $this->getgestionactualid($idempresa);
        $monto_documento = 0;
            foreach ($data['documentos'] as $docu) {

                if($docu['tipo'] == 'factura_contabilidad'){

                    if($docu['tipo_documento'] == 'contado'){
                        // se desvinculara el comprobante mas
                        if($docu['documento_cobro_pago'] == 'factura_cobro'){
                            $editar_comprobante = $this->dbc->query("UPDATE cuentaspof 
                            SET cuenta = '0', transaccion = '0' WHERE idfactura = '{$docu['id']}'");
                        }else{ // factura_pago
                            $editar_comprobante = $this->dbc->query("UPDATE cuentaspor 
                            SET cuenta = '0', transaccion = '0' WHERE idfactura = '{$docu['id']}'");
                        }
                    }else{ 
                        // no pasara nada ya que solo se desvinculara la factura
                    }
                    $monto_documento += $docu['monto'];
                    $updatetranscodigo = $this->dbc->query("UPDATE factura SET cuenta = '0', transacciones_idtransacciones = '0' WHERE idfactura = '{$docu['id']}'");

                }elseif($docu['tipo'] == 'factura_comercial'){


                    $monto_documento += $docu['monto'];
                    $updatetranscodigo = $this->dbc->query("UPDATE transaccion_documentos_comercial SET cuenta = '0' WHERE id_documento = '{$docu['id']}' AND registro_desde ='contado_venta_comercial'");
                }elseif($docu['tipo'] == 'cobro_venta_comercial'){


                    $monto_documento += $docu['monto'];
                    $updatetranscodigo = $this->dbc->query("UPDATE transaccion_documentos_comercial SET cuenta = '0' WHERE id_documento = '{$docu['id']}' AND registro_desde ='cobro_venta_comercial'");
                }elseif($docu['tipo'] == 'comprobante de cobro'){

                    $monto_documento += $docu['monto'];
                    $updatetranscodigo = $this->dbc->query("UPDATE cuentaspof SET cuenta = '0' WHERE idcuentaspof = '{$docu['id']}'");
                }elseif($docu['tipo'] == 'comprobante de pago'){

                    $monto_documento += $docu['monto'];
                    $updatetranscodigo = $this->dbc->query("UPDATE cuentaspor SET cuenta = '0' WHERE idcuentaspor = '{$docu['id']}'");
                }elseif($docu['tipo'] == 'recibo'){

                     // se desvinculara el comprobante mas
                        if($docu['documento_cobro_pago'] == 'recibo_cobro'){
                            $editar_comprobante = $this->dbc->query("UPDATE cuentaspof 
                            SET cuenta = '0', transaccion = '0' WHERE idrecibo = '{$docu['id']}'");
                        }else{ // recibo_pago
                            $editar_comprobante = $this->dbc->query("UPDATE cuentaspor 
                            SET cuenta = '0', transaccion = '0' WHERE idrecibo = '{$docu['id']}'");
                        }

                    $monto_documento += $docu['monto'];
                    $updatetranscodigo = $this->dbc->query("UPDATE recibo SET cuenta = '0', transaccion = '0'
                    WHERE idrecibo = '{$docu['id']}'");
                }

            }
                        
        // $detalle_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE iddetalletransaccion = '$data[cuenta]'");
        // $dt = $detalle_trans->fetch_assoc();

        //     if($dt['debe'] > 0){
        //         $nuevo_monto_dt = $dt['debe'] - $monto_documento;
        //         $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET debe = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
        //     }else{
        //         $nuevo_monto_dt = $dt['haber'] - $monto_documento;
        //         $editar_dt = $this->dbc->query("UPDATE detalletransaccion SET haber = '$nuevo_monto_dt' WHERE iddetalletransaccion = '$data[cuenta]'");
        //     }
   
        // Respuesta
        if ($updatetranscodigo === TRUE) {
            $res = array("success", "Se desvinculo Correctamente", "cobrofacturasaasientomodelo",$data['documentos']);
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
    public function desvincular_facturas_contabilidad_de_transaccion($data) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);

            foreach ($data['facturas_contabilidad'] as $factura) {

                $consulta_factura = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '{$factura['idfactura']}'");
                $cf = $consulta_factura->fetch_assoc();
                
                if($cf['tipo_factura'] == "contado"){
                    // DESVINCULAR SUS COMPROBANTES TAMBIEN

                    $update_factura = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '0', cuenta ='0' WHERE idfactura = '{$factura['idfactura']}'");

                    $update_comprobante_p = $this->dbc->query("UPDATE cuentaspof SET transaccion = '0', cuenta ='0' WHERE idfactura = '{$factura['idfactura']}'");
                    $update_comprobante_c = $this->dbc->query("UPDATE cuentaspor SET transaccion = '0', cuenta ='0' WHERE idfactura = '{$factura['idfactura']}'");
                }else{
                    // DESVINCULAR SOLO LA FACTURA
                    $update_factura = $this->dbc->query("UPDATE factura SET transacciones_idtransacciones = '0', cuenta ='0' WHERE idfactura = '{$factura['idfactura']}'");
                }
                // $montoFacturas += $factura['monto'];
                

            }
   
        // Respuesta
        if ($update_factura === TRUE) {
            $res = array("success", "Desvinculacion exitosa", "cobrofacturasaasientomodelo");
        } else {
            $res = array("danger", "Lo siento hubo un problema, por favor vuelva a intentar más tarde");
        }
    
        echo json_encode($res);
    }
    
}