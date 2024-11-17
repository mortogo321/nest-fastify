import {
  AuthenticatorService,
  hash,
  PrismaService,
  User,
  verifyHash,
} from '@app/common';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FastifyRequest } from 'fastify';
import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: PrismaService,
    private authService: AuthenticatorService,
  ) {}

  getHello(): string {
    const appName = process.env.APP_NAME;

    return `Hello from ${appName}!`;
  }

  async signUp(body: AuthDto) {
    const { email, password } = body;
    const isUser = await this.db.user.findFirst({ where: { email } });

    if (isUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hash(password);
    const user = plainToInstance(
      User,
      await this.db.user.create({
        data: {
          email,
          hashedPassword,
        },
      }),
    );

    return user;
  }

  async signIn(body: AuthDto) {
    const { email, password } = body;
    const user = await this.db.user.findFirst({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    if (!(await verifyHash(user.hashedPassword, password))) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const payload = { email: user.email, sub: user.id };

    return await this.authService.jwtSignAsync(payload);
  }

  signOut(request: FastifyRequest) {
    return request.body;
  }
}
