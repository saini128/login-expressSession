var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt');

router.get('/', function (req, res, next) {
	if (req.session.userId) {
		return res.redirect('/profile');
	  } else {
		return res.render('index.ejs');
	  }
});


router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;
  
	if (!personInfo.email || !personInfo.firstName || !personInfo.lastName || !personInfo.password || !personInfo.passwordConf) {
	  res.send();
	} else {
	  if (personInfo.password === personInfo.passwordConf) {
		User.findOne({ email: personInfo.email }, function (err, data) {
		  if (!data) {
			var c;
			User.findOne({}, function (err, data) {
			  if (data) {
				console.log("if");
				c = data.unique_id + 1;
			  } else {
				c = 1;
			  }
  
			  bcrypt.hash(personInfo.password, 10, function (err, hashedPassword) {
				if (err) {
				  console.log(err);
				  res.send({"Success": "An error occurred while creating the user."});
				} else {
				  var newPerson = new User({
					unique_id: c,
					email: personInfo.email,
					firstName: personInfo.firstName,
					lastName: personInfo.lastName,
					password: hashedPassword,
				  });
  
				  newPerson.save(function (err, Person) {
					if (err) {
					  console.log(err);
					  res.send({"Success": "An error occurred while creating the user."});
					} else {
					  console.log('Success');
					  res.send({"Success": "You are registered, you can login now."});
					}
				  });
				}
			  });
			}).sort({_id: -1}).limit(1);
		  } else {
			res.send({"Success": "Email is already used."});
		  }
		});
	  } else {
		res.send({"Success": "Password is not matched."});
	  }
	}
  });
  
  router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
  });
  
  router.post('/login', function (req, res, next) {
	User.findOne({ email: req.body.email }, function (err, data) {
	  if (data) {
		bcrypt.compare(req.body.password, data.password, function (err, result) {
		  if (result === true) {
			req.session.userId = data.unique_id;
			res.send({"Success": "Success!"});
		  } else {
			res.send({"Success": "Wrong password!"});
		  }
		});
	  } else {
		res.send({"Success": "This Email Is not registered!"});
	  }
	});
  });
  
router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			
			return res.render('data.ejs', {"name":data.firstName+" "+data.lastName,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	User.findOne({ email: req.body.email }, function (err, data) {
	  if (!data) {
		res.send({ "Success": "This Email Is not registered!" });
	  } else {
		if (req.body.password === req.body.passwordConf) {
		  bcrypt.hash(req.body.password, 10, function (err, hashedPassword) {
			if (err) {
			  console.log(err);
			  res.send({ "Success": "An error occurred while changing the password." });
			} else {
			  data.password = hashedPassword;
			  data.save(function (err, Person) {
				if (err) {
				  console.log(err);
				  res.send({ "Success": "An error occurred while changing the password." });
				} else {
				  console.log('Success');
				  res.send({ "Success": "Password changed!" });
				}
			  });
			}
		  });
		} else {
		  res.send({ "Success": "Password does not match! Both passwords should be the same." });
		}
	  }
	});
  });

module.exports = router;