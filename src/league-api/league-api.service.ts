import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from './http.service';
import { GetPlayerRecentMatchesDTO, GetPlayerLeaderboardsDTO } from './dto';
import { MatchEntity } from './entities';
import { NormalizedMatch, RepositoryNormalizer } from './repository-normalizer';
import { Serialzier } from './serializer';

@Injectable()
export class LeagueApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly repositoryNormalizer: RepositoryNormalizer,
    private readonly serializer: Serialzier,
  ) {}

  @InjectRepository(MatchEntity)
  private readonly matchRepository: Repository<MatchEntity>;

  async getPlayerRecentMatches({
    summonerName,
    limit,
    regionName,
    queueId,
  }: GetPlayerRecentMatchesDTO) {
    const { puuid } = await this.httpService.getSummoner({
      summonerName,
      regionName,
    });
    const matchesIds = await this.httpService.getMatchesIdsByPuuid({
      puuid,
      regionName,
      limit,
      queueId,
    });
    const matchesPromises = matchesIds.map(
      async (matchId) =>
        await this.httpService.getMatchByMatchId({ matchId, regionName }),
    );
    const matches = await Promise.all(matchesPromises);
    const normalizedMatches = [] as NormalizedMatch[];
    for (const match of matches) {
      const normalizedMatch = this.repositoryNormalizer.matchNormalizer(
        match,
        summonerName,
        regionName,
        queueId,
        puuid,
      );
      await this.matchRepository.upsert(normalizedMatch, {
        conflictPaths: { matchId: true },
      });
      normalizedMatches.push(normalizedMatch);
    }
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
    const rankedMatches = await this.matchRepository.find({
      where: {
        queueId: 420 || 400,
      },
    });
    const allPlayersMatches = await this.matchRepository.find({
      where: {
        regionName,
      },
    });
    const summonerIncluded = allPlayersMatches.find(
      (players) => players.summonerName === summonerName,
    );
    if (!summonerIncluded) {
      throw new HttpException(
        `Summoner ${summonerName} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!allPlayersMatches.length) {
      throw new HttpException(`No matches found`, HttpStatus.NOT_FOUND);
    }
    const playersScores = new Map<string, number[]>();
    for (const playerMatch of allPlayersMatches) {
      const player = playerMatch.summonerName;
      const scores = playersScores.get(player) || [];
      const matchIndex = scores.length;
      scores[matchIndex] = playerMatch.win ? 1 : 0;
      playersScores.set(player, scores);
    }

    const counts = new Map<string, number>();
    for (const [player, scores] of playersScores) {
      const winsCount = scores.reduce((count, val) => count + val, 0);
      counts.set(player, winsCount);
    }
    const sortedCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const rank = sortedCounts.findIndex(([key]) => key === summonerName);

    return {
      winRate: `${rank + 1}`,
    };
  }
}
