import React from 'react';
import PropTypes from 'prop-types';
import { Image, Modal, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';

// usuario fecha_registro observacion

function ModalRegistroAsistencia({fecha, registro=[], visible, abrir}) {

  const columnas = [
    {
      title: "#",
      width: 60,
      render: (_,__, i) => i+1
    },
    {
      title: "Fecha",
      width: 100,
      align:"center",
      dataIndex: "fecha_registro",
      render: (fecha) => <Tag>{moment(fecha).format("DD-MM-YY HH:mm")}</Tag>
    },
    {
      title: "Usuario",
      dataIndex: "usuario",
      width: 150,
      ellipsis: true,
      render: (e) => {
        const nombre = e && e.nombre ? e.nombre+" "+e.apellidos : "Sistema"
        return (<Tooltip title={nombre}>{nombre}</Tooltip>)
      }
    },
    {
      title: "Observacion",
      width: 300,
      dataIndex: "observacion",
    },
    {
      title: "Imagen",
      width: 80,
      dataIndex: "imagen",
      render: (e) => {
        if (e) {
          return <Image width={50} src={`data:image/png;base64, ${e}`}/>
        } else {
          return '-'
        }
      }
    }
  ];

  return (
    <Modal
      title={`Historial de Cambios - ${fecha}`}
      width={700}
      visible={visible}
      onOk={abrir}
      onCancel={abrir}
      centered
    >
      <Table
        rowKey={"fecha_registro"}
        size="small"
        columns={columnas}
        dataSource={registro}
        pagination={false}
        scroll={{ x: 750}}
      />
    </Modal>
  )
};

ModalRegistroAsistencia.propTypes = {
  fecha: PropTypes.string,
  registro: PropTypes.array,
  visible: PropTypes.bool,
  abrir: PropTypes.func
};

export default ModalRegistroAsistencia;

