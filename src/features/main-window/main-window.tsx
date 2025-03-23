import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { Grid2, Link, Menu, MenuItem } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { FC, MouseEvent, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { LeftMenu } from '../left-menu/left-menu';
import { NoPage } from '../pages/no-page/no-page';
import './main-window.css';
import { selectCurrentPage } from './current-page-slice';
import ErrorDialog from './error-dialog';
import { MyProfile } from '../pages/my-profile/my-profile';
import { Settings } from '../pages/settings/settings';
import { UserManagement } from '../pages/user-management/users/list-view/list-users';
import { AddUser } from '../pages/user-management/users/add-item/add-user';
import { EditUser } from '../pages/user-management/users/edit-item/edit-user';
import { ListSsoClients } from '../pages/user-management/sso-client/list-view/list-sso-clients';
import { AddSsoClient } from '../pages/user-management/sso-client/add-item/add-sso-client';
import { EditSsoClient } from '../pages/user-management/sso-client/edit-item/edit-sso-client';
import { W3CFlow } from '../pages/canvas/canvas';
import { W3CProvider } from '../pages/canvas/W3CContext';
import { ReactFlowProvider } from '@xyflow/react';
import { ToastProvider } from '../pages/canvas/common/ToastProvider';


const drawerWidth = 240;
const drawerMarginLeft = 24;

interface AppBarProps extends MuiAppBarProps {
  leftMenuOpen: boolean;
}

const Main = styled('main')<AppBarProps>(({ theme, leftMenuOpen }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(leftMenuOpen && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth + drawerMarginLeft,
  }),
}));

const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme, leftMenuOpen }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(leftMenuOpen && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth + drawerMarginLeft}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export const MainWindow: FC = () => {
  const auth = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [leftMenuOpen, setLeftMenuOpen] = useState(true);
  const open = Boolean(anchorEl);
  const currentPage = useAppSelector(selectCurrentPage);
  const navigate = useNavigate();

  const handleUserMenuClick = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(anchorEl == null ? event.currentTarget : null);

  const handleUserMenuClose = () => setAnchorEl(null);

  const handleUserMenuItemProfileClick = () => {
    setAnchorEl(null);
    navigate('/myprofile');
  };

  const handleUserMenuItemLogoutClick = () => {
    setAnchorEl(null);
    auth.signoutRedirect();
  };

  return (
    <Box sx={{ height: 'inherit', display: 'flex', position: 'relative' }}>
      <CssBaseline />
      <AppBar position="fixed" leftMenuOpen={leftMenuOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setLeftMenuOpen(true)}
            sx={{ mr: 2, ...(leftMenuOpen && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Grid2 container spacing={1}>
            <Grid2>
              <Typography variant="h5" noWrap component="div">
                {currentPage.pageName}
              </Typography>
            </Grid2>
          </Grid2>
            <Typography variant="h5" noWrap component="div" sx={{ textAlign: 'center', flexGrow: 1 }}>
            Web3 キャンバス by{' '}
            <Link href="https://github.com/inferara" underline="none" color="inherit">
              Inferara
            </Link>
            </Typography>
          <Typography noWrap component="div" sx={{ overflow: 'unset', marginRight: '20px', marginLeft: 'auto' }}>
            {auth.user?.profile.name}
          </Typography>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleUserMenuClick}>
            <PersonIcon />
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleUserMenuClose}
              slotProps={{
                list: {
                  'aria-labelledby': 'basic-button',
                },
              }}
            >
              <MenuItem onClick={handleUserMenuItemProfileClick}>My Profile</MenuItem>
              <MenuItem onClick={handleUserMenuItemLogoutClick}>Logout</MenuItem>
            </Menu>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav" aria-label="drawer container">
        <Drawer
          variant="persistent"
          sx={{
            display: 'block',
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          anchor="left"
          open={leftMenuOpen}
        >
          <IconButton onClick={() => setLeftMenuOpen(false)} sx={{ width: 40, alignSelf: 'center', marginLeft: 'auto' }}>
            <ChevronLeftIcon />
          </IconButton>
          <LeftMenu />
        </Drawer>
      </Box>
      <Main leftMenuOpen={leftMenuOpen} className="mainWindowMain" sx={ currentPage.pageName !== "Canvas" ? { marginTop: '24px' } : {}}>
        {currentPage.pageName !== "Canvas" && <DrawerHeader />}
        <Routes>
          <Route path="/myprofile" element={<MyProfile />} />
          {/* <Route path="/" element={<ListEmails />} /> */}
          <Route path="/" element={<ToastProvider><ReactFlowProvider><W3CProvider><W3CFlow /></W3CProvider></ReactFlowProvider></ToastProvider>} />
          <Route path="/userManagement/users" element={<UserManagement />} />
          <Route path="/userManagement/users/add" element={<AddUser />} />
          <Route path="/userManagement/users/edit" element={<EditUser />} />

          <Route path="/userManagement/ssoClients" element={<ListSsoClients />} />
          <Route path="/userManagement/ssoClient/add" element={<AddSsoClient />} />
          <Route path="/userManagement/ssoClient/edit" element={<EditSsoClient />} />
          
          <Route path="/settings" element={<Settings />} />
          
          <Route path="*" element={<NoPage />} />
        </Routes>
        <ErrorDialog />
      </Main>
    </Box>
  );
};
