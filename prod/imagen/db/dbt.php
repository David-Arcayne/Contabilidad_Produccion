<?php
class DBusiness extends mysqli{
	
	public function __construct(){
	//parent::__construct('localhost','bitcljea_mitaxi','@taxi123','bitcljea_taxi');
	parent::__construct('145.14.151.1','u335921272_produccion','@Desarrollo123','u335921272_produccion');
	$this->connect_errno ? die("<center><h3>oops don't find datas</h3></center>"):$x="HK";
	$this->query("SET NAMES 'utf8';");
    $this->query("SET CHARACTER SET utf8;");
    $this->query("SET SESSION collation_connection = 'utf8_unicode_ci';");
	}
	public function fetch($y){
	  return mysqli_fetch_array($y);	
		}
	public function rows($y)
	{
	 return mysqli_num_rows($y);
	}
    public function all($y)
    {
        return mysqli_fetch_all($y);
    }
	
	}


?>