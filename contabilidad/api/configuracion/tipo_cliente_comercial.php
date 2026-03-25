<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php"; ini_set

class Tipo_cliente_comercial extends DB{
    public function registrar_tipo_cliente($tipo, $descripcion, $estado, $empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);

        $consulta = $this->dbcm->query("SELECT COUNT(*) AS total FROM tipocliente WHERE tipo = '$tipo' AND idempresa = '$ide'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if($totalRegistros > 0){
            $res = array("danger", "No se pudo registrar");

        }else{
        $registro = $this->dbcm->query("INSERT INTO tipocliente(tipo,descripcion,estado,idempresa)
        VALUES('$tipo','$descripcion','$estado','$ide')");

        }
        if ($registro === TRUE) {
            $res = array("success", "Se registro correctamente", "registrocliente");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function editar_tipo_cliente($id, $tipo, $descripcion, $estado)
    {
        $res = "";
        
        $registro = $this->dbcm->query("UPDATE tipocliente set tipo='$tipo',descripcion='$descripcion',estado='$estado' where idtipocliente='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Se registro correctamente", "registroclientef5");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function listar_tipo_cliente($empresa)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbcm->query("SELECT * FROM tipocliente where idempresa='$ide'");
        while ($qwe = $this->dbcm->fetch($registro)) {
            if($qwe['estado'] = '1'){
                $estado = 'activo';
            }else{ // 2
                $estado = 'inactivo';
            }
            $res = array("idtipocliente" => $qwe['idtipocliente'], "tipo" => $qwe['tipo'],
             "descripcion" => $qwe['descripcion'], "estado" => $estado, "idempresa" => $qwe['idempresa']);
            array_push($lista, $res);
        }
        echo  json_encode($lista);
    }
    public function listar_tipo_cliente_activos($empresa)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbcm->query("SELECT * FROM tipocliente where idempresa='$ide'");
        while ($qwe = $this->dbcm->fetch($registro)) {
            if($qwe['estado'] = '1'){
                $res = array("idtipocliente" => $qwe['idtipocliente'], "tipo" => $qwe['tipo'],
                "descripcion" => $qwe['descripcion'], "estado" => 'activo', "idempresa" => $qwe['idempresa']);
                array_push($lista, $res);
            }else{ // 2
               //no listara nada
            }
        }
        echo  json_encode($lista);
    }

    public function eliminar_tipo_cliente($id)
    {
        $res = "";
   
        $this->dbcm->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'cliente', 'campo' => 'tipo', 'mensaje' => 'No se puede eliminar']
                // ['tabla' => 'asiento', 'campo' => 'idcuenta', 'mensaje' => 'No se puede eliminar'],
                // ['tabla' => 'vinculacion_cuenta_xcxp ', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar'],
                // ['tabla' => 'relacionip', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar']
            ];
    
            foreach ($relacionadas as $relacion) {
                $query = "SELECT 1 FROM {$relacion['tabla']} WHERE {$relacion['campo']} = $id";
                $result = $this->dbcm->query($query);
                if ($result->num_rows > 0) {
                    throw new Exception($relacion['mensaje']);
                }
            }
    // $registro = $this->dbcm->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM tipocliente WHERE idtipocliente='$id'";
            $this->dbcm->query($query);
            
            $this->dbcm->commit();
            $res = array("success", "Se eliminó correctamente", "eliminarcliente");
    
        } catch (Exception $e) {
            $this->dbcm->rollback();
            $res = array("danger", $e->getMessage(), "eliminarcliente");
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