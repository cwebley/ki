ki
==

the tournament of champions

TODO: 

--usernames/passwords no spaces?

--passwords encrypted?

--Spaces obviously don't work in tourney names...

--Surrender tournament button

--Save off all curls into a file so i can rerun them with db changes in future?

--Setup mysql real db/ user. secondary db for testing?

--calculate rivals on startup? Redis? in memory? previous 5 or 7 games?

--sure things? 6-1 matchups or better?

--set up web-server, or heroku or something

-dtos in routes? dto.number?

-register and login

-undo button

-UPCOMING package
	on tourney start create and populate array of 20 games per player in upcoming obj
	in tourney stats page? or after game return this?
	

-imminent victory calculator for next 3 games

-team support

-multiplayer support

-update tourney goal? add 50? custom update? refresh winning predictions on update?

-checkpoints: winning predictions? stat summary, best streaks, upcoming matches preview? update on wager stats?

-purposeful rivals/ big matchups? best 2 of 3?

-rivals = defaults then +/- 1 game in last 7 meetings

-stats route to return a players best character in certain categories. accept timestamp query or tourney name
	how many points fire really netted you? 
	this is not the easiest question to ask with the current data.

stats not accounted for:
	teams
	rivalries
	powerups
	most dangerous matchup?

fighterHistory // how is he worth 17 points? breakdown of each incr/decr
	history table?

^^^ 
user-stats/ character-stats(character curStreaks, player streaks, biggest wins, worst losses, recentHistory) 
	Biggest wins list!

user-overall-stats
	spanning multiple tourneys, or over a given data range

powerups: private or public // frequency/interactions of these need to be controlled
	peek/ reorder top 3 for each // only 1 player at a time here
		{g:[spinal,riptor,orchid,tj],bj:[wulf,wulf,kanra,thunder]}
		get,check power avail,get 4 and serve above, use pwr. put pwr/peek accept above, must match correctly


	double/triple probability of certain fighter for 10-20 matches  // needs to be subtle, possible to hide fire guys this way


	choose opponent this round //with info of who you would have faced
		check pwr avail, decr, serve matchup dto, kind of honor system without a game submit double-checker in place

	rematch on loss (first loss doesnt count value, but still resets streak?)
		check pwr avail, getUpcoming(current matchup), value = 0 submit game route, decr pwr


	reseed opponents characters


	subtract 4 total points from opponents values
		put {bj:{jago:2,glacius:1,wulf:1}},
		check pwr avail, 
		validate names,
		check points add to 4,
		decr from charData.value
		decr pwr


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

secret wagers. need interactive front end for this.
maybe these are challenges presented to you?
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

history table for each player? whats the best way to track this?
	id, uid-cid-tid, value, change, eventType, gameId
or store this stuff in redis?


