import {https} from "firebase-functions";
import next from "next";
import {Request, Response} from "express";

const app = next({dev: false});
const handle = app.getRequestHandler();

exports.nextjsFunc = https.onRequest((req: Request, res: Response) => {
  return app.prepare().then(() => handle(req, res));
});
