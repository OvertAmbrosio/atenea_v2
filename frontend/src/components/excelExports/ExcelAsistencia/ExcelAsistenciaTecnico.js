import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { ExcelExport, ExcelExportColumn } from '@progress/kendo-react-excel-export';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import * as AntColores from '@ant-design/colors';
import moment from 'moment';
import cogoToast from 'cogo-toast';

import estadoAsistencia from '../../../constants/estadoAsistencia';
import capitalizar from '../../../libraries/capitalizar'


function ExcelAsistenciaTecnico({ data=[], dias=[], nombre }) {
  let exportarRef = useRef(null);

  const exportarExcel = () => {
    if (data.length < 1) {
      cogoToast.warn("No hay data disponible.", { position: "top-right" });
    } else {
      guardarArchivo(exportarRef.current)
    };
  };

  function guardarArchivo(component) {
    try {
      let options = component.workbookOptions();
      let rows = options.sheets[0].rows;
      let indexEstado = -1
      let indexEncontrados = [];
      rows.forEach((row) => {
        if (row.type === 'header') {
          indexEstado = row.cells.findIndex((e) => e.value === 'Estado');
          row.cells.forEach((e, i) => {
            let fecha = moment(`${e.value}-2021`,"DD-MM-YYYY");
            if (moment().isValid()) {
              let diferencia = (moment().diff(fecha, "days"))
              if (diferencia >= 0) {
                indexEncontrados.push(i);
              }
            }           
          });
        };
        if (row.type === 'data') {
          if (indexEstado > -1 && String(row.cells[indexEstado].value).toUpperCase() === 'INACTIVO' && indexEncontrados.length > 0) {
            indexEncontrados.forEach((e) => {
              if (!row.cells[e].value) {
                row.cells[e].value = "BAJA"
              }
            })
          }
          row.cells.forEach((cell) => {
            cell.value = cell.value ? String(cell.value).toUpperCase() : cell.value;
            cell.background = colorCelda(cell.value).background;
            cell.color = colorCelda(cell.value).color;
            cell.borderBottom = { size: 1 }; 
            cell.borderLeft = { size: 1 };
            cell.borderRight = { size: 1 };
            cell.borderTop = { size: 1 };
          });
        }
      });
      component.save(options);
    } catch (error) {
      console.log(error);
    }
  };

  const colorCelda = (estado) => {
    switch (estado) {
      case estadoAsistencia.FALTA:
        return {background: AntColores.red[1], color: AntColores.red.primary};
      case 'Inactivo':
        return {background: AntColores.red[1], color: AntColores.red.primary};
      case estadoAsistencia.ASISTIO:
        return {background: AntColores.green[1], color: AntColores.green.primary};
      case estadoAsistencia.TARDANZA:
        return {background: AntColores.lime[1], color: AntColores.lime.primary};
      case estadoAsistencia.DESCANSO:
        return {background: AntColores.gold[1], color: AntColores.gold.primary};
      case estadoAsistencia.PERMISO:
        return {background: AntColores.blue[1], color: AntColores.blue.primary};
      case estadoAsistencia.GUARDIA:
        return {background: AntColores.cyan[1], color: AntColores.cyan.primary};
      case estadoAsistencia.SUSPENDIDO:
        return {background: AntColores.yellow[1], color: AntColores.yellow.primary};
      case estadoAsistencia.DESCANSO_MEDICO:
        return {background: AntColores.geekblue[1], color: AntColores.geekblue.primary};
      case estadoAsistencia.EXAMEN_MEDICO:
        return {background: AntColores.purple[1], color: AntColores.purple.primary};
      case estadoAsistencia.VACACIONES:
        return {background: AntColores.orange[1], color: AntColores.orange.primary};
      case estadoAsistencia.BAJA:
        return {background: AntColores.volcano[1], color: AntColores.volcano.primary};
      default:
        return {background: '', color: ''};
    };
  };

  const headerOptions = {
    background: '#5DADE2', 
    bold: true, 
    fontSize: 17,
    wrap: false,
    autoWidth: true
  };
  
  return (
    <div>
      <Button size="small" icon={<ExportOutlined />} type="primary" onClick={exportarExcel} >Exportar</Button>
      <ExcelExport
        data={data.map((e) => ({
          ...e, 
          zona: e.zonas && e.zonas[0] && e.zonas[0].nombre ? e.zonas[0].nombre : '-',
          cargo: capitalizar(nombre)
        }))}
        fileName={`asistencia_${nombre}_${moment().format('DD_MM_YYYY')}.xlsx`}
        ref={exportarRef}
      >
        <ExcelExportColumn field="zona" title="Zona" locked={true} width={70} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="empleado.nombre" title="Nombre" locked={true} width={170} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="empleado.apellidos" title="Apellidos" locked={true} width={150} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="carnet" title="Carnet" locked={true} width={100} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="dni" title="DNI" width={150} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="estado_empresa" title="Estado" width={90} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="cargo" title="Cargo" width={90} headerCellOptions={headerOptions}/>
        <ExcelExportColumn field="contrata.nombre" title="Contrata" width={170} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="supervisor.apellidos" title="Supervisor" width={170} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="gestor.apellidos" title="Gestor" width={170} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="tipo_negocio" title="Negocio" width={90} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="sub_tipo_negocio" title="Sub Negocio" width={90} headerCellOptions={headerOptions} />
        {
          dias && dias.length > 0 ?
            dias.map((d, i) => (
              <ExcelExportColumn
                key={i}
                field={`${d}.estado`}
                title={`${d}`} width={60}
                headerCellOptions={headerOptions}
                cellOptions={{ textAlign: 'center'}}
              />
            )) : null
        }
        <ExcelExportColumn field="iniciado" title="En Ruta" width={90} headerCellOptions={headerOptions} />
      </ExcelExport>
    </div>
  )
};

ExcelAsistenciaTecnico.propTypes = {
  data: PropTypes.array,
  dias: PropTypes.array,
  nombre: PropTypes.string
};

export default ExcelAsistenciaTecnico;

