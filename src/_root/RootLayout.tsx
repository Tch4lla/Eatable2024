import BottomBar from '@/components/shared/BottomBar';
import LeftSideBar from '@/components/shared/LeftSideBar';
import TopBar from '@/components/shared/TopBar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const RootLayout = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;

    if (!user.id) {
      timeoutId = setTimeout(() => {
        setShowModal(true);
      }, 20000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user.id]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'; // Disable scrolling when modal is open
    } else {
      document.body.style.overflow = 'auto'; // Enable scrolling when modal is closed
    }
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSignUp = () => {
    navigate('/sign-up');
    closeModal();
  };
  return (
    <div className="w-full md:flex">
      <TopBar />
      <LeftSideBar />
      <section className="flex flex-1 h-full">
        {showModal && (
          <div className="modal">
            <div className="modal-content px-4 relative">
              <button
                onClick={closeModal}
                className="absolute right-4 top-2 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                  ></line>
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                  ></line>
                </svg>
                <span className="sr-only">Close</span>
              </button>
              <div className="modal-left">
                <img
                  src="/assets/images/heroPhoto.JPG"
                  alt="Modal Image"
                />
              </div>
              <div className="modal-right">
                <h3 className="h3-bold text-center py-2">Share the love</h3>
                <p className="base-semibold text-center pb-3">
                  To discover more content, sign-up or login
                </p>
                <Button
                  className="shad-button_primary ml-auto mr-auto"
                  onClick={handleSignUp}
                >
                  Get started
                </Button>
              </div>
            </div>
          </div>
        )}
        <Outlet />
      </section>
      <BottomBar />
    </div>
  );
};

export default RootLayout;
