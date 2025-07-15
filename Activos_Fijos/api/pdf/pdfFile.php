<?php

class PDFFile {
    private $datosEmpresa;
    private $AF_ENV;
    public function __construct(){
        $this->datosEmpresa= $_SESSION["af_datosempresa"];
        include "../db/af_env.php";
        $this->AF_ENV = $AF_ENV;
    }

    public function pdfPrimary($title){
        // <img class="afr-logo" src="./pdf/css/utils/logo2.png">
        // <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        // <img src="http://vivasoft.link/app/em/'. $this->datosEmpresa->logo .'" width="50" height="50">
        // <img src="'. $this->AF_ENV["apiUrl"] .'/app/em/'. $this->datosEmpresa->logo .'">


        $htmlHeader ='
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>'. $title .'</title>
            <link rel="stylesheet" href="./pdf/css/reportes.css"/>                
        </head>
        <body class="reportaf">
            <div class="afr-header afr-h-mb">
                <div class="afr-h-left afr-pb">
                    <div class="afr-text-lg"> '. $this->datosEmpresa->nombre .'</div>
                    <div> '. $this->datosEmpresa->direccion .'</div>
                    <div> '. ($this->datosEmpresa->ociudad ?? "") .'</div>
                    <div> '. ($this->datosEmpresa->oestado ?? "") .'</div>
                    <div> '. ($this->datosEmpresa->opais ?? "") .'</div>
                </div>
                <div class="afr-h-center">
                    <table class="afr-h-table">
                        <tr>
                            <td>
                                <img class="afr-logo" src="'. $this->AF_ENV["apiUrl"] .'/app/em/'. $this->datosEmpresa->logo .'">
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="afr-h-right afr-pb">
                    <div class="afr-text-lg"> NIT: '. $this->datosEmpresa->nit .'</div>
                    <div>Tel: '. $this->datosEmpresa->telefono .'</div>
                    <div>Cel: '. ($this->datosEmpresa->ocelular ?? "-") .'</div>
                    <div> '. $this->datosEmpresa->email .'</div>
                    <div> '. ($this->datosEmpresa->ositioweb ?? "") .'</div>
                </div>
            </div>
            <main>';
                
        $htmlFooter = '</main>
        </body>
        </html>';

        return [
            'header' => $htmlHeader,
            'footer' => $htmlFooter
        ];

        
    }

    public function createPdf($content, $title, $format = 'Letter'){
        require_once ('../vendor/autoload.php');
        $fontDirs = (new Mpdf\Config\ConfigVariables())->getDefaults()['fontDir'];
        $fontDirs = array_merge($fontDirs, [__DIR__ . '/fonts']);

        $fontData = (new Mpdf\Config\FontVariables())->getDefaults()['fontdata'];
        // $fontData['inter'] = [
        //     'R' => 'Inter-Regular.ttf',
        //     'B' => 'Inter-SemiBold.ttf',
        // ];
        $fontData['arial'] = [
            'R' => 'Arial.ttf',
            'B' => 'Arial-B.ttf',
            'I' => 'Arial-I.ttf',
            'BI' => 'Arial-BI.ttf',
        ];

        $mpdf = new \Mpdf\Mpdf([
            'fontDir' => $fontDirs,
            'fontdata' => $fontData,
            'default_font' => 'arial',
            'format' => $format,
        ]);

        $html = $this->pdfPrimary( $title);
        $mpdf->WriteHTML($html['header']);
        if(is_array($content)){
            foreach($content as $c){
                $mpdf->WriteHTML($c);
            }
        }else{
            $mpdf->WriteHTML($content);
        }
        $mpdf->WriteHTML($html['footer']);
        $mpdf->Output();
    }

    public function filtersPDF($filters) {
        $subtitle = "";

        if (isset($filters) && $filters) {
            foreach ($filters as $key => $value) {
                $subtitle.= '<span>'. $value->nombre ."</span>: ". $value->valor .", ";
            }
            $subtitle = substr($subtitle, 0, -2);
        }
        return $subtitle;
    }

    public function FormatoDate($date){
        if (empty($date)) {
            return "-";
        }
        $arrDate = explode("-", $date);
        if (count($arrDate) == 3) {
            return $arrDate[2]."/".$arrDate[1]."/".$arrDate[0];
        } else {
            return $date;
        }
    }

    public function FormatoDateTime($date){
        if (empty($date)) {
            return "-";
        }
        $arrDateTime = explode(" ", $date);
        if(count($arrDateTime) == 2){
            $arrDate = explode("-", $arrDateTime[0]);
            $arrTime = explode(":", $arrDateTime[1]);
            if (count($arrDate) == 3 && count($arrTime) == 3) {
                return $arrDate[2] ."/". $arrDate[1] ."/". $arrDate[0] ." ". $arrDateTime[1];
            } else {
                return $date;
            }
        } else {
            return $date;
        }
    }

    public function FormatoNumber($numero){
        return number_format((float)$numero, 2, ".", ",");
    }
}

?>