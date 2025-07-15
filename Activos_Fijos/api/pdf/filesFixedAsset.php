<?php 
    class FilesFixedAsset {
        private $datosEmpresa;
        private $AF_ENV;
        private $pdf;
        public function __construct(){
            $this->datosEmpresa= $_SESSION["af_datosempresa"];
            include "../db/af_env.php";
            $this->AF_ENV = $AF_ENV;
            $this->pdf = new PDFFile();
        }

        public function history($data, $ocultos){
            $dataFA = $data["data"];
            $dataLocation = $data["dataLocation"];
            $dataTrajectory = $data["dataTrajectory"];
            $uniqueUser = $data["uniqueUser"];

            $htmlTrajectory = "";
            if($dataTrajectory){
                $total = 0;
                $htmlTrajectory = '
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th> Fecha </th>
                            <th> Tipo </th>
                            <th> Responsable </th>
                            <th> Sucursal </th>
                            <th> Área de trabajo </th>
                            <th> Cantidad </th>
                        </tr>
                    </thead>
                    <tbody>';

                foreach ($dataTrajectory as $key => $value) {
                    $htmlTrajectory .= '<tr>
                        <td>'. $this->pdf->FormatoDateTime($value["fecha"]) .'</td>
                        <td>'. ($value["tipo"] == 2 ? "Asignacción" : "Devolución") .'</td>
                        <td>'. $value["trabajador"] .'</td>
                        <td>'. $value["sucursal"] .'</td>
                        <td>'. $value["area"] .'</td>
                        <td class="afr-te">'. $value["cantidad"] .'</td>
                    </tr>';
                }
                $htmlTrajectory .= '
                    </tbody>
                </table>'; 
            } else {
                $htmlTrajectory = '<p class="afr-center"> Sin trayectoria </p>';
            }
            
            $htmlLocation = "";
            $stateMultiple = false;
            if($dataLocation && $dataFA["cantidad"] > 1){

                if (sizeof($dataLocation) == 1 && $dataLocation[0]["sucursal"] == "" && $dataLocation[0]["area"] == ""  && $dataLocation[0]["trabajador"] == "") {
                    $htmlLocation = '<p class="afr-center"> Todos los activos disponibles están sin asignar. </p>';
                } else {
                    $stateMultiple = true;
                    $htmlLocation = '
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th> Cantidad </th>
                                <th> Estado </th>
                                <th> Responsable </th>
                                <th> Sucursal </th>
                                <th> Área de trabajo </th>
                            </tr>
                        </thead>
                        <tbody>';
    
                    foreach ($dataLocation as $key => $value) {
                        if (empty($value["sucursal"]) && empty($value["area"]) && empty($value["trabajador"])) {
                            if (isset($value["array_cantidad"]) && count($value["array_cantidad"]) > 0) {
                                $sumCantidad = 0;
                                foreach ($value["array_cantidad"] as $key => $valueC) {
                                    $sumCantidad += intval($valueC["cantidad"]);
                                    $htmlLocation .= '<tr>
                                        <td class="afr-te"> '. $valueC["cantidad"] .' </td>
                                        <td> '. $valueC["nombretipoestado"] .' </td>
                                        <td colspan="3" class="afr-tsi"> Activos sin asignar. </td>
                                    </tr>';
                                }
                                if ($sumCantidad < $value["cantidad"]) {
                                    $htmlLocation .= '<tr>
                                        <td class="afr-te"> '. ($value["cantidad"] - $sumCantidad) .' </td>
                                        <td> - </td>
                                        <td colspan="3" class="afr-tsi"> Activos sin asignar. </td>
                                    </tr>';
                                }
                            } else {
                                $htmlLocation .= '<tr>
                                    <td class="afr-te"> '. $value["cantidad"] .' </td>
                                    <td> '. $value["nombretipoestado"] .' </td>
                                    <td colspan="3" class="afr-tsi"> Activos sin asignar. </td>
                                </tr>';
                            }
                        } else {
                            if (isset($value["array_cantidad"]) && count($value["array_cantidad"]) > 0) {
                                $sumCantidad = 0;
                                foreach ($value["array_cantidad"] as $key => $valueC) {
                                    $sumCantidad += intval($valueC["cantidad"]);
                                    $htmlLocation .= '<tr>
                                        <td class="afr-te"> '. $valueC["cantidad"] .' </td>
                                        <td> '. $valueC["nombretipoestado"] .' </td>
                                        <td> '. $value["trabajador"] .' </td>
                                        <td> '. $value["sucursal"] .' </td>
                                        <td> '. $value["area"] .' </td>
                                    </tr>';
                                }
                                if ($sumCantidad < $value["cantidad"]) {
                                    $htmlLocation .= '<tr>
                                        <td class="afr-te"> '. ($value["cantidad"] - $sumCantidad) .' </td>
                                        <td> - </td>
                                        <td> '. $value["trabajador"] .' </td>
                                        <td> '. $value["sucursal"] .' </td>
                                        <td> '. $value["area"] .' </td>
                                    </tr>';
                                }
                            } else {
                                $htmlLocation .= '<tr>
                                    <td class="afr-te"> '. $value["cantidad"] .' </td>
                                    <td> '. $value["nombretipoestado"] .' </td>
                                    <td> '. $value["trabajador"] .' </td>
                                    <td> '. $value["sucursal"] .' </td>
                                    <td> '. $value["area"] .' </td>
                                </tr>';
                            }
                            // $htmlLocation .= '<tr>
                            //     <td class="afr-te">'. ($value["cantidad"] ?? $value["ai_cantidad"])  .'</td>
                            //     <td>'. ($value["nombretipoestado"] ? $value["nombretipoestado"] : $dataFA["nombretipoestado"]) .'</td>
                            //     <td>'. $value["trabajador"] .'</td>
                            //     <td>'. $value["sucursal"] .'</td>
                            //     <td>'. $value["area"] .'</td>
                            // </tr>';
                        }
                    }
                    $htmlLocation .= '
                        </tbody>
                    </table>'; 
                }

            }

            $htmlMaintenance = "";
            $stateFA = 1;
            if($data["dataHistory"]){
                $total = 0;
                $htmlMaintenance = '
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Componente</th>
                            <th>Detalle</th>
                            <th>Ingreso</th>
                            <th>Salida</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>';

                foreach ($data["dataHistory"] as $key => $value) {
                    $htmlMaintenance .= '<tr>
                        <td>'. ($value["componentes_id"] ? $value["nombrecomponente"] : "-") .'</td>
                        <td>'. $value["detalle"] .'</td>
                        <td class="afr-te">'. $this->pdf->FormatoDateTime($value["fechaingreso"]) .'</td>
                        <td class="afr-te">'. $this->pdf->FormatoDateTime($value["fechasalida"]) .'</td>
                        <td class="afr-te">'. ($value["costo"] ? $this->pdf->FormatoNumber($value["costo"]) : "-") .'</td>
                    </tr>';
                    $stateFA = $value["estadoactivo"];
    
                    $total = $total + (float)round(floatval($value["costo"]), 2);
                }
                $htmlMaintenance .= '
                    <tr>
                        <td colspan="4" class="afr-te">TOTAL</td>
                        <td class="afr-te">'. $this->pdf->FormatoNumber($total) .'</td>
                    </tr>
                    </tbody>
                </table>'; 
            } else {
                $htmlMaintenance = '<p class="afr-center"> Sin mantenimientos o reparaciones </p>';
            }

            $unsubscribeFA = $data["dataUFA"];
            $htmlState = "";
            // if ($unsubscribeFA) {
            //     $htmlState = '<div><b>Situación: </b>'.$unsubscribeFA["nombretipobaja"].'</div> <br/>';
            //     $htmlth = '<table class="t-info"> <thead ><tr>';
            //     $htmltb = '</tr></thead> <tbody><tr>';

            //     if ($unsubscribeFA["detallebaja"]) {
            //         $htmlth .= '<th class="left"> Detalle </th>';
            //         $htmltb .= '<td class="left">'.$unsubscribeFA["detallebaja"].'</td>';
            //     }
            //     if ($unsubscribeFA["fechabaja"]) {
            //         $htmlth .= '<th class="left"> Fecha </th>';
            //         $htmltb .= '<td >'.$unsubscribeFA["fechabaja"].'</td>';
            //     }
            //     if ($unsubscribeFA["precio"]) {
            //         $htmlth .= '<th class="left"> Precio </th>';
            //         $htmltb .= '<td>'.$unsubscribeFA["precio"].'</td>';
            //     }
            //     $htmltb .= '</tr></tbody> </table>';

            //     if ($unsubscribeFA["detallebaja"] || $unsubscribeFA["fechabaja"] || $unsubscribeFA["precio"]) {
            //         $htmlState .= $htmlth . $htmltb;
            //     }
            // } else {
            //     if($data["dataHistory"]){
            //         $htmlState = $stateFA == 2 ? '<div><b>Situación: </b> En mantenimiento. </div>' : '<div><b>Situación: </b> Activo, reparado</div>';
            //     } else {
            //         $htmlState = '<div><b>Situación: </b> Activo, sin reparaciones </div>';
            //     }
            // }

            $htmlComponents = "";
            if($data["dataComponents"]){
                $total = 0;
                $htmlComponents = '
                <table class="afr-table">
                    <thead >
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>';

                foreach ($data["dataComponents"] as $key => $value) {
                    $htmlComponents .= '<tr>
                        <td>'. $value["codigo"] .'</td>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. $value["descripcion"] .'</td>
                        <td class="afr-te">'. $value["cantidad"] .'</td>
                    </tr>';
                }
                $htmlComponents .= '
                    </tbody>
                </table>'; 
            } else {
                $htmlComponents = '<p class="afr-center"> Sin componentes </p>';
            }
            
            $html ='
                <div>
                    <h1>Historial: '. $dataFA["nombre"] .' </h1>
                </div>
                <div class="afr-filter-void"></div>
                <div class="afr-info">
                    <div class="'. ($uniqueUser || $dataFA["cantidad"] > 1 ? "afr-info-left" : "") .'">
                        <div><span>Nombre:</span> '. $dataFA["nombre"] .'</div>
                        <div><span>Código:</span> '. $dataFA["codigo"] .'</div>
                        <div><span>Cantidad:</span> '. $dataFA["cantidad"] .'</div>
                        <div><span>Detalle:</span> '. $dataFA["detalle"] .' </div>
                        <div><span>Estado:</span> '. ($stateMultiple && $dataFA["cantidad"] > 1 ? "Varios" : ($uniqueUser && $dataLocation[0] && isset($dataLocation[0]["array_cantidad"]) ? $dataLocation[0]["array_cantidad"]["nombretipoestado"] : $dataFA["nombretipoestado"])) .'</div>
                        <div><span>Fecha de ingreso:</span> '. $this->pdf->FormatoDate($dataFA["fechacompra"]) .'</div>
                    </div>'.

                    ($uniqueUser ?
                        '<div class="afr-info-right">
                            <div><span>Región:</span> '. ($uniqueUser["region"] ?? "-") .'</div>
                            <div><span>Sucursal:</span> '. $uniqueUser["sucursal"] .'</div>
                            <div><span>Area de trabajo:</span> '. $uniqueUser["area"] .'</div>
                            <div><span>Personal:</span> '. $uniqueUser["trabajador"] .' </div>
                            <div><span>Cargo:</span> '. $uniqueUser["cargo_trabajador"] .' </div>
                        </div>'
                    : ($dataFA["cantidad"] > 1 ? '<div class="afr-info-right"><div>Asignación múltiple</div></div>' : ""))
                .'</div>
                <div>
                    '. ( !empty($ocultos["componentes"]) ? "" :
                        '<p><b>Componentes:</b></p>'.
                        $htmlComponents
                    ) .'
                    '. (
                        !empty($ocultos["ubicacion"]) ? "" :
                        '<p style="'. ($dataFA["cantidad"] <= 1 ? "display: none" : "") .'"><b>Ubicación actual:</b></p>'.
                        $htmlLocation
                    ) .'
                    '. (
                        !empty($ocultos["mantenimientos"]) ? "" :
                        '<p><b>Mantenimientos:</b></p>'.
                        $htmlMaintenance
                    ) .'
                    '. (
                        !empty($ocultos["trayectoria"]) ? "" :
                        '<p><b>Trayectoria del activo:</b></p>'.
                        $htmlTrajectory
                    ) .'
                </div>';
            $this->pdf->createPdf($html, "Historial A.F.");
        }

        public function historyU($data){
            
            $dataFA = $data["data"];
            $uniqueUser = $data["uniqueUser"];
            
            $unsubscribeFA = $data["dataUFA"];
            $htmlState = "";
            if ($unsubscribeFA) {
                $tableU = '<table class="afr-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Detalle</th>
                            <th>Precio</th>
                            <th>Fecha de baja</th>
                            <th>Tipo de baja</th>
                            <th>Responsable baja</th>
                        </tr>
                    </thead>
                    <tbody>';

                foreach ($unsubscribeFA as $key => $value) {
                    $tableU .= '<tr>
                        <td>'. $value["codigo"] .'</td>
                        <td class="afr-te">'. $value["cantidad"] .'</td>
                        <td>'. $value["detallebaja"] .'</td>
                        <td class="afr-te">'. $this->pdf->FormatoNumber($value["precio"]) .'</td>
                        <td class="afr-te">'. $this->pdf->FormatoDateTime($value["fechabaja"]) .'</td>
                        <td>'. $value["nombretipobaja"] .'</td>
                        <td>'. $value["nombretrabajador"] .'</td>
                    </tr>';
                }
                $tableU .= '</tbody></table>';

                $htmlState = $tableU;
            } else {
                $htmlState = '<p class="afr-center"> Sin bajas </p>';
                
            }
            
            $html = '
                <div>
                    <h1>Bajas: '. $dataFA["nombre"] .' </h1>
                </div>
                <div class="afr-filter-void"></div>
                <div class="afr-info">
                    <div><span>Nombre:</span> '. $dataFA["nombre"] .'</div>
                    <div><span>Código:</span> '. $dataFA["codigo"] .'</div>
                    <div><span>Cantidad:</span> '. $dataFA["cantidad"] .'</div>
                    <div><span>Detalle:</span> '. $dataFA["detalle"] .' </div>
                    <div><span>Estado:</span> '. ($dataFA["nombretipoestado"]) .'</div>
                    <div><span>Fecha de ingreso:</span> '. $this->pdf->FormatoDate($dataFA["fechacompra"]) .'</div>
                </div>
                <div>
                    <p><b>Bajas del activo: </b></p>
                    '. $htmlState .'
                </div>';
    
            $this->pdf->createPdf($html, "Historial Baja");
        }

        public function report($data){
            $subtitle = $this->pdf->filtersPDF($data["info"]);

            $html ='
                <div>
                    <h1>Reporte de Activos Fijos</h1>
                </div>
                <div class="afr-filters-t">
                    '. $subtitle .'
                </div>
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Disponibles</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Precio</th>
                            <th>Fecha de ingreso</th>
                            <th>Categoría</th>
                            <th>Tipo de Bien</th>
                            <th>Tipo seguro</th>
                            <th>Observación</th>
                            <th>Inventario</th>
                        </tr>
                    </thead>
                    <tbody>';

            $htmlTable = "";
            foreach ($data["data"] as $key => $value) {
                $htmlTable .= '<tr>
                    <td>' .$value["codigo"] .'</td>
                    <td class="afr-te">'. $value["cantidad"] .'</td>
                    <td class="afr-te">'. $value["cantidaddisponible"] .'</td>
                    <td>'. $value["nombre"] .'</td>
                    <td>'. $value["detalle"] .'</td>
                    <td class="afr-te">'. $this->pdf->FormatoNumber($value["precio"]) .'</td>
                    <td class="afr-te">'. $this->pdf->FormatoDate($value["fechacompra"]) .'</td>
                    <td>'. $value["nombrecategoria"] .'</td>
                    <td>'. $value["nombretipobien"] .'</td>
                    <td>'. (isset($value["nombretiposeguro"]) ? $value["nombretiposeguro"]: "-") .'</td>
                    <td>'. $value["observacion"] .'</td>
                    <td>'. $value["nombretipoinventario"] .'</td>
                    <!-- <td>'. $value["nombretipoestado"] .'</td> -->
                </tr>';
            }
            $htmlTable .= '
                </tbody>
            </table>';

            $html = $html.$htmlTable;

            $this->pdf->createPdf($html, "Reporte AF", "Letter-L");
        }

        public function reportFAUnsubscribe($data){
            $subtitle = $this->pdf->filtersPDF($data["info"]);

            $html ='
                <div>
                    <h1>Reporte de Activos Fijos - Bajas</h1>
                </div>
                <div class="afr-filters-t">
                    '. $subtitle .'
                </div>
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Cantidad actual</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Precio</th>
                            <th>Fecha de ingreso</th>
                            <th>Categoría</th>
                            <th>Tipo de Bien</th>
                            <th>Tipo seguro</th>
                            <!-- <th>Estado</th> -->
                        </tr>
                    </thead>
                    <tbody>';

            $htmlTable = "";
            foreach ($data["data"] as $key => $value) {
                $htmlTable .= '<tr>
                    <td>' .$value["codigo"] .'</td>
                    <td class="afr-te">'. $value["cantidad"] .'</td>
                    <td class="afr-te">'. $value["cantidadaltas"] .'</td>
                    <td>'. $value["nombre"] .'</td>
                    <td>'. $value["detalle"] .'</td>
                    <td class="afr-te">'. $this->pdf->FormatoNumber($value["precio"]) .'</td>
                    <td class="afr-te">'. $this->pdf->FormatoDate($value["fechacompra"]) .'</td>
                    <td>'. $value["nombrecategoria"] .'</td>
                    <td>'. $value["nombretipobien"] .'</td>
                    <td>'. (isset($value["nombretiposeguro"]) ? $value["nombretiposeguro"]: "-") .'</td>
                    <!-- <td>'. $value["nombretipoestado"] .'</td> -->
                </tr>';
            }
            $htmlTable .= '
                </tbody>
            </table>';

            $html = $html.$htmlTable;

            $this->pdf->createPdf($html, "Reporte AF", "Letter-L");
        }

        public function reportFAInsurance($data){
            $subtitle = $this->pdf->filtersPDF($data["info"]);

            $html ='
                <div>
                    <h1>Reporte Seguros - Activos fijos</h1>
                </div>
                <div class="afr-filters-t">
                    '. $subtitle .'
                </div>
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Precio</th>
                            <th>Fecha de ingreso</th>
                            <th>Categoría</th>
                            <th>Tipo de Bien</th>
                            <th>Tipo seguro</th>
                        </tr>
                    </thead>
                    <tbody>';

            $htmlTable = "";
            foreach ($data["data"] as $key => $value) {
                $htmlTable .= '<tr>
                    <td>' .$value["codigo"] .'</td>
                    <td class="afr-te">'. $value["cantidad"] .'</td>
                    <td>'. $value["nombre"] .'</td>
                    <td>'. $value["detalle"] .'</td>
                    <td class="afr-te">'. $this->pdf->FormatoNumber($value["precio"]) .'</td>
                    <td class="afr-te">'. $this->pdf->FormatoDate($value["fechacompra"]) .'</td>
                    <td>'. $value["nombrecategoria"] .'</td>
                    <td>'. $value["nombretipobien"] .'</td>
                    <td>'. (isset($value["nombretiposeguro"]) ? $value["nombretiposeguro"]: "-") .'</td>
                </tr>';
            }
            $htmlTable .= '
                </tbody>
            </table>';

            $html = $html.$htmlTable;

            $this->pdf->createPdf($html, "Reporte AF", "Letter-L");
        }

        public function reports($data){
            $subtitle = $this->pdf->filtersPDF($data["info"]);

            $html ='
                <div>
                    <h1>Reporte de Activos Fijos</h1>
                </div>
                <div class="afr-filters-t">
                    '. $subtitle .'
                </div>
                <table class="afr-table">
                    <thead >
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Fecha de ingreso</th>
                            <th>Categoría</th>
                            <th>Tipo de Bien</th>
                            <th>Tipo seguro</th>
                            <th>Estado</th>
                            <th>Área</th>
                            <th>Responsable</th>
                        </tr>
                    </thead>
                    <tbody>';

            $htmlTable = "";
            $contador = 0;
            foreach ($data["data"] as $key => $value) {
                $contador++;
                $htmlTable .= '<tr>
                    <td>'. $contador .'</td>
                    <td>'. $value["codigo"] .'</td>
                    <td class="afr-te">' .$value["cantidad"] .'</td>
                    <td>'. $value["nombre"] .'</td>
                    <td>'. $value["detalle"] .'</td>
                    <td class="afr-te">'. $this->pdf->FormatoDate($value["fechacompra"]) .'</td>
                    <td>'. $value["nombrecategoria"] .'</td>
                    <td>'. $value["nombretipobien"] .'</td>
                    <td>'. (isset($value["nombretiposeguro"]) ? $value["nombretiposeguro"]: "-") .'</td>
                    <td>'. (isset($value["nombreestado"]) ? $value["nombreestado"]: "-") .'</td>
                    <td>'. (isset($value["nombrearea"]) ? $value["nombrearea"]: "-") .'</td>
                    <td>'. (isset($value["nombrearea"]) ? $value["nombretrabajador"]: "-") .'</td>
                </tr>';
            }
            $htmlTable .= '
                    </tbody>
                </table>';

            $html = $html.$htmlTable;

            $this->pdf->createPdf($html, "Reporte A.F.", "Letter-L");
        }

        public function reportUnsolicited($data){

            $html ='
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <title>Reporte AF</title>
                <link rel="stylesheet" href="./pdf/css/style.css"/>                
            </head>
            <body>
                <header class="clearfix">
                    <div id="logo">
                    </div>
                    <div class="project">
                        <div> '. $this->datosEmpresa->nombre .'</div>
                        <div> '. $this->datosEmpresa->direccion .'</div>
                        <div> '. $this->datosEmpresa->sucursal .'</div>
                        <div><span class="small-text">NIT: </span> '. $this->datosEmpresa->nit .'</div>
                        <div><span class="small-text">Tel: </span> '. $this->datosEmpresa->telefono .'</div>
                    </div>
                    <div class="company">
                        <img src="'. $this->AF_ENV["apiUrl"] .'/app/em/'. $this->datosEmpresa->logo .'" width="100" height="100">
                    </div>
                </header>
                <main>
                    <div class="title">
                        <h1>Reporte de Activos Fijos no solicitados</h1>
                    </div>
                    <table class="t-info middle">
                        <thead >
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Observación</th>
                        </tr>
                        </thead>
                        <tbody>';
            $htmlTable = "";
                foreach ($data["data"] as $key => $value) {
                    $htmlTable .= '<tr>
                        <td>'.$value["codigo"].'</td>
                        <td>'.$value["nombre"].'</td>
                        <td>'.$value["detalle"].'</td>
                        <td>'.$value["observacion"].'</td>
                    </tr>';
                    
                }
            $htmlTable .= '
                    </tbody>
                </table>';

            $html = $html.$htmlTable.'
                </main>
            </body>
            </html>';

            require_once '../vendor/autoload.php';

            // Crear una instancia de mPDF
            $mpdf = new \Mpdf\Mpdf(['format' => 'Letter-L']);

            $mpdf->WriteHTML($html);
            $mpdf->Output("cuadro_de_depreciación.pdf", "I");

        }

        public function reportFADep($data){
            $subtitle = $this->pdf->filtersPDF($data["info"]);

            $html ='
                <div>
                    <h1>Método Activos Fijos</h1>
                </div>
                <div class="afr-filters-t">
                    '. $subtitle .'
                </div>
                <table class="afr-table">
                    <thead>
                        <tr>
                            <th>Método</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                        </tr>
                    </thead>
                    <tbody>';

            $htmlTable = "";
            $method = [1 => "Línea recta", 2 => "Suma de dígitos", 3 => "Unidades Producción"];
            foreach ($data["data"] as $key => $value) {
                $htmlTable .= '<tr>
                    <td>'. (isset($method, $value["metododepreciacion_id"])? $method[$value["metododepreciacion_id"]] : "-") .'</td>
                    <td class="afr-te">'. $value["codigoactivofijo"] .'</td>
                    <td>'. $value["nombreactivofijo"] .'</td>
                    <td>'. $value["detalleactivofijo"] .'</td>
                </tr>';                    
            }
            $htmlTable .= '
                </tbody>
            </table>';

            $html = $html.$htmlTable;

            $this->pdf->createPdf($html, "Reporte A.F.");
        }

        public function reportsMovement($data){
            $subtitle = $this->pdf->filtersPDF($data["info"]);

            $html ='
                <div>
                    <h1>Reporte Movimientos - Activos Fijos</h1>
                </div>
                <div class="afr-filters-t">
                    '. $subtitle .'
                </div>
                <table class="afr-table">
                    <thead >
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Sucursal</th>
                            <th>Área</th>
                            <th>Trabajador</th>
                        </tr>
                    </thead>
                    <tbody>';

            $contador = 0;
            $htmlTable = "";
            foreach ($data["data"] as $key => $value) {
                $contador++;
                $htmlTable .= '<tr>
                    <td>'. $contador .'</td>
                    <td>'. $value["codigo"] .'</td>
                    <td class="afr-te">' .$value["cantidad"] .'</td>
                    <td>'. $value["nombre"] .'</td>
                    <td>'. $value["detalle"] .'</td>
                    <td>'. (isset($value["nombresucursal"]) ? $value["nombresucursal"]: "-") .'</td>
                    <td>'. (isset($value["nombrearea"]) ? $value["nombrearea"]: "-") .'</td>
                    <td>'. (isset($value["nombrearea"]) ? $value["nombretrabajador"]: "-") .'</td>
                </tr>';
            }
            $htmlTable .= '
                    </tbody>
                </table>';

            $html = $html.$htmlTable;

            $this->pdf->createPdf($html, "Reporte A.F.", "Letter-L");
        }
    }
?>