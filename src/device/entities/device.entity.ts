import User from 'src/modules/user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'


@Entity()
class Device {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column()
  fcm_token: string

  @Index()
  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ select: false })
  updated_at: Date
}

export default Device
