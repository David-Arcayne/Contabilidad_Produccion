<?php
require_once "../db/conexion.php";
class configuracionProductoAlmacen
{
    private $conexion;
    private $cm;
    
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->cm = $this->conexion->cm;
    
    }

    public function registroProductoUnicoAlmacen($stockmin, $stockmax, $detalle, $producto)
    {
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d");

        // Validar que el producto tenga los datos necesarios
        if (!isset($producto['idproducto']) || !isset($producto['idalmacen'])) {
            throw new Exception("Faltan datos del producto o del almacén");
        }

        $idproducto = $producto['idproducto'];
        $idalmacen = $producto['idalmacen'];

        // Iniciar la transacción
        $this->cm->beginTransaction();

        try {
            // Insertar en productos_almacen
            $registro = $this->cm->query("INSERT INTO productos_almacen(
                id_productos_almacen, fecha_registro, estado, stock_minimo, stock_maximo, pais,
                almacen_id_almacen, productos_id_productos)
                VALUES (NULL, '$fecha', '1', '$stockmin', '$stockmax', '$detalle', '$idalmacen', '$idproducto')");

            if ($registro === false) {
                throw new Exception("Error al registrar producto en almacén");
            }

            $ultimoIdInsertado = $this->cm->insert_id;

            // Insertar en stock
            $this->cm->query("INSERT INTO stock(
                id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen)
                VALUES (NULL, '0', '$fecha', 'NUE', '1', '$ultimoIdInsertado')");

            // Insertar en precio_base
            $this->cm->query("INSERT INTO precio_base(
                id_precio_base, precio, fecha, estado, productos_almacen_id_productos_almacen)
                VALUES (NULL, '0', '$fecha', '1', '$ultimoIdInsertado')");

            // Insertar precios sugeridos según los porcentajes definidos para ese almacén
            $categoriafil = $this->cm->query("SELECT p.id_porcentajes FROM porcentajes p WHERE p.almacen_id_almacen = '$idalmacen'");
            if ($categoriafil != 0) {
                while ($xcv = $this->cm->fetch($categoriafil)) {
                    $idporcentaje = $xcv[0];
                    $this->cm->query("INSERT INTO precio_sugerido(
                        id_precio_sugerido, precio, productos_almacen_id_productos_almacen, porcentajes_id_porcentajes)
                        VALUES (NULL, '0', '$ultimoIdInsertado', '$idporcentaje')");
                }
            }

            // Confirmar la transacción
            $this->cm->commitTransaction();

            // Respuesta de éxito
            $res = array("estado" => "exito", "mensaje" => "Producto registrado con éxito", "idalmacen" => $idalmacen);
            echo json_encode($res);

        } catch (Exception $e) {
            // Revertir la transacción si ocurre un error
            $this->cm->rollbackTransaction();

            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }
    public function obtenerPrimerIdAlmacenPorEmpresa($idEmpresa)
    {
        $query = "SELECT id_almacen FROM almacen WHERE idempresa = ? ORDER BY id_almacen ASC LIMIT 1";
        $stmt = $this->cm->prepare($query);
        $stmt->bind_param("i", $idEmpresa); // 'i' para integer
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            return $row['id_almacen'];
        } else {
            return null; // No se encontró ningún almacén para esa empresa
        }
    }



}
