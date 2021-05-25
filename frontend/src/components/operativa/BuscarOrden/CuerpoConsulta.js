import React from 'react';
import PropTypes from 'prop-types';
import { Descriptions, Tag, Typography } from 'antd';
import { geekblue } from '@ant-design/colors';

import { tipoOrdenes } from '../../../constants/tipoOrden';
import TagEstado from '../administrarOrdenes/TagEstado';
import moment from 'moment';

function CuerpoConsulta({orden={}}) {
  return (
    <Descriptions column={5} layout="vertical" bordered size="small">
      <Descriptions.Item label="Tipo">
        {orden.tipo === tipoOrdenes.AVERIAS ? "Averia" : orden.tipo === tipoOrdenes.ALTAS ? "Alta": '-'}
      </Descriptions.Item>
      <Descriptions.Item label="Requerimiento">
        <Typography.Text copyable strong>{orden.codigo_requerimiento}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="Codigo Cliente">
        <Typography.Text copyable strong>{orden.codigo_cliente}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="Orden Trabajo">
        <Typography.Text copyable strong>{orden.codigo_trabajo}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="Zonal">
        <Typography.Text strong>{orden.codigo_zonal}</Typography.Text>
      </Descriptions.Item>
      {/* ----------------------------------------- */}
      <Descriptions.Item label="Bandeja" span={2}>
        <Tag color={geekblue[4]}>{orden.codigo_ctr}</Tag>- <Typography.Text >{`${orden.descripcion_ctr}`}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="Nodo">{orden.codigo_nodo}</Descriptions.Item>
      <Descriptions.Item label="Troba">{orden.codigo_troba}</Descriptions.Item>
      <Descriptions.Item label="Tecnología">{orden.tipo_tecnologia}</Descriptions.Item>
      {/* ---------------------------------------------- */}
      <Descriptions.Item label="Bucket">{orden.bucket}</Descriptions.Item>
      <Descriptions.Item label="Estado Gestor">
        <TagEstado estado={orden.estado_gestor}/>
      </Descriptions.Item>
      <Descriptions.Item label="Estado Toa">
        <TagEstado estado={orden.estado_toa}/>  
      </Descriptions.Item>
      <Descriptions.Item label="Estado Liquidado" span={2}>
        <TagEstado estado={orden.estado_liquidado}/> 
      </Descriptions.Item>
      {/* <Descriptions.Item label="Estado Tecnico">{orden.estado_Tecnico}</Descriptions.Item> */}
      {/* ------------------------------------------------------ */}
      <Descriptions.Item label="Motivo">{orden.codigo_motivo}</Descriptions.Item>
      <Descriptions.Item label="Detalle Motivo" span={2}>
        <Typography.Text ellipsis>{orden.detalle_motivo}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="Tipo Req.">{orden.tipo_requerimiento}</Descriptions.Item>
      <Descriptions.Item label="Tipo Averia">{orden.tipo_averia}</Descriptions.Item>
      {/* -------------------------------------------------------- */}
      <Descriptions.Item label="Detalle Trabajo" span={3}>
        <Typography.Text ellipsis>{orden.detalle_trabajo}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="Nombre Cliente" span={2}>
        <Typography.Text ellipsis>{orden.nombre_cliente}</Typography.Text>
      </Descriptions.Item>
      {/* ---------------------------------------------------- */}
      <Descriptions.Item label="Distrito" span={2}>
        <Typography.Text ellipsis>{orden.distrito}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="Dirección" span={3}>
        <Typography.Text ellipsis>{orden.direccion}</Typography.Text>
      </Descriptions.Item>
      {/* ---------------------------------------------- */}
      <Descriptions.Item label="Fecha Registro">
        <Tag>{moment(orden.fecha_registro).isValid() ? moment(orden.fecha_registro).format('DD/MM/YY HH:mm'): '-'}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Fecha Liquidado">
        <Tag>{moment(orden.fecha_liquidado).isValid() ? moment(orden.fecha_liquidado).format('DD/MM/YY HH:mm'): '-'}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Fecha Cita">
        <Tag>{moment(orden.fecha_cita).isValid() ? moment(orden.fecha_cita).format('DD/MM/YY HH:mm'): '-'}</Tag>
      </Descriptions.Item>
    </Descriptions>
  )
};

CuerpoConsulta.propTypes = {
  orden: PropTypes.object
};

export default CuerpoConsulta;

