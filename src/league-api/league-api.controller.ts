import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RiotAuthInterceptor } from '../interceptors/riot-auth.interceptor';
import { GetPlayerLeaderboardsDTO } from './dto/get-player-leaderboards.dto';
import {
  GetPlayerRecentMatchesBody,
  GetPlayerRecentMatchesQuery,
} from './dto/get-player-recent-matches.dto';
import { LeagueApiService } from './league-api.service';

@Controller('league-api')
export class LeagueApiController {
  constructor(private readonly leagueApiService: LeagueApiService) {}

  @UseInterceptors(RiotAuthInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
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

  /* @UseInterceptors(RiotAuthInterceptor)
  @Get('/leaderboards')
  getPlayerLeaderboards(
    @Body() { regionName, summonerName }: GetPlayerLeaderboardsDTO,
  ) {
    return this.leagueApiService.getPlayerLeaderboards({
      regionName,
      summonerName,
    });
  } */
}
