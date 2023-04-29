import express, { Request, Response } from 'express';
import logger from 'helpers/logger';
import bot from 'bot/bot';
import gameDb from 'db/index';
import * as dotenv from 'dotenv';
dotenv.config();
import { waiter } from 'helpers/utils';
import cors from 'cors';

const NAMESPACE = 'app.ts';

const app = express();

const router = express.Router();

router.get('/', (request: Request, response: Response) => {
  try {
    logger.info(
      NAMESPACE,
      `${Date.now()} Ping Received, ${process.env.NODE_ENV}`,
    );
    response.sendStatus(200);
  } catch (error) {
    logger.error(NAMESPACE, error);
  }
});

router.delete('/:id', async (request: Request, response: Response) => {
  try {
    const { id } = request.params; //xxx__yyy  -  xxx - chat id; yyy - message id;
    const [chatId, messageId] = id.split('__');
    await waiter(5000);
    const data = await bot.telegram.deleteMessage(chatId, +messageId);

    console.log(chatId, messageId, 'delete msg');
    response.status(200).send(`${id} ${data}`);
  } catch (error) {
    logger.error(NAMESPACE, 'post delete id', error);
    response.status(500).send(error);
  }
});

app.use(cors());
app.use('/web', router);

(async () => {
  try {
    await gameDb.connectDb();
    logger.info(NAMESPACE, 'connect db success');
    if (process.env.NODE_ENV === 'production') {
      logger.info(
        NAMESPACE,
        `The bot ${bot?.botInfo?.username} is running on server`,
      );

      app.use(express.json());

      app
        .use(await bot.createWebhook({ domain: process.env.WEBHOOK_URL! }))
        .listen(+process.env.PORT! || 8000);
    } else {
      app.listen(+process.env.PORT! || 8000);
      await bot.launch({});
      logger.info(
        NAMESPACE,
        `The bot ${bot?.botInfo?.username} is running in polling mode`,
      );
    }
  } catch (error) {
    logger.error(NAMESPACE, error);
  }
})();
