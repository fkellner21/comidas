//sector constantes

const URLBASE = "https://calcount.develotion.com/";

const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const COMIDA = document.querySelector("#pantalla-comida");
const LISTADO = document.querySelector("#pantalla-listado");
const INFORME = document.querySelector("#pantalla-informe");
const MAPA = document.querySelector("#pantalla-mapa");

let comidas = [];
let registros = [];

let miLatitud;
let miLongitud;
let mapa = null;
let posicionUsuarioIcon = L.icon({
  iconUrl: "img/usuario.png",
  iconSize: [25, 25],
});
let posicionPaisIcon = L.icon({
  iconUrl: "img/puntero.png",
  iconSize: [25, 25],
});

let listaPaises = [];

inicio();

function inicio() {
  chequearSesion();
  eventos();
}

function cerrarMenu() {
  MENU.close();
}

function chequearSesion() {
  if (localStorage.getItem("apiKey") != null) {
    peticionPaises();
    mostrarMenuVIP();
  } else {
    mostrarMenuStandar();
  }
}

function eventos() {
  ROUTER.addEventListener("ionRouteDidChange", navegar);
  document.querySelector("#btnLogin").addEventListener("click", previaLogin);
  document.querySelector("#btnMenuLogout").addEventListener("click", logout);
  document
    .querySelector("#btnRegistrarNuevoU")
    .addEventListener("click", previaRegistro);
  document
    .querySelector("#slcAlimento")
    .addEventListener("ionChange", peticionUnidades);
  document
    .querySelector("#btnRegistrarNuevoC")
    .addEventListener("click", previoRegistrarNuevoConsumo);
  document
    .querySelector("#btnFiltrarRegistros")
    .addEventListener("click", filtrarRegistros);
  document
    .querySelector("#btnFiltrarUsuarios")
    .addEventListener("click", filtrarUsuarios);
}

function ocultarPantallas() {
  HOME.style.display = "none";
  LOGIN.style.display = "none";
  REGISTRO.style.display = "none";
  COMIDA.style.display = "none";
  LISTADO.style.display = "none";
  INFORME.style.display = "none";
  MAPA.style.display = "none";
}

function ocultarBotones() {
  document.querySelector("#btnMenuHome").style.display = "none";
  document.querySelector("#btnMenuLogin").style.display = "none";
  document.querySelector("#btnMenuRegistrarU").style.display = "none";
  document.querySelector("#btnMenuRegistrarC").style.display = "none";
  document.querySelector("#btnMenuListarRegistros").style.display = "none";
  document.querySelector("#btnMenuInformeDeCalorias").style.display = "none";
  document.querySelector("#btnMenuMapa").style.display = "none";
  document.querySelector("#btnMenuLogout").style.display = "none";
}

function mostrarMenuVIP() {
  ocultarBotones();
  document.querySelector("#btnMenuHome").style.display = "block";
  document.querySelector("#btnMenuRegistrarC").style.display = "block";
  document.querySelector("#btnMenuListarRegistros").style.display = "block";
  document.querySelector("#btnMenuInformeDeCalorias").style.display = "block";
  document.querySelector("#btnMenuMapa").style.display = "block";
  document.querySelector("#btnMenuLogout").style.display = "block";
  obtenerComidas();
}

function mostrarMenuStandar() {
  ocultarBotones();
  document.querySelector("#btnMenuLogin").style.display = "block";
  document.querySelector("#btnMenuRegistrarU").style.display = "block";
}

function navegar(evt) {
  //console.log(evt);
  ocultarPantallas();
  if (evt.detail.to == "/") HOME.style.display = "block";
  if (evt.detail.to == "/home") HOME.style.display = "block";
  if (evt.detail.to == "/login") LOGIN.style.display = "block";
  if (evt.detail.to == "/registrarU") {
    peticionPaises();
    REGISTRO.style.display = "block";
  }
  if (evt.detail.to == "/registrarC") {
    peticionComidas();
    COMIDA.style.display = "block";
  }
  if (evt.detail.to == "/listarRegistros") {
    peticionRegistros();
    LISTADO.style.display = "block";
  }
  if (evt.detail.to == "/informeCalorias") {
    INFORME.style.display = "block";
    previaInformeCalorias();
  }
  if (evt.detail.to == "/mapa") {
    getMiPosicion();
    MAPA.style.display = "block";
  }
}

function peticionPaises() {
  fetch(URLBASE + "paises.php")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      cargarPaisesAlSelect(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function cargarPaisesAlSelect(data) {
  listaPaises = data.paises;
  let slcPaises = "";
  for (let unP of data.paises) {
    slcPaises += `<ion-select-option value="${unP.id}">${unP.name}</ion-select-option>`;
  }
  document.querySelector("#slcPais").innerHTML = slcPaises;
}

function peticionComidas() {
  fetch(`${URLBASE}alimentos.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      cargarAlimentosYfechaMax(respuesta);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function cargarAlimentosYfechaMax(data) {
  let slcComidas = "";
  for (let unaC of data.alimentos) {
    slcComidas += `<ion-select-option value="${unaC.id}">${unaC.nombre}</ion-select-option>`;
  }
  document.querySelector("#slcAlimento").innerHTML = slcComidas;
  let hoy = new Date();
  let str = hoy.toISOString().slice(0, -5);
  document.querySelector("#fechaConsumo").max = str;
  document.querySelector("#fechaConsumo").value = str;
}

function peticionUnidades() {
  fetch(`${URLBASE}alimentos.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      cargarUnidad(respuesta);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function cargarUnidad(data) {
  let id = document.querySelector("#slcAlimento").value;
  let porcion = data.alimentos[id - 1].porcion;
  let unidades = "";
  if (porcion.slice(-1) == "u") unidades = "Unidades";
  if (porcion.slice(-1) == "g") unidades = "Gramos";
  if (porcion.slice(-1) == "m") unidades = "Mililitros";
  document.querySelector("#unidadComida").placeholder = unidades;
}

function peticionRegistros() {
  fetch(`${URLBASE}registros.php?idUsuario=${localStorage.getItem("id")}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      mostrarRegistros(respuesta.registros);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function mostrarRegistros(regs) {
  //limpio el array local con los registros y luego lo vuelvo a cargar para poder filtrarlo
  borrarArrayRegistros();
  let lista = "";
  for (let reg of regs) {
    lista += `        
    <ion-card>
    <img alt="Imagen de ${nombreComidaPorId(
      reg.idAlimento
    )}" src="https://calcount.develotion.com/imgs/${
      reg.idAlimento
    }.png" width="40"/>
      <ion-card-header>
      <ion-card-title>${reg.fecha} - ${nombreComidaPorId(
      reg.idAlimento
    )}</ion-card-title>
      <ion-card-subtitle>Calorias: ${caloriasPorIdYcantidad(
        reg.idAlimento,
        reg.cantidad
      )}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
    <ion-button expand="block" color="danger" onclick="eliminarConsumo(${
      reg.id
    })"><ion-icon slot="end" name="trash"></ion-icon></ion-button>
    </ion-card-content>
    </ion-card>`;
    registros.push(reg);
  }
  document.querySelector("#listaRegistros").innerHTML = lista;
  let hoy = new Date();
  let str = hoy.toISOString().slice(0, -5);
  document.querySelector("#fechaHasta").max = str;
  document.querySelector("#fechaHasta").value = str;
}

function nombreComidaPorId(id) {
  for (let unaC of comidas) {
    if (unaC.id == id) {
      return unaC.nombre;
    }
  }
  return "desconocida";
}

function caloriasPorIdYcantidad(id, cantidad) {
  let totalCalorias = 0;
  let porcion = 0;
  for (let unaC of comidas) {
    if (unaC.id == id) {
      porcion = unaC.porcion;
      porcion = porcion.slice(0, -1);
      porcion = parseInt(porcion);
      totalCalorias = (cantidad / porcion) * unaC.calorias;
      break;
    }
  }
  return totalCalorias;
}

function borrarArrayRegistros() {
  let cant = registros.length;
  registros.splice(0, cant);
}

function filtrarRegistros() {
  //Obtengo los datos de los campos
  let fechaDesde = document.querySelector("#fechaDesde").value;
  fechaDesde = fechaDesde.slice(0, -9);
  let fechaHasta = document.querySelector("#fechaHasta").value;
  fechaHasta = fechaHasta.slice(0, -9);
  let registrosFiltrados = [];
  for (let unR of registros) {
    if (unR.fecha >= fechaDesde && unR.fecha <= fechaHasta) {
      registrosFiltrados.push(unR);
    }
  }
  let lista = "";
  for (let reg of registrosFiltrados) {
    lista += `        
    <ion-card>
    <img alt="Imagen de ${nombreComidaPorId(
      reg.idAlimento
    )}" src="https://calcount.develotion.com/imgs/${
      reg.idAlimento
    }.png" width="40"/>
      <ion-card-header>
      <ion-card-title>${reg.fecha} - ${nombreComidaPorId(
      reg.idAlimento
    )}</ion-card-title>
      <ion-card-subtitle>Calorias: ${caloriasPorIdYcantidad(
        reg.idAlimento,
        reg.cantidad
      )}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
    <ion-button expand="block" color="danger" onclick="eliminarConsumo(${
      reg.id
    })"><ion-icon slot="end" name="trash"></ion-icon></ion-button>
    </ion-card-content>
    </ion-card>`;
  }
  document.querySelector("#listaRegistros").innerHTML = lista;
}

function eliminarConsumo(id) {
  fetch(`${URLBASE}registros.php?idRegistro=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      mostrarMensaje("SUCCESS", "Listo", "Registro eliminado con éxito", 2000);
      peticionRegistros();
    })
    .catch(function (error) {
      console.log(error);
    });
}

function obtenerComidas() {
  fetch(`${URLBASE}alimentos.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      cargarComidasAlArray(respuesta.alimentos);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function cargarComidasAlArray(lasComidas) {
  for (let unaComida of lasComidas) {
    comidas.push(unaComida);
  }
}

function isEmpty(value) {
  return (
    value == null ||
    (typeof value === "string" && value.trim().length === 0) ||
    value == 0
  );
}

function previaLogin() {
  //obtengo los datos del formulario y reviso que esten completos
  let usuario = document.querySelector("#usuarioLogin").value;
  let pass = document.querySelector("#passwordLogin").value;
  if (!isEmpty(usuario) || !isEmpty(pass)) {
    //genero el objeto para pasar a la API
    let nuevoLogin = new Object();
    nuevoLogin.usuario = usuario;
    nuevoLogin.password = pass;
    //pido el login del objeto
    login(nuevoLogin);
  }
}

function login(usuario) {
  fetch(`${URLBASE}login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuario),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      if (respuesta.codigo == "200") {
        localStorage.setItem("apiKey", respuesta.apiKey);
        localStorage.setItem("id", respuesta.id);
        localStorage.setItem("calXdia", respuesta.caloriasDiarias);
        ocultarPantallas();
        HOME.style.display = "block";
        peticionPaises();
        mostrarMenuVIP();
        limpiarCamposLogin();
        mostrarMensaje(
          "SUCCESS",
          "Bienvenido",
          "Ingreso realizado con éxito",
          2000
        );
      } else {
        mostrarMensaje("ERROR", "Error", respuesta.mensaje, 2000);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function previaRegistro() {
  //obtengo los datos del formulario de registro y valído que no esten vacios
  let usuario = document.querySelector("#usuarioRegistro").value;
  let pass = document.querySelector("#passwordRegistro").value;
  let pais = document.querySelector("#slcPais").value;
  let caloriasDiarias = document.querySelector("#caloriasRegistro").value;
  if (
    !isEmpty(usuario) &&
    !isEmpty(pass) &&
    !isEmpty(pais) &&
    !isEmpty(caloriasDiarias)
  ) {
    //genero el objeto para pasar a la API
    let nuevoRegistro = new Object();
    nuevoRegistro.usuario = usuario;
    nuevoRegistro.password = pass;
    nuevoRegistro.idPais = pais;
    nuevoRegistro.caloriasDiarias = caloriasDiarias;
    //pido el registro del objeto
    registro(nuevoRegistro);
  } else {
    mostrarMensaje("ERROR", "Error", "Debe completar todos los campos", 2000);
  }
}

function registro(usuario) {
  fetch(`${URLBASE}usuarios.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuario),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      if (respuesta.codigo == "200") {
        localStorage.setItem("apiKey", respuesta.apiKey);
        localStorage.setItem("id", respuesta.id);
        localStorage.setItem("calXdia", respuesta.caloriasDiarias);
        ocultarPantallas();
        HOME.style.display = "block";
        mostrarMenuVIP();
        limpiarCamposRegistro();
        mostrarMensaje(
          "SUCCESS",
          "Listo",
          "Registro realizado con éxito",
          2000
        );
      } else {
        mostrarMensaje("ERROR", "Error", respuesta.mensaje, 2000);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function logout() {
  localStorage.clear();
  inicio();
  mostrarMensaje("SUCCESS", "Listo", "Hasta la próxima visita", 2000);
}

function limpiarCamposLogin() {
  document.querySelector("#usuarioLogin").value = "";
  document.querySelector("#passwordLogin").value = "";
}

function limpiarCamposRegistro() {
  document.querySelector("#usuarioRegistro").value = "";
  document.querySelector("#passwordRegistro").value = "";
  document.querySelector("#slcPais").value = "";
  document.querySelector("#caloriasRegistro").value = "";
}

function limpiarCamposRegistroComida() {
  document.querySelector("#unidadComida").value = "";
  peticionComidas();
}

function previoRegistrarNuevoConsumo() {
  //obtengo los datos del formulario de registro y valído que no esten vacios
  let alimento = document.querySelector("#slcAlimento").value;
  let cantidad = document.querySelector("#unidadComida").value;
  let fecha = document.querySelector("#fechaConsumo").value;
  if (alimento != 0 && cantidad != 0) {
    //genero el objeto para pasar a la API
    let nuevoRegistro = new Object();
    nuevoRegistro.idAlimento = parseInt(alimento);
    nuevoRegistro.idUsuario = parseInt(localStorage.getItem("id"));
    nuevoRegistro.cantidad = parseInt(cantidad);
    nuevoRegistro.fecha = fecha.slice(0, -9);
    //pido el registro del objeto
    registroAlimento(nuevoRegistro);
  } else {
    mostrarMensaje("ERROR", "Error", "Debe completar todos los campos", 2000);
  }
}

function registroAlimento(comida) {
  fetch(`${URLBASE}registros.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
    body: JSON.stringify(comida),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      if (respuesta.codigo == "200") {
        mostrarMensaje(
          "SUCCESS",
          "Listo",
          "Registro ingresado con éxito",
          2000
        );
        limpiarCamposRegistroComida();
      } else {
        mostrarMensaje("ERROR", "Error", respuesta.mensaje, 2000);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function mostrarMensaje(tipo, titulo, texto, duracion) {
  const toast = document.createElement("ion-toast");
  toast.header = titulo;
  toast.message = texto;
  if (!duracion) {
    duracion = 2000;
  }
  toast.duration = duracion;
  if (tipo === "ERROR") {
    toast.color = "danger";
    toast.icon = "alert-circle-outline";
  } else if (tipo === "WARNING") {
    toast.color = "warning";
    toast.icon = "warning-outline";
  } else if (tipo === "SUCCESS") {
    toast.color = "success";
    toast.icon = "checkmark-circle-outline";
  }
  document.body.appendChild(toast);
  toast.present();
}

function previaInformeCalorias() {
  fetch(`${URLBASE}registros.php?idUsuario=${localStorage.getItem("id")}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (respuesta) {
      hacerInformeCalorias(respuesta);
    });
}

function hacerInformeCalorias(listado) {
  let caloriasDia = 0;
  let caloriasTotales = 0;
  let calXdia = localStorage.getItem("calXdia");
  let caloriasDiariasColor = "dark";

  for (let registro of listado.registros) {
    let alimento = registro.idAlimento;

    caloriasTotales =
      caloriasTotales + caloriasPorIdYcantidad(alimento, registro.cantidad);
    if (registro.fecha == obtenerFechaActual()) {
      caloriasDia =
        caloriasDia + caloriasPorIdYcantidad(alimento, registro.cantidad);
    }
  }
  if (caloriasDia > calXdia) {
    caloriasDiariasColor = "danger";
  } else if (caloriasDia >= calXdia * 0.9) {
    caloriasDiariasColor = "warning";
  } else {
    caloriasDiariasColor = "success";
  }

  document.querySelector("#caloriasTotales").innerHTML = caloriasTotales;
  document.querySelector("#caloriasDiarias").innerHTML = caloriasDia;
  document
    .querySelector("#caloriasDiarias")
    .setAttribute("color", caloriasDiariasColor);
}

function obtenerFechaActual() {
  const now = new Date();
  const year = now.getFullYear().toString();
  let month = (now.getMonth() + 1).toString();
  if (month.length === 1) {
    month = `0${month}`;
  }
  let day = now.getDate().toString();
  if (day.length === 1) {
    day = `0${day}`;
  }
  return `${year}-${month}-${day}`;
}

function armarMapa() {
  if (!mapa) {
    mapa = L.map("map").setView([miLatitud, miLongitud], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);
    markerUsuario = L.marker([miLatitud, miLongitud], {
      icon: posicionUsuarioIcon,
    }).addTo(mapa);
  }
}

function getMiPosicion() {
  navigator.geolocation.getCurrentPosition(miUbicacion);
}

function miUbicacion(position) {
  //obtener mi posición actual

  miLatitud = position.coords.latitude;
  miLongitud = position.coords.longitude;
  armarMapa();
}
function filtrarUsuarios() {
  fetch(URLBASE + "/usuariosPorPais.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: localStorage.getItem("apiKey"),
      iduser: localStorage.getItem("id"),
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (
        data &&
        data.codigo === 200 &&
        data.paises &&
        data.paises.length > 0
      ) {
        marcarPaisesEnMapa(data);
      } else {
        mostrarMensaje(
          "WARNING",
          "¡Atención!",
          "No se han encontado paises con usuarios registrados."
        );
      }
    })
    .catch((error) => console.log(error));
}

function marcarPaisesEnMapa(data) {
  let markerPais, latP, longP;
  // levanto los datos del filtro
  let filtro = Number(document.querySelector("#usuariosAfiltrar").value);

  //recorro todos los países que me vienen
  for (let unP of data.paises) {
    // reviso si es de Sudamerica pues la api solo tiene la longitud y latitud de esos
    if (esSudamericano(unP.id)) {
      if (unP.cantidadDeUsuarios >= filtro) {
        latP = obtenerLatitudPais(unP.id);
        longP = obtenerLongitudPais(unP.id);
        markerPais = L.marker([latP, longP], { icon: posicionPaisIcon }).addTo(
          mapa
        );
      }
    }
  }
}

function esSudamericano(idPais) {
  for (let unP of listaPaises) {
    if (unP.id == idPais) return true;
  }
  return false;
}
function obtenerLatitudPais(idPais) {
  for (let unP of listaPaises) {
    if (unP.id == idPais) return unP.latitude;
  }
}
function obtenerLongitudPais(idPais) {
  for (let unP of listaPaises) {
    if (unP.id == idPais) return unP.longitude;
  }
}
