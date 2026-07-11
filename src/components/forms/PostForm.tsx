import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import { DIETARY_TAGS } from '@/constants';
import FileUploader from '../shared/FileUploader';
import { PostValidation } from '@/lib/validation';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '../ui/use-toast';
import {
  useCreatePost,
  useUpdatePost,
} from '@/lib/react-query/queriesAndMutations';
import { Models } from 'appwrite';

type PostFormProps = {
  post?: Models.Document;
  action: 'Create' | 'Update';
};

const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdatePost();
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : '',
      file: [],
      location: post ? post?.location : '',
      tags: post ? post.tags.join(',') : '',
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostValidation>) {
    if (post && action === 'Update') {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post?.imageId,
        imageUrl: post?.imageUrl,
      });

      if (!updatedPost) {
        toast({ title: 'Please try again' });
      }

      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost({
      ...values,
      userId: user.id,
    });

    if (!newPost) {
      toast({
        title: 'Please try again',
      });
    }
    navigate('/');
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about it"
                  {...field}
                  className="shad-textarea custom-scrollbar"
                />
              </FormControl>

              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="What should I Google?"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => {
            const selected = field.value
              ? field.value.split(',').filter(Boolean)
              : [];
            // Legacy posts may carry free-text tags outside the canonical
            // list — render them as chips too so they stay removable
            const legacyTags = selected.filter(
              (tag) => !DIETARY_TAGS.includes(tag as any)
            );
            const toggleTag = (tag: string) => {
              // Read at click time, not render time — rapid consecutive
              // clicks would otherwise overwrite each other's selection
              const current = (form.getValues('tags') || '')
                .split(',')
                .filter(Boolean);
              const next = current.includes(tag)
                ? current.filter((t) => t !== tag)
                : [...current, tag];
              field.onChange(next.join(','));
            };
            return (
              <FormItem>
                <FormLabel className="shad-form_label">Dietary Tags</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {[...DIETARY_TAGS, ...legacyTags].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`small-medium rounded-full px-3 py-1.5 transition-colors ${
                          selected.includes(tag)
                            ? 'bg-primary-500 text-light-1'
                            : 'bg-dark-4 text-light-2'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </FormControl>

                <FormMessage className="shad-form_message" />
              </FormItem>
            );
          }}
        />
        <div className="flex gap-4 items-center justify-between">
          <Button
            type="button"
            className="shad-button_dark_4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
