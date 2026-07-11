export const sidebarLinks = [
    {
        imgURL: "/assets/icons/home.svg",
        route: "/",
        label: "Home",
    },
    {
        imgURL: "/assets/icons/wallpaper.svg",
        route: "/explore",
        label: "Explore",
    },
    {
        imgURL: "/assets/icons/people.svg",
        route: "/all-users",
        label: "People",
    },
    {
        imgURL: "/assets/icons/bookmark.svg",
        route: "/saved",
        label: "Saved",
    },
    {
        imgURL: "/assets/icons/gallery-add.svg",
        route: "/create-post",
        label: "Create Post",
    },
];

// Canonical dietary tags. No spaces — createPost/updatePost strip all
// spaces from the tags string before splitting, so spaced labels would
// be silently mangled (e.g. "Gluten Free" -> "GlutenFree").
export const DIETARY_TAGS = [
    "Vegan",
    "Vegetarian",
    "Pescatarian",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Egg-Free",
    "Soy-Free",
    "Shellfish-Free",
    "Kosher",
    "Halal",
    "Keto",
    "Paleo",
    "Low-FODMAP",
] as const;

export const bottombarLinks = [
    {
        imgURL: "/assets/icons/home.svg",
        route: "/",
        label: "Home",
    },
    {
        imgURL: "/assets/icons/wallpaper.svg",
        route: "/explore",
        label: "Explore",
    },
    {
        imgURL: "/assets/icons/bookmark.svg",
        route: "/saved",
        label: "Saved",
    },
    {
        imgURL: "/assets/icons/gallery-add.svg",
        route: "/create-post",
        label: "Create",
    },
];