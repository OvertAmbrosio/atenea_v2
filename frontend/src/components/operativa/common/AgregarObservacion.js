import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Input, Button } from 'antd';
import { FileImageOutlined, LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import metodos from '../../../constants/metodos';
import { socket } from '../../../services/socket';

const { TextArea } = Input;

function AgregarObservacion({ usuario, ordenes, setOrdenes, loading, setLoading }) {
  const [observacion, setObservacion] = useState(null);

  async function enviarObservacion() {
    setLoading(true);
    socket.emit(metodos.ORDENES_SOCKET_OBSERVACION, { usuario, observacion, ordenes});
    setObservacion(null);
    setOrdenes([]);
  };

  return (
    <Col sm={16}>
      <Row>
        <Col sm={17} style={{ paddingRight: '1rem' }}>
          <TextArea
            size="small"
            placeholder="Observacion..."
            value={observacion}
            rows={3}
            onChange={(e) => setObservacion(e.target.value)}
            style={{ width: "100%", marginRight: '.5rem' }}
          />
        </Col>
        <Col sm={6}>
          <Row align="top">
            <Button
              size="small"
              type="primary"
              icon={ loading ? <LoadingOutlined spin/> : <SaveOutlined/>}
              disabled={loading || ordenes.length === 0}
              onClick={enviarObservacion}
            >
              Guardar
          </Button>
          </Row>
          <Row align="bottom" style={{ marginTop: '1rem' }}>
            <Button
              size="small"
              type="primary"
              icon={<FileImageOutlined/>}
              disabled={true}
              onClick={enviarObservacion}
            >
              Imagen
          </Button>
          </Row>
        </Col>
      </Row>
    </Col>
  )
};

AgregarObservacion.propTypes = {
  usuario: PropTypes.object,
  ordenes: PropTypes.array,
  setOrdenes: PropTypes.func,
};

export default AgregarObservacion;

