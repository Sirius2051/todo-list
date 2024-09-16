// auth.js
const http = require('http');
const { parse } = require('url');
const { createUser, findUserByEmail } = require('./models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const connect = require('./db');

const server = http.createServer(async (req, res) => {
  const db = await connect();
  const { pathname, query } = parse(req.url, true);

  if (req.method === 'POST' && pathname === '/registro') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      const { nombre, email, contraseña } = JSON.parse(body);
      try {
        const user = await createUser(db, nombre, email, contraseña);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error al crear usuario');
      }
    });
  } else if (req.method === 'POST' && pathname === '/inicio-sesion') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      const { email, contraseña } = JSON.parse(body);
      try {
        const user = await findUserByEmail(db, email);
        if (!user) {
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('Credenciales inválidas');
          return;
        }
        const isMatch = await bcrypt.compare(contraseña, user.contraseña);
        if (!isMatch) {
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('Credenciales inválidas');
          return;
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.writeHead(200, {
          'Set-Cookie': cookie.serialize('token', token, { httpOnly: true }),
          'Content-Type': 'text/plain'
        });
        res.end('Inicio de sesión exitoso');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error al iniciar sesión');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Ruta no encontrada');
  }
});

server.listen(3001, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
