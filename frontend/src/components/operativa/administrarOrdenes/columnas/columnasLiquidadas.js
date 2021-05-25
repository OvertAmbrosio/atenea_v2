import React from 'react';
import { Badge, Dropdown, Input, Menu, Space, Tag, Tooltip, Typography, Button } from 'antd';
import { HistoryOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { blue } from '@ant-design/colors'
import moment from 'moment';

import TagEstado from '../TagEstado';
import { tipoOrdenes } from '../../../../constants/tipoOrden';
import TagHoras from '../../../common/TagHoras';
import { ordenesB2B } from '../../../../constants/valoresToa';

const { Text } = Typography;

export default function columnasOrdenesLiquidadas(
  tipo,
  listaFiltros={},
  abrirRegistro
) {

  const columnasGenerales = [
    {
      averias: true,
      altas: true,
      title: '#',
      width: 40,
      fixed: 'left',
      render: (_,__,i) => i+1
    },
    {
      averias: true,
      altas: true,
      title: 'Requerimiento',
      dataIndex: 'codigo_requerimiento',
      width: 130,
      fixed: 'left',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            size="small"
            placeholder={`Buscar requerimiento`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button size="small" onClick={() => clearFilters()}>
              Reiniciar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (v,r) => {
        if (r["codigo_requerimiento"]) {
          return (r["codigo_requerimiento"]).toString().toLowerCase().includes(v.toLowerCase())
        } else {
          return false;
        };
      },
      render: (req, row) => {
        if (row.subtipo_actividad && ordenesB2B.includes(row.subtipo_actividad)) {
          return (
            <Badge
              status="processing" 
              text={<Text copyable strong>{req}</Text>}
            />
          )
        } else {
          return (<Text copyable strong>{req}</Text>)
        }
      }
    },
    {
      averias: false,
      altas: true,
      title: 'Orden Trabajo',
      dataIndex: 'codigo_trabajo',
      width: 120,
      render: (req) => <Text copyable>{req}</Text>
    },
    {
      averias: false,
      altas: true,
      title: 'Peticion',
      dataIndex: 'codigo_peticion',
      width: 120,
      render: (req) => <Text copyable>{req}</Text>
    },
    {
      averias: true,
      altas: true,
      title: 'Codigo Cliente',
      dataIndex: 'codigo_cliente',
      width: 120,
      render: (req) => <Text copyable>{req}</Text>
    },
    {
      averias: true,
      altas: true,
      title: 'Tecnologia',
      dataIndex: 'tipo_tecnologia',
      align: 'center',
      width: 120,
      filters: listaFiltros.filtroTecnologia ? listaFiltros.filtroTecnologia : [],
      onFilter: (v,r) => r.tipo_tecnologia.indexOf(v) === 0,
    },
    {
      averias: true,
      altas: true,
      title: 'CTR',
      dataIndex: 'codigo_ctr',
      width: 60,
      filters: listaFiltros.filtroCtr ? listaFiltros.filtroCtr : [],
      onFilter: (v,r) => String(r.codigo_ctr).indexOf(String(v)) === 0,
    },
    {
      averias: true,
      altas: true,
      title: 'Nodo',
      dataIndex: 'codigo_nodo',
      width: 70,
      filters: listaFiltros.filtroNodo ? listaFiltros.filtroNodo : [],
      onFilter: (v,r) => r.codigo_nodo.indexOf(v) === 0,
    },
    {
      averias: true,
      altas: true,
      title: 'Troba',
      dataIndex: 'codigo_troba',
      width: 70,
      sorter: (a, b) => {
        if (a.codigo_troba < b.codigo_troba) {
          return -1;
        }
        if (a.codigo_troba > b.codigo_troba) {
          return 1;
        }
        return 0;
      },
    },
    {
      averias: true,
      altas: true,
      title: 'Distrito',
      dataIndex: 'distrito',
      width: 160,
      filters: listaFiltros.filtroDistrito ? listaFiltros.filtroDistrito : [],
      onFilter: (v,r) => r.distrito.indexOf(v) === 0
    },
    {
      averias: true,
      altas: true,
      title: 'Estado Toa',
      dataIndex: 'estado_toa',
      width: 150,
      align: 'center',
      filters: listaFiltros.filtroEstadoToa ? listaFiltros.filtroEstadoToa : [],
      onFilter: (v,r) => r.estado_toa.indexOf(v) === 0,
      render: (e) => <TagEstado estado={e}/>
    },
    {
      averias: true,
      altas: true,
      title: 'Estado Gestor',
      dataIndex: 'estado_gestor',
      width: 150,
      align: 'center',
      filters: listaFiltros.filtroEstadoGestor ? listaFiltros.filtroEstadoGestor : [],
      onFilter: (v,r) => r.estado_gestor.indexOf(v) === 0,
      render: (e) => <TagEstado estado={e}/>
    },
    {
      averias: true,
      altas: true,
      title: 'Estado Liquidado',
      dataIndex: 'estado_liquidado',
      width: 150,
      align: 'center',
      render: (e) => <TagEstado estado={e}/>
    },
    {
      averias: true,
      altas: true,
      title: 'Contrata',
      dataIndex: 'contrata',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: listaFiltros.filtroContrata ? listaFiltros.filtroContrata : [],
      onFilter: (v,r) => {
        if (v === '-') {
          return !r.contrata
        } else if( r.contrata !== undefined) {
          return r.contrata._id.indexOf(v) === 0
        } else {
          return false
        }
      },
      render: (c) => (
        <Tooltip placement="topLeft" title={c ? c.nombre:'-'}>
          {c ? c.nombre:'-'}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Gestor',
      dataIndex: 'gestor',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: listaFiltros.filtroGestor ? listaFiltros.filtroGestor : [],
      onFilter: (v,r) => {
        if (v === '-') {
          return !r.gestor
        } else if( r.gestor !== undefined) {
          return r.gestor._id.indexOf(v) === 0
        } else {
          return false
        }
      },
      render: (g) => (
        <Tooltip placement="topLeft" title={g ? g.nombre+' '+g.apellidos:'-'}>
          {g ? g.nombre+' '+g.apellidos:'-'}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,  
      title: 'Tecnico Liquidado',
      dataIndex: 'tecnico_liquidado',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: listaFiltros.filtroTecnico ? listaFiltros.filtroTecnico : [],
      onFilter: (v,r) => {
        if (v === '-') {
          return !r.tecnico_liquidado
        } else if( r.tecnico_liquidado ) {
          return r.tecnico_liquidado._id.indexOf(v) === 0
        } else {
          return false
        }
      },
      render: (t) => (
        <Tooltip placement="topLeft" title={t ? t.nombre+' '+t.apellidos:'-'}>
          {t ? t.nombre+' '+t.apellidos:'-'}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: false,
      title: 'Usuario Liquidado',
      dataIndex: 'codigo_usuario_liquidado',
      width: 150,
    },
    {
      averias: true,
      altas: false,
      title: 'Tipo Averia',
      dataIndex: 'tipo_averia',
      width: 150,
    },
    {
      averias: true,
      altas: false,
      title: 'Descripción Liquidado',
      dataIndex: 'descripcion_codigo_liquidado',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      align: 'left',
      render: (t) => (
        <Tooltip placement="topLeft" title={t}>{t}</Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Observación Gestor',
      dataIndex: 'observacion_gestor',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      align: 'left',
      render: (t) => (
        <Tooltip placement="topLeft" title={t}>{t}</Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Observación Liquidado',
      dataIndex: 'observacion_liquidado',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      align: 'left',
      render: (t) => (
        <Tooltip placement="topLeft" title={t}>{t}</Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Fecha Registro',
      dataIndex: 'fecha_registro',
      width: 150,
      render: (fecha) => {
        if (fecha) {
          return moment(fecha).format('DD/MM/YY HH:mm');
        } else {
          return '-';
        }
      }
    },
    {
      averias: true,
      altas: true,
      title: 'Fecha Liquidado',
      dataIndex: 'fecha_liquidado',
      width: 150,
      render: (fecha) => {
        if (fecha) {
          return moment(fecha).format('DD/MM/YY HH:mm');
        } else {
          return '-';
        }
      }
    },
    {
      averias: true,
      altas: true,
      title: 'Time Slot',
      dataIndex: 'tipo_agenda',
      width: 100,
      align: 'center',
      filters: listaFiltros.filtroTimeSlot ? listaFiltros.filtroTimeSlot.filter((e) => e.text) : [],
      onFilter: (v,r) => {
        if (r.tipo_agenda && v ) {
          return  r.tipo_agenda.indexOf(v) === 0;
        } else {
          return false;
        }
      },
      render: (ts) => {
        if (ts) {
          return <Tag color="#f50">{ts}</Tag>
        } else {
          return;
        }
      }
    },
    {
      averias: true,
      altas: false,
      title: 'Plazo 24h',
      dataIndex: 'fecha_registro',
      width: 100,
      align: 'center',
      fixed: 'right',
      sorter: (a, b) => {
        if (moment(a.fecha_liquidado).diff(a.fecha_registro, 'hours') < moment(a.fecha_liquidado).diff(b.fecha_registro, 'hours')) {
          return -1;
        }
        if (moment(a.fecha_liquidado).diff(a.fecha_registro, 'hours') > moment(a.fecha_liquidado).diff(b.fecha_registro, 'hours')) {
          return 1;
        }
        return 0;
      },
      render: (fecha, row) => <TagHoras fecha={fecha} tipo={row.tipo} tipoAgenda={row.tipo_agenda}/>
    },
    {
      averias: false,
      altas: true,
      title: 'Plazo 72h',
      dataIndex: 'fecha_registro',
      width: 100,
      align: 'center',
      fixed: 'right',
      sorter: (a, b) => {
        if (moment(a.fecha_liquidado).diff(a.fecha_registro, 'hours') < moment(a.fecha_liquidado).diff(b.fecha_registro, 'hours')) {
          return -1;
        }
        if (moment(a.fecha_liquidado).diff(a.fecha_registro, 'hours') > moment(a.fecha_liquidado).diff(b.fecha_registro, 'hours')) {
          return 1;
        }
        return 0;
      },
      render: (fecha, row) => {
        if (fecha) {
          let horas = moment(row.fecha_liquidado).diff(fecha, 'hours');
          return <Tag color={row.fecha_cita ? 'geekblue' : horas < 72 && !row.fecha_cita ? 'success': horas === 72 && !row.fecha_cita ? 'warning' :  'error' }>{horas}</Tag>
        } else {
          return <Tag>-</Tag>
        }
      }
    },
    {
      averias: true,
      altas: true,
      title: ' ',
      dataIndex: 'codigo_requerimiento',
      width: 40,
      align: 'left',
      fixed: 'right',
      render: (codigo_requerimiento, row) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item icon={<HistoryOutlined/>} onClick={() => abrirRegistro(codigo_requerimiento)}>
                Registros
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOutlined
            style={{ fontSize: '1.5rem', color: blue.primary, cursor: "pointer" }}
          />
        </Dropdown>
        
      )
    }
  ]

  const columnasAverias = columnasGenerales.filter(e => e.averias);

  const columnasAltas = columnasGenerales.filter(e => e.altas);

  switch (tipo) {
    case tipoOrdenes.AVERIAS:
      return columnasAverias;  
    case tipoOrdenes.ALTAS:
      return columnasAltas;
    default:
      break;
  }
};