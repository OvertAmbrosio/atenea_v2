import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Modal, Select, Input, Button } from 'antd';
import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import cogoToast from 'cogo-toast';

import estadoAsistencia from '../../../../constants/estadoAsistencia';

const { Option } = Select;
const { TextArea } = Input;

function ModalEditarAsistencia({visible, abrir, loadingActualizar, actualizar}) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [observacion, setObservacion] = useState(null);


  useEffect(() => {
    setEstadoSeleccionado(null);
    setObservacion(null);
  },[]);

  async function guardar() {
    if (estadoSeleccionado !== null) {
      await actualizar(estadoSeleccionado, observacion);
    } else {
      cogoToast.warn('No hay usuario seleccionado.', { position: 'top-right' })
    }
  }

  return (
    <Modal
      title="Actualizar el estado de la asistencia"
      visible={visible}
      afterClose={() => {
        setObservacion(null);
        setEstadoSeleccionado(null);
      }}
      width={350}
      centered
      destroyOnClose
      onCancel={abrir}
      footer={[
        <Button key="back" onClick={abrir}>
          Cancelar
        </Button>,
        <Button 
          icon={loadingActualizar ? <LoadingOutlined spin/> : <SaveOutlined/>} 
          key="submit" 
          type="primary" 
          onClick={guardar}
        >
          Aceptar
        </Button>,
      ]}
    >
      <p>Seleccionar Estado:</p>
      <Select
        placeholder="Estado"
        defaultValue={estadoSeleccionado}
        onChange={e => setEstadoSeleccionado(e)} 
        style={{ width: 300, marginBottom: '.5rem', marginRight: '.5rem' }}
      >
        <Option value={estadoAsistencia.ASISTIO}>Asistió</Option>
        <Option value={estadoAsistencia.TARDANZA}>Tardanza</Option>
        <Option value={estadoAsistencia.FALTA}>Falta</Option>
        <Option value={estadoAsistencia.DESCANSO}>Descanso</Option>
        <Option value={estadoAsistencia.GUARDIA}>Guardia</Option>
        <Option value={estadoAsistencia.PERMISO}>Permiso</Option>
        <Option value={estadoAsistencia.DESCANSO_MEDICO}>Descanso Médico</Option>
        <Option value={estadoAsistencia.EXAMEN_MEDICO}>Examen Médico</Option>
        <Option value={estadoAsistencia.LICENCIA}>Licencia</Option>
        <Option value={estadoAsistencia.SUSPENDIDO}>Suspendido</Option>
        <Option value={estadoAsistencia.VACACIONES}>Vacaciones</Option>
        <Option value={estadoAsistencia.BAJA}>Baja</Option>
      </Select>
      <p>Observación:</p>
      <TextArea
        placeholder="Observación..."
        rows={4}
        value={observacion}
        onChange={(e) => setObservacion(e.target.value)}
      />
    </Modal>
  )
};

ModalEditarAsistencia.propTypes = {
  visible: PropTypes.bool,
  abrir: PropTypes.func,
  loadingActualizar: PropTypes.bool,
  actualizar: PropTypes.func
};

export default ModalEditarAsistencia;

