<?php
require_once "../db/conexion.php";
require_once "funciones.php";
class reportes
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $numceros;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        //$this->ad = $this->conexion->ad; reportecreditos
        $this->em = $this->conexion->em;
    }

    public function arrayIDalmacen($idmd5)
    {
        $lista = array();
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $consulta = $this->cm->query("SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
            LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
            LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
            WHERE r.id_usuario='$idusuario'");

        while ($qwe = $this->cm->fetch($consulta)) {
            $idalmacen = $qwe[2]; 
            $lista[] = $idalmacen;
        }
        $resultado = implode(',', $lista);
        return $resultado;
    }

    public function reporteproductoalmacen2($idalmacen, $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $rep = $this->cm->query("SELECT
            pa.id_productos_almacen,
            al.nombre AS nombre_almacen,
            p.codigo,
            p.cod_barras,
            p.nombre AS nombre_producto,
            p.descripcion,
            pa.pais,
            u.nombre AS nombre_unidad,
            p.caracteristicas,
            pa.stock_minimo,
            s.cantidad AS ultima_cantidad_stock,
            pa.fecha_registro,
            al.id_almacen,
            pa.estado,
            m.nombre_medida,
            pa.productos_id_productos,
            ep.tipos_estado,
            pa.stock_maximo,
            p.imagen,
            s.id_stock,
            COALESCE(
                ca.id_categorias,
                sca_padre.id_categorias
            ) AS id_categoria,
            COALESCE(sca.id_categorias, '') AS id_subcategoria,
            COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
            COALESCE(sca.nombre, '') AS nombre_subcategoria,
            pb.precio,
            pa.pais
        FROM
            productos_almacen AS pa
        LEFT JOIN almacen AS al
        ON
            pa.almacen_id_almacen = al.id_almacen
        LEFT JOIN productos AS p
        ON
            pa.productos_id_productos = p.id_productos
        LEFT JOIN precio_base AS pb
        ON
            pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen and pb.estado = 1
        LEFT JOIN unidad AS u
        ON
            u.id_unidad = p.unidad_id_unidad
        LEFT JOIN medida AS m
        ON
            m.id_medida = p.medida_id_medida
        LEFT JOIN categorias sca ON
            p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0 AND sca.id_empresa = '$idempresa'
        LEFT JOIN categorias sca_padre ON
            sca.idp = sca_padre.id_categorias
        LEFT JOIN categorias ca ON
            p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0 AND ca.id_empresa = '$idempresa'
        LEFT JOIN estados_productos AS ep
        ON
            p.estados_productos_id_estados_productos = ep.id_estados_productos
        LEFT JOIN(
            SELECT
                id_stock,
                productos_almacen_id_productos_almacen,
                cantidad,
                
                ROW_NUMBER() OVER(
                    PARTITION BY productos_almacen_id_productos_almacen
                    ORDER BY
                    
                        id_stock DESC
                ) AS rn
            FROM
                stock
            WHERE
                estado = '1'  -- ADD THIS LINE FOR THE DATE FILTER
        ) AS s
            ON
                pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1 AND pb.estado = 1
            WHERE
                p.idempresa = '$idempresa' and pa.almacen_id_almacen='$idalmacen'
            ORDER BY
                pa.id_productos_almacen
            DESC");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("id"=>$qwe[0],"almacen"=>$qwe[1],"codigo"=>$qwe[2],"codigobarra"=>$qwe[3],"producto"=>$qwe[4],"descripcion"=>$qwe[5],"detalle"=>$qwe[6],"unidad"=>$qwe[7],"caracteristica"=>$qwe[8],"stockminimo"=>$qwe[9],"stock"=>$qwe[10],"fecha"=>$qwe[11],"idalmacen"=>$qwe[12],"estado"=>$qwe[13],"medida"=>$qwe[14],"idproducto"=>$qwe[15],"estadoproducto"=>$qwe[16], "stockmaximo" => $qwe[17], "imagen" => $qwe[18], "idstock" => $qwe[19], "idcategoria" => $qwe[20], "idsubcategoria" => $qwe[21], "categoria" => $qwe[22], "subcategoria" => $qwe[23], "costounitario" => $qwe[24], "pais" => $qwe[25]);
            array_push($lista, $res);//costo
        }
        echo json_encode($lista);
    }
    public function reporteproductoalmacen($idalmacen, $idmd5) {
        try {
            // Validación de entradas
            $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
          

            

            // Consulta SQL con parámetros preparados
            $sql = "SELECT
                pa.id_productos_almacen,
                al.nombre AS nombre_almacen,
                p.codigo,
                p.cod_barras,
                p.nombre AS nombre_producto,
                p.descripcion,
                pa.pais,
                u.nombre AS nombre_unidad,
                p.caracteristicas,
                pa.stock_minimo,
                s.cantidad AS ultima_cantidad_stock,
                pa.fecha_registro,
                al.id_almacen,
                pa.estado,
                m.nombre_medida,
                pa.productos_id_productos,
                ep.tipos_estado,
                pa.stock_maximo,
                p.imagen,
                s.id_stock,
                COALESCE(ca.id_categorias, sca_padre.id_categorias) AS id_categoria,
                COALESCE(sca.id_categorias, '') AS id_subcategoria,
                COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
                COALESCE(sca.nombre, '') AS nombre_subcategoria,
                pb.precio,
                pa.pais
            FROM productos_almacen AS pa
            LEFT JOIN almacen AS al ON pa.almacen_id_almacen = al.id_almacen
            LEFT JOIN productos AS p ON pa.productos_id_productos = p.id_productos
            LEFT JOIN precio_base AS pb ON pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen AND pb.estado = 1
            LEFT JOIN unidad AS u ON u.id_unidad = p.unidad_id_unidad
            LEFT JOIN medida AS m ON m.id_medida = p.medida_id_medida
            LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0 AND sca.id_empresa = ?
            LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
            LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0 AND ca.id_empresa = ?
            LEFT JOIN estados_productos AS ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
            LEFT JOIN (
                SELECT
                    id_stock,
                    productos_almacen_id_productos_almacen,
                    cantidad,
                    ROW_NUMBER() OVER(PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
                FROM stock
                WHERE estado = '1'
            ) AS s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1 AND pb.estado = 1
            WHERE p.idempresa = ? AND pa.almacen_id_almacen = ?
            ORDER BY pa.id_productos_almacen DESC";

            $stmt = $this->cm->prepare($sql);
            if (!$stmt) {
                throw new Exception("Error al preparar la consulta: " . $this->cm->error);
            }
            
            // Vincular parámetros
            $stmt->bind_param("iiii", $idempresa, $idempresa, $idempresa, $idalmacen);
            
            // Ejecutar
            if (!$stmt->execute()) {
                throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
            }
            
            // Obtener resultado
            $result = $stmt->get_result();

             $lista = [];
            while ($row = $result->fetch_assoc()) {
                $producto = [
                    "id" => $row['id_productos_almacen'],
                    "almacen" => $row['nombre_almacen'],
                    "codigo" => $row['codigo'],
                    "codigobarra" => $row['cod_barras'],
                    "producto" => $row['nombre_producto'],
                    "descripcion" => $row['descripcion'],
                    "detalle" => $row['pais'],
                    "unidad" => $row['nombre_unidad'],
                    "caracteristica" => $row['caracteristicas'],
                    "stockminimo" => is_numeric($row['stock_minimo']) ? (float)$row['stock_minimo'] : 0,
                    "stock" => is_numeric($row['ultima_cantidad_stock']) ? (float)$row['ultima_cantidad_stock'] : 0,
                    "fecha" => $row['fecha_registro'],
                    "idalmacen" => $row['id_almacen'],
                    "estado" => $row['estado'],
                    "medida" => $row['nombre_medida'],
                    "idproducto" => $row['productos_id_productos'],
                    "estadoproducto" => $row['tipos_estado'],
                    "stockmaximo" => is_numeric($row['stock_maximo']) ? (float)$row['stock_maximo'] : 0,
                    "imagen" => $row['imagen'],
                    "idstock" => $row['id_stock'],
                    "idcategoria" => $row['id_categoria'],
                    "idsubcategoria" => $row['id_subcategoria'],
                    "categoria" => $row['nombre_categoria'],
                    "subcategoria" => $row['nombre_subcategoria'],
                    "costounitario" => is_numeric($row['precio']) ? (float)$row['precio'] : 0,
                    "pais" => $row['pais']
                ];
                
                $lista[] = $producto;
            }

            if (empty($lista)) {
                return json_encode(['info' => 'No se encontraron productos en este almacén']);
            }

            echo json_encode($lista);

        } catch (Exception $e) {
            error_log("Error en reporteproductoalmacen: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Ocurrió un error al generar el reporte']);
        }
    }
    public function reportepedidos($idmd5, $fechai, $fechaf)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("SELECT p.id_pedidos, p.fecha_pedido, p.autorizacion, p.observacion, p.codigo, p.almacen_id_almacen, a.nombre, p.estado, p.tipopedido, p.almacen_origen, a1.nombre, p.usuario, p.nropedido FROM pedidos p
        LEFT JOIN almacen a ON p.almacen_id_almacen=a.id_almacen
        LEFT JOIN almacen a1 ON p.almacen_origen=a1.id_almacen
        WHERE p.almacen_id_almacen in ($arrayid) and p.fecha_pedido between '$fechai' and '$fechaf' 
        ORDER BY p.fecha_pedido ASC");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("id" => $qwe[0], "fecha" => $qwe[1], "autorizacion" => $qwe[2], "observacion" => $qwe[3], "codigo" => $qwe[4], "idalmacen" => $qwe[5], "almacen" => $qwe[6], "estado" => $qwe[7], "tipopedido" => $qwe[8], "idalmacenorigen" => $qwe[9], "almacenorigen" => $qwe[10], "idusuario" => $qwe[11], "nropedido" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportecompras($idmd5, $fechai, $fechaf)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select i.id_ingreso, i.codigo, i.fecha_ingreso, i.nombre, i.nfactura, prov.nombre, a.nombre, i.almacen_id_almacen, i.autorizacion, (SELECT SUM(di2.precio_unitario) FROM detalle_ingreso di2 WHERE di2.ingreso_id_ingreso = i.id_ingreso) as total from ingreso i
        left join proveedor prov on i.proveedor_id_proveedor=prov.id_proveedor
        left join almacen a on i.almacen_id_almacen=a.id_almacen
        where i.fecha_ingreso between '$fechai' and '$fechaf' and i.almacen_id_almacen in ($arrayid)
        order by i.fecha_ingreso asc");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idcompra" => $qwe[0], "codigo" => $qwe[1], "fecha" => $qwe[2], "nombrelote" => $qwe[3], "nfactura" => $qwe[4], "proveedor" => $qwe[5], "almacen" => $qwe[6], "idalmacen" => $qwe[7], "autorizacion" => $qwe[8], "total" => $qwe[9]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportemoviento($idmd5, $fechai, $fechaf)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select m.id_movimiento, m.fecha_movimiento, m.codigo, m.almacen_id_almacen, a.nombre, m.almacen_destino, 
        (select a1.nombre from almacen a1 where a1.id_almacen=m.almacen_destino limit 1 )as almacendestino, m.descripcion, m.autorizacion from movimiento m 
        inner join almacen a on m.almacen_id_almacen=a.id_almacen
        where m.almacen_id_almacen in ($arrayid) and m.fecha_movimiento between '$fechai' and '$fechaf'
        order by m.fecha_movimiento asc");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idmovimiento" => $qwe[0], "fecha" => $qwe[1], "codigo" => $qwe[2], "idalmacenorigen" => $qwe[3], "almacenorigen" => $qwe[4], "idalmacendestino" => $qwe[5], "almacendestino" => $qwe[6], "descripcion" => $qwe[7], "autorizacion" => $qwe[8], "idalmacen" =>$qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportemermas($idmd5, $fechai, $fechaf)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select m.id_mermas_desperdicios, m.fecha_informe, a.nombre, m.descripcion, m.autorizacion, m.almacen_id_almacen from mermas_desperdicios m
        inner join almacen a on m.almacen_id_almacen=a.id_almacen
        where m.almacen_id_almacen in ($arrayid) and m.fecha_informe between '$fechai' and '$fechaf'
        order by m.fecha_informe asc");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idmerma" => $qwe[0], "fecha" => $qwe[1], "almacen" => $qwe[2], "descripcion" => $qwe[3], "autorizacion" => $qwe[4], "idalmacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporterobos($idmd5, $fechai, $fechaf)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select r.id_robos, r.fecha_registro, a.nombre, r.descripcion, r.autorizacion, r.almacen_id_almacen from robos r
        left join almacen a on r.almacen_id_almacen=a.id_almacen
        where r.almacen_id_almacen in ($arrayid) and r.fecha_registro between '$fechai' and '$fechaf'
        order by r.fecha_registro asc");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idrobo" => $qwe[0], "fecha" => $qwe[1], "almacen" => $qwe[2], "descripcion" => $qwe[3], "autorizacion" => $qwe[4], "idalmacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporteventas($idmd5, $fechai, $fechaf)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select v.id_venta, v.fecha_venta, concat(c.nombre, ' - ' , c.nombrecomercial) as nombre, v.tipo_venta, v.tipo_pago, v.monto_total, v.nfactura, v.descuento, pa.almacen_id_almacen, v.cliente_id_cliente1, d.tipo_divisa, s.nombre, v.estado, vf.shortLink, vf.urlSin, v.idcanal, cv.canal, v.idsucursal from venta v 
        left join cliente c on v.cliente_id_cliente1=c.id_cliente
        left join detalle_venta dv on v.id_venta=dv.venta_id_venta
        left join sucursal s on v.idsucursal=s.id_sucursal
        left join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        left join divisas d on v.divisas_id_divisas=d.id_divisas
        left join canalventa cv on v.idcanal=cv.idcanalventa
        LEFT JOIN ventas_facturadas vf ON v.id_venta=vf.venta_id_venta
        where pa.almacen_id_almacen in ($arrayid) and v.fecha_venta between '$fechai' and '$fechaf' 
        group by v.id_venta
        order by v.id_venta asc, v.fecha_venta ASC");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idventa" => $qwe[0], "fecha" => $qwe[1], "cliente" => $qwe[2], "tipoventa" => $qwe[3], "tipopago" => $qwe[4], "ventatotal" => $qwe[5], "nfactura" => $qwe[6], "descuento" => $qwe[7], "idalmacen" => $qwe[8], "idcliente" => $qwe[9], "divisa" => $qwe[10], "sucursal" => $qwe[11], "estado" => $qwe[12], "shortlink" => $qwe[13], "urlsin" => $qwe[14], "idcanal" => $qwe[15], "canal" => $qwe[16], "idsucursal" => $qwe[17]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportecotizacion($idmd5, $fechai, $fechaf)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $clien = $this->cm->query("select co.id_cotizacion, co.fecha_cotizacion, concat(c.nombre, ' - ' , c.nombrecomercial) as nombre, co.monto_total, co.descuento, pa.almacen_id_almacen, co.cliente_id_cliente, d.tipo_divisa, s.nombre from cotizacion co 
        left join cliente c on co.cliente_id_cliente=c.id_cliente
        left join detalle_cotizacion dco on co.id_cotizacion=dco.cotizacion_id_cotizacion
        left join sucursal s on co.idsucursal=s.id_sucursal
        left join productos_almacen pa on dco.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        left join divisas d on co.divisas_id_divisas=d.id_divisas
        where pa.almacen_id_almacen in ($arrayid) and co.fecha_cotizacion between '$fechai' and '$fechaf' 
        group by co.id_cotizacion
        order by co.id_cotizacion desc, co.fecha_cotizacion ASC");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array("idcotizacion" => $qwe[0], "fecha" => $qwe[1], "cliente" => $qwe[2], "cotizaciontotal" => $qwe[3], "descuento" => $qwe[4], "idalmacen" => $qwe[5], "idcliente" => $qwe[6], "divisa" => $qwe[7], "sucursal" => $qwe[8]);

            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporteCreditos($idmd5, $fechai, $fechaf)
    {
        // Validación básica de fechas reporteCreditos
        $fechaInicio = $this->cm->escape_string($fechai);
        $fechaFin = $this->cm->escape_string($fechaf);
        if (!$this->verificar->validarFecha($fechai) || !$this->verificar->validarFecha($fechaf)) {
            echo json_encode(["estado" => "error", "mensaje" => "Fechas inválidas."]);
            return;
        }

        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        
        $sql = "
            SELECT 
                ec.id_estado_cobro AS idcredito,
                v.cliente_id_cliente1 AS idcliente,
                CONCAT(c.nombre, ' - ', c.nombrecomercial, ' - ', c.ciudad) AS razonsocial,
                ec.venta_id_venta AS idventa,
                ec.Ncuotas AS ncuotas,
                ec.valorcuotas AS valorcuotas,
                ec.saldo,
                ec.fecha_limite AS fechalimite,
                ec.estado,
                v.fecha_venta AS fechaventa,
                pa.almacen_id_almacen AS idalmacen,
                v.monto_total AS montoventa,
                (
                    SELECT SUM(dc.ncuotas) 
                    FROM detalle_cobro dc 
                    WHERE dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro and dc.fecha_actual BETWEEN '$fechaInicio' AND '$fechaFin'
                ) AS cuotaspagadas,
                s.nombre AS sucursal,
                (
                    SELECT SUM(dc.monto) 
                    FROM detalle_cobro dc 
                    WHERE dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro and dc.fecha_actual BETWEEN '$fechaInicio' AND '$fechaFin'
                ) AS totalcobrado,
                v.idsucursal
            FROM estado_cobro ec
            LEFT JOIN venta v ON ec.venta_id_venta = v.id_venta
            LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
            LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
            LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
            WHERE pa.almacen_id_almacen IN ($arrayid)
            AND v.fecha_venta BETWEEN '$fechaInicio' AND '$fechaFin'
            GROUP BY ec.id_estado_cobro
            ORDER BY ec.id_estado_cobro ASC 
        ";

        $clien = $this->cm->query($sql);

        if (!$clien) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta."]);
            return;
        }

        while ($row = $this->cm->fetch($clien)) {
            $lista[] = [
                "idcredito" => $row["idcredito"],
                "idcliente" => $row["idcliente"],
                "razonsocial" => $row["razonsocial"],
                "idventa" => $row["idventa"],
                "ncuotas" => $row["ncuotas"],
                "valorcuotas" => $row["valorcuotas"],
                "saldo" => $row["saldo"],
                "fechalimite" => $row["fechalimite"],
                "estado" => $row["estado"],
                "fechaventa" => $row["fechaventa"],
                "idalmacen" => $row["idalmacen"],
                "montoventa" => $row["montoventa"],
                "cuotaspagadas" => $row["cuotaspagadas"],
                "sucursal" => $row["sucursal"],
                "totalcobrado" => $row["totalcobrado"],
                "idsucursal" => $row["idsucursal"]
            ];
        }

        echo json_encode([
            "estado" => "exito",
            "data" => $lista
        ]);
    }

    public function reporteCreditosAlCorte($idmd5, $fechaf)
    {
        
        $fechaFin = $this->cm->escape_string($fechaf);
        if (!$this->verificar->validarFecha($fechaf)) {
            echo json_encode(["estado" => "error", "mensaje" => "Fechas inválidas."]);
            return;
        }

        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        
        $sql = "
            SELECT 
                ec.id_estado_cobro AS idcredito,
                v.cliente_id_cliente1 AS idcliente,
                CONCAT(c.nombre, ' - ', c.nombrecomercial, ' - ', c.ciudad) AS razonsocial,
                ec.venta_id_venta AS idventa,
                ec.Ncuotas AS ncuotas,
                ec.valorcuotas AS valorcuotas,
                ec.saldo,
                ec.fecha_limite AS fechalimite,
                ec.estado,
                v.fecha_venta AS fechaventa,
                pa.almacen_id_almacen AS idalmacen,
                v.monto_total AS montoventa,
                (
                    SELECT SUM(dc.ncuotas) 
                    FROM detalle_cobro dc 
                    WHERE dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro and dc.fecha_actual <= '$fechaFin'
                ) AS cuotaspagadas,
                s.nombre AS sucursal,
                (
                    SELECT SUM(dc.monto) 
                    FROM detalle_cobro dc 
                    WHERE dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro and dc.fecha_actual <= '$fechaFin'
                ) AS totalcobrado,
                v.idsucursal
            FROM estado_cobro ec
            LEFT JOIN venta v ON ec.venta_id_venta = v.id_venta
            LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
            LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
            LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
            WHERE pa.almacen_id_almacen IN ($arrayid)
            AND v.fecha_venta <= '$fechaFin'
            GROUP BY ec.id_estado_cobro
            ORDER BY ec.id_estado_cobro ASC
        ";

        $clien = $this->cm->query($sql);

        if (!$clien) {
            echo json_encode(["estado" => "error", "mensaje" => "Error al ejecutar la consulta."]);
            return;
        }

        while ($row = $this->cm->fetch($clien)) {
            $lista[] = [
                "idcredito" => $row["idcredito"],
                "idcliente" => $row["idcliente"],
                "razonsocial" => $row["razonsocial"],
                "idventa" => $row["idventa"],
                "ncuotas" => $row["ncuotas"],
                "valorcuotas" => $row["valorcuotas"],
                "saldo" => $row["saldo"],
                "fechalimite" => $row["fechalimite"],
                "estado" => $row["estado"],
                "fechaventa" => $row["fechaventa"],
                "idalmacen" => $row["idalmacen"],
                "montoventa" => $row["montoventa"],
                "cuotaspagadas" => $row["cuotaspagadas"],
                "sucursal" => $row["sucursal"],
                "totalcobrado" => $row["totalcobrado"],
                "idsucursal" => $row["idsucursal"]
            ];
        }

        echo json_encode([
            "estado" => "exito",
            "data" => $lista
        ]);
    }

    public function getDailyCollectionsJson($fechaInicio, $fechaFin, $idmd5)
    {
        // Validar y escapar entradas
        $fechaInicio = $this->cm->escape_string($fechaInicio);
        $fechaFin = $this->cm->escape_string($fechaFin);

        // Obtener lista de almacenes asociados
        $arrayid = $this->arrayIDalmacen($idmd5);

        $sql = "
            SELECT
                dc.fecha_actual,
                c.id_cliente AS idcliente,
                c.nombre,
                c.nombrecomercial,
                v.tipo_venta,
                v.monto_total,
                v.descuento,
                ec.saldo,
                dc.iddetalle_cobro,
                dc.monto AS detalle_monto,
                dc.foto,
                pa.almacen_id_almacen AS idalmacen,
                a.nombre AS nombre_almacen,
                s.nombre AS sucursal,
                v.idsucursal

            FROM detalle_cobro dc
            INNER JOIN estado_cobro ec ON dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro
            INNER JOIN venta v ON ec.venta_id_venta = v.id_venta
            INNER JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
            LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
            LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal
            WHERE dc.fecha_actual BETWEEN '$fechaInicio' AND '$fechaFin'
            AND pa.almacen_id_almacen IN ($arrayid)
            GROUP BY dc.iddetalle_cobro
            ORDER BY dc.fecha_actual;
        ";

        $listaCobros = [];
        $result = $this->cm->query($sql);

        if ($result) {
            while ($row = $this->cm->fetch($result)) {
                $listaCobros[] = [
                    "fecha_actual"         => $row["fecha_actual"],
                    "idcliente"           => $row["idcliente"],
                    "nombre_cliente"       => $row["nombre"],
                    "nombre_comercial"     => $row["nombrecomercial"],
                    "tipo_venta"           => $row["tipo_venta"],
                    "monto_total_venta"    => (float)$row["monto_total"],
                    "descuento_venta"      => (float)$row["descuento"],
                    "saldo_estado_cobro"   => (float)$row["saldo"],
                    "id_detalle_cobro"     => $row["iddetalle_cobro"],
                    "monto_detalle_cobro"  => (float)$row["detalle_monto"],
                    "foto_detalle_cobro"   => $row["foto"],
                    "idalmacen"           => $row["idalmacen"],
                    "nombre_almacen"       => $row["nombre_almacen"],
                    "nombre_sucursal"      => $row["sucursal"],
                    "idsucursal"      => $row["idsucursal"]
                ];
            }
        }

        header('Content-Type: application/json');
        echo json_encode($listaCobros);
    }


    public function reportecreditosatrasados($idmd5, $idcliente)
    {   $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $clien = $this->cm->query("select ec.id_estado_cobro, v.cliente_id_cliente1, ec.venta_id_venta, ec.Ncuotas, ec.valorcuotas, ec.saldo, ec.fecha_limite, ec.estado, v.fecha_venta, pa.almacen_id_almacen, v.monto_total, a.nombre from estado_cobro ec
        inner join venta v on ec.venta_id_venta=v.id_venta
        inner join detalle_venta dv on v.id_venta=dv.venta_id_venta
        inner join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join cliente c on v.cliente_id_cliente1=c.id_cliente
        inner join almacen a on pa.almacen_id_almacen=a.id_almacen
        where pa.almacen_id_almacen in ($arrayid) and v.cliente_id_cliente1 = '$idcliente'
        group by id_estado_cobro
        order by v.fecha_venta ASC");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array("idcredito" => $qwe[0], "idcliente" => $qwe[1], "idventa" => $qwe[2], "ncuotas" => $qwe[3], "valorcuotas" => $qwe[4], "saldo" => $qwe[5], "fechalimite" => $qwe[6], "estado" => $qwe[7], "fechaventa" => $qwe[8], "idalmacen" => $qwe[9], "montoventa" => $qwe[10], "almacen" => $qwe[11]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportepreciobase($idmd5)
    {
        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $clien = $this->cm->query("select pb.id_precio_base, p.nombre, p.descripcion, p.caracteristicas, c.nombre, m.nombre_medida, ep.tipos_estado, u.nombre, pb.precio, a.nombre, pa.almacen_id_almacen, pb.fecha, p.codigo from precio_base pb 
        inner join productos_almacen pa on pb.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos p on pa.productos_id_productos=p.id_productos
        inner join almacen a on pa.almacen_id_almacen=a.id_almacen
        inner join categorias c on p.categorias_id_categorias=c.id_categorias
        inner join medida m on p.medida_id_medida=m.id_medida
        inner join estados_productos ep on p.estados_productos_id_estados_productos=ep.id_estados_productos
        inner join unidad u on p.unidad_id_unidad=u.id_unidad
        where pa.almacen_id_almacen in ($arrayid) and pb.estado=1
        order by a.nombre ASC");
        while ($qwe = $this->cm->fetch($clien)) {
            $res = array("idpreciobase" => $qwe[0], "producto" => $qwe[1], "descripcion" => $qwe[2], "caracteristica" => $qwe[3], "categoria" => $qwe[4], "medida" => $qwe[5], "estadoproducto" => $qwe[6], "unidad" => $qwe[7], "preciobase" => $qwe[8], "almacen" => $qwe[9], "idalmacen" => $qwe[10], "fecha" => $qwe[11], "codigo" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportecategoriasprecio($idmd5)
    {
        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select po.id_porcentajes, po.almacen_id_almacen, po.tipo, po.porcentaje, po.autorizado, a.nombre from porcentajes po 
        inner join almacen a on po.almacen_id_almacen=a.id_almacen
        where po.almacen_id_almacen in ($arrayid)
        order by a.nombre ASC");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idporcentaje" => $qwe[0], "idalmacen" => $qwe[1], "nombre" => $qwe[2], "porcentaje" => $qwe[3], "estado" => $qwe[4], "almacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportecampañas($idmd5, $fechai, $fechaf)
    {
        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select c.id_campañas, c.nombre, c.fechainicio, c.fechafinal, c.porcentage, c.estado, c.almacen_id_almacen, a.nombre from campañas c 
        inner join almacen a on c.almacen_id_almacen=a.id_almacen
        where c.almacen_id_almacen in ($arrayid) and c.fechainicio between '$fechai' and '$fechaf'
        order by c.fechainicio ASC");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idcampaña" => $qwe[0], "nombre" => $qwe[1], "fechainicio" => $qwe[2], "fechafinal" => $qwe[3], "porcentaje" => $qwe[4], "estado" => $qwe[5], "idalmacen" => $qwe[6], "almacen" => $qwe[7]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporteventacampañas($idmd5, $fechai, $fechaf)
    {
        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select c.id_campañas, c.nombre, c.fechainicio, c.fechafinal, c.porcentage, c.almacen_id_almacen, a.nombre, 
        (select count(v1.idcampaña) from venta v1 where v1.idcampaña=c.id_campañas) as cantidad from campañas c 
        inner join almacen a on c.almacen_id_almacen=a.id_almacen
        where c.almacen_id_almacen in ($arrayid) and c.fechainicio between '$fechai' and '$fechaf'
        order by cantidad ASC");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idcampaña" => $qwe[0], "nombre" => $qwe[1], "fechainicio" => $qwe[2], "fechafinal" => $qwe[3], "porcentaje" => $qwe[4], "idalmacen" => $qwe[5], "almacen" => $qwe[6], "nventas" => $qwe[7]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporterotacionxcliente($fechai, $fechaf, $cliente, $sucursal)
    {
        //$arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("select dv.id_detalle_venta, v.fecha_venta, p.nombre, p.descripcion, p.caracteristicas, c.nombre, m.nombre_medida, ep.tipos_estado, u.nombre, sum(dv.cantidad) as cantidadventas, 
        ifnull((select sum(die.cantidad) from detalle_invexterno die
        inner join inv_externo ie on die.inv_externo_id_inv_externo=ie.id_inv_externo
        where die.productos_almacen_id_productos_almacen=dv.productos_almacen_id_productos_almacen and ie.fecha_control = (select fecha_control from inv_externo where cliente_id_cliente='$cliente' and idsucursal='$sucursal' order by fecha_control desc limit 1)
        group by die.productos_almacen_id_productos_almacen),0) as cantidadIE, p.codigo, pa.almacen_id_almacen
        from detalle_venta dv
        inner join venta v on dv.venta_id_venta=v.id_venta
        inner join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos p on pa.productos_id_productos=p.id_productos
        inner join categorias c on p.categorias_id_categorias=c.id_categorias
        inner join medida m on p.medida_id_medida=m.id_medida
        inner join estados_productos ep on p.estados_productos_id_estados_productos=ep.id_estados_productos
        inner join unidad u on p.unidad_id_unidad=u.id_unidad
        inner join cliente cli on v.cliente_id_cliente1=cli.id_cliente
        inner join almacen a on pa.almacen_id_almacen=a.id_almacen
        where v.fecha_venta between '$fechai' and '$fechaf' and v.cliente_id_cliente1='$cliente' and v.idsucursal='$sucursal' and v.estado=1
        group by dv.productos_almacen_id_productos_almacen");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("iddetalleventa" => $qwe[0], "fechaventa" => $qwe[1], "producto" => $qwe[2], "descripcion" => $qwe[3], "caracteristica" => $qwe[4], "categoria" => $qwe[5], "medida" => $qwe[6], "estadoproducto" => $qwe[7], "unidad" => $qwe[8], "cantidadventas" => $qwe[9], "cantidadIE" => $qwe[10], "codigo" => $qwe[11], "idalmacen" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporterotacionxalmacen($idalmacen, $fechai, $fechaf)
    {
        $lista = [];
        $rep = $this->cm->query("select dv.id_detalle_venta, v.fecha_venta, p.nombre, p.descripcion, p.caracteristicas, c.nombre, m.nombre_medida, ep.tipos_estado, u.nombre, sum(dv.cantidad) as cantidadventas, 
        ifnull((select sum(die.cantidad) from detalle_invexterno die
        inner join inv_externo ie on die.inv_externo_id_inv_externo=ie.id_inv_externo
        where die.productos_almacen_id_productos_almacen=dv.productos_almacen_id_productos_almacen and ie.fecha_control = (select fecha_control from inv_externo where id_almacen='$idalmacen' and fecha_control between '$fechai' and '$fechaf' order by fecha_control desc limit 1)
        group by die.productos_almacen_id_productos_almacen),0) as cantidadIE, p.codigo, pa.almacen_id_almacen
        from detalle_venta dv
        inner join venta v on dv.venta_id_venta=v.id_venta
        inner join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos p on pa.productos_id_productos=p.id_productos
        inner join categorias c on p.categorias_id_categorias=c.id_categorias
        inner join medida m on p.medida_id_medida=m.id_medida
        inner join estados_productos ep on p.estados_productos_id_estados_productos=ep.id_estados_productos
        inner join unidad u on p.unidad_id_unidad=u.id_unidad
        inner join cliente cli on v.cliente_id_cliente1=cli.id_cliente
        inner join almacen a on pa.almacen_id_almacen=a.id_almacen
        where v.fecha_venta between '$fechai' and '$fechaf' and pa.almacen_id_almacen='$idalmacen' and v.estado=1
        group by dv.productos_almacen_id_productos_almacen");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("iddetalleventa" => $qwe[0], "fechaventa" => $qwe[1], "producto" => $qwe[2], "descripcion" => $qwe[3], "caracteristica" => $qwe[4], "categoria" => $qwe[5], "medida" => $qwe[6], "estadoproducto" => $qwe[7], "unidad" => $qwe[8], "cantidadventas" => $qwe[9], "cantidadIE" => $qwe[10], "codigo" => $qwe[11], "idalmacen" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporterotacionglobal($idmd5, $fechai, $fechaf)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        $rep = $this->cm->query("select dv.id_detalle_venta, v.fecha_venta, p.nombre, p.descripcion, p.caracteristicas, c.nombre, m.nombre_medida, ep.tipos_estado, u.nombre, sum(dv.cantidad) as cantidadventas, 
        ifnull((select sum(die.cantidad) from detalle_invexterno die
        inner join inv_externo ie on die.inv_externo_id_inv_externo=ie.id_inv_externo
        where die.productos_almacen_id_productos_almacen=dv.productos_almacen_id_productos_almacen and ie.fecha_control = (select iv1.fecha_control from inv_externo iv1 inner join almacen a1 on iv1.id_almacen=a1.id_almacen where a1.idempresa='$idempresa'
         and iv1.fecha_control between '$fechai' and '$fechaf' order by iv1.fecha_control desc limit 1)
        group by die.productos_almacen_id_productos_almacen),0) as cantidadIE, p.codigo, pa.almacen_id_almacen
        from detalle_venta dv
        inner join venta v on dv.venta_id_venta=v.id_venta
        inner join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        inner join productos p on pa.productos_id_productos=p.id_productos
        inner join categorias c on p.categorias_id_categorias=c.id_categorias
        inner join medida m on p.medida_id_medida=m.id_medida
        inner join estados_productos ep on p.estados_productos_id_estados_productos=ep.id_estados_productos
        inner join unidad u on p.unidad_id_unidad=u.id_unidad
        inner join cliente cli on v.cliente_id_cliente1=cli.id_cliente
        inner join almacen a on pa.almacen_id_almacen=a.id_almacen
        where v.fecha_venta between '$fechai' and '$fechaf' and p.idempresa='$idempresa' and v.estado=1
        group by dv.productos_almacen_id_productos_almacen");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("iddetalleventa" => $qwe[0], "fechaventa" => $qwe[1], "producto" => $qwe[2], "descripcion" => $qwe[3], "caracteristica" => $qwe[4], "categoria" => $qwe[5], "medida" => $qwe[6], "estadoproducto" => $qwe[7], "unidad" => $qwe[8], "cantidadventas" => $qwe[9], "cantidadIE" => $qwe[10], "codigo" => $qwe[11], "idalmacen" => $qwe[12]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function kardex($fechainicio,$fechafinal,$idalmacen,$idproducto)
    {
        $lista = [];

        $rep1 = $this->cm->query("select s.productos_almacen_id_productos_almacen, s.cantidad, s.codigo, s.fecha, 
        (select di.precio_unitario from ingreso i
        left join detalle_ingreso di on i.id_ingreso=di.ingreso_id_ingreso
        where di.productos_almacen_id_productos_almacen='$idproducto'
        order by di.id_detalle_ingreso desc limit 1) as precio, pa.almacen_id_almacen
        from productos_almacen pa 
        left join stock s on pa.id_productos_almacen=s.productos_almacen_id_productos_almacen
        left join detalle_venta dv on pa.id_productos_almacen=dv.productos_almacen_id_productos_almacen
        left join venta v on dv.venta_id_venta=v.id_venta
        where s.productos_almacen_id_productos_almacen='$idproducto' and s.fecha between (DATE_ADD('$fechainicio', interval -1 month)) and (DATE_ADD('$fechainicio', interval -1 day)) and pa.almacen_id_almacen='$idalmacen'
        group by s.id_stock
        order by s.id_stock desc limit 1");
        while ($qwe = $this->cm->fetch($rep1)) {
            $res1 = array("idproducto" => $qwe[0], "stock" => $qwe[1], "codigo" => $qwe[2], "fecha" => $qwe[3], "precio" => $qwe[4], "idalmacen" => $qwe[5]);
            array_push($lista, $res1);
        }

        $rep = $this->cm->query("select s.productos_almacen_id_productos_almacen, s.cantidad, s.codigo, s.fecha, 
        (select di.precio_unitario from ingreso i
        left join detalle_ingreso di on i.id_ingreso=di.ingreso_id_ingreso
        where di.productos_almacen_id_productos_almacen='$idproducto'
        order by di.id_detalle_ingreso desc limit 1) as precio, pa.almacen_id_almacen 
        from productos_almacen pa 
        left join stock s on pa.id_productos_almacen=s.productos_almacen_id_productos_almacen
        left join detalle_venta dv on pa.id_productos_almacen=dv.productos_almacen_id_productos_almacen
        left join venta v on dv.venta_id_venta=v.id_venta
        where s.productos_almacen_id_productos_almacen='$idproducto' and s.fecha between '$fechainicio' and '$fechafinal' and pa.almacen_id_almacen='$idalmacen'
        group by s.id_stock");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idproducto" => $qwe[0], "stock" => $qwe[1], "codigo" => $qwe[2], "fecha" => $qwe[3], "precio" => $qwe[4], "idalmacen" => $qwe[5]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    // public function reporteventasporproductos($idmd5, $fechainicio, $fechafinal)
    // {
    //     $arrayid = $this->arrayIDalmacen($idmd5);
    //     $lista = [];
    //     $rep = $this->cm->query("SELECT
    //     v.fecha_venta,
    //     v.nfactura,
    //     v.tipo_venta,
    //     p.descripcion,
    //     u.nombre,
    //     COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
    //     pb.precio,
    //     dv.precio_unitario,
    //     dv.cantidad,
    //     (
    //         dv.precio_unitario * dv.cantidad
    //     ) AS importe,
    //     0 AS descuento,
    //     (
    //         dv.precio_unitario * dv.cantidad
    //     ) AS ventatotal,
    //     (pb.precio * dv.cantidad) AS costototal,
    //     (
    //         dv.precio_unitario * dv.cantidad
    //     ) -(pb.precio * dv.cantidad) AS utilidad,
    //     v.tipo_pago,
    //     v.id_usuario,
    //     a.idsucursal,
    //     a.nombre,
    //     c.nombre,
    //     c.tipodocumento,
    //     c.nit,
    //     c.nombrecomercial,
    //     cv.canal,
    //     po.tipo,
    //     pa.almacen_id_almacen,
    //     v.estado,
    //     su.nombre,
    //     v.id_usuario,
    //     COALESCE(sca.nombre, '') AS nombre_subcategoria,
    //     p.codigo,
    //     p.cod_barras,
    //     v.idsucursal,
    //     v.cliente_id_cliente1
    //     FROM
    //         detalle_venta dv
    //     LEFT JOIN venta v ON
    //         dv.venta_id_venta = v.id_venta
    //     LEFT JOIN sucursal su ON
    //         v.idsucursal = su.id_sucursal
    //     LEFT JOIN productos_almacen pa ON
    //         dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
    //     LEFT JOIN almacen a ON
    //         pa.almacen_id_almacen = a.id_almacen
    //     LEFT JOIN productos p ON
    //         pa.productos_id_productos = p.id_productos
    //     LEFT JOIN precio_base pb ON
    //         pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen
    //     LEFT JOIN cliente c ON
    //         v.cliente_id_cliente1 = c.id_cliente
    //     LEFT JOIN canalventa cv ON
    //         v.idcanal = cv.idcanalventa
    //     LEFT JOIN porcentajes po ON
    //         dv.categoria = po.id_porcentajes
    //     LEFT JOIN unidad u ON
    //         p.unidad_id_unidad = u.id_unidad
    //     LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
    //                 LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
    //                 LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
    //     WHERE
    //         v.fecha_venta BETWEEN '$fechainicio' AND '$fechafinal' AND pa.almacen_id_almacen IN ($arrayid) AND pb.estado = 1
    //     ORDER BY
    //         v.id_venta ASC,
    //         v.fecha_venta ASC;");
    //     $datosjson = $this->verificar->datosExtras();
    //     $datos = json_decode($datosjson, true);
    //     $tiposDocumentos = $datos['tiposDocumentos'];
    //     while ($qwe = $this->cm->fetch($rep)) {
    //         $usuario = $this->rh->fetch($this->rh->query("SELECT concat(t.nombre, ' ', t.apellido) FROM usuario u LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador WHERE u.idusuario = '$qwe[15]'"));
    //         $sucursal = $this->em->fetch($this->em->query("select nombre from sucursalcontable where idsucursalcontable='$qwe[16]' limit 0, 1"));
    //         $res = array("fecha" => $qwe[0], "nrofactura" => $qwe[1], "tipoventa" => $qwe[2], "descripcion" => $qwe[3], "unidad" => $qwe[4], "categoria" => $qwe[5], "preciobase" => $qwe[6], "preciounitario" => $qwe[7], "cantidad" => $qwe[8], "importe" => $qwe[9], "descuento" => $qwe[10], "totalventa" => $qwe[11], "totalcosto" => $qwe[12], "utilidad" => $qwe[13], "tipopago" => $qwe[14], "idusuario" => $usuario[0], "idsucursal" => $sucursal[0], "almacen" => $qwe[17], "cliente" => $qwe[18], "tipodocumento" => array_column($tiposDocumentos, 'descripcion', 'id')[$qwe[19]] ?? '', "nrodoc" => $qwe[20], "nombrecomercial" => $qwe[21], "canal" => $qwe[22], "tipoprecio" => $qwe[23], "idalmacen" => $qwe[24], "estado" => $qwe[25], "sucursalc" => $qwe[26], "idu" => $qwe[27], "almacenes" => $arrayid, "subcategoria" => $qwe[28], "codigo" => $qwe[29], "codigobarra" => $qwe[30], "idsucursalve" => $qwe[31], "idclienteve" => $qwe[32]);
    //         array_push($lista, $res);
    //     }
    //     echo json_encode($lista);
    // }
    public function reporteventasporproductos($idmd5, $fechainicio, $fechafinal)
    {
        // Obtener lista de IDs de almacenes en formato array
        $arrayid = $this->arrayIDalmacen($idmd5);

        // Validar que haya al menos un almacén
        if (empty($arrayid)) {
            echo json_encode([]); // No hay datos que consultar
            return;
        }

        // Convertir a lista separada por comas y limpiar
        

        $lista = [];

        // Ejecutar consulta principal
        $rep = $this->cm->query("
            SELECT
                v.fecha_venta,
                v.nfactura,
                v.tipo_venta,
                p.descripcion,
                u.nombre,
                COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
                pb.precio,
                dv.precio_unitario,
                dv.cantidad,
                (dv.precio_unitario * dv.cantidad) AS importe,
                0 AS descuento,
                (dv.precio_unitario * dv.cantidad) AS ventatotal,
                (pb.precio * dv.cantidad) AS costototal,
                (dv.precio_unitario * dv.cantidad) - (pb.precio * dv.cantidad) AS utilidad,
                v.tipo_pago,
                v.id_usuario,
                a.idsucursal,
                a.nombre,
                c.nombre,
                c.tipodocumento,
                c.nit,
                c.nombrecomercial,
                cv.canal,
                po.tipo,
                pa.almacen_id_almacen,
                v.estado,
                su.nombre,
                v.id_usuario,
                COALESCE(sca.nombre, '') AS nombre_subcategoria,
                p.codigo,
                p.cod_barras,
                v.idsucursal,
                v.cliente_id_cliente1
            FROM detalle_venta dv
            LEFT JOIN venta v ON dv.venta_id_venta = v.id_venta
            LEFT JOIN sucursal su ON v.idsucursal = su.id_sucursal
            LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
            LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
            LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
            LEFT JOIN precio_base pb ON pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen
            LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
            LEFT JOIN canalventa cv ON v.idcanal = cv.idcanalventa
            LEFT JOIN porcentajes po ON dv.categoria = po.id_porcentajes
            LEFT JOIN unidad u ON p.unidad_id_unidad = u.id_unidad
            LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
            LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
            LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
            WHERE v.fecha_venta BETWEEN '$fechainicio' AND '$fechafinal'
                AND pa.almacen_id_almacen IN ($arrayid)
                AND pb.estado = 1
            ORDER BY v.id_venta ASC, v.fecha_venta ASC
        ");

        // Obtener configuraciones adicionales
        $datosjson = $this->verificar->datosExtras();
        $datos = json_decode($datosjson, true);
        $tiposDocumentos = $datos['tiposDocumentos'];

        // Procesar resultados
        while ($qwe = $this->cm->fetch($rep)) {
            $usuario = $this->rh->fetch($this->rh->query("
                SELECT CONCAT(t.nombre, ' ', t.apellido)
                FROM usuario u
                LEFT JOIN trabajador t ON u.trabajador_idtrabajador = t.idtrabajador
                WHERE u.idusuario = '$qwe[15]'
            "));

            $sucursal = $this->em->fetch($this->em->query("
                SELECT nombre FROM sucursalcontable WHERE idsucursalcontable = '$qwe[16]' LIMIT 1
            "));

            $res = array(
                "fecha"            => $qwe[0],
                "nrofactura"       => $qwe[1],
                "tipoventa"        => $qwe[2],
                "descripcion"      => $qwe[3],
                "unidad"           => $qwe[4],
                "categoria"        => $qwe[5],
                "preciobase"       => $qwe[6],
                "preciounitario"   => $qwe[7],
                "cantidad"         => $qwe[8],
                "importe"          => $qwe[9],
                "descuento"        => $qwe[10],
                "totalventa"       => $qwe[11],
                "totalcosto"       => $qwe[12],
                "utilidad"         => $qwe[13],
                "tipopago"         => $qwe[14],
                "idusuario"        => $usuario[0],
                "idsucursal"       => $sucursal[0],
                "almacen"          => $qwe[17],
                "cliente"          => $qwe[18],
                "tipodocumento"    => $tiposDocumentos[$qwe[19]] ?? '',
                "nrodoc"           => $qwe[20],
                "nombrecomercial"  => $qwe[21],
                "canal"            => $qwe[22],
                "tipoprecio"       => $qwe[23],
                "idalmacen"        => $qwe[24],
                "estado"           => $qwe[25],
                "sucursalc"        => $qwe[26],
                "idu"              => $qwe[27],
                "almacenes"        => $arrayid,
                "subcategoria"     => $qwe[28],
                "codigo"           => $qwe[29],
                "codigobarra"      => $qwe[30],
                "idsucursalve"     => $qwe[31],
                "idclienteve"      => $qwe[32]
            );

            $lista[] = $res;
        }

        // Devolver respuesta
        echo json_encode($lista);
    }

    public function reporteventasporproductosglobal($idmd5, $fechainicio, $fechafinal)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $rep = $this->cm->query("SELECT
        v.fecha_venta,
        v.nfactura,
        v.tipo_venta,
        p.descripcion,
        u.nombre,
        COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
        pb.precio,
        dv.precio_unitario,
        dv.cantidad,
        (
            dv.precio_unitario * dv.cantidad
        ) AS importe,
        0 AS descuento,
        (
            dv.precio_unitario * dv.cantidad
        ) AS ventatotal,
        (pb.precio * dv.cantidad) AS costototal,
        (
            dv.precio_unitario * dv.cantidad
        ) -(pb.precio * dv.cantidad) AS utilidad,
        v.tipo_pago,
        v.id_usuario,
        a.idsucursal,
        a.nombre,
        c.nombre,
        c.tipodocumento,
        c.nit,
        c.nombrecomercial,
        cv.canal,
        po.tipo,
        pa.almacen_id_almacen,
        v.estado,
        su.nombre,
        v.id_usuario,
        COALESCE(sca.nombre, '') AS nombre_subcategoria,
        p.codigo,
        p.cod_barras,
        v.idsucursal,
        v.cliente_id_cliente1
    FROM
        detalle_venta dv
    LEFT JOIN venta v ON
        dv.venta_id_venta = v.id_venta
    LEFT JOIN sucursal su ON
        v.idsucursal = su.id_sucursal
    LEFT JOIN productos_almacen pa ON
        dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
    LEFT JOIN almacen a ON
        pa.almacen_id_almacen = a.id_almacen
    LEFT JOIN productos p ON
        pa.productos_id_productos = p.id_productos
    LEFT JOIN precio_base pb ON
        pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen
    LEFT JOIN cliente c ON
        v.cliente_id_cliente1 = c.id_cliente
    LEFT JOIN canalventa cv ON
        v.idcanal = cv.idcanalventa
    LEFT JOIN porcentajes po ON
        dv.categoria = po.id_porcentajes
    LEFT JOIN unidad u ON
        p.unidad_id_unidad = u.id_unidad
    LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
                LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
                LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
    WHERE
        v.fecha_venta BETWEEN '$fechainicio' AND '$fechafinal' AND a.idempresa = '$idempresa' AND pb.estado = 1 AND v.estado = 1
    ORDER BY
        v.id_venta ASC,
        v.fecha_venta ASC");
        $datosjson = $this->verificar->datosExtras();
        $datos = json_decode($datosjson, true);
        $tiposDocumentos = $datos['tiposDocumentos'];
        while ($qwe = $this->cm->fetch($rep)) {
            $usuario = $this->rh->fetch($this->rh->query("SELECT concat(t.nombre, ' ', t.apellido) FROM usuario u LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador WHERE u.idusuario = '$qwe[15]'"));
            $sucursal = $this->em->fetch($this->em->query("select nombre from sucursalcontable where idsucursalcontable='$qwe[16]' limit 0, 1"));
            $res = array("fecha" => $qwe[0], "nrofactura" => $qwe[1], "tipoventa" => $qwe[2], "descripcion" => $qwe[3], "unidad" => $qwe[4], "categoria" => $qwe[5], "preciobase" => $qwe[6], "preciounitario" => $qwe[7], "cantidad" => $qwe[8], "importe" => $qwe[9], "descuento" => $qwe[10], "totalventa" => $qwe[11], "totalcosto" => $qwe[12], "utilidad" => $qwe[13], "tipopago" => $qwe[14], "idusuario" => $usuario[0], "idsucursal" => $sucursal[0], "almacen" => $qwe[17], "cliente" => $qwe[18], "tipodocumento" => array_column($tiposDocumentos, 'descripcion', 'id')[$qwe[19]] ?? '', "nrodoc" => $qwe[20], "nombrecomercial" => $qwe[21], "canal" => $qwe[22], "tipoprecio" => $qwe[23], "idalmacen" => $qwe[24], "estado" => $qwe[25], "sucursalc" => $qwe[26], "idu" => $qwe[27], "subcategoria" => $qwe[28], "codigo" => $qwe[29], "codigobarra" => $qwe[30], "idsucursalve" => $qwe[31], "idclienteve" => $qwe[32]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reporteinvexternoproducto($idmd5)
    {
        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];
        $rep = $this->cm->query("SELECT ie.cliente_id_cliente, ie.id_almacen, ie.id_inv_externo, ie.fecha_control, p.codigo, di.productos_almacen_id_productos_almacen, p.descripcion, di.fechavencimiento, di.cantidad 
        FROM inv_externo ie
        INNER JOIN detalle_invexterno di ON ie.id_inv_externo = di.inv_externo_id_inv_externo
        INNER JOIN productos_almacen pa ON di.productos_almacen_id_productos_almacen = pa.id_productos_almacen
        INNER JOIN productos p ON pa.productos_id_productos = p.id_productos
        INNER JOIN cliente c ON ie.cliente_id_cliente = c.id_cliente
        WHERE ie.id_almacen in ($arrayid) and ie.fecha_control = (SELECT MAX(fecha_control) FROM inv_externo WHERE cliente_id_cliente = c.id_cliente)
        ORDER BY ie.fecha_control ASC, ie.id_inv_externo ASC");
        while ($qwe = $this->cm->fetch($rep)) {
            $res = array("idcliente" => $qwe[0], "idalmacen" => $qwe[1], "idinvexterno" => $qwe[2], "fecha" => $qwe[3], "codigo" => $qwe[4], "idproducto" => $qwe[5], "descripcion" => $qwe[6], "fechavencimiento" => $qwe[7], "cantidad" => $qwe[8]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }

    public function reportecomprasdetalladas($idmd5, $fechai, $fechaf) {
        $arrayid = $this->arrayIDalmacen($idmd5);
        $lista = [];

        // Main query to the 'cm' database
        $rep = $this->cm->query("SELECT
            di.id_detalle_ingreso, di.ingreso_id_ingreso, i.fecha_ingreso, di.precio_unitario, di.cantidad,
            pb.precio, i.tipocompra, p.nombre, p.codigo, p.descripcion, p.cod_barras,
            COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria, COALESCE(sca.nombre, '') AS nombre_subcategoria,
            u.nombre, (di.precio_unitario * di.cantidad) AS importe, (di.precio_unitario * di.cantidad) AS compratotal,
            (pb.precio * di.cantidad) AS costototal, (di.precio_unitario * di.cantidad) -(pb.precio * di.cantidad) AS utilidad,
            a.nombre, pro.nombre, i.nfactura, i.usuario -- Make sure i.usuario is selected
            FROM detalle_ingreso di
            LEFT JOIN ingreso i ON di.ingreso_id_ingreso=i.id_ingreso
            LEFT JOIN proveedor pro ON i.proveedor_id_proveedor=pro.id_proveedor
            LEFT JOIN almacen a ON i.almacen_id_almacen=a.id_almacen
            LEFT JOIN productos_almacen pa ON di.productos_almacen_id_productos_almacen=pa.id_productos_almacen
            LEFT JOIN productos p ON pa.productos_id_productos=p.id_productos
            LEFT JOIN unidad u ON p.unidad_id_unidad = u.id_unidad
            LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
            LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
            LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
            LEFT JOIN precio_base pb ON pa.id_productos_almacen=pb.productos_almacen_id_productos_almacen
            WHERE i.fecha_ingreso BETWEEN '$fechai' AND '$fechaf' AND i.almacen_id_almacen IN ($arrayid) AND pb.estado = 1 AND i.autorizacion = 1
            ORDER BY i.fecha_ingreso ASC");

        while ($qwe = $this->cm->fetch($rep)) {
            $userName = null; // Initialize to null

            // Check if i.usuario (qwe[21]) is not null before querying the 'rh' database
            if ($qwe[21] !== null) {
                // Query the 'rh' database for the user's name
                $userResult = $this->rh->query("SELECT concat(t.nombre, ' ', t.apellido) FROM usuario u LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador WHERE u.idusuario = '" . $qwe[21] . "'");
                
                // Fetch the result from the 'rh' query
                $userData = $this->rh->fetch($userResult);

                // If a user was found, assign their name, otherwise, it remains null
                if ($userData) {
                    $userName = $userData[0];
                }
            }
            
            $res = array(
                "id" => $qwe[0],
                "idingreso" => $qwe[1],
                "fecha" => $qwe[2],
                "precio" => $qwe[3],
                "cantidad" => $qwe[4],
                "costounitario" => $qwe[5],
                "tipocompra" => $qwe[6],
                "producto" => $qwe[7],
                "codigo" => $qwe[8],
                "descripcion" => $qwe[9],
                "codigobarra" => $qwe[10],
                "categoria" => $qwe[11],
                "subcategoria" => $qwe[12],
                "unidad" => $qwe[13],
                "importe" => $qwe[14],
                "compratotal" => $qwe[15],
                "costototal" => $qwe[16],
                "utilidad" => $qwe[17],
                "almacen" => $qwe[18],
                "proveedor" => $qwe[19],
                "nfactura" => $qwe[20],
                "usuario" => $userName // Use the potentially null user name
            );
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function reporteGestion($idmd5, $fechai, $tiempo)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        $lista = [];
        $sql = "SELECT 
                DATE_FORMAT(v.fecha_venta, '%Y-%m-%d') AS gestion,
                COUNT(DISTINCT v.id_venta) AS cantidad_ventas,
                SUM(v.monto_total) AS total_ventas
                FROM (
                SELECT DISTINCT v.id_venta, v.fecha_venta, v.monto_total
                FROM venta v
                INNER JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
                INNER JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                WHERE a.idempresa = 74
                     AND YEAR(v.fecha_venta) = YEAR(DATE_SUB('2025-04-04', INTERVAL 1 YEAR))
                    -- AND DATE_FORMAT(v.fecha_venta, '%Y-%m') = DATE_FORMAT(DATE_SUB('2025-04-04', INTERVAL 1 MONTH), '%Y-%m')
                    -- AND DATE(v.fecha_venta) = DATE_SUB('2025-04-04', INTERVAL 1 DAY)
                ) AS v
                GROUP BY gestion
                ORDER BY gestion;";
        
        echo json_encode($lista);
    }

    public function calcularCrecimiento($fechaReferencia, $tipo = 'a', $idmd5)
    {
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);

        // Validar el tipo de periodo
        $validTypes = ['a', 'm', 'd'];
        if (!in_array($tipo, $validTypes)) {
            echo json_encode(['error' => 'Tipo inválido. Usa: a (año), m (mes) o d (día)']);
            return;
        }

        try {
            // Definir intervalos compatibles con DateTime
            $intervalos = [
                'a' => 'year',
                'm' => 'month',
                'd' => 'day'
            ];

            // Preparar formatos y condiciones según tipo
            $fecha = new DateTime($fechaReferencia);
            $formato = '';
            $condicion = '';

            if ($tipo === 'a') {
                $formato = 'Y';
                $condicion = "YEAR(v.fecha_venta)";
            } elseif ($tipo === 'm') {
                $formato = 'Y-m';
                $condicion = "DATE_FORMAT(v.fecha_venta, '%Y-%m')";
            } elseif ($tipo === 'd') {
                $formato = 'Y-m-d';
                $condicion = "DATE(v.fecha_venta)";
            }

            $periodoActual = $fecha->format($formato);
            $fechaAnterior = clone $fecha;
            $fechaAnterior->modify("-1 {$intervalos[$tipo]}");
            $periodoAnterior = $fechaAnterior->format($formato);

            $sql = "SELECT
                        SUM(CASE WHEN $condicion = '$periodoActual' THEN v.monto_total ELSE 0 END) AS total_actual,
                        SUM(CASE WHEN $condicion = '$periodoAnterior' THEN v.monto_total ELSE 0 END) AS total_anterior,
                        ROUND(
                            (SUM(CASE WHEN $condicion = '$periodoActual' THEN v.monto_total ELSE 0 END) -
                            SUM(CASE WHEN $condicion = '$periodoAnterior' THEN v.monto_total ELSE 0 END)) /
                            NULLIF(SUM(CASE WHEN $condicion = '$periodoAnterior' THEN v.monto_total ELSE 0 END), 0) * 100, 2
                        ) AS indice_crecimiento
                    FROM (
                        SELECT DISTINCT v.id_venta, v.fecha_venta, v.monto_total
                        FROM venta v
                        INNER JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
                        INNER JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
                        INNER JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
                        WHERE a.idempresa = '$idempresa'
                            AND $condicion IN ('$periodoActual', '$periodoAnterior')
                    ) AS v";

            $rep = $this->cm->query($sql);

            if ($this->cm->rows($rep) > 0) {
                $qwe = $this->cm->fetch($rep);
                $resultado = [
                    "total_actual" => $qwe['total_actual'],
                    "total_anterior" => $qwe['total_anterior'],
                    "indice_crecimiento" => is_null($qwe['indice_crecimiento']) ? 0 : $qwe['indice_crecimiento']
                ];
                echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['error' => 'No se encontraron datos']);
            }

        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function calcularTotalIngreso($idingreso){
        $sql = 'SELECT SUM(di.cantidad * di.precio_unitario) AS monto FROM detalle_ingreso di WHERE di.ingreso_id_ingreso = ?';

        $stmt = $this->cm->prepare($sql);
        if ($stmt === false) {
            $res=array("estado" => "error", "mensaje" => "Error al intentar obtener monto total");
            return;
        }
    
        $stmt->bind_param("i", $idingreso);
        $stmt->execute();
        $stmt->bind_result($monto);
        $stmt->fetch();
        $stmt->close();
    
        echo json_encode($monto);
    }
    
}
//clienteDisplay