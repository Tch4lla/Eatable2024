import { useUserContext } from '@/context/AuthContext';
import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import PostStats from './PostStats';
import { useState, useEffect } from 'react';
import {
  getPostImageUrl,
  getProfileImageUrl,
  extractCloudinaryPublicId,
} from '@/lib/cloudinary/config';

type GridPostListProps = {
  posts?: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostItem = ({
  post,
  showUser = true,
  showStats = true,
  userId,
}: {
  post: Models.Document;
  showUser?: boolean;
  showStats?: boolean;
  userId: string;
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [profileImageSrc, setProfileImageSrc] = useState('');
  const [postImageSrc, setPostImageSrc] = useState('');

  useEffect(() => {
    // Set profile image (only if showUser is true)
    if (
      showUser &&
      post?.creator?.imageUrl &&
      post.creator.imageUrl.includes('cloudinary.com')
    ) {
      const profileId = extractCloudinaryPublicId(post.creator.imageUrl);
      setProfileImageSrc(getProfileImageUrl(profileId, 100) || '');
    } else if (showUser) {
      setProfileImageSrc(
        post?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'
      );
    }

    // Set post image
    if (post.imageUrl && post.imageUrl.includes('cloudinary.com')) {
      const postId = extractCloudinaryPublicId(post.imageUrl);
      setPostImageSrc(getPostImageUrl(postId, 600) || '');
    } else {
      setPostImageSrc(post.imageUrl || '/assets/icons/profile-placeholder.svg');
    }
  }, [post.creator?.imageUrl, post.imageUrl, showUser]);

  return (
    <li className="relative min-w-80 h-80">
      <Link
        to={`/posts/${post.$id}`}
        className="grid-post_link"
      >
        <div className={`w-full h-full ${!isImageLoaded ? 'bg-dark-4' : ''}`}>
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="loader-pulse"></div>
            </div>
          )}
          <img
            src={postImageSrc}
            alt="post"
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      </Link>
      <div className="grid-post_user">
        {showUser && (
          <div className="flex items-center justify-start gap-2 flex-1">
            <img
              src={profileImageSrc}
              alt="creator"
              className="h-8 w-8 rounded-full object-cover"
              loading="lazy"
            />
            <p className="line-clamp-1">{post.creator.name}</p>
          </div>
        )}
        {showStats && (
          <PostStats
            post={post}
            userId={userId}
          />
        )}
      </div>
    </li>
  );
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  if (!posts || posts.length === 0) {
    return <p className="text-light-4">No posts found</p>;
  }

  return (
    <ul className="grid-container">
      {posts.map((post) => (
        <GridPostItem
          key={post.$id}
          post={post}
          showUser={showUser}
          showStats={showStats}
          userId={user.id}
        />
      ))}
    </ul>
  );
};

export default GridPostList;
