const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoUri = process.env.MONGODB_URI;
const dbName = "projectdb";

async function obtenerInfoRelevante() {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const db = client.db(dbName);

        console.log("Obteniendo información de la base de datos...");

        // Obtener todas las colecciones disponibles
        const collections = await db.listCollections().toArray();
        let info = "";

        for (const collection of collections) {
            const collectionName = collection.name;
            const collectionData = db.collection(collectionName);
            const documents = await collectionData.find({}).toArray();

            if (documents.length > 0) {
                info += `\nColección: ${collectionName}\n`;
                info += documents
                    .map((doc) => JSON.stringify(doc, null, 2))
                    .join("\n");
            }
        }

        return info || "No hay información disponible en la base de datos.";
    } catch (error) {
        console.error("Error al obtener información de MongoDB:", error);
        return "Hubo un error al obtener la información de la base de datos.";
    } finally {
        await client.close();
    }
}

async function chatBot(prompt) {
    try {
        // Obtener toda la información de la base de datos
        const informacionExtra = await obtenerInfoRelevante();

        if (!informacionExtra) {
            return "Lo siento, no encontré información disponible en la base de datos.";
        }

        // Construir el prompt mejorado
        const enhancedPrompt = `
            El usuario pregunta: "${prompt}"
            Aquí está la información relevante de nuestra base de datos:
            ${informacionExtra}
            Usa esta información para responder con precisión.
        `;

        // Llamar a la API de Gemini
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log("Enviando prompt a Gemini...");
        const result = await model.generateContent(enhancedPrompt);

        // Validación de respuesta
        const response = result.response?.text();
        if (!response) {
            throw new Error("La API de Gemini no devolvió una respuesta válida.");
        }

        return response;
    } catch (error) {
        console.error("Error en el servicio de chatbot:", error);
        return "Hubo un error al procesar tu solicitud.";
    }
}

module.exports = {
    chatBot
};
