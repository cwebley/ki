ki
==

the tournament of champions.
1v1 full cast killer instinct 3 tournament app. 
complete work in progress. master branch generally stable.

TODO: 

--api middleware overhaul to protect and simplfy resources. can't submit the incorrect games. cant submit games as non-tourney player etc.

--username and tournament name restrictions?

--password protection? Make better use of JWTs?

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

powerups:
	reseed opponents characters

	subtract 4 total points from opponents values
		put {bj:{jago:2,glacius:1,wulf:1}},
		check pwr avail, 
		validate names,
		check points add to 4,
		decr from charData.value
		decr pwr

	best of 3 against opponent of your choice (or top streaker?) (streaks count here? values count here?)

achievements? milestones not unique to one tourney:
	beat every character
	win with every character
	highest streak with a character
	highest player streak