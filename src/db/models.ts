import mongoose, { Document } from 'mongoose';

export type Player = {
  id: number;
  userLink: string;
  score: number;
  playerNum: number;
};

export type PlayerRating = {
  p_id: number;
  userLink: string;
  score: number;
  chat_id: number;
};

export type Game = {
  chat_id: number;
  players: Array<Player>;
  gameType: string;
  date: number;
  whosTurn: number;
};

export interface PlayerRatingModel extends PlayerRating, Document {}

const playyerRatingSchema = new mongoose.Schema({
  id: Number,
  p_id: Number,
  userLink: String,
  score: Number,
  chat_id: Number,
});


export  const PlayerRatingM = mongoose.model<PlayerRatingModel>('PlayerRating', playyerRatingSchema);


export interface GameModel extends Game, Document {}

const playerSchema = new mongoose.Schema({
  id: Number,
  userLink: String,
  score: Number,
  playerNum: Number,
});

export const gameSchema = new mongoose.Schema({
  chat_id: Number,
  players: [playerSchema],
  gameType: String,
  date: Number,
  whosTurn: Number,
});

export default mongoose.model<GameModel>('Game', gameSchema);
