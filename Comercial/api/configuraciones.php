<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "facturacion.php";
class configuracion
{
    private $conexion;
    private $verificar;
    private $cm;
    private $factura;
    private $rh;
    /*private $ad tipo;*/ 
    private $em;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        /*$this->ad = $this->conexion->ad;*/
        $this->em = $this->conexion->em;
    }

    public function listaSucursales($idmd5)
    {
        $lista=[];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("estado" => "error", "mensaje" => "El id de empresa no existe"));
            return;
        }

        $cates = $this->em->query("SELECT idsucursalcontable, nombre FROM sucursalcontable WHERE idorganizacion = '$idempresa' ORDER BY idsucursalcontable DESC");
        if ($cates) {
            while ($qwe = $this->em->fetch($cates)) {
                $res = array("id" => $qwe[0], "sucursal" => $qwe[1]);
                array_push($lista, $res);
            }
        }
        echo json_encode($lista);
    }

    public function listaUsuarios($idmd5)
    {
        $lista=[];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("estado" => "error", "mensaje" => "El id de empresa no existe"));
            return;
        }
        $lisArray = array();
        $respon = $this->cm->query("SELECT id_usuario FROM responsable WHERE id_empresa='$idempresa'");
        if ($respon->num_rows > 0) {
            while ($qwe = $this->cm->fetch($respon)) {
                $idusuario = $qwe[0]; 
                $lisArray[] = $idusuario;
            }
            $resultado = implode(',', $lisArray);
        } else {
            $resultado = 0;
        }

        $cates = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo, t.nombre, t.apellido  FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa = '$idempresa' AND u.idusuario NOT IN ($resultado)");
        if ($cates !== NULL) {
            while ($qwe = $this->rh->fetch($cates)) {
                $res = array("id" => $qwe[0], "usuario" => $qwe[1], "cargo" => $qwe[2], "nombre" => $qwe[3], "apellido" => $qwe[4]);
                array_push($lista, $res);
            }
        }
        echo json_encode($lista);
    }

    public function listaUsuariosConfiguracion($idmd5)
    {
        $lista=[];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("estado" => "error", "mensaje" => "El id de empresa no existe"));
            return;
        }
    
      

        $cates = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo, t.nombre, t.apellido  FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa = '$idempresa' ");
        if ($cates !== NULL) {
            while ($qwe = $this->rh->fetch($cates)) {
                $res = array("id" => $qwe[0], "usuario" => $qwe[1], "cargo" => $qwe[2], "nombre" => $qwe[3], "apellido" => $qwe[4]);
                array_push($lista, $res);
            }
        }
        echo json_encode($lista);
    }
    public function listaResponsable($idmd5)
    {
        $res = "";
        try {
            $lista = [];
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            if ($idempresa === "false") {
                echo json_encode(array("estado" => "error", "mensaje" => "El id de empresa no existe"));
                return;
            }

            $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo, t.nombre, t.apellido FROM usuario u 
            LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
            LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
            WHERE u.idempresa='$idempresa'");

            $usuarioInfo = [];
            while ($usuario = $this->rh->fetch($usuarios)) {
                $idusuario = isset($usuario[0]) ? $usuario[0] : "No se encontro el id usuario";
                $usuarion = isset($usuario[1]) ? $usuario[1] : "No se encontro al usuario";
                $cargo = isset($usuario[2]) ? $usuario[2] : "No se encontro el cargo";
                $nombre = isset($usuario[3]) ? $usuario[3] : "No se encontro el nombre";
                $apellido = isset($usuario[4]) ? $usuario[4] : "No se encontro el apellido";
            
                $usuarioInfo[$idusuario] = array(
                    "idusuario" => $idusuario,
                    "usuario" => $usuarion,
                    "cargo" => $cargo,
                    "nombre" => $nombre,
                    "apellido" => $apellido
                );
            }

            $consulta = $this->cm->query("select r.id_responsable, r.id_usuario, r.fecha, GROUP_CONCAT(a.nombre ORDER BY a.nombre ASC SEPARATOR ' - ') as almacenes from responsable r
            left join responsablealmacen ra on r.id_responsable=ra.responsable_id_responsable
            left join almacen a on ra.almacen_id_almacen=a.id_almacen
            where r.id_empresa = '$idempresa'
            group by r.id_responsable
            order by r.id_responsable desc");
            while ($qwe = $this->cm->fetch($consulta)) {
                $res = array("id" => $qwe[0], "idusuario" => $qwe[1], "fecha" => $qwe[2], "almacenes" => $qwe[3], "usuario" => isset($usuarioInfo[$qwe[1]]) ? array($usuarioInfo[$qwe[1]]) : array("No existe"));
                array_push($lista, $res);
            }
            echo json_encode($lista);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function registroResponsable($usuario, $idmd5)
    {
        $fecha = date("Y-m-d");
        $res = "";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if ($idempresa === "false") {
            echo json_encode(array("estado" => "error", "mensaje" => "El id de empresa no existe"));
            return;
        }

        try {
            // Insertar el responsable responsable
            $responsable = $this->cm->query("INSERT INTO responsable(id_responsable, id_usuario, fecha, id_empresa) VALUES (NULL, '$usuario', '$fecha', '$idempresa')");
            $ultimoIdInsertado = $this->cm->insert_id;
            if ($responsable && $ultimoIdInsertado) {
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            } else{ 
                $res=array("estado" => "error", "mensaje" => "Registro fallo");
            }
            echo json_encode($res);
        } catch (Exception $e) {

            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }


    public function eliminarResponsable($dato){
        $res="";
        $registro=$this->cm->query("delete from responsable where id_responsable='$dato'");
        if($registro !== null){
            $responsable = $this->cm->query("delete from responsablealmacen where responsable_id_responsable='$dato'");
            $responableAl = $this->cm->query("delete from responsable_puntoventa where idresponsable='$dato'");
            if($responsable !== null && $responableAl !== null){
                $res=array("estado" => "exito", "mensaje" => "Eliminación exitosa");
            }
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdResponsable($id)
    {
        $lista = [];
        $res = "";
    
        $consulta = $this->cm->query("select r.id_responsable, r.id_usuario, r.fecha, GROUP_CONCAT(a.nombre ORDER BY a.nombre ASC SEPARATOR ',') from responsable r
        left join responsablealmacen ra on r.id_responsable=ra.responsable_id_responsable
        left join almacen a on ra.almacen_id_almacen=a.id_almacen
        where r.id_responsable = '$id'
        group by r.id_responsable
        order by r.id_responsable desc");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "idusuario" => $qwe[1], "almacenes" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarResponsable($id,$idusuario,$almacenes){
        $res="";
        $registro=$this->cm->query("update responsable SET id_usuario='$idusuario' where id_responsable='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
        
    }

    public function listaalmacenesAsignados($id)
    {
        try {
            $lista = [];
            $consulta = $this->cm->query("SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, ra.fecha, a.nombre FROM responsablealmacen ra 
        LEFT JOIN almacen a ON ra.almacen_id_almacen=a.id_almacen
        WHERE ra.responsable_id_responsable = '$id'
        ORDER BY ra.idresponsablealmacen DESC");
            while ($qwe = $this->cm->fetch($consulta)) {
                $res = array("id" => $qwe[0], "idresponsable" => $qwe[1], "idalmacen" => $qwe[2], "fecha" => $qwe[3], "almacen" => $qwe[4]);
                array_push($lista, $res);
            }
            echo json_encode($lista);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function registroResponsablealmacen($responsable, $idalmacen)
    {
        $fecha = date("Y-m-d");
        $res = "";

        try {
            // Insertar el responsable
            $responsable = $this->cm->query("INSERT INTO responsablealmacen(idresponsablealmacen, responsable_id_responsable, almacen_id_almacen, fecha) VALUES (NULL, '$responsable','$idalmacen', '$fecha')");
            $ultimoIdInsertado = $this->cm->insert_id;
            if ($responsable && $ultimoIdInsertado) {
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            } else{ 
                $res=array("estado" => "error", "mensaje" => "Registro fallo");
            }
            echo json_encode($res);
        } catch (Exception $e) {

            $res = array("estado" => "error", "mensaje" => $e->getMessage(), "error" => $responsable. " - " .$idalmacen);
            echo json_encode($res);
        }
    }

    public function eliminarResponsableAlmacen($dato){
        $res="";
        $registro=$this->cm->query("delete from responsablealmacen where idresponsablealmacen='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminación exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function listaAlmacenesResponsable($idmd5)
    {
        try {
            $lista = [];
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            
            if ($idempresa === "false") {
                echo json_encode(array("estado" => "", "mensaje" => "El id de empresa no existe"));
                return;
            }
    
            $sucursales = $this->em->query("SELECT idsucursalcontable, nombre, codigosucursal FROM sucursalcontable WHERE idorganizacion='$idempresa'");
    
            // Crear un array asociativo con la información de todas las sucursales
            $sucursalInfo = [];
            $sucursalInfoVacia = [];
            if ($this->em->rows($sucursales) > 0) {
                while ($sucursal = $this->em->fetch($sucursales)) {
                    $sucursalInfo[$sucursal['idsucursalcontable']] = array(
                        "idsucursal" => $sucursal['idsucursalcontable'],
                        "nombre" => $sucursal['nombre'],
                        "codigosin" => $sucursal['codigosucursal']
                    );
                }
            } else {
                // Si la consulta no devolvió resultados, cargar datos vacíos
                $valor = 0;
                $sucursalInfoVacia[$valor] = array(
                    "idsucursal" => 0,
                    "nombre" => "Sin sucursales",
                    "codigosin" => "Sin sucursales"
                );
            }
    
            $consulta = $this->cm->query("SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
            LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
            LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
            WHERE r.id_empresa='$idempresa'
            ORDER BY ra.idresponsablealmacen desc");
            
            while ($qwe = $this->cm->fetch($consulta)) {
                $res = array("id" => $qwe[0], "idresponsable" => $qwe[1], "idalmacen" => $qwe[2], "almacen" => $qwe[3], "fecha" => $qwe[4], "idusuario" => $qwe[5], "idalmacenM" => $qwe[6], "sucursales" => []);
                if ($qwe[7] == 0) {
                    $res['sucursales'][] = $sucursalInfoVacia[0] = array(
                        "idsucursal" => 0,
                        "nombre" => "Sin sucursales"
                    );
                } elseif (isset($sucursalInfo[$qwe[7]])) {
                    $res['sucursales'][] = $sucursalInfo[$qwe[7]];
                }
                array_push($lista, $res);
            }
    
            echo json_encode($lista);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }


    public function listaPuntoVentaResponsable($idmd5)
    {
        $lista = [];
        try {
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            if ($idempresa === "false") {
                echo json_encode(array("estado" => "error", "mensaje" => "El id de empresa no existe"));
                return;
            }

           
            $consulta = $this->cm->query("SELECT rpv.idreponsable_puntoventa, rpv.idresponsable, rpv.idpuntoventa, pv.nombre, pv.descripcion, pv.idalmacen FROM responsable_puntoventa rpv
            LEFT JOIN responsable r ON rpv.idresponsable = rpv.idresponsable
            LEFT JOIN punto_venta pv ON rpv.idpuntoventa = pv.idpunto_venta
            WHERE r.id_empresa = '$idempresa'
            GROUP BY rpv.idreponsable_puntoventa
            ORDER BY rpv.idreponsable_puntoventa DESC");
            while ($qwe = $this->cm->fetch($consulta)) {
                $res = array("id" => $qwe[0], "idresponsable" => $qwe[1], "idpuntoventa" => $qwe[2], "nombre" => $qwe[3], "descripcion" => $qwe[4], "idalmacen" => $qwe[5]);
                array_push($lista, $res);
            }
            echo json_encode($lista);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function registroPuntoVentaResponsable($idresponsable, $idpuntoventa)
    {
        $res = "";

        try {
            $consulta = $this->cm->query("INSERT INTO responsable_puntoventa(idreponsable_puntoventa, idresponsable, idpuntoventa) VALUES (null,'$idresponsable','$idpuntoventa')");
            if ($consulta != false) {
                $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
            } else {
                $res = array("estado" => "error", "mensaje" => "Fallo registro");
            }

            echo json_encode($res);
        } catch (Exception $e) {

            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }


    public function eliminarPuntoVentaResponsable($dato)
    {
        try {
            $res = "";
            $registro = $this->cm->query("delete from responsable_puntoventa where idreponsable_puntoventa='$dato'");
            if ($registro !== null) {
                $res = array("estado" => "exito", "mensaje" => "Eliminación exitosa");
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {

            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function verificarIdPuntoVentaResponsable($id)
    {
        $lista = [];
        $res = "";
    
        $consulta = $this->cm->query("select r.id_responsable, r.almacen_id_almacen, r.id_usuario, r.fecha from responsable r
        left join almacen a on r.almacen_id_almacen=a.id_almacen
        where r.id_responsable = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarPuntoVentaResponsable($idtipoalmacen,$tipoalmacen,$descripcion){
        $res="";
        $registro=$this->cm->query("update tipo_almacen SET tipo_almacen='$tipoalmacen',descripcion='$descripcion' where id_tipo_almacen='$idtipoalmacen'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
        
    }

    public function registrotipoalmacen($tipoalmacen,$descripcion,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $verificarQuery = 'SELECT COUNT(*) FROM tipo_almacen t WHERE t.id_empresa = ? AND t.tipo_almacen = ?;';
        $stmt = $this->cm->prepare($verificarQuery);
        if ($stmt === false) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo ");
            return;
        }
        $stmt->bind_param('is',$idempresa,$tipoalmacen);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        if($count > 0){
            $res = array("estado" => "error","mensaje"=> "Error al intentar registrar, ".$tipoalmacen." ya esta registrardo. Por favor, inténtalo de nuevo");
        }else{
            $registro=$this->cm->query("insert into tipo_almacen(id_tipo_almacen,tipo_almacen,descripcion,estado,id_empresa)value(NULL,'$tipoalmacen','$descripcion','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }


        
        echo json_encode($res);
    }
    public function eliminartipoalmacen_($dato){
        $res="";
        $registro=$this->cm->query("delete from tipo_almacen where id_tipo_almacen='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminación exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminartipoalmacen($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de tipo almacen no válido");
            }


            // Verificar si el tipo almacen  está relacionado en otras tablas
            $relacionadas = [
                'almacen' => 'tipo_almacen_id_tipo_almacen',
            ];
            $mensaje = [
                'almacen' => 'No se puede eliminar porque hay registros en Almacen.',
                
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el almacen
            $query = "DELETE FROM tipo_almacen WHERE id_tipo_almacen = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el cliente");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdTipoAlmacen($id)
    {
        $lista = [];
        $res = "";
    
        $consulta = $this->cm->query("select * from tipo_almacen WHERE id_tipo_almacen = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editartipoalmacen($idtipoalmacen,$tipoalmacen,$descripcion){
        $res="";
        $registro=$this->cm->query("update tipo_almacen SET tipo_almacen='$tipoalmacen',descripcion='$descripcion' where id_tipo_almacen='$idtipoalmacen'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
        
    }

    public function listaTipoAlmacen($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("estado" => "", "mensaje" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from tipo_almacen where id_empresa='$idempresa' order by id_tipo_almacen desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "tipoalmacen" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function cambiarestadotipoalmacen($id,$estado){
        $registro=$this->cm->query("update tipo_almacen SET estado='$estado' where id_tipo_almacen='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function registroCatproducto($nombre, $descripcion, $idmd5, $idp)
    {
        try {
            $res = "";
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            $verificarQuery = " SELECT COUNT(*) FROM categorias c
            WHERE c.id_empresa = ? AND c.nombre = ?;";

            $stmt = $this->cm->prepare($verificarQuery);
            if ($stmt === false) {
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                return;
            }

            $stmt->bind_param("is", $idempresa , $nombre);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            $stmt->close();

            if ($count > 0) {
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar,  ".$nombre." ya esta registrado. Por favor, inténtalo de nuevo");
            }else{
                $registro = $this->cm->query("insert into categorias(id_categorias,nombre,descripcion,estado,id_empresa,idp)value(NULL,'$nombre','$descripcion','1','$idempresa','$idp')");
                if ($registro !== null) {
                    $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
                } else {
                    $res = array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
                }
            }
            
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }
    public function eliminarCatproducto_($dato){
        $res="";
        $registro=$this->cm->query("delete from categorias where id_categorias='$dato'");
        if($registro !== null){
            $res=array("exito" => "Eliminación exitosa");
        }else{
            $res=array("error" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarCatproducto($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de categoria no válido");
            }


            // Verificar si el categoria está relacionado en otras tablas
            $relacionadas = [
                'productos' => 'categorias_id_categorias',
            ];
            $mensaje = [
                'productos' => 'No se puede eliminar porque hay registros en Productos.',
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el categorias
            $query = "DELETE FROM categorias WHERE id_categorias = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar categorias");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdCatProducto($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from categorias WHERE id_categorias = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3], "idp" => $qwe[5]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarCatproducto($id,$nombre,$descripcion,$idp){
        $res="";
        $registro=$this->cm->query("update categorias SET nombre='$nombre',descripcion='$descripcion', idp='$idp' where id_categorias='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualizacion exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function listaCatproducto($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT id_categorias, nombre, descripcion, estado, id_empresa, idp FROM categorias 
        WHERE id_empresa = '$idempresa'
        ORDER BY 
            CASE WHEN idp = 0 THEN id_categorias ELSE idp END DESC,
            CASE WHEN idp = 0 THEN id_categorias ELSE idp END DESC, idp, id_categorias DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3], "idp" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function cambiarestadoCatproducto($id,$estado){
        $registro=$this->cm->query("update categorias SET estado='$estado' where id_categorias='$id'");
        if($registro !== null){
            $res=array("exito" => "Actualización exitosa");
        }else{
            $res=array("error" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaEstproducto($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from estados_productos where id_empresa='$idempresa' order by id_estados_productos desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroEstproducto($nombre,$descripcion,$idmd5){
        $res="";
        
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $verificarQuery = " SELECT COUNT(*) FROM estados_productos p
        WHERE p.id_empresa = ? AND p.tipos_estado = ?;";

        $stmt = $this->cm->prepare($verificarQuery);
        if ($stmt === false) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }

        $stmt->bind_param("is", $idempresa , $nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. ".$nombre." ya esta registrado. Por favor, inténtalo de nuevo");
        }else{
            $registro=$this->cm->query("insert into estados_productos(id_estados_productos,tipos_estado,descripcion,estado,id_empresa)value(NULL,'$nombre','$descripcion','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }

        }

       
        echo json_encode($res);
    }
    public function eliminarEstproducto_($dato){
        $res="";
        $registro=$this->cm->query("delete from estados_productos where id_estados_productos='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarEstproducto($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de Estado Producto no válido");
            }


            // Verificar si estados_productos está relacionado en otras tablas
            $relacionadas = [
                'productos' => 'estados_productos_id_estados_productos',
            ];
            $mensaje = [
                'productos' => 'No se puede eliminar porque hay registros en Productos.',
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el estados_productos
            $query = "DELETE FROM estados_productos WHERE id_estados_productos = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar estado producto");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdEstProducto($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from estados_productos WHERE id_estados_productos = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarEstproducto($id,$nombre,$descripcion){
        $res="";
        $registro=$this->cm->query("update estados_productos SET tipos_estado='$nombre',descripcion='$descripcion' where id_estados_productos='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoEstproducto($id,$estado){
        $registro=$this->cm->query("update estados_productos SET estado='$estado' where id_estados_productos='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaUniproducto($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from unidad where id_empresa='$idempresa' order by id_unidad desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroUniproducto($nombre,$descripcion,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $verificarQuery = " SELECT COUNT(*) FROM unidad u
                            WHERE u.id_empresa = ? AND u.nombre = ?;";
    
        $stmt = $this->cm->prepare($verificarQuery);
        if ($stmt === false) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }
    
        $stmt->bind_param("is", $idempresa , $nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$nombre." ya esta registrado. Por favor, inténtalo de nuevo");
        }else{

            $registro=$this->cm->query("insert into unidad(id_unidad, nombre, descripcion, estado, id_empresa)value(NULL,'$nombre','$descripcion','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }
        
        echo json_encode($res);
    }
    public function eliminarUniproducto_($dato){
        $res="";
        $registro=$this->cm->query("delete from unidad where id_unidad='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarUniproducto($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de Unidad no válido");
            }


            // Verificar si unidad está relacionado en otras tablas
            $relacionadas = [
                'productos' => 'unidad_id_unidad',
            ];
            $mensaje = [
                'productos' => 'No se puede eliminar porque hay registros en Productos.',
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el unidad
            $query = "DELETE FROM unidad WHERE id_unidad = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar unidad");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdUniProducto($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from unidad WHERE id_unidad = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarUniproducto($id,$nombre,$descripcion){
        $res="";
        $registro=$this->cm->query("update unidad SET nombre='$nombre',descripcion='$descripcion' where id_unidad='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoUniproducto($id,$estado){
        $registro=$this->cm->query("update unidad SET estado='$estado' where id_unidad='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaCaracproducto($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from medida where id_empresa='$idempresa' order by id_medida desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroCaracproducto($nombre,$descripcion,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $verificarQuery = " SELECT COUNT(*) FROM medida m                          
                            WHERE m.id_empresa = ? AND m.nombre_medida = ?;";

        $stmt = $this->cm->prepare($verificarQuery);
        if ($stmt === false) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }

        $stmt->bind_param("is", $idempresa , $nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. ".$nombre." ya esta registrado. Por favor, inténtalo de nuevo");
        }else{
            $registro=$this->cm->query("insert into medida(id_medida, nombre_medida, descripcion, estado, id_empresa)value(NULL,'$nombre','$descripcion','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }

        }

        
        echo json_encode($res);
    }
    public function eliminarCaracproducto_($dato){
        $res="";
        $registro=$this->cm->query("delete from medida where id_medida='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarCaracproducto($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de medida no válido");
            }


            // Verificar si medida está relacionado en otras tablas
            $relacionadas = [
                'productos' => 'medida_id_medida',
            ];
            $mensaje = [
                'productos' => 'No se puede eliminar porque hay registros en Productos.',
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el medida
            $query = "DELETE FROM medida WHERE id_medida = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para medida");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdCaracProducto($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from medida WHERE id_medida = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarCaracproducto($id,$nombre,$descripcion){
        $res="";
        $registro=$this->cm->query("update medida SET nombre_medida='$nombre',descripcion='$descripcion' where id_medida='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoCaracproducto($id,$estado){
        $registro=$this->cm->query("update medida SET estado='$estado' where id_medida='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaDivisa($idmd5, $token, $tipo)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }

        $consulta = $this->cm->query("select * from divisas where idempresa='$idempresa' order by id_divisas desc");

        $monedaRespuesta = "";
        if ($token !== "") {
            $monedaRespuesta = $this->factura->listadoConfigParametricas('monedas', $token, $tipo, 2);
            if ($monedaRespuesta->status === "success") {
                while ($qwe = $this->cm->fetch($consulta)) {
                    $codigo = null;
                    $descripcion = null;
                    if (is_array($monedaRespuesta->data)) {
                        foreach ($monedaRespuesta->data as $moneda) {
                            if (isset($moneda->codigo) && $moneda->codigo == $qwe[5]) {
                                $codigo = $moneda->codigo;
                                $descripcion = $moneda->descripcion;
                                break;
                            }
                        }
                        $res = array("id" => $qwe[0], "nombre" => $qwe[1], "tipo" => $qwe[2], "estado" => $qwe[3], "monedasin" => array("valor" => $qwe[5], "codigo" => $codigo, "descripcion" => $descripcion));
                        array_push($lista, $res);
                    }
                }
            } else {
                $lista = $monedaRespuesta;
            }
        } else {
            while ($qwe = $this->cm->fetch($consulta)) {
                $res = array("id" => $qwe[0], "nombre" => $qwe[1], "tipo" => $qwe[2], "estado" => $qwe[3]);
                array_push($lista, $res);
            }
        }
        echo json_encode($lista);
    }

    public function registroDivisa($nombre,$tipo,$idmd5,$codigosin){
        $codigo = empty($codigosin) ? 'NULL' : "'$codigosin'";
        try {
            $res = "";
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            $verificarQuery = " SELECT COUNT(*) FROM divisas d
                                WHERE d.idempresa = ? AND d.tipo_divisa = ?;";
    
            $stmt = $this->cm->prepare($verificarQuery);
            if ($stmt === false) {
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                return;
            }
        
            $stmt->bind_param("is", $idempresa , $tipo);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            $stmt->close();
        
            if ($count > 0) {
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$tipo." ya esta registrado. Por favor, inténtalo de nuevo");
            }else{
                $registro = $this->cm->query("insert into divisas(id_divisas, nombre, tipo_divisa, estado, idempresa, monedasin)value(NULL,'$nombre','$tipo','2','$idempresa',$codigo)");
                if ($registro !== null) {
                    $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
                } else {
                    $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                }
            }
           
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "id" => $idempresa, "id2" => $codigosin, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }
    public function eliminarDivisa_($dato){
        $res="";
        $registro=$this->cm->query("delete from divisas where id_divisas='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarDivisa($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de Divisa no válido");
            }
            // Verificar si el producto está relacionado en otras tablas
            $relacionadas = [
                'cotizacion' => 'divisas_id_divisas',
                'venta' => 'divisas_id_divisas',
            ];
            $mensaje = [
                'cotizacion' => 'No se puede eliminar porque hay registros en Cotizacion.',
                'venta' => 'No se puede eliminar porque hay registros en ventas.',
                
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el producto
            $query = "DELETE FROM divisas WHERE id_divisas = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el divisa");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdDivisa($id, $token, $tipo)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from divisas WHERE id_divisas = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                if ($token !== "") {
                    $Respuesta = "";
                    $lista = [];
                    $Respuesta = $this->factura->listadoConfigParametricas('monedas', $token, $tipo, 2);
                    if ($Respuesta->status === "success") {
                        while ($qwe = $this->cm->fetch($consulta)) {
                            $codigo = null;
                            $descripcion = null;
                            if (is_array($Respuesta->data)) {
                                foreach ($Respuesta->data as $divisa) {
                                    if (isset($divisa->codigo) && $divisa->codigo == $qwe[5]) {
                                        $codigo = $divisa->codigo;
                                        $descripcion = $divisa->descripcion;
                                        break;
                                    }
                                }
                                $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "tipo" => $qwe[2], "estado" => $qwe[3], "divisasin" => array("codigo" => $codigo, "descripcion" => $descripcion));
                                //array_push($lista, $res);
                            }
                        }
                        echo json_encode($res);
                    }
                } else {
                    while ($qwe = $this->cm->fetch($consulta)) {
                        $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "tipo" => $qwe[2], "estado" => $qwe[3]);
                    }
                    echo json_encode($res);
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarDivisa($id,$nombre,$tipo,$codigosin){
        $res="";
        $registro=$this->cm->query("update divisas SET nombre='$nombre',tipo_divisa='$tipo',monedasin='$codigosin' where id_divisas='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoDivisa($id,$estado,$idmd5){
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        if ($estado == 1) {
            $registro=$this->cm->query("update divisas SET estado='$estado' where id_divisas='$id'");
            $consulta = $this->cm->query("update divisas SET estado='2' where idempresa='$idempresa' AND id_divisas != '$id'");
        } else {
            $registro=$this->cm->query("update divisas SET estado='$estado' where id_divisas='$id'");
        }
        
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaTipocliente($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from tipocliente where idempresa='$idempresa' order by idtipocliente desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "tipo" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroTipocliente($tipo,$descripcion,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $verificarQuery = " SELECT COUNT(*) FROM tipocliente tc
                                WHERE tc.idempresa = ? AND tc.tipo = ?;";
    
        $stmt = $this->cm->prepare($verificarQuery);
        if ($stmt === false) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }
    
        $stmt->bind_param("is", $idempresa , $tipo);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$tipo." ya esta registrado. Por favor, inténtalo de nuevo");
        }else{
            $registro=$this->cm->query("insert into tipocliente(idtipocliente, tipo, descripcion, estado, idempresa)value(NULL,'$tipo','$descripcion','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }


        
        echo json_encode($res);
    }
    public function eliminarTipocliente_($dato){
        $res="";
        $registro=$this->cm->query("delete from tipocliente where idtipocliente='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarTipocliente($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de Tipo cliente no válido");
            }
            // Verificar si el Tipo cliente está relacionado en otras tablas
            $relacionadas = [
                'cliente' => 'tipo',
            ];
            $mensaje = [
                'cliente' => 'No se puede eliminar porque hay registros en Clientes.',
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el tipocliente
            $query = "DELETE FROM tipocliente WHERE idtipocliente = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar tipocliente");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }

    public function verificarIdTipocliente($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from tipocliente WHERE idtipocliente = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "tipo" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarTipocliente($id,$tipo,$descripcion){
        $res="";
        $registro=$this->cm->query("update tipocliente SET tipo='$tipo',descripcion='$descripcion' where idtipocliente='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoTipocliente($id,$estado){
        $registro=$this->cm->query("update tipocliente SET estado='$estado' where idtipocliente='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaCanalVenta($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from canalventa where idempresa='$idempresa' order by idcanalventa desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "canal" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroCanalVenta($canal,$descripcion,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $verificarQuery = "SELECT COUNT(*) FROM canalventa cv WHERE cv.idempresa = ? AND cv.canal = ?";

        $stmt = $this->cm->prepare($verificarQuery);
        if($stmt === false){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }
        $stmt -> bind_param('is',$idempresa,$canal);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$canal." ya esta registrado. Por favor, inténtalo de nuevo");

        }else{
            $registro=$this->cm->query("insert into canalventa(idcanalventa, canal, descripcion, estado, idempresa)value(NULL,'$canal','$descripcion','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }

        
        echo json_encode($res);
    }
    public function eliminarCanalVenta_($dato){
        $res="";
        $registro=$this->cm->query("delete from canalventa where idcanalventa='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarCanalVenta($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de canalventa no válido");
            }
            // Verificar si el canalventa está relacionado en otras tablas
            $relacionadas = [
                'venta' => 'idcanal',
                'cliente' => 'canal',
            ];
            $mensaje = [
                'venta' => 'No se puede eliminar porque hay registros en Ventas.',
                'cliente' => 'No se puede eliminar porque hay registros en Clientes.',
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el canalventa
            $query = "DELETE FROM canalventa WHERE idcanalventa = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar canalventa");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdCanalVenta($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from canalventa WHERE idcanalventa = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "canal" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarCanalVenta($id,$canal,$descripcion){
        $res="";
        $registro=$this->cm->query("update canalventa SET canal='$canal',descripcion='$descripcion' where idcanalventa='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoCanalVenta($id,$estado){
        $registro=$this->cm->query("update canalventa SET estado='$estado' where idcanalventa='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaLeyendaProforma($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from condiciones where idempresa='$idempresa' order by id_condiciones desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "texto" => $qwe[1], "estado" => $qwe[2]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroLeyendaProforma($texto,$idmd5){
        try {
            $res = "";
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            $verificarQuery = "SELECT COUNT(*) FROM condiciones c WHERE c.idempresa = ? AND c.texto = ?";

            $stmt = $this->cm->prepare($verificarQuery);
            if($stmt === false){
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                return;
            }
            $stmt -> bind_param('is',$idempresa,$texto);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            $stmt->close();
    
            if($count > 0){
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$texto." ya esta registrado. Por favor, inténtalo de nuevo");
    
            }else{

                $registro = $this->cm->query("insert into condiciones(id_condiciones, texto, estado, idempresa)value(NULL,'$texto','1','$idempresa')");
                if ($registro !== null) {
                    $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
                } else {
                    $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                }
            }
            
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "id" => $idempresa, "id2" => $idmd5, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }
    public function eliminarLeyendaProforma($dato){
        $res="";
        $registro=$this->cm->query("delete from condiciones where id_condiciones='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdLeyendaProforma($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from condiciones WHERE id_condiciones = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "texto" => $qwe[1], "estado" => $qwe[2]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarLeyendaProforma($id,$texto){
        $res="";
        $registro=$this->cm->query("update condiciones SET texto='$texto' where id_condiciones='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoLeyendaProforma($id,$estado){
        $registro=$this->cm->query("update condiciones SET estado='$estado' where id_condiciones='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaPrecioBase($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT pb.id_precio_base, p.codigo, p.descripcion, pb.precio, pb.productos_almacen_id_productos_almacen, pa.almacen_id_almacen 
        FROM precio_base pb 
        INNER JOIN productos_almacen pa ON pb.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        INNER JOIN productos p ON pa.productos_id_productos=p.id_productos
        INNER JOIN almacen a ON pa.almacen_id_almacen=a.id_almacen
        WHERE pb.estado=1 AND a.idempresa='$idempresa'
        GROUP BY pb.productos_almacen_id_productos_almacen
        ORDER BY MAX(pb.id_precio_base) DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "codigo" => $qwe[1], "descripcion" => $qwe[2], "precio" => $qwe[3], "idproductoalmacen" => $qwe[4], "idalmacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroPrecioBase($precio, $idproductoalmacen)
    {
        $fecha = date("Y-m-d");
        $res = "";
        $actualizar = $this->cm->query("UPDATE precio_base SET estado='2' WHERE productos_almacen_id_productos_almacen='$idproductoalmacen' AND estado=1");
        if ($actualizar === TRUE) {
            $registro = $this->cm->query("INSERT INTO precio_base(id_precio_base, precio, fecha, productos_almacen_id_productos_almacen, estado) VALUES (NULL,'$precio','$fecha','$idproductoalmacen', '1')");
            if ($registro === TRUE) {
                $actualizacionprecios = $this->cm->query("select ps.id_precio_sugerido, (((pb.precio*po.porcentaje)/100)+pb.precio) as nuevoprecio, ps.productos_almacen_id_productos_almacen, ps.porcentajes_id_porcentajes from precio_sugerido as ps
                inner join porcentajes as po on ps.porcentajes_id_porcentajes=po.id_porcentajes
                inner join productos_almacen as pa on ps.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                inner join precio_base as pb on pa.id_productos_almacen=pb.productos_almacen_id_productos_almacen
                where ps.productos_almacen_id_productos_almacen='$idproductoalmacen' and pb.estado=1
                group by ps.id_precio_sugerido");
                while ($qwe = $this->cm->fetch($actualizacionprecios)) {
                    $nuevoprecio = $this->verificar->redondear(floatval($qwe[1]));
                    $this->cm->query("update precio_sugerido SET precio='$nuevoprecio',productos_almacen_id_productos_almacen='$qwe[2]',porcentajes_id_porcentajes='$qwe[3]' where id_precio_sugerido='$qwe[0]'");
                }
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
        }
        echo json_encode($res);
    }

    public function verificarIdPrecioBase($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT pb.id_precio_base, p.codigo, p.descripcion, pb.precio, pb.productos_almacen_id_productos_almacen, pa.almacen_id_almacen 
        FROM precio_base pb 
        INNER JOIN productos_almacen pa ON pb.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        INNER JOIN productos p ON pa.productos_id_productos=p.id_productos
        INNER JOIN almacen a ON pa.almacen_id_almacen=a.id_almacen
        WHERE pb.estado=1 AND pb.id_precio_base = '$id'
        GROUP BY pb.productos_almacen_id_productos_almacen
        ORDER BY MAX(pb.id_precio_base) DESC");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "codigo" => $qwe[1], "descripcion" => $qwe[2], "precio" => $qwe[3], "idproductoalmacen" => $qwe[4]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function listaCategoriaPrecio($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select p.id_porcentajes,p.tipo,p.porcentaje,p.autorizado,p.almacen_id_almacen,a.nombre from porcentajes as p 
        inner join almacen as a on p.almacen_id_almacen=a.id_almacen 
        where a.idempresa='$idempresa' 
        order by id_porcentajes desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "porcentaje" => $qwe[2], "estado" => $qwe[3], "idalmacen" => $qwe[4], "almacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroCategoriaPrecio($tipo,$porcentaje,$idalmacen){
        $res="";
        $registro=$this->cm->query("insert into porcentajes(id_porcentajes, tipo, porcentaje, autorizado, almacen_id_almacen)value(NULL,'$tipo','$porcentaje','1','$idalmacen')");
        if($registro !== null){
            $preciocalculado = $this->cm->query("SELECT pa.id_productos_almacen, (SELECT id_porcentajes FROM porcentajes WHERE tipo='$tipo' and porcentaje='$porcentaje' and almacen_id_almacen='$idalmacen' ORDER BY id_porcentajes DESC LIMIT 1) AS id_porcentaje, 
            ROUND(((pb.precio*((SELECT porcentaje FROM porcentajes WHERE tipo='$tipo' and porcentaje='$porcentaje' and almacen_id_almacen='$idalmacen' ORDER BY id_porcentajes DESC LIMIT 1)/100)) + pb.precio), 2)  AS total  FROM productos_almacen pa 
            INNER JOIN precio_base pb ON pa.id_productos_almacen=pb.productos_almacen_id_productos_almacen WHERE pb.estado=1 and pa.almacen_id_almacen='$idalmacen'");
            while($qwe=$this->cm->fetch($preciocalculado)){
                $respuesta = $this->cm->query("insert into precio_sugerido (id_precio_sugerido,precio,productos_almacen_id_productos_almacen,porcentajes_id_porcentajes) values(null,'$qwe[2]','$qwe[0]','$qwe[1]')");
            }
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminarCategoriaPrecio($dato){
        $res="";
        $registro=$this->cm->query("delete from porcentajes where id_porcentajes='$dato'");
        if($registro !== null){
            $eliminarPrecio=$this->cm->query("delete from precio_sugerido where porcentajes_id_porcentajes='$dato'");
            if ($eliminarPrecio !== null) {
                $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
            } else {
                $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar los precios. Por favor, inténtalo de nuevo");
            }
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdCategoriaPrecio($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from porcentajes WHERE id_porcentajes = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "tipo" => $qwe[1], "porcentaje" => $qwe[2], "estado" => $qwe[3], "idalmacen" => $qwe[4]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarCategoriaPrecio($id, $tipo, $porcentaje, $idalmacen)
    {
        $res = "";
        $registro = $this->cm->query("update porcentajes SET tipo='$tipo', porcentaje='$porcentaje' where id_porcentajes='$id'");
        if ($registro !== null) {
            $preciocalculado = $this->cm->query("SELECT pa.id_productos_almacen, (SELECT id_porcentajes FROM porcentajes WHERE tipo='$tipo' and porcentaje='$porcentaje' and almacen_id_almacen='$idalmacen' ORDER BY id_porcentajes DESC LIMIT 1) AS id_porcentaje, 
            ROUND(((pb.precio*((SELECT porcentaje FROM porcentajes WHERE tipo='$tipo' and porcentaje='$porcentaje' and almacen_id_almacen='$idalmacen' ORDER BY id_porcentajes DESC LIMIT 1)/100)) + pb.precio), 2)  AS total  FROM productos_almacen pa 
            INNER JOIN precio_base pb ON pa.id_productos_almacen=pb.productos_almacen_id_productos_almacen WHERE pb.estado=1 and pa.almacen_id_almacen='$idalmacen'");
            if ($preciocalculado) {
                if ($preciocalculado->num_rows > 0) {
                    while ($qwe = $this->cm->fetch($preciocalculado)) {
                        $actualizar = $this->cm->query("update precio_sugerido set precio='$qwe[2]' where productos_almacen_id_productos_almacen='$qwe[0]' and porcentajes_id_porcentajes='$qwe[1]'");
                    }
                    $res = array("estado" => "exito", "mensaje" => "Actualización exitosa");
                } else {
                    $res = array("estado" => "exito", "mensaje" => "No se encontraron precios que modificar");
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar los precios. Por favor, inténtalo de nuevo o comuniquese con el administrador");
            }
            
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoCategoriaPrecio($id,$estado){
        $registro=$this->cm->query("update porcentajes SET autorizado='$estado' where id_porcentajes='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaPrecioSugerido($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select ps.id_precio_sugerido, ps.productos_almacen_id_productos_almacen, p.codigo, p.nombre, p.descripcion, ps.precio, pa.almacen_id_almacen, po.id_porcentajes, po.autorizado from precio_sugerido as ps 
        inner join porcentajes as po on ps.porcentajes_id_porcentajes=po.id_porcentajes
        inner join productos_almacen as pa on ps.productos_almacen_id_productos_almacen=pa.id_productos_almacen and ps.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos as p on pa.productos_id_productos=p.id_productos
        inner join almacen as a on pa.almacen_id_almacen=a.id_almacen
        where a.idempresa='$idempresa'
        order by ps.id_precio_sugerido desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "idproductoalmacen" => $qwe[1], "codigo" => $qwe[2], "producto" => $qwe[3], "descripcion" => $qwe[4], "precio" => $qwe[5], "idalmacen" => $qwe[6], "idporcentaje" => $qwe[7], "estado" => $qwe[8]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroPrecioSugerido($tipo,$porcentaje,$idalmacen){
        $res="";
        $registro=$this->cm->query("insert into porcentajes(id_porcentajes, tipo, porcentaje, autorizado, almacen_id_almacen)value(NULL,'$tipo','$porcentaje','1','$idalmacen')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIdPrecioSugerido($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select ps.id_precio_sugerido, ps.productos_almacen_id_productos_almacen, p.codigo, p.nombre, p.descripcion, ps.precio, pa.almacen_id_almacen, po.id_porcentajes, po.autorizado from precio_sugerido as ps 
        inner join porcentajes as po on ps.porcentajes_id_porcentajes=po.id_porcentajes
        inner join productos_almacen as pa on ps.productos_almacen_id_productos_almacen=pa.id_productos_almacen and ps.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos as p on pa.productos_id_productos=p.id_productos
        inner join almacen as a on pa.almacen_id_almacen=a.id_almacen
        where ps.id_precio_sugerido='$id'
        order by ps.id_precio_sugerido desc");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "idproductoalmacen" => $qwe[1], "codigo" => $qwe[2], "producto" => $qwe[3], "descripcion" => $qwe[4], "precio" => $qwe[5], "idalmacen" => $qwe[6], "idporcentaje" => $qwe[7], "estado" => $qwe[8]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarPrecioSugerido($idpreciosugerido, $precio)
    {
        $res = "";
        $nuevoprecio = $this->verificar->redondear(floatval($precio));
        $consulta = $this->cm->query("select id_precio_sugerido from precio_sugerido WHERE id_precio_sugerido = '$idpreciosugerido'");
        if ($consulta->num_rows > 0) {
            $registro = $this->cm->query("update precio_sugerido SET precio='$nuevoprecio' where id_precio_sugerido='$idpreciosugerido'");
            if ($registro !== null) {
                $res = array("estado" => "exito", "mensaje" => "Actualización exitosa");
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al encontrar el registro. Por favor, inténtelo de nuevo");
        }
        echo json_encode($res);
    }

    public function listaLeyendaFactura($idmd5, $token, $tipo)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }

        $consulta = $this->cm->query("select * from leyendas where idempresa='$idempresa' order by idleyendas desc");

        $leyendaRespuesta = "";
        $leyendaRespuesta = $this->factura->listadoConfigParametricas('leyendas', $token, $tipo, 2);
        if ($leyendaRespuesta->status === "success") {
            while ($qwe = $this->cm->fetch($consulta)) {
                $codigo = null;
                $descripcion = null;
                if (is_array($leyendaRespuesta->data)) {
                    foreach ($leyendaRespuesta->data as $leyenda) {
                        if (isset($leyenda->codigo) && $leyenda->codigo == $qwe[2]) {
                            $codigo = $leyenda->codigo;
                            $descripcion = $leyenda->descripcion;
                            break;
                        }
                    }
                    $res = array("id" => $qwe[0], "nombre" => $qwe[1], "estado" => $qwe[3], "leyendasin" => array("codigo" => $codigo, "descripcion" => $descripcion));
                    array_push($lista, $res);
                }
            }
        } else {
            $lista = $leyendaRespuesta;
        }
        echo json_encode($lista);
    }

    public function registroLeyendaFactura($nombre,$codigosin,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $verificarQuery = "SELECT COUNT(*) FROM leyendas c WHERE c.idempresa = ? AND c.nombre = ?";

        $stmt = $this->cm->prepare($verificarQuery);
        if($stmt === false){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }
        $stmt -> bind_param('is',$idempresa,$nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$nombre." ya esta registrado. Por favor, inténtalo de nuevo");

        }else{
            $registro=$this->cm->query("insert into leyendas(idleyendas, nombre, codigosin, estado, idempresa)value(NULL,'$nombre','$codigosin','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }
      
        echo json_encode($res);
    }
    public function eliminarLeyendaFactura($dato){
        $res="";
        $registro=$this->cm->query("delete from leyendas where idleyendas='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdLeyendaFactura($id, $token, $tipo)
    {
        $res = "";
        $lista = [];
        $consulta = $this->cm->query("select * from leyendas WHERE idleyendas = '$id'");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                $leyendaRespuesta = "";
                $leyendaRespuesta = $this->factura->listadoConfigParametricas('leyendas', $token, $tipo, 2);
                if ($leyendaRespuesta->status === "success") {
                    while ($qwe = $this->cm->fetch($consulta)) {
                        $codigo = null;
                        $descripcion = null;
                        if (is_array($leyendaRespuesta->data)) {
                            foreach ($leyendaRespuesta->data as $leyenda) {
                                if (isset($leyenda->codigo) && $leyenda->codigo == $qwe[2]) {
                                    $codigo = $leyenda->codigo;
                                    $descripcion = $leyenda->descripcion;
                                    break;
                                }
                            }
                            $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "estado" => $qwe[3], "leyendasin" => array("codigo" => $codigo, "descripcion" => $descripcion));
                            //array_push($lista, $res);
                        }
                    }
                } else {
                    $res = $leyendaRespuesta;
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarLeyendaFactura($id,$nombre,$codigosin){
        $res="";
        $registro=$this->cm->query("update leyendas SET nombre='$nombre',codigosin='$codigosin' where idleyendas='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoLeyendaFactura($id,$estado){
        $registro=$this->cm->query("update leyendas SET estado='$estado' where idleyendas='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaMetodoPagoFactura($idmd5, $token, $tipo)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }

        $consulta = $this->cm->query("select * from metodopago where idempresa='$idempresa' order by idmetodopago desc");

        $metodoPagoRespuesta = "";
        $metodoPagoRespuesta = $this->factura->listadoConfigParametricas('metodopago', $token, $tipo, 2);
        if ($metodoPagoRespuesta->status === "success") {
            while ($qwe = $this->cm->fetch($consulta)) {
                $codigo = null;
                $descripcion = null;
                if (is_array($metodoPagoRespuesta->data)) {
                    foreach ($metodoPagoRespuesta->data as $metodoPago) {
                        if (isset($metodoPago->codigo) && $metodoPago->codigo == $qwe[2]) {
                            $codigo = $metodoPago->codigo;
                            $descripcion = $metodoPago->descripcion;
                            break;
                        }
                    }
                    $res = array("id" => $qwe[0], "nombre" => $qwe[1], "estado" => $qwe[3], "metodopagosin" => array("codigo" => $codigo, "descripcion" => $descripcion));
                    array_push($lista, $res);
                }
            }
        } else {
            $lista = $metodoPagoRespuesta;
        }
        echo json_encode($lista);
    }

    public function registroMetodoPagoFactura($nombre,$codigosin,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $verificarQuery = "SELECT COUNT(*) FROM metodopago c WHERE c.idempresa = ? AND c.nombre = ?";

        $stmt = $this->cm->prepare($verificarQuery);
        if($stmt === false){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }
        $stmt -> bind_param('is',$idempresa,$nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$nombre." ya esta registrado. Por favor, inténtalo de nuevo");

        }else{

            $registro=$this->cm->query("insert into metodopago(idmetodopago, nombre, codigosin, estado, idempresa)value(NULL,'$nombre','$codigosin','2','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }

        
        echo json_encode($res);
    }
    public function eliminarMetodoPagoFactura($dato){
        $res="";
        $registro=$this->cm->query("delete from metodopago where idmetodopago='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdMetodoPagoFactura($id, $token, $tipo)
    {
        $res = "";
        $lista = [];
        $consulta = $this->cm->query("select * from metodopago WHERE idmetodopago = '$id'");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                $metodoPagoRespuesta = "";
                $metodoPagoRespuesta = $this->factura->listadoConfigParametricas('metodopago', $token, $tipo, 2);
                if ($metodoPagoRespuesta->status === "success") {
                    while ($qwe = $this->cm->fetch($consulta)) {
                        $codigo = null;
                        $descripcion = null;
                        if (is_array($metodoPagoRespuesta->data)) {
                            foreach ($metodoPagoRespuesta->data as $metodoPago) {
                                if (isset($metodoPago->codigo) && $metodoPago->codigo == $qwe[2]) {
                                    $codigo = $metodoPago->codigo;
                                    $descripcion = $metodoPago->descripcion;
                                    break;
                                }
                            }
                            $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "estado" => $qwe[3], "metodopagosin" => array("codigo" => $codigo, "descripcion" => $descripcion));
                            array_push($lista, $res);
                        }
                    }
                } else {
                    $res = $metodoPagoRespuesta;
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarMetodoPagoFactura($id,$nombre,$codigosin){
        $res="";
        $registro=$this->cm->query("update metodopago SET nombre='$nombre',codigosin='$codigosin' where idmetodopago='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoMetodoPagoFactura($id,$estado){
        $registro=$this->cm->query("update metodopago SET estado='$estado' where idmetodopago='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaParametro($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select * from medidores where idempresa='$idempresa' order by valor ASC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "valor" => $qwe[2], "color" => $qwe[3], "tipo" => $qwe[4]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroParametro($nombre,$valor,$color,$tipo,$idmd5){
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $verificarQuery = "SELECT COUNT(*) FROM medidores m WHERE m.idempresa = ? AND m.nombre = ?";

        $stmt = $this->cm->prepare($verificarQuery);
        if($stmt === false){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            return;
        }
        $stmt -> bind_param('is',$idempresa,$nombre);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if($count > 0){
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar, ".$nombre." ya esta registrado. Por favor, inténtalo de nuevo");

        }else{
            $registro=$this->cm->query("insert into medidores(idmedidores, nombre, valor, color, tipo, idempresa)value(NULL,'$nombre','$valor','$color','1','$idempresa')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }

        }

        
        echo json_encode($res);
    }
    public function eliminarParametro_($dato){
        $res="";
        $registro=$this->cm->query("delete from medidores where idmedidores='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarParametro($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de almacen no válido");
            }


            // Verificar si el producto está relacionado en otras tablas
            $relacionadas = [
                'ingreso' => 'proveedor_id_proveedor',
            ];
            $mensaje = [
                'ingreso' => 'No se puede eliminar porque hay registros en Ingreso.',
                
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            
            $query = "DELETE FROM medidores WHERE idmedidores=?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el cliente");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();



            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdParametro($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from medidores WHERE idmedidores = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "valor" => $qwe[2], "color" => $qwe[3], "tipo" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarParametro($id,$nombre,$valor,$color,$tipo){
        $res="";
        $registro=$this->cm->query("update medidores SET nombre='$nombre',valor='$valor',color='$color' where idmedidores='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
}
