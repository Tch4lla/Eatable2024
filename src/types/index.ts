import React from "react";

export type Theme = 'dark' | 'light';

export type IThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

export type IContextType = {
    user: IUser;
    isLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<IUser>>;
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    checkAuthUser: () => Promise<boolean>
}

export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
};

export type IUpdateUser = {
    userId: string;
    name: string;
    bio: string;
    email: string,
    username: string,
    imageId: string;
    imageUrl: string;
    file: File[];
};

export type INewPost = {
    userId: string;
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
};

export type IUpdatePost = {
    postId: string;
    caption: string;
    imageId: string;
    imageUrl: string;
    file: File[];
    location?: string;
    tags?: string;
};

export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
};

export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
    file?: File[];
    guests?: []
};
