import express from 'express';
import { PORT } from './config/constants';
import { authentificationRouter, postRouter,  cadastreRouter, addressRouter, chatRoomsRouter, chatMessagesRouter, tokenRouter,userRouter} from './routes';
import { Database } from './config/database';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import { ContractAPI } from './config/contract';
import { Sockets } from './config/sockets';

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(cors())
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use('/auth', authentificationRouter);
app.use('/post', postRouter);

app.use('/cadastre', cadastreRouter);
app.use('/address', addressRouter);
app.use('/chatRooms', chatRoomsRouter);
app.use('/chatMessages', chatMessagesRouter);
app.use('/token', tokenRouter);
app.use('/user', userRouter);
// add more routes here if needed

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    Database.connect();
    ContractAPI.instantiate()
    Sockets.connect(io);
});
