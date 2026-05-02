import { Migration } from '@mikro-orm/migrations';

export class Migration20260430170000 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table "users" ("id" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "username" varchar(255) not null, "whatsapp" varchar(255) null, "instagram" varchar(255) null, "created_at" timestamptz not null, constraint "users_pkey" primary key ("id"));');
    this.addSql('create unique index "users_email_unique" on "users" ("email");');

    this.addSql('create table "lists" ("id" varchar(255) not null, "user_id" varchar(255) not null, "name" varchar(255) not null, "is_public" boolean not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "lists_pkey" primary key ("id"));');
    this.addSql('create index "lists_user_id_index" on "lists" ("user_id");');

    this.addSql('create table "collection_cards" ("id" varchar(255) not null, "user_id" varchar(255) not null, "card_id" varchar(255) not null, "set_id" varchar(255) not null, "variants" jsonb not null, "needed" boolean not null default false, constraint "collection_cards_pkey" primary key ("id"));');
    this.addSql('create index "collection_cards_user_id_index" on "collection_cards" ("user_id");');
    this.addSql('create index "collection_cards_card_id_index" on "collection_cards" ("card_id");');
    this.addSql('create index "collection_cards_set_id_index" on "collection_cards" ("set_id");');
    this.addSql('create unique index "collection_cards_user_id_card_id_unique" on "collection_cards" ("user_id", "card_id");');

    this.addSql('create table "list_cards" ("id" varchar(255) not null, "list_id" varchar(255) not null, "card_id" varchar(255) not null, "variants" jsonb not null, "added_at" timestamptz not null, constraint "list_cards_pkey" primary key ("id"));');
    this.addSql('create index "list_cards_list_id_index" on "list_cards" ("list_id");');

    this.addSql('create table "password_reset_tokens" ("id" varchar(255) not null, "user_id" varchar(255) not null, "token_hash" varchar(255) not null, "expires_at" timestamptz not null, "used" boolean not null default false, "created_at" timestamptz not null, constraint "password_reset_tokens_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "users";');
    this.addSql('drop table if exists "lists";');
    this.addSql('drop table if exists "collection_cards";');
    this.addSql('drop table if exists "list_cards";');
    this.addSql('drop table if exists "password_reset_tokens";');
  }
}