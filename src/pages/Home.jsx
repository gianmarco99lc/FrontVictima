import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const Home = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isSosModalOpen, setSosModalOpen] = useState(false);
  const [isPCModalOpen, setPCModalOpen] = useState(false);

  const containerStyle = {
    width: "100%",
    height: "380px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

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

  const handleCloseSosModal = () => {
    setSosModalOpen(false);
  };

  const handlePuntoControlButtonClick = () => {
    setPCModalOpen(true);
  };

  const handleClosePuntoControlModal = () => {
    setPCModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h1 style={{ marginRight: "10px" }}>Bienvenido Victima</h1>
        <button type="button">Salir</button>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePuntoControlModal}>Cerrar</Button>
          <Button onClick={handleClosePuntoControlModal}>Crear</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;
