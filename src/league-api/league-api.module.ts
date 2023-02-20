import { Module } from '@nestjs/common';
import { LeagueApiService } from './league-api.service';
import { LeagueApiController } from './league-api.controller';
import { Serialzier } from './serializer';
import { HttpService } from '../http/http.service';

@Module({
  controllers: [LeagueApiController],
  providers: [LeagueApiService, Serialzier, HttpService],
})
export class LeagueApiModule {}
