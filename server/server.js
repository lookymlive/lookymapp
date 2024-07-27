const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Added this line to require jwt
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware para registrar las solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});


// Asegurarse de que la carpeta 'uploads' exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configurar multer para el almacenamiento de archivos
const upload = multer({ storage: multer.memoryStorage() });

// Ruta para subir videos
app.post('/upload', upload.single('video'), async (req, res) => {
  const video = {
    name: req.file.originalname,
    data: new mongo.Binary(req.file.buffer),
    contentType: req.file.mimetype
  };

  await db.collection('videos').insertOne(video);
  res.send('Video subido exitosamente');
});

// Ruta para obtener la lista de videos
app.get('/videos', (req, res) => {
  const dataPath = path.join(__dirname, 'videoData.json');
  if (fs.existsSync(dataPath)) {
    const videos = JSON.parse(fs.readFileSync(dataPath));
    res.json(videos);
  } else {
    res.json([]);
  }
});

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar a MongoDB (asegúrate de tener MongoDB instalado y ejecutándose)
const { getSecret } = require('./config/secrets');

async function initializeApp() {
  try {
    const dbSecret = await getSecret('nombre-de-tu-secreto-en-aws');

    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('Conectado a MongoDB'))
      .catch(err => {
        console.error('Error al conectar a MongoDB:', err);
        process.exit(1);
      });

    // Definir el modelo de Store
    const Store = mongoose.model('Store', {
      storeName: String,
      email: String,
      password: String
    });

    // Endpoint para el registro de tiendas
    app.post('/api/stores/register', async (req, res) => {
      try {
        const { storeName, email, password } = req.body;

        // Verificar si la tienda ya existe
        const existingStore = await Store.findOne({ email });
        if (existingStore) {
          return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nueva tienda
        const newStore = new Store({
          storeName,
          email,
          password: hashedPassword
        });

        await newStore.save();
        res.status(201).json({ message: 'Tienda registrada exitosamente' });
      } catch (error) {
        console.error('Error al registrar la tienda:', error);
        res.status(500).json({ message: 'Error al registrar la tienda' });
      }
    });

    // Nuevo endpoint para el inicio de sesión
    app.post('/api/stores/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        // Buscar la tienda por email
        const store = await Store.findOne({ email });
        if (!store) {
          return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, store.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token de autenticación
        const token = jwt.sign({ storeId: store._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
      }
    });

    const verifyToken = (req, res, next) => {
      const token = req.header('Authorization');
      if (!token) return res.status(401).json({ message: 'Acceso denegado' });

      try {
        req.store = jwt.verify(token, process.env.SECRET_KEY);
        next();
      } catch (error) {
        res.status(400).json({ message: 'Token inválido' });
      }
    };

    // Ejemplo de ruta protegida
    app.get('/api/stores/profile', verifyToken, async (req, res) => {
      try {
        const store = await Store.findById(req.store.id).select('-password');
        res.json(store);
      } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil' });
      }
    });

    // Modelo para los videos
    const VideoSchema = new mongoose.Schema({
      title: String,
      description: String,
      fileName: String,
      storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
      createdAt: { type: Date, default: Date.now }
    });

    const Video = mongoose.model('Video', VideoSchema);

    // Endpoint para subir videos
    app.post('/api/videos/upload', verifyToken, upload.single('video'), async (req, res) => {
      console.log('Recibida solicitud para subir video');
      if (!req.file) {
        console.log('No se recibió ningún archivo');
        return res.status(400).json({ message: 'No se subió ningún archivo' });
      }

      console.log('Archivo recibido:', req.file.filename);
      try {
        console.log('Datos del video:', req.body);

        const newVideo = new Video({
          title: req.body.title,
          description: req.body.description,
          fileName: req.file.filename,
          storeId: req.store.storeId
        });

        const savedVideo = await newVideo.save();
        console.log('Video guardado en la base de datos:', savedVideo);

        res.status(201).json({ message: 'Video subido exitosamente', video: savedVideo });
      } catch (error) {
        console.error('Error al guardar el video:', error);
        res.status(500).json({ message: 'Error al guardar el video', error: error.message });
      }
    });

    // Endpoint para obtener todos los videos
    app.get('/api/videos', async (req, res) => {
      console.log('Recibida solicitud para /api/videos');
      try {
        const limit = parseInt(req.query.limit) || 6;
        console.log(`Buscando videos con límite: ${limit}`);
        const videos = await Video.find().limit(limit).sort({ createdAt: -1 }).populate('storeId', 'storeName');
        console.log(`Encontrados ${videos.length} videos:`, videos);
        res.json(videos);
      } catch (error) {
        console.error('Error al obtener videos:', error);
        res.status(500).json({ message: 'Error al obtener videos', error: error.message });
      }
    });

    // Endpoint para obtener un video específico
    app.get('/video/:videoId', async (req, res) => {
      const videoId = req.params.videoId;
      try {
        const videoDoc = await Video.findById(videoId);
        if (!videoDoc) {
          return res.status(404).json({ message: 'Video no encontrado' });
        }

        const response = await fetch('/video/' + videoId);
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);

        res.json({ videoUrl });
      } catch (error) {
        console.error('Error al obtener video:', error);
        res.status(500).json({ message: 'Error al obtener video' });
      }
    });

    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  }
}

initializeApp();
