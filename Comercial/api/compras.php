<?php
require_once "../db/conexion.php";
require_once "funciones.php";
class compras
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        //$this->ad = $this->conexion->ad;
        $this->em = $this->conexion->em;
    }
    public function importar_excel_proveedor($file, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
    
        if (!$idempresa) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }
    
        if (!file_exists($file)) {
            echo json_encode(["estado" => "error", "mensaje" => "El archivo no se encontró en la ruta: " . $file]);
            return;
        }
    
        $handle = fopen($file, "r"); // Abrir el archivo en modo lectura
        if ($handle === false) {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo abrir el archivo CSV"]);
            return;
        }
    
        $proveedores = []; // Guardará los proveedores
        $contador = 0;
    
        while (($data = fgetcsv($handle, 1000, ",")) !== false) {
            if ($contador == 0) { // Ignorar la primera fila (encabezados)
                $contador++;
                continue;
            }
    
            // Asignar datos (asegúrate de que coincidan con las columnas de tu CSV)
            $proveedores[] = [
                "nombre" => $data[0],
                "codigo" => $data[1],
                "nit" => $data[2],
                "detalle" => $data[3],
                "direccion" => $data[4],
                "telefono" => $data[5],
                "movil" => $data[6],
                "email" => $data[7],
                "web" => $data[8],
                "pais" => $data[9],
                "ciudad" => $data[10],
                "zona" => $data[11],
                "contacto" => $data[12],
            ];
            $contador++;
        }
    
        fclose($handle); // Cerrar archivo
    
        // Ahora recorremos los proveedores y los registramos en la base de datos
        foreach ($proveedores as $proveedor) {
            $this->registroproveedor(
                $proveedor["nombre"],
                $proveedor["codigo"],
                $proveedor["nit"],
                $proveedor["detalle"],
                $proveedor["direccion"],
                $proveedor["telefono"],
                $proveedor["movil"],
                $proveedor["email"],
                $proveedor["web"],
                $proveedor["pais"],
                $proveedor["ciudad"],
                $proveedor["zona"],
                $proveedor["contacto"],
                $idmd5
            );
        }
    
        echo json_encode(["estado" => "exito", "mensaje" => "Proveedores importados correctamente"]);
    }
    
    public function listarProveedores($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $res = "";
        $provee = $this->cm->query("select * from proveedor where id_empresa='$idempresa'");
        while ($qwe = $this->cm->fetch($provee)) {
            $res = array("id" => $qwe['id_proveedor'], "nombre" => $qwe['nombre'], "codigo" => $qwe['codigo'], "nit" => $qwe['nit'], "detalle" => $qwe['detalle'], "direccion" => $qwe['direccion'], "telefono" => $qwe['telefono'], "mobil" => $qwe['mobil'], "email" => $qwe['email'], "web" => $qwe['web'], "pais" => $qwe['pais'], "ciudad" => $qwe['ciudad'], "zona" => $qwe['zona'], "contacto" => $qwe['contacto']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function registroproveedor($nombre, $codigo, $nit, $detalle, $direccion, $telefono, $mobil, $email, $web, $pais, $ciudad, $zona, $contacto, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consultaCod = $this->cm->query("SELECT * FROM proveedor p WHERE p.id_empresa = '$idempresa' AND LOWER(p.codigo) = LOWER('$codigo')");
        if ($consultaCod) {
            if ($consultaCod->num_rows > 0) {
                echo json_encode(array("estado" => "existe", "mensaje" => "El código del proveedor ya existe"));
                return;
            }
        }
        $res = "";
        $registro = $this->cm->query("insert into proveedor(id_proveedor,nombre,codigo,nit,detalle,direccion,telefono,mobil,email,web,pais,ciudad,zona,contacto,id_empresa)value(NULL,'$nombre','$codigo','$nit','$detalle','$direccion','$telefono','$mobil','$email','$web','$pais','$ciudad','$zona','$contacto','$idempresa')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIdproveedor($id)
    {
        $res = "";

        $consulta = $this->cm->query("select * from proveedor where id_proveedor = '$id'");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe['id_proveedor'], "nombre" => $qwe['nombre'], "codigo" => $qwe['codigo'], "nit" => $qwe['nit'], "detalle" => $qwe['detalle'], "direccion" => $qwe['direccion'], "telefono" => $qwe['telefono'], "mobil" => $qwe['mobil'], "email" => $qwe['email'], "web" => $qwe['web'], "pais" => $qwe['pais'], "ciudad" => $qwe['ciudad'], "zona" => $qwe['zona'], "contacto" => $qwe['contacto']);
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

    public function editarregistroproveedor($idproveedor, $nombre, $codigo, $nit, $detalle, $direccion, $telefono, $mobil, $email, $web, $pais, $ciudad, $zona, $contacto)
    {
        $res = "";
        $registro = $this->cm->query("update proveedor SET nombre='$nombre',codigo='$codigo',nit='$nit',detalle='$detalle',direccion='$direccion',telefono='$telefono',mobil='$mobil',email='$email',web='$web',pais='$pais',ciudad='$ciudad',zona='$zona',contacto='$contacto' where id_proveedor='$idproveedor' ");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminarproveedor_($dato)
    {
        $res = "";
        $registro = $this->cm->query("delete from proveedor where id_proveedor='$dato'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Eliminado exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarproveedor($dato)
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

           

            // Eliminar el producto
            $query = "DELETE FROM proveedor WHERE id_proveedor = ?";
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

    public function listaPedidos($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT p.id_pedidos, p.fecha_pedido, p.autorizacion, p.observacion, p.codigo, p.almacen_id_almacen, a.nombre, p.estado, p.tipopedido, p.almacen_origen, a1.nombre, p.usuario, p.nropedido , p.ruta_recibo
        FROM pedidos p
        LEFT JOIN almacen a ON p.almacen_id_almacen=a.id_almacen
        LEFT JOIN almacen a1 ON p.almacen_origen=a1.id_almacen
        WHERE a.idempresa='$idempresa'
        ORDER BY p.id_pedidos DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "autorizacion" => $qwe[2], "observacion" => $qwe[3], "codigo" => $qwe[4], "idalmacen" => $qwe[5], "almacen" => $qwe[6], "estado" => $qwe[7], "tipopedido" => $qwe[8], "idalmacenorigen" => $qwe[9], "almacenorigen" => $qwe[10], "idusuario" => $qwe[11], "nropedido" => $qwe[12],"ruta" => $qwe['ruta_recibo']);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listaProductoPedido($idpedido, $idalmacen) {
        $lista = [];
        
        $consulta = $this->cm->query("select pa.id_productos_almacen,p.codigo,p.cod_barras,p.nombre,p.descripcion,pa.pais,p.caracteristicas,pa.stock_minimo,s.cantidad,pa.fecha_registro,al.id_almacen,pa.estado,pa.stock_maximo
        from productos_almacen as pa
        LEFT JOIN almacen as al ON pa.almacen_id_almacen=al.id_almacen
        LEFT JOIN productos as p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock as s  ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen and s.estado='1'
        where pa.almacen_id_almacen='$idalmacen' and pa.estado = '1' and pa.id_productos_almacen not in (select dp.productos_almacen_id_productos_almacen from detalles_pedidos dp where dp.pedidos_id_pedidos='$idpedido')
        order by pa.id_productos_almacen DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("idproductoalmacen" => $qwe[0], "codigo" => $qwe[1], "codbarras" => $qwe[2], "nombre" => $qwe[3], "descripcion" => $qwe[4], "pais" => $qwe[5], "caracteristica" => $qwe[6], "stockMin" => $qwe[7], "stock" => $qwe[8], "fecha" => $qwe[9], "idalmacen" => $qwe[10], "estado" => $qwe[11], "stockMax" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroPedido($fecha,$observacion,$almacen,$tipo,$almacenorigen,$idmd5,$idmd5em){
        $res="";
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5em);
        /*$registro=$this->cm->query("insert into movimiento(id_movimiento,fecha_movimiento,almacen_destino,autorizacion,descripcion,codigo,almacen_id_almacen,usuario)value(NULL,'$fecha','$almacendestino','2','$descripcion','0','$almacenorigen','$idusuario')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacenorigen" => $almacenorigen);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);*/

        $codigo="AL-".rand(1,100).date("Ymd");
        $res="";

        $nropedido = $this->cm->query("select count(p.id_pedidos) as cantidad_pedido from pedidos p inner join almacen a on a.id_almacen=p.almacen_id_almacen where a.idempresa='$idempresa' and p.tipopedido='$tipo'");
        $resp = $this->cm->fetch($nropedido);
        $nro = $resp[0] + 1;

        $registro=$this->cm->query("insert into pedidos(id_pedidos,fecha_pedido,autorizacion,observacion,codigo,almacen_id_almacen,estado,tipopedido,almacen_origen,usuario,nropedido)value(NULL,'$fecha','2','$observacion','$codigo','$almacen','2',$tipo,$almacenorigen,$idusuario,$nro)");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacenorigen" => $almacen, "tipo" => $tipo);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarPedido($dato){
        $res="";
        $registro=$this->cm->query("delete from pedidos where id_pedidos='$dato'");
        if($registro !== null){
            $registro=$this->cm->query("delete from detalles_pedidos where pedidos_id_pedidos='$dato'");
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIDpedido($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT p.id_pedidos, p.fecha_pedido, p.autorizacion, p.observacion, p.codigo, p.almacen_id_almacen, a.nombre, p.estado, p.tipopedido, p.almacen_origen, a1.nombre, p.usuario, p.nropedido FROM pedidos p
        LEFT JOIN almacen a ON p.almacen_id_almacen=a.id_almacen
        LEFT JOIN almacen a1 ON p.almacen_origen=a1.id_almacen
        WHERE p.id_pedidos='$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "autorizacion" => $qwe[2], "observacion" => $qwe[3], "codigo" => $qwe[4], "idalmacen" => $qwe[5], "almacen" => $qwe[6], "estado" => $qwe[7], "tipopedido" => $qwe[8], "idalmacenorigen" => $qwe[9], "almacenorigen" => $qwe[10], "idusuario" => $qwe[11], "nropedido" => $qwe[12]);
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

    public function editarPedido($idpedido,$fecha,$observacion,$almacen, $tipo,$almacenorigen){
        $res="";
        $registro=$this->cm->query("update pedidos SET fecha_pedido='$fecha', observacion='$observacion', almacen_id_almacen='$almacen', tipopedido='$tipo', almacen_origen='$almacenorigen' where id_pedidos='$idpedido'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacenorigen" => $almacen, "tipo" => $tipo);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoPedido($idpedido,$autorizar){
        $res="";

        $registro=$this->cm->query("update pedidos SET autorizacion='$autorizar' where id_pedidos='$idpedido'");
        if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);

    }
    public function concluir_pedido($idpedido,$estado){
        $res="";

        $registro=$this->cm->query("update pedidos SET estado='$estado' where id_pedidos='$idpedido'");
        if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);

    }
    public function cancelarPedido($id){
        try {
            $registro = $this->cm->query("delete from detalles_pedidos where pedidos_id_pedidos='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Eliminacion exitoss");
            } else {
                $res = array("estado" => 101, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function listaDetallePedido($id) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT dp.id_detalle_pedido, dp.cantidad, dp.observacion, dp.pedidos_id_pedidos, dp.productos_almacen_id_productos_almacen, p.codigo, p.descripcion FROM detalles_pedidos dp
        LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        WHERE dp.pedidos_id_pedidos = '$id'
        ORDER BY dp.id_detalle_pedido DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "cantidad" => $qwe[1], "observacion" => $qwe[2], "idpedido" => $qwe[3], "idproductoalmacen" => $qwe[4], "codigo" => $qwe[5], "descripcion" => $qwe[6]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function getPedido_($id, $idmd5)
    {
        // Obtener idempresa desde idmd5
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        // Obtener detalle de productos del pedido
        $lista = [];
        $detalles = $this->cm->query("
            SELECT dp.id_detalle_pedido, p.nombre, p.descripcion, dp.cantidad, dp.observacion
            FROM detalles_pedidos dp
            LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
            WHERE dp.pedidos_id_pedidos = '$id'
            ORDER BY p.nombre DESC
        ");
        while ($row = $this->cm->fetch($detalles)) {
            $lista[] = [
                "id" => $row[0],
                "producto" => $row[1],
                "descripcion" => $row[2],
                "cantidad" => $row[3],
                "observacion" => $row[4]
            ];
        }

        // Obtener usuarios asociados a la empresa (como en detalleVenta)
        $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa='$idempresa'");
        $usuarioInfo = [];
        while ($usuario = $this->rh->fetch($usuarios)) {
            $usuarioInfo[$usuario[0]] = [
                "idusuario" => $usuario[0],
                "usuario" => $usuario[1],
                "cargo" => $usuario[2]
            ];
        }

        // Obtener info empresa
        $empresas = $this->em->query("SELECT * FROM organizacion WHERE idorganizacion = '$idempresa'");
        $empresaInfo = [];
        while ($empresa = $this->em->fetch($empresas)) {
            $empresaInfo[$empresa[0]] = [
                "id" => $empresa[0],
                "nombre" => $empresa[1],
                "celular" => $empresa[11],
                "email" => $empresa[8],
                "logo" => $empresa[13],
                "direccion" => $empresa[12]
            ];
        }

        // Consulta info general del pedido, con joins para almacen y usuario
        $pedido = $this->cm->query("
            SELECT p.id_pedidos, p.fecha_pedido, p.autorizacion, p.observacion, p.codigo, 
                p.almacen_id_almacen, p.estado, p.tipopedido, p.almacen_origen, 
                p.usuario, p.nropedido, a.nombre as almacen
            FROM pedidos p
            LEFT JOIN almacen a ON p.almacen_id_almacen = a.id_almacen
            WHERE p.id_pedidos = '$id'
        ");

        $lista2 = [];
        while ($q = $this->cm->fetch($pedido)) {
            $res = [
                "id" => $q['id_pedidos'],
                "fecha" => $q['fecha_pedido'],
                "autorizacion" => $q['autorizacion'],
                "observacion" => $q['observacion'],
                "codigo" => $q['codigo'],
                "idalmacen" => $q['almacen_id_almacen'],
                "estado" => $q['estado'],
                "tipopedido" => $q['tipopedido'],
                "idalmacenorigen" => $q['almacen_origen'],
                "idusuario" => $q['usuario'],
                "nropedido" => $q['nropedido'],
                "almacen" => $q['almacen'],
                "detalle" => $lista,
                "usuarios" => array($usuarioInfo[$q['usuario']]),
                "empresa" => $empresaInfo[$idempresa] ?? []
            ];
            $lista2[] = $res;
        }

        echo json_encode($lista2);
    }

    public function verificarDetallePedido($id)
    {
        // Consulta si existen detalles para el pedido
        $consulta = $this->cm->query("
            SELECT COUNT(*) as total
            FROM detalles_pedidos
            WHERE pedidos_id_pedidos = '$id'
        ");

        $resultado = $this->cm->fetch($consulta);
        $tieneDetalle = $resultado && $resultado['total'] > 0;

        echo json_encode([
            "idpedido" => $id,
            "tieneDetalle" => $tieneDetalle,
            "totalDetalles" => (int)$resultado['total']
        ]);
    }


    public function generarMensajePedidoWhatsapp($id) 
    {
        // Obtener los datos del pedido
        $pedidoConsulta = $this->cm->query("
            SELECT p.nropedido, p.fecha_pedido, p.codigo, a.nombre AS almacen
            FROM pedidos p
            LEFT JOIN almacen a ON p.almacen_id_almacen = a.id_almacen
            WHERE p.id_pedidos = '$id'
        ");
        
        $pedido = $this->cm->fetch($pedidoConsulta);
        if (!$pedido) {
            echo json_encode(["error" => "Pedido no encontrado"]);
            return;
        }

        $nropedido = $pedido[0];
        $fecha = $pedido[1];
        $codigo = $pedido[2];
        $almacen = $pedido[3];

        // Obtener productos del pedido
        $productosConsulta = $this->cm->query("
            SELECT dp.cantidad, p.codigo, p.descripcion
            FROM detalles_pedidos dp
            LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
            WHERE dp.pedidos_id_pedidos = '$id'
            ORDER BY dp.id_detalle_pedido ASC
        ");

        $productosTexto = "";
        $contador = 1;
        while ($prod = $this->cm->fetch($productosConsulta)) {
            $cantidad = $prod[0];
            $codigoProd = $prod[1];
            $descripcion = $prod[2];
            $productosTexto .= "$contador. $descripcion (Cod: $codigoProd) - Cant: $cantidad\n";
            $contador++;
        }

        // Construir mensaje
        $mensaje = "📦 *Pedido N° $nropedido*\n";
        $mensaje .= "📅 Fecha: $fecha\n";
        $mensaje .= "🏬 Almacén: $almacen\n";
        $mensaje .= "🧾 Código: $codigo\n\n";
        $mensaje .= "🛒 *Lista de productos:*\n";
        $mensaje .= $productosTexto;

        // Devolver el mensaje
        echo json_encode(["mensaje" => $mensaje]);
    }

    public function registroDetallePedido($idpedido,$cantidad,$productoalmacen){
        $res="";
        $registro=$this->cm->query("insert into detalles_pedidos(id_detalle_pedido,cantidad,observacion,pedidos_id_pedidos,productos_almacen_id_productos_almacen)value(NULL,'$cantidad','0','$idpedido','$productoalmacen')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIDdetallepedido($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT dp.id_detalle_pedido, dp.cantidad, dp.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, s.cantidad FROM detalles_pedidos dp 
        LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock s ON dp.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE s.estado = 1 AND dp.id_detalle_pedido = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "cantidad" => $qwe[1], "idproductoalmacen" => $qwe[2], "codigo" => $qwe[3], "descripcion" => $qwe[4], "stock" => $qwe[5]);
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

    public function editarDetallePedido($id,$cantidad,$productoalmacen)
    {
        $res = "";
        // Asegúrate de que los valores $cantidad y $productoalmacen estén saneados/escapados
        // para prevenir inyección SQL si no lo hace tu método cm->query
        $query_sql = "UPDATE detalles_pedidos SET cantidad='$cantidad', productos_almacen_id_productos_almacen='$productoalmacen' WHERE id_detalle_pedido='$id'";

        $registro = $this->cm->query($query_sql);

        // Para UPDATE, INSERT, DELETE, mysqli_query (o similar) devuelve TRUE en éxito, FALSE en error
        if ($registro === true) { // Cambia la condición aquí
            // Opcional: Puedes verificar si se afectaron filas para saber si el registro realmente cambió
            // if ($this->cm->affected_rows > 0) { ... }
            $res = array("estado" => "exito", "mensaje" => "Detalle actualizado correctamente");
        } else {
            // En caso de error de la consulta, $registro será false
            $res = array("estado" => "error", "mensaje" => "Error al actualizar el detalle. Por favor, inténtalo de nuevo.");
            // Opcional: Para depuración, podrías añadir $this->cm->error aquí para ver el error de la base de datos
        }
        echo json_encode($res);
    }

    public function eliminarDetallePedido($dato){
        $res="";
        $registro=$this->cm->query("delete from detalles_pedidos where id_detalle_pedido='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function listaCompra($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select i.id_ingreso,pr.nombre ,i.nombre,i.codigo,i.nfactura,i.fecha_ingreso,i.autorizacion,i.pedidos_id_pedidos,i.almacen_id_almacen,i.tipocompra, i.proveedor_id_proveedor, (SELECT SUM(di2.precio_unitario * di2.cantidad) FROM detalle_ingreso di2 WHERE di2.ingreso_id_ingreso = i.id_ingreso) as total
        from ingreso as i
        left join proveedor pr on i.proveedor_id_proveedor=pr.id_proveedor
        where pr.id_empresa='$idempresa'
        order by i.fecha_ingreso desc, i.id_ingreso desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id"=>$qwe[0],"proveedor"=>$qwe[1],"lote"=>$qwe[2],"codigo"=>$qwe[3],"nfactura"=>$qwe[4],"fecha"=>$qwe[5],"autorizacion"=>$qwe[6],"idpedido"=>$qwe[7],"idalmacen"=>$qwe[8],"tipocompra"=>$qwe[9],"idproveedor"=>$qwe[10], "total" => $qwe[11]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listaProductoCompra($idpedido, $idalmacen) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT pa.id_productos_almacen,p.codigo,p.cod_barras,p.nombre,p.descripcion,pa.pais,p.caracteristicas,pa.stock_minimo,s.cantidad,pa.fecha_registro,al.id_almacen,pa.estado,pa.stock_maximo
        FROM productos_almacen AS pa
        LEFT JOIN almacen AS al ON pa.almacen_id_almacen=al.id_almacen
        LEFT JOIN productos AS p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock AS s  ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen and s.estado='1'
        where pa.almacen_id_almacen='$idalmacen' and pa.id_productos_almacen not in (select dp.productos_almacen_id_productos_almacen from detalle_ingreso dp where dp.ingreso_id_ingreso='$idpedido')
        order by pa.id_productos_almacen desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("idproductoalmacen" => $qwe[0], "codigo" => $qwe[1], "codbarras" => $qwe[2], "nombre" => $qwe[3], "descripcion" => $qwe[4], "pais" => $qwe[5], "caracteristica" => $qwe[6], "stockMin" => $qwe[7], "stock" => $qwe[8], "fecha" => $qwe[9], "idalmacen" => $qwe[10], "estado" => $qwe[11], "stockMax" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroCompra($nombre,$codigo,$proveedor,$pedido,$factura,$tipocompra,$idalmacen,$idmd5){
        date_default_timezone_set('America/La_Paz');
        $res="";
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $sql = "SELECT idempresa FROM usuario WHERE idusuario = ?";
        $stmt = $this->rh->prepare($sql);
        $stmt->bind_param("i", $idusuario);
        $stmt->execute();
        $stmt->bind_result($idempresa);

        if ($stmt->fetch()) {
            $stmt->close();
            $verificarQuery = " SELECT COUNT(*) FROM ingreso i
                                INNER JOIN proveedor p ON i.proveedor_id_proveedor = p.id_proveedor
                                WHERE p.id_empresa = ? AND i.codigo = ?; ";
    
            $stmt = $this->cm->prepare($verificarQuery);
            if ($stmt === false) {
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                return;
            }
        
            $stmt->bind_param("is", $idempresa , $codigo);
            $stmt->execute();
            $stmt->bind_result($count);
            $stmt->fetch();
            $stmt->close();
        
            if ($count > 0) {
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Codigo duplicado por favor, inténtalo de nuevo");
            }else{
                $fecha = date("Y-m-d");
                if($pedido == 0){
                    $registro = $this->cm->query("insert into ingreso(id_ingreso, fecha_ingreso, nombre, codigo, autorizacion, proveedor_id_proveedor, pedidos_id_pedidos, estado, nfactura, tipocompra, almacen_id_almacen, usuario)value(NULL,'$fecha','$nombre','$codigo','2','$proveedor','$pedido','1','$factura','$tipocompra','$idalmacen','$idusuario')");
                    if($registro !== null){
                        $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacen" => $idalmacen);
                    }else{
                        $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                    }
                }
                else{
                    $registro = $this->cm->query("insert into ingreso(id_ingreso, fecha_ingreso, nombre, codigo, autorizacion, proveedor_id_proveedor, pedidos_id_pedidos, estado, nfactura, tipocompra, almacen_id_almacen, usuario)value(NULL,'$fecha','$nombre','$codigo','2','$proveedor','$pedido','1','$factura','$tipocompra','$idalmacen','$idusuario')");
                    $consingreso = $this->cm->query("select i.id_ingreso from ingreso i where i.pedidos_id_pedidos='$pedido' order by i.id_ingreso desc limit 1");
                    $fetchcon = $this->cm->fetch($consingreso);
                    $idingreso = $fetchcon[0];
                    $lista = $this->cm->query("select dp.id_detalle_pedido, dp.cantidad, dp.observacion, dp.pedidos_id_pedidos, dp.productos_almacen_id_productos_almacen, pb.precio from detalles_pedidos dp 
                    inner join precio_base pb on dp.productos_almacen_id_productos_almacen=pb.productos_almacen_id_productos_almacen
                    where dp.pedidos_id_pedidos = '$pedido' and pb.estado = '1'");
                    while ($qwe = $this->cm->fetch($lista)) {
                        $registro = $this->cm->query("insert into detalle_ingreso(id_detalle_ingreso,precio_unitario,cantidad,ingreso_id_ingreso,productos_almacen_id_productos_almacen)value(NULL,'$qwe[5]','$qwe[1]','$idingreso','$qwe[4]')");
                    }
                    if($registro !== null){
                        $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacen" => $idalmacen);
                    }else{
                        $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                    }
                }  
            }

        } else {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }

        
        
        echo json_encode($res);
    }
    public function eliminarCompra($dato){
        $res="";
        $responsable=$this->cm->query("delete from ingreso where id_ingreso='$dato'");
        if($responsable !== null){
            $registro=$this->cm->query("delete from detalle_ingreso where ingreso_id_ingreso='$dato'");
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIDCompra($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select i.id_ingreso,pr.nombre ,i.nombre,i.codigo,i.nfactura,i.fecha_ingreso,i.autorizacion,i.pedidos_id_pedidos,i.almacen_id_almacen,i.tipocompra, i.proveedor_id_proveedor 
        from ingreso as i
        left join proveedor pr on i.proveedor_id_proveedor=pr.id_proveedor
        where i.id_ingreso='$id'");
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id"=>$qwe[0],"proveedor"=>$qwe[1],"lote"=>$qwe[2],"codigo"=>$qwe[3],"nfactura"=>$qwe[4],"fecha"=>$qwe[5],"autorizacion"=>$qwe[6],"idpedido"=>$qwe[7],"idalmacen"=>$qwe[8],"tipocompra"=>$qwe[9],"idproveedor"=>$qwe[10]);
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

    public function editarCompra($idingreso, $nombre, $codigo, $proveedor, $factura)
    {
        try {
            $res = "";
            $registro = $this->cm->query("update ingreso SET nombre='$nombre', codigo='$codigo', proveedor_id_proveedor='$proveedor', nfactura='$factura' where id_ingreso='$idingreso'");
            if ($registro !== null) {
                $almacen = $this->cm->fetch($this->cm->query("SELECT almacen_id_almacen FROM ingreso WHERE id_ingreso='$idingreso'"));
                $res = array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacen" => $almacen[0], "ingreso" => $idingreso);
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function cambiarestadoCompra_($idingreso,$estado,$idpedido,$idalmacen){
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d");
        $codigo = "MIC";
        $con = 0;
        $res="";
        $registro=$this->cm->query("update ingreso SET autorizacion='$estado' where id_ingreso='$idingreso'");
        $estadopedido=$this->cm->query("update pedidos SET estado=1 where id_pedidos='$idpedido'");
        $nuevostock=$this->cm->query("select di.productos_almacen_id_productos_almacen, (di.cantidad + s.cantidad) as nuevo from detalle_ingreso as di inner join stock as s on di.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen where di.ingreso_id_ingreso='$idingreso' and s.estado=1");
        while($stock=$this->cm->fetch($nuevostock)){
            $cambioestado = $this->cm->query("update stock set estado=2 where productos_almacen_id_productos_almacen='$stock[0]' and estado=1");
            if($cambioestado === TRUE){
                $registrostock=$this->cm->query("insert into stock(id_stock,cantidad,fecha,codigo,estado,productos_almacen_id_productos_almacen) value(null,'$stock[1]','$fecha','$codigo',1,'$stock[0]')");
            }
        }
            
        if($registro===TRUE){
            $verificarnuevopb = $this->cm->query("select di.precio_unitario, di.productos_almacen_id_productos_almacen from detalle_ingreso as di where di.ingreso_id_ingreso='$idingreso' and not exists(select * from precio_base as pb where pb.productos_almacen_id_productos_almacen=di.productos_almacen_id_productos_almacen)");
            if($verificarnuevopb != 0){
                while($qwe=$this->cm->fetch($verificarnuevopb)){
                    $registropb = $this->cm->query("insert into precio_base(id_precio_base,precio,fecha,estado,productos_almacen_id_productos_almacen) value(null,'$qwe[0]','$fecha',1,'$qwe[1]')");
                    $con++;
                }

                $categoriafil = $this->cm->query("select p.id_porcentajes, p.tipo, p.porcentaje from porcentajes p where p.almacen_id_almacen='$idalmacen'");
                if($categoriafil != 0){
                    $verificarnuevops = $this->cm->query("select di.precio_unitario, di.productos_almacen_id_productos_almacen from detalle_ingreso as di where di.ingreso_id_ingreso='$idingreso' and not exists(select * from precio_sugerido as ps where ps.productos_almacen_id_productos_almacen=di.productos_almacen_id_productos_almacen)");
                    if($verificarnuevops != 0){
                        while($zxc = $this->cm->fetch($verificarnuevops)){
                            $categoria = $this->cm->query("select p.id_porcentajes, p.tipo, p.porcentaje from porcentajes p where p.almacen_id_almacen='$idalmacen'");
                            while($xcv = $this->cm->fetch($categoria)){
                                $precio = (($zxc[0] * $xcv[2]) / 100) + $zxc[0];
                                $idproducto = $zxc[1];
                                $idporcentaje = $xcv[0];
                                $respuesta = $this->cm->query("insert into precio_sugerido (id_precio_sugerido,precio,productos_almacen_id_productos_almacen,porcentajes_id_porcentajes) values(null,'$precio','$idproducto','$idporcentaje')");
                            }
                        }
                    }
                }
            }
            $res = array("success" => $con, "Se Actualizo Correctamente y se registro nuevos precios base y precio sugerido");
            
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);

    }

    public function cambiarestadoCompra($ingresoId, $estadoNuevo, $pedidoId, $almacenId) {
        // Inicializar el array de respuesta
        $response = [
            'status' => 'error',
            'message' => 'Ocurrió un error desconocido.',
            'new_prices_registered' => 0,
            'new_suggested_prices_registered' => 0
        ];

        // Obtener la fecha actual para registros
        $fechaActual = date("Y-m-d H:i:s"); // Usar H:i:s para incluir la hora si es relevante para registros
        $codigoStock = "MIC"; // Código para el registro de stock

        // Iniciar transacción para asegurar atomicidad de las operaciones
        $this->cm->begin_transaction();

        try {
            // 1. Actualizar estado del ingreso
            $stmtIngreso = $this->cm->prepare("UPDATE ingreso SET autorizacion = ? WHERE id_ingreso = ?");
            if (!$stmtIngreso) {
                throw new Exception("Error al preparar la consulta de actualización de ingreso: " . $this->cm->error);
            }
            $stmtIngreso->bind_param("ii", $estadoNuevo, $ingresoId);
            if (!$stmtIngreso->execute()) {
                throw new Exception("Error al actualizar el estado del ingreso: " . $stmtIngreso->error);
            }
            $stmtIngreso->close();

            if($pedidoId !== null){
                // 2. Actualizar estado del pedido
                $stmtPedido = $this->cm->prepare("UPDATE pedidos SET estado = 1 WHERE id_pedidos = ?");
                if (!$stmtPedido) {
                    throw new Exception("Error al preparar la consulta de actualización de pedido: " . $this->cm->error);
                }
                $stmtPedido->bind_param("i", $pedidoId);
                if (!$stmtPedido->execute()) {
                    throw new Exception("Error al actualizar el estado del pedido: " . $stmtPedido->error);
                }
                $stmtPedido->close();
            }
            

            // 3. Actualizar stock: Obtener y procesar el nuevo stock
            $stmtDetalleIngresoStock = $this->cm->prepare(
                "SELECT di.productos_almacen_id_productos_almacen, (di.cantidad + s.cantidad) AS nuevo_stock_cantidad
                 FROM detalle_ingreso AS di
                 INNER JOIN stock AS s ON di.productos_almacen_id_productos_almacen = s.productos_almacen_id_productos_almacen
                 WHERE di.ingreso_id_ingreso = ? AND s.estado = 1"
            );
            if (!$stmtDetalleIngresoStock) {
                throw new Exception("Error al preparar la consulta de detalle de ingreso para stock: " . $this->cm->error);
            }
            $stmtDetalleIngresoStock->bind_param("i", $ingresoId);
            if (!$stmtDetalleIngresoStock->execute()) {
                throw new Exception("Error al ejecutar la consulta de detalle de ingreso para stock: " . $stmtDetalleIngresoStock->error);
            }
            $resultadoStock = $stmtDetalleIngresoStock->get_result();

            while ($filaStock = $resultadoStock->fetch_assoc()) {
                $productoAlmacenId = $filaStock['productos_almacen_id_productos_almacen'];
                $nuevaCantidadStock = $filaStock['nuevo_stock_cantidad'];

                // Desactivar el stock anterior para este producto
                $stmtDesactivarStock = $this->cm->prepare("UPDATE stock SET estado = 2 WHERE productos_almacen_id_productos_almacen = ? AND estado = 1");
                if (!$stmtDesactivarStock) {
                    throw new Exception("Error al preparar la consulta de desactivación de stock: " . $this->cm->error);
                }
                $stmtDesactivarStock->bind_param("i", $productoAlmacenId);
                if (!$stmtDesactivarStock->execute()) {
                    throw new Exception("Error al desactivar stock anterior para producto " . $productoAlmacenId . ": " . $stmtDesactivarStock->error);
                }
                $stmtDesactivarStock->close();

                // Registrar el nuevo stock
                $stmtRegistrarStock = $this->cm->prepare("INSERT INTO stock (cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) VALUES (?, ?, ?, ?, ?)");
                if (!$stmtRegistrarStock) {
                    throw new Exception("Error al preparar la consulta de registro de nuevo stock: " . $this->cm->error);
                }
                $estadoStockNuevo = 1; // Estado activo para el nuevo stock
                $stmtRegistrarStock->bind_param("dssii", $nuevaCantidadStock, $fechaActual, $codigoStock, $estadoStockNuevo, $productoAlmacenId);
                if (!$stmtRegistrarStock->execute()) {
                    throw new Exception("Error al registrar nuevo stock para producto " . $productoAlmacenId . ": " . $stmtRegistrarStock->error);
                }
                $stmtRegistrarStock->close();
            }
            $stmtDetalleIngresoStock->close();

            // 4. Registrar nuevos precios base si no existen
            $stmtVerificarPrecioBase = $this->cm->prepare(
                "SELECT di.precio_unitario, di.productos_almacen_id_productos_almacen
                 FROM detalle_ingreso AS di
                 WHERE di.ingreso_id_ingreso = ?
                 AND NOT EXISTS (SELECT 1 FROM precio_base AS pb WHERE pb.productos_almacen_id_productos_almacen = di.productos_almacen_id_productos_almacen)"
            );
            if (!$stmtVerificarPrecioBase) {
                throw new Exception("Error al preparar la consulta de verificación de precio base: " . $this->cm->error);
            }
            $stmtVerificarPrecioBase->bind_param("i", $ingresoId);
            if (!$stmtVerificarPrecioBase->execute()) {
                throw new Exception("Error al ejecutar la consulta de verificación de precio base: " . $stmtVerificarPrecioBase->error);
            }
            $resultadoVerificarPrecioBase = $stmtVerificarPrecioBase->get_result();

            $preciosBaseRegistrados = 0;
            while ($filaPrecioBase = $resultadoVerificarPrecioBase->fetch_assoc()) {
                $precioUnitario = $filaPrecioBase['precio_unitario'];
                $productoAlmacenId = $filaPrecioBase['productos_almacen_id_productos_almacen'];

                $stmtRegistrarPrecioBase = $this->cm->prepare("INSERT INTO precio_base (precio, fecha, estado, productos_almacen_id_productos_almacen) VALUES (?, ?, ?, ?)");
                if (!$stmtRegistrarPrecioBase) {
                    throw new Exception("Error al preparar la consulta de registro de precio base: " . $this->cm->error);
                }
                $estadoPrecioBase = 1; // Estado activo para precio base
                $stmtRegistrarPrecioBase->bind_param("dsii", $precioUnitario, $fechaActual, $estadoPrecioBase, $productoAlmacenId);
                if (!$stmtRegistrarPrecioBase->execute()) {
                    throw new Exception("Error al registrar precio base para producto " . $productoAlmacenId . ": " . $stmtRegistrarPrecioBase->error);
                }
                $stmtRegistrarPrecioBase->close();
                $preciosBaseRegistrados++;
            }
            $stmtVerificarPrecioBase->close();
            $response['new_prices_registered'] = $preciosBaseRegistrados;

            // 5. Registrar nuevos precios sugeridos si no existen
            // Obtener porcentajes de categorías para el almacén
            $stmtPorcentajes = $this->cm->prepare("SELECT id_porcentajes, porcentaje FROM porcentajes WHERE almacen_id_almacen = ?");
            if (!$stmtPorcentajes) {
                throw new Exception("Error al preparar la consulta de porcentajes: " . $this->cm->error);
            }
            $stmtPorcentajes->bind_param("i", $almacenId);
            if (!$stmtPorcentajes->execute()) {
                throw new Exception("Error al ejecutar la consulta de porcentajes: " . $stmtPorcentajes->error);
            }
            $resultadoPorcentajes = $stmtPorcentajes->get_result();
            $porcentajes = [];
            while ($filaPorcentaje = $resultadoPorcentajes->fetch_assoc()) {
                $porcentajes[] = $filaPorcentaje;
            }
            $stmtPorcentajes->close();

            if (!empty($porcentajes)) {
                $stmtVerificarPrecioSugerido = $this->cm->prepare(
                    "SELECT di.precio_unitario, di.productos_almacen_id_productos_almacen
                     FROM detalle_ingreso AS di
                     WHERE di.ingreso_id_ingreso = ?
                     AND NOT EXISTS (SELECT 1 FROM precio_sugerido AS ps WHERE ps.productos_almacen_id_productos_almacen = di.productos_almacen_id_productos_almacen)"
                );
                if (!$stmtVerificarPrecioSugerido) {
                    throw new Exception("Error al preparar la consulta de verificación de precio sugerido: " . $this->cm->error);
                }
                $stmtVerificarPrecioSugerido->bind_param("i", $ingresoId);
                if (!$stmtVerificarPrecioSugerido->execute()) {
                    throw new Exception("Error al ejecutar la consulta de verificación de precio sugerido: " . $stmtVerificarPrecioSugerido->error);
                }
                $resultadoVerificarPrecioSugerido = $stmtVerificarPrecioSugerido->get_result();

                $preciosSugeridosRegistrados = 0;
                while ($filaPrecioSugerido = $resultadoVerificarPrecioSugerido->fetch_assoc()) {
                    $precioUnitarioBase = $filaPrecioSugerido['precio_unitario'];
                    $productoAlmacenId = $filaPrecioSugerido['productos_almacen_id_productos_almacen'];

                    foreach ($porcentajes as $porcentajeData) {
                        $idPorcentaje = $porcentajeData['id_porcentajes'];
                        $porcentajeValor = $porcentajeData['porcentaje'];
                        $precioSugeridoCalculado = (($precioUnitarioBase * $porcentajeValor) / 100) + $precioUnitarioBase;

                        $stmtRegistrarPrecioSugerido = $this->cm->prepare("INSERT INTO precio_sugerido (precio, productos_almacen_id_productos_almacen, porcentajes_id_porcentajes) VALUES (?, ?, ?)");
                        if (!$stmtRegistrarPrecioSugerido) {
                            throw new Exception("Error al preparar la consulta de registro de precio sugerido: " . $this->cm->error);
                        }
                        $stmtRegistrarPrecioSugerido->bind_param("dii", $precioSugeridoCalculado, $productoAlmacenId, $idPorcentaje);
                        if (!$stmtRegistrarPrecioSugerido->execute()) {
                            throw new Exception("Error al registrar precio sugerido para producto " . $productoAlmacenId . " y porcentaje " . $idPorcentaje . ": " . $stmtRegistrarPrecioSugerido->error);
                        }
                        $stmtRegistrarPrecioSugerido->close();
                        $preciosSugeridosRegistrados++;
                    }
                }
                $stmtVerificarPrecioSugerido->close();
                $response['new_suggested_prices_registered'] = $preciosSugeridosRegistrados;
            }

            // Si todas las operaciones fueron exitosas, confirmar la transacción
            $this->cm->commit();
            $response['status'] = 'ok';
            $response['message'] = 'Venta procesada exitosamente. Se registraron ' . $response['new_prices_registered'] . ' nuevos precios base y ' . $response['new_suggested_prices_registered'] . ' nuevos precios sugeridos.';

        } catch (Exception $e) {
            // Si ocurre algún error, revertir la transacción
            $this->cm->rollback();
            $response['status'] = 'error';
            $response['message'] = 'Error al procesar la venta: ' . $e->getMessage();
            // Opcional: registrar el error en un log para depuración
            error_log("Error en cambiarestadoCompra: " . $e->getMessage());
        } finally {
            // Asegurarse de que cualquier statement abierto se cierre si no se hizo explícitamente
            // (aunque con close() explícito, esto es más una medida de seguridad)
            // if (isset($stmtIngreso) && $stmtIngreso->num_rows > 0) $stmtIngreso->close();
            // ... y así para todos los statements si no se cierran dentro del try
        }

        // Devolver la respuesta en formato JSON
        echo json_encode($response);
    }

    public function cancelarCompra($id){
        try {
            $registro = $this->cm->query("delete from detalle_ingreso where ingreso_id_ingreso='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Eliminacion exitoss");
            } else {
                $res = array("estado" => 101, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function listaDetalleCompra($id) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT dp.id_detalle_ingreso, dp.cantidad, dp.ingreso_id_ingreso, dp.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, dp.precio_unitario FROM detalle_ingreso dp
        LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        WHERE dp.ingreso_id_ingreso = '$id'
        ORDER BY dp.id_detalle_ingreso DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "cantidad" => $qwe[1], "idingreso" => $qwe[2], "idproductoalmacen" => $qwe[3], "codigo" => $qwe[4], "descripcion" => $qwe[5], "precio" => $qwe[6]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroDetalleCompra($precio,$cantidad,$idingreso,$productoalmacen){
        $res="";
        $registro=$this->cm->query("insert into detalle_ingreso(id_detalle_ingreso,precio_unitario,cantidad,ingreso_id_ingreso,productos_almacen_id_productos_almacen)value(NULL,'$precio','$cantidad','$idingreso','$productoalmacen')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIDdetallecompra($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT di.id_detalle_ingreso, di.precio_unitario, di.cantidad, di.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, s.cantidad FROM detalle_ingreso di 
        LEFT JOIN productos_almacen pa ON di.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock s ON di.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE s.estado = 1 AND di.id_detalle_ingreso = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "precio" => $qwe[1], "cantidad" => $qwe[2], "idproductoalmacen" => $qwe[3], "codigo" => $qwe[4], "descripcion" => $qwe[5], "stock" => $qwe[6]);
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

    public function editardetalleCompra($id, $precio, $cantidad, $idproducto)
    {
        try {
            $res = "";
            $fecha = date("Y-m-d");
            $registro = $this->cm->query("update detalle_ingreso SET precio_unitario='$precio', cantidad='$cantidad', productos_almacen_id_productos_almacen='$idproducto' where id_detalle_ingreso='$id'");
            if ($registro !== null) {
                $res = array("estado" => "exito", "mensaje" => "Actualización exitosa");
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function eliminarDetalleCompra($dato){
        $res="";
        $registro=$this->cm->query("delete from detalle_ingreso where id_detalle_ingreso='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function uploadRecibo()
    {
        $res = array();

        // 1. Validar datos de entrada
        $idpedido = isset($_POST['idpedido']) ? $_POST['idpedido'] : null;
        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado.");
            echo json_encode($res);
            return;
        }

        if (!isset($_FILES['recibo']) || $_FILES['recibo']['error'] !== UPLOAD_ERR_OK) {
            $res = array("estado" => "error", "mensaje" => "No se envió ningún archivo o hubo un error de subida.");
            echo json_encode($res);
            return;
        }

        $file = $_FILES['recibo'];

        // 2. Validar tipo de archivo y tamaño (CRUCIAL para seguridad)
        $allowedImageTypes = ['image/jpeg', 'image/png'];
        $allowedPdfType = 'application/pdf';
        $maxFileSize = 5 * 1024 * 1024; // 5 MB

        if ($file['size'] > $maxFileSize) {
            $res = array("estado" => "error", "mensaje" => "El archivo es demasiado grande. Máximo 5MB.");
            echo json_encode($res);
            return;
        }

        $isImage = in_array($file['type'], $allowedImageTypes);
        $isPdf = ($file['type'] === $allowedPdfType);

        if (!$isImage && !$isPdf) {
            $res = array("estado" => "error", "mensaje" => "Tipo de archivo no permitido. Solo JPG, PNG, PDF.");
            echo json_encode($res);
            return;
        }

        // 3. Definir directorio de subida y ruta pública
        $uploadDir = 'uploads/recibos/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Crear si no existe (asegura permisos adecuados)
        }

        $newFileNameBase = uniqid('recibo_') . '_' . $idpedido; // Nombre base único
        $destinationPath = ''; // Ruta donde se guardará el archivo en el servidor
        $publicPath = '';      // URL pública para acceder al archivo

        // 4. Procesar el archivo: Convertir a WebP o guardar como PDF
        if ($isImage) {
            $quality = 80; // Calidad para WebP (0-100)
            $newFileName = $newFileNameBase . '.webp';
            $destinationPath = $uploadDir . $newFileName;
            $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath; // AJUSTA TU URL BASE REAL

            $image = null;
            if ($file['type'] === 'image/jpeg') {
                $image = imagecreatefromjpeg($file['tmp_name']);
            } elseif ($file['type'] === 'image/png') {
                $image = imagecreatefrompng($file['tmp_name']);
                imagealphablending($image, false); // Mantener transparencia si es PNG
                imagesavealpha($image, true);
            }

            if ($image) {
                // Eliminar imagen anterior si existe (antes de guardar la nueva)
                $this->deleteOldReciboFile($idpedido, $uploadDir, 'https://mistersofts.com/app/cmv1/api/'); // Pasa la URL base
                
                if (imagewebp($image, $destinationPath, $quality)) {
                    imagedestroy($image); // Liberar memoria
                    // Continuar para actualizar la DB
                } else {
                    imagedestroy($image);
                    $res = array("estado" => "error", "mensaje" => "Error al convertir y guardar la imagen en formato WebP.");
                    echo json_encode($res);
                    return;
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "No se pudo cargar la imagen para conversión.");
                echo json_encode($res);
                return;
            }

        } elseif ($isPdf) {
            $originalExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $newFileName = $newFileNameBase . '.' . $originalExtension;
            $destinationPath = $uploadDir . $newFileName;
            $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath; // AJUSTA TU URL BASE REAL

            // Eliminar archivo anterior si existe (antes de mover el nuevo)
            $this->deleteOldReciboFile($idpedido, $uploadDir, 'https://mistersofts.com/app/cmv1/api/'); // Pasa la URL base

            if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
                $res = array("estado" => "error", "mensaje" => "No se pudo mover el archivo PDF subido.");
                echo json_encode($res);
                return;
            }
            // Continuar para actualizar la DB
        }

        // 5. Actualizar la base de datos con la nueva ruta
        $query_update = "UPDATE pedidos SET ruta_recibo = '$publicPath' WHERE id_pedidos = '$idpedido'";
        $registro = $this->cm->query($query_update);

        if ($registro !== null) { // Asumiendo que $this->cm->query devuelve no-nulo en éxito para UPDATE
            $res = array(
                "estado" => "exito",
                "mensaje" => "Recibo subido/actualizado exitosamente.",
                "ruta_recibo" => $publicPath // Devolver la URL pública
            );
        } else {
            // Si la actualización en la DB falla, intenta eliminar el archivo que acabas de subir para evitar huérfanos
            if (file_exists($destinationPath)) {
                unlink($destinationPath);
            }
            $res = array("estado" => "error", "mensaje" => "Recibo subido, pero falló el registro en la base de datos.");
        }

        echo json_encode($res);
    }

    // NUEVA FUNCIÓN HELPER para eliminar el archivo viejo
    // Debería estar en tu clase o en un lugar accesible.
    private function deleteOldReciboFile($idpedido, $uploadDir, $baseUrl)
    {
        // Primero, recupera la ruta actual de la base de datos
        $query_select_old = "SELECT ruta_recibo FROM pedidos WHERE id_pedidos = '$idpedido'";
        $old_recibo_result = $this->cm->query($query_select_old);
        $old_recibo_data = $this->cm->fetch($old_recibo_result);
        $old_recibo_full_url = $old_recibo_data ? $old_recibo_data['ruta_recibo'] : null;

        if ($old_recibo_full_url && strpos($old_recibo_full_url, $baseUrl) === 0) { // Asegura que es una URL de tu servidor
            // Extraer la ruta local del archivo de la URL pública
            $local_old_path = str_replace($baseUrl, '', $old_recibo_full_url);
            // Asegúrate de que la ruta local sea correcta y esté dentro de tu directorio de uploads
            if (strpos($local_old_path, $uploadDir) === 0 && file_exists($local_old_path)) {
                unlink($local_old_path); // Eliminar el archivo antiguo
            }
        }
    }

    // Puedes aplicar una lógica similar a tu función `uploadFotoMovimiento`
    // public function uploadFotoMovimiento() { /* ... */ }

    // Y para `deleteRecibo` asegúrate de que el `unlink` se aplique al archivo con la extensión correcta (.webp, .pdf, .png, .jpg)
    public function deleteRecibo($idpedido) 
    {
        $res = array();

        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado.");
            echo json_encode($res);
            return;
        }

        $query_select = "SELECT ruta_recibo FROM pedidos WHERE id_pedidos = '$idpedido'";
        $result = $this->cm->query($query_select);
        $data = $this->cm->fetch($result);
        $current_recibo_url = $data ? $data['ruta_recibo'] : null;

        $deleted_file = false;
        if ($current_recibo_url) {
            // Asumiendo que la ruta guardada en DB es la URL completa
            $baseUrl = 'https://mistersofts.com/app/cmv1/api/'; // AJUSTA TU URL BASE REAL
            if (strpos($current_recibo_url, $baseUrl) === 0) {
                $local_file_path = str_replace($baseUrl, '', $current_recibo_url); // Obtener la ruta relativa
                if (file_exists($local_file_path)) {
                    if (unlink($local_file_path)) {
                        $deleted_file = true;
                    } else {
                        $res = array("estado" => "error", "mensaje" => "No se pudo eliminar el archivo físico del recibo.");
                        echo json_encode($res);
                        return;
                    }
                } else {
                    // Si el archivo no se encuentra en disco, pero la ruta existe en la DB, asumimos que se "borró"
                    $deleted_file = true;
                }
            }
        } else {
            // No hay ruta en DB, nada que borrar físicamente
            $deleted_file = true;
        }

        // 2. Limpiar la ruta de la base de datos
        $query_update = "UPDATE pedidos SET ruta_recibo = NULL WHERE id_pedidos = '$idpedido'";
        $registro = $this->cm->query($query_update);

        if ($registro !== null && $deleted_file) {
            $res = array("estado" => "exito", "mensaje" => "Recibo eliminado correctamente.");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al eliminar el registro del recibo en la base de datos.");
        }

        echo json_encode($res);
    }
    public function getRecibo($idpedido) 
    {
        $res = array();

        // 1. Basic Validation for ID
        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado.");
            echo json_encode($res);
            return;
        }

        // 2. Prepare and Execute the Database Query
        // --- IMPORTANT: Use prepared statements to prevent SQL Injection ---
        // Assuming $this->cm->prepare and $this->cm->execute work similarly to PDO/MySQLi
        $query = "SELECT ruta_recibo FROM pedidos WHERE id_pedidos = ?";
        $stmt = $this->cm->prepare($query); // Prepare the query

        if (!$stmt) {
            $res = array("estado" => "error", "mensaje" => "Error interno del servidor al preparar la consulta.");
            echo json_encode($res);
            return;
        }

        // Bind the parameter (assuming 's' for string if id_pedidos is varchar, or 'i' for integer)
        // Adjust 'i'/'s' based on your 'id_pedidos' column type. If it's INT, use 'i'.
        $stmt->bind_param("i", $idpedido); // 'i' for integer, 's' for string
        $stmt->execute();
        $result = $stmt->get_result(); // Get the result set

        // 3. Process the Result
        $data = $result->fetch_assoc(); // Fetch as an associative array

        if ($data && isset($data['ruta_recibo']) && $data['ruta_recibo'] !== null) {
            $ruta_recibo = $data['ruta_recibo'];

            // Optional: Basic URL validation if you want to be extra careful
            // filter_var($ruta_recibo, FILTER_VALIDATE_URL)
            // However, if you control the upload process, the URL should be valid.

            $res = array("estado" => "exito", "ruta_recibo" => $ruta_recibo);
        } else {
            // If no data or ruta_recibo is NULL, it means no receipt is attached or pedido not found
            $res = array("estado" => "error", "mensaje" => "No hay recibo adjunto para este pedido o el pedido no existe.");
        }

        // 4. Send JSON Response
        echo json_encode($res);

        // Optional: Close the statement (depending on your $this->cm implementation)
        $stmt->close();
    }
    public function uploadFotoMovimiento() 
    {
        $res = array();

        // 1. Validate incoming data
        $idpedido = isset($_POST['idpedido']) ? $_POST['idpedido'] : null;
        if (!$idpedido) {
            $res = array("estado" => "error", "mensaje" => "ID de pedido no proporcionado para la foto del movimiento.");
            echo json_encode($res);
            return;
        }

        if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
            $res = array("estado" => "error", "mensaje" => "No se envió ningún archivo de foto o hubo un error de subida.");
            echo json_encode($res);
            return;
        }

        $file = $_FILES['foto']; // Assuming the frontend sends the file under the name 'foto'

        // 2. File Validation (Crucial for security)
        $allowedImageTypes = ['image/jpeg', 'image/png'];
        $maxFileSize = 5 * 1024 * 1024; // 5 MB (Adjust as needed)

        if (!in_array($file['type'], $allowedImageTypes)) {
            $res = array("estado" => "error", "mensaje" => "Tipo de archivo no permitido. Solo JPG, PNG.");
            echo json_encode($res);
            return;
        }

        if ($file['size'] > $maxFileSize) {
            $res = array("estado" => "error", "mensaje" => "La foto es demasiado grande. Máximo 5MB.");
            echo json_encode($res);
            return;
        }

        // 3. Define Upload Directory and Public Path
        $uploadDir = 'uploads/fotos_movimientos/'; // Specific directory for movement photos
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Create if it doesn't exist (ensure proper permissions)
        }

        $newFileNameBase = uniqid('foto_movimiento_') . '_' . $idpedido; // Unique name + pedido ID
        $destinationPath = ''; // Path where the file will be saved on the server
        $publicPath = '';      // Public URL to access the file

        // 4. Process the image: Convert to WebP
        $quality = 80; // WebP quality (0-100)
        $newFileName = $newFileNameBase . '.webp';
        $destinationPath = $uploadDir . $newFileName;
        $publicPath = 'https://mistersofts.com/app/cmv1/api/' . $destinationPath; // **ADJUST TO YOUR ACTUAL BASE URL**

        $image = null;
        if ($file['type'] === 'image/jpeg') {
            $image = imagecreatefromjpeg($file['tmp_name']);
        } elseif ($file['type'] === 'image/png') {
            $image = imagecreatefrompng($file['tmp_name']);
            imagealphablending($image, false); // Maintain transparency for PNGs
            imagesavealpha($image, true);
        }

        if ($image) {
            // Delete old photo file if replacing
            $this->deleteOldMovementPhotoFile($idpedido, $uploadDir, 'https://mistersofts.com/app/cmv1/api/'); // Pass base URL
            
            if (imagewebp($image, $destinationPath, $quality)) {
                imagedestroy($image); // Free up memory
                // Continue to update the DB
            } else {
                imagedestroy($image);
                $res = array("estado" => "error", "mensaje" => "Error al convertir y guardar la foto de movimiento en formato WebP.");
                echo json_encode($res);
                return;
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "No se pudo cargar la foto para conversión.");
            echo json_encode($res);
            return;
        }

        // 5. Update database with the new path
        // Assuming you have a column named 'ruta_foto_pedido' in your 'pedidos' table for this
        $query_update = "UPDATE pedidos SET ruta_foto_pedido = ? WHERE id_pedidos = ?";
        $stmt = $this->cm->prepare($query_update);

        if (!$stmt) {
            // If DB update fails, attempt to delete the file you just uploaded to avoid orphans
            if (file_exists($destinationPath)) {
                unlink($destinationPath);
            }
            $res = array("estado" => "error", "mensaje" => "Error interno del servidor al preparar la actualización de la foto.");
            echo json_encode($res);
            return;
        }

        // Bind parameters: 's' for string (URL), 'i' for integer (id_pedidos)
        $stmt->bind_param("si", $publicPath, $idpedido);
        $registro = $stmt->execute();

        if ($registro) { // $stmt->execute() returns true on success, false on failure
            $res = array(
                "estado" => "exito",
                "mensaje" => "Foto de movimiento subida y registrada exitosamente.",
                "ruta_foto" => $publicPath // Return the public URL
            );
        } else {
            // If DB update fails, attempt to delete the file you just uploaded to avoid orphans
            if (file_exists($destinationPath)) {
                unlink($destinationPath);
            }
            $res = array("estado" => "error", "mensaje" => "Foto subida, pero falló el registro en la base de datos: " . $stmt->error);
        }

        echo json_encode($res);
        $stmt->close(); // Close the statement
    }

    // NEW HELPER FUNCTION to delete the old movement photo file
    // Should be within your class or an accessible helper.
    private function deleteOldMovementPhotoFile($idpedido, $uploadDir, $baseUrl)
    {
        // First, retrieve the current path from the database
        $query_select_old = "SELECT ruta_foto_pedido FROM pedidos WHERE id_pedidos = ?";
        $stmt_select = $this->cm->prepare($query_select_old);
        if (!$stmt_select) return; // Handle prepare error silently for helper
        
        $stmt_select->bind_param("i", $idpedido);
        $stmt_select->execute();
        $result = $stmt_select->get_result();
        $old_photo_data = $result->fetch_assoc();
        $old_photo_full_url = $old_photo_data ? $old_photo_data['ruta_foto_pedido'] : null;
        $stmt_select->close();

        if ($old_photo_full_url && strpos($old_photo_full_url, $baseUrl) === 0) { // Ensure it's a URL from your server
            // Extract the local file path from the public URL
            $local_old_path = str_replace($baseUrl, '', $old_photo_full_url);
            // Ensure the local path is correct and within your uploads directory
            if (strpos($local_old_path, $uploadDir) === 0 && file_exists($local_old_path)) {
                unlink($local_old_path); // Delete the old file
            }
        }
    }
}
