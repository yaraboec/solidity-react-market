import { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

import { useMetamask } from "hooks/use-metamask";
import { ROUTES } from "utils/constants";

import "./header.scss";

export default function Header() {
  const [user, setUser] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const { signer } = useMetamask();

  useEffect(() => {
    const loadUser = async () => {
      setUser(await signer.getAddress());
      setUserBalance(
        ethers.utils
          .formatEther((await signer.getBalance()).toString())
          .slice(0, 10)
      );
    };

    loadUser();
  }, [isConnected]);

  const account = () => (
    <div className="account">
      {user && userBalance ? (
        <>
          <span>Account: {user}</span>
          <span>Balance: {userBalance}</span>
        </>
      ) : (
        <Button onClick={() => setIsConnected(true)}>Connect</Button>
      )}
    </div>
  );

  return (
    <div className="header">
      <Navbar bg="dark" variant="dark">
        <Container className="navbar-content">
          <Navbar.Brand as={Link} to="/">
            Marketplace
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to={ROUTES.HOME}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to={ROUTES.INVENTORY}>
              Inventory
            </Nav.Link>
          </Nav>
          {account()}
        </Container>
      </Navbar>
    </div>
  );
}
