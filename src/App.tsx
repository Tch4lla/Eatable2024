import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  AllUsers,
  CreatePost,
  Explore,
  Home,
  // LandingPage1,
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
import { toast } from './components/ui/use-toast';
import EditPost from './_root/pages/EditPost';

const App = () => {
  // Warning handed off from SignupForm via sessionStorage — signup ends in a
  // full-page navigation, so the toast can only be shown after the reload.
  useEffect(() => {
    if (sessionStorage.getItem('eatable_photo_upload_warning')) {
      sessionStorage.removeItem('eatable_photo_upload_warning');
      toast({
        title: "Profile photo couldn't be uploaded",
        description:
          'Your account was created without it. You can add a photo from Update Profile.',
      });
    }
  }, []);

  return (
    <main className="flex h-screen">
      <Routes>
        {/* {public routes for all users} */}
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
            path="/"
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
