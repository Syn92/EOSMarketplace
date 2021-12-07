import { Request, Response } from 'express';
import { CrudController } from "../CrudController";
import { Database } from '../../config/database';

interface IRequest {
    userId: string,
}

export class ChatRoomsController extends CrudController {
    public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public read(req: Request<import("express-serve-static-core").ParamsDictionary, any, any, IRequest>, res: Response): void {
        Database.getChatRooms(req.query.userId).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }
}