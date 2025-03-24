import React, { useState } from 'react';
import { CurrentPageState } from '../../../../main-window/current-page-slice';
import { TextField, Button, Grid, Paper, Select, MenuItem } from '@mui/material';
import { useAddSsoClient } from './hooks';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  ClientSsoItem,
  LoginType,
  ClientSsoSettings,
  ClientSsoSettingItem,
} from '../../../../../api/w3c/models/client-sso';
import { showError } from '../../../../dialog-handler/dialog-handler';
import { defaultUiSettings } from '../../../../../api/w3c/models/ui-settings';

const Item = styled(Paper)(() => ({
  backgroundColor: '#fff',
  padding: '0px',
  textAlign: 'center',
  border: '0px',
  boxShadow: '0px 0px 0px 0px #fff',
}));

export const AddSsoClient: React.FC = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState(LoginType.MicrosoftSSO);
  const [name, setName] = useState('');
  const [clientSsoParameters, setClientSsoParameters] = useState({} as Record<string, string>);

  const currentPageState: CurrentPageState = {
    pageName: 'Add SSO Client',
    pageCode: 'addSsoClient',
    pageUrl: window.location.pathname,
    routePath: 'userManagement/ssoClient/add',
  };

  const { createSsoClient } = useAddSsoClient({ currentPageState });

  const handleCreateClientSso = async () => {
    // check if all required parameters are filled
    const requiredParameters = ClientSsoSettings.find((option) => option.loginType === loginType)?.settings.filter(
      (param) => param.required,
    );
    if (requiredParameters?.some((param) => !clientSsoParameters[param.parameterCode])) {
      showError('Please fill all required parameters.');
      return;
    }

    const newSsoClientItem = {
      name: name,
      settings: clientSsoParameters,
      loginType: loginType,
    } as ClientSsoItem;
    const createSsoClientSuccess = await createSsoClient(newSsoClientItem);
    if (createSsoClientSuccess) {
      navigate('/userManagement/ssoClients');
    } else {
      showError('SSO Client creation failed.');
    }
  };

  const setParameterValue = (parameterCode: string, value: string) => {
    const clientSsoParametersCopy = Object.assign({}, clientSsoParameters);
    clientSsoParametersCopy[parameterCode] = value;
    setClientSsoParameters(clientSsoParametersCopy);
  };

  const renderClientSsoParameter = (param: ClientSsoSettingItem) => {
    return (
      <TextField
        label={param.parameterName}
        sx={{ width: defaultUiSettings.editControlSize }}
        required={param.required}
        value={clientSsoParameters[param.parameterCode]}
        onChange={(e) => setParameterValue(param.parameterCode, e.target.value)}
        type="text"
      />
    );
  };

  return (
    <div style={defaultUiSettings.editAreaStyle}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item>
            <h3>New SSO Client</h3>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Select
              required={true}
              sx={{ width: defaultUiSettings.editControlSize }}
              id="login-type-select"
              value={loginType}
              onChange={(e) => setLoginType(e.target.value as LoginType)}
            >
              <MenuItem value={LoginType.MicrosoftSSO}>Microsoft SSO</MenuItem>
            </Select>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              id="name"
              label="Name"
              value={name}
              required={true}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
          </Item>
        </Grid>
        {ClientSsoSettings.find((option) => option.loginType === loginType)?.settings.map((param, index) => (
          <Grid item xs={12} key={index}>
            <Item>{renderClientSsoParameter(param)}</Item>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Item>
            <Button onClick={handleCreateClientSso}>Create SSO Client</Button>
            <Button onClick={() => history.back()}>Cancel</Button>
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};
