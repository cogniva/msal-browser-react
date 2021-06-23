import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { MsalProvider } from "./msal-context";
import { msalConfig, loginRequest } from "./auth-config";

ReactDOM.render(
  <MsalProvider
  config={msalConfig}
  scopes={loginRequest}
>
  <App />
</MsalProvider>,
  document.getElementById('root')
);
