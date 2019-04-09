import express, {Request, Response} from "express";
import AuthenticationProvider from "./authentication";
import AuthenticatableUser from "./AuthenticatableUser";
import jwt, {JwtConfiguration} from "./jwt";
import {ApplicationError} from "../errors/error";
import {restHandler} from "../errors/handlers";
import router from "../controllers/api";

export type RestAuthenticationConfiguration<T extends AuthenticatableUser> = {
    identifierKey?: string,
    passwordKey?: string,
    registrationUrl?: string,
    authenticationUrl?: string,
    authenticationProvider: AuthenticationProvider<T>,
    jwtConfiguration: JwtConfiguration,
    renderer?: (req: Request, res: Response, next: (err: Error) => void, token: string, user: T) => void,
};

export function jsonRenderer<T>(req: Request, res: Response, next: (err: Error) => void, token: string, user: T) {
    res.json({token, user});
}

export function createRestConfiguration<T extends AuthenticatableUser>(config: RestAuthenticationConfiguration<T>): RestAuthenticationConfiguration<T> {
    const defaults = {
        identifierKey: "email",
        passwordKey: "password",
        registrationUrl: "/registration",
        authenticationUrl: "/authentication",
        renderer: jsonRenderer
    };

    return Object.assign({...defaults}, config);
}

export function restRouter<T extends AuthenticatableUser>(configuration: RestAuthenticationConfiguration<T>) {

    const router = express.Router();

    async function restAuthentication(req: Request, res: Response, next: (err: Error) => void) {
        next(new ApplicationError("Cannot process that shit.", 422, undefined));
        return;
        const identifier = req.body[configuration.identifierKey];
        const password = req.body[configuration.passwordKey];
        const user = await configuration.authenticationProvider.authenticate(identifier, password);
        const token = await jwt(configuration.jwtConfiguration).encode(user);
        configuration.renderer(req, res, next, token, user);
    }

    async function restRegistration(req: Request, res: Response, next: (err: Error) => void) {
        const identifier = req.body[configuration.identifierKey];
        const password = req.body[configuration.passwordKey];
        const user = await configuration.authenticationProvider.register(identifier, password);
        const token = await jwt(configuration.jwtConfiguration).encode(user);
        configuration.renderer(req, res, next, token, user);
    }

    router.post(configuration.authenticationUrl, restAuthentication);
    router.post(configuration.registrationUrl, restRegistration);

    return router;
}