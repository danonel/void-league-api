import { NormalizedMatch } from '../repository-normalizer';
import { RiotSummonerLeagueResponse } from '../riot-responses-types/riot-get-league-by-summoner-id-response.type';
export * from './queue-id-to-queue-name';
export * from './ranked-values';

type IKda = {
  k: number;
  d: number;
  a: number;
};

export const parseKda = (normalizedMatches: NormalizedMatch[]) => {
  return normalizedMatches.reduce<IKda>(
    (acc, match) => {
      const [k, d, a] = match.kda.split('/');
      acc['k'] += Number(k);
      acc['d'] += Number(d);
      acc['a'] += Number(a);
      return acc;
    },
    { k: 0, d: 0, a: 0 } as IKda,
  );
};

type IRankedStats = {
  lp: number;
  rank: string;
  tier: string;
};

export const parseRankedStats = (
  summonerLeagueStats: RiotSummonerLeagueResponse[],
) => {
  return summonerLeagueStats.reduce<IRankedStats>((acc, stats) => {
    if (stats.queueType === 'RANKED_SOLO_5x5') {
      return (acc = {
        tier: stats.tier,
        rank: stats.rank,
        lp: stats.leaguePoints,
      });
    }
    return acc;
  }, {} as IRankedStats);
};

export const removeSummonerToMatches = (
  normalizedMatches: NormalizedMatch[],
) => {
  return normalizedMatches.map(({ summoner, ...rest }) => ({
    ...rest,
  }));
};
