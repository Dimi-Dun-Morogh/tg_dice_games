import config from "config/";
import { Telegraf } from "telegraf";
import { dartsStart, playerAccept, playerThrow } from "./handlers/darts";

const bot = new Telegraf(config.botApiKey!);

bot.hears(/^дартс\W+/g, (ctx) => dartsStart(ctx));

bot.action(/playeraccept_(.+)/, (ctx) => playerAccept(ctx));

bot.action(/playerthrow_(.+)/, (ctx) => playerThrow(ctx));

// bot.on("message", (ctx) => {
//    console.log(ctx.message)
//    ctx.sendSticker('CAACAgIAAx0CUGm1aQACB2lkQrInpjyWpm6Y-vnDKq378lhgpQAC2RkAAgbQkEmprOA-tNeEZC8E')
// });

export default bot;
