ki
==

the tournament of champions.
1v1 full cast killer instinct 3 tournament app. 
complete work in progress. master branch generally stable.

Issues 8/14:
undo button inconsistencies with powers or streak points or something

TODO: 

--api middleware overhaul to protect and simplfy resources. can't submit the incorrect games. cant submit games as non-tourney player etc.

--username and tournament name restrictions?

--password salting, make better use of JWTs?

--set up dbs in VMs. docker up, add npm scripts or something.

--data tests? fixtures for a dev db?
 
--Bosses. Calculate rivals on tourney start? other stuff.

--dominant matchups? evenish seeds but blowout differential in recent history 7-0, 6-1, 5-2?

--host in cloud

--reimplement imminent victory calculator?

-checkpoints: winning predictions? stat summary, best streaks, upcoming matches preview?

-stats route to return a players best character in certain categories. accept timestamp query or tourney name
	how many points fire really netted you? 
	most dangerous matchup?

fighterHistory // how is he worth 17 points? breakdown of each incr/decr

user-stats/ character-stats(character curStreaks, player streaks, biggest wins, worst losses, recentHistory) 
	Biggest wins list!

user-overall-stats
	spanning multiple tourneys, or over a given data range

draft for characters. probably necessary with s3 announcement.

powerups ideas:
	reseed opponents characters

	subtract 4 total points from opponents values

	best of 3 against opponent of your choice (or top streaker?) (streaks count here? values count here?)

	matchMaker: since KI is a matchup based game and inspect is already good, another way to manipulate matches.
		choice of 2 or 3 characters for current matchup. choice of 2 or 3 opponents for next matchup		
		or maybe this is better implemented in bosses.

	jack of all trades: 
		count future appearances of certain characters in next 15 games,
		reseed opponent and dock 3 points,
		matchMaker stuff for next 2 games?

	something to manipulate draft results?

achievements? milestones not unique to one tourney:
	beat every character
	win with every character
	highest streak with a character
	highest player streak
	the charm

icon denoting previous champion in a current player matchup
icon denoting previous winner in a character matchup

iterate through history table and clean up aggregate w/l data for players and characters. gets messed up after deleting tournaments.
