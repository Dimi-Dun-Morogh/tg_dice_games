import "module-alias/register";
import logger from "helpers/logger";
import bot from "bot/bot";

const NAMESPACE = "app.ts";

bot
  .launch()
  .then(() => console.log("bot upp and running"))
  .catch((err) => console.error(err));
logger.info(NAMESPACE, "s");
