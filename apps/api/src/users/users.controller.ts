import { Controller, Get } from "@nestjs/common";
import type { User as UserShape } from "@planner/shared";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(): Promise<UserShape[]> {
    return this.usersService.findAll();
  }
}
