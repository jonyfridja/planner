import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar" })
  taskType!: string;

  @Column({ type: "int" })
  status!: number;

  @Column({ type: "boolean", default: false })
  closed!: boolean;

  @Column({ type: "jsonb", default: {} })
  data!: Record<string, unknown>;

  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
