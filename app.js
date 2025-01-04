const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // For generating unique note IDs

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection string (replace with your connection string from Azure Cosmos DB)
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
    // Check if the note already exists
    let note = await Note.findOne({ noteId });

    if (note) {
      // Update the note if it already exists
      note.content = content;
      await note.save();
    } else {
      // Create a new note if it doesn't exist
      note = new Note({ noteId: uuidv4(), content });
      await note.save();
    }

    res.status(200).json({ success: true, noteId: note.noteId });
  } catch (error) {
    console.log(error);
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
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
