<?php
session_start();
//require_once "db.php"; lista_cobrar_cobrado_factura crearfacturas listadesconsolidar decode cuentaspof 
require_once "../../db/db.php";
class Contabilidad extends DB
{//registroasiento eliminarasiento

    public function registrardesconsolidar($idtransaccion,$motivo,$estado,$hora,$fecha,$idusuario,$idempresa){
        $res="";
        $usuario=$this->getidusuario($idusuario);
        $empresa=$this->getidempresa($idempresa);
        $codigo=date("Ymd").rand(100,1000);
        $registro=$this->dbc->query("INSERT INTO desconsolidar(idtransaccion,motivo,estado,hora,fecha,idusuario,idempresa,codigo)VALUES('$idtransaccion','$motivo','$estado','$hora','$fecha','$usuario','$empresa','$codigo')");
        if($registro===TRUE){
            $res=array("ok"=>"success");
        }else{
            $res=array("ok"=>"danger $idtransaccion,$motivo,$estado,$hora,$fecha,$idusuario");
        }
        echo json_encode($res);

    }

    public function rangosolicituddesconsolidar($nTrainicio, $nTrafinal, $motivo, $estado, $hora, $fecha, $idusuario, $idempresa) {
        $res = [];
        $usuario = $this->getidusuario($idusuario);
        $empresa = $this->getidempresa($idempresa);
        $codigo = date("Ymd") . rand(100, 1000);
        
        try {
            // Inicialización de la variable de éxito de inserción y de datos registrogestion
            $insertSuccess = true;
            $datos = [];
    
            // Consulta para obtener las transacciones
            $transa = $this->dbc->query("SELECT t.idtransacciones AS transaccion, t.codigotransaccion
                FROM transacciones AS t 
                WHERE t.codigotransaccion >= '$nTrainicio' 
                  AND t.codigotransaccion <= '$nTrafinal' 
                  AND t.organizacion_idorganizacion = '$empresa'
            ");
            
            // Verificación de la consulta de transacciones
            if (!$transa) {
                throw new Exception("Error al consultar transacciones: " . $this->dbc->error);
            }
            
            // Iteración sobre los resultados de la consulta de transacciones
            while ($qwe = $this->dbc->fetch($transa)) {
                // Inserción en la tabla desconsolidar
                $registro = $this->dbc->query("INSERT INTO desconsolidar (idtransaccion, motivo, estado, hora, fecha, fechaproceso, horaproceso, idusuario, idempresa, codigo)
                    VALUES ('{$qwe['transaccion']}', '$motivo', '$estado', '$hora', '$fecha', NULL, NULL, '$usuario', '$empresa', '$codigo')
                ");
    
                // Verificación de la consulta de inserción
                if (!$registro) {
                    $insertSuccess = false; // Marcar como falso si alguna inserción falla
                    throw new Exception("Error al insertar en desconsolidar: " . $this->dbc->error);
                }
    
                // Agregar datos al arreglo
                //$datos[] = ["datos" => $qwe['transaccion']];
            }
    
            // Comprobación del éxito de todas las inserciones
            if ($insertSuccess) {
                $res = ["ok" => "success"];
            } else {
                throw new Exception("Error al insertar en la tabla desconsolidar");
            }
        } catch (Exception $e) {
            $res = ["ok" => "error", "message" => $e->getMessage()];
        }
    
        // Devolver respuesta en JSON
        echo json_encode($res, JSON_PRETTY_PRINT);
    }
     
    

    public function listadesconsolidar($idempresa) {
        $lista = [];
        
        // Consulta SQL
        $sql =$this->dbc->query("SELECT 
                d.iddesconsolidar, 
                d.idtransaccion, 
                MIN(t.codigotransaccion) AS desde_primero,
                MAX(t.codigotransaccion) AS desde_ultimo,
                d.motivo, 
                d.estado, 
                d.hora, 
                d.fecha, 
                d.idusuario, 
                d.codigo,
                d.horaproceso,
                d.fechaproceso, 
                COUNT(*) AS cantidad
            FROM 
                desconsolidar AS d
            INNER JOIN 
                transacciones AS t 
                ON t.idtransacciones = d.idtransaccion
            WHERE 
                md5(d.idempresa) = '$idempresa'
            GROUP BY 
                d.codigo
            ORDER BY 
                d.estado = '0' DESC,
                d.fecha DESC,
                d.hora DESC;
        ");
    
            // Procesar los resultados
            while ($qwe = $this->dbc->fetch($sql)) {
               $usuario = $this->getusuario($qwe['idusuario']); // Asegúrate de que esta función retorne los campos esperados
                $usuariob = isset($qwe['idusuariob']) ? $this->getusuario($qwe['idusuariob']) : null;
                /*"
                    */
    
                $lista[] = [
                    "iddesconsolidar" => $qwe['iddesconsolidar'],
                    "idtransaccion" => $qwe['idtransaccion'],
                    "numerotransaccion" => $qwe['desde_primero'], // Se ajusta a la consulta actual
                    "motivo" => $qwe['motivo'],
                    "estado" => $qwe['estado'],
                    "hora" => $qwe['hora'],
                    "fecha" => $qwe['fecha'],
                    "horaproceso" => $qwe['horaproceso'],
                    "fechaproceso" => $qwe['fechaproceso'],
                    "grupo" => $qwe['codigo'],
                    "cantidad" => $qwe['cantidad'],
                    "desde_primero" => $qwe['desde_primero'],
                    "desde_ultimo" => $qwe['desde_ultimo'],
                    "usuario" => $usuario['usuario'] ?? null,
                    "nombre" => $usuario['nombre'] ?? null,
                    "apellido" => $usuario['apellido'] ?? null,
                    "usuariob" => $usuariob['usuario'] ?? null,
                    "nombreb" => $usuariob['nombre'] ?? null,
                    "apellidob" => $usuariob['apellido'] ?? null
                ];
            }
    
            
        
    
        // Retornar la lista en formato JSON
        echo json_encode($lista);
    }
         

    public function cambiarestadoconsolidado($grupo,$estado,$fecha,$hora,$idusuario){
//actualizar esto:

        $res="";
        $registro=$this->dbc->query("UPDATE desconsolidar SET estado='$estado',fechaproceso='$fecha',horaproceso='$hora' WHERE codigo='$grupo'");
        //consolidar es 2 y desconsolidar es 1
        if($estado==1){
            $desconsolidar=$this->dbc->query("SELECT * FROM desconsolidar WHERE codigo='$grupo'");
            while($qwe=$this->dbc->fetch($desconsolidar)){
                $descTRan=$this->dbc->query("UPDATE transacciones SET consolidar='$estado' WHERE idtransacciones='$qwe[idtransaccion]'");
            }
        }
        if($registro===TRUE){
            $res=["ok"=>"success"];
        }else{
            $res=["ok"=>"danger"];
        }
        

        echo json_encode($res);

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
    
    public function registrorelacionip($idimpuesto,$idplandecuenta,$idempresa){
        $fecha=date("Y-m-d");
        $empresa=$this->getidempresa($idempresa);
        $res="";
//idplandecuenta ='$idplandecuenta'
        $registro=$this->dbc->query("SELECT * FROM relacionip WHERE idimpuesto ='$idimpuesto' AND idempresa = '$empresa'");

        $registro=$this->dbc->query("INSERT INTO relacionip(idimpuesto,idplandecuenta,fecha,idempresa)VALUES('$idimpuesto','$idplandecuenta','$fecha','$empresa')");
        if($registro===TRUE){
            $res=array("ok"=>"success");
        }else{
            $res=array("ok"=>"danger");
        }

        echo json_encode($res);

    }
    public function lista_plan_cuenta_no_vinculada($empresa)
    {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        // Consulta optimizada
        $sql = $this->dbc->query("SELECT * 
        FROM plandecuenta 
        WHERE organizacion_idorganizacion = '$idempresa' 
        AND idplandecuenta NOT IN (SELECT idplandecuenta FROM relacionip WHERE idempresa = '$idempresa')  ORDER BY numero ASC;");
    //WHERE d.transacciones_idtransacciones = '$trans' ORDER BY d.orden ASC
        // Ejecuta la consulta
        // $transdeta = $this->dbc->query($sql);
        
        // Procesa los resultados
        while ($qwe = $this->dbc->fetch($sql)) {
            $facturas=$this->dbc->query("SELECT COUNT(*) as listafactura
                    FROM factura AS f 
                    WHERE f.cuenta = $qwe[7]");
            $fa=$this->dbc->fetch($facturas);
            $res = array(
                "idplandecuenta" => $qwe['idplandecuenta'],
                "numero"=>$qwe['numero'],
                "nombreplan" => $qwe['nombreplan'],
                "saldonormal" => $qwe['saldonormal']
            );
    
            array_push($lista, $res);
        }
    
        echo json_encode($lista);
    }
   
    public function registrorelacionipf5($id,$idimpuesto,$idplandecuenta,$idempresa){
        $fecha=date("Y-m-d");
        $empresa=$this->getidempresa($idempresa);
        $res="";
        $registro=$this->dbc->query("UPDATE relacionip SET idimpuesto='$idimpuesto',idplandecuenta='$idplandecuenta' WHERE idrelacionip='$id'");
        if($registro===TRUE){
            $res=array("ok"=>"success");
        }else{
            $res=array("ok"=>"danger");
        }

        echo json_encode($res);

    }

    public function deleterelacionip($id){
        $res="";
        $registro=$this->dbc->query("DELETE FROM relacionip WHERE idrelacionip='$id'");
        if($registro===TRUE){
            $res=array("ok"=>"success");
        }else{
            $res=array("ok"=>"danger");
        }
        echo  json_encode($res);
    }

    public function getimpuesto($idimpuesto){
        $registro = $this->dbc->query("SELECT t.idimpuesto, t.codigoimpuesto, t.nombreimpuesto, t.tasa, t.descripcion, t.idempresa FROM impuesto as t WHERE t.idimpuesto='$idimpuesto'");
        $qwe = $this->dbc->fetch($registro);
        return [
            "codigo" => $qwe['codigoimpuesto'],
            "impuesto" => $qwe['nombreimpuesto'],
            "tasa" => $qwe['tasa']
        ];    
    }
    
    public function getplandecuenta($idplan) {
        $registro = $this->dbc->query("SELECT numero, nombreplan, saldonormal FROM plandecuenta WHERE idplandecuenta='$idplan'");
        $qwe = $this->dbc->fetch($registro);
        return [
            "numero" => $qwe['numero'],
            "nombreplan" => $qwe['nombreplan'],
            "saldonormal" => $qwe['saldonormal']
        ];
    }
    
    public function listarelacionip($ide) {
        $lista = [];
        $registro = $this->dbc->query("SELECT r.idrelacionip, r.idimpuesto, r.idplandecuenta, r.fecha FROM relacionip as r WHERE md5(r.idempresa)='$ide'");
    
        while ($row = $this->dbc->fetch($registro)) {
            $impuesto = $this->getimpuesto($row['idimpuesto']);
            $plan = $this->getplandecuenta($row['idplandecuenta']);
    
            $lista[] = [
                "id" => $row['idrelacionip'],
                "idimpuesto"=>$row['idimpuesto'],
                "idplandecuenta"=>$row['idplandecuenta'],
                "codigo" => $impuesto['codigo'],
                "impuesto" => $impuesto['impuesto'],
                "tasa" => $impuesto['tasa'],
                "plannumero" => $plan['numero'],
                "plancuenta" => $plan['nombreplan'],
                "plantipo" => $plan['saldonormal'],
                "fecha" => $row['fecha'],
            ];
        }
    
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }

    public function listaimpuestoentreplan($ide){
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
    
    public function plancuentasout($ide){
        $lista=[];
        $registro=$this->dbc->query("SELECT p.idplandecuenta, p.numero, p.nombreplan, p.descripcion, p.saldonormal, p.consolidar, p.idp FROM plandecuenta as p
INNER JOIN relacionip as r ON r.idplandecuenta!= p.idplandecuenta
WHERE md5(p.organizacion_idorganizacion)='$ide'");
        while($qwe=$this->dbc->fetch($registro)){
            $lista=[
                "id"=>$qwe[0],
                "numero"=>$qwe[1],
                "plan"=>$qwe[2],
                "descripcion"=>$qwe[3],
                "tipo"=>$qwe[4],
                "estado"=>$qwe[5],
                "idp"=>$qwe[6]
            ];
        }
        echo json_encode($lista);

    }

    public function tipotransaccion()
    {
        $lista = [];
        
        $registro = $this->dba->query("SELECT idtipotransaccion, nombre, detalle FROM tipotransaccion");
        
            while ($row = $this->dba->fetch($registro)) {
                $res=array('idtipotransaccion' => $row['idtipotransaccion'],
                    'nombre' => $row['nombre'],
                    'detalle' => $row['detalle']);
                array_push($lista,$res);
            }
            echo json_encode($lista); 
            
                
    }

    public function consolidar($id,$tipo){
        $res="";
        $registro=$this->dbc->query("UPDATE transacciones SET consolidar='$tipo' WHERE idtransacciones='$id' ");
        if($registro===TRUE){
            $res=array("ok"=>"success");
        }else{
            $res=array("ok"=>"danger");
        }
        echo  json_encode($res);
    }
    


    public function getgestionactualC($empresa)
    {
        $orga = $this->getidempresa($empresa); // recibe md5 de la id
        $res = "";
        $registro = $this->dbc->query("SELECT * FROM gestion WHERE idempresa='$orga' AND estado='2' LIMIT 1");
        $qwe = $this->dbc->fetch($registro);

        // Retorna un array asociativo con la información
        return array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre']);
    }

    public function insertartransaccionen($codigo, $fecha, $tipocambio, $tipotransaccion, $glosa, $empresa, $sucursal)
    {
        $ndocumento = "0";
        $ide = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        $gestion = $this->getgestionactualC($empresa);
        $idgestion = $gestion["id"];
        $res = "";
        // aqui la condicional si hay una nueva gestion
        $trans = $this->dbc->query("select * from transacciones where codigotransaccion='$codigo' and organizacion_idorganizacion='$ide' and idgestion='$idgestion'");
        $qwe = $this->dbc->fetch($trans);
        if ($qwe === TRUE) {
            $codigon = $codigo - 1;
            $writetrans = $this->dbc->query("insert into transacciones(idtransacciones,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,tipotransaccion_idtipotransaccion,organizacion_idorganizacion,sucursal,idgestion)value(NULL,'$codigon','$fecha','$tipocambio','$ndocumento','$glosa','1','$tipotransaccion','$ide','$idsucursal','$idgestion')");

            //$codigou=$codigo+1;
            // Incrementar el código de las transacciones restantes en la misma gestión

            $updatetranscodigo = $this->dbc->query("UPDATE transacciones SET codigotransaccion = codigotransaccion + 1 WHERE codigotransaccion > '$codigo' AND organizacion_idorganizacion = '$ide' AND idgestion = '$idgestion'");
            /*
        $trans=$this->dbc->query("select * from transacciones where codigotransaccion>'$codigo' and organizacion_idorganizacion='$ide' and idgestion='$idgestion'");
        while($qwe=$this->dbc->fetch($trans)){
            $codigou=$qwe['codigotransaccion']+1;
        $updatetranscodigo = $this->dbc->query("UPDATE transacciones SET codigotransaccion ='$codigou' WHERE  organizacion_idorganizacion = '$ide' AND idgestion = '$idgestion'");
        }
        */

            if ($writetrans === TRUE) {
                $res = array("success", "Se Registro Correctamente", "registrotransaccion");
            } else {
                $res = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
            }
        }
        echo json_encode($res);
    }

    
    public function listadetalletransaccionTest($trans)
    {
        $lista = [];
        $transdeta = $this->dbc->query("select d.iddetalletransaccion,p.nombreplan,d.debe,d.haber,d.nota,d.estado,d.idorganizacion,d.idplandecuenta from detalletransaccion as d,plandecuenta as p where p.idplandecuenta=d.idplandecuenta and d.transacciones_idtransacciones='$trans'");
        while ($qwe = $this->dbc->fetch($transdeta)) {
            $listafactura = $this->dbc->query("SELECT COUNT(*) AS cantidad 
            FROM factura AS f 
            WHERE f.cuenta = '$qwe[7]';
            ");
            $fact=$this->dbc->fetch($listafactura);

            $res = array("id" => $qwe[0], "plan" => $qwe[1], "debe" => $qwe[2], "haber" => $qwe[3], "nota" => $qwe[4], "estado" => $qwe[5], "idempresa" => $qwe[6], "idplan" => $qwe[7],"factura"=>$fact['cantidad']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registrocliente($nombre, $nombrecomercial, $tipo, $tipodocumento, $nit, $email, $direccion, $telefono, $mobil, $pais, $ciudad, $zona, $web, $contacto, $detalle, $empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);
        $codigo = "CON-" . date("Ymdhi");
        $registro = $this->dbcm->query("insert into cliente(id_cliente,nombre,nombrecomercial,tipo,codigo,nit,detalle,direccion,telefono,mobil,email,web,pais,ciudad,zona,contacto,idempresa,tipodocumento)values(NULL,'$nombre','$nombrecomercial','$tipo','$codigo','$nit','$detalle','$direccion','$telefono','$mobil','$email','$web','$pais','$ciudad','$zona','$contacto','$ide','$tipodocumento')");
        if ($registro === TRUE) {
            $res = array("success", "Se registro correctamente", "registrocliente");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function registroclientef5($idc, $nombre, $nombrecomercial, $tipo, $tipodocumento, $nit, $email, $direccion, $telefono, $mobil, $pais, $ciudad, $zona, $web, $contacto, $detalle, $empresa)
    {
        $res = "";
        $codigo = "CON-" . date("Ymdhi");
        $registro = $this->dbcm->query("update cliente set nombre='$nombre',nombrecomercial='$nombrecomercial',tipo='$tipo',codigo='$codigo',nit='$nit',detalle='$detalle',direccion='$direccion',telefono='$telefono',mobil='$mobil',email='$email',web='$web',pais='$pais',ciudad='$ciudad',zona='$zona',contacto='$contacto',tipodocumento='$tipodocumento' where id_cliente='$idc'");
        if ($registro === TRUE) {
            $res = array("success", "Se registro correctamente", "registroclientef5");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function listaclientes($id)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $ide = $this->getidempresa($id);
        $registro = $this->dbcm->query("SELECT c.id_cliente,c.nombre, c.nombrecomercial, c.tipo , c.codigo,c.nit, c.detalle,c.direccion,c.telefono,c.mobil,c.email,c.web,c.pais, c.ciudad,c.zona,c.contacto, c.tipodocumento FROM cliente as c where c.idempresa='$ide' order by c.nombre asc");
        while ($qwe = $this->dbcm->fetch($registro)) {
            $res = array("id" => $qwe[0], "nsocial" => $qwe[1], "ncomercial" => $qwe[2], "tipo" => $qwe[3], "codigo" => $qwe[4], "nit" => $qwe[5], "detalle" => $qwe[6], "direccion" => $qwe[7], "telefono" => $qwe[8], "mobil" => $qwe[9], "email" => $qwe[10], "web" => $qwe[11], "pais" => $qwe[12], "ciudad" => $qwe[13], "zona" => $qwe[14], "contacto" => $qwe[15], "tdocumento" => $qwe[16]);
            array_push($lista, $res);
        }
        echo  json_encode($lista);
    }

    public function eliminarcliente($id)
    {
        $res = "";
   
        $this->dbcm->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'factura', 'campo' => 'proveedorcliente_idproveedorcliente', 'mensaje' => 'No se puede eliminar']
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
    // $registro = $this->dbcm->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM cliente WHERE id_cliente='$id'";
            $this->dbcm->query($query);
            
            $this->dbcm->commit();
            $res = array("success", "Se eliminó correctamente", "eliminarcliente");
    
        } catch (Exception $e) {
            $this->dbcm->rollback();
            $res = array("danger", $e->getMessage(), "eliminarcliente");
        }
        echo json_encode($res);
    }

    public function registroproveedor($nombre, $nit, $pais, $ciudad, $zona, $direccion, $telefono, $mobil, $detalle, $empresa)
    {
        $ide = $this->getidempresa($empresa);
        $res = "";
        $codigo = "CON-" . date("Ymdhi");
        $registro = $this->dbcm->query("insert into proveedor(id_proveedor,nombre,codigo,nit,detalle,direccion,telefono,mobil,email,web,pais,ciudad,zona,contacto,id_empresa)values(NULL,'$nombre','$codigo','$nit','$detalle','$direccion','$telefono','$mobil','0','0','$pais','$ciudad','$zona','0','$ide')");
        if ($registro === TRUE) {
            $res = array("success", "Se registro correctamente", "registroproveedor");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function registroproveedorf5($idp, $nombre, $nit, $pais, $ciudad, $zona, $direccion, $telefono, $mobil, $detalle)
    {
        $res = "";
        $codigo = "CON-" . date("Ymdhi");
        $registro = $this->dbcm->query("update proveedor set nombre='$nombre',nit='$nit',detalle='$detalle',direccion='$direccion',telefono='$telefono',mobil='$mobil',pais='$pais',ciudad='$ciudad',zona='$zona' where id_proveedor='$idp'");
        if ($registro === TRUE) {
            $res = array("success", "Se registro correctamente", "registroproveedorf5");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function listaproveedores($id)
    {
        $lista = [];
        $ide = $this->getidempresa($id);
        $registro = $this->dbcm->query("SELECT p.id_proveedor,p.nombre,p.nit,p.detalle,p.direccion,p.telefono,p.mobil,p.email,p.web,p.pais,p.ciudad,p.zona,p.contacto from proveedor as p
        where p.id_empresa='$ide'");
        while ($qwe = $this->dbcm->fetch($registro)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "nit" => $qwe[2], "detalle" => $qwe[3], "direccion" => $qwe[4], "telefono" => $qwe[5], "mobil" => $qwe[6], "email" => $qwe[7], "web" => $qwe[8], "pais" => $qwe[9], "ciudad" => $qwe[10], "zona" => $qwe[11], "contacto" => $qwe[12]);
            array_push($lista, $res);
        }
        echo  json_encode($lista);
    }
    public function eliminarproveedor($id)
    {
        $res = "";
        // $registro = $this->dbcm->query("delete from proveedor where id_proveedor='$dato'");
        // if ($registro === TRUE) {
        //     $res = array("success", "Se registro correctamente");
        // } else {
        //     $res = array("danger", "No s epudo realizar");
        // }
// -----------------------------------------------------------------------------------
        $this->dbcm->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'factura', 'campo' => 'proveedorcliente_idproveedorcliente', 'mensaje' => 'No se puede eliminar']
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
    // $registro = $this->dbcm->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM proveedor WHERE id_proveedor='$id'";
            $this->dbcm->query($query);
            
            $this->dbcm->commit();
            $res = array("success", "Se eliminó correctamente", "eliminarproveedor");
    
        } catch (Exception $e) {
            $this->dbcm->rollback();
            $res = array("danger", $e->getMessage(), "eliminarproveedor");
        }
        echo json_encode($res);
    }

    public function crearfacturas($fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento, $espesificacion, $cliente, $cobro, $pagar, $trans, $clasefactura, $cuenta, $empresa, $sucursal)
    {
        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function crearfacturasapi($fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento, $espesificacion, $cliente, $cobro, $pagar, $trans, $clasefactura, $cuenta, $empresa, $sucursal)
    {
        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function crearfacturasf5($id, $fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento, $espesificacion, $cliente, $cobro, $pagar, $trans, $clasefactura, $cuenta)
    {
        //$idsucursal=$this->getidsucursal($sucursal);
        //$idempresa=$this->getidempresa($empresa); crearsolofacturasapi
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = "";
        $registro = $this->dbc->query("update factura set fecha='$fecha',nfactura='$nfactura', nautorizacion='$nautorizacion', codigocontrol='$codigocontrol',montofactura='$monto', tasa0='$tasacero', export='$export', npoliza='$npoliza', iceiecdhotros='$ice', descuentobonificacion='$descuento',clasefactura='$clasefactura', cobrado='$co', pagado='$pa', espesificacion='$espesificacion',transacciones_idtransacciones='$trans', proveedorcliente_idproveedorcliente='$cliente',  cuenta='$cuenta' where idfactura='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function crearfacturasapif5($id, $fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento, $espesificacion, $cliente, $cobro, $pagar, $trans, $clasefactura, $cuenta)
    {
        //$idsucursal=$this->getidsucursal($sucursal);
        //$idempresa=$this->getidempresa($empresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = "";
        $registro = $this->dbc->query("update factura set fecha='$fecha',nfactura='$nfactura', nautorizacion='$nautorizacion', codigocontrol='$codigocontrol',montofactura='$monto', tasa0='$tasacero', export='$export', npoliza='$npoliza', iceiecdhotros='$ice', descuentobonificacion='$descuento',clasefactura='$clasefactura', cobrado='$co', pagado='$pa', espesificacion='$espesificacion',transacciones_idtransacciones='$trans', proveedorcliente_idproveedorcliente='$cliente',  cuenta='$cuenta' where idfactura='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }


    public function registrar_factura_con_recibo($fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento,$clasefactura,$cobro, $pagar, $espesificacion,$trans, $cliente, $empresa,   $cuenta,  $sucursal, $asiento)
    {
        $idsucursal = $this->getidsucursal($sucursal);
        $idempresa = $this->getidempresa($empresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = ""; //array($fecha,$nfactura,$nautorizacion,$codigocontrol,$monto,$tasacero,$export,$npoliza,$ice,$descuento,$espesificacion,$cliente,$co,$pa,$trans,$clasefactura,$cuenta,$idempresa,$idsucursal);
        $registro = $this->dbc->query("INSERT INTO `factura` (`idfactura`, `fecha`, `nfactura`, `nautorizacion`, `codigocontrol`, `montofactura`, `tasa0`, `export`, `npoliza`, `iceiecdhotros`, `descuentobonificacion`, `clasefactura`, `cobrado`, `pagado`, `espesificacion`, `estado`, `tipocompra`, `transacciones_idtransacciones`, `proveedorcliente_idproveedorcliente`, `idorganizacion`, `cuenta`, `sucursal`) VALUES (NULL, '$fecha', '$nfactura', '$nautorizacion', '$codigocontrol', '$monto', '$tasacero', '$export', '$npoliza', '$ice', '$descuento', '$clasefactura', '$co', '$pa', '$espesificacion', '1', '1', '$trans', '$cliente', '$idempresa', '$cuenta', '$idsucursal');");
       
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }

    public function crearsolofacturasapif5($id, $fecha, $nfactura, $nautorizacion, $codigocontrol, $monto, $tasacero, $export, $npoliza, $ice, $descuento, $espesificacion, $cliente, $cobro, $pagar, $trans, $clasefactura, $cuenta)
    {
        //$idsucursal=$this->getidsucursal($sucursal);
        //$idempresa=$this->getidempresa($empresa);
        $co = 0;
        $pa = 0;
        if ($cobro == 1 || $cobro == 2) {
            $co = $cobro;
        }
        if ($pagar == 1 || $pagar == 2) {
            $pa = $pagar;
        }
        $res = "";
        $registro = $this->dbc->query("update factura set fecha='$fecha',nfactura='$nfactura', nautorizacion='$nautorizacion', codigocontrol='$codigocontrol',montofactura='$monto', tasa0='$tasacero', export='$export', npoliza='$npoliza', iceiecdhotros='$ice', descuentobonificacion='$descuento',clasefactura='$clasefactura', cobrado='$co', pagado='$pa', espesificacion='$espesificacion',transacciones_idtransacciones='$trans', proveedorcliente_idproveedorcliente='$cliente',  cuenta='$cuenta' where idfactura='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearfactura", $trans, $clasefactura, $cuenta);
        } else {
            $res = array("danger", "No se pudo realizar el registro ");
        }
        echo json_encode($res);
    }
    public function listafactura_pagado($cuenta)
    {
        $lista = [];
        $res = "";
        // lista pagados y pagar
        $facture = $this->dbc->query("SELECT f.idfactura, f.fecha, f.nfactura, f.nautorizacion, f.codigocontrol, f.montofactura, f.tasa0, f.export, f.npoliza, f.iceiecdhotros, f.descuentobonificacion, f.clasefactura, f.cobrado, f.pagado, f.espesificacion, f.estado, f.tipocompra, f.transacciones_idtransacciones, f.proveedorcliente_idproveedorcliente, f.idorganizacion, f.cuenta, f.sucursal 
        FROM factura  AS f WHERE cuenta='$cuenta' AND f.pagado != '0' ORDER BY f.fecha ASC");
        while ($qwe = $this->dbc->fetch($facture)) {
            if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("select * from cliente where id_cliente='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($cliente);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($proveedor);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }
    public function listafactura_cobrado($cuenta)
    {
        $lista = [];
        $res = "";
        // lista pagados y pagar
        $facture = $this->dbc->query("SELECT f.idfactura, f.fecha, f.nfactura, f.nautorizacion, f.codigocontrol, f.montofactura, f.tasa0, f.export, f.npoliza, f.iceiecdhotros, f.descuentobonificacion, f.clasefactura, f.cobrado, f.pagado, f.espesificacion, f.estado, f.tipocompra, f.transacciones_idtransacciones, f.proveedorcliente_idproveedorcliente, f.idorganizacion, f.cuenta, f.sucursal 
        FROM factura  AS f WHERE cuenta='$cuenta' AND f.cobrado != '0' ORDER BY f.fecha ASC");
        while ($qwe = $this->dbc->fetch($facture)) {
            if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("select * from cliente where id_cliente='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($cliente);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($proveedor);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }

    public function listafactura_pagado_trans($idtransaccion)
    {
        $lista = [];
        $res = "";
        // lista pagados y pagar
        $facture = $this->dbc->query("SELECT f.idfactura, f.fecha, f.nfactura, f.nautorizacion, f.codigocontrol, f.montofactura, f.tasa0, f.export, f.npoliza, f.iceiecdhotros, f.descuentobonificacion, f.clasefactura, f.cobrado, f.pagado, f.espesificacion, f.estado, f.tipocompra, f.transacciones_idtransacciones, f.proveedorcliente_idproveedorcliente, f.idorganizacion, f.cuenta, f.sucursal 
        FROM factura  AS f WHERE transacciones_idtransacciones='$idtransaccion' AND f.pagado != '0' ORDER BY f.fecha ASC");
        while ($qwe = $this->dbc->fetch($facture)) {
            if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("select * from cliente where id_cliente='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($cliente);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($proveedor);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }
    public function listafactura_cobrado_trans($idtransaccion)
    {
        $lista = [];
        $res = "";
        // lista pagados y pagar clientes proveedor
        $facture = $this->dbc->query("SELECT f.idfactura, f.fecha, f.nfactura, f.nautorizacion, f.codigocontrol, f.montofactura, f.tasa0, f.export, f.npoliza, f.iceiecdhotros, f.descuentobonificacion, f.clasefactura, f.cobrado, f.pagado, f.espesificacion, f.estado, f.tipocompra, f.transacciones_idtransacciones, f.proveedorcliente_idproveedorcliente, f.idorganizacion, f.cuenta, f.sucursal 
        FROM factura  AS f WHERE transacciones_idtransacciones='$idtransaccion' AND f.cobrado != '0' ORDER BY f.fecha ASC");
        while ($qwe = $this->dbc->fetch($facture)) {
            if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($cliente);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[18] . "'");
                $asd = $this->dbcm->fetch($proveedor);
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }
    public function listafacturaapi_cobrado($idempresa)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $res = "";
        $facture = $this->dbc->query("SELECT
  f.idfactura,
  f.fecha,
  f.nfactura,
  f.nautorizacion,
  f.codigocontrol,
  f.montofactura,
  f.tasa0,
  f.export,
  f.npoliza,
  f.iceiecdhotros,
  f.descuentobonificacion,
  f.clasefactura,
  f.cobrado,
  f.pagado,
  f.espesificacion,
  f.estado,
  f.tipocompra,
  f.transacciones_idtransacciones,
  f.proveedorcliente_idproveedorcliente,
  f.idorganizacion,
  f.cuenta,
  f.sucursal,
  f.por_concepto_de
FROM
  factura as f
WHERE
  md5(f.idorganizacion)= '$idempresa'
  AND f.transacciones_idtransacciones='0'
  AND f.cobrado != '0'
ORDER BY
  f.fecha ASC");
        while ($qwe = $this->dbc->fetch($facture)) {
            if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("select * from cliente where id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],"por_concepto_de" => $qwe['por_concepto_de'], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],"por_concepto_de" => $qwe['por_concepto_de'], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }

    public function listafacturaapi_pagado($idempresa)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $res = "";
        $facture = $this->dbc->query("SELECT
  f.idfactura,
  f.fecha,
  f.nfactura,
  f.nautorizacion,
  f.codigocontrol,
  f.montofactura,
  f.tasa0,
  f.export,
  f.npoliza,
  f.iceiecdhotros,
  f.descuentobonificacion,
  f.clasefactura,
  f.cobrado,
  f.pagado,
  f.espesificacion,
  f.estado,
  f.tipocompra,
  f.transacciones_idtransacciones,
  f.proveedorcliente_idproveedorcliente,
  f.idorganizacion,
  f.cuenta,
  f.sucursal,
  f.por_concepto_de
FROM
  factura as f
WHERE
  md5(f.idorganizacion)= '$idempresa'
  AND f.transacciones_idtransacciones='0'
  AND f.pagado != '0'
ORDER BY
  f.fecha ASC");
        while ($qwe = $this->dbc->fetch($facture)) {
            if ($qwe['clasefactura'] == 2) {
                $cliente = $this->dbcm->query("select * from cliente where id_cliente='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($cliente);

                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idcliente" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],"por_concepto_de" => $qwe['por_concepto_de'], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            } else {
                $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe['proveedorcliente_idproveedorcliente'] . "'");
                $asd = $this->dbcm->fetch($proveedor);

                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nfactura" => $qwe[2], "nautorizacion" => $qwe[3], "codigocontrol" => $qwe[4], "montofactura" => $qwe[5], "tasacero" => $qwe[6], "export" => $qwe[7], "npoliza" => $qwe[8], "ice" => $qwe[9], "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12], "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15], "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18], "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],"por_concepto_de" => $qwe['por_concepto_de'], "procli" => $asd['nombre'], "nit" => $asd['nit']);
            }
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }
    public function eliminarfactura($idfactura)
    {
        $res = "";
        $registro = $this->dbc->query("delete from factura where idfactura='$idfactura'");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        echo json_encode($res);
    }
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];

    }    
    public function getidsucursal($md5)
    {
        $registro = $this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }

    public function registroasiento($nombre, $tipo, $tipo_modulo, $empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbc->query("insert into asientotipo(idasientotipo,nombre,tipo, tipo_modulo,idorganizacion)values(NULL,'$nombre','$tipo', '$tipo_modulo','$ide')");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "registroasiento");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        echo json_encode($res);
    }
    public function registroasientof5($id,$nombre, $tipo, $empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbc->query("UPDATE asientotipo SET nombre='$nombre',tipo='$tipo' WHERE idasientotipo='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "registroasiento");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        echo json_encode($res);
    }

    public function listaasientos($empresa)
    {
        $lista = [];
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbc->query("SELECT idasientotipo,nombre,tipo,tipo_modulo FROM asientotipo WHERE idorganizacion='$ide'");
        while ($qwe = $this->dbc->fetch($registro)) {
            $tipo = $this->dbc->query("select nombre from tipotransaccion where idtipotransaccion='" . $qwe['tipo'] . "'");
            $tt = $this->dbc->fetch($tipo);
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "idtipo"=>$qwe[2], "tipo_modulo"=>$qwe[3], "tipo" => $tt[0]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function eliminarasiento($asiento)
    {
        $this->dbc->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'asignacion_asiento_operacion_modulos', 'campo' => 'idasientotipo', 'mensaje' => 'No se puede eliminar']
                // ['tabla' => 'asiento', 'campo' => 'idcuenta', 'mensaje' => 'No se puede eliminar'],
                // ['tabla' => 'vinculacion_cuenta_xcxp ', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar'],
                // ['tabla' => 'relacionip', 'campo' => 'idplandecuenta', 'mensaje' => 'No se puede eliminar']
            ];
    
            foreach ($relacionadas as $relacion) {
                $query = "SELECT 1 FROM {$relacion['tabla']} WHERE {$relacion['campo']} = $asiento";
                $result = $this->dbc->query($query);
                if ($result->num_rows > 0) {
                    throw new Exception($relacion['mensaje']);
                }
            }
    // $registro = $this->dbc->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM asientotipo WHERE idasientotipo='$asiento'";
            $this->dbc->query($query);
            
            $this->dbc->commit();
            $res = array("success", "Se eliminó correctamente", "eliminarasiento");
    
        } catch (Exception $e) {
            $this->dbc->rollback();
            $res = array("danger", $e->getMessage(), "creartipoasientodelete");
        }

        echo json_encode($res);
    }

    public function registrocrearasientos($idcuenta, $porciento, $tipo, $idasientotipo, $empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbc->query("insert into asiento(idasiento,idcuenta,porciento,tipo,idasientotipo,idorganizacion)values(NULL,'$idcuenta','$porciento','$tipo','$idasientotipo','$ide')");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearasiento", $idasientotipo);
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function registrocrearasientosf5($id,$idcuenta, $porciento, $tipo, $idasientotipo, $empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbc->query("UPDATE asiento SET idcuenta='$idcuenta',porciento='$porciento',tipo='$tipo',idasientotipo='$idasientotipo' WHERE idasiento='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto", "crearasiento", $idasientotipo);
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }
    
    public function listaasientosc($asiento)
    {
        $lista = [];
        $registro = $this->dbc->query("SELECT
  asiento.idasiento,
  plandecuenta.numero,
  plandecuenta.nombreplan,
  asiento.porciento,
  asiento.tipo,
  asiento.idasientotipo,
  plandecuenta.idplandecuenta
FROM
  asiento,
  plandecuenta
WHERE
  idasientotipo = '$asiento'
  AND asiento.idcuenta = plandecuenta.idplandecuenta;
        ");
        while ($qwe = $this->dbc->fetch($registro)) {
            $res = array("id" => $qwe[0], "numero" => $qwe[1], "plan" => $qwe[2], "porciento" => $qwe[3], "tipo" => $qwe[4],"idasientotipo"=>$qwe[5],"idplandecuenta"=>$qwe[6]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function eliminartasiento($asiento)
    {
        $res = "";
        
        $registro = $this->dbc->query("delete from asiento where idasiento='$asiento'");
        if ($registro === TRUE) {
            $res = array("success", "Registro Correcto");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($registro);
    }
  
    public function lista_cobrar_cobrado_factura($sucursal)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        //cobrar
        $lista = [];
        $cf = 2;
        $idsucursal = $this->getidsucursal($sucursal);
        $registro = $this->dbc->query("SELECT f.idfactura,f.fecha,f.nfactura,t.codigotransaccion, f.montofactura,f.proveedorcliente_idproveedorcliente,f.transacciones_idtransacciones,f.cuenta,f.cobrado,f.por_concepto_de
         FROM factura f,transacciones t
         WHERE f.clasefactura='$cf' AND f.sucursal='$idsucursal' AND f.transacciones_idtransacciones=t.idtransacciones ORDER BY f.idfactura DESC");
        while ($qwe = $this->dbc->fetch($registro)) {
            $pagados=[];

            // CONSULTA PARA SABER SI HAY INDIVIDUALES
            $hay_indi = $this->dbc->query("SELECT COUNT(*) AS hay_individual FROM cuentaspof WHERE idfactura='$qwe[0]'");
            $resultado = $hay_indi->fetch_assoc();
            $hayIndividuales = $resultado['hay_individual'];

            // CONSULTA PARA SABER SI HAY GRUPALES
            $hay_grup = $this->dbc->query("SELECT COUNT(*) AS hay_grupal FROM cuentascobrar_grupal WHERE idfactura='$qwe[0]'");
            $resultado2 = $hay_grup->fetch_assoc();
            $hayGrupales = $resultado2['hay_grupal'];
            // $asd = $this->dbc->fetch($cobras);
            $proveedor = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $qwe[5] . "'");
            $pro = $this->dbcm->fetch($proveedor);
            if($hayIndividuales > 0){
                if($hayGrupales > 0){
                    // hay grupales e individuales
                    $mostrarIndi = $this->dbc->query(" SELECT nrecibo,fecha,persona,ci,monto,idcuentaspof 
                    FROM cuentaspof WHERE idfactura = '$qwe[0]'");

                     while ($zxc = $this->dbc->fetch($mostrarIndi)) {
                        $pes = array("nrecibo" => $zxc[0], "fechar" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5]);
                        array_push($pagados, $pes);
                    }
    
               $listaGrup2 = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idfactura='$qwe[0]'");
               $resultado33 = $listaGrup2->fetch_assoc();
               $idrecibo2 = $resultado33['idcuentaspof'];
               $datosRecibo2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspof FROM cuentaspof WHERE idcuentaspof='$idrecibo2'");
               
               while ($www = $this->dbc->fetch($datosRecibo2)) {
                   $pes2 = array("nrecibo" => $www[0], "fechar" => $www[1], "persona" => $www[2], "ci" => $www[3], "monto" => $resultado33['monto'], "id" => $www[5]);
                   array_push($pagados, $pes2);
               }
               $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "pagado" => $resultado33['monto'], "saldo" => 0, "transaccion" => $qwe[6], "cuenta" => $qwe[7],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
               array_push($lista, $res);

                }else{
                    //hay solo individuales
                    
                    $cobras = $this->dbc->query("SELECT SUM(monto) FROM cuentaspof WHERE idfactura='$qwe[0]'"); //173
                    $asd = $this->dbc->fetch($cobras);
                    $saldo = $qwe[4] - $asd[0];
                    $cuentacobrar2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspof FROM cuentaspof WHERE idfactura='$qwe[0]'");
                            while ($zxc = $this->dbc->fetch($cuentacobrar2)) {
                                $pes = array("nrecibo" => $zxc[0], "fechar" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5]);
                                array_push($pagados, $pes);
                            }
                    $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "pagado" => $asd[0], "saldo" => $saldo, "transaccion" => $qwe[6], "cuenta" => $qwe[7],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
                    array_push($lista, $res);
                }//listapagos
            }elseif($hayGrupales > 0){
                //hay solo grupales 
                $listaGrup = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idfactura='$qwe[0]'");
                $resultado3 = $listaGrup->fetch_assoc();
                $idrecibo = $resultado3['idcuentaspof'];
                $datosRecibo = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspof FROM cuentaspof WHERE idcuentaspof='$idrecibo'");
                
                while ($zxc = $this->dbc->fetch($datosRecibo)) {
                    $pes = array("nrecibo" => $zxc[0], "fechar" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $resultado3['monto'], "id" => $zxc[5]);
                    array_push($pagados, $pes);
                }
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "pagado" => $resultado3['monto'], "saldo" => 0, "transaccion" => $qwe[6], "cuenta" => $qwe[7],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
                array_push($lista, $res);
            }
            elseif($qwe[8] == 2){
                //FACTURAS Q NO TIENEN NINGUN RECIBO pero si estan pagados
                $nombrep = isset($pro['nombre']) ? $pro['nombre'] : 'Desconocido';
            $pagados = [];
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2],
             "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $nombrep,
              "monto" => $qwe[4], "pagado" => $qwe[4], "saldo" => 0, "transaccion" => $qwe[6],
               "cuenta" => $qwe[7],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
            array_push($lista, $res);
            
            }
            else{
                //FACTURAS Q NO TIENEN NINGUN RECIBO
            $pagados = [];
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2],
             "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'],
              "monto" => $qwe[4], "pagado" => 0, "saldo" => $qwe[4], "transaccion" => $qwe[6],
               "cuenta" => $qwe[7],"por_concepto_de" => $qwe['por_concepto_de'], "detalle" => $pagados);
            array_push($lista, $res);
            
        }
        
    }
    echo json_encode($lista);
}
    public function eliminarcobrados($id)
    {
        $res = "";
        $registro = $this->dbc->query("DELETE FROM cuentaspof WHERE idcuentaspof='$id'");
        if ($registro === TRUE) {
            $res = array("success", "Se Elimino");
        } else {
            $res = array("danger", "No se elimino");
        }
        echo json_encode($res);
    }

    public function listapagarfactura($sucursal)
    {
        //pagar
        $lista = [];
        $cf = 1;
        $idsucursal = $this->getidsucursal($sucursal);

        $registro = $this->dbc->query("select f.idfactura,f.fecha,f.nfactura,t.codigotransaccion, f.montofactura,f.proveedorcliente_idproveedorcliente,f.transacciones_idtransacciones,f.cuenta
        from factura f,transacciones t
        where f.clasefactura='$cf' and f.sucursal='$idsucursal' and f.transacciones_idtransacciones=t.idtransacciones and pagado!=2");
        while ($qwe = $this->dbc->fetch($registro)) {
            $cobrado = [];
            $cobras = $this->dbc->query("select SUM(monto) from cuentaspor where idfactura='$qwe[0]'");
            $asd = $this->dbc->fetch($cobras);
            $saldo = $qwe[4] - $asd[0];
            $proveedor = $this->dbcm->query("select * from proveedor where id_proveedor='" . $qwe[5] . "'");
            $pro = $this->dbcm->fetch($proveedor);
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombre" => $pro['nombre'], "monto" => $qwe[4], "cobrado" => $asd[0], "saldo" => $saldo, "transaccion" => $qwe[6], "cuenta" => $qwe[7]);
            array_push($lista, $res);
        }
        
        echo json_encode($lista);
    }


    public function detalletransaccion($trans, $tipoasiento, $monto, $empresa, $sucursal)
    {
        $orga = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        $reporte = "";
        $debe = 0;
        $haber = 0;
        $tasiento = $this->dbc->query("select * from asiento where idasientotipo='$tipoasiento'");
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
            VALUES ('$debe','$haber','$nota','$trans','$pcuenta','$ppresupuestario','$estado','2','2','$orga','$idsucursal','$orden')");
            $orden = $orden + 1;
        }
        if ($crear === TRUE) {
            $reporte = array("info", "Se Registro Correctamente", "detalletransaccion", $trans);
        } else {
            $reporte = array("danger", "Lo siento hubo un problema,por favor vuelva a intentar mas tarde");
        }
        echo json_encode($reporte);
    }

    
    public function listapagos($idfactura)
    {
        $fact = $this->dbc->query("SELECT * FROM factura WHERE idfactura='$idfactura'");
        $aaa = $fact->fetch_assoc();
        if($aaa['cobrado'] != 0){
            $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente='" . $aaa['proveedorcliente_idproveedorcliente'] . "'");
            $cl = $cliente->fetch_assoc();
        }else{
            $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor='" . $aaa['proveedorcliente_idproveedorcliente'] . "'");
            $cl = $proveedor->fetch_assoc();
        }
        $lista = [];
        // }}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
         // CONSULTA PARA SABER SI HAY INDIVIDUALES
         $hay_indi = $this->dbc->query("SELECT COUNT(*) AS hay_individual FROM cuentaspof WHERE idfactura='$idfactura'");
         $resultado = $hay_indi->fetch_assoc();
         $hayIndividuales = $resultado['hay_individual'];

         // CONSULTA PARA SABER SI HAY GRUPALES
         $hay_grup = $this->dbc->query("SELECT COUNT(*) AS hay_grupal FROM cuentascobrar_grupal WHERE idfactura='$idfactura'");
         $resultado2 = $hay_grup->fetch_assoc();
         $hayGrupales = $resultado2['hay_grupal'];
        if($hayIndividuales > 0){
            if($hayGrupales > 0){
                // hay grupales e individuales
                        $mostrarIndi = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspof,transaccion,archivo,lugar 
                        FROM cuentaspof WHERE idfactura = '$idfactura'");
    
                        while ($zxc = $this->dbc->fetch($mostrarIndi)) {
                            $res = array("recibo" => $zxc[0], "fecha" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $zxc[4], "id" => $zxc[5],"transaccion" => $zxc[6],"nombre_archivo" => $zxc[7],"lugar" => $zxc[8],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                            array_push($lista, $res);
                        }
    
                $listaGrup2 = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idfactura='$idfactura'");
                $resultado33 = $listaGrup2->fetch_assoc();
                $idrecibo2 = $resultado33['idcuentaspof'];
                $datosRecibo2 = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspof,transaccion,archivo,lugar FROM cuentaspof WHERE idcuentaspof='$idrecibo2'");
                
                while ($www = $this->dbc->fetch($datosRecibo2)) {
                    $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$www[transaccion]'");
                    $idtr = $trans->fetch_assoc();
                    $res2 = array("recibo" => $www[0], "fecha" => $www[1], "persona" => $www[2], "ci" => $www[3], "monto" => $resultado33['monto'], "id" => $www[5],"transaccion" => $www[6],"codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $www[7],"lugar" => $www[8],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                    array_push($lista, $res2);
                }
    
            }else{
                //SOLO HAY INDIVIDUALES
                $registro = $this->dbc->query("SELECT c.idcuentaspof,c.nrecibo,c.fecha,c.monto,c.persona,c.ci,c.transaccion,c.archivo,c.lugar FROM cuentaspof as c WHERE c.idfactura='$idfactura'");
                while ($qwe = $this->dbc->fetch($registro)) {
                    
                    $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$qwe[transaccion]'");
                    $idtr = $trans->fetch_assoc();
                  
                    $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5],"transaccion" => $qwe[6],"codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $qwe[7],"lugar" => $qwe[8],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                    array_push($lista, $res);
                }
        }
        }elseif($hayGrupales > 0){
                       //hay solo grupales
                       $listaGrup = $this->dbc->query("SELECT * FROM cuentascobrar_grupal WHERE idfactura='$idfactura'");
                       $resultado3 = $listaGrup->fetch_assoc();
                       $idrecibo = $resultado3['idcuentaspof'];
                       $datosRecibo = $this->dbc->query("SELECT nrecibo,fecha,persona,ci,monto,idcuentaspof,transaccion,archivo FROM cuentaspof WHERE idcuentaspof='$idrecibo'");
                       
                       while ($zxc = $this->dbc->fetch($datosRecibo)) {

                        $trans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE idtransacciones='$zxc[transaccion]'");
                        $idtr = $trans->fetch_assoc();

                           $res = array("recibo" => $zxc[0], "fecha" => $zxc[1], "persona" => $zxc[2], "ci" => $zxc[3], "monto" => $resultado3['monto'], "id" => $zxc[5],"transaccion" => $zxc[6],"codigotransaccion" => $idtr['codigotransaccion'],"nombre_archivo" => $zxc[7],"nit" => $cl['nit'],"direccion" => $cl['direccion']);
                           array_push($lista, $res);
                       }
                    //    $res = array("id" => $qwe[0], "fecha" => $qwe[1], "numero" => $qwe[2], "codigo" => $qwe[3], "idproveedor" => $qwe[5], "nombrep" => $pro['nombre'], "monto" => $qwe[4], "pagado" => $resultado3['monto'], "saldo" => 0, "transaccion" => $qwe[6], "cuenta" => $qwe[7], "detalle" => $pagados);
       
        }

        echo json_encode($lista);
    }
// listapagarfactura
    public function listapagoscobros($idfactura)
    {
        $lista = [];
        $registro = $this->dbc->query("SELECT c.idcuentaspor,c.nrecibo,c.fecha,c.monto,c.persona,c.ci FROM cuentaspor as c WHERE c.idfactura='$idfactura'");
        while ($qwe = $this->dbc->fetch($registro)) {
            $res = array("id" => $qwe[0], "recibo" => $qwe[1], "fecha" => $qwe[2], "monto" => $qwe[3], "persona" => $qwe[4], "ci" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }


    public function eliminarpago($idpago)
    {
        $res = "";
        $registropago = $this->dbc->query("DELETE FROM cuentaspof WHERE idcuentaspof='$idpago'");

        if ($registropago === TRUE) {
            $res = array("success", "Registro Realizado");
        } else {
            $res = array("danger", "No se pudo realizar el registro $idpago");
        }
        echo json_encode($res);
    }

    public function eliminarpagar($idpago)
    { //pagar eliminar pagados
        $res = "";
        $registropago = $this->dbc->query("DELETE FROM cuentaspor WHERE idcuentaspor='$idpago'");

        if ($registropago === TRUE) {
            $res = array("success", "Registro Realizado");
        } else {
            $res = array("danger", "No se pudo realizar el registro $idpago");
        }
        echo json_encode($res);
    }
    public function listadegestion($empresa)
    {
        $lista = [];
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbc->query("select idgestion,nombre,fechaini,fechafin,estado,fecha,idempresa from gestion where idempresa='$ide'");
        while ($qwe = $this->dbc->fetch($registro)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "fechaini" => $qwe[2], "fechafin" => $qwe[3], "estado" => $qwe[4], "fecha" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function estadogestion($id, $estado, $empresa)
    {
        $ide = $this->getidempresa($empresa);
        $res = "";
        $registro = $this->dbc->query("update gestion set estado='$estado' where idgestion='$id' and idempresa='$ide'");
        if ($estado == 2) {
            $registroo = $this->dbc->query("update gestion set estado='1' where idgestion!='$id' and idempresa='$ide'");
        }
        echo json_encode($res);
    }
    public function getgestionactual($empresa)
    {
        $orga = $this->getidempresa($empresa); //recibe md5 de la id
        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$orga' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        $res = array("id" => $qwe['idgestion'], "nombre" => $qwe['nombre'], "fechaini" => $qwe['fechaini'], "fechafin" => $qwe['fechafin']);
        echo json_encode($res);
    }

    public function getgestionactualid($empresa)
    {

        $res = "";
        $registro = $this->dbc->query("select * from gestion where idempresa='$empresa' and estado='2' Limit 1");
        $qwe = $this->dbc->fetch($registro);
        //$res=array("id"=>,"nombre"=>$qwe['nombre']); listapagarfactura
        return $qwe['idgestion'];
    }

    public function  registrogestion($nombre, $fechaini, $fechafin, $empresa)
    {
        $res = "";
        $ide = $this->getidempresa($empresa);
        $fecha = date("Y-m-d");
        $registro = $this->dbc->query("insert into gestion(idgestion,nombre,fechaini,fechafin,fecha,idempresa)value(NULL,'$nombre','$fechaini','$fechafin','$fecha','$ide')");
        if ($registro === TRUE) {
            $res = array("success", "registro Correcto", "registrogestion");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }
        echo json_encode($res);
    }

    public function registrogestionf5($nombre, $idgestion, $empresa, $fechaini, $fechafin)
    {
        $res = "";
        $fecha = date("Y-m-d");
        $ide = $this->getidempresa($empresa);
        $registro = $this->dbc->query("update gestion set nombre='$nombre',fechaini='$fechaini',fechafin='$fechafin',fecha='$fecha' where idgestion='$idgestion' and idempresa='$ide'");
        if ($registro === TRUE) {
            $res = array("success", "registro Correcto", "registrogestionf5");
        } else {
            $res = array("danger", "No se pudo realizar el Actualizar $idgestion");
        }
        echo json_encode($res);
    }

    public function creartransaccion($numero, $gestion)
    {
        $res = "";

        $fecha = date("Y-m-d");
        $orga = $_SESSION['organizacion'];
        $transa = $this->dbc->query("select * from transacciones where idgestion='$gestion' and organizacion_idorganizacion='$orga'");
        //$qwe=$this->db->fetch($transa);
        //$sucursal=$qwe['sucursal'];

        //$update=$this->db->query("insert into transaccion(idtransaccion,codigotransaccion,fechatransaccion,tipodecambio,ndocumento,glosa,consolidar,tipotransacicon,organizacion_idorganizacion,sucursal,idgestion)values(NULL,'$numero','$fecha','1','0','Actualizar Trans.','1','1','".$this->emp."','$sucursal','$gestion')");

        while ($asd = $this->dbc->fetch($transa)) {
            $number = $numero + 1;

            $update = $this->dbc->query("update transacciones set codigotransaccion='$number' where  codigotransaccion>='$numero' and idgestion='$gestion' and organizacion_idorganizacion='$orga'");
            $numero = $numero + 1;
        }
        $res = array("success", "Se actualizo $gestion $numero", "codetrans");
        echo json_encode($res);
    }
  
    public function gestionlista($empresa)
    {
        $orga = $this->getidempresa($empresa);
        $lista = [];
        $registro = $this->dbc->query("select g.idgestion,g.nombre from gestion as g where g.idempresa='$orga'");
        while ($asd = $this->dbc->fetch($registro)) {
            $res = array("id" => $asd[0], "gestion" => $asd[1]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function creargrupos($nombre, $funcion, $empresa, $idp)
    {
        $res = "";
        $orga = $this->getidempresa($empresa);
        $registro = $this->dbc->query("insert into grupos(idgrupos,nombre,empresa,idp,idfuncion)values(NULL,'$nombre','$orga','$idp','$funcion')");
        if ($registro === TRUE) {
            $res = array("ok" => "success", "estado" => "registrogrupos");
        } else {
            $res = array("ok" => "danger", "NO Creo correctamente");
        }
        echo json_encode($res);
    }

    public function listagrupos($id)
    {
        $lista = [];
        $registro = $this->dbc->query("select g.idgrupos,g.nombre,g.idp,g.idfuncion from grupos as g where md5(g.empresa)='$id'");
        while ($qwe = $this->dbc->fetch($registro)) {
            $funcion = $this->dba->query("select f.idfuncion,f.nombre,f.codigo from funcion as f where f.idfuncion='$qwe[3]'");
            $ff = $this->dba->fetch($funcion);
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "idp" => $qwe[2], "idfuncion" => $qwe[3], "funcion" => $ff[1]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }


    public function eliminargrupo($id)
    {
        $res = "";
        $deletegruposadd = $this->dbc->query("delete from gruposadd where idgrupos='$id'");

        $registro = $this->dbc->query("delete from grupos where idgrupos='$id'");
        if ($registro === TRUE) {
            $res = array("ok" => "success", "estado" => "eliminargrupo");
        } else {
            $res = array("ok" => "danger", "No Elimino correctamente");
        }
        echo json_encode($res);
    }

    public function listacuentas($id, $ide)
    {
        $lista = [];
        $empresa = $this->getidempresa($ide);
        $registro = $this->dbc->query("select g.idgruposadd,g.nplancuenta, p.nombreplan ,g.orden from gruposadd as g 
        inner join plandecuenta as p on p.numero = g.nplancuenta
        where g.idgrupos='$id' and  p.organizacion_idorganizacion='$empresa'");
        while ($qwe = $this->dbc->fetch($registro)) {
            $res = array("id" => $qwe[0], "cuenta" => $qwe[1], "nombre" => $qwe[2], "orden" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function eliminarlistacuentas($id)
    {
        $res = "";
        $registro = $this->dbc->query("delete from gruposadd where idgruposadd='$id'");
        if ($registro === TRUE) {
            $res = array("ok" => "success", "estado" => "eliminarlistacuentas");
        } else {
            $res = array("ok" => "danger", "NO Elimino correctamente");
        }
        echo json_encode($res);
    }



    public function registrolista($idg, $orden, $plan)
    {
        $res = "";
        $registro = $this->dbc->query("insert into  gruposadd(idgruposadd,idgrupos,nplancuenta,orden,idp)value(NULL,'$idg','$plan','$orden','0')");
        if ($registro == TRUE) {
            $res = array("ok" => "success", "estado" => "registrolista", "dato" => $idg);
        } else {
            $res = array("ok" => "danger", "No de Registro ");
        }
        echo json_encode($res);
    }



    public function duplicartransaccion($id)
    {
        $res = "";

        // Obtener los datos de la transacción a duplicar Ocurrio un error al asignar la factura
        $transaccion = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones='$id'");
        // $transaccionData = $this->dbc->fetch($transaccion);
        $transaccionData = $transaccion->fetch_assoc();

        // $codigoTransaccion = $transaccionData['codigotransaccion'] + 1;

         // Obtener el número de transacción más reciente y sumar 1 
         $nroTrans = $this->dbc->query("SELECT codigotransaccion FROM transacciones WHERE organizacion_idorganizacion='{$transaccionData['organizacion_idorganizacion']}' AND idgestion='{$transaccionData['idgestion']}' ORDER BY codigotransaccion DESC LIMIT 1;");
         $resultado12 = $nroTrans->fetch_assoc();
         $nroTransaccion = $resultado12['codigotransaccion'] + 1;

        // Insertar una nueva transacción con los mismos datos
        $this->dbc->query("INSERT INTO transacciones (codigotransaccion, fechatransaccion, tipodecambio, ndocumento, glosa, consolidar, estado, tipotransaccion_idtipotransaccion, organizacion_idorganizacion, sucursal, idgestion) 
                           VALUES ('$nroTransaccion', '{$transaccionData['fechatransaccion']}', '{$transaccionData['tipodecambio']}', '{$transaccionData['ndocumento']}', '{$transaccionData['glosa']}', '{$transaccionData['consolidar']}','1', '{$transaccionData['tipotransaccion_idtipotransaccion']}', '{$transaccionData['organizacion_idorganizacion']}', '{$transaccionData['sucursal']}', '{$transaccionData['idgestion']}')");

        // Obtener el ID de la nueva transacción listapagos
        $newTransaccionId = $this->dbc->insert_id;

        // Obtener los detalles de la transacción a duplicar getgestionactualC cuentaspof
        $detalle = $this->dbc->query("SELECT * FROM detalletransaccion WHERE transacciones_idtransacciones='$id'");
        $orden = 1;
        while ($detalleData = $this->dbc->fetch($detalle)) {
            // Insertar un nuevo detalle con los mismos datos relacionip
            $this->dbc->query("INSERT INTO detalletransaccion (debe, haber, nota, transacciones_idtransacciones, idplandecuenta, idcuentapresupuestaria, estado, cobrar, pagar, idorganizacion, idsucursal,orden) 
                               VALUES ('{$detalleData['debe']}', '{$detalleData['haber']}', '{$detalleData['nota']}', '$newTransaccionId', '{$detalleData['idplandecuenta']}', '{$detalleData['idcuentapresupuestaria']}', '{$detalleData['estado']}', '{$detalleData['cobrar']}', '{$detalleData['pagar']}', '{$detalleData['idorganizacion']}', '{$detalleData['idsucursal']}', '$orden')");
        $orden = $orden + 1;
        }

        $res = array("ok" => "success", "estado" => "duplicartransaccion", "dato" => $newTransaccionId);
        echo json_encode($res);
    }

    public function insertarnuevatransaccionentre($id)
    {
        $res = "";

        $transaccion = $this->dbc->query("select * from transacciones where idtransacciones='$id'");
        while ($qwe = $this->dbc->fetch($transaccion)) {
            $res = array("ok" => "success", "estado" => "transaccion", "dato" => $qwe);
        }
        echo json_encode($res);
    } 
   
     
    public function registrar_tipo($nombre,$descripcion,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipo WHERE nombre = '$nombre' AND idempresa = '$idempresa'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","danger");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("INSERT INTO tipo(nombre,descripcion,idempresa) VALUES ('$nombre','$descripcion','$idempresa')");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Registro exitoso","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar",$nombre);
            }
        }
        echo json_encode($res);
        
    }
    public function editar_tipo($idtipo,$nombre,$descripcion,$empresa){
        $idempresa = $this->getidempresa($empresa);
        $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipo WHERE nombre = '$nombre' AND idempresa = '$idempresa' AND idtipo != '$idtipo'");
        $resultado = $consulta->fetch_assoc();
        $totalRegistros = $resultado['total'];

        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe","danger");
        } else {
            // Insertar el nuevo registro
            $registroProveedor = $this->dbc->query("UPDATE tipo SET nombre = '$nombre', descripcion = '$descripcion' WHERE idtipo ='$idtipo'");
            if ($registroProveedor === TRUE) {                                                                                                                                                                
                $res = array("success", "Edicion exitosa","registroCaracteristicas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
        
    }
    public function listar_tipo($empresa) {
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Preparar la consulta
        $getPedido = $this->dbc->query("SELECT * FROM tipo WHERE idempresa = '$idempresa' ORDER BY idtipo DESC");
    
        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idtipo" => $qwe['idtipo'],
                "nombre" => $qwe['nombre'],
                "descripcion" => $qwe['descripcion'],
                "idempresa" => $qwe['idempresa']
            );
            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function eliminar_tipo($id)
    {
        $res = "";
   
        $this->dbc->begin_transaction();
    
        try {
            $relacionadas = [
                // 'detalletransaccion' => 'No se puede eliminar porque hay registros en producción',
                ['tabla' => 'otras_cuentas', 'campo' => 'idtipo', 'mensaje' => 'No se puede eliminar']
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
    // $registro = $this->dbcm->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM tipo WHERE idtipo='$id'";
            $this->dbc->query($query);
            
            $this->dbc->commit();
            $res = array("success", "Se eliminó correctamente", "eliminarcliente");
    
        } catch (Exception $e) {
            $this->dbc->rollback();
            $res = array("danger", $e->getMessage(), "eliminarcliente");
        }
        echo json_encode($res);
    }
    public function eliminar_gestion_contable($id)
    {
        $res = "";
   
        $this->dbc->begin_transaction();
    
        try {
            $relacionadas = [
                ['tabla' => 'transacciones', 'campo' => 'idgestion', 'mensaje' => 'No se puede eliminar'],
                ['tabla' => 'transaccionEn_espera', 'campo' => 'idgestion', 'mensaje' => 'No se puede eliminar'],
                ['tabla' => 'cuentapresupuestaria', 'campo' => 'gestion', 'mensaje' => 'No se puede eliminar']
            ];
            
    
            foreach ($relacionadas as $relacion) {
                $query = "SELECT 1 FROM {$relacion['tabla']} WHERE {$relacion['campo']} = $id";
                $result = $this->dbc->query($query);
                if ($result->num_rows > 0) {
                    throw new Exception($relacion['mensaje']);
                }
            }
    // $registro = $this->dbcm->query("DELETE FROM plandecuenta WHERE idplandecuenta='$dato'");
            $query = "DELETE FROM gestion WHERE idgestion='$id'";
            $this->dbc->query($query);
            
            $this->dbc->commit();
            $res = array("success", "Se eliminó correctamente", "eliminarcliente");
    
        } catch (Exception $e) {
            $this->dbc->rollback();
            $res = array("danger", $e->getMessage(), "eliminarcliente");
        }
        echo json_encode($res);
    }
    //listafactura listafactura_pagado registrocobrarfactura registrorelacionip lista_cobrar_cobrado_factura listaimpuestoentreplan getgestionactualid
}//eliminarcobrados listapagos  listaimpuestoentreplan lista_plan_cuenta_no_vinculada lista_cobrar_cobrado_factura row cambiarestadoconsolidado
//registrardesconsolidar crearfactura   registropagarfactura listaclientes  listafacturaapi_cobrado listafacturaapi_pagado registrar_factura_cobros_tributario
// $gestion = $this->getgestionactualid($ide); listapagos listaasientos cliente registrar_factura_cobros_tributario listafacturaapi_cobrado       


