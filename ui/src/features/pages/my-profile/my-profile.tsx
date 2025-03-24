import { CurrentPageState } from '../../main-window/current-page-slice';
import { Grid, Paper  } from '@mui/material'
import { useMyProfile } from './hooks';
import { useAuth } from "react-oidc-context";
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(() => ({
  backgroundColor: '#fff',
  padding: '0px',
  textAlign: 'center',
  border: '0px',
  boxShadow: '0px 0px 0px 0px #fff',
}));

export const MyProfile: React.FC = () => {
  const auth = useAuth();
  const currentPageState: CurrentPageState = {
    pageName: 'My Profile',
    pageCode: 'myprofile',
    pageUrl:  window.location.pathname,
    routePath: 'myprofile',
  }

  useMyProfile({ currentPageState });

  return (
    <div style={{ height: '90vh', width: '600px', display: 'flow-root'}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item>
            <h3>Profile</h3>
          </Item>
        </Grid>
        <Grid item xs={4}>
          <Item><b>Username</b></Item>
        </Grid>
        <Grid item xs={8}>
          <Item>{auth.user?.profile.sub}</Item>
        </Grid>
        <Grid item xs={4}>
          <Item><b>Full Name</b></Item>
        </Grid>
        <Grid item xs={8}>
          <Item>{auth.user?.profile.name}</Item>
        </Grid>
        <Grid item xs={4}>
          <Item><b>Role</b></Item>
        </Grid>
        <Grid item xs={8}>
          <Item>{auth.user?.profile.role as React.ReactNode}</Item>
        </Grid>
        <Grid item xs={4}>
          <Item><b>Login Type</b></Item>
        </Grid>
        <Grid item xs={8}>
          <Item>{auth.user?.profile.loginType as React.ReactNode}</Item>
        </Grid>          
      </Grid>      
    </div>
  );
}