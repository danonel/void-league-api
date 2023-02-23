import { CacheModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AxiosErrorInterceptor } from './interceptors/axios-error.interceptor';
import { Match, Summoner, Summary } from './league-api/entities';
import { LeagueApiModule } from './league-api/league-api.module';

@Module({
  imports: [
    LeagueApiModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [Match, Summoner, Summary],
      synchronize: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: Number(process.env.CACHE_TTL) || 60 * 5, // by default 5 minutes
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AxiosErrorInterceptor,
    },
  ],
})
export class AppModule {}
