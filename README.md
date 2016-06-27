ki
==

the tournament of champions.
1v1 full cast killer instinct 3 tournament app.
complete work in progress. master branch generally stable.

TODO:

--m-ui determinate progress bar for scores

--Bosses. Calculate rivals on tourney start?

--dominant matchups? blowout differential in recent history 7-0, 6-1, 5-2?

--kubernetes

--reimplement imminent victory calculator?

-checkpoints: winning predictions? stat summary, best streaks, upcoming matches preview?

-stats route to return a players best character in certain categories. accept timestamp query or tourney name
	how many points fire really netted you?
	most dangerous matchup?

fighterHistory // how is he worth 17 points? breakdown of each incr/decr

user-stats/ character-stats(character curStreaks, player streaks, biggest wins, worst losses, recentHistory)
	Biggest wins list

user-overall-stats
	spanning multiple tourneys, or over a given data range

powerups ideas:
	reseed opponents characters

	3 matches (best of 3?) against opponent of your choice given the current character
		should streaks count here?
		should rematch be banned?
		this should probably cost like 5
			since supremes would be real good
			since this overrides inspect picks probably

	matchMaker: since KI is a matchup based game and inspect is already good, another way to manipulate matches.
		choice of 2 or 3 characters for current matchup. choice of 2 or 3 opponents for next matchup
		or maybe this is better implemented in bosses.

	jack of all trades:
		count future appearances of all characters in next 15 games,
		reseed opponent and dock 3 points,
		grab bag character (or mirror character?):
			get a random character (least used on your roster? middle value?) that you can use instead of your current character
			if they win, they swap places with your current character and you can use them whenever you want
				rematches will still crush the grab bag streak

	deduct points: use this power to deduct 1-3 points from opponent's characters.
		probably strong in small games and weak in big games
		cant use while you're inspecting?


	something to manipulate draft results?

achievements? milestones not unique to one tourney:
	beat every character
	win with every character
	highest streak with a character
	highest player streak
	the charm

icon denoting previous champion in a current player matchup
icon denoting previous winner in a character matchup
