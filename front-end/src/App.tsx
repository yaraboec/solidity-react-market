import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Navbar } from "react-bootstrap";

import Header from "components/header/header";
import { MetamaskConnection, MetamaskContext } from "hooks/use-metamask";

import Nft from "../../artifacts/contracts/Nft.sol/Nft.json";
import NftMarketplace from "../../artifacts/contracts/NftMarketplace.sol/NftMarketplace.json";

import Router from "./router";

import "./App.scss";

export default function App() {
  const [metamaskConnection, setMetamaskConnection] =
    useState<MetamaskConnection | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!window.ethereum) return;
      const { ethereum } = window;

      const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        process.env.ALCHEMY_API_KEY
      );
      const nftContract = new ethers.Contract(
        process.env.REACT_APP_NFT_CONTRACT_ADDRESS ?? "",
        Nft.abi,
        provider
      );
      const marketContract = new ethers.Contract(
        process.env.REACT_APP_MARKET_CONTRACT_ADDRESS ?? "",
        NftMarketplace.abi,
        provider
      );

      setMetamaskConnection({
        nftContract,
        marketContract,
        ethereum,
        provider,
      });
    };

    initContract();
  }, [setMetamaskConnection]);

  return (
    <div className="App">
      {metamaskConnection ? (
        <MetamaskContext.Provider value={metamaskConnection}>
          <Header />
          <Router />
        </MetamaskContext.Provider>
      ) : (
        <div className="not-installed">
          <Navbar bg="light">
            Metamask extension has not found
            <Navbar.Brand href="https://metamask.io/">Download</Navbar.Brand>
          </Navbar>
        </div>
      )}
    </div>
  );
}
