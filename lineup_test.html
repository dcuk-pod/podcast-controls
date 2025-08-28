<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lineup Layout Test</title>
    <style>
        /* --- All CSS is now inside this file --- */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        body {
            background-color: #555; /* Grey background to see the graphic */
            font-family: 'Poppins', sans-serif;
            color: #ffffff;
            padding: 20px;
            margin: 0;
            box-sizing: border-box;
        }

        .lineup-graphic {
            width: 1200px; 
            background-color: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        }

        .top-bar {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 10px 20px;
        }

        .top-bar-logo {
            width: 40px;
            height: 40px;
        }

        .top-bar-name {
            font-size: 24px;
            font-weight: 700;
        }

        .main-content {
            display: flex;
            padding: 20px;
        }

        .pitch-section {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .pitch {
            flex: 1;
            width: 100%;
            background-color: #252525;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 15px 0;
        }

        .pitch-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
        }

        .player-marker {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .player-photo {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background-color: #444;
            border: 2px solid #ccc;
            object-fit: cover;
            margin-bottom: 5px;
        }

        .player-name {
            font-size: 13px; 
            font-weight: 600;
            background-color: rgba(0,0,0,0.7);
            padding: 2px 5px;
            border-radius: 3px;
            white-space: nowrap;
        }

        .list-section {
            width: 220px;
            flex-shrink: 0;
            padding-left: 20px;
            border-left: 1px solid #444;
        }

        .list-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 10px;
            text-transform: uppercase;
            color: #aaa;
        }

        .player-list {
            list-style: none;
            padding: 0;
            margin: 0 0 20px 0;
        }

        .player-list-item {
            display: flex;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .player-list-item .number {
            width: 30px;
            font-weight: 600;
            color: #aaa;
        }

        .player-list-item .name {
            font-weight: 400;
        }
    </style>
</head>
<body>

    <div id="lineup-container"></div>

    <script>
        // --- All JavaScript is now inside this file ---

        // Hardcoded data from the API response you provided
        const hardcodedLineupData = {
            "team": { "id": 70, "name": "Middlesbrough", "logo": "https://media.api-sports.io/football/teams/70.png" },
            "formation": "3-4-2-1",
            "startXI": [
                { "player": { "id": 192346, "name": "Solomon Brynn", "number": 31, "pos": "G", "grid": "1:1" } },
                { "player": { "id": 19116, "name": "Luke Ayling", "number": 12, "pos": "D", "grid": "2:3" } },
                { "player": { "id": 19239, "name": "Dael Fry", "number": 6, "pos": "D", "grid": "2:2" } },
                { "player": { "id": 18938, "name": "Alfie Jones", "number": 5, "pos": "D", "grid": "2:1" } },
                { "player": { "id": 17421, "name": "Callum Brittain", "number": 2, "pos": "M", "grid": "3:4" } },
                { "player": { "id": 201714, "name": "Aidan Morris", "number": 18, "pos": "M", "grid": "3:3" } },
                { "player": { "id": 179685, "name": "Hayden Hackney", "number": 7, "pos": "M", "grid": "3:2" } },
                { "player": { "id": 126872, "name": "Samuel Silvera", "number": 22, "pos": "M", "grid": "3:1" } },
                { "player": { "id": 129709, "name": "Morgan Whittaker", "number": 11, "pos": "F", "grid": "4:2" } },
                { "player": { "id": 37242, "name": "Delano Burgzorg", "number": 10, "pos": "F", "grid": "4:1" } },
                { "player": { "id": 282767, "name": "Tommy Conway", "number": 9, "pos": "F", "grid": "5:1" } }
            ],
            "substitutes": [
                { "player": { "id": 384828, "name": "Abdoulaye Kanté", "number": 42, "pos": "M" } },
                { "player": { "id": 1927, "name": "Neto Borges", "number": 30, "pos": "D" } }
            ]
        };

        const hardcodedPlayersData = {
            "team": { "id": 70, "name": "Middlesbrough" },
            "players": [
                { "player": { "id": 192346, "name": "Solomon Brynn", "photo": "https://media.api-sports.io/football/players/192346.png" } },
                { "player": { "id": 19116, "name": "Luke Ayling", "photo": "https://media.api-sports.io/football/players/19116.png" } },
                { "player": { "id": 19239, "name": "Dael Fry", "photo": "https://media.api-sports.io/football/players/19239.png" } },
                { "player": { "id": 18938, "name": "Alfie Jones", "photo": "https://media.api-sports.io/football/players/18938.png" } },
                { "player": { "id": 17421, "name": "Callum Brittain", "photo": "https://media.api-sports.io/football/players/17421.png" } },
                { "player": { "id": 201714, "name": "Aidan Morris", "photo": "https://media.api-sports.io/football/players/201714.png" } },
                { "player": { "id": 179685, "name": "Hayden Hackney", "photo": "https://media.api-sports.io/football/players/179685.png" } },
                { "player": { "id": 126872, "name": "Samuel Silvera", "photo": "https://media.api-sports.io/football/players/126872.png" } },
                { "player": { "id": 129709, "name": "Morgan Whittaker", "photo": "https://media.api-sports.io/football/players/129709.png" } },
                { "player": { "id": 37242, "name": "Delano Burgzorg", "photo": "https://media.api-sports.io/football/players/37242.png" } },
                { "player": { "id": 282767, "name": "Tommy Conway", "photo": "https://media.api-sports.io/football/players/282767.png" } },
                { "player": { "id": 384828, "name": "Abdoulaye Kanté", "photo": "https://media.api-sports.io/football/players/384828.png" } },
                { "player": { "id": 1927, "name": "Neto Borges", "photo": "https://media.api-sports.io/football/players/1927.png" } }
            ]
        };
        
        // This function builds the graphic using the hardcoded data above
        function buildLineup(teamLineup, teamPlayers) {
            const lineupContainer = document.getElementById('lineup-container');
            lineupContainer.innerHTML = '';

            const playerPhotoMap = new Map();
            teamPlayers.players.forEach(p => playerPhotoMap.set(p.player.id, p.player.photo));
            
            const graphic = document.createElement('div');
            graphic.className = 'lineup-graphic';

            const topBar = document.createElement('div');
            topBar.className = 'top-bar';
            topBar.style.backgroundColor = `#db0000`; // Hardcoded red for test
            topBar.innerHTML = `<img src="${teamLineup.team.logo}" class="top-bar-logo"><span class="top-bar-name">${teamLineup.team.name}</span>`;

            const mainContent = document.createElement('div');
            mainContent.className = 'main-content';

            const pitchSection = document.createElement('div');
            pitchSection.className = 'pitch-section';
            const pitch = document.createElement('div');
            pitch.className = 'pitch';
            
            const rowGroups = {};
            teamLineup.startXI.forEach(p => {
                if (p.player.grid) {
                    const [rowNumStr] = p.player.grid.split(':');
                    if (!rowGroups[rowNumStr]) { rowGroups[rowNumStr] = []; }
                    rowGroups[rowNumStr].push(p.player);
                }
            });
            
            Object.keys(rowGroups).sort((a, b) => a - b).forEach(rowKey => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'pitch-row';
                const playersInRow = rowGroups[rowKey];
                playersInRow.sort((a, b) => parseInt(a.grid.split(':')[1]) - parseInt(b.grid.split(':')[1]));
                
                playersInRow.forEach(player => {
                    const photoUrl = playerPhotoMap.get(player.id) || 'path/to/fallback.png';
                    const marker = document.createElement('div');
                    marker.className = 'player-marker';
                    marker.innerHTML = `<img src="${photoUrl}" alt="${player.name}" class="player-photo"><span class="player-name">${player.number}. ${player.name.split(' ').pop()}</span>`;
                    rowDiv.appendChild(marker);
                });
                pitch.appendChild(rowDiv);
            });
            pitchSection.appendChild(pitch);

            const listSection = document.createElement('div');
            listSection.className = 'list-section';
            
            let startingXIList = '<h2 class="list-title">Starting Lineup</h2><ul class="player-list">';
            teamLineup.startXI.forEach(p => {
                startingXIList += `<li class="player-list-item"><span class="number">${p.player.number}</span> <span class="name">${p.player.name}</span></li>`;
            });
            startingXIList += '</ul>';

            let substitutesList = '<h2 class="list-title">Bench</h2><ul class="player-list">';
            teamLineup.substitutes.forEach(p => {
                substitutesList += `<li class="player-list-item"><span class="number">${p.player.number}</span> <span class="name">${p.player.name}</span></li>`;
            });
            substitutesList += '</ul>';
            listSection.innerHTML = startingXIList + substitutesList;
            
            mainContent.appendChild(pitchSection);
            mainContent.appendChild(listSection);
            graphic.appendChild(topBar);
            graphic.appendChild(mainContent);
            lineupContainer.appendChild(graphic);
        }

        // Run the function immediately with the hardcoded data
        buildLineup(hardcodedLineupData, hardcodedPlayersData);
    </script>

</body>
</html>