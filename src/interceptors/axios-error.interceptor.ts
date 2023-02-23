import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import axios from 'axios';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class AxiosErrorInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status || 500;
          const message =
            error.response?.data?.message ||
            error.response?.statusText ||
            'An error occured while fetching data from riot.';
          throw new HttpException({ message }, status);
        }
        return throwError(error);
      }),
    );
  }
}
