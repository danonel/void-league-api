import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetPlayerRecentMatchesDTO {
  summonerName: string;

  regionName: string;

  limit: number;

  queueId: number;
}

export class GetPlayerRecentMatchesQuery {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  limit: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  queueId: number;
}

export class GetPlayerRecentMatchesBody {
  @IsNotEmpty()
  @IsString()
  summonerName: string;

  @IsNotEmpty()
  @IsString()
  regionName: string;
}
