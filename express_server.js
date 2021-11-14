const express = require("express");
const app = express();
const PORT = 8080 // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
const {getUrlsForUserId, generateRandomString, findUserByEmail} = require('./helpers')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["Hello world?"],
}))


const urlDatabase = {
  f3es45: {
      longURL: 'https://www.google.ca', 
      userID: 'userRandomID' },
  b6UTxQ: { 
      longURL: 'https://www.tsn.ca', 
      userID: 'aJ48lW' },
  i3BoGr: { 
    longURL: 'https://www.google.ca', 
    userID: 'aJ48lW' },
};
 

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '911',
  },
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
}

////////////////////////////////////////////////////
/////////////GET///////////////////////////////////

app.get("/", (req, res) => {
  return res.redirect('/urls/new')
});


app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const usersURLs = getUrlsForUserId(req.session.user_id, urlDatabase);
  //getUrlsForUserId(req.cookies["user_id"]);
  const templateVars = { 
    urls: usersURLs, 
    user: users[req.session.user_id],
  };
  return res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const id = req.session.user_id; 
  const user = users[id];
  
  if (!user) {
    return res.redirect("/login");
  } 
  return res.render("urls_new", {user});
});


// Referanced as /u/:id via compass
app.get("/u/:id", (req, res) => {
  const logUrlOject = urlDatabase[req.params.id];
  //console.log(req.params);
  if (!logUrlOject) {
    return res.status(404).send("The Id/shortURL doesnt exist")
  }
  return res.redirect(logUrlOject.longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
      shortURL: shortURL,
      longURL:urlDatabase[shortURL].longURL,
      user: users[req.session.user_id]
    };
    if (!users) {
    return res.redirect("/login")
    }
  return res.render("urls_show", templateVars);
});


app.get("/register", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    email: req.body.email,
    user: false
    };
  return res.render("register", templateVars);
});


// A New Login Page 
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user_id
  }
  return res.render("login", templateVars);
});
  

///POST/////////POST////Below///////POST/////
///POST/////////POST////Below///////POST/////
  
app.post("/urls", (req, res) => {
  const userID = req.session.user_id
  const user = users[userID]
  const shortURL = generateRandomString(); 
  const longURL = req.body.longURL
  const newURLObject = {
    shortURL,
    longURL,
    userID
  }
  urlDatabase[shortURL] = newURLObject 
  const userURLs = getUrlsForUserId(userID, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user
  };
  return res.render("urls_index", templateVars);
});


// Post to delete short url
app.post("/urls/:shortURL/delete", (req, res) => {
  const {shortURL} = req.params
  const userID = req.session.user_id
  if (urlDatabase[shortURL].userID !== userID) {
    res.redirect("/urls")
  } 
  delete urlDatabase[shortURL];
  return res.redirect("/urls")  
})


// Post edited URL
app.post("/urls/:shortURL", (req, res) => {
  const {shortURL} = req.params;
  const {longURL} = req.body;
  urlDatabase[shortURL].longURL = longURL;
  //console.log(longURL);
  return res.redirect("/urls") 
}); 
  

//cookie /login page
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = findUserByEmail(email, users);
  const loggedInSucessfully = () => {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } 
  if (!findUserByEmail(email, users)) {
    res.status(403).send('Email cannot be found');
  } else if (user.password !== password) {
    res.status(403).send("Invalid email or password");
  } else {
    return loggedInSucessfully(); 
  }
});


// logout & clears cookies [Cookies in Express]
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});


// Register code [User Registration Form]
app.post("/register", (req, res) => {
  const afterRegistration = (userId) => {
      req.session.user_id = userId
      res.redirect("/urls");
  } 
  const {email, password} = req.body
   
  //Handle Registration Errors conditions
  if (email === "" || password === "") {
    res.status(400).send('Invalid email or password')
  } else if (findUserByEmail(req.body.email, users)) {
    res.status(400).send('Email has already been registered')
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    // creating a new profile for the user 
      users[id] = {
        id: id,
        email: req.body.email,
        password: hashedPassword
      }
      afterRegistration(id);
  }
 });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
