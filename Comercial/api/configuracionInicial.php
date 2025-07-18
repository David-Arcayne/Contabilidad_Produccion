<?php

require_once "../db/conexion.php";
require_once "funciones.php";
require_once "facturacion.php";
require_once "logErrores.php";

class ConfiguracionInicial
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $em;
    private $logger;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        $this->logger = new LogErrores();
    }

    // Función para crear un tipo de almacén
    public function crearTipoAlmacen($idempresa, $tipo_almacen, $descripcion, $estado): int
    {
        $query = "INSERT INTO tipo_almacen (tipo_almacen, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
        $stmt = $this->cm->prepare($query);
        $stmt->bind_param("ssii", $tipo_almacen, $descripcion, $estado, $idempresa);

        if ($stmt->execute()) {
            return $stmt->insert_id; // Devuelve el ID del nuevo registro
        } else {
            return 0; // Devuelve 0 si hubo un error
        }
    }
    public function registrarDivisa($nombre, $tipo_divisa, $estado, $idempresa, $monedasin): int
    {
        $query = "INSERT INTO divisas (nombre, tipo_divisa, estado, idempresa, monedasin) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("ssiii", $nombre, $tipo_divisa, $estado, $idempresa, $monedasin);

        if ($stmt->execute()) {
            return $stmt->insert_id; // Devuelve el ID del nuevo registro
        } else {
            return 0; // Devuelve 0 si hubo un error
        }
    }
    public function registrarLeyendaProforma($texto, $estado, $idempresa):int
    {
        $query = "INSERT INTO condiciones (texto, estado, idempresa) VALUES (?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("sii", $texto, $estado, $idempresa);

        if ($stmt->execute()) {
            return $stmt->insert_id; // Devuelve el ID del nuevo registro
        } else {
            return 0; // Devuelve 0 si hubo un error
        }
    }
    public function registrarCategoriasProducto($id_empresa): int
    {
        // Validar ID de empresa
        if (!is_numeric($id_empresa) || $id_empresa <= 0) {
            error_log("ID de empresa inválido: " . $id_empresa);
            return 0;
        }

        // Leer archivo JSON
        $jsonString = @file_get_contents('Jcategorias.json');
        if ($jsonString === false) {
            error_log("No se pudo leer el archivo Jcategorias.json");
            return 0;
        }

        // Decodificar JSON
        $datos = json_decode($jsonString);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error decodificando JSON: " . json_last_error_msg());
            return 0;
        }

        // Verificar estructura de datos
        if (!isset($datos->categorias)) {
            error_log("Estructura JSON inválida - no se encontró el campo 'categorias'");
            return 0;
        }

        $success = true;
        $estado = 1; // Estado activo

        foreach ($datos->categorias as $categoria) {
            // Validar categoría principal
            if (!isset($categoria->nombre, $categoria->descripcion, $categoria->subcategorias)) {
                error_log("Estructura de categoría inválida");
                $success = false;
                break;
            }

            // Insertar categoría principal
            $query = "INSERT INTO categorias (nombre, descripcion, estado, id_empresa, idp) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            
            if (!$stmt) {
                error_log("Error preparando consulta de categoría: " . $this->conexion->cm->error);
                $success = false;
                break;
            }

            $idp = 0; // Categoría padre (0 para categorías principales)
            $stmt->bind_param("sssii", $categoria->nombre, $categoria->descripcion, $estado, $id_empresa, $idp);

            if (!$stmt->execute()) {
                error_log("Error insertando categoría: " . $stmt->error);
                $stmt->close();
                $success = false;
                break;
            }

            $id_categoria = $stmt->insert_id;
            $stmt->close();

            // Insertar subcategorías
            foreach ($categoria->subcategorias as $subcategoria) {
                // Validar subcategoría
                if (!isset($subcategoria->nombre, $subcategoria->descripcion)) {
                    error_log("Estructura de subcategoría inválida");
                    $success = false;
                    break 2; // Salir de ambos bucles
                }

                $query = "INSERT INTO categorias (nombre, descripcion, estado, id_empresa, idp) VALUES (?, ?, ?, ?, ?)";
                $stmt = $this->conexion->cm->prepare($query);
                
                if (!$stmt) {
                    error_log("Error preparando consulta de subcategoría: " . $this->conexion->cm->error);
                    $success = false;
                    break 2;
                }

                $stmt->bind_param("sssii", $subcategoria->nombre, $subcategoria->descripcion, $estado, $id_empresa, $id_categoria);

                if (!$stmt->execute()) {
                    error_log("Error insertando subcategoría: " . $stmt->error);
                    $stmt->close();
                    $success = false;
                    break 2;
                }
                
                $stmt->close();
            }
        }

        return $success ? 1 : 0;
    }
    public function registrarEstadosProducto($id_empresa):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $jsonString = @file_get_contents('JestadosProductos.json');
        if($jsonString === false){
            error_log("NO se pudo leer el archivo JestadosProductos.json");
            return 0;
        }
        $datos = json_decode($jsonString);
        if(json_last_error() !== JSON_ERROR_NONE){
            error_log('Error decodificando Json: '. json_last_error_msg());
            return 0;
        }
        if(!isset($datos->EstadosProductos)){
            error_log("Estructura JSON inválida no se encontro el campo 'EstadosProductos'");
            return 0;
        }
        $success = true;
        $estado = 1;
        foreach($datos->EstadosProductos as $estProd){
            if(!isset($estProd->tipo_estado,$estProd->descripcion)){
                error_log("Estructura de Estado producto inválida");
                $success = false;
                break;
            }

            $query = "INSERT INTO estados_productos (tipos_estado, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$estProd->tipo_estado,$estProd->descripcion,$estado,$id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;

    }
    public function registrar_unidades_de_medidas($id_empresa):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $jsonString = @file_get_contents('Junidades.json');
        if($jsonString === false){
            error_log("NO se pudo leer el archivo Junidades");
            return 0;
        }
        $datos = json_decode($jsonString);
        if(json_last_error() !== JSON_ERROR_NONE){
            error_log('Error decodificando Json: '. json_last_error_msg());
            return 0;
        }
        if(!isset($datos->unidades)){
            error_log("Estructura JSON inválida no se encontro el campo 'unidades'");
            return 0;
        }
        $success = true;
        $estado = 1;
        foreach($datos->unidades as $unidad){
            if(!isset($unidad->nombre,$unidad->descripcion)){
                error_log("Estructura de unidad json inválida");
                $success = false;
                break;
            }

           
            $query = "INSERT INTO unidad (nombre, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$unidad->nombre,$unidad->descripcion,$estado,$id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;

    }
    public function registrar_caracterisitcas($id_empresa):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $jsonString = @file_get_contents('Jcaracteristicas.json');
        if($jsonString === false){
            error_log("NO se pudo leer el archivo Jcaracteristicas,json");
            return 0;
        }
        $datos = json_decode($jsonString);
        if(json_last_error() !== JSON_ERROR_NONE){
            error_log('Error decodificando Json: '. json_last_error_msg());
            return 0;
        }
        if(!isset($datos->caracteristicas_productos)){
            error_log("Estructura JSON inválida no se encontro el campo 'caracteristicas_productos'");
            return 0;
        }
        $success = true;
        $estado = 1;
        foreach($datos->caracteristicas_productos as $caracteristica){
            if(!isset($caracteristica->nombre_medida,$caracteristica->descripcion)){
                error_log("Estructura de caracteristicas_productos json inválida");
                $success = false;
                break;
            }
            $query = "INSERT INTO medida (nombre_medida, descripcion, estado, id_empresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$caracteristica->nombre_medida,$caracteristica->descripcion,$estado,$id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;

    }
    public function registrar_parametros_obsolescencia($id_empresa):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            error_log("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $jsonString = @file_get_contents('Jparemetros.json');
        if($jsonString === false){
            error_log("NO se pudo leer el archivo Jparemetros");
            return 0;
        }
        $datos = json_decode($jsonString);
        if(json_last_error() !== JSON_ERROR_NONE){
            error_log('Error decodificando Json: '. json_last_error_msg());
            return 0;
        }
        if(!isset($datos->parametros_obsolescencia)){
            error_log("Estructura JSON inválida no se encontro el campo 'parametros_obsolescencia'");
            return 0;
        }
        $success = true;
        $estado = 1;

        foreach($datos->parametros_obsolescencia as $parametros){
            if(!isset($parametros->nombre,$parametros->valor,$parametros->color)){
                error_log("Estructura de parametros json inválida");
                $success = false;
                break;
            }

           
            $query = "INSERT INTO medidores (nombre, valor, color, tipo, idempresa) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);
            if(!$stmt){
                error_log("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("sdsii", $parametros->nombre, $parametros->valor, $parametros->color, $estado, $id_empresa);

            if(!$stmt->execute()){
                error_log("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;
    }
    public function registrar_tipos_clientes($id_empresa):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            echo("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $jsonString = @file_get_contents('Jtipoclientes.json');
        if($jsonString === false){
            echo("NO se pudo leer el archivo Jtipoclientes");
            return 0;
        }
        $datos = json_decode($jsonString);
        if(json_last_error() !== JSON_ERROR_NONE){
            echo('Error decodificando Json: '. json_last_error_msg());
            return 0;
        }
        if(!isset($datos->tipos_clientes)){
            echo("Estructura JSON inválida no se encontro el campo 'tipos_clientes'");
            return 0;
        }
        $success = true;
        $estado = 1;

        foreach($datos->tipos_clientes as $tipo_cliente){
            if(!isset($tipo_cliente->tipo,$tipo_cliente->descripcion)){
                echo("Estructura de tipo_cliente json inválida");
                $success = false;
                break;
            }

           
           
            $query = "INSERT INTO tipocliente (tipo, descripcion, estado, idempresa) VALUES (?, ?, ?, ?)";
            $stmt = $this->conexion->cm->prepare($query);

 
            if(!$stmt){
                echo("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii", $tipo_cliente->tipo, $tipo_cliente->descripcion, $estado, $id_empresa);

            if(!$stmt->execute()){
                echo("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;
    
    }
    public function registrar_canales($id_empresa):int
    {
        if(!is_numeric($id_empresa) || $id_empresa <=0){
            echo("ID de empresa invalido: " . $id_empresa);
            return 0;
        }

        $jsonString = @file_get_contents('Jcanales.json');
        if($jsonString === false){
            echo("NO se pudo leer el archivo Jcanales");
            return 0;
        }
        $datos = json_decode($jsonString);
        if(json_last_error() !== JSON_ERROR_NONE){
            echo('Error decodificando Json: '. json_last_error_msg());
            return 0;
        }
        if(!isset($datos->canales)){
            echo("Estructura JSON inválida no se encontro el campo 'canales'");
            return 0;
        }
        $success = true;
        $estado = 1;

        foreach($datos->canales as $canal){
            if(!isset($canal->canal,$canal->descripcion)){
                echo("Estructura de tipo_cliente json inválida");
                $success = false;
                break;
            }

           
           
            
        $query = "INSERT INTO canalventa (canal, descripcion, estado, idempresa) VALUES (?, ?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);

 
            if(!$stmt){
                echo("Error preparando consulta de estado ".$this->conexion->cm->error);
                $success = false;
                break;
            }
            $stmt->bind_param("ssii",$canal->canal,$canal->descripcion, $estado, $id_empresa);

            if(!$stmt->execute()){
                echo("Error insertando estado: ". $stmt->error);
                $stmt->close();
                $success = true;
                break;
            }
        }
        return $success ? 1 : 0;
    
    }
   
    public function registrarAlmacen($nombre, $direccion, $telefono, $email, $tipo_almacen_id, $region_id, $fecha_creacion, $stockmin, $stockmax, $estado, $idempresa, $idsucursal): int
    {
        $query = "INSERT INTO almacen (nombre, direccion, telefono, email, tipo_almacen_id_tipo_almacen, region_id_region, fecha_creacion, stockmin, stockmax, estado, idempresa, idsucursal) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
        $stmt = $this->conexion->cm->prepare($query);
    
        if (!$stmt) {
            // Registro de error en el prepare
            echo $this->conexion->cm->error;
            $this->logger->registrar(
                'Almacen',
                'PrepareError',
                'Error al preparar la consulta registrarAlmacen: ' . $this->conexion->cm->error,
                compact('nombre', 'direccion', 'telefono', 'email', 'tipo_almacen_id', 'region_id', 'fecha_creacion', 'stockmin', 'stockmax', 'estado', 'idempresa', 'idsucursal'),
                null,
                $idempresa
            );
            return 0;
        }
    
        // 4 strings, 2 ints, 1 string, 5 ints = 12 parámetros
        if(!$stmt->bind_param(
        "ssssiisiiiii",$nombre,$direccion,$telefono,$email,$tipo_almacen_id, $region_id,$fecha_creacion,$stockmin,$stockmax,$estado,$idempresa,$idsucursal)){
        $this->logger->registrar(
            'Almacen',
            'BindParamError',
            'Error en bind_param registrarAlmacen: ' . $stmt->error,
            compact('nombre'),
            null,
            $idempresa
        );
        return 0;
        }

    
        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            // Registro de error en el execute
            echo $stmt->error;
            $this->logger->registrar(
                'Almacen',
                'ExecuteError',
                'Error al ejecutar la consulta registrarAlmacen: ' . $stmt->error,
                compact('nombre', 'direccion', 'telefono', 'email', 'tipo_almacen_id', 'region_id', 'fecha_creacion', 'stockmin', 'stockmax', 'estado', 'idempresa', 'idsucursal'),
                null,
                $idempresa
            );
            return 0;
        } 
        
    }
    
    public function registrarPuntoVenta($nombre, $descripcion, $tipo, $codigoSucursal, $idalmacen, $estadosin, $codigosin): int
    {
        $query = "INSERT INTO punto_venta (nombre, descripcion, tipo, codigoSucursal, idalmacen, estadosin, codigosin) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
    
        $stmt = $this->conexion->cm->prepare($query);
    
        if (!$stmt) {
            // Registrar error si falla el prepare
            $this->logger->registrar(
                'PuntoVenta',
                'PrepareError',
                'Error al preparar la consulta registrarPuntoVenta: ' . $this->conexion->cm->error,
                compact('nombre', 'descripcion', 'tipo', 'codigoSucursal', 'idalmacen', 'estadosin', 'codigosin'),
                null,
                null // puedes pasar aquí el idempresa si lo tienes disponible
            );
            return 0;
        }
    
        $stmt->bind_param("ssissis", $nombre, $descripcion, $tipo, $codigoSucursal, $idalmacen, $estadosin, $codigosin);
    
        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            // Registrar error si falla el execute
            $this->logger->registrar(
                'PuntoVenta',
                'ExecuteError',
                'Error al ejecutar la consulta registrarPuntoVenta: ' . $stmt->error,
                compact('nombre', 'descripcion', 'tipo', 'codigoSucursal', 'idalmacen', 'estadosin', 'codigosin'),
                null,
                null
            );
            return 0;
        }
    }
    
    public function obtenerIdResponsable($id_usuario, $id_empresa): int
    {
        $query = "SELECT id_responsable FROM responsable WHERE id_usuario = ? AND id_empresa = ? ORDER BY id_responsable ASC";
        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            // Error al preparar
            $this->logger->registrar(
                'Responsable',
                'PrepareError',
                'Error al preparar la consulta obtenerIdResponsable: ' . $this->conexion->cm->error,
                compact('id_usuario', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }

        $stmt->bind_param("ii", $id_usuario, $id_empresa);

        if (!$stmt->execute()) {
            // Error al ejecutar
            $this->logger->registrar(
                'Responsable',
                'ExecuteError',
                'Error al ejecutar la consulta obtenerIdResponsable: ' . $stmt->error,
                compact('id_usuario', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }

        $resultado = $stmt->get_result();

        if ($fila = $resultado->fetch_assoc()) {
            return $fila['id_responsable'];
        } else {
            // Opcional: registrar que no se encontró ningún responsable (no es un error técnico, pero puede ser útil)
            $this->logger->registrar(
                'Responsable',
                'NoDataFound',
                'No se encontró id_responsable con esos parámetros',
                compact('id_usuario', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }
    }

    public function registrarResponsable($id_usuario, $fecha, $id_empresa): int
    {
        $query = "INSERT INTO responsable (id_usuario, fecha, id_empresa) VALUES (?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Responsable',
                'PrepareError',
                'Error al preparar la consulta registrarResponsable: ' . $this->conexion->cm->error,
                compact('id_usuario', 'fecha', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }

        $stmt->bind_param("isi", $id_usuario, $fecha, $id_empresa);

        if ($stmt->execute()) {
            return $stmt->insert_id;
        } else {
            $this->logger->registrar(
                'Responsable',
                'ExecuteError',
                'Error al ejecutar la consulta registrarResponsable: ' . $stmt->error,
                compact('id_usuario', 'fecha', 'id_empresa'),
                $id_usuario,
                $id_empresa
            );
            return 0;
        }
    }

    public function registrarResponsableAlmacen($responsable_id, $almacen_id, $fecha): int
    {
        $query = "INSERT INTO responsablealmacen (responsable_id_responsable, almacen_id_almacen, fecha) 
                VALUES (?, ?, ?)";
        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'ResponsableAlmacen',
                'PrepareError',
                'Error al preparar la consulta registrarResponsableAlmacen: ' . $this->conexion->cm->error,
                compact('responsable_id', 'almacen_id', 'fecha'),
                null,
                null
            );
            return 0;
        }

        $stmt->bind_param("iis", $responsable_id, $almacen_id, $fecha);

        if ($stmt->execute()) {
            return 1;
        } else {
            $this->logger->registrar(
                'ResponsableAlmacen',
                'ExecuteError',
                'Error al ejecutar la consulta registrarResponsableAlmacen: ' . $stmt->error,
                compact('responsable_id', 'almacen_id', 'fecha'),
                null,
                null
            );
            return 0;
        }
    }

    public function registrarCliente(array $data): int
    {
        $query = "INSERT INTO cliente (
            nombre, nombrecomercial, tipo, codigo, nit, detalle, direccion,
            telefono, mobil, email, web, pais, ciudad, zona, contacto,
            idempresa, tipodocumento, canal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Cliente',
                'PrepareError',
                'Error al preparar la consulta registrarCliente: ' . $this->conexion->cm->error,
                $data
            );
            return 0;
        }

        $stmt->bind_param(
            "ssissssssssssssisi",
            $data['nombre'],
            $data['nombrecomercial'],
            $data['tipo'],
            $data['codigo'],
            $data['nit'],
            $data['detalle'],
            $data['direccion'],
            $data['telefono'],
            $data['mobil'],
            $data['email'],
            $data['web'],
            $data['pais'],
            $data['ciudad'],
            $data['zona'],
            $data['contacto'],
            $data['idempresa'],
            $data['tipodocumento'],
            $data['canal']
        );

        if ($stmt->execute()) {
            $idCliente = $this->conexion->cm->insert_id;

            // Ahora registrar sucursal central
            $nombreSucursal = "Central ".$data['nombre'];
            $querySucursal = "INSERT INTO sucursal (nombre, telefono, direccion, cliente_id_cliente) VALUES (?, ?, ?, ?)";

            $stmtSucursal = $this->conexion->cm->prepare($querySucursal);

            if (!$stmtSucursal) {
                $this->logger->registrar(
                    'Sucursal',
                    'PrepareError',
                    'Error al preparar la consulta registrarSucursal: ' . $this->conexion->cm->error,
                    compact('nombreSucursal', 'data', 'idCliente')
                );
                return $idCliente; // cliente sí se registró
            }

            $stmtSucursal->bind_param("sssi", $nombreSucursal, $data['mobil'], $data['direccion'], $idCliente);

            if (!$stmtSucursal->execute()) {
                $this->logger->registrar(
                    'Sucursal',
                    'ExecuteError',
                    'Error al ejecutar la consulta registrarSucursal: ' . $stmtSucursal->error,
                    compact('nombreSucursal', 'data', 'idCliente')
                );
            }

            return $idCliente;
        } else {
            $this->logger->registrar(
                'Cliente',
                'ExecuteError',
                'Error al ejecutar la consulta registrarCliente: ' . $stmt->error,
                $data
            );
            return 0;
        }
    }


    public function insertarPorcentaje(array $data): int
    {
        $query = "INSERT INTO porcentajes (tipo, porcentaje, autorizado, almacen_id_almacen)
                VALUES (?, ?, ?, ?)";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Porcentajes',
                'PrepareError',
                'Error al preparar la consulta insertarPorcentaje: ' . $this->conexion->cm->error,
                $data
            );
            return 0;
        }

        $stmt->bind_param(
            "ssii", // tipos: string, string, int, int
            $data['tipo'],
            $data['porcentaje'],
            $data['autorizado'],
            $data['almacen_id_almacen']
        );

        if ($stmt->execute()) {
            return $this->conexion->cm->insert_id; // ID del nuevo registro
        } else {
            $this->logger->registrar(
                'Porcentajes',
                'ExecuteError',
                'Error al ejecutar insertarPorcentaje: ' . $stmt->error,
                $data
            );
            return 0;
        }
    }

    public function registrarResponsablePuntoVenta($idresponsable, $idpuntoventa): int
    {
        $query = "INSERT INTO responsable_puntoventa (idresponsable, idpuntoventa) VALUES (?, ?)";
        $stmt = $this->conexion->cm->prepare($query);
    
        if (!$stmt) {
            $this->logger->registrar(
                'ResponsablePuntoVenta',
                'PrepareError',
                'Error al preparar la consulta registrarResponsablePuntoVenta: ' . $this->conexion->cm->error,
                compact('idresponsable', 'idpuntoventa'),
                null,
                null
            );
            return 0;
        }
    
        $stmt->bind_param("ii", $idresponsable, $idpuntoventa);
    
        if ($stmt->execute()) {
            return 1;
        } else {
            $this->logger->registrar(
                'ResponsablePuntoVenta',
                'ExecuteError',
                'Error al ejecutar la consulta registrarResponsablePuntoVenta: ' . $stmt->error,
                compact('idresponsable', 'idpuntoventa'),
                null,
                null
            );
            return 0;
        }
    }
    

    public function obtenerPrimeraSucursalID($idempresa): int
    {
        if ($idempresa === "false") {
            return 0; // Empresa inválida
        }

        $query = "SELECT idsucursalcontable FROM sucursalcontable WHERE idorganizacion = ? ORDER BY idsucursalcontable ASC LIMIT 1";
        $stmt = $this->em->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'SucursalContable',
                'PrepareError',
                'Error al preparar la consulta obtenerPrimeraSucursalID: ' . $this->em->error,
                compact('idempresa'),
                null,
                $idempresa
            );
            return 0;
        }

        $stmt->bind_param("i", $idempresa);

        if (!$stmt->execute()) {
            $this->logger->registrar(
                'SucursalContable',
                'ExecuteError',
                'Error al ejecutar la consulta obtenerPrimeraSucursalID: ' . $stmt->error,
                compact('idempresa'),
                null,
                $idempresa
            );
            return 0;
        }

        $resultado = $stmt->get_result()->fetch_assoc();
        return $resultado ? (int) $resultado["idsucursalcontable"] : 0;
    }
    public function obtenerPrimerCanalVentaId(int $idempresa): ?int
    {
        $query = "SELECT idcanalventa
                FROM canalventa
                WHERE idempresa = ?
                ORDER BY idcanalventa ASC
                LIMIT 1";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'CanalVenta',
                'PrepareError',
                'Error al preparar la consulta obtenerPrimerCanalVentaId: ' . $this->conexion->cm->error,
                ['idempresa' => $idempresa]
            );
            return null;
        }

        $stmt->bind_param("i", $idempresa);
        $stmt->execute();

        $stmt->bind_result($idCanal);
        echo $idCanal;
        if ($stmt->fetch()) {
            return $idCanal;
        }

        return null; // No encontrado
    }
    public function obtenerPrimerTipoClienteId(int $idempresa): ?int
    {
        $query = "SELECT idtipocliente
                FROM tipocliente
                WHERE idempresa = ?
                ORDER BY idtipocliente ASC
                LIMIT 1";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'TipoCliente',
                'PrepareError',
                'Error al preparar la consulta obtenerPrimerTipoClienteId: ' . $this->conexion->cm->error,
                ['idempresa' => $idempresa]
            );
            return null;
        }

        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $stmt->bind_result($idTipoCliente);
        echo $idTipoCliente;
        if ($stmt->fetch()) {
            return $idTipoCliente;
        }

        return null; // No se encontró ningún resultado
    }

    public function prepararCliente(int $idempresa): int
    {
        $idCanal = $this->obtenerPrimerCanalVentaId($idempresa);
        $tipo_documento = 1;
        $idTipoCliente = $this->obtenerPrimerTipoClienteId($idempresa);
        if ($idCanal === null || $idTipoCliente === null) {
            $this->logger->registrar(
                'Cliente',
                'DatosFaltantes',
                'No se pudo obtener idCanal o idTipoCliente',
                compact('idempresa', 'idCanal', 'idTipoCliente')
            );
            return 0;
        }

        $clienteFicticio = [
            'nombre' => 'Cliente varios',
            'nombrecomercial' => 'varios S.A.',
            'tipo' => $idTipoCliente,
            'codigo' => uniqid('CLI_'), // genera un código único
            'nit' => '00000000',
            'detalle' => 'Cliente generado automáticamente para pruebas',
            'direccion' => 'Dirección Genérica',
            'telefono' => '0000000',
            'mobil' => '70000000',
            'email' => 'ClienteVarios@one.com',
            'web' => 'https://Varios.test',
            'pais' => 'Bolivia',
            'ciudad' => 'Cochabamba',
            'zona' => 'Zud',
            'contacto' => 'Contacto Demo',
            'idempresa' => $idempresa,
            'tipodocumento' => $tipo_documento,
            'canal' => $idCanal
        ];
        return $this->registrarCliente($clienteFicticio);
    }
    public function registrarProveedorFicticio(array $data): int
    {
        $query = "INSERT INTO proveedor (
            nombre, codigo, nit, detalle, direccion, telefono, mobil, email,
            web, pais, ciudad, zona, contacto, id_empresa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conexion->cm->prepare($query);

        if (!$stmt) {
            $this->logger->registrar(
                'Proveedor',
                'PrepareError',
                'Error al preparar la consulta registrarProveedorFicticio: ' . $this->conexion->cm->error,
                $data
            );
            return 0;
        }

        $stmt->bind_param(
            "sssssssssssssi",
            $data['nombre'],
            $data['codigo'],
            $data['nit'],
            $data['detalle'],
            $data['direccion'],
            $data['telefono'],
            $data['mobil'],
            $data['email'],
            $data['web'],
            $data['pais'],
            $data['ciudad'],
            $data['zona'],
            $data['contacto'],
            $data['id_empresa']
        );

        if ($stmt->execute()) {
            return $this->conexion->cm->insert_id;
        } else {
            $this->logger->registrar(
                'Proveedor',
                'ExecuteError',
                'Error al ejecutar la consulta registrarProveedorFicticio: ' . $stmt->error,
                $data
            );
            return 0;
        }
    }
    public function prepararProveedor(int $idempresa): int
    {
        $data = [
            'nombre' => 'Proveedor Varios',
            'codigo' => uniqid('CLI_'),
            'nit' => '1234567890',
            'detalle' => 'Proveedor Varios',
            'direccion' => 'Calle Bol 123',
            'telefono' => '2222222',
            'mobil' => '77777777',
            'email' => 'proveedor@varios.com',
            'web' => 'http://proveedorVarios.com',
            'pais' => 'Bolivia',
            'ciudad' => 'Ciudad Central',
            'zona' => 'Zona 1',
            'contacto' => 'Juan',
            'id_empresa' => $idempresa
        ];

        return $this->registrarProveedorFicticio($data);
    }
    public function prepararPorcentage(int $idalmacen): int
    {
        $data = [
            'tipo' => 'Menor',
            'porcentaje' => '0',
            'autorizado' => 1,
            'almacen_id_almacen' => $idalmacen
        ];

        return $this->insertarPorcentaje($data);
    }
    public function registrarConfiguracion($idempresa, $idsucursal, $idusuario): int 
    {
        try {
            $fecha = date("Y-m-d");

            $id_tipo_almacen = $this->crearTipoAlmacen($idempresa, 'Espacio flexible', 'Áreas para materias primas, productos terminados y mercancías en tránsito.', 1);
            if (!$id_tipo_almacen) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al crear tipo de almacén", compact('idempresa'), $idusuario, $idempresa);
                return -1;
            }

            $id_divisa = $this->registrarDivisa('Bolivianos', 'Bs.', 1, $idempresa, null);
            if (!$id_divisa) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar divisa", compact('idempresa'), $idusuario, $idempresa);
                return -2;
            }

            $id_leyenda_proforma = $this->registrarLeyendaProforma(
                'Precios expresados en moneda local y sujetos a ajustes según el tipo de cambio', 1, $idempresa
            );
            if (!$id_leyenda_proforma) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar leyenda proforma", compact('idempresa'), $idusuario, $idempresa);
                return -3;
            }

            if (!$this->registrar_canales($idempresa)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar canales de venta", compact('idempresa'), $idusuario, $idempresa);
                return -4;
            }

           

            if (!$this->registrarCategoriasProducto($idempresa)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar categorías de producto", compact('idempresa'), $idusuario, $idempresa);
                return -41;
            }

            if(!$this->registrar_parametros_obsolescencia($idempresa)){
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar parametros obsolescencia", compact('idempresa'), $idusuario, $idempresa);
                return -45;
            }
            
            if (!$this->registrarEstadosProducto($idempresa)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar estados de producto", compact('idempresa'), $idusuario, $idempresa);
                return -42;
            }

            if (!$this->registrar_unidades_de_medidas($idempresa)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar unidades de medida", compact('idempresa'), $idusuario, $idempresa);
                return -43;
            }

            if (!$this->registrar_caracterisitcas($idempresa)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar características de producto", compact('idempresa'), $idusuario, $idempresa);
                return -44;
            }

            if (!$this->registrar_tipos_clientes($idempresa)) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar tipos de clientes", compact('idempresa'), $idusuario, $idempresa);
                return -46;
            }
            $id_Cliente = $this->prepararCliente($idempresa);

            $id_proveedor = $this->prepararProveedor($idempresa);
            $id_almacen = $this->registrarAlmacen('ALMACEN_1', 'BOLIVIA', '00000000', 'almacen@alm.bo', $id_tipo_almacen, 0, $fecha, 10, 100, 1, $idempresa, $idsucursal);
            if (!$id_almacen) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar almacén", compact('idempresa', 'idsucursal'), $idusuario, $idempresa);
                return -5;
            }
            //Jcanales

            $id_punto_venta = $this->registrarPuntoVenta('PuntoVT-1', 'Lugar de pago', null, null, $id_almacen, '', '');
            $id_porcentaje = $this->prepararPorcentage($id_almacen);
            if (!$id_punto_venta) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar punto de venta", compact('id_almacen'), $idusuario, $idempresa);
                return -6;
            }

            $id_responsable = $this->registrarResponsable($idusuario, $fecha,$idempresa);
            if (!$id_responsable) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al obtener ID responsable", compact('idusuario', 'idempresa'), $idusuario, $idempresa);
                return -7;
            }
            $uno = $this->registrarResponsableAlmacen($id_responsable, $id_almacen, $fecha);
            $dos = $this->registrarResponsablePuntoVenta($id_responsable, $id_punto_venta);
            if (!$uno || !$dos) {
                $this->logger->registrar("Configuracion", "Error", "Fallo al registrar responsable en almacén o punto de venta", compact('id_responsable', 'id_almacen', 'id_punto_venta'), $idusuario, $idempresa);
                return -8;
            }

            return 1; // Todo OK
        } catch (Exception $e) {
            $this->logger->registrar("Configuracion", "Excepcion", $e->getMessage(), compact('idempresa', 'idsucursal', 'idusuario'), $idusuario, $idempresa);
            return 0; // Error general parametros_obsolescencia
        }
    }
    public function control($idmd5, $idsucursal, $idusuario)
    {
        $respuesta = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if (!$this->empresaRegistrada($idempresa)) {
            $registro = $this->registrarConfiguracion($idempresa, $idsucursal, $idusuario);

            // Verifica si el registro ha fallado (código distinto a 1)
            if ($registro !== 1) {
                // Muestra el mensaje de error basado en el código
                $mensaje_error = $this->obtenerMensajeError($registro);
                $respuesta = [
                    "estado" => "error",
                    "mensaje" => $mensaje_error
                ];
            } else {
                $id = $this->registrarConfiguracionInicial($idempresa, 'registro completado');
                
                // Gestiona los errores relacionados con la configuración inicial
                switch ($id) {
                    case -1:
                        $respuesta = [
                            "estado" => "advertencia",
                            "mensaje" => "La empresa ya tenía una configuración inicial"
                        ];
                        break;
                    case 0:
                        $respuesta = [
                            "estado" => "error",
                            "mensaje" => "No se pudo registrar la configuración inicial"
                        ];
                        break;
                    default:
                        $respuesta = [
                            "estado" => "exito",
                            "mensaje" => "Empresa registrada correctamente"
                        ];
                        break;
                }
            }
        } else {
            $respuesta = [
                "estado" => "error",
                "mensaje" => "La empresa ya fue registrada previamente"
            ];
        }

        echo json_encode($respuesta);
    }

    public function obtenerMensajeError($codigo_error): string
    {
        // Mensajes personalizados para cada código de error
        switch ($codigo_error) {
            case 0:
                return "Error interno inesperado (ver logs)";
            case -1:
                return "Error al crear tipo de almacen";
            case -2:
                return "Error al registrar la divisa";
            case -3:
                return "Error al registrar la leyenda de proforma";
            case -4:
                return "Error en el registro de parámetros o categorías de producto";
            case -5:
                return "Error al registrar el almacén";
            case -6:
                return "Error al registrar el punto de venta";
            case -7:
                return "Error al obtener el responsable";
            case -8:
                return "Error al registrar responsables en almacén o punto de venta";
            case -41:
                return "Error al registrar categorías de productos";
            case -42:
                return "Error al registrar estados de producto";
            case -43:
                return "Error al registrar unidades de medida";
            case -44:
                return "Error al registrar características de productos";
            case -45:
                return "Error al registrar parámetros de obsolescencia";
            case -46:
                return "Error al registrar tipos de clientes";
            case -47:
                return "Error al registrar canales de venta";
            
            default:
                return "Código de error no reconocido: $codigo_error";
        }
    }


    public function empresaRegistrada($idempresa): bool
    {
        $query = "SELECT COUNT(*) AS existe FROM configuracion_inicial WHERE idempresa = ?";
        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $stmt->bind_result($existe);
        $stmt->fetch();
        return $existe > 0;
    }
    public function empresaRegistradajs($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $query = "
            SELECT 
                EXISTS (SELECT 1 FROM configuracion_inicial WHERE idempresa = ?) OR
                (
                    EXISTS (SELECT 1 FROM almacen WHERE idempresa = ?) AND
                    EXISTS (SELECT 1 FROM categorias WHERE id_empresa = ?) AND
                    EXISTS (SELECT 1 FROM cliente WHERE idempresa = ?) AND
                    EXISTS (SELECT 1 FROM proveedor WHERE id_empresa = ?) AND
                    EXISTS (
                        SELECT 1 FROM ingreso i
                        JOIN proveedor p ON i.proveedor_id_proveedor = p.id_proveedor
                        WHERE p.id_empresa = ?
                    ) AND
                    EXISTS (
                        SELECT 1 FROM venta v
                        JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
                        WHERE c.idempresa = ?
                    )
                ) AS existe
        ";

        $stmt = $this->conexion->cm->prepare($query);
        $stmt->bind_param("iiiiiii", $idempresa, $idempresa, $idempresa, $idempresa, $idempresa, $idempresa, $idempresa);
        $stmt->execute();
        $resultado = $stmt->get_result()->fetch_assoc();

        $respuesta = [
            "estado" => $resultado['existe'] ? "exito" : "error",
            "mensaje" => $resultado['existe'] ? "Empresa registrada" : "Empresa no encontrada"
        ];

        echo json_encode($respuesta);
    }

    
    public function registrarConfiguracionInicial($idempresa, $descripcion): int
    {
        // Verificar si la empresa ya tiene un registro
        $query_check = "SELECT COUNT(*) AS existe FROM configuracion_inicial WHERE idempresa = ?";
        $stmt = $this->conexion->cm->prepare($query_check);
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $resultado = $stmt->get_result()->fetch_assoc();

        if ($resultado['existe'] == 0) {
            //Insertar el registro si no existe
            $query_insert = "INSERT INTO configuracion_inicial (idempresa, fecha_ejecucion, estado, descripcion) VALUES (?, NOW(), 'Ejecutado', ?)";
            $stmt = $this->conexion->cm->prepare($query_insert);

            if (!$stmt) {
                $this->logger->registrar(
                    'ConfiguracionInicial',
                    'PrepareError',
                    'Error al preparar el INSERT en configuracion_inicial: ' . $this->conexion->cm->error,
                    compact('idempresa', 'descripcion'),
                    null,
                    $idempresa
                );
                return 0;
            }

            $stmt->bind_param("is", $idempresa, $descripcion);

            if ($stmt->execute()) {
                return 1;
            } else {
                $this->logger->registrar(
                    'ConfiguracionInicial',
                    'ExecuteError',
                    'Error al ejecutar el INSERT en configuracion_inicial: ' . $stmt->error,
                    compact('idempresa', 'descripcion'),
                    null,
                    $idempresa
                );
                return 0;
            }
        }

        return -1; // Ya existe No se pudo registrar la configuración inicial
    }

}

?>

