<?php

class BDyofinanciero extends mysqli {
	
    public function __construct($user, $pass, $db) {
        parent::__construct('localhost', $user, $pass, $db);
        $this->connect_errno ? die("<center><h3>No se encontraron datos</h3></center>") : $x = "HK";
        $this->query("SET NAMES 'utf8';");
        $this->query("SET CHARACTER SET utf8;");
        $this->query("SET SESSION collation_connection = 'utf8_unicode_ci';");
    }

    public function fetch($y) {
        return mysqli_fetch_array($y);	
    }

    public function rows($y) {
        return mysqli_num_rows($y);
    }

    public function all($y) {
        return mysqli_fetch_all($y);
    }

    public function getLastInsertId() {
        return $this->insert_id;
    }

    // Obtener el número de filas afectadas
    public function affectedRows() {
        return $this->affected_rows;
    }

    // Iniciar una transacción
    public function beginTransaction() {
        $this->autocommit(false);
    }

    // Confirmar la transacción
    public function commitTransaction() {
        parent::commit();
        $this->autocommit(true);
    }

    // Revertir la transacción
    public function rollbackTransaction() {
        parent::rollback();
        $this->autocommit(true);
    }
}
?>
