<?php
    class DBConnection extends mysqli{

        private $schema;

        public function __construct($server = "activosfijos") {
            if ($server == "rrhh") {
                $this->connection("localhost", "u335921272_rrhh","@Rrhh#234","u335921272_rrhh");    //! YoFinanciero
            } else if ($server == "empresa") {
                $this->connection("localhost", "u335921272_vempresa","@Empresa123","u335921272_vempresa");      //! YoFinanciero
            } else if ($server == "activosfijos") {
                $this->connection();    
            } else {
                $res = [
                    "message" => "connection failed",
                    "info" => "server not found",
                    "status" => 500
                ];
                die(json_encode($res, http_response_code($res["status"]) | JSON_UNESCAPED_UNICODE));
            }
        }

        // conexión a la base de datos	
        public function connection($server = "localhost", $user = "u335921272_af", $pass = "@Afijos#234", $schema = "u335921272_af"){   //! YoFinanciero
            try {
                $this->schema = $schema;
                parent::__construct($server, $user, $pass, $schema);
                $this->query("SET NAMES 'utf8';");
                $this->query("SET CHARACTER SET utf8;");
                $this->query("SET SESSION collation_connection = 'utf8_unicode_ci';");
            } catch (Throwable $e) {
                if($this->connect_errno){
                    $res = [
                        "message" => "connection failed",
                        "info" => mysqli_connect_error(),
                        "status" => 500
                    ];

                    die(json_encode($res, http_response_code($res["status"]) | JSON_UNESCAPED_UNICODE));
                }
            }
        }

        public function rows($y){
         return mysqli_num_rows($y);
        }

        public function all($y, $mode = MYSQLI_NUM){
            return mysqli_fetch_all($y, $mode);
        }

        public function fetch($y, $mode = MYSQLI_BOTH){
          return mysqli_fetch_array($y, $mode);	
        }
        public function assoc($y){
            return mysqli_fetch_assoc($y);
        }
        public function object($y){
            return mysqli_fetch_object($y);
        }

        public function getNameSchema() {
            return $this->schema;
        }
    }
?>