import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { BigNumber, ethers } from "ethers";

import { useMetamask } from "hooks/use-metamask";
import { useAsyncAction } from "hooks/use-async-action";
import { Sale } from "types/sale";

import "./home.scss";

export default function Home() {
  const [sales, setSales] = useState<Sale[]>([]);

  const { isLoading, runAsyncAction } = useAsyncAction();
  const { marketContract, provider, nftContract } = useMetamask();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    runAsyncAction(async () => {
      setSales(await marketContract.callStatic.getSales());
    });
  };

  const handleBuy = async (tokenId: string, price: BigNumber) => {
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    if (signer) {
      runAsyncAction(async () => {
        await marketContract
          .connect(signer)
          .tokenPurchase(nftContract.address, tokenId, { value: price });
      });
    }
  };

  const getSales = () => (
    <div>
      {!sales.length ? (
        <div className="empty">No available sales.</div>
      ) : (
        <div className="sales">
          {sales.map((sale) => (
            <div key={sale[2].toString()} className="sale">
              <span>Id: {sale[2].toString()}</span>
              <span>Owner: {sale[1]}</span>
              <span>Price: {ethers.utils.formatEther(sale[0].toString())}</span>
              <Button
                onClick={async () => handleBuy(sale[2].toString(), sale[0])}
              >
                Buy
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="marketplace">
      {isLoading ? <div>Loading...</div> : getSales()}
    </div>
  );
}
