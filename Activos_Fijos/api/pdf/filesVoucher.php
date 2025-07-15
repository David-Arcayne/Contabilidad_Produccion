<?php 
class FilesVoucher {
    private $pdf;
    public function __construct(){
        $this->pdf = new PDFFile();
    }

    public function ProofRequest($data){
        $dataMovFA = $data["data"];
        $dataMov = $data["dataMov"];

        $fixedAsset = "";
        if($dataMovFA){
            $fixedAsset = '
            <table class="afr-table">
                <thead >
                    <tr>
                        <th>N°</th>
                        <th>Código</th>
                        <th>Activo Fijo</th>
                        <th>Detalle</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>';
            $cont = 0;
            foreach ($dataMovFA as $key => $value) {
                $cont++;
                $fixedAsset .= '<tr>
                    <td class="afr-te">'. $cont .'</td>
                    <td>'. ($value["codigoactivofijo"] ?? "-") .'</td>
                    <td>'. ($value["nombreactivofijo"] ?? $value["nombre"]) .'</td>
                    <td>'. ($value["detalleactivofijo"] ? $value["detalleactivofijo"] : $value["detalle"]) .'</td>
                    <td class="afr-te">'.$value["cantidad"] .'</td>
                    <td class="afr-fwbi">'. ($value["estado"] == 1 ? "Aceptado" : "Rechazado") .'</td>
                </tr>';
            }
            $fixedAsset .= '
                </tbody>
            </table>'; 
        } else {
            $fixedAsset = '<p class="afr-center"> Sin componentes </p>';
        }

        $html ='
            <h2 class="afr-end">N°: '. $dataMov["cod_comprobante"] .'</h2>
            <div>
                <h1> Comprobante </h1>
            </div>
            <div class="afr-filters-t">
                <div><span>Tipo Solicitud:</span> '. ($dataMov["estado"] == 1 || $dataMov["estado"] == 3 ? "Asignación" : "Devolución") .'</div>
            </div>
            <div class="afr-info">
                <div class="afr-info-left">
                    <div><span>Solicitante:</span> '. $dataMov["nombretrabajador"] .'</div>
                    <div><span>Título:</span> '. $dataMov["detalle"] .'</div>
                    <div><span>Fecha Solicitud:</span> '. $this->pdf->FormatoDateTime($dataMov["fechasolicitud"]) .'</div>
                </div>
                <div class="afr-info-right">
                    <div><span>Responsable:</span> '. $dataMov["nombreencargado"] .'</div>
                    <div><span>Fecha asignación:</span> '. $this->pdf->FormatoDateTime($dataMov["fecharespuesta"]) .'</div>
                </div>
            </div>
            <div>
                <p><b>Activos Fijos:</b></p>
                '. $fixedAsset .'
            </div>';

        $this->pdf->createPdf($html, "Comprobante");
    }
    
    public function ProofAdmin($data){
        $dataMovFA = $data["data"];
        $dataMov = $data["dataMov"];

        $fixedAsset = "";
        if($dataMovFA){
            $fixedAsset = '
            <table class="afr-table">
                <thead >
                    <tr>
                        <th>N°</th>
                        <th>Código</th>
                        <th>Activo Fijo</th>
                        <th>Detalle</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>';
            $cont = 0;
            foreach ($dataMovFA as $key => $value) {
                $cont++;
                $fixedAsset .= '<tr>
                    <td class="afr-te">'. $cont .'</td>
                    <td>'. $value["codigoactivofijo"] .'</td>
                    <td>'. $value["nombreactivofijo"] .'</td>
                    <td>'. $value["detalleactivofijo"] .'</td>
                    <td class="afr-te">'.$value["cantidad"] .'</td>
                    <td class="afr-fwbi">'. ($dataMov["estado"] == 1 || $dataMov["estado"] == 3 ? "Asignado" : "Desasignado") .'</td>
                </tr>';
            }
            $fixedAsset .= '
                </tbody>
            </table>'; 
        } else {
            $fixedAsset = '<p class="afr-center"> Sin componentes </p>';
        }

        $html ='
            <h2 class="afr-end">N°: '. $dataMov["cod_comprobante"] .'</h2>
            <div>
                <h1> Comprobante </h1>
            </div>
            <div class="afr-filters-t">
                <div><span>Tipo de movimiento:</span> '. ($dataMov["estado"] == 1 || $dataMov["estado"] == 3 ? "Asignación" : "Devolución") .'</div>
            </div>
            <div class="afr-info">
                <div class="afr-info-left">
                    <div><span>Responsable:</span> '. $dataMov["nombreencargado"] .'</div>
                    <div><span>Título:</span> '. $dataMov["detalle"] .'</div>
                    <div><span>Fecha de movimiento:</span> '. $this->pdf->FormatoDateTime($dataMov["fecharespuesta"]) .'</div>
                </div>
                <div class="afr-info-right">
                    <div><span>Trabajador:</span> '. $dataMov["nombretrabajador"] .'</div>
                </div>
            </div>
            <div>
                <p><b>Activos Fijos:</b></p>
                '. $fixedAsset .'
            </div>';

        $this->pdf->createPdf($html, "Comprobante");
    }

    public function ProofMovementReassignment($data){
        $dataMovFA = $data["data"];
        $dataMov = $data["dataMov"];

        $fixedAsset = "";
        if($dataMovFA){
            $fixedAsset = '
            <table class="afr-table">
                <thead >
                    <tr>
                        <th>N°</th>
                        <th>Código</th>
                        <th>Activo Fijo</th>
                        <th>Detalle</th>
                        <th>Cantidad</th>
                        <th>Trabajador origen</th>
                        <th>Trabajador destino</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>';
            $cont = 0;
            foreach ($dataMovFA as $key => $value) {
                $cont++;
                $fixedAsset .= '<tr>
                    <td class="afr-te">'. $cont .'</td>
                    <td>'. $value["codigoactivofijo"] .'</td>
                    <td>'. $value["nombreactivofijo"] .'</td>
                    <td>'. $value["detalleactivofijo"] .'</td>
                    <td class="afr-te">'.$value["cantidad"] .'</td>
                    <td>'. ($value["nombretrabajador"] ?? "-") .'</td>
                    <td>'. ($value["nombretrabajadordestino"] ?? "-") .'</td>
                    <td class="afr-fwbi">'. ($value["trabajador_id"] && $value["trabajador_destino"] ? "Reasignación" : ($value["trabajador_id"] ? "Retiro" : "Asignación")) .'</td>
                </tr>';
            }
            $fixedAsset .= '
                </tbody>
            </table>'; 
        } else {
            $fixedAsset = '<p class="afr-center"> Sin componentes </p>';
        }
     /**
             *  Obtener los datos de movimientos
             * 
             * -   NULL = Solicitud ASIGNACIÓN (NUEVO),         Administrador ASINACIÓN (PENDIENTE)
             * -      1 = Solicitud ASIGNACIÓN (APROBADA AT-C), Administrador ASINACIÓN (APROBADA)
             * -      2 = Solicitud ASIGNACIÓN (PENDIENTE)
             * -      3 = Solicitud ASIGNACIÓN (RECHAZADO RT)
             * -      5 = Solicitud DEVOLUCIÓN (NUEVO),         Administrador DEVOLUCIÓN (PENDIENTE)
             * -      6 = Solicitud DEVOLUCIÓN (APROBADA AT-C), Administrador DEVOLUCIÓN (APROBADA)
             * -      7 = Solicitud DEVOLUCIÓN (RECHAZADO RT)
             * -      8 = Solicitud DEVOLUCIÓN (PENDIENTE)
             * -     11 = Reasignación (PENDIENTE)
             * -     12 = Reasignación (APROBADA)
             * */ 
        $html ='
            <h2 class="afr-end">N°: '. $dataMov["cod_comprobante"] .'</h2>
            <div>
                <h1> Comprobante </h1>
            </div>
            <div class="afr-filters-t">
                <div><span>Tipo de movimiento:</span> Reasignación </div>
            </div>
            <div class="afr-info">
                <div><span>Responsable:</span> '. $dataMov["nombreencargado"] .'</div>
                <div><span>Título:</span> '. $dataMov["detalle"] .'</div>
                <div><span>Fecha de movimiento:</span> '. $this->pdf->FormatoDateTime($dataMov["fecharespuesta"]) .'</div>
            </div>
            <div>
                <p><b>Activos Fijos:</b></p>
                '. $fixedAsset .'
            </div>';

        $this->pdf->createPdf($html, "Comprobante", "Letter-L");
    }

    public function ProofHistory($data, $ocultos){
        $dataH = $data["data"];

        $html ='
            <h2 class="afr-end">N°: '. $dataH["cod_comprobante"] .'</h2>
            <div>
                <h1> Comprobante </h1>
            </div>
            <div class="afr-filter-void"></div>
            <div>
                <p><b>Situación: </b>'. $dataH["nombretiposituacion"] .'</p>
                
                '. ( !empty($ocultos["ingreso"]) ? "" :
                    '<p><b>Ingreso:</b></p>
                    <table class="afr-table">
                        <thead >
                            <tr>
                                <th>Código</th>
                                <th>Activo Fijo</th>
                                <th>Componente</th>
                                <th>Detalle situación</th>
                                <th>Fecha de ingreso</th>
                                <th>Fecha tentativa de salida</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>'. $dataH["codigoactivofijo"] .'</td>
                                <td>'. $dataH["nombreactivofijo"] .'</td>
                                <td>'. ($dataH["nombrecomponente"] ?? "-") .'</td>
                                <td>'. $dataH["detalle"] .'</td>
                                <td class="afr-te">'. $this->pdf->FormatoDateTime($dataH["fechaingreso"]) .'</td>
                                <td class="afr-te">'. $this->pdf->FormatoDateTime($dataH["fechafin"]) .'</td>
                            </tr>
                        </tbody>
                    </table>'
                ) .'
                '. ( !empty($ocultos["salida"]) ? "" :
                    '<p><b>Salida:</b></p>
                    <table class="afr-table">
                        <thead >
                            <tr>
                                <th>Fecha de salida</th>
                                <th>Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>'. $this->pdf->FormatoDateTime($dataH["fechasalida"]) .'</td>
                                <td>'. $this->pdf->FormatoNumber($dataH["costo"]) .'</td>
                            </tr>
                        </tbody>
                    </table>'
                ) .'
                <br/>
                <p><b>Responsable: </b>'. $dataH["nombreeditor"] .'</p>
            </div>';

        $this->pdf->createPdf($html, "Comprobante");
    }
}
?>