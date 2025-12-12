<?php
require_once "../../db/db.php";
// require_once "../configuracion/empresa.php";

class Plantilla_admin extends DB{
    public function reporte_balance_general_admin($idtn,$empresa){
        $url = "http://mistersofts.com/administrador/api/getListaplantillareporterubro/".$idtn;
        $data = json_decode(file_get_contents($url), true);

        $lista = [];
        // Mostrar el nombre de cada plantilla
        foreach ($data as $item) {
            // echo $item['nombre'] . "<br>";
            foreach($item['config'] as $config){
                if(empty($config['children'])){
                    // 
                }else{
                    foreach($config['children'] as $hijo_1){
                        if(empty($hijo_1['children'])){

                        }else{
                            array_push($lista, $hijo_1['children']); 

                        }
                    }
                    // array_push($lista, $config['children']); 
                }
            }
            // $aux = $item['config'];
            //  array_push($lista, $aux['children']); 
        }
        echo json_encode($lista, JSON_NUMERIC_CHECK); 
    }

    public function registrar_balance_general_admin($idplantilla_reporte,$idtn,$empresa){
         ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa);
        $url = "http://mistersofts.com/administrador/api/getListaplantillareporterubro/".$idtn;
        $data = json_decode(file_get_contents($url), true);

        $cont = 0;
        foreach($data as $plantilla){
            if ($plantilla['idctplantilla'] == $idplantilla_reporte) {
                // ENTRO AL CONFIG DE BALANCE GENERAL
                if (isset($data[$cont]['config']) && !empty($data[$cont]['config'])) {
                    $ordenPorNivelPadre = [];

                    $registro_tipo = $this->dbc->query("INSERT INTO tipo_reportes(nombre,descripcion,tipo_reporte,estado,idempresa) 
                        VALUES ('$plantilla[nombre]','$plantilla[descripcion]','$plantilla[tiporeporte]','0','$idempresa')");

                    $idtipo_reporte = $this->dbc->insert_id;

                    $listado_admin = $this->procesarListado($data[$cont]['config'],$idempresa, 1, $ordenPorNivelPadre,'',$idtipo_reporte);
                    $res = array("success", "Todos los elementos fueron registrados");
                } else {
                    $res = array("danger", "No se encontró el campo 'config' en la respuesta.",$data,$data[$cont]['config']);
                }
            }else{
                // NO ENTRO AL CONFIG DE BALANCE GENERAL Y SOLO ME SALTO
            }
            $cont++;
        }

        echo json_encode($res); 
        // echo json_encode(array($idtn,$empresa)); 
    }

    private function procesarListado($listado, $idempresa, $nivel = 1, &$ordenPorNivelPadre = [], $idPadrePlan = null, $idtipo_reporte) {
    foreach ($listado as $item) {
        $clavePadre = $idPadrePlan ?: 'RAIZ';
        if (!isset($ordenPorNivelPadre[$nivel][$clavePadre])) {
            $ordenPorNivelPadre[$nivel][$clavePadre] = 1;
        }

        $orden = $ordenPorNivelPadre[$nivel][$clavePadre];

        // Registrar el ítem y obtener su idplandecuenta
        $idPlanActual = $this->registrarItem($item, $idempresa, $nivel, $orden, $idPadrePlan, $idtipo_reporte);

        $ordenPorNivelPadre[$nivel][$clavePadre]++;

        // Procesar hijos si existen
        if (!empty($item['children'])) {
            foreach ($item['children'] as $child) {
                // if (isset($child['depreciacion']) && $child['depreciacion'] === 'si') {
                //     $orden = $ordenPorNivelPadre[$nivel][$clavePadre];
                //     $this->registrarItem($child, $idempresa, $nivel, $orden, $idPlanActual, $idtipo_reporte);
                //     $ordenPorNivelPadre[$nivel][$clavePadre]++;
                //     $this->registrarRelacionDepreciacion($item, $child, $idtipo_reporte, $idempresa);
                // } else {
                //     // Ahora pasamos el id del plan actual, no el nombre
                //     $this->procesarListado([$child], $idempresa, $nivel + 1, $ordenPorNivelPadre, $idPlanActual, $idtipo_reporte);
                // }
                if (isset($child['depreciacion']) && $child['depreciacion'] === 'si') {
                    $orden = $ordenPorNivelPadre[$nivel][$clavePadre];
                    
                    // 👇 Cambiamos $idPlanActual por $idPadrePlan
                    $this->registrarItem($child, $idempresa, $nivel, $orden, $idPadrePlan, $idtipo_reporte);
                    
                    $ordenPorNivelPadre[$nivel][$clavePadre]++;
                    $this->registrarRelacionDepreciacion($item, $child, $idtipo_reporte, $idempresa);
                } else {
                    $this->procesarListado([$child], $idempresa, $nivel + 1, $ordenPorNivelPadre, $idPlanActual, $idtipo_reporte);
                }

            }
        }
    }
}
    // private function procesarListado($listado,$idempresa, $nivel = 1, &$ordenPorNivelPadre  = [],$nombrePadre = '',$idtipo_reporte) {
    //     foreach ($listado as $item) {
    //         // Usa el nombre del padre como clave
    //         $clavePadre = $nombrePadre ?: 'RAIZ';
    //        // Inicializa el contador si no existe para este nivel y padre
    //         if (!isset($ordenPorNivelPadre[$nivel][$clavePadre])) {
    //             $ordenPorNivelPadre[$nivel][$clavePadre] = 1;
    //         }

    //         $orden = $ordenPorNivelPadre[$nivel][$clavePadre];

    //         $registrar_config = $this->registrarItem($item,$idempresa, $nivel, $orden,$nombrePadre,$idtipo_reporte); // Guarda el item actual

    //          $ordenPorNivelPadre[$nivel][$clavePadre]++; // Incrementa el orden para ese grupo en ese nivel
    //         if (!empty($item['children'])) { // ESTO ES PARA REGISTRAR LA DEPRECIACION SISQUE TIENE
    //             //if($item['children']['depreciacion'] == 'SI'){
    //                 // registrara la cuenta 1 y la cuenta depreciacion pero con nivel de la cuenta 1 
    //                 //habran registros en la tabla configuracion_reporte y vinculacion_depreciacion 
    //             // }else{
                
    //             //}

    //             // $listado_admin = $this->procesarListado($item['children'],$idempresa, $nivel + 1,$ordenPorNivelPadre,$item['nombreplan']); // Procesa hijos
    //             foreach ($item['children'] as $child) {
    //                 if (isset($child['depreciacion']) && $child['depreciacion'] === 'si') {
    //                     // Registrar el hijo al mismo nivel que el padre
    //                     $orden = $ordenPorNivelPadre[$nivel][$clavePadre];
    //                     $this->registrarItem($child, $idempresa, $nivel, $orden, $nombrePadre,$idtipo_reporte);
    //                     $ordenPorNivelPadre[$nivel][$clavePadre]++;

    //                     // Registrar ambos en tabla especial
    //                     $this->registrarRelacionDepreciacion($item, $child,$idtipo_reporte, $idempresa);
    //                 }else{
    //                     // Procesar normalmente como hijo
    //                     $this->procesarListado([$child], $idempresa, $nivel + 1, $ordenPorNivelPadre, $item['nombreplan'],$idtipo_reporte);
    //                 }
    //             }
    //         }
    //     }
    // }

    private function registrarRelacionDepreciacion($original, $depreciacion,$idtipo_reporte, $idempresa) {
        $idgestion = $this->getidgestionid($idempresa);

        $cuenta_original = $this->dbc->query("SELECT idplandecuenta FROM plandecuenta WHERE numero = '$original[numero]' AND organizacion_idorganizacion = '$idempresa'");
        $cuenta_depreciacion = $this->dbc->query("SELECT idplandecuenta FROM plandecuenta WHERE numero = '$depreciacion[numero]' AND organizacion_idorganizacion = '$idempresa'");

        $id_original = $cuenta_original->fetch_assoc()['idplandecuenta'];
        $id_depreciacion = $cuenta_depreciacion->fetch_assoc()['idplandecuenta'];

        // Verificar que ambas cuentas existan
        if (!$id_original || !$id_depreciacion) {
             // No registrar si alguna cuenta no existe
        }else{
            $registrar_depreciacion = $this->dbc->query("INSERT INTO vinculacion_cuenta_depreciacion(idcuenta, idcuenta_depreciacion, idgestion,idtipo_reportes, idempresa) 
                        VALUES ('$id_original', '$id_depreciacion', '$idgestion','$idtipo_reporte', '$idempresa')");
        }

    }


    private function registrarItem($item, $idempresa, $nivel, $orden, $idPadrePlan, $idtipo_reporte) {
    $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$idtipo_reporte' AND idempresa ='$idempresa'");
    $tr_aux = $tipo_reporte->fetch_assoc();

    $plancuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$item[numero]' AND organizacion_idorganizacion ='$idempresa'");
    $pl_aux = $plancuenta->fetch_assoc();

    if (!$pl_aux) {
        return null; // si no existe, salimos
    }

    if ($item['grupo'] == 'ACTIVO') {
        $grup = '1';
    } elseif ($item['grupo'] == 'PASIVO') {
        $grup = '2';
    } else {
        $grup = '3';
    }

    // Obtener el nombre del plan padre (si existe)
    $nombreCuentaSuperior = '';
    if (!empty($idPadrePlan)) {
        $padre = $this->dbc->query("SELECT nombreplan FROM plandecuenta WHERE idplandecuenta = '$idPadrePlan'");
        if ($padre && $padre->num_rows > 0) {
            $padre_aux = $padre->fetch_assoc();
            $nombreCuentaSuperior = $padre_aux['nombreplan'];
        }
    }

    $this->dbc->query("INSERT INTO configuracion_reporte(
        idplandecuenta, idplantilla_reporte, reporte, nombre_cuenta_superior, nivel_registrado, orden, grupo, es_calculable, es_activo_fijo, idempresa
    ) VALUES (
        '$pl_aux[idplandecuenta]', '$tr_aux[idtipo_reportes]', '$tr_aux[tipo_reporte]', '$nombreCuentaSuperior', 
        '$nivel', '$orden', '$grup', '$item[escalculable]', '$item[esactivofijo]', '$idempresa'
    )");

    // Devuelvo el idplandecuenta actual para que los hijos sepan quién es su padre
    return $pl_aux['idplandecuenta'];
}
    // private function registrarItem($item,$idempresa, $nivel,$orden,$nombrePadre,$idtipo_reporte) {

    //     //  $registro_tipo = $this->dbc->query("INSERT INTO tipo_reportes(nombre,descripcion,tipo_reporte,idempresa) 
    //     //     VALUES ('$nombre_reporte','$descripcion','$tipo_reporte','$idempresa')");

    //     // $idtipo_reporte = $this->dbc->insert_id;

    //     $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$idtipo_reporte' AND idempresa ='$idempresa'");
    //     $tr_aux = $tipo_reporte->fetch_assoc();

    //     $plancuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$item[numero]' AND organizacion_idorganizacion ='$idempresa'");
    //     $pl_aux = $plancuenta->fetch_assoc();

    //     if($item['grupo'] == 'ACTIVO'){
    //             $grup = '1';
    //     }elseif($item['grupo'] == 'PASIVO'){
    //             $grup = '2';
    //     }else{
    //             $grup = '3';
    //     }
    //      if (!$pl_aux) {
    //         // no ocurrira nada solo saltara
    //      }else{
    //         $registro_confi = $this->dbc->query("INSERT INTO configuracion_reporte(idplandecuenta,idplantilla_reporte,reporte,nombre_cuenta_superior,nivel_registrado,orden,grupo,es_calculable,es_activo_fijo,idempresa) 
    //         VALUES ('$pl_aux[idplandecuenta]','$tr_aux[idtipo_reportes]','$tr_aux[tipo_reporte]','$nombrePadre','$nivel','$orden','$grup','$item[escalculable]','$item[esactivofijo]','$idempresa')");

    //      }
            
    // }

    // public function registrar_agrupacion_plantilla($idplantilla_padre, $idplantilla_hijo, $tipo_operacion,$monto,$empresa) {
    //     $idempresa = $this->get_id_empresa($empresa);

    //     if($tipo_operacion == 'porcentaje'){
    //         $registro = $this->dbc->query("INSERT INTO agrupacion_plantilla(idplantilla_padre, idplantilla_hijo, tipo_operacion,monto, idempresa) VALUES ('$idplantilla_hijo', '$idplantilla_padre', '$tipo_operacion','$monto', '$idempresa')");

    //     }else{
    //         // Insertar el nuevo registro
    //         $registro = $this->dbc->query("INSERT INTO agrupacion_plantilla(idplantilla_padre, idplantilla_hijo, tipo_operacion,monto, idempresa) VALUES ('$idplantilla_padre', '$idplantilla_hijo', '$tipo_operacion','$monto', '$idempresa')");
    //     }
       
    //     if ($registro === TRUE) {                                                                                                                                                                
    //         $res = array("success", "Registro exitoso","rp_registrar_reporte");
    //     } else {
    //         $res = array("danger", "No se pudo registrar");
    //     }
    //     echo json_encode($res);
    // }

    public function registrar_estado_resultados_admin($idplantilla_reporte,$idtn,$empresa){
         ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa);
        $url = "http://mistersofts.com/administrador/api/getListaplantillareporterubro/".$idtn;
        $data = json_decode(file_get_contents($url), true);

        $cont = 0;
        foreach($data as $plantilla){
            if ($plantilla['idctplantilla'] == $idplantilla_reporte) {
                // ENTRO AL CONFIG DE BALANCE GENERAL
                if (isset($data[$cont]['config']) && !empty($data[$cont]['config'])) {
                    $ordenPorNivelPadre = [];

                    $registro_tipo = $this->dbc->query("INSERT INTO tipo_reportes(nombre,descripcion,tipo_reporte,estado,idempresa) 
                        VALUES ('$plantilla[nombre]','$plantilla[descripcion]','$plantilla[tiporeporte]','0','$idempresa')");

                    $idtipo_reporte = $this->dbc->insert_id;

                    $listado_admin = $this->procesarListado_Estado_resultados($data[$cont]['config'],$idempresa, 1, $ordenPorNivelPadre,$idtipo_reporte);
                    $res = array("success", "Todos los elementos fueron registrados");
                } else {
                    $res = array("danger", "No se encontró el campo 'config' en la respuesta.",$data,$data[$cont]['config']);
                }
            }else{
                // NO ENTRO AL CONFIG DE BALANCE GENERAL Y SOLO ME SALTO
            }
            $cont++;
        }

        echo json_encode($res); 
        // echo json_encode(array($idplantilla_reporte,$idtn,$empresa)); 
    }

    private function procesarListado_Estado_resultados($listado,$idempresa, $nivel = 1, &$ordenPorNivelPadre  = [],$idtipo_reporte, $idplantilla_padre = 0) {
        foreach ($listado as $item) {
            // Extraer nombre_personalizado y tipo_operacion desde el item
        $nombre_personalizado = $item['nombre'] ?? '';
        $tipo_operacion = $item['tipooperacion'] ?? '';
        $tipo_asiento = $item['tipoasiento'];

            // Agrupar orden por idplantilla_padre
        if (!isset($ordenPorNivelPadre[$idplantilla_padre])) {
            $ordenPorNivelPadre[$idplantilla_padre] = 1;
        }

        $orden = $ordenPorNivelPadre[$idplantilla_padre];
    
            

            $idplantilla_actual = $this->registrarItem_estado_resultados($item,$idempresa, $nivel, $orden,$nombre_personalizado,$tipo_operacion,$idtipo_reporte, $idplantilla_padre,$tipo_asiento); // Guarda el item actual

             // Solo incrementar el orden si se insertó correctamente   
            if ($idplantilla_actual != false && $idplantilla_actual > 0) {
                $ordenPorNivelPadre[$idplantilla_padre]++;
            }
            // Registrar operaciones si existen
        if (!empty($item['operaciones']) && is_array($item['operaciones'])) {
            foreach ($item['operaciones'] as $operacion) {
                $nombre_hijo = $operacion['nombre_relacion'] ?? '';
                $tipo_op = $operacion['operacion'] ?? '';
                $monto_op = $operacion['valor_porcentaje'] ?? '0';

                // Buscar el idplantilla_hijo por nombre_personalizado
                $plantilla_hijo = $this->dbc->query("SELECT * FROM pr_plantilla 
                    WHERE nombre_personalizado = '$nombre_hijo' 
                    AND idempresa = '$idempresa'");

                $ph_aux = $plantilla_hijo->fetch_assoc();

                if ($ph_aux) {
                    $idplantilla_hijo = $ph_aux['idplantilla'];

                    // Registrar en agrupacion_plantilla
                    $this->dbc->query("INSERT INTO agrupacion_plantilla(idplantilla_padre, idplantilla_hijo, tipo_operacion, monto, idtipo_reportes, idempresa)
                        VALUES ('$idplantilla_actual', '$idplantilla_hijo', '$tipo_op', '$monto_op', '$idtipo_reporte', '$idempresa')");
                }
            }
        }
          
            // Procesar hijos si existen
        if (!empty($item['children'])) {
            $this->procesarListado_Estado_resultados(
                $item['children'],
                $idempresa,
                $nivel + 1,
                $ordenPorNivelPadre,
                $idtipo_reporte,
                // $idplantilla_actual // ahora este es el padre
                $idplantilla_actual ?: $idplantilla_padre // Si no se insertó, mantener el padre actual
            );
        }

        }
    }

    private function registrarItem_estado_resultados($item,$idempresa, $nivel,$orden,$nombre_personalizado,$tipo_operacion,$idtipo_reporte, $idplantilla_padre = 0, $tipo_asiento) {

        $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE idtipo_reportes = '$idtipo_reporte' AND idempresa ='$idempresa'");
        $tr_aux = $tipo_reporte->fetch_assoc();

        $plancuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$item[numero]' AND organizacion_idorganizacion ='$idempresa'");
        $pl_aux = $plancuenta->fetch_assoc();

        if($item['numero'] == ""){ // ES UN REGISTRO CON NOMBRE PERSONALIZADO
             if($idplantilla_padre == '0'){
                $registro_confi = $this->dbc->query("INSERT INTO pr_plantilla(idplantilla_reporte,nombre_personalizado,tipo_operacion,nivel,orden,disponible_para_otro_reporte,ingreso_egreso,idempresa) 
                VALUES ('$tr_aux[idtipo_reportes]','$nombre_personalizado','$tipo_operacion','$nivel','$orden','no','$tipo_asiento','$idempresa')");

            }else{
                $registro_confi = $this->dbc->query("INSERT INTO pr_plantilla(idplantilla_reporte,idplantilla_padre,nombre_personalizado,tipo_operacion,nivel,orden,disponible_para_otro_reporte,ingreso_egreso,idempresa) 
                VALUES ('$tr_aux[idtipo_reportes]','$idplantilla_padre','$nombre_personalizado','$tipo_operacion','$nivel','$orden','no','$tipo_asiento','$idempresa')");

            }
            
            $respuesta = $this->dbc->insert_id;

        }else{ // ES UN REGISTRO QUE TIENE PLANDECUENTA (1.1.1.01.00)
            if (!$pl_aux) { // NO EXISTE  EL PLAN DE CUENTA EN CONTABILIDAD
                // no ocurrira nada solo saltara
                $respuesta = false;
            }else{
                $registro_confi = $this->dbc->query("INSERT INTO pr_plantilla(idplantilla_reporte,idplantilla_padre,idplandecuenta,nombre_personalizado,tipo_operacion,nivel,orden,disponible_para_otro_reporte,ingreso_egreso,idempresa) 
                VALUES ('$tr_aux[idtipo_reportes]','$idplantilla_padre','$pl_aux[idplandecuenta]','$nombre_personalizado','$tipo_operacion','$nivel','$orden','no','$tipo_asiento','$idempresa')");
            
                $respuesta = $this->dbc->insert_id;
            }
        }
       
        return $respuesta;
            
    }

    public function importar_todo_admin($idtn,$empresa){
        //  ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        // $idempresa = $this->getidempresa($empresa);
        $url = "http://mistersofts.com/administrador/api/getListaplantillareporterubro/".$idtn;
        $data = json_decode(file_get_contents($url), true);
        
        foreach($data as $plantilla){
            if($plantilla['tiporeporte'] == 'estado_resultado'){
                $listado_admin = $this->registrar_estado_resultados_admin($plantilla['idctplantilla'], $idtn,$empresa);
                
            }elseif($plantilla['tiporeporte'] == 'balance_general'){
                $listado_admin = $this->registrar_balance_general_admin($plantilla['idctplantilla'],$idtn, $empresa);
            }
        }
        if($listado_admin === TRUE){
            $res = array("success", "Todos los elementos fueron registrados");
        }else{
            $res = array("danger", "No se encontró el campo 'config' en la respuesta.");
        }

        echo json_encode($res); 
        // echo json_encode(array($idplantilla_reporte,$idtn,$empresa)); 
    }
    public function getidempresa($md5)
    {
        $registro = $this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe = $this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    public function getidgestionid($idempresa){
        $registro=$this->dbc->query("select * from gestion where idempresa='$idempresa' and estado='2'");
        $qwe=$this->dbc->fetch($registro);
        return $qwe['idgestion'];
    }
}