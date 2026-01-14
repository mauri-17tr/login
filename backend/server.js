
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
// REGISTRO
app.post('/api/usuarios/registrar', async (req, res) => {
  try {
    const { nombres, apellidos, correo, contrasena } = req.body;
    
    const connection = await pool.getConnection();
    
    // Verificar si el correo ya existe
    const [existente] = await connection.execute(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    
    if (existente.length > 0) {
      connection.release();
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    // Guardar usuario
    await connection.execute(
      'INSERT INTO usuarios (nombres, apellidos, correo, contrasena) VALUES (?, ?, ?, ?)',
      [nombres, apellidos, correo, hashedPassword]
    );
    
    connection.release();
    res.json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// LOGIN
app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    
    const connection = await pool.getConnection();
    
    // Buscar usuario
    const [usuarios] = await connection.execute(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    
    connection.release();
    
    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }
    
    const usuario = usuarios[0];
    
    // Comparar contraseña
    const valida = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!valida) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }
    
    // Generar token
    const token = jwt.sign(
      { idUsuario: usuario.idUsuario },
      'clave_secreta_super_segura'
    );
    
    res.json({
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log('Servidor en puerto ' + process.env.PORT);
});