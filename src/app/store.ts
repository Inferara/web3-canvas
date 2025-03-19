import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import sessionInfoReducer from '../features/authentication/session-info-slice';
import uiConfigReducer from '../features/config/ui-config-slice';
import currentPageReducer from '../features/main-window/current-page-slice';
import currentErrorReducer from '../features/main-window/current-error-slice';

export const store = configureStore({
    reducer: {
        sessionInfo: sessionInfoReducer,
        config: uiConfigReducer,
        currentPage: currentPageReducer,
        currentError: currentErrorReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
