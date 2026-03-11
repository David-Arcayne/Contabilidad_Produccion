/**
 * Minified by jsDelivr using Terser v5.19.2.
 * Original file: /npm/numero-a-letras@1.0.6/build/numeroaletras.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
"use strict";

function unidades(e) {
  const lista = ["", "Un", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve"];
  return lista[e] || "";
}

function decenasY(e, n) {
  return n > 0 ? e + " y " + unidades(n) : e;
}

function decenas(e) {
  const n = Math.floor(e / 10), r = e % 10;
  switch (n) {
    case 1:
      return ["Diez", "Once", "Doce", "Trece", "Catorce", "Quince"][r] || "Dieci" + unidades(r).toLowerCase();
    case 2:
      return r === 0 ? "Veinte" : "Veinti" + unidades(r).toLowerCase();
    case 3: return decenasY("Treinta", r);
    case 4: return decenasY("Cuarenta", r);
    case 5: return decenasY("Cincuenta", r);
    case 6: return decenasY("Sesenta", r);
    case 7: return decenasY("Setenta", r);
    case 8: return decenasY("Ochenta", r);
    case 9: return decenasY("Noventa", r);
    default: return unidades(r);
  }
}

function centenas(e) {
  var n = Math.floor(e / 100),
    r = e - 100 * n;
  switch (n) {
    case 1:
      return r > 0 ? "Ciento " + decenas(r) : "Cien";
    case 2:
      return "Doscientos " + decenas(r);
    case 3:
      return "Trescientos " + decenas(r);
    case 4:
      return "Cuatrocientos " + decenas(r);
    case 5:
      return "Quinientos " + decenas(r);
    case 6:
      return "Seiscientos " + decenas(r);
    case 7:
      return "Setecientos " + decenas(r);
    case 8:
      return "Ochocientos " + decenas(r);
    case 9:
      return "Novecientos " + decenas(r);
    default:
      return decenas(r);
  }
}

function seccion(e, n, singular, plural) {
  const t = Math.floor(e / n), s = e % n;
  let texto = "";
  if (t > 0) {
    texto = t > 1 ? centenas(t) + " " + plural : singular;
  }
  return texto + (s > 0 ? " " + convertirNumeroATexto(s) : "");
}

function miles(e) {
  return seccion(e, 1e3, "Mil", "Mil");
}

function millones(e) {
  return seccion(e, 1e6, "Un Millón", "Millones");
}

function billones(e) {
  return seccion(e, 1e12, "Un Billón", "Billones");
}

function convertirNumeroATexto(e) {
  if (e === 0) return "Cero";
  if (e < 1000) return centenas(e);
  if (e < 1e6) return miles(e);
  // if (e < 1e9) return millones(e);
  if (e < 1e12) {
    let parteMilMillones = Math.floor(e / 1e6);  // Obtener la parte de mil millones
    let resto = e % 1e6;  // Obtener el resto (el resto son los millones)

    let texto = "";
    if (parteMilMillones === 1) {
      texto = "Un Millón";  // Si es exactamente mil millones
    } else {
      texto = convertirNumeroATexto(parteMilMillones) + " Millones";  // Si es más de mil millones
    }

    // Si hay resto, agregar los millones restantes
    if (resto > 0) {
      texto += " " + millones(resto);
    }

    return texto;
  }
  if (e < 1e18) {
    let parteBillones = Math.floor(e / 1e12);  // Obtener la parte de billones
    let resto = e % 1e12;  // Obtener el resto (el resto son los billones)

    let texto = "";
    if (parteBillones === 1) {
      texto = "Un Billón";  // Si es exactamente un billón
    } else {
      texto = convertirNumeroATexto(parteBillones) + " Billones";  // Si es más de un billón
    }

    // Si hay resto, agregar los billones restantes
    if (resto > 0) {
      texto += " " + billones(resto);
    }

    return texto;
  }
  return billones(e);
}

function NumerosALetras(e, opciones) {
  const n = {
    numero: e,
    enteros: Math.floor(e),
    centavos: Math.round(100 * e) - 100 * Math.floor(e),
    letrasCentavos: "",
    letrasMonedaCentavoPlural: `/100`,
    letrasMonedaCentavoSingular: `/100`,
  };

  if (n.centavos >= 0) {
    if (n.centavos >= 1 && n.centavos <= 9) {
      n.letrasCentavos = "0" + n.centavos + n.letrasMonedaCentavoSingular;
    } else if (n.centavos === 0) {
      n.letrasCentavos = "00" + n.letrasMonedaCentavoSingular;
    } else {
      n.letrasCentavos = n.centavos + n.letrasMonedaCentavoPlural;
    }
  }

  let resultado = convertirNumeroATexto(n.enteros) + " " + n.letrasCentavos;

  if (opciones?.mayus) {
    resultado = resultado.toUpperCase();
  } else {
    resultado = resultado.charAt(0).toUpperCase() + resultado.slice(1).toLowerCase();
  }

  resultado += " " + (n.enteros === 1 ? (opciones?.singular ?? "Boliviano") : (opciones?.plural ?? "Bolivianos"));
  return resultado;
}

export { NumerosALetras };