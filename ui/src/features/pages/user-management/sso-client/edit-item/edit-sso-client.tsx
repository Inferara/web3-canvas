import React, { useState, useEffect } from 'react';
import { CurrentPageState } from '../../../../main-window/current-page-slice';
import { TextField, Button, Grid, Paper, Select, MenuItem } from '@mui/material';
import { useEditSsoClient } from './hooks';
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

export const EditSsoClient: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [clientSsoParameters, setClientSsoParameters] = useState<Record<string, string>>({});
  const [loginType, setLoginType] = useState(LoginType.MicrosoftSSO);

  const currentPageState: CurrentPageState = {
    pageName: 'Edit SSO Client',
    pageCode: 'editSsoClient',
    pageUrl: window.location.pathname,
    routePath: '/userManagement/ssoClient/edit',
  };

  const { editSsoClient, ssoClient } = useEditSsoClient({ currentPageState });

  useEffect(() => {
    setName(ssoClient?.name ?? '');
    setClientSsoParameters(ssoClient?.settings ?? ({} as Record<string, string>));
    setLoginType(ssoClient?.loginType ?? LoginType.MicrosoftSSO);
  }, [ssoClient]);

  const handleCreateClientSso = async () => {
    // check if all required parameters are filled
    const requiredParameters = ClientSsoSettings.find((option) => option.loginType === loginType)?.settings.filter(
      (param) => param.required,
    );
    if (requiredParameters?.some((param) => !clientSsoParameters[param.parameterCode])) {
      showError('Please fill all required parameters.');
      return;
    }

    const editedSsoClientItem = {
      ...ssoClient,
      name: name,
      settings: clientSsoParameters,
    } as ClientSsoItem;

    const editSsoClientSuccess = await editSsoClient(editedSsoClientItem);

    if (editSsoClientSuccess) {
      navigate('/userManagement/ssoClients');
    } else {
      showError('Edit SSO Client failed.');
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
        id={param.parameterCode}
        sx={{ width: defaultUiSettings.editControlSize }}
        required={param.required}
        value={clientSsoParameters[param.parameterCode] ?? ''}
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
            <h3>Edit SSO Client</h3>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Select required={true} sx={{ width: defaultUiSettings.editControlSize }} id="login-type-select" value={loginType} disabled={true}>
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
              onChange={(e) => setName(e.target.value)}
              type="text"
            ></TextField>
          </Item>
        </Grid>
        {ClientSsoSettings.find((option) => option.loginType === loginType)?.settings.map((param, index) => (
          <Grid item xs={12} key={index}>
            <Item>{renderClientSsoParameter(param)}</Item>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Item>
            <Button onClick={handleCreateClientSso}>Save</Button>
            <Button onClick={() => history.back()}>Cancel</Button>
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};
