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

$ver=$_POST['ver'];

if($ver=="registrar_divisa"){// esto sale del hidden del input que esta en el formulario
    $obj = new Divisa_conf();
  
    $obj->registrar_divisa($_POST['nombre'], $_POST['tipo_divisa'],1,$_POST['empresa'],null); 
}elseif($ver=="editar_divisa"){
    
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
        $maq->editar_producto($_POST['id'],$_POST['nombre'],$_POST['codigo'],$_POST['estado'],$_POST['medida'],$_POST['rubro'],$_POST['seccion'],$_POST['idestandar'],$_POST['cantidad'],$_POST['tiempo'],$_POST['unidadtiempo']);
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
    // if($direccion == "./imagen/null.png"){
    //     // $direccion = "./imagen/null.png";
        
    // }
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
}
//editardivisa  efe
?>