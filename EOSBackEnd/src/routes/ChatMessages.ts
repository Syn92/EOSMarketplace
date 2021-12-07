import express, { Request, Response } from 'express';
import { chatMessagesController } from '../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    chatMessagesController.create(req, res);
});

router.get('/', (req: Request<any, any, any, any>, res: Response) => {
    chatMessagesController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    chatMessagesController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    chatMessagesController.delete(req, res);
});