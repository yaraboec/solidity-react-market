import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { ethers } from "ethers";
import { Button } from "react-bootstrap";

import { useMetamask } from "hooks/use-metamask";
import { useAsyncAction } from "hooks/use-async-action";
import { TokenGraph } from "types/nft";
import { SaleGraph } from "types/sale";

import "./inventory.scss";

export default function Inventory() {
  const [userTokens, setUserTokens] = useState<TokenGraph[]>([]);
  const [tokensSales, setTokensSales] = useState<SaleGraph[]>([]);
  const [user, setUser] = useState<string | null>(null);

  const { isLoading, runAsyncAction } = useAsyncAction();
  const { marketContract, nftContract, signer } = useMetamask();

  const { loading, error, data } = useQuery(
    gql`
      query ($first: Int, $owner: String) {
        tokens(first: $first, where: { ownerId: $owner }) {
          id
        }
        sales(first: $first, where: { token_: { ownerId: $owner } }) {
          id
          token {
            ownerId
          }
          price
        }
      }
    `,
    {
      variables: { first: 100, owner: user?.toLowerCase() },
    }
  );

  if (error) {
    console.log(error.message);
  }

  useEffect(() => {
    if (data) {
      const { sales, tokens }: { sales: SaleGraph[]; tokens: TokenGraph[] } =
        data;

      setUserTokens(tokens);
      setTokensSales(sales);
    }
  }, [data]);

  useEffect(() => {
    const loadUser = async () => {
      setUser(await signer.getAddress());
    };

    loadUser();
  }, []);

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
      {!userTokens.length && !tokensSales.length ? (
        <div className="empty">No available sales.</div>
      ) : (
        <>
          <h3 className="token-title">Owned tokens</h3>
          <div className="tokens">
            {userTokens.map((token) => (
              <div key={token.id} className="token">
                <span>Id: {token.id}</span>
                <Button onClick={async () => handleAddSale(token.id)}>
                  Sell
                </Button>
              </div>
            ))}
          </div>
          <h3 className="token-title">Owned sales</h3>
          <div className="sales">
            {tokensSales.map((sale) => (
              <div key={sale.id} className="sale">
                <span>Id: {sale.id}</span>
                <span>Owner: {sale.token.ownerId}</span>
                <span>Price: {ethers.utils.formatEther(sale.price)}</span>
                <Button onClick={async () => handleSaleRemove(sale.id)}>
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
      {isLoading || loading ? <div>Loading...</div> : getTokens()}
    </div>
  );
}
