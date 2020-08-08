import {Injectable} from '@angular/core';
import {WebsocketService} from '../websocket/websocket.service';
import {Subject} from 'rxjs';
import {Post} from '../models/Post';
import Emitter = SocketIOClient.Emitter;


export type ChangePostActions = 'Create' | 'Edit' | 'Delete';

@Injectable({
  providedIn: 'root'
})
export class PostsWebsocketService {

  private postsChangedEmitter: Emitter;

  private readonly postsChange: Subject<{ action: ChangePostActions, post: Post, postId?: string }>;

  constructor(private socket: WebsocketService) {
    this.postsChange = new Subject<{ action: ChangePostActions, post: Post, postId?: string }>();
  }

  get onPostsChange(): Subject<{ action: ChangePostActions, post: Post, postId?: string }> {
    this.listenToPostChanges();
    return this.postsChange;
  }

  private listenToPostChanges() {
    if (!this.postsChangedEmitter) {
      this.postsChangedEmitter =
        this.socket.io.on('postsChanged', (changedValue: { action: ChangePostActions, post: Post, postId?: string }) => {
          return this.postsChange.next(changedValue);
        });
    }
  }
}
