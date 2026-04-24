export class GetCollectionBySetResponse {
  constructor(
    readonly id: string,
    readonly cardId: string,
    readonly setId: string,
    readonly variants: Record<string, number>,
    readonly needed: boolean,
  ) {}
}
