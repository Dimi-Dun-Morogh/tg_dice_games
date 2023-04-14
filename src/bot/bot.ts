import config from "../config/";
import { Telegraf } from "telegraf";
import { dartsStart } from "./handlers/darts";

const bot = new Telegraf(config.botApiKey!);

bot.hears(/^дартс\W+/g, (ctx) => dartsStart(ctx));

bot.on("message", (ctx) => {
  // console.log(ctx.message)
});

export default bot;
