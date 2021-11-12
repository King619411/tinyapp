const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,5);
  // Google <3
}

// function up look up existing emails 
const findUserByEmail = (email) => {
  for (key in users) {
      if (users[key].email === email) {
          return users[key];
          //return users[key]; return a boolean value?
      }
  }
  return null;
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "Walid_douri@hotmail.com", 
    password: "911"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

////////////////////////////////////////////////////
/////////////GET///////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
  user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const shortUrl = req.params.shortURL;
  // const longUrl = req.query.longurl;
  // const templateVars = {
    //   shortURL: shortUrl,
    //   longURL: urlDatabase[req.params.shortURL] || longUrl
    // };
    const templateVars = {
      shortURL: shortURL, 
      longURL:urlDatabase[shortURL],
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
  });

  app.get("/register", (req, res) => {
    const templateVars = { 
      id: req.params.id,
      email: req.body.email,
      password: req.body.password
      };
    res.render("register", templateVars);
  });

  // A New Login Page [W03D3 4/7]
  app.get("/login", (req, res) => {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    }
    res.render("login", templateVars);
  });
  
  ///POST/////////POST//////////////POST//////
  ///POST/////////POST//////////////POST/////
  
  app.post("/urls", (req, res) => {
    console.log(req.body);  
    // Log the POST request body to the console
    const shortURL = generateRandomString(); 
    const longURL = req.body.longURL
    const newDataBaseObjects = {...urlDatabase, [shortURL]: longURL};
    //console.log(newDataBaseObjects);
    const templateVars = {
      urls: newDataBaseObjects,
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
    
  });
  
  //Delete a urlDatabase
  app.post("/urls/:shortURL/delete", (req, res) => {
    // or create a var 
    // let newShortURL = req.param.shortURL;
    delete urlDatabase[req.params.shortURL];
    //console.log(urlDatabase)
    res.redirect("/urls") 
  });
  
  // Post edited URL
  app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    //console.log(shortURL)
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect("/urls") 
  }); 
  
  //cookie /login page
  app.post("/login", (req, res) => {
    const {email, password} = req.body
    const user = findUserByEmail(email)
    const id = generateRandomString();
   // console.log(user)
    const afterRegistration = (userId) => {
      res.cookie("user_id", userId);
      res.redirect("/urls");
    } 
    if (!findUserByEmail(email)) {
      res.status(403).send('Email cannot be found');
    }
    if (!email || user.password !== password) {
      res.status(403).send("Invalid email or password");
    }
    users[id] = {
      id: id,
      email: req.body.email,
      password: req.body.password
    }
    afterRegistration(id)
    
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


  