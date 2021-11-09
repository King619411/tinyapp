const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,5);
  // Google <3
}

////////////////////////////////////////////////////
/////////////GET///////////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
    longURL:urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

////////////////////////////////////////////
////////////////POST///////////////////////

app.post("/urls", (req, res) => {
  console.log(req.body);  
  // Log the POST request body to the console
  const shortURL = generateRandomString(); 
  const longURL = req.body.longURL
  const newDataBaseObjects = {...urlDatabase, [shortURL]: longURL};
  //console.log(newDataBaseObjects);
  const templateVars = {urls: newDataBaseObjects};
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