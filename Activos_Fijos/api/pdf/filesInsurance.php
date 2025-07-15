<?php 
    class FilesInsurance {
        private $datosEmpresa;
        private $AF_ENV;
        public function __construct(){
            $this->datosEmpresa= $_SESSION["af_datosempresa"];
            include "../db/af_env.php";
            $this->AF_ENV = $AF_ENV;
        }

        public function reports($data){
            $pdf = new PDFFile();
            $subtitle = $pdf->filtersPDF($data["info"]);

            $html ='
                <div>
                    <h1>Reporte Seguros</h1>
                </div>
                <div class="afr-filters-t">
                    '. $subtitle .'
                </div>
                <table class="afr-table">
                    <thead >
                        <tr>
                            <th>Aseguradora</th>
                            <th>Tipo de seguro</th>
                            <th>Nro. Póliza</th>
                            <th>Código</th>
                            <th>Certificado</th>
                            <th>Fecha inicio seguro</th>
                            <th>Caducidad</th>
                            <th>Detalle</th>
                            <th>Contacto</th>
                        </tr>
                    </thead>
                    <tbody>';

            $htmlTable = "";
                foreach ($data["data"] as $key => $value) {
                    $htmlTable .= '<tr>
                        <td >'. (isset($data["company"][$value["empresaseguro_id"]]) ? $data["company"][$value["empresaseguro_id"]] : "-").'</td>
                        <td >'. $value["nombretiposeguro"] .'</td>
                        <td >'. $value["poliza"] .'</td>
                        <td >'. $value["codigo"] .'</td>
                        <td >'. $value["certificado"] .'</td>
                        <td class="afr-te">'. $pdf->FormatoDateTime($value["periodoa"]) .'</td>
                        <td class="afr-te">'. $pdf->FormatoDateTime($value["periodob"]) .'</td>
                        <td >'. $value["detalle"] .'</td>
                        <td >'. $value["contacto"] .'</td>
                    </tr>';
                }
            $htmlTable .= '
                    </tbody>
                </table>';

            $html = $html.$htmlTable;

            $pdf->createPdf($html, "Reporte Seguros", "Letter-L");
        }
    }
?>