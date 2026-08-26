<?php
// bd.php — Clase base de conexión mysqli con 127.0.0.1 (TCP, evita error 2002)

class BDyofinanciero extends mysqli {

    public function __construct(string $user, string $pass, string $db) {
        // Activar reporte de errores como excepciones ANTES de conectar
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        // Usar 127.0.0.1 (TCP) en lugar de 'localhost' (socket Unix)
        // Esto evita el error 2002 "Operation not permitted" en LiteSpeed/Hostinger
        parent::__construct('127.0.0.1', $user, $pass, $db);

        // Configurar charset UTF-8
        $this->set_charset('utf8');
        $this->query("SET SESSION collation_connection = 'utf8_unicode_ci';");
    }

    /**
     * Obtiene una fila como array (numérico + asociativo)
     */
    public function fetch($result): array|null|false {
        return mysqli_fetch_array($result);
    }

    /**
     * Obtiene una fila como array asociativo
     */
    public function fetchAssoc($result): array|null|false {
        return mysqli_fetch_assoc($result);
    }

    /**
     * Número de filas del resultado
     */
    public function rows($result): int {
        return mysqli_num_rows($result);
    }

    /**
     * Todas las filas del resultado
     */
    public function all($result): array {
        return mysqli_fetch_all($result, MYSQLI_ASSOC);
    }

    /**
     * ID del último registro insertado
     */
    public function getLastInsertId(): int|string {
        return $this->insert_id;
    }

    /**
     * Número de filas afectadas por la última operación
     */
    public function affectedRows(): int {
        return $this->affected_rows;
    }

    /**
     * Inicia una transacción
     */
    public function beginTransaction(): void {
        $this->autocommit(false);
    }

    /**
     * Confirma la transacción
     */
    public function commitTransaction(): void {
        parent::commit();
        $this->autocommit(true);
    }

    /**
     * Revierte la transacción
     */
    public function rollbackTransaction(): void {
        parent::rollback();
        $this->autocommit(true);
    }
}
