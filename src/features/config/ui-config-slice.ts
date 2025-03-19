import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { UiSettings } from '../../api/w3c/models/ui-settings';

export interface UiConfigState {
  uiConfigLoaded: boolean;
  uiSettings: UiSettings;
}

const initialState: UiConfigState = {
  uiConfigLoaded: false,
  uiSettings: {
    favIconUrl: '',
    logoUrl: '',
    allowDebugMode: false,
    mainColor: '',
    mainTextColor: '',
    secondaryTextColor: '',
    contrastTextColor: '',
    menuBackColor1: '',
    menuBackColor2: '',
    backgroundColor: '',
    pageTitle: '',
    useSearchTab: false,
    useMicrosoftSso: false,
    useInternalUsers: false,
  },
};

export const configSlice = createSlice({
  name: 'uiConfigInfo',
  initialState,
  reducers: {
    setUiSettings: (state, action: PayloadAction<UiSettings>) => {
      state.uiSettings = action.payload;
      state.uiConfigLoaded = true;
    },
  },
});

export const { setUiSettings } = configSlice.actions;

export const selectUiSettings = (state: RootState) => state.config.uiSettings;

export default configSlice.reducer;
