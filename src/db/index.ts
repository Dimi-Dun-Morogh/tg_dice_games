import logger from "helpers/logger";
import mongoose from "mongoose";
import config from "config/";
import GameCollection, { Game } from "db/models";

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
      await GameCollection.create(gameObj);
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
}

const gameDb = new GameDb();

export default gameDb;
