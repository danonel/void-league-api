import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from './http.service';
import { GetPlayerRecentMatchesDTO } from './dto';
import { Match, Summoner } from './entities';
import { NormalizedMatch, RepositoryNormalizer } from './repository-normalizer';
import { Serialzier } from './serializer';
import { parseKda, parseRankedStats, removeSummoner } from './utils';

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

  // async getPlayerLeaderboards({
  //   summonerName,
  //   regionName,
  // }: GetPlayerLeaderboardsDTO) {
  //   const rankedMatches = await this.matchRepository.find({
  //     where: {
  //       queueId: 420 || 400,
  //     },
  //   });
  //   /*
  //   const rankedPromises = rankedMatches.map((match) => {
  //     return this.httpService.getLeagueBySummonerId(
  //       match.summonerId,
  //       regionName,
  //     );
  //   });

  //   const result = await Promise.all(rankedPromises);
  //   console.log(result); */

  //   const allPlayersMatches = await this.matchRepository.find({
  //     where: {
  //       regionName,
  //     },
  //   });
  //   const summonerIncluded = allPlayersMatches.find(
  //     (players) => players.summonerName === summonerName,
  //   );
  //   if (!summonerIncluded) {
  //     throw new HttpException(
  //       `Summoner ${summonerName} not found`,
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   if (!allPlayersMatches.length) {
  //     throw new HttpException(`No matches found`, HttpStatus.NOT_FOUND);
  //   }
  //   const playersScores = new Map<string, number[]>();
  //   for (const playerMatch of allPlayersMatches) {
  //     const player = playerMatch.summonerName;
  //     const scores = playersScores.get(player) || [];
  //     const matchIndex = scores.length;
  //     scores[matchIndex] = playerMatch.win ? 1 : 0;
  //     playersScores.set(player, scores);
  //   }

  //   const counts = new Map<string, number>();
  //   for (const [player, scores] of playersScores) {
  //     const winsCount = scores.reduce((count, val) => count + val, 0);
  //     counts.set(player, winsCount);
  //   }
  //   const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  //   const rank = sortedCounts.findIndex(([key]) => key === summonerName);

  //   return {
  //     winRate: `${rank + 1}`,
  //   };
  // }
}
