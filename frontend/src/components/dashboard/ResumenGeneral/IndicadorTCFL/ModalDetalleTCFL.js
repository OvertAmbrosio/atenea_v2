import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table, Tabs, Tag, Typography } from 'antd';
import moment from 'moment';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { orange, geekblue } from '@ant-design/colors';
//eslint-disable-next-line
import { TOrdenesToa, IOrdenesToa } from '../../../../libraries/separarField';

const { Text } = Typography;

/**
 * @param {object} props 
 * @param {boolean} props.visible
 * @param {function} props.abrir
 * @param {string} props.nombre
 * @param {TOrdenesToa[]} props.plazo
 * @param {TOrdenesToa[]} props.vencidas
 */
function ModalDetalleTCFL({visible, abrir, nombre, plazo=[], vencidas=[], hora}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  //eslint-disable-next-line
  }, []);

  const columnasDetalle = [
    {
      title: '#',
      width: 40,
      align: 'center',
      render: (_,__,i) => i+1
    },
    {
      title: 'Requerimiento',
      dataIndex: IOrdenesToa['codigo de requerimiento'],
      width: 115,
      align: 'center',
      render: (r) => <Text copyable>{r}</Text>
    },
    {
      title: 'Cliente',
      dataIndex: IOrdenesToa['codigo de cliente'],
      width: 100,
      align: 'center',
      render: (r) => <Text copyable>{r}</Text>
    },
    {
      title: 'Gestor',
      dataIndex: 'gestor',
      width: 180,
      ellipsis: true,
      render: (t) => t && t.nombre ? <Text>{`${t.nombre} ${t.apellidos}`}</Text> : '-'
    },
    {
      title: 'Tecnico',
      dataIndex: 'tecnico',
      width: 180,
      ellipsis: true,
      render: (t) => t && t.nombre ? <Text>{`${t.nombre} ${t.apellidos}`}</Text> : '-'
    },
    {
      title: 'Carnet',
      dataIndex: 'tecnico',
      width: 80,
      render: (t) => t && t.carnet ? <Text copyable>{t.carnet}</Text> : '-'
    },
    {
      title: 'Actividad',
      dataIndex: IOrdenesToa['subtipo de actividad'],
      width: 220,
    },
    {
      title: 'Tipo de Cita',
      dataIndex: IOrdenesToa['tipo de cita'],
      width: 150,
      align: 'center',
      render: (cita) => {
        if (cita === "Cliente") {
          return <Tag color={geekblue[3]}>{cita}</Tag>
        } else {
          return <Tag color={orange.primary}>{cita}</Tag>
        }
      }
    },
    {
      title: 'Fecha Registro',
      dataIndex: IOrdenesToa['fecha de registro legados'],
      width: 120,
      align: 'center',
      render: (f) => moment(f, 'DD/MM/YY HH:mm A').format('DD/MM/YY HH:mm')
    },
    {
      title: 'Fecha Liquidado',
      dataIndex: IOrdenesToa.hora_de_pre_no_realizado_tecnico,
      width: 120,
      align: 'center',
      render: (f) => moment(f, 'YYYY-MM-DD HH:mm').format('DD/MM/YY HH:mm')
    },
    {
      title: 'Horas',
      dataIndex: IOrdenesToa['fecha de registro legados'],
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (f, row) => {
        let a = moment(row.hora_de_pre_no_realizado_tecnico, 'YYYY-MM-DD HH:mm').diff(moment(f, 'DD/MM/YY HH:mm A'), 'hour');
        if (a < hora) {
          return <Tag color="success">{a}</Tag>
        } else {
          return <Tag color="error">{a}</Tag>
        }
      }
    }
  ];

  return (
    <Modal
      title={`Detalle ordenes - ${nombre}`}
      width="85vw"
      visible={visible}
      onOk={abrir}
      onCancel={abrir}
      destroyOnClose
      centered
    >
      <Tabs tabPosition="top" animated={true}>
        <Tabs.TabPane 
          tab={<span><CheckCircleOutlined /> En Plazo</span>}  
          key="1"
        >
          <Table
            rowKey='codigo de requerimiento'
            dataSource={plazo}
            columns={columnasDetalle}
            loading={loading}
            pagination={{
              pageSize: 50
            }}
            size="small"
            bordered
            scroll={{ y: '60vh', x: '80vw' }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane 
          tab={<span><CloseCircleOutlined /> Vencidas</span>}  
          key="2"
        >
          <Table
            rowKey='codigo de requerimiento'
            dataSource={vencidas}
            columns={columnasDetalle}
            loading={loading}
            pagination={{
              pageSize: 50
            }}
            size="small"
            bordered
            scroll={{ y: '60vh', x: '80vw' }}
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
};

ModalDetalleTCFL.propTypes = {
  visible: PropTypes.bool,
  abrir: PropTypes.func,
  nombre: PropTypes.string,
  plazo: PropTypes.array,
  vencidas: PropTypes.array,
  hora: PropTypes.number
};

export default ModalDetalleTCFL;

