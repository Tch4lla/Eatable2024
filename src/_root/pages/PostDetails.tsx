import GridPostList from '@/components/shared/GridPostList';
import Loader from '@/components/shared/Loader';
import PostStats from '@/components/shared/PostStats';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';
import { useGetPostById } from '@/lib/react-query/queriesAndMutations';
import { useGetUserPosts } from '@/lib/react-query/queriesAndMutations';
import { useDeletePost } from '@/lib/react-query/queriesAndMutations';
import { multiFormatDateString } from '@/lib/utils';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load the GridPostList component for related posts
const LazyGridPostList = lazy(() => import('@/components/shared/GridPostList'));

const PostDetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id!);
  const { user } = useUserContext();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showRelatedPosts, setShowRelatedPosts] = useState(false);
  const navigate = useNavigate();

  // Only fetch user posts when post data is available and user scrolls down
  const { data: userPosts, isPending: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id && showRelatedPosts ? post.creator.$id : undefined
  );

  const { mutate: deletePost } = useDeletePost();

  // Optimize post image URL with responsive sizing
  const postImageUrl =
    post?.imageUrl && post.imageUrl.includes('cloudinary.com')
      ? post.imageUrl.replace(
          '/upload/',
          '/upload/q_auto,f_auto,w_auto,dpr_auto,c_limit/'
        )
      : post?.imageUrl;

  // Optimize profile image URL
  const profileImageUrl =
    post?.creator?.imageUrl &&
    post?.creator?.imageUrl.includes('cloudinary.com')
      ? post?.creator?.imageUrl.replace(
          '/upload/',
          '/upload/w_100,c_fill,ar_1:1,g_auto,r_max,b_rgb:262c35,q_auto,f_auto/'
        )
      : post?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg';

  const handleDeletePost = () => {
    deletePost({ postId: id!, imageId: post?.imageId });
    navigate(-1);
  };

  // Filter related posts to exclude current post
  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  // Set up intersection observer to load related posts when user scrolls down
  useEffect(() => {
    if (!showRelatedPosts) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setShowRelatedPosts(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const relatedPostsSection = document.getElementById(
        'related-posts-section'
      );
      if (relatedPostsSection) {
        observer.observe(relatedPostsSection);
      }

      return () => {
        if (relatedPostsSection) {
          observer.unobserve(relatedPostsSection);
        }
      };
    }
  }, [showRelatedPosts, post]);

  return (
    <div className="post_details-container">
      {isPending ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <div className="post_details-img-container relative">
            {!isImageLoaded && (
              <div className="post_details-img-placeholder">
                <div className="loader-pulse"></div>
              </div>
            )}
            <img
              src={postImageUrl}
              alt="post"
              className={`post_details-img ${
                isImageLoaded ? 'visible' : 'hidden'
              }`}
              loading="lazy"
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={profileImageUrl}
                  alt="creator"
                  className="rounded-full w-8 h-8 lg:w-12 lg:h-12"
                  loading="lazy"
                  width={48}
                  height={48}
                />

                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    -
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>
              <div className="flex-center gap-3">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && 'hidden'}`}
                >
                  <img
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>
                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ghost_details-delete_btn ${
                    user.id !== post?.creator.$id && 'hidden'
                  }`}
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>
            <hr className="border w-full border-dark-4/80" />
            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string) => (
                  <li
                    key={tag}
                    className="text-light-3"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats
                post={post}
                userId={user.id}
              />
            </div>
          </div>
        </div>
      )}

      <div
        id="related-posts-section"
        className="w-full max-w-5xl"
      >
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>

        {showRelatedPosts ? (
          isUserPostLoading || !relatedPosts ? (
            <Loader />
          ) : (
            <Suspense fallback={<Loader />}>
              <LazyGridPostList posts={relatedPosts} />
            </Suspense>
          )
        ) : (
          <div className="flex-center h-40">
            <p className="text-light-3">Scroll down to see related posts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
