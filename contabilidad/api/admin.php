<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Admin extends DB
{

    public function creartipoasiento($nombre, $detalle, $empresa)
    {
        // Obtener el ID de la empresa 
        $ide = $this->getidempresa($empresa);

        // Preparar la respuesta por defecto
        $res = array("ok" => "danger", "mensaje" => "Registro No es Correcto");

        // Verificar si se obtuvo un id válido de la empresa
        if (!$ide) {
            $res['mensaje'] = 'ID de empresa no válido';
            echo json_encode($res);
            return;
        }

        // Preparar la consulta SQL
        $stmt = $this->dbc->prepare("INSERT INTO tipotransaccion (idtipotransaccion, nombre, detalle, idempresa) VALUES (NULL, ?, ?, ?)");

        // Verificar si la preparación fue exitosa
        if ($stmt) {
            // Vincular los parámetros para evitar inyección SQL
            $stmt->bind_param("ssi", $nombre, $detalle, $ide);

            // Ejecutar la consulta
            if ($stmt->execute()) {
                $res = array("ok" => "success", "mensaje" => "Registro Correcto");
            } else {
                // Si hubo un error en la ejecución de la consulta
                $res['mensaje'] = 'Error en la ejecución de la consulta: ' . $stmt->error;
            }

            // Cerrar la consulta preparada
            $stmt->close();
        } else {
            // Si hubo un error en la preparación de la consulta
            $res['mensaje'] = 'Error en la preparación de la consulta: ' . $this->dbc->error;
        }

        // Devolver el resultado en formato JSON
        echo json_encode($res);
    }

    public function creartipoasientof5($id, $nombre, $detalle)
    {
        // Validación básica de entrada
        if (empty($id) || empty($nombre) || empty($detalle)) {
            $res = array("ok" => "danger", "mensaje" => "Faltan datos necesarios para actualizar el registro");
            echo json_encode($res);
            return;
        }

        // Preparar la respuesta por defecto
        $res = array("ok" => "danger", "mensaje" => "Registro no Correcto");

        // Preparar la consulta SQL con una consulta preparada
        $stmt = $this->dbc->prepare("UPDATE tipotransaccion SET nombre=?, detalle=? WHERE idtipotransaccion=?");

        if ($stmt) {
            // Vincular los parámetros para evitar inyección SQL
            $stmt->bind_param("ssi", $nombre, $detalle, $id);

            // Ejecutar la consulta
            if ($stmt->execute()) {
                // Verificar si la actualización fue exitosa
                if ($stmt->affected_rows > 0) {
                    $res = array("ok" => "success", "mensaje" => "Registro Correcto");
                } else {
                    $res['mensaje'] = 'No se realizaron cambios en el registro';
                }
            } else {
                // Si hubo un error en la ejecución de la consulta
                $res['mensaje'] = 'Error en la ejecución de la consulta: ' . $stmt->error;
            }

            // Cerrar la consulta preparada
            $stmt->close();
        } else {
            // Si hubo un error al preparar la consulta
            $res['mensaje'] = 'Error en la preparación de la consulta: ' . $this->dbc->error;
        }

        // Devolver el resultado en formato JSON
        echo json_encode($res);
    }

    public function creartipoasientodelete($id)
    {
        $this->dbc->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'asientotipo', 'campo' => 'tipo', 'mensaje' => 'No se puede eliminar']
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
    // $registro = $this->dbc->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM tipotransaccion WHERE idtipotransaccion = $id";
            $this->dbc->query($query);
            
            $this->dbc->commit();
            $res = array("success", "Se eliminó correctamente", "creartipoasientodelete");
    
        } catch (Exception $e) {
            $this->dbc->rollback();
            $res = array("danger", $e->getMessage(), "creartipoasientodelete");
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

    public function milistaplanes($empresa)
    {
        $ide = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("select idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,organizacion_idorganizacion,idp from plandecuenta where organizacion_idorganizacion='$ide' order by numero asc");
        while ($qwe = $this->dbc->fetch($registro)) {
            $res = array("id" => $qwe[0], "numero" => $qwe[1], "plan" => $qwe[2], "descripcion" => $qwe[3], "tipo" => $qwe[4], "consolidar" => $qwe[5], "empresa" => $qwe[6], "idp" => $qwe[7]);

            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroplanes($numero, $plan, $descripcion, $tipo, $idp, $empresa)
    {
        $ide = $this->getidempresa($empresa);
        
        $res = "";
        $consulta = $this->dbc->query("SELECT count(*) AS total FROM plandecuenta WHERE organizacion_idorganizacion='$ide' AND numero='$numero'");
        $resultado12 = $consulta->fetch_assoc();
        $totalCons = $resultado12['total'];

        if($totalCons > 0){
            $res = array("danger", "El numero de codigo ya existe");
        }elseif(empty($idp)){
            // $res = array("success", "Se registro Correctamente", "registroplanes"); registroplanesf5
          $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
            VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$ide')");
            if ($registro === TRUE) {
                $res = array("success", "Se registro Correctamente", "registroplanes");
            } else {
                $res = array("danger", "No s epudo registrar");
            }
        }else{
            $idp2 = $this->dbc->query("SELECT numero FROM plandecuenta WHERE idplandecuenta='$idp'");
            $resultado122 = $idp2->fetch_assoc();
            $numeroPadre = $resultado122['numero'];

            $codigo_padre = explode(".", $numeroPadre);
            $codigo = explode(".", $numero);
            if($codigo_padre[0] == $codigo[0]){
                // $res = array("success", "Se registro Correctamente", "registroplanes");
      
                $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
                VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$ide')");
                if ($registro === TRUE) {
                    $res = array("success", "Se registro Correctamente", "registroplanes");
                } else {
                    $res = array("danger", "No s epudo registrar");
                }
            }
            else{
                $res = array("danger", "El numero de codigo no esta en el rango permitido",$codigo_padre[0],$codigo[0],$idp);
            }
        }

        echo json_encode($res);
    }

    public function editarregistroplanes($idplan, $numero, $plan, $descripcion, $tipo, $idp,$empresa)
    {
        $ide = $this->getidempresa($empresa);
        $res = "";
        $consulta = $this->dbc->query("SELECT count(*) AS total FROM plandecuenta WHERE organizacion_idorganizacion='$ide' AND numero='$numero' AND idplandecuenta != '$idplan'");
        $resultado12 = $consulta->fetch_assoc();
        $totalCons = $resultado12['total'];

        if($totalCons > 0){
            $res = array("danger", "El numero de codigo ya existe");
        }elseif(empty($idp)){
            // $res = array("success", "Se registro Correctamente", "registroplanes");
        $registro = $this->dbc->query("UPDATE plandecuenta 
        SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp' where idplandecuenta='$idplan'");

        //   $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
            // VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$ide')");
            if ($registro === TRUE) {
                $res = array("success", "Se Edito Correctamente", "registroplanes");
            } else {
                $res = array("danger", "No se epudo registrar");
            }
        }else{
            $idp2 = $this->dbc->query("SELECT numero FROM plandecuenta WHERE idplandecuenta='$idp'");
            $resultado122 = $idp2->fetch_assoc();
            $numeroPadre = $resultado122['numero'];

            $codigo_padre = explode(".", $numeroPadre);
            $codigo = explode(".", $numero);
            if($codigo_padre[0] == $codigo[0]){
                // $res = array("success", "Se registro Correctamente", "registroplanes");
                $registro = $this->dbc->query("UPDATE plandecuenta 
        SET numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp' where idplandecuenta='$idplan'");
                // $registro = $this->dbc->query("INSERT INTO plandecuenta(idplandecuenta,numero,nombreplan,descripcion,saldonormal,consolidar,idp,organizacion_idorganizacion)
                // VALUES (NULL,'$numero','$plan','$descripcion','$tipo','2','$idp','$ide')");
                if ($registro === TRUE) {
                    $res = array("success", "Se Edito Correctamente", "registroplanes");
                } else {
                    $res = array("danger", "No s epudo registrar");
                }
            }
            else{
                $res = array("danger", "El numero de codigo no esta en el rango permitido",$codigo_padre[0],$codigo[0],$idp);
            }
        }
        // $registro = $this->dbc->query("update plandecuenta set numero='$numero',nombreplan='$plan',descripcion='$descripcion',saldonormal='$tipo',idp='$idp' where idplandecuenta='$idplan'");
        // if ($registro === TRUE) {
        //     $res = array("success", "Se Actualizo Correctamente", "registroplanes");
        // } else {
        //     $res = array("danger", "No se pudo registrar");
        // }
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
    // $registro = $this->dbc->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM plandecuenta WHERE idplandecuenta = $id";
            $this->dbc->query($query);
            
            $this->dbc->commit();
            $res = array("success", "Se eliminó correctamente", "deleteplan");
    
        } catch (Exception $e) {
            $this->dbc->rollback();
            $res = array("danger", $e->getMessage(), "deleteplan");
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
        $registro = $this->dbc->query("insert into tipodecambio(idtipodecambio,dolar,ufv,fecha,idorganizacion)values(NULL,'$dolar','$ufv','$fecha','$ide')");
        if ($registro === TRUE) {
            $res = array("success", "Se registro Correctamente", "registrotipocambio");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        echo json_encode($res);
    }

    public function registrotipodecambiof5($id, $dolar, $ufv, $fecha)
    {
        $res = "";
        $registro = $this->dbc->query("update tipodecambio set dolar='$dolar',ufv='$ufv',fecha='$fecha' where idtipodecambio='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Se registro Correctamente", "registrotipocambiof5");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
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
        $ide = $this->getidempresa($empresa);
        $res = "";
        $registro = $this->dbc->query("delete from tipodecambio where idorganizacion='$ide' and idtipodecambio='$id'");
        if ($registro == TRUE) {
            $res = array("ok" => "success");
        } else {
            $res = array("ok" => "danger");
        }
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
        $registro=$this->dbc->query("select t.idimpuesto,t.codigoimpuesto,t.nombreimpuesto,t.tasa,t.descripcion,t.idempresa from impuesto as t where t.idempresa='$ide'");
        while($qwe=$this->dbc->fetch($registro)){
            $res=array("id"=>$qwe[0],"codigoimpuesto"=>$qwe[1],"nombreimpuesto"=>$qwe[2],"tasa"=>$qwe[3],"descripcion"=>$qwe[4],"empresa"=>$qwe[5]);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    public function impuestocrear($empresa,$codigo,$nombre,$tasa,$descripcion){
        $res="";
        $ide=$this->getidempresa($empresa);
        $registro=$this->dbc->query("INSERT INTO impuesto(idimpuesto,codigoimpuesto,nombreimpuesto,tasa,descripcion,idempresa)VALUES(NULL,'$codigo','$nombre','$tasa','$descripcion','$ide')");
        if($registro===TRUE){
            $res=array("ok"=>"success","mensaje"=>"Se registro Correctamente");
        }else{
            $res=array("ok"=>"danger","mensaje"=>"No se registro Correctamente");
        }
        echo json_encode($res);
    }
    public function impuestocrearf5($idimpuesto,$codigo,$nombre,$tasa,$descripcion){
        $res="";
        //$ide=$this->getidempresa($empresa);
        $registro=$this->dbc->query("UPDATE impuesto SET codigoimpuesto='$codigo',nombreimpuesto='$nombre',tasa='$tasa',descripcion='$descripcion' WHERE idimpuesto='$idimpuesto'");
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
        $registro=$this->dbc->query("DELETE FROM impuesto  WHERE idimpuesto='$idimpuesto'");
        if($registro===TRUE){
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

    // Devolver resultados en JSON creartipoasientodelete
    $res = array("Datos Actualizados" => "Ingreso:$ingreso , Egreso:$egreso , Diario:$diario");
    echo json_encode($res);
}


}
