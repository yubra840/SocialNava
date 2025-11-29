import { Client, Account, Databases, Realtime, Storage, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

 const account = new Account(client);
 const databases = new Databases(client);
 const storage = new Storage(client);
 const realtime = new Realtime(client);
 const DATABASE_ID = (import.meta.env.VITE_APPWRITE_DATABASE_ID);
 const POSTS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID);
 const USERS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID);
 const MESSAGES_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID);
 const BUCKET_ID = (import.meta.env.VITE_APPWRITE_BUCKET_ID);
 const COMMENTS_COLLECTION_ID = (import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID);


export { client, account, databases, realtime, storage, ID, DATABASE_ID, POSTS_COLLECTION_ID, USERS_COLLECTION_ID, MESSAGES_COLLECTION_ID, BUCKET_ID, COMMENTS_COLLECTION_ID };
