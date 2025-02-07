<?php
require_once "./config/divisa_conf.php";
require_once "./config/medidas_conf.php";
require_once "./config/seccion_conf.php";
require_once "./config/envase_conf.php";
require_once "./config/material_conf.php";
require_once "./config/listaCompra_conf.php";
require_once "./config/maquina_conf.php";
require_once "./config/producto_conf.php";
require_once "./config/rubro_conf.php";
require_once "./config/conservacion_conf.php";
require_once "./config/proveedor_conf.php";
require_once "./config/producto_categorias.php";
require_once "./config/producto_estado.php";
require_once "./config/producto_medida.php";
require_once "./config/producto_unidad.php";
require_once "./config/grupo_conf.php";
require_once "./config/etapas_produccion_conf.php";
require_once "./config/sub_producto_conf.php";
require_once "./config/etapa_produccion_registrar.php";
require_once "./controlCalidad/controlCalidad.php";
require_once "./almacen_productos/orden_produccion.php";
require_once "./config/categoria_conf.php";
require_once "./config/caracteristicaComercial_conf.php";
require_once "./listaSolicitud/listaSolicitud_conf.php";
require_once "./config/listaCompra_conf.php";
require_once "./config/caracteristicas_conf.php";
require_once "./controlCalidad/controlCalidad.php";
require_once "./listaSolicitud/editarRegistros.php";
require_once "./almacen_productos/orden_produccion.php";
require_once "./lote/lote.php";
require_once "./config/proveedor_conf.php";
require_once "./etapa_produccion/grupo_etapas.php";
require_once "./estandar_producto/estandarProducto.php";
require_once "./almacenMaterial/almacenMaterial.php";
require_once "./config/unidadTiempo_conf.php";
require_once "./etapa_produccion/usoMaquina.php";
require_once "./listaSolicitud/compra.php";
require_once "./almacen_productos/stock_productos.php";
require_once "./config/empleado.php";
require_once "./etapa_produccion/estandar_etapa_produccion.php";
require_once "./config/limpieza.php";
require_once "./controlCalidad/devoluciones.php";
require_once "./config/mantenimiento.php";
require_once "./contingencias/riesgo.php";
require_once "./contingencias/recurso_riesgo.php";
require_once "./contingencias/emergencia.php";
require_once "./contingencias/procedimiento.php";
require_once "./empleado_rh/contrataciones.php";
require_once "./empleado_rh/modopago.php";
require_once "./gastos/costo_produccion.php";
require_once "./gastos/gastos_generales.php";
require_once "./despachar/despachar_producto.php";
require_once "./merma_fisico/alma_fisic_merma.php";

$ver=$_POST['ver'];

if($ver=="registrar_divisa"){// esto sale del hidden del input que esta en el formulario
    $obj = new Divisa_conf();
  
    $obj->registrar_divisa($_POST['nombre'], $_POST['tipo_divisa'],1,$_POST['empresa'],null); 
}elseif($ver=="editar_divisa"){
    //registroCaracteristicas
    $obj=new Divisa_conf(); 
    $obj->editar_divisa($_POST['id'],$_POST['nombre'], $_POST['tipo_divisa'],$_POST['empresa']);
    
}elseif($ver=="registroMedidas") { // esto sale del hidden del input que esta en el formulario
    $obj = new Medidas_conf();
    $obj->registroMedidas($_POST['nombre'], $_POST['sigla'],$_POST['empresa']);
}elseif($ver=="editar_Medida") { // esto sale del hidden del input que esta en el formulario
    $obj = new Medidas_conf();
    $obj->editar_Medida($_POST['id'],$_POST['nombre'], $_POST['sigla'],$_POST['empresa']);
}elseif($ver=="registro_seccion") {// esto sale del hidden del6 input que esta en el formulario
    $obj = new Seccion_conf();
    $obj->registro_seccion($_POST['nombre_seccion'],$_POST['ubicacion'],$_POST['codigo_seccion'],$_POST['rubro_idrubro'],$_POST['empresa']);
}elseif($ver=="editar_seccion") {
    $obj = new Seccion_conf();
    $obj->editar_seccion($_POST['id'],$_POST['nombre_seccion'],$_POST['ubicacion'],$_POST['codigo_seccion'],$_POST['rubro_idrubro'],$_POST['empresa']);
}elseif($ver=="registroEnvase") {// esto sale del hidden del input que esta en el formulario
    $envase = new Envase_conf();
    $envase->registroEnvases($_POST['nombre'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="editarEnvase"){
    if (isset($_POST['id'], $_POST['nombre'], $_POST['detalle'],$_POST['empresa'])) {
        $envase = new Envase_conf();
        $envase->editar_envase($_POST['id'], $_POST['nombre'],$_POST['detalle'], $_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud"));
    }
}elseif($ver=="registrar_material"){
    $mat = new Material_config();
    $mat->registrar_material($_POST['fecha'],$_POST['hora'],$_POST['nombre'],$_POST['estado'],$_POST['codigo'],$_POST['precio'],$_POST['divisa_iddivisa'],$_POST['empresa'],$_POST['tipo'],$_POST['medida'],$_POST['seccion'],$_POST['rubro_idrubro']);
}elseif($ver=="editar_material"){
    $mat = new Material_config();
    $mat->editar_material($_POST['id'],$_POST['nombre'],$_POST['estado'],$_POST['codigo'],$_POST['precio'],$_POST['divisa_iddivisa'],$_POST['empresa'],$_POST['tipo'],$_POST['medida'],$_POST['seccion'],$_POST['rubro_idrubro']);
}elseif($ver=="registrar_tipo_material"){
    $mat = new Material_config();
    $mat->registrar_tipo_material($_POST['nombre'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="editar_tipo_material"){
    $mat = new Material_config();
    $mat->editar_tipo_material($_POST['id'],$_POST['nombre'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="editar_estado"){
    $mat = new Material_config();
    $mat->editar_estado($_POST['id_mat'],$_POST['estado_mat'],$_POST['empresa']);
}elseif($ver=="registrar_ListaCompra"){
    if(isset($_POST['cantidadEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa'])){
        // echo json_encode(array("okkkk", "perfecto entraste", "registrar_listaCompra"));
        $lcompra = new ListaCompra_conf();
        $lcompra->registrar_listaCompra($_POST['cantidadEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_listaCompra"));
    }
}elseif($ver=="registrar_PedidoCompra"){
    if(isset($_POST['fecha'],$_POST['hora'],$_POST['empresa'])){
        //  echo json_encode(array("okkkk", "perfecto entraste", "registrar_listaCompra"));
        $lcompra = new ListaCompra_conf();
        $lcompra->registrar_pedidoCompra($_POST['fecha'],$_POST['hora'],$_POST['usuario'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_listaCompra"));
    }
}elseif($ver=="registrar_tipomaquina"){
    $maq = new Maquina_conf();
    $maq->registrar_tipomaquina($_POST['tipo'],$_POST['detalle'],$_POST['empresa']);
}elseif($ver=="editar_tipomaquina"){
    if (isset($_POST['id'], $_POST['tipo'], $_POST['detalle'], $_POST['empresa'])) {
        $maq = new Maquina_conf();
        $maq->editar_tipomaquina($_POST['id'], $_POST['tipo'], $_POST['detalle'], $_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_tipomaquina"));
    }
 
}elseif($ver=="registrar_maquina"){
    if(isset($_POST['nombre'],$_POST['tipo'],$_POST['seccion'],$_POST['rubro_idrubro'])){
        $maq = new Maquina_conf();
        $maq->registrar_maquina($_POST['nombre'],$_POST['estado'],$_POST['tipo'],$_POST['seccion'],$_POST['rubro_idrubro'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_maquina"));
    }
}elseif($ver=="editar_maquina"){
    if(isset($_POST['id'],$_POST['nombre'],$_POST['tipo'],$_POST['seccion'],$_POST['rubro_idrubro'],$_POST['empresa'])){
        $maq = new Maquina_conf();
        $maq->editar_maquina($_POST['id'],$_POST['nombre'],$_POST['tipo'],$_POST['seccion'],$_POST['rubro_idrubro'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_maquina"));
    }
}elseif($ver=="editar_estado_maquina"){
    if(isset($_POST['id'],$_POST['estado'])){
        $maq = new Maquina_conf();
        $maq->editar_estado_maquina($_POST['id'],$_POST['estado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_estado_maquina"));
    }
}elseif($ver=="registrar_variable_proceso"){
    if(isset($_POST['variable'],$_POST['detalle'],$_POST['idmaquina'])){
        $maq = new Maquina_conf();
        $maq->registrar_variable_proceso($_POST['variable'],$_POST['detalle'],$_POST['idmaquina']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_estado_maquina"));
    }
}elseif($ver=="editar_variable_proceso"){
    if(isset($_POST['id'],$_POST['variable'],$_POST['detalle'],$_POST['idmaquina'])){
        $maq = new Maquina_conf();
        $maq->editar_variable_proceso($_POST['id'],$_POST['variable'],$_POST['detalle'],$_POST['idmaquina']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_variable_proceso"));
    }
}elseif($ver=="registrar_rubro"){
    if(isset($_POST['rubro'],$_POST['detalle'],$_POST['empresa'])){
        $maq = new Rubro_conf();
        $maq->registrar_rubro($_POST['rubro'],$_POST['detalle'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_rubro"));
    }
}elseif($ver=="editar_rubro"){
    if(isset($_POST['id'],$_POST['rubro'],$_POST['detalle'],$_POST['empresa'])){
        $maq = new Rubro_conf();
        $maq->editar_rubro($_POST['id'],$_POST['rubro'],$_POST['detalle'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_rubro"));
    }
}elseif($ver=="registrar_producto"){
    if(isset($_POST['nombre'],$_POST['codigo'],$_POST['estado'],$_POST['medida'],$_POST['rubro'],$_POST['seccion'],$_POST['cantidad'],$_POST['tiempo'],$_POST['unidadtiempo'])){
        $maq = new Producto_conf();
        $maq->registrar_producto($_POST['nombre'],$_POST['codigo'],$_POST['estado'],$_POST['medida'],$_POST['rubro'],$_POST['seccion'],$_POST['cantidad'],$_POST['tiempo'],$_POST['unidadtiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_producto"));
    }
}elseif($ver=="editar_producto"){
    
    if(isset($_POST['id'],$_POST['nombre'],$_POST['codigo'],$_POST['estado'],$_POST['medida'],$_POST['rubro'],$_POST['seccion'],$_POST['idestandar'],$_POST['cantidad'],$_POST['tiempo'],$_POST['unidadtiempo'])){
        $maq = new Producto_conf();
     
    }else{
        echo json_encode(array("Info", "Faltan parámetros en la solicitud", "editar_producto"));
    }
}elseif($ver=="editar_estado_producto"){
  
    if(isset($_POST['id'],$_POST['estado'])){
        $maq = new Producto_conf();
        $maq->editar_estado_producto($_POST['id'],$_POST['estado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_estado_producto"));
    }
}elseif($ver=="registrar_conservacion"){
    
    if(isset($_POST['duracion'],$_POST['temperatura'], $_POST['humedad'],$_POST['exp_luz'],$_POST['unidadtiempo']) ) {
        $pro = new Conservacion_conf();
        $pro -> registrar_conservacion($_POST['duracion'],$_POST['temperatura'], $_POST['humedad'],$_POST['exp_luz'],$_POST['idgrupo'],$_POST['unidadtiempo']);

    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_conservacion"));
    }
}elseif($ver=="editar_conservacion"){
    if(isset($_POST['id'],$_POST['duracion'],$_POST['temperatura'], $_POST['humedad'],$_POST['exp_luz'],$_POST['unidadtiempo'],$_POST['idgrupo']) ) {
        $pro = new Conservacion_conf();
        $pro -> editar_conservacion($_POST['id'],$_POST['duracion'],$_POST['temperatura'], $_POST['humedad'],$_POST['exp_luz'],$_POST['idgrupo'],$_POST['unidadtiempo']);

    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "Editar_conservacionProducto"));
    }
}elseif($ver=="Registrar_caracteristicasConservacion_two"){
    if(isset($_POST['usuario'],$_POST['caracteristica'],$_POST['descripcion'],$_POST['prioridad'],$_POST['observaciones'],$_POST['idconservacion']) ) {
        $pro = new Conservacion_conf();
        $pro ->Registrar_caracteristicasConservacion_two($_POST['usuario'],$_POST['caracteristica'],$_POST['descripcion'],$_POST['prioridad'],$_POST['observaciones'],$_POST['idconservacion']);

    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "Editar_conservacionProducto"));
    }
}elseif($ver=="Editar_caracteristicaConservacion"){
    if(isset($_POST['idcaracteristica'],$_POST['usuario'],$_POST['caracteristica'],$_POST['descripcion'],$_POST['prioridad'],$_POST['observaciones']) ) {
        $pro = new Conservacion_conf();
        $pro ->Editar_caracteristicaConservacion($_POST['idcaracteristica'],$_POST['usuario'],$_POST['caracteristica'],$_POST['descripcion'],$_POST['prioridad'],$_POST['observaciones']);

    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "Editar_conservacionProducto"));
    }
}elseif($ver=="registroProveedor"){
    if(isset($_POST['nombre_proveedor'],$_POST['codigo'],$_POST['nit'],$_POST['detalle'],$_POST['direccion'],$_POST['telefono'],$_POST['mobil'],$_POST['email'],$_POST['web'],$_POST['pais'],$_POST['ciudad'],$_POST['zona'],$_POST['contacto'],$_POST['empresa'])){
        $prov = new Proveedor_conf();
        $prov->registrar_proveedor($_POST['nombre_proveedor'],$_POST['codigo'],$_POST['nit'],$_POST['detalle'],$_POST['direccion'],$_POST['telefono'],$_POST['mobil'],$_POST['email'],$_POST['web'],$_POST['pais'],$_POST['ciudad'],$_POST['zona'],$_POST['contacto'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro proveedor",$_POST['nombre_proveedor'],$_POST['codigo'],$_POST['nit'],$_POST['detalle'],$_POST['direccion'],$_POST['telefono'],$_POST['mobil'],$_POST['email'],$_POST['web'],$_POST['pais'],$_POST['ciudad'],$_POST['zona'],$_POST['contacto'],$_POST['empresa']));
    }
}
// elseif($ver=="registrar_proveedor_material"){
//     if(isset($_POST['proveedor'],$_POST['material'],$_POST['empresa'])){
//         $prov = new Proveedor_conf();
//         $prov->registrar_proveedor_material($_POST['proveedor'],$_POST['material'],$_POST['empresa']);
//     }else{
//         echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro proveedor",$_POST['proveedor'],$_POST['material'],$_POST['empresa']));
//     }
// }
elseif($ver=="registroCategoria"){
    if(isset($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa'],$_POST['idp'])){
        $proc = new Producto_categorias();
        $proc->registroCategoria($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa'],$_POST['idp']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registroCategoria"));
    }
}elseif($ver=="editar_categoria"){
    if(isset($_POST['id'],$_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_categorias();
        $proc->editar_categoria($_POST['id'],$_POST['empresa'],$_POST['nombre'],$_POST['descripcion'],$_POST['estado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_categoria"));
    }
}elseif($ver=="editar_estado_categoria"){
    
    if(isset($_POST['id'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_categorias();
        $proc->editar_estado_categoria($_POST['id'],$_POST['estado'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_estado_categoria"));
    }
}elseif($ver=="registro_estado_producto"){
    if(isset($_POST['tipos_estado'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_estado();
        $proc->registro_estado_producto($_POST['tipos_estado'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro_estado_producto",$_POST['tipos_estado'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa']));
    }
}elseif($ver=="editar_estado_producto_comercial"){
    
    if(isset($_POST['id'],$_POST['empresa'],$_POST['tipos_estado'],$_POST['descripcion'])){
        $proc = new Producto_estado();
        $proc->editar_estado_producto_comercial($_POST['id'],$_POST['empresa'],$_POST['tipos_estado'],$_POST['descripcion']);
    }else{
        echo (array("Error", "Faltan parámetros en la solicitud", "editar_estado_producto_comercial",$_POST['id'],$_POST['empresa'],$_POST['tipos_estado'],$_POST['descripcion']));
    }
}elseif($ver=="cambiar_estado_producto"){
    if(isset($_POST['id'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_estado();
        $proc->cambiar_estado_producto($_POST['id'],$_POST['estado'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "cambiar_estado_producto"));
    }
}elseif($ver=="registrar_medida_producto"){
    if(isset($_POST['nombre_medida'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_medida();
        $proc->registrar_medida_producto($_POST['nombre_medida'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_medida_producto"));
    }
}elseif($ver=="editar_medida_producto"){
    
    if(isset($_POST['id'],$_POST['nombre_medida'],$_POST['descripcion'],$_POST['empresa'])){
        $proc = new Producto_medida();
        $proc->editar_medida_producto($_POST['id'],$_POST['nombre_medida'],$_POST['descripcion'],$_POST['empresa']);
    }else{
        echo (array("Error", "Faltan parámetros en la solicitud", "editar_medida_producto"));
    }
}elseif($ver=="cambiar_estado_medida_producto"){
    if(isset($_POST['id'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_medida();
        $proc->cambiar_estado_medida_producto($_POST['id'],$_POST['estado'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "cambiar_estado_medida_producto"));
    }
}


elseif($ver=="registrar_unidad_producto"){
    if(isset($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_unidad();
        $proc->registrar_unidad_producto($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_unidad_producto",$_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['empresa']));
    }
}elseif($ver=="editar_unidad_producto"){
    
    if(isset($_POST['id'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa'])){
        $proc = new Producto_unidad();
        $proc->editar_unidad_producto($_POST['id'],$_POST['nombre'],$_POST['descripcion'],$_POST['empresa']);
    }else{
        echo (array("Error", "Faltan parámetros en la solicitud", "editar_unidad_producto"));
    }
}elseif($ver=="editar_estado_unidad_producto"){
    if(isset($_POST['id'],$_POST['estado'],$_POST['empresa'])){
        $proc = new Producto_unidad();
        $proc->editar_estado_unidad_producto($_POST['id'],$_POST['estado'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_estado_unidad_producto"));
    }
}elseif($ver == "registro_producto_comercial") {
    $pro = new Producto_conf();
    $direccion = "./imagen/null.png";

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $direccion = $pro->guardarImagen_producto();
        if ($direccion === false) {
            echo json_encode(array("Error", "No se pudo guardar la imagen", "guardarImagen"));
            return;
        }
    }

    $requiredParams = array(
        'nombre', 'codigo', 'descripcion', 'cod_barras', 'fecha_registro',
        'idcategorias_p', 'idmedida_p', 'idestadosproductos_p', 'idunidad_p',
        'empresa', 'estado', 'rubro',  'cantidad', 'tiempo', 'unidadtiempo','subproducto'
    );

    $missingParams = array_diff_key(array_flip($requiredParams), $_POST);
    if (!empty($missingParams)) {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud: " . implode(", ", $missingParams), "registro_producto_comercial"));
        return;
    }

    $pro->registro_producto_comercial(
        $_POST['nombre'], $_POST['codigo'], $_POST['descripcion'], $_POST['cod_barras'],
        $_POST['fecha_registro'], $direccion, $_POST['idcategorias_p'], $_POST['idmedida_p'],
        $_POST['idestadosproductos_p'], $_POST['idunidad_p'], null, $_POST['empresa'],
        null, null, null, null, $_POST['estado'], $_POST['rubro'],
        $_POST['cantidad'], $_POST['tiempo'], $_POST['unidadtiempo'],$_POST['subproducto']
    );
}elseif ($ver == "editar_producto_comercial") {

    // $pro = new Producto_conf();
    $pro = new Producto_conf();

    $direccion = "./imagen/null.png";

    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $direccion = $pro->guardarImagen_producto();
        if ($direccion === false) {
            echo json_encode(array("Error", "No se pudo guardar la imagen", "guardarImagen"));
            return;
        }
    }
    $requiredParams = array(
        "id_productos",
        "nombre",
        "codigo",
        "descripcion",
        "cod_barras",
        "categorias_id_categorias",
        "medida_id_medida",
        "estados_productos_id_estados_productos",
        "unidad_id_unidad",
        "rubro_idrubro",
        "cantidad",
        "tiempo_produccion",
        "Unidad_tiempo_idUnidad_tiempo",
        "subproducto",
        "empresa"
    );

    $missingParams = array_diff_key(array_flip($requiredParams), $_POST);
    if (!empty($missingParams)) {
        echo json_encode(array(
            "Error", 
            "Faltan parámetros en la solicitud: " . implode(", ", array_keys($missingParams)), 
            "editar_producto_comercial"
        ));
        return;
    }

    // Llamada a la función `editar_producto_comercial`
    $pro->editar_producto_comercial(
        $_POST['id_productos'],$direccion,$_POST['nombre'],$_POST['codigo'],
        $_POST['descripcion'],$_POST['cod_barras'],$_POST['categorias_id_categorias'],$_POST['medida_id_medida'],$_POST['estados_productos_id_estados_productos'],$_POST['unidad_id_unidad'],$_POST['rubro_idrubro'],$_POST['cantidad'],$_POST['tiempo_produccion'],$_POST['Unidad_tiempo_idUnidad_tiempo'],$_POST['subproducto'],$_POST['empresa']
    );
}
elseif($ver == "registroGrupo") {
    if(isset($_POST['nombre'], $_POST['detalle'], $_POST['rubro_idrubro'], $_POST['empresa'])) {
        $grupo = new Grupo_conf();
        $grupo->registrar_grupo($_POST['nombre'], $_POST['detalle'], $_POST['rubro_idrubro'], $_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registroGrupo"));
    }
} elseif($ver == "editar_grupo") {
    if(isset($_POST['id'], $_POST['nombre'], $_POST['detalle'], $_POST['empresa'])) {
        $grupo = new Grupo_conf();
        $grupo->editar_grupo($_POST['id'], $_POST['nombre'], $_POST['detalle'], $_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_grupo"));
    }
}elseif($ver == "register_hasconnservacion") {
    if(isset($_POST['entidad_id'], $_POST['tipo_entidad'], $_POST['idgrupo'])) {
        $grupo = new Conservacion_conf();
        $grupo->register_hasconnservacion($_POST['entidad_id'], $_POST['tipo_entidad'], $_POST['idgrupo']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "editar_grupo"));
    }
}elseif ($ver == "registrar_etapa_produccion") {

    $pro = new Etapas_produccion_conf();
    $pro->registrar_etapa_produccion(
        $_POST['nombre_etapa'],
        $_POST['detalle'],
        $_POST['rubro_idrubro'],
        $_POST['seccion_idseccion'],
        $_POST['empresa']

    );
}elseif ($ver == "editar_etapa_produccion") {

    $pro = new Etapas_produccion_conf();
    $pro->editar_etapa_produccion(
        $_POST['idetapas_produccion'],
        $_POST['nombre_etapa'],
        $_POST['detalle'],
        $_POST['seccion_idseccion'],
        $_POST['empresa_idempresa']
    );
}
elseif ($ver == "registrar_sub_producto") {

    $pro = new Sub_producto_conf();

    $requiredParams = array(
       
        "nombre",
        "codigo",
        "detalle",
        "producto_idproducto",
        "medida_idmedida",
        "empresa"
    );

    // Verificar si faltan parámetros requeridos
    $missingParams = array_diff_key(array_flip($requiredParams), $_POST);
    if (!empty($missingParams)) {
        echo json_encode(array(
            "Error", 
            "Faltan parámetros en la solicitud: " . implode(", ", array_keys($missingParams)), 
            "editar_sub_producto"
        ));
        return;
    }

    $pro->registrar_sub_producto(
       
        $_POST['nombre'],
        $_POST['codigo'],
        $_POST['detalle'],
        $_POST['producto_idproducto'],
        $_POST['medida_idmedida'],
        $_POST['empresa']
    );
}elseif ($ver == "editar_sub_producto") {

    $pro = new Sub_producto_conf();

    $requiredParams = array(
        "idsub_producto",
        "nombre",
        "codigo",
        "detalle",
        "producto_idproducto",
        "medida_idmedida",
        "empresa"
    );

    // Verificar si faltan parámetros requeridos
    $missingParams = array_diff_key(array_flip($requiredParams), $_POST);
    if (!empty($missingParams)) {
        echo json_encode(array(
            "Error", 
            "Faltan parámetros en la solicitud: " . implode(", ", array_keys($missingParams)), 
            "editar_sub_producto"
        ));
        return;
    }

    $pro->editar_sub_producto(
        $_POST['idsub_producto'],
        $_POST['nombre'],
        $_POST['codigo'],
        $_POST['detalle'],
        $_POST['producto_idproducto'],
        $_POST['medida_idmedida'],
        $_POST['empresa']
    );
}elseif($ver=="editar_Proveedor") { // esto sale del hidden del input que esta en el formulario
    $obj = new Proveedor_conf();
    $obj->editar_Proveedor($_POST['id'],$_POST['nombre'], $_POST['codigo']
    ,$_POST['nit'],$_POST['detalle'],$_POST['direccion'],$_POST['telefono']
    ,$_POST['mobil'],$_POST['email'],$_POST['web'],$_POST['pais']
    ,$_POST['ciudad'],$_POST['zona'],$_POST['contacto'],$_POST['empresa']);
}elseif($ver=="editar_proveedor_material") { // esto sale del hidden del input que esta en el formulario
    $obj = new Proveedor_conf();
    $obj->editar_proveedor_material($_POST['id_ProveedorMaterial'],$_POST['proveedor'],$_POST['material'],$_POST['empresa']);
}
elseif($ver=="registrar_etapas_has_Maquinas") { 
    $obj = new Etapas_produccion_registrar();
    $obj->registrar_etapas_has_Maquinas($_POST['etapas_produccion_idetapas_produccion'],$_POST['maquina_idmaquina']);
}
elseif($ver=="registrar_etapas_has_Materiales") { 
    $obj = new Etapas_produccion_registrar();
    $obj->registrar_etapas_has_Materiales($_POST['etapas_produccion_idetapas_produccion'],$_POST['material_idmaterial']);
}
elseif($ver=="registrar_etapas_has_Productos") { 
    $obj = new Etapas_produccion_registrar();
    $obj->registrar_etapas_has_Productos($_POST['etapas_produccion_idetapas_produccion'],$_POST['producto_idproducto']);
}
elseif($ver=="registrar_etapas_has_Subproductos") { 
    $obj = new Etapas_produccion_registrar();
    $obj->registrar_etapas_has_Subproductos($_POST['etapas_produccion_idetapas_produccion'],$_POST['sub_producto_idsub_producto']);
}
elseif($ver=="registrar_evaluacion_caracteristicas") { 
    $obj = new ControlCalidad();
    $obj->registrar_evaluacion_caracteristicas($_POST['evaluacion'],$_POST['detalle'],$_POST['caracteristicas_idcaracteristicas'],$_POST['criterio_control_calidad_idcriterio_control_calidad']);
}elseif($ver=="registrar_criterio_controlCalidad") { 
    $obj = new ControlCalidad();
    $obj->registrar_criterio_controlCalidad($_POST['calificacion'],$_POST['observaciones'],$_POST['peso_bruto'],$_POST['peso_envase'],$_POST['peso_neto'],$_POST['cantidad'],$_POST['destino'],$_POST['detalle_control_calidad_iddetalle_control_calidad']);
}elseif($ver=="registrar_OrdenProduccion") { 
    $obj = new Orden_produccion();
    $obj->registrar_OrdenProduccion($_POST['fecha'],$_POST['hora'],$_POST['estado'],$_POST['rubro_idrubro'],$_POST['empresa'],$_POST['idempleado']);
}elseif($ver=="registrar_detalleOrdenProduccion") { 
    $obj = new Orden_produccion();
    $obj->registrar_detalleOrdenProduccion($_POST['cantidad'],$_POST['observaciones'],$_POST['orden_produccion_idorden_produccion'],$_POST['producto_idproducto']);
}elseif($ver == "registro_categoria_comercial") {
    if(isset( $_POST['nombre'], $_POST['descripcion'],$_POST['estado'],
            $_POST['id_empresa'], $_POST['rubro_idrubro'], $_POST['idp'])){
        $pro = new Categoria_conf();
        $pro->registro_categoria_comercial(
            $_POST['nombre'], $_POST['descripcion'],$_POST['estado'],
            $_POST['id_empresa'], $_POST['rubro_idrubro'], $_POST['idp']
        );
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro_categoria_comercial"));
    }
}elseif($ver=="registrar_categoria"){
    if(isset($_POST['idcategoria_comercial'],$_POST['rubro_idrubro'])){
        $maq = new Categoria_conf();
        $maq->registrar_categoria($_POST['idcategoria_comercial'],$_POST['rubro_idrubro']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_categoria"));
    }
}elseif ($ver == "editar_categoria_comercial") {
    if(isset( $_POST['id_categorias'],$_POST['nombre'],
        $_POST['descripcion'],$_POST['rubro_idrubro'],$_POST['idp'],$_POST['id_empresa'])){
        $pro = new Categoria_conf();
        // Llamada a la función `editar_producto_comercial`
        $pro->editar_categoria_comercial(
            $_POST['id_categorias'],$_POST['nombre'],
            $_POST['descripcion'],$_POST['rubro_idrubro'],$_POST['idp'],$_POST['id_empresa']
        );
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_categoria"));
    }
}elseif ($ver == "registro_medida_comercial") {
    if(isset($_POST['nombre_medida'],
        $_POST['descripcion'],$_POST['estado'],$_POST['id_empresa'],$_POST['rubro_idrubro'])){
        $pro = new CaracteristicaComercial_conf();
        // Llamada a la función `editar_producto_comercial`
        $pro->registro_medida_comercial($_POST['nombre_medida'],$_POST['descripcion'],$_POST['estado'],$_POST['id_empresa'],$_POST['rubro_idrubro']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_categoria"));
    }
}elseif ($ver == "registrar_caracteristicaComercial") {
    if(isset($_POST['idmedida_comercial'],$_POST['rubro_idrubro'])){
    $pro = new CaracteristicaComercial_conf();
    // Llamada a la función `editar_producto_comercial`
    $pro->registrar_caracteristicaComercial($_POST['idmedida_comercial'],$_POST['rubro_idrubro']);
}else{
    echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_categoria"));
}
}elseif ($ver == "editar_caracteristica_comercial") {
    if(isset($_POST['id_medida'],$_POST['nombre_medida'],
    $_POST['descripcion'],$_POST['id_empresa'],$_POST['rubro_idrubro'])){
    $pro = new CaracteristicaComercial_conf();
    // Llamada a la función `editar_producto_comercial`
    $pro->editar_caracteristica_comercial($_POST['id_medida'],$_POST['nombre_medida'],$_POST['descripcion'],$_POST['id_empresa'],$_POST['rubro_idrubro']);
}else{
    echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_categoria"));
}
}elseif($ver=="activar_divisa") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['id_divisas'])) {
        $envase = new Divisa_conf();
    $envase->activar_divisa($_POST['id_divisas']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id_divisas']));
    }
}elseif($ver=="registrar_Compra_Proveedor"){   // ya esta funcionando
    if(isset($_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa'])){
        $prov = new ListaSolicitud_conf();
        $prov->comprarPorProveedor($_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fechaVenci'],$POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']));
    }
}elseif($ver=="registrarCompra"){    //ya esta funcionando
    if($_POST['fecha'] == null){
        if(isset($_POST['lote'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa'])){
            $rcompra = new ListaSolicitud_conf();
            $rcompra->registrarCompra($_POST['lote'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']);
        }else{
            echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
        }
    }else{
        if(isset($_POST['lote'],$_POST['fecha'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['empresa'])){
            $rcompra = new ListaSolicitud_conf();
            $rcompra->registrarCompra($_POST['lote'],$_POST['fecha'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']);
        }else{
            echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
        }
    }
}
elseif ($ver == "finalizarCompra") {                // ya esta funcionando
    $rcompra = new ListaSolicitud_conf();
    $rcompra->finalizarCompra($_POST['idpedido'],$_POST['empresa']);
}elseif($ver=="registrar_ListaCompra_Editar"){
    if(isset($_POST['cantEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['idpedido'],$_POST['empresa'])){
        // echo json_encode(array("okkkk", "perfecto entraste", "registrar_listaCompra"));
        $lcompra = new ListaCompra_conf();
        $lcompra->registrar_ListaCompra_Editar($_POST['cantEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['idpedido'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_listaCompra_editable"));
    }
}
elseif($ver=="registroCaracteristicas") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['caracteristica'],$_POST['tipo'],$_POST['empresa'])) {
        $envase = new Caracteristica_conf();
    $envase->registroCaracteristicas($_POST['caracteristica'],$_POST['tipo'],$_POST['minimo'],$_POST['maximo'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['caracteristica'],$_POST['tipo'],$_POST['minimo'],$_POST['maximo'],$_POST['empresa']));
    }
}elseif($ver=="editarCaracteristicas"){
    if (isset($_POST['idcaracteristicas'], $_POST['caracteristica'],$_POST['tipo'],$_POST['minimo'],$_POST['maximo'],$_POST['empresa'])) {
        $envase = new Caracteristica_conf();
        $envase->editarCaracteristicas($_POST['idcaracteristicas'], $_POST['caracteristica'], $_POST['tipo'],$_POST['minimo'],$_POST['maximo'], $_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud"));
    }
}
elseif($ver=="registrarControlCalidad"){    //ya esta funcionando
        if(isset($_POST['fecha_cc'],$_POST['hora_cc'],$_POST['num_doc'],$_POST['Entidad_tipo'],$_POST['Entidad_id'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'])){
            $rcompra = new ControlCalidad();
            $rcompra->registrarControlCalidad($_POST['fecha_cc'],$_POST['hora_cc'],$_POST['num_doc'],$_POST['Entidad_tipo'],$_POST['Entidad_id'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado']);
        }else{
            echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
        }
}elseif($ver=="registrarDetalleControlCalidad"){    //ya esta funcionando

    if(isset($_POST['cantidad'],$_POST['entidad_tipo'],$_POST['entidad_id'],$_POST['control_calidad_idcontrol_calidad'])){
        $rcompra = new ControlCalidad();
        $rcompra->registrarDetalleControlCalidad($_POST['cantidad'],$_POST['entidad_tipo'],$_POST['entidad_id'],$_POST['control_calidad_idcontrol_calidad']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['lote'],$_POST['fecha'],$_POST['fechaReg'],$_POST['hora'],$_POST['totalSuma'],$_POST['idpedido'],$_POST['proveedor'],$_POST['usuario'],$_POST['empresa']));
    }
}elseif($ver=="registrar_ListaCompraSoli_Editar"){
    if(isset($_POST['fechaVenciEd'],$_POST['idpedido'],$_POST['idcompra'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['cantidadEd'],$_POST['precioUniEd'],$_POST['empresa'])){
        // echo json_encode(array("okkkk", "perfecto entraste", "registrar_listaCompra"));
        $lcompra = new ListaSolicitud_conf();
        $lcompra->registrar_ListaCompraSoli_Editar($_POST['fechaVenciEd'],$_POST['idpedido'],$_POST['idcompra'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['cantidadEd'],$_POST['precioUniEd'],$_POST['empresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registrar_listaCompra_editable"));
    }
}elseif($ver=="IconoEditarPedido"){
    // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
    if (isset($_POST['id'], $_POST['cantidadEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa'])) {
        $editL = new ListaCompra_conf();
        $editL->IconoEditarPedido($_POST['id'], $_POST['cantidadEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantEnvase'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenidoEnvase'],$_POST['medida'],$_POST['empresa']));
    }
}elseif($ver=="iconoEditarPedidoEdicion"){
    // "material", "cantEnvase", "tipoEnvase", "medida", "contenidoEnvase"
    if (isset($_POST['id'], $_POST['cantidadEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['empresa'])) {
        $editL = new ListaCompra_conf();
        $editL->iconoEditarPedidoEdicion($_POST['id'], $_POST['cantidadEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantidadEnvase'],$_POST['material2'],$_POST['tipoEnvase2'],$_POST['contenidoEnvase'],$_POST['medida2'],$_POST['empresa']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}elseif($ver=="editarListaCompraSoli"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    if (isset($_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa'])) {
        $editL = new EditarRegistros();
        $editL->editarListaCompraSoli($_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}elseif($ver=="editarListaCompraSoli_Edicion"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    if (isset($_POST['id'], $_POST['cantidadEd'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['precioUniEd'],$_POST['fechaVenciEd'],$_POST['empresa'])) {
        $editL = new EditarRegistros();
        $editL->editarListaCompraSoli_Edicion($_POST['id'], $_POST['cantidadEd'],$_POST['materialEd'],$_POST['tipoEnvaseEd'],$_POST['contenidoEd'],$_POST['medidaEd'],$_POST['precioUniEd'],$_POST['fechaVenciEd'],$_POST['empresa']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['id'], $_POST['cantidad'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['precioUni'],$_POST['fechaVenci'],$_POST['empresa']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}elseif($ver=="editarRegistroCompra"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    // if (isset($_POST['idcompra'], $_POST['lote'],$_POST['proveedorEd'],$_POST['idcompra'],$_POST['empresa'])) {
       // $editL = new EditarRegistros();
      //  $editL->editarRegistroCompra($_POST['idcompra'], $_POST['lote'],$_POST['proveedorEd'],$_POST['idcompra'],$_POST['empresa']);
    // }
    //  else {
    //     echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcompra'], $_POST['lote'],$_POST['proveedorEd'],$_POST['idcompra'],$_POST['empresa']));
    // }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}
elseif($ver=="registrarStockMateriaPrima"){    //ya esta funcionando
    if(isset($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra'])){
        $rcompra = new ControlCalidad();
        $rcompra->registrarStockMateriaPrima($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']));
    }
}elseif($ver=="registrarLote"){    //ya esta funcionando
    if(isset($_POST['fecha_lote'],$_POST['hora_lote'],$_POST['lote'],$_POST['estado'],$_POST['fecha_entrega'],$_POST['hora_entrega'],$_POST['rubro_idrubro'],$_POST['empleado_idempleado'],$_POST['orden_produccion_idorden_produccion'],$_POST['empresa_idempresa'])){
        $rcompra = new Lote();
        $rcompra->registrarLote($_POST['fecha_lote'],$_POST['hora_lote'],$_POST['lote'],$_POST['estado'],$_POST['fecha_entrega'],$_POST['hora_entrega'],$_POST['rubro_idrubro'],$_POST['empleado_idempleado'],$_POST['orden_produccion_idorden_produccion'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud", "registro compraProveedor",$_POST['fecha_lote'],$_POST['hora_lote'],$_POST['lote'],$_POST['estado'],$_POST['fecha_entrega'],$_POST['hora_entrega'],$_POST['empleado_idempleado'],$_POST['orden_produccion_idorden_produccion'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="cambiaEstadoOrdenProduccion"){
    // $_POST['fechaVenci'],$_POST['idpedido'],$_POST['material'],$_POST['tipoEnvase'],$_POST['contenido'],$_POST['medida'],$_POST['cantidad'],$_POST['precioUni'],$_POST['empresa']
    if (isset($_POST['idordenproduccion'])) {
        $editL = new Orden_produccion();
        $editL->cambiaEstadoOrdenProduccion($_POST['idordenproduccion'],$_POST['estado']);
    } else {
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idordenproduccion']));
    }                                                                         //   22                     7                  null                  null                        7                  null               esta bien la empresa
}
elseif($ver=="registroUnidadTiempoControl") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa'])) {
        $envase = new UnidadTiempo_conf();
    $envase->registroUnidadTiempoControl($_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editarUnidadTiempoControl") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idcontrol_unidad_tiempo'],$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa'])) {
        $envase = new UnidadTiempo_conf();
    $envase->editarUnidadTiempoControl($_POST['idcontrol_unidad_tiempo'],$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrol_unidad_tiempo'],$_POST['unidad'],$_POST['detalle'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_detalle_estandar_producto2") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad'],$_POST['producto_idproducto'],$_POST['material_idmaterial'])) {
        $envase = new EstandarProducto();
    $envase->registrar_detalle_estandar_producto2($_POST['cantidad'],$_POST['producto_idproducto'],$_POST['material_idmaterial']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['estandar_producto_idestandar_producto'],$_POST['material_idmaterial']));
    }
}elseif($ver=="editar_detalle_estandar_producto2") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iddetalle_estandar_producto'],$_POST['cantidad'],$_POST['material_idmaterial'])) {
        $envase = new EstandarProducto();
    $envase->editar_detalle_estandar_producto2($_POST['iddetalle_estandar_producto'],$_POST['cantidad'],$_POST['material_idmaterial']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddetalle_estandar_producto'],$_POST['cantidad'],$_POST['material_idmaterial']));
    }
}elseif($ver=="registrar_produccion_etapa") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['fecha_pe'],$_POST['hora_pe'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['produccion_idproduccion'],$_POST['etapas_produccion_idetapas_produccion'],$_POST['empleado_idempleado'],$_POST['grupo_etapas_idgrupo_etapas'])) {
        $envase = new Grupo_etapas();
    $envase->registrar_produccion_etapa($_POST['fecha_pe'],$_POST['hora_pe'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['produccion_idproduccion'],$_POST['etapas_produccion_idetapas_produccion'],$_POST['empleado_idempleado'],$_POST['grupo_etapas_idgrupo_etapas']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_pe'],$_POST['hora_pe'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['produccion_idproduccion'],$_POST['etapas_produccion_idetapas_produccion'],$_POST['empleado_idempleado'],$_POST['grupo_etapas_idgrupo_etapas']));
    }
}elseif($ver=="finalizar_produccion_etapa") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idproduccion_etapa'],$_POST['fecha_fin'],$_POST['hora_fin'])) {
        $envase = new Grupo_etapas();
    $envase->finalizar_produccion_etapa($_POST['idproduccion_etapa'],$_POST['fecha_fin'],$_POST['hora_fin']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idproduccion_etapa'],$_POST['fecha_fin'],$_POST['hora_fin']));
    }
}elseif($ver=="registrar_uso_maquina_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['fecha_ini'],$_POST['hora_ini'],$_POST['observaciones'],$_POST['fecha_fin'],$_POST['hora_ini'],$_POST['maquina_idmaquina'],$_POST['produccion_etapa_idproduccion_etapa'])) {
        $envase = new UsoMaquina();
    $envase->registrar_uso_maquina_produccion($_POST['fecha_ini'],$_POST['hora_ini'],$_POST['observaciones'],$_POST['fecha_fin'],$_POST['hora_ini'],$_POST['maquina_idmaquina'],$_POST['produccion_etapa_idproduccion_etapa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_ini'],$_POST['hora_ini'],$_POST['observaciones'],$_POST['fecha_fin'],$_POST['hora_ini'],$_POST['maquina_idmaquina'],$_POST['produccion_etapa_idproduccion_etapa']));
    }
}elseif($ver=="Editar_uso_maquina_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iduso_maquina'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['observaciones'])) {
        $envase = new UsoMaquina();
    $envase->Editar_uso_maquina_produccion($_POST['iduso_maquina'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['observaciones']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iduso_maquina'],$_POST['fecha_fin'],$_POST['hora_fin'],$_POST['observaciones']));
    }
}elseif($ver=="registrar_detalle_compra_material") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad'],$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['total_precio'],$_POST['fecha_venci'],$_POST['compra_idcompra'],$_POST['tipo_envase_idtipo_envase'])) {
        $envase = new Compra();
    $envase->registrar_detalle_compra_material($_POST['cantidad'],$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['total_precio'],$_POST['fecha_venci'],$_POST['compra_idcompra'],$_POST['material_idmaterial'],$_POST['tipo_envase_idtipo_envase']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['total_precio'],$_POST['fecha_venci'],$_POST['compra_idcompra'],$_POST['tipo_envase_idtipo_envase']));
    }
}elseif($ver=="registro_salida_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad'],$_POST['produccion_idproduccion'],$_POST['producto_idproducto'],$_POST['empresa_idempresa'])) {
        $envase = new Grupo_etapas();
    $envase->registro_salida_produccion($_POST['cantidad'],$_POST['produccion_idproduccion'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['produccion_idproduccion'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_salida_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idsalida_produccion'],$_POST['cantidad'])) {
        $envase = new Grupo_etapas();
    $envase->editar_salida_produccion($_POST['idsalida_produccion'],$_POST['cantidad']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idsalida_produccion'],$_POST['cantidad']));
    }
}elseif($ver=="finalizar_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idproduccion'])) {
        $envase = new Grupo_etapas();
    $envase->finalizar_produccion($_POST['idproduccion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idproduccion']));
    }
}elseif($ver=="registrar_detalle_pedido") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad_envases'],$_POST['tipo_envase_idtipo_envase'],$_POST['pedido_idpedido'],$_POST['material_idmaterial'],$_POST['peso_neto'])) {
        $envase = new ListaSolicitud_conf();
    $envase->registrar_detalle_pedido($_POST['cantidad_envases'],$_POST['tipo_envase_idtipo_envase'],$_POST['pedido_idpedido'],$_POST['material_idmaterial'],$_POST['peso_neto']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad_envases'],$_POST['tipo_envase_idtipo_envase'],$_POST['pedido_idpedido'],$_POST['material_idmaterial'],$_POST['peso_neto']));
    }//editar_etapa_produccion_empleado
}elseif($ver=="editar_detalle_solicitud_material") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iddetalle_solicitud_material'],$_POST['cantidad'],$_POST['observaciones'])) {
        $envase = new AlmacenMaterial();
    $envase->editar_detalle_solicitud_material($_POST['iddetalle_solicitud_material'],$_POST['cantidad'],$_POST['observaciones']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idsalida_produccion'],$_POST['cantidad'],$_POST['observaciones']));
    }
}elseif($ver=="salida_material_produccion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['detalle_solicitud_material_iddetalle_solicitud_material'],$_POST['almacen_material_idalmacen_material'],$_POST['empresa_idempresa'])) {
        $envase = new AlmacenMaterial();
    $envase->salida_material_produccion($_POST['detalle_solicitud_material_iddetalle_solicitud_material'],$_POST['cantidad'],$_POST['almacen_material_idalmacen_material'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['detalle_solicitud_material_iddetalle_solicitud_material'],$_POST['almacen_material_idalmacen_material'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="actualizar_estado_solicitud_material") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idsolicitud_material'],$_POST['estado'])) {
        $envase = new AlmacenMaterial();
    $envase->actualizar_estado_solicitud_material($_POST['idsolicitud_material'],$_POST['estado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idsolicitud_material'],$_POST['estado']));
    }
}elseif($ver=="registrarStockProductos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['cantidad'],$_POST['costo_unitario'],$_POST['empresa_idempresa'],$_POST['lote_idlote'],$_POST['control_calidad_idcontrol_calidad'],$_POST['producto_idproducto'])) {
        $envase = new Stock_productos();
    $envase->registrarStockProductos($_POST['cantidad'],$_POST['costo_unitario'],$_POST['empresa_idempresa'],$_POST['lote_idlote'],$_POST['control_calidad_idcontrol_calidad'],$_POST['producto_idproducto']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['costo_unitarioad'],$_POST['empresa_idempresa'],$_POST['lote_idlote'],$_POST['control_calidad_idcontrol_calidad'],$_POST['producto_idproducto']));
    }
}elseif($ver=="anularCompra") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['idcompra'])) {
        $envase = new Compra();
    $envase->anularCompra($_POST['idcompra']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcompra']));
    }
}elseif($ver=="anularPedido") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['idpedido'])) {
        $envase = new ListaSolicitud_conf();
    $envase->anularPedido($_POST['idpedido']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idpedido']));
    }
}elseif($ver=="registrar_estandar_etapa_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion'])) {
        $envase = new Estandar_etapa_produccion();
    $envase->registrar_estandar_etapa_produccion($_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']));
    }
}elseif($ver=="editar_estandar_etapa_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['idestandar_etapa_produccion'],$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion'])) {
        $envase = new Estandar_etapa_produccion();
    $envase->editar_estandar_etapa_produccion($_POST['idestandar_etapa_produccion'],$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idestandar_etapa_produccion'],$_POST['horas_produccion'],$_POST['porcentaje_evolucion'],$_POST['fecha'],$_POST['etapas_produccion_idetapas_produccion']));
    }
}elseif($ver=="registrar_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado'])) {
        $envase = new Limpieza();
    $envase->registrar_limpieza($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="editar_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
   
    if (isset($_POST['idlimpieza'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado'])) {
        $envase = new Limpieza();
    $envase->editar_limpieza($_POST['idlimpieza'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tarea_limpieza_idtarea_limpieza'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="registrar_tarea_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Limpieza();
    $envase->registrar_tarea_limpieza($_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="editar_tarea_limpieza") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtarea_limpieza'],$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Limpieza();
    $envase->editar_tarea_limpieza($_POST['idtarea_limpieza'],$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtarea_limpieza'],$_POST['limpieza'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['seccion_idseccion'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="registrar_devolucion_compra") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra'])) {
        $envase = new Devoluciones();
    $envase->registrar_devolucion_compra($_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad_envases'],$_POST['peso_neto'],$_POST['tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['fecha_caducidad'],$_POST['material_idmaterial'],$_POST['empresa_idempresa'],$_POST['control_calidad_idcontrol_calidad'],$_POST['proveedor_idproveedor'],$_POST['compra_idcompra']));
    }
}elseif($ver=="registrar_devolucion_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // $cantidad,$costo_unitario, $control_calidad_idcontrol_calidad,$idlote,$idproducto,$empresa_idempresa
    if (isset($_POST['cantidad'],$_POST['costo_unitario'],$_POST['control_calidad_idcontrol_calidad'],$_POST['lote_idlote'],$_POST['producto_idproducto'],$_POST['empresa_idempresa'])) {
        $envase = new Devoluciones();
    $envase->registrar_devolucion_produccion($_POST['cantidad'],$_POST['costo_unitario'],$_POST['control_calidad_idcontrol_calidad'],$_POST['lote_idlote'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['costo_unitario'],$_POST['control_calidad_idcontrol_calidad'],$_POST['lote_idlote'],$_POST['producto_idproducto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado'])) {
        $envase = new Mantenimiento();
    $envase->registrar_mantenimiento($_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="editar_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
   
    if (isset($_POST['idmantenimiento'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado'])) {
        $envase = new Mantenimiento();
    $envase->editar_mantenimiento($_POST['idmantenimiento'],$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['horas'],$_POST['observaciones'],$_POST['hora_inicio'],$_POST['tareas_mantenimiento_idtareas_mantenimiento'],$_POST['empleado_idempleado']));
    }
}elseif($ver=="registrar_tareas_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Mantenimiento();
    $envase->registrar_tareas_mantenimiento($_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="editar_tareas_mantenimiento") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo'])) {
        $envase = new Mantenimiento();
    $envase->editar_tareas_mantenimiento($_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtareas_mantenimiento'],$_POST['mantenimiento'],$_POST['descripcion'],$_POST['frecuencia'],$_POST['costo'],$_POST['maquina_idmaquina'],$_POST['idcontrol_unidad_tiempo']));
    }
}elseif($ver=="editar_grupo_etapas") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idgrupo_etapas'],$_POST['nombre'],$_POST['empresa_idempresa'])) {
        $envase = new Grupo_etapas();
    $envase->editar_grupo_etapas($_POST['idgrupo_etapas'],$_POST['nombre'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idgrupo_etapas'],$_POST['nombre'],$_POST['empresa_idempresa']));
    }
    // $codigo, $descripcion, $probabilidad, $impacto,$tipo_variable,$idtipo_variable,$empresa_idempresa
}elseif($ver=="registrar_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['tipo_variable'],$_POST['idtipo_variable'],$_POST['empresa_idempresa'])) {
        $envase = new Riesgo();
    $envase->registrar_riesgo($_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['tipo_variable'],$_POST['idtipo_variable'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['tipo_variable'],$_POST['idtipo_variable'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idriesgo'],$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['empresa_idempresa'])) {
        $envase = new Riesgo();
    $envase->editar_riesgo($_POST['idriesgo'],$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idriesgo'],$_POST['codigo'],$_POST['descripcion'],$_POST['probabilidad'],$_POST['impacto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_recurso_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    // $efectividad, $recurso_riesgo_idrecurso_riesgo, $riesgo_idriesgo
    if (isset($_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa'])) {
        $envase = new Recurso_riesgo();
    $envase->registrar_recurso_riesgo($_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_recurso_riesgo") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idrecurso_riesgo'],$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa'])) {
        $envase = new Recurso_riesgo();
    $envase->editar_recurso_riesgo($_POST['idrecurso_riesgo'],$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idrecurso_riesgo'],$_POST['nombre_recurso'],$_POST['codigo'],$_POST['ubicacion'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_emergencia") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    // $efectividad, $recurso_riesgo_idrecurso_riesgo, $riesgo_idriesgo
    if (isset($_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'],$_POST['riesgo_idriesgo'])) {
        $envase = new Emergencia();
    $envase->registrar_emergencia($_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'],$_POST['riesgo_idriesgo']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'],$_POST['empresa_idempresa'],$_POST['empleado_idempleado'],$_POST['riesgo_idriesgo']));
    }
}elseif($ver=="editar_emergencia") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idemergencia'],$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion'])) {
        $envase = new Emergencia();
    $envase->editar_emergencia($_POST['idemergencia'],$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idemergencia'],$_POST['fecha_inicio'],$_POST['hora_inicio'],$_POST['horas'],$_POST['descripcion']));
    }
}elseif($ver=="editar_areas") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idareas'],$_POST['nombre'],$_POST['descripcion'],$_POST['fecha'],$_POST['sucursal_idsucursal'])) {
        $envase = new Empleado();
    $envase->editar_areas($_POST['idareas'],$_POST['nombre'],$_POST['descripcion'],$_POST['fecha'],$_POST['sucursal_idsucursal']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idareas'],$_POST['nombre'],$_POST['descripcion'],$_POST['fecha'],$_POST['sucursal_idsucursal']));
    }
}elseif($ver=="editar_cargos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idcargos'],$_POST['cargo'],$_POST['salario'],$_POST['descripcion'],$_POST['sucursal_idsucursal'])) {
        $envase = new Empleado();
    $envase->editar_cargos($_POST['idcargos'],$_POST['cargo'],$_POST['salario'],$_POST['descripcion'],$_POST['sucursal_idsucursal']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcargos'],$_POST['cargo'],$_POST['salario'],$_POST['descripcion'],$_POST['sucursal_idsucursal']));
    }
}elseif($ver=="registrar_trabajador") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos'])) {
        $envase = new Empleado();
    $envase->registrar_trabajador($_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos']));
    }//anularcompra
}elseif($ver=="editar_trabajador") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtrabajador'],$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'])) {
        $envase = new Empleado();
    $envase->editar_trabajador($_POST['idtrabajador'],$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtrabajador'],$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha']));
    }
}elseif($ver=="registrar_tipocontrato") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa'])) {
        $envase = new Contrataciones();
    $envase->registrar_tipocontrato($_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['apellido'],$_POST['ci'],$_POST['telefono'],$_POST['fnacimiento'],$_POST['direccion'],$_POST['nacionalidad'],$_POST['profesion'],$_POST['fecha'],$_POST['cargos_idcargos']));
    }
}elseif($ver=="editar_tipocontrato") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idtipocontrato'],$_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa'])) {
        $envase = new Contrataciones();
    $envase->editar_tipocontrato($_POST['idtipocontrato'],$_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idtipocontrato'],$_POST['nombre'],$_POST['observacion'],$_POST['fecha'],$_POST['idempresa']));
    }
}elseif($ver=="registrar_modopago") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['idempresa'])) {
        $envase = new Modopago();
    $envase->registrar_modopago($_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['descripcion'],$_POST['estado'],$_POST['idempresa']));
    }
}elseif($ver=="editar_modopago") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idmodopago'],$_POST['nombre'],$_POST['descripcion'],$_POST['idempresa'])) {
        $envase = new Modopago();
    $envase->editar_modopago($_POST['idmodopago'],$_POST['nombre'],$_POST['descripcion'],$_POST['idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idmodopago'],$_POST['nombre'],$_POST['descripcion'],$_POST['idempresa']));
    }
}elseif($ver=="editar_estado_modopago") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idmodopago'],$_POST['estado'])) {
        $envase = new Modopago();
    $envase->editar_estado_modopago($_POST['idmodopago'],$_POST['estado']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idmodopago'],$_POST['estado']));
    }
}elseif($ver=="registrar_contrataciones") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['modopago_idmodopago'],$_POST['trabajador_idtrabajador'],$_POST['tipocontrato_idtipocontrato'],$_POST['estado'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['cargo_idcargo'],$_POST['fecha'])) {
        $envase = new Contrataciones();
                                                                                  // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_contrataciones($_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['modopago_idmodopago'],$_POST['trabajador_idtrabajador'],$_POST['tipocontrato_idtipocontrato'],$_POST['estado'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['cargo_idcargo'],$_POST['fecha']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['modopago_idmodopago'],$_POST['trabajador_idtrabajador'],$_POST['tipocontrato_idtipocontrato'],$_POST['estado'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['cargo_idcargo'],$_POST['fecha']));
    }
}elseif($ver=="editar_contrataciones") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idcontrataciones'],$_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['fecha'])) {
        $envase = new Contrataciones();
    $envase->editar_contrataciones($_POST['idcontrataciones'],$_POST['fechai'],$_POST['modo'],$_POST['salario'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['fecha']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrataciones'],$_POST['fechai'],$_POST['fechaf'],$_POST['fechab'],$_POST['modo'],$_POST['salario'],$_POST['tipo'],$_POST['horas'],$_POST['fechafirma'],$_POST['fecha']));
    }
}elseif($ver=="editar_estado_contrataciones") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idcontrataciones'],$_POST['estado'])) {
        $envase = new Contrataciones();
    $envase->editar_estado_contrataciones($_POST['idcontrataciones'],$_POST['estado']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrataciones'],$_POST['estado']));
    }
}elseif($ver=="registrar_costo_produccion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['costo_materia_prima'],$_POST['costo_mano_obra'],$_POST['costo_gastos_generales'],$_POST['total'],$_POST['produccion_idproduccion'])) {
        $envase = new Costo_produccion();
                                                                                  // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_costo_produccion($_POST['costo_materia_prima'],$_POST['costo_mano_obra'],$_POST['costo_gastos_generales'],$_POST['total'],$_POST['produccion_idproduccion']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['costo_materia_prima'],$_POST['costo_mano_obra'],$_POST['costo_gastos_generales'],$_POST['total'],$_POST['produccion_idproduccion']));
    }
}elseif($ver=="registrar_gastos_generales") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_gastos_generales($_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="editar_gastos_generales") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['idgastos_generales'],$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->editar_gastos_generales($_POST['idgastos_generales'],$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idgastos_generales'],$_POST['codigo'],$_POST['nombre'],$_POST['descripcion'],$_POST['tipo_variable'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="registrar_detalle_gastos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['monto'],$_POST['tiempo'],$_POST['gastos_generales_idgastos_generales'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_detalle_gastos($_POST['monto'],$_POST['tiempo'],$_POST['gastos_generales_idgastos_generales']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['monto'],$_POST['tiempo'],$_POST['gastos_generales_idgastos_generales']));
    }
}elseif($ver=="editar_detalle_gastos") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['iddetalle_gastos'],$_POST['monto'],$_POST['tiempo'])) {
        $envase = new Gastos_generales();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->editar_detalle_gastos($_POST['iddetalle_gastos'],$_POST['monto'],$_POST['tiempo']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddetalle_gastos'],$_POST['monto'],$_POST['tiempo']));
    }
}elseif($ver=="registrar_detalle_distribucion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['cantidad'],$_POST['distribucion_iddistribucion'],$_POST['producto_idproducto'])) {
        $envase = new Despachar_producto();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registrar_detalle_distribucion($_POST['cantidad'],$_POST['distribucion_iddistribucion'],$_POST['producto_idproducto']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['distribucion_iddistribucion'],$_POST['producto_idproducto']));
    }
}elseif($ver=="registro_despacho_producto") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    // limpieza, descripcion, frecuencia, costo,seccion_idseccion
    if (isset($_POST['cantidad'],$_POST['detalle_distribucion_iddetalle_distribucion'],$_POST['almacen_producto_idalmacen_producto'],$_POST['empresa_idempresa'])) {
        $envase = new Despachar_producto();                                   // fechai,fechaf,fechab,modo,salario,modopago_idmodopago,trabajador_idtrabajador,tipocontrato_idtipocontrato,estado,tipo,horas, fechafirma,cargo_idcargo,fecha
    $envase->registro_despacho_producto($_POST['cantidad'],$_POST['detalle_distribucion_iddetalle_distribucion'],$_POST['almacen_producto_idalmacen_producto'],$_POST['empresa_idempresa']);
    }else{//$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad'],$_POST['detalle_distribucion_iddetalle_distribucion'],$_POST['almacen_producto_idalmacen_producto'],$_POST['empresa_idempresa']));
    }
}elseif($ver=="anularDistribucion") {// esto sale del hidden del input que esta en el formulario
    // cantidad,costo_unitarioad,empresa_idempresa,lote_idlote, control_calidad_idcontrol_calidad,material_idmaterial,empresa_idempresa,control_calidad_idcontrol_calidad,producto_idproducto
    if (isset($_POST['iddistribucion'])) {
        $envase = new Despachar_producto();
    $envase->anularDistribucion($_POST['iddistribucion']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddistribucion']));
    }
}elseif($ver=="actualizar_estado_distribucion") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['iddistribucion'],$_POST['estado'])) {
        $envase = new Despachar_producto();
    $envase->actualizar_estado_distribucion($_POST['iddistribucion'],$_POST['estado']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['iddistribucion'],$_POST['estado']));
    }
}elseif($ver=="editar_contrataciones_fechas") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idcontrataciones'],$_POST['fechaf'],$_POST['fechab'])) {
        $envase = new Contrataciones();
    $envase->editar_contrataciones_fechas($_POST['idcontrataciones'],$_POST['fechaf'],$_POST['fechab']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idcontrataciones'],$_POST['fechaf'],$_POST['fechab']));
    }
}elseif($ver=="registrar_grupo_etapa") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['nombre'],$_POST['$empresa_idempresa'],$_POST['rubro_idrubro'])) {
        $envase = new Grupo_etapas();
    $envase->registrar_grupo_etapa($_POST['nombre'],$_POST['$empresa_idempresa'],$_POST['rubro_idrubro']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['nombre'],$_POST['$empresa_idempresa'],$_POST['rubro_idrubro']));
    }
}elseif($ver=="editar_etapa_produccion_empleado") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idetapa_producccion_has_empleado'],$_POST['fecha_fin'])) {
        $envase = new Empleado();
    $envase->editar_etapa_produccion_empleado($_POST['idetapa_producccion_has_empleado'],$_POST['fecha_fin']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idetapa_producccion_has_empleado'],$_POST['fecha_fin']));
    }
}elseif($ver=="registrar_almacen_fisico") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['material_idmaterial'],$_POST['$tipo_envase_idtipo_envase'],$_POST['cantidad'])) {
        $envase = new Alma_fisic_merma();
    $envase->registrar_almacen_fisico($_POST['material_idmaterial'],$_POST['$tipo_envase_idtipo_envase'],$_POST['cantidad']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['material_idmaterial'],$_POST['$tipo_envase_idtipo_envase'],$_POST['cantidad']));
    }
}elseif($ver=="editar_almacen_fisico") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idalmacen_fisico'],$_POST['cantidad'])) {
        $envase = new Alma_fisic_merma();
    $envase->editar_almacen_fisico($_POST['idalmacen_fisico'],$_POST['cantidad']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idalmacen_fisico'],$_POST['cantidad']));
    }
}elseif($ver=="registrar_merma") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['cantidad_envase'],$_POST['peso_neto'],$_POST['$tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['$material_idmaterial'],$_POST['empresa_idempresa'],$_POST['$proveedor_idproveedor'],$_POST['compra_idcompra'])) {
        $envase = new Alma_fisic_merma();
    $envase->registrar_merma($_POST['cantidad_envase'],$_POST['peso_neto'],$_POST['$tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['$material_idmaterial'],$_POST['empresa_idempresa'],$_POST['$proveedor_idproveedor'],$_POST['compra_idcompra']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['cantidad_envase'],$_POST['peso_neto'],$_POST['$tipo_envase_idtipo_envase'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'],$_POST['$material_idmaterial'],$_POST['empresa_idempresa'],$_POST['$proveedor_idproveedor'],$_POST['compra_idcompra']));
    }
}elseif($ver=="editar_merma") {// esto sale del hidden del input que esta en el formulario
    if (isset($_POST['idmerma'],$_POST['cantidad_envase'],$_POST['peso_neto'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase'])) {
        $envase = new Alma_fisic_merma();
    $envase->editar_merma($_POST['idmerma'],$_POST['cantidad_envase'],$_POST['peso_neto'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase']);
    }else{
        echo json_encode(array("Error", "Faltan parámetros en la solicitud",$_POST['idmerma'],$_POST['cantidad_envase'],$_POST['peso_neto'],$_POST['cantidad'],$_POST['costo_unitario'],$_POST['costo_envase']));
    }
}

else{
// Leer el cuerpo de la solicitud

    $json = file_get_contents('php://input');
        
    // Decodificar el JSON
    $data = json_decode($json, true);

        $ver = $data['ver'];
    //   echo json_encode(array("siPasoParametros", " epa",$data['verDavid'],$ver));
    if ($ver == "Editar_orden_produccion_lista_completa") {    
        // Verificar si se ha decodificado correctamente y si los parámetros existen
        if (isset($data['idorden_produccion'], $data['fecha_orp'], $data['hora_orp'], $data['estado'], $data['empresa_idempresa'], $data['empleado_idempleado'], $data['detalles'])) {
            $rcompra = new Orden_produccion();
            $lastIndex = count($data['detalles']) - 1;
            // Iterar sobre cada detalle y realizar la operación necesaria
            foreach ($data['detalles'] as $index => $detalle) {
                if (isset($detalle['iddetalle_produccion'], $detalle['cantidad'], $detalle['observaciones'], $detalle['orden_produccion_idorden_produccion'], $detalle['producto_idproducto'])) {
                    if ($index === $lastIndex) {
                    $rcompra->Editar_detalle_produccion(
                        $data['detalles']
                    );
                }
                } else {
                    echo json_encode(array("Error", "Faltan parámetros en un detalle", $detalle));
                    return;
                }
            }
            
            // echo json_encode(array("siPasoParametros", " epa"));

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }
    else if($ver=="registrarSolicitudMaterial"){
        if (isset($data['idsolicitud_material'],$data['fecha'], $data['hora'], $data['estado'], $data['empresa_idempresa'], $data['empleado_idempleado'],$data['produccion_idproduccion'], $data['detalles'])) {
            $rcompra = new AlmacenMaterial();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registrarSolicitudMaterial(
                $data['idsolicitud_material'],$data['fecha'], $data['hora'],
                $data['estado'], $data['empresa_idempresa'], $data['empleado_idempleado'],
                $data['produccion_idproduccion'], $data['detalles']
            );
            // echo json_encode(array("siPasoParametros", " epa")); registroCaracteristicas

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }
    elseif($ver=="registrar_grupo_etapas_ordenados"){
        // echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        
        if (isset($data['idgrupo_etapas'], $data['nombre'], $data['empresa'],$data['rubro_idrubro'],$data['etapas_ordenes'])) {
            $rcompra = new Grupo_etapas();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registrar_grupo_etapas_ordenados(
                $data['idgrupo_etapas'], $data['nombre'], $data['empresa'], $data['rubro_idrubro'],$data['etapas_ordenes']
            );
            // echo json_encode(array("siPasoParametros", " epa"));

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registro_productos_grupo"){
        // echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        
        if (isset($data['detalle'])) {
            $rcompra = new Grupo_etapas();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registro_productos_grupo($data['detalle']);

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registrar_proveedor_material"){
        if (isset($data['detalle'])) {
            $rcompra = new Proveedor_conf();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registrar_proveedor_material($data['detalle']);
            // echo json_encode(array("siPasoParametros", "epa"));

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registro_maquina_etapas"){
        if (isset($data['detalle'])) {
            $rcompra = new Grupo_etapas();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registro_maquina_etapas($data['detalle']);
            // echo json_encode(array("siPasoParametros", "epa"));

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registro_lista_pedidos"){
        if (isset($data['fecha_p'], $data['hora'], $data['estado'],$data['rubro_idrubro'],$data['empresa_idempresa'],$data['empleado_idempleado'],$data['detalle'])) {
            $rcompra = new ListaSolicitud_conf();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registro_lista_pedidos($data['fecha_p'], $data['hora'], $data['estado'],$data['rubro_idrubro'],$data['empresa_idempresa'],$data['empleado_idempleado'],$data['detalle']);
            // echo json_encode(array("siPasoParametros", "epa"));

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registrar_compras"){
        if (isset($data['pedido_idpedido'],$data['lote'], $data['fecha'],$data['hora'], $data['num_registro'],$data['total'],$data['empleado_idempleado'],$data['proveedor_idproveedor'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle'])) {
            $rcompra = new Compra();
            // Iterar sobre cada detalle y realizar la operación necesaria
            // $lote,$fecha,$hora,$numReg,$total,$empleado_idempleado,$proveedor_idproveedor,$empresa,$rubro,$detalles
            $rcompra->registrar_compras($data['pedido_idpedido'],$data['lote'], $data['fecha'],$data['hora'], $data['num_registro'],$data['total'],$data['empleado_idempleado'],$data['proveedor_idproveedor'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle']);
            // echo json_encode(array("siPasoParametros", "epa"));

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registrar_etapa_produccion_empleado"){
        if (isset($data['empleados'])) {
            $rcompra = new Empleado();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registrar_etapa_produccion_empleado($data['empleados']);
            // echo json_encode(array("siPasoParametros", "epa"));

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registrar_procedimiento"){
        if (isset($data['procedimiento'])) {
            $rcompra = new Procedimiento();
            // Iterar sobre cada detalle y realizar la operación necesaria
            $rcompra->registrar_procedimiento($data['procedimiento']);
            // echo json_encode(array("siPasoParametros", "epa"));registrar_compras

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }elseif($ver=="registrar_distribucion"){
        // numerodoc,fecha,hora,estado,usuario_idusuario,empresa_idempresa,rubro_idrubro
        if (isset($data['numerodoc'],$data['fecha'],$data['hora'], $data['estado'],$data['usuario_idusuario'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle'])) {
            $rcompra = new Despachar_producto();
            // Iterar sobre cada detalle y realizar la operación necesaria
            
            $rcompra->registrar_distribucion($data['numerodoc'],$data['fecha'],$data['hora'], $data['estado'],$data['usuario_idusuario'],$data['empresa_idempresa'],$data['rubro_idrubro'],$data['detalle']);
            // echo json_encode(array("siPasoParametros", "epa")); registro_despacho_producto

        } else {
            echo json_encode(array("Error", "Faltan parámetros en la solicitud principal", $data));
        }
    }
    else{
        echo json_encode(array("Error", "el ver no coincide con ninguno de los else",$ver,$data));
    }
}
?>