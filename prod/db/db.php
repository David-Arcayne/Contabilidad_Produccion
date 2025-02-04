<?php
class DB {
    protected $dbcm;
    protected $dbp;
    protected $dbe;

    public function __construct() {
        // Configuración de la base de datos principal (dbp)
        $this->dbp = new mysqli('localhost', 'usuario', 'contraseña', 'nombre_base_datos_principal');
        if ($this->dbp->connect_error) {
            die("Error de conexión (dbp): " . $this->dbp->connect_error);
        }

        // Configuración de la base de datos secundaria (dbe)
        $this->dbe = new mysqli('localhost', 'usuario', 'contraseña', 'nombre_base_datos_secundaria');
        if ($this->dbe->connect_error) {
            die("Error de conexión (dbe): " . $this->dbe->connect_error);
        }
        $this->dbcm = new mysqli('localhost', 'usuario', 'contraseña', 'nombre_base_datos_secundaria');
        if ($this->dbe->connect_error) {
            die("Error de conexión (dbe): " . $this->dbe->connect_error);
        }
    }
	
    // Método para ejecutar una consulta
    public function query($sql, $connection = 'dbp') {
        if ($connection === 'dbp') {
            return $this->dbp->query($sql);
        } else {
            return $this->dbe->query($sql);
        }
    }
    // Método para obtener el resultado de una consulta
    public function fetch($result) {
        return $result->fetch_assoc();
    }

    // Método para cerrar las conexiones
    public function close() {
        $this->dbp->close();
        $this->dbe->close();
    }
}
?>
