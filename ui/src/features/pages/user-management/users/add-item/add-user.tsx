import { Button, Grid, MenuItem, Paper, Select, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../../../../api/w3c/models/role';
import { defaultUiSettings } from '../../../../../api/w3c/models/ui-settings';
import { CreateUserItem } from '../../../../../api/w3c/models/user';
import { showError } from '../../../../dialog-handler/dialog-handler';
import { CurrentPageState } from '../../../../main-window/current-page-slice';
import { useAddUser } from './hooks';

const Item = styled(Paper)(() => ({
  backgroundColor: '#fff',
  padding: '0px',
  textAlign: 'center',
  border: '0px',
  boxShadow: '0px 0px 0px 0px #fff',
}));

export const AddUser: FC = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(Role.User as string);
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [tokensLimit, setTokensLimit] = useState(0);

  const currentPageState: CurrentPageState = {
    pageName: 'Add User',
    pageCode: 'addUser',
    pageUrl: window.location.pathname,
    routePath: 'userManagement/users/add',
  };
  const { createUser } = useAddUser({ currentPageState });

  const handleCreateUser = async () => {
    if (password1 !== password2) {
      showError('Passwords do not match.');
      return;
    }
    if (login === '' || email === '' || fullName === '' || role === '' || password1 === '') {
      showError('All fields are required.');
      return;
    }
    const createUserItem = {
      login: login,
      email: email,
      fullName: fullName,
      role: role,
      password: password1,
      isEnabled: true,
      tokensLimit: tokensLimit,
    } as CreateUserItem;
    const createUserSuccess = await createUser(createUserItem);
    if (createUserSuccess) {
      navigate('/userManagement/users');
    } else {
      showError('User creation failed. Probably user already exists.');
    }
  };

  return (
    <div style={defaultUiSettings.editAreaStyle}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item>
            <h3>New User</h3>
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              required={true}
              id="login"
              label="Login"
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
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              required={true}
              id="password-1"
              label="Password"
              autoComplete="new-password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              type="password"
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <TextField
              sx={{ width: defaultUiSettings.editControlSize }}
              required={true}
              id="password-2"
              label="Repeat Password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              type="password"
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Button onClick={handleCreateUser}>Create User</Button>
            <Button onClick={() => history.back()}>Cancel</Button>
          </Item>
        </Grid>
      </Grid>
    </div>
  );
};
