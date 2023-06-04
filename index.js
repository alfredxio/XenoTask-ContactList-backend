const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();
const port= process.env.PORT || 3000;
const { auth, requiredScopes } = require("express-oauth2-jwt-bearer");
const checkJwt = auth({
  aud: "https://dev-a88lagl5jzszgnna.us.auth0.com/api/v2/",
  audience: "https://dev-a88lagl5jzszgnna.us.auth0.com/api/v2/",
  issuerBaseURL: `https://dev-a88lagl5jzszgnna.us.auth0.com/`,
  algorithms: ["RS256"],
});

mongoose.set('strictQuery', false);
mongoose.connect(process.env.mongouri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('Error with mongoDB'));

const userSchema = new mongoose.Schema({
  emailx: { type: String, unique: true },
  contacts: [
    {
      image_url: String,
      name: String,
      email: String,
      phone: String,
      addedAt: { type: Date, default: Date.now } 
    },
  ],
});

const User = mongoose.model('User', userSchema);

//get all contacts
app.get("/contacts/:email", checkJwt, async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email);
    const user = await User.findOne({ emailx: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

//add contact
app.post("/contacts/:emailx", checkJwt, async (req, res) => {
  try {
    const { emailx } = req.params;

    let user = await User.findOne({ emailx });
    if (!user) {
      user = new User({ emailx });
    }

    const contact = req.body;
    contact.addedAt = Date.now();

    user.contacts.push(contact);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to add contact to user" });
  }
});

  // Edit contact for a specific user
  app.put("/contacts/:emailx/:contactId", checkJwt, async (req, res) => {
    try {
      const { emailx, contactId } = req.params;
  
      const user = await User.findOne({ emailx });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const { image_url, name, email, phone } = req.body;
  
      const contactIndex = user.contacts.findIndex(
        (contact) => contact._id.toString() === contactId
      );
      if (contactIndex === -1) {
        return res.status(404).json({ error: "Contact not found" });
      }
  
      user.contacts[contactIndex].image_url = image_url;
      user.contacts[contactIndex].name = name;
      user.contacts[contactIndex].phone = phone;
      user.contacts[contactIndex].email = email;
      user.contacts[contactIndex].addedAt = Date.now();
  
      await user.save();
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });
  
  // Delete contact for a specific user
  app.delete("/contacts/:emailx/:id", checkJwt, async (req, res) => {
    try {
      const { emailx, id } = req.params;
  
      const user = await User.findOne({ emailx });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const contactIndex = user.contacts.findIndex(
        (contact) => contact._id.toString() === id
      );
      if (contactIndex === -1) {
        return res.status(404).json({ error: "Contact not found" });
      }
  
      user.contacts.splice(contactIndex, 1);
  
      await user.save();
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });
  
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

app.get("/api/public", function (req, res) {
  res.json({
    message:
      "Hello from a public endpoint! You don't need to be authenticated to see this.",
  });
});

app.get("/api/private", checkJwt, function (req, res) {
  res.json({
    message:
      "Hello from a private endpoint! You need to be authenticated to see this.",
  });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});


















// const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
// const checkJwt = auth({
//   audience: 'unique',
//   issuerBaseURL: `https://dev-a88lagl5jzszgnna.us.auth0.com/`,
// });

// // This route doesn't need authentication
// app.get('/api/public', function(req, res) {
//   res.json({
//     message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
//   });
// });

// // // This route needs authentication
// app.get('/api/private', checkJwt, function(req, res) {
//   res.json({
//     message: 'Hello from a private endpoint! You need to be authenticated to see this.'
//   });
// });

