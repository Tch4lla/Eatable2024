import { Routes, Route } from 'react-router-dom';
import {
  AllUsers,
  CreatePost,
  Explore,
  Home,
  LandingPage1,
  LikedPosts,
  PostDetails,
  Profile,
  Saved,
  UpdateProfile,
} from './_root/pages';
import SigninForm from './_auth/forms/SigninForm';
import SignupForm from './_auth/forms/SignupForm';
import './globals.css';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import { Toaster } from './components/ui/toaster';
import EditPost from './_root/pages/EditPost';

const App = () => {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* {public routes for all users} */}
        <Route
          path="/"
          element={<LandingPage1 />}
        />
        <Route element={<AuthLayout />}>
          <Route
            path="/sign-in"
            element={<SigninForm />}
          />
          <Route
            path="/sign-up"
            element={<SignupForm />}
          />
        </Route>
        {/* {private routes for signed in users} */}
        <Route element={<RootLayout />}>
          <Route
            path="/home"
            element={<Home />}
          />
          <Route
            path="/explore"
            element={<Explore />}
          />
          <Route
            path="/saved"
            element={<Saved />}
          />
          <Route
            path="/all-users"
            element={<AllUsers />}
          />
          <Route
            path="/create-post"
            element={<CreatePost />}
          />
          <Route
            path="/update-post/:id"
            element={<EditPost />}
          />
          <Route
            path="/posts/:id"
            element={<PostDetails />}
          />
          <Route
            path="/profile/:id/*"
            element={<Profile />}
          />
          <Route
            path="/update-profile/:id"
            element={<UpdateProfile />}
          />
          <Route
            path="/likes"
            element={<LikedPosts />}
          />
        </Route>
      </Routes>
      <Toaster />
    </main>
  );
};

export default App;
