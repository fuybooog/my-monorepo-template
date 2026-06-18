import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("id_UNIQUE", ["id"], { unique: true })
@Entity("chat_room_user", { schema: "mydb" })
export class ChatRoomUser {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "room_id", nullable: true, length: 45 })
  roomId: string | null;

  @Column("varchar", { name: "user_id", nullable: true, length: 45 })
  userId: string | null;

  @Column("varchar", { name: "role", nullable: true, length: 45 })
  role: string | null;

  @Column("varchar", { name: "alias", nullable: true, length: 45 })
  alias: string | null;
}
