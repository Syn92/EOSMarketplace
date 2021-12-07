import express, { Request, Response } from 'express';
import { tokenController } from '../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    tokenController.create(req, res);
});

router.get('/', (req: Request, res: Response) => {
    tokenController.read(req, res);
});

router.patch('/', (req: Request<any, any, any, any>, res: Response) => {
    tokenController.update(req, res);
});

router.delete('/', (req: Request<any, any, any, any>, res: Response) => {
    tokenController.delete(req, res);
});