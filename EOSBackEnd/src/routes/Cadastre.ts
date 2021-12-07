import express, { Request, Response } from 'express';
import { cadastreController } from '../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    cadastreController.create(req, res);
});

router.get('/', (req: Request<any, any, any, any>, res: Response) => {
    cadastreController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    cadastreController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    cadastreController.delete(req, res);
});