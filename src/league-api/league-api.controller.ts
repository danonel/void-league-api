import { Body, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { RiotAuthInterceptor } from '../interceptors/riot-auth.interceptor';
import { GetPlayerLeaderboardsDTO } from './dto/get-player-leaderboards.dto';
import { GetPlayerRecentMatchesDTO } from './dto/get-player-recent-matches.dto';
import { LeagueApiService } from './league-api.service';

@Controller('league-api')
export class LeagueApiController {
  constructor(private readonly leagueApiService: LeagueApiService) {}

  @UseInterceptors(RiotAuthInterceptor)
  @Get('/matches')
  getPlayerRecentMatches(
    @Body() { summonerName, regionName }: GetPlayerRecentMatchesDTO,
    @Query() { queueId, limit }: GetPlayerRecentMatchesDTO,
  ) {
    return this.leagueApiService.getPlayerRecentMatches({
      limit,
      queueId,
      regionName,
      summonerName,
    });
  }

  @UseInterceptors(RiotAuthInterceptor)
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
