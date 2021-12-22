import Joi from "joi";
import dotenv from "dotenv";

export interface Config {
  clientId: string;
  clientSecret: string;
}

const SCHEMA_ENV = Joi.object({
  clientId: Joi.string().required(),
  clientSecret: Joi.string().required(),
});

export const getConfig = () => {
  dotenv.config();

  const config = (({ SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET }) => ({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
  }))(process.env);

  const { error } = SCHEMA_ENV.validate(config);

  if (error) throw error;

  return config as Config;
};
