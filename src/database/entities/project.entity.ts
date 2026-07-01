import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

/**
 * 平台專案表。
 * 依需求僅保留單一 project table 與必要欄位。
 */
@Entity('project')
export class Project {
  @PrimaryGeneratedColumn({ comment: '平台專案流水號 ID' })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '專案名稱',
  })
  name: string;

  @Column({
    name: 'aimaker_user_id',
    type: 'int',
    comment: '此專案所屬 AIMaker user id',
  })
  aimakerUserId: number;

  @Column({
    name: 'aimaker_version_id',
    type: 'int',
    comment: '此專案綁定 AIMaker version id',
  })
  aimakerVersionId: number;

  @Column({
    name: 'class_filename',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'AIMaker 下載後類別 json 檔名',
  })
  classFilename: string | null;

  @Column({
    name: 'step_filename',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'AIMaker 下載後步驟 json 檔名',
  })
  stepFilename: string | null;
}
