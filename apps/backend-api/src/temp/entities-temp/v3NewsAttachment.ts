import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("v3_news_attachment", { schema: "mydb" })
export class V3NewsAttachment {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("bigint", { name: "news_id", nullable: true })
  newsId: string | null;

  @Column("bigint", { name: "attachment_file_id", nullable: true })
  attachmentFileId: string | null;
}
