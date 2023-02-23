import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Summoner } from './summoner.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  champion: string;

  @Column({ type: 'boolean' })
  win: boolean;

  @Column({ type: 'varchar' })
  gameMode: string;

  @Column({ type: 'int' })
  queueId: number;

  @Column({ type: 'int' })
  gameDuration: number;

  @Column({ type: 'int' })
  totalMinionsKilled: number;

  @Column({ type: 'varchar', unique: true })
  matchId: string;

  @Column({ type: 'varchar' })
  kda: string;

  @Column({ type: 'int' })
  visionScore: number;

  @ManyToOne(() => Summoner, (summoner) => summoner.matches)
  summoner: Summoner;

  @CreateDateColumn()
  createdAt: Date;
}
