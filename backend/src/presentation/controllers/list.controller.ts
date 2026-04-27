import { Controller, Get, Post, Patch, Delete, Body, HttpCode, UseGuards, Param, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { CreateListUseCase } from '../../application/use-cases/lists/create-list/create-list.use-case';
import { GetUserListsUseCase } from '../../application/use-cases/lists/get-user-lists/get-user-lists.use-case';
import { GetListByIdUseCase } from '../../application/use-cases/lists/get-list-by-id/get-list-by-id.use-case';
import { UpdateListUseCase } from '../../application/use-cases/lists/update-list/update-list.use-case';
import { DeleteListUseCase } from '../../application/use-cases/lists/delete-list/delete-list.use-case';
import { GetListCardsUseCase } from '../../application/use-cases/list-cards/get-list-cards/get-list-cards.use-case';
import { AddCardToListUseCase } from '../../application/use-cases/list-cards/add-card-to-list/add-card-to-list.use-case';
import { UpdateListCardUseCase } from '../../application/use-cases/list-cards/update-list-card/update-list-card.use-case';
import { RemoveCardFromListUseCase } from '../../application/use-cases/list-cards/remove-card-from-list/remove-card-from-list.use-case';
import { GetListCardsResponse } from '../../application/use-cases/list-cards/get-list-cards/get-list-cards.use-case';
import { CreateListRequest } from '../../application/use-cases/lists/create-list/create-list.request.dto';
import { CreateListResponse } from '../../application/use-cases/lists/create-list/create-list.response.dto';
import { UpdateListRequest } from '../../application/use-cases/lists/update-list/update-list.request.dto';
import { GetUserListsResponse } from '../../application/use-cases/lists/get-user-lists/get-user-lists.response.dto';
import { GetListByIdResponse } from '../../application/use-cases/lists/get-list-by-id/get-list-by-id.response.dto';
import { UpdateListResponse } from '../../application/use-cases/lists/update-list/update-list.response.dto';

@Controller('api/lists')
export class ListController {
  constructor(
    private readonly createListUseCase: CreateListUseCase,
    private readonly getUserListsUseCase: GetUserListsUseCase,
    private readonly getListByIdUseCase: GetListByIdUseCase,
    private readonly updateListUseCase: UpdateListUseCase,
    private readonly deleteListUseCase: DeleteListUseCase,
    private readonly getListCardsUseCase: GetListCardsUseCase,
    private readonly addCardToListUseCase: AddCardToListUseCase,
    private readonly updateListCardUseCase: UpdateListCardUseCase,
    private readonly removeCardFromListUseCase: RemoveCardFromListUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async create(@Body() dto: CreateListRequest, @Request() req): Promise<CreateListResponse> {
    return this.createListUseCase.execute(req.user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserLists(@Request() req): Promise<GetUserListsResponse[]> {
    return this.getUserListsUseCase.execute(req.user.sub);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getById(@Param('id') id: string, @Request() req): Promise<GetListByIdResponse> {
    return this.getListByIdUseCase.execute(id, req.user?.sub ?? null);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateListRequest, @Request() req): Promise<UpdateListResponse> {
    return this.updateListUseCase.execute(id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    return this.deleteListUseCase.execute(id, req.user.sub);
  }

  @Get(':listId/cards')
  @UseGuards(JwtAuthGuard)
  async getCards(@Param('listId') listId: string): Promise<GetListCardsResponse[]> {
    return this.getListCardsUseCase.execute(listId);
  }

  @Post(':listId/cards')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async addCard(
    @Param('listId') listId: string,
    @Body() body: { cardId: string; variants: Record<string, number> },
    @Request() req,
  ): Promise<void> {
    return this.addCardToListUseCase.execute(listId, body.cardId, body.variants);
  }

  @Patch(':listId/cards/:cardId')
  @UseGuards(JwtAuthGuard)
  async updateCard(
    @Param('listId') listId: string,
    @Param('cardId') cardId: string,
    @Body() body: { variants: Record<string, number> },
    @Request() req,
  ): Promise<void> {
    return this.updateListCardUseCase.execute(listId, cardId, body.variants, req.user.sub);
  }

  @Delete(':listId/cards/:cardId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async removeCard(
    @Param('listId') listId: string,
    @Param('cardId') cardId: string,
    @Request() req,
  ): Promise<void> {
    return this.removeCardFromListUseCase.execute(listId, cardId, req.user.sub);
  }
}
