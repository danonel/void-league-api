import { Controller, Get } from '@nestjs/common';
import { GetPlayerRecentMatchesDTO } from './dto/get-player-recent-matches.dto';
import { LeagueApiService } from './league-api.service';

@Controller('league-api')
export class LeagueApiController {
  constructor(private readonly leagueApiService: LeagueApiService) {}

  @Get('/player-matches')
  getPlayerRecentMatches({
    limit,
    queueId,
    regionName,
    summonerName,
  }: GetPlayerRecentMatchesDTO) {
    return this.leagueApiService.getPlayerRecentMatches({
      limit,
      queueId,
      regionName,
      summonerName,
    });
  }
}
