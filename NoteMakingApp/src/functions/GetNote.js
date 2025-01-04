const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Replace this with your Cosmos DB connection string
const COSMOS_DB_CONNECTION_STRING = '<YOUR_COSMOS_DB_CONNECTION_STRING>';
const DATABASE_NAME = 'NotesDb';
const CONTAINER_NAME = 'Notes';

const client = new CosmosClient(COSMOS_DB_CONNECTION_STRING);

app.http('GetNote', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const noteId = context.bindingData.id;

        if (!noteId) {
            return { status: 400, body: 'Note ID is required.' };
        }

        try {
            const { database } = await client.databases.createIfNotExists({ id: DATABASE_NAME });
            const { container } = await database.containers.createIfNotExists({ id: CONTAINER_NAME });

            const { resource: note } = await container.item(noteId, noteId).read();

            if (!note) {
                return { status: 404, body: 'Note not found.' };
            }

            return {
                status: 200,
                body: note,
            };
        } catch (error) {
            context.log.error('Error fetching note:', error.message);
            return { status: 500, body: 'An error occurred while fetching the note.' };
        }
    },
});
