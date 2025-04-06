import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ListItemIcon from '@mui/material/ListItemIcon';
import TuneIcon from '@mui/icons-material/Tune';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemText from '@mui/material/ListItemText';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './left-menu.css';
import { AuthContextProps, useAuth } from 'react-oidc-context';
import { Role } from '../../api/w3c/models/role';
import { selectUiSettings } from '../config/ui-config-slice';
import { useAppSelector } from '../../app/hooks';
import AppsIcon from '@mui/icons-material/Apps';
import React from 'react';
import { Collapse } from '@mui/material';

export const LeftMenu: FC = () => {
  const navigate = useNavigate();
  const uiSettings = useAppSelector(selectUiSettings);
  const auth = useAuth();

  const navigateMenuItem = (path: string) => navigate(`/${path}`);
  const isAdmin = (auth: AuthContextProps) => auth.user?.profile.role === Role.Admin;
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  // Toggle the Settings submenu
  const handleToggle = (label: string) => {
    setOpenSubMenu((prev) => (prev === label ? null : label));
  };

  const menuStructure = [
    {
      label: 'Canvas',
      icon: <AppsIcon />,
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
      icon: <TuneIcon />,
      path: 'settings',
      visible: isAdmin(auth),
      subMenu: [
        {
          label: 'General',
          icon: <SettingsIcon />,
          path: 'settings',
          visible: isAdmin(auth),
        },
        {
          label: 'Agents',
          icon: <GroupWorkIcon />,
          path: 'agentManagement/agents',
          visible: isAdmin(auth),
        }
      ]
    },
  ];

  const renderMenu = () => {
    let visibleMenuItemIndex = 0;
    return menuStructure.map((item, index) => {
      if (!item.visible) return null;
      visibleMenuItemIndex++;
      const menuItemColor = visibleMenuItemIndex % 2 === 0 ? uiSettings.menuBackColor1 : uiSettings.menuBackColor2;
      const isOpen = openSubMenu === item.label;

      if (item.subMenu && item.subMenu.length > 0) {
        return (
          <React.Fragment key={`menu-item-fragment-${item.label}-${index}`}>
            <ListItemButton onClick={() => handleToggle(item.label)} sx={{ bgcolor: menuItemColor }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="nav" disablePadding>
                {item.subMenu.map((subItem, subIndex) => (
                  <ListItemButton
                    key={`submenu-item-${item.label}-${subItem.label}-${subIndex}`}
                    onClick={() => navigateMenuItem(subItem.path)}
                    sx={{ pl: 4, bgcolor: menuItemColor }}
                  >
                    <ListItemIcon>{subItem.icon}</ListItemIcon>
                    <ListItemText primary={subItem.label} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        );
      } else {
        return (
          <ListItemButton
            onClick={() => navigateMenuItem(item.path)}
            key={`menu-item-${item.label}-${index}`}
            sx={{ bgcolor: menuItemColor }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      }
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
