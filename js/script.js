let startPosition = {
	board: [
		[-4, -2, -3, -5, -6, -3, -2, -4],
		[-1, -1, -1, -1, -1, -1, -1, -1],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1],
		[4, 2, 3, 5, 6, 3, 2, 4]
	],
	move: 0,
	shortCastleWhite: true,
	longCastleWhite: true,
	shortCastleBlack: true,
	longCastleBlack: true,
	moves50: 0,
	enPassant: -1,
};

let scale = 1;
let currentPosition = startPosition;

function showPossibleMoves(piece) {
	hidePossibleMoves(curPiece);
	let index = piece.index();
	let possibleMoves = getLegalPieceMoves(currentPosition, piecesData[index][0], piecesData[index][1]);
	possibleMoves.forEach(element => {
		$(".chess-board-square").eq(element[0]*8 + element[1]).addClass("chess-board-square-droppable");
	});
	piece.addClass("chess-board-piece-selected");
}

function hidePossibleMoves(piece) {
	$(".chess-board-square").removeClass("chess-board-square-droppable");
	if (!piece) return;
	piece.removeClass("chess-board-piece-selected");
}

function isElementWhite(piece) {
	return (piece.index() >= 16);
}

function isWhiteMove() {
	return chess.hasClass("chess-white");
}

let curPiece = null;
let squareWidth = "40px";
let chess = $(".chess");
let chessBoard = $(".chess-board");
let boardPieces = $(".chess-board-pieces .chess-board-piece");
let currentPromotion = {
	index: -1,
	toX: -1,
	side: -1,
	piece: -1,
	active: false
}
let hasGameEnded = false;

function moveElementTo(obj, x, y, promoteTo=-1) {
	let index = obj.index();
	if (((y == 7 && currentPosition.board[piecesData[index][0]][piecesData[index][1]] == -1) || (y == 0 && currentPosition.board[piecesData[index][0]][piecesData[index][1]] == 1)) && promoteTo == -1) {
		currentPromotion.index = index;
		currentPromotion.toX = x;
		currentPromotion.side = currentPosition.move;
		currentPromotion.piece = -1;
		currentPromotion.active = true;
		let promObj = $(".chess-white-promotion");
		let targetY = 0;
		if (currentPromotion.side == 1) {
			promObj = $(".chess-black-promotion");
			targetY = 3;
		}
		setElementPosition(obj, piecesData[index][1], piecesData[index][0]);
		setElementPosition(promObj, (chessBoard.hasClass("chess-board-rotated") ? 7-x : x), (chessBoard.hasClass("chess-board-rotated") ? 7-targetY : targetY));
		promObj.addClass("chess-on-promotion");
		return;
	}
	let sideMult = 1;
	let sideStr = "white";
	if (currentPosition.move == 1) {
		sideMult = -1;
		sideStr = "black";
	}
	switch (promoteTo) {
		case 0:
			obj.addClass(`chess-promoted-${sideStr}-queen`);
			currentPosition.board[piecesData[index][0]][piecesData[index][1]] = 5*sideMult;
			break;
		case 1:
			obj.addClass(`chess-promoted-${sideStr}-rook`);
			currentPosition.board[piecesData[index][0]][piecesData[index][1]] = 4*sideMult;
			break;
		case 2:
			obj.addClass(`chess-promoted-${sideStr}-bishop`);
			currentPosition.board[piecesData[index][0]][piecesData[index][1]] = 3*sideMult;
			break;
		case 3:
			obj.addClass(`chess-promoted-${sideStr}-knight`);
			currentPosition.board[piecesData[index][0]][piecesData[index][1]] = 2*sideMult;
			break;
	}
	$(".chess-board-square.chess-board-square-last").removeClass("chess-board-square-last");
	$(".chess-board-square").eq(piecesData[index][0]*8 + piecesData[index][1]).addClass("chess-board-square-last");
	$(".chess-board-square").eq(y*8 + x).addClass("chess-board-square-last");
	if (currentPosition.board[piecesData[index][0]][piecesData[index][1]] == 1) {
		if (currentPosition.enPassant == x && y == 2 && currentPosition.board[y][x] == 0)
			removePiece(x, y+1);
	}
	if (currentPosition.board[piecesData[index][0]][piecesData[index][1]] == -1) {
		if (currentPosition.enPassant == x && y == 5 && currentPosition.board[y][x] == 0)
			removePiece(x, y-1);
	}
	currentPosition.enPassant = -1;
	if (piecesData[index][0] == 1 && currentPosition.board[piecesData[index][0]][piecesData[index][1]] == -1) {
		currentPosition.enPassant = piecesData[index][1];
	}
	if (piecesData[index][0] == 6 && currentPosition.board[piecesData[index][0]][piecesData[index][1]] == 1) {
		currentPosition.enPassant = piecesData[index][1];
	}
	setPiecePosition(obj, x, y);
	if (currentPosition.longCastleBlack && index == 4 && x == 2) setPiecePosition($(".chess-board-piece").eq(0), 3, 0);
	if (currentPosition.shortCastleBlack && index == 4 && x == 6) setPiecePosition($(".chess-board-piece").eq(7), 5, 0);
	if (currentPosition.longCastleWhite && index == 28 && x == 2) setPiecePosition($(".chess-board-piece").eq(24), 3, 7);
	if (currentPosition.shortCastleWhite && index == 28 && x == 6) setPiecePosition($(".chess-board-piece").eq(31), 5, 7);
	if (index == 0 || index == 4) currentPosition.longCastleBlack = false;
	if (index == 7 || index == 4) currentPosition.shortCastleBlack = false;
	if (index == 24 || index == 28) currentPosition.longCastleWhite = false;
	if (index == 31 || index == 28) currentPosition.shortCastleWhite = false;
	currentPosition.move = (currentPosition.move + 1) % 2;
	$(".chess-board-piece-checked").removeClass("chess-board-piece-checked");
	if (currentPosition.move == 0) {
		if (isKingChecked(currentPosition, true)) {
			$(".chess-board-piece.chess-board-piece:nth-child(29)").addClass("chess-board-piece-checked");
		}
	} else {
		if (isKingChecked(currentPosition, false)) {
			$(".chess-board-piece.chess-board-piece:nth-child(5)").addClass("chess-board-piece-checked");
		}
	}
	if (getAllLegalMoves(currentPosition, (currentPosition.move == 0)).length == 0) {
		if (isKingChecked(currentPosition, (currentPosition.move == 0))) {
			$(".chess-text").text(`Checkmate! ${(currentPosition.move != 0) ? "White" : "Black"} Won`);
		} else {
			$(".chess-text").text("Stalemate! Draw");
			$(".chess").addClass("chess-gray");
		}
		hasGameEnded = true;
	} else {
		if (isWhiteMove()) {
			chess.removeClass("chess-white");
			chess.addClass("chess-black");
		} else {
			chess.addClass("chess-white");
			chess.removeClass("chess-black");
		}
	}
}

function removePiece(x, y) {
	let piece = boardPieces.eq(boardData[y][x]);
	if (boardData[y][x] == 0 || boardData[y][x] == 4) currentPosition.longCastleBlack = false;
	if (boardData[y][x] == 7 || boardData[y][x] == 4) currentPosition.shortCastleBlack = false;
	if (boardData[y][x] == 24 || boardData[y][x] == 28) currentPosition.longCastleWhite = false;
	if (boardData[y][x] == 31 || boardData[y][x] == 28) currentPosition.shortCastleWhite = false;
	piece.addClass("chess-board-piece-taken");
}

function setPiecePosition(obj, x, y) {
	setElementPosition(obj, x, y);
	let index = obj.index();
	let pieceID = currentPosition.board[piecesData[index][0]][piecesData[index][1]];
	boardData[piecesData[index][0]][piecesData[index][1]] = -1;
	currentPosition.board[piecesData[index][0]][piecesData[index][1]] = 0;
	piecesData[index] = [y, x];
	if (boardData[y][x] >= 0) {
		removePiece(x, y);
		piecesData[boardData[y][x]] = [-1, -1];
	}
	boardData[y][x] = index;
	currentPosition.board[y][x] = pieceID;
}

function setElementPosition(obj, x, y) {
	if (chessBoard.hasClass("chess-board-rotated"))
		obj.css({left: `calc(${squareWidth}*${7-x})`, top: `calc(${squareWidth}*${7-y})`});
	else
		obj.css({left: `calc(${squareWidth}*${x})`, top: `calc(${squareWidth}*${y})`});
}

let boardData = [
	[0, 1, 2, 3, 4, 5, 6, 7],
	[8, 9, 10, 11, 12, 13, 14, 15],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[16, 17, 18, 19, 20, 21, 22, 23],
	[24, 25, 26, 27, 28, 29, 30, 31]
];

function isKingChecked(position, isWhite) {
	let toReturn = false;
	for (let i=0; i<8; i++) {
		for (let j=0; j<8; j++) {
			if (position.board[i][j] == 0 || ((position.board[i][j] > 0) == isWhite)) continue;
			switch (Math.abs(position.board[i][j])) {
				case 1:
					if (!isWhite) {
						if (i != 0) {
							if (j != 0) {
								if (position.board[i-1][j-1] == -6)
									toReturn = true;
							}
							if (j != 7) {
								if (position.board[i-1][j+1] == -6)
									toReturn = true;
							}
						}
					} else {
						if (i != 7) {
							if (j != 0) {
								if (position.board[i+1][j-1] == 6)
									toReturn = true;
							}
							if (j != 7) {
								if (position.board[i+1][j+1] == 6)
									toReturn = true;
							}
						}
					}
					break;
				case 2:
					possible = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
					possible.forEach(element => {
						let newI = i+element[0], newJ = j+element[1];
						if (newI >= 0)
						if (newI < 8)
						if (newJ >= 0)
						if (newJ < 8)
						if ((isWhite && position.board[newI][newJ] == 6) || (!isWhite && position.board[newI][newJ] == -6))
						toReturn = true;
					});
					break;
				case 3:
					possible = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
					possible.forEach(element => {
						let newI = i, newJ = j;
						while (true) {
							newI += element[0];
							newJ += element[1];
							if (newI < 0) break;
							if (newI >= 8) break;
							if (newJ < 0) break;
							if (newJ >= 8) break;
							if (position.board[newI][newJ] != 0) {
								if ((isWhite && position.board[newI][newJ] == 6) || (!isWhite && position.board[newI][newJ] == -6)) {
									toReturn = true;
								}
								break;
							}
						}
					});
					break;
				case 4:
					possible = [[-1, 0], [1, 0], [0, -1], [0, 1]];
					possible.forEach(element => {
						let newI = i, newJ = j;
						while (true) {
							newI += element[0];
							newJ += element[1];
							if (newI < 0) break;
							if (newI >= 8) break;
							if (newJ < 0) break;
							if (newJ >= 8) break;
							if (position.board[newI][newJ] != 0) {
								if ((isWhite && position.board[newI][newJ] == 6) || (!isWhite && position.board[newI][newJ] == -6)) {
									toReturn = true;
								}
								break;
							}
						}
					});
					break;
				case 5:
					possible = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
					possible.forEach(element => {
						let newI = i, newJ = j;
						while (true) {
							newI += element[0];
							newJ += element[1];
							if (newI < 0) break;
							if (newI >= 8) break;
							if (newJ < 0) break;
							if (newJ >= 8) break;
							if (position.board[newI][newJ] != 0) {
								if ((isWhite && position.board[newI][newJ] == 6) || (!isWhite && position.board[newI][newJ] == -6)) {
									toReturn = true;
								}
								break;
							}
						}
					});
					break;
				case 6:
					for (let di=-1; di<=1; di++) {
						for (let dj=-1; dj<=1; dj++) {
							if (di == 0 && dj == 0) continue;
							let newI = i + di, newJ = j + dj;
							if (newI < 0) continue;
							if (newI >= 8) continue;
							if (newJ < 0) continue;
							if (newJ >= 8) continue;
							if ((isWhite && position.board[newI][newJ] == 6) || (!isWhite && position.board[newI][newJ] == -6)) toReturn = true;
						}
					}
					break;
			}
		}
	}
	return toReturn;
}

function getAllLegalMoves(position, isWhite) {
	let allMoves = [];
	for (let i=0; i<8; i++) {
		for (let j=0; j<8; j++) {
			if (position.board[i][j] == 0 || ((position.board[i][j] > 0) != isWhite)) continue;
			moves = getLegalPieceMoves(position, i, j);
			moves.forEach(move => {
				allMoves.push(move);
			});
		}
	}
	return allMoves;
}

function getLegalPieceMoves(position, i, j) {
	let moves = getPossiblePieceMoves(position, i, j);
	let legalMoves = [];
	moves.forEach(move => {
		let isLegal = true;
		let thatPiece = position.board[move[0]][move[1]];
		position.board[move[0]][move[1]] = position.board[i][j];
		position.board[i][j] = 0;
		if (isKingChecked(position, position.move == 0)) isLegal = false;
		position.board[i][j] = position.board[move[0]][move[1]];
		position.board[move[0]][move[1]] = thatPiece;
		if (isLegal && Math.abs(position.board[i][j]) == 6 && Math.abs(j-move[1]) > 1) {
			if (isKingChecked(position, position.move == 0)) isLegal = false;
			else {
				position.board[move[0]][j+Math.round((move[1]-j)/2)] = position.board[i][j];
				position.board[i][j] = 0;
				if (isKingChecked(position, position.move == 0)) isLegal = false;
				position.board[i][j] = position.board[move[0]][j+Math.round((move[1]-j)/2)];
				position.board[move[0]][j+Math.round((move[1]-j)/2)] = 0;
			}
		}
		if (isLegal) legalMoves.push(move);
	});
	return legalMoves;
}

function getPossiblePieceMoves(position, i, j) {
	let moves = [];
	let isWhite = (position.board[i][j] > 0);
	let possible = null;
	switch (Math.abs(position.board[i][j])) {
		case 1:
			if (isWhite) {
				if (i != 0) {
					if (position.board[i-1][j] == 0) {
						moves.push([i-1, j]);
						if (i == 6 && position.board[i-2][j] == 0) {
							moves.push([i-2, j]);
						}
					}
					if (j != 0) {
						if (position.board[i-1][j-1] < 0)
							moves.push([i-1, j-1]);
						if (position.enPassant == j-1 && i == 3)
							moves.push([i-1, j-1]);
					}
					if (j != 7) {
						if (position.board[i-1][j+1] < 0)
							moves.push([i-1, j+1]);
						if (position.enPassant == j+1 && i == 3)
							moves.push([i-1, j+1]);
					}
				}
			} else {
				if (i != 7) {
					if (position.board[i+1][j] == 0) {
						moves.push([i+1, j]);
						if (i == 1 && position.board[i+2][j] == 0) {
							moves.push([i+2, j]);
						}
					}
					if (j != 0) {
						if (position.board[i+1][j-1] > 0)
							moves.push([i+1, j-1]);
						if (position.enPassant == j-1 && i == 4)
							moves.push([i+1, j-1]);
					}
					if (j != 7) {
						if (position.board[i+1][j+1] > 0)
							moves.push([i+1, j+1]);
						if (position.enPassant == j+1 && i == 4)
							moves.push([i+1, j+1]);
					}
				}
			}
			break;
		case 2:
			possible = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
			possible.forEach(element => {
				let newI = i+element[0], newJ = j+element[1];
				if (newI >= 0)
				if (newI < 8)
				if (newJ >= 0)
				if (newJ < 8)
				if (position.board[newI][newJ] == 0 || isWhite != (position.board[newI][newJ] > 0))
				moves.push([newI, newJ]);
			});
			break;
		case 3:
			possible = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
			possible.forEach(element => {
				let newI = i, newJ = j;
				while (true) {
					newI += element[0];
					newJ += element[1];
					if (newI < 0) break;
					if (newI >= 8) break;
					if (newJ < 0) break;
					if (newJ >= 8) break;
					if (position.board[newI][newJ] != 0) {
						if (isWhite != (position.board[newI][newJ] > 0)) {
							moves.push([newI, newJ]);
						}
						break;
					}
					moves.push([newI, newJ]);
				}
			});
			break;
		case 4:
			possible = [[-1, 0], [1, 0], [0, -1], [0, 1]];
			possible.forEach(element => {
				let newI = i, newJ = j;
				while (true) {
					newI += element[0];
					newJ += element[1];
					if (newI < 0) break;
					if (newI >= 8) break;
					if (newJ < 0) break;
					if (newJ >= 8) break;
					if (position.board[newI][newJ] != 0) {
						if (isWhite != (position.board[newI][newJ] > 0)) {
							moves.push([newI, newJ]);
						}
						break;
					}
					moves.push([newI, newJ]);
				}
			});
			break;
		case 5:
			possible = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
			possible.forEach(element => {
				let newI = i, newJ = j;
				while (true) {
					newI += element[0];
					newJ += element[1];
					if (newI < 0) break;
					if (newI >= 8) break;
					if (newJ < 0) break;
					if (newJ >= 8) break;
					if (position.board[newI][newJ] != 0) {
						if (isWhite != (position.board[newI][newJ] > 0)) {
							moves.push([newI, newJ]);
						}
						break;
					}
					moves.push([newI, newJ]);
				}
			});
			break;
		case 6:
			for (let di=-1; di<=1; di++) {
				for (let dj=-1; dj<=1; dj++) {
					if (di == 0 && dj == 0) continue;
					let newI = i + di, newJ = j + dj;
					if (newI < 0) continue;
					if (newI >= 8) continue;
					if (newJ < 0) continue;
					if (newJ >= 8) continue;
					if (position.board[newI][newJ] != 0 && isWhite == (position.board[newI][newJ] > 0)) continue;
					moves.push([newI, newJ]);
				}
			}
			if (isWhite) {
				if (position.longCastleWhite && position.board[7][1] == 0 && position.board[7][2] == 0 && position.board[7][3] == 0) {
					moves.push([7, 2]);
				}
				if (position.shortCastleWhite && position.board[7][5] == 0 && position.board[7][6] == 0) {
					moves.push([7, 6]);
				}
			} else {
				if (position.longCastleBlack && position.board[0][1] == 0 && position.board[0][2] == 0 && position.board[0][3] == 0) {
					moves.push([0, 2]);
				}
				if (position.shortCastleBlack && position.board[0][5] == 0 && position.board[0][6] == 0) {
					moves.push([0, 6]);
				}
			}
			break;
	}

	return moves;
}

let piecesData = [
	[0, 0],
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],
	[0, 5],
	[0, 6],
	[0, 7],
	[1, 0],
	[1, 1],
	[1, 2],
	[1, 3],
	[1, 4],
	[1, 5],
	[1, 6],
	[1, 7],
	[6, 0],
	[6, 1],
	[6, 2],
	[6, 3],
	[6, 4],
	[6, 5],
	[6, 6],
	[6, 7],
	[7, 0],
	[7, 1],
	[7, 2],
	[7, 3],
	[7, 4],
	[7, 5],
	[7, 6],
	[7, 7]
];

/*let piecesMovement = {
	pawn: {
		normal: [[1, 0]],
		endless: [false, false],
		pawn: true,
		take: [[1, 1], [1, -1]],
		king: false
	},
	knight: {
		normal: [[1, 2], [1, -2], [2, 1], [2, -1], [-1, 2], [-1, -2], [-2, 1], [-2, -1]],
		endless: [false, false],
		pawn: false,
		king: false
	},
	bishop: {
		normal: [],
		endless: [false, true],
		pawn: false,
		king: false
	},
	rook: {
		normal: [],
		endless: [true, false],
		pawn: false,
		king: false
	},
	queen: {
		normal: [],
		endless: [true, true],
		pawn: false,
		king: false
	},
	king: {
		normal: [[1, 0], [1, 1], [1, -1], [0, 0], [0, 1], [0, -1], [-1, 0], [-1, 1], [-1, -1]],
		endless: [false, false],
		pawn: false,
		king: true
	},
}*/

$(document).ready(function(){
	scale = ($(".chess").width() + 8) / 400;
	$(".chess-info").css({"font-size": `calc(24px * ${scale})`});
	$(".chess-rotate-board").css({"width": `calc(30px * ${scale})`, "height": `calc(30px * ${scale})`});
	$(".chess-board").css({"width": `calc(400px * ${scale})`, "height": `calc(400px * ${scale})`});
	squareWidth = $(".chess-board-square:first-child").css("width");
	$(".chess-board-promotion").css({"width": squareWidth, "height": `calc(${squareWidth}*5)`});
	$(".chess-board-piece").each(function(index) {
		if (isElementWhite($(this)))
			setPiecePosition($(this), index%8, Math.floor(index/8) + 4);
		else
			setPiecePosition($(this), index%8, Math.floor(index/8));
	});
});
$(".chess-board-piece").draggable({
	containment: "parent",
	delay: 0,
	start: function(event) {
		if (isElementWhite($(this)) == isWhiteMove() && !currentPromotion.active) {
			showPossibleMoves($(this));
			curPiece = $(this);
		} else return false;
	},
	revert: function(event) {
		if (!event) return true;
		if ($(event).hasClass("chess-board-square-droppable")) {
			hidePossibleMoves(curPiece);
			let index = event.index();
			moveElementTo($(this), index%8, Math.floor(index/8));
			curPiece = null;
			return false;
		}
		return true;
	},
	revertDuration: 0,
	scope: "chess",
	stack: ".chess-board-piece"
});
$(".chess-rotate-board").click(function(event) {
	if (chessBoard.hasClass("chess-board-rotated")) {
		chessBoard.removeClass("chess-board-rotated");
		$(".chess-board-piece").each(function(index) {
			$(this).css({left: `calc(${squareWidth}*${piecesData[index][1]})`, top: `calc(${squareWidth}*${piecesData[index][0]})`});
		});
	} else {
		chessBoard.addClass("chess-board-rotated");
		$(".chess-board-piece").each(function(index) {
			$(this).css({left: `calc(${squareWidth}*${7-piecesData[index][1]})`, top: `calc(${squareWidth}*${7-piecesData[index][0]})`});
		});
	}
});
$(".chess-board-piece").click(function(event) {
	if (currentPromotion.active || hasGameEnded) return;
	if (isElementWhite($(this)) == isWhiteMove()) {
		if (curPiece != null && curPiece.index() == $(this).index()) {
			hidePossibleMoves(curPiece);
			curPiece = null;
		} else {
			showPossibleMoves($(this));
			curPiece = $(this);
		}
	} else if (curPiece != null) {
		let index = $(this).index();
		if ($(".chess-board-square").eq(piecesData[index][0]*8 + piecesData[index][1]).hasClass("chess-board-square-droppable")) {
			moveElementTo($(curPiece), piecesData[index][1], piecesData[index][0]);
		}
		hidePossibleMoves(curPiece);
		curPiece = null;
	}
});
$(".chess-board-square").droppable({
	scope: "chess"
});
$(".chess-board-square").click(function(event) {
	if (currentPromotion.active || hasGameEnded) return;
	if (!curPiece) return;
	if (!$(this).hasClass("chess-board-square-droppable")) {
		hidePossibleMoves(curPiece);
		curPiece = null;
		return;
	}
	hidePossibleMoves(curPiece);
	let index = $(this).index();
	moveElementTo($(curPiece), index%8, Math.floor(index/8));
	curPiece = null;
});
$(".chess-board-promotion div:not(:last-child)").click(function(event) {
	moveElementTo($(".chess-board-piece").eq(currentPromotion.index), currentPromotion.toX, (currentPromotion.side == 1 ? 7 : 0), $(this).index());
	currentPromotion.active = false;
	$(this).parent().removeClass("chess-on-promotion");
});
$(".chess-board-promotion-cancel").click(function(event) {
	currentPromotion.active = false;
	$(this).parent().removeClass("chess-on-promotion");
});