import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations';
import { useEffect } from 'react';
import { INITIAL_USER, useUserContext } from '@/context/AuthContext';
import { sidebarLinks } from '@/constants';
import { INavLink } from '@/types';
import { Button } from '../ui/button';
import ThemeToggle from './ThemeToggle';

const LeftSideBar = () => {
  const { pathname } = useLocation();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();

  useEffect(() => {
    if (isSuccess) {
      setUser(INITIAL_USER); // Reset user state to initial user object
      navigate('/');
    }
  }, [isSuccess, setUser]);
  return (
    <>
      {user.id ? (
        <nav className="leftsidebar">
          <div className="flex flex-col gap-11">
            <Link
              to="/"
              className="flex gap-3 items-center"
            >
              <img
                src="/assets/images/Eatable_logo.png"
                alt="logo"
                width={170}
                height={36}
              />
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className="flex gap-3 items-center"
            >
              <img
                src={
                  user.imageUrl && user.imageUrl.includes('cloudinary.com')
                    ? user.imageUrl.replace(
                        '/upload/',
                        '/upload/w_400,c_fill,ar_1:1,g_auto,r_max,b_rgb:262c35/'
                      )
                    : user.imageUrl || '/assets/icons/profile-placeholder.svg'
                }
                alt="profile-picture"
                className="h-14 w-14 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <p className="body-bold">{user.name}</p>
                <p className="small-regular text-light-3">{user.username}</p>
              </div>
            </Link>

            <ul className="flex flex-col gap-6">
              {sidebarLinks.map((link: INavLink) => {
                const isActive = pathname === link.route;
                return (
                  <li
                    key={link.label}
                    className={`leftsidebar-link group ${
                      isActive && 'bg-primary-500'
                    }`}
                  >
                    <NavLink
                      to={link.route}
                      className="flex gap-4 items-center p-4"
                    >
                      <img
                        src={link.imgURL}
                        alt={link.label}
                        className={`group-hover:invert-white ${
                          isActive && 'invert-white'
                        }`}
                      />
                      {link.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="shad-button_ghost"
              onClick={() => signOut()}
            >
              <img
                src="/assets/icons/logout.svg"
                alt="logout"
              />
              <p className="small-meduim lg:base-medium">Logout</p>
            </Button>
          </div>
        </nav>
      ) : (
        <div className="leftsidebar">
          <div className="flex flex-col gap-11">
            <Link
              to="/"
              className="flex gap-3 items-center"
            >
              <img
                src="/assets/images/Eatable_logo.png"
                alt="logo"
                width={170}
                height={36}
              />
            </Link>

            <p>
              Want to view more content? <br />
              Log into your account
            </p>
            <Button
              className="shad-button_primary"
              onClick={() => navigate('/sign-in')}
            >
              Get started
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSideBar;
