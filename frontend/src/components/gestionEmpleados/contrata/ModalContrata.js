import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, DatePicker, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

function ModalContrata({visible, setVisible, accion, guardar, jefes=[], dataZonas=[], contrata={}}) {
  const [nombre, setNombre] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [ruc, setRuc] = useState(null);
  const [jefe, setJefe] = useState(null);
  const [representante, setRepresentante] = useState(null);
  const [fecha_incorporacion, setFecha_incorporacion] = useState(null);
  const [observacion, setObservacion] = useState(null)

  useEffect(() => {
    if (contrata.nombre) {
      setNombre(contrata.nombre);
      setZonas(contrata.zonas && contrata.zonas.length > 0 ? contrata.zonas.map((e) => e._id) : [])
      setRuc(contrata.ruc);
      setJefe(contrata.jefe);
      setRepresentante(contrata.representante);
      setFecha_incorporacion(contrata.fecha_incorporacion);
      setObservacion(contrata.observacion);
    }
  // eslint-disable-next-line
  },[contrata]);

  const limpiarEstados = async () => {
    setNombre(null);
    setZonas([]);
    setRuc(null);
    setJefe(null);
    setRepresentante(null);
    setFecha_incorporacion(null);
    setObservacion(null);
    setVisible(false);
  };

  const onOk = async () => {
    await guardar({nombre, zonas, ruc, jefe, representante,
      fecha_incorporacion: fecha_incorporacion && fecha_incorporacion, 
      observacion: observacion && observacion
    }, contrata.id);
    limpiarEstados();
  };

  return (
    <Modal
      width={270}
      cancelText="Cancelar"
      okText="Guardar"
      title={accion === 'crear' ? 'Crear Contrata':'Editar Contrata'}
      visible={visible}
      onOk={onOk}
      onCancel={limpiarEstados}
      destroyOnClose={true}
      centered
    >
        <p>Nombre de Contrata:</p>
        <Input
          size="small"
          placeholder="Nombre de Contrata" 
          defaultValue={nombre} 
          onChange={e => setNombre(e.target.value)}
        /><br/><br/>
        <p>Zonas:</p>
        <Select
          size="small" 
          mode="multiple"
          placeholder="Seleccionar Zonas"
          style={{ width: "100%" }}
          value={zonas}
          onChange={(e) => setZonas(e)} 
        >
        {
          dataZonas && dataZonas.length > 0 ?
          dataZonas.map((obj, i) => (
            <Option key={obj._id}>{obj.nombre}</Option>
          )):null
        }
        </Select><br/><br/>
        <p>RUC:</p>
        <Input
          size="small" 
          placeholder="RUC" 
          defaultValue={ruc} 
          onChange={e => setRuc(e.target.value)}
        /><br/><br/>
        <p>Jefe de Contrata:</p>
        <Select
          size="small"
          placeholder="Jefe de contrata"
          value={jefe}
          onChange={(e) => setJefe(e)}
          style={{ width: 200, marginBottom: '.5rem' }}
        >
        {
          jefes && jefes.length > 0 ? jefes.map((e, i) => (
            <Option key={i} value={e._id}>{e.nombre+' '+e.apellidos}</Option>
          )) : null
        }
        </Select>
        <p>Representante:</p>
        <Input
          size="small" 
          placeholder="Representante" 
          defaultValue={representante} 
          onChange={e => setRepresentante(e.target.value)}
        /><br/><br/>
        <p>Fecha de Incorporación:</p>
        <DatePicker
          size="small"
          defaultValue={fecha_incorporacion && moment.utc(fecha_incorporacion)} 
          onChange={(_, date) => setFecha_incorporacion(date)}
        /><br/><br/>
        <p>Observacion:</p>
        <Input
          size="small"
          placeholder="Observacion" 
          defaultValue={observacion} 
          onChange={e => setObservacion(e.target.value)}
        /><br/><br/>
    </Modal>
  )
}

ModalContrata.propTypes = {
  jefes: PropTypes.array,
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
  accion: PropTypes.string,
  guardar: PropTypes.func,
  contrata: PropTypes.object,
  dataZonas: PropTypes.array
}

export default ModalContrata

