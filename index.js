document.addEventListener('DOMContentLoaded', function () {

    let gameStarted = false;
    const container = document.getElementById('puzzle-container');
    
    const blankPosition = 
    {
        x: Math.floor(Math.random() * 4),
        y: Math.floor(Math.random() * 4)
    };
    
    const tiles = [];
    let lowestTime = Infinity;
    let lowestMoves = Infinity;
    var gameMusic = new Audio('puzzle.mp3');
    gameMusic.loop = true;

    function playMusic() {
        gameMusic.play();
    }
    function resetMusic() {
        gameMusic.currentTime = 0;
        gameMusic.play();
    }
    function toggleMute() {
        gameMusic.muted = !gameMusic.muted;
    }
    function setVolume(volume) {
        gameMusic.volume = volume;
    }

    document.getElementById('mute-button').addEventListener('click', function() {
        toggleMute();
    });
    document.getElementById('volume-slider').addEventListener('input', function() {
        setVolume(this.value);
    });

    const switchBackgroundButton = document.getElementById('switch-background-button');
    switchBackgroundButton.addEventListener('click', switchBackground);
	
	const moveDisplay = document.getElementById('move-counter');
    let moveCount = 0;

    function updateMoveDisplay() {
        moveDisplay.textContent = `Moves: ${moveCount}`;
    }
    function resetMoveCount() {
        moveCount = 0;
        updateMoveDisplay();
    }
    function incrementMoveCount() {
        moveCount++;
        updateMoveDisplay();
    }

    function switchBackground() 
    {
        const selectElement = document.getElementById('background-select');
        const selectedImage = selectElement.value;

        tiles.forEach(tile => {
            tile.style.backgroundImage = `url('${selectedImage}')`;
        });
    }

    //tile creation 
    for (let i = 0; i < 15; i++) 
    {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = i + 1; 
        container.appendChild(tile); 
        tiles.push(tile); 
    }

    let timerInterval;
    let elapsedTime = 0;
    const timerDisplay = document.getElementById('timer');

    function startTimer() 
    {
        clearInterval(timerInterval); 
        elapsedTime = 0;
        updateTimerDisplay();
        timerInterval = setInterval(function() {
            elapsedTime++;
            updateTimerDisplay();
        }, 1000);
    }

    let timerPaused = false;

    function pauseTimer() 
    {
        clearInterval(timerInterval);
        timerPaused = true;
    }

    function resumeTimer() 
    {
        if (!timerPaused) return;
        timerInterval = setInterval(function() 
        {
            elapsedTime++;
            updateTimerDisplay();
        }, 1000);
        timerPaused = false;
    }

    function updateTimerDisplay() 
    {
        const hours = Math.floor(elapsedTime / 3600);
        const minutes = Math.floor((elapsedTime % 3600) / 60);
        const seconds = elapsedTime % 60;
    
        const formattedTime = [hours, minutes, seconds]
            .map(unit => String(unit).padStart(2, '0'))
            .join(':');
    
        timerDisplay.textContent = formattedTime;
    }
    
    
    function setPosition(tile, x, y) 
    {
        tile.style.left = x * 100 + 'px'; 
        tile.style.top = y * 100 + 'px'; 
        
        const tileNumber = parseInt(tile.innerHTML) - 1;
        const backgroundX = (tileNumber % 4) * 100;
        const backgroundY = Math.floor(tileNumber / 4) * 100;
        tile.style.backgroundPosition = `-${backgroundX}px -${backgroundY}px`;
    }

    function shuffle() 
    {
        resetMoveCount(); 
        pauseTimer();
        tiles.forEach(tile => 
        {
            tile.classList.add('disappear');
            tile.removeEventListener('click', tileClickHandler); 
        });
        
        const imageOptions = ['tile.jpg', 'eagle.jpg', 'model.jpg', 'cake.jpg'];
        const randomImage = imageOptions[Math.floor(Math.random() * imageOptions.length)];

        tiles.forEach(tile => 
            {
            tile.style.backgroundImage = `url('${randomImage}')`;
        });

        const selectElement = document.getElementById('background-select');
        for (let option of selectElement.options) {
            if (option.value === randomImage) {
                option.selected = true;
                break;
            }
        }

        let shuffledPositions = shufflePositions();
    
        let index = 0;
        let phaseInInterval = setInterval(() => {
            if (index < tiles.length) {
                let tile = tiles[index];
                let newPosition = shuffledPositions[index];
                setPosition(tile, newPosition.x, newPosition.y);
                tile.classList.remove('disappear');
                tile.classList.add('glow');
                setTimeout(() => tile.classList.remove('glow'), 500); 
                index++;
            } else {
                clearInterval(phaseInInterval);
                gameStarted = true;
                startTimer();
            }
        }, 100); 
    }
    

    function shufflePositions() 
    {
        
        let positions = [];
        for (let i = 0; i < 16; i++) {
            positions.push({ x: i % 4, y: Math.floor(i / 4) });
        }
    
        for (let i = positions.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        for (let i = 0; i < positions.length; i++) {
            if (i === 15) { 
                blankPosition.x = positions[i].x;
                blankPosition.y = positions[i].y;
                break;
            }
        }
    
        positions = positions.slice(0, -1);
        return positions;
    }
    
    
    function canMove(tile) 
    {
        const x = parseInt(tile.style.left) / 100;
        const y = parseInt(tile.style.top) / 100;
        const dx = Math.abs(x - blankPosition.x);
        const dy = Math.abs(y - blankPosition.y);
        return (dx + dy === 1); 
    }

    
    function moveTile(tile) 
    {
        const x = parseInt(tile.style.left) / 100;
        const y = parseInt(tile.style.top) / 100;
        setPosition(tile, blankPosition.x, blankPosition.y);
        blankPosition.x = x;
        blankPosition.y = y;
        incrementMoveCount();
        if (gameStarted) 
        {
            checkWin(); 
        }
    }
    
    function checkWin() 
    {
        for (let i = 0; i < 15; i++) 
        {
            const x = parseInt(tiles[i].style.left) / 100;
            const y = parseInt(tiles[i].style.top) / 100;
            if (x !== i % 4 || y !== Math.floor(i / 4)) {
                return false; 
            }
        }
        resetMusic();
        pauseTimer();

        setTimeout(() => {
            
            const gifContainer = document.getElementById('apex-gif-container');
            if (gifContainer) {
                gifContainer.style.display = 'block';

                setTimeout(() => {
                    
                    gifContainer.style.display = 'none';
                    showCompletionAlert();
                }, 3000); 
            } else {
                
                showCompletionAlert();
            }
        }, 2200); 
    }


    tiles.forEach((tile, index) => 
    {
        tile.style.backgroundImage = "url('tile.jpg')"; 
        
        let x = index % 4;
        let y = Math.floor(index / 4);
        if (index === 15 - 1 && (blankPosition.x !== 3 || blankPosition.y !== 3)) {
            
            x = blankPosition.x;
            y = blankPosition.y;
        }
        setPosition(tile, x, y); 

        tile.addEventListener('click', function () {
            if (canMove(tile)) 
            {
                moveTile(tile); 
            }
        });
    });

    function tileClickHandler() 
    {
        if (canMove(this)) 
        {
            moveTile(this); 
        }
    }

    const shuffleButton = document.getElementById('shuffle-button');
    shuffleButton.addEventListener('click', function() 
    {
        resetMusic(); 
        shuffle();
    });

    function solvePuzzle() 
    {
        resetMoveCount();
        pauseTimer();
        gameStarted = false;

        const currentTime = elapsedTime;
        const currentMoves = moveCount;

        if (currentTime < lowestTime || (currentTime === lowestTime && currentMoves < lowestMoves)) {
            lowestTime = currentTime;
            lowestMoves = currentMoves;
        }
        
        tiles.forEach((tile, index) => {
            const correctX = index % 4;
            const correctY = Math.floor(index / 4);
            setPosition(tile, correctX, correctY);
        });

        blankPosition.x = 3;
        blankPosition.y = 3;

        setTimeout(() => {
            
            const gifContainer = document.getElementById('apex-gif-container');
            if (gifContainer) {
                gifContainer.style.display = 'block';

                setTimeout(() => {
                    
                    gifContainer.style.display = 'none';
                    showCompletionAlert();
                }, 3000); 
            } else {
                
                showCompletionAlert();
            }
        }, 2200); 
    }

    function showCompletionAlert() 
    {
        alert(`Nice! Your lowest time: ${formatTime(lowestTime)}, Lowest moves: ${lowestMoves}`);
        shuffle(); 
    }

    function formatTime(seconds) 
    {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    
    document.getElementById('solve-button').addEventListener('click', solvePuzzle);
    
    playMusic();
    shuffle();
});
