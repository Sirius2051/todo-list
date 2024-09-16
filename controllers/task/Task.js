const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/tasks') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { userId, title, description } = parse(body);
            await createTask(userId, title, description);
            res.end('Tarea creada');
        });
    } else if (req.method === 'GET' && req.url.startsWith('/tasks/')) {
        const userId = req.url.split('/')[2];
        const tasks = await getTasks(userId);
        res.end(JSON.stringify(tasks));
    } else if (req.method === 'PUT' && req.url.startsWith('/tasks/')) {
        const id = req.url.split('/')[2];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const updates = parse(body);
            await updateTask(id, updates);
            res.end('Tarea actualizada');
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/tasks/')) {
        const id = req.url.split('/')[2];
        await deleteTask(id);
        res.end('Tarea eliminada');
    }
});

server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
