import { Outlet, Navigate } from 'react-router-dom';

const AuthLayout = () => {
  const isAuthenticated = false;
  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/home" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10 px-4">
            <Outlet />
          </section>
          <img
            src="/assets/images/dessert.jpg"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;
