import axios from "axios";

export interface AccessToken {
  value: string;
  expiresIn: number;
}

export const getAccessToken = async (
  clientId: string,
  clientSecret: string
): Promise<AccessToken> => {
  const {
    data: { access_token, expires_in },
  } = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: clientId,
        password: clientSecret,
      },
    }
  );

  return { value: access_token, expiresIn: expires_in };
};
