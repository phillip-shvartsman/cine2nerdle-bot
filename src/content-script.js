let last_local_id = ""
let list_of_options = []
const CHAR_PER_MS = (1/(300/60)) * 1000
let last_send = Date.now();
let current_year = new Date().getFullYear()
var all_options = []
var pop_sum = 0
var try_movie = true
var guess_done = false

let all_played_movies = []
let all_played_actors = {}

function wait_for_min_delay()
{
    let current_time = Date.now();
    // this is bad but idc    
    while(current_time < (last_send + CHAR_PER_MS))
    {
      current_time = Date.now();
    }
    last_send = current_time
}

function setGuessDone()
{
	guess_done = true
}

function sendEnter(el)
{
	el.focus()
	const ke = new KeyboardEvent('keydown', {
    	bubbles: true, cancelable: true, keyCode: 13
	});
	document.body.dispatchEvent(ke);

	// create a new keyboard event and set the key to "Enter"
	const event = new KeyboardEvent('keydown', {
	  key: 'Enter',
	  code: 'Enter',
	  which: 13,
	  keyCode: 13,
	});

	// dispatch the event on some DOM element
	el.dispatchEvent(event);
	if(document.getElementsByClassName("battle-board-submit-timer")[0] != null)
	{
		document.getElementsByClassName("battle-board-submit-timer")[0].click()
	}
	setTimeout(setGuessDone,1000)
}

function inputString(el,str)
{
	for (let i = 0; i < str.length; i++) {
		setTimeout(imitateKeyInput, i * CHAR_PER_MS,el, str.charAt(i))
	}
	setTimeout(sendEnter,(str.length + 1) * CHAR_PER_MS, el)
}

function imitateKeyInput(el, keyChar) {
  if (el) {
    const keyboardEventInit = {bubbles:false, cancelable:false, composed:false, key:'', code:'', location:0};
    el.dispatchEvent(new KeyboardEvent("keydown", keyboardEventInit));
    el.value = el.value.concat(keyChar);
    el.dispatchEvent(new KeyboardEvent("keyup", keyboardEventInit));
    el.dispatchEvent(new Event('change', {bubbles: true})); // usually not needed
  } else {
    console.log("el is null");    
  }
}

async function main_task() {
	const boxes = Array.from(document.getElementsByClassName('battle-board-movie'));
	const connections = Array.from(document.getElementsByClassName('connection-name'));
	console.log(`Main task running, found ${boxes.length} movie titles, ${connections.length} connections`)
	const helper_class_name = "has-helper-links"
	const game_over_class = "battle-board-game-over"
	const expanded_connection_class = "expanded-connection"
	const more_links_text = "MORE LINK"
	const battle_score_timer_class = "battle-score-timer"
	const battle_over_class = "battle-over"
	const battle_input_class = "battle-input"
	const battle_home_button = "battle-home-button"
	const link_enable_key = "link_enable"
	const battle_helper_id = "battle-helper"
	const battle_over_title = "Battle Over"
	const battle_home_title = "Battle Home"
	const current_movie_help_id = "current_movie_help"

	let timer_elements = document.getElementsByClassName(battle_score_timer_class)
	let battle_over_elements = document.getElementsByClassName(battle_over_class)
	let battle_input_elements = document.getElementsByClassName(battle_input_class)
	let battle_home_button_elements = document.getElementsByClassName(battle_home_button)

	let your_turn = false;
	// if any battle over elemts exist, we know the battle is over
	if(battle_over_elements.length > 0)
	{
		document.title = battle_over_title
		all_played_movies = []
		all_played_actors = {}
	}
	// if any battle home elements exist we know we are in the battle home
	else if(battle_home_button_elements > 0)
	{
		document.title = battle_home_title
		all_played_movies = []
		all_played_actors = {}
	}
	else
	{
		let turn = ""
		// if we have some input elements we know it is our turn
		if(battle_input_elements.length > 0)
		{
			turn = "Your Turn"
			your_turn = true;

		}
		else
		{
			turn = "Opponents Turn"
		}
		let current_timer_value = ""
		// make sure the time exists first, before grabbing the value and setting the title
		if(timer_elements.length > 0)
		{
			current_timer_value = timer_elements[0].textContent
			document.title = `${turn}, ${current_timer_value} secs left`
		}
		else
		{
			your_turn = false
		}
	}

	// Grab the link enable value to use

    let result = await chrome.storage.local.get([link_enable_key]);
    let add_links = false
    if(result != undefined)
    {
    	if(result[`${link_enable_key}`] == "true")
    	{
    		add_links = true
    	}
	}

    // Go through each of the movie boxes
    for(box of boxes)
    {
		// we've already been to this box
		if(box.classList.contains(helper_class_name))
		{
			continue
		}

		// skip the game over box
		if(box.classList.contains(game_over_class))
		{
			box.classList.add(helper_class_name);
			continue
		}

		// remove everything except for the title from the movie boxx
		let full_content = box.textContent;
		let unused_content = "";
		for (const child of box.children) {
				unused_content = unused_content.concat(child.textContent);
		}
		let unused_content_length = unused_content.length
		// just the movie title is here
		let used_content = full_content.substring(unused_content_length);

		// add links
		if(add_links)
		{
			var spacer = document.createTextNode(" ");
			box.append(spacer)
			// Google
			let google_search = used_content.replace(" ","+")
			google_search = google_search.concat("+cast") 
			let google_link=`https://www.google.com/search?q=${google_search}`
			var google_link_element = document.createElement('a');
	      	var linkText = document.createTextNode("Cast");
	      	google_link_element.appendChild(linkText);
	      	google_link_element.href = google_link;
			google_link_element.target = "_blank"
			box.append(google_link_element)
		}
		box.classList.add(helper_class_name);
		// format for message to background worker
		let year = used_content.split(' ').slice(-1)[0].replace("(","").replace(")","")
		let title = used_content.split(' ').slice(0,-1).join(' ')
		let local_id = `${title} (${year})`
		last_local_id = local_id

		// try to get the movie title in the local storage, if it doesn't exist ask the background worker to fetch the information
		let response = await chrome.storage.local.get([local_id]);
		if (typeof response[local_id] === 'undefined') 
		{
			let message = {"type": "movie","title":title, "year":year, "local_id":local_id}
			console.log("New movie sending message to background task to populate db")
			console.log(message)
			const response = await chrome.runtime.sendMessage(message);
		} 
		// save off the move to played movies, so we don't use it in the future
		all_played_movies.push(local_id)
		console.log("all_played_movies")
		console.log(all_played_movies)
	}
	for(con of connections)
	{
		// skip if we've already seen this movie
		if(con.classList.contains(helper_class_name))
		{
			continue
		}

		// connections only have the actors name in the text context
		let full_content = con.textContent

		// get lowercase name and save so we can skip later, if necessary
		let lower_case_name = full_content.toLowerCase()
		if(lower_case_name in all_played_actors)
		{
			all_played_actors[lower_case_name] = all_played_actors[lower_case_name] + 1;
		}
		else
		{
			all_played_actors[lower_case_name] = 1
		}
		if(full_content.includes(more_links_text))
		{
			con.classList.add(helper_class_name)
			return;
		}

		// add links if necessary
		if(add_links)
		{
			var spacer = document.createTextNode(" ");
			con.append(spacer)

			//Google
			let google_search = full_content.replace(" ","+")
			google_search = google_search.concat("+movies") 
			let google_link=`https://www.google.com/search?q=${google_search}`
			var google_link_element = document.createElement('a');
	      	var linkText = document.createTextNode("Movies");
	      	google_link_element.appendChild(linkText);
	      	google_link_element.href = google_link;
			google_link_element.target = "_blank"
			con.append(google_link_element)
		}
		con.classList.add(helper_class_name);
		console.log("all_played_actors")
		console.log(all_played_actors)
	}

	// The 'battle-helper' contains a list of actor connections and there most famous movies
	// If its our turn create it
	if(your_turn && document.getElementById(battle_helper_id) === null)
	{
		let add_block = document.getElementsByClassName("main")[0]
		let parent_div = document.getElementById("App")
		let new_div = document.createElement("div")
		new_div.id = battle_helper_id
		parent_div.insertBefore(new_div,add_block)
	}
	else if(your_turn && document.getElementById(battle_helper_id) != null)
	{

	}
	// if its not our turn delte the battle-help
	else if(document.getElementById(battle_helper_id) != null)
	{
		document.getElementById(battle_helper_id).remove()
	}

	if(document.getElementById(battle_helper_id) != null)
	{
		// current move help is the header in the battle helper containing the movie name
		if(document.getElementById(current_movie_help_id) == null)
		{
			guess_done = true
			all_options = []
			pop_sum = 0
			// Get the last movie id that popped up, we can do this since movies only appear one at a time
			let response = await chrome.storage.local.get([last_local_id]);
			if (typeof response[last_local_id] === 'undefined')
			{
				// this can happen since the background thread and the content thread are not sync'd return early if the move info
				// doesn't exist in the local storage, if the move is in the local storage we can assume all the relevent actor information also exists
				console.log(`${last_local_id} is undefined in the local storage`)
				return
			}
			// append the current movie help, just the id
			let move_title = document.createElement("p");
			move_title.textContent = last_local_id
			move_title.id = current_movie_help_id
			document.getElementById(battle_helper_id).append(move_title)

			let data = response[last_local_id];
			// loop through the top cast of the movie and grab from local storage
			for(cast_member of data["cast"])
			{
				let lower_case_name = cast_member["name"].toLowerCase()
				{
					if(lower_case_name in all_played_actors)
					{
						// skip the cast member if they have been played 3 times
						all_played_actors[lower_case_name] >= 3
						console.log(`Skipping ${cast_member["name"]} link has already been played 3 times`)
						continue
					}
				}
				let actor_p = document.createElement("p")
				
				// Get all popular movies we have saved for that actor
				let actor_response = await chrome.storage.local.get([cast_member["name"]])
				if('name' in actor_response[cast_member["name"]])
				{
					actor_p.textContent = actor_response[cast_member["name"]]["name"]
					for(credit of actor_response[cast_member["name"]]["credited"])
					{
						let release_year = credit["release_date"].substring(0,4);
						actor_p.textContent = actor_p.textContent.concat(`|${credit['original_title']} (${release_year})`)
						let to_push_title = `${credit['original_title']} (${release_year})`;
						let popularity = credit["popularity"]
						// we use popularity to weight which movie to play
						// set to zero if the movie has already been played
						for(played_movie of all_played_movies)
						{
							if(to_push_title == played_movie)
							{
								popularity = 0
							}
						}
						// don't play movies which haven't been released or from the current year
						if(release_year >= current_year)
						{
							popularity = 0
						}
						all_options.push({title:to_push_title,popularity:popularity})
						// keep track of the total popularity
						pop_sum = pop_sum + popularity
					}
					document.getElementById(battle_helper_id).append(actor_p)
				}
			}
		}
		else
		{
			// if the movie has changed delete whats in the current movie help
			// this code should never be hit
			let move_title_elem = document.getElementById(current_movie_help_id)
			if(move_title_elem.textContent != last_local_id)
			{
				document.getElementById(current_movie_help_id).innerHTML = ""
				all_options = []
				pop_sum = 0
			}
		}	
	}

	// if its our turn try to guess
	if(your_turn && guess_done && all_options.length > 0)
	{
		guess_done = false
		document.getElementsByClassName("battle-input-clear")[0].click()

		// get a random pop and go trough the list of possible movies and subtract their pop
		// when the pop left is less than zero, choose that movie. This applies weight to more
		// popular movies and movies which have many connections with the current movie
		let random_pop = Math.random() * pop_sum;
		let pop_left = random_pop
		console.log(`All options, length ${all_options.length}:`)
		console.log(`Choosing with pop ${random_pop}/${pop_sum}`)
		let chosen_index = 0
		for(let i = 0; i < all_options.length ; i++)
		{
			pop_left = pop_left - all_options[i].popularity
			if(pop_left < 0)
			{
				chosen_index = i

				// once we have chose the movie, remove it from the options and update the pop sum
				let title_to_remove = all_options[chosen_index].title
				for(let j = 0;j < all_options.length;j++)
				{
					if(all_options[j].title == title_to_remove)
					{
						pop_sum = pop_sum - all_options[j].popularity
						all_options[j].popularity = 0
					}
				}
				all_played_movies.push(title_to_remove)
				break
			}
		}
		let chosen_option = all_options[chosen_index];
		console.log(all_options)
		console.log(`Chosen Index ${chosen_index}, ${chosen_option.title}`)
		inputString(document.getElementsByClassName(battle_input_class)[0], chosen_option.title)		
	}
}

// test message used to check the background task without play a match
//let test_message = {"type": "movie","title":"The Prestige", "year":2006, "local_id":"The Prestige 2006"}
//chrome.runtime.sendMessage(test_message);

setInterval(main_task, 250);
