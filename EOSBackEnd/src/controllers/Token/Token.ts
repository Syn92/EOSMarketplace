import { Request, Response } from 'express';
import { CrudController } from "../CrudController";
import { Database } from '../../config/database';

interface IDeleteRequest {
    userId: string
}

interface IUpdateRequest {
    userId: string,
    token: string
}

export class TokenController extends CrudController {
    public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    // set device token, usefull for sending push notifications
    public update(req: Request<import("express-serve-static-core").ParamsDictionary, any, IUpdateRequest, any>, res: Response): void {
        Database.setRegistrationToken(req.body.userId, req.body.token).then(() => {
            res.status(200);
        }).catch((err) => {
            console.log(err)
            res.status(401).json("It didn't work!");
        });
    }

    // delete a device token based on user id
    public delete(req: Request<import("express-serve-static-core").ParamsDictionary, any, IDeleteRequest, any>, res: Response): void {
        Database.setRegistrationToken(req.body.userId, '').then(() => {
            res.status(200);
        }).catch((err) => {
            console.log(err)
            res.status(401).json("It didn't work!");
        });
    }
}