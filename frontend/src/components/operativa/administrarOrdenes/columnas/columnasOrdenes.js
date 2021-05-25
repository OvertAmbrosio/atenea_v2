import React from 'react';
import { Badge, Button, Dropdown, Input, Menu, Space, Tag, Tooltip, Typography } from 'antd';
import { blue, purple } from '@ant-design/colors';
import { HistoryOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons'
import moment from 'moment';

import TagEstado from '../TagEstado';
import { tipoOrdenes } from '../../../../constants/tipoOrden';
import TagHoras from '../../../common/TagHoras';
import { ordenesB2B } from '../../../../constants/valoresToa';
import TagDias from '../../../common/TagDias';
import Cronometro from '../Cronometro';

const { Text } = Typography;

export default function ColumnasOrdenes({
  tipo,
  listaFiltros={},
  abrirReiterada,
  abrirInfancia,
  abrirRegistro,
}) {

  const columnasGeneral = [
    {
      averias: true,
      altas: true,
      title: '#',
      width: 50,
      fixed: 'left',
      render: (_,__,i) => Number(i)+1
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
      filters: listaFiltros && listaFiltros.filtroTecnologia ? listaFiltros.filtroTecnologia : null,
      onFilter: (v,r) => r.tipo_tecnologia.indexOf(v) === 0,
    },
    {
      averias: false,
      altas: true,
      title: 'PAI',
      dataIndex: 'indicador_pai',
      width: 60,
      aling: 'center',
      filters: listaFiltros.filtroPai ? listaFiltros.filtroPai : null,
      onFilter: (v,r) => String(r.indicador_pai).indexOf(String(v)) === 0,
    },
    {
      averias: false,
      altas: true,
      title: 'Tipo Req.',
      dataIndex: 'tipo_requerimiento',
      align:'center',
      width: 100,
      filters: listaFiltros.filtroTipoReq ? listaFiltros.filtroTipoReq : null,
      onFilter: (v,r) => r.tipo_requerimiento.indexOf(v) === 0
    },
    {
      averias: true,
      altas: true,
      title: 'Nodo',
      dataIndex: 'codigo_nodo',
      width: 70,
      filters: listaFiltros.filtroNodo ? listaFiltros.filtroNodo : null,
      onFilter: (v,r) => r.codigo_nodo.indexOf(v) === 0,
    },
    {
      averias: true,
      altas: true,
      title: 'Troba',
      dataIndex: 'codigo_troba',
      width: 90,
      sorter: (a, b) => {
        if (a.codigo_troba < b.codigo_troba) {
          return -1;
        }
        if (a.codigo_troba > b.codigo_troba) {
          return 1;
        }
        return 0;
      },
      filters: listaFiltros.filtroTroba ? listaFiltros.filtroTroba : null,
      onFilter: (v,r) => r.codigo_troba.indexOf(v) === 0,
    },
    {
      averias: true,
      altas: false,
      title: 'Reiterada',
      dataIndex: 'numero_reiterada',
      width: 100,
      align: 'center',
      sorter: (a,b) => a.numero_reiterada - b.numero_reiterada,
      render: (r, obj) => {
        if (r && r !== '0' && r !== '-') {
          return <Tag color="#E5302F" onClick={() => abrirReiterada(obj.codigo_cliente)} style={{ cursor: 'pointer' }}>{r}</Tag>
        } else {
          return '-'
        }
      }
    },
    {
      averias: true,
      altas: false,
      title: 'Infancia',
      dataIndex: 'infancia',
      width: 90,
      align: 'center',
      filters: [{text: 'Si', value: true}, {text: 'No', value: false}],
      onFilter: (v,r) => {
        if (v) {
          return r.infancia
        } else {
          return !r.infancia
        }
      },
      render: (inf) => {
        if (inf) {
          return <Tag color="purple" onClick={() => abrirInfancia(inf)} style={{ cursor: 'pointer' }}>Si</Tag>
        } else {
          return '-'
        }
      }
    },
    // {
    //   averias: true,
    //   altas: false,
    //   title: 'Cliente',
    //   dataIndex: 'nombre_cliente',
    //   width: 200,
    //   ellipsis: {
    //     showTitle: false,
    //   },
    //   render: (c) => (
    //     <Tooltip placement="topLeft" title={c}>
    //       {c}
    //     </Tooltip>
    //   )
    // },
    {
      averias: true,
      altas: true,
      title: 'Distrito',
      dataIndex: 'distrito',
      width: 160,
      filters: listaFiltros.filtroDistrito ? listaFiltros.filtroDistrito : null,
      onFilter: (v,r) => r.distrito.indexOf(v) === 0
    },
    {
      averias: true,
      altas: false,
      title: 'Dirección',
      dataIndex: 'direccion',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (g) => (
        <Tooltip placement="topLeft" title={g}>
          {g}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Bucket',
      dataIndex: 'bucket',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: listaFiltros.filtroBucket ? listaFiltros.filtroBucket : null,
      onFilter: (v,r) => r.bucket.indexOf(v) === 0,
      render: (bckt) => (
        <Tooltip placement="topLeft" title={bckt}>
          {bckt}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Estado Toa',
      dataIndex: 'estado_toa',
      width: 150,
      align: 'center',
      filters: listaFiltros.filtroEstadoToa ? listaFiltros.filtroEstadoToa : null,
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
      filters: listaFiltros.filtroEstadoGestor ? listaFiltros.filtroEstadoGestor : null,
      onFilter: (v,r) => r.estado_gestor.indexOf(v) === 0,
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
      filters: listaFiltros.filtroContrata ? listaFiltros.filtroContrata : null,
      onFilter: (v,r) => {
        if (v === '-') {
          return r.contrata && !r.contrata._id
        } else if( r.contrata && r.contrata._id) {
          return r.contrata._id.indexOf(v) === 0
        } else {
          return false
        }
      },
      render: (c) => (
        <Tooltip placement="topLeft" title={c && c.nombre ? c.nombre:'-'}>
          {c && c.nombre ? c.nombre:'-'}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Gestor Asignado',
      dataIndex: 'gestor',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: listaFiltros.filtroGestorAsignado ? listaFiltros.filtroGestorAsignado : null,
      onFilter: (v,r) => {
        console.log(r.gestor);
        if (v === '-') {
          return r.gestor && !r.gestor._id
        } else if(r.gestor && r.gestor._id) {
          return r.gestor._id.indexOf(v) === 0
        } else {
          return false
        }
      },
      render: (g) => (
        <Tooltip placement="topLeft" title={g && g.nombre ? g.nombre+' '+g.apellidos:'-'}>
          {g && g.nombre ? g.nombre+' '+g.apellidos:'-'}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Tecnico Toa',
      dataIndex: 'tecnico',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
     sorter: (a, b) => {
        if (a.tecnico && a.tecnico.nombre && b.tecnico && b.tecnico.nombre) {
          if (a.tecnico.nombre < b.tecnico.nombre) {
            return -1;
          }
          if (a.tecnico.nombre > b.tecnico.nombre) {
            return 1;
          }
        }
        return 0;
      },
      filters: listaFiltros.filtroTecnicoToa ? listaFiltros.filtroTecnicoToa : [{text: '', value: ''}],
      onFilter: (v,r) => {
        if (v === '-') {
          return r.tecnico && !r.tecnico._id
        } else if(r.tecnico && r.tecnico._id) {
          return r.tecnico._id.indexOf(v) === 0
        } else {
          return false
        }
      },
      render: (t) => (
        <Tooltip placement="topLeft" title={t && t.nombre ? t.nombre+' '+t.apellidos:'-'}>
          {t && t.nombre ? t.nombre+' '+t.apellidos:'-'}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Tecnico Asignado',
      dataIndex: 'tecnico_liteyca',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => {
        if (a.tecnico_liteyca && a.tecnico_liteyca.nombre && b.tecnico_liteyca && b.tecnico_liteyca.nombre) {
          if (a.tecnico_liteyca.nombre < b.tecnico_liteyca.nombre) {
            return -1;
          }
          if (a.tecnico_liteyca.nombre > b.tecnico_liteyca.nombre) {
            return 1;
          }
        }
        return 0;
      },
      filters: listaFiltros.filtroTecnicoLiteyca ? listaFiltros.filtroTecnicoLiteyca : [{text: '', value: ''}],
      onFilter: (v,r) => {
        if (v === '-') {
          return r.tecnico_liteyca && !r.tecnico_liteyca._id
        } else if(r.tecnico_liteyca && r.tecnico_liteyca._id) {
          return r.tecnico_liteyca._id.indexOf(v) === 0
        } else {
          return false
        }
      },
      render: (t) => (
        <Tooltip placement="topLeft" title={t && t.nombre ? t.nombre+' '+t.apellidos:'-'}>
          {t && t.nombre ? t.nombre+' '+t.apellidos:'-'}
        </Tooltip>
      )
    },
    {
      averias: true,
      altas: true,
      title: 'Observacion Gestor',
      dataIndex: 'observacion_gestor',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      filters: listaFiltros.filtroObservacion ? listaFiltros.filtroObservacion : null,
      onFilter: (v,r) => {
        if (v === '-') {
          return !r.observacion_gestor
        } else if(r.observacion_gestor) {
          return String(r.observacion_gestor).toLowerCase().replace(/ /g, "").indexOf(String(v).toLowerCase().replace(/ /g, "")) === 0
        } else {
          return false
        }
      },
      render: (o) => <Tooltip placement="topLeft" title={o}>{o} </Tooltip>
    },
    {
      averias: true,
      altas: true,
      title: 'Fecha Cita',
      dataIndex: 'fecha_cita',
      width: 150,
      align: 'center',
      filters: listaFiltros.filtroFechaCita ? listaFiltros.filtroFechaCita : null,
      onFilter: (v,r) => {
        if (v === '-') {
          return !r.fecha_cita
        } else if(r.fecha_cita) {
          return moment(r.fecha_cita).format('DD/MM/YY').toString().indexOf(String(v)) === 0;
        } else {
          return false
        }
      },
      render: (fecha) => {
        if (fecha) {
          return moment(fecha).format('DD/MM/YY');
        } else {
          return '-';
        }
      }
    },
    {
      averias: false,
      altas: true,
      title: 'Fecha Asignado',
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
      altas: false,
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
      title: 'Time Slot',
      dataIndex: 'tipo_agenda',
      width: 100,
      align: 'center',
      filters: listaFiltros.filtroTimeSlot ? listaFiltros.filtroTimeSlot.filter((e) => e.text) : null,
      onFilter: (v,r) => {
        if (r.tipo_agenda && v ) {
          return r.tipo_agenda.indexOf(v) === 0;
        } else {
          return false;
        }
      },
      render: (e) => {
        if (e && e.length > 1) {
          return <Tag color={purple[3]}>{e}</Tag>
        } else {
          return '-';
        }
      }
    },
    {//tcfl 24h
      averias: true,
      altas: false,
      title: 'Horas',
      dataIndex: 'fecha_registro',
      width: 80,
      align: 'center',
      sorter: (a, b) => {
        if (moment().diff(a.fecha_registro, 'hours') < moment().diff(b.fecha_registro, 'hours')) {
          return -1;
        }
        if (moment().diff(a.fecha_registro, 'hours') > moment().diff(b.fecha_registro, 'hours')) {
          return 1;
        }
        return 0;
      },
      render: (fecha, row) => <TagHoras fecha={fecha} tipo={tipoOrdenes.AVERIAS} tipoAgenda={row.tipo_agenda}/>
    },
    {
      averias: true,
      altas: false,
      title: "Timer",
      dataIndex: "fecha_registro",
      fixed: "right",
      align: "center",
      width: 110,
      sorter: (a, b) => {
        if (moment().diff(a.fecha_registro, 'hours') < moment().diff(b.fecha_registro, 'hours')) {
          return -1;
        }
        if (moment().diff(a.fecha_registro, 'hours') > moment().diff(b.fecha_registro, 'hours')) {
          return 1;
        }
        return 0;
      },
      render: (fecha) => <Cronometro fecha={fecha}/>
    },
    {//tcfl 72h
      averias: false,
      altas: true,
      title: 'Dias',
      dataIndex: 'fecha_registro',
      width: 90,
      align: 'center',
      fixed: 'right',
      sorter: (a, b) => {
        if(!a.fecha_registro) {
          return -1
        };
        if(!b.fecha_registro) {
          return 1;
        }
        if (moment().diff(a.fecha_registro, 'days') < moment().diff(b.fecha_registro, 'days')) {
          return -1;
        }
        if (moment().diff(a.fecha_registro, 'days') > moment().diff(b.fecha_registro, 'days')) {
          return 1;
        }
        return 0;
      },
      render: (fecha) => <TagDias fecha={fecha}/>
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

  const columnasAverias = columnasGeneral.filter(e => e.averias);

  const columnasAltas = columnasGeneral.filter(e => e.altas);

  switch (tipo) {
    case tipoOrdenes.AVERIAS:
      return columnasAverias;  
    case tipoOrdenes.ALTAS:
      return columnasAltas;
    default:
      break;
  }
};