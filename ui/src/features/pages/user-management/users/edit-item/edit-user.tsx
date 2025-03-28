import { Button, Grid, MenuItem, Paper, Select, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../../../../api/w3c/models/role';
import { defaultUiSettings } from '../../../../../api/w3c/models/ui-settings';
import { EditUserItem } from '../../../../../api/w3c/models/user';
import { showError } from '../../../../dialog-handler/dialog-handler';
import { CurrentPageState } from '../../../../main-window/current-page-slice';
import { useEditUser } from './hooks';

const Item = styled(Paper)(() => ({
  backgroundColor: '#fff',
  padding: '0px',
  textAlign: 'center',
  border: '0px',
  boxShadow: '0px 0px 0px 0px #fff',
}));

export const EditUser: FC = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [tokensLimit, setTokensLimit] = useState(0);

  const currentPageState: CurrentPageState = {
    pageName: 'Edit User',
    pageCode: 'editUser',
    pageUrl: window.location.pathname,
    routePath: 'userManagement/users/edit',
  };
  const { editUser, user, loginId } = useEditUser({ currentPageState });

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setLogin(user?.login ?? '');
    setEmail(user?.email ?? '');
    setRole(user?.role ?? '');
    setTokensLimit(user?.tokensLimit ?? 0);
  }, [user]);

  const handleEditUser = async () => {
    if (email === '' || fullName === '' || role === '') {
      showError('All fields are required.');
      return;
    }

    const editUserItem = {
      fullName: fullName,
      email: email,
      role: role,
      isEnabled: true,
      tokensLimit: tokensLimit,
    } as EditUserItem;
    const editUserSuccess = await editUser(loginId, editUserItem);

    if (editUserSuccess) {
      navigate('/userManagement/users');
    } else {
      showError('User updating failed.');
    }
  };

  return (
    <div style={defaultUiSettings.editAreaStyle}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item>
            <h3>Edit User</h3>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              required={false}
              id="login"
              label="Login"
              disabled={true}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              type="text"
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              required={true}
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              required={true}
              id="full-name"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Select
              sx={{ width: defaultUiSettings.editControlSize }}
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as string)}
            >
              <MenuItem value={Role.Admin}>Admin</MenuItem>
              <MenuItem value={Role.User}>User</MenuItem>
            </Select>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              required={false}
              id="token-limit"
              label="Tokens Daily Limit"
              autoComplete="token-limit"
              value={tokensLimit}
              onChange={(e) => setTokensLimit(Number(e.target.value))}
              type="number"
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Button onClick={handleEditUser}>Save</Button>
            <Button onClick={() => history.back()}>Cancel</Button>
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};
