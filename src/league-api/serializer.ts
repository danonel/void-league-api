import { Injectable } from '@nestjs/common';
import { NormalizedMatch } from './repository-normalizer';
import { RecentMatchesResponse } from './types/recent-matches-response.type';

@Injectable()
export class Serialzier {
  serializeRecentMatchesResponse(
    normalizedMatches: NormalizedMatch[],
    queueId: number,
  ): RecentMatchesResponse {
    const response = {
      [queueId]: normalizedMatches.map((match) => ({
        assists: match.assists,
        champion: match.champion,
        deaths: match.deaths,
        gameDuration: match.gameDuration,
        gameMode: match.gameMode,
        kills: match.kills,
        matchId: Number(match.matchId),
        totalMinionsKilled: match.totalMinionsKilled,
        win: match.win,
      })),
    };
    return response;
  }
}
