<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; ini_set

class Vinculacion_empresas extends DB{
    public function vincular_empresas($empresa_act,$idempresa_vincula,$idgestion_vincula){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa_act = $this->getidempresa($empresa_act);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO vinculacion_empresas(idempresa_actual,idempresa_vinculada,idgestion_vinculada) VALUES ('$idempresa_act','$idempresa_vincula','$idgestion_vincula')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
        
    }
    public function vincular_empresas_reemplazando_plandecuentas($empresa_act,$idempresa_vincula,$idgestion_vincula){
       
        $resp_a_usuario = FALSE;
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa_act = $this->getidempresa($empresa_act);
        $get_plandecuenta_empresa_act = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_act'");
        $get_plandecuenta_empresa_vinculada = $this->dbc->query("SELECT * FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_vincula'");

        $get_rubro_pl = $this->dbc->query("SELECT * FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_act'");

        $get_tipo_trans_act = $this->dbc->query("SELECT * FROM tipotransaccion WHERE idempresa = '$idempresa_act'");

        //DEBE EXISTIR PLAN D CUENTAS,RUBRO AGRUPACION, TIPO ASIENTO Y TIPO D CAMBIO
        if($get_plandecuenta_empresa_act->num_rows > 0 && $get_rubro_pl->num_rows > 0 && $get_tipo_trans_act->num_rows > 0){ //SI EXISTE PLAN DE CUENTAS y RUBRO AGRUPACION EN LA EMPRESA ACTUAL QUE ESTAMOS
            
            // if($get_rubro_pl->num_rows > 0){ // SI EXISTE RUBRO PLAN DE CUENTAS EN LA EMPRESA ACTUAL QUE ESTAMOS 
                if($get_plandecuenta_empresa_vinculada->num_rows > 0){ // SI EXISTE PLANES DE CUENTAS EN LA EMPRESA QUE VAMOS A VINCULAR
                    // REEMPLAZAMOS PLANES DE CUENTAS --> SE ESPERA QUE LOS PLANES DE CUENTAS AUN NO ESTEN SIENDO USADOS

                    $det_trans = $this->dbc->query("SELECT * FROM detalletransaccion WHERE idorganizacion = '$idempresa_vincula'");

                    if($det_trans->num_rows > 0){
                        // NO SE PODRA BORRAR PLANES DE CUENTAS DE LA EMPRESA A LA QUE QUEREMOS VINCULAR
                        $resp_a_usuario = FALSE;
                    }else{
                        // ELIMINAMOS PLAN DE CUENTAS Y AGRUPACCION_RUBRO
                        $eliminar_rubro = $this->dbc->query("DELETE FROM agrupacion_rubro_plandecuenta WHERE idempresa = '$idempresa_vincula'");
                        $eliminar_pl = $this->dbc->query("DELETE FROM plandecuenta WHERE organizacion_idorganizacion = '$idempresa_vincula'");

                        // DUPLICAR AGRUPACION_RUBRO Y PLANES DE CUENTAS

                        while($rubr = $this->dbc->fetch($get_rubro_pl)){
                            $registro_rubro = $this->dbc->query("INSERT INTO agrupacion_rubro_plandecuenta(tipo_plandecuenta,numero,idempresa)
                            VALUES ('$rubr[tipo_plandecuenta]','$rubr[numero]','$rubr[idempresa]')");
                        }
                        while($qwe = $this->dbc->fetch($get_plandecuenta_empresa_act)){
                            $registro_pl = $this->dbc->query("INSERT INTO plandecuenta(numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
                            VALUES ('$qwe[numero]','$qwe[nombreplan]','$qwe[descripcion]','$qwe[saldonormal]','$qwe[consolidar]','$qwe[idp]','$qwe[organizacion_idorganizacion]')");
                        }

                        $resp_a_usuario = TRUE;
                    }

                }else{ // NO EXISTEN PLANES DE CUENTAS EN LA EMPRESA QUE VAMOS A VINCULAR
                    // DUPLICAR AGRUPACION_RUBRO Y PLANES DE CUENTAS
                    while($rubr = $this->dbc->fetch($get_rubro_pl)){
                        $registro_rubro = $this->dbc->query("INSERT INTO agrupacion_rubro_plandecuenta(tipo_plandecuenta,numero,idempresa)
                        VALUES ('$rubr[tipo_plandecuenta]','$rubr[numero]','$rubr[idempresa]')");
                    }
                    while($qwe = $this->dbc->fetch($get_plandecuenta_empresa_act)){
                        $registro_pl = $this->dbc->query("INSERT INTO plandecuenta(numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
                        VALUES ('$qwe[numero]','$qwe[nombreplan]','$qwe[descripcion]','$qwe[saldonormal]','$qwe[consolidar]','$qwe[idp]','$qwe[organizacion_idorganizacion]')");
                    }

                    $resp_a_usuario = TRUE;
                }


        }else{ 
            // NO EXISTE PLAN DE CUENTAS EN LA EMPRESA ACTUAL DONDE NOS ENCONTRAMOS MOSTRAR MENSAJE DE ERROR
            $resp_a_usuario = FALSE;
        }
    
            if ($resp_a_usuario === TRUE) {        
                
                $registrar_vinculacion = $this->dbc->query("INSERT INTO vinculacion_empresas(idempresa_actual,idempresa_vinculada,idgestion_vinculada) VALUES ('$idempresa_act','$idempresa_vincula','$idgestion_vincula')");
                                                                                                                                                        
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        
        echo json_encode($res);
        
    }
    public function listar_gestiones_por_idempresa($idempresa) {
        $lista = [];
        // $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_gestion = $this->dbc->query("SELECT * FROM gestion WHERE idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($get_gestion)) {
            $res = array(
                "idgestion" => $qwe['idgestion'],
                "nombre" => $qwe['nombre']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function listar_vinculacion_empresas($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $get_vincu_empresa = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$idempresa'");
    
        if($get_vincu_empresa->num_rows > 0){
            while ($qwe = $this->dbc->fetch($get_vincu_empresa)) {

                $get_gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion = '$qwe[idgestion_vinculada]'");
                $gg = $get_gestion->fetch_assoc();

                $nombre_empresa = $this->dbe->query("SELECT nombreo FROM organizacion WHERE idorganizacion='$qwe[idempresa_vinculada]'");
                $name_em = $nombre_empresa->fetch_assoc();
                $res = array(
                    // "iddivisa" => $qwe['iddivisa'],
                    // "simbolo" => $qwe['simbolo'],
                    "nombre_empresa_vinculada" => $name_em['nombreo'],
                    "idgestion_vinculada" => $qwe['idgestion_vinculada'],
                    "nombre_gestion" => $gg['nombre']
                );
                array_push($lista, $res);
            }
        }else{

        }

        
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
        // echo json_encode(array($idempresa));
    }
    public function editar_divisa($id,$simbolo,$nombre,$empresa) {
        $idempresa = $this->getidempresa($empresa);

        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND iddivisa != '$id'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE divisa
                                    SET simbolo = '$simbolo',
                                    nombre = '$nombre'
                                    WHERE iddivisa = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar",$id,$nombre,$empresa);
            }
        }
        echo json_encode($res);
    }
    public function activar_divisa($iddivisa){
        $consulta = $this->dbc->query("SELECT * FROM divisa WHERE iddivisa = '$iddivisa'");
        $resultado = $consulta->fetch_assoc();
        $estadoDivisa = $resultado['estado'];
        $idempresa = $resultado['idempresa'];

        if($estadoDivisa == 2){ // desactivado
            // $edicionDivisa = $this->dbp->query("UPDATE divisas SET estado = '1' WHERE id_divisas = '$id_divisas'");
            $edicionDivisa = $this->dbc->query("UPDATE divisa
                                                SET estado = CASE
                                                    WHEN iddivisa = '$iddivisa' THEN 1
                                                    ELSE 2
                                                END
                                                WHERE idempresa = '$idempresa';
        ");

            $res = array("success", "la divisa se activo exitosamente","activar_divisa");
        }        
        echo json_encode($res);
    }
    public function eliminar_divisa($idcaracteristica,$idempresa){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbp->query("DELETE FROM caracteristicas WHERE idcaracteristicas = '$idcaracteristica'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("ok", "se elimino exitosamente","eliminarCaracteristica");
                } else {
                    $res = array("danger", "No se pudo registrar");
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
}
?>
