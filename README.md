ki
==

the tournament of champions

TODO: 

-- any user can enter tournament and submit games. not cool.

--401 page on frontend

--allow for duplicate number in seeeding?

---you can get to the seed form without being owner. probably should put :user in param and requiresOwner mw

--clean up game submission form on back end. use req.session. not all opts necessary.

--usernames/passwords no spaces?

--passwords encrypted?

--Spaces obviously don't work in tourney names...

--Save off all curls into a file so i can rerun them with db changes in future?
 
--Setup mysql real db/ user. secondary db for testing?

--calculate rivals on startup? Redis? in memory? previous 5 or 7 games?

--sure things? 6-1 matchups or better?

--set up web-server, or heroku or something

-undo button
	
-imminent victory calculator for next 3 games

-team support

-multiplayer support

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
penalty for failing these? or just reward for completing?
	supreme
	3 counterbreaks
	streak of wins
	heavy underdog win

how to get wagers?
	start with 1-3
	win previous tournament?
	beat rival?
	checkpoints

achievements? milestones not unique to one tourney:
	beat every character
	win with every character
	highest streak with a character
	highest player streak

powers
	reseed
	reduce 5 pts 10 games. if rematch=true don't decr this value
	peek and arrange 10 games
	rematch
	up odds of char or two for 20ish games	
	choose opponent

users table powerUps, Active
	use power (seed/deduct/peek/rematch/upodds/chooseVictim)
		if powerup active already redirect to powerup form
		powerUp moves to active
		redirct to powerup form
	interact with powerup form (contains alltourney data)
		reseed/deduct points/peek/remtach/inc odds/ choose opponent
		submit and refresh
		power removed from active
	done

need redis for reduce points
	HSET 
	tourneyName.bj.deduct.g.gamesLeft = 10
	tourneyName.bj.deduct.g.characters = [{x:2,y:3,z:3}]