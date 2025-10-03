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

        $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN($caja_bancos) AND idfactura !='0'"); //POR COBRAR

        while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
            $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
            $factu = $factura_aux->fetch_assoc();
            if($factu['transacciones_idtransacciones'] == '0' && $factu['cobrado'] == '1' ){
                array_push($array_idfacturas, $factura_cajas['idfactura']);
            }else{

            }
        }

        $factura_comas = implode(",", $array_idfacturas);

            if($factura_comas == ""){//EL ARRAY ESTABA VACIO, NO EXISTE NINGUNA CAJA_BANCO PARA ESTA FACTURA
                //NO DEBERIA LISTARME NADA AQUI, COMENTAR EL CODIGO
                //NO HAY CAJA_BANCOS
                // $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                $getPedido = [];
            }else{
                $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas) 
                -- UNION 
                -- SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 1 AND transacciones_idtransacciones = 0;
                "); //POR COBRAR
            }

        }elseif($cobrado == 2){ // COBRADO

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN($caja_bancos) AND idfactura !='0'"); //POR COBRAR

        while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
            $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
            $factu = $factura_aux->fetch_assoc();
            if($factu['transacciones_idtransacciones'] == '0' && $factu['cobrado'] == '2' ){
                array_push($array_idfacturas, $factura_cajas['idfactura']);
            }else{
                
            }
        }

        $factura_comas = implode(",", $array_idfacturas);

            if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                // $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                $getPedido = [];
           }else{
               $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
            --    UNION
            --    SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado = 2 AND transacciones_idtransacciones = 0;
               "); //POR COBRAR

           }
        }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN($caja_bancos) AND idfactura !='0'"); //POR COBRAR

        while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
            $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
            if($factura_aux->num_rows > 0){
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == '0' && $factu['cobrado'] != '0' ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{

                }
            }else{
                //SALTAR
            }
            
        }

        $factura_comas = implode(",", $array_idfacturas);

            if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                // $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado != 0 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                $getPedido = [];
           }else{
               $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
            --    UNION
            --    SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND cobrado != 0 AND transacciones_idtransacciones = 0;
               "); //POR COBRAR

           }
        }
    
        if($getPedido->num_rows > 0){
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
        }else{

        }
    
        echo json_encode($lista, JSON_NUMERIC_CHECK);
        // echo json_encode(array($caja_bancos,$factura_comas));
    }

    public function listar_facturas_pagos_sin_transaccion($cobrado,$cadena_cajaBancos,$empresa) {
        // $idempresa = $this->getidempresa($empresa);
                  // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));
                  
                //   ini_set('display_errors', 1);
                //   ini_set('display_startup_errors', 1);
                //   error_reporting(E_ALL);
  
  
          $lista = [];
          $array_idfacturas = [];
          $idempresa = $this->getidempresa($empresa);
      
          // $array_cajaBancos = explode(",", $cadena_cajaBancos);
          $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
          $caja_bancos = implode(",", $array_cajaBancos);
          // Preparar la consulta
        //   echo json_encode(array($caja_bancos,$cobrado,$empresa,$cadena_cajaBancos));

          if($cobrado == 1){ //POR PAGAR
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN($caja_bancos) AND idfactura !='0'"); //POR COBRAR
  
            while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
                $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == '0' && $factu['pagado'] == '1' ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{
    
                }
            }
    
            $factura_comas = implode(",", $array_idfacturas);

              if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                //    $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = '1' AND transacciones_idtransacciones = '0';"); //POR COBRAR
                $getPedido = [];
            }else{
                  $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
                --   UNION
                --   SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = '1' AND transacciones_idtransacciones = '0';
                  "); //POR COBRAR
              }
  
          }elseif($cobrado == 2){ // PAGADO

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN($caja_bancos) AND idfactura !='0'"); //PAGADO
  
            while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
                $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //PAGADO
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == '0' && $factu['pagado'] == '2' ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{
    
                }
            }
    
            $factura_comas = implode(",", $array_idfacturas);
  
              if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                //   $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = '2' AND transacciones_idtransacciones = '0';"); //POR COBRAR
                $getPedido = [];
                }else{
                 $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
                --  UNION
                --  SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado = '2' AND transacciones_idtransacciones = '0';
                 "); //PAGADO
  
             }
          }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN($caja_bancos) AND idfactura !='0'"); //POR COBRAR
  
            while ($factura_cajas = $this->dbc->fetch($det_caja_banc)) {
                $factura_aux = $this->dbc->query("SELECT * FROM factura WHERE idfactura = '$factura_cajas[idfactura]'"); //POR COBRAR
                $factu = $factura_aux->fetch_assoc();
                if($factu['transacciones_idtransacciones'] == '0' && $factu['pagado'] != '0' ){
                    array_push($array_idfacturas, $factura_cajas['idfactura']);
                }else{
    
                }
            }
    
            $factura_comas = implode(",", $array_idfacturas);

              if($factura_comas == ""){//EL ARRAY ESTABA VACIO
                //   $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado != '0' AND transacciones_idtransacciones = '0';"); //POR COBRAR
                $getPedido = [];
                }else{
                 $getPedido = $this->dbc->query("SELECT * FROM factura WHERE idfactura IN ($factura_comas)
                --  UNION
                --  SELECT * FROM factura WHERE idorganizacion = '$idempresa' AND pagado != '0' AND transacciones_idtransacciones = '0';
                 "); //POR COBRAR
  
             }
          }
      
          if($getPedido->num_rows > 0){
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
              "empresa" => $qwe[19], "cuenta" => $qwe[20], "sucursal" => $qwe[21],"holaaaaa" => $factura_comas,
              "por_concepto_de" => $qwe['por_concepto_de']);
  
              array_push($lista, $res);
          }
          }else{

          }
      
          echo json_encode($lista, JSON_NUMERIC_CHECK);

          // echo json_encode(array($caja_bancos,$factura_comas));
      }
      
      public function listar_documentos_pagos_sin_transaccion($pagado,$cadena_cajaBancos,$empresa) {
        // $idempresa = $this->getidempresa($empresa);
                  // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));
                  
                //   ini_set('display_errors', 1);
                //   ini_set('display_startup_errors', 1);
                //   error_reporting(E_ALL);
  
  
          $lista = [];
          $array_id_otrasCuentas = [];
          $ids_recibos =[];
          $idempresa = $this->getidempresa($empresa);
      
          // $array_cajaBancos = explode(",", $cadena_cajaBancos);
          $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
          $caja_bancos = implode(",", $array_cajaBancos);
          // Preparar la consulta
  
          if($pagado == '1'){ //POR PAGAR
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN($caja_bancos) AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                //    $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                   $getPedido = [];
              }else{
                  $recibo_lista = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas in($otras_cuentas_comas)"); //POR COBRAR
                  while ($rec = $this->dbc->fetch($recibo_lista)) {
                       if($rec['transaccion'] == 0 && $rec['pagado'] == 1){
                         array_push($ids_recibos, $rec['idrecibo']);
                       }else{
                        
                       }

                  }
                  $id_recibos_comas = implode(",", $ids_recibos);
                   if($id_recibos_comas == ""){//EL ARRAY ESTABA VACIO
                        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                        $getPedido = [];
                    }else{
                        $getPedido = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo IN ($id_recibos_comas)"); //POR COBRAR
                    }

              }
  
          }elseif($pagado == '2'){ // PAGADO
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN($caja_bancos) AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                //    $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                   $getPedido = [];
              }else{
                  $recibo_lista = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas in($otras_cuentas_comas)"); //POR COBRAR
                  while ($rec = $this->dbc->fetch($recibo_lista)) {
                       if($rec['transaccion'] == 0 && $rec['pagado'] == 2){
                         array_push($ids_recibos, $rec['idrecibo']);
                       }else{
                        
                       }

                  }
                  $id_recibos_comas = implode(",", $ids_recibos);
                   if($id_recibos_comas == ""){//EL ARRAY ESTABA VACIO
                        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                        $getPedido = [];
                    }else{
                        $getPedido = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo IN ($id_recibos_comas)"); //POR COBRAR
                    }

              }
          }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_pagar WHERE idcaja_bancos IN($caja_bancos) AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                //    $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                   $getPedido = [];
              }else{
                  $recibo_lista = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas in($otras_cuentas_comas)"); //POR COBRAR
                  while ($rec = $this->dbc->fetch($recibo_lista)) {
                       if($rec['transaccion'] == 0 && $rec['pagado'] != 0){
                         array_push($ids_recibos, $rec['idrecibo']);
                       }else{
                        
                       }

                  }
                  $id_recibos_comas = implode(",", $ids_recibos);
                   if($id_recibos_comas == ""){//EL ARRAY ESTABA VACIO
                        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                        $getPedido = [];
                    }else{
                        $getPedido = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo IN ($id_recibos_comas)"); //POR COBRAR
                    }

              }
          }
      
          if($getPedido->num_rows > 0){
            while ($qwe = $this->dbc->fetch($getPedido)) {
            
            $get_prov = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = '$qwe[cliente_proveedor]'"); 
            $proveedor = $get_prov->fetch_assoc();

            $res = array(
                "idrecibo" => $qwe['idrecibo'],
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_recibo" => $qwe['nro_recibo'],
                "lugar" => $qwe['lugar'],
                "persona" => $qwe['persona'],
                "ci" => $qwe['ci'],
                "cliente_proveedor" => $qwe['cliente_proveedor'],
                "nombre_proveedor" => $proveedor['nombre'],
                "concepto" => $qwe['concepto'],
                "monto" => $qwe['monto'],
                "archivo" => $qwe['archivo']
            );
  
              array_push($lista, $res);
          }
          }else{

          }
      
          echo json_encode($lista, JSON_NUMERIC_CHECK);
          // echo json_encode(array($caja_bancos,$factura_comas));
      }

      public function listar_documentos_cobros_sin_transaccion($cobrado,$cadena_cajaBancos,$empresa) {
        // $idempresa = $this->getidempresa($empresa);
                  // echo json_encode(array($cobrado,$idcaja_bancos,$empresa));
                  
               //   ini_set('display_errors', 1);
                //   ini_set('display_startup_errors', 1);
                //   error_reporting(E_ALL);
  
  
          $lista = [];
          $array_id_otrasCuentas = [];
          $ids_recibos =[];
          $idempresa = $this->getidempresa($empresa);
      
          // $array_cajaBancos = explode(",", $cadena_cajaBancos);
          $array_cajaBancos = array_map('intval', explode(",", $cadena_cajaBancos));
          $caja_bancos = implode(",", $array_cajaBancos);
          // Preparar la consulta
  
          if($cobrado == 1){ //POR PAGAR
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                //    $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                   $getPedido = [];
              }else{
                  $recibo_lista = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas in($otras_cuentas_comas)"); //POR COBRAR
                  while ($rec = $this->dbc->fetch($recibo_lista)) {
                       if($rec['transaccion'] == '0' && $rec['cobrado'] == '1'){
                         array_push($ids_recibos, $rec['idrecibo']);
                       }else{
                        
                       }

                  }
                  $id_recibos_comas = implode(",", $ids_recibos);
                   if($id_recibos_comas == ""){//EL ARRAY ESTABA VACIO
                        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                        $getPedido = [];
                    }else{
                        $getPedido = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo IN ($id_recibos_comas)"); //POR COBRAR
                    }

              }
  
          }elseif($cobrado == 2){ // PAGADO
  
            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                //    $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                   $getPedido = [];
              }else{
                  $recibo_lista = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas in($otras_cuentas_comas)"); //POR COBRAR
                  while ($rec = $this->dbc->fetch($recibo_lista)) {
                       if($rec['transaccion'] == '0' && $rec['cobrado'] == '2'){
                         array_push($ids_recibos, $rec['idrecibo']);
                       }else{
                        
                       }

                  }
                  $id_recibos_comas = implode(",", $ids_recibos);
                   if($id_recibos_comas == ""){//EL ARRAY ESTABA VACIO
                        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                        $getPedido = [];
                    }else{
                        $getPedido = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo IN ($id_recibos_comas)"); //POR COBRAR
                    }

              }
          }else{ //TODOS

            $det_caja_banc = $this->dbc->query("SELECT * FROM detalle_caja_bancos_cobrar WHERE idcaja_bancos IN('$caja_bancos') AND idotras_cuentas !='0'"); //POR COBRAR
  
          while ($otrasCuentas_cajas = $this->dbc->fetch($det_caja_banc)) {
                  array_push($array_id_otrasCuentas, $otrasCuentas_cajas['idotras_cuentas']);
          }
  
          $otras_cuentas_comas = implode(",", $array_id_otrasCuentas);

              if($otras_cuentas_comas == ""){//EL ARRAY ESTABA VACIO
                //    $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 1 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                   $getPedido = [];
              }else{
                  $recibo_lista = $this->dbc->query("SELECT * FROM recibo WHERE idotras_cuentas in($otras_cuentas_comas)"); //POR COBRAR
                  while ($rec = $this->dbc->fetch($recibo_lista)) {
                       if($rec['transaccion'] == '0' && $rec['cobrado'] != '0'){
                         array_push($ids_recibos, $rec['idrecibo']);
                       }else{
                        
                       }

                  }
                  $id_recibos_comas = implode(",", $ids_recibos);
                   if($id_recibos_comas == ""){//EL ARRAY ESTABA VACIO
                        // $getPedido = $this->dbc->query("SELECT * FROM otras_cuentas WHERE idempresa = '$idempresa' AND pagado = 2 AND transacciones_idtransacciones = 0;"); //POR COBRAR
                        $getPedido = [];
                    }else{
                        $getPedido = $this->dbc->query("SELECT * FROM recibo WHERE idrecibo IN ($id_recibos_comas)"); //POR COBRAR
                    }

              }
          }
      
          if($getPedido->num_rows > 0){
            while ($qwe = $this->dbc->fetch($getPedido)) {
            
            $get_cl = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente = '$qwe[cliente_proveedor]'"); 
            $cliente = $get_cl->fetch_assoc();

            $res = array(
                "idrecibo" => $qwe['idrecibo'],
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_recibo" => $qwe['nro_recibo'],
                "lugar" => $qwe['lugar'],
                "persona" => $qwe['persona'],
                "ci" => $qwe['ci'],
                "cliente_proveedor" => $qwe['cliente_proveedor'],
                "nombre_cliente" => $cliente['nombre'],
                "concepto" => $qwe['concepto'],
                "monto" => $qwe['monto'],
                "archivo" => $qwe['archivo']
            );
  
              array_push($lista, $res);
          }
          }else{

          }
      
          echo json_encode($lista, JSON_NUMERIC_CHECK);
          // echo json_encode(array($caja_bancos,$factura_comas));
      }

    public function busqueda_facturas_contabilidad($nfactura,$nit,$cobro_pago,$id_cliente_proveedor,$fecha,$monto,$idgestion,$empresa) {
        // ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
  
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
        if($idgestion == '-1'){ //LISTARA DE TODAS LAS GESTIONES
            while ($qwe = $this->dbc->fetch($facturas)) {

            $transa = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
            $transaccion = $transa->fetch_assoc();
                if($qwe['clasefactura'] == '1'){ //PAGADO --PROVEEDOR
                    $proveedor2 = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = '$qwe[proveedorcliente_idproveedorcliente]'");
                    $prov_client_2 = $proveedor2->fetch_assoc();
                }else{//COBRADO -- CLIENTE
                    $cliente2 = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente = '$qwe[proveedorcliente_idproveedorcliente]'");
                    $prov_client_2 = $cliente2->fetch_assoc();
                }
                 $res = array(
                "idfactura" => $qwe['idfactura'],
                "fecha" => $qwe['fecha'],
                "nfactura" => $qwe['nfactura'],
                "montofactura" => $qwe['montofactura'],
                "estado" => $qwe['estado'],
                "razon_social" => $prov_client_2['nombre'],
                "nro_transaccion" => $transaccion['codigotransaccion']
            );
            array_push($lista, $res);
          }
        }else{ //LISTARA SOLO DE LA GESTION QUE PUSISTE
            while ($qwe = $this->dbc->fetch($facturas)) {
            $transa = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
            $transaccion = $transa->fetch_assoc();

                if($qwe['clasefactura'] == '1'){ //PAGADO --PROVEEDOR
                    $proveedor2 = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = '$qwe[proveedorcliente_idproveedorcliente]'");
                    $prov_client_2 = $proveedor2->fetch_assoc();
                }else{//COBRADO -- CLIENTE
                    $cliente2 = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente = '$qwe[proveedorcliente_idproveedorcliente]'");
                    $prov_client_2 = $cliente2->fetch_assoc();
                }

            if($transaccion['idgestion'] == $idgestion){
                 $res = array(
                "idfactura" => $qwe['idfactura'],
                "fecha" => $qwe['fecha'],
                "nfactura" => $qwe['nfactura'],
                "montofactura" => $qwe['montofactura'],
                "estado" => $qwe['estado'],
                "razon_social" => $prov_client_2['nombre'],
                "nro_transaccion" => $transaccion['codigotransaccion']
            );
  
              array_push($lista, $res);
            }else{ 
                // no se mostrara nada solo saltara
            }
           
          }
        }
          echo json_encode($lista, JSON_NUMERIC_CHECK);
    }

       public function busqueda_facturas_comercial($nfactura,$nit,$id_cliente_proveedor,$fecha,$monto,$empresa) {
        ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
  
        $lista = [];
          $idempresa = $this->getidempresa($empresa);
//----------------------------------------------------------------------------------------------------------------
        $where = ["c.idempresa = '$idempresa'"];

        if ($nfactura != '-1') {
            $where[] = "nfactura = '$nfactura'";
        }
        if ($monto != '-1') {
            $where[] = "monto_total = '$monto'";
        }
        if ($fecha != '-1') {
            $where[] = "fecha_venta = '$fecha'";
        }
        // if ($cobro_pago == '1') { // por el momento solo funcionara esto en comercial
        //     $where[] = "cobrado != '0'";

        // }elseif($cobro_pago == '2'){
        //     $where[] = "pagado != '0'";
        // }
        if($id_cliente_proveedor != '-1'){
            $where[] = "cliente_id_cliente1 = '$id_cliente_proveedor'";
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

        $facturas = $this->dbcm->query("SELECT * FROM venta v
        INNER JOIN cliente_id_cliente1 c ON c.id_cliente = v.cliente_id_cliente1
        WHERE " . implode(" AND ", $where));
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

    public function busqueda_documentos_contabilidad($nro_otras_cuentas,$nit,$cobro_pago,$id_cliente_proveedor,$fecha,$precio,$idgestion,$empresa) {
        // ini_set('display_errors', 1); //,$nit,$cobro_pago,$cliente_proveedor,
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
  
        $lista = [];
          $idempresa = $this->getidempresa($empresa);
//----------------------------------------------------------------------------------------------------------------
        $where = ["idempresa = '$idempresa'"];

        if ($nro_otras_cuentas != '-1') {
            $where[] = "nro_otras_cuentas = '$nro_otras_cuentas'";
        }
        if ($precio != '-1') {
            $where[] = "precio = '$precio'";
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
            $where[] = "id_cliente_proveedor = '$id_cliente_proveedor'";
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

                    $where[] = "id_cliente_proveedor IN($client_comas)";
                }else{
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "id_cliente_proveedor = '-1'";

                }
                
            }elseif($cobro_pago == '2'){
                
                $proveedor = $this->dbcm->query("SELECT * FROM proveedor WHERE nit= '$nit'");
                if($proveedor->num_rows > 0){
                    while ($prov = $this->dbcm->fetch($proveedor)) {
                        array_push($arr_prov,$prov['id_proveedor']);
                    }
                    $prov_comas = implode(",", $arr_prov);
                    $where[] = "id_cliente_proveedor IN($prov_comas)";

                }else{
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "id_cliente_proveedor = '-1'";
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
                    $where[] = "id_cliente_proveedor IN($client_proveedor)";
                }elseif($proveedor->num_rows > 0){
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "id_cliente_proveedor IN($prov_comas)";
                }elseif($cliente->num_rows > 0){
                    //NO SE ENCONTRO NINGUN NIT CON EL QUE INGRESASTE
                    $where[] = "id_cliente_proveedor IN($client_comas)";
                }else{
                    $where[] = "id_cliente_proveedor = '-1'";
                   
                }

            }
    
        }

        $otras_cuentas = $this->dbc->query("SELECT * FROM otras_cuentas WHERE " . implode(" AND ", $where));
        //     $facturas = $this->dbc->query("SELECT * FROM factura WHERE  idorganizacion= '$idempresa'"); //TODAS LAS FACTURAS
        if($idgestion == '-1'){ // LISTARA DE TODAS LAS GESTIONES
            while ($qwe = $this->dbc->fetch($otras_cuentas)) {

            $transa = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
            $transaccion = $transa->fetch_assoc();

                if($qwe['clase_otras_cuentas'] == '1'){ //PAGADO --PROVEEDOR
                    $proveedor2 = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = '$qwe[id_cliente_proveedor]'");
                    $prov_client_2 = $proveedor2->fetch_assoc();
                }else{//COBRADO -- CLIENTE
                    $cliente2 = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente = '$qwe[id_cliente_proveedor]'");
                    $prov_client_2 = $cliente2->fetch_assoc();
                }

            $res = array(
                "idotras_cuentas" => $qwe['idotras_cuentas'],
                "fecha" => $qwe['fecha'],
                "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                "precio" => $qwe['precio'],
                "estado" => '1',
                "razon_social" => $prov_client_2['nombre'],
                "nro_transaccion" => $transaccion['codigotransaccion']
            );
  
              array_push($lista, $res);
          }
        }else{
            while ($qwe = $this->dbc->fetch($otras_cuentas)) {

            $transa = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
            $transaccion = $transa->fetch_assoc();

                if($qwe['clase_otras_cuentas'] == '1'){ //PAGADO --PROVEEDOR
                    $proveedor2 = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = '$qwe[id_cliente_proveedor]'");
                    $prov_client_2 = $proveedor2->fetch_assoc();
                }else{//COBRADO -- CLIENTE
                    $cliente2 = $this->dbcm->query("SELECT * FROM cliente WHERE id_cliente = '$qwe[id_cliente_proveedor]'");
                    $prov_client_2 = $cliente2->fetch_assoc();
                }

                if($transaccion['idgestion'] == $idgestion){ // SE LISTARA SOLO LOS DE UNA GESTION EN ESPECIFICO
                     $res = array(
                        "idotras_cuentas" => $qwe['idotras_cuentas'],
                        "fecha" => $qwe['fecha'],
                        "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
                        "precio" => $qwe['precio'],
                        "estado" => '1',
                        "razon_social" => $prov_client_2['nombre'],
                        "nro_transaccion" => $transaccion['codigotransaccion']
                    );
        
                    array_push($lista, $res);
                }else{//NO PASARA NADA

                }
          }
        }
        // while ($qwe = $this->dbc->fetch($otras_cuentas)) {

        // $transa = $this->dbc->query("SELECT * FROM transacciones WHERE idtransacciones = '$qwe[transacciones_idtransacciones]'");
        // $transaccion = $transa->fetch_assoc();

        //     $res = array(
        //         "idotras_cuentas" => $qwe['idotras_cuentas'],
        //         "fecha" => $qwe['fecha'],
        //         "nro_otras_cuentas" => $qwe['nro_otras_cuentas'],
        //         "precio" => $qwe['precio'],
        //         "estado" => '1',
        //         "nro_transaccion" => $transaccion['codigotransaccion']
        //     );
  
        //       array_push($lista, $res);
        //   }
          echo json_encode($lista, JSON_NUMERIC_CHECK);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    } 

}