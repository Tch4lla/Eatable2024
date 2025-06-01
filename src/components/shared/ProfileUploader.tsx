import { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';

import { convertFileToUrl } from '@/lib/utils';

type ProfileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  label?: string;
};

const ProfileUploader = ({
  fieldChange,
  mediaUrl,
  label = 'Change profile photo',
}: ProfileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  // Check if the mediaUrl is a Cloudinary URL and contains a public ID
  const isCloudinaryUrl = mediaUrl && mediaUrl.includes('cloudinary.com');

  // If it's a Cloudinary URL, use the circular transformation
  const displayUrl =
    isCloudinaryUrl && mediaUrl.includes('/upload/')
      ? mediaUrl.replace(
          '/upload/',
          '/upload/w_300,c_fill,ar_1:1,g_auto,r_max,b_rgb:262c35/'
        )
      : fileUrl;

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [file]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
    },
  });

  return (
    <div {...getRootProps()}>
      <input
        {...getInputProps()}
        className="cursor-pointer"
      />

      <div className="cursor-pointer flex-center gap-4">
        <img
          src={displayUrl || '/assets/icons/profile-placeholder.svg'}
          alt="image"
          className="h-24 w-24 rounded-full object-cover object-center"
        />
        <p className="text-primary-500 small-regular md:bbase-semibold">
          {label}
        </p>
      </div>
    </div>
  );
};

export default ProfileUploader;
