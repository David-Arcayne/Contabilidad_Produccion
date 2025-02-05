<?php
require_once "../../db/db.php";
class Empleado extends DB{
  
    public function registrar_trabajador($nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha,$cargos_idcargos){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
        //   $idempresa = $this->getidempresa($empresa_idempresa);
        //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_pedido WHERE material_idmaterial = '$material'");
        //     $resultado = $consulta->fetch_assoc();
        //     $totalRegistros = $resultado['total'];
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroEstandar = $this->dbrh->query("INSERT INTO trabajador(nombre, apellido, ci, telefono,email,fnacimiento,direccion,estado,foto,nacionalidad,profesion,estadot,fecha,cargos_idcargos) VALUES ('$nombre', '$apellido', '$ci', '$telefono',NULL,'$fnacimiento','$direccion',NULL,NULL,'$nacionalidad','$profesion',NULL,'$fecha','$cargos_idcargos')");
                if ($registroEstandar === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitoso","registrar_trabajador");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
        public function editar_trabajador($idtrabajador,$nombre, $apellido, $ci, $telefono,$fnacimiento,$direccion,$nacionalidad,$profesion,$fecha){
            // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
            // echo json_encode($res);
            //   $idempresa = $this->getidempresa($empresa_idempresa);
            //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_pedido WHERE material_idmaterial = '$material'");
            //     $resultado = $consulta->fetch_assoc();
            //     $totalRegistros = $resultado['total'];
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
                if (0 > 0) {
                    $res = array("danger", "El registro ya existe");
                } else {
                    // Insertar el nuevo registro
                    $registroEstandar = $this->dbrh->query("UPDATE trabajador
                    SET nombre = '$nombre', 
                    apellido = '$apellido',
                    ci = '$ci',
                    telefono = '$telefono',
                    fnacimiento = '$fnacimiento',
                    direccion = '$direccion',
                    nacionalidad = '$nacionalidad',
                    profesion = '$profesion',
                    fecha = '$fecha'
                    WHERE idtrabajador = '$idtrabajador'");
                    if ($registroEstandar === TRUE) {                                                                                                                                                                
                        $res = array("success", "Registro exitoso","editar_trabajador");
                    } else {
                        $res = array("danger", "No se pudo registrar");
                    }
                }
                echo json_encode($res);
            }
    public function registrar_etapa_produccion_empleado($emplEtapa) {
        //  echo json_encode(array($grupo_productos));

         foreach($emplEtapa as $pm){
            $idempresa = $this->getidempresa($pm['empresa_idempresa']);
            if($pm['idetapa_producccion_has_empleado'] < 0){
              $auxIdGrupo = abs($pm['idetapa_producccion_has_empleado']); 
              $eliminar = $this->dbp->query("DELETE FROM etapa_producccion_has_empleado WHERE idetapa_producccion_has_empleado='$auxIdGrupo'");
            
            }elseif($pm['idetapa_producccion_has_empleado'] == 0){
                $registrar = $this->dbp->query("INSERT INTO etapa_producccion_has_empleado(etapas_produccion_idetapas_produccion, empleado_idempleado,fecha_inicio,fecha_fin, empresa_idempresa) VALUES ('$pm[etapas_produccion_idetapas_produccion]','$pm[empleado_idempleado]','$pm[fecha_inicio]',NULL,'$idempresa')");
            }
            
         }
            $res = array("success", "Operaciones exitosas","registrar_etapa_produccion_empleado");
        echo json_encode($res);
    } 
    public function editar_etapa_produccion_empleado($id,$fecha_fin) {
        // $idempresa = $this->getidempresa($empresa);
        // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM caracteristicas WHERE caracteristica = '$nombre'");
        // $resultado = $consulta->fetch_assoc();
        // $totalRegistros = $resultado['total'];

        if (0 > 0) {
            $res = array("Error", "El registro ya existe","editarCaracteristicas");
        }else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbp->query("UPDATE etapa_producccion_has_empleado
                                    SET fecha_fin = '$fecha_fin'
                                    WHERE idetapa_producccion_has_empleado = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "El empleado ha concluido su trabajo en esta etapa","editar_etapa_produccion_empleado");
            } else {
                $res = array("danger", "No se pudo editar",$id,$fecha_fin);
            }
        }
        echo json_encode($res);
    }
    public function Listar_etapa_empleado($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Consultar proveedores
        $proveedores = $this->dbp->query("SELECT * FROM etapas_produccion WHERE empresa_idempresa='$idempresa';");
    
        while($prov = $this->dbcm->fetch($proveedores)) {
            $resu = array(
                "etapas_produccion_idetapas_produccion" => $prov[0],
                "nombre_etapa" => $prov['nombre_etapa'],
                "empleados" => []
            );
    
            // Consultar materiales del proveedor actual
            $idsmat = $this->dbp->query("SELECT empleado_idempleado FROM etapa_producccion_has_empleado WHERE etapas_produccion_idetapas_produccion = '{$prov['idetapas_produccion']}';");
    
            $listaMat = [];
            while($idMat = $this->dbp->fetch($idsmat)) {
                $listaMat[] = $idMat['empleado_idempleado'];
            }
    
            $idsempleado = implode(",", $listaMat);
    
            if(!empty($idsempleado)) {
                // Consultar detalles de materiales
                $materiales = $this->dbp->query("SELECT * FROM etapa_producccion_has_empleado WHERE etapas_produccion_idetapas_produccion='$prov[0]'");

                while($mate = $this->dbp->fetch($materiales)) {
                     $trabajadr = $this->dbrh->query("SELECT * FROM trabajador WHERE idtrabajador = '$mate[empleado_idempleado]'");
                   
                     $resultado2 = $trabajadr->fetch_assoc();
                     $nombreTr = $resultado2['nombre'];
                     $apellidoTr = $resultado2['apellido'];
               
                    $materialesLista = array(
                        "idetapa_producccion_has_empleado" => $mate['idetapa_producccion_has_empleado'],
                        "empleado_idempleado" => $mate['empleado_idempleado'],
                        "nombre" => $nombreTr,
                        "apellido" => $apellidoTr,
                        "fecha_inicio" => $mate['fecha_inicio'],
                        "fecha_fin" => $mate['fecha_fin']
                    );
                    array_push($resu['empleados'], $materialesLista);
                }
            }
    
            array_push($lista, $resu);
        }
    
        echo json_encode($lista);
    }
    public function getEmpleado($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getPedido = $this->dbrh->query("SELECT DISTINCT t.idtrabajador,t.nombre ,t.apellido, c.salario FROM usuario u 
                    INNER JOIN trabajador t on u.trabajador_idtrabajador = t.idtrabajador 
                    INNER JOIN cargos c ON c.idcargos = t.cargos_idcargos WHERE u.idempresa = '$idempresa';");
     
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"apellido"=>$qwe[2],"salario"=>$qwe[3]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function get_trabajador_sucursal($sucursal){
        $lista = [];
        $idsucursal = $this->getidsucursal($sucursal);
        // $getPedido = $this->dbrh->query("SELECT t.*,ct.salario FROM trabajador t 
        // INNER JOIN contrataciones ct ON ct.trabajador_idtrabajador = t.idtrabajador
        // INNER JOIN cargos c ON c.idcargos=t.cargos_idcargos
        // INNER JOIN areas a ON a.idareas=c.areas_idareas
        // WHERE a.sucursal_idsucursal='$idsucursal';");
        $getPedido = $this->dbrh->query("SELECT t.*, ct.salario 
                FROM trabajador t 
                INNER JOIN contrataciones ct ON ct.trabajador_idtrabajador = t.idtrabajador
                INNER JOIN cargos c ON c.idcargos = t.cargos_idcargos
                INNER JOIN areas a ON a.idareas = c.areas_idareas
                WHERE a.sucursal_idsucursal = '$idsucursal' AND ct.estado = 1 
                AND (ct.fechai <= CURDATE() AND (ct.fechaf >= CURDATE() OR ct.fechaf IS NULL))
                GROUP BY t.idtrabajador;
                ");
     
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("idtrabajador"=>$qwe[0],"nombre"=>$qwe['nombre'],"apellido"=>$qwe['apellido'],"ci"=>$qwe['ci'],"telefono"=>$qwe['telefono'],"email"=>$qwe['email'],"fnacimiento"=>$qwe['fnacimiento'],"direccion"=>$qwe['direccion'],"estado"=>$qwe['estado'],"nacionalidad"=>$qwe['nacionalidad'],"profesion"=>$qwe['profesion'],"fecha"=>$qwe['fecha'],"cargos_idcargos"=>$qwe['cargos_idcargos'],"sexo"=>$qwe['sexo'],"salario"=>$qwe['salario'],"estadocivil"=>$qwe['estadocivil']); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);                            
         }
          echo json_encode($lista);
    }
    public function get_trabajador_recursos_humanos($sucursal){
        $lista = [];
        $idsucursal = $this->getidsucursal($sucursal);
        $getPedido = $this->dbrh->query("SELECT t.* FROM trabajador t INNER JOIN cargos c ON c.idcargos=t.cargos_idcargos
        INNER JOIN areas a ON a.idareas=c.areas_idareas
        WHERE a.sucursal_idsucursal='$idsucursal';");
     
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("idtrabajador"=>$qwe[0],"nombre"=>$qwe['nombre'],"apellido"=>$qwe['apellido'],"ci"=>$qwe['ci'],"telefono"=>$qwe['telefono'],"email"=>$qwe['email'],"fnacimiento"=>$qwe['fnacimiento'],"direccion"=>$qwe['direccion'],"nacionalidad"=>$qwe['nacionalidad'],"profesion"=>$qwe['profesion']); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);                            
         }
          echo json_encode($lista);
    }
    public function editar_areas($idareas,$nombre, $descripcion, $fecha,$sucursal) {
        // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
        // $idempresa = $this->getidempresa($empresa);
        // ini_set('display_errors', 1);
        //     ini_set('display_startup_errors', 1);
        //     error_reporting(E_ALL);
        $idsucursal = $this->getidsucursal($sucursal);
        $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM areas WHERE nombre='$nombre' AND idareas != '$idareas' AND sucursal_idsucursal = '$idsucursal'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe");
        } else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbrh->query("UPDATE areas
                                    SET nombre = '$nombre',
                                        descripcion = '$descripcion',
                                        fecha = '$fecha'
                                    WHERE idareas = '$idareas';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editar_areas");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
    }
    public function editar_cargos($idcargos,$cargo, $salario, $descripcion,$sucursal) {
        //  ini_set('display_errors', 1);
        //     ini_set('display_startup_errors', 1);
        //     error_reporting(E_ALL);
        // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
        // $idempresa = $this->getidempresa($empresa);
        $idsucursal = $this->getidsucursal($sucursal);
        
        $consulta = $this->dbrh->query("SELECT COUNT(*) AS total FROM cargos c
        INNER JOIN areas a ON a.idareas = c.areas_idareas WHERE c.cargo='$cargo' AND c.idcargos != '$idcargos' AND a.sucursal_idsucursal = '$idsucursal'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];
        if ($totalRegistros > 0) {
            $res = array("danger", "El registro ya existe");
        } else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbrh->query("UPDATE cargos
                                    SET cargo = '$cargo',
                                        salario = '$salario',
                                        descripcion = '$descripcion'
                                    WHERE idcargos = '$idcargos';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa","editar_cargos");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
    }
    public function listado_areas($sucursal){
        $lista = [];
        $idsucursal = $this->getidsucursal($sucursal);
        $getPedido = $this->dbrh->query("SELECT * FROM areas
        WHERE sucursal_idsucursal='$idsucursal';
        ");
     
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("idareas"=>$qwe[0],"nombre"=>$qwe[1],"descripcion"=>$qwe[2],"fecha"=>$qwe[3]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);                                      
         }
          echo json_encode($lista);
    }   
    public function listado_cargos($sucursal){
        $lista = [];
        $idsucursal = $this->getidsucursal($sucursal);
        $getPedido = $this->dbrh->query("SELECT * FROM cargos c
        INNER JOIN areas a ON a.idareas=c.areas_idareas
        WHERE a.sucursal_idsucursal='$idsucursal';
        ");
     
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("idcargos"=>$qwe[0],"cargo"=>$qwe[1],"salario"=>$qwe[2],"descripcion"=>$qwe[3],"fecha"=>$qwe[4],"areas_idareas"=>$qwe[5]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);                                      
         }
          echo json_encode($lista);
    }
    public function eliminar_areas($idareas){
  
            if (0 > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $eliminarL = $this->dbrh->query("DELETE FROM areas WHERE idareas = '$idareas'");
                if ($eliminarL === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminar_areas");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }  public function eliminar_cargos($idcargos){
  
        if (0 > 0) {
            $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
        } else {
            // Insertar el nuevo registro
            $eliminarL = $this->dbrh->query("DELETE FROM cargos WHERE idcargos = '$idcargos'");
            if ($eliminarL === TRUE) {                                                                                                                                                    
                $res = array("success", "se elimino exitosamente","eliminar_cargos");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
}
    public function getUsuario($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getPedido = $this->dbrh->query("SELECT u.idusuario,u.nombre ,u.trabajador_idtrabajador FROM usuario u");
       
        while($qwe=$this->dbrh->fetch($getPedido)){
             $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"idtrabajador"=>$qwe[2]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
          echo json_encode($lista);
    }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }  
    public function getidsucursal($md5){
        $registro=$this->dbe->query("select * from sucursalcontable where md5(idsucursalcontable)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idsucursalcontable'];
    }  
    public function getidusuario($md5){
        $registro=$this->dbrh->query("select * from usuario where md5(idusuario)='$md5'");
        $qwe=$this->dbrh->fetch($registro);
        return $qwe['idusuario'];
    }  
}


?>