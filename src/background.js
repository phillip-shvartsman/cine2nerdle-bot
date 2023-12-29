var min_delay_ms = 1/30 * 1000;
var last_send = Date.now();
var current_time;
const MAX_NUM_ACTORS_PER_MOVIE = 10;
const MAX_NUM_MOVIES_PER_ACTOR = 10;
function wait_for_min_delay()
{
    let current_time = Date.now();
    // this is bad but idc    
    while(current_time < (last_send + min_delay_ms))
    {
      current_time = Date.now();
    }
    last_send = current_time
}
let token = undefined;

async function getToken()
{
  const tmdb_api_key = "tmdb_api_key"
  if(token === undefined)
  {
      let bearer_token_result = await chrome.storage.local.get([tmdb_api_key]);
      token = bearer_token_result[tmdb_api_key]  
      console.log(`Found token ${token}`)
      return true;
  }
  return false;
}

async function getMovieData(title, year) {
  await getToken()
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1&year=${encodeURIComponent(year)}`;
  console.log(`Request Movie Info for ${title} ${year}`)
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };  
  wait_for_min_delay()
  let response = await fetch(url, options)
  return response.json()
}

async function getMovieCredits(id)
{
  getToken()
  const url = `https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`;
  console.log(`Request Movie credits for ${id}`)
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };  
  wait_for_min_delay()
  let response = await fetch(url, options)
  return response.json()
}

async function getActorMovieCredits(id)
{
  getToken()
  const url = `https://api.themoviedb.org/3/person/${id}/movie_credits`;
  console.log(`Request Movie credits For Actor Id ${id}`)
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };  
  wait_for_min_delay()
  let response = await fetch(url, options)
  return response.json()
}

async function actorSaved(name)
{
  let actor_result = await chrome.storage.local.get([name]);

  if (typeof actor_result[name] === 'undefined') {
    console.log(`No results for actor ${name}`)
    return false; 
  } else {
    return true;
  }
}

chrome.runtime.onMessage.addListener(async function (message, sender, senderResponse) {

  console.log("Received message:")
  console.log(message)
  if (message.type === "movie") 
  {
    let title = message.title
    let year = message.year
    let local_id = message.local_id
    let movie_data = await getMovieData(title, year)
    //console.log("Movie Data:")
    //console.log(movie_data)
    let first_result = movie_data.results[0];

    console.log(first_result)
    // clean out first result
    delete first_result["adult"]
    delete first_result["backdrop_path"]
    delete first_result["genre_ids"]
    delete first_result["original_language"]
    delete first_result["overview"]
    delete first_result["poster_path"]
    delete first_result["release_date"]
    delete first_result["video"]
    delete first_result["vote_average"]
    delete first_result["vote_count"]
    console.log(first_result)
    let movie_id = first_result.id;

    let credits = await getMovieCredits(movie_id)
    //console.log("Credits:")

    let cast = credits.cast
    //console.log(cast)
    let sorted_cast = cast.sort((a,b)=>{
      if(a.popularity < b.popularity)
      {
        return 1;
      }
      else
      {
        return -1;
      }
    })
    //console.log(sorted_cast)
    let most_popular_cast = []
    if(sorted_cast.length <= MAX_NUM_ACTORS_PER_MOVIE)
    {
      most_popular_cast = sorted_cast
    }
    else
    {
      most_popular_cast = sorted_cast.slice(0,MAX_NUM_ACTORS_PER_MOVIE)
    }
    for(let actor of most_popular_cast)
    {
      delete actor.adult
      delete actor.cast_id
      delete actor.character
      delete actor.credit_id
      delete actor.gender
      delete actor.known_for_department
      delete actor.order
      delete actor.original_name
      delete actor.profile_path
    }
    //console.log(most_popular_cast)
    first_result["cast"] = most_popular_cast
    first_result["year"] = year

    let most_popular_cast_clone = structuredClone(most_popular_cast)
    for(let actor of most_popular_cast_clone)
    {
      console.log(actor.name)
      if(await actorSaved(actor.name))
      {
        continue;
      }
      else
      {
        let actor_credits = await getActorMovieCredits(actor.id);
        let cast_credits = actor_credits.cast
        let sorted_cast_credits = cast_credits.sort((a,b)=>{
          if(a.popularity < b.popularity)
          {
            return 1;
          }
          else
          {
            return -1;
          }
        })
        let most_popular_credited = []
        if(sorted_cast_credits.length <= MAX_NUM_MOVIES_PER_ACTOR)
        {
          most_popular_credited = sorted_cast_credits
        }
        else
        {
          most_popular_credited = sorted_cast_credits.slice(0,MAX_NUM_MOVIES_PER_ACTOR)
        }
        //console.log(most_popular_credited)
        actor["credited"] = most_popular_credited
        for(let credit of actor["credited"])
        {
          delete credit.adult 
          delete credit.backdrop_path
          delete credit.character
          delete credit.credit_id
          delete credit.genre_ids
          delete credit.order
          delete credit.original_language
          delete credit.overview
          delete credit.poster_path
          delete credit.video
        }
        console.log(actor)
        let set_actor = {}
        set_actor[`${actor.name}`] = actor
        await chrome.storage.local.set(set_actor);
      }
    }
    let set_movie = {}
    set_movie[`${local_id}`] = first_result
    await chrome.storage.local.set(set_movie)
  }
  senderResponse({farewell: "goodbye"});
});