<?php 
    class FilesConfiguration {
        private $datosEmpresa;
        private $AF_ENV;
        public function __construct(){
            $this->datosEmpresa= $_SESSION["af_datosempresa"];
            include "../db/af_env.php";
            $this->AF_ENV = $AF_ENV;
        }

        public function reportCategory($data){
            $dataCategory = $data["data"];

            $tableContent = function () use ($dataCategory) {
                $tbody = '';
                foreach ($dataCategory as $key => $value) {
                    $tbody .= '<tr>
                        <td>'. $value["codificacion"] .'</td>
                        <td>'. $value["nombre"] .'</td>
                        <td class="afr-te">'. $value["vidautil"] .'</td>
                        <td class="afr-te">'. $value["coeficiente"] .'</td>
                        <td>'. $value["descripcion"] .'</td>
                    </tr>'; 
                }
                return $tbody;              
            };

            $table = '';

            if ($dataCategory) {
                $tbody = $tableContent();
                $table = '                                            
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th>Codigo</th>
                                <th>Nombre</th>
                                <th>Vida util</th>
                                <th>Coeficiente</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        '. $tbody .'
                    </table>';
            }
            
            $mainContent = '
                <div>
                    <h1>Reporte Categoria</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $table;

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Reporte de Categoria");
        }
        
        public function reportAssetType($data){
            $dataAT = $data["data"];

            $tableContent = function () use ($dataAT) {
                $tbody = '';
                // $counter = 0;
                foreach ($dataAT as $key => $value) {
                    // $counter ++;
                    $tbody .= '<tr>
                        <td>'. $value["codificacion"] .'</td>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. $value["descripcion"] .'</td>
                        <td>'. $value["nombrecategoria"] .'</td>
                    </tr>'; 
                }
                return $tbody;              
            };

            $table = '';
            if ($dataAT) {
                $tbody = $tableContent();
                $table = '                                            
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th>Codigo</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                            </tr>
                        </thead>
                        '. $tbody .'
                    </table>';
            }
            
            $mainContent = '
                <div>
                    <h1>Reporte Tipo de bien</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $table;

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Tipo de bien");
        }
        
        public function reportSituationType($data){
            $dataST = $data["data"];

            $tableContent = function () use ($dataST) {
                $tbody = '';
                foreach ($dataST as $key => $value) {
                    $tbody .= '<tr>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. ($value["tipo"] == 1 ? "Rehabilitado" : "Deshabilitado") .'</td>
                    </tr>'; 
                }
                return $tbody;              
            };

            $table = '';
            if ($dataST) {
                $tbody = $tableContent();
                $table = '                                            
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        '. $tbody .'
                    </table>';
            }
            
            $mainContent = '
                <div>
                    <h1>Reporte Tipo situación</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $table;

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Tipo situación");
        }
        
        public function reportUnsubscribeType($data){
            $dataUT = $data["data"];

            $tableContent = function () use ($dataUT) {
                $tbody = '';
                foreach ($dataUT as $key => $value) {
                    $tbody .= '<tr>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. $value["descripcion"] .'</td>
                    </tr>'; 
                }
                return $tbody;              
            };

            $table = '';
            if ($dataUT) {
                $tbody = $tableContent();
                $table = '                                            
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        '. $tbody .'
                    </table>';
            }
            
            $mainContent = '
                <div>
                    <h1>Reporte motivos de baja</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $table;

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Motivos de baja");
        }
        
        public function reportStateType($data){
            $dataST = $data["data"];

            $tableContent = function () use ($dataST) {
                $tbody = '';
                foreach ($dataST as $key => $value) {
                    $tbody .= '<tr>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. $value["descripcion"] .'</td>
                    </tr>'; 
                }
                return $tbody;              
            };

            $table = '';
            if ($dataST) {
                $tbody = $tableContent();
                $table = '                                            
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        '. $tbody .'
                    </table>';
            }
            
            $mainContent = '
                <div>
                    <h1>Reporte tipos de estado</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $table;

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Tipos de estado");
        }
        
        public function reportExchangeRate($data){
            $pdf = new PDFFile();
            $dataST = $data;

            $tableContent = function () use ($dataST , $pdf) {
                $arrTbody = [];
                $tbody = '';
                $contador = 0;
                foreach ($dataST as $key => $value) {
                    $contador++;
                    $tbody .= '<tr>
                        <td>'. $pdf->FormatoDate($value["fecha"]) .'</td>
                        <td class="afr-te">'. $value["ufv"] .'</td>
                        <td class="afr-te">'. $pdf->FormatoNumber($value["dolar"]) .'</td>
                    </tr>'; 
                    if ($contador == 100) {
                        array_push($arrTbody, $tbody);
                        $tbody = '';
                        $contador = 0;
                    }
                }
                if ($tbody) {
                    $tbody .= '</tbody></table>';
                    array_push($arrTbody, $tbody);
                }
                return $arrTbody;              
            };

            $table = '';
            if ($dataST) {
                $table = '  
                <div>
                    <h1>Reporte tipo de cambio</h1>
                </div>
                <div class="afr-filter-void"></div>                                          
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>UFV</th>
                            <th>Dolar</th>
                        </tr>
                    </thead>
                    <tbody>';
            }
            $tbody = $tableContent();

            $pdf->createPdf([$table, ...$tbody], "Tipo de cambio");
        }

        public function reportInventoryType($data){
            $dataUT = $data["data"];

            $tableContent = function () use ($dataUT) {
                $tbody = '';
                foreach ($dataUT as $key => $value) {
                    $tbody .= '<tr>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. $value["detalle"] .'</td>
                        <td>'. ($value["tipo"] == 1 ? "Depreciable" : "No Depreciable") .'</td>
                    </tr>'; 
                }
                return $tbody;              
            };

            $table = '';
            if ($dataUT) {
                $tbody = $tableContent();
                $table = '                                            
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Detalle</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        '. $tbody .'
                    </table>';
            }
            
            $mainContent = '
                <div>
                    <h1>Reporte Tipo Inventario</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $table .'
            ';

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Tipo de inventario");
        }
    }
?>