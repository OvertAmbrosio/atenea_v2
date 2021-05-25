import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ExcelExport, ExcelExportColumn, ExcelExportColumnGroup } from '@progress/kendo-react-excel-export';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { red, green } from '@ant-design/colors';
import moment from 'moment';
//eslint-disable-next-line
import { TOrdenesToa } from '../../libraries/separarField';

/**
 * @param {object} props 
 * @param {TOrdenesToa[][]} props.ordenes
 * @param {Array} props.rutas
 * @param {string[]} props.horas
 * @param {string} props.titulo
 */
function ExcelProduccionHora({ordenes=[], rutas=[], horas=[], meta=1, titulo}) {
  const [dataOrdenes, setDataOrdenes] = useState([]);
  let exportar1Ref = useRef(null);

  useEffect(() => {
    if (ordenes && ordenes.length > 0) {
      ordenarData();
    }
  //eslint-disable-next-line
  },[ordenes]);

  function ordenarData() {
    let contratas = [];
    let nuevaData = [];
    let nuevasOrdenes = [].concat.apply([], ordenes);
    nuevasOrdenes.forEach((e) => {
      if (e && e.contrata && e.contrata.nombre && !contratas.includes(e.contrata.nombre)) {
        contratas.push(e.contrata.nombre);
      };
    });
    contratas.sort()
    contratas.push('TOTAL');
    contratas.forEach((c) => {
      if (c === 'TOTAL') {
        const cantidadRutas = rutas.length;
        const metaContrata = cantidadRutas * meta;
        let ultimaCantidad = 0;
        let objeto = {
          contrata: c,
          rutas: cantidadRutas,
          meta: metaContrata,
        };
        horas.forEach((h,i) => {
          const cantidad = ordenes[i] && ordenes[i].length > 0 ? ordenes[i].length : 0;
          ultimaCantidad = cantidad;
          objeto[h] = {
            value: cantidad,
            meta: (cantidad < (metaContrata/10) * i+1) ? false : true
          };
        });
        objeto["cumplimiento"] = String(Math.round((ultimaCantidad * 100) / metaContrata)+' %')
        nuevaData.push(objeto);
      } else{ 
        const cantidadRutas = rutas.filter((r) => r.empleado && r.empleado.contrata && r.empleado.contrata.nombre === c).length;
        const metaContrata = cantidadRutas * meta;
        let ultimaCantidad = 0;
        let objeto = {
          contrata: c,
          rutas: cantidadRutas,
          meta: metaContrata,
        };
        horas.forEach((h,i) => {
          const cantidad = ordenes[i] && ordenes[i].length > 0 ? ordenes[i].filter((e) => e && e.contrata && e.contrata.nombre === c ).length : 0
          ultimaCantidad = cantidad;
          objeto[h] = {
            value: cantidad,
            meta: (cantidad < (metaContrata/10) * i+1) ? false : true
          };
        });
        objeto["cumplimiento"] = String(Math.round((ultimaCantidad * 100) / metaContrata)+' %')
        nuevaData.push(objeto);
      }
    })
    setDataOrdenes(nuevaData);
  }

  function guardarArchivo() {
    try {
      let options1 = exportar1Ref.current.workbookOptions();
      options1.sheets[0].title = String(titulo).toUpperCase();
      let rows = options1.sheets[0].rows;
      rows.forEach((row) => {
        if (row.type === 'data') {
          row.cells.forEach((cell) => {
            if (cell.value && cell.value.value) {
              cell.background =  cell.value.meta ? green[1] :red[1];
              cell.color = cell.value.meta ? green[6] : red[6];
            } else if (String(cell.value).toLowerCase() === 'total') {
              cell.background = '#FFFF00';
              cell.bold = true;
            }
            cell.value = cell.value.value ? cell.value.value: cell.value;
            if (String(cell.value).length < 5) {
              cell.textAlign = "center";
            }
            cell.borderBottom = { size: .5 }; 
            cell.borderLeft = { size: .5 };
            cell.borderRight = { size: .5 };
            cell.borderTop = { size: .5 };            
          });
         row.cells[row.cells.length - 1].background = '#FFFF00';
         row.cells[row.cells.length - 1].color = red[6];
         row.cells[row.cells.length - 1].fontSize = 15;
         row.cells[row.cells.length - 1].textAlign = 'center';
         row.cells[row.cells.length - 1].bold = true;
        }
      });
      exportar1Ref.current.save(options1);
    } catch (error) {
      console.log(error);
    }
  };

  const headerOptions = {
    bold: true, 
    textAlign: 'center',
    fontSize: 17,
    autoWidth: true,
    background: '#5DADE2', 
  };

  const headerGroup = {
    bold: true, 
    textAlign: 'center',
    verticalAlign: 'center',
    fontSize: 20,
    background: '#5DADE2', 
  }

  return (
    <div>
      <Button size="small" icon={<ExportOutlined />} type="primary" onClick={guardarArchivo} >Exportar</Button>
      <ExcelExport
        data={dataOrdenes}
        fileName={`produccion_${moment().format('DD_MM_YYYY')}.xlsx`}
        ref={exportar1Ref}
      >
        <ExcelExportColumnGroup title={String(titulo).toUpperCase()} headerCellOptions={headerGroup}>
          <ExcelExportColumn field="contrata" title="Contrata" width={200} headerCellOptions={headerOptions} />
          <ExcelExportColumn field="rutas" title="Rutas" headerCellOptions={headerOptions} />
          <ExcelExportColumn field="meta" title="Meta" headerCellOptions={headerOptions} />
        </ExcelExportColumnGroup>
        {
          horas && horas.length > 0 ?
          horas.map((h,i) => (
            <ExcelExportColumn key={i} field={h} title={h} width={60} headerCellOptions={headerOptions} />
          )) :null
        }
        <ExcelExportColumn field="cumplimiento" title="Cumplimiento" width={110} headerCellOptions={headerOptions} />
      </ExcelExport>
    </div>
  )
};

ExcelProduccionHora.propTypes = {
  data: PropTypes.array,
  rutas: PropTypes.array,
  horas: PropTypes.array,
  meta: PropTypes.number,
  titulo: PropTypes.string,
};

export default ExcelProduccionHora;

