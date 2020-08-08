import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Post, PostsView} from '../models/Post';
import {environment} from '../../environments/environment';
import {BehaviorSubject, Subject, throwError} from 'rxjs';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import {map, pluck, switchMap} from 'rxjs/operators';
import {getImageFileFromBlob} from '../extras/imageHandler';


@Injectable({
  providedIn: 'root'
})
export class PostsService {
  onPostSubmitted: Subject<boolean> = new Subject<boolean>();
  postViewSubject: BehaviorSubject<Post> = new BehaviorSubject<Post>(null);

  constructor(private httpClient: HttpClient,
              private apollo: Apollo) {
  }

  public getPosts(pageIndex: number = 0, pageSize: number = 4) {
    const query =
    gql`
      query {
        posts(pageIndex: ${pageIndex}, pageSize: ${pageSize}){
          posts {
            _id
            content
            createdDate
            creatorName
            title
            image
            updatedDate
            userId
          }
          length
        }
      }
    `;
    return this.apollo.query<{ posts: PostsView }>({query, fetchPolicy: 'network-only'})
      .pipe(pluck('data', 'posts'));
  }

  public createPost(postData: Post) {
    const mutation =
    gql`
      mutation createPost($input: PostInputData!) {
        createPost(postInput: $input) {
          post {
            _id
            userId
          }
          success
        }
      }
    `;
    return this.apollo.mutate<{ createPost: { post: { _id: string, userId: string }, success: boolean } }>({
      mutation,
      variables: {
        input: {
          title: postData.title,
          content: postData.content,
          image: postData.image
        }
      }
    }).pipe(pluck('data', 'createPost'));
  }

  public editPost(postId: string, postData: Post) {
    const mutation =
    gql`
      mutation editPost($input: PostEditInputData!) {
        editPost(postEditInput: $input) {
          post {
            _id
            userId
          }
          success
        }
      }
    `;
    return this.apollo.mutate<{ editPost: { post: Post, success?: boolean } }>({
      mutation,
      variables: {
        input: {
          postInput: {
            title: postData.title,
            image: postData.image,
            content: postData.content,
            createdDate: postData.createdDate,
          },
          postId
        }
      }
    }).pipe(pluck('data', 'editPost'));
  }

  public deletePost(postId: string) {
    const mutation =
    gql`
      mutation {
        deletePost(postId: "${postId}"){
          success
        }
      }
    `;
    return this.apollo.mutate<{ deletePost: { success: boolean, post?: Post } }>({mutation})
      .pipe(pluck('data', 'deletePost'));
  }

  public getPost(postId: string) {
    const query =
    gql`
      query post($postId: String!) {
        post(postID: $postId){
          success
          post {
            _id
            content
            createdDate
            creatorName
            image
            title
            updatedDate
            userId
          }
        }
      }
    `;
    return this.apollo.query<{ post: { success: boolean, post: Post } }>({query, variables: {postId}})
      .pipe(pluck('data', 'post'));
  }

  private putUploadImage(ImageFile: FormData) {
    return this.httpClient.put<{ message: string, imagePath?: string }>(`${environment.apiUrl}/put-image`, ImageFile);
  }

  public uploadImage(image: FormData) {
    return this.putUploadImage(image)
      .pipe
      (
        map(response => {
          if (response.imagePath) {
            return response.imagePath;
          }
          return throwError(new Error(response.message));
        })
      );
  }

  public uploadWithImageUrl(image: string) {
    return this.getImageUrlAsFile(image)
      .pipe
      (
        map(file => {
          const imageFile = new FormData();
          imageFile.append('image', file, file.name);
          return imageFile;
        }),
        switchMap(imageFile => {
          return this.uploadImage(imageFile);
        })
      );
  }

  private getImageUrlAsFile(imageUrl: string) {
    return this.httpClient.post(`${environment.apiUrl}/get-image-url`, {imageUrl}, {
      responseType: 'blob'
    }).pipe
    (
      map(blobResponse => {
        if (blobResponse.type.startsWith('image')) {
          return getImageFileFromBlob(imageUrl, blobResponse);
        }
        return null;
      })
    );
  }

  public getImageFile(imagePath: string) {
    return this.httpClient.post(`${environment.apiUrl}/get-image`, {image: imagePath}, {
      responseType: 'blob'
    });
  }
}
