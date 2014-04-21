# HexWars

In-development HTML5 turn-based-strategy game.

This game is heavily in development and based on the Crafty JS Game engine.


## How to play

Each turn you receive a numbered tile to place anywhere on the board. If this tile is placed ajacent to any of your other tiles, if will strengthen them (+1 to score), If it is adjacent to an enemy tile, it will weaken them (-1 to their score). When the board is full, the player with the highest score wins


### Dev version notes

- No win/lose board is ever displayed. When the board is full, if your score is higehr than the AI you win!
- On-line multiplayer has been worked on, but been disabled in this version due to the number of bugs
- The AI **ALWAYS** picks the best place it can possibly place a tile during its turn -- It is therefore only possible to win if you play perfectly and have slightly better starting tiles.
