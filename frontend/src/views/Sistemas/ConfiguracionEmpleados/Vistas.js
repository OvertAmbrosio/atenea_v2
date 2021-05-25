import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Table, Tabs, Tag,  } from 'antd';
import { SaveOutlined, LoadingOutlined, CloudUploadOutlined, ReloadOutlined } from '@ant-design/icons';

import Contenedor from '../../../components/common/Contenedor';
import { getAreas } from '../../../services/apiAreas';
import { getCargos } from '../../../services/apiCargos';
import { getTipoEmpleados } from '../../../services/apiTipoEmpleados';
import { getVistas, postVista, putVista } from '../../../services/apiVistas';
import metodos from '../../../constants/metodos';
import TituloVista from '../../../components/common/TituloContent';
import AsignarVista from '../../../components/sistemas/confEmpleados/AsignarVista';
import cogoToast from 'cogo-toast';

const { TabPane } = Tabs;

export default function Vistas() {
  const [listaVistas, setListaVistas] = useState([]);
  const [listaAreas, setListaAreas] = useState([]);
  const [listaCargos, setListaCargos] = useState([]);
  const [listaTipos, setListaTipos] = useState([]);
  const [tituloRuta, setTituloRuta] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [cargosSeleccionados, setCargosSeleccionados] = useState([]);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [loadingActualizar, setLoadingActualizar] = useState(false);
  const [loadingVistas, setLoadingVistas] = useState(false);
  const [idVista, setIdVista] = useState(null);

  useEffect(() => {
    listarVistas();
    listarAreas();
    listarCargos();
    listarTipoEmpleados();
  }, []);

  async function listarVistas() {
    setLoadingVistas(true);
    return await getVistas(false).then(({data}) => {
      if (data && data.length > 0) {
        setListaVistas(data);
      } else {
        setListaVistas([]);
      };  
    }).catch((err) => console.log(err)).finally(() => setLoadingVistas(false))
  };

  async function listarAreas() {
    return await getAreas(false).then(({data}) => {
      if (data && data.length > 0) {
        setListaAreas(data);
      } else {
        setListaAreas([]);
      }
    })
  };

  async function listarCargos() {
    return await getCargos(false).then(({data}) => {
      if (data && data.length > 0) {
        setListaCargos(data);
      } else {
        setListaCargos([]);
      }
    })
  };

  async function listarTipoEmpleados() {
    return await getTipoEmpleados(false).then(({data}) => {
      if (data && data.length > 0) {
        setListaTipos(data);
      } else {
        setListaTipos([]);
      }
    })
  };

  async function guardarVista() {
    setLoadingGuardar(true);
    return await postVista({metodo: metodos.VISTA_CREAR, data: {
      titulo: tituloRuta,
      ruta: ruta,
      cargos: cargosSeleccionados,
      tipos_empleado: tiposSeleccionados,
      areas: areasSeleccionadas
    }}).catch((err) => console.log(err)).finally(() => setLoadingGuardar(false));
  };

  async function actualizarVista() {
    if(!idVista) return cogoToast.warn("Falta el id.", { position: "top-right" });
    setLoadingActualizar(true);
    return await putVista(idVista, {metodo: metodos.VISTA_ACTUALIZAR, data: {
      titulo: tituloRuta,
      ruta: ruta,
      cargos: cargosSeleccionados,
      tipos_empleado: tiposSeleccionados,
      areas: areasSeleccionadas
    }}).catch((err) => console.log(err)).finally(() => setLoadingActualizar(false));
  };

  const columnas = [
    {
      title: "#",
      width: 60,
      render: (_,__,i) => i+1 
    },
    {
      title: "ID",
      dataIndex: "_id",
      width: 150
    },
    {
      title: "Titulo",
      dataIndex: "titulo",
      widt: 150
    },
    {
      title: "Ruta",
      dataIndex: "ruta"
    },
    {
      title: "Areas",
      dataIndex: "areas",
      width: 150  ,
      render: (obj) => {
        if (obj && obj.length > 0) {
          return (<div>
          {
            obj.map((area,i) => (
              <Tag color="blue" key={i}>{area.nombre}</Tag>
            ))
          }
          </div>)
        } else {
          
        }
      } 
    },
    {
      title: "Cargos",
      dataIndex: "cargos",
      render: (obj) => {
        if (obj && obj.length > 0) {
          return (<div>
          {
            obj.map((cargo,i) => (
              <Tag color="purple" key={i}>{cargo.nombre}</Tag>
            ))
          }
          </div>)
        } else {
          
        }
      } 
    },
    {
      title: "Tipos",
      dataIndex: "tipos_empleado",
      render: (obj) => {
        if (obj && obj.length > 0) {
          return (<div>
          {
            obj.map((tipo,i) => (
              <Tag color="orange" key={i}>{tipo.nombre}</Tag>
            ))
          }
          </div>)
        } else {
          
        }
      } 
    }
  ];

  return (
    <div>
      <TituloVista titulo="Configurar Vista" subtitulo="Configuracion de Empleados"/>
      <Contenedor>
        <Tabs style={{paddingLeft: '1rem'}} animated={false}>
          <TabPane
            tab={
              <span>
                <CloudUploadOutlined />
                Asignar Vista
              </span>
            }
            key="1"
          >
            <AsignarVista vistas={listaVistas}/>
          </TabPane>
          <TabPane
            tab={
              <span>
                <CloudUploadOutlined />
                Crear Vista
              </span>
            }
            key="2"
          >
            <h4>Titulo Ruta</h4>
            <Input 
              style={{ marginBottom: '1rem', width: 250 }}
              placeholder="Titulo de la ruta"
              size="small"
              onChange={(e) => setTituloRuta(e.target.value)}
              value={tituloRuta}
            />
            <h4>Dirección Ruta</h4>
            <Input 
              style={{ marginBottom: '1rem', width: 250 }}
              placeholder="Dirección de la ruta"
              size="small"
              onChange={(e) => setRuta(e.target.value)}
              value={ruta}
            />
            <h4>Lista Areas</h4>
            <Checkbox.Group
              style={{ marginBottom: '1rem' }}
              options={listaAreas.length > 0 ? listaAreas.map((a,i) => ({key:i,  label: a.nombre, value: a._id})) : [] }
              value={areasSeleccionadas}
              onChange={(a) => setAreasSeleccionadas(a)}
            />
            <h4>Lista Cargos</h4>
            <Checkbox.Group
              style={{ marginBottom: '1rem' }}
              options={listaCargos.length > 0 ? listaCargos.map((a,i) => ({key:i,  label: a.nombre, value: a._id})) : [] }
              value={cargosSeleccionados}
              onChange={(a) => setCargosSeleccionados(a)}
            />
            <h4>Lista Tipos</h4>
            <Checkbox.Group
              style={{ marginBottom: '1rem' }}
              options={listaTipos.length > 0 ? listaTipos.map((a,i) => ({key:i,  label: a.nombre, value: a._id})) : [] }
              value={tiposSeleccionados}
              onChange={(a) => setTiposSeleccionados(a)}
            /><br/>
            <Button
              style={{ margin: '1rem .2rem' }}
              icon={loadingGuardar ? <LoadingOutlined spin/> : <SaveOutlined/>}
              type="primary"
              size="small"
              onClick={guardarVista}
            >
              Guardar
            </Button>
            <Button
              style={{ margin: '1rem .2rem' }}
              icon={loadingActualizar ? <LoadingOutlined spin/> : <ReloadOutlined/>}
              type="primary"
              size="small"
              onClick={actualizarVista}
            >
              Actualizar
            </Button>
            <Table
              rowKey="_id"
              onRow={(record) => {
                return {
                  onClick: () => {
                    setIdVista(record._id);
                    setTituloRuta(record.titulo);
                    setRuta(record.ruta);
                    setCargosSeleccionados(record.cargos.map(e => e._id))
                    setTiposSeleccionados(record.tipos_empleado.map(e => e._id))
                    setAreasSeleccionadas(record.areas.map(e => e._id))
                  },
                };
              }}
              dataSource={listaVistas}
              columns={columnas}
              loading={loadingVistas}
              size="small"
              pagination={false}
              scroll={{ x: "70vw" }}
            />
          </TabPane>
        </Tabs>
      </Contenedor>
    </div>
  )
}
