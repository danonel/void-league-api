import { Injectable } from '@nestjs/common';
import { RiotGetMatchByMatchIdResponse } from './riot-responses-types';
import { MatchEntity } from './entities/match.entity';

export type NormalizedMatch = Omit<MatchEntity, 'id' | 'createdAt'> & {
  queueId: number;
};

@Injectable()
export class RepositoryNormalizer {
  matchNormalizer(
    match: RiotGetMatchByMatchIdResponse,
    summonerName: string,
    regionName: string,
    queueId: number,
    puuid: string,
  ): NormalizedMatch {
    const currentSummoner = match.info.participants.find(
      (participant) => participant.puuid === puuid,
    );

    return {
      assists: currentSummoner.assists,
      champion: currentSummoner.championName,
      deaths: currentSummoner.deaths,
      gameDuration: match.info.gameDuration,
      gameMode: match.info.gameMode,
      kills: currentSummoner.kills,
      matchId: match.info.gameId,
      regionName,
      summonerName,
      totalMinionsKilled: currentSummoner.totalMinionsKilled,
      win: currentSummoner.win,
      queueId,
    } satisfies NormalizedMatch;
  }
}
