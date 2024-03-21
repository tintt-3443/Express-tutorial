import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class Common {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
