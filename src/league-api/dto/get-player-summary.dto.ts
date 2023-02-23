import { IsNotEmpty, IsString } from 'class-validator';
import { QUEUE_IDS } from '../types/queue-id.type';

export class GetPlayerSummaryBody {
  @IsString()
  @IsNotEmpty()
  summonerName: string;

  @IsString()
  @IsNotEmpty()
  regionName: string;
}

export class GetPlayerLeaderboardsQuery {
  @IsString()
  queueId?: keyof QUEUE_IDS;
}

export interface GetPlayerSummaryDTO
  extends GetPlayerSummaryBody,
    GetPlayerLeaderboardsQuery {}
