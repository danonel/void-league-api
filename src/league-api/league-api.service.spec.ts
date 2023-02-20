import { Test, TestingModule } from '@nestjs/testing';
import { LeagueApiService } from './league-api.service';

describe('LeagueApiService', () => {
  let service: LeagueApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeagueApiService],
    }).compile();

    service = module.get<LeagueApiService>(LeagueApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
