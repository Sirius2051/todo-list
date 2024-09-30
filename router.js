const { parse } = require('url');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookie = require('cookie');
const { createUser, findUserByEmail } = require('./models/user/User');
const { createTask, deleteTask, updateTask, getTasks } = require('./models/task/Task');
const auth = require('./middleware/Auth');

const requestListener = function (req, res) {
    if (req.url === '/') {
        auth(req, res, async () => {
            const filePath = path.join(__dirname, 'index.html');
                fs.readFile(filePath, (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error en el servidor');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
                });
        });
    }
    else if (req.url === '/login') {
        const filePath = path.join(__dirname, './views/login.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error en el servidor');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } 
    else if (req.method === 'POST' && req.url === '/auth/login') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const { email, password } = JSON.parse(body);
            try {
                const user = await findUserByEmail(email);
                if (!user) {
                    res.writeHead(401, { 'Content-Type': 'text/plain' });
                    res.end('Credenciales inválidas');
                    return;
                }
                const isMatch = await bcrypt.compare(password.toString(), user.password);
                if (!isMatch) {
                    res.writeHead(401, { 'Content-Type': 'text/plain' });
                    res.end('Credenciales inválidas');
                    return;
                }
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                // console.log('Token generado:', token);
                res.writeHead(200, {
                'Set-Cookie': cookie.serialize('token', token, { httpOnly: true, path: '/' }),
                'Content-Type': 'text/plain'
                });
                res.end('Inicio de sesión exitoso');
            } catch (err) {
                console.log("Error:", err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error al iniciar sesión');
            }
        });
    }
    else if (req.url === '/auth/logout') {
        res.writeHead(302, {
            'Set-Cookie': cookie.serialize('token', '', {
                httpOnly: true,
                expires: new Date(0),
                path: '/'
            }),
            'Content-Type': 'text/plain',
            'Location': '/login'
        });
        res.end('Cierre de sesión exitoso');
    }
    else if (req.url === '/register') {
        const filePath = path.join(__dirname, './views/register.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error en el servidor');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    }
    else if (req.method === 'POST' && req.url === '/auth/register') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const { name, email, password } = JSON.parse(body);
            try {
                const user = await createUser(name, email, password);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            } catch (err) {
                console.log("Error:", err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error al crear usuario');
            }
        });
    }
    else if (req.url === '/api/create/task' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const task = JSON.parse(body);
            createTask(task).then(id => {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ insertedId: id }));
            }).catch(err => {
                console.error('Error creating task:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error creating task' }));
            });
        });
    }
    else if (req.url === '/api/get/task') {
        getTasks().then(data => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        }).catch(err => {
            console.error('Error fetching tasks:', err); // Log del error
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error fetching tasks' }));
        });
    }
    else if (req.url.startsWith('/api/update/task') && req.method === 'PUT') {
        const taskId = req.url.split('/').pop();
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedTask = JSON.parse(body);
            updateTask(taskId, updatedTask).then(modifiedCount => {
                if (modifiedCount === 1) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Task updated' }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Task not found' }));
                }
            }).catch(err => {
                console.error('Error updating task:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error updating task' }));
            });
        });
    }
    else if (req.url.startsWith('/api/delete/task') && req.method === 'DELETE') {
        const taskId = req.url.split('/').pop();
        deleteTask(taskId).then(deletedCount => {
            if (deletedCount === 1) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Task deleted' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Task not found' }));
            }
        }).catch(err => {
            console.error('Error deleting task:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error deleting task' }));
        });
    }
    else if (req.url === '/styles') {
        const filePath = path.join(__dirname, './assets/css/styles.css');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error en el servidor');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(content);
            }
        });
    } 
    else if (req.url === '/js') {
        const filePath = path.join(__dirname, './assets/js/app.js');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error en el servidor');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(content);
            }
        });
    } 
    else {
        res.writeHead(404);
        res.end('Página no encontrada');
    }
};


module.exports = requestListener;