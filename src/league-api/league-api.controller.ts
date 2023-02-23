import {
  Body,
  CacheInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RiotAuthInterceptor } from '../interceptors/riot-auth.interceptor';
import { GetPlayerLeaderboardsDTO } from './dto';

import {
  GetPlayerRecentMatchesBody,
  GetPlayerRecentMatchesQuery,
} from './dto/get-player-recent-matches.dto';
import {
  GetPlayerLeaderboardsQuery,
  GetPlayerSummaryBody,
} from './dto/get-player-summary.dto';
import { LeagueApiService } from './league-api.service';

@UseInterceptors(CacheInterceptor)
@UseInterceptors(RiotAuthInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('league-api')
export class LeagueApiController {
  constructor(private readonly leagueApiService: LeagueApiService) {}

  @Get('/matches')
  getPlayerRecentMatches(
    @Body() { summonerName, regionName }: GetPlayerRecentMatchesBody,
    @Query() { queueId, limit }: GetPlayerRecentMatchesQuery,
  ) {
    return this.leagueApiService.getPlayerRecentMatches({
      limit,
      queueId,
      regionName,
      summonerName,
    });
  }

  @Get('/summary')
  getPlayerSummary(
    @Body() { regionName, summonerName }: GetPlayerSummaryBody,
    @Query() { queueId }: GetPlayerLeaderboardsQuery,
  ) {
    return this.leagueApiService.getPlayerSummary({
      regionName,
      summonerName,
      queueId,
    });
  }
  @Get('/leaderboards')
  getPlayerLeaderboards(
    @Body() { regionName, summonerName }: GetPlayerLeaderboardsDTO,
  ) {
    return this.leagueApiService.getPlayerLeaderboards({
      regionName,
      summonerName,
    });
  }
}
