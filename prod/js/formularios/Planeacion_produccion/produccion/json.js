let grupos = [
    {
        "grupo_etapas_idgrupo_etapas": "3",
        "nombre": "panes especiales",
        "grupo_productos": [
            {
                "idgrupo_productos": "1",
                "producto_idproducto": "245",
                "grupo_etapas_idgrupo_etapas": "3"
            },
            {
                "idgrupo_productos": "2",
                "producto_idproducto": "246",
                "grupo_etapas_idgrupo_etapas": "3"
            },
            {
                "idgrupo_productos": "31",
                "producto_idproducto": "258",
                "grupo_etapas_idgrupo_etapas": "3"
            }
        ]
    },
    {
        "grupo_etapas_idgrupo_etapas": "7",
        "nombre": "café yungas",
        "grupo_productos": [
            {
                "idgrupo_productos": "4",
                "producto_idproducto": "249",
                "grupo_etapas_idgrupo_etapas": "7"
            },
            {
                "idgrupo_productos": "5",
                "producto_idproducto": "252",
                "grupo_etapas_idgrupo_etapas": "7"
            },
            {
                "idgrupo_productos": "6",
                "producto_idproducto": "253",
                "grupo_etapas_idgrupo_etapas": "7"
            }
        ]
    },
    {
        "grupo_etapas_idgrupo_etapas": "10",
        "nombre": "panetones",
        "grupo_productos": [
            {
                "idgrupo_productos": "7",
                "producto_idproducto": "50",
                "grupo_etapas_idgrupo_etapas": "10"
            },
            {
                "idgrupo_productos": "8",
                "producto_idproducto": "200",
                "grupo_etapas_idgrupo_etapas": "10"
            },
           
        ]
    }
];



let lista = {
    "7": [
        {
            "iddetalle_produccion": 27,
            "cantidad": 23,
            "observaciones": "detalle",
            "orden_produccion_idorden_produccion": 1,
            "producto_idproducto": 252,
            "grupo_etapas_idgrupo_etapas": "7"
        },
        {
            "iddetalle_produccion": 28,
            "cantidad": 23,
            "observaciones": "detalle",
            "orden_produccion_idorden_produccion": 1,
            "producto_idproducto": 100,
            "grupo_etapas_idgrupo_etapas": "7"
        },
    ],
    "10":[
        {
            "iddetalle_produccion": 45,
            "cantidad": 23,
            "observaciones": "detalle",
            "orden_produccion_idorden_produccion": 1,
            "producto_idproducto": 50,
            "grupo_etapas_idgrupo_etapas": "10"
        },
        {
            "iddetalle_produccion": 46,
            "cantidad": 23,
            "observaciones": "detalle",
            "orden_produccion_idorden_produccion": 1,
            "producto_idproducto": 200,
            "grupo_etapas_idgrupo_etapas": "10"
        },
    ],
    "Sin grupo": [
        {
            "iddetalle_produccion": 1,
            "cantidad": 50,
            "observaciones": "detalle",
            "orden_produccion_idorden_produccion": 1,
            "producto_idproducto": 16,
            "grupo_etapas_idgrupo_etapas": "Sin grupo"
        }
    ]
}