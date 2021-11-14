const express = require("express");
const app = express();
const PORT = 8080 // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

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
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,8);
  // Google <3
}

// function up look up existing emails 
const findUserByEmail = (email) => {
  for (key in users) {
      if (users[key].email === email) {
          return users[key];
          

      }
  }
  return null;
}

// returns the URLs where the userID is equal to the id of the currently logged-in user.

// {shortURL:{longURL: wwww.Google.com}}
const getUrlsForUserId = (user) => {
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

//create helper function to check for cookies!!!!!!!!!!!!!


////////////////////////////////////////////////////
/////////////GET///////////////////////////////////

app.get("/", (req, res) => {
  //return res.send("Hello!");
  return res.redirect('/urls/new')
});


app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   return res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const usersURLs = getUrlsForUserId(req.cookies["user_id"]);
  
  const templateVars = { 
    urls: usersURLs, 
    user: users[req.cookies["user_id"]]
  };
  
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"]; 
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
      longURL:urlDatabase[shortURL],
      user: users[req.cookies["user_id"]]
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
    password: req.body.password,
    user: false
    };
  return res.render("register", templateVars);
});

  // A New Login Page 
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  return res.render("login", templateVars);
});
  
///POST/////////POST////Below///////POST/////
///POST/////////POST////Below///////POST/////
  
app.post("/urls", (req, res) => {
 
  const userID = req.cookies["user_id"]
  const user = users[userID]  
  // Log the POST request body to the console
  const shortURL = generateRandomString(); 
  const longURL = req.body.longURL
  const newURLObject = {
    shortURL,
    longURL,
    userID
  }

  urlDatabase[shortURL] = newURLObject 
  const userURLs = getUrlsForUserId(userID);
  
  const templateVars = {
    urls: userURLs,
    user
  };
  return res.render("urls_index", templateVars);
});

// Post to delete short url
app.post("/urls/:shortURL/delete", (req, res) => {
  const {shortURL} = req.params
  
  
  if (urlDatabase[shortURL] !== userID) {
    res.redirect("/urls")
  } 
  delete urlDatabase[shortURL];

  // if (!shortURL) {
  //   res.status(400).send("The shortURL you wish to delete is not available")
  // // }
  // delete urlDatabase[shortURL];
  // return res.redirect("/urls") 
})


// Post edited URL
app.post("/urls/:shortURL", (req, res) => {
  const {shortURL} = req.params;
  const {longURL} = req.body;
 
  urlDatabase[shortURL].longURL = longURL;
  return res.redirect("/urls") 
}); 
  
//cookie /login page
app.post("/login", (req, res) => {
  const {email, password} = req.body
  const user = findUserByEmail(email)
  //const id = generateRandomString();
  // console.log(user)
  const afterRegistration = (userId) => {
    //console.log("hello:", user);
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } 
  if (!findUserByEmail(email)) {
    res.status(403).send('Email cannot be found');
  }
  if (!email || user.password !== password) {
    res.status(403).send("Invalid email or password");
  }

  return afterRegistration();
  
});

//res.render("partials/_header.ejs", {user:users.userRandomID})

// logout & clears cookies [Cookies in Express]
app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
});

// Register code [User Registration Form]
app.post("/register", (req, res) => {
  const afterRegistration = (userId) => {
      res.cookie("user_id", userId);
      res.redirect("/urls");
  } 
  const {email, password} = req.body
  //const foundUser = findUserByEmail(req.body.email);
  
  //Handle Registration Errors conditions
  if (email === "" || password === "") {
    res.status(400).send('Invalid email or password')
  } else if (findUserByEmail(req.body.email)) {
    res.status(400).send('Email has already been registered')
  } else {
    const id = generateRandomString();
    // creating a new profile for the user - temp
      users[id] = {
        id: id,
        email: req.body.email,
        password: req.body.password
      }
      afterRegistration(id);
  }
  //re.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


  