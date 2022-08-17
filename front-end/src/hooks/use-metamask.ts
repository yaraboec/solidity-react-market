import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import React, { useContext } from "react";

export type MetamaskConnection = {
  nftContract: ethers.Contract;
  marketContract: ethers.Contract;
  ethereum: ExternalProvider;
  provider: Web3Provider;
  signer: ethers.providers.JsonRpcSigner;
};

export const MetamaskContext = React.createContext<MetamaskConnection | null>(
  null
);

export const useMetamask = (): MetamaskConnection => {
  const metamaskConnection = useContext(MetamaskContext);

  if (!metamaskConnection) {
    throw new Error("Near connection is not available.");
  }

  return metamaskConnection;
};
