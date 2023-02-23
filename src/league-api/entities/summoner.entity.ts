import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Match } from './match.entity';
import { Summary } from './summary.entity';

@Entity()
export class Summoner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  summonerName: string;

  @Column({ type: 'varchar' })
  regionName: string;

  @Column({ type: 'varchar' })
  summonerId: string;

  @Column({ type: 'varchar', nullable: true })
  kda: string;

  @Column({ type: 'int', nullable: true })
  leaguePoints: number;

  @Column({ type: 'varchar', nullable: true })
  rank: string;

  @Column({ type: 'varchar', nullable: true })
  tier: string;

  @OneToMany(() => Match, (match) => match.summoner, { nullable: true })
  matches?: Match[];

  @OneToMany(() => Summary, (summary) => summary.summoner, { nullable: true })
  summaries?: Summary[];

  @CreateDateColumn()
  createdAt: Date;
}
