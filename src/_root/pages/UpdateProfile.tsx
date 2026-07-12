import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import ProfileUploader from '@/components/shared/ProfileUploader';
import Loader from '@/components/shared/Loader';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ProfileValidation } from '@/lib/validation';
import { INITIAL_USER, useUserContext } from '@/context/AuthContext';
import {
  useGetUserById,
  useUpdateUser,
  useDeleteAccount,
} from '@/lib/react-query/queriesAndMutations';

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser, setIsAuthenticated } = useUserContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio || '',
    },
  });

  // Queries
  const { data: currentUser } = useGetUserById(id || '');
  const { mutateAsync: updateUser, isPending: isLoadingUpdate } = useUpdateUser();
  const { mutateAsync: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  // defaultValues are captured before the auth context loads, leaving the
  // fields empty behind their placeholders — refill once the profile arrives
  useEffect(() => {
    if (currentUser) {
      form.reset({
        file: [],
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio || '',
      });
    }
  }, [currentUser]);

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  // Handler
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    const emailChanged = value.email !== currentUser.email;

    const updatedUser = await updateUser({
      userId: currentUser.$id,
      name: value.name,
      email: value.email,
      username: value.username,
      bio: value.bio,
      file: value.file,
      imageUrl: currentUser.imageUrl,
      imageId: currentUser.imageId,
    });

    if (!updatedUser) {
      toast({ title: `Update user failed. Please try again.` });
      return;
    }

    if (emailChanged) {
      // Sessions were invalidated server-side — clear local state and redirect to sign-in
      localStorage.removeItem('cookieFallback');
      localStorage.removeItem('eatable_user_cache');
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      toast({ title: 'Email updated. Please sign in again.' });
      return navigate('/sign-in');
    }

    setUser({
      ...user,
      name: updatedUser?.name,
      username: updatedUser?.username,
      bio: updatedUser?.bio,
      email: updatedUser?.email,
      imageUrl: updatedUser?.imageUrl,
    });
    return navigate(`/profile/${id}`);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(currentUser.$id);
      localStorage.removeItem('cookieFallback');
      localStorage.removeItem('eatable_user_cache');
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      navigate('/sign-in');
    } catch {
      toast({ title: 'Failed to delete account. Please try again.' });
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center gap-4">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.imageUrl}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      placeholder={currentUser.name}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      placeholder={currentUser.username}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      placeholder={currentUser.email}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isLoadingUpdate}
              >
                {isLoadingUpdate && <Loader />}
                Update Profile
              </Button>
            </div>
          </form>
        </Form>

        <div className="flex w-full max-w-5xl mt-8 pt-8 border-t border-dark-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-dark-2 border-dark-4">
            <DialogHeader>
              <DialogTitle className="text-light-1">Delete Account</DialogTitle>
              <DialogDescription className="text-light-3">
                This will permanently delete your account, all your posts, and all saved posts. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeletingAccount}
                onClick={handleDeleteAccount}
              >
                {isDeletingAccount && <Loader />}
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UpdateProfile;
