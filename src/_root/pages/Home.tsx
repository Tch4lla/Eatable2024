import Loader from '@/components/shared/Loader';
import PostCard from '@/components/shared/PostCard';
import { useGetRecentPosts } from '@/lib/react-query/queriesAndMutations';
import { useEffect, useState, useRef, useCallback } from 'react';

const Home = () => {
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();
  const [visiblePosts, setVisiblePosts] = useState<number>(5); // Initially show 5 posts
  const loaderRef = useRef<HTMLDivElement>(null);

  // Implement Intersection Observer for better infinite scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && posts?.documents) {
        // When loader is visible, load more posts
        if (visiblePosts < posts.documents.length) {
          console.log(
            'Loading more posts...',
            visiblePosts,
            posts.documents.length
          );
          setVisiblePosts((prev) => Math.min(prev + 5, posts.documents.length));
        }
      }
    },
    [posts, visiblePosts]
  );

  // Set up the intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleObserver, posts]);

  // When posts data changes, reset visible posts count
  useEffect(() => {
    if (posts?.documents) {
      setVisiblePosts(Math.min(5, posts.documents.length));
    }
  }, [posts]);

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <>
              <ul className="flex flex-col flex-1 gap-9 w-full">
                {posts?.documents.slice(0, visiblePosts).map((post) => (
                  <li
                    key={post.$id}
                    className="flex justify-center w-full"
                  >
                    <PostCard post={post} />
                  </li>
                ))}
              </ul>

              {/* Loader element that triggers more posts when visible */}
              {posts?.documents && visiblePosts < posts.documents.length && (
                <div
                  ref={loaderRef}
                  className="flex-center mt-10 h-20"
                >
                  <Loader />
                </div>
              )}

              {/* Show message when all posts are loaded */}
              {posts?.documents &&
                visiblePosts >= posts.documents.length &&
                posts.documents.length > 0 && (
                  <div className="flex-center mt-10 text-light-3">
                    <p>You've reached the end of the feed</p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
