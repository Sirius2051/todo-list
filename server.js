const http = require('http');
const { connectDB } = require('./db/db');
const router = require('./router');
const PORT = process.env.PORT || 3000;

const server = http.createServer(router);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}/`);
    });
});