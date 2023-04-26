import logger from "helpers/logger";
import mongoose from "mongoose";
import config from "config/";
import GameCollection, {
  Game,
  Player,
  PlayerRating,
  PlayerRatingM,
} from "db/models";

const NAMESPACE = "db/index";

class GameDb {
  async connectDb() {
    try {
      await mongoose.connect(config.dbUrl!);
    } catch (error) {
      logger.error(NAMESPACE, error);
      process.exit(1);
    }
  }

  async createGame(gameObj: Game) {
    try {
      // тут прочекать сколько минут назад была создана игра или был последний ход
      const ifExists = await this.readGame(gameObj.chat_id);
      if (ifExists) return false;
      const data = await GameCollection.create(gameObj);
      return data;
    } catch (error) {
      logger.error(NAMESPACE, error);
    }
  }

  async readGame(chatId: number) {
    try {
      const game = await GameCollection.findOne({ chat_id: chatId });
      return game;
    } catch (error) {
      logger.error(NAMESPACE, error);
    }
  }

  async updateGame(id: number, data: Game) {
    try {
      console.log("updating data", data.players);
      await GameCollection.updateOne({ chat_id: id }, data, { upsert: true });
      const gameUpdated = await GameCollection.findOne({ chat_id: id });
      return gameUpdated;
    } catch (error) {
      logger.error(NAMESPACE, error);
    }
  }

  async deleteGame(chatId: number) {
    try {
      const deleted = await GameCollection.findOneAndRemove({
        chat_id: chatId,
      });
      return deleted;
    } catch (error) {
      logger.error(NAMESPACE, error);
    }
  }

  async updateRating(chatId: number, data: PlayerRating) {
    try {
      const { p_id, chat_id, score, userLink } = data;
      const updated = await PlayerRatingM.findOneAndUpdate(
        { chat_id: chatId, p_id: data.p_id },
        { p_id, chat_id, score, userLink },
        { upsert: true }
      );
      console.log(updated, "data was\n\n", data);
      return updated;
    } catch (error) {
      logger.error(NAMESPACE, "updateRating", error);
    }
  }

  async getChatRating(chatId: number) {
    try {
      const data = await PlayerRatingM.find({ chat_id: chatId });
      return data;
    } catch (error) {
      logger.error(NAMESPACE, error);
    }
  }
}

const gameDb = new GameDb();

export default gameDb;
