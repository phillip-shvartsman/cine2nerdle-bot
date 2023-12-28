function main_task() {
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
	}
	boxes.filter(box => box.classList.contains(helper_class_name) === false).forEach(box => {
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
	  });

	connections.filter(con => con.classList.contains(helper_class_name) === false).forEach(con => {
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
	});
}

setInterval(main_task, 250);