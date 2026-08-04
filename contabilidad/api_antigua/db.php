<?php
require_once "../db/dbusiness.php";
class DB{
    protected $db,$dbe,$dba,$dbc,$emp,$idu;
    public function __construct()
    {
        /*
        $this->db=new DBusiness("admin","admin123","yocontabilidad");
        $this->dbe=new DBusiness("admin","admin123","yoempresa");
        $this->dba=new DBusiness("admin","admin123","yoadmin");
        $this->dbc=new DBusiness("admin","admin123","comercial");
        */
        $this->db=new DBusiness("u335921272_yocontabilidad","@Yocontabilidad123","u335921272_yocontabilidad");
        $this->dbe=new DBusiness("u335921272_yoempresa","@Yoempresa123","u335921272_yoempresa");
        $this->dba=new DBusiness("u335921272_yoadmin","@Yoadmin123","u335921272_yoadmin");
        $this->dbc=new DBusiness('u335921272_yocomercial','@Yocomercial123','u335921272_yocomercial');

        $this->emp=$_SESSION['organizacion'];
        $this->idu=$_SESSION['yofinanciero'];
    }
    
}

?>