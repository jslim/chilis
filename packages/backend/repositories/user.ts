import {
  GetUserCommand,
  ListUsersCommand,
  GetUserCommandOutput,
  ListUsersCommandInput,
  ListUsersCommandOutput,
  CognitoIdentityProviderClient,
  UpdateUserAttributesCommand,
  UpdateUserAttributesCommandInput,
  UpdateUserAttributesCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

const repository: UserRepository | null = null;

class UserRepository {
  constructor(private client: CognitoIdentityProviderClient) {}

  public getUserByToken = async (token: string): Promise<GetUserCommandOutput> => {
    return await this.client.send(
      new GetUserCommand({
        AccessToken: token,
      }),
    );
  };

  public ListUsers = async (command: ListUsersCommandInput): Promise<ListUsersCommandOutput> => {
    return await this.client.send(new ListUsersCommand(command));
  };

  public updateUserAttr = async (
    command: UpdateUserAttributesCommandInput,
  ): Promise<UpdateUserAttributesCommandOutput> => {
    return await this.client.send(new UpdateUserAttributesCommand(command));
  };
}

/**
 * Retrieves the user repository based on the provided client.
 * If the repository is not initialized, it creates a new instance.
 * @param client - The CognitoIdentityProviderClient used to interact with the repository.
 * @returns An instance of UserRepository.
 */
export const getUserRepository = (client: CognitoIdentityProviderClient): UserRepository => {
  if (!repository) {
    return new UserRepository(client);
  }

  return repository;
};

export default UserRepository;
