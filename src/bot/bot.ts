import config from 'config/';
import { Telegraf } from 'telegraf';
import { dartsStart, playerAccept, playerThrow } from './handlers/darts';

const bot = new Telegraf(config.botApiKey!);

bot.hears([/^дартс\W+/g, /^Дартс\W+/g], (ctx) => dartsStart(ctx));

bot.action(/playeraccept_(.+)/, (ctx) => playerAccept(ctx));

bot.action(/playerthrow_(.+)/, (ctx) => playerThrow(ctx));

export default bot;
