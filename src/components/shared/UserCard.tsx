import { Models } from 'appwrite';
import { Link } from 'react-router-dom';

// import { Button } from '../ui/button';

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link
      to={`/profile/${user.$id}`}
      className="user-card"
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
        alt="creator"
        className="rounded-full w-14 h-14 object-cover"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      {/* <Button
        type="button"
        size="sm"
        className="shad-button_primary px-5"
      >
        Follow
      </Button> */}
    </Link>
  );
};

export default UserCard;
