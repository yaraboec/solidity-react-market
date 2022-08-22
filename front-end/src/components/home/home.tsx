import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { BigNumber, ethers } from "ethers";
import { useQuery, gql } from "@apollo/client";

import { useMetamask } from "hooks/use-metamask";
import { useAsyncAction } from "hooks/use-async-action";
import { SaleGraph } from "types/sale";

import "./home.scss";

export default function Home() {
  const [marketSales, setMarketSales] = useState<SaleGraph[]>([]);

  const { isLoading, runAsyncAction } = useAsyncAction();
  const { marketContract, nftContract, signer } = useMetamask();

  const { loading, error, data } = useQuery(
    gql`
      query ($first: Int) {
        sales(first: $first) {
          id
          token {
            ownerId
          }
          price
        }
      }
    `,
    {
      variables: { first: 100 },
    }
  );

  if (error) {
    console.log(error.message);
  }

  useEffect(() => {
    if (data) {
      const { sales }: { sales: SaleGraph[] } = data;

      setMarketSales(sales);
    }
  }, [data]);

  const handleBuy = async (tokenId: string, price: BigNumber) => {
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
      {!marketSales.length ? (
        <div className="empty">No available sales.</div>
      ) : (
        <div className="sales">
          {marketSales.map((sale) => (
            <div key={sale.id} className="sale">
              <span>Id: {sale.id}</span>
              <span>Owner: {sale.token.ownerId}</span>
              <span>Price: {ethers.utils.formatEther(sale.price)}</span>
              <Button onClick={async () => handleBuy(sale.id, sale.price)}>
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
      {isLoading || loading ? <div>Loading...</div> : getSales()}
    </div>
  );
}
