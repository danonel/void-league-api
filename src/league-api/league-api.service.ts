import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from './http.service';
import { GetPlayerLeaderboardsDTO, GetPlayerRecentMatchesDTO } from './dto';
import { Match, Summoner } from './entities';
import { NormalizedMatch, RepositoryNormalizer } from './repository-normalizer';
import { Serialzier } from './serializer';
import { parseKda, parseRankedStats, removeSummoner } from './utils';
import { rankValues, tierValues } from './utils/ranked-values';

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
    const matchesWithoutSummoner = removeSummoner(normalizedMatches);

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
      leaguePoints: leaguePointsPosition
        ? `TOP #${leaguePointsPosition}`
        : undefined,
      winRatePos: `TOP #${winRatePos}`,
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
}
