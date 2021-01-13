//Basic NPM packages
const express     = require("express");
const bodyParser  = require("body-parser");
const ejs         = require("ejs");
const _           = require("lodash");


//NPM packages for authentication
require('dotenv').config();
const bcrypt         = require('bcrypt')
const passport       = require('passport')
const flash          = require('express-flash')
const session        = require('express-session')
const methodOverride = require('method-override')

//NPM packages for Newsletter
const request = require("request");
const https   = require("https");
const app     = express();



//authentication
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = [];
const Posts = [];


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use('/login', express.static('public'));
app.use('/register', express.static('public'));
app.use('/LoggedIN', express.static('public'));
app.use('/LoggedIN/admin', express.static('public'));
app.use('/admin/links/', express.static('public'));
app.use('/freelink', express.static('public'));


app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))





app.get("/", function(req, res){
  res.render('preview',);
})




app.get('/LoggedIN', checkAuthenticated, (req, res) => {
  res.render('LoggedINFreeLink', { username: req.user.username})
})

app.get('/LoggedIN/admin/:name', checkAuthenticated, (req, res)=>{
  const name = _.lowerCase(req.params.name);
  console.log(name);
  users.forEach(function(user){
    var StoredUsername = _.lowerCase(user.username);
    console.log(StoredUsername);

    if (name === StoredUsername ){
      console.log("User Found! Now finding his links..");

      var length = Posts.length;
      if(length == 0){
        res.render("admin",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: [] });
      } else {

        var flag = 0;
        Posts.forEach(function(post){

          var Username = post.username;
          console.log(Username);
          if (StoredUsername==Username){
            flag = 1;
            var hisblogs = post.Blogs;
            if (hisblogs != null){
              console.log("your posts found! redirecting...")
              return(res.render("admin",{username: user.username , bio: user.bio, Posts: hisblogs }));
  
            } else{
              res.render("admin",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: [] });
            }
  
          } else {
            console.log("checking next.");
          }
        })

        if(flag == 0){
          res.render("admin",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: [] });
        }
      }

      
      

    }else{
      console.log("User Not Found.");
    }
        
  }) 

});


app.post("/LoggedIN/admin/:name", function(req, res){
  const redirectname = (req.params.name);
  const name = _.lowerCase(req.params.name);

  var flag = 0;

  Posts.forEach(function(post){
    const StoredUsername = post.username;

    if (name == StoredUsername){

        newBlogs = post.Blogs;
        var blog = {
          linkgiven     : req.body.linkgiven,
          selection     : req.body.selection,
          title         : req.body.title,
          description   : req.body.description,
          linkurl       : req.body.linkurl
        } 
        newBlogs.push(blog);
        flag = 1;
        
    }
  })
  
  if (flag == 0){
    var post = {
      username : name,
      Blogs: []
    }
    var blog = {
      linkgiven     : req.body.linkgiven,
      selection     : req.body.selection,
      title         : req.body.title,
      description   : req.body.description,
      linkurl       : req.body.linkurl
    } 
    var newBlogs = post.Blogs;
    newBlogs.push(blog);
    
    

    Posts.push(post);
  }
  
  console.log(Posts);
  res.redirect("/LoggedIN/social/links/"+redirectname)
})


app.get("/LoggedIN/social/links/:name", (req, res)=>{
const name = req.params.name;
  res.redirect("/LoggedIN/admin/"+name);

});

app.get('/freelink/:name', checkAuthenticated, (req, res)=>{
  const name = _.lowerCase(req.params.name);
  console.log(name);
  users.forEach(function(user){
    var StoredUsername = _.lowerCase(user.username);
    console.log(StoredUsername);

    if (name === StoredUsername ){
      console.log("User Found! Now finding his links..");

      var length = Posts.length;
      if(length == 0){
        res.render("admin",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: [] });
      } else {

        var flag = 0;
        Posts.forEach(function(post){

          var Username = post.username;
          console.log(Username);
          if (StoredUsername==Username){
            flag = 1;
            var hisblogs = post.Blogs;
            if (hisblogs != null){
              console.log("your posts found! redirecting...")
              return(res.render("preview",{username: user.username , bio: user.bio, Posts: hisblogs }));
  
            } else{
              res.render("preview",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: [] });
            }
  
          } else {
            console.log("checking next.");
          }
        })

        if(flag == 0){
          res.render("admin",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: [] });
        }
      }

      
      

    }else{
      console.log("User Not Found.");
    }
        
  }) 

});

// app.get("/LoggedIN/:name", (req, res)=>{
//   const name = _.lowerCase(req.params.name);

//   users.forEach(function(user){
//     var StoredUsername = _.lowerCase(user.username);
//     console.log(StoredUsername);

//     if (name === StoredUsername ){
//       console.log("User Found! Now finding his links..");

//       Posts.forEach(function(post){

//         var Username = post.username;
//         if (StoredUsername=Username){
//           var hisblogs = post.Blogs;
//           if (hisblogs != null){
//             console.log("your posts found! redirecting...")
//             return (res.render("preview",{username: user.username , bio: user.bio, Posts: hisblogs }));
//           }
//           else{
           
//             res.render("preview",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: [] });

//           }
//         }
//       })
      

//     }else{
//       console.log("User Not Found.");
//     }
//   })

// })
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('Login.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/LoggedIN',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('SignUp.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      username: req.body.username,
      bio: req.body.bio,
      email: req.body.email,
      password: hashedPassword
    });
    console.log(users);
    res.redirect('/login')
  } catch(err) {
    console.log(err);
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})





function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}



app.listen(3000, function(){
  console.log("Server stared on 3000");
});
