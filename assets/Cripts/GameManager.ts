import {
  _decorator,
  Component,
  Prefab,
  instantiate,
  Node,
  CCInteger,
  Vec3,
  Label,
} from 'cc';
import { PlayerController } from "./PlayerController";
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_STONE,
}
enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Prefab })
  public cubePrfb: Prefab | null = null;
  @property({ type: CCInteger })
  public roadLength: Number = 50;
  private _road: number[] = [];
  @property({ type: Node })
  public startMenu: Node | null = null;
  @property({ type: PlayerController })
  public playerCtrl: PlayerController | null = null;
  private _curState: GameState = GameState.GS_INIT;
  @property({ type: Label })
  public stepsLabel: Label | null = null;

  start() {
    this.curState = GameState.GS_INIT;
    this.playerCtrl?.node.on("JumEnd", this.onPlayerJumpEnd, this);
  }

  init() {
    if (this.startMenu) {
      this.startMenu.active = true;
    }
    this.generateRoad();

    if (this.playerCtrl) {
      this.playerCtrl.setInputActive(false);
      this.playerCtrl.node.setPosition(Vec3.ZERO);
      this.playerCtrl.reset();
    }
  }

  set curState(value: GameState) {
    switch (value) {
      case GameState.GS_INIT:
        this.init();
        break;

      case GameState.GS_PLAYING:
        if (this.startMenu) {
          this.startMenu.active = false;
        }
        if (this.stepsLabel) {
          //  reset the number of steps to 0
          this.stepsLabel.string = "0";
        }
        // set active directly to start listening for mouse events directly
        setTimeout(() => {
          if (this.playerCtrl) {
            this.playerCtrl.setInputActive(true);
          }
        }, 0.1);
        break;

      case GameState.GS_END:
        break;
    }
    this._curState = value;
  }
  generateRoad() {
    this.node.removeAllChildren();

    this._road = [];
    // startPos
    this._road.push(BlockType.BT_STONE);

    for (let i = 1; i < this.roadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE);
      } else {
        this._road.push(Math.floor(Math.random() * 2));
      }
    }

    for (let j = 0; j < this._road.length; j++) {
      let block: Node = this.spawnBlockByType(this._road[j]);
      if (block) {
        this.node.addChild(block);
        block.setPosition(j, -1.5, 0);
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    if (!this.cubePrfb) {
      return null;
    }

    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_STONE:
        block = instantiate(this.cubePrfb);
        break;
    }

    return block;
  }

  onStartButtonClicked() {
    this.curState = GameState.GS_PLAYING;
  }

  checkResult(moveIndex: number) {
    if (moveIndex <= this.roadLength) {
      // Jump to the empty square
      if (this._road[moveIndex] == BlockType.BT_NONE) {
        this.curState = GameState.GS_INIT;
      }
    } else {
      // skipped the maximum length
      this.curState = GameState.GS_INIT;
    }
  }

  onPlayerJumpEnd(moveIndex: number) {
    if (this.stepsLabel) {
      this.stepsLabel.string = "" + moveIndex;
    }
    this.checkResult(moveIndex);
  }
}
