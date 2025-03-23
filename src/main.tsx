import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { Provider, useDispatch } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Buffer } from 'buffer';

import { useAppSelector } from './app/hooks';
import { selectUiSettings } from './features/config/ui-config-slice';
import { Authentication } from './features/authentication/authentication';
import { setSessionInfo } from './features/authentication/session-info-slice';
import { store } from './app/store';
import { UiConfigLoader } from './features/config/ui-config-loader';
import { MainWindow } from './features/main-window/main-window';
// import App from './App';

import { environment } from './environments/environment';

import './index.css';
import { useEffect } from 'react';

window.Buffer = Buffer;

const oidcConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authority: `${(window as any).env.API_URL!}/api/v1/connect`,
  client_id: environment.clientId,
  redirect_uri: `${window.location.origin}/callback`,
  scope: 'openid offline_access',
  response_type: 'code',
  automaticSilentRenew: true,
  post_logout_redirect_uri: window.location.origin,
};


// const container = document.querySelector('#app');
// if (container) {
//   const root = createRoot(container);
//   root.render(<App />);
// } else {
//   console.error('Failed to find the app container');
// }

export function AppWrapper() {
  const navigate = useNavigate();
  const auth = useAuth();
  const dispatch = useDispatch();
  const uiSettings = useAppSelector(selectUiSettings);
  const theme = createTheme({
    typography: {
      fontFamily: [
        "Roboto", 
        "Helvetica", 
        "Arial",
        "sans-serif",
      ].join(','),
    },
    palette: {
      primary: {
        main: uiSettings.mainColor ?? '#121d4b',
        contrastText: uiSettings.contrastTextColor ?? '#ffffff',
      },
      text: {
        primary: uiSettings.mainTextColor ?? '#000000',
        secondary: uiSettings.secondaryTextColor ?? '#213547',
      },
      background: {
        paper: uiSettings.backgroundColor ?? '#FEFEFE',
        default: uiSettings.backgroundColor ?? '#FFFFFF',
      },
    },
  });
  useEffect(() => {
    const sessionInfo = store.getState().sessionInfo;
    if (!sessionInfo.isAuthenticated) {
      dispatch(
        setSessionInfo({
          isAuthenticated: true,
          fullName: auth.user?.profile.name ?? '',
          loginName: auth.user?.profile.sub ?? '',
        }),
      );
    }
    return auth.events.addAccessTokenExpiring(() => {
      auth.signinSilent();
    });
  }, [auth.events, auth.signinSilent, auth]);

  useEffect(() => {
    document.title = uiSettings.pageTitle;
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link && uiSettings.favIconUrl && uiSettings.favIconUrl !== '') {
      link.href = uiSettings.favIconUrl;
    }
  }, []);

  if (auth.isAuthenticated) {
    if (window.location.pathname.startsWith('/callback')) {
      navigate('/');
      return <></>;
    }
    return (
      <ThemeProvider theme={theme}>
        <MainWindow />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <Authentication errorText={auth.error ? 'Login failed' : ''} isLoading={auth.isLoading} />
    </ThemeProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <AuthProvider {...oidcConfig}>
    <BrowserRouter>
      <Provider store={store}>
        <UiConfigLoader>
          <AppWrapper />
        </UiConfigLoader>
      </Provider>
    </BrowserRouter>
  </AuthProvider>,
);
