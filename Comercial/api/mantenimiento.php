<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "facturacion.php";
require_once "asignarProductoAlmacen.php";

//proveedor
class mantenimiento
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
        $this->conexion = new conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion;
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->ad = $this->conexion->ad;
        $this->em = $this->conexion->em;
    }

    //funcion de listado de almacenes
    public function listarAlmacenes($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if ($idempresa) {
            // Obtener información de sucursalcontable
            $sucursales = $this->em->query("SELECT idsucursalcontable, nombre, codigosucursal FROM sucursalcontable WHERE idorganizacion='$idempresa'");

            // Crear un array asociativo con la información de todas las sucursales
            $sucursalInfo = [];
            $sucursalInfoVacia = [];
            if ($this->em->rows($sucursales) > 0) {
                while ($sucursal = $this->em->fetch($sucursales)) {
                    $sucursalInfo[$sucursal['idsucursalcontable']] = array(
                        "idsucursal" => $sucursal['idsucursalcontable'],
                        "nombre" => $sucursal['nombre'],
                        "codigosucursal" => $sucursal['codigosucursal']
                    );
                }
            } else {
                // Si la consulta no devolvió resultados, cargar datos vacíos
                $valor = 0;
                $sucursalInfoVacia[$valor] = array(
                    "idsucursal" => 0,
                    "nombre" => "Sin sucursales",
                    "codigosucursal" => "codigosucursal"
                );
            }

            // Consulta para obtener información de almacén
            $consulta = $this->cm->query("SELECT a.id_almacen, a.nombre, a.direccion, a.telefono, a.email, a.tipo_almacen_id_tipo_almacen, ta.tipo_almacen, a.fecha_creacion, a.stockmin, a.stockmax, a.estado, a.idsucursal FROM almacen a
            LEFT JOIN tipo_almacen ta ON a.tipo_almacen_id_tipo_almacen = ta.id_tipo_almacen
            WHERE a.idempresa='$idempresa' ORDER BY a.id_almacen DESC");

            while ($lst = $this->cm->fetch($consulta)) {
                $res = array(
                    "id" => $lst[0],
                    "nombre" => $lst[1],
                    "direccion" => $lst[2],
                    "telefono" => $lst[3],
                    "email" => $lst[4],
                    "idtipoalmacen" => $lst[5],
                    "tipoalmacen" => $lst[6],
                    "fecha" => $lst[7],
                    "stockmin" => $lst[8],
                    "stockmax" => $lst[9],
                    "estado" => $lst[10],
                    "verificar" => '1',
                    "sucursales" => []  // Inicializar array para almacenar información de sucursales asociadas
                );
                if ($lst[11] == 0 ){
                    $res['sucursales'][] = $sucursalInfoVacia[0] = array(
                        "idsucursal" => 0,
                        "nombre" => "Sin sucursales"
                    );
                } elseif (isset($sucursalInfo[$lst[11]])) {
                    $res['sucursales'][] = $sucursalInfo[$lst[11]];
                }

                array_push($lista, $res);
            }
        } else {
            $res = array("mensaje" => "El id_empresa no existe");
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }

    //funcion de registro de almacenes
    public function registraralmacen($nombre,$direccion,$telefono,$email,$tipoalmacen,$stockmin,$stockmax,$idsucursal,$idmd5){
        $fecha=date("Y-m-d");
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $verificarQuery = "SELECT COUNT(*) FROM almacen a WHERE a.idempresa = ? AND a.nombre = ?";
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
            $registro=$this->cm->query("insert into almacen(id_almacen, nombre, direccion, telefono, email, tipo_almacen_id_tipo_almacen, fecha_creacion, stockmin, stockmax, estado, idempresa, idsucursal)value(NULL,'$nombre','$direccion','$telefono','$email','$tipoalmacen','$fecha','$stockmin','$stockmax','1','$idempresa','$idsucursal')");
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }
        
        echo json_encode($res);

    }

    public function verificarIdAlmacen($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT a.id_almacen, a.nombre, a.direccion, a.telefono, a.email, a.tipo_almacen_id_tipo_almacen, ta.tipo_almacen, a.fecha_creacion, a.stockmin, a.stockmax, a.estado, a.idsucursal FROM almacen a
        LEFT JOIN tipo_almacen ta ON a.tipo_almacen_id_tipo_almacen = ta.id_tipo_almacen
        WHERE a.id_almacen='$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($lst = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $lst[0], "nombre" => $lst[1], "direccion" => $lst[2], "telefono" => $lst[3], "email" => $lst[4], "idtipoalmacen" => $lst[5], "tipoalmacen" => $lst[6], "fecha" => $lst[7], "stockmin" => $lst[8], "stockmax" => $lst[9], "estado" => $lst[10], "idsucursal" => $lst[11]);
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

    //funcion de actualizacion de almacenes
    public function editaralmacen($idalmacen,$nombre,$direccion,$telefono,$email,$tipoalmacen,$stockmin,$stockmax,$idsucursal){
        $res="";
        $registro=$this->cm->query("update almacen SET nombre='$nombre',direccion='$direccion',telefono='$telefono',email='$email',tipo_almacen_id_tipo_almacen='$tipoalmacen', stockmin='$stockmin', stockmax='$stockmax', idsucursal='$idsucursal' where id_almacen='$idalmacen'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    //funcion de eliminar almacen
    public function eliminaralmacen_($dato){
        $res="";
        $registro=$this->cm->query("delete from almacen where id_almacen='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminaralmacen($dato)
    {
        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de almacen no válido");
            }


            // Verificar si el producto está relacionado en otras tablas
            $relacionadas = [
                'cambios' => 'No se puede eliminar porque hay registros en la tabla Cambios.',
                'responsablealmacen' => ' No se puede eliminar porque está asignado a un Responsable de Almacén.',
                'productos_almacen' => 'No se puede eliminar porque hay productos asignados al Almacén.',
                'porcentajes' => 'No se puede eliminar porque hay porcentajes asignados al Almacén.',
                'campañas' => 'No se puede eliminar porque hay campañas asignadas al Almacén.',
                'ingreso' => 'No se puede eliminar porque hay ingresos asignados al Almacén.',
                'mermas_desperdicios' => ' No se puede eliminar porque hay mermas o desperdicios asignados al Almacén.',
                'robos' => 'No se puede eliminar porque hay registros de robos asignados al Almacén.',
                'movimiento' => 'No se puede eliminar porque hay movimientos asignados al Almacén.',
                'pedidos' => 'No se puede eliminar porque hay pedidos asignados al Almacén.',
            ];

            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE almacen_id_almacen = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje);
                }
                $stmt->close();
            }

           

            // Eliminar el producto
            $query = "DELETE FROM almacen WHERE id_almacen = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el producto");
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
    //funcion para cambiar estado almacen//punto
    public function cambiarEstadoAlmacen($idalmacen,$estado){
        $res="";
        
        $registro=$this->cm->query("update almacen SET estado='$estado' where id_almacen='$idalmacen'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function listaPuntoVenta($id)
    {
        $lista = [];
        $tipovacio = [
                "codigo" => null,
                "descripcion" => null,
                "isActive" => null
        ];
        $tipospuntoventa = [
            1 => [
                "codigo" => 1,
                "descripcion" => "PUNTO VENTA COMISIONISTA",
                "isActive" => 1
            ],
            2 => [
                "codigo" => 2,
                "descripcion" => "PUNTO VENTA VENTANILLA DE COBRANZA",
                "isActive" => 1
            ],
            3 => [
                "codigo" => 3,
                "descripcion" => "PUNTO DE VENTA MOVILES",
                "isActive" => 1
            ],
            4 => [
                "codigo" => 4,
                "descripcion" => "PUNTO DE VENTA YPFB",
                "isActive" => 1
            ],
            5 => [
                "codigo" => 5,
                "descripcion" => "PUNTO DE VENTA CAJEROS",
                "isActive" => 1
            ],
            6 => [
                "codigo" => 6,
                "descripcion" => "PUNTO DE VENTA CONJUNTA",
                "isActive" => 1
            ]
        ];
        $qwe2 = $this->cm->fetch($this->cm->query("SELECT a.id_almacen, a.nombre, a.direccion, a.telefono, a.email, ta.tipo_almacen, a.fecha_creacion, a.estado, a.tipo_almacen_id_tipo_almacen, a.stockmin, a.stockmax, a.idsucursal FROM almacen a 
            INNER JOIN tipo_almacen ta ON a.tipo_almacen_id_tipo_almacen = ta.id_tipo_almacen 
            WHERE a.id_almacen = '{$id}'"));
        $res1 = (object) [
                "id" => $qwe2[0],
                "nombre" => $qwe2[1],
                "direccion" => $qwe2[2],
                "telefono" => $qwe2[3],
                "email" => $qwe2[4],
                "tipoalmacen" => $qwe2[5],
                "fecha" => $qwe2[6],
                "estado" => $qwe2[7],
                "idtipoalmacen" => $qwe2[8],
                "stockmin" => $qwe2[9],
                "stockmax" => $qwe2[10],
                "idsucursal" => $qwe2[11],
        ];
        $query = "select * from punto_venta pv where pv.idalmacen = '$id' order by pv.idpunto_venta desc";
        $alma = $this->cm->query($query);

        while ($qwe = $this->cm->fetch($alma)) {

            $res = (object) [
                "id" => $qwe[0],
                "nombre" => $qwe[1],
                "descripcion" => $qwe[2],
                "tipo" => $qwe[3] == null ? $tipovacio : $tipospuntoventa[$qwe[3]],
                "codigoSucursal" => $qwe[4],
                "almacen" => $res1,
                "estadosin" => $qwe[6],
                "codigosin" => $qwe[7]
            ];
            array_push($lista, $res);
        }

        echo json_encode($lista);
    }

    public function registroPuntoVenta($nombre, $descripcion, $idalmacen)
    {
        try {
            $res = "";

            $sql = "SELECT idempresa FROM almacen WHERE id_almacen = ?";
            $stmt = $this->cm->prepare($sql);
            $stmt->bind_param("i", $idalmacen);
            $stmt->execute();
            $stmt->bind_result($idempresa);
    
            if ($stmt->fetch()) {
                $stmt->close();
                $verificarQuery = " SELECT COUNT(*) FROM punto_venta p
                                    INNER JOIN almacen a ON p.idalmacen = a.id_almacen
                                    WHERE p.nombre= ? AND a.idempresa = ? ";
        
                $stmt = $this->cm->prepare($verificarQuery);
                if ($stmt === false) {
                    $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                    echo json_encode($res); 
                    return;
                }
            
                $stmt->bind_param("si", $nombre , $idempresa);
                $stmt->execute();
                $stmt->bind_result($count);
                $stmt->fetch();
                $stmt->close();
            
                if ($count > 0) {
                    $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Nombre duplicado por favor, inténtalo de nuevo");
                }else{
                    $registro = $this->cm->query("insert into punto_venta(idpunto_venta, nombre, descripcion, idalmacen, estadosin)value(NULL,'$nombre','$descripcion','$idalmacen','1')");
                    if ($registro !== null) {
                        $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
                    } else {
                        $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                    }
                   
                }
    
            } else {
                $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }

            
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function crarPuntoVentaFactura($datos, $sucursal, $token, $tipof, $id, $tipo)
    {
        try {
            if (!empty($datos)) {
                $respuestaPV = $this->factura->añadirPuntoVenta($datos, $sucursal, $token, $tipof);
                if ($respuestaPV->status === "success") {
                    $datosRegistro = $respuestaPV->data;
                    $registro = $this->cm->query("update punto_venta SET tipo='$tipo', estadosin='2', codigosin='$datosRegistro->codigo' where idpunto_venta='$id'");
                    if ($registro !== null) {
                        $validacion = $this->cm->fetch($this->cm->query("select codigosin from punto_venta where idpunto_venta='$id'"));
                        if ($validacion[0] == $datosRegistro->codigo) {
                            $res = array("estado" => "exito", "mensaje" => "Actualización exitosa");
                        } else {
                            $res = array("estado" => "error", "mensaje" => "EL registro no concuerda con emizor");
                        }
                    } else {
                        $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
                    }
                } else {
                    $res = $respuestaPV;
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "EL objeto esta mal configurado", "datos" => $datos);
            }
            echo  json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function anularpuntoVenta($codigosin, $sucursal, $token, $tipo, $id) {
        try {
            $respuestaPV = $this->factura->anularPuntoVenta($codigosin, $sucursal, $token, $tipo);
            $vacio = 'NULL';
            if ($respuestaPV->status == "success") {
                //$datosRegistro = $respuestaPV->data;
                $registro = $this->cm->query("update punto_venta SET estadosin='3',tipo=$vacio  where idpunto_venta='$id'");
                if ($registro !== null) {
                    $validacion = $this->cm->fetch($this->cm->query("select estadosin, codigosin from punto_venta where idpunto_venta='$id'"));
                    if ($validacion[0] == 3) {
                        $res = array("status" => "exito", "mensaje" => "Actualización exitosa", "datos" => $respuestaPV);
                    } else {
                        $res = array("status" => "error", "mensaje" => "EL registro no concuerda con emizor");
                    }
                } else {
                    $res = array("status" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
                }
            } else {
                $res = $respuestaPV;
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("status" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function eliminarPuntoVenta_($dato){
        $res="";
        $registro=$this->cm->query("delete from punto_venta where idpunto_venta='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function eliminarPuntoVenta($dato)
    {
        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de PuntoVenta no válido");
            }


            // Verificar si el producto está relacionado en otras tablas
            $relacionadas = [
                'responsable_puntoventa' => ' No se puede eliminar porque está asignado a un Responsable de Punto Venta.',
            ];

            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE idpuntoventa = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje);
                }
                $stmt->close();
            }

           

            // Eliminar el producto
            $query = "DELETE FROM punto_venta WHERE idpunto_venta=?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el producto");
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


    public function verificarIdPuntoVenta($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from punto_venta WHERE idpunto_venta = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "descripcion" => $qwe[2], "idalmacen" => $qwe[5]);
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

    public function editarPuntoVenta($id,$nombre,$descripcion){
        $res="";
        $registro=$this->cm->query("update punto_venta SET nombre='$nombre',descripcion='$descripcion' where idpunto_venta='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoPuntoVenta($id,$estado){
        $registro=$this->cm->query("update tipocliente SET estado='$estado' where idtipocliente='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo  json_encode($res);
    }

    public function listaProductos($idmd5, $token, $tipo)
    {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);

        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }

        $consulta = $this->cm->query("SELECT p.id_productos, p.nombre, p.codigo, p.descripcion, p.cod_barras, p.fecha_registro, p.imagen, p.categorias_id_categorias, COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria, COALESCE(sca.nombre, '') AS nombre_subcategoria, p.medida_id_medida, me.nombre_medida, p.estados_productos_id_estados_productos, ep.tipos_estado, p.unidad_id_unidad, un.nombre AS nombre_unidad, p.caracteristicas, p.idempresa, p.codigosin, p.actividadsin, p.unidadsin, p.codigonandina, CASE WHEN sca.id_categorias IS NOT NULL THEN TRUE ELSE FALSE END AS registrado_con_subcategoria
        FROM productos p 
        LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
        LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
        LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
        LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
        LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
        LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
        WHERE p.idempresa = '$idempresa'
        GROUP BY p.id_productos
        ORDER BY p.id_productos DESC");

        $productosinRespuesta = "";
        $unidadsinRespuesta = "";
        if ($token !== "") {
            
            $productosinRespuesta = $this->factura->listadoConfigParametricas('productossin', $token, $tipo, 2);
            $unidadsinRespuesta = $this->factura->listadoConfigParametricas('unidadsin', $token, $tipo, 2);

            if ($productosinRespuesta->status === "success" && $unidadsinRespuesta->status === "success") {
                $objetoOriginal = $productosinRespuesta->data;
                $objetoTransformadoP = [];
                foreach ($objetoOriginal as $elemento) {
                    $objetoTransformadoP[$elemento->codigo] = array(
                        "descripcion" => $elemento->descripcion,
                        "codigoActividad" => $elemento->codigoActividad
                    );
                }
                $objetoOriginalU = $unidadsinRespuesta->data;
                $objetoTransformadoU = [];
                foreach ($objetoOriginalU as $elemento) {
                    $objetoTransformadoU[$elemento->codigo] = array(
                        "descripcion" => $elemento->descripcion
                    );
                }
                // while ($qwe = $this->cm->fetch($consulta)) {
                //     $res = array("id" => $qwe[0], "nombre" => $qwe[1], "codigo" => $qwe[2], "descripcion" => $qwe[3], "codigobarras" => $qwe[4], "fecha" => $qwe[5], "imagen" => $qwe[6], "idcategoria" => $qwe[7], "categoria" => $qwe[8], "subcategoria" => $qwe[9], "idmedida" => $qwe[10], "medida" => $qwe[11], "idestadoproducto" => $qwe[12], "estadoproducto" => $qwe[13], "idunidad" => $qwe[14], "unidad" => $qwe[15], "caracteristica" => $qwe[16], "codigonandina" => $qwe[21], "productosin" => $objetoTransformadoP[$qwe[18]], "unidadsin" => $objetoTransformadoU[$qwe[20]]);
                //     if (isset($objetoTransformadoP[$qwe[18]]) && isset($objetoTransformadoU[$qwe[20]])) {
                //         $res['productosin'][] = $objetoTransformadoP[$qwe[18]];
                //         $res['unidadsin'][] = $objetoTransformadoU[$qwe[20]];
                //     } else {
                //         $res['productosin'][] = array(
                //             "descripcion" => "",
                //             "codigoActividad" => ""
                //         );
                //         $res['unidadsin'][] = array(
                //             "descripcion" => ""
                //         );
                //     }
                //     array_push($lista, $res);
                // }
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res = array(
                        "id" => $qwe[0] ?? '',
                        "nombre" => $qwe[1] ?? '',
                        "codigo" => $qwe[2] ?? '',
                        "descripcion" => $qwe[3] ?? '',
                        "codigobarras" => $qwe[4] ?? '',
                        "fecha" => $qwe[5] ?? '',
                        "imagen" => $qwe[6] ?? '',
                        "idcategoria" => $qwe[7] ?? '',
                        "categoria" => $qwe[8] ?? '',
                        "subcategoria" => $qwe[9] ?? '',
                        "idmedida" => $qwe[10] ?? '',
                        "medida" => $qwe[11] ?? '',
                        "idestadoproducto" => $qwe[12] ?? '',
                        "estadoproducto" => $qwe[13] ?? '',
                        "idunidad" => $qwe[14] ?? '',
                        "unidad" => $qwe[15] ?? '',
                        "caracteristica" => $qwe[16] ?? '',
                        "codigonandina" => $qwe[21] ?? '',
                        "productosin" => isset($qwe[18]) && isset($objetoTransformadoP[$qwe[18]]) ? $objetoTransformadoP[$qwe[18]] : [],
                        "unidadsin" => isset($qwe[20]) && isset($objetoTransformadoU[$qwe[20]]) ? $objetoTransformadoU[$qwe[20]] : []
                    );

                    // Si no están definidos, agregar valores por defecto
                    if (isset($qwe[18], $objetoTransformadoP[$qwe[18]]) && isset($qwe[20], $objetoTransformadoU[$qwe[20]])) {
                        $res['productosin'][] = $objetoTransformadoP[$qwe[18]];
                        $res['unidadsin'][] = $objetoTransformadoU[$qwe[20]];
                    } else {
                        $res['productosin'][] = array(
                            "descripcion" => "",
                            "codigoActividad" => ""
                        );
                        $res['unidadsin'][] = array(
                            "descripcion" => ""
                        );
                    }

                    $lista[] = $res;
                }

            } else {
                $res = array("estado" => "exito", "mensaje" => "Actualización exitosa");
                array_push($lista, $res);
            }
        } else {
            while ($qwe = $this->cm->fetch($consulta)) {
                $res = array("id" => $qwe[0], "nombre" => $qwe[1], "codigo" => $qwe[2], "descripcion" => $qwe[3], "codigobarras" => $qwe[4], "fecha" => $qwe[5], "imagen" => $qwe[6], "idcategoria" => $qwe[7], "categoria" => $qwe[8], "subcategoria" => $qwe[9], "idmedida" => $qwe[10], "medida" => $qwe[11], "idestadoproducto" => $qwe[12], "estadoproducto" => $qwe[13], "idunidad" => $qwe[14], "unidad" => $qwe[15], "caracteristica" => $qwe[16]);
                array_push($lista, $res);
            }
        }
        echo json_encode($lista);
    }
    

    // public function listaProductos($idmd5, $token, $tipo)
    // {
    //     ini_set('display_errors', 1);
    //     ini_set('display_startup_errors', 1);
    //     error_reporting(E_ALL);
    
    //     $lista = [];
    //     $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
    //     if ($idempresa === "false") {
    //         echo json_encode(array("error" => "El id de empresa no existe"));
    //         return;
    //     }
    
    //     $consulta = $this->cm->query("SELECT p.id_productos, p.nombre, p.codigo, p.descripcion, p.cod_barras, p.fecha_registro, p.imagen, 
    //         p.categorias_id_categorias, COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria, 
    //         COALESCE(sca.nombre, '') AS nombre_subcategoria, p.medida_id_medida, me.nombre_medida, 
    //         p.estados_productos_id_estados_productos, ep.tipos_estado, p.unidad_id_unidad, un.nombre AS nombre_unidad, 
    //         p.caracteristicas, p.idempresa, p.codigosin, p.actividadsin, p.unidadsin, p.codigonandina, 
    //         CASE WHEN sca.id_categorias IS NOT NULL THEN TRUE ELSE FALSE END AS registrado_con_subcategoria
    //         FROM productos p 
    //         LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
    //         LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
    //         LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
    //         LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
    //         LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
    //         LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
    //         WHERE p.idempresa = '$idempresa'
    //         GROUP BY p.id_productos
    //         ORDER BY p.id_productos DESC");
    
    //     if (!$consulta) {
    //         echo json_encode(array("error" => "Error en la consulta SQL"));
    //         return;
    //     }
    
    //     // Verificar si hay resultados en la consulta
    //     if ($this->cm->rows($consulta) == 0) {
    //         echo json_encode(array("error" => "No se encontraron productos"));
    //         return;
    //     }
    
    //     $productosinRespuesta = "";
    //     $unidadsinRespuesta = "";
    //     if ($token !== "") {
    //         $productosinRespuesta = json_decode($this->factura->listadoConfigParametricas('productossin', $token, $tipo, 2));
    //         $unidadsinRespuesta = json_decode($this->factura->listadoConfigParametricas('unidadsin', $token, $tipo, 2));
    
    //         // Verifica que la respuesta contenga la propiedad 'estado' (y no 'status')
    //         if (!is_object($productosinRespuesta) || !isset($productosinRespuesta->estado)) {
    //             error_log("Error en productossinRespuesta: " . json_encode($productosinRespuesta));
    //             echo json_encode(["error" => "Error en la petición de productossin: respuesta vacía o inválida"]);
    //             return;
    //         }
    
    //         if (!is_object($unidadsinRespuesta) || !isset($unidadsinRespuesta->estado)) {
    //             error_log("Error en unidadsinRespuesta: " . json_encode($unidadsinRespuesta));
    //             echo json_encode(["error" => "Error en la petición de unidadsin: respuesta vacía o inválida"]);
    //             return;
    //         }
    
    //         // Acceder a la propiedad 'estado' en lugar de 'status'
    //         if ($productosinRespuesta->estado === "exito" && $unidadsinRespuesta->estado === "exito") {
    //             // Procesar respuesta cuando todo sea exitoso
    //             $objetoOriginal = $productosinRespuesta->data;
    //             $objetoTransformadoP = [];
    //             foreach ($objetoOriginal as $elemento) {
    //                 $objetoTransformadoP[$elemento->codigo] = array(
    //                     "descripcion" => $elemento->descripcion,
    //                     "codigoActividad" => $elemento->codigoActividad
    //                 );
    //             }
    
    //             $objetoOriginalU = $unidadsinRespuesta->data;
    //             $objetoTransformadoU = [];
    //             foreach ($objetoOriginalU as $elemento) {
    //                 $objetoTransformadoU[$elemento->codigo] = array(
    //                     "descripcion" => $elemento->descripcion
    //                 );
    //             }
    
    //             // Procesar los resultados de la consulta
    //             while ($qwe = $this->cm->fetch($consulta)) {
    //                 var_dump($qwe);  // Depuración
    
    //                 $res = array(
    //                     "id" => $qwe[0],
    //                     "nombre" => $qwe[1],
    //                     "codigo" => $qwe[2],
    //                     // ...
    //                     "productosin" => $objetoTransformadoP[$qwe[18]] ?? array("descripcion" => "", "codigoActividad" => ""),
    //                     "unidadsin" => $objetoTransformadoU[$qwe[20]] ?? array("descripcion" => "")
    //                 );
    
    //                 array_push($lista, $res);
    //             }
    //         } else {
    //             // Si no es exitoso, manejar el error
    //             error_log("Error en la respuesta: " . json_encode($productosinRespuesta));
    //             $res = array("estado" => "error", "mensaje" => "Error al procesar la respuesta");
    //             array_push($lista, $res);
    //         }
    //     }
    
    //     // Responder con el resultado
    //     echo json_encode($lista);
    // }
    
    public function importar_excel_productos($file, $idmd5)
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

        $productos = []; // Guardará los productos
        $contador = 0;

        while (($data = fgetcsv($handle, 1000, ",")) !== false) {
            if ($contador == 0) { // Ignorar la primera fila (encabezados)
                $contador++;
                continue;
            }

            // Asignar datos (asegúrate de que coincidan con las columnas de tu CSV)
            $productos[] = [
                "nombre" => $data[0],
                "codigo" => $data[1],
                "descripcion" => $data[2],
                "codigobarras" => $data[3],
                "categoria" => $data[4],
                "medida" => $data[5],
                "estadoproductos" => $data[6],
                "unidad" => $data[7],
                "caracteristica" => $data[8],
                "url" => $data[9],
                "codigosin" => $data[10],
                "codigoactividad" => $data[11],
                "unidadsin" => $data[12],
                "codigoNandina" => $data[13]
            ];
            $contador++;
        }

        fclose($handle); // Cerrar archivo

        // Ahora recorremos los productos y los registramos en la base de datos
        foreach ($productos as $producto) {
            $this->registroProducto(
                $producto["nombre"],
                $producto["codigo"],
                $producto["descripcion"],
                $producto["codigobarras"],
                $producto["categoria"],
                $producto["medida"],
                $producto["estadoproductos"],
                $producto["unidad"],
                $producto["caracteristica"],
                $producto["url"],
                $producto["codigosin"],
                $producto["codigoactividad"],
                $producto["unidadsin"],
                $producto["codigoNandina"],
                $idmd5
            );
        }

        echo json_encode(["estado" => "exito", "mensaje" => "Productos importados correctamente"]);
    }

    public function registroProducto($nombre,$codigo,$descripcion,$codigobarras,$categoria,$medida,$estadoproductos,$unidad,$caracteristica,$url,$codigosin,$actividadsin,$unidadsin,$codigonandina,$idmd5){
        $fecha=date("Y-m-d");
        $res="";
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consultaCod = $this->cm->query("SELECT * FROM productos p WHERE p.idempresa = '$idempresa' AND LOWER(p.codigo) = LOWER('$codigo')");
        if ($consultaCod) {
            if ($consultaCod->num_rows > 0) {
                echo json_encode(array("estado" => "existe", "mensaje" => "El código del producto ya existe"));
                return;
            }
        }
        
        $registro=$this->cm->query("insert into productos(id_productos, nombre, codigo, descripcion, cod_barras, fecha_registro, imagen, categorias_id_categorias, medida_id_medida, estados_productos_id_estados_productos, unidad_id_unidad, caracteristicas, idempresa, codigosin, actividadsin, unidadsin, codigonandina)value(NULL,'$nombre','$codigo','$descripcion','$codigobarras','$fecha','$url','$categoria','$medida','$estadoproductos','$unidad','$caracteristica','$idempresa','$codigosin','$actividadsin','$unidadsin','$codigonandina')");
        if($registro !== null){
            $ultimoId = $this->cm->insert_id; // <-- Aquí obtienes el ID recién insertado
            $producto = [
                'idproducto' => $ultimoId,
                'idempresa' => $idempresa
            ];
            $this->registrarProducto($producto,10,100,'Bolivia');
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);

    }
    public function registrarProducto($producto, $stockMin, $stockMax, $detalle)
    {
        $configAlmacen = new configuracionProductoAlmacen();

        // Obtener el primer almacén si no se pasa uno específico
        if (!isset($producto['idalmacen'])) {
            $producto['idalmacen'] = $configAlmacen->obtenerPrimerIdAlmacenPorEmpresa($producto['idempresa']);
        }

        if ($producto['idalmacen'] === null) {
            echo json_encode(["estado" => "error", "mensaje" => "No se encontró un almacén para la empresa."]);
            return;
        }
        echo $producto;
        // Registrar el producto en el almacén
        $configAlmacen->registroProductoUnicoAlmacen($stockMin, $stockMax, $detalle, $producto);
    }
    public function eliminarProducto_($dato){
        $res="";
        $id=$this->cm->query("select p.imagen from productos p where p.id_productos='$dato'");
        while($qwe=$this->cm->fetch($id)){
            $url = $qwe[0];
        }
        $responsable=$this->cm->query("delete from productos where id_productos='$dato'");
        if($responsable===TRUE){
            unlink($url);
            $res=array("estado" => "exito", "mensaje" => "Eliminación exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }
    public function eliminarProducto($dato)
    {
        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de producto no válido");
            }

            // Verificar si el producto está relacionado en otras tablas
            $relacionadas = [
                'cambios' => 'No se puede eliminar porque hay registros en Cambios',
                'productos_almacen' => 'No se puede eliminar porque se asigno a un Almacen',
            ];

            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE productos_id_productos = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje);
                }
                $stmt->close();
            }

            // Obtener la URL de la imagen
            $query = "SELECT imagen FROM productos WHERE id_productos = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para obtener la imagen");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                $url = $row['imagen'];
            } else {
                throw new Exception("Producto no encontrado");
            }
            $stmt->close();

            // Eliminar el producto
            $query = "DELETE FROM productos WHERE id_productos = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el producto");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();

            // Confirmar transacción
            $this->cm->commit();

            // Eliminar archivo físico si existe
            if (file_exists($url)) {
                unlink($url);
            }

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdProducto($id, $token, $tipo)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT p.id_productos, p.nombre, p.codigo, p.descripcion, p.cod_barras, p.fecha_registro, p.imagen, COALESCE(ca.id_categorias, sca_padre.id_categorias) AS id_categoria, COALESCE(sca.id_categorias, '') AS id_subcategoria, p.medida_id_medida, p.estados_productos_id_estados_productos, p.unidad_id_unidad, p.caracteristicas, p.codigosin, p.actividadsin, p.unidadsin, p.codigonandina, CASE WHEN sca.id_categorias IS NOT NULL THEN TRUE ELSE FALSE END AS registrado_con_subcategoria
            FROM productos p 
            LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
            LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
            LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
            WHERE p.id_productos = '$id'
            ORDER BY p.id_productos DESC");
        $productosinRespuesta = "";
        $unidadsinRespuesta = "";
        if ($token !== "") {
            $productosinRespuesta = $this->factura->listadoConfigParametricas('productossin', $token, $tipo, 2);
            $unidadsinRespuesta = $this->factura->listadoConfigParametricas('unidadsin', $token, $tipo, 2);

            if ($productosinRespuesta->status === "success" && $unidadsinRespuesta->status === "success") {
                $objetoOriginal = $productosinRespuesta->data;
                $objetoTransformadoP = [];
                foreach ($objetoOriginal as $elemento) {
                    $objetoTransformadoP[$elemento->codigo] = array(
                        "codigo" => $elemento->codigo,
                        "descripcion" => $elemento->descripcion,
                        "codigoActividad" => $elemento->codigoActividad
                    );
                }
                $objetoOriginalU = $unidadsinRespuesta->data;
                $objetoTransformadoU = [];
                foreach ($objetoOriginalU as $elemento) {
                    $objetoTransformadoU[$elemento->codigo] = array(
                        "codigo" => $elemento->codigo,
                        "descripcion" => $elemento->descripcion
                    );
                }

                if ($consulta) {
                    if ($consulta->num_rows > 0) {
                        $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                        while ($qwe = $this->cm->fetch($consulta)) {
                            $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "codigo" => $qwe[2], "descripcion" => $qwe[3], "codbarras" => $qwe[4], "fecha" => $qwe[5], "imagen" => $qwe[6], "idcategoria" => $qwe[7], "idsubcategoria" => $qwe[8], "idmedida" => $qwe[9], "idestadoproducto" => $qwe[10], "idunidad" => $qwe[11], "caracteristica" => $qwe[12], "codigonandina" => $qwe[16], "productosin" => [], "unidadsin" => [], "tipo" => $qwe[17]);
                            if (isset($objetoTransformadoP[$qwe[13]]) && isset($objetoTransformadoU[$qwe[15]])) {
                                $res['datos']['productosin'][] = $objetoTransformadoP[$qwe[13]];
                                $res['datos']['unidadsin'][] = $objetoTransformadoU[$qwe[15]];
                            } else {
                                $res['datos']['productosin'][] = array(
                                    "codigo" => "",
                                    "descripcion" => "",
                                    "codigoActividad" => ""
                                );
                                $res['datos']['unidadsin'][] = array(
                                    "codigo" => "",
                                    "descripcion" => ""
                                );
                            }
                        }
                    } else {
                        $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                    }
                } else {
                    $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "Los datos de emizor fallaron");
            }
        } else {

            if ($consulta) {
                if ($consulta->num_rows > 0) {
                    $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                    while ($qwe = $this->cm->fetch($consulta)) {
                        $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "codigo" => $qwe[2], "descripcion" => $qwe[3], "codbarras" => $qwe[4], "fecha" => $qwe[5], "imagen" => $qwe[6], "idcategoria" => $qwe[7], "idsubcategoria" => $qwe[8], "idmedida" => $qwe[9], "idestadoproducto" => $qwe[10], "idunidad" => $qwe[11], "caracteristica" => $qwe[12], "codigosin" => $qwe[13], "actividadsin" => $qwe[14], "unidadsin" => $qwe[15], "codigonandina" => $qwe[16], "tipo" => $qwe[17]);
                    }
                } else {
                    $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            }
        }
        echo json_encode($res);
    
    }

    public function editarProducto($idproducto,$nombre,$codigo,$descripcion,$codigobarras,$categoria,$medida,$estadoproductos,$unidad,$caracteristica,$url,$codigosin,$actividadsin,$unidadsin,$codigonandina){
        $registro = false;
        $res = [];

        /*if (empty($codigosin) && empty($actividadsin) && empty($unidadsin)) {
            if (empty($url)) {
                $registro=$this->cm->query("update productos SET nombre='$nombre',codigo='$codigo',descripcion='$descripcion',cod_barras='$codigobarras',categorias_id_categorias='$categoria',medida_id_medida='$medida',estados_productos_id_estados_productos='$estadoproductos',unidad_id_unidad='$unidad',caracteristicas='$caracteristica' where id_productos='$idproducto'");
            } else {
                $id = $this->cm->query("select p.imagen from productos p where p.id_productos='$idproducto'");
                while ($qwe = $this->cm->fetch($id)) {
                    $link = $qwe[0];
                }
                unlink($link);
                $registro=$this->cm->query("update productos SET nombre='$nombre',codigo='$codigo',descripcion='$descripcion',cod_barras='$codigobarras',imagen='$url',categorias_id_categorias='$categoria',medida_id_medida='$medida',estados_productos_id_estados_productos='$estadoproductos',unidad_id_unidad='$unidad',caracteristicas='$caracteristica' where id_productos='$idproducto'");
            }
            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
        } elseif (!empty($codigosin) && !empty($actividadsin) && !empty($unidadsin)) {
            
        }*/
        if (empty($url)) {
            $registro=$this->cm->query("update productos SET nombre='$nombre',codigo='$codigo',descripcion='$descripcion',cod_barras='$codigobarras',categorias_id_categorias='$categoria',medida_id_medida='$medida',estados_productos_id_estados_productos='$estadoproductos',unidad_id_unidad='$unidad',caracteristicas='$caracteristica', codigosin='$codigosin', actividadsin='$actividadsin', unidadsin='$unidadsin', codigonandina='$codigonandina' where id_productos='$idproducto'");
        } else {
            $id = $this->cm->query("select p.imagen from productos p where p.id_productos='$idproducto'");
            while ($qwe = $this->cm->fetch($id)) {
                $link = $qwe[0];
            }
            unlink($link);
            $registro=$this->cm->query("update productos SET nombre='$nombre',codigo='$codigo',descripcion='$descripcion',cod_barras='$codigobarras',imagen='$url',categorias_id_categorias='$categoria',medida_id_medida='$medida',estados_productos_id_estados_productos='$estadoproductos',unidad_id_unidad='$unidad',caracteristicas='$caracteristica', codigosin='$codigosin', actividadsin='$actividadsin', unidadsin='$unidadsin', codigonandina='$codigonandina' where id_productos='$idproducto'");
        }
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa", "datos" => array("codigosin" => $codigosin, "actividadsin" => $actividadsin, "unidad" => $unidadsin));
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function listarProductoAlmacen($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $res = "";
        $provee = $this->cm->query("SELECT
        pa.id_productos_almacen,
        al.nombre AS nombre_almacen,
        p.codigo,
        p.cod_barras,
        p.nombre AS nombre_producto,
        p.descripcion,
        pa.pais,
        u.nombre AS nombre_unidad,
        p.caracteristicas,
        pa.stock_minimo,
        s.cantidad AS ultima_cantidad_stock,
        pa.fecha_registro,
        al.id_almacen,
        pa.estado,
        m.nombre_medida,
        pa.productos_id_productos,
        ep.tipos_estado,
        pa.stock_maximo,
        p.imagen,
        s.id_stock,
        COALESCE(
            ca.id_categorias,
            sca_padre.id_categorias
        ) AS id_categoria,
        COALESCE(sca.id_categorias, '') AS id_subcategoria,
        COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
        COALESCE(sca.nombre, '') AS nombre_subcategoria
    FROM
        productos_almacen AS pa
    LEFT JOIN almacen AS al
    ON
        pa.almacen_id_almacen = al.id_almacen
    LEFT JOIN productos AS p
    ON
        pa.productos_id_productos = p.id_productos
    LEFT JOIN unidad AS u
    ON
        u.id_unidad = p.unidad_id_unidad
    LEFT JOIN medida AS m
    ON
        m.id_medida = p.medida_id_medida
    LEFT JOIN categorias sca ON
        p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0 AND sca.id_empresa = '$idempresa'
    LEFT JOIN categorias sca_padre ON
        sca.idp = sca_padre.id_categorias
    LEFT JOIN categorias ca ON
        p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0 AND ca.id_empresa = '$idempresa'
    LEFT JOIN estados_productos AS ep
    ON
        p.estados_productos_id_estados_productos = ep.id_estados_productos
    LEFT JOIN(
        SELECT id_stock,
            productos_almacen_id_productos_almacen,
            cantidad,
            ROW_NUMBER() OVER(
            PARTITION BY productos_almacen_id_productos_almacen
        ORDER BY
            id_stock
        DESC
        ) AS rn
    FROM
        stock
    WHERE
        estado = '1') AS s
        ON
            pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1
        WHERE
            p.idempresa = '$idempresa'
        ORDER BY
            pa.id_productos_almacen
        DESC
            ");
        while ($qwe = $this->cm->fetch($provee)) {
            $res = array("id"=>$qwe[0],"almacen"=>$qwe[1],"codigo"=>$qwe[2],"codigobarra"=>$qwe[3],"producto"=>$qwe[4],"descripcion"=>$qwe[5],"detalle"=>$qwe[6],"unidad"=>$qwe[7],"caracteristica"=>$qwe[8],"stockminimo"=>$qwe[9],"stock"=>$qwe[10],"fecha"=>$qwe[11],"idalmacen"=>$qwe[12],"estado"=>$qwe[13],"medida"=>$qwe[14],"idproducto"=>$qwe[15],"estadoproducto"=>$qwe[16], "stockmaximo" => $qwe[17], "imagen" => $qwe[18], "idstock" => $qwe[19], "idcategoria" => $qwe[20], "idsubcategoria" => $qwe[21], "categoria" => $qwe[22], "subcategoria" => $qwe[23]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function productosfaltantes($idalmacen, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $prod = $this->cm->query("select p.id_productos,p.nombre,p.codigo,p.descripcion,p.cod_barras,p.imagen,m.nombre_medida,ep.tipos_estado,u.nombre,p.caracteristicas,p.fecha_registro,p.medida_id_medida,p.estados_productos_id_estados_productos,p.unidad_id_unidad,p.idempresa,
        COALESCE(
                    ca.id_categorias,
                    sca_padre.id_categorias
                ) AS id_categoria,
                COALESCE(sca.id_categorias, '') AS id_subcategoria,
                COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
                COALESCE(sca.nombre, '') AS nombre_subcategoria
        from productos p
        LEFT JOIN categorias sca ON
                p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0 AND sca.id_empresa = '$idempresa'
            LEFT JOIN categorias sca_padre ON
                sca.idp = sca_padre.id_categorias
            LEFT JOIN categorias ca ON
                p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0 AND ca.id_empresa = '$idempresa' 
        LEFT JOIN medida m ON p.medida_id_medida=m.id_medida
        LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos=ep.id_estados_productos
        LEFT JOIN unidad u ON p.unidad_id_unidad=u.id_unidad
        where p.idempresa='$idempresa' and p.id_productos not in (select pa1.productos_id_productos from productos_almacen pa1 where pa1.almacen_id_almacen = '$idalmacen')
        order by id_productos DESC");
        while ($qwe = $this->cm->fetch($prod)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "codigo" => $qwe[2], "descripcion" => $qwe[3], "codigobarras" => $qwe[4], "imagen" => $qwe[5], "medida" => $qwe[6], "estado" => $qwe[7], "unidad" => $qwe[8], "caracteristica" => $qwe[9], "fecha" => $qwe[10], "idmedida" => $qwe[11], "idestadosproductos" => $qwe[12], "idunidad" => $qwe[13], "idempresa" => $qwe[14], "idcategoria" => $qwe[15], "idsubcategoria" => $qwe[16], "categoria" => $qwe[17], "subcategoria" => $qwe[18]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroProductoAlmacen($stockmin,$stockmax,$detalle,$productos)
    {
        /*$idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $res = "";
        $registro = $this->cm->query("insert into proveedor(id_proveedor,nombre,codigo,nit,detalle,direccion,telefono,mobil,email,web,pais,ciudad,zona,contacto,id_empresa)value(NULL,'$nombre','$codigo','$nit','$detalle','$direccion','$telefono','$mobil','$email','$web','$pais','$ciudad','$zona','$contacto','$idempresa')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);*/
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d");
        $res = "";
        $almacenID = "";
        $cantidadElementos = count($productos);
        // Comenzar una transacción
        $this->cm->beginTransaction();  // Utilizamos la función personalizada

        if (!empty($productos)) {
            // Insertar las asociaciones con almacenes
            foreach ($productos as $producto) {
                if (isset($producto['idproducto']) && isset($producto['idalmacen'])) {
                    $idproducto = $producto['idproducto'];
                    $idalmacen = $producto['idalmacen'];
                    $almacenID = $idalmacen;
                    $registro = $this->cm->query("insert into productos_almacen(id_productos_almacen, fecha_registro, estado, stock_minimo, stock_maximo, pais, almacen_id_almacen, productos_id_productos)value(NULL,'$fecha','1','$stockmin','$stockmax','$detalle','$idalmacen','$idproducto')");
                    if ($registro !== false) {
                        // Obtener el último ID insertado
                        $ultimoIdInsertado = $this->cm->insert_id;
                        $registrostock=$this->cm->query("insert into stock(id_stock,cantidad,fecha,codigo,estado,productos_almacen_id_productos_almacen)value(NULL,'0','$fecha','NUE','1','$ultimoIdInsertado') ");
                        $registrostock=$this->cm->query("insert into precio_base(id_precio_base,precio,fecha,estado,productos_almacen_id_productos_almacen)value(NULL,'0','$fecha','1','$ultimoIdInsertado') ");
                        $categoriafil = $this->cm->query("select p.id_porcentajes, p.tipo, p.porcentaje from porcentajes p where p.almacen_id_almacen='$idalmacen'");
                        if($categoriafil && $categoriafil->num_rows > 0){
                            while($xcv = $this->cm->fetch($categoriafil)){
                                $idporcentaje = $xcv[0];
                                $this->cm->query("insert into precio_sugerido (id_precio_sugerido,precio,productos_almacen_id_productos_almacen,porcentajes_id_porcentajes) values(null,'0','$ultimoIdInsertado','$idporcentaje')");
                            }
                        }
                        if ($registrostock === false) {
                            $this->cm->rollbackTransaction();
                        }
                    }
                } else {
                    // Se encontró un problema con el objeto de almacenes
                    throw new Exception("No se pudo registrar los almacenes");
                }
            }
        } else {
            // El objeto de almacenes está vacío
            throw new Exception("El objeto de almacenes está vacío");
        }

        // Confirmar la transacción utilizando tu función personalizada
        $this->cm->commitTransaction();

        $res = array("estado" => "exito", "mensaje" => "Registro exitoso", "almacen" => $almacenID);
        echo json_encode($res);
    }

    public function verificarIdProductoAlmacen($id)
    {
        $res = "";

        $consulta = $this->cm->query("select * from productos_almacen where id_productos_almacen = '$id'");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "stockmin" => $qwe[3], "stockmax" => $qwe[4], "detalle" => $qwe[5]);
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

    public function editarProductoAlmacen($id, $detalle, $stockmin, $stockmax)
    {
        $res = "";
        $registro = $this->cm->query("update productos_almacen SET stock_minimo='$stockmin',stock_maximo='$stockmax',pais='$detalle' where id_productos_almacen='$id'");
        if ($registro !== null) {
            $alma = $this->cm->fetch($this->cm->query("select * from productos_almacen where id_productos_almacen='$id'"));
            $almacenID = $alma[6];
            $res = array("estado" => "exito", "mensaje" => "Actualizacion exitosa", "almacen" => $almacenID);
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarEstadoProductoAlmacen($id, $estado)
    {
        $res = "";
        $registro = $this->cm->query("update productos_almacen SET estado='$estado' where id_productos_almacen='$id'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminarProductoAlmacen($dato)
    {
        $res = "";
        $registro = $this->cm->query("delete from productos_almacen where id_productos_almacen='$dato'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Eliminado exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function listaMovimiento($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT mo.id_movimiento, mo.fecha_movimiento, mo.almacen_id_almacen, ao.nombre, mo.almacen_destino, ad.nombre, mo.descripcion, mo.autorizacion, mo.codigo, mo.usuario FROM movimiento mo
        LEFT JOIN almacen ao on mo.almacen_id_almacen=ao.id_almacen
        LEFT JOIN almacen ad on mo.almacen_destino=ad.id_almacen
        WHERE ao.idempresa='$idempresa'
        ORDER BY mo.id_movimiento DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "idalmacenorigen" => $qwe[2], "almacenorigen" => $qwe[3], "idalmacendestino" => $qwe[4], "almacendestino" => $qwe[5], "descripcion" => $qwe[6], "autorizacion" => $qwe[7], "codigo" => $qwe[8], "idusuario" => $qwe[9]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function productosdisponibles($idmov, $idorigen, $iddestino) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT pa1.id_productos_almacen, s1.cantidad, s1.id_stock, 
        pa2.id_productos_almacen, s2.cantidad, s2.id_stock, 
        pa1.productos_id_productos, p.descripcion, p.codigo 
        FROM productos_almacen pa1
        LEFT JOIN productos_almacen pa2 
            ON pa1.productos_id_productos = pa2.productos_id_productos 
            AND pa1.almacen_id_almacen = '$idorigen' 
            AND pa2.almacen_id_almacen = '$iddestino'
        LEFT JOIN productos p 
            ON pa1.productos_id_productos = p.id_productos 
            AND pa2.productos_id_productos = p.id_productos
        LEFT JOIN stock s1 
            ON pa1.id_productos_almacen = s1.productos_almacen_id_productos_almacen 
            AND s1.id_stock = (
                SELECT MAX(s1_inner.id_stock)
                FROM stock s1_inner
                WHERE s1_inner.productos_almacen_id_productos_almacen = pa1.id_productos_almacen 
                AND s1_inner.estado = 1
            )
        LEFT JOIN stock s2 
            ON pa2.id_productos_almacen = s2.productos_almacen_id_productos_almacen 
            AND s2.id_stock = (
                SELECT MAX(s2_inner.id_stock)
                FROM stock s2_inner
                WHERE s2_inner.productos_almacen_id_productos_almacen = pa2.id_productos_almacen 
                AND s2_inner.estado = 1
            )
        WHERE s1.estado = 1 
        AND s2.estado = 1 
        AND NOT EXISTS (
            SELECT 1
            FROM detalle_movimiento dm
            WHERE pa1.id_productos_almacen = dm.productos_almacen_id_productos_almacen 
            AND dm.movimiento_id_movimiento = '$idmov'
        );
        ");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("idproductoalmaceno" => $qwe[0], "stocko" => $qwe[1], "idstocko" => $qwe[2], "idproductoalmacend" => $qwe[3], "stockd" => $qwe[4], "idstockd" => $qwe[5], "idproducto" => $qwe[6], "descripcion" => $qwe[7], "codigo" => $qwe[8]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroMovimiento($fecha,$almacendestino,$descripcion,$almacenorigen,$idmd5){
        $res="";
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $registro=$this->cm->query("insert into movimiento(id_movimiento,fecha_movimiento,almacen_destino,autorizacion,descripcion,codigo,almacen_id_almacen,usuario)value(NULL,'$fecha','$almacendestino','2','$descripcion','0','$almacenorigen','$idusuario')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacenorigen" => $almacenorigen);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarMovimiento($dato){
        $res="";
        $registro=$this->cm->query("delete from movimiento where id_movimiento='$dato'");
        if($registro !== null){
            $registro=$this->cm->query("delete from detalle_movimiento where movimiento_id_movimiento='$dato'");
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdMovimiento($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from movimiento WHERE id_movimiento = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "almacendestino" => $qwe[2], "descripcion" => $qwe[4], "almacenorigen" => $qwe[6]);
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

    public function editarMovimiento($id, $fecha, $almacendestino, $descripcion, $almacenorigen)
    {
        $res = "";
        $registro = $this->cm->query("update movimiento SET fecha_movimiento='$fecha',almacen_destino='$almacendestino',descripcion='$descripcion',almacen_id_almacen='$almacenorigen' where id_movimiento='$id'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacenorigen" => $almacenorigen);
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarRepetidosyDiferentes($idmovimiento, $idalmacenorigen, $idalmacendestino) {
        $primeraVerificacion = $this->cm->query("SELECT dm.id_detalle_movimiento, dm.cantidad, p.nombre, p.descripcion, dm.productos_almacen_id_productos_almacen, pa.almacen_id_almacen FROM detalle_movimiento dm
        LEFT JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        WHERE dm.movimiento_id_movimiento = '$idmovimiento'");
        if ($primeraVerificacion && $primeraVerificacion->num_rows > 0) {
            $productosAlmacenArray = [];
            $repetidos = [];
            $diferenteAlmacen = [];
            $resultado = array("estado" => "exito", "almacenOrigen" => $idalmacenorigen, "mensaje" => "ID encontrado");
            while($row = $this->cm->fetch($primeraVerificacion)) {
                if($row[5] != $idalmacenorigen) {
                    $a = array("id" => $row[0], "nombre" => $row[2], "descripcion" => $row[3], "almacen" => $row[5]);
                    array_push($diferenteAlmacen, $a);
                } 

                if (isset($productosAlmacenArray[$row[4]])) {
                    // Producto repetido, agregar a la lista de errores
                    $b = array('nombre' => $row[2], 'descripcion' => $row[3], "almacen" => $row[5]);
                    array_push($repetidos, $b);
                } else {
                    // Agregar a la lista de productos verificados
                    $productosAlmacenArray[$row[4]] = true;
                }
            }
            $resultado['datos'] = array("repetidos" => $repetidos, "diferentes" => $diferenteAlmacen, "lista" => $productosAlmacenArray);
            return $resultado;
        }
    }

    public function verificarStocks($idmovimiento, $idalmacenorigen, $idalmacendestino) {
        $stockFaltante = [];
        $almacenorigen = [];
        $almacendestino = [];
        $productosFaltantes = [];
        $resultado = array("estado" => "exito", "codigo" => "", "mensaje" => "");
        $primeraVerificacion = $this->cm->query("SELECT dm.id_detalle_movimiento, dm.cantidad, s.cantidad, dm.movimiento_id_movimiento, dm.productos_almacen_id_productos_almacen, pa.productos_id_productos, s.id_stock, p.nombre, p.codigo, p.descripcion FROM detalle_movimiento dm
        LEFT JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock s ON dm.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE dm.movimiento_id_movimiento = '$idmovimiento' AND s.estado = 1");
        if ($primeraVerificacion && $primeraVerificacion->num_rows > 0) {
            while($row = $this->cm->fetch($primeraVerificacion)) {
                if($row[1]> $row[2]){
                    $a = array("id" => $row[0], "cantidad" => $row[1], "stock" => $row[2], "idmovimiento" => $row[3], "idproductoalmacen" => $row[4], "idproducto" => $row[5], "idstock" => $row[6], "nombre" => $row[7], "codigo" => $row[8], "descripcion" => $row[9]);
                    array_push($stockFaltante, $a);
                }

                $segundaVerificacion = $this->cm->query("SELECT pa.id_productos_almacen, s.cantidad, pa.productos_id_productos, s.id_stock, p.nombre, p.codigo, p.descripcion FROM productos_almacen pa 
                LEFT JOIN stock s ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen
                LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
                WHERE pa.almacen_id_almacen='$idalmacendestino' AND s.estado=1 AND pa.productos_id_productos='$row[5]' 
                ORDER BY s.id_stock DESC                
                LIMIT 1");
                if ($segundaVerificacion && $segundaVerificacion->num_rows > 0) {
                    $row1 = $this->cm->fetch($segundaVerificacion);
                    $b = array("idproductoalmacendestino" => $row1[0], "stock" => $row1[1], "idproducto" => $row1[2], "idstock" => $row1[3], "nombre" => $row1[4], "codigo" => $row1[5], "descripcion" => $row1[6]);
                    $c = array("idproductoalmacenorigen" => $row[4], "cantidad" => $row[1], "stock" => $row[2], "idproducto" => $row[5], "idstock" => $row[6], "nombre" => $row[7], "codigo" => $row[8], "descripcion" => $row[9]);
                    array_push($almacenorigen, $c);
                    array_push($almacendestino, $b);
                } else {
                    $d = array("idproductoalmacenorigen" => $row[4], "stock" => $row[2], "idproducto" => $row[5], "idstock" => $row[6], "nombre" => $row[7], "codigo" => $row[8], "descripcion" => $row[9]);
                    array_push($productosFaltantes, $d);
                }
            }
            $resultado['estado'] = "exito";
            $resultado['codigo'] = 100;
            $resultado['mensaje'] = "El movimiento no tiene productos cargados";
            $resultado['datos'] = array("almacenorigen" => $almacenorigen, "almacendestino" => $almacendestino, "productosfaltantes" => $productosFaltantes, "stockfaltante" => $stockFaltante);
            return $resultado;
        } else {
            $resultado['estado'] = "error";
            $resultado['codigo'] = 99;
            $resultado['mensaje'] = "El movimiento no tiene productos cargados";
            return $resultado;
        }
    }

    public function cambiarestadoMovimiento($idmovimiento, $estado, $idalmacenorigen, $idalmacendestino)
    {
        ob_clean(); // Limpia cualquier salida previa (muy importante)
        header('Content-Type: application/json; charset=UTF-8');

        date_default_timezone_set('America/La_Paz');
        $res = "";
        $res1 = "";
        $fecha = date("Y-m-d");
        $mensaje = "";
        $lista = [];
        $c = 0;
        $c1 = 0;
        $almacenorigen = "";
        $almacendestino = "";
        $increase = "MOV1";
        $decrease = "MOV2";

        $repetidosydiferentes = $this->verificarRepetidosyDiferentes($idmovimiento, $idalmacenorigen, $idalmacendestino);

        if (empty($repetidosydiferentes['datos']['repetidos']) && empty($repetidosydiferentes['datos']['diferentes'])) {
            $stocks = $this->verificarStocks($idmovimiento, $idalmacenorigen, $idalmacendestino);
            //echo json_encode($stocks);
            if (!isset($stocks['datos']['almacenorigen']) || !is_array($stocks['datos']['almacenorigen'])) {
                echo json_encode([
                    "estado" => "error",
                    "codigo" => 96,
                    "mensaje" => "Respuesta inesperada de verificarStocks: datos['almacenorigen'] no disponible",
                    "debug" => $stocks // Esto ayuda a depurar el contenido recibido
                ]);
                exit;
            }

            if(empty($stocks['datos']['productosfaltantes']) && empty($stocks['datos']['stockfaltante'])) {
                // Comenzar una transacción
                $this->cm->beginTransaction();  // Utilizamos la función personalizada
                foreach ($stocks['datos']['almacenorigen'] as $origen) {
                    $idProductoOrigen = $origen['idproducto'];
                    $idstockorigen = $origen['idstock'];
                    $cantidadorigen = $origen['cantidad'];
                    $stockorigen = $origen['stock'];
                    $idproductoalmacenorigen = $origen['idproductoalmacenorigen'];
                    $descripcionorigen = $origen['descripcion'];
                    $nuevostockorigen = $stockorigen - $cantidadorigen;
                    $encontrado = false;
                
                    foreach ($stocks['datos']['almacendestino'] as $destino) {
                        if ($destino['idproducto'] == $idProductoOrigen) {
                            $idstockdestino = $destino['idstock'];
                            $stockdestino = $destino['stock'];
                            $idproductoalmacendestino = $destino['idproductoalmacendestino'];
                            $descripciondestino = $destino['descripcion'];
                            $nuevostockdestino = $cantidadorigen + $stockdestino;
                
                            // Restar stock en almacén origen json_encode
                            $consulta1 = $this->cm->query("update stock set estado=2 where id_stock='$idstockorigen'");
                            if ($consulta1 && $this->cm->affected_rows > 0) {
                                // Insertar el nuevo stock en el almacén origen
                                $consulta2 = $this->cm->query("insert into stock(id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) values(null,'$nuevostockorigen','$fecha','$decrease',1,'$idproductoalmacenorigen')");
                                $ultimoIDorigen = $this->cm->insert_id;
                
                                if ($consulta2 && $ultimoIDorigen) {
                                    // Restar stock en almacén destino
                                    $consulta3 = $this->cm->query("update stock set estado=2 where id_stock='$idstockdestino'");
                                    if ($consulta3 && $this->cm->affected_rows > 0) {
                                        // Insertar el nuevo stock en el almacén destino
                                        $consulta4 = $this->cm->query("insert into stock(id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) values(null,'$nuevostockdestino','$fecha','$increase',1,'$idproductoalmacendestino')");
                                        $ultimoIDdestino = $this->cm->insert_id;
                
                                        if ($consulta4 && $ultimoIDdestino) {
                                            $c++;
                                        } else {
                                            $mensaje = "No se pudo incrementar el nuevo stock en el almacén destino";
                                            $encontrado = true;
                                        }
                                    } else {
                                        $mensaje = "No se pudo restar el stock de un producto en el almacén destino";
                                        $encontrado = true;
                                    }
                                } else {
                                    $mensaje = "No se pudo incrementar el nuevo stock en el almacén origen";
                                    $encontrado = true;
                                }
                            } else {
                                $mensaje = array("mensaje" => "No se pudo restar el stock de un producto en el almacén origen", "id" => $idstockorigen, "descripcion" => $descripcionorigen, "nuevostock" => $nuevostockorigen, "stockorigen" => $stockorigen, "cantidadorigen" => $cantidadorigen);
                                $encontrado = true;
                            }
                
                            if ($encontrado) {
                                break; // Salir del bucle una vez encontrado un error
                            }
                        }
                    }
                
                    // Si se detecta un error, detener el proceso y revertir la transacción
                    if ($encontrado) {
                        $this->cm->rollbackTransaction();
                        echo json_encode(array("estado" => "error", "mensaje" => $mensaje));
                        exit;
                        return;
                    }
                }
                
                // Si todo salió bien, confirmar la transacción
                $this->cm->commitTransaction();
                $registro = $this->cm->query("update movimiento SET autorizacion='$estado' where id_movimiento='$idmovimiento'");
                
                if ($registro && $this->cm->affected_rows > 0) {
                    $mensaje = "El movimiento se realizó con éxito";
                    echo json_encode(array("estado" => "exito", "codigo" => 100, "mensaje" => $mensaje, "conteo" => $c));
                    exit;
                }else {
                    echo json_encode(array(
                        "estado" => "error",
                        "codigo" => 97,
                        "mensaje" => "El movimiento no se actualizó (puede que ya esté en el estado deseado o no haya afectado filas)"
                    ));
                    exit;
                }
                
                
            } else {
                $res = array("mensaje" => "Los siguientes productos no existen en el almacen destino", "productos" => $stocks['datos']['productosfaltantes']);
                $res1 = array("mensaje" => "Los siguientes productos no tienen el stock suficiente", "productos" => $stocks['datos']['stockfaltante']);
                echo json_encode(array("estado" => "error", "codigo" => 98,"productosfaltantes" => $res, "stockfaltante" => $res1));
                exit;
            }
        } else {
            $res = array("mensaje" => "Los siguientes productos estan repetidos", "productos" => $repetidosydiferentes['datos']['repetidos']);
            $res1 = array("mensaje" => "Los siguientes productos no pertenecen al almacen origen", "productos" => $repetidosydiferentes['datos']['diferentes']);
            echo json_encode(array("estado" => "error", "codigo" => 99,"repetidos" => $res, "diferentes" => $res1));
            exit;

        }
        

    }

    /*public function actualizarStock($idStock, $nuevaCantidad, $estado, $idProductosAlmacen) {
        $fecha = date("Y-m-d");

        // Aquí realizas la actualización de stock en una única consulta
        $query = "UPDATE stock SET estado = 2 WHERE id_stock = '$idStock';
                  INSERT INTO stock (id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen)
                  VALUES (null, '$nuevaCantidad', '$fecha', '$estado', 1, '$idProductosAlmacen')";
        $result = $this->cm->query($query);

        return $result !== FALSE; // Devuelve true si la consulta fue exitosa, false si hubo un error
    }

    public function cambiarestadoMovimiento($idmovimiento, $estado) {
        $res = "";
        $fecha = date("Y-m-d");
        $lista = [];
        $almacenorigen = "";
        $almacendestino = "";
        $increase = "MOV1";
        $decrease = "MOV2";

        $this->cm->beginTransaction(); // Inicia la transacción

        $almacenes = $this->cm->query("SELECT almacen_id_almacen, almacen_destino FROM movimiento WHERE id_movimiento='$idmovimiento'");
        $idalmacenes = $this->cm->fetch($almacenes);
        $almacenorigen = $idalmacenes[0];
        $almacendestino = $idalmacenes[1];

        try {
            $c = 0;

            $aumentar = $this->cm->query("SELECT s.id_stock, s.cantidad, pa.id_productos_almacen, pa.productos_id_productos FROM productos_almacen pa
                INNER JOIN stock s ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen
                WHERE s.estado=1 AND pa.almacen_id_almacen='$almacendestino' AND pa.productos_id_productos IN (SELECT pa.productos_id_productos FROM detalle_movimiento dm
                INNER JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                INNER JOIN stock s ON dm.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
                WHERE dm.movimiento_id_movimiento='$idmovimiento' AND s.estado=1)");
            
            while ($sum = $this->cm->fetch($aumentar)) {
                if ($lista[$c]['idpro'] == $sum[3]) {
                    $nue = $lista[$c]['can'] + $sum[1];
                    $stockUpdateResult = $this->actualizarStock($sum[0], $nue, $increase, $sum[2]);

                    if (!$stockUpdateResult) {
                        throw new Exception("Error en la actualización de stock");
                    }
                }
                $c++;
            }

            $disminuir = $this->cm->query("SELECT s.id_stock, s.cantidad, dm.productos_almacen_id_productos_almacen, pa.productos_id_productos FROM detalle_movimiento dm
                INNER JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                INNER JOIN stock s ON dm.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
                WHERE dm.movimiento_id_movimiento='$idmovimiento' AND s.estado=1");

            $c1 = 0;

            while ($rest = $this->cm->fetch($disminuir)) {
                if ($lista[$c1]['idpro'] == $rest[3]) {
                    $nue = $rest[1] - $lista[$c1]['can'];
                    $stockUpdateResult = $this->actualizarStock($rest[0], $nue, $decrease, $rest[2]);

                    if (!$stockUpdateResult) {
                        throw new Exception("Error en la actualización de stock");
                    }
                }
                $c1++;
            }

            $this->cm->commitTransaction(); // Confirma la transacción

            $registro = $this->cm->query("UPDATE movimiento SET autorizacion='$estado' WHERE id_movimiento='$idmovimiento'");

            if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
            }else{
                $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }

            echo json_encode($res);
        } catch (Exception $e) {
            $this->cm->rollbackTransaction(); // Revierte la transacción en caso de error
            echo json_encode(array("danger", "Error en la transacción: " . $e->getMessage()));
        }
    }*/

    public function comprobanteMovimiento($id, $idmd5) {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa='$idempresa'");

        $usuarioInfo = [];
        while ($usuario = $this->rh->fetch($usuarios)) {
            $usuarioInfo[$usuario[0]] = array(
                "idusuario" => $usuario[0],
                "usuario" => $usuario[1],
                "cargo" => $usuario[2]
            );
        }


        $consulta = $this->cm->query("SELECT mo.id_movimiento, mo.fecha_movimiento, mo.almacen_id_almacen, ao.nombre, mo.almacen_destino, ad.nombre, mo.descripcion, mo.autorizacion, mo.codigo, mo.usuario FROM movimiento mo
        LEFT JOIN almacen ao on mo.almacen_id_almacen=ao.id_almacen
        LEFT JOIN almacen ad on mo.almacen_destino=ad.id_almacen
        WHERE mo.id_movimiento = '$id'");
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => 200, "datos" => array());
                $qwe = $this->cm->fetch($consulta);
                $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "idalmacenorigen" => $qwe[2], "almacenorigen" => $qwe[3], "idalmacendestino" => $qwe[4], "almacendestino" => $qwe[5], "descripcion" => $qwe[6], "autorizacion" => $qwe[7], "codigo" => $qwe[8], "idusuario" => $qwe[9], "detalle" => [], "usuario" => array($usuarioInfo[$qwe[9]]));

                $detalle = $this->cm->query("SELECT dm.id_detalle_movimiento, dm.cantidad, dm.movimiento_id_movimiento, dm.productos_almacen_id_productos_almacen, p.codigo, p.descripcion FROM detalle_movimiento dm 
                LEFT JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
                WHERE dm.movimiento_id_movimiento = '$id'
                ORDER BY dm.id_detalle_movimiento DESC");
                while ($qwe = $this->cm->fetch($detalle)) {
                    $dato = array("id" => $qwe[0], "cantidad" => $qwe[1], "idmovimiento" => $qwe[2], "idproductoalmacen" => $qwe[3], "codigo" => $qwe[4], "descripcion" => $qwe[5]);
                    array_push($res['datos']['detalle'], $dato);
                }
            } else {
                $res = array("estado" => 0, "mensaje" => "El movimiento no se encontro");
            }
        }
        echo json_encode($res);
    }

    public function comprobantePedido($id, $idmd5)
    {
        try {
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            if ($idempresa === "false") {
                echo json_encode(array("error" => "El id de empresa no existe"));
                return;
            }
            $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa='$idempresa'");

            $usuarioInfo = [];
            while ($usuario = $this->rh->fetch($usuarios)) {
                $usuarioInfo[$usuario[0]] = array(
                    "idusuario" => $usuario[0],
                    "usuario" => $usuario[1],
                    "cargo" => $usuario[2]
                );
            }


            $consulta = $this->cm->query("SELECT pe.id_pedidos, pe.fecha_pedido, pe.observacion, pe.codigo, pe.almacen_id_almacen, ad.nombre, pe.almacen_origen, ao.nombre, pe.estado, pe.tipopedido, pe.usuario, pe.nropedido FROM pedidos pe
        LEFT JOIN almacen ao on pe.almacen_origen=ao.id_almacen
        LEFT JOIN almacen ad on pe.almacen_id_almacen=ad.id_almacen
        WHERE pe.id_pedidos = '$id'");
            if ($consulta) {
                if ($consulta->num_rows > 0) {
                    $res = array("estado" => 200, "datos" => array());
                    $qwe = $this->cm->fetch($consulta);
                    $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "observacion" => $qwe[2], "codigo" => $qwe[3], "idalmacendestino" => $qwe[4], "almacendestino" => $qwe[5], "idalmacenorigen" => $qwe[6], "almacenorigen" => $qwe[7], "estado" => $qwe[8], "tipopedido" => $qwe[9], "nropedido" => $qwe[11], "usuario" => isset($usuarioInfo[$qwe[10]]) ? array($usuarioInfo[$qwe[10]]) : array("no existe"), "detalle" => []);

                    $detalle = $this->cm->query("SELECT dp.id_detalle_pedido, dp.cantidad, dp.observacion, dp.pedidos_id_pedidos, dp.productos_almacen_id_productos_almacen, p.codigo, p.descripcion FROM detalles_pedidos dp 
                LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
                WHERE dp.pedidos_id_pedidos = '$id'
                ORDER BY dp.id_detalle_pedido DESC");
                    while ($qwe = $this->cm->fetch($detalle)) {
                        $dato = array("id" => $qwe[0], "cantidad" => $qwe[1], "observacion" => $qwe[2], "idpedido" => $qwe[3], "idproductoalmacen" => $qwe[4], "codigo" => $qwe[5], "descripcion" => $qwe[6]);
                        array_push($res['datos']['detalle'], $dato);
                    }
                } else {
                    $res = array("estado" => 0, "mensaje" => "El movimiento no se encontro");
                }
            }
            echo json_encode($res);
        } catch (Exception $e) {
            // Revertir la transacción en caso de error utilizando tu función personalizada
            $this->cm->rollbackTransaction();

            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function cancelarMovimiento($id){
        try {
            $registro = $this->cm->query("delete from detalle_movimiento where movimiento_id_movimiento='$id'");
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

    public function listaDetalleMovimiento($id) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT dm.id_detalle_movimiento, dm.cantidad, dm.movimiento_id_movimiento, dm.productos_almacen_id_productos_almacen, p.codigo, p.descripcion FROM detalle_movimiento dm 
        LEFT JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        WHERE dm.movimiento_id_movimiento = '$id'
        ORDER BY dm.id_detalle_movimiento DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "cantidad" => $qwe[1], "idmovimiento" => $qwe[2], "idproductoalmacen" => $qwe[3], "codigo" => $qwe[4], "descripcion" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroDetalleMovimiento($cantidad,$idmovimiento,$idproductoalmacen){
        $res="";
        $registro=$this->cm->query("insert into detalle_movimiento(id_detalle_movimiento, cantidad, movimiento_id_movimiento, productos_almacen_id_productos_almacen)value(NULL,'$cantidad','$idmovimiento','$idproductoalmacen')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIddetallemovimiento($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT dm.id_detalle_movimiento, dm.cantidad, s.cantidad, dm.movimiento_id_movimiento, dm.productos_almacen_id_productos_almacen, m.almacen_id_almacen, m.almacen_destino, pa.productos_id_productos, (SELECT s1.cantidad FROM productos_almacen pa1
        LEFT JOIN stock s1 ON pa1.id_productos_almacen=s1.productos_almacen_id_productos_almacen
        WHERE pa1.productos_id_productos = pa.productos_id_productos AND pa1.almacen_id_almacen=m.almacen_destino AND s1.estado=1
        ) as pa1 FROM detalle_movimiento dm
        LEFT JOIN movimiento m ON dm.movimiento_id_movimiento=m.id_movimiento
        LEFT JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN stock s ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE dm.id_detalle_movimiento = '$id' AND s.estado = 1");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "cantidad" => $qwe[1], "stocko" => $qwe[2], "idmovimiento" => $qwe[3], "idproductoalmacen" => $qwe[4], "idalmacenorigen" => $qwe[5], "idalmacendestino" => $qwe[6], "idproducto" => $qwe[7], "stockd" => $qwe[8]);
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

    public function actualizarDetalleMovimiento($id, $cantidad, $idproducto) {
        $res = "";
        $registro = $this->cm->query("update detalle_movimiento SET cantidad='$cantidad', productos_almacen_id_productos_almacen='$idproducto' where id_detalle_movimiento='$id'");
        if ($registro !== null) {
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminarDetalleMovimiento($dato){
        $res="";
        $registro=$this->cm->query("delete from detalle_movimiento where id_detalle_movimiento='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadopedido($id, $dato, $idmd5){
        $res = "";
        $listaProductos = [];
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d");

        if ($dato == 3) {
            $registro = $this->cm->query("update pedidos SET estado='$dato' where id_pedidos='$id'");
            echo json_encode(array("estado" => 100, "detalles" => "El pedido se descarto correctamente"));
            return;
        }
        $this->cm->begin_transaction();
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        if ($idusuario === "false") {
            echo json_encode(array("error" => "El id de usuario no existe"));
            return;
        }
        $this->cm->begin_transaction();


        $registro = $this->cm->query("update pedidos SET estado='$dato' where id_pedidos='$id'");
        if($registro !== null) {
            $res = array("estado" => "", "movimiento" => "", "detalles" => array("estado" => "", "lista" => []));
            if ($this->cm->affected_rows > 0) {
                $conmov = $this->cm->query("SELECT p.id_pedidos, p.almacen_id_almacen, p.observacion, p.almacen_origen FROM pedidos p WHERE p.id_pedidos = '$id'");
                if ($conmov !== null && $conmov->num_rows > 0) {
                    $mov = $this->cm->fetch($conmov);
                    $nue = $this->cm->query("insert into movimiento(id_movimiento,fecha_movimiento,almacen_destino,autorizacion,descripcion,codigo,almacen_id_almacen,usuario)value(NULL,'$fecha','$mov[1]','2','$mov[2]','0','$mov[3]','$idusuario')");
                    $idmov = $this->cm->insert_id;
                    if ($nue !== null && $idmov) {
                        $condet = $this->cm->query("SELECT dp.id_detalle_pedido, dp.cantidad, dp.observacion, dp.pedidos_id_pedidos, dp.productos_almacen_id_productos_almacen, pa.productos_id_productos, p.codigo, p.descripcion FROM detalles_pedidos dp
                        LEFT JOIN productos_almacen pa ON dp.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
                        WHERE dp.pedidos_id_pedidos = '$id'");
                        if ($condet !== null && $condet->num_rows > 0) {
                            $datos = "";
                            while($det = $this->cm->fetch($condet)) {
                                $condeto = $this->cm->query("SELECT pa.id_productos_almacen, s.id_stock, s.cantidad,  p.codigo, p.descripcion FROM productos_almacen pa 
                                LEFT JOIN stock s ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen
                                LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
                                WHERE pa.productos_id_productos = '$det[5]' AND pa.almacen_id_almacen = '$mov[3]' AND s.estado = 1
                                ORDER BY s.id_stock DESC LIMIT 1");
                                if ($condeto !== null && $condeto->num_rows > 0) {
                                    $deto = $this->cm->fetch($condeto);
                                    if ($deto[2] >= $det[1]) {
                                        $registro=$this->cm->query("insert into detalle_movimiento(id_detalle_movimiento, cantidad, movimiento_id_movimiento, productos_almacen_id_productos_almacen)value(NULL,'$det[1]','$idmov','$det[4]')");
                                    } else {
                                        $datos = array("codigo" => $deto[3], "producto" => $deto[4]);
                                        array_push($listaProductos, $datos);
                                    }
                                }
                            }
                            if (empty($listaProductos)) {
                                $res['detalles']['estado'] = 99;
                                $res['detalles']['lista'] = "Todos los productos se cargaron correctamente";
                                $res['movimiento'] = array("id" => $idmov, "origen" => $mov[3], "destino" => $mov[1], "estado" => 2);
                            } else {
                                $res['detalles']['estado'] = 98;
                                $res['detalles']['lista'] = $listaProductos;
                                $res['movimiento'] = array("id" => $idmov, "origen" => $mov[3], "destino" => $mov[1], "estado" => 2);
                            }
                            $res['estado'] = 100;
                        } else {
                            $this->cm->rollbackTransaction();
                            $res['estado'] = 101;
                            $res['detalles'] = "No se pudo registrar el detalle del movimiento";
                        }
                    } else {
                        $this->cm->rollbackTransaction();
                        $res['estado'] = 101;
                        $res['detalles'] = "No se pudo crear el registro del nuevo movimiento";
                    }
                } else {
                    $this->cm->rollbackTransaction();
                    $res['estado'] = 101;
                    $res['detalles'] = "El pedido seleccionado no existe, actualize la ventana";
                }
            } else {
                $this->cm->rollbackTransaction();
                $res['estado'] = 101;
                $res['detalles'] = "No se actualizo el estado del pedido";
            }
            
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        $this->cm->commitTransaction();
        echo json_encode($res);
    }

    public function listaCampañas($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("select c.id_campañas,c.nombre,c.fechainicio,c.fechafinal,c.porcentage,c.estado,c.almacen_id_almacen from campañas as c, almacen as a where a.idempresa='$idempresa' and c.almacen_id_almacen=a.id_almacen order by c.id_campañas desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "fechainicio" => $qwe[2], "fechafinal" => $qwe[3], "porcentaje" => $qwe[4], "estado" => $qwe[5], "idalmacen" => $qwe[6]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroCampaña($nombre,$fechainicio,$fechafinal,$porcentaje,$idalmacen,$idmd5){
        $res="";
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $registro=$this->cm->query("insert into campañas (id_campañas,nombre,fechainicio,fechafinal,porcentage,estado,almacen_id_almacen) values(null, '$nombre','$fechainicio','$fechafinal','$porcentaje',2,'$idalmacen')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacen" => $idalmacen);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarCampaña($dato){
        $res="";
        $registro=$this->cm->query("delete from campañas where id_campañas='$dato'");
        if($registro !== null){
            
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdcampaña($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("select * from campañas WHERE id_campañas = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "fechai" => $qwe[2], "fechaf" => $qwe[3], "porcentaje" => $qwe[4], "idalmacen" => $qwe[6]);
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

    public function editarCampaña($idcampaña, $nombre, $fechainicio, $fechafinal, $porcentaje, $idalmacen){
        $res="";
        $registro=$this->cm->query("update campañas set nombre='$nombre', fechainicio='$fechainicio', fechafinal='$fechafinal', porcentage='$porcentaje', almacen_id_almacen='$idalmacen' where id_campañas='$idcampaña'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacen" => $idalmacen);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoCampaña($id,$estado){

        $registro=$this->cm->query("update campañas SET estado='$estado' where id_campañas='$id'");
        if($registro !== null){
                $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);

    }

    public function listacategoriaprecio($idcampaña){
        $lista = [];
        $campaña = $this->cm->query("select cc.id_categorias_campañas, cc.porcentajes_id_porcentajes, po.tipo, cc.campañas_id_campañas from categorias_campañas as cc inner join porcentajes as po on cc.porcentajes_id_porcentajes=po.id_porcentajes inner join almacen as a on po.almacen_id_almacen=a.id_almacen where cc.campañas_id_campañas='$idcampaña' order by cc.id_categorias_campañas desc");
        while ($qwe = $this->cm->fetch($campaña)) {
            $res = array("id" => $qwe[0], "idcategoriaprecio" => $qwe[1], "tipo" => $qwe[2], "idcampaña" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registrocategoriaprecio($idcategoriaprecio,$idcampaña,$idmd5){
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $res="";
        $registro=$this->cm->query("insert into categorias_campañas (id_categorias_campañas,porcentajes_id_porcentajes,campañas_id_campañas) values(null,'$idcategoriaprecio','$idcampaña')");
        if($registro !== null){
            $nuevosprecios=$this->cm->query("SELECT pa.id_productos_almacen, ROUND((ps.precio-(ps.precio*(c.porcentage)/100)),2) as new_price, cc.id_categorias_campañas FROM categorias_campañas cc
                LEFT JOIN campañas c ON cc.campañas_id_campañas=c.id_campañas
                LEFT JOIN porcentajes p ON cc.porcentajes_id_porcentajes=p.id_porcentajes
                LEFT JOIN precio_sugerido ps ON p.id_porcentajes=ps.porcentajes_id_porcentajes
                LEFT JOIN productos_almacen pa ON ps.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                LEFT JOIN productos pr ON pa.productos_id_productos=pr.id_productos
                WHERE cc.campañas_id_campañas='$idcampaña' AND ps.porcentajes_id_porcentajes='$idcategoriaprecio' and pr.idempresa='$idempresa'");
                while($qwe=$this->cm->fetch($nuevosprecios)){
                    $registroprecios=$this->cm->query("insert into detalle_campañas(id_detalle_campañas, productos_almacen_id_productos_almacen, precio, categorias_campañas_id_categorias_campañas) VALUES (NULL,'$qwe[0]','$qwe[1]','$qwe[2]')");
                }
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarcategoriaprecio($dato){
        $res="";
        $registro=$this->cm->query("delete from categorias_campañas where id_categorias_campañas='$dato'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Eliminacion exitoss");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function listaPreciocampaña($id) {
        $lista = [];
        
        $consulta = $this->cm->query("SELECT dc.id_detalle_campañas, p.nombre, c.nombre, p.descripcion, p.caracteristicas, m.nombre_medida, u.nombre, ep.tipos_estado, dc.precio, cc.porcentajes_id_porcentajes, cc.id_categorias_campañas, dc.productos_almacen_id_productos_almacen, p.codigo FROM detalle_campañas dc 
        LEFT JOIN productos_almacen pa ON dc.productos_almacen_id_productos_almacen=pa.id_productos_almacen 
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT join categorias c on p.categorias_id_categorias=c.id_categorias
        LEFT join medida m on p.medida_id_medida=m.id_medida
        LEFT join unidad u on p.unidad_id_unidad=u.id_unidad
        LEFT join estados_productos ep on p.estados_productos_id_estados_productos=ep.id_estados_productos
        LEFT JOIN categorias_campañas cc ON dc.categorias_campañas_id_categorias_campañas=cc.id_categorias_campañas
        WHERE cc.campañas_id_campañas='$id'
        ORDER by p.nombre ASC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "codigo" => $qwe[12], "descripcion" => $qwe[3], "precio" => $qwe[8], "idcategoriaprecio" => $qwe[9], "idcategoriacampaña" => $qwe[10], "idproductoalmacen" => $qwe[11]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function editarPreciocampaña($id,$idproductoalmacen,$precio,$idcategoriacampaña){
        $res="";
        $registro=$this->cm->query("update detalle_campañas SET productos_almacen_id_productos_almacen='$idproductoalmacen',precio='$precio',categorias_campañas_id_categorias_campañas='$idcategoriacampaña' where id_detalle_campañas='$id'");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
}