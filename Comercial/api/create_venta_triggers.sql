-- create_venta_triggers.sql
DELIMITER //

-- Trigger para INSERT
CREATE TRIGGER tr_venta_after_insert
AFTER INSERT ON venta
FOR EACH ROW
BEGIN
    INSERT INTO log_eventos (
        accion,
        tabla_afectada,
        id_usuario,
        fecha_evento,
        hora_evento,
        observaciones,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        'INSERT',
        'venta',
        NEW.id_usuario,
        CURDATE(),
        CURTIME(),
        CONCAT('Nueva venta registrada con ID: ', NEW.id_venta),
        NULL,
        JSON_OBJECT(
            'id_venta', NEW.id_venta,
            'fecha_venta', NEW.fecha_venta,
            'tipo_venta', NEW.tipo_venta,
            'monto_total', NEW.monto_total,
            'descuento', NEW.descuento,
            'tipo_pago', NEW.tipo_pago,
            'cliente_id_cliente1', NEW.cliente_id_cliente1,
            'divisas_id_divisas', NEW.divisas_id_divisas,
            'id_usuario', NEW.id_usuario,
            'nfactura', NEW.nfactura,
            'idsucursal', NEW.idsucursal,
            'idcampaña', NEW.idcampaña,
            'nroventa', NEW.nroventa,
            'estado', NEW.estado,
            'idcanal', NEW.idcanal,
            'codigoventa', NEW.codigoventa
        )
    );
END;
//

-- Trigger para UPDATE
CREATE TRIGGER tr_venta_after_update
AFTER UPDATE ON venta
FOR EACH ROW
BEGIN
    INSERT INTO log_eventos (
        accion,
        tabla_afectada,
        id_usuario,
        fecha_evento,
        hora_evento,
        observaciones,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        'UPDATE',
        'venta',
        NEW.id_usuario,
        CURDATE(),
        CURTIME(),
        CONCAT('Venta actualizada con ID: ', OLD.id_venta),
        JSON_OBJECT(
            'id_venta', OLD.id_venta,
            'fecha_venta', OLD.fecha_venta,
            'tipo_venta', OLD.tipo_venta,
            'monto_total', OLD.monto_total,
            'descuento', OLD.descuento,
            'tipo_pago', OLD.tipo_pago,
            'cliente_id_cliente1', OLD.cliente_id_cliente1,
            'divisas_id_divisas', OLD.divisas_id_divisas,
            'id_usuario', OLD.id_usuario,
            'nfactura', OLD.nfactura,
            'idsucursal', OLD.idsucursal,
            'idcampaña', OLD.idcampaña,
            'nroventa', OLD.nroventa,
            'estado', OLD.estado,
            'idcanal', OLD.idcanal,
            'codigoventa', OLD.codigoventa
        ),
        JSON_OBJECT(
            'id_venta', NEW.id_venta,
            'fecha_venta', NEW.fecha_venta,
            'tipo_venta', NEW.tipo_venta,
            'monto_total', NEW.monto_total,
            'descuento', NEW.descuento,
            'tipo_pago', NEW.tipo_pago,
            'cliente_id_cliente1', NEW.cliente_id_cliente1,
            'divisas_id_divisas', NEW.divisas_id_divisas,
            'id_usuario', NEW.id_usuario,
            'nfactura', NEW.nfactura,
            'idsucursal', NEW.idsucursal,
            'idcampaña', NEW.idcampaña,
            'nroventa', NEW.nroventa,
            'estado', NEW.estado,
            'idcanal', NEW.idcanal,
            'codigoventa', NEW.codigoventa
        )
    );
END;
//

-- Trigger para DELETE
CREATE TRIGGER tr_venta_after_delete
AFTER DELETE ON venta
FOR EACH ROW
BEGIN
    INSERT INTO log_eventos (
        accion,
        tabla_afectada,
        id_usuario,
        fecha_evento,
        hora_evento,
        observaciones,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        'DELETE',
        'venta',
        OLD.id_usuario,
        CURDATE(),
        CURTIME(),
        CONCAT('Venta eliminada con ID: ', OLD.id_venta),
        JSON_OBJECT(
            'id_venta', OLD.id_venta,
            'fecha_venta', OLD.fecha_venta,
            'tipo_venta', OLD.tipo_venta,
            'monto_total', OLD.monto_total,
            'descuento', OLD.descuento,
            'tipo_pago', OLD.tipo_pago,
            'cliente_id_cliente1', OLD.cliente_id_cliente1,
            'divisas_id_divisas', OLD.divisas_id_divisas,
            'id_usuario', OLD.id_usuario,
            'nfactura', OLD.nfactura,
            'idsucursal', OLD.idsucursal,
            'idcampaña', OLD.idcampaña,
            'nroventa', OLD.nroventa,
            'estado', OLD.estado,
            'idcanal', OLD.idcanal,
            'codigoventa', OLD.codigoventa
        ),
        NULL
    );
END;
//

DELIMITER ;