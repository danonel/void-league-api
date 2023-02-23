import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from './http.service';
import {
  GetPlayerLeaderboardsDTO,
  GetPlayerRecentMatchesDTO,
  GetPlayerSummaryDTO,
} from './dto';
import { Match, Summoner, Summary } from './entities';
import { NormalizedMatch, RepositoryNormalizer } from './repository-normalizer';
import { Serialzier } from './serializer';
import {
  parseKda,
  parseRankedStats,
  removeSummonerToMatches,
  getQueueName,
  rankValues,
  tierValues,
} from './utils';
import { GetOrCreateSummoner } from './types/get-or-create-summoner.type';

@Injectable()
export class LeagueApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly repositoryNormalizer: RepositoryNormalizer,
    private readonly serializer: Serialzier,
  ) {}

  @InjectRepository(Match)
  private readonly matchRepository: Repository<Match>;
  @InjectRepository(Summoner)
  private readonly summonerRepository: Repository<Summoner>;
  @InjectRepository(Summary)
  private readonly summaryRepository: Repository<Summary>;

  async getPlayerRecentMatches({
    summonerName,
    limit,
    regionName,
    queueId,
  }: GetPlayerRecentMatchesDTO) {
    const { matchesPromises, summonerId } =
      await this.httpService.getMatchesPromises({
        limit,
        queueId,
        regionName,
        summonerName,
      });
    const summoner = await this.getSummonerOrCreate({
      regionName,
      summonerId,
      summonerName,
      relations: ['matches'],
    });
    const matches = await Promise.all(matchesPromises);
    const normalizedMatches = [] as NormalizedMatch[];
    for (const match of matches) {
      const normalizedMatch = this.repositoryNormalizer.matchNormalizer({
        match,
        summoner,
      });
      await this.matchRepository.upsert(normalizedMatch, {
        conflictPaths: { matchId: true },
      });
      normalizedMatches.push(normalizedMatch);
    }
    const summonerLeagueStats = await this.httpService.getLeagueBySummonerId(
      summonerId,
      regionName,
    );
    const kda = parseKda(normalizedMatches);
    const rankedStats = parseRankedStats(summonerLeagueStats);
    const matchesWithoutSummoner = removeSummonerToMatches(normalizedMatches);

    await this.summonerRepository.save({
      ...summoner,
      kda: `${kda.k}/${kda.d}/${kda.a}`,
      leaguePoints: rankedStats.lp,
      tier: rankedStats.tier,
      rank: rankedStats.rank,
      matches: matchesWithoutSummoner,
    });
    const response = this.serializer.serializeRecentMatchesResponse(
      normalizedMatches,
      queueId,
    );
    return response;
  }

  async getPlayerLeaderboards({
    summonerName,
    regionName,
  }: GetPlayerLeaderboardsDTO) {
    const summoners = await this.summonerRepository.find({
      where: {
        regionName,
      },
      relations: ['matches'],
    });
    const summoner = summoners.find(
      (summoner) => summoner.summonerName === summonerName,
    );
    if (!summoner) {
      throw new NotFoundException(`Summoner ${summonerName} not found`);
    }
    const missingRankedValues =
      !summoner.tier || !summoner.rank || !summoner.leaguePoints;
    const kdaPosition = this.rankByKda(summoners, summonerName);
    let leaguePointsPosition: number | undefined;
    if (!missingRankedValues) {
      const withoutNoRankedSummoners = summoners.filter((summoner) => {
        if (summoner.tier && summoner.rank) {
          return summoner;
        }
      });
      leaguePointsPosition = this.rankByLeaguePoints(
        withoutNoRankedSummoners,
        summonerName,
      );
    }
    const winRatePos = this.rankByWins(summoners, summonerName);
    return {
      kda: `TOP #${kdaPosition}`,
      leaguePoints: leaguePointsPosition && `TOP #${leaguePointsPosition}`,
      winRatePos: `TOP #${winRatePos}`,
    };
  }

  async getPlayerSummary({
    regionName,
    summonerName,
    queueId,
  }: GetPlayerSummaryDTO) {
    const { id: summonerId } = await this.httpService.getSummoner({
      regionName,
      summonerName,
    });
    const summonerStats = await this.httpService.getLeagueBySummonerId(
      summonerId,
      regionName,
    );
    console.log(summonerStats);
    const summoner = await this.getSummonerOrCreate({
      regionName,
      summonerId,
      summonerName,
      relations: ['matches'],
    });
    const queueName = getQueueName(queueId);
    const summonerStatsByQueue = summonerStats.find((stat) => {
      return stat.queueType === queueName;
    });

    if (!summonerStatsByQueue) {
      throw new NotFoundException('Summoner stats not found');
    }
    const leaguePoints = summonerStatsByQueue.leaguePoints;
    const currentRankName = `${summonerStatsByQueue.tier} - ${summonerStatsByQueue.rank}`;

    interface MatchesStats {
      win: number;
      totalVisionScore: number;
      gameDuration: number;
      totalMinionsKilled: number;
    }

    const matchesStats = summoner.matches?.reduce<MatchesStats>(
      (acc, match) => {
        const win = match.win ? 1 : 0;
        const totalVisionScore = match.visionScore;
        const totalMinionsKilled = match.totalMinionsKilled;
        const gameDuration = match.gameDuration;

        acc.win += win;
        acc.totalVisionScore += totalVisionScore;
        acc.totalMinionsKilled += totalMinionsKilled;
        acc.gameDuration += gameDuration;
        return acc;
      },
      {
        win: 0,
        totalVisionScore: 0,
        gameDuration: 0,
        totalMinionsKilled: 0,
      } satisfies MatchesStats,
    );

    const matchesLength = summoner.matches?.length;
    const avarageVisionScore = matchesStats?.totalVisionScore / matchesLength;
    const wins = matchesStats?.win;
    const csPerMinute =
      matchesStats?.totalMinionsKilled / matchesStats?.gameDuration;

    const summary = await this.summaryRepository.save({
      summoner,
      leaguePoints,
      currentRankName,
      queueId,
      visionScore: summoner.matches && avarageVisionScore,
      wins: summoner.matches && wins,
      csPerMinute: summoner.matches && csPerMinute,
    });
    await this.summonerRepository.save({
      ...summoner,
      summary,
    });
    return {
      queueId,
      currentRank: {
        name: currentRankName,
        currentLeaguePoints: leaguePoints,
      },
      matchesStats: summoner.matches && {
        avarageVisionScore,
        csPerMinute: Number(csPerMinute.toFixed(4)),
        wins,
      },
    };
  }

  private rankByWins(summoners: Summoner[], summonerName: string): number {
    interface WinsCount {
      summonerName: string;
      wins: number;
    }
    const winsCount: WinsCount[] = [];
    for (const summoner of summoners) {
      let count = 0;
      for (const match of summoner.matches) {
        if (match.win) {
          count++;
        }
      }
      winsCount.push({ summonerName: summoner.summonerName, wins: count });
    }
    winsCount.sort((a, b) => b.wins - a.wins);
    const winsPosition = winsCount.findIndex(
      (summoner) => summoner.summonerName === summonerName,
    );
    return winsPosition + 1;
  }

  private rankByKda(summoners: Summoner[], summonerName: string): number {
    const summonersWithKda = summoners.map((summoner) => {
      const [kills, deaths, assists] = summoner.kda.split('/');
      const kdaRatio = (Number(kills) + Number(assists)) / Number(deaths);
      return {
        summonerName: summoner.summonerName,
        kdaRatio,
      };
    });
    summonersWithKda.sort((a, b) => b.kdaRatio - a.kdaRatio);
    const kdaPosition = summonersWithKda.findIndex(
      (summoner) => summoner.summonerName === summonerName,
    );
    return kdaPosition + 1;
  }

  private rankByLeaguePoints(
    summoners: Summoner[],
    summonerName: string,
  ): number {
    const sortedSummonerByLeaguePoints = summoners.sort((a, b) => {
      if (a.tier === b.tier) {
        if (a.rank === b.rank) {
          return b.leaguePoints - a.leaguePoints;
        }
        return rankValues[a.rank] - rankValues[b.rank];
      }
      return tierValues[a.tier] - tierValues[b.tier];
    });
    const leaguePointsPosition = sortedSummonerByLeaguePoints.findIndex(
      (summoner) => summoner.summonerName === summonerName,
    );
    return leaguePointsPosition + 1;
  }

  private async getSummonerOrCreate({
    summonerName,
    summonerId,
    regionName,
    relations,
  }: GetOrCreateSummoner) {
    const summonerExists = await this.summonerRepository.exist({
      where: {
        summonerName,
      },
    });
    if (!summonerExists) {
      await this.summonerRepository.save({
        summonerId,
        summonerName,
        regionName,
      });
    }
    const summoner = await this.summonerRepository.findOne({
      where: {
        summonerId,
      },
      relations: relations,
    });

    return summoner;
  }
}
