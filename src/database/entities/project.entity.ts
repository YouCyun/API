import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectVersion } from './project-version.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn({ comment: '平台專案流水號 ID' })
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '專案名稱',
  })
  name!: string;

  @Column({
    name: 'aimaker_user_id',
    type: 'int',
    comment: '此專案所屬 AIMaker user id',
  })
  aimakerUserId!: number;

  @Column({
    name: 'aimaker_project_id',
    type: 'int',
    unique: true,
    comment: 'AIMaker 專案 ID',
  })
  aimakerProjectId!: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    comment: '建立時間',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    comment: '最後更新時間',
  })
  updatedAt!: Date;

  @OneToMany(() => ProjectVersion, (version) => version.project, {
    cascade: true,
  })
  versions: ProjectVersion[];
}
