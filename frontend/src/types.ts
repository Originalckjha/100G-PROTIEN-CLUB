export type UserRole = 'enthusiast' | 'influencer' | 'trainer';

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: UserRole;
  followers: number;
  following: string[];
  badges: string[];
  joinedAt: string;
}

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

export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'shake' | 'dessert';
export type TipCategory = 'nutrition' | 'training' | 'recovery' | 'mindset' | 'meal-prep';

export interface AuthorSnippet {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: UserRole;
  followers: number;
  badges?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author: AuthorSnippet | null;
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

export interface Tip {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: AuthorSnippet | null;
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
  author: AuthorSnippet | null;
  content: string;
  type: 'recipe' | 'tip' | 'general';
  recipeId?: string;
  tipId?: string;
  recipe?: Recipe | null;
  tip?: Tip | null;
  likes: string[];
  createdAt: string;
}

export interface AuthState {
  user: PublicUser | null;
  token: string | null;
}
