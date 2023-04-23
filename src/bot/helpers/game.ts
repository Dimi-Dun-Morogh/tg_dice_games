import gameDb from 'db/index';
import { Game, Player } from 'db/models';
import logger from 'helpers/logger';
import { waiter } from 'helpers/utils';
import { Context } from 'telegraf';
import renderMsgs from './renderMsgs';

class Darts {
  private static namespace = 'helpers/darts';

  static isThereWinner(game: Game) {
    try {
      const scoretoWin = 25;
      const winner = game.players.find((el) => el.score >= scoretoWin);
      if (!winner) return false;

      return winner;
    } catch (error) {
      logger.error(this.namespace, 'isThereWinner', error);
    }
  }

  static async gameOldEnough(game: Game) {
    try {
      const diff = Math.abs(Number(new Date(game.date)) - Number(new Date()));
      const minutes = Math.floor(diff / 1000 / 60);
      return minutes >= 2;
    } catch (error) {
      logger.error(this.namespace, 'gameOldEnough', error);
    }
  }

  static async updateRatings(game: Game) {
    try {
      const { chat_id, players } = game;
      const ratingInDb = await gameDb.getChatRating(chat_id);

      for (let i = 0; i < players.length; i++) {
        //compose db with current
        const toAdd = players[i];
        const addTo = ratingInDb?.find((el) => el.p_id == toAdd.id);
        if (addTo) {
          await gameDb.updateRating(chat_id, {
            ...addTo,
            p_id: toAdd.id,
            score: addTo.score + toAdd.score,
          });
          console.log('summin old rating');
        } else {
          await gameDb.updateRating(chat_id, {
            p_id: toAdd.id,
            score: toAdd.score,
            chat_id,
            userLink: toAdd.userLink,
          });
          console.log('writing new rating');
        }
      }
    } catch (error) {
      logger.error(this.namespace, 'updateRatings', error);
    }
  }

  static async bonusPoints(
    ctx: Context,
    players: Array<Player>,
    whosTurn: number,
  ) {
    try {
      const randomNum = Math.floor(Math.random() * 11);
      const currentPlayer = players.find((el) => el.id == whosTurn);

      let amount = 0;
      let msg = '';
      if (!currentPlayer) return { updated: players, msg };

      switch (randomNum) {
        case 10:
          amount = 5;
          msg = `сегодня в магазин завезли яшик конга, ${currentPlayer.userLink} получает бонусные ${amount} очков`;

          await waiter(1000);
          await ctx.sendSticker(renderMsgs.stickers.epic);
          break;
        case 4:
          amount = -1;
          msg = `В бар залетает Артур и ломает телевизор, ${currentPlayer.userLink} теряет ${amount} очков`;

          await waiter(1000);
          await ctx.sendSticker(renderMsgs.stickers.shha);
          break;
        case 3:
          amount = -3;
          msg = `${currentPlayer.userLink} подскользнулся и упал на бутылку голда, он теряет ${amount} очков`;

          await waiter(1000);
          await ctx.sendSticker(renderMsgs.stickers.failed);
          break;
        default:
          break;
      }

      //update score;
      const updated = players.map((el) => {
        if (el.id === currentPlayer.id) el.score += amount;
        return el;
      });

      return { updated, msg } as { updated: Array<Player>; msg: string };
    } catch (error) {
      logger.error(this.namespace, 'bonusPoints', error);
    }
  }

  static async gameEnd(ctx: Context, game: Game, winner: Player) {
    try {
      await waiter(500);

      await this.updateRatings(game);

      //delete game
      await gameDb.deleteGame(game.chat_id);
      const rating = await gameDb.getChatRating(game.chat_id);

      if (!rating) return;

      const mapped = rating.map((el) => el);
      await ctx.replyWithHTML(
        renderMsgs.dartsWinnerMsg(winner) +
          '\n\n' +
          renderMsgs.ratingMsg(mapped),
      );
    } catch (error) {
      logger.error(this.namespace, 'gameEnd', error);
    }
  }
}

export default Darts;
