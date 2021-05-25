/**
 * @param {string} zona - La zona seleccionada
 * @param {string} negocio - AVERIAS/ALTAS
 * @param {string} subNegocio - GPON/HFC
 * @returns {number} meta
 */
export default function generarMetas(zona="LIMA", negocio, subNegocio) {
  if (zona === null) return 0
  switch (zona.toUpperCase()) {
    case "LIMA":
      if (negocio.toUpperCase() === "AVERIAS") {
        return 6
      } else {
        if (subNegocio.toUpperCase() === "HFC") {
          return 3;
        } else {
          return 2;
        }
      };
    case "PIURA":
      if (negocio.toUpperCase() === "AVERIAS") {
        return 7
      } else {
        return 3
      };
    case "CHIMBOTE":
      if (negocio.toUpperCase() === "AVERIAS") {
        return 5
      } else {
        return 3
      };
    case "HUARAZ":
      if (negocio.toUpperCase() === "AVERIAS") {
        return 5
      } else {
        return 3
      };
    default: return 0;
  }
};