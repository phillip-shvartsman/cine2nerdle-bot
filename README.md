# cine2nerdle-bot

A chrome extension which plays the cine2nerdle battle game for you. This is just a fun little thing I worked on to help get familiar with chrome extensions, I promise I am not running it all night, terrorizing the cine2nerdle battle community....

Scrapes the cine2nerdle battle page for the current movie titles and game state. Uses the TMDB api to get the current movie credits, and most popular movies for the most popular actors in that movie. Caches the results in chrome.storage.local. It is currently pretty dumb and just randomly plays a movie from that set. If it fails with the movie it chooses it just tries again with another random movie, but this is already enough to very easily beat human players.

Everything is basic javascript/html and webpack (for some reason....)

For TMDB, please use the READ ACCESS TOKEN, not the API KEY. 
