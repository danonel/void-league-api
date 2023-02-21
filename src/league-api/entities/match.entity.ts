import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  summonerName: string;

  @Column({ type: 'varchar' })
  regionName: string;

  @Column({ type: 'varchar' })
  champion: string;

  @Column({ type: 'boolean' })
  win: boolean;

  @Column({ type: 'int' })
  kills: number;

  @Column({ type: 'int' })
  assists: number;

  @Column({ type: 'int' })
  deaths: number;

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

  @CreateDateColumn()
  createdAt: Date;
}
