<?php
require_once 'vendor/autoload.php';
require_once "configuraciones.php";
require_once "configuracionInicial.php";
require_once "mantenimiento.php";
require_once "compras.php";
require_once "ventas.php";
require_once "sendIvoiceEmail.php";
require_once "useVenta.php";
require_once "useCotizacion.php";
$ver = $_POST['ver'];
$controlador = null;
if ($ver == "registrarResponsable") {
    $controlador = new configuracion();
    $controlador->registroResponsable($_POST['usuario'], $_POST['idempresa']);
} elseif ($ver == "registrarResponsablealmacen") {
    $controlador = new configuracion();
    $controlador->registroResponsablealmacen($_POST['idresponsable'], $_POST['almacen']);
} elseif ($ver == "registrarResponsablePuntoVenta") {
    $controlador = new configuracion();
    $controlador->registroPuntoVentaResponsable($_POST['idresponsable'], $_POST['idpuntoventa']);
} elseif ($ver == "registrarTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->registrotipoalmacen($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->editartipoalmacen($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->registroCatproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa'], $_POST['idp']);
} elseif ($ver == "editarCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->editarCatproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion'], $_POST['idp']);
} elseif ($ver == "registrarEstadoProducto") {
    $controlador = new configuracion();
    $controlador->registroEstproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarEstadoProducto") {
    $controlador = new configuracion();
    $controlador->editarEstproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarUnidadProducto") {
    $controlador = new configuracion();
    $controlador->registroUniproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarUnidadProducto") {
    $controlador = new configuracion();
    $controlador->editarUniproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->registroCaracproducto($_POST['nombre'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->editarCaracproducto($_POST['id'], $_POST['nombre'], $_POST['descripcion']);
} elseif ($ver == "registrarDivisa") {
    $nombre = $_POST['nombre'] ?? '';
    $tipo = $_POST['tipo'] ?? '';
    $idempresa = $_POST['idempresa'] ?? '';
    $monedasin = $_POST['monedasin'] ?? null;
    $controlador = new configuracion();
    $controlador->registroDivisa($nombre, $tipo, $idempresa, $monedasin);
} elseif ($ver == "editarDivisa") {
    $controlador = new configuracion();
    $controlador->editarDivisa($_POST['id'], $_POST['nombre'], $_POST['tipo'], $_POST['monedasin']);
} elseif ($ver == "registrarTipoCLiente") {
    $controlador = new configuracion();
    $controlador->registroTipocliente($_POST['tipo'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarTipoCLiente") {
    $controlador = new configuracion();
    $controlador->editarTipocliente($_POST['id'], $_POST['tipo'], $_POST['descripcion']);
} elseif ($ver == "registrarCanalVenta") {
    $controlador = new configuracion();
    $controlador->registroCanalVenta($_POST['canal'], $_POST['descripcion'], $_POST['idempresa']);
} elseif ($ver == "editarCanalVenta") {
    $controlador = new configuracion();
    $controlador->editarCanalVenta($_POST['id'], $_POST['canal'], $_POST['descripcion']);
} elseif ($ver == "registrarLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->registroLeyendaProforma($_POST['texto'], $_POST['idempresa']);
} elseif ($ver == "editarLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->editarLeyendaProforma($_POST['id'], $_POST['texto']);
} elseif ($ver == "registrarPrecioBase") {
    $controlador = new configuracion();
    $controlador->registroPrecioBase($_POST['precio'], $_POST['idproductoalmacen']);
} elseif ($ver == "registrarCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->registroCategoriaPrecio($_POST['tipo'], $_POST['porcentaje'], $_POST['idalmacen']);
} elseif ($ver == "editarCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->editarCategoriaPrecio($_POST['id'], $_POST['tipo'], $_POST['porcentaje'], $_POST['idalmacen']);
} elseif ($ver == "editarPrecioSugerido") {
    $controlador = new configuracion();
    $controlador->editarPrecioSugerido($_POST['id'], $_POST['precio']);
} elseif ($ver == "registrarLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->registroLeyendaFactura($_POST['nombre'], $_POST['codigosin'], $_POST['idempresa']);
} elseif ($ver == "editarLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->editarLeyendaFactura($_POST['id'], $_POST['nombre'], $_POST['codigosin']);
} elseif ($ver == "registrarMetodoPagoFactura") {
    $controlador = new configuracion();
    $controlador->registroMetodoPagoFactura($_POST['nombre'], $_POST['codigosin'] ?? '', $_POST['idempresa']);
} elseif ($ver == "editarMetodoPagoFactura") {
    $controlador = new configuracion();
    $controlador->editarMetodoPagoFactura($_POST['id'], $_POST['nombre'], $_POST['codigosin']);
} elseif ($ver == "registrarParametro") {
    $controlador = new configuracion();
    $controlador->registroParametro($_POST['nombre'], $_POST['valor'], $_POST['color'],$_POST['tipo'], $_POST['idempresa']);
} elseif ($ver == "editarParametro") {
    $controlador = new configuracion();
    $controlador->editarParametro($_POST['id'], $_POST['nombre'], $_POST['valor'], $_POST['color'],$_POST['tipo']);
} elseif ($ver == "registrarAlmacen") {
    $controlador = new mantenimiento();
    $controlador->registraralmacen($_POST['nombre'], $_POST['direccion'], $_POST['telefono'], $_POST['email'], $_POST['tipoalmacen'], $_POST['stockmin'], $_POST['stockmax'], $_POST['sucursal'], $_POST['idempresa']);
} elseif ($ver == "editarAlmacen") {
    $controlador = new mantenimiento();
    $controlador->editaralmacen($_POST['id'], $_POST['nombre'], $_POST['direccion'], $_POST['telefono'], $_POST['email'], $_POST['tipoalmacen'], $_POST['stockmin'], $_POST['stockmax'], $_POST['sucursal']);
} elseif ($ver == "registrarPuntoventa") {
    $controlador = new mantenimiento();
    $controlador->registroPuntoVenta($_POST['nombre'], $_POST['descripcion'], $_POST['idalmacen']);
} elseif ($ver == "editarPuntoventa") {
    $controlador = new mantenimiento();
    $controlador->editarPuntoVenta($_POST['id'], $_POST['nombre'], $_POST['descripcion'], $_POST['tipo']);
} elseif ($ver == "crearPuntoVentaFacturacion") {
    $controlador = new mantenimiento();
    $controlador->crarPuntoVentaFactura(json_decode($_POST['puntoventaJSON'], true), $_POST['codigosucursal'], $_POST['token'], $_POST['tipof'], $_POST['id'], $_POST['tipo']);
} elseif ($ver == "registrarProducto") {
    try {
        $controlador = new mantenimiento();
    if(!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === 0){
        $filename = $_FILES['imagen']['name'];
        $file = $_FILES['imagen']['tmp_name'];
        $url = "imagen";
        $url = $url . "/" . $_POST['nombre'] . rand(10000, 999999) . ".jpg";
        move_uploaded_file($file, $url);
    }
    else{
        $url = $_POST['imagen'];
    }
    $controlador->registroProducto($_POST['nombre'], $_POST['codigo'], $_POST['descripcion'], $_POST['codigobarras'], $_POST['categoria'], $_POST['medida'], $_POST['estadoproductos'], $_POST['unidad'], $_POST['caracteristica'], $url, $_POST['codigosin'], $_POST['codigoactividad'], $_POST['unidadsin'], $_POST['codigoNandina'], $_POST['idempresa']);
    } catch (Exception $e) {
        echo json_encode(array("estado" => "error", "mensaje" => $e->getMessage()));
    }
} elseif ($ver == "editarProducto") {
    $controlador = new mantenimiento();
    if(!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === 0){
        $filename = $_FILES['imagen']['name'];
        $file = $_FILES['imagen']['tmp_name'];
        $url = "imagen";
        $url = $url . "/" . $_POST['nombre'] . rand(10000, 999999) . ".jpg";
        move_uploaded_file($file, $url);
    }else{
        $url = $_POST['imagen'];
    }
    $controlador->editarProducto($_POST['id'], $_POST['nombre'], $_POST['codigo'], $_POST['descripcion'], $_POST['codigobarras'], $_POST['categoria'], $_POST['medida'], $_POST['estadoproductos'], $_POST['unidad'], $_POST['caracteristica'], $url, $_POST['codigosin'], $_POST['codigoactividad'], $_POST['unidadsin'],$_POST['codigoNandina']);
} elseif ($ver == "registrarProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->registroProductoAlmacen($_POST['stockmin'], $_POST['stockmax'], $_POST['detalle'], json_decode($_POST['jsonProductos'], true));
} elseif ($ver == "editarProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->editarProductoAlmacen($_POST['id'], $_POST['detalle'], $_POST['stockmin'], $_POST['stockmax']);
} elseif ($ver == "registrarMovimiento") {
    $controlador = new mantenimiento();
    $controlador->registroMovimiento($_POST['fecha'], $_POST['almacendestino'], $_POST['descripcion'], $_POST['almacenorigen'], $_POST['idusuario']);
} elseif ($ver == "editarMovimiento") {
    $controlador = new mantenimiento();
    $controlador->editarMovimiento($_POST['id'],$_POST['fecha'], $_POST['almacendestino'], $_POST['descripcion'], $_POST['almacenorigen'], $_POST['idusuario']);
} elseif ($ver == "registrarDetalleMovimiento") {
    $controlador = new mantenimiento();
    $controlador->registroDetalleMovimiento($_POST['cantidad'], $_POST['idmovimiento'], $_POST['idproductoalmacen']);
} elseif ($ver == "editarDetalleMovimiento") {
    $controlador = new mantenimiento();
    $controlador->actualizarDetalleMovimiento($_POST['id'], $_POST['cantidad'], $_POST['idproductoalmacen']);
} elseif ($ver == "registrarcampana") {
    $controlador = new mantenimiento();
    $controlador->registroCampaña($_POST['campana'], $_POST['fechai'], $_POST['fechaf'], $_POST['porcentaje'], $_POST['idalmacen'], $_POST['idusuario']);
} elseif ($ver == "editarcampaña") {
    $controlador = new mantenimiento();
    $controlador->editarCampaña($_POST['id'],$_POST['campana'], $_POST['fechai'], $_POST['fechaf'], $_POST['porcentaje'], $_POST['idalmacen']);
} elseif ($ver == "registrocategoriacampaña") {
    $controlador = new mantenimiento();
    $controlador->registrocategoriaprecio($_POST['idcategoriaprecio'], $_POST['idcampaña'], $_POST['idempresa']);
} elseif ($ver == "registrarProveedor") {
    $controlador = new compras();
    $controlador->registroproveedor($_POST['nombre'], $_POST['codigo'], $_POST['nit'], $_POST['detalle'], $_POST['direccion'], $_POST['telefono'], $_POST['movil'], $_POST['email'], $_POST['web'], $_POST['pais'], $_POST['ciudad'], $_POST['zona'], $_POST['contacto'], $_POST['idempresa']);
} elseif ($ver == "editarProveedor") {
    $controlador = new compras();
    $controlador->editarregistroproveedor($_POST['id'], $_POST['nombre'], $_POST['codigo'], $_POST['nit'], $_POST['detalle'], $_POST['direccion'], $_POST['telefono'], $_POST['mobil'], $_POST['email'], $_POST['web'], $_POST['pais'], $_POST['ciudad'], $_POST['zona'], $_POST['contacto']);
} elseif ($ver == "registrarPedido") {
    $controlador = new compras();
    $controlador->registroPedido($_POST['fecha'], $_POST['observacion'], $_POST['almacenorigen'], $_POST['tipo'], $_POST['almacendestino'], $_POST['idusuario'], $_POST['idempresa']);
} elseif ($ver == "editarPedido") {
    $controlador = new compras();
    $controlador->editarPedido($_POST['id'],$_POST['fecha'], $_POST['observacion'], $_POST['almacenorigen'], $_POST['tipo'], $_POST['almacendestino']);
}elseif ($ver == "uploadRecibo") {
    $controlador = new compras(); // Or new FilesController() if you create one
    $controlador->uploadRecibo(); // This method directly handles $_POST and $_FILES
} elseif ($ver == "getRecibo") {
    $controlador = new compras(); // Or new FilesController()
    // Assuming getRecibo expects idpedido from GET or POST
    $idpedido = isset($_REQUEST['idpedido']) ? $_REQUEST['idpedido'] : null;
    $controlador->getRecibo($idpedido);
} elseif ($ver == "deleteRecibo") {
    $controlador = new compras(); // Or new FilesController()
    // Assuming deleteRecibo expects idpedido from GET or POST
    $idpedido = isset($_REQUEST['idpedido']) ? $_REQUEST['idpedido'] : null;
    $controlador->deleteRecibo($idpedido);
}
// --- NEW ENDPOINT FOR MOVEMENT PHOTOS ---
elseif ($ver == "uploadFotoMovimiento") {
    $controlador = new compras(); // Or new FilesController()
    $controlador->uploadFotoMovimiento(); // This method directly handles $_POST and $_FILES
}
elseif ($ver == "registrarDetallePedido") {
    $controlador = new compras();
    $controlador->registroDetallePedido($_POST['idpedido'], $_POST['cantidad'], $_POST['idproductoalmacen']);
} elseif ($ver == "editardetallepedido") {
    $controlador = new compras();
    $controlador->editarDetallePedido($_POST['id'], $_POST['cantidad'], $_POST['idproductoalmacen']);
} elseif ($ver == "registrarCompra") {
    $controlador = new compras();
    $controlador->registroCompra($_POST['nombre'], $_POST['codigo'], $_POST['proveedor'], $_POST['pedido'], $_POST['factura'], $_POST['tipocompra'], $_POST['almacen'], $_POST['idusuario']);
} elseif ($ver == "editarCompra") {
    $controlador = new compras();
    $controlador->editarCompra($_POST['id'], $_POST['nombre'], $_POST['codigo'], $_POST['proveedor'], $_POST['factura']);
} elseif ($ver == "registrarDetalleCompra") {
    $controlador = new compras();
    $controlador->registroDetalleCompra($_POST['precio'], $_POST['cantidad'], $_POST['idingreso'], $_POST['idproductoalmacen']);
} elseif ($ver == "editarDetalleCompra") {
    $controlador = new compras();
    $controlador->editardetalleCompra($_POST['id'], $_POST['precio'], $_POST['cantidad'], $_POST['idproductoalmacen']);
}
 elseif ($ver == "concluir_pedido") {
    $controlador = new compras();
    $controlador->concluir_pedido($_POST['id'], $_POST['estado']);
}
elseif ($ver == "registrarCliente") {
      $controlador = new ventas();
    $controlador->registrocliente(
        $_POST['nombre'] ?? '',
        $_POST['nombrecomercial'] ?? '',
        $_POST['canalventa'] ?? '',
        $_POST['tipocliente'] ?? '',
        $_POST['tipodocumento'] ?? '',
        $_POST['nrodocumento'] ?? '',
        $_POST['detalle'] ?? '', // Aquí está el campo que lanza el warning
        $_POST['direccion'] ?? '',
        $_POST['telefono'] ?? '',
        $_POST['movil'] ?? '',
        $_POST['email'] ?? '',
        $_POST['web'] ?? '',
        $_POST['pais'] ?? '',
        $_POST['ciudad'] ?? '',
        $_POST['zona'] ?? '',
        $_POST['contacto'] ?? '',
        $_POST['idempresa'] ?? ''
    );
}elseif ($ver == "registroClienteMinimal") {
      $controlador = new ventas();
    $controlador->registroClienteMinimal(
        $_POST['nombre'] ?? '',
        $_POST['nombrecomercial'] ?? '',
        $_POST['canalventa'] ?? '',
        $_POST['tipocliente'] ?? '',
        $_POST['tipodocumento'] ?? '',
        $_POST['nrodocumento'] ?? '',
        $_POST['telefono'] ?? '',
        $_POST['idempresa'] ?? ''
    );
} 
elseif ($ver == "editarCliente") {
    $controlador = new ventas();
    $controlador->editarcliente($_POST['id'], $_POST['nombre'], $_POST['nombrecomercial'], $_POST['canalventa'], $_POST['tipocliente'], $_POST['tipodocumento'], $_POST['nrodocumento'], $_POST['detalle'], $_POST['direccion'], $_POST['telefono'], $_POST['movil'], $_POST['email'], $_POST['web'], $_POST['pais'], $_POST['ciudad'], $_POST['zona'], $_POST['contacto']);
} elseif ($ver == "registrarSucursal") {
    $controlador = new ventas();
    $controlador->registrosucursal($_POST['nombre'], $_POST['telefono'], $_POST['direccion'], $_POST['idcliente']);
} elseif ($ver == "editarSucursal") {
    $controlador = new ventas();
    $controlador->editarsucursal($_POST['id'], $_POST['nombre'], $_POST['telefono'], $_POST['direccion']);
} elseif ($ver == "registroVenta") {
    $controlador = new UseVEnta();
    $controlador->registroVenta($_POST['fecha'], $_POST['tipoventa'], $_POST['tipopago'], $_POST['idcliente'], $_POST['sucursal'], $_POST['canal'], $_POST['idempresa'], $_POST['idusuario'], json_decode($_POST['jsonDetalles'], true));
} 
 elseif ($ver === "registrarCotizacion") {
    header('Content-Type: application/json');

    try {
        // Validar parámetros obligatorios
        $requeridos = ['tipo_operacion', 'idcliente', 'idsucursal', 'listaProductos'];
        foreach ($requeridos as $param) {
            if (!isset($_POST[$param]) || empty($_POST[$param])) {
                throw new Exception("Falta el parámetro obligatorio: $param");
            }
        }

        // Extraer y validar tipo de operación
        $tipoOperacion = intval($_POST['tipo_operacion']);
        if (!in_array($tipoOperacion, [1, 2])) {
            throw new Exception("El tipo de operación debe ser 1 (venta) o 2 (cotización).");
        }

        // Decodificar lista de productos
        $listaProductos = json_decode($_POST['listaProductos'], true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($listaProductos)) {
            throw new Exception("El formato de 'listaProductos' no es un JSON válido.");
        }

        if (!isset($listaProductos['listaProductos']) || !is_array($listaProductos['listaProductos'])) {
            throw new Exception("El campo 'listaProductos' no contiene una lista válida de productos.");
        }

        // Extraer otros datos
        $idCliente  = $_POST['idcliente'];
        $idSucursal = $_POST['idsucursal'];

        // Llamar al controlador
        $controlador = new UseCotizacion();
        $respuesta = $controlador->registroCotizacion($tipoOperacion, $idCliente, $idSucursal, $listaProductos);

        

    } catch (Exception $e) {
        echo json_encode([
            "estado"  => "error",
            "mensaje" => $e->getMessage()
        ]);
    }
}

 elseif ($ver == "registrarInventarioExterno") {
    $controlador = new ventas();
    $controlador->registroinventarioexterno($_POST['fecha'], $_POST['idcliente'], $_POST['sucursal'], $_POST['observacion'], $_POST['imagen'], $_POST['almacen'], $_POST['idusuario']);
} elseif ($ver == "editarInventarioExterno") {
    $controlador = new ventas();
    $controlador->editarinventarioexterno($_POST['id'], $_POST['fecha'], $_POST['idcliente'], $_POST['sucursal'], $_POST['observacion'], $_POST['imagen'], $_POST['almacen']);
} elseif ($ver == "registrarDetalleInvexterno") {
    $controlador = new ventas();
    $controlador->registrodetalleinventarioexterno($_POST['idproductoalmacen'], $_POST['fecha'], $_POST['cantidad'], $_POST['idinventarioexterno']);
} elseif ($ver == "editarDetalleInvexterno") {
    $controlador = new ventas();
    $controlador->editardetalleinventarioexterno($_POST['id'], $_POST['idproductoalmacen'], $_POST['fecha'], $_POST['cantidad']);
} elseif ($ver == "registroPagoCuentaxCobrar") {
    $controlador = new ventas();
    $url = "";

    if (!empty($_FILES['imagen']['name'])) {
        // Si se envió una imagen, moverla al directorio de destino registrarProductoAlmacen
        $filename = $_FILES['imagen']['name'];
        $file_tmp = $_FILES['imagen']['tmp_name'];
        
        // Verificar y crear el directorio de destino si no existe
        $destination_dir = "imagen/";
        if (!file_exists($destination_dir)) {
            mkdir($destination_dir, 0777, true);
        }

        // Mover el archivo al directorio de destino con el mismo nombre original
        $url = $destination_dir . "PagoCXC". rand(10000, 999999) . ".jpg";

        // Mover el archivo al directorio de destino
        if (move_uploaded_file($file_tmp, $url)) {
            //echo "La imagen se movió correctamente a: " . $url;
            // Realizar el registro con la URL de la imagen (puede ser una cadena vacía si no se envió ninguna imagen)
            $controlador->registropagoscredito($_POST['fecha'], $_POST['ncuotas'], 0, $_POST['total'], $_POST['saldo'], $_POST['idestadocobro'], $url);
        } else {
            $res = array("estado" => "error", "mensaje" => "la imagen no se pudo mover");
            echo json_encode($res);
        }
    } else {
        // Si no se envió una imagen pero se proporcionó una URL de imagen en los datos del formulario, usar esa URL
        $url = "";
        // Realizar el registro con la URL de la imagen (puede ser una cadena vacía si no se envió ninguna imagen)
        $controlador->registropagoscredito($_POST['fecha'], $_POST['ncuotas'], 0, $_POST['total'], $_POST['saldo'], $_POST['idestadocobro'], $url);
    }
} elseif ($ver == "registrarmerma") {
    $controlador = new ventas();
    $controlador->registromerma($_POST['almacen'], $_POST['fecha'], $_POST['descripcion'], $_POST['idusuario']);
} elseif ($ver == "editarmerma") {
    $controlador = new ventas();
    $controlador->editarmerma($_POST['id'],$_POST['almacen'], $_POST['fecha'], $_POST['descripcion']);
} elseif ($ver == "registrarDetallemerma") {
    $controlador = new ventas();
    $controlador->registrodetallemerma($_POST['idmerma'], $_POST['cantidad'], $_POST['idproductoalmacen']);
} elseif ($ver == "editarDetallemerma") {
    $controlador = new ventas();
    $controlador->editardetallemerma($_POST['id'], $_POST['idproductoalmacen'], $_POST['cantidad']);
} elseif ($ver == "registrarrobo") {
    $controlador = new ventas();
    $controlador->registrorobo($_POST['almacen'], $_POST['fecha'], $_POST['descripcion'], $_POST['idusuario']);
} elseif ($ver == "editarrobo") {
    $controlador = new ventas();
    $controlador->editarrobo($_POST['id'],$_POST['almacen'], $_POST['fecha'], $_POST['descripcion']);
} elseif ($ver == "registrarDetallerobos") {
    $controlador = new ventas();
    $controlador->registrodetallerobo($_POST['idrobo'], $_POST['cantidad'], $_POST['idproductoalmacen']);
} elseif ($ver == "editarDetallerobos") {
    $controlador = new ventas();
    $controlador->editardetallerobo($_POST['id'], $_POST['idproductoalmacen'], $_POST['cantidad']);
} elseif ($ver == "registroDevolucion") {
    $controlador = new ventas();
    $controlador->registrodevolucion($_POST['motivo'], $_POST['idventa'], $_POST['idusuario']);
} elseif ($ver == "actualizarDetalleDev") {
    $controlador = new ventas();
    $controlador->editardevolucion($_POST['id'], $_POST['cantidad'], $_POST['perdida'], $_POST['cantidadperdida']);
}elseif ($ver == "importar_excel_cliente") { 
    $controlador = new ventas();
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES['file']['tmp_name']; // Ruta temporal del archivo
        $nombreArchivo = $_FILES['file']['name'];
        $idempresa = $_POST['idempresa'] ?? null;
        
        if ($idempresa) {
            $controlador->importar_excel_cliente($archivo, $idempresa);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no proporcionado."]);
        }
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "No se subió ningún archivo o hubo un error en la subida."]);
    }
}elseif ($ver == "importar_excel_proveedor") { 
    $controlador = new compras();
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES['file']['tmp_name']; // Ruta temporal del archivo
        $nombreArchivo = $_FILES['file']['name'];
        $idempresa = $_POST['idempresa'] ?? null;
        
        if ($idempresa) {
            $controlador->importar_excel_proveedor($archivo, $idempresa);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no proporcionado."]);
        }
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "No se subió ningún archivo o hubo un error en la subida."]);
    }
}elseif ($ver == "importar_excel_productos") { 
    $controlador = new mantenimiento();
    
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $archivo = $_FILES['file']['tmp_name']; // Ruta temporal del archivo
        $nombreArchivo = $_FILES['file']['name'];
        $idempresa = $_POST['idempresa'] ?? null;
        
        if ($idempresa) {
            $controlador->importar_excel_productos($archivo, $idempresa);
        } else {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa no proporcionado."]);
        }
    } else {
        echo json_encode(["estado" => "error", "mensaje" => "No se subió ningún archivo o hubo un error en la subida."]);
    }
}elseif ($ver == "control") {
    $controlador = new ConfiguracionInicial();
    $controlador->control($_POST['empresa'],$_POST['sucursal'],$_POST['usuario']);
}
elseif($ver == "subir_pdf"){
    $controlador = new ConfiguracionInicial();
   if( isset($_FILES['file'])){
        $targetDir = __DIR__ . '/pdfs/';
        $targetFile = $targetDir . basename($_FILES['file']['name']);
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'No se pudo guardar el archivo']);
        }
   }
}
elseif($ver == "enviar_factura_email"){
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405); // Method Not Allowed
        echo json_encode(['estado' => 'error', 'message' => 'Método no permitido. Utiliza POST.']);
        exit();
    }

    // Validar que todos los datos necesarios estén presentes
    if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK ||
        !isset($_POST['recipientEmail']) || !isset($_POST['invoiceNumber']) ||
        !isset($_POST['clientName']) || !isset($_POST['nombreEmpresa']) ||
        !isset($_POST['direccionEmpresa']) || !isset($_POST['telefonoEmpresa']) ||
        !isset($_POST['idempresa'])) { // Asegúrate de que todos los parámetros necesarios estén enviados
        
        http_response_code(400); // Bad Request
        echo json_encode(['estado' => 'error', 'message' => 'Faltan datos requeridos para enviar el correo o el PDF está ausente/dañado.']);
        exit();
    }

    // Instanciar la clase y llamar al método precio
    $controlador = new SendInvoiceEmail();
    $controlador->sendEmail(
        $_POST['recipientEmail'],
        $_POST['invoiceNumber'],
        $_POST['clientName'],
        $_POST['nombreEmpresa'],
        $_POST['direccionEmpresa'],
        $_POST['telefonoEmpresa'],
        $_POST['idempresa']  
    );
}
if ($controlador === null) {
    // Acción por defecto si no se encuentra una ruta válida producto sendEmail registrocliente registrarMetodoPagoFactura use
    echo json_encode("El formulario".$_POST['ver']." no existe");
}