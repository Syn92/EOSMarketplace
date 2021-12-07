import express, { Request, Response } from 'express';
import { authentificationController } from '../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    authentificationController.create(req, res);
});

router.get('/', (req: Request, res: Response) => {
    authentificationController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    authentificationController.update(req, res);
});

router.post('/avatar', (req: Request, res: Response) => {
    authentificationController.updateAvatar(req, res);
});


// Add a rating with { uid: string, rating: number }
router.post('/rating', (req: Request, res: Response) => {
    authentificationController.addRating(req, res);
});


router.delete('/', (req: Request, res: Response) => {
    authentificationController.delete(req, res);
});