import { BigNumber } from "ethers";

export type Sale = [BigNumber, string, BigNumber] & {
  price: BigNumber;
  seller: string;
  tokenId: BigNumber;
};

export type SaleGraph = {
  id: string;
  price: BigNumber;
  token: {
    ownerId: string;
  };
};
