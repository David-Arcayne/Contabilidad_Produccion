<?php
require_once "../../db/db.php";
class Documento_cobro extends DB{
    public function registrar_otras_cuentas($fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago,$empresa){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        // echo json_encode(array($fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$condiciones,$observaciones,$precio,$forma_pago,$empresa));
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM otras_cuentas WHERE idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $nro_otras_cuentas = $resultado['total'] + 1;

        if (0 > 0) {
            $res = array("danger", "El registro ya existe","danger");
        } else {
            // Insertar el nuevo registro
        
            $registroProveedor = $this->dbc->query("INSERT INTO otras_cuentas(fecha,nro_otras_cuentas,lugar,cliente,nro_tributario,contacto,nro_doc_identidad,idtipo,concepto,condiciones,observaciones,precio,forma_pago,idempresa) 
            VALUES ('$fecha','$nro_otras_cuentas','$lugar','$cliente','$nro_tributario','$contacto','$nro_doc_identidad','$idtipo','$concepto','$condiciones','$observaciones','$precio','$forma_pago','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }
    public function listar_otras_cuentas($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' ORDER BY idotras_cuentas DESC");

        while ($qwe = $this->dbc->fetch($getPedido)) {
            $getTipo = $this->dbc->query("SELECT nombre FROM tipo WHERE idtipo = '$qwe[idtipo]'");
            $resultado2 = $getTipo->fetch_assoc();
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "cliente" => $qwe['cliente'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                "forma_pago" => $qwe['forma_pago']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function editar_otras_cuentas($idotras_cuentas,$fecha,$lugar,$cliente,$nro_tributario,$contacto,$nro_doc_identidad,$idtipo,$concepto,$condiciones,$observaciones,$precio,$forma_pago) {
        // $idempresa = $this->getidempresa($empresa);

        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre' AND empresa_idempresa = '$idempresa' AND idcaracteristicas != '$id'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE otras_cuentas
                                    SET fecha = '$fecha',
                                    lugar = '$lugar',
                                    cliente = '$cliente',
                                    nro_tributario = '$nro_tributario',
                                    contacto = '$contacto',
                                    nro_doc_identidad = '$nro_doc_identidad',
                                    idtipo = '$idtipo',
                                    concepto = '$concepto',
                                    condiciones = '$condiciones',
                                    observaciones = '$observaciones',
                                    precio = '$precio',
                                    forma_pago = '$forma_pago'
                                    WHERE idotras_cuentas = '$idotras_cuentas';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
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
}