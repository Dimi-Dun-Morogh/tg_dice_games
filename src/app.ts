import express, {Request, Response} from "express";
import logger from "helpers/logger";
import bot from "bot/bot";
import gameDb from "db/index";
import * as dotenv from 'dotenv';
dotenv.config();
import config from "./config";

const NAMESPACE = "app.ts";

const app = express();

app.get('/', (request: Request, response: Response) => {
  logger.info(NAMESPACE, `${Date.now()} Ping Received, ${process.env.NODE_ENV}`);
  response.sendStatus(200);
});

gameDb
  .connectDb()
  .then(async () => {
    logger.info(NAMESPACE, "connect db success");
    if (process.env.NODE_ENV === "production") {
      bot.launch({
        webhook:{
            domain: process.env.WEBHOOK_URL!,// Your domain URL (where server code will be deployed)
            port: +process.env.PORT! || 8000
        }
      }).then(() => {
        logger.info(NAMESPACE,`The bot ${bot?.botInfo?.username} is running on server`);
      });
      app.use(express.json());
      app.use(bot.webhookCallback('/' + config.botApiKey));


    } else {
      bot
        .launch()
        .then(() => logger.info(NAMESPACE, `The bot ${bot?.botInfo?.username} is running in polling mode`));
    }
  })
  .catch((err) => logger.error(NAMESPACE, err));

