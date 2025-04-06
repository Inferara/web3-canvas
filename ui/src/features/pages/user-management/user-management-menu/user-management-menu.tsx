import { Button } from '@mui/material';
import React from 'react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { text: 'Users', action: 'users', route: 'userManagement/users' },
  { text: 'SSO Clients', action: 'ssoClients', route: 'userManagement/ssoClients' },
];

export const UserManagementMenu: FC<{ activeItem: string }> = ({ activeItem }) => {
  const navigate = useNavigate();
  return menuItems
    .map((menuItem, index) => (
      <Button
        key={index}
        onClick={() => navigate(`/${menuItem.route}`)}
        sx={{ fontWeight: activeItem === menuItem.action ? 'bold' : 'normal' }}
      >
        {menuItem.text}
      </Button>
    ));
};
