<?php
require_once "panel.php";
$ver=explode("/",$_GET['ver']);
if($ver[0]=="obtenermenu"){
$pa=new Panel();
$pa->obtenermenu($ver[1],$ver[2]);
}elseif($ver[0]=="accesodesktop"){
$pa=new Panel();
$pa->accesodesktop($ver[1],$ver[2]);
}
?>