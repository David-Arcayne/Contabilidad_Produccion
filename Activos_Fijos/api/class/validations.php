<?php 

    class Validations {

        private $table;

        public function __construct($table)
        {
            $this->table = $table;    
        }
        
        public function getColumsData($form_columns){
            $db = new DBConnection();
            $schema = $db->getNameSchema();

            $request = $db->query("SELECT COLUMN_NAME AS item FROM information_schema.columns WHERE table_schema = '$schema' AND table_name = '$this->table'")->fetch_all(MYSQLI_ASSOC);

            $form_keys = array_keys($form_columns);
            $columns = array();
            foreach ($request as $key => $value) {
                if(in_array($value["item"], $form_keys)){
                    $columns[$value["item"]] = $form_columns[$value["item"]];
                }
            }
            if($columns) {
                return $columns;
            } else {
                $res = [
                    "message" => "se requiere al menos una columna",
                    "status" => 400
                ];
                die(json_encode($res, http_response_code($res["status"])));
            }
        }


        // verificar si el compo es requerido
        public function isRequired($data, $column) {
            if (!$data){
                return "El campo '$column' es requerido.";
            }
            return false;
        }

        // validar si es un NÚMERO válido
        public function isNumber($data, $column){
            $val = filter_var($data, FILTER_VALIDATE_INT);
            if ($val === false) {
                return "El campo '$column' debe ser numérico.";
            }
            return false;
        }

        // validar si es una CADENA válida
        public function isString($data, $column) {
            if (!is_string($data)) {
                return "El campo '$column' debe ser una cadena.";
            }
            return false;
        }
    
        // validar si es un BOOLEANO válida
        public function isBool($data, $column) {
            // $val = filter_var(false, FILTER_VALIDATE_BOOLEAN);

            if($data === false || $data === "false" || $data === 0 || $data === true || $data === "true" || $data === "1") {
                return "El campo '$column' debe ser falso o verdadero";
            }
            return false;            
        }

        // validar si es un EMAIL válida
        public function isEmail($data, $column) {
            $val = filter_var($data, FILTER_VALIDATE_EMAIL);
            if ($val === false) {
                return "El campo '$column' debe ser un correo  electrónico válido";
            }
            return false;
        }
    
        // validar si es una URL válida
        public function isUrl($data, $column) {
            $val = filter_var($data, FILTER_VALIDATE_URL);
            if ($val === false) {
                return "El formato de '$column' es inválido";
            }
            return false;
        }

        // validar si es una FECHA válida
        public function isDate($data, $column) {
            $date_one = '/^\d{2,4}\W\d{1,2}\W\d{1,2}/';
            $date_two = '/^\d{1,2}\W\d{1,2}\W\d{2,4}/';
            // $val = preg_match($date_one,$data);
            if (!preg_match($date_one,$data) || !preg_match($date_two,$data)) {
                return "El campo '$column' no es una fecha válida";
            }
            return false;
        }

        // validar si es dato ÚNICO en la DB
        public function isUnique($data, $column, $filter = "") {
            $db = new DBConnection();
            $request = $db->query("SELECT $column FROM $this->table WHERE $column = '$data' $filter")->fetch_all(MYSQLI_ASSOC);
            if($request) {
                return "El campo '$column' ya existe";
            }
            return false;
        }

        public function handleImage($name) {
            if (!file_exists($_FILES[$name]['tmp_name']) || !is_uploaded_file($_FILES[$name]['tmp_name']))
            {
                // $imagen=$_POST["imagenactual"];   ///  para cuando sea editar no seleccionara ninguna imagen pero
                // debe cargarse la imagen que estaba de muestra
                return false;
            }
            // en caso de que si exista nos aseguramos que sea una imagen
            else
            {
                // obtenemos la extension   whatsapp1212.11.05.15.jpeg = [whatsapp1212 , 11 , 05 , 15 , jpeg]
                $ext = explode(".", $_FILES[$name]["name"]);   #    mantequilla.jpg   =   [mantequilla , jpg]
                // preguntamos que tipo de extencion tiene de otra forma
                $allowedFileType = ["image/jpg", "image/jpeg", "image/png"];
                if (in_array( $_FILES[$name]['type'], $allowedFileType))
                {
                    // cambiamos el nombre de la imagen con la fecha y extension
                    $imagen = round(microtime(true)) . '.' . end($ext);    #  65165156165.jpg
                    // uniqid ( cadena $prefix= "" , bool $more_entropy=false ): cadena
                    return ["name" => $imagen, "image" => $_FILES[$name]["tmp_name"]];
    
                    // move_uploaded_file($_FILES["imagen"]["tmp_name"], "../imagenes/productos/" . $imagen);
                } else {
                    return 0;
                }
            }
        }

        public function handlePDF($name) {
            if (isset($_FILES[$name]) && $_FILES[$name]['error'] === UPLOAD_ERR_OK) {
                // Verificar si es un archivo PDF
                $archivo_nombre = $_FILES[$name]['name'];
                $archivo_tmp = $_FILES[$name]['tmp_name'];
                $archivo_tipo = $_FILES[$name]['type'];
            
                $extension = strtolower(pathinfo($archivo_nombre, PATHINFO_EXTENSION));
                if ($extension === 'pdf' && $archivo_tipo === 'application/pdf') {
                    // Definir la carpeta de destino
                    // $carpeta_destino = 'archivos_pdf/';
            
                    // Mover el archivo a la carpeta de destino
                    // $archivo_destino = $carpeta_destino . $archivo_nombre;
                    // if (move_uploaded_file($archivo_tmp, $archivo_destino)) {
                    //     echo "El archivo PDF se ha subido correctamente.";
                    // } else {
                    //     echo "Error al subir el archivo PDF.";
                    // }
                    $ext = explode(".", $archivo_nombre);
                    $fileName = round(microtime(true)) . '.' . end($ext);
                    return ["name" => $fileName, "file" => $_FILES[$name]["tmp_name"]];
                } else {
                    // echo "El archivo debe ser un PDF.";
                    return 2;
                }
            } else {
                // echo "No se ha seleccionado ningún archivo PDF.";
                return 3;
            }
        }
    }
?>