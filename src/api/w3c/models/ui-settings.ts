export interface UiSettings {
  favIconUrl: string;
  logoUrl: string;
  allowDebugMode: boolean;
  mainColor: string;
  mainTextColor: string;
  secondaryTextColor: string;
  contrastTextColor: string;
  menuBackColor1: string;
  menuBackColor2: string;
  backgroundColor: string;
  pageTitle: string;
  useSearchTab: boolean;
  useMicrosoftSso: boolean;
  useInternalUsers: boolean;
}


class DefaultUiSettings{
  editControlSize: string = '800px';
  editAreaStyle: React.CSSProperties = { height: 'calc(-128px + 100vh)', display: 'flow-root', position: 'relative' };
  listAreaStyle: React.CSSProperties = { height: 'calc(85vh - 32px)', display: 'flow-root' };
  allowedFileExtensions = ['png', 'jpg', 'bmp', 'pdf', 'docx', 'xlsx', 'pptx', 'txt', 'md', 'wav', 'md', 'wma', 'webm', 'mp3', 'cs', 'sql', 'js', 'ts', 'html', 'json', 'xml', 'yml', 'yaml', 'py'];
}

export const defaultUiSettings: DefaultUiSettings = new DefaultUiSettings();