import { Request, Response } from 'express';
import { CrudController } from "../CrudController";
import { Database } from '../../config/database';
import { ContractRequest } from '../../models/Annonce';
import { ContractAPI } from '../../config/contract';

export class PostController extends CrudController {
    // create a new open service (post)
    public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.addService(req.body).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    // create a contract (service in progress) and a corresponding smart contract
    public createContract(req: Request<import("express-serve-static-core").ParamsDictionary, any, ContractRequest, any>, res: Response): void {
        ContractAPI.createDeal(req.body).then((dealID)=>{
            req.body.dealId = dealID
            Database.createContract(req.body).then((value) => {
                    res.status(200).json(value.data);
            }).catch((err) => {
                res.status(401).json("Error creating/updating contract");
            })
        })
    }

    // change the contract status to completed
    public completeContract(req: Request<import("express-serve-static-core").ParamsDictionary, any, ContractRequest, any>, res: Response): void {
        Database.completeContract(req.body).then((value) => {
            res.status(200).json(value)
        }).catch((err) => {
            res.status(401).json("Error completing contract");
        })
    }

    // get all requests (offer on a service) associated to a user
    public getRequests(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.getContractRequests(req.query).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        })
    }

    // delete a request
    public deleteRequest(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.deleteContractRequest(req.query).then((value) => {
            if (value.deletedCount == 1) {
                res.status(200).json(value);
            } else {
                res.status(204).json(value)
            }
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        })
    }

    // accept request
    public acceptRequest(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.acceptContractRequest(req.body).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    // change contract status to deposited (EOS in escrow)
    public depositContract(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.depositContract(req.body).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }


    public serviceDeliveredContract(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.serviceDeliveredContract(req.body).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }


    public serviceReceivedContract(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.serviceReceivedContract(req.body).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public openServices(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.getOpenServices(req.query).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public getPrivateProfileServices(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.getPrivateProfileServices(req.query).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public acceptedContract(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.getContract(req.query).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public addContractImage(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.UploadImageContract(req.body).then((value) => {
            res.status(200).json(value);
        }).catch((err) => {
            res.status(401).json("It didn't work!");
        });
    }

    public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        Database.getService(req.query).then((value) => {
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