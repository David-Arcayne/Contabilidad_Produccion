<?php
require_once "../../db/db.php";

class Panel extends DB{

    public function checkempresa($user,$pass){
        $lista=[];
        
        
        $verificar="select * from administrador where email='$user'";
        $result=$this->dba->query($verificar);
        $get=$this->dba->fetch($result);
        $conta=0;
        if(password_verify($pass,$get['password'])){
            $conta++;
        }
        if($conta==1){   
            $res=array("ok"=>"success","nombre"=>$get['nombre']." ".$get['apellido'],"idusuario"=>md5($get['idadministrador']),"tipo"=>$get['tipo'],"login"=>"empresa");  
            
        }else{
            $res=array("ok"=>"danger","nombre"=>"Error ...");
            
        }
        array_push($lista,$res);
        echo json_encode($lista);
        
        
    }
    
    public function checkusuario($user, $passw) {
        $lista=[];
        
        $verificar="select * from usuario where nombre='$user'";
        $result=$this->dbrh->query($verificar);
        $qwe=$this->dbrh->fetch($result);
        $conta=0;
        if(password_verify($passw,$qwe['password'])){
            $conta++;
        }
        if($conta==1){   
            $verificar="select u.idusuario, u.nombre, u.password, t.nombre, t.apellido, t.telefono, c.descripcion, a.nombre, a.sucursal_idsucursal, c.cargo,a.idareas,  c.idcargos,  a.nombre from usuario as u
            inner join trabajador as t on t.idtrabajador= u.trabajador_idtrabajador
            inner join cargos as c on c.idcargos= t.cargos_idcargos
            inner join areas as a on a.idareas= c.areas_idareas
            where u.nombre='$user'";
            $result=$this->dbrh->query($verificar);
            $get=$this->dbrh->fetch($result);
            $sucursal=$get[8];

            $empresa=$this->dbe->query("select s.idsucursalcontable, s.nombre, s.telefono, s.direccion, s.pais, s.municipio, s.ciudad, o.idorganizacion, o.nombreo, o.nit, o.telefono, o.direccion, o.logo,o.emailo,s.idregion,o.tipobusiness_idtipobusiness from sucursalcontable as s 
        inner join organizacion as o on o.idorganizacion= s.idorganizacion
        where s.idsucursalcontable='$sucursal'");
        $geto=$this->dbe->fetch($empresa);
         $region=$this->dbe->query("SELECT r.idregion, r.nombre FROM region AS r WHERE idregion='$geto[14]'");
         $getr=$this->dbe->fetch($region);

        //tipo de negocio
        $tipo=$this->dba->query("select t.idtipobusiness, t.nombreb,t.tipo from tipobusiness as t where t.idtipobusiness='$geto[15]'");
        $gett=$this->dba->fetch($tipo);
        

        $tokenid=$this->dba->query("select t.token_type,t.expires_in,t.access_token,t.tipo from factura as f 
        inner join facturatoken as t on t.idfactura=f.idfactura
        where f.idempresa='$geto[7]' order by t.idfacturatoken desc limit 1");
        $tk=$this->dba->fetch($tokenid);
        $type="";$expire="";$token="";$tipo="";$tipof="";
        if($tk==TRUE){
            if($tk[3]==1){$tipo=$tk[3]; $tipof="PRUEBA";}else{ $tipo=$tk[3]; $tipof="FACTURA";}
            $type=$tk[0];$expire=$tk[1];$token=$tk[2]; 
            
        }



            $empresaa=array("nombre"=>$geto[8],"idempresa"=>md5($geto[7]),"nit"=>$geto[9],"telefono"=>$geto[10],"direccion"=>$geto[11],"logo"=>$geto[12],"email"=>$geto[13],"idsucursal"=>md5($geto[0]),"sucursal"=>$geto[1],"idregion"=>md5($getr[0]),"region"=>$getr[1],"tiponegocio"=>$gett[1],"tipo"=>$gett[2],"idtiponegocio"=>md5($gett[0]));
            $factura=array("token_type"=>$type,"expires_in"=>$expire,"access_token"=>$token,"tipo"=>$tipo,"tipof"=>$tipof);
            $res=array("ok"=>"success","login"=>"usuario","idusuario"=>md5($get[0]),"usuario"=>$get[1],"nombre"=>$get[3]." ".$get[4],"cargo"=>$get[9],"idarea"=>md5($get[10]),"idcargo"=>md5($get[11]),"area"=>$get[12],"empresa"=>$empresaa,"factura"=>$factura);
            
            array_push($lista,$res);
            
        }else{
            $res=array("ok"=>"danger","nombre"=>NULL);
            array_push($lista,$res);
        }
        echo json_encode($lista);
    }
    

    public function registro($nombre,$apellido,$telefono,$email,$password){
        $resi=[];
        $estado=2;
        $tipo=6;
        $fecha=date("Y-m-d");
        $pass=password_hash($password,PASSWORD_DEFAULT);
        $registro=$this->dba->query("insert into administrador(idadministrador,nombre,apellido,telefono,email,password,estado,tipo,fecha)values(NULL,'$nombre','$apellido','$telefono','$email','$pass','$estado','$tipo','$fecha')");
        if($registro){
            $res=array("ok"=>"success","estado"=>"registro");
        }else{
            $res=array("ok"=>"danger");
        }
        array_push($resi,$res);
        echo json_encode($resi);
    }

    public function recoveryadmin($email){
        $resi = [];
        $estado = 2;
        $tipo = 6;
        $fecha = date("Y-m-d");
        $registro = $this->dba->query("SELECT * FROM administrador WHERE email='$email'");
        $qwe = $this->dba->fetch($registro);
        if($qwe){
            $password = rand(100000, 999999) . "YOF";
            $pass = password_hash($password, PASSWORD_DEFAULT);
            $registro = $this->dba->query("UPDATE administrador SET password='$pass' WHERE email='$email'");
            
            // Envío de correo electrónico con la nueva contraseña
            $to = $email;
            $subject = 'Recuperación de contraseña';
            $message = 'Su nueva contraseña es: ' . $password;
            $headers = 'From: info@yofinanciero.com' . "\r\n" .
                'Reply-To: info@yofinanciero.com' . "\r\n" .
                'X-Mailer: PHP/' . phpversion();
    
            // Envía el correo electrónico
            $mailSent = mail($to, $subject, $message, $headers);
    
            if ($mailSent) {
                $res = array("ok" => "success", "estado" => "recovery");
            } else {
                $res = array("ok" => "danger", "message" => "Error al enviar el correo electrónico.");
            }
        } else {
            $res = array("ok" => "danger", "message" => "El correo electrónico no está registrado.");
        }
        array_push($resi, $res);
        echo json_encode($resi);
    }
    

    public function getusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);

        return $qwe['idusuario'];
    }

    
    public function obtenermenu($modulo, $idua) {
        $idu = $this->getusuario($idua);
        $lista = [];
        $mainm = [];
        $mpersmiso=$this->dbb->query("SELECT m.menu_idmenu, me.nombre, me.idp FROM menuusuario AS m 
        inner join menu as me ON me.idmenu= m.menu_idmenu
        WHERE m.idusuario='$idu' group by me.idp ");
        while($mp=$this->dbb->fetch($mpersmiso)){
            $mmenu=$this->dbb->query("SELECT me.idp FROM menu AS me WHERE me.idmenu='$mp[0]'");
            $mm=$this->dbb->fetch($mmenu);
        
        $menuPrincipalQuery = $this->dbb->query("SELECT m.idmenu, m.nombre, m.codigo FROM menu AS m WHERE m.idp='0' AND m.modulo='$modulo' AND idmenu='$mm[0]'");
        
        while ($qwe = $this->dbb->fetch($menuPrincipalQuery)) {
            $subm = [];
            $submenuQuery = $this->dbb->query("SELECT m.idmenu, m.nombre, m.codigo FROM menu AS m WHERE m.idp='$qwe[0]'");
            
            while ($mel = $this->dbb->fetch($submenuQuery)) {
                $permisosQuery = $this->dbb->query("SELECT m.crear, m.lectura, m.actualizar, m.eliminar FROM menuusuario AS m WHERE m.idusuario='$idu' AND m.menu_idmenu='$mel[0]'");
                $asd = $this->dbb->fetch($permisosQuery);
    
                // Verificar permisos antes de agregar el menú
                if ($asd && $asd['crear'] && $asd['lectura'] && $asd['actualizar'] && $asd['eliminar']) {
                    $sub = [
                        "titulo" => $mel[1],
                        "codigo" => $mel[2] . "-" . $idua,
                        "permiso" => $asd['crear'] . $asd['lectura'] . $asd['actualizar'] . $asd['eliminar'],
                    ];
                    $subm[] = $sub;
                }
            }
            
            $men = [
                "usuario" => $idua,
                "titulo" => $qwe[1],
                "codigo" => $qwe[2],
                "submenu" => $subm,
            ];
            $mainm[] = $men;
        }
        }
        
        $res = [
            "modulo" => $modulo,
            "menu" => $mainm,
        ];
        $lista[] = $res;
        
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }
    
    public function obtenermenutest($modulo,$idua){
        
        $idu = $this->getusuario($idua);
        $lista = [];
        $mainm = [];
        $menuPrincipalQuery = $this->dbb->query("SELECT m.idmenu, m.nombre, m.codigo FROM menu AS m WHERE m.idp='0' AND m.modulo='$modulo'");
        while ($qwe = $this->dbb->fetch($menuPrincipalQuery)) {
            $subm = [];
            $submenuQuery = $this->dbb->query("SELECT m.idmenu, m.nombre, m.codigo FROM menu AS m WHERE m.idp='$qwe[0]'");
            while ($mel = $this->dbb->fetch($submenuQuery)) {
                $permisosQuery = $this->dbb->query("SELECT m.crear, m.lectura, m.actualizar, m.eliminar FROM menuusuario AS m WHERE m.idusuario='$idu' AND m.menu_idmenu='$mel[0]'");
                $asd = $this->dbb->fetch($permisosQuery);
                if($asd['m.idusuario']=="$idu"){
                $sub = [
                    "titulo" => $mel[1],
                    "codigo" => $mel[2] . "-" . $idua,
                    "permiso" => $asd ? $asd[0] . $asd[1] . $asd[2] . $asd[3] : "0000", // Asegurar que haya valores predeterminados si no hay resultados
                ];
                }
                $subm[] = $sub;
            
            }
            $men = [
                "usuario" => $idua,
                "titulo" => $qwe[1],
                "codigo" => $qwe[2],
                "submenu" => $subm,
            ];
            $mainm[] = $men;
        }
        $res = [
            "modulo$idu" => $modulo,
            "menu" => $mainm,
        ];
        $lista[] = $res;
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }

    public function obtenermenutt($modulo, $idua) {
        $idu = $this->getusuario($idua);
        $lista = [];
        $mainm = [];
    
        $menuPrincipalQuery = $this->dbb->query("SELECT m.idmenu, m.nombre, m.codigo FROM menu AS m WHERE m.idp='0' AND m.modulo='$modulo'");
        while ($qwe = $this->dbb->fetch($menuPrincipalQuery)) {
            $subm = [];
    
            $submenuQuery = $this->dbb->query("SELECT m.idmenu, m.nombre, m.codigo FROM menu AS m WHERE m.idp='$qwe[0]'");
            while ($mel = $this->dbb->fetch($submenuQuery)) {
                $permisosQuery = $this->dbb->query("SELECT m.crear, m.lectura, m.actualizar, m.eliminar FROM menuusuario AS m WHERE m.idusuario='$idu' AND m.menu_idmenu='$mel[0]'");
                $asd = $this->dbb->fetch($permisosQuery);
    
                // Verificar si el usuario tiene permisos para este elemento del menú
                if ($asd['idusuario'] == $idu) {
                    $sub = [
                        "titulo" => $mel[1],
                        "codigo" => $mel[2] . "-" . $idua,
                        "permiso" => $asd ? $asd[0] . $asd[1] . $asd[2] . $asd[3] : "0000",
                    ];
                    $subm[] = $sub;
                }
            }
    
            // Verificar si hay elementos en el submenú antes de agregarlo al menú principal
            if (!empty($subm)) {
                $men = [
                    "usuario" => $idua,
                    "titulo" => $qwe[1],
                    "codigo" => $qwe[2],
                    "submenu" => $subm,
                ];
                $mainm[] = $men;
            }
        }
    
        $res = [
            "modulo" => $modulo,
            "menu" => $mainm,
        ];
        $lista[] = $res;
        echo json_encode($lista, JSON_PRETTY_PRINT);
    }
    
    // Función para verificar si el usuario tiene permisos
    private function tienePermisos($permisos) {
        // Agrega aquí tu lógica para verificar los permisos según tus necesidades
        // Por ejemplo, podrías retornar true si al menos uno de los permisos es verdadero
        return $permisos[0] == '1' || $permisos[1] == '1' || $permisos[2] == '1' || $permisos[3] == '1';
    }
    
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }
    

    public function accesodesktopBBo($empresa,$usuario){
        $lista=[];
        $ide=$this->getidempresa($empresa);
        $idu=$this->getusuario($usuario);

        $empresaq=$this->dbe->query("select o.idorganizacion, o.administrador_idadministrador from organizacion as o where o.idorganizacion=$ide");
        $asd=$this->dbe->fetch($empresaq);
        $admin=$asd[1];
        
        //aqui vemos si hay licencia
        $licencia=$this->dba->query("select l.idlicencia, l.idplan, l.licencia, l.fechai, l.fechaf, p.orden, p.nombre,l.estado  from licencia as l 
        inner join planes as p on p.idplanes= l.idplan
        where l.idadministrador='$admin' and l.estado=2;");
        while($zxc=$this->dba->fetch($licencia)){
         if($zxc[7]==2){

        $registro=$this->dbb->query("select m.idmenu, m.modulo, m.nombre, m.codigo, m.idp   from menu as m
        inner join menuusuario as u on u.menu_idmenu= m.idmenu
        where u.idusuario='$idu' and m.modulo='$zxc[6]' group by m.modulo asc Limit 1");
        while($qwe=$this->dbb->fetch($registro)){
            $res=array("id"=>$qwe[0],"modulo"=>$qwe[1],"nombre"=>$qwe[2],"codigo"=>$qwe[3],"tipo"=>0);
            array_push($lista,$res);
        }
        }else{
            $res=array("id"=>"0","modulo"=>"NULL","nombre"=>"-","codigo"=>"-","tipo"=>"-");
            array_push($lista,$res);
        }
        }
        
        echo  json_encode($lista);

    }

    public function accesodesktop($empresa, $usuario) {
        $lista = [];
        $ide = $this->getidempresa($empresa);
        $idu = $this->getusuario($usuario);
        
        $empresaq = $this->dbe->query("SELECT o.idorganizacion, o.administrador_idadministrador FROM organizacion AS o WHERE o.idorganizacion=$ide");
        $asd = $this->dbe->fetch($empresaq);
        $admin = $asd[1];
    

            
                $registro = $this->dbb->query("SELECT m.idmenu, m.modulo, m.nombre, m.codigo, m.idp FROM menu AS m
                    INNER JOIN menuusuario AS u ON u.menu_idmenu= m.idmenu
                    WHERE u.idusuario='$idu'
                    GROUP BY m.modulo ORDER BY m.idmenu ASC ");
    
                while ($qwe = $this->dbb->fetch($registro)) {
                    // Verificar si hay licencia
                    $licencia = $this->dba->query("SELECT l.idlicencia, l.idplan, l.licencia, l.fechai, l.fechaf, p.orden, p.nombre, l.estado FROM licencia AS l 
                    INNER JOIN planes AS p ON p.idplanes= l.idplan
                    WHERE l.idadministrador='$admin' AND l.estado=2 AND p.orden=$qwe[1]");
                    $zxc = $this->dba->fetch($licencia);
                    if($zxc[5]==$qwe[1]){
                    $res = [
                        "id" => $qwe[0],
                        "modulo" => $qwe[1],
                        "nombre" => $qwe[2],
                        "codigo" => $qwe[3],
                        "tipo" => 0,
                    ];
                    array_push($lista, $res);
                }else{
                    $res = [
                        "id" => "-",
                        "modulo" => "-",
                        "nombre" => "-",
                        "codigo" => "-",
                        "tipo" => "-",
                    ];
                    array_push($lista, $res);

                }
                }
            
        
    
        echo json_encode($lista);
    }
    
}
?>