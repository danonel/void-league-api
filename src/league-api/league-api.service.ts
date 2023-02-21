import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from './http.service';
import { RiotGetMatchByMatchIdResponse } from './riot-responses-types';
import { GetPlayerRecentMatchesDTO } from './dto/get-player-recent-matches.dto';
import { MatchEntity } from './entities/match.entity';
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
}
