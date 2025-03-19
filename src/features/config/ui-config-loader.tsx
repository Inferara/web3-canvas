import { FC, ReactNode, useEffect } from 'react';
import { setUiSettings } from './ui-config-slice';
import { useAppDispatch } from '../../app/hooks';
import { useIdleTimer } from 'react-idle-timer';
import { useAuth } from 'react-oidc-context';
import { getSettingsUiListCall } from '../../api/w3c/w3c-api';
import { useAppSelector } from '../../app/hooks';

export const UiConfigLoader: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const uiConfigLoaded = useAppSelector((state) => state.config.uiConfigLoaded);
  useEffect(() => {
    void loadConfig();
  }, []);

  const onIdle = async () => {
    await auth.signoutSilent();
  };

  useIdleTimer({
    onIdle,
    timeout: 1800_000,
    throttle: 500,
  });

  const loadConfig = async () => {
    try {
      const settingsUiListResponse = await getSettingsUiListCall();
      dispatch(setUiSettings(settingsUiListResponse));
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  return uiConfigLoaded ? <>{children}</> : <></>;
};
