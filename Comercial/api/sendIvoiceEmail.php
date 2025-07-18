<?php
require 'vendor/autoload.php';
require_once "../db/conexion.php";
require_once "funciones.php";
require_once "facturacion.php";
require_once "logErrores.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;


class SendInvoiceEmail
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $em;
    private $logger;
    private $maxFileSize = 5242880; // 5MB en bytes

    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        $this->logger = new LogErrores();
    }

    public function sendEmail($recipientEmail, $invoiceNumber, $clientName, $nombreEmpresa, $direccionEmpresa, $telefonoEmpresa, $idmd5)
    {
        // Validación básica de parámetros
        if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['estado' => 'error', 'message' => 'El correo del destinatario no es válido']);
            return;
        }

        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if (!$idempresa) {
            http_response_code(400);
            echo json_encode(['estado' => 'error', 'message' => 'ID de empresa no válido']);
            return;
        }

        // Verificar archivo PDF
        if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['estado' => 'error', 'message' => 'No se ha subido correctamente el archivo PDF']);
            return;
        }

        // Validar tipo y tamaño del archivo
        $pdfFile = $_FILES['pdf'];
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($fileInfo, $pdfFile['tmp_name']);
        finfo_close($fileInfo);

        if ($mimeType !== 'application/pdf' || $pdfFile['size'] > $this->maxFileSize) {
            http_response_code(400);
            echo json_encode(['estado' => 'error', 'message' => 'El archivo debe ser un PDF válido y no mayor a 5MB']);
            return;
        }

        // Obtener credenciales
        $credencial = $this->obtenerCredencialEmpresa();
        if (!$credencial) {
            $this->logger->registrar(
                "EnvioCorreoFactura",
                "error",
                "No se pudo obtener la credencial de correo de la empresa para el ID: " . $idempresa,
                compact('idempresa'),
                null,
                $idempresa
            );
            http_response_code(500);
            echo json_encode(['estado'=> 'error','message' => 'Error de configuración: No se pudo obtener la credencial de correo de la empresa.']);
            return;
        }

        list($mypass, $myEmail) = $credencial;

        try {
            $pdfContent = file_get_contents($pdfFile['tmp_name']);
            $pdfFilename = preg_replace('/[^a-zA-Z0-9._-]/', '', $pdfFile['name']); // Sanitizar nombre de archivo

            $mail = new PHPMailer(true);

            // Configuración del servidor
            $mail->isSMTP();
            $mail->Host       = 'smtp.hostinger.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $myEmail;
            $mail->Password   = $mypass; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;
            $mail->CharSet    = 'UTF-8';
            $mail->Timeout     = 30; // Tiempo de espera más corto

            // Remitente y destinatario
            $mail->setFrom($myEmail, $nombreEmpresa);
            $mail->addAddress($recipientEmail);
            $mail->addReplyTo($myEmail, $nombreEmpresa);

            // Archivo adjunto
            $mail->addStringAttachment($pdfContent, $pdfFilename, 'base64', 'application/pdf');

            // Contenido del correo
            $mail->isHTML(true);
            $mail->Subject = htmlspecialchars("Factura Nro. {$invoiceNumber} - {$clientName}");
            $mail->Body    = $this->generateEmailBody($invoiceNumber, $clientName, $nombreEmpresa, $direccionEmpresa, $telefonoEmpresa);
            $mail->AltBody = strip_tags("Adjunto encontrará su factura Nro. {$invoiceNumber}. Gracias por su preferencia.");

            $mail->send();

            // Respuesta exitosa
            http_response_code(200);
            echo json_encode(['estado'=> 'exito','message' => 'Factura enviada por correo exitosamente.']);

            // Log success
            $this->logger->registrar(
                "EnvioCorreoFactura",
                "info",
                "Factura enviada exitosamente para Nro. " . $invoiceNumber,
                [
                    'recipientEmail' => substr($recipientEmail, 0, 3) . '...@...' . substr(strrchr($recipientEmail, "@"), 1), // Parcialmente ofuscado
                    'invoiceNumber' => $invoiceNumber
                ],
                null,
                $idempresa
            );

        } catch (Exception $e) {
            $this->logger->registrar(
                "EnvioCorreoFactura",
                "error",
                "Error al enviar factura " . $invoiceNumber,
                [
                    'recipientEmail' => substr($recipientEmail, 0, 3) . '...@...' . substr(strrchr($recipientEmail, "@"), 1),
                    'invoiceNumber' => $invoiceNumber,
                    'error' => $mail->ErrorInfo
                ],
                $e,
                $idempresa
            );
            http_response_code(500);
            echo json_encode(['estado'=> 'error','message' => "Error al enviar la factura por correo. Por favor, inténtelo nuevamente."]); // Mensaje genérico para el cliente
        }
    }
     
    private function obtenerCredencialEmpresa()
    {
        $stmt = $this->cm->prepare("SELECT credencial, sendemail FROM email LIMIT 1");
        $stmt->execute();
        $result = $stmt->get_result();
        $fila = $result->fetch_assoc();
        $stmt->close();

        return $fila ? [$fila["credencial"], $fila["sendemail"]] : false;
    }

    private function generateEmailBody($invoiceNumber, $clientName, $nombreEmpresa, $direccionEmpresa, $telefonoEmpresa)
    {
        return "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <title>Factura {$invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                    .footer { margin-top: 20px; font-size: 0.9em; color: #7f8c8d; }
                </style>
            </head>
            <body>
                <div class='header'>
                    <h2>Estimado/a " . htmlspecialchars($clientName) . ",</h2>
                </div>
                <p>Adjunto encontrará su factura Nro. <strong>" . htmlspecialchars($invoiceNumber) . "</strong>.</p>
                <p>Gracias por su preferencia.</p>
                <div class='footer'>
                    <p>Saludos cordiales,</p>
                    <p><strong>" . htmlspecialchars($nombreEmpresa) . "</strong></p>
                    <p>" . htmlspecialchars($direccionEmpresa) . "</p>
                    <p>Tel: " . htmlspecialchars($telefonoEmpresa) . "</p>
                </div>
            </body>
            </html>
        ";
    }
}