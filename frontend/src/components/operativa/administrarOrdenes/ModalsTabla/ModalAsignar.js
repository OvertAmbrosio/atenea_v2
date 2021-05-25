import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Select, Input, Radio, Cascader } from 'antd';
import cogoToast from 'cogo-toast';
import metodos from '../../../../constants/metodos';
import { patchOrdenes } from '../../../../services/apiOrden';

const { Option } = Select;
const { TextArea } = Input;

function ModalAsignar({gestion=false, visible, abrir, contratas=[], gestores=[], tecnicos=[], ordenes=[], setOrdenes, loading, setLoading}) {
  const [contrataSeleccionada, setContrataSeleccionada] = useState(null);
  const [gestorSeleccionado, setGestorSeleccionado] = useState(null);
  const [tecnicoIndexSeleccionado, setTecnicoIndexSeleccionado] = useState(null);
  const [listaTecnicosOrdenado, setListaTecnicosOrdenado] = useState([]);
  const [observacion, setObservacion] = useState(null);
  const [tipoAsignar, setTipoAsignar] = useState(1);

  useEffect(() => {
    ordenarListaTecnicos();
  //eslint-disable-next-line
  }, [tecnicos])

  useEffect(() => {
    setGestorSeleccionado(null);
    setTecnicoIndexSeleccionado(null);
  },[]);

  useEffect(() => {
    setContrataSeleccionada(null);
    setGestorSeleccionado(null);
    setTecnicoIndexSeleccionado(null);
  }, [tipoAsignar])

  const asignarOrden = async () => {
    if (gestion) {
      if (tipoAsignar === 1 && gestorSeleccionado) {
        asignarOrdenes({
          ordenes,
          gestor: gestorSeleccionado,
          observacion
        });
      } else if (tipoAsignar === 2 && tecnicos.length > 0 && tecnicoIndexSeleccionado !== null) {
        const index = tecnicoIndexSeleccionado;
        asignarOrdenes({
          ordenes,
          contrata: tecnicos[index] && tecnicos[index].contrata ? tecnicos[index].contrata._id : null,
          gestor: tecnicos[index] && tecnicos[index].gestor ? tecnicos[index].gestor._id : null,
          tecnico: tecnicos[index] ? tecnicos[index]._id: null,
          carnet: tecnicos[index] ? tecnicos[index].carnet: null,
          observacion
        });
      } else {
        cogoToast.warn('No has seleccionado un elemento.', { position: 'top-right' })
      }
    } else {
      if (tipoAsignar === 1 && contrataSeleccionada) {
        asignarOrdenes({
          ordenes,
          contrata: contrataSeleccionada,
          observacion
        });
      } else if (tipoAsignar === 2 && gestorSeleccionado) {
        asignarOrdenes({
          ordenes,
          gestor: gestorSeleccionado,
          observacion
        });
      } else if (tipoAsignar === 3 && tecnicos.length > 0 && tecnicoIndexSeleccionado !== null) {
        const index = tecnicoIndexSeleccionado;
        asignarOrdenes({
          ordenes,
          contrata: tecnicos[index] && tecnicos[index].contrata ? tecnicos[index].contrata._id : null,
          gestor: tecnicos[index] && tecnicos[index].gestor ? tecnicos[index].gestor._id : null,
          tecnico: tecnicos[index] ? tecnicos[index]._id: null,
          carnet:  tecnicos[index] ? tecnicos[index].carnet: null,
          observacion
        });
      } else {
        cogoToast.warn('No has seleccionado un elemento.', { position: 'top-right' })
      }
    }
  };

  async function asignarOrdenes(objeto={}) {
    setLoading(true);
    return await patchOrdenes({metodo: metodos.ORDENES_ASIGNAR, data: objeto}).then(() => {
      setOrdenes([])
      abrir();
    }).catch((err) => console.log(err)).finally(() => setLoading(false))
  };

  const ordenarListaTecnicos = () => {
    if (tecnicos && tecnicos.length > 0) {
      let gestores = [];
      let nuevaLista = [];
      tecnicos.forEach((t) => {
        if (t && t.gestor && t.gestor.nombre && !gestores.includes(t.gestor.nombre+' '+t.gestor.apellidos)) {
          gestores.push(t.gestor.nombre+' '+t.gestor.apellidos)
        }
      });
      gestores.filter((e) => e).forEach((g) => {
        let tecnicosGestor = tecnicos.filter((t) => t.gestor && t.gestor.nombre && (t.gestor.nombre+' '+t.gestor.apellidos) === g)
        nuevaLista.push({
          value: g,
          label: g,
          children: tecnicosGestor.map((t) => ({value: tecnicos.findIndex(e => e._id === t._id), label: t.nombre+' '+t.apellidos}))
        })
      });
      setListaTecnicosOrdenado(nuevaLista.filter((e) => e))
    }
  };

  function filter(inputValue, path) {
    return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };

  if (gestion) {
    return (
      <Modal
        title="Asignar Orden"
        visible={visible}
        onCancel={abrir}
        onOk={asignarOrden}
        width={450}
        afterClose={() => {
          setContrataSeleccionada(null);
          setGestorSeleccionado(null);
          setTecnicoIndexSeleccionado(null);
          setTipoAsignar(1);
          setObservacion(null);
        }}
        destroyOnClose
        centered
      >
        <p>Asignar por Gestor o Técnico:</p>
        <Radio.Group onChange={(e) => setTipoAsignar(e.target.value)} defaultValue={tipoAsignar} style={{ marginBottom: '1rem' }}>
          <Radio value={1}>Gestor</Radio>
          <Radio value={2}>Tecnico</Radio>
        </Radio.Group>
        {tipoAsignar === 1 ?
          (<Select
            showSearch
            value={gestorSeleccionado}
            placeholder="Seleccionar Gestor"
            style={{ width: 350, marginBottom: '.5rem' }}
            onChange={(e) => setGestorSeleccionado(e)}
            filterOption={(input, option) => {
              return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }}
          >
            {
              gestores && gestores.length > 0 ? 
              gestores.map((g) => (
                <Option value={g._id} key={g._id}>{`${g.nombre} ${g.apellidos}`}</Option>
              ))
              :<Option>No data</Option>
            }
          </Select>)
          :
          (<Select 
            showSearch
            value={tecnicoIndexSeleccionado}
            placeholder="Seleccionar Tecnico"
            style={{ width: 350, marginBottom: '.5rem' }}
            onChange={(e) => setTecnicoIndexSeleccionado(e)}
            filterOption={(input, option) => {
              return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }}
          >
            {tecnicos && tecnicos.length> 0 ? 
              tecnicos.map((e,i) => 
                <Option key={i} value={i}>{`${e.nombre} ${e.apellidos}`}</Option>
              ):null
            }
          </Select>)
          // (<Cascader
          //   options={listaTecnicosOrdenado}
          //   onChange={(_, t) => setTecnicoIndexSeleccionado(t && t[1] ? t[1].value : null)}
          //   placeholder="Seleccionar Tecnico"
          //   style={{ width: 500, marginBottom: '.5rem' }}
          //   showSearch={{ filter }}
          // />)
        }
        <TextArea 
          placeholder="Observación"
          onChange={(e) => setObservacion(e.target.value)}
          rows={5} 
          style={{ width: 350 }}
        />
      </Modal>
    )
  } else {
    return (
      <Modal
        title="Asignar Orden"
        visible={visible}
        onCancel={abrir}
        onOk={asignarOrden}
        okButtonProps={{ loading: loading, disabled: loading }}
        width={450}
        afterClose={() => {
          setContrataSeleccionada(null);
          setGestorSeleccionado(null);
          setTecnicoIndexSeleccionado(null);
          setTipoAsignar(1);
          setObservacion(null);
        }}
        destroyOnClose
        centered
      >
        <p>Asignar por Contrata, Gestor o Técnico:</p>
        <Radio.Group size="small" onChange={(e) => setTipoAsignar(e.target.value)} defaultValue={tipoAsignar} style={{ marginBottom: '1rem' }}>
          <Radio value={1}>Contrata</Radio> 
          <Radio value={2}>Gestor</Radio>
          <Radio value={3}>Tecnico</Radio>
        </Radio.Group>
        {
          tipoAsignar === 1 ? 
          (<Select
            showSearch
            size="small"
            value={contrataSeleccionada}
            placeholder="Seleccionar Contrata"
            style={{ width: 350, marginBottom: '.5rem' }}
            onChange={(e) => setContrataSeleccionada(e)}
            filterOption={(input, option) => {
              return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          }
          >
            {
              contratas && contratas.length > 0 ? 
              contratas.map((g) => (
                <Option value={g._id} key={g._id}>{g.nombre}</Option>
              ))
              :<Option>No data</Option>
            }
          </Select>)
          : tipoAsignar === 2 ?
          (<Select
            showSearch
            size="small"
            value={gestorSeleccionado}
            placeholder="Seleccionar Gestor"
            style={{ width: 350, marginBottom: '.5rem' }}
            onChange={(e) => setGestorSeleccionado(e)}
            filterOption={(input, option) => {
              return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          }
          >
            {
              gestores && gestores.length > 0 ? 
              gestores.map((g) => (
                <Option value={g._id} key={g._id}>{`${g.nombre} ${g.apellidos}`}</Option>
              ))
              :<Option>No data</Option>
            }
          </Select>)
          :
          ((<Cascader
            size="small"
            options={listaTecnicosOrdenado}
            onChange={(_, t) => setTecnicoIndexSeleccionado(t && t[1] ? t[1].value : null)}
            placeholder="Seleccionar Tecnico"
            style={{ width: 350, marginBottom: '.5rem' }}
            showSearch={{ filter }}
          />))
        }
        <TextArea 
          placeholder="Observación"
          onChange={(e) => setObservacion(e.target.value)}
          rows={4} 
          style={{ width: 350 }}
        />
      </Modal>
    )
  };
};

ModalAsignar.propTypes = {
  gestion: PropTypes.bool,
  visible: PropTypes.bool,
  abrir: PropTypes.func,
  contratas: PropTypes.array,
  gestores: PropTypes.array,
  tecnicos: PropTypes.array,
  ordenes: PropTypes.array,
  setOrdenes: PropTypes.func,
  loading: PropTypes.bool,
  setLoading: PropTypes.func
}

export default ModalAsignar

