<?php
require_once __DIR__ . '/vendor/autoload.php';

require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";





/**
 * Clase para gestionar las operaciones de ventas, facturación y stock. idproductoalmacen id datosAdicionales
 */
class ProductoVariante
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $prod;
    private $conexion;
    private $verificar;
    private $factura;
    private $logger;

    
    /**
     * Constructor de la clase Ventas.
     */
    public function __construct()
    {
        $this->conexion = Conexion::getInstance();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->logger = new LogErrores();

        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        $this->prod = $this->conexion->prod;

    }

    // ini_set('display_errors', 1);
    // ini_set('display_startup_errors', 1);
    // error_reporting(E_ALL);


    public function cargarDesdeExcel() {

        try {

            if (!isset($_FILES['file'])) {
                throw new Exception('No se recibió ningún archivo');
            }

            $archivo = $_FILES['file'];
            $empresa = $_POST['empresa'];
            if ($archivo['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('Error al subir el archivo');
            }

            $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
            if ($extension !== 'csv') {
                throw new Exception('Formato no soportado. El archivo debe ser CSV');
            }

            $filas = $this->leerCSV($archivo['tmp_name']);
            if (count($filas) < 2) {
                throw new Exception('El archivo está vacío');
            }

            $encabezados = array_shift($filas);
            $items = $this->procesarFilasExcel($encabezados, $filas);

            $batchSize = 200;
            $lotes = array_chunk($items, $batchSize);
            $resultados = [];

            foreach ($lotes as $indiceLote => $lote) {
                
                try {
                    foreach ($lote as $item) {
                        $this->registrarProductoVarianteExcel($item);
                    }
                    
                    $resultados[] = [
                        'status' => 'success',
                        'message' => "registro existoso"
                    ];
                } catch (Exception $e) {
                   
                    $resultados[] = [
                        'status' => 'error',
                        'message' => "Error en lote " . ($indiceLote + 1) . ": " . $e->getMessage()
                    ];
                }
            }

            echo json_encode(['resultados' => $resultados]);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * Lee un archivo CSV y devuelve un array similar a toArray() de PhpSpreadsheet.
     * Cada fila será un array asociativo con claves 'A', 'B', 'C', ... (letras de columna).
     */
    private function leerCSV($rutaArchivo) {
        $filas = [];
        $manejador = fopen($rutaArchivo, 'r');

        if (!$manejador) {
            throw new Exception('No se pudo abrir el archivo CSV');
        }

        // Leer la primera línea para detectar el delimitador
        $primeraLinea = fgets($manejador);
        if ($primeraLinea === false) {
            fclose($manejador);
            return $filas;
        }

        // Contar ocurrencias de coma y punto y coma
        $numComas = substr_count($primeraLinea, ',');
        $numPuntoComa = substr_count($primeraLinea, ';');

        // Elegir el que tenga más ocurrencias
        $delimitador = ($numPuntoComa > $numComas) ? ';' : ',';

        // Rebobinar para leer desde el principio
        rewind($manejador);

        $primeraFila = true;

        while (($fila = fgetcsv($manejador, 0, $delimitador, '"', '\\')) !== false) {
            if ($primeraFila && isset($fila[0])) {
                // Eliminar BOM (Byte Order Mark) si existe
                $fila[0] = preg_replace('/^\xEF\xBB\xBF/', '', $fila[0]);
                $primeraFila = false;
            }

            // Limpiar cada celda: quitar espacios y filtrar vacías (opcional)
            $filaLimpia = [];
            foreach ($fila as $valor) {
                $valorLimpio = trim($valor);
                // Puedes omitir celdas vacías, pero es mejor conservarlas para no alterar índices
                $filaLimpia[] = $valorLimpio;
            }

            $filas[] = $filaLimpia;
        }

        fclose($manejador);
        return $filas;
    }
    
    private function procesarFilasExcel($encabezados, $filas) {
        // Mapear índices de columnas
        $mapa = [];
        foreach ($encabezados as $indice => $nombre) {
            $mapa[strtolower(trim((string)$nombre))] = $indice;
        }

        // // Validar columnas obligatorias
        // $requeridos = [
        //     'idproducto',
        //     'productos_almacen_id_productos_almacen',
        //     'costo_unitario',
        //     'cantidad',
        //     'sku'
        // ];

        // foreach ($requeridos as $req) {
        //     if (!isset($mapa[$req])) {
        //         throw new Exception("Falta la columna requerida: $req");
        //     }
        // }

        $items = [];

        foreach ($filas as $fila) {
            $item = [
                'fecha' => $fila[$mapa['fecha']] ?? null,
                'dolar' => $fila[$mapa['dolar']] ?? null,
                'ufv' => $fila[$mapa['ufv']] ?? null
            ];

            $items[] = $item;
        }

        return $items;
    }

    

    public function registrarProductoVarianteExcel($data) {
        $mysqli = $this->prod; // Usar base de datos de producción

        try {
            if ($manejarTransaccion) {
                $mysqli->begin_transaction();
            }

            $id_producto = $data['idproducto'] ?? null;
            $sku = $data['sku'] ?? null;
            $costo_unitario = $data['costo_unitario'] ?? null;
            $codigo_barras = $data['codigo_barras'] ?? null; // opcional
            $atributos = $data['atributos'] ?? [];

            if (empty($id_producto) || empty($sku)) {
                throw new Exception('idproducto y sku son obligatorios');
            }

            // Procesar atributos y recolectar IDs de valores para verificar duplicados
            $idsValoresAtributos = [];
            $atributosProcesados = [];

            foreach ($atributos as $atributo) {
                $nombreAtributo = $this->verificar->normalizar_nombre($atributo['atributo'] ?? '') ?? null;
                $valorAtributo  = $this->verificar->normalizar_nombre($atributo['valor'] ?? '') ?? null;

                if (empty($nombreAtributo) || empty($valorAtributo)) {
                    continue;
                }

                // Buscar o crear en Atributo_producto
                $sqlCheckAtributo = "SELECT id_Atributo_producto FROM Atributo_producto 
                                    WHERE nombre = ? AND idempresa = ?";
                $stmtAtributo = $mysqli->prepare($sqlCheckAtributo);
                $stmtAtributo->bind_param("si", $nombreAtributo, $idempresa);
                $stmtAtributo->execute();
                $resultAtributo = $stmtAtributo->get_result();
                $rowAtributo = $resultAtributo->fetch_assoc();
                $stmtAtributo->close();

                if ($rowAtributo) {
                    $idAtributo = $rowAtributo['id_Atributo_producto'];
                } else {
                    $sqlInsertAtributo = "INSERT INTO Atributo_producto (nombre, tipo_dato, idempresa) 
                                        VALUES (?, 'texto', ?)";
                    $stmtInsertAtributo = $mysqli->prepare($sqlInsertAtributo);
                    $stmtInsertAtributo->bind_param("si", $nombreAtributo, $idempresa);
                    $stmtInsertAtributo->execute();
                    $idAtributo = $stmtInsertAtributo->insert_id;
                    $stmtInsertAtributo->close();
                }

                // Buscar o crear en Valor_Atributo
                $sqlCheckValor = "SELECT id_Valor_Atributo FROM Valor_Atributo 
                                WHERE id_Atributo_producto = ? AND valor = ?";
                $stmtValor = $mysqli->prepare($sqlCheckValor);
                $stmtValor->bind_param("is", $idAtributo, $valorAtributo);
                $stmtValor->execute();
                $resultValor = $stmtValor->get_result();
                $rowValor = $resultValor->fetch_assoc();
                $stmtValor->close();

                if ($rowValor) {
                    $idValorAtributo = $rowValor['id_Valor_Atributo'];
                } else {
                    $sqlInsertValor = "INSERT INTO Valor_Atributo (id_Atributo_producto, valor, orden) 
                                    VALUES (?, ?, 0)";
                    $stmtInsertValor = $mysqli->prepare($sqlInsertValor);
                    $stmtInsertValor->bind_param("is", $idAtributo, $valorAtributo);
                    $stmtInsertValor->execute();
                    $idValorAtributo = $stmtInsertValor->insert_id;
                    $stmtInsertValor->close();
                }

                $idsValoresAtributos[] = $idValorAtributo;
                $atributosProcesados[] = [
                    'id_Atributo_producto' => $idAtributo,
                    'id_Valor_Atributo'    => $idValorAtributo
                ];
            }

            // Verificar si ya existe una variante con el mismo idproducto y el mismo conjunto de valores
            if (!empty($idsValoresAtributos)) {
                $existe = $this->existeVarianteDuplicada($mysqli, $id_producto, $idsValoresAtributos);
                if ($existe) {
                    throw new Exception("Ya existe un producto variante con el mismo producto y los mismos atributos. No se puede registrar.");
                }
            }

            // Insertar en Producto_Variante
            $sqlInsert = "INSERT INTO Producto_Variante (idproducto, sku, precio_base, codigo_barras, activo) 
                        VALUES (?, ?, ?, ?, 1)";
            $stmtInsert = $mysqli->prepare($sqlInsert);
            if (!$stmtInsert) {
                throw new Exception('Error preparando inserción de variante: ' . $mysqli->error);
            }

            $precioBase = $costo_unitario !== null ? $costo_unitario : 0.0;
            $codigoBarras = $codigo_barras ?? '';
            $stmtInsert->bind_param("isds", $id_producto, $sku, $precioBase, $codigoBarras);
            // Nota: el tipo "isds" asume $id_producto int, $sku string, $precioBase double, $codigoBarras string.
            // Ajustar si los tipos difieren.

            if (!$stmtInsert->execute()) {
                throw new Exception('Error al insertar producto variante: ' . $stmtInsert->error);
            }
            $idProductoVariante = $stmtInsert->insert_id;
            $stmtInsert->close();

            // Insertar relaciones en Variante_Valor
            foreach ($atributosProcesados as $attr) {
                $sqlRelacion = "INSERT INTO Variante_Valor (id_Producto_Variante, id_Valor_Atributo) 
                                VALUES (?, ?)";
                $stmtRelacion = $mysqli->prepare($sqlRelacion);
                $stmtRelacion->bind_param("ii", $idProductoVariante, $attr['id_Valor_Atributo']);
                $stmtRelacion->execute();
                $stmtRelacion->close();
            }

            if ($manejarTransaccion) {
                $mysqli->commit();
            }

            return true;

        } catch (Exception $e) {
            if ($manejarTransaccion) {
                $mysqli->rollback();
            }
            throw $e;
        }
    }

    public function importar_tipodecambio($item,$empresa) 
    {
        ini_set('display_errors', 1); 
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
        $res = "";
        $ide = $this->getidempresa($empresa);

        // $filePath = $tipoCambio_excel['tmp_name'];

        // // Usa PhpSpreadsheet para leer el archivo
        

        // $spreadsheet = IOFactory::load($filePath);
        // $sheet = $spreadsheet->getActiveSheet();
        // $rows = $sheet->toArray();
        // $registro = $this->dbc->query("INSERT INTO tipodecambio(idtipodecambio,dolar,ufv,fecha,idorganizacion)VALUES(NULL,'$dolar','$ufv','$fecha','$ide')");

        $existe_vinculacion_act = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_actual = '$ide'");

        $existe_vinculacion_vinc = $this->dbc->query("SELECT * FROM vinculacion_empresas WHERE idempresa_vinculada = '$ide'");

        if($existe_vinculacion_act->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA ORIGINAL
            $ve = $existe_vinculacion_act->fetch_assoc();

                $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipodecambio WHERE fecha = '$item[fecha]' AND idorganizacion = '$ide'");
                $resultado = $consulta->fetch_assoc();
                $totalRegistros = $resultado['total'];

                if ($totalRegistros > 0) {
                    //SOLO SALTAS YA QUE SI EXISTE EL REGISTRO
                } else {
                    $registro_empr_vinc = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$item[dolar]','$item[ufv]','$item[fecha]','$ve[idempresa_vinculada]')");

                    $registro_empr_act = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$item[dolar]','$item[ufv]','$item[fecha]','$ide')");
                }
            

        }elseif($existe_vinculacion_vinc->num_rows > 0){ // EL REGISTRO SE HARA DESDE LA EMPRESA VINCULADA 
            $ve = $existe_vinculacion_vinc->fetch_assoc();

                $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipodecambio WHERE fecha = '$item[fecha]' AND idorganizacion = '$ide'");
                $resultado = $consulta->fetch_assoc();
                $totalRegistros = $resultado['total'];

                if ($totalRegistros > 0) {
                    //SOLO SALTAS YA QUE SI EXISTE EL REGISTRO
                } else {
                    $registro_empr_act = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$item[dolar]','$item[ufv]','$item[fecha]','$ve[idempresa_actual]')");

                    $registro_empr_vinc = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$item[dolar]','$item[ufv]','$item[fecha]','$ide')");
                }
            

        }else{ // EL REGISTRO SE HARA SOLO EN LA EMPRESA ORIGINAL PORQUE NO TIENE VINCULACION CON NINGUNA EMPRESA

                $consulta = $this->dbc->query("SELECT COUNT(*) AS total FROM tipodecambio WHERE fecha = '$item[fecha]' AND idorganizacion = '$ide'");
                $resultado = $consulta->fetch_assoc();
                $totalRegistros = $resultado['total'];

                if ($totalRegistros > 0) {
                    //SOLO SALTAS YA QUE SI EXISTE EL REGISTRO
                } else {
                    $registro_empr_act = $this->dbc->query("INSERT INTO tipodecambio(dolar,ufv,fecha,idorganizacion)VALUES('$item[dolar]','$item[ufv]','$item[fecha]','$ide')");
                }
            
        }

        if ($registro_empr_act === TRUE) {
            $res = array("success", "Se registro Correctamente", "registrotipocambio");
        } else {
            $res = array("danger", "No se pudo realizar el registro");
        }

        
        echo json_encode($res);
    }
}

