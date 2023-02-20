import { Test, TestingModule } from '@nestjs/testing';
import { LeagueApiController } from './league-api.controller';
import { LeagueApiService } from './league-api.service';

describe('LeagueApiController', () => {
  let controller: LeagueApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeagueApiController],
      providers: [LeagueApiService],
    }).compile();

    controller = module.get<LeagueApiController>(LeagueApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
