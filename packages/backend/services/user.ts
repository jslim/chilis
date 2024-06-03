import type UserRepository from "@/repositories/user";
import { EN_PROFANITIES } from "@/libs/profanities/en";
import { ES_PROFANITIES } from "@/libs/profanities/es";
import { UpdateUserAttributesCommandOutput } from "@aws-sdk/client-cognito-identity-provider";

export default class UserService {
  constructor(private repository: UserRepository) {}

  public updateUserPreferredUsername = async (accessToken: string, nickname: string): Promise<UpdateUserAttributesCommandOutput> => {
    await this.validatePreferredUsername(accessToken, nickname);

    return this.repository.updateUserAttr({
      AccessToken: accessToken,
      UserAttributes: [
        {
          Name: "preferred_username",
          Value: nickname,
        },
      ],
    });
  };

  private validatePreferredUsername = async (accessToken: string, nickname: string): Promise<void> => {
    // Validates if the user already has a username
    await this.checkHaveUsername(accessToken);
    // Validate that it does not have profanity words
    await this.checkProfanity(nickname);
    // Validate that it does not exist in another user
    await this.checkNicknameExists(nickname);
  };

  /**
   * Checks if the user associated with the provided token already has a nickname.
   *
   * @param {string | undefined} token - The JWT token used for authorization.
   * @throws {Error} If the token is missing, user data is not found, or the user already has a nickname.
   */
  private checkHaveUsername = async (token: string) => {
    try {
      const userData = await this.repository.getUserByToken(token);

      if (userData === null) {
        throw new Error("User data not found");
      }

      const currentNickname = userData.UserAttributes?.find((attr) => attr.Name === "preferred_username");

      if (currentNickname?.Value) {
        throw new Error("User already has a nickname");
      }
    } catch (error) {
      throw new Error(`Error checking user's nickname: ${error}`);
    }
  };

  /**
   * Checks if the given nickname contains any profanity words.
   *
   * @param {string} nickname - The nickname to check for profanity.
   * @throws {Error} If the nickname contains profanity words.
   */
  private checkProfanity = async (nickname: string) => {
    const profanitySet = new Set([...EN_PROFANITIES, ...ES_PROFANITIES]);

    for (const p of profanitySet) {
      if (nickname.includes(p)) {
        throw new Error(`Request failed the profanity check on word "${p}"`);
      }
    }
  };

  /**
   * Checks if a given nickname already exists in the user pool.
   *
   * @param {string} nickname - The nickname to check for existence.
   * @throws {Error} If the username is already taken or an error occurs during the check.
   */
  private checkNicknameExists = async (nickname: string) => {
    try {
      const response = await this.repository.ListUsers({
        AttributesToGet: ["preferred_username"],
        UserPoolId: process.env.USER_POOL_ID,
        Filter: `preferred_username = "${nickname}"`,
      });

      if (response.Users && response.Users.length) {
        throw new Error("Username is already taken.");
      }
    } catch (error) {
      throw new Error(`Error checking if username is taken: ${error}`);
    }
  };
}
