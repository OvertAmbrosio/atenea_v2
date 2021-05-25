import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Modal, Spin, Typography } from 'antd';
import moment from 'moment';
import { buscarEmpleado } from '../../../services/apiEmpleado';
import metodos from '../../../constants/metodos';

const { Text } = Typography;

function ModalDetalle({visible, abrirModal, id, setId}) {
  const [empleado, setEmpleado] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(visible && id) cargarEmpleado();
    return () => {
      setEmpleado({});
      setId(null);
    }
  //eslint-disable-next-line
  }, [id]);

  async function cargarEmpleado() {
    setLoading(true);
    return await buscarEmpleado(metodos.EMPLEADOS_BUSCAR_DETALLE, id).then(({data}) => {
      if(data) setEmpleado(data);
    }).catch((err) => console.log(err)).finally(() => setLoading(false));
  };

  return (
    <Modal
      width={450}
      cancelText="Cancelar"
      okText="Aceptar"
      title="Detalle del Usuario"
      visible={visible}
      onOk={abrirModal}
      onCancel={abrirModal}
      destroyOnClose={true}
      centered
    >
      {loading ?
        (<Spin spinning size="large"/>)
        :
        (<Descriptions layout="vertical" bordered size="small" column={2}>
          {empleado && empleado.gestor&&(<Descriptions.Item label="Gestor:">{empleado && empleado.gestor.nombre && empleado && empleado.gestor.nombre}</Descriptions.Item>)}
          <Descriptions.Item label="Tipo de Doc.:">{empleado && empleado.tipo_documento}</Descriptions.Item>
          <Descriptions.Item label="Numero de Doc.:">
            <Text copyable>{empleado && empleado.numero_documento}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Nacimiento:">{empleado && empleado.fecha_nacimiento && moment(empleado && empleado.fecha_nacimiento).format('DD-MM-YYYY')}</Descriptions.Item>
          {empleado && empleado.fecha_ingreso&&(<Descriptions.Item label="Fecha de Ingreso">{moment(empleado && empleado.fecha_ingreso).format('DD-MM-YYYY')}</Descriptions.Item>)}
          {empleado && empleado.fecha_baja&&(<Descriptions.Item label="Fecha de Baja">{moment(empleado && empleado.fecha_baja).format('DD-MM-YYYY')}</Descriptions.Item>)}
          <Descriptions.Item label="Nacionalidad">{empleado && empleado.nacionalidad?empleado && empleado.nacionalidad:'-'}</Descriptions.Item>
          <Descriptions.Item label="Observación">{empleado && empleado.observacion}</Descriptions.Item>
        </Descriptions>)
      }
    </Modal>
  )
}

ModalDetalle.propTypes = {
  visible: PropTypes.bool,
  abrirModal: PropTypes.func,
  id: PropTypes.string,
  setId: PropTypes.func
}

export default ModalDetalle

