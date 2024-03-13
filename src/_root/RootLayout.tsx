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
      }, 30000);
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
            <div className="modal-content px-4">
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
