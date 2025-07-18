<?php
require_once "configuraciones.php";
require_once "mantenimiento.php";
require_once "compras.php";
require_once "ventas.php";
require_once "facturacion.php";
require_once "reportes.php";
require_once "funciones.php";
require_once "dashboard.php";
require_once "configuracionInicial.php";
require_once "useCotizacion.php";
require_once "useVenta.php";
$ver = explode("/", $_GET['ver']);

$controlador = null;  
if ($ver[0] == "datosusuario") {
    $controlador = new Funciones();
    $controlador->obtenerDatosUsuario($ver[1], $ver[2]);
} elseif ($ver[0] == "listaSucursales") {
    $controlador = new configuracion();
    $controlador->listaSucursales($ver[1]);
} elseif ($ver[0] == "usuarios") {
    $controlador = new configuracion();
    $controlador->listaUsuarios($ver[1]);
}elseif ($ver[0] == "usuariosConfiguracion") {
    $controlador = new configuracion();
    $controlador->listaUsuariosConfiguracion($ver[1]);
} elseif ($ver[0] == "listaResponsable") {
    $controlador = new configuracion();
    $controlador->listaResponsable($ver[1]);
} elseif ($ver[0] == "listaResponsableAlmacen") {
    $controlador = new configuracion();
    $controlador->listaAlmacenesResponsable($ver[1]);
} elseif ($ver[0] == "eliminarResponsableAlmacen") {
    $controlador = new configuracion();
    $controlador->eliminarResponsableAlmacen($ver[1]);
} elseif ($ver[0] == "listaAlmacenAsignado") {
    $controlador = new configuracion();
    $controlador->listaalmacenesAsignados($ver[1]);
} elseif ($ver[0] == "verificarExistenciaResponsable") {
    $controlador = new configuracion();
    $controlador->verificarIdResponsable($ver[1]);
} elseif ($ver[0] == "eliminarResponsable") {
    $controlador = new configuracion();
    $controlador->eliminarResponsable($ver[1]);
} elseif ($ver[0] == "listaResponsablePuntoVenta") {
    $controlador = new configuracion();
    $controlador->listaPuntoVentaResponsable($ver[1]);
} elseif ($ver[0] == "eliminarResponsablePuntoVenta") {
    $controlador = new configuracion();
    $controlador->eliminarPuntoVentaResponsable($ver[1]);
} elseif ($ver[0] == "listaTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->listaTipoAlmacen($ver[1]);
} elseif ($ver[0] == "verificarExistenciaTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->verificarIdTipoAlmacen($ver[1]);
} elseif ($ver[0] == "actualizarEstadoTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->cambiarestadotipoalmacen($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarTipoAlmacen") {
    $controlador = new configuracion();
    $controlador->eliminartipoalmacen($ver[1]);
} elseif ($ver[0] == "listaCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->listaCatproducto($ver[1]);
} elseif ($ver[0] == "verificarExistenciaCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->verificarIdCatProducto($ver[1]);
} elseif ($ver[0] == "actualizarEstadoCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->cambiarestadoCatproducto($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarCategoriaProducto") {
    $controlador = new configuracion();
    $controlador->eliminarCatproducto($ver[1]);
} elseif ($ver[0] == "listaEstadoProducto") {
    $controlador = new configuracion();
    $controlador->listaEstproducto($ver[1]);
} elseif ($ver[0] == "verificarExistenciaEstadoProducto") {
    $controlador = new configuracion();
    $controlador->verificarIdEstProducto($ver[1]);
} elseif ($ver[0] == "actualizarEstadoEstadoProducto") {
    $controlador = new configuracion();
    $controlador->cambiarestadoEstproducto($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarEstadoProducto") {
    $controlador = new configuracion();
    $controlador->eliminarEstproducto($ver[1]);
} elseif ($ver[0] == "listaUnidadProducto") {
    $controlador = new configuracion();
    $controlador->listaUniproducto($ver[1]);
} elseif ($ver[0] == "verificarExistenciaUnidadProducto") {
    $controlador = new configuracion();
    $controlador->verificarIdUniProducto($ver[1]);
} elseif ($ver[0] == "actualizarEstadoUnidadProducto") {
    $controlador = new configuracion();
    $controlador->cambiarestadoUniproducto($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarUnidadProducto") {
    $controlador = new configuracion();
    $controlador->eliminarUniproducto($ver[1]);
} elseif ($ver[0] == "listaCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->listaCaracproducto($ver[1]);
} elseif ($ver[0] == "verificarExistenciaCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->verificarIdCaracProducto($ver[1]);
} elseif ($ver[0] == "actualizarEstadoCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->cambiarestadoCaracproducto($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarCaracteristicaProducto") {
    $controlador = new configuracion();
    $controlador->eliminarCaracproducto($ver[1]);
} elseif ($ver[0] == "listaDivisa") {
    $idempresa = isset($ver[1]) ? $ver[1] : null;
    $token     = isset($ver[2]) ? $ver[2] : null;
    $tipo      = isset($ver[3]) ? $ver[3] : null;

    $controlador = new configuracion();
    $controlador->listaDivisa($idempresa, $token, $tipo);
} elseif ($ver[0] == "verificarExistenciaDivisa") {
    $idEmpresa = isset($ver[1]) ? $ver[1] : null;
    $nombre    = isset($ver[2]) ? $ver[2] : null;
    $tipo      = isset($ver[3]) ? $ver[3] : null;

    $controlador = new configuracion();
    $controlador->verificarIdDivisa($idEmpresa, $nombre, $tipo);

} elseif ($ver[0] == "actualizarEstadoDivisa") {
    $controlador = new configuracion();
    $controlador->cambiarestadoDivisa($ver[1],$ver[2],$ver[3]);
} elseif ($ver[0] == "eliminarDivisa") {
    $controlador = new configuracion();
    $controlador->eliminarDivisa($ver[1]);
} elseif ($ver[0] == "listaTipoCliente") {
    $controlador = new configuracion();
    $controlador->listaTipocliente($ver[1]);
} elseif ($ver[0] == "verificarExistenciaTipoCliente") {
    $controlador = new configuracion();
    $controlador->verificarIdTipocliente($ver[1]);
} elseif ($ver[0] == "actualizarEstadoTipoCLiente") {
    $controlador = new configuracion();
    $controlador->cambiarestadoTipocliente($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarTipoCLiente") {
    $controlador = new configuracion();
    $controlador->eliminarTipocliente($ver[1]);
} elseif ($ver[0] == "listaCanalVenta") {
    $controlador = new configuracion();
    $controlador->listaCanalVenta($ver[1]);
} elseif ($ver[0] == "verificarExistenciaCanalVenta") {
    $controlador = new configuracion();
    $controlador->verificarIdCanalVenta($ver[1]);
} elseif ($ver[0] == "actualizarEstadoCanalVenta") {
    $controlador = new configuracion();
    $controlador->cambiarestadoCanalVenta($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarCanalVenta") {
    $controlador = new configuracion();
    $controlador->eliminarCanalVenta($ver[1]);
} elseif ($ver[0] == "listaLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->listaLeyendaProforma($ver[1]);
} elseif ($ver[0] == "verificarExistenciaLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->verificarIdLeyendaProforma($ver[1]);
} elseif ($ver[0] == "actualizarEstadoLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->cambiarestadoLeyendaProforma($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarLeyendaCotizacion") {
    $controlador = new configuracion();
    $controlador->eliminarLeyendaProforma($ver[1]);
} elseif ($ver[0] == "listaPrecioBase") {
    $controlador = new configuracion();
    $controlador->listaPrecioBase($ver[1]);
} elseif ($ver[0] == "verificarExistenciaPrecioBase") {
    $controlador = new configuracion();
    $controlador->verificarIdPrecioBase($ver[1]);
} elseif ($ver[0] == "listaCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->listaCategoriaPrecio($ver[1]);
} elseif ($ver[0] == "verificarExistenciaCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->verificarIdCategoriaPrecio($ver[1]);
} elseif ($ver[0] == "actualizarEstadoCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->cambiarestadoCategoriaPrecio($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarCategoriaPrecio") {
    $controlador = new configuracion();
    $controlador->eliminarCategoriaPrecio($ver[1]);
} elseif ($ver[0] == "listaPrecioSugerido") {
    $controlador = new configuracion();
    $controlador->listaPrecioSugerido($ver[1]);
} elseif ($ver[0] == "verificarExistenciaPrecioSugerido") {
    $controlador = new configuracion();
    $controlador->verificarIdPrecioSugerido($ver[1]);
} elseif ($ver[0] == "listaLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->listaLeyendaFactura($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "listaLeyendaSIN") {
    $controlador = new Facturacion();
    $controlador->listadoConfigParametricas($ver[1],$ver[2], $ver[3],1);
} elseif ($ver[0] == "verificarExistenciaLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->verificarIdLeyendaFactura($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "actualizarEstadoLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->cambiarestadoLeyendaFactura($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarLeyendaFactura") {
    $controlador = new configuracion();
    $controlador->eliminarLeyendaFactura($ver[1]);
} elseif ($ver[0] == "listaMetodopagoFactura") {
    $controlador = new configuracion();
    $controlador->listaMetodoPagoFactura($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "listaMetodopagoSIN") {
    $controlador = new Facturacion();
    $controlador->listadoConfigParametricas($ver[1],$ver[2],$ver[3],1);
} elseif ($ver[0] == "verificarExistenciaMetodopagoFactura") {
    $controlador = new configuracion();
    $controlador->verificarIdMetodoPagoFactura($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "actualizarEstadoMetodopagoFactura") {
    $controlador = new configuracion();
    $controlador->cambiarestadoMetodoPagoFactura($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarMetodopagoFactura") {
    $controlador = new configuracion();
    $controlador->eliminarMetodoPagoFactura($ver[1]);
} elseif ($ver[0] == "listaParametro") {
    $controlador = new configuracion();
    $controlador->listaParametro($ver[1]);
} elseif ($ver[0] == "eliminarParametro") {
    $controlador = new configuracion();
    $controlador->eliminarParametro($ver[1]);
} elseif ($ver[0] == "verificarExistenciaMedidor") {
    $controlador = new configuracion();
    $controlador->verificarIdParametro($ver[1]);
} elseif ($ver[0] == "listaAlmacen") {
    $controlador = new mantenimiento();
    $controlador->listarAlmacenes($ver[1]);
} elseif ($ver[0] == "verificarExistenciaAlmacen") {
    $controlador = new mantenimiento();
    $controlador->verificarIdAlmacen($ver[1]);
} elseif ($ver[0] == "actualizarEstadoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->cambiarEstadoAlmacen($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarAlmacen") {
    $controlador = new mantenimiento();
    $controlador->eliminaralmacen($ver[1]);
} elseif ($ver[0] == "listaPuntoVenta") {
    $controlador = new mantenimiento();
    $controlador->listaPuntoVenta($ver[1]);
} elseif ($ver[0] == "verificarExistenciaPuntoventa") {
    $controlador = new mantenimiento();
    $controlador->verificarIdPuntoVenta($ver[1]);
} elseif ($ver[0] == "eliminarPuntoventa") {
    $controlador = new mantenimiento();
    $controlador->eliminarPuntoVenta($ver[1]);
} elseif ($ver[0] == "anularPuntoventa") {
    $controlador = new mantenimiento();
    $controlador->anularpuntoVenta($ver[1], $ver[2], $ver[3], $ver[4], $ver[5]);
} elseif ($ver[0] == "listaProducto") {
    $idempresa = isset($ver[1]) ? $ver[1] : null;
    $token     = isset($ver[2]) ? $ver[2] : null;
    $tipo      = isset($ver[3]) ? $ver[3] : null;

    $controlador = new mantenimiento();
    $controlador->listaProductos($idempresa, $token, $tipo);
} elseif ($ver[0] == "listaproductoSIN") {
    $controlador = new Facturacion();
    $controlador->listadoConfigParametricas($ver[1],$ver[2], $ver[3],1);
} elseif ($ver[0] == "verificarExistenciaProducto") {
    $controlador = new mantenimiento();
    $controlador->verificarIdProducto($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "eliminarProducto") {
    $controlador = new mantenimiento();
    $controlador->eliminarProducto($ver[1]);
} elseif ($ver[0] == "listaProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->listarProductoAlmacen($ver[1]);
} elseif ($ver[0] == "listaProductoAlmacenFaltantes") {
    $controlador = new mantenimiento();
    $controlador->productosfaltantes($ver[1], $ver[2]);
} elseif ($ver[0] == "verificarExistenciaProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->verificarIdProductoAlmacen($ver[1]);
} elseif ($ver[0] == "actualizarEstadoProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->cambiarEstadoProductoAlmacen($ver[1], $ver[2]);
} elseif ($ver[0] == "eliminarProductoAlmacen") {
    $controlador = new mantenimiento();
    $controlador->eliminarProductoAlmacen($ver[1]);
} elseif ($ver[0] == "listaMovimiento") {
    $controlador = new mantenimiento();
    $controlador->listaMovimiento($ver[1]);
} elseif ($ver[0] == "comprobantePedido") {
    $controlador = new mantenimiento();
    $controlador->comprobantePedido($ver[1], $ver[2]);
} elseif ($ver[0] == "comprobanteMovimiento") {
    $controlador = new mantenimiento();
    $controlador->comprobanteMovimiento($ver[1], $ver[2]);
} elseif ($ver[0] == "cambiarEstadoPedido") {
    $controlador = new mantenimiento();
    $controlador->cambiarestadopedido($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "listaDetalleMovimiento") {
    $controlador = new mantenimiento();
    $controlador->listaDetalleMovimiento($ver[1]);
} elseif ($ver[0] == "cancelarMovimiento") {
    $controlador = new mantenimiento();
    $controlador->cancelarMovimiento($ver[1]);
} elseif ($ver[0] == "eliminarDetalleMovimiento") {
    $controlador = new mantenimiento();
    $controlador->eliminarDetalleMovimiento($ver[1]);
} elseif ($ver[0] == "productosDisponibles") {
    $controlador = new mantenimiento();
    $controlador->productosDisponibles($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "verificarExistenciaMovimiento") {
    $controlador = new mantenimiento();
    $controlador->verificarIdMovimiento($ver[1]);
} elseif ($ver[0] == "actualizarEstadoMovimiento") {
    $controlador = new mantenimiento();
    $controlador->cambiarestadoMovimiento($ver[1],$ver[2],$ver[3],$ver[4]);
} elseif ($ver[0] == "eliminarMovimiento") {
    $controlador = new mantenimiento();
    $controlador->eliminarMovimiento($ver[1]);
} elseif ($ver[0] == "verificarExistenciaDetalleMovimiento") {
    $controlador = new mantenimiento();
    $controlador->verificarIddetallemovimiento($ver[1]);
} elseif ($ver[0] == "campanas") {
    $controlador = new mantenimiento();
    $controlador->listaCampañas($ver[1]);
} elseif ($ver[0] == "verificarExistenciacampana") {
    $controlador = new mantenimiento();
    $controlador->verificarIdcampaña($ver[1]);
} elseif ($ver[0] == "actualizarEstadocampana") {
    $controlador = new mantenimiento();
    $controlador->cambiarestadoCampaña($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarcampana") {
    $controlador = new mantenimiento();
    $controlador->eliminarCampaña($ver[1]);
} elseif ($ver[0] == "listacategoriapreciocampaña") {
    $controlador = new mantenimiento();
    $controlador->listacategoriaprecio($ver[1]);
} elseif ($ver[0] == "eliminarcategoriapreciocampaña") {
    $controlador = new mantenimiento();
    $controlador->eliminarcategoriaprecio($ver[1]);
} elseif ($ver[0] == "listapreciocampaña") {
    $controlador = new mantenimiento();
    $controlador->listaPreciocampaña($ver[1]);
} elseif ($ver[0] == "listaProveedor") {
    $controlador = new compras();
    $controlador->listarProveedores($ver[1]);
} elseif ($ver[0] == "eliminarProveedor") {
    $controlador = new compras();
    $controlador->eliminarproveedor($ver[1]);
} elseif ($ver[0] == "verificarExistenciaProveedor") {
    $controlador = new compras();
    $controlador->verificarIdproveedor($ver[1]);
} elseif ($ver[0] == "listaPedido") {
    $controlador = new compras();
    $controlador->listaPedidos($ver[1]);
} elseif ($ver[0] == "listaDetallePedido") {
    $controlador = new compras();
    $controlador->listaDetallePedido($ver[1]);
} elseif ($ver[0] == "cancelarPedido") {
    $controlador = new compras();
    $controlador->cancelarPedido($ver[1]);
} elseif ($ver[0] == "verificarExistenciaDetallePedido") {
    $controlador = new compras();
    $controlador->verificarIDdetallepedido($ver[1]);
} elseif ($ver[0] == "eliminarDetallePedido") {
    $controlador = new compras();
    $controlador->eliminarDetallePedido($ver[1]);
} elseif ($ver[0] == "ListaProductosPedido") {
    $controlador = new compras();
    $controlador->listaProductoPedido($ver[1], $ver[2]);
} elseif ($ver[0] == "verificarExistenciaPedido") {
    $controlador = new compras();
    $controlador->verificarIDpedido($ver[1]);
} elseif ($ver[0] == "actualizarEstadoPedido") {
    $controlador = new compras();
    $controlador->cambiarestadoPedido($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarPedido") {
    $controlador = new compras();
    $controlador->eliminarPedido($ver[1]);
} elseif ($ver[0] == "listaCompra") {
    $controlador = new compras();
    $controlador->listaCompra($ver[1]);
} elseif ($ver[0] == "cancelarCompra") {
    $controlador = new compras();
    $controlador->cancelarCompra($ver[1]);
} elseif ($ver[0] == "listaDetalleCompra") {
    $controlador = new compras();
    $controlador->listaDetalleCompra($ver[1]);
} elseif ($ver[0] == "verificarIDdetallecompra") {
    $controlador = new compras();
    $controlador->verificarIDdetallecompra($ver[1]);
} elseif ($ver[0] == "eliminarDetalleCompra") {
    $controlador = new compras();
    $controlador->eliminarDetalleCompra($ver[1]);
} elseif ($ver[0] == "ListaProductosCompra") {
    $controlador = new compras();
    $controlador->listaProductoCompra($ver[1], $ver[2]);
} elseif ($ver[0] == "verificarExistenciaCompra") {
    $controlador = new compras();
    $controlador->verificarIDCompra($ver[1]);
} elseif ($ver[0] == "actualizarEstadoCompra") {
    $controlador = new compras();
    $controlador->cambiarestadoCompra($ver[1],$ver[2],$ver[3],$ver[4]);
} elseif ($ver[0] == "eliminarCompra") {
    $controlador = new compras();
    $controlador->eliminarCompra($ver[1]);
} elseif ($ver[0] == "listaCliente") {
    $controlador = new ventas();
    $controlador->listarCliente($ver[1]);
} elseif ($ver[0] == "listaSucursal") {
    $controlador = new ventas();
    $controlador->listaSucursal($ver[1]);
} elseif ($ver[0] == "eliminarSucursal") {
    $controlador = new ventas();
    $controlador->eliminarsucursal($ver[1]);
} elseif ($ver[0] == "verificarExistenciaSucursal") {
    $controlador = new ventas();
    $controlador->verificarIdsucursal($ver[1]);
} elseif ($ver[0] == "verificarExistenciaCliente") {
    $controlador = new ventas();
    $controlador->verificarIdcliente($ver[1]);
} elseif ($ver[0] == "eliminarCliente") {
    $controlador = new ventas();
    $controlador->eliminarcliente($ver[1]);
} elseif ($ver[0] == "listaCampañasDisponible") {
    $controlador = new ventas();
    $controlador->listaCampañasDisponibles($ver[1]);
} elseif ($ver[0] == "listaCategoriasCampanas") {
    $controlador = new ventas();
    $controlador->listaCategoriasCampañasDisponibles($ver[1]);
} elseif ($ver[0] == "listaProductosDisponiblesVenta") {
    $controlador = new ventas();
    $controlador->listaProductosDisponiblesVenta($ver[1]);
} elseif ($ver[0] == "listaPuntoVentaFactura") {
    $controlador = new ventas();
    $controlador->listaPuntoVentaFactura($ver[1]);
} elseif ($ver[0] == "ValidarNit") {
    $controlador = new Facturacion();
    $controlador->validarNIT($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "detallesVenta") {
    $controlador = new ventas();
    $controlador->detalleVenta($ver[1], $ver[2]);
} elseif ($ver[0] == "detallesCotizacion") {
    $controlador = new UseCotizacion();
    $controlador->detallecotizacion($ver[1], $ver[2]);
} elseif ($ver[0] == "listaVentas") {
    $controlador = new ventas();
    $controlador->listadoventas($ver[1]);
} elseif ($ver[0] == "listadoanulaciones") {
    $controlador = new ventas();
    $controlador->listadoanulaciones($ver[1]);
} elseif ($ver[0] == "listadetalledevolicion") {
    $controlador = new ventas();
    $controlador->listadetalledevolucion($ver[1]);
} elseif ($ver[0] == "listadevolucion") {
    $controlador = new ventas();
    $controlador->listadevolucion($ver[1]);
} elseif ($ver[0] == "verificardevolucion") {
    $controlador = new ventas();
    $controlador->verificardevolucion($ver[1]);
} elseif ($ver[0] == "verificarExistenciaDetalledevolucion") {
    $controlador = new ventas();
    $controlador->verificarIddevolucion($ver[1]);
} elseif ($ver[0] == "autorizarDevolucion") {
    $controlador = new ventas();
    $controlador->cambiarestadodevolucion($ver[1],$ver[2],$ver[3]);
} elseif ($ver[0] == "eliminarDevolucion") {
    $controlador = new ventas();
    $controlador->eliminardevolucion($ver[1]);
} elseif ($ver[0] == "estadofactura") {
    $controlador = new Facturacion();
    $controlador->estadofactura($ver[1],$ver[2],$ver[3],1);
} elseif ($ver[0] == "cambiarcreditomoroso") {
    $controlador = new ventas();
    $controlador->cambiarcreditomoroso($ver[1], $ver[2]);
} elseif ($ver[0] == "cambiarestadoventa") {
    $controlador = new ventas();
    $controlador->cambiarestadoventa($ver[1], $ver[2], $ver[3], $ver[4], $ver[5], $ver[6]);
} elseif ($ver[0] == "listacuentasxcobrar") {
    $controlador = new ventas();
    $controlador->listaCuentasporCbrar($ver[1]);
} elseif ($ver[0] == "listadetallecobros") {
    $controlador = new ventas();
    $controlador->detallepagoscredito($ver[1]);
} elseif ($ver[0] == "listainventarioexterno") {
    $controlador = new ventas();
    $controlador->listainventarioexterno($ver[1]);
} elseif ($ver[0] == "cancelarInventarioexterno") {
    $controlador = new ventas();
    $controlador->cancelarInventarioExterno($ver[1]);
} elseif ($ver[0] == "listaProductosInvExterno") {
    $controlador = new ventas();
    $controlador->listadoProductosInvExterno($ver[1],$ver[2]);
} elseif ($ver[0] == "listadetalleInvExterno") {
    $controlador = new ventas();
    $controlador->detalleinventarioexterno($ver[1]);
} elseif ($ver[0] == "verificarExistenciainvexterno") {
    $controlador = new ventas();
    $controlador->verificarIdinvexterno($ver[1]);
} elseif ($ver[0] == "cambiarEstadoinvexterno") {
    $controlador = new ventas();
    $controlador->cambiarestadoexternal($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarinvexterno") {
    $controlador = new ventas();
    $controlador->eliminarinventarioexterno($ver[1]);
} elseif ($ver[0] == "verificarExistenciaDetalleInv") {
    $controlador = new ventas();
    $controlador->verificarIddetalleinvexterno($ver[1]);
} elseif ($ver[0] == "eliminardetalleinvexterno") {
    $controlador = new ventas();
    $controlador->eliminardetalleinventarioexterno($ver[1]);
} elseif ($ver[0] == "cancelarMerma") {
    $controlador = new ventas();
    $controlador->cancelarMerma($ver[1]);
} elseif ($ver[0] == "listamerma") {
    $controlador = new ventas();
    $controlador->listamermas($ver[1]);
} elseif ($ver[0] == "listaDetallemerma") {
    $controlador = new ventas();
    $controlador->detallemerma($ver[1]);
} elseif ($ver[0] == "verificarExistenciaDetalleMerma") {
    $controlador = new ventas();
    $controlador->verificarIddetallemerma($ver[1]);
} elseif ($ver[0] == "eliminarDetallemerma") {
    $controlador = new ventas();
    $controlador->eliminardetallemerma($ver[1]);
} elseif ($ver[0] == "ListaProductosmerma") {
    $controlador = new ventas();
    $controlador->listaProductomerma($ver[1], $ver[2]);
} elseif ($ver[0] == "verificarExistenciamerma") {
    $controlador = new ventas();
    $controlador->verificarIdmerma($ver[1]);
} elseif ($ver[0] == "actualizarEstadomerma") {
    $controlador = new ventas();
    $controlador->cambiarestadomerma($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarmerma") {
    $controlador = new ventas();
    $controlador->eliminarmerma($ver[1]);
} elseif ($ver[0] == "listarobo") {
    $controlador = new ventas();
    $controlador->listarobo($ver[1]);
} elseif ($ver[0] == "listaDetallerobo") {
    $controlador = new ventas();
    $controlador->detallerobo($ver[1]);
} elseif ($ver[0] == "cancelarRobo") {
    $controlador = new ventas();
    $controlador->cancelarRobo($ver[1]);
} elseif ($ver[0] == "verificarIDdetallerobo") {
    $controlador = new ventas();
    $controlador->verificarIddetallerobo($ver[1]);
} elseif ($ver[0] == "eliminarDetallerobo") {
    $controlador = new ventas();
    $controlador->eliminardetallerobo($ver[1]);
} elseif ($ver[0] == "ListaProductosrobo") {
    $controlador = new ventas();
    $controlador->listaProductorobo($ver[1], $ver[2]);
} elseif ($ver[0] == "verificarExistenciarobo") {
    $controlador = new ventas();
    $controlador->verificarIdrobo($ver[1]);
} elseif ($ver[0] == "actualizarEstadorobo") {
    $controlador = new ventas();
    $controlador->cambiarestadorobo($ver[1],$ver[2]);
} elseif ($ver[0] == "eliminarrobo") {
    $controlador = new ventas();
    $controlador->eliminarrobo($ver[1]);
} elseif ($ver[0] == "reporteproductoalmacen") {
    $controlador = new reportes();
    $controlador->reporteproductoalmacen($ver[1], $ver[2]);
} elseif ($ver[0] == "reportepedidos") {
    $controlador = new reportes();
    $controlador->reportepedidos($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reportecompras") {
    $controlador = new reportes();
    $controlador->reportecompras($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reportemovimiento") {
    $controlador = new reportes();
    $controlador->reportemoviento($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reportemerma") {
    $controlador = new reportes();
    $controlador->reportemermas($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reporterobo") {
    $controlador = new reportes();
    $controlador->reporterobos($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reporteventas") {
    $controlador = new reportes();
    $controlador->reporteventas($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reportecotizacion") {
    $controlador = new reportes();
    $controlador->reportecotizacion($ver[1], $ver[2], $ver[3]);
} 
elseif ($ver[0] == "reportecreditos") {
    // This block handles the "reportecreditos" action/route.
    $controlador = new reportes();
    $idmd5 = $ver[1] ?? null; // Use null coalescing operator for safer access
    $fechai = $ver[2] ?? null;
    $fechaf = $ver[3] ?? null;

    // Optional: Add basic checks for null values if parameters are mandatory
    if ($idmd5 === null || $fechai === null || $fechaf === null) {
        // Handle missing parameters, e.g., return an error JSON response
        header('Content-Type: application/json');
        echo json_encode(["estado" => "error", "mensaje" => "Parámetros incompletos para el reporte de créditos."]);
        // You might want to log this for debugging: error_log("Missing parameters for reportecreditos.");
    } else {
        // All parameters are present, proceed with the call
        $controlador->reporteCreditos($idmd5, $fechai, $fechaf);
    }
}
elseif ($ver[0] == "reporteCreditosAlCorte") {
    // This block handles the "reportecreditos" action/route.
    $controlador = new reportes();
    $idmd5 = $ver[1] ?? null; // Use null coalescing operator for safer access
    $fechaf = $ver[3] ?? null;

    // Optional: Add basic checks for null values if parameters are mandatory
    if ($idmd5 === null || $fechaf === null) {
        // Handle missing parameters, e.g., return an error JSON response
        header('Content-Type: application/json');
        echo json_encode(["estado" => "error", "mensaje" => "Parámetros incompletos para el reporte de créditos."]);
        // You might want to log this for debugging: error_log("Missing parameters for reportecreditos.");
    } else {
        // All parameters are present, proceed with the call detallecotizacion
        $controlador->reporteCreditosAlCorte($idmd5, $fechaf);
    }
}
elseif ($ver[0] == "reportecreditosatrasados") {
    $controlador = new reportes();
    $controlador->reportecreditosatrasados($ver[1], $ver[2]);
} elseif ($ver[0] == "reportepreciobase") {
    $controlador = new reportes();
    $controlador->reportepreciobase($ver[1]);
} elseif ($ver[0] == "reportecategoriaprecio") {
    $controlador = new reportes();
    $controlador->reportecategoriasprecio($ver[1]);
} elseif ($ver[0] == "reportecampaña") {
    $controlador = new reportes();
    $controlador->reportecampañas($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reporteventacampaña") {
    $controlador = new reportes();
    $controlador->reporteventacampañas($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reporteindicerotacioncliente") {
    $controlador = new reportes();
    $controlador->reporterotacionxcliente($ver[1], $ver[2], $ver[3], $ver[4]);
} elseif ($ver[0] == "reporteindicerotacionalmacen") {
    $controlador = new reportes();
    $controlador->reporterotacionxalmacen($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reporteindicerotacionglobal") {
    $controlador = new reportes();
    $controlador->reporterotacionglobal($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "kardex") {
    $controlador = new reportes();
    $controlador->kardex($ver[1], $ver[2], $ver[3], $ver[4]);
} elseif ($ver[0] == "reporteventasporproductos") {
    $controlador = new reportes();
    $controlador->reporteventasporproductos($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reporteventasporproductosglobal") {
    $controlador = new reportes();
    $controlador->reporteventasporproductosglobal($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reportecomprasporproductos") {
    $controlador = new reportes();
    $controlador->reportecomprasdetalladas($ver[1], $ver[2], $ver[3]);
} elseif ($ver[0] == "reporteinventarioexterno") {
    $controlador = new reportes();
    $controlador->reporteinvexternoproducto($ver[1]);
} elseif ($ver[0] == "listadeventasempresa") {
    $controlador = new ventas();
    $controlador->listaVentasContabilidad($ver[1]);
}elseif($ver[0] == "productos_preferidos"){
    $controlador = new Dashboard();
    $controlador->productos_preferidos($ver[1]);
}elseif($ver[0] == "ventas_porCategoria"){
    $controlador = new Dashboard();
    $controlador->ventas_porCategoria($ver[1]);
}elseif($ver[0] == "stock_productos_dashboard"){
    $controlador = new Dashboard();
    $controlador->stock_productos_dashboard($ver[1],$ver[2]);
}elseif($ver[0] == "mayor_compra"){
    $controlador = new Dashboard();
    $controlador->mayor_compra($ver[1],$ver[2]);
}elseif($ver[0] == "mayor_frecuencia_decompra"){
    $controlador = new Dashboard();
    $controlador->mayor_frecuencia_decompra($ver[1],$ver[2]);
}elseif($ver[0] == "fechas_venta_cliente"){
    $controlador = new Dashboard();
    $controlador->fechas_venta_cliente($ver[1],$ver[2]);
}elseif($ver[0] == "stock_bajos"){
    $controlador = new Dashboard();
    $controlador->stock_bajos($ver[1],$ver[2]);
}elseif($ver[0] == "productos_mayor_venta_monetario"){
    $controlador = new Dashboard();
    $controlador->productos_mayor_venta_monetario($ver[1]);
}
//================================= ELIMINAR ====================================  detallesVenta listaResponsable
elseif($ver[0] == "obtenerNumeroFacturaDisponible"){
    $controlador = new ventas();
    $controlador->obtenerNumeroFacturaDisponible($ver[1],$ver[2]);
}
elseif($ver[0] == "calcularCrecimiento"){
    $controlador = new reportes();
    $controlador->calcularCrecimiento($ver[1],$ver[2],$ver[3]);
}
elseif($ver[0] == "calcularTotalIngreso"){
    $controlador = new reportes();
    $controlador->calcularTotalIngreso($ver[1]);
}
elseif($ver[0] == "empresaRegistrada"){
    $controlador = new ConfiguracionInicial();
    $controlador->empresaRegistradajs($ver[1]);
}
elseif ($ver[0] == "mensajePedidoWhatsapp") {
    $controlador = new compras();
    $controlador->generarMensajePedidoWhatsapp($ver[1]);
}
elseif ($ver[0] == "getPedido_") {
    $controlador = new compras(); // Asegúrate de que exista esta clase
    $controlador->getPedido_($ver[1],$ver[2]);
}
elseif ($ver[0] == "verificarDetallePedido") {
    $controlador = new compras();
    $controlador->verificarDetallePedido($ver[1]); // $ver[1] es el id del pedido
}
elseif ($ver[0] == "obtenerEmailCliente") {
    $controlador = new ventas();
    $controlador->obtenerEmailCliente($ver[1]); // $ver[1] es el id del pedido precio
} 
elseif ($ver[0] == "getDailyCollectionsJson") {
    
    $controlador = new reportes();
    // 2. Validate and clean input parameters from $ver array
    // This is a crucial step before passing to the function.
    // Ensure all expected parameters exist to avoid undefined index errors.
    $fechaInicio = $ver[1] ?? null; // Use null coalescing operator for safety
    $fechaFin = $ver[2] ?? null;
    $idmd5 = $ver[3] ?? null;

    // 3. Basic validation before calling the function
    if ($fechaInicio && $fechaFin && $idmd5) {
        $controlador->getDailyCollectionsJson($fechaInicio, $fechaFin, $idmd5);
    } else {
        // Handle missing parameters: send a 400 Bad Request response
        header('Content-Type: application/json', true, 400);
        echo json_encode(['error' => 'Missing required parameters for getDailyCollectionsJson.']);
        // It's good practice to exit after sending a response in an API endpoint
        exit();
    }
}
elseif($ver[0]== "procesar_ventas_pendientes"){
    $controlador = new UseVEnta();
    $respuesta = $controlador->_procesar_ventas_pendientes($ver[1], $ver[2], $ver[3]); // idventaND, idproductoalmacen, cantidad
    echo json_encode($respuesta);

}
elseif($ver[0]== "listar_ventas_no_despachadas"){
    $controlador = new UseVEnta();
    $respuesta = $controlador->_listar_ventas_no_despachadas($ver[1]); // idventaND, idproductoalmacen, cantidad
    echo json_encode($respuesta);

}
if ($controlador === null) {
    // Acción por defecto si no se encuentra una ruta valida comprobantePedido detallesCotizacion
    echo json_encode(array("error" => "La ruta ".$_GET['ver']." no existe"));
}