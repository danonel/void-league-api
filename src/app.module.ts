import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './league-api/entities/match.entity';
import { LeagueApiModule } from './league-api/league-api.module';

@Module({
  imports: [
    LeagueApiModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [MatchEntity],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
