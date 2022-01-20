import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEventPattern, Observable, of, reduce } from 'rxjs';
import { Board, BoardtoString, Board_RO, C, charToTurn, cToString, GameState, getEmptyBoard, PlayImpact, ReversiModelInterface, TileCoords, Turn } from './ReversiDefinitions';

@Injectable({
  providedIn: 'root'
})
export class ReversiGameEngineService implements ReversiModelInterface {
  // NE PAS MODIFIER
  protected gameStateSubj = new BehaviorSubject<GameState>({
    board: getEmptyBoard(),
    turn: 'Player1'
  });
  public readonly gameStateObs: Observable<GameState> = this.gameStateSubj.asObservable();

  // NE PAS MODIFIER
  constructor() {
    this.restart();
    // NE PAS TOUCHER, POUR LE DEBUG DANS LA CONSOLE
    (window as any).RGS = this;
    console.log("Utilisez RGS pour accéder à l'instance de service ReversiGameEngineService.\nExemple : RGS.résuméDebug()")
  }

  résuméDebug(): void {
    console.log(`________
${BoardtoString(this.board)}
________
Au tour de ${this.turn}
X représente ${charToTurn('X')}
O représente ${charToTurn('O')}
________
Coups possibles (${this.whereCanPlay().length}) :
${this.whereCanPlay().map(P => `  * ${P}`).join("\n")}
    `);
  }

  // NE PAS MODIFIER
  get turn(): Turn {
    return this.gameStateSubj.value.turn;
  }

  get board(): Board_RO {
    return this.gameStateSubj.value.board;
  }

  // NE PAS MODIFIER
  restart({ turn, board }: Partial<GameState> = {}): void {
    const gs = this.initGameState();
    let newBoard: Board;
    let newTurn: Turn;

    newBoard = !!board ? board.map(L => [...L]) as Board : gs.board as Board;
    newTurn = turn ?? gs.turn;

    this.gameStateSubj.next({
      turn: newTurn,
      board: newBoard
    });
  }

  // NE PAS MODIFIER
  play(i: number, j: number): void {
    const { board: b1, turn: t1 } = this.gameStateSubj.value;
    const { board: b2, turn: t2 } = this.tryPlay(i, j);
    if (b1 !== b2 || t1 !== t2) {
      this.gameStateSubj.next({
        turn: t2,
        board: b2
      });
      if (!this.canPlay()) {
        this.gameStateSubj.next({
          turn: t2 === 'Player1' ? 'Player2' : 'Player1',
          board: b2
        });

      }
    }
    console.log(this.board.map(L => L.map(C => cToString(C)))) 
  
  }

  //_______________________________________________________________________________________________________
  //__________________________________________ MODIFICATIONS ICI __________________________________________
  //_______________________________________________________________________________________________________

  /**
   * initGameState initialise un nouveau plateau à l'état initiale (2 pions de chaque couleurs).\
   * Initialise aussi le joueur courant.
   * @returns L'état initiale du jeu, avec les 4 pions initiaux bien placés.
   */
  private initGameState(): GameState {
    const board = getEmptyBoard();
    board[3][3] = board[4][4] = "Player2";
    // board[3][3] = board[4][4] = board[2][5] = "Player2";
    board[4][3] = board[3][4] = "Player1";
    return { turn: this.turn, board: board };
  }

  /**
   * Renvoie la liste des positions qui seront prises si on pose un pion du joueur courant en position i,j
   * @param i Indice de la ligne où poser le pion
   * @param j Indice de la colonne où poser le pion
   * @returns Une liste des positions qui seront prise si le pion est posée en x,y
   */
  PionsTakenIfPlayAt(i: number, j: number): PlayImpact {
    const L: TileCoords[] = []
    var joueurAdverse = ''
    var joueur = ''
    if (this.turn === 'Player1') {
      joueurAdverse = 'Player2'
      joueur = this.turn
    } else {
      joueurAdverse = 'Player1'
      joueur = this.turn
    }


    var temp: TileCoords[] = []
    //ligne
    if (i < 7 && this.board[i + 1][j] === joueurAdverse) {
      var t: number = i + 1
      while (t < 7 && this.board[t][j] === joueurAdverse) {
        let coord: TileCoords = [t, j]
        temp.push(coord)
        t++
      }
      if (this.board[t][j] === joueur) {
        temp.map((val) => L.push(val));
      }
      temp = [];

    }

    if (i > 0 && this.board[i - 1][j] === joueurAdverse) {
      var t: number = i - 1
      while (t > 0 && this.board[t][j] === joueurAdverse) {
        let coord: TileCoords = [t, j]
        temp.push(coord)
        t--
      }
      if (this.board[t][j] === joueur) {
        temp.map((val) => L.push(val));
      }
      temp = [];
    }

    // colonne 
    if (j < 7 && this.board[i][j + 1] === joueurAdverse) {
      var t: number = j + 1
      while (t < 7 && this.board[i][t] === joueurAdverse) {
        let coord: TileCoords = [i, t]
        temp.push(coord)
        t++
      }
      if (this.board[i][t] === joueur) {
        temp.map((val) => L.push(val));

      }
      temp = [];
    }

    if (j > 0 && this.board[i][j - 1] === joueurAdverse) {
      var t: number = j - 1
      while (t > 0 && this.board[i][t] === joueurAdverse) {
        let coord: TileCoords = [i, t]
        temp.push(coord)
        t--
      }
      if (this.board[i][t] === joueur) {
        temp.map((val) => L.push(val));


      }
      temp = [];
    }

    //en haut a droite 
    if (i < 7 && j > 0 && this.board[i + 1][j - 1] === joueurAdverse) {
      var ti: number = i + 1
      var tj: number = j - 1
      while (ti < 7 && tj > 0 && this.board[ti][tj] === joueurAdverse) {
        let coord: TileCoords = [ti, tj]
        temp.push(coord)
        ti++
        tj--
      }
      if (this.board[ti][tj] === joueur) {
        temp.map((val) => L.push(val));

      }
      temp = [];
    }
    // en haut à gauche 
    if (i > 0 && j > 0 && this.board[i - 1][j - 1] === joueurAdverse) {
      var ti: number = i - 1
      var tj: number = j - 1
      while (ti > 0 && tj > 0 && this.board[ti][tj] === joueurAdverse) {
        let coord: TileCoords = [ti, tj]
        temp.push(coord)
        ti--
        tj--
      }
      if (this.board[ti][tj] === joueur) {
        temp.map((val) => L.push(val));

      }
      temp = [];
    }

    // bas gauche 
    if (i > 0 && j < 7 && this.board[i - 1][j + 1] === joueurAdverse) {
      var ti: number = i - 1
      var tj: number = j + 1
      while (ti > 0 && tj < 7 && this.board[ti][tj] === joueurAdverse) {
        let coord: TileCoords = [ti, tj]
        temp.push(coord)
        ti--
        tj++
      }
      if (this.board[ti][tj] === joueur) {
        temp.map((val) => L.push(val));

      }
      temp = [];
    }

    //bas droite 
    if (i < 7 && j < 7 && this.board[i + 1][j + 1] === joueurAdverse) {
      var ti: number = i + 1
      var tj: number = j + 1
      while (ti < 7 && tj < 7 && this.board[ti][tj] === joueurAdverse) {
        let coord: TileCoords = [ti, tj]
        temp.push(coord)
        ti++
        tj++
      }
      if (this.board[ti][tj] === joueur) {
        temp.map((val) => L.push(val));
      } else {
        temp = [];
      }
    }

    //console.log(L)
    return L;
  }

  /**
   * Liste les positions pour lesquels le joueur courant pourra prendre des pions adverse.
   * Il s'agit donc des coups possibles pour le joueur courant.
   * @returns liste des positions jouables par le joueur courant.
   */
  whereCanPlay(): readonly TileCoords[] {
    const L: TileCoords[] = [];
    this.board.forEach((element, i) => {
      element.forEach((e, j) => {
        if (this.board[i][j] === 'Empty') {
          if (this.PionsTakenIfPlayAt(i, j).length > 0) {
            let temp: TileCoords = [i, j];
            L.push(temp)
          }
        }
      });
    });
    return L;
  }

  /**
   * Le joueur courant pose un pion en i,j.
   * Si le coup n'est pas possible (aucune position de prise), alors le pion n'est pas joué et le tour ne change pas.
   * Sinon les positions sont prises et le tour de jeu change.
   * @param i L'indice de la ligne où poser le pion.
   * @param j L'indice de la colonen où poser le pion.
   * @returns Le nouvel état de jeu si le joueur courant joue en i,j, l'ancien état si il ne peut pas jouer en i,j
   */
  private tryPlay(i: number, j: number): GameState {
    var peutJouer: TileCoords[] = [...this.whereCanPlay()]
    let newTurn: Turn
    let newBoard: Board
    var y: number = 0;
    var bool: boolean = false
    var vaPrendre: TileCoords[] = []

    while (y < peutJouer.length && bool === false) {
      if (peutJouer[y][0] === i && peutJouer[y][1] === j) {
        bool = true
        vaPrendre = [...this.PionsTakenIfPlayAt(i, j)]
      }
      y++
    }
    if (bool === true) {
      newBoard = getEmptyBoard() // créer une board vide
      newBoard.map((C, y) => C.map((L, i) => newBoard[y][i] = this.board[y][i])) // remet toute la board actuel
      newBoard[i][j] = this.turn // la poosition est correcte, ajoute du pion sur la position
      vaPrendre.map(aPrendre => newBoard[aPrendre[0]][aPrendre[1]] = this.turn) // modification de la board des pions pris
      
      // changement de tour
      if (this.turn === 'Player1') {
        newTurn = 'Player2';
      } else {
        newTurn = 'Player1'
      }
      return { turn: newTurn, board: newBoard };

    } else {
      newTurn = this.turn;
      return { turn: newTurn, board: this.board };
    }
  }

  /**
   * @returns vrai si le joueur courant peut jouer quelque part, faux sinon.
   */
  private canPlay(): boolean {
    var res: boolean = false;
    if (this.whereCanPlay().length > 0) {
      res = true
    }
    return res;
  }
}
