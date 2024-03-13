import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations';
import { useEffect } from 'react';
import { useUserContext } from '@/context/AuthContext';

const TopBar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (isSuccess) navigate('/');
  }, [isSuccess]);

  return (
    <>
      {user.id ? (
        <section className="topbar">
          <div className="flex-between py-4 px-5">
            <Link
              to="/"
              className="flex gap-3 items-center"
            >
              <img
                src="/assets/images/Eatable_logo.png"
                alt="logo"
                width={130}
                height={325}
              />
            </Link>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="shad-button_ghost"
                onClick={() => signOut()}
              >
                <img
                  src="/assets/icons/logout.svg"
                  alt="logout"
                />
              </Button>
              <Link
                to={`/profile/${user.id}`}
                className="flex-center gap-3"
              >
                <img
                  src={
                    user.imageUrl || '/assets/images/profile-placeholder.svg'
                  }
                  alt="profile-picture"
                  className="h-8 w-8 rounded-full"
                />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="topbar">
          <div className="flex-between gap-4 py-4 px-5">
            <Link
              to="/"
              className="flex gap-3 items-center"
            >
              <img
                src="/assets/images/Eatable_logo.png"
                alt="logo"
                width={130}
                height={325}
              />
            </Link>
            <div className="flex gap-4">
              <p>Log in or sign-up for more content</p>
              <Button
                className="shad-button_primary"
                onClick={() => navigate('/sign-in')}
              >
                Get started
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default TopBar;
