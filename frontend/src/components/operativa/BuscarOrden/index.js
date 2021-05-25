import React, { useState, useEffect } from 'react';
import { Card, Checkbox, Col, Input, Radio, Row, Select, Typography } from 'antd';

import { getOrdenes } from '../../../services/apiOrden';
import metodos from '../../../constants/metodos';
import moment from 'moment';
import CuerpoConsulta from './CuerpoConsulta';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function Index() {
  const [dataOrden, setDataOrden] = useState([]);
  const [codigo, setCodigo] = useState(null);
  const [field, setField] = useState('codigo_requerimiento');
  const [limite, setLimite] = useState(1);
  const [listaFechas, setListaFechas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    if (listaFechas && listaFechas.length > 0) {
      setFechaSeleccionada(0);
    }
  },[listaFechas])

  async function buscarOrden() {
    setLoading(true);
    return getOrdenes(true, { metodo: metodos.ORDENES_BUSCAR_ORDEN, codigo, field, limite })
      .then(({data}) => {
        if (data && data.length > 0) {
          setListaFechas(data.map((e) => e && e.fecha_registro));
          setDataOrden(data);
        } else {
          setListaFechas([]);
          setDataOrden([]);
        }
      }).catch((err) => console.log(err)).finally(() => setLoading(false))
  };

  return (
    <div style={{ margin: '.5rem 0' }}>
      <Title level={5}>Seleccionar tipo de Busqueda</Title>
      <Row style={{ margin: '1rem 0' }} align="middle" justify="space-between">
        <Col>
          <Radio.Group 
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            <Radio value="codigo_requerimiento">Requerimiento</Radio>
            <Radio value="codigo_cliente">Codigo Cliente</Radio>
            <Radio value="codigo_trabajo">Orden de Trabajo</Radio>
          </Radio.Group>
          <Search
            size="small"
            placeholder="Ingresar Codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onSearch={buscarOrden}
            style={{ width: 150, marginRight: '1rem'}}
          />
        </Col>
        <Col>
          <Checkbox 
            checked={limite === 1 ? true :false} 
            onChange={(e) => setLimite(e.target.checked ? 1 : 0)}
          >
            Limitar Tiempo
          </Checkbox>
        </Col>
      </Row>
      <Card 
        loading={loading}
        size="small"
        title="Resultado de la Consulta" 
        extra={
          <Select
            size="small"
            placeholder="Registros"
            style={{ width: 150 }}
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e)}
            defaultActiveFirstOption
            autoFocus
          >
          {
            listaFechas && listaFechas.length > 0 ?
            listaFechas.map((fecha, i) => 
              <Option key={i} value={i}>{moment(fecha).format("DD-MM-YY")}</Option>
            ):null
          }  
          </Select>
        }
      >
      {
        (fechaSeleccionada || fechaSeleccionada === 0) && dataOrden && dataOrden.length > 0 && dataOrden[fechaSeleccionada] && dataOrden[fechaSeleccionada].codigo_requerimiento ?
        (
          <CuerpoConsulta orden={dataOrden[fechaSeleccionada]}/>
        ):null
      }
      </Card>
    </div>
  )
};

