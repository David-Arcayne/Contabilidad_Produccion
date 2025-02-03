<?php

class DBusiness extends mysqli{
	
	public function __construct($user,$pass,$db){
	parent::__construct('localhost',$user,$pass,$db);
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