import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

type TokenResponse = {
  token_type: string,
  expires_in: number,
  access_token: string,
  refresh_token: string,
}

type MalProfile = {
  id: number,
  name: string,
  location: string,
  joined_at: string,
  picture: string,
}

// TODO:
// - Add automatic token refresh and retry if a request fails due to expired token

@Injectable()
export class MalService {
  private readonly malClientId: string;
  private readonly malClientSecret: string;
  private readonly malRedirectURL: string;
  private readonly malBaseURL: string;
  private readonly malAPIBaseURL: string;
  private readonly logger = new Logger(MalService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    const malClientId = this.configService.get<string>('MAL_CLIENT_ID');
    const malClientSecret = this.configService.get<string>('MAL_CLIENT_SECRET');
    const malRedirectURL = this.configService.get<string>('MAL_REDIRECT_URL');
    const malBaseURL = this.configService.get<string>('MAL_BASE_URL');
    const malAPIBaseURL = this.configService.get<string>('MAL_API_BASE_URL');

    // verify environment variables
    if (!malClientId) {
      throw new Error('MAL_CLIENT_ID env var is not set');
    }
    if (!malClientSecret) {
      throw new Error('MAL_CLIENT_ID env var is not set');
    }
    if (!malRedirectURL) {
      throw new Error('MAL_REDIRECT_URL env var is not set');
    }
    if (!malBaseURL) {
      throw new Error('MAL_BASE_URL env var is not set');
    }
    if (!malAPIBaseURL) {
      throw new Error('MAL_BASE_URL env var is not set');
    }

    this.malClientId = malClientId
    this.malClientSecret = malClientSecret
    this.malRedirectURL = malRedirectURL
    this.malBaseURL = malBaseURL
    this.malAPIBaseURL = malAPIBaseURL
  }

  async retrieveAccessToken(code: string, codeVerifier: string): Promise<TokenResponse> {
    const url = `${this.malBaseURL}/v1/oauth2/token`
    const requestOptions = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    const requestData = {
      client_id: this.malClientId,
      client_secret: this.malClientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.malRedirectURL,
      code_verifier: codeVerifier,
    }

    const response = this.httpService
      .post(
        url,
        requestData,
        requestOptions
      )
      .pipe(
        map((response: AxiosResponse) => response.data),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.message);
          throw 'Unable to authenticate user with MAL';
        })
      )

    const data = await lastValueFrom(response);
    return data;
  }

  async retrieveProfile(access_token: string): Promise<MalProfile> {
    const url = `${this.malAPIBaseURL}/v2/users/@me`
    const requestOptions = { headers: { 'Authorization': `Bearer ${access_token}` } }

    const response = this.httpService
      .get(
        url,
        requestOptions
      )
      .pipe(
        map((response: AxiosResponse) => response.data),
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.message);
          throw 'Unable to retrieve user profile from MAL';
        })
      )

    const data = await lastValueFrom(response);
    return data;
  }

}
