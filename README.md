#The Tournament Of Champions
1v1 full cast fighting game tournament app built with Killer Instinct in mind.
Complete work in progress.

* Node
* Mocha/Chai
* React
* Redux
* [React DnD](https://github.com/gaearon/react-dnd)
* [Material UI](http://www.material-ui.com/)
* Postgres
* Redis
* Webpack
* Babel

##Todo: Upcoming bug fixes and feature additions
* Add previous streak to previous match
* W-L records on seeding component undefined after api bug fix
* lower inspect by 1 matchup
* tournament table "active" column doesn't become false after tournament is over
* inspect sometimes a duplicate uuid gets returned by backend and react doesnt render.

###Random bugs
* Inspect sometimes hides a guy? Not sure what's happening here. Maybe its just Kanra that hides.
* Inspect DnD stuff is pretty slow. Plus there's some bug related to hovering over a long name/fat card that updates every hover event causing a crawl.

###Tournament Creator Page
* Add a clear form button

###Seed Page
* Sort seeds by how you seeded them last time against this opponent if possible
* Show W-L record of each character last time you faced them

###Draft Page
* Sort updated draft data on receipt. data gets shuffled with every update.

###Tournament Landing
* tournament not found message
* crown icon denoting previous champion in a current player matchup
* crown icon denoting previous winner in a character matchup

###Server

###Powers
* Oddsmaker could return a message telling you how many you got

###Setup/Ops
* Kubernetes
* Completely configurable costs, powers, and power settings on a per tournament basis
* SSL
* Mobile first responsive styling
* DnD on touch devices

###New Pages
* tournament index page
* stats page
 * user overall status
 * user-character stats
 * best character matchups
 * best character matchups
 * all of the above vs a particular opponent or across a particular time

###Random Ideas:
* Mirror character
 * Mirrors can go on fire, but mirror matches count for each player

* Achievements
 * beat every character
 * win with every character
 * highest streak with a character
 * highest player streak
 * the charm

* Bosses
 * Calculate rivals on tourney start
* Dominant matchups. blowout differential in recent history 7-0, 6-1, 5-2?
* reimplement imminent victory calculator
* checkpoints: winning predictions? stat summary, best streaks, upcoming matches preview
* game history list on tournament-landing page

##Powerup brainstorming:
* Query
 * 1 cost power to find out when a character is up.
 * maybe this live updates forever or something cool.
 * could even be tied into the matchup inspector

* Meld
 * Risk/ reward kind of power. Blend 2 characters into one.
 * The values for each character average out, and every time one of the melded characters show up, it could be EITHER character
 * The actual matchup isn't decided/resolved until it is the current match. Inspect won't tell you who the melded character is

* reseed opponents characters

* 3 matches (best of 3?) against opponent of your choice given the current character
 * should streaks count here?
 * should rematch be banned?
 * this should probably cost like 5
 * since supremes would be real good
 * since this overrides inspect picks probably

* matchMaker: since KI is a matchup based game and inspect is already good, another way to manipulate matches.
 * choice of 2 or 3 characters for current matchup. choice of 2 or 3 opponents for next matchup
 * or maybe this is better implemented with a feature like bosses

* jack of all trades:
 * count future appearances of all characters in next 15 games,
 * reseed opponent and dock 3 points,
 * grab bag character (or mirror character?):
 * get a random character (least used on your roster? middle value?) that you can use instead of your current character
 * if they win, they swap places with your current character and you can use them whenever you want
 * rematches will still crush the grab bag streak

* steal a character gamble
