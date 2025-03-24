import React from 'react';
import { CurrentPageState } from '../../../../main-window/current-page-slice';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { Link, Stack, Tooltip, IconButton } from '@mui/material';
import { useListSsoClients } from './hooks';
import { ClientSsoItem } from '../../../../../api/w3c/models/client-sso';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { UserManagementMenu } from '../../user-management-menu/user-management-menu';
import { defaultUiSettings } from '../../../../../api/w3c/models/ui-settings';

export const ListSsoClients: React.FC = () => {
  const navigate = useNavigate();
  const currentPageState: CurrentPageState = {
    pageName: 'SSO Clients',
    pageCode: 'ssoClients',
    pageUrl: window.location.pathname,
    routePath: '/userManagement/ssoClients',
  };

  const { ssoClientsListData, removeSsoClient } = useListSsoClients({ currentPageState });

  const renderParametersColumn = (row: ClientSsoItem) => {
    return (
      <div>
        {Object.entries(row.settings).map(([recKey, recValue], index) => (
          <div key={index} style={{ textAlign: 'left' }}>
            <b>{recKey}:</b> <i>{recValue}</i>
          </div>
        ))}
      </div>
    );
  };

  const columnsData: GridColDef[] = [
    {
      field: 'loginId',
      headerName: 'Actions',
      width: 80,
      renderCell: (params: GridRenderCellParams<ClientSsoItem, number>) => (
        <Stack direction="row" spacing={4} alignItems="flex-end">
          <Tooltip title="Remove SSO Client">
            <IconButton onClick={() => removeSsoClient(params.row.clientSsoId)}>
              <ClearIcon style={{ color: 'red' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 350,
      renderCell: (params: GridRenderCellParams<ClientSsoItem, number>) => (
        <Link
          component="button"
          onClick={() => {
            navigate(`/userManagement/ssoClient/edit?clientSsoId=${params.row.clientSsoId}`);
          }}
        >
          {params.row.name}
        </Link>
      ),
    },
    { field: 'loginType', headerName: 'Login Type', width: 120 },
    {
      field: 'settings',
      headerName: 'Settings',
      width: 350,
      renderCell: (params: GridRenderCellParams<ClientSsoItem, number>) => renderParametersColumn(params.row),
    },
  ];

  return (
    <div style={defaultUiSettings.listAreaStyle}>
      <UserManagementMenu activeItem="ssoClients" />
      <Stack direction="row" spacing={4} alignItems="flex-end">
        <Tooltip title="Add SSO Client">
          <IconButton onClick={() => navigate('/userManagement/ssoClient/add')}>
            <AddIcon style={{ color: 'green' }} />
          </IconButton>
        </Tooltip>
      </Stack>
      <div style={{ height: 'calc(85vh - 64px)' }}>
        <DataGrid
          getRowId={(row: ClientSsoItem) => row.clientSsoId}
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              display: 'grid',
              alignContent: 'left',
              minHeight: 50,
            },
          }}
          rows={ssoClientsListData}
          columns={columnsData}
          slots={{
            toolbar: GridToolbar,
          }}
          isRowSelectable={() => false}
        />
      </div>
    </div>
  );
};
