<?php
session_start();
//require_once "db.php";
require_once "../../db/db.php";
class Filtrado_facturas extends DB{
    public function listar_facturas_cobros_sin_transaccion($cobrado,$cadena_cajaBancos,$empresa) {
      // $idempresa = $this->getidempresa($empresa);
                // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));
                
                // ini_set('display_errors', 1);
                // ini_set('display_startup_errors', 1);
                // error_reporting(E_ALL);


        $lista = [];
        $array_idfacturas = [];
        $idempresa = $this->getidempresa($empresa);
    
        // $array_cajaBancos = explode(",", $cadena_cajaBancos);
        $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
        $caja_bancos = implode(",", $array_cajaBancos);
        // Preparar la consulta

        if($cobrado == 1){ //POR COBRAR

        $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idfactura !='0'"); //POR COBRAR

        while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
            $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
            $factu = $factura_aux->fetch_assoc();
            if($factu['transacciones_idtransacciones'] == 0 && $factu['cobrado'] == 1 ){
                array_push($array_idfacturas, $factura_cajas['idfactura']);
            }else{

            }
        }

        $factura_comas = implode(",", $array_idfacturas);

            if($factura_comas == ""){//EL ARRAY ESTABA VACIO, NO EXISTE NINGUNA CAJA_BANCO PARA ESTA FACTURA
                //NO DEBERIA LISTARME NADA AQUI, COMENTAR EL CODIGO
                //NO HAY CAJA_BANCOS
                $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
            }else{
                $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
                UNION
                SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
            }

        }elseif($cobrado == 2){ // COBRADO

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idfactura !='0'"); //POR COBRAR

        while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
            $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
            $factu = $factura_aux->fetch_assoc();
            if($factu['transacciones_idtransacciones'] == 0 && $factu['cobrado'] == 2 ){
                array_push($array_idfacturas, $factura_cajas['idfactura']);
            }else{
                
            }
        }

        $factura_comas = implode(",", $array_idfacturas);

            if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
           }else{
               $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
               UNION
               SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR

           }
        }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idfactura !='0'"); //POR COBRAR

        while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
            $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
            if($factura_aux->num_rows > 0){
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == 0 && $factu['cobrado'] != 0 ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{

                }
            }else{
                //SALTAR
            }
            
        }

        $factura_comas = implode(",", $array_idfacturas);

            if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
           }else{
               $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
               UNION
               SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR

           }
        }
    

        while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array("id" => $qwe[0], 
            "fecha" => $qwe[1],
            "nfactura" => $qwe[2],
            "nautorizacion" => $qwe[3],
            "codigocontrol" => $qwe[4],
            "montofactura" => $qwe[5],
            "tasacero" => $qwe[6],
            "export" => $qwe[7],
            "npoliza" => $qwe[8],
            "ice" => $qwe[9],
            "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12],
            "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15],
            "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18],
            "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],
            "por_concepto_de" => $qwe['por_concepto_de']);

            array_push($lista, $res);
        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
        // echo json_encode(array($caja_bancos,$factura_comas));
    }

    public function listar_facturas_pagos_sin_transaccion($cobrado,$cadena_cajaBancos,$empresa) {
        // $idempresa = $this->getidempresa($empresa);
                  // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));
                  
                  ini_set('display_errors', 1);
                  ini_set('display_startup_errors', 1);
                  error_reporting(E_ALL);
  
  
          $lista = [];
          $array_idfacturas = [];
          $idempresa = $this->getidempresa($empresa);
      
          // $array_cajaBancos = explode(",", $cadena_cajaBancos);
          $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
          $caja_bancos = implode(",", $array_cajaBancos);
          // Preparar la consulta
  
          if($cobrado == 1){ //POR PAGAR
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN('$caja_bancos') AND idfactura !='0'"); //POR COBRAR
  
            while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
                $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == 0 && $factu['pagado'] == 1 ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{
    
                }
            }
    
            $factura_comas = implode(",", $array_idfacturas);

              if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                   $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
              }else{
                  $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
                  UNION
                  SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
              }
  
          }elseif($cobrado == 2){ // PAGADO

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN('$caja_bancos') AND idfactura !='0'"); //POR COBRAR
  
            while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
                $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == 0 && $factu['pagado'] == 2 ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{
    
                }
            }
    
            $factura_comas = implode(",", $array_idfacturas);
  
              if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                  $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
             }else{
                 $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
                 UNION
                 SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
             }
          }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN('$caja_bancos') AND idfactura !='0'"); //POR COBRAR
  
            while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
                $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == 0 && $factu['pagado'] != 0 ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{
    
                }
            }
    
            $factura_comas = implode(",", $array_idfacturas);

              if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                  $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
             }else{
                 $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
                 UNION
                 SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
             }
          }
      
  
          while ($qwe = $this->dbc->fetch($getPedido)) {
              $res = array("id" => $qwe[0], 
              "fecha" => $qwe[1],
              "nfactura" => $qwe[2],
              "nautorizacion" => $qwe[3],
              "codigocontrol" => $qwe[4],
              "montofactura" => $qwe[5],
              "tasacero" => $qwe[6],
              "export" => $qwe[7],
              "npoliza" => $qwe[8],
              "ice" => $qwe[9],
              "descuentobonificacion" => $qwe[10], "clasefactura" => $qwe[11], "cobrado" => $qwe[12],
              "pagado" => $qwe[13], "espesificacion" => $qwe[14], "estado" => $qwe[15],
              "tipocompra" => $qwe[16], "idtransaccion" => $qwe[17], "idproveedor" => $qwe[18],
              "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],
              "por_concepto_de" => $qwe['por_concepto_de']);
  
              array_push($lista, $res);
          }
      
          echo json_encode($lista, JSON_NUMERIC_CHECK);
          // echo json_encode(array($caja_bancos,$factura_comas));
      }
      
      public function listar_documentos_pagos_sin_transaccion($cobrado,$cadena_cajaBancos,$empresa) {
        // $idempresa = $this->getidempresa($empresa);
                  // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));
                  
                  ini_set('display_errors', 1);
                  ini_set('display_startup_errors', 1);
                  error_reporting(E_ALL);
  
  
          $lista = [];
          $array_id_otrasCuentas = [];
          $idempresa = $this->getidempresa($empresa);
      
          // $array_cajaBancos = explode(",", $cadena_cajaBancos);
          $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
          $caja_bancos = implode(",", $array_cajaBancos);
          // Preparar la consulta
  
          if($cobrado == 1){ //POR PAGAR
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
              $otrasCuentas_aux = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$otrasCuentas_cajas[idotras_cuentas]'"); //POR COBRAR
              $oc = $otrasCuentas_aux->fetch_assoc();
              if($oc['transacciones_idtransacciones'] == 0 && $oc['pagado'] == 1 ){
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
              }else{
  
              }
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                   $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
              }else{
                  $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas IN ($otras_cuentas_comas)
                  UNION
                  SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
              }
  
          }elseif($cobrado == 2){ // PAGADO
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
              $otrasCuentas_aux = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$otrasCuentas_cajas[idotras_cuentas]'"); //POR COBRAR
              $oc = $otrasCuentas_aux->fetch_assoc();
              if($oc['transacciones_idtransacciones'] == 0 && $oc['pagado'] == 2 ){
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
              }else{
  
              }
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);
              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                  $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
             }else{
                 $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas IN ($otras_cuentas_comas)
                 UNION
                 SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
             }
          }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
              $otrasCuentas_aux = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$otrasCuentas_cajas[idotras_cuentas]'"); //POR COBRAR
              $oc = $otrasCuentas_aux->fetch_assoc();
              if($oc['transacciones_idtransacciones'] == 0 && $oc['pagado'] != 0 ){
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
              }else{
  
              }
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                  $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
             }else{
                 $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas IN ($otras_cuentas_comas)
                 UNION
                 SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
             }
          }
      
  
          while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                // "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                // "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                // "pagado" => $asd[0],
                // "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
  
              array_push($lista, $res);
          }
      
          echo json_encode($lista, JSON_NUMERIC_CHECK);
          // echo json_encode(array($caja_bancos,$factura_comas));
      }

      public function listar_documentos_cobros_sin_transaccion($cobrado,$cadena_cajaBancos,$empresa) {
        // $idempresa = $this->getidempresa($empresa);
                  // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));
                  
                  ini_set('display_errors', 1);
                  ini_set('display_startup_errors', 1);
                  error_reporting(E_ALL);
  
  
          $lista = [];
          $array_id_otrasCuentas = [];
          $idempresa = $this->getidempresa($empresa);
      
          // $array_cajaBancos = explode(",", $cadena_cajaBancos);
          $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
          $caja_bancos = implode(",", $array_cajaBancos);
          // Preparar la consulta
  
          if($cobrado == 1){ //POR PAGAR
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
              $otrasCuentas_aux = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$otrasCuentas_cajas[idotras_cuentas]'"); //POR COBRAR
              $oc = $otrasCuentas_aux->fetch_assoc();
              if($oc['transacciones_idtransacciones'] == 0 && $oc['cobrado'] == 1 ){
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
              }else{
  
              }
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                   $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND cobrado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
              }else{
                  $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas IN ($otras_cuentas_comas)
                  UNION
                  SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND cobrado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
              }
  
          }elseif($cobrado == 2){ // PAGADO
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
              $otrasCuentas_aux = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$otrasCuentas_cajas[idotras_cuentas]'"); //POR COBRAR
              $oc = $otrasCuentas_aux->fetch_assoc();
              if($oc['transacciones_idtransacciones'] == 0 && $oc['cobrado'] == 2 ){
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
              }else{
  
              }
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                  $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND cobrado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
             }else{
                 $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas IN ($otras_cuentas_comas)
                 UNION
                 SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND cobrado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
             }
          }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
              $otrasCuentas_aux = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas = '$otrasCuentas_cajas[idotras_cuentas]'"); //POR COBRAR
              $oc = $otrasCuentas_aux->fetch_assoc();
              if($oc['transacciones_idtransacciones'] == 0 && $oc['cobrado'] != 0 ){
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
              }else{
  
              }
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                  $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND cobrado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
             }else{
                 $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idotras_cuentas IN ($otras_cuentas_comas)
                 UNION
                 SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND cobrado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
  
             }
          }
      
  
          while ($qwe = $this->dbc->fetch($getPedido)) {
            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "lugar" => $qwe['lugar'],
                "id_cliente_proveedor" => $qwe['id_cliente_proveedor'],
                // "nombrep" => $pro['nombre'],
                "nro_tributario" => $qwe['nro_tributario'],
                "contacto" => $qwe['contacto'],
                "nro_doc_identidad" => $qwe['nro_doc_identidad'],
                "idtipo" => $qwe['idtipo'],
                "concepto" => $qwe['concepto'],
                // "nombre_tipo" => $resultado2['nombre'],
                "condiciones" => $qwe['condiciones'],
                "observaciones" => $qwe['observaciones'],
                "precio" => $qwe['precio'],
                // "pagado" => $asd[0],
                // "saldo" => $saldo,
                "forma_pago" => $qwe['forma_pago'],
                "archivo" => $qwe['archivo']
            );
  
              array_push($lista, $res);
          }
      
          echo json_encode($lista, JSON_NUMERIC_CHECK);
          // echo json_encode(array($caja_bancos,$factura_comas));
      }

    public function busqueda_facturas_contabilidad($nfactura,$nit,$cobro_pago,$id_cliente_proveedor,$fecha,$monto,$empresa) {
        ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
  
        $lista = [];
          $idempresa = $this->getidempresa($empresa);
//----------------------------------------------------------------------------------------------------------------
        $where = ["idorganizacion = '$idempresa'"];

        if ($nfactura != '-1') {
            $where[] = "nfactura = '$nfactura'";
        }
        if ($monto != '-1') {
            $where[] = "montofactura = '$monto'";
        }
        if ($fecha != '-1') {
            $where[] = "fecha = '$fecha'";
        }
        if ($cobro_pago == '1') {
            $where[] = "cobrado != '0'";

        }elseif($cobro_pago == '2'){
            $where[] = "pagado != '0'";
        }
        if($id_cliente_proveedor != '-1'){
            $where[] = "proveedorcliente_idproveedorcliente = '$id_cliente_proveedor'";
        }
        if($nit != '-1'){

            $arr_client = [];
            $arr_prov = [];
        
            //----------------------------------------------------------------------------
     
            if ($cobro_pago == '1') {
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE nit= '$nit'");
                if($cliente->num_rows > 0){
                    while ($cli = $this->dbcm->fetch($cliente)) {
                        array_push($arr_client,$cli['id_cliente']);
                    }
                    $client_comas = implode(",", $arr_client);

                    $where[] = "proveedorcliente_idproveedorcliente IN($client_comas)";
                }else{
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "proveedorcliente_idproveedorcliente = '-1'";

                }
                
            }elseif($cobro_pago == '2'){
                
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE nit= '$nit'");
                if($proveedor->num_rows > 0){
                    while ($prov = $this->dbcm->fetch($proveedor)) {
                        array_push($arr_prov,$prov['id_proveedor']);
                    }
                    $prov_comas = implode(",", $arr_prov);
                    $where[] = "proveedorcliente_idproveedorcliente IN($prov_comas)";

                }else{
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "proveedorcliente_idproveedorcliente = '-1'";
                }
            }else{
                $cliente = $this->dbcm->query("SELECT * FROM cliente WHERE nit= '$nit'");
                if($cliente->num_rows > 0){
                    while ($cli = $this->dbcm->fetch($cliente)) {
                        array_push($arr_client,$cli['id_cliente']);
                    }
                    $client_comas = implode(",", $arr_client);
                }else{
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                }
                //----------------------------------------------------------------------------------

                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE nit= '$nit'");
                if($proveedor->num_rows > 0){
                    while ($prov = $this->dbcm->fetch($proveedor)) {
                        array_push($arr_prov,$prov['id_proveedor']);
                    }
                    $prov_comas = implode(",", $arr_prov);
                }else{
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                }
                if($proveedor->num_rows > 0 && $cliente->num_rows > 0){
                    $client_proveedor = $client_comas . "," . $prov_comas;
                    $where[] = "proveedorcliente_idproveedorcliente IN($client_proveedor)";
                }elseif($proveedor->num_rows > 0){
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "proveedorcliente_idproveedorcliente IN($prov_comas)";
                }elseif($cliente->num_rows > 0){
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "proveedorcliente_idproveedorcliente IN($client_comas)";
                }else{
                    $where[] = "proveedorcliente_idproveedorcliente = '-1'";
                   
                }

            }
    
        }

        $facturas = $this->dbc->query("SELECT * FROM factura WHERE " . implode(" AND ", $where));
        //     $facturas = $this->dbc->query("SELECT * FROM factura WHERE  idorganizacion= '$idempresa'"); //TODAS LAS FACTURAS

        while ($qwe = $this->dbc->fetch($facturas)) {
            $res = array(
                "idfactura" => $qwe['idfactura'],
                "fecha" => $qwe['fecha'],
                "nfactura" => $qwe['nfactura'],
                "montofactura" => $qwe['montofactura'],
                "estado" => $qwe['estado']
                // "pagado" => $asd[0],
                // "saldo" => $saldo,
                // "forma_pago" => $qwe['forma_pago'],
                // "archivo" => $qwe['archivo']
            );
  
              array_push($lista, $res);
          }
          echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    } 

}