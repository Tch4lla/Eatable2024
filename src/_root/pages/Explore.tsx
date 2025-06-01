import Loader from '@/components/shared/Loader';
import SearchResults from '@/components/shared/SearchResults';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/useDebounce';
import {
  useGetPosts,
  useSearchPost,
} from '@/lib/react-query/queriesAndMutations';
import {
  useEffect,
  useState,
  lazy,
  Suspense,
  useCallback,
  useRef,
} from 'react';
import { useInView } from 'react-intersection-observer';

// Lazy load the GridPostList component for better initial load performance
const GridPostList = lazy(() => import('@/components/shared/GridPostList'));

const Explore = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isLoading: isPostsLoading,
  } = useGetPosts();
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Increase debounce time to reduce API calls during typing
  const debouncedValue = useDebounce(searchValue, 800);

  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPost(debouncedValue);

  // Optimize infinite scrolling
  const handleLoadMore = useCallback(() => {
    if (inView && !searchValue && hasNextPage && !isPostsLoading) {
      fetchNextPage();
    }
  }, [inView, searchValue, hasNextPage, fetchNextPage, isPostsLoading]);

  useEffect(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  // Track when search begins/ends for UI optimization
  useEffect(() => {
    if (debouncedValue) {
      setIsSearching(true);
    } else {
      // Small delay to prevent UI flicker when clearing search
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [debouncedValue]);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      // Delay focus to prevent mobile keyboard from popping up immediately
      const timer = setTimeout(() => {
        // Only focus on larger screens to avoid mobile keyboard issues
        if (window.innerWidth > 768) {
          searchInputRef.current?.focus();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!posts && isPostsLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== '';
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts?.pages.every((item) => item?.documents.length === 0);

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-2 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            alt="search"
            width={24}
            height={24}
          />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            alt="filter"
            width={20}
            height={20}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPost={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of Posts</p>
        ) : (
          <Suspense
            fallback={
              <div className="flex-center w-full">
                <Loader />
              </div>
            }
          >
            {/* Flatten all pages of posts into a single array for continuous grid */}
            <GridPostList
              posts={posts?.pages.flatMap((page) => page?.documents || [])}
            />
          </Suspense>
        )}
      </div>

      {/* Improved visibility of loading indicator */}
      {hasNextPage && !searchValue && !isSearching && (
        <div
          ref={ref}
          className="mt-10 h-20 flex-center w-full"
        >
          <Loader />
        </div>
      )}

      {/* Show message when all posts are loaded */}
      {!hasNextPage &&
        !searchValue &&
        posts?.pages &&
        posts.pages.length > 0 && (
          <p className="text-light-4 mt-10 text-center w-full py-4">
            You've reached the end of posts
          </p>
        )}
    </div>
  );
};

export default Explore;
