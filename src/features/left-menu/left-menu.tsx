import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import './left-menu.css';
import { AuthContextProps, useAuth } from 'react-oidc-context';
import { Role } from '../../api/w3c/models/role';
import { selectUiSettings } from '../config/ui-config-slice';
import { useAppSelector } from '../../app/hooks';


export const LeftMenu: FC = () => {
  const navigate = useNavigate();
  const uiSettings = useAppSelector(selectUiSettings);
  const auth = useAuth();

  const navigateMenuItem = (path: string) => navigate(`/${path}`);
  const isAdmin = (auth: AuthContextProps) => auth.user?.profile.role === Role.Admin;

  const menuStructure = [
    {
      label: 'Emails',
      icon: <FolderIcon />,
      path: '',
      visible: true,
    },
    {
      label: 'Users',
      icon: <PeopleIcon />,
      path: 'userManagement/users',
      visible: isAdmin(auth),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      path: 'settings',
      visible: isAdmin(auth),
    },
  ];

  const renderMenu = () => {
    let visibleMenuItemIndex = 0;
    return menuStructure.map((item, index) => {
      if (!item.visible) return null;
      visibleMenuItemIndex++;
      const menuItemColor = visibleMenuItemIndex % 2 === 0 ? uiSettings.menuBackColor1 : uiSettings.menuBackColor2; 
  
      return (
        <ListItemButton onClick={() => navigateMenuItem(item.path)} key={index} sx={{ bgcolor: menuItemColor }}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      );
    });
  }

  return (
    <>
      <div className="leftMenuTopSection">
        <img src={uiSettings.logoUrl} alt={uiSettings.pageTitle} className="leftMenuLogo" />
      </div>
      <Divider />
      <List disablePadding component="nav">
        {renderMenu()}
      </List>
    </>
  );
};
