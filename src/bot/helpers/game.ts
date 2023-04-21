import { Game } from 'db/models';
import logger from 'helpers/logger';

class Darts {
  private namespace = 'helpers/darts';

  isThereWinner(game: Game) {
    try {
      const scoretoWin = 25;
      const winner = game.players.find((el) => el.score >= scoretoWin);
      if (!winner) return false;

      return winner;
    } catch (error) {
      logger.error(this.namespace, 'isThereWinner', error);
    }
  }

  async gameOldEnough(game: Game) {
    try {
      const diff = Math.abs(Number(new Date(game.date)) - Number(new Date()));
      const minutes = Math.floor(diff / 1000 / 60);
      return minutes >=2;
    } catch (error) {
      logger.error(this.namespace, 'gameOldEnough', error);
    }
  }
}

export default new Darts();
