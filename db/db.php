<?php
require_once "dbusiness.php";
class DB{
    protected $dbc,$dbe,$dba,$dbcm,$dbrh,$dbb,$dbaf,$dbp;
    public function __construct()
    {
        
        $this->dbc=new DBusiness("admin","admin123","yocontabilidad");
        $this->dbe=new DBusiness("admin","admin123","yoempresa");
        $this->dba=new DBusiness("admin","admin123","yoadmin");
        $this->dbcm=new DBusiness("admin","admin123","yocomercial");
        $this->dbrh=new DBusiness("admin","admin123","yorrhh");
        $this->dbb=new DBusiness("admin","admin123","yobird");
        $this->dbp=new DBusiness("admin","admin123","yoproduccion");
        
        /*u335921272_vcontabilidad:@Conta#234
        u335921272_vempresa:@empresa123
        u335921272_vadmin:@Admin#234
        u335921272_vcomercial:@Comercial#234
        u335921272_rrhh:@Rrhh#234
        u335921272_af:@Afijos#234
        u335921272_menu:@Menu123
        */
        /*
        $this->dbc=new DBusiness("u335921272_vcontabilidad","@Conta#234","u335921272_vcontabilidad");//contabilidad
        $this->dbe=new DBusiness("u335921272_vempresa", "@empresa123", "u335921272_vempresa");//empresa
        $this->dba=new DBusiness("u335921272_vadmin","@Admin#234","u335921272_vadmin"); //Admin
        $this->dbcm=new DBusiness("u335921272_vcomercial","@Comercial#234","u335921272_vcomercial");//comercial
        $this->dbrh=new DBusiness("u335921272_rrhh", "@Rrhh#234", "u335921272_rrhh"); //recursos humanos
        $this->dbaf=new DBusiness("u335921272_af", "@Afijos#234", "u335921272_af"); //Activos fijos
        $this->dbb=new DBusiness("u335921272_menu","@Menu123","u335921272_menu");//menus
        */
        

    }
    
}
?>
