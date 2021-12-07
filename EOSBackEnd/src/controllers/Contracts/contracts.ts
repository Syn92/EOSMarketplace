import { Request, Response } from 'express';
import { CrudController } from "../CrudController";
import { ContractAPI } from '../../config/contract';

export class ContractController extends CrudController{
    public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        
    }

    public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {

    }

    public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        // Database.modifyUser(req.body).then((value: any) => {
        //     if (value.succeded)
        //         res.status(200).json(value)
        //     else 
        //         res.status(401).json('Error updating user or user not found')
        // }).catch((err) => {
        //     res.status(401).json("It didn't work!");
        // })
    }

    public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    } 
}
