<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; editar

class Reporte_evolucion_patrimonio extends DB{

    private function obtenerGestionAnterior($idgestion_actual) {
            // $idempresa = $this->getidempresa($empresa);
            $lista = [];
        

        $gestion = $this->dbc->query("SELECT * FROM gestion WHERE idgestion ='$idgestion_actual'");
                $gst = $gestion->fetch_assoc();

        $fechaInicio = new DateTime($gst['fechaini']);
        $fechaAnteriorEsperada = (clone $fechaInicio)->modify('-1 day')->format('Y-m-d');

        $todas_gestiones = $this->dbc->query("SELECT * FROM gestion WHERE idempresa ='$gst[idempresa]'");
        // Buscar la gestión cuya fechafin coincida con la fecha anterior esperada
        $idgestion_anterior = 0;
        while ($qwe = $this->dbc->fetch($todas_gestiones)) {
            if ($qwe['fechafin'] == $fechaAnteriorEsperada) {
                $idgestion_anterior = $qwe['idgestion'];
                // $res = array(
                //     "idgestion_anterior" => $qwe['idgestion'],
                // );
                // array_push($lista, $res);
            }
            
        }
        return $idgestion_anterior;
        // echo json_encode(array()$lista, JSON_NUMERIC_CHECK);
        // echo json_encode(array($idgestion_anterior));
    }

    public function select_patrimonio_gestion_anterior($idgestion_actual) {

        $lista = [];
        $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        $selct_patrimonio = $this->dbc->query("SELECT * FROM balance_general_por_gestion WHERE idgestion ='$gestion_ant' and grupo='3' and nivel ='2'");
    
        while ($qwe = $this->dbc->fetch($selct_patrimonio)) {
            $res = array(
                "idbalance_general_por_gestion" => $qwe['idbalance_general_por_gestion'],
                "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                "nombre_actual" => $qwe['nombre_actual'],
                "valor" => $qwe['valor'],
                "idgestion" => $qwe['idgestion'],
                "idempresa" => $qwe['idempresa']
            );
            array_push($lista, $res);
        }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_actualizacion_patrimonio($idplantilla_reporte,$idcuenta_patrimonio,$valor,$idgestion,$idempresa){//ESTA API SERA PARA EL REGISTRO DE LA PLANTILLA DE ACTUALIZACION PATRIMONIO
        // $idempresa = Empresa::getidempresa($empresa);
        // $idempresa = $this->getidempresa($empresa);
       
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO actualizacion_patrimonio(idplantilla_reporte,idcuenta_patrimonio,valor,idgestion,idempresa) 
            VALUES ('$idplantilla_reporte','$idcuenta_patrimonio','$valor','$idgestion','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                // $res = array("success", "Registro exitoso","registroCaracteristicas");
                $res = array(
                        "success" => true,
                        "message" => "Registro exitoso",
                        "message_code"   => "registro_exitoso"
                    );
            } else {
                // $res = array("danger", "No se pudo registrar");
                $res = array(
                        "success" => false,
                        "message" => "Ocurrio un error",
                        "message_code"   => "error_registro"
                    );
            }
        
        echo json_encode($res);
        
    }

    public function listar_planilla_actualizacion_patrimonio($idplantilla_reporte,$empresa) {

    $idempresa = $this->getidempresa($empresa);
        $lista = [];
        // $gestion_ant =$this->obtenerGestionAnterior($idgestion_actual);
        $list_act_patr = $this->dbc->query("SELECT * FROM actualizacion_patrimonio WHERE idplantilla_reporte ='$idplantilla_reporte' AND idempresa ='$idempresa'");
    
        while ($qwe = $this->dbc->fetch($list_act_patr)) {
            $res = array(
                "idactualizacion_patrimonio" => $qwe['idactualizacion_patrimonio'],
                "idplantilla_reporte" => $qwe['idplantilla_reporte'],
                "idcuenta_patrimonio" => $qwe['idcuenta_patrimonio'],
                "valor" => $qwe['valor']
            );
            array_push($lista, $res);
        }
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function registrar_operacion_actualizacion_patrimonio($idcuenta_involucrada,$columna_involucrada,$operacion,$idcuenta_padre,$idgestion,$idempresa){
        // $idempresa = Empresa::getidempresa($empresa);
        // $idempresa = $this->getidempresa($empresa);
       
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO agrupacion_actualizacion_patrimonio(idcuenta_involucrada,columna_involucrada,operacion,idcuenta_padre,registro_desde,idgestion,idempresa) 
            VALUES ('$idcuenta_involucrada','$columna_involucrada','$operacion','$idcuenta_padre','actualizacion_patrimonio','$idgestion','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                // $res = array("success", "Registro exitoso","registroCaracteristicas");

                $res = array(
                        "success" => true,
                        "message" => "Registro exitoso",
                        "message_code"   => "registro_exitoso"
                    );
                
            } else {
                // $res = array("danger", "No se pudo registrar");
                $res = array(
                        "success" => false,
                        "message" => "Ocurrio un error",
                        "message_code"   => "error_registro"
                    );
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