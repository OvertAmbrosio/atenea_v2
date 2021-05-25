import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import { Badge, Button, Descriptions, Divider, Space } from 'antd';
import { EditOutlined, EnvironmentTwoTone, UserSwitchOutlined } from '@ant-design/icons';
import { purple } from '@ant-design/colors';
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

import { estadosToa } from '../../../../constants/valoresToa';
import colores from '../../../../constants/colores';
import capitalizar from '../../../../libraries/capitalizar';
import TagEstado from '../TagEstado';
import ModalAsignar from '../ModalsTabla/ModalAsignar';

const estiloCuerpo = {
  fontSize: '.73rem',
  margin: 0,
  padding: 5
};

function MapaMarcador({gestion=false, orden={}, color=false, contratas=[], gestores=[], tecnicos=[]}) {
  const [modalAsignar, setModalAsignar] = useState(false);

  const colorIcono = (estado) => {
    switch (capitalizar(estado)) {
      case estadosToa.PENDIENTE: return colores.warning;
      case estadosToa.SUSPENDIDO: return colores.error;
      case estadosToa.NO_REALIZADA: return colores.Completado;
      case estadosToa.INICIADO: return null;
      case estadosToa.COMPLETADO: return colores.success;
      case estadosToa.CANCELADO: return colores.Completado;
      default: return colores.Pendiente;
    }
  };

  const icon = L.divIcon({
    className: 'custom-icon',
    html: ReactDOMServer.renderToString(
      <EnvironmentTwoTone 
        style={{ fontSize: '1.7rem'}}
        twoToneColor={
          color ? color : colorIcono(orden.estado_toa)}
      />
    )    
  });

  const abrirModalAsignar = () => setModalAsignar(!modalAsignar);

  return (
    <Marker
      key={orden.codigo_requerimiento}
      position={[orden.direccion_polar_y, orden.direccion_polar_x]}
      icon={icon}
    >
      <Popup minWidth={250} closeOnEscapeKey>
        <Descriptions
          title={`Requerimiento: ${orden.codigo_requerimiento}`}
          size="small"
          bordered
          column={1}
        >
          <Descriptions.Item style={{ paddingBottom: 3 }} contentStyle={estiloCuerpo} labelStyle={estiloCuerpo} label="Estado:">
            <TagEstado estado={orden.estado_toa} />
          </Descriptions.Item>
          <Descriptions.Item style={{ paddingBottom: 3 }} contentStyle={estiloCuerpo} labelStyle={estiloCuerpo} label="Actividad:">{orden.subtipo_actividad}</Descriptions.Item>
          <Descriptions.Item style={{ paddingBottom: 3 }} contentStyle={estiloCuerpo} labelStyle={estiloCuerpo} label="Contrata:">{orden.contrata}</Descriptions.Item>
          <Descriptions.Item style={{ paddingBottom: 3 }} contentStyle={estiloCuerpo} labelStyle={estiloCuerpo} label="Gestor:">{orden.gestor}</Descriptions.Item>
          <Descriptions.Item style={{ paddingBottom: 3 }} contentStyle={estiloCuerpo} labelStyle={estiloCuerpo} label="Tecnico:">{orden.tecnico}</Descriptions.Item>
          <Descriptions.Item style={{ paddingBottom: 3 }} contentStyle={estiloCuerpo} labelStyle={estiloCuerpo} label="Extra:">
            <Space>
              {orden.infancia && <Badge count="i" style={{ fontSize: '1rem', fontWeight: 700, color: purple[7], backgroundColor: purple[1] }} />}
              {Number(orden.reiterada) > 0 && <Badge count={orden.reiterada} />}
            </Space>
          </Descriptions.Item>
        </Descriptions>
        <Divider style={{ margin: '.5rem 0' }} />
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<UserSwitchOutlined/>}
            onClick={abrirModalAsignar}
          >
            Asignar
          </Button>
          <Button
            size="small"
            disabled
            icon={<EditOutlined/>}
          >
            Nota
          </Button>
        </Space>
      </Popup>  
      <ModalAsignar
        gestion={gestion}
        visible={modalAsignar}
        abrir={abrirModalAsignar}
        contratas={contratas}
        gestores={gestores}
        tecnicos={tecnicos}
        ordenes={[orden.codigo_requerimiento]}
        setLoading={() => null}
        setOrdenes={() => null}
      />
    </Marker>
  )
};

MapaMarcador.propTypes = {
  gestion: PropTypes.bool,
  orden: PropTypes.object,
  color: PropTypes.string,
  contratas: PropTypes.array,
  gestores: PropTypes.array,
  tecnicos: PropTypes.array
};

export default MapaMarcador;

