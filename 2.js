/* jshint browser: true */
/*eslint-env es6*/
/*jslint es6:true*/
const FIELD_SIZE = 10;
var audio;
document.getElementById('start').style.display = 'inline';

function deepEqual([x1, y1], [x2, y2]) {
    if (x1 === x2 && y1 === y2) return true;
    return false;
}

function createElement(name, x, y, field) {
    const div = document.createElement('div');
    div.className = name;
    div.style.cssText = `margin-left:${(x + 1) * 40}px; margin-top:${(y + 1) * 40}px;position: fixed;`;
    document.getElementById(field).appendChild(div);
}

function replace(coord, value) {
    if (coord[0] < 0 || coord[0] > 9) coord[0] = value;
    if (coord[1] < 0 || coord[1] > 9) coord[1] = value;
}

function playAudio(path) {

    audio = new Audio(path);
    audio.play();
}

function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
}
class Field {
    name;
    alphabet = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];
    ships = [];
    field = [];
    crushedShips = 0;
    constructor(name) {
        this.name = name;
        for (let row = 0; row < FIELD_SIZE; row++) {
            this.field[row] = [];
            for (let col = 0; col < FIELD_SIZE; col++) {
                this.field[row][col] = 0;
            }
        }
    }
    generateShips() {
        let trys = 0;
        for (let i = 4; i > 0; i--) {
            for (let j = 1; j <= 5 - i; j++) {
                let isCorrect = true;
                do {
                    isCorrect = true;
                    var ship = new Ship(i);
                    trys++;
                    if (trys > 300) {
                        console.log(trys);
                        this.ships = [];
                        this.generateShips();
                        return;
                    }
                    for (let k = 0; k < this.ships.length; k++) {
                        if (this.ships[k].isConnectTo(ship)) {
                            isCorrect = false;
                            break;
                        }
                    }

                    /*this.ships.forEach(function(item) {
                        console.log(item.isConnectTo(ship));
                        if (item.isConnectTo(ship)) {
                            isCorrect = false;
                            //break
                        }
                    });*/

                } while (isCorrect === false);
                this.ships.push(ship);
            }
        }
    }
    reset() {
        this.ships = [];
        document.getElementById(this.name).innerHTML = '';
    }
    showShips() {
        name = this.name;
        this.ships.forEach(function (item) {
            item.show(name);
        });
    }
    hit(cell) {
        if (cell === null || cell.length > 3) {
            alert("Неверный ввод !");
            return 0;
        }
        let col = this.alphabet.indexOf(cell.charAt(0));
        let row = Number(cell.match(/\d+/)[0]) - 1;
        if (row < 0 || row > 9 || col < 0 || col > 9) {
            alert("Неверный ввод !");
            return 0;
        }
        if (this.field[row][col] === 1) {
            alert("В данную ячейку уже был произведен выстрел !");
            return 0;
        }
        this.field[row][col] = 1;
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].isHit(row, col)) {
                createElement('cross', col, row, this.name);
                if (this.ships[i].isAllHit()) {
                    this.crushedShips++;
                    this.ships[i].show(this.name);
                    playAudio('sound/kill.mp3');
                    this.ships[i].closeAll(this.name, this.field);
                } else {
                    playAudio('sound/hit.mp3');
                }
                return 2;
            }
        }
        createElement('dot', col, row, this.name);
        return 1;
    }
    isLose() {
        if (this.crushedShips === this.ships.length) return true;
        return false;
    }
}

class Ship {
    hits = 0;
    name;
    row;
    col;
    size;
    direction;
    startCoord;
    finishCoord;
    coordinate = [];
    constructor(size) {
        this.size = size;

        this.direction = Math.floor(Math.random() * 2);
        if (this.direction === 1) {
            this.col = Math.floor(Math.random() * (FIELD_SIZE - this.size + 1));
            this.row = Math.floor(Math.random() * FIELD_SIZE);

        } else {
            this.row = Math.floor(Math.random() * (FIELD_SIZE - this.size + 1));
            this.col = Math.floor(Math.random() * FIELD_SIZE);
        }
        for (let i = 0; i < size; i++) {
            if (this.direction === 1) this.coordinate.push([this.row, this.col + i]);
            else this.coordinate.push([this.row + i, this.col]);
        }
        this.startCoord = [this.row - 1, this.col - 1];
        replace(this.startCoord, 0);
        if (this.direction === 1) this.finishCoord = [this.row + 1, this.col + size];
        else this.finishCoord = [this.row + size, this.col + 1];
        replace(this.finishCoord, 9);

    }
    closeAll(fieldName, grid) {
        if (this.direction === 1) {
            for (let y = this.startCoord[1]; y <= this.finishCoord[1]; y++) {
                for (let x = this.startCoord[0]; x <= this.finishCoord[0]; x++) {
                    if (this.row === x) {
                        if ((this.col == this.startCoord[1] && y == this.col) || ((this.col + this.size - 1) == this.finishCoord[1] && y == this.finishCoord[1])) x++;
                        else if (y !== this.startCoord[1] && y !== this.finishCoord[1]) x++;
                    }
                    grid[x][y] = 1;
                    createElement('dot', y, x, fieldName);
                    if (y !== this.startCoord[1] && y !== this.finishCoord[1]) x++;
                }
            }
        } else {
            for (let x = this.startCoord[0]; x <= this.finishCoord[0]; x++) {
                for (let y = this.startCoord[1]; y <= this.finishCoord[1]; y++) {
                    if (this.col === y) {
                        if ((this.row == this.startCoord[0] && x == this.row) || ((this.row + this.size - 1) == this.finishCoord[0] && x == this.finishCoord[0])) y++;
                        else if (x !== this.startCoord[0] && x !== this.finishCoord[0]) y++;
                    }
                    grid[x][y] = 1;
                    createElement('dot', y, x, fieldName);
                    if (x !== this.startCoord[0] && x !== this.finishCoord[0]) y++;
                }
            }

        }
    }
    show(fieldName) {
        const dir = (this.direction == 1) ? '' : ' vertical';
        let name = 'ship deck' + this.size + dir;
        createElement(name, this.col, this.row, fieldName);
    }
    isHit(row, col) {
        for (let i = 0; i < this.size; i++) {
            if (deepEqual(this.coordinate[i], [row, col])) {
                this.hits++;
                return true;
            }
        }
        return false;
    }
    isAllHit() {
        if (this.hits === this.size) return true;
        return false;
    }
    isConnectTo(ship) {
        if (Math.abs(this.startCoord[0] - ship.startCoord[0]) > 1 && Math.abs(ship.finishCoord[0] - this.finishCoord[0]) > 1 || (Math.abs(this.startCoord[1] - ship.startCoord[1]) > 1 && Math.abs(ship.finishCoord[1] - this.finishCoord[1]) > 1)) {
            if ((ship.startCoord[0] < this.finishCoord[0] && Math.abs(ship.startCoord[1] - this.startCoord[1]) < 2) || (this.startCoord[0] > ship.finishCoord[0] && Math.abs(this.startCoord[1] - ship.startCoord[1]) < 2)) return true;
            if ((ship.startCoord[1] < this.finishCoord[1] && Math.abs(ship.startCoord[0] - this.startCoord[0]) < 2) || (this.startCoord[1] > ship.finishCoord[1] && Math.abs(this.startCoord[0] - ship.startCoord[0]) < 2)) return true;
            return false;
        }
        return true;
    }
}
var firstPlayer = new Field("first_field");
var secondPlayer = new Field("second_field");
var PLAYER = 1;
var firstClick = true;

function changeChoosingPlayer(player, text, button) {
    document.getElementById('print').textContent = `${text} выбирает поле...`;
    document.getElementById('start').style.display = 'none';
    document.getElementById(button).style.display = 'inline';
    player.generateShips();
    player.showShips();
}

function chooseField() {
    document.getElementById('change').style.display = 'inline';
    if (firstClick) {
        changeChoosingPlayer(firstPlayer, 'Игрок 1', 'success');
        firstClick = false;
    } else {
        PLAYER = 2;
        changeChoosingPlayer(secondPlayer, 'Игрок 2', 'ready');
    }
}

function changeField() {
    let curField = (PLAYER === 1) ? firstPlayer : secondPlayer;
    curField.reset();
    curField.generateShips();
    curField.showShips();
}

function startGame() {
    document.getElementById('second_field').innerHTML = '';
    document.getElementById('ready').style.display = 'none';
    document.getElementById('change').style.display = 'none';
    document.getElementById('cell').style.display = 'inline';
    document.getElementById('hit').style.display = 'inline';
    document.getElementById('print').textContent = 'Игрок 1 стреляет...';
    PLAYER = 1;
}

function emptyField() {
    document.getElementById('first_field').innerHTML = '';
    document.getElementById('print').textContent = 'Корабли Игрока 1 выбраны!';
    document.getElementById('change').style.display = 'none';
    document.getElementById('start').style.display = 'inline';
    document.getElementById('success').style.display = 'none';
}

function restart() {
    stopAudio();
    document.getElementById('print').textContent = 'Добро пожаловать в Морской бой - игры на двоих !';
    document.getElementById('first_field').innerHTML = '';
    document.getElementById('restart').style.display = 'none';
    document.getElementById('second_field').innerHTML = '';
    document.getElementById('start').style.display = 'inline';
    firstClick = true;

}

function victory(player) {
    playAudio('sound/victory.mp3');
    document.getElementById('cell').style.display = 'none';
    document.getElementById('hit').style.display = 'none';
    document.getElementById('print').textContent = `Победил ${player} !`;
    document.getElementById('restart').style.display = 'inline';

}

function makeHit() {
    var text = document.getElementById('cell').value.trim();
    if (PLAYER === 1) {
        if (secondPlayer.hit(text) === 1) {
            document.getElementById('print').textContent = 'Игрок 2 стреляет...';
            PLAYER = 2;
        }
        if (secondPlayer.isLose()) {
            stopAudio();
            firstPlayer.showShips();
            victory('Игрок 1');
        }
    } else {
        if (firstPlayer.hit(text) === 1) {
            document.getElementById('print').textContent = 'Игрок 1 стреляет...';
            PLAYER = 1;
        }
        if (firstPlayer.isLose()) {
            stopAudio();
            secondPlayer.showShips();
            victory('Игрок 2');
        }
    }
}
