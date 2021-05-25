import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ExcelExport, ExcelExportColumn } from '@progress/kendo-react-excel-export';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import moment from 'moment';


function ExcelRutasOperativas({rutas=[]}) {
  const [dataOrdenes, setDataOrdenes] = useState([]);
  let exportarRef = useRef(null);
  
  useEffect(() => {
    if (rutas && rutas.length > 0) {
      setDataOrdenes(
        rutas.map((tecnico) => ({
          zona: tecnico.zonas && tecnico.zonas[0] && tecnico.zonas[0].nombre ? tecnico.zonas[0].nombre : '-',
          contrata: tecnico.contrata && tecnico.contrata.nombre ? tecnico.contrata.nombre : '-',
          carnet: tecnico.carnet,
          tecnico: tecnico.nombre ? tecnico.nombre + ' ' + tecnico.apellidos : '-',
          gestor:  tecnico.gestor && tecnico.gestor.nombre ? tecnico.gestor.nombre + ' ' + tecnico.gestor.apellidos : '-',
          supervisor:  tecnico.supervisor && tecnico.supervisor.nombre ? tecnico.supervisor.nombre + ' ' + tecnico.supervisor.apellidos : '-',
          negocio:  tecnico.tipo_negocio,
          sub_negocio: tecnico.sub_tipo_negocio
        }))
      )
    }
  },[rutas]);

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
        fileName={`rutas_operativas_${moment().format('DD_MM_YYYY')}.xlsx`}
        ref={exportarRef}
      >
        <ExcelExportColumn field="carnet" title="Carnet" width={100} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="tecnico" title="Tecnico" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="gestor" title="Gestor" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="supervisor" title="Supervisor" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="contrata" title="Contrata" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="zona" title="Zona" width={90} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="negocio" title="Negocio" width={100} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="sub_negocio" title="Sub Negocio" width={100} headerCellOptions={headerOptions} />
      </ExcelExport>
    </div>
  )
};

ExcelRutasOperativas.propTypes = {
  metodo: PropTypes.string,
  tipo: PropTypes.string,
  setLoading: PropTypes.func,
  nodos: PropTypes.array,
  ordenes: PropTypes.array,
};

export default ExcelRutasOperativas;

