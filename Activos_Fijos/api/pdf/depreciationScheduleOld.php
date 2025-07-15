<?php 

class DepreciationSchedule {
    private $datosEmpresa;
    private $stNW;
    private $gtNW;
    private $AF_ENV;
    private $tipo_inv_id;
    public function __construct(){
        $this->datosEmpresa= $_SESSION["af_datosempresa"];
        $this->stNW = (isset($_POST["menorque"]) && trim($_POST["menorque"])) ? $_POST["menorque"] : null;
        $this->gtNW = (isset($_POST["mayorque"]) && trim($_POST["mayorque"])) ? $_POST["mayorque"] : null;
        include "../db/af_env.php";
        $this->AF_ENV = $AF_ENV;
        $this->tipo_inv_id = isset($_SESSION["af_tipoinventario"]) ? $_SESSION["af_tipoinventario"]->tipo_inventario : null;
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
                        <img src="'. $this->AF_ENV["apiUrl"] .'/vapp/em/'. $this->datosEmpresa->logo .'" width="100" height="100">
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

    public function dateToLetter($fecha) {
        $dayWeek = function ($fecha) {
            $dias = array('Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado');
            $dia = $dias[date('w', strtotime($fecha))];
            return $dia;
        };

        $dia= $dayWeek($fecha);
        $num = date("j", strtotime($fecha));
        $year = date("Y", strtotime($fecha));
        $mes = array('enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre');
        $mes = $mes[(date('m', strtotime($fecha))*1)-1];
        return $num.' de '.$mes.' del '.$year;
    }

    public function StraightLine($data, $previousData = [], $mix = NULL){ 
        $categories = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAssets = $data["data"]; // []

        $dataCD = [];
        $dateOldDepreciation = NULL;

        $htmlCategorySector = "";
        $fa_array_position = 0;

        $totalPrice = 0;
        $totalSalvage = 0;
        $totalRevaluation = 0;
        $totalUpdatedValueOld = 0;
        $totalUpdate = 0;
        $totalUpdatedValue = 0;
        $totalDepreciation = 0;
        $totalAccumDeprOld = 0;
        $totalUpdateAD = 0;
        $totalAccumDeprU = 0;
        $totalAccumDepr = 0;
        $totalNetWorth = 0;

        // Categoria
        foreach ($categories as $keyC => $category) {

            $htmlTbody = '<tbody>';

            $usefulLife = $category["vidautil"]; //! Vida útil Años
            
            $partialPrice = 0;
            $partialSalvage = 0;
            $partialRevaluation = 0;
            $partialUpdatedValueOld = 0;
            $partialUpdate = 0;
            $partialUpdatedValue = 0;
            $partialDepreciation = 0;
            $partialAccumDeprOld = 0;
            $partialUpdateAD = 0;
            $partialAccumDeprU = 0;
            $partialAccumDepr = 0;
            $partialNetWorth = 0;
            $cont = 0;

            // Activo fijos
            for ($i=$fa_array_position; $i < sizeof($fixedAssets); $i++) { 
                $fixedAsset = $fixedAssets[$i];
                
                // Vefiricar si el activo pertenece a la categoria actual.
                if($fixedAsset["categorias_id"] ==  $category["id"]){
                    $fa_array_position ++;
                    $cont ++;

                    $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación
                    $dateDepreciation = $depreciationDate; //! Fecha depreciación

                    $dateRevFA = $fixedAsset["fecharevaluo"];
                    $isRevaluation = FALSE;
                    if ($dateRevFA && $fixedAsset["vidautilrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($dateDepreciation)) {
                        $dateFA = $dateRevFA;
                        $isRevaluation = TRUE;
                    }

                    $ufvFA_initialDate = $ufvValues[$dateFA];
                    
                    $yearFA = idate('Y', strtotime($dateFA));
                    $yearDepreciation = idate('Y', strtotime($dateDepreciation));
                    $monthFA = idate('m', strtotime($dateFA));
                    $monthDepreciation = idate('m', strtotime($dateDepreciation));

                    $salvagePercentage = $fixedAsset["salvamento"] / 100;
                    $usefulLifeRevaluation = ($isRevaluation) ? $fixedAsset["vidautilrevaluo"] : 0; //! Vida útil Revaluo
                    $newUsefulLife = $isRevaluation ? $usefulLifeRevaluation : $usefulLife;
                    $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                    $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                    $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo

                    $updatedValueOld = 0.00; //! Valor Actuali. / 31-12-0000
                    $update = 0; //! Actualiz.
                    $updatedValue = 0.00; //! Valor Actualizado
                    
                    $depreciation = 0; //! Depreciación Gesctión

                    $accumDeprOld = 0.00; //! Deprec. Acum.
                    $updateAD = 0.00; //! Actualiz. Dep. Acum.
                    $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                    $accumDepr = 0.00; //! Total Depec.
                    $netWorth = 0.00; //! Valor Neto

                    $notUsefulLife = FALSE;
                    if ($newUsefulLife === 0 || $newUsefulLife === NULL || $newUsefulLife === "0") {
                        $notUsefulLife = TRUE;
                    }

                    $newYear = $yearFA;
                    $newMonth = $monthFA;
                    $isPrevious = FALSE;
                    
                    $oldYear = NULL;
                    $oldMonth = NULL;

                    if ($previousData && array_key_exists($fixedAsset["id"], $previousData) 
                        &&  ($isRevaluation === FALSE || ($isRevaluation && strtotime($previousData[$fixedAsset["id"]]["fechadepreciacion"]) >= strtotime($dateFA)))) {
                        
                        $prevData = $previousData[$fixedAsset["id"]];
                        $prevDate = $prevData["fechadepreciacion"];
                        
                        $updatedValueOld = $prevData["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                        $update = $prevData["actualizacion"]; //! Actualiz.
                        $updatedValue = $yearFA == idate("Y", strtotime($prevDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                        $depreciation = $prevData["depreciacion"]; //! Depreciación Gesctión
                        $accumDeprOld = $prevData["depreciacionacumulada"]; //! Deprec. Acum.
                        $updateAD = $prevData["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                        $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                        $accumDepr = $accumDeprU + $depreciation; //! Total Depec.

                        if ($notUsefulLife) {
                            $depreciation = 0; //! Depreciación Gesctión
                            $accumDeprOld = 0.00; //! Deprec. Acum.
                            $updateAD = 0.00; //! Actualiz. Dep. Acum.
                            $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                            $accumDepr = 0.00; //! Total Depec.
                        }
                        $netWorth = $updatedValue - $accumDepr; //! Valor Neto
                        $ufvFA_initialDate = $ufvValues[$prevDate];

                        $newYear = idate('m', strtotime($prevDate)) == 12 && idate('d', strtotime($prevDate)) == 31 ?  idate('Y', strtotime($prevDate)) + 1 : idate('Y', strtotime($prevDate));
                        $newMonth = idate('m', strtotime($prevDate));
                        $isPrevious = TRUE;
                        $dateOldDepreciation = $prevDate;
                        $oldYear = idate('Y', strtotime($prevDate));
                        $oldMonth = idate('m', strtotime($prevDate));
                    }

                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es menor al de la depreciación.
                     * Esto para calcular los datos de la depreciación desde gestiones anteriores a la depreciación de la gestion actual.
                     */
                    if ($dateFA < $dateDepreciation && $yearFA < $yearDepreciation){

                        // Iteración donde se calculara el valor actualizaddo desde gestiones anteriores hasta la gestion actual.
                        for ($y = $newYear; $y <= $yearDepreciation; $y++) { 

                            $accumDeprOld = $accumDepr;
                            $updatedValueOld = $updatedValue;
                            $netWorth = $updatedValue - $accumDepr;

                            // Calcula la depreciación cuando ya venció la vida util, y continuar si la depreciación es mayour al al vencimiento de vida útil.
                            if ((($yearFA + $newUsefulLife) == $y && $monthFA >= 2) 
                                && strtotime(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1"))) <= strtotime(date("Y-m-d", strtotime($dateDepreciation)))
                                && strtotime(date("Y-m-d", strtotime($dateOldDepreciation))) < strtotime(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1")))
                                && !$notUsefulLife
                            ) 
                            {
                                $ufvDC = $ufvValues[date('Y-m-t', strtotime($y ."-". ($monthFA - 1) ."-1"))];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;
                                
                                $updatedValue = $updatedValueOld + $update;
                                
                                $realMonthL = ($oldYear && $oldYear == $yearDepreciation && $oldMonth <= $monthDepreciation) ? ($monthFA - 1) - $oldMonth : ($monthFA - 1); // Obtiene el mes real entre depreciaciones
                                $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $realMonthL : $updatedValue / $usefulLifeRevaluation / 12 * $realMonthL; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                
                                $updateAD = $accumDeprOld * $updateCoefficient;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;
                                
                                if (date('Y-m-t', strtotime($y ."-". ($monthFA -1) ."-1")) == $depreciationDate) {
                                    break;
                                } else {
                                    $accumDeprOld = $accumDepr;
                                    $updatedValueOld = $updatedValue;
                                    $netWorth = $updatedValue - $accumDepr;
                                }
                            }

                            // Si el valor neto es 0 ya no se deprecia ni acutaliza.
                            if (($yearFA + $newUsefulLife) <= $y && (float)round($netWorth, 2) == 0 && !$notUsefulLife) {
                                $update = 0.00;
                                $updatedValue = $updatedValueOld + $update;
                                $depreciation = 0.00;
                                $updateAD = 0.00;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;
                                continue;
                            }

                            // Si corresponde año de la depreciación requerida se realiza los ultimos cálculos.
                            if ($y == $yearDepreciation) {
                                $ufvDC = $ufvValues[$dateDepreciation];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;

                                $updatedValue = $updatedValueOld + $update;

                                if (!$notUsefulLife) {
                                    $realMonth = ($oldYear && $oldYear == $yearDepreciation && $oldMonth <= $monthDepreciation) ? $monthDepreciation - $oldMonth : $monthDepreciation; // Obtiene el mes real entre depreciaciones
                                    $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $realMonth : $updatedValue / $usefulLifeRevaluation / 12 * $realMonth; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
    
                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;
                                }
                                break;
                            // calculos para gestiones anterioes a la depreciación requerida.
                            } else {
                                // echo '<pre>'.print_r($fixedAsset["nombre"].": primero", true).'</pre>\n';
                                $ufvDC = $ufvValues[date($y.'-12-31', strtotime($dateDepreciation))];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;

                                /**
                                 * Verifica si el activo fijo se creo en la gestion actual de la iteración, para calcular los datos dede la 
                                 * fecha de compra del activo o de toda la gestion
                                 * */ 
                                if($y == $newYear && $oldYear == NULL) {
                                    $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                                    $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                                    if (!$notUsefulLife) {
                                        $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * ((12 - $newMonth) + 1) :  $updatedValue / $usefulLifeRevaluation / 12 * ((12 - $newMonth) + 1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo
                                    }
                                // Calcula los datos de gestiones anterioes a la gestión actual de la iteración.
                                } else {
                                    $update = $updatedValueOld * $updateCoefficient;
                                    $updatedValue = $updatedValueOld + $update;
                                    if (!$notUsefulLife) {
                                        $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * 12 : $updatedValue / $usefulLifeRevaluation / 12 * 12; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                    }
                                }
                                
                                if (!$notUsefulLife) {
                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;
                                }

                                $ufvFA_initialDate = $ufvDC; //* Se cambia el valor de la ufv al 31-12 de la gestion de la iteración.
                            }
                        }
                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es igual al de la depreciación.
                     * Esto para calcular los datos de la depreciación solo de la gestion actual.
                     */
                    } elseif ($dateFA < $dateDepreciation && $newYear == $yearDepreciation) {
                        // echo '<pre>'.print_r($fixedAsset["nombre"].": unico", true).'</pre>\n';
                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;

                        if (!$notUsefulLife) {      // TODO: fecha revaluación en el mismo año ?????
                            $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * (($monthDepreciation - $newMonth) + 1) :  $updatedValue / $usefulLifeRevaluation / 12 * (($monthDepreciation - $newMonth) + 1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo

                            $updateAD = $accumDeprOld * $updateCoefficient;
                            $accumDeprU = $accumDeprOld + $updateAD;;
                            $accumDepr = $accumDeprU + $depreciation;
                        }
                    } elseif ($dateFA == $dateDepreciation && $newYear == $yearDepreciation) {
                        // echo '<pre>'.print_r($fixedAsset["nombre"].": ultimo", true).'</pre>\n';
                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                    }
                    
                    $showData = FALSE;
                    if (($this->gtNW && $this->stNW) && ($updatedValue - $accumDepr) >= $this->gtNW && ($updatedValue - $accumDepr) <= $this->stNW) {
                        $showData = TRUE;
                    } else if ($this->gtNW && ($updatedValue - $accumDepr) >= $this->gtNW) {
                        $showData = TRUE;
                    } else if ($this->stNW && ($updatedValue - $accumDepr) <= $this->stNW) {
                        $showData = TRUE;
                    }
                    
                    if (!($this->gtNW || $this->stNW) || $showData === TRUE) {
                        $htmlTbody .= '  
                        <tr class="afr-tr-e">
                            <td class="afr-tc">'. $cont .'</td>
                            <td class="afr-tc">'. $fixedAsset["cantidad"] .'</td>
                            <td class="afr-ts afr-w-350">'. $fixedAsset["nombre"] .": ". $fixedAsset["detalle"] .'</td>
                            <td class="afr-tc">'. ( $isRevaluation ? "" : $usefulLife ) .'</td>
                            <td class="afr-tc">'. $usefulLifeRevaluation .'</td>
                            <td>'. date('d-m-Y', strtotime($dateFA)) .'</td>
                            <td>'. ( $isRevaluation ? "" : number_format((float)round($incomeValue, 2), 2, '.', '') ) .'</td>
                            <td>'. ( $isRevaluation ? "" : number_format((float)round($salvageValue, 2), 2, '.', '') ) .'</td>
                            <td>'. number_format((float)round($revaluation, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                            <td>'. ( (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '') ) .'</td>
                        </tr>';
                        $partialPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                        $partialSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                        $partialRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                        $partialUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                        $partialUpdate += number_format((float)round($update, 2), 2, '.', '');
                        $partialUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                        $partialDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                        $partialAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                        $partialUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                        $partialAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                        $partialAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                        $partialNetWorth += (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');
                        
                        $totalPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                        $totalSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                        $totalRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                        $totalUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                        $totalUpdate += number_format((float)round($update, 2), 2, '.', '');
                        $totalUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                        $totalDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                        $totalAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                        $totalUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                        $totalAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                        $totalAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                        $totalNetWorth += (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');

                        array_push($dataCD, [
                            "idactivo" => $fixedAsset["id"],
                            "valoractualizado" => $updatedValueOld,
                            "actualizacion" => $update,
                            "depreciacion" => $depreciation,
                            "dpracum" => $accumDeprOld,
                            "actdprcacum" => $updateAD,
                        ]);
                    } else {
                        $cont --;
                    }
                } else {
                    break;
                }
            }
            $htmlTbody .= '</tbody>';

                // <thead> ... </thead>
            if ($cont != 0) {
                $htmlRowCategory = ' 
                <tr class="afr-tcategory">
                    <th class="afr-ts" colspan="3">'. $category["nombre"] .'</th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th >'. number_format((float)round($partialPrice, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialSalvage, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialRevaluation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValueOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdate, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValue, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialDepreciation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdateAD, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprU, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDepr, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialNetWorth, 2), 2, '.', '') .'</th>
                </tr>';
                $htmlCategorySector .= $htmlRowCategory.$htmlTbody;
            } else {
                $htmlCategorySector .= $htmlTbody;
            }
        }

        $htmlRowTotal = '
        <tr >
            <td class="afr-void" colspan="18"></td>
        </tr>
        <tr class="afr-tcategory">
            <th class="afr-ts" colspan="6"> TOTAL GENERAL Bs. </th>
            <th >'. number_format((float)round($totalPrice, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalSalvage, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalRevaluation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValueOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdate, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValue, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalDepreciation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdateAD, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprU, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDepr, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalNetWorth, 2), 2, '.', '') .'</th>
        </tr>';
            
        $tableHeader = '<div>
            <div>
                <h1>Cuadro de depreciación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>
                
            <table class="afr-table-dpr">
                <thead>
                    <tr>
                        <th class="afr-tc" rowspan="2">N°</th>
                        <th class="afr-tc" rowspan="2">Cant.</th>
                        <th rowspan="2">Bien</th>
                        <th class="afr-tc" rowspan="2">Vida util Años</th>
                        <th class="afr-tc" rowspan="2">Vida util Revaluo</th>
                        <th rowspan="2">Fecha Incorporación</th>
                        <th rowspan="2">Valor Ingreso</th>
                        <th rowspan="2">Valor Baja / Salvamento</th>
                        <th rowspan="2">Valor Revaluo</th>
                        <th >Valor Actualiz.</th>
                        <th rowspan="2">Actualiz.</th>
                        <th rowspan="2">Valor Actualizado</th>
                        <th rowspan="2">Depreciación Gestión</th>
                        <th rowspan="2">Deprec. Acum.</th>
                        <th rowspan="2">Actualiz. Dep. Acum.</th>
                        <th rowspan="2">Dep. Acum. Actualiz.</th>
                        <th rowspan="2">Total Deprec.</th>
                        <th rowspan="2">Valor Neto</th>
                    </tr>
                    <tr>
                        <th >'. ($dateOldDepreciation ? date('d/m/Y', strtotime($dateOldDepreciation)) : date('31/12/Y', strtotime('-1 year', strtotime($depreciationDate)))) .'</th>
                    </tr>
                    <tr >
                        <td class="afr-void" colspan="18"></td>
                    </tr>
                </thead>
                '. $htmlCategorySector .'
                '. $htmlRowTotal .'
            </table>
            <br/>
        </div>';

        if (!($this->gtNW || $this->stNW)) {
            $db = new DBConnection();

            $empresa = $_SESSION["organizacion"];
            $creado_en = date("Y-m-d H:i:s");
            $usu_creador = $_SESSION["yofinanciero"];
            $isMix = $mix ? 1 : 0;
            $inv_type = $this->tipo_inv_id === "" ? 'NULL' : $this->tipo_inv_id;
            foreach ($dataCD as $value) {
                $idactivo = $value["idactivo"];
                $valoractualizado = $value["valoractualizado"];
                $actualizacion =  $value["actualizacion"];
                $depreciacion =  $value["depreciacion"];
                $dpracum = $value["dpracum"];
                $actudrcacum = $value["actdprcacum"];

                $querAI=$db->prepare("INSERT INTO cuadrodepreciacion (activosfijos_id, fechadepreciacion, valoractualizadoanterior, actualizacion, depreciacion, depreciacionacumulada, actdeprcacumulada, depreciacion_mixto, metododepreciacion_id, tipoinventario_id, empresa_id, creado_en, usu_creador) VALUES ('$idactivo', '$depreciationDate', '$valoractualizado', '$actualizacion', '$depreciacion', '$dpracum', '$actudrcacum', '$isMix', '1', $inv_type, '$empresa', '$creado_en', '$usu_creador')");
                $querAI->execute();
            }
        }

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }

    public function SumOfDigits($data, $previousData = [], $mix = NULL){ 
        $categories = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAssets = $data["data"]; // []

        $dataCD = [];
        $dateOldDepreciation = NULL;
        
        $htmlCategorySector = "";
        $fa_array_position = 0;

        $totalPrice = 0;
        $totalSalvage = 0;
        $totalRevaluation = 0;
        $totalUpdatedValueOld = 0;
        $totalUpdate = 0;
        $totalUpdatedValue = 0;
        $totalDepreciation = 0;
        $totalAccumDeprOld = 0;
        $totalUpdateAD = 0;
        $totalAccumDeprU = 0;
        $totalAccumDepr = 0;
        $totalNetWorth = 0;

        // Categoria
        foreach ($categories as $keyC => $category) {

            $htmlTbody = '<tbody>';

            $usefulLife = $category["vidautil"]; //! Vida útil Años
            
            $partialPrice = 0;
            $partialSalvage = 0;
            $partialRevaluation = 0;
            $partialUpdatedValueOld = 0;
            $partialUpdate = 0;
            $partialUpdatedValue = 0;
            $partialDepreciation = 0;
            $partialAccumDeprOld = 0;
            $partialUpdateAD = 0;
            $partialAccumDeprU = 0;
            $partialAccumDepr = 0;
            $partialNetWorth = 0;
            $cont = 0;

            // Activo fijos
            for ($i=$fa_array_position; $i < sizeof($fixedAssets); $i++) { 
                $fixedAsset = $fixedAssets[$i];
                
                // Vefiricar si el activo pertenece a la categoria actual.
                if($fixedAsset["categorias_id"] ==  $category["id"]){
                    $fa_array_position ++;
                    $cont ++;

                    $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación
                    $dateDepreciation = $depreciationDate; //! Fecha depreciación

                    $dateRevFA = $fixedAsset["fecharevaluo"];
                    $isRevaluation = FALSE;
                    if ($dateRevFA && $fixedAsset["vidautilrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($dateDepreciation)) {
                        $dateFA = $dateRevFA;
                        $isRevaluation = TRUE;
                    }

                    $ufvFA_initialDate = $ufvValues[$dateFA];
                    
                    $yearFA = idate('Y', strtotime($dateFA));
                    $yearDepreciation = idate('Y', strtotime($dateDepreciation));
                    $monthFA = idate('m', strtotime($dateFA));
                    $monthDepreciation = idate('m', strtotime($dateDepreciation));

                    $salvagePercentage = $fixedAsset["salvamento"] / 100;
                    $usefulLifeRevaluation = ($isRevaluation) ? $fixedAsset["vidautilrevaluo"] : 0; //! Vida útil Revaluo
                    $newUsefulLife = $isRevaluation ? $usefulLifeRevaluation : $usefulLife;
                    $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                    $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                    $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo

                    $arrayYearSumDigits = array_combine(range($yearFA, $yearFA + $newUsefulLife - 1), range($newUsefulLife, 1));
                    $sumOfDigits = (int)$newUsefulLife * ((int)$newUsefulLife + 1) / 2;
                    
                    
                    $updatedValueOld = 0.00; //! Valor Actuali. / 31-12-0000
                    $update = 0; //! Actualiz.
                    $updatedValue = 0.00; //! Valor Actualizado
                    
                    $depreciation = 0; //! Depreciación Gesctión

                    $accumDeprOld = 0.00; //! Deprec. Acum.
                    $updateAD = 0.00; //! Actualiz. Dep. Acum.
                    $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                    $accumDepr = 0.00; //! Total Depec.
                    $netWorth = 0.00; //! Valor Neto

                    $notUsefulLife = FALSE;
                    if ($newUsefulLife === 0 || $newUsefulLife === NULL || $newUsefulLife === "0") {
                        $notUsefulLife = TRUE;
                    }

                    $newYear = $yearFA;
                    $newMonth = $monthFA;
                    $isPrevious = FALSE;

                    if ($previousData && array_key_exists($fixedAsset["id"], $previousData)
                        &&  ($isRevaluation === FALSE || ($isRevaluation && strtotime($previousData[$fixedAsset["id"]]["fechadepreciacion"]) >= strtotime($dateFA)))) {
                        $prevData = $previousData[$fixedAsset["id"]];
                        $prevDate = $prevData["fechadepreciacion"];

                        $updatedValueOld = $prevData["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                        $update = $prevData["actualizacion"]; //! Actualiz.
                        // $updatedValue = $updatedValueOld + $update; //! Valor Actualizado
                        $updatedValue = $yearFA == idate("Y", strtotime($prevDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                        $depreciation = $prevData["depreciacion"]; //! Depreciación Gesctión
                        $accumDeprOld = $prevData["depreciacionacumulada"]; //! Deprec. Acum.
                        $updateAD = $prevData["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                        $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                        $accumDepr = $accumDeprU + $depreciation; //! Total Depec.
                        if ($notUsefulLife) {
                            $depreciation = 0; //! Depreciación Gesctión
                            $accumDeprOld = 0.00; //! Deprec. Acum.
                            $updateAD = 0.00; //! Actualiz. Dep. Acum.
                            $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                            $accumDepr = 0.00; //! Total Depec.
                        }
                        $netWorth = $updatedValue - $accumDepr; //! Valor Neto

                        $ufvFA_initialDate = $ufvValues[$prevData["fechadepreciacion"]];

                        // $newYear = idate('Y', strtotime($prevDate));
                        $newYear = idate('m', strtotime($prevDate)) == 12 && idate('d', strtotime($prevDate)) == 31 ?  idate('Y', strtotime($prevDate)) + 1 : idate('Y', strtotime($prevDate))  ;
                        $newMonth = idate('m', strtotime($prevDate));
                        $isPrevious = TRUE;
                        $dateOldDepreciation = $prevData["fechadepreciacion"];
                    }

                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es menor al de la depreciación.
                     * Esto para calcular los datos de la depreciación desde gestiones anteriores a la depreciación de la gestion actual.
                     */
                    if ($dateFA < $dateDepreciation && $yearFA < $yearDepreciation){

                        // Iteración donde se calculara el valor actualizaddo desde gestiones anteriores hasta la gestion actual.
                        for ($y = $newYear; $y <= $yearDepreciation; $y++) { 

                            $accumDeprOld = $accumDepr;
                            $updatedValueOld = $updatedValue;
                            $netWorth = $updatedValue - $accumDepr;

                            if ((($yearFA + $newUsefulLife) == $y && $monthFA >= 2) 
                                && strtotime(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1"))) <= strtotime(date("Y-m-d", strtotime($dateDepreciation)))
                            ) 
                            {
                                $ufvDC = $ufvValues[date('Y-m-t', strtotime($y ."-". ($monthFA - 1) ."-1"))];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;
                                
                                $updatedValue = $updatedValueOld + $update;
                                
                                $depreciation = ($updatedValue * $arrayYearSumDigits[$yearFA] / $sumOfDigits) / 12 * ($monthFA - 1); //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                
                                $updateAD = $accumDeprOld * $updateCoefficient;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;
                                
                                if (date('Y-m-t', strtotime($y ."-". ($monthFA -1) ."-1")) == $depreciationDate) {
                                    break;
                                } else {
                                    $accumDeprOld = $accumDepr;
                                    $updatedValueOld = $updatedValue;
                                    $netWorth = $updatedValue - $accumDepr;
                                }
                            }

                            // Si el valor neto es 0 ya no se deprecia ni acutaliza.
                            if (($yearFA + $newUsefulLife) <= $y && (float)round($netWorth, 2) == 0) {
                                $update = 0.00;
                                $updatedValue = $updatedValueOld + $update;
                                $depreciation = 0.00;
                                $updateAD = 0.00;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;
                                continue;
                            }

                            // Si corresponde año de la depreciación requerida se realiza los ultimos cálculos.
                            if ($y == $yearDepreciation) {
                                $ufvDC = $ufvValues[$dateDepreciation];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;

                                $updatedValue = $updatedValueOld + $update;

                                if (!$notUsefulLife) {
                                    $depreciation = ($updatedValue * $arrayYearSumDigits[$y] / $sumOfDigits) / 12 * $monthDepreciation; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion

                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;
                                }
                                break;
                            // calculos para gestiones anterioes
                            } else {
                                $ufvDC = $ufvValues[date($y.'-12-31', strtotime($dateDepreciation))];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;

                                /**
                                 * Verifica si el activo fijo se creo en la gestion actual de la iteración, para calcular los datos dede la 
                                 * fecha de compra del activo o de toda la gestion
                                 * */ 
                                if($y == $newYear) {
                                    $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                                    $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                                    if (!$notUsefulLife) {
                                        $depreciation = ($updatedValue * $arrayYearSumDigits[$y] / $sumOfDigits) / 12 * ((12 - $newMonth) + 1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo
                                    }
                                } else {
                                    $update = $updatedValueOld * $updateCoefficient;
                                    $updatedValue = $updatedValueOld + $update;
                                    if (!$notUsefulLife) {
                                        $depreciation = ($updatedValue * $arrayYearSumDigits[$y] / $sumOfDigits) / 12 * 12; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                    }
                                }
                                
                                if (!$notUsefulLife) {
                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;
                                }

                                $ufvFA_initialDate = $ufvDC; //* Se cambia el valor de la ufv al 31-12 de la gestion de la iteración.


                            }
                        }
                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es igual al de la depreciación.
                     * Esto para calcular los datos de la depreciación solo de la gestion actual.
                     */
                    } elseif ($dateFA < $dateDepreciation && $newYear == $yearDepreciation) {

                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;

                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;

                        if (!$notUsefulLife) {
                            $depreciation = ($updatedValue * $arrayYearSumDigits[$newYear] / $sumOfDigits) / 12 * (($monthDepreciation - $newMonth) + 1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo
                            
                            $updateAD = $accumDeprOld * $updateCoefficient;
                            $accumDeprU = $accumDeprOld + $updateAD;;
                            $accumDepr = $accumDeprU + $depreciation;
                        }
                    } elseif ($dateFA == $dateDepreciation && $newYear == $yearDepreciation){
                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;

                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                    }                     
                    
                    $showData = FALSE;
                    if (($this->gtNW && $this->stNW) && ($updatedValue - $accumDepr) >= $this->gtNW && ($updatedValue - $accumDepr) <= $this->stNW) {
                        $showData = TRUE;
                    } else if ($this->gtNW && ($updatedValue - $accumDepr) >= $this->gtNW) {
                        $showData = TRUE;
                    } else if ($this->stNW && ($updatedValue - $accumDepr) <= $this->stNW) {
                        $showData = TRUE;
                    }
                    
                    if (!($this->gtNW || $this->stNW) || $showData === TRUE) {
                        $htmlTbody .= '  
                        <tr class="afr-tr-e">
                            <td class="afr-tc">'. $cont .'</td>
                            <td class="afr-tc">'. $fixedAsset["cantidad"] .'</td>
                            <td class="afr-ts afr-w-350">'. $fixedAsset["nombre"] .": ". $fixedAsset["detalle"] .'</td>
                            <td class="afr-tc">'. ( $isRevaluation ? "" : $usefulLife ) .'</td>
                            <td class="afr-tc">'. $usefulLifeRevaluation .'</td>
                            <td>'. date('d-m-Y', strtotime($dateFA)) .'</td>
                            <td>'. ( $isRevaluation ? "" : number_format((float)round($incomeValue, 2), 2, '.', '') ) .'</td>
                            <td>'. ( $isRevaluation ? "" : number_format((float)round($salvageValue, 2), 2, '.', '') ) .'</td>
                            <td>'. number_format((float)round($revaluation, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                            <td>'. ( (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '') ) .'</td>
                        </tr>';
                        $partialPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                        $partialSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                        $partialRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                        $partialUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                        $partialUpdate += number_format((float)round($update, 2), 2, '.', '');
                        $partialUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                        $partialDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                        $partialAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                        $partialUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                        $partialAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                        $partialAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                        $partialNetWorth += (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');
                        
                        $totalPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                        $totalSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                        $totalRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                        $totalUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                        $totalUpdate += number_format((float)round($update, 2), 2, '.', '');
                        $totalUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                        $totalDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                        $totalAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                        $totalUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                        $totalAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                        $totalAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                        $totalNetWorth += (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');

                        array_push($dataCD, [
                            "idactivo" => $fixedAsset["id"],
                            "valoractualizado" => $updatedValueOld,
                            "actualizacion" => $update,
                            "depreciacion" => $depreciation,
                            "dpracum" => $accumDeprOld,
                            "actdprcacum" => $updateAD,
                        ]);
                    } else {
                        $cont --;
                    }
                } else {
                    break;
                }
            }
            $htmlTbody .= '</tbody>';

                // <thead> ... </thead>
            if ($cont != 0) {
                $htmlRowCategory = ' 
                <tr class="afr-tcategory">
                    <th class="afr-ts" colspan="3">'. $category["nombre"] .'</th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th >'. number_format((float)round($partialPrice, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialSalvage, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialRevaluation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValueOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdate, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValue, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialDepreciation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdateAD, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprU, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDepr, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialNetWorth, 2), 2, '.', '') .'</th>
                </tr>';
                $htmlCategorySector .= $htmlRowCategory.$htmlTbody;
            } else {
                $htmlCategorySector .= $htmlTbody;
            }
        }

        $htmlRowTotal = '
        <tr >
            <td class="afr-void" colspan="18"></td>
        </tr>
        <tr class="afr-tcategory">
            <th class="afr-ts" colspan="6"> TOTAL GENERAL Bs. </th>
            <th >'. number_format((float)round($totalPrice, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalSalvage, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalRevaluation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValueOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdate, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValue, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalDepreciation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdateAD, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprU, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDepr, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalNetWorth, 2), 2, '.', '') .'</th>
        </tr>';
            
        $tableHeader = '<div>
            <div>
                <h1>Cuadro de depreciación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>
                
            <table class="afr-table-dpr" >
                <thead>
                    <tr>
                        <th class="afr-tc" rowspan="2">N°</th>
                        <th class="afr-tc" rowspan="2">Cant.</th>
                        <th rowspan="2">Bien</th>
                        <th class="afr-tc" rowspan="2">Vida util Años</th>
                        <th class="afr-tc" rowspan="2">Vida util Revaluo</th>
                        <th rowspan="2">Fecha Incorporación</th>
                        <th rowspan="2">Valor Ingreso</th>
                        <th rowspan="2">Valor Baja / Salvamento</th>
                        <th rowspan="2">Valor Revaluo</th>
                        <th >Valor Actualiz.</th>
                        <th rowspan="2">Actualiz.</th>
                        <th rowspan="2">Valor Actualizado</th>
                        <th rowspan="2">Depreciación Gestión</th>
                        <th rowspan="2">Deprec. Acum.</th>
                        <th rowspan="2">Actualiz. Dep. Acum.</th>
                        <th rowspan="2">Dep. Acum. Actualiz.</th>
                        <th rowspan="2">Total Deprec.</th>
                        <th rowspan="2">Valor Neto</th>
                    </tr>
                    <tr>
                        <th >'. ($dateOldDepreciation ? date('d/m/Y', strtotime($dateOldDepreciation)) : date('31/12/Y', strtotime('-1 year', strtotime($depreciationDate)))) .'</th>
                    </tr>
                    <tr>
                        <td class="afr-void" colspan="18"></td>
                    </tr>
                </thead>
                '. $htmlCategorySector .'
                '. $htmlRowTotal .'
            </table>
            <br/>
        </div>';

        if (!($this->gtNW || $this->stNW)) {
            $db = new DBConnection();

            $empresa = $_SESSION["organizacion"];
            $creado_en = date("Y-m-d H:i:s");
            $usu_creador = $_SESSION["yofinanciero"];
            $isMix = $mix ? 1 : 0;
            $inv_type = $this->tipo_inv_id === "" ? 'NULL' : $this->tipo_inv_id;
            foreach ($dataCD as $value) {
                $idactivo = $value["idactivo"];
                $valoractualizado = $value["valoractualizado"];
                $actualizacion =  $value["actualizacion"];
                $depreciacion =  $value["depreciacion"];
                $dpracum = $value["dpracum"];
                $actudrcacum = $value["actdprcacum"];

                $querAI=$db->prepare("INSERT INTO cuadrodepreciacion (activosfijos_id, fechadepreciacion, valoractualizadoanterior, actualizacion, depreciacion, depreciacionacumulada, actdeprcacumulada, depreciacion_mixto, metododepreciacion_id, tipoinventario_id, empresa_id, creado_en, usu_creador) VALUES ('$idactivo', '$depreciationDate', '$valoractualizado', '$actualizacion', '$depreciacion', '$dpracum', '$actudrcacum', '$isMix', '2', $inv_type, '$empresa', '$creado_en', '$usu_creador')");
                $querAI->execute();
            }
        }

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }

    public function ProductionUnits($data, $previousData = [], $mix = NULL){ 
        $categories = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAssets = $data["data"]; // []
        $usageTime = $data["dataUsage"]; // []

        $dataCD = [];
        $dateOldDepreciation = NULL;
        
        $htmlCategorySector = "";
        $fa_array_position = 0;

        $totalPrice = 0;
        $totalSalvage = 0;
        $totalRevaluation = 0;
        $totalUpdatedValueOld = 0;
        $totalUpdate = 0;
        $totalUpdatedValue = 0;
        $totalDepreciation = 0;
        $totalAccumDeprOld = 0;
        $totalUpdateAD = 0;
        $totalAccumDeprU = 0;
        $totalAccumDepr = 0;
        $totalNetWorth = 0;

        // Categoria
        foreach ($categories as $keyC => $category) {

            $htmlTbody = '<tbody>';

            
            $partialPrice = 0;
            $partialSalvage = 0;
            $partialRevaluation = 0;
            $partialUpdatedValueOld = 0;
            $partialUpdate = 0;
            $partialUpdatedValue = 0;
            $partialDepreciation = 0;
            $partialAccumDeprOld = 0;
            $partialUpdateAD = 0;
            $partialAccumDeprU = 0;
            $partialAccumDepr = 0;
            $partialNetWorth = 0;
            $cont = 0;

            // Activo fijos
            for ($i=$fa_array_position; $i < sizeof($fixedAssets); $i++) { 
                $fixedAsset = $fixedAssets[$i];
                
                // Vefiricar si el activo pertenece a la categoria actual.
                if($fixedAsset["categorias_id"] ==  $category["id"]){
                    $fa_array_position ++;
                    $cont ++;

                    $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación
                    $dateDepreciation = $depreciationDate; //! Fecha depreciación

                    $dateRevFA = $fixedAsset["fecharevaluo"];
                    $isRevaluation = FALSE;
                    if ($dateRevFA && $fixedAsset["duracionrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($dateDepreciation)) {
                        $dateFA = $dateRevFA;
                        $isRevaluation = TRUE;
                    }

                    $ufvFA_initialDate = $ufvValues[$dateFA];
                    
                    $yearFA = idate('Y', strtotime($dateFA));
                    $yearDepreciation = idate('Y', strtotime($dateDepreciation));
                    $monthFA = idate('m', strtotime($dateFA));
                    $monthDepreciation = idate('m', strtotime($dateDepreciation));

                    $factoryCapacity = $fixedAsset["duracion"]; //! Capacidad de fábrica
                    $salvagePercentage = $fixedAsset["salvamento"] / 100;
                    $capacityRevaluation = ($isRevaluation) ? $fixedAsset["duracionrevaluo"] : 0; //! Capacidad Revaluado
                    $newFactoryCapacity = $isRevaluation ? $capacityRevaluation : $factoryCapacity;

                    $usage = 0; //! Capacidad Usado periodo
                    $acummUsage = 0; //! Capacidad Usado Acumulado
                    
                    $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                    $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                    $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo

                    $updatedValueOld = 0.00; //! Valor Actuali. / 31-12-0000
                    $update = 0; //! Actualiz.
                    $updatedValue = 0.00; //! Valor Actualizado
                    
                    $depreciation = 0; //! Depreciación Gesctión

                    $accumDeprOld = 0.00; //! Deprec. Acum.
                    $updateAD = 0.00; //! Actualiz. Dep. Acum.
                    $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                    $accumDepr = 0.00; //! Total Depec.
                    $netWorth = 0.00; //! Valor Neto

                    $newYear = $yearFA;
                    $newMonth = $monthFA;
                    $isPrevious = FALSE;

                    if ($previousData && array_key_exists($fixedAsset["id"], $previousData)
                        &&  ($isRevaluation === FALSE || ($isRevaluation && strtotime($previousData[$fixedAsset["id"]]["fechadepreciacion"]) >= strtotime($dateFA)))) {
                        $prevData = $previousData[$fixedAsset["id"]];
                        $prevDate = $prevData["fechadepreciacion"];

                        $usage = $prevData["usoperiodo"];
                        $acummUsage = $prevData["usoacumulado"];

                        $updatedValueOld = $prevData["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                        $update = $prevData["actualizacion"]; //! Actualiz.
                        // $updatedValue = $updatedValueOld + $update; //! Valor Actualizado
                        $updatedValue = $yearFA == idate("Y", strtotime($prevDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                        $depreciation = $prevData["depreciacion"]; //! Depreciación Gesctión
                        $accumDeprOld = $prevData["depreciacionacumulada"]; //! Deprec. Acum.
                        $updateAD = $prevData["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                        $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                        $accumDepr = $accumDeprU + $depreciation; //! Total Depec.
                        $netWorth = $updatedValue - $accumDepr; //! Valor Neto

                        $ufvFA_initialDate = $ufvValues[$prevDate];

                        // $newYear = idate('Y', strtotime($prevDate));
                        $newYear = idate('m', strtotime($prevDate)) == 12 && idate('d', strtotime($prevDate)) == 31 ?  idate('Y', strtotime($prevDate)) + 1 : idate('Y', strtotime($prevDate));
                        $newMonth = idate('m', strtotime($prevDate));
                        $isPrevious = TRUE;
                        $dateOldDepreciation = $prevDate;
                    }

                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es menor al de la depreciación.
                     * Esto para calcular los datos de la depreciación desde gestiones anteriores a la depreciación de la gestion actual.
                     */
                    if ($dateFA < $dateDepreciation && $yearFA < $yearDepreciation){

                        // Iteración donde se calculara el valor actualizaddo desde gestiones anteriores hasta la gestion actual.
                        for ($y = $newYear; $y <= $yearDepreciation; $y++) { 

                            $accumDeprOld = $accumDepr;
                            $updatedValueOld = $updatedValue;
                            $netWorth = $updatedValue - $accumDepr;

                            // Si el valor neto es 0 ya no se deprecia ni acutaliza.
                            if ($newFactoryCapacity > 0 && $newFactoryCapacity == $acummUsage && (float)round($netWorth, 2) == 0) {
                                $usage = 0;
                                $update = 0.00;
                                $updatedValue = $updatedValueOld + $update;
                                $depreciation = 0.00;
                                $updateAD = 0.00;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;

                                continue;
                            }

                            // Si corresponde año de la depreciación requerida se realiza los ultimos cálculos.
                            if ($y == $yearDepreciation) {
                                $usage = floatval($usageTime[$fixedAsset["id"]][$dateDepreciation]);

                                $acummUsage += $usage;
                                
                                $ufvDC = $ufvValues[$dateDepreciation];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;

                                $updatedValue = $updatedValueOld + $update;

                                $depreciation = $revaluation == 0 ? $updatedValue / $factoryCapacity * $usage :  $updatedValue / $capacityRevaluation * $usage;

                                $updateAD = $accumDeprOld * $updateCoefficient;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;
                                break;
                            // calculos para gestiones anterioes
                            } else {
                                $lastYUfv = date($y.'-12-31', strtotime($dateDepreciation));

                                $usage = floatval($usageTime[$fixedAsset["id"]][$lastYUfv]);
                                $acummUsage += $usage;
                                
                                $ufvDC = $ufvValues[$lastYUfv];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;

                                /**
                                 * Verifica si el activo fijo se creo en la gestion actual de la iteración, para calcular los datos dede la 
                                 * fecha de compra del activo o de toda la gestion
                                 * */ 
                                if($y == $newYear) {
                                    $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                                    $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                                } else {
                                    $update = $updatedValueOld * $updateCoefficient;
                                    $updatedValue = $updatedValueOld + $update;
                                }

                                $depreciation = $revaluation == 0 ? $updatedValue / $factoryCapacity * $usage :  $updatedValue / $capacityRevaluation * $usage;
                                
                                $updateAD = $accumDeprOld * $updateCoefficient;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;

                                $ufvFA_initialDate = $ufvDC; //* Se cambia el valor de la ufv al 31-12 de la gestion de la iteración.
                            }
                        }
                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es igual al de la depreciación.
                     * Esto para calcular los datos de la depreciación solo de la gestion actual.
                     */
                    } elseif ($dateFA < $dateDepreciation && $newYear == $yearDepreciation) {

                        $usage = floatval($usageTime[$fixedAsset["id"]][$dateDepreciation]);
                        $acummUsage += $usage;

                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;

                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;

                        $depreciation = $revaluation == 0 ? $updatedValue / $factoryCapacity * $usage :  $updatedValue / $capacityRevaluation * $usage;

                        $updateAD = $accumDeprOld * $updateCoefficient;
                        $accumDeprU = $accumDeprOld + $updateAD;;

                        $accumDepr = $accumDeprU + $depreciation;
                    }
                               
                    $showData = FALSE;
                    if (($this->gtNW && $this->stNW) && ($updatedValue - $accumDepr) >= $this->gtNW && ($updatedValue - $accumDepr) <= $this->stNW) {
                        $showData = TRUE;
                    } else if ($this->gtNW && ($updatedValue - $accumDepr) >= $this->gtNW) {
                        $showData = TRUE;
                    } else if ($this->stNW && ($updatedValue - $accumDepr) <= $this->stNW) {
                        $showData = TRUE;
                    }
                    
                    if (!($this->gtNW || $this->stNW) || $showData === TRUE) {
                        $htmlTbody .= '  
                        <tr class="afr-tr-e">
                            <td class="afr-tc">'. $cont .'</td>
                            <td class="afr-tc">'. $fixedAsset["cantidad"] .'</td>
                            <td class="afr-ts afr-w-350">'. $fixedAsset["nombre"] .": ". $fixedAsset["detalle"] .'</td>

                            <td>'. date('d-m-Y', strtotime($dateFA)) .'</td>

                            <td class="afr-tc">'. ( $isRevaluation ? "" : $factoryCapacity ) .'</td>
                            <td class="afr-tc">'. $capacityRevaluation .'</td>
                            <td class="afr-tc">'. $usage .'</td>
                            <td class="afr-tc">'. ( $isRevaluation ? "" : $acummUsage ) .'</td>

                            <td>'. ( $isRevaluation ? "" : number_format((float)round($incomeValue, 2), 2, '.', '') ) .'</td>
                            <td>'. ( $isRevaluation ? "" : number_format((float)round($salvageValue, 2), 2, '.', '') ) .'</td>
                            <td>'. number_format((float)round($revaluation, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                            <td>'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                            <td>'. ( (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '') ) .'</td>
                        </tr>';
                        $partialPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                        $partialSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                        $partialRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                        $partialUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                        $partialUpdate += number_format((float)round($update, 2), 2, '.', '');
                        $partialUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                        $partialDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                        $partialAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                        $partialUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                        $partialAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                        $partialAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                        $partialNetWorth += number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');
                        
                        $totalPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                        $totalSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                        $totalRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                        $totalUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                        $totalUpdate += number_format((float)round($update, 2), 2, '.', '');
                        $totalUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                        $totalDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                        $totalAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                        $totalUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                        $totalAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                        $totalAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                        $totalNetWorth += number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');

                        array_push($dataCD, [
                            "idactivo" => $fixedAsset["id"],
                            "valoractualizado" => $updatedValueOld,
                            "actualizacion" => $update,
                            "depreciacion" => $depreciation,
                            "dpracum" => $accumDeprOld,
                            "actdprcacum" => $updateAD,
                            "usoperiodo" => $usage,
                            "usoacumulado" => $acummUsage,
                        ]);
                    } else {
                        $cont --;
                    }
                } else {
                    break;
                }
            }
            $htmlTbody .= '</tbody>';

                // <thead> ... </thead>
            if ($cont != 0) {
                $htmlRowCategory = ' 
                <tr class="afr-tcategory">
                    <th class="afr-ts" colspan="3">'. $category["nombre"] .'</th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th >'. number_format((float)round($partialPrice, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialSalvage, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialRevaluation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValueOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdate, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValue, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialDepreciation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdateAD, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprU, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDepr, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialNetWorth, 2), 2, '.', '') .'</th>
                </tr>';
                $htmlCategorySector .= $htmlRowCategory.$htmlTbody;
            } else {
                $htmlCategorySector .= $htmlTbody;
            }
        }

        $htmlRowTotal = '
        <tr >
            <td class="afr-void" colspan="18"></td>
        </tr>
        <tr class="afr-tcategory">
            <th class="left" colspan="8"> TOTAL GENERAL Bs. </th>
            <th >'. number_format((float)round($totalPrice, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalSalvage, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalRevaluation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValueOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdate, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValue, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalDepreciation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdateAD, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprU, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDepr, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalNetWorth, 2), 2, '.', '') .'</th>
        </tr>';
            
        $tableHeader = '<div>
            <div>
                <h1>Cuadro de depreciación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>
                
            <table class="afr-table-dpr" >
                <thead>
                    <tr>
                        <th class="afr-tc" rowspan="2">N°</th>
                        <th class="afr-tc" rowspan="2">Cant.</th>
                        <th rowspan="2">Bien</th>

                        <th rowspan="2">Fecha Incorporación</th>

                        <th rowspan="2">Capacidad de fábrica</th>
                        <th rowspan="2">Capacidad Revaluado</th>
                        <th rowspan="2">Capacidad Usado periosdo</th>
                        <th rowspan="2">Capacidad Usado Acumulado</th>

                        <th rowspan="2">Valor Ingreso</th>
                        <th rowspan="2">Valor Baja / Salvamento</th>
                        <th rowspan="2">Valor Revaluo</th>
                        <th >Valor Actualiz.</th>
                        <th rowspan="2">Actualiz.</th>
                        <th rowspan="2">Valor Actualizado</th>
                        <th rowspan="2">Depreciación Gestión</th>
                        <th rowspan="2">Deprec. Acum.</th>
                        <th rowspan="2">Actualiz. Dep. Acum.</th>
                        <th rowspan="2">Dep. Acum. Actualiz.</th>
                        <th rowspan="2">Total Deprec.</th>
                        <th rowspan="2">Valor Neto</th>
                    </tr>
                    <tr>
                        <th >'. ($dateOldDepreciation ? date('d/m/Y', strtotime($dateOldDepreciation)) : date('31/12/Y', strtotime('-1 year', strtotime($depreciationDate)))) .'</th>
                    </tr>
                    <tr >
                        <td class="afr-void" colspan="16"></td>
                    </tr>
                </thead>
                '. $htmlCategorySector .'
                '. $htmlRowTotal .'
            </table>
            <br/>
        </div>';

        if (!($this->gtNW || $this->stNW)) {
            $db = new DBConnection();

            $empresa = $_SESSION["organizacion"];
            $creado_en = date("Y-m-d H:i:s");
            $usu_creador = $_SESSION["yofinanciero"];
            $isMix = $mix ? 1 : 0;
            $inv_type = $this->tipo_inv_id === "" ? 'NULL' : $this->tipo_inv_id;
            foreach ($dataCD as $value) {
                $idactivo = $value["idactivo"];
                $valoractualizado = $value["valoractualizado"];
                $actualizacion =  $value["actualizacion"];
                $depreciacion =  $value["depreciacion"];
                $dpracum = $value["dpracum"];
                $actudrcacum = $value["actdprcacum"];
                $usoPeriodo = $value["usoperiodo"];
                $usoAcum = $value["usoacumulado"];

                $querAI=$db->prepare("INSERT INTO cuadrodepreciacion (activosfijos_id, fechadepreciacion, valoractualizadoanterior, actualizacion, depreciacion, depreciacionacumulada, actdeprcacumulada, usoperiodo, usoacumulado, depreciacion_mixto, metododepreciacion_id, tipoinventario_id, empresa_id, creado_en, usu_creador) VALUES ('$idactivo', '$depreciationDate', '$valoractualizado', '$actualizacion', '$depreciacion', '$dpracum', '$actudrcacum', '$usoPeriodo', '$usoAcum', '$isMix', '3', $inv_type, '$empresa', '$creado_en', '$usu_creador')");
                $querAI->execute();
            }
        }

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }
    
    public function StraightLineChart($data, $previousData = []){ 
        $categories = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAssets = $data["data"]; // []

        $dateOldDepreciation = NULL;

        $fa_array_position = 0;
        $arrayCAtegoryValue = [];


        // Categoria
        foreach ($categories as $keyC => $category) {

            $usefulLife = $category["vidautil"]; //! Vida útil Años
    
            $partialNetWorth = 0;
            $cont = 0;

            // Activo fijos
            for ($i=$fa_array_position; $i < sizeof($fixedAssets); $i++) { 
                $fixedAsset = $fixedAssets[$i];
                
                // Vefiricar si el activo pertenece a la categoria actual.
                if($fixedAsset["categorias_id"] ==  $category["id"]){
                    $fa_array_position ++;
                    $cont ++;

                    $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación
                    $dateDepreciation = $depreciationDate; //! Fecha depreciación

                    $dateRevFA = $fixedAsset["fecharevaluo"];
                    $isRevaluation = FALSE;
                    if ($dateRevFA && $fixedAsset["vidautilrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($dateDepreciation)) {
                        $dateFA = $dateRevFA;
                        $isRevaluation = TRUE;
                    }

                    $ufvFA_initialDate = $ufvValues[$dateFA];
                    
                    $yearFA = idate('Y', strtotime($dateFA));
                    $yearDepreciation = idate('Y', strtotime($dateDepreciation));
                    $monthFA = idate('m', strtotime($dateFA));
                    $monthDepreciation = idate('m', strtotime($dateDepreciation));

                    $salvagePercentage = $fixedAsset["salvamento"] / 100;
                    $usefulLifeRevaluation = ($isRevaluation) ? $fixedAsset["vidautilrevaluo"] : 0; //! Vida útil Revaluo
                    $newUsefulLife = $isRevaluation ? $usefulLifeRevaluation : $usefulLife;
                    $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                    $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                    $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo

                    $updatedValueOld = 0.00; //! Valor Actuali. / 31-12-0000
                    $update = 0; //! Actualiz.
                    $updatedValue = 0.00; //! Valor Actualizado
                    
                    $depreciation = 0; //! Depreciación Gesctión

                    $accumDeprOld = 0.00; //! Deprec. Acum.
                    $updateAD = 0.00; //! Actualiz. Dep. Acum.
                    $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                    $accumDepr = 0.00; //! Total Depec.
                    $netWorth = 0.00; //! Valor Neto

                    $notUsefulLife = FALSE;
                    if ($newUsefulLife === 0 || $newUsefulLife === NULL || $newUsefulLife === "0") {
                        $notUsefulLife = TRUE;
                    }

                    $newYear = $yearFA;
                    $newMonth = $monthFA;
                    $isPrevious = FALSE;
                    
                    $oldYear = NULL;
                    $oldMonth = NULL;

                    if ($previousData && array_key_exists($fixedAsset["id"], $previousData) 
                        &&  ($isRevaluation === FALSE || ($isRevaluation && strtotime($previousData[$fixedAsset["id"]]["fechadepreciacion"]) >= strtotime($dateFA)))) {
                        
                        $prevData = $previousData[$fixedAsset["id"]];
                        $prevDate = $prevData["fechadepreciacion"];
                        
                        $updatedValueOld = $prevData["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                        $update = $prevData["actualizacion"]; //! Actualiz.
                        $updatedValue = $yearFA == idate("Y", strtotime($prevDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                        $depreciation = $prevData["depreciacion"]; //! Depreciación Gesctión
                        $accumDeprOld = $prevData["depreciacionacumulada"]; //! Deprec. Acum.
                        $updateAD = $prevData["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                        $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                        $accumDepr = $accumDeprU + $depreciation; //! Total Depec.

                        // echo '<pre>'.print_r($fixedAsset["nombre"].": ", true).'</pre>\n';


                        if ($notUsefulLife) {
                            $depreciation = 0; //! Depreciación Gesctión
                            $accumDeprOld = 0.00; //! Deprec. Acum.
                            $updateAD = 0.00; //! Actualiz. Dep. Acum.
                            $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                            $accumDepr = 0.00; //! Total Depec.
                        }
                        $netWorth = $updatedValue - $accumDepr; //! Valor Neto
                        // echo '<pre>'.print_r($fixedAsset["nombre"].": -- ". $netWorth, true).'</pre>\n';


                        $ufvFA_initialDate = $ufvValues[$prevDate];

                        $newYear = idate('m', strtotime($prevDate)) == 12 && idate('d', strtotime($prevDate)) == 31 ?  idate('Y', strtotime($prevDate)) + 1 : idate('Y', strtotime($prevDate));
                        $newMonth = idate('m', strtotime($prevDate));
                        $isPrevious = TRUE;
                        $dateOldDepreciation = $prevDate;
                        $oldYear = idate('Y', strtotime($prevDate));
                        $oldMonth = idate('m', strtotime($prevDate));
                    }

                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es menor al de la depreciación.
                     * Esto para calcular los datos de la depreciación desde gestiones anteriores a la depreciación de la gestion actual.
                     */
                    if ($dateFA < $dateDepreciation && $yearFA < $yearDepreciation){

                        // Iteración donde se calculara el valor actualizaddo desde gestiones anteriores hasta la gestion actual.
                        for ($y = $newYear; $y <= $yearDepreciation; $y++) { 

                            $accumDeprOld = $accumDepr;
                            $updatedValueOld = $updatedValue;
                            $netWorth = $updatedValue - $accumDepr;

                            // echo '<pre>'.print_r($fixedAsset["nombre"].": N: " . $netWorth, true).'</pre>\n';

                            // Calcula la depreciación cuando ya venció la vida util, y continuar si la depreciación es mayour al al vencimiento de vida útil.
                            if ((($yearFA + $newUsefulLife) == $y && $monthFA >= 2) 
                                && strtotime(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1"))) <= strtotime(date("Y-m-d", strtotime($dateDepreciation)))
                                && strtotime(date("Y-m-d", strtotime($dateOldDepreciation))) < strtotime(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1")))
                                && !$notUsefulLife
                            ) 
                            {

                                $ufvDC = $ufvValues[date('Y-m-t', strtotime($y ."-". ($monthFA - 1) ."-1"))];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;
                                
                                $updatedValue = $updatedValueOld + $update;
                                
                                $realMonthL = ($oldYear && $oldYear == $yearDepreciation && $oldMonth <= $monthDepreciation) ? ($monthFA - 1) - $oldMonth : ($monthFA - 1); // Obtiene el mes real entre depreciaciones
                                $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $realMonthL : $updatedValue / $usefulLifeRevaluation / 12 * $realMonthL; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                
                                $updateAD = $accumDeprOld * $updateCoefficient;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;
                                
                                if (date('Y-m-t', strtotime($y ."-". ($monthFA -1) ."-1")) == $depreciationDate) {
                                    break;
                                } else {
                                    $accumDeprOld = $accumDepr;
                                    $updatedValueOld = $updatedValue;
                                    $netWorth = $updatedValue - $accumDepr;
                                }
                            }

                            // Si el valor neto es 0 ya no se deprecia ni acutaliza.
                            // echo '<pre>'.print_r($fixedAsset["nombre"].": V:: " . $netWorth, true).'</pre>\n';
                            if (($yearFA + $newUsefulLife) <= $y && (float)round($netWorth, 2) == 0 && !$notUsefulLife) {
                                $update = 0.00;
                                $updatedValue = $updatedValueOld + $update;
                                $depreciation = 0.00;
                                $updateAD = 0.00;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;
                                continue;
                            }

                            // Si corresponde año de la depreciación requerida se realiza los ultimos cálculos.
                            if ($y == $yearDepreciation) {
                                $ufvDC = $ufvValues[$dateDepreciation];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;

                                $updatedValue = $updatedValueOld + $update;

                                if (!$notUsefulLife) {
                                    $realMonth = ($oldYear && $oldYear == $yearDepreciation && $oldMonth <= $monthDepreciation) ? $monthDepreciation - $oldMonth : $monthDepreciation; // Obtiene el mes real entre depreciaciones
                                    $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $realMonth : $updatedValue / $usefulLifeRevaluation / 12 * $realMonth; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
    
                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;
                                }
                                break;
                            // calculos para gestiones anterioes a la depreciación requerida.
                            } else {
                                $ufvDC = $ufvValues[date($y.'-12-31', strtotime($dateDepreciation))];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;

                                /**
                                 * Verifica si el activo fijo se creo en la gestion actual de la iteración, para calcular los datos dede la 
                                 * fecha de compra del activo o de toda la gestion
                                 * */ 
                                if($y == $newYear && $oldYear == NULL) {
                                    $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                                    $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                                    if (!$notUsefulLife) {
                                        $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * ((12 - $newMonth) + 1) :  $updatedValue / $usefulLifeRevaluation / 12 * ((12 - $newMonth) + 1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo
                                    }
                                // Calcula los datos de gestiones anterioes a la gestión actual de la iteración.
                                } else {
                                    $update = $updatedValueOld * $updateCoefficient;
                                    $updatedValue = $updatedValueOld + $update;
                                    if (!$notUsefulLife) {
                                        $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * 12 : $updatedValue / $usefulLifeRevaluation / 12 * 12; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                    }
                                }
                                
                                if (!$notUsefulLife) {
                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;
                                }

                                $ufvFA_initialDate = $ufvDC; //* Se cambia el valor de la ufv al 31-12 de la gestion de la iteración.
                            }
                        }
                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es igual al de la depreciación.
                     * Esto para calcular los datos de la depreciación solo de la gestion actual.
                     */
                    } elseif ($dateFA < $dateDepreciation && $newYear == $yearDepreciation) {

                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;

                        if (!$notUsefulLife) {      // TODO: fecha revaluación en el mismo año ?????
                            $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * (($monthDepreciation - $newMonth) + 1) :  $updatedValue / $usefulLifeRevaluation / 12 * (($monthDepreciation - $newMonth) + 1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo

                            $updateAD = $accumDeprOld * $updateCoefficient;
                            $accumDeprU = $accumDeprOld + $updateAD;;
                            $accumDepr = $accumDeprU + $depreciation;
                        }
                    } elseif ($dateFA == $dateDepreciation && $newYear == $yearDepreciation) {
                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                    }

                    $partialNetWorth += number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');

                } else {
                    break;
                }
            }

            $arrayCAtegoryValue[$category["nombre"]] = number_format((float)round($partialNetWorth, 2), 2, '.', '');
        }

        return $arrayCAtegoryValue;
    }
    
    public function BarChart($data){ 
        $categories = $data["dataCategory"]; // []
        $fixedAssets = $data["data"]; // []

        $fa_array_position = 0;
        $arrayCAtegoryValue = [];

        // Categoria
        foreach ($categories as $keyC => $category) {

            $partialValue = 0.00;
            $cont = 0;

            // Activo fijos
            for ($i=$fa_array_position; $i < sizeof($fixedAssets); $i++) { 
                $fixedAsset = $fixedAssets[$i];
                
                // Vefiricar si el activo pertenece a la categoria actual.
                if($fixedAsset["categorias_id"] ==  $category["id"]){
                    $fa_array_position ++;
                    $cont ++;

                    $assetValue = (float) $fixedAsset["precio"];
                    
                    $revaluation = $fixedAsset["valorrevaluo"];
                    if ($revaluation) {
                        $assetValue = (float) $revaluation;
                    }
                    $partialValue += $assetValue;
                } else {
                    break;
                }
            }
            $arrayCAtegoryValue[$category["nombre"]] = number_format((float)round($partialValue, 2), 2, '.', '');
        }
        return $arrayCAtegoryValue;
    }

    public function ShowStraightLine($data, $previousData = []){ 
        $categories = $data["dataCategory"]; // []
        $depreciationDate = $data["date"]; //! Fecha depreciación
        $fixedAssets = $data["data"]; // []

        $htmlCategorySector = "";
        $fa_array_position = 0;

        $totalPrice = 0;
        $totalSalvage = 0;
        $totalRevaluation = 0;
        $totalUpdatedValueOld = 0;
        $totalUpdate = 0;
        $totalUpdatedValue = 0;
        $totalDepreciation = 0;
        $totalAccumDeprOld = 0;
        $totalUpdateAD = 0;
        $totalAccumDeprU = 0;
        $totalAccumDepr = 0;
        $totalNetWorth = 0;

        // Categoria
        foreach ($categories as $keyC => $category) {

            $htmlTbody = '<tbody>';

            $usefulLife = $category["vidautil"]; //! Vida útil Años
            
            $partialPrice = 0;
            $partialSalvage = 0;
            $partialRevaluation = 0;
            $partialUpdatedValueOld = 0;
            $partialUpdate = 0;
            $partialUpdatedValue = 0;
            $partialDepreciation = 0;
            $partialAccumDeprOld = 0;
            $partialUpdateAD = 0;
            $partialAccumDeprU = 0;
            $partialAccumDepr = 0;
            $partialNetWorth = 0;
            $cont = 0;

            // Activo fijos
            for ($i=$fa_array_position; $i < sizeof($fixedAssets); $i++) { 
                $fixedAsset = $fixedAssets[$i];
                
                // Vefiricar si el activo pertenece a la categoria actual.
                if($fixedAsset["categorias_id"] ==  $category["id"]){
                    $fa_array_position ++;
                    $cont ++;

                    $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación

                    $dateRevFA = $fixedAsset["fecharevaluo"];
                    $isRevaluation = FALSE;
                    if ($dateRevFA && $fixedAsset["vidautilrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($depreciationDate)) {
                        $dateFA = $dateRevFA;
                        $isRevaluation = TRUE;
                    }
                    $salvagePercentage = $fixedAsset["salvamento"] / 100;
                    
                    // Asignación de valores recuperados de DB.
                    $prevData = $previousData[$fixedAsset["id"]];
                    
                    $usefulLifeRevaluation = ($isRevaluation) ? $fixedAsset["vidautilrevaluo"] : 0; //! Vida útil Revaluo
                    $newUsefulLife = $isRevaluation ? $usefulLifeRevaluation : $usefulLife;
                    $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                    $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                    $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo
                    $updatedValueOld = $prevData["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                    $update = $prevData["actualizacion"]; //! Actualiz.
                    $updatedValue = idate("Y", strtotime($dateFA)) == idate("Y", strtotime($depreciationDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                    $depreciation = $prevData["depreciacion"]; //! Depreciación Gesctión
                    $accumDeprOld = $prevData["depreciacionacumulada"]; //! Deprec. Acum.
                    $updateAD = $prevData["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                    $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                    $accumDepr = $accumDeprU + $depreciation; //! Total Depec.
                    $netWorth = $updatedValue - $accumDepr; //! Valor Neto


                    $htmlTbody .= '  
                    <tr class="afr-tr-e">
                        <td class="afr-tc">'. $cont .'</td>
                        <td class="afr-tc">'. $fixedAsset["cantidad"] .'</td>
                        <td class="afr-ts afr-w-350">'. $fixedAsset["nombre"] .": ". $fixedAsset["detalle"] .'</td>
                        <td class="afr-tc">'. ( $isRevaluation ? "" : $usefulLife ) .'</td>
                        <td class="afr-tc">'. $usefulLifeRevaluation .'</td>
                        <td>'. date('d-m-Y', strtotime($dateFA)) .'</td>
                        <td>'. ( $isRevaluation ? "" : number_format((float)round($incomeValue, 2), 2, '.', '') ) .'</td>
                        <td>'. ( $isRevaluation ? "" : number_format((float)round($salvageValue, 2), 2, '.', '') ) .'</td>
                        <td>'. number_format((float)round($revaluation, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                        <td>'. ( (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '') ) .'</td>
                    </tr>';
                    $partialPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                    $partialSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                    $partialRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                    $partialUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                    $partialUpdate += number_format((float)round($update, 2), 2, '.', '');
                    $partialUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                    $partialDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                    $partialAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                    $partialUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                    $partialAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                    $partialAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                    $partialNetWorth += number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');
                    
                    $totalPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                    $totalSalvage += $isRevaluation ? 0.00 : $salvageValue;
                    $totalRevaluation += $revaluation;
                    $totalUpdatedValueOld += $updatedValueOld;
                    $totalUpdate += $update;
                    $totalUpdatedValue += $updatedValue;
                    $totalDepreciation += $depreciation;
                    $totalAccumDeprOld += $accumDeprOld;
                    $totalUpdateAD += $updateAD;
                    $totalAccumDeprU += $accumDeprU;
                    $totalAccumDepr += $accumDepr;
                    $totalNetWorth += ($updatedValue - $accumDepr);
                } else {
                    break;
                }
            }
            $htmlTbody .= '</tbody>';

                // <thead> ... </thead>
            if ($cont != 0) {
                $htmlRowCategory = ' 
                <tr class="afr-tcategory">
                    <th class="afr-ts" colspan="3">'. $category["nombre"] .'</th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th >'. number_format((float)round($partialPrice, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialSalvage, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialRevaluation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValueOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdate, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValue, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialDepreciation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdateAD, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprU, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDepr, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialNetWorth, 2), 2, '.', '') .'</th>
                </tr>';
                $htmlCategorySector .= $htmlRowCategory.$htmlTbody;
            } else {
                $htmlCategorySector .= $htmlTbody;
            }
        }

        $htmlRowTotal = '
        <tr >
            <td class="afr-void" colspan="18"></td>
        </tr>
        <tr class="afr-tcategory">
            <th class="afr-ts" colspan="6"> TOTAL GENERAL Bs. </th>
            <th >'. number_format((float)round($totalPrice, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalSalvage, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalRevaluation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValueOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdate, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValue, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalDepreciation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdateAD, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprU, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDepr, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalNetWorth, 2), 2, '.', '') .'</th>
        </tr>';
            
        $tableHeader = '<div>
             <div>
                <h1>Cuadro de depreciación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>
                
            <table class="afr-table-dpr" >
                <thead>
                    <tr>
                        <th class="afr-tc" rowspan="2">N°</th>
                        <th class="afr-tc" rowspan="2">Cant.</th>
                        <th rowspan="2">Bien</th>
                        <th class="afr-tc" rowspan="2">Vida util Años</th>
                        <th class="afr-tc" rowspan="2">Vida util Revaluo</th>
                        <th rowspan="2">Fecha Incorporación</th>
                        <th rowspan="2">Valor Ingreso</th>
                        <th rowspan="2">Valor Baja / Salvamento</th>
                        <th rowspan="2">Valor Revaluo</th>
                        <th >Valor Actualiz.</th>
                        <th rowspan="2">Actualiz.</th>
                        <th rowspan="2">Valor Actualizado</th>
                        <th rowspan="2">Depreciación Gestión</th>
                        <th rowspan="2">Deprec. Acum.</th>
                        <th rowspan="2">Actualiz. Dep. Acum.</th>
                        <th rowspan="2">Dep. Acum. Actualiz.</th>
                        <th rowspan="2">Total Deprec.</th>
                        <th rowspan="2">Valor Neto</th>
                    </tr>
                    <tr>
                        <th >'. date('31/12/Y', strtotime('-1 year', strtotime($depreciationDate))) .'</th>
                    </tr>
                    <tr >
                        <td class="afr-void" colspan="18"></td>
                    </tr>
                </thead>
                '. $htmlCategorySector .'
                '. $htmlRowTotal .'
            </table>
            <br/>
        </div>';

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }
    
    public function ShowProductionUnits($data, $previousData = []){ 
        $categories = $data["dataCategory"]; // []
        $depreciationDate = $data["date"]; //! Fecha depreciación
        $fixedAssets = $data["data"]; // []

        $htmlCategorySector = "";
        $fa_array_position = 0;

        $totalPrice = 0;
        $totalSalvage = 0;
        $totalRevaluation = 0;
        $totalUpdatedValueOld = 0;
        $totalUpdate = 0;
        $totalUpdatedValue = 0;
        $totalDepreciation = 0;
        $totalAccumDeprOld = 0;
        $totalUpdateAD = 0;
        $totalAccumDeprU = 0;
        $totalAccumDepr = 0;
        $totalNetWorth = 0;

        // Categoria
        foreach ($categories as $keyC => $category) {

            $htmlTbody = '<tbody>';

            
            $partialPrice = 0;
            $partialSalvage = 0;
            $partialRevaluation = 0;
            $partialUpdatedValueOld = 0;
            $partialUpdate = 0;
            $partialUpdatedValue = 0;
            $partialDepreciation = 0;
            $partialAccumDeprOld = 0;
            $partialUpdateAD = 0;
            $partialAccumDeprU = 0;
            $partialAccumDepr = 0;
            $partialNetWorth = 0;
            $cont = 0;

            // Activo fijos
            for ($i=$fa_array_position; $i < sizeof($fixedAssets); $i++) { 
                $fixedAsset = $fixedAssets[$i];
                
                // Vefiricar si el activo pertenece a la categoria actual.
                if($fixedAsset["categorias_id"] ==  $category["id"]){
                    $fa_array_position ++;
                    $cont ++;

                    $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación

                    $dateRevFA = $fixedAsset["fecharevaluo"];
                    $isRevaluation = FALSE;
                    if ($dateRevFA && $fixedAsset["duracionrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($depreciationDate)) {
                        $dateFA = $dateRevFA;
                        $isRevaluation = TRUE;
                    }
                    $salvagePercentage = $fixedAsset["salvamento"] / 100;
                    
                    $prevData = $previousData[$fixedAsset["id"]];
                    
                    $factoryCapacity = $fixedAsset["duracion"]; //! Capacidad de fábrica
                    $capacityRevaluation = ($isRevaluation) ? $fixedAsset["duracionrevaluo"] : 0; //! Capacidad Revaluado
                    $newFactoryCapacity = $isRevaluation ? $capacityRevaluation : $factoryCapacity;
                    $usage = $prevData["usoperiodo"];
                    $acummUsage = $prevData["usoacumulado"];
                    $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                    $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                    $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo
                    $updatedValueOld = $prevData["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                    $update = $prevData["actualizacion"]; //! Actualiz.
                    // $updatedValue = $updatedValueOld + $update; //! Valor Actualizado

                    $updatedValue = idate("Y", strtotime($dateFA)) == idate("Y", strtotime($depreciationDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                    
                    $depreciation = $prevData["depreciacion"]; //! Depreciación Gesctión
                    $accumDeprOld = $prevData["depreciacionacumulada"]; //! Deprec. Acum.
                    $updateAD = $prevData["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                    $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                    $accumDepr = $accumDeprU + $depreciation; //! Total Depec.
                    $netWorth = $updatedValue - $accumDepr; //! Valor Neto
                      
                    $htmlTbody .= '  
                    <tr class="afr-tr-e">
                        <td class="afr-tc">'. $cont .'</td>
                        <td class="afr-tc">'. $fixedAsset["cantidad"] .'</td>
                        <td class="afr-ts afr-w-350">'. $fixedAsset["nombre"] .": ". $fixedAsset["detalle"] .'</td>

                        <td>'. date('d-m-Y', strtotime($dateFA)) .'</td>

                        <td class="afr-tc">'. ( $isRevaluation ? "" : $factoryCapacity ) .'</td>
                        <td class="afr-tc">'. $capacityRevaluation .'</td>
                        <td class="afr-tc">'. $usage .'</td>
                        <td class="afr-tc">'. ( $isRevaluation ? "" : $acummUsage ) .'</td>

                        <td>'. ( $isRevaluation ? "" : number_format((float)round($incomeValue, 2), 2, '.', '') ) .'</td>
                        <td>'. ( $isRevaluation ? "" : number_format((float)round($salvageValue, 2), 2, '.', '') ) .'</td>
                        <td>'. number_format((float)round($revaluation, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                        <td>'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                        <td>'. ( (float)round(($updatedValue - $accumDepr), 2) == 0 ? 1 : number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '') ) .'</td>
                    </tr>';
                    $partialPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                    $partialSalvage += $isRevaluation ? 0.00 : number_format((float)round($salvageValue, 2), 2, '.', '');
                    $partialRevaluation += number_format((float)round($revaluation, 2), 2, '.', '');
                    $partialUpdatedValueOld += number_format((float)round($updatedValueOld, 2), 2, '.', '');
                    $partialUpdate += number_format((float)round($update, 2), 2, '.', '');
                    $partialUpdatedValue += number_format((float)round($updatedValue, 2), 2, '.', '');
                    $partialDepreciation += number_format((float)round($depreciation, 2), 2, '.', '');
                    $partialAccumDeprOld += number_format((float)round($accumDeprOld, 2), 2, '.', '');
                    $partialUpdateAD += number_format((float)round($updateAD, 2), 2, '.', '');
                    $partialAccumDeprU += number_format((float)round($accumDeprU, 2), 2, '.', '');
                    $partialAccumDepr += number_format((float)round($accumDepr, 2), 2, '.', '');
                    $partialNetWorth += number_format((float)round(($updatedValue - $accumDepr), 2), 2, '.', '');
                    
                    $totalPrice += $isRevaluation ? 0.00 : floatval($incomeValue);
                    $totalSalvage += $isRevaluation ? 0.00 : $salvageValue;
                    $totalRevaluation += $revaluation;
                    $totalUpdatedValueOld += $updatedValueOld;
                    $totalUpdate += $update;
                    $totalUpdatedValue += $updatedValue;
                    $totalDepreciation += $depreciation;
                    $totalAccumDeprOld += $accumDeprOld;
                    $totalUpdateAD += $updateAD;
                    $totalAccumDeprU += $accumDeprU;
                    $totalAccumDepr += $accumDepr;
                    $totalNetWorth += ($updatedValue - $accumDepr);
                } else {
                    break;
                }
            }
            $htmlTbody .= '</tbody>';
                // <thead> ... </thead>
            if ($cont != 0) {
                $htmlRowCategory = ' 
                <tr class="afr-tcategory">
                    <th class="afr-ts" colspan="3">'. $category["nombre"] .'</th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th ></th>
                    <th >'. number_format((float)round($partialPrice, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialSalvage, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialRevaluation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValueOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdate, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdatedValue, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialDepreciation, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprOld, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialUpdateAD, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDeprU, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialAccumDepr, 2), 2, '.', '') .'</th>
                    <th >'. number_format((float)round($partialNetWorth, 2), 2, '.', '') .'</th>
                </tr>';
                $htmlCategorySector .= $htmlRowCategory.$htmlTbody;
            } else {
                $htmlCategorySector .= $htmlTbody;
            }
        }

        $htmlRowTotal = '
        <tr >
            <td class="afr-void" colspan="20"></td>
        </tr>
        <tr class="afr-tcategory">
            <th class="afr-ts" colspan="8"> TOTAL GENERAL Bs. </th>
            <th >'. number_format((float)round($totalPrice, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalSalvage, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalRevaluation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValueOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdate, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdatedValue, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalDepreciation, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprOld, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalUpdateAD, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDeprU, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalAccumDepr, 2), 2, '.', '') .'</th>
            <th >'. number_format((float)round($totalNetWorth, 2), 2, '.', '') .'</th>
        </tr>';
            
        $tableHeader = '<div>
            <div>
                <h1>Cuadro de depreciación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>
                
            <table class="afr-table-dpr" >
                <thead>
                    <tr>
                        <th class="afr-tc" rowspan="2">N°</th>
                        <th class="afr-tc" rowspan="2">Cant.</th>
                        <th rowspan="2">Bien</th>

                        <th rowspan="2">Fecha Incorporación</th>

                        <th rowspan="2">Capacidad de fábrica</th>
                        <th rowspan="2">Capacidad Revaluado</th>
                        <th rowspan="2">Capacidad Usado periosdo</th>
                        <th rowspan="2">Capacidad Usado Acumulado</th>

                        <th rowspan="2">Valor Ingreso</th>
                        <th rowspan="2">Valor Baja / Salvamento</th>
                        <th rowspan="2">Valor Revaluo</th>
                        <th >Valor Actualiz.</th>
                        <th rowspan="2">Actualiz.</th>
                        <th rowspan="2">Valor Actualizado</th>
                        <th rowspan="2">Depreciación Gestión</th>
                        <th rowspan="2">Deprec. Acum.</th>
                        <th rowspan="2">Actualiz. Dep. Acum.</th>
                        <th rowspan="2">Dep. Acum. Actualiz.</th>
                        <th rowspan="2">Total Deprec.</th>
                        <th rowspan="2">Valor Neto</th>
                    </tr>
                    <tr>
                        <th >'. date('31/12/Y', strtotime('-1 year', strtotime($depreciationDate))) .'</th>
                    </tr>
                    <tr >
                        <td class="afr-void" colspan="20"></td>
                    </tr>
                </thead>
                '. $htmlCategorySector .'
                '. $htmlRowTotal .'
            </table>
            <br/>
        </div>';

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }

    public function StraightLineFA($data, $previousData = [], $salePrice = null){ 

        // echo '<pre>'.print_r($data, true).'</pre>\n';
        // echo '<pre>'.print_r($previousData, true).'</pre>\n';
        // return;

        $category = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAsset = $data["data"]; // []

        $tbodyDepreciation = "";
        $lastNetWorth = 0.00;
        if ($previousData) {
            $prevDate = "";     
            $updatedValueOld = 0.00;
            $update = 0.00;
            $updatedValue = 0.00;
            $depreciation = 0.00;
            $accumDeprOld = 0.00;
            $updateAD = 0.00;
            $accumDeprU = 0.00;
            $accumDepr = 0.00;
            $netWorth = 0.00;

            
            foreach ($previousData as $key => $value) {
                $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación
                $dateDepreciation = $value["fechadepreciacion"]; //! Fecha depreciación
    
                $dateRevFA = $fixedAsset["fecharevaluo"];
                $isRevaluation = FALSE;
                if ($dateRevFA && $fixedAsset["vidautilrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($dateDepreciation)) {
                    $dateFA = $dateRevFA;
                    $isRevaluation = TRUE;
                }
                $yearFA = idate('Y', strtotime($dateFA));
                $salvagePercentage = $fixedAsset["salvamento"] / 100;
                $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo


                $prevDate = $value["fechadepreciacion"];
                $updatedValueOld = $value["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                $update = $value["actualizacion"]; //! Actualiz.
                // $updatedValue =  $updatedValueOld + $update; //! Valor Actualizado
                $updatedValue = $yearFA == idate("Y", strtotime($prevDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                $depreciation = $value["depreciacion"]; //! Depreciación Gesctión
                $accumDeprOld = $value["depreciacionacumulada"]; //! Deprec. Acum.
                $updateAD = $value["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                $accumDepr = $accumDeprU + $depreciation; //! Total Depec.
                $netWorth = $updatedValue - $accumDepr; //! Valor Neto

                $tbodyDepreciation .= '<tr class="afr-tr-e">
                    <td class="afr-tc">'.$ufvValues[$prevDate] .'</td>
                    <td class="afr-tc">'. $prevDate .'</td>
                    <td class="afr-tc">'. "Depreción ejercicio" .'</td>
                    <td >'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($netWorth, 2), 2, '.', '') .'</td>
                </tr>';
                $lastNetWorth = $netWorth;
            }
        }

        $baja = !empty($salePrice) ? $salePrice : 0;
        $perdidaGanancia = $baja > $lastNetWorth ? "Ganancia" : "Pérdida";
        $htmlRowTotal = '
            <tr class="afr-tr-e">
                <td colspan="11"> Valor venta o baja: </td>
                <td >'. number_format((float)round($baja, 2), 2, '.', '') .'</td>
            </tr>
            <tr class="afr-tr-e">
                <td colspan="11"> Ganancia / Pérdida en venta de Activos Fijos: </td>
                <td >'. number_format((float)round(($lastNetWorth - $baja), 2), 2, '.', '') .'</td>
            </tr>';
            
        $tableHeader = '<div>
            <div>
                <h1>Estado de situación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>

            <div class="afr-info">
                <div class="afr-info-left">
                    <div><span>Código:</span> '. $fixedAsset["codigo"] .'</div>
                    <div><span>Categoría:</span> '. $category["nombre"] .'</div>
                    <div><span>Tipo:</span> '. $fixedAsset["nombretipobien"] .'</div>
                    <div><span>Nombre:</span> '. $fixedAsset["nombre"] .'</div>
                    <div><span>Vida Util:</span> '. $category["vidautil"] .'</div>
                </div>
                <div class="afr-info-right">
                    <div><span>Valor compra Bs:</span> '. $fixedAsset["precio"] .'</div>
                    <div><span>Fecha ingreso:</span> '. $fixedAsset["fechacompra"] .'</div>
                    <div><span>UFV compra:</span> '. $ufvValues[$fixedAsset["fechacompra"]] .'</div>
                    <div><span>Fecha Venta/Baja:</span> '. $fixedAsset["eliminado_en"] .'</div>
                    <div><span>UFV venta:</span> '. (false ? $ufvValues[ date("Y-m-d", strtotime($fixedAsset["fechacompra"]))] : "") .'</div>
                </div>
            </div>
            <br/>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th> t/c - UFV. </th>
                        <th> Fecha </th>
                        <th> Concepto </th>
                        <th> Valor actualizado - </th>
                        <th> Actualización </th>
                        <th> Valor actualizado </th>
                        <th> Depreciacion gestión </th>
                        <th> Deprec. Acum. </th>
                        <th> Actualización Depreciación Acumulada</th>
                        <th> Depre. Acumulada Actualizada </th>
                        <th> Total Deprec. </th>
                        <th> Valor Neto </th>
                    </tr>
                </thead>
                <tbody class="aft-vat">'.
                    $tbodyDepreciation .
                    $htmlRowTotal
                .'</tbody>
            </table>
            <p><b> Situación: </b> '. $perdidaGanancia .' </p>
            <br/>
        </div>';

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }

    public function SumOfDigitsFA($data, $previousData = [], $salePrice = null){ 
        // echo '<pre>'.print_r($data, true).'</pre>\n';
        // echo '<pre>'.print_r($previousData, true).'</pre>\n';
        // return;

        $category = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAsset = $data["data"]; // []

        $tbodyDepreciation = "";
        $lastNetWorth = 0.00;
        if ($previousData) {
            $prevDate = "";     
            $updatedValueOld = 0.00;
            $update = 0.00;
            $updatedValue = 0.00;
            $depreciation = 0.00;
            $accumDeprOld = 0.00;
            $updateAD = 0.00;
            $accumDeprU = 0.00;
            $accumDepr = 0.00;
            $netWorth = 0.00;

            
            foreach ($previousData as $key => $value) {
                $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación
                $dateDepreciation = $value["fechadepreciacion"]; //! Fecha depreciación
    
                $dateRevFA = $fixedAsset["fecharevaluo"];
                $isRevaluation = FALSE;
                if ($dateRevFA && $fixedAsset["vidautilrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($dateDepreciation)) {
                    $dateFA = $dateRevFA;
                    $isRevaluation = TRUE;
                }
                $yearFA = idate('Y', strtotime($dateFA));
                $salvagePercentage = $fixedAsset["salvamento"] / 100;
                $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo


                $prevDate = $value["fechadepreciacion"];
                $updatedValueOld = $value["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                $update = $value["actualizacion"]; //! Actualiz.
                // $updatedValue =  $updatedValueOld + $update; //! Valor Actualizado
                $updatedValue = $yearFA == idate("Y", strtotime($prevDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                $depreciation = $value["depreciacion"]; //! Depreciación Gesctión
                $accumDeprOld = $value["depreciacionacumulada"]; //! Deprec. Acum.
                $updateAD = $value["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                $accumDepr = $accumDeprU + $depreciation; //! Total Depec.
                $netWorth = $updatedValue - $accumDepr; //! Valor Neto

                $tbodyDepreciation .= '<tr class="afr-tr-e">
                    <td class="afr-tc">'.$ufvValues[$prevDate] .'</td>
                    <td class="afr-tc">'. $prevDate .'</td>
                    <td class="afr-tc">'. "Depreción ejercicio" .'</td>
                    <td >'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($netWorth, 2), 2, '.', '') .'</td>
                </tr>';
                $lastNetWorth = $netWorth;
            }
        }

        $baja = !empty($salePrice) ? $salePrice : 0;
        $perdidaGanancia = $baja > $lastNetWorth ? "Ganancia" : "Pérdida";
        $htmlRowTotal = '
            <tr class="afr-tr-e">
                <td colspan="11"> Valor venta o baja: </td>
                <td >'. number_format((float)round($baja, 2), 2, '.', '') .'</td>
            </tr>
            <tr class="afr-tr-e">
                <td colspan="11"> Ganancia / Pérdida en venta de Activos Fijos: </td>
                <td >'. number_format((float)round(($lastNetWorth - $baja), 2), 2, '.', '') .'</td>
            </tr>';
            
        $tableHeader = '<div>
            <div>
                <h1>Estado de situación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>

            <div class="afr-info">
                <div class="afr-info-left">
                    <div><span>Código:</span> '. $fixedAsset["codigo"] .'</div>
                    <div><span>Categoría:</span> '. $category["nombre"] .'</div>
                    <div><span>Tipo:</span> '. $fixedAsset["nombretipobien"] .'</div>
                    <div><span>Nombre:</span> '. $fixedAsset["nombre"] .'</div>
                    <div><span>Vida Util:</span> '. $category["vidautil"] .'</div>
                </div>
                <div class="afr-info-right">
                    <div><span>Valor compra Bs:</span> '. $fixedAsset["precio"] .'</div>
                    <div><span>Fecha ingreso:</span> '. $fixedAsset["fechacompra"] .'</div>
                    <div><span>UFV compra:</span> '. $ufvValues[$fixedAsset["fechacompra"]] .'</div>
                    <div><span>Fecha Venta/Baja:</span> '. $fixedAsset["eliminado_en"] .'</div>
                    <div><span>UFV venta:</span> '. $ufvValues[ date("Y-m-d", strtotime($fixedAsset["fechacompra"]))] .'</div>
                </div>
            </div>
            <br/>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th> t/c - UFV. </th>
                        <th> Fecha </th>
                        <th> Concepto </th>
                        <th> Valor actualizado - </th>
                        <th> Actualización </th>
                        <th> Valor actualizado </th>
                        <th> Depreciacion gestión </th>
                        <th> Deprec. Acum. </th>
                        <th> Actualización Depreciación Acumulada</th>
                        <th> Depre. Acumulada Actualizada </th>
                        <th> Total Deprec. </th>
                        <th> Valor Neto </th>
                    </tr>
                </thead>
                <tbody class="aft-vat">'.
                 $tbodyDepreciation .
                 $htmlRowTotal
                .'</tbody>
            </table>
            <p><b> Situación: </b> '. $perdidaGanancia .' </p>
            <br/>
        </div>';

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }

    public function ProductionUnitsFA($data, $previousData = [], $salePrice = null){ 
        // echo '<pre>'.print_r($data, true).'</pre>\n';
        // echo '<pre>'.print_r($previousData, true).'</pre>\n';
        // return;

        $category = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAsset = $data["data"]; // []

        $tbodyDepreciation = "";
        $lastNetWorth = 0.00;
        if ($previousData) {
            $prevDate = ""; 
            $usage = 0.00;
            $acummUsage = 0.00;
            $updatedValueOld = 0.00;
            $update = 0.00;
            $updatedValue = 0.00;
            $depreciation = 0.00;
            $accumDeprOld = 0.00;
            $updateAD = 0.00;
            $accumDeprU = 0.00;
            $accumDepr = 0.00;
            $netWorth = 0.00;
            
            foreach ($previousData as $key => $value) {
                $dateFA = $fixedAsset["fechacompra"]; //! Fecha incorporación
                $dateDepreciation = $value["fechadepreciacion"]; //! Fecha depreciación
    
                $dateRevFA = $fixedAsset["fecharevaluo"];
                $isRevaluation = FALSE;
                if ($dateRevFA && $fixedAsset["duracionrevaluo"] && $fixedAsset["valorrevaluo"]  && strtotime($dateRevFA) <= strtotime($dateDepreciation)) {
                    $dateFA = $dateRevFA;
                    $isRevaluation = TRUE;
                }
                $yearFA = idate('Y', strtotime($dateFA));
                $salvagePercentage = $fixedAsset["salvamento"] / 100;
                $incomeValue = $fixedAsset["precio"]; //! Valor Ingreso
                $salvageValue = $incomeValue * $salvagePercentage; //! Valor de salvamento
                $revaluation = ($isRevaluation) ? $fixedAsset["valorrevaluo"] : 0.00; //! Valor revaluo


                $prevDate = $value["fechadepreciacion"];
                $usage = $value["usoperiodo"];
                $acummUsage = $value["usoacumulado"];
                $updatedValueOld = $value["valoractualizadoanterior"]; //! Valor Actuali. / 31-12-0000
                $update = $value["actualizacion"]; //! Actualiz.
                // $updatedValue =  $updatedValueOld + $update; //! Valor Actualizado
                $updatedValue = $yearFA == idate("Y", strtotime($prevDate)) && $updatedValueOld == 0 ? ($isRevaluation ? $revaluation + $update : ($incomeValue - $salvageValue) + $update) : $updatedValueOld + $update; //! Valor Actualizado
                $depreciation = $value["depreciacion"]; //! Depreciación Gesctión
                $accumDeprOld = $value["depreciacionacumulada"]; //! Deprec. Acum.
                $updateAD = $value["actdeprcacumulada"]; //! Actualiz. Dep. Acum.
                $accumDeprU = $accumDeprOld + $updateAD; //! Dep. Acum. Actualiz.
                $accumDepr = $accumDeprU + $depreciation; //! Total Depec.
                $netWorth = $updatedValue - $accumDepr; //! Valor Neto

                $tbodyDepreciation .= '<tr class="afr-tr-e">
                    <td class="afr-tc">'.$ufvValues[$prevDate] .'</td>
                    <td class="afr-tc">'. $prevDate .'</td>
                    <td class="afr-tc">'. "Depreción ejercicio" .'</td>
                    <td class="afr-tc">'. $fixedAsset["duracion"] .'</td>
                    <td class="afr-tc">'. $usage .'</td>
                    <td class="afr-tc">'. $acummUsage .'</td>
                    <td >'. number_format((float)round($updatedValueOld, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($update, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($updatedValue, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($depreciation, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDeprOld, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($updateAD, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDeprU, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($accumDepr, 2), 2, '.', '') .'</td>
                    <td >'. number_format((float)round($netWorth, 2), 2, '.', '') .'</td>
                </tr>';
                $lastNetWorth = $netWorth;
            }
        }

        $baja = !empty($salePrice) ? $salePrice : 0;
        $perdidaGanancia = $baja > $lastNetWorth ? "Ganancia" : "Pérdida";
        $htmlRowTotal = '
            <tr class="afr-tr-e">
                <td colspan="14"> Valor venta o baja: </td>
                <td >'. number_format((float)round($baja, 2), 2, '.', '') .'</td>
            </tr>
            <tr class="afr-tr-e">
                <td colspan="14"> Ganancia / Pérdida en venta de Activos Fijos: </td>
                <td >'. number_format((float)round(($lastNetWorth - $baja), 2), 2, '.', '') .'</td>
            </tr>';
            
        $tableHeader = '<div>
            <div>
                <h1>Estado de situación de Activo Fijo</h1>
            </div>
            <div class="afr-filters-t afr-header afr-color-gray">
                <div> Practicado al '. $this->dateToLetter($depreciationDate) .'</div>
                <div> (Expresado en Bolivianos) </div>
            </div>

            <div class="afr-info">
                <div class="afr-info-left">
                    <div><span>Código:</span> '. $fixedAsset["codigo"] .'</div>
                    <div><span>Categoría:</span> '. $category["nombre"] .'</div>
                    <div><span>Tipo:</span> '. $fixedAsset["nombretipobien"] .'</div>
                    <div><span>Nombre:</span> '. $fixedAsset["nombre"] .'</div>
                    <div><span>Vida Util:</span> '. $category["vidautil"] .'</div>
                </div>
                <div class="afr-info-right">
                    <div><span>Valor compra Bs:</span> '. $fixedAsset["precio"] .'</div>
                    <div><span>Fecha ingreso:</span> '. $fixedAsset["fechacompra"] .'</div>
                    <div><span>UFV compra:</span> '. $ufvValues[$fixedAsset["fechacompra"]] .'</div>
                    <div><span>Fecha Venta/Baja:</span> '. $fixedAsset["eliminado_en"] .'</div>
                    <div><span>UFV venta:</span> '. $ufvValues[ date("Y-m-d", strtotime($fixedAsset["fechacompra"]))] .'</div>
                </div>
            </div>
            <br/>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th> t/c - UFV. </th>
                        <th> Fecha </th>
                        <th> Concepto </th>
                        <th> Capacidad de fábrica </th>
                        <th> Uso periodo </th>
                        <th> Uso Acumulado </th>
                        <th> Valor actualizado - </th>
                        <th> Actualización </th>
                        <th> Valor actualizado </th>
                        <th> Depreciacion gestión </th>
                        <th> Deprec. Acum. </th>
                        <th> Actualización Depreciación Acumulada</th>
                        <th> Depre. Acumulada Actualizada </th>
                        <th> Total Deprec. </th>
                        <th> Valor Neto </th>
                    </tr>
                </thead>
                <tbody class="aft-vat">'.
                 $tbodyDepreciation .
                 $htmlRowTotal
                .'</tbody>
            </table>
            <p><b> Situación: </b> '. $perdidaGanancia .' </p>
            <br/>
        </div>';

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }
}

?>