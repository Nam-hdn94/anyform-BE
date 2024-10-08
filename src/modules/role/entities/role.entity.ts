import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import User from '../../user/entities/user.entity'

@Entity()
class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column({ default: '' })
  description: string

  @Column({ default: true })
  is_active: boolean

  @Column({ default: true })
  deleteable: boolean

  // @OneToMany(() => Permission, (permission) => permission.role)
  // permissions: Permission[]

  @ManyToMany(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
  users: User[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ select: false })
  updated_at: Date
}

export default Role
