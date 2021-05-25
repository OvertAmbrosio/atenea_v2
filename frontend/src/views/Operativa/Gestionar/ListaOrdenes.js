import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { CheckCircleOutlined, UnorderedListOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Cookie from "js-cookie";

import Contenedor from '../../../components/common/Contenedor';
import TituloVista from '../../../components/common/TituloContent';
import OrdenesPendientesGestor from '../../../components/operativa/gestionarOrdenes/OrdenesPendientesGestor';
import metodos from '../../../constants/metodos';
import { getEmpleados } from '../../../services/apiEmpleado';
import OrdenesLiquidadas from '../../../components/operativa/administrarOrdenes/OrdenesLiquidadas';
// import OrdenesSinAsignar from '../../../components/operativa/gestionarOrdenes/OrdenesSinAsignar';
import cogoToast from 'cogo-toast';
import { socket } from '../../../services/socket';
import { AuthToken } from '../../../services/authToken';
import variables from '../../../constants/config';
import { estadosToa } from '../../../constants/valoresToa';
import OrdenesEnProceso from '../../../components/operativa/gestionarOrdenes/OrdenesEnProceso';

const { TabPane } = Tabs;

const estadoPendiente = [
  "-",
  String(estadosToa.CANCELADO).toLowerCase(), 
  String(estadosToa.INICIADO).toLowerCase(), 
  String(estadosToa.SUSPENDIDO).toLowerCase(), 
  String(estadosToa.PENDIENTE).toLowerCase(),
]

export default function ListaOrdenes() {
  const [usuario] = useState(new AuthToken(Cookie.get(variables.TOKEN_STORAGE_KEY)).decodedToken);
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [ordenesCerradas, setOrdenesCerradas] = useState([]);
  const [listaGestores, setListaGestores] = useState([]);
  const [listaTecnicos, setListaTecnicos] = useState([]);

  useEffect(() => {
    conectarSocket();
    cargarGestores();
    cargarTecnicos();
    return () => {
      console.log("Socket desconectado.");
      cogoToast.info("Sincronización finalizada.", { position: "bottom-left" })
      socket.off(metodos.ORDENES_SOCKET_PENDIENTES);
    };
  //eslint-disable-next-line
  }, []);

  async function cargarGestores() {
    return await getEmpleados(false, { metodo: metodos.EMPLEADOS_LISTAR_GESTORES })
      .then(({data}) => setListaGestores(data ? data : []))
      .catch((err) => console.log(err))
  };

  async function cargarTecnicos() {
    return await getEmpleados(false, { metodo: metodos.EMPLEADOS_LISTAR_TECNICOS })
      .then(({data}) => {
        if(data) setListaTecnicos(data);
      }).catch((err) => console.log(err))
  };

  function conectarSocket() {
    socket.emit(metodos.UNIR_SALA_GESTOR_PENDIENTES, usuario);
    cogoToast.loading("Conectando con el servidor...", { position: "bottom-left" })
    socket.on(metodos.ORDENES_SOCKET_PENDIENTES, ({data}) => {
      console.log("nueva data", data.length);
      cogoToast.success("Base de datos actualizada.", { position: "bottom-left" });
      if (data && data.length > 0) {
        setOrdenesPendientes(data.filter((e) => estadoPendiente.includes(e.estado_toa)));
        setOrdenesCerradas(data.filter((e) => !estadoPendiente.includes(e.estado_toa)));
      };      
    })
    socket.on('disconnect', () => {
      console.log("desconectado por inactividad");
      cogoToast.loading("Reconectando al servidor...", { position: "bottom-left" });
      socket.emit(metodos.UNIR_SALA_GESTOR_PENDIENTES, usuario);
    })
  };

  return (
    <div>
      <TituloVista titulo="Lista de Ordenes" subtitulo="Gestionar Ordenes"/>
      <Contenedor>
        <Tabs style={{paddingLeft: '1rem'}} animated={false}>
          <TabPane
            tab={
              <span>
                <UnorderedListOutlined />
                Ordenes Pendientes
              </span>
            }
            key="1"
          >
            <OrdenesPendientesGestor 
              usuario={usuario}
              ordenes={ordenesPendientes} 
              gestores={listaGestores} 
              tecnicos={listaTecnicos}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <InfoCircleOutlined/>
                Ordenes En Proceso  
              </span>
            }
            key="2"
          >
            <OrdenesEnProceso
              usuario={usuario}
              ordenes={ordenesCerradas}
            />
          </TabPane>
          {/* <TabPane
            tab={
              <span>
                <GlobalOutlined/>
                Ordenes Sin Asignar
              </span>
            }
            key="3"
          >
            <OrdenesSinAsignar
              tecnicos={listaTecnicos}
            />
          </TabPane> */}
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined/>
                Ordenes Liquidadas
              </span>
            }
            key="4"
          >
            <OrdenesLiquidadas tipo={null} gestor={true}/>
          </TabPane>
        </Tabs>
      </Contenedor>
    </div>
  )
}
