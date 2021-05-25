import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Gauge } from '@ant-design/charts';
import { orange, green, red } from '@ant-design/colors';

const colores = [
  '0:#A61C00',      //1
  '0.1:#A61C00',    //2
  '0.2:#D92905',    //3
  '0.2:#D92905',    //4
  '0.4:#F4664A',    //5
  '0.4:#F4664A',    //6
  '0.6:#FAAD14',    //7
  '0.6:#FAAD14',    //8
  '0.8:#D5E209',    //9
  '0.9:#10AA10',    //10
  '1:#10AA10'
];

function ChartGauge({loading, plazo=0, vencidas=0}) {
  const [porcentaje, setPorcentaje] = useState(0);
  const [rangeColor, setRangeColor] = useState([]);

  useEffect(() => {
    obtenerPorcentaje();
  //eslint-disable-next-line
  },[plazo,vencidas])

  useEffect(() => {
    setRangeColor(obtenerColor(porcentaje));
  //eslint-disable-next-line
  }, [porcentaje])

  const obtenerPorcentaje = () => {
    if (vencidas <= 0 && plazo > 0) return setPorcentaje(1) 
    if (plazo <= 0) return setPorcentaje(0);
    return setPorcentaje(plazo/ (plazo+vencidas))
  }

  const obtenerColor = (percent) => {
    let color = 'l(0) ';
    colores.forEach((c, i) => {
      if (i < 9 && Number(`0.${i}`) < percent) {
        color = color + c + ' '
      } else if (i === 10 && percent > 0.91) {
        color = color + c
      }
    })
    return color;
  };

  return (
    <Gauge
      height={220}
      padding={[15,0,5,0]}
      loading={loading}
      percent={porcentaje}
      startAngle={0.7 * Math.PI}
      endAngle={2.3 * Math.PI}
      gaugeStyle={{
        lineCap: 'round'
      }}
      range={{ color: rangeColor, width: 20 }}
      indicator={null}
      axis={{
        label: {
          formatter: function formatter(v) {
            return Number(v) * 100;
          },
        },
        ticks: 0
      }}
      statistic={{
        content: {
          offsetY: -115,
          style: ({percent}) => {
            if (percent < 0.60 ) {
              return ({ 
                textShadow: '0px -1px 1.5px' + red[4],
                color: red.primary, 
                fontSize: '3rem' 
              })
            } else if ( percent >= 0.60 && percent < 0.95) {
              return ({ 
                textShadow: '0px -1px 1.5px' + orange[4],
                color: orange.primary, 
                fontSize: '3rem' 
              })
            } else {
              return ({ 
                textShadow: '0px -1px 1.5px' + green[4],
                color: green.primary, 
                fontSize: '3rem' 
              })
            }
          },
          formatter: function formatter(_ref) {
            var percent = _ref.percent;
            return (percent * 100).toFixed(0) + '%';
          },
          
        },
      }}
      animation={true}
    />
  )
};

ChartGauge.propTypes = {
  loading: PropTypes.bool,
  plazo: PropTypes.number,
  vencidas: PropTypes.number,
};

export default ChartGauge;

