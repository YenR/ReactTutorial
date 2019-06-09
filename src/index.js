import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className ={props.className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    // normal square
    renderSquare(i) {
      return (<Square
          className={"square"}
          key={i.toString()}
          value={this.props.squares[i]}
          onClick = {() => this.props.onClick(i)}
      />);
    }

    // highlighted as part of the winning squares
    renderHighlightedSquare(i) {
        return (<Square
            className={"square_highlighted"}
            key={i.toString()}
            value={this.props.squares[i]}
            onClick = {() => this.props.onClick(i)}
        />);
    }

    render() {
        //improved code, functionally same as below but with extendable loops
        return (
            <div key ={'mainboard'}>
            {
                [0,1,2].map( (i) => {
                    return(
                        <div className="board-row" key={'board' + i}>
                        {
                            [0,1,2].map( (j) => {
                                let squareID = (i*3+j);         // the 3 is still hardcoded
                                if(calculateWinner(this.props.squares) && winningTile(this.props.squares, squareID))
                                {
                                    //console.log('square ' + squareID + ' is a winning square')
                                    return this.renderHighlightedSquare(squareID);
                                }
                                return this.renderSquare(squareID);
                            })
                        }
                        </div>
                    );
                })
            }
            </div>
        );

        // return (
        //   <div>
        //     <div className="board-row">
        //       {this.renderSquare(0)}
        //       {this.renderSquare(1)}
        //       {this.renderSquare(2)}
        //     </div>
        //     <div className="board-row">
        //       {this.renderSquare(3)}
        //       {this.renderSquare(4)}
        //       {this.renderSquare(5)}
        //     </div>
        //     <div className="board-row">
        //       {this.renderSquare(6)}
        //       {this.renderSquare(7)}
        //       {this.renderSquare(8)}
        //     </div>
        //   </div>
        // );
    }
}

class Game extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            xIsNext: true,
            stepNumber: 0,
            toggle: false,
        }
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step%2)===0,
        })
    }

    handleClick(i)
    {
        const history = this.state.history.slice(0, this.state.stepNumber +1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if(calculateWinner(squares) || squares[i])
            return;

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState(
            {
                history: history.concat([{
                            squares: squares,
                }]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
        });
    }

    /**
     * toggles between sorting history in descending or ascending order
     */
    clickToggle()
    {
        this.setState({toggle: !this.state.toggle});
        //console.log("toggled to: " + this.state.toggle);
    }

    render()
    {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const draw = calculateDraw(current.squares);

        const moves = history.map((step, move) => {
            // Description of button including move number, square that was changed and inserted symbol
            const desc = move ? 'Go to move #' + move + ' ' +
                findChange(history[move].squares, history[move-1].squares) +
                ((move%2)===0 ? ' O' : ' X')
                : 'Go to game start';

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}
                     style={
                         // if currently active step, make button text bold
                         (move === this.state.stepNumber) ? { fontWeight: 'bold' } : { fontWeight: 'normal' }
                     }>
                        {desc}
                    </button>
                </li>
            );
        });

        const toggleButton = <button onClick={() => this.clickToggle()}>{
            "Move Sorting Order: " + (this.state.toggle ? "Ascending" : "Descending")}
        </button>;

        if(this.state.toggle)
            moves.reverse();

        let status;
        if(winner) {
            status = 'Winner: ' + winner;
        }
        else if (draw)
        {
            status = "Draw";
        }
        else
        {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
          <div className="game">
            <div className="game-board">
              <Board
                squares = {current.squares}
                onClick = {(i) => this.handleClick(i)}
              />
            </div>
            <div className="game-info">
              <div>{status}</div>
              <div>{toggleButton}</div>
              <ol>{
                  moves
              }</ol>
            </div>
          </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

/**
 * finds the first possible change between two board states
 * given board states should preferably only differ in one square
 * returns '(???)' if no differences were found
 * @param squares1 first board state
 * @param squares2 second board state, does not matter if actually occurred before or after the first one
 * @returns {string} coordinates of the occurred change in format (x,y)
 */
function findChange(squares1, squares2)
{
    for(var i=0; i<9; i++)
    {
        if(squares1[i] !== squares2[i])
            return iToCoords(i);
    }
    //console.log('' + i + ', ' + squares1[0] + ', ' + squares2[0])
    return '(???)';
}

/**
 * translates a given number i to coordinates in String format (x,y)
 * @param i board tile id to be identified as coordinates (0 <= i <= 8)
 * @returns {string} translated into format (x,y) with (1 <= x,y <= 3)
 */
function iToCoords(i)
{
    let y;
    if(i<3)
        y = 0;
    else if(i<6)
        y = 1;
    else
        y = 2;

    return '(' + (i-3*y+1) + ', ' + (y+1) + ')'
}

/**
 * checks whether or not the square with the given number i is part of a winning line
 * based on the calculateWinner function below
 * @param squares the field of squares, should be in won condition
 * @param i the number of the field to be tested
 * @returns {boolean} true if field i was responsible for the win, false otherwise
 */
function winningTile(squares, i)
{
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let j = 0; j < lines.length; j++) {
        const [a, b, c] = lines[j];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            if(i === a || i === b || i === c)
                return true;
        }
    }
    return false;
}

/**
 * returns true if the game is a draw (no more moves and no winner)
 * @param squares current board state
 */
function calculateDraw(squares)
{
    for(let i of squares)
    {
        if(!i)
            return false;
    }
    if(calculateWinner(squares))    // redundant but for call safety
        return false;
    //console.log("draw detected");
    return true;
}

/**
 * borrowed function from tutorial
 * @param squares
 * @returns {null|*}
 */
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}