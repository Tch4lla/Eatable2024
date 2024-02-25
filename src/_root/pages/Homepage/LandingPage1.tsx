import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      <div className="max-w-7xl flex flex-wrap lg:w-1/2 lg:h-screen/2">
        <div className="relative z-10 bg-white pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32 lg:mr-4 lg:ml-0">
          <svg
            className="absolute inset-y-0 right-0 hidden h-full w-48 translate-x-1/2 transform text-white lg:block"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
                <span className="block xl:inline">
                  <img
                    src="/assets/images/Eatable_logo.png"
                    alt="logo"
                  />
                </span>
                <br />
                <span className="block text-indigo-600 xl:inline">
                  Share the love
                </span>
              </h1>
              <p className="mt-5 text-lg text-gray-500 sm:mx-auto sm:mt-8 sm:max-w-xl sm:text-xl md:mt-10 md:text-2xl lg:mx-0">
                A social network for folks who can't eat just anything
              </p>
              <div className="mt-8 flex justify-center space-x-4 sm:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/sign-up"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Sign up
                  </Link>
                </div>
                <div className="rounded-md shadow">
                  <Link
                    to="/sign-in"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
        {/* New div for mobile responsiveness */}
        <div className="w-full lg:hidden">
          <img
            className="object-cover w-full h-96"
            src="/assets/images/cheers.jpg"
            alt="mobile-responsive-image"
          />
        </div>
        {/* Hidden on mobile screens */}
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-6/10">
          <img
            className="object-cover w-full h-96 sm:h-full md:h-full lg:h-full"
            src="/assets/images/heroPhoto.JPG"
            alt="hero-image"
          />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
