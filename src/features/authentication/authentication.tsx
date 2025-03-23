import { FC, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  Typography,
  CardActions,
  Divider,
  CircularProgress,
} from '@mui/material';
import './authentication.css';
import { useAuth } from 'react-oidc-context';
import { environment } from './../../environments/environment';
import { selectUiSettings } from '../config/ui-config-slice';
import { useAppSelector } from '../../app/hooks';

interface Props {
  errorText: string;
  isLoading: boolean;
}

export const Authentication: FC<Props> = (props: Props) => {
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const uiSettings = useAppSelector(selectUiSettings);

  const handleSsoLogin = async (provider: string) => {
    const signinRedirectArgs = {
      acr_values: provider,
    };
    await auth.signinRedirect(signinRedirectArgs);
  };

  const handleLogin = async () => {
    // clear the session storage to force the user to re-authenticate
    sessionStorage.removeItem(`oidc.user:${environment.w3cApiUrl}/api/v1/connect:${environment.clientId}`);
    const signinRedirectArgs = {
      acr_values: `${username}:${password}`,
    };
    await auth.signinSilent(signinRedirectArgs);
  };

  return (
    <div className="authFormWrapper">
      <div className="authForm">
        <form>
          <Card className="authFormCard">
            <Card className="authFormCard">
              <CardContent>
                <div className="authLogoPlaceholder">
                  <CardMedia className="authLogo" image={uiSettings.logoUrl} title={uiSettings.pageTitle} component="img" />
                </div>
              </CardContent>
            </Card>
            {uiSettings.useInternalUsers ? (
              <>
              <CardContent style={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  id="outlined-username-input"
                  label="User Name"
                  type="text"
                  disabled={props.isLoading}
                  autoComplete="current-username"
                  onChange={(e) => setUsername(e.target.value)}
                />
                {props.isLoading ? <CircularProgress color="inherit" className="spinner" /> : <></>}
              </CardContent>
              <CardContent>
                <TextField
                  fullWidth
                  id="outlined-password-input"
                  label="Password"
                  type="password"
                  disabled={props.isLoading}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Typography gutterBottom variant="h5" component="div" className="errorText">
                  {props.errorText}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleLogin}
                  title="Login"
                  className="authButton"
                >
                  Login
                </Button>
              </CardActions>
              {(uiSettings.useMicrosoftSso || uiSettings.useGoogleSso)? <Divider>OR</Divider> : <></>}
            </>
            ) : (
              <></>
            )}            
            {uiSettings.useMicrosoftSso ? <Button className="microsoftSsoButton" onClick={() => handleSsoLogin(`microsoft`)} /> : <></>}
            {uiSettings.useGoogleSso ? <Button className="googleSsoButton" onClick={() => handleSsoLogin(`google`)} /> : <></>}
          </Card>
        </form>
      </div>
    </div>
  );
};
