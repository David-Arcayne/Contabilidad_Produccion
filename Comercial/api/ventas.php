<?php
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "logErrores.php";
class ventas
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $numceros;
    private $logger;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        //$this->ad = $this->conexion->ad;
        $this->em = $this->conexion->em;
        $this->logger = new LogErrores();
    }
    public function importar_excel_cliente($file, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        if (!$idempresa) {
            echo json_encode(["estado" => "error", "mensaje" => "ID de empresa inválido"]);
            return;
        }

        if (!file_exists($file)) {
            echo json_encode(["estado" => "error", "mensaje" => "El archivo no se encontró en la ruta: " . $file]);
            return;
        }

        $handle = fopen($file, "r"); // Abrir el archivo en modo lectura
        if ($handle === false) {
            echo json_encode(["estado" => "error", "mensaje" => "No se pudo abrir el archivo CSV"]);
            return;
        }

        $clientes = []; // Guardará los clientes
        $contador = 0;

        while (($data = fgetcsv($handle, 1000, ",")) !== false) {
            if ($contador == 0) { // Ignorar la primera fila (encabezados)
                $contador++;
                continue;
            }

            // Asignar datos (asegúrate de que coincidan con las columnas de tu CSV)
            $clientes[] = [
                "nombre" => $data[0], // Nombre del cliente
                "nombrecomercial" => $data[1], // Nombre comercial
                "canalventa" => $data[2], // Canal de venta
                "tipocliente" => $data[3], // Tipo de cliente
                "tipodocumento" => $data[4], // Tipo de documento
                "nrodocumento" => $data[5], // NIT o documento de identificación
                "detalle" => $data[6], // Detalle adicional
                "direccion" => $data[7], // Dirección
                "telefono" => $data[8], // Teléfono
                "movil" => $data[9], // Móvil
                "email" => $data[10], // Correo electrónico
                "web" => $data[11], // Página web
                "pais" => $data[12], // País
                "ciudad" => $data[13], // Ciudad
                "zona" => $data[14], // Zona
                "contacto" => $data[15], // Persona de contacto
            ];
            $contador++;
        }

        fclose($handle); // Cerrar archivo

        // Ahora recorremos los clientes y los registramos en la base de datos
        foreach ($clientes as $cliente) {
            $this->registrocliente(
                $cliente["nombre"],
                $cliente["nombrecomercial"],
                $cliente["canalventa"],
                $cliente["tipocliente"],
                $cliente["tipodocumento"],
                $cliente["nrodocumento"],
                $cliente["detalle"],
                $cliente["direccion"],
                $cliente["telefono"],
                $cliente["movil"],
                $cliente["email"],
                $cliente["web"],
                $cliente["pais"],
                $cliente["ciudad"],
                $cliente["zona"],
                $cliente["contacto"],
                $idmd5
            );
        }
        echo json_encode(["estado" => "exito", "mensaje" => "Clientes importados correctamente"]);
    }

    public function obtenerEmailCliente($id)
    {
        $consulta = $this->cm->query("SELECT email FROM cliente WHERE id_cliente = '$id'");
        $fila = $this->cm->fetch($consulta);

        if ($fila) {
            echo json_encode(["email" => $fila["email"]]);
        } else {
            echo json_encode(["error" => "Cliente no encontrado"]);
        }
    }
    


    public function listarCliente($idmd5)
    {
        try {
            $lista = [];
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            $clien = $this->cm->query("select c.id_cliente, c.nombre, c.nombrecomercial, tc.tipo, c.codigo, c.nit, c.detalle, c.direccion, c.telefono, c.mobil, c.email, c.web, c.pais, c.ciudad, c.zona, c.contacto, c.idempresa, c.tipodocumento, c.tipo as tipocod, c.canal as idcanal, ca.canal as canal, c.tipo as idtipo from cliente c left join tipocliente tc on c.tipo=tc.idtipocliente left join canalventa ca on c.canal=ca.idcanalventa
            where c.idempresa='$idempresa' order by c.id_cliente desc");
            $datosjson = $this->verificar->datosExtras();
            $datos = json_decode($datosjson, true);
            $tiposDocumentos = $datos['tiposDocumentos'];
            while ($qwe = $this->cm->fetch($clien)) {
                $res = array("id" => $qwe['id_cliente'], "nombre" => $qwe['nombre'], "nombrecomercial" => $qwe['nombrecomercial'], "tipo" => $qwe['tipo'], "codigo" => $qwe['codigo'], "nit" => $qwe['nit'], "detalle" => $qwe['detalle'], "direccion" => $qwe['direccion'], "telefono" => $qwe['telefono'], "mobil" => $qwe['mobil'], "email" => $qwe['email'], "web" => $qwe['web'], "pais" => $qwe['pais'], "ciudad" => $qwe['ciudad'], "zona" => $qwe['zona'], "contacto" => $qwe['contacto'], "idempresa" => $qwe['idempresa'], "tipodocumento" => $qwe['tipodocumento'], "textotipodocumento" => array_column($tiposDocumentos, 'descripcion', 'id')[$qwe['tipodocumento']] ?? '', "codigotipo" => $qwe['tipocod'], "idcanal" => $qwe['idcanal'], "canal" => $qwe['canal'], "idtipo" => $qwe['idtipo']);

                array_push($lista, $res);
            }
            echo json_encode($lista);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }
    public function registrocliente($name, $nombrecomercial, $canal, $tipo, $tipodocumento, $nit, $detalle, $direction, $phone, $mobil, $email, $web, $pais, $city, $zona, $contacto, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $defaul = "Central " . $name;
        $res = "";
        $verificarQuery = " SELECT COUNT(*) FROM cliente c
                            WHERE c.idempresa = ? AND c.nit = ?; ";

        $stmt = $this->cm->prepare($verificarQuery);
        if ($stmt === false) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            echo json_encode($res);
            return;
        }

        $stmt->bind_param("is", $idempresa , $nit);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Nit duplicado por favor, inténtalo de nuevo");
        }else{
            $inicial = strtoupper(substr(trim($name), 0, 1));
            $final = strtoupper(substr(trim($name), -1));

            $consulta = $this->cm->query("select count(c.id_cliente)+1 as numero from cliente c where c.idempresa = '$idempresa'");
            $numero = $this->cm->fetch($consulta);
            $codigo = $inicial . $final . "-" . $idempresa . str_pad($numero[0], $this->numceros, "0", STR_PAD_LEFT);

            $registro = $this->cm->query("insert into cliente (id_cliente, nombre, nombrecomercial, tipo, codigo, nit, detalle, direccion, telefono, mobil, email, web, pais, ciudad, zona, contacto, idempresa, tipodocumento, canal) values(null, '$name','$nombrecomercial','$tipo','$codigo','$nit','$detalle','$direction','$phone','$mobil','$email','$web','$pais','$city','$zona','$contacto','$idempresa','$tipodocumento','$canal')");
            if ($registro === TRUE) {
                $listasucursal = $this->cm->query("select id_cliente from cliente where codigo='$codigo' order by id_cliente desc limit 1");
                $qwe = $this->cm->fetch($listasucursal);
                $sucursal = $this->cm->query("insert into sucursal (id_sucursal, nombre, telefono, direccion, cliente_id_cliente) values(null,'$defaul','$mobil','$direction','$qwe[0]')");
                if ($sucursal === TRUE) {
                    $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
                }
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        }

        

        echo json_encode($res);
    }
    public function registroClienteMinimal_($name, $nombrecomercial, $canal, $tipo, $tipodocumento, $nit, $telefono, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $res = []; // Initialize response array
        $defaulSucursalName = "Central " . $name; // Default name for the central branch

        // --- 1. Validate NIT Duplication ---
        $verificarQuery = "SELECT COUNT(*) FROM cliente c WHERE c.idempresa = ? AND c.nit = ?;";
        $stmt = $this->cm->prepare($verificarQuery);

        if ($stmt === false) {
            $res = ["estado" => "error", "mensaje" => "Error al preparar la consulta de verificación de NIT."];
            echo json_encode($res);
            return;
        }

        $stmt->bind_param("is", $idempresa, $nit);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $res = ["estado" => "error", "mensaje" => "Error al registrar. El NIT proporcionado ya existe para esta empresa."];
            echo json_encode($res);
            return;
        }

        // --- 2. Generate Client Code ---
        $inicial = strtoupper(substr(trim($name), 0, 1));
        $final = strtoupper(substr(trim($name), -1));

        // Use prepared statement for counting to prevent SQL injection, though low risk here
        $consultaCountQuery = "SELECT COUNT(c.id_cliente) + 1 AS numero FROM cliente c WHERE c.idempresa = ?;";
        $stmtCount = $this->cm->prepare($consultaCountQuery);
        if ($stmtCount === false) {
            $res = ["estado" => "error", "mensaje" => "Error al preparar la consulta para el código de cliente."];
            echo json_encode($res);
            return;
        }
        $stmtCount->bind_param("i", $idempresa);
        $stmtCount->execute();
        $stmtCount->bind_result($numero);
        $stmtCount->fetch();
        $stmtCount->close();

        $codigo = $inicial . $final . "-" . $idempresa . str_pad($numero, $this->numceros, "0", STR_PAD_LEFT);

        // --- 3. Insert New Client ---
        // Default values for fields not provided in minimal registration
        $detalle = "";    // Empty string for optional detail
        $direction = "";  // Empty string for optional direction
        $mobil = $telefono; // Assuming 'mobil' can be the same as 'telefono'
        $email = "";      // Empty string for optional email
        $web = "";        // Empty string for optional web
        $pais = "";       // Empty string for optional country
        $city = "";       // Empty string for optional city
        $zona = "";       // Empty string for optional zone
        $contacto = $name; // Assuming contact name is the client name

        $insertClientQuery = "INSERT INTO cliente (id_cliente, nombre, nombrecomercial, tipo, codigo, nit, detalle, direccion, telefono, mobil, email, web, pais, ciudad, zona, contacto, idempresa, tipodocumento, canal) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmtClient = $this->cm->prepare($insertClientQuery);

        if ($stmtClient === false) {
            $res = ["estado" => "error", "mensaje" => "Error al preparar la inserción del cliente."];
            echo json_encode($res);
            return;
        }

        $stmtClient->bind_param("sssissssssssssssisi", 
            $name, $nombrecomercial, $tipo, $codigo, $nit, $detalle, $direction, $telefono, $mobil, $email, $web, $pais, $city, $zona, $contacto, $idempresa, $tipodocumento, $canal
        );

        if ($stmtClient->execute()) {
            $lastClientId = $stmtClient->insert_id; // Assuming this method exists in your DatabaseManager

            $stmtClient->close(); // Close statement before getting last ID

            // --- 4. Get Last Inserted Client ID ---
            // Use CM's last_insert_id if available, or query as you did
            if (!$lastClientId) {
                 // Fallback if last_insert_id() isn't reliable/available
                 $listasucursalQuery = "SELECT id_cliente FROM cliente WHERE codigo = ? AND idempresa = ? ORDER BY id_cliente DESC LIMIT 1";
                 $stmtLastId = $this->cm->prepare($listasucursalQuery);
                 if ($stmtLastId) {
                     $stmtLastId->bind_param("si", $codigo, $idempresa);
                     $stmtLastId->execute();
                     $stmtLastId->bind_result($lastClientId);
                     $stmtLastId->fetch();
                     $stmtLastId->close();
                 }
            }

            if ($lastClientId) {
                // --- 5. Insert Default Branch/Sucursal ---
                $insertSucursalQuery = "INSERT INTO sucursal (id_sucursal, nombre, telefono, direccion, cliente_id_cliente) VALUES (NULL, ?, ?, ?, ?)";
                $stmtSucursal = $this->cm->prepare($insertSucursalQuery);

                if ($stmtSucursal === false) {
                    // Log error, but still return success for client registration
                    error_log("Error preparing sucursal insert for client ID: " . $lastClientId);
                    $res = ["estado" => "exito", "mensaje" => "Cliente registrado, pero hubo un error al crear la sucursal por defecto."];
                } else {
                    $stmtSucursal->bind_param("sssi", $defaulSucursalName, $telefono, $direction, $lastClientId);
                    if ($stmtSucursal->execute()) {
                        $res = ["estado" => "exito", "mensaje" => "Cliente y sucursal por defecto registrados exitosamente."];
                    } else {
                        error_log("Error executing sucursal insert for client ID: " . $lastClientId . " - " . $stmtSucursal->error);
                        $res = ["estado" => "exito", "mensaje" => "Cliente registrado, pero hubo un error al crear la sucursal por defecto."];
                    }
                    $stmtSucursal->close();
                }
            } else {
                 $res = ["estado" => "error", "mensaje" => "Cliente registrado, pero no se pudo obtener el ID para la sucursal."];
            }

        } else {
            $res = ["estado" => "error", "mensaje" => "Error al registrar el cliente: " . $stmtClient->error];
        }

        echo json_encode($res);
    }
    public function registroClienteMinimal($name, $nombrecomercial, $canal, $tipo, $tipodocumento, $nit, $telefono, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $res = []; // Initialize response array
        $defaulSucursalName = "Central " . $name; // Default name for the central branch

        // --- 1. Validate NIT Duplication ---
        $verificarQuery = "SELECT COUNT(*) FROM cliente c WHERE c.idempresa = ? AND c.nit = ?;";
        $stmt = $this->cm->prepare($verificarQuery);

        if ($stmt === false) {
            $res = ["estado" => "error", "mensaje" => "Error al preparar la consulta de verificación de NIT."];
            echo json_encode($res);
            return;
        }

        $stmt->bind_param("is", $idempresa, $nit);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $res = ["estado" => "error", "mensaje" => "Error al registrar. El NIT proporcionado ya existe para esta empresa."];
            echo json_encode($res);
            return;
        }

        // --- 2. Generate Client Code ---
        $inicial = strtoupper(substr(trim($name), 0, 1));
        $final = strtoupper(substr(trim($name), -1));

        $consultaCountQuery = "SELECT COUNT(c.id_cliente) + 1 AS numero FROM cliente c WHERE c.idempresa = ?;";
        $stmtCount = $this->cm->prepare($consultaCountQuery);
        if ($stmtCount === false) {
            $res = ["estado" => "error", "mensaje" => "Error al preparar la consulta para el código de cliente."];
            echo json_encode($res);
            return;
        }
        $stmtCount->bind_param("i", $idempresa);
        $stmtCount->execute();
        $stmtCount->bind_result($numero);
        $stmtCount->fetch();
        $stmtCount->close();

        $codigo = $inicial . $final . "-" . $idempresa . str_pad($numero, $this->numceros, "0", STR_PAD_LEFT);

        // --- 3. Insert New Client ---
        // Default values for fields not provided in minimal registration
        $detalle = "";      // Empty string for optional detail
        $direction = "";    // Empty string for optional direction
        $mobil = $telefono; // Assuming 'mobil' can be the same as 'telefono'
        $email = "";        // Empty string for optional email
        $web = "";          // Empty string for optional web
        $pais = "";         // Empty string for optional country
        $city = "";         // Empty string for optional city
        $zona = "";         // Empty string for optional zone
        $contacto = $name;  // Assuming contact name is the client name

        // --- IMPORTANT: Convert 'tipo' and 'canal' strings to integers ---
        // You need to define these mappings based on your business logic or a lookup table
      

        
        // Basic validation for conversion
    
        // --- End of conversion ---


        $insertClientQuery = "INSERT INTO cliente (id_cliente, nombre, nombrecomercial, tipo, codigo, nit, detalle, direccion, telefono, mobil, email, web, pais, ciudad, zona, contacto, idempresa, tipodocumento, canal) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmtClient = $this->cm->prepare($insertClientQuery);

        if ($stmtClient === false) {
            $res = ["estado" => "error", "mensaje" => "Error al preparar la inserción del cliente."];
            echo json_encode($res);
            return;
        }

        // Line 245: Corrected bind_param type string and variables
        $stmtClient->bind_param("ssissssssssssssisi", 
            $name, $nombrecomercial, $tipo, $codigo, $nit, $detalle, $direction, 
            $telefono, $mobil, $email, $web, $pais, $city, $zona, $contacto, 
            $idempresa, $tipodocumento, $canal // Use the converted integer values here
        );

        if ($stmtClient->execute()) {
            $lastClientId = $stmtClient->insert_id;

            $stmtClient->close();

            if ($lastClientId) {
                // --- 5. Insert Default Branch/Sucursal ---
                $insertSucursalQuery = "INSERT INTO sucursal (id_sucursal, nombre, telefono, direccion, cliente_id_cliente) VALUES (NULL, ?, ?, ?, ?)";
                $stmtSucursal = $this->cm->prepare($insertSucursalQuery);

                if ($stmtSucursal === false) {
                    error_log("Error preparing sucursal insert for client ID: " . $lastClientId);
                    $res = ["estado" => "exito", "mensaje" => "Cliente registrado, pero hubo un error al crear la sucursal por defecto."];
                } else {
                    $stmtSucursal->bind_param("sssi", $defaulSucursalName, $telefono, $direction, $lastClientId);
                    if ($stmtSucursal->execute()) {
                        $res = ["estado" => "exito", "mensaje" => "Cliente y sucursal por defecto registrados exitosamente."];
                    } else {
                        error_log("Error executing sucursal insert for client ID: " . $lastClientId . " - " . $stmtSucursal->error);
                        $res = ["estado" => "exito", "mensaje" => "Cliente registrado, pero hubo un error al crear la sucursal por defecto."];
                    }
                    $stmtSucursal->close();
                }
            } else {
                $res = ["estado" => "error", "mensaje" => "Cliente registrado, pero no se pudo obtener el ID para la sucursal."];
            }

        } else {
            $res = ["estado" => "error", "mensaje" => "Error al registrar el cliente: " . $stmtClient->error];
        }

        echo json_encode($res);
    }
    public function eliminarcliente_($dato)
    {
        $res = "";
        $responsable = $this->cm->query("delete from cliente where id_cliente='$dato'");
        if ($responsable === TRUE) {
            $registro = $this->cm->query("delete from sucursal where cliente_id_cliente='$dato'");
            $res = array("estado" => "exito", "mensaje" => "Eliminacion exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }
    public function eliminarcliente($dato)
    {
        //mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $this->cm->begin_transaction();

        try {
            // Validar el dato
            if (!filter_var($dato, FILTER_VALIDATE_INT)) {
                throw new Exception("ID de almacen no válido");
            }


            // Verificar si el producto está relacionado en otras tablas
            $relacionadas = [
                'cotizacion' => 'cliente_id_cliente',
                'venta' => 'cliente_id_cliente1',
                'inv_externo' => 'cliente_id_cliente',
            ];
            $mensaje = [
                'cotizacion' => 'No se puede eliminar porque hay registros en Cotizaciones .',
                'venta' => 'No se puede eliminar porque hay registros en Ventas.',
                'inv_externo' => 'No se puede eliminar porque hay registros Inv Externo',
            ];

            foreach ($relacionadas as $tabla => $columna) {
                $query = "SELECT 1 FROM $tabla WHERE $columna = ?";
                $stmt = $this->cm->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $dato);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje[$tabla]);
                }
                $stmt->close();
            }

           

            // Eliminar el producto
            $query = "DELETE FROM cliente WHERE id_cliente = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el cliente");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();


            // Eliminar cliente de sucursal
            $query = "DELETE FROM sucursal WHERE cliente_id_cliente = ?";
            $stmt = $this->cm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el cliente");
            }
            $stmt->bind_param("i", $dato);
            $stmt->execute();
            $stmt->close();

            // Confirmar transacción
            $this->cm->commit();

            

            $res = ["estado" => "exito", "mensaje" => "Eliminación exitosa"];
        } catch (Exception $e) {
            // Revertir transacción
            $this->cm->rollback();
            $res = ["estado" => "error", "mensaje" => $e->getMessage()];
        }

        echo json_encode($res);
    }
    public function verificarIdcliente($id)
    {
        $res = "";
        $datosjson = $this->verificar->datosExtras();
        $datos = json_decode($datosjson, true);
        $tiposDocumentos = $datos['tiposDocumentos'];
        $consulta = $this->cm->query("select c.id_cliente, c.nombre, c.nombrecomercial, tc.tipo, c.codigo, c.nit, c.detalle, c.direccion, c.telefono, c.mobil, c.email, c.web, c.pais, c.ciudad, c.zona, c.contacto, c.idempresa, c.tipodocumento, c.tipo as tipocod, c.canal from cliente c
        left join tipocliente tc on c.tipo=tc.idtipocliente
        where c.id_cliente='$id' order by c.id_cliente desc");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe['id_cliente'], "nombre" => $qwe['nombre'], "nombrecomercial" => $qwe['nombrecomercial'], "tipo" => $qwe['tipo'], "codigo" => $qwe['codigo'], "nit" => $qwe['nit'], "detalle" => $qwe['detalle'], "direccion" => $qwe['direccion'], "telefono" => $qwe['telefono'], "mobil" => $qwe['mobil'], "email" => $qwe['email'], "web" => $qwe['web'], "pais" => $qwe['pais'], "ciudad" => $qwe['ciudad'], "zona" => $qwe['zona'], "contacto" => $qwe['contacto'], "idempresa" => $qwe['idempresa'], "tipodocumento" => $qwe['tipodocumento'], "textotipodocumento" => array_column($tiposDocumentos, 'descripcion', 'id')[$qwe['tipodocumento']] ?? '', "codigotipo" => $qwe['tipocod'], "canal" => $qwe['idcanal']);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarcliente($idcliente, $nombre, $nombrecomercial, $canal, $tipo, $tipodocumento, $nit, $detalle, $direccion, $telefono, $mobil, $email, $web, $pais, $ciudad, $zona, $contacto)
    {
        $res = "";
        $registro = $this->cm->query("update cliente SET nombre='$nombre',nombrecomercial='$nombrecomercial',tipo='$tipo',nit='$nit',detalle='$detalle',direccion='$direccion',telefono='$telefono',mobil='$mobil',email='$email',web='$web',pais='$pais',ciudad='$ciudad',zona='$zona',contacto='$contacto',tipodocumento='$tipodocumento',canal='$canal' WHERE id_cliente='$idcliente'");
        if ($registro === TRUE) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }

    public function listaSucursal($id)
    {
        $lista = [];
        $clien = $this->cm->query("select * from sucursal where cliente_id_cliente='$id' order by id_sucursal desc");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array("id" => $qwe[0], "nombre" => $qwe[1], "telefono" => $qwe[2], "direccion" => $qwe[3], "idcliente" => $qwe[4]);

            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registrosucursal($nombre, $telefono, $direccion, $idcliente)
    {
        $res = "";
        $registro = $this->cm->query("insert into sucursal (id_sucursal, nombre, telefono, direccion, cliente_id_cliente) values(null,'$nombre','$telefono','$direccion','$idcliente')");
        if ($registro === TRUE) {
            $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }

    public function eliminarsucursal($id)
    {
        $res = "";
        $registro = $this->cm->query("delete from sucursal where id_sucursal='$id'");
        if ($registro === TRUE) {

            $res = array("estado" => "exito", "mensaje" => "Registro exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }

    public function verificarIdsucursal($id)
    {
        $res = "";

        $consulta = $this->cm->query("select * from sucursal where id_sucursal = '$id'");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "nombre" => $qwe[1], "telefono" => $qwe[2], "direccion" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarsucursal($idsucursal, $nombre, $telefono, $direccion)
    {
        $res = "";
        $registro = $this->cm->query("update sucursal SET nombre='$nombre', telefono='$telefono', direccion='$direccion' where id_sucursal='$idsucursal'");
        if ($registro === TRUE) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion exitoso sucursal");
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }

    public function listaCampañasDisponibles($id)
    {
        $res = "";
        $val = "";
        $lista = [];
        $fecha = date("Y-m-d");
        $registro = $this->cm->query("SELECT * FROM campañas ca WHERE ca.almacen_id_almacen='$id' AND ca.estado=1 AND ca.fechafinal >= '$fecha'");
        if ($registro !== false) {
            $numFilas = $this->cm->rows($registro);
            if ($numFilas > 0) {
                while ($datos = $this->cm->fetch($registro)) {
                    $val = array("id" => $datos[0], "nombre" => $datos[1]);
                    array_push($lista, $val);
                }
                $res = array("estado" => "exito", "mensaje" => "Lista encontradas", "almacenes" => $lista);
            } else {
                $res = array("estado" => "info", "mensaje" => "No existen campañas");
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }

    public function listaCategoriasCampañasDisponibles($id)
    {
        $res = "";
        $val = "";
        $lista = [];
        $registro = $this->cm->query("SELECT cca.id_categorias_campañas, cca.porcentajes_id_porcentajes, cca.campañas_id_campañas, po.tipo FROM categorias_campañas cca
        INNER JOIN porcentajes po ON cca.porcentajes_id_porcentajes=po.id_porcentajes
        WHERE campañas_id_campañas='$id'");
        if ($registro !== false) {
            while ($datos = $this->cm->fetch($registro)) {
                $val = array("id" => $datos[0], "nombre" => $datos[3]);
                array_push($lista, $val);
            }
            $res = array("estado" => "exito", "mensaje" => "Lista encontradas", "datos" => $lista);
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }

    public function listaProductosDisponiblesVenta($idmd5)
    {
        $res = "";//stock
        $val = "";
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $registro = $this->cm->query("SELECT pa.id_productos_almacen,
        al.nombre AS nombre_almacen,
        p.codigo,
        p.cod_barras,
        p.nombre AS nombre_producto,
        p.descripcion,
        pa.pais,
        u.nombre AS nombre_unidad,
        p.caracteristicas,
        pa.stock_minimo,
        s.cantidad AS ultima_cantidad_stock,
        pa.fecha_registro,
        al.id_almacen,
        pa.estado,
        m.nombre_medida,
        c.nombre AS nombre_categoria,
        pa.productos_id_productos,
        ep.tipos_estado,
        pa.stock_maximo,
        p.imagen,
        s.id_stock, 
        po.id_porcentajes,
        po.tipo, 
        prsu.precio,
        p.codigosin,
        p.actividadsin,
        p.unidadsin,
        p.codigonandina
        FROM productos_almacen AS pa
            LEFT JOIN almacen AS al ON pa.almacen_id_almacen = al.id_almacen
            LEFT JOIN productos AS p ON pa.productos_id_productos = p.id_productos
            LEFT JOIN unidad AS u ON u.id_unidad = p.unidad_id_unidad
            LEFT JOIN medida AS m ON m.id_medida = p.medida_id_medida
            LEFT JOIN categorias AS c ON c.id_categorias = p.categorias_id_categorias
            LEFT JOIN estados_productos AS ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
            LEFT JOIN precio_sugerido AS prsu ON pa.id_productos_almacen=prsu.productos_almacen_id_productos_almacen
            LEFT join porcentajes AS po ON prsu.porcentajes_id_porcentajes=po.id_porcentajes
            LEFT JOIN (
                SELECT id_stock, productos_almacen_id_productos_almacen, cantidad, ROW_NUMBER() OVER (PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
                FROM
                    stock
                WHERE
                    estado = '1'
            ) AS s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1
            WHERE
                        p.idempresa='$idempresa'  
            ORDER BY `pa`.`id_productos_almacen` DESC;");
        if ($registro !== false) {
            while ($qwe = $this->cm->fetch($registro)) {
                $val = array("id" => $qwe[0], "almacen" => $qwe[1], "codigo" => $qwe[2], "codigobarra" => $qwe[3], "producto" => $qwe[4], "descripcion" => $qwe[5], "detalle" => $qwe[6], "unidad" => $qwe[7], "caracteristica" => $qwe[8], "stockminimo" => $qwe[9], "stock" => $qwe[10], "fecha" => $qwe[11], "idalmacen" => $qwe[12], "estado" => $qwe[13], "medida" => $qwe[14], "categoria" => $qwe[15], "idproducto" => $qwe[16], "estadoproducto" => $qwe[17], "stockmaximo" => $qwe[18], "imagen" => $qwe[19], "idstock" => $qwe[20], "idporcentaje" => $qwe[21], "tipo" => $qwe[22], "precio" => $qwe[23], "codigosin" => $qwe[24], "actividadsin" => $qwe[25], "unidadsin" => $qwe[26], "codigonandina" => $qwe[27]);
                array_push($lista, $val);
            }
            $res = array("estado" => "exito", "mensaje" => "Lista encontradas", "datos" => $lista);
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }

    public function listaPuntoVentaFactura($idmd5)
    {
        $res = "";
        $val = "";
        $lista = [];
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $registro = $this->cm->query("SELECT rpv.idresponsable, rpv.idpuntoventa, pv.nombre, pv.idalmacen, pv.codigosin FROM responsable_puntoventa rpv
        LEFT JOIN punto_venta pv ON rpv.idpuntoventa=pv.idpunto_venta
        LEFT JOIN responsable r ON rpv.idresponsable=r.id_responsable
        WHERE r.id_usuario='$idusuario' AND pv.codigosin!= ''");
        if ($registro !== false) {
            while ($qwe = $this->cm->fetch($registro)) {
                $val = array("idresponsable" => $qwe[0], "idpuntoventa" => $qwe[1], "nombre" => $qwe[2], "idalmacen" => $qwe[3], "codigosin" => $qwe[4]);
                array_push($lista, $val);
            }
            $res = array("estado" => "exito", "mensaje" => "Lista encontradas", "datos" => $lista);
        } else {
            $res = array("estado" => "error", "mensaje" => "Ocurrio un problema, intentelo nuevamente");
        }
        echo json_encode($res);
    }
    function obtenerNumeroFacturaDisponiblePrueba($idempresa, $tipoventa) {
        $nroFactura = null;
        $contador = 0; // Contador para evitar bucles infinitos
    
        while ($nroFactura === null) {
            // Contar las ventas existentes
            $nroventaxFac = $this->cm->query("SELECT COUNT(v.id_venta) AS cantidad_ventas FROM venta v LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente WHERE c.idempresa = '$idempresa' AND v.tipo_venta = '$tipoventa'");
            $resp = $this->cm->fetch($nroventaxFac);
            $nroFactura = $resp[0] + 1 + $contador;
            // Verificar si el número de factura ya existe
            $verificarExistencia = $this->cm->query("SELECT v.nfactura FROM venta v LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente WHERE c.idempresa = '$idempresa' AND v.tipo_venta = '$tipoventa' AND v.nfactura = '$nroFactura'");
            
            if ($verificarExistencia->num_rows > 0) {
                $nroFactura = null; // Reiniciar la variable para repetir el ciclo
                $contador++; // Incrementar el contador para probar con el siguiente número
            }
            
            // Condición de escape para evitar bucles infinitos (opcional)
            if ($contador > 1000) {
                throw new Exception("No se pudo encontrar un número de factura disponible después de varios intentos.");
            }
        }
    
        echo $nroFactura;
    }



    function obtenerNumeroFacturaDisponible($idempresa, $tipoventa) {
        $nroFactura = null;
        $contador = 0; // Contador para evitar bucles infinitos
    
        while ($nroFactura === null) {
            // Contar las ventas existentes
            $nroventaxFac = $this->cm->query("SELECT COUNT(v.id_venta) AS cantidad_ventas FROM venta v LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente WHERE c.idempresa = '$idempresa' AND v.tipo_venta = '$tipoventa'");
            $resp = $this->cm->fetch($nroventaxFac);
            $nroFactura = $resp[0] + 1 + $contador;
            // Verificar si el número de factura ya existe
            $verificarExistencia = $this->cm->query("SELECT v.nfactura FROM venta v LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente WHERE c.idempresa = '$idempresa' AND v.tipo_venta = '$tipoventa' AND v.nfactura = '$nroFactura'");
            
            if ($verificarExistencia->num_rows > 0) {
                $nroFactura = null; // Reiniciar la variable para repetir el ciclo
                $contador++; // Incrementar el contador para probar con el siguiente número
            }
            
            // Condición de escape para evitar bucles infinitos (opcional)
            if ($contador > 1000) {
                throw new Exception("No se pudo encontrar un número de factura disponible después de varios intentos.");
            }
        }
    
        return $nroFactura;
    }
    public function registroVenta($fecha, $tipoventa, $tipopago, $idcliente, $idsucursal, $canalventa, $idmd5, $idmd5u, $jsonDetalles)
    {
        // echo json_encode(array("1" => $fecha, "2" =>$tipoventa, "3" =>$tipopago, "4" =>$idcliente, "5" =>$idsucursal, "6" =>$canalventa, "7" =>$idmd5, "8" =>$idmd5u, "9" =>$jsonDetalles));
        try {
            date_default_timezone_set('America/La_Paz');
            $lista = [];
            $res = "";
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
            if (!$idempresa) {
                $this->logger->registrar("registroVenta", "error", "ID de empresa inválido para el hash: $idmd5", compact('idmd5'), $idusuario ?? null);
                return json_encode(["estado" => "error", "mensaje" => "ID de empresa no válido."]);
            }
            
            if (!$idusuario) {
                $this->logger->registrar("registroVenta", "error", "ID de usuario inválido para el hash: $idmd5u", compact('idmd5u'), null, $idempresa);
                return json_encode(["estado" => "error", "mensaje" => "ID de usuario no válido."]);
            }
            
            $consultanroventa = $this->cm->query("select count(v.id_venta) as cantidad_ventas from venta v left join cliente c on v.cliente_id_cliente1=c.id_cliente where c.idempresa='$idempresa'");
            if (!$consultanroventa) {
                $this->logger->registrar("registroVenta", "error", "Error al ejecutar consulta nro venta", [], $idusuario, $idempresa);
                return json_encode(["estado" => "error", "mensaje" => "Error al consultar el número de ventas"]);
            }
            
            $resp = $this->cm->fetch($consultanroventa);
           
            if (!$resp || !isset($resp[0])) {
                $this->logger->registrar("registroVenta", "error", "No se pudo obtener cantidad de ventas", ['resp' => $resp], $idusuario, $idempresa);
                return json_encode(["estado" => "error", "mensaje" => "Error inesperado al obtener la cantidad de ventas"]);
            }
            $nroventa = $resp[0] + 2;

            $idClientePadded = str_pad($idcliente, 6, '0', STR_PAD_LEFT);
            $fechaVentaFormatted = substr($fecha, 0, 4) . substr($fecha, 5, 2) . substr($fecha, 8, 2);
            $numeroSecuencialPadded = str_pad($nroventa, 6, '0', STR_PAD_LEFT);
            $codigoVenta = $idClientePadded . $fechaVentaFormatted . $numeroSecuencialPadded;

            $ventatotal = $jsonDetalles['ventatotal'];
            $descuento = $jsonDetalles['descuento'];
            $iddivisa = $jsonDetalles['iddivisa'];
            $idcampaña = $jsonDetalles['idcampana'];
            $respuestaCredito = "";
            $ultimoIDventa = "";
            $listaResultadoStock = [];

            $nroFactura =  $this->obtenerNumeroFacturaDisponible($idempresa, $tipoventa);
            if ($nroFactura == null) {
                echo json_encode(array("estado" => "error", "mensaje" => "El número de factura generado ya existe, intente la nuevamente"));
               
                return;
            }
            if ($tipoventa == 0) {
                
                if (!empty($jsonDetalles['listaProductos'])) {
                    // Array para almacenar los idstock
                    $idstockArray = array();

                    // Verificar si listaProductos está definido y es un array "Error al procesar la venta"
                    if (isset($jsonDetalles['listaProductos']) && is_array($jsonDetalles['listaProductos'])) {
                        // Recorrer listaProductos y almacenar los idstock en el array
                        foreach ($jsonDetalles['listaProductos'] as $producto) {
                            if (isset($producto['idstock'])) {
                                $idstockArray[] = $producto['idstock'];
                            }
                        }
                    } else {
                        //$this->cm->rollbackTransaction();
                        return array("estado" => "error", "mensaje" => "Fallo la operación, intentelo nuevamente 1", "tipoventa" => "No Facturado", "datos" => [], "credito" => []);
                    }

                    // Contar la cantidad de idstock
                    $cantidadIdstock = count($idstockArray);
                    // Convertir el array a una cadena con los valores separados por comas
                    $idstockString = implode(',', $idstockArray);
                    //$respuesta = false;                    
                    
                    $listaStock = $this->cm->query("SELECT * FROM stock WHERE id_stock IN ($idstockString) AND estado = 1");
                    // Contar el número de filas en el resultado de la consulta
                    $numFilas = $listaStock->num_rows;
                    if ($numFilas === $cantidadIdstock) {
                        // Comenzar una transacción
                        $this->cm->beginTransaction();  //Utilizamos la función personalizada
                        $consultaVenta = $this->cm->query("INSERT INTO venta(id_venta, fecha_venta, tipo_venta, monto_total, descuento, tipo_pago, cliente_id_cliente1, divisas_id_divisas, id_usuario, nfactura, idsucursal, idcampaña, nroventa, estado, idcanal, codigoventa)value(NULL,'$fecha','$tipoventa','$ventatotal','$descuento','$tipopago','$idcliente','$iddivisa','$idusuario','$nroFactura','$idsucursal','$idcampaña', '$nroventa',1,'$canalventa','$codigoVenta')");

                        if ($consultaVenta !== false) {
                            // Obtener el último ID insertado
                            $ultimoIDventa = $this->cm->insert_id;
                            $res = array("estado" => "exito", "mensaje" => "IDS encontrados", "tipoventa" => "No Facturado", "idventa" => $ultimoIDventa, "datos" => [], "credito" => []);
                            // Verificar si $almacenes no está vacío
                            if (!empty($jsonDetalles['listaProductos'])) {
                                // Insertar las asociaciones con almacenes
                                foreach ($jsonDetalles['listaProductos'] as $producto) {
                                    if (isset($producto['idproductoalmacen'])) {
                                        $idproducto = $producto['idproductoalmacen'];
                                        $cantidad = $producto['cantidad'];
                                        $precio = $producto['precio'];
                                        $categoria = $producto['idporcentaje'];
                                        $idstock = $producto['idstock'];
                                        $descripcion = $producto['descripcion'];

                                        $resultado = $this->cm->query("INSERT INTO detalle_venta(id_detalle_venta,cantidad,precio_unitario,productos_almacen_id_productos_almacen,venta_id_venta,categoria) value(NULL,'$cantidad','$precio','$idproducto','$ultimoIDventa','$categoria')");
                                        // Verificar si la consulta se ejecutó correctamente
                                        if ($resultado) {

                                            // Verificar si se insertó al menos una fila
                                            if ($this->cm->affected_rows > 0) {
                                                // Los datos se insertaron correctamente
                                                $stock = $this->cm->fetch($this->cm->query("SELECT * FROM stock WHERE id_stock = '$idstock'"));
                                                $cantidadActual = $stock[1];
                                                if ($stock[4] === "1") {
                                                    $consultaActualizarStock = $this->cm->query("update stock set estado=2 where id_stock='$idstock' AND estado = 1 ");
                                                    // Verificar si la consulta se ejecutó correctamente y afectó alguna fila
                                                    if ($consultaActualizarStock === true && $this->cm->affected_rows > 0) {
                                                        //echo "La consulta de actualización se ejecutó correctamente y afectó " . $this->cm->affected_rows . " fila(s).";
                                                        $fecha = date("Y-m-d");
                                                        $nuevaCantidad = $cantidadActual - $cantidad;
                                                        $codigo = "VE";
                                                        $nuevostock = $this->cm->query("insert into stock(id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) values(null,'$nuevaCantidad','$fecha','$codigo',1,'$idproducto')");
                                                        if ($nuevostock) {
                                                            if ($this->cm->affected_rows > 0) {
                                                                $res1 = array("nuevo ID stock" => $this->cm->insert_id, "nueva cantidad" => $nuevaCantidad);
                                                                array_push($res['datos'], $res1);
                                                            }
                                                            else{

                                                            }
                                                        }
                                                    } else {
                                                        $this->cm->rollbackTransaction();
                                                        $res = array("estado" => "error", "mensaje" => "La consulta de actualización no se ejecutó correctamente o no afectó ninguna fila.");
                                                        array_push($listaResultadoStock, $res);
                                                        // Revertir la transacción en caso de error utilizando tu función personalizada
                                                        
                                                    }
                                                } else {
                                                    // Revertir la transacción en caso de error utilizando tu función personalizada
                                                    $this->cm->rollbackTransaction();
                                                    $res = array("estado" => "error", "mensaje" => "EL stock que se seleccion del producto no es valido, borre y cargue de nuevo el producto en la lista de ventas", "datos" => $descripcion . "-" . $stock);
                                                    //array_push($listaResultadoStock, $res);
                                                }
                                            } else {
                                                // No se insertaron datos
                                                // Revertir la transacción en caso de error utilizando tu función personalizada
                                                $this->cm->rollbackTransaction();
                                                $this->logger->registrar(
                                                    "registroVenta",
                                                    "error",
                                                    "No se insertaron datos en detalle_venta",
                                                    compact(json_encode($producto), json_encode($ultimoIDventa)),                                                    $idusuario ?? null,
                                                    $idempresa ?? null
                                                );
                                                $res = array("estado" => "error", "mensaje" => "No se insertaron datos.");
                                                //array_push($listaResultadoStock, $res);
                                            }
                                        } else {
                                            // Revertir la transacción en caso de error utilizando tu función personalizada
                                            $this->cm->rollbackTransaction();
                                            // Hubo un error en la ejecución de la consulta
                                            $this->logger->registrar(
                                                "registroVenta",
                                                "error",
                                                "Error al ejecutar la consulta detalle_venta",
                                                compact(json_encode($producto), json_encode($ultimoIDventa), $this->cm->error),
                                                $idusuario ?? null,
                                                $idempresa ?? null
                                            );
                                            $res = array("estado" => "error", "mensaje" => "Error al ejecutar la consulta: => " . $this->cm->error);
                                            //array_push($listaResultadoStock, $res);
                                        }
                                    } else {
                                        // Revertir la transacción en caso de error utilizando tu función personalizada
                                        $this->cm->rollbackTransaction();
                                        // Se encontró un problema con el objeto de almacenes
                                        $res = array("estado" => "error", "mensaje" => "No se pudo registrar los almacenes");
                                        //array_push($listaResultadoStock, $res);
                                    }
                                }
                            } else {
                                // Revertir la transacción en caso de error utilizando tu función personalizada
                                $this->cm->rollbackTransaction();
                                // El objeto de almacenes está vacío
                                $res = array("estado" => "error", "mensaje" => "El objeto de almacenes está vacío");
                                //array_push($listaResultadoStock, $res);
                            }
                            // Confirmar la transacción utilizando tu función personalizada
                            $this->cm->commitTransaction();
                        } else {
                            
                            // Error al intentar registrar
                            echo json_encode(array("estado" => "error", "mensaje" => "Error al intentar registrar la venta. Por favor, recargue la ventana y intentelo nuevamente"));
                            return;//array_push($listaResultadoStock, $res);
                        }
                    } else {
                        echo json_encode(array("estado" => "error", "mensaje" => "Hubo un problema con las cantidades actuales, por favor actualize la ventana y cargue la venta de nuevo"));
                        return; 
                    }
                } else {
                    // El objeto de almacenes está vacío
                    echo json_encode(array("estado" => "error", "mensaje" => "El objeto de productos está vacío"));
                    return;
                    //array_push($listaResultadoStock, $res);
                }
            } else {
                $jsonDetalles['listaFactura']['numeroFactura'] = $nroFactura;
                $jsonDetalles['listaFactura']['extras']['facturaTicket'] = $codigoVenta;
                //echo json_encode($jsonDetalles);
                $respuestaEmizor = $this->factura->crearfactura($jsonDetalles['listaFactura'], $tipoventa, $jsonDetalles['token'], $jsonDetalles['tipo'], $jsonDetalles['codigosinsucursal']);
                $datos = $respuestaEmizor->data;  
                $res = $respuestaEmizor;
               $res = array(
                    "estado" => "exito",
                    "mensaje" => "IDS encontrados",
                    "tipoventa" => "facturado",
                    "estadoFactura" => "",
                    "datosFactura" => array(
                        "urlEmizor" => property_exists($datos, 'shortLink') ? $datos->shortLink : null,
                        "urlsin" => property_exists($datos, 'urlSin') ? $datos->urlSin :
                                    (property_exists($datos, 'urlsin') ? $datos->urlsin : null)
                    ),
                    "FacturaYoF" => [],
                    "idventa" => "",
                    "datos" => [],
                    "credito" => [],
                    "intentos" => "",
                    "emizor" => $respuestaEmizor,
                    "errores" => null
                );

               // echo json_encode($respuestaEmizor);
                if ($respuestaEmizor->status === "success") {
                    $intentos = 0;
                    $max_intentos = 5; // Número máximo de intentos

                    while ($intentos < $max_intentos) {
                        $estadoFactura = $this->factura->estadofactura($respuestaEmizor->data->cuf, $jsonDetalles['token'], $jsonDetalles['tipo'], 2);
                        $res['estadoFactura'] = $estadoFactura;
                            
                        if ($estadoFactura->data->codigoEstado == 690) {
                                
                            if ($estadoFactura->data->errores == null) {
                                //$res = $estadoFactura;
                                //array_push($listaResultadoStock, $res);

                                //$this->cm->beginTransaction();  // Utilizamos la función personalizada


                                if (!empty($jsonDetalles['listaProductos'])) {
                                    //$res = array("estado" => "exito", "mensaje" => "IDS encontrados", "tipoventa" => "facturado", "estadoFactura" => $estadoFactura->data, "datos" => array("urlEmizor" => $datos->shortLink, "urlsin" => $datos->urlSin), "FacturaYoF" => [], "idventa" => "", "datos" => [], "credito" => [], "intentos" => "");
                                    // Array para almacenar los idstock
                                    $idstockArray = array();

                                    // Verificar si listaProductos está definido y es un array
                                    if (isset($jsonDetalles['listaProductos']) && is_array($jsonDetalles['listaProductos'])) {
                                        // Recorrer listaProductos y almacenar los idstock en el array
                                        foreach ($jsonDetalles['listaProductos'] as $producto) {
                                            if (isset($producto['idstock'])) {
                                                $idstockArray[] = $producto['idstock'];
                                            }
                                        }
                                    }
                                    // Contar la cantidad de idstock
                                    $cantidadIdstock = count($idstockArray);
                                    // Convertir el array a una cadena con los valores separados por comas
                                    $idstockString = implode(',', $idstockArray);
                                    //$respuesta = false;
                                    $listaStock = $this->cm->query("SELECT * FROM stock WHERE id_stock IN ($idstockString) AND estado = 1");
                                    // Contar el número de filas en el resultado de la consulta
                                    $numFilas = $listaStock->num_rows;
                                    if ($numFilas === $cantidadIdstock) {
                                        $consultaVenta = $this->cm->query("INSERT INTO venta(id_venta, fecha_venta, tipo_venta, monto_total, descuento, tipo_pago, cliente_id_cliente1, divisas_id_divisas, id_usuario, nfactura, idsucursal, idcampaña, nroventa, estado, idcanal, codigoventa)value(NULL,'$fecha','$tipoventa','$ventatotal','$descuento','$tipopago','$idcliente','$iddivisa','$idusuario','$nroFactura','$idsucursal','$idcampaña', '$nroventa',1,'$canalventa','$codigoVenta')");
                                        $ultimoIDventa = $this->cm->insert_id;
                                        $datosFactura = $this->factura->registrarFacturas($datos->ack_ticket, $datos->codigoEstado, $datos->cuf, $datos->emission_type_code, $datos->fechaEmision, $datos->numeroFactura, $datos->shortLink, $datos->urlSin, $datos->xml_url, $ultimoIDventa);
                                        $res['FacturaYoF'] = $datosFactura;
                                        if ($consultaVenta !== false) {
                                            // Obtener el último ID insertado
                                            $ultimoIDventa = $this->cm->insert_id;
                                            $res['idventa'] = $ultimoIDventa;
                                            //$res = array("estado" => "exito", "mensaje" => "IDS encontrados", "tipoventa" => "No Facturado", "idventa" => $ultimoIDventa, "datos" => [], "credito" => []);
                                            // Verificar si $almacenes no está vacío
                                            if (!empty($jsonDetalles['listaProductos'])) {
                                                // Insertar las asociaciones con almacenes
                                                foreach ($jsonDetalles['listaProductos'] as $producto) {
                                                    if (isset($producto['idproductoalmacen'])) {
                                                        $idproducto = $producto['idproductoalmacen'];
                                                        $cantidad = $producto['cantidad'];
                                                        $precio = $producto['precio'];
                                                        $categoria = $producto['idporcentaje'];
                                                        $idstock = $producto['idstock'];
                                                        $descripcion = $producto['descripcion'];

                                                        $resultado = $this->cm->query("INSERT INTO detalle_venta(id_detalle_venta,cantidad,precio_unitario,productos_almacen_id_productos_almacen,venta_id_venta,categoria) value(NULL,'$cantidad','$precio','$idproducto','$ultimoIDventa','$categoria')");
                                                        // Verificar si la consulta se ejecutó correctamente
                                                        if ($resultado) {

                                                            // Verificar si se insertó al menos una fila
                                                            if ($this->cm->affected_rows > 0) {
                                                                // Los datos se insertaron correctamente
                                                                $stock = $this->cm->fetch($this->cm->query("SELECT * FROM stock WHERE id_stock = '$idstock'"));
                                                                $cantidadActual = $stock[1];
                                                                if ($stock[4] === "1") {
                                                                    $consultaActualizarStock = $this->cm->query("update stock set estado=2 where id_stock='$idstock' AND estado = 1 ");
                                                                    // Verificar si la consulta se ejecutó correctamente y afectó alguna fila
                                                                    if ($consultaActualizarStock === true && $this->cm->affected_rows > 0) {
                                                                        //echo "La consulta de actualización se ejecutó correctamente y afectó " . $this->cm->affected_rows . " fila(s).";
                                                                        $fecha = date("Y-m-d");
                                                                        $nuevaCantidad = $cantidadActual - $cantidad;
                                                                        $codigo = "VE";
                                                                        $nuevostock = $this->cm->query("insert into stock(id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) values(null,'$nuevaCantidad','$fecha','$codigo',1,'$idproducto')");
                                                                        if ($nuevostock) {
                                                                            if ($this->cm->affected_rows > 0) {
                                                                                $res1 = array("nuevo ID stock" => $this->cm->insert_id, "nueva cantidad" => $nuevaCantidad);
                                                                                array_push($res['datos'], $res1);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        $res = array("estado" => "error", "mensaje" => "La consulta de actualización no se ejecutó correctamente o no afectó ninguna fila.");
                                                                        //array_push($listaResultadoStock, $res);
                                                                        // Revertir la transacción en caso de error utilizando tu función personalizada
                                                                        //$this->cm->rollbackTransaction();
                                                                    }
                                                                } else {
                                                                    // Revertir la transacción en caso de error utilizando tu función personalizada
                                                                    //$this->cm->rollbackTransaction();
                                                                    $res = array("estado" => "error", "mensaje" => "EL stock que se seleccion del producto no es valido, borre y cargue de nuevo el producto en la lista de ventas", "datos" => $descripcion . "-" . $stock);
                                                                    //array_push($listaResultadoStock, $res);
                                                                }
                                                            } else {
                                                                // No se insertaron datos
                                                                // Revertir la transacción en caso de error utilizando tu función personalizada
                                                                //$this->cm->rollbackTransaction();
                                                                $res = array("estado" => "error", "mensaje" => "No se insertaron datos.");
                                                                //array_push($listaResultadoStock, $res);
                                                            }
                                                        } else {
                                                            // Revertir la transacción en caso de error utilizando tu función personalizada
                                                            //$this->cm->rollbackTransaction();
                                                            // Hubo un error en la ejecución de la consulta
                                                            $res = array("estado" => "error", "mensaje" => "Error al ejecutar la consulta: => " . $this->cm->error);
                                                            //array_push($listaResultadoStock, $res);
                                                        }
                                                    } else {
                                                        // Revertir la transacción en caso de error utilizando tu función personalizada
                                                        //$this->cm->rollbackTransaction();
                                                        // Se encontró un problema con el objeto de almacenes
                                                        $res = array("estado" => "error", "mensaje" => "No se pudo registrar los almacenes");
                                                        //array_push($listaResultadoStock, $res);
                                                    }
                                                }
                                            } else {
                                                // Revertir la transacción en caso de error utilizando tu función personalizada
                                                //$this->cm->rollbackTransaction();
                                                // El objeto de almacenes está vacío
                                                $res = array("estado" => "error", "mensaje" => "El objeto de almacenes está vacío");
                                                //array_push($listaResultadoStock, $res);
                                            }
                                        } else {
                                            // Revertir la transacción en caso de error utilizando tu función personalizada
                                            //$this->cm->rollbackTransaction();
                                            // Error al intentar registrar
                                            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar la venta. Por favor, recargue la ventana y intentelo nuevamente");
                                            //array_push($listaResultadoStock, $res);
                                        }
                                        // Confirmar la transacción utilizando tu función personalizada
                                        //$this->cm->commitTransaction();
                                    } else {
                                        $res = array("estado" => "error", "mensaje" => "Hubo un problema con las cantidades actuales, por favor actualize la ventana y cargue la venta de nuevo");
                                        //array_push($listaResultadoStock, $res);
                                    }
                                } else {
                                    // El objeto de almacenes está vacío
                                    $res = array("estado" => "error", "mensaje" => "El objeto de productos está vacío");
                                    //array_push($listaResultadoStock, $res);
                                }

                                break; // Salir del bucle si se cumple la condición

                            } else {
                                $res['estado'] = $estadoFactura;
                                break;
                            }
                        } else {
                            //$res = $estadoFactura;
                            //array_push($listaResultadoStock, $res);
                            // Incrementar el número de intentos
                            $intentos++;
                            //$res['intentos'] = $intentos;
                        }

                        // Si se alcanza el número máximo de intentos, salir del bucle
                        if ($intentos == $max_intentos) {
                            // Opcional: Manejar el caso de que no se cumpla la condición después de los intentos máximos
                            // Ejemplo: manejar_error();
                            $res = $estadoFactura;
                            break;
                        }

                        // Esperar antes de reintentar (opcional)
                        sleep(1); // Esperar 1 segundo antes de cada nuevo intento
                    }
                } else {
                    $res['emizor'] = $respuestaEmizor;
                    $res['errores'] = $respuestaEmizor->errors;
                    //array_push($listaResultadoStock, $res);
                    //$listaResultadoStock = $respuestaEmizor;
                }
                //echo json_encode($listaResultadoStock);
            }
            if ($tipopago == "credito") {
                $respuestaCredito = $this->registroCuentaXcobrar($jsonDetalles['nropagos'], $jsonDetalles['valorpagos'], $jsonDetalles['dias'], $ultimoIDventa, $jsonDetalles['fechalimite'], $jsonDetalles['ventatotal']);
                //$res2 = $respuestaCredito;
                $res['credito'] = $respuestaCredito;
                //array_push($listaResultadoStock, $res);
            } else {
                $res2 = array("estado" => "error", "mensaje" => "Esta venta se realizo al contado");
                $res['credito'] = $res2;
                $this->logger->registrar(
                    "registroCuentaXcobrar",
                    "error",
                    "error",
                    ["respuestaCredito" => $respuestaCredito, "idmd5" => $idmd5],
                    $idusuario, // puedes pasar aquí el ID de usuario si lo tienes
                    $idempresa
                );
                //array_push($listaResultadoStock, $res); idventa
            }
            if($jsonDetalles['variablePago'] == "dividido"){
                //$res['pagosDivididos'] = $jsonDetalles['pagosDivididos'];
               $respuesta =  $this->registrarPagosVenta($jsonDetalles['pagosDivididos'],$res['idventa']);
            }
            $res['tipo'] = $tipoventa;
            $res['pagosDivididos'] = $respuesta ?? [];
            echo json_encode($res);
        } catch (Exception $e) {
            $this->logger->registrar(
                "registroVenta",                      // módulo
                "error",                              // tipo de error
                $e->getMessage(),                     // mensaje
                compact('fecha', 'tipoventa', 'tipopago', 'idcliente', 'idsucursal', 'canalventa', 'idmd5', 'idmd5u', 'jsonDetalles'), // datos de entrada
                $idusuario ?? null,                  // id del usuario (si está disponible)
                $idempresa ?? null                   // id de la empresa (si está disponible)
            );
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
        //echo json_encode($jsonDetalles);
    }
    public function registrarPagosVenta($array_pagos, $idventa) 
    {
        $res = [];
        try {
            $this->cm->beginTransaction();

            $sql = "INSERT INTO pagoVenta (id_venta, id_canalventa, porcentaje, monto)
                    VALUES (?, ?, ?, ?)";
            $stmt = $this->cm->prepare($sql);

            if ($stmt === false) {
                $this->cm->rollBack();
                return array("estado" => "error", "mensaje" => "Error al preparar la consulta SQL.");
            }
            
            foreach ($array_pagos as $pago) {
                $execute_result = $stmt->execute([
                    $idventa,
                    $pago['metodoPago']['value'],
                    $pago['porcentaje'],
                    $pago['monto']
                ]);

                if ($execute_result === false) {
                    $errorInfo = $stmt->error;
                    $this->logger->registrar(
                        "registrar PAGOS DIVIDIDOS",
                        "error",
                        "PDO execute failed: " . $errorInfo[2],
                        array_merge(compact('idventa'), ['current_pago' => $pago])
                    );
                    $this->cm->rollBack();
                    return array("estado" => "error", "mensaje" => $errorInfo[2]);
                }
            }

            $this->cm->commit();
            return array("estado" => "exito", "mensaje" => "Se registraron los pagos divididos correctamente");

        } catch (Exception $e) {
            $this->cm->rollBack();
            $this->logger->registrar(
                "registrar PAGOS DIVIDIDOS",
                "error",
                $e->getMessage(),
                compact('array_pagos', 'idventa')
            );
            return array("estado" => "error", "mensaje" => $e->getMessage());
        }
    }
    public function detalleVenta($id, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $clien = $this->cm->query("SELECT dve.id_detalle_venta, p.nombre, p.descripcion, p.caracteristicas, dve.cantidad, dve.precio_unitario FROM detalle_venta dve 
        LEFT JOIN venta ve on dve.venta_id_venta=ve.id_venta
        LEFT JOIN productos_almacen pa on dve.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT join productos p on pa.productos_id_productos=p.id_productos
        where dve.venta_id_venta='$id'
        order by p.nombre DESC");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array("id" => $qwe[0], "producto" => $qwe[1], "descripcion" => $qwe[2], "caracteristica" => $qwe[3], "cantidad" => $qwe[4], "precio" => $qwe[5]);
            array_push($lista, $res);
        }

        $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa='$idempresa'");

        $usuarioInfo = [];
        while ($usuario = $this->rh->fetch($usuarios)) {
            $usuarioInfo[$usuario[0]] = array(
                "idusuario" => $usuario[0],
                "usuario" => $usuario[1],
                "cargo" => $usuario[2]
            );
        }

        $empresas = $this->em->query("SELECT * FROM organizacion WHERE idorganizacion='$idempresa'");

        $empresaInfo = [];
        while ($empresa = $this->em->fetch($empresas)) {
            $empresaInfo[$empresa[0]] = array(
                "id" => $empresa[0],
                "nombre" => $empresa[1],
                "celular" => $empresa[11],
                "email" => $empresa[8],
                "logo" => $empresa[13],
                "direccion" => $empresa[12]
            );
        }
        $lista2 = [];
        $alma = $this->cm->query("select ve.id_venta, c.nombre, c.nombrecomercial, s.nombre, ve.fecha_venta, c.direccion, c.nit, c.email, ve.monto_total, ve.descuento, ve.id_usuario, ve.tipo_pago, di.nombre, ve.nfactura from venta ve
        inner join cliente c on ve.cliente_id_cliente1=c.id_cliente
        inner join sucursal s on ve.idsucursal=s.id_sucursal
        INNER JOIN divisas di on ve.divisas_id_divisas=di.id_divisas
        where ve.id_venta='$id'");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array("id" => $qwe[0], "cliente" => $qwe[1], "nombrecomercial" => $qwe[2], "sucursal" => $qwe[3], "fecha" => $qwe[4], "direccion" => $qwe[5], "nit" => $qwe[6], "email" => $qwe[7], "montototal" => $qwe[8], "descuento" => $qwe[9], "tipopago" => $qwe[11], "divisa" => $qwe[12], "nfactura" => $qwe[13], "detalle" => array($lista), "usuario" => array($usuarioInfo[$qwe[10]]), "empresa" => array($empresaInfo[$idempresa]));
            array_push($lista2, $res);
        }

        echo json_encode($lista2);
    }

    public function cambiarestadoventa($idventa, $estado, $motivo, $idmd5u, $token, $tipo)
    {
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d");
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
        //$estadoventa = "";
        $consultaVF = $this->cm->query("select vf.cuf from ventas_facturadas vf where vf.venta_id_venta = '$idventa' limit 1");

        if ($consultaVF->num_rows === 0) {
            // No se encontraron resultados, la consulta devolvió datos vacíos.
            $estadoventa = "Esta venta no requiere anulacion de factura";
            $registro = $this->cm->query("update venta SET estado='$estado' where id_venta='$idventa'");
                $estadocobro = $this->cm->query("update estado_cobro SET estado='4' where venta_id_venta='$idventa'");
                if ($registro === TRUE) {
                    $anulacion = $this->cm->query("insert into anulaciones(idanulaciones, fecha, motivo, venta_id_venta, idusuario)values(NULL,'$fecha','$motivo','$idventa','$idusuario')");
                    $productos = $this->cm->query("select dv.id_detalle_venta, dv.cantidad, dv.precio_unitario, dv.productos_almacen_id_productos_almacen, dv.venta_id_venta, (dv.cantidad+s.cantidad) as nuevo, s.id_stock from detalle_venta dv 
                    inner join stock s on dv.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
                    where dv.venta_id_venta='$idventa' and s.estado=1");
                    while ($qwe = $this->cm->fetch($productos)) {
                        $codigo = "AN";
                        $registro = $this->cm->query("update stock set estado=2 where id_stock='$qwe[6]'");
                        if ($registro === TRUE) {
                            $nuevostock = $this->cm->query("insert into stock(id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) values(null,'$qwe[5]','$fecha','$codigo',1,'$qwe[3]')");
                        }
                    }
                    $res = array("estado" => "exito", "mensaje" => "Se actualizo correctamente", "datosFactura" => $estadoventa);
                } else {
                    $res = array("estado" => "error", "mensaje" => "Se ocurrio un problema", "datosFactura" => $estadoventa);
                }
        } else {
            // Se encontraron resultados en la consulta.
            $resi = $this->cm->fetch($consultaVF);
            $cuf = $resi[0];
            //$fac = new facturacion();
            $respuestaEmizor = $this->factura->anularFactura($cuf, $motivo, $token, $tipo);
            $datosrespuesta = $respuestaEmizor->data;
            if ($respuestaEmizor->status == "success") {
                $estadoventa = $datosrespuesta;
                $registro = $this->cm->query("update venta SET estado='$estado' where id_venta='$idventa'");
                $estadocobro = $this->cm->query("update estado_cobro SET estado='4' where venta_id_venta='$idventa'");
                if ($registro === TRUE) {
                    $anulacion = $this->cm->query("insert into anulaciones(idanulaciones, fecha, motivo, venta_id_venta, idusuario)values(NULL,'$fecha','$motivo','$idventa','$idusuario')");
                    $productos = $this->cm->query("select dv.id_detalle_venta, dv.cantidad, dv.precio_unitario, dv.productos_almacen_id_productos_almacen, dv.venta_id_venta, (dv.cantidad+s.cantidad) as nuevo, s.id_stock from detalle_venta dv 
                    inner join stock s on dv.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
                    where dv.venta_id_venta='$idventa' and s.estado=1");
                    while ($qwe = $this->cm->fetch($productos)) {
                        $codigo = "AN";
                        $registro = $this->cm->query("update stock set estado=2 where id_stock='$qwe[6]'");
                        if ($registro === TRUE) {
                            $nuevostock = $this->cm->query("insert into stock(id_stock, cantidad, fecha, codigo, estado, productos_almacen_id_productos_almacen) values(null,'$qwe[5]','$fecha','$codigo',1,'$qwe[3]')");
                        }
                    }
                    $res = array("estado" => "exito", "mensaje" => "Se actualizo correctamente", "datosFactura" => $estadoventa, "datos" => $respuestaEmizor);
                } else {
                    $res = array("estado" => "error", "mensaje" => "Se ocurrio un problema", "datosFactura" => $estadoventa, "datos" => $respuestaEmizor);
                }
            } else {
                $estadoventa = $datosrespuesta;
            }
        }
        echo json_encode($res);
    }

    public function registroCotizacion($idcliente, $idsucursal, $jsonProductos)
    {
        $fecha = date("Y-m-d");
        $res = "";
        $idusuario = $this->verificar->verificarIDUSERMD5($jsonProductos['idusuario']);

        if ($idusuario === "false") {
            echo json_encode(array("estado" => "error", "mensaje" => "El id de empresa no existe"));
            return;
        }

        // Comenzar una transacción
        $this->cm->beginTransaction();  // Utilizamos la función personalizada

        try {
            $cotizaciontotal = $jsonProductos['ventatotal'];
            $descuento = $jsonProductos['descuento'];
            $iddivisa = $jsonProductos['divisa'];
            // Insertar el responsable
            $responable = $this->cm->query("INSERT INTO cotizacion(id_cotizacion, fecha_cotizacion, monto_total, descuento, cliente_id_cliente, divisas_id_divisas, id_usuario, idsucursal)values(NULL,'$fecha','$cotizaciontotal','$descuento','$idcliente','$iddivisa','$idusuario','$idsucursal')");

            if ($responable !== false) {
                // Obtener el último ID insertado
                $ultimoIdInsertado = $this->cm->insert_id;

                // Verificar si $almacenes no está vacío
                if (!empty($jsonProductos['listaProductos'])) {
                    // Insertar las asociaciones con almacenes
                    foreach ($jsonProductos['listaProductos'] as $producto) {
                        if (isset($producto['idproductoalmacen'])) {
                            $idproducto = $producto['idproductoalmacen'];
                            $cantidad = $producto['cantidad'];
                            $precio = $producto['precio'];
                            $this->cm->query("INSERT INTO detalle_cotizacion(id_detalle_cotizacion, cantidad, precio_unitario, productos_almacen_id_productos_almacen, cotizacion_id_cotizacion) values(NULL,'$cantidad','$precio','$idproducto','$ultimoIdInsertado')");
                        } else {
                            // Se encontró un problema con el objeto de almacenes
                            throw new Exception("No se pudo registrar los almacenes");
                        }
                    }
                } else {
                    // El objeto de almacenes está vacío
                    throw new Exception("El objeto de almacenes está vacío");
                }

                // Confirmar la transacción utilizando tu función personalizada
                $this->cm->commitTransaction();

                $res = array("estado" => "exito", "mensaje" => "Registro exitoso", "id" => $ultimoIdInsertado);
                echo json_encode($res);
            } else {
                // Error al intentar registrar
                throw new Exception("Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
        } catch (Exception $e) {
            // Revertir la transacción en caso de error utilizando tu función personalizada
            $this->cm->rollbackTransaction();

            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
        //echo json_encode($jsonProductos['idusuario']);
    }

    public function detallecotizacion($id, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $clien = $this->cm->query("select
            dco.id_detalle_cotizacion,
            pa.id_productos_almacen as idproductoalmacen,
            p.nombre,
            p.descripcion,
            p.caracteristicas,
            p.codigo as  codigoProducto,
            p.codigosin as codigoProductoSin,
            p.actividadsin as codigoActividadSin,
            p.unidadsin as unidadMedida,
            p.codigonandina as codigoNandina,
            dco.cantidad,
            dco.precio_unitario
            
        from detalle_cotizacion dco 
        LEFT join cotizacion co on dco.cotizacion_id_cotizacion=co.id_cotizacion
        LEFT join productos_almacen pa on dco.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT join productos p on pa.productos_id_productos=p.id_productos
        where dco.cotizacion_id_cotizacion='$id'
        order by p.nombre desc");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array(
                "id" => $qwe['id_detalle_cotizacion'],
                "idproductoalmacen" => $qwe['idproductoalmacen'],
                "producto" => $qwe['nombre'],
                "descripcion" => $qwe['descripcion'],
                "caracteristica" => $qwe['caracteristicas'],
                "codigoProducto" => $qwe['codigoProducto'],
                "codigoProductoSin" => $qwe['codigoProductoSin'],
                "codigoActividadSin" => $qwe['codigoActividadSin'],
                "unidadMedida" => $qwe['unidadMedida'],
                "codigoNandina" => $qwe['codigoNandina'],
                "cantidad" => $qwe['cantidad'],
                "precio" => $qwe['precio_unitario']);
            array_push($lista, $res);
        }

        $usuarios = $this->rh->query("SELECT u.idusuario, u.nombre, c.cargo FROM usuario u 
        LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
        LEFT JOIN cargos c ON t.cargos_idcargos=c.idcargos
        WHERE u.idempresa='$idempresa'");

        $usuarioInfo = [];
        while ($usuario = $this->rh->fetch($usuarios)) {
            $usuarioInfo[$usuario[0]] = array(
                "idusuario" => $usuario[0],
                "usuario" => $usuario[1],
                "cargo" => $usuario[2]
            );
        }

        $empresas = $this->em->query("SELECT * FROM organizacion WHERE idorganizacion='$idempresa'");

        $empresaInfo = [];
        while ($empresa = $this->em->fetch($empresas)) {
            $empresaInfo[$empresa[0]] = array(
                "id" => $empresa[0],
                "nombre" => $empresa[1],
                "celular" => $empresa[11],
                "email" => $empresa[8],
                "logo" => $empresa[13],
                "direccion" => $empresa[12]
            );
        }


        $lista2 = [];
        $alma = $this->cm->query("select 
        co.id_cotizacion,
        c.id_cliente as idcliente,
        c.nombre as cliente,
        c.nombrecomercial,
        s.id_sucursal as idsucursal,
        s.nombre as sucursal,
        co.fecha_cotizacion,
        c.direccion, 
        c.nit, 
        c.email, 
        co.monto_total, 
        co.descuento,
        co.id_usuario,
        d.nombre as divisa,
        d.monedasin 
        from cotizacion co
        inner join cliente c on co.cliente_id_cliente=c.id_cliente
        inner join sucursal s on co.idsucursal=s.id_sucursal
        inner join divisas d on co.divisas_id_divisas=d.id_divisas
        where co.id_cotizacion='$id'");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array(
                "id" => $qwe['id_cotizacion'],
                "cliente" => $qwe['cliente'],
                "idcliente" =>$qwe['idcliente'],
                "nombrecomercial" => $qwe['nombrecomercial'],
                "idsucursal" =>$qwe['idsucursal'],
                "sucursal" => $qwe['sucursal'],
                "fecha" => $qwe['fecha_cotizacion'],
                "direccion" => $qwe['direccion'],
                "nit" => $qwe['nit'],
                "email" => $qwe['email'],
                "montototal" => $qwe['monto_total'],
                "descuento" => $qwe['descuento'],
                "divisa" => $qwe['divisa'],
                "monedasin" => $qwe['monedasin'],
                "detalle" => array($lista),
                "usuario" => array($usuarioInfo[$qwe['id_usuario']]),
                "empresa" => array($empresaInfo[$idempresa]));
            array_push($lista2, $res);
        }

        echo json_encode($lista2);
    }
//detallesCotizacion
    public function listadoventas($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $clien = $this->cm->query("select v.id_venta, a.nombre, v.fecha_venta, c.nombre , c.nombrecomercial, c.ciudad, v.tipo_venta, v.tipo_pago, v.monto_total, v.nfactura, v.descuento, pa.almacen_id_almacen, v.cliente_id_cliente1, s.nombre, v.estado, ca.canal, vf.cuf, vf.fechaEmission, vf.shortLink, vf.urlSin from venta v 
        left join cliente c on v.cliente_id_cliente1=c.id_cliente
        left join detalle_venta dv on v.id_venta=dv.venta_id_venta
        left join sucursal s on v.idsucursal=s.id_sucursal
        left join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        left join almacen a on pa.almacen_id_almacen=a.id_almacen
        left join canalventa ca on v.idcanal=ca.idcanalventa
        left join ventas_facturadas vf on v.id_venta=vf.venta_id_venta
        where c.idempresa = '$idempresa'
        group by v.id_venta
        order by v.fecha_venta desc, v.id_venta desc");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array("id" => $qwe[0], "almacen" => $qwe[1], "fechaventa" => $qwe[2], "cliente" => $qwe[3], "nombrecomercial" => $qwe[4], "ciudad" => $qwe[5], "tipoventa" => $qwe[6], "tipopago" => $qwe[7], "montototal" => $qwe[8], "nfactura" => $qwe[9], "descuento" => $qwe[10], "idalmacen" => $qwe[11], "idcliente" => $qwe[12], "sucursal" => $qwe[13], "estado" => $qwe[14], "canal" => $qwe[15], "cuf" => $qwe[16], "fechaemision" => $qwe[17], "shortlink" => $qwe[18], "urlsin" => $qwe[19]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listadoanulaciones($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $clien = $this->cm->query("select a.idanulaciones, v.fecha_venta, c.nombre, c.nombrecomercial, c.ciudad, a.fecha, a.motivo, a.venta_id_venta, a.idusuario, v.nfactura, s.nombre, vf.cuf, vf.shortLink, vf.urlSin, v.tipo_venta, pa.almacen_id_almacen from anulaciones a 
        left join venta v on a.venta_id_venta=v.id_venta
        left join detalle_venta dv on v.id_venta=dv.venta_id_venta
        left join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        left join cliente c on v.cliente_id_cliente1=c.id_cliente
        left join sucursal s on v.idsucursal=s.id_sucursal
        left join ventas_facturadas vf on v.id_venta=vf.venta_id_venta
		where c.idempresa='$idempresa'
        group by a.idanulaciones
        order by a.fecha desc, a.idanulaciones desc");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array("id" => $qwe[0], "fechaventa" => $qwe[1], "cliente" => $qwe[2], "nombrecomercial" => $qwe[3], "ciudad" => $qwe[4], "fecharegistro" => $qwe[5], "motivo" => $qwe[6], "idventa" => $qwe[7], "idusuario" => $qwe[8], "nfactura" => $qwe[9], "sucursal" => $qwe[10], "cuf" => $qwe[11], "shortlink" => $qwe[12], "urlsin" => $qwe[13], "tipoventa" => $qwe[14], "idalmacen"=> $qwe[15]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function cambiarcreditomoroso($id, $code){
        $actualizacion = $this->cm->query("update estado_cobro SET estado='$code' where id_estado_cobro='$id'");
        if($actualizacion === TRUE){
            $res = array("success", "Se cambio el estado a moroso");
        }
        else {
            $res = array("danger", "No se pudo cambiar a moroso");
        }
        echo json_encode($res);
    }

    function registroCuentaXcobrar($npagos, $valorpago, $tipocredito, $idventa, $fechalimite, $saldo)
    {
        $res = "";
        $registro = $this->cm->query("insert into estado_cobro(id_estado_cobro,Ncuotas,valorcuotas,tipo_credito,estado,venta_id_venta,fecha_limite,saldo) VALUES(null,'$npagos','$valorpago','$tipocredito',1,'$idventa','$fechalimite','$saldo')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "La cuenta por cobrar de venta se registro con exito");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        return $res;
    }
//cotizacion
    function listaCuentasporCbrar($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $alma = $this->cm->query("select ec.id_estado_cobro, v.fecha_venta, concat(c.nombre , ' | ' ,  c.nombrecomercial, ' | ', c.ciudad) as cliente, ec.Ncuotas, ec.valorcuotas, ec.saldo, (v.monto_total+descuento), ec.fecha_limite, pa.almacen_id_almacen, 
        (select sum(dc.ncuotas) as ncuotas from detalle_cobro dc where dc.estado_cobro_id_estado_cobro=ec.id_estado_cobro) as cuotaspagadas, ec.estado, v.nfactura, v.estado, su.nombre, (select sum(dc.monto) as cobro from detalle_cobro dc where dc.estado_cobro_id_estado_cobro=ec.id_estado_cobro) as totalcobro from estado_cobro ec
                LEFT join venta v on ec.venta_id_venta=v.id_venta
                LEFT join cliente c on v.cliente_id_cliente1=c.id_cliente
                LEFT JOIN sucursal su ON v.idsucursal=su.id_sucursal
                LEFT join detalle_venta dv on v.id_venta=dv.venta_id_venta
                LEFT join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                where c.idempresa='$idempresa'
                group by ec.id_estado_cobro
                order by ec.id_estado_cobro DESC");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array("id" => $qwe[0], "fechaventa" => $qwe[1], "cliente" => $qwe[2], "ncuotas" => $qwe[3], "valorcuota" => $qwe[4], "saldo" => $qwe[5], "ventatotal" => $qwe[6], "fechalimite" => $qwe[7], "idalmacen" => $qwe[8], "cuotaspagas" => $qwe[9], "estado" => $qwe[10], "nfactura" => $qwe[11], "estadoventa" => $qwe[12], "sucursal" => $qwe[13], "totalcobrado" => $qwe[14]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function detallepagoscredito($id)
    {
        $lista = [];
        $alma = $this->cm->query("select * from detalle_cobro dc where dc.estado_cobro_id_estado_cobro='$id' order by dc.iddetalle_cobro desc");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "ncuotas" => $qwe[2], "valorcuota" => $qwe[3], "monto" => $qwe[4], "idestadocredito" => $qwe[5], "imagen" => $qwe[6]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registropagoscredito($fecha,$coutas,$valorcuota,$totalpagar,$saldo,$idestadocobro,$url){
        $res = "";
        $registro = $this->cm->query("insert into detalle_cobro(iddetalle_cobro, fecha_actual, ncuotas, valor_cuotas, monto, estado_cobro_id_estado_cobro,foto) VALUES(NULL,'$fecha','$coutas','$valorcuota','$totalpagar','$idestadocobro','$url')");
        if ($registro === TRUE) {
            if($saldo == 0){
                $actualizacion = $this->cm->query("update estado_cobro SET saldo='$saldo', estado=2 where id_estado_cobro='$idestadocobro'");
                if($actualizacion === TRUE){
                    $res = array("estado" => "exito", "mensaje" => "La cuenta por cobrar de venta se registro con exito");
                }
            }
            else{
                $actualizacion = $this->cm->query("update estado_cobro SET saldo='$saldo' where id_estado_cobro='$idestadocobro'");
                if($actualizacion === TRUE){
                    $res = array("estado" => "exito", "mensaje" => "La cuenta por cobrar de venta se registro con exito");
                }
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function listainventarioexterno($idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $alma = $this->cm->query("select  ie.id_inv_externo, ie.fecha_control, c.nombre, s.nombre, ie.observaciones, a.nombre, ie.idsucursal, ie.foto, ie.id_almacen, ie.cliente_id_cliente, ie.estado from inv_externo ie
        inner join sucursal s on ie.idsucursal=s.id_sucursal
        inner join cliente c on ie.cliente_id_cliente=c.id_cliente
        inner join almacen a on ie.id_almacen=a.id_almacen
        where c.idempresa='$idempresa'
        order by ie.id_inv_externo desc");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "nombre" => $qwe[2], "sucursal" => $qwe[3], "observaciones" => $qwe[4], "almacen" => $qwe[5], "idsucursal" => $qwe[6], "foto" => $qwe[7], "idalmacen" => $qwe[8], "idcliente" => $qwe[9], "estado" => $qwe[10]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registroinventarioexterno($fecha, $idcliente, $idsucursal, $observacion, $foto, $idalmacen, $idmd5)
    {
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $res = "";
        $registro = $this->cm->query("insert into inv_externo(id_inv_externo, fecha_control, cliente_id_cliente, idsucursal, observaciones, foto, idusuario, id_almacen, estado) VALUES(NULL,'$fecha','$idcliente','$idsucursal','$observacion','$foto','$idusuario','$idalmacen','2')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro con exitoso", "almacen" => $idalmacen);
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIdinvexterno($id)
    {
        $lista = [];
        $res = "";

        $consulta = $this->cm->query("SELECT inv.id_inv_externo, inv.fecha_control, inv.cliente_id_cliente, inv.idsucursal, inv.observaciones, inv.foto, inv.idusuario, inv.id_almacen, inv.estado, c.nombre, s.nombre FROM inv_externo inv 
        LEFT JOIN cliente c ON inv.cliente_id_cliente=c.id_cliente
        LEFT JOIN sucursal s ON inv.idsucursal=s.id_sucursal
        WHERE inv.id_inv_externo='$id'");

        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "idcliente" => $qwe[2], "idsucursal" => $qwe[3], "observacion" => $qwe[4], "foto" => $qwe[5], "idusuario" => $qwe[6], "idalmacen" => $qwe[7], "estado" => $qwe[8], "cliente" => $qwe[9], "sucursal" => $qwe[10]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarinventarioexterno($id, $fecha, $idcliente, $idsucursal, $observacion, $foto, $idalmacen)
    {
        $res = "";
        $registro = $this->cm->query("update inv_externo set fecha_control='$fecha', cliente_id_cliente='$idcliente', idsucursal=$idsucursal, observaciones='$observacion', foto='$foto', id_almacen='$idalmacen' where id_inv_externo='$id' ");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion con exitosa", "almacen" => $idalmacen);
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminarinventarioexterno($id)
    {
        $res = "";
        $registro = $this->cm->query("delete from inv_externo where id_inv_externo='$id' ");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Eliminacion exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cambiarestadoexternal($id, $estado)
    {
        $res = "";
        $registro = $this->cm->query("update inv_externo set estado='$estado' where id_inv_externo='$id' ");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function cancelarInventarioExterno($id){
        try {
            $registro = $this->cm->query("delete from detalle_invexterno where inv_externo_id_inv_externo='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Eliminacion exitoss");
            } else {
                $res = array("estado" => 101, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function listadoProductosInvExterno($idalmacen, $idinvexterno)
    {
        $lista = [];
        $registro = $this->cm->query("select pa.id_productos_almacen,p.codigo,p.cod_barras,p.nombre,p.descripcion,pa.pais,p.caracteristicas,pa.stock_minimo,s.cantidad,pa.fecha_registro,al.id_almacen,pa.estado,pa.stock_maximo
        from productos_almacen as pa
        inner join almacen as al ON pa.almacen_id_almacen=al.id_almacen
        inner join productos as p ON pa.productos_id_productos=p.id_productos
        inner join stock as s  ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen and s.estado='1'
        where pa.almacen_id_almacen='$idalmacen'
        order by pa.id_productos_almacen DESC");
        while ($qwe = $this->cm->fetch($registro)) {
            $res = array("idproductoalmacen" => $qwe[0], "codigo" => $qwe[1], "codbarras" => $qwe[2], "nombre" => $qwe[3], "descripcion" => $qwe[4], "pais" => $qwe[5], "caracteristica" => $qwe[6], "stockMin" => $qwe[7], "stock" => $qwe[8], "fecha" => $qwe[9], "idalmacen" => $qwe[10], "estado" => $qwe[11], "stockMax" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function detalleinventarioexterno($idinventarioexterno)
    {
        $lista = [];
        $alma = $this->cm->query("select  di.id_detalle_invexterno, p.nombre, c.nombre, p.caracteristicas, p.descripcion, m.nombre_medida, ep.tipos_estado, u.nombre, di.cantidad, di.fechavencimiento, di.inv_externo_id_inv_externo, p.codigo from detalle_invexterno di
        left join productos_almacen pa on di.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        left join productos p on pa.productos_id_productos=p.id_productos
        left join categorias c on p.categorias_id_categorias=c.id_categorias
        left join medida m on p.medida_id_medida=m.id_medida
        left join estados_productos ep on p.estados_productos_id_estados_productos=ep.id_estados_productos
        left join unidad u on p.unidad_id_unidad=u.id_unidad
        where di.inv_externo_id_inv_externo='$idinventarioexterno'
        order by di.id_detalle_invexterno desc");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array("id" => $qwe[0], "producto" => $qwe[1], "categoria" => $qwe[2], "caracteristica" => $qwe[3], "descripcion" => $qwe[4], "medida" => $qwe[5], "estadoproducto" => $qwe[6], "unidad" => $qwe[7], "cantidad" => $qwe[8], "fechavencimiento" => $qwe[9], "idinventarioexterno" => $qwe[10], "codigo" => $qwe[11]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function registrodetalleinventarioexterno($idproducto, $fechaven, $cantidad, $idinventarioexterno)
    {
        $res = "";
        $registro = $this->cm->query("insert into detalle_invexterno(id_detalle_invexterno, productos_almacen_id_productos_almacen, fechavencimiento, cantidad, inv_externo_id_inv_externo) values(null,'$idproducto','$fechaven','$cantidad','$idinventarioexterno')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro con exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIddetalleinvexterno($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT di.id_detalle_invexterno, di.productos_almacen_id_productos_almacen, di.fechavencimiento, di.cantidad, p.codigo, p.descripcion FROM detalle_invexterno di
        LEFT JOIN productos_almacen pa ON di.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        WHERE di.id_detalle_invexterno = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "idproductoalmacen" => $qwe[1], "fecha" => $qwe[2], "cantidad" => $qwe[3], "codigo" => $qwe[4], "descripcion" => $qwe[5]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editardetalleinventarioexterno($id, $idproductoalmacen, $fechaven, $cantidad)
    {
        $res = "";
        $registro = $this->cm->query("update detalle_invexterno set productos_almacen_id_productos_almacen='$idproductoalmacen', fechavencimiento='$fechaven', cantidad='$cantidad' where id_detalle_invexterno='$id'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion con exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminardetalleinventarioexterno($id)
    {
        $res = "";
        $registro = $this->cm->query("delete from detalle_invexterno where id_detalle_invexterno=$id");
        if ($registro === TRUE) {

            $res = array("success", "Se elimino Correctamente");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function registromerma($almacen,$fecha,$descripcion,$idmd5){
        $res="";
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $registro=$this->cm->query("insert into mermas_desperdicios(id_mermas_desperdicios,fecha_informe,descripcion,almacen_id_almacen,autorizacion,idusuario)value(NULL,'$fecha','$descripcion','$almacen','2','$idusuario')");
        if($registro !== null){
            $res=array("estado" => "exito", "mensaje" => "Registro exitoso", "almacen" => $almacen);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }
    public function eliminarmerma($dato){
        $res="";
        $registro=$this->cm->query("delete from mermas_desperdicios where id_mermas_desperdicios='$dato'");
        if($registro !== null){
            $this->cm->query("delete from detalle_mermas where mermas_desperdicios_id_mermas_desperdicios='$dato'");
            $res=array("estado" => "exito", "mensaje" => "Eliminación exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdmerma($id)
    {
        $lista = [];
        $res = "";
    
        $consulta = $this->cm->query("select * from mermas_desperdicios WHERE id_mermas_desperdicios = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "descripcion" => $qwe[2], "idalmacen" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarmerma($idmermas,$almacen,$fecha,$descripcion){
        $res="";
        $registro=$this->cm->query("update mermas_desperdicios SET fecha_informe='$fecha',descripcion='$descripcion',almacen_id_almacen='$almacen' where id_mermas_desperdicios='$idmermas'");
        if($registro !== null){
            $this->cm->query("delete from detalle_mermas where mermas_desperdicios_id_mermas_desperdicios='$idmermas'");
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacen" => $almacen);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
        
    }

    public function listamermas($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("estado" => "", "mensaje" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT me.id_mermas_desperdicios, me.fecha_informe, me.descripcion, me.almacen_id_almacen, me.autorizacion, a.nombre FROM mermas_desperdicios me 
        LEFT JOIN almacen a ON me.almacen_id_almacen=a.id_almacen
        WHERE a.idempresa = '$idempresa' and a.estado = 1
        ORDER BY me.id_mermas_desperdicios DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "descripcion" => $qwe[2], "idalmacen" => $qwe[3], "autorizacion" => $qwe[4], "almacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function cambiarestadomerma($id,$estado){
        $fecha = date("Y-m-d");
        $codigo = "MER";
        $res="";
        $registro=$this->cm->query("update mermas_desperdicios SET autorizacion='$estado' where id_mermas_desperdicios='$id'");
        $nuevostock=$this->cm->query("select dm.productos_almacen_id_productos_almacen, (s.cantidad - dm.cantidad) as nuevo from detalle_mermas dm
        inner join productos_almacen pa on dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join stock as s on pa.id_productos_almacen=s.productos_almacen_id_productos_almacen 
        where dm.mermas_desperdicios_id_mermas_desperdicios='$id' and s.estado=1");
        while($stock=$this->cm->fetch($nuevostock)){
            $cambioestado = $this->cm->query("update stock set estado=2 where productos_almacen_id_productos_almacen='$stock[0]' and estado=1 order by id_stock desc limit 1");
            if($cambioestado === TRUE){
                $registrostock=$this->cm->query("insert into stock(id_stock,cantidad,fecha,codigo,estado,productos_almacen_id_productos_almacen) value(null,'$stock[1]','$fecha','$codigo',1,'$stock[0]')");
            }
        }
        if($registro===TRUE){
            $res=array("success","Se registro Correctamente");
        }else{
            $res=array("danger","No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function listaProductomerma($idmerma, $idalmacen) {
        $lista = [];
        
        $consulta = $this->cm->query("select pa.id_productos_almacen,p.codigo,p.cod_barras,p.nombre,p.descripcion,pa.pais,p.caracteristicas,pa.stock_minimo,s.cantidad,pa.fecha_registro,al.id_almacen,pa.estado,pa.stock_maximo
        from productos_almacen as pa
        inner join almacen as al ON pa.almacen_id_almacen=al.id_almacen
        inner join productos as p ON pa.productos_id_productos=p.id_productos
        inner join stock as s  ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen and s.estado='1'
        where pa.almacen_id_almacen='$idalmacen' and pa.id_productos_almacen not in (select dm.productos_almacen_id_productos_almacen from detalle_mermas dm where dm.mermas_desperdicios_id_mermas_desperdicios='$idmerma')
        order by pa.id_productos_almacen DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("idproductoalmacen" => $qwe[0], "codigo" => $qwe[1], "codbarras" => $qwe[2], "nombre" => $qwe[3], "descripcion" => $qwe[4], "pais" => $qwe[5], "caracteristica" => $qwe[6], "stockMin" => $qwe[7], "stock" => $qwe[8], "fecha" => $qwe[9], "idalmacen" => $qwe[10], "estado" => $qwe[11], "stockMax" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function detallemerma($id)
    {
        $lista = [];
        $alma = $this->cm->query("select dm.id_detalle_mermas,p.nombre,p.codigo,p.descripcion,p.caracteristicas,dm.cantidad from detalle_mermas dm
        inner join productos_almacen pa on dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos p on pa.productos_id_productos=p.id_productos
        where dm.mermas_desperdicios_id_mermas_desperdicios='$id'
        order by dm.mermas_desperdicios_id_mermas_desperdicios desc");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array("id" => $qwe[0], "producto" => $qwe[1], "codigo" => $qwe[2], "descripcion" => $qwe[3], "caracteristica" => $qwe[4], "cantidad" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function cancelarMerma($id){
        try {
            $registro = $this->cm->query("delete from detalle_mermas where mermas_desperdicios_id_mermas_desperdicios='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Eliminacion exitoss");
            } else {
                $res = array("estado" => 101, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function registrodetallemerma($idmerma,$cantidad,$productoalmacen)
    {
        $res = "";
        $registro = $this->cm->query("insert into detalle_mermas(id_detalle_mermas,cantidad,mermas_desperdicios_id_mermas_desperdicios,productos_almacen_id_productos_almacen)value(NULL,'$cantidad','$idmerma','$productoalmacen')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro con exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIddetallemerma($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT dm.id_detalle_mermas, dm.cantidad, dm.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, s.cantidad FROM detalle_mermas dm
        LEFT JOIN productos_almacen pa ON dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock s ON dm.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE s.estado = 1 AND dm.id_detalle_mermas = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "cantidad" => $qwe[1], "idproductoalmacen" => $qwe[2], "codigo" => $qwe[3], "descripcion" => $qwe[4], "stock" => $qwe[5]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editardetallemerma($id, $idproductoalmacen, $cantidad)
    {
        $res = "";
        $registro = $this->cm->query("update detalle_mermas set cantidad='$cantidad', productos_almacen_id_productos_almacen='$idproductoalmacen' where id_detalle_mermas='$id'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion con exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminardetallemerma($id)
    {
        $res = "";
        $registro = $this->cm->query("delete from detalle_mermas where id_detalle_mermas='$id'");
        if ($registro === TRUE) {

            $res = array("success", "Se elimino Correctamente");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function registrorobo($almacen,$fecha,$descripcion,$idmd5){
        try {
            $res = "";
            $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
            $registro = $this->cm->query("insert into robos(id_robos,fecha_registro,descripcion,almacen_id_almacen,autorizacion,idusuario)value(NULL,'$fecha','$descripcion','$almacen','2','$idusuario')");
            if ($registro !== null) {
                $res = array("estado" => "exito", "mensaje" => "Registro exitoso", "almacen" => $almacen);
            } else {
                $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }
    public function eliminarrobo($dato){
        $res="";
        $registro=$this->cm->query("delete from robos where id_robos='$dato'");
        if($registro !== null){
            $this->cm->query("delete from detalle_robo where robos_id_robos='$dato'");
            $res=array("estado" => "exito", "mensaje" => "Eliminación exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIdrobo($id)
    {
        $lista = [];
        $res = "";
    
        $consulta = $this->cm->query("select * from robos WHERE id_robos = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "fecha" => $qwe[1], "descripcion" => $qwe[2], "idalmacen" => $qwe[3]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editarrobo($id,$almacen,$fecha,$descripcion){
        $res="";
        $registro=$this->cm->query("update robos SET fecha_registro='$fecha',descripcion='$descripcion',almacen_id_almacen='$almacen'  where id_robos='$id'");
        if($registro !== null){
            $this->cm->query("delete from detalle_mermas where mermas_desperdicios_id_mermas_desperdicios='$id'");
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa", "almacen" => $almacen);
        }else{
            $res=array("estado" => "error", "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
        
    }

    public function listarobo($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("estado" => "", "mensaje" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT ro.id_robos, ro.fecha_registro, ro.descripcion, ro.almacen_id_almacen, ro.autorizacion, a.nombre FROM robos ro 
        LEFT JOIN almacen a ON ro.almacen_id_almacen=a.id_almacen
        WHERE a.idempresa='$idempresa' AND a.estado=1
        ORDER BY ro.id_robos DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "descripcion" => $qwe[2], "idalmacen" => $qwe[3], "autorizacion" => $qwe[4], "almacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function cambiarestadorobo($id,$estado){
        $fecha = date("Y-m-d");
        $codigo = "EXT";
        $res="";
        $registro=$this->cm->query("update robos SET autorizacion='$estado' where id_robos='$id'");
        $nuevostock=$this->cm->query("select dr.productos_almacen_id_productos_almacen, (s.cantidad - dr.cantidad) as nuevo from detalle_robo dr
        inner join productos_almacen pa on dr.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join stock as s on pa.id_productos_almacen=s.productos_almacen_id_productos_almacen 
        where dr.robos_id_robos='$id' and s.estado=1");
        while($stock=$this->cm->fetch($nuevostock)){
            $cambioestado = $this->cm->query("update stock set estado=2 where productos_almacen_id_productos_almacen='$stock[0]' and estado=1");
            if($cambioestado === TRUE){
                $registrostock=$this->cm->query("insert into stock(id_stock,cantidad,fecha,codigo,estado,productos_almacen_id_productos_almacen) value(null,'$stock[1]','$fecha','$codigo',1,'$stock[0]')");
            }
        }
        if($registro===TRUE){
            $res=array("estado" => "exito", "mensaje" => "Actualización exitosa");
        }else{
            $res=array("estado" => "error", "mensaje" => "Actualización fallo");
        }
        echo json_encode($res);
    }

    public function listaProductorobo($idrobo, $idalmacen) {
        $lista = [];
        
        $consulta = $this->cm->query("select pa.id_productos_almacen,p.codigo,p.cod_barras,p.nombre,p.descripcion,pa.pais,p.caracteristicas,pa.stock_minimo,s.cantidad,pa.fecha_registro,al.id_almacen,pa.estado,pa.stock_maximo
        from productos_almacen as pa
        inner join almacen as al ON pa.almacen_id_almacen=al.id_almacen
        inner join productos as p ON pa.productos_id_productos=p.id_productos
        inner join stock as s  ON pa.id_productos_almacen=s.productos_almacen_id_productos_almacen and s.estado='1'
        where pa.almacen_id_almacen='$idalmacen' and pa.id_productos_almacen not in (select dr.productos_almacen_id_productos_almacen from detalle_robo dr where dr.robos_id_robos='$idrobo')
        order by pa.id_productos_almacen DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("idproductoalmacen" => $qwe[0], "codigo" => $qwe[1], "codbarras" => $qwe[2], "nombre" => $qwe[3], "descripcion" => $qwe[4], "pais" => $qwe[5], "caracteristica" => $qwe[6], "stockMin" => $qwe[7], "stock" => $qwe[8], "fecha" => $qwe[9], "idalmacen" => $qwe[10], "estado" => $qwe[11], "stockMax" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function detallerobo($id)
    {
        $lista = [];
        $alma = $this->cm->query("select dm.id_detalle_robo,p.nombre,p.codigo,p.descripcion,p.caracteristicas,dm.cantidad from detalle_robo dm
        inner join productos_almacen pa on dm.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos p on pa.productos_id_productos=p.id_productos
        where dm.robos_id_robos='$id'
        order by dm.id_detalle_robo DESC");
        while ($qwe = $this->cm->fetch($alma)) {
            $res = array("id" => $qwe[0], "producto" => $qwe[1], "codigo" => $qwe[2], "descripcion" => $qwe[3], "caracteristica" => $qwe[4], "cantidad" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function cancelarRobo($id){
        try {
            $registro = $this->cm->query("delete from detalle_robo where robos_id_robos='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Eliminacion exitoss");
            } else {
                $res = array("estado" => 101, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => 101, "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function registrodetallerobo($idrobos,$cantidad,$productoalmacen)
    {
        $res = "";
        $registro = $this->cm->query("insert into detalle_robo(id_detalle_robo,cantidad,robos_id_robos,productos_almacen_id_productos_almacen)value(NULL,'$cantidad','$idrobos','$productoalmacen')");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Registro con exitoso");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function verificarIddetallerobo($id)
    {
        $res = "";
    
        $consulta = $this->cm->query("SELECT dr.id_detalle_robo, dr.cantidad, dr.productos_almacen_id_productos_almacen, p.codigo, p.descripcion, s.cantidad FROM detalle_robo dr
        LEFT JOIN productos_almacen pa ON dr.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
        LEFT JOIN stock s ON dr.productos_almacen_id_productos_almacen=s.productos_almacen_id_productos_almacen
        WHERE s.estado = 1 AND  dr.id_detalle_robo = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "cantidad" => $qwe[1], "idproductoalmacen" => $qwe[2], "codigo" => $qwe[3], "descripcion" => $qwe[4], "stock" => $qwe[5]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editardetallerobo($id, $idproductoalmacen, $cantidad)
    {
        $res = "";
        $registro = $this->cm->query("update detalle_robo set cantidad='$cantidad', productos_almacen_id_productos_almacen='$idproductoalmacen' where id_detalle_robo='$id'");
        if ($registro !== null) {
            $res = array("estado" => "exito", "mensaje" => "Actualizacion con exitosa");
        } else {
            $res = array("estado" => "error", "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);
    }

    public function eliminardetallerobo($id)
    {
        $res = "";
        $registro = $this->cm->query("delete from detalle_robo where id_detalle_robo='$id'");
        if ($registro === TRUE) {

            $res = array("success", "Se elimino Correctamente");
        } else {
            $res = array("danger", "No se pudo registrar");
        }
        echo json_encode($res);
    }

    public function listadevolucion($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("estado" => "", "mensaje" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT de.id_devoluciones, de.autorizacion, de.fecha_devolucion, de.motivo, de.venta_id_venta, v.fecha_venta, c.nombre, c.nombrecomercial, c.nit, s.nombre, vf.numeroFactura, vf.cuf, vf.shortLink, vf.urlSin, v.tipo_venta, pa.almacen_id_almacen, c.ciudad, v.nfactura FROM devoluciones de  
        LEFT JOIN venta v ON de.venta_id_venta=v.id_venta
        LEFT JOIN cliente c ON v.cliente_id_cliente1=c.id_cliente
        LEFT JOIN sucursal s ON v.idsucursal=s.id_sucursal
        LEFT JOIN ventas_facturadas vf ON v.id_venta=vf.venta_id_venta
        LEFT JOIN detalle_venta dv ON v.id_venta=dv.venta_id_venta
        LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        WHERE c.idempresa = '$idempresa'
        GROUP BY de.id_devoluciones
        ORDER BY de.id_devoluciones DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "autorizacion" => $qwe[1], "fechadevolucion" => $qwe[2], "motivo" => $qwe[3], "idventa" => $qwe[4], "fechaventa" => $qwe[5], "cliente" => $qwe[6], "nombrecomercial" => $qwe[7], "nrodoc" => $qwe[8], "sucursal" => $qwe[9], "nrofactura" => $qwe[10], "cuf" => $qwe[11], "shortlink" => $qwe[12], "urlsin" => $qwe[13], "tipoventa" => $qwe[14], "idalmacen" => $qwe[15], "ciudad" => $qwe[16], "nfactura" => $qwe[17]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function verificardevolucion($id)
    {
        $res = "";
        try {
            $consulta = $this->cm->query("SELECT id_devoluciones FROM devoluciones WHERE venta_id_venta = '$id' AND autorizacion = '2' ORDER BY id_devoluciones DESC LIMIT 1");
            if ($consulta) {
                if ($consulta->num_rows > 0) {
                    $qwe = $this->cm->fetch($consulta);
                    $res = array("estado" => 100, "codigo" => 1, "id" => $qwe[0]);
                } else {
                    $res = array("estado" => 100, "codigo" => 2);
                }
                echo json_encode($res);
            }
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function registrodevolucion($motivo, $idventa, $idmd5)
    {
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d H:i:s");
        $res = "";
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        try {
            $consulta = $this->cm->query("SELECT id_devoluciones FROM devoluciones WHERE venta_id_venta = '$idventa' AND autorizacion = '2' ORDER BY id_devoluciones DESC LIMIT 1");
            if ($consulta) {
                if ($consulta->num_rows > 0) {
                    $qwe = $this->cm->fetch($consulta);
                    $res = array("estado" => 100, "codigo" => 1, "id" => $qwe[0]);
                } else {
                    $registro = $this->cm->query("INSERT INTO devoluciones(id_devoluciones, autorizacion, fecha_devolucion, motivo, venta_id_venta, idusuario)value(NULL,'2','$fecha','$motivo','$idventa','$idusuario')");
                    $iddev = $this->cm->insert_id;
                    if ($registro !== null && $iddev) {
                        $listaventa = $this->cm->query("SELECT * FROM detalle_venta WHERE venta_id_venta = '$idventa'");
                        if ($listaventa) {
                            if ($listaventa->num_rows > 0) {
                                while ($qwe = $this->cm->fetch($listaventa)) {
                                    $registroDetalle = $this->cm->query("INSERT INTO detalle_devolucion(iddetalle_devolucion, cantidad, precio, perdida, cantidadperdida, devoluciones_iddevoluciones, producto_almacen_id_producto_almacen) VALUES (NULL,'$qwe[1]','$qwe[2]','2','0','$iddev','$qwe[3]')");
                                }
                                $res = array("estado" => 100, "mensaje" => "Registro exitoso", "id" => $iddev, "codigo" => 2);
                            }
                        } else {
                            $res = array("estado" => 99, "mensaje" => "No se pudo encontrar la venta");
                        }
                    } else {
                        $res = array("estado" => 99, "mensaje" => "Error al intentar registrar. Por favor, inténtalo de nuevo");
                    }
                }
                echo json_encode($res);
            }
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function eliminardevolucion($dato){
        $res="";
        $registro=$this->cm->query("delete from devoluciones where id_devoluciones='$dato'");
        if($registro !== null){
            $this->cm->query("delete from detalle_devolucion where devoluciones_iddevoluciones='$dato'");
            $res=array("estado" => 100, "mensaje" => "Eliminación exitosa");
        }else{
            $res=array("estado" => 99, "mensaje" => "Error al intentar eliminar. Por favor, inténtalo de nuevo");
        }
        echo json_encode($res);  
    }

    public function verificarIddevolucion($id)
    {
        $lista = [];
        $res = "";
    
        $consulta = $this->cm->query("SELECT dve.iddetalle_devolucion, dve.cantidad, dve.precio, dve.perdida, dve.cantidadperdida, dve.devoluciones_iddevoluciones, dve.producto_almacen_id_producto_almacen, p.nombre, p.codigo, p.descripcion FROM detalle_devolucion dve 
        LEFT JOIN productos_almacen pa ON dve.producto_almacen_id_producto_almacen = pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
        WHERE dve.iddetalle_devolucion = '$id'");
    
        if ($consulta) {
            if ($consulta->num_rows > 0) {
                $res = array("estado" => "exito", "mensaje" => "ID encontrado");
                while ($qwe = $this->cm->fetch($consulta)) {
                    $res['datos'] = array("id" => $qwe[0], "cantidad" => $qwe[1], "precio" => $qwe[2], "perdida" => $qwe[3], "cantidadperdida" => $qwe[4], "iddevolucion" => $qwe[5], "idproductoalmacen" => $qwe[6], "nombre" => $qwe[7], "codigo" => $qwe[8], "descripcion" => $qwe[9]);
                }
                echo json_encode($res);
            } else {
                $res = array("estado" => "error", "mensaje" => "El registro no existe.");
                echo json_encode($res);
            }
        } else {
            $res = array("estado" => "error", "mensaje" => "La consulta no funcionó o no está bien planteada, comuníquese con el administrador");
            echo json_encode($res);
        }
    }

    public function editardevolucion($id, $cantidad, $perdida, $cantidadperdida)
    {
        try {
            $res = "";
            $registro = $this->cm->query("update detalle_devolucion SET cantidad='$cantidad',perdida='$perdida',cantidadperdida='$cantidadperdida'  where iddetalle_devolucion='$id'");
            if ($registro !== null) {
                $res = array("estado" => 100, "mensaje" => "Actualización exitosa");
            } else {
                $res = array("estado" => 99, "mensaje" => "Error al intentar actualizar. Por favor, inténtalo de nuevo");
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function cambiarestadodevolucion($id, $estado, $idmd5u)
    {
        date_default_timezone_set('America/La_Paz');
        $fecha = date("Y-m-d");
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5u);
        $con = 0;
        $res = array("devolucion" => array(), "perdidas" => array(), "estado" => "");
        try {
            $registro = $this->cm->query("update devoluciones SET autorizacion='$estado' where id_devoluciones='$id'");
            if ($registro) {
                $nuevostock = $this->cm->query("select dv.producto_almacen_id_producto_almacen, (s.cantidad + dv.cantidad) as nuevo from detalle_devolucion dv
                LEFT JOIN  productos_almacen pa on dv.producto_almacen_id_producto_almacen = pa.id_productos_almacen
                LEFT JOIN stock as s on pa.id_productos_almacen = s.productos_almacen_id_productos_almacen 
                WHERE dv.devoluciones_iddevoluciones = '$id' and s.estado = '1'");
                while ($stock = $this->cm->fetch($nuevostock)) {
                    $cambioestado = $this->cm->query("update stock set estado=2 where productos_almacen_id_productos_almacen='$stock[0]' and estado=1");
                    if ($cambioestado === TRUE) {
                        $registrostock = $this->cm->query("insert into stock(id_stock,cantidad,fecha,codigo,estado,productos_almacen_id_productos_almacen) value(null,'$stock[1]','$fecha','DEV',1,'$stock[0]')");
                    }
                }
                $zxc = array("estado" => 100, "mensaje" => "Todos los productos seleccionados tienen nuevo stock");
                $res['devolucion'] = $zxc;
            }


            $merma = $this->cm->fetch($this->cm->query("SELECT COUNT(perdida) AS merma FROM detalle_devolucion WHERE perdida = '1' AND devoluciones_iddevoluciones = '$id'"));
            if ($merma[0] > 0) {

                $this->cm->begin_transaction();

                $dev = $this->cm->fetch($this->cm->query("SELECT d.id_devoluciones, d.autorizacion, d.fecha_devolucion, d.motivo, d.venta_id_venta, d.idusuario, pa.almacen_id_almacen FROM devoluciones d 
                LEFT JOIN detalle_venta dve ON d.venta_id_venta=dve.venta_id_venta
                LEFT JOIN productos_almacen pa ON dve.productos_almacen_id_productos_almacen=pa.id_productos_almacen
                WHERE d.id_devoluciones = '$id'"));

                $detallePerdida = $this->cm->query("SELECT dv.iddetalle_devolucion, dv.cantidad, dv.precio, dv.perdida, dv.cantidadperdida, dv.devoluciones_iddevoluciones, dv.producto_almacen_id_producto_almacen FROM detalle_devolucion dv 
                WHERE dv.devoluciones_iddevoluciones = '$id'");

                if ($dev) {

                    $nuevamerma = $this->cm->query("INSERT INTO mermas_desperdicios(id_mermas_desperdicios, fecha_informe, descripcion, almacen_id_almacen, autorizacion, idusuario, devoluciones_id_devoluciones) VALUES (NULL,'$fecha','$dev[3]','$dev[6]','1','$idusuario','$dev[0]')");

                    if ($nuevamerma) {

                        $ultimoID = $this->cm->insert_id;

                        if ($ultimoID) {

                            while ($qwe = $this->cm->fetch($detallePerdida)) {

                                if ($qwe[3] == 1) {

                                    $detmerma = $this->cm->query("INSERT INTO detalle_mermas(id_detalle_mermas,cantidad,mermas_desperdicios_id_mermas_desperdicios,productos_almacen_id_productos_almacen) VALUES (NULL,'$qwe[4]','$ultimoID','$qwe[6]')");
                                    $idmerma = $this->cm->insert_id;

                                    if ($idmerma) {

                                        $stock = $this->cm->fetch($this->cm->query("SELECT cantidad FROM stock WHERE productos_almacen_id_productos_almacen = '$qwe[6]' AND estado = '1' ORDER BY id_stock DESC LIMIT 1"));
                                        $cambiarstock = $this->cm->query("UPDATE stock SET estado='2' WHERE productos_almacen_id_productos_almacen = '$qwe[6]' ORDER BY id_stock DESC LIMIT 1");

                                        if ($cambiarstock && $this->cm->affected_rows > 0) {
                                            $nuevaCantidad = $stock[0] - $qwe[4];
                                            $nuevostock = $this->cm->query("INSERT INTO stock(id_stock,cantidad,fecha,codigo,estado,productos_almacen_id_productos_almacen) VALUES (NULL, '$nuevaCantidad', '$fecha', 'MER', '1', '$qwe[6]')");

                                            if ($nuevostock && $this->cm->affected_rows > 0) {
                                                $con++;
                                            } else {
                                                $this->cm->rollbackTransaction();
                                                $res = array("estado" => 101, "mensaje" => $this->cm->error, "codigo" => $this->cm->errno);
                                            }
                                        } else {
                                            $this->cm->rollbackTransaction();
                                            $res = array("estado" => 101, "mensaje" => $this->cm->error, "codigo" => $this->cm->errno);
                                        }
                                    } else {
                                        $this->cm->rollbackTransaction();
                                        $res = array("estado" => 101, "mensaje" => $this->cm->error, "codigo" => $this->cm->errno);
                                    }
                                }
                            }
                            if ($merma[0] == $con) {
                                $xcv = array("estado" => 100, "mensaje" => "Todos los productos seleccionados tienen nuevo stock");
                                $res['perdidas'] = $xcv;
                            } else {
                                $this->cm->rollbackTransaction();
                                $res = array("estado" => 101, "mensaje" => $this->cm->error, "codigo" => $this->cm->errno);
                            }
                        } else {
                            $this->cm->rollbackTransaction();
                            $res = array("estado" => 101, "mensaje" => $this->cm->error, "codigo" => $this->cm->errno);
                        }
                    } else {
                        $res = array("estado" => 101, "mensaje" => $this->cm->error, "codigo" => $this->cm->errno);
                    }
                }
            }
            // Confirmar la transacción utilizando tu función personalizada
            $this->cm->commitTransaction();
            $consulta = $this->cm->query("SELECT venta_id_venta FROM devoluciones WHERE id_devoluciones = '$id' AND autorizacion = '1' ORDER BY id_devoluciones DESC LIMIT 1");
            if ($consulta) {
                if ($consulta->num_rows > 0) {
                    $qwe = $this->cm->fetch($consulta);
                    $venta = $this->cm->query("UPDATE venta SET estado = '3' WHERE id_venta = '$qwe[0]'");
                } else {
                    $res = array("estado" => 100, "codigo" => 2);
                }
                $res['estado'] = 100;
            }
            echo json_encode($res);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }

    public function listadetalledevolucion($id)
    {
        $lista = [];
        $consulta = $this->cm->query("SELECT dve.iddetalle_devolucion, dve.cantidad, dve.precio, dve.perdida, dve.cantidadperdida, dve.devoluciones_iddevoluciones, dve.producto_almacen_id_producto_almacen, p.nombre, p.codigo, p.descripcion FROM detalle_devolucion dve 
        LEFT JOIN productos_almacen pa ON dve.producto_almacen_id_producto_almacen = pa.id_productos_almacen
        LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
        WHERE dve.devoluciones_iddevoluciones = '$id'
        ORDER BY dve.iddetalle_devolucion DESC");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("id" => $qwe[0], "cantidad" => $qwe[1], "precio" => $qwe[2], "perdida" => $qwe[3], "cantidadperdida" => $qwe[4], "iddevolucion" => $qwe[5], "idproductoalmacen" => $qwe[6], "nombre" => $qwe[7], "codigo" => $qwe[8], "descripcion" => $qwe[9]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function listaVentasContabilidad($idmd5){
        try {
            $lista = [];
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
            $consulta = $this->cm->query("SELECT v.id_venta, v.fecha_venta, v.cliente_id_cliente1, c.nombre, c.nombrecomercial, c.tipodocumento, c.nit, v.tipo_venta, v.tipo_pago, v.nfactura, v.descuento, v.monto_total, ROUND((v.descuento + v.monto_total),2) as venta, vf.cuf, v.estado FROM venta v 
            LEFT JOIN ventas_facturadas vf ON v.id_venta = vf.venta_id_venta
            LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
            WHERE c.idempresa = '$idempresa'
            ORDER BY v.fecha_venta DESC");
            while ($qwe = $this->cm->fetch($consulta)) {
                $res = array("id" => $qwe[0], "fecha" => $qwe[1], "idcliente" => $qwe[2], "razonsocial" => $qwe[3], "nombrecomercial" => $qwe[4], "tipodocumento" => $qwe[5], "nit" => $qwe[6], "tipoventa" => $qwe[7], "tipopago" => $qwe[8], "nrofactura" => $qwe[9], "descuento" => $qwe[10], "montototal" => $qwe[10], "total" => $qwe[11], "cuf" => $qwe[12], "estado" => $qwe[13]);
                array_push($lista, $res);
            }
        echo json_encode($lista);
        } catch (Exception $e) {
            $res = array("estado" => "error", "mensaje" => $e->getMessage());
            echo json_encode($res);
        }
    }
}

//detallecotizacion