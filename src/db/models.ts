import mongoose, { Document } from "mongoose";

export type Player = {
  id: number;
  userLink: string;
  score: number;
};

export type Game = {
  chat_id: number;
  playerA: Player;
  playerB: Player;
  gameType: string;
  user_id: number;
  date: number;
};

export interface GameModel extends Game, Document {}

const playerSchema = new mongoose.Schema({
  id: Number,
  userLink: String,
  score: Number,
});

export const gameSchema = new mongoose.Schema({
  chat_id: Number,
  playerA: playerSchema,
  playerB: playerSchema,
  gameType: String,
  user_id: Number,
  date: Number,
});

export default mongoose.model<GameModel>("Game", gameSchema);
