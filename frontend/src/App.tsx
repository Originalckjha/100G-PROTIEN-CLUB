import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.tsx';
import Feed from './pages/Feed.tsx';
import Recipes from './pages/Recipes.tsx';
import RecipeDetail from './pages/RecipeDetail.tsx';
import CreateRecipe from './pages/CreateRecipe.tsx';
import Tips from './pages/Tips.tsx';
import CreateTip from './pages/CreateTip.tsx';
import Community from './pages/Community.tsx';
import Profile from './pages/Profile.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/new" element={<CreateRecipe />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/tips/new" element={<CreateTip />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
