<?php
require_once "../db/conexion.php";
require_once "funciones.php";
class Facturacion
{
    private $conexion;
    private $verificar;
    private $cm;
    private $endpoint;
    /*private $rh;
    private $ad;
    private $em;*/
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->cm = $this->conexion->cm;
        $this->endpoint = $this->conexion->endPoint;
    }

    public function listadoConfigParametricas($url, $token, $tipo, $imprimir)
    {
        $urls = array(
            'metodopago' => '/api/v1/parametricas/metodos-de-pago',
            'monedas' => '/api/v1/parametricas/monedas',
            'leyendas' => '/api/v1/parametricas/leyendas',
            'puntoventa' => '/api/v1/puntos-de-venta',
            'tipodocumento' => '/api/v1/parametricas/tipos-documento-de-identidad',
            'sucursales' => '/api/v1/sucursales',
            'tiposector' => '/api/v1/company/tipos-documento-sector',
            'tipopuntoventa' => '/api/v1/parametricas/tipo-punto-venta',
            'motivoanulacion' => '/api/v1/parametricas/motivos-de-anulacion',
            'productossin' => '/api/v1/parametricas/productos-sin',
            'unidadsin' => '/api/v1/parametricas/unidades'
        );

        $ch = curl_init($this->endpoint[$tipo]. $urls[$url]);
        $headers = array(
            'Authorization: Bearer ' . $token,
        );

        // Establecer opciones de la petición CURL
        curl_setopt_array($ch, array(
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
        ));

        // Realizar la petición GET
        $response = curl_exec($ch);

        // Verificar si hubo algún error en la petición
        if (curl_errno($ch)) {
            echo json_encode('Error en la petición: ' . curl_error($ch));
            return;
        }

        // Obtener el código de respuesta HTTP
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        // Cerrar la conexión CURL
        curl_close($ch);

        // Procesar la respuesta
        if ($httpCode == 200) {
            // Devolver la respuesta JSON
            if ($imprimir === 1) {
                echo json_encode(json_decode($response));
            } else {
                return json_decode($response);
            }
            
        } else {
            // La petición no fue exitosa, mostrar mensaje de error
            echo json_encode('Error en la petición: ' . $httpCode);
        }
    }

    function añadirPuntoVenta($data, $sucursal, $token, $tipo) {
        $url = $this->endpoint[$tipo].'/api/v1/sucursales/'.$sucursal.'/puntos-de-venta';
    
        // Configurar las opciones de la solicitud cURL
        $options = array(
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            )
        );
    
        // Inicializar cURL y aplicar las opciones
        $curl = curl_init();
        curl_setopt_array($curl, $options);
    
        // Realizar la solicitud y obtener la respuesta
        $response = curl_exec($curl);
    
        // Verificar si hubo algún error en la solicitud
        $error = curl_error($curl);
    
        // Cerrar la conexión cURL
        curl_close($curl);
    
        // Verificar si hubo un error
        if ($error) {
            return (array('error' => $error));
        } else {
            return json_decode($response);
        }
    }
    
    function anularPuntoVenta($puntoventa, $sucursal, $token, $tipo)
    {
        $url = $this->endpoint[$tipo].'/api/v1/sucursales/'.$sucursal.'/puntos-de-venta/'.$puntoventa;

        // Configurar las opciones de la solicitud
        $options = array(
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => 'DELETE', // Usar el método DELETE
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            )
        );

        // Inicializar cURL y aplicar las opciones
        $curl = curl_init();
        curl_setopt_array($curl, $options);

        // Realizar la solicitud y obtener la respuesta
        $response = curl_exec($curl);

        // Verificar si hubo algún error en la solicitud
        if (curl_errno($curl)) {
            $error = curl_error($curl);
            // Manejar el error de alguna manera
        }

        // Cerrar la conexión cURL
        curl_close($curl);

        // Hacer algo con la respuesta
        //echo $response;

        return json_decode($response);
    }

    function estadofactura($cuf, $token, $tipo, $imprimir){
        $url = $this->endpoint[$tipo]."/api/v1/facturas/".$cuf."/status";
        //$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAzMzUiLCJqdGkiOiJmYzFkMjZmYTljOGZkNmUxNmI4YjBiMDk5MDdiNGJmNWJmMWFlMGNjZGIwNzMwYjZmZTM4Y2YyNTA2ZTA0ZWMzOTc5MWYyMTIyNzgxNWEwYyIsImlhdCI6MTY4NzQ1OTkxOSwibmJmIjoxNjg3NDU5OTE5LCJleHAiOjE3MTkwODIzMTksInN1YiI6IiIsInNjb3BlcyI6W119.XtGten29n35cbNq-C3e2PekjIYykrBAgY9HZHH7GCtyw_8eUwXdAlx_PFa7aIuuBDMjBBjEMU7Wb7cfMAFiqKWNIOgJSe5-iliID6MceSN8HEJbO-Rj-34nDkBwtEgwwqf3EygZTiqQlXX2xOPsgbqXVo5wZVZV7xXV-zKMjBiATT5K0mZR_OX88HTu9TAMaiWBgJgmDm2a-NQEwQpoqBjgzftjE_QjsdpHXUHnuVk5lJLSQZdoaule-nb1mqWVyH7qCXGF25S0s0IB7v2EinzbgmvRiIjUeK1udUxyEn1G4RMcoJixmCzsgcpl1O67jXdpnzusxZOZGMiwT5Vf-SH61W-pfgV3y8wQ3n0f0HzrR43JMwDuQFhJhBcDg_R2tmW8oUUDNy7huSm2AjYkLyAJvw_IhL6QZNPIEMEPDXLi_Ttao9gtGT-0r52huQOEGuBGyVv230hqQrGDLgF_2LGzkaDofmPUWDIUZvBkHjWHPC98_4ksuBUviLvHAmVPWDevlf5IiwCb_ireMvLU09fdn9ke0A1pA7MkUDTMIHkqWjVqj1oaan6-rcuVnBC3EPLX-ahr9qkeIA0LnsP74QX2-ejT_ZGAEdhB1s8MjcJiUb1LX3Z97vsyS5_DirCQJ7d7oAq35EymnpEJgLheskcBsN2Ncnoj621mqslKWjcc';
        $ch = curl_init($url);
        $headers = array(
            'Authorization: Bearer ' . $token,
        );

        // Establecer opciones de la petición CURL
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Realizar la petición GET
        $response = curl_exec($ch);

        // Verificar si hubo algún error en la petición
        if (curl_errno($ch)) {
            echo json_encode('Error en la petición: ' . curl_error($ch));
        }

        // Obtener el código de respuesta HTTP
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        // Cerrar la conexión CURL
        curl_close($ch);

        // Procesar la respuesta
        if ($httpCode == 200) {
            // Devolver la respuesta JSON
            if ($imprimir === 1) {
                echo json_encode(json_decode($response));
            } else {
                return json_decode($response);
            }
        } else {
            // La petición no fue exitosa, mostrar mensaje de error
            echo json_encode(array("estado" => "error", "error" => $httpCode, "datos" => json_decode($response)));
        }
        //echo json_encode($url);
    }

    function validarNIT($nit,$token,$tipo){
        $url = $this->endpoint[$tipo]."/api/v1/sucursales/0/validate-nit/".$nit;
        //$token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAzMzUiLCJqdGkiOiJmYzFkMjZmYTljOGZkNmUxNmI4YjBiMDk5MDdiNGJmNWJmMWFlMGNjZGIwNzMwYjZmZTM4Y2YyNTA2ZTA0ZWMzOTc5MWYyMTIyNzgxNWEwYyIsImlhdCI6MTY4NzQ1OTkxOSwibmJmIjoxNjg3NDU5OTE5LCJleHAiOjE3MTkwODIzMTksInN1YiI6IiIsInNjb3BlcyI6W119.XtGten29n35cbNq-C3e2PekjIYykrBAgY9HZHH7GCtyw_8eUwXdAlx_PFa7aIuuBDMjBBjEMU7Wb7cfMAFiqKWNIOgJSe5-iliID6MceSN8HEJbO-Rj-34nDkBwtEgwwqf3EygZTiqQlXX2xOPsgbqXVo5wZVZV7xXV-zKMjBiATT5K0mZR_OX88HTu9TAMaiWBgJgmDm2a-NQEwQpoqBjgzftjE_QjsdpHXUHnuVk5lJLSQZdoaule-nb1mqWVyH7qCXGF25S0s0IB7v2EinzbgmvRiIjUeK1udUxyEn1G4RMcoJixmCzsgcpl1O67jXdpnzusxZOZGMiwT5Vf-SH61W-pfgV3y8wQ3n0f0HzrR43JMwDuQFhJhBcDg_R2tmW8oUUDNy7huSm2AjYkLyAJvw_IhL6QZNPIEMEPDXLi_Ttao9gtGT-0r52huQOEGuBGyVv230hqQrGDLgF_2LGzkaDofmPUWDIUZvBkHjWHPC98_4ksuBUviLvHAmVPWDevlf5IiwCb_ireMvLU09fdn9ke0A1pA7MkUDTMIHkqWjVqj1oaan6-rcuVnBC3EPLX-ahr9qkeIA0LnsP74QX2-ejT_ZGAEdhB1s8MjcJiUb1LX3Z97vsyS5_DirCQJ7d7oAq35EymnpEJgLheskcBsN2Ncnoj621mqslKWjcc';
        $ch = curl_init($url);
        $headers = array(
            'Authorization: Bearer ' . $token,
        );

        // Establecer opciones de la petición CURL
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Realizar la petición GET
        $response = curl_exec($ch);

        // Verificar si hubo algún error en la petición
        if (curl_errno($ch)) {
            echo json_encode('Error en la petición: ' . curl_error($ch));
        }

        // Obtener el código de respuesta HTTP
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        // Cerrar la conexión CURL
        curl_close($ch);

        // Procesar la respuesta
        if ($httpCode == 200) {
            // La petición fue exitosa, procesar la respuesta JSON, por ejemplo:
            $data = json_decode($response);
            // Generar un JSON con los resultados
            echo json_encode($data);
        } else {
            // La petición no fue exitosa, mostrar mensaje de error
            echo json_encode('Error en la petición: ' . $httpCode);
        }
        //echo json_encode($url);
    }

    function crearfactura($data, $tipo, $token, $tipof, $sucursal)
    {
        $urls = array(
            '1' => $this->endpoint[$tipof].'/api/v1/sucursales/'.$sucursal.'/facturas/compra-venta',
            '2' => $this->endpoint[$tipof].'/api/v1/sucursales/'.$sucursal.'/facturas/alquileres',
            '3' => $this->endpoint[$tipof].'/api/v1/sucursales/'.$sucursal.'/facturas/comercial-exportacion',
            '8' => $this->endpoint[$tipof].'/api/v1/sucursales/'.$sucursal.'/facturas/tasa-cero',
            '24' => $this->endpoint[$tipof].'/api/v1/sucursales/'.$sucursal.'/facturas/nota-debito-credito',
        );
        // Obtener el JSON enviado desde JavaScript a través del enlace GET
        //$jsonData = urldecode($objeto);

        // Decodificar la cadena JSON
        //$data = json_decode($jsonData, true);

        // Configurar las opciones de la solicitud
        $options = array(
            CURLOPT_URL => $urls[$tipo],
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token,
            )
        );

        // Inicializar cURL y aplicar las opciones
        $curl = curl_init();
        curl_setopt_array($curl, $options);

        // Realizar la solicitud y obtener la respuesta
        $response = curl_exec($curl);

        // Verificar si hubo algún error en la solicitud
        if (curl_errno($curl)) {
            $error = curl_error($curl);
            // Manejar el error de alguna manera
        }

        // Cerrar la conexión cURL
        curl_close($curl);

        // Hacer algo con la respuesta
        //echo $response;


        //echo json_encode(json_decode($response));
        return json_decode($response);
    }

    function anularFactura($cuf, $motivo, $token, $tipo)
    {
        $url = $this->endpoint[$tipo].'/api/v1/facturas/'. $cuf .'/anular';

        // Datos JSON para enviar en la solicitud DELETE
        $data = array(
            'codigoMotivoAnulacion' => $motivo // Agrega los datos necesarios
        );

        // Configurar las opciones de la solicitud
        $options = array(
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => 'DELETE', // Usar el método DELETE
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            ),
            CURLOPT_POSTFIELDS => json_encode($data) // Agregar el cuerpo de la solicitud
        );

        // Inicializar cURL y aplicar las opciones
        $curl = curl_init();
        curl_setopt_array($curl, $options);

        // Realizar la solicitud y obtener la respuesta
        $response = curl_exec($curl);

        // Verificar si hubo algún error en la solicitud
        if (curl_errno($curl)) {
            $error = curl_error($curl);
            // Manejar el error de alguna manera
        }

        // Cerrar la conexión cURL
        curl_close($curl);

        // Retornar la respuesta en lugar de imprimir
        return json_decode($response);
    }

    function registrarFacturas($acktikect, $codigoestado, $cuf, $tipoemision, $fechaemision, $nrofactura, $shortLink, $urlsin, $xmlurl, $idventa)
    {
        $registro = $this->cm->query("insert into ventas_facturadas(idventas_facturadas, ack_ticket, codigoEstado, cuf, emission_type_cede, fechaEmission, numeroFactura, shortLink, urlSin, xml_url, venta_id_venta)value(NULL,'$acktikect', '$codigoestado', '$cuf', '$tipoemision', '$fechaemision', '$nrofactura', '$shortLink', '$urlsin', '$xmlurl', '$idventa')");
        if ($registro === TRUE) {
            $res = array("estado" => "exito", "mensaje" => "Datos de la factura guardados con exito");
            return $res;
        } else {
            return array("estado" => "error", "message" => "No se pudo registrar"); // Retorna un array asociativo en caso de error
        }
        //echo json_encode($res);
    }
}


//86DCEAF5676FE1C8F207F23176B1BC4B1AA9830604E995006C3A1F74