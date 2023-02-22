import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, Summoner } from './league-api/entities';
import { LeagueApiModule } from './league-api/league-api.module';

@Module({
  imports: [
    LeagueApiModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [Match, Summoner],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
