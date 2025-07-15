<?php 
    class FilesInventory {
        public function reports($data){
            $dataI = $data["dataInventarios"];

            $pdf = new PDFFile();
            $subtitle = $pdf->filtersPDF($data["info"]);

            $htmlTable = "";
            foreach ($data["data"] as $key => $value) {
                $htmlTable .= '<tr>
                    <td class="afr-tc">'. $value["codigo"] .'</td>
                    <td>'. $value["nombre"] .'</td>
                    <td>'. $value["detalle"] .'</td>
                    <td class="afr-te">'. $pdf->FormatoDate($value["fechacompra"]) .'</td>
                    <td>'. $value["nombrecategoria"] .'</td>
                    <td>'. $value["nombretipobien"] .'</td>
                    <td>'. ($value["nombretiposeguro"] ? $value["nombretiposeguro"]: "-") .'</td>
                    <td>'. ($value["nombreestado"] ? $value["nombreestado"]: "-") .'</td>
                    <td>'. ($value["observacioninv"] ? $value["observacioninv"]: "-") .'</td>
                </tr>';
            }

            $html ='
            <div>
                <h1>Reporte de Inventario Activos Fijos</h1>
            </div>
            <div class="afr-filters-t">
                '. $subtitle .'
            </div>
            <div class="afr-info">
                <div class="afr-info-left">
                    <div><span>Responsable:</span> '. $dataI["nombrecompleto"] .'</div>
                    <div><span>Fecha inicio:</span> '. $pdf->FormatoDateTime($dataI["fecha"]) .'</div>
                    <div><span>Fecha Finalización:</span> '. $pdf->FormatoDateTime($dataI["fechafin"]) .'</div>
                </div>
                <div class="afr-info-right">
                    <div><span>Título:</span> '. $dataI["descripcion"] .'</div>
                </div>
            </div>
            <br/>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Fecha de ingreso</th>
                        <th>Categoría</th>
                        <th>Tipo de Bien</th>
                        <th>Tipo seguro</th>
                        <th>Estado</th>
                        <th>Observación</th>
                    </tr>
                </thead>
                <tbody>
                    '. $htmlTable .'
                </tbody>
            </table>';

            $pdf->createPdf($html, "Historial A.F.", "Letter-L");
        }
    }
?>