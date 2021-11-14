// function up look up existing emails 
const findUserByEmail = (email, users) => {
  for (key in users) {
    if (users[key].email === email) {
      return users[key];
      
    }
  }
  return undefined;
}


function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,8);
  // Google <3
}

// returns the URLs where the userID is equal to the id of the currently logged-in user.
const getUrlsForUserId = (user, urlDatabase) => {
  const userURL = {}
  if (!user) {
    return null;
  }
  for (shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === user) {
      userURL[shortUrl] = urlDatabase[shortUrl]
    }
  }
  return userURL;
};


module.exports = {getUrlsForUserId, generateRandomString, findUserByEmail};