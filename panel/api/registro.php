<?php
require_once "panel.php";

$ver=$_POST['ver'];
if($ver=="empresa"){
    $web=new Panel();
    $user=$_POST['usuario'];
    $pass=$_POST['password'];
    //echo "Holassssssssss empresa";
    $check=$web->checkempresa($user,$pass);

}elseif($ver=="usuario"){
    $web=new Panel();
    $user=$_POST['usuario'];
    $pass=$_POST['password'];
    $check=$web->checkusuario($user,$pass);
   
}elseif($ver=="registroUsuario"){
    $web=new Panel();
    $nombre=$_POST['nombre'];
    $apellido=$_POST['apellido'];
    $telefono=$_POST['telefono'];
    $email=$_POST['email'];
    $password=$_POST['password'];
 //echo "Holasssss registro";
    $web->registro($nombre,$apellido,$telefono,$email,$password);
}elseif($ver=="recoveryadmin"){
    $web=new Panel();
    $email=$_POST['usuario'];
    $web->recoveryadmin($email);

}

?>