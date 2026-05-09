import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type { ClientMessage, ServerMessage, Position, PlayerState } from "@kakurenbo/shared";

const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

type PlayerRecord = {
  name: string;
  position: Position;
  state: PlayerState;
  roomId: string;
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN },
});

const players = new Map<string, PlayerRecord>();

io.on("connection", (socket) => {
  socket.on("message", (msg: ClientMessage) => {
    if (msg.type === "join") {
      const { roomId, playerName } = msg;

      socket.join(roomId);
      players.set(socket.id, {
        name: playerName,
        position: { x: 0, y: 0 },
        state: "waiting",
        roomId,
      });

      const existingPlayers = [...players.entries()]
        .filter(([id, p]) => id !== socket.id && p.roomId === roomId)
        .map(([id, p]) => ({ id, name: p.name, position: p.position, state: p.state }));

      const joined: ServerMessage = {
        type: "room_joined",
        playerId: socket.id,
        players: existingPlayers,
      };
      socket.emit("message", joined);

      const playerJoined: ServerMessage = {
        type: "player_joined",
        player: { id: socket.id, name: playerName, position: { x: 0, y: 0 }, state: "waiting" },
      };
      socket.to(roomId).emit("message", playerJoined);
    }

    if (msg.type === "move") {
      const player = players.get(socket.id);
      if (!player) return;
      player.position = msg.position;
      player.state = "moving";

      const moved: ServerMessage = {
        type: "player_moved",
        playerId: socket.id,
        position: msg.position,
      };
      socket.to(player.roomId).emit("message", moved);
    }

    if (msg.type === "hide") {
      const player = players.get(socket.id);
      if (!player) return;
      player.state = "hiding";

      const hidden: ServerMessage = { type: "player_hidden", playerId: socket.id };
      socket.to(player.roomId).emit("message", hidden);
    }

    if (msg.type === "stamp") {
      const player = players.get(socket.id);
      if (!player) return;

      const stamp: ServerMessage = { type: "stamp_received", playerId: socket.id, stampId: msg.stampId };
      socket.to(player.roomId).emit("message", stamp);
    }
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    if (!player) return;
    const { roomId } = player;
    players.delete(socket.id);

    const left: ServerMessage = { type: "player_left", playerId: socket.id };
    socket.to(roomId).emit("message", left);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
