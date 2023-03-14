import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/models/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  async findOneByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) return undefined;
    return user;
  }

  async create(username: string, accessToken: string, refreshToken: string) {
    const user = new User();
    user.username = username;
    user.access_token = accessToken;
    user.refresh_token = refreshToken;
    await this.userRepository.save(user);
  }
};
