import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';


@Injectable()
export class UsersService {
  constructor(
    // get from entity
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
//creating a new user, storing user data, finding exixting user
  async create(payload: CreateUserDto): Promise<User> {
    const { username, password, organization, email, phone_number } = payload;
    const user = await this.findOne(username, organization);
    if (user) {
      throw new HttpException(
        `username already exists in organization ${organization}`,
        401,
      );
    }
    const created = await this.usersRepository.save({
      username,
      password,
      organization,
      email,
      phone_number,
    });
    return created;
  }
//find user by username
  async findOne(username: string, organization: string): Promise<any> {
    return this.usersRepository.findOne({ username, organization });
  }
  async findByEmail(email: string,): Promise<any> {
    return this.usersRepository.findOne({ email });
  }
  async findById(id: number,): Promise<any> {
    return this.usersRepository.findOne({ id });
  //todo find by id
  }
}
