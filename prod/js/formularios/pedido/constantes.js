export const codigos = {
    codigoPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "principal",
    codigolista_pedido: Array.from({ length: 5 }, () => rand()).join("") + "lista_pedido",
    codigodetalle_pedido: Array.from({ length: 5 }, () => rand()).join("") + "detalle_pedido",
    codigoregistrar_pedido: Array.from({ length: 5 }, () => rand()).join("") + "codigoregistrar_pedido",
    codigo_pedido_material: Array.from({ length: 5 }, () => rand()).join("") + "codigo_pedido_material",
    codigo_pedido_envase: Array.from({ length: 5 }, () => rand()).join("") + "codigo_pedido_envase",
    codigo_anular_pedido: Array.from({ length: 5 }, () => rand()).join("") + "codigo_anular_pedido",

  };
  
  function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return String.fromCharCode(65 + indice) + codigo;
  }
  