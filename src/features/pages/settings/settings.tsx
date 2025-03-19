import React from 'react';
import { CurrentPageState } from '../../main-window/current-page-slice';
import { 
  TextField, 
  Button, 
  Grid, Paper, 
  ToggleButton, 
  ToggleButtonGroup, 
  IconButton, 
  FormControl, 
  InputLabel, 
  OutlinedInput,
  InputAdornment,
  Box, 
  Tooltip} from '@mui/material'
import { useSettings } from './hooks';
import { styled } from '@mui/material/styles';
import { SettingsItem, DateType } from '../../../api/w3c/models/settings';
import { showWarning } from '../../dialog-handler/dialog-handler';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { MuiColorInput } from 'mui-color-input'

const Item = styled(Paper)(() => ({
  backgroundColor: '#fff',
  padding: '0px',
  textAlign: 'center',
  border: '0px',
  boxShadow: '0px 0px 0px 0px #fff',
}));

export const Settings: React.FC = () => {
  const currentPageState: CurrentPageState = {
    pageName: 'Settings',
    pageCode: 'settings',
    pageUrl:  window.location.pathname,
    routePath: 'settings',
  }

  const {
    saveSettings,
    settingsListData,
    setSettingsListData,
    reboot,
  } = useSettings({ currentPageState });

  const handleSave = async () => {
    await saveSettings(settingsListData);
    showWarning('Settings changes saved. It may take about 10 seconds to apply the changes. Page refresh is required. Some changes may require a reboot to take effect.');
  }

  const handleReboot = async () => {
    reboot();
    showWarning('Reboot started. Please wait for the system to restart');
  }

  const setSettingValue = (setting: SettingsItem, value: string) => {
    const settings = settingsListData.slice();
    settings.forEach((s) => {
      if (s.settingId === setting.settingId) {
        s.value = value;
      }
    });
    setSettingsListData(settings);
  }

  const setSettingState = (setting: SettingsItem, state: string) => {
    const settings = settingsListData.slice();
    settings.forEach((s) => {
      if (s.settingId === setting.settingId) {
        s.state = state;
      }
    });
    setSettingsListData(settings);
  }

  const renderSetting = (setting: SettingsItem) => {
    switch (setting.dateType) {
      case DateType.Boolean:
        return <ToggleButtonGroup
            sx={{ width: '600px', height: '56px'}}
            color="primary"
            value={setting.value}
            exclusive
            aria-label="Platform"
          >
            <ToggleButton value="color" aria-label="color" disabled sx={{width: '100%'}}>
              <div>{setting.description}</div>
            </ToggleButton>
            <ToggleButton sx={{width: '100px'}} value="True" onChange={() => setSettingValue(setting, "True")}>Yes</ToggleButton>
            <ToggleButton sx={{width: '100px'}} value="False" onChange={() => setSettingValue(setting, "False")}>No</ToggleButton>

          </ToggleButtonGroup>
      case DateType.Password:
        return <FormControl sx={{ width: '600px', height: '56px'}} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">{setting.description}</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              value={setting.value}
              onChange={(e) => setSettingValue(setting, e.target.value)}
              type={setting.state === "text" ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setSettingState(setting, setting.state === "text" ? "password" : "text")}
                    onMouseDown={() => setSettingState(setting, setting.state === "text" ? "password" : "text")}
                    edge="end"
                  >
                    {setting.state === "text" ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label={setting.description}
            />
          </FormControl>
      case DateType.Color:
        return <MuiColorInput 
          sx={{ width: '600px' }}
          format='hex'
          label={setting.description}
          value={setting.value} 
          onChange={(e) => setSettingValue(setting, e)} 
          />
      case DateType.Double:
        return <TextField 
          sx={{ width: '600px' }}
          label={setting.description} 
          value={setting.value}
          onChange={(e) => setSettingValue(setting, e.target.value)}
          type="number"
          >
        </TextField>
      case DateType.Int:
        return <TextField 
          sx={{ width: '600px' }}
          label={setting.description} 
          value={setting.value}
          type="number"
          onChange={(e) => 
            {
              // Only allow numbers
              if(/^\d+$/.test(e.target.value)){
                setSettingValue(setting, e.target.value);              
              }
            }
          }
          >
        </TextField>
      case DateType.Url:
        return <FormControl sx={{ width: '600px', height: '56px'}} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-url">{setting.description}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-url"
            value={setting.value}
            onChange={(e) => setSettingValue(setting, e.target.value)}
            type="text"
            endAdornment={
              <InputAdornment position="start">
                <Box
                  component="img"
                  sx={{
                    height: 40,
                    width: 40,
                  }}
                  src={setting.value}
                />
              </InputAdornment>
            }
            label={setting.description}
          />
        </FormControl>
      case DateType.Link:
        return setting.value 
          ? <a style={{ width: '600px' }} href={setting.value} target="_blank" rel="noreferrer">{setting.description}</a>
          : <></>
      default:
        return <TextField 
          sx={{ width: '600px' }}
          label={setting.description} 
          value={setting.value}
          onChange={(e) => setSettingValue(setting, e.target.value)}
          type="text"
          >
        </TextField>
    }
  }

  const categories = Array.from(new Set(settingsListData.map((setting) => setting.category)))
  return (
    <div style={{ width: '1200px', display: 'flow-root'}}>
      <Grid container spacing={2}>
        {
          categories.map((category, index) => (
            <React.Fragment key={"c-"+index}>
              <Grid item xs={12} >
                <Item>
                  <h3>{category}</h3>
                </Item>
              </Grid>
              {
                settingsListData.filter((setting) => setting.category === category).map((setting, index) => (
                  <Grid item xs={6} key={"s-"+index}>
                    <Item>
                      <Tooltip title={setting.tooltip} placement="top">
                        {
                          renderSetting(setting)
                        }
                      </Tooltip>
                    </Item>
                  </Grid>
                ))
              }
            </React.Fragment>
          ))
        }
        <Grid item xs={12}>
          <Item>
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={handleReboot}>Reboot</Button>
            <Button onClick={() => history.back()}>Cancel</Button>
          </Item>
        </Grid>
      </Grid>      
    </div>
  );
}