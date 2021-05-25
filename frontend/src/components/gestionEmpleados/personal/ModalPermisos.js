import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Select } from 'antd';

import { patchEmpleados } from '../../../services/apiEmpleado';
import metodos from '../../../constants/metodos';
import { getCargos } from '../../../services/apiCargos';
import { getTipoEmpleados } from '../../../services/apiTipoEmpleados';

const { Option } = Select;

function ModalPermisos({visible, setVisible, listarEmpleados, id}) {
  const [listaTipos, setListaTipos] = useState([]);
  const [listaCargos, setListaCargos] = useState([]);
  const [loadingCargo, setLoadingCargo] = useState(false);
  const [loadingTipo, setLoadingTipo] = useState(false);
  const [cargoSeleccionado, setCargoSeleccionado] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  useEffect(() => {
    cargarCargos();
    cargarTipos();
  },[]);

  async function cargarCargos() {
    setLoadingCargo(true);
    return getCargos(false)
      .then(({data}) => setListaCargos(data))
      .catch((err) => console.log(err))
      .finally(() => setLoadingCargo(false));
  };

  async function cargarTipos() {
    setLoadingTipo(true);
    return getTipoEmpleados(false)
      .then(({data}) => setListaTipos(data))
      .catch((err) => console.log(err))
      .finally(() => setLoadingTipo(false));
  }

  async function actualizarCargo() {
    await patchEmpleados(true, { 
      id,
      metodo: metodos.EMPLEADOS_ACTUALIZAR_PERMISOS, 
      cargo: cargoSeleccionado,
      tipo: tipoSeleccionado
    }).catch((error) => console.log(error)).finally(() => {
      setVisible(false);
      listarEmpleados();
    });
  };

  return (
    <Modal
      title="Actualizar Cargo"
      visible={visible}
      width={300}
      onOk={actualizarCargo}
      onCancel={() => setVisible(false)}
      centered
    >
      <p style={{ fontSize: '13px', color: 'rgba(0,0,0,.55)' }}>
        *Recuerda que no es posible otorgar un cargo superior 
        al tuyo y que todo cambio quedará registrado en el 
        sistema.
      </p>
      <p>Seleccionar Cargo:</p>
      <Select
        size="small"
        placeholder="Seleccionar Cargo"
        style={{ width: "250px", marginBottom: '.5rem' }}
        loading={loadingCargo}
        value={cargoSeleccionado}
        onChange={(e) => setCargoSeleccionado(e)}
      >
        {listaCargos.length > 0 ? 
        (listaCargos.map((c,i) => (
          <Option key={i} value={c._id}>{c.nombre}</Option>
        ))):null
        }
      </Select>
      <p>Seleccionar Tipo:</p>
      <Select
        size="small"
        placeholder="Seleccionar Tipo"
        style={{ width: "250px", marginBottom: '.5rem' }}
        loading={loadingTipo}
        value={tipoSeleccionado}
        onChange={(e) => setTipoSeleccionado(e)}
      >
        {listaTipos.length > 0 ? 
        (listaTipos.map((c,i) => (
          <Option key={i} value={c._id}>{c.nombre}</Option>
        ))):null
        }
      </Select>
    </Modal>
  )
}

ModalPermisos.propTypes = {
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
  listarEmpleados: PropTypes.func,
  id: PropTypes.string
}

export default ModalPermisos

