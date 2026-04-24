import {integer, real, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const gameResults = sqliteTable('game_results', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, {onDelete: 'cascade'}),
  puzzleId: text('puzzle_id').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  score: integer('score').notNull(),
  accuracy: real('accuracy').notNull(),
  timeSpent: integer('time_spent').notNull(),
  createdAt: text('created_at').notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type GameResult = typeof gameResults.$inferSelect;
export type NewGameResult = typeof gameResults.$inferInsert;
