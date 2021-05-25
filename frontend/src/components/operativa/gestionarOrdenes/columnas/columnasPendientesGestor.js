import React from 'react';
import { Button, Dropdown, Input, Menu, Space, Tag, Tooltip, Typography } from 'antd';
import { HistoryOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { blue, purple } from '@ant-design/colors';
import moment from 'moment';

import TagEstado from '../../administrarOrdenes/TagEstado';
import capitalizar from '../../../../libraries/capitalizar';
import { ordenesB2B } from '../../../../constants/valoresToa';
import TagHoras from '../../../common/TagHoras';
import Cronometro from '../../administrarOrdenes/Cronometro';
import { tipoOrdenes } from '../../../../constants/tipoOrden';

const { Text } = Typography;

function columnasBaseGestor({
  filtros={},
  abrirRegistro
}) {

  return [
    {
      title: '#',
      width: 50,
      fixed: 'left',
      render: (_,__,i) => i+1
    },
    {
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
          return <Text copyable strong style={{ color: '#003055'}}><Tag color="#108ee9" style={{ fontSize: '1rem' }}>{req}</Tag></Text>
        } else {
          return <Text copyable strong>{req}</Text>
        }
      },
    },
    // AQUI IRÁ LAS COLUMNAS PARA AGREGAR
    {
      averias: true,
      altas: true,
      title: 'Time Slot',
      dataIndex: 'tipo_agenda',
      width: 100,
      align: 'center',
      filters: filtros.filtroTimeSlot ? filtros.filtroTimeSlot.filter((e) => e.text) : [],
      onFilter: (v,r) => {
        if (r.tipo_agenda && v ) {
          return  r.tipo_agenda.indexOf(v) === 0;
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
    {
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
      render: (fecha, row) => <TagHoras fecha={fecha} tipo={row.tipo} tipoAgenda={row.tipo_agenda}/>
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
      render: (fecha, row) => {
        if (row.tipo === tipoOrdenes.AVERIAS) {
          return (<Cronometro fecha={fecha}/>)
        } else {
          return (<TagHoras fecha={fecha} tipo={row.tipo} tipoAgenda={row.tipo_agenda}/>)
        }
      }
    },
    {
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
  ];
};

export function columnasPendientesGestor({
  filtros={},
  abrirReiterada,
  abrirInfancia
}) {

  return [
    {
      key: "codigo_cliente",
      title: 'Codigo Cliente',
      dataIndex: 'codigo_cliente',
      width: 120,
      render: (req) => <Text copyable>{req}</Text>
    },
    {
      key: "tipo",
      title: 'Tipo',
      dataIndex: 'tipo',
      width: 100,
      filters: filtros.filtroTipo ? filtros.filtroTipo : [],
      onFilter: (v,r) => r.tipo ? r.tipo.indexOf(v) === 0 : false,
      render: (t) => t ? capitalizar(t) : '-'
    },
    {
      key: 'tipo_requerimiento',
      title: 'Tipo Req.',
      dataIndex: 'tipo_requerimiento',
      width: 120,
      align: 'center',
      filters: filtros.filtroTipoRequerimiento ? filtros.filtroTipoRequerimiento : [],
      onFilter: (v,r) => r.tipo_requerimiento.indexOf(v) === 0
    },
    {
      key: 'tipo_tecnologia',
      title: 'Tecnologia',
      dataIndex: 'tipo_tecnologia',
      width: 120,
      filters: filtros.filtroTipoTecnologia ? filtros.filtroTipoTecnologia : [],
      onFilter: (v,r) => r.tipo_tecnologia.indexOf(v) === 0
    },
    {
      key: 'codigo_trabajo',
      title: 'Orden Trabajo',
      dataIndex: 'codigo_trabajo',
      width: 120,
      render: (req) => <Text copyable>{req}</Text>
    },
    {
      key: 'codigo_peticion',
      title: 'Peticion',
      dataIndex: 'codigo_peticion',
      width: 120,
      render: (req) => <Text copyable>{req}</Text>
    },
    {
      key: 'codigo_ctr',
      title: 'CTR',
      dataIndex: 'codigo_ctr',
      align: "center",
      width: 60,
      filters: filtros.filtroCtr ? filtros.filtroCtr : [],
      onFilter: (v,r) => String(r.codigo_ctr).indexOf(String(v)) === 0,
    },
    {
      key: 'codigo_nodo',
      title: 'Nodo',
      dataIndex: 'codigo_nodo',
      align: "center",
      width: 75,
      filters: filtros.filtroNodo ? filtros.filtroNodo : [],
      onFilter: (v,r) => String(r.codigo_nodo).indexOf(String(v)) === 0,
    },
    {
      key: 'codigo_troba',
      title: 'Troba',
      dataIndex: 'codigo_troba',
      width: 90,
      filters: filtros.filtroTroba ? filtros.filtroTroba : [],
      onFilter: (v,r) => String(r.codigo_troba).indexOf(String(v)) === 0,
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
      key: 'numero_reiterada',
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
      key: 'infancia',
      title: 'Infancia',
      dataIndex: 'infancia',
      width: 100,
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
    {
      key: 'distrito',
      title: 'Distrito',
      dataIndex: 'distrito',
      width: 160,
      filters: filtros.filtroDistrito ? filtros.filtroDistrito : [],
      onFilter: (v,r) => r.distrito.indexOf(v) === 0
    },
    {
      key: 'direccion',
      title: 'Dirección',
      dataIndex: 'direccion',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (direccion) => (
        <Tooltip placement="topLeft" title={direccion}>
          {direccion}
        </Tooltip>
      )
    },
    {
      key: 'bucket',
      title: 'Bucket',
      dataIndex: 'bucket',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: filtros.filtroBucket ? filtros.filtroBucket : [],
      onFilter: (v,r) => r.bucket.indexOf(v) === 0,
      render: (bckt) => (
        <Tooltip placement="topLeft" title={bckt}>
          {bckt}
        </Tooltip>
      )
    },
    {
      key: 'estado_toa',
      title: 'Estado Toa',
      dataIndex: 'estado_toa',
      width: 150,
      align: 'center',
      filters: filtros.filtroEstadoToa ? filtros.filtroEstadoToa : [],
      onFilter: (v,r) => r.estado_toa.indexOf(v) === 0,
      render: (e) => <TagEstado estado={e}/>
    },
    {
      key: 'estado_gestor',
      title: 'Estado Gestor',
      dataIndex: 'estado_gestor',
      width: 150,
      align: 'center',
      filters: filtros.filtroEstadoGestor ? filtros.filtroEstadoGestor : [],
      onFilter: (v,r) => r.estado_gestor.indexOf(v) === 0,
      render: (e) => <TagEstado estado={e}/>
    },
    {
      key: 'contrata',
      title: 'Contrata',
      dataIndex: 'contrata',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: filtros.filtroContrata ? filtros.filtroContrata : [],
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
      key: 'tecnico',
      title: 'Tecnico TOA',
      dataIndex: 'tecnico',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: filtros.filtroTecnico ? filtros.filtroTecnico : [],
      onFilter: (v,r) => {
        if (v === '-') {
          return !r.tecnico
        } else if( r.tecnico !== undefined && r.tecnico._id) {
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
      key: 'tecnico_liteyca',
      title: 'Tecnico Asignado',
      dataIndex: 'tecnico_liteyca',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      filters: filtros.filtroTecnicoAsignado ? filtros.filtroTecnicoAsignado : [],
      onFilter: (v,r) => {
        if (v === '-') {
          return !r.tecnico_liteyca
        } else if( r.tecnico_liteyca !== undefined && r.tecnico_liteyca._id) {
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
      key: 'observacion_gestor',
      title: 'Observacion Gestor',
      dataIndex: 'observacion_gestor',
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (o) => <Tooltip placement="topLeft" title={o}>{o} </Tooltip>
    },
    {
      key: 'tipo_cita',
      title: 'Cita',
      dataIndex: 'tipo_cita',
      align: 'center',
      width: 100,
      filters: filtros.filtroTipoCita ? filtros.filtroTipoCita : [],
      onFilter: (v,r) => r.tipo_cita ? r.tipo_cita.indexOf(v) === 0 : null,
      render: (e) => e ? capitalizar(e) : null
    },
    {
      key: 'fecha_cita',
      title: 'Fecha Cita',
      dataIndex: 'fecha_cita',
      width: 150,
      align: "center",
      filters: filtros.filtroFechaCita ? filtros.filtroFechaCita : null,
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
      key: 'fecha_asignado',
      title: 'Fecha Asignado',
      dataIndex: 'fecha_asignado',
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
      key: 'fecha_registro',
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
  ];
};

export function generarColumnasGestor(columnasUsuario=[], {
  filtros,
  abrirReiterada,
  abrirInfancia,
  abrirRegistro,
  listarOrdenes
}) {
  if (columnasUsuario && columnasUsuario.length > 0) {
    let columnasAux = [];
    columnasUsuario.forEach((key) => {
      let index = columnasPendientesGestor({ filtros, abrirReiterada, abrirInfancia }).findIndex((e) => e.dataIndex === key);
      if (index > -1) {
        columnasAux.push(columnasPendientesGestor({ filtros, abrirReiterada, abrirInfancia })[index])
      };     
    });
    let newColumns = columnasAux.filter((e) => e);
    let base = columnasBaseGestor({filtroTimeSlot: filtros.filtroTimeSlot, abrirRegistro, listarOrdenes });
    base.splice(2, 0, ...newColumns);
    return base;
  } else {
    let base = columnasBaseGestor({filtros, abrirRegistro, listarOrdenes });
    base.splice(2, 0, ...columnasPendientesGestor({
      filtros,
      abrirReiterada,
      abrirInfancia,
    }));

    return base;
  };
};