import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "../../types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases } from "./config";
import { uploadToCloudinary, getOptimizedImageUrl, getProfileImageUrl, deleteFromCloudinary } from "../cloudinary/api";

export async function createUserAccount(user: INewUser) {
	try {
		// Check if a user with this email already exists
		const existingUsers = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.equal('email', user.email)]
		);

		if (existingUsers && existingUsers.documents.length > 0) {
			throw new Error("A user with this email already exists");
		}

		const newAccount = await account.create(
			ID.unique(),
			user.email,
			user.password,
			user.name,
		)
		if (!newAccount) throw Error;

		let imageUrl = avatars.getInitials(user.name).toString();
		let imageId = "";

		// If user uploaded a profile picture, upload it to Cloudinary
		if (user.file && user.file.length > 0) {
			const uploadedFile = await uploadFile(user.file[0]);
			if (uploadedFile) {
				// Use profile image URL with circular transformation
				const profileUrl = getProfileImageUrl(uploadedFile.$id);
				if (profileUrl) {
					imageUrl = profileUrl as string;
					imageId = uploadedFile.$id;
				}
			}
		}

		const newUser = await saveUserToDB({
			accountId: newAccount.$id,
			name: newAccount.name,
			email: newAccount.email,
			username: user.username,
			imageUrl: imageUrl,
			imageId: imageId,
		})
		return newUser

	} catch (error) {
		console.error(error)
		return error
	}
}

export async function saveUserToDB(user: {
	accountId: string;
	email: string;
	name: string;
	imageUrl: string;
	imageId?: string;
	username?: string
}) {
	try {
		const newUser = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			ID.unique(),
			user,
		)
		return newUser
	} catch (error) {
		console.log(error)
	}
}

export async function signInAccount(user: { email: string, password: string }) {
	try {
		const session = await account.createEmailSession(user.email, user.password)
		return session
	} catch (error) {
		console.log(error)
	}
}

export async function getCurrentUser() {
	try {
		// Check if user is authenticated
		const currentAccount = await account.get()

		if (!currentAccount) {
			console.log("No current account found")
			return null
		}

		// Get user from database
		const currentUser = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			[Query.equal('accountId', currentAccount.$id)]
		)

		if (!currentUser || currentUser.documents.length === 0) {
			console.log("No user found in database")
			return null
		}

		return currentUser.documents[0]
	} catch (error) {
		console.log("Error in getCurrentUser:", error)
		// Return null instead of undefined to indicate no user
		return null
	}
}

export async function signOutAccount() {
	try {
		const session = await account.deleteSession("current")
		return session
	} catch (error) {
		console.log(error)
	}
}

export async function createPost(post: INewPost) {
	try {
		//upload image to Cloudinary
		const uploadedFile = await uploadFile(post.file[0])
		if (!uploadedFile) throw Error

		//Get optimized file Url
		const fileUrl = uploadedFile.url // Cloudinary already returns the URL
		console.log("fileUrl: ", fileUrl)

		if (!fileUrl) {
			deleteFile(uploadedFile.$id)
			throw Error
		}

		//convert tags into an array
		const tags = post.tags?.replace(/ /g, '').split(',') || []

		//save post to database 
		const newPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			ID.unique(),
			{
				creator: post.userId,
				caption: post.caption,
				imageUrl: fileUrl,
				imageId: uploadedFile.$id, // This is the Cloudinary public_id
				location: post.location,
				tags: tags
			}
		)

		if (!newPost) {
			await deleteFile(uploadedFile.$id)
			throw Error
		}

		return newPost
	} catch (error) {
		console.log(error)
	}
}

export async function uploadFile(file: File) {
	try {
		// Upload to Cloudinary instead of Appwrite storage
		const uploadedFile = await uploadToCloudinary(file);
		return uploadedFile;
	} catch (error) {
		console.log(error)
	}
}

export function getFilePreview(fileId: string, isProfileImage = false) {
	try {
		// Get optimized image URL from Cloudinary
		// Use profile image transformation for profile pictures
		const fileUrl = isProfileImage
			? getProfileImageUrl(fileId)
			: getOptimizedImageUrl(fileId);
		return fileUrl;
	} catch (error) {
		console.log(error)
	}
}

export async function deleteFile(fileId: string) {
	try {
		// Delete from Cloudinary instead of Appwrite storage
		const result = await deleteFromCloudinary(fileId);
		return result;
	} catch (error) {
		console.log(error)
	}
}

export async function getRecentPosts() {
	// Reduce initial load to 10 posts instead of 20
	const posts = await databases.listDocuments(
		appwriteConfig.databaseId,
		appwriteConfig.postCollectionId,
		[Query.orderDesc('$createdAt'), Query.limit(10)]
	)
	if (!posts) throw Error

	return posts
}

export async function likePost(postId: string, likesArray: string[]) {
	try {
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId,
			{
				likes: likesArray
			}
		)
		if (!updatedPost) throw Error
		return updatedPost
	} catch (error) {
		console.log(error)
	}
}

export async function savePost(postId: string, userId: string) {
	try {
		const updatedPost = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			ID.unique(),
			{
				user: userId,
				post: postId
			}
		)
		if (!updatedPost) throw Error
		return updatedPost
	} catch (error) {
		console.log(error)
	}
}

export async function deleteSavedPost(savedRecordId: string) {
	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.savesCollectionId,
			savedRecordId,
		)
		if (!statusCode) throw Error
		return { status: "ok" }
	} catch (error) {
		console.log(error)
	}
}

export async function getPostById(postId: string) {
	try {
		const post = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		)
		return post
	} catch (error) {
		console.log(error)
	}
}

export async function updatePost(post: IUpdatePost) {
	const hasFileToUpdate = post.file.length > 0
	try {
		let image = {
			imageUrl: post.imageUrl,
			imageId: post.imageId
		}

		if (hasFileToUpdate) {
			// Upload new file to Cloudinary
			const uploadedFile = await uploadFile(post.file[0])
			if (!uploadedFile) throw Error

			// Get optimized file URL directly from Cloudinary response
			const fileUrl = uploadedFile.url

			if (!fileUrl) {
				deleteFile(uploadedFile.$id)
				throw Error
			}

			// If we're updating the image, delete the old one first
			if (post.imageId) {
				await deleteFile(post.imageId)
			}

			image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
		}

		//convert tags into an array
		const tags = post.tags?.replace(/ /g, '').split(',') || []

		//save post to database 
		const updatedPost = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			post.postId,
			{
				caption: post.caption,
				imageUrl: image.imageUrl,
				imageId: image.imageId,
				location: post.location,
				tags: tags
			}
		)
		if (!updatedPost) {
			// If update fails and we uploaded a new image, delete it
			if (hasFileToUpdate) {
				await deleteFile(image.imageId)
			}
			throw Error
		}

		return updatedPost
	} catch (error) {
		console.log(error)
	}
}

export async function deletePost(postId: string, imageId: string) {
	if (!postId || !imageId) return;

	try {
		const statusCode = await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			postId
		);

		if (!statusCode) throw Error;

		await deleteFile(imageId);

		return { status: "Ok" };
	} catch (error) {
		console.log(error);
	}
}


export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
	// Reduce initial load to 10 posts instead of 20
	const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]

	if (pageParam) {
		queries.push(Query.cursorAfter(pageParam.toString()))
	}

	try {
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			queries
		)

		if (!posts) throw Error

		return posts
	} catch (error) {
		console.log(error)
	}
}

export async function searchPosts(searchTerm: string) {
	try {
		// Limit search results to 10 posts for faster loading
		const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			[Query.search('caption', searchTerm), Query.limit(10)]
		)

		if (!posts) throw Error

		return posts
	} catch (error) {
		console.log(error)
	}
}

export async function getUserById(userId: string) {
	try {
		const user = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			userId
		)

		if (!user) throw Error
		return user

	} catch (error) {
		console.log(error)
	}
}

export async function updateUser(user: IUpdateUser) {
	const hasFileToUpdate = user.file.length > 0;
	try {
		let image = {
			imageUrl: user.imageUrl,
			imageId: user.imageId,
		};

		if (hasFileToUpdate) {
			// Upload new file to Cloudinary
			const uploadedFile = await uploadFile(user.file[0]);
			if (!uploadedFile) throw Error;

			// Get profile image URL with circular transformation
			const fileUrl = getProfileImageUrl(uploadedFile.$id);
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id);
				throw Error;
			}
			const profileUrl = fileUrl as string;

			// If we're updating the image, delete the old one first
			if (user.imageId) {
				await deleteFile(user.imageId);
			}

			image = { ...image, imageUrl: profileUrl, imageId: uploadedFile.$id };
		}

		//  Update user
		const updatedUser = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			user.userId,
			{
				name: user.name,
				bio: user.bio,
				username: user.username,
				email: user.email,
				imageUrl: image.imageUrl,
				imageId: image.imageId,
			}
		);

		// Failed to update
		if (!updatedUser) {
			// Delete new file that has been recently uploaded
			if (hasFileToUpdate) {
				await deleteFile(image.imageId);
			}
			// If no new file uploaded, just throw error
			throw Error;
		}

		return updatedUser;
	} catch (error) {
		console.log(error);
	}
}

export async function getUserPosts(userId?: string) {
	if (!userId) return;

	try {
		// Limit initial load to 10 posts for faster loading
		const post = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			[Query.equal("creator", userId), Query.orderDesc("$createdAt"), Query.limit(10)]
		);

		if (!post) throw Error;

		return post;
	} catch (error) {
		console.log(error);
	}
}

export async function getUsers(limit?: number) {
	const queries: any[] = [Query.orderDesc("$createdAt")];

	if (limit) {
		queries.push(Query.limit(limit));
	}

	try {
		const users = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.userCollectionId,
			queries
		);

		if (!users) throw Error;

		return users;
	} catch (error) {
		console.log(error);
	}
}
