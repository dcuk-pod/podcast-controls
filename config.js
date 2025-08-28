// config.js


const API_BASE_URL = "https://v3.football.api-sports.io";

// For Fixture-specific graphics (Stats, Lineups)
const fixtureId = 1326608;
const fixturePreviewId = 1326608;
const fixtureReviewId = 1326594;
const teamId = 1615; // The ID of the team for the fixture list
// For League-wide graphics (Tables, Live Scores)
const leagueId = 253; // 489 for testing, change to 253 for MLS
const season = 2025;
const h2h_teams = "1615-9568"; // Example: DC United vs CF Montreal

const playerId = 207781; 

const featuredTeamId = 1615; // DC United's ID
const fromDate = '2025-08-22';
const toDate = '2025-08-25';
const TEAM_COLORS = {
  1595: 'rgb(85, 150, 71)',     // Seattle Sounders FC (Green)
  1596: 'rgb(0, 102, 175)',     // San Jose Earthquakes (Blue)
  1597: 'rgb(222, 53, 56)',     // FC Dallas (Red)
  1598: 'rgb(101, 44, 144)',    // Orlando City SC (Purple)
  1599: 'rgb(181, 152, 90)',    // Philadelphia Union (Gold)
  1600: 'rgb(245, 128, 44)',    // Houston Dynamo FC (Orange)
  1601: 'rgb(222, 53, 56)',     // Toronto FC (Red)
  1602: 'rgb(217, 39, 46)',     // New York Red Bulls (Red)
  1603: 'rgb(15, 49, 92)',      // Vancouver Whitecaps FC (Dark Blue)
  1604: 'rgb(108, 169, 223)',   // New York City FC (Sky Blue)
  1605: 'rgb(0, 40, 85)',       // LA Galaxy (Dark Blue)
  1606: 'rgb(205, 34, 53)',     // Real Salt Lake (Red)
  1607: 'rgb(229, 26, 55)',     // Chicago Fire FC (Red)
  1608: 'rgb(141, 22, 44)',     // Atlanta United FC (Dark Red)
  1609: '#021D3D',     // New England Revolution (Dark Blue)
  1610: 'rgb(149, 29, 64)',     // Colorado Rapids (Burgundy)
  1611: 'rgb(80, 132, 185)',    // Sporting Kansas City (Light Blue)
  1612: 'rgb(143, 201, 232)',   // Minnesota United FC (Sky Blue)
  1613: 'rgb(254, 222, 0)',     // Columbus Crew (Yellow)
  1614: 'rgb(0, 85, 155)',      // CF Montréal (Blue)
  1615: 'rgb(239, 62, 65)',      // D.C. United (Red)
  1616: 'rgb(193, 162, 92)',     // Los Angeles FC (Gold)
  1617: 'rgb(0, 70, 41)',        // Portland Timbers (Green)
  2242: 'rgb(241, 91, 36)',      // FC Cincinnati (Orange)
  9568: 'rgb(252, 185, 205)',    // Inter Miami CF (Pink)
  9569: 'rgb(254, 219, 0)',      // Nashville SC (Yellow)
  16489: 'rgb(0, 182, 75)',      // Austin FC (Bright Green)
  18310: 'rgb(91, 192, 240)',    // Charlotte FC (Blue)
  20787: 'rgb(217, 2, 79)',      // St. Louis City SC (Magenta)
  25484: 'rgb(11, 46, 75)',      // San Diego FC (Dark Blue)
 

  // Add any other team IDs and their colors here...

  // A default color for any team not in this list
  'default': 'rgba(66, 65, 65, 1)' 
};
const TEAM_COLORS_ALT = {
  1595: '#003C71',     // Seattle Sounders FC (Sounder Blue)
  1596: '#000000',     // San Jose Earthquakes (Black)
  1597: '#003E7B',     // FC Dallas (Brazos Blue)
  1598: '#FFD100',     // Orlando City SC (Gold)
  1599: '#0A2240',     // Philadelphia Union (Union Blue)
  1600: '#000000',     // Houston Dynamo FC (Black)
  1601: '#231F20',     // Toronto FC (Onyx/Dark Grey)
  1602: '#FFC700',     // New York Red Bulls (Yellow)
  1603: '#92C1E9',     // Vancouver Whitecaps FC (Whitecaps Blue)
  1604: '#002654',     // New York City FC (Midnight Blue)
  1605: '#FFD200',     // LA Galaxy (Galaxy Gold)
  1606: '#013A81',     // Real Salt Lake (Cobalt Blue)
  1607: '#001E61',     // Chicago Fire FC (Navy Blue)
  1608: '#A48A5A',     // Atlanta United FC (Dark Gold)
  1609: '#E51938',     // New England Revolution (Revolution Red)
  1610: '#569FD3',     // Colorado Rapids (Sky Blue)
  1611: '#002F65',     // Sporting Kansas City (Dark Indigo)
  1612: '#58595B',     // Minnesota United FC (Iron Grey)
  1613: '#000000',     // Columbus Crew (Black)
  1614: '#000000',     // CF Montréal (Black)
  1615: '#000000',     // D.C. United (Black)
  1616: '#000000',     // Los Angeles FC (Black)
  1617: '#E1A023',     // Portland Timbers (Timbers Gold)
  2242: '#003067',     // FC Cincinnati (FCC Blue)
  9568: '#000000',     // Inter Miami CF (Black)
  9569: '#001F5B',     // Nashville SC (Acoustic Blue)
  16489: '#000000',    // Austin FC (Black)
  18310: '#000000',    // Charlotte FC (Black)
  20787: '#001D4C',    // St. Louis City SC (River Blue)
  25484: '#F5831F',    // San Diego FC (Horizon Orange)
  'default': 'rgb(255, 255, 255)' // A default alternate color
};
const TEAM_INITIALS = {
  1595: 'SEA',   // Seattle Sounders FC
  1596: 'SJE',   // San Jose Earthquakes
  1597: 'DAL',   // FC Dallas
  1598: 'ORL',   // Orlando City SC
  1599: 'PHI',   // Philadelphia Union
  1600: 'HOU',   // Houston Dynamo FC
  1601: 'TOR',   // Toronto FC
  1602: 'NYRB',  // New York Red Bulls
  1603: 'VAN',   // Vancouver Whitecaps FC
  1604: 'NYC',   // New York City FC
  1605: 'LAG',   // LA Galaxy
  1606: 'RSL',   // Real Salt Lake
  1607: 'CHI',   // Chicago Fire FC
  1608: 'ATL',   // Atlanta United FC
  1609: 'NER',   // New England Revolution
  1610: 'COL',   // Colorado Rapids
  1611: 'SKC',   // Sporting Kansas City
  1612: 'MIN',   // Minnesota United FC
  1613: 'CLB',   // Columbus Crew
  1614: 'MTL',   // CF Montréal
  1615: 'DCU',   // D.C. United
  1616: 'LAFC',  // Los Angeles FC
  1617: 'POR',   // Portland Timbers
  2242: 'CIN',   // FC Cincinnati
  9568: 'MIA',   // Inter Miami CF
  9569: 'NSH',   // Nashville SC
  16489: 'AUS',  // Austin FC
  18310: 'CLT',  // Charlotte FC
  20787: 'STL',  // St. Louis City SC
  25484: 'SAN',  // San Diego FC
  // Add all other team initials here...
  'default': '???'
};
const headlines = [
    {
        headline: "Caden Clark joins the Black and Red",
        description: "Clark joins DCU from CF Montreal for a fee of $700k Cash and a further $100k in add-ons.",
        image: "images/players/207781.png"
    },
    {
        headline: "THE CRISIS DEEPENS FURTHER",
        description: "DCU's winless streak in MLS now stretches to 10 matches. The club were unable to break the streak despite playing the joint worst team in the East.",
        image: "images/downarrow.png"
    },
    {
        headline: "Weiler's 1st week",
        description: "No further news as the press conference was delayed to Friday",
        image: "images/reneweiler.png"
    },
    {
        headline: "Garay has moved",
        description: "Former DCU midfielder Jeremy Garay has joined Club Deportivo Cacahuatique in his home nation of El Salvador",
        image: "images/garay.jpg"
    }
];
const questions = [
    {
        source: 'other',
        name: 'D.C U.K',
        question: 'Send in your questions via any social network of your choice'
    },
    {
    source: 'Twitter',
    name: 'InWoodbridge',
    question: 'If LAGal win a Leagues Cup trophy, why or why not is that as improbable a result as D.C. United winning in the US Open Cup in 2013?'
},
{
    source: 'Twitter',
    name: 'InWoodbridge',
    question: 'Obviously, now how will Clark’s acquiring affect the future?'
},
{
    source: 'Instagram',
    name: '@jumpnpodcast',
    question: 'I will actually be in attendance for this game, first time in 4 months'
},
{
    source: 'Discord',
    name: 'Johnypilgrim',
    question: 'What\'s one former DCU player you\'d bring back in their prime that could make this current team a playoff contender?'
}

];
const teamCodes = {
    1595: "SEA", // Seattle Sounders
    1596: "SJE", // San Jose Earthquakes
    1597: "DAL", // FC Dallas
    1598: "ORL", // Orlando City SC
    1599: "PHI", // Philadelphia Union
    1600: "HOU", // Houston Dynamo
    1601: "TOR", // Toronto FC
    1602: "NYRB", // New York Red Bulls
    1603: "VAN", // Vancouver Whitecaps
    1604: "NYC", // New York City FC
    1605: "LA",  // Los Angeles Galaxy
    1606: "RSL", // Real Salt Lake
    1607: "CHI", // Chicago Fire
    1608: "ATL", // Atlanta United FC
    1609: "NE",  // New England Revolution
    1610: "COL", // Colorado Rapids
    1611: "SKC", // Sporting Kansas City
    1612: "MIN", // Minnesota United FC
    1613: "CLB", // Columbus Crew
    1614: "MTL", // CF Montreal
    1615: "DCU", // DC United
    1616: "LAFC",// Los Angeles FC
    1617: "POR", // Portland Timbers
    2242: "CIN", // FC Cincinnati
    9568: "MIA", // Inter Miami
    9569: "NSH", // Nashville SC
    16489: "AUS", // Austin
    18310: "CLT", // Charlotte
    20787: "STL", // St. Louis City
    25484: "SD",  // San Diego
};
