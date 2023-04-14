import 'module-alias/register';
import logger from 'helpers/logger';
import bot from 'bot/bot';
import gameDb from 'db/index';

const NAMESPACE = 'app.ts';

gameDb
  .connectDb()
  .then(() => {
    logger.info(NAMESPACE, 'connect db success');

    bot
      .launch()
      .then(() => logger.info(NAMESPACE, 'bot upp and running in polling'))
      .catch((err) => console.log(err));
  })
  .catch((err) => logger.error(NAMESPACE, err));
