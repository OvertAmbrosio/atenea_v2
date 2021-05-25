import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider, Input, Radio, Row, Select, Space, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, SelectOutlined, SyncOutlined } from '@ant-design/icons';
import cogoToast from 'cogo-toast';

import capitalizar from '../../../../libraries/capitalizar';

const { Group } = Radio;
const { Option } = Select;

function MapaOpciones({gestion, abrir, guardar, ordenes=[], nuevaData, actualizar, contratas=[], gestores=[], tecnicos=[], estados=[]}) {
  const [tipoFiltro, setTipoFiltro] = useState(1);
  const [valorSeleccionado, setValorSeleccionado] = useState(null);

  useEffect(() => {
    setValorSeleccionado(null);
  }, [tipoFiltro]);

  function actualizarData() {
    actualizar();
    setTipoFiltro(1);
    setValorSeleccionado(null);
  };

  function aplicarFiltro() {
    switch (tipoFiltro) {
      case 1: return filtrarRequerimiento();        
      case 2: return filtrarContrata();
      case 3: return filtrarGestor();
      case 4: return filtrarTecnico();
      case 5: return filtrarEstado();
      default:
        break;
    }
  };

  const filtrarRequerimiento = () => {

    const nuevaData = ordenes.filter((e) => {
      console.log(e.codigo_requerimiento, valorSeleccionado)
      return (Number(e.codigo_requerimiento) === Number(valorSeleccionado))
    });
    if (nuevaData.length > 0) {
      guardar(nuevaData)
    } else {
      cogoToast.warn("No se encontraron resultados.", { position: 'top-right' });
    };
    return;
  };

  const filtrarContrata = () => {
    const nuevaData = ordenes.filter((e) => e.contrata && e.contrata === valorSeleccionado);
    if (nuevaData.length > 0) {
      guardar(nuevaData)
    } else {
      cogoToast.warn("No se encontraron resultados.", { position: 'top-right' });
    };
    return;
  };

  const filtrarGestor = () => {
    const nuevaData = ordenes.filter((e) => e.gestor && e.gestor === valorSeleccionado);
    if (nuevaData.length > 0) {
      guardar(nuevaData)
    } else {
      cogoToast.warn("No se encontraron resultados.", { position: 'top-right' });
    };
    return;
  };

  const filtrarTecnico = () => {
    const nuevaData = ordenes.filter((e) => e.tecnico && e.tecnico === valorSeleccionado);
    if (nuevaData.length > 0) {
      guardar(nuevaData)
    } else {
      cogoToast.warn("No se encontraron resultados.", { position: 'top-right' });
    };
    return;
  };

  const filtrarEstado = () => {
    const nuevaData = ordenes.filter((e) => String(e.estado_toa).toLowerCase() === String(valorSeleccionado).toLowerCase());
    if (nuevaData.length > 0) {
      guardar(nuevaData)
    } else {
      cogoToast.warn("No se encontraron resultados.", { position: 'top-right' });
    };
    return;
  };

  return (
    <div className="map-options-container">
      <Row align="middle" justify="ce">
        <Typography.Title level={5}>
          Opciones -{` `}
        </Typography.Title>
        {
          !nuevaData ? 
          <Tag 
            style={{ marginLeft: '.5rem' }} 
            color="success"
            icon={<CheckCircleOutlined/>}
          >
            Actualizado
          </Tag>
          :
          <Tag 
            style={{ marginLeft: '.5rem', cursor: 'pointer' }} 
            icon={<SyncOutlined/>}
            color="warning" 
            onClick={actualizarData}
          >
            Actualizar
          </Tag>
        }
      </Row>
      <Group style={{ margin: '.5rem 0' }} buttonStyle="solid" size="small" value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
        <Radio.Button key={1} value={1}>Codigo</Radio.Button>
        {!gestion && <Radio.Button key={2} value={2}>Contrata</Radio.Button>}
        {!gestion &&  <Radio.Button key={3} value={3}>Gestor</Radio.Button>}
        <Radio.Button key={4} value={4}>Tecnico</Radio.Button>
        <Radio.Button key={5} value={5}>Estado</Radio.Button>
      </Group>
      <Row style={{ display: tipoFiltro !== 1 && 'none'}} align="middle" >
        <span>Requerimiento:</span>
        <Input
          placeholder="Codigo"
          size="small"
          value={valorSeleccionado}
          onChange={(e) => setValorSeleccionado(e.target.value)}
          style={{ width: 200, margin: '.5rem 0 .5rem .5rem' }}
        />
      </Row>
      <div style={{ display: tipoFiltro !== 2 ? 'none': 'block' }}>
        Contrata:
        <Select 
          getPopupContainer={node => node.parentNode}
          size="small" 
          placeholder="Contrata" 
          style={{ width: 237, margin: '.5rem 0 .5rem .5rem' }}
          value={valorSeleccionado}
          onChange={e => setValorSeleccionado(e)}
        >
        {
          contratas && contratas.length > 0 && contratas.map((contrata,i) => (
            <Option key={i} value={contrata}>{contrata}</Option>
          ))
        }
        </Select>
      </div>
      <div style={{ display: tipoFiltro !== 3 && 'none' }}>
        Gestor:
        <Select 
          size="small" 
          placeholder="Gestor" 
          style={{ width: 250, margin: '.5rem 0 .5rem .5rem' }}
          value={valorSeleccionado}
          onChange={e => setValorSeleccionado(e)}
          showSearch
        >
        {
          gestores && gestores.length > 0 && gestores.map((gestor,i) => (
            <Option key={i} value={gestor}>{gestor}</Option>
          ))
        }
        </Select>
      </div>
      <div style={{ display: tipoFiltro !== 4 && 'none' }}>
        Tecnico:
        <Select 
          size="small" 
          placeholder="Tecnico" 
          style={{ width: 245, margin: '.5rem 0 .5rem .5rem' }}
          value={valorSeleccionado}
          onChange={(e) => setValorSeleccionado(e)}
          showSearch
        >
        {
          tecnicos && tecnicos.length > 0 && tecnicos.map((tecnico,i) => (
            <Option key={i} value={tecnico}>{tecnico}</Option>
          ))
        }
        </Select>
      </div>
      <div style={{ display: tipoFiltro !== 5 && 'none' }}>
        Estado:
        <Select 
          size="small" 
          placeholder="Estado" 
          style={{ width: 249, margin: '.5rem 0 .5rem .5rem' }}
          value={valorSeleccionado}
          onChange={(e) => setValorSeleccionado(e)}
        >
        {
          estados && estados.length > 0 && estados.map((estado,i) => (
            <Option key={i} value={estado}>{capitalizar(estado)}</Option>
          ))
        }
        </Select>
      </div>
      <Divider style={{ margin: '.5rem 0' }} />
      <Space size="small" style={{ margin: '.5rem 0'}}>
        <Button 
          icon={<SelectOutlined />} 
          onClick={aplicarFiltro}
          size="small" 
          type="primary"
        >
          Aplicar
        </Button>
        <Button 
          icon={<ReloadOutlined/>}
          size="small" 
          onClick={() => {
            guardar(ordenes);
            setValorSeleccionado(null);
          }}
        >
          Reiniciar
        </Button>
        <Button 
          icon={<CloseCircleOutlined/>} 
          onClick={abrir}
          size="small"
          type="primary" 
          danger 
        >
          Cerrar
        </Button>
      </Space>
    </div>
  )
};

MapaOpciones.propTypes = {
  gestion: PropTypes.bool,
  abrir: PropTypes.func,
  guardar: PropTypes.func,
  ordenes: PropTypes.array,
  nuevaData: PropTypes.bool,
  actualizar: PropTypes.func,
  contratas: PropTypes.array,
  gestores: PropTypes.array,
  tecnicos: PropTypes.array,
  estados: PropTypes.array,
};

export default MapaOpciones;

