import { Module } from "@nestjs/common";
import { MalModule } from "src/mal/mal.module";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [AuthModule, MalModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})

export class AuthModule { }
