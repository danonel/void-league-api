export type RecentMatchesResponse = {
  [key: number]: SerializedMatchResponse[];
};

interface SerializedMatchResponse {
  kda: string;
  champion: string;
  gameDuration: number;
  gameMode: string;
  matchId: number;
  totalMinionsKilled: number;
  win: boolean;
}
