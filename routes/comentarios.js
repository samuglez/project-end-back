const express = require("express");
const router = express.Router();
const Comentario = require("../models/Comentario");
const Publicacion = require("../models/Publicacion");
const { isAuthenticated, isAdmin } = require("../middleware/jwt.middleware");

// Obtener todos los comentarios
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const comentarios = await Comentario.find()
      .populate("usuario", "name email")
      .sort({ fechaComentario: -1 });

    if (comentarios.length === 0) {
      return res.status(404).json({ message: "No hay comentarios disponibles." });
    }

    res.status(200).json(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los comentarios." });
  }
});

// Obtener comentarios de una publicación específica
router.get("/publicacion/:publicacionId", isAuthenticated, async (req, res, next) => {
  try {
    const { publicacionId } = req.params;
    
    // Verificar si la publicación existe
    const publicacion = await Publicacion.findById(publicacionId);
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    // Obtener los IDs de comentarios de la publicación
    const comentariosIds = publicacion.comentarios;
    
    if (!comentariosIds || comentariosIds.length === 0) {
      return res.status(404).json({ message: "Esta publicación no tiene comentarios." });
    }

    // Buscar los comentarios por sus IDs
    const comentarios = await Comentario.find({ _id: { $in: comentariosIds } })
      .populate("usuario", "name email")
      .sort({ fechaComentario: -1 });

    res.status(200).json(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los comentarios de la publicación." });
  }
});

// Crear un nuevo comentario en una publicación
router.post("/publicacion/:publicacionId", isAuthenticated, async (req, res, next) => {
  try {
    const { publicacionId } = req.params;
    const { content } = req.body;
    const userId = req.payload._id;

    // Verificar si la publicación existe
    const publicacion = await Publicacion.findById(publicacionId);
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    // Crear el nuevo comentario
    const nuevoComentario = new Comentario({
      content,
      usuario: userId,
      fechaComentario: new Date()
    });

    // Guardar el comentario
    const comentarioGuardado = await nuevoComentario.save();

    // Añadir el comentario a la publicación
    publicacion.comentarios.push(comentarioGuardado._id);
    await publicacion.save();

    // Poblar el usuario para la respuesta
    await comentarioGuardado.populate("usuario", "name email");

    res.status(201).json(comentarioGuardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el comentario." });
  }
});

// Eliminar un comentario
router.delete("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.payload._id;

    // Buscar el comentario
    const comentario = await Comentario.findById(id);
    
    if (!comentario) {
      return res.status(404).json({ message: "Comentario no encontrado." });
    }

    // Verificar si el usuario es el creador del comentario o es admin
    if (comentario.usuario.toString() !== userId && req.payload.rol !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para eliminar este comentario." });
    }

    // Eliminar la referencia del comentario en la publicación
    // Primero necesitamos encontrar la publicación que contiene este comentario
    const publicacion = await Publicacion.findOne({ comentarios: id });
    
    if (publicacion) {
      // Remover el comentario del array de comentarios de la publicación
      publicacion.comentarios = publicacion.comentarios.filter(
        comentarioId => comentarioId.toString() !== id
      );
      await publicacion.save();
    }

    // Eliminar el comentario
    await Comentario.findByIdAndDelete(id);

    res.status(200).json({ message: "Comentario eliminado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el comentario." });
  }
});

module.exports = router;