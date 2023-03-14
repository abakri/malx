import { Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { MalService } from 'src/mal/mal.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly malService: MalService,
    private readonly usersService: UsersService,
  ) { }

  @Get('login/start')
  login(@Res({ passthrough: true }) res: Response) {
    const codeVerifier = 'thisismycodeverifierwhichislongandatleast43characterslongblaaaaaaaaaaaahhhh';
    const state = 'thisismystate';

    res.cookie('code_verifier', codeVerifier);
    res.cookie('state', state);

    return { message: 'ok' };
  }

  @Get('login/end')
  async oauth2Callback(
    @Req() request: Request,
    @Query('code') code: string,
    @Query('state') state: string
  ) {
    // verify the state (compare cookie state with query param state)
    const initialState = request.cookies.state;
    if (initialState !== state) {
      throw new UnauthorizedException();
    }
    
    const codeVerifier = request.cookies.code_verifier;
    const {
      access_token: accessToken,
      refresh_token: refreshToken
    } = await this.malService.retrieveAccessToken(code, codeVerifier);

    // get the username data from mal API
    const {name: username} = await this.malService.retrieveProfile(accessToken);

    // find the user here
    const user = await this.usersService.findOneByUsername(username);
    console.log("-----")
    console.log(user);

    // if the user does not exist, then we should create a new user
    if (!user) {
      this.usersService.create(username, accessToken, refreshToken);
    }


    return { message: 'ok' };
  }
}
