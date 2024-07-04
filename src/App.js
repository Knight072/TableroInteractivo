import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function App() {
  const myp5 = useRef(); // Referencia al objeto p5
  const client = useRef(); // Referencia al cliente STOMP

  useEffect(() => {
    // Función para configurar el sketch de p5.js
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(700, 410); // Crea un lienzo de p5.js
        p.background(255); // Establece el fondo blanco
      };

      p.draw = () => {
        if (p.mouseIsPressed) {
          p.fill(0, 0, 0); // Establece el color del relleno a negro
          p.ellipse(p.mouseX, p.mouseY, 20, 20); // Dibuja una elipse en la posición del mouse

          // Verifica si el cliente STOMP está conectado y publica el mensaje de dibujo
          if (client.current && client.current.connected) {
            client.current.publish({
              destination: '/app/draw', // Envía el mensaje a través del endpoint /app/draw
              body: JSON.stringify({ user: 'user1', x: p.mouseX, y: p.mouseY }) // Datos del dibujo
            });
          }
        }
      };
    };

    // Crea una instancia de p5.js y asigna el sketch al div con id "container"
    myp5.current = new p5(sketch, 'container');

    // Configuración del cliente STOMP
    client.current = new Client({
      brokerURL: 'ws://localhost:8080/ws', // URL del broker WebSocket
      connectHeaders: {
        login: 'user', // Usuario para la conexión
        passcode: 'password' // Contraseña para la conexión
      },
      debug: function (str) {
        console.log(str); // Función de depuración para registrar mensajes del cliente
      },
      reconnectDelay: 5000, // Retardo de reconexión en milisegundos
      heartbeatIncoming: 4000, // Frecuencia del heartbeat entrante en milisegundos
      heartbeatOutgoing: 4000, // Frecuencia del heartbeat saliente en milisegundos
      webSocketFactory: () => new SockJS('http://localhost:8080/ws') // Fábrica de WebSocket para compatibilidad con SockJS
    });

    // Callback cuando se establece la conexión con el servidor
    client.current.onConnect = function (frame) {
      console.log('Connected: ' + frame); // Registra el mensaje de conexión exitosa en la consola
      // Suscribe al topic /topic/draw para recibir mensajes de dibujo desde el servidor
      client.current.subscribe('/topic/draw', function (message) {
        const drawingData = JSON.parse(message.body); // Parsea el mensaje JSON recibido
        myp5.current.fill(0, 0, 0); // Establece el color del relleno a negro
        myp5.current.ellipse(drawingData.x, drawingData.y, 20, 20); // Dibuja una elipse en la posición recibida
      });
    };

    // Callback en caso de error en la conexión con el servidor
    client.current.onStompError = function (frame) {
      console.log('Broker reported error: ' + frame.headers['message']); // Registra el mensaje de error en la consola
      console.log('Additional details: ' + frame.body); // Registra detalles adicionales del error en la consola
    };

    // Activa la conexión del cliente STOMP
    client.current.activate();

    // Cleanup function para desactivar la conexión al desmontar el componente
    return () => {
      if (client.current) {
        client.current.deactivate(); // Desactiva la conexión del cliente STOMP
      }
    };
  }, []);

  // Renderiza el componente con un contenedor para el canvas de p5.js
  return (
    <div>
      <hr />
      <div id="container"></div>
      <hr />
    </div>
  );
}

export default App;




