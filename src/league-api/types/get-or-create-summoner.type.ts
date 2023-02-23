export interface GetOrCreateSummoner {
  regionName: string;
  summonerId: string;
  summonerName: string;
  relations: ['matches'] | ['summaries'] | ['matches', 'summaries'] | undefined;
}
