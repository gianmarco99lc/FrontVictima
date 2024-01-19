import React, { useState, useEffect, useContext } from "react";
import { GoogleMap, LoadScript, Marker, Polygon } from "@react-google-maps/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import { AuthContext } from "../contexts/auth/auth.context";

const Home = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isSosModalOpen, setSosModalOpen] = useState(false);
  const [isPCModalOpen, setPCModalOpen] = useState(false);
  const [contador, setContador] = useState(30);
  const [contadorActivo, setContadorActivo] = useState(false);
  const [isLoginOut, setIsLoginOut] = useState(false);
  const containerStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const [zonasDeSeguridad, setZonasDeSeguridad] = useState([]);
  const { authState, setAuthentication } = useContext(AuthContext);
  const { userInfo } = authState;

  const [ isChecking, setIsChecking ] = useState(false);

  useEffect(() => {
    const postearPosicion = async () => {
      console.log("ACTUAL POSICION", currentPosition);
      try {
        const response = await axios.post("/${import.meta.env.VITE_APP_SERVER_URL}/conexion", {
          _fecha: new Date(),
          _estadoConexion: true,
          _latitud: currentPosition.lat,
          _longitud: currentPosition.lng,
          _usuario: {
            id: userInfo.id
          }
        }, {
          headers: {
            "Content-Type": "application/json"
          }
        });
        console.log("RESPUESTA MANO", response);
      } catch(error) {
        console.log(error);
      }
    }

    if (currentPosition !== null)
      postearPosicion();

  }, [currentPosition]);

  useEffect(() => {
    // Función para obtener la posición actual del usuario
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("Error getting current location:", error.message);
          }
        );
      } else {
        console.error("Geolocation is not supported by your browser.");
      }
    };

    // Obtener la posición actual cuando el componente se monta
    getCurrentLocation();
  }, []); // La dependencia vacía asegura que se ejecute solo una vez al montar el componente

  const handleSosButtonClick = () => {
    setSosModalOpen(true);
  };

  const handleCloseSosModal = async () => {
    setSosModalOpen(false);

    const fechaHora = new Date().getTime();
    const data = {
      _tipoAlerta: "SOS",
      _fechaHora: fechaHora,
      _latitud: currentPosition?.lat,
      _longitud: currentPosition?.lng,
      usuario: {
        id: userInfo.id,
      },
    };

    //console.log(user._Username);

    try {
      const response = await axios.post(
        "/${import.meta.env.VITE_APP_SERVER_URL}/alertas/insert",
        data
      );
      console.log("Alerta SOS enviada con éxito", response);
    } catch (error) {
      console.error("Error al enviar la alerta SOS:", error);
    }
  };

  const handlePuntoControlButtonClick = () => {
    setPCModalOpen(true);
  };

  useEffect(() => {
    if (isChecking) {

    }
  }, [isChecking]);

  const handleSalir = (e) => {
    e.preventDefault();
    setIsLoginOut(true);

    setTimeout(() => {
      setAuthentication({ type: "unauthenticate" });
    }, 2000);
  };

  const handleClosePuntoControlModal = async () => {
    setPCModalOpen(false);
    if (!contadorActivo) {
      alert("El contador se detuvo antes de llegar a 0. No se enviará la alerta.")
      return;
    }
    setContadorActivo(false);
  };

  const iniciarContador = async () => {
    try {
      const fechaHora = new Date().getTime();
      setIsChecking(true);
      const data = {
        _tipoAlerta: "Punto Control",
        _fechaHora: fechaHora,
        _latitud: currentPosition?.lat,
        _longitud: currentPosition?.lng,
        usuario: {
          id: userInfo.id,
        },
      }
      const response = await axios.post(
        "/${import.meta.env.VITE_APP_SERVER_URL}/alertas/insert",
        data
      );
      setContador(30);
      setContadorActivo(true);
      console.log("Alerta Punto de control enviada con éxito", response);
    } catch (error) {
      console.error("Error al enviar la alerta Punto de control:", error);
    }
  };

  const mostrarMensajeRescate = () => {
    alert("LAS AUTORIDADES VAN A RESCATARTE");
  };

  useEffect(() => {

    const crearPuntoRescate = async () => {
      try {
        const fechaHora = new Date().getTime();
        const data = {
          _tipoAlerta: "Punto de rescate",
          _fechaHora: fechaHora,
          _latitud: currentPosition?.lat,
          _longitud: currentPosition?.lng,
          usuario: {
            id: userInfo.id,
          },
        }
        const response = await axios.post(
          "/${import.meta.env.VITE_APP_SERVER_URL}/alertas/insert",
          data
        );
        console.log(response);
      } catch(error) {
        console.log(error);
      }
    }

    let intervalo;
    if (contadorActivo) {
      intervalo = setInterval(() => {
        setContador((prevContador) => prevContador - 1);
      }, 1000);
    }
    if (contadorActivo && contador === 0)
      crearPuntoRescate();

    if (contador === 0) {
      setContadorActivo(false);
      mostrarMensajeRescate();
    }


    return () => clearInterval(intervalo);
  }, [contadorActivo, contador]);

  useEffect(() => {
    const obtenerZonas = async () => {
      try {
        const coordenadasDeZonas = await axios.get(`/${import.meta.env.VITE_APP_SERVER_URL}/coordenadas/todos`);

        console.log("La super respuesta mano", coordenadasDeZonas);
        const zonasDeSeguridadDeUsuario = coordenadasDeZonas.data.response.filter( coordenada => coordenada._zona_segura.usuario.id === authState.userInfo.id );

        const agrupados = {};

        zonasDeSeguridadDeUsuario.forEach(objeto => {
          const id = objeto._zona_segura.id;

          if (!agrupados[id]) {
            agrupados[id] = [];
          }

          agrupados[id].push(objeto);
        });

        const resultado = Object.values(agrupados);
        setZonasDeSeguridad(resultado);
      } catch(error) {
        console.log(error);
      } finally {
        // setIsLoadingZonasDeSeguridad(false);
      }
    }

    obtenerZonas();

  }, []);

  return (
    <div>
      {
      isLoginOut ?
	      <div style={{display: "flex", flexDirection: "column", width: "100vw", height: "100vh", justifyContent: "center", alignItems: "center"}}>
		      <CircularProgress />
          Saliendo
	      </div> :
        <div style={{width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <div style={{ display: "flex", alignItems: "center"}}>
            <h1 style={{ marginRight: "10px" }}>Bienvenido {userInfo._Username}</h1>
          </div>
          <div style={{ height: "70%", width: "90%"}}>
            {/* Mapa */}
            <LoadScript googleMapsApiKey="AIzaSyBcVP__otz3wxYvWgx_LUJp0DOJSDKhDV4">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition || { lat: 10.465, lng: -66.976 }}
                zoom={12}
              >
              {
                  zonasDeSeguridad.map((zona, index) =>
                    <Polygon
                      key={index}
                      paths={zona.map( coordenada => ({lat: coordenada._latitudY, lng: coordenada._longitudX}) )}
                      options={{
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#D23C30",
                        fillOpacity: 0.35,
                      }}
                    />
                  )
                }
                {/* Puedes agregar un marcador si lo deseas */}
                {currentPosition && <Marker position={currentPosition} />}
              </GoogleMap>
            </LoadScript>
          </div>
          {/* Botones */}
          <div style={{display: "flex", marginTop: "10px"}}>
            <button onClick={handleSosButtonClick} style={{width: "300px", display: "flex", justifyContent: "center", alignItems: "center"}}>SOS</button>
            <button onClick={handlePuntoControlButtonClick} style={{width: "300px", height: "50px", display: "flex", justifyContent: "center", alignItems: "center"}}>
              Punto de control
            </button>
            <button type="button" onClick={handleSalir} style={{width: "300px", display: "flex", justifyContent: "center", alignItems: "center"}}>
              Salir
            </button>
          </div>

          {/* Modal SOS */}
          <Dialog open={isSosModalOpen} onClose={handleCloseSosModal}>
            <DialogTitle>Crear Alerta SOS</DialogTitle>
            <DialogContent>
              <p>Latitud: {currentPosition?.lat}</p>
              <p>Longitud: {currentPosition?.lng}</p>
              <p>Fecha y hora: {new Date().toLocaleString()}</p>
              <p>Tipo de alerta: SOS</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseSosModal}>Cerrar</Button>
              <Button onClick={handleCloseSosModal}>Crear</Button>
            </DialogActions>
          </Dialog>

          {/* Modal Punto Control */}
          <Dialog open={isPCModalOpen} onClose={handleClosePuntoControlModal}>
            <DialogTitle>Crear Punto de control</DialogTitle>
            <DialogContent>
              <p>Latitud: {currentPosition?.lat}</p>
              <p>Longitud: {currentPosition?.lng}</p>
              <p>Fecha y hora: {new Date().toLocaleString()}</p>
              <p>Tipo de alerta: Punto de control</p>
              {contadorActivo && <p>Tiempo restante: {contador} segundos</p>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePuntoControlModal}>Cerrar</Button>
              {!contadorActivo && <Button onClick={iniciarContador}>Crear</Button>}
              {contadorActivo && (
                <Button onClick={handleClosePuntoControlModal}>Cancelar</Button>
              )}
            </DialogActions>
          </Dialog>
        </div>
      }

    </div>
  );
};

export default Home;
