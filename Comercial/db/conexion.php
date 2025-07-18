<?php
require_once "bd.php";

class Conexion extends BDyofinanciero {
    public $rh;
    public $em;
    public $ad;
    public $cm;
    public $endPoint;
    
    public function __construct() {
        try {
           
            // /*$this->em = new BDyofinanciero("u335921272_vempresa", "@Empresa123", "u335921272_vempresa");
            // $this->ad = new BDyofinanciero("u335921272_adminy","@Admin#123","u335921272_administradorY");
            // $this->cm = new BDyofinanciero("u335921272_vcomercial","@Comercial#234","u335921272_vcomercial");
            // $this->rh = new BDyofinanciero("u335921272_rrhh","@Rrhh#234","u335921272_rrhh");
            // $this->endPoint = "https://fel.emizor.com";*/
            // $this->em = new BDyofinanciero("u335921272_empresa", "@Empresa#123", "u335921272_empresa");
            // $this->ad = new BDyofinanciero("u335921272_adminy","@Admin#123","u335921272_administradorY");
            // $this->cm = new BDyofinanciero("u335921272_comercila1","@Comercial11331","u335921272_comercial1");
            // $this->rh = new BDyofinanciero("u335921272_rh", "@Vivarh1331", "u335921272_rh");
            // $this->endPoint = array(
            //     1 => "https://sinfel.emizor.com",
            //     2 => "https://fel.emizor.com"
            // );

            $this->em = new BDyofinanciero("u335921272_vempresa", "@Empresa123", "u335921272_vempresa");
            $this->ad = new BDyofinanciero("u335921272_adminy","@Admin#123","u335921272_administradorY");
            $this->cm=new BDyofinanciero("u335921272_vcomercial","@Comercial#2025","u335921272_vcomercial");
            //$this->cm = new BDyofinanciero("u335921272_vcomercial","@Comercial#234","u335921272_vcomercial");
            $this->rh = new BDyofinanciero("u335921272_rrhh","@Rrhh#234","u335921272_rrhh");
            //$this->endPoint = "https://fel.emizor.com";
            /*$this->em = new BDyofinanciero("u335921272_empresa", "@Empresa#123", "u335921272_empresa");
            $this->ad = new BDyofinanciero("u335921272_adminy","@Admin#123","u335921272_administradorY");
            $this->cm = new BDyofinanciero("u335921272_comercila1","@Comercial11331","u335921272_comercial1");
            $this->rh = new BDyofinanciero("u335921272_rh", "@Vivarh1331", "u335921272_rh");
            $this->endPoint = "https://sinfel.emizor.com";*/
            /*$this->em = new BDyofinanciero("root","","u335921272_empresa");
            $this->ad = new BDyofinanciero("root","","u335921272_administradorY");
            $this->cm = new BDyofinanciero("root","","u335921272_comercial1");
            $this->rh = new BDyofinanciero("root","","u335921272_rh");*/
            //$this->endPoint = "https://sinfel.emizor.com";
            $this->endPoint = array(
                1 => "https://sinfel.emizor.com",
                2 => "https://fel.emizor.com"
            );
        } catch (Exception $e) {
            echo "Error al conectar con la base de datos: " . $e->getMessage();
        }
    }
}
?>
