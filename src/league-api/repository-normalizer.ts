import { Injectable } from '@nestjs/common';
import { Match, Summoner } from './entities';
import { RiotGetMatchByMatchIdResponse } from './riot-responses-types';

export type NormalizedMatch = Omit<Match, 'id' | 'createdAt'> & {
  queueId: number;
};

interface IMatchNormalizer {
  match: RiotGetMatchByMatchIdResponse;
  summoner: Summoner;
}
@Injectable()
export class RepositoryNormalizer {
  matchNormalizer({ match, summoner }: IMatchNormalizer): NormalizedMatch {
    const currentSummoner = match.info.participants.find(
      (participant) => participant.summonerId === summoner.summonerId,
    );
    return {
      kda: `${currentSummoner.kills}/${currentSummoner.deaths}/${currentSummoner.assists}`,
      champion: currentSummoner.championName,
      gameDuration: match.info.gameDuration,
      gameMode: match.info.gameMode,
      matchId: match.info.gameId,
      queueId: match.info.queueId,
      summoner,
      totalMinionsKilled: currentSummoner.totalMinionsKilled,
      win: currentSummoner.win,
    } satisfies NormalizedMatch;
  }
}
