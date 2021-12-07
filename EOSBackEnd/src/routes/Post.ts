import express, { Request, Response } from 'express';
import { postController } from '../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    postController.create(req, res);
});

router.post('/request', (req: Request, res: Response) => {
    postController.createContract(req, res);
});

router.post('/completed', (req: Request, res: Response) => {
    postController.completeContract(req, res);
});

router.get('/requests', (req: Request, res: Response) => {
    postController.getRequests(req, res);
});

router.get('/open', (req: Request, res: Response) => {
    postController.openServices(req, res);
});

router.get('/privateProfileServices', (req: Request, res: Response) => {
    postController.getPrivateProfileServices(req, res);
});

router.get('/contract', (req: Request, res: Response) => {
    postController.acceptedContract(req, res);
});

router.post('/contract/image', (req: Request, res: Response) => {
    postController.addContractImage(req, res);
});

router.get('/', (req: Request, res: Response) => {
    postController.read(req, res);
});

router.patch('/accept', (req: Request, res: Response) => {
    postController.acceptRequest(req, res);
});

router.patch('/deposit', (req: Request, res: Response) => {
    postController.depositContract(req, res);
});

router.patch('/received', (req: Request, res: Response) => {
    postController.serviceReceivedContract(req, res);
});

router.patch('/delivered', (req: Request, res: Response) => {
    postController.serviceDeliveredContract(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    postController.deleteRequest(req, res);
});
