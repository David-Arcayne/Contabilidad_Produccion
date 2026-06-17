<?php
session_start();
//require_once "db.php";  
require_once "../../db/db.php";
class Admin extends DB
{

    public function creartipoasiento($nombre, $detalle, $empresa)
    {
        // // Obtener el ID de la empresa 
        // $ide = $this->getidempresa($empresa);

        // // Preparar la consulta SQL
        // $stmt = $this->dbc->prepare("INSERT INTO tipotransaccion (nombre, detalle, idempresa) VALUES (?, ?, ?)");

       $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipotransaccion WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {

            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$idempresa'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$idempresa'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();

                $registro_empr_vinc = $this->dbc->query("INSERT INTO tipotransaccion(nombre,detalle,idempresa) 
                VALUES ('$nombre','$detalle','$ve[idempresa_vinculada]')");

                $registro_empr_act = $this->dbc->query("INSERT INTO tipotransaccion(nombre,detalle,idempresa) 
                VALUES ('$nombre','$detalle','$idempresa')");

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $registro_empr_act = $this->dbc->query("INSERT INTO tipotransaccion(nombre,detalle,idempresa) 
                VALUES ('$nombre','$detalle','$ve[idempresa_actual]')");

                $registro_empr_vinc = $this->dbc->query("INSERT INTO tipotransaccion(nombre,detalle,idempresa) 
                VALUES ('$nombre','$detalle','$idempresa')");

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $registro_empr_act = $this->dbc->query("INSERT INTO tipotransaccion(nombre,detalle,idempresa) 
                VALUES ('$nombre','$detalle','$idempresa')");
            }

            if ($registro_empr_act === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","creartipoasiento");
            } else {
                $res = array("danger", "No se pudo registrar",$nombre);
            }
        }
        echo json_encode($res);
    }

    public function creartipoasientof5($id, $nombre, $detalle,$empresa)
    {

        $ide = $this->getidempresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipotransaccion WHERE nombre = '$nombre' AND idempresa = '$ide' AND idtipotransaccion != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
        }else {
            $nombre_tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion = '$id'");
            $ntt = $nombre_tt->fetch_assoc();

            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();

                $edit_tc_otra_empre = $this->dbc->query("UPDATE tipotransaccion SET nombre='$nombre',detalle='$detalle' WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_vinculada]'");
                $edit_tc = $this->dbc->query("UPDATE tipotransaccion SET nombre='$nombre',detalle='$detalle' WHERE idtipotransaccion='$id'");

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $edit_tc_otra_empre = $this->dbc->query("UPDATE tipotransaccion SET nombre='$nombre',detalle='$detalle' WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_actual]'");
                $edit_tc = $this->dbc->query("UPDATE tipotransaccion SET nombre='$nombre',detalle='$detalle' WHERE idtipotransaccion='$id'");

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $edit_tc = $this->dbc->query("UPDATE tipotransaccion SET nombre='$nombre',detalle='$detalle' WHERE idtipotransaccion='$id'");
            }

            if ($edit_tc === TRUE) {
                $res = array("success", "Se registro Correctamente", "registrotipocambiof5");
            } else {
                $res = array("danger", "No se pudo realizar el registro");
            }
        }
        echo json_encode($res);
        
    }

    public function creartipoasientodelete($id,$empresa)
    {
        $ide = $this->getidempresa($empresa);
        $this->dbc->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'asientotipo', 'campo' => 'tipo', 'mensaje' => 'No se puede eliminar, se esta usando en asientotipo'],
                ['tabla' => 'transacciones', 'campo' => 'tipotransaccion_idtipotransaccion', 'mensaje' => 'No se puede eliminar,se esta usando en transacciones']
                // ['tabla' => 'asiento', 'campo' => 'idcuenta', 'mensaje' => 'No se puede eliminar'],
                // ['tabla' => 'vinculacion_cuenta_xcxp ', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar'],
                // ['tabla' => 'relacionip', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar']
            ];
    
            foreach ($relacionadas as $relacion) {
                $query = "SELECT 1 FROM {$relacion['tabla']} WHERE {$relacion['campo']} = $id";
                $result = $this->dbc->query($query);
                if ($result->num_rows > 0) {
                    throw new Exception($relacion['mensaje']);
                }
            }
    
            $nombre_tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion = '$id'");
            $ntt = $nombre_tt->fetch_assoc();

            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();

                $tt_auxiliar = $this->dbc->query("SELECT * FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_vinculada]'");
                $tt_aux = $tt_auxiliar->fetch_assoc();

                $existe_en_trans = $this->dbc->query("SELECT * FROM transacciones WHERE tipotransaccion_idtipotransaccion='$tt_aux[idtipotransaccion]'");

                if($existe_en_trans->num_rows > 0){
                    
                    $se_pudo_eliminar =FALSE;
                    
                }else{
                    $query_1 = "DELETE FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_vinculada]'";
                    $this->dbc->query($query_1);

                    $query_2 = "DELETE FROM tipotransaccion WHERE idtipotransaccion = $id";
                    $this->dbc->query($query_2);

                    $se_pudo_eliminar =TRUE;
                }

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $tt_auxiliar = $this->dbc->query("SELECT * FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_actual]'");
                $tt_aux = $tt_auxiliar->fetch_assoc();

                $existe_en_trans = $this->dbc->query("SELECT * FROM transacciones WHERE tipotransaccion_idtipotransaccion='$tt_aux[idtipotransaccion]'");

                if($existe_en_trans->num_rows > 0){
                    
                    $se_pudo_eliminar =FALSE;
                    
                }else{
                    $query_1 = "DELETE FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_actual]'";
                    $this->dbc->query($query_1);

                    $query_2 = "DELETE FROM tipotransaccion WHERE idtipotransaccion = $id";
                    $this->dbc->query($query_2);

                    $se_pudo_eliminar =TRUE;
                }

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $query = "DELETE FROM tipotransaccion WHERE idtipotransaccion = $id";
                $this->dbc->query($query);

                $se_pudo_eliminar =TRUE;
            }
            
            
            $this->dbc->commit();
            if($se_pudo_eliminar ===TRUE){
                $res = array(
                        "success" => true,
                        "message" => "Se eliminó correctamente",
                        "message_code"   => "eliminacion_exitosa"
                    );
            }else{
                $res = array(
                        "success" => false,
                        "message" => "No se puede eliminar debido a que ya se esta usando ese registro",
                        "message_code"   => "registro_en_uso"
                    );
            }
    
        } catch (Exception $e) {
            $this->dbc->rollback();
            $res = array(
                        "success" => false,
                        "message" => $e->getMessage(),
                        "message_code"   => "registro_en_uso"
                    );
        }

        // Devolver el resultado en formato JSON
        echo json_encode($res);
    }

    public function creartipoasientolista($empresa)
{
    // Validar que el ID de la empresa sea válido
    $ide = $this->getidempresa($empresa);
    if (!$ide) {
        echo json_encode(array("ok" => "danger", "mensaje" => "ID de empresa no válido"));
        return;
    }

    // Preparar la lista para almacenar los resultados
    $lista = [];

    // Preparar la consulta SQL con una consulta directa, pero asegurando seguridad
    $stmt = $this->dbc->query("SELECT idtipotransaccion, nombre, detalle FROM tipotransaccion WHERE idempresa = '". $this->dbc->real_escape_string($ide) ."'");

    // Almacenar los resultados en la lista
    while ($row = $this->dbc->fetch($stmt)) {
        $lista[] = array(
            "id" => $row['idtipotransaccion'],
            "nombre" => $row['nombre'],
            "detalle" => $row['detalle']
        );
    }

    // Devolver la lista en formato JSON
    echo json_encode($lista);
}




    public function verificacion()
    {
        $idu = $_SESSION['yofinanciero'];

        $lista = [];
        $veri = $this->dbe->query("SELECT u.idusuarioempresa,p.nombrec,p.apellidoc,u.usuario,u.email,u.tipo,u.estado,o.nombreo from usuarioempresa as u
        INNER JOIN organizacion as o ON o.idorganizacion=u.organizacion_idorganizacion
        INNER JOIN perfilusuario as p ON p.usuarioempresa_idusuarioempresa=u.idusuarioempresa
        WHERE u.idusuarioempresa='$idu' Limit 1;");
        $qwe = $this->dbe->fetch($veri);

        $res = array("id" => $qwe[0], "nombre" => $qwe[1], "apellido" => $qwe[2], "usuario" => $qwe[3], "email" => $qwe[4], "tipo" => $qwe[5], "estado" => $qwe[6], "empresa" => $qwe[7]);
        array_push($lista, $res);
        echo json_encode($lista);
    }

    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

    // public function milistaplanes($empresa)
    // {
    //     $ide = $this->getidempresa($empresa);
    //     $lista = [];
    //     $registro = $this->dbc->query("SELECT idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,organizacion_idorganizacion,idp,idagrupacion_rubro_plandecuenta FROM plandecuenta WHERE organizacion_idorganizacion='$ide' ORDER BY numero ASC");
    //     while ($qwe = $this->dbc->fetch($registro)) {
    //         $numero_descompuesto = explode(".", $qwe[1]); 
    //         $aux = $this->dbc->query("SELECT nombreplan FROM plandecuenta WHERE numero >= $numero_descompuesto[0] LIMIT 1");
    //         $name_plan = $aux->fetch_assoc();

    //         if($qwe['idp'] != 0 || $qwe['idp'] != null){ // tiene padre
    //             $padre_list = $this->dbc->query("SELECT nombreplan FROM plandecuenta WHERE idp = '$qwe[idp]'");
    //             $nombre_padre_aux = $padre_list->fetch_assoc();
    //             $nombre_padre = $nombre_padre_aux['nombreplan'];
    //         }else{
    //             $nombre_padre = "";
    //         }
            
    //         // --> select * from plandecuenta where numero >= 1 limit 1
    //         // if($codigo_padre[0] == 1){ }
    //     $agru = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta='$qwe[idagrupacion_rubro_plandecuenta]'");
    //     $agru_aux = $agru->fetch_assoc();

    //     // $tipo_pl = $this->dbc->query("SELECT * from tipo_plandecuenta where idtipo_plandecuenta = '$agru_aux[idtipo_plandecuenta]'");// HIJOS DE LAS PLANTILLAS AGRUPADORAS
    //     // $pl_aux = $tipo_pl->fetch_assoc();

    //         $res = array("id" => $qwe[0], "numero" => $qwe[1], "plan" => $qwe[2], "descripcion" => $qwe[3], "rubro" => $name_plan['nombreplan'], "tipo" => $qwe[4], "consolidar" => $qwe[5], "empresa" => $qwe[6], "idp" => $qwe[7],"idagrupacion_rubro_plandecuenta" => $qwe[8],"nombre_rubro" => $agru_aux['tipo_plandecuenta'],"nombre_padre" => $nombre_padre);

    //         array_push($lista, $res);
    //     }
    //     echo json_encode($lista);
    // }
    public function milistaplanes($empresa)
{
    $ide = $this->getidempresa($empresa);
    $lista = [];

    // Usamos fetch_assoc para trabajar siempre con nombres de columnas
    $registro = $this->dbc->query("
        SELECT idplandecuenta, numero, nombreplan, descripcion, saldonormal, consolidar, organizacion_idorganizacion, idp, idagrupacion_rubro_plandecuenta 
        FROM plandecuenta 
        WHERE organizacion_idorganizacion = '$ide' 
        ORDER BY numero ASC
    ");

    while ($qwe = $registro->fetch_assoc()) {
        // Obtener rubro
        $numero_descompuesto = explode(".", $qwe['numero']); 
        $aux = $this->dbc->query("
            SELECT nombreplan 
            FROM plandecuenta 
            WHERE numero >= {$numero_descompuesto[0]} 
            LIMIT 1
        ");
        $name_plan = $aux->fetch_assoc();

        // Obtener nombre del padre correctamente
        if ($qwe['idp'] != 0 && $qwe['idp'] != null) { 
            $padre_list = $this->dbc->query("
                SELECT nombreplan 
                FROM plandecuenta 
                WHERE idplandecuenta = '{$qwe['idp']}'
            ");
            $nombre_padre_aux = $padre_list->fetch_assoc();
            $nombre_padre = $nombre_padre_aux ? $nombre_padre_aux['nombreplan'] : "";
        } else {
            $nombre_padre = "-";
        }

        // Obtener agrupación
        $agru = $this->dbc->query("
            SELECT * 
            FROM agrupacion_rubro_plandecuenta 
            WHERE idagrupacion_rubro_plandecuenta = '{$qwe['idagrupacion_rubro_plandecuenta']}'
        ");
        $agru_aux = $agru->fetch_assoc();

        // Construir resultado
        $res = array(
            "id" => $qwe['idplandecuenta'],
            "numero" => $qwe['numero'],
            "plan" => $qwe['nombreplan'],
            "descripcion" => $qwe['descripcion'],
            "rubro" => $name_plan['nombreplan'],
            "tipo" => $qwe['saldonormal'],
            "consolidar" => $qwe['consolidar'],
            "empresa" => $qwe['organizacion_idorganizacion'],
            "idp" => $qwe['idp'],
            "idagrupacion_rubro_plandecuenta" => $qwe['idagrupacion_rubro_plandecuenta'],
            "nombre_rubro" => $agru_aux['tipo_plandecuenta'],
            "nombre_padre" => $nombre_padre
        );

        $lista[] = $res;
    }

    echo json_encode($lista);
}


    public function registroplanes($numero, $plan, $descripcion, $tipo, $idp,$rubro, $empresa)
    {
        $ide = $this->getidempresa($empresa);
        
        $res = "";
        $consulta = $this->dbc->query("SELECT count(*) AS total FROM plandecuenta WHERE organizacion_idorganizacion='$ide' AND numero='$numero'");
        $resultado12 = $consulta->fetch_assoc();
        $totalCons = $resultado12['total'];

        if($totalCons > 0){
            $res = array(
                        "success" => false,
                        "message" => "El numero de codigo ya existe",
                        "message_code" => "numero_ya_existe"
                    );
        }elseif(empty($idp)){

            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();

                $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$rubro'");
                $ap = $agru_plan->fetch_assoc();

                $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_vinculada]'");
                $apdc = $agru_plan_decuenta->fetch_assoc();

                $registro_vinc = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$apdc[idagrupacion_rubro_plandecuenta]','$ve[idempresa_vinculada]')");

                $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$rubro','$ide')");

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$rubro'");
                $ap = $agru_plan->fetch_assoc();

                $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_actual]'");
                $apdc = $agru_plan_decuenta->fetch_assoc();

                $registro_vinc = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$apdc[idagrupacion_rubro_plandecuenta]','$ve[idempresa_actual]')");

                $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$rubro','$ide')");

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$rubro','$ide')");
            }

                if ($registro === TRUE) {
                    $res = array(
                        "success" => true,
                        "message" => "registro exitoso",
                        "message_code" => "registro_exitoso"
                    );
                } else {
                    $res = array(
                        "success" => false,
                        "message" => "ocurrio un error al registrar",
                        "message_code" => "error"
                    );
                }
        }else{
            $idp2 = $this->dbc->query("SELECT numero FROM plandecuenta WHERE idplandecuenta='$idp'");
            $resultado122 = $idp2->fetch_assoc();
            $numeroPadre = $resultado122['numero'];

            $codigo_padre = explode(".", $numeroPadre);
            $codigo = explode(".", $numero);
            if($codigo_padre[0] == $codigo[0]){
      
                // $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                // VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$rubro','$ide')");
                // if ($registro === TRUE) {
                //     $res = array("success", "Se registro Correctamente", "registroplanes");
                // } else {
                //     $res = array("danger", "No s epudo registrar");
                // }

                $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

                $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

                if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                    $ve = $existe_vinculacion_act->fetch_assoc();

                    $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$rubro'");
                    $ap = $agru_plan->fetch_assoc();

                    $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_vinculada]'");
                    $apdc = $agru_plan_decuenta->fetch_assoc();

                    $plan_decuenta_padre = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idp'");
                    $pdp = $plan_decuenta_padre->fetch_assoc();

                    $pdc_auxi = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$pdp[numero]' AND organizacion_idorganizacion ='$ve[idempresa_vinculada]'");
                    $pdc_ax = $pdc_auxi->fetch_assoc();

                    $registro_vinc = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$pdc_ax[idplandecuenta]','$apdc[idagrupacion_rubro_plandecuenta]','$ve[idempresa_vinculada]')");

                    $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$rubro','$ide')");

                }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                    $ve = $existe_vinculacion_vinc->fetch_assoc();

                    $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$rubro'");
                    $ap = $agru_plan->fetch_assoc();

                    $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_actual]'");
                    $apdc = $agru_plan_decuenta->fetch_assoc();

                    $plan_decuenta_padre = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idp'");
                    $pdp = $plan_decuenta_padre->fetch_assoc();

                    $pdc_auxi = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$pdp[numero]' AND organizacion_idorganizacion ='$ve[idempresa_actual]'");
                    $pdc_ax = $pdc_auxi->fetch_assoc();

                    $registro_vinc = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$pdc_ax[idplandecuenta]','$apdc[idagrupacion_rubro_plandecuenta]','$ve[idempresa_actual]')");

                    $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$rubro','$ide')");

                }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                    $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$rubro','$ide')");
                }

                if ($registro === TRUE) {
                    $res = array(
                        "success" => true,
                        "message" => "registro exitoso",
                        "message_code" => "registro_exitoso"
                    );
                } else {
                    $res = array(
                        "success" => false,
                        "message" => "ocurrio un error al registrar",
                        "message_code" => "error"
                    );
                }
            }
            else{
                // $res = array("danger", "El numero de codigo no esta en el rango permitido",$codigo_padre[0],$codigo[0],$idp);
                $res = array(
                        "success" => false,
                        "message" => "El numero de codigo no esta en el rango permitido",
                        "message_code" => "numero_no_pertenece_rango"
                    );
            }
        }

        echo json_encode($res);
    }

    public function registroplanesf5($idplan, $numero, $plan, $descripcion, $tipo, $idp,$id_agru,$empresa)
    {
        $ide = $this->getidempresa($empresa);
        $res = "";
        $consulta = $this->dbc->query("SELECT count(*) AS total FROM plandecuenta WHERE organizacion_idorganizacion='$ide' AND numero='$numero' AND idplandecuenta != '$idplan'");
        $resultado12 = $consulta->fetch_assoc();
        $totalCons = $resultado12['total'];

        if($totalCons > 0){
            $res = array(
                        "success" => false,
                        "message" => "El numero de codigo ya existe",
                        "message_code" => "numero_ya_existe"
                    );
        }elseif(empty($idp)){
            
            // $registro = $this->dbc->query("UPDATE plandecuenta 
            // SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$idagrupacion_rubro_plandecuenta' 
            // WHERE idplandecuenta='$idplan'");

            //     if ($registro === TRUE) {
            //         $res = array("success", "Se Edito Correctamente", "registroplanes");
            //     } else {
            //         $res = array("danger", "No se epudo registrar");
            //     }
            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();

                $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$id_agru'");
                $ap = $agru_plan->fetch_assoc();

                $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_vinculada]'");
                $apdc = $agru_plan_decuenta->fetch_assoc();

                $plandecuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idplan'");
                $pc = $plandecuenta->fetch_assoc();

                $registro = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$id_agru' 
                WHERE idplandecuenta='$idplan'");

                $update_vinc = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$apdc[idagrupacion_rubro_plandecuenta]' 
                WHERE numero='$pc[numero]' AND organizacion_idorganizacion ='$ve[idempresa_vinculada]'");

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$id_agru'");
                $ap = $agru_plan->fetch_assoc();

                $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_actual]'");
                $apdc = $agru_plan_decuenta->fetch_assoc();

                $plandecuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idplan'");
                $pc = $plandecuenta->fetch_assoc();

                $registro = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$id_agru' 
                WHERE idplandecuenta='$idplan'");

                $update_vinc = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$apdc[idagrupacion_rubro_plandecuenta]' 
                WHERE numero='$pc[numero]' AND organizacion_idorganizacion ='$ve[idempresa_actual]'");

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $registro = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$id_agru' 
                WHERE idplandecuenta='$idplan'");
            }

                if ($registro === TRUE) {
                    $res = array(
                        "success" => true,
                        "message" => "edicion exitosa",
                        "message_code" => "edicion_exitosa"
                    );
                } else {
                    $res = array(
                        "success" => false,
                        "message" => "ocurrio un error al editar",
                        "message_code" => "error"
                    );
                }

        }else{
            $idp2 = $this->dbc->query("SELECT numero FROM plandecuenta WHERE idplandecuenta='$idp'");
            $resultado122 = $idp2->fetch_assoc();
            $numeroPadre = $resultado122['numero'];

            $codigo_padre = explode(".", $numeroPadre);
            $codigo = explode(".", $numero);
            if($codigo_padre[0] == $codigo[0]){
         
                // $registro = $this->dbc->query("UPDATE plandecuenta 
                // SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$idagrupacion_rubro_plandecuenta' 
                // WHERE idplandecuenta='$idplan'");
               
                //     if ($registro === TRUE) {
                //         $res = array("success", "Se Edito Correctamente", "registroplanes");
                //     } else {
                //         $res = array("danger", "No s epudo registrar");
                //     }
                $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

                $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

                if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                    $ve = $existe_vinculacion_act->fetch_assoc();

                    $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$id_agru'");
                    $ap = $agru_plan->fetch_assoc();

                    $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_vinculada]'");
                    $apdc = $agru_plan_decuenta->fetch_assoc();

                    $plan_decuenta_padre = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idp'");
                    $pdp = $plan_decuenta_padre->fetch_assoc();

                    $pdc_auxi = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$pdp[numero]' AND organizacion_idorganizacion ='$ve[idempresa_vinculada]'");
                    $pdc_ax = $pdc_auxi->fetch_assoc();

                    $plandecuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idplan'");
                    $pc = $plandecuenta->fetch_assoc();
                    // $registro_vinc = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    // VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$pdc_ax[idplandecuenta]','$apdc[idagrupacion_rubro_plandecuenta]','$ve[idempresa_vinculada]')");

                    // $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    // VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$id_agru','$ide')");

                    $registro = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$id_agru' 
                WHERE idplandecuenta='$idplan'");

                $update_vinc = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$pdc_ax[idplandecuenta]',idagrupacion_rubro_plandecuenta = '$apdc[idagrupacion_rubro_plandecuenta]' 
                WHERE numero='$pc[numero]' AND organizacion_idorganizacion ='$ve[idempresa_vinculada]'");

                }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                    $ve = $existe_vinculacion_vinc->fetch_assoc();

                    $agru_plan = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idagrupacion_rubro_plandecuenta = '$id_agru'");
                    $ap = $agru_plan->fetch_assoc();

                    $agru_plan_decuenta = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE tipo_plandecuenta = '$ap[tipo_plandecuenta]' AND idempresa ='$ve[idempresa_actual]'");
                    $apdc = $agru_plan_decuenta->fetch_assoc();

                    $plan_decuenta_padre = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idp'");
                    $pdp = $plan_decuenta_padre->fetch_assoc();

                    $pdc_auxi = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$pdp[numero]' AND organizacion_idorganizacion ='$ve[idempresa_actual]'");
                    $pdc_ax = $pdc_auxi->fetch_assoc();

                    $plandecuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE idplandecuenta = '$idplan'");
                    $pc = $plandecuenta->fetch_assoc();

                    // $registro_vinc = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    // VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$pdc_ax[idplandecuenta]','$apdc[idagrupacion_rubro_plandecuenta]','$ve[idempresa_actual]')");

                    // $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,idagrupacion_rubro_plandecuenta,organizacion_idorganizacion)
                    // VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$id_agru','$ide')");

                    $registro = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$id_agru' 
                WHERE idplandecuenta='$idplan'");

                $update_vinc = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$pdc_ax[idplandecuenta]',idagrupacion_rubro_plandecuenta = '$apdc[idagrupacion_rubro_plandecuenta]' 
                WHERE numero='$pc[numero]' AND organizacion_idorganizacion ='$ve[idempresa_actual]'");

                }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                    $registro = $this->dbc->query("UPDATE plandecuenta 
                SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp',idagrupacion_rubro_plandecuenta = '$id_agru' 
                WHERE idplandecuenta='$idplan'");
                }

                if ($registro === TRUE) {
                    $res = array(
                        "success" => true,
                        "message" => "registro exitoso",
                        "message_code" => "registro_exitoso"
                    );
                } else {
                    $res = array(
                        "success" => false,
                        "message" => "ocurrio un error al registrar",
                        "message_code" => "error"
                    );
                }
            }else{
                    $res = array(
                        "success" => false,
                        "message" => "El numero de codigo no esta en el rango permitido",
                        "message_code" => "numero_no_pertenece_rango"
                    );
                    // $res = array("danger", "El numero de codigo no esta en el rango permitido",$codigo_padre[0],$codigo[0],$idp);
            }
        }
   
        echo json_encode($res);
    }

    public function deleteplan($id) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $this->dbc->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'detalletransaccion', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar'],
                ['tabla' => 'asiento', 'campo' => 'idcuenta', 'mensaje' => 'No se puede eliminar'],
                ['tabla' => 'vinculacion_cuenta_xcxp ', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar'],
                ['tabla' => 'relacionip', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar']
            ];
    
            foreach ($relacionadas as $relacion) {
                $query = "SELECT 1 FROM {$relacion['tabla']} WHERE {$relacion['campo']} = $id";
                $result = $this->dbc->query($query);
                if ($result->num_rows > 0) {
                    throw new Exception($relacion['mensaje']);
                }
            }

            $nombre_tt = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idtipotransaccion = '$id'");
            $ntt = $nombre_tt->fetch_assoc();

            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();

                $tt_auxiliar = $this->dbc->query("SELECT * FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_vinculada]'");
                $tt_aux = $tt_auxiliar->fetch_assoc();

                $existe_en_trans = $this->dbc->query("SELECT * FROM transacciones WHERE tipotransaccion_idtipotransaccion='$tt_aux[idtipotransaccion]'");

                if($existe_en_trans->num_rows > 0){
                    
                    $se_pudo_eliminar =FALSE;
                    
                }else{
                    $query_1 = "DELETE FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_vinculada]'";
                    $this->dbc->query($query_1);

                    $query_2 = "DELETE FROM tipotransaccion WHERE idtipotransaccion = $id";
                    $this->dbc->query($query_2);

                    $se_pudo_eliminar =TRUE;
                }

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $tt_auxiliar = $this->dbc->query("SELECT * FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_actual]'");
                $tt_aux = $tt_auxiliar->fetch_assoc();

                $existe_en_trans = $this->dbc->query("SELECT * FROM transacciones WHERE tipotransaccion_idtipotransaccion='$tt_aux[idtipotransaccion]'");

                if($existe_en_trans->num_rows > 0){
                    
                    $se_pudo_eliminar =FALSE;
                    
                }else{
                    $query_1 = "DELETE FROM tipotransaccion WHERE nombre='$ntt[nombre]' AND idempresa ='$ve[idempresa_actual]'";
                    $this->dbc->query($query_1);

                    $query_2 = "DELETE FROM tipotransaccion WHERE idtipotransaccion = $id";
                    $this->dbc->query($query_2);

                    $se_pudo_eliminar =TRUE;
                }

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $query = "DELETE FROM plandecuenta WHERE idplandecuenta = $id";
                $this->dbc->query($query);

                $se_pudo_eliminar =TRUE;
            }
        
            // $query = "DELETE FROM plandecuenta WHERE idplandecuenta = $id";
            // $this->dbc->query($query);
            
            $this->dbc->commit();
            // $res = array("success", "Se eliminó correctamente", "deleteplan");
            if($se_pudo_eliminar ===TRUE){
                $res = array(
                        "success" => true,
                        "message" => "Se eliminó correctamente",
                        "message_code"   => "eliminacion_exitosa"
                    );
            }else{
                $res = array(
                        "success" => false,
                        "message" => "No se puede eliminar debido a que ya se esta usando ese registro",
                        "message_code"   => "registro_en_uso"
                    );
            }
    
        } catch (Exception $e) {
            $this->dbc->rollback();
            // $res = array("danger", $e->getMessage(), "deleteplan");
            $res = array(
                        "success" => false,
                        "message" => $e->getMessage(),
                        "message_code"   => "registro_en_uso"
                    );
        }
    
        echo json_encode($res);
    }
    
    // public function deleteplan($dato)
    // {
    //     $res = "";
    //     $detalle = $this->dbc->query("select * from detalletransaccion where idplandecuenta='$dato'");
    //     $qwe = $this->dbc->fetch($detalle);
    //     if ($qwe['idplandecuenta'] == $dato) {
    //         $res = array("danger", "No se pudo Eliminar, por que contiene datos registrados.");
    //     } else {
    //         $registro = $this->dbc->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
    //         if ($registro === TRUE) {
    //             $res = array("success", "Se Elimino Correctamente", "registroplanes");
    //         } else {
    //             $res = array("danger", "No se pudo Eliminar");
    //         }
    //     }
    //     echo json_encode($res);
    // }

    public function reemplazar_todos_planescuentas($empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);

            // $res = array("danger", "No se pudo Eliminar, por que contiene datos registrados.");
            $detalle0 = $this->dbc->query("SELECT idplandecuenta FROM plandecuenta WHERE organizacion_idorganizacion='$ide'");
           
            $listaCuentas = [];
            while ($asd = $this->dba->fetch($detalle0)) {
                array_push($listaCuentas,$asd['idplandecuenta']);    
            }      

            $aux = true;
            $i = 0;
          while($aux == true && $i < count($listaCuentas)){
            $detalle = $this->dbc->query("SELECT COUNT(*) AS totalcuenta FROM detalletransaccion WHERE idplandecuenta='$listaCuentas[$i]'");
            $asiento = $this->dbc->query("SELECT COUNT(*) AS totalcuenta FROM asiento WHERE idcuenta='$listaCuentas[$i]'");
            $vinculacion = $this->dbc->query("SELECT COUNT(*) AS totalcuenta FROM vinculacion_cuenta_xcxp  WHERE idplandecuenta='$listaCuentas[$i]'");
            $relacion = $this->dbc->query("SELECT COUNT(*) AS totalcuenta FROM relacionip  WHERE idplandecuenta='$listaCuentas[$i]'");

            $resultado1 = $detalle->fetch_assoc();
            $resultado2 = $asiento->fetch_assoc();
            $resultado3 = $vinculacion->fetch_assoc();
            $resultado4 = $relacion->fetch_assoc();

            $totalcuenta = $resultado1['totalcuenta'];
            $totalcuenta2 = $resultado2['totalcuenta'];
            $totalcuenta3 = $resultado3['totalcuenta'];
            $totalcuenta4 = $resultado4['totalcuenta']; 

            if($totalcuenta > 0 || $totalcuenta2 > 0 || $totalcuenta3 > 0 || $totalcuenta4 > 0){
                    $aux = false;
                    // $res = array("danger", "No se pudo Eliminar, por que contiene datos registrados.");
                }else{
                   
                    $i = $i + 1;
                }
          }
          if($aux == true){
             $eliminar = $this->dbc->query("DELETE FROM plandecuenta WHERE organizacion_idorganizacion='$ide'");
             if($eliminar == true){
                $res = array("success", "Se Elimino Correctamente", "reemplazar_todos_planescuentas");

             }else{
                $res = array("danger", "No se pudo eliminar", "reemplazar_todos_planescuentas");

             }
                // $res = array("success", "Se Elimino Correctamente pero de mentiras", "reemplazar_todos_planescuentas");

          }else{
            $res = array("danger", "No se pudo Eliminar, por que contiene datos registrados.", "reemplazar_todos_planescuentas");
               
          }
        echo json_encode($res);
    }

    public function listaplanesempresa($empresa)
    {
        $ide = $this->getidempresa($empresa);
        $empresa = $this->dbe->query("select * from organizacion where idorganizacion='$ide' ");
        $qwe = $this->dbe->fetch($empresa);
        $tipo = $qwe['tipobusiness_idtipobusiness'];
        $lista = [];
        $admin = $this->dba->query("select numero,nombreplan,descripcion,saldonormal from plancuentasadm where idtipobusiness='$tipo'");
        while ($asd = $this->dba->fetch($admin)) {
            $res = array("numero" => $asd[0], "plan" => $asd[1], "descripcion" => $asd[2], "tipo" => $asd[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function agregarplanes($empresaid)
    {
        $ide = $this->getidempresa($empresaid);
        $empresa = $this->dbe->query("select * from organizacion where idorganizacion='$ide' ");
        $qwe = $this->dbe->fetch($empresa);
        $tipo = $qwe['tipobusiness_idtipobusiness'];
        $res = "";
        $admin = $this->dba->query("select numero,nombreplan,descripcion,saldonormal from plancuentasadm where idtipobusiness='$tipo'");
        while ($asd = $this->dba->fetch($admin)) {
            $crear = $this->dbc->query("insert into plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)values(NULL,'$asd[0]','$asd[1]','$asd[2]','$asd[3]','2','0','$ide')");
        }
        $res = array("success", "Se agrego correctamente", "sitio");
        echo json_encode($res);
    }
    public function reemplazarplanes($empresaid)
    {
        $ide = $this->getidempresa($empresaid);
        $empresa = $this->dbe->query("select * from organizacion where idorganizacion='$ide' ");
        $qwe = $this->dbe->fetch($empresa);
        $tipo = $qwe['tipobusiness_idtipobusiness'];
        $res = "";
        $deletemiplan = $this->dbc->query("delete from plandecuenta where organizacion_idorganizacion='$ide'");

        $admin = $this->dba->query("select numero,nombreplan,descripcion,saldonormal from plancuentasadm where idtipobusiness='$tipo'");
        while ($asd = $this->dba->fetch($admin)) {
            $crear = $this->dbc->query("insert into plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)values(NULL,'$asd[0]','$asd[1]','$asd[2]','$asd[3]','2','0','$ide')");
        }
        $res = array("success", "Se agrego correctamente", "sitio");
        echo json_encode($res);
    }
    public function registrotipodecambio($dolar, $ufv, $fecha, $empresa) 
    {
        $res = "";
        $ide = $this->getidempresa($empresa);
        // $registro = $this->dbc->query("INSERT INTO tipodecambio(idtipodecambio,dolar,ufv,fecha,idorganizacion)VALUES(NULL,'$dolar','$ufv','$fecha','$ide')");

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipodecambio WHERE fecha = '$fecha' AND idorganizacion = '$ide'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {

        $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

        $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

        if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
            $ve = $existe_vinculacion_act->fetch_assoc();

            $registro_empr_vinc = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$dolar','$ufv','$fecha','$ve[idempresa_vinculada]')");

            $registro_empr_act = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$dolar','$ufv','$fecha','$ide')");

        }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
            $ve = $existe_vinculacion_vinc->fetch_assoc();

            $registro_empr_act = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$dolar','$ufv','$fecha','$ve[idempresa_actual]')");

            $registro_empr_vinc = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$dolar','$ufv','$fecha','$ide')");

        }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

            $registro_empr_act = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$dolar','$ufv','$fecha','$ide')");
        }

        if ($registro_empr_act === TRUE) {
            $res = array("success", "Se registro Correctamente", "registrotipocambio");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }

        }
        echo json_encode($res);
    }

    public function registrotipodecambiof5($id, $dolar, $ufv, $fecha,$empresa)
    {
        $ide = $this->getidempresa($empresa);
        $res = "";

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipodecambio WHERE fecha = '$fecha' AND idorganizacion = '$ide' AND idtipodecambio != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
        }else {
            $fecha_tc = $this->dbc->query("SELECT * FROM tipodecambio WHERE idtipodecambio = '$id'");
            $ftc = $fecha_tc->fetch_assoc();

            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();

                $edit_tc_otra_empre = $this->dbc->query("UPDATE tipodecambio SET dolar='$dolar',ufv='$ufv',fecha='$fecha' WHERE fecha='$ftc[fecha]' AND idorganizacion ='$ve[idempresa_vinculada]'");
                $edit_tc = $this->dbc->query("UPDATE tipodecambio SET dolar='$dolar',ufv='$ufv',fecha='$fecha' WHERE idtipodecambio='$id'");

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $edit_tc_otra_empre = $this->dbc->query("UPDATE tipodecambio SET dolar='$dolar',ufv='$ufv',fecha='$fecha' WHERE fecha='$ftc[fecha]' AND idorganizacion ='$ve[idempresa_actual]'");
                $edit_tc = $this->dbc->query("UPDATE tipodecambio SET dolar='$dolar',ufv='$ufv',fecha='$fecha' WHERE idtipodecambio='$id'");

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $edit_tc = $this->dbc->query("UPDATE tipodecambio SET dolar='$dolar',ufv='$ufv',fecha='$fecha' WHERE idtipodecambio='$id'");
            }

            if ($edit_tc === TRUE) {
                $res = array("success", "Se registro Correctamente", "registrotipocambiof5");
            } else {
                $res = array("danger", "No se pudo realizar el registro");
            }
        }
    
        echo json_encode($res);
    }

    public function listatipodecambio($empresa)
    {
        $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("select idtipodecambio,dolar,ufv,fecha from tipodecambio where idorganizacion='$ide' order by fecha desc");
        while ($qwe = $this->dbc->fetch($registro)) {
            $res = array("id" => $qwe[0], "dolar" => $qwe[1], "ufv" => $qwe[2], "fecha" => $qwe[3]);
            array_push($lista, $res);
        }
        echo  json_encode($lista);
    }

    public function eliminartipocambio($id, $empresa)
    {
        // $ide = $this->getidempresa($empresa);
        // $res = "";
        // $registro = $this->dbc->query("DELETE FROM tipodecambio WHERE idorganizacion='$ide' AND idtipodecambio='$id'");
        // if ($registro == TRUE) {
        //     $res = array("ok" => "success");
        // } else {
        //     $res = array("ok" => "danger");
        // }
        // echo json_encode($res);

        $ide = $this->getidempresa($empresa);
        $this->dbc->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                // ['tabla' => 'asientotipo', 'campo' => 'tipo', 'mensaje' => 'No se puede eliminar'],
                ['tabla' => 'transacciones', 'campo' => 'tipodecambio', 'mensaje' => 'No se puede eliminar debido a que ya se esta usando ese registro en transaccion']
            
            ];
    
            foreach ($relacionadas as $relacion) {
                $query = "SELECT 1 FROM {$relacion['tabla']} WHERE {$relacion['campo']} = $id";
                $result = $this->dbc->query($query);
                if ($result->num_rows > 0) {
                    throw new Exception($relacion['mensaje']);
                }
            }
    
            $fecha_tc = $this->dbc->query("SELECT * FROM tipodecambio WHERE idtipodecambio = '$id'");
            $ftc = $fecha_tc->fetch_assoc();

            $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

            $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

            if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
                $ve = $existe_vinculacion_act->fetch_assoc();
        // $registro = $this->dbc->query("DELETE FROM tipodecambio WHERE idorganizacion='$ide' AND idtipodecambio='$id'");

            $tc_auxiliar = $this->dbc->query("SELECT * FROM tipodecambio WHERE fecha='$ftc[fecha]' AND idorganizacion ='$ve[idempresa_vinculada]'");
            $tc_aux = $tc_auxiliar->fetch_assoc();

            $existe_en_trans = $this->dbc->query("SELECT * FROM transacciones WHERE tipodecambio='$tc_aux[idtipodecambio]'");

            if($existe_en_trans->num_rows > 0){
                // $res = array("success", "Se eliminó correctamente", "eliminartipodecambio");
                $se_pudo_eliminar =FALSE;
                
            }else{
                $query_1 = "DELETE FROM tipodecambio WHERE fecha='$ftc[fecha]' AND idorganizacion ='$ve[idempresa_vinculada]'";
                $this->dbc->query($query_1);

                $query_2 = "DELETE FROM tipodecambio WHERE idtipodecambio = $id";
                $this->dbc->query($query_2);

                $se_pudo_eliminar =TRUE;
            }

            }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
                $ve = $existe_vinculacion_vinc->fetch_assoc();

                $tc_auxiliar = $this->dbc->query("SELECT * FROM tipodecambio WHERE fecha='$ftc[fecha]' AND idorganizacion ='$ve[idempresa_actual]'");
                $tc_aux = $tc_auxiliar->fetch_assoc();

                $existe_en_trans = $this->dbc->query("SELECT * FROM transacciones WHERE tipodecambio='$tc_aux[idtipodecambio]'");

                if($existe_en_trans->num_rows > 0){
                    // $res = array("success", "Se eliminó correctamente", "eliminartipodecambio");
                   
                    $se_pudo_eliminar =FALSE;
                }else{
                    $query_1 = "DELETE FROM tipodecambio WHERE fecha='$ftc[fecha]' AND idorganizacion ='$ve[idempresa_actual]'";
                    $this->dbc->query($query_1);

                    $query_2 = "DELETE FROM tipodecambio WHERE idtipodecambio = $id";
                    $this->dbc->query($query_2);

                    $se_pudo_eliminar =TRUE;
                }

            }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $query = "DELETE FROM tipodecambio WHERE idtipodecambio = $id";
                $this->dbc->query($query);

                $se_pudo_eliminar =TRUE;
            }
            
            $this->dbc->commit();
    
            if($se_pudo_eliminar ===TRUE){
                $res = array(
                        "success" => true,
                        "message" => "Se eliminó correctamente",
                        "message_code"   => "eliminacion_exitosa"
                    );
            }else{
                $res = array(
                        "success" => false,
                        "message" => "No se puede eliminar debido a que ya se esta usando ese registro en transaccion",
                        "message_code"   => "registro_existe_en_transaccion"
                    );
            }
            
        } catch (Exception $e) {
            $this->dbc->rollback();
            $res = array(
                        "success" => false,
                        "message" => $e->getMessage(),
                        "message_code"   => "registro_existe_en_transaccion"
                    );
        }

        // Devolver el resultado en formato JSON
        echo json_encode($res);
    }

    public function checkusersucursal()
    {
        $id = $_SESSION['yofinanciero'];
        $orga = $_SESSION['organizacion'];
        $res = "";
        $migestion = $this->dbc->query("select * from gestion where idempresa='$orga' and estado='2' order by idgestion desc Limit 1");
        $asd = $this->dbc->fetch($migestion);
        $check = $this->dbe->query("select * from asignarusersuc where idusuario='$id' and idorganizacion='$orga'");
        $qwe = $this->dbe->fetch($check);
        if ($qwe['idsucursal'] != NULL) {
            $_SESSION['gestion'] = $asd['idgestion'];
            $_SESSION['sucursal'] = $qwe['idsucursal'];
            $_SESSION['sucursalnombre'] = $qwe['nombre'];
            $res = array("success", "Usuario  asignado ");
        } else {
            $_SESSION['sucursal'] = 0;
            $_SESSION['gestion'] = 0;
            $res = array("danger", "Usuario no asignado");
        }
        echo json_encode($res);
    }



    public function listadetemplates()
    {
        $lista = [];
        $grupo = $this->dba->query("select g.idgrupos, g.nombre, g.idtipobusiness, g.idp, g.idfuncion from grupos as g");
        while ($qwe = $this->dba->fetch($grupo)) {

            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "tipo" => $qwe[2], "idp" => $qwe[3], "idfuncion" => $qwe[4]);
            array_push($lista, $res);
        }
    }
    public function importartemplate($id, $ide, $idtb)
    {
        $empresa = $this->getidempresa($ide);

        $res = "";
        $grupo = $this->dba->query("select g.idgrupos, g.nombre,g.idfuncion, g.idp from grupos as g where g.idgrupos='$id' and g.idtipobusiness='$idtb'");
        $qwe = $this->dba->fetch($grupo);
        //$thisgrupo=$this->dbc->query("select * from grupos");

        $this->dbc->query("INSERT INTO grupos(nombre,empresa,idp,idfuncion)values('$qwe[1]','$empresa','$qwe[3]','$qwe[2]')");
        $idgrupo = $this->dbc->insert_id;

        $detallegrupo = $this->dba->query("select ad.nplancuenta, ad.orden from gruposadd as ad where ad.idgrupos='$id'");
        while ($qw = $this->dba->fetch($detallegrupo)) {
            $this->dbc->query("INSERT INTO gruposadd(idgrupos,nplancuenta,orden,idp)values('$idgrupo','$qw[0]','$qw[1]','0')");
        }



        $res = array("ok" => "success", "estado" => "Se creo el grupo correctamente", "dato" => $idgrupo);
        echo json_encode($res);
    }

    public function importardato($idempresa, $template)
    {
        $empresa = $this->getidempresa($idempresa);
        $data = json_decode($template, true);

        $nombre = $data['nombre'];
        $codigo = $data['codigo'];
        $estado = $data['estado'];
        $idtb = $data['idtb'];

        $templateQuery = $this->dbc->query("INSERT INTO templatect (idtemplatect, nombre, codigo, estado, idtb,idempresa) VALUES (NULL, '$nombre', '$codigo', '$estado', '$idtb','$empresa')");
        $idtemplate = $this->dbc->insert_id;

        $grupo = $data['grupo'];
        foreach ($grupo as $key => $grupoValue) {
            $this->dbc->query("INSERT INTO grupos (idgrupos, nombre, codigo, idtipobusiness, orden, idp, idfuncion, codigotemp) VALUES (NULL, '$grupoValue[nombre]', '$grupoValue[codigo]', '$grupoValue[idtipobusiness]', '$grupoValue[orden]', '$grupoValue[idp]', '$grupoValue[idfuncion]', '$grupoValue[codigotemp]')");
            $idgrupo = $this->dbc->insert_id;

            $detallegrupo = $grupoValue['listagrupo']; // Acceder a 'listagrupo' correctamente
            foreach ($detallegrupo as $detalleValue) {
                $this->dbc->query("INSERT INTO gruposadd (idgruposadd, codigogrupos, nplancuenta, orden, idp, template) VALUES (NULL, '$detalleValue[grupo]', '$detalleValue[nplan]', '$detalleValue[orden]', '$detalleValue[idp]', '$detalleValue[template]')");
            }
        }
        echo json_encode("success");
    }

    public function listatemplate($idempresa)
    {
        $empresa = $this->getidempresa($idempresa);
        $template = $this->dbc->query("SELECT t.nombre, t.codigo, t.estado, t.idtb  FROM templatect as t WHERE t.idempresa='$empresa'");
        $res = array();
        while ($qw = $this->dbc->fetch($template)) {
            $res[] = $qw;
        }
        echo json_encode($res);
    }

    public function eliminartemplate($codigo, $idempresa)
    {
        $empresa = $this->getidempresa($idempresa);
        $res[] = $codigo . $idempresa;

        $borrar = $this->dbc->query("SELECT * FROM templatect WHERE codigo='$codigo' AND idempresa='$empresa'");
        $qw = $this->dbc->fetch($borrar);

        $gadds = $this->dbc->query("DELETE FROM gruposadd WHERE  template='$qw[codigo]'");
        $grupos = $this->dbc->query("DELETE FROM grupos WHERE codigotemp='$qw[codigo]'");
        $template = $this->dbc->query("DELETE FROM templatect WHERE codigo='$codigo' AND idempresa='$empresa'");
        if ($gadds && $grupos && $template) {
            $res = array("success");
        } else {
            $res = array("danger");
        }

        echo  json_encode($res);
    }

    public function avertemplate($codigo, $empresa)
    {
        $lista = [];
        $idem = $this->getidempresa($empresa);
        $template = $this->dbc->query("SELECT * FROM templatect WHERE codigo='$codigo' AND idempresa='$idem'");
        $qw = $this->dbc->fetch($template);
        $grupot = [];
        $grupo = $this->dbc->query("SELECT idgrupos,nombre,codigo,orden,idp,idfuncion FROM grupos WHERE codigotemp='$qw[codigo]' ");
        while ($qwe = $this->dbc->fetch($grupo)) {
            $detalle = [];
            $detallegrupo = $this->dbc->query("SELECT idgruposadd,nplancuenta,orden FROM gruposadd WHERE codigogrupos='$qwe[codigo]' AND template='$qwe[codigotemp]'");
            while ($qwi = $this->dbc->fetch($detallegrupo)) {
                $detalle[] = $qwi;
            }
            $grupot[] = $qwe;
        }
        echo json_encode($lista);
    }
    public function vertemplate($codigo, $empresa)
    {
        $lista = [];
        $idem = $this->getidempresa($empresa);

        // Preparar y ejecutar consulta para obtener el template
        $stmtTemplate = $this->dbc->prepare("SELECT * FROM templatect WHERE codigo=? AND idempresa=?");
        $stmtTemplate->bind_param("si", $codigo, $idem);
        $stmtTemplate->execute();
        $resultTemplate = $stmtTemplate->get_result();
        $qw = $resultTemplate->fetch_assoc();

        if ($qw) {
            $grupot = [];

            // Preparar y ejecutar consulta para obtener grupos
            $stmtGrupo = $this->dbc->prepare("SELECT idgrupos, nombre, codigo, orden, idp, idfuncion FROM grupos WHERE codigotemp=?");
            $stmtGrupo->bind_param("s", $qw['codigo']);
            $stmtGrupo->execute();
            $resultGrupo = $stmtGrupo->get_result();

            while ($qwe = $resultGrupo->fetch_assoc()) {
                $detalle = [];

                // Preparar y ejecutar consulta para obtener detalles del grupo
                $stmtDetalleGrupo = $this->dbc->prepare("SELECT idgruposadd, nplancuenta, orden FROM gruposadd WHERE codigogrupos=? AND template=?");
                //$stmtDetalleGrupo = $this->dbc->prepare("SELECT g.idgruposadd, g.nplancuenta, g.orden, p.nombreplan, p.numero FROM gruposadd as g inner join plandecuenta as p ON p.numero = g.nplancuenta WHERE g.codigogrupos=? AND g.template=?");
                $stmtDetalleGrupo->bind_param("ss", $qwe['codigo'], $qw['codigo']);
                $stmtDetalleGrupo->execute();
                $resultDetalleGrupo = $stmtDetalleGrupo->get_result();

                while ($qwi = $resultDetalleGrupo->fetch_assoc()) {
                    $plancuenta = $this->dbc->query("SELECT numero,nombreplan FROM plandecuenta WHERE numero='$qwi[nplancuenta]'");
                    $qwj = $this->dbc->fetch($plancuenta);
                    $qwi['nombreplan'] = $qwj['nombreplan'];
                    $qwi['numero'] = $qwj['numero'];

                    //$detalle[] = $qwi;
                    $detalle[] = $qwi;
                }

                // Añadir detalles al grupo
                $qwe['detallegrupo'] = $detalle;
                $grupot[] = $qwe;
            }

            // Añadir grupos al template
            $qw['grupo'] = $grupot;
            $lista[] = $qw;
        }

        // Cerrar declaraciones y conexiones
        $stmtTemplate->close();
        $stmtGrupo->close();
        $stmtDetalleGrupo->close();

        // Devolver resultado como JSON
        echo json_encode($lista);
    }

    ///////////////////Impuestos 
    public function impuestolista($empresa){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $registro=$this->dbc->query("SELECT t.idimpuesto,t.codigoimpuesto,t.nombreimpuesto,t.tasa,t.descripcion,t.vencimiento,t.periodicidad,t.idempresa FROM impuesto AS t WHERE t.idempresa='$ide'");
        while($qwe=$this->dbc->fetch($registro)){
            $res=array("id"=>$qwe[0],"codigoimpuesto"=>$qwe[1],"nombreimpuesto"=>$qwe[2],"tasa"=>$qwe[3],"descripcion"=>$qwe[4],"vencimiento"=>$qwe[5],"periodicidad"=>$qwe[6],"empresa"=>$qwe[7]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    public function impuestocrear($empresa,$codigo,$nombre,$tasa,$descripcion,$vencimiento,$periodicidad){
        $res="";
        $ide=$this->getidempresa($empresa);

        $lista=$this->dbc->query("SELECT * FROM impuesto WHERE codigoimpuesto = '$codigo' AND idempresa = '$ide'");

        if($lista->num_rows > 0){
            $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }else{
            $registro=$this->dbc->query("INSERT INTO impuesto(idimpuesto,codigoimpuesto,nombreimpuesto,tasa,descripcion,vencimiento,periodicidad,idempresa)VALUES(NULL,'$codigo','$nombre','$tasa','$descripcion','$vencimiento','$periodicidad','$ide')");
            
            if($registro===TRUE){
                $res = array("success", "Se Registro Correctamente");
            }else{
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
            }
        }

        // $registro=$this->dbc->query("INSERT INTO impuesto(idimpuesto,codigoimpuesto,nombreimpuesto,tasa,descripcion,idempresa)VALUES(NULL,'$codigo','$nombre','$tasa','$descripcion','$ide')");
       
        echo json_encode($res);
    }
    public function impuestocrearf5($idimpuesto,$codigo,$nombre,$tasa,$descripcion,$vencimiento,$periodicidad){
        $res="";
        //$ide=$this->getidempresa($empresa);
        $registro=$this->dbc->query("UPDATE impuesto SET codigoimpuesto='$codigo',nombreimpuesto='$nombre',tasa='$tasa',descripcion='$descripcion',vencimiento='$vencimiento',periodicidad='$periodicidad' WHERE idimpuesto='$idimpuesto'");
        if($registro===TRUE){
            $res=array("ok"=>"success","mensaje"=>"Se Actualizo Correctamente");
        }else{
            $res=array("ok"=>"danger","mensaje"=>"No se Actualizo Correctamente");
        }
        echo json_encode($res);
    }
    public function impuestocreardelete($idimpuesto){
        $res="";
        //$ide=$this->getidempresa($empresa);
        $delete=$this->dbc->query("DELETE FROM impuesto  WHERE idimpuesto='$idimpuesto'");
        if($delete===TRUE){
            $vinculacion_impues=$this->dbc->query("DELETE FROM relacionip  WHERE idimpuesto='$idimpuesto'");
       
            $res=array("ok"=>"success","mensaje"=>"Se Actualizo Correctamente");
        }else{
            $res=array("ok"=>"danger","mensaje"=>"No se Actualizo Correctamente");
        }
        echo json_encode($res);
    }

    public function actualizatipotransaccion01($idempresa){
    $ide = $this->getidempresa($idempresa);
    $ingreso = "No";
    $egreso = "No";
    $diario = "No";

    // Obtener todas las tipotransacciones de la empresa en un solo paso
    $tipotransacciones = [];
    $tipotransQuery = $this->dbc->query("SELECT t.idtipotransaccion, t.nombre FROM tipotransaccion AS t WHERE t.idempresa='$ide'");
    while ($tipotrans = $this->dbc->fetch($tipotransQuery)) {
        $tipotransacciones[$tipotrans['nombre']] = $tipotrans['idtipotransaccion'];
    }

    // Aseguramos que tenemos las tipotransacciones necesarias
    if (!isset($tipotransacciones['INGRESO']) || !isset($tipotransacciones['EGRESO']) || !isset($tipotransacciones['DIARIO'])) {
        // Si alguna de las tipotransacciones no está definida, devolvemos un error.
        echo json_encode(["error" => "No se encontraron todas las tipotransacciones necesarias (INGRESO, EGRESO, DIARIO)"]);
        return;
    }

    // Seleccionar todas las transacciones de la empresa
    $registrotrans = $this->dbc->query("SELECT t.idtransacciones, t.tipotransaccion_idtipotransaccion FROM transacciones AS t WHERE t.organizacion_idorganizacion='$ide'");
    while ($qwe = $this->dbc->fetch($registrotrans)) {
        if ($qwe[1] == 1 && isset($tipotransacciones['INGRESO'])) {
            // Actualizar transacción a tipo INGRESO
            $update = $this->dbc->query("UPDATE transacciones SET tipotransaccion_idtipotransaccion='{$tipotransacciones['INGRESO']}' WHERE idtransacciones='{$qwe[0]}'");
            $ingreso = "Si";
        }
        if ($qwe[1] == 2 && isset($tipotransacciones['EGRESO'])) {
            // Actualizar transacción a tipo EGRESO
            $update = $this->dbc->query("UPDATE transacciones SET tipotransaccion_idtipotransaccion='{$tipotransacciones['EGRESO']}' WHERE idtransacciones='{$qwe[0]}'");
            $egreso = "Si";
        }
        if ($qwe[1] == 3 && isset($tipotransacciones['DIARIO'])) {
            // Actualizar transacción a tipo DIARIO
            $update = $this->dbc->query("UPDATE transacciones SET tipotransaccion_idtipotransaccion='{$tipotransacciones['DIARIO']}' WHERE idtransacciones='{$qwe[0]}'");
            $diario = "Si";
        }
    }

    // Devolver resultados en JSON creartipoasientodelete milistaplanes
    $res = array("Datos Actualizados" => "Ingreso:$ingreso , Egreso:$egreso , Diario:$diario");
    echo json_encode($res);
}

public function codigo_correlativo_plandecuenta($codigo,$empresa)
    {

        $ide = $this->getidempresa($empresa);

        $lista = [];
        $codigo_arreglo = explode(".", $codigo); // 1, 1, 3, 05, 00
                                                 // 0  1  2  3   4
        $aux = "";
        $indice = 0;
        for ($i = count($codigo_arreglo) - 1; $i >= 0; $i--) {
            if ($codigo_arreglo[$i] !== "0" && $codigo_arreglo[$i] !== "00") {
                // Aumenta en 1 el valor encontrado
                $codigo_arreglo[$i] = str_pad($codigo_arreglo[$i] + 1, strlen($codigo_arreglo[$i]), "0", STR_PAD_LEFT);

                $indice = $i;
                break; // Detiene el recorrido después de realizar el incremento
            }
        }

        $arreglo_cortado = array_slice($codigo_arreglo, 0, $indice);

        $cadena = implode(".", $arreglo_cortado);
        $cadena = $cadena .".%";

        $registrotrans = $this->dbc->query("SELECT * FROM plandecuenta 
            WHERE numero >= '$codigo' 
            AND numero LIKE '$cadena' 
            AND organizacion_idorganizacion = '$ide'
            ORDER BY numero DESC LIMIT 1;");

        while ($qwe = $this->dbc->fetch($registrotrans)) {

            $numero_arreglo_ultimo = explode(".", $qwe['numero']); // 1, 1, 3, 05, 00

            for ($i = count($numero_arreglo_ultimo) - 1; $i >= 0; $i--) {
                if ($numero_arreglo_ultimo[$i] !== "0" && $numero_arreglo_ultimo[$i] !== "00") {
                    // Aumenta en 1 el valor encontrado
                    $numero_arreglo_ultimo[$i] = str_pad($numero_arreglo_ultimo[$i] + 1, strlen($numero_arreglo_ultimo[$i]), "0", STR_PAD_LEFT);
    
                    $indice = $i;
                    break; // Detiene el recorrido después de realizar el incremento
                }
            }
            $nuevo_codigo = implode(".", $numero_arreglo_ultimo);

            $res = array("codigo" => $nuevo_codigo);

            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
//impuestocrear milista impuestolista impuestocreardelete
}
