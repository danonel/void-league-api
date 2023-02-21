import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class AxiosService {
  async get<T>(url: string, options?: AxiosRequestConfig) {
    const { data } = await axios.get(`https://${url}`, options);
    return data as T;
  }
}
