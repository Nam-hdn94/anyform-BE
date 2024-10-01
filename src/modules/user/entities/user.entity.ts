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
}
export default User;