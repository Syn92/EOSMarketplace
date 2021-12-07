import { Request, Response } from 'express';
import { CrudController } from "../CrudController";
import { Database } from '../../config/database';

export class AuthentificationController extends CrudController {
    public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.addUser(req.body).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.checkUser(req.query).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.modifyUser(req.body).then((value: any) => {
            if (value.succeded)
                res.status(200).json(value)
            else
                res.status(401).json('Error updating user or user not found')
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        })
    }

    public updateAvatar(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.updateUserImage(req.body).then((value: any) => {
            if (value.succeded)
                res.status(200).json(value)
            else
                res.status(401).json('Error updating user or user not found')
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        })
    }

    public addRating(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.addRating(req.body).then((value) => {
            res.status(200).json(value)
        }).catch(err => {
            res.status(401).json("It didn't work")
        })
    }

    public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }
}