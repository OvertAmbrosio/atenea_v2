import React, { useEffect, useState } from 'react';
import { DualAxes } from '@ant-design/charts';
import colores from '../../../../constants/colores';

const ChartDualAxes = ({data=[[],[]], total}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setInterval(() => {
      setLoading(false)
    }, 1000);
  }, [data])

  return (
    <DualAxes 
      onReady={(plot) => {
        plot.on('element:click', (...args) => {
          console.log(...args);
        });
      }}
      height={290}
      style={{
        margin: '1rem 0',
        width: '100%',
      }}
      padding={[20,18,10,15]}
      loading={loading}
      data={data}
      xField='hora'
      yField={['valor', 'porcentaje']}
      smooth={true}
      animation={{
        appear: {
          animation: 'path-in',
          duration: 5000,
        },
      }}
      annotations={[
        [
          {
            type: 'line',
            start: ['max', 'max'],
            end: ['max', 'max'],
            text: {
              content: `${total}`,
              style: { textAlign: 'left', fill: colores.success },
            },
            style: {
              lineDash: [4, 4],
              stroke: colores.success,
            },
            color: colores.success,
          },
        ],
        // [
        //   {
        //     type: 'regionFilter',
        //     start: ['min', '95'],
        //     end: ['max', '1000'],
        //     text: {
        //       position: 'right',
        //       offsetY: 18,
        //       style: { textAlign: 'right' },
        //     },
        //     style: {
        //       lineDash: [4, 4],
        //     },
        //     color: colores.success,
        //   },
        //   {
        //     type: 'regionFilter',
        //     start: ['min', '95'],
        //     end: ['max', '65'],
        //     text: {
        //       position: 'right',
        //       offsetY: 18,
        //       style: { textAlign: 'right' },
        //     },
        //     style: {
        //       lineDash: [4, 4],
        //     },
        //     color: colores.warning,
        //   },
        //   {
        //     type: 'line',
        //     start: ['min', '95'],
        //     end: ['max', '95'],
        //     text: {
        //       content: "Medio",
        //       style: { textAlign: 'left', fill: colores.warning },
        //     },
        //     style: {
        //       lineDash: [4, 4],
        //       stroke: colores.warning,
        //     },
        //     color: colores.warning,
        //   },
        //   {
        //     type: 'regionFilter',
        //     start: ['min', '65'],
        //     end: ['max', '0'],
        //     text: {
        //       position: 'right',
        //       offsetY: 18,
        //       style: { textAlign: 'right' },
        //     },
        //     style: {
        //       lineDash: [4, 4],
        //     },
        //     color: colores.error,
        //   },
        //   {
        //     type: 'line',
        //     start: ['min', '65'],
        //     end: ['max', '65'],
        //     text: {
        //       content: "Bajo",
        //       style: { textAlign: 'left', fill: "red" },
        //     },
        //     style: {
        //       lineDash: [4, 4],
        //       stroke: colores.error,
        //     },
        //     color: colores.error,
        //   },
        // ]
      ]}
      legend={{
        position:"top-right",
        padding: [5,0,30,0]
      }}
      geometryOptions={[
        {
          geometry: 'line',
          smooth: true,
          seriesField: 'tipo',
          color: ["#5B8FF9", "#EA0000", colores.success],
          lineStyle: function lineStyle(data) {
            if (data && data.tipo === 'Meta') {
              return {
                lineDash: [8, 8],
                lineWidth: 3,
                opacity: 1,
              };
            } else if (data && data.tipo === 'Total') {
              return {
                lineDash: [5, 8],
                lineWidth: 2,
                opacity: 1,
              };
            }
            return { lineWidth: 3 };
          },
          label: {
            content: (a) => {
              if (a && a.tipo === "Cantidad") return a.valor;
            }
          },
          point: {
            size: 4,
            style: {
              opacity: 0.5,
              stroke: '#5AD8A6',
              fill: '#fff',
            },
          },
        },
        {          
          geometry: 'line',
          smooth: false,
          color: colores.Completado,
          seriesField: 'tipo',
          lineStyle: {
            lineWidth: 3
          },
          label: {
            content: (e) => Number(e.porcentaje)
          },
          point: {
            size: 4,
            style: {
              opacity: 0.5,
              stroke: 'gray',
              fill: '#fff',
            },
          },
        }
      ]}
    />
  );
};

export default ChartDualAxes;