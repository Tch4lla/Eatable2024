# Eatable
Full-stack social media app where users can upload and tag photos of places or foods. Intended for users who have dietary restrictions and need/want to help finding places or things to eat which meet their dietary needs.

![Readme background ](https://github.com/Tch4lla/Eatable2024/assets/99618731/b2151ae1-c37f-4c9b-93db-0c426f4e6988)

## How It's Made:

**Frontend - React 18, TypeScript, Tailwind, ReactQuery, ShadCN; Backend -Appwrite**
<br>
A user is able to create their own username and password. Passwords are hashed for privacy. Once logged in they are able to access their own profile which has their previously uploaded photos. These photos are also in the network feed. When a photo is selected, users are shown a detailed page with the title of the photo, it's description, any tags, they can like the photo, and the owner of the photo can delete it. Photos can also be commented on by users.  

## Features
**Homepage**
: Once the user is sucessfully logged in, they are directed to the home page, which is a feed of all the users' posts

![Landing page and home](https://github.com/Tch4lla/Eatable2024/assets/99618731/7400864b-cbb3-4f41-849b-23d3f88464d1)

**User Profile**
: Each user is able to create their own profile. They can upload an image of themselves, change their name, their username, email, as well as create their own bio
<div align="center">
<img src = "https://media.giphy.com/media/5NWwfauLI22ihCoGrM/giphy.gif">
</div>

**Post Creation**
: The main function of the application is for users to create their own 'Eatable', simply a post which other users can view. 
<div align="center">
<img src = "https://media.giphy.com/media/fBTNcGjajx9BcfC0D5/giphy.gif">
</div>

**Post Details**
: The details page serees users with more information about the post. It also shows related posts of the user who created the Eatable. 
<br>
<div align="center">
<img src = "https://media.giphy.com/media/3PdgJZVg4DWnDHGWGZ/giphy.gif">
</div>

**Pagination**
: Users can search though posts to find ones that would interst them most. 
<div align="center">
<img src = "https://media.giphy.com/media/fG9DbllWPGXVj2Qgct/giphy.gif">
</div>

**Likes and Saves**
: Users can like and safe posts. The posts that a user likes will be stored in a list on the  
<div align="center">
<img src = "https://media.giphy.com/media/BF2Oiy1kJnlUjI9q0l/giphy.gif">
</div>

## Optimizations

As I get more feedback from users, I would like other users to be able to comment on posts, follow other users, and share to different applications

## Lessons Learned:

This was my first implementation of using nested routes from React Router Dom, as well as creating single layout that would interchange my pages. Using an experimental backend like appwrite was challenging, and there are still features that I would like to implement once appwrite expands. I also found that it was quite useful to create a user context. This allowed me to access the user's information from anywhere within the application easily. React Query also has an infinite scrolling query, whcich was new for me to work with in any application. I think using it makes the site feel similar to popular social media apps currently. 

If the application continues to grow, I would like to look into way to load posts faster, though either caching or deferring. 
