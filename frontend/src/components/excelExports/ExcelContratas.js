import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ExcelExport, ExcelExportColumn } from '@progress/kendo-react-excel-export';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import moment from 'moment';


function ExcelContratas({contratas=[]}) {
  const [dataContratas, setDataContratas] = useState([]);
  let exportarRef = useRef(null);
  
  useEffect(() => {
    if (contratas && contratas.length > 0) {
      setDataContratas(
        contratas.map((contrata) => ({
          ...contrata,
          estado: contrata.activo ? "Activo" : "Baja",
          zonas: contrata.zonas && contrata.zonas.length > 0 ? contrata.zonas.map((c) => c.nombre).toString() : '-',
          jefe: contrata.jefe && contrata.jefe.nombre ? contrata.jefe.nombre+' '+contrata.jefe.apellidos : '-',
          fecha_inicio: contrata.fecha_incorporacion && moment(contrata.fecha_incorporacion).isValid() ? moment(contrata.fecha_incorporacion).format('DD-MM-YYYY') : '-',
          fecha_baja: contrata.fecha_baja && moment(contrata.fecha_baja).isValid() ? moment(contrata.fecha_baja).format('DD-MM-YYYY') : '-',
        }))
      )
    }
  },[contratas]);

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
        data={dataContratas}
        fileName={`contratas_${moment().format('DD_MM_YYYY')}.xlsx`}
        ref={exportarRef}
      >
        <ExcelExportColumn field="nombre" title="Nombre" width='auto' headerCellOptions={headerOptions} />
        <ExcelExportColumn field="ruc" title="RUC" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="jefe" title="Jefe Contrata" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="representante" title="Representante Legal" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="zonas" title="Zonas" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="estado" title="Estado" headerCellOptions={headerOptions} />
        <ExcelExportColumn field="fecha_inicio" title="Fecha Inicio" width={120} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="fecha_baja" title="Fecha Baja" width={120} headerCellOptions={headerOptions} />
        <ExcelExportColumn field="observacion" title="Observacion" width={300} headerCellOptions={headerOptions} />
      </ExcelExport>
    </div>
  )
};

ExcelContratas.propTypes = {
  contratas: PropTypes.array,
};

export default ExcelContratas;

