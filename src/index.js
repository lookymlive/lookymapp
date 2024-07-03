// Importa React, necesario para crear componentes
import React from 'react';
// Importa createRoot de react-dom/client, usado para renderizar la aplicación
import { createRoot } from 'react-dom/client';
// Importa los estilos CSS globales
import './index.css';
// Importa el componente principal de la aplicación
import App from './App';

// Obtiene el elemento del DOM con id 'root' donde se montará la aplicación
const container = document.getElementById('root');
// Crea una raíz de React en el contenedor
const root = createRoot(container);

// Renderiza la aplicación dentro de React.StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
