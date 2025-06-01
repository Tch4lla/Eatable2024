import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { SignupValidation } from '@/lib/validation';
import { z } from 'zod';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useCreateUserAccount,
  useSignInAccount,
} from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';
import ProfileUploader from '@/components/shared/ProfileUploader';

const SignupForm = () => {
  const { toast } = useToast();
  const { checkAuthUser } = useUserContext();
  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useCreateUserAccount();
  const { mutateAsync: signInAccount } = useSignInAccount();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      file: [],
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    try {
      const newUser = await createUserAccount(values);

      // Check if the response is an error
      if (newUser instanceof Error) {
        // Check if it's a duplicate email error
        if (newUser.message === 'A user with this email already exists') {
          return toast({
            variant: 'destructive',
            title: 'Email already in use',
            description:
              'Please use a different email address or sign in with your existing account.',
          });
        } else {
          // Handle other errors
          return toast({
            variant: 'destructive',
            title: 'Sign up failed',
            description: newUser.message || 'Please try again',
          });
        }
      }

      if (!newUser) {
        return toast({
          variant: 'destructive',
          title: 'Sign up failed. Please try again',
        });
      }

      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        return toast({
          variant: 'destructive',
          title: 'Sign up failed. Please try again',
        });
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();

        // Force navigation to homepage
        window.location.href = '/';
      } else {
        // Check if there might be an existing session
        if (
          localStorage.getItem('cookieFallback') &&
          localStorage.getItem('cookieFallback') !== '[]'
        ) {
          toast({
            title: 'Account created successfully',
            description:
              'You may be logged in on another session. Please sign out from all sessions and try again.',
          });

          // Still try to navigate
          window.location.href = '/';
        } else {
          toast({
            variant: 'destructive',
            title: 'Sign up failed. Please try again',
          });
        }
      }
    } catch (error) {
      console.log({ error });
      toast({
        variant: 'destructive',
        title: 'An error occurred during sign up',
        description: 'Please try again later',
      });
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <Link to="/">
          <img
            src="/assets/images/Eatable_logo.png"
            alt="logo"
          />
        </Link>
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Create a new account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          To use Eatable, please enter your details
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center gap-4">
                <FormControl>
                  <ProfileUploader
                    fieldChange={field.onChange}
                    mediaUrl="/assets/icons/profile-placeholder.svg"
                    label="Upload profile photo"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="shad-input"
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
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="shad-button_primary"
          >
            {isCreatingUser ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              'Sign Up'
            )}
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?
            <Link
              to="/sign-in"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;
