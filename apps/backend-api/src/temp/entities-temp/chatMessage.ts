import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Entity("chat_message", { schema: "mydb" })
export class ChatMessage {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "send_user_id", nullable: true, length: 45 })
  sendUserId: string | null;

  @Column("varchar", { name: "content", nullable: true, length: 45 })
  content: string | null;

  @Column("varchar", { name: "to_user_id", nullable: true, length: 45 })
  toUserId: string | null;

  @Column("varchar", { name: "to_room_id", nullable: true, length: 45 })
  toRoomId: string | null;

  @Column("datetime", { name: "send_at", nullable: true })
  sendAt: Date | null;

  @Column("varchar", { name: "status", nullable: true, length: 45 })
  status: string | null;
}
