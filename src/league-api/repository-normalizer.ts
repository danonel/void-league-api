import { Injectable } from '@nestjs/common';
import { RiotGetMatchByMatchIdResponse } from '../riot-responses-types';
import { MatchEntity } from './entities/match.entity';

export type NormalizedMatch = Omit<MatchEntity, 'id' | 'createdAt'>;

@Injectable()
export class RepositoryNormalizer {
  matchNormalizer(
    match: RiotGetMatchByMatchIdResponse,
    puuid: string,
  ): NormalizedMatch {
    return {} as NormalizedMatch;
  }
}
