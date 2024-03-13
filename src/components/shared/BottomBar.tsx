import { bottombarLinks } from '@/constants';
import { useUserContext } from '@/context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const BottomBar = () => {
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <>
      {user.id ? (
        <section className="bottom-bar">
          {bottombarLinks.map((link) => {
            const isActive = pathname === link.route;
            return (
              <Link
                to={link.route}
                key={link.label}
                className={`${
                  isActive && 'bg-primary-500 rounded-[10px]'
                } flex-center flex-col gap-1 p-2 transition`}
              >
                <img
                  src={link.imgURL}
                  alt={link.label}
                  className={`${isActive && 'invert-white'}`}
                  width={16}
                  height={16}
                />
                <p className="tiny-medium text-light-2">{link.label}</p>
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="bottom-bar">
          <p>Log in or sign-up for more content</p>
          <Button
            className="shad-button_primary"
            onClick={() => navigate('/sign-in')}
          >
            Get started
          </Button>
        </section>
      )}
    </>
  );
};

export default BottomBar;
