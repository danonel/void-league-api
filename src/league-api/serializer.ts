import { Injectable } from '@nestjs/common';
import { NormalizedMatch } from './repository-normalizer';

@Injectable()
export class Serialzier {
  serializeRecentMatchesResponse(
    normalizedMatches: NormalizedMatch[],
    queueId,
  ) {
    // @TODO: create response filtered by queueId
  }
}
