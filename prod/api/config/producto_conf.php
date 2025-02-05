<?php
require_once "../../db/db.php";
class Producto_conf extends DB{

    function sincronizar_con_comercial($empresa) {
        $idempresa = $this->getidempresa($empresa);
        $sql = "SELECT id_productos, nombre, codigo, descripcion, cod_barras, fecha_registro, imagen, categorias_id_categorias, medida_id_medida, estados_productos_id_estados_productos, unidad_id_unidad, idempresa FROM productos WHERE idempresa = ?";
    
        // Preparar la consulta
        $stmt = $this->dbcm->prepare($sql);
        if (!$stmt) {
            echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta en comercial", "function" => "sincronizar_con_comercial"));
            return;
        }
    
        $stmt->bind_param("i", $idempresa);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $check_sql = "SELECT idproducto FROM producto WHERE idproduct_comercial = ?";
                $stmt_check = $this->dbp->prepare($check_sql);
        
                if (!$stmt_check) {
                    echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta SELECT", "function" => "sincronizar_con_comercial"));
                    return;
                }
        
                $stmt_check->bind_param("i", $row['id_productos']);
                $stmt_check->execute();
                $check_result = $stmt_check->get_result();
                $stmt_check->close(); 
        
                if ($check_result && $check_result->num_rows == 0) { 
                    $insert_sql = "INSERT INTO producto (idproduct_comercial, estado, cantidad, tiempo_produccion, rubro_idrubro, Unidad_tiempo_idUnidad_tiempo) VALUES (?, ?, ?, ?, ?, ?)";
                    $stmt_insert = $this->dbp->prepare($insert_sql);
                    if (!$stmt_insert) {
                        echo json_encode(array("status" => "error", "message" => "Error en la preparación de la consulta INSERT", "function" => "sincronizar_con_comercial"));
                        return;
                    }
    
                    // Variables para el bind_param
                    $estado = 0; 
                    $cantidad = 0;
                    $tiempo = 0;
                    $idunidadtiempo = 1;
    
                    // Obtener rubro_idrubro
                    $getLista = $this->dbp->query("SELECT idrubro FROM rubro WHERE empresa_idempresa ='$idempresa' LIMIT 1;");
                    $resultado = $getLista->fetch_assoc();
                    $rubro_idrubro = $resultado['idrubro'];
    
                    // Enlazar y ejecutar la inserción
                    $stmt_insert->bind_param("iiidii", $row['id_productos'], $estado, $cantidad, $tiempo, $rubro_idrubro, $idunidadtiempo);
                    $stmt_insert->execute();
                    $stmt_insert->close(); 
                }
            }
            return;
        } else {
            $res = array("status" => "error", "message" => "No se encontraron productos en la base de datos comercial", "function" => "sincronizar_con_comercial");
        }
        
        $stmt->close(); // Cerrar stmt después de usarlo
        echo json_encode($res);
    }
    
    public function listar_unidad_tiempo(){
        $lista = [];
 

        $query = "select ut.idUnidad_tiempo, ut.unidad from Unidad_tiempo As ut;";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("Error" , "No se pudo preparar la consulta","listar_tipomaquina"));
            return;
        }
        $stmt->execute();
        $result = $stmt->get_result();
        if($result === false){
            echo json_encode(array("Error","Error al ejecutar la consulta","listar_tipomaquina"));
            return;
        }
        while ($tiempo = $result->fetch_assoc()) {
            $res = array(
                "id" => $tiempo['idUnidad_tiempo'],
                "unidad" => $tiempo['unidad'],                
            );
            array_push($lista,$res);
        }
        $stmt->close();
        echo json_encode($lista);
    }
    public function registro_producto_comercial($nombre, $codigo, $descripcion, $cod_barras, $fecha_registro, $imagen, $categorias_id_categorias, $medida_id_medida, $estados_productos_id_estados_productos, $unidad_id_unidad, $caracteristicas, $empresa, $codigosin = null, $actividadsin = null, $unidadsin = null, $codigonandina = null,$estado, $rubro, $cantidad, $tiempo, $idunidadtiempo,$subproducto) {
        $idempresa = $this->getidempresa($empresa);
    
        $verificarQuery = "SELECT COUNT(*) AS count FROM productos WHERE codigo = ?  AND idempresa = ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registro_producto_comercial"));
            return;
        }
    
        $stmt->bind_param("si", $codigo, $idempresa);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe un producto con el mismo código.", "registro_producto_comercial");
        } else {
            $query = "INSERT INTO productos (nombre, codigo, descripcion, cod_barras, fecha_registro, imagen, categorias_id_categorias, medida_id_medida, estados_productos_id_estados_productos, unidad_id_unidad, caracteristicas, idempresa, codigosin, actividadsin, unidadsin, codigonandina) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta", "registro_producto_comercial"));
                return;
            }    
            $stmt->bind_param("ssssssiiiiiissss", $nombre, $codigo, $descripcion, $cod_barras, $fecha_registro, $imagen, $categorias_id_categorias, $medida_id_medida, $estados_productos_id_estados_productos, $unidad_id_unidad, $caracteristicas, $idempresa, $codigosin, $actividadsin, $unidadsin, $codigonandina);
            $registro = $stmt->execute();
            if ($registro) {
                $idproduct_comercial = $this->dbcm->insert_id;  
                $stmt->close();
                $this->registrar_producto($idproduct_comercial,$estado, $rubro, $cantidad, $tiempo, $idunidadtiempo, $subproducto);
                return;
            } else {
                $res = array("Error", "No se registró correctamente: " . $stmt->error, "registro_producto_comercial");
                $stmt->close();
            }
   
        }

        echo json_encode($res);
    }

    public function registrar_producto( $idproduct_comercial,$estado, $rubro,  $cantidad, $tiempo, $idunidadtiempo, $subproducto) {

        $verificarQuery = "SELECT COUNT(*) AS count FROM producto WHERE rubro_idrubro = ? AND idproduct_comercial = ?";
        $stmt = $this->dbp->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "registrar_producto"));
            return;
        }
        $stmt->bind_param("ii", $rubro, $idproduct_comercial);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
    
        if ($count > 0) {
            $res = array("Error", "Ya existe una entrada con el mismo tipo.", "registrar_producto");
        } else {
            $query = "INSERT INTO producto (idproduct_comercial, estado, cantidad, tiempo_produccion, rubro_idrubro,  Unidad_tiempo_idUnidad_tiempo, subproducto) VALUES (?, ?, ?, ?, ?, ?, ?);";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta"));
                return;
            }
          
            $stmt->bind_param("iiidiii", $idproduct_comercial, $estado, $cantidad, $tiempo, $rubro, $idunidadtiempo, $subproducto);

            $registro = $stmt->execute();
    
            if ($registro) {
                
                $res = array("ok", "Se registraron correctamente ambos registros", "registrar_producto");   
    
            } else {
                $res = array("Error", "No se registró correctamente el registro del producto: " . $stmt->error, "registrar_producto");
            }
            $stmt->close();
        }
        echo json_encode($res);
    }
    
    public function guardarImagen_producto() {
        $target_dir = "../imagen/";
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0755, true);
        }
    
        $imageFileType = strtolower(pathinfo($_FILES["imagen"]["name"], PATHINFO_EXTENSION));
        $unique_name = uniqid("img_", true) . '.' . $imageFileType;
        $target_file = $target_dir . $unique_name;
    
        $check = getimagesize($_FILES["imagen"]["tmp_name"]);
        if ($check === false) {
            echo json_encode(["Error", "El archivo no es una imagen", "guardarImagen"]);
            return false;
        }
    
        if (file_exists($target_file)) {
            echo json_encode(["Error", "El archivo ya existe", "guardarImagen"]);
            return false;
        }
    
        if (!in_array($imageFileType, ["jpg", "jpeg", "png"])) {
            echo json_encode(["Error", "Solo se permiten archivos JPG, JPEG, PNG", "guardarImagen"]);
            return false;
        }
    
        // Redimensionar imagen
        $max_width = 500;
        $max_height = 500;
    
        list($width, $height) = getimagesize($_FILES["imagen"]["tmp_name"]);
    
        // Calcular las nuevas dimensiones manteniendo la proporción
        $ratio = min($max_width / $width, $max_height / $height);
        $new_width = round($width * $ratio);
        $new_height = round($height * $ratio);
    
        // Crear una nueva imagen con el tamaño calculado
        $new_image = imagecreatetruecolor($new_width, $new_height);
    
        // Crear una imagen desde el archivo original
        switch ($imageFileType) {
            case 'jpg':
            case 'jpeg':
                $source_image = imagecreatefromjpeg($_FILES["imagen"]["tmp_name"]);
                break;
            case 'png':
                $source_image = imagecreatefrompng($_FILES["imagen"]["tmp_name"]);
                // Preservar transparencia para PNG
                imagealphablending($new_image, false);
                imagesavealpha($new_image, true);
                break;
            default:
                echo json_encode(["Error", "Tipo de archivo no soportado", "guardarImagen"]);
                return false;
        }
    
        // Redimensionar la imagen original a la nueva imagen
        imagecopyresampled($new_image, $source_image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
    
        // Guardar la nueva imagen redimensionada
        switch ($imageFileType) {
            case 'jpg':
            case 'jpeg':
                imagejpeg($new_image, $target_file, 90); // Calidad de 90%
                break;
            case 'png':
                imagepng($new_image, $target_file, 9); // Compresión máxima (0-9)
                break;
        }
    
        // Liberar memoria
        imagedestroy($source_image);
        imagedestroy($new_image);
    
        return "./imagen/" . htmlspecialchars($unique_name);
    }
    
    public function editar_producto_comercial($id_productos,$img,$nombre, $codigo, $descripcion, $cod_barras,$categorias_id_categorias, $medida_id_medida, $estados_productos_id_estados_productos, $unidad_id_unidad,  $rubro, $cantidad, $tiempo, $idunidadtiempo,$subproducto,$empresa){
        
        $idempresa = $this->getidempresa($empresa);
        $verificarQuery = "SELECT COUNT(*) AS count FROM productos WHERE codigo = ?  AND idempresa = ? AND id_productos != ?";
    
        $stmt = $this->dbcm->prepare($verificarQuery);
        if ($stmt === false) {
            echo json_encode(array("Error", "No se pudo preparar la consulta", "editar_producto_comercial"));
            return;
        }
    
        $stmt->bind_param("ssi", $codigo, $idempresa,$id_productos);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        
        if ($count > 0) {
            $res = array("Error", "Ya existe un producto con el mismo código.", "editar_producto_comercial");
        }else{
            if($img == "./imagen/null.png"){
                // $res = array("Error","Seleccione una imagen para el producto","editar_producto_comercial");
                $sql = "UPDATE productos
                SET nombre = ?, codigo = ?, descripcion = ?, cod_barras = ?, categorias_id_categorias = ?, medida_id_medida = ?, estados_productos_id_estados_productos = ?,unidad_id_unidad = ?
                WHERE id_productos  = ?";
        $stmt = $this->dbcm->prepare($sql);
        $stmt->bind_param("ssssiiiii", 
            $nombre, $codigo, $descripcion, $cod_barras,
            $categorias_id_categorias, $medida_id_medida, $estados_productos_id_estados_productos, $unidad_id_unidad, $id_productos);
        $editar = $stmt->execute();
    
        if ($editar) {
            
            $stmt->close();
            $query_produccion = "UPDATE producto SET cantidad = ? , tiempo_produccion = ? , rubro_idrubro = ? , Unidad_tiempo_idUnidad_tiempo = ?,subproducto = ? WHERE idproduct_comercial = ? " ;
            $stmt = $this->dbp->prepare($query_produccion);
            if ($stmt === false) {
                echo json_encode(array("Error", "No se pudo preparar la consulta editar producto","editar_producto_comercial"));
            }
            $stmt->bind_param("idiiii",$cantidad,$tiempo,$rubro,$idunidadtiempo,$subproducto,$id_productos);
            $editar = $stmt->execute();


            if($editar){
                $res = array("ok","Se guardaron los cambios correctamente","editar_producto_comercial");
            }else{
                $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_producto_comercial");

            }
            

        } else {
            echo json_encode(array("Error", "Error al actualizar el registro: " . $stmt->error, "editar_producto_comercial"));
        }
        $stmt->close();

            }else{
            $sql = "UPDATE productos
                    SET imagen = ?, nombre = ?, codigo = ?, descripcion = ?, cod_barras = ?, categorias_id_categorias = ?, medida_id_medida = ?, estados_productos_id_estados_productos = ?,unidad_id_unidad = ?
                    WHERE id_productos  = ?";
            $stmt = $this->dbcm->prepare($sql);
            $stmt->bind_param("sssssiiiii", 
                $img, $nombre, $codigo, $descripcion, $cod_barras,
                $categorias_id_categorias, $medida_id_medida, $estados_productos_id_estados_productos, $unidad_id_unidad, $id_productos);
            $editar = $stmt->execute();
        
            if ($editar) {
                
                $stmt->close();
                $query_produccion = "UPDATE producto SET cantidad = ? , tiempo_produccion = ? , rubro_idrubro = ? , Unidad_tiempo_idUnidad_tiempo = ?,subproducto = ? WHERE idproduct_comercial = ? " ;
                $stmt = $this->dbp->prepare($query_produccion);
                if ($stmt === false) {
                    echo json_encode(array("Error", "No se pudo preparar la consulta editar producto","editar_producto_comercial"));
                }
                $stmt->bind_param("idiiii",$cantidad,$tiempo,$rubro,$idunidadtiempo,$subproducto,$id_productos);
                $editar = $stmt->execute();


                if($editar){
                    $res = array("ok","Se guardaron los cambios correctamente","editar_producto_comercial");
                }else{
                    $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_producto_comercial");

                }
                

            } else {
                echo json_encode(array("Error", "Error al actualizar el registro: " . $stmt->error, "editar_producto_comercial"));
            }
            $stmt->close();
        }
        }
        echo json_encode($res);
    }
    function listar_solo_productos($empresa){
        $idempresa = $this->getidempresa($empresa);

        $query = "SELECT p.id_productos, p.nombre, p.codigo,
                    p.descripcion, p.imagen, p.categorias_id_categorias,
                    p.medida_id_medida,p.estados_productos_id_estados_productos,
                    p.unidad_id_unidad
                    FROM productos p WHERE p.idempresa = ?; ";
    }

    function listar_productos_comercial($empresa) {
        
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        $this->sincronizar_con_comercial($empresa);
    
        // Obtener el ID de la empresa
        $idempresa = $this->getidempresa($empresa);
    
        // Consulta en la primera base de datos
        $query1 = "SELECT id_productos, nombre, codigo, descripcion, cod_barras, fecha_registro, imagen, categorias_id_categorias, medida_id_medida, estados_productos_id_estados_productos, unidad_id_unidad, idempresa 
                   FROM productos 
                   WHERE idempresa = ? ORDER BY id_productos DESC";
        $stmt = $this->dbcm->prepare($query1);
        if ($stmt === false) { 
            die("Error al preparar la consulta en base_de_datos_1: " . $this->dbcm->error);
        }
    
        // Ejecutar la consulta y obtener los resultados
        $stmt->bind_param("s", $idempresa); 
        $stmt->execute();
        $result1 = $stmt->get_result();
    
        $productos = [];
    
        while ($producto1 = $result1->fetch_assoc()) {
            $id_productos = $producto1['id_productos'];
    
            // Consulta en la segunda base de datos
            $query2 = "SELECT * FROM producto AS p 
                       WHERE p.idproduct_comercial = ?";
            $stmt2 = $this->dbp->prepare($query2);
            if ($stmt2 === false) {
                die("Error al preparar la consulta en base_de_datos_2: " . $this->dbp->error);
            }
    
            $stmt2->bind_param("i", $id_productos);
            $stmt2->execute();
            $result2 = $stmt2->get_result();
    
            $producto2 = $result2->fetch_assoc();
    
            // Combinar los resultados de ambas bases de datos
            $producto_combinado = array_merge($producto1, $producto2);
            $productos[] = $producto_combinado;
    
            $stmt2->close();
        }
    
        // Cerrar la primera consulta
        $stmt->close();
    
        // Devolver los resultados en formato JSON
        echo json_encode($productos);
    }
    
    
    public function editar_estado_producto($id,$estado){    
        $query = "UPDATE producto SET estado = ? WHERE idproduct_comercial = ?";
        $stmt = $this->dbp->prepare($query);

        if($stmt === false){
            echo json_encode(array("Error","No se pudo preparar la consulta","editar_estado_producto"));
            return;
        }

        $stmt->bind_param("ii",$estado,$id);
        $editar_estado = $stmt->execute();

        if($editar_estado){
            $res = array("ok","Se guardaron los cambios correctamente","editar_estado_producto");
        }else{
            $res = array("Error", "No se pudieron guardar los cambios correctamente: " . $stmt->error,"editar_estado_producto");
        }
        $stmt->close();
        
        echo json_encode($res);
        
    }
    
    public function eliminar_producto($id) {
        // Iniciar transacción
        $this->dbp->begin_transaction();
        
        try {
            // Verificar si el producto está relacionado en alguna tabla
            $relacionadas = [
                'grupo_productos' => 'No se puede eliminar porque hay registros en grupo_productos',
                'detalle_produccion' => 'No se puede eliminar porque hay registros en detalle_produccion',
                'reproceso' => 'No se puede eliminar porque hay registros en reprocesamiento',
            ];
            
            foreach ($relacionadas as $tabla => $mensaje) {
                $query = "SELECT 1 FROM $tabla WHERE producto_idproducto = ?";
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para verificar $tabla");
                }
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    throw new Exception($mensaje);
                }
                $stmt->close();
            }
    
            // Eliminar el producto_comercial
            $query = "DELETE FROM productos WHERE id_productos = ?";
            $stmt = $this->dbcm->prepare($query);
            if ($stmt === false) {
                throw new Exception("No se pudo preparar la consulta para eliminar el producto");
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();
    
                // Eliminar el producto_produccion
                $consulta = $this->dbp->query("SELECT idproducto FROM producto WHERE idproduct_comercial='$id';");
                $result = $consulta->fetch_assoc();
                $idProducto = $result['idproducto'];

                $query = "DELETE FROM producto WHERE idproducto = ?";
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) {
                    throw new Exception("No se pudo preparar la consulta para eliminar el producto");
                }
                $stmt->bind_param("i", $idProducto);
                $stmt->execute();
                $stmt->close();
    
            // Confirmar transacción
            $this->dbp->commit();
            $res = array("ok", "Se eliminó correctamente", "eliminar_producto");
    
        } catch (Exception $e) {
            // Revertir transacción
            $this->dbp->rollback();
            $res = array("Error", $e->getMessage(), "eliminar_producto");
        }
        echo json_encode($res);
    }
    
    public function getidempresa($md5){
        $registro=$this->dbe->query("select * from organizacion where md5(idorganizacion)='$md5'");
        $qwe=$this->dbe->fetch($registro);
        return $qwe['idorganizacion'];
    }   
    
    public function listar_Productos_OP($empresa){
        $lista =[];
        $idempresa = $this->getidempresa($empresa);
        $consulta = 'select p.id_productos, p.nombre, p.codigo from productos p where p.idempresa = ? ';

        $stmt = $this->dbcm->prepare($consulta);
        if ($stmt === false) {
            die("Error en la preparacion de la consulta: ".
            $this->dbcm->error);
        }
        $stmt -> bind_param("i",$idempresa);
        $stmt-> execute();

        $result = $stmt->get_result();
        if($result->num_rows > 0){
            while($row = $result->fetch_assoc()){
                $res = [
                    "id_productos" => $row['id_productos'],
                    "nombre" => $row['nombre'],
                    "codigo" => $row['codigo']
                ];
                array_push($lista,$res);
            }
        }
        $stmt -> close();
        echo json_encode($lista);

    }
}



?>