ki
==

the tournament of champions.
1v1 full cast killer instinct 3 tournament app.
complete work in progress. master branch generally stable.

---Tournament Creator Page---
no reasons display on tournament-creator page
opponent field of tournament-creator needs to accept username instead of slug
charactersPerUser field in tournament no default bug fix
review form data

---Seed Page---
Sort seeds by how you seeded them last time against this opponent if possible
Show W-L record of each character last time you faced them

---Draft Page---
backwards seed values on draft screen
3 sort options. by value difference, and by value for each user.
draft needs to say how many picks left and maybe even who the next pick belongs to
show previous pick. maybe with a flash or something?

--Tournament Landing---
show value in the matchup button. Also heating/fire icons or something
better indicator on player card of heating/fire
material-ui determinate progress bar for user scores
crown icon denoting previous champion in a current player matchup
crown icon denoting previous winner in a character matchup


---Server---
undo game tests broken
undo game button
undo game and rematch don't work exactly. game being nuked.

---Powers---
Inspect
Oddsmaker could return a message telling you how many you got

--Setup/Ops--
Kubernetes
Completely configurable costs, powers, and power settings on a per tournament basis
SSL

--New Pages--
tournament index page
stats page
	user overall status
	user-character stats
	best character matchups
	best character matchups
	all of the above vs a particular opponent or across a particular time

Random Ideas:
--Mirror character
--Achievements.
	-beat every character
	-win with every character
	-highest streak with a character
	-highest player streak
	-the charm
--Bosses. Calculate rivals on tourney start
--Dominant matchups. blowout differential in recent history 7-0, 6-1, 5-2?
--reimplement imminent victory calculator
--checkpoints: winning predictions? stat summary, best streaks, upcoming matches preview
--game history list on tournament-landing page

Powerup brainstorming:
	Query
		1 cost power to find out when a character is up.
		maybe this live updates forever or something cool.
		could even be tied into the matchup inspector

	reseed opponents characters

	3 matches (best of 3?) against opponent of your choice given the current character
		should streaks count here?
		should rematch be banned?
		this should probably cost like 5
			since supremes would be real good
			since this overrides inspect picks probably

	matchMaker: since KI is a matchup based game and inspect is already good, another way to manipulate matches.
		choice of 2 or 3 characters for current matchup. choice of 2 or 3 opponents for next matchup
		or maybe this is better implemented with a feature like bosses

	jack of all trades:
		count future appearances of all characters in next 15 games,
		reseed opponent and dock 3 points,
		grab bag character (or mirror character?):
			get a random character (least used on your roster? middle value?) that you can use instead of your current character
			if they win, they swap places with your current character and you can use them whenever you want
				rematches will still crush the grab bag streak

	steal a character gamble
