import React from 'react';
import PropTypes from 'prop-types';
import { Column } from '@ant-design/charts';

function ChartEstadoGeneral({loading, generarColores, data, tipo}) {
  return (
    <Column
      style={{ marginBottom: '1rem' }}
      loading={loading}
      height={250}
      legend={{
        position:"top",
        padding: [10,0,30,0]
      }}
      color={generarColores}
      data={data}
      isGroup={true}
      xField={tipo}
      yField='ordenes'
      xAxis={{
        label: { 
          autoRotate: false,
          autoHide: false,
          autoEllipsis: true,
        },
        grid: null
      }}
      scrollbar={{ 
        type: 'horizontal',
        categorySize: 130,
        
      }}
      seriesField='estado'
      label={{
        animate: true,
        position: "top",
        layout: [
          { type: 'interval-hide-overlap' },
          { type: 'adjust-color' },
        ]
      }}
    />
  )
};

ChartEstadoGeneral.propTypes = {
  loading: PropTypes.bool,
  generarColores: PropTypes.func,
  data: PropTypes.array,
  tipo: PropTypes.string
};

export default ChartEstadoGeneral;

