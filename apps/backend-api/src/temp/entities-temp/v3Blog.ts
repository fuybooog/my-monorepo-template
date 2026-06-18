import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("v3_blog", { schema: "mydb" })
export class V3Blog {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", {
    name: "user_id",
    nullable: true,
    comment: "作者",
    length: 100,
  })
  userId: string | null;

  @Column("varchar", {
    name: "title",
    nullable: true,
    comment: "标题",
    length: 300,
  })
  title: string | null;

  @Column("varchar", {
    name: "summary",
    nullable: true,
    comment: "简介",
    length: 100,
  })
  summary: string | null;

  @Column("text", { name: "content", nullable: true, comment: "帖子内容" })
  content: string | null;

  @Column("int", { name: "view_count", nullable: true, comment: "浏览次数" })
  viewCount: number | null;

  @Column("int", { name: "like_count", nullable: true, comment: "点赞数" })
  likeCount: number | null;

  @Column("int", { name: "comment_count", nullable: true, comment: "评论数" })
  commentCount: number | null;

  @Column("int", {
    name: "status",
    nullable: true,
    comment: "状态 1：已发布，2：草稿，3：隐藏",
  })
  status: number | null;

  @Column("varchar", {
    name: "type",
    nullable: true,
    comment: "类别",
    length: 100,
  })
  type: string | null;

  @Column("varchar", {
    name: "is_top",
    nullable: true,
    comment: "是否置顶 Y：是；N：不是； 空：不是",
    length: 1,
  })
  isTop: string | null;

  @Column("varchar", {
    name: "subject",
    nullable: true,
    comment: "话题",
    length: 100,
  })
  subject: string | null;

  @Column("varchar", {
    name: "cover_file_id",
    nullable: true,
    comment: "封面",
    length: 100,
  })
  coverFileId: string | null;

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    comment: "创建时间",
  })
  createdAt: Date | null;

  @Column("datetime", {
    name: "updated_at",
    nullable: true,
    comment: "修改时间",
  })
  updatedAt: Date | null;
}
