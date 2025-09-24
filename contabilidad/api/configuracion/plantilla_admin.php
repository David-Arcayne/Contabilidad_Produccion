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

    public function registrar_balance_general_admin($idtn,$empresa){
         ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        $idempresa = $this->getidempresa($empresa);
        $url = "http://mistersofts.com/administrador/api/getListaplantillareporterubro/".$idtn;
        $data = json_decode(file_get_contents($url), true);

        // if (isset($data['config'])) {
        if (isset($data[0]['config']) && !empty($data[0]['config'])) {
            $ordenPorNivelPadre = [];
            $listado_admin = $this->procesarListado($data[0]['config'],$idempresa, 1, $ordenPorNivelPadre,'');
            $res = array("success", "Todos los elementos fueron registrados");
        } else {
            $res = array("danger", "No se encontró el campo 'config' en la respuesta.",$data,$data[0]['config']);
        }

        // $lista = [];
       
        echo json_encode($res); 
        // echo json_encode(array($idtn,$empresa)); 
    }

    private function procesarListado($listado,$idempresa, $nivel = 1, &$ordenPorNivelPadre  = [],$nombrePadre = '') {
        foreach ($listado as $item) {
            // Usa el nombre del padre como clave
            $clavePadre = $nombrePadre ?: 'RAIZ';
           // Inicializa el contador si no existe para este nivel y padre
            if (!isset($ordenPorNivelPadre[$nivel][$clavePadre])) {
                $ordenPorNivelPadre[$nivel][$clavePadre] = 1;
            }

            $orden = $ordenPorNivelPadre[$nivel][$clavePadre];

            $registrar_config = $this->registrarItem($item,$idempresa, $nivel, $orden,$nombrePadre); // Guarda el item actual

             $ordenPorNivelPadre[$nivel][$clavePadre]++; // Incrementa el orden para ese grupo en ese nivel
            if (!empty($item['children'])) {
                //if($item['children']['depreciacion'] == 'SI'){
                    // registrara la cuenta 1 y la cuenta depreciacion pero con nivel de la cuenta 1 
                    //habran registros en la tabla configuracion_reporte y vinculacion_depreciacion 
                // }else{
                
                //}

                // $listado_admin = $this->procesarListado($item['children'],$idempresa, $nivel + 1,$ordenPorNivelPadre,$item['nombreplan']); // Procesa hijos
                foreach ($item['children'] as $child) {
                    if (isset($child['depreciacion']) && $child['depreciacion'] === 'SI') {
                        // Registrar el hijo al mismo nivel que el padre
                        $orden = $ordenPorNivelPadre[$nivel][$clavePadre];
                        $this->registrarItem($child, $idempresa, $nivel, $orden, $nombrePadre);
                        $ordenPorNivelPadre[$nivel][$clavePadre]++;

                        // Registrar ambos en tabla especial
                        $this->registrarRelacionDepreciacion($item, $child, $idempresa);
                    }else{
                        // Procesar normalmente como hijo
                        $this->procesarListado([$child], $idempresa, $nivel + 1, $ordenPorNivelPadre, $item['nombreplan']);
                    }
                }
            }
        }
    }

    private function registrarRelacionDepreciacion($original, $depreciacion, $idempresa) {
        $idgestion = $this->getidgestionid($idempresa);

        $cuenta_original = $this->dbc->query("SELECT idplandecuenta FROM plandecuenta WHERE numero = '$original[numero]' AND organizacion_idorganizacion = '$idempresa'");
        $cuenta_depreciacion = $this->dbc->query("SELECT idplandecuenta FROM plandecuenta WHERE numero = '$depreciacion[numero]' AND organizacion_idorganizacion = '$idempresa'");

        $id_original = $cuenta_original->fetch_assoc()['idplandecuenta'];
        $id_depreciacion = $cuenta_depreciacion->fetch_assoc()['idplandecuenta'];

        $registrar_depreciacion = $this->dbc->query("INSERT INTO vinculacion_cuenta_depreciacion(idcuenta, idcuenta_depreciacion, idgestion, idempresa) 
                        VALUES ('$id_original', '$id_depreciacion', '$idgestion', '$idempresa')");
    }


    private function registrarItem($item,$idempresa, $nivel,$orden,$nombrePadre) {
        $tipo_reporte = $this->dbc->query("SELECT * FROM tipo_reportes WHERE tipo_reporte = 'balance_general' AND idempresa ='$idempresa'");
        $tr_aux = $tipo_reporte->fetch_assoc();

            $plancuenta = $this->dbc->query("SELECT * FROM plandecuenta WHERE numero = '$item[numero]' AND organizacion_idorganizacion ='$idempresa'");
        $pl_aux = $plancuenta->fetch_assoc();

        if($item['grupo'] == 'ACTIVO'){
                $grup = '1';
        }elseif($item['grupo'] == 'PASIVO'){
                $grup = '2';
        }else{
                $grup = '3';
        }
            $registro_confi = $this->dbc->query("INSERT INTO configuracion_reporte(idplandecuenta,idplantilla_reporte,reporte,nombre_cuenta_superior,nivel_registrado,orden,grupo,es_calculable,es_activo_fijo,idempresa) 
            VALUES ('$pl_aux[idplandecuenta]','$tr_aux[idtipo_reportes]','$tr_aux[tipo_reporte]','$nombrePadre','$nivel','$orden','$grup','$item[escalculable]','$item[esactivofijo]','$idempresa')");

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