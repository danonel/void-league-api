import { IsNotEmpty, IsString } from 'class-validator';

export class GetPlayerLeaderboardsDTO {
  @IsNotEmpty()
  @IsString()
  summonerName: string;

  @IsNotEmpty()
  @IsString()
  regionName: string;
}
