import { FC } from 'react';
import { CurrentPageState } from '../../main-window/current-page-slice';
import { DataGrid, GridColDef, GridToolbar, GridRenderCellParams } from '@mui/x-data-grid';
import { Link, CircularProgress } from '@mui/material';
import { useListEmails } from './hooks';
import { useNavigate } from 'react-router-dom';
import { EmailItem } from '../../../api/w3c/models/email-item';

export const ListEmails: FC = () => {
  const navigate = useNavigate();
  const currentPageState: CurrentPageState = {
    pageName: 'Emails',
    pageCode: 'emails',
    pageUrl: window.location.pathname,
    routePath: 'emails',
  };

  const { emailsListData, emailsListDataLoading } = useListEmails({ currentPageState });

  const columnsData: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 320,
      renderCell: (params: GridRenderCellParams<EmailItem, number>) => (
        <Link
          component="button"
          onClick={() => {
            navigate(`/files/summary?emailItemId=${params.row.email_id}`);
          }}
        >
          {params.row.title}
        </Link>
      ),
    },
    { field: 'from', headerName: 'From', width: 100 },
    { field: 'created', headerName: 'Created At', width: 300 },
  ];

  return (
    <div style={{ height: 'calc(85vh - 32px)', display: 'flow-root' }}>
      <DataGrid
        getRowId={(row: EmailItem) => row.email_id}
        getRowHeight={() => 'auto'}
        sx={{
          '& .MuiDataGrid-cell': {
            whiteSpace: 'normal',
            display: 'grid',
            alignContent: 'left',
            minHeight: 50,
          },
        }}
        rows={emailsListData}
        columns={columnsData}
        loading={emailsListDataLoading}
        slots={{ 
          toolbar: GridToolbar,
          loadingOverlay: () => (<CircularProgress style={{marginLeft: '200px', marginTop: '100px', width: '100px', height: '100px'}} />),
        }}
        isRowSelectable={() => false}
      />
    </div>
  );
};
