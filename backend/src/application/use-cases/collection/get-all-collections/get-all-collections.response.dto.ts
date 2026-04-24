export class GetAllCollectionsResponse {
  constructor(
    readonly id: string,
    readonly cardId: string,
    readonly setId: string,
    readonly variants: Record<string, number>,
    readonly needed: boolean,
  ) {}
}
