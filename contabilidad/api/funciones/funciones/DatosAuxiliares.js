import { URL_APIA, URL_APIC, URL_APIE } from "../../../lib/services.js";

export const URL_BASE = "https://vivasoft.link/";
// const URL_BASE = "https://mistersofts.com/";
export const URL_ADMIN = `${URL_BASE}administrador/`;
export const ADMIN_URLAPI = `${URL_ADMIN}api/`;
export const EM_URL = URL_APIE;
export const CT_URLAPI = `${URL_APIC}api/`;
export const AD_URLAPI = `${URL_APIA}api/`;
export const CT_URLARCHIVOS = `${URL_APIC}archivos/`;

// Cache interno en memoria
let _empresaCache = null;
let _divisaCache = null;

let _menuCache = null;

function leerJSON(key) {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : null;
    } catch (e) {
        console.warn(`LocalStorage corrupto en: ${key}`, e);
        return null;
    }
}

// Funciones para obtener datos con cache
function getYFData() {
    if (!_empresaCache) {
        _empresaCache = leerJSON("mistersofts-contabilidad");
    }
    return _empresaCache;
}
function getMenu() {
    if (!_menuCache) {
        _menuCache = leerJSON("mistersofts-contabilidad");
    }
    return _menuCache;
}
function getDivisaData() {
    if (!_divisaCache) {
        _divisaCache = leerJSON("divisa");
    }
    return _divisaCache;
}

// Funciones para refrescar cache
export function refreshEmpresaCache() {
    _empresaCache = null;
}
export function refreshDivisaCache() {
    _divisaCache = null;
}

// Funciones de acceso
export function getSesionContabilidad() {
    return getYFData() ?? null;
}
export function getMenuPrincipal() {
    return getMenu()?.menu ?? null;
}

export function getEmpresa() {
    return getYFData()?.empresa ?? null;
}
export function getSucursalId() {
    return getYFData()?.empresa?.idsucursal ?? null;
}

export function getEmpresaId() {
    return getYFData()?.empresa?.idempresa ?? null;
}

export function getUsuarioId() {
    return getYFData()?.idusuario ?? null;
}

export function getDivisaSimbolo() {
    return getDivisaData()?.simbolo ?? "BOB";
}

export function getDivisaNombre() {
    return getDivisaData()?.nombre ?? "Bolivianos";
}
