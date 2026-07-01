import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepo.find({
      select: ["id", "email", "name"],
      order: { name: "ASC" },
    });
  }
}
