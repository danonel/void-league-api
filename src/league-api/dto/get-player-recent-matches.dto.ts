import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetPlayerRecentMatchesDTO {
  @IsNotEmpty()
  @IsString()
  summonerName: string;

  @IsNotEmpty()
  @IsString()
  regionName: string;

  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @IsNotEmpty()
  @IsNumber()
  queueId: number;
}
