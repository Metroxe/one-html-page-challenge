/**
 * Every entry must include a title and filename, the rest are optional.
 * For simplicity in merges, please add to the bottom of the object.
 *
 * interface
 * {
 *     title: string // display name
 *     filename: string // the name of your HTML file
 *     description?: string // description that will be listed with your entry
 *     author?: string // your name/tag that will be listed
 *     github?: string // username on github that will display a link to your profile
 *     compatibleBrowsers?: array // browsers that this page is compatible with
 * }
 */

const entries = [
	{
		title: "Dancing Man",
		filename: "dancing_man.html",
		description: "The first submission to the One HTML Page Challenge. It is a simple ASCII man starting the dance from Napoleon Dynamite.",
		author: "Christopher Powroznik (Metroxe)",
		github: "Metroxe",
	},
	{
		title: "Ant Colony",
		filename: "ant_colony.html",
		description: "Simulation of an ant colony creating a never ending underground colony. The 'Q' represents a queen that can giver birth to ants 'A'. Food sources are represented by the numbers 9 - 1. (Currently only works in desktop Chrome)",
		author: "Christopher Powroznik (Metroxe)",
		github: "Metroxe",
		compatibleBrowsers: ["Chrome Desktop"],
	},
	{
		title: "Strange Insults",
		filename: "strange_insults.html",
		description: "An insult generator.",
		author: "Christopher Powroznik (Metroxe)",
		github: "Metroxe",
	},
	{
		title: "Building Price Estimate",
		filename: "building.html",
		description: "Drag the top right corner on the building. Price increases as building gets bigger.",
		author: "Richard Hung (Richard1320)",
		github: "richard1320",
	},
	{
		title: "Fool's Mate",
		filename: "fools-mate.html",
		description: "In chess, Fool's Mate, also known as the Two-Move Checkmate, is the checkmate in the fewest possible number of moves from the start of the game. This play is created by animating grid rows and columns.",
		author: "Chen Hui Jing (huijing)",
		github: "huijing",
		compatibleBrowsers: ["Firefox 66+"],
	},
	{
		title: "Pure CSS Still Life - Water and Lemons",
		filename: "pure-css-still-life-water-lemon.html",
		description: " A Pure CSS Still Life. No images, No SVG, just CSS, absolutely pointless!",
		author: "Ben Evans",
		github: "ivorjetski"
	},
	{
		title: "Calculate Worked Hours",
		filename: "calculate_hours_worked.html",
		description: "Calculates the amount of hours worked based on the start and end time of the work shifts and break times if there is any.",
		author: "Jacky Ly (lyjacky11)",
		github: "lyjacky11",
	},
	{
		title: "Car Game",
		filename: "mini_car_game.html",
		description: "simple car racing game, collecting energys on road, speeds up as many energy consumed, slow down if miss energy on road. driving is unlimited",
		author: "irakli kvirikashvili",
		github: "zghnachvi",
	},
	{
		title: "Color Clock",
		filename: "colorclock.html",
		description: "Shows you the time with a lovely background generated from the current time.",
		author: "mechamech",
		github: "mechamech",
	},
	{
		title: "Color Quiz",
		filename: "color-quiz.html",
		description: "A little quiz about the named colors. You try and guess what the color displayed is called.",
		author: "Andrea Kaminski (Kazeheki)",
		github: "kazeheki"
	},
	{
		title: "KNFL",
		filename: "knfl.html",
		description: "A one-throw-kniffel-like game.",
		author: "Pascal Claisse",
		github: "pclaisse"
	},
	{
		title: "Hangman",
		filename: "hangman.html",
		description: "A hangman game with words about web development.",
		author: "Sandro Roth",
		github: "rothsandro",
	},
	{
		title: "Tile game",
		filename: "tiles.html",
		description: "Tile ordering game.",
		author: "Marc Lajoie",
		github: "quickhand",
	},
	{
		title: "Bits Rain",
		filename: "bits-rain.html",
		description: "It's raining bits.",
		author: "Alexandre Nicolas (Kornflexx)",
		github: "Kornflexx",
	},
	{
		title: "Todo list",
		filename: "todo_list.html",
		description: "Just another one todo list.",
		author: "Rafał Goławski",
		github: "rago4",
	},
	{
		title: "Wargames",
		filename: "wargames.html",
		description: "Recreation of the terminal window from a scene in the movie Wargames.",
		author: "Vasilios Daskalopoulos",
		github: "vasil9v",
	},
	{
		title: "Interval",
		filename: "interval.html",
		description: "Increase reading speed by training in short bursts.",
		author: "John Gillespie",
		github: "olddognewtrix123", 
  	},
	{
		title: "Meat on the Move",
		filename: "meat-on-the-move.html",
		description: "It's meat on the move!",
		author: "Jeff Phillips",
  	},
  	{
    		title: "Just HTML. Mostly.",
		filename: "just_html.html",
		description: "Nothing to see here. This was an HTML challenge, so I tried to do just HTML.",
		author: "Shawn Oden",
		github: "shawnoden",
  	},
  	{
		title: "Bronchalia: The Windy City",
		filename: "bronchalia.htm",
		description: "Battle pathogens as the human immune system.",
		author: "quicksilv3rflash (instructables, reddit)",
		github: "quicksilv3rflash",
	}
];
