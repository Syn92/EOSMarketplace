import { Request, Response } from 'express';

export abstract class CrudController {
    public abstract create(req: Request<any, any, any, any>, res: Response): void;
    public abstract read(req: Request<any, any, any, any>, res: Response): void;
    public abstract update(req: Request<any, any, any, any>, res: Response): void;
    public abstract delete(req: Request<any, any, any, any>, res: Response): void;
}