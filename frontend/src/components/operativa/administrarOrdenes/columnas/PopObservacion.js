import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Popconfirm } from 'antd';
import { EditTwoTone } from '@ant-design/icons';
import { patchOrdenes } from '../../../../services/apiOrden';
import metodos from '../../../../constants/metodos';

function PopObservacion({row, listarOrdenes}) {
  const [observacion, setObservacion] = useState(null);
  const [visible, setVisible] = useState(false);

  async function enviarObservacion() {
    if (observacion) {
      await patchOrdenes({metodo: metodos.AGREGAR_OBSERVACION, id: row._id, observacion})
        .then(() => {
          cancelarPop();
          listarOrdenes();
        }).catch((e) => console.log(e))
    } else {
      setVisible(false);
    }
  };

  const cancelarPop = () => {
    setObservacion(null);
    setVisible(false);
  };

  return (
    <Popconfirm
      visible={visible}
      placement="topLeft"
      title={() => (
        <div>
          <p>Observacion - <strong>{row.codigo_requerimiento}</strong></p>
          <Input
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Observacion"
            size="small"
            style={{ width: 250 }}
          />
        </div>
      )} 
      icon={<EditTwoTone twoToneColor="#EB984E" />}
      onConfirm={enviarObservacion}
      onCancel={cancelarPop}
    >
      <span onClick={() => setVisible(!visible)}>Observacion</span>
      {/* <EditTwoTone style={{ fontSize: '1.5rem' }} twoToneColor="#EB984E" }/> */}
    </Popconfirm>
  )
}

PopObservacion.propTypes = {
  row: PropTypes.object,
  listarOrdenes: PropTypes.func
}

export default PopObservacion

