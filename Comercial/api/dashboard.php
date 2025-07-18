<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "facturacion.php";

class Dashboard
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

    // Función de listado de almacenes
    public function productos_preferidos($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        // Verificamos que se obtuvo un ID válido
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }

        // Consulta SQL
        $consulta = "SELECT 
                        p.id_productos, 
                        p.descripcion, 
                        p.codigo,
                        SUM(dv.cantidad) AS total_vendido
                    FROM detalle_venta dv
                    INNER JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                    INNER JOIN productos p ON p.id_productos = pa.productos_id_productos
                    WHERE a.idempresa = ?
                    GROUP BY p.id_productos, p.codigo 
                    ORDER BY total_vendido DESC LIMIT 10;";

        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);

        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // Vincular parámetros
        $stmt->bind_param("i", $idempresa);

        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }

        // Obtener resultado
        $result = $stmt->get_result();

        if (!$result) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
            $stmt->close();
            return;
        }

        // Procesar resultados
        while ($lst = $result->fetch_assoc()) {
            $lista[] = [
                "id_productos" => $lst['id_productos'],
                "nombre" => $lst['descripcion'],
                "codigo" => $lst['codigo'],
                "total_vendido" => $lst['total_vendido']
            ];
        }

        // Liberar recursos
        $stmt->close();

        // Devolver datos en JSON
        echo json_encode($lista);
    }
    public function productos_mayor_venta_monetario($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        // Verificamos que se obtuvo un ID válido
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }

        // Consulta SQL
        $consulta = "SELECT 
                        p.id_productos, 
                        p.descripcion, 
                        p.codigo,
                         SUM(dv.precio_unitario * dv.cantidad) AS precio,
                         SUM(dv.cantidad) AS total_vendido
                    FROM detalle_venta dv
                    INNER JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                    INNER JOIN productos p ON p.id_productos = pa.productos_id_productos
                    WHERE a.idempresa = ?
                    GROUP BY p.id_productos, p.codigo 
                    ORDER BY total_vendido DESC LIMIT 10;";

        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);

        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // Vincular parámetros
        $stmt->bind_param("i", $idempresa);

        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }

        // Obtener resultado
        $result = $stmt->get_result();

        if (!$result) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
            $stmt->close();
            return;
        }

        // Procesar resultados
        while ($lst = $result->fetch_assoc()) {
            $lista[] = [
                "id_productos" => $lst['id_productos'],
                "nombre" => $lst['descripcion'],
                "codigo" => $lst['codigo'],
                "total_vendido" => $lst['total_vendido'],
                "precio" => $lst['precio']
            ];
        }

        // Liberar recursos
        $stmt->close();

        // Devolver datos en JSON
        echo json_encode($lista);
    }
    public function ventas_porCategoria($idmd5)
    {
        $a = "  ";

        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        // Verificamos que se obtuvo un ID válido
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }

        // Consulta SQL
        $consulta = "SELECT 
                    c.id_categorias AS id_categoria,
                    c.nombre AS categoria,
                    s.id_categorias AS id_subcategoria,
                    s.nombre AS subcategoria,
                    COALESCE(SUM(dv.cantidad), 0) AS total_ventas
                    FROM categorias c
                    LEFT JOIN categorias s ON s.idp = c.id_categorias
                    LEFT JOIN productos p ON p.categorias_id_categorias IN (c.id_categorias, s.id_categorias)
                    LEFT JOIN productos_almacen pa ON pa.productos_id_productos = p.id_productos
                    LEFT JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                    LEFT JOIN detalle_venta dv ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    WHERE c.idp = 0 AND c.id_empresa = ? AND (a.idempresa = ? OR a.idempresa IS NULL)
                    GROUP BY c.id_categorias, c.nombre, s.id_categorias, s.nombre
                    ORDER BY c.id_categorias, s.id_categorias;";

        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);

        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // Vincular parámetros
        $stmt->bind_param("ii", $idempresa,$idempresa);

        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }

        // Obtener resultado
        $result = $stmt->get_result();

        if (!$result) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
            $stmt->close();
            return;
        }

        // Procesar resultados
        while ($lst = $result->fetch_assoc()) {
            $lista[] = [
                "id_categoria" => $lst['id_categoria'],
                "categoria" => $lst['categoria'],
                "id_subcategoria" => $lst['id_subcategoria'],
                "subcategoria" => $lst['subcategoria'],
                "total_ventas" => $lst['total_ventas'],
            ];
        }

        // Liberar recursos
        $stmt->close();

        // Devolver datos en JSON
        echo json_encode($lista);
    }

    public function stock_bajos($idmd5_e, $idmd5_u)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5_e);
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5_u);
        
        // Verificamos que se obtuvo un ID válido
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }
        if (!$idusuario || !is_numeric($idusuario)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de usuario inválido"]);
            return;
        }
        // Consulta SQL
        $consulta = "SELECT p.id_productos, 
                    a.id_almacen,
                    a.nombre AS almacen, 
                    pa.stock_minimo, 
                    pa.stock_maximo, 
                    p.codigo, 
                    p.descripcion AS producto, 
                    s.cantidad AS stock  
                    FROM (
                        SELECT productos_almacen_id_productos_almacen, cantidad,
                            ROW_NUMBER() OVER (PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
                        FROM stock
                        WHERE estado = '1'
                    ) AS s
                    INNER JOIN productos_almacen pa ON s.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                    INNER JOIN productos p ON p.id_productos = pa.productos_id_productos
                    INNER JOIN responsablealmacen ra ON ra.almacen_id_almacen = a.id_almacen
                    INNER JOIN responsable re ON re.id_responsable = ra.responsable_id_responsable
                    WHERE a.idempresa = ? 
                    AND re.id_usuario = ? 
                    AND s.rn = 1; 
                    ";

        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);

        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // Vincular parámetros
        $stmt->bind_param("ii", $idempresa,$idusuario);

        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }

        // Obtener resultado
        $result = $stmt->get_result();

        if (!$result) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
            $stmt->close();
            return;
        }

        // Procesar resultados
        while ($lst = $result->fetch_assoc()) {
            $lista[] = [
                "id_productos" => $lst['id_productos'],
                "id_almacen" => $lst['id_almacen'],
                "almacen" => $lst['almacen'],
                "stock_minimo" => $lst['stock_minimo'],
                "stock_maximo" => $lst['stock_maximo'],
                "codigo" => $lst['codigo'],
                "producto" => $lst['producto'],
                "stock" => $lst['stock'],
            ];
        }

        // Liberar recursos
        $stmt->close();

        // Devolver datos en JSON
        echo json_encode($lista);
    }
    public function stock_productos_dashboard($idmd5_e, $idmd5_u)
    {
        

        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5_e);
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5_u);
        
        // Verificamos que se obtuvo un ID válido
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }
        if (!$idusuario || !is_numeric($idusuario)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de usuario inválido"]);
            return;
        }
        // Consulta SQL
        $consulta = "SELECT p.id_productos, 
                    a.nombre AS almacen, 
                    p.codigo, 
                    p.descripcion AS producto, 
                    s.cantidad AS stock  
                    FROM (
                        SELECT productos_almacen_id_productos_almacen, cantidad,
                            ROW_NUMBER() OVER (PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
                        FROM stock
                        WHERE estado = '1'
                    ) AS s
                    INNER JOIN productos_almacen pa ON s.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                    INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                    INNER JOIN productos p ON p.id_productos = pa.productos_id_productos
                    INNER JOIN responsablealmacen ra ON ra.almacen_id_almacen = a.id_almacen
                    INNER JOIN responsable re ON re.id_responsable = ra.responsable_id_responsable
                    WHERE a.idempresa = ? 
                    AND re.id_usuario = ? 
                    AND s.rn = 1; 
                    ";

        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);

        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }

        // Vincular parámetros
        $stmt->bind_param("ii", $idempresa,$idusuario);

        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }

        // Obtener resultado
        $result = $stmt->get_result();

        if (!$result) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
            $stmt->close();
            return;
        }

        // Procesar resultados
        while ($lst = $result->fetch_assoc()) {
            $lista[] = [
                "id_productos" => $lst['id_productos'],
                "almacen" => $lst['almacen'],
                "codigo" => $lst['codigo'],
                "producto" => $lst['producto'],
                "stock" => $lst['stock'],
            ];
        }

        // Liberar recursos
        $stmt->close();

        // Devolver datos en JSON
        echo json_encode($lista);
    }

    public function mayor_compra($idmd5_e, $idmd5_u) {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5_e);
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5_u);
    
        // Verificar que se obtuvieron IDs válidos
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }
        if (!$idusuario || !is_numeric($idusuario)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de usuario inválido"]);
            return;
        }
    
        // Obtener fechas
        $fecha_fin = date('Y-m-d'); // Hoy
        $fecha_ini = date('Y-m-d', strtotime('-60 days')); // 60 días atrás
    
        // Consulta SQL
        $consulta = "SELECT 
                        c.id_cliente, 
                        v.id_venta, 
                        a.id_almacen, 
                        c.nombre, 
                        v.fecha_venta, 
                        SUM(v.monto_total) AS total, 
                        COUNT(v.id_venta) AS cantidad 
                     FROM venta v
                     INNER JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
                     INNER JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                     INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                     INNER JOIN cliente c ON c.id_cliente = v.cliente_id_cliente1
                     INNER JOIN responsablealmacen ra ON ra.almacen_id_almacen = a.id_almacen
                     INNER JOIN responsable re ON re.id_responsable = ra.responsable_id_responsable
                     WHERE a.idempresa = ? AND re.id_usuario = ? 
                     AND v.fecha_venta BETWEEN ? AND ?
                     GROUP BY c.id_cliente, v.id_venta, a.id_almacen
                     ORDER BY total DESC ";
    
        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);
        
        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }
    
        // Vincular parámetros
        $stmt->bind_param("iiss", $idempresa, $idusuario, $fecha_ini, $fecha_fin);
    
        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }
    
        // Obtener resultado
        $result = $stmt->get_result();
    
        if ($result) {
            // Procesar resultados
            while ($lst = $result->fetch_assoc()) {
                $lista[] = [
                    "id_cliente" => $lst['id_cliente'],
                    "id_venta" => $lst['id_venta'],
                    "id_almacen" => $lst['id_almacen'],
                    "nombre" => $lst['nombre'],
                    "fecha_venta" => $lst['fecha_venta'],
                    "total" => $lst['total'],
                    "cantidad" => $lst['cantidad'],
                ];
            }
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
        }
    
        // Liberar recursos
        $stmt->close();
    
        // Devolver datos en JSON
        echo json_encode($lista);
    }
    public function mayor_frecuencia_decompra($idmd5_e, $idmd5_u) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5_e);
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5_u);
    
        // Verificar que se obtuvieron IDs válidos
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }
        if (!$idusuario || !is_numeric($idusuario)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de usuario inválido"]);
            return;
        }
    
        
    
        // Consulta SQL
        $consulta = "SELECT 
                        c.id_cliente, 
                        a.id_almacen, 
                        a.nombre AS almacen, 
                        c.nombre, 
                        v.fecha_venta, 
                        SUM(v.monto_total) AS total, 
                        COUNT(v.id_venta) AS cantidad 
                     FROM venta v
                     INNER JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
                     INNER JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                     INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                     INNER JOIN cliente c ON c.id_cliente = v.cliente_id_cliente1
                     INNER JOIN responsablealmacen ra ON ra.almacen_id_almacen = a.id_almacen
                     INNER JOIN responsable re ON re.id_responsable = ra.responsable_id_responsable
                     WHERE a.idempresa = ? AND re.id_usuario = ? 
                     GROUP BY c.id_cliente, a.id_almacen
                     ORDER BY cantidad DESC, total DESC;";
    
        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);
        
        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }
    
        // Vincular parámetros
        $stmt->bind_param("ii", $idempresa, $idusuario);
    
        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }
    
        // Obtener resultado
        $result = $stmt->get_result();
    
        if ($result) {
            // Procesar resultados
            while ($lst = $result->fetch_assoc()) {
                $lista[] = [
                    "id_cliente" => $lst['id_cliente'],
                    "id_almacen" => $lst['id_almacen'],
                    "almacen" => $lst['almacen'],
                    "nombre" => $lst['nombre'],
                    "fecha_venta" => $lst['fecha_venta'],
                    "total" => $lst['total'],
                    "cantidad" => $lst['cantidad'],
                ];
            }
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
        }
    
        // Liberar recursos
        $stmt->close();
    
        // Devolver datos en JSON
        echo json_encode($lista);
    }

    public function fechas_venta_cliente($idmd5_e, $idmd5_u){
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5_e);
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5_u);
    
        // Verificar que se obtuvieron IDs válidos
        if (!$idempresa || !is_numeric($idempresa)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }
        if (!$idusuario || !is_numeric($idusuario)) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de usuario inválido"]);
            return;
        }
    
        
    
        // Consulta SQL
        $consulta = "SELECT 
                        c.id_cliente, 
                        c.telefono,
                        c.nombre, 
                        GROUP_CONCAT(v.fecha_venta ORDER BY v.fecha_venta ASC) AS fechas_ventas
                        FROM venta v    
                        INNER JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
                        INNER JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                        INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                        INNER JOIN cliente c ON c.id_cliente = v.cliente_id_cliente1
                        INNER JOIN responsablealmacen ra ON ra.almacen_id_almacen = a.id_almacen
                        INNER JOIN responsable re ON re.id_responsable = ra.responsable_id_responsable
                        WHERE a.idempresa = ? 
                        AND re.id_usuario = ? 
                        GROUP BY c.id_cliente;";
    
        // Preparar la consulta
        $stmt = $this->cm->prepare($consulta);
        
        if (!$stmt) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al preparar la consulta: " . $this->cm->error]);
            return;
        }
    
        // Vincular parámetros
        $stmt->bind_param("ii", $idempresa, $idusuario);
    
        // Ejecutar consulta
        if (!$stmt->execute()) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta: " . $stmt->error]);
            $stmt->close();
            return;
        }
        // Obtener resultado
        $result = $stmt->get_result();
        if ($result) {
            // Procesar resultados
            while ($lst = $result->fetch_assoc()) {
                $lista[] = [
                    "id_cliente" => $lst['id_cliente'],
                    "telefono" => $lst['telefono'],
                    "nombre" => $lst['nombre'],
                    "fechas_ventas" => $lst['fechas_ventas']
                ];
            }
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "Error al obtener los resultados"]);
        }
        // Liberar recursos
        $stmt->close();    
        // Devolver datos en JSON
        echo json_encode($lista);
    }
}
?>
