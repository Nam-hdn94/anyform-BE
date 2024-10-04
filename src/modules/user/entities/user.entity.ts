import Device from 'src/device/entities/device.entity';
import Role from 'src/modules/role/entities/role.entity';
import{
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
    ManyToMany,
    OneToOne,
    JoinColumn,
    JoinTable,
} from 'typeorm'

@Entity()
class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: ''})
    name: string;

    @Column({ unique: true })
    @Index()
    email: string;

    @Column({default: '', select: false})
    password: string;

    @Column({default: ''})
    department: String;

    @Column({default: ''})
    location: String;

    @Column({ default: '' })
    search_name: string

    @JoinTable({
        name: 'users_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
      })
      roles: Role[]

      @Column({ default: '', select: false })
        refresh_token: string
        
        @OneToMany(() => Device, (device) => device.user)
        devices: Device[]

        @Column({ default: false })
        is_deleted: boolean

        @Column({default: true})
        is_active: boolean
}
export default User;