import { BigNumber } from "ethers";

export type Token = [BigNumber, string] & {
  tokenId: BigNumber;
  tokenURI: string;
};

export type TokenGraph = {
  id: string;
};
