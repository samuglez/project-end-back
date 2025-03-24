const express = require("express");
const { chatBot } = require("../services/chatService");

const router = express.Router();

router.post("/chat", async (req, res) => {
    try {
        const { prompt } = req.body;

        // Validación del prompt
        if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
            return res.status(400).json({ error: "El prompt es inválido o está vacío." });
        }

        // Llama al servicio del chatbot
        const response = await chatBot(prompt);

        res.status(200).json({ response });
    } catch (error) {
        console.error("Error en el endpoint de chatbot:", error);
        res.status(500).json({ error: "Error al procesar la solicitud del chatbot." });
    }
});

module.exports = router;