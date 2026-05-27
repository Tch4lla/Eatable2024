import { useUserContext } from '@/context/AuthContext';
import { formatDateString, normalizeImageUrl } from '@/lib/utils';
import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import PostStats from './PostStats';
import { useState } from 'react';

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  if (!post.creator) return null;

  // Optimize profile image URL
  const rawProfileUrl = normalizeImageUrl(post?.creator?.imageUrl);
  const profileImageUrl =
    rawProfileUrl && rawProfileUrl.includes('cloudinary.com')
      ? rawProfileUrl.replace(
          '/upload/',
          '/upload/w_100,c_fill,ar_1:1,g_auto,r_max,b_rgb:262c35,q_auto,f_auto/'
        )
      : rawProfileUrl || '/assets/icons/profile-placeholder.svg';

  // Optimize post image URL with responsive sizing
  const rawPostUrl = normalizeImageUrl(post.imageUrl);
  const postImageUrl =
    rawPostUrl && rawPostUrl.includes('cloudinary.com')
      ? rawPostUrl.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/')
      : rawPostUrl || '/assets/icons/profile-placeholder.svg';

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={profileImageUrl}
              alt="creator"
              className="rounded-full w-12 h-12 object-cover"
              loading="lazy"
              width="48"
              height="48"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold dark:text-light-1 light:text-dark-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 dark:text-light-3 light:text-dark-3">
              <p className="subtle-semibold lg:small-regular">
                {formatDateString(post.$createdAt)}
              </p>
              -
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>
        <Link
          to={`/update-post/${post.$id}`}
          className={`${user.id !== post.creator.$id && 'hidden'}`}
        >
          <img
            src="/assets/icons/edit.svg"
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>
      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p className="dark:text-light-1 light:text-dark-1">{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {post.tags.map((tag: string) => (
              <li
                key={tag}
                className="dark:text-light-3 light:text-dark-3"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`post-card_img-container ${
            isImageLoaded ? 'loaded' : 'loading'
          }`}
        >
          {!isImageLoaded && (
            <div className="post-card_img-placeholder">
              <div className="loader-pulse"></div>
            </div>
          )}
          <img
            src={postImageUrl}
            alt="post-image"
            className={`post-card_img ${isImageLoaded ? 'visible' : 'img-loading'}`}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)}
          />
        </div>
      </Link>
      <PostStats
        post={post}
        userId={user.id}
      />
    </div>
  );
};

export default PostCard;
