let last_local_id = ""
let list_of_options = []
const CHAR_PER_MS = (1/(240/60)) * 1000
let last_send = Date.now();
var all_options = []
var try_movie = true
var guess_done = false

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
	setTimeout(setGuessDone,CHAR_PER_MS)
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
	let timer_elements = document.getElementsByClassName(battle_score_timer_class)
	let battle_over_elements = document.getElementsByClassName(battle_over_class)
	let battle_input_elements = document.getElementsByClassName(battle_input_class)
	let battle_home_button_elements = document.getElementsByClassName(battle_home_button)
	let your_turn = false;
	if(battle_over_elements.length > 0)
	{
		document.title = "Battle Over"
	}
	else if(battle_home_button_elements > 0)
	{
		document.title = "Battle Home"
	}
	else
	{
		let turn = ""
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

	const link_enable_key = "link_enable"
    let result = await chrome.storage.local.get([link_enable_key]);
    let add_links = result[`${link_enable_key}`];

    if(add_links != undefined)
    {
    	if(add_links === "false")
    	{
    		
    	}
    }
    else
    {
    	add_links = true
    }

	boxes.filter(box => box.classList.contains(helper_class_name) === false).forEach(async (box) => {
		if(box.classList.contains(game_over_class))
		{
			box.classList.add(helper_class_name);
			return
		}
		let full_content = box.textContent;
		let unused_content = "";
		for (const child of box.children) {
  			unused_content = unused_content.concat(child.textContent);
		}
		let unused_content_length = unused_content.length
		let used_content = full_content.substring(unused_content_length);
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
			box.classList.add(helper_class_name);
		}
		let year = used_content.split(' ').slice(-1)[0].replace("(","").replace(")","")
		let title = used_content.split(' ').slice(0,-1).join(' ')
		let local_id = `${title} ${year}`
		last_local_id = local_id
		let response = await chrome.storage.local.get([local_id]);

		if (typeof response[local_id] === 'undefined') 
		{
			let message = {"type": "movie","title":title, "year":year, "local_id":local_id}
			console.log("New movie sending message to background task to populate db")
			console.log(message)
			const response = await chrome.runtime.sendMessage(message);
			console.log("Got response")
			console.log(response)
		} 
	  });

	connections.filter(con => con.classList.contains(helper_class_name) === false).forEach(async (con) => {
		//let parent_node = con.parentNode
		//if(parent_node.classList.contains(expanded_connection_class))
		//{
		//	con.classList.add(helper_class_name);
		//	return;
		//}

		let full_content = con.textContent
		if(full_content.includes(more_links_text))
		{
			con.classList.add(helper_class_name)
			return;
		}

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
			con.classList.add(helper_class_name);
		}
	});
	
	if(your_turn && document.getElementById("battle-helper") === null)
	{
		let add_block = document.getElementsByClassName("main")[0]
		let parent_div = document.getElementById("App")
		let new_div = document.createElement("div")
		new_div.id = "battle-helper"
		parent_div.insertBefore(new_div,add_block)
	}
	else if(your_turn && document.getElementById("battle-helper") != null)
	{

	}
	else if(document.getElementById("battle-helper") != null)
	{
		document.getElementById("battle-helper").remove()
	}

	if(document.getElementById("battle-helper") != null)
	{
		if(document.getElementById("current_movie_help") == null)
		{
			guess_done = true
			all_options = []
			let response = await chrome.storage.local.get([last_local_id]);
			if (typeof response[last_local_id] === 'undefined')
			{
				console.log(`${last_local_id} is undefined in the local storage`)
				return
			}
			let move_title = document.createElement("p");
			move_title.textContent = last_local_id
			move_title.id = "current_movie_help"
			document.getElementById("battle-helper").append(move_title)

			let data = response[last_local_id];
			console.log(response)
			console.log(data)
			console.log(data["cast"])
			for(cast_member of data["cast"])
			{
				let actor_p = document.createElement("p")
				console.log(cast_member["name"])
				let actor_response = await chrome.storage.local.get([cast_member["name"]])
				console.log(actor_response)
				if('name' in actor_response[cast_member["name"]])
				{
					actor_p.textContent = actor_response[cast_member["name"]]["name"]
					console.log(actor_response[cast_member["name"]]["credited"])
					actor_response[cast_member["name"]]["credited"].forEach(async(credit)=>{
						let release_year = credit["release_date"].substring(0,4);
						actor_p.textContent = actor_p.textContent.concat(`|${credit['original_title']} (${release_year})`)
						all_options.push(`${credit['original_title']} (${release_year})`)
					});
					document.getElementById("battle-helper").append(actor_p)
				}
			}
		}
		else
		{
			let move_title_elem = document.getElementById("current_movie_help")
			if(move_title_elem.textContent != last_local_id)
			{
				document.getElementById("current_movie_help").innerHTML = ""
				all_options = []
			}
		}	
	}

	if(your_turn && guess_done && all_options.length > 0)
	{
		guess_done = false
		document.getElementsByClassName("battle-input-clear")[0].click()
		let random_index = Math.floor(Math.random() * all_options.length);
		console.log(`All options, length ${all_options.length}:`)
		console.log(all_options)
		let random_option = all_options[random_index];
		console.log(`Choosing ${random_option} as a random_option from index ${random_index}`)
		inputString(document.getElementsByClassName("battle-input")[0], random_option)		
	}
}

//let test_message = {"type": "movie","title":"The Prestige", "year":2006, "local_id":"The Prestige 2006"}
//chrome.runtime.sendMessage(test_message);

setInterval(main_task, 250);
