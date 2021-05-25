import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Input, Modal } from 'antd';

const { TextArea } = Input;

function ModalArea({obj={}, visible, abrir, guardar}) {
  const [nombre, setNombre] = useState(null);
  const [descripcion, setDescripcion] = useState(null);

  useEffect(() => {
    if (obj && obj.nombre) {
      setNombre(obj.nombre);
      setDescripcion(obj.descripcion)
    }
  //eslint-disable-next-line
  },[obj]);
  
  const onOk = async () => {
    await guardar({nombre, descripcion});
    abrir();
  }

  return (
    <Modal
      visible={visible}
      onOk={onOk}
      onCancel={abrir}
      width={350}
      centered
      destroyOnClose
    >
      <h3>Nombre</h3>
      <Input 
        value={nombre}
        size="small"
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
      /><br/><br/>
      <h3>Descripción</h3>
      <TextArea
        value={descripcion}
        rows={4}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
      />
    </Modal>
  )
};

ModalArea.propTypes = {
  obj: PropTypes.object,
  visible: PropTypes.bool,
  abrir: PropTypes.func
};

export default ModalArea;

