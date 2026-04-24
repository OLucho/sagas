import { Controller, Get, Post, Patch, Body, HttpCode, UseGuards, Param, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetAllCollectionsUseCase } from '../../application/use-cases/collection/get-all-collections/get-all-collections.use-case';
import { GetAllCollectionsResponse } from '../../application/use-cases/collection/get-all-collections/get-all-collections.response.dto';
import { UpdateCardInCollectionUseCase } from '../../application/use-cases/collection/update-card-in-collection/update-card-in-collection.use-case';
import { UpdateCardInCollectionRequest } from '../../application/use-cases/collection/update-card-in-collection/update-card-in-collection.request.dto';
import { UpdateCardInCollectionResponse } from '../../application/use-cases/collection/update-card-in-collection/update-card-in-collection.response.dto';
import { MarkCardAsNeedUseCase } from '../../application/use-cases/collection/mark-card-as-need/mark-card-as-need.use-case';
import { MarkCardAsNeedRequest } from '../../application/use-cases/collection/mark-card-as-need/mark-card-as-need.request.dto';
import { MarkCardAsNeedResponse } from '../../application/use-cases/collection/mark-card-as-need/mark-card-as-need.response.dto';

@Controller('api/collections')
export class CollectionController {
  constructor(
    private readonly getAllCollectionsUseCase: GetAllCollectionsUseCase,
    private readonly updateCardInCollectionUseCase: UpdateCardInCollectionUseCase,
    private readonly markCardAsNeedUseCase: MarkCardAsNeedUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Request() req,
  ): Promise<GetAllCollectionsResponse[]> {
    return this.getAllCollectionsUseCase.execute(req.user.sub);
  }

  @Post(':setId/cards/:cardId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async updateCard(
    @Param('setId') setId: string,
    @Param('cardId') cardId: string,
    @Body() body: { variants: Record<string, number> },
    @Request() req,
  ): Promise<UpdateCardInCollectionResponse> {
    await this.updateCardInCollectionUseCase.execute(req.user.sub, setId, cardId, body.variants);
    return new UpdateCardInCollectionResponse();
  }

  @Patch(':setId/cards/:cardId')
  @UseGuards(JwtAuthGuard)
  async updateCardVariants(
    @Param('setId') setId: string,
    @Param('cardId') cardId: string,
    @Body() body: { variants: Record<string, number> },
    @Request() req,
  ): Promise<UpdateCardInCollectionResponse> {
    await this.updateCardInCollectionUseCase.execute(req.user.sub, setId, cardId, body.variants);
    return new UpdateCardInCollectionResponse();
  }

  @Post(':setId/cards/:cardId/need')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async markAsNeed(
    @Param('setId') setId: string,
    @Param('cardId') cardId: string,
    @Request() req,
  ): Promise<MarkCardAsNeedResponse> {
    await this.markCardAsNeedUseCase.execute(req.user.sub, setId, cardId);
    return new MarkCardAsNeedResponse();
  }
}
