import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { QUEUE_IDS } from '../types/queue-id.type';
import { Match } from './match.entity';
import { Summoner } from './summoner.entity';

@Entity()
export class Summary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  currentRankName: string;

  @Column({ type: 'float', nullable: true })
  leaguePoints: number;

  @Column({ type: 'float', nullable: true })
  wins: number;

  @Column({ type: 'float', nullable: true })
  csPerMinute: number;

  @Column({ type: 'float', nullable: true })
  visionScore: number;

  @ManyToOne(() => Summoner, (summoner) => summoner.summaries)
  summoner: Summoner;

  @Column({ type: 'varchar' })
  queueId: keyof QUEUE_IDS;
}
