var db = require("../dbcon.js");
var bcrypt = require('bcryptjs');

exports.login = function(req, res){
  const { email, password } = req.body;

  db.query(`SELECT password FROM users WHERE email='${email}'`, (result) => {
    if(result.success){
      if(result.data.length === 0){
        res.status(401);
        res.send(JSON.stringify({ success: false, message: "Invalid E-Mail" }));
      }
      else{
        if(bcrypt.compareSync(password, result.data[0]["password"])){
          db.query(`SELECT sessionId FROM users WHERE email='${email}'`, (result) => {
            res.status(200);
            result.data = genAuthKey(email, result.data[0]);
            // result["data"] = result["data"][0];
            res.send(JSON.stringify(result));
          });
        }
        else{
          res.status(401);
          res.send(JSON.stringify({ success: false, message: "Invalid password"}));
        }        
      }
    }
    else{
      res.status(500);    
      res.send(JSON.stringify())
    }
  });
}

exports.register = function(req, res){
  const { firstname, lastname, email, password } = req.body;

  let sessionId = bcrypt.hashSync(firstname + email, 12).split("/").join("");

  db.query(`INSERT INTO users VALUES (0, '${firstname}', '${lastname}', '${email}', '${bcrypt.hashSync(password, 14)}', '${sessionId}')`, (result) => {
    if(result.success) {
      res.status(200);
      result.data = genAuthKey(email, sessionId);
    }
    else{
      res.status(409);
      result.message = "User already registered";
    }
    res.send(JSON.stringify(result));
  });
}

genAuthKey = function(email, sessionId){
  return bcrypt.hashSync(`${email}:${sessionId}`, 12);
}
