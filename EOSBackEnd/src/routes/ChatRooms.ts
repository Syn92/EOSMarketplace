import express, { Request, Response } from 'express';
import { chatRoomsController } from '../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    chatRoomsController.create(req, res);
});

router.get('/', (req: Request<any, any, any, any>, res: Response) => {
    chatRoomsController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    chatRoomsController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    chatRoomsController.delete(req, res);
});