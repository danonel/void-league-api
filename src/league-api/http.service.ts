import { Injectable } from '@nestjs/common';
import {
  RiotSummonerResponse,
  RiotGetMatchesIdsByPuuidResponse,
  RiotGetMatchByMatchIdResponse,
} from './riot-responses-types';
import { AxiosService } from '../http/axios.service';
import { RiotSummonerLeagueResponse } from './riot-responses-types/riot-get-league-by-summoner-id-response.type';

interface IGetSummoner {
  summonerName: string;
  regionName: string;
}

interface IGetMatchesIdsByPuuid {
  regionName: string;
  limit?: number;
  puuid: string;
  queueId: number;
}

interface IGetMatchByMatchId {
  matchId: string;
  regionName: string;
}

@Injectable()
export class HttpService {
  constructor(private readonly axiosService: AxiosService) {}
  private readonly baseUrl = process.env.RIOT_BASE_URL;

  async getMatchesPromises({ summonerName, regionName, limit, queueId }) {
    const { puuid, id } = await this.getSummoner({
      summonerName,
      regionName,
    });
    const matchesIds = await this.getMatchesIdsByPuuid({
      puuid,
      regionName,
      limit,
      queueId,
    });
    const matchesPromises = matchesIds.map(
      async (matchId) => await this.getMatchByMatchId({ matchId, regionName }),
    );

    return { matchesPromises, summonerId: id };
  }

  async getSummoner({ summonerName, regionName }: IGetSummoner) {
    const url = `${regionName}.${this.baseUrl}/lol/summoner/v4/summoners/by-name/${summonerName}`;
    const response = await this.axiosService.get<RiotSummonerResponse>(url);
    return response;
  }

  async getMatchesIdsByPuuid({
    puuid,
    regionName,
    limit,
    queueId,
  }: IGetMatchesIdsByPuuid) {
    const continent = this.regionToContinent(regionName);
    const count = limit || 20;
    const url = `${continent}.${this.baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}&queue=${queueId}`;

    return await this.axiosService.get<RiotGetMatchesIdsByPuuidResponse>(url);
  }

  async getMatchByMatchId({ matchId, regionName }: IGetMatchByMatchId) {
    const continent = this.regionToContinent(regionName);
    const url = `${continent}.${this.baseUrl}/lol/match/v5/matches/${matchId}`;
    const response = await this.axiosService.get<RiotGetMatchByMatchIdResponse>(
      url,
    );
    return response;
  }

  async getLeagueBySummonerId(summonerId: string, regionName: string) {
    const url = `${regionName}.${this.baseUrl}/lol/league/v4/entries/by-summoner/${summonerId}`;
    return await this.axiosService.get<RiotSummonerLeagueResponse[]>(url);
  }

  private regionToContinent(regionName: string): string {
    const continentRegions = {
      AMERICAS: ['BR1', 'LA1', 'LA2', 'NA1'],
      EUROPE: ['EUN1, EUW1', 'RU'],
      SEA: ['OC1'],
      ASIA: ['TH1', 'TH2', 'TW2', 'VN2', 'KR1', 'JP1', 'PH2', 'SG2'],
    };

    for (const continent in continentRegions) {
      if (continentRegions[continent].includes(regionName)) {
        return continent;
      }
    }
  }
}
