import { store } from '../../app/store';
import { setCurrentError, ErrorType } from '../main-window/current-error-slice';

export const showError = async (errorText: string) => {
    store.dispatch(setCurrentError({
        errorText: errorText,
        errorType: ErrorType.Error,
        isClosed: false,
    }));
};

export const showWarning = async (warningText: string) => {
    store.dispatch(setCurrentError({
        errorText: warningText,
        errorType: ErrorType.Warning,
        isClosed: false,
    }));
};