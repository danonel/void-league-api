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
        kda: match.kda,
        champion: match.champion,
        gameDuration: match.gameDuration,
        gameMode: match.gameMode,
        matchId: Number(match.matchId),
        totalMinionsKilled: match.totalMinionsKilled,
        win: match.win,
      })),
    };
    return response;
  }
}
