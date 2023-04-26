import * as dotenv from "dotenv";
dotenv.config();

const config = {
  dbUrl: process.env.DATABASE_URL,
  appUrl: process.env.APP_URL,
  botApiKey:
    process.env.NODE_ENV === "production"
      ? process.env.tg_bot_token
      : process.env.dev_bot_token,
};

export default config;
