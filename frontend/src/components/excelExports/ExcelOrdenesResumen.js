import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ExcelExport, ExcelExportColumn } from '@progress/kendo-react-excel-export';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import moment from 'moment';
//eslint-disable-next-line
import { TOrdenesToa } from '../../libraries/separarField';

/**
 * @param {object} props
 * @param {TOrdenesToa[]} props.ordenes
 */
function ExcelOrdenesResumen({ordenes=[]}) {
  const [dataOrdenes, setDataOrdenes] = useState([]);
  let exportarRef = useRef(null);

  useEffect(() => {
    setDataOrdenes(ordenes.filter((e) => e).map((orden) => {
      return ({
        ...orden,
        contrata: orden.contrata && orden.contrata.nombre ? orden.contrata.nombre : '-',
        gestor: orden.gestor && orden.gestor.nombre ? orden.gestor.nombre +  orden.gestor.apellidos : '-',
        tecnico: orden.tecnico && orden.tecnico.nombre ? orden.tecnico.nombre +  orden.tecnico.apellidos : '-',
        tecnico_carnet: orden.tecnico && orden.tecnico.carnet ? orden.tecnico.carnet : '-',
        supervisor: orden.supervisor && orden.supervisor.nombre ? orden.supervisor.nombre +  orden.supervisor.apellidos : '-',
      })
    }))
  //eslint-disable-next-line
  }, [])

  function guardarArchivo() {
    try {
      let options = exportarRef.current.workbookOptions();
      let rows = options.sheets[0].rows;
      rows.forEach((row) => {
        if (row.type === 'data') {
          row.cells.forEach((cell) => {
            cell.borderBottom = { size: .5 }; 
            cell.borderLeft = { size: .5 };
            cell.borderRight = { size: .5 };
            cell.borderTop = { size: .5 };
          });
        }
      });
      exportarRef.current.save(options);
    } catch (error) {
      console.log(error);
    }
  };

  const headerOptions = {
    bold: true, 
    fontSize: 17,
    autoWidth: true
  };

  return (
    <div>
      <Button size="small" icon={<ExportOutlined />} type="primary" onClick={guardarArchivo} >Exportar</Button>
      <ExcelExport
        data={dataOrdenes}
        fileName={`ordenes_resumen_${moment().format('DD_MM_YYYY')}.xlsx`}
        ref={exportarRef}
      >
        <ExcelExportColumn field="localidad" title="Localidad" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="tecnico" title="Tecnico" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="tecnico_carnet" title="Carnet" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="gestor" title="Gestor" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="supervisor" title="Supervisor" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="contrata" title="Contrata" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="codigo de requerimiento" title="Requerimiento" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="codigo de cliente" title="Cliente" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="numero ot" title="Numero OT" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="bucket inicial" title="Bucket" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="actividad gpon" title="Actividad Gpon" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="estado actividad" title="Estado TOA" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="fecha de cita" title="Fecha Cita" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="tipo de cita" title="Tipo Cita" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="fecha de registro legados" title="Fecha Registro" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="nodo" title="Nodo" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="nombre distrito" title="Distrito" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="troba" title="Troba" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="sla inicio" title="SLA Inicio" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="sla fin" title="SLA Fin" width='auto' headerCellOptions={headerOptions} />
      </ExcelExport>
    </div>
  )
};

ExcelOrdenesResumen.propTypes = {
  ordenes: PropTypes.array,
};

export default ExcelOrdenesResumen;

