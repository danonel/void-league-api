import { Injectable } from '@nestjs/common';
import {
  RiotSummonerResponse,
  RiotGetMatchesIdsByPuuidResponse,
  RiotGetMatchByMatchIdResponse,
} from '../riot-responses-types';
import { AxiosService } from './axios.service';

interface IGetSummoner {
  summonerName: string;
  regionName: string;
}

interface IGetMatchesIdsByPuuid {
  regionName: string;
  limit?: number;
  puuid: string;
}

interface IGetMatchByMatchId {
  matchId: string;
  regionName: string;
}

@Injectable()
export class HttpService {
  constructor(private readonly axiosService: AxiosService) {}
  async getSummoner({ summonerName, regionName }: IGetSummoner) {
    const url = ''; // @TODO: build url with summoner name and region name
    const response = await this.axiosService.get<RiotSummonerResponse>(url);
    return response;
  }

  async getMatchesIdsByPuuid({
    puuid,
    regionName,
    limit,
  }: IGetMatchesIdsByPuuid) {
    const url = ''; // @TODO: build url with puuid, regionName/continent and count if provided

    return await this.axiosService.get<RiotGetMatchesIdsByPuuidResponse>(url);
  }

  async getMatchByMatchId({ matchId, regionName }: IGetMatchByMatchId) {
    const url = ''; // @TODO: build url with matchId and regionName;
    return await this.axiosService.get<RiotGetMatchByMatchIdResponse>(url);
  }
}
