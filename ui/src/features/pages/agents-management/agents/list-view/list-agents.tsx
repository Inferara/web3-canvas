import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { IconButton, Link, Stack, Switch, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultUiSettings } from '../../../../../api/w3c/models/ui-settings';
import { AgentItem } from '../../../../../api/w3c/models/agent';
import { CurrentPageState } from '../../../../main-window/current-page-slice';
// import { UserManagementMenu } from '../../user-management-menu/user-management-menu';
import { useListAgents } from './hooks';
import React from 'react';

export const AgentManagement: FC = () => {
  const navigate = useNavigate();

  const currentPageState: CurrentPageState = {
    pageName: 'Agents',
    pageCode: 'agents',
    pageUrl: window.location.pathname,
    routePath: 'agentManagement/agents',
  };
  const { agentListData, agentEnabledChange } = useListAgents({ currentPageState });

  const columnsData: GridColDef[] = [
    {
      field: 'isEnabled',
      headerName: 'Enabled',
      width: 80,
      renderCell: (params: GridRenderCellParams<AgentItem, number>) => (
        <Switch
          defaultChecked={params.row.isEnabled}
          onChange={(e) => {
            params.row.isEnabled = e.target.checked;
            agentEnabledChange(params.row.agentId, e.target.checked);
          }}
          slotProps={{ input: { 'aria-label': 'controlled' } }}
        />
      ),
    },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'type', headerName: 'Type', width: 80 },
    { field: 'llmType', headerName: 'LLM Type', width: 80 },
    { field: 'description', headerName: 'Description', width: 80 },
    { field: 'tags', headerName: 'Tags', width: 160 },
  ];

  return (
    <div style={defaultUiSettings.listAreaStyle}>
      {/* <UserManagementMenu activeItem="users" /> */}
      <Stack direction="row" spacing={4} alignItems="flex-end">
        <Tooltip title="Add Agent">
          <IconButton onClick={() => navigate('/agentManagement/agent/add')}>
            <PersonAddIcon style={{ color: 'green' }} />
          </IconButton>
        </Tooltip>
      </Stack>
      <div style={{ height: 'calc(85vh - 64px)' }}>
        <DataGrid
          getRowId={(row: AgentItem) => row.agentId}
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              display: 'grid',
              alignContent: 'left',
              minHeight: 50,
            },
          }}
          rows={agentListData}
          columns={columnsData}
          slots={{ toolbar: GridToolbar }}
          isRowSelectable={() => false}
        />
      </div>
    </div>
  );
};
