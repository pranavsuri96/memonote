const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');

// Replace this with your Cosmos DB connection string
const COSMOS_DB_CONNECTION_STRING = '<YOUR_COSMOS_DB_CONNECTION_STRING>';
const DATABASE_NAME = 'NotesDb';
const CONTAINER_NAME = 'Notes';

const client = new CosmosClient(COSMOS_DB_CONNECTION_STRING);

app.http('CreateNote', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const { content } = await request.json();

        if (!content || !content.trim()) {
            return { status: 400, body: 'Note content is required.' };
        }

        const noteId = uuidv4();
        const note = { id: noteId, content };

        try {
            const { database } = await client.databases.createIfNotExists({ id: DATABASE_NAME });
            const { container } = await database.containers.createIfNotExists({ id: CONTAINER_NAME });

            await container.items.create(note);

            const shareLink = `${request.url.replace(/\/api\/.*/, '')}/api/GetNote/${noteId}`;
            return {
                status: 201,
                body: {
                    id: noteId,
                    shareLink,
                },
            };
        } catch (error) {
            context.log.error('Error saving note:', error.message);
            return { status: 500, body: 'An error occurred while saving the note.' };
        }
    },
});
