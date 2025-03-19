import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { showError } from '../features/dialog-handler/dialog-handler';

class RestApi {
  private baseUrl: string;
  private requestConfig: AxiosRequestConfig;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.requestConfig = {
      headers: {
       'Content-Type': 'application/json',
       'Authorization': authToken,
      },
    };
  }

  public async setContentType(contentType: string) {
    if (this.requestConfig.headers) {
      this.requestConfig.headers['Content-Type'] = contentType;
    }
  }

  public async request(endpoint: string, method: string = 'GET', data: unknown = undefined, ignoreError: boolean = false): Promise<AxiosResponse> {
    const url = `${this.baseUrl}/${endpoint}`;
    const config = { ...this.requestConfig, url: url, method: method };
    if(data) {
      config.data = data;
    }
    const response = await axios
      .request(config)
      .catch((reason: AxiosError) => {
        if (ignoreError) {
          return {} as AxiosResponse<unknown, unknown>;
        }
        showError(`Error: ${reason.message}`);
        throw new Error(`Failed to make RestApi call`);        
      })
    return response;
  }

}

export default RestApi;
