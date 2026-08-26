<?php
// conexion.php — Fábrica de conexiones con Singleton + Lazy Loading
//
// PROBLEMA RESUELTO:
// Cada clase (ventas, funciones, compras...) hacía "new Conexion()" por separado,
// abriendo múltiples grupos de conexiones por petición y superando el límite de
// Hostinger → error 2002 "Operation not permitted".
//
// SOLUCIÓN:
// Singleton: todas las clases comparten la MISMA instancia de Conexion.
// Lazy loading: cada BD se conecta solo cuando se necesita por primera vez.
// Resultado: máximo 4 conexiones MySQL por petición (em, ad, cm, rh),
// sin importar cuántas clases PHP instancien "Conexion::getInstance()".

require_once __DIR__ . "/bd.php";

class Conexion {

    // ── Singleton ─────────────────────────────────────────────────────────────
    private static ?Conexion $instance = null;

    /**
     * Retorna la única instancia de Conexion para esta petición.
     * Usar siempre Conexion::getInstance() en lugar de new Conexion().
     */
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Constructor privado — impide "new Conexion()" desde fuera
    private function __construct() {}

    // ── Instancias internas (null = no conectado aún) ─────────────────────────
    private ?BDyofinanciero $_em = null;
    private ?BDyofinanciero $_ad = null;
    private ?BDyofinanciero $_cm = null;
    private ?BDyofinanciero $_rh = null;
    private ?BDyofinanciero $_prod = null;
    private ?BDyofinanciero $_ct = null;

    // Endpoints de facturación electrónica
    public array $endPoint = [
        1 => "https://sinfel.emizor.com",
        2 => "https://fel.emizor.com",
        3 => "https://mistersofts.com",
    ];

    // ── Lazy getters ──────────────────────────────────────────────────────────

    public function getEm(): BDyofinanciero {
        if ($this->_em === null) {
            $this->_em = new BDyofinanciero(
                "u335921272_vempresa",
                "@Empresa123",
                "u335921272_vempresa"
            );
        }
        return $this->_em;
    }

    public function getAd(): BDyofinanciero {
        if ($this->_ad === null) {
            $this->_ad = new BDyofinanciero(
                "u335921272_adminy",
                "@Admin#123",
                "u335921272_administradorY"
            );
        }
        return $this->_ad;
    }

    public function getCm(): BDyofinanciero {
        if ($this->_cm === null) {
            $this->_cm = new BDyofinanciero(
                "u335921272_vcomercial",
                "@Comercial#2025",
                "u335921272_vcomercial"
            );
        }
        return $this->_cm;
    }

    public function getRh(): BDyofinanciero {
        if ($this->_rh === null) {
            $this->_rh = new BDyofinanciero(
                "u335921272_rrhh",
                "@Rrhh#234",
                "u335921272_rrhh"
            );
        }
        return $this->_rh;
    }
    public function getProd(): BDyofinanciero {
        if ($this->_prod === null) {
            $this->_prod = new BDyofinanciero(
                "u335921272_vproduccion",
                "@Produccion1331",
                "u335921272_vproduccion"
            );
        }
        return $this->_prod;
    }
    //$this->dbc=new DBusiness("u335921272_vcontabilidad","@Conta#234","u335921272_vcontabilidad");//contabilidad
     public function getCont(): BDyofinanciero {
        if ($this->_ct === null) {
            $this->_ct = new BDyofinanciero(
                "u335921272_vcontabilidad",
                "@Conta#234",
                "u335921272_vcontabilidad"
            );
        }
        return $this->_ct;
    }
    // ── Acceso por propiedad (compatibilidad con código existente) ─────────────
    // Permite $conexion->cm, $conexion->em, etc. sin cambiar las clases de negocio.
    public function __get(string $name): ?BDyofinanciero {
        return match($name) {
            'em' => $this->getEm(),
            'ad' => $this->getAd(),
            'cm' => $this->getCm(),
            'rh' => $this->getRh(),
            'prod' => $this->getProd(),
            'dbc' => $this->getCont(),
            default => null,
        };
    }

    // ── Cierre explícito de conexiones ────────────────────────────────────────
    public function closeAll(): void {
        foreach (['_em', '_ad', '_cm', '_rh', '_prod', '_ct'] as $prop) {
            if ($this->$prop !== null) {
                $this->$prop->close();
                $this->$prop = null;
            }
        }
    }

    // Prevenir clonación y deserialización del singleton
    private function __clone() {}
    public function __wakeup(): void {
        throw new \Exception("No se puede deserializar un Singleton.");
    }
}
