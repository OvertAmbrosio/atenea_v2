import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from '@ant-design/charts';

function ChartLiquidacion({data=[]}) {
  return (
    <Bar
      data={data}
      xField='valor'
      yField='gestor'
      seriesField='gestor'
      legend={false}
      label={{
        position: 'middle',
        layout: [
          { type: 'interval-adjust-position' },
          { type: 'interval-hide-overlap' },
          // { type: 'adjust-color' },
        ],
      }}
    />
  )
};

ChartLiquidacion.propTypes = {
  data: PropTypes.array,
};

export default ChartLiquidacion;

