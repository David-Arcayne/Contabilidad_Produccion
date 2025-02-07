let reporte = [
    {   
        idlote:'',
        fecha_lote:'',
        hora_lote:'',
        nombre_lote:'',
        estado:'',
        fecha_entrega:'',
        hora_entrega:'',
        rubro_idrubro:'',
        empleado_idempleado:'',
        produccion:{
            idproduccion:'',
            estado:'',
            lote_idlote:'',
            orden_produccion:{
                idorden_produccion:'',
                fecha_orp:'',
                hora_orp:'',
                estado:'',
                empleado_idempleado:'',
                detalle_producion: [
                    {
                        iddetalle_produccion:'',
                        cantidad:'',
                        observaciones:'',
                        orden_produccion_idorden_produccion:'',
                        producto_idproducto:'',
                        costo:'x'
                    },
                    {
                        iddetalle_produccion:'',
                        cantidad:'',
                        observaciones:'',
                        orden_produccion_idorden_produccion:'',
                        producto_idproducto:'',
                        costo:'x'
                    },
                    {
                        iddetalle_produccion:'',
                        cantidad:'',
                        observaciones:'',
                        orden_produccion_idorden_produccion:'',
                        producto_idproducto:'',
                        costo:'x'
                    }
                ]
            },
            produccion_etapa:[
                {
                    idproduccion_etapa:'',
                    fecha_pe:'',
                    hora_pe:'',
                    fecha_fin:'',
                    hora_fin:'',
                    estado:'',
                    produccion_idproduccion:'',
                    etapas_produccion_idetapas_produccion:'',
                    empleado_idempleado:'',
                    grupo_etapas_idgrupo_etapas:'',
                },
                {
                    idproduccion_etapa:'',
                    fecha_pe:'',
                    hora_pe:'',
                    fecha_fin:'',
                    hora_fin:'',
                    estado:'',
                    produccion_idproduccion:'',
                    etapas_produccion_idetapas_produccion:'',
                    empleado_idempleado:'',
                    grupo_etapas_idgrupo_etapas:'',
                },
                {
                    idproduccion_etapa:'',
                    fecha_pe:'',
                    hora_pe:'',
                    fecha_fin:'',
                    hora_fin:'',
                    estado:'',
                    produccion_idproduccion:'',
                    etapas_produccion_idetapas_produccion:'',
                    empleado_idempleado:'',
                    grupo_etapas_idgrupo_etapas:'',
                }
            ],
            salida_produccion:[
                {
                    idsalida_produccion:'',
                    cantidad:'',
                    produccion_idproduccion:'',
                    producto_idproducto:'',
                    costo: 'x',

                },
                {
                    idsalida_produccion:'',
                    cantidad:'',
                    produccion_idproduccion:'',
                    producto_idproducto:'',
                    costo: 'x',

                },
                {
                    idsalida_produccion:'',
                    cantidad:'',
                    produccion_idproduccion:'',
                    producto_idproducto:'',
                    costo: 'x',

                }
            
               
            ],
            solicitud_material:{
                idsolicitud_material:'',
                fecha:'',
                hora:'',
                estado:'',
                empleado_idempleado:'',
                produccion_idproduccion:'',
                detalle_solicitud_material:[
                    {
                        iddetalle_solicitud_material:'',
                        cantidad:'',
                        observaciones:'',
                        solicitud_material_idsolicitud_material:'',
                        material_idmaterial:'',
                        costo: 'x'
                    },
                    {
                        iddetalle_solicitud_material:'',
                        cantidad:'',
                        observaciones:'',
                        solicitud_material_idsolicitud_material:'',
                        material_idmaterial:'',
                        costo: 'x'
                    },
                    {
                        iddetalle_solicitud_material:'',
                        cantidad:'',
                        observaciones:'',
                        solicitud_material_idsolicitud_material:'',
                        material_idmaterial:'',
                        costo: 'x'
                    },
                ]
            }

        }

        
    },
    {   
        idlote:'',
        fecha_lote:'',
        hora_lote:'',
        nombre_lote:'',
        estado:'',
        fecha_entrega:'',
        hora_entrega:'',
        rubro_idrubro:'',
        empleado_idempleado:'',
        produccion:{
            idproduccion:'',
            estado:'',
            lote_idlote:'',
            orden_produccion:{
                idorden_produccion:'',
                fecha_orp:'',
                hora_orp:'',
                estado:'',
                empleado_idempleado:'',
                detalle_producion: [
                    {
                        iddetalle_produccion:'',
                        cantidad:'',
                        observaciones:'',
                        orden_produccion_idorden_produccion:'',
                        producto_idproducto:'',
                        costo:'x'
                    },
                    {
                        iddetalle_produccion:'',
                        cantidad:'',
                        observaciones:'',
                        orden_produccion_idorden_produccion:'',
                        producto_idproducto:'',
                        costo:'x'
                    },
                    {
                        iddetalle_produccion:'',
                        cantidad:'',
                        observaciones:'',
                        orden_produccion_idorden_produccion:'',
                        producto_idproducto:'',
                        costo:'x'
                    }
                ]
            },
            produccion_etapa:[
                {
                    idproduccion_etapa:'',
                    fecha_pe:'',
                    hora_pe:'',
                    fecha_fin:'',
                    hora_fin:'',
                    estado:'',
                    produccion_idproduccion:'',
                    etapas_produccion_idetapas_produccion:'',
                    empleado_idempleado:'',
                    grupo_etapas_idgrupo_etapas:'',
                },
                {
                    idproduccion_etapa:'',
                    fecha_pe:'',
                    hora_pe:'',
                    fecha_fin:'',
                    hora_fin:'',
                    estado:'',
                    produccion_idproduccion:'',
                    etapas_produccion_idetapas_produccion:'',
                    empleado_idempleado:'',
                    grupo_etapas_idgrupo_etapas:'',
                },
                {
                    idproduccion_etapa:'',
                    fecha_pe:'',
                    hora_pe:'',
                    fecha_fin:'',
                    hora_fin:'',
                    estado:'',
                    produccion_idproduccion:'',
                    etapas_produccion_idetapas_produccion:'',
                    empleado_idempleado:'',
                    grupo_etapas_idgrupo_etapas:'',
                }
            ],
            salida_produccion:[
                {
                    idsalida_produccion:'',
                    cantidad:'',
                    produccion_idproduccion:'',
                    producto_idproducto:'',
                    costo: 'x',

                },
                {
                    idsalida_produccion:'',
                    cantidad:'',
                    produccion_idproduccion:'',
                    producto_idproducto:'',
                    costo: 'x',

                },
                {
                    idsalida_produccion:'',
                    cantidad:'',
                    produccion_idproduccion:'',
                    producto_idproducto:'',
                    costo: 'x',

                }
            
               
            ],
            solicitud_material:{
                idsolicitud_material:'',
                fecha:'',
                hora:'',
                estado:'',
                empleado_idempleado:'',
                produccion_idproduccion:'',
                detalle_solicitud_material:[
                    {
                        iddetalle_solicitud_material:'',
                        cantidad:'',
                        observaciones:'',
                        solicitud_material_idsolicitud_material:'',
                        material_idmaterial:'',
                        costo: 'x'
                    },
                    {
                        iddetalle_solicitud_material:'',
                        cantidad:'',
                        observaciones:'',
                        solicitud_material_idsolicitud_material:'',
                        material_idmaterial:'',
                        costo: 'x'
                    },
                    {
                        iddetalle_solicitud_material:'',
                        cantidad:'',
                        observaciones:'',
                        solicitud_material_idsolicitud_material:'',
                        material_idmaterial:'',
                        costo: 'x'
                    },
                ]
            }
        }

        
    },
]
