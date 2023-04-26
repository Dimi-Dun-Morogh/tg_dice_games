import { Context, Markup } from "telegraf";
import logger from "helpers/logger";
import renderMsgs, { playerIdName } from "bot/helpers/renderMsgs";
import darts from "bot/helpers/game";
import { Game, Player } from "db/models";
import gameDb from "db/index";
import { waiter } from "helpers/utils";

const NAMESPACE = "handlers_darts";

export const dartsStart = async (ctx: Context) => {
  try {
    if (!("text" in ctx.message!)) return;
    const { from } = ctx.message;

    if (!ctx.message.entities) return; //!might give some msg here

    let playerB: playerIdName | string;

    if (
      !("user" in ctx.message.entities[0]) &&
      ctx.message.entities[0].type == "mention"
    ) {
      //? здесь получается на основе юзернейма надо впилить кнопку и рендер мсг
      const username = ctx.message.text.split(" ")[1];
      playerB = username;
    } else if (ctx.message.entities[0].type == "text_mention") {
      const { id, first_name } = ctx.message.entities[0].user;
      playerB = { id, name: first_name };
    } else {
      return;
    }

    // !  нужен чек на то идет ли уже игра. прошло ли 5 минут с последнего хода.
    const game = await gameDb.readGame(ctx.message.chat.id);
    if (game) {
      const isOld = darts.gameOldEnough(game);
      if (!isOld) {
        await ctx.reply(
          "похоже уже кто-то начал игру, ждите окончания или пока не пройдет 2 минуты с последнего хода"
        );
        return;
      } else {
        await gameDb.deleteGame(ctx.chat!.id!);
      }
    }

    const msg = renderMsgs.dartsStartMsg(
      { id: from.id, name: from.first_name },
      playerB
    );
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "ПРИНЯТЬ",
          `playeraccept_${typeof playerB == "string" ? playerB : playerB.id}`
        ),
      ],
    ]);
    ctx.replyWithHTML(msg, keyboard);
  } catch (error) {
    logger.error(NAMESPACE, error);
  }
};

export const msgForNextThrow = async (ctx: Context, extraMsg = "") => {
  try {
    //get a game
    //gen a msg with btn
    if (!("chat" in ctx.callbackQuery!.message!)) return;

    const { chat } = ctx.callbackQuery!.message!;
    const game = await gameDb.readGame(chat.id);
    if (!game) return;

    const whosTurn = game.players.find((el) => el.playerNum == game.whosTurn);
    const { id, userLink } = whosTurn!;

    const msg = renderMsgs.dartsNextRoundMsg(userLink);
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("БРОСИТЬ🎯", `playerthrow_${id}`)],
    ]);

    await ctx.replyWithHTML(extraMsg + "\n\n" + msg, keyboard);
  } catch (error) {
    logger.error(NAMESPACE, "msgForNextThrow", error);
  }
};

export const playerAccept = async (ctx: Context) => {
  try {
    if (!("text" in ctx.callbackQuery!.message!)) return;

    const { entities } = ctx.callbackQuery!.message!;

    if (!("user" in entities![0])) return;
    if (!("data" in ctx.callbackQuery!)) return;
    const { from, data, message } = ctx.callbackQuery!;
    if (!message?.chat) return;
    const user1 = entities![0].user;

    //playeraccept_xxxx
    const idInCommand = data.slice(13);
    const ownerId = idInCommand[0] === "@" ? "@" + from.username : from.id;

    if (ownerId != idInCommand) {
      return await ctx.answerCbQuery("Эта кнопка не для вас", {});
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
      gameType: "darts",
      date: Number(new Date()),
      whosTurn: 0,
    };

    const created = await gameDb.createGame(game);

    if (!created) return await ctx.reply("err creating game");

    // await ctx.deleteMessage();
    await msgForNextThrow(ctx);
  } catch (error) {
    logger.error(NAMESPACE, error);
  }
};

export const playerThrow = async (ctx: Context) => {
  try {
    if (!("chat" in ctx.callbackQuery!.message!)) return;
    if (!("data" in ctx.callbackQuery!)) return;

    const { chat } = ctx.callbackQuery!.message;
    const game = await gameDb.readGame(chat.id);
    if (!game) return;
    //get current plaeyr

    const whosTurn = game.players.find((el) => el.playerNum == game.whosTurn);
    const { id } = whosTurn!;
    const sendersId = ctx.from?.id;

    const buttonOwner = ctx.callbackQuery.data.split("_")[1];
    console.log(sendersId, buttonOwner);
    const senderProfile = game.players.find((el) => el.id == sendersId);
    if (senderProfile && senderProfile.id !== whosTurn?.id)
      return await ctx.answerCbQuery("не для тебя");

    if (sendersId !== +buttonOwner)
      return await ctx.answerCbQuery("не для тебя");
    //throw dice
    const dice = await ctx.sendDice({
      emoji: "🎯",
      disable_notification: true,
    });

    waiter(5000).then(() => ctx.deleteMessage(dice.message_id));

    const res = dice.dice;

    await waiter(50);

    // update players result
    const updatedPlayers = game.players.map((el) => {
      if (el.id == id) el.score = el.score + res.value;
      return el;
    });

    // update whosTurn

    const bonused = await darts.bonusPoints(ctx, updatedPlayers, id);

    if (!bonused) return;

    game.players = bonused.updated;
    game.whosTurn = game.whosTurn === 1 ? 0 : 1;

    game.date = Number(new Date());
    //  record the results
    await gameDb.updateGame(chat.id, game);
    // ! рендер месседжа с текстом реза  броска
    const roundMsg = renderMsgs.dartsRoundResult(
      res.value,
      whosTurn!.userLink,
      game.players
    );
    await waiter(100);

    //! get a check if there is a winner
    const winner = darts.isThereWinner(game);
    if (winner) {
      await ctx
        .replyWithHTML(roundMsg)
        .catch((err) => logger.error(NAMESPACE, err));
      await darts.gameEnd(ctx, game, winner);
    } else {
      // pop msgForNextThrow

      await waiter(700);
      await msgForNextThrow(ctx, bonused.msg + "\n" + roundMsg);
      await ctx.deleteMessage();
    }
  } catch (error) {
    logger.error(NAMESPACE, "playerThrow", error);
  }
};
