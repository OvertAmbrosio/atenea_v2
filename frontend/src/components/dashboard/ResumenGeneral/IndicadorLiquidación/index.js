import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

import Contenedor from '../../../common/Contenedor';
import ChartLiquidacion from './ChartLiquidacion';
//eslint-disable-next-line
import { TOrdenesToa } from '../../../../libraries/separarField';

/**
 * @param {object} props 
 * @param {TOrdenesToa[]} props.ordenes
 */
function Index({ordenes=[]}) {
  const [dataOrdenes, setDataOrdenes] = useState([]);

  useEffect(() => {
    if (ordenes && ordenes.length > 0) {
      ordenarData();
    }
  //eslint-disable-next-line
  }, [ordenes]);

  function ordenarData() {
    const gestores = [];
    let nuevaData = [];
    ordenes.forEach((orden) => {
      if (orden['usuario completar'] && !gestores.includes(orden['usuario completar'])) {
        gestores.push(orden['usuario completar']);
      };
    });
    gestores.forEach((g) => {
      const nombreGestor = String(g).replace(/\s{2,}/g, ' ').split('-');
      nuevaData.push({
        gestor: nombreGestor[nombreGestor.length -1],
        valor: ordenes.filter((e) => e['usuario completar'] === g).length
      });
    });
    setDataOrdenes(nuevaData);
  }

 
  return (
    <Contenedor>
      <div style={{ margin: '1rem 0' }}>
        <Typography.Title level={5}>Indicador Liquidacion - Gestor</Typography.Title>
      </div>
      <div style={{ margin: '1rem 0' }}>
        <ChartLiquidacion
          data={dataOrdenes}
        />
      </div>
    </Contenedor>
  )
};

Index.propTypes = {
  ordenes: PropTypes.array
};

export default Index;

