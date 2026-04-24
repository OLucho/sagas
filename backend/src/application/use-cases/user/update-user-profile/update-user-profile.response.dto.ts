export class UpdateUserProfileResponse {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly username: string,
    readonly whatsapp: string | undefined,
    readonly instagram: string | undefined,
  ) {}
}
