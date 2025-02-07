let a = {
    "idlote": "1",
    "fecha_lote": "2024-12-12",
    "hora_lote": "17:37:48",
    "lote": "Lote_Produccion-2024-12-12-1",
    "estado": "2",
    "fecha_entrega": "2024-12-12",
    "hora_entrega": "17:37:00",
    "rubro_idrubro": "5",
    "empleado_idempleado": "86",
    "produccion": [
        {
            "idproduccion": "1",
            "estado": "2",
            "lote_idlote": "1",
            "orden_produccion": [
                {
                    "idorden_produccion": "1",
                    "fecha_orp": "2024-12-12",
                    "hora_orp": "17:37:17",
                    "estado": "1",
                    "empleado_idempleado": "86",
                    "detalle_produccion": [
                        {
                            "iddetalle_produccion": "1",
                            "cantidad": "32",
                            "observaciones": "detalle ",
                            "orden_produccion_idorden_produccion": "1",
                            "producto_idproducto": "270",
                            "costo": 13445619.84
                        },
                        {
                            "iddetalle_produccion": "2",
                            "cantidad": "23",
                            "observaciones": "detalle",
                            "orden_produccion_idorden_produccion": "1",
                            "producto_idproducto": "258",
                            "costo": 4140
                        },
                        {
                            "iddetalle_produccion": "3",
                            "cantidad": "12",
                            "observaciones": "detalle",
                            "orden_produccion_idorden_produccion": "1",
                            "producto_idproducto": "249",
                            "costo": 256
                        }
                    ]
                }
            ]
        }
    ]
}




let b = [
    {
        "idlote": "1",
        "fecha_lote": "2024-12-12",
        "hora_lote": "17:37:48",
        "lote": "Lote_Produccion-2024-12-12-1",
        "estado": "2",
        "fecha_entrega": "2024-12-12",
        "hora_entrega": "17:37:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "1",
                "estado": "2",
                "lote_idlote": "1",
                "orden_produccion": [
                    {
                        "idorden_produccion": "1",
                        "fecha_orp": "2024-12-12",
                        "hora_orp": "17:37:17",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "1",
                                "cantidad": "32",
                                "observaciones": "detalle ",
                                "orden_produccion_idorden_produccion": "1",
                                "producto_idproducto": "270",
                                "costo": 38.400000000000006
                            },
                            {
                                "iddetalle_produccion": "2",
                                "cantidad": "23",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "1",
                                "producto_idproducto": "258",
                                "costo": 65.71428571428571
                            },
                            {
                                "iddetalle_produccion": "3",
                                "cantidad": "12",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "1",
                                "producto_idproducto": "249",
                                "costo": 96
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "1",
                        "fecha_pe": "2024-12-12",
                        "hora_pe": "18:20:00",
                        "fecha_fin": "2024-12-12",
                        "hora_fin": "18:35:30",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "1",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "2",
                        "fecha_pe": "2024-12-12",
                        "hora_pe": "18:20:00",
                        "fecha_fin": "2024-12-12",
                        "hora_fin": "18:35:34",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "2",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "3",
                        "fecha_pe": "2024-12-12",
                        "hora_pe": "18:26:00",
                        "fecha_fin": "2024-12-12",
                        "hora_fin": "18:35:38",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "6",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "4",
                        "fecha_pe": "2024-12-12",
                        "hora_pe": "18:26:00",
                        "fecha_fin": "2024-12-12",
                        "hora_fin": "18:35:44",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "5",
                        "fecha_pe": "2024-12-12",
                        "hora_pe": "18:35:00",
                        "fecha_fin": "2024-12-12",
                        "hora_fin": "18:35:49",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "5",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "6",
                        "fecha_pe": "2024-12-12",
                        "hora_pe": "18:35:00",
                        "fecha_fin": "2024-12-12",
                        "hora_fin": "18:35:54",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "7",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "11:11:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "11:11:33",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    },
                    {
                        "idproduccion_etapa": "8",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "11:11:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "11:11:28",
                        "estado": "1",
                        "produccion_idproduccion": "1",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "1",
                        "cantidad": "32",
                        "produccion_idproduccion": "1",
                        "producto_idproducto": "270",
                        "costo": 38.400000000000006
                    },
                    {
                        "idsalida_produccion": "2",
                        "cantidad": "23",
                        "produccion_idproduccion": "1",
                        "producto_idproducto": "258",
                        "costo": 65.71428571428571
                    },
                    {
                        "idsalida_produccion": "3",
                        "cantidad": "12",
                        "produccion_idproduccion": "1",
                        "producto_idproducto": "249",
                        "costo": 96
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "1",
                        "fecha": "2024-12-12",
                        "hora": "17:38:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "1",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "1",
                                "cantidad": "16.32",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "1",
                                "material_idmaterial": "34",
                                "costo": 163.2
                            },
                            {
                                "iddetalle_solicitud_material": "2",
                                "cantidad": "28.8",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "1",
                                "material_idmaterial": "42",
                                "costo": 288
                            },
                            {
                                "iddetalle_solicitud_material": "3",
                                "cantidad": "19.2",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "1",
                                "material_idmaterial": "46",
                                "costo": 192
                            },
                            {
                                "iddetalle_solicitud_material": "4",
                                "cantidad": "69",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "1",
                                "material_idmaterial": "59",
                                "costo": 690
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "2",
        "fecha_lote": "2024-12-13",
        "hora_lote": "15:03:59",
        "lote": "Lote_Produccion-2024-12-13-2",
        "estado": "2",
        "fecha_entrega": "2024-12-13",
        "hora_entrega": "15:03:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "2",
                "estado": "2",
                "lote_idlote": "2",
                "orden_produccion": [
                    {
                        "idorden_produccion": "2",
                        "fecha_orp": "2024-12-13",
                        "hora_orp": "15:03:49",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "4",
                                "cantidad": "2",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "2",
                                "producto_idproducto": "270",
                                "costo": 2.4000000000000004
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "9",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "15:06:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "15:07:01",
                        "estado": "1",
                        "produccion_idproduccion": "2",
                        "etapas_produccion_idetapas_produccion": "1",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "10",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "15:06:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "15:07:05",
                        "estado": "1",
                        "produccion_idproduccion": "2",
                        "etapas_produccion_idetapas_produccion": "2",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "11",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "15:06:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "15:07:10",
                        "estado": "1",
                        "produccion_idproduccion": "2",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "12",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "15:06:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "15:07:15",
                        "estado": "1",
                        "produccion_idproduccion": "2",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "13",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "15:06:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "15:07:21",
                        "estado": "1",
                        "produccion_idproduccion": "2",
                        "etapas_produccion_idetapas_produccion": "5",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "14",
                        "fecha_pe": "2024-12-13",
                        "hora_pe": "15:06:00",
                        "fecha_fin": "2024-12-13",
                        "hora_fin": "15:07:31",
                        "estado": "1",
                        "produccion_idproduccion": "2",
                        "etapas_produccion_idetapas_produccion": "6",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "4",
                        "cantidad": "2",
                        "produccion_idproduccion": "2",
                        "producto_idproducto": "270",
                        "costo": 2.4000000000000004
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "2",
                        "fecha": "2024-12-13",
                        "hora": "15:05:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "2",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "5",
                                "cantidad": "1.02",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "2",
                                "material_idmaterial": "34",
                                "costo": 10.2
                            },
                            {
                                "iddetalle_solicitud_material": "6",
                                "cantidad": "1.8",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "2",
                                "material_idmaterial": "42",
                                "costo": 18
                            },
                            {
                                "iddetalle_solicitud_material": "7",
                                "cantidad": "1.2",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "2",
                                "material_idmaterial": "46",
                                "costo": 12
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "3",
        "fecha_lote": "2024-12-16",
        "hora_lote": "10:47:24",
        "lote": "Lote_Produccion-2024-12-16-3",
        "estado": "2",
        "fecha_entrega": "2024-12-16",
        "hora_entrega": "10:47:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "3",
                "estado": "2",
                "lote_idlote": "3",
                "orden_produccion": [
                    {
                        "idorden_produccion": "4",
                        "fecha_orp": "2024-12-16",
                        "hora_orp": "10:46:55",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "6",
                                "cantidad": "7",
                                "observaciones": "ninguno\r\n",
                                "orden_produccion_idorden_produccion": "4",
                                "producto_idproducto": "255",
                                "costo": 18.26086956521739
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "15",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "10:51:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "10:51:49",
                        "estado": "1",
                        "produccion_idproduccion": "3",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    },
                    {
                        "idproduccion_etapa": "16",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "10:51:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "10:51:55",
                        "estado": "1",
                        "produccion_idproduccion": "3",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "5",
                        "cantidad": "7",
                        "produccion_idproduccion": "3",
                        "producto_idproducto": "255",
                        "costo": 18.26086956521739
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "3",
                        "fecha": "2024-12-16",
                        "hora": "10:49:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "3",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "8",
                                "cantidad": "3.04",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "3",
                                "material_idmaterial": "34",
                                "costo": 30.4
                            },
                            {
                                "iddetalle_solicitud_material": "9",
                                "cantidad": "7",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "3",
                                "material_idmaterial": "46",
                                "costo": 70
                            },
                            {
                                "iddetalle_solicitud_material": "10",
                                "cantidad": "9.13",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "3",
                                "material_idmaterial": "58",
                                "costo": 91.30000000000001
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "4",
        "fecha_lote": "2024-12-16",
        "hora_lote": "16:20:49",
        "lote": "Lote_Produccion-2024-12-16-4",
        "estado": "2",
        "fecha_entrega": "2024-12-16",
        "hora_entrega": "16:20:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "4",
                "estado": "2",
                "lote_idlote": "4",
                "orden_produccion": [
                    {
                        "idorden_produccion": "5",
                        "fecha_orp": "2024-12-16",
                        "hora_orp": "16:20:16",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "7",
                                "cantidad": "12",
                                "observaciones": "detallle",
                                "orden_produccion_idorden_produccion": "5",
                                "producto_idproducto": "270",
                                "costo": 14.399999999999999
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "17",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "16:30:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "16:31:13",
                        "estado": "1",
                        "produccion_idproduccion": "4",
                        "etapas_produccion_idetapas_produccion": "1",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "18",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "16:30:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "16:31:23",
                        "estado": "1",
                        "produccion_idproduccion": "4",
                        "etapas_produccion_idetapas_produccion": "2",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "19",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "16:30:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "16:31:29",
                        "estado": "1",
                        "produccion_idproduccion": "4",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "20",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "16:30:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "16:31:36",
                        "estado": "1",
                        "produccion_idproduccion": "4",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "21",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "16:30:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "16:31:43",
                        "estado": "1",
                        "produccion_idproduccion": "4",
                        "etapas_produccion_idetapas_produccion": "5",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "22",
                        "fecha_pe": "2024-12-16",
                        "hora_pe": "16:31:00",
                        "fecha_fin": "2024-12-16",
                        "hora_fin": "16:31:49",
                        "estado": "1",
                        "produccion_idproduccion": "4",
                        "etapas_produccion_idetapas_produccion": "6",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "6",
                        "cantidad": "12",
                        "produccion_idproduccion": "4",
                        "producto_idproducto": "270",
                        "costo": 14.399999999999999
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "4",
                        "fecha": "2024-12-16",
                        "hora": "16:21:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "4",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "11",
                                "cantidad": "0.6",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "4",
                                "material_idmaterial": "34",
                                "costo": 6
                            },
                            {
                                "iddetalle_solicitud_material": "13",
                                "cantidad": "0.48",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "4",
                                "material_idmaterial": "46",
                                "costo": 4.8
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "5",
        "fecha_lote": "2024-12-18",
        "hora_lote": "15:20:02",
        "lote": "Lote_Produccion-2024-12-18-5",
        "estado": "2",
        "fecha_entrega": "2024-12-18",
        "hora_entrega": "15:20:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "5",
                "estado": "2",
                "lote_idlote": "5",
                "orden_produccion": [
                    {
                        "idorden_produccion": "3",
                        "fecha_orp": "2024-12-13",
                        "hora_orp": "17:30:05",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "5",
                                "cantidad": "12",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "3",
                                "producto_idproducto": "270",
                                "costo": 14.399999999999999
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "23",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "15:22:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "15:22:47",
                        "estado": "1",
                        "produccion_idproduccion": "5",
                        "etapas_produccion_idetapas_produccion": "1",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "24",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "15:22:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "15:22:50",
                        "estado": "1",
                        "produccion_idproduccion": "5",
                        "etapas_produccion_idetapas_produccion": "2",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "25",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "15:22:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "15:22:55",
                        "estado": "1",
                        "produccion_idproduccion": "5",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "26",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "15:22:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "15:23:00",
                        "estado": "1",
                        "produccion_idproduccion": "5",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "27",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "15:22:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "15:23:17",
                        "estado": "1",
                        "produccion_idproduccion": "5",
                        "etapas_produccion_idetapas_produccion": "5",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "28",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "15:22:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "15:23:09",
                        "estado": "1",
                        "produccion_idproduccion": "5",
                        "etapas_produccion_idetapas_produccion": "6",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "7",
                        "cantidad": "10",
                        "produccion_idproduccion": "5",
                        "producto_idproducto": "270",
                        "costo": 12
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "5",
                        "fecha": "2024-12-18",
                        "hora": "15:20:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "5",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "14",
                                "cantidad": "0.48",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "5",
                                "material_idmaterial": "34",
                                "costo": 4.8
                            },
                            {
                                "iddetalle_solicitud_material": "15",
                                "cantidad": "0.48",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "5",
                                "material_idmaterial": "42",
                                "costo": 4.8
                            },
                            {
                                "iddetalle_solicitud_material": "16",
                                "cantidad": "0.48",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "5",
                                "material_idmaterial": "46",
                                "costo": 4.8
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "6",
        "fecha_lote": "2024-12-18",
        "hora_lote": "16:04:40",
        "lote": "Lote_Produccion-2024-12-18-6",
        "estado": "1",
        "fecha_entrega": "2024-12-18",
        "hora_entrega": "16:04:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "6",
                "estado": "2",
                "lote_idlote": "6",
                "orden_produccion": [
                    {
                        "idorden_produccion": "6",
                        "fecha_orp": "2024-12-18",
                        "hora_orp": "16:04:28",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "8",
                                "cantidad": "4",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "6",
                                "producto_idproducto": "254",
                                "costo": 0
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "29",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "16:06:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "16:06:10",
                        "estado": "1",
                        "produccion_idproduccion": "6",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    },
                    {
                        "idproduccion_etapa": "30",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "16:06:00",
                        "fecha_fin": "2024-12-18",
                        "hora_fin": "16:06:14",
                        "estado": "1",
                        "produccion_idproduccion": "6",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "9",
                        "cantidad": "6",
                        "produccion_idproduccion": "6",
                        "producto_idproducto": "254",
                        "costo": 0
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "6",
                        "fecha": "2024-12-18",
                        "hora": "16:05:00",
                        "estado": "-1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "6",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "17",
                                "cantidad": "0.35",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "6",
                                "material_idmaterial": "39",
                                "costo": 0
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "7",
        "fecha_lote": "2024-12-19",
        "hora_lote": "16:22:55",
        "lote": "Lote_Produccion-2024-12-19-7",
        "estado": "1",
        "fecha_entrega": "2024-12-19",
        "hora_entrega": "16:22:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "7",
                "estado": "2",
                "lote_idlote": "7",
                "orden_produccion": [
                    {
                        "idorden_produccion": "8",
                        "fecha_orp": "2024-12-19",
                        "hora_orp": "16:22:43",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "11",
                                "cantidad": "12",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "8",
                                "producto_idproducto": "268",
                                "costo": 20
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "31",
                        "fecha_pe": "2024-12-19",
                        "hora_pe": "16:24:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:27:10",
                        "estado": "1",
                        "produccion_idproduccion": "7",
                        "etapas_produccion_idetapas_produccion": "1",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "32",
                        "fecha_pe": "2024-12-19",
                        "hora_pe": "16:24:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:27:14",
                        "estado": "1",
                        "produccion_idproduccion": "7",
                        "etapas_produccion_idetapas_produccion": "2",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "33",
                        "fecha_pe": "2024-12-19",
                        "hora_pe": "16:24:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:27:18",
                        "estado": "1",
                        "produccion_idproduccion": "7",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "34",
                        "fecha_pe": "2024-12-19",
                        "hora_pe": "16:24:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:27:23",
                        "estado": "1",
                        "produccion_idproduccion": "7",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "35",
                        "fecha_pe": "2024-12-19",
                        "hora_pe": "16:24:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:27:28",
                        "estado": "1",
                        "produccion_idproduccion": "7",
                        "etapas_produccion_idetapas_produccion": "5",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    },
                    {
                        "idproduccion_etapa": "36",
                        "fecha_pe": "2024-12-19",
                        "hora_pe": "16:24:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:27:32",
                        "estado": "1",
                        "produccion_idproduccion": "7",
                        "etapas_produccion_idetapas_produccion": "6",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "1"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "10",
                        "cantidad": "14",
                        "produccion_idproduccion": "7",
                        "producto_idproducto": "268",
                        "costo": 23.333333333333336
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "7",
                        "fecha": "2024-12-19",
                        "hora": "16:23:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "7",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "18",
                                "cantidad": "2",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "7",
                                "material_idmaterial": "34",
                                "costo": 20
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "8",
        "fecha_lote": "2024-12-19",
        "hora_lote": "16:26:34",
        "lote": "Lote_Produccion-2024-12-19-8",
        "estado": "2",
        "fecha_entrega": "2024-12-19",
        "hora_entrega": "16:26:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "8",
                "estado": "2",
                "lote_idlote": "8",
                "orden_produccion": [
                    {
                        "idorden_produccion": "9",
                        "fecha_orp": "2024-12-19",
                        "hora_orp": "16:26:25",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "12",
                                "cantidad": "23",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "9",
                                "producto_idproducto": "254",
                                "costo": 0
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "37",
                        "fecha_pe": "2024-12-05",
                        "hora_pe": "16:30:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:31:06",
                        "estado": "1",
                        "produccion_idproduccion": "8",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    },
                    {
                        "idproduccion_etapa": "38",
                        "fecha_pe": "2024-12-18",
                        "hora_pe": "16:30:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "16:31:10",
                        "estado": "1",
                        "produccion_idproduccion": "8",
                        "etapas_produccion_idetapas_produccion": "3",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    }
                ],
                "salida_produccion": [
                    {
                        "idsalida_produccion": "11",
                        "cantidad": "17",
                        "produccion_idproduccion": "8",
                        "producto_idproducto": "254",
                        "costo": 0
                    }
                ],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "8",
                        "fecha": "2024-12-19",
                        "hora": "16:29:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "8",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "19",
                                "cantidad": "2",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "8",
                                "material_idmaterial": "39",
                                "costo": 0
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "idlote": "9",
        "fecha_lote": "2024-12-19",
        "hora_lote": "17:06:07",
        "lote": "Lote_Produccion-2024-12-19-9",
        "estado": "0",
        "fecha_entrega": "2024-12-19",
        "hora_entrega": "17:06:00",
        "rubro_idrubro": "5",
        "empleado_idempleado": "86",
        "produccion": [
            {
                "idproduccion": "9",
                "estado": "0",
                "lote_idlote": "9",
                "orden_produccion": [
                    {
                        "idorden_produccion": "10",
                        "fecha_orp": "2024-12-19",
                        "hora_orp": "17:05:53",
                        "estado": "1",
                        "empleado_idempleado": "86",
                        "detalle_produccion": [
                            {
                                "iddetalle_produccion": "13",
                                "cantidad": "12",
                                "observaciones": "detalle",
                                "orden_produccion_idorden_produccion": "10",
                                "producto_idproducto": "254",
                                "costo": 0
                            }
                        ]
                    }
                ],
                "produccion_etapa": [
                    {
                        "idproduccion_etapa": "39",
                        "fecha_pe": "2024-12-19",
                        "hora_pe": "17:07:00",
                        "fecha_fin": "2024-12-19",
                        "hora_fin": "17:07:29",
                        "estado": "0",
                        "produccion_idproduccion": "9",
                        "etapas_produccion_idetapas_produccion": "4",
                        "empleado_idempleado": "86",
                        "grupo_etapas_idgrupo_etapas": "2"
                    }
                ],
                "salida_produccion": [],
                "solicitud_material": [
                    {
                        "idsolicitud_material": "9",
                        "fecha": "2024-12-19",
                        "hora": "17:06:00",
                        "estado": "1",
                        "empresa_idempresa": "50",
                        "empleado_idempleado": "86",
                        "produccion_idproduccion": "9",
                        "detalle_solicitud_material": [
                            {
                                "iddetalle_solicitud_material": "20",
                                "cantidad": "1.04",
                                "observaciones": "ninguna",
                                "solicitud_material_idsolicitud_material": "9",
                                "material_idmaterial": "39",
                                "costo": 0
                            }
                        ]
                    }
                ]
            }
        ]
    }
]