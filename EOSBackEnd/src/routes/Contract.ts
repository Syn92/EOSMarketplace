import express, { Request, Response } from 'express';
import { contractController } from '../controllers/';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    contractController.create(req, res);
});

router.get('/', (req: Request<any, any, any, any>, res: Response) => {
    contractController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    contractController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    contractController.delete(req, res);
});