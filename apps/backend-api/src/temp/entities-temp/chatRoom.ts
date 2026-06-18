import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("chat_room", { schema: "mydb" })
export class ChatRoom {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "unique_code", nullable: true, length: 45 })
  uniqueCode: string | null;

  @Column("varchar", { name: "name", nullable: true, length: 45 })
  name: string | null;
}
