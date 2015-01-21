ki
==

the tournament of champions

TODO: 

-Setup mysql real db/ user. secondary db for testing?


--update charactersData streaks+values after gamesvc/saveGame

--End tourney/save final totals upon reaching goal

--accept supreme bool as games data

--calculate rivals on startup? Redis? in memory? previous 5 or 7 games?

--sure things? 6-1 matchups or better?

--set up web-server, or heroku or something


-dtos in routes? dto.number?

-register and login

-output basic stats: current record, points, etc

-undo button

-built in randomizer

-imminent victory calculator for next 3 games

-team support

-multiplayer support

-update tourney goal? add 50? custom update? refresh winning predictions on update?

-checkpoints: winning predictions? stat summary, best streaks, upcoming matches preview? update on wager stats?

-purposeful rivals/ big matchups? best 2 of 3?

-rivals = defaults then +/- 1 game in last 7 meetings

-stats route to return a players best character in certain categories. accept timestamp query or tourney name"
	how many points fire really netted you


stats not accounted for:
	streaks
	teams
	rivalries
	most dangerous matchup?

fighterHistory // how is he worth 17 points? breakdown of each incr/decr

^^^ 
user-stats(character curStreaks, player streaks, biggest wins, worst losses, recentHistory) 
user-overall-stats

character-stats(history, streaks, biggest wins, worst losses, rivals)
character-overall-stats
	
powerups: private or public // frequency/interactions of these need to be controlled
	peek/ reorder top 3 for each // only 1 player at a time here
	double/triple probability of certain fighter for 10-20 matches  // needs to be subtle, possible to hide fire guys this way
	choose opponent this round //with info of who you would have faced
	rematch on loss (first loss doesnt count value, but still resets streak?)
	reseed opponents characters
	subtract 3-5 total points from opponents values
	---
	ice opponent
	best of 3 against opponent of your choice (or top streaker?) (streaks count here? values count here?) // strictly better than rematch? weird interaction with rivals?

how to get powerups?
	wagers?
	streak of 5 wins
	win with every character
	beat every character
	beat rival?
	checkpoints

secret wagers. need interactive front end for this
	supreme
	3 counterbreaks
	streak of wins

how to get wagers?
	start with 1-3
	win previous tournament?
	beat rival?
	checkpoints

achievements? milestones not unique to one tourney:
	beat every character
	highest streak with a character
	highest player streak



how to earn powerups?

