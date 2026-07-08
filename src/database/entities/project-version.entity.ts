import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_version')
export class ProjectVersion {
  @PrimaryGeneratedColumn({ comment: '版本流水號 ID' })
  id!: number;

  @Column({
    name: 'aimaker_version_id',
    type: 'int',
    comment: 'AIMaker 版本 ID',
  })
  aimakerVersionId!: number;

  @Column({
    name: 'class_data',
    type: 'jsonb',
    nullable: true,
    default: () => "'{}'::jsonb",
    comment: '類別 JSON 資料',
  })
  classData!: Record<string, any> | null;

  @Column({
    name: 'step_data',
    type: 'jsonb',
    nullable: true,
    default: () => "'{}'::jsonb",
    comment: '步驟 JSON 資料',
  })
  stepData!: Record<string, any> | null;

  @Column({
    name: 'flow_data',
    type: 'jsonb',
    nullable: true,
    default: () => "'{}'::jsonb",
    comment: '版本流程 JSON',
  })
  flowData!: Record<string, any>;

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

  @ManyToOne(() => Project, (project) => project.versions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'project_id' })
  project!: Project;
}
