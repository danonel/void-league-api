export interface RiotGetMatchByMatchIdResponse {
  metadata: Metadata;
  info: Info;
}

interface Info {
  gameDuration: number;
  gameMode: string;
  gameId: string;
  participants: Participant[];
  queueId: number;
}

interface Metadata {
  matchId: string;
  participants: string[];
}

interface Participant {
  visionScore: number;
  summonerName: string;
  puuid: string;
  assists: number;
  deaths: number;
  kills: number;
  win: boolean;
  totalMinionsKilled: number;
  championName: string;
  summonerId: string;
}
