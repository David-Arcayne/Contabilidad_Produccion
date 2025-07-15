<?php 
    class FilesMovement {
        private $datosEmpresa;
        private $AF_ENV;
        public function __construct(){
            $this->datosEmpresa= $_SESSION["af_datosempresa"];
            include "../db/af_env.php";
            $this->AF_ENV = $AF_ENV;
        }

        public function mainHTML ($children) {
            $html = '
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>Tabla de Depreciación</title>
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
                    <main>'.
                        $children
                    .'</main>
                </body>
                </html>
            ';
            return $html;
        }

        public function reports0($data){
            $db = new DBConnection();

            $dataMovement = $data["data"];

            $subtitle = "";
            if ($data["info"]) {
                foreach ($data["info"] as $key => $value) {
                    $subtitle.= '<span class="semi-bold">'. $value->nombre ."</span>: ". $value->valor .", ";
                }
                $subtitle = '<p class="text-center">'. substr($subtitle, 0, -2) .'</p>';
            }

            $movement = function ($id) use($db){

                // $fixedAssets = $db->query("SELECT *, (select estado FROM movimientoactivos WHERE movimientos_id = $id AND activosfijos_id = activosfijos.id ) AS estado_ma FROM activosfijos WHERE id IN (SELECT activosfijos_id FROM movimientoactivos WHERE movimientos_id = $id AND activosfijos_id IS NOT NULL)");
                // $dataFA = $fixedAssets->fetch_all(MYSQLI_ASSOC);
                
                // $fixedAssets = $db->query("SELECT 
                //     af.*, 
                //     ma.estado AS estado_ma
                //     FROM activosfijos af
                //     INNER JOIN movimientoactivos ma ON ma.movimientos_id = $id AND ma.activosfijos_id = af.id
                //     WHERE af.id IN (SELECT activosfijos_id FROM movimientoactivos WHERE movimientos_id = $id AND activosfijos_id IS NOT NULL);"
                // );
                $fixedAssets = $db->query("SELECT af.*, ma.estado AS estado_ma
                    FROM activosfijos AS af
                    INNER JOIN movimientoactivos AS ma ON af.id = ma.activosfijos_id
                    WHERE ma.movimientos_id = $id AND af.id IS NOT NULL"
                );
                $dataFA = $fixedAssets->fetch_all(MYSQLI_ASSOC);

                $fixedAssetsN = $db->query("SELECT * FROM movimientoactivos WHERE movimientos_id = $id AND activosfijos_id IS NULL");
                $dataFAN = $fixedAssetsN->fetch_all(MYSQLI_ASSOC);

                $tbody = '';
                $counter = 0;
                foreach ($dataFA as $key => $value) {
                    $counter ++;
                    $tbody .= '<tr>
                        <td class="center">'. $counter .'</td>
                        <td >'. $value["codigo"] .'</td>
                        <td class="left">'. $value["nombre"] .'</td>
                        <td class="left">'. $value["detalle"] .'</td>
                        <td class="left">'. ($value["estado_ma"] == 3 ? "RECHAZADO" : "ACEPTADO") .'</td>
                    </tr>'; 
                }
                foreach ($dataFAN as $key => $value) {
                    $counter ++;
                    $tbody .= '<tr>
                        <td class="center">'. $counter .'</td>
                        <td > - </td>
                        <td class="left">'.$value["nombre"] .'</td>
                        <td class="left">'.$value["detalle"] .'</td>
                        <td class="left">'. ($value["estado"] == 3 ? "RECHAZADO" : "ACEPTADO") .'</td>
                    </tr>'; 
                }

                return $tbody;              
            };

            $contentMovement = '';

            foreach ($dataMovement as $key => $value) {
                $tbody = $movement($value["id"]);

                $contentMovement.= '
                    <div class="al-right"> N° - '. ($key + 1) .'
                        
                        <hr>
                    </div>
                    <p><b>Succursal:</b> '. $value["nombresucursal"] .'</p>
                    <p><b>Área de trabajo:</b> '. $value["nombredepartamento"] .'</p>
                    <p><b>Personal:</b> '. $value["nombrepersonal"] .'</p>
                    <p><b>Activos Solicitados:</b></p>
                                            
                    <table class="t-info">
                        <thead >
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Estado</th>
                        </tr>
                        </thead>'.
                        $tbody
                    .'</table>

                    <br><br><br>
                ';
            }
            
            $mainContent = '
                <div class="title">
                    <h1>Reporte Movimientos</h1>
                </div>'.
                $subtitle . 
                $contentMovement .'
                
            ';

            $html = $this->mainHTML($mainContent);

            require_once '../vendor/autoload.php';

            // Crear una instancia de mPDF
            $mpdf = new \Mpdf\Mpdf();

            $mpdf->WriteHTML($html);
            $mpdf->Output("cuadro_de_depreciación.pdf", "I");

        }

        public function reports($data){
            $db = new DBConnection();

            $dataMovement = $data["data"];

            $subtitle = "";
            if ($data["info"]) {
                foreach ($data["info"] as $key => $value) {
                    $subtitle.= '<span class="semi-bold">'. $value->nombre ."</span>: ". $value->valor .", ";
                }
                $subtitle = '<p class="text-center">'. substr($subtitle, 0, -2) .'</p>';
            }

            $movement = function ($id, $counter) use($db){
                $fixedAssets = $db->query("SELECT af.*, ma.estado AS estado_ma, ma.cantidad AS cantidad_ma
                    FROM activosfijos AS af
                    INNER JOIN movimientoactivos AS ma ON af.id = ma.activosfijos_id
                    WHERE ma.movimientos_id = $id AND af.id IS NOT NULL"
                );
                $dataFA = $fixedAssets->fetch_all(MYSQLI_ASSOC);

                $fixedAssetsN = $db->query("SELECT * FROM movimientoactivos WHERE movimientos_id = $id AND activosfijos_id IS NULL");
                $dataFAN = $fixedAssetsN->fetch_all(MYSQLI_ASSOC);

                $tbody = '';
                foreach ($dataFA as $key => $value) {
                    $counter ++;
                    $tbody .= '<tr>
                        <td class="center">'. $counter .'</td>
                        <td >'. $value["codigo"] .'</td>
                        <td >'. $value["cantidad_ma"] .'</td>
                        <td class="left">'. $value["nombre"] .'</td>
                        <td class="left">'. $value["detalle"] .'</td>
                        <td class="left">'. ($value["estado_ma"] == 3 ? "RECHAZADO" : "ACEPTADO") .'</td>
                    </tr>'; 
                }
                foreach ($dataFAN as $key => $value) {
                    $counter ++;
                    $tbody .= '<tr>
                        <td class="center">'. $counter .'</td>
                        <td > - </td>
                        <td >'. $value["cantidad"] .'</td>
                        <td class="left">'.$value["nombre"] .'</td>
                        <td class="left">'.$value["detalle"] .'</td>
                        <td class="left">'. ($value["estado"] == 3 ? "RECHAZADO" : "ACEPTADO") .'</td>
                    </tr>'; 
                }

                return [$tbody, $counter];              
            };

            $contentMovement = '';

            $counter = 0;
            foreach ($dataMovement as $key => $value) {
                $tbody = $movement($value["id"], $counter);
                $counter = $tbody[1];

                $contentMovement.= $tbody[0];
            }
            
            $mainContent = '
                <div class="title">
                    <h1>Reporte Movimientos</h1>
                </div>'.
                $subtitle . 
                '<table class="t-info">
                    <thead >
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>'.
                        $contentMovement
                    .'</tbody>
                </table>';

            $html = $this->mainHTML($mainContent);

            require_once '../vendor/autoload.php';

            // Crear una instancia de mPDF
            $mpdf = new \Mpdf\Mpdf();

            $mpdf->WriteHTML($html);
            $mpdf->Output("cuadro_de_depreciación.pdf", "I");
        }

        public function report($data){
            $dataMovement = $data["data"];
            $dataMNFA = $data["dataMNFA"];
            $dataMovementFA = $data["dataMFA"];
            $info = $data["info"];

            $stateMov = $dataMovement["estado"];
            $individual = $data["individual"];

            $movement = function () use($dataMovementFA, $dataMNFA, $stateMov, $individual) {

                $tbody = '';
                $counter = 0;
                if($stateMov == 12 && !$individual) {
                    foreach ($dataMovementFA as $key => $value) {
                        $counter ++;
                        $tbody .= '<tr>
                            <td>'. $counter .'</td>
                            <td class="afr-te">'. $value["codigo"] .'</td>
                            <td>'. $value["nombrecategoria"] .'</td>
                            <td>'. $value["nombre"] .'</td>
                            <td class="afr-w-150">'. $value["detalle"] .'</td>
                            <td class="afr-te">'. $value["cantidad_ma"] .'</td>
                            <td>'. ($value["nombresucursal"] ?? "-") .'</td>
                            <td>'. ($value["nombrearea"] ?? "-") .'</td>
                            <td>'. ($value["nombretrabajador"] ?? "-") .'</td>
                            <td>'. ($value["nombresucursaldestino"] ?? "-") .'</td>
                            <td>'. ($value["nombreareadestino"] ?? "-") .'</td>
                            <td>'. ($value["nombretrabajadordestino"] ?? "-") .'</td>
                            <td>'. ($value["trabajador_id"] && $value["trabajador_destino"] ? "Reasignación" : ($value["trabajador_id"] ? "Devolución" : "Asignación")) .'</td>
                        </tr>'; 
                    }
                } else {
                    foreach ($dataMovementFA as $key => $value) {
                        $stateM = '';
                        if ($stateMov == 12 ) {
                            $stateM = $value["trabajador_id"] ? "Devolución" : "Asignación";
                        } else if ($stateMov == 6 || $stateMov == 7) {
                            $stateM = $value["estado_ma"] == 1 ? "Devolución" : "Rechazado";
                        } else if ($stateMov == 3 || $stateMov == 1) {
                            $stateM = $value["estado_ma"] == 1 ? "Asignación" : "Rechazado";
                        } 

                        $counter ++;
                        $tbody .= '<tr>
                            <td>'. $counter .'</td>
                            <td class="afr-te">'. $value["codigo"] .'</td>
                            <td>'. $value["nombrecategoria"] .'</td>
                            <td>'. $value["nombre"] .'</td>
                            <td>'. $value["detalle"] .'</td>
                            <td class="afr-te">'. $value["cantidad_ma"] .'</td>
                            <td>'. $stateM .'</td>
                        </tr>'; 
                    }
                }
                
                foreach ($dataMNFA as $key => $value) {
                    $counter ++;
                    $tbody .= '<tr>
                        <td>'. $counter .'</td>
                        <td class="afr-te"> - </td>
                        <td> - </td>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. $value["detalle"] .'</td>
                        <td class="afr-te">'. $value["cantidad"] .'</td>
                        <td> - </td>
                        <td>'. ($value["estado"] == 3 ? "Rechazado" : "Asignación") .'</td>
                    </tr>'; 
                }

                return $tbody;              
            };

            $contentMovement = '';

            $page = "Letter";

            if ($dataMovement) {
                $tbody = $movement();

                $thead = '';
                $dataInfo = '';
                if($stateMov == 12 && !$individual) {
                    $page = "Letter-L";

                    $dataInfo = '
                        <div><span>Responsable:</span> '. $info->responsable .'</div>';

                    $thead = '<tr>
                        <th>N°</th>
                        <th>Código</th>
                        <th>Categoria</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Cantidad</th>
                        <th>Sucursal Origen</th>
                        <th>Área origen</th>
                        <th>Traabajador origen</th>
                        <th>Sucursal destino</th>
                        <th>Área destino</th>
                        <th>Trabajador destino</th>
                        <th>Estado</th>
                    </tr>';
                } else {
                    $dataInfo = '
                        <div><span>Responsable:</span> '. $info->responsable .'</div>
                        <div><span>Sucursal:</span> '. $info->sucursal .'</div>
                        <div><span>Área de trabajo:</span> '. $info->area .'</div>
                        <div><span>Personal:</span> '. $info->personal .'</div>';

                    $thead = '<tr>
                        <th>N°</th>
                        <th>Código</th>
                        <th>Categoria</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                    </tr>';
                }
            
                $contentMovement = '
                    <div class="afr-info">
                        '. $dataInfo .'
                    </div>
                    <div>
                        <p><b>Activos Fijos:</b></p>
                        <table class="afr-table">
                            <thead>
                                '. $thead .'
                            </thead>
                            '. $tbody .'
                        </table>
                    </div>';
            }
            
            $mainContent = '
                <div>
                    <h1>Reporte Movimiento</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $contentMovement .'
            ';

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Reporte de movimiento", $page);

        }
        
        public function reportsWorker($data, $workerId){
            $db = new DBConnection();


            $dataMovement = $data["data"];

            $subtitle = "";
            if ($data["info"]) {
                foreach ($data["info"] as $key => $value) {
                    $subtitle.= '<span class="semi-bold">'. $value->nombre ."</span>: ". $value->valor .", ";
                }
                $subtitle = '<p class="text-center">'. substr($subtitle, 0, -2) .'</p>';
            }


            $movement = function ($id) use($db){

                // $fixedAssets = $db->query(
                //     "SELECT *, 
                //         (SELECT cantidad FROM movimientoactivos WHERE activosfijos_id = activosfijos.id AND estado = 1 ORDER BY id DESC LIMIT 0, 1) AS cantidad_ma 
                //     FROM activosfijos WHERE id IN (SELECT activosfijos_id FROM ubicacionactivo WHERE id IN (SELECT MAX(id) FROM  ubicacionactivo GROUP BY activosfijos_id) AND trabajador_id = $id AND fechadevolucion IS NULL)");
                $fixedAssets = $db->query(
                    "SELECT af.*,
                        ai.cantidad AS cantidad_ma
                    FROM activosfijos af 
                    INNER JOIN activosinventarios ai ON af.id = ai.activosfijos_id
                    WHERE ai.trabajador_id = $id AND ai.cantidad > 0"
                );
                $dataFA = $fixedAssets->fetch_all(MYSQLI_ASSOC);

                $tbody = '';
                $counter = 0;
                foreach ($dataFA as $key => $value) {
                    $counter ++;
                    $tbody .= '<tr>
                        <td class="center">'. $counter .'</td>
                        <td >'. $value["codigo"] .'</td>
                        <td >'. $value["cantidad_ma"] .'</td>
                        <td class="left">'. $value["nombre"] .'</td>
                        <td class="left">'. $value["detalle"] .'</td>
                    </tr>'; 
                }

                return $tbody;              
            };

            $contentMovement = '';

            if ($dataMovement && $workerId) {
                $tbody = $movement($workerId);
            
                $contentMovement = '
                    <p><b>Succursal:</b> '. $dataMovement[0]["nombresucursal"] .'</p>
                    <p><b>Área de trabajo:</b> '. $dataMovement[0]["nombredepartamento"] .'</p>
                    <p><b>Personal:</b> '. $dataMovement[0]["nombrepersonal"] .'</p>
                    <p><b>Activos Solicitados:</b></p>
                                            
                    <table class="t-info">
                        <thead >
                        <tr>
                            <th>N°</th>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                        </tr>
                        </thead>'.
                        $tbody
                    .'</table>

                    <br><br><br>
                ';
            }
            
            $mainContent = '
                <div class="title">
                    <h1>Reporte Movimientos</h1>
                </div>'.
                // $subtitle . 
                $contentMovement .'
            ';

            $html = $this->mainHTML($mainContent);

            require_once '../vendor/autoload.php';

            // Crear una instancia de mPDF
            $mpdf = new \Mpdf\Mpdf();

            $mpdf->WriteHTML($html);
            $mpdf->Output("cuadro_de_depreciación.pdf", "I");

        }

        public function reportMyAssets($data){
            $dataMA = $data["data"];

            $tableContent = function () use ($dataMA) {
                $tbody = '';
                foreach ($dataMA as $key => $value) {
                    $tbody .= '<tr>
                        <td>'. $value["codigo"] .'</td>
                        <td>'. $value["nombre"] .'</td>
                        <td>'. $value["detalle"] .'</td>
                        <td>'. $value["micantidad"] .'</td>
                    </tr>'; 
                }
                return $tbody;              
            };

            $table = '';
            if ($dataMA) {
                $tbody = $tableContent();
                $table = '                                            
                    <table class="afr-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Detalle</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        '. $tbody .'
                    </table>';
            }
            
            $mainContent = '
                <div>
                    <h1>Mis bienes</h1>
                </div>
                <div class="afr-filter-void"></div>
                '. $table .'
            ';

            $pdf = new PDFFile();
            $pdf->createPdf($mainContent, "Mis Activos");
        }
    }
?>