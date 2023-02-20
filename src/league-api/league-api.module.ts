import { Module } from '@nestjs/common';
import { LeagueApiService } from './league-api.service';
import { LeagueApiController } from './league-api.controller';
import { Serialzier } from './serializer';
import { HttpService } from './http.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './entities/match.entity';
import { HttpModule } from '@nestjs/axios';
import { RepositoryNormalizer } from './repository-normalizer';
import { AxiosService } from '../http/axios.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity]), HttpModule],
  controllers: [LeagueApiController],
  providers: [
    LeagueApiService,
    Serialzier,
    HttpService,
    RepositoryNormalizer,
    AxiosService,
  ],
})
export class LeagueApiModule {}
