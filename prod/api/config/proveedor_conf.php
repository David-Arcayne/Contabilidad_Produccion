<?php
require_once "../../db/db.php";
class Proveedor_conf extends DB{
    public function registrar_proveedor_material($provMat) {
        //  echo json_encode(array($grupo_productos));

         foreach($provMat as $pm){
            $idempresa = $this->getidempresa($pm['empresa_idempresa']);
            if($pm['idproveedor_has_material'] < 0){
              $auxIdGrupo = abs($pm['idproveedor_has_material']); 
              $eliminar = $this->dbp->query("DELETE FROM proveedor_has_material WHERE idproveedor_has_material='$auxIdGrupo'");
            
            }elseif($pm['idproveedor_has_material'] == 0){
                $registrar = $this->dbp->query("INSERT INTO proveedor_has_material(proveedor_idproveedor, material_idmaterial, empresa_idempresa) VALUES ('$pm[proveedor_idproveedor]','$pm[material_idmaterial]','$idempresa')");
            }
            
         }
            $res = array("success", "Operaciones exitosas","registrar_proveedor_material");
        echo json_encode($res);
    } 

    // public function registrar_proveedorMaterial($proveedor, $materiales, $empresa) {
    //     $idempresa = $this->getidempresa($empresa);
    //     $materialesArray = explode(',', $materiales); // Dividir la cadena en un array
    
    //     foreach ($materialesArray as $material) {
    //         $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$proveedor' AND material_idmaterial = '$material'");
    //         $resultado = $consulta->fetch_assoc();
    //         $totalRegistros = $resultado['total'];
    
    //         if ($totalRegistros > 0) {
    //             $res = array("danger", "El registro ya existe");
    //         } else {
    //             // Insertar el nuevo registro
    //             $registroProveedor = $this->dbp->query("INSERT INTO proveedor_has_material(proveedor_idproveedor, material_idmaterial, empresa_idempresa) VALUES ('$proveedor', '$material', '$idempresa')");
    //             if ($registroProveedor === TRUE) {
    //                 $res = array("success", "Registro exitoso");
    //             } else {
    //                 $res = array("danger", "No se pudo registrar el material $material", $proveedor, $material);
    //             }
    //         }
    //     }
    //     echo json_encode($res);
    // }
    
    public function listarProveedorMaterial($empresa){
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
        $getPedido = $this->dbp->query("SELECT idproveedor_has_material,proveedor_idproveedor, material_idmaterial FROM proveedor_has_material WHERE empresa_idempresa = '$idempresa'");
        // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
        while($qwe=$this->dbp->fetch($getPedido)){
             $res=array("id_ProveedorMaterial"=>$qwe[0],"proveedor"=>$qwe[1],"material"=>$qwe[2]); //'nombre' sale del formulario de input hidden
            array_push($lista,$res);
         }
    
        // $getPedido = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = 7"); 
        //  while($qwe=$this->dbcm->fetch($getPedido)){
        //      $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
        //     array_push($lista,$res);
        //  }
          echo json_encode($lista);
    }
    public function Listar_proveedor_material($empresa) {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    
        $lista = [];
        $idempresa = $this->getidempresa($empresa);
    
        // Consultar proveedores
        $proveedores = $this->dbcm->query("SELECT * FROM proveedor WHERE id_empresa = '$idempresa';");
    
        while($prov = $this->dbcm->fetch($proveedores)) {
            $resu = array(
                "proveedor_idproveedor" => $prov[0],
                "nombre" => $prov['nombre'],
                "codigo" => $prov['codigo'],
                "nit" => $prov['nit'],
                "materiales" => []
            );
    
            // Consultar materiales del proveedor actual
            $idsmat = $this->dbp->query("SELECT material_idmaterial FROM proveedor_has_material WHERE proveedor_idproveedor = '{$prov['id_proveedor']}';");
    
            $listaMat = [];
            while($idMat = $this->dbp->fetch($idsmat)) {
                $listaMat[] = $idMat['material_idmaterial'];
            }
    
            $idsMaterial = implode(",", $listaMat);
    
            if(!empty($idsMaterial)) {
                // Consultar detalles de materiales
                $materiales = $this->dbp->query("SELECT phm.idproveedor_has_material,m.idmaterial,m.nombre_mat,m.codigo_mat,t.idtipo,t.nombre_tipo, m.medida_idmedida FROM material m
                                            INNER JOIN tipo t ON t.idtipo = m.tipo_idtipo
                                            INNER JOIN proveedor_has_material phm ON phm.material_idmaterial=m.idmaterial 
                                            WHERE idmaterial IN ($idsMaterial) AND phm.proveedor_idproveedor='{$prov['id_proveedor']}';");

                // $tipo = $this->dbp->query("SELECT idtipo, nombre_tipo FROM tipo WHERE idmaterial IN ($idsMaterial);");
                while($mate = $this->dbp->fetch($materiales)) {
                    // $medida = $this->dbcm->query("SELECT id_unidad, nombre FROM unidad WHERE id_unidad '$mate[medida_idmedida]'");
                    // $tipo = $this->dbp->query("SELECT idtipo, nombre_tipo FROM tipo WHERE idtipo '$mate[tipo_idtipo]'");
                    $materialesLista = array(
                        "idproveedor_has_material" => $mate['idproveedor_has_material'],
                        "material_idmaterial" => $mate[1],
                        "nombre_mat" => $mate['nombre_mat'],
                        "codigo_mat" => $mate['codigo_mat'],
                        "idtipo" => $mate['idtipo'],
                        "nombre_tipo" => $mate['nombre_tipo'],
                        "medida_idmedida" => $mate['medida_idmedida']
                    );
                    array_push($resu['materiales'], $materialesLista);
                }
            }
    
            array_push($lista, $resu);
        }
    
        echo json_encode($lista);
    }
    
    public function registrar_proveedor($nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa){
        // $res = array("$cantEnvase", "$material",$tipoEnvase,"$contenidoEnvase","$medida","$empresa");
        // echo json_encode($res);
         $idempresa = $this->getidempresa($empresa);
        //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM detalle_pedido WHERE material_idmaterial = '$material'");
        //     $resultado = $consulta->fetch_assoc();
        //     $totalRegistros = $resultado['total'];

            if (0 > 0) {
                $res = array("danger", "El registro ya existe");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbcm->query("INSERT INTO proveedor(nombre, codigo, nit, detalle, direccion, telefono, mobil, email, web, pais, ciudad, zona, contacto, id_empresa) VALUES ('$nombre', '$codigo', '$nit', '$detalle', '$direccion', '$telefono', '$mobil', '$email', '$web', '$pais', '$ciudad', '$zona', '$contacto', '$idempresa')");
                if ($registroProveedor === TRUE) {                                                                                                                                                                
                    $res = array("success", "Registro exitosooo");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
        }
public function listarProveedor($empresa){
    $lista = [];
    $idempresa = $this->getidempresa($empresa);
    $getPedido = $this->dbcm->query("SELECT * FROM proveedor WHERE id_empresa = $idempresa ORDER BY id_proveedor DESC");
    // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
    while($qwe=$this->dbcm->fetch($getPedido)){
         $res=array("id"=>$qwe[0],"nombre"=>$qwe[1],"codigo"=>$qwe[2],"nit"=>$qwe[3],"detalle"=>$qwe[4],"direccion"=>$qwe[5],"telefono"=>$qwe[6],"mobil"=>$qwe[7],"email"=>$qwe[8],"web"=>$qwe[9],"pais"=>$qwe[10],"ciudad"=>$qwe[11],"zona"=>$qwe[12],"contacto"=>$qwe[13]); //'nombre' sale del formulario de input hidden
        array_push($lista,$res);
     }
      echo json_encode($lista);
}
    
    public function editar_Proveedor($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa) {
        // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
        $idempresa = $this->getidempresa($empresa);
        if (0 > 0) {
            $res = array("danger", "El registro ya existe");
        } else {
            // Insertar el nuevo registro
            $registroListaCompra = $this->dbcm->query("UPDATE proveedor
                                    SET nombre = '$nombre',
                                        codigo = '$codigo',
                                        nit = '$nit',
                                        detalle = '$detalle',
                                        direccion = '$direccion',
                                        telefono = '$telefono',
                                        mobil = '$mobil',
                                        email = '$email',
                                        web = '$web',
                                        pais = '$pais',
                                        ciudad = '$ciudad',
                                        zona = '$zona',
                                        contacto = '$contacto'

                                    WHERE id_proveedor = '$id';");
            if ($registroListaCompra === TRUE) {                                                                                                                                                                
                $res = array("success", "Edición exitosa");
            } else {
                $res = array("danger", "No se pudo registrar");
            }
        }
        echo json_encode($res);
    }
    // public function editar_proveedor_material($id,$proveedor,$material,$empresa) {
    //     // echo json_encode(array($id,$nombre,$codigo,$nit,$detalle,$direccion,$telefono,$mobil,$email,$web,$pais,$ciudad,$zona,$contacto,$empresa));
    //     $idempresa = $this->getidempresa($empresa);

    //     $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$proveedor' AND material_idmaterial = '$material'");
    //     $resultado = $consulta->fetch_assoc();
    //     $totalRegistros = $resultado['total'];

    //     if ($totalRegistros > 0) {
    //         $res = array("danger", "El registro ya existe","editarProveedorMaterial");
    //     } else {
    //         // Insertar el nuevo registro
    //         $registroListaCompra = $this->dbp->query("UPDATE proveedor_has_material
    //                                 SET proveedor_idproveedor = '$proveedor',
    //                                     material_idmaterial = '$material'

    //                                 WHERE idproveedor_has_material = '$id' AND empresa_idempresa='$idempresa';");
    //         if ($registroListaCompra === TRUE) {                                                                                                                                                                
    //             $res = array("success", "Edición exitosa ProveedorMaterial");
    //         } else {
    //             $res = array("danger", "No se pudo registrar",$id,$proveedor,$material,$empresa);
    //         }
    //     }
    //     echo json_encode($res);

    // }
    public function    eliminar_proveedor($idproveedor,$idempresa){
        // echo json_encode(array($idproveedor,$idempresa,"hola"));

        // $idempresa = $this->getidempresa($empresa);
            $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
            $resultado = $consulta->fetch_assoc();
            $totalRegistros = $resultado['total'];

            if ($totalRegistros > 0) {
                $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
            } else {
                // Insertar el nuevo registro
                $registroProveedor = $this->dbcm->query("DELETE FROM proveedor WHERE id_proveedor = '$idproveedor'");
                if ($registroProveedor === TRUE) {                                                                                                                                                    
                    $res = array("success", "se elimino exitosamente","eliminar_proveedor");
                } else {
                    $res = array("danger", "No se pudo registrar");
                }
            }
            echo json_encode($res);
    }
    // public function eliminar_proveedor_material($idproveedorMat,$idempresa){
    //     // echo json_encode(array($idproveedor,$idempresa,"hola"));

    //     // $idempresa = $this->getidempresa($empresa);
    //         // $consulta = $this->dbp->query("SELECT COUNT(*) AS total FROM proveedor_has_material WHERE proveedor_idproveedor = '$idproveedor'");
    //         // $resultado = $consulta->fetch_assoc();
    //         // $totalRegistros = $resultado['total'];

    //         if (0 > 0) {
    //             $res = array("danger", "No se puede eliminar porque hay registros en proveedor_has_material","eliminar_proveedor");
    //         } else {
    //             // Insertar el nuevo registro
    //             $registroProveedor = $this->dbp->query("DELETE FROM proveedor_has_material WHERE idproveedor_has_material = '$idproveedorMat'");
    //             if ($registroProveedor === TRUE) {                                                                                                                                                    
    //                 $res = array("success", "se elimino exitosamente","eliminar_proveedor_material");
    //             } else {
    //                 $res = array("danger", "No se pudo registrar");
    //             }
    //         }
    //         echo json_encode($res);
    // }
    // public function buscarProveedorPorMaterial($proveedor,$empresa){
    //     $lista = [];
    //     $idempresa = $this->getidempresa($empresa);
    //     $getPedido = $this->dbp->query("SELECT idproveedor_has_material,proveedor_idproveedor, material_idmaterial FROM proveedor_has_material WHERE empresa_idempresa = '$idempresa' AND proveedor_idproveedor = '$proveedor'");
    //     // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
    //     while($qwe=$this->dbp->fetch($getPedido)){
    //          $res=array("id_ProveedorMaterial"=>$qwe[0],"proveedor"=>$qwe[1],"material"=>$qwe[2]); //'nombre' sale del formulario de input hidden
    //         array_push($lista,$res);
    //      }
    
    //     // $getPedido = $this->dbcm->query("SELECT * FROM proveedor WHERE id_proveedor = 7"); 
    //     //  while($qwe=$this->dbcm->fetch($getPedido)){
    //     //      $res=array("id"=>$qwe[0],"fecha"=>$qwe[1],"hora"=>$qwe[2],"estado"=>$qwe[3],"empleado"=>$qwe[4]); //'nombre' sale del formulario de input hidden
    //     //     array_push($lista,$res);
    //     //  }
    //       echo json_encode($lista);
    // }
    // public function listarProveedores_por_unMaterial($idmaterial){
    //     $lista = [];
    //     // $idempresa = $this->getidempresa($empresa);
    //     $idsprov = $this->dbp->query("SELECT proveedor_idproveedor FROM proveedor_has_material WHERE material_idmaterial ='$idmaterial';");
    //     $listaprov = [];
    //     while($idMat = $this->dbp->fetch($idsprov)) {
    //         $listaprov[] = $idMat['proveedor_idproveedor'];
    //     }

    //     $idsProveedor = implode(",", $listaprov);
        
    //     $getPedido = $this->dbcm->query("SELECT * 
    //                 FROM proveedor 
    //                 WHERE id_proveedor IN ($idsProveedor);");
    //     // $nombre, $codigo, $nit, $detalle, $direccion, $telefono,$mobil, $email, $web, $pais, $ciudad, $zona, $contacto,$empresa
    //     while($qwe=$this->dbcm->fetch($getPedido)){
    //          $res=array("id_proveedor"=>$qwe['id_proveedor'],"nombre"=>$qwe['nombre'],"codigo"=>$qwe['codigo'],"nit"=>$qwe['nit'],"detalle"=>$qwe['detalle'],"direccion"=>$qwe['direccion'],"telefono"=>$qwe['telefono'],"mobil"=>$qwe['mobil'],"email"=>$qwe['email'],"web"=>$qwe['web'],"pais"=>$qwe['pais'],"ciudad"=>$qwe['ciudad'],"zona"=>$qwe['zona'],"contacto"=>$qwe['contacto']); //'nombre' sale del formulario de input hidden
    //         array_push($lista,$res);
    //      }
    //       echo json_encode($lista);
    // }
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }

}
?>