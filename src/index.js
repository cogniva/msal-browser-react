import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Button, Grid } from "@material-ui/core";
import { InteractionType, PublicClientApplication } from "@azure/msal-browser";
import {
    AuthenticatedTemplate,
    MsalAuthenticationTemplate,
    MsalProvider,
    UnauthenticatedTemplate,
    useIsAuthenticated,
    useMsal
} from "@azure/msal-react";

const clientId = "";
const tenantId = "";
const loginHint = "example@domain.com";
export const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: 'https://localhost:3000/',
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
    scopes: ["openid", "profile", "User.Read"],
    forceRefresh: false, // Set this to "true" to skip a cached token and go to the server to get a new token
    loginHint: loginHint
};
// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const apiRequest = {
    scopes: ["API-SCOPE"],
    forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
};

function MsalLogin(props) {
    const { children } = props
    return (
        <React.Fragment>
            <p>Anyone can see this paragraph.</p>
            <AuthenticatedTemplate>
                {children}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <Login/>
            </UnauthenticatedTemplate>
        </React.Fragment>
    )
}
const ErrorComponent = ({error}) => <p>An Error Occurred: {error}</p>;
const LoadingComponent = () => <p>Authentication in progress...</p>;

function Login(props) {
    const {children} = props
    const [showLogin, setShowLogin] = useState()
    const { instance, accounts, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated) {
        const logoutRequest = {
            account: instance.getActiveAccount(),
            mainWindowRedirectUri: "https://localhost:3000"
        }
        const logout = () => instance.logoutRedirect(logoutRequest)
        return (<div>
            <Button variant="contained" color="primary" onClick={logout}>Logout</Button>
            {children}
        </div>)
    }
    if (showLogin) {
        const authRequest = {
            scopes: ["openid", "profile"]
        };
        return <MsalAuthenticationTemplate
            interactionType={InteractionType.Popup}
            authenticationRequest={authRequest}
            errorComponent={ErrorComponent}
            loadingComponent={LoadingComponent}
        >

        </MsalAuthenticationTemplate>
    }
    return <VerticalGrid>
        <Button variant="contained" color="primary" onClick={setShowLogin}>Sign in</Button>
        <Button variant="contained" color="secondary" onClick={setShowLogin}>Continue logged out</Button>
    </VerticalGrid>

}

function VerticalGrid(props) {
    return <Grid
        container
        spacing={3}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
    >
        {props.children.map(child=><Grid item xs={3}>{child}</Grid>)}
    </Grid>
}

const pca = new PublicClientApplication(msalConfig);

function AppProvider() {
    return (
        <MsalProvider instance={pca}>
            <Login></Login>
        </MsalProvider>
    );
}

ReactDOM.render(<AppProvider />, document.getElementById('root'))
