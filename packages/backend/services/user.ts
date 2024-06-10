import type UserRepository from "@/repositories/user";
import { EN_PROFANITIES } from "@/libs/profanities/en";
import { ES_PROFANITIES } from "@/libs/profanities/es";
import { AttributeType, UpdateUserAttributesCommandOutput } from "@aws-sdk/client-cognito-identity-provider";

export default class UserService {
  constructor(private repository: UserRepository) {}

  /**
   * Updates the preferred username for a user.
   *
   * @param {string} accessToken - The access token of the user.
   * @param {string} nickname - The preferred username to update.
   * @returns {Promise<UpdateUserAttributesCommandOutput>} The result of updating the preferred username.
   * @throws {Error} If the username is already taken, contains profanity, or an error occurs during validation.
   */
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

  /**
   * Validates the preferred username for profanity and uniqueness.
   *
   * @param {string} accessToken - The access token of the user.
   * @param {string} nickname - The preferred username to validate.
   * @throws {Error} If the username is already taken, contains profanity, or an error occurs during validation.
   */
  private validatePreferredUsername = async (accessToken: string, nickname: string): Promise<void> => {
    // Validates if the user already has a username
    await this.checkHaveUsername(accessToken);
    // Validate that it does not have profanity words
    await this.checkProfanity(nickname);
    // Validate that it does not exist in another user
    await this.checkNicknameExists(nickname);
  };

  /**
   * Retrieves the preferred username associated with the provided token.
   *
   * @param {string} token - The JWT token used for authorization.
   * @returns {string | undefined} The preferred username if found, undefined otherwise.
   * @throws {Error} If user data is not found.
   */
  private getPreferredUsername = async (token: string): Promise<AttributeType | undefined> => {
    const accessToken = this.extractAccessToken(token);
    const userData = await this.repository.getUserByToken(accessToken);

    if (!userData || !userData.UserAttributes) {
      throw new Error("User data not found");
    }

    return userData.UserAttributes.find((attr) => attr.Name === "preferred_username");
  };

  /**
   * Checks if the user associated with the provided token already has a nickname.
   *
   * @param {string | undefined} token - The JWT token used for authorization.
   * @throws {Error} If the token is missing, user data is not found, or the user already has a nickname.
   */
  private checkHaveUsername = async (token: string) => {
    try {
      const currentNickname = await this.getPreferredUsername(token);

      if (currentNickname?.Value) {
        throw new Error("User already has a nickname");
      }
    } catch (error) {
      throw new Error(`Error checking user's nickname: ${error}`);
    }
  };

  /**
   * Retrieves the user's nickname associated with the provided token.
   *
   * @param {string} token - The JWT token used for authorization.
   * @returns The user's nickname.
   * @throws {Error} If the user data is not found or the user's nickname is not found.
   */
  public getUsername = async (token: string): Promise<string> => {
    try {
      const currentNickname = await this.getPreferredUsername(token);

      if (currentNickname && currentNickname.Value) {
        return currentNickname.Value;
      } else {
        throw new Error("User nickname not found");
      }
    } catch (error: any) {
      throw new Error(`Error retrieving user's nickname: ${error.message}`);
    }
  };

  /**
   * Extracts the access token from the provided token string.
   *
   * @param {string} token - The JWT token string.
   * @returns {string} The extracted access token.
   * @throws {Error} If the token format is incorrect.
   */
  private extractAccessToken = (token: string): string => {
    if (token.includes("Bearer")) {
      const splitToken = token.split(" ");
      return (
        splitToken?.[1] ??
        (() => {
          throw new Error("Authorization header should have a format Bearer JWT Token");
        })()
      );
    }

    return token;
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
