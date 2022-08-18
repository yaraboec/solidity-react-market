import { useState, useEffect } from "react";

import { useMetamask } from "hooks/use-metamask";
import { useAsyncAction } from "hooks/use-async-action";
import { Token } from "types/nft";
import { Sale } from "types/sale";

import "./inventory.scss";
import { ethers } from "ethers";
import { Button } from "react-bootstrap";

export default function Inventory() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokensSales, setTokensSales] = useState<Sale[]>([]);

  const { isLoading, runAsyncAction } = useAsyncAction();
  const { marketContract, nftContract, signer } = useMetamask();

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    runAsyncAction(async () => {
      setTokens(
        await nftContract.callStatic.getNftsByOwner(await signer.getAddress())
      );
    });
    runAsyncAction(async () => {
      setTokensSales(
        await marketContract.callStatic.getSalesByOwner(
          await signer.getAddress()
        )
      );
    });
  };

  const handleSaleRemove = (tokenId: string) => {
    runAsyncAction(async () => {
      await marketContract
        .connect(signer)
        .removeSale(nftContract.address, tokenId);
    });
  };

  const handleAddSale = (tokenId: string) => {
    runAsyncAction(
      async () => {
        await nftContract
          .connect(signer)
          .approve(marketContract.address, tokenId);
      },
      undefined,
      true
    );
    runAsyncAction(
      async () => {
        await marketContract
          .connect(signer)
          .addSale(
            nftContract.address,
            tokenId,
            ethers.utils.parseEther("0.0001")
          );
      },
      undefined,
      true
    );
  };

  const getTokens = () => (
    <div>
      {!tokens.length && !tokensSales.length ? (
        <div className="empty">No available sales.</div>
      ) : (
        <>
          <h3 className="token-title">Owned tokens</h3>
          <div className="tokens">
            {tokens.map((token) => (
              <div key={token[0].toString()} className="token">
                <span>Id: {token[0].toString()}</span>
                <span>URI: {token[1].toString()}</span>
                <Button
                  onClick={async () => handleAddSale(token[0].toString())}
                >
                  Sell
                </Button>
              </div>
            ))}
          </div>
          <h3 className="token-title">Owned sales</h3>
          <div className="sales">
            {tokensSales.map((sale) => (
              <div key={sale[2].toString()} className="sale">
                <span>Id: {sale[2].toString()}</span>
                <span>Owner: {sale[1]}</span>
                <span>
                  Price: {ethers.utils.formatEther(sale[0].toString())}
                </span>
                <Button
                  onClick={async () => handleSaleRemove(sale[2].toString())}
                >
                  Remove sale
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="inventory">
      {isLoading ? <div>Loading...</div> : getTokens()}
    </div>
  );
}
