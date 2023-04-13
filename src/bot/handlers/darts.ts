import logger from '../../helpers/logger';

import { Context, Markup } from 'telegraf';
import renderMsgs from '../helpers/renderMsgs';


const NAMESPACE = 'handlers_darts';

export const dartsStart = (ctx: Context) => {
  try {
    if (!('text' in ctx.message!)) return;
    const { from } = ctx.message;

    //render a message with ACC/DECLN keyboard
    if (!ctx.message.entities) return; //!might give some msg here
    if (!('user' in ctx.message.entities[0])) return;

    const { id, first_name } = ctx.message.entities[0].user;

    const msg = renderMsgs.dartsStartMsg({
      playerA: { id: from.id, name: from.first_name },
      playerB: { id, name: first_name },
    });
    const keyboard = Markup.inlineKeyboard([ Markup.button.callback('ПРИНЯТЬ', 'exit'),
    Markup.button.callback('ОТКЛОНИТЬ', 'back'),])
    ctx.replyWithHTML(msg, keyboard);
  } catch (error) {
    logger.error(NAMESPACE, error);
  }
};
