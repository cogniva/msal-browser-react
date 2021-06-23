import React, { useState, useEffect, useContext } from "react";
import * as msal from "@azure/msal-browser";

const ua = window.navigator.userAgent;
const msie = ua.indexOf("MSIE ");
const msie11 = ua.indexOf("Trident/");
const msedge = ua.indexOf("Edge/");
const isIE = msie > 0 || msie11 > 0;
const isEdge = msedge > 0;

export const MsalContext = React.createContext();
export const useMsal = () => useContext(MsalContext);

export function MsalProvider(props) {
    const {
        children,
        config
    } = props;
    const [isAuthenticated, setIsAuthenticated] = useState();
    const [user, setUser] = useState();
    const [token, setToken] = useState();
    const [publicClient, setPublicClient] = useState();
    const [loading, setLoading] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [loginError, setLoginError] = useState(false);

    useEffect(UseEffect, []);

    function UseEffect() {

        const pc = new msal.PublicClientApplication(config);
        setPublicClient(pc);

        pc.handleRedirectPromise().then((response) => {
            setLoading(false);
            if (response) {
                setUser(pc.getAccount());
                setIsAuthenticated(true);
                if (response.accessToken) {
                    setToken(response.accessToken);
                }
            }
        }).catch(error => {
            console.log(error);
            setLoginError(error);
        });

        if (pc.getAccount && pc.getAccount()) {
            setUser(pc.getAccount());
            setIsAuthenticated(true);
        }
    }

    async function login(loginRequest, method) {
        const signInType = (isIE || isEdge) ? "loginRedirect" : method;
        if (signInType === "loginPopup") {
            setPopupOpen(true);

            try {
                await publicClient.loginPopup(loginRequest);

                if (publicClient.getAccount()) {
                    setUser(publicClient.getAccount());
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.log(error);
                setLoginError(error);
            } finally {
                setPopupOpen(false);
            }
        } else if (signInType === "loginRedirect") {
            setLoading(true);

            publicClient.loginRedirect(loginRequest)
        }
    }

    function logout() {
        publicClient.logout();
    }

    async function getTokenPopup(loginRequest) {
        try {
            const response = await publicClient.acquireTokenSilent(loginRequest);
            setToken(response.accessToken);
        } catch (error) {
            try {
                setPopupOpen(true);

                const response = await publicClient.acquireTokenPopup(loginRequest);

                setToken(response.accessToken);
            } catch (error) {
                console.log(error);
                setLoginError(error);
            } finally {
                setPopupOpen(false);
            }
        }
    }

// This function can be removed if you do not need to support IE
    async function getTokenRedirect(loginRequest) {
        try {
            setToken(await publicClient.acquireTokenSilent(loginRequest));
        } catch (error) {

            try {
                setLoading(true);

                publicClient.acquireTokenRedirect(loginRequest);
            } catch (error) {
                console.log(error);
                setLoginError(error);
            }
        }
    }

    async function getToken(loginRequest, method) {
        const signInType = (isIE || isEdge) ? "loginRedirect" : method;
        if (signInType === "loginRedirect") {
            return await getTokenRedirect(loginRequest);
        } else {
            return await getTokenPopup(loginRequest);
        }
    }

    return (
        <MsalContext.Provider
            value={{
                isAuthenticated,
                user,
                token,
                loading,
                popupOpen,
                loginError,
                login,
                logout,
                getToken
            }}
        >
            {children}
        </MsalContext.Provider>
    );
}