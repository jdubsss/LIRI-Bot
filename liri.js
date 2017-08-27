// LIRI notes:

// this app will print latest tweets: node liri.js my-tweets
// node liri.js spotify-this-song '<song name here>'
    // This will show the following information about the song in your terminal/bash window
            // Artist(s)
            // The song's name
            // A preview link of the song from Spotify
            // The album that the song is from


// node liri.js movie-this '<movie name here>'

//         This will output the following information to your terminal/bash window:
        
//         * Title of the movie.
//         * Year the movie came out.
//         * IMDB Rating of the movie.
//         * Rotten Tomatoes Rating of the movie.
//         * Country where the movie was produced.
//         * Language of the movie.
//         * Plot of the movie.
//         * Actors in the movie.



// node liri.js do-what-it-says
    // Using the fs Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
        // It should run spotify-this-song for "I Want it That Way," as follows the text in random.txt.
        // Feel free to change the text in that document to test out the feature for other commands.


// ---------------------------

//Required npm packages
var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var fs = require('fs');

var keys = require('./keys.js');
var twitterKeys = keys.twitterKeys;


// take in user Cmd line input
var userInput = process.argv;
var liriCommand = userInput[2];

var liriArguement = '';
for (var i = 3; i < userInput.length; i++) {
	liriArguement += userInput[i] + ' ';
}

// retrieveTweets will retrieve last 20 tweets and display with the date
function retrieveTweets() {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js my-tweets\n\n', function(err) {
		if (err) throw err;
	});

	// Initialize the Twitter client
	var client = new Twitter(twitterKeys);

	// Link to my Twitter page
	var parametereters = {screen_name: 'joshuamweber', count: 20};

	// Retrieve  last 20 tweets
	client.get('statuses/user_timeline', parametereters, function(error, tweets, response) {
		if (error) {
			var errorString = 'ERROR: Retrieving user tweets -- ' + error;

			// Append the error string to the log file
			fs.appendFile('./log.txt', errorString, function(err) {
				if (err) throw err;
				console.log(errorString);
			});
			return;
		} else {
			// Beautify printed user tweets
			var outputString = '------------------------\n' +
							'User Tweets:\n' + 
							'------------------------\n\n';

			for (var i = 0; i < tweets.length; i++) {
				outputString += 'Created on: ' + tweets[i].created_at + '\n' + 
							 'Tweet content: ' + tweets[i].text + '\n' +
							 '------------------------\n';
			}

			// Append output to log file
			fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputString + '\n', function(err) {
				if (err) throw err;
				console.log(outputString);
			});
		}
	});
}

// spotifySong will retrieve information on a song from Spotify
function spotifySong(song) {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js spotify-this-song ' + song + '\n\n', function(err) {
		if (err) throw err;
	});

	// LIRI defaults to 'The Sign' by Ace Of Base
	var search;
	if (song === '') {
		search = 'The Sign Ace Of Base';
	} else {
		search = song;
	}

	spotify.search({ type: 'track', query: search}, function(error, data) {
	    if (error) {
			var errorSpotify = 'ERROR: Retrieving Spotify track -- ' + error;

			// Append  error string to log file
			fs.appendFile('./log.txt', errorSpotify, function(err) {
				if (err) throw err;
				console.log(errorSpotify);
			});
			return;
	    } else {
			var songInfo = data.tracks.items[0];
			if (!songInfo) {
				var errorSpotify2 = 'ERROR: No song info retrieved, please check the spelling of the song name!';

				// Append  error string to  log file
				fs.appendFile('./log.txt', errorSpotify2, function(err) {
					if (err) throw err;
					console.log(errorSpotify2);
				});
				return;
			} else {
				// Prettify  song information
				var outputString = '------------------------\n' + 
								'Song Information:\n' + 
								'------------------------\n\n' + 
								'Song Name: ' + songInfo.name + '\n'+ 
								'Artist: ' + songInfo.artists[0].name + '\n' + 
								'Album: ' + songInfo.album.name + '\n' + 
								'Preview Here: ' + songInfo.preview_url + '\n';

				// Append output to the log file
				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputString + '\n', function(err) {
					if (err) throw err;
					console.log(outputString);
				});
			}
	    }
	});
}

// retrieveOMDBInfo will get information on a movie from the OMDB api
function retrieveOBDBInfo(movie) {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js movie-this ' + movie + '\n\n', function(err) {
		if (err) throw err;
	});

	// If no movie is provided, LIRI defaults to 'Mr. Nobody'
	var search;
	if (movie === '') {
		search = 'Mr. Nobody';
	} else {
		search = movie;
	}

	// Replace spaces with '+' for the query string
	search = search.split(' ').join('+');

	// Construct the query string
	var queryStr = 'http://www.omdbapi.com/?t=' + search + '&plot=full&tomatoes=true';

	// Send the request to OMDB
	request(queryStr, function (error, response, body) {
		if ( error || (response.statusCode !== 200) ) {
			var errorSpotify = 'ERROR: Retrieving OMDB entry -- ' + error;

			// Append the error string to the log file
			fs.appendFile('./log.txt', errorSpotify, function(err) {
				if (err) throw err;
				console.log(errorSpotify);
			});
			return;
		} else {
			var data = JSON.parse(body);
			if (!data.Title && !data.Released && !data.imdbRating) {
				var errorSpotify2 = 'ERROR: No movie info retrieved, please check the spelling of the movie name!';

				// Append the error string to the log file
				fs.appendFile('./log.txt', errorSpotify2, function(err) {
					if (err) throw err;
					console.log(errorSpotify2);
				});
				return;
			} else {
		    	// Pretty print the movie information
		    	var outputString = '------------------------\n' + 
								'Movie Information:\n' + 
								'------------------------\n\n' +
								'Movie Title: ' + data.Title + '\n' + 
								'Year Released: ' + data.Released + '\n' +
								'IMBD Rating: ' + data.imdbRating + '\n' +
								'Country Produced: ' + data.Country + '\n' +
								'Language: ' + data.Language + '\n' +
								'Plot: ' + data.Plot + '\n' +
								'Actors: ' + data.Actors + '\n' + 
								'Rotten Tomatoes Rating: ' + data.tomatoRating + '\n' +
								'Rotten Tomatoes URL: ' + data.tomatoURL + '\n';

				// Append the output to the log file
				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputString + '\n', function(err) {
					if (err) throw err;
					console.log(outputString);
				});
			}
		}
	});
}

// finalApp will read in a file to determine the desired command and then execute
function finalApp() {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js do-what-it-says\n\n', function(err) {
		if (err) throw err;
	});

	// Read in the file containing the command
	fs.readFile('./random.txt', 'utf8', function (error, data) {
		if (error) {
			console.log('ERROR: Reading random.txt -- ' + error);
			return;
            } else {
                // Split out the command name and the parametereter name
                var commandString = data.split(',');
                var command = commandString[0].trim();
                var parameter = commandString[1].trim();
                
                //trying out a switch function...
                switch(command) {
                    case 'my-tweets':
                        retrieveTweets(); 
                        break;

                    case 'spotify-this-song':
                        spotifySong(parameter);
                        break;

                    case 'movie-this':
                        retrieveOBDBInfo(parameter);
                        break;
                }
            }
	});
}

// Determine which LIRI command is being requested by the user
if (liriCommand === 'my-tweets') {
	retrieveTweets(); 

    } else if (liriCommand === `spotify-this-song`) {
        spotifySong(liriArguement);

        } else if (liriCommand === `movie-this`) {
            retrieveOBDBInfo(liriArguement);

            } else if (liriCommand ===  `do-what-it-says`) {
                finalApp();

                } else {
                    // Append the command to the log file
                    fs.appendFile('./log.txt', 'User Command: ' + userInput + '\n\n', function(err) {
                        if (err) throw err;

                        // If the user types in a command that LIRI does not recognize, output the Usage menu 
                        // which lists the available commands.
                        outputString = 'Usage:\n' + 
                                '    node liri.js my-tweets\n' + 
                                '    node liri.js spotify-this-song "<song_name>"\n' + 
                                '    node liri.js movie-this "<movie_name>"\n' + 
                                '    node liri.js do-what-it-says\n';

                        // Append the output to the log file
                        fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputString + '\n', function(err) {
                            if (err) throw err;
                            console.log(outputString);
                        });
                    });
                }