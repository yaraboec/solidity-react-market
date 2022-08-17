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

  const { ethereum, provider } = useMetamask();

  useEffect(() => {
    setUser(window.sessionStorage.getItem("user"));
    setUserBalance(window.sessionStorage.getItem("balance"));
  }, []);

  const connect = async () => {
    const accounts = await ethereum.request?.({
      method: "eth_requestAccounts",
    });
    const balance = ethers.utils
      .formatEther(await provider.getBalance(accounts[0]))
      .slice(0, 10);

    setUserBalance(balance);
    setUser(accounts[0]);
    window.sessionStorage.setItem("user", accounts[0]);
    window.sessionStorage.setItem("balance", balance);
  };

  const disconnect = async () => {
    window.sessionStorage.removeItem("user");
    window.sessionStorage.removeItem("balance");
    setUser(null);
    setUserBalance(null);
  };

  const account = () => (
    <div className="account">
      {user && userBalance ? (
        <>
          <span>Account: {user}</span>
          <span>Balance: {userBalance}</span>
          <Button onClick={disconnect}>Disconnect</Button>
        </>
      ) : (
        <Button onClick={connect}>Connect</Button>
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
          </Nav>
          {account()}
        </Container>
      </Navbar>
    </div>
  );
}
