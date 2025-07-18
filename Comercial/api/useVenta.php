<?php

use BcMath\Number;

require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";

/**
 * Clase para gestionar las operaciones de ventas, facturación y stock.
 */
class UseVEnta
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $conexion;
    private $verificar;
    private $factura;
    private $logger;

    // --- CONSTANTES DE CLASE ---
    private const TIPO_VENTA_SIN_FACTURA = 0;
    private const TIPO_PAGO_CREDITO = 'credito';
    private const PAGO_VARIABLE_DIVIDIDO = 'dividido';
    private const MAX_INTENTOS_CONSULTA_FACTURA = 5;
    private const ESTADO_FACTURA_VALIDADA = 690; // Código de estado 'VALIDADA' de Emizor/SIN
    private const MAX_INTENTOS_NRO_FACTURA = 1000;

    /**
     * Constructor de la clase Ventas.
     */
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->logger = new LogErrores();

        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
    }

    /**
     * Obtiene un número de factura disponible y único para una empresa y tipo de venta.
     * Evita duplicados y bucles infinitos.
     *
     * @param int $idempresa ID de la empresa.
     * @param int $tipoventa Tipo de venta.
     * @return int|null El número de factura disponible.
     * @throws Exception Si no se puede encontrar un número disponible.
     */
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

    /**
     * Registra una nueva venta, maneja la facturación, stock y pagos.
     *
     * @param string $fecha Fecha de la venta.
     * @param int $tipoventa Tipo de venta (con o sin factura).
     * @param string $tipopago Tipo de pago (contado, crédito).
     * @param int $idcliente ID del cliente.
     * @param int $idsucursal ID de la sucursal.
     * @param int $canalventa ID del canal de venta.
     * @param string $idmd5 Hash MD5 del ID de la empresa.
     * @param string $idmd5u Hash MD5 del ID del usuario.
     * @param array $jsonDetalles Array con los detalles de la venta (productos, totales, etc.).
     * @return void Imprime una respuesta JSON.
     */
    public function registroVenta($fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles)
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
                $this->logger->registrar("registroVenta", "error", "ID de empresa inválido", compact('idmd5'), null);
                echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no válido."]);
                return;
            }

            $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
            if (!$idusuario) {
                $this->logger->registrar("registroVenta", "error", "ID de usuario inválido", compact('idmd5u'), null, $idempresa);
                echo json_encode(["estado" => "error", "mensaje" => "ID de usuario no válido."]);
                return;
            }

            // --- 2. GENERACIÓN DE CÓDIGOS Y NÚMEROS DE VENTA ---
            $consultanroventa = $this->cm->query("SELECT count(v.id_venta) FROM venta v LEFT JOIN cliente c ON v.cliente_id_cliente1=c.id_cliente WHERE c.idempresa='$idempresa'");
            $resp = $this->cm->fetch($consultanroventa);
            $nroventa = $resp[0] + 1; // La lógica original sumaba 2, ajustado a +1 que es más común. Si +2 era intencional, se puede revertir.

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

            if ($tipoventa == self::TIPO_VENTA_SIN_FACTURA) {
                // Venta sin factura: solo registrar en la base de datos local
                $resultadoDB = $this->_registrarVentaDetallesEnDB($datosVenta, $jsonDetalles['listaProductos']);
                $respuestaFinal = array_merge($resultadoDB, ["tipoventa" => "No Facturado"]);

            } else {
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
                        $resultadoDB = $this->_registrarVentaDetallesEnDB($datosVenta, $jsonDetalles['listaProductos']);
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
                        } else {
                           $respuestaFinal = $resultadoDB; // Propagar error de la BD
                        }
                    } else {
                        $respuestaFinal = ["estado" => "error", "mensaje" => "La factura no pudo ser validada por el SIN.", "detalles" => $estadoFactura];
                    }
                } else {
                    $respuestaFinal = ["estado" => "error", "mensaje" => "Error al emitir la factura.", "detalles" => $respuestaEmizor->errors ?? $respuestaEmizor];
                }
            }
            
            // Si la venta se registró correctamente, procesar pagos adicionales
            if(isset($respuestaFinal['estado']) && $respuestaFinal['estado'] == 'exito') {
                $ultimoIDventa = $respuestaFinal['idventa'];

                // --- 4. REGISTRO DE CUENTAS POR COBRAR (CRÉDITO) ---
                if ($tipopago == self::TIPO_PAGO_CREDITO) {
                    $respuestaCredito = $this->registroCuentaXcobrar($jsonDetalles['nropagos'], $jsonDetalles['valorpagos'], $jsonDetalles['dias'], $ultimoIDventa, $jsonDetalles['fechalimite'], $jsonDetalles['ventatotal']);
                    $respuestaFinal['credito'] = $respuestaCredito;
                }

                // --- 5. REGISTRO DE PAGOS DIVIDIDOS ---
                if (isset($jsonDetalles['variablePago']) && $jsonDetalles['variablePago'] == self::PAGO_VARIABLE_DIVIDIDO) {
                    $respuestaPagos = $this->registrarPagosVenta($jsonDetalles['pagosDivididos'], $ultimoIDventa);
                    $respuestaFinal['pagosDivididos'] = $respuestaPagos;
                }
            }

            echo json_encode($respuestaFinal);

        } catch (Exception $e) {
            $this->logger->registrar("registroVenta", "error", $e->getMessage(), compact('fecha', 'tipoventa', 'idmd5', 'jsonDetalles'), $idusuario, $idempresa);
            echo json_encode(["estado" => "error", "mensaje" => "Excepción capturada: " . $e->getMessage()]);
        }
    }
    
    /**
     * Función privada que encapsula la lógica de base de datos para registrar una venta.
     * Utiliza transacciones para garantizar la integridad de los datos.
     *
     * @param array $datosVenta Datos maestros de la venta.
     * @param array $listaProductos Lista de productos a vender.
     * @return array Resultado de la operación.
     */
    private function _registrarVentaDetallesEnDB($datosVenta, $listaProductos)
    {
        if (empty($listaProductos)) {
            return ["estado" => "error", "mensaje" => "La lista de productos está vacía."];
        }

        // Extraer IDs de stock para validación
        $idstockArray = array_column($listaProductos, 'idstock');
        $idstockPlaceholders = implode(',', array_fill(0, count($idstockArray), '?'));

        // Validar que todos los stocks existan y estén activos (estado = 1)
        $sqlStock = "SELECT id_stock FROM stock WHERE id_stock IN ($idstockPlaceholders) AND estado = 1";
        $stmtStock = $this->cm->prepare($sqlStock);
        $stmtStock->bind_param(str_repeat('i', count($idstockArray)), ...$idstockArray);
        $stmtStock->execute();
        $stmtStock->store_result();
        
        if ($stmtStock->num_rows !== count($idstockArray)) {
            $stmtStock->close();
            return ["estado" => "error", "mensaje" => "Uno o más productos no tienen stock válido o disponible. Por favor, actualice la lista de venta."];
        }
        $stmtStock->close();

        $this->cm->begin_transaction();
        try {
            // --- Insertar en la tabla 'venta' ---
            $sqlVenta = "INSERT INTO venta (fecha_venta, tipo_venta, monto_total, descuento, tipo_pago, cliente_id_cliente1, divisas_id_divisas, id_usuario, nfactura, idsucursal, idcampaña, nroventa, estado, idcanal, codigoventa) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)";
            $stmtVenta = $this->cm->prepare($sqlVenta);
            $stmtVenta->bind_param(
                "ssddsiiisiisss",
                $datosVenta['fecha'], $datosVenta['tipoventa'], $datosVenta['ventatotal'], $datosVenta['descuento'],
                $datosVenta['tipopago'], $datosVenta['idcliente'], $datosVenta['iddivisa'], $datosVenta['idusuario'],
                $datosVenta['nroFactura'], $datosVenta['idsucursal'], $datosVenta['idcampaña'], $datosVenta['nroventa'],
                $datosVenta['canalventa'], $datosVenta['codigoVenta']
            );
            $stmtVenta->execute();
            
            if ($stmtVenta->affected_rows === 0) {
                throw new Exception("No se pudo registrar la venta principal.");
            }
            $ultimoIDventa = $this->cm->insert_id;
            $stmtVenta->close();

            // --- Insertar en 'detalle_venta' y actualizar 'stock' para cada producto ---
            $sqlDetalle = "INSERT INTO detalle_venta (cantidad, precio_unitario, productos_almacen_id_productos_almacen, venta_id_venta, categoria) 
                           VALUES (?, ?, ?, ?, ?)";
            $stmtDetalle = $this->cm->prepare($sqlDetalle);

            $sqlGetStock = "SELECT cantidad FROM stock WHERE id_stock = ? AND estado = 1";
            $stmtGetStock = $this->cm->prepare($sqlGetStock);
            
            $sqlUpdateStock = "UPDATE stock SET estado = 2 WHERE id_stock = ? AND estado = 1";
            $stmtUpdateStock = $this->cm->prepare($sqlUpdateStock);

            $sqlNewStock = "INSERT INTO stock (cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) 
                            VALUES (?, NOW(), 'VE', 1, ?)";
            $stmtNewStock = $this->cm->prepare($sqlNewStock);

            foreach ($listaProductos as $producto) {
                // Insertar detalle de venta
                $stmtDetalle->bind_param("ddiis", $producto['cantidad'], $producto['precio'], $producto['idproductoalmacen'], $ultimoIDventa, $producto['idporcentaje']);
                $stmtDetalle->execute();
                if ($stmtDetalle->affected_rows == 0) {
                    throw new Exception("No se pudo insertar el detalle para el producto con ID almacén: " . $producto['idproductoalmacen']);
                }
                if ((int)$producto['despachado'] == 2) {
                    $this->_registrar_venta_no_despachada($ultimoIDventa, $producto);
                }else{

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
                
            }

            $stmtDetalle->close();
            $stmtGetStock->close();
            $stmtUpdateStock->close();
            $stmtNewStock->close();

            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Venta registrada correctamente.", "idventa" => $ultimoIDventa,"idcliente" => $datosVenta['idcliente'], "productos" => $listaProductos];

        } catch (Exception $e) {
            $this->cm->rollback();
            // Loggear el error específico para diagnóstico
            $this->logger->registrar("_registrarVentaDetallesEnDB", "error", $e->getMessage(), $datosVenta, $datosVenta['idusuario'], null);
            return ["estado" => "error", "mensaje" => "Error en la base de datos: " . $e->getMessage()];
        }
    }
    private function _registrar_venta_no_despachada($idventa, $producto) {
        $sqlDetalle = "INSERT INTO ventas_no_despachadas (
            id_venta, 
            productos_almacen_id_productos_almacen, 
            cantidad_pendiente,
            precio_unitario,
            categoria
        ) VALUES (?, ?, ?, ?, ?)";

        $stmtDetalle = $this->cm->prepare($sqlDetalle);
        $stmtDetalle->bind_param(
            "iiddi",
            $idventa,
            $producto['idproductoalmacen'],
            $producto['cantidad'],
            $producto['precio'],
            $producto['idporcentaje']
        );

        $stmtDetalle->execute();

        if ($stmtDetalle->affected_rows === 0) {
            return("No se pudo insertar el detalle para el producto con ID almacén: " . $producto['idproductoalmacen']);
        }
    }

    public function _procesar_ventas_pendientes($idventaND, $productos_almacen_id_productos_almacen, $cantidad_pendiente) {
        try {
            $this->cm->begin_transaction();

            // 1. Obtener el ID del stock válido
            $sqlIdStock = "SELECT id_stock AS idstock FROM stock WHERE productos_almacen_id_productos_almacen = ? AND estado = 1";
            $stmtStock = $this->cm->prepare($sqlIdStock);
            $stmtStock->bind_param("i", $productos_almacen_id_productos_almacen);
            $stmtStock->execute();
            $resultStock = $stmtStock->get_result();

            if ($resultStock->num_rows === 0) {
                throw new Exception("No se encontró stock activo para el producto $productos_almacen_id_productos_almacen");
            }

            $idstock = $resultStock->fetch_assoc()['idstock'];

            // 2. Obtener cantidad actual del stock
            $sqlGetStock = "SELECT cantidad FROM stock WHERE id_stock = ? AND estado = 1";
            $stmtGetStock = $this->cm->prepare($sqlGetStock);
            $stmtGetStock->bind_param("i", $idstock);
            $stmtGetStock->execute();
            $resultCantidad = $stmtGetStock->get_result()->fetch_row();

            if (!$resultCantidad) {
                throw new Exception("No se pudo obtener la cantidad del stock con ID: $idstock");
            }

            $cantidadActual = floatval($resultCantidad[0]);

            // 3. Verificar stock suficiente
            $nuevaCantidad = $cantidadActual - $cantidad_pendiente;
            if ($nuevaCantidad < 0) {
                throw new Exception("Stock insuficiente. Solo hay $cantidadActual y se requiere $cantidad_pendiente.");
            }

            // 4. Invalidar stock antiguo
            $sqlUpdateStock = "UPDATE stock SET estado = 2 WHERE id_stock = ? AND estado = 1";
            $stmtUpdateStock = $this->cm->prepare($sqlUpdateStock);
            $stmtUpdateStock->bind_param("i", $idstock);
            $stmtUpdateStock->execute();
            if ($stmtUpdateStock->affected_rows === 0) {
                throw new Exception("Error al invalidar el stock con ID $idstock.");
            }

            // 5. Crear nuevo registro de stock actualizado
            $sqlNewStock = "INSERT INTO stock (cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) 
                            VALUES (?, NOW(), 'VE', 1, ?)";
            $stmtNewStock = $this->cm->prepare($sqlNewStock);
            $stmtNewStock->bind_param("di", $nuevaCantidad, $productos_almacen_id_productos_almacen);
            $stmtNewStock->execute();
            if ($stmtNewStock->affected_rows === 0) {
                throw new Exception("No se pudo insertar el nuevo stock para el producto $productos_almacen_id_productos_almacen");
            }

            // 6. Marcar como despachada la venta pendiente
            $sqlUpdateVND = "UPDATE ventas_no_despachadas SET estado = 1 WHERE id_ventas_no_despachadas = ? AND estado = 2";
            $stmtUpdateVND = $this->cm->prepare($sqlUpdateVND);
            $stmtUpdateVND->bind_param("i", $idventaND);
            $stmtUpdateVND->execute();
            if ($stmtUpdateVND->affected_rows === 0) {
                throw new Exception("No se pudo actualizar estado de la venta no despachada $idventaND.");
            }

            // 7. Confirmar transacción
            $this->cm->commit();

            return [
                "estado" => "ok",
                "mensaje" => "Venta pendiente despachada exitosamente."
            ];

        } catch (Exception $e) {
            $this->cm->rollback();
            return [
                "estado" => "error",
                "mensaje" => $e->getMessage()
            ];
        }
    }


    public function _listar_ventas_no_despachadas($idmd5) {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $sqlVenta = "SELECT 
            vnd.id_ventas_no_despachadas,
            vnd.id_venta,
            vnd.productos_almacen_id_productos_almacen,
            CONCAT(p.codigo, ' - ', p.descripcion) AS producto,
            al.id_almacen,
            al.nombre as almacen,
            vnd.cantidad_pendiente,
            vnd.precio_unitario,
            vnd.categoria,
            vnd.fecha_venta,
            vnd.estado 
            FROM ventas_no_despachadas vnd 
            LEFT JOIN productos_almacen pa ON pa.id_productos_almacen = vnd.productos_almacen_id_productos_almacen
            LEFT JOIN almacen al ON al.id_almacen = pa.almacen_id_almacen
            LEFT JOIN productos p on p.id_productos = pa.productos_id_productos  

            WHERE al.idempresa = ?;";

        $stmtVenta = $this->cm->prepare($sqlVenta);
        $stmtVenta->bind_param("i", $idempresa);
        $stmtVenta->execute();

        $result = $stmtVenta->get_result();

        $ventas = [];
        while ($row = $result->fetch_assoc()) {
            $ventas[] = $row;
        }

        $stmtVenta->close();

        return [
            'status' => 'ok',
            'ventas' => $ventas
        ];
    }


   
    

    /**
     * Registra los diferentes métodos de pago para una venta con pago dividido.
     *
     * @param array $array_pagos Array de objetos de pago.
     * @param int $idventa ID de la venta asociada.
     * @return array Resultado de la operación.
     */
    public function registrarPagosVenta($array_pagos, $idventa)
    {
        $this->cm->begin_transaction();
        try {
            $sql = "INSERT INTO pagoVenta (id_venta, id_canalventa, porcentaje, monto) VALUES (?, ?, ?, ?)";
            $stmt = $this->cm->prepare($sql);
            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta para pagos divididos.");
            }

            foreach ($array_pagos as $pago) {
                $stmt->bind_param("iisd", $idventa, $pago['metodoPago']['value'], $pago['porcentaje'], $pago['monto']);
                $execute_result = $stmt->execute();

                if ($execute_result === false) {
                    throw new Exception("Falló la ejecución para registrar un pago dividido: " . $stmt->error);
                }
            }
            $stmt->close();
            $this->cm->commit();
            return ["estado" => "exito", "mensaje" => "Pagos divididos registrados correctamente."];

        } catch (Exception $e) {
            $this->cm->rollback();
            $this->logger->registrar("registrarPagosVenta", "error", $e->getMessage(), compact('array_pagos', 'idventa'));
            return ["estado" => "error", "mensaje" => $e->getMessage()];
        }
    }

    /**
     * Obtiene y formatea todos los detalles de una venta específica para su visualización.
     *
     * @param int $id ID de la venta.
     * @param string $idmd5 Hash MD5 del ID de la empresa.
     * @return void Imprime una respuesta JSON con los detalles completos.
     */
    public function detalleVenta($id, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if (!$idempresa) {
            echo json_encode(["error" => "Empresa no válida"]);
            return;
        }

        // --- 1. OBTENER DETALLES DE PRODUCTOS DE LA VENTA ---
        $detalleProductos = [];
        $sqlDetalle = "SELECT dve.id_detalle_venta, p.nombre, p.descripcion, p.caracteristicas, dve.cantidad, dve.precio_unitario 
                       FROM detalle_venta dve 
                       LEFT JOIN productos_almacen pa ON dve.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                       LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
                       WHERE dve.venta_id_venta = ?
                       ORDER BY p.nombre DESC";
        $stmtDetalle = $this->cm->prepare($sqlDetalle);
        $stmtDetalle->bind_param("i", $id);
        $stmtDetalle->execute();
        $resultadoDetalle = $stmtDetalle->get_result();
        while ($fila = $resultadoDetalle->fetch_assoc()) {
            $detalleProductos[] = $fila;
        }
        $stmtDetalle->close();

        // --- 2. OBTENER INFORMACIÓN DE LA EMPRESA ---
        $empresaInfo = null;
        $sqlEmpresa = "SELECT idorganizacion as id, nombre, celular, email, logo, direccion FROM organizacion WHERE idorganizacion = ?";
        $stmtEmpresa = $this->em->prepare($sqlEmpresa);
        $stmtEmpresa->bind_param("i", $idempresa);
        $stmtEmpresa->execute();
        $empresaInfo = $stmtEmpresa->get_result()->fetch_assoc();
        $stmtEmpresa->close();
        
        // --- 3. OBTENER INFORMACIÓN PRINCIPAL DE LA VENTA Y CLIENTE ---
        $ventaInfo = null;
        $sqlVenta = "SELECT ve.id_venta as id, c.nombre as cliente, c.nombrecomercial, s.nombre as sucursal, 
                            ve.fecha_venta as fecha, c.direccion, c.nit, c.email, ve.monto_total as montototal, 
                            ve.descuento, ve.id_usuario, ve.tipo_pago as tipopago, di.nombre as divisa, ve.nfactura
                     FROM venta ve
                     INNER JOIN cliente c ON ve.cliente_id_cliente1 = c.id_cliente
                     INNER JOIN sucursal s ON ve.idsucursal = s.id_sucursal
                     INNER JOIN divisas di ON ve.divisas_id_divisas = di.id_divisas
                     WHERE ve.id_venta = ?";
        $stmtVenta = $this->cm->prepare($sqlVenta);
        $stmtVenta->bind_param("i", $id);
        $stmtVenta->execute();
        $ventaInfo = $stmtVenta->get_result()->fetch_assoc();
        $stmtVenta->close();

        if ($ventaInfo) {
            // --- 4. OBTENER INFORMACIÓN DEL USUARIO QUE REALIZÓ LA VENTA ---
            $usuarioInfo = null;
            $idUsuarioVenta = $ventaInfo['id_usuario'];
            $sqlUsuario = "SELECT u.idusuario, u.nombre, c.cargo 
                           FROM usuario u 
                           LEFT JOIN trabajador t ON u.trabajador_idtrabajador = t.idtrabajador
                           LEFT JOIN cargos c ON t.cargos_idcargos = c.idcargos
                           WHERE u.idusuario = ?";
            $stmtUsuario = $this->rh->prepare($sqlUsuario);
            $stmtUsuario->bind_param("i", $idUsuarioVenta);
            $stmtUsuario->execute();
            $usuarioInfo = $stmtUsuario->get_result()->fetch_assoc();
            $stmtUsuario->close();

            // --- 5. CONSTRUIR LA RESPUESTA FINAL ---
            $ventaInfo['detalle'] = $detalleProductos;
            $ventaInfo['usuario'] = $usuarioInfo;
            $ventaInfo['empresa'] = $empresaInfo;

            echo json_encode([$ventaInfo]);
        } else {
            echo json_encode([]); // Venta no encontrada
        }
    }

    function registroCuentaXcobrar($npagos, $valorpago, $tipocredito, $idventa, $fechalimite, $saldo)
    {
        $res = "";
        $registro = $this->cm->query("insert into estado_cobro(id_estado_cobro,Ncuotas,valorcuotas,tipo_credito,estado,venta_id_venta,fecha_limite,saldo) VALUES(null,'$npagos','$valorpago','$tipocredito',1,'$idventa','$fechalimite','$saldo')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "La cuenta por cobrar de venta se registro con exito");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        return $res;
    }
}
