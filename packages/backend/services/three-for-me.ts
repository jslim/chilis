import type TFMRepository from "@/repositories/three-for-me";

export default class TFMService {
  constructor(private repository: TFMRepository) {}

  public setTFM = async (userSub: string, gameId: string): Promise<void> => {
    try {
      await this.repository.setTFM({
        userSub,
        gameId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      throw new Error(`An error occurred while trying to set three for me values. ${err}`);
    }
  };
}
