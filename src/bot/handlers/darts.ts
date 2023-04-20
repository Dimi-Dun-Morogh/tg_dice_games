import { Context, Markup } from 'telegraf';
import logger from 'helpers/logger';
import renderMsgs from 'bot/helpers/renderMsgs';
import { Game, Player } from 'db/models';
import gameDb from 'db/index';

const NAMESPACE = 'handlers_darts';

export const dartsStart = (ctx: Context) => {
  try {
    if (!('text' in ctx.message!)) return;
    const { from } = ctx.message;

    if (!ctx.message.entities) return; //!might give some msg here
    if (!('user' in ctx.message.entities[0])) return;

    const { id, first_name } = ctx.message.entities[0].user;

    const msg = renderMsgs.dartsStartMsg({
      playerA: { id: from.id, name: from.first_name },
      playerB: { id, name: first_name },
    });
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('ПРИНЯТЬ', `playeraccept_${id}`)],
    ]);
    ctx.replyWithHTML(msg, keyboard);
  } catch (error) {
    logger.error(NAMESPACE, error);
  }
};

export const msgForNextThrow = async (ctx: Context) => {
  try {
    console.log(ctx.callbackQuery?.message);
    //get a game
    //gen a msg with btn
    if (!('chat' in ctx.callbackQuery!.message!)) return;

    const { chat } = ctx.callbackQuery!.message!;
    const game = await gameDb.readGame(chat.id);
    if (!game) return;


    const whosTurn = game.players.find((el) => el.playerNum == game.whosTurn);
    const { id, userLink } = whosTurn!;

    const msg = renderMsgs.dartsNextRoundMsg(id, userLink);
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('БРОСИТЬ🎯', `playerthrow_${id}`)],
    ]);
    console.log('next id is ', id, keyboard)

   await ctx.replyWithHTML(msg, keyboard);
  } catch (error) {
    logger.error(NAMESPACE, 'msgForNextThrow', error);
  }
};

export const playerAccept = async (ctx: Context) => {
  try {
    if (!('text' in ctx.callbackQuery!.message!)) return;

    const { entities } = ctx.callbackQuery!.message!;

    if (!('user' in entities![0])) return;
    if (!('data' in ctx.callbackQuery!)) return;
    const { from, data, message } = ctx.callbackQuery!;
    if (!message?.chat) return;
    const user1 = entities![0].user;

    const idInCommand = data.split('_')[1];
    if (from.id !== +idInCommand) {
      return await ctx.answerCbQuery('Эта кнопка не для вас', {});
    }

    const playerA: Player = {
      id: user1.id,
      userLink: renderMsgs.userLink(user1.id, user1.first_name),
      score: 0,
      playerNum: 0,
    };
    const playerB = {
      id: from.id,
      userLink: renderMsgs.userLink(from.id, from.first_name),
      score: 0,
      playerNum: 1,
    };

    const game: Game = {
      chat_id: message.chat.id,
      players: [playerA, playerB],
      gameType: 'darts',
      score: 0,
      date: Number(new Date()),
      whosTurn: 0,
    };

    const created = await gameDb.createGame(game);

    if (!created) return await ctx.reply('err creating game');

    ctx.reply(
      `id in command is ${idInCommand} pressers id is ${from.id} game created success`,
    );
    // await ctx.deleteMessage();
    await msgForNextThrow(ctx);
  } catch (error) {
    logger.error(NAMESPACE, error);
  }
};

export const playerThrow = async (ctx: Context) => {
  try {
    if (!('chat' in ctx.callbackQuery!.message!)) return;
    if (!('data' in ctx.callbackQuery!)) return;

    const { chat } = ctx.callbackQuery!.message;
    const game = await gameDb.readGame(chat.id);
    if (!game) return;
    //get current plaeyr

    const whosTurn = game.players.find((el) => el.playerNum == game.whosTurn);
    const { id, userLink } = whosTurn!;
    const sendersId = ctx.callbackQuery!.message.from?.id;

    const buttonOwner = ctx.callbackQuery.data.split('_')[1];
    console.log(sendersId, buttonOwner)

    if (sendersId !== +buttonOwner) return await ctx.answerCbQuery('не для тебя');
    //throw dice
    const res = (await ctx.sendDice({ emoji: '🎯' })).dice;
    await ctx.deleteMessage();
    await ctx.answerCbQuery(`${userLink} выбрасывает ${res}!`);

    // update players result
    const updatedPlayers = game.players.map((el) => {
      if (el.id == id) el.score = el.score + res.value;
      return el;
    });
        // ! рендер месседжа с текстом реза  броска
        //! get a check if there is a winner

    // update whosTurn
    game.whosTurn = game.whosTurn === 1 ? 0 : 1;
    game.players = updatedPlayers;
    //  record the results
    await gameDb.updateGame(chat.id, game)

    // pop msgForNextThrow
    await msgForNextThrow(ctx);
  } catch (error) {
    logger.error(NAMESPACE, 'playerThrow', error);
  }
};

// {
//   id: '5081030426331080628',
//   from: {
//     id: 1183019584,
//     is_bot: false,
//     first_name: 'Dm',
//     language_code: 'en'
//   },
//   message: {
//     message_id: 1734,
//     from: {
//       id: 1301536585,
//       is_bot: true,
//       first_name: 'tyotya_bot_dev',
//       username: 'chat_devdev_bot'
//     },
//     chat: {
//       id: -1001349105001,
//       title: 'Gdhrh',
//       username: 'testchatbotdev',
//       type: 'supergroup'
//     },
//     date: 1681665133,
//     text: 'one eighty Вызывает на игру в дартс🎯Dm',
//     entities: [ [Object], [Object], [Object], [Object] ],
//     reply_markup: { inline_keyboard: [Array] }
//   },
//   chat_instance: '-92906532191513296',
//   data: 'playeraccept_1183019584'
// }
