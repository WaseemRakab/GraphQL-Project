import ObjectID from 'bson-objectid';

export class Post {
  // tslint:disable-next-line:variable-name
  _id?: string | ObjectID;
  title: string;
  userId?: string;
  createdDate: string;
  updatedDate: string;
  creatorName?: string;
  image: string;
  content: string;
}

export interface PostsView {
  posts: Post[];
  length: number;
}
