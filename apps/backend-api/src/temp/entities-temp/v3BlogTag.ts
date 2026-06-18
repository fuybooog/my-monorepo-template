import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("v3_blog_tag", { schema: "mydb" })
export class V3BlogTag {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "tag_id", nullable: true })
  tagId: number | null;

  @Column("int", { name: "blog_id", nullable: true })
  blogId: number | null;
}
