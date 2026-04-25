export type UserRole = 'enthusiast' | 'influencer' | 'trainer';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  avatar: string;
  bio: string;
  role: UserRole;
  followers: number;
  following: string[];
  badges: string[];
  joinedAt: string;
}

export type PublicUser = Omit<User, 'passwordHash' | 'email'>;

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export type RecipeCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'shake'
  | 'dessert';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  authorId: string;
  ingredients: Ingredient[];
  instructions: string[];
  macros: Macros;
  category: RecipeCategory;
  tags: string[];
  emoji: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  likes: string[];
  saves: string[];
  comments: Comment[];
  createdAt: string;
}

export type TipCategory =
  | 'nutrition'
  | 'training'
  | 'recovery'
  | 'mindset'
  | 'meal-prep';

export interface Tip {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: TipCategory;
  tags: string[];
  emoji: string;
  likes: string[];
  saves: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  type: 'recipe' | 'tip' | 'general';
  recipeId?: string;
  tipId?: string;
  image?: string;
  likes: string[];
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  username: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
