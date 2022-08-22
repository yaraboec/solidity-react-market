import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

import "bootstrap/dist/css/bootstrap.min.css";

const APIURL = `https://api.thegraph.com/subgraphs/name/${process.env.REACT_APP_SUBGRAPH_NAME}`;

const getGraphClient = () =>
  new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
  });

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={getGraphClient()}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
