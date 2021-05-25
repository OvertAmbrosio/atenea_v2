import React, { useState, useEffect } from 'react';
import { Button, Space, Table, Tag, Tooltip } from 'antd';
import { EditTwoTone, PlusOutlined, DeleteTwoTone } from '@ant-design/icons';
import moment from 'moment';

import Contenedor from '../../common/Contenedor';
import { getContratas, patchContrata, postContrata, putContrata } from '../../../services/apiContrata';
import metodos from '../../../constants/metodos';
import ModalContrata from './ModalContrata';
import colores from '../../../constants/colores';
import ModalEliminar from './ModalEliminar';
import { getZonas } from '../../../services/apiZonas';
import { getEmpleados } from '../../../services/apiEmpleado';
import ExcelContratas from '../../excelExports/ExcelContratas';

export default function TablaContratas() {
  const [loading, setLoading] = useState(false);
  const [dataContratas, setDataContratas] = useState([]);
  const [dataZonas, setDataZonas] = useState([]);
  const [dataJefes, setDataJefes] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [contrata, setContrata] = useState({});

  useEffect(() => {
    cargarContratas();
    cargarZonas();
    cargarJefes();
  },[]);

  async function cargarContratas() {
    setLoading(true);
    await getContratas(true, metodos.CONTRATA_LISTAR_TODO)
      .then(({data}) => setDataContratas(data && data))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  async function cargarZonas() {
    return await getZonas()
      .then(({data}) => setDataZonas(data && data))
      .catch((error) => console.log(error))
  };

  async function cargarJefes() {
    return await getEmpleados(false, { metodo: metodos.EMPLEADOS_LITAR_JEFES_CONTRATA })
      .then(({data}) => setDataJefes(data))
      .catch((err) => console.log(err));
  }

  async function crearContrata(data) {
    await postContrata({ metodo: metodos.CONTRATA_CREAR, contrata: data })
      .then(async() => await cargarContratas())
      .catch((error) => {
        console.log(error);
        abrirModalCrear();
      })
  };

  async function editarContrata(data) {
    if (contrata._id) {
      await putContrata(contrata._id, { metodo: metodos.CONTRATA_EDITAR, contrata: data })
        .then(async() => await cargarContratas())
        .catch((error) => {
          console.log(error);
          abrirModalEditar();
        })
    }
  };

  async function eliminarContrata(id, data) {
    await patchContrata(id, data)
      .then(async() => await cargarContratas())
      .catch(error => {
        console.log(error);
        abrirModalEliminar();
      })
  };

  const abrirModalCrear = () => setModalCrear(!modalCrear);
  const abrirModalEditar = () => setModalEditar(!modalEditar);
  const abrirModalEliminar = () => setModalEliminar(!modalEliminar);

  const columnas = [
    {
      title: '#',
      width: 50,
      render: (_,__,i) => i+1
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      ellipsis: {
        title: true
      },
      width: 200,
      render: (n) => <Tooltip placement="topLeft" title={n}>{n}</Tooltip>
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      width: 150,
      align: 'center',
      render: (a) => {
        if (a) {
          return (<Tag color="success">Activo</Tag>)
        } else {
          return (<Tag color="error">Inactivo</Tag>)
        }
      }
    },
    {
      title: 'Jefe Contrata',
      dataIndex: 'jefe',
      ellipsis: {
        title: true
      },
      width: 200,
      render: (n) => <Tooltip placement="topLeft" title={n && n.nombre}>{n && n.nombre+' '+n.apellidos}</Tooltip>
    },
    {
      title: 'Zonas',
      dataIndex: 'zonas',
      width: 200,
      render: (u) => {
        if (u && u.length > 0) {
          return u.map((obj, i) => (<Tag key={i}>{obj?obj.nombre:'-'}</Tag>))
        } else { return "-"}
      }
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'fecha_incorporacion',
      align:'center',
      width: 150,
      render: (f) => f?moment(f).format('DD-MM-YYYY'):'-'
    },
    {
      title: 'Fecha Baja',
      dataIndex: 'fecha_baja',
      align:'center',
      width: 150,
      render: (f) => f ? moment(f).format('DD-MM-YYYY'): '-'
    },
    {
      title: 'Representante',
      dataIndex: 'representante',
      ellipsis: {
        title: true
      },
      width: 200,
      render: (n) => <Tooltip placement="topLeft" title={n}>{n}</Tooltip>
    },
    {
      title: 'Observación',
      dataIndex: 'observacion',
      ellipsis: {
        title: true
      },
      width: 200,
      render: (n) => <Tooltip placement="topLeft" title={n}>{n}</Tooltip>
    },
    {
      title: 'Acciones',
      dataIndex: '_id',
      align: 'center',
      width: 100,
      fixed: "right",
      render: (_, row) => (
        <span>
          <EditTwoTone
            title="Editar"
            twoToneColor={colores.warning} 
            style={{paddingRight:'.5rem', fontSize: '1.5rem'}}
            onClick={() => {
              abrirModalEditar();
              // console.log(row);
              setContrata(row);
            }}
          />
          <DeleteTwoTone 
            title="Configuraciones"
            twoToneColor={colores.error} 
            style={{paddingRight:'.5rem', fontSize: '1.5rem'}}
            onClick={() => {
              abrirModalEliminar();
              setContrata(row);
            }}
          />
        </span>
      )
    }
  ];

  return (
    <Contenedor>
      <Space>
        <Button 
          size="small"
          style={{ margin: '.5rem 0' }}
          icon={<PlusOutlined/>}
          onClick={abrirModalCrear}
        >
          Agregar
        </Button>
        <ExcelContratas contratas={dataContratas}/>
      </Space>
      
      <Table
        resp
        rowKey="_id"
        style={{ marginBottom: '1rem' }}
        columns={columnas}
        dataSource={dataContratas}
        loading={loading}
        size="small"
        scroll={{ y: '65vh', x: '60vw' }}
        pagination={false}
      />
      {/* MODAL PARA AGREGAR CONTRATA */}
      <ModalContrata
        jefes={dataJefes}
        visible={modalCrear}
        setVisible={setModalCrear}
        guardar={crearContrata}
        dataZonas={dataZonas}
        accion="crear"
      />
      {/* MODAL PARA EDITAR CONTRATA */}
      <ModalContrata
        jefes={dataJefes}
        visible={modalEditar}
        setVisible={setModalEditar}
        guardar={editarContrata}
        dataZonas={dataZonas}
        contrata={contrata}
        accion="editar"
      />
      {/* MODAL ELIMINAR CONTRATA */}
      <ModalEliminar
        visible={modalEliminar}
        setVisible={setModalEliminar}
        guardar={eliminarContrata}
        contrata={contrata}
      />
    </Contenedor>
  )
}
