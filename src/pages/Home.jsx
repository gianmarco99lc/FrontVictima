import React, { useState, useEffect, useContext } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
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
    height: "380px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const { authState, setAuthentication } = useContext(AuthContext);
  const { userInfo } = authState;

  // useEffect(() => {
  //   if (user) {
  console.log(userInfo);
  //   }
  // }, [user]);

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
        "/api/alertas/insert",
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

  const handleSalir = (e) => {
    e.preventDefault();
    setIsLoginOut(true);

    setTimeout(() => {
      setAuthentication({ type: "unauthenticate" });
    }, 2000);
  };

  const handleClosePuntoControlModal = async () => {
    setPCModalOpen(false);

    const fechaHora = new Date().getTime();
    const data = {
      _tipoAlerta: "Punto Control",
      _fechaHora: fechaHora,
      _latitud: currentPosition?.lat,
      _longitud: currentPosition?.lng,
      usuario: {
        id: userInfo.id,
      },
    };

    if (!contadorActivo) {
      console.log(
        "El contador se detuvo antes de llegar a 0. No se enviará la alerta."
      );
      return;
    }

    try {
      const response = await axios.post(
        "/api/alertas/insert",
        data
      );
      console.log("Alerta Punto de control enviada con éxito", response);
    } catch (error) {
      console.error("Error al enviar la alerta Punto de control:", error);
    }
    setContadorActivo(false);
  };

  const iniciarContador = () => {
    setContador(30);
    setContadorActivo(true);
  };

  const mostrarMensajeRescate = () => {
    alert("LAS AUTORIDADES VAN A RESCATARTE");
  };

  useEffect(() => {
    let intervalo;
    if (contadorActivo) {
      intervalo = setInterval(() => {
        setContador((prevContador) => prevContador - 1);
      }, 1000);
    }
    if (contador === 0) {
      setContadorActivo(false);
      mostrarMensajeRescate();
    }
    return () => clearInterval(intervalo);
  }, [contadorActivo, contador]);

  return (
    <div>
      {
      isLoginOut ?
	      <div style={{display: "flex", flexDirection: "column", width: "100vw", height: "100vh", justifyContent: "center", alignItems: "center"}}>
		      <CircularProgress />
          Saliendo
	      </div> :
        <> 
          <div style={{ display: "flex", alignItems: "center" }}>
        <h1 style={{ marginRight: "10px" }}>Bienvenido Victima</h1>
        <button type="button" onClick={handleSalir}>
          Salir
        </button>
      </div>
      <div style={{ height: "400px" }}>
        {/* Mapa */}
        <LoadScript googleMapsApiKey="AIzaSyBcVP__otz3wxYvWgx_LUJp0DOJSDKhDV4">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition || { lat: 10.465, lng: -66.976 }}
            zoom={12}
          >
            {/* Puedes agregar un marcador si lo deseas */}
            {currentPosition && <Marker position={currentPosition} />}
          </GoogleMap>
        </LoadScript>
      </div>
      {/* Botones */}
      <div>
        <button onClick={handleSosButtonClick}>SOS</button>
        <button onClick={handlePuntoControlButtonClick}>
          Punto de control
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
        </>
      }
      
    </div>
  );
};

export default Home;
