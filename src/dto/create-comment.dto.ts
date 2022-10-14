export class CreateCommentDto {
  readonly content: string;
  createdBy: string;
  postId: string;
  parentCommentId?: string;
}
