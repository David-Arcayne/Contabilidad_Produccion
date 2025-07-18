<?php
require_once "../db/conexion.php";

class LogErrores
{
    private $cm;
    private $conexion;
    public function __construct()
    {
        $this->conexion = new Conexion();
      
        $this->cm = $this->conexion->cm;
    }

    /**
     * Registra un error
     */
    public function registrar($modulo, $tipo_error, $mensaje, $datos_entrada, $usuario_id = null, $idempresa = null)
    {
        // Convertir a JSON y escapar
        $datos_json = json_encode($datos_entrada, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
        $query = "INSERT INTO log_errores 
            (modulo, tipo_error, mensaje, datos_entrada, usuario_id, idempresa)
            VALUES (?, ?, ?, ?, ?, ?)";

        $stmt = $this->cm->prepare($query);

        if (!$stmt) {
            return json_encode([
                "status" => "error",
                "mensaje" => "Error al preparar la consulta del log: " . $this->cm->error
            ]);
        }

        $stmt->bind_param(
            "ssssii",
            $modulo,
            $tipo_error,
            $mensaje,
            $datos_json,
            $usuario_id,
            $idempresa
        );

        if ($stmt->execute()) {
            return json_encode([
                "status" => "success",
                "mensaje" => "Error registrado correctamente"
            ]);
        } else {
            return json_encode([
                "status" => "error",
                "mensaje" => "Error al registrar en el log: " . $stmt->error
            ]);
        }
    }


    /**
     * Buscar por fechas
     */
    public function buscarPorFechas($fechaInicio, $fechaFin)
    {
        $sql = "SELECT * FROM log_errores 
                WHERE fecha BETWEEN '$fechaInicio 00:00:00' AND '$fechaFin 23:59:59' 
                ORDER BY fecha DESC";

        $result = $this->cm->query($sql);
        if ($result) {
            $logs = [];
            while ($fila = $result->fetch_assoc()) {
                $logs[] = $fila;
            }
            echo json_encode([
                "status" => "success",
                "data" => $logs
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "mensaje" => "Error al buscar logs: " . $this->cm->error
            ]);
        }
    }

    /**
     * Buscar por tipo
     */
    public function buscarPorTipo($tipo)
    {
        $tipo = $this->cm->real_escape_string($tipo);
        $sql = "SELECT * FROM log_errores WHERE tipo_error = '$tipo' ORDER BY fecha DESC";

        $result = $this->cm->query($sql);
        if ($result) {
            $logs = [];
            while ($fila = $result->fetch_assoc()) {
                $logs[] = $fila;
            }
            echo json_encode([
                "status" => "success",
                "data" => $logs
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "mensaje" => "Error al buscar por tipo: " . $this->cm->error
            ]);
        }
    }

    /**
     * Buscar por usuario
     */
    public function buscarPorUsuario($usuario_id)
    {
        $sql = "SELECT * FROM log_errores WHERE usuario_id = $usuario_id ORDER BY fecha DESC";

        $result = $this->cm->query($sql);
        if ($result) {
            $logs = [];
            while ($fila = $result->fetch_assoc()) {
                $logs[] = $fila;
            }
            echo json_encode([
                "status" => "success",
                "data" => $logs
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "mensaje" => "Error al buscar por usuario: " . $this->cm->error
            ]);
        }
    }
}
