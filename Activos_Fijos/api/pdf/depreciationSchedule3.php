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

    function diffMonths($fechaA, $fechaB, $agregar = TRUE) {
        $fA = new DateTime($fechaA);
        $fB = new DateTime($fechaB);
    
        $diferencia = $fA->diff($fB);
        $mesesTotales = $agregar ? ($diferencia->y * 12) + $diferencia->m + 1 : ($diferencia->y * 12) + $diferencia->m;
    
        if ($fA > $fB) {
            $mesesTotales *= -1;
        }
    
        return $mesesTotales;
    }

    function substractDate($fecha, $meses = 0, $anios = 0) {
        $fechaDateTime = new DateTime($fecha);
        if ($meses != 0) {
            $fechaDateTime->modify("-$meses month");
        }
        if ($anios != 0) {
            $fechaDateTime->modify("-$anios year");
        }
        return $fechaDateTime->format("Y-m-t");
    }

    function addDate($fecha, $dias = 0, $meses = 0, $anios = 0) {
        $fechaDateTime = new DateTime($fecha);
        if ($dias != 0) {
            $fechaDateTime->modify("+$dias day");
        }
        if ($meses != 0) {
            $fechaDateTime->modify("+$meses month");
        }
        if ($anios != 0) {
            $fechaDateTime->modify("+$anios year");
        }
        return $fechaDateTime->format("Y-m-t");
    }

    public function StraightLine($data, $previousData = [], $mix = NULL){ 
        $categories = $data["dataCategory"]; // []
        $depreciationDate = $data["date"];
        $ufvValues = $data["dataUfv"]; // []
        $fixedAssets = $data["data"]; // []

        // $a = $this->diffMonths("2020-07-01", "2020-06-01");
        // $b = $this->diffMonths("2020-06-30", "2021-06-30");
        // $c = $this->addDate("2020-12-31", 1);
        // echo '| '.print_r($a, true).' |';
        // echo '| '.print_r($b, true).' |';
        // echo '| '.print_r($c, true).' |';
        $enterpriseDate = empty($this->datosEmpresa->fecha_dpr) ? "2000-12-31" : $this->datosEmpresa->fecha_dpr;
        // $enterpriseDate = "2000-12-31";
        $fiscalPeriod = date("m-d", strtotime($enterpriseDate));
        // echo '| '.print_r($fiscalPeriod, true).' |';

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
                    $initialDateFA = $dateFA;
                    
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

                    $existUsefulLife = TRUE;
                    if ($newUsefulLife === 0 || $newUsefulLife === NULL || $newUsefulLife === "0") {
                        $existUsefulLife = FALSE;
                    }

                    $newDateFA = $dateFA;
                    $newYearFA = $yearFA;
                    $newMonthFA = $monthFA;
                    $isPrevious = FALSE;
                    
                    $oldYear = NULL;
                    $oldMonth = NULL;

                    // Verificar si el activo fijo ya fue depreciado en gestiones anteriores, y si la depreciación perteneece a al activo si esta revalorizado.
                    if ($previousData && array_key_exists($fixedAsset["id"], $previousData) 
                        && ($isRevaluation === FALSE || ($isRevaluation && strtotime($previousData[$fixedAsset["id"]]["fechadepreciacion"]) >= strtotime($dateFA)))
                        && strtotime($previousData[$fixedAsset["id"]]["fechadepreciacion"]) < strtotime($dateDepreciation)
                    ) {
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

                        if (!$existUsefulLife) {
                            $depreciation = 0; //! Depreciación Gesctión
                            $accumDeprOld = 0.00; //! Deprec. Acum.
                            $updateAD = 0.00; //! Actualiz. Dep. Acum.
                            $accumDeprU = 0.00; //! Dep. Acum. Actualiz.
                            $accumDepr = 0.00; //! Total Depec.
                        }
                        $netWorth = $updatedValue - $accumDepr; //! Valor Neto
                        $ufvFA_initialDate = $ufvValues[$prevDate];
                        $initialDateFA = $prevDate;

                        // $newYearFA = idate('m', strtotime($prevDate)) == 12 && idate('d', strtotime($prevDate)) == 31 ?  idate('Y', strtotime($prevDate)) + 1 : idate('Y', strtotime($prevDate));
                        $test_year = idate('Y', strtotime($this->addDate($prevDate, 1)));
                        $newYearFA = $fiscalPeriod === "12-31" ? $test_year : idate('Y', strtotime($prevDate));
                        $newMonthFA = idate('m', strtotime($prevDate));
                        $newDateFA = $prevDate;
                        $isPrevious = TRUE;
                        $dateOldDepreciation = $prevDate;
                        $oldYear = idate('Y', strtotime($prevDate));
                        $oldMonth = idate('m', strtotime($prevDate));
                    }

                    

                    // Se obtiene el año fiscal para la fech de compra del activo fijo.
                    $minYear = $yearFA < $yearDepreciation ? $yearFA : $yearDepreciation; // TODO: verificar si es correcto
                    $test_fiscal_date = $minYear ."-". $fiscalPeriod;
                    $year_fiscal_p = $this->diffMonths($dateFA, $test_fiscal_date) > 0 ? $minYear : $minYear + 1;
                    $fiscalDate = $year_fiscal_p ."-". $fiscalPeriod;
                    $month_fa_f= $this->diffMonths($dateFA, $fiscalDate);

                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es menor al de la depreciación.
                     * Esto para calcular los datos de la depreciación desde gestiones anteriores a la depreciación de la gestion actual.
                     */
                    echo '| '.print_r($fiscalDate ." : ". $dateDepreciation, true).' |';
                    $month_fis_dep = $this->diffMonths($fiscalDate, $dateDepreciation, false);
                    if ($dateFA < $dateDepreciation && $month_fis_dep > 0) {
                        echo '| '.print_r(" :: Multiple ", true).' |';

                        // Iteración donde se calculara el valor actualizaddo desde gestiones anteriores hasta la gestion actual.
                        for ($y = $newYearFA; $y <= $yearDepreciation; $y++) { 

                            $accumDeprOld = $accumDepr;
                            $updatedValueOld = $updatedValue;
                            $netWorth = $updatedValue - $accumDepr;

                            $fiscalDateY = $y ."-". $fiscalPeriod;
                            echo '| '.print_r(": fecha = ". $fiscalDateY, true).' |';
                            
                            // if ((($yearFA + $newUsefulLife) == $y && $monthFA >= 2) 
                            //     && strtotime(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1"))) <= strtotime(date("Y-m-d", strtotime($dateDepreciation)))
                            //     && strtotime(date("Y-m-d", strtotime($dateOldDepreciation))) < strtotime(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1")))
                            //     && !$notUsefulLife
                            // ) 

                            // Calcula la depreciación cuando ya venció la vida util, y continuar si la fecha de depreciación es mayor al vencimiento de vida útil.
                            $finishDateFA = $this->substractDate(($y ."-". ($monthFA) ."-1"), 1);
                            $boolOD = ($dateOldDepreciation ? ( (strtotime($dateOldDepreciation) < strtotime($finishDateFA)) ? TRUE : FALSE) : TRUE);
                            $monthDiffFor = $this->diffMonths(date("Y-m-t", strtotime($y ."-". ($monthFA - 1) ."-1")), $dateDepreciation);
                            echo '| '.print_r(($yearFA + $newUsefulLife) ." - ". $finishDateFA ." - ". $monthDiffFor ." - ". date("Y-m-t", strtotime($y ."-". ($monthFA) ."-1")) , true).' |';
                            if ( ($yearFA + $newUsefulLife) == $y
                                && strtotime($finishDateFA) <= strtotime($dateDepreciation)
                                && strtotime($finishDateFA) <= strtotime($fiscalDateY)
                                && $boolOD
                                && $monthDiffFor <= 12 && $monthDiffFor >= 0
                                && $existUsefulLife
                            )
                            {
                                echo '| '.print_r(" :: Depreciar ", true).' |';

                                $ufvDC = $ufvValues[$finishDateFA];
                                // * $ufvFA_initialDate esta cambiado al periodo fiscal según $fiscalPeriod (ej: 12-31, 06-30) de la gestion anterior
                                // * o la fecha de compra del activo si pertenece a la misma gestion.
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; 
                                $update = $updatedValueOld * $updateCoefficient;
                                
                                $updatedValue = $updatedValueOld + $update;
                                
                                // $realMonthL = ($oldYear && $oldYear == $yearDepreciation && $oldMonth <= $monthDepreciation) ? ($monthFA - 1) - $oldMonth : ($monthFA - 1); // Obtiene el mes real entre depreciaciones
                                $realM2 = $dateOldDepreciation ? $this->diffMonths($dateOldDepreciation, $finishDateFA) : 0;
                                $realMonthL = ($dateOldDepreciation && $realM2 > 0 ) ? $realM2 : $this->diffMonths($initialDateFA, $finishDateFA);
                                echo '| '.print_r($finishDateFA ." - ". $realMonthL ." - ". $realM2, true).' |';
                                $realM = $this->diffMonths($dateFA, $finishDateFA);
                                // $realMonthL = ($dateOldDepreciation && $this->diffMonths($dateOldDepreciation, $dateDepreciation) > 0) 
                                $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $realMonthL : $updatedValue / $usefulLifeRevaluation / 12 * $realMonthL; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                
                                $updateAD = $accumDeprOld * $updateCoefficient;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;

                                echo '| '.print_r($updatedValue ." : ". $accumDepr, true).' |';
                                echo '| '.print_r(" :: Ant = ". ($updatedValue - $accumDepr), true).' |';
                                
                                if (date('Y-m-t', strtotime($y ."-". ($monthFA -1) ."-1")) == $depreciationDate) {
                                    break;
                                } else {
                                    $accumDeprOld = $accumDepr;
                                    $updatedValueOld = $updatedValue;
                                    $netWorth = $updatedValue - $accumDepr;
                                }
                            }

                            // Si el valor neto es 0 ya no se deprecia ni acutaliza.
                            if (($yearFA + $newUsefulLife) <= $y && (float)round($netWorth, 2) == 0 && $existUsefulLife) {
                                echo '| '.print_r(" :: Mantener 0 ", true).' |';

                                $update = 0.00;
                                $updatedValue = $updatedValueOld + $update;
                                $depreciation = 0.00;
                                $updateAD = 0.00;
                                $accumDeprU = $accumDeprOld + $updateAD;
                                $accumDepr = $accumDeprU + $depreciation;

                                echo '| '.print_r($updatedValue ." : ". $accumDepr, true).' |';
                                echo '| '.print_r(" :: Ant = ". ($updatedValue - $accumDepr), true).' |';
                                continue;
                            }

                            // Si corresponde año de la depreciación requerida se realiza los ultimos cálculos.
                            echo '| '.print_r("-> ".$this->diffMonths($initialDateFA, $fiscalDateY) . " - ". $initialDateFA ." - ". $fiscalDateY, true).' |';
                            if ($y == $yearDepreciation) {
                                echo '| '.print_r(" :: Final ", true).' |';
                                echo '| '.print_r($this->diffMonths($fiscalDateY, $dateDepreciation), true).' |';
                                if ($this->diffMonths($fiscalDateY, $dateDepreciation, false) > 0){
                                    echo '| '.print_r(" :: Doble", true).' |';
                                    $ufvDC = $ufvValues[date($y.'-'.$fiscalPeriod)];
                                    $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;

                                    /**
                                     * Verifica si el activo fijo se creo en la gestion actual de la iteración, para calcular los datos dede la 
                                     * fecha de compra del activo o de toda la gestion
                                     * */ 
                                    if($this->diffMonths($newDateFA, $fiscalDateY) > 0 && $this->diffMonths($newDateFA, $fiscalDateY) <= 12) { // TODO: maybe
                                        echo '| '.print_r(" :: D-Igual ", true).' |';
                                        echo '| '.print_r($this->diffMonths($newDateFA, $fiscalDateY), true).' |';
                                        
                                        $realM1 = $this->diffMonths($initialDateFA, $fiscalDateY);
                                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                                        if ($existUsefulLife) {
                                            $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * ($realM1) :  $updatedValue / $usefulLifeRevaluation / 12 * ($realM1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo
                                        }
                                    // Calcula los datos de gestiones anterioes a la gestión actual de la iteración.
                                    } else {
                                        echo '| '.print_r(" :: A-Diferente ", true).' |';

                                        $update = $updatedValueOld * $updateCoefficient;
                                        $updatedValue = $updatedValueOld + $update;
                                        if ($existUsefulLife) {
                                            $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * 12 : $updatedValue / $usefulLifeRevaluation / 12 * 12; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                        }
                                    }
                                    
                                    if ($existUsefulLife) {
                                        $updateAD = $accumDeprOld * $updateCoefficient;
                                        $accumDeprU = $accumDeprOld + $updateAD;
                                        $accumDepr = $accumDeprU + $depreciation;
                                    }

                                    $ufvFA_initialDate = $ufvDC; //* Se cambia el valor de la ufv al 31-12 de la gestion de la iteración.
                                    $initialDateFA = $fiscalDateY;

                                    echo '| '.print_r($updatedValue ." : ". $accumDepr, true).' |';
                                    echo '| '.print_r(" :: Ant = ". ($updatedValue - $accumDepr), true).' |';

                                    $accumDeprOld = $accumDepr;
                                    $updatedValueOld = $updatedValue;
                                    $netWorth = $updatedValue - $accumDepr;
                                    
                                    //-------------------------------------- 
                                    // $ufvDC = $ufvValues[$dateDepreciation];
                                    // $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                    // $update = $updatedValueOld * $updateCoefficient;

                                    // $updatedValue = $updatedValueOld + $update;

                                    // if ($existUsefulLife) {
                                    //     echo '| '.print_r($initialDateFA ." - ". $fiscalDateY, true).' |';
                                    //     $testRM = $dateOldDepreciation ? $this->diffMonths($dateOldDepreciation, $dateDepreciation, false) : -1;
                                    //     $realMonth = $testRM >= 0 && $testRM < 12 ? $testRM : $this->diffMonths($initialDateFA, $dateDepreciation, false);
                                    //     $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $realMonth : $updatedValue / $usefulLifeRevaluation / 12 * $realMonth; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion

                                    //     $updateAD = $accumDeprOld * $updateCoefficient;
                                    //     $accumDeprU = $accumDeprOld + $updateAD;
                                    //     $accumDepr = $accumDeprU + $depreciation;
                                    // }
                                    // break;
                                }
                                // echo '| '.print_r(" :: Simple ", true).' |';
                                
                                $ufvDC = $ufvValues[$dateDepreciation];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1; // * $ufvFA_initialDate esta cambiado al 31-12 de la gestion anterior.
                                $update = $updatedValueOld * $updateCoefficient;

                                $updatedValue = $updatedValueOld + $update;

                                if ($existUsefulLife) {
                                    // $realMonth = ($oldYear && $oldYear == $yearDepreciation && $oldMonth <= $monthDepreciation) ? $monthDepreciation - $oldMonth : $monthDepreciation; // Obtiene el mes real entre depreciaciones

                                    $testRM = $dateOldDepreciation ? $this->diffMonths($dateOldDepreciation, $dateDepreciation, false) : -1;
                                    $realMonth = $testRM >= 0 && $testRM < 12 ? $testRM : $this->diffMonths($initialDateFA, $dateDepreciation, false);
                                    // echo '| '.print_r($initialDateFA ." - ". $realMonth ." - ". $testRM, true).' |';
                                    // echo '| '.print_r($this->diffMonths($initialDateFA, $dateDepreciation, false), true).' |';
                                    $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $realMonth : $updatedValue / $usefulLifeRevaluation / 12 * $realMonth; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion

                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;

                                    // echo '| '.print_r($updatedValue ." : ". $accumDepr, true).' |';
                                    // echo '| '.print_r(" :: Ant = ". ($updatedValue - $accumDepr), true).' |';
                                }
                                break;
                                
                            // calculos para gestiones anterioes a la depreciación requerida.
                            } else if ($this->diffMonths($initialDateFA, $fiscalDateY) > 0 && $initialDateFA < $fiscalDateY) { // TODO: verificar diffMonths
                                // echo '| '.print_r(" :: Anteriores ", true).' |';
                                // echo '| '.print_r($initialDateFA ." - ". $fiscalDateY, true).' |';
                                // echo '| '.print_r($this->diffMonths($initialDateFA, $fiscalDateY), true).' |';

                                // echo '| '.print_r($fixedAsset["nombre"].": primero", true).' |';
                                $ufvDC = $ufvValues[date($y.'-'.$fiscalPeriod)];
                                $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;

                                /**
                                 * Verifica si el activo fijo se creo en la gestion actual de la iteración, para calcular los datos dede la 
                                 * fecha de compra del activo o de toda la gestion
                                 * */ 
                                if($this->diffMonths($newDateFA, $fiscalDateY) > 0 && $this->diffMonths($newDateFA, $fiscalDateY) <= 12) { // TODO: maybe
                                    // echo '| '.print_r(" :: A-Igual ", true).' |';
                                    
                                    $realM1 = $this->diffMonths($initialDateFA, $fiscalDateY);
                                    $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                                    $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                                    if ($existUsefulLife) {
                                        $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * ($realM1) :  $updatedValue / $usefulLifeRevaluation / 12 * ($realM1); //! Depreciación Gesctión   #####/12 * # = # solo desde la compra del activo
                                    }
                                // Calcula los datos de gestiones anterioes a la gestión actual de la iteración.
                                } else {
                                    // echo '| '.print_r(" :: A-Diferente ", true).' |';

                                    $update = $updatedValueOld * $updateCoefficient;
                                    $updatedValue = $updatedValueOld + $update;
                                    if ($existUsefulLife) {
                                        $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * 12 : $updatedValue / $usefulLifeRevaluation / 12 * 12; //! Depreciación Gesctión   #####/12 * 12 = 1 toda la gestion
                                    }
                                }
                                
                                if ($existUsefulLife) {
                                    $updateAD = $accumDeprOld * $updateCoefficient;
                                    $accumDeprU = $accumDeprOld + $updateAD;
                                    $accumDepr = $accumDeprU + $depreciation;
                                }

                                $ufvFA_initialDate = $ufvDC; //* Se cambia el valor de la ufv al 31-12 de la gestion de la iteración.
                                $initialDateFA = $fiscalDateY;

                                echo '| '.print_r($updatedValue ." : ". $accumDepr, true).' |';
                                echo '| '.print_r(" :: Ant = ". ($updatedValue - $accumDepr), true).' |';
                            }
                        }
                    /**
                     * Verificar si la fecha de compra del activo fijos es menor a la fecha de depreciación requerida 
                     * y si el año del A.F. es igual al de la depreciación.
                     * Esto para calcular los datos de la depreciación solo de la gestion actual.
                     */
                    } elseif ($dateFA < $dateDepreciation && $month_fis_dep <= 0) {
                        echo '| '.print_r($fixedAsset["nombre"].":: unica", true).' |';
                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate - 1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;

                        if ($existUsefulLife) {
                            $m = $this->diffMonths($newDateFA, $dateDepreciation);

                            //! Depreciación Gesctión   #####/12 * #:  # = solo desde la (compra, revaluo, dato anterior) del activo
                            $depreciation = $revaluation == 0 ? $updatedValue / $usefulLife / 12 * $m :  $updatedValue / $usefulLifeRevaluation / 12 * $m; 

                            $updateAD = $accumDeprOld * $updateCoefficient;
                            $accumDeprU = $accumDeprOld + $updateAD;
                            $accumDepr = $accumDeprU + $depreciation;
                        }
                    } elseif ($dateFA == $dateDepreciation && $month_fis_dep == 0) {
                        echo '| '.print_r($fixedAsset["nombre"].": unica - igual", true).' |';
                        $ufvDC = $ufvValues[$dateDepreciation];
                        $updateCoefficient = $ufvDC / $ufvFA_initialDate -1;
                        $update = $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) * $updateCoefficient : $revaluation * $updateCoefficient;
                        $updatedValue =  $revaluation == 0 ? (floatval($incomeValue) - $salvageValue) + $update : $revaluation + $update;
                    }
                    echo '| '.print_r(":: TOTAL = ". ($updatedValue - $accumDepr), true).' |';
                    
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
            
        $yearGD = date('Y', strtotime($depreciationDate));
        $fiscalDateG = $yearGD ."-". $fiscalPeriod;
        $testG = $this->diffMonths($fiscalDateG, $depreciationDate, false);
        $previousYear = $testG > 0 ? $yearGD : $yearGD - 1;
        $previousDateF = $previousYear ."-". $fiscalPeriod;

        $testOldPrev = ($dateOldDepreciation && strtotime($previousDateF) <= strtotime($dateOldDepreciation)) ? TRUE : FALSE;

        // echo '| '.print_r($previousDateF ." - ". $testOldPrev, true).' |';
        // echo '| '.print_r(($testOldPrev ? date('d/m/Y', strtotime($dateOldDepreciation)) : date('d/m/Y', strtotime($previousDateF))), true).' |';
        
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
                        <th >'. ($testOldPrev ? date('d/m/Y', strtotime($dateOldDepreciation)) : date('d/m/Y', strtotime($previousDateF))) .'</th>
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

        // if (!($this->gtNW || $this->stNW)) {
        //     $db = new DBConnection();

        //     $empresa = $_SESSION["organizacion"];
        //     $creado_en = date("Y-m-d H:i:s");
        //     $usu_creador = $_SESSION["yofinanciero"];
        //     $isMix = $mix ? 1 : 0;
        //     $inv_type = $this->tipo_inv_id === "" ? 'NULL' : $this->tipo_inv_id;
        //     foreach ($dataCD as $value) {
        //         $idactivo = $value["idactivo"];
        //         $valoractualizado = $value["valoractualizado"];
        //         $actualizacion =  $value["actualizacion"];
        //         $depreciacion =  $value["depreciacion"];
        //         $dpracum = $value["dpracum"];
        //         $actudrcacum = $value["actdprcacum"];

        //         $querAI=$db->prepare("INSERT INTO cuadrodepreciacion (activosfijos_id, fechadepreciacion, valoractualizadoanterior, actualizacion, depreciacion, depreciacionacumulada, actdeprcacumulada, depreciacion_mixto, metododepreciacion_id, tipoinventario_id, empresa_id, creado_en, usu_creador) VALUES ('$idactivo', '$depreciationDate', '$valoractualizado', '$actualizacion', '$depreciacion', '$dpracum', '$actudrcacum', '$isMix', '1', $inv_type, '$empresa', '$creado_en', '$usu_creador')");
        //         $querAI->execute();
        //     }
        // }

        $pdf = new PDFFile();
        $pdf->createPdf($tableHeader, "Tabla de Depreciación", "Letter-L");
    }

    public function SumOfDigits($data, $previousData = [], $mix = NULL){ 
    }

    public function ProductionUnits($data, $previousData = [], $mix = NULL){ 
    }
    
    public function StraightLineChart($data, $previousData = []){ 
    }
    
    public function BarChart($data){ 
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
    }

    public function StraightLineFA($data, $previousData = [], $salePrice = null){ 
    }

    public function SumOfDigitsFA($data, $previousData = [], $salePrice = null){ 
    }

    public function ProductionUnitsFA($data, $previousData = [], $salePrice = null){ 
    }
}

?>