import { Module } from '@nestjs/common';
import { LeagueApiModule } from './league-api/league-api.module';

@Module({
  imports: [LeagueApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
