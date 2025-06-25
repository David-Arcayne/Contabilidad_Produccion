<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php";

class Firma_reporte extends DB{
    public function registrar_firma_reporte($idtrabajador,$funcion,$tipo_reporte,$matricula,$empresa){
        // $idempresa = Empresa::getidempresa($empresa);
        $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El registro ya existe","Error");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO firma_reporte(idtrabajador,funcion,tipo_reporte,matricula,idempresa) VALUES ('$idtrabajador','$funcion','$tipo_reporte','$matricula','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }

    public function listar_firma_reporte($empresa) {
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $firma_reporte = $this->dbc->query("SELECT * FROM firma_reporte
        WHERE idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($firma_reporte)) {

            // $usuario = $this->dbrh->query("SELECT * FROM usuario u
            // WHERE idusuario = '$qwe[idusuario]'");

            // $usuario_trabajador=$this->dbrh->query("SELECT u.nombre AS usuario_nombre, t.nombre AS nombre_trabajador, t.apellido, t.ci,t.idtrabajador 
            // FROM usuario AS u 
            // INNER JOIN trabajador AS t ON t.idtrabajador = u.trabajador_idtrabajador
            // WHERE u.idusuario = '$qwe[idusuario]'");

        $usuario_trabajador=$this->dbrh->query("SELECT 
                t.idtrabajador,
                t.nombre AS nombre_trabajador,
                t.apellido,
                t.ci,
                u.idusuario,
                u.nombre AS usuario_nombre
            FROM trabajador AS t
            LEFT JOIN usuario AS u 
                ON u.trabajador_idtrabajador = t.idtrabajador 
                AND t.idtrabajador = '$qwe[idtrabajador]'");
            $traba = $usuario_trabajador->fetch_assoc();

            // $datos_usuario = $usuario->fetch_assoc();
            $res = array( // nombre   apellido   ci   cargo
                "idfirma_reporte" => $qwe['idfirma_reporte'],
                "idtrabajador" => $qwe['idtrabajador'],
                "idusuario" => $traba['idusuario'],
                "usuario_nombre" => $traba['usuario_nombre'],
                "nombre_trabajador" => $traba['nombre_trabajador']." ".$traba['apellido'],
                "funcion" => $qwe['funcion'], 
                "tipo_reporte" => $qwe['tipo_reporte'],
                "matricula" => $qwe['matricula']
            );
            array_push($lista, $res);
        }

        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

    public function listar_firmas_todos_reportes($tipo_reporte,$empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $firma_reporte = $this->dbc->query("SELECT * FROM firma_reporte 
        WHERE tipo_reporte = '$tipo_reporte' AND idempresa = '$idempresa'");
    
        while ($qwe = $this->dbc->fetch($firma_reporte)) {

            $usuario = $this->dbrh->query("SELECT * FROM usuario u 
            INNER JOIN trabajador t ON t.idtrabajador = u.trabajador_idtrabajador
            INNER JOIN cargos c ON c.idcargos = t.cargos_idcargos
            WHERE t.idtrabajador = '$qwe[idtrabajador]'");

            $datos_usuario = $usuario->fetch_assoc();

            $res = array( // nombre   apellido   ci   cargo
                "idusuario" => $datos_usuario['idusuario'],
                "nombre" => $datos_usuario['nombre'], 
                "apellido" => $datos_usuario['apellido'],
                "ci" => $datos_usuario['ci'],
                "matricula" => $qwe['matricula'],
                "cargo" => $qwe['funcion']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

     public function firmas($empresa,$modulo){
        $ide=$this->getidempresa($empresa);
        $lista=[];
        $planes=$this->dba->query("select * from planes where orden='$modulo'");
        $pla=$this->dba->fetch($planes);
        $idp=$pla['idplanes'];
        $registro=$this->dbe->query("SELECT nombref,cargof,numeroid from firmas where organizacion_idorganizacion='$ide' and idmodulo='$idp'");
        
        while($qwe=$this->dbe->fetch($registro)){
            
            $res=array("nombre"=>$qwe[0],"cargo"=>$qwe[1],"numero"=>$qwe[2]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    
    public function editar_firma_reporte($id,$idtrabajador,$funcion,$tipo_reporte,$matricula) {
        // $idempresa = $this->getidempresa($empresa);

        // $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM divisa WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND iddivisa != '$id'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("danger", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbc->query("UPDATE firma_reporte
                                    SET idtrabajador = '$idtrabajador',
                                    funcion = '$funcion',
                                    tipo_reporte = '$tipo_reporte',
                                    matricula = '$matricula'
                                    WHERE idfirma_reporte = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editarCaracteristicas");
            } else {
                $res = array("danger", "No se pudo editar");
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
    public function eliminar_firma_reporte($id){

            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbc->query("DELETE FROM firma_reporte WHERE idfirma_reporte = '$id'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminarCaracteristica");
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
