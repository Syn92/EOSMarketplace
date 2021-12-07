import express, { Request, Response } from 'express';
import { addressController } from '../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    addressController.create(req, res);
});

router.get('/', (req: Request<any, any, any, any>, res: Response) => {
    addressController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    addressController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    addressController.delete(req, res);
});