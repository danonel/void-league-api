export type RecentMatchesResponse = {
  [key: number]: SerializedMatchResponse[];
};

interface SerializedMatchResponse {
  assists: number;
  champion: string;
  deaths: number;
  gameDuration: number;
  gameMode: string;
  kills: number;
  matchId: number;
  totalMinionsKilled: number;
  win: boolean;
}
