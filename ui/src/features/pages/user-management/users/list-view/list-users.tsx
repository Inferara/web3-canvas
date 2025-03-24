import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { IconButton, Link, Stack, Switch, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultUiSettings } from '../../../../../api/w3c/models/ui-settings';
import { UserItem } from '../../../../../api/w3c/models/user';
import { CurrentPageState } from '../../../../main-window/current-page-slice';
import { UserManagementMenu } from '../../user-management-menu/user-management-menu';
import { useListUsers } from './hooks';

export const UserManagement: FC = () => {
  const navigate = useNavigate();

  const currentPageState: CurrentPageState = {
    pageName: 'Users',
    pageCode: 'users',
    pageUrl: window.location.pathname,
    routePath: 'userManagement/users',
  };
  const { userListData, userEnabledChange } = useListUsers({ currentPageState });

  const columnsData: GridColDef[] = [
    {
      field: 'isEnabled',
      headerName: 'Enabled',
      width: 80,
      renderCell: (params: GridRenderCellParams<UserItem, number>) => (
        <Switch
          defaultChecked={params.row.isEnabled}
          onChange={(e) => {
            params.row.isEnabled = e.target.checked;
            userEnabledChange(params.row.loginId, e.target.checked);
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      ),
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 250,
      renderCell: (params: GridRenderCellParams<UserItem, number>) => (
        <Link
          style={{ textAlign: 'left', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
          component="button"
          onClick={() => {
            navigate(`/userManagement/users/edit?loginId=${params.row.loginId}`);
          }}
        >
          {params.row.fullName}
        </Link>
      ),
    },
    { field: 'login', headerName: 'Login', width: 250 },
    { field: 'loginType', headerName: 'Login Type', width: 120 },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      renderCell: (params: GridRenderCellParams<UserItem, number>) => (
        <Link
          style={{ textAlign: 'left', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
          href={`mailto:${params.row.email}`}
          target="_top"
          rel="noopener"
        >
          {params.row.email}
        </Link>
      ),
    },
    { field: 'role', headerName: 'Role', width: 80 },
    { field: 'tokensLimit', headerName: 'Daily Tokens Limit', width: 160,
      renderCell: (params: GridRenderCellParams<UserItem, number>) => (<>{params.row.tokensSpent ?? 0}{params.row.tokensLimit > 0 ? ` / ${params.row.tokensLimit}` : ""}</>),
     },
  ];

  return (
    <div style={defaultUiSettings.listAreaStyle}>
      <UserManagementMenu activeItem="users" />
      <Stack direction="row" spacing={4} alignItems="flex-end">
        <Tooltip title="Add User">
          <IconButton onClick={() => navigate('/userManagement/users/add')}>
            <PersonAddIcon style={{ color: 'green' }} />
          </IconButton>
        </Tooltip>
      </Stack>
      <div style={{ height: 'calc(85vh - 64px)' }}>
        <DataGrid
          getRowId={(row: UserItem) => row.loginId}
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              display: 'grid',
              alignContent: 'left',
              minHeight: 50,
            },
          }}
          rows={userListData}
          columns={columnsData}
          slots={{ toolbar: GridToolbar }}
          isRowSelectable={() => false}
        />
      </div>
    </div>
  );
};
