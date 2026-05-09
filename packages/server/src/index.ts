import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import type { ClientMessage, ServerMessage, Position, PlayerState } from "@kakurenbo/shared";

const PORT = 3001;

type PlayerRecord = {
  name: string;
  position: Position;
  state: PlayerState;
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

const players = new Map<string, PlayerRecord>();

io.on("connection", (socket) => {
  players.set(socket.id, { name: "", position: { x: 0, y: 0 }, state: "waiting" });

  socket.on("message", (msg: ClientMessage) => {
    if (msg.type === "join") {
      const player = players.get(socket.id)!;
      player.name = msg.playerName;

      const existingPlayers = [...players.entries()]
        .filter(([id]) => id !== socket.id)
        .map(([id, p]) => ({ id, name: p.name, position: p.position, state: p.state }));

      const joined: ServerMessage = {
        type: "room_joined",
        playerId: socket.id,
        players: existingPlayers,
      };
      socket.emit("message", joined);

      const playerJoined: ServerMessage = {
        type: "player_joined",
        player: { id: socket.id, name: player.name, position: player.position, state: player.state },
      };
      socket.broadcast.emit("message", playerJoined);
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
      socket.broadcast.emit("message", moved);
    }

    if (msg.type === "hide") {
      const player = players.get(socket.id);
      if (!player) return;
      player.state = "hiding";

      const hidden: ServerMessage = { type: "player_hidden", playerId: socket.id };
      socket.broadcast.emit("message", hidden);
    }
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    const left: ServerMessage = { type: "player_left", playerId: socket.id };
    socket.broadcast.emit("message", left);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
