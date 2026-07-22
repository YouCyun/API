import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_mapping')
export class UserMapping {
  @PrimaryGeneratedColumn({ comment: '平台使用者流水號 ID' })
  userId!: number;

  @Column({
    name: 'aimaker_user_id',
    type: 'int',
    unique: true,
    comment: 'AIMaker 使用者 ID',
  })
  aimakerUserId!: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'AIMaker 使用者帳號 / Email',
  })
  username!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    comment: '建立時間',
  })
  createdAt!: Date;
}
