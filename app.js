const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // For generating unique note IDs

const app = express();

// Enabling CORS with proper options to allow mobile and other device access
const corsOptions = {
  origin: '*',  // Allowing any origin, but you can limit it to your front-end domain (for security)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// MongoDB connection string (replace with your actual MongoDB connection string)
const mongoURI = 'mongodb://memonote:y3cWZyx3A7oNcycRLfQHAwo7czsi1twfvSYIrDi9l0KledCmXUWnHNMoQed3YpiuEcGHS8ikbOzWACDb6OQB9Q==@memonote.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@memonote@';

// Connect to MongoDB (Azure Cosmos DB)
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Define a schema for a note
const noteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  content: { type: String, required: true }
});

// Create a model for the note
const Note = mongoose.model('Note', noteSchema);

// Route to save a new note or update an existing one
app.post('/save-note', async (req, res) => {
  const { noteId, content } = req.body;

  try {
    // If noteId is not provided in the request, generate a new one using uuid
    const id = noteId || uuidv4(); // Generate unique noteId if not provided

    // Check if the note already exists
    let note = await Note.findOne({ noteId: id });

    if (note) {
      // Update the note if it already exists
      note.content = content;
      await note.save();
      console.log('Note updated:', note);
    } else {
      // Create a new note if it doesn't exist
      note = new Note({ noteId: id, content });
      await note.save();
      console.log('New note created:', note);
    }

    // Generate the URL for the note - Ensure that the path is correct
    const noteUrl = `${req.protocol}://${req.get('host')}/get-note/${note.noteId}`;

    // Return the full URL as the response
    res.status(200).json({ success: true, noteUrl: noteUrl });
  } catch (error) {
    console.log('Error saving note:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to get a note by its ID
app.get('/get-note/:noteId', async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ noteId });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({ success: true, content: note.content });
  } catch (error) {
    console.log('Error fetching note:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Server port (Azure sets the port automatically, use process.env.PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
