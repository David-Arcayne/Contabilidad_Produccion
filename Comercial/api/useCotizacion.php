<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";

// Mostrar errores (en desarrollo)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Captura errores fatales al final del script
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        echo json_encode([
            "tipo" => "fatal",
            "linea" => $error['line'],
            "archivo" => $error['file'],
            "mensaje" => $error['message']
        ]);
    }
});

// Captura errores no fatales (warnings, notices, etc.)
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    echo json_encode([
        "tipo" => "error",
        "linea" => $errline,
        "archivo" => $errfile,
        "mensaje" => $errstr
    ]);
    exit;
});

// Captura excepciones
set_exception_handler(function ($exception) {
    echo json_encode([
        "tipo" => "exception",
        "linea" => $exception->getLine(),
        "archivo" => $exception->getFile(),
        "mensaje" => $exception->getMessage()
    ]);
    exit;
});
/**
 * Clase para gestionar operaciones de Cotización y delegar operaciones de Venta.
 */
class UseCotizacion
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $conexion;
    private $verificar;
    private $logger;
    private $factura;


        // --- CONSTANTES DE CLASE ---
    private const TIPO_VENTA_SIN_FACTURA = 0;
    private const TIPO_PAGO_CREDITO = 'credito';
    private const PAGO_VARIABLE_DIVIDIDO = 'dividido';
    private const MAX_INTENTOS_CONSULTA_FACTURA = 5;
    private const ESTADO_FACTURA_VALIDADA = 690; // Código de estado 'VALIDADA' de Emizor/SIN
    private const MAX_INTENTOS_NRO_FACTURA = 1000;
    /**
     * Constructor de la clase.
     */
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->logger = new LogErrores();
        $this->factura = new Facturacion();

        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
    }

    /**
     * Punto de entrada principal para registrar una Venta o una Cotización.
     *
     * @param int $tipo_operacion 1 para Venta, 2 para Cotización.
     * @param int $idcliente ID del cliente.
     * @param int $idsucursal ID de la sucursal.
     * @param string $jsonStringDetalles Un string JSON con los detalles de la operación.
     * @return void Imprime una respuesta JSON.
     */
    public function registroCotizacion($tipo_operacion, $idcliente, $idsucursal, $jsonStringDetalles)
    {
        // Decodificar el string JSON que viene del formData
        $detalles = $jsonStringDetalles;

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(["estado" => "error", "mensaje" => "El formato de los productos (JSON) es inválido."]);
            return;
        }

        switch ((int)$tipo_operacion) {
            case 1: // --- FLUJO DE VENTA ---
                // Delegamos la lógica a la clase Ventas, que ya está especializada en eso.
                // Asumimos que la clase Ventas y su método registroCotizacion_enVenta existen.
                try {
                    
                    $this->_guardarComoCotizacionEspecial($idcliente, $idsucursal, $detalles);
                    
                } catch (Exception $e) {
                     echo json_encode(["estado" => "error", "mensaje" => "Error al procesar la venta: " . $e->getMessage()]);
                }
                break;

            case 2: // --- FLUJO DE COTIZACIÓN ---
                // Usamos un método privado para mantener este archivo limpio.
                $this->_guardarComoCotizacion($idcliente, $idsucursal, $detalles);
                break;

            default:
                echo json_encode(["estado" => "error", "mensaje" => "Tipo de operación no válido."]);
                break;
        }
    }
    /**
     * Guarda la operación como una cotización en la base de datos.
     * No afecta stock ni genera facturas.
     *
     * @param int $idcliente ID del cliente.
     * @param int $idsucursal ID de la sucursal.
     * @param array $detalles Array con los detalles de la cotización.
     * @return void Imprime una respuesta JSON.
     */
    private function _guardarComoCotizacionEspecial($idcliente, $idsucursal, $detalles)
    {
        $estado = 1;
         // Extraer IDs de stock para validación
        $idstockArray = array_column($detalles['listaProductos'], 'idstock');
        $idstockPlaceholders = implode(',', array_fill(0, count($idstockArray), '?'));

        // Validar que todos los stocks existan y estén activos (estado = 1) idstock
        $sqlStock = "SELECT id_stock FROM stock WHERE id_stock IN ($idstockPlaceholders) AND estado = 1";
        $stmtStock = $this->cm->prepare($sqlStock);
        $stmtStock->bind_param(str_repeat('i', count($idstockArray)), ...$idstockArray);
        $stmtStock->execute();
        $stmtStock->store_result();
        
        if ($stmtStock->num_rows !== count($idstockArray)) {
            $stmtStock->close();
             echo json_encode( ["estado" => "error", "mensaje" => "Uno o más productos no tienen stock válido o disponible. Por favor, actualice la lista de venta."]);
             return;
        }
        $stmtStock->close();
        try {
            $idusuario = $this->verificar->verificarIDUSERMD5($detalles['idusuario']);
            if (!$idusuario) {
                echo json_encode(["estado" => "error", "mensaje" => "El ID de usuario proporcionado no es válido."]);
                return;
            }

            $this->cm->begin_transaction();

            // 1. Insertar la cotización principal
            $sqlCotizacion = "INSERT INTO cotizacion (fecha_cotizacion, monto_total, descuento, cliente_id_cliente, divisas_id_divisas, id_usuario, idsucursal, estado) 
                              VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            $stmtCotizacion->bind_param(
                "ddiiiii",
                $detalles['ventatotal'],
                $detalles['descuento'],
                $idcliente,
                $detalles['divisa'],
                $idusuario,
                $idsucursal,
                $estado
            );
            $stmtCotizacion->execute();

            if ($stmtCotizacion->affected_rows > 0) {
                $ultimoIdInsertado = $this->cm->insert_id;
                $stmtCotizacion->close();

                // 2. Insertar los detalles de la cotización "

                if (empty($detalles['listaProductos'])) {
                    throw new Exception("La lista de productos no puede estar vacía.");
                }
                
                
                $sqlDetalle = "INSERT INTO detalle_cotizacion (cantidad, precio_unitario, productos_almacen_id_productos_almacen, cotizacion_id_cotizacion) 
                               VALUES (?, ?, ?, ?)";
                $stmtDetalle = $this->cm->prepare($sqlDetalle);

                $sqlGetStock = "SELECT cantidad FROM stock WHERE id_stock = ? AND estado = 1";
                $stmtGetStock = $this->cm->prepare($sqlGetStock);
                
                $sqlUpdateStock = "UPDATE stock SET estado = 2 WHERE id_stock = ? AND estado = 1";
                $stmtUpdateStock = $this->cm->prepare($sqlUpdateStock);

                $sqlNewStock = "INSERT INTO stock (cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) 
                                VALUES (?, NOW(), 'VE', 1, ?)";
                $stmtNewStock = $this->cm->prepare($sqlNewStock);

                foreach ($detalles['listaProductos'] as $producto) {
                    if (!isset($producto['idproductoalmacen'])) {
                        throw new Exception("Producto en la lista no tiene 'idproductoalmacen'.");
                    }
                    $stmtDetalle->bind_param("idii", $producto['cantidad'], $producto['precio'], $producto['idproductoalmacen'], $ultimoIdInsertado);
                    $stmtDetalle->execute();


                     // Obtener cantidad actual del stock
                    $stmtGetStock->bind_param("i", $producto['idstock']);
                    $stmtGetStock->execute();
                    $cantidadActual = $stmtGetStock->get_result()->fetch_row()[0];


                    // Invalidar stock antiguo
                    $stmtUpdateStock->bind_param("i", $producto['idstock']);
                    $stmtUpdateStock->execute();
                    if ($stmtUpdateStock->affected_rows === 0) {
                        throw new Exception("Conflicto al actualizar el stock para id: " . $producto['idstock'] . ". La venta fue cancelada.");
                    }

                    // Crear nuevo registro de stock con la cantidad actualizada
                    $nuevaCantidad = $cantidadActual - $producto['cantidad'];
                    $stmtNewStock->bind_param("di", $nuevaCantidad, $producto['idproductoalmacen']);
                    $stmtNewStock->execute();
                    if ($stmtNewStock->affected_rows === 0) {
                        throw new Exception("No se pudo crear el nuevo registro de stock para el producto con ID almacén: " . $producto['idproductoalmacen']);
                    }
                }

                $stmtDetalle->close();
                $stmtGetStock->close();
                $stmtUpdateStock->close();
                $stmtNewStock->close();

                $this->cm->commit();
                echo json_encode(["estado" => "exito", "mensaje" => "Cotización registrada exitosamente.", "id" => $ultimoIdInsertado]);
            
            } else {
                throw new Exception("Error al registrar la cotización principal.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("guardarCotizacion", "error", $e->getMessage(), ['idcliente' => $idcliente, 'detalles' => $detalles]);
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    /**
     * Guarda la operación como una cotización en la base de datos.
     * No afecta stock ni genera facturas.
     *
     * @param int $idcliente ID del cliente.
     * @param int $idsucursal ID de la sucursal.
     * @param array $detalles Array con los detalles de la cotización.
     * @return void Imprime una respuesta JSON.
     */
    private function _guardarComoCotizacion($idcliente, $idsucursal, $detalles)
    {
        $estado = 2;
        try {
            $idusuario = $this->verificar->verificarIDUSERMD5($detalles['idusuario']);
            if (!$idusuario) {
                echo json_encode(["estado" => "error", "mensaje" => "El ID de usuario proporcionado no es válido."]);
                return;
            }

            $this->cm->begin_transaction();

            // 1. Insertar la cotización principal
            $sqlCotizacion = "INSERT INTO cotizacion (fecha_cotizacion, monto_total, descuento, cliente_id_cliente, divisas_id_divisas, id_usuario, idsucursal, estado) 
                              VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            $stmtCotizacion->bind_param(
                "ddiiiii",
                $detalles['ventatotal'],
                $detalles['descuento'],
                $idcliente,
                $detalles['divisa'],
                $idusuario,
                $idsucursal,
                $estado
            );
            $stmtCotizacion->execute();

            if ($stmtCotizacion->affected_rows > 0) {
                $ultimoIdInsertado = $this->cm->insert_id;
                $stmtCotizacion->close();

                // 2. Insertar los detalles de la cotización
                if (empty($detalles['listaProductos'])) {
                    throw new Exception("La lista de productos no puede estar vacía.");
                }
                
                $sqlDetalle = "INSERT INTO detalle_cotizacion (cantidad, precio_unitario, productos_almacen_id_productos_almacen, cotizacion_id_cotizacion) 
                               VALUES (?, ?, ?, ?)";
                $stmtDetalle = $this->cm->prepare($sqlDetalle);

                foreach ($detalles['listaProductos'] as $producto) {
                    if (!isset($producto['idproductoalmacen'])) {
                        throw new Exception("Producto en la lista no tiene 'idproductoalmacen'.");
                    }
                    $stmtDetalle->bind_param("idii", $producto['cantidad'], $producto['precio'], $producto['idproductoalmacen'], $ultimoIdInsertado);
                    $stmtDetalle->execute();
                }
                $stmtDetalle->close();

                $this->cm->commit();
                echo json_encode(["estado" => "exito", "mensaje" => "Cotización registrada exitosamente.", "id" => $ultimoIdInsertado]);
            
            } else {
                throw new Exception("Error al registrar la cotización principal.");
            }
        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("guardarCotizacion", "error", $e->getMessage(), ['idcliente' => $idcliente, 'detalles' => $detalles]);
            echo json_encode(["estado" => "error", "mensaje" => $e->getMessage()]);
        }
    }

    /**
     * Obtiene y formatea todos los detalles de una cotización específica para su visualización.
     *
     * @param int $id ID de la cotización.
     * @param string $idmd5 Hash MD5 del ID de la empresa.
     * @return void Imprime una respuesta JSON con los detalles completos.
     */
     public function detallecotizacion($id, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $clien = $this->cm->query("select
            dco.id_detalle_cotizacion,
            pa.id_productos_almacen as idproductoalmacen,
            p.nombre,
            p.descripcion,
            p.caracteristicas,
            p.codigo as  codigoProducto,
            p.codigosin as codigoProductoSin,
            p.actividadsin as codigoActividadSin,
            p.unidadsin as unidadMedida,
            p.codigonandina as codigoNandina,
            dco.cantidad,
            dco.precio_unitario
            
        from detalle_cotizacion dco 
        LEFT join cotizacion co on dco.cotizacion_id_cotizacion=co.id_cotizacion
        LEFT join productos_almacen pa on dco.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT join productos p on pa.productos_id_productos=p.id_productos
        where dco.cotizacion_id_cotizacion='$id'
        order by p.nombre desc");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array(
                "id" => $qwe['id_detalle_cotizacion'],
                "idproductoalmacen" => $qwe['idproductoalmacen'],
                "producto" => $qwe['nombre'],
                "descripcion" => $qwe['descripcion'],
                "caracteristica" => $qwe['caracteristicas'],
                "codigoProducto" => $qwe['codigoProducto'],
                "codigoProductoSin" => $qwe['codigoProductoSin'],
                "codigoActividadSin" => $qwe['codigoActividadSin'],
                "unidadMedida" => $qwe['unidadMedida'],
                "codigoNandina" => $qwe['codigoNandina'],
                "cantidad" => $qwe['cantidad'],
                "precio" => $qwe['precio_unitario']);
            array_push($lista, $res);
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

        $empresas = $this->em->query("SELECT * FROM organizacion WHERE idorganizacion='$idempresa'");

        $empresaInfo = [];
        while ($empresa = $this->em->fetch($empresas)) {
            $empresaInfo[$empresa[0]] = array(
                "id" => $empresa[0],
                "nombre" => $empresa[1],
                "celular" => $empresa[11],
                "email" => $empresa[8],
                "logo" => $empresa[13],
                "direccion" => $empresa[12]
            );
        }


        $lista2 = [];
        $alma = $this->cm->query("select 
        co.id_cotizacion,
        c.id_cliente as idcliente,
        c.nombre as cliente,
        c.nombrecomercial,
        s.id_sucursal as idsucursal,
        s.nombre as sucursal,
        co.fecha_cotizacion,
        c.direccion, 
        c.nit, 
        c.email, 
        co.monto_total, 
        co.descuento,
        co.id_usuario,
        d.nombre as divisa,
        d.monedasin 
        from cotizacion co
        inner join cliente c on co.cliente_id_cliente=c.id_cliente
        inner join sucursal s on co.idsucursal=s.id_sucursal
        inner join divisas d on co.divisas_id_divisas=d.id_divisas
        where co.id_cotizacion='$id'");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array(
                "id" => $qwe['id_cotizacion'],
                "cliente" => $qwe['cliente'],
                "idcliente" =>$qwe['idcliente'],
                "nombrecomercial" => $qwe['nombrecomercial'],
                "idsucursal" =>$qwe['idsucursal'],
                "sucursal" => $qwe['sucursal'],
                "fecha" => $qwe['fecha_cotizacion'],
                "direccion" => $qwe['direccion'],
                "nit" => $qwe['nit'],
                "email" => $qwe['email'],
                "montototal" => $qwe['monto_total'],
                "descuento" => $qwe['descuento'],
                "divisa" => $qwe['divisa'],
                "monedasin" => $qwe['monedasin'],
                "detalle" => array($lista),
                "usuario" => array($usuarioInfo[$qwe['id_usuario']]),
                "empresa" => array($empresaInfo[$idempresa]));
            array_push($lista2, $res);
        }

        echo json_encode($lista2);
    }
    private function eliminarCotizacion($id) { /// solo cambiar el estado a cotizacion normal 
        if (empty($id) || !is_numeric($id)) {
            return ["estado" => "error", "mensaje" => "ID de cotización inválido"];
        }

        $this->cm->begin_transaction();

        try {
            // 1. Eliminar los detalles relacionados a la cotización
            $sqlDetalle = "DELETE FROM detalle_cotizacion WHERE cotizacion_id_cotizacion = ?";
            $stmtDetalle = $this->cm->prepare($sqlDetalle);
            if (!$stmtDetalle) {
                
                 return ["estado" => "error", "mensaje" => $this->cm->error];
            }
            $stmtDetalle->bind_param("i", $id);
            $stmtDetalle->execute();
            $stmtDetalle->close();

            // 2. Eliminar la cotización principal
            $sqlCotizacion = "DELETE FROM cotizacion WHERE id_cotizacion = ?";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            if (!$stmtCotizacion) {
                return ["estado" => "error", "mensaje" => $this->cm->error];
            }
            $stmtCotizacion->bind_param("i", $id);
            $stmtCotizacion->execute();
            $stmtCotizacion->close();

            // 3. Confirmar cambios
            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Cotización eliminada correctamente"];

        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("eliminarCotizacion", "error", $e->getMessage(), $id, null, null);
            return ["estado" => "error", "mensaje" => "Error al eliminar cotización: " . $e->getMessage()];
        }
    }

    public function registroCotizacion_enVenta($idcotizacion,$fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles)
    {
        $idempresa = null;
        $idusuario = null;

        try {
            date_default_timezone_set('America/La_Paz');
            $respuestaFinal = [
                "estado" => "error",
                "mensaje" => "Error inesperado al iniciar el proceso."
            ];

            // --- 1. VALIDACIÓN DE IDENTIDADES (EMPRESA Y USUARIO) ---
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            if (!$idempresa) {
                $this->logger->registrar("registroCotizacion_enVenta", "error", "ID de empresa inválido", compact('idmd5'), null);
                echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no válido."]);
                return;
            }

            $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
            if (!$idusuario) {
                $this->logger->registrar("registroCotizacion_enVenta", "error", "ID de usuario inválido", compact('idmd5u'), null, $idempresa);
                echo json_encode(["estado" => "error", "mensaje" => "ID de usuario no válido."]);
                return;
            }

            // --- 2. GENERACIÓN DE CÓDIGOS Y NÚMEROS DE VENTA ---
            $consultanroventa = $this->cm->query("SELECT count(v.id_venta) FROM venta v LEFT JOIN cliente c ON v.cliente_id_cliente1=c.id_cliente WHERE c.idempresa='$idempresa'");
            $resp = $this->cm->fetch($consultanroventa);
            $nroventa = $resp[0] + 2; // La lógica original sumaba 2, ajustado a +1 que es más común. Si +2 era intencional, se puede revertir.

            $codigoVenta = str_pad($idcliente, 6, '0', STR_PAD_LEFT) .
                           str_replace('-', '', substr($fecha, 0, 10)) .
                           str_pad($nroventa, 6, '0', STR_PAD_LEFT);

            $nroFactura = $this->obtenerNumeroFacturaDisponible($idempresa, $tipoventa);
            if ($nroFactura === null) {
                echo json_encode(["estado" => "error", "mensaje" => "No se pudo generar un número de factura único. Intente nuevamente."]);
                return;
            }

            // --- 3. PROCESO PRINCIPAL DE VENTA (CON O SIN FACTURA) ---
            $datosVenta = [
                'fecha' => $fecha,
                'tipoventa' => $tipoventa,
                'ventatotal' => $jsonDetalles['ventatotal'],
                'descuento' => $jsonDetalles['descuento'],
                'tipopago' => $tipopago,
                'idcliente' => $idcliente,
                'iddivisa' => $jsonDetalles['iddivisa'],
                'idusuario' => $idusuario,
                'nroFactura' => $nroFactura,
                'idsucursal' => $idsucursal,
                'idcampaña' => $jsonDetalles['idcampana'],
                'nroventa' => $nroventa,
                'canalventa' => $canalventa,
                'codigoVenta' => $codigoVenta
            ];

            
                // Venta con factura: primero emitir factura, luego registrar en BD
                $jsonDetalles['listaFactura']['numeroFactura'] = $nroFactura;
                $jsonDetalles['listaFactura']['extras']['facturaTicket'] = $codigoVenta;

                $respuestaEmizor = $this->factura->crearfactura($jsonDetalles['listaFactura'], $tipoventa, $jsonDetalles['token'], $jsonDetalles['tipo'], $jsonDetalles['codigosinsucursal']);

                if ($respuestaEmizor->status === "success") {
                    $estadoFactura = null;
                    for ($i = 0; $i < self::MAX_INTENTOS_CONSULTA_FACTURA; $i++) {
                        $estadoFactura = $this->factura->estadofactura($respuestaEmizor->data->cuf, $jsonDetalles['token'], $jsonDetalles['tipo'], 2);
                        if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA && $estadoFactura->data->errores == null) {
                            break; // Factura validada, salir del bucle
                        }
                        sleep(1); // Esperar 1 segundo antes de reintentar
                    }

                    if ($estadoFactura->data->codigoEstado == self::ESTADO_FACTURA_VALIDADA) {
                        $resultadoDB = $this->_registrarVentaDetallesEnDB_COT($datosVenta, $jsonDetalles['listaProductos']);
                        if ($resultadoDB['estado'] == 'exito') {
                            $this->factura->registrarFacturas($respuestaEmizor->data->ack_ticket, $estadoFactura->data->codigoEstado, $respuestaEmizor->data->cuf, $respuestaEmizor->data->emission_type_code, $respuestaEmizor->data->fechaEmision, $respuestaEmizor->data->numeroFactura, $respuestaEmizor->data->shortLink, $respuestaEmizor->data->urlSin, $respuestaEmizor->data->xml_url, $resultadoDB['idventa']);
                            
                            $respuestaFinal = array_merge($resultadoDB, [
                                "tipoventa" => "Facturado",
                                "estadoFactura" => $estadoFactura->data,
                                "datosFactura" => [
                                    "urlEmizor" => $respuestaEmizor->data->shortLink ?? null,
                                    "urlsin" => $respuestaEmizor->data->urlSin ?? $respuestaEmizor->data->urlsin ?? null
                                ]
                            ]);
                            $this->eliminarCotizacion($idcotizacion);
                        } else {
                           $respuestaFinal = $resultadoDB; // Propagar error de la BD
                        }
                    } else {
                        $respuestaFinal = ["estado" => "error", "mensaje" => "La factura no pudo ser validada por el SIN.", "detalles" => $estadoFactura];
                    }
                } else {
                    $respuestaFinal = ["estado" => "error", "mensaje" => "Error al emitir la factura.", "detalles" => $respuestaEmizor->errors ?? $respuestaEmizor];
                }
            
            
            // Si la venta se registró correctamente, procesar pagos adicionales
            if(isset($respuestaFinal['estado']) && $respuestaFinal['estado'] == 'exito') {
                $ultimoIDventa = $respuestaFinal['idventa'];
            }

            echo json_encode($respuestaFinal);

        } catch (Exception $e) {
            $this->logger->registrar("registroCotizacion_enVenta", "error", $e->getMessage(), compact('fecha', 'tipoventa', 'idmd5', 'jsonDetalles'), $idusuario, $idempresa);
            echo json_encode(["estado" => "error", "mensaje" => "Excepción capturada: " . $e->getMessage()]);
        }
    }
     private function obtenerNumeroFacturaDisponible($idempresa, $tipoventa)
    {
        $nroFactura = null;
        $contadorIntentos = 0;

        // Bucle para asegurar que el número de factura no exista
        while ($nroFactura === null) {
            // 1. Contar ventas existentes para proponer un número inicial
            $sqlConteo = "SELECT COUNT(v.id_venta) 
                          FROM venta v 
                          LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                          WHERE c.idempresa = ? AND v.tipo_venta = ?";
            $stmtConteo = $this->cm->prepare($sqlConteo);
            $stmtConteo->bind_param("is", $idempresa, $tipoventa);
            $stmtConteo->execute();
            $resultado = $stmtConteo->get_result()->fetch_row();
            $nroFactura = $resultado[0] + 1 + $contadorIntentos;
            $stmtConteo->close();

            // 2. Verificar si el número propuesto ya existe
            $sqlVerificacion = "SELECT v.nfactura 
                                FROM venta v 
                                LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente 
                                WHERE c.idempresa = ? AND v.tipo_venta = ? AND v.nfactura = ?";
            $stmtVerificacion = $this->cm->prepare($sqlVerificacion);
            $stmtVerificacion->bind_param("isi", $idempresa, $tipoventa, $nroFactura);
            $stmtVerificacion->execute();
            $stmtVerificacion->store_result();

            if ($stmtVerificacion->num_rows > 0) {
                $nroFactura = null; // El número existe, se reinicia para probar el siguiente
                $contadorIntentos++;
            }
            $stmtVerificacion->close();

            // 3. Salvaguarda contra bucles infinitos
            if ($contadorIntentos > self::MAX_INTENTOS_NRO_FACTURA) {
                throw new Exception("No se pudo encontrar un número de factura disponible después de " . self::MAX_INTENTOS_NRO_FACTURA . " intentos.");
            }
        }

        return $nroFactura;
    }
    private function _registrarVentaDetallesEnDB_COT($datosVenta, $listaProductos)
    {
        if (empty($listaProductos)) {
            return ["estado" => "error", "mensaje" => "La lista de productos está vacía."];
        }
        $this->cm->begin_transaction();
        try {
            // --- Insertar en la tabla 'venta' ---
            $sqlCotizacion = "INSERT INTO venta (fecha_venta, tipo_venta, monto_total, descuento, tipo_pago, cliente_id_cliente1, divisas_id_divisas, id_usuario, nfactura, idsucursal, idcampaña, nroventa, estado, idcanal, codigoventa) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)";
            $stmtCotizacion = $this->cm->prepare($sqlCotizacion);
            $stmtCotizacion->bind_param(
                "ssddsiiisiisss",
                $datosVenta['fecha'], $datosVenta['tipoventa'], $datosVenta['ventatotal'], $datosVenta['descuento'],
                $datosVenta['tipopago'], $datosVenta['idcliente'], $datosVenta['iddivisa'], $datosVenta['idusuario'],
                $datosVenta['nroFactura'], $datosVenta['idsucursal'], $datosVenta['idcampaña'], $datosVenta['nroventa'],
                $datosVenta['canalventa'], $datosVenta['codigoVenta']
            );
            $stmtCotizacion->execute();
            
            if ($stmtCotizacion->affected_rows === 0) {
                throw new Exception("No se pudo registrar la venta principal.");
            }
            $ultimoIDventa = $this->cm->insert_id;
            $stmtCotizacion->close();

            // --- Insertar en 'detalle_venta' y actualizar 'stock' para cada producto ---
            $sqlDetalle = "INSERT INTO detalle_venta (cantidad, precio_unitario, productos_almacen_id_productos_almacen, venta_id_venta, categoria) 
                           VALUES (?, ?, ?, ?, ?)";
            $stmtDetalle = $this->cm->prepare($sqlDetalle);

            
            foreach ($listaProductos as $producto) {
                // Insertar detalle de venta
                $stmtDetalle->bind_param("ddiis", $producto['cantidad'], $producto['precio'], $producto['idproductoalmacen'], $ultimoIDventa, $producto['idporcentaje']);
                $stmtDetalle->execute();
                if ($stmtDetalle->affected_rows === 0) {
                    throw new Exception("No se pudo insertar el detalle para el producto con ID almacén: " . $producto['idproductoalmacen']);
                }

                
            }

            $stmtDetalle->close();
           

            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Venta registrada correctamente.", "idventa" => $ultimoIDventa];

        } catch (Exception $e) {
            $this->cm->rollback();
            // Loggear el error específico para diagnóstico
            $this->logger->registrar("_registrarVentaDetallesEnDB", "error", $e->getMessage(), $datosVenta, $datosVenta['idusuario'], null);
            return ["estado" => "error", "mensaje" => "Error en la base de datos: " . $e->getMessage()];
        }
    }
}